import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HeaderComponent } from '../header/header.component';
import { ConnectionService } from '../../../layout/connections/connection.service';
import { DataStoreService, StoredTeacher } from '../../../layout/connections/data-store.service';
import { AuthService } from '../../../auth.service';

@Component({
  selector: 'app-connect-students',
  imports: [CommonModule, HeaderComponent],
  templateUrl: './connect-students.component.html',
  styleUrl: './connect-students.component.css'
})
export class ConnectStudentsComponent implements OnInit {
  connectedTeachers: StoredTeacher[] = [];

  constructor(
    private connectionService: ConnectionService,
    private dataStore: DataStoreService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.loadConnectedTeachers();
  }

  private loadConnectedTeachers(): void {
    const studentId = this.authService.getUserId();
    if (!studentId) return;

    // Get connections for this student
    const connections = this.connectionService.getConnectionsByStudent(studentId);
    
    // Get all teachers
    const allTeachers = this.dataStore.getTeachers();
    
    // Filter to only connected teachers
    this.connectedTeachers = allTeachers.filter(teacher => 
      connections.some(connection => connection.teacherId === teacher.id)
    );
  }

  contactTeacher(teacher: StoredTeacher): void {
    // Navigate to the teacher-to-student component with the selected teacher
    // This will open the contact form for that specific teacher
    window.location.href = `/teacher-to-student?teacher=${encodeURIComponent(teacher.name)}`;
  }

  refreshConnections(): void {
    this.loadConnectedTeachers();
  }
}
