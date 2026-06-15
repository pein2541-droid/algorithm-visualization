import React, { useState, useEffect } from 'react'
import Header from '../components/Layout/Header'
import Footer from '../components/Layout/Footer'
import { useThemeStore } from '../store/useStore'
import { learningAPI } from '../utils/api'
import { 
  BookOpenIcon, 
  CodeBracketIcon, 
  ChartBarIcon,
  QuestionMarkCircleIcon,
  ClipboardDocumentIcon
} from '@heroicons/react/24/outline'

interface Category {
  category_id: string
  name: string
  description: string
}

interface Material {
  material_id: string
  title: string
  content: string
  code_example: any
  created_at: string
}

const Learning: React.FC = () => {
  const { isDark } = useThemeStore()
  const [categories, setCategories] = useState<Category[]>([])
  const [selectedCategory, setSelectedCategory] = useState<string>('')
  const [materials, setMaterials] = useState<Material[]>([])
  const [loading, setLoading] = useState(true)
  const [copySuccess, setCopySuccess] = useState<string>('')

  const categoryIcons = {
    '算法简介': BookOpenIcon,
    '伪代码': CodeBracketIcon,
    '时间复杂度': ChartBarIcon,
    '常见问题': QuestionMarkCircleIcon
  }

  useEffect(() => {
    fetchCategories()
  }, [])

  useEffect(() => {
    if (selectedCategory) {
      fetchMaterials(selectedCategory)
    }
  }, [selectedCategory])

  const fetchCategories = async () => {
    try {
      const response = await learningAPI.getCategories()
      setCategories(response.data.data)
      if (response.data.data.length > 0) {
        setSelectedCategory(response.data.data[0].category_id)
      }
    } catch (error) {
      console.error('获取分类失败:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchMaterials = async (categoryId: string) => {
    try {
      setLoading(true)
      const response = await learningAPI.getCategoryContent(categoryId)
      setMaterials(response.data.data)
    } catch (error) {
      console.error('获取学习资料失败:', error)
    } finally {
      setLoading(false)
    }
  }

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopySuccess('已复制到剪贴板！')
      setTimeout(() => setCopySuccess(''), 2000)
    } catch (error) {
      setCopySuccess('复制失败，请手动复制')
      setTimeout(() => setCopySuccess(''), 2000)
    }
  }

  const renderContent = (material: Material) => {
    return (
      <div className="space-y-6">
        <div>
          <h3 className={`text-xl font-semibold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
            {material.title}
          </h3>
          <div 
            className={`prose max-w-none ${isDark ? 'text-gray-300' : 'text-gray-700'} leading-relaxed`}
            dangerouslySetInnerHTML={{ __html: material.content }}
          />
        </div>

        {material.code_example && (
          <div>
            <div className="flex items-center justify-between mb-4">
              <h4 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                代码示例
              </h4>
              <button
                onClick={() => copyToClipboard(JSON.stringify(material.code_example, null, 2))}
                className={`flex items-center space-x-2 px-3 py-1 rounded text-sm transition-colors ${
                  isDark 
                    ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' 
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <ClipboardDocumentIcon className="h-4 w-4" />
                <span>复制</span>
              </button>
            </div>
            <div className={`rounded-lg p-4 overflow-x-auto ${isDark ? 'bg-gray-900' : 'bg-gray-100'}`}>
              <pre className={`text-sm font-mono ${isDark ? 'text-gray-300' : 'text-gray-800'}`}>
                {JSON.stringify(material.code_example, null, 2)}
              </pre>
            </div>
          </div>
        )}

        {copySuccess && (
          <div className={`p-3 rounded-lg text-sm ${
            isDark 
              ? 'bg-green-900/20 border border-green-800 text-green-400' 
              : 'bg-green-50 border border-green-200 text-green-600'
          }`}>
            {copySuccess}
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className={`flex-1 ${isDark ? 'bg-gray-900' : 'bg-gray-50'}`}>
        {/* 页面标题 */}
        <section className="py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h1 className={`text-4xl font-bold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
              学习资料
            </h1>
            <p className={`text-lg ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
              深入学习算法理论知识，掌握核心概念和实现方法
            </p>
          </div>
        </section>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* 左侧导航 */}
            <div className="lg:col-span-1">
              <div className={`sticky top-24 rounded-xl p-6 shadow-lg ${isDark ? 'bg-gray-800 border border-gray-700' : 'bg-white border border-gray-200'}`}>
                <h2 className={`text-lg font-semibold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  资料分类
                </h2>
                <nav className="space-y-2">
                  {categories.map((category) => {
                    const IconComponent = categoryIcons[category.name as keyof typeof categoryIcons] || BookOpenIcon
                    return (
                      <button
                        key={category.category_id}
                        onClick={() => setSelectedCategory(category.category_id)}
                        className={`w-full text-left px-4 py-3 rounded-lg transition-colors flex items-center space-x-3 ${
                          selectedCategory === category.category_id
                            ? isDark
                              ? 'bg-teal-900/20 text-teal-400 border border-teal-700'
                              : 'bg-teal-50 text-teal-600 border border-teal-200'
                            : isDark
                            ? 'text-gray-300 hover:bg-gray-700'
                            : 'text-gray-700 hover:bg-gray-50'
                        }`}
                      >
                        <IconComponent className="h-5 w-5" />
                        <div>
                          <div className="font-medium">{category.name}</div>
                          <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                            {category.description}
                          </div>
                        </div>
                      </button>
                    )
                  })}
                </nav>
              </div>
            </div>

            {/* 右侧内容区 */}
            <div className="lg:col-span-3">
              {loading ? (
                <div className={`rounded-xl p-8 shadow-lg ${isDark ? 'bg-gray-800 border border-gray-700' : 'bg-white border border-gray-200'}`}>
                  <div className="animate-pulse">
                    <div className={`h-8 w-3/4 rounded mb-4 ${isDark ? 'bg-gray-700' : 'bg-gray-200'}`}></div>
                    <div className={`h-4 w-full rounded mb-2 ${isDark ? 'bg-gray-700' : 'bg-gray-200'}`}></div>
                    <div className={`h-4 w-full rounded mb-2 ${isDark ? 'bg-gray-700' : 'bg-gray-200'}`}></div>
                    <div className={`h-4 w-3/4 rounded ${isDark ? 'bg-gray-700' : 'bg-gray-200'}`}></div>
                  </div>
                </div>
              ) : (
                <div className={`rounded-xl p-8 shadow-lg ${isDark ? 'bg-gray-800 border border-gray-700' : 'bg-white border border-gray-200'}`}>
                  {materials.length === 0 ? (
                    <div className="text-center py-12">
                      <div className={`text-6xl mb-4 ${isDark ? 'text-gray-600' : 'text-gray-400'}`}>📚</div>
                      <h3 className={`text-lg font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-900'}`}>
                        暂无学习资料
                      </h3>
                      <p className={`${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                        该分类下暂无学习资料，请选择其他分类
                      </p>
                    </div>
                  ) : (
                    materials.map((material) => (
                      <div key={material.material_id} className="mb-8 last:mb-0">
                        {renderContent(material)}
                        {materials.indexOf(material) < materials.length - 1 && (
                          <hr className={`my-8 ${isDark ? 'border-gray-700' : 'border-gray-200'}`} />
                        )}
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}

export default Learning