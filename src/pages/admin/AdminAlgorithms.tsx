import React, { useEffect, useState } from 'react'
import { useThemeStore } from '../../store/useStore'
import AdminLayout from '../../components/admin/AdminLayout'
import ConfirmDialog from '../../components/admin/ConfirmDialog'
import { adminAPI, algorithmAPI } from '../../utils/api'

interface Algo {
  algorithm_id: string
  name: string
  type: string
  description: string
  time_complexity: string
  space_complexity: string
  pseudocode: string[]
  created_at: string
}

const ALGO_TYPES = ['sorting', 'searching', 'tree', 'dp', 'graph']

const emptyForm = { name: '', type: 'sorting', description: '', time_complexity: '', space_complexity: '', pseudocode: '' }

const AdminAlgorithms: React.FC = () => {
  const { isDark } = useThemeStore()
  const [algorithms, setAlgorithms] = useState<Algo[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [editModal, setEditModal] = useState<{ open: boolean; algo: Algo | null }>({ open: false, algo: null })
  const [form, setForm] = useState(emptyForm)
  const [saving, setSaving] = useState(false)
  const [confirm, setConfirm] = useState<{ open: boolean; id: string; name: string }>({ open: false, id: '', name: '' })

  const loadAlgorithms = async () => {
    setLoading(true)
    try {
      const res = await algorithmAPI.getAlgorithms({ limit: 100 })
      setAlgorithms(res.data.data.algorithms)
    } catch {
      setError('加载算法列表失败')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { loadAlgorithms() }, [])

  const openCreate = () => {
    setForm(emptyForm)
    setEditModal({ open: true, algo: null })
  }

  const openEdit = (algo: Algo) => {
    setForm({
      name: algo.name,
      type: algo.type,
      description: algo.description || '',
      time_complexity: algo.time_complexity || '',
      space_complexity: algo.space_complexity || '',
      pseudocode: Array.isArray(algo.pseudocode) ? algo.pseudocode.join('\n') : '',
    })
    setEditModal({ open: true, algo })
  }

  const handleSave = async () => {
    if (!form.name.trim() || !form.type) return
    setSaving(true)
    try {
      const data = {
        ...form,
        pseudocode: form.pseudocode ? form.pseudocode.split('\n').filter(Boolean) : [],
      }
      if (editModal.algo) {
        await adminAPI.updateAlgorithm(editModal.algo.algorithm_id, data)
      } else {
        await adminAPI.createAlgorithm(data)
      }
      setEditModal({ open: false, algo: null })
      loadAlgorithms()
    } catch {
      alert('保存失败')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    try {
      await adminAPI.deleteAlgorithm(confirm.id)
      setConfirm({ open: false, id: '', name: '' })
      loadAlgorithms()
    } catch {
      alert('删除失败')
    }
  }

  const inputClass = `w-full px-3 py-2 rounded-lg border text-sm ${
    isDark ? 'bg-gray-700 border-gray-600 text-gray-200' : 'bg-white border-gray-300 text-gray-900'
  }`

  return (
    <AdminLayout>
      <div className="flex items-center justify-between mb-6">
        <h1 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>算法管理</h1>
        <button onClick={openCreate} className="px-4 py-2 bg-teal-600 text-white rounded-lg text-sm font-medium hover:bg-teal-700">
          新增算法
        </button>
      </div>

      {error && <div className="mb-4 p-4 rounded-lg bg-red-50 text-red-600 text-sm">{error}</div>}

      <div className={`rounded-xl shadow-sm overflow-hidden ${isDark ? 'bg-gray-800' : 'bg-white'}`}>
        <table className="w-full text-sm">
          <thead>
            <tr className={`border-b ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
              <th className={`text-left py-3 px-4 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>名称</th>
              <th className={`text-left py-3 px-4 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>类型</th>
              <th className={`text-left py-3 px-4 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>时间复杂度</th>
              <th className={`text-left py-3 px-4 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>空间复杂度</th>
              <th className={`text-left py-3 px-4 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>操作</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <tr key={i} className={`border-b ${isDark ? 'border-gray-700' : 'border-gray-100'}`}>
                  {Array.from({ length: 5 }).map((_, j) => (
                    <td key={j} className="py-3 px-4"><div className={`h-4 rounded animate-pulse ${isDark ? 'bg-gray-700' : 'bg-gray-200'}`} /></td>
                  ))}
                </tr>
              ))
            ) : algorithms.length === 0 ? (
              <tr><td colSpan={5} className={`py-12 text-center ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>暂无算法</td></tr>
            ) : (
              algorithms.map(a => (
                <tr key={a.algorithm_id} className={`border-b ${isDark ? 'border-gray-700' : 'border-gray-100'}`}>
                  <td className={`py-3 px-4 font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>{a.name}</td>
                  <td className="py-3 px-4">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                      isDark ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-700'
                    }`}>{a.type}</span>
                  </td>
                  <td className={`py-3 px-4 font-mono ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{a.time_complexity}</td>
                  <td className={`py-3 px-4 font-mono ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{a.space_complexity}</td>
                  <td className="py-3 px-4">
                    <div className="flex space-x-2">
                      <button
                        onClick={() => openEdit(a)}
                        className="px-3 py-1 rounded text-xs font-medium bg-teal-100 text-teal-700 hover:bg-teal-200 transition-colors"
                      >
                        编辑
                      </button>
                      <button
                        onClick={() => setConfirm({ open: true, id: a.algorithm_id, name: a.name })}
                        className="px-3 py-1 rounded text-xs font-medium bg-red-100 text-red-700 hover:bg-red-200 transition-colors"
                      >
                        删除
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {editModal.open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="fixed inset-0 bg-black/50" onClick={() => setEditModal({ open: false, algo: null })} />
          <div className={`relative rounded-xl p-6 shadow-xl max-w-lg w-full mx-4 max-h-[90vh] overflow-y-auto ${isDark ? 'bg-gray-800' : 'bg-white'}`}>
            <h3 className={`text-lg font-semibold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
              {editModal.algo ? '编辑算法' : '新增算法'}
            </h3>
            <div className="space-y-4">
              <div>
                <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>名称 *</label>
                <input className={inputClass} value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
              </div>
              <div>
                <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>类型 *</label>
                <select className={inputClass} value={form.type} onChange={e => setForm({ ...form, type: e.target.value })}>
                  {ALGO_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
              <div>
                <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>描述</label>
                <textarea className={inputClass} rows={2} value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>时间复杂度</label>
                  <input className={inputClass} value={form.time_complexity} onChange={e => setForm({ ...form, time_complexity: e.target.value })} />
                </div>
                <div>
                  <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>空间复杂度</label>
                  <input className={inputClass} value={form.space_complexity} onChange={e => setForm({ ...form, space_complexity: e.target.value })} />
                </div>
              </div>
              <div>
                <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>伪代码（每行一条）</label>
                <textarea className={inputClass} rows={6} value={form.pseudocode} onChange={e => setForm({ ...form, pseudocode: e.target.value })} />
              </div>
            </div>
            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => setEditModal({ open: false, algo: null })}
                className={`px-4 py-2 rounded-lg text-sm font-medium ${
                  isDark ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                取消
              </button>
              <button
                onClick={handleSave}
                disabled={saving || !form.name.trim()}
                className="px-4 py-2 rounded-lg text-sm font-medium bg-teal-600 text-white hover:bg-teal-700 disabled:opacity-50"
              >
                {saving ? '保存中...' : '保存'}
              </button>
            </div>
          </div>
        </div>
      )}

      <ConfirmDialog
        isOpen={confirm.open}
        title="删除算法"
        message={`确定要删除算法 "${confirm.name}" 吗？相关动画数据和学习材料也会被删除。`}
        onConfirm={handleDelete}
        onCancel={() => setConfirm({ open: false, id: '', name: '' })}
      />
    </AdminLayout>
  )
}

export default AdminAlgorithms
