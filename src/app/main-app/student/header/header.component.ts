import { Component, OnInit } from '@angular/core';
import {
  Router,
  ActivatedRoute,
  NavigationEnd,
  RouterLink,
  RouterLinkActive,
} from '@angular/router';

import { filter } from 'rxjs/operators';

import {
  BrnPopover,
  BrnPopoverContent,
  BrnPopoverTrigger,
} from '@spartan-ng/brain/popover';
import { HlmButton } from '@spartan-ng/helm/button';
import { HlmPopoverContent } from '@spartan-ng/helm/popover';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [
    HlmPopoverContent,
    RouterLink,
    RouterLinkActive,
    BrnPopover,
    BrnPopoverContent,
    BrnPopoverTrigger,
    HlmButton,
  ],
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css'],
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
    let child = route;

    // ✅ go down to the deepest child route (works with layouts)
    while (child.firstChild) {
      child = child.firstChild;
    }

    const fullTitle = child.snapshot.data['title'];

    if (fullTitle) {
      // ✅ split BEFORE the dash and take only the first part
      this.pageTitle = fullTitle.split('-')[0].trim();
    } else {
      this.pageTitle = 'QuizMaster';
    }
  }

 
}
