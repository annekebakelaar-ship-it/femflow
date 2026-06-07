import { createContext, useContext, useReducer, useEffect } from 'react'

const AppContext = createContext()

const STORAGE_KEY = 'youcaps_state'

const initialState = {
  user: null,
  goal: null,
  profile: null,
  formula: null,
  onboardingId: null,
  lastCheckin: null,
  subscriptionStatus: null,
}

function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? { ...initialState, ...JSON.parse(raw) } : initialState
  } catch {
    return initialState
  }
}

function reducer(state, action) {
  switch (action.type) {
    case 'SET_USER':
      return { ...state, user: action.payload }
    case 'SET_GOAL':
      return { ...state, goal: action.payload }
    case 'SET_PROFILE':
      return { ...state, profile: action.payload }
    case 'SET_FORMULA':
      return { ...state, formula: action.payload }
    case 'SET_ONBOARDING_ID':
      return { ...state, onboardingId: action.payload }
    case 'SET_CHECKIN':
      return { ...state, lastCheckin: action.payload }
    case 'SET_SUBSCRIPTION':
      return { ...state, subscriptionStatus: action.payload }
    case 'LOGOUT':
      return initialState
    default:
      return state
  }
}

export function AppProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, null, loadState)

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
  }, [state])

  return (
    <AppContext.Provider value={{ state, dispatch }}>
      {children}
    </AppContext.Provider>
  )
}

export function useApp() {
  const ctx = useContext(AppContext)
  if (!ctx) throw new Error('useApp must be used within AppProvider')
  return ctx
}
