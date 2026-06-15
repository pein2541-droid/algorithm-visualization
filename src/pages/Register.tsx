import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import Header from '../components/Layout/Header'
import Footer from '../components/Layout/Footer'
import { useThemeStore, useAuthStore } from '../store/useStore'
import { authAPI } from '../utils/api'
import { EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline'

const Register: React.FC = () => {
  const { isDark } = useThemeStore()
  const { setAuth } = useAuthStore()
  const navigate = useNavigate()
  
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    role_type: 'student'
  })
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
    if (error) setError('')
  }

  const validateForm = () => {
    if (!formData.username || !formData.email || !formData.password || !formData.confirmPassword) {
      setError('请填写所有必填字段')
      return false
    }
    
    if (formData.username.length < 3) {
      setError('用户名至少需要3个字符')
      return false
    }
    
    if (formData.password.length < 6) {
      setError('密码至少需要6个字符')
      return false
    }
    
    if (formData.password !== formData.confirmPassword) {
      setError('两次输入的密码不一致')
      return false
    }
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(formData.email)) {
      setError('请输入有效的邮箱地址')
      return false
    }
    
    return true
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) {
      return
    }

    try {
      setLoading(true)
      setError('')
      
      const response = await authAPI.register({
        username: formData.username,
        email: formData.email,
        password: formData.password,
        role_type: formData.role_type
      })
      
      const { user } = response.data.data
      
      // 注册成功后自动登录
      const loginResponse = await authAPI.login({
        username: formData.username,
        password: formData.password
      })
      
      const { token } = loginResponse.data.data
      setAuth(user, token)
      localStorage.setItem('token', token)
      localStorage.setItem('user', JSON.stringify(user))
      
      navigate('/')
    } catch (error: any) {
      const errorMessage = error.response?.data?.error || '注册失败，请重试'
      setError(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className={`flex-1 flex items-center justify-center ${isDark ? 'bg-gray-900' : 'bg-gray-50'}`}>
        <div className="max-w-md w-full mx-4">
          <div className={`rounded-xl shadow-xl p-8 ${isDark ? 'bg-gray-800 border border-gray-700' : 'bg-white border border-gray-200'}`}>
            <div className="text-center mb-8">
              <h2 className={`text-3xl font-bold mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                用户注册
              </h2>
              <p className={`${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                创建新账户，开始学习算法
              </p>
            </div>

            {error && (
              <div className={`mb-6 p-4 rounded-lg ${isDark ? 'bg-red-900/20 border border-red-800 text-red-400' : 'bg-red-50 border border-red-200 text-red-600'}`}>
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label htmlFor="username" className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                  用户名
                </label>
                <input
                  type="text"
                  id="username"
                  name="username"
                  value={formData.username}
                  onChange={handleChange}
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 ${
                    isDark 
                      ? 'bg-gray-700 border-gray-600 text-white focus:border-teal-400' 
                      : 'bg-white border-gray-300 text-gray-900 focus:border-teal-500'
                  }`}
                  placeholder="请输入用户名"
                  required
                />
              </div>

              <div>
                <label htmlFor="email" className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                  邮箱地址
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 ${
                    isDark 
                      ? 'bg-gray-700 border-gray-600 text-white focus:border-teal-400' 
                      : 'bg-white border-gray-300 text-gray-900 focus:border-teal-500'
                  }`}
                  placeholder="请输入邮箱地址"
                  required
                />
              </div>

              <div>
                <label htmlFor="password" className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                  密码
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    id="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 ${
                      isDark 
                        ? 'bg-gray-700 border-gray-600 text-white focus:border-teal-400' 
                        : 'bg-white border-gray-300 text-gray-900 focus:border-teal-500'
                    }`}
                    placeholder="请输入密码"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className={`absolute inset-y-0 right-0 pr-3 flex items-center ${isDark ? 'text-gray-400 hover:text-gray-300' : 'text-gray-400 hover:text-gray-600'}`}
                  >
                    {showPassword ? (
                      <EyeSlashIcon className="h-5 w-5" />
                    ) : (
                      <EyeIcon className="h-5 w-5" />
                    )}
                  </button>
                </div>
              </div>

              <div>
                <label htmlFor="confirmPassword" className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                  确认密码
                </label>
                <div className="relative">
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    id="confirmPassword"
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 ${
                      isDark 
                        ? 'bg-gray-700 border-gray-600 text-white focus:border-teal-400' 
                        : 'bg-white border-gray-300 text-gray-900 focus:border-teal-500'
                    }`}
                    placeholder="请再次输入密码"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className={`absolute inset-y-0 right-0 pr-3 flex items-center ${isDark ? 'text-gray-400 hover:text-gray-300' : 'text-gray-400 hover:text-gray-600'}`}
                  >
                    {showConfirmPassword ? (
                      <EyeSlashIcon className="h-5 w-5" />
                    ) : (
                      <EyeIcon className="h-5 w-5" />
                    )}
                  </button>
                </div>
              </div>

              <div>
                <label htmlFor="role_type" className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                  用户类型
                </label>
                <select
                  id="role_type"
                  name="role_type"
                  value={formData.role_type}
                  onChange={handleChange}
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 ${
                    isDark 
                      ? 'bg-gray-700 border-gray-600 text-white focus:border-teal-400' 
                      : 'bg-white border-gray-300 text-gray-900 focus:border-teal-500'
                  }`}
                >
                  <option value="student">学生</option>
                  <option value="teacher">教师</option>
                </select>
              </div>

              <button
                type="submit"
                disabled={loading}
                className={`w-full py-3 px-4 rounded-lg font-medium transition-colors ${
                  loading
                    ? 'bg-gray-400 cursor-not-allowed'
                    : 'bg-teal-600 hover:bg-teal-700 text-white'
                }`}
              >
                {loading ? (
                  <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                    注册中...
                  </div>
                ) : (
                  '注册'
                )}
              </button>
            </form>

            <div className="mt-6 text-center">
              <p className={`${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                已有账户？
                <Link
                  to="/login"
                  className="text-teal-600 hover:text-teal-700 font-medium ml-1"
                >
                  立即登录
                </Link>
              </p>
            </div>

            <div className="mt-6 text-center">
              <Link
                to="/"
                className={`text-sm ${isDark ? 'text-gray-400 hover:text-gray-300' : 'text-gray-600 hover:text-gray-800'}`}
              >
                返回首页
              </Link>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}

export default Register