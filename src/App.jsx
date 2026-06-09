/**
 * App.jsx — Router principal con layout responsive + nuevas pantallas VetRuta
 */
import { useState, useEffect } from 'react'
import { auth } from '../firebase/firebase.config'
import { onAuthStateChanged } from 'firebase/auth'
import { useConfig } from './context/ConfigContext'
import { useToast } from './context/ToastContext'
import Icon from './components/shared/Icon'
import BottomNav           from './components/shared/BottomNav'
import Sidebar             from './components/shared/Sidebar'
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
import ExpiryScreen        from './components/screens/ExpiryScreen'
import TeamScreen          from './components/screens/TeamScreen'
import CommissionsScreen   from './components/screens/CommissionsScreen'
import { C } from './constants/colors'

const NAV_SCREENS = ['dashboard', 'clients', 'map', 'analytics', 'more']

function useIsDesktop() {
  const [isDesktop, setIsDesktop] = useState(window.innerWidth >= 768)
  useEffect(() => {
    const handler = () => setIsDesktop(window.innerWidth >= 768)
    window.addEventListener('resize', handler)
    return () => window.removeEventListener('resize', handler)
  }, [])
  return isDesktop
}

const LoadingScreen = () => (
  <div style={{ minHeight: '100vh', background: C.navy, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
    <div style={{ textAlign: 'center' }}>
      <div style={{ width: 60, height: 60, borderRadius: 16, background: C.teal, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px', boxShadow: `0 8px 32px ${C.teal}55` }}>
        <Icon name="paw" size={30} color="#fff" />
      </div>
      <div style={{ width: 28, height: 28, border: `3px solid ${C.teal}`, borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.7s linear infinite', margin: '0 auto 12px' }} />
      <p style={{ color: C.gray400, fontSize: 13 }}>Cargando VetRuta...</p>
    </div>
  </div>
)

export default function App() {
  const { config, loading: configLoading } = useConfig()
  const toast    = useToast()
  const isDesktop = useIsDesktop()

  const [loggedIn,    setLoggedIn]    = useState(false)
  const [authChecked, setAuthChecked] = useState(false)
  const [showLanding, setShowLanding] = useState(false)
  const [screen,      setScreen]      = useState('dashboard')
  const [screenData,  setScreenData]  = useState(null)
  const [history,     setHistory]     = useState([])

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (user) => {
      setLoggedIn(!!user)
      setAuthChecked(true)
      if (!user) setShowLanding(true)
    })
    return unsub
  }, [])

  const nav = (to, data = null) => {
    setHistory(h => [...h, { screen, data: screenData }])
    setScreen(to)
    setScreenData(data)
    window.scrollTo(0, 0)
  }

  const goBack = () => {
    if (history.length > 0) {
      const prev = history[history.length - 1]
      setHistory(h => h.slice(0, -1))
      setScreen(prev.screen)
      setScreenData(prev.data)
    } else {
      setScreen('dashboard')
      setScreenData(null)
    }
    window.scrollTo(0, 0)
  }

  const tabChange = (tab) => {
    setHistory([])
    setScreen(tab)
    setScreenData(null)
    window.scrollTo(0, 0)
  }

  const handleLogout = async () => {
    try { await auth.signOut() } catch (err) { console.error(err) }
    toast.info('Sesión cerrada')
    setLoggedIn(false)
    setShowLanding(true)
    setScreen('dashboard')
    setHistory([])
    setScreenData(null)
  }

  if (!authChecked || configLoading) return <LoadingScreen />

  if (!loggedIn && showLanding) {
    return <LandingScreen onEntrar={() => setShowLanding(false)} />
  }

  if (!loggedIn) {
    return (
      <LoginScreen
        onLogin={() => { setLoggedIn(true); setShowLanding(false) }}
        onVolver={() => setShowLanding(true)}
      />
    )
  }

  if (!config.onboardingCompleto) {
    return <OnboardingScreen />
  }

  const renderScreen = () => {
    switch (screen) {
      case 'dashboard':    return <DashboardScreen    nav={nav} />
      case 'clients':      return <ClientsScreen      nav={nav} />
      case 'clientDetail': return <ClientDetailScreen cliente={screenData} onBack={goBack} nav={nav} />
      case 'addClient':    return <AddClientScreen    onBack={goBack} />
      case 'map':          return <MapScreen          nav={nav} onBack={goBack} />
      case 'addSale':      return <AddSaleScreen      onBack={goBack} initCId={screenData?.clienteId} />
      case 'products':     return <ProductsScreen     onBack={goBack} nav={nav} />
      case 'payments':     return <PaymentsScreen     onBack={goBack} />
      case 'analytics':    return <AnalyticsScreen    onBack={goBack} />
      case 'routes':       return <RoutesScreen       onBack={goBack} />
      case 'visits':       return <VisitsScreen       nav={nav} onBack={goBack} initClienteId={screenData?.clienteId} />
      case 'more':         return <MoreScreen         nav={nav} onLogout={handleLogout} />
      case 'admin':        return <AdminScreen        onBack={goBack} nav={nav} />
      case 'about':        return <AboutScreen        onBack={goBack} />
      case 'expiry':       return <ExpiryScreen       onBack={goBack} />
      case 'team':         return <TeamScreen         onBack={goBack} />
      case 'commissions':  return <CommissionsScreen  onBack={goBack} />
      default:             return <DashboardScreen    nav={nav} />
    }
  }

  // ── DESKTOP LAYOUT ──────────────────────────────────────────
  if (isDesktop) {
    return (
      <div style={{ display: 'flex', minHeight: '100vh', background: C.gray50 }}>
        <Sidebar current={screen} onChange={tabChange} onLogout={handleLogout} />

        <main style={{ flex: 1, minHeight: '100vh', overflowX: 'hidden', overflowY: 'auto', background: C.gray50 }}>
          {/* Topbar desktop */}
          <div style={{
            background: '#fff', borderBottom: `1px solid ${C.gray200}`,
            padding: '0 24px', height: 56, display: 'flex', alignItems: 'center',
            justifyContent: 'space-between', position: 'sticky', top: 0, zIndex: 10,
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              {history.length > 0 && (
                <button onClick={goBack}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4, color: C.gray400, fontFamily: 'inherit', fontSize: 13 }}>
                  <Icon name="back" size={16} color={C.gray400} />
                  Volver
                </button>
              )}
            </div>
            <button onClick={() => nav('addSale')}
              style={{ background: C.teal, border: 'none', borderRadius: 10, padding: '8px 16px', color: '#fff', fontSize: 13, fontWeight: 800, cursor: 'pointer', fontFamily: 'inherit', display: 'flex', alignItems: 'center', gap: 6 }}>
              <Icon name="plus" size={14} color="#fff" />
              Nueva venta
            </button>
          </div>

          <div style={{ maxWidth: 960, margin: '0 auto', padding: '0 24px 40px' }}>
            {renderScreen()}
          </div>
        </main>
      </div>
    )
  }

  // ── MOBILE LAYOUT ────────────────────────────────────────────
  return (
    <div style={{ maxWidth: 480, margin: '0 auto', position: 'relative', minHeight: '100vh' }}>
      {renderScreen()}
      {NAV_SCREENS.includes(screen) && (
        <BottomNav current={screen} onChange={tabChange} />
      )}
    </div>
  )
}
