import { Injectable, ConsoleLogger } from '@nestjs/common';

@Injectable()
export class StructuredLogger extends ConsoleLogger {
  private serviceName: string;

  constructor(serviceName: string) {
    super();
    this.serviceName = serviceName;
  }

  log(message: string, correlationId?: string, extra?: Record<string, any>) {
    const logEntry: Record<string, any> = {
      timestamp: new Date().toISOString(),
      level: 'INFO',
      service: this.serviceName,
      message,
      correlation_id: correlationId,
    };
    if (extra) Object.assign(logEntry, extra);
    console.log(JSON.stringify(logEntry));
  }

  error(message: string, stack?: string, correlationId?: string) {
    const logEntry: Record<string, any> = {
      timestamp: new Date().toISOString(),
      level: 'ERROR',
      service: this.serviceName,
      message,
      correlation_id: correlationId,
    };
    if (stack) logEntry.stack = stack;
    console.error(JSON.stringify(logEntry));
  }

  warn(message: string, correlationId?: string, extra?: Record<string, any>) {
    const logEntry: Record<string, any> = {
      timestamp: new Date().toISOString(),
      level: 'WARN',
      service: this.serviceName,
      message,
      correlation_id: correlationId,
    };
    if (extra) Object.assign(logEntry, extra);
    console.warn(JSON.stringify(logEntry));
  }
}
