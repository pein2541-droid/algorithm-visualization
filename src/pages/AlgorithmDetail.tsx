import React, { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import Header from '../components/Layout/Header'
import Footer from '../components/Layout/Footer'
const KnapsackComponent = React.lazy(() => import('../components/visualizations/KnapsackComponent'))
const BubbleSortComponent = React.lazy(() => import('../components/visualizations/BubbleSortComponent'))
const DFSComponent = React.lazy(() => import('../components/visualizations/DFSComponent'))
const BFSComponent = React.lazy(() => import('../components/visualizations/BFSComponent'))
const SearchComponent = React.lazy(() => import('../components/visualizations/SearchComponent'))
const BinaryTreeComponent = React.lazy(() => import('../components/visualizations/BinaryTreeComponent'))
import { useThemeStore, useAnimationStore } from '../store/useStore'
import { algorithmAPI } from '../utils/api'
import { 
  PlayIcon, 
  PauseIcon, 
  ForwardIcon,
  BackwardIcon,
  ArrowPathIcon
} from '@heroicons/react/24/outline'

interface Algorithm {
  algorithm_id: string
  name: string
  type: string
  description: string
  time_complexity: string
  space_complexity: string
  pseudocode: string[]
}

interface AnimationData {
  algorithm: Algorithm
  animation_steps: any[]
  initial_data: any[]
  visualization_type: string
}

const AlgorithmDetail: React.FC = () => {
  const { type, name } = useParams<{ type: string; name: string }>()
  const { isDark } = useThemeStore()
  const { 
    currentStep, 
    isPlaying, 
    speed, 
    setCurrentStep, 
    setIsPlaying, 
    setSpeed,
    resetAnimation 
  } = useAnimationStore()
  
  const [algorithm, setAlgorithm] = useState<Algorithm | null>(null)
  const [animationData, setAnimationData] = useState<AnimationData | null>(null)
  const [loading, setLoading] = useState(true)
  const [currentData, setCurrentData] = useState<any[]>([])
  const [highlightedIndices, setHighlightedIndices] = useState<number[]>([])
  const [highlightedCell, setHighlightedCell] = useState<number[] | null>(null)
  const [currentNodes, setCurrentNodes] = useState<any[] | null>(null)
  const [currentDescription, setCurrentDescription] = useState<string>('')
  const [highlightCodeLine, setHighlightCodeLine] = useState<number | null>(null)

  useEffect(() => {
    if (name) {
      fetchAlgorithmData()
    }
  }, [name])

  useEffect(() => {
    if (animationData && animationData.animation_steps.length > 0) {
      updateAnimationState()
    }
  }, [currentStep, animationData])

  const fetchAlgorithmData = async () => {
    try {
      setLoading(true)
      // 首先获取算法详情
      const algorithmResponse = await algorithmAPI.getAlgorithms({ 
        type: type || undefined,
        page: 1,
        limit: 50 
      })
      
      const foundAlgorithm = algorithmResponse.data.data.algorithms.find(
        (alg: Algorithm) => alg.name === decodeURIComponent(name || '')
      )
      
      if (foundAlgorithm) {
        setAlgorithm(foundAlgorithm)
        
        // 然后获取动画数据
        const animationResponse = await algorithmAPI.getAnimation(foundAlgorithm.algorithm_id)
        setAnimationData(animationResponse.data.data)
        setCurrentData(animationResponse.data.data.initial_data)
        resetAnimation()
      }
    } catch (error) {
      console.error('获取算法数据失败:', error)
    } finally {
      setLoading(false)
    }
  }

  const updateAnimationState = () => {
    if (animationData && currentStep < animationData.animation_steps.length) {
      const currentAnimation = animationData.animation_steps[currentStep]
      if (currentAnimation.nodes) {
        setCurrentNodes(currentAnimation.nodes)
        setCurrentData([])
      } else {
        setCurrentNodes(null)
        setCurrentData(currentAnimation.data || animationData.initial_data)
      }
      setHighlightedIndices(currentAnimation.highlighted || [])
      if (currentAnimation.highlighted_cell) {
        setHighlightedCell(currentAnimation.highlighted_cell.length === 2 ? currentAnimation.highlighted_cell : null)
      } else {
        setHighlightedCell(null)
      }

      setCurrentDescription(currentAnimation.description || '')

      const action = (currentAnimation.action || '').toLowerCase()
      const name = (algorithm?.name || '').toLowerCase()
      let codeLine: number | null = null
      if (name.includes('冒泡')) {
        // 冒泡排序伪代码行：0:def，1:n，2:for i，3:for j，4:if，5:swap
        if (action.includes('compare')) codeLine = 4
        else if (action.includes('swap')) codeLine = 5
        else if (action.includes('pass') || action.includes('loop')) codeLine = 3
        else codeLine = 2
      } else if (name.includes('快速')) {
        // 快速排序：根据描述粗略映射
        if (action.includes('partition')) codeLine = 5
        else codeLine = 1
      } else if (name.includes('归并')) {
        if (action.includes('merge')) codeLine = 8
        else codeLine = 1
      } else if (name.includes('二分')) {
        if (action.includes('mid')) codeLine = 3
        else if (action.includes('low') || action.includes('high')) codeLine = 6
      }
      setHighlightCodeLine(codeLine)
    }
  }

  const handlePlay = () => {
    setIsPlaying(!isPlaying)
  }

  const handleStepForward = () => {
    if (animationData && currentStep < animationData.animation_steps.length - 1) {
      setCurrentStep(currentStep + 1)
    }
  }

  const handleStepBackward = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1)
    }
  }

  const handleReset = () => {
    resetAnimation()
    if (animationData) {
      setCurrentData(animationData.initial_data)
      setHighlightedIndices([])
    }
  }

  const handleSpeedChange = (newSpeed: number) => {
    setSpeed(newSpeed)
  }

  // 自动播放逻辑
  useEffect(() => {
    if (isPlaying && animationData && currentStep < animationData.animation_steps.length - 1) {
      const timer = setTimeout(() => {
        setCurrentStep(currentStep + 1)
      }, 1000 / speed)
      
      return () => clearTimeout(timer)
    } else if (isPlaying && animationData && currentStep >= animationData.animation_steps.length - 1) {
      setIsPlaying(false)
    }
  }, [isPlaying, currentStep, speed, animationData, setCurrentStep, setIsPlaying])

  const renderVisualization = () => {

    switch (animationData?.visualization_type) {
      case 'bar_chart':
        if (!currentData || currentData.length === 0) return null
        const maxValue = Math.max(...currentData.map(item => typeof item === 'number' ? item : item.value || 0))
        const minValue = Math.min(...currentData.map(item => typeof item === 'number' ? item : item.value || 0))
        return (
          <div className="flex items-end justify-center space-x-2 h-64">
            {currentData.map((value, index) => {
              const numericValue = typeof value === 'number' ? value : value.value || 0
              const height = maxValue === minValue ? 50 : ((numericValue - minValue) / (maxValue - minValue)) * 100
              const isHighlighted = highlightedIndices.includes(index)
              
              return (
                <div key={index} className="flex flex-col items-center">
                  <div
                    className={`w-8 rounded-t transition-all duration-300 ${
                      isHighlighted
                        ? 'bg-yellow-500 shadow-lg transform scale-110'
                        : isDark
                        ? 'bg-teal-600'
                        : 'bg-teal-500'
                    }`}
                    style={{
                      height: `${Math.max(height, 20)}%`,
                      minHeight: '20px'
                    }}
                  ></div>
                  <div className={`text-xs mt-1 ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                    {numericValue}
                  </div>
                  <div className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                    {index}
                  </div>
                </div>
              )
            })}
          </div>
        )
      
      case 'array_highlight':
        if (!currentData || currentData.length === 0) return null
        return (
          <div className="flex flex-wrap justify-center gap-2">
            {currentData.map((value, index) => {
              const isHighlighted = highlightedIndices.includes(index)
              
              return (
                <div
                  key={index}
                  className={`w-16 h-16 flex items-center justify-center rounded-lg border-2 transition-all duration-300 ${
                    isHighlighted
                      ? 'border-yellow-500 bg-yellow-100 text-yellow-800 transform scale-110'
                      : isDark
                      ? 'border-gray-600 bg-gray-700 text-white'
                      : 'border-gray-300 bg-gray-100 text-gray-800'
                  }`}
                >
                  <span className="font-semibold">{value}</span>
                </div>
              )
            })}
          </div>
        )
      
      case 'matrix':
        if (Array.isArray(currentData) && Array.isArray(currentData[0])) {
          const rows = currentData.length
          const cols = currentData[0].length
          return (
            <div className="overflow-auto">
              <div className="inline-block">
                {currentData.map((row: number[], i: number) => (
                  <div key={i} className="flex">
                    {row.map((cell: number, j: number) => {
                      const active = highlightedCell && highlightedCell[0] === i && highlightedCell[1] === j
                      return (
                        <div
                          key={`${i}-${j}`}
                          className={`w-12 h-12 flex items-center justify-center m-0.5 rounded text-sm font-medium border ${
                            active
                              ? 'border-yellow-500 bg-yellow-100 text-yellow-800'
                              : isDark
                              ? 'border-gray-600 bg-gray-700 text-white'
                              : 'border-gray-300 bg-white text-gray-800'
                          }`}
                        >
                          {cell}
                        </div>
                      )
                    })}
                  </div>
                ))}
              </div>
            </div>
          )
        }
        return null

      case 'graph_traversal':
        if (currentNodes) {
          return (
            <div className="space-y-4">
              <div className="flex flex-wrap justify-center gap-3">
                {currentNodes.map((node, idx) => (
                  <div
                    key={idx}
                    className={`w-16 h-16 rounded-full flex items-center justify-center border-2 text-sm font-semibold transition-all ${
                      node.current
                        ? 'border-yellow-500 bg-yellow-100 text-yellow-800'
                        : node.visited
                        ? isDark ? 'border-teal-500 bg-gray-800 text-teal-400' : 'border-teal-500 bg-teal-50 text-teal-700'
                        : isDark ? 'border-gray-600 bg-gray-700 text-white' : 'border-gray-300 bg-white text-gray-800'
                    }`}
                  >
                    {node.label}
                  </div>
                ))}
              </div>
            </div>
          )
        }
        return null

      default:
        return (
          <div className={`text-center p-8 rounded-lg ${
            isDark ? 'bg-gray-800 text-gray-300' : 'bg-gray-100 text-gray-600'
          }`}>
            <p>暂无可视化数据</p>
          </div>
        )
    }
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

  if (!algorithm) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className={`flex-1 flex items-center justify-center ${isDark ? 'bg-gray-900' : 'bg-gray-50'}`}>
          <div className="text-center">
            <p className={isDark ? 'text-gray-300' : 'text-gray-600'}>算法不存在</p>
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
        {/* 页面标题与算法说明 */}
        <section className="py-8">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <h1 className={`text-3xl font-bold mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                {algorithm.name}
              </h1>
              <p className={`text-lg ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                {algorithm.description}
              </p>
              <div className="mt-4 flex items-center justify-center gap-6">
                <div className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                  时间复杂度: <span className={isDark ? 'text-gray-400' : 'text-gray-600'}>{algorithm.time_complexity}</span>
                </div>
                <div className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                  空间复杂度: <span className={isDark ? 'text-gray-400' : 'text-gray-600'}>{algorithm.space_complexity}</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
          {algorithm.name === '0/1背包（DP）' ? (
            <React.Suspense fallback={<div className="flex justify-center py-12"><div className="w-8 h-8 border-4 border-teal-500 border-t-transparent rounded-full animate-spin" /></div>}><KnapsackComponent pseudocode={algorithm.pseudocode || []} /></React.Suspense>
          ) : algorithm.name === '冒泡排序' ? (
            <React.Suspense fallback={<div className="flex justify-center py-12"><div className="w-8 h-8 border-4 border-teal-500 border-t-transparent rounded-full animate-spin" /></div>}><BubbleSortComponent pseudocode={algorithm.pseudocode || []} /></React.Suspense>
          ) : algorithm.name === '深度优先搜索（DFS）' ? (
            <React.Suspense fallback={<div className="flex justify-center py-12"><div className="w-8 h-8 border-4 border-teal-500 border-t-transparent rounded-full animate-spin" /></div>}><DFSComponent pseudocode={algorithm.pseudocode || []} /></React.Suspense>
          ) : algorithm.name === '广度优先搜索（BFS）' ? (
            <React.Suspense fallback={<div className="flex justify-center py-12"><div className="w-8 h-8 border-4 border-teal-500 border-t-transparent rounded-full animate-spin" /></div>}><BFSComponent pseudocode={algorithm.pseudocode || []} /></React.Suspense>
          ) : algorithm.name.includes('二叉树') ? (
            <React.Suspense fallback={<div className="flex justify-center py-12"><div className="w-8 h-8 border-4 border-teal-500 border-t-transparent rounded-full animate-spin" /></div>}><BinaryTreeComponent pseudocode={algorithm.pseudocode || []} /></React.Suspense>
          ) : (algorithm.name.includes('查找') || algorithm.name.includes('搜索')) && !algorithm.name.includes('深度') && !algorithm.name.includes('广度') ? (
            <React.Suspense fallback={<div className="flex justify-center py-12"><div className="w-8 h-8 border-4 border-teal-500 border-t-transparent rounded-full animate-spin" /></div>}><SearchComponent algorithmName={algorithm.name} pseudocode={algorithm.pseudocode || []} /></React.Suspense>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* 动画演示区 */}
            <div className="lg:col-span-2">
              <div className={`rounded-xl p-6 shadow-lg ${isDark ? 'bg-gray-800 border border-gray-700' : 'bg-white border border-gray-200'}`}>
                <h2 className={`text-xl font-semibold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  动画演示
                </h2>
                
                {/* 动画区 */}
                <div className={`rounded-lg p-6 mb-6 ${isDark ? 'bg-gray-700' : 'bg-gray-100'}`}>
                  {renderVisualization()}
                </div>

                {/* 控制按钮 */}
                <div className="flex items-center justify-center space-x-4 mb-4">
                  <button
                    onClick={handleReset}
                    className={`p-2 rounded-lg transition-colors ${
                      isDark ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                    }`}
                  >
                    <ArrowPathIcon className="h-5 w-5" />
                  </button>
                  
                  <button
                    onClick={handleStepBackward}
                    disabled={currentStep === 0}
                    className={`p-2 rounded-lg transition-colors ${
                      currentStep === 0
                        ? isDark ? 'bg-gray-800 text-gray-600' : 'bg-gray-100 text-gray-400'
                        : isDark ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                    }`}
                  >
                    <BackwardIcon className="h-5 w-5" />
                  </button>
                  
                  <button
                    onClick={handlePlay}
                    className={`p-3 rounded-lg transition-colors ${
                      isPlaying
                        ? 'bg-red-600 text-white hover:bg-red-700'
                        : 'bg-teal-600 text-white hover:bg-teal-700'
                    }`}
                  >
                    {isPlaying ? (
                      <PauseIcon className="h-6 w-6" />
                    ) : (
                      <PlayIcon className="h-6 w-6" />
                    )}
                  </button>
                  
                  <button
                    onClick={handleStepForward}
                    disabled={!animationData || currentStep >= animationData.animation_steps.length - 1}
                    className={`p-2 rounded-lg transition-colors ${
                      !animationData || currentStep >= animationData.animation_steps.length - 1
                        ? isDark ? 'bg-gray-800 text-gray-600' : 'bg-gray-100 text-gray-400'
                        : isDark ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                    }`}
                  >
                    <ForwardIcon className="h-5 w-5" />
                  </button>
                </div>

                {/* 进度条 */}
                <div className="mb-4">
                  <div className={`w-full h-2 rounded-full ${isDark ? 'bg-gray-700' : 'bg-gray-200'}`}>
                    <div
                      className="h-2 bg-teal-600 rounded-full transition-all duration-300"
                      style={{
                        width: `${animationData ? ((currentStep + 1) / animationData.animation_steps.length) * 100 : 0}%`
                      }}
                    ></div>
                  </div>
                  <div className={`text-sm text-center mt-2 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                    步骤 {currentStep + 1} / {animationData?.animation_steps.length || 0}
                  </div>
                </div>

                {/* 速度控制 */}
                <div className="flex items-center justify-center space-x-4">
                  <span className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>速度:</span>
                  <div className="flex space-x-2">
                    {[0.5, 1, 1.5, 2].map((speedValue) => (
                      <button
                        key={speedValue}
                        onClick={() => handleSpeedChange(speedValue)}
                        className={`px-3 py-1 rounded text-sm transition-colors ${
                          speed === speedValue
                            ? 'bg-teal-600 text-white'
                            : isDark
                            ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                            : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                        }`}
                      >
                        {speedValue}x
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* 侧边栏 */}
            <div className="space-y-6">
              {/* 当前步骤描述与细节 */}
              {animationData && currentStep < animationData.animation_steps.length && (
                <div className={`rounded-xl p-6 shadow-lg ${isDark ? 'bg-gray-800 border border-gray-700' : 'bg-white border border-gray-200'}`}>
                  <h3 className={`text-lg font-semibold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    当前步骤
                  </h3>
                  <p className={`text-sm mb-3 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                    {currentDescription || animationData.animation_steps[currentStep]?.description || '暂无描述'}
                  </p>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    {animationData.animation_steps[currentStep]?.i !== undefined && (
                      <div className={isDark ? 'text-gray-300' : 'text-gray-700'}>i = {animationData.animation_steps[currentStep].i}</div>
                    )}
                    {animationData.animation_steps[currentStep]?.j !== undefined && (
                      <div className={isDark ? 'text-gray-300' : 'text-gray-700'}>j = {animationData.animation_steps[currentStep].j}</div>
                    )}
                    {animationData.animation_steps[currentStep]?.pivot !== undefined && (
                      <div className={isDark ? 'text-gray-300' : 'text-gray-700'}>pivot = {animationData.animation_steps[currentStep].pivot}</div>
                    )}
                    {highlightedIndices.length > 0 && (
                      <div className={isDark ? 'text-gray-300' : 'text-gray-700'}>高亮: [{highlightedIndices.join(', ')}]</div>
                    )}
                  </div>
                </div>
              )}

              {/* 伪代码（行高亮） */}
              <div className={`rounded-xl p-6 shadow-lg ${isDark ? 'bg-gray-800 border border-gray-700' : 'bg-white border border-gray-200'}`}>
                <h3 className={`text-lg font-semibold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  伪代码
                </h3>
              <div className={`rounded-lg p-4 text-sm font-mono ${isDark ? 'bg-gray-900 text-gray-300' : 'bg-gray-100 text-gray-800'}`}>
                  <div className="flex justify-end mb-2">
                    <button
                      onClick={() => navigator.clipboard.writeText((algorithm.pseudocode || []).join('\n'))}
                      className={`px-2 py-1 rounded text-xs ${isDark ? 'bg-gray-800 text-gray-200 hover:bg-gray-700' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
                    >
                      复制
                    </button>
                  </div>
                  <div className={`overflow-auto rounded ${isDark ? 'bg-gray-950' : 'bg-white'} p-3 space-y-1`}>
                    {(algorithm.pseudocode || []).map((line: string, idx: number) => (
                      <div
                        key={idx}
                        className={`px-2 py-1 rounded ${
                          highlightCodeLine === idx
                            ? 'bg-yellow-100 text-yellow-800'
                            : isDark
                            ? 'bg-transparent text-gray-200'
                            : 'bg-transparent text-gray-800'
                        }`}
                      >
                        {line}
                      </div>
                    ))}
                  </div>
              </div>
              </div>
            </div>
          </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  )
}

export default AlgorithmDetail
