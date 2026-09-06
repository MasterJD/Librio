import { Component, OnInit, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { CatalogService, Book } from '../../../core/services/catalog.service';
import { CartService } from '../../../core/services/cart.service';
import { AuthService } from '../../../core/services/auth.service';
import { LoadingSpinnerComponent } from '../../../shared/components/loading-spinner/loading-spinner.component';

@Component({
  selector: 'app-book-detail',
  standalone: true,
  imports: [MatCardModule, MatButtonModule, MatIconModule, MatChipsModule, MatSnackBarModule, LoadingSpinnerComponent],
  template: `
    @if (loading()) {
      <app-loading-spinner message="Loading book details..."></app-loading-spinner>
    } @else if (book()) {
      <div class="book-detail-container">
        <mat-card class="book-card">
          <mat-card-header>
            <mat-card-title>{{ book()!.title }}</mat-card-title>
            <mat-card-subtitle>by {{ book()!.author }}</mat-card-subtitle>
          </mat-card-header>
          <mat-card-content>
            <div class="info-row">
              <mat-chip-set>
                <mat-chip>{{ book()!.genre }}</mat-chip>
              </mat-chip-set>
              <span class="isbn">ISBN: {{ book()!.isbn }}</span>
            </div>

            <p class="description">{{ book()!.description }}</p>

            <div class="availability">
              @if (book()!.availableCopies > 0) {
                <span class="available">
                  <mat-icon>check_circle</mat-icon>
                  Available ({{ book()!.availableCopies }} of {{ book()!.totalCopies }} copies)
                </span>
              } @else {
                <span class="unavailable">
                  <mat-icon>cancel</mat-icon>
                  Currently Unavailable
                </span>
              }
            </div>

            <div class="price-section">
              <span class="price">\${{ book()!.price }}</span>
            </div>
          </mat-card-content>
          <mat-card-actions>
            @if (auth.isAuthenticated() && book()!.availableCopies > 0) {
              <button mat-raised-button color="primary" (click)="rentBook()">
                <mat-icon>library_add</mat-icon> Rent (14 days)
              </button>
              <button mat-raised-button color="accent" (click)="buyBook()">
                <mat-icon>shopping_cart</mat-icon> Buy
              </button>
            } @else if (!auth.isAuthenticated()) {
              <a mat-raised-button color="primary" routerLink="/auth/login">Login to Rent/Buy</a>
            }
            <button mat-button routerLink="/catalog">
              <mat-icon>arrow_back</mat-icon> Back to Catalog
            </button>
          </mat-card-actions>
        </mat-card>
      </div>
    }
  `,
  styles: [`
    .book-detail-container {
      padding: 24px;
      max-width: 800px;
      margin: 0 auto;
    }
    .book-card {
      padding: 16px;
    }
    .info-row {
      display: flex;
      align-items: center;
      gap: 16px;
      margin: 16px 0;
    }
    .isbn {
      color: var(--mat-sys-on-surface-variant);
    }
    .description {
      font-size: 16px;
      line-height: 1.6;
      margin: 16px 0;
    }
    .availability {
      margin: 16px 0;
    }
    .available {
      display: flex;
      align-items: center;
      gap: 8px;
      color: #4caf50;
      font-weight: 500;
    }
    .unavailable {
      display: flex;
      align-items: center;
      gap: 8px;
      color: #f44336;
      font-weight: 500;
    }
    .price-section {
      margin: 24px 0;
    }
    .price {
      font-size: 2rem;
      font-weight: bold;
      color: var(--mat-sys-primary);
    }
    mat-card-actions {
      display: flex;
      gap: 8px;
      flex-wrap: wrap;
    }
  `],
})
export class BookDetailComponent implements OnInit {
  book = signal<Book | null>(null);
  loading = signal(true);

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private catalogService: CatalogService,
    private cartService: CartService,
    public auth: AuthService,
    private snackBar: MatSnackBar,
  ) {}

  ngOnInit() {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    this.catalogService.getBook(id).subscribe({
      next: (book) => {
        this.book.set(book);
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
        this.snackBar.open('Book not found', 'Close', { duration: 3000 });
        this.router.navigate(['/catalog']);
      },
    });
  }

  rentBook() {
    if (!this.book()) return;
    this.cartService.addItem(this.book()!, 'rent', 14);
    this.snackBar.open('Added to cart!', 'Close', { duration: 2000 });
  }

  buyBook() {
    if (!this.book()) return;
    this.cartService.addItem(this.book()!, 'buy');
    this.snackBar.open('Added to cart!', 'Close', { duration: 2000 });
  }
}
