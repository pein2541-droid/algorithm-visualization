import React, { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore, useThemeStore } from '../../store/useStore'
import AdminSidebar from './AdminSidebar'
import Header from '../Layout/Header'
import Footer from '../Layout/Footer'

interface AdminLayoutProps {
  children: React.ReactNode
}

const AdminLayout: React.FC<AdminLayoutProps> = ({ children }) => {
  const { isAuthenticated, user } = useAuthStore()
  const { isDark } = useThemeStore()
  const navigate = useNavigate()

  useEffect(() => {
    if (!isAuthenticated || user?.role_type !== 'admin') {
      navigate('/login')
    }
  }, [isAuthenticated, user, navigate])

  if (!isAuthenticated || user?.role_type !== 'admin') {
    return null
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <div className="flex flex-1">
        <AdminSidebar />
        <main className={`flex-1 ${isDark ? 'bg-gray-900' : 'bg-gray-50'} p-6`}>
          {children}
        </main>
      </div>
      <Footer />
    </div>
  )
}

export default AdminLayout
