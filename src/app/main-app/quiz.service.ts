import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { Quiz, QuizStatus, Question, Option } from './quiz.model';
import { ConnectionService } from '../layout/connections/connection.service';
import { AuthService } from '../auth.service';

@Injectable({
  providedIn: 'root',
})
export class QuizDataService {
  private quizzesSubject = new BehaviorSubject<Quiz[]>([]);
  quizzes$ = this.quizzesSubject.asObservable();
  private gradingState: {
    [quizId: string]: {
      questionScores: { [questionId: string]: number };
      manualScores: { [questionId: string]: number };
    };
  } = {};
  private currentQuiz: Quiz | null = null;

  constructor(
    private connectionService: ConnectionService,
    private authService: AuthService
  ) {
    const savedQuizzes = localStorage.getItem('quizzes');
    if (savedQuizzes) {
      const parsed: Quiz[] = JSON.parse(savedQuizzes).map((q: any) => ({
        ...q,
        startTime: new Date(q.startTime),
        timeSpent: q.timeSpent ?? 0,
        teacherId: q.teacherId ?? 0, // Default to 0 if no teacherId (will be filtered out)
      }));
      this.quizzesSubject.next(parsed.map(this.evaluateQuizStatus));
    }

    const savedCurrentQuiz = localStorage.getItem('currentQuiz');
    if (savedCurrentQuiz) {
      const parsed = JSON.parse(savedCurrentQuiz);
      this.currentQuiz = {
        ...parsed,
        startTime: new Date(parsed.startTime),
        timeSpent: parsed.timeSpent ?? 0,
        teacherId: parsed.teacherId ?? 0, // Default to 0 if no teacherId
      };
      if (this.currentQuiz) {
        this.currentQuiz = this.evaluateQuizStatus(this.currentQuiz);
      }
    }
  }

  // ---------------- Teacher Methods ----------------
  addQuiz(quiz: Quiz) {
    quiz.status = 'unpublished';
    const updatedQuizzes = [...this.quizzesSubject.value, quiz];
    this.quizzesSubject.next(updatedQuizzes);
    this.saveQuizzes(updatedQuizzes);
  }

  publishQuiz(quizId: string) {
    this.updateQuiz(quizId, { status: 'published' });
  }

  gradeQuiz(quiz: Quiz, grade: number) {
    this.updateQuiz(quiz.id, {
      status: 'finished',
      grade,
      teacherGraded: true,
    });
  }

  // ---------------- Student Methods ----------------
  submitQuiz(quiz: Quiz, answers: { [questionId: string]: string }) {
    this.updateQuiz(quiz.id, {
      studentAnswers: answers,
    });
    this.setGrading(quiz);
  }

  setGrading(quiz: Quiz) {
    this.updateQuiz(quiz.id, {
      status: 'grading',
      studentAnswers: quiz.studentAnswers,
      startedAt: quiz.startedAt ?? new Date(),
    });
  }
  // ---------------- Shared Methods ----------------
  getQuizzes(role: 'teacher' | 'student'): Quiz[] {
    const updated = this.quizzesSubject.value.map(this.evaluateQuizStatus);
    this.quizzesSubject.next(updated);

    if (role === 'student') {
      const studentId = this.authService.getUserId();
      if (!studentId) return [];

      // Get connected teacher IDs for this student
      const connections = this.connectionService.getConnectionsByStudent(studentId);
      const connectedTeacherIds = connections.map(c => c.teacherId);

      return updated
        .filter((q) => q.status !== 'unpublished')
        .filter((q) => connectedTeacherIds.includes(q.teacherId)) // Only show quizzes from connected teachers
        .map((q) => {
          const quizClone = { ...q };
          if (quizClone.status === 'published') {
            const now = Date.now();
            const start = quizClone.startTime.getTime();
            const end = start + quizClone.duration * 60000;
            if (now < start) quizClone.status = 'scheduled';
            else if (now >= start && now <= end) quizClone.status = 'active';
            else if (now > end) quizClone.status = 'expired';
          }
          return quizClone;
        });
    }

    if (role === 'teacher') {
      const teacherId = this.authService.getUserId();
      if (!teacherId) return [];

      // Only show quizzes created by this teacher
      return updated.filter((q) => q.teacherId === teacherId);
    }

    return updated;
  }
  getQuizById(id: string): Quiz | undefined {
    return this.quizzesSubject.value.find((q) => q.id === id);
  }

  setCurrentQuiz(quiz: Quiz) {
    this.currentQuiz = this.evaluateQuizStatus(quiz);
    this.updateQuiz(quiz.id, { started: true });
    localStorage.setItem(
      'currentQuiz',
      JSON.stringify({
        ...quiz,
        startTime: quiz.startTime.toISOString(),
        started: true,
      })
    );
  }

  getCurrentQuiz(): Quiz | null {
    if (!this.currentQuiz) return null;
    this.currentQuiz = this.evaluateQuizStatus(this.currentQuiz);
    return this.currentQuiz;
  }

  clearCurrentQuiz() {
    this.currentQuiz = null;
    localStorage.removeItem('currentQuiz');
  }

  // ---------------- Status Evaluation ----------------
  private evaluateQuizStatus = (quiz: Quiz): Quiz => {
    const now = Date.now();
    const start = quiz.startTime.getTime();
    const end = start + quiz.duration * 60000;

    let status: QuizStatus = quiz.status;

    if (['unpublished', 'published'].includes(status)) {
      return { ...quiz, status };
    }

    if (quiz.grade !== undefined) status = 'finished';
    else if (quiz.studentAnswers) status = 'grading';
    else if (now < start) status = 'scheduled';
    else if (now >= start && now <= end) status = 'active';
    else if (now > end) status = 'expired';

    return { ...quiz, status, startTime: new Date(quiz.startTime) };
  };

  // ---------------- Persistence Helpers ----------------
  updateQuiz(quizId: string, updatedQuiz: Partial<Quiz>) {
    const updated = this.quizzesSubject.value.map((q) =>
      q.id === quizId ? { ...q, ...updatedQuiz } : q
    );
    this.quizzesSubject.next(updated);
    this.saveQuizzes(updated);

    if (this.currentQuiz && this.currentQuiz.id === quizId) {
      this.currentQuiz = { ...this.currentQuiz, ...updatedQuiz };
      localStorage.setItem(
        'currentQuiz',
        JSON.stringify({
          ...this.currentQuiz,
          startTime: this.currentQuiz.startTime.toISOString(),
        })
      );
    }
  }
  updateStudentAnswer(quizId: string, questionId: string, answer: string) {
    this.updateQuiz(quizId, {
      studentAnswers: {
        ...(this.getQuizById(quizId)?.studentAnswers || {}),
        [questionId]: answer,
      },
    });
  }
  deleteQuiz(quizId: string) {
    const updated = this.quizzesSubject.value.filter((q) => q.id !== quizId);
    this.quizzesSubject.next(updated);
    this.saveQuizzes(updated);

    if (this.currentQuiz && this.currentQuiz.id === quizId) {
      this.clearCurrentQuiz();
    }
  }
  private saveQuizzes(quizzes: Quiz[]) {
    const saveable = quizzes.map((q) => ({
      ...q,
      startTime: q.startTime.toISOString(),
    }));
    localStorage.setItem('quizzes', JSON.stringify(saveable));
  }
  private explanations: { [quizId: string]: { [questionId: string]: string } } =
    {};

  saveExplanations(quizId: string, data: { [questionId: string]: string }) {
    this.explanations[quizId] = { ...data }; // clone to avoid reference issues
  }
  getExplanations(quizId: string) {
    return this.explanations[quizId] ? { ...this.explanations[quizId] } : {};
  }

  saveGradingState(
    quizId: string,
    questionScores: { [questionId: string]: number },
    manualScores: { [questionId: string]: number }
  ) {
    this.gradingState[quizId] = {
      questionScores: { ...questionScores },
      manualScores: { ...manualScores },
    };
  }
  // Get grading state
  getGradingState(quizId: string) {
    if (!this.gradingState[quizId]) {
      return { questionScores: {}, manualScores: {} };
    }
    return {
      questionScores: { ...this.gradingState[quizId].questionScores },
      manualScores: { ...this.gradingState[quizId].manualScores },
    };
  }
}

export type { Quiz, QuizStatus, Question, Option };
