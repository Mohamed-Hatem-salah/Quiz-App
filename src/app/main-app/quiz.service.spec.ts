import { TestBed } from '@angular/core/testing';

import { QuizDataService } from './quiz.service';

describe('QuizService', () => {
  let service: QuizDataService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(QuizDataService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
