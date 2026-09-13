import { useState, useEffect } from 'react'
import { BrowserRouter, Routes, Route, useNavigate, useLocation, Navigate } from 'react-router-dom'
import { GoogleOAuthProvider } from '@react-oauth/google'
import './utils/devSetup'
import ErrorBoundary from './components/ErrorBoundary'
import NavV2 from './components/NavV2'
import { Capacitor } from '@capacitor/core'
import { App as CapApp } from '@capacitor/app'
import { Browser } from '@capacitor/browser'
import FeedbackWidget from './components/FeedbackWidget'
import AnalyticsConsentBanner from './components/AnalyticsConsentBanner'
import Welcome from './pages/Welcome'
import SmartQuiz from './pages/SmartQuiz'
import QuizResults from './pages/QuizResults'
import Unsubscribe from './pages/Unsubscribe'
import WearablePage from './pages/wearable/WearablePage'
import HRVInsightsPage from './pages/wearable/HRVInsightsPage'
import SigninPage from './pages/auth/SigninPage'
import MenstruationTracker from './pages/health/MenstruationTracker'
import MenstruationHistory from './pages/health/MenstruationHistory'
import PerimenopauzeTracker from './pages/health/PerimenopauzeTracker'
import CycleAnalytics from './pages/health/CycleAnalytics'
import WearableCycle from './pages/health/WearableCycle'
import DashboardV2Preview from './pages/dashboard/DashboardV2Preview'
import LifestyleHub from './pages/dashboard/LifestyleHub'
import QuizResultsPage from './pages/dashboard/QuizResultsPage'
import LearningHub from './pages/dashboard/LearningHub'
import ProgressAnalytics from './pages/dashboard/ProgressAnalytics'
import AccountPage from './pages/account/AccountPage'
import PrivacyPolicy from './pages/legal/PrivacyPolicy'
import TermsOfService from './pages/legal/TermsOfService'
import Support from './pages/legal/Support'
import AccountDeletion from './pages/legal/AccountDeletion'
import ConsentManagement from './pages/account/ConsentManagement'
import SymptomLoggerPage from './pages/dashboard/SymptomLoggerPage'
import LifestyleCheckPage from './pages/dashboard/LifestyleCheckPage'
import WearableDashboard from './pages/dashboard/WearableDashboard'
import SupplementsPage from './pages/dashboard/SupplementsPage'
import MenuPage from './pages/MenuPage'
import { getToken, clearToken, verifyMagicLink, getMe } from './api/client'

// Vaste navigatie op de ingelogde subpagina's; de home en de Leefstijl-hub
// hebben de balk zelf in hun layout
function toonVasteNav(pad) {
  if (pad === '/dashboard' || pad === '/dashboard/leefstijl' || pad === '/preview-v2') return false
  return pad.startsWith('/dashboard') || pad.startsWith('/health') || pad.startsWith('/wearable') || ['/menu', '/account', '/consent'].includes(pad)
}

function AppContent() {
  const [user, setUser]             = useState(null)
  const [authLoading, setAuthLoading] = useState(true)
  const navigate = useNavigate()
  const location = useLocation()

  useEffect(() => {
    async function init() {
      const path = location.pathname

      // OTP code verification callback (if accessed via direct link)
      if (path === '/auth/verify') {
        const url = new URL(window.location.href)
        const code = url.searchParams.get('code')
        const email = url.searchParams.get('email')
        if (code && email) {
          try {
            await verifyMagicLink(code, email)
            // Fetch user info after verification
            const me = await getMe()
            setUser(me)
            // Redirect to dashboard or menstruation setup
            const menstruationData = localStorage.getItem('menstruation_data')
            setTimeout(() => {
              window.history.replaceState({}, '', menstruationData ? '/dashboard' : '/health/menstruation')
              navigate(menstruationData ? '/dashboard' : '/health/menstruation')
            }, 500)
          } catch (err) {
            console.error('OTP verification failed:', err)
            // Eenmalige code al gebruikt (tab-restore, link 2x geopend) maar
            // sessie nog geldig? Dan niet onterecht naar login sturen.
            const doel = getToken() ? '/dashboard' : '/login'
            window.history.replaceState({}, '', doel)
            navigate(doel)
          }
        } else {
          window.history.replaceState({}, '', '/login')
        }
      }

      // Post-Oura OAuth redirect
      if (location.search.includes('oura_connected=1')) {
        window.history.replaceState({}, '', '/')
        navigate('/dashboard')
      }

      // Restore session. BELANGRIJK: alleen uitloggen als de server de sessie
      // expliciet afwijst (401/403). Bij netwerkfouten of een slapende
      // Render-server (gratis tier, cold start van 30-60s) is de sessie
      // gewoon geldig — dan optimistisch doorlaten en op de achtergrond
      // alsnog hydrateren. Anders "logt de app uit" na elke stille periode.
      if (getToken()) {
        try {
          const me = await getMe()
          setUser(me)
        } catch (err) {
          if (err && (err.status === 401 || err.status === 403)) {
            clearToken()
          } else {
            setUser({ offline: true })
            // Server wordt waarschijnlijk net wakker: nog een keer proberen
            setTimeout(() => { getMe().then(setUser).catch(() => {}) }, 8000)
          }
        }
      }

      setAuthLoading(false)
    }
    init()
  }, [location, navigate])


  // Native: terugkeer uit de Oura- of Fitbit-koppeling via app.youcaps.ovari://wearable?...
  useEffect(() => {
    if (!Capacitor.isNativePlatform()) return undefined
    let luisteraar
    CapApp.addListener('appUrlOpen', ({ url }) => {
      try {
        const link = new URL(url)
        if (link.host === 'wearable') {
          Browser.close().catch(() => {})
          navigate('/wearable' + link.search)
        }
      } catch {
        // onbekende of ongeldige link negeren
      }
    }).then(h => { luisteraar = h })
    return () => { if (luisteraar) luisteraar.remove() }
  }, [navigate])

  if (authLoading) return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '100vh',
      background: '#F5EFEB',
      fontFamily: 'system-ui, sans-serif',
    }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{ fontSize: '12px', color: '#888' }}>Loading...</div>
      </div>
    </div>
  )

  return (
    <div style={{
      background: (location.pathname === '/' || location.pathname === '/preview-v2' || location.pathname === '/dashboard') ? 'transparent' : '#F5EFEB',
      minHeight: '100vh',
    }}>
    <Routes>
      {/* Homepreview met voorbeelddata (/preview-v2?demo), alleen in lokale ontwikkeling */}
      {import.meta.env.DEV && <Route path="/preview-v2" element={<DashboardV2Preview />} />}
      {/* Ingelogd (sessie en token) direct naar de home; de native app start altijd op / */}
      <Route path="/" element={user && getToken() ? <Navigate to="/dashboard" replace /> : <Welcome />} />
      <Route path="/quiz" element={<SmartQuiz />} />
      <Route path="/quiz/results" element={<QuizResults />} />
      <Route path="/unsubscribe" element={<Unsubscribe />} />

      {/* Authentication (magic link) */}
      <Route path="/login" element={user && getToken() ? <Navigate to="/dashboard" replace /> : <SigninPage />} />
      <Route path="/signup" element={user && getToken() ? <Navigate to="/dashboard" replace /> : <SigninPage />} />

      {/* Dashboard home (protected) — v2: rustige home (akkoord Danib 4 jul) */}
      <Route path="/dashboard" element={
        user ? <DashboardV2Preview /> : <Navigate to="/login" replace />
      } />
      {/* Leefstijl-hub: fase- en herstel-gekoppelde activiteiten (v2, vierde tab) */}
      <Route path="/dashboard/leefstijl" element={
        user ? <LifestyleHub /> : <Navigate to="/login" replace />
      } />

      {/* Quiz Results Page */}
      <Route path="/quiz-results" element={<QuizResultsPage />} />

      {/* Account */}
      <Route path="/account" element={<AccountPage />} />

      {/* Menu */}
      <Route path="/menu" element={<MenuPage />} />

      {/* Health tracking */}
      <Route path="/health/menstruation" element={<MenstruationTracker />} />
      <Route path="/health/menstruation/history" element={<MenstruationHistory />} />
      <Route path="/wearable" element={<WearablePage />} />
      <Route path="/wearable/hrv-insights" element={user ? <HRVInsightsPage /> : <Navigate to="/login" />} />
      <Route path="/health/perimenopause" element={user ? <PerimenopauzeTracker /> : <Navigate to="/login" />} />
      <Route path="/health/cycle-analytics" element={user ? <CycleAnalytics /> : <Navigate to="/login" />} />
      <Route path="/health/wearable-cycle" element={user ? <WearableCycle /> : <Navigate to="/login" />} />
      <Route path="/health/symptoms" element={user ? <SymptomLoggerPage /> : <Navigate to="/login" />} />
      <Route path="/health/lifestyle-check" element={user ? <LifestyleCheckPage /> : <Navigate to="/login" />} />

      {/* Learning Hub - accessible to all */}
      <Route path="/dashboard/learning" element={<LearningHub />} />

      {/* Progress/Analytics */}
      <Route path="/dashboard/progress" element={user ? <ProgressAnalytics /> : <Navigate to="/login" replace />} />

      {/* Wearable Dashboard */}
      <Route path="/dashboard/wearable" element={user ? <WearableDashboard /> : <Navigate to="/login" replace />} />

      {/* Supplements */}
      <Route path="/dashboard/supplements" element={user ? <SupplementsPage /> : <Navigate to="/login" replace />} />

      {/* Legal Pages */}
      <Route path="/privacy" element={<PrivacyPolicy />} />
      <Route path="/legal/privacy" element={<PrivacyPolicy />} />
      <Route path="/terms" element={<TermsOfService />} />
      <Route path="/legal/terms" element={<TermsOfService />} />
      <Route path="/support" element={<Support />} />
      <Route path="/account-deletion" element={<AccountDeletion />} />
      <Route path="/legal/account-deletion" element={<AccountDeletion />} />
      <Route path="/consent" element={user ? <ConsentManagement /> : <Navigate to="/login" replace />} />

      {/* 404 fallback */}
      <Route path="*" element={
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '100vh',
          padding: '20px',
          background: 'var(--bg)',
          fontFamily: 'var(--font-sans)',
        }}>
          <h1 style={{ color: 'var(--ink)', marginBottom: '16px' }}>404 - Pagina niet gevonden</h1>
          <p style={{ color: 'var(--ink-2)', marginBottom: '24px' }}>
            Deze pagina bestaat niet of is verplaatst.
          </p>
          <button
            onClick={() => navigate('/')}
            style={{
              padding: '12px 24px',
              background: 'var(--accent)',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              fontWeight: '600',
            }}
          >
            Terug naar home
          </button>
        </div>
      } />
    </Routes>
    {user && toonVasteNav(location.pathname) && <NavV2 vast />}
    {location.pathname !== '/' && location.pathname !== '/preview-v2' && location.pathname !== '/dashboard' && location.pathname !== '/dashboard/leefstijl' && <FeedbackWidget />}
    <AnalyticsConsentBanner />
    </div>
  )
}

export default function App() {
  // Google OAuth Client ID - set via VITE_GOOGLE_CLIENT_ID (Vite leest alleen VITE_*)
  const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID || 'YOUR_GOOGLE_CLIENT_ID_HERE'

  return (
    <ErrorBoundary>
      <GoogleOAuthProvider clientId={googleClientId}>
        <BrowserRouter>
          <AppContent />
        </BrowserRouter>
      </GoogleOAuthProvider>
    </ErrorBoundary>
  )
}
