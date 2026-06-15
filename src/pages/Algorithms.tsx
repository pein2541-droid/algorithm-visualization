import React, { useState, useEffect } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import Header from '../components/Layout/Header'
import Footer from '../components/Layout/Footer'
import { useThemeStore } from '../store/useStore'
import { algorithmAPI } from '../utils/api'
import { 
  ArrowsRightLeftIcon, 
  MagnifyingGlassIcon, 
  CircleStackIcon,
  Squares2X2Icon,
  ShareIcon,
  PlayIcon
} from '@heroicons/react/24/outline'

interface Algorithm {
  algorithm_id: string
  name: string
  type: string
  description: string
  time_complexity: string
  space_complexity: string
}

const Algorithms: React.FC = () => {
  const { isDark } = useThemeStore()
  const [searchParams] = useSearchParams()
  const [algorithms, setAlgorithms] = useState<Algorithm[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedType, setSelectedType] = useState<string>('')

  const algorithmTypes = [
    { 
      id: 'sorting', 
      name: '排序算法', 
      icon: ArrowsRightLeftIcon,
      color: 'from-teal-500 to-blue-500',
      description: '冒泡排序、快速排序、归并排序等经典排序算法'
    },
    { 
      id: 'searching', 
      name: '查找算法', 
      icon: MagnifyingGlassIcon,
      color: 'from-yellow-500 to-orange-500',
      description: '二分查找、线性查找等高效搜索算法'
    },
    { 
      id: 'tree', 
      name: '树结构算法', 
      icon: CircleStackIcon,
      color: 'from-purple-500 to-pink-500',
      description: '二叉树遍历、构建等树结构相关算法'
    },
    { 
      id: 'dp', 
      name: '动态规划', 
      icon: Squares2X2Icon,
      color: 'from-green-500 to-emerald-500',
      description: '0/1背包等动态规划问题演示'
    },
    { 
      id: 'graph', 
      name: '图算法', 
      icon: ShareIcon,
      color: 'from-indigo-500 to-blue-500',
      description: 'DFS/BFS 等图遍历算法'
    }
  ]

  useEffect(() => {
    const type = searchParams.get('type') || ''
    setSelectedType(type)
    fetchAlgorithms(type)
  }, [searchParams])

  const fetchAlgorithms = async (type: string = '') => {
    try {
      setLoading(true)
      const response = await algorithmAPI.getAlgorithms({ 
        type: type || undefined,
        page: 1,
        limit: 50 
      })
      setAlgorithms(response.data.data.algorithms)
    } catch (error) {
      console.error('获取算法列表失败:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleTypeFilter = (type: string) => {
    setSelectedType(type)
    fetchAlgorithms(type)
  }

  const getAlgorithmIcon = (type: string) => {
    const typeInfo = algorithmTypes.find(t => t.id === type)
    return typeInfo?.icon || CircleStackIcon
  }

  const getAlgorithmColor = (type: string) => {
    const typeInfo = algorithmTypes.find(t => t.id === type)
    return typeInfo?.color || 'from-gray-500 to-gray-600'
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className={`flex-1 ${isDark ? 'bg-gray-900' : 'bg-gray-50'}`}>
        {/* 页面标题 */}
        <section className="py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h1 className={`text-4xl font-bold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
              算法演示
            </h1>
            <p className={`text-lg ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
              通过生动的动画效果，深入理解各种经典算法的执行过程
            </p>
          </div>
        </section>

        {/* 算法类型筛选 */}
        <section className="pb-8">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-wrap justify-center gap-4">
              <button
                onClick={() => handleTypeFilter('')}
                className={`px-6 py-3 rounded-lg font-medium transition-all duration-300 ${
                  selectedType === ''
                    ? 'bg-teal-600 text-white shadow-lg'
                    : isDark
                    ? 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                    : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-200'
                }`}
              >
                全部算法
              </button>
              {algorithmTypes.map((type) => (
                <button
                  key={type.id}
                  onClick={() => handleTypeFilter(type.id)}
                  className={`px-6 py-3 rounded-lg font-medium transition-all duration-300 flex items-center space-x-2 ${
                    selectedType === type.id
                      ? 'bg-teal-600 text-white shadow-lg'
                      : isDark
                      ? 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                      : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-200'
                  }`}
                >
                  <type.icon className="h-5 w-5" />
                  <span>{type.name}</span>
                </button>
              ))}
            </div>
          </div>
        </section>

        {/* 算法列表 */}
        <section className="pb-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {[...Array(6)].map((_, index) => (
                  <div
                    key={index}
                    className={`animate-pulse rounded-xl p-6 ${
                      isDark ? 'bg-gray-800' : 'bg-white'
                    }`}
                  >
                    <div className={`h-12 w-12 rounded-lg mb-4 ${isDark ? 'bg-gray-700' : 'bg-gray-200'}`}></div>
                    <div className={`h-6 w-3/4 rounded mb-2 ${isDark ? 'bg-gray-700' : 'bg-gray-200'}`}></div>
                    <div className={`h-4 w-full rounded mb-4 ${isDark ? 'bg-gray-700' : 'bg-gray-200'}`}></div>
                    <div className={`h-8 w-24 rounded ${isDark ? 'bg-gray-700' : 'bg-gray-200'}`}></div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {algorithms.map((algorithm) => {
                  const IconComponent = getAlgorithmIcon(algorithm.type)
                  const gradientColor = getAlgorithmColor(algorithm.type)
                  
                  return (
                    <Link
                      key={algorithm.algorithm_id}
                      to={`/algorithms/${algorithm.type}/${encodeURIComponent(algorithm.name)}`}
                      className={`group relative overflow-hidden rounded-xl p-6 transition-all duration-300 hover:scale-105 hover:shadow-xl ${
                        isDark ? 'bg-gray-800 border border-gray-700' : 'bg-white border border-gray-200'
                      }`}
                    >
                      {/* 背景渐变 */}
                      <div className={`absolute inset-0 opacity-0 group-hover:opacity-10 transition-opacity bg-gradient-to-br ${gradientColor}`}></div>
                      
                      <div className="relative z-10">
                        {/* 图标 */}
                        <div className={`p-3 rounded-lg mb-4 inline-block ${
                          isDark ? 'bg-gray-700' : 'bg-gray-100'
                        }`}>
                          <IconComponent className={`h-8 w-8 text-${gradientColor.split('-')[1]}-600`} />
                        </div>
                        
                        {/* 算法名称 */}
                        <h3 className={`text-xl font-semibold mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                          {algorithm.name}
                        </h3>
                        
                        {/* 算法描述 */}
                        <p className={`text-sm mb-4 ${isDark ? 'text-gray-300' : 'text-gray-600'} leading-relaxed`}>
                          {algorithm.description}
                        </p>
                        
                        {/* 复杂度信息 */}
                        <div className="flex justify-between text-xs mb-4">
                          <div className={`${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                            <span className="font-medium">时间复杂度:</span> {algorithm.time_complexity}
                          </div>
                          <div className={`${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                            <span className="font-medium">空间复杂度:</span> {algorithm.space_complexity}
                          </div>
                        </div>
                        
                        {/* 查看详情按钮 */}
                        <div className="flex items-center justify-between">
                          <span className={`text-sm font-medium ${isDark ? 'text-teal-400' : 'text-teal-600'}`}>
                            查看演示
                          </span>
                          <PlayIcon className={`h-5 w-5 text-${gradientColor.split('-')[1]}-600 transform group-hover:translate-x-1 transition-transform`} />
                        </div>
                      </div>
                    </Link>
                  )
                })}
              </div>
            )}
            
            {algorithms.length === 0 && !loading && (
              <div className="text-center py-12">
                <div className={`text-6xl mb-4 ${isDark ? 'text-gray-600' : 'text-gray-400'}`}>🔍</div>
                <h3 className={`text-lg font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-900'}`}>
                  暂无算法数据
                </h3>
                <p className={`${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                  请稍后重试或联系管理员
                </p>
              </div>
            )}
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}

export default Algorithms
