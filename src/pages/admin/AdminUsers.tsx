import React, { useEffect, useState, useCallback } from 'react'
import { useThemeStore } from '../../store/useStore'
import AdminLayout from '../../components/admin/AdminLayout'
import ConfirmDialog from '../../components/admin/ConfirmDialog'
import { adminAPI } from '../../utils/api'

interface UserItem {
  user_id: string
  username: string
  email: string
  role_type: string
  status: string
  created_at: string
}

const AdminUsers: React.FC = () => {
  const { isDark } = useThemeStore()
  const [users, setUsers] = useState<UserItem[]>([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [confirm, setConfirm] = useState<{ open: boolean; userId: string; username: string }>({ open: false, userId: '', username: '' })
  const limit = 10

  const loadUsers = useCallback(async () => {
    setLoading(true)
    try {
      const res = await adminAPI.getUsers({ page, limit, search: search || undefined })
      setUsers(res.data.data.users)
      setTotal(res.data.data.total)
    } catch {
      setError('加载用户列表失败')
    } finally {
      setLoading(false)
    }
  }, [page, search])

  useEffect(() => { loadUsers() }, [loadUsers])

  const handleStatusToggle = async (userId: string, currentStatus: string) => {
    const newStatus = currentStatus === 'active' ? 'disabled' : 'active'
    try {
      await adminAPI.updateUserStatus(userId, newStatus)
      setUsers(prev => prev.map(u => u.user_id === userId ? { ...u, status: newStatus } : u))
    } catch {
      alert('操作失败')
    }
  }

  const handleDelete = async () => {
    try {
      await adminAPI.deleteUser(confirm.userId)
      setConfirm({ open: false, userId: '', username: '' })
      loadUsers()
    } catch {
      alert('删除失败')
    }
  }

  const totalPages = Math.ceil(total / limit)

  return (
    <AdminLayout>
      <div className="flex items-center justify-between mb-6">
        <h1 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>用户管理</h1>
        <input
          type="text"
          placeholder="搜索用户名或邮箱..."
          value={search}
          onChange={e => { setSearch(e.target.value); setPage(1) }}
          className={`px-4 py-2 rounded-lg border text-sm w-64 ${
            isDark ? 'bg-gray-800 border-gray-600 text-gray-200 placeholder-gray-400' : 'bg-white border-gray-300 text-gray-900'
          }`}
        />
      </div>

      {error && (
        <div className="mb-4 p-4 rounded-lg bg-red-50 text-red-600 text-sm">{error}</div>
      )}

      <div className={`rounded-xl shadow-sm overflow-hidden ${isDark ? 'bg-gray-800' : 'bg-white'}`}>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className={`border-b ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
                <th className={`text-left py-3 px-4 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>用户名</th>
                <th className={`text-left py-3 px-4 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>邮箱</th>
                <th className={`text-left py-3 px-4 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>角色</th>
                <th className={`text-left py-3 px-4 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>状态</th>
                <th className={`text-left py-3 px-4 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>注册时间</th>
                <th className={`text-left py-3 px-4 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>操作</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i} className={`border-b ${isDark ? 'border-gray-700' : 'border-gray-100'}`}>
                    {Array.from({ length: 6 }).map((_, j) => (
                      <td key={j} className="py-3 px-4"><div className={`h-4 rounded animate-pulse ${isDark ? 'bg-gray-700' : 'bg-gray-200'}`} /></td>
                    ))}
                  </tr>
                ))
              ) : users.length === 0 ? (
                <tr><td colSpan={6} className={`py-12 text-center ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>没有找到用户</td></tr>
              ) : (
                users.map(u => (
                  <tr key={u.user_id} className={`border-b ${isDark ? 'border-gray-700' : 'border-gray-100'}`}>
                    <td className={`py-3 px-4 font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>{u.username}</td>
                    <td className={`py-3 px-4 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{u.email}</td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                        u.role_type === 'admin' ? 'bg-red-100 text-red-700' :
                        u.role_type === 'teacher' ? 'bg-blue-100 text-blue-700' :
                        'bg-green-100 text-green-700'
                      }`}>{u.role_type}</span>
                    </td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                        u.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                      }`}>{u.status === 'active' ? '正常' : '已禁用'}</span>
                    </td>
                    <td className={`py-3 px-4 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                      {new Date(u.created_at).toLocaleDateString('zh-CN')}
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex space-x-2">
                        {u.role_type !== 'admin' && (
                          <>
                            <button
                              onClick={() => handleStatusToggle(u.user_id, u.status)}
                              className={`px-3 py-1 rounded text-xs font-medium transition-colors ${
                                u.status === 'active'
                                  ? 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200'
                                  : 'bg-green-100 text-green-700 hover:bg-green-200'
                              }`}
                            >
                              {u.status === 'active' ? '禁用' : '启用'}
                            </button>
                            <button
                              onClick={() => setConfirm({ open: true, userId: u.user_id, username: u.username })}
                              className="px-3 py-1 rounded text-xs font-medium bg-red-100 text-red-700 hover:bg-red-200 transition-colors"
                            >
                              删除
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {totalPages > 1 && (
        <div className="flex justify-center mt-6 space-x-2">
          <button
            onClick={() => setPage(p => Math.max(1, p - 1))}
            disabled={page === 1}
            className={`px-4 py-2 rounded-lg text-sm font-medium disabled:opacity-50 ${
              isDark ? 'bg-gray-800 text-gray-300 hover:bg-gray-700' : 'bg-white text-gray-700 hover:bg-gray-50'
            }`}
          >
            上一页
          </button>
          <span className={`px-4 py-2 text-sm ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
            {page} / {totalPages}
          </span>
          <button
            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            className={`px-4 py-2 rounded-lg text-sm font-medium disabled:opacity-50 ${
              isDark ? 'bg-gray-800 text-gray-300 hover:bg-gray-700' : 'bg-white text-gray-700 hover:bg-gray-50'
            }`}
          >
            下一页
          </button>
        </div>
      )}

      <ConfirmDialog
        isOpen={confirm.open}
        title="删除用户"
        message={`确定要删除用户 "${confirm.username}" 吗？此操作不可撤销。`}
        onConfirm={handleDelete}
        onCancel={() => setConfirm({ open: false, userId: '', username: '' })}
      />
    </AdminLayout>
  )
}

export default AdminUsers
