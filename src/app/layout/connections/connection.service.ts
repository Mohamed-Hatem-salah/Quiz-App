// src/app/connections/connection.service.ts

import { Injectable } from '@angular/core';
import { DataStoreService } from './data-store.service';
import { ActivityService } from '../../activity.service';

export interface Connection {
  id: number;
  studentId: number;
  teacherId: number;
  createdAt: Date;
}

@Injectable({ providedIn: 'root' })
export class ConnectionService {
  private readonly connectionsKey = 'quiz_connections';
  private connections: Connection[] = [];
  private lastId = 0;

  constructor(
    private store: DataStoreService,
    private activityService: ActivityService
  ) {
    this.loadConnections();
  }

  private loadConnections(): void {
    const saved = localStorage.getItem(this.connectionsKey);
    if (saved) {
      this.connections = JSON.parse(saved);
      this.lastId =
        this.connections.length > 0
          ? Math.max(...this.connections.map((c) => c.id))
          : 0;
    } else {
      this.connections = [];
    }
  }

  private saveConnections(): void {
    localStorage.setItem(this.connectionsKey, JSON.stringify(this.connections));
  }

  getAllConnections(): Connection[] {
    return this.connections;
  }

  getConnectionsByStudent(studentId: number): Connection[] {
    return this.connections.filter((c) => c.studentId === studentId);
  }

  getConnectionsByTeacher(teacherId: number): Connection[] {
    return this.connections.filter((c) => c.teacherId === teacherId);
  }

  addConnection(studentId: number, teacherId: number): void {
    const newConnection: Connection = {
      id: ++this.lastId,
      studentId,
      teacherId,
      createdAt: new Date(),
    };

    this.connections.push(newConnection);
    this.saveConnections();

    // Look up names
    const student = this.store.getStudents().find((s) => s.id === studentId);
    const teacher = this.store.getTeachers().find((t) => t.id === teacherId);

    this.activityService.addConnectionActivity(
      student?.name || `ID: ${studentId}`,
      teacher?.name || `ID: ${teacherId}`,
      'assigned'
    );
  }

  removeConnection(connectionId: number): void {
    const connection = this.connections.find((c) => c.id === connectionId);
    if (!connection) return;

    this.connections = this.connections.filter((c) => c.id !== connectionId);
    this.saveConnections();

    // Look up names
    const student = this.store
      .getStudents()
      .find((s) => s.id === connection.studentId);
    const teacher = this.store
      .getTeachers()
      .find((t) => t.id === connection.teacherId);

    this.activityService.addConnectionActivity(
      student?.name || `ID: ${connection.studentId}`,
      teacher?.name || `ID: ${connection.teacherId}`,
      'removed'
    );
  }
}
