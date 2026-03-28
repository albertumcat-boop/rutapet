import { useState, useEffect } from 'react'
import { auth } from '../firebase/firebase.config'
import { onAuthStateChanged } from 'firebase/auth'
import { useConfig } from './context/ConfigContext'
import BottomNav           from './components/shared/BottomNav'
import LandingScreen       from './components/screens/LandingScreen'
import LoginScreen         from './components/screens/LoginScreen'
import OnboardingScreen    from './components/screens/OnboardingScreen'
import DashboardScreen     from './components/screens/DashboardScreen'
import ClientsScreen       from './components/screens/ClientsScreen'
import ClientDetailScreen  from './components/screens/ClientDetailScreen'
import AddClientScreen     from './components/screens/AddClientScreen'
import MapScreen           from './components/screens/MapScreen'
import AddSaleScreen       from './components/screens/AddSaleScreen'
import ProductsScreen      from './components/screens/ProductsScreen'
import PaymentsScreen      from './components/screens/PaymentsScreen'
import AnalyticsScreen     from './components/screens/AnalyticsScreen'
import RoutesScreen        from './components/screens/RoutesScreen'
import VisitsScreen        from './components/screens/VisitsScreen'
import MoreScreen          from './components/screens/MoreScreen'
import AdminScreen         from './components/screens/AdminScreen'
import AboutScreen         from './components/screens/AboutScreen'
import { C } from './constants/colors'

const NAV_SCREENS = ['dashboard','clients','map','analytics','more']

export default function App() {
  const { config } = useConfig()
  const [loggedIn,     setLoggedIn]     = useState(false)
  const [checking,     setChecking]     = useState(true)
  const [showLanding,  setShowLanding]  = useState(false)
  const [screen,       setScreen]       = useState('dashboard')
  const [data,         setData]         = useState(null)
  const [history,      setHistory]      = useState([])

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (user) => {
      setLoggedIn(!!user)
      setChecking(false)
      // Si no está logueado → mostrar landing
      if (!user) setShowLanding(true)
    })
    return unsub
  }, [])

  const nav = (to, d = null) => {
    setHistory(h => [...h, { screen, data }])
    setScreen(to)
    setData(d)
    window.scrollTo(0, 0)
  }

  const goBack = () => {
    if (history.length > 0) {
      const prev = history[history.length - 1]
      setHistory(h => h.slice(0, -1))
      setScreen(prev.screen)
      setData(prev.data)
    } else {
      setScreen('dashboard')
      setData(null)
    }
    window.scrollTo(0, 0)
  }

  const tabChange = (s) => {
    setHistory([])
    setScreen(s)
    setData(null)
    window.scrollTo(0, 0)
  }

  const handleLogout = () => {
    auth.signOut()
    setLoggedIn(false)
    setShowLanding(true)
    setScreen('dashboard')
    setHistory([])
    setData(null)
  }

  // Pantalla de carga
  if (checking) return (
    <div style={{ minHeight: '100vh', background: C.navy, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{ width: 60, height: 60, borderRadius: 16, background: C.teal, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
          <Icon name="route" size={30} color="#fff" />
        </div>
        <p style={{ color: C.gray400, fontSize: 14 }}>Cargando...</p>
      </div>
    </div>
  )

  // Landing page — visitante no logueado
  if (!loggedIn && showLanding) {
    return <LandingScreen onEntrar={() => setShowLanding(false)} />
  }

  // Login / Registro
  if (!loggedIn) {
    return <LoginScreen onLogin={() => { setLoggedIn(true); setShowLanding(false) }} />
  }

  // Onboarding — primera vez
  if (!config.onboardingCompleto) return <OnboardingScreen />

  const renderScreen = () => {
    switch (screen) {
      case 'dashboard':    return <DashboardScreen    nav={nav} />
      case 'clients':      return <ClientsScreen      nav={nav} />
      case 'clientDetail': return <ClientDetailScreen cliente={data} onBack={goBack} nav={nav} />
      case 'addClient':    return <AddClientScreen    onBack={goBack} />
      case 'map':          return <MapScreen          nav={nav} onBack={goBack} />
      case 'addSale':      return <AddSaleScreen      onBack={goBack} initCId={data?.clienteId} />
      case 'products':     return <ProductsScreen     onBack={goBack} />
      case 'payments':     return <PaymentsScreen     onBack={goBack} />
      case 'analytics':    return <AnalyticsScreen    onBack={goBack} />
      case 'routes':       return <RoutesScreen       onBack={goBack} />
      case 'visits':       return <VisitsScreen       nav={nav} onBack={goBack} />
      case 'more':         return <MoreScreen         nav={nav} onLogout={handleLogout} />
      case 'admin':        return <AdminScreen        onBack={goBack} />
      case 'about':        return <AboutScreen        onBack={goBack} />
      default:             return <DashboardScreen    nav={nav} />
    }
  }

  return (
    <div style={{ maxWidth: 480, margin: '0 auto', position: 'relative' }}>
      {renderScreen()}
      {NAV_SCREENS.includes(screen) && (
        <BottomNav current={screen} onChange={tabChange} />
      )}
    </div>
  )
}
