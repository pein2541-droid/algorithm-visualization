import React, { Suspense, lazy } from "react"
import { BrowserRouter as Router, Routes, Route } from "react-router-dom"
import { useThemeStore } from "./store/useStore"
import PageLoading from "./components/PageLoading"

const Home = lazy(() => import("./pages/Home"))
const Algorithms = lazy(() => import("./pages/Algorithms"))
const AlgorithmDetail = lazy(() => import("./pages/AlgorithmDetail"))
const Learning = lazy(() => import("./pages/Learning"))
const Profile = lazy(() => import("./pages/Profile"))
const Login = lazy(() => import("./pages/Login"))
const Register = lazy(() => import("./pages/Register"))
const AdminDashboard = lazy(() => import("./pages/admin/AdminDashboard"))
const AdminUsers = lazy(() => import("./pages/admin/AdminUsers"))
const AdminAlgorithms = lazy(() => import("./pages/admin/AdminAlgorithms"))
const AdminContent = lazy(() => import("./pages/admin/AdminContent"))

function App() {
  const { isDark } = useThemeStore()

  return (
    <div className={isDark ? "dark" : ""}>
      <Router>
        <Suspense fallback={<PageLoading />}>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/algorithms" element={<Algorithms />} />
            <Route path="/algorithms/:type/:name" element={<AlgorithmDetail />} />
            <Route path="/learning" element={<Learning />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/admin" element={<AdminDashboard />} />
            <Route path="/admin/users" element={<AdminUsers />} />
            <Route path="/admin/algorithms" element={<AdminAlgorithms />} />
            <Route path="/admin/content" element={<AdminContent />} />
          </Routes>
        </Suspense>
      </Router>
    </div>
  )
}

export default App
