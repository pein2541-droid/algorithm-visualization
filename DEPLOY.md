# 算法可视化项目 - 云服务器部署指南

## 概述

本项目包含两部分：
- **前端**：React + Vite，构建后为纯静态文件（`dist/` 目录）
- **后端**：Python Flask API（端口 5000），数据库已用 Neon.tech 免费 PostgreSQL

## 一、本地准备

### 1. 构建前端
```bash
npm install
npm run build
```
构建完成后 `dist/` 目录即为前端静态文件。

### 2. 修改后端密钥
编辑 `api/.env`，修改：
```
JWT_SECRET_KEY=改成你自己的随机字符串
```

### 3. 打包上传文件
将以下文件/目录上传到服务器：
- `dist/` — 前端静态文件
- `api/` — 后端代码
- `requirements.txt` — 移到了 api/ 目录下

---

## 二、服务器环境配置（Ubuntu/CentOS）

### 1. 安装基础软件
```bash
# Ubuntu
sudo apt update
sudo apt install -y python3 python3-pip python3-venv nginx

# CentOS  
sudo yum install -y python3 python3-pip nginx
```

### 2. 安装 Node.js（如果需要重新构建）
```bash
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs
```

### 3. 创建应用目录
```bash
sudo mkdir -p /var/www/algorithm-app
sudo chown $USER:$USER /var/www/algorithm-app
```

---

## 三、部署后端

### 1. 上传后端代码
```bash
# 在本地执行，将文件上传到服务器
scp -r api/ root@你的服务器IP:/var/www/algorithm-app/
```

### 2. 安装 Python 依赖
```bash
cd /var/www/algorithm-app/api
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
```

### 3. 配置环境变量
确保 `api/.env` 文件存在并包含正确的数据库连接：
```
DATABASE_URL=postgresql://...你的Neon.tech连接字符串...
JWT_SECRET_KEY=你的密钥
```

### 4. 创建 systemd 服务
```bash
sudo tee /etc/systemd/system/algorithm-api.service > /dev/null << 'EOF'
[Unit]
Description=Algorithm Animation API
After=network.target

[Service]
Type=simple
User=www-data
WorkingDirectory=/var/www/algorithm-app/api
Environment=PATH=/var/www/algorithm-app/api/venv/bin
ExecStart=/var/www/algorithm-app/api/venv/bin/gunicorn -w 4 -b 127.0.0.1:5000 app:app
Restart=always
RestartSec=5

[Install]
WantedBy=multi-user.target
EOF

sudo systemctl daemon-reload
sudo systemctl enable algorithm-api
sudo systemctl start algorithm-api
```

检查状态：
```bash
sudo systemctl status algorithm-api
```

---

## 四、部署前端 + Nginx

### 1. 上传前端文件
```bash
scp -r dist/ root@你的服务器IP:/var/www/algorithm-app/
```

### 2. 配置 Nginx
```bash
sudo tee /etc/nginx/sites-available/algorithm-app > /dev/null << 'EOF'
server {
    listen 80;
    server_name _;  # 用IP访问，或替换为你的域名

    # 前端静态文件
    root /var/www/algorithm-app/dist;
    index index.html;

    # SPA 路由支持
    location / {
        try_files $uri $uri/ /index.html;
    }

    # API 代理到后端
    location /api/ {
        proxy_pass http://127.0.0.1:5000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }

    # 静态资源缓存
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2)$ {
        expires 30d;
        add_header Cache-Control "public, immutable";
    }
}
EOF

# 启用站点
sudo ln -sf /etc/nginx/sites-available/algorithm-app /etc/nginx/sites-enabled/
sudo rm -f /etc/nginx/sites-enabled/default

# 测试配置并重启
sudo nginx -t
sudo systemctl restart nginx
```

---

## 五、验证部署

1. 浏览器访问 `http://你的服务器IP` — 应显示首页
2. 访问 `http://你的服务器IP/algorithms` — 应显示算法列表
3. 检查 API：`curl http://你的服务器IP/api/algorithms`

---

## 六、常用运维命令

```bash
# 查看后端日志
sudo journalctl -u algorithm-api -f

# 重启后端
sudo systemctl restart algorithm-api

# 重启 Nginx
sudo systemctl restart nginx

# 更新前端（本地重新构建后）
npm run build
scp -r dist/* root@服务器IP:/var/www/algorithm-app/dist/
```

---

## 七、阿里云安全组配置

在阿里云控制台 → 安全组 → 添加规则：
- 端口 80（HTTP）：允许 0.0.0.0/0
- 端口 443（HTTPS）：允许 0.0.0.0/0（如果后续配置SSL）
- 端口 22（SSH）：允许你的IP

---

## 注意事项

1. **数据库已上云**：使用 Neon.tech 免费 PostgreSQL，无需在服务器安装数据库
2. **首次启动**：后端启动时会自动创建数据库表和种子数据
3. **域名**：如果不买域名，直接用服务器IP访问即可
4. **HTTPS**：后续可申请免费 SSL 证书（Let's Encrypt）
