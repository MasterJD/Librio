import { Component, Input } from '@angular/core';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

@Component({
  selector: 'app-loading-spinner',
  standalone: true,
  imports: [MatProgressBarModule, MatProgressSpinnerModule],
  template: `
    @if (mode === 'spinner') {
      <div class="spinner-container">
        <mat-spinner [diameter]="diameter"></mat-spinner>
        @if (message) {
          <p class="message">{{ message }}</p>
        }
      </div>
    } @else {
      <mat-progress-bar mode="indeterminate"></mat-progress-bar>
    }
  `,
  styles: [`
    .spinner-container {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 32px;
    }
    .message {
      margin-top: 16px;
      color: var(--mat-sys-on-surface-variant);
    }
  `],
})
export class LoadingSpinnerComponent {
  @Input() mode: 'spinner' | 'bar' = 'spinner';
  @Input() diameter = 48;
  @Input() message = '';
}
