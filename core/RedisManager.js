const Redis = require('ioredis');
const config = require('../config');
const logger = require('../utils/logger');

class RedisManager {
  constructor() {
    this.client = null;
  }

  async connect() {
    try {
      this.client = new Redis({
        host: config.redis.host,
        port: config.redis.port,
        retryStrategy: (times) => {
          const delay = Math.min(times * 100, 5000);
          logger.warn(`Redis重连中... 尝试次数: ${times}`);
          return delay;
        }
      });

      // 设置事件监听器
      this.client.on('connect', () => {
        logger.info('Redis connected successfully');
      });

      this.client.on('error', (error) => {
        logger.error('Redis error:', error);
      });

      // 测试连接
      await this.client.ping();
      return this.client;
    } catch (error) {
      logger.error('Redis connection failed:', error);
      throw error;
    }
  }

  getClient() {
    if (!this.client) {
      throw new Error('Redis client not initialized. Call connect() first.');
    }
    return this.client;
  }

  async setSession(key, value, ttl = 3600) {
    const client = this.getClient();
    await client.set(key, JSON.stringify(value), 'EX', ttl);
  }

  async getSession(key) {
    const client = this.getClient();
    const data = await client.get(key);
    return data ? JSON.parse(data) : null;
  }

  async deleteSession(key) {
    const client = this.getClient();
    return await client.del(key);
  }
}

module.exports = new RedisManager();