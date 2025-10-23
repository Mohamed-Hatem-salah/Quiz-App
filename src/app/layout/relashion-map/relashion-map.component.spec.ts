import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RelashionMapComponent } from './relashion-map.component';

describe('RelashionMapComponent', () => {
  let component: RelashionMapComponent;
  let fixture: ComponentFixture<RelashionMapComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RelashionMapComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RelashionMapComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
