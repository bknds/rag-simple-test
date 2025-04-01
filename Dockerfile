# 使用较高版本的 Node.js 来支持安装特定版本的 Node.js
FROM node:20-alpine
# FROM registry.cn-hangzhou.aliyuncs.com/acs/node:20-alpine

# 设置工作目录
WORKDIR /app

# 复制 package.json 和 package-lock.json 到工作目录
COPY package*.json ./

# 安装依赖
RUN npm install

# 复制项目文件到工作目录
COPY . .

# 暴露应用运行端口
EXPOSE 3100

# 允许构建时指定构建参数，默认为 'production'
ARG NODE_ENV=production
# 设置环境变量
ENV NODE_ENV=$NODE_ENV

ENV NUXT_HOST=0.0.0.0
ENV NUXT_PORT=3100
# 构建应用
RUN npm run build:$NODE_ENV
# 启动应用
CMD ["npm", "run", "start"]