### Logger Usage

**Install the Logger package from verdaccio:**

    npm install dev.linkopus.logger

**Import createLogger from the package to your code:**

    import createLogger from "dev.linkopus.logger";

**Create Logger for your module:**

    const logger = createLogger(module);

**Use that logger to log info, warning or error:**

    logger.info("this is an info");

    logger.warn("this is a warning");

    logger.error("this an error");

    