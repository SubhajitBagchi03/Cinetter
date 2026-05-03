import Redis from 'ioredis';
import logger from '../utils/logger.js';
import config from './index.js';

let redis = null;

const connectRedis = () => {
  if (!config.redis.url || config.redis.url.includes('localhost')) {
    logger.warn('Redis URL not configured — running without cache');
    return null;
  }

  try {
    redis = new Redis(config.redis.url, {
      maxRetriesPerRequest: 3,
      enableOfflineQueue: false,
      lazyConnect: true,
      connectTimeout: 10000,
      tls: config.redis.url.startsWith('rediss:') ? {} : undefined, // Only use TLS if protocol is rediss://
      retryStrategy(times) {
        if (times > 5) {
          logger.warn('Redis max retries reached — running without cache');
          return null;
        }
        return Math.min(times * 500, 3000);
      },
    });

    redis.on('connect', () => {
      logger.info('✅ Redis connected — caching enabled');
    });

    redis.on('ready', () => {
      logger.info('Redis ready — all TMDB data will be cached');
    });

    redis.on('error', (err) => {
      // Only log the first error, not every retry
      if (err.code === 'ECONNREFUSED') return;
      logger.error(`Redis error: ${err.message}`);
    });

    redis.on('close', () => {
      logger.warn('Redis connection closed');
    });

    redis.connect().catch((err) => {
      logger.warn(`Redis connect failed: ${err.message} — running without cache`);
    });

  } catch (error) {
    logger.warn(`Redis initialization failed: ${error.message}`);
  }

  return redis;
};

export const getRedis = () => redis;
export default connectRedis;
