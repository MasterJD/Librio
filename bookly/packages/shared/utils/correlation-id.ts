import { randomUUID } from 'crypto';

export const CORRELATION_ID_HEADER = 'x-correlation-id';

export function generateCorrelationId(): string {
  return randomUUID();
}

export function getCorrelationId(headers: Record<string, string>): string {
  return headers[CORRELATION_ID_HEADER] || generateCorrelationId();
}
