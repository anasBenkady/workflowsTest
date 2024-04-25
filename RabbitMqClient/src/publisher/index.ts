import * as amqp from 'amqplib'
import ErrorType from '../utils/errorMessages'
import config from '../config/config'
import { Logger } from 'winston'

/**
 * Creates a function to send messages to a specified RabbitMQ exchange and routing key.
 * @param createLogger Function to create a logger instance.
 * @returns A function capable of sending messages through RabbitMQ.
 */
export const sendMessage = (createLogger: ((callingModule?: NodeModule, path?: string) => Logger)):
  ((
    exchange: string,
    routingKey: string,
    request: { apikey: string, data?: object | string},
    consumerApiKey: string
    ) => Promise<void>
  ) => {
    const logger = createLogger(undefined, 'RabbitMqClient/consumer/index.ts')
    return async (exchange: string, routingKey: string, request: { apikey: string, data?: object | string}, consumerApiKey: string): Promise<void> => {
      try {
        const passphrase = config.passphrase;
        if (!config.client_cert || !config.client_key || !config.ca_cert || !config.rabbitmqurl) {
          logger.error(`${ErrorType.CERT_PATH_NOT_DEFINED}: One or many of RabbitMq client certifications are not found.`)
          return;
        }
        const clientCert = config.client_cert;
        const clientKey = config.client_key;
        const caCert = config.ca_cert;

        const connection: amqp.Connection = await amqp.connect(config.rabbitmqurl, {
          cert: clientCert,
          key: clientKey,
          passphrase,
          ca: [caCert],
          checkServerIdentity: () => undefined // This skips the hostname/IP check
        });
        
        logger.info('Opening channel...')
        const channel: amqp.Channel = await connection.createChannel();

        await channel.assertExchange(exchange, 'direct', { durable: true });

        logger.info(`Publishing data: ${request.data}, to ${consumerApiKey} via exchange ${exchange} with routingKey: ${routingKey}...`);
        const requestBuffer = Buffer.from(JSON.stringify(request))
        const result = channel.publish(exchange, routingKey, requestBuffer);
        result ? logger.info(`Data published successfully to ${consumerApiKey} via exchange ${exchange} with routingKey: ${routingKey}.`)
              : logger.error(`Data failed to be published to ${consumerApiKey} via exchange ${exchange} with routingKey: ${routingKey}.`)
        
        logger.info('Closing channel...')
        await channel.close();
        logger.info('Closing connection...')
        await connection.close();
      } catch (error) {
        logger.error(`${ErrorType.PUBLISH_ERROR}: ${(error as Error).message}`);
      }
    }
}