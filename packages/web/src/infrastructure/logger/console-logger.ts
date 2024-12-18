import { Logger } from '@/ports/logger';

export class ConsoleLogger implements Logger {
  debug = (message: string, ...metadata: unknown[]) => {
    console.debug(message, ...metadata);
  };

  info = (message: string, ...metadata: unknown[]) => {
    console.info(message, ...metadata);
  };

  warn = (message: string, ...metadata: unknown[]) => {
    console.warn(message, ...metadata);
  };

  error = (message: string, ...metadata: unknown[]) => {
    console.error(message, ...metadata);
  };
}
