import { Injectable, signal, computed } from '@angular/core';
import { Book } from './catalog.service';

export interface CartItem {
  book: Book;
  type: 'rent' | 'buy';
  durationDays?: number;
}

@Injectable({ providedIn: 'root' })
export class CartService {
  items = signal<CartItem[]>([]);
  itemCount = computed(() => this.items().length);
  total = computed(() =>
    this.items().reduce((sum, item) => {
      const price = parseFloat(item.book.price);
      if (item.type === 'buy') return sum + price;
      return sum + price * 0.3 * (item.durationDays || 14);
    }, 0),
  );

  addItem(book: Book, type: 'rent' | 'buy', durationDays?: number) {
    const existing = this.items().find((i) => i.book.id === book.id && i.type === type);
    if (existing) return;

    this.items.update((items) => [...items, { book, type, durationDays }]);
  }

  removeItem(bookId: number, type: 'rent' | 'buy') {
    this.items.update((items) => items.filter((i) => !(i.book.id === bookId && i.type === type)));
  }

  clear() {
    this.items.set([]);
  }
}
