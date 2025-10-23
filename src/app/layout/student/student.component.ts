import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { z } from 'zod';
import { toast } from 'ngx-sonner';
import { ActivityService, ActivityFilter } from '../../activity.service';
import { DataStoreService, StoredStudent } from '../connections/data-store.service';

export interface Student {
  id: number;
  name: string;
  email: string;
  gender: string;
  username: string;
  password: string;
  phone?: string;
}

@Component({
  selector: 'app-student',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './student.component.html',
})
export class StudentComponent implements OnInit {
  students: Student[] = [];
  filteredStudents: Student[] = [];
  currentStudent: Omit<Student, 'id'> & { id: number | null } = {
    id: null,
    name: '',
    email: '',
    gender: '',
    username: '',
    password: '',
    phone: '',
  };

  showModal = false;
  isEditMode = false;
  searchTerm = '';
  errors: Partial<Record<keyof Student, string>> = {};
  formValid = false;
  genderOptions = ['Male', 'Female'];



  studentSchema = z.object({
    name: z.string().min(2, 'Name is required'),
    email: z.string().email('Invalid email').endsWith('@gmail.com', 'Email must end with @gmail.com'),
    gender: z.string().min(1, 'Gender is required'),
    phone: z.string().regex(/^\d*$/, 'Phone must be numbers only').optional(),
    username: z.string().min(4, 'Username must be at least 4 characters'),
    password: z
      .string()
      .min(8, 'Password must be at least 8 characters')
      .regex(/[\W_]/, 'Password must contain at least one special character')
      .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
      .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
      .regex(/[0-9]/, 'Password must contain at least one number'),
  });

  constructor(
    private activityService: ActivityService,
    private dataStore: DataStoreService
  ) { }

  ngOnInit() {
    this.loadStudents();
  }

  private loadStudents() {
    const storedStudents = this.dataStore.getStudents();
    this.students = storedStudents.map(s => ({
      id: s.id,
      name: s.name,
      email: s.email,
      gender: 'Male', // Default gender since it's not stored
      username: s.username,
      password: s.password,
      phone: s.phone || ''
    }));
    this.filteredStudents = [...this.students];
  }

  filterStudents() {
    if (!this.searchTerm) {
      this.filteredStudents = [...this.students];
      return;
    }
    const term = this.searchTerm.toLowerCase();
    this.filteredStudents = this.students.filter(
      s =>
        s.name.toLowerCase().includes(term) ||
        s.email.toLowerCase().includes(term) ||
        s.gender.toLowerCase().includes(term) ||
        (s.phone && s.phone.includes(term))
    );
  }

  openAddModal() {
    this.isEditMode = false;
    this.currentStudent = { id: null, name: '', email: '', gender: '', username: '', password: '', phone: '' };
    this.errors = {};
    this.formValid = false;
    this.showModal = true;
  }

  editStudent(student: Student) {
    this.isEditMode = true;
    this.currentStudent = { ...student };
    this.errors = {};
    this.formValid = true;
    this.showModal = true;
  }

  deleteStudent(id: number) {
    const currentStudents = this.dataStore.getStudents();
    const student = currentStudents.find(s => s.id === id);
    if (!student) return;

    if (!confirm('Are you sure you want to delete this student?')) return;

    // Remove from DataStoreService
    const updatedStudents = currentStudents.filter(s => s.id !== id);
    this.dataStore.saveStudents(updatedStudents);
    
    // Reload local data
    this.loadStudents();

    toast.success('Student deleted successfully!');
    this.activityService.addActivity(
      'student',
      'Deleted Student',
      `Student ${student.name} was deleted`
    );
  }

  onInputChange() {
    const result = this.studentSchema.safeParse(this.currentStudent);
    if (!result.success) {
      this.errors = {};
      result.error.issues.forEach(issue => {
        const key = issue.path[0] as keyof Student;
        this.errors[key] = issue.message;
      });
      this.formValid = false;
    } else {
      this.errors = {};
      this.formValid = true;
    }
  }


  addStudent() {
    if (!this.formValid) return;

    // Get current students from DataStoreService
    const currentStudents = this.dataStore.getStudents();
    const newId = currentStudents.length ? Math.max(...currentStudents.map(s => s.id)) + 1 : 1;
    
    const newStudent: StoredStudent = {
      id: newId,
      name: this.currentStudent.name,
      email: this.currentStudent.email,
      grade: '10th', // Default grade since it's not in the form
      phone: this.currentStudent.phone,
      username: this.currentStudent.username,
      password: this.currentStudent.password
    };

    // Add to DataStoreService
    const updatedStudents = [...currentStudents, newStudent];
    this.dataStore.saveStudents(updatedStudents);
    
    // Reload local data
    this.loadStudents();

    toast.success('Student added successfully!');
    this.activityService.addActivity(
      'student',
      'Added Student',
      `Student ${newStudent.name} was added`
    );

    this.closeModal();
  }

  updateStudent() {
    if (!this.formValid) return;

    // Get current students from DataStoreService
    const currentStudents = this.dataStore.getStudents();
    const index = currentStudents.findIndex(s => s.id === this.currentStudent.id);
    
    if (index !== -1) {
      const updatedStudent: StoredStudent = {
        id: this.currentStudent.id as number,
        name: this.currentStudent.name,
        email: this.currentStudent.email,
        grade: '10th', // Default grade since it's not in the form
        phone: this.currentStudent.phone,
        username: this.currentStudent.username,
        password: this.currentStudent.password
      };

      // Update in DataStoreService
      currentStudents[index] = updatedStudent;
      this.dataStore.saveStudents(currentStudents);
      
      // Reload local data
      this.loadStudents();

      toast.success('Student updated successfully!');
      this.activityService.addActivity(
        'student',
        'Updated Student',
        `Student ${this.currentStudent.name} was updated`
      );

      this.closeModal();
    }
  }

  closeModal() {
    this.showModal = false;
  }

}