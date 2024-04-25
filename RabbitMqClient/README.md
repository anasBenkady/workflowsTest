### RabbitMQClient Usage

**Install the RabbitMqClient package from verdaccio:**

    npm install dev.linkopus.rabbitmqclient

**Import sendMessage and consumeMessages functions from the package to your code:**

    import { sendMessage,consumeMessages } from 'dev.linkopus.rabbitmqclient';

**sendMessage function:**
 
Sends a message to a specified RabbitMQ exchange and routing key. The apiKey and message content are included within the request object.

    import { createLogger } from 'dev.linkopus.logger'; // Ensure to import Logger

    // Function call to send a message
    sendMessage(createLogger)(
        'exchange',           // Exchange to publish the message
        'routingKey',         // Routing key for the message
        { apikey: 'apiKey', data: 'Hello RabbitMQ!' }, // Request object with API key and message
        'consumerApiKey'      // Consumer API key if needed
    );

**consumeMessages function:**

Consumes messages from a specified RabbitMQ exchange and routing key using a callback to handle the messages.

    import { createLogger } from 'dev.linkopus.logger'; // Ensure to import Logger

    // Function call to consume messages
    consumeMessages(createLogger)(
        'exchange',          // Exchange to subscribe
        'routingKey',        // Routing key to bind
        'apiKey',            // API key for the consumer
        (content, key) => {  // Callback function to handle received messages
            console.log(`Message received: ${content} with routingKey: ${key}`);
        }
    );