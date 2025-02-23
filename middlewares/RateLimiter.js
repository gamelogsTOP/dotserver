const rateLimit = require('express-rate-limit');
const logger = require('../utils/logger');

module.exports = rateLimit({
  windowMs: 60 * 1000, // 1分钟
  max: 1000, // 每分钟最多1000次请求
  handler: (req, res) => {
    logger.warn(`Rate limit exceeded for IP: ${req.ip}`);
    res.status(429).json({ error: '请求过于频繁，请稍后再试' });
  },
});