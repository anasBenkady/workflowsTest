import * as amqp from "amqplib";
import ErrorType from "../utils/errorMessages";
import config from "../config/config";
import { Logger } from "winston";

/**
 * An object to hold shared AMQP resources like connection and channel.
 */
const sharedResources = {
  connection: null as amqp.Connection | null,
  channel: null as amqp.Channel | null,
};

/**
 * Ensures a single AMQP channel is created and reused within the application.
 * @param logger A Winston logger instance for logging status and errors.
 * @returns A Promise resolving to an AMQP channel.
 */
async function ensureAMQPChannel(logger: Logger): Promise<amqp.Channel> {
  logger.info('Creating channel...')
  if (sharedResources.channel) {
    logger.warn('Channel already exists...')
    return sharedResources.channel;
  };

  const { client_cert, client_key, ca_cert, passphrase, rabbitmqurl } = config;
  if (!client_cert || !client_key || !ca_cert || !rabbitmqurl) {
    throw new Error(`Failed to create AMQP channel: ${ErrorType.CONFIGURATION_ERROR}`);
  }

  try {
    if (!sharedResources.connection) {
      sharedResources.connection = await amqp.connect(rabbitmqurl, {
        cert: client_cert,
        key: client_key,
        passphrase,
        ca: [ca_cert],
        checkServerIdentity: () => undefined,
      });
      setUpConnectionListeners(sharedResources.connection, logger);
    }

    sharedResources.channel = await sharedResources.connection.createChannel();
    logger.info('Channel created successfully')
    return sharedResources.channel;
  } catch (error) {
    logger.error(`Failed to create AMQP channel: ${(error as Error).message}`);
    throw error;
  }
}

/**
 * Sets up listeners for the AMQP connection events.
 * @param connection The AMQP connection to attach listeners to.
 * @param logger A Winston logger instance for logging connection events.
 */
function setUpConnectionListeners(connection: amqp.Connection, logger: Logger) {
  logger.info('Setting up connection listeners')
  connection.on("error", (err) => logger.error("AMQP Connection error:", (err as Error).message));
  connection.on("close", () => logger.info("AMQP Connection closed"));
}

/**
 * Creates a consumer function for RabbitMQ that subscribes to a specific exchange and routing key.
 * @param createLogger Function to create a logger instance.
 * @returns A function to handle AMQP message consumption.
 */
export const consumeMessages = (createLogger: ((callingModule?: NodeModule, path?: string) => Logger)): 
((
  exchange: string, 
  routingKey: string, 
  apiKey: string, 
  callback: (content: object | string, key: string) => void
  ) => Promise<void>
) => {
  const logger = createLogger(undefined, 'RabbitMqClient/consumer/index.ts')
  return async (exchange: string, routingKey: string, apiKey: string, callback: (content: object | string, key: string) => void): Promise<void> => {
    try {
      const channel = await ensureAMQPChannel(logger);
      await channel.assertExchange(exchange, "direct", { durable: true });
      const { queue } = await channel.assertQueue(apiKey, { exclusive: false, autoDelete: true });
      await channel.bindQueue(queue, exchange, routingKey);
      logger.info(`Subscribed to ${exchange}/${routingKey} via queue ${queue}.`);

      logger.info('Waiting for publishers requests...')
      await channel.consume(queue, (msg) => {
        if (msg) {
          const request = JSON.parse(msg.content.toString());

          logger.info(`Data arrived from apiKey: ${request.apikey} in queue ${queue} via exchange ${exchange}.`)

          logger.info(`Consuming data from queue ${queue} via exchange ${exchange}.`)
          const key = msg.fields.routingKey;
          callback(request.data, key);
          logger.info(`The data arriving from ${apiKey} has been consumed successfully from queue ${queue} via exchange ${exchange}.`)
          channel.ack(msg);
        }
      }, { noAck: false });

    } catch (error) {
      logger.error(`${ErrorType.CONSUME_ERROR}: ${(error as Error).message}`)
    }
  }
}
