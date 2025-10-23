import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GradingQuizComponent } from './grading-quiz.component';

describe('GradingQuizComponent', () => {
  let component: GradingQuizComponent;
  let fixture: ComponentFixture<GradingQuizComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GradingQuizComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(GradingQuizComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
