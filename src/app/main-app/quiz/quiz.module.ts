import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { QuizFormComponent } from '../teacher/quiz-form/quiz-form.component';

@NgModule({
  imports: [CommonModule, ReactiveFormsModule, FormsModule, QuizFormComponent],
  exports: [QuizFormComponent],
})
export class QuizModule {}
