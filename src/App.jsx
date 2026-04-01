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

function DashboardPage({ user, recentDeposits }) {
  const totalPnL = PORTFOLIO.reduce((sum, p) => sum + (p.current - p.avgPrice) * p.shares, 0)
  const totalValue = PORTFOLIO.reduce((sum, p) => sum + p.current * p.shares, 0)

  return (
    <div style={{ padding: '20px', overflowY: 'auto', flex: 1 }}>
      <h2 style={{ color: T.text0, margin: '0 0 4px', fontSize: 18 }}>Welcome back 👋</h2>
      <p style={{ color: T.text2, marginBottom: 20, fontSize: 13 }}>{user.email}</p>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: 12, marginBottom: 24 }}>
        {[
          { label: 'Portfolio Value', value: `$${totalValue.toFixed(2)}`, color: T.text0 },
          { label: 'Total P&L', value: `+$${totalPnL.toFixed(2)}`, color: T.teal },
          { label: 'Open Positions', value: PORTFOLIO.length, color: T.blue },
          { label: 'Live Markets', value: CRYPTO_MARKETS.length, color: T.teal },
        ].map((s, i) => (
          <div key={i} style={{ background: T.bgCard, borderRadius: 12, padding: '14px 16px', border: `1px solid ${T.border}` }}>
            <div style={{ color: T.text2, fontSize: 11 }}>{s.label}</div>
            <div style={{ color: s.color, fontSize: 20, fontWeight: 700, marginTop: 4 }}>{s.value}</div>
          </div>
        ))}
      </div>

      <div style={{ background: T.bgCard, borderRadius: 12, border: `1px solid ${T.border}`, padding: 16, marginBottom: 24 }}>
        <div style={{ color: T.text0, fontWeight: 600, marginBottom: 12 }}>📊 Open Positions</div>
        {PORTFOLIO.map((p, i) => (
          <div key={i} style={{ marginBottom: 12, paddingBottom: 12, borderBottom: i < PORTFOLIO.length-1 ? `1px solid ${T.border}` : 'none' }}>
            <div style={{ color: T.text1 }}>{p.market}</div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: p.side === 'YES' ? T.teal : T.red }}>{p.side} • {p.shares} shares</span>
              <span style={{ color: T.teal }}>${((p.current - p.avgPrice) * p.shares).toFixed(2)}</span>
            </div>
          </div>
        ))}
      </div>

      <div style={{ background: T.bgCard, borderRadius: 12, border: `1px solid ${T.border}`, padding: 16 }}>
        <div style={{ color: T.text0, fontWeight: 600, marginBottom: 12 }}>💸 Recent Deposits & Transactions</div>
        {recentDeposits.map((dep, i) => (
          <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 0', borderBottom: i < recentDeposits.length - 1 ? `1px solid ${T.border}` : 'none' }}>
            <div>
              <div style={{ color: T.text1 }}>{dep.crypto} Deposit</div>
              <div style={{ color: T.text2, fontSize: 12 }}>{dep.date}</div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ color: T.teal, fontWeight: 600 }}>+${dep.amount}</div>
              <div style={{ color: T.text2, fontSize: 11 }}>{dep.status}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

function MarketsPage({ prices, selected, setSelected }) {
  return (
    <div style={{ padding: '20px', color: T.text0 }}>
      <h2>Live Crypto Markets</h2>
      {prices.map(m => (
        <div key={m.id} onClick={() => setSelected(m)} style={{ padding: 12, background: T.bgCard, marginBottom: 8, borderRadius: 8, cursor: 'pointer' }}>
          {m.question}
        </div>
      ))}
    </div>
  )
}

function DepositsPage({ onDepositSuccess }) {
  const [selectedCrypto, setSelectedCrypto] = useState(null)
  const [amount, setAmount] = useState('')

  const cryptos = [
    { 
      symbol: 'BTC', 
      name: 'Bitcoin', 
      logo: 'https://cryptologos.cc/logos/bitcoin-btc-logo.png',
      address: 'bc1qxy2kdyz3f3y3f3y3f3y3f3y3f3y3f3y3f3y3f'
    },
    { 
      symbol: 'ETH', 
      name: 'Ethereum', 
      logo: 'https://cryptologos.cc/logos/ethereum-eth-logo.png',
      address: '0x742d35Cc6634C0532925a3b844Bc454e4438f44e'
    },
    { 
      symbol: 'USDT', 
      name: 'Tether (USDT)', 
      logo: 'https://cryptologos.cc/logos/tether-usdt-logo.png',
      address: '0x742d35Cc6634C0532925a3b844Bc454e4438f44e'
    },
    { 
      symbol: 'USDC', 
      name: 'USD Coin (USDC)', 
      logo: 'https://cryptologos.cc/logos/usd-coin-usdc-logo.png',
      address: '0x742d35Cc6634C0532925a3b844Bc454e4438f44e'
    },
  ]

  const handleConfirmDeposit = () => {
    if (!amount || !selectedCrypto) return

    const newDeposit = {
      id: Date.now(),
      crypto: selectedCrypto.symbol,
      amount: parseFloat(amount),
      date: 'Just now',
      status: 'Pending Confirmation'
    }

    onDepositSuccess(newDeposit)
    alert(`Deposit of ${amount} ${selectedCrypto.symbol} submitted. Waiting for confirmations...`)
    setSelectedCrypto(null)
    setAmount('')
  }

  return (
    <div style={{ padding: '20px', color: T.text0 }}>
      <h2>💰 Deposit Funds</h2>
      <p style={{ color: T.text2, marginBottom: 24 }}>Select a cryptocurrency to deposit</p>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16 }}>
        {cryptos.map(c => (
          <div 
            key={c.symbol} 
            onClick={() => setSelectedCrypto(c)} 
            style={{ 
              background: T.bgCard, 
              padding: 20, 
              borderRadius: 16, 
              textAlign: 'center', 
              cursor: 'pointer',
              border: `2px solid ${T.border}`,
              transition: 'all 0.2s'
            }}
          >
            <img 
              src={c.logo} 
              alt={c.symbol} 
              style={{ width: 72, height: 72, marginBottom: 16 }} 
              onError={(e) => e.target.src = 'https://via.placeholder.com/72?text=' + c.symbol} 
            />
            <div style={{ fontSize: 20, fontWeight: 700, color: T.text0 }}>{c.symbol}</div>
            <div style={{ fontSize: 13, color: T.text2 }}>{c.name}</div>
          </div>
        ))}
      </div>

      {/* Deposit Modal */}
      {selectedCrypto && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.9)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div style={{ background: T.bgCard, padding: 28, borderRadius: 20, width: '92%', maxWidth: 460, position: 'relative' }}>
            
            <button 
              onClick={() => { setSelectedCrypto(null); setAmount(''); }}
              style={{ position: 'absolute', top: 20, right: 24, fontSize: 28, background: 'none', border: 'none', color: T.text2, cursor: 'pointer' }}
            >
              ✕
            </button>

            <div style={{ textAlign: 'center', marginBottom: 24 }}>
              <img src={selectedCrypto.logo} alt={selectedCrypto.symbol} style={{ width: 80, height: 80, marginBottom: 12 }} onError={(e) => e.target.src = 'https://via.placeholder.com/80?text=' + selectedCrypto.symbol} />
              <div style={{ fontSize: 22, fontWeight: 700, color: T.text0 }}>Deposit {selectedCrypto.symbol}</div>
            </div>

            <div style={{ background: '#0a0a1a', borderRadius: 14, padding: 20, textAlign: 'center', marginBottom: 24, border: `1px solid ${T.border}` }}>
              <div style={{ fontSize: 13, color: T.text2, marginBottom: 12 }}>Send only {selectedCrypto.symbol} to this address</div>
              <div style={{ width: 180, height: 180, margin: '0 auto 16px', background: '#111', borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 60, color: '#555', border: '2px dashed rgba(255,255,255,0.2)' }}>QR</div>
              <div style={{ fontSize: 12, color: T.text2, wordBreak: 'break-all', userSelect: 'all' }}>{selectedCrypto.address}</div>
            </div>

            <button 
              onClick={() => navigator.clipboard.writeText(selectedCrypto.address).then(() => alert('Address copied!'))}
              style={{ width: '100%', padding: '12px', background: T.blueDim, color: T.blue, border: 'none', borderRadius: 12, fontWeight: 600, marginBottom: 20 }}
            >
              📋 Copy Address
            </button>

            <div style={{ marginBottom: 20 }}>
              <div style={{ color: T.text2, fontSize: 13.5, marginBottom: 8 }}>Deposit Amount</div>
              <div style={{ display: 'flex', gap: 12 }}>
                <input 
                  type="number" 
                  step="0.000001" 
                  value={amount} 
                  onChange={e => setAmount(e.target.value)} 
                  placeholder="0.00" 
                  style={{ flex: 1, background: T.bg2, border: `1px solid ${T.border}`, borderRadius: 12, padding: '16px 18px', color: T.text0, fontSize: 20, fontWeight: 500 }} 
                />
                <div style={{ background: T.bg2, border: `1px solid ${T.border}`, borderRadius: 12, padding: '16px 22px', color: T.text1, fontWeight: 700, fontSize: 18, display: 'flex', alignItems: 'center' }}>{selectedCrypto.symbol}</div>
              </div>
            </div>

            <button 
              onClick={handleConfirmDeposit} 
              disabled={!amount} 
              style={{ width: '100%', padding: '17px', background: amount ? T.teal : T.blueDim, color: '#fff', border: 'none', borderRadius: 14, fontSize: 16.5, fontWeight: 700, cursor: amount ? 'pointer' : 'not-allowed' }}
            >
              Confirm Deposit
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

function CopyTrading() {
  const [searchTerm, setSearchTerm] = useState('')

  const traders = [
    { name: "beachboy4", profit: "+$3,660,645", winRate: "87%", followers: "12.4K" },
    { name: "HorizonSplendidView", profit: "+$4,016,108", winRate: "91%", followers: "8.9K" },
    { name: "reachingthesky", profit: "+$3,742,635", winRate: "84%", followers: "6.2K" },
    { name: "majorexploiter", profit: "+$2,416,975", winRate: "79%", followers: "4.1K" },
    { name: "Theo4", profit: "+$2,053,953", winRate: "89%", followers: "15.7K" },
    { name: "Fredi9999", profit: "+$1,983,898", winRate: "73%", followers: "9.3K" },
  ]

  const filteredTraders = traders.filter(t => 
    t.name.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div style={{ padding: '20px', color: T.text0 }}>
      <h2>📋 Copy Trading</h2>
      <p style={{ color: T.text2, marginBottom: 20 }}>Follow successful Polymarket crypto traders</p>

      <input
        type="text"
        placeholder="Search traders..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        style={{ width: '100%', padding: '14px 18px', background: T.bg2, border: `1px solid ${T.border}`, borderRadius: 12, color: T.text0, marginBottom: 20 }}
      />

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 16 }}>
        {filteredTraders.length > 0 ? (
          filteredTraders.map((trader, i) => (
            <div key={i} style={{ background: T.bgCard, borderRadius: 16, border: `1px solid ${T.border}`, padding: 20 }}>
              <div style={{ fontSize: 18, fontWeight: 700, color: T.text0, marginBottom: 8 }}>{trader.name}</div>
              <div style={{ color: T.teal, fontSize: 22, fontWeight: 700, marginBottom: 4 }}>{trader.profit}</div>
              <div style={{ color: T.text2, marginBottom: 16 }}>{trader.winRate} win rate • {trader.followers} followers</div>
              <button style={{ width: '100%', padding: '14px', background: T.teal, color: '#fff', border: 'none', borderRadius: 12, fontWeight: 600 }}>
                Copy Trader
              </button>
            </div>
          ))
        ) : (
          <div style={{ color: T.text2, textAlign: 'center', padding: 40 }}>No traders found</div>
        )}
      </div>
    </div>
  )
}

export default function App() {
  const [user, setUser] = useState(null)
  const [view, setView] = useState('dashboard')
  const [showMenu, setShowMenu] = useState(false)
  const [selected, setSelected] = useState(null)
  const [recentDeposits, setRecentDeposits] = useState(RECENT_DEPOSITS)

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setUser(data.session?.user ?? null))
  }, [])

  const handleNewDeposit = (newDeposit) => {
    setRecentDeposits([newDeposit, ...recentDeposits])
  }

  if (!user) return <Auth onLogin={setUser} />

  const NAV_ITEMS = [
    { id: 'dashboard', label: 'Dashboard', icon: '🏠' },
    { id: 'markets', label: 'Markets', icon: '📈' },
    { id: 'copy', label: 'Copy Trading', icon: '📋' },
    { id: 'deposits', label: 'Deposits', icon: '💰' },
  ]

  const renderPage = () => {
    if (view === 'dashboard') return <DashboardPage user={user} recentDeposits={recentDeposits} />
    if (view === 'markets') return <MarketsPage prices={CRYPTO_MARKETS} selected={selected} setSelected={setSelected} />
    if (view === 'copy') return <CopyTrading />
    if (view === 'deposits') return <DepositsPage onDepositSuccess={handleNewDeposit} />
    return null
  }

  return (
    <div style={{ display: 'flex', height: '100vh', background: T.bg0, color: T.text0, fontFamily: T.sans }}>

      <div style={{ 
        width: showMenu ? 220 : 72, 
        borderRight: `1px solid ${T.border}`, 
        background: 'rgba(10,10,26,0.95)', 
        display: 'flex', 
        flexDirection: 'column', 
        position: 'relative',
        transition: 'width 0.3s ease'
      }}>

        <div 
          onClick={() => setShowMenu(!showMenu)}
          style={{ padding: '20px 16px', borderBottom: `1px solid ${T.border}`, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 10 }}
        >
          <div style={{ width: 32, height: 32, borderRadius: 8, background: 'linear-gradient(135deg,#3b82f6,#8b5cf6)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, fontWeight: 700, color: '#fff', flexShrink: 0 }}>P</div>
          {showMenu && (
            <div>
              <div style={{ fontSize: 15, fontWeight: 700, color: T.text0 }}>PolyTrader</div>
              <div style={{ fontSize: 10, color: T.text2 }}>Prediction Markets</div>
            </div>
          )}
        </div>

        {showMenu && (
          <div style={{ flex: 1, padding: '12px 10px' }}>
            {NAV_ITEMS.map(item => (
              <div 
                key={item.id}
                onClick={() => {
                  setView(item.id)
                  setShowMenu(false)
                }}
                style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: 10, 
                  padding: '10px 12px', 
                  borderRadius: 10, 
                  marginBottom: 4, 
                  cursor: 'pointer', 
                  background: view === item.id ? T.bg3 : 'transparent', 
                  color: view === item.id ? T.text0 : T.text1 
                }}
              >
                <span style={{ fontSize: 16 }}>{item.icon}</span>
                {item.label}
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