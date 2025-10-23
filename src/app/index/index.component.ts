import { Component } from '@angular/core';
import { RouterLink, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../auth.service';

@Component({
  selector: 'app-index',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './index.component.html',
  styleUrls: ['./index.component.css'],
})
export class IndexComponent {
  role: string | null = null;

  constructor(private authService: AuthService, private router: Router) {
    this.role = authService.getRole();
  }

  startApplication() {
    if (!this.role) {
      this.router.navigate(['/sign-in']);
      return;
    }

    // Redirect based on role
    switch (this.role) {
      case 'student':
        this.router.navigate(['/student-dashboard']);
        break;
      case 'teacher':
        this.router.navigate(['/teacher-dashboard']);
        break;
      case 'admin':
        this.router.navigate(['/home']); // super admin dashboard
        break;
      default:
        this.router.navigate(['/sign-in']);
    }
  }

}
