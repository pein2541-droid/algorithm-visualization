# 算法动画演示系统 (Algorithm Animation Demo)

> **毕业设计项目** —— 基于 React + Flask 的全栈算法交互式可视化学习平台

---

## 一、项目概述

本项目是一个面向算法初学者的 **交互式算法可视化学习平台**。核心目标是将经典算法的执行过程以 **动画形式** 直观呈现在网页上，帮助学习者理解抽象的算法逻辑。

### 核心特性

- **交互式动画**：支持播放/暂停、单步执行（前进/后退）、速度调节（0.5x / 1x / 1.5x / 2x）
- **伪代码同步高亮**：动画每执行一步，对应的伪代码行同步高亮（如冒泡排序的 compare→第4行、swap→第5行）
- **10种经典算法**：覆盖排序、查找、树遍历、动态规划、图遍历五大类型
- **角色权限体系**：学生（student）、教师（teacher）、管理员（admin）三级角色
- **学习追踪**：记录用户对每个算法的学习时长、进度状态，支持收藏
- **深色/浅色主题**：全局主题切换，持久化存储
- **管理后台**：完整的仪表盘、用户管理、算法/分类/材料 CRUD

### 技术栈

| 层级 | 技术 | 版本 |
|------|------|------|
| 前端框架 | React + TypeScript | 18.2 |
| 构建工具 | Vite | 4.5 |
| CSS 框架 | Tailwind CSS | 3.3 |
| 全局状态 | Zustand | 4.4 |
| 路由 | React Router DOM | 6.20 |
| HTTP 客户端 | Axios | 1.6 |
| 3D/Canvas | Three.js + @react-three/fiber + @react-three/drei | 0.158 |
| 图标 | Heroicons + Lucide React | — |
| 后端框架 | Flask | 2.3 |
| ORM | SQLAlchemy + Flask-SQLAlchemy | 2.0 |
| 认证 | Flask-JWT-Extended (JWT) | 4.5 |
| 序列化 | Marshmallow | 3.20 |
| 密码哈希 | bcrypt | 4.0 |
| 数据库 | SQLite(开发) / PostgreSQL(生产) | — |
| 生产 WSGI | Gunicorn | 21.2 |

---

## 二、完整目录树

```
bi_ye_she_ji_2/
│
├── .claude/                          # Claude AI IDE 本地配置
│   └── settings.local.json           #   Claude 项目级设置
│
├── .trae/                            # Trae IDE 项目设计文档
│   └── documents/
│       ├── python_algorithm_animation_prd.md          # 产品需求文档 (PRD)
│       └── python_algorithm_animation_tech_arch.md    # 技术架构文档
│
├── .vercel/                          # Vercel 平台部署配置
│   └── project.json                  #   Vercel 项目元信息
│
├── .venv/                            # Python 虚拟环境（本地依赖隔离）
│   ├── Include/                      #   C 头文件（如 greenlet）
│   ├── Lib/site-packages/            #   已安装的 Python 包（Flask/SQLAlchemy/bcrypt 等）
│   ├── Scripts/                      #   虚拟环境可执行文件（python.exe / pip.exe / flask.exe）
│   └── pyvenv.cfg                    #   虚拟环境配置（Python 版本、路径）
│
├── api/                              # ═══ 后端 Flask 应用 ═══
│   ├── .env                          #   后端环境变量（DATABASE_URL / JWT_SECRET_KEY / FLASK_ENV）
│   ├── .env.example                  #   环境变量模板（不含敏感值）
│   ├── app.py                        #   ★ Flask 主入口：路由定义、中间件、数据库初始化、种子数据
│   ├── models.py                     #   ★ SQLAlchemy 数据模型：7 张表的 ORM 定义
│   ├── schemas.py                    #   ★ Marshmallow 序列化 Schema：输出字段白名单控制
│   ├── requirements.txt              #   Python 依赖清单（12 个核心包）
│   ├── instance/
│   │   └── algorithm_animation.db    #   SQLite 数据库文件（开发环境自动生成）
│   └── services/
│       ├── animation_service.py      #   ★ 动画生成核心：按算法类型分发生成步骤序列
│       ├── user_service.py           #   ★ 用户服务：注册/登录/学习记录/统计
│       └── admin_service.py          #   ★ 管理服务：仪表盘统计/用户/算法/分类/材料 CRUD
│
├── dist/                             # 前端 Vite 构建产物（npm run build 生成）
│   ├── index.html                    #   构建后的 SPA 入口
│   ├── favicon.svg                   #   网站图标
│   └── assets/
│       ├── index-2371f602.js         #   业务代码 Bundle（含 source map）
│       └── index-399704d6.css        #   样式 Bundle（Tailwind 编译输出）
│
├── docs/                             # ═══ 项目文档 ═══
│   ├── api_documentation.md          #   API 接口文档：全部路由 + 请求/响应格式 + 错误码
│   ├── core_code.md                  #   核心代码说明：逐模块讲解实现逻辑
│   ├── database_design.md            #   数据库设计：7 表 DDL + 字段说明 + 索引策略
│   ├── deployment_guide.md           #   部署指南：开发/Docker/云平台 + Nginx + 监控 + 备份
│   ├── design_results.md             #   阶段设计成果：系统架构图 + ER 图 + 字段定义表
│   └── diagrams/
│       ├── system_overview.mmd       #   系统架构 Mermaid 源文件
│       └── system_overview.svg       #   系统架构 SVG 渲染图
│
├── public/                           # 静态资源（直接复制到 dist）
│   └── favicon.svg                   #   网站 favicon
│
├── src/                              # ═══ 前端 React 源码 ═══
│   ├── main.tsx                      #   应用入口：挂载 React 根节点到 #root
│   ├── App.tsx                       #   ★ 根组件：React Router 路由表 + 深色模式 class 注入
│   ├── index.css                     #   全局样式：Tailwind 指令 @tailwind base/components/utilities
│   ├── vite-env.d.ts                 #   Vite 环境类型声明
│   │
│   ├── assets/
│   │   └── react.svg                 #   React Logo 图标
│   │
│   ├── components/                   # ═══ 可复用组件 ═══
│   │   ├── Empty.tsx                 #   空状态占位组件（用于数据为空时的降级展示）
│   │   │
│   │   ├── admin/                    #   管理后台组件
│   │   │   ├── AdminLayout.tsx       #     后台布局：权限守卫（非 admin 跳转登录）+ 侧边栏 + 内容区
│   │   │   ├── AdminSidebar.tsx      #     侧边导航：仪表盘/用户管理/算法管理/内容管理 四个菜单
│   │   │   └── ConfirmDialog.tsx     #     通用确认对话框：标题 + 消息 + 取消/确认按钮
│   │   │
│   │   ├── Animation/
│   │   │   └── SortingAnimation.tsx  #     ★ 排序动画核心：冒泡/快排分步生成+Canvas 柱状图渲染+自动播放
│   │   │
│   │   ├── Home/                     #   首页子组件
│   │   │   ├── HeroSection.tsx       #     Hero 区：大标题 + CTA 按钮 + 嵌入式动画预览 + 功能标签
│   │   │   ├── FeatureCards.tsx      #     功能特性卡片：4 张卡片（动画演示/学习辅助/性能分析/个性化）
│   │   │   └── PopularAlgorithms.tsx #     热门算法入口：排序/查找/树 三个分类卡片，含算法列表
│   │   │
│   │   ├── Layout/                   #   全局布局组件
│   │   │   ├── Header.tsx           #     ★ 顶部导航：Logo + 导航链接 + 深色切换 + 登录/注册/用户菜单 + 移动端汉堡菜单
│   │   │   └── Footer.tsx           #     页脚：系统简介 + 快速链接 + 联系方式 + 版权
│   │   │
│   │   ├── Modals/
│   │   │   └── TutorialModal.tsx     #     新手引导模态框：4 步教程（选算法→看动画→调速度→查代码）
│   │   │
│   │   └── visualizations/           #   ★ 算法可视化组件（按算法类型分，懒加载）
│   │       ├── BubbleSortComponent.tsx     # 冒泡排序：柱状图 + compare/swap 动画
│   │       ├── DFSComponent.tsx            # 深度优先搜索：图节点着色 + 调用栈 + 回溯动画
│   │       ├── BFSComponent.tsx            # 广度优先搜索：图节点着色 + 队列出入动画
│   │       ├── BinaryTreeComponent.tsx     # 二叉树遍历：节点结构 + 前/中/后序遍历动画
│   │       ├── KnapsackComponent.tsx       # 0/1 背包 DP：表格填充动画 + 单元格高亮
│   │       └── SearchComponent.tsx         # 查找算法：数组高亮 + 搜索范围标注
│   │
│   ├── hooks/
│   │   └── useTheme.ts              #   主题 Hook：light/dark 切换 + localStorage 持久化 + 系统偏好检测
│   │
│   ├── lib/
│   │   └── utils.ts                 #   工具函数：cn() 类名合并（clsx + tailwind-merge）
│   │
│   ├── pages/                        # ═══ 页面组件 ═══
│   │   ├── Home.tsx                  #   首页：组合 HeroSection + FeatureCards + PopularAlgorithms + TutorialModal
│   │   ├── Algorithms.tsx            #   算法浏览页：按类型筛选（排序/查找/树/DP/图）+ 卡片网格 + 分页
│   │   ├── AlgorithmDetail.tsx       #   ★ 算法详情页：动画播放器 + 伪代码同步高亮 + 步骤描述 + 可视化组件
│   │   ├── Learning.tsx              #   学习资料页：分类导航 + 富文本内容 + 代码示例复制
│   │   ├── Profile.tsx               #   个人中心：用户信息 + 学习记录 + 收藏算法（需登录）
│   │   ├── Login.tsx                 #   登录页：用户名+密码表单 + JWT Token 存储
│   │   ├── Register.tsx              #   注册页：用户名+邮箱+密码 + 角色选择（学生/教师）
│   │   └── admin/
│   │       ├── AdminDashboard.tsx    #     仪表盘：4 个统计卡片 + 角色分布 + 热门算法排行
│   │       ├── AdminUsers.tsx        #     用户管理：搜索 + 分页列表 + 状态切换 + 删除（防误删弹窗）
│   │       ├── AdminAlgorithms.tsx   #     算法管理：CRUD 模态框 + 伪代码编辑 + 类型下拉
│   │       └── AdminContent.tsx      #     内容管理：Tab 切换（分类/材料）+ 排序+ CRUD
│   │
│   ├── store/
│   │   └── useStore.ts              #   ★ Zustand 全局状态：useAuthStore(认证) + useThemeStore(主题) + useAnimationStore(动画)
│   │
│   └── utils/
│       └── api.ts                    #   ★ Axios 封装：JWT 拦截器 + 401 自动登出 + 5 个 API 模块（auth/algorithm/learning/user/admin）
│
├── supabase/                         # Supabase/PostgreSQL 数据库初始化
│   └── init.sql                      #   完整 DDL：7 张表 + 索引 + 种子数据（管理员+9算法+4分类+3条材料）
│
├── .env                              # 前端环境变量（VITE_API_URL=/api）
├── .gitignore                        # Git 忽略规则（node_modules / dist / .venv / *.log 等）
├── .vercelignore                     # Vercel 部署忽略（node_modules / __pycache__ 等）
├── create_ppt.py                     # ★ 毕业答辩 PPT 生成脚本（python-pptx）
├── deploy.sh                         # ★ Linux 生产环境一键部署脚本（Bash）
├── eslint.config.js                  # ESLint 代码规范（TypeScript + React Hooks + React Refresh）
├── fix_dfs.js                        # DFS 组件编码修复脚本（Node.js 批量替换乱码字符）
├── index.html                        # 前端 SPA 入口 HTML（Vite 注入资源）
├── package.json                      # Node.js 项目元信息：依赖 + npm scripts
├── package-lock.json                 # npm 依赖版本锁定
├── postcss.config.js                 # PostCSS 配置（Tailwind + Autoprefixer）
├── tailwind.config.js                # Tailwind CSS 配置：自定义色板 + 中文字体 + 动画关键帧
├── tsconfig.json                     # TypeScript 编译配置（ES2020 + JSX + 路径别名 @/）
├── vercel.json                       # Vercel 路由重写：所有请求 → /index.html（SPA 模式）
└── vite.config.ts                    # ★ Vite 构建配置：路径别名 + API 代理 + 代码分割 + Trae Badge
```

---

## 三、根目录文件详解

### `index.html`
前端 SPA 的单页面入口。Vite 在构建时会自动注入 `<script>` 和 `<link>` 标签。包含 `<div id="root">` 作为 React 的挂载点，以及 `<link rel="icon" href="/favicon.svg">` 引用图标。

### `package.json`
项目的 Node.js 清单文件，定义了：
- **scripts**：
  - `npm run dev` → 使用 `concurrently` 同时启动前端（Vite dev server）和后端（`cd api && python app.py`）
  - `npm run build` → `tsc && vite build`，TypeScript 编译 + Vite 打包
  - `npm run lint` → ESLint 检查
- **核心依赖**：react、react-dom、react-router-dom（路由）、zustand（状态管理）、axios（HTTP）、tailwind-merge（类名合并）、@headlessui/react（无样式 UI 组件）、@heroicons/react + lucide-react（图标库）、three 系列（3D）、clsx（条件类名）
- **开发依赖**：TypeScript、Vite、Tailwind CSS、PostCSS、Autoprefixer、ESLint 全家桶

### `package-lock.json`
npm 依赖的精确版本锁定文件，确保团队协作和 CI/CD 中依赖版本一致。

### `vite.config.ts`
Vite 构建工具的核心配置：
- **路径别名**：通过 `vite-tsconfig-paths` 插件实现 `@/` → `./src/` 的映射
- **API 代理**：开发环境下 `/api` 请求代理到 `http://localhost:5000`，解决跨域问题
- **代码分割**：手动分包策略——
  - `vendor-react`：React 全家桶
  - `vendor-three`：Three.js 3D 库
  - `vendor-ui`：图标和 UI 组件库
  - `vendor-state`：Zustand
- **Source Map**：构建时生成 `hidden` 模式 source map（不暴露路径）
- **Trae Badge 插件**：右下角显示 "Built with Trae" 标识

### `tsconfig.json`
TypeScript 编译器配置：
- **target**：ES2020，输出现代 JS 语法
- **jsx**：`react-jsx`（React 17+ 的自动 JSX 转换，无需手动 `import React`）
- **strict**：关闭严格模式（`false`），降低开发门槛
- **baseUrl + paths**：`@/*` 映射到 `./src/*`
- **include**：覆盖 `src` 和 `api` 目录

### `tailwind.config.js`
Tailwind CSS 框架配置，定义了项目的外观体系：
- **darkMode**：`class` 模式——通过给 `<html>` 添加 `.dark` class 启用深色
- **自定义色板**：`primary`（teal 系）、`accent`（amber 系），完整 50—950 色阶
- **中文字体栈**：`Source Han Sans CN` → `Noto Sans CJK SC` → `PingFang SC` → `Microsoft YaHei` → `sans-serif`
- **自定义动画**：`fade-in`（淡入）、`slide-up`（从下方滑入）、`slide-down`（从上方滑入）、`scale-in`（缩放入场）
- **content**：扫描 `index.html` 和 `src/**/*.{js,ts,jsx,tsx}` 提取使用的 class

### `postcss.config.js`
PostCSS 后处理配置，集成 Tailwind CSS 插件（将 `@tailwind` 指令展开为实际的 CSS）和 Autoprefixer（自动添加浏览器前缀）。

### `eslint.config.js`
ESLint 扁平化配置文件（Flat Config），检查规则：
- 继承 `@eslint/js` 推荐规则 + TypeScript ESLint 推荐规则
- 启用 `react-hooks` 插件检查 Hooks 使用规范
- 启用 `react-refresh` 插件，确保组件只导出组件（警告级别）
- 忽略 `dist` 目录

### `.env`
前端环境变量文件，定义 `VITE_API_URL=/api`。在开发环境下，Vite 会通过代理将 `/api` 请求转发到后端（`localhost:5000`）；在生产环境下，通过 Nginx 反向代理或同域部署处理。

### `.gitignore`
Git 忽略规则，排除：
- `node_modules`、`dist`、`dist-ssr`（前端依赖和构建产物）
- `*.local`（本地配置文件）
- `.vscode/*`（编辑器配置）、`.idea`（JetBrains 配置）
- `.DS_Store`、`*.suo`、`*.sln`（系统文件）

### `.vercelignore`
Vercel 部署的额外忽略规则，排除 `node_modules` 和 Python 缓存目录 `__pycache__`。

### `vercel.json`
Vercel 部署的路由重写配置：`{"rewrites": [{"source": "/(.*)", "destination": "/index.html"}]}`——所有路径请求都重写到 `index.html`，由前端 React Router 接管路由（SPA 模式）。

### `deploy.sh`
**Linux 生产环境一键部署脚本**（Bash），自动化流程：
1. **依赖检查**：验证 Node.js、Python3、pip3 是否安装
2. **前端依赖安装**：`npm install`
3. **后端依赖安装**：`pip3 install -r api/requirements.txt`
4. **前端构建**：`npm run build`
5. **环境配置**：自动生成 `api/.env.production`，使用 `openssl rand -base64 32` 生成随机 JWT 密钥
6. **数据库初始化**：调用 Flask 的 `db.create_all()` 建表
7. **Systemd 服务**：创建 `/etc/systemd/system/algorithm-animation.service`，配置自动重启
8. **Nginx 配置**：创建站点配置、启用软链接、测试配置语法
9. **启动服务**：启动后端 + 重启 Nginx
10. **健康检查**：验证 backend 和 Nginx 是否运行正常

### `create_ppt.py`
**毕业答辩 PPT 生成脚本**。使用 `python-pptx` 库生成宽屏（13.333×7.5 英寸）演示文稿。特点：
- 深色海军蓝主题（`#0F172A` 背景）
- Teal 主色调 + 琥珀色强调色
- 自定义辅助函数：`add_bg()` 设置背景、`add_title_slide()` 创建标题页

### `fix_dfs.js`
**DFS 组件编码修复脚本**。在 Windows 环境下编译 `DFSComponent.tsx` 时出现中文编码为 � 乱码的问题。此脚本使用 Node.js `fs` 模块：
1. 读取 `src/components/visualizations/DFSComponent.tsx`
2. 通过 17 组正则替换，将 `�` 乱码恢复为正确的中文文本（如 `边列�?(` → `边列表 (`、`算法状�` → `算法状态` 等）
3. 写回文件

---

## 四、`api/` 后端详解

### `api/app.py` — Flask 主入口
整个后端应用程序的入口文件（565 行），承担以下职责：

**应用初始化**
```python
app = Flask(__name__)
db.init_app(app)      # SQLAlchemy 绑定
jwt = JWTManager(app) # JWT 认证
CORS(app)             # 跨域支持
```
- 从 `.env` 读取 `DATABASE_URL`（默认 `sqlite:///algorithm_animation.db`）和 `JWT_SECRET_KEY`
- JWT Token 过期时间设为 24 小时

**认证中间件 `admin_required`**
- 两层鉴权：先 `@jwt_required()` 验证 Token 有效性 → 再检查用户 `role_type == 'admin'`
- 非管理员返回 403 Forbidden

**种子数据函数 `seed_initial_data()`**
- 在应用首次启动时自动填充 9 种算法（冒泡排序、快速排序、归并排序、二分查找、线性查找、二叉树中序/后序遍历、0/1 背包 DP、DFS、BFS）
- 预检已存在则跳过，避免重复插入
- 每个算法包含：名称、类型、描述、时间/空间复杂度、伪代码（JSON 数组）

**路由全景（所有 API 端点）**

| 方法 | 路径 | 认证 | 功能 |
|------|------|------|------|
| POST | `/api/auth/register` | 无 | 用户注册（校验用户名/邮箱唯一性、bcrypt 密码哈希） |
| POST | `/api/auth/login` | 无 | 用户登录（校验密码 → 签发 JWT → 返回 user + token） |
| GET | `/api/algorithms` | 无 | 算法列表（支持 `?type=sorting&page=1&limit=20` 筛选分页） |
| GET | `/api/algorithms/<id>` | 无 | 单个算法详情（名称/类型/描述/复杂度/伪代码） |
| GET | `/api/algorithms/<id>/animation` | 无 | 算法动画步骤数据（优先查缓存，无则实时生成） |
| GET | `/api/learning/categories` | 无 | 学习分类列表（按 sort_order 排序） |
| GET | `/api/learning/categories/<id>/content` | 无 | 分类下的学习材料列表 |
| GET | `/api/user/profile` | JWT | 用户个人信息 + 最近 10 条学习记录 + 最近 10 条收藏 |
| POST | `/api/user/learning/<algo_id>` | JWT | 记录学习进度 |
| GET | `/api/admin/stats` | Admin | 仪表盘统计（总用户/算法/分类/材料/记录数 + 角色分布 + 热门算法） |
| GET/PUT/DELETE | `/api/admin/users/*` | Admin | 用户管理（搜索分页列表 + 状态切换 + 删除，保护 admin 账号） |
| POST/PUT/DELETE | `/api/admin/algorithms/*` | Admin | 算法 CRUD（校验 name/type 必填） |
| GET/POST/PUT/DELETE | `/api/admin/categories/*` | Admin | 分类 CRUD（支持 sort_order 排序） |
| GET/POST/PUT/DELETE | `/api/admin/materials/*` | Admin | 学习材料 CRUD（关联分类和算法） |

**启动逻辑**：`if __name__ == '__main__'` → 自动建表 + 种子数据 → 监听 `0.0.0.0:5000`

---

### `api/models.py` — 数据模型（ORM）
使用 SQLAlchemy ORM 定义 7 张数据表，所有主键统一使用 UUID 字符串（`uuid.uuid4()`），外键设置 `cascade='all, delete-orphan'` 确保级联删除。

| # | 表名 | 主键 | 核心字段 | 关联关系 |
|---|------|------|----------|----------|
| 1 | `users` | `user_id` | `username`(UNIQUE), `email`(UNIQUE), `password_hash`, `role_type`(student/teacher/admin), `status`(active/disabled), `created_at` | → learning_records, favorite_algorithms |
| 2 | `algorithms` | `algorithm_id` | `name`, `type`(sorting/searching/tree/dp/graph), `description`(TEXT), `time_complexity`, `space_complexity`, `pseudocode`(JSON) | → animation_data, learning_materials, learning_records, favorite_algorithms |
| 3 | `animation_data` | `animation_id` | `algorithm_id`(FK), `animation_steps`(JSON), `initial_data`(JSON), `visualization_type` | 属于 algorithms |
| 4 | `categories` | `category_id` | `name`, `description`(TEXT), `sort_order`(INT) | → learning_materials |
| 5 | `learning_materials` | `material_id` | `category_id`(FK), `algorithm_id`(FK, nullable), `title`, `content`(TEXT), `code_example`(JSON) | 属于 categories + algorithms |
| 6 | `learning_records` | `record_id` | `user_id`(FK), `algorithm_id`(FK), `learned_at`, `duration_seconds`, `progress_status`(not_started/in_progress/completed) | 属于 users + algorithms，唯一约束(user_id, algorithm_id) |
| 7 | `favorite_algorithms` | `favorite_id` | `user_id`(FK), `algorithm_id`(FK), `favorited_at` | 属于 users + algorithms，唯一约束(user_id, algorithm_id) |

---

### `api/schemas.py` — 序列化
使用 Marshmallow 定义 API 输出的字段白名单：
- **UserSchema**：暴露 `user_id`、`username`、`email`、`role_type`、`created_at`、`status`，隐藏 `password_hash`
- **AlgorithmSchema**：暴露所有算法字段，`pseudocode` 使用 `fields.Raw()` 透传 JSON
- 字段校验：`username` 长度 3-50、`role_type` 限定三种值、`type` 限定五种值

---

### `api/requirements.txt` — Python 依赖
| 包名 | 用途 |
|------|------|
| Flask==2.3.3 | Web 框架核心 |
| Flask-CORS==4.0.0 | 跨域资源共享 |
| Flask-JWT-Extended==4.5.3 | JWT 令牌认证 |
| Flask-SQLAlchemy==3.1.1 | ORM 集成 |
| SQLAlchemy==2.0.23 | 数据库抽象层 |
| psycopg2-binary==2.9.9 | PostgreSQL 数据库驱动 |
| redis==5.0.1 | Redis 缓存支持 |
| python-dotenv==1.0.0 | .env 环境变量加载 |
| werkzeug==2.3.7 | WSGI 工具库（Flask 依赖） |
| bcrypt==4.0.1 | 密码哈希（加盐） |
| marshmallow==3.20.1 | 对象序列化/反序列化 |
| gunicorn==21.2.0 | 生产环境 WSGI 服务器 |

---

### `api/services/animation_service.py` — ★ 动画生成核心
系统最核心的业务逻辑（517 行），负责根据算法类型动态生成动画步骤序列：

**类型分发机制 `generate_animation_data()`**：
- 生成 10 个随机整数作为初始数据
- 根据 `algorithm.type` 分发：
  - `sorting` → `_generate_sorting_animation()`
  - `searching` → `_generate_searching_animation()`
  - `tree` → `_generate_tree_animation()`
  - `dp` → `_generate_dp_animation()`
  - `graph` → `_generate_graph_animation()`
- 生成的步骤序列存入 `AnimationData` 表并返回

**冒泡排序动画 `_bubble_sort_animation()`**：
- 双层循环遍历数组
- 每步包含：
  - `step`：步骤序号
  - `action`：`compare`（比较）/ `swap`（交换）/ `complete`（完成）
  - `indices`：当前操作的两个索引
  - `data`：当前数组快照
  - `highlighted`：需要高亮的两个元素索引
  - `description`：中文描述（如"比较元素 42 和 17"）

**快速排序动画**：分区（pivot）+ 递归处理左右两部分

**图遍历动画（BFS/DFS）**：
- BFS：使用队列模拟，记录 `dequeue`/`enqueue` 动作、当前节点、已访问集合、队列内容
- DFS：使用递归模拟，记录 `visit`/`traverse` 动作、调用栈状态

**0/1 背包 DP 动画**：
- 5 个物品，容量 10
- 逐步填充 DP 表 `dp[i][w]`，每步记录：
  - `data`：完整 DP 表的二维数组快照
  - `highlighted_cell`：当前填充的单元格坐标 `[i, w]`
  - `description`：中文决策描述（"考虑物品3 (重6,值5)，容量8：max(不选=3, 选=3+5)"）

**可视化类型映射**：
| 算法类型 | visualization_type |
|----------|-------------------|
| sorting | `bar_chart` |
| searching | `array_highlight` |
| tree | `tree_structure` |
| dp | `matrix` |
| graph | `graph_traversal` |

---

### `api/services/user_service.py` — 用户服务
- **`register_user()`**：校验用户名/邮箱唯一性 → bcrypt 加盐哈希密码 → 入库，默认角色 `student`、状态 `active`
- **`authenticate_user()`**：按用户名查找 `status='active'` 用户 → `bcrypt.checkpw()` 验证密码
- **`get_user_by_id()`**：按 UUID 主键查用户
- **`update_user_profile()`**：仅允许更新 `email` 字段（安全白名单）
- **`record_learning_progress()`**：唯一约束 `(user_id, algorithm_id)` 保证同用户同算法只有一条记录，后续学习时累加 `duration_seconds` + 更新进度状态
- **`get_user_learning_stats()`**：统计学习记录总数、已完成数、总学习时长、最近 5 条记录

---

### `api/services/admin_service.py` — 管理服务
- **`get_dashboard_stats()`**：6 项统计（用户/算法/分类/材料/记录总数）+ 按角色分组统计 + 最近 5 个新用户 + 收藏数 Top5 算法
- **`get_all_users()`**：支持按 `username` 或 `email` 模糊搜索、分页（默认每页 20 条）、按创建时间倒序
- **`update_user_status()`**：切换 active/disabled 状态，保护 admin 角色不可被禁用
- **`delete_user()`**：物理删除，保护 admin 角色不可被删除
- **算法 CRUD**：`create_algorithm()`（校验 name/type 必填）、`update_algorithm()`（允许修改 name/type/description/复杂度/pseudocode）、`delete_algorithm()`（级联删除动画数据、学习材料、学习记录、收藏）
- **分类 CRUD**：`create_category()`（默认 sort_order=0）、`update_category()`（可拖拽排序）、`delete_category()`（级联删除学习材料）
- **学习材料 CRUD**：`create_material()` 支持关联 category_id + algorithm_id、`update_material()` 支持全字段修改、`delete_material()`

---

### `api/instance/algorithm_animation.db`
SQLite 数据库文件，由 Flask-SQLAlchemy 在应用首次启动时自动创建。包含 7 张表 + 种子数据。开发环境下零配置即可使用，切换生产环境时只需修改 `DATABASE_URL` 指向 PostgreSQL。

---

### `api/.env` / `api/.env.example`
后端环境变量：
```
DATABASE_URL=sqlite:///algorithm_animation.db
JWT_SECRET_KEY=your-secret-key-here
FLASK_ENV=development
FLASK_DEBUG=True
```
`.env.example` 是模板文件（不含敏感值），供团队成员参考。

---

## 五、`src/` 前端详解

### `src/main.tsx`
React 应用的挂载入口：
```tsx
ReactDOM.createRoot(document.getElementById('root')!).render(<App />)
```

### `src/App.tsx` — ★ 根组件 + 路由表
系统所有路由的集中定义，使用 React Router DOM v6 的 `<Routes>` + `<Route>` 模式：

| 路径 | 组件 | 说明 |
|------|------|------|
| `/` | `Home` | 首页 |
| `/algorithms` | `Algorithms` | 算法浏览（支持 `?type=sorting` 筛选） |
| `/algorithms/:type/:name` | `AlgorithmDetail` | 算法详情 + 动画演示 |
| `/learning` | `Learning` | 学习资料中心 |
| `/profile` | `Profile` | 个人中心（需登录） |
| `/login` | `Login` | 登录页 |
| `/register` | `Register` | 注册页 |
| `/admin` | `AdminDashboard` | 管理后台仪表盘 |
| `/admin/users` | `AdminUsers` | 用户管理 |
| `/admin/algorithms` | `AdminAlgorithms` | 算法管理 |
| `/admin/content` | `AdminContent` | 内容管理 |

根 `<div>` 上根据 `useThemeStore().isDark` 动态添加 `.dark` class，驱动 Tailwind 的深色模式。

---

### `src/pages/` — 页面组件（10 个）

#### `Home.tsx` — 首页
页面布局：Header → HeroSection → FeatureCards → PopularAlgorithms → Footer → TutorialModal

#### `Algorithms.tsx` — 算法浏览页
- **类型筛选按钮组**：排序/查找/树/DP/图，支持 `"全部算法"` 恢复
- **卡片网格**：3 列响应式布局（`grid-cols-1 md:grid-cols-2 lg:grid-cols-3`）
- 每张卡片显示：类型图标（渐变背景）+ 算法名称 + 描述 + 时间/空间复杂度 + "查看演示" 链接
- 加载时显示 6 个骨架屏占位卡片
- 空数据时显示友好提示

#### `AlgorithmDetail.tsx` — ★ 算法详情+动画页（核心页面）
双栏布局——主区域（动画可视化）+ 侧栏（步骤描述 + 伪代码）：

**动画播放控制栏**：
- `← 上一步` / `▶ 播放/暂停` / `下一步 →` / `↻ 重置`
- 速度调节：0.5x / 1x / 1.5x / 2x
- 使用 `setInterval` 按 `1000/speed` 毫秒间隔自动推进步骤

**可视化组件懒加载**：根据算法类型动态 `React.lazy()` 加载：
```tsx
const BubbleSortComponent = React.lazy(() => import('...'))
const DFSComponent = React.lazy(() => import('...'))
// ... etc
```

**伪代码同步高亮**：
- 根据当前动画步骤的 `action` 类型，映射到伪代码的对应行号
- 例如冒泡排序：`action='compare'` → 高亮第 4 行（`if arr[j] > arr[j+1]`），`action='swap'` → 高亮第 5 行（交换语句）
- 高亮行为黄色背景（`bg-yellow-100 text-yellow-800`）

**步骤数据更新**：`updateAnimationState()` 从 `animation_steps[currentStep]` 中提取：
- `data`：数组快照（传给可视化组件）
- `highlighted`/`highlighted_cell`：高亮元素索引
- `nodes`：图节点状态（BFS/DFS 专用）
- `frontier`：队列/栈内容

#### `Learning.tsx` — 学习资料页
- 左侧粘性导航：按 `sort_order` 排序的分类列表，带图标（算法简介/伪代码/时间复杂度/常见问题）
- 右侧内容区：富文本 HTML（`dangerouslySetInnerHTML`）+ JSON 代码示例 + 一键复制
- 首次加载自动选中第一个分类

#### `Profile.tsx` — 个人中心
- 未登录状态：显示 🔒 "请先登录" 提示
- 已登录：用户信息卡片（用户名、邮箱、角色、注册时间）+ 最近学习记录列表（含进度状态徽章）+ 收藏算法列表
- 学习时长格式化：`<60s` → "X秒"，`<3600s` → "X分钟"，否则 "X小时Y分钟"

#### `Login.tsx` — 登录页
- 用户名 + 密码表单，密码可切换明文/密文（👁 图标）
- 登录成功 → 存储 `token` 到 localStorage → 更新 Zustand `useAuthStore` → `navigate('/')` 跳转首页
- 登录失败 → 显示后端返回的错误信息（红色提示框）
- 底部链接：注册页 / 返回首页

#### `Register.tsx` — 注册页
- 用户名 + 邮箱 + 密码 + 确认密码 + 角色选择（学生/教师，默认学生）
- 前端校验：密码与确认密码一致、字段非空
- 注册成功 → 自动登录 → 跳转首页

#### `admin/AdminDashboard.tsx` — 仪表盘
- 4 个统计卡片（用户总数/算法数量/学习材料/学习记录），带 lucide-react 图标和颜色编码
- 角色分布：从 `users_by_role` 对象展示各角色数量
- 热门算法 Top5：按收藏数降序

#### `admin/AdminUsers.tsx` — 用户管理
- 搜索框：按用户名或邮箱模糊匹配
- 分页表格：10 条/页，显示用户名/邮箱/角色/状态/注册时间
- 操作：启用/禁用切换 + 删除（弹出 ConfirmDialog 确认）

#### `admin/AdminAlgorithms.tsx` — 算法管理
- 算法列表表格 + 新增/编辑模态框
- 编辑表单包含：名称、类型（5 选 1 下拉）、描述、时间复杂度、空间复杂度、伪代码（多行文本→JSON 数组拆分）
- 删除前弹出确认框

#### `admin/AdminContent.tsx` — 内容管理
- Tab 切换：分类管理 / 学习材料管理
- 分类管理：列表 + 新增/编辑表单（名称/描述/排序值）+ 删除
- 材料管理：分页列表 + 新增/编辑表单（标题/内容/关联分类/关联算法/代码示例）

---

### `src/components/` — 可复用组件（18 个）

#### `Layout/Header.tsx` — ★ 顶部导航
全局导航栏，sticky 固定顶部：
- **Logo 区**：`<CodeBracketIcon>` + "Python算法动画演示" 文字，点击回首页
- **导航链接**：首页 / 算法演示 / 学习资料（管理员额外显示"管理后台"）
- **高亮当前路由**：`pathname.startsWith(path)` 逻辑，活跃项显示 teal 高亮
- **深色模式切换**：☀/🌙 图标按钮，调用 `toggleTheme()`
- **用户区**：
  - 未登录：登录链接 + 注册按钮（teal 实色）
  - 已登录：用户名（链接到个人中心）+ 退出按钮
- **移动端适配**：`md:` 断点以上显示桌面导航，以下显示汉堡菜单按钮，展开后显示垂直菜单列表（含用户操作）

#### `Layout/Footer.tsx` — 页脚
三列网格布局：
- 系统简介 + 描述文字
- 快速链接（算法演示/学习资料/使用帮助）
- 联系方式（QQ群/邮箱/反馈）
- 底部版权声明

#### `Home/HeroSection.tsx` — Hero 区
- 大标题："算法可视化，学习更简单"（teal 渐变高亮）
- 副标题：介绍核心功能
- 两个 CTA 按钮："立即体验"（跳转 /algorithms）、"快速教程"（触发 TutorialModal）
- 功能标签：交互式动画 / 多算法支持 / 实时演示 / 学习友好
- 右侧：内嵌 `SortingAnimation` 组件，每 3 秒自动切换算法预览（冒泡→快排→二分查找）

#### `Home/FeatureCards.tsx` — 功能卡片
4 张特性卡片，带入场动画（按 index × 100ms 延迟依次出现）：
- 动画演示功能（teal）：暂停/继续播放、单步执行、速度调节、实时控制
- 学习辅助功能（yellow）：算法简介、伪代码展示、复杂度分析、理论支持
- 性能分析（blue）：时间复杂度、空间复杂度、性能对比、优化建议
- 个性化设置（purple）：主题切换、速度调节、界面定制、学习记录

#### `Home/PopularAlgorithms.tsx` — 热门算法
3 张分类入口卡片（排序/查找/树），每张含：
- 类型图标 + 渐变色
- 描述文字
- 该类别下的算法标签列表
- "查看详情" 链接（跳转 `/algorithms?type=xxx`）
- 底部 "查看全部算法" 按钮

#### `Modals/TutorialModal.tsx` — 新手引导
4 步教程模态框，通过 `window.addEventListener('showTutorial')` 监听 Hero 区的触发：
1. 第一步：选择算法
2. 第二步：观看动画
3. 第三步：调节速度
4. 第四步：查看代码
每步显示图标 + 标题 + 描述 + 详细说明，底部"开始体验"按钮关闭弹窗。

#### `Animation/SortingAnimation.tsx` — ★ 排序动画组件（核心）
前端独立实现的排序动画引擎，使用 Canvas/HTML 渲染（而非 Three.js）：
- **步骤生成器**（纯前端算法）：
  - `bubbleSortSteps()`：生成冒泡排序每一步的 compare/swap 快照
  - `quickSortSteps()`：生成快排每一步的 pivot/compare/swap 快照
  - `binarySearchSteps()`：生成二分查找的 mid 位置 + 范围缩小快照
- **自动播放模式**（Hero 区使用）：`autoPlay=true` 时自动循环
- **手动控制模式**（详情页使用）：受 `useAnimationStore` 管理

#### `visualizations/BubbleSortComponent.tsx` — 冒泡排序可视化
使用 Three.js `@react-three/fiber` 渲染 3D 柱状图：
- 每根柱子高度代表数组元素值
- 比较中的两根柱子高亮为黄色
- 交换中的两根柱子高亮为红色
- 已排序部分变为绿色

#### `visualizations/DFSComponent.tsx` — DFS 图遍历可视化
- 渲染 5 个节点的无向图（节点标签 A~E）
- 节点状态着色：未访问（灰色）、当前访问（teal）、已访问（绿色）
- 显示调用栈/frontier 信息
- 边遍历时高亮路径
- 支持随机生成图结构和重置

#### `visualizations/BFSComponent.tsx` — BFS 图遍历可视化
- 与 DFS 类似但使用队列模式
- 显示队列出入过程
- 节点着色 + 边高亮 + frontier 可视化

#### `visualizations/BinaryTreeComponent.tsx` — 二叉树可视化
- 渲染示例二叉树结构（节点 + 连线）
- 前序/中序/后序三种遍历模式的动画
- 当前访问节点高亮显示

#### `visualizations/KnapsackComponent.tsx` — 0/1 背包 DP 可视化
- 渲染 `(n+1) × (W+1)` 的 DP 表格
- 当前填充的单元格高亮（黄色背景）
- 每个单元格显示 `dp[i][w]` 的数值
- 行标签显示物品信息（重量/价值），列标签显示容量

#### `visualizations/SearchComponent.tsx` — 查找算法可视化
- 渲染有序数组的条形图
- 二分查找：标注 low/high/mid 指针，当前范围高亮
- 线性查找：逐个高亮当前检查元素

#### `admin/AdminLayout.tsx` — 后台布局守卫
- `useEffect` 检查认证状态和角色：非 admin → `navigate('/login')`
- 布局：Header + AdminSidebar（左）+ 内容区（右）+ Footer

#### `admin/AdminSidebar.tsx` — 后台侧边导航
4 个菜单项（仪表盘/用户管理/算法管理/内容管理），使用 lucide-react 图标，活跃项 teal 高亮

#### `admin/ConfirmDialog.tsx` — 确认对话框
通用弹窗组件：标题 + 消息 + 取消（灰色）+ 确认（红色），点击遮罩可关闭

#### `Empty.tsx` — 空状态组件
简单的居中占位组件，显示 "Empty" 文字（使用 `cn()` 合并类名）

---

### `src/store/useStore.ts` — ★ 全局状态管理（Zustand）

**`useAuthStore`**（认证状态，localStorage 持久化）：
```ts
{ user, token, isAuthenticated, setAuth(user, token), clearAuth() }
```
- 使用 `zustand/middleware` 的 `persist` 中间件，key 为 `auth-storage`

**`useThemeStore`**（主题状态，localStorage 持久化）：
```ts
{ isDark, toggleTheme(), setTheme(isDark) }
```
- 持久化 key 为 `theme-storage`

**`useAnimationStore`**（动画播放状态，非持久化）：
```ts
{ currentStep, isPlaying, speed, setCurrentStep(), setIsPlaying(), setSpeed(), resetAnimation() }
```
- `resetAnimation()` 将 `currentStep` 归零 + 停止播放

---

### `src/utils/api.ts` — ★ HTTP 客户端封装

**Axios 实例配置**：
- `baseURL`：`import.meta.env.VITE_API_URL || '/api'`（从 `.env` 读取）
- `timeout`：10 秒
- 默认 `Content-Type: application/json`

**请求拦截器**：自动从 `localStorage` 读取 `token`，附加 `Authorization: Bearer <token>` 头

**响应拦截器**：遇到 401 状态码 → 自动清除 token 和 user → 跳转 `/login`

**5 个 API 模块**（每个模块返回 Axios Promise）：

| 模块 | 方法 | 对应后端路由 |
|------|------|-------------|
| `authAPI` | `register()`, `login()` | `/auth/register`, `/auth/login` |
| `algorithmAPI` | `getAlgorithms()`, `getAlgorithm()`, `getAnimation()` | `/algorithms`, `/algorithms/:id`, `/algorithms/:id/animation` |
| `learningAPI` | `getCategories()`, `getCategoryContent()` | `/learning/categories`, `/learning/categories/:id/content` |
| `userAPI` | `getProfile()` | `/user/profile` |
| `adminAPI` | `getStats()` ~ `deleteMaterial()` 共 14 个方法 | 全部 `/admin/*` 路由 |

---

### `src/hooks/useTheme.ts` — 主题 Hook
独立主题管理 Hook（与 Zustand 版本互补）：
- 从 `localStorage` 读取保存的主题
- 若未保存则检测 `prefers-color-scheme: dark` 系统偏好
- 通过 `document.documentElement.classList` 切换 `light`/`dark` class
- 提供 `theme`、`toggleTheme()`、`isDark` 返回值

### `src/lib/utils.ts` — 工具函数
```ts
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
```
合并 `clsx`（条件类名组合）和 `tailwind-merge`（Tailwind 类名冲突解决），是组件中使用最频繁的工具函数。

---

## 六、`dist/` — 构建产物

`npm run build` 的输出目录：
- `dist/index.html` — 构建后的单页面入口，`<script>` 和 `<link>` 已注入哈希文件名
- `dist/assets/index-2371f602.js` — 业务逻辑 Bundle（含 React、组件、路由等）
- `dist/assets/index-2371f602.js.map` — Source Map（hidden 模式，不暴露在 JS 文件中）
- `dist/assets/index-399704d6.css` — Tailwind 编译输出 CSS（已 tree-shaking，仅含用到的 class）
- `dist/favicon.svg` — 从 `public/` 直接复制的图标

---

## 七、`docs/` — 项目文档

| 文件 | 内容 |
|------|------|
| `api_documentation.md` | 完整 API 文档：Base URL、认证方式、通用响应格式、HTTP 状态码、所有路由的请求/响应示例 |
| `core_code.md` | 核心代码说明：6 大模块（用户登录注册、动画生成、学习记录、算法数据、管理后台、数据模型）的实现逻辑 |
| `database_design.md` | 数据库设计：PostgreSQL DDL、表结构、字段约束、索引策略、ER 关系图 |
| `deployment_guide.md` | 部署指南：开发环境搭建、传统服务器（Nginx+systemd）、Docker、Vercel/Heroku/AWS、HTTPS/SSL、监控日志、备份恢复、安全加固 |
| `design_results.md` | 阶段设计成果：系统架构图、ER 图（Mermaid）、7 张表的字段定义总表 |
| `diagrams/system_overview.mmd` | Mermaid 架构图源文件（可用 mermaid-cli 渲染为图片） |
| `diagrams/system_overview.svg` | 已渲染的 SVG 架构图 |

---

## 八、`supabase/init.sql` — 数据库初始化脚本
完整的 PostgreSQL 数据库 DDL 脚本（216 行）：
- 7 张表的 `CREATE TABLE` 语句，含 CHECK 约束、外键 `ON DELETE CASCADE`、`UNIQUE` 约束
- 10 个索引（`username`、`email`、`role_type`、`algorithm type`、`algorithm name`、各类外键、`learned_at DESC` 等）
- 种子数据：默认管理员（admin/admin123，bcrypt 哈希）、9 种算法、4 个学习分类、3 条学习材料（含 Python/JavaScript 代码示例）

---

## 九、快速开始

### 环境要求
- **Node.js** ≥ 18
- **Python** ≥ 3.8
- **npm**（推荐使用 nvm 管理 Node 版本）

### 安装与运行

```bash
# 1. 克隆项目
git clone <repo-url>
cd bi_ye_she_ji_2

# 2. 安装前端依赖
npm install

# 3. 创建 Python 虚拟环境并安装后端依赖
python -m venv .venv
.venv\Scripts\activate   # Windows
# source .venv/bin/activate  # macOS/Linux
cd api && pip install -r requirements.txt && cd ..

# 4. 配置环境变量（已提供默认值，可直接运行）

# 5. 启动开发服务（前后端同时启动）
npm run dev
```

- 前端：`http://localhost:5173`
- 后端 API：`http://localhost:5000/api`
- 默认管理员：`admin` / `admin123`

### 构建生产版本

```bash
npm run build
```
产物输出到 `dist/` 目录，配合 Nginx + Gunicorn 部署到生产服务器（详见 `deploy.sh` 和 `docs/deployment_guide.md`）。

---

## 十、预设算法一览

| # | 算法名称 | 类型 | 时间复杂度 | 空间复杂度 | 可视化方式 |
|---|----------|------|------------|------------|------------|
| 1 | 冒泡排序 | sorting | O(n²) | O(1) | 柱状图 compare/swap |
| 2 | 快速排序 | sorting | O(n log n) | O(log n) | 柱状图 pivot/partition |
| 3 | 归并排序 | sorting | O(n log n) | O(n) | 数组分组合并 |
| 4 | 二分查找 | searching | O(log n) | O(1) | 数组 low/mid/high 指针 |
| 5 | 线性查找 | searching | O(n) | O(1) | 数组逐个扫描 |
| 6 | 中序遍历 | tree | O(n) | O(h) | 二叉树节点着色 |
| 7 | 后序遍历 | tree | O(n) | O(h) | 二叉树节点着色 |
| 8 | 0/1 背包 (DP) | dp | O(n·W) | O(n·W) | DP 表格填充 |
| 9 | DFS（深度优先搜索） | graph | O(V+E) | O(V) | 图节点着色 + 调用栈 |
| 10 | BFS（广度优先搜索） | graph | O(V+E) | O(V) | 图节点着色 + 队列 |

---

## 十一、系统架构

```
┌──────────────────────────────────────────────────────┐
│                    用户浏览器                          │
│  ┌──────────────────────────────────────────────┐    │
│  │     React SPA (Vite build → dist/)            │    │
│  │  ┌──────┐ ┌──────┐ ┌──────┐ ┌──────────┐   │    │
│  │  │Zustand│ │Router│ │Axios │ │可视化组件 │   │    │
│  │  │状态管理│ │路由  │ │HTTP  │ │(Three.js)│   │    │
│  │  └──────┘ └──────┘ └──┬───┘ └──────────┘   │    │
│  └───────────────────────┼──────────────────────┘    │
└──────────────────────────┼───────────────────────────┘
                           │ HTTP /api/*
                           ▼
┌──────────────────────────────────────────────────────┐
│                  Nginx (生产环境)                       │
│           静态文件 / → dist/    API /api → :5000      │
└──────────────────────┬───────────────────────────────┘
                       │
                       ▼
┌──────────────────────────────────────────────────────┐
│               Flask API Server (:5000)                 │
│  ┌──────────┐ ┌──────────┐ ┌──────────────────┐     │
│  │ JWT 认证 │ │ CORS     │ │ 动画生成 Service  │     │
│  │ 中间件   │ │ 中间件   │ │ (步骤序列引擎)    │     │
│  └──────────┘ └──────────┘ └──────────────────┘     │
│  ┌──────────────────────────────────────────────┐    │
│  │          SQLAlchemy ORM                        │    │
│  │   7 张表: users / algorithms / animation_data │    │
│  │   categories / learning_materials / records   │    │
│  │   / favorite_algorithms                       │    │
│  └──────────────────┬───────────────────────────┘    │
└─────────────────────┼────────────────────────────────┘
                      │
                      ▼
┌──────────────────────────────────────────────────────┐
│          SQLite (开发) / PostgreSQL (生产)              │
└──────────────────────────────────────────────────────┘
```
