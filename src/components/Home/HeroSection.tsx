import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { PlayIcon, BookOpenIcon } from '@heroicons/react/24/outline'
import { useThemeStore } from '../../store/useStore'
import SortingAnimation from '../Animation/SortingAnimation'

const HeroSection: React.FC = () => {
  const { isDark } = useThemeStore()
  const [currentAlgorithm, setCurrentAlgorithm] = useState(0)
  const [isVisible, setIsVisible] = useState(false)

  const algorithms = [
    { name: '冒泡排序', type: 'sorting' },
    { name: '快速排序', type: 'sorting' },
    { name: '二分查找', type: 'searching' },
  ]

  useEffect(() => {
    setIsVisible(true)
    const interval = setInterval(() => {
      setCurrentAlgorithm((prev) => (prev + 1) % algorithms.length)
    }, 3000)

    return () => clearInterval(interval)
  }, [])

  return (
    <section className={`py-12 md:py-20 ${isDark ? 'bg-gray-900' : 'bg-gradient-to-br from-teal-50 to-blue-50'}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center">
          {/* 文字区 */}
          <div className={`space-y-6 lg:space-y-8 transform transition-all duration-1000 ${
            isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'
          }`}>
            <div className="space-y-4">
              <h1 className={`text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold leading-tight ${
                isDark ? 'text-white' : 'text-gray-900'
              }`}>
                算法可视化，
                <span className={`${isDark ? 'text-teal-400' : 'text-teal-600'}`}>
                  学习更简单
                </span>
              </h1>
              <p className={`text-base sm:text-lg md:text-xl ${isDark ? 'text-gray-300' : 'text-gray-600'} leading-relaxed`}>
                通过生动的动画效果，让复杂的算法逻辑变得直观易懂。
                支持暂停、单步执行、速度调节等功能，让学习更加高效。
              </p>
            </div>

            {/* 行动按钮 */}
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
              <Link
                to="/algorithms"
                className="inline-flex items-center justify-center px-6 py-3 bg-teal-600 text-white font-medium rounded-lg hover:bg-teal-700 transition-colors transform hover:scale-105"
              >
                <PlayIcon className="w-5 h-5 mr-2" />
                立即体验
              </Link>
              <button
                onClick={() => {
                  // 触发模态窗口显示使用指引
                  const event = new CustomEvent('showTutorial')
                  window.dispatchEvent(event)
                }}
                className={`inline-flex items-center justify-center px-6 py-3 font-medium rounded-lg border transition-colors transform hover:scale-105 ${
                  isDark
                    ? 'border-gray-600 text-gray-300 hover:bg-gray-800'
                    : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                }`}
              >
                <BookOpenIcon className="w-5 h-5 mr-2" />
                快速教程
              </button>
            </div>

            {/* 特色标签 */}
            <div className="flex flex-wrap gap-2 pt-4">
              {['交互式动画', '多算法支持', '实时演示', '学习友好'].map((tag) => (
                <span
                  key={tag}
                  className={`px-3 py-1 rounded-full text-sm font-medium ${
                    isDark
                      ? 'bg-gray-800 text-gray-300 border border-gray-700'
                      : 'bg-white text-gray-700 border border-gray-200 shadow-sm'
                  }`}
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>

          {/* 动画预览区 */}
          <div className={`transform transition-all duration-1000 delay-300 ${
            isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'
          }`}>
            <div className={`rounded-2xl p-4 sm:p-6 shadow-xl ${
              isDark ? 'bg-gray-800' : 'bg-white'
            }`}>
              <div className="flex items-center justify-between mb-4">
                <h3 className={`text-lg sm:text-xl font-semibold ${
                  isDark ? 'text-white' : 'text-gray-900'
                }`}>
                  {algorithms[currentAlgorithm].name} 演示
                </h3>
                <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'} flex items-center`}>
                  <div className={`w-2 h-2 rounded-full mr-2 animate-pulse ${
                    isDark ? 'bg-teal-400' : 'bg-teal-600'
                  }`}></div>
                  自动切换演示
                </div>
              </div>
              
              <div className="h-48 sm:h-64">
                <SortingAnimation
                  algorithmType={algorithms[currentAlgorithm].type}
                  algorithmName={algorithms[currentAlgorithm].name}
                  autoPlay={true}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

export default HeroSection