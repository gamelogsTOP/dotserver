const config = require('../config');
const logger = require('./logger');

/**
 * 验证事件数据的有效性
 * @param {Object} eventData - 要验证的事件数据
 * @returns {Object} 包含验证结果和错误信息的对象
 */
function validateEvent(eventData) {
  const errors = [];
  logger.debug('开始验证事件数据', { event_type: eventData.event_type });

  // 验证必需字段
  const requiredFields = ['user_id', 'session_id', 'event_type', 'timestamp'];
  requiredFields.forEach(field => {
    if (!eventData[field]) {
      const error = `缺少必填字段: ${field}`;
      logger.warn(error, { user_id: eventData.user_id });
      errors.push(error);
    }
  });

  // 验证事件类型是否有效
  if (eventData.event_type && !Object.values(config.events.types).includes(eventData.event_type)) {
    const error = `无效的事件类型: ${eventData.event_type}`;
    logger.warn(error, { user_id: eventData.user_id });
    errors.push(error);
  }

  // 验证时间戳格式
  if (eventData.timestamp && !isValidISODate(eventData.timestamp)) {
    const error = '时间戳格式无效，需要 ISO 格式';
    logger.warn(error, { 
      user_id: eventData.user_id, 
      timestamp: eventData.timestamp 
    });
    errors.push(error);
  }

  // 验证数字字段
  if (eventData.game_score && typeof eventData.game_score !== 'number') {
    const error = 'game_score 必须是数字类型';
    logger.warn(error, { 
      user_id: eventData.user_id, 
      game_score: eventData.game_score 
    });
    errors.push(error);
  }

  if (eventData.game_play_time && typeof eventData.game_play_time !== 'number') {
    const error = 'game_play_time 必须是数字类型';
    logger.warn(error, { 
      user_id: eventData.user_id, 
      game_play_time: eventData.game_play_time 
    });
    errors.push(error);
  }

  // 验证自定义参数格式
  if (eventData.custom_params && typeof eventData.custom_params !== 'object') {
    const error = 'custom_params 必须是一个对象';
    logger.warn(error, { user_id: eventData.user_id });
    errors.push(error);
  }

  // 验证设备信息
  if (eventData.device_info && typeof eventData.device_info !== 'object') {
    const error = 'device_info 必须是一个对象';
    logger.warn(error, { user_id: eventData.user_id });
    errors.push(error);
  }

  const isValid = errors.length === 0;
  logger.debug('事件数据验证完成', { 
    user_id: eventData.user_id,
    event_type: eventData.event_type,
    isValid,
    errors: errors.length > 0 ? errors : undefined
  });

  return { isValid, errors };
}

function validateUserEvent(eventData) {
  const errors = [];
  logger.debug('开始验证用户事件数据', { user_id: eventData.user_id });

  // 验证必需字段
  const requiredFields = ['user_id', 'session_id', 'event_type', 'timestamp'];
  requiredFields.forEach(field => {
    if (!eventData[field]) {
      const error = `缺少必填字段: ${field}`;
      logger.warn(error, { user_id: eventData.user_id });
      errors.push(error);
    }
  });

  // 验证时间戳格式
  if (eventData.timestamp && !isValidISODate(eventData.timestamp)) {
    const error = '时间戳格式无效，需要 ISO 格式';
    logger.warn(error, { 
      user_id: eventData.user_id, 
      timestamp: eventData.timestamp 
    });
    errors.push(error);
  }

  // 验证设备信息
  if (eventData.device_info && typeof eventData.device_info !== 'object') {
    const error = 'device_info 必须是一个对象';
    logger.warn(error, { user_id: eventData.user_id });
    errors.push(error);
  }

  const isValid = errors.length === 0;
  logger.debug('用户事件数据验证完成', {
    user_id: eventData.user_id,
    event_type: eventData.event_type,
    isValid,
    errors: errors.length > 0 ? errors : undefined
  });

  return { isValid, errors };
}

function isValidISODate(dateString) {
  try {
    const date = new Date(dateString);
    return date instanceof Date && !isNaN(date) && dateString.includes('T');
  } catch (error) {
    logger.error('日期格式验证失败', { dateString, error: error.message });
    return false;
  }
}

module.exports = {
  validateEvent,
  validateUserEvent
};