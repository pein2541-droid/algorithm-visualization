import React from "react"

const PageLoading: React.FC = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
      <div className="flex flex-col items-center gap-4">
        <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
        <p className="text-gray-500 dark:text-gray-400 text-sm">������...</p>
      </div>
    </div>
  )
}

export default PageLoading
