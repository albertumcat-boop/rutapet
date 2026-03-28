import { useState } from 'react'
import BottomNav           from './components/shared/BottomNav'
import LoginScreen         from './components/screens/LoginScreen'
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

const NAV_SCREENS = ['dashboard','clients','map','analytics','more']

export default function App() {
  const [loggedIn, setLoggedIn] = useState(false)
  const [screen,   setScreen]   = useState('dashboard')
  const [data,     setData]     = useState(null)
  const [history,  setHistory]  = useState([])

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
    setLoggedIn(false)
    setScreen('dashboard')
    setHistory([])
    setData(null)
  }

  if (!loggedIn) return <LoginScreen onLogin={() => setLoggedIn(true)} />

  const renderScreen = () => {
    switch (screen) {
      case 'dashboard':    return <DashboardScreen    nav={nav} />
      case 'clients':      return <ClientsScreen      nav={nav} />
      case 'clientDetail': return <ClientDetailScreen cliente={data} onBack={goBack} nav={nav} />
      case 'addClient':    return <AddClientScreen    onBack={goBack} />
      case 'map':          return <MapScreen          nav={nav} />
      case 'addSale':      return <AddSaleScreen      onBack={goBack} initCId={data?.clienteId} />
      case 'products':     return <ProductsScreen />
      case 'payments':     return <PaymentsScreen />
      case 'analytics':    return <AnalyticsScreen />
      case 'routes':       return <RoutesScreen />
      case 'visits':       return <VisitsScreen nav={nav} />
      case 'more':         return <MoreScreen   nav={nav} onLogout={handleLogout} />
      case 'admin':        return <AdminScreen  onBack={goBack} />
      default:             return <DashboardScreen nav={nav} />
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
