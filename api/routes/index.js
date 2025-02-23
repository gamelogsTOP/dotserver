const express = require('express');
const router = express.Router();
const userRoutes = require('./UserRoutes');
const eventRoutes = require('./EventRoutes');
const logger = require('../../utils/logger');

// 路由前置日志
router.use((req, res, next) => {
  logger.info(`API请求: ${req.method} ${req.baseUrl}${req.path}`, {
    query: req.query,
    body: req.method !== 'GET' ? req.body : undefined
  });
  next();
});

// 健康检查路由 - 移到子路由注册之前
router.get('/health', (req, res) => {
  logger.info('健康检查请求');
  res.status(200).json({ 
    status: 'OK',
    timestamp: new Date().toISOString(),
    service: 'game-analytics',
    version: process.env.npm_package_version || '1.0.0'
  });
});

// 注册子路由
router.use('/users', userRoutes);
router.use('/events', eventRoutes);

// 捕获未匹配的路由
router.use('*', (req, res) => {
  logger.warn(`未找到路由: ${req.method} ${req.baseUrl}${req.path}`);
  res.status(404).json({
    error: '未找到请求的资源',
    path: `${req.baseUrl}${req.path}`
  });
});

module.exports = router;