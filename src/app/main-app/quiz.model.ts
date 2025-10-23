export type QuestionType = 'mcq' | 'written';

export interface Option {
  id: string;
  text: string;
  isCorrect: boolean;
}

export interface Question {
  id: string;
  text: string;
  type: QuestionType;
  points: number;
  options?: Option[];
  correctAnswer?: string;
}

// Shared statuses for both roles
export type SharedQuizStatus = 'scheduled' | 'grading' | 'finished';
export type TeacherQuizStatus = 'unpublished' | 'published' | SharedQuizStatus;
export type StudentQuizStatus = 'active' | 'expired' | SharedQuizStatus;
export type QuizStatus = TeacherQuizStatus | StudentQuizStatus;

export interface Quiz {
  id: string;
  title: string;
  description?: string;
  duration: number;
  startTime: Date;
  questions: Question[];
  status: QuizStatus;
  timeSpent?: number;
  manualScores?: { [questionId: string]: number };
  questionScores?: { [questionId: string]: number };
  questionExplanations?: { [questionId: string]: string };
  started?: boolean;
  grade?: number;
  startedAt?: Date;
  studentAnswers?: { [questionId: string]: string };
  teacherGraded?: boolean;
  requiresSEB?: boolean;
  teacherId: number; // ID of the teacher who created this quiz
}
