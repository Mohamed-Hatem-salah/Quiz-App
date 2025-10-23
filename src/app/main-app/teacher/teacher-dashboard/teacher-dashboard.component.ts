import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { QuizDataService, Quiz } from '../../quiz.service';
import { HlmButton } from '@spartan-ng/helm/button';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-teacher-dashboard',
  standalone: true,
  imports: [CommonModule, HlmButton, RouterLink],
  templateUrl: './teacher-dashboard.component.html',
  styleUrls: ['./teacher-dashboard.component.css'],
})
export class TeacherDashboardComponent implements OnInit {
  quizzes: Quiz[] = [];
  loading = true;

  constructor(private quizService: QuizDataService, private router: Router) {}

  ngOnInit(): void {
    this.loadQuizzes();
  }

  loadQuizzes() {
    this.loading = true;
    setTimeout(() => {
      this.quizzes = this.quizService.getQuizzes('teacher');
      this.loading = false;
    }, 2000);
  }

  // ---------------- Actions ----------------
  publishQuiz(quiz: Quiz) {
    if (quiz.status === 'unpublished') {
      this.quizService.publishQuiz(quiz.id);

      this.loadQuizzes();
    }
  }

  gradeQuiz(quiz: Quiz) {
    if (quiz.status === 'grading') {
      this.router.navigate(['/grading-quiz', quiz.id]);
    }
  }

  // ---------------- Status helpers ----------------
  canPublish(quiz: Quiz): boolean {
    return quiz.status === 'unpublished';
  }

  canView(quiz: Quiz): boolean {
    return ['published', 'scheduled', 'active', 'expired'].includes(
      quiz.status
    );
  }

  canGrade(quiz: Quiz): boolean {
    return quiz.status === 'grading';
  }

  isFinished(quiz: Quiz): boolean {
    return quiz.status === 'finished';
  }
}
