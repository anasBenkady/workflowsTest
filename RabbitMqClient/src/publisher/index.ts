import * as amqp from 'amqplib'
import ErrorType from '../utils/errorMessages'
import config from '../config/config'
import createLogger from "dev.linkopus.logger"

const logger = createLogger(undefined, 'RabitMqClient/publisher/index.ts')

export async function sendMessage(
  exchange: string,
  routingKey: string,
  request: { apikey: string, data?: object | string},
  consumerApiKey: string
): Promise<void> {
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