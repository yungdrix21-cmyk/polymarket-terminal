import { useState, useEffect } from 'react'
import { supabase } from './lib/supabase'
import Auth from './components/Auth'
import CopyTrading from './components/CopyTrading'

const CRYPTO_MARKETS = [
  { id: '1', question: 'Will Bitcoin be above $90k on April 30?', outcomePrices: ['0.62', '0.38'], change: '+2.3%', volume: 145000 },
  { id: '2', question: 'Will ETH be above $2k on April 30?', outcomePrices: ['0.48', '0.52'], change: '-1.1%', volume: 89000 },
  { id: '3', question: 'Will BTC hit $100k in 2025?', outcomePrices: ['0.55', '0.45'], change: '+0.8%', volume: 210000 },
  { id: '4', question: 'Will Solana hit $200 in April?', outcomePrices: ['0.32', '0.68'], change: '-3.2%', volume: 54000 },
  { id: '5', question: 'Will XRP be above $3 on May 1?', outcomePrices: ['0.44', '0.56'], change: '+1.5%', volume: 67000 },
  { id: '6', question: 'Will BTC dominance exceed 60% in April?', outcomePrices: ['0.70', '0.30'], change: '+0.2%', volume: 32000 },
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

function generateCandles(base, count = 42) {
  let price = base
  return Array.from({ length: count }, (_, i) => {
    const open = price
    const change = (Math.random() - 0.48) * 0.04
    const close = Math.min(0.99, Math.max(0.01, open + change))
    const high = Math.max(open, close) + Math.random() * 0.012
    const low = Math.min(open, close) - Math.random() * 0.012
    price = close
    return { time: i, open, close, high, low, volume: Math.floor(Math.random() * 50000 + 10000) }
  })
}

function Chart({ market }) {
  const [candles, setCandles] = useState([])
  useEffect(() => {
    setCandles(generateCandles(parseFloat(market.outcomePrices[0])))
    const interval = setInterval(() => {
      setCandles(prev => {
        const last = prev[prev.length - 1]
        const change = (Math.random() - 0.48) * 0.02
        const newClose = Math.min(0.99, Math.max(0.01, last.close + change))
        return [...prev.slice(1), {
          time: last.time + 1, open: last.close, close: newClose,
          high: Math.max(last.close, newClose) + Math.random() * 0.008,
          low: Math.min(last.close, newClose) - Math.random() * 0.008,
          volume: Math.floor(Math.random() * 50000 + 10000),
        }]
      })
    }, 3000)
    return () => clearInterval(interval)
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
        {[0, 0.25, 0.5, 0.75, 1].map(t => {
          const val = minP + (maxP - minP) * (1 - t)
          const y = pad + t * (chartH - pad * 2)
          return (
            <g key={t}>
              <line x1={0} y1={y} x2={totalW - 46} y2={y} stroke="rgba(255,255,255,0.04)" strokeWidth={1} />
              <text x={totalW - 44} y={y + 3} fill={T.text2} fontSize={9}>{(val * 100).toFixed(1)}%</text>
            </g>
          )
        })}
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
        <line x1={0} y1={chartH + 1} x2={totalW - 46} y2={chartH + 1} stroke="rgba(255,255,255,0.05)" strokeWidth={1} />
      </svg>
    </div>
  )
}

// ── DASHBOARD PAGE ──────────────────────────────
function DashboardPage({ user, prices }) {
  const totalPnL = PORTFOLIO.reduce((sum, p) => sum + (p.current - p.avgPrice) * p.shares, 0)
  const totalValue = PORTFOLIO.reduce((sum, p) => sum + p.current * p.shares, 0)

  return (
    <div style={{ padding: '20px', overflowY: 'auto', flex: 1 }}>
      <h2 style={{ color: T.text0, margin: '0 0 4px', fontSize: 18 }}>Welcome back 👋</h2>
      <p style={{ color: T.text2, margin: '0 0 20px', fontSize: 13 }}>{user.email}</p>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: 12, marginBottom: 24 }}>
        {[
          { label: 'Portfolio Value', value: `$${totalValue.toFixed(2)}`, color: T.text0 },
          { label: 'Total P&L', value: `${totalPnL >= 0 ? '+' : ''}$${totalPnL.toFixed(2)}`, color: totalPnL >= 0 ? T.teal : T.red },
          { label: 'Open Positions', value: PORTFOLIO.length, color: T.blue },
          { label: 'Live Markets', value: prices.length, color: T.teal },
        ].map((s, i) => (
          <div key={i} style={{ background: T.bgCard, borderRadius: 12, padding: '14px 16px', border: `1px solid ${T.border}` }}>
            <div style={{ color: T.text2, fontSize: 11, marginBottom: 6 }}>{s.label}</div>
            <div style={{ color: s.color, fontSize: 20, fontWeight: 700 }}>{s.value}</div>
          </div>
        ))}
      </div>

      {/* Positions */}
      <div style={{ background: T.bgCard, borderRadius: 12, border: `1px solid ${T.border}`, marginBottom: 20 }}>
        <div style={{ padding: '14px 16px', borderBottom: `1px solid ${T.border}`, color: T.text0, fontWeight: 600, fontSize: 13 }}>
          📊 Open Positions
        </div>
        {PORTFOLIO.map((p, i) => {
          const pnl = (p.current - p.avgPrice) * p.shares
          const pnlPct = ((p.current - p.avgPrice) / p.avgPrice * 100).toFixed(1)
          return (
            <div key={i} style={{ padding: '12px 16px', borderBottom: i < PORTFOLIO.length - 1 ? `1px solid ${T.border}` : 'none', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
              <div style={{ flex: 1, minWidth: 140 }}>
                <div style={{ color: T.text1, fontSize: 12, marginBottom: 4 }}>{p.market.slice(0, 32)}...</div>
                <div style={{ display: 'flex', gap: 8 }}>
                  <span style={{ background: p.side === 'YES' ? T.tealDim : T.redDim, color: p.side === 'YES' ? T.teal : T.red, padding: '2px 8px', borderRadius: 4, fontSize: 11, fontWeight: 600 }}>{p.side}</span>
                  <span style={{ color: T.text2, fontSize: 11 }}>{p.shares} shares</span>
                </div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ color: pnl >= 0 ? T.teal : T.red, fontWeight: 700, fontSize: 14 }}>{pnl >= 0 ? '+' : ''}${pnl.toFixed(2)}</div>
                <div style={{ color: T.text2, fontSize: 11 }}>{pnlPct}%</div>
              </div>
            </div>
          )
        })}
      </div>

      {/* Watchlist */}
      <div style={{ background: T.bgCard, borderRadius: 12, border: `1px solid ${T.border}` }}>
        <div style={{ padding: '14px 16px', borderBottom: `1px solid ${T.border}`, color: T.text0, fontWeight: 600, fontSize: 13 }}>
          👁 Watchlist
        </div>
        {prices.slice(0, 4).map((m, i) => {
          const yes = (parseFloat(m.outcomePrices[0]) * 100).toFixed(1)
          const isUp = m.change.startsWith('+')
          return (
            <div key={i} style={{ padding: '12px 16px', borderBottom: i < 3 ? `1px solid ${T.border}` : 'none', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 8 }}>
              <div style={{ color: T.text1, fontSize: 12, flex: 1 }}>{m.question}</div>
              <div style={{ display: 'flex', gap: 10, alignItems: 'center', whiteSpace: 'nowrap' }}>
                <span style={{ color: parseFloat(yes) > 50 ? T.teal : T.red, fontWeight: 700, fontSize: 14 }}>{yes}%</span>
                <span style={{ color: isUp ? T.teal : T.red, fontSize: 11, background: isUp ? T.tealDim : T.redDim, padding: '2px 6px', borderRadius: 4 }}>{m.change}</span>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

// ── MARKETS PAGE ──────────────────────────────
function MarketsPage({ prices, selected, setSelected, analysis, setAnalysis, analyzeMarket, analyzing }) {
  const selectedLive = prices.find(m => m.id === selected?.id)

  return (
    <div style={{ display: 'flex', flex: 1, overflow: 'hidden', flexDirection: window.innerWidth < 768 ? 'column' : 'row' }}>
      {/* Market list */}
      <div style={{ width: window.innerWidth < 768 ? '100%' : 280, borderRight: window.innerWidth >= 768 ? `1px solid ${T.border}` : 'none', borderBottom: window.innerWidth < 768 ? `1px solid ${T.border}` : 'none', display: 'flex', flexDirection: 'column', flexShrink: 0, maxHeight: window.innerWidth < 768 ? 240 : 'none' }}>
        <div style={{ padding: '10px 16px', borderBottom: `1px solid ${T.border}`, display: 'flex', justifyContent: 'space-between' }}>
          <span style={{ fontSize: 11, fontWeight: 600, color: T.text1 }}>Crypto Markets</span>
          <span style={{ fontSize: 10, color: T.text2, background: T.purpleDim, padding: '2px 8px', borderRadius: 20 }}>{prices.length} active</span>
        </div>
        <div style={{ overflowY: 'auto', flex: 1 }}>
          {prices.map(market => {
            const yes = (parseFloat(market.outcomePrices[0]) * 100).toFixed(1)
            const isUp = market.change.startsWith('+')
            const isSelected = selected?.id === market.id
            const yesNum = parseFloat(yes)
            return (
              <div key={market.id}
                onClick={() => { setSelected(market); setAnalysis('') }}
                style={{ padding: '10px 16px', borderBottom: `1px solid ${T.border}`, cursor: 'pointer', background: isSelected ? T.bg3 : 'transparent', borderLeft: `3px solid ${isSelected ? T.blue : 'transparent'}`, transition: 'all 0.15s' }}>
                <div style={{ fontSize: 12, color: isSelected ? T.text0 : T.text1, marginBottom: 6, lineHeight: 1.4 }}>{market.question}</div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 5 }}>
                  <span style={{ fontSize: 15, fontWeight: 700, color: yesNum > 50 ? T.teal : T.red }}>{yes}%</span>
                  <span style={{ fontSize: 11, color: isUp ? T.teal : T.red, background: isUp ? T.tealDim : T.redDim, padding: '2px 6px', borderRadius: 4 }}>{market.change}</span>
                </div>
                <div style={{ height: 3, background: 'rgba(255,255,255,0.06)', borderRadius: 2 }}>
                  <div style={{ width: yes + '%', height: '100%', borderRadius: 2, background: yesNum > 50 ? 'linear-gradient(90deg,#0d9488,#14b8a6)' : 'linear-gradient(90deg,#e11d48,#f43f5e)', transition: 'width 0.6s ease' }} />
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Chart panel */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        {selectedLive ? (
          <>
            <div style={{ padding: '14px 20px', borderBottom: `1px solid ${T.border}`, background: 'rgba(15,15,35,0.4)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 10, flexShrink: 0 }}>
              <div>
                <div style={{ fontSize: 14, fontWeight: 600, color: T.text0, marginBottom: 3 }}>{selectedLive.question}</div>
                <span style={{ fontSize: 11, color: T.text2 }}>Polymarket · Crypto · Vol ${(selectedLive.volume / 1000).toFixed(0)}K</span>
              </div>
              <div style={{ display: 'flex', gap: 10 }}>
                {[{ label: 'YES', val: selectedLive.outcomePrices[0], color: T.teal, bg: T.tealDim },
                  { label: 'NO', val: selectedLive.outcomePrices[1], color: T.red, bg: T.redDim }
                ].map(({ label, val, color, bg }) => (
                  <div key={label} style={{ textAlign: 'center', background: bg, border: `1px solid ${color}33`, borderRadius: 10, padding: '6px 16px' }}>
                    <div style={{ fontSize: 10, color, fontWeight: 600, marginBottom: 2 }}>{label}</div>
                    <div style={{ fontSize: 22, fontWeight: 700, color, letterSpacing: '-0.03em' }}>{(parseFloat(val) * 100).toFixed(1)}%</div>
                  </div>
                ))}
              </div>
            </div>
            <div style={{ flex: 1, padding: '16px 20px', overflowY: 'auto' }}>
              <div style={{ fontSize: 10, color: T.text2, fontWeight: 500, letterSpacing: '0.06em', marginBottom: 4 }}>5-MIN PROBABILITY CHART</div>
              <Chart market={selectedLive} />
              <div style={{ marginTop: 20, padding: '16px 20px', background: T.bgCard, border: `1px solid ${T.border}`, borderRadius: 16 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                  <span style={{ fontSize: 13, fontWeight: 600, color: T.text0 }}>✦ AI Analysis</span>
                  <button onClick={() => analyzeMarket(selectedLive)} disabled={analyzing} style={{ background: analyzing ? T.blueDim : 'linear-gradient(135deg,#3b82f6,#6366f1)', color: '#fff', border: 'none', padding: '8px 16px', borderRadius: 10, cursor: analyzing ? 'default' : 'pointer', fontSize: 12, fontWeight: 600, fontFamily: T.sans }}>
                    {analyzing ? 'Analyzing...' : 'Analyze Market'}
                  </button>
                </div>
                {analysis
                  ? <p style={{ color: T.text1, lineHeight: 1.7, margin: 0, fontSize: 13 }}>{analysis}</p>
                  : <p style={{ color: T.text2, margin: 0, fontSize: 12 }}>Click "Analyze Market" to get AI insights.</p>
                }
              </div>
            </div>
          </>
        ) : (
          <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 12 }}>
            <div style={{ fontSize: 36 }}>📈</div>
            <div style={{ fontSize: 14, color: T.text1 }}>Select a market to view chart</div>
            <div style={{ fontSize: 12, color: T.text2 }}>Live candlestick charts with AI analysis</div>
          </div>
        )}
      </div>
    </div>
  )
}

// ── DEPOSITS PAGE ──────────────────────────────
function DepositsPage() {
  return (
    <div style={{ padding: 20, flex: 1, overflowY: 'auto' }}>
      <h2 style={{ color: T.text0, margin: '0 0 4px', fontSize: 18 }}>💰 Deposits</h2>
      <p style={{ color: T.text2, fontSize: 13, margin: '0 0 24px' }}>Fund your account to start trading</p>
      <div style={{ background: T.bgCard, borderRadius: 12, border: `1px solid ${T.border}`, padding: 20, maxWidth: 400 }}>
        <div style={{ color: T.text1, fontSize: 13, marginBottom: 16 }}>Select deposit method:</div>
        {['USDC (Polygon)', 'ETH', 'Credit / Debit Card'].map((method, i) => (
          <div key={i} style={{ padding: '14px 16px', border: `1px solid ${T.border}`, borderRadius: 10, marginBottom: 10, cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: T.text1, fontSize: 13 }}>
            <span>{method}</span>
            <span style={{ color: T.text2, fontSize: 11 }}>→</span>
          </div>
        ))}
        <div style={{ marginTop: 16, padding: 12, background: T.purpleDim, borderRadius: 8, border: `1px solid rgba(167,139,250,0.2)` }}>
          <div style={{ color: T.purple, fontSize: 11 }}>⚡ Instant deposits via USDC on Polygon network</div>
        </div>
      </div>
    </div>
  )
}

// ── MAIN APP ──────────────────────────────
export default function App() {
  const [user, setUser] = useState(null)
  const [view, setView] = useState('dashboard')
  const [selected, setSelected] = useState(null)
  const [prices, setPrices] = useState(CRYPTO_MARKETS)
  const [analysis, setAnalysis] = useState('')
  const [analyzing, setAnalyzing] = useState(false)
  const [lastUpdate, setLastUpdate] = useState(new Date())
  const [pulse, setPulse] = useState(false)
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768)

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setUser(data.session?.user ?? null))
  }, [])

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768)
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  useEffect(() => {
    const interval = setInterval(() => {
      setPrices(prev => prev.map(m => ({
        ...m,
        outcomePrices: [
          String(Math.min(0.99, Math.max(0.01, parseFloat(m.outcomePrices[0]) + (Math.random() - 0.5) * 0.01))),
          String(Math.min(0.99, Math.max(0.01, parseFloat(m.outcomePrices[1]) + (Math.random() - 0.5) * 0.01))),
        ]
      })))
      setLastUpdate(new Date())
      setPulse(true)
      setTimeout(() => setPulse(false), 500)
    }, 3000)
    return () => clearInterval(interval)
  }, [])

  async function analyzeMarket(market) {
    setAnalyzing(true)
    setAnalysis('')
    try {
      const res = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: 'claude-sonnet-4-20250514',
          max_tokens: 1000,
          messages: [{ role: 'user', content: `You are a prediction market analyst. Analyze this market in 3-4 sentences: "${market.question}" Current YES probability: ${(parseFloat(market.outcomePrices[0]) * 100).toFixed(1)}%. Is it fairly priced? Any edge?` }]
        })
      })
      const data = await res.json()
      setAnalysis(data.content[0].text)
    } catch {
      setAnalysis('Analysis unavailable.')
    }
    setAnalyzing(false)
  }

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
    if (view === 'copy') return <div style={{ flex: 1, overflow: 'hidden' }}><CopyTrading onClose={() => setView('dashboard')} /></div>
    if (view === 'deposits') return <DepositsPage />
  }

  return (
    <div style={{ display: 'flex', height: '100vh', background: T.bg0, color: T.text0, fontFamily: T.sans, backgroundImage: `radial-gradient(ellipse 60% 40% at 20% 0%, rgba(99,51,220,0.18) 0%, transparent 70%), radial-gradient(ellipse 40% 30% at 80% 100%, rgba(59,130,246,0.08) 0%, transparent 60%)` }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        ::-webkit-scrollbar { width: 4px; } ::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.08); border-radius: 2px; }
      `}</style>

      {/* ── DESKTOP SIDEBAR ── */}
      {!isMobile && (
        <div style={{ width: 220, borderRight: `1px solid ${T.border}`, display: 'flex', flexDirection: 'column', background: 'rgba(10,10,26,0.9)', flexShrink: 0 }}>
          {/* Logo */}
          <div style={{ padding: '20px 20px 16px', borderBottom: `1px solid ${T.border}` }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{ width: 32, height: 32, borderRadius: 8, background: 'linear-gradient(135deg,#3b82f6,#8b5cf6)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, fontWeight: 700, color: '#fff' }}>P</div>
              <div>
                <div style={{ fontSize: 15, fontWeight: 700, color: T.text0 }}>PolyTrader</div>
                <div style={{ fontSize: 10, color: T.text2 }}>Prediction Markets</div>
              </div>
            </div>
          </div>

          {/* Nav items */}
          <div style={{ flex: 1, padding: '12px 10px' }}>
            {NAV_ITEMS.map(item => (
              <div key={item.id}
                onClick={() => setView(item.id)}
                style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px', borderRadius: 10, marginBottom: 4, cursor: 'pointer', background: view === item.id ? T.bg3 : 'transparent', color: view === item.id ? T.text0 : T.text1, fontSize: 13, fontWeight: view === item.id ? 600 : 400, borderLeft: `3px solid ${view === item.id ? T.blue : 'transparent'}`, transition: 'all 0.15s' }}>
                <span style={{ fontSize: 16 }}>{item.icon}</span>
                {item.label}
              </div>
            ))}
          </div>

          {/* User info + logout */}
          <div style={{ padding: '12px 16px', borderTop: `1px solid ${T.border}` }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8 }}>
              <div style={{ width: 6, height: 6, borderRadius: '50%', background: pulse ? '#22c55e' : T.text2, boxShadow: pulse ? '0 0 6px #22c55e' : 'none', transition: 'all 0.3s' }} />
              <span style={{ fontSize: 10, color: pulse ? '#22c55e' : T.text2 }}>Live · {lastUpdate.toLocaleTimeString()}</span>
            </div>
            <div style={{ fontSize: 11, color: T.text2, marginBottom: 8, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{user.email}</div>
            <button onClick={async () => { await supabase.auth.signOut(); setUser(null) }} style={{ width: '100%', padding: '7px', background: 'transparent', border: `1px solid ${T.border}`, borderRadius: 8, color: T.text1, fontSize: 12, cursor: 'pointer', fontFamily: T.sans }}>
              Log out
            </button>
          </div>
        </div>
      )}

      {/* ── MAIN CONTENT ── */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>

        {/* Mobile header */}
        {isMobile && (
          <div style={{ padding: '12px 16px', borderBottom: `1px solid ${T.border}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(10,10,26,0.9)', flexShrink: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <div style={{ width: 28, height: 28, borderRadius: 7, background: 'linear-gradient(135deg,#3b82f6,#8b5cf6)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, fontWeight: 700, color: '#fff' }}>P</div>
              <span style={{ fontSize: 15, fontWeight: 700, color: T.text0 }}>PolyTrader</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <div style={{ width: 6, height: 6, borderRadius: '50%', background: pulse ? '#22c55e' : T.text2, boxShadow: pulse ? '0 0 6px #22c55e' : 'none', transition: 'all 0.3s' }} />
              <span style={{ fontSize: 10, color: pulse ? '#22c55e' : T.text2 }}>Live</span>
            </div>
          </div>
        )}

        {/* Page content */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', paddingBottom: isMobile ? 64 : 0 }}>
          {renderPage()}
        </div>

        {/* ── MOBILE BOTTOM NAV ── */}
        {isMobile && (
          <div style={{ position: 'fixed', bottom: 0, left: 0, right: 0, height: 64, background: 'rgba(10,10,26,0.97)', borderTop: `1px solid ${T.border}`, display: 'flex', alignItems: 'center', justifyContent: 'space-around', backdropFilter: 'blur(12px)', zIndex: 100 }}>
            {NAV_ITEMS.map(item => (
              <div key={item.id}
                onClick={() => setView(item.id)}
                style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3, cursor: 'pointer', flex: 1, padding: '8px 0' }}>
                <span style={{ fontSize: 20 }}>{item.icon}</span>
                <span style={{ fontSize: 10, color: view === item.id ? T.blue : T.text2, fontWeight: view === item.id ? 600 : 400 }}>{item.label}</span>
                {view === item.id && <div style={{ width: 4, height: 4, borderRadius: '50%', background: T.blue }} />}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}