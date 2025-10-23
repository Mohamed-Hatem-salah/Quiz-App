import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { DataStoreService } from './layout/connections/data-store.service';
import { ConnectionService } from './layout/connections/connection.service';
import { Observable, isObservable, take } from 'rxjs';

export interface SearchResult {
  type: 'student' | 'teacher' | 'connection' | 'page';
  id?: number;
  title: string;
  description: string;
  route: string;
  icon: string;
  highlightedTitle?: string;
  highlightedDescription?: string;
}

// شكل الاتصال المتوقع (camelCase أو snake_case)
interface Connection {
  id: number;
  studentId?: number;
  teacherId?: number;
  student_id?: number;
  teacher_id?: number;
}

@Injectable({ providedIn: 'root' })
export class SearchService {
  private allPages: SearchResult[] = [
    {
      type: 'page',
      title: 'Overview',
      description: 'Dashboard overview page',
      route: '/home',
      icon:
        '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 3v16a2 2 0 0 0 2 2h16"/><path d="M18 17V9"/><path d="M13 17V5"/><path d="M8 17v-3"/></svg>',
    },
    {
      type: 'page',
      title: 'Students',
      description: 'Manage students',
      route: '/student',
      icon:
        '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>',
    },
    {
      type: 'page',
      title: 'Teachers',
      description: 'Manage teachers',
      route: '/teacher',
      icon:
        '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21.42 10.922a1 1 0 0 0-.019-1.838L12.83 5.18a2 2 0 0 0-1.66 0L2.6 9.08a1 1 0 0 0 0 1.832l8.57 3.908a2 2 0 0 0 1.66 0z"/><path d="M22 10v6"/><path d="M6 12.5V16a6 3 0 0 0 12 0v-3.5"/></svg>',
    },
    {
      type: 'page',
      title: 'Connections',
      description: 'Manage student-teacher connections',
      route: '/connections',
      icon: '<span class="material-symbols-outlined">link</span>',
    },
    {
      type: 'page',
      title: 'Relationship Map',
      description: 'View relationship map',
      route: '/relashion-map',
      icon:
        '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="6" y1="3" x2="6" y2="15"/><circle cx="18" cy="6" r="3"/><circle cx="6" cy="18" r="3"/><path d="M18 9a9 9 0 0 1-9 9"/></svg>',
    },
  ];

  constructor(
    private store: DataStoreService,
    private connectionService: ConnectionService,
    private router: Router
  ) {}

  getAllPages(): SearchResult[] {
    return this.allPages;
  }

 
  search(query: string): SearchResult[] {
    if (!query) return this.getAllPages();

    const term = query.toLowerCase().trim();
    const results: SearchResult[] = [];

  
    this.allPages.forEach((page) => {
      if (
        page.title.toLowerCase().includes(term) ||
        page.description.toLowerCase().includes(term)
      ) {
        const highlightedPage = { ...page };
        highlightedPage.highlightedTitle = this.highlightText(page.title, term);
        highlightedPage.highlightedDescription = this.highlightText(
          page.description,
          term
        );
        results.push(highlightedPage);
      }
    });

  
    this.store.getStudents().forEach((student: any) => {
      const sName = (student.name ?? '').toLowerCase();
      const sEmail = (student.email ?? '').toLowerCase();
      const sGrade = (student.grade ?? '').toLowerCase();
      const sPhone = (student.phone ?? '').toLowerCase();

      const match =
        sName.includes(term) ||
        sEmail.includes(term) ||
        sGrade.includes(term) ||
        sPhone.includes(term);

      if (match) {
        const desc = `Student • ${student.grade ?? '—'} • ${student.email ?? ''}`;
        const r: SearchResult = {
          type: 'student',
          id: student.id,
          title: student.name,
          description: desc,
          route: '/student',
          icon:
            '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>',
        };
        r.highlightedTitle = this.highlightText(r.title, term);
        r.highlightedDescription = this.highlightText(r.description, term);
        results.push(r);
      }
    });

  
    this.store.getTeachers().forEach((teacher: any) => {
      const tName = (teacher.name ?? '').toLowerCase();
      const tEmail = (teacher.email ?? '').toLowerCase();
      const tSubject = (teacher.subject ?? '').toLowerCase();
      const tPhone = (teacher.phone ?? '').toLowerCase();

      const match =
        tName.includes(term) ||
        tEmail.includes(term) ||
        tSubject.includes(term) ||
        tPhone.includes(term);

      if (match) {
        const desc = `Teacher • ${teacher.subject ?? '—'} • ${teacher.email ?? ''}`;
        const r: SearchResult = {
          type: 'teacher',
          id: teacher.id,
          title: teacher.name,
          description: desc,
          route: '/teacher',
          icon:
            '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21.42 10.922a1 1 0 0 0-.019-1.838L12.83 5.18a2 2 0 0 0-1.66 0L2.6 9.08a1 1 0 0 0 0 1.832l8.57 3.908a2 2 0 0 0 1.66 0z"/><path d="M22 10v6"/><path d="M6 12.5V16a6 3 0 0 0 12 0v-3.5"/></svg>',
        };
        r.highlightedTitle = this.highlightText(r.title, term);
        r.highlightedDescription = this.highlightText(r.description, term);
        results.push(r);
      }
    });

    // Connections
    const maybe = this.connectionService.getAllConnections() as
      | Connection[]
      | Observable<Connection[]>;

    const handleConnections = (connections: Connection[]) => {
      const students = this.store.getStudents();
      const teachers = this.store.getTeachers();

      connections.forEach((c) => {
        const sid = (c.studentId ?? (c as any).student_id) as number | undefined;
        const tid = (c.teacherId ?? (c as any).teacher_id) as number | undefined;
        if (sid == null || tid == null) return;

        const student: any = students.find((s: any) => s.id === sid);
        const teacher: any = teachers.find((t: any) => t.id === tid);
        if (!student || !teacher) return;

        const studentMatch =
          (student.name ?? '').toLowerCase().includes(term) ||
          (student.email ?? '').toLowerCase().includes(term) ||
          (student.grade ?? '').toLowerCase().includes(term);

        const teacherMatch =
          (teacher.name ?? '').toLowerCase().includes(term) ||
          (teacher.email ?? '').toLowerCase().includes(term) ||
          (teacher.subject ?? '').toLowerCase().includes(term);

        if (studentMatch || teacherMatch) {
          const title = `${student.name} ↔ ${teacher.name}`;
          const description = `Connection • ${(teacher.subject ?? teacher.email ?? '')}`;
          const r: SearchResult = {
            type: 'connection',
            id: c.id,
            title,
            description,
            route: '/connections',
            icon: '<span class="material-symbols-outlined">link</span>',
          };
          r.highlightedTitle = this.highlightText(title, term);
          r.highlightedDescription = this.highlightText(description, term);
          results.push(r);
        }
      });
    };

    if (Array.isArray(maybe)) {
      handleConnections(maybe);
    } else if (maybe && isObservable(maybe)) {
      (maybe as Observable<Connection[]>).pipe(take(1)).subscribe(handleConnections);
    }

    return results;
  }

  private highlightText(text: string, term: string): string {
    if (!term) return text;
    const regex = new RegExp(`(${term})`, 'gi');
    return text.replace(regex, '<mark class="bg-yellow-200">$1</mark>');
  }

  navigateToResult(result: SearchResult): void {
    this.router.navigate([result.route]);
  }
}

