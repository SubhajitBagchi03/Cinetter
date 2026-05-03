import { Queue, Worker } from 'bullmq';
import { getRedis } from '../config/redis.js';
import logger from '../utils/logger.js';
import config from '../config/index.js';

let trendingQueue, analyticsQueue;

export const startJobs = () => {
  const redis = getRedis();
  if (!redis) {
    logger.warn('BullMQ skipped — Redis not available');
    return;
  }

  const redisUrl = new URL(config.redis.url);
  const connection = {
    host: redisUrl.hostname,
    port: parseInt(redisUrl.port) || 6379,
    password: redisUrl.password,
    tls: redisUrl.protocol === 'rediss:' ? {} : undefined,
  };

  // Queues
  trendingQueue = new Queue('trending-update', { connection });
  analyticsQueue = new Queue('analytics-aggregate', { connection });

  // Workers
  new Worker('trending-update', async (job) => {
    logger.info(`[Job] Updating trending movies...`);
    const { default: tmdbService } = await import('../modules/movies/tmdb.service.js');
    await tmdbService.refreshTrending();
    logger.info('[Job] Trending movies updated');
  }, { connection });

  new Worker('analytics-aggregate', async (job) => {
    logger.info('[Job] Aggregating analytics...');
    // Aggregation logic runs here
  }, { connection });

  // Schedule recurring jobs
  trendingQueue.add('refresh', {}, { repeat: { every: 60 * 60 * 1000 } }); // every 1hr
  analyticsQueue.add('aggregate', {}, { repeat: { every: 24 * 60 * 60 * 1000 } }); // daily

  logger.info('BullMQ jobs started');
};
