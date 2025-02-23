const logger = require('../utils/logger');

/**
 * 全局错误处理中间件
 */
function errorlogs(err, req, res, next) {
  // 记录错误日志
  logger.error('全局错误处理:', {
    error: err.message,
    stack: err.stack,
    path: req.path,
    method: req.method
  });

  // 区分不同类型的错误
  if (err.name === 'ValidationError') {
    return res.status(400).json({
      error: '数据验证错误',
      details: err.message
    });
  }

  if (err.name === 'MongoError' || err.name === 'MongoServerError') {
    return res.status(500).json({
      error: '数据库错误',
      message: '服务器内部错误'
    });
  }

  // 默认错误响应
  res.status(err.status || 500).json({
    error: '服务器内部错误',
    message: process.env.NODE_ENV === 'development' ? err.message : '请稍后重试'
  });
}

module.exports = errorlogs;