import { useEffect, lazy, Suspense } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useAuthStore } from './stores/authStore'
import { useCompanyStore } from './stores/companyStore'
import { useUiStore } from './stores/uiStore'
import ErrorBoundary from './components/ErrorBoundary'
import MainLayout from './components/layout/MainLayout'

const LoginPage = lazy(() => import('./pages/LoginPage'))
const VerifyPage = lazy(() => import('./pages/VerifyPage'))
const TwoFactorPage = lazy(() => import('./pages/TwoFactorPage'))
const ProfileSetupPage = lazy(() => import('./pages/ProfileSetupPage'))
const SelectCompanyPage = lazy(() => import('./pages/SelectCompanyPage'))
const CompanySettingsPage = lazy(() => import('./pages/CompanySettingsPage'))
const ChatPage = lazy(() => import('./pages/ChatPage'))
const BotsPage = lazy(() => import('./pages/BotsPage'))
const IntegrationsPage = lazy(() => import('./pages/IntegrationsPage'))
const SettingsPage = lazy(() => import('./pages/SettingsPage'))
const EditProfilePage = lazy(() => import('./pages/EditProfilePage'))
const StoryPage = lazy(() => import('./pages/StoryPage'))
const SettingsAccountPage = lazy(() => import('./pages/SettingsAccountPage'))
const SettingsNotificationsPage = lazy(() => import('./pages/SettingsNotificationsPage'))
const SettingsChatAppearancePage = lazy(() => import('./pages/SettingsChatAppearancePage'))
const SettingsDataStoragePage = lazy(() => import('./pages/SettingsDataStoragePage'))
const SettingsDevicesPage = lazy(() => import('./pages/SettingsDevicesPage'))
const SettingsFoldersPage = lazy(() => import('./pages/SettingsFoldersPage'))
const UserProfilePage = lazy(() => import('./pages/UserProfilePage'))
const ContactsListPage = lazy(() => import('./pages/ContactsListPage'))
const NewContactPage = lazy(() => import('./pages/NewContactPage'))
const HolioProDashboard = lazy(() => import('./pages/HolioProDashboard'))
const HolioProPage = lazy(() => import('./pages/HolioProPage'))
const InviteFriendsPage = lazy(() => import('./pages/InviteFriendsPage'))
const SavedMessagesPage = lazy(() => import('./pages/SavedMessagesPage'))
const RecentCallsPage = lazy(() => import('./pages/RecentCallsPage'))
const BlockedContactsPage = lazy(() => import('./pages/BlockedContactsPage'))
const NearbyPeoplePage = lazy(() => import('./pages/NearbyPeoplePage'))
const BotAnalyticsPage = lazy(() => import('./pages/BotAnalyticsPage'))
const ChangePhonePage = lazy(() => import('./pages/ChangePhonePage'))
const ChangeUsernamePage = lazy(() => import('./pages/ChangeUsernamePage'))
const ScheduledMessagesPage = lazy(() => import('./pages/ScheduledMessagesPage'))
const ArchivedChatsPage = lazy(() => import('./pages/ArchivedChatsPage'))
const HelpAboutPage = lazy(() => import('./pages/HelpAboutPage'))
const AIPlaygroundPage = lazy(() => import('./pages/AIPlaygroundPage'))
const KnowledgeBasesPage = lazy(() => import('./pages/KnowledgeBasesPage'))
const GuardrailsPage = lazy(() => import('./pages/GuardrailsPage'))
const ImageGenerationPage = lazy(() => import('./pages/ImageGenerationPage'))
const AIUsageDashboardPage = lazy(() => import('./pages/AIUsageDashboardPage'))
const AgentBuilderPage = lazy(() => import('./pages/AgentBuilderPage'))

function PageLoader() {
  return (
    <div className="flex h-screen items-center justify-center bg-holio-offwhite">
      <div className="h-8 w-8 animate-spin rounded-full border-2 border-holio-orange border-t-transparent" />
    </div>
  )
}

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated)
  if (!isAuthenticated) return <Navigate to="/login" replace />
  return <>{children}</>
}

function AuthLayout() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated)
  const user = useAuthStore((s) => s.user)
  const fetchMe = useAuthStore((s) => s.fetchMe)
  const fetchCompanies = useCompanyStore((s) => s.fetchCompanies)
  const activeCompany = useCompanyStore((s) => s.activeCompany)
  const setActiveCompany = useCompanyStore((s) => s.setActiveCompany)

  useEffect(() => {
    if (isAuthenticated && !user) {
      fetchMe()
    }
  }, [isAuthenticated, user, fetchMe])

  useEffect(() => {
    if (isAuthenticated) {
      fetchCompanies().then((companies) => {
        if (!activeCompany && companies.length > 0) {
          setActiveCompany(companies[0])
        }
      })
    }
  }, [isAuthenticated, fetchCompanies, activeCompany, setActiveCompany])

  if (!isAuthenticated) return <Navigate to="/login" replace />
  return <MainLayout />
}

export default function App() {
  const darkMode = useUiStore((s) => s.darkMode)

  return (
    <ErrorBoundary>
    <div className={darkMode ? 'dark' : ''}>
    <BrowserRouter>
      <Suspense fallback={<PageLoader />}>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/verify" element={<VerifyPage />} />
        <Route path="/2fa" element={<TwoFactorPage />} />
        <Route path="/profile-setup" element={<ProtectedRoute><ProfileSetupPage /></ProtectedRoute>} />
        <Route path="/select-company" element={<ProtectedRoute><SelectCompanyPage /></ProtectedRoute>} />

        <Route element={<AuthLayout />}>
          <Route path="/chat" element={<ChatPage />} />
          <Route path="/company-settings" element={<CompanySettingsPage />} />
          <Route path="/bots" element={<BotsPage />} />
          <Route path="/bots/:botId/analytics" element={<BotAnalyticsPage />} />
          <Route path="/settings/account" element={<SettingsAccountPage />} />
          <Route path="/settings/notifications" element={<SettingsNotificationsPage />} />
          <Route path="/settings/chat-appearance" element={<SettingsChatAppearancePage />} />
          <Route path="/settings/data-storage" element={<SettingsDataStoragePage />} />
          <Route path="/settings/devices" element={<SettingsDevicesPage />} />
          <Route path="/settings/folders" element={<SettingsFoldersPage />} />
          <Route path="/settings" element={<SettingsPage />} />
          <Route path="/edit-profile" element={<EditProfilePage />} />
          <Route path="/profile/:userId" element={<UserProfilePage />} />
          <Route path="/contacts/new" element={<NewContactPage />} />
          <Route path="/contacts/blocked" element={<BlockedContactsPage />} />
          <Route path="/contacts" element={<ContactsListPage />} />
          <Route path="/integrations" element={<IntegrationsPage />} />
          <Route path="/invite-friends" element={<InviteFriendsPage />} />
          <Route path="/saved-messages" element={<SavedMessagesPage />} />
          <Route path="/calls" element={<RecentCallsPage />} />
          <Route path="/nearby" element={<NearbyPeoplePage />} />
          <Route path="/change-phone" element={<ChangePhonePage />} />
          <Route path="/change-username" element={<ChangeUsernamePage />} />
          <Route path="/scheduled-messages" element={<ScheduledMessagesPage />} />
          <Route path="/archived" element={<ArchivedChatsPage />} />
          <Route path="/story" element={<StoryPage />} />
          <Route path="/holio-pro/dashboard" element={<HolioProDashboard />} />
          <Route path="/holio-pro" element={<HolioProPage />} />
          <Route path="/help" element={<HelpAboutPage />} />
          <Route path="/ai/playground" element={<AIPlaygroundPage />} />
          <Route path="/ai/knowledge-bases" element={<KnowledgeBasesPage />} />
          <Route path="/ai/guardrails" element={<GuardrailsPage />} />
          <Route path="/ai/image-generation" element={<ImageGenerationPage />} />
          <Route path="/ai/usage" element={<AIUsageDashboardPage />} />
          <Route path="/ai/agents" element={<AgentBuilderPage />} />
        </Route>

        <Route path="*" element={<Navigate to="/chat" replace />} />
      </Routes>
      </Suspense>
    </BrowserRouter>
    </div>
    </ErrorBoundary>
  )
}
