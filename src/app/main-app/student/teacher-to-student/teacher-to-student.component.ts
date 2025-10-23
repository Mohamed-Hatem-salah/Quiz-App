import { Component, OnInit } from '@angular/core';
import emailjs from '@emailjs/browser';
import {
  FormBuilder,
  FormGroup,
  Validators,
  ReactiveFormsModule,
} from '@angular/forms';
import { CommonModule } from '@angular/common';
import { HeaderComponent } from '../header/header.component';
import { HlmButton } from '@spartan-ng/helm/button';
import { HlmInput } from '@spartan-ng/helm/input';
import { BrnSelectImports } from '@spartan-ng/brain/select';
import { HlmSelectImports } from '@spartan-ng/helm/select';
import { ConnectionService } from '../../../layout/connections/connection.service';
import { DataStoreService, StoredTeacher } from '../../../layout/connections/data-store.service';
import { AuthService } from '../../../auth.service';
import { Title } from '@angular/platform-browser';

@Component({
  selector: 'app-teacher-to-student',
  standalone: true,
  imports: [
    HeaderComponent,
    CommonModule,
    ReactiveFormsModule,
    HlmButton,
    HlmInput,
    BrnSelectImports,
    HlmSelectImports,
  ],
  templateUrl: './teacher-to-student.component.html',
  styleUrls: ['./teacher-to-student.component.css'],
})
export class TeacherToStudentComponent implements OnInit {
  contactForm: FormGroup;
  selectedTeacher: string = '';
  teachers: StoredTeacher[] = [];

  constructor(
    private fb: FormBuilder,
    private connectionService: ConnectionService,
    private dataStore: DataStoreService,
    private authService: AuthService
  ) {
    this.contactForm = this.fb.group({
      name: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      message: ['', Validators.required],
    });
  }

  ngOnInit(): void {
    this.loadConnectedTeachers();
  }

  loadConnectedTeachers(): void {
    const studentId = this.authService.getUserId();
    if (!studentId) return;

    // Get connections for this student
    const connections = this.connectionService.getConnectionsByStudent(studentId);
    
    // Get all teachers
    const allTeachers = this.dataStore.getTeachers();
    
    // Filter to only connected teachers
    this.teachers = allTeachers.filter(teacher => 
      connections.some(connection => connection.teacherId === teacher.id)
    );
  }

  isLoading = false;
  sendEmail() {
    if (this.contactForm.invalid || !this.selectedTeacher) return;

    this.isLoading = true;

    // Find the selected teacher
    const selectedTeacherObj = this.teachers.find(
      (t) => t.name === this.selectedTeacher
    );
    const teacherEmail = selectedTeacherObj?.email || 'mhatem044@gmail.com';

    const templateParams = {
      from_name: this.contactForm.value.name,
      from_email: this.contactForm.value.email,
      to_email: teacherEmail,
      teacher_name: this.selectedTeacher,
      message: this.contactForm.value.message,
    };

    emailjs
      .send(
        'service_b6je9ts',
        'template_h49v6ug',
        templateParams,
        'iJncH7j5VlcEuvpXm'
      )
      .then(
        () => {
          alert(`Message sent successfully to ${teacherEmail}!`);
          this.contactForm.reset();
          this.selectedTeacher = '';
          this.isLoading = false;
        },
        (err) => {
          alert('Failed to send message.');
          console.error(err);
          this.isLoading = false;
        }
      );
  }
}
