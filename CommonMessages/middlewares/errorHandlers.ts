import { type NextFunction, type Request, type Response } from 'express'
import createLogger from 'dev.linkopus.logger'
import ApiError, { getErrorFilePath } from '../utils/ApiError'
import StatusCode from '../utils/StatusCode'
import ErrorTypes from '../utils/errorTypes'

export const routeNotFoundHandlerMiddleware = (req: Request, res: Response, next: NextFunction): void => {
  const err = new ApiError({ status: StatusCode.NOT_FOUND, name: ErrorTypes.ROUTE_NOT_FOUND, details: `Can't find ${req.originalUrl} on the server!` }, module)
  next(err)
}

export const handleAsync = (fn: any) => (req: Request, res: Response, next: NextFunction) => {
  Promise.resolve(fn(req, res, next)).catch(next)
}

export const errorHandlerMiddleware = (error: Error, req: Request, res: Response, next: NextFunction): void => {
  if (error instanceof ApiError) {
    const { status, ...errorBody } = error.errorBody
    res.status(status).json({ error: errorBody })
  } else {
    const errorBody = { status: StatusCode.INTERNAL_SERVER_ERROR, name: ErrorTypes.UNEXPECTED_ERROR, details: error.message }
    createLogger(undefined, getErrorFilePath(error)).error(`${errorBody.status} ${errorBody.name} ${errorBody.details}`)
    res.status(StatusCode.INTERNAL_SERVER_ERROR).json({ error: { name: ErrorTypes.UNEXPECTED_ERROR, details: error.message } })
  }
}

