import React, { useState, useEffect } from 'react'
import { PlayIcon, BookOpenIcon, CogIcon, ChartBarIcon } from '@heroicons/react/24/outline'
import { useThemeStore } from '../../store/useStore'

const FeatureCards: React.FC = () => {
  const { isDark } = useThemeStore()
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    setIsVisible(true)
  }, [])

  const features = [
    {
      title: '动画演示功能',
      description: '支持暂停/继续、单步执行、速度调节控件，让您完全掌控学习节奏',
      icon: PlayIcon,
      color: 'text-teal-600',
      bgColor: 'bg-teal-50',
      borderColor: 'border-teal-200',
      features: ['暂停/继续播放', '单步执行', '速度调节', '实时控制']
    },
    {
      title: '学习辅助功能',
      description: '提供算法简介、伪代码展示、复杂度分析等全面的学习支持',
      icon: BookOpenIcon,
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-50',
      borderColor: 'border-yellow-200',
      features: ['算法简介', '伪代码展示', '复杂度分析', '理论支持']
    },
    {
      title: '性能分析',
      description: '详细的时间复杂度和空间复杂度分析，帮助理解算法效率',
      icon: ChartBarIcon,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      borderColor: 'border-blue-200',
      features: ['时间复杂度', '空间复杂度', '性能对比', '优化建议']
    },
    {
      title: '个性化设置',
      description: '支持多种主题模式和自定义设置，打造专属学习环境',
      icon: CogIcon,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
      borderColor: 'border-purple-200',
      features: ['主题切换', '速度调节', '界面定制', '学习记录']
    }
  ]

  return (
    <section className={`py-12 md:py-16 ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className={`text-center mb-8 md:mb-12 transform transition-all duration-700 ${
          isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'
        }`}>
          <h2 className={`text-2xl sm:text-3xl md:text-4xl font-bold mb-3 md:mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
            核心功能
          </h2>
          <p className={`text-base sm:text-lg md:text-xl ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
            强大的功能组合，为您提供最佳的学习体验
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-4 gap-4 sm:gap-6 lg:gap-8">
          {features.map((feature, index) => (
            <div
              key={index}
              className={`group rounded-xl p-4 sm:p-6 lg:p-8 shadow-lg transition-all duration-300 hover:scale-105 hover:shadow-xl ${
                isDark 
                  ? 'bg-gray-900 border border-gray-700 hover:border-gray-600' 
                  : 'bg-white border border-gray-200 hover:border-gray-300'
              } transform transition-all duration-700`}
              style={{ 
                transitionDelay: `${index * 100}ms`,
                transform: isVisible ? 'translateY(0)' : 'translateY(20px)',
                opacity: isVisible ? 1 : 0
              }}
            >
              <div className="flex flex-col items-center text-center mb-4 sm:mb-6">
                <div className={`p-3 rounded-lg ${feature.bgColor} ${feature.borderColor} border mb-3 sm:mb-4 group-hover:scale-110 transition-transform duration-300`}>
                  <feature.icon className={`h-6 w-6 sm:h-8 sm:w-8 ${feature.color}`} />
                </div>
                <h3 className={`text-lg sm:text-xl font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  {feature.title}
                </h3>
              </div>
              
              <p className={`mb-4 sm:mb-6 ${isDark ? 'text-gray-300' : 'text-gray-600'} leading-relaxed text-sm sm:text-base`}>
                {feature.description}
              </p>

              <div className="space-y-2 sm:space-y-3">
                {feature.features.map((item, idx) => (
                  <div key={idx} className="flex items-center">
                    <div className={`w-2 h-2 rounded-full ${feature.bgColor} mr-2 sm:mr-3 flex-shrink-0`}></div>
                    <span className={`text-xs sm:text-sm ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                      {item}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

export default FeatureCards