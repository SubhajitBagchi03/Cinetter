import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import compression from 'compression';
import cookieParser from 'cookie-parser';
import { createServer } from 'http';

import config from './config/index.js';
import logger from './utils/logger.js';
import { notFound, errorHandler } from './middleware/errorHandler.js';
import { apiLimiter } from './middleware/rateLimiter.js';

// Route imports
import authRoutes from './modules/auth/auth.routes.js';
import moviesRoutes from './modules/movies/movies.routes.js';
import cinepulseRoutes from './modules/cinepulse/cinepulse.routes.js';
import reviewsRoutes from './modules/reviews/reviews.routes.js';
import watchlistRoutes from './modules/watchlist/watchlist.routes.js';
import collectionsRoutes from './modules/collections/collections.routes.js';
import socialRoutes from './modules/social/social.routes.js';
import usersRoutes from './modules/users/users.routes.js';
import aiRoutes from './modules/ai/ai.routes.js';
import analyticsRoutes from './modules/analytics/analytics.routes.js';
import adminRoutes from './modules/admin/admin.routes.js';
import moderationRoutes from './modules/moderation/moderation.routes.js';
import featureFlagsRoutes from './modules/featureFlags/featureFlags.routes.js';
import interestRoutes from './modules/movies/interest.routes.js';

const app = express();
const httpServer = createServer(app);

// Security
app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }));
app.use(cors({
  origin: config.client.url,
  credentials: true,
  methods: ['GET', 'POST', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

// Body parsing
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));
app.use(cookieParser());
app.use(compression());

// Request logging middleware
app.use((req, res, next) => {
  const start = Date.now();
  res.on('finish', () => {
    const duration = Date.now() - start;
    logger.info(`${req.method} ${req.originalUrl} ${res.statusCode} ${duration}ms`, {
      ip: req.ip, userAgent: req.get('user-agent'),
    });
  });
  next();
});

// Global rate limit
app.use('/api/', apiLimiter);

// Health check (before auth)
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: config.nodeEnv,
  });
});

// API v1 Routes
const v1 = '/api/v1';
app.use(`${v1}/auth`, authRoutes);
app.use(`${v1}/movies`, moviesRoutes);
app.use(`${v1}/cinepulse`, cinepulseRoutes);
app.use(`${v1}/reviews`, reviewsRoutes);
app.use(`${v1}/watchlist`, watchlistRoutes);
app.use(`${v1}/collections`, collectionsRoutes);
app.use(`${v1}/spaces`, socialRoutes);
app.use(`${v1}/users`, usersRoutes);
app.use(`${v1}/ai`, aiRoutes);
app.use(`${v1}/analytics`, analyticsRoutes);
app.use(`${v1}/admin`, adminRoutes);
app.use(`${v1}/moderation`, moderationRoutes);
app.use(`${v1}/feature-flags`, featureFlagsRoutes);
app.use(`${v1}/interest`, interestRoutes);

// Error handling
app.use(notFound);
app.use(errorHandler);

export { app, httpServer };
