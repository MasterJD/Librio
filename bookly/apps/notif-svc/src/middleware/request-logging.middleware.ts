import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { CorrelationRequest } from './correlation-id.middleware';

const SERVICE_NAME = 'notif-svc';

@Injectable()
export class RequestLoggingMiddleware implements NestMiddleware {
  use(req: CorrelationRequest, res: Response, next: NextFunction) {
    const startedAt = Date.now();
    const method = req.method;
    const path = req.originalUrl;
    const correlationId = req.correlationId || 'n/a';

    res.on('finish', () => {
      console.log(
        JSON.stringify({
          timestamp: new Date().toISOString(),
          level: 'INFO',
          service: SERVICE_NAME,
          event: 'http_request',
          message: `${method} ${path} -> ${res.statusCode} (${Date.now() - startedAt}ms)`,
          method,
          path,
          status: res.statusCode,
          duration_ms: Date.now() - startedAt,
          correlation_id: correlationId,
        }),
      );
    });

    next();
  }
}
