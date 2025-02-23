const Event = require('../models/Event');
const logger = require('../utils/logger');
const config = require('../config');

class EventService {
  constructor() {
    this.model = Event;
  }

  async handleEvent(eventData) {
    try {
      // 检查是否已存在相同时间戳的事件
      const existingEvent = await Event.findOne({
        user_id: eventData.user_id,
        session_id: eventData.session_id,
        event_type: eventData.event_type,
        timestamp: new Date(eventData.timestamp)
      });

      if (existingEvent) {
        // 如果是分数事件，更新分数
        if (eventData.event_type === 'game_score') {
          existingEvent.game_score = eventData.game_score;
          existingEvent.metadata = {
            ...existingEvent.metadata,
            last_updated: new Date(),
            score_history: [
              ...(existingEvent.metadata?.score_history || []),
              {
                score: eventData.game_score,
                timestamp: new Date()
              }
            ]
          };

          const updatedEvent = await existingEvent.save();
          logger.info('游戏分数已更新', {
            event_id: updatedEvent._id,
            user_id: eventData.user_id,
            score: eventData.game_score
          });

          return updatedEvent;
        }
      }

      // 创建新事件
      const event = new Event({
        ...eventData,
        timestamp: new Date(eventData.timestamp)
      });

      const savedEvent = await event.save();
      logger.info('新事件已保存', {
        event_id: savedEvent._id,
        event_type: eventData.event_type,
        user_id: eventData.user_id
      });

      return savedEvent;
    } catch (error) {
      logger.error('事件处理错误', {
        error: error.message,
        event_type: eventData.event_type,
        user_id: eventData.user_id
      });
      throw error;
    }
  }

  async getEvents({ user_id, from_date, to_date, event_type }) {
    try {
      const query = {};

      if (user_id) query.user_id = user_id;
      if (event_type) query.event_type = event_type;
      if (from_date || to_date) {
        query.timestamp = {};
        if (from_date) query.timestamp.$gte = from_date;
        if (to_date) query.timestamp.$lte = to_date;
      }

      const events = await this.model.find(query).sort({ timestamp: -1 });
      return events;
    } catch (error) {
      logger.error('Error getting events:', error);
      throw error;
    }
  }

  normalizeEventData(event) {
    return {
      user_id: event.user_id,
      session_id: event.session_id,
      event_type: event.event_type,
      timestamp: new Date(event.timestamp || Date.now()),
      game_name: event.game_name,
      game_level: event.game_level,
      game_score: typeof event.game_score === 'object' ?
        (event.game_score.score || 0) :
        (event.game_score || 0),
      game_play_time: event.game_play_time,
      device_info: event.device_info,
      ip_address: event.ip_address,
      level_data: {
        level_number: event.level_number,
        max_level: event.max_level,
        difficulty: event.difficulty,
        progress: event.progress,
        rate: event.rate
      }
    };
  }

  async handleGameUptimeEvent(eventData) {
    // 处理游戏时长事件的特殊逻辑
    const event = new this.model({
      ...eventData,
      game_play_time: eventData.game_play_time || 0,
      timestamp: new Date()
    });

    await event.save();
    return event;
  }
}

module.exports = EventService;  // 导出类而不是实例