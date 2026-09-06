import { Component, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { CatalogService, Book } from '../../../core/services/catalog.service';
import { BookCardComponent } from '../../../shared/components/book-card/book-card.component';
import { LoadingSpinnerComponent } from '../../../shared/components/loading-spinner/loading-spinner.component';

@Component({
  selector: 'app-catalog-list',
  standalone: true,
  imports: [FormsModule, MatInputModule, MatButtonModule, MatIconModule, MatFormFieldModule, MatSelectModule, BookCardComponent, LoadingSpinnerComponent],
  template: `
    <div class="catalog-container">
      <h1>Book Catalog</h1>

      <div class="search-bar">
        <mat-form-field appearance="outline" class="search-field">
          <mat-label>Search books</mat-label>
          <input matInput [(ngModel)]="searchQuery" (keyup.enter)="search()" placeholder="Search by title...">
          <button matSuffix mat-icon-button (click)="search()">
            <mat-icon>search</mat-icon>
          </button>
        </mat-form-field>

        <mat-form-field appearance="outline" class="genre-field">
          <mat-label>Genre</mat-label>
          <mat-select [(ngModel)]="selectedGenre" (selectionChange)="search()">
            <mat-option value="">All Genres</mat-option>
            <mat-option value="science-fiction">Science Fiction</mat-option>
            <mat-option value="programming">Programming</mat-option>
            <mat-option value="fantasy">Fantasy</mat-option>
            <mat-option value="classic">Classic</mat-option>
          </mat-select>
        </mat-form-field>
      </div>

      @if (loading()) {
        <app-loading-spinner message="Loading books..."></app-loading-spinner>
      } @else if (books().length === 0) {
        <div class="empty-state">
          <mat-icon>library_books</mat-icon>
          <p>No books found</p>
        </div>
      } @else {
        <div class="book-grid">
          @for (book of books(); track book.id) {
            <app-book-card [book]="book"></app-book-card>
          }
        </div>
      }
    </div>
  `,
  styles: [`
    .catalog-container {
      padding: 24px;
      max-width: 1200px;
      margin: 0 auto;
    }
    h1 {
      margin-bottom: 24px;
    }
    .search-bar {
      display: flex;
      gap: 16px;
      margin-bottom: 24px;
    }
    .search-field {
      flex: 1;
    }
    .genre-field {
      width: 200px;
    }
    .book-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
      gap: 24px;
    }
    .empty-state {
      text-align: center;
      padding: 48px;
      color: var(--mat-sys-on-surface-variant);
    }
    .empty-state mat-icon {
      font-size: 64px;
      width: 64px;
      height: 64px;
    }
  `],
})
export class CatalogListComponent implements OnInit {
  books = signal<Book[]>([]);
  loading = signal(true);
  searchQuery = '';
  selectedGenre = '';

  constructor(private catalogService: CatalogService) {}

  ngOnInit() {
    this.search();
  }

  search() {
    this.loading.set(true);
    this.catalogService.searchBooks(this.searchQuery || undefined, this.selectedGenre || undefined).subscribe({
      next: (books) => {
        this.books.set(books);
        this.loading.set(false);
      },
      error: () => {
        this.books.set([]);
        this.loading.set(false);
      },
    });
  }
}
