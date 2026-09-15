import { Kafka, Producer } from "kafkajs";

import { MessageProducerBroker } from "../types/broker";

export class KafkaProducerBroker implements MessageProducerBroker {
  private producer: Producer;

  constructor(clientId: string, brokers: string[]) {
    const kafka = new Kafka({ clientId, brokers });
    this.producer = kafka.producer();
  }

  /**
   * Connects to the Kafka Producer.
   */
  async connect() {
    await this.producer.connect();
  }

  /**
   * Disconnects from the Kafka Producer.
   */

  async disconnect() {
    if (this.producer) {
      await this.producer.disconnect();
    }
  }

  /**
   * Sends a message to the specified Kafka topic.
   * @param topic - The Kafka topic to send the message to.
   * @param message - The message to send.
   */
  async sendMessage(topic: string, message: string) {
    await this.producer.send({
      topic,
      messages: [{ value: message }],
    });
  }
}
