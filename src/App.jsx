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

// ─── Design tokens matching prob.trade aesthetic ──────────────────────────────
const T = {
  // Backgrounds — deep navy with purple tint
  bg0:      '#0a0a1a',   // page background
  bg1:      '#0f0f23',   // card background
  bg2:      '#14142e',   // elevated card
  bg3:      '#1a1a38',   // hover / selected
  bgCard:   '#111128',   // main card bg
  // Borders
  border:   'rgba(255,255,255,0.06)',
  borderHi: 'rgba(255,255,255,0.12)',
  // Accents
  blue:     '#3b82f6',   // CTA buttons — bright blue like prob.trade
  blueDim:  'rgba(59,130,246,0.15)',
  teal:     '#14b8a6',   // positive / YES
  tealDim:  'rgba(20,184,166,0.15)',
  red:      '#f43f5e',   // negative / NO
  redDim:   'rgba(244,63,94,0.15)',
  purple:   '#a78bfa',   // accent highlights
  purpleDim:'rgba(167,139,250,0.12)',
  // Text
  text0:    '#f8fafc',   // primary
  text1:    '#94a3b8',   // secondary
  text2:    '#475569',   // muted
  // Font — soft sans like prob.trade (not mono)
  sans:     '"Inter", -apple-system, BlinkMacSystemFont, sans-serif',
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

  const W = 15
  const chartH = 160
  const volH = 36
  const pad = 6
  const highs = candles.map(c => c.high)
  const lows = candles.map(c => c.low)
  const minP = Math.min(...lows)
  const maxP = Math.max(...highs)
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
              <text x={totalW - 44} y={y + 3} fill={T.text2} fontSize={9} fontFamily={T.sans}>{(val * 100).toFixed(1)}%</text>
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
              <rect x={i * W + 2} y={chartH + scaleV(c.volume)} width={W - 4}
                height={volH - scaleV(c.volume)} fill={isUp ? T.teal : T.red} opacity={0.2} rx={1} />
            </g>
          )
        })}
        <line x1={0} y1={chartH + 1} x2={totalW - 46} y2={chartH + 1} stroke="rgba(255,255,255,0.05)" strokeWidth={1} />
      </svg>
    </div>
  )
}

function NavTab({ label, active, onClick }) {
  return (
    <button onClick={onClick} style={{
      padding: '0 16px', height: 48, fontSize: 13, fontWeight: active ? 600 : 400,
      cursor: 'pointer', color: active ? T.text0 : T.text1,
      background: 'none', border: 'none', borderBottom: `2px solid ${active ? T.blue : 'transparent'}`,
      fontFamily: T.sans, transition: 'all 0.15s',
    }}>{label}</button>
  )
}

export default function App() {
  const [user, setUser] = useState(null)
  const [view, setView] = useState('markets')
  const [selected, setSelected] = useState(null)
  const [prices, setPrices] = useState(CRYPTO_MARKETS)
  const [analysis, setAnalysis] = useState('')
  const [analyzing, setAnalyzing] = useState(false)
  const [lastUpdate, setLastUpdate] = useState(new Date())
  const [pulse, setPulse] = useState(false)

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setUser(data.session?.user ?? null))
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

  const selectedLive = prices.find(m => m.id === selected?.id)

  const sharedLayout = (children) => (
    <div style={{
      display: 'flex', flexDirection: 'column', height: '100vh',
      background: T.bg0, color: T.text0, fontFamily: T.sans,
      // prob.trade's signature radial purple glow in top-left
      backgroundImage: `
        radial-gradient(ellipse 60% 40% at 20% 0%, rgba(99,51,220,0.18) 0%, transparent 70%),
        radial-gradient(ellipse 40% 30% at 80% 100%, rgba(59,130,246,0.08) 0%, transparent 60%)
      `,
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
        * { box-sizing: border-box; }
        ::-webkit-scrollbar { width: 4px; background: transparent; }
        ::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.08); border-radius: 2px; }
        .mkt-row:hover { background: ${T.bg3} !important; }
        .nav-tab:hover { color: ${T.text0} !important; }
      `}</style>

      {/* ── Top nav ── */}
      <div style={{
        display: 'flex', alignItems: 'center', height: 48, flexShrink: 0,
        borderBottom: `1px solid ${T.border}`,
        background: 'rgba(10,10,26,0.8)',
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
      }}>
        {/* Logo */}
        <div style={{ padding: '0 20px', display: 'flex', alignItems: 'center', gap: 8, borderRight: `1px solid ${T.border}`, height: '100%' }}>
          <div style={{
            width: 24, height: 24, borderRadius: 6,
            background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 12, fontWeight: 700, color: '#fff',
          }}>P</div>
          <span style={{ fontSize: 14, fontWeight: 700, color: T.text0, letterSpacing: '-0.01em' }}>PolyTrader</span>
        </div>

        <NavTab label="Markets" active={view === 'markets'} onClick={() => setView('markets')} />
        <NavTab label="Copy Trading" active={view === 'copy'} onClick={() => setView('copy')} />

        <div style={{ marginLeft: 'auto', padding: '0 20px', display: 'flex', alignItems: 'center', gap: 14 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
            <div style={{
              width: 6, height: 6, borderRadius: '50%',
              background: pulse ? '#22c55e' : T.text2,
              boxShadow: pulse ? '0 0 6px #22c55e' : 'none',
              transition: 'all 0.3s',
            }} />
            <span style={{ fontSize: 11, color: pulse ? '#22c55e' : T.text2, transition: 'color 0.3s' }}>Live</span>
          </div>
          <span style={{ fontSize: 11, color: T.text2 }}>{lastUpdate.toLocaleTimeString()}</span>
          <div style={{ width: 1, height: 16, background: T.border }} />
          <span style={{ fontSize: 11, color: T.text1 }}>{user.email}</span>
          <button onClick={async () => { await supabase.auth.signOut(); setUser(null) }} style={{
            fontSize: 11, color: T.text1, background: 'none', border: `1px solid ${T.border}`,
            borderRadius: 6, padding: '4px 10px', cursor: 'pointer', fontFamily: T.sans,
          }}>Log out</button>
        </div>
      </div>

      {children}
    </div>
  )

  if (view === 'copy') return sharedLayout(
    <div style={{ flex: 1, overflow: 'hidden' }}>
      <CopyTrading />
    </div>
  )

  return sharedLayout(
    <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>

      {/* ── LEFT: market list ── */}
      <div style={{
        width: 300, borderRight: `1px solid ${T.border}`,
        display: 'flex', flexDirection: 'column', flexShrink: 0,
        background: 'rgba(15,15,35,0.6)',
      }}>
        <div style={{ padding: '10px 16px', borderBottom: `1px solid ${T.border}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontSize: 11, fontWeight: 600, color: T.text1 }}>Crypto Markets</span>
          <span style={{ fontSize: 10, color: T.text2, background: T.purpleDim, padding: '2px 8px', borderRadius: 20, border: `1px solid rgba(167,139,250,0.2)` }}>{prices.length} active</span>
        </div>
        <div style={{ overflowY: 'auto', flex: 1 }}>
          {prices.map(market => {
            const yes = (parseFloat(market.outcomePrices[0]) * 100).toFixed(1)
            const isUp = market.change.startsWith('+')
            const isSelected = selected?.id === market.id
            const yesNum = parseFloat(yes)
            return (
              <div key={market.id} className="mkt-row"
                onClick={() => { setSelected(market); setAnalysis('') }}
                style={{
                  padding: '12px 16px', borderBottom: `1px solid ${T.border}`, cursor: 'pointer',
                  background: isSelected ? T.bg3 : 'transparent',
                  borderLeft: `3px solid ${isSelected ? T.blue : 'transparent'}`,
                  transition: 'all 0.15s',
                }}>
                <div style={{ fontSize: 12, color: isSelected ? T.text0 : T.text1, marginBottom: 8, lineHeight: 1.45, fontWeight: isSelected ? 500 : 400 }}>
                  {market.question}
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                  <div style={{ display: 'flex', alignItems: 'baseline', gap: 4 }}>
                    <span style={{ fontSize: 16, fontWeight: 700, color: yesNum > 50 ? T.teal : T.red, letterSpacing: '-0.02em' }}>{yes}%</span>
                    <span style={{ fontSize: 10, color: T.text2 }}>YES</span>
                  </div>
                  <span style={{
                    fontSize: 11, fontWeight: 500,
                    color: isUp ? T.teal : T.red,
                    background: isUp ? T.tealDim : T.redDim,
                    padding: '2px 6px', borderRadius: 4,
                  }}>{market.change}</span>
                </div>
                <div style={{ height: 3, background: 'rgba(255,255,255,0.06)', borderRadius: 2 }}>
                  <div style={{
                    width: yes + '%', height: '100%', borderRadius: 2,
                    background: yesNum > 50
                      ? 'linear-gradient(90deg, #0d9488, #14b8a6)'
                      : 'linear-gradient(90deg, #e11d48, #f43f5e)',
                    transition: 'width 0.6s ease',
                  }} />
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* ── MAIN ── */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        {selectedLive ? (
          <>
            {/* Market header */}
            <div style={{
              padding: '14px 24px', borderBottom: `1px solid ${T.border}`,
              background: 'rgba(15,15,35,0.4)',
              display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexShrink: 0,
            }}>
              <div>
                <div style={{ fontSize: 15, fontWeight: 600, color: T.text0, marginBottom: 4 }}>{selectedLive.question}</div>
                <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                  <span style={{ fontSize: 11, color: T.text2 }}>Polymarket · Crypto</span>
                  <span style={{ fontSize: 10, color: T.text2, background: T.purpleDim, padding: '1px 7px', borderRadius: 20, border: `1px solid rgba(167,139,250,0.15)` }}>
                    Vol ${(selectedLive.volume / 1000).toFixed(0)}K
                  </span>
                </div>
              </div>
              <div style={{ display: 'flex', gap: 12 }}>
                {[
                  { label: 'YES', val: selectedLive.outcomePrices[0], color: T.teal, bg: T.tealDim },
                  { label: 'NO', val: selectedLive.outcomePrices[1], color: T.red, bg: T.redDim },
                ].map(({ label, val, color, bg }) => (
                  <div key={label} style={{ textAlign: 'center', background: bg, border: `1px solid ${color}33`, borderRadius: 12, padding: '8px 20px' }}>
                    <div style={{ fontSize: 10, color, fontWeight: 600, marginBottom: 2 }}>{label}</div>
                    <div style={{ fontSize: 26, fontWeight: 700, color, letterSpacing: '-0.03em', lineHeight: 1 }}>
                      {(parseFloat(val) * 100).toFixed(1)}%
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div style={{ flex: 1, padding: '16px 24px', overflowY: 'auto' }}>
              <div style={{ fontSize: 10, color: T.text2, fontWeight: 500, letterSpacing: '0.06em', marginBottom: 4, textTransform: 'uppercase' }}>5-Min Probability Chart</div>
              <Chart market={selectedLive} />

              {/* AI Analysis card */}
              <div style={{
                marginTop: 20, padding: '16px 20px',
                background: T.bgCard,
                border: `1px solid ${T.border}`,
                borderRadius: 16,
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <div style={{
                      width: 28, height: 28, borderRadius: 8,
                      background: 'linear-gradient(135deg, rgba(59,130,246,0.3), rgba(139,92,246,0.3))',
                      border: `1px solid rgba(139,92,246,0.3)`,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: 14,
                    }}>✦</div>
                    <span style={{ fontSize: 13, fontWeight: 600, color: T.text0 }}>AI Analysis</span>
                  </div>
                  <button onClick={() => analyzeMarket(selectedLive)} disabled={analyzing} style={{
                    background: analyzing ? 'rgba(59,130,246,0.2)' : 'linear-gradient(135deg, #3b82f6, #6366f1)',
                    color: '#fff', border: 'none', padding: '8px 18px', borderRadius: 10,
                    cursor: analyzing ? 'default' : 'pointer', fontSize: 12, fontWeight: 600,
                    fontFamily: T.sans, transition: 'all 0.2s',
                    boxShadow: analyzing ? 'none' : '0 4px 12px rgba(59,130,246,0.3)',
                  }}>
                    {analyzing ? 'Analyzing...' : 'Analyze Market'}
                  </button>
                </div>
                {analysis ? (
                  <p style={{ color: T.text1, lineHeight: 1.7, margin: 0, fontSize: 13 }}>{analysis}</p>
                ) : (
                  <p style={{ color: T.text2, margin: 0, fontSize: 12 }}>Click "Analyze Market" to get AI insights on this prediction.</p>
                )}
              </div>
            </div>
          </>
        ) : (
          <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 16 }}>
            <div style={{
              width: 56, height: 56, borderRadius: 16,
              background: 'linear-gradient(135deg, rgba(59,130,246,0.2), rgba(139,92,246,0.2))',
              border: `1px solid rgba(139,92,246,0.25)`,
              display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24,
            }}>📈</div>
            <div style={{ fontSize: 15, fontWeight: 600, color: T.text1 }}>Select a market</div>
            <div style={{ fontSize: 12, color: T.text2 }}>Live candlestick charts with AI analysis</div>
          </div>
        )}
      </div>
    </div>
  )
}