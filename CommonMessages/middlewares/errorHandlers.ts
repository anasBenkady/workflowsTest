import { type NextFunction, type Request, type Response } from 'express'
import ApiError from '../utils/ApiError'
import StatusCode from '../utils/StatusCode'
import ErrorTypes from '../utils/errorTypes'
import winston from 'winston'
import errorBody from '../models/errorBody'

/**
 * Middleware to handle routes that are not found.
 * @param logger A Winston logger instance for logging errors.
 * @returns A middleware function that captures route not found errors and forwards them.
 */
export const routeNotFoundHandlerMiddleware = (logger: winston.Logger): ((req: Request, res: Response, next: NextFunction) => void)  =>
{
  return (req: Request, res: Response, next: NextFunction): void => {
    const errorBody: errorBody = { status: StatusCode.NOT_FOUND, name: ErrorTypes.ROUTE_NOT_FOUND, details: `Can't find ${req.originalUrl} on the server!` }
    const err = new ApiError(errorBody, logger)
    next(err)
  }
}

/**
 * Wrapper for handling errors in async route handlers.
 * @param fn The async function (route handler) that returns a Promise.
 * @returns A function that handles the request, captures any errors and forwards them via next().
 */
export const handleAsync = (fn: any) => (req: Request, res: Response, next: NextFunction) => {
  Promise.resolve(fn(req, res, next)).catch(next)
}

/**
 * Middleware to handle errors caught by Express.
 * @param logger A Winston logger instance for logging errors.
 * @returns A middleware function that handles different types of errors and provides a formatted response.
 */
export const errorHandlerMiddleware = (logger: winston.Logger): ((error: Error, req: Request, res: Response, next: NextFunction) => void) => 
  {
    return (error: Error, req: Request, res: Response, next: NextFunction): void => {
      if (error instanceof ApiError) {
        const { status, ...errorBody } = error.errorBody
        res.status(status).json({ error: errorBody })
      } else {
        const errorBody = { status: StatusCode.INTERNAL_SERVER_ERROR, name: ErrorTypes.UNEXPECTED_ERROR, details: error.message }
        logger.error(`${errorBody.status} ${errorBody.name} ${errorBody.details}`)
        res.status(StatusCode.INTERNAL_SERVER_ERROR).json({ error: { name: ErrorTypes.UNEXPECTED_ERROR, details: error.message } })
      }
    }
  }
