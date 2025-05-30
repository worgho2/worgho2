export interface Logger {
  debug(message: string, ...metadata: unknown[]): void;
  info(message: string, ...metadata: unknown[]): void;
  warn(message: string, ...metadata: unknown[]): void;
  error(message: string, ...metadata: unknown[]): void;
}

export class LoggerImpl implements Logger {
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
