import {
  HttpInterceptorFn,
  HttpEvent,
  HttpResponse,
  HttpErrorResponse,
} from '@angular/common/http';
import { tap } from 'rxjs/operators';

const SERVICE_BY_PORT: Record<string, string> = {
  '8000': 'library-mcp',
  '8001': 'catalog-svc',
  '8002': 'users-svc',
  '8003': 'transaction-svc',
  '8004': 'notif-svc',
};

export const loggingInterceptor: HttpInterceptorFn = (req, next) => {
  const startedAt = Date.now();
  let url: URL;
  try {
    url = new URL(req.url);
  } catch {
    url = new URL(req.url, window.location.origin);
  }

  const service = SERVICE_BY_PORT[url.port] || `${url.hostname}:${url.port}`;
  const method = req.method;
  const path = url.pathname;
  const correlationId = req.headers.get('x-correlation-id');

  return next(req).pipe(
    tap({
      next: (event: HttpEvent<unknown>) => {
        if (event instanceof HttpResponse) {
          console.log({
            service,
            message: `${method} ${path} -> ${event.status} (${Date.now() - startedAt}ms)`,
            payload: event.body,
            status: event.status,
            duration_ms: Date.now() - startedAt,
            correlation_id: correlationId,
          });
        }
      },
      error: (err) => {
        if (err instanceof HttpErrorResponse) {
          console.error({
            service,
            message: `${method} ${path} -> ${err.status} (${Date.now() - startedAt}ms)`,
            payload: err.error,
            status: err.status,
            duration_ms: Date.now() - startedAt,
            correlation_id: correlationId,
          });
        }
      },
    }),
  );
};