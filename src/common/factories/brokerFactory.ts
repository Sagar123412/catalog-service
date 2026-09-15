import config from "config";
import { MessageProducerBroker } from "../types/broker";
import { KafkaProducerBroker } from "../config/kafka";

let messageProducer: MessageProducerBroker | null = null;

export const createMessageProducerBroker = (): MessageProducerBroker => {
  if (!messageProducer) {
    messageProducer = new KafkaProducerBroker(config.get("kafka.clientId"), [
      config.get("kafka.broker"),
    ]);
  }

  return messageProducer;
};
