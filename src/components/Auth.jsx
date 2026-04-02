import { useState } from 'react'
import { supabase } from '../lib/supabase'

const T = {
  bg0: '#0d0e14',
  bg1: '#12131c',
  bg2: '#181922',
  bg3: '#1e2030',
  bgCard: '#14151f',
  border: 'rgba(255,255,255,0.06)',
  borderHi: 'rgba(255,255,255,0.14)',
  blue: '#4f8eff',
  blueDim: 'rgba(79,142,255,0.12)',
  teal: '#00d4aa',
  tealDim: 'rgba(0,212,170,0.10)',
  red: '#ff4d6a',
  purple: '#9b7dff',
  text0: '#e8eaf0',
  text1: '#8b8fa8',
  text2: '#4a4d62',
  font: '"DM Sans", system-ui, sans-serif',
  mono: '"DM Mono", monospace',
}

const FEATURES = [
  { icon: '📈', title: 'Live Crypto Markets', desc: 'Real-time prediction markets on BTC, ETH, SOL and more.' },
  { icon: '🤖', title: 'Copy Trading', desc: 'Follow top traders and mirror their winning strategies automatically.' },
  { icon: '🔒', title: 'Secure Deposits', desc: 'Deposit USDT, BTC, ETH and USDC with full transaction history.' },
  { icon: '⚡', title: 'Instant Execution', desc: 'Lightning-fast order execution on all prediction markets.' },
]

const STATS = [
  { value: '$4.2M+', label: 'Volume Traded' },
  { value: '12,400+', label: 'Active Traders' },
  { value: '87%', label: 'Avg Win Rate' },
  { value: '7', label: 'Live Markets' },
]

export default function Auth({ onLogin }) {
  const [mode, setMode] = useState('landing') // 'landing' | 'signin' | 'signup'
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const handleAuth = async () => {
    if (!email || !password) { setError('Please fill in all fields.'); return }
    setLoading(true); setError(''); setSuccess('')
    try {
      if (mode === 'signup') {
        const { data, error } = await supabase.auth.signUp({ email, password })
        if (error) throw error
        if (data?.user?.identities?.length === 0) {
          setError('An account with this email already exists.')
        } else {
          setSuccess('Account created! Check your email to confirm, then sign in.')
          setTimeout(() => setMode('signin'), 3000)
        }
      } else {
        const { data, error } = await supabase.auth.signInWithPassword({ email, password })
        if (error) throw error
        onLogin(data.user)
      }
    } catch (e) {
      setError(e.message || 'Something went wrong.')
    } finally {
      setLoading(false)
    }
  }

  // ── Auth Modal ─────────────────────────────────────────────────────────────
  if (mode === 'signin' || mode === 'signup') {
    return (
      <div style={{ minHeight: '100vh', background: T.bg0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: T.font, padding: 20 }}>
        {/* Background glow */}
        <div style={{ position: 'fixed', top: '20%', left: '50%', transform: 'translateX(-50%)', width: 600, height: 600, borderRadius: '50%', background: 'radial-gradient(circle, rgba(79,142,255,0.06) 0%, transparent 70%)', pointerEvents: 'none' }} />

        <div style={{ width: '100%', maxWidth: 420, position: 'relative' }}>
          {/* Back to landing */}
          <button onClick={() => { setMode('landing'); setError(''); setSuccess('') }}
            style={{ background: 'none', border: 'none', color: T.text2, cursor: 'pointer', fontSize: 13, marginBottom: 24, display: 'flex', alignItems: 'center', gap: 6, padding: 0 }}>
            ← Back to home
          </button>

          {/* Card */}
          <div style={{ background: T.bgCard, borderRadius: 20, border: `1px solid ${T.borderHi}`, padding: '36px 36px 32px', boxShadow: '0 24px 64px rgba(0,0,0,0.5)' }}>
            {/* Logo */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 28 }}>
              <div style={{ width: 36, height: 36, borderRadius: 10, background: 'linear-gradient(135deg, #4f8eff, #9b7dff)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: 16, color: '#fff' }}>P</div>
              <div>
                <div style={{ fontSize: 15, fontWeight: 700, color: T.text0 }}>PolyTrader</div>
                <div style={{ fontSize: 10, color: T.text2, letterSpacing: '0.05em' }}>PREDICTION MARKETS</div>
              </div>
            </div>

            <h2 style={{ color: T.text0, margin: '0 0 6px', fontSize: 22, fontWeight: 700, letterSpacing: '-0.3px' }}>
              {mode === 'signup' ? 'Create your account' : 'Welcome back'}
            </h2>
            <p style={{ color: T.text2, margin: '0 0 28px', fontSize: 13 }}>
              {mode === 'signup' ? 'Start trading prediction markets today' : 'Sign in to your PolyTrader account'}
            </p>

            {/* Fields */}
            <div style={{ marginBottom: 14 }}>
              <label style={{ color: T.text1, fontSize: 12, fontWeight: 500, letterSpacing: '0.04em', display: 'block', marginBottom: 6 }}>EMAIL</label>
              <input type="email" value={email} onChange={e => setEmail(e.target.value)}
                placeholder="you@example.com"
                style={{ width: '100%', padding: '13px 16px', background: T.bg2, border: `1px solid ${T.border}`, borderRadius: 12, color: T.text0, fontSize: 14, outline: 'none', boxSizing: 'border-box', fontFamily: T.font, transition: 'border 0.2s' }}
                onFocus={e => e.target.style.borderColor = T.blue}
                onBlur={e => e.target.style.borderColor = T.border}
              />
            </div>

            <div style={{ marginBottom: 20 }}>
              <label style={{ color: T.text1, fontSize: 12, fontWeight: 500, letterSpacing: '0.04em', display: 'block', marginBottom: 6 }}>PASSWORD</label>
              <input type="password" value={password} onChange={e => setPassword(e.target.value)}
                placeholder="••••••••"
                onKeyDown={e => e.key === 'Enter' && handleAuth()}
                style={{ width: '100%', padding: '13px 16px', background: T.bg2, border: `1px solid ${T.border}`, borderRadius: 12, color: T.text0, fontSize: 14, outline: 'none', boxSizing: 'border-box', fontFamily: T.font, transition: 'border 0.2s' }}
                onFocus={e => e.target.style.borderColor = T.blue}
                onBlur={e => e.target.style.borderColor = T.border}
              />
            </div>

            {/* Error / Success */}
            {error && (
              <div style={{ background: 'rgba(255,77,106,0.1)', border: '1px solid rgba(255,77,106,0.25)', borderRadius: 10, padding: '10px 14px', color: T.red, fontSize: 13, marginBottom: 16 }}>
                {error}
              </div>
            )}
            {success && (
              <div style={{ background: 'rgba(0,212,170,0.1)', border: '1px solid rgba(0,212,170,0.25)', borderRadius: 10, padding: '10px 14px', color: T.teal, fontSize: 13, marginBottom: 16 }}>
                {success}
              </div>
            )}

            {/* Submit */}
            <button onClick={handleAuth} disabled={loading}
              style={{ width: '100%', padding: '14px', background: loading ? T.bg3 : 'linear-gradient(135deg, #4f8eff, #9b7dff)', color: loading ? T.text2 : '#fff', border: 'none', borderRadius: 12, fontSize: 14, fontWeight: 700, cursor: loading ? 'not-allowed' : 'pointer', marginBottom: 18, transition: 'opacity 0.2s' }}>
              {loading ? 'Please wait...' : mode === 'signup' ? 'Create Account' : 'Sign In'}
            </button>

            {/* Toggle */}
            <div style={{ textAlign: 'center', fontSize: 13, color: T.text2 }}>
              {mode === 'signup' ? 'Already have an account? ' : "Don't have an account? "}
              <span onClick={() => { setMode(mode === 'signup' ? 'signin' : 'signup'); setError(''); setSuccess('') }}
                style={{ color: T.blue, cursor: 'pointer', fontWeight: 600 }}>
                {mode === 'signup' ? 'Sign In' : 'Sign Up'}
              </span>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // ── Landing Page ────────────────────────────────────────────────────────────
  return (
    <div style={{ minHeight: '100vh', background: T.bg0, fontFamily: T.font, color: T.text0, overflowX: 'hidden' }}>

      {/* Ambient glows */}
      <div style={{ position: 'fixed', top: '-10%', right: '-5%', width: 500, height: 500, borderRadius: '50%', background: 'radial-gradient(circle, rgba(79,142,255,0.07) 0%, transparent 70%)', pointerEvents: 'none' }} />
      <div style={{ position: 'fixed', bottom: '10%', left: '-5%', width: 400, height: 400, borderRadius: '50%', background: 'radial-gradient(circle, rgba(0,212,170,0.05) 0%, transparent 70%)', pointerEvents: 'none' }} />

      {/* Navbar */}
      <nav style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 40px', height: 64, borderBottom: `1px solid ${T.border}`, background: 'rgba(13,14,20,0.85)', backdropFilter: 'blur(12px)', position: 'sticky', top: 0, zIndex: 100 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 34, height: 34, borderRadius: 9, background: 'linear-gradient(135deg, #4f8eff, #9b7dff)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: 15, color: '#fff' }}>P</div>
          <div style={{ fontSize: 16, fontWeight: 700, color: T.text0 }}>PolyTrader</div>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <button onClick={() => setMode('signin')}
            style={{ padding: '8px 20px', background: 'transparent', border: `1px solid ${T.border}`, borderRadius: 10, color: T.text1, fontSize: 13, fontWeight: 500, cursor: 'pointer', fontFamily: T.font }}>
            Sign In
          </button>
          <button onClick={() => setMode('signup')}
            style={{ padding: '8px 20px', background: 'linear-gradient(135deg, #4f8eff, #9b7dff)', border: 'none', borderRadius: 10, color: '#fff', fontSize: 13, fontWeight: 700, cursor: 'pointer', fontFamily: T.font }}>
            Get Started
          </button>
        </div>
      </nav>

      {/* Hero */}
      <div style={{ maxWidth: 860, margin: '0 auto', padding: '100px 24px 80px', textAlign: 'center' }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: T.tealDim, border: `1px solid rgba(0,212,170,0.2)`, borderRadius: 20, padding: '6px 16px', marginBottom: 32 }}>
          <div style={{ width: 7, height: 7, borderRadius: '50%', background: T.teal, boxShadow: `0 0 6px ${T.teal}` }} />
          <span style={{ fontSize: 12, color: T.teal, fontWeight: 600, letterSpacing: '0.04em' }}>LIVE PREDICTION MARKETS</span>
        </div>

        <h1 style={{ fontSize: 'clamp(36px, 6vw, 64px)', fontWeight: 800, margin: '0 0 20px', lineHeight: 1.1, letterSpacing: '-1.5px' }}>
          Trade Crypto{' '}
          <span style={{ background: 'linear-gradient(135deg, #4f8eff, #9b7dff)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            Prediction Markets
          </span>
        </h1>

        <p style={{ fontSize: 18, color: T.text1, maxWidth: 560, margin: '0 auto 40px', lineHeight: 1.7 }}>
          Predict whether Bitcoin, Ethereum, and Solana go up or down. Copy top traders. Earn real returns.
        </p>

        <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
          <button onClick={() => setMode('signup')}
            style={{ padding: '15px 36px', background: 'linear-gradient(135deg, #4f8eff, #9b7dff)', border: 'none', borderRadius: 12, color: '#fff', fontSize: 15, fontWeight: 700, cursor: 'pointer', fontFamily: T.font, boxShadow: '0 8px 32px rgba(79,142,255,0.3)' }}>
            Start Trading Free →
          </button>
          <button onClick={() => setMode('signin')}
            style={{ padding: '15px 36px', background: T.bgCard, border: `1px solid ${T.borderHi}`, borderRadius: 12, color: T.text0, fontSize: 15, fontWeight: 600, cursor: 'pointer', fontFamily: T.font }}>
            Sign In
          </button>
        </div>
      </div>

      {/* Stats bar */}
      <div style={{ maxWidth: 860, margin: '0 auto 80px', padding: '0 24px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 1, background: T.border, borderRadius: 16, overflow: 'hidden', border: `1px solid ${T.border}` }}>
          {STATS.map((s, i) => (
            <div key={i} style={{ background: T.bgCard, padding: '24px 20px', textAlign: 'center' }}>
              <div style={{ fontSize: 26, fontWeight: 800, color: T.text0, fontFamily: T.mono, letterSpacing: '-0.5px' }}>{s.value}</div>
              <div style={{ fontSize: 11, color: T.text2, marginTop: 4, letterSpacing: '0.04em', textTransform: 'uppercase' }}>{s.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Features */}
      <div style={{ maxWidth: 860, margin: '0 auto 100px', padding: '0 24px' }}>
        <h2 style={{ textAlign: 'center', fontSize: 28, fontWeight: 700, marginBottom: 40, letterSpacing: '-0.5px' }}>
          Everything you need to trade smarter
        </h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 16 }}>
          {FEATURES.map((f, i) => (
            <div key={i} style={{ background: T.bgCard, borderRadius: 16, border: `1px solid ${T.border}`, padding: '24px 22px', transition: 'border-color 0.2s' }}
              onMouseEnter={e => e.currentTarget.style.borderColor = T.borderHi}
              onMouseLeave={e => e.currentTarget.style.borderColor = T.border}>
              <div style={{ fontSize: 28, marginBottom: 14 }}>{f.icon}</div>
              <div style={{ fontSize: 15, fontWeight: 700, color: T.text0, marginBottom: 8 }}>{f.title}</div>
              <div style={{ fontSize: 13, color: T.text1, lineHeight: 1.6 }}>{f.desc}</div>
            </div>
          ))}
        </div>
      </div>

      {/* CTA Banner */}
      <div style={{ maxWidth: 860, margin: '0 auto 80px', padding: '0 24px' }}>
        <div style={{ background: 'linear-gradient(135deg, rgba(79,142,255,0.12), rgba(155,125,255,0.12))', border: `1px solid rgba(79,142,255,0.2)`, borderRadius: 20, padding: '48px 40px', textAlign: 'center' }}>
          <h2 style={{ fontSize: 28, fontWeight: 800, margin: '0 0 12px', letterSpacing: '-0.5px' }}>Ready to start trading?</h2>
          <p style={{ color: T.text1, fontSize: 15, margin: '0 0 28px' }}>Join thousands of traders on PolyTrader. Free to join.</p>
          <button onClick={() => setMode('signup')}
            style={{ padding: '15px 40px', background: 'linear-gradient(135deg, #4f8eff, #9b7dff)', border: 'none', borderRadius: 12, color: '#fff', fontSize: 15, fontWeight: 700, cursor: 'pointer', fontFamily: T.font, boxShadow: '0 8px 32px rgba(79,142,255,0.3)' }}>
            Create Free Account →
          </button>
        </div>
      </div>

      {/* Footer */}
      <div style={{ borderTop: `1px solid ${T.border}`, padding: '24px 40px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{ width: 26, height: 26, borderRadius: 7, background: 'linear-gradient(135deg, #4f8eff, #9b7dff)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: 12, color: '#fff' }}>P</div>
          <span style={{ fontSize: 13, color: T.text2 }}>PolyTrader © 2025</span>
        </div>
        <div style={{ fontSize: 12, color: T.text2 }}>Prediction Markets · Not Financial Advice</div>
      </div>
    </div>
  )
}