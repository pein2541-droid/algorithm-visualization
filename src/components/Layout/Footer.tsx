import React from 'react'
import { useThemeStore } from '../../store/useStore'

const Footer: React.FC = () => {
  const { isDark } = useThemeStore()

  return (
    <footer className={`${isDark ? 'bg-gray-900 border-gray-700' : 'bg-white border-gray-200'} border-t`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* 系统信息 */}
          <div>
            <h3 className={`text-lg font-semibold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
              Python算法动画演示
            </h3>
            <p className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
              通过生动的动画效果帮助您理解和学习各种经典算法，让复杂的算法逻辑变得直观易懂。
            </p>
          </div>

          {/* 快速链接 */}
          <div>
            <h3 className={`text-lg font-semibold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
              快速链接
            </h3>
            <ul className={`space-y-2 text-sm ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
              <li>
                <a href="/algorithms" className="hover:text-teal-600 transition-colors">
                  算法演示
                </a>
              </li>
              <li>
                <a href="/learning" className="hover:text-teal-600 transition-colors">
                  学习资料
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-teal-600 transition-colors">
                  使用帮助
                </a>
              </li>
            </ul>
          </div>

          {/* 联系我们 */}
          <div>
            <h3 className={`text-lg font-semibold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
              联系我们
            </h3>
            <div className={`space-y-2 text-sm ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
              <p>QQ群：123456789</p>
              <p>邮箱：support@algorithm-animation.com</p>
              <p>反馈建议：feedback@algorithm-animation.com</p>
            </div>
          </div>
        </div>

        <div className={`mt-8 pt-8 border-t ${isDark ? 'border-gray-700' : 'border-gray-200'} text-center`}>
          <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
            © 2024 Python算法动画演示系统. 保留所有权利.
          </p>
        </div>
      </div>
    </footer>
  )
}

export default Footer