### RabbitMQClient Usage

**Install the RabbitMqClient package from verdaccio:**

    npm install dev.linkopus.rabbitmqclient

**Import sendMessage and consumeMessages functions from the package to your code:**

    import { sendMessage,consumeMessages } from 'dev.linkopus.rabbitmqclient';

**Use the functions in your code:**

    sendMessage('exchange', 'routingKey', 'message', 'apiKey')
    consumeMessages('exchange', 'routingKey', 'apiKey', callbackFunction)
