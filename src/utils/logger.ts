// Logging Framework
export enum LogLevel {
  ERROR = 'ERROR',
  WARN = 'WARN',
  INFO = 'INFO',
  DEBUG = 'DEBUG',
}

const logLevelPriority: Record<LogLevel, number> = {
  [LogLevel.ERROR]: 0,
  [LogLevel.WARN]: 1,
  [LogLevel.INFO]: 2,
  [LogLevel.DEBUG]: 3,
};

const currentLogLevel: LogLevel = 
  (import.meta.env.VITE_LOG_LEVEL as LogLevel) || LogLevel.INFO;

export class Logger {
  static log(level: LogLevel, message: string, ...args: any[]): void {
    const levelPriority = logLevelPriority[level];
    const currentLevelPriority = logLevelPriority[currentLogLevel];
    
    if (levelPriority <= currentLevelPriority) {
      const timestamp = new Date().toISOString();
      const logMessage = `[${timestamp}] ${level}: ${message}`;
      
      switch (level) {
        case LogLevel.ERROR:
          console.error(logMessage, ...args);
          break;
        case LogLevel.WARN:
          console.warn(logMessage, ...args);
          break;
        case LogLevel.INFO:
          console.info(logMessage, ...args);
          break;
        case LogLevel.DEBUG:
          console.debug(logMessage, ...args);
          break;
        default:
          console.log(logMessage, ...args);
      }
    }
  }

  static error(message: string, ...args: any[]): void {
    this.log(LogLevel.ERROR, message, ...args);
  }

  static warn(message: string, ...args: any[]): void {
    this.log(LogLevel.WARN, message, ...args);
  }

  static info(message: string, ...args: any[]): void {
    this.log(LogLevel.INFO, message, ...args);
  }

  static debug(message: string, ...args: any[]): void {
    this.log(LogLevel.DEBUG, message, ...args);
  }
}

export const logger = Logger;