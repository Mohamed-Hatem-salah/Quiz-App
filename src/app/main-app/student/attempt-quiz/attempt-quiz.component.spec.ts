import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AttemptQuizComponent } from './attempt-quiz.component';

describe('AttemptQuizComponent', () => {
  let component: AttemptQuizComponent;
  let fixture: ComponentFixture<AttemptQuizComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AttemptQuizComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AttemptQuizComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
