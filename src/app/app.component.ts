import { Component, OnInit } from '@angular/core';
import { Router, NavigationEnd, ActivatedRoute, RouterOutlet } from '@angular/router';
import { Title } from '@angular/platform-browser';
import { filter, map, mergeMap } from 'rxjs/operators';
import { HlmToaster } from '@spartan-ng/helm/sonner';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, HlmToaster],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css',
})
export class AppComponent implements OnInit {
  constructor(
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private titleService: Title
  ) {}

  ngOnInit() {
    this.router.events
      .pipe(
        filter(event => event instanceof NavigationEnd),
        map(() => {
          let route = this.activatedRoute.firstChild;
          while (route?.firstChild) {
            route = route.firstChild;
          }
          return route;
        }),
        mergeMap(route => route?.data ?? [])
      )
      .subscribe(data => {
        this.titleService.setTitle(data['title'] || 'Quiz Dashboard');
      });
  }
}
