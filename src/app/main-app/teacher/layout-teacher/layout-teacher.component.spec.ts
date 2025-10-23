import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LayoutTeacherComponent } from './layout-teacher.component';

describe('LayoutTeacherComponent', () => {
  let component: LayoutTeacherComponent;
  let fixture: ComponentFixture<LayoutTeacherComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LayoutTeacherComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(LayoutTeacherComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
