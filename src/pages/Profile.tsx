import React, { useState, useEffect } from 'react'
import Header from '../components/Layout/Header'
import Footer from '../components/Layout/Footer'
import { useThemeStore, useAuthStore } from '../store/useStore'
import { userAPI } from '../utils/api'
import { 
  UserIcon, 
  ClockIcon, 
  StarIcon,
  ChartBarIcon
} from '@heroicons/react/24/outline'

interface User {
  user_id: string
  username: string
  email: string
  role_type: 'student' | 'teacher'
  created_at: string
}

interface LearningRecord {
  algorithm_name: string
  learned_at: string
  duration_seconds: number
  progress_status: string
}

interface FavoriteAlgorithm {
  algorithm_name: string
  algorithm_type: string
  favorited_at: string
}

const Profile: React.FC = () => {
  const { isDark } = useThemeStore()
  const { user, isAuthenticated } = useAuthStore()
  const [userData, setUserData] = useState<User | null>(null)
  const [learningRecords, setLearningRecords] = useState<LearningRecord[]>([])
  const [favoriteAlgorithms, setFavoriteAlgorithms] = useState<FavoriteAlgorithm[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (isAuthenticated) {
      fetchUserProfile()
    }
  }, [isAuthenticated])

  const fetchUserProfile = async () => {
    try {
      setLoading(true)
      const response = await userAPI.getProfile()
      const { user: userInfo, learning_records, favorite_algorithms } = response.data.data
      
      setUserData(userInfo)
      setLearningRecords(learning_records)
      setFavoriteAlgorithms(favorite_algorithms)
    } catch (error) {
      console.error('获取用户资料失败:', error)
    } finally {
      setLoading(false)
    }
  }

  const formatDuration = (seconds: number) => {
    if (seconds < 60) return `${seconds}秒`
    if (seconds < 3600) return `${Math.floor(seconds / 60)}分钟`
    return `${Math.floor(seconds / 3600)}小时${Math.floor((seconds % 3600) / 60)}分钟`
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className={`flex-1 flex items-center justify-center ${isDark ? 'bg-gray-900' : 'bg-gray-50'}`}>
          <div className="text-center">
            <div className={`text-6xl mb-4 ${isDark ? 'text-gray-600' : 'text-gray-400'}`}>🔒</div>
            <h3 className={`text-lg font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-900'}`}>
              请先登录
            </h3>
            <p className={`${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              登录后查看个人资料
            </p>
          </div>
        </main>
        <Footer />
      </div>
    )
  }

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className={`flex-1 flex items-center justify-center ${isDark ? 'bg-gray-900' : 'bg-gray-50'}`}>
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600 mx-auto mb-4"></div>
            <p className={isDark ? 'text-gray-300' : 'text-gray-600'}>加载中...</p>
          </div>
        </main>
        <Footer />
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className={`flex-1 ${isDark ? 'bg-gray-900' : 'bg-gray-50'}`}>
        {/* 页面标题 */}
        <section className="py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h1 className={`text-4xl font-bold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
              个人中心
            </h1>
            <p className={`text-lg ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
              管理您的学习进度和收藏
            </p>
          </div>
        </section>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
          {/* 用户信息卡片 */}
          <div className={`rounded-xl p-8 shadow-lg mb-8 ${isDark ? 'bg-gray-800 border border-gray-700' : 'bg-white border border-gray-200'}`}>
            <div className="flex items-center space-x-6">
              <div className={`p-4 rounded-full ${isDark ? 'bg-teal-900/20' : 'bg-teal-100'}`}>
                <UserIcon className={`h-8 w-8 ${isDark ? 'text-teal-400' : 'text-teal-600'}`} />
              </div>
              <div className="flex-1">
                <h2 className={`text-2xl font-bold mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  {userData?.username}
                </h2>
                <div className="flex flex-wrap gap-4 text-sm">
                  <div className={`${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                    <span className="font-medium">邮箱:</span> {userData?.email}
                  </div>
                  <div className={`${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                    <span className="font-medium">角色:</span> {userData?.role_type === 'student' ? '学生' : '教师'}
                  </div>
                  <div className={`${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                    <span className="font-medium">注册时间:</span> {userData && formatDate(userData.created_at)}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* 学习记录 */}
            <div className={`rounded-xl p-6 shadow-lg ${isDark ? 'bg-gray-800 border border-gray-700' : 'bg-white border border-gray-200'}`}>
              <div className="flex items-center space-x-3 mb-6">
                <div className={`p-2 rounded-lg ${isDark ? 'bg-blue-900/20' : 'bg-blue-100'}`}>
                  <ClockIcon className={`h-6 w-6 ${isDark ? 'text-blue-400' : 'text-blue-600'}`} />
                </div>
                <h3 className={`text-xl font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  最近学习
                </h3>
              </div>
              
              {learningRecords.length === 0 ? (
                <div className={`text-center py-8 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                  <ChartBarIcon className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>暂无学习记录</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {learningRecords.map((record, index) => (
                    <div
                      key={index}
                      className={`p-4 rounded-lg border ${isDark ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-200'}`}
                    >
                      <div className="flex justify-between items-start mb-2">
                        <h4 className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                          {record.algorithm_name}
                        </h4>
                        <span className={`text-xs px-2 py-1 rounded ${
                          record.progress_status === 'completed'
                            ? 'bg-green-100 text-green-800'
                            : record.progress_status === 'in_progress'
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}>
                          {record.progress_status === 'completed' ? '已完成' : 
                           record.progress_status === 'in_progress' ? '学习中' : '未开始'}
                        </span>
                      </div>
                      <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                        <div>学习时间: {formatDate(record.learned_at)}</div>
                        <div>学习时长: {formatDuration(record.duration_seconds)}</div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* 收藏算法 */}
            <div className={`rounded-xl p-6 shadow-lg ${isDark ? 'bg-gray-800 border border-gray-700' : 'bg-white border border-gray-200'}`}>
              <div className="flex items-center space-x-3 mb-6">
                <div className={`p-2 rounded-lg ${isDark ? 'bg-yellow-900/20' : 'bg-yellow-100'}`}>
                  <StarIcon className={`h-6 w-6 ${isDark ? 'text-yellow-400' : 'text-yellow-600'}`} />
                </div>
                <h3 className={`text-xl font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  收藏算法
                </h3>
              </div>
              
              {favoriteAlgorithms.length === 0 ? (
                <div className={`text-center py-8 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                  <StarIcon className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>暂无收藏算法</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {favoriteAlgorithms.map((fav, index) => (
                    <div
                      key={index}
                      className={`p-4 rounded-lg border ${isDark ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-200'}`}
                    >
                      <div className="flex justify-between items-start mb-2">
                        <h4 className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                          {fav.algorithm_name}
                        </h4>
                        <span className={`text-xs px-2 py-1 rounded ${
                          fav.algorithm_type === 'sorting' ? 'bg-teal-100 text-teal-800' :
                          fav.algorithm_type === 'searching' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-purple-100 text-purple-800'
                        }`}>
                          {fav.algorithm_type === 'sorting' ? '排序' :
                           fav.algorithm_type === 'searching' ? '查找' : '树结构'}
                        </span>
                      </div>
                      <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                        收藏时间: {formatDate(fav.favorited_at)}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}

export default Profile