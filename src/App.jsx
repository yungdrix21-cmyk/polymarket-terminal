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

function DashboardPage({ user, prices }) {
  const totalPnL = PORTFOLIO.reduce((sum, p) => sum + (p.current - p.avgPrice) * p.shares, 0)
  const totalValue = PORTFOLIO.reduce((sum, p) => sum + p.current * p.shares, 0)

  const [aiInsights, setAiInsights] = useState([
    "BTC 5m market shows strong bullish momentum with rising YES probability.",
    "ETH short-term volatility is increasing — watch closely.",
    "SOL currently has the highest volume among short-term markets."
  ])

  const refreshInsights = () => {
    setAiInsights([
      "BTC momentum building — YES probability now at 55%.",
      "ETH 15m market leaning slightly bearish after recent rejection.",
      "High activity detected in SOL 5-minute Up/Down market."
    ])
  }

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

      {/* Open Positions */}
      <div style={{ background: T.bgCard, borderRadius: 12, border: `1px solid ${T.border}`, marginBottom: 24 }}>
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

      {/* Recent Deposits */}
      <div style={{ background: T.bgCard, borderRadius: 12, border: `1px solid ${T.border}`, marginBottom: 24 }}>
        <div style={{ padding: '14px 16px', borderBottom: `1px solid ${T.border}`, color: T.text0, fontWeight: 600, fontSize: 13 }}>
          💸 Recent Deposits
        </div>
        {RECENT_DEPOSITS.map((dep, i) => (
          <div key={i} style={{ padding: '12px 16px', borderBottom: i < RECENT_DEPOSITS.length - 1 ? `1px solid ${T.border}` : 'none', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <div style={{ color: T.text1, fontSize: 13 }}>{dep.crypto} Deposit</div>
              <div style={{ color: T.text2, fontSize: 12 }}>{dep.date}</div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ color: T.teal, fontWeight: 600 }}>+${typeof dep.amount === 'number' ? dep.amount.toFixed(2) : dep.amount}</div>
              <div style={{ color: T.text2, fontSize: 11 }}>{dep.status}</div>
            </div>
          </div>
        ))}
      </div>

      {/* AI Market Insights */}
      <div style={{ background: T.bgCard, borderRadius: 12, border: `1px solid ${T.border}` }}>
        <div style={{ padding: '14px 16px', borderBottom: `1px solid ${T.border}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ color: T.text0, fontWeight: 600, fontSize: 13 }}>✦ AI Market Insights</div>
          <button 
            onClick={refreshInsights}
            style={{ background: T.blueDim, color: T.blue, border: 'none', padding: '6px 14px', borderRadius: 8, fontSize: 12.5, cursor: 'pointer' }}
          >
            Refresh
          </button>
        </div>
        <div style={{ padding: '16px' }}>
          {aiInsights.map((insight, i) => (
            <div key={i} style={{ padding: '12px 0', borderBottom: i < aiInsights.length - 1 ? `1px solid ${T.border}` : 'none', color: T.text1, fontSize: 13.5, lineHeight: 1.55 }}>
              {insight}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

function MarketsPage({ prices, selected, setSelected, analysis, setAnalysis, analyzeMarket, analyzing }) {
  const selectedLive = prices.find(m => m.id === selected?.id)
  return (
    <div style={{ display: 'flex', flex: 1, overflow: 'hidden', flexDirection: window.innerWidth < 768 ? 'column' : 'row' }}>
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
                  <button onClick={() => analyzeMarket(selectedLive)} disabled={analyzing} style={{ background: analyzing ? T.blueDim : 'linear-gradient(135deg,#3b82f6,#6366f1)', color: '#fff', border: 'none', padding: '9px 18px', borderRadius: 10, fontSize: 13, fontWeight: 600, cursor: analyzing ? 'default' : 'pointer' }}>
                    {analyzing ? 'Analyzing...' : 'Get AI Insight'}
                  </button>
                </div>
                {analysis ? <p style={{ color: T.text1, lineHeight: 1.65, fontSize: 13.5 }}>{analysis}</p> : <p style={{ color: T.text2, fontSize: 13 }}>Click the button to get instant AI analysis.</p>}
              </div>
            </div>
          </>
        ) : (
          <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 16, color: T.text2 }}>
            <div style={{ fontSize: 48, opacity: 0.6 }}>📊</div>
            <div>Select a live crypto market</div>
          </div>
        )}
      </div>
    </div>
  )
}

function DepositsPage() {
  const [selectedCrypto, setSelectedCrypto] = useState(null)
  const [amount, setAmount] = useState('')
  const [depositing, setDepositing] = useState(false)
  const [depositSuccess, setDepositSuccess] = useState(false)

  const cryptos = [
    { symbol: 'BTC', name: 'Bitcoin', network: 'Bitcoin Network', color: '#f59e0b', logo: 'https://cryptologos.cc/logos/bitcoin-btc-logo.png', address: 'bc1qxy2kdyz3f3y3f3y3f3y3f3y3f3y3f3y3f3y3f' },
    { symbol: 'ETH', name: 'Ethereum', network: 'Ethereum Mainnet', color: '#627eea', logo: 'https://cryptologos.cc/logos/ethereum-eth-logo.png', address: '0x742d35Cc6634C0532925a3b844Bc454e4438f44e' },
    { symbol: 'USDT', name: 'Tether (USDT)', network: 'Polygon / ERC20', color: '#22c55e', logo: 'https://cryptologos.cc/logos/tether-usdt-logo.png', address: '0x742d35Cc6634C0532925a3b844Bc454e4438f44e' },
    { symbol: 'USDC', name: 'USD Coin (USDC)', network: 'Polygon / ERC20', color: '#2775ca', logo: 'https://cryptologos.cc/logos/usd-coin-usdc-logo.png', address: '0x742d35Cc6634C0532925a3b844Bc454e4438f44e' }
  ]

  const handleDeposit = () => {
    if (!amount || !selectedCrypto) return
    setDepositing(true)
    setTimeout(() => {
      setDepositing(false)
      setDepositSuccess(true)
      setTimeout(() => {
        setDepositSuccess(false)
        setAmount('')
        setSelectedCrypto(null)
        alert(`✅ Successfully simulated deposit of $${amount} ${selectedCrypto.symbol}`)
      }, 1400)
    }, 1600)
  }

  const copyAddress = (address) => {
    navigator.clipboard.writeText(address)
    alert('✅ Wallet address copied!')
  }

  return (
    <div style={{ padding: '20px', flex: 1, overflowY: 'auto', background: T.bg0 }}>
      <h2 style={{ color: T.text0, margin: '0 0 8px', fontSize: 22 }}>💰 Deposit Funds</h2>
      <p style={{ color: T.text2, fontSize: 14, marginBottom: 28 }}>Select a cryptocurrency to fund your PolyTrader account</p>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 16 }}>
        {cryptos.map((crypto) => (
          <div key={crypto.symbol} onClick={() => setSelectedCrypto(crypto)}
            style={{ background: T.bgCard, border: `2px solid ${T.border}`, borderRadius: 16, padding: 20, cursor: 'pointer', transition: 'all 0.2s ease', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
            <img src={crypto.logo} alt={crypto.symbol} style={{ width: 72, height: 72, marginBottom: 16, objectFit: 'contain' }} onError={(e) => e.target.src = 'https://via.placeholder.com/72?text=' + crypto.symbol} />
            <div style={{ fontSize: 20, fontWeight: 700, color: T.text0, marginBottom: 4 }}>{crypto.symbol}</div>
            <div style={{ fontSize: 13, color: T.text2, marginBottom: 12 }}>{crypto.name}</div>
            <div style={{ fontSize: 12, color: T.text1, background: T.bg2, padding: '4px 12px', borderRadius: 20 }}>{crypto.network}</div>
          </div>
        ))}
      </div>

      {/* Deposit Modal with X button */}
      {selectedCrypto && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.85)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div style={{ background: T.bgCard, borderRadius: 20, border: `1px solid ${T.border}`, width: '92%', maxWidth: 460, padding: 24, position: 'relative' }}>
            
            {/* X Close Button */}
            <button 
              onClick={() => { setSelectedCrypto(null); setAmount(''); setDepositSuccess(false); }}
              style={{ 
                position: 'absolute', 
                top: 16, 
                right: 20, 
                background: 'none', 
                border: 'none', 
                fontSize: 28, 
                color: T.text2, 
                cursor: 'pointer',
                zIndex: 10 
              }}
            >
              ✕
            </button>

            <div style={{ textAlign: 'center', marginBottom: 20 }}>
              <img src={selectedCrypto.logo} alt={selectedCrypto.symbol} style={{ width: 80, height: 80, marginBottom: 12 }} onError={(e) => e.target.src = 'https://via.placeholder.com/80?text=' + selectedCrypto.symbol} />
              <div style={{ fontSize: 22, fontWeight: 700, color: T.text0 }}>Deposit {selectedCrypto.symbol}</div>
              <div style={{ color: T.text2, fontSize: 13 }}>{selectedCrypto.network}</div>
            </div>

            <div style={{ background: '#0a0a1a', borderRadius: 14, padding: 20, textAlign: 'center', marginBottom: 20, border: `1px solid ${T.border}` }}>
              <div style={{ fontSize: 13, color: T.text2, marginBottom: 12 }}>Send only {selectedCrypto.symbol} to this address</div>
              <div style={{ width: 180, height: 180, margin: '0 auto 12px', background: '#111', borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 70, color: '#444', border: '2px dashed rgba(255,255,255,0.15)' }}>QR</div>
              <div style={{ fontSize: 11.5, color: T.text2, wordBreak: 'break-all' }}>{selectedCrypto.address}</div>
            </div>

            <button onClick={() => copyAddress(selectedCrypto.address)} style={{ width: '100%', padding: '13px', background: T.blueDim, color: T.blue, border: 'none', borderRadius: 12, fontWeight: 600, marginBottom: 24, cursor: 'pointer' }}>📋 Copy Address</button>

            <div style={{ marginBottom: 20 }}>
              <div style={{ color: T.text2, fontSize: 13.5, marginBottom: 8 }}>Deposit Amount</div>
              <div style={{ display: 'flex', gap: 12 }}>
                <input type="number" step="0.01" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="0.00" style={{ flex: 1, background: T.bg2, border: `1px solid ${T.border}`, borderRadius: 12, padding: '16px 18px', color: T.text0, fontSize: 20, fontWeight: 500 }} />
                <div style={{ background: T.bg2, border: `1px solid ${T.border}`, borderRadius: 12, padding: '16px 22px', color: T.text1, fontWeight: 700, fontSize: 18, display: 'flex', alignItems: 'center' }}>{selectedCrypto.symbol}</div>
              </div>
            </div>

            <button onClick={handleDeposit} disabled={depositing || !amount} style={{ width: '100%', padding: '17px', background: depositing ? T.blueDim : 'linear-gradient(135deg, #3b82f6, #6366f1)', color: '#fff', border: 'none', borderRadius: 14, fontSize: 16.5, fontWeight: 700, cursor: depositing || !amount ? 'not-allowed' : 'pointer', opacity: depositing || !amount ? 0.75 : 1 }}>
              {depositing ? 'Processing Deposit...' : `Confirm Deposit $${amount || '0.00'}`}
            </button>

            {depositSuccess && <div style={{ marginTop: 16, padding: 14, background: T.tealDim, color: T.teal, borderRadius: 12, textAlign: 'center', fontWeight: 600 }}>✅ Deposit Simulated Successfully</div>}
          </div>
        </div>
      )}
    </div>
  )
}

function CopyTrading({ onClose }) {
  const [searchTerm, setSearchTerm] = useState('')
  const [copiedTrader, setCopiedTrader] = useState(null)

  const allTraders = [
    { name: "beachboy4", profit: "+$3,660,645", winRate: "87%", followers: "12.4K", color: T.teal },
    { name: "HorizonSplendidView", profit: "+$4,016,108", winRate: "91%", followers: "8.9K", color: T.teal },
    { name: "reachingthesky", profit: "+$3,742,635", winRate: "84%", followers: "6.2K", color: T.teal },
    { name: "majorexploiter", profit: "+$2,416,975", winRate: "79%", followers: "4.1K", color: T.purple },
    { name: "Theo4", profit: "+$2,053,953", winRate: "89%", followers: "15.7K", color: T.teal },
    { name: "Fredi9999", profit: "+$1,983,898", winRate: "73%", followers: "9.3K", color: T.purple },
    { name: "CryptoWhaleKing", profit: "+$2,845,120", winRate: "82%", followers: "7.8K", color: T.teal },
    { name: "SolanaSniper", profit: "+$1,672,450", winRate: "76%", followers: "5.1K", color: T.purple },
  ]

  const filteredTraders = allTraders.filter(trader =>
    trader.name.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const handleCopy = (trader) => {
    setCopiedTrader(trader.name)
    setTimeout(() => setCopiedTrader(null), 2000)
    alert(`✅ You are now copying ${trader.name}!`)
  }

  return (
    <div style={{ padding: '20px', flex: 1, overflowY: 'auto', background: T.bg0 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <div>
          <h2 style={{ color: T.text0, margin: 0, fontSize: 22 }}>📋 Copy Trading</h2>
          <p style={{ color: T.text2, fontSize: 14, marginTop: 4 }}>Follow successful Polymarket crypto traders</p>
        </div>
        {onClose && <button onClick={onClose} style={{ background: 'none', border: 'none', color: T.text2, fontSize: 26, cursor: 'pointer' }}>✕</button>}
      </div>

      <div style={{ marginBottom: 24 }}>
        <input
          type="text"
          placeholder="Search traders by name..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{ width: '100%', padding: '14px 18px', background: T.bg2, border: `1px solid ${T.border}`, borderRadius: 12, color: T.text0, fontSize: 15, outline: 'none' }}
        />
      </div>

      <div style={{ marginBottom: 16, color: T.text0, fontSize: 15, fontWeight: 600 }}>Top Crypto Traders on Polymarket</div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 16 }}>
        {filteredTraders.length > 0 ? (
          filteredTraders.map((trader, i) => (
            <div key={i} style={{ background: T.bgCard, borderRadius: 16, border: `1px solid ${T.border}`, padding: 20 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                <div style={{ fontSize: 18, fontWeight: 700, color: T.text0 }}>{trader.name}</div>
                <div style={{ fontSize: 13, color: trader.color, fontWeight: 600 }}>{trader.winRate} Win Rate</div>
              </div>
              <div style={{ color: T.teal, fontSize: 22, fontWeight: 700, marginBottom: 4 }}>{trader.profit}</div>
              <div style={{ color: T.text2, fontSize: 13, marginBottom: 20 }}>{trader.followers} followers</div>
              <button onClick={() => handleCopy(trader)} style={{ width: '100%', padding: '14px', background: copiedTrader === trader.name ? T.tealDim : 'linear-gradient(135deg, #14b8a6, #0f766e)', color: '#fff', border: 'none', borderRadius: 12, fontWeight: 700, fontSize: 15, cursor: 'pointer' }}>
                {copiedTrader === trader.name ? '✓ Copying Active' : 'Copy Trader'}
              </button>
            </div>
          ))
        ) : (
          <div style={{ color: T.text2, textAlign: 'center', padding: '40px 20px' }}>No traders found matching "{searchTerm}"</div>
        )}
      </div>
    </div>
  )
}

// Main App
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
    if (view === 'copy') return <CopyTrading onClose={() => setView('dashboard')} />
    if (view === 'deposits') return <DepositsPage />
    return null
  }

  return (
    <div style={{ display: 'flex', height: '100vh', background: T.bg0, color: T.text0, fontFamily: T.sans, backgroundImage: `radial-gradient(ellipse 60% 40% at 20% 0%, rgba(99,51,220,0.18) 0%, transparent 70%), radial-gradient(ellipse 40% 30% at 80% 100%, rgba(59,130,246,0.08) 0%, transparent 60%)` }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        ::-webkit-scrollbar { width: 4px; } ::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.08); border-radius: 2px; }
      `}</style>

      {!isMobile && (
        <div style={{ width: 220, borderRight: `1px solid ${T.border}`, display: 'flex', flexDirection: 'column', background: 'rgba(10,10,26,0.9)', flexShrink: 0 }}>
          <div style={{ padding: '20px 20px 16px', borderBottom: `1px solid ${T.border}` }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{ width: 32, height: 32, borderRadius: 8, background: 'linear-gradient(135deg,#3b82f6,#8b5cf6)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, fontWeight: 700, color: '#fff' }}>P</div>
              <div>
                <div style={{ fontSize: 15, fontWeight: 700, color: T.text0 }}>PolyTrader</div>
                <div style={{ fontSize: 10, color: T.text2 }}>Prediction Markets</div>
              </div>
            </div>
          </div>
          <div style={{ flex: 1, padding: '12px 10px' }}>
            {NAV_ITEMS.map(item => (
              <div key={item.id} onClick={() => setView(item.id)} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px', borderRadius: 10, marginBottom: 4, cursor: 'pointer', background: view === item.id ? T.bg3 : 'transparent', color: view === item.id ? T.text0 : T.text1, fontSize: 13, fontWeight: view === item.id ? 600 : 400, borderLeft: `3px solid ${view === item.id ? T.blue : 'transparent'}` }}>
                <span style={{ fontSize: 16 }}>{item.icon}</span>
                {item.label}
              </div>
            ))}
          </div>
          <div style={{ padding: '12px 16px', borderTop: `1px solid ${T.border}` }}>
            <div style={{ fontSize: 11, color: T.text2, marginBottom: 8 }}>{user.email}</div>
            <button onClick={async () => { await supabase.auth.signOut(); setUser(null) }} style={{ width: '100%', padding: '7px', background: 'transparent', border: `1px solid ${T.border}`, borderRadius: 8, color: T.text1, fontSize: 12, cursor: 'pointer' }}>Log out</button>
          </div>
        </div>
      )}

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        {isMobile && (
          <div style={{ padding: '12px 16px', borderBottom: `1px solid ${T.border}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(10,10,26,0.9)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <div style={{ width: 28, height: 28, borderRadius: 7, background: 'linear-gradient(135deg,#3b82f6,#8b5cf6)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, fontWeight: 700, color: '#fff' }}>P</div>
              <span style={{ fontSize: 15, fontWeight: 700, color: T.text0 }}>PolyTrader</span>
            </div>
          </div>
        )}

        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', paddingBottom: isMobile ? 64 : 0 }}>
          {renderPage()}
        </div>

        {isMobile && (
          <div style={{ position: 'fixed', bottom: 0, left: 0, right: 0, height: 64, background: 'rgba(10,10,26,0.97)', borderTop: `1px solid ${T.border}`, display: 'flex', alignItems: 'center', justifyContent: 'space-around', zIndex: 100 }}>
            {NAV_ITEMS.map(item => (
              <div key={item.id} onClick={() => setView(item.id)} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3, cursor: 'pointer', flex: 1, padding: '8px 0' }}>
                <span style={{ fontSize: 20 }}>{item.icon}</span>
                <span style={{ fontSize: 10, color: view === item.id ? T.blue : T.text2, fontWeight: view === item.id ? 600 : 400 }}>{item.label}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}