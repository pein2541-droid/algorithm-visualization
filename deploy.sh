#!/bin/bash

# Python算法动画演示应用部署脚本
# 生产环境部署自动化脚本

set -e  # 遇到错误立即退出

echo "🚀 开始部署 Python算法动画演示应用..."

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# 函数：打印带颜色的信息
print_info() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# 检查依赖
check_dependencies() {
    print_info "检查系统依赖..."
    
    # 检查Node.js
    if ! command -v node &> /dev/null; then
        print_error "Node.js 未安装，请先安装Node.js 18+"
        exit 1
    fi
    
    # 检查Python
    if ! command -v python3 &> /dev/null; then
        print_error "Python3 未安装，请先安装Python 3.8+"
        exit 1
    fi
    
    # 检查pip
    if ! command -v pip3 &> /dev/null; then
        print_error "pip3 未安装，请先安装pip3"
        exit 1
    fi
    
    print_info "系统依赖检查通过 ✓"
}

# 安装前端依赖
install_frontend_deps() {
    print_info "安装前端依赖..."
    
    if [ -f "package.json" ]; then
        npm install
        print_info "前端依赖安装完成 ✓"
    else
        print_error "未找到package.json文件"
        exit 1
    fi
}

# 安装后端依赖
install_backend_deps() {
    print_info "安装后端依赖..."
    
    if [ -f "api/requirements.txt" ]; then
        cd api
        pip3 install -r requirements.txt
        cd ..
        print_info "后端依赖安装完成 ✓"
    else
        print_error "未找到api/requirements.txt文件"
        exit 1
    fi
}

# 构建前端
build_frontend() {
    print_info "构建前端应用..."
    
    npm run build
    
    if [ -d "dist" ]; then
        print_info "前端构建完成 ✓"
    else
        print_error "前端构建失败"
        exit 1
    fi
}

# 设置环境变量
setup_environment() {
    print_info "设置环境变量..."
    
    # 创建生产环境配置文件
    if [ ! -f "api/.env.production" ]; then
        cat > api/.env.production << EOF
# 生产环境配置
DATABASE_URL=postgresql://username:password@localhost:5432/algorithm_animation_production
JWT_SECRET_KEY=$(openssl rand -base64 32)
FLASK_ENV=production
FLASK_DEBUG=False
SECRET_KEY=$(openssl rand -base64 32)
EOF
        print_info "生产环境配置文件已创建 ✓"
    else
        print_warning "生产环境配置文件已存在，跳过创建"
    fi
}

# 初始化数据库
init_database() {
    print_info "初始化数据库..."
    
    cd api
    python3 -c "
from app import app, db
with app.app_context():
    try:
        db.create_all()
        print('数据库表创建成功')
    except Exception as e:
        print(f'数据库初始化失败: {e}')
        exit(1)
"
    cd ..
    print_info "数据库初始化完成 ✓"
}

# 创建系统服务
create_system_service() {
    print_info "创建系统服务..."
    
    # 创建systemd服务文件
    sudo tee /etc/systemd/system/algorithm-animation.service > /dev/null << EOF
[Unit]
Description=Python算法动画演示应用
After=network.target

[Service]
Type=simple
User=www-data
WorkingDirectory=$(pwd)/api
Environment=FLASK_ENV=production
ExecStart=$(which python3) app.py
Restart=always
RestartSec=10

[Install]
WantedBy=multi-user.target
EOF

    sudo systemctl daemon-reload
    print_info "系统服务创建完成 ✓"
}

# 配置Nginx
setup_nginx() {
    print_info "配置Nginx..."
    
    # 创建Nginx配置文件
    sudo tee /etc/nginx/sites-available/algorithm-animation > /dev/null << EOF
server {
    listen 80;
    server_name your-domain.com;
    
    # 前端静态文件
    location / {
        root $(pwd)/dist;
        try_files \$uri \$uri/ /index.html;
        add_header Cache-Control "no-cache, no-store, must-revalidate";
        add_header Pragma "no-cache";
        add_header Expires "0";
    }
    
    # API代理
    location /api/ {
        proxy_pass http://127.0.0.1:5000;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
    }
    
    # 静态资源缓存
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
        root $(pwd)/dist;
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
EOF

    # 启用站点
    sudo ln -sf /etc/nginx/sites-available/algorithm-animation /etc/nginx/sites-enabled/
    sudo nginx -t
    print_info "Nginx配置完成 ✓"
}

# 启动服务
start_services() {
    print_info "启动服务..."
    
    # 启动后端服务
    sudo systemctl enable algorithm-animation
    sudo systemctl start algorithm-animation
    
    # 重启Nginx
    sudo systemctl restart nginx
    
    print_info "服务启动完成 ✓"
}

# 检查服务状态
check_services() {
    print_info "检查服务状态..."
    
    # 检查后端服务
    if sudo systemctl is-active --quiet algorithm-animation; then
        print_info "后端服务运行正常 ✓"
    else
        print_error "后端服务未运行"
        exit 1
    fi
    
    # 检查Nginx
    if sudo systemctl is-active --quiet nginx; then
        print_info "Nginx运行正常 ✓"
    else
        print_error "Nginx未运行"
        exit 1
    fi
}

# 显示部署信息
show_deployment_info() {
    print_info "部署完成！应用信息如下："
    echo "=================================="
    echo "应用名称: Python算法动画演示"
    echo "前端地址: http://your-domain.com"
    echo "API地址: http://your-domain.com/api"
    echo "后端服务: algorithm-animation"
    echo "=================================="
    echo "管理命令："
    echo "  启动服务: sudo systemctl start algorithm-animation"
    echo "  停止服务: sudo systemctl stop algorithm-animation"
    echo "  重启服务: sudo systemctl restart algorithm-animation"
    echo "  查看状态: sudo systemctl status algorithm-animation"
    echo "  查看日志: sudo journalctl -u algorithm-animation -f"
    echo "=================================="
}

# 主部署流程
main() {
    print_info "开始部署流程..."
    
    check_dependencies
    install_frontend_deps
    install_backend_deps
    build_frontend
    setup_environment
    init_database
    create_system_service
    setup_nginx
    start_services
    check_services
    show_deployment_info
    
    print_info "🎉 部署完成！应用已成功部署到生产环境"
}

# 运行主函数
main "$@"