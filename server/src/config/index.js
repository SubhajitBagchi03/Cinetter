import dotenv from 'dotenv';
dotenv.config();

const config = {
  port: parseInt(process.env.PORT, 10) || 5000,
  nodeEnv: process.env.NODE_ENV || 'development',
  
  mongodb: {
    uri: process.env.MONGODB_URI || 'mongodb://localhost:27017/cinetter',
  },
  
  redis: {
    url: process.env.REDIS_URL || 'redis://localhost:6379',
  },
  
  jwt: {
    secret: process.env.JWT_SECRET,
    refreshSecret: process.env.JWT_REFRESH_SECRET,
    expire: process.env.JWT_EXPIRE || '15m',
    refreshExpire: process.env.JWT_REFRESH_EXPIRE || '7d',
  },
  
  tmdb: {
    apiKey: process.env.TMDB_API_KEY,
    readAccessToken: process.env.TMDB_READ_ACCESS_TOKEN || null,
    baseUrl: process.env.TMDB_BASE_URL || 'https://api.themoviedb.org/3',
    imageBaseUrl: 'https://image.tmdb.org/t/p',
  },
  
  client: {
    url: process.env.CLIENT_URL || 'http://localhost:5173',
  },
  
  rateLimit: {
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW, 10) || 900000,
    max: parseInt(process.env.RATE_LIMIT_MAX, 10) || 100,
  },
};

export default config;
