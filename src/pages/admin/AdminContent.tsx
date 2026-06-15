import React, { useEffect, useState } from 'react'
import { useThemeStore } from '../../store/useStore'
import AdminLayout from '../../components/admin/AdminLayout'
import ConfirmDialog from '../../components/admin/ConfirmDialog'
import { adminAPI } from '../../utils/api'

interface Category {
  category_id: string
  name: string
  description: string
  sort_order: number
}

interface Material {
  material_id: string
  title: string
  content: string
  category_id: string
  algorithm_id: string | null
  code_example: any
  created_at: string
}

type Tab = 'categories' | 'materials'

const AdminContent: React.FC = () => {
  const { isDark } = useThemeStore()
  const [tab, setTab] = useState<Tab>('categories')

  // Categories state
  const [categories, setCategories] = useState<Category[]>([])
  const [catLoading, setCatLoading] = useState(true)
  const [catForm, setCatForm] = useState({ name: '', description: '', sort_order: 0 })
  const [editingCat, setEditingCat] = useState<Category | null>(null)
  const [catConfirm, setCatConfirm] = useState<{ open: boolean; id: string; name: string }>({ open: false, id: '', name: '' })

  // Materials state
  const [materials, setMaterials] = useState<Material[]>([])
  const [matLoading, setMatLoading] = useState(true)
  const [matPage, setMatPage] = useState(1)
  const [matTotal, setMatTotal] = useState(0)
  const [matForm, setMatForm] = useState({ title: '', content: '', category_id: '', algorithm_id: '', code_example: '' })
  const [editingMat, setEditingMat] = useState<Material | null>(null)
  const [matModal, setMatModal] = useState(false)
  const [matConfirm, setMatConfirm] = useState<{ open: boolean; id: string; title: string }>({ open: false, id: '', title: '' })
  const [matSaving, setMatSaving] = useState(false)
  const limit = 10

  const inputClass = `w-full px-3 py-2 rounded-lg border text-sm ${
    isDark ? 'bg-gray-700 border-gray-600 text-gray-200' : 'bg-white border-gray-300 text-gray-900'
  }`

  useEffect(() => { loadCategories() }, [])
  useEffect(() => { loadMaterials() }, [matPage])

  const loadCategories = async () => {
    setCatLoading(true)
    try {
      const res = await adminAPI.getCategories()
      setCategories(res.data.data)
    } catch { /* ignore */ } finally { setCatLoading(false) }
  }

  const loadMaterials = async () => {
    setMatLoading(true)
    try {
      const res = await adminAPI.getMaterials({ page: matPage, limit })
      setMaterials(res.data.data.materials)
      setMatTotal(res.data.data.total)
    } catch { /* ignore */ } finally { setMatLoading(false) }
  }

  // Category handlers
  const handleSaveCategory = async () => {
    if (!catForm.name.trim()) return
    try {
      if (editingCat) {
        await adminAPI.updateCategory(editingCat.category_id, catForm)
      } else {
        await adminAPI.createCategory(catForm)
      }
      setEditingCat(null)
      setCatForm({ name: '', description: '', sort_order: 0 })
      loadCategories()
    } catch { alert('操作失败') }
  }

  const handleDeleteCategory = async () => {
    try {
      await adminAPI.deleteCategory(catConfirm.id)
      setCatConfirm({ open: false, id: '', name: '' })
      loadCategories()
    } catch { alert('删除失败') }
  }

  // Material handlers
  const openMatCreate = () => {
    setMatForm({ title: '', content: '', category_id: categories[0]?.category_id || '', algorithm_id: '', code_example: '' })
    setEditingMat(null)
    setMatModal(true)
  }

  const openMatEdit = (m: Material) => {
    setMatForm({
      title: m.title,
      content: m.content,
      category_id: m.category_id,
      algorithm_id: m.algorithm_id || '',
      code_example: m.code_example ? JSON.stringify(m.code_example, null, 2) : '',
    })
    setEditingMat(m)
    setMatModal(true)
  }

  const handleSaveMaterial = async () => {
    if (!matForm.title.trim() || !matForm.content.trim() || !matForm.category_id) return
    setMatSaving(true)
    try {
      const data: any = {
        title: matForm.title,
        content: matForm.content,
        category_id: matForm.category_id,
        algorithm_id: matForm.algorithm_id || null,
        code_example: matForm.code_example ? JSON.parse(matForm.code_example) : null,
      }
      if (editingMat) {
        await adminAPI.updateMaterial(editingMat.material_id, data)
      } else {
        await adminAPI.createMaterial(data)
      }
      setMatModal(false)
      loadMaterials()
    } catch { alert('保存失败') } finally { setMatSaving(false) }
  }

  const handleDeleteMaterial = async () => {
    try {
      await adminAPI.deleteMaterial(matConfirm.id)
      setMatConfirm({ open: false, id: '', title: '' })
      loadMaterials()
    } catch { alert('删除失败') }
  }

  const totalPages = Math.ceil(matTotal / limit)

  return (
    <AdminLayout>
      <h1 className={`text-2xl font-bold mb-6 ${isDark ? 'text-white' : 'text-gray-900'}`}>内容管理</h1>

      <div className="flex mb-6 space-x-1 rounded-lg p-1 w-fit bg-gray-100 dark:bg-gray-800">
        {(['categories', 'materials'] as Tab[]).map(t => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              tab === t
                ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
            }`}
          >
            {t === 'categories' ? '分类管理' : '学习材料'}
          </button>
        ))}
      </div>

      {tab === 'categories' && (
        <>
          <div className={`rounded-xl p-6 shadow-sm mb-6 ${isDark ? 'bg-gray-800' : 'bg-white'}`}>
            <h3 className={`text-sm font-semibold mb-3 ${isDark ? 'text-white' : 'text-gray-900'}`}>
              {editingCat ? '编辑分类' : '新增分类'}
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-3">
              <input className={inputClass} placeholder="名称" value={catForm.name}
                onChange={e => setCatForm({ ...catForm, name: e.target.value })} />
              <input className={inputClass} placeholder="描述" value={catForm.description}
                onChange={e => setCatForm({ ...catForm, description: e.target.value })} />
              <input className={inputClass} type="number" placeholder="排序" value={catForm.sort_order}
                onChange={e => setCatForm({ ...catForm, sort_order: parseInt(e.target.value) || 0 })} />
            </div>
            <div className="flex space-x-2">
              <button onClick={handleSaveCategory} disabled={!catForm.name.trim()}
                className="px-4 py-2 bg-teal-600 text-white rounded-lg text-sm font-medium hover:bg-teal-700 disabled:opacity-50">
                保存
              </button>
              {editingCat && (
                <button onClick={() => { setEditingCat(null); setCatForm({ name: '', description: '', sort_order: 0 }) }}
                  className={`px-4 py-2 rounded-lg text-sm font-medium ${isDark ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-700'}`}>
                  取消
                </button>
              )}
            </div>
          </div>

          <div className={`rounded-xl shadow-sm overflow-hidden ${isDark ? 'bg-gray-800' : 'bg-white'}`}>
            <table className="w-full text-sm">
              <thead>
                <tr className={`border-b ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
                  <th className={`text-left py-3 px-4 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>名称</th>
                  <th className={`text-left py-3 px-4 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>描述</th>
                  <th className={`text-left py-3 px-4 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>排序</th>
                  <th className={`text-left py-3 px-4 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>操作</th>
                </tr>
              </thead>
              <tbody>
                {catLoading ? (
                  <tr><td colSpan={4} className="py-12 text-center"><div className="animate-spin rounded-full h-6 w-6 border-b-2 border-teal-600 mx-auto" /></td></tr>
                ) : categories.length === 0 ? (
                  <tr><td colSpan={4} className={`py-12 text-center ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>暂无分类</td></tr>
                ) : (
                  categories.map(c => (
                    <tr key={c.category_id} className={`border-b ${isDark ? 'border-gray-700' : 'border-gray-100'}`}>
                      <td className={`py-3 px-4 font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>{c.name}</td>
                      <td className={`py-3 px-4 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{c.description}</td>
                      <td className={`py-3 px-4 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{c.sort_order}</td>
                      <td className="py-3 px-4">
                        <div className="flex space-x-2">
                          <button onClick={() => { setEditingCat(c); setCatForm({ name: c.name, description: c.description || '', sort_order: c.sort_order }) }}
                            className="px-3 py-1 rounded text-xs font-medium bg-teal-100 text-teal-700 hover:bg-teal-200">编辑</button>
                          <button onClick={() => setCatConfirm({ open: true, id: c.category_id, name: c.name })}
                            className="px-3 py-1 rounded text-xs font-medium bg-red-100 text-red-700 hover:bg-red-200">删除</button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          <ConfirmDialog isOpen={catConfirm.open} title="删除分类"
            message={`确定要删除分类 "${catConfirm.name}" 吗？该分类下的所有学习材料也会被删除。`}
            onConfirm={handleDeleteCategory} onCancel={() => setCatConfirm({ open: false, id: '', name: '' })} />
        </>
      )}

      {tab === 'materials' && (
        <>
          <div className="flex justify-end mb-4">
            <button onClick={openMatCreate} className="px-4 py-2 bg-teal-600 text-white rounded-lg text-sm font-medium hover:bg-teal-700">
              新增材料
            </button>
          </div>

          <div className={`rounded-xl shadow-sm overflow-hidden ${isDark ? 'bg-gray-800' : 'bg-white'}`}>
            <table className="w-full text-sm">
              <thead>
                <tr className={`border-b ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
                  <th className={`text-left py-3 px-4 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>标题</th>
                  <th className={`text-left py-3 px-4 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>分类ID</th>
                  <th className={`text-left py-3 px-4 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>创建时间</th>
                  <th className={`text-left py-3 px-4 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>操作</th>
                </tr>
              </thead>
              <tbody>
                {matLoading ? (
                  Array.from({ length: 3 }).map((_, i) => (
                    <tr key={i} className={`border-b ${isDark ? 'border-gray-700' : 'border-gray-100'}`}>
                      {Array.from({ length: 4 }).map((_, j) => (
                        <td key={j} className="py-3 px-4"><div className={`h-4 rounded animate-pulse ${isDark ? 'bg-gray-700' : 'bg-gray-200'}`} /></td>
                      ))}
                    </tr>
                  ))
                ) : materials.length === 0 ? (
                  <tr><td colSpan={4} className={`py-12 text-center ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>暂无材料</td></tr>
                ) : (
                  materials.map(m => (
                    <tr key={m.material_id} className={`border-b ${isDark ? 'border-gray-700' : 'border-gray-100'}`}>
                      <td className={`py-3 px-4 font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>{m.title}</td>
                      <td className={`py-3 px-4 font-mono text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{m.category_id?.slice(0, 8)}...</td>
                      <td className={`py-3 px-4 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{new Date(m.created_at).toLocaleDateString('zh-CN')}</td>
                      <td className="py-3 px-4">
                        <div className="flex space-x-2">
                          <button onClick={() => openMatEdit(m)}
                            className="px-3 py-1 rounded text-xs font-medium bg-teal-100 text-teal-700 hover:bg-teal-200">编辑</button>
                          <button onClick={() => setMatConfirm({ open: true, id: m.material_id, title: m.title })}
                            className="px-3 py-1 rounded text-xs font-medium bg-red-100 text-red-700 hover:bg-red-200">删除</button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {totalPages > 1 && (
            <div className="flex justify-center mt-6 space-x-2">
              <button onClick={() => setMatPage(p => Math.max(1, p - 1))} disabled={matPage === 1}
                className={`px-4 py-2 rounded-lg text-sm font-medium disabled:opacity-50 ${isDark ? 'bg-gray-800 text-gray-300' : 'bg-white text-gray-700'}`}>上一页</button>
              <span className={`px-4 py-2 text-sm ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>{matPage} / {totalPages}</span>
              <button onClick={() => setMatPage(p => Math.min(totalPages, p + 1))} disabled={matPage === totalPages}
                className={`px-4 py-2 rounded-lg text-sm font-medium disabled:opacity-50 ${isDark ? 'bg-gray-800 text-gray-300' : 'bg-white text-gray-700'}`}>下一页</button>
            </div>
          )}

          {matModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center">
              <div className="fixed inset-0 bg-black/50" onClick={() => setMatModal(false)} />
              <div className={`relative rounded-xl p-6 shadow-xl max-w-xl w-full mx-4 max-h-[90vh] overflow-y-auto ${isDark ? 'bg-gray-800' : 'bg-white'}`}>
                <h3 className={`text-lg font-semibold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  {editingMat ? '编辑材料' : '新增材料'}
                </h3>
                <div className="space-y-4">
                  <div>
                    <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>标题 *</label>
                    <input className={inputClass} value={matForm.title} onChange={e => setMatForm({ ...matForm, title: e.target.value })} />
                  </div>
                  <div>
                    <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>分类 *</label>
                    <select className={inputClass} value={matForm.category_id} onChange={e => setMatForm({ ...matForm, category_id: e.target.value })}>
                      <option value="">选择分类</option>
                      {categories.map(c => <option key={c.category_id} value={c.category_id}>{c.name}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>内容 (HTML) *</label>
                    <textarea className={inputClass} rows={6} value={matForm.content} onChange={e => setMatForm({ ...matForm, content: e.target.value })} />
                  </div>
                  <div>
                    <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>代码示例 (JSON)</label>
                    <textarea className={inputClass} rows={4} value={matForm.code_example} onChange={e => setMatForm({ ...matForm, code_example: e.target.value })} />
                  </div>
                </div>
                <div className="flex justify-end space-x-3 mt-6">
                  <button onClick={() => setMatModal(false)}
                    className={`px-4 py-2 rounded-lg text-sm font-medium ${isDark ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-700'}`}>取消</button>
                  <button onClick={handleSaveMaterial} disabled={matSaving || !matForm.title.trim()}
                    className="px-4 py-2 rounded-lg text-sm font-medium bg-teal-600 text-white hover:bg-teal-700 disabled:opacity-50">
                    {matSaving ? '保存中...' : '保存'}
                  </button>
                </div>
              </div>
            </div>
          )}

          <ConfirmDialog isOpen={matConfirm.open} title="删除材料"
            message={`确定要删除材料 "${matConfirm.title}" 吗？`}
            onConfirm={handleDeleteMaterial} onCancel={() => setMatConfirm({ open: false, id: '', title: '' })} />
        </>
      )}
    </AdminLayout>
  )
}

export default AdminContent
