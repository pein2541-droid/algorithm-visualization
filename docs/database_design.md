# 数据库设计文档

## 概述

Python算法动画演示应用使用PostgreSQL作为主数据库，存储用户信息、算法数据、学习记录等核心数据。数据库设计遵循第三范式，确保数据完整性和查询效率。

## 数据库架构

### 数据库配置
- **数据库类型**: PostgreSQL 15+
- **编码**: UTF-8
- **时区**: UTC
- **连接池**: 支持连接池配置

## 数据表结构

### 1. 用户表 (users)
存储系统用户信息，支持学生和教师两种角色。

```sql
CREATE TABLE users (
    user_id VARCHAR(36) PRIMARY KEY DEFAULT gen_random_uuid()::text,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role_type VARCHAR(20) NOT NULL CHECK (role_type IN ('student', 'teacher')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'disabled')),
    
    INDEX idx_users_username (username),
    INDEX idx_users_email (email),
    INDEX idx_users_role_type (role_type)
);
```

**字段说明**:
- `user_id`: UUID主键，字符串格式
- `username`: 用户名，唯一，长度3-50字符
- `email`: 邮箱地址，唯一
- `password_hash`: 密码哈希值（使用bcrypt加密）
- `role_type`: 用户角色（学生/教师）
- `created_at`: 创建时间
- `status`: 账户状态（活跃/禁用）

### 2. 算法表 (algorithms)
存储算法基本信息和配置。

```sql
CREATE TABLE algorithms (
    algorithm_id VARCHAR(36) PRIMARY KEY DEFAULT gen_random_uuid()::text,
    name VARCHAR(100) NOT NULL,
    type VARCHAR(50) NOT NULL CHECK (type IN ('sorting', 'searching', 'tree')),
    description TEXT,
    time_complexity VARCHAR(50),
    space_complexity VARCHAR(50),
    pseudocode JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    INDEX idx_algorithms_name (name),
    INDEX idx_algorithms_type (type)
);
```

**字段说明**:
- `algorithm_id`: UUID主键
- `name`: 算法名称
- `type`: 算法类型（排序/查找/树结构）
- `description`: 算法描述
- `time_complexity`: 时间复杂度
- `space_complexity`: 空间复杂度
- `pseudocode`: 伪代码（JSON格式）

### 3. 动画数据表 (animation_data)
存储算法的动画演示数据。

```sql
CREATE TABLE animation_data (
    animation_id VARCHAR(36) PRIMARY KEY DEFAULT gen_random_uuid()::text,
    algorithm_id VARCHAR(36) NOT NULL REFERENCES algorithms(algorithm_id) ON DELETE CASCADE,
    animation_steps JSONB NOT NULL,
    initial_data JSONB NOT NULL,
    visualization_type VARCHAR(50) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    INDEX idx_animation_data_algorithm_id (algorithm_id)
);
```

**字段说明**:
- `animation_id`: UUID主键
- `algorithm_id`: 关联算法ID
- `animation_steps`: 动画步骤数据（JSON格式）
- `initial_data`: 初始数据（JSON格式）
- `visualization_type`: 可视化类型（柱状图/树形图等）

### 4. 分类表 (categories)
存储学习资料的分类信息。

```sql
CREATE TABLE categories (
    category_id VARCHAR(36) PRIMARY KEY DEFAULT gen_random_uuid()::text,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    sort_order INTEGER DEFAULT 0,
    
    INDEX idx_categories_sort_order (sort_order)
);
```

### 5. 学习资料表 (learning_materials)
存储算法学习相关的资料内容。

```sql
CREATE TABLE learning_materials (
    material_id VARCHAR(36) PRIMARY KEY DEFAULT gen_random_uuid()::text,
    category_id VARCHAR(36) NOT NULL REFERENCES categories(category_id) ON DELETE CASCADE,
    algorithm_id VARCHAR(36) REFERENCES algorithms(algorithm_id) ON DELETE CASCADE,
    title VARCHAR(200) NOT NULL,
    content TEXT NOT NULL,
    code_example JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    INDEX idx_learning_materials_category_id (category_id),
    INDEX idx_learning_materials_algorithm_id (algorithm_id)
);
```

### 6. 学习记录表 (learning_records)
记录用户的学习进度和记录。

```sql
CREATE TABLE learning_records (
    record_id VARCHAR(36) PRIMARY KEY DEFAULT gen_random_uuid()::text,
    user_id VARCHAR(36) NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    algorithm_id VARCHAR(36) NOT NULL REFERENCES algorithms(algorithm_id) ON DELETE CASCADE,
    learned_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    duration_seconds INTEGER DEFAULT 0,
    progress_status VARCHAR(20) DEFAULT 'in_progress' CHECK (progress_status IN ('not_started', 'in_progress', 'completed')),
    
    INDEX idx_learning_records_user_id (user_id),
    INDEX idx_learning_records_algorithm_id (algorithm_id),
    INDEX idx_learning_records_learned_at (learned_at),
    
    UNIQUE KEY unique_user_algorithm (user_id, algorithm_id)
);
```

### 7. 收藏算法表 (favorite_algorithms)
存储用户收藏的算法。

```sql
CREATE TABLE favorite_algorithms (
    favorite_id VARCHAR(36) PRIMARY KEY DEFAULT gen_random_uuid()::text,
    user_id VARCHAR(36) NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    algorithm_id VARCHAR(36) NOT NULL REFERENCES algorithms(algorithm_id) ON DELETE CASCADE,
    favorited_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    INDEX idx_favorite_algorithms_user_id (user_id),
    INDEX idx_favorite_algorithms_algorithm_id (algorithm_id),
    
    UNIQUE KEY unique_user_favorite (user_id, algorithm_id)
);
```

## 索引设计

### 主键索引
- 所有表的主键字段自动创建B-tree索引

### 辅助索引
1. **用户表索引**
   - `idx_users_username`: 用户名查询优化
   - `idx_users_email`: 邮箱查询优化
   - `idx_users_role_type`: 角色筛选优化

2. **算法表索引**
   - `idx_algorithms_name`: 算法名称查询优化
   - `idx_algorithms_type`: 算法类型筛选优化

3. **学习记录表索引**
   - `idx_learning_records_user_id`: 用户学习记录查询优化
   - `idx_learning_records_algorithm_id`: 算法学习记录查询优化
   - `idx_learning_records_learned_at`: 时间范围查询优化

4. **收藏表索引**
   - `idx_favorite_algorithms_user_id`: 用户收藏查询优化
   - `idx_favorite_algorithms_algorithm_id`: 算法收藏统计优化

## 约束设计

### 唯一约束
1. **用户表**: `username`, `email` 字段唯一
2. **学习记录表**: `(user_id, algorithm_id)` 组合唯一
3. **收藏表**: `(user_id, algorithm_id)` 组合唯一

### 检查约束
1. **用户表**: `role_type` 必须是 'student' 或 'teacher'
2. **用户表**: `status` 必须是 'active' 或 'disabled'
3. **算法表**: `type` 必须是 'sorting', 'searching', 或 'tree'
4. **学习记录表**: `progress_status` 必须是 'not_started', 'in_progress', 或 'completed'

## 关系设计

### 一对多关系
1. **用户 → 学习记录**: 一个用户可以有多个学习记录
2. **用户 → 收藏算法**: 一个用户可以收藏多个算法
3. **算法 → 动画数据**: 一个算法可以有多个动画数据版本
4. **算法 → 学习资料**: 一个算法可以有多个学习资料
5. **分类 → 学习资料**: 一个分类可以包含多个学习资料

### 多对多关系
1. **用户 ↔ 算法**: 通过收藏表和学习记录表实现多对多关系

## 性能优化

### 查询优化
1. 使用复合索引优化常用查询
2. 合理使用覆盖索引减少回表查询
3. 对大表进行分区优化（如学习记录表）

### 存储优化
1. 使用JSONB类型存储结构化数据，支持索引
2. 合理使用数据类型，避免过度存储
3. 定期清理过期数据

## 备份策略

### 定期备份
1. **全量备份**: 每周进行一次完整数据库备份
2. **增量备份**: 每日进行增量备份
3. **实时备份**: 关键表启用WAL归档

### 备份工具
1. 使用 `pg_dump` 进行逻辑备份
2. 使用 `pg_basebackup` 进行物理备份
3. 配置自动化备份脚本

## 安全设计

### 访问控制
1. 使用独立的数据库用户，最小权限原则
2. 实施连接池和连接数限制
3. 启用SSL连接加密

### 数据安全
1. 敏感数据加密存储（如密码哈希）
2. 实施数据脱敏策略
3. 定期安全审计

## 监控与维护

### 性能监控
1. 监控查询性能和慢查询
2. 监控索引使用情况
3. 监控表空间使用情况

### 维护任务
1. 定期更新统计信息
2. 定期重建索引
3. 定期清理无用数据

## 扩展设计

### 水平扩展
1. 支持读写分离架构
2. 支持分片策略
3. 支持分布式部署

### 垂直扩展
1. 支持表分区
2. 支持列存储
3. 支持并行查询

## 版本管理

### 数据库迁移
1. 使用版本控制管理数据库结构变更
2. 支持回滚机制
3. 支持多环境同步

### 兼容性设计
1. 保持向后兼容性
2. 支持平滑升级
3. 提供数据迁移工具

---

本数据库设计文档将随着应用的发展持续更新，确保数据库架构能够满足不断增长的业务需求。