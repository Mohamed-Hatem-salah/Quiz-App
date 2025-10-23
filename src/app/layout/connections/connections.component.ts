import { Component, OnInit, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  DataStoreService,
  StoredStudent,
  StoredTeacher,
} from './data-store.service';
import { ConnectionService } from './connection.service';

@Component({
  selector: 'app-connections',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './connections.component.html',
  styleUrl: './connections.component.css',
})
export class ConnectionsComponent implements OnInit {
  students: StoredStudent[] = [];
  teachers: StoredTeacher[] = [];

  selectedStudentId = signal<number | null>(null);
  teacherSearch = signal<string>('');
  mode = signal<'assign' | 'manage'>('assign');

  filteredTeachers = computed(() => {
    const term = this.teacherSearch().toLowerCase().trim();
    if (!term) return this.teachers;
    return this.teachers.filter(
      (t) =>
        t.name.toLowerCase().includes(term) ||
        t.subject.toLowerCase().includes(term)
    );
  });

  // Expose computed as a property for template friendliness
  get filteredTeachersList(): StoredTeacher[] {
    return this.filteredTeachers();
  }

  constructor(
    private store: DataStoreService,
    public connections: ConnectionService
  ) {}

  ngOnInit(): void {
    this.students = this.store.getStudents();
    this.teachers = this.store.getTeachers();
    console.log('All connections:', this.connections.getAllConnections());
  }

  isTeacherAssigned(teacherId: number): boolean {
    const studentId = this.selectedStudentId();
    if (studentId === null) return false;
    return this.connections
      .getConnectionsByStudent(studentId)
      .some((c) => c.teacherId === teacherId);
  }

  toggleAssignment(teacherId: number, checked: boolean) {
    const studentId = this.selectedStudentId();
    if (studentId === null) return;
    if (checked) {
      if (!this.isTeacherAssigned(teacherId)) {
        this.connections.addConnection(studentId, teacherId);
      }
    } else {
      const existing = this.connections
        .getConnectionsByStudent(studentId)
        .find((c) => c.teacherId === teacherId);
      if (existing) {
        this.connections.removeConnection(existing.id);
      }
    }
  }

  // Helpers to avoid arrow functions in templates
  getSelectedStudentName(): string {
    const id = this.selectedStudentId();
    if (id === null) return '';
    return this.getStudentNameById(id);
  }

  getStudentNameById(id: number): string {
    return this.students.find((s) => s.id === id)?.name ?? '';
  }

  getTeacherNameById(id: number): string {
    return this.teachers.find((t) => t.id === id)?.name ?? '';
  }

  getTeacherSubjectById(id: number): string {
    return this.teachers.find((t) => t.id === id)?.subject ?? '';
  }
}



