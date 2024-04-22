import winston from 'winston';
import type errorBody from '../models/errorBody'

/**
 * Class ApiError - extends the native Error class to handle API specific errors
 * with logging capability.
 */
class ApiError extends Error {
  /**
   * Holds the details about the error, including status, name, and additional details.
   */
  public errorBody: errorBody;

  /**
   * Logger instance from Winston to log error details.
   */
  public logger: winston.Logger;

  /**
   * Constructs the ApiError instance with an error body and logger.
   * @param errorBody The structure containing error details like status, name, and optionally more details.
   * @param logger The Winston logger instance to log this error.
   */
  constructor(errorBody: errorBody, logger: winston.Logger) {
    super(`${errorBody.status} ${errorBody.name}`);
    this.errorBody = errorBody;
    this.logger = logger;
    
    // Logs the error at the time of error object creation.
    logger.error(this.log());
  }

  /**
   * Generates a string representation of the error for logging purposes.
   * @returns A formatted string containing the status, name, and details of the error.
   */
  public log(): string {
    return `${this.errorBody.status} ${this.errorBody.name}: ${this.errorBody.details || ''}`;
  }
}

export default ApiError
