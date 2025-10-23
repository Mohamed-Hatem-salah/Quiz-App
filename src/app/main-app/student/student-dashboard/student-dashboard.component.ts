import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { QuizDataService, Quiz } from '../../quiz.service';
import { Router } from '@angular/router';
import { HlmButton } from '@spartan-ng/helm/button';
import { RouterLink } from '@angular/router';
import { HeaderComponent } from '../header/header.component';

@Component({
  selector: 'app-student-dashboard',
  standalone: true,
  imports: [CommonModule, HlmButton, RouterLink, HeaderComponent],
  templateUrl: './student-dashboard.component.html',
  styleUrls: ['./student-dashboard.component.css'],
})
export class StudentDashboardComponent implements OnInit {
  quizzes: Quiz[] = [];
  loading: boolean = true; 

  constructor(
    private quizService: QuizDataService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadQuizzes();
  }

  loadQuizzes() {
    this.loading = true;
    setTimeout(() => {
      this.quizzes = this.quizService.getQuizzes('student'); // pass 'student' role
      this.loading = false;
    }, 2000);
  }

  startQuiz(quiz: Quiz) {
    this.quizService.setCurrentQuiz(quiz);
    this.router.navigate(['/attempt-quiz', quiz.id]);
  }

  getTotalPoints(quiz: Quiz): number {
    return quiz.questions.reduce((sum, q) => sum + q.points, 0);
  }
  reviewQuiz(quiz: Quiz) {
    if (quiz.status === 'finished') {
      this.router.navigate(['/review-quiz', quiz.id]);
    }
  }
  launchSEB() {
    window.location.href = '/SebClientSettingsfinal.seb';
  }
}
