# API接口文档

## 概述

Python算法动画演示应用提供RESTful API接口，支持用户认证、算法数据获取、学习记录管理等功能。所有API遵循统一的响应格式和错误处理机制。

## 基础信息

- **Base URL**: `http://localhost:5000/api`
- **认证方式**: JWT Token
- **数据格式**: JSON
- **字符编码**: UTF-8

## 通用响应格式

### 成功响应
```json
{
  "status": "success",
  "data": {
    // 具体数据
  }
}
```

### 错误响应
```json
{
  "error": "错误信息",
  "code": "错误代码"
}
```

### HTTP状态码
- `200`: 请求成功
- `201`: 创建成功
- `400`: 请求参数错误
- `401`: 未授权
- `403`: 权限不足
- `404`: 资源不存在
- `500`: 服务器内部错误

## 认证相关接口

### 1. 用户注册
**POST** `/auth/register`

注册新用户账户。

**请求参数**:
```json
{
  "username": "string",     // 必填，3-50字符
  "email": "string",        // 必填，有效邮箱格式
  "password": "string",     // 必填，最少6字符
  "role_type": "string"     // 可选，student/teacher，默认student
}
```

**响应示例**:
```json
{
  "status": "success",
  "data": {
    "user_id": "uuid-string",
    "username": "testuser",
    "email": "test@example.com",
    "role_type": "student",
    "created_at": "2025-12-21T12:00:00Z",
    "status": "active"
  }
}
```

**错误码**:
- `USERNAME_EXISTS`: 用户名已存在
- `EMAIL_EXISTS`: 邮箱已存在
- `INVALID_ROLE_TYPE`: 无效的角色类型

### 2. 用户登录
**POST** `/auth/login`

用户登录获取访问令牌。

**请求参数**:
```json
{
  "username": "string",     // 必填
  "password": "string"      // 必填
}
```

**响应示例**:
```json
{
  "status": "success",
  "data": {
    "token": "jwt-token-string",
    "user": {
      "user_id": "uuid-string",
      "username": "testuser",
      "email": "test@example.com",
      "role_type": "student",
      "created_at": "2025-12-21T12:00:00Z",
      "status": "active"
    }
  }
}
```

**错误码**:
- `INVALID_CREDENTIALS`: 用户名或密码错误
- `USER_DISABLED`: 用户账户被禁用

## 算法相关接口

### 3. 获取算法列表
**GET** `/algorithms`

获取算法列表，支持分页和类型筛选。

**查询参数**:
- `type` (可选): 算法类型 (sorting/searching/tree)
- `page` (可选): 页码，默认1
- `limit` (可选): 每页数量，默认20

**响应示例**:
```json
{
  "status": "success",
  "data": {
    "algorithms": [
      {
        "algorithm_id": "uuid-string",
        "name": "冒泡排序",
        "type": "sorting",
        "description": "简单的排序算法",
        "time_complexity": "O(n²)",
        "space_complexity": "O(1)",
        "created_at": "2025-12-21T12:00:00Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 10,
      "pages": 1
    }
  }
}
```

### 4. 获取算法详情
**GET** `/algorithms/{algorithm_id}`

获取特定算法的详细信息。

**路径参数**:
- `algorithm_id`: 算法ID (UUID)

**响应示例**:
```json
{
  "status": "success",
  "data": {
    "algorithm_id": "uuid-string",
    "name": "冒泡排序",
    "type": "sorting",
    "description": "冒泡排序是一种简单的排序算法。它重复地走访过要排序的数列，一次比较两个元素，如果它们的顺序错误就把它们交换过来。",
    "time_complexity": "O(n²)",
    "space_complexity": "O(1)",
    "pseudocode": {
      "steps": [
        "for i from 0 to n-1",
        "  for j from 0 to n-i-1",
        "    if arr[j] > arr[j+1]",
        "      swap arr[j] and arr[j+1]"
      ]
    },
    "created_at": "2025-12-21T12:00:00Z"
  }
}
```

### 5. 获取算法动画数据
**GET** `/algorithms/{algorithm_id}/animation`

获取算法的动画演示数据。

**路径参数**:
- `algorithm_id`: 算法ID (UUID)

**响应示例**:
```json
{
  "status": "success",
  "data": {
    "algorithm": {
      "algorithm_id": "uuid-string",
      "name": "冒泡排序",
      "type": "sorting"
    },
    "animation_steps": [
      {
        "step": 1,
        "description": "比较元素1和元素2",
        "data": [64, 34, 25, 12, 22, 11, 90],
        "highlighted_indices": [0, 1],
        "action": "compare"
      }
    ],
    "initial_data": [64, 34, 25, 12, 22, 11, 90],
    "visualization_type": "bar_chart"
  }
}
```

## 学习资料接口

### 6. 获取学习分类
**GET** `/learning/categories`

获取学习资料的分类列表。

**响应示例**:
```json
{
  "status": "success",
  "data": [
    {
      "category_id": "uuid-string",
      "name": "算法基础",
      "description": "算法基本概念和原理"
    },
    {
      "category_id": "uuid-string",
      "name": "时间复杂度",
      "description": "算法效率分析方法"
    }
  ]
}
```

### 7. 获取分类内容
**GET** `/learning/categories/{category_id}/content`

获取特定分类下的学习资料内容。

**路径参数**:
- `category_id`: 分类ID (UUID)

**响应示例**:
```json
{
  "status": "success",
  "data": [
    {
      "material_id": "uuid-string",
      "title": "什么是时间复杂度？",
      "content": "时间复杂度是衡量算法执行时间随输入规模增长的度量...",
      "code_example": {
        "language": "python",
        "code": "def example(n):\n    for i in range(n):\n        print(i)"
      },
      "created_at": "2025-12-21T12:00:00Z"
    }
  ]
}
```

## 用户相关接口（需要认证）

### 8. 获取用户资料
**GET** `/user/profile`

获取当前用户的详细信息和相关记录。

**请求头**:
- `Authorization`: `Bearer {jwt_token}`

**响应示例**:
```json
{
  "status": "success",
  "data": {
    "user": {
      "user_id": "uuid-string",
      "username": "testuser",
      "email": "test@example.com",
      "role_type": "student",
      "created_at": "2025-12-21T12:00:00Z",
      "status": "active"
    },
    "learning_records": [
      {
        "algorithm_name": "冒泡排序",
        "learned_at": "2025-12-21T13:00:00Z",
        "duration_seconds": 300,
        "progress_status": "completed"
      }
    ],
    "favorite_algorithms": [
      {
        "algorithm_name": "快速排序",
        "algorithm_type": "sorting",
        "favorited_at": "2025-12-21T14:00:00Z"
      }
    ]
  }
}
```

### 9. 更新学习记录
**POST** `/user/learning-record`

更新用户的学习记录。

**请求头**:
- `Authorization`: `Bearer {jwt_token}`

**请求参数**:
```json
{
  "algorithm_id": "uuid-string",      // 必填
  "duration_seconds": 300,            // 可选，学习时长（秒）
  "progress_status": "completed"      // 可选，学习状态
}
```

**响应示例**:
```json
{
  "status": "success",
  "data": {
    "record_id": "uuid-string",
    "algorithm_id": "uuid-string",
    "learned_at": "2025-12-21T13:00:00Z",
    "duration_seconds": 300,
    "progress_status": "completed"
  }
}
```

### 10. 收藏/取消收藏算法
**POST** `/user/favorite`

收藏或取消收藏算法。

**请求头**:
- `Authorization`: `Bearer {jwt_token}`

**请求参数**:
```json
{
  "algorithm_id": "uuid-string",      // 必填
  "action": "add"                     // 必填，add/remove
}
```

**响应示例**:
```json
{
  "status": "success",
  "data": {
    "message": "收藏成功"
  }
}
```

## 系统接口

### 11. 健康检查
**GET** `/health`

检查系统健康状态。

**响应示例**:
```json
{
  "status": "healthy",
  "timestamp": "2025-12-21T12:00:00Z"
}
```

## 错误处理

### 通用错误码
- `INTERNAL_ERROR`: 服务器内部错误
- `INVALID_REQUEST`: 请求参数无效
- `RESOURCE_NOT_FOUND`: 请求的资源不存在
- `UNAUTHORIZED`: 未授权访问
- `FORBIDDEN`: 权限不足

### 认证错误码
- `TOKEN_EXPIRED`: JWT令牌已过期
- `INVALID_TOKEN`: JWT令牌无效
- `USER_NOT_FOUND`: 用户不存在

### 业务错误码
- `ALGORITHM_NOT_FOUND`: 算法不存在
- `CATEGORY_NOT_FOUND`: 分类不存在
- `MATERIAL_NOT_FOUND`: 学习资料不存在
- `DUPLICATE_RECORD`: 记录已存在

## 限流策略

### 未认证用户
- 每分钟最多100次请求
- 每小时最多1000次请求

### 认证用户
- 每分钟最多200次请求
- 每小时最多2000次请求

### 管理员用户
- 每分钟最多500次请求
- 每小时最多5000次请求

## 数据分页

支持分页的接口使用以下参数：
- `page`: 页码，从1开始
- `limit`: 每页数量，默认20，最大100

分页响应格式：
```json
{
  "data": {
    "items": [...],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 100,
      "pages": 5
    }
  }
}
```

## 版本信息

当前API版本：v1

版本兼容性：
- 向后兼容
- 重大变更将通过版本号区分
- 弃用的接口会提前通知

---

本API文档将随着应用的发展持续更新，确保开发者能够正确使用所有接口功能。