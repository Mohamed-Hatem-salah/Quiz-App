import { Injectable } from '@angular/core';
import {
  CanActivate,
  ActivatedRouteSnapshot,
  RouterStateSnapshot,
  Router,
} from '@angular/router';
import { QuizDataService } from './main-app/quiz.service';

@Injectable({
  providedIn: 'root',
})
export class QuizGuard implements CanActivate {
  constructor(private quizService: QuizDataService, private router: Router) {}

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): boolean {
    const quizId = route.paramMap.get('id');
    if (!quizId) {
      this.router.navigate(['/student-dashboard'], { replaceUrl: true });
      return false;
    }

    const quiz = this.quizService.getQuizById(quizId);
    if (!quiz) {
      alert('Quiz not found');
      this.router.navigate(['/student-dashboard'], { replaceUrl: true });
      return false;
    }

    // Determine which route this is
    const path = route.routeConfig?.path;

    // Student attempt
    if (path?.startsWith('attempt-quiz')) {
      if (quiz.status !== 'active') {
        alert('You cannot attempt this quiz.');
        this.router.navigate(['/student-dashboard'], { replaceUrl: true });
        return false;
      }
    }

    // Teacher grading
    if (path?.startsWith('grading-quiz')) {
      if (quiz.status !== 'grading') {
        alert('This quiz is not ready for grading.');
        this.router.navigate(['/teacher-dashboard'], { replaceUrl: true });
        return false;
      }
    }

    return true;
  }
}
