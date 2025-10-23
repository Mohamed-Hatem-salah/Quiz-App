import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TeacherToStudentComponent } from './teacher-to-student.component';

describe('TeacherToStudentComponent', () => {
  let component: TeacherToStudentComponent;
  let fixture: ComponentFixture<TeacherToStudentComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TeacherToStudentComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TeacherToStudentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
