module.exports = {
  apps: [{
    name: 'dot-server',
    script: './init.js',
    instances: 'max',  // 根据 CPU 核心数启动实例
    exec_mode: 'cluster',
    env: {
      NODE_ENV: 'production',
      PORT: 13258
    },
    // 日志配置
    log_date_format: 'YYYY-MM-DD HH:mm:ss',
    error_file: './logs/pm2/error.log',    // 错误日志路径
    out_file: './logs/pm2/out.log',        // 输出日志路径
    log_file: './logs/pm2/combined.log',   // 组合日志路径
    merge_logs: true,                       // 合并集群日志
    max_memory_restart: '1G'
  }]
};