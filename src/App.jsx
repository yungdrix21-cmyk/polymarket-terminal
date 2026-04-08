import { supabase } from './lib/supabase'
import Auth from './components/Auth'
import Profile from './components/Profile'
import PolymarketMarkets from './components/PolymarketMarkets'
import AdminKYCReview from './components/admin/AdminKYCReview';
import React, { useState, useEffect } from "react";

const T = {
  bg0: '#0d0e14', bg1: '#12131c', bg2: '#181922', bg3: '#1e2030', bgCard: '#14151f',
  bgHover: '#1a1b28',
  border: 'rgba(255,255,255,0.06)', borderHi: 'rgba(255,255,255,0.12)',
  blue: '#4f8eff', blueDim: 'rgba(79,142,255,0.12)',
  teal: '#00d4aa', tealDim: 'rgba(0,212,170,0.12)',
  red: '#ff4d6a', redDim: 'rgba(255,77,106,0.12)',
  purple: '#9b7dff', purpleDim: 'rgba(155,125,255,0.12)',
  yellow: '#f5c842', yellowDim: 'rgba(245,200,66,0.12)',
  text0: '#e8eaf0', text1: '#8b8fa8', text2: '#4a4d62',
  font: '"DM Sans", "Sora", system-ui, sans-serif',
  mono: '"DM Mono", "Fira Code", monospace',
}

const Icon = ({ name, size = 16, color = 'currentColor', strokeWidth = 1.6 }) => {
  const paths = {
    dashboard: <><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></>,
    markets:   <><polyline points="22 7 13.5 15.5 8.5 10.5 2 17"/><polyline points="16 7 22 7 22 13"/></>,
    users:     <><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></>,
    deposit:   <><path d="M12 2v10"/><path d="m8 8 4 4 4-4"/><path d="M20 16v2a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2v-2"/></>,
    profile:   <><circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/></>,
    settings:  <><circle cx="12" cy="12" r="3"/><path d="M12 2v3M12 19v3M4.22 4.22l2.12 2.12M17.66 17.66l2.12 2.12M2 12h3M19 12h3M4.22 19.78l2.12-2.12M17.66 6.34l2.12-2.12"/></>,
    withdraw:  <><path d="M12 14v-10"/><path d="m8 8 4-4 4 4"/><path d="M20 16v2a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2v-2"/></>,
    logout:    <><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></>,
    menu:      <><line x1="4" y1="7" x2="20" y2="7"/><line x1="4" y1="12" x2="20" y2="12"/><line x1="4" y1="17" x2="20" y2="17"/></>,
    close:     <><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></>,
    arrowUp:   <><line x1="12" y1="19" x2="12" y2="5"/><polyline points="5 12 12 5 19 12"/></>,
    chart:     <><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></>,
    wallet:    <><path d="M21 12V7H5a2 2 0 0 1 0-4h14v4"/><path d="M3 7v13a2 2 0 0 0 2 2h16v-5"/><path d="M18 12a2 2 0 0 0 0 4h4v-4Z"/></>,
    copy:      <><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></>,
    star:      <><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></>,
    bell:      <><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></>,
    search:    <><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></>,
    trending:  <><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/></>,
    clock:     <><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></>,
    zap:       <><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></>,
    lock:      <><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></>,
    shield:    <><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></>,
  }
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">
      {paths[name] || null}
    </svg>
  )
}



function Badge({ children, color = T.blue }) {
  return <span style={{ fontSize: 10, fontWeight: 600, color, background: `${color}18`, padding: '3px 8px', borderRadius: 20, border: `1px solid ${color}28` }}>{children}</span>
}

function StatCard({ label, value, color, icon, sub }) {
  return (
    <div style={{ background: T.bgCard, borderRadius: 14, padding: '18px 20px', border: `1px solid ${T.border}`, position: 'relative', overflow: 'hidden' }}>
      <div style={{ position: 'absolute', top: 0, right: 0, width: 80, height: 80, borderRadius: '0 14px 0 80px', background: `${color}08` }} />
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10 }}>
        <div style={{ color: T.text1, fontSize: 11, fontWeight: 500, letterSpacing: '0.06em', textTransform: 'uppercase' }}>{label}</div>
        <div style={{ color, opacity: 0.8 }}>{icon}</div>
      </div>
      <div style={{ color, fontSize: 22, fontWeight: 700, fontFamily: T.mono }}>{value}</div>
      {sub && <div style={{ color: T.text2, fontSize: 11, marginTop: 4 }}>{sub}</div>}
    </div>
  )
}

function Chart({ market }) {
  const [candles, setCandles] = useState([])

  useEffect(() => {
    let price = parseFloat(market.outcomePrices?.[0] ?? 0.5)
    const initial = Array.from({ length: 48 }, () => {
      const open = price
      const change = (Math.random() - 0.48) * 0.035
      const close = Math.min(0.99, Math.max(0.01, open + change))
      const high = Math.max(open, close) + Math.random() * 0.015
      const low = Math.min(open, close) - Math.random() * 0.015
      price = close
      return { open, close, high, low, volume: Math.floor(Math.random() * 60000 + 8000) }
    })
    setCandles(initial)
  }, [market.id])

  useEffect(() => {
    if (!candles.length) return
    const last = candles[candles.length - 1]
    const newClose = market.outcomePrices[0]
    const newCandle = {
      open: last.close,
      close: newClose,
      high: Math.max(last.close, newClose) + Math.random() * 0.01,
      low: Math.min(last.close, newClose) - Math.random() * 0.01,
      volume: Math.floor(Math.random() * 60000 + 8000)
    }
    setCandles(prev => [...prev.slice(-47), newCandle])
  }, [market.outcomePrices[0]])

  if (!candles.length) return null

  const W = 16, chartH = 200, volH = 44, pad = 8
  const minP = Math.min(...candles.map(c => c.low))
  const maxP = Math.max(...candles.map(c => c.high))
  const maxVol = Math.max(...candles.map(c => c.volume))
  const scaleP = v => chartH - ((v - minP) / (maxP - minP || 1)) * (chartH - pad * 2) - pad
  const scaleV = v => volH - (v / maxVol) * (volH - 3)
  const totalW = candles.length * W + 20
  const linePoints = candles.map((c, i) => `${i * W + W / 2},${scaleP(c.close)}`).join(' ')
  const lastPrice = candles[candles.length - 1]?.close ?? 0.5
  const firstPrice = candles[0]?.close ?? 0.5
  const isOverallUp = lastPrice >= firstPrice

  return (
    <div style={{ overflowX: 'auto', marginTop: 12, background: 'rgba(255,255,255,0.02)', borderRadius: 12, padding: '12px 8px' }}>
      <svg width={totalW} height={chartH + volH + 28} style={{ display: 'block' }}>
        <defs>
          <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={isOverallUp ? '#00d4aa' : '#ff4d6a'} stopOpacity="0.15" />
            <stop offset="100%" stopColor={isOverallUp ? '#00d4aa' : '#ff4d6a'} stopOpacity="0" />
          </linearGradient>
        </defs>

        {[0.2, 0.4, 0.6, 0.8].map((v, i) => (
          <g key={i}>
            <line
              x1={0} y1={scaleP(minP + (maxP - minP) * v)}
              x2={totalW} y2={scaleP(minP + (maxP - minP) * v)}
              stroke="rgba(255,255,255,0.04)" strokeWidth={1} strokeDasharray="3,6"
            />
            <text x={4} y={scaleP(minP + (maxP - minP) * v) - 3} fill="rgba(255,255,255,0.2)" fontSize={9} fontFamily="monospace">
              {((minP + (maxP - minP) * v) * 100).toFixed(0)}%
            </text>
          </g>
        ))}

        <polygon
          points={`${candles.map((c, i) => `${i * W + W / 2},${scaleP(c.close)}`).join(' ')} ${(candles.length - 1) * W + W / 2},${chartH} 0,${chartH}`}
          fill="url(#areaGrad)"
        />

        {candles.map((c, i) => {
          const isUp = c.close >= c.open
          const color = isUp ? '#00d4aa' : '#ff4d6a'
          const bodyTop = scaleP(Math.max(c.open, c.close))
          const bodyH = Math.max(2, Math.abs(scaleP(c.open) - scaleP(c.close)))
          const x = i * W + W / 2
          return (
            <g key={i}>
              <line x1={x} y1={scaleP(c.high)} x2={x} y2={scaleP(c.low)} stroke={color} strokeWidth={1} opacity={0.6} />
              <rect x={i * W + 3} y={bodyTop} width={W - 6} height={bodyH} fill={color} opacity={0.85} rx={2} />
              <rect x={i * W + 3} y={chartH + 8 + scaleV(c.volume)} width={W - 6} height={volH - scaleV(c.volume)} fill={color} opacity={0.25} rx={1} />
            </g>
          )
        })}

        <polyline points={linePoints} fill="none" stroke={isOverallUp ? '#00d4aa' : '#ff4d6a'} strokeWidth={1.5} opacity={0.5} strokeLinejoin="round" />

        <rect x={totalW - 52} y={scaleP(lastPrice) - 10} width={48} height={16} fill={isOverallUp ? '#00d4aa' : '#ff4d6a'} rx={4} />
        <text x={totalW - 28} y={scaleP(lastPrice) + 2} fill="#000" fontSize={10} fontWeight="700" fontFamily="monospace" textAnchor="middle">
          {(lastPrice * 100).toFixed(1)}%
        </text>

        <text x={4} y={chartH + 8} fill="rgba(255,255,255,0.2)" fontSize={9} fontFamily="monospace">VOL</text>
      </svg>
    </div>
  )
}

function KYCBanner({ kycStatus }) {
  if (kycStatus === 'approved') return null
  return (
    <div style={{ margin: '0 0 20px', background: T.yellowDim, border: `1px solid ${T.yellow}40`, borderRadius: 14, padding: '14px 20px', display: 'flex', alignItems: 'center', gap: 14 }}>
      <Icon name="shield" size={20} color={T.yellow} />
      <div style={{ flex: 1 }}>
        <div style={{ color: T.yellow, fontWeight: 600, fontSize: 13 }}>
          {kycStatus === 'pending' ? '⏳ KYC Verification Pending' : '⚠ KYC Required'}
        </div>
        <div style={{ color: T.text1, fontSize: 12, marginTop: 2 }}>
          {kycStatus === 'pending'
            ? 'Your documents are under review (1–2 business days). Deposits and trading are locked until approved.'
            : 'Complete KYC verification to unlock deposits and trading.'}
        </div>
      </div>
      <Badge color={T.yellow}>{kycStatus === 'pending' ? 'Under Review' : 'Action Required'}</Badge>
    </div>
  )
}

function LockedPage({ title }) {
  return (
    <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 16, color: T.text2, padding: 40, textAlign: 'center' }}>
      <div style={{ width: 64, height: 64, borderRadius: '50%', background: T.yellowDim, border: `1px solid ${T.yellow}30`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Icon name="lock" size={28} color={T.yellow} />
      </div>
      <div>
        <div style={{ fontSize: 16, fontWeight: 700, color: T.text0, marginBottom: 6 }}>{title} Locked</div>
        <div style={{ fontSize: 13, color: T.text1, maxWidth: 300, lineHeight: 1.6 }}>
          Complete KYC verification to unlock this feature.
        </div>
      </div>
      <div style={{ background: T.yellowDim, border: `1px solid ${T.yellow}30`, borderRadius: 10, padding: '10px 20px' }}>
        <span style={{ fontSize: 12, color: T.yellow, fontWeight: 600 }}>⏳ Review takes 1–2 business days</span>
      </div>
    </div>
  )
}

function DashboardPage({ user, balance, transactions, kycStatus, markets }) {
  return (
    <div style={{ padding: '28px 28px 40px', overflowY: 'auto', flex: 1 }}>
      <KYCBanner kycStatus={kycStatus} />
      <div style={{ marginBottom: 28, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <h2 style={{ color: T.text0, margin: 0, fontSize: 20, fontWeight: 700 }}>Welcome back 👋</h2>
          <p style={{ color: T.text2, margin: '4px 0 0', fontSize: 13 }}>{user?.email}</p>
        </div>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <div style={{ width: 8, height: 8, borderRadius: '50%', background: T.teal, boxShadow: `0 0 6px ${T.teal}` }} />
          <span style={{ fontSize: 12, color: T.teal }}>Live</span>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 14, marginBottom: 28 }}>
        <StatCard label="Account Balance" value={`$${Number(balance).toFixed(2)}`} color={T.text0} icon={<Icon name="wallet" size={15} />} sub="Available funds" />
        <StatCard label="Total P&L" value="$0.00" color={T.text2} icon={<Icon name="trending" size={15} color={T.text2} />} sub="No trades yet" />
        <StatCard label="Open Positions" value="0" color={T.blue} icon={<Icon name="zap" size={15} color={T.blue} />} sub="Active markets" />
        <StatCard label="Live Markets" value={markets?.length || 0} color={T.purple} icon={<Icon name="markets" size={15} color={T.purple} />} sub="Available now" />
      </div>

      <div style={{ background: T.bgCard, borderRadius: 16, border: `1px solid ${T.border}`, padding: '20px 24px', marginBottom: 20 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <Icon name="arrowUp" size={16} color={T.blue} />
            <span style={{ fontSize: 14, fontWeight: 600, color: T.text0 }}>Open Positions & Orders</span>
          </div>
          <Badge color={T.blue}>Live</Badge>
        </div>
        <div style={{ color: T.text2, fontSize: 12, marginBottom: 18 }}>Your active trades will appear here</div>
        <div style={{ background: 'rgba(255,255,255,0.025)', borderRadius: 12, padding: '20px 24px', display: 'flex', alignItems: 'center', gap: 24 }}>
          <div>
            <div style={{ color: T.text2, fontSize: 11, letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: 6 }}>Active Positions</div>
            <div style={{ fontSize: 44, fontWeight: 700, color: T.text0, fontFamily: T.mono, lineHeight: 1 }}>0</div>
            <div style={{ color: T.text2, fontSize: 13, marginTop: 4 }}>$0.00 in positions</div>
          </div>
          <div style={{ flex: 1, borderLeft: `1px solid ${T.border}`, paddingLeft: 24 }}>
            <div style={{ color: T.text2, fontSize: 12, marginBottom: 12 }}>No active trades yet</div>
            <div style={{ display: 'flex', gap: 8 }}>
              <Badge color={T.teal}>0 YES</Badge>
              <Badge color={T.red}>0 NO</Badge>
            </div>
          </div>
        </div>
      </div>

      <div style={{ background: T.bgCard, borderRadius: 16, border: `1px solid ${T.border}`, overflow: 'hidden' }}>
        <div style={{ padding: '16px 24px', borderBottom: `1px solid ${T.border}`, display: 'flex', alignItems: 'center', gap: 10 }}>
          <Icon name="deposit" size={15} color={T.yellow} />
          <span style={{ color: T.text0, fontWeight: 600, fontSize: 14 }}>Recent Deposits & Transactions</span>
        </div>
        {transactions.length === 0 ? (
          <div style={{ padding: '32px 24px', textAlign: 'center', color: T.text2, fontSize: 13 }}>
            No transactions yet. Make a deposit to get started.
          </div>
        ) : (
          transactions.map((tx, i) => (
            <div key={tx.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 24px', borderBottom: i < transactions.length - 1 ? `1px solid ${T.border}` : 'none', transition: 'background 0.15s' }}
              onMouseEnter={e => e.currentTarget.style.background = T.bgHover}
              onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{ width: 36, height: 36, borderRadius: 10, background: T.yellowDim, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Icon name="deposit" size={15} color={T.yellow} />
                </div>
                <div>
                  <div style={{ color: T.text0, fontSize: 13, fontWeight: 500 }}>{tx.crypto} Deposit</div>
                  <div style={{ color: T.text2, fontSize: 11, marginTop: 2 }}>{new Date(tx.created_at).toLocaleDateString()}</div>
                </div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ color: T.teal, fontWeight: 600, fontSize: 14, fontFamily: T.mono }}>+${Number(tx.amount).toFixed(2)}</div>
                <Badge color={T.teal}>{tx.status}</Badge>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}

function AIInsights({ market }) {
  const [insight, setInsight] = useState(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!market) return
    setLoading(true)
    setInsight(null)

    const yes = (market.outcomePrices[0] * 100).toFixed(1)
    const no = (market.outcomePrices[1] * 100).toFixed(1)

    const prompt = `You are a prediction market analyst. Given this market: "${market.question}"
Current probabilities: YES ${yes}% / NO ${no}%
Give a very short 2-3 sentence analysis. Mention the current lean, what could shift the odds, and a confidence note. Be concise and direct. No bullet points.`

    fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "claude-sonnet-4-20250514",
        max_tokens: 1000,
        messages: [{ role: "user", content: prompt }]
      })
    })
      .then(r => r.json())
      .then(data => {
        const text = data?.content?.[0]?.text
        setInsight(text || "Unable to generate insight.")
        setLoading(false)
      })
      .catch(() => {
        setInsight("Unable to generate insight.")
        setLoading(false)
      })
  }, [market?.id])

  return (
    <div style={{
      marginTop: 20,
      background: 'rgba(79,142,255,0.06)',
      border: '1px solid rgba(79,142,255,0.15)',
      borderRadius: 12,
      padding: '16px 20px',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
        <div style={{
          width: 20, height: 20, borderRadius: 6,
          background: 'linear-gradient(135deg, #4f8eff, #9b7dff)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 11, fontWeight: 800, color: '#fff'
        }}>AI</div>
        <span style={{ fontSize: 11, fontWeight: 600, color: T.blue, letterSpacing: '0.06em' }}>AI MARKET INSIGHT</span>
        <div style={{ marginLeft: 'auto', display: 'flex', gap: 6 }}>
          <span style={{ fontSize: 10, background: T.tealDim, color: T.teal, padding: '2px 8px', borderRadius: 20, fontWeight: 600 }}>
            YES {(market.outcomePrices[0] * 100).toFixed(0)}%
          </span>
          <span style={{ fontSize: 10, background: T.redDim, color: T.red, padding: '2px 8px', borderRadius: 20, fontWeight: 600 }}>
            NO {(market.outcomePrices[1] * 100).toFixed(0)}%
          </span>
        </div>
      </div>

      {loading ? (
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{
            width: 14, height: 14, borderRadius: '50%',
            border: '2px solid rgba(79,142,255,0.2)',
            borderTop: '2px solid #4f8eff',
            animation: 'spin 0.8s linear infinite',
            flexShrink: 0
          }} />
          <span style={{ color: T.text2, fontSize: 13 }}>Analyzing market conditions...</span>
        </div>
      ) : (
        <p style={{ color: T.text1, fontSize: 13, lineHeight: 1.7, margin: 0 }}>
          {insight}
        </p>
      )}
    </div>
  )
}

function MarketsPage({ prices, selected, setSelected, isMobile }) {
  const selectedLive = prices?.find(m => m.id === selected?.id)

  // Mobile: show full screen chart when market is selected
  if (isMobile && selectedLive) {
    return (
      <div style={{ display: 'flex', flex: 1, flexDirection: 'column', overflow: 'hidden' }}>
        <div style={{ padding: '12px 16px', borderBottom: `1px solid ${T.border}`, background: T.bg1, display: 'flex', alignItems: 'center', gap: 12 }}>
          <button
            onClick={() => setSelected(null)}
            style={{ background: T.bg3, border: 'none', color: T.text1, borderRadius: 8, padding: '6px 12px', cursor: 'pointer', fontSize: 12, fontFamily: T.font }}
          >
            ← Back
          </button>
          <span style={{ fontSize: 13, fontWeight: 600, color: T.text0, flex: 1, lineHeight: 1.4 }}>{selectedLive.question}</span>
        </div>
        <div style={{ flex: 1, padding: '16px', overflowY: 'auto' }}>
          <div style={{ display: 'flex', gap: 10, marginBottom: 16 }}>
            {[
              { label: 'YES', val: Number(selectedLive?.outcomePrices?.[0] ?? 0.5), color: T.teal },
              { label: 'NO', val: selectedLive.outcomePrices[1], color: T.red }
            ].map(item => (
              <div key={item.label} style={{ flex: 1, textAlign: 'center', background: `${item.color}10`, border: `1px solid ${item.color}30`, padding: '10px', borderRadius: 12 }}>
                <div style={{ fontSize: 10, color: item.color, fontWeight: 700 }}>{item.label}</div>
                <div style={{ fontSize: 22, fontWeight: 700, color: item.color, fontFamily: T.mono }}>
                  {(Number(item.val ?? 0.5) * 100).toFixed(0)}%
                </div>
              </div>
            ))}
          </div>
          <div style={{ fontSize: 10, color: T.text2, marginBottom: 8, letterSpacing: '0.08em' }}>LIVE PROBABILITY CHART</div>
          <Chart market={selectedLive} />
          <AIInsights market={selectedLive} />
        </div>
      </div>
    )
  }

  return (
    <div style={{ display: 'flex', flex: 1, overflow: 'hidden', flexDirection: isMobile ? 'column' : 'row' }}>
      <div style={{
        width: isMobile ? '100%' : 300,
        borderRight: isMobile ? 'none' : `1px solid ${T.border}`,
        borderBottom: isMobile ? `1px solid ${T.border}` : 'none',
        display: 'flex', flexDirection: 'column', background: T.bg1,
        flex: isMobile ? 'none' : undefined,
      }}>
        <div style={{ padding: '14px 16px', borderBottom: `1px solid ${T.border}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{ width: 7, height: 7, borderRadius: '50%', background: T.red, boxShadow: `0 0 5px ${T.red}` }} />
            <span style={{ fontSize: 13, fontWeight: 600, color: T.text0 }}>Live Crypto Markets</span>
          </div>
          <Badge color={T.purple}>{prices?.length || 0} active</Badge>
        </div>
        <div style={{ overflowY: 'auto', flex: 1, maxHeight: isMobile ? 340 : undefined }}>
          {prices?.map(market => {
            const rawYes = market?.outcomePrices?.[0]
            const yesPrice = typeof rawYes === "number" ? rawYes : Number(rawYes) || 0.5
            const yes = (yesPrice * 100).toFixed(0)
            const change = market.change || "+0.0%"
            const isUp = change.startsWith('+')
            const isSelected = selected?.id === market.id
            return (
              <div key={market.id} onClick={() => setSelected(market)}
                style={{ padding: '14px 16px', borderBottom: `1px solid ${T.border}`, cursor: 'pointer', background: isSelected ? T.bg3 : 'transparent', borderLeft: `3px solid ${isSelected ? T.blue : 'transparent'}`, transition: 'background 0.15s' }}
                onMouseEnter={e => { if (!isSelected) e.currentTarget.style.background = T.bgHover }}
                onMouseLeave={e => { if (!isSelected) e.currentTarget.style.background = 'transparent' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                  <div style={{ fontSize: 12.5, lineHeight: 1.4, color: isSelected ? T.text0 : T.text1, flex: 1, paddingRight: 8 }}>{market.question}</div>
                  <Badge color={T.blue}>{market.timeframe}</Badge>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: 18, fontWeight: 700, color: parseFloat(yes) > 50 ? T.teal : T.red, fontFamily: T.mono }}>{yes}%</span>
                  <span style={{ fontSize: 11, color: isUp ? T.teal : T.red, background: isUp ? T.tealDim : T.redDim, padding: '3px 8px', borderRadius: 6 }}>{change}</span>
                </div>
                <div style={{ marginTop: 6, fontSize: 11, color: T.text2 }}>Vol ${(market.volume / 1000).toFixed(0)}K</div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Desktop chart panel - only show when not mobile */}
      {!isMobile && (
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
          {selectedLive ? (
            <>
              <div style={{ padding: '16px 24px', borderBottom: `1px solid ${T.border}`, background: T.bg1, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
                <div>
                  <div style={{ fontSize: 15, fontWeight: 600, color: T.text0 }}>{selectedLive.question}</div>
                  <div style={{ fontSize: 11, color: T.text2, marginTop: 3, display: 'flex', alignItems: 'center', gap: 6 }}>
                    <Icon name="clock" size={11} color={T.text2} /> {selectedLive.timeframe} · Polymarket Crypto
                  </div>
                </div>
                <div style={{ display: 'flex', gap: 10 }}>
                  {[
                    { label: 'YES', val: Number(selectedLive?.outcomePrices?.[0] ?? 0.5), color: T.teal },
                    { label: 'NO', val: selectedLive.outcomePrices[1], color: T.red }
                  ].map(item => (
                    <div key={item.label} style={{ textAlign: 'center', background: `${item.color}10`, border: `1px solid ${item.color}30`, padding: '10px 22px', borderRadius: 12, minWidth: 88 }}>
                      <div style={{ fontSize: 10, color: item.color, fontWeight: 700 }}>{item.label}</div>
                      <div style={{ fontSize: 22, fontWeight: 700, color: item.color, fontFamily: T.mono }}>
                        {(Number(item.val ?? 0.5) * 100).toFixed(0)}%
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <div style={{ flex: 1, padding: '24px', overflowY: 'auto' }}>
  <div style={{ fontSize: 10, color: T.text2, marginBottom: 8, letterSpacing: '0.08em' }}>LIVE PROBABILITY CHART</div>
  <Chart market={selectedLive} />
  <AIInsights market={selectedLive} />
</div>
            </>
          ) : (
            <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 14, color: T.text2 }}>
              <div style={{ opacity: 0.4 }}><Icon name="markets" size={48} color={T.text2} /></div>
              <div style={{ fontSize: 14 }}>Select a market to view chart</div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

function DepositsPage({ user, onDepositSuccess, kycStatus }) {
  const [selectedCrypto, setSelectedCrypto] = useState(null)
  const [amount, setAmount] = useState('')
  const [loading, setLoading] = useState(false)

  if (kycStatus !== 'approved') return <LockedPage title="Deposits" />

  const cryptos = [
    { symbol: 'BTC', name: 'Bitcoin', logo: 'https://cryptologos.cc/logos/bitcoin-btc-logo.png', address: 'bc1qxy2kdyz3f3y3f3y3f3y3f3y3f3y3f3y3f', color: '#f7931a' },
    { symbol: 'ETH', name: 'Ethereum', logo: 'https://cryptologos.cc/logos/ethereum-eth-logo.png', address: '0x742d35Cc6634C0532925a3b844Bc454e4438f44e', color: '#627eea' },
    { symbol: 'USDT', name: 'Tether', logo: 'https://cryptologos.cc/logos/tether-usdt-logo.png', address: '0x742d35Cc6634C0532925a3b844Bc454e4438f44e', color: '#26a17b' },
    { symbol: 'USDC', name: 'USD Coin', logo: 'https://cryptologos.cc/logos/usd-coin-usdc-logo.png', address: '0x742d35Cc6634C0532925a3b844Bc454e4438f44e', color: '#2775ca' },
  ]

  const handleDeposit = async () => {
  if (!amount || !user) return

  setLoading(true)

  try {
    const depositAmount = parseFloat(amount)

    const { error: txError } = await supabase
      .from('transactions')
      .insert({
        user_id: user.id,
        type: 'deposit',
        crypto: selectedCrypto.symbol,
        amount: depositAmount,
        status: 'completed',
      })

    if (txError) throw txError

    const { error: rpcError } = await supabase.rpc('increment_balance', {
      user_id: user.id,
      amount: depositAmount
    })

    if (rpcError) throw rpcError

    onDepositSuccess({
      id: Date.now(),
      crypto: selectedCrypto.symbol,
      amount: depositAmount,
      status: 'Completed',
      created_at: new Date().toISOString(),
    })

    setSelectedCrypto(null)
    setAmount('')
  } catch (err) {
    console.error(err)
    alert("Deposit failed")
  }

  setLoading(false)
}

  return (
    <div style={{ padding: '28px', overflowY: 'auto', flex: 1 }}>
      <h2 style={{ color: T.text0, margin: '0 0 4px', fontSize: 20, fontWeight: 700 }}>Deposit Funds</h2>
      <p style={{ color: T.text2, margin: '0 0 24px', fontSize: 13 }}>Choose a crypto asset to deposit</p>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16 }}>
        {cryptos.map(c => (
          <div key={c.symbol} onClick={() => setSelectedCrypto(c)}
            style={{ background: T.bgCard, padding: '24px 20px', borderRadius: 16, textAlign: 'center', cursor: 'pointer', border: `1px solid ${T.border}`, transition: 'all 0.2s' }}
            onMouseEnter={e => { e.currentTarget.style.border = `1px solid ${c.color}50`; e.currentTarget.style.background = T.bgHover }}
            onMouseLeave={e => { e.currentTarget.style.border = `1px solid ${T.border}`; e.currentTarget.style.background = T.bgCard }}>
            <img src={c.logo} alt={c.symbol} style={{ width: 56, height: 56, objectFit: 'contain' }} onError={e => e.target.style.display = 'none'} />
            <div style={{ marginTop: 14, fontWeight: 700, color: T.text0, fontSize: 15 }}>{c.symbol}</div>
            <div style={{ color: T.text2, fontSize: 12, marginTop: 3 }}>{c.name}</div>
          </div>
        ))}
      </div>
      {selectedCrypto && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.88)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div style={{ background: T.bg2, padding: 32, borderRadius: 22, width: '92%', maxWidth: 460, position: 'relative', border: `1px solid ${T.borderHi}` }}>
            <button onClick={() => { setSelectedCrypto(null); setAmount('') }} style={{ position: 'absolute', top: 20, right: 20, background: T.bg3, border: 'none', color: T.text1, borderRadius: 8, width: 32, height: 32, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Icon name="close" size={14} />
            </button>
            <h3 style={{ color: T.text0, margin: '0 0 20px', fontSize: 18 }}>Deposit {selectedCrypto.name}</h3>
            <div style={{ background: T.bg3, borderRadius: 14, padding: 20, textAlign: 'center', marginBottom: 20 }}>
              <div style={{ fontSize: 12, color: T.text2, marginBottom: 8 }}>Send only {selectedCrypto.symbol} to this address</div>
              <div style={{ width: 140, height: 140, margin: '0 auto 12px', background: '#fff', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, color: '#333', fontWeight: 600 }}>QR Code</div>
              <div style={{ fontSize: 11, color: T.text1, wordBreak: 'break-all', fontFamily: T.mono }}>{selectedCrypto.address}</div>
            </div>
            <div style={{ display: 'flex', gap: 10, marginBottom: 20 }}>
              <input type="number" value={amount} onChange={e => setAmount(e.target.value)} placeholder="0.00"
                style={{ flex: 1, background: T.bg3, border: `1px solid ${T.border}`, borderRadius: 10, padding: '13px 14px', color: T.text0, fontSize: 16, fontFamily: T.mono, outline: 'none' }} />
              <div style={{ background: T.bg3, border: `1px solid ${T.border}`, borderRadius: 10, padding: '13px 16px', color: T.text1, fontWeight: 700 }}>{selectedCrypto.symbol}</div>
            </div>
            <button onClick={handleDeposit} disabled={!amount || loading}
              style={{ width: '100%', padding: '14px', background: amount && !loading ? T.teal : T.bg3, color: amount && !loading ? '#0d0e14' : T.text2, border: 'none', borderRadius: 12, fontSize: 14, fontWeight: 700, cursor: amount && !loading ? 'pointer' : 'not-allowed', fontFamily: T.font }}>
              {loading ? 'Processing...' : 'Confirm Deposit'}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

function CopyTradingPage({ kycStatus }) {
  const [searchTerm, setSearchTerm] = useState('')
  const [copying, setCopying] = useState(() => {
    try { return JSON.parse(localStorage.getItem('copyingTraders') || '[]') } catch { return [] }
  })

  const toggleCopy = (name) => {
    setCopying(prev => {
      const next = prev.includes(name) ? prev.filter(n => n !== name) : [...prev, name]
      localStorage.setItem('copyingTraders', JSON.stringify(next))
      return next
    })
  }

  if (kycStatus !== 'approved') return <LockedPage title="Copy Trading" />
  const traders = [
    { name: "beachboy4", profit: "+$3,660,645", winRate: "87%", followers: "12.4K", rank: 1 },
    { name: "HorizonSplendidView", profit: "+$4,016,108", winRate: "91%", followers: "8.9K", rank: 2 },
    { name: "reachingthesky", profit: "+$3,742,635", winRate: "84%", followers: "6.2K", rank: 3 },
    { name: "majorexploiter", profit: "+$2,416,975", winRate: "79%", followers: "4.1K", rank: 4 },
    { name: "Theo4", profit: "+$2,053,953", winRate: "89%", followers: "15.7K", rank: 5 },
    { name: "Fredi9999", profit: "+$1,983,898", winRate: "73%", followers: "9.3K", rank: 6 },
  ]
  const filtered = traders.filter(t => t.name.toLowerCase().includes(searchTerm.toLowerCase()))
  return (
    <div style={{ padding: '28px', overflowY: 'auto', flex: 1 }}>
      <h2 style={{ color: T.text0, margin: '0 0 4px', fontSize: 20, fontWeight: 700 }}>Copy Trading</h2>
      <p style={{ color: T.text2, margin: '0 0 24px', fontSize: 13 }}>Follow successful Polymarket crypto traders</p>
      <div style={{ position: 'relative', marginBottom: 24 }}>
        <div style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)' }}><Icon name="search" size={15} color={T.text2} /></div>
        <input type="text" placeholder="Search traders..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)}
          style={{ width: '100%', padding: '12px 16px 12px 42px', background: T.bgCard, border: `1px solid ${T.border}`, borderRadius: 12, color: T.text0, fontSize: 13, outline: 'none', boxSizing: 'border-box', fontFamily: T.font }} />
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 16 }}>
        {filtered.map((trader, i) => (
          <div key={i} style={{ background: T.bgCard, borderRadius: 16, border: `1px solid ${T.border}`, padding: '20px 22px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{ width: 38, height: 38, borderRadius: 10, background: `${T.purple}20`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 15, fontWeight: 700, color: T.purple }}>{trader.name[0].toUpperCase()}</div>
                <div style={{ fontSize: 14, fontWeight: 700, color: T.text0 }}>{trader.name}</div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                <Icon name="star" size={12} color={T.yellow} />
                <span style={{ fontSize: 11, fontWeight: 600, color: T.yellow }}>#{trader.rank}</span>
              </div>
            </div>
            <div style={{ color: T.teal, fontSize: 20, fontWeight: 700, fontFamily: T.mono, marginBottom: 6 }}>{trader.profit}</div>
            <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
              <Badge color={T.blue}>{trader.winRate} win rate</Badge>
              <Badge color={T.purple}>{trader.followers} followers</Badge>
            </div>
            <button
  onClick={() => toggleCopy(trader.name)}
  style={{
    width: '100%', padding: '11px',
    background: copying.includes(trader.name) ? T.teal : T.tealDim,
    color: copying.includes(trader.name) ? '#0d0e14' : T.teal,
    border: `1px solid ${T.teal}30`, borderRadius: 10, fontWeight: 600,
    fontSize: 13, cursor: 'pointer', display: 'flex', alignItems: 'center',
    justifyContent: 'center', gap: 6, fontFamily: T.font
  }}
  onMouseEnter={e => { e.currentTarget.style.background = copying.includes(trader.name) ? T.tealDim : T.teal; e.currentTarget.style.color = copying.includes(trader.name) ? T.teal : '#0d0e14' }}
  onMouseLeave={e => { e.currentTarget.style.background = copying.includes(trader.name) ? T.teal : T.tealDim; e.currentTarget.style.color = copying.includes(trader.name) ? '#0d0e14' : T.teal }}
>
  <Icon name="copy" size={13} />
  {copying.includes(trader.name) ? 'Copying Trades ✓' : 'Copy Trader'}
</button>
          </div>
        ))}
      </div>
    </div>
  )
}

export default function App() {
  const INITIAL_MARKETS = [
    { id: 1,  question: "Will BTC be above $70K in 5 minutes?",    timeframe: "5m", outcomePrices: [0.62, 0.38], volume: 124000 },
    { id: 2,  question: "Will ETH be above $3K in 5 minutes?",     timeframe: "5m", outcomePrices: [0.48, 0.52], volume: 89000  },
    { id: 3,  question: "Will SOL be above $150 in 5 minutes?",    timeframe: "5m", outcomePrices: [0.71, 0.29], volume: 56000  },
    { id: 4,  question: "Will BNB be above $400 in 5 minutes?",    timeframe: "5m", outcomePrices: [0.55, 0.45], volume: 43000  },
    { id: 5,  question: "Will MATIC be above $1 in 5 minutes?",    timeframe: "5m", outcomePrices: [0.38, 0.62], volume: 31000  },
    { id: 6,  question: "Will DOGE be above $0.15 in 5 minutes?",  timeframe: "5m", outcomePrices: [0.44, 0.56], volume: 67000  },
    { id: 7,  question: "Will AVAX be above $30 in 5 minutes?",    timeframe: "5m", outcomePrices: [0.59, 0.41], volume: 28000  },
    { id: 8,  question: "Will LINK be above $15 in 5 minutes?",    timeframe: "5m", outcomePrices: [0.66, 0.34], volume: 19000  },
    { id: 9,  question: "Will XRP be above $0.60 in 5 minutes?",   timeframe: "5m", outcomePrices: [0.73, 0.27], volume: 92000  },
    { id: 10, question: "Will ADA be above $0.45 in 5 minutes?",   timeframe: "5m", outcomePrices: [0.41, 0.59], volume: 35000  },
  ]
  const [markets, setMarkets] = useState(INITIAL_MARKETS);

  useEffect(() => {
    const interval = setInterval(() => {
      setMarkets(prev => prev.map(m => {
        const current = m.outcomePrices[0]
        const change = (Math.random() - 0.5) * 0.06
        const newYes = Math.min(0.97, Math.max(0.03, current + change))
        const newNo = parseFloat((1 - newYes).toFixed(4))
        const pctChange = ((newYes - current) * 100).toFixed(1)
        return {
          ...m,
          outcomePrices: [newYes, newNo],
          change: `${pctChange >= 0 ? '+' : ''}${pctChange}%`,
          volume: m.volume + Math.floor(Math.random() * 500)
        }
      }))
    }, 3000)
    return () => clearInterval(interval)
  }, [])
  const [transactions, setTransactions] = useState([])
  const [loading, setLoading] = useState(true)
  const [showLanding, setShowLanding] = useState(true)
  const [view, setView] = useState('dashboard')
  const [collapsed, setCollapsed] = useState(window.innerWidth < 768)
const [isMobile, setIsMobile] = useState(window.innerWidth < 768)

useEffect(() => {
  const handleResize = () => {
    const mobile = window.innerWidth < 768
    setIsMobile(mobile)
    if (mobile) setCollapsed(true)
  }
  window.addEventListener('resize', handleResize)
  return () => window.removeEventListener('resize', handleResize)
}, [])

useEffect(() => {
  const handleResize = () => {
    const mobile = window.innerWidth < 768
    setIsMobile(mobile)
    setCollapsed(mobile)
  }
  window.addEventListener('resize', handleResize)
  return () => window.removeEventListener('resize', handleResize)
}, [])
  const [selected, setSelected] = useState(null)
  const [user, setUser] = useState(null)
  const [profile, setProfile] = useState(null)
  const [kycStatus, setKycStatus] = useState(null)
  const [balance, setBalance] = useState(0)

  useEffect(() => {
  let mounted = true

  const initAuth = async () => {
  try {
    const { data, error } = await supabase.auth.getSession()
    if (error) console.error("Session error:", error)

    if (mounted) {
      if (data?.session?.user) {
        setUser(data.session.user)
        await loadUserData(data.session.user.id)
        setShowLanding(false)
      } else {
        setShowLanding(true)
      }
    }
  } catch (err) {
    console.error("Auth crash:", err)
    if (mounted) setShowLanding(true)
  } finally {
    if (mounted) setLoading(false)
  }
}

  initAuth()

  const { data: listener } = supabase.auth.onAuthStateChange(
    (_event, session) => {
      if (!session?.user) {
        setUser(null)
        setShowLanding(true)
        setLoading(false)
      }
    }
  )

  return () => {
    mounted = false
    listener?.subscription?.unsubscribe()
  }
}, [])

  const loadUserData = async (userId) => {
  try {
    const { data: profileData } = await supabase
      .from('profiles')
      .select('balance, role')
      .eq('id', userId)
      .maybeSingle()

    setProfile(profileData)
    setBalance(profileData?.balance ?? 0)

    const { data: kycData } = await supabase
      .from('kyc_documents')
      .select('status')
      .eq('user_id', userId)
      .order('submitted_at', { ascending: false })
      .limit(1)
      .maybeSingle()

    setKycStatus(kycData?.status ?? 'not_started')

    const { data: txData } = await supabase
      .from('transactions')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })

    setTransactions(txData ?? [])
  } catch (e) {
    console.warn('loadUserData failed:', e.message)
    setKycStatus('not_started')
    setBalance(0)
    setTransactions([])
  }
}

  const handleLogin = async (u) => {
    setUser(u)
    await loadUserData(u.id)
    setShowLanding(false)
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
    setUser(null)
    setKycStatus(null)
    setBalance(0)
    setTransactions([])
    setShowLanding(true)
  }

  const handleDepositSuccess = (newTx) => {
  setBalance(prev => Number(prev) + Number(newTx.amount))
  setTransactions(prev => [newTx, ...prev])
}

  if (loading) {
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      height: '100vh',
      background: '#0d0e14',
      gap: 16,
    }}>
      <div style={{
        width: 40,
        height: 40,
        borderRadius: '50%',
        border: `3px solid rgba(255,255,255,0.08)`,
        borderTop: `3px solid #00d4aa`,
        animation: 'spin 0.8s linear infinite',
      }} />
      <div style={{ color: '#4a4d62', fontSize: 13, fontFamily: '"DM Sans", system-ui, sans-serif' }}>
        Loading...
      </div>
      <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
    </div>
  )
}

  if (showLanding) return <Auth onLogin={handleLogin} />

  const NAV_ITEMS = [
  { id: 'dashboard', label: 'Dashboard', icon: 'dashboard' },
  { id: 'markets', label: 'Markets', icon: 'markets' },
  { id: 'copy', label: 'Copy Trade', icon: 'users', locked: kycStatus !== 'approved' },
  { id: 'deposits', label: 'Deposits', icon: 'deposit', locked: kycStatus !== 'approved' },

  ...(user && profile?.role === 'admin'
    ? [{ id: 'admin', label: 'Admin Panel', icon: 'shield' }]
    : [])
];

  const BOTTOM_ITEMS = [
    { id: 'profile',  label: 'Profile',  icon: 'profile'  },
    { id: 'settings', label: 'Settings', icon: 'settings' },
    { id: 'withdraw', label: 'Withdraw', icon: 'withdraw', locked: kycStatus !== 'approved' },
  ]

  const renderPage = () => {
   if (view === 'dashboard') 
  return <DashboardPage 
    user={user} 
    balance={balance} 
    transactions={transactions} 
    kycStatus={kycStatus}
    markets={markets}
  />
    if (view === 'markets') {
  return (
    <MarketsPage 
      prices={markets} 
      selected={selected} 
      setSelected={setSelected}
      isMobile={isMobile}
    />
  )
}
    if (view === 'copy')      return <CopyTradingPage kycStatus={kycStatus} />
    if (view === 'deposits')  return <DepositsPage user={user} onDepositSuccess={handleDepositSuccess} kycStatus={kycStatus} />
    if (view === 'profile')   return <Profile user={user} kycStatus={kycStatus} onKycUpdate={status => setKycStatus(status)} />
    if (view === 'admin')     return <AdminKYCReview />
    
    return (
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 14, color: T.text2 }}>
        <Icon name={BOTTOM_ITEMS.find(i => i.id === view)?.icon || 'dashboard'} size={40} color={T.text2} />
        <div style={{ fontSize: 14, textTransform: 'capitalize' }}>{view} Page</div>
      </div>
    )
  }

  const NavItem = ({ item }) => {
    const active = view === item.id
    return (
      <div onClick={() => setView(item.id)} title={collapsed ? item.label : ''}
        style={{ display: 'flex', alignItems: 'center', gap: 10, padding: collapsed ? '10px' : '10px 14px', justifyContent: collapsed ? 'center' : 'flex-start', borderRadius: 10, marginBottom: 2, cursor: 'pointer', background: active ? T.bg3 : 'transparent', borderLeft: active && !collapsed ? `2px solid ${T.blue}` : '2px solid transparent', transition: 'all 0.15s' }}
        onMouseEnter={e => { if (!active) e.currentTarget.style.background = T.bgHover }}
        onMouseLeave={e => { if (!active) e.currentTarget.style.background = 'transparent' }}>
        <Icon name={item.icon} size={16} color={active ? T.blue : item.locked ? T.text2 : T.text1} />
        {!collapsed && <span style={{ fontSize: 13, fontWeight: active ? 600 : 400, color: active ? T.text0 : item.locked ? T.text2 : T.text1, flex: 1 }}>{item.label}</span>}
        {!collapsed && item.locked && <Icon name="lock" size={11} color={T.yellow} />}
      </div>
    )
  }

  return (
    <div style={{ display: 'flex', height: '100vh', background: T.bg0, color: T.text0, fontFamily: T.font, overflow: 'hidden' }}>
      <div style={{ width: collapsed ? 60 : 220, borderRight: `1px solid ${T.border}`, background: T.bg1, display: 'flex', flexDirection: 'column', transition: 'width 0.25s ease', flexShrink: 0 }}>
        <div style={{ padding: collapsed ? '18px 12px' : '18px 16px', borderBottom: `1px solid ${T.border}`, display: 'flex', alignItems: 'center', gap: 10, justifyContent: collapsed ? 'center' : 'space-between' }}>
          {!collapsed && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{ width: 32, height: 32, borderRadius: 9, background: 'linear-gradient(135deg, #4f8eff, #9b7dff)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: 14, color: '#fff' }}>P</div>
              <div>
                <div style={{ fontSize: 14, fontWeight: 700, color: T.text0, lineHeight: 1 }}>PolyTrader</div>
                <div style={{ fontSize: 9, color: T.text2, letterSpacing: '0.05em' }}>PREDICTION MARKETS</div>
              </div>
            </div>
          )}
          {collapsed && <div style={{ width: 32, height: 32, borderRadius: 9, background: 'linear-gradient(135deg, #4f8eff, #9b7dff)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: 14, color: '#fff' }}>P</div>}
          <div onClick={() => setCollapsed(!collapsed)} style={{ cursor: 'pointer', padding: 4, borderRadius: 6 }}>
            <Icon name="menu" size={16} color={T.text2} />
          </div>
        </div>

        {!collapsed && kycStatus && kycStatus !== 'approved' && (
          <div onClick={() => setView('profile')} style={{ margin: '10px 10px 0', background: T.yellowDim, border: `1px solid ${T.yellow}30`, borderRadius: 8, padding: '8px 12px', display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
            <Icon name="shield" size={12} color={T.yellow} />
            <span style={{ fontSize: 11, color: T.yellow, fontWeight: 600 }}>KYC {kycStatus === 'pending' ? 'Pending' : 'Required'} →</span>
          </div>
        )}
        {!collapsed && kycStatus === 'approved' && (
          <div style={{ margin: '10px 10px 0', background: T.tealDim, border: `1px solid ${T.teal}30`, borderRadius: 8, padding: '8px 12px', display: 'flex', alignItems: 'center', gap: 8 }}>
            <Icon name="shield" size={12} color={T.teal} />
            <span style={{ fontSize: 11, color: T.teal, fontWeight: 600 }}>KYC Verified ✓</span>
          </div>
        )}

        <div style={{ flex: 1, padding: '12px 8px', overflowY: 'auto' }}>
          {!collapsed && <div style={{ fontSize: 9, color: T.text2, letterSpacing: '0.1em', padding: '8px 8px 6px', textTransform: 'uppercase' }}>Main</div>}
          {NAV_ITEMS.map(item => <NavItem key={item.id} item={item} />)}
          <div style={{ height: 1, background: T.border, margin: '10px 8px' }} />
          {!collapsed && <div style={{ fontSize: 9, color: T.text2, letterSpacing: '0.1em', padding: '4px 8px 6px', textTransform: 'uppercase' }}>Account</div>}
          {BOTTOM_ITEMS.map(item => <NavItem key={item.id} item={item} />)}
        </div>

        <div style={{ padding: '12px 8px', borderTop: `1px solid ${T.border}` }}>
          <div onClick={handleLogout}
            style={{ display: 'flex', alignItems: 'center', gap: 10, padding: collapsed ? '10px' : '10px 14px', justifyContent: collapsed ? 'center' : 'flex-start', borderRadius: 10, cursor: 'pointer', color: T.text2, transition: 'all 0.15s' }}
            onMouseEnter={e => { e.currentTarget.style.background = T.redDim; e.currentTarget.style.color = T.red }}
            onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = T.text2 }}>
            <Icon name="logout" size={16} />
            {!collapsed && <span style={{ fontSize: 13 }}>Log out</span>}
          </div>
        </div>
      </div>

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        <div style={{ padding: '0 24px', height: 52, borderBottom: `1px solid ${T.border}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: T.bg1, flexShrink: 0 }}>
          <div style={{ fontSize: 13, fontWeight: 600, color: T.text0, textTransform: 'capitalize', display: 'flex', alignItems: 'center', gap: 8 }}>
            <Icon name={NAV_ITEMS.find(i => i.id === view)?.icon || BOTTOM_ITEMS.find(i => i.id === view)?.icon || 'dashboard'} size={14} color={T.blue} />
            {view}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ fontFamily: T.mono, fontSize: 13, fontWeight: 700, color: T.teal }}>
              ${(Number(balance) || 0).toFixed(2)}
            </div>
            <Icon name="bell" size={16} color={T.text2} />
            <div onClick={() => setView('profile')} style={{ width: 30, height: 30, borderRadius: 8, background: `${T.purple}20`, border: `1px solid ${T.purple}30`, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
              <Icon name="profile" size={14} color={T.purple} />
            </div>
          </div>
        </div>
        <div style={{ flex: 1, overflow: 'auto', display: 'flex', flexDirection: 'column' }}>
          {renderPage()}
        </div>
      </div>
    </div>
  )
}
