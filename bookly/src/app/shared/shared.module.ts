import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BookCardComponent } from './components/book-card/book-card.component';
import { LoadingSpinnerComponent } from './components/loading-spinner/loading-spinner.component';

@NgModule({
  imports: [CommonModule, BookCardComponent, LoadingSpinnerComponent],
  exports: [BookCardComponent, LoadingSpinnerComponent],
})
export class SharedModule {}
