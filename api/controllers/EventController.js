const EventService = require('../../services/EventService');
const logger = require('../../utils/logger');
const { validateEvent } = require('../../utils/Validators');

class EventController {
  constructor() {
    this.eventService = new EventService();
  }

  async saveEvent(req, res) {
    try {
      const eventData = req.body;

      logger.info('接收到事件上报', {
        event_type: eventData.event_type,
        user_id: eventData.user_id
      });

      // 验证事件数据
      const validationResult = validateEvent(eventData);
      if (!validationResult.isValid) {
        logger.warn('事件数据验证失败', {
          errors: validationResult.errors,
          data: eventData
        });
        return res.status(400).json({
          error: '无效的事件数据',
          details: validationResult.errors
        });
      }

      // 添加IP地址和设备信息
      eventData.ip_address = req.ip;
      eventData.device_info = {
        ...eventData.device_info,
        user_agent: req.get('user-agent')
      };

      const result = await this.eventService.handleEvent(eventData);

      logger.info('事件处理成功', {
        event_type: eventData.event_type,
        user_id: eventData.user_id,
        event_id: result._id
      });
  
      res.status(200).json({
        success: true,
        event: {
          id: result._id,
          type: result.event_type,
          timestamp: result.timestamp
        }
      });
    } catch (error) {
      logger.error('事件处理失败', {
        error: error.message,
        event_type: req.body.event_type,
        user_id: req.body.user_id
      });
  
      // 区分错误类型
      if (error.code === 11000) {
        return res.status(409).json({
          success: false,
          error: '事件重复',
          message: '该事件已经被记录'
        });
      }
  
      res.status(500).json({
        success: false,
        error: '事件处理失败',
        message: process.env.NODE_ENV === 'development' ? error.message : '服务器内部错误'
      });
    }
  }

  async getEvents(req, res) {
    try {
      const { user_id, from_date, to_date, event_type } = req.query;

      const events = await this.eventService.getEvents({
        user_id,
        from_date: from_date ? new Date(from_date) : undefined,
        to_date: to_date ? new Date(to_date) : undefined,
        event_type
      });

      res.status(200).json({
        success: true,
        count: events.length,
        events
      });
    } catch (error) {
      logger.error('Error in getEvents:', error);
      res.status(500).json({
        error: 'Internal server error',
        message: error.message
      });
    }
  }
}

module.exports = new EventController();