const express = require('express');
const cors = require('cors');
const config = require('./config');
const logger = require('./utils/logger');
const routes = require('./api/routes/index');
const errorHandler = require('./middlewares/errorHandler');
const redisManager = require('./core/RedisManager');
const mongoManager = require('./core/MongoManager');

class Application {
  constructor() {
    this.app = express();
    this.setupMiddlewares();
    this.setupRoutes();
    this.setupErrorHandling();
  }

  async start() {
    try {
      await mongoManager.connect();
      await redisManager.connect();

      const server = this.app.listen(config.app.port, () => {
        logger.info(`Server started on port ${config.app.port}`);
      });

      // 优雅关闭处理
      this.setupGracefulShutdown(server);
    } catch (error) {
      logger.error('Failed to start application:', error);
      process.exit(1);
    }
  }

  setupGracefulShutdown(server) {
    const shutdown = async (signal) => {
      logger.info(`收到 ${signal} 信号，开始关闭服务器...`);

      // 设置超时强制退出
      const forceExit = setTimeout(() => {
        logger.error('强制关闭服务器（超时）');
        process.exit(1);
      }, 10000); // 10秒后强制退出

      try {
        // 停止接收新的请求
        server.close(async () => {
          logger.info('HTTP 服务器已停止接收新请求');

          try {
            // 关闭数据库连接
            await Promise.all([
              mongoManager.disconnect(),
              redisManager.disconnect()
            ]);

            logger.info('所有数据库连接已安全关闭');
            clearTimeout(forceExit);
            process.exit(0);
          } catch (error) {
            logger.error('关闭数据库连接时发生错误:', error);
            clearTimeout(forceExit);
            process.exit(1);
          }
        });

        // 设置连接超时
        server.setTimeout(5000, () => {
          logger.warn('正在等待活动连接关闭...');
        });
      } catch (error) {
        logger.error('关闭服务器时发生错误:', error);
        clearTimeout(forceExit);
        process.exit(1);
      }
    };

    // 监听各种终止信号
    const signals = ['SIGTERM', 'SIGINT', 'SIGUSR2'];
    signals.forEach(signal => {
      process.on(signal, () => shutdown(signal));
    });

    // 处理未捕获的异常和拒绝
    process.on('uncaughtException', (error) => {
      logger.error('未捕获的异常:', error);
      shutdown('uncaughtException');
    });

    process.on('unhandledRejection', (reason) => {
      logger.error('未处理的 Promise 拒绝:', reason);
      shutdown('unhandledRejection');
    });
  }

  setupMiddlewares() {
    this.app.use(express.json());
    this.app.use(cors());
    // 添加全局请求日志记录
    this.app.use(logger.requestLogger())
  }

  setupRoutes() {
    // 使用 /api 前缀挂载所有 API 路由
    this.app.use('/api', require('./api/routes'));

    // 根路径的健康检查（可选）
    // this.app.get('/health', (req, res) => {
    //   res.status(200).json({
    //     status: 'OK',
    //     timestamp: new Date().toISOString()
    //   });
    // });
  }

  setupErrorHandling() {
    this.app.use(errorHandler);
  }
}

module.exports = new Application();