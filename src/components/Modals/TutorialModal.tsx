import React, { useEffect, useState } from 'react'
import { XMarkIcon, PlayIcon, PauseIcon, ForwardIcon } from '@heroicons/react/24/outline'
import { useThemeStore } from '../../store/useStore'

const TutorialModal: React.FC = () => {
  const { isDark } = useThemeStore()
  const [isOpen, setIsOpen] = useState(false)

  const tutorialSteps = [
    {
      title: '第一步：选择算法',
      description: '在算法演示页面选择您想要学习的算法类型',
      icon: '🎯',
      content: '我们提供了排序算法、查找算法、树结构算法等多种类型的算法供您选择。'
    },
    {
      title: '第二步：观看动画',
      description: '点击播放按钮开始观看算法的执行过程',
      icon: '▶️',
      content: '动画会逐步展示算法的执行过程，您可以随时暂停、继续或单步执行。'
    },
    {
      title: '第三步：调节速度',
      description: '使用速度控制滑块调整动画播放速度',
      icon: '⚡',
      content: '根据您的学习节奏，可以调节动画播放速度，从慢速到快速自由选择。'
    },
    {
      title: '第四步：查看代码',
      description: '查看算法的伪代码实现和复杂度分析',
      icon: '💻',
      content: '每个算法都配有详细的伪代码和时间复杂度、空间复杂度分析。'
    }
  ]

  const closeModal = () => {
    setIsOpen(false)
  }

  useEffect(() => {
    const handleShowTutorial = () => setIsOpen(true)
    window.addEventListener('showTutorial', handleShowTutorial)
    return () => window.removeEventListener('showTutorial', handleShowTutorial)
  }, [])

  return (
    isOpen ? (
      <div
        id="tutorial-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="tutorial-modal-title"
        className="fixed inset-0 z-50 flex items-center justify-center"
      >
        <div
          onClick={closeModal}
          className={`${isDark ? 'bg-black/60' : 'bg-black/40'} absolute inset-0`}
        />
        <div className={`relative max-w-4xl w-full mx-4 rounded-lg shadow-xl ${isDark ? 'bg-gray-800 text-white' : 'bg-white text-gray-900'}`}>
          <div className="flex justify-between items-center mb-6">
          <h3 id="tutorial-modal-title" className="text-2xl font-bold">快速教程</h3>
          <button
            onClick={closeModal}
            className={`btn btn-sm btn-ghost ${isDark ? 'text-gray-300 hover:text-white' : 'text-gray-600 hover:text-gray-900'}`}
          >
            <XMarkIcon className="h-5 w-5" />
          </button>
          </div>

          <div className="space-y-8">
            {tutorialSteps.map((step, index) => (
              <div key={index} className={`flex items-start space-x-4 p-4 rounded-lg ${
                isDark ? 'bg-gray-700' : 'bg-gray-50'
              }`}>
                <div className="flex-shrink-0">
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center text-2xl ${
                    isDark ? 'bg-teal-600 text-white' : 'bg-teal-500 text-white'
                  }`}>
                    {step.icon}
                  </div>
                </div>
                <div className="flex-1">
                  <h4 className={`text-lg font-semibold mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    {step.title}
                  </h4>
                  <p className={`text-sm mb-3 ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                    {step.description}
                  </p>
                  <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'} leading-relaxed`}>
                    {step.content}
                  </p>
                </div>
              </div>
            ))}
          </div>

        <div className="flex justify-end mt-6 p-4">
          <button
            onClick={closeModal}
            className={`btn ${isDark ? 'btn-primary' : 'btn-primary'}`}
          >
            开始体验
          </button>
          </div>
        </div>
      </div>
    ) : null
  )
}

export default TutorialModal
