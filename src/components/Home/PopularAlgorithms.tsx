import React from 'react'
import { Link } from 'react-router-dom'
import { 
  ArrowsRightLeftIcon, 
  MagnifyingGlassIcon, 
  CircleStackIcon 
} from '@heroicons/react/24/outline'
import { useThemeStore } from '../../store/useStore'

const PopularAlgorithms: React.FC = () => {
  const { isDark } = useThemeStore()

  const algorithmCategories = [
    {
      id: 'sorting',
      name: '排序算法',
      description: '冒泡排序、快速排序、归并排序等经典排序算法',
      icon: ArrowsRightLeftIcon,
      color: 'from-teal-500 to-blue-500',
      bgColor: 'bg-teal-50',
      algorithms: ['冒泡排序', '快速排序', '归并排序', '插入排序']
    },
    {
      id: 'searching',
      name: '查找算法',
      description: '二分查找、线性查找等高效搜索算法',
      icon: MagnifyingGlassIcon,
      color: 'from-yellow-500 to-orange-500',
      bgColor: 'bg-yellow-50',
      algorithms: ['二分查找', '线性查找', '哈希查找', '插值查找']
    },
    {
      id: 'tree',
      name: '树结构算法',
      description: '二叉树遍历、构建等树结构相关算法',
      icon: CircleStackIcon,
      color: 'from-purple-500 to-pink-500',
      bgColor: 'bg-purple-50',
      algorithms: ['前序遍历', '中序遍历', '后序遍历', '层次遍历']
    }
  ]

  return (
    <section className={`py-16 ${isDark ? 'bg-gray-900' : 'bg-white'}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className={`text-3xl font-bold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
            热门算法
          </h2>
          <p className={`text-lg ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
            精选经典算法，帮助您快速入门算法学习
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {algorithmCategories.map((category) => (
            <div
              key={category.id}
              className={`group relative overflow-hidden rounded-xl p-6 transition-all duration-300 hover:scale-105 hover:shadow-lg ${
                isDark ? 'bg-gray-800 border border-gray-700' : 'bg-white border border-gray-200'
              }`}
            >
              {/* 背景渐变 */}
              <div className={`absolute inset-0 opacity-0 group-hover:opacity-10 transition-opacity bg-gradient-to-br ${category.color}`}></div>
              
              <div className="relative z-10">
                {/* 图标 */}
                <div className={`p-3 rounded-lg ${category.bgColor} mb-4 inline-block`}>
                  <category.icon className={`h-8 w-8 text-${category.color.split('-')[1]}-600`} />
                </div>
                
                {/* 标题和描述 */}
                <h3 className={`text-xl font-semibold mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  {category.name}
                </h3>
                <p className={`text-sm mb-4 ${isDark ? 'text-gray-300' : 'text-gray-600'} leading-relaxed`}>
                  {category.description}
                </p>
                
                {/* 算法列表 */}
                <div className="mb-6">
                  <h4 className={`text-sm font-medium mb-2 ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
                    包含算法：
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {category.algorithms.map((algorithm, index) => (
                      <span
                        key={index}
                        className={`px-2 py-1 text-xs rounded-full ${
                          isDark ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-600'
                        }`}
                      >
                        {algorithm}
                      </span>
                    ))}
                  </div>
                </div>
                
                {/* 查看详情按钮 */}
                <Link
                  to={`/algorithms?type=${category.id}`}
                  className={`inline-flex items-center px-4 py-2 rounded-lg font-medium transition-all duration-300 ${
                    isDark
                      ? 'bg-teal-600 text-white hover:bg-teal-700'
                      : 'bg-teal-600 text-white hover:bg-teal-700'
                  } group-hover:shadow-md`}
                >
                  查看详情
                  <svg className="ml-2 w-4 h-4 transform group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </Link>
              </div>
            </div>
          ))}
        </div>

        {/* 查看更多 */}
        <div className="text-center mt-12">
          <Link
            to="/algorithms"
            className={`inline-flex items-center px-6 py-3 rounded-lg font-medium transition-colors ${
              isDark
                ? 'bg-gray-800 text-white border border-gray-600 hover:bg-gray-700'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            查看全部算法
            <svg className="ml-2 w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </Link>
        </div>
      </div>
    </section>
  )
}

export default PopularAlgorithms