# 部署指南

## 概述

本指南详细介绍Python算法动画演示应用的部署流程，包括开发环境搭建、生产环境配置、自动化部署等步骤。

## 系统要求

### 开发环境
- **Node.js**: 18.0.0 或更高版本
- **Python**: 3.8.0 或更高版本
- **npm/pnpm**: 最新版本
- **Git**: 版本控制系统

### 生产环境
- **操作系统**: Ubuntu 20.04 LTS / CentOS 8 / Windows Server 2019+
- **Web服务器**: Nginx 1.18+ / Apache 2.4+
- **数据库**: PostgreSQL 15+ / SQLite 3.35+
- **Python环境**: Python 3.8+ 和 pip
- **进程管理**: systemd / PM2 / Supervisor

## 开发环境部署

### 1. 克隆项目
```bash
git clone https://github.com/your-repo/python-algorithm-animation.git
cd python-algorithm-animation
```

### 2. 安装前端依赖
```bash
npm install
# 或使用 pnpm
pnpm install
```

### 3. 安装后端依赖
```bash
cd api
pip install -r requirements.txt
cd ..
```

### 4. 配置环境变量
创建 `.env` 文件：
```bash
# 前端环境变量
VITE_API_URL=http://localhost:5000/api
VITE_APP_TITLE=Python算法动画演示

# 后端环境变量 (api/.env)
DATABASE_URL=sqlite:///algorithm_animation.db
JWT_SECRET_KEY=your-development-secret-key
FLASK_ENV=development
FLASK_DEBUG=True
```

### 5. 初始化数据库
```bash
cd api
python app.py
# 数据库表会自动创建
cd ..
```

### 6. 启动开发服务器
```bash
# 同时启动前端和后端
npm run dev

# 或分别启动
npm run dev:frontend  # 前端开发服务器
npm run dev:backend   # 后端开发服务器
```

## 生产环境部署

### 方案一：传统服务器部署

#### 1. 服务器准备
```bash
# Ubuntu/Debian
sudo apt update && sudo apt upgrade -y
sudo apt install -y nginx postgresql python3-pip nodejs npm

# CentOS/RHEL
sudo yum update -y
sudo yum install -y nginx postgresql python3-pip nodejs npm
```

#### 2. 数据库配置
```bash
# PostgreSQL配置
sudo -u postgres psql
CREATE DATABASE algorithm_animation_production;
CREATE USER algo_user WITH PASSWORD 'your-strong-password';
GRANT ALL PRIVILEGES ON DATABASE algorithm_animation_production TO algo_user;
\q
```

#### 3. 应用部署
```bash
# 克隆项目
git clone https://github.com/your-repo/python-algorithm-animation.git
cd python-algorithm-animation

# 运行部署脚本
chmod +x deploy.sh
sudo ./deploy.sh
```

#### 4. Nginx配置
```nginx
server {
    listen 80;
    server_name your-domain.com;
    
    # 前端静态文件
    location / {
        root /path/to/your/project/dist;
        try_files $uri $uri/ /index.html;
        
        # 缓存控制
        location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
            expires 1y;
            add_header Cache-Control "public, immutable";
        }
    }
    
    # API代理
    location /api/ {
        proxy_pass http://127.0.0.1:5000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        
        # 超时设置
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }
    
    # WebSocket支持（如需要）
    location /socket.io/ {
        proxy_pass http://127.0.0.1:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
    }
}
```

#### 5. SSL证书配置
```bash
# 使用Let's Encrypt
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d your-domain.com

# 自动续期
sudo crontab -e
# 添加：0 12 * * * /usr/bin/certbot renew --quiet
```

### 方案二：Docker容器化部署

#### 1. 创建Dockerfile
```dockerfile
# 前端构建
FROM node:18-alpine as frontend-builder
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build

# 后端构建
FROM python:3.9-slim as backend-builder
WORKDIR /app
COPY api/requirements.txt ./
RUN pip install --no-cache-dir -r requirements.txt
COPY api/ ./

# 最终镜像
FROM python:3.9-slim
WORKDIR /app

# 安装系统依赖
RUN apt-get update && apt-get install -y \
    postgresql-client \
    && rm -rf /var/lib/apt/lists/*

# 复制后端代码
COPY --from=backend-builder /app ./api/

# 复制前端构建结果
COPY --from=frontend-builder /app/dist ./dist/

# 创建非root用户
RUN useradd -m -u 1000 appuser && chown -R appuser:appuser /app
USER appuser

# 启动命令
CMD ["python", "api/app.py"]
```

#### 2. Docker Compose配置
```yaml
version: '3.8'

services:
  postgres:
    image: postgres:15
    environment:
      POSTGRES_DB: algorithm_animation_production
      POSTGRES_USER: algo_user
      POSTGRES_PASSWORD: your-strong-password
    volumes:
      - postgres_data:/var/lib/postgresql/data
    ports:
      - "5432:5432"
    networks:
      - app-network

  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"
    networks:
      - app-network

  app:
    build: .
    ports:
      - "5000:5000"
    environment:
      - DATABASE_URL=postgresql://algo_user:your-strong-password@postgres:5432/algorithm_animation_production
      - REDIS_URL=redis://redis:6379/0
      - JWT_SECRET_KEY=your-production-secret-key
      - FLASK_ENV=production
    depends_on:
      - postgres
      - redis
    networks:
      - app-network
    volumes:
      - ./logs:/app/logs

  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf
      - ./ssl:/etc/nginx/ssl
      - ./logs:/var/log/nginx
    depends_on:
      - app
    networks:
      - app-network

volumes:
  postgres_data:

networks:
  app-network:
    driver: bridge
```

#### 3. 启动服务
```bash
# 构建和启动
docker-compose up -d

# 查看状态
docker-compose ps

# 查看日志
docker-compose logs -f
```

### 方案三：云服务平台部署

#### 1. Vercel部署（前端）
```bash
# 安装Vercel CLI
npm i -g vercel

# 部署
vercel --prod

# 配置环境变量
vercel env add VITE_API_URL production
```

#### 2. Heroku部署（后端）
```bash
# 安装Heroku CLI
npm i -g heroku

# 登录
heroku login

# 创建应用
heroku create your-app-name

# 设置环境变量
heroku config:set DATABASE_URL=your-database-url
heroku config:set JWT_SECRET_KEY=your-secret-key

# 部署
git push heroku main
```

#### 3. AWS部署
```bash
# 使用AWS Elastic Beanstalk
pip install awsebcli

# 初始化
eb init -p python-3.8 your-app-name

# 创建环境
eb create production-env

# 部署
eb deploy
```

## 性能优化

### 1. 前端优化
```bash
# 启用Gzip压缩
# Nginx配置
gzip on;
gzip_types text/plain text/css application/json application/javascript text/xml application/xml application/xml+rss text/javascript;

# 代码分割
# Vite配置
export default {
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          ui: ['@headlessui/react', '@heroicons/react']
        }
      }
    }
  }
}
```

### 2. 后端优化
```python
# 启用缓存
from flask_caching import Cache

cache = Cache(config={
    'CACHE_TYPE': 'redis',
    'CACHE_REDIS_URL': 'redis://localhost:6379/0'
})

# 数据库连接池
app.config['SQLALCHEMY_ENGINE_OPTIONS'] = {
    'pool_size': 10,
    'pool_recycle': 3600,
    'pool_pre_ping': True
}
```

### 3. 数据库优化
```sql
-- 创建索引
CREATE INDEX CONCURRENTLY idx_algorithms_type ON algorithms(type);
CREATE INDEX CONCURRENTLY idx_learning_records_user_id ON learning_records(user_id);

-- 表分区（大数据量时）
CREATE TABLE learning_records_partitioned (
    LIKE learning_records INCLUDING ALL
) PARTITION BY RANGE (learned_at);
```

## 监控与日志

### 1. 应用监控
```bash
# 安装监控工具
pip install prometheus-flask-exporter

# 配置监控指标
from prometheus_flask_exporter import PrometheusMetrics
PrometheusMetrics(app)
```

### 2. 日志配置
```python
import logging
from logging.handlers import RotatingFileHandler

# 配置日志
handler = RotatingFileHandler('app.log', maxBytes=10000, backupCount=3)
handler.setLevel(logging.INFO)
app.logger.addHandler(handler)
```

### 3. 健康检查
```bash
# 创建健康检查脚本
#!/bin/bash
# health-check.sh

curl -f http://localhost:5000/api/health || exit 1
```

## 备份与恢复

### 1. 数据库备份
```bash
# 自动备份脚本
#!/bin/bash
# backup.sh

DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="/backup/postgresql"
DB_NAME="algorithm_animation_production"

pg_dump -U postgres -h localhost $DB_NAME > $BACKUP_DIR/backup_$DATE.sql

# 删除7天前的备份
find $BACKUP_DIR -name "backup_*.sql" -mtime +7 -delete
```

### 2. 文件备份
```bash
# 配置文件备份
rsync -av --exclude='node_modules' --exclude='__pycache__' /app/ /backup/app/
```

## 故障排除

### 常见问题

#### 1. 前端构建失败
```bash
# 清除缓存
npm cache clean --force
rm -rf node_modules package-lock.json
npm install
```

#### 2. 后端依赖问题
```bash
# 重新安装依赖
pip uninstall -r requirements.txt -y
pip install -r requirements.txt
```

#### 3. 数据库连接失败
```bash
# 检查PostgreSQL状态
sudo systemctl status postgresql

# 检查连接配置
sudo -u postgres psql -c "\conninfo"
```

#### 4. Nginx配置错误
```bash
# 测试配置
sudo nginx -t

# 查看错误日志
sudo tail -f /var/log/nginx/error.log
```

## 维护与更新

### 1. 代码更新
```bash
# 拉取最新代码
git pull origin main

# 更新依赖
npm install
pip install -r requirements.txt

# 重启服务
sudo systemctl restart algorithm-animation
sudo systemctl restart nginx
```

### 2. 数据库迁移
```bash
# 创建迁移脚本
python manage.py db migrate -m "Description of changes"

# 应用迁移
python manage.py db upgrade
```

### 3. 回滚操作
```bash
# 代码回滚
git revert <commit-hash>

# 数据库回滚
python manage.py db downgrade
```

## 安全建议

### 1. 系统安全
```bash
# 更新系统
sudo apt update && sudo apt upgrade -y

# 配置防火墙
sudo ufw allow 22
sudo ufw allow 80
sudo ufw allow 443
sudo ufw enable
```

### 2. 应用安全
```bash
# 配置HTTPS
# 使用强密码策略
# 启用CSRF保护
# 实施输入验证
```

### 3. 数据库安全
```bash
# 限制数据库访问
# 使用强密码
# 定期备份
# 启用SSL连接
```

---

本部署指南将随着应用的发展持续更新，确保部署过程的安全性和可靠性。