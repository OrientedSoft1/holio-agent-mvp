import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useAuthStore } from './stores/authStore'
import LoginPage from './pages/LoginPage'
import VerifyPage from './pages/VerifyPage'
import TwoFactorPage from './pages/TwoFactorPage'
import ProfileSetupPage from './pages/ProfileSetupPage'
import SelectCompanyPage from './pages/SelectCompanyPage'
import CompanySettingsPage from './pages/CompanySettingsPage'
import ChatPage from './pages/ChatPage'
import BotsPage from './pages/BotsPage'
import SettingsPage from './pages/SettingsPage'
import HolioProPage from './pages/HolioProPage'
import HolioProDashboard from './pages/HolioProDashboard'
import StoryPage from './pages/StoryPage'
import IntegrationsPage from './pages/IntegrationsPage'

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated)
  if (!isAuthenticated) return <Navigate to="/login" replace />
  return <>{children}</>
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/verify" element={<VerifyPage />} />
        <Route path="/2fa" element={<TwoFactorPage />} />
        <Route path="/profile-setup" element={<ProtectedRoute><ProfileSetupPage /></ProtectedRoute>} />
        <Route path="/select-company" element={<ProtectedRoute><SelectCompanyPage /></ProtectedRoute>} />
        <Route path="/company-settings" element={<ProtectedRoute><CompanySettingsPage /></ProtectedRoute>} />
        <Route path="/chat" element={<ProtectedRoute><ChatPage /></ProtectedRoute>} />
        <Route path="/bots" element={<ProtectedRoute><BotsPage /></ProtectedRoute>} />
        <Route path="/settings" element={<ProtectedRoute><SettingsPage /></ProtectedRoute>} />
        <Route path="/holio-pro" element={<ProtectedRoute><HolioProPage /></ProtectedRoute>} />
        <Route path="/holio-pro/dashboard" element={<ProtectedRoute><HolioProDashboard /></ProtectedRoute>} />
        <Route path="/stories" element={<ProtectedRoute><StoryPage /></ProtectedRoute>} />
        <Route path="/integrations" element={<ProtectedRoute><IntegrationsPage /></ProtectedRoute>} />
        <Route path="*" element={<Navigate to="/chat" replace />} />
      </Routes>
    </BrowserRouter>
  )
}