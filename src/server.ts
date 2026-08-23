import config from "config";
import app from "./app";
import logger from "./common/config/logger";
import { initDB } from "./common/config/db";

const startServer = async () => {
  const PORT = config.get("server.port");
  try {
    await initDB();
    logger.info("database connected successfully");

    app.listen(PORT, () => logger.info(`Listening on port ${PORT}`));
  } catch (err: unknown) {
    if (err instanceof Error) {
      logger.error(err.message);
      setTimeout(() => {
        process.exit(1);
      }, 1000);
    }
  }
};

startServer();
