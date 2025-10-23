import { Component } from '@angular/core';
import { NavbarComponent } from './navbar/navbar.component';
import { SidebarComponent } from './sidebar/sidebar.component';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-layout',
  imports: [NavbarComponent, SidebarComponent, RouterModule],
  standalone: true,
  templateUrl: './layout.component.html',
  styleUrl: './layout.component.css',
})
export class LayoutComponent {}
