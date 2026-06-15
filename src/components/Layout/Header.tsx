import React, { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { SunIcon, MoonIcon, CodeBracketIcon, Bars3Icon, XMarkIcon } from '@heroicons/react/24/outline'
import { useAuthStore, useThemeStore } from '../../store/useStore'

const Header: React.FC = () => {
  const { pathname } = useLocation()
  const { isAuthenticated, user, clearAuth } = useAuthStore()
  const { isDark, toggleTheme } = useThemeStore()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  const navItems = [
    { name: '首页', path: '/' },
    { name: '算法演示', path: '/algorithms' },
    { name: '学习资料', path: '/learning' },
    ...(user?.role_type === 'admin' ? [{ name: '管理后台', path: '/admin' }] : []),
  ]

  const isActive = (path: string) => {
    if (path === '/') return pathname === '/'
    return pathname.startsWith(path)
  }

  const handleMobileMenuToggle = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen)
  }

  const handleNavClick = () => {
    setIsMobileMenuOpen(false)
  }

  return (
    <header className={`sticky top-0 z-50 ${isDark ? 'bg-gray-900 border-gray-700' : 'bg-white border-gray-200'} border-b`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo和系统名称 */}
          <div className="flex items-center">
            <Link to="/" className="flex items-center space-x-2">
              <CodeBracketIcon className={`h-8 w-8 ${isDark ? 'text-teal-400' : 'text-teal-600'}`} />
              <span className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                Python算法动画演示
              </span>
            </Link>
          </div>

          {/* 桌面导航菜单 */}
          <nav className="hidden md:flex space-x-8">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  isActive(item.path)
                    ? isDark
                      ? 'text-teal-400 bg-teal-900/20'
                      : 'text-teal-600 bg-teal-50'
                    : isDark
                    ? 'text-gray-300 hover:text-white hover:bg-gray-700'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                }`}
              >
                {item.name}
              </Link>
            ))}
          </nav>

          {/* 右侧按钮组 */}
          <div className="flex items-center space-x-4">
            {/* 暗色模式切换 */}
            <button
              onClick={toggleTheme}
              className={`p-2 rounded-md transition-colors ${
                isDark
                  ? 'text-gray-300 hover:text-white hover:bg-gray-700'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
              }`}
            >
              {isDark ? (
                <SunIcon className="h-5 w-5" />
              ) : (
                <MoonIcon className="h-5 w-5" />
              )}
            </button>

            {/* 桌面用户菜单 */}
            <div className="hidden md:flex items-center space-x-2">
              {isAuthenticated ? (
                <>
                  <Link
                    to="/profile"
                    className={`text-sm font-medium ${
                      isDark ? 'text-gray-300 hover:text-white' : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    {user?.username}
                  </Link>
                  <button
                    onClick={clearAuth}
                    className={`text-sm font-medium ${
                      isDark ? 'text-gray-300 hover:text-white' : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    退出
                  </button>
                </>
              ) : (
                <>
                  <Link
                    to="/login"
                    className={`text-sm font-medium ${
                      isDark ? 'text-gray-300 hover:text-white' : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    登录
                  </Link>
                  <Link
                    to="/register"
                    className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                      isDark
                        ? 'bg-teal-600 text-white hover:bg-teal-700'
                        : 'bg-teal-600 text-white hover:bg-teal-700'
                    }`}
                  >
                    注册
                  </Link>
                </>
              )}
            </div>

            {/* 移动端菜单按钮 */}
            <button
              onClick={handleMobileMenuToggle}
              className={`md:hidden p-2 rounded-md transition-colors ${
                isDark
                  ? 'text-gray-300 hover:text-white hover:bg-gray-700'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
              }`}
            >
              {isMobileMenuOpen ? (
                <XMarkIcon className="h-6 w-6" />
              ) : (
                <Bars3Icon className="h-6 w-6" />
              )}
            </button>
          </div>
        </div>

        {/* 移动端菜单 */}
        {isMobileMenuOpen && (
          <div className={`md:hidden border-t ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
            <div className="px-2 pt-2 pb-3 space-y-1">
              {navItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={handleNavClick}
                  className={`block px-3 py-2 rounded-md text-base font-medium transition-colors ${
                    isActive(item.path)
                      ? isDark
                        ? 'text-teal-400 bg-teal-900/20'
                        : 'text-teal-600 bg-teal-50'
                      : isDark
                      ? 'text-gray-300 hover:text-white hover:bg-gray-700'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                  }`}
                >
                  {item.name}
                </Link>
              ))}
            </div>
            
            {/* 移动端用户菜单 */}
            <div className={`px-2 pt-2 pb-3 border-t ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
              {isAuthenticated ? (
                <div className="space-y-1">
                  <Link
                    to="/profile"
                    onClick={handleNavClick}
                    className={`block px-3 py-2 rounded-md text-base font-medium ${
                      isDark ? 'text-gray-300 hover:text-white hover:bg-gray-700' : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                    }`}
                  >
                    {user?.username}
                  </Link>
                  <button
                    onClick={() => {
                      clearAuth()
                      handleNavClick()
                    }}
                    className={`block w-full text-left px-3 py-2 rounded-md text-base font-medium ${
                      isDark ? 'text-gray-300 hover:text-white hover:bg-gray-700' : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                    }`}
                  >
                    退出
                  </button>
                </div>
              ) : (
                <div className="space-y-1">
                  <Link
                    to="/login"
                    onClick={handleNavClick}
                    className={`block px-3 py-2 rounded-md text-base font-medium ${
                      isDark ? 'text-gray-300 hover:text-white hover:bg-gray-700' : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                    }`}
                  >
                    登录
                  </Link>
                  <Link
                    to="/register"
                    onClick={handleNavClick}
                    className={`block px-3 py-2 rounded-md text-base font-medium transition-colors ${
                      isDark
                        ? 'bg-teal-600 text-white hover:bg-teal-700'
                        : 'bg-teal-600 text-white hover:bg-teal-700'
                    }`}
                  >
                    注册
                  </Link>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </header>
  )
}

export default Header