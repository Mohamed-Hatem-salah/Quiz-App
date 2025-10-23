import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { z } from 'zod';
import { toast } from 'ngx-sonner';
import { ActivityService, ActivityFilter } from '../../activity.service';
import { DataStoreService, StoredTeacher } from '../connections/data-store.service';

export interface Teacher {
  id: number;
  name: string;
  email: string;
  gender: string;
  username: string;
  password: string;
  phone?: string;
}

@Component({
  selector: 'app-teacher',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './teacher.component.html',
  styleUrls: ['./teacher.component.css'],
})
export class TeacherComponent implements OnInit {
  teachers: Teacher[] = [];
  filteredTeachers: Teacher[] = [];
  currentTeacher: Omit<Teacher, 'id'> & { id: number | null } = {
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
  errors: Partial<Record<keyof Teacher, string>> = {};
  formValid = false;
  genderOptions = ['Male', 'Female'];




  teacherSchema = z.object({
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
    this.loadTeachers();
  }

  private loadTeachers() {
    const storedTeachers = this.dataStore.getTeachers();
    this.teachers = storedTeachers.map(t => ({
      id: t.id,
      name: t.name,
      email: t.email,
      gender: 'Male', // Default gender since it's not stored
      username: t.username,
      password: t.password,
      phone: t.phone || ''
    }));
    this.filteredTeachers = [...this.teachers];
  }

  filterTeachers() {
    if (!this.searchTerm) {
      this.filteredTeachers = [...this.teachers];
      return;
    }
    const term = this.searchTerm.toLowerCase();
    this.filteredTeachers = this.teachers.filter(
      t =>
        t.name.toLowerCase().includes(term) ||
        t.email.toLowerCase().includes(term) ||
        t.gender.toLowerCase().includes(term) ||
        (t.phone && t.phone.includes(term))
    );
  }

  openAddModal() {
    this.isEditMode = false;
    this.currentTeacher = { id: null, name: '', email: '', gender: '', username: '', password: '', phone: '' };
    this.errors = {};
    this.formValid = false;
    this.showModal = true;
  }

  editTeacher(teacher: Teacher) {
    this.isEditMode = true;
    this.currentTeacher = { ...teacher };
    this.errors = {};
    this.formValid = true;
    this.showModal = true;
  }

  deleteTeacher(id: number) {
    const currentTeachers = this.dataStore.getTeachers();
    const teacher = currentTeachers.find(t => t.id === id);
    if (!teacher) return;

    if (!confirm('Are you sure you want to delete this teacher?')) return;

    // Remove from DataStoreService
    const updatedTeachers = currentTeachers.filter(t => t.id !== id);
    this.dataStore.saveTeachers(updatedTeachers);
    
    // Reload local data
    this.loadTeachers();

    toast.success('Teacher deleted successfully!');
    this.activityService.addActivity(
      'teacher',
      'Deleted Teacher',
      `Teacher ${teacher.name} was deleted`
    );
  }

  onInputChange() {
    const result = this.teacherSchema.safeParse(this.currentTeacher);
    if (!result.success) {
      this.errors = {};
      result.error.issues.forEach(issue => {
        const key = issue.path[0] as keyof Teacher;
        this.errors[key] = issue.message;
      });
      this.formValid = false;
    } else {
      this.errors = {};
      this.formValid = true;
    }
  }

  addTeacher() {
    if (!this.formValid) return;

    // Get current teachers from DataStoreService
    const currentTeachers = this.dataStore.getTeachers();
    const newId = currentTeachers.length ? Math.max(...currentTeachers.map(t => t.id)) + 1 : 1;
    
    const newTeacher: StoredTeacher = {
      id: newId,
      name: this.currentTeacher.name,
      email: this.currentTeacher.email,
      subject: 'Mathematics', // Default subject since it's not in the form
      phone: this.currentTeacher.phone || '',
      username: this.currentTeacher.username,
      password: this.currentTeacher.password
    };

    // Add to DataStoreService
    const updatedTeachers = [...currentTeachers, newTeacher];
    this.dataStore.saveTeachers(updatedTeachers);
    
    // Reload local data
    this.loadTeachers();

    toast.success('Teacher added successfully!');
    this.activityService.addActivity(
      'teacher',
      'Added Teacher',
      `Teacher ${newTeacher.name} was added`
    );

    this.closeModal();
  }

  updateTeacher() {
    if (!this.formValid) return;

    // Get current teachers from DataStoreService
    const currentTeachers = this.dataStore.getTeachers();
    const index = currentTeachers.findIndex(t => t.id === this.currentTeacher.id);
    
    if (index !== -1) {
      const updatedTeacher: StoredTeacher = {
        id: this.currentTeacher.id as number,
        name: this.currentTeacher.name,
        email: this.currentTeacher.email,
        subject: 'Mathematics', // Default subject since it's not in the form
        phone: this.currentTeacher.phone || '',
        username: this.currentTeacher.username,
        password: this.currentTeacher.password
      };

      // Update in DataStoreService
      currentTeachers[index] = updatedTeacher;
      this.dataStore.saveTeachers(currentTeachers);
      
      // Reload local data
      this.loadTeachers();

      toast.success('Teacher updated successfully!');
      this.activityService.addActivity(
        'teacher',
        'Updated Teacher',
        `Teacher ${this.currentTeacher.name} was updated`
      );

      this.closeModal();
    }
  }

  closeModal() {
    this.showModal = false;
  }

}