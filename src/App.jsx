import { useState, useEffect } from 'react'
import { BrowserRouter, Routes, Route, useNavigate, useLocation, Navigate } from 'react-router-dom'
import { GoogleOAuthProvider } from '@react-oauth/google'
import './utils/devSetup'
import ErrorBoundary from './components/ErrorBoundary'
import Footer from './components/Footer'
import FeedbackWidget from './components/FeedbackWidget'
import Welcome from './pages/Welcome'
import SmartQuiz from './pages/SmartQuiz'
import QuizResults from './pages/QuizResults'
import Unsubscribe from './pages/Unsubscribe'
import SigninPage from './pages/auth/SigninPage'
import Landing from './pages/wab/Landing'
import MenstruationTracker from './pages/health/MenstruationTracker'
import MenstruationHistory from './pages/health/MenstruationHistory'
import PerimenopauzeTracker from './pages/health/PerimenopauzeTracker'
import CycleAnalytics from './pages/health/CycleAnalytics'
import WearableCycle from './pages/health/WearableCycle'
import Results from './pages/wab/Results'
import DashboardHome from './pages/wab/DashboardHome'
import QuizResultsPage from './pages/wab/QuizResultsPage'
import LearningHub from './pages/wab/LearningHub'
import ProgressAnalytics from './pages/wab/ProgressAnalytics'
import Dashboard from './pages/wab/Dashboard'
import AccountPage from './pages/account/AccountPage'
import PrivacyPolicy from './pages/legal/PrivacyPolicy'
import TermsOfService from './pages/legal/TermsOfService'
import Support from './pages/legal/Support'
import ConsentManagement from './pages/account/ConsentManagement'
import FemLanding from './pages/fem/FemLanding'
import FemQuizFunnel from './pages/fem/FemQuizFunnel'
import SymptomLoggerPage from './pages/wab/SymptomLoggerPage'
import LifestyleCheckPage from './pages/wab/LifestyleCheckPage'
import WearableDashboard from './pages/wab/WearableDashboard'
import SupplementsPage from './pages/wab/SupplementsPage'
import { getToken, clearToken, verifyMagicLink, getMe } from './api/client'

const STORAGE_KEY = 'wab_last_result'

function loadStored() {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY)) } catch { return null }
}

function AppContent() {
  const [result, setResult]         = useState(null)
  const [lastResult, setLastResult] = useState(loadStored)
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
            window.history.replaceState({}, '', '/login')
            navigate('/login')
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

      // Restore session
      if (getToken()) {
        try {
          const me = await getMe()
          setUser(me)
        } catch {
          clearToken()
        }
      }

      setAuthLoading(false)
    }
    init()
  }, [location, navigate])


  function handleResult(r) {
    setResult(r)
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(r)) } catch {}
    setLastResult(r)
    navigate('/results', { state: { result: r } })
  }

  function handleLogout() {
    clearToken()
    setUser(null)
    navigate('/')
  }

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
      background: location.pathname === '/' || location.pathname === '/fem-landing' || location.pathname.startsWith('/fem-') ? 'transparent' : '#F5EFEB',
      minHeight: '100vh',
    }}>
    <Routes>
      {/* New quiz funnel */}
      <Route path="/" element={<Welcome />} />
      <Route path="/quiz" element={<SmartQuiz />} />
      <Route path="/quiz/results" element={<QuizResults />} />
      <Route path="/unsubscribe" element={<Unsubscribe />} />

      {/* Authentication (magic link) */}
      <Route path="/login" element={<SigninPage />} />
      <Route path="/signup" element={<SigninPage />} />

      {/* Dashboard home (protected) */}
      <Route path="/dashboard" element={
        user ? <DashboardHome /> : <div>Please log in</div>
      } />

      {/* Quiz Results Page */}
      <Route path="/quiz-results" element={<QuizResultsPage />} />

      {/* Dashboard tracker (protected) */}
      <Route path="/dashboard/tracker" element={
        user ? (
          <Dashboard
            user={user}
            onBack={() => navigate('/dashboard')}
            onLogout={handleLogout}
            onAccount={() => navigate('/account')}
          />
        ) : (
          <div>Please log in</div>
        )
      } />

      {/* Dashboard analytics (protected) */}
      <Route path="/dashboard/analytics" element={
        user ? (
          <Dashboard
            user={user}
            onBack={() => navigate('/dashboard')}
            onLogout={handleLogout}
            onAccount={() => navigate('/account')}
          />
        ) : (
          <div>Please log in</div>
        )
      } />

      {/* Account */}
      <Route path="/account" element={<AccountPage />} />

      {/* WAB results */}
      <Route path="/results" element={
        result ? (
          <Results
            result={result}
            onReset={() => { setResult(null); navigate('/') }}
          />
        ) : (
          <div>No result</div>
        )
      } />

      {/* Health tracking */}
      <Route path="/health/menstruation" element={<MenstruationTracker />} />
      <Route path="/health/menstruation/history" element={<MenstruationHistory />} />
      <Route path="/health/perimenopause" element={user ? <PerimenopauzeTracker /> : <Navigate to="/login" />} />
      <Route path="/health/cycle-analytics" element={user ? <CycleAnalytics /> : <Navigate to="/login" />} />
      <Route path="/health/wearable-cycle" element={user ? <WearableCycle /> : <Navigate to="/login" />} />
      <Route path="/health/symptoms" element={user ? <SymptomLoggerPage /> : <Navigate to="/login" />} />
      <Route path="/health/lifestyle-check" element={user ? <LifestyleCheckPage /> : <Navigate to="/login" />} />

      {/* Learning Hub - accessible to all */}
      <Route path="/dashboard/learning" element={<LearningHub />} />

      {/* Progress/Analytics */}
      <Route path="/dashboard/progress" element={user ? <ProgressAnalytics /> : <div>Please log in</div>} />

      {/* Wearable Dashboard */}
      <Route path="/dashboard/wearable" element={user ? <WearableDashboard /> : <div>Please log in</div>} />

      {/* Supplements */}
      <Route path="/dashboard/supplements" element={user ? <SupplementsPage /> : <div>Please log in</div>} />

      {/* Legal Pages */}
      <Route path="/privacy" element={<PrivacyPolicy />} />
      <Route path="/legal/privacy" element={<PrivacyPolicy />} />
      <Route path="/terms" element={<TermsOfService />} />
      <Route path="/legal/terms" element={<TermsOfService />} />
      <Route path="/support" element={<Support />} />
      <Route path="/consent" element={user ? <ConsentManagement /> : <div>Please log in</div>} />

      {/* FEM (old funnel) */}
      <Route path="/fem-landing" element={<FemLanding onStartQuiz={() => navigate('/fem-quiz')} user={user} />} />
      <Route path="/fem-quiz" element={<FemQuizFunnel onComplete={() => navigate('/')} user={user} />} />

      {/* Default landing */}
      <Route path="/" element={
        <Landing
          onResult={handleResult}
          lastResult={lastResult}
          onViewLast={() => { setResult(lastResult); navigate('/results') }}
          user={user}
          onLogin={setUser}
          onShowDashboard={() => navigate('/dashboard')}
          onShowFem={() => navigate('/fem-landing')}
        />
      } />

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
    {user && (location.pathname.startsWith('/dashboard') || location.pathname.startsWith('/health')) && <Footer />}
    {location.pathname !== '/' && <FeedbackWidget />}
    </div>
  )
}

export default function App() {
  // Google OAuth Client ID - set via environment variable when credentials are ready
  const googleClientId = process.env.REACT_APP_GOOGLE_CLIENT_ID || 'YOUR_GOOGLE_CLIENT_ID_HERE'

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
