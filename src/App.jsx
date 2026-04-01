import { useState, useEffect } from 'react'
import { supabase } from './lib/supabase'
import Auth from './components/Auth'

const CRYPTO_MARKETS = [ /* same markets as before */ 
  { id: '1', question: 'Bitcoin Up or Down - Next 5 Minutes', outcomePrices: ['0.53', '0.47'], change: '+1.2%', volume: 124000, timeframe: '5m', symbol: 'BTC' },
  { id: '2', question: 'Ethereum Up or Down - Next 15 Minutes', outcomePrices: ['0.49', '0.51'], change: '-0.8%', volume: 89000, timeframe: '15m', symbol: 'ETH' },
  { id: '3', question: 'Solana Up or Down - Next 5 Minutes', outcomePrices: ['0.58', '0.42'], change: '+3.4%', volume: 156000, timeframe: '5m', symbol: 'SOL' },
  { id: '4', question: 'Bitcoin Above $92,000 on April 2?', outcomePrices: ['0.61', '0.39'], change: '+2.1%', volume: 245000, timeframe: 'Daily', symbol: 'BTC' },
  { id: '5', question: 'ETH Up or Down - Next 30 Minutes', outcomePrices: ['0.46', '0.54'], change: '-1.5%', volume: 67000, timeframe: '30m', symbol: 'ETH' },
  { id: '6', question: 'Bitcoin Up or Down - Next 15 Minutes', outcomePrices: ['0.55', '0.45'], change: '+0.9%', volume: 98000, timeframe: '15m', symbol: 'BTC' },
  { id: '7', question: 'Will Solana Break $185 in Next Hour?', outcomePrices: ['0.44', '0.56'], change: '-2.3%', volume: 112000, timeframe: '1h', symbol: 'SOL' },
]

const PORTFOLIO = [ /* same portfolio */ 
  { market: 'Will BTC hit $100k in 2025?', side: 'YES', shares: 150, avgPrice: 0.48, current: 0.55 },
  { market: 'Will ETH be above $2k?', side: 'NO', shares: 200, avgPrice: 0.55, current: 0.52 },
  { market: 'Will XRP be above $3?', side: 'YES', shares: 100, avgPrice: 0.38, current: 0.44 },
]

const RECENT_DEPOSITS = [ /* same deposits */ 
  { id: 1, crypto: 'USDT', amount: 1250.00, date: '2 hours ago', status: 'Completed' },
  { id: 2, crypto: 'BTC',  amount: 0.042,   date: 'Yesterday',   status: 'Completed' },
  { id: 3, crypto: 'ETH',  amount: 1.85,    date: '3 days ago',  status: 'Completed' },
  { id: 4, crypto: 'USDC', amount: 800.00,  date: '5 days ago',  status: 'Completed' },
]

const T = { /* same theme */ 
  bg0: '#0a0a1a', bg1: '#0f0f23', bg2: '#14142e', bg3: '#1a1a38', bgCard: '#111128',
  border: 'rgba(255,255,255,0.06)', borderHi: 'rgba(255,255,255,0.12)',
  blue: '#3b82f6', blueDim: 'rgba(59,130,246,0.15)',
  teal: '#14b8a6', tealDim: 'rgba(20,184,166,0.15)',
  red: '#f43f5e', redDim: 'rgba(244,63,94,0.15)',
  purple: '#a78bfa', purpleDim: 'rgba(167,139,250,0.12)',
  text0: '#f8fafc', text1: '#94a3b8', text2: '#475569',
  sans: '"Inter", -apple-system, BlinkMacSystemFont, sans-serif',
}

// (All the helper functions Chart, DashboardPage, MarketsPage, DepositsPage, CopyTrading are the same as before - I kept them short here for space. 
// If you need the full file with all functions, say "give full" and I'll send everything.)

// Main App - PolyTrader logo always visible, click shows dropdown menu below it
export default function App() {
  const [user, setUser] = useState(null)
  const [view, setView] = useState('dashboard')
  const [selected, setSelected] = useState(null)
  const [prices, setPrices] = useState(CRYPTO_MARKETS)
  const [analysis, setAnalysis] = useState('')
  const [analyzing, setAnalyzing] = useState(false)
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768)
  const [showMenu, setShowMenu] = useState(false)   // dropdown menu

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setUser(data.session?.user ?? null))
  }, [])

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768)
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  // live price simulation
  useEffect(() => {
    const interval = setInterval(() => {
      setPrices(prev => prev.map(m => ({
        ...m,
        outcomePrices: [
          String(Math.min(0.99, Math.max(0.01, parseFloat(m.outcomePrices[0]) + (Math.random() - 0.5) * 0.01))),
          String(Math.min(0.99, Math.max(0.01, parseFloat(m.outcomePrices[1]) + (Math.random() - 0.5) * 0.01))),
        ]
      })))
    }, 3000)
    return () => clearInterval(interval)
  }, [])

  if (!user) return <Auth onLogin={setUser} />

  const NAV_ITEMS = [
    { id: 'dashboard', label: 'Dashboard', icon: '🏠' },
    { id: 'markets', label: 'Markets', icon: '📈' },
    { id: 'copy', label: 'Copy Trade', icon: '📋' },
    { id: 'deposits', label: 'Deposits', icon: '💰' },
  ]

  const renderPage = () => {
    if (view === 'dashboard') return <DashboardPage user={user} prices={prices} />
    if (view === 'markets') return <MarketsPage prices={prices} selected={selected} setSelected={setSelected} analysis={analysis} setAnalysis={setAnalysis} analyzeMarket={analyzeMarket} analyzing={analyzing} />
    if (view === 'copy') return <CopyTrading onClose={() => setView('dashboard')} />
    if (view === 'deposits') return <DepositsPage />
    return null
  }

  return (
    <div style={{ display: 'flex', height: '100vh', background: T.bg0, color: T.text0, fontFamily: T.sans }}>

      {/* Sidebar */}
      <div style={{ width: 220, borderRight: `1px solid ${T.border}`, background: 'rgba(10,10,26,0.95)', display: 'flex', flexDirection: 'column', flexShrink: 0 }}>

        {/* PolyTrader Logo - Always Visible */}
        <div 
          style={{ padding: '20px 20px 16px', borderBottom: `1px solid ${T.border}`, cursor: 'pointer', position: 'relative' }} 
          onClick={() => setShowMenu(!showMenu)}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 32, height: 32, borderRadius: 8, background: 'linear-gradient(135deg,#3b82f6,#8b5cf6)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, fontWeight: 700, color: '#fff' }}>P</div>
            <div>
              <div style={{ fontSize: 15, fontWeight: 700, color: T.text0 }}>PolyTrader</div>
              <div style={{ fontSize: 10, color: T.text2 }}>Prediction Markets</div>
            </div>
          </div>
        </div>

        {/* Dropdown Menu that pops out below logo when clicked */}
        {showMenu && (
          <div style={{ 
            position: 'absolute', 
            top: 78, 
            left: 12, 
            background: T.bgCard, 
            border: `1px solid ${T.border}`, 
            borderRadius: 12, 
            width: 196, 
            zIndex: 100, 
            boxShadow: '0 10px 30px rgba(0,0,0,0.4)' 
          }}>
            {NAV_ITEMS.map(item => (
              <div 
                key={item.id}
                onClick={() => {
                  setView(item.id)
                  setShowMenu(false)   // close menu after selecting
                }}
                style={{ 
                  padding: '14px 20px', 
                  cursor: 'pointer', 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: 12, 
                  color: view === item.id ? T.blue : T.text1,
                  background: view === item.id ? T.bg3 : 'transparent',
                  borderRadius: 8,
                  margin: '4px 6px'
                }}
              >
                <span style={{ fontSize: 18 }}>{item.icon}</span>
                <span style={{ fontSize: 14, fontWeight: 500 }}>{item.label}</span>
              </div>
            ))}
          </div>
        )}

        {/* Logout at bottom */}
        <div style={{ marginTop: 'auto', padding: '16px', borderTop: `1px solid ${T.border}` }}>
          <div style={{ fontSize: 11, color: T.text2, marginBottom: 8 }}>{user.email}</div>
          <button onClick={async () => { await supabase.auth.signOut(); setUser(null) }} 
            style={{ width: '100%', padding: '8px', background: 'transparent', border: `1px solid ${T.border}`, borderRadius: 8, color: T.text1, fontSize: 12, cursor: 'pointer' }}>
            Log out
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        <div style={{ flex: 1, overflow: 'auto', paddingBottom: isMobile ? 64 : 0 }}>
          {renderPage()}
        </div>

        {/* Mobile Bottom Nav */}
        {isMobile && (
          <div style={{ position: 'fixed', bottom: 0, left: 0, right: 0, height: 64, background: 'rgba(10,10,26,0.97)', borderTop: `1px solid ${T.border}`, display: 'flex', alignItems: 'center', justifyContent: 'space-around', zIndex: 100 }}>
            {NAV_ITEMS.map(item => (
              <div key={item.id} onClick={() => setView(item.id)} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3, cursor: 'pointer', flex: 1 }}>
                <span style={{ fontSize: 20 }}>{item.icon}</span>
                <span style={{ fontSize: 10, color: view === item.id ? T.blue : T.text2 }}>{item.label}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}