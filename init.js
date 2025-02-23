const app = require('./app');
const logger = require('./utils/logger');

// 处理未捕获的异常
process.on('uncaughtException', (error) => {
  logger.error('未捕获的异常:', error);
  process.exit(1);
});

// 处理未处理的 Promise 拒绝
process.on('unhandledRejection', (error) => {
  logger.error('未处理的 Promise 拒绝:', error);
  process.exit(1);
});

// 启动应用
app.start()
  .catch(error => {
    logger.error('应用启动失败:', error);
    process.exit(1);
  });