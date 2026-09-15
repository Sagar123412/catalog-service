import config from "config";
import app from "./app";
import logger from "./common/config/logger";
import { initDB } from "./common/config/db";
import { createMessageProducerBroker } from "./common/factories/brokerFactory";

const startServer = async () => {
  const PORT = config.get("server.port");
  let messageProducerBroker = null;

  try {
    await initDB();
    logger.info("database connected successfully");

    // Start the Kafka producer broker
    messageProducerBroker = createMessageProducerBroker();
    await messageProducerBroker.connect();
    logger.info("Kafka producer broker connected successfully");

    app.listen(PORT, () => logger.info(`Listening on port ${PORT}`));
  } catch (err: unknown) {
    if (err instanceof Error) {
      if (messageProducerBroker) {
        await messageProducerBroker.disconnect();
      }
      logger.error(err.message);
      setTimeout(() => {
        process.exit(1);
      }, 1000);
    }
  }
};

startServer();
