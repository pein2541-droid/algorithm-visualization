import React, { useState, useEffect, useRef, useMemo } from 'react'
import { useThemeStore } from '../../store/useStore'

interface SortingAnimationProps {
  algorithmType: string
  algorithmName: string
  autoPlay?: boolean
}

// ---- Step generators ----

function bubbleSortSteps(arr: number[]) {
  const steps: any[] = []
  const a = [...arr]
  const n = a.length
  steps.push({ action: 'init', indices: [], data: [...a], desc: '开始冒泡排序' })
  for (let i = 0; i < n - 1; i++) {
    for (let j = 0; j < n - i - 1; j++) {
      steps.push({ action: 'compare', indices: [j, j + 1], data: [...a], desc: '比较 ' + a[j] + ' 和 ' + a[j+1] })
      if (a[j] > a[j + 1]) {
        const tmp = a[j]; a[j] = a[j + 1]; a[j + 1] = tmp;
        steps.push({ action: 'swap', indices: [j, j + 1], data: [...a], desc: '交换 ' + a[j] + ' 和 ' + a[j+1] })
      }
    }
  }
  steps.push({ action: 'complete', indices: [], data: [...a], desc: '排序完成' })
  return steps
}

function quickSortSteps(arr: number[]) {
  const steps: any[] = []
  const a = [...arr]
  steps.push({ action: 'init', indices: [], data: [...a], desc: '开始快速排序' })
  function partition(low: number, high: number): number {
    const pivot = a[high]
    steps.push({ action: 'pivot', indices: [high], data: [...a], pivot, desc: '基准: ' + pivot })
    let i = low - 1
    for (let j = low; j < high; j++) {
      steps.push({ action: 'compare', indices: [j, high], data: [...a], desc: '比较 ' + a[j] + ' 和基准 ' + pivot })
      if (a[j] < pivot) {
        i++
        if (i !== j) {
          const tmp = a[i]; a[i] = a[j]; a[j] = tmp;
          steps.push({ action: 'swap', indices: [i, j], data: [...a], desc: '交换 ' + a[i] + ' 和 ' + a[j] })
        }
      }
    }
    const tmp = a[i + 1]; a[i + 1] = a[high]; a[high] = tmp;
    steps.push({ action: 'swap', indices: [i + 1, high], data: [...a], desc: '基准归位: ' + a[i+1] })
    return i + 1
  }
  function sort(low: number, high: number) {
    if (low < high) { const pi = partition(low, high); sort(low, pi - 1); sort(pi + 1, high) }
  }
  sort(0, a.length - 1)
  steps.push({ action: 'complete', indices: [], data: [...a], desc: '排序完成' })
  return steps
}

function binarySearchSteps(arr: number[]) {
  const sorted = [...arr].sort((a, b) => a - b)
  const target = sorted[Math.floor(Math.random() * sorted.length)]
  const steps: any[] = []
  steps.push({ action: 'init', data: [...sorted], target, indices: [], desc: '开始二分查找，目标: ' + target, low: 0, high: sorted.length - 1 })
  let low = 0, high = sorted.length - 1
  while (low <= high) {
    const mid = Math.floor((low + high) / 2)
    steps.push({ action: 'mid', data: [...sorted], indices: [mid], target, low, high, mid, desc: '中间值: ' + sorted[mid] })
    if (sorted[mid] === target) {
      steps.push({ action: 'found', data: [...sorted], indices: [mid], target, desc: '找到目标 ' + target + '!' })
      steps.push({ action: 'complete', data: [...sorted], indices: [mid], target, desc: '查找完成' })
      return steps
    } else if (sorted[mid] < target) {
      steps.push({ action: 'goRight', data: [...sorted], indices: [mid], target, low: mid + 1, high, desc: '目标更大，向右查找' })
      low = mid + 1
    } else {
      steps.push({ action: 'goLeft', data: [...sorted], indices: [mid], target, low, high: mid - 1, desc: '目标更小，向左查找' })
      high = mid - 1
    }
  }
  steps.push({ action: 'notFound', data: [...sorted], target, indices: [], desc: '未找到目标' })
  steps.push({ action: 'complete', data: [...sorted], indices: [], target, desc: '查找完成' })
  return steps
}

// ---- Component ----

const SortingAnimation: React.FC<SortingAnimationProps> = ({ algorithmType, algorithmName, autoPlay = false }) => {
  const { isDark } = useThemeStore()

  // Compute steps synchronously in useMemo - guaranteed to have data before first paint
  const steps = useMemo(() => {
    const name = (algorithmName || '').toLowerCase()
    let data: number[]
    if (name.includes('二分')) {
      data = Array.from({ length: 10 }, () => Math.floor(Math.random() * 90) + 10)
      data.sort((a, b) => a - b)
    } else {
      data = Array.from({ length: 10 }, () => Math.floor(Math.random() * 90) + 10)
    }
    if (name.includes('冒泡')) return bubbleSortSteps(data)
    if (name.includes('快速')) return quickSortSteps(data)
    if (name.includes('二分')) return binarySearchSteps(data)
    return bubbleSortSteps(data)
  }, [algorithmName])

  // Animation state
  const [stepIndex, setStepIndex] = useState(0)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const stepsRef = useRef(steps)
  stepsRef.current = steps

  // Reset step index when steps change
  useEffect(() => { setStepIndex(0) }, [steps])

  // Animation loop using setTimeout chaining (avoids stale closure issues)
  useEffect(() => {
    if (!autoPlay) return
    let active = true
    const advance = () => {
      if (!active) return
      setStepIndex(prev => {
        const next = prev + 1
        return next >= stepsRef.current.length ? 0 : next
      })
      timerRef.current = setTimeout(advance, 800)
    }
    timerRef.current = setTimeout(advance, 800)
    return () => { active = false; if (timerRef.current) { clearTimeout(timerRef.current); timerRef.current = null } }
  }, [autoPlay])

  // Cleanup on unmount
  useEffect(() => {
    return () => { if (timerRef.current) clearTimeout(timerRef.current) }
  }, [])

  // Current step data
  const step = steps[stepIndex]
  const displayData: number[] = step?.data || []
  const highlights: number[] = step?.indices || []
  const action = step?.action || ''
  const description = step?.desc || ''
  const currentTarget = step?.target
  const isBinary = (algorithmName || '').toLowerCase().includes('二分')

  let actionLabel = description
  if (!actionLabel) {
    if (action === 'compare') actionLabel = '比较元素'
    else if (action === 'swap') actionLabel = '交换元素'
    else if (action === 'pivot') actionLabel = '基准: ' + (step?.pivot ?? '')
    else if (action === 'complete') actionLabel = '演示完成'
  }

  if (displayData.length === 0) {
    return <div className="h-full flex items-center justify-center"><div className={isDark ? 'text-gray-400' : 'text-gray-500'}>加载中...</div></div>
  }

  const maxValue = Math.max(...displayData)
  const minValue = Math.min(...displayData)

  return (
    <div className="h-full flex flex-col justify-center">
      <div className="flex justify-center space-x-2 h-48 mb-4">
        {displayData.map((value: number, index: number) => {
          const height = maxValue === minValue ? 50 : ((value - minValue) / (maxValue - minValue)) * 100
          const hl = highlights.includes(index)
          const isTarget = isBinary && value === currentTarget
          return (
            <div key={index} className="flex flex-col items-center justify-end h-full">
              <div
                className={'w-8 rounded-t transition-all duration-300 ' + (
                  hl && isTarget ? 'bg-green-500 shadow-lg ring-2 ring-green-300'
                  : hl ? 'bg-yellow-500 shadow-lg'
                  : isDark ? 'bg-teal-600'
                  : 'bg-teal-500'
                )}
                style={{ height: height + '%', minHeight: '20px' }}
              />
              <div className={'text-xs mt-1 ' + (isDark ? 'text-gray-300' : 'text-gray-600')}>{value}</div>
              <div className={'text-xs ' + (isDark ? 'text-gray-400' : 'text-gray-500')}>{index}</div>
            </div>
          )
        })}
      </div>
      {autoPlay && (
        <div className="text-center">
          <div className={'text-sm mb-2 ' + (isDark ? 'text-gray-300' : 'text-gray-600')}>
            步骤 {stepIndex + 1} / {steps.length}
          </div>
          <div className={'text-xs ' + (isDark ? 'text-gray-400' : 'text-gray-500')}>
            {actionLabel}
          </div>
        </div>
      )}
    </div>
  )
}

export default SortingAnimation