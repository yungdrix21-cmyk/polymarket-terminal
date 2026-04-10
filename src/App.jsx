import { supabase } from './lib/supabase'
import Auth from './components/Auth'
import Legal from './pages/Legal'
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
  mono: '"Manrope", "DM Mono", "Fira Code", monospace',
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
    chevronDown: <><polyline points="6 9 12 15 18 9"/></>,
    chevronRight: <><polyline points="9 18 15 12 9 6"/></>,
    edit:      <><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></>,
    check:     <><polyline points="20 6 9 17 4 12"/></>,
    x:         <><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></>,
  }
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">
      {paths[name] || null}
    </svg>
  )
}
const fmt = (n) => '$' + Number(n).toLocaleString('en-US', { maximumFractionDigits: 0 })

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
    <div style={{ overflowX: 'auto', marginTop: 12, background: 'rgba(255,255,255,0.02)', borderRadius: 16, padding: '12px 8px', border: '1px solid rgba(255,255,255,0.06)' }}>
      <svg width={totalW} height={chartH + volH + 28} style={{ display: 'block' }}>
        <defs>
          <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={isOverallUp ? '#00d4aa' : '#ff4d6a'} stopOpacity="0.15" />
            <stop offset="100%" stopColor={isOverallUp ? '#00d4aa' : '#ff4d6a'} stopOpacity="0" />
          </linearGradient>
        </defs>
        {[0.2, 0.4, 0.6, 0.8].map((v, i) => (
          <g key={i}>
            <line x1={0} y1={scaleP(minP + (maxP - minP) * v)} x2={totalW} y2={scaleP(minP + (maxP - minP) * v)} stroke="rgba(255,255,255,0.04)" strokeWidth={1} strokeDasharray="3,6" />
            <text x={4} y={scaleP(minP + (maxP - minP) * v) - 3} fill="rgba(255,255,255,0.2)" fontSize={9} fontFamily="monospace">
              {((minP + (maxP - minP) * v) * 100).toFixed(0)}%
            </text>
          </g>
        ))}
        <polygon points={`${candles.map((c, i) => `${i * W + W / 2},${scaleP(c.close)}`).join(' ')} ${(candles.length - 1) * W + W / 2},${chartH} 0,${chartH}`} fill="url(#areaGrad)" />
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
          {kycStatus === 'pending' ? ' KYC Verification Pending' : ' KYC Required'}
        </div>
        <div style={{ color: T.text1, fontSize: 12, marginTop: 2 }}>
          {kycStatus === 'pending'
            ? 'Your documents are under review (1-2 business days). Deposits and trading are locked until approved.'
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
        <div style={{ fontSize: 13, color: T.text1, maxWidth: 300, lineHeight: 1.6 }}>Complete KYC verification to unlock this feature.</div>
      </div>
      <div style={{ background: T.yellowDim, border: `1px solid ${T.yellow}30`, borderRadius: 10, padding: '10px 20px' }}>
        <span style={{ fontSize: 12, color: T.yellow, fontWeight: 600 }}>Review takes 1-2 business days</span>
      </div>
    </div>
  )
}
// --- ADMIN: KYC REVIEW -------------------------------------------------------
function AdminKYCPage() {
  const [submissions, setSubmissions] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const load = async () => {
      const { data, error } = await supabase
        .from('kyc_documents')
        .select(`
  id, user_id, status, document_type, submitted_at, file_url,
  profiles ( first_name, last_name )
`)
        .eq('status', 'pending')
        .order('submitted_at', { ascending: false })

      if (error) { console.error(error); setLoading(false); return }

      const userIds = (data || []).map(d => d.user_id)
      let emailMap = {}
      if (userIds.length > 0) {
        const { data: emailData } = await supabase
          .from('profiles_with_email')
          .select('id, email')
          .in('id', userIds)
        if (emailData) emailData.forEach(e => { emailMap[e.id] = e.email })
      }

      const enriched = (data || []).map(d => ({ ...d, email: emailMap[d.user_id] || null }))
      setSubmissions(enriched)
      setLoading(false)
    }
    load()
  }, [])

  const handleDecision = async (id, userId, decision) => {
    await supabase.from('kyc_documents').update({ status: decision }).eq('id', id)
    setSubmissions(prev => prev.filter(s => s.id !== id))
  }

  return (
    <div style={{ padding: '28px', overflowY: 'auto', flex: 1 }}>
      <h2 style={{ color: T.text0, margin: '0 0 4px', fontSize: 20, fontWeight: 700 }}>KYC Review</h2>
      <p style={{ color: T.text2, margin: '0 0 24px', fontSize: 13 }}>Approve or decline pending identity verifications</p>
      {loading ? (
        <div style={{ color: T.text2, fontSize: 13 }}>Loading...</div>
      ) : submissions.length === 0 ? (
        <div style={{ background: T.bgCard, borderRadius: 16, border: `1px solid ${T.border}`, padding: '40px', textAlign: 'center', color: T.text2, fontSize: 13 }}>
          No pending KYC submissions.
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {submissions.map(sub => (
            <div key={sub.id} style={{ background: T.bgCard, borderRadius: 16, border: `1px solid ${T.border}`, padding: '20px 24px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 12 }}>
                <div>
                  <div style={{ color: T.text0, fontWeight: 600, fontSize: 14 }}>
                    {sub.profiles?.first_name && sub.profiles?.last_name
                      ? `${sub.profiles.first_name} ${sub.profiles.last_name}`
                      : 'Unknown User'}
                  </div>
                  {sub.email && <div style={{ color: T.blue, fontSize: 12, marginTop: 2 }}>{sub.email}</div>}
                  <div style={{ color: T.text2, fontSize: 12, marginTop: 4 }}>
                    Submitted: {sub.submitted_at ? new Date(sub.submitted_at).toLocaleString() : 'N/A'}
                  </div>
                  <div style={{ color: T.text2, fontSize: 12, marginTop: 2 }}>
                    Doc type: {sub.document_type ?? 'N/A'}
                  </div>
                </div>
                <div style={{ display: 'flex', gap: 10 }}>
                  <button onClick={() => handleDecision(sub.id, sub.user_id, 'approved')}
                    style={{ display: 'flex', alignItems: 'center', gap: 6, background: T.tealDim, border: `1px solid ${T.teal}40`, color: T.teal, borderRadius: 10, padding: '9px 18px', cursor: 'pointer', fontWeight: 600, fontSize: 13, fontFamily: T.font }}>
                    <Icon name="check" size={13} color={T.teal} /> Approve
                  </button>
                  <button onClick={() => handleDecision(sub.id, sub.user_id, 'declined')}
                    style={{ display: 'flex', alignItems: 'center', gap: 6, background: T.redDim, border: `1px solid ${T.red}40`, color: T.red, borderRadius: 10, padding: '9px 18px', cursor: 'pointer', fontWeight: 600, fontSize: 13, fontFamily: T.font }}>
                    <Icon name="x" size={13} color={T.red} /> Decline
                  </button>
                </div>
              </div>
              {sub.file_url && (
  <div style={{ marginTop: 14 }}>
    <img
      src={sub.file_url}
      alt="KYC Document"
      onClick={() => window.open(sub.file_url, '_blank')}
      style={{ width: 120, height: 80, objectFit: 'cover', borderRadius: 8, cursor: 'zoom-in', border: `1px solid ${T.border}` }}
      onError={e => e.target.style.display = 'none'}
    />
    <a href={sub.file_url} target="_blank" rel="noreferrer" style={{ display: 'inline-block', marginTop: 6, fontSize: 12, color: T.blue, textDecoration: 'underline', cursor: 'pointer' }}>View Document</a>
  </div>
)}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
// --- ADMIN: DEPOSIT REVIEW ---------------------------------------------------
function AdminDepositsPage() {
  const [deposits, setDeposits] = useState([])
  const [loading, setLoading] = useState(true)
  useEffect(() => {
  const load = async () => {
    const { data } = await supabase
      .from('transactions')
      .select('*, profiles(email)')
      .eq('status', 'pending')
      .eq('type', 'deposit')
      .order('created_at', { ascending: false })
    setDeposits(data ?? [])
    setLoading(false)
  }
  load()

  // Real-time subscription
  const channel = supabase
    .channel('deposits')
    .on('postgres_changes', {
      event: 'INSERT',
      schema: 'public',
      table: 'transactions',
      filter: 'status=eq.pending'
    }, () => { load() })
    .subscribe()

  return () => supabase.removeChannel(channel)
}, [])
  const handleDecision = async (tx, decision) => {
    await supabase.from('transactions').update({ status: decision }).eq('id', tx.id)
    if (decision === 'completed') {
      // Credit balance
      const { data: profile } = await supabase
        .from('profiles')
        .select('balance')
        .eq('id', tx.user_id)
        .single()
      const newBal = (parseFloat(profile?.balance ?? 0) + parseFloat(tx.amount)).toFixed(2)
      await supabase.from('profiles').update({ balance: newBal }).eq('id', tx.user_id)
    }
    setDeposits(prev => prev.filter(d => d.id !== tx.id))
  }
  return (
    <div style={{ padding: '28px', overflowY: 'auto', flex: 1 }}>
      <h2 style={{ color: T.text0, margin: '0 0 4px', fontSize: 20, fontWeight: 700 }}>Transaction Review</h2>
<p style={{ color: T.text2, margin: '0 0 24px', fontSize: 13 }}>Approve or decline pending deposits and withdrawals</p>
      {loading ? (
        <div style={{ color: T.text2, fontSize: 13 }}>Loading...</div>
      ) : deposits.length === 0 ? (
        <div style={{ background: T.bgCard, borderRadius: 16, border: `1px solid ${T.border}`, padding: '40px', textAlign: 'center', color: T.text2, fontSize: 13 }}>
          No pending deposits.
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {deposits.map(tx => (
            <div key={tx.id} style={{ background: T.bgCard, borderRadius: 16, border: `1px solid ${T.border}`, padding: '20px 24px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 12 }}>
                <div>
                  <div style={{ color: T.text0, fontWeight: 600, fontSize: 14 }}>
  {tx.profiles?.first_name && tx.profiles?.last_name
    ? `${tx.profiles.first_name} ${tx.profiles.last_name}`
    : tx.profiles?.email ?? tx.user_id}
</div>
{tx.profiles?.email && (
  <div style={{ color: T.blue, fontSize: 12, marginTop: 2 }}>{tx.profiles.email}</div>
)}

                  <div style={{ fontSize: 11, color: tx.type === 'withdrawal' ? T.red : T.teal, marginTop: 2, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{tx.type}</div> 
                  {tx.wallet_address && <div style={{ fontSize: 11, color: T.text2, marginTop: 4, fontFamily: T.mono }}>To: {tx.wallet_address.slice(0,16)}...</div>}
                  <div style={{ display: 'flex', gap: 10, marginTop: 8, flexWrap: 'wrap' }}>
                    <Badge color={T.teal}>{tx.crypto}</Badge>
                    <Badge color={T.yellow}>Pending</Badge>
                  </div>
                  <div style={{ color: T.text2, fontSize: 12, marginTop: 6 }}>
                    Submitted: {new Date(tx.created_at).toLocaleString()}
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ color: T.teal, fontWeight: 700, fontSize: 22, fontFamily: T.mono }}>
                    {fmt(tx.amount)}
                  </div>
                  <div style={{ display: 'flex', gap: 10, marginTop: 10 }}>
                    <button onClick={() => handleDecision(tx, 'completed')}
                      style={{ display: 'flex', alignItems: 'center', gap: 6, background: T.tealDim, border: `1px solid ${T.teal}40`, color: T.teal, borderRadius: 10, padding: '9px 18px', cursor: 'pointer', fontWeight: 600, fontSize: 13, fontFamily: T.font }}>
                      <Icon name="check" size={13} color={T.teal} /> Approve
                    </button>
                    <button onClick={() => handleDecision(tx, 'declined')}
                      style={{ display: 'flex', alignItems: 'center', gap: 6, background: T.redDim, border: `1px solid ${T.red}40`, color: T.red, borderRadius: 10, padding: '9px 18px', cursor: 'pointer', fontWeight: 600, fontSize: 13, fontFamily: T.font }}>
                      <Icon name="x" size={13} color={T.red} /> Decline
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
// --- ADMIN: EDIT BALANCE -----------------------------------------------------
function AdminBalancePage() {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState({}) // userId -> new balance string
  const [saving, setSaving] = useState({})
  const [saved, setSaved] = useState({})
  useEffect(() => {
    const load = async () => {
      const { data } = await supabase
  .from('profiles_with_email')
  .select('id, email, balance, role')
  .order('email', { ascending: true })
      setUsers(data ?? [])
      setLoading(false)
    }
    load()
  }, [])
  const handleSave = async (userId) => {
    const val = editing[userId]
    if (val === undefined || val === '') return
    setSaving(prev => ({ ...prev, [userId]: true }))
    await supabase.from('profiles').update({ balance: parseFloat(val) }).eq('id', userId)
    setUsers(prev => prev.map(u => u.id === userId ? { ...u, balance: parseFloat(val) } : u))
    setSaving(prev => ({ ...prev, [userId]: false }))
    setSaved(prev => ({ ...prev, [userId]: true }))
    setTimeout(() => setSaved(prev => ({ ...prev, [userId]: false })), 2000)
    setEditing(prev => { const n = { ...prev }; delete n[userId]; return n })
  }
  return (
    <div style={{ padding: '28px', overflowY: 'auto', flex: 1 }}>
      <h2 style={{ color: T.text0, margin: '0 0 4px', fontSize: 20, fontWeight: 700 }}> Edit Balance</h2>
      <p style={{ color: T.text2, margin: '0 0 24px', fontSize: 13 }}>Manually adjust any user's account balance</p>
      {loading ? (
        <div style={{ color: T.text2, fontSize: 13 }}>Loading users...</div>
      ) : (
        <div style={{ background: T.bgCard, borderRadius: 16, border: `1px solid ${T.border}`, overflow: 'hidden' }}>
          <div style={{ padding: '14px 24px', borderBottom: `1px solid ${T.border}`, display: 'flex', gap: 24 }}>
            <span style={{ fontSize: 11, color: T.text2, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em', flex: 2 }}>User</span>
            <span style={{ fontSize: 11, color: T.text2, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em', flex: 1 }}>Current Balance</span>
            <span style={{ fontSize: 11, color: T.text2, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em', flex: 2 }}>Set New Balance</span>
          </div>
          {users.map((u, i) => (
            <div key={u.id} style={{ display: 'flex', alignItems: 'center', gap: 24, padding: '14px 24px', borderBottom: i < users.length - 1 ? `1px solid ${T.border}` : 'none' }}
              onMouseEnter={e => e.currentTarget.style.background = T.bgHover}
              onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
              <div style={{ flex: 2 }}>
                <div style={{ color: T.text0, fontSize: 13, fontWeight: 500 }}>{u.email}</div>
                {u.role === 'admin' && <Badge color={T.purple}>Admin</Badge>}
              </div>
              <div style={{ flex: 1, color: T.teal, fontWeight: 700, fontFamily: T.mono, fontSize: 14 }}>
                {fmt(u.balance ?? 0)}
              </div>
              <div style={{ flex: 2, display: 'flex', gap: 8, alignItems: 'center' }}>
                <input
                  type="number"
                  value={editing[u.id] ?? ''}
                  onChange={e => setEditing(prev => ({ ...prev, [u.id]: e.target.value }))}
                  placeholder={Number(u.balance ?? 0).toFixed(2)}
                  style={{ flex: 1, background: T.bg3, border: `1px solid ${T.border}`, borderRadius: 8, padding: '8px 12px', color: T.text0, fontSize: 13, fontFamily: T.mono, outline: 'none', minWidth: 0 }}
                />
                <button
                  onClick={() => handleSave(u.id)}
                  disabled={editing[u.id] === undefined || editing[u.id] === '' || saving[u.id]}
                  style={{
                    background: saved[u.id] ? T.tealDim : (editing[u.id] !== undefined && editing[u.id] !== '') ? T.teal : T.bg3,
                    border: `1px solid ${saved[u.id] ? T.teal : T.border}`,
                    color: saved[u.id] ? T.teal : (editing[u.id] !== undefined && editing[u.id] !== '') ? '#0d0e14' : T.text2,
                    borderRadius: 8, padding: '8px 14px', cursor: 'pointer', fontWeight: 600, fontSize: 12, fontFamily: T.font,
                    display: 'flex', alignItems: 'center', gap: 5, whiteSpace: 'nowrap'
                  }}>
                  {saved[u.id] ? <><Icon name="check" size={12} /> Saved!</> : saving[u.id] ? 'Saving...' : <><Icon name="edit" size={12} /> Save</>}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
function DashboardPage({ user, balance, transactions, kycStatus, marketsCount, positions, closedPositions, pnl }) {
  return (
    <div style={{ padding: '28px 28px 40px', overflowY: 'auto', flex: 1 }}>
      <KYCBanner kycStatus={kycStatus} />
      <div style={{ marginBottom: 28, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <h2 style={{ color: T.text0, margin: 0, fontSize: 20, fontWeight: 700 }}>Welcome back </h2>
          <p style={{ color: T.text2, margin: '4px 0 0', fontSize: 13 }}>{user?.email}</p>
        </div>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <div style={{ width: 8, height: 8, borderRadius: '50%', background: T.teal, boxShadow: `0 0 6px ${T.teal}` }} />
          <span style={{ fontSize: 12, color: T.teal }}>Live</span>
        </div>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 14, marginBottom: 28 }}>
        <StatCard label="Account Balance" value={fmt(balance)} color={T.text0} icon={<Icon name="wallet" size={15} />} sub="Available funds" />
        <StatCard label="Total P&L" value={`${(pnl ?? 0) >= 0 ? '+' : ''}${fmt(pnl ?? 0)}`} color={(pnl ?? 0) >= 0 ? T.teal : T.red} icon={<Icon name="trending" size={15} color={(pnl ?? 0) >= 0 ? T.teal : T.red} />} sub="All time trading" />
        <StatCard label="Open Positions" value={positions?.length || 0} color={T.blue} icon={<Icon name="zap" size={15} color={T.blue} />} sub="Active markets" />
        <StatCard label="Live Markets" value={marketsCount || 0} color={T.purple} icon={<Icon name="markets" size={15} color={T.purple} />} sub="Available now" />
      </div>

      {positions?.length > 0 && (
        <div style={{ background: T.bgCard, borderRadius: 16, border: `1px solid ${T.border}`, overflow: 'hidden', marginBottom: 20 }}>
          <div style={{ padding: '16px 24px', borderBottom: `1px solid ${T.border}`, display: 'flex', alignItems: 'center', gap: 10 }}>
            <Icon name="zap" size={15} color={T.blue} />
            <span style={{ color: T.text0, fontWeight: 600, fontSize: 14 }}>Open Positions</span>
          </div>
          {positions.map((p, i) => (
            <div key={p.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 24px', borderBottom: i < positions.length - 1 ? `1px solid ${T.border}` : 'none' }}
              onMouseEnter={e => e.currentTarget.style.background = T.bgHover}
              onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
              <div>
                <div style={{ color: T.text0, fontSize: 13, fontWeight: 500 }}>{p.market}</div>
                <div style={{ display: 'flex', gap: 8, marginTop: 6 }}>
                  <span style={{ fontSize: 10, fontWeight: 600, color: p.side === 'YES' ? T.teal : T.red, background: p.side === 'YES' ? T.tealDim : T.redDim, padding: '2px 8px', borderRadius: 20 }}>{p.side}</span>
                  <span style={{ fontSize: 10, fontWeight: 600, color: T.blue, background: T.blueDim, padding: '2px 8px', borderRadius: 20 }}>open</span>
                </div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ color: T.text1, fontSize: 12 }}>Invested: <span style={{ color: T.text0, fontFamily: T.mono }}>{fmt(p.amount)}</span></div>
                <div style={{ color: (p.pnl ?? 0) >= 0 ? T.teal : T.red, fontWeight: 700, fontSize: 15, fontFamily: T.mono }}>
                  {(p.pnl ?? 0) >= 0 ? '+' : ''}{fmt(p.pnl ?? 0)}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {closedPositions?.length > 0 && (
  <div style={{ background: T.bgCard, borderRadius: 16, border: `1px solid ${T.border}`, overflow: 'hidden', marginBottom: 20 }}>
    <div style={{ padding: '16px 24px', borderBottom: `1px solid ${T.border}`, display: 'flex', alignItems: 'center', gap: 10 }}>
      <Icon name="chart" size={15} color={T.purple} />
      <span style={{ color: T.text0, fontWeight: 600, fontSize: 14 }}>Closed Positions</span>
    </div>
    {closedPositions.map((p, i) => (
      <div key={p.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 24px', borderBottom: i < closedPositions.length - 1 ? `1px solid ${T.border}` : 'none' }}
        onMouseEnter={e => e.currentTarget.style.background = T.bgHover}
        onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
        <div>
          <div style={{ color: T.text0, fontSize: 13, fontWeight: 500 }}>{p.market}</div>
          <div style={{ display: 'flex', gap: 8, marginTop: 6 }}>
            <span style={{ fontSize: 10, fontWeight: 600, color: p.side === 'YES' ? T.teal : T.red, background: p.side === 'YES' ? T.tealDim : T.redDim, padding: '2px 8px', borderRadius: 20 }}>{p.side}</span>
            <span style={{ fontSize: 10, fontWeight: 600, color: T.text2, background: T.bg3, padding: '2px 8px', borderRadius: 20 }}>closed</span>
          </div>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={{ color: T.text1, fontSize: 12 }}>Invested: <span style={{ color: T.text0, fontFamily: T.mono }}>{fmt(p.amount)}</span></div>
          <div style={{ color: (p.pnl ?? 0) >= 0 ? T.teal : T.red, fontWeight: 700, fontSize: 15, fontFamily: T.mono }}>
            {(p.pnl ?? 0) >= 0 ? '+' : ''}{fmt(p.pnl ?? 0)}
          </div>
        </div>
      </div>
    ))}
  </div>
)}

      <div style={{ background: T.bgCard, borderRadius: 16, border: `1px solid ${T.border}`, overflow: 'hidden' }}>
        <div style={{ padding: '16px 24px', borderBottom: `1px solid ${T.border}`, display: 'flex', alignItems: 'center', gap: 10 }}>
          <Icon name="deposit" size={15} color={T.yellow} />
          <span style={{ color: T.text0, fontWeight: 600, fontSize: 14 }}>Recent Transactions</span>
        </div>
        {transactions.length === 0 ? (
          <div style={{ padding: '32px 24px', textAlign: 'center', color: T.text2, fontSize: 13 }}>
            No transactions yet. Make a deposit to get started.
          </div>
        ) : (
          transactions.map((tx, i) => (
            <div key={tx.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 24px', borderBottom: i < transactions.length - 1 ? `1px solid ${T.border}` : 'none' }}
              onMouseEnter={e => e.currentTarget.style.background = T.bgHover}
              onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{ width: 36, height: 36, borderRadius: 10, background: tx.type === 'withdrawal' ? T.redDim : T.yellowDim, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Icon name={tx.type === 'withdrawal' ? 'withdraw' : 'deposit'} size={15} color={tx.type === 'withdrawal' ? T.red : T.yellow} />
                </div>
                <div>
                  <div style={{ color: T.text0, fontSize: 13, fontWeight: 500 }}>{tx.crypto} {tx.type === 'withdrawal' ? 'Withdrawal' : 'Deposit'}</div>
                  <div style={{ color: T.text2, fontSize: 11, marginTop: 2 }}>{new Date(tx.created_at).toLocaleDateString()}</div>
                </div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ color: tx.type === 'withdrawal' ? T.red : T.teal, fontWeight: 600, fontSize: 14, fontFamily: T.mono }}>
                  {tx.type === 'withdrawal' ? '-' : '+'}${fmt(tx.amount).replace('$','')}
                </div>
                <Badge color={tx.status === 'completed' ? T.teal : tx.status === 'declined' ? T.red : T.yellow}>{tx.status}</Badge>
              </div>
            </div>
          ))
        )}
      </div>

    </div>
  )
}

function TradeHistory({ userId, question }) {
  const [trades, setTrades] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!userId) return
    const load = async () => {
      const { data } = await supabase
        .from('positions')
        .select('*')
        .eq('user_id', userId)
        .eq('market', question)
        .order('created_at', { ascending: false })
      setTrades(data ?? [])
      setLoading(false)
    }
    load()
  }, [userId, question])

  if (loading || trades.length === 0) return null

  return (
    <div style={{ marginTop: 20 }}>
      <div style={{ fontSize: 11, fontWeight: 600, color: T.text2, letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 10 }}>Trade History</div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {trades.map(t => (
          <div key={t.id} style={{ background: T.bgCard, borderRadius: 12, border: `1px solid ${T.border}`, padding: '12px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                <span style={{ fontSize: 12, fontWeight: 700, color: t.side === 'YES' ? T.teal : T.red, background: t.side === 'YES' ? T.tealDim : T.redDim, padding: '2px 8px', borderRadius: 20 }}>{t.side}</span>
                <span style={{ fontSize: 13, fontWeight: 600, color: T.text0, fontFamily: T.mono }}>${Number(t.amount).toFixed(2)}</span>
                {t.entry_price > 0 && <span style={{ fontSize: 11, color: T.text2 }}>at {t.entry_price}%</span>}
              </div>
              <div style={{ fontSize: 11, color: T.text2 }}>{t.market}</div>
              <div style={{ fontSize: 10, color: T.text2, marginTop: 2 }}>
                {new Date(t.created_at).toLocaleDateString()} · <span style={{ color: t.status === 'open' ? T.blue : T.text2 }}>{t.status}</span>
              </div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: 15, fontWeight: 700, fontFamily: T.mono, color: (t.pnl ?? 0) >= 0 ? T.teal : T.red }}>
                {(t.pnl ?? 0) >= 0 ? '+' : ''}${Number(t.pnl ?? 0).toFixed(2)}
              </div>
              <div style={{ fontSize: 10, color: T.text2, marginTop: 2 }}>{(t.pnl ?? 0) >= 0 ? 'Profit' : 'Loss'}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
function MarketsPage({ prices, selected, setSelected, isMobile, user }) {
  const selectedLive = prices?.find(m => m.id === selected?.id)
  if (isMobile && selectedLive) {
    return (
      <div style={{ display: 'flex', flex: 1, flexDirection: 'column', overflow: 'hidden' }}>
        <div style={{ padding: '12px 16px', borderBottom: `1px solid ${T.border}`, background: T.bg1, display: 'flex', alignItems: 'center', gap: 12 }}>
          <button onClick={() => setSelected(null)} style={{ background: T.bg3, border: 'none', color: T.text1, borderRadius: 8, padding: '6px 12px', cursor: 'pointer', fontSize: 12, fontFamily: T.font }}>
  &larr; Back
</button>
          <span style={{ fontSize: 13, fontWeight: 600, color: T.text0, flex: 1, lineHeight: 1.4 }}>{selectedLive.question}</span>
        </div>
        <div style={{ flex: 1, padding: '16px', overflowY: 'auto' }}>
          <div style={{ display: 'flex', gap: 10, marginBottom: 16 }}>
            {[{ label: 'YES', val: Number(selectedLive?.outcomePrices?.[0] ?? 0.5), color: T.teal }, { label: 'NO', val: selectedLive.outcomePrices[1], color: T.red }].map(item => (
              <div key={item.label} style={{ flex: 1, textAlign: 'center', background: `${item.color}10`, border: `1px solid ${item.color}30`, padding: '10px', borderRadius: 12 }}>
                <div style={{ fontSize: 10, color: item.color, fontWeight: 700 }}>{item.label}</div>
                <div style={{ fontSize: 22, fontWeight: 700, color: item.color, fontFamily: T.mono }}>{(Number(item.val ?? 0.5) * 100).toFixed(0)}%</div>
              </div>
            ))}
          </div>
          <Chart market={selectedLive} />
          <TradeHistory userId={user?.id} marketId={selectedLive.id} question={selectedLive.question} />
        </div>
      </div>
    )
  }
  return (
    <div style={{ display: 'flex', flex: 1, overflow: 'hidden', flexDirection: isMobile ? 'column' : 'row' }}>
      <div style={{ width: isMobile ? '100%' : 300, borderRight: isMobile ? 'none' : `1px solid ${T.border}`, borderBottom: isMobile ? `1px solid ${T.border}` : 'none', display: 'flex', flexDirection: 'column', background: T.bg1, flex: isMobile ? 'none' : undefined, height: isMobile ? '100%' : undefined, maxHeight: isMobile ? 'calc(100vh - 52px)' : undefined }}>
        <div style={{ padding: '14px 16px', borderBottom: `1px solid ${T.border}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{ width: 7, height: 7, borderRadius: '50%', background: T.red, boxShadow: `0 0 5px ${T.red}` }} />
            <span style={{ fontSize: 13, fontWeight: 600, color: T.text0 }}>Live Crypto Markets</span>
          </div>
          <Badge color={T.purple}>{prices?.length || 0} active</Badge>
        </div>
        <div style={{ overflowY: 'auto', flex: 1, WebkitOverflowScrolling: 'touch' }}>
          {prices?.map(market => {
            const yesPrice = typeof market?.outcomePrices?.[0] === "number" ? market.outcomePrices[0] : Number(market?.outcomePrices?.[0]) || 0.5
            const yes = (yesPrice * 100).toFixed(0)
            const change = market.change || "+0.0%"
            const isUp = change.startsWith('+')
            const isSelected = selected?.id === market.id
            return (
              <div key={market.id} onClick={() => setSelected(market)}
                style={{ padding: '14px 16px', borderBottom: `1px solid ${T.border}`, border: `1px solid ${isSelected ? T.blue : T.border}`, borderRadius: 12, margin: '8px', cursor: 'pointer', background: isSelected ? T.bg3 : T.bgCard, borderLeft: `3px solid ${isSelected ? T.blue : T.border}`, transition: 'background 0.15s' }}
                onMouseEnter={e => { if (!isSelected) e.currentTarget.style.background = T.bgHover }}
onMouseLeave={e => { if (!isSelected) e.currentTarget.style.background = 'transparent' }}
onTouchStart={() => {}}
>
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
      {!isMobile && (
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
          {selectedLive ? (
            <>
              <div style={{ padding: '16px 24px', borderBottom: `1px solid ${T.border}`, background: T.bg1, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
                <div>
                  <div style={{ fontSize: 15, fontWeight: 600, color: T.text0 }}>{selectedLive.question}</div>
                  <div style={{ fontSize: 11, color: T.text2, marginTop: 3, display: 'flex', alignItems: 'center', gap: 6 }}>
                    <Icon name="clock" size={11} color={T.text2} /> {selectedLive.timeframe} - Polymarket Crypto
                  </div>
                </div>
                <div style={{ display: 'flex', gap: 10 }}>
                  {[{ label: 'YES', val: Number(selectedLive?.outcomePrices?.[0] ?? 0.5), color: T.teal }, { label: 'NO', val: selectedLive.outcomePrices[1], color: T.red }].map(item => (
                    <div key={item.label} style={{ textAlign: 'center', background: `${item.color}10`, border: `1px solid ${item.color}30`, padding: '10px 22px', borderRadius: 12, minWidth: 88 }}>
                      <div style={{ fontSize: 10, color: item.color, fontWeight: 700 }}>{item.label}</div>
                      <div style={{ fontSize: 22, fontWeight: 700, color: item.color, fontFamily: T.mono }}>{(Number(item.val ?? 0.5) * 100).toFixed(0)}%</div>
                    </div>
                  ))}
                </div>
              </div>
              <div style={{ flex: 1, padding: '24px', overflowY: 'auto' }}>
                <Chart market={selectedLive} />
                <TradeHistory userId={user?.id} marketId={selectedLive.id} question={selectedLive.question} />
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
  const [copied, setCopied] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)
  if (kycStatus !== 'approved') return <LockedPage title="Deposits" />
  const cryptos = [
    { symbol: 'BTC', name: 'Bitcoin', logo: 'https://assets.coingecko.com/coins/images/1/large/bitcoin.png', address: 'bc1qhvwnm32jpsn7msk58jnem04zyzfh6x4em6ya06', color: '#f7931a', network: 'Bitcoin Network' },
    { symbol: 'ETH', name: 'Ethereum', logo: 'https://assets.coingecko.com/coins/images/279/large/ethereum.png', address: '0x8c3d836edc23cdeF4aee9f2895890562b57Ba4e5', color: '#627eea', network: 'ERC-20' },
    { symbol: 'USDT', name: 'Tether', logo: 'https://assets.coingecko.com/coins/images/325/large/Tether.png', address: 'Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB', color: '#26a17b', network: 'Solana (SOL)' },
    { symbol: 'USDC', name: 'USD Coin', logo: 'https://assets.coingecko.com/coins/images/6319/large/usdc.png', address: 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v', color: '#2775ca', network: 'Solana (SOL)' },
  ]
  const handleDeposit = async () => {
    if (!amount || !user) return
    setLoading(true)
    try {
      const depositAmount = parseFloat(amount)
      const { error } = await supabase.from('transactions').insert({ user_id: user.id, type: 'deposit', crypto: selectedCrypto.symbol, amount: depositAmount, status: 'pending' })
      if (error) throw error
      onDepositSuccess({ id: Date.now(), crypto: selectedCrypto.symbol, amount: depositAmount, status: 'pending', created_at: new Date().toISOString() })
      setShowSuccess(true)
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
              <div style={{ fontSize: 11, color: T.yellow, marginBottom: 8, fontWeight: 600 }}>Network: {selectedCrypto.network}</div>
              <img src={`https://api.qrserver.com/v1/create-qr-code/?size=140x140&data=${selectedCrypto.address}`} alt="QR" style={{ width: 140, height: 140, borderRadius: 8, display: 'block', margin: '0 auto 12px' }} />
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
                <div style={{ fontSize: 11, color: T.text1, wordBreak: 'break-all', fontFamily: T.mono }}>{selectedCrypto.address}</div>
                <button onClick={() => { navigator.clipboard.writeText(selectedCrypto.address); setCopied(true); setTimeout(() => setCopied(false), 2000) }}
                  style={{ display: 'flex', alignItems: 'center', gap: 6, background: copied ? T.tealDim : T.bg2, border: `1px solid ${copied ? T.teal : T.border}`, color: copied ? T.teal : T.text1, borderRadius: 8, padding: '6px 14px', cursor: 'pointer', fontSize: 12, fontFamily: T.font, fontWeight: 600 }}>
                  <Icon name="copy" size={12} />{copied ? 'Copied!' : 'Copy Address'}
                </button>
              </div>
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
      {showSuccess && (
  <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.88)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
    <div style={{ background: T.bg2, padding: 36, borderRadius: 22, width: '90%', maxWidth: 420, textAlign: 'center', border: `1px solid ${T.borderHi}` }}>
      <div style={{ width: 64, height: 64, borderRadius: '50%', background: T.yellowDim, border: `1px solid ${T.yellow}40`, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
        <Icon name="clock" size={28} color={T.yellow} />
      </div>
      <div style={{ fontSize: 20, fontWeight: 700, color: T.text0, marginBottom: 10 }}>Deposit Pending</div>
      <div style={{ fontSize: 13, color: T.text1, lineHeight: 1.7, marginBottom: 8 }}>
        Your deposit has been submitted.
      </div>
      <button onClick={() => { setShowSuccess(false); setSelectedCrypto(null); setAmount('') }}
        style={{ width: '100%', padding: '13px', background: T.teal, color: '#0d0e14', border: 'none', borderRadius: 12, fontSize: 14, fontWeight: 700, cursor: 'pointer', fontFamily: T.font }}>
        Done
      </button>
    </div>
  </div>
)}
    </div>
  )
}
function CopyTradingPage({ kycStatus, user }) {
  const [searchTerm, setSearchTerm] = useState('')
  const [copying, setCopying] = useState([])
  const [loading, setLoading] = useState(true)

  const traders = [
  { name: "0xdE17f7144fbD0eddb2679132C10ff5e74B120988", slug: "0xdE17f7144fbD0eddb2679132C10ff5e74B120988-1772205225932", profit: "+$727,451", winRate: "91%", followers: "8.2K", rank: 1 },
  { name: "BoneReader", slug: "BoneReader", profit: "+$614,057", winRate: "87%", followers: "6.1K", rank: 2 },
  { name: "k9Q2mX4L8A7ZP3R", slug: "k9Q2mX4L8A7ZP3R", profit: "+$535,926", winRate: "84%", followers: "4.9K", rank: 3 },
  { name: "0x8dxd", slug: "0x8dxd", profit: "+$534,805", winRate: "82%", followers: "4.3K", rank: 4 },
  { name: "0xB27BC932bf8110D8F78e55da7d5f0497A18B5b82", slug: "0xB27BC932bf8110D8F78e55da7d5f0497A18B5b82-1772569391020", profit: "+$411,861", winRate: "79%", followers: "3.7K", rank: 5 },
  { name: "vidarx", slug: "vidarx", profit: "+$403,477", winRate: "78%", followers: "3.2K", rank: 6 },
  { name: "0x1f0ebc543B2d411f66947041625c0Aa1ce61CF86", slug: "0x1f0ebc543B2d411f66947041625c0Aa1ce61CF86-1772205597930", profit: "+$386,132", winRate: "76%", followers: "2.8K", rank: 7 },
  { name: "stingo43", slug: "stingo43", profit: "+$323,175", winRate: "74%", followers: "2.4K", rank: 8 },
  { name: "0xe1D6b51521Bd4365769199f392F9818661BD907", slug: "0xe1D6b51521Bd4365769199f392F9818661BD907", profit: "+$314,579", winRate: "72%", followers: "2.1K", rank: 9 },
  { name: "Bonereaper", slug: "Bonereaper", profit: "+$307,770", winRate: "71%", followers: "1.9K", rank: 10 },
  { name: "0x2Eb5714FF6f20f5F9f7662c556DBEF5e1c9bf4D", slug: "0x2Eb5714FF6f20f5F9f7662c556DBEF5e1c9bf4D", profit: "+$274,366", winRate: "70%", followers: "1.7K", rank: 11 },
  { name: "0xd1ebE815f921b3EbBD8d9e0a4192C6Ab18360F5c", slug: "0xd1ebE815f921b3EbBD8d9e0a4192C6Ab18360F5c-1772214308773", profit: "+$225,565", winRate: "69%", followers: "1.5K", rank: 12 },
  { name: "BoshBashBish", slug: "BoshBashBish", profit: "+$199,067", winRate: "68%", followers: "1.3K", rank: 13 },
  { name: "vague-sourdough", slug: "vague-sourdough", profit: "+$198,295", winRate: "67%", followers: "1.2K", rank: 14 },
  { name: "0x732F1", slug: "0x732F1", profit: "+$197,364", winRate: "66%", followers: "1.1K", rank: 15 },
  { name: "guh123", slug: "guh123", profit: "+$193,895", winRate: "65%", followers: "1.0K", rank: 16 },
  { name: "0x04283f2Fef49d70D8C55ab240450D17A65bF85b", slug: "0x04283f2Fef49d70D8C55ab240450D17A65bF85b", profit: "+$186,240", winRate: "64%", followers: "950", rank: 17 },
  { name: "0x3A847382ad6FfF9be1db4e073FD9b869f6884D4", slug: "0x3A847382ad6FfF9be1db4e073FD9b869f6884D4", profit: "+$180,527", winRate: "63%", followers: "900", rank: 18 },
  { name: "kingofcoinflips", slug: "kingofcoinflips", profit: "+$171,880", winRate: "62%", followers: "850", rank: 19 },
  { name: "ohanism", slug: "ohanism", profit: "+$162,865", winRate: "61%", followers: "800", rank: 20 },
]
  const displayName = (name) => {
    if (name.length > 20) {
      return `${name.slice(0, 6)}...${name.slice(-4)}`
    }
    return name
  }

  useEffect(() => {
    if (!user) return
    const load = async () => {
      const { data } = await supabase
        .from('copy_trades')
        .select('trader_name')
        .eq('user_id', user.id)
      setCopying((data ?? []).map(d => d.trader_name))
      setLoading(false)
    }
    load()
  }, [user])

  const [toast, setToast] = useState(null)

  const toggleCopy = async (name) => {
    const isCopying = copying.includes(name)
    if (isCopying) {
      await supabase.from('copy_trades').delete().eq('user_id', user.id).eq('trader_name', name)
      setCopying(prev => prev.filter(n => n !== name))
      setToast({ msg: `Stopped copying ${name}`, color: T.red })
    } else {
      if (copying.length > 0) {
        setToast({ msg: `Stop copying your current trader first before selecting another`, color: T.yellow })
        setTimeout(() => setToast(null), 3000)
        return
      }
      await supabase.from('copy_trades').insert({ user_id: user.id, trader_name: name })
      setCopying(prev => [name, ...prev])
      setToast({ msg: `Now copying ${name} — trades will automatically be copied within the next 24 hours`, color: T.teal })
    }
    setTimeout(() => setToast(null), 3000)
  }

  const shortName = (name) => name.startsWith('0x') || name.length > 20 ? name.slice(0, 6) + '...' + name.slice(-4) : name

  const filtered = traders
    .filter(t => t.name.toLowerCase().includes(searchTerm.toLowerCase()))
    .sort((a, b) => {
      const aCopying = copying.includes(a.name)
      const bCopying = copying.includes(b.name)
      if (aCopying && !bCopying) return -1
      if (!aCopying && bCopying) return 1
      return a.rank - b.rank
    })

  if (kycStatus !== 'approved') return (
    <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 16, color: T.text2, padding: 40, textAlign: 'center' }}>
      <div style={{ width: 64, height: 64, borderRadius: '50%', background: T.yellowDim, border: `1px solid ${T.yellow}30`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Icon name="lock" size={28} color={T.yellow} />
      </div>
      <div style={{ fontSize: 16, fontWeight: 700, color: T.text0, marginBottom: 6 }}>Copy Trading Locked</div>
      <div style={{ fontSize: 13, color: T.text1, maxWidth: 300, lineHeight: 1.6 }}>Complete KYC verification to unlock this feature.</div>
    </div>
  )

  return (
    <div style={{ padding: '28px', overflowY: 'auto', flex: 1 }}>
      {toast && (
        <div style={{
          position: 'fixed', bottom: 24, left: 16, right: 16,
          background: T.bgCard, border: `1px solid ${toast.color}40`,
          borderLeft: `4px solid ${toast.color}`,
          borderRadius: 12, padding: '14px 16px',
          color: T.text0, fontSize: 13, fontWeight: 600,
          boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
          zIndex: 9999,
          display: 'flex', alignItems: 'flex-start', gap: 10,
          animation: 'slideUp 0.3s ease'
        }}>
          <div style={{ width: 8, height: 8, borderRadius: '50%', background: toast.color, flexShrink: 0, marginTop: 3 }} />
          <span style={{ lineHeight: 1.5 }}>{toast.msg}</span>
          <style>{`@keyframes slideUp { from { opacity: 0; transform: translateY(10px) } to { opacity: 1; transform: translateY(0) } }`}</style>
        </div>
      )}
      <h2 style={{ color: T.text0, margin: '0 0 4px', fontSize: 20, fontWeight: 700 }}>Copy Trading</h2>
      <p style={{ color: T.text2, margin: '0 0 24px', fontSize: 13 }}>Follow successful Polymarket crypto traders</p>
      <div style={{ position: 'relative', marginBottom: 24 }}>
        <div style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)' }}><Icon name="search" size={15} color={T.text2} /></div>
        <input type="text" placeholder="Search traders..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)}
          style={{ width: '100%', padding: '12px 16px 12px 42px', background: T.bgCard, border: `1px solid ${T.border}`, borderRadius: 12, color: T.text0, fontSize: 13, outline: 'none', boxSizing: 'border-box', fontFamily: T.font }} />
      </div>
      {loading ? (
        <div style={{ color: T.text2, fontSize: 13 }}>Loading...</div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 16 }}>
          {filtered.map((trader, i) => {
            const isCopying = copying.includes(trader.name)
            return (
              <div key={i} style={{ background: T.bgCard, borderRadius: 16, border: `1px solid ${isCopying ? T.teal + '40' : T.border}`, padding: '20px 22px', transition: 'border 0.2s' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div style={{ width: 38, height: 38, borderRadius: 10, background: `${T.purple}20`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 15, fontWeight: 700, color: T.purple }}>{trader.name[0].toUpperCase()}</div>
                    <a href={`https://polymarket.com/@${trader.slug}`} target="_blank" rel="noopener noreferrer" style={{ fontSize: 14, fontWeight: 700, color: T.text0, textDecoration: 'none', borderBottom: `1px dashed ${T.text2}` }}>{shortName(trader.name)}</a>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                    <Icon name="star" size={12} color={T.yellow} />
                    <span style={{ fontSize: 11, fontWeight: 600, color: T.yellow }}>#{trader.rank}</span>
                  </div>
                </div>
                <div style={{ color: T.teal, fontSize: 28, fontWeight: 800, fontFamily: '"Manrope", sans-serif', letterSpacing: '-1px', marginBottom: 6 }}>{trader.profit}</div>
                <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
                  <Badge color={T.blue}>{trader.winRate} win rate</Badge>
                  <Badge color={T.purple}>{trader.followers} followers</Badge>
                </div>
                {(() => {
                  const isLocked = copying.length > 0 && !isCopying
                  return (
                    <button onClick={() => toggleCopy(trader.name)} disabled={isLocked}
                      style={{ width: '100%', padding: '11px', background: isCopying ? T.teal : isLocked ? T.bg3 : T.tealDim, color: isCopying ? '#0d0e14' : isLocked ? T.text2 : T.teal, border: `1px solid ${isLocked ? T.border : T.teal + '30'}`, borderRadius: 10, fontWeight: 600, fontSize: 13, cursor: isLocked ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, fontFamily: T.font, opacity: isLocked ? 0.5 : 1 }}>
                      {isCopying
                        ? <><Icon name="check" size={13} color="#0d0e14" /> Copying Trades</>
                        : isLocked
                        ? <><Icon name="lock" size={13} color={T.text2} /> Unavailable</>
                        : <><Icon name="copy" size={13} /> Copy Trader</>
                      }
                    </button>
                  )
                })()}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
function AdminPnLPage() {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState({})
  const [saving, setSaving] = useState({})
  const [saved, setSaved] = useState({})

  useEffect(() => {
    const load = async () => {
      const { data: profileData, error } = await supabase
  .from('profiles')
  .select('id, balance, pnl, role')
  .order('id')

const userIds = (profileData || []).map(u => u.id)
let emailMap = {}
if (userIds.length > 0) {
  const { data: emailData } = await supabase
    .from('profiles_with_email')
    .select('id, email')
    .in('id', userIds)
  if (emailData) emailData.forEach(e => { emailMap[e.id] = e.email })
}

const data = (profileData || []).map(u => ({ ...u, email: emailMap[u.id] ?? u.id }))
setUsers(data)
setLoading(false)
      console.log('pnl users:', data, error)
      setUsers(data ?? [])
      setLoading(false)
    }
    load()
  }, [])

  const handleSave = async (userId) => {
    const val = editing[userId]
    if (val === undefined || val === '') return
    setSaving(prev => ({ ...prev, [userId]: true }))
    const { error } = await supabase
      .from('profiles')
      .update({ pnl: parseFloat(val) })
      .eq('id', userId)
    console.log('save error:', error)
    setUsers(prev => prev.map(u => u.id === userId ? { ...u, pnl: parseFloat(val) } : u))
    setEditing(prev => { const n = { ...prev }; delete n[userId]; return n })
    setSaving(prev => ({ ...prev, [userId]: false }))
    setSaved(prev => ({ ...prev, [userId]: true }))
    setTimeout(() => setSaved(prev => ({ ...prev, [userId]: false })), 2000)
  }

  return (
    <div style={{ padding: '28px', overflowY: 'auto', flex: 1 }}>
      <h2 style={{ color: T.text0, margin: '0 0 4px', fontSize: 20, fontWeight: 700 }}>Edit P&L</h2>
      <p style={{ color: T.text2, margin: '0 0 24px', fontSize: 13 }}>Set total trading profit & loss for each user.</p>
      {loading ? (
        <div style={{ color: T.text2, fontSize: 13 }}>Loading users...</div>
      ) : users.length === 0 ? (
        <div style={{ color: T.red, fontSize: 13 }}>No users found. Check console for errors.</div>
      ) : (
        <div style={{ background: T.bgCard, borderRadius: 16, border: `1px solid ${T.border}`, overflow: 'hidden' }}>
          <div style={{ padding: '14px 24px', borderBottom: `1px solid ${T.border}`, display: 'flex', gap: 24 }}>
            <span style={{ fontSize: 11, color: T.text2, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em', flex: 2 }}>User</span>
            <span style={{ fontSize: 11, color: T.text2, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em', flex: 1 }}>Current P&L</span>
            <span style={{ fontSize: 11, color: T.text2, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em', flex: 2 }}>Set New P&L</span>
          </div>
          {users.map((u, i) => (
            <div key={u.id} style={{ display: 'flex', alignItems: 'center', gap: 24, padding: '14px 24px', borderBottom: i < users.length - 1 ? `1px solid ${T.border}` : 'none' }}
              onMouseEnter={e => e.currentTarget.style.background = T.bgHover}
              onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
              <div style={{ flex: 2 }}>
                <div style={{ color: T.text0, fontSize: 13, fontWeight: 500 }}>{u.email ?? u.id}</div>
                {u.role === 'admin' && <Badge color={T.purple}>Admin</Badge>}
              </div>
              <div style={{ flex: 1, fontWeight: 700, fontFamily: T.mono, fontSize: 14, color: (u.pnl ?? 0) >= 0 ? T.teal : T.red }}>
                {(u.pnl ?? 0) >= 0 ? '+' : ''}${Number(u.pnl ?? 0).toFixed(2)}
              </div>
              <div style={{ flex: 2, display: 'flex', gap: 8, alignItems: 'center' }}>
                <input
                  type="number"
                  value={editing[u.id] ?? ''}
                  onChange={e => setEditing(prev => ({ ...prev, [u.id]: e.target.value }))}
                  placeholder="e.g. 500 or -200"
                  style={{ flex: 1, background: T.bg3, border: `1px solid ${T.border}`, borderRadius: 8, padding: '8px 12px', color: T.text0, fontSize: 13, fontFamily: T.mono, outline: 'none', minWidth: 0 }}
                />
                <button
                  onClick={() => handleSave(u.id)}
                  disabled={editing[u.id] === undefined || editing[u.id] === '' || saving[u.id]}
                  style={{
                    background: saved[u.id] ? T.tealDim : (editing[u.id] !== undefined && editing[u.id] !== '') ? T.teal : T.bg3,
                    border: `1px solid ${saved[u.id] ? T.teal : T.border}`,
                    color: saved[u.id] ? T.teal : (editing[u.id] !== undefined && editing[u.id] !== '') ? '#0d0e14' : T.text2,
                    borderRadius: 8, padding: '8px 14px', cursor: 'pointer', fontWeight: 600, fontSize: 12, fontFamily: T.font,
                    display: 'flex', alignItems: 'center', gap: 5, whiteSpace: 'nowrap'
                  }}>
                  {saved[u.id] ? <><Icon name="check" size={12} /> Saved!</> : saving[u.id] ? 'Saving...' : <><Icon name="edit" size={12} /> Save</>}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
function AdminPositionsPage() {
  const [users, setUsers] = useState([])
  const [positions, setPositions] = useState([])
  const [closedPositions, setClosedPositions] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedUser, setSelectedUser] = useState('')
  const [form, setForm] = useState({ market: '', side: 'YES', amount: '', pnl: '', entry_price: '' })
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    const load = async () => {
      const [{ data: u }, { data: p }] = await Promise.all([
        supabase.from('profiles_with_email').select('id, email, first_name, last_name'),
        supabase.from('positions').select('*, profiles_with_email(email)').order('created_at', { ascending: false })
      ])
      setUsers(u ?? [])
      setPositions(p ?? [])
      setLoading(false)
    }
    load()
  }, [])

  const handleAdd = async () => {
    if (!selectedUser || !form.market) return
    setSaving(true)
    const { data, error } = await supabase.from('positions').insert({
  user_id: selectedUser,
  market: form.market,
  side: form.side,
  amount: parseFloat(form.amount) || 0,
  pnl: parseFloat(form.pnl) || 0,
  entry_price: parseFloat(form.entry_price) || 0,
  status: 'open'
}).select('*, profiles(email)').single()
    if (!error) setPositions(prev => [data, ...prev])
    setForm({ market: '', side: 'YES', amount: '', pnl: '' })
    setSaving(false)
  }

  const handleDelete = async (id) => {
    await supabase.from('positions').delete().eq('id', id)
    setPositions(prev => prev.filter(p => p.id !== id))
  }

  const handleClose = async (id) => {
    await supabase.from('positions').update({ status: 'closed' }).eq('id', id)
    setPositions(prev => prev.map(p => p.id === id ? { ...p, status: 'closed' } : p))
  }

  return (
    <div style={{ padding: '28px', overflowY: 'auto', flex: 1 }}>
      <h2 style={{ color: T.text0, margin: '0 0 4px', fontSize: 20, fontWeight: 700 }}>Open Positions</h2>
      <p style={{ color: T.text2, margin: '0 0 24px', fontSize: 13 }}>Manually add or manage user positions.</p>

      {/* Add position form */}
      <div style={{ background: T.bgCard, borderRadius: 14, border: `1px solid ${T.border}`, padding: '20px', marginBottom: 24 }}>
        <div style={{ color: T.text0, fontWeight: 600, marginBottom: 14 }}>Add Position</div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
          <select value={selectedUser} onChange={e => setSelectedUser(e.target.value)}
            style={{ padding: '8px 12px', background: T.bg2, border: `1px solid ${T.border}`, borderRadius: 8, color: T.text0, fontSize: 13, fontFamily: T.font, outline: 'none' }}>
            <option value="">Select user...</option>
            {users.map(u => (
              <option key={u.id} value={u.id}>{u.email || `${u.first_name} ${u.last_name}`}</option>
            ))}
          </select>
          <input value={form.market} onChange={e => setForm(p => ({ ...p, market: e.target.value }))}
            placeholder="Market / question"
            style={{ flex: 1, minWidth: 200, padding: '8px 12px', background: T.bg2, border: `1px solid ${T.border}`, borderRadius: 8, color: T.text0, fontSize: 13, outline: 'none' }} />
          <select value={form.side} onChange={e => setForm(p => ({ ...p, side: e.target.value }))}
            style={{ padding: '8px 12px', background: T.bg2, border: `1px solid ${T.border}`, borderRadius: 8, color: T.text0, fontSize: 13, fontFamily: T.font, outline: 'none' }}>
            <option value="YES">YES</option>
            <option value="NO">NO</option>
          </select>
          <input value={form.amount} onChange={e => setForm(p => ({ ...p, amount: e.target.value }))}
            placeholder="Amount ($)" type="number"
            style={{ width: 120, padding: '8px 12px', background: T.bg2, border: `1px solid ${T.border}`, borderRadius: 8, color: T.text0, fontSize: 13, fontFamily: T.mono, outline: 'none' }} />
          <input value={form.pnl} onChange={e => setForm(p => ({ ...p, pnl: e.target.value }))}
  placeholder="P&L ($)" type="number"
  style={{ width: 120, padding: '8px 12px', background: T.bg2, border: `1px solid ${T.border}`, borderRadius: 8, color: T.text0, fontSize: 13, fontFamily: T.mono, outline: 'none' }} />
<input value={form.entry_price} onChange={e => setForm(p => ({ ...p, entry_price: e.target.value }))}
  placeholder="Entry %" type="number"
  style={{ width: 100, padding: '8px 12px', background: T.bg2, border: `1px solid ${T.border}`, borderRadius: 8, color: T.text0, fontSize: 13, fontFamily: T.mono, outline: 'none' }} />

          <button onClick={handleAdd} disabled={saving}
            style={{ padding: '8px 18px', background: T.blue, color: '#fff', border: 'none', borderRadius: 8, cursor: 'pointer', fontWeight: 600, fontSize: 13 }}>
            {saving ? '...' : '+ Add'}
          </button>
        </div>
      </div>

      {/* Positions list */}
      {loading ? <div style={{ color: T.text2 }}>Loading...</div> : positions.length === 0 ? (
        <div style={{ color: T.text2, fontSize: 13 }}>No positions yet.</div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {positions.map(p => (
            <div key={p.id} style={{ background: T.bgCard, borderRadius: 12, border: `1px solid ${T.border}`, padding: '14px 18px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 10 }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
  <Icon name="zap" size={13} color={T.yellow} />
  <div style={{ color: T.text0, fontWeight: 600, fontSize: 13 }}>{p.market}</div>
</div>
                <div style={{ color: T.text2, fontSize: 11, marginTop: 2 }}>{p.profiles_with_email?.email ?? p.user_id}</div>
                <div style={{ display: 'flex', gap: 8, marginTop: 6 }}>
                  <span style={{ fontSize: 10, fontWeight: 600, color: p.side === 'YES' ? T.teal : T.red, background: p.side === 'YES' ? T.tealDim : T.redDim, padding: '2px 8px', borderRadius: 20 }}>{p.side}</span>
                  <span style={{ fontSize: 10, fontWeight: 600, color: p.status === 'open' ? T.blue : T.text2, background: T.blueDim, padding: '2px 8px', borderRadius: 20 }}>{p.status}</span>
                </div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ color: T.text1, fontSize: 12 }}>Invested: <span style={{ color: T.text0, fontFamily: T.mono }}>${Number(p.amount).toFixed(2)}</span></div>
                <div style={{ color: (p.pnl ?? 0) >= 0 ? T.teal : T.red, fontWeight: 700, fontSize: 14, fontFamily: T.mono }}>
                  {(p.pnl ?? 0) >= 0 ? '+' : ''}${Number(p.pnl ?? 0).toFixed(2)}
                </div>
              </div>
              <div style={{ display: 'flex', gap: 8 }}>
                {p.status === 'open' && (
                  <button onClick={() => handleClose(p.id)}
                    style={{ padding: '6px 14px', background: T.yellowDim, color: T.yellow, border: `1px solid ${T.yellow}30`, borderRadius: 8, cursor: 'pointer', fontSize: 12, fontWeight: 600 }}>
                    Close
                  </button>
                )}
                <button onClick={() => handleDelete(p.id)}
                  style={{ padding: '6px 14px', background: T.redDim, color: T.red, border: `1px solid ${T.red}30`, borderRadius: 8, cursor: 'pointer', fontSize: 12, fontWeight: 600 }}>
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
function WithdrawPage({ kycStatus, balance, user, onWithdrawSuccess }) {
  const [selectedCrypto, setSelectedCrypto] = useState(null)
  const [address, setAddress] = useState('')
  const [amount, setAmount] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)

  if (kycStatus !== 'approved') return (
    <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 16, color: T.text2, padding: 40, textAlign: 'center' }}>
      <div style={{ width: 64, height: 64, borderRadius: '50%', background: T.yellowDim, border: `1px solid ${T.yellow}30`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Icon name="lock" size={28} color={T.yellow} />
      </div>
      <div style={{ fontSize: 16, fontWeight: 700, color: T.text0 }}>Withdraw Locked</div>
      <div style={{ fontSize: 13, color: T.text1, maxWidth: 300, lineHeight: 1.6 }}>Complete KYC verification to unlock withdrawals.</div>
    </div>
  )

  const cryptos = [
    { symbol: 'BTC', name: 'Bitcoin', color: '#f7931a', logo: 'https://assets.coingecko.com/coins/images/1/large/bitcoin.png' },
    { symbol: 'ETH', name: 'Ethereum', color: '#627eea', logo: 'https://assets.coingecko.com/coins/images/279/large/ethereum.png' },
    { symbol: 'USDT', name: 'Tether', color: '#26a17b', logo: 'https://assets.coingecko.com/coins/images/325/large/Tether.png' },
    { symbol: 'USDC', name: 'USD Coin', color: '#2775ca', logo: 'https://assets.coingecko.com/coins/images/6319/large/usdc.png' },
  ]

  const handleSubmit = async () => {
    if (!address || !amount || !user) return
    setSubmitting(true)
    const { data, error } = await supabase.from('transactions').insert({
      user_id: user.id,
      type: 'withdrawal',
      crypto: selectedCrypto.symbol,
      amount: parseFloat(amount),
      status: 'pending',
      wallet_address: address,
    }).select().single()
    setSubmitting(false)
    if (!error) {
      if (onWithdrawSuccess) onWithdrawSuccess(data)
      setShowSuccess(true)
    }
  }

  return (
    <div style={{ padding: '28px', overflowY: 'auto', flex: 1 }}>
      <h2 style={{ color: T.text0, margin: '0 0 4px', fontSize: 20, fontWeight: 700 }}>Withdraw Funds</h2>
      <p style={{ color: T.text2, margin: '0 0 24px', fontSize: 13 }}>Select a crypto asset to withdraw to</p>

      <div style={{ background: T.bgCard, borderRadius: 14, border: `1px solid ${T.border}`, padding: '16px 22px', marginBottom: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ color: T.text1, fontSize: 13 }}>Available Balance</span>
        <span style={{ color: T.teal, fontWeight: 700, fontSize: 20, fontFamily: T.mono }}>${Number(balance).toFixed(2)}</span>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 12, marginBottom: 24 }}>
        {cryptos.map(c => (
          <div key={c.symbol} onClick={() => setSelectedCrypto(c)}
            style={{ background: selectedCrypto?.symbol === c.symbol ? `${c.color}15` : T.bgCard, padding: '18px 14px', borderRadius: 14, textAlign: 'center', cursor: 'pointer', border: `1px solid ${selectedCrypto?.symbol === c.symbol ? c.color + '60' : T.border}`, transition: 'all 0.2s' }}>
            <img src={c.logo} alt={c.symbol} style={{ width: 40, height: 40, objectFit: 'contain' }} onError={e => e.target.style.display = 'none'} />
            <div style={{ marginTop: 10, fontWeight: 700, color: T.text0, fontSize: 14 }}>{c.symbol}</div>
            <div style={{ color: T.text2, fontSize: 11, marginTop: 2 }}>{c.name}</div>
          </div>
        ))}
      </div>

      {selectedCrypto && (
        <div style={{ maxWidth: 560, background: T.bgCard, borderRadius: 18, border: `1px solid ${T.border}`, padding: '24px 28px' }}>
          <div style={{ fontSize: 15, fontWeight: 600, color: T.text0, marginBottom: 20 }}>Withdraw {selectedCrypto.name}</div>
          <div style={{ marginBottom: 16 }}>
            <label style={{ display: 'block', fontSize: 11, fontWeight: 600, color: T.text1, letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: 7 }}>{selectedCrypto.symbol} Wallet Address</label>
            <input value={address} onChange={e => setAddress(e.target.value)} placeholder="Enter your wallet address"
              style={{ width: '100%', padding: '11px 14px', background: T.bg3, border: `1px solid ${T.border}`, borderRadius: 10, color: T.text0, fontSize: 13, fontFamily: T.mono, outline: 'none', boxSizing: 'border-box' }}
              onFocus={e => e.target.style.borderColor = T.blue}
              onBlur={e => e.target.style.borderColor = T.border} />
          </div>
          <div style={{ marginBottom: 20 }}>
            <label style={{ display: 'block', fontSize: 11, fontWeight: 600, color: T.text1, letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: 7 }}>Amount (USD)</label>
            <div style={{ display: 'flex', gap: 10 }}>
              <input type="number" value={amount} onChange={e => setAmount(e.target.value)} placeholder="0.00"
                style={{ flex: 1, padding: '11px 14px', background: T.bg3, border: `1px solid ${T.border}`, borderRadius: 10, color: T.text0, fontSize: 14, fontFamily: T.mono, outline: 'none' }}
                onFocus={e => e.target.style.borderColor = T.blue}
                onBlur={e => e.target.style.borderColor = T.border} />
              <button onClick={() => setAmount(String(balance))}
                style={{ padding: '11px 16px', background: T.bg3, border: `1px solid ${T.border}`, color: T.text1, borderRadius: 10, cursor: 'pointer', fontSize: 12, fontWeight: 600, fontFamily: T.font }}>
                MAX
              </button>
            </div>
          </div>
          <div style={{ background: T.yellowDim, border: `1px solid ${T.yellow}30`, borderRadius: 10, padding: '12px 16px', marginBottom: 20, fontSize: 12, color: T.yellow, lineHeight: 1.6 }}>
             Withdrawals are reviewed. Please allow 24 hours for processing.
          </div>
          <button onClick={handleSubmit} disabled={!address || !amount || submitting}
            style={{ width: '100%', padding: '14px', background: address && amount ? T.teal : T.bg3, color: address && amount ? '#0d0e14' : T.text2, border: 'none', borderRadius: 12, fontSize: 14, fontWeight: 700, cursor: address && amount ? 'pointer' : 'not-allowed', fontFamily: T.font }}>
            {submitting ? 'Submitting...' : 'Submit Withdrawal Request'}
          </button>
        </div>
      )}

      {showSuccess && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.88)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div style={{ background: T.bg2, padding: 36, borderRadius: 22, width: '90%', maxWidth: 420, textAlign: 'center', border: `1px solid ${T.borderHi}` }}>
            <div style={{ width: 64, height: 64, borderRadius: '50%', background: T.yellowDim, border: `1px solid ${T.yellow}40`, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
              <Icon name="clock" size={28} color={T.yellow} />
            </div>
            <div style={{ fontSize: 20, fontWeight: 700, color: T.text0, marginBottom: 10 }}>Withdrawal Pending</div>
            <div style={{ fontSize: 13, color: T.text1, lineHeight: 1.7, marginBottom: 8 }}>
              Your withdrawal of <span style={{ color: T.teal, fontWeight: 700, fontFamily: T.mono }}>${Number(amount).toFixed(2)}</span> in <span style={{ color: T.text0, fontWeight: 600 }}>{selectedCrypto?.symbol}</span> has been submitted.
            </div>

            <button onClick={() => { setShowSuccess(false); setAddress(''); setAmount(''); setSelectedCrypto(null) }}
              style={{ width: '100%', padding: '13px', background: T.teal, color: '#0d0e14', border: 'none', borderRadius: 12, fontSize: 14, fontWeight: 700, cursor: 'pointer', fontFamily: T.font }}>
              Done
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

function SettingsPage({ user }) {
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [msg, setMsg] = useState('')
  const [saving, setSaving] = useState(false)

  const handlePasswordUpdate = async () => {
    if (!newPassword || newPassword !== confirmPassword) {
      setMsg('Passwords do not match.'); return
    }
    setSaving(true)
    const { error } = await supabase.auth.updateUser({ password: newPassword })
    setSaving(false)
    setMsg(error ? 'Error: ' + error.message : 'Password updated successfully!')
    setNewPassword(''); setConfirmPassword('')
    setTimeout(() => setMsg(''), 4000)
  }

  return (
    <div style={{ padding: '28px', overflowY: 'auto', flex: 1 }}>
      <h2 style={{ color: T.text0, margin: '0 0 4px', fontSize: 20, fontWeight: 700 }}>Settings</h2>
      <p style={{ color: T.text2, margin: '0 0 24px', fontSize: 13 }}>Manage your account security</p>

      {/* Change Password */}
      <div style={{ maxWidth: 580 }}>
        <div style={{ background: T.bgCard, borderRadius: 18, border: `1px solid ${T.border}`, padding: '24px 28px', marginBottom: 20 }}>
          <div style={{ fontSize: 15, fontWeight: 600, color: T.text0, marginBottom: 18 }}>Change Password</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div>
              <label style={{ display: 'block', fontSize: 11, fontWeight: 600, color: T.text1, letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: 7 }}>New Password</label>
              <input type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)} placeholder=""
                style={{ width: '100%', padding: '11px 14px', background: T.bg3, border: `1px solid ${T.border}`, borderRadius: 10, color: T.text0, fontSize: 13, fontFamily: T.font, outline: 'none', boxSizing: 'border-box' }}
                onFocus={e => e.target.style.borderColor = T.blue}
                onBlur={e => e.target.style.borderColor = T.border} />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: 11, fontWeight: 600, color: T.text1, letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: 7 }}>Confirm New Password</label>
              <input type="password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} placeholder=""
                style={{ width: '100%', padding: '11px 14px', background: T.bg3, border: `1px solid ${T.border}`, borderRadius: 10, color: T.text0, fontSize: 13, fontFamily: T.font, outline: 'none', boxSizing: 'border-box' }}
                onFocus={e => e.target.style.borderColor = T.blue}
                onBlur={e => e.target.style.borderColor = T.border} />
            </div>
          </div>
          {msg && (
            <div style={{ marginTop: 14, padding: '12px 16px', borderRadius: 10, fontSize: 13, background: msg.includes('Error') || msg.includes('match') ? T.redDim : T.tealDim, color: msg.includes('Error') || msg.includes('match') ? T.red : T.teal, border: `1px solid ${msg.includes('Error') || msg.includes('match') ? T.red : T.teal}30` }}>{msg}</div>
          )}
          <button onClick={handlePasswordUpdate} disabled={saving}
            style={{ marginTop: 20, padding: '12px 24px', background: saving ? T.bg3 : T.blue, color: saving ? T.text2 : '#fff', border: 'none', borderRadius: 12, fontSize: 13, fontWeight: 600, cursor: saving ? 'default' : 'pointer', fontFamily: T.font }}>
            {saving ? 'Updating...' : 'Update Password'}
          </button>
        </div>

        {/* Account Info */}
        <div style={{ background: T.bgCard, borderRadius: 18, border: `1px solid ${T.border}`, padding: '24px 28px' }}>
          <div style={{ fontSize: 15, fontWeight: 600, color: T.text0, marginBottom: 6 }}>Account Information</div>
          <div style={{ fontSize: 13, color: T.text2, marginBottom: 18 }}>Your account details and registration info</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {[
              ['Email', user?.email],
              ['User ID', user?.id?.slice(0, 18) + '...'],
              ['Account Created', user?.created_at ? new Date(user.created_at).toLocaleDateString() : ''],
              ['Last Sign In', user?.last_sign_in_at ? new Date(user.last_sign_in_at).toLocaleString() : ''],
            ].map(([label, val]) => (
              <div key={label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 16px', background: T.bg3, borderRadius: 10 }}>
                <span style={{ fontSize: 13, color: T.text1 }}>{label}</span>
                <span style={{ fontSize: 12, color: T.text0, fontFamily: T.mono }}>{val}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
// --- MAIN APP ----------------------------------------------------------------
export default function App() {
  const LIVE_MARKET_CONFIG = [
  { id: 'btcusdt', question: "Will BTC be above $70K in 5 minutes?",   threshold: 70000, timeframe: "5m", volume: 124000 },
  { id: 'ethusdt', question: "Will ETH be above $3K in 5 minutes?",    threshold: 3000,  timeframe: "5m", volume: 89000  },
  { id: 'solusdt', question: "Will SOL be above $150 in 5 minutes?",   threshold: 150,   timeframe: "5m", volume: 56000  },
  { id: 'bnbusdt', question: "Will BNB be above $400 in 5 minutes?",   threshold: 400,   timeframe: "5m", volume: 43000  },
  { id: 'maticusdt', question: "Will MATIC be above $1 in 5 minutes?", threshold: 1,     timeframe: "5m", volume: 31000  },
  { id: 'dogeusdt', question: "Will DOGE be above $0.15 in 5 minutes?",threshold: 0.15,  timeframe: "5m", volume: 67000  },
  { id: 'avaxusdt', question: "Will AVAX be above $30 in 5 minutes?",  threshold: 30,    timeframe: "5m", volume: 28000  },
  { id: 'linkusdt', question: "Will LINK be above $15 in 5 minutes?",  threshold: 15,    timeframe: "5m", volume: 19000  },
  { id: 'xrpusdt',  question: "Will XRP be above $0.60 in 5 minutes?", threshold: 0.60,  timeframe: "5m", volume: 92000  },
  { id: 'adausdt',  question: "Will ADA be above $0.45 in 5 minutes?", threshold: 0.45,  timeframe: "5m", volume: 35000  },
]

function calcYes(price, threshold) {
  if (!price) return 0.5
  const dist = (price - threshold) / threshold
  return Math.min(0.97, Math.max(0.03, 0.5 + dist * 8))
}

const [markets, setMarkets] = useState(
  LIVE_MARKET_CONFIG.map(m => ({ ...m, outcomePrices: [0.5, 0.5], change: '+0.0%' }))
)
  const [transactions, setTransactions] = useState([])
  const [loading, setLoading] = useState(true)
  const [showLanding, setShowLanding] = useState(true)
  const [view, setView] = useState('dashboard')
  const [adminOpen, setAdminOpen] = useState(false) // dropdown state
  const [collapsed, setCollapsed] = useState(window.innerWidth < 768)
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768)
  const [selected, setSelected] = useState(null)
  const [user, setUser] = useState(null)
  const [profile, setProfile] = useState(null)
  const [kycStatus, setKycStatus] = useState(null)
  const [balance, setBalance] = useState(0)
  const [positions, setPositions] = useState([])
  const [closedPositions, setClosedPositions] = useState([])
  useEffect(() => {
  const streams = LIVE_MARKET_CONFIG.map(m => `${m.id}@miniTicker`).join('/')
  const ws = new WebSocket(`wss://stream.binance.com:9443/stream?streams=${streams}`)

  ws.onmessage = (e) => {
    const msg = JSON.parse(e.data)
    if (!msg.data) return
    const id = msg.stream.split('@')[0]
    const price = parseFloat(msg.data.c)   // current price
    const open  = parseFloat(msg.data.o)   // 24h open price
    if (!price) return

    setMarkets(prev => prev.map(m => {
      if (m.id !== id) return m
      const config = LIVE_MARKET_CONFIG.find(c => c.id === id)
      const yes = calcYes(price, config.threshold)
      const no  = parseFloat((1 - yes).toFixed(4))
      const pctChange = open ? (((price - open) / open) * 100).toFixed(1) : '0.0'
      return {
        ...m,
        outcomePrices: [yes, no],
        change: `${pctChange >= 0 ? '+' : ''}${pctChange}%`,
        volume: m.volume + Math.floor(Math.random() * 100),
      }
    }))
  }

  ws.onerror = () => ws.close()
  const retry = () => { /* ws.onclose fires, React remounts on next render */ }
  ws.onclose = retry

  return () => ws.close()
}, [])
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
          setLoading(false)
        }
      } catch (err) {
        console.error("Auth crash:", err)
        if (mounted) setShowLanding(true)
      } finally {
        if (mounted) setLoading(false)
      }
    }
    initAuth()
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session?.user) { setUser(null); setShowLanding(true); setLoading(false) }
    })
    return () => { mounted = false; listener?.subscription?.unsubscribe() }
  }, [])
  const loadUserData = async (userId) => {
    try {
      const { data: profileData } = await supabase.from('profiles').select('balance, role, pnl').eq('id', userId).maybeSingle()
      setProfile(profileData)
      setBalance(profileData?.balance ?? 0)
      const { data: kycData } = await supabase.from('kyc_documents').select('status').eq('user_id', userId).order('submitted_at', { ascending: false }).limit(1).maybeSingle()
      setKycStatus(kycData?.status ?? 'not_started')
      const { data: txData } = await supabase.from('transactions').select('*').eq('user_id', userId).order('created_at', { ascending: false })
      setTransactions(txData ?? [])
      const { data: posData } = await supabase.from('positions').select('*').eq('user_id', userId).eq('status', 'open').order('created_at', { ascending: false })
setPositions(posData ?? [])

const { data: closedData } = await supabase.from('positions').select('*').eq('user_id', userId).eq('status', 'closed').order('created_at', { ascending: false })
setClosedPositions(closedData ?? [])

    } catch (e) {
      console.warn('loadUserData failed:', e.message)
      setKycStatus('not_started')
      setBalance(0)
      setTransactions([])
      setPositions([])
      setClosedPositions([])
    }
  }
  const handleLogin = async (u) => { setUser(u); await loadUserData(u.id); setShowLanding(false) }
  const handleLogout = async () => {
    await supabase.auth.signOut()
    setUser(null); setKycStatus(null); setBalance(0); setTransactions([]); setShowLanding(true)
  }
  const handleDepositSuccess = (newTx) => setTransactions(prev => [newTx, ...prev])
  if (loading) return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100vh', background: '#0d0e14', gap: 16 }}>
      <div style={{ width: 40, height: 40, borderRadius: '50%', border: `3px solid rgba(255,255,255,0.08)`, borderTop: `3px solid #00d4aa`, animation: 'spin 0.8s linear infinite' }} />
      <div style={{ color: '#4a4d62', fontSize: 13, fontFamily: '"DM Sans", system-ui, sans-serif' }}>Loading...</div>
      <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
    </div>
  )
  if (showLanding && view !== 'legal') return <Auth onLogin={handleLogin} onNavigate={setView} />
  if (view === 'legal') return <Legal onBack={() => setView('dashboard')} />
  const isAdmin = user && profile?.role === 'admin'
  const MAIN_NAV = [
    { id: 'dashboard', label: 'Dashboard', icon: 'dashboard' },
    { id: 'markets',   label: 'Markets',   icon: 'markets'   },
    { id: 'copy',      label: 'Copy Trade', icon: 'users',   locked: kycStatus !== 'approved' },
    { id: 'deposits',  label: 'Deposits',   icon: 'deposit', locked: kycStatus !== 'approved' },
  ]
  const BOTTOM_NAV = [
    { id: 'profile',  label: 'Profile',  icon: 'profile'  },
    { id: 'settings', label: 'Settings', icon: 'settings' },
    { id: 'withdraw', label: 'Withdraw', icon: 'withdraw', locked: kycStatus !== 'approved' },
  ]
  const ADMIN_SUBNAV = [
  { id: 'admin-kyc',       label: 'KYC Review',     icon: 'shield'  },
  { id: 'admin-deposits',  label: 'Deposit Review',  icon: 'deposit' },
  { id: 'admin-balance',   label: 'Edit Balance',    icon: 'wallet'  },
  { id: 'admin-pnl',       label: 'Edit P&L',        icon: 'trending' },
  { id: 'admin-positions', label: 'Open Positions',  icon: 'zap' },
]

  const renderPage = () => {
    if (view === 'legal') return <Legal />
    if (view === 'dashboard')      return <DashboardPage user={user} balance={balance} transactions={transactions} kycStatus={kycStatus} marketsCount={markets.length} positions={positions} closedPositions={closedPositions} pnl={profile?.pnl} />
    if (view === 'markets') {
  return (
    <MarketsPage 
      prices={markets}
      selected={selected} 
      setSelected={setSelected}
      isMobile={isMobile}
      user={user}
    />
  )
}
    if (view === 'copy') return <CopyTradingPage kycStatus={kycStatus} user={user} />
    if (view === 'deposits')       return <DepositsPage user={user} onDepositSuccess={handleDepositSuccess} kycStatus={kycStatus} />
    if (view === 'profile')        return <Profile user={user} kycStatus={kycStatus} onKycUpdate={status => setKycStatus(status)} />
    if (view === 'admin-kyc')      return <AdminKYCPage />
    if (view === 'admin-deposits') return <AdminDepositsPage />
    if (view === 'admin-balance')  return <AdminBalancePage />
    if (view === 'admin-pnl')       return <AdminPnLPage />
    if (view === 'admin-positions') return <AdminPositionsPage />
    if (view === 'settings') return <SettingsPage user={user} />
    if (view === 'withdraw') return <WithdrawPage kycStatus={kycStatus} balance={balance} user={user} onWithdrawSuccess={handleDepositSuccess} />
    return (
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 14, color: T.text2 }}>
        <Icon name={BOTTOM_NAV.find(i => i.id === view)?.icon || 'dashboard'} size={40} color={T.text2} />
        <div style={{ fontSize: 14, textTransform: 'capitalize' }}>{view}</div>
      </div>
    )
  }
  const NavItem = ({ item }) => {
    const active = view === item.id
    return (
      <div onClick={() => { setView(item.id); if (isMobile) setCollapsed(true) }} title={collapsed ? item.label : ''}
        style={{ display: 'flex', alignItems: 'center', gap: 10, padding: collapsed ? '10px' : '10px 14px', justifyContent: collapsed ? 'center' : 'flex-start', borderRadius: 10, marginBottom: 2, cursor: 'pointer', background: active ? T.bg3 : 'transparent', borderLeft: active && !collapsed ? `2px solid ${T.blue}` : '2px solid transparent', transition: 'all 0.15s' }}
        onMouseEnter={e => { if (!active) e.currentTarget.style.background = T.bgHover }}
        onMouseLeave={e => { if (!active) e.currentTarget.style.background = 'transparent' }}>
        <Icon name={item.icon} size={16} color={active ? T.blue : item.locked ? T.text2 : T.text1} />
        {!collapsed && <span style={{ fontSize: 13, fontWeight: active ? 600 : 400, color: active ? T.text0 : item.locked ? T.text2 : T.text1, flex: 1 }}>{item.label}</span>}
        {!collapsed && item.locked && <Icon name="lock" size={11} color={T.yellow} />}
      </div>
    )
  }
  // Admin dropdown parent item
  const adminActive = ADMIN_SUBNAV.some(s => s.id === view)
  const AdminDropdown = () => (
    <div>
      {/* Parent row */}
      <div
        onClick={() => { if (collapsed) { setCollapsed(false); setAdminOpen(true) } else setAdminOpen(o => !o) }}
        title={collapsed ? 'Admin Panel' : ''}
        style={{ display: 'flex', alignItems: 'center', gap: 10, padding: collapsed ? '10px' : '10px 14px', justifyContent: collapsed ? 'center' : 'flex-start', borderRadius: 10, marginBottom: 2, cursor: 'pointer', background: adminActive ? T.bg3 : 'transparent', borderLeft: adminActive && !collapsed ? `2px solid ${T.purple}` : '2px solid transparent', transition: 'all 0.15s' }}
        onMouseEnter={e => { if (!adminActive) e.currentTarget.style.background = T.bgHover }}
        onMouseLeave={e => { if (!adminActive) e.currentTarget.style.background = 'transparent' }}>
        <Icon name="shield" size={16} color={adminActive ? T.purple : T.text1} />
        {!collapsed && <>
          <span style={{ fontSize: 13, fontWeight: adminActive ? 600 : 400, color: adminActive ? T.text0 : T.text1, flex: 1 }}>Admin Panel</span>
          <Icon name={adminOpen ? 'chevronDown' : 'chevronRight'} size={13} color={T.text2} />
        </>}
      </div>
      {/* Sub-items */}
      {!collapsed && adminOpen && (
        <div style={{ marginLeft: 12, paddingLeft: 12, borderLeft: `1px solid ${T.purple}30`, marginBottom: 4 }}>
          {ADMIN_SUBNAV.map(sub => {
            const active = view === sub.id
            return (
              <div key={sub.id} onClick={() => setView(sub.id)}
                style={{ display: 'flex', alignItems: 'center', gap: 9, padding: '9px 12px', borderRadius: 8, marginBottom: 2, cursor: 'pointer', background: active ? `${T.purple}15` : 'transparent', transition: 'all 0.15s' }}
                onMouseEnter={e => { if (!active) e.currentTarget.style.background = T.bgHover }}
                onMouseLeave={e => { if (!active) e.currentTarget.style.background = 'transparent' }}>
                <Icon name={sub.icon} size={14} color={active ? T.purple : T.text2} />
                <span style={{ fontSize: 12.5, fontWeight: active ? 600 : 400, color: active ? T.text0 : T.text1 }}>{sub.label}</span>
              </div>
            )
          })}
        </div>
  
      )}
    </div>
  )

  // find icon for topbar
  const allNav = [...MAIN_NAV, ...BOTTOM_NAV, ...ADMIN_SUBNAV]
  const currentIcon = allNav.find(i => i.id === view)?.icon || 'dashboard'
  return (
    <div style={{ display: 'flex', height: '100vh', background: T.bg0, color: T.text0, fontFamily: T.font, overflow: 'hidden' }}>
      <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
      {isMobile && !collapsed && (
        <div onClick={() => setCollapsed(true)} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', zIndex: 40 }} />
      )}
      {/* -- SIDEBAR -- */}
      <div style={{
        width: collapsed ? (isMobile ? 0 : 60) : 220,
        borderRight: `1px solid ${T.border}`,
        background: T.bg1,
        display: 'flex',
        flexDirection: 'column',
        transition: 'width 0.25s ease',
        flexShrink: 0,
        position: isMobile ? 'fixed' : 'relative',
        zIndex: isMobile ? 50 : 'auto',
        height: isMobile ? '100vh' : 'auto',
        overflow: 'hidden',
      }}>
        {/* Logo */}
        <style>{`@import url('https://fonts.googleapis.com/css2?family=Roboto+Slab:wght@900&family=Manrope:wght@800&display=swap');`}</style>
        <div style={{ padding: collapsed ? '18px 12px' : '18px 16px', borderBottom: `1px solid ${T.border}`, display: 'flex', alignItems: 'center', gap: 10, justifyContent: collapsed ? 'center' : 'space-between' }}>
          {!collapsed && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <svg width="32" height="32" viewBox="0 0 32 32">
  <defs>
    <linearGradient id="lg1" x1="0" y1="0" x2="1" y2="0"><stop offset="0%" stopColor="#4f8eff"/><stop offset="100%" stopColor="#9b7dff"/></linearGradient>
  </defs>
  <path d="M16,2 L28,8 L28,18 Q28,27 16,30 Q4,27 4,18 L4,8 Z" fill="#1e2030" stroke="#4f8eff" strokeWidth="1.5"/>
  <path d="M16,5 L25,10 L25,18 Q25,25 16,27 Q7,25 7,18 L7,10 Z" fill="none" stroke="#9b7dff" strokeWidth="0.8" opacity="0.4"/>
  <text x="16" y="20" textAnchor="middle" fontSize="11" fontWeight="900" fontFamily="'Manrope', sans-serif" fill="url(#lg1)" letterSpacing="0.5">PT</text>
</svg>
              <div>
                <div style={{ fontSize: 14, fontWeight: 700, color: T.text0, lineHeight: 1 }}>PolyTrader</div>
                <div style={{ fontSize: 9, color: T.text2, letterSpacing: '0.05em' }}>PREDICTION MARKETS</div>
              </div>
            </div>
          )}
          {collapsed && <div style={{ width: 32, height: 32 }} />}
          <div onClick={() => setCollapsed(!collapsed)} style={{ cursor: 'pointer', padding: 4, borderRadius: 6 }}>
            <Icon name="menu" size={16} color={T.text2} />
          </div>
        </div>
        {/* KYC badge */}
        {!collapsed && kycStatus && kycStatus !== 'approved' && (
          <div onClick={() => setView('profile')} style={{ margin: '10px 10px 0', background: T.yellowDim, border: `1px solid ${T.yellow}30`, borderRadius: 8, padding: '8px 12px', display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
            <Icon name="shield" size={12} color={T.yellow} />
            <span style={{ fontSize: 11, color: T.yellow, fontWeight: 600 }}>KYC {kycStatus === 'pending' ? 'Pending' : 'Required'} &rarr;</span>
          </div>
        )}
        {!collapsed && kycStatus === 'approved' && (
          <div style={{ margin: '10px 10px 0', background: T.tealDim, border: `1px solid ${T.teal}30`, borderRadius: 8, padding: '8px 12px', display: 'flex', alignItems: 'center', gap: 8 }}>
            <Icon name="shield" size={12} color={T.teal} />
            <span style={{ fontSize: 11, color: T.teal, fontWeight: 600 }}>KYC Verified </span>
          </div>
        )}
        {/* Nav */}
        <div style={{ flex: 1, padding: '12px 8px', overflowY: 'auto', minHeight: 0 }}>
          {!collapsed && <div style={{ fontSize: 9, color: T.text2, letterSpacing: '0.1em', padding: '8px 8px 6px', textTransform: 'uppercase' }}>Main</div>}
          {MAIN_NAV.map(item => <NavItem key={item.id} item={item} />)}
          {/* Admin dropdown -- only for admins */}
          {isAdmin && (
            <>
              <div style={{ height: 1, background: T.border, margin: '10px 8px' }} />
              {!collapsed && <div style={{ fontSize: 9, color: T.text2, letterSpacing: '0.1em', padding: '4px 8px 6px', textTransform: 'uppercase' }}>Admin</div>}
              <AdminDropdown />
            </>
          )}
          <div style={{ height: 1, background: T.border, margin: '10px 8px' }} />
          {!collapsed && <div style={{ fontSize: 9, color: T.text2, letterSpacing: '0.1em', padding: '4px 8px 6px', textTransform: 'uppercase' }}>Account</div>}
          {BOTTOM_NAV.map(item => <NavItem key={item.id} item={item} />)}
        </div>
        {/* Logout */}
        <div style={{ padding: '12px 8px', borderTop: `1px solid ${T.border}` }}>
          <div onClick={() => { handleLogout(); if (isMobile) setCollapsed(true) }}
            style={{ display: 'flex', alignItems: 'center', gap: 10, padding: collapsed ? '10px' : '10px 14px', justifyContent: collapsed ? 'center' : 'flex-start', borderRadius: 10, cursor: 'pointer', color: T.text2, transition: 'all 0.15s' }}
            onMouseEnter={e => { e.currentTarget.style.background = T.redDim; e.currentTarget.style.color = T.red }}
            onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = T.text2 }}>
            <Icon name="logout" size={16} />
            {!collapsed && <span style={{ fontSize: 13 }}>Log out</span>}
          </div>
        </div>
      </div>
      {/* -- MAIN CONTENT -- */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        {/* Topbar */}
        <div style={{ padding: '0 24px', height: 52, borderBottom: `1px solid ${T.border}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: T.bg1, flexShrink: 0 }}>
          <div style={{ fontSize: 13, fontWeight: 600, color: T.text0, textTransform: 'capitalize', display: 'flex', alignItems: 'center', gap: 8 }}>
            {isMobile && (
              <div onClick={() => setCollapsed(false)} style={{ cursor: 'pointer', padding: '4px 8px 4px 0', marginRight: 4 }}>
                <Icon name="menu" size={18} color={T.text1} />
              </div>
            )}
            <Icon name={currentIcon} size={14} color={T.blue} />
            {view.replace('admin-', 'Admin > ')}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ fontFamily: T.mono, fontSize: 13, fontWeight: 700, color: T.teal }}>{fmt(balance)}</div>
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