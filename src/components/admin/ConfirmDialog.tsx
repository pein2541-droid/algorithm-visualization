import React from 'react'
import { useThemeStore } from '../../store/useStore'

interface ConfirmDialogProps {
  isOpen: boolean
  title: string
  message: string
  onConfirm: () => void
  onCancel: () => void
}

const ConfirmDialog: React.FC<ConfirmDialogProps> = ({ isOpen, title, message, onConfirm, onCancel }) => {
  const { isDark } = useThemeStore()

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="fixed inset-0 bg-black/50" onClick={onCancel} />
      <div className={`relative rounded-xl p-6 shadow-xl max-w-md w-full mx-4 ${isDark ? 'bg-gray-800' : 'bg-white'}`}>
        <h3 className={`text-lg font-semibold mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>{title}</h3>
        <p className={`mb-6 ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>{message}</p>
        <div className="flex justify-end space-x-3">
          <button
            onClick={onCancel}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              isDark ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            取消
          </button>
          <button
            onClick={onConfirm}
            className="px-4 py-2 rounded-lg text-sm font-medium bg-red-600 text-white hover:bg-red-700 transition-colors"
          >
            确认
          </button>
        </div>
      </div>
    </div>
  )
}

export default ConfirmDialog
