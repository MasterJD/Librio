import { Component, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { CartService } from '../../../core/services/cart.service';
import { TransactionService } from '../../../core/services/transaction.service';

@Component({
  selector: 'app-cart-view',
  standalone: true,
  imports: [RouterLink, MatCardModule, MatButtonModule, MatIconModule, MatListModule, MatSnackBarModule],
  template: `
    <div class="cart-container">
      <h1>Shopping Cart</h1>

      @if (cart.itemCount() === 0) {
        <div class="empty-state">
          <mat-icon>shopping_cart</mat-icon>
          <p>Your cart is empty</p>
          <a mat-raised-button color="primary" routerLink="/catalog">Browse Catalog</a>
        </div>
      } @else {
        <mat-card>
          <mat-card-content>
            <mat-list>
              @for (item of cart.items(); track item.book.id) {
                <mat-list-item>
                  <mat-icon matListItemIcon>
                    {{ item.type === 'rent' ? 'library_add' : 'shopping_cart' }}
                  </mat-icon>
                  <div matListItemTitle>{{ item.book.title }}</div>
                  <div matListItemLine>
                    {{ item.type === 'rent' ? 'Rental' : 'Purchase' }}
                    @if (item.durationDays) {
                      ({{ item.durationDays }} days)
                    }
                  </div>
                  <div matListItemMeta>
                    <span class="item-price">
                      {{ item.type === 'buy' ? '$' + item.book.price : '$' + (parseFloat(item.book.price) * 0.3 * (item.durationDays || 14) / 14).toFixed(2) }}
                    </span>
                    <button mat-icon-button color="warn" (click)="removeItem(item.book.id, item.type)">
                      <mat-icon>delete</mat-icon>
                    </button>
                  </div>
                </mat-list-item>
              }
            </mat-list>
          </mat-card-content>
          <mat-card-actions>
            <span class="total">Total: \${{ cart.total().toFixed(2) }}</span>
            <button mat-raised-button color="primary" (click)="checkout()" [disabled]="processing()">
              {{ processing() ? 'Processing...' : 'Checkout' }}
            </button>
            <button mat-button (click)="cart.clear()">Clear Cart</button>
          </mat-card-actions>
        </mat-card>
      }
    </div>
  `,
  styles: [`
    .cart-container {
      padding: 24px;
      max-width: 800px;
      margin: 0 auto;
    }
    h1 { margin-bottom: 24px; }
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
    .item-price {
      font-weight: 500;
      margin-right: 8px;
    }
    mat-card-actions {
      display: flex;
      align-items: center;
      gap: 16px;
      padding: 16px;
    }
    .total {
      font-size: 1.25rem;
      font-weight: bold;
      flex: 1;
    }
  `],
})
export class CartViewComponent {
  processing = signal(false);

  constructor(
    public cart: CartService,
    private transactionService: TransactionService,
    private router: Router,
    private snackBar: MatSnackBar,
  ) {}

  removeItem(bookId: number, type: 'rent' | 'buy') {
    this.cart.removeItem(bookId, type);
  }

  parseFloat(value: string): number {
    return parseFloat(value);
  }

  checkout() {
    this.processing.set(true);
    const items = this.cart.items();

    let completed = 0;
    const total = items.length;

    items.forEach((item) => {
      if (item.type === 'rent') {
        this.transactionService.createRental(item.book.id, item.durationDays!).subscribe({
          next: () => this.onCheckoutItemComplete(completed++, total),
          error: (err: any) => this.onCheckoutError(err),
        });
      } else {
        this.transactionService.purchaseBook(item.book.id).subscribe({
          next: () => this.onCheckoutItemComplete(completed++, total),
          error: (err: any) => this.onCheckoutError(err),
        });
      }
    });
  }

  private onCheckoutItemComplete(completed: number, total: number) {
    completed++;
    if (completed === total) {
      this.cart.clear();
      this.processing.set(false);
      this.snackBar.open('Checkout complete!', 'Close', { duration: 3000 });
      this.router.navigate(['/library']);
    }
  }

  private onCheckoutError(err: any) {
    this.processing.set(false);
    this.snackBar.open(err.error?.message || 'Checkout failed', 'Close', { duration: 3000 });
  }
}
