const User = require('../../models/User');
const Event = require('../../models/Event');
const redisManager = require('../../core/RedisManager');
const logger = require('../../utils/logger');
const { validateUserEvent } = require('../../utils/Validators');

class UserController {
  async registerUser(req, res) {
    const eventData = req.body;
    const { user_id, session_id, event_type, device_info, timestamp } = eventData;

    try {
      // 验证事件数据
      const validationResult = validateUserEvent(eventData);
      if (!validationResult.isValid) {
        return res.status(400).json({
          error: '无效的用户事件数据',
          details: validationResult.errors
        });
      }

      // 检查用户是否已存在
      const userKey = `user_${user_id}`;
      const existingUser = await User.findOne({ user_id });

      // 构造用户数据
      const userData = {
        user_id,
        device_info,
        last_session_id: session_id,
        last_active: timestamp || new Date().toISOString(),
        metadata: {
          registration_event: event_type,
          ...eventData
        }
      };

      if (existingUser) {
        // 更新用户信息
        Object.assign(existingUser, userData);
        await existingUser.save();
        await redisManager.setSession(userKey, userData);

        logger.info('用户信息已更新', { user_id });
        return res.status(200).json({
          success: true,
          message: '用户信息已更新',
          user: existingUser
        });
      }

      // 创建新用户
      const user = new User(userData);
      await user.save();
      await redisManager.setSession(userKey, userData);

      logger.info('新用户已创建', { user_id });
      res.status(201).json({
        success: true,
        message: '用户创建成功',
        user
      });

    } catch (error) {
      logger.error('用户注册失败:', error);
      res.status(500).json({
        success: false,
        error: '用户注册失败',
        message: error.message
      });
    }
  }

  async getUsers(req, res) {
    try {
      const users = await User.find({}, '-metadata');
      res.status(200).json({
        success: true,
        count: users.length,
        users
      });
    } catch (error) {
      logger.error('获取用户列表失败:', error);
      res.status(500).json({
        success: false,
        error: '获取用户列表失败'
      });
    }
  }

  async getUserInfo(req, res) {
    try {
      const { user_id } = req.params;
      
      // 获取用户基本信息
      const user = await User.findOne({ user_id })
        .select('user_id last_active device_info')
        .lean();

      if (!user) {
        logger.warn('用户不存在', { user_id });
        return res.status(404).json({
          success: false,
          error: '用户不存在'
        });
      }

      // 获取最近的事件
      const recentEvents = await Event.find({ user_id })
        .select('event_type timestamp game_score device_info')
        .sort({ timestamp: -1 })
        .limit()//10
        .lean();

      // 格式化事件数据
      const events = recentEvents.map(event => ({
        type: event.event_type,
        time: event.timestamp,
        score: event.game_score,
        device: {
          platform: event.device_info?.platform,
          browser: event.device_info?.browser,
          os: event.device_info?.os
        }
      }));

      logger.info('获取用户信息成功', {
        user_id,
        events_count: events.length
      });

      // 返回格式化的响应
      res.status(200).json({
        success: true,
        data: {
          user: {
            id: user.user_id,
            last_active: user.last_active,
            device: user.device_info
          },
          events: events,
          stats: {
            total_events: events.length,
            last_activity: events[0]?.time
          }
        }
      });

    } catch (error) {
      logger.error('获取用户信息失败', {
        error: error.message,
        user_id: req.params.user_id
      });

      res.status(500).json({
        success: false,
        error: '获取用户信息失败',
        message: process.env.NODE_ENV === 'development' ? error.message : '服务器内部错误'
      });
    }
  }

}

module.exports = new UserController();