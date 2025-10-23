import { Component } from '@angular/core';
import { HeaderComponent } from '../header/header.component';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-layout-teacher',
  imports: [HeaderComponent, RouterOutlet],
  templateUrl: './layout-teacher.component.html',
  styleUrl: './layout-teacher.component.css'
})
export class LayoutTeacherComponent {

}
