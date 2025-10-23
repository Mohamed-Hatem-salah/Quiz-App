import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { QuizDataService, Quiz, Question } from '../../quiz.service';
import { HlmButton } from '@spartan-ng/helm/button';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { HlmInput } from '@spartan-ng/helm/input';
import {
  HlmDialog,
  HlmDialogContent,
  HlmDialogFooter,
  HlmDialogHeader,
} from '@spartan-ng/helm/dialog';
import { BrnDialogContent, BrnDialogTrigger } from '@spartan-ng/brain/dialog';

@Component({
  selector: 'app-attempt-quiz',
  standalone: true,
  imports: [
    BrnDialogTrigger,
    BrnDialogContent,
    HlmDialog,
    HlmDialogContent,
    HlmDialogFooter,
    HlmDialogHeader,
    HlmButton,
    FormsModule,
    CommonModule,
    HlmInput,
  ],
  templateUrl: './attempt-quiz.component.html',
  styleUrl: './attempt-quiz.component.css',
})
export class AttemptQuizComponent implements OnInit, OnDestroy {
  quiz!: Quiz;
  currentIndex: number = 0;
  selectedAnswers: { [questionId: string]: string } = {};
  timeLeft!: number;
  timerInterval: any;

  submitMessage = '';
  autoSubmitted = false;

  constructor(private router: Router, private quizService: QuizDataService) {}

  ngOnInit(): void {
    const found = this.quizService.getCurrentQuiz();
    if (!found) {
      alert('No quiz selected');
      this.router.navigate(['/student-dashboard']);
      return;
    }

    this.quiz = found;

    // Ensure question + option IDs
    this.quiz.questions.forEach((q, i) => {
      if (!q.id) q.id = `q${i + 1}`;
      if (q.type === 'mcq') {
        q.options?.forEach((o, idx) => {
          if (!o.id) o.id = idx.toString();
        });
      }
    });

    const now = Date.now();
    const start = this.quiz.startTime.getTime();
    const end = start + this.quiz.duration * 60000;

    if (now < start) {
      this.timeLeft = this.quiz.duration * 60;
      const delay = start - now;
      setTimeout(() => {
        this.startQuiz();
      }, delay);
    } else if (now >= start && now <= end) {
      this.startQuiz();
    } else {
      this.timeLeft = 0;
      this.autoSubmit();
    }
  }

  ngOnDestroy(): void {
    if (this.timerInterval) clearInterval(this.timerInterval);
  }

  private startQuiz() {
    if (!this.quiz.startedAt) this.quiz.startedAt = new Date();
    this.quizService.setCurrentQuiz(this.quiz);
    const now = Date.now();
    const end = this.quiz.startTime.getTime() + this.quiz.duration * 60000;
    this.timeLeft = Math.floor((end - now) / 1000);

    this.startTimer();
  }

  tickSound = new Audio('clock-ticking-sound-effect-240503.mp3');
  private tickPlayed = false;

  private startTimer() {
    this.timerInterval = setInterval(() => {
      if (this.timeLeft > 0) {
        this.timeLeft--;

        if (this.timeLeft <= 8 && !this.tickPlayed) {
          this.tickSound.currentTime = 0;
          this.tickSound.play().catch(() => {});
          this.tickPlayed = true;
        }
      } else {
        this.autoSubmit();
      }
    }, 1000);
  }

  get currentQuestion(): Question {
    return this.quiz.questions[this.currentIndex];
  }

  selectAnswer(optionId: string | number) {
    const qId = this.currentQuestion.id;
    this.selectedAnswers[qId] = optionId.toString();

    // Immediately persist to the service
    this.quizService.updateStudentAnswer(
      this.quiz.id,
      qId,
      optionId.toString()
    );
  }

  nextQuestion() {
    if (this.currentIndex < this.quiz.questions.length - 1) this.currentIndex++;
  }

  previousQuestion() {
    if (this.currentIndex > 0) this.currentIndex--;
  }

  goToQuestion(index: number) {
    if (index >= 0 && index < this.quiz.questions.length) {
      this.currentIndex = index;
    }
  }

  isAnswered(questionId: string): boolean {
    return !!this.selectedAnswers[questionId];
  }

  get isTimeCritical(): boolean {
    return this.timeLeft <= 8;
  }

  get progress(): number {
    return ((this.currentIndex + 1) / this.quiz.questions.length) * 100;
  }

  get formattedTime(): string {
    const minutes = Math.floor(this.timeLeft / 60);
    const seconds = this.timeLeft % 60;
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
  }

  private autoSubmit() {
    clearInterval(this.timerInterval);
    this.autoSubmitted = true;
    this.quiz.studentAnswers = { ...this.selectedAnswers };
    this.quizService.setGrading(this.quiz);
    if (this.quiz.startedAt) {
      this.quiz.timeSpent = Math.floor(
        (Date.now() - this.quiz.startedAt.getTime()) / 1000
      );
      this.quizService.updateQuiz(this.quiz.id, {
        timeSpent: this.quiz.timeSpent,
      });
    }
    console.log(this.quiz.timeSpent);
    alert('⏳ Time is up! Your quiz has been automatically submitted.');
    this.router.navigate(['/student-dashboard'], {
      replaceUrl: true,
    });
  }

  finalizeSubmit() {
    // Save student answers
    this.quiz.studentAnswers = { ...this.selectedAnswers };

    // Mark quiz as grading for both teacher and student
    this.quizService.setGrading(this.quiz);
    if (this.quiz.startedAt) {
      this.quiz.timeSpent = Math.floor(
        (Date.now() - this.quiz.startedAt.getTime()) / 1000
      );
      this.quizService.updateQuiz(this.quiz.id, {
        timeSpent: this.quiz.timeSpent,
      });
    }
    console.log(this.quiz.timeSpent);
    this.router.navigate(['/student-dashboard'], {
      replaceUrl: true,
    });
  }
  onWrittenAnswerChange(questionId: string, value: string) {
    if (value && value.trim() !== '') {
      this.selectedAnswers[questionId] = value.trim();
    } else {
      delete this.selectedAnswers[questionId]; // remove if empty
    }

    // Persist to service
    this.quizService.updateStudentAnswer(
      this.quiz.id,
      questionId,
      this.selectedAnswers[questionId] || ''
    );
  }

  objectKeys(obj: any): string[] {
    return Object.keys(obj);
  }
}
