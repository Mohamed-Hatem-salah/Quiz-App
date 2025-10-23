import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ConnectStudentsComponent } from './connect-students.component';

describe('ConnectStudentsComponent', () => {
  let component: ConnectStudentsComponent;
  let fixture: ComponentFixture<ConnectStudentsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ConnectStudentsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ConnectStudentsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
