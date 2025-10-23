import { Component, OnInit, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  DataStoreService,
  StoredStudent,
  StoredTeacher,
} from '../connections/data-store.service';
import { ConnectionService } from '../connections/connection.service';

@Component({
  selector: 'app-relashion-map',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './relashion-map.component.html',
  styleUrls: ['./relashion-map.component.css'],
})
export class RelashionMapComponent implements OnInit {
  students: StoredStudent[] = [];
  teachers: StoredTeacher[] = [];

  // UI state
  viewMode = signal<'all' | 'by-student' | 'by-teacher'>('all');
  search = signal<string>('');

  constructor(
    private store: DataStoreService,
    public connections: ConnectionService
  ) {}

  ngOnInit(): void {
    this.students = this.store.getStudents();
    this.teachers = this.store.getTeachers();
  }

  // Derived data
  readonly studentWithAssignments = computed(() => {
    const term = this.search().toLowerCase().trim();
    return this.students
      .filter((s) => !term || s.name.toLowerCase().includes(term))
      .map((s) => {
        const links = this.connections.getConnectionsByStudent(s.id);
        const teacherInfos = links
          .map((l) => this.teachers.find((t) => t.id === l.teacherId))
          .filter(Boolean) as StoredTeacher[];
        return {
          student: s,
          teachers: teacherInfos,
          count: teacherInfos.length,
          createdAtList: links.map((l) => l.createdAt),
        };
      });
  });


}
