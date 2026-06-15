import React, { useEffect, useState } from 'react'
import { useAuthStore, useThemeStore } from '../../store/useStore'
import AdminLayout from '../../components/admin/AdminLayout'
import { adminAPI } from '../../utils/api'
import { Users, Code2, BookOpen, Clock } from 'lucide-react'

interface Stats {
  total_users: number
  total_algorithms: number
  total_categories: number
  total_materials: number
  total_learning_records: number
  users_by_role: Record<string, number>
  recent_users: Array<{ user_id: string; username: string; email: string; role_type: string; created_at: string }>
  popular_algorithms: Array<{ name: string; type: string; favorite_count: number }>
}

const AdminDashboard: React.FC = () => {
  const { isDark } = useThemeStore()
  const [stats, setStats] = useState<Stats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    loadStats()
  }, [])

  const loadStats = async () => {
    try {
      const res = await adminAPI.getStats()
      setStats(res.data.data)
    } catch {
      setError('加载统计数据失败')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <AdminLayout>
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {[1,2,3,4].map(i => (
              <div key={i} className={`rounded-xl p-6 animate-pulse ${isDark ? 'bg-gray-800' : 'bg-white'}`}>
                <div className={`h-4 w-20 rounded ${isDark ? 'bg-gray-700' : 'bg-gray-200'}`} />
                <div className={`h-8 w-12 rounded mt-2 ${isDark ? 'bg-gray-700' : 'bg-gray-200'}`} />
              </div>
            ))}
          </div>
        </div>
      </AdminLayout>
    )
  }

  if (error) {
    return (
      <AdminLayout>
        <div className={`rounded-xl p-12 text-center ${isDark ? 'bg-gray-800' : 'bg-white'}`}>
          <p className="text-red-500 text-lg">{error}</p>
          <button onClick={loadStats} className="mt-4 px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700">
            重试
          </button>
        </div>
      </AdminLayout>
    )
  }

  if (!stats) return null

  const statCards = [
    { label: '用户总数', value: stats.total_users, icon: Users, color: 'text-teal-600' },
    { label: '算法数量', value: stats.total_algorithms, icon: Code2, color: 'text-blue-600' },
    { label: '学习材料', value: stats.total_materials, icon: BookOpen, color: 'text-purple-600' },
    { label: '学习记录', value: stats.total_learning_records, icon: Clock, color: 'text-amber-600' },
  ]

  return (
    <AdminLayout>
      <h1 className={`text-2xl font-bold mb-6 ${isDark ? 'text-white' : 'text-gray-900'}`}>仪表盘</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {statCards.map(card => {
          const Icon = card.icon
          return (
            <div key={card.label} className={`rounded-xl p-6 shadow-sm ${isDark ? 'bg-gray-800' : 'bg-white'}`}>
              <div className="flex items-center justify-between">
                <p className={`text-sm font-medium ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{card.label}</p>
                <Icon className={`h-5 w-5 ${card.color}`} />
              </div>
              <p className={`text-3xl font-bold mt-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>{card.value}</p>
            </div>
          )
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <div className={`rounded-xl p-6 shadow-sm ${isDark ? 'bg-gray-800' : 'bg-white'}`}>
          <h3 className={`text-lg font-semibold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>用户角色分布</h3>
          <div className="space-y-3">
            {Object.entries(stats.users_by_role).map(([role, count]) => (
              <div key={role} className="flex items-center">
                <span className={`w-20 text-sm capitalize ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>{role}</span>
                <div className="flex-1 mx-3">
                  <div className={`h-4 rounded-full ${isDark ? 'bg-gray-700' : 'bg-gray-100'}`}>
                    <div
                      className="h-4 rounded-full bg-teal-500"
                      style={{ width: `${Math.max((count / stats.total_users) * 100, 5)}%` }}
                    />
                  </div>
                </div>
                <span className={`text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{count}</span>
              </div>
            ))}
          </div>
        </div>

        <div className={`rounded-xl p-6 shadow-sm ${isDark ? 'bg-gray-800' : 'bg-white'}`}>
          <h3 className={`text-lg font-semibold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>热门算法</h3>
          {stats.popular_algorithms.length === 0 ? (
            <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>暂无数据</p>
          ) : (
            <div className="space-y-3">
              {stats.popular_algorithms.map((algo, i) => (
                <div key={i} className="flex items-center justify-between">
                  <div>
                    <p className={`text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>{algo.name}</p>
                    <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{algo.type}</p>
                  </div>
                  <span className={`text-sm ${isDark ? 'text-amber-400' : 'text-amber-600'}`}>{algo.favorite_count} 收藏</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className={`rounded-xl p-6 shadow-sm ${isDark ? 'bg-gray-800' : 'bg-white'}`}>
        <h3 className={`text-lg font-semibold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>最近注册用户</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className={`border-b ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
                <th className={`text-left py-2 px-3 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>用户名</th>
                <th className={`text-left py-2 px-3 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>邮箱</th>
                <th className={`text-left py-2 px-3 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>角色</th>
                <th className={`text-left py-2 px-3 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>注册时间</th>
              </tr>
            </thead>
            <tbody>
              {stats.recent_users.map(u => (
                <tr key={u.user_id} className={`border-b ${isDark ? 'border-gray-700' : 'border-gray-100'}`}>
                  <td className={`py-2 px-3 ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>{u.username}</td>
                  <td className={`py-2 px-3 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{u.email}</td>
                  <td className="py-2 px-3">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                      u.role_type === 'admin' ? 'bg-red-100 text-red-700' :
                      u.role_type === 'teacher' ? 'bg-blue-100 text-blue-700' :
                      'bg-green-100 text-green-700'
                    }`}>{u.role_type}</span>
                  </td>
                  <td className={`py-2 px-3 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                    {new Date(u.created_at).toLocaleDateString('zh-CN')}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </AdminLayout>
  )
}

export default AdminDashboard
