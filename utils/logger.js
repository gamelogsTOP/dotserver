const winston = require('winston');
const DailyRotateFile = require('winston-daily-rotate-file');
const colors = require('colors/safe');

// 定义日志级别颜色
const levelColors = {
  error: 'red',
  warn: 'yellow',
  info: 'green',
  debug: 'blue'
};

// 自定义日志格式化函数
const customFormat = winston.format.printf(({ level, message, timestamp, ...metadata }) => {
  const coloredLevel = colors[levelColors[level]](level.toUpperCase().padEnd(5));
  const coloredTimestamp = colors.gray(timestamp);
  
  // 如果有额外的元数据，添加到消息中
  let logMessage = typeof message === 'string' ? message : '';
  const metadataStr = Object.keys(metadata).length > 0 || typeof message === 'object'
    ? JSON.stringify(typeof message === 'object' ? message : metadata)
    : '';

  // 标准化日志格式
  return `${coloredTimestamp} [${coloredLevel}] ${logMessage}${metadataStr ? ` ${metadataStr}` : ''}`;
});

// 日志格式化器
const logFormat = winston.format.combine(
  winston.format.timestamp({
    format: 'YYYY-MM-DD HH:mm:ss.SSS'
  }),
  winston.format.metadata({ fillExcept: ['message', 'level', 'timestamp'] }),
  customFormat
);

const logger = winston.createLogger({
  level: 'info',
  format: logFormat,
  transports: [
    new winston.transports.Console(),
    new winston.transports.DailyRotateFile({
      filename: 'logs/application-%DATE%.log',
      datePattern: 'YYYY-MM-DD',
      zippedArchive: true,
      maxSize: '20m',
      maxFiles: '14d',
      format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.json()
      )
    })
  ]
});

// 请求日志中间件
logger.requestLogger = () => {
  return (req, res, next) => {
    const start = Date.now();
    
    res.on('finish', () => {
      const duration = Date.now() - start;
      logger.info('HTTP', {
        req: {
          method: req.method,
          path: req.path,
          query: req.query,
          body: req.method !== 'GET' ? req.body : undefined
        },
        res: {
          status: res.statusCode,
          duration: `${duration}ms`
        },
        client: {
          ip: req.ip,
          userAgent: req.get('user-agent')
        }
      });
    });
    
    next();
  };
};

module.exports = logger;