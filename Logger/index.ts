import * as path from 'path';
import * as winston from 'winston';
import { format } from 'winston';
import * as DailyRotateFile from 'winston-daily-rotate-file';

/**
 * Retrieves a label from the calling module's file path.
 * @param callingModule The module from which the logger is being called, used to derive the label.
 * @returns A string representing the path label derived from the calling module.
 */
const getLabel = (callingModule?: NodeModule): string => {
  if (!callingModule) return '';

  const parts = callingModule.filename.split(path.sep);
  const rootIndex = parts.findIndex(part => part === 'src');

  return rootIndex >= 0 ? parts.slice(rootIndex).join(path.sep) : callingModule.filename;
};

/**
 * Returns the appropriate terminal color code based on the log level.
 * @param level The log level (e.g., 'INFO', 'WARN', 'ERROR').
 * @returns The ANSI color code for the given log level.
 */
const getColor = (level: string): string => {
  switch (level) {
    case 'INFO':
      return '\x1b[32m'; // Green
    case 'WARN':
      return '\x1b[33m'; // Yellow
    case 'ERROR':
      return '\x1b[31m'; // Red
    default:
      return '\x1b[0m'; // Reset color
  }
};

/**
 * Custom formatting function for winston log messages.
 */
const customPrint = format.printf((log): string => {
  return `${getColor(log.level)}${log.level} [${log.timestamp}] [${log.label}] ${log.message}\x1b[0m`;
});

/**
 * Creates a logger instance with custom settings including colored output and daily log rotation.
 * @param callingModule Optional Node module, used to label the log entries.
 * @param path Optional override path for the log label.
 * @returns A configured winston.Logger instance.
 */
const logger = (callingModule?: NodeModule, path?: string): winston.Logger => {
  const label = path ?? getLabel(callingModule);
  return winston.createLogger({
    format: format.combine(
      format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
      format.label({ label }),
      format(log => {
        log.level = log.level.toUpperCase();
        return log;
      })(),
      customPrint
    ),
    transports: [
      new winston.transports.Console(),
      new DailyRotateFile({
        filename: 'logs/aiService-%DATE%.log',
        datePattern: 'YYYY-MM-DD',
        zippedArchive: true,
        maxSize: '20m',
        maxFiles: '30d'
      })
    ]
  });
}

export default logger
