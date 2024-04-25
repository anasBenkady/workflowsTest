/**
 * Interface errorBody - Defines the structure for error information in API responses.
 */
interface errorBody {
  /**
   * Numeric HTTP status code representing the type of error.
   */
  status: number;

  /**
   * A brief name describing the type of error.
   */
  name: string;

  /**
   * Optional additional details about the error, which can be a single string or an array of strings.
   */
  details?: string | string[];
}

export default errorBody
