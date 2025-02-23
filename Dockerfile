# 使用 Node.js LTS 版本作为基础镜像
FROM node:18-alpine

# 设置工作目录
WORKDIR /app

# 安装 PM2
RUN npm install pm2 -g

# 创建日志目录结构
RUN mkdir -p /app/logs/pm2

# 复制 package.json 和 package-lock.json
COPY package*.json ./

# 安装依赖
RUN npm ci --production

# 复制项目文件
COPY . .

# 暴露端口
EXPOSE 13258

# 使用 PM2 运行服务
CMD ["pm2-runtime", "ecosystem.config.js"]