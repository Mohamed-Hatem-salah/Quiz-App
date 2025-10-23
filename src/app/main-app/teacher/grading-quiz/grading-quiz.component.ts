import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { QuizDataService, Quiz, Question } from '../../quiz.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HlmButton } from '@spartan-ng/helm/button';
import { HlmInput } from '@spartan-ng/helm/input';
import {
  HlmDialog,
  HlmDialogContent,
  HlmDialogFooter,
  HlmDialogHeader,
} from '@spartan-ng/helm/dialog';
import { Location } from '@angular/common';
import { BrnDialogContent, BrnDialogTrigger } from '@spartan-ng/brain/dialog';
@Component({
  selector: 'app-grading-quiz',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    HlmInput,
    HlmButton,
    HlmDialog,
    HlmDialogContent,
    HlmDialogFooter,
    HlmDialogHeader,
    BrnDialogContent,
    BrnDialogTrigger,
  ],
  templateUrl: './grading-quiz.component.html',
  styleUrls: ['./grading-quiz.component.css'],
})
export class GradingQuizComponent implements OnInit {
  quiz!: Quiz;
  studentName = '';
  questionScores: { [questionId: string]: number } = {};
  questionExplanations: { [questionId: string]: string } = {};
  manualScores: { [questionId: string]: number } = {};
  showGradeInput: { [questionId: string]: boolean } = {};

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private quizService: QuizDataService,
    private location: Location
  ) {}

  ngOnInit(): void {
    const quizId = this.route.snapshot.paramMap.get('id');
    if (!quizId) {
      alert('No quiz ID provided');
      this.router.navigate(['/teacher-dashboard']);
      return;
    }

    const foundQuiz = this.quizService.getQuizById(quizId);
    if (!foundQuiz) {
      alert('Quiz not found');
      this.router.navigate(['/teacher-dashboard']);
      return;
    }

    this.quiz = foundQuiz;

    this.quiz.questions.forEach((q) => {
      this.questionScores[q.id] = this.quiz.questionScores?.[q.id] ?? 0;
      this.manualScores[q.id] = this.quiz.manualScores?.[q.id] ?? NaN; // <-- use manualScores
      this.questionExplanations[q.id] =
        this.quiz.questionExplanations?.[q.id] ?? '';
      this.showGradeInput[q.id] = false;
    });
  }

  toggleManualInput(qId: string) {
    this.showGradeInput[qId] = !this.showGradeInput[qId];
  }

  submitGrades() {
    let totalGrade = 0;

    this.quiz.questions.forEach((q) => {
      let score = 0;

      // Manual grading (teacher input) takes precedence
      if (!isNaN(this.manualScores[q.id])) {
        score = this.manualScores[q.id];
      }
      // Auto-grade MCQs if no manual score
      else if (q.type === 'mcq') {
        score = this.studentAnswer(q) === this.correctAnswer(q) ? q.points : 0;
      }
      // Written question without manual score
      else if (q.type === 'written') {
        score = !isNaN(this.questionScores[q.id])
          ? this.questionScores[q.id]
          : 0;
      }

      this.questionScores[q.id] = score;
      totalGrade += score;
    });

    // Save total grade in quiz
    this.quizService.gradeQuiz(this.quiz, totalGrade);

    // Save explanations
    this.quizService.saveExplanations(this.quiz.id, this.questionExplanations);

    // Save manual/written scores for other components
    this.quizService.saveGradingState(
      this.quiz.id,
      this.questionScores,
      this.manualScores
    );

    this.router.navigate(['/teacher-dashboard'], {
      replaceUrl: true,
    });
  }

  studentAnswer(q: Question) {
    return this.quiz.studentAnswers?.[q.id] || '';
  }

  correctAnswer(q: Question) {
    return q.type === 'mcq' ? q.options?.find((o) => o.isCorrect)?.id : '';
  }

  isCorrect(q: Question) {
    return q.type === 'mcq' && this.studentAnswer(q) === this.correctAnswer(q);
  }
  goBack() {
    this.location.back();
  }
  correctOptionId(q: Question): string {
    return q.options?.find((o) => o.isCorrect)?.id || '';
  }
  isSelected(q: Question, optionId: string): boolean {
    return this.studentAnswer(q) === optionId;
  }
}
