# 算法可视化项目 - 快速上线脚本

## 方案A：Vercel（前端）+ Render（后端）— 全免费

### 前端 → Vercel（2分钟）
```bash
# 在项目目录执行：
npm install -g vercel
vercel --prod
```
按提示登录，确认后自动部署。拿到网址如 xxx.vercel.app。

### 后端 → Render（5分钟）
1. 打开 https://render.com 注册
2. 点 "New Web Service"
3. 连接 GitHub 仓库（需要先 push 代码）

---

## 方案B：阿里云 ECS（你已经想好的方案）

### 你需要做的（在你本地终端运行）：
```bash
cd "C:\Users\啊\Desktop\2325253211+黎涵+毕业设计初稿\bi_ye_she_ji_2"

# 1. 初始化 Git
git init
git add -A
git commit -m "v1.0"

# 2. 购买阿里云 ECS 后，上传文件
scp -r dist/ root@你的服务器IP:/var/www/algorithm-app/
scp -r api/  root@你的服务器IP:/var/www/algorithm-app/

# 3. SSH 登录服务器按 DEPLOY.md 操作
ssh root@你的服务器IP
```
