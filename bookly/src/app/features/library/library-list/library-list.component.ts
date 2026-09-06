import { Component, OnInit, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { DatePipe } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { TransactionService, LibraryEntry } from '../../../core/services/transaction.service';
import { LoadingSpinnerComponent } from '../../../shared/components/loading-spinner/loading-spinner.component';

@Component({
  selector: 'app-library-list',
  standalone: true,
  imports: [RouterLink, DatePipe, MatCardModule, MatButtonModule, MatIconModule, MatChipsModule, MatSnackBarModule, LoadingSpinnerComponent],
  template: `
    <div class="library-container">
      <h1>My Library</h1>

      @if (loading()) {
        <app-loading-spinner message="Loading your library..."></app-loading-spinner>
      } @else if (items().length === 0) {
        <div class="empty-state">
          <mat-icon>library_books</mat-icon>
          <p>Your library is empty</p>
          <a mat-raised-button color="primary" routerLink="/catalog">Browse Catalog</a>
        </div>
      } @else {
        <div class="library-grid">
          @for (item of items(); track item.id) {
            <mat-card class="library-item">
              <mat-card-header>
                <mat-card-title>{{ item.title }}</mat-card-title>
                <mat-card-subtitle>{{ item.author }}</mat-card-subtitle>
              </mat-card-header>
              <mat-card-content>
                <mat-chip-set>
                  <mat-chip [class]="item.type === 'RENTED' ? 'rented' : 'purchased'">
                    {{ item.type }}
                  </mat-chip>
                </mat-chip-set>
                @if (item.expiresAt) {
                  <p class="expires">Expires: {{ item.expiresAt | date:'medium' }}</p>
                }
              </mat-card-content>
              <mat-card-actions>
                @if (item.type === 'RENTED' && item.rentalId) {
                  <button mat-raised-button color="warn" (click)="returnBook(item.rentalId!)">
                    <mat-icon>assignment_return</mat-icon> Return
                  </button>
                }
                <button mat-raised-button color="primary" (click)="accessBook(item.id)">
                  <mat-icon>visibility</mat-icon> View
                </button>
              </mat-card-actions>
            </mat-card>
          }
        </div>
      }
    </div>
  `,
  styles: [`
    .library-container {
      padding: 24px;
      max-width: 1200px;
      margin: 0 auto;
    }
    h1 { margin-bottom: 24px; }
    .library-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
      gap: 24px;
    }
    .library-item {
      padding: 8px;
    }
    .expires {
      color: var(--mat-sys-on-surface-variant);
      font-size: 14px;
      margin-top: 8px;
    }
    .rented { background: #ff9800; color: white; }
    .purchased { background: #4caf50; color: white; }
    .empty-state {
      text-align: center;
      padding: 48px;
    }
    .empty-state mat-icon {
      font-size: 64px;
      width: 64px;
      height: 64px;
      color: var(--mat-sys-on-surface-variant);
    }
  `],
})
export class LibraryListComponent implements OnInit {
  items = signal<LibraryEntry[]>([]);
  loading = signal(true);

  constructor(
    private transactionService: TransactionService,
    private snackBar: MatSnackBar,
  ) {}

  ngOnInit() {
    this.transactionService.getMyLibrary().subscribe({
      next: (items) => {
        this.items.set(items);
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }

  returnBook(rentalId: number) {
    this.transactionService.returnBook(rentalId).subscribe({
      next: () => {
        this.snackBar.open('Book returned!', 'Close', { duration: 2000 });
        this.ngOnInit();
      },
      error: (err) => this.snackBar.open(err.error?.message || 'Return failed', 'Close', { duration: 3000 }),
    });
  }

  accessBook(bookId: number) {
    this.transactionService.getBookAccess(bookId).subscribe({
      next: (access) => {
        this.snackBar.open(`Access type: ${access.accessType}`, 'Close', { duration: 2000 });
      },
      error: () => this.snackBar.open('Access denied', 'Close', { duration: 3000 }),
    });
  }
}
