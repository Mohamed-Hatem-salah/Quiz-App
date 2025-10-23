import { Component, OnInit } from '@angular/core';
import {
  Router,
  ActivatedRoute,
  NavigationEnd,
  RouterLink,
  RouterLinkActive,
} from '@angular/router';

import { filter } from 'rxjs/operators';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [RouterLink, RouterLinkActive],
  templateUrl: './header.component.html',
  styleUrl: './header.component.css',
})
export class HeaderComponent implements OnInit {
  pageTitle = 'QuizMaster';

  constructor(
    
    private router: Router,
    private activatedRoute: ActivatedRoute
  ) {}

  ngOnInit() {
    // ✅ run once immediately
    this.updateTitle(this.activatedRoute);

    // ✅ run again on every navigation
    this.router.events
      .pipe(filter((event) => event instanceof NavigationEnd))
      .subscribe(() => {
        this.updateTitle(this.activatedRoute);
      });
  }

  private updateTitle(route: ActivatedRoute) {
    let child = route.firstChild;
    while (child?.firstChild) {
      child = child.firstChild;
    }

    const fullTitle = child?.snapshot.data['title'];
    if (fullTitle) {
      // ✅ split before the dash "-" and take the first part
      this.pageTitle = fullTitle.split('-')[0].trim();
    } else {
      this.pageTitle = 'QuizMaster';
    }
  }
}
