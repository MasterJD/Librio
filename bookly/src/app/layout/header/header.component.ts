import { Component } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatBadgeModule } from '@angular/material/badge';
import { AuthService } from '../../core/services/auth.service';
import { CartService } from '../../core/services/cart.service';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [RouterLink, RouterLinkActive, MatToolbarModule, MatButtonModule, MatIconModule, MatMenuModule, MatBadgeModule],
  template: `
    <mat-toolbar color="primary" class="header">
      <a routerLink="/" class="logo">
        <mat-icon>menu_book</mat-icon>
        <span>Bookly</span>
      </a>

      <nav class="nav-links">
        <a mat-button routerLink="/catalog" routerLinkActive="active">Catalog</a>
        @if (auth.isAuthenticated()) {
          <a mat-button routerLink="/library" routerLinkActive="active">My Library</a>
          <a mat-button routerLink="/cart" routerLinkActive="active">
            <mat-icon [matBadge]="cart.itemCount()" [matBadgeHidden]="cart.itemCount() === 0" matBadgeColor="accent">
              shopping_cart
            </mat-icon>
            Cart
          </a>
        }
      </nav>

      <span class="spacer"></span>

      @if (auth.isAuthenticated()) {
        <button mat-button [matMenuTriggerFor]="userMenu">
          <mat-icon>account_circle</mat-icon>
          {{ auth.currentUser()?.name }}
        </button>
        <mat-menu #userMenu="matMenu">
          <a mat-menu-item routerLink="/profile">
            <mat-icon>person</mat-icon> Profile
          </a>
          <button mat-menu-item (click)="auth.logout()">
            <mat-icon>logout</mat-icon> Logout
          </button>
        </mat-menu>
      } @else {
        <a mat-button routerLink="/auth/login">Login</a>
        <a mat-raised-button color="accent" routerLink="/auth/register">Register</a>
      }
    </mat-toolbar>
  `,
  styles: [`
    .header {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      z-index: 1000;
    }
    .logo {
      display: flex;
      align-items: center;
      gap: 8px;
      text-decoration: none;
      color: white;
      font-size: 1.25rem;
      font-weight: 500;
    }
    .nav-links {
      display: flex;
      gap: 4px;
      margin-left: 24px;
    }
    .nav-links a.active {
      background: rgba(255,255,255,0.1);
    }
    .spacer {
      flex: 1;
    }
  `],
})
export class HeaderComponent {
  constructor(public auth: AuthService, public cart: CartService) {}
}
