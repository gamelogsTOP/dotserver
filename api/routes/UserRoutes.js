const express = require('express');
const router = express.Router();
const userController = require('../controllers/UserController');
const rateLimiter = require('../../middlewares/rateLimiter');
const logger = require('../../utils/logger');

// 路由级别的日志记录中间件
router.use((req, res, next) => {
  logger.info(`用户服务请求: ${req.method} ${req.baseUrl}${req.path}`, {
    user_id: req.body.user_id || req.query.user_id || req.params.user_id
  });
  next();
});
// 健康检查路由
router.get('/health', (req, res) => {
    res.status(200).json({ 
        status: 'OK',
        timestamp: new Date().toISOString(),
        service: 'user-service'
    });
});

// 用户注册/更新路由
router.post('/register', rateLimiter, userController.registerUser);

// 获取用户列表路由
router.get('/list', userController.getUsers);

// 获取指定用户信息路由
router.get('/:user_id', userController.getUserInfo);

module.exports = router;