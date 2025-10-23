import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { Location } from '@angular/common';
import { HlmButton } from '@spartan-ng/helm/button';
import { HlmInput } from '@spartan-ng/helm/input';
import { QuizDataService, Quiz } from '../../quiz.service';
import { ActivityService } from '../../../activity.service';
import { toast } from 'ngx-sonner';

export interface StudentAttendance {
  id: string;
  studentId: string;
  studentName: string;
  studentEmail: string;
  quizId: string;
  quizTitle: string;
  startedAt: Date;
  submittedAt: Date;
  timeSpent: number; // in minutes
  totalGrade: number;
  status: 'not-started' | 'in-progress' | 'completed' | 'graded';
  answers: { [questionId: string]: string };
  teacherNotes?: string;
}
@Component({
  selector: 'app-student-to-teacher',
  imports: [CommonModule, FormsModule, HlmButton, HlmInput],
  templateUrl: './student-to-teacher.component.html',
  styleUrl: './student-to-teacher.component.css',
})
export class StudentToTeacherComponent implements OnInit {
  attendances: StudentAttendance[] = [];
  filteredAttendances: StudentAttendance[] = [];
  quizzes: Quiz[] = [];
  searchTerm = '';
  selectedQuizId = '';
  selectedStatus = '';
  currentPage = 1;
  itemsPerPage = 10;
  statusOptions = ['not-started', 'in-progress', 'completed', 'graded'];

  // For teacher notes modal
  showNotesModal = false;
  currentAttendance: StudentAttendance | null = null;
  teacherNotes = '';

  constructor(
    private quizService: QuizDataService,
    private activityService: ActivityService,
    private router: Router,
    private location: Location
  ) {}

  ngOnInit(): void {
    this.loadQuizzes();
    this.loadAttendanceData();
  }

  private loadQuizzes(): void {
    this.quizzes = this.quizService.getQuizzes('teacher');
  }

  private loadAttendanceData(): void {
    const saved = localStorage.getItem('studentAttendances');
    if (saved) {
      this.attendances = JSON.parse(saved).map((att: any) => ({
        ...att,
        startedAt: new Date(att.startedAt),
        submittedAt: new Date(att.submittedAt),
      }));
    } else {
      // Generate realistic sample data if none exists
      this.generateSampleAttendances();
    }
    this.filteredAttendances = [...this.attendances];
  }

  private generateSampleAttendances(): void {
    const students = [
      {
        id: 'stu1',
        name: 'Emma Johnson',
        email: 'emma.johnson@university.edu',
      },
      { id: 'stu2', name: 'Noah Smith', email: 'noah.smith@university.edu' },
      {
        id: 'stu3',
        name: 'Olivia Williams',
        email: 'olivia.williams@university.edu',
      },
      { id: 'stu4', name: 'Liam Brown', email: 'liam.brown@university.edu' },
      { id: 'stu5', name: 'Ava Jones', email: 'ava.jones@university.edu' },
      {
        id: 'stu6',
        name: 'Sophia Davis',
        email: 'sophia.davis@university.edu',
      },
      {
        id: 'stu7',
        name: 'William Wilson',
        email: 'william.wilson@university.edu',
      },
      {
        id: 'stu8',
        name: 'Isabella Garcia',
        email: 'isabella.garcia@university.edu',
      },
      {
        id: 'stu9',
        name: 'James Martinez',
        email: 'james.martinez@university.edu',
      },
      {
        id: 'stu10',
        name: 'Charlotte Rodriguez',
        email: 'charlotte.rodriguez@university.edu',
      },
      {
        id: 'stu11',
        name: 'Benjamin Anderson',
        email: 'benjamin.anderson@university.edu',
      },
      {
        id: 'stu12',
        name: 'Amelia Taylor',
        email: 'amelia.taylor@university.edu',
      },
    ];

    const statusWeights = [
      { status: 'graded', weight: 0.4 },
      { status: 'completed', weight: 0.3 },
      { status: 'in-progress', weight: 0.2 },
      { status: 'not-started', weight: 0.1 },
    ];

    this.attendances = [];

    this.quizzes.forEach((quiz) => {
      students.forEach((student, index) => {
        // Not all students take all quizzes - some variation
        if (Math.random() > 0.15) {
          const status = this.getWeightedRandomStatus(statusWeights) as
            | 'not-started'
            | 'in-progress'
            | 'completed'
            | 'graded';

          // Generate realistic start times (within last 30 days)
          const startedAt = new Date();
          const daysAgo = Math.floor(Math.random() * 30);
          startedAt.setDate(startedAt.getDate() - daysAgo);

          // Set realistic hours (8 AM to 6 PM)
          const hour = 8 + Math.floor(Math.random() * 10);
          startedAt.setHours(hour, Math.floor(Math.random() * 60), 0, 0);

          const submittedAt = new Date(startedAt);
          const timeSpent = 10 + Math.floor(Math.random() * 50); // 10-60 minutes
          submittedAt.setMinutes(submittedAt.getMinutes() + timeSpent);

          // Generate realistic grades based on status
          let totalGrade: number;
          if (status === 'graded') {
            // More realistic grade distribution
            const gradeRandom = Math.random();
            if (gradeRandom < 0.1)
              totalGrade = 95 + Math.floor(Math.random() * 5); // 95-100 (A+)
            else if (gradeRandom < 0.3)
              totalGrade = 85 + Math.floor(Math.random() * 10); // 85-94 (A)
            else if (gradeRandom < 0.6)
              totalGrade = 75 + Math.floor(Math.random() * 10); // 75-84 (B)
            else if (gradeRandom < 0.8)
              totalGrade = 65 + Math.floor(Math.random() * 10); // 65-74 (C)
            else if (gradeRandom < 0.95)
              totalGrade = 55 + Math.floor(Math.random() * 10); // 55-64 (D)
            else totalGrade = 40 + Math.floor(Math.random() * 15); // 40-54 (F)
          } else if (status === 'completed') {
            totalGrade = 0; // Completed but not graded yet
          } else {
            totalGrade = NaN; // Not completed
          }

          // Generate realistic teacher notes for some students
          const teacherNotes = this.generateTeacherNotes(
            totalGrade,
            student.name
          );

          const attendance: StudentAttendance = {
            id: `att${this.attendances.length + 1}`,
            studentId: student.id,
            studentName: student.name,
            studentEmail: student.email,
            quizId: quiz.id,
            quizTitle: quiz.title,
            startedAt,
            submittedAt,
            timeSpent,
            totalGrade,
            status,
            answers: {},
            teacherNotes,
          };

          this.attendances.push(attendance);
        }
      });
    });

    this.persistAttendances();
  }

  private generateTeacherNotes(
    grade: number,
    studentName: string
  ): string | undefined {
    if (Math.random() > 0.6) {
      // 40% chance of having notes
      const notes = [
        'Excellent work! Shows strong understanding of the material.',
        'Good effort overall. Consider reviewing the concepts covered in chapters 3-5.',
        'Well done! Keep up the great work.',
        'Needs improvement on essay questions. Focus on providing more detailed explanations.',
        'Good understanding of basic concepts. Work on applying knowledge to practical scenarios.',
        'Outstanding performance! Demonstrates mastery of the subject matter.',
        'Satisfactory work. Consider spending more time on practice problems.',
        'Good progress! Continue to engage with the material actively.',
        'Needs to review fundamental concepts. Consider attending office hours.',
        'Excellent analytical skills demonstrated in problem-solving sections.',
      ];

      return notes[Math.floor(Math.random() * notes.length)];
    }
    return undefined;
  }

  private getWeightedRandomStatus(
    weights: { status: string; weight: number }[]
  ): string {
    const total = weights.reduce((sum, item) => sum + item.weight, 0);
    const random = Math.random() * total;

    let current = 0;
    for (const item of weights) {
      current += item.weight;
      if (random <= current) {
        return item.status;
      }
    }

    return weights[0].status;
  }

  filterAttendances(): void {
    this.filteredAttendances = this.attendances.filter((attendance) => {
      const matchesSearch =
        attendance.studentName
          .toLowerCase()
          .includes(this.searchTerm.toLowerCase()) ||
        attendance.studentEmail
          .toLowerCase()
          .includes(this.searchTerm.toLowerCase());
      const matchesQuiz = this.selectedQuizId
        ? attendance.quizId === this.selectedQuizId
        : true;
      const matchesStatus = this.selectedStatus
        ? attendance.status === this.selectedStatus
        : true;

      return matchesSearch && matchesQuiz && matchesStatus;
    });

    this.currentPage = 1;
  }

  filterByQuiz(): void {
    this.filterAttendances();
  }

  filterByStatus(): void {
    this.filterAttendances();
  }

  getQuizTitle(quizId: string): string {
    const quiz = this.quizzes.find((q) => q.id === quizId);
    return quiz ? quiz.title : 'Unknown Quiz';
  }

  viewDetails(attendance: StudentAttendance): void {
    if (attendance.status === 'completed' || attendance.status === 'graded') {
      this.router.navigate(['grading-quiz', attendance.quizId], {
        queryParams: {
          studentId: attendance.studentId,
          attendanceId: attendance.id,
        },
      });
    } else {
      toast.info('This quiz has not been completed yet and cannot be graded.');
    }
  }

  addTeacherNotes(attendance: StudentAttendance): void {
    this.currentAttendance = { ...attendance };
    this.teacherNotes = attendance.teacherNotes || '';
    this.showNotesModal = true;
  }

  saveTeacherNotes(): void {
    if (this.currentAttendance) {
      const index = this.attendances.findIndex(
        (a) => a.id === this.currentAttendance!.id
      );
      if (index !== -1) {
        this.attendances[index].teacherNotes = this.teacherNotes;
        this.persistAttendances();
        this.filterAttendances();

        toast.success('Teacher notes saved successfully!');
        this.activityService.addActivity(
          'teacher',
          'Added Notes',
          `Added notes for ${
            this.currentAttendance.studentName
          }'s ${this.getQuizTitle(this.currentAttendance.quizId)} quiz`
        );
      }
    }
    this.closeNotesModal();
  }

  closeNotesModal(): void {
    this.showNotesModal = false;
    this.currentAttendance = null;
    this.teacherNotes = '';
  }

  exportToCSV(): void {
    const headers = [
      'Student Name',
      'Student Email',
      'Quiz Title',
      'Started At',
      'Submitted At',
      'Time Spent (min)',
      'Grade',
      'Status',
      'Teacher Notes',
    ];
    const csvData = this.filteredAttendances.map((att) => [
      att.studentName,
      att.studentEmail,
      att.quizTitle,
      att.startedAt.toLocaleString(),
      att.submittedAt.toLocaleString(),
      att.timeSpent,
      att.totalGrade || 'N/A',
      att.status,
      att.teacherNotes || '',
    ]);

    const csvContent = [headers, ...csvData]
      .map((row) => row.map((field) => `"${field}"`).join(','))
      .join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `quiz-attendance-${
      new Date().toISOString().split('T')[0]
    }.csv`;
    link.click();
    window.URL.revokeObjectURL(url);

    toast.success('Attendance data exported to CSV!');
    this.activityService.addActivity(
      'teacher',
      'Exported Data',
      'Exported attendance data to CSV'
    );
  }

  nextPage(): void {
    if (
      this.currentPage * this.itemsPerPage <
      this.filteredAttendances.length
    ) {
      this.currentPage++;
    }
  }

  previousPage(): void {
    if (this.currentPage > 1) {
      this.currentPage--;
    }
  }

  get paginatedAttendances(): StudentAttendance[] {
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    return this.filteredAttendances.slice(
      startIndex,
      startIndex + this.itemsPerPage
    );
  }

  get totalPages(): number {
    return Math.ceil(this.filteredAttendances.length / this.itemsPerPage);
  }

  goBack(): void {
    this.location.back();
  }

  private persistAttendances(): void {
    localStorage.setItem(
      'studentAttendances',
      JSON.stringify(this.attendances)
    );
  }
}
