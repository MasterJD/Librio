export class StructuredLogger {
  constructor(private readonly context: string) {}

  log(message: string, correlationId?: string, extra?: Record<string, any>) {
    console.log(JSON.stringify({
      timestamp: new Date().toISOString(),
      level: 'info',
      service: 'notif-svc',
      context: this.context,
      message,
      correlation_id: correlationId,
      ...extra,
    }));
  }

  error(message: string, correlationId?: string, extra?: Record<string, any>) {
    console.error(JSON.stringify({
      timestamp: new Date().toISOString(),
      level: 'error',
      service: 'notif-svc',
      context: this.context,
      message,
      correlation_id: correlationId,
      ...extra,
    }));
  }

  warn(message: string, correlationId?: string, extra?: Record<string, any>) {
    console.warn(JSON.stringify({
      timestamp: new Date().toISOString(),
      level: 'warn',
      service: 'notif-svc',
      context: this.context,
      message,
      correlation_id: correlationId,
      ...extra,
    }));
  }
}
