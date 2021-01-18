import amqp, { ConsumeMessage } from 'amqplib';

type RabbitMQCallback = (msg: amqp.ConsumeMessage) => any;

class Amqp {

  protected connection: amqp.Connection;
  protected channel: amqp.Channel;

  /**
   * Checks and throws an error if a connection has not been created.
   */
  protected isEventBusInitialized() {
    if (!this.connection || !this.channel) throw new Error("You need to initialize amqp");
  }

  /**
   * Initializes the AMQP connection if it doesn't exist already
   * Creates AMQP channel and connection
   * @param amqp_url AMQP url to be used for Event Bus connections
   * @returns {boolean} Returns true if initialization was successful.
   */
  async init(amqp_url: string) {
    if (this.connection) return true; // prevents us from carelessly creating multiple AMQP connections in our app.

    // set connection heartbeat to 60
    const connectionUrl = amqp_url + '?heartbeat=60';

    // create connection
    this.connection = await amqp.connect(connectionUrl);

    // create channel
    this.channel = await this.connection.createChannel();
    return true;
  }

  /**
   * Pushes data to the queue `queueName`
   * @param queueName Queue to push data to
   * @param data Data to be pushed to queue `queueName`
   * @param options RabbitMQ Publish options
   * Messages are persistent by default.
   * @return {boolean}
   */
  async publish(queueName: string, data: object, options?: amqp.Options.Publish) {
    this.isEventBusInitialized()
    await this.channel.assertQueue(queueName, { durable: true });
    const message = Buffer.from(JSON.stringify(data));
    return this.channel.sendToQueue(queueName, message, {
      persistent: true,
      ...options,
    });
  }

  /**
   * Consumes tasks/messages from a queue `queueName` and invokes the provided callback
   * @param queueName Queue to consume tasks from
   * @param callback Callback to be invoked for each message that gets sent to the queue
   * @param limit The number of concurrent jobs the consumer can handle. Defaults to 5
   * @param options Optional options. If the noAck option is set to true or not specified,
   * you are expected to call channel.ack(message) at the end of the supplied
   * callback inorder to notify the queue that the message has been acknowledged.
   */
  async subscribe(
    queueName: string,
    callback: RabbitMQCallback,
    limit: number = 5,
    options?: amqp.Options.Consume
  ): Promise<amqp.Replies.Consume> {
    this.isEventBusInitialized()

    // limit number of concurrent jobs
    this.channel.prefetch(limit);

    // Assert queue's existence
    await this.channel.assertQueue(queueName, { durable: true });

    return this.channel.consume(queueName, callback, options);
  }

  /**
   * Acknowledges a message.
   * @param message The message to be acknowledged
   */
  acknowledgeMessage(message: ConsumeMessage) {
    this.isEventBusInitialized()
    this.channel.ack(message);
  }

  /**
   * Rejects a message and requeues it by default.
   * @param message The message to be reject
   * @param requeue Boolean flag on if the message should be requeued. Defaults to true
   */
  rejectMessage(message: ConsumeMessage, requeue: boolean = true) {
    this.isEventBusInitialized()
    this.channel.nack(message, false, requeue);
  }

  /**
   * Closes AMQP connection and invalidate any unnresolved operations.
   */
  async close() {
    this.isEventBusInitialized()
    await this.connection.close();
  }
}

export const rAmqp = new Amqp();
