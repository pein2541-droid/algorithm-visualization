import axios from 'axios'

const API_BASE_URL = import.meta.env.VITE_API_URL || '/api'

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
})

// 请求拦截器
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// 响应拦截器
api.interceptors.response.use(
  (response) => {
    return response
  },
  (error) => {
    if (error.response?.status === 401) {
      // 清除认证信息
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      // 可以在这里添加重定向到登录页面的逻辑
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

// 用户认证相关API
export const authAPI = {
  register: (data: { username: string; email: string; password: string; role_type: string }) =>
    api.post('/auth/register', data),
  
  login: (data: { username: string; password: string }) =>
    api.post('/auth/login', data),
}

// 算法相关API
export const algorithmAPI = {
  getAlgorithms: (params?: { type?: string; page?: number; limit?: number }) =>
    api.get('/algorithms', { params }),
  
  getAlgorithm: (algorithmId: string) =>
    api.get(`/algorithms/${algorithmId}`),
  
  getAnimation: (algorithmId: string) =>
    api.get(`/algorithms/${algorithmId}/animation`),
}

// 学习资料相关API
export const learningAPI = {
  getCategories: () =>
    api.get('/learning/categories'),
  
  getCategoryContent: (categoryId: string) =>
    api.get(`/learning/categories/${categoryId}/content`),
}

// 用户相关API
export const userAPI = {
  getProfile: () =>
    api.get('/user/profile'),
}

// 管理员相关API
export const adminAPI = {
  getStats: () =>
    api.get('/admin/stats'),

  getUsers: (params?: { page?: number; limit?: number; search?: string }) =>
    api.get('/admin/users', { params }),

  updateUserStatus: (userId: string, status: string) =>
    api.put(`/admin/users/${userId}/status`, { status }),

  deleteUser: (userId: string) =>
    api.delete(`/admin/users/${userId}`),

  createAlgorithm: (data: any) =>
    api.post('/admin/algorithms', data),

  updateAlgorithm: (algorithmId: string, data: any) =>
    api.put(`/admin/algorithms/${algorithmId}`, data),

  deleteAlgorithm: (algorithmId: string) =>
    api.delete(`/admin/algorithms/${algorithmId}`),

  getCategories: () =>
    api.get('/admin/categories'),

  createCategory: (data: { name: string; description?: string; sort_order?: number }) =>
    api.post('/admin/categories', data),

  updateCategory: (categoryId: string, data: any) =>
    api.put(`/admin/categories/${categoryId}`, data),

  deleteCategory: (categoryId: string) =>
    api.delete(`/admin/categories/${categoryId}`),

  getMaterials: (params?: { page?: number; limit?: number }) =>
    api.get('/admin/materials', { params }),

  createMaterial: (data: any) =>
    api.post('/admin/materials', data),

  updateMaterial: (materialId: string, data: any) =>
    api.put(`/admin/materials/${materialId}`, data),

  deleteMaterial: (materialId: string) =>
    api.delete(`/admin/materials/${materialId}`),
}

export default api