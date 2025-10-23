import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export type ActivityFilter = 'all' | 'student' | 'teacher' | 'connection';

export interface Activity {
  id: number;
  type: ActivityFilter;
  title: string;
  description: string;
  timestamp: Date;
}

@Injectable({ providedIn: 'root' })
export class ActivityService {
  private readonly activitiesKey = 'quiz_activities';
  private readonly notificationsKey = 'quiz_notifications';

  private activitiesSubject = new BehaviorSubject<Activity[]>([]);
  activities$ = this.activitiesSubject.asObservable();

  private filteredActivitiesSubject = new BehaviorSubject<Activity[]>([]);
  filteredActivities$ = this.filteredActivitiesSubject.asObservable();

  private notificationCountSubject = new BehaviorSubject<number>(0);
  notificationCount$ = this.notificationCountSubject.asObservable();

  private currentFilter: ActivityFilter = 'all';
  private lastId = 0;

  constructor() {
    // Load from localStorage
    const savedActivities = localStorage.getItem(this.activitiesKey);
    if (savedActivities) {
      const activities = JSON.parse(savedActivities).map((a: any) => ({
        ...a,
        timestamp: new Date(a.timestamp),
      }));
      this.activitiesSubject.next(activities);
      this.lastId =
        activities.length > 0
          ? Math.max(...activities.map((a: Activity) => a.id))
          : 0;
    }

    const savedNotifications = localStorage.getItem(this.notificationsKey);
    if (savedNotifications) {
      this.notificationCountSubject.next(parseInt(savedNotifications, 10));
    }

    // Set initial filter
    this.applyFilter(this.currentFilter);
  }

  addActivity(type: ActivityFilter, title: string, description: string) {
    const newActivity: Activity = {
      id: ++this.lastId,
      type,
      title,
      description,
      timestamp: new Date(),
    };

    const updated = [newActivity, ...this.activitiesSubject.value];
    this.activitiesSubject.next(updated);
    this.saveActivities(updated);

    // Increment notification counter
    const newCount = this.notificationCountSubject.value + 1;
    this.notificationCountSubject.next(newCount);
    localStorage.setItem(this.notificationsKey, newCount.toString());

    this.applyFilter(this.currentFilter);
  }

  addConnectionActivity(
    studentName: string,
    teacherName: string,
    action: 'assigned' | 'removed'
  ) {
    this.addActivity(
      'connection',
      `Connection ${action}`,
      `Student ${studentName} was ${action} to Teacher ${teacherName}`
    );
  }

  clearNotifications() {
    this.notificationCountSubject.next(0);
    localStorage.setItem(this.notificationsKey, '0');
  }

  addStudentActivity(name: string, extraInfo: string, action: string) {
    this.addActivity(
      'student',
      `Student ${action}`,
      `${name} (${extraInfo}) was ${action}`
    );
  }

  addTeacherActivity(name: string, extraInfo: string, action: string) {
    this.addActivity(
      'teacher',
      `Teacher ${action}`,
      `${name} (${extraInfo}) was ${action}`
    );
  }

  getNotificationCount(): number {
    return this.notificationCountSubject.value;
  }

  getFilteredActivities(): Activity[] {
    return this.filteredActivitiesSubject.value;
  }

  getCurrentFilter(): ActivityFilter {
    return this.currentFilter;
  }

  applyFilter(filter: ActivityFilter) {
    this.currentFilter = filter;
    const activities = this.activitiesSubject.value;
    const filtered =
      filter === 'all'
        ? activities
        : activities.filter((a) => a.type === filter);
    this.filteredActivitiesSubject.next(filtered);
  }

  private saveActivities(activities: Activity[]) {
    localStorage.setItem(this.activitiesKey, JSON.stringify(activities));
  }

  clearActivities() {
    const emptyActivities: Activity[] = [];
    this.activitiesSubject.next(emptyActivities);
    this.saveActivities(emptyActivities);
    this.filteredActivitiesSubject.next(emptyActivities);
    this.lastId = 0;
  }
}
