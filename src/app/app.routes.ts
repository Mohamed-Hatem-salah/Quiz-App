import { Routes } from '@angular/router';
import { LayoutComponent } from './layout/layout.component';
import { OverviewComponent } from './layout/overview/overview.component';
import { StudentComponent } from './layout/student/student.component';
import { TeacherComponent } from './layout/teacher/teacher.component';
import { ConnectionsComponent } from './layout/connections/connections.component';
import { RelashionMapComponent } from './layout/relashion-map/relashion-map.component';
import { ErrorpageComponent } from './errorpage/errorpage.component';
import { IndexComponent } from './index/index.component';
import { SignInComponent } from './sign-in/sign-in.component';
import { LayoutStudentComponent } from './main-app/student/layout-student/layout-student.component';
import { StudentDashboardComponent } from './main-app/student/student-dashboard/student-dashboard.component';

import { authGuard } from './auth.guard';
import { QuizFormComponent } from './main-app/teacher/quiz-form/quiz-form.component';

import { AttemptQuizComponent } from './main-app/student/attempt-quiz/attempt-quiz.component';
import { TeacherDashboardComponent } from './main-app/teacher/teacher-dashboard/teacher-dashboard.component';
import { LayoutTeacherComponent } from './main-app/teacher/layout-teacher/layout-teacher.component';
import { StudentToTeacherComponent } from './main-app/teacher/student-to-teacher/student-to-teacher.component';
import { ConnectStudentsComponent } from './main-app/student/connect-students/connect-students.component';
import { ViewDetailesComponent } from './main-app/teacher/view-detailes/view-detailes.component';
import { GradingQuizComponent } from './main-app/teacher/grading-quiz/grading-quiz.component';
import { ReviewQuizComponent } from './main-app/student/review-quiz/review-quiz.component';
import { TeacherToStudentComponent } from './main-app/student/teacher-to-student/teacher-to-student.component';
export const routes: Routes = [
  { path: '', redirectTo: 'index', pathMatch: 'full' },
  {
    path: 'index',
    component: IndexComponent,
    data: { title: 'Welcome - Quiz App' },
  },
  {
    path: 'sign-in',
    component: SignInComponent,
    data: { title: 'Sign In - Quiz App' },
  },

  {
    path: '',
    component: LayoutComponent,
    canActivate: [authGuard],
    data: { role: 'super' },
    children: [
      {
        path: 'home',
        component: OverviewComponent,
        data: { title: 'Overview - Admin' },
      },
      {
        path: 'student',
        component: StudentComponent,
        data: { title: 'Manage Students - Admin' },
      },
      {
        path: 'teacher',
        component: TeacherComponent,
        data: { title: 'Manage Teachers - Admin' },
      },
      {
        path: 'connections',
        component: ConnectionsComponent,
        data: { title: 'Connections - Admin' },
      },
      {
        path: 'relashion-map',
        component: RelashionMapComponent,
        data: { title: 'Relation Map - Admin' },
      },
    ],
  },
  {
    path: '',
    component: LayoutTeacherComponent,
    canActivate: [authGuard],
    data: { role: 'teacher' },
    children: [
      {
        path: 'create-quiz',
        component: QuizFormComponent,
        data: { title: 'Create Quiz - Teacher' },
      },
      {
        path: 'teacher-dashboard',
        component: TeacherDashboardComponent,
        data: { title: 'My Dashboard - Teacher' },
      },
      {
        path: 'student-to-teacher',
        component: StudentToTeacherComponent,
        data: { title: 'Attendance - Teacher' },
      },
      {
        path: 'view-detailes/:id',
        component: ViewDetailesComponent,
        data: { title: 'Quiz Details - Teacher' },
      },
      {
        path: 'grading-quiz/:id',
        component: GradingQuizComponent,
        data: { title: 'Grading Quiz - Teacher' },
      },
    ],
  },
  {
    path: '',
    component: LayoutStudentComponent,
    canActivate: [authGuard],
    data: { role: 'student' },
    children: [
      {
        path: 'student-dashboard',
        component: StudentDashboardComponent,
        data: { title: 'My Dashboard - Student' },
      },
      {
        path: 'teacher-to-student',
        component: TeacherToStudentComponent,
        data: { title: 'Relashions - Student' },
      },
      {
        path: 'connect-student',
        component: ConnectStudentsComponent,
        data: { title: 'Connections - Student' },
      },
      {
        path: 'attempt-quiz/:id',
        component: AttemptQuizComponent,
        data: { title: 'Attempt Quiz - Student' },
      },
      {
        path: 'review-quiz/:id',
        component: ReviewQuizComponent,
        data: { title: 'Review Quiz - Student' },
      },
    ],
  },

  {
    path: '**',
    component: ErrorpageComponent,
    data: { title: '404 - Not Found' },
  },
];
