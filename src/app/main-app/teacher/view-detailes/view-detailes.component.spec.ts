import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ViewDetailesComponent } from './view-detailes.component';

describe('ViewDetailesComponent', () => {
  let component: ViewDetailesComponent;
  let fixture: ComponentFixture<ViewDetailesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ViewDetailesComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ViewDetailesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
