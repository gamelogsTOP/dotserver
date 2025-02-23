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
      env_development: {
        NODE_ENV: 'development',
        PORT: 13258
      },
      log_date_format: 'YYYY-MM-DD HH:mm:ss',
      error_file: './logs/pm2-error.log',
      out_file: './logs/pm2-out.log',
      merge_logs: true,
      max_memory_restart: '1G'
    }]
  };