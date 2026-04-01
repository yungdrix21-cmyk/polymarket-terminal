import { useState, useEffect } from 'react'
import { supabase } from './lib/supabase'
import Auth from './components/Auth'

const CRYPTO_MARKETS = [
  { id: '1', question: 'Bitcoin Up or Down - Next 5 Minutes', outcomePrices: ['0.53', '0.47'], change: '+1.2%', volume: 124000, timeframe: '5m', symbol: 'BTC' },
  { id: '2', question: 'Ethereum Up or Down - Next 15 Minutes', outcomePrices: ['0.49', '0.51'], change: '-0.8%', volume: 89000, timeframe: '15m', symbol: 'ETH' },
  { id: '3', question: 'Solana Up or Down - Next 5 Minutes', outcomePrices: ['0.58', '0.42'], change: '+3.4%', volume: 156000, timeframe: '5m', symbol: 'SOL' },
  { id: '4', question: 'Bitcoin Above $92,000 on April 2?', outcomePrices: ['0.61', '0.39'], change: '+2.1%', volume: 245000, timeframe: 'Daily', symbol: 'BTC' },
  { id: '5', question: 'ETH Up or Down - Next 30 Minutes', outcomePrices: ['0.46', '0.54'], change: '-1.5%', volume: 67000, timeframe: '30m', symbol: 'ETH' },
  { id: '6', question: 'Bitcoin Up or Down - Next 15 Minutes', outcomePrices: ['0.55', '0.45'], change: '+0.9%', volume: 98000, timeframe: '15m', symbol: 'BTC' },
  { id: '7', question: 'Will Solana Break $185 in Next Hour?', outcomePrices: ['0.44', '0.56'], change: '-2.3%', volume: 112000, timeframe: '1h', symbol: 'SOL' },
]

const PORTFOLIO = [
  { market: 'Will BTC hit $100k in 2025?', side: 'YES', shares: 150, avgPrice: 0.48, current: 0.55 },
  { market: 'Will ETH be above $2k?', side: 'NO', shares: 200, avgPrice: 0.55, current: 0.52 },
  { market: 'Will XRP be above $3?', side: 'YES', shares: 100, avgPrice: 0.38, current: 0.44 },
]

const RECENT_DEPOSITS = [
  { id: 1, crypto: 'USDT', amount: 1250.00, date: '2 hours ago', status: 'Completed' },
  { id: 2, crypto: 'BTC',  amount: 0.042,   date: 'Yesterday',   status: 'Completed' },
  { id: 3, crypto: 'ETH',  amount: 1.85,    date: '3 days ago',  status: 'Completed' },
  { id: 4, crypto: 'USDC', amount: 800.00,  date: '5 days ago',  status: 'Completed' },
]

const T = {
  bg0: '#0a0a1a', bg1: '#0f0f23', bg2: '#14142e', bg3: '#1a1a38', bgCard: '#111128',
  border: 'rgba(255,255,255,0.06)', borderHi: 'rgba(255,255,255,0.12)',
  blue: '#3b82f6', blueDim: 'rgba(59,130,246,0.15)',
  teal: '#14b8a6', tealDim: 'rgba(20,184,166,0.15)',
  red: '#f43f5e', redDim: 'rgba(244,63,94,0.15)',
  purple: '#a78bfa', purpleDim: 'rgba(167,139,250,0.12)',
  text0: '#f8fafc', text1: '#94a3b8', text2: '#475569',
  sans: '"Inter", -apple-system, BlinkMacSystemFont, sans-serif',
}

function DashboardPage({ user }) {
  return (
    <div style={{ padding: '20px', color: T.text0 }}>
      <h2>Welcome back 👋</h2>
      <p style={{ color: T.text2 }}>{user.email}</p>
      <p>Dashboard content goes here...</p>
    </div>
  )
}

function MarketsPage() {
  return <div style={{ padding: '20px', color: T.text0 }}>Markets Page</div>
}

function CopyTrading() {
  return <div style={{ padding: '20px', color: T.text0 }}>Copy Trade Page</div>
}

function DepositsPage() {
  return <div style={{ padding: '20px', color: T.text0 }}>Deposits Page</div>
}

export default function App() {
  const [user, setUser] = useState(null)
  const [view, setView] = useState('dashboard')
  const [showMenu, setShowMenu] = useState(false)

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setUser(data.session?.user ?? null))
  }, [])

  if (!user) return <Auth onLogin={setUser} />

  const NAV_ITEMS = [
    { id: 'dashboard', label: 'Dashboard', icon: '🏠' },
    { id: 'markets', label: 'Markets', icon: '📈' },
    { id: 'copy', label: 'Copy Trade', icon: '📋' },
    { id: 'deposits', label: 'Deposits', icon: '💰' },
  ]

  const renderPage = () => {
    if (view === 'dashboard') return <DashboardPage user={user} />
    if (view === 'markets') return <MarketsPage />
    if (view === 'copy') return <CopyTrading />
    if (view === 'deposits') return <DepositsPage />
    return null
  }

  return (
    <div style={{ display: 'flex', height: '100vh', background: T.bg0, color: T.text0, fontFamily: T.sans }}>

      {/* Sidebar */}
      <div style={{ width: 220, borderRight: `1px solid ${T.border}`, background: 'rgba(10,10,26,0.95)', display: 'flex', flexDirection: 'column', position: 'relative' }}>

        {/* PolyTrader Logo - Always Visible */}
        <div 
          onClick={() => setShowMenu(!showMenu)}
          style={{ padding: '20px 20px 16px', borderBottom: `1px solid ${T.border}`, cursor: 'pointer' }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 32, height: 32, borderRadius: 8, background: 'linear-gradient(135deg,#3b82f6,#8b5cf6)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, fontWeight: 700, color: '#fff' }}>P</div>
            <div>
              <div style={{ fontSize: 15, fontWeight: 700, color: T.text0 }}>PolyTrader</div>
              <div style={{ fontSize: 10, color: T.text2 }}>Prediction Markets</div>
            </div>
          </div>
        </div>

        {/* Dropdown Menu that pops out BELOW the logo */}
        {showMenu && (
          <div style={{ 
            position: 'absolute', 
            top: 78, 
            left: 12, 
            background: T.bgCard, 
            border: `1px solid ${T.border}`, 
            borderRadius: 12, 
            width: 196, 
            zIndex: 200,
            boxShadow: '0 10px 30px rgba(0,0,0,0.5)'
          }}>
            {NAV_ITEMS.map(item => (
              <div 
                key={item.id}
                onClick={() => {
                  setView(item.id)
                  setShowMenu(false)
                }}
                style={{ 
                  padding: '14px 20px', 
                  cursor: 'pointer', 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: 12,
                  color: view === item.id ? T.blue : T.text1,
                  background: view === item.id ? T.bg3 : 'transparent'
                }}
              >
                <span style={{ fontSize: 18 }}>{item.icon}</span>
                <span>{item.label}</span>
              </div>
            ))}
          </div>
        )}

        <div style={{ marginTop: 'auto', padding: 16, borderTop: `1px solid ${T.border}` }}>
          <button 
            onClick={async () => { await supabase.auth.signOut(); setUser(null) }} 
            style={{ width: '100%', padding: 8, background: 'transparent', border: `1px solid ${T.border}`, borderRadius: 8, color: T.text1 }}
          >
            Log out
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div style={{ flex: 1, overflow: 'auto' }}>
        {renderPage()}
      </div>
    </div>
  )
}