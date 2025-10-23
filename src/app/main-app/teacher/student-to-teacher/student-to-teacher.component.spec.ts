import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StudentToTeacherComponent } from './student-to-teacher.component';

describe('StudentToTeacherComponent', () => {
  let component: StudentToTeacherComponent;
  let fixture: ComponentFixture<StudentToTeacherComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [StudentToTeacherComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(StudentToTeacherComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
