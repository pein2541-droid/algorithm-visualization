# 核心代码与说明

## 1. 用户相关操作

### a) 登录模块

登录接口接收用户名与密码，调用 UserService 校验凭据，bcrypt 比对密码哈希，验证通过后由 Flask-JWT-Extended 签发 24 小时有效期的 access_token 并返回用户信息。前端持久化令牌到 localStorage 并更新 Zustand 全局状态，完成页面跳转。错误分支统一返回后端具体原因。接口见 app.py，逻辑见 services/user_service.py。

### b) 注册模块

注册接口校验用户名、邮箱与密码的完整性，通过 bcrypt 对密码加盐哈希后入库，对用户名与邮箱做唯一性检查防止重复注册。默认角色为 student，状态为 active。接口见 app.py，逻辑见 services/user_service.py。

---

## 2. 各功能相关操作

### a) 动画演示模块

动画接口根据算法 ID 先查询 AnimationData 表是否已有缓存数据，若无则调用 AnimationService 实时生成。AnimationService 根据算法类型分发生成逻辑：排序类生成 compare/swap 步骤序列并标注高亮索引；查找类标注查找范围与中间位置；树类构建示例二叉树并生成前/中/后序遍历步骤；动态规划类填充 dp 表格记录每个单元格的更新过程；图类以邻接表模拟 BFS 队列出入与 DFS 递归访问。每一步包含 step 序号、action 类型、当前数据快照、高亮元素与中文描述，生成后序列化为 JSON 存入 animation_steps 字段并持久化，同时返回 initial_data 与 visualization_type 供前端驱动对应可视化组件。接口见 app.py，核心逻辑见 services/animation_service.py。

### b) 使用记录模块

个人中心接口在鉴权后返回用户基本信息、最近 10 条学习记录与最近 10 条收藏算法，用于展示学习轨迹与快捷入口。学习记录模型包含学习时间 learned_at、持续时长 duration_seconds 与进度状态 progress_status（not_started / in_progress / completed），并通过 UniqueConstraint('user_id', 'algorithm_id') 保证同一用户对同一算法仅有一条记录，后续学习时更新时长与进度而非重复插入。收藏算法模型同样设置用户与算法的联合唯一约束，防止重复收藏。接口见 app.py，模型见 models.py。

### c) 算法数据模块

算法列表接口支持按 type（sorting / searching / tree / dp / graph）筛选与分页查询，返回分页信息含 page、limit、total 与 pages。算法详情接口按 UUID 主键返回单个算法的名称、类型、描述、时间/空间复杂度与伪代码。伪代码字段使用 JSON 类型存储为字符串数组，便于前端逐行渲染。算法模型以 UUID 字符串作为主键，通过级联关系关联 AnimationData、LearningMaterial、LearningRecord 与 FavoriteAlgorithm，删除算法时相关数据同步清理。接口见 app.py，模型见 models.py。

### d) 学习资料模块

分类接口按 sort_order 升序返回所有学习分类。分类内容接口根据 category_id 返回该分类下的学习材料列表，每条材料含标题、富文本内容与代码示例。学习材料模型同时关联分类 category_id 与算法 algorithm_id（可为空），代码示例 code_example 以 JSON 格式存储方便前端渲染为代码块。分类模型通过 sort_order 整数字段控制前端展示顺序。接口见 app.py，模型见 models.py。

### e) 管理后台模块

管理员接口统一通过 admin_required 装饰器进行双层鉴权——先通过 @jwt_required() 验证登录态，再检查用户 role_type 是否为 admin，非管理员返回 403。仪表盘统计接口汇总用户总数、算法总数、分类数、学习材料数、学习记录数，按角色分布统计用户构成，按收藏数排行展示热门算法。用户管理支持按用户名或邮箱模糊搜索、分页列表、状态启禁（保护管理员账号不可禁用或删除）与删除。算法、分类、学习材料均提供完整的 CRUD 接口，算法创建校验 name 与 type 必填，分类管理支持拖动排序的 sort_order 字段更新。接口见 app.py，逻辑见 services/admin_service.py。

### f) 数据模型总览

系统共 7 张表，所有主键统一使用 UUID 字符串（uuid.uuid4()），外键设置 cascade='all, delete-orphan' 保证级联删除，时间字段默认值使用 datetime.utcnow。User 表含 role_type（student / teacher / admin）与 status（active / disabled），通过 relationship 关联学习记录与收藏。Algorithm 表的 pseudocode 用 JSON 类型存储伪代码字符串数组，通过级联关系关联动画数据、学习材料、学习记录与收藏。AnimationData 表按 algorithm_id 关联算法，animation_steps 与 initial_data 以 JSON 存储动画快照。Category 表含 sort_order 整数字段控制排序，级联关联学习材料。LearningMaterial 表双向关联分类与算法，code_example 存 JSON。LearningRecord 与 FavoriteAlgorithm 均设置用户-算法的联合唯一约束保证数据规范。序列化层使用 Marshmallow 对输出字段做白名单控制，密码哈希等敏感字段不暴露给前端。模型定义见 models.py，序列化见 schemas.py。

---

## 3. 应用初始化与数据种子

应用启动时通过 create_all() 自动建表，随后执行 seed_initial_data() 预置 9 种算法的元信息（冒泡排序、快速排序、归并排序、二分查找、线性查找、二叉树中序遍历、0/1 背包 DP、DFS、BFS），每种算法含名称、类型、描述、时间/空间复杂度与伪代码。同时创建默认管理员账号（admin / admin123）。所有种子数据在插入前检查是否已存在，避免重复。配置从环境变量读取 DATABASE_URL（默认 SQLite）与 JWT_SECRET_KEY，JWT 过期时间设为 24 小时。初始化逻辑见 app.py。
