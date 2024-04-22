# CommonMessages Package Usage

### Installation:

    npm install dev.linkopus.commonmessages

### Import Middleware Functions:

Include the routeNotFoundHandlerMiddleware and errorHandlerMiddleware in your Express app to manage routing errors and other exceptions.

    import { routeNotFoundHandlerMiddleware, errorHandlerMiddleware, handleAsync } from 'commonmessages/middlewares';
    import winston from 'winston';

### Setup Logger:

This logger will be passed to middleware functions to enable error logging.

    import logger from 'dev.linkopus.logger'
    const logger = createLogger(module);

### Configure Middleware in Express:

**Route Not Found Handler:**

Attach the routeNotFoundHandlerMiddleware to handle requests to undefined routes.

    import express from 'express';

    const app = express();

    // Attach the Route Not Found Middleware at the end of all routes
    app.use('*', routeNotFoundHandlerMiddleware(logger));

### Async Error Handler Wrapper:

Utilize handleAsync for wrapping asynchronous route handlers to catch and forward errors to the error handling middleware.

    // Example of an asynchronous route
    app.get('/async-route', handleAsync(async (req, res, next) => {
        // Your asynchronous code here
        throw new Error('Example error');
    }));

    // Example route without async wrapper
    app.get('/standard-route', (req, res, next) => {
        throw new Error('Example error');
        res.send('This will not be reached if an error is thrown above.');
    });

### Error Handler Middleware:

Integrate errorHandlerMiddleware to manage and respond to errors throughout your application. This should be added after all other middleware and routes.

    // Attach the Error Handling Middleware at the very end of the middleware stack
    app.use(errorHandlerMiddleware(logger));

### Example:

Below is an example of how to use these middleware in an Express application to ensure robust error handling:

    import express from 'express';
    import { routeNotFoundHandlerMiddleware, errorHandlerMiddleware, handleAsync } from 'commonmessages/middlewares';
    import logger from 'dev.linkopus.logger';

    const app = express();

    // Regular route
    app.get('/', (req, res) => {
        res.send('Hello World!');
    });

    // Asynchronous route with error handling
    app.get('/async-route', handleAsync(async (req, res, next) => {
        // Simulate an error
        throw new Error('Simulated error');
    }));

    // Use Route Not Found Middleware
    app.use('*', routeNotFoundHandlerMiddleware(logger));

    // Use Error Handler Middleware
    app.use(errorHandlerMiddleware(logger));

    const PORT = process.env.PORT || 3000;
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

## ApiError class 

The ApiError class extends the native JavaScript Error class, providing enhanced error handling capabilities tailored for API responses. This class captures detailed information about errors, such as HTTP status codes, error types, and messages, and includes integrated logging functionalities.

### Importing ApiError:

    import ApiError from 'dev.linkopus.commonmessages';

### Example Usage:

    import createlogger from 'dev.linkopus.logger';
    import ApiError from 'dev.linkopus.commonmessages';

    // Setup Winston logger
    const logger = createlogger(module)

    // Function that might throw an error
    function riskyFunction() {
        try {
            // Code that might fail
            throw new ApiError({ status: 404, name: 'NOT_FOUND', details: 'Resource not found' }, logger);
        } catch (error) {
            if (error instanceof ApiError) {
            // Error is logged at instantiation, additional handling can be done here
                logger.error(error.log());
            } else {
                logger.error('An unexpected error occurred');
            }
        }
    }

## ErrorTypes Object

The ErrorTypes object contains constants representing various error conditions that can occur within your application. These constants facilitate consistent error reporting and handling throughout different components of your system.

### Importing ErrorTypes:

    import ErrorTypes from 'dev.linkopus.commonmessages';

### Example Usage:

    import { ErrorTypes, ApiError } from 'dev.linkopus.commonmessages';
    import createLogger from 'dev.linkopus.logger';

    // Setup logger
    const logger = createLogger(module)

    // Function that may throw an error based on some condition
    function processData(input) {
    if (!input) {
        throw new ApiError({
            status: 400,
            name: ErrorTypes.INVALID_INPUT_ERROR,
            details: 'Input data is required.'
        }, logger);
    }
        // Further processing...
    }

    try {
        processData(null);
    } catch (error) {
        if (error instanceof ApiError) {
            logger.error(error.log());  // Log detailed error message
        } else {
            logger.error('An unexpected error occurred:', error.message);
        }
    }

## StatusCode Object

The StatusCode object contains a collection of HTTP status codes that are commonly used to communicate the status of HTTP requests. This object helps in standardizing response statuses across your application, ensuring that all components use consistent HTTP status codes.

### Importing StatusCode:

    import StatusCode from 'dev.linkopus.commonmessages';

### Status Codes:

StatusCode defines several key HTTP status codes, each corresponding to different types of HTTP responses:

    OK (200): The request has succeeded.
    CREATED (201): A new resource has been created successfully.
    BAD_REQUEST (400): The server cannot process the request due to a client error.
    UNAUTHORIZED (401): The request lacks valid credentials for authentication.
    NOT_FOUND (404): The requested resource is not available.
    INTERNAL_SERVER_ERROR (500): An unexpected condition was encountered.
    TOO_MANY_REQUESTS (429): Rate limiting has been applied due to too many requests.

### Example Usage:

Below is an example demonstrating how to use StatusCode in an Express.js application to set appropriate HTTP response statuses:

    import express from 'express';
    import StatusCode from 'commonmessages/utils/StatusCode';

    const app = express();

    app.get('/', (req, res) => {
        res.status(StatusCode.OK).send('Hello World!');
    });

    app.post('/create', (req, res) => {
        // Assuming resource creation logic here
        res.status(StatusCode.CREATED).send('Resource created successfully.');
    });

    app.use((req, res) => {
        res.status(StatusCode.NOT_FOUND).send('Page not found.');
    });

    const PORT = process.env.PORT || 3000;
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

## SuccessTypes Object

The SuccessTypes object provides a collection of standardized success message constants used across the application. These constants help to ensure consistency in the messaging for successful operations, improving clarity and maintainability.

### Importing SuccessTypes:

    import SuccessTypes from 'dev.linkopus.commonmessages';

### Success Message Constants:

SuccessTypes includes constants for a range of successful outcomes, such as:

    LOGIN_SUCCESSFUL: Indicates successful user login.
    LOGOUT_SUCCESSFUL: Indicates successful user logout.
    USER_CREATED_SUCCESSFULLY: Indicates a user account has been successfully created.
    USER_DELETED_SUCCESSFULLY: Indicates a user account has been successfully deleted.
    PASSWORD_RESET_SUCCESSFUL: Indicates a successful password reset.
    ROLE_ASSIGNED_SUCCESSFULLY: Indicates a role has been successfully assigned to a user.
    STATUS_CHANGED_SUCCESSFULLY: Indicates the status of a user or entity has been successfully changed.

### Example Usage:

Below is an example demonstrating how to use SuccessTypes in a Node.js application to send consistent success messages to the client:

    import express from 'express';
    import SuccessTypes from 'dev.linkopus.commonmessages';

    const app = express();

    app.post('/login', (req, res) => {
        // Login logic here
        res.send({ message: SuccessTypes.LOGIN_SUCCESSFUL });
    });

    app.post('/register', (req, res) => {
        // User registration logic here
        res.send({ message: SuccessTypes.USER_CREATED_SUCCESSFULLY });
    });

    app.delete('/user', (req, res) => {
        // User deletion logic here
        res.send({ message: SuccessTypes.USER_DELETED_SUCCESSFULLY });
    });

    const PORT = process.env.PORT || 3000;
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
