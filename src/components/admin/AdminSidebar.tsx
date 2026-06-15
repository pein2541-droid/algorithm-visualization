import React from 'react'
import { Link, useLocation } from 'react-router-dom'
import { useThemeStore } from '../../store/useStore'
import { LayoutDashboard, Users, Code2, BookOpen } from 'lucide-react'

const sidebarItems = [
  { name: '仪表盘', path: '/admin', icon: LayoutDashboard },
  { name: '用户管理', path: '/admin/users', icon: Users },
  { name: '算法管理', path: '/admin/algorithms', icon: Code2 },
  { name: '内容管理', path: '/admin/content', icon: BookOpen },
]

const AdminSidebar: React.FC = () => {
  const { pathname } = useLocation()
  const { isDark } = useThemeStore()

  return (
    <aside className={`w-64 min-h-screen ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} border-r`}>
      <div className="px-6 py-6">
        <h2 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>管理后台</h2>
      </div>
      <nav className="px-3 space-y-1">
        {sidebarItems.map((item) => {
          const Icon = item.icon
          const active = pathname === item.path || (item.path !== '/admin' && pathname.startsWith(item.path))
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center space-x-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                active
                  ? isDark
                    ? 'bg-teal-600 text-white'
                    : 'bg-teal-50 text-teal-700'
                  : isDark
                  ? 'text-gray-300 hover:bg-gray-700 hover:text-white'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
              }`}
            >
              <Icon className="h-5 w-5" />
              <span>{item.name}</span>
            </Link>
          )
        })}
      </nav>
    </aside>
  )
}

export default AdminSidebar
