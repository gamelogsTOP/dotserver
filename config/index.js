const path = require('path');

const config = {
  app: {
    name: 'dot-server',
    env: process.env.NODE_ENV || 'development',
    port: process.env.PORT || 13258
  },
  redis: {
    host: process.env.REDIS_HOST || 'localhost',
    port: process.env.REDIS_PORT || 6379,
    retryStrategy: (times) => Math.min(5000, times * 100)
  },
  mongodb: {
    uri: process.env.MONGODB_URI || 'mongodb://localhost:27017/game_analytics',
    options: {
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
      maxPoolSize: 10
    }
  },
  events: {
    types: {
      USER_ID: 'user_id',
      GAME_ENTER: 'game_enter',
      GAME_UPTIME: 'game_uptime',
      GAME_SCORE: 'game_score',
      GAME_LEVEL: 'game_level',
      SOUND_PAUSED: 'sound_paused',
      SOUND_RESUMED: 'sound_resumed',
      ADS_OPENED: 'ads_opened',
      ADS_CLOSED: 'ads_closed',
      FPS_SET: 'fps_set',
      DIFFICULTY_SET: 'difficulty_set',
    },
    syncInterval: 60000 // Redis同步间隔(ms)
  },
  security: {
    rateLimits: {
      windowMs: 60 * 1000,
      max: 1000
    }
  }
};

module.exports = config;