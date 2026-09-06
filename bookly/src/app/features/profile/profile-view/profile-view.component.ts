import { Component } from '@angular/core';
import { DatePipe } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-profile-view',
  standalone: true,
  imports: [DatePipe, MatCardModule, MatButtonModule, MatIconModule],
  template: `
    <div class="profile-container">
      <mat-card class="profile-card">
        <mat-card-header>
          <mat-card-title>My Profile</mat-card-title>
        </mat-card-header>
        <mat-card-content>
          @if (auth.currentUser(); as user) {
            <div class="profile-info">
              <mat-icon class="avatar">account_circle</mat-icon>
              <div class="details">
                <h2>{{ user.name }}</h2>
                <p>{{ user.email }}</p>
                <p class="member-since">Member since {{ user.createdAt | date:'mediumDate' }}</p>
              </div>
            </div>
          }
        </mat-card-content>
        <mat-card-actions>
          <button mat-raised-button color="warn" (click)="auth.logout()">
            <mat-icon>logout</mat-icon> Logout
          </button>
        </mat-card-actions>
      </mat-card>
    </div>
  `,
  styles: [`
    .profile-container {
      padding: 24px;
      max-width: 600px;
      margin: 0 auto;
    }
    .profile-card {
      padding: 24px;
    }
    .profile-info {
      display: flex;
      gap: 24px;
      align-items: center;
    }
    .avatar {
      font-size: 80px;
      width: 80px;
      height: 80px;
      color: var(--mat-sys-primary);
    }
    .details h2 {
      margin: 0 0 8px;
    }
    .details p {
      margin: 4px 0;
      color: var(--mat-sys-on-surface-variant);
    }
    .member-since {
      font-style: italic;
    }
    mat-card-actions {
      padding: 16px;
    }
  `],
})
export class ProfileViewComponent {
  constructor(public auth: AuthService) {}
}
