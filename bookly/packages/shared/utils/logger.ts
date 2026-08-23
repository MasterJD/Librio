export enum LogLevel {
  INFO = 'INFO',
  WARN = 'WARN',
  ERROR = 'ERROR',
  DEBUG = 'DEBUG',
}

export interface LogEntry {
  timestamp: string;
  level: LogLevel;
  service: string;
  event: string;
  correlation_id?: string;
  user_id?: number;
  message?: string;
  [key: string]: unknown;
}

export class StructuredLogger {
  constructor(private readonly serviceName: string) {}

  private formatEntry(
    level: LogLevel,
    event: string,
    data: Partial<LogEntry> = {},
  ): LogEntry {
    return {
      timestamp: new Date().toISOString(),
      level,
      service: this.serviceName,
      event,
      ...data,
    };
  }

  info(event: string, data: Partial<LogEntry> = {}): void {
    console.log(JSON.stringify(this.formatEntry(LogLevel.INFO, event, data)));
  }

  warn(event: string, data: Partial<LogEntry> = {}): void {
    console.warn(JSON.stringify(this.formatEntry(LogLevel.WARN, event, data)));
  }

  error(event: string, data: Partial<LogEntry> = {}): void {
    console.error(JSON.stringify(this.formatEntry(LogLevel.ERROR, event, data)));
  }

  debug(event: string, data: Partial<LogEntry> = {}): void {
    console.debug(JSON.stringify(this.formatEntry(LogLevel.DEBUG, event, data)));
  }
}
