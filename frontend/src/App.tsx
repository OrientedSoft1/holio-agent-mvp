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
import EditProfilePage from './pages/EditProfilePage'
import SettingsAccountPage from './pages/SettingsAccountPage'
import SettingsNotificationsPage from './pages/SettingsNotificationsPage'
import SettingsChatAppearancePage from './pages/SettingsChatAppearancePage'
import SettingsDataStoragePage from './pages/SettingsDataStoragePage'
import SettingsDevicesPage from './pages/SettingsDevicesPage'
import SettingsFoldersPage from './pages/SettingsFoldersPage'
import ContactsListPage from './pages/ContactsListPage'
import NewContactPage from './pages/NewContactPage'
import BlockedContactsPage from './pages/BlockedContactsPage'
import UserProfilePage from './pages/UserProfilePage'
import SavedMessagesPage from './pages/SavedMessagesPage'
import RecentCallsPage from './pages/RecentCallsPage'
import StoryPage from './pages/StoryPage'
import IntegrationsPage from './pages/IntegrationsPage'
import InviteFriendsPage from './pages/InviteFriendsPage'
import NearbyPeoplePage from './pages/NearbyPeoplePage'
import HolioProPage from './pages/HolioProPage'
import HolioProDashboard from './pages/HolioProDashboard'

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
        <Route path="/settings/account" element={<ProtectedRoute><SettingsAccountPage /></ProtectedRoute>} />
        <Route path="/settings/notifications" element={<ProtectedRoute><SettingsNotificationsPage /></ProtectedRoute>} />
        <Route path="/settings/appearance" element={<ProtectedRoute><SettingsChatAppearancePage /></ProtectedRoute>} />
        <Route path="/settings/data-storage" element={<ProtectedRoute><SettingsDataStoragePage /></ProtectedRoute>} />
        <Route path="/settings/devices" element={<ProtectedRoute><SettingsDevicesPage /></ProtectedRoute>} />
        <Route path="/settings/folders" element={<ProtectedRoute><SettingsFoldersPage /></ProtectedRoute>} />
        <Route path="/edit-profile" element={<ProtectedRoute><EditProfilePage /></ProtectedRoute>} />
        <Route path="/profile/:userId" element={<ProtectedRoute><UserProfilePage /></ProtectedRoute>} />
        <Route path="/contacts/new" element={<ProtectedRoute><NewContactPage /></ProtectedRoute>} />
        <Route path="/contacts/blocked" element={<ProtectedRoute><BlockedContactsPage /></ProtectedRoute>} />
        <Route path="/contacts" element={<ProtectedRoute><ContactsListPage /></ProtectedRoute>} />
        <Route path="/saved-messages" element={<ProtectedRoute><SavedMessagesPage /></ProtectedRoute>} />
        <Route path="/calls" element={<ProtectedRoute><RecentCallsPage /></ProtectedRoute>} />
        <Route path="/stories" element={<ProtectedRoute><StoryPage /></ProtectedRoute>} />
        <Route path="/integrations" element={<ProtectedRoute><IntegrationsPage /></ProtectedRoute>} />
        <Route path="/invite-friends" element={<ProtectedRoute><InviteFriendsPage /></ProtectedRoute>} />
        <Route path="/nearby" element={<ProtectedRoute><NearbyPeoplePage /></ProtectedRoute>} />
        <Route path="/holio-pro/dashboard" element={<ProtectedRoute><HolioProDashboard /></ProtectedRoute>} />
        <Route path="/holio-pro" element={<ProtectedRoute><HolioProPage /></ProtectedRoute>} />
        <Route path="*" element={<Navigate to="/chat" replace />} />
      </Routes>
    </BrowserRouter>
  )
}
