/**
 * Object StatusCode - Defines HTTP status codes used throughout the application to standardize
 * the response statuses for HTTP requests.
 */
const StatusCode = {
  /**
   * 200 OK - The request has succeeded.
   */
  OK: 200,

  /**
   * 201 Created - The request has been fulfilled and has resulted in a new resource being created.
   */
  CREATED: 201,

  /**
   * 400 Bad Request - The server cannot or will not process the request due to an apparent client error.
   */
  BAD_REQUEST: 400,

  /**
   * 401 Unauthorized - The request has not been applied because it lacks valid authentication credentials for the target resource.
   */
  UNAUTHORIZED: 401,

  /**
   * 404 Not Found - The requested resource could not be found but may be available again in the future.
   */
  NOT_FOUND: 404,

  /**
   * 500 Internal Server Error - A generic error message, given when an unexpected condition was encountered.
   */
  INTERNAL_SERVER_ERROR: 500,

  /**
   * 429 Too Many Requests - The user has sent too many requests in a given amount of time ("rate limiting").
   */
  TOO_MANY_REQUESTS: 429,
}

export default StatusCode
