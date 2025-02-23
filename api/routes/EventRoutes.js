const express = require('express');
const router = express.Router();
const eventController = require('../controllers/EventController');
const rateLimiter = require('../../middlewares/rateLimiter');
const config = require('../../config');
const logger = require('../../utils/logger');

// 路由级别的日志记录中间件
router.use((req, res, next) => {
  logger.info(`事件服务请求: ${req.method} ${req.baseUrl}${req.path}`, {
    event_type: req.body.event_type || req.query.event_type,
    user_id: req.body.user_id || req.query.user_id
  });
  next();
});

// 健康检查路由
router.get('/health', (req, res) => {
    res.status(200).json({ 
        status: 'OK',
        timestamp: new Date().toISOString(),
        service: 'event-service'
    });
});

// 事件上报路由 - 使用频率限制
router.post('/save', rateLimiter, async (req, res) => {
    const event = req.body;
    const { user_id, session_id, event_type } = event;

    // 验证必填字段
    if (!user_id || !session_id || !event_type) {
        return res.status(400).json({ 
            error: '缺少必填字段',
            required: ['user_id', 'session_id', 'event_type']
        });
    }

    // 验证事件类型
    if (!Object.values(config.events.types).includes(event_type)) {
        return res.status(400).json({ 
            error: '无效的事件类型',
            type: event_type,
            allowedTypes: Object.values(config.events.types)
        });
    }

    try {
        await eventController.saveEvent(req, res);
    } catch (error) {
        res.status(500).json({
            error: '事件保存失败',
            message: error.message
        });
    }
});

// 查询事件路由
router.get('/info', async (req, res) => {
    const { user_id, from_date, to_date, event_type } = req.query;

    // 验证必填参数
    if (!user_id) {
        return res.status(400).json({ error: '缺少 user_id 参数' });
    }

    try {
        await eventController.getEvents(req, res);
    } catch (error) {
        res.status(500).json({
            error: '获取事件数据失败',
            message: error.message
        });
    }
});

// 批量事件上报路由
router.post('/batch', rateLimiter, async (req, res) => {
    const { events } = req.body;

    if (!Array.isArray(events) || events.length === 0) {
        return res.status(400).json({ error: '无效的事件数组' });
    }

    try {
        const results = await Promise.all(
            events.map(event => eventController.handleEvent(event))
        );
        res.status(200).json({ success: true, count: results.length });
    } catch (error) {
        res.status(500).json({
            error: '批量事件处理失败',
            message: error.message
        });
    }
});

// 删除事件路由 (仅用于测试环境)
if (process.env.NODE_ENV === 'development') {
    router.delete('/:eventId', async (req, res) => {
        try {
            await eventController.deleteEvent(req.params.eventId);
            res.status(200).json({ message: '事件已删除' });
        } catch (error) {
            res.status(500).json({
                error: '删除事件失败',
                message: error.message
            });
        }
    });
}

module.exports = router;