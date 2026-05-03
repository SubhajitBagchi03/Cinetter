import 'dotenv/config';
import { httpServer } from './app.js';
import connectDB from './config/db.js';
import connectRedis from './config/redis.js';
import config from './config/index.js';
import logger from './utils/logger.js';
import { initSocket } from './sockets/index.js';
import { startJobs } from './jobs/queue.js';
import { scheduleReleaseNotifier } from './jobs/releaseNotifier.job.js';

const start = async () => {
  try {
    // Connect to MongoDB
    await connectDB();

    // Connect to Redis (non-fatal)
    connectRedis();

    // Init Socket.io
    initSocket(httpServer);

    // Start background jobs
    startJobs();
    scheduleReleaseNotifier();

    // Start HTTP server
    httpServer.listen(config.port, () => {
      logger.info(`🚀 Cinetter API running on port ${config.port} [${config.nodeEnv}]`);
      logger.info(`📡 Health: http://localhost:${config.port}/health`);
    });

  } catch (error) {
    logger.error('Failed to start server:', error);
    process.exit(1);
  }
};

// Graceful shutdown
const shutdown = async (signal) => {
  logger.info(`${signal} received — shutting down gracefully`);
  httpServer.close(() => {
    logger.info('HTTP server closed');
    process.exit(0);
  });
  setTimeout(() => process.exit(1), 10000); // Force exit after 10s
};

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));
process.on('unhandledRejection', (err) => {
  logger.error('Unhandled Rejection:', err);
  shutdown('unhandledRejection');
});

start();
