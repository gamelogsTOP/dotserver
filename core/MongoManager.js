const mongoose = require('mongoose');
const config = require('../config');
const logger = require('../utils/logger');

class MongoManager {
  constructor() {
    this.isConnected = false;
    mongoose.connection.on('connected', () => {
      this.isConnected = true;
      logger.info('MongoDB connected successfully');
    });

    mongoose.connection.on('error', (err) => {
      logger.error('MongoDB connection error:', err);
    });

    mongoose.connection.on('disconnected', () => {
      this.isConnected = false;
      logger.warn('MongoDB disconnected');
    });
  }

  async connect() {
    if (this.isConnected) return;

    try {
      await mongoose.connect(config.mongodb.uri, config.mongodb.options);
    } catch (error) {
      logger.error('MongoDB connection failed:', error);
      throw error;
    }
  }

  async disconnect() {
    if (!this.isConnected) return;

    try {
      await mongoose.disconnect();
      logger.info('MongoDB disconnected successfully');
    } catch (error) {
      logger.error('MongoDB disconnect error:', error);
      throw error;
    }
  }
}

module.exports = new MongoManager();