import { useState, useEffect } from 'react'
import { supabase } from './lib/supabase'
import Auth from './components/Auth'

const T = {
  bg0: '#0a0a1a', bg1: '#0f0f23', bg2: '#14142e', bg3: '#1a1a38', bgCard: '#111128',
  border: 'rgba(255,255,255,0.06)',
  blue: '#3b82f6', teal: '#14b8a6', red: '#f43f5e', text0: '#f8fafc', text1: '#94a3b8', text2: '#475569',
  sans: '"Inter", system-ui, sans-serif'
}

const CRYPTO_MARKETS = [
  { id: '1', question: 'Bitcoin Up or Down - Next 5 Minutes', outcomePrices: ['0.53', '0.47'] },
  { id: '2', question: 'Ethereum Up or Down - Next 15 Minutes', outcomePrices: ['0.49', '0.51'] },
  { id: '3', question: 'Solana Up or Down - Next 5 Minutes', outcomePrices: ['0.58', '0.42'] },
]

const PORTFOLIO = [
  { market: 'Will BTC hit $100k in 2025?', side: 'YES', shares: 150 },
]

const RECENT_DEPOSITS = [
  { crypto: 'USDT', amount: 1250, date: '2 hours ago' },
]

export default function App() {
  const [user, setUser] = useState(null)
  const [view, setView] = useState('dashboard')
  const [showMenu, setShowMenu] = useState(false)
  const [recentDeposits, setRecentDeposits] = useState(RECENT_DEPOSITS)
  const [selectedCrypto, setSelectedCrypto] = useState(null)
  const [amount, setAmount] = useState('')

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setUser(data.session?.user ?? null))
  }, [])

  if (!user) return <Auth onLogin={setUser} />

  const NAV_ITEMS = [
    { id: 'dashboard', label: 'Dashboard', icon: '🏠' },
    { id: 'markets', label: 'Markets', icon: '📈' },
    { id: 'copy', label: 'Copy Trading', icon: '📋' },
    { id: 'deposits', label: 'Deposits', icon: '💰' },
  ]

  const BOTTOM_ITEMS = [
    { id: 'profile', label: 'Profile', icon: '👤' },
    { id: 'settings', label: 'Settings', icon: '⚙️' },
    { id: 'withdraw', label: 'Withdraw', icon: '💸' },
  ]

  const handleDeposit = () => {
    if (!amount || !selectedCrypto) return
    const newDep = {
      crypto: selectedCrypto.symbol,
      amount: parseFloat(amount),
      date: 'Just now'
    }
    setRecentDeposits([newDep, ...recentDeposits])
    alert(`Deposit of ${amount} ${selectedCrypto.symbol} submitted`)
    setSelectedCrypto(null)
    setAmount('')
  }

  const renderPage = () => {
    if (view === 'dashboard') {
      return (
        <div style={{ padding: '20px', color: T.text0 }}>
          <h2>Welcome back 👋</h2>
          <p style={{ color: T.text2 }}>{user.email}</p>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 12, margin: '24px 0' }}>
            <div style={{ background: T.bgCard, padding: 16, borderRadius: 12 }}>
              <div style={{ color: T.text2 }}>Portfolio Value</div>
              <div style={{ fontSize: 24, fontWeight: 700, color: T.text0 }}>$230.50</div>
            </div>
            <div style={{ background: T.bgCard, padding: 16, borderRadius: 12 }}>
              <div style={{ color: T.text2 }}>Open Positions</div>
              <div style={{ fontSize: 24, fontWeight: 700, color: T.blue }}>3</div>
            </div>
          </div>

          <div style={{ background: T.bgCard, borderRadius: 12, padding: 16, marginBottom: 24 }}>
            <div style={{ fontWeight: 600, marginBottom: 12 }}>💸 Recent Deposits</div>
            {recentDeposits.map((d, i) => (
              <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderTop: i > 0 ? `1px solid ${T.border}` : 'none' }}>
                <div>{d.crypto} Deposit</div>
                <div style={{ color: T.teal }}>+${d.amount}</div>
              </div>
            ))}
          </div>
        </div>
      )
    }

    if (view === 'markets') return <div style={{ padding: '40px', color: T.text0, textAlign: 'center' }}>Markets Page</div>
    if (view === 'copy') return <div style={{ padding: '40px', color: T.text0, textAlign: 'center' }}>Copy Trading Page</div>
    if (view === 'deposits') {
      const cryptos = [
        { symbol: 'BTC', logo: 'https://cryptologos.cc/logos/bitcoin-btc-logo.png' },
        { symbol: 'ETH', logo: 'https://cryptologos.cc/logos/ethereum-eth-logo.png' },
        { symbol: 'USDT', logo: 'https://cryptologos.cc/logos/tether-usdt-logo.png' },
        { symbol: 'USDC', logo: 'https://cryptologos.cc/logos/usd-coin-usdc-logo.png' },
      ]

      return (
        <div style={{ padding: '20px', color: T.text0 }}>
          <h2>Deposit Funds</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 16, marginTop: 20 }}>
            {cryptos.map(c => (
              <div key={c.symbol} onClick={() => setSelectedCrypto(c)} style={{ background: T.bgCard, padding: 20, borderRadius: 16, textAlign: 'center', cursor: 'pointer' }}>
                <img src={c.logo} alt={c.symbol} style={{ width: 64, height: 64 }} onError={(e) => e.target.src = `https://via.placeholder.com/64?text=${c.symbol}`} />
                <div style={{ marginTop: 12, fontWeight: 600 }}>{c.symbol}</div>
              </div>
            ))}
          </div>

          {selectedCrypto && (
            <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.9)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <div style={{ background: T.bgCard, padding: 24, borderRadius: 20, width: '90%', maxWidth: 420 }}>
                <button onClick={() => setSelectedCrypto(null)} style={{ float: 'right', fontSize: 28, background: 'none', border: 'none' }}>✕</button>
                <h3>Deposit {selectedCrypto.symbol}</h3>
                <input 
                  type="number" 
                  placeholder="Amount" 
                  value={amount} 
                  onChange={e => setAmount(e.target.value)} 
                  style={{ width: '100%', padding: 14, margin: '16px 0', background: T.bg2, border: '1px solid #333', borderRadius: 12, color: 'white' }} 
                />
                <button onClick={handleDeposit} style={{ width: '100%', padding: 16, background: T.teal, color: 'white', border: 'none', borderRadius: 12, fontWeight: 600 }}>
                  Confirm Deposit
                </button>
              </div>
            </div>
          )}
        </div>
      )
    }

    return <div style={{ padding: '40px', color: T.text0 }}>Page not found</div>
  }

  return (
    <div style={{ display: 'flex', height: '100vh', background: T.bg0, color: T.text0, fontFamily: T.sans }}>

      {/* Sidebar */}
      <div style={{ width: showMenu ? 220 : 72, borderRight: `1px solid ${T.border}`, background: 'rgba(10,10,26,0.95)', transition: 'width 0.3s', position: 'relative' }}>

        <div onClick={() => setShowMenu(!showMenu)} style={{ padding: '20px 16px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 10, borderBottom: `1px solid ${T.border}` }}>
          <div style={{ width: 32, height: 32, borderRadius: 8, background: 'linear-gradient(135deg,#3b82f6,#8b5cf6)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 700 }}>P</div>
          {showMenu && <div><div style={{ fontWeight: 700 }}>PolyTrader</div><div style={{ fontSize: 11, color: T.text2 }}>Prediction Markets</div></div>}
        </div>

        {showMenu && (
          <div style={{ padding: '12px 10px' }}>
            {NAV_ITEMS.map(item => (
              <div key={item.id} onClick={() => { setView(item.id); setShowMenu(false); }} style={{ padding: '10px 12px', borderRadius: 10, marginBottom: 4, cursor: 'pointer', background: view === item.id ? T.bg3 : 'transparent' }}>
                <span style={{ marginRight: 10 }}>{item.icon}</span> {item.label}
              </div>
            ))}
          </div>
        )}

        {showMenu && (
          <div style={{ padding: '0 10px 10px' }}>
            {BOTTOM_ITEMS.map(item => (
              <div key={item.id} onClick={() => { setView(item.id); setShowMenu(false); }} style={{ padding: '10px 12px', borderRadius: 10, marginBottom: 4, cursor: 'pointer', color: T.text1 }}>
                <span style={{ marginRight: 10 }}>{item.icon}</span> {item.label}
              </div>
            ))}
          </div>
        )}

        <div style={{ padding: 16, borderTop: `1px solid ${T.border}` }}>
          <button onClick={async () => { await supabase.auth.signOut(); setUser(null) }} style={{ width: '100%', padding: 8, background: 'transparent', border: `1px solid ${T.border}`, borderRadius: 8, color: T.text1 }}>
            Log out
          </button>
        </div>
      </div>

      <div style={{ flex: 1, overflow: 'auto' }}>
        {renderPage()}
      </div>
    </div>
  )
}