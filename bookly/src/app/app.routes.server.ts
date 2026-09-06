import { RenderMode, ServerRoute } from '@angular/ssr';

export const serverRoutes: ServerRoute[] = [
  {
    path: '',
    renderMode: RenderMode.Prerender,
  },
  {
    path: 'catalog',
    renderMode: RenderMode.Prerender,
  },
  {
    path: 'catalog/:id',
    renderMode: RenderMode.Server,
  },
  {
    path: 'auth/:pathMatch',
    renderMode: RenderMode.Server,
  },
  {
    path: 'library',
    renderMode: RenderMode.Server,
  },
  {
    path: 'cart',
    renderMode: RenderMode.Server,
  },
  {
    path: 'profile',
    renderMode: RenderMode.Server,
  },
  {
    path: '**',
    renderMode: RenderMode.Server,
  },
];
