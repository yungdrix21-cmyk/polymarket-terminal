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

function Chart({ market }) {
  const [candles, setCandles] = useState([])
  useEffect(() => {
    let price = parseFloat(market.outcomePrices[0])
    const initial = Array.from({ length: 42 }, (_, i) => {
      const open = price
      const change = (Math.random() - 0.48) * 0.04
      const close = Math.min(0.99, Math.max(0.01, open + change))
      const high = Math.max(open, close) + Math.random() * 0.012
      const low = Math.min(open, close) - Math.random() * 0.012
      price = close
      return { time: i, open, close, high, low, volume: Math.floor(Math.random() * 50000 + 10000) }
    })
    setCandles(initial)
  }, [market])

  if (!candles.length) return null

  const W = 14, chartH = 160, volH = 36, pad = 6
  const highs = candles.map(c => c.high), lows = candles.map(c => c.low)
  const minP = Math.min(...lows), maxP = Math.max(...highs)
  const maxVol = Math.max(...candles.map(c => c.volume))
  const scaleP = v => chartH - ((v - minP) / (maxP - minP)) * (chartH - pad * 2) - pad
  const scaleV = v => volH - (v / maxVol) * (volH - 3)
  const totalW = candles.length * W + 52

  return (
    <div style={{ overflowX: 'auto', marginTop: 10 }}>
      <svg width={totalW} height={chartH + volH + 20}>
        {candles.map((c, i) => {
          const isUp = c.close >= c.open
          const color = isUp ? T.teal : T.red
          const bodyTop = scaleP(Math.max(c.open, c.close))
          const bodyH = Math.max(1, Math.abs(scaleP(c.open) - scaleP(c.close)))
          const x = i * W + W / 2
          return (
            <g key={i}>
              <line x1={x} y1={scaleP(c.high)} x2={x} y2={scaleP(c.low)} stroke={color} strokeWidth={1} opacity={0.6} />
              <rect x={i * W + 2} y={bodyTop} width={W - 4} height={bodyH} fill={color} opacity={0.85} rx={1} />
              <rect x={i * W + 2} y={chartH + scaleV(c.volume)} width={W - 4} height={volH - scaleV(c.volume)} fill={isUp ? T.teal : T.red} opacity={0.2} rx={1} />
            </g>
          )
        })}
      </svg>
    </div>
  )
}

function DashboardPage({ user }) {
  const totalPnL = PORTFOLIO.reduce((sum, p) => sum + (p.current - p.avgPrice) * p.shares, 0)
  const totalValue = PORTFOLIO.reduce((sum, p) => sum + p.current * p.shares, 0)

  const [aiInsights, setAiInsights] = useState([
    "BTC 5m market shows strong bullish momentum with rising YES probability.",
    "ETH short-term volatility is increasing — watch closely.",
    "SOL currently has the highest volume among short-term markets."
  ])

  const refreshInsights = () => {
    setAiInsights(["BTC momentum building", "ETH leaning slightly bearish", "High activity in SOL 5m market"])
  }

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

      <div style={{ background: T.bgCard, borderRadius: 12, border: `1px solid ${T.border}`, padding: 16, marginBottom: 24 }}>
        <div style={{ color: T.text0, fontWeight: 600, marginBottom: 12 }}>💸 Recent Deposits & Transactions</div>
        {RECENT_DEPOSITS.map((dep, i) => (
          <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 0', borderBottom: i < RECENT_DEPOSITS.length - 1 ? `1px solid ${T.border}` : 'none' }}>
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

      <div style={{ background: T.bgCard, borderRadius: 12, border: `1px solid ${T.border}`, padding: 16 }}>
        <div style={{ color: T.text0, fontWeight: 600, marginBottom: 12 }}>✦ AI Market Insights</div>
        <button onClick={refreshInsights} style={{ background: T.blueDim, color: T.blue, border: 'none', padding: '6px 12px', borderRadius: 8, marginBottom: 12 }}>Refresh</button>
        {aiInsights.map((insight, i) => <div key={i} style={{ color: T.text1, marginBottom: 8 }}>{insight}</div>)}
      </div>
    </div>
  )
}

// Original nice Markets Page (side-by-side layout with chart)
function MarketsPage({ prices, selected, setSelected, analysis, setAnalysis, analyzeMarket, analyzing }) {
  const selectedLive = prices.find(m => m.id === selected?.id)

  return (
    <div style={{ display: 'flex', flex: 1, overflow: 'hidden', flexDirection: window.innerWidth < 768 ? 'column' : 'row' }}>
      {/* Market List */}
      <div style={{ width: window.innerWidth < 768 ? '100%' : 300, borderRight: window.innerWidth >= 768 ? `1px solid ${T.border}` : 'none', borderBottom: window.innerWidth < 768 ? `1px solid ${T.border}` : 'none', display: 'flex', flexDirection: 'column', flexShrink: 0 }}>
        <div style={{ padding: '12px 16px', borderBottom: `1px solid ${T.border}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontSize: 13, fontWeight: 600, color: T.text0 }}>🔴 Live Crypto Markets</span>
          <span style={{ fontSize: 11, color: T.text2, background: T.purpleDim, padding: '4px 10px', borderRadius: 20 }}>7 active • 5-15m focus</span>
        </div>
        <div style={{ overflowY: 'auto', flex: 1 }}>
          {prices.map(market => {
            const yes = (parseFloat(market.outcomePrices[0]) * 100).toFixed(0)
            const isUp = market.change.startsWith('+')
            const isSelected = selected?.id === market.id
            return (
              <div key={market.id} onClick={() => { setSelected(market); setAnalysis('') }}
                style={{ padding: '14px 16px', borderBottom: `1px solid ${T.border}`, cursor: 'pointer', background: isSelected ? T.bg3 : 'transparent', borderLeft: `4px solid ${isSelected ? T.blue : 'transparent'}`, transition: 'all 0.2s' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
                  <div style={{ fontSize: 13.5, lineHeight: 1.35, color: isSelected ? T.text0 : T.text1, flex: 1 }}>{market.question}</div>
                  <div style={{ fontSize: 11, color: T.text2, background: T.bg2, padding: '2px 6px', borderRadius: 4 }}>{market.timeframe}</div>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: 17, fontWeight: 700, color: parseFloat(yes) > 50 ? T.teal : T.red }}>{yes}%</span>
                  <span style={{ fontSize: 12, color: isUp ? T.teal : T.red, background: isUp ? T.tealDim : T.redDim, padding: '3px 8px', borderRadius: 6 }}>{market.change}</span>
                </div>
                <div style={{ marginTop: 8, fontSize: 11, color: T.text2 }}>Vol ${(market.volume / 1000).toFixed(0)}K</div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Chart + Analysis Area */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        {selectedLive ? (
          <>
            <div style={{ padding: '16px 20px', borderBottom: `1px solid ${T.border}`, background: 'rgba(15,15,35,0.6)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
              <div>
                <div style={{ fontSize: 15, fontWeight: 600, color: T.text0 }}>{selectedLive.question}</div>
                <div style={{ fontSize: 12, color: T.text2 }}>{selectedLive.timeframe} • Polymarket Crypto</div>
              </div>
              <div style={{ display: 'flex', gap: 12 }}>
                {[{ label: 'YES', val: selectedLive.outcomePrices[0], color: T.teal }, { label: 'NO', val: selectedLive.outcomePrices[1], color: T.red }].map(item => (
                  <div key={item.label} style={{ textAlign: 'center', background: T.bg2, padding: '8px 18px', borderRadius: 10, minWidth: 90 }}>
                    <div style={{ fontSize: 11, color: item.color, fontWeight: 600 }}>{item.label}</div>
                    <div style={{ fontSize: 21, fontWeight: 700, color: item.color }}>{(parseFloat(item.val) * 100).toFixed(0)}%</div>
                  </div>
                ))}
              </div>
            </div>
            <div style={{ flex: 1, padding: '20px', overflowY: 'auto' }}>
              <div style={{ fontSize: 11, color: T.text2, marginBottom: 8 }}>LIVE PROBABILITY CHART</div>
              <Chart market={selectedLive} />
              <div style={{ marginTop: 28, padding: '20px', background: T.bgCard, borderRadius: 16, border: `1px solid ${T.border}` }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
                  <span style={{ fontSize: 14, fontWeight: 600, color: T.text0 }}>✦ AI Market Analysis</span>
                  <button onClick={() => alert("AI Analysis would appear here (simulated)")} style={{ background: T.blueDim, color: T.blue, border: 'none', padding: '9px 18px', borderRadius: 10, fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>
                    Get AI Insight
                  </button>
                </div>
                <p style={{ color: T.text1, lineHeight: 1.65, fontSize: 13.5 }}>Click a market on the left to see live chart and analysis.</p>
              </div>
            </div>
          </>
        ) : (
          <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 16, color: T.text2 }}>
            <div style={{ fontSize: 48, opacity: 0.6 }}>📊</div>
            <div>Select a live crypto market from the left</div>
          </div>
        )}
      </div>
    </div>
  )
}

function DepositsPage() {
  const [selectedCrypto, setSelectedCrypto] = useState(null)
  const [amount, setAmount] = useState('')

  const cryptos = [
    { symbol: 'BTC', name: 'Bitcoin', logo: 'https://cryptologos.cc/logos/bitcoin-btc-logo.png' },
    { symbol: 'ETH', name: 'Ethereum', logo: 'https://cryptologos.cc/logos/ethereum-eth-logo.png' },
    { symbol: 'USDT', name: 'Tether', logo: 'https://cryptologos.cc/logos/tether-usdt-logo.png' },
    { symbol: 'USDC', name: 'USD Coin', logo: 'https://cryptologos.cc/logos/usd-coin-usdc-logo.png' },
  ]

  return (
    <div style={{ padding: '20px', color: T.text0 }}>
      <h2>💰 Deposit Funds</h2>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16 }}>
        {cryptos.map(c => (
          <div key={c.symbol} onClick={() => setSelectedCrypto(c)} style={{ background: T.bgCard, padding: 20, borderRadius: 12, textAlign: 'center', cursor: 'pointer' }}>
            <img src={c.logo} alt={c.symbol} style={{ width: 60, height: 60 }} onError={(e) => e.target.src = 'https://via.placeholder.com/60?text=' + c.symbol} />
            <div style={{ marginTop: 12, fontWeight: 600 }}>{c.symbol}</div>
          </div>
        ))}
      </div>

      {selectedCrypto && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div style={{ background: T.bgCard, padding: 24, borderRadius: 16, width: '90%', maxWidth: 420, position: 'relative' }}>
            <button onClick={() => setSelectedCrypto(null)} style={{ position: 'absolute', top: 16, right: 16, fontSize: 24, background: 'none', border: 'none', color: T.text2 }}>✕</button>
            <h3>Deposit {selectedCrypto.symbol}</h3>
            <input 
              type="number" 
              placeholder="Amount" 
              value={amount} 
              onChange={e => setAmount(e.target.value)} 
              style={{ width: '100%', padding: 12, margin: '16px 0', background: T.bg2, border: `1px solid ${T.border}`, borderRadius: 8, color: T.text0 }} 
            />
            <button 
              onClick={() => { alert(`Simulated deposit of ${amount || 0} ${selectedCrypto.symbol}`); setSelectedCrypto(null); setAmount(''); }} 
              style={{ width: '100%', padding: 14, background: T.blue, color: '#fff', border: 'none', borderRadius: 12 }}
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
  const [analysis, setAnalysis] = useState('')
  const [analyzing, setAnalyzing] = useState(false)

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

  const renderPage = () => {
    if (view === 'dashboard') return <DashboardPage user={user} />
    if (view === 'markets') return <MarketsPage prices={CRYPTO_MARKETS} selected={selected} setSelected={setSelected} analysis={analysis} setAnalysis={setAnalysis} analyzeMarket={() => alert("AI Analysis")} analyzing={analyzing} />
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

        {/* Dropdown Menu Below Logo */}
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
          <button onClick={async () => { await supabase.auth.signOut(); setUser(null) }} style={{ width: '100%', padding: 8, background: 'transparent', border: `1px solid ${T.border}`, borderRadius: 8, color: T.text1 }}>
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