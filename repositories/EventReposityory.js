const Event = require('../models/Event');
const logger = require('../utils/logger');

class EventRepository {
  async create(eventData) {
    try {
      const event = new Event(eventData);
      await event.save();
      logger.info(`Event saved: ${eventData.event_type} for user: ${eventData.user_id}`);
      return event;
    } catch (error) {
      logger.error(`Failed to save event: ${error.message}`);
      throw error;
    }
  }

  async findByUserId(userId, options = {}) {
    try {
      const { sort = { timestamp: -1 }, limit } = options;
      return await Event.find({ user_id: userId }).sort(sort).limit(limit);
    } catch (error) {
      logger.error(`Failed to find events for user ${userId}: ${error.message}`);
      throw error;
    }
  }

  async findBySessionId(sessionId) {
    try {
      return await Event.find({ session_id: sessionId });
    } catch (error) {
      logger.error(`Failed to find events for session ${sessionId}: ${error.message}`);
      throw error;
    }
  }
}

module.exports = EventRepository;