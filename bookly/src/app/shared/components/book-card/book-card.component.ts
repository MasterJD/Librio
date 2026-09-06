import { Component, Input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { SlicePipe } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatChipsModule } from '@angular/material/chips';
import { Book } from '../../../core/services/catalog.service';

@Component({
  selector: 'app-book-card',
  standalone: true,
  imports: [RouterLink, SlicePipe, MatCardModule, MatButtonModule, MatChipsModule],
  template: `
    <mat-card class="book-card">
      <mat-card-header>
        <mat-card-title>{{ book.title }}</mat-card-title>
        <mat-card-subtitle>{{ book.author }}</mat-card-subtitle>
      </mat-card-header>
      <mat-card-content>
        <p class="genre">{{ book.genre }}</p>
        <p class="description">{{ book.description | slice:0:100 }}{{ book.description.length > 100 ? '...' : '' }}</p>
        <div class="availability">
          @if (book.availableCopies > 0) {
            <span class="available">Available ({{ book.availableCopies }})</span>
          } @else {
            <span class="unavailable">Unavailable</span>
          }
        </div>
      </mat-card-content>
      <mat-card-actions>
        <span class="price">\${{ book.price }}</span>
        <a mat-raised-button color="primary" [routerLink]="['/catalog', book.id]">View Details</a>
      </mat-card-actions>
    </mat-card>
  `,
  styles: [`
    .book-card {
      height: 100%;
      display: flex;
      flex-direction: column;
    }
    .genre {
      color: var(--mat-sys-primary);
      font-weight: 500;
      margin: 8px 0 4px;
    }
    .description {
      color: var(--mat-sys-on-surface-variant);
      font-size: 14px;
      line-height: 1.4;
      margin: 8px 0;
    }
    .availability {
      margin: 8px 0;
    }
    .available {
      color: #4caf50;
      font-weight: 500;
    }
    .unavailable {
      color: #f44336;
      font-weight: 500;
    }
    mat-card-actions {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 16px;
    }
    .price {
      font-size: 1.25rem;
      font-weight: bold;
      color: var(--mat-sys-primary);
    }
  `],
})
export class BookCardComponent {
  @Input({ required: true }) book!: Book;
}
