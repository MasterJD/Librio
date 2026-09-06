import { Routes } from '@angular/router';
import { CatalogListComponent } from './catalog-list/catalog-list.component';
import { BookDetailComponent } from './book-detail/book-detail.component';

export const CATALOG_ROUTES: Routes = [
  { path: '', component: CatalogListComponent },
  { path: ':id', component: BookDetailComponent },
];
