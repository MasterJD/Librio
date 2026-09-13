import { Injectable, ConsoleLogger } from '@nestjs/common';

@Injectable()
export class StructuredLogger extends ConsoleLogger {
  constructor(private readonly serviceName: string) {
    super();
  }

  private write(level: string, message: string, correlationId?: string, extra?: Record<string, any>) {
    const entry: Record<string, any> = {
      timestamp: new Date().toISOString(),
      level,
      service: this.serviceName,
      message,
      correlation_id: correlationId,
    };
    if (extra) Object.assign(entry, extra);
    if (level === 'ERROR') {
      console.error(JSON.stringify(entry));
    } else {
      console.log(JSON.stringify(entry));
    }
  }

  log(message: string, correlationId?: string, extra?: Record<string, any>) {
    this.write('INFO', message, correlationId, extra);
  }

  warn(message: string, correlationId?: string, extra?: Record<string, any>) {
    this.write('WARN', message, correlationId, extra);
  }

  error(message: string, stack?: string, correlationId?: string) {
    const entry: Record<string, any> = {
      timestamp: new Date().toISOString(),
      level: 'ERROR',
      service: this.serviceName,
      message,
      correlation_id: correlationId,
    };
    if (stack) entry.stack = stack;
    console.error(JSON.stringify(entry));
  }
}
