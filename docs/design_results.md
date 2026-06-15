# 毕业设计成果（阶段性）

## （1）系统总体设计图
![系统总体设计图](C:/Users/啊/Desktop/system_overview.svg)

源文件：docs/diagrams/system_overview.mmd（可用 mermaid-cli 生成图片）；或直接使用当前 SVG。

特性说明：
- 前后端分离，前端通过 `/api` 统一代理到后端；后端提供认证、算法数据与动画步骤生成等服务；数据库存储用户与学习过程数据。
- 动画组件以“状态机 + 步骤序列”驱动，伪代码高亮与速度/参数可调协同呈现。

## （2）系统数据表逻辑结构图

```mermaid
erDiagram
    USERS {
        string user_id PK
        string username
        string email
        string password_hash
        string role_type
        datetime created_at
        string status
    }

    ALGORITHMS {
        string algorithm_id PK
        string name
        string type
        text description
        string time_complexity
        string space_complexity
        json pseudocode
        datetime created_at
    }

    ANIMATION_DATA {
        string animation_id PK
        string algorithm_id FK
        json animation_steps
        json initial_data
        string visualization_type
        datetime created_at
    }

    CATEGORIES {
        string category_id PK
        string name
        text description
        int sort_order
    }

    LEARNING_MATERIALS {
        string material_id PK
        string category_id FK
        string algorithm_id FK NULL
        string title
        text content
        json code_example
        datetime created_at
    }

    LEARNING_RECORDS {
        string record_id PK
        string user_id FK
        string algorithm_id FK
        datetime learned_at
        int duration_seconds
        string progress_status
    }

    FAVORITE_ALGORITHMS {
        string favorite_id PK
        string user_id FK
        string algorithm_id FK
        datetime favorited_at
    }

    USERS ||--o{ LEARNING_RECORDS : "学习记录"
    ALGORITHMS ||--o{ LEARNING_RECORDS : "被学习"

    USERS ||--o{ FAVORITE_ALGORITHMS : "收藏"
    ALGORITHMS ||--o{ FAVORITE_ALGORITHMS : "被收藏"

    ALGORITHMS ||--o{ ANIMATION_DATA : "动画数据"

    CATEGORIES ||--o{ LEARNING_MATERIALS : "包含"
    ALGORITHMS ||--o{ LEARNING_MATERIALS : "关联(可空)"
```

## （3）系统的主要字段定义

- 用户（users）
  - user_id：主键，UUID
  - username：用户名，唯一索引
  - email：邮箱，唯一索引
  - password_hash：密码摘要
  - role_type：角色类型（如 student/teacher）
  - created_at：创建时间
  - status：状态（active 等）

- 算法（algorithms）
  - algorithm_id：主键，UUID
  - name：算法名称
  - type：算法类型（sorting/searching/tree/graph/dp 等）
  - description：算法说明
  - time_complexity：时间复杂度
  - space_complexity：空间复杂度
  - pseudocode：伪代码（JSON 数组）
  - created_at：创建时间

- 动画数据（animation_data）
  - animation_id：主键，UUID
  - algorithm_id：外键，关联 algorithms
  - animation_steps：动画步骤序列（JSON）
  - initial_data：初始数据（JSON）
  - visualization_type：可视化类型标识
  - created_at：创建时间

- 分类（categories）
  - category_id：主键，UUID
  - name：分类名称
  - description：分类说明
  - sort_order：排序权重

- 学习资料（learning_materials）
  - material_id：主键，UUID
  - category_id：外键，关联 categories
  - algorithm_id：外键，关联 algorithms（可为空）
  - title：标题
  - content：内容
  - code_example：代码示例（JSON）
  - created_at：创建时间

- 学习记录（learning_records）
  - record_id：主键，UUID
  - user_id：外键，关联 users
  - algorithm_id：外键，关联 algorithms
  - learned_at：学习时间（索引）
  - duration_seconds：学习时长（秒）
  - progress_status：进度状态（not_started/in_progress/completed）
  - 唯一约束：同一用户与算法唯一记录（user_id, algorithm_id）

- 收藏算法（favorite_algorithms）
  - favorite_id：主键，UUID
  - user_id：外键，关联 users
  - algorithm_id：外键，关联 algorithms
  - favorited_at：收藏时间
  - 唯一约束：同一用户对同一算法唯一收藏（user_id, algorithm_id）

### 字段表（节选）

| 表名 | 字段名 | 表示含义 |
|---|---|---|
| users | user_id | 用户主键（UUID） |
| users | username | 用户名（唯一） |
| users | email | 邮箱（唯一） |
| users | password_hash | 密码摘要 |
| users | role_type | 角色类型（student/teacher） |
| users | created_at | 创建时间 |
| users | status | 状态（active 等） |
| algorithms | algorithm_id | 算法主键（UUID） |
| algorithms | name | 算法名称 |
| algorithms | type | 算法类型（sorting/searching/graph/dp 等） |
| algorithms | time_complexity | 时间复杂度 |
| algorithms | space_complexity | 空间复杂度 |
| algorithms | pseudocode | 伪代码（JSON 数组） |
| animation_data | animation_id | 动画数据主键（UUID） |
| animation_data | algorithm_id | 关联算法 |
| animation_data | animation_steps | 动画步骤序列（JSON） |
| animation_data | initial_data | 初始数据（JSON） |
| animation_data | visualization_type | 可视化类型 |
| categories | category_id | 分类主键（UUID） |
| categories | name | 分类名称 |
| learning_materials | material_id | 资料主键（UUID） |
| learning_materials | category_id | 关联分类 |
| learning_materials | algorithm_id | 关联算法（可空） |
| learning_materials | title | 标题 |
| learning_records | record_id | 学习记录主键（UUID） |
| learning_records | user_id | 关联用户 |
| learning_records | algorithm_id | 关联算法 |
| learning_records | learned_at | 学习时间 |
| learning_records | duration_seconds | 学习时长（秒） |
| learning_records | progress_status | 进度状态 |
| favorite_algorithms | favorite_id | 收藏主键（UUID） |
| favorite_algorithms | user_id | 关联用户 |
| favorite_algorithms | algorithm_id | 关联算法 |
| favorite_algorithms | favorited_at | 收藏时间 |


参考实现：模型定义见 [models.py](file:///e:/bi_ye_she_ji_2/api/models.py).
