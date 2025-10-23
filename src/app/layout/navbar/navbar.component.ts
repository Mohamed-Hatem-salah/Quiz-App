import { Component, OnInit, ElementRef, ViewChild, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';   // ✅ add this
import { ActivityService } from '../../activity.service';
import { SearchService, SearchResult } from '../../search.service';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css'],
})
export class NavbarComponent implements OnInit {
  notificationCount = 0;
  searchTerm = '';
  searchResults: SearchResult[] = [];
  showSearchResults = false;
  isSearchFocused = false;

  // ✅ fix for missing property
  showTypingIndicator = false;

  @ViewChild('searchInput') searchInput!: ElementRef;
  @ViewChild('searchResultsContainer') searchResultsContainer!: ElementRef;

  constructor(
    private activityService: ActivityService,
    private searchService: SearchService,
    private sanitizer: DomSanitizer   // ✅ inject sanitizer
  ) {}

  ngOnInit(): void {
    this.notificationCount = this.activityService.getNotificationCount();
    this.activityService.notificationCount$.subscribe((count) => {
      this.notificationCount = count;
    });
  }

  clearNotifications(): void {
    this.activityService.clearNotifications();
  }

  onSearchChange(): void {
    // ✅ simulate typing indicator while searching
    this.showTypingIndicator = true;

    setTimeout(() => {
      this.searchResults = this.searchService.search(this.searchTerm);
      this.showSearchResults = this.isSearchFocused && this.searchResults.length > 0;
      this.showTypingIndicator = false;
    }, 300); // delay for smoother effect
  }

  onSearchFocus(): void {
    this.isSearchFocused = true;
    this.searchResults = this.searchService.search(this.searchTerm);
    this.showSearchResults = this.searchResults.length > 0;
  }

  onSearchBlur(): void {
    setTimeout(() => {
      if (!this.isMouseOverResults()) {
        this.isSearchFocused = false;
        this.showSearchResults = false;
      }
    }, 200);
  }

  isMouseOverResults(): boolean {
    return this.searchResultsContainer?.nativeElement?.matches(':hover') || false;
  }

  selectResult(result: SearchResult): void {
    this.searchService.navigateToResult(result);
    this.searchTerm = '';
    this.searchResults = [];
    this.showSearchResults = false;
    this.isSearchFocused = false;
  }

  clearSearch(): void {
    this.searchTerm = '';
    this.searchResults = [];
    this.showSearchResults = false;
  }

  // ✅ fix for sanitizeHtml usage in template
  sanitizeHtml(html: string): SafeHtml {
    return this.sanitizer.bypassSecurityTrustHtml(html);
  }

  @HostListener('document:click', ['$event'])
  onClickOutside(event: Event): void {
    if (this.showSearchResults && 
        !this.searchInput.nativeElement.contains(event.target) &&
        !this.searchResultsContainer.nativeElement.contains(event.target)) {
      this.showSearchResults = false;
      this.isSearchFocused = false;
    }
  }
}
