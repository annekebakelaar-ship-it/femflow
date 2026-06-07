import { useState, useEffect } from 'react'
import { BrowserRouter, Routes, Route, useNavigate, useLocation } from 'react-router-dom'
import Footer from './components/Footer'
import Welcome from './pages/Welcome'
import SmartQuiz from './pages/SmartQuiz'
import QuizResults from './pages/QuizResults'
import SigninPage from './pages/auth/SigninPage'
import Landing from './pages/wab/Landing'
import MenstruationTracker from './pages/health/MenstruationTracker'
import PerimenopauzeTracker from './pages/health/PerimenopauzeTracker'
import CycleAnalytics from './pages/health/CycleAnalytics'
import WearableCycle from './pages/health/WearableCycle'
import Results from './pages/wab/Results'
import DashboardHome from './pages/wab/DashboardHome'
import QuizResultsPage from './pages/wab/QuizResultsPage'
import LearningHub from './pages/wab/LearningHub'
import ProgressAnalytics from './pages/wab/ProgressAnalytics'
import Dashboard from './pages/wab/Dashboard'
import Profile from './pages/account/Profile'
import PrivacyPolicy from './pages/legal/PrivacyPolicy'
import TermsOfService from './pages/legal/TermsOfService'
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

      // Magic link callback
      if (path === '/auth/verify') {
        const url = new URL(window.location.href)
        const token = url.searchParams.get('token')
        if (token) {
          try { await verifyMagicLink(token) } catch {}
          window.history.replaceState({}, '', '/')
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

  if (authLoading) return null

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

      {/* Account (protected) */}
      <Route path="/account" element={
        user ? (
          <Profile
            user={user}
            onBack={() => navigate('/dashboard')}
            onLogout={handleLogout}
          />
        ) : (
          <div>Please log in</div>
        )
      } />

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
      <Route path="/health/menstruation" element={user ? <MenstruationTracker /> : <div>Please log in</div>} />
      <Route path="/health/perimenopause" element={user ? <PerimenopauzeTracker /> : <div>Please log in</div>} />
      <Route path="/health/cycle-analytics" element={user ? <CycleAnalytics /> : <div>Please log in</div>} />
      <Route path="/health/wearable-cycle" element={user ? <WearableCycle /> : <div>Please log in</div>} />
      <Route path="/health/symptoms" element={user ? <SymptomLoggerPage /> : <div>Please log in</div>} />
      <Route path="/health/lifestyle-check" element={user ? <LifestyleCheckPage /> : <div>Please log in</div>} />

      {/* Learning Hub */}
      <Route path="/dashboard/learning" element={user ? <LearningHub /> : <div>Please log in</div>} />

      {/* Progress/Analytics */}
      <Route path="/dashboard/progress" element={user ? <ProgressAnalytics /> : <div>Please log in</div>} />

      {/* Wearable Dashboard */}
      <Route path="/dashboard/wearable" element={user ? <WearableDashboard /> : <div>Please log in</div>} />

      {/* Supplements */}
      <Route path="/dashboard/supplements" element={user ? <SupplementsPage /> : <div>Please log in</div>} />

      {/* Legal Pages */}
      <Route path="/privacy" element={<PrivacyPolicy />} />
      <Route path="/terms" element={<TermsOfService />} />
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
    </Routes>
    {user && (location.pathname.startsWith('/dashboard') || location.pathname.startsWith('/health')) && <Footer />}
    </div>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <AppContent />
    </BrowserRouter>
  )
}
