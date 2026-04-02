import { useState } from 'react'
import { supabase } from '../lib/supabase'

const T = {
  bg0: '#0d0e14',
  bg1: '#12131c',
  bg2: '#181922',
  bgCard: '#14151f',
  border: 'rgba(255,255,255,0.06)',
  borderHi: 'rgba(255,255,255,0.12)',
  blue: '#4f8eff',
  blueDim: 'rgba(79,142,255,0.12)',
  teal: '#00d4aa',
  tealDim: 'rgba(0,212,170,0.10)',
  red: '#ff4d6a',
  redDim: 'rgba(255,77,106,0.10)',
  purple: '#9b7dff',
  purpleDim: 'rgba(155,125,255,0.10)',
  text0: '#e8eaf0',
  text1: '#8b8fa8',
  text2: '#4a4d62',
  font: '"DM Sans", system-ui, sans-serif',
  mono: '"DM Mono", monospace',
}

const PROBLEMS = [
  'Hundreds of markets — hard to find the right one',
  'Manual analysis takes hours',
  'Bots are too technical, no coding skills',
  'Hard to stay on top with your positions',
  'No unified interface for everything',
]

const SOLUTIONS = [
  'Web interface with powerful filtering',
  'AI analysis on any market, on demand',
  'Two modes: autonomous or managed',
  'Track live, improve results',
  'Unified platform: explore → direct → trade',
]

const FEATURES = [
  {
    icon: '🌐', title: 'Web Interface', color: T.teal,
    points: ['Dashboard overview', 'AI + MCP', 'Probability on demand', 'Live import'],
  },
  {
    icon: '🤖', title: 'Directed Bot Trading', color: T.blue,
    points: ['Utilize live RLHF/LLM', 'Train on your market', 'Learn from preferences', 'None-stop improvement'],
  },
  {
    icon: '⚡', title: 'AI-Powered Analysis', color: T.purple,
    points: ['Real-time market event alerts', 'Smart QA on current P&L', 'Optimal win analysis', 'Probability simulation', 'Top indicators'],
  },
  {
    icon: '🛡️', title: 'Risk Protection', color: '#f5c842',
    points: ['Automatic hedging up to 85%', 'Automatic hedge badge', 'Loss limit at 20%'],
  },
]

const ADVANCED_TOOLS = ['Event Agents & MCP', 'Real-Time Monitoring', 'Market Intelligence', 'Bot Training']

const MODES = [
  {
    icon: '🔁', title: 'Autonomous Mode', color: T.teal,
    sub: 'Set it and forget it',
    tag: 'For busy traders, passive income',
    points: ['Bot finds markets based on your criteria', 'AI analyzes and makes decisions', 'Automatic order placement'],
  },
  {
    icon: '🎯', title: 'Managed Mode', color: T.purple,
    sub: 'Stay in your control',
    tag: 'For active traders, targeted bets',
    points: ['You select markets via web interface', 'You set your specific market list', 'Bot analyzes your selection'],
  },
]

const COPY_FEATURES = [
  'Trader leaderboard by P&L & win rate',
  'Adjust position size multiplier',
  'Automatic trade mirroring',
  'Stop-loss & portfolio limits',
]

const OPENCLAW_FEATURES = [
  'Connect Coinbase agents',
  'Shared signals & strategies',
  'Decentralized infrastructure',
  'MCP server connectivity',
]

const TRUST = [
  { icon: '🔒', text: 'Non-custodial — you always control your funds' },
  { icon: '👨‍💻', text: 'Built by traders, for traders' },
  { icon: '⚡', text: 'Execution-first, not narratives' },
  { icon: '🤖', text: 'AI-driven probability analysis for decision making' },
  { icon: '📊', text: 'Transparent simulation and risk management logic' },
]

export default function Auth({ onLogin }) {
  const [mode, setMode] = useState('landing')
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

  // ── Auth Modal ──────────────────────────────────────────────────────────────
  if (mode === 'signin' || mode === 'signup') {
    return (
      <div style={{ minHeight: '100vh', background: T.bg0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: T.font, padding: 20, position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'fixed', top: '15%', left: '50%', transform: 'translateX(-50%)', width: 700, height: 700, borderRadius: '50%', background: 'radial-gradient(circle, rgba(79,142,255,0.07) 0%, transparent 70%)', pointerEvents: 'none' }} />
        <div style={{ width: '100%', maxWidth: 420, position: 'relative' }}>
          <button onClick={() => { setMode('landing'); setError(''); setSuccess('') }}
            style={{ background: 'none', border: 'none', color: T.text2, cursor: 'pointer', fontSize: 13, marginBottom: 24, display: 'flex', alignItems: 'center', gap: 6, padding: 0, fontFamily: T.font }}>
            ← Back to home
          </button>
          <div style={{ background: T.bgCard, borderRadius: 20, border: `1px solid ${T.borderHi}`, padding: '36px', boxShadow: '0 24px 80px rgba(0,0,0,0.6)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 28 }}>
              <div style={{ width: 36, height: 36, borderRadius: 10, background: 'linear-gradient(135deg, #4f8eff, #9b7dff)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: 16, color: '#fff' }}>P</div>
              <div>
                <div style={{ fontSize: 15, fontWeight: 700, color: T.text0 }}>PolyTrader</div>
                <div style={{ fontSize: 10, color: T.text2, letterSpacing: '0.05em' }}>PREDICTION MARKETS</div>
              </div>
            </div>
            <h2 style={{ color: T.text0, margin: '0 0 6px', fontSize: 22, fontWeight: 800, letterSpacing: '-0.3px' }}>
              {mode === 'signup' ? 'Create your account' : 'Welcome back'}
            </h2>
            <p style={{ color: T.text2, margin: '0 0 28px', fontSize: 13 }}>
              {mode === 'signup' ? 'Your unfair advantage starts here' : 'Sign in to your PolyTrader account'}
            </p>
            <div style={{ marginBottom: 14 }}>
              <label style={{ color: T.text1, fontSize: 11, fontWeight: 600, letterSpacing: '0.06em', display: 'block', marginBottom: 6, textTransform: 'uppercase' }}>Email</label>
              <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="you@example.com"
                style={{ width: '100%', padding: '13px 16px', background: T.bg2, border: `1px solid ${T.border}`, borderRadius: 12, color: T.text0, fontSize: 14, outline: 'none', boxSizing: 'border-box', fontFamily: T.font }}
                onFocus={e => e.target.style.borderColor = T.blue} onBlur={e => e.target.style.borderColor = T.border} />
            </div>
            <div style={{ marginBottom: 20 }}>
              <label style={{ color: T.text1, fontSize: 11, fontWeight: 600, letterSpacing: '0.06em', display: 'block', marginBottom: 6, textTransform: 'uppercase' }}>Password</label>
              <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••"
                onKeyDown={e => e.key === 'Enter' && handleAuth()}
                style={{ width: '100%', padding: '13px 16px', background: T.bg2, border: `1px solid ${T.border}`, borderRadius: 12, color: T.text0, fontSize: 14, outline: 'none', boxSizing: 'border-box', fontFamily: T.font }}
                onFocus={e => e.target.style.borderColor = T.blue} onBlur={e => e.target.style.borderColor = T.border} />
            </div>
            {error && <div style={{ background: 'rgba(255,77,106,0.1)', border: '1px solid rgba(255,77,106,0.25)', borderRadius: 10, padding: '10px 14px', color: T.red, fontSize: 13, marginBottom: 16 }}>{error}</div>}
            {success && <div style={{ background: 'rgba(0,212,170,0.1)', border: '1px solid rgba(0,212,170,0.25)', borderRadius: 10, padding: '10px 14px', color: T.teal, fontSize: 13, marginBottom: 16 }}>{success}</div>}
            <button onClick={handleAuth} disabled={loading}
              style={{ width: '100%', padding: '14px', background: loading ? T.bg2 : 'linear-gradient(135deg, #4f8eff, #9b7dff)', color: loading ? T.text2 : '#fff', border: 'none', borderRadius: 12, fontSize: 14, fontWeight: 700, cursor: loading ? 'not-allowed' : 'pointer', marginBottom: 18, fontFamily: T.font }}>
              {loading ? 'Please wait...' : mode === 'signup' ? 'Create Account' : 'Sign In'}
            </button>
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

      {/* BG glows */}
      <div style={{ position: 'fixed', top: '-5%', left: '50%', transform: 'translateX(-50%)', width: 900, height: 500, borderRadius: '50%', background: 'radial-gradient(ellipse, rgba(79,142,255,0.08) 0%, transparent 65%)', pointerEvents: 'none', zIndex: 0 }} />
      <div style={{ position: 'fixed', top: '30%', right: '-10%', width: 500, height: 500, borderRadius: '50%', background: 'radial-gradient(circle, rgba(0,212,170,0.05) 0%, transparent 70%)', pointerEvents: 'none', zIndex: 0 }} />
      <div style={{ position: 'fixed', top: '60%', left: '-10%', width: 400, height: 400, borderRadius: '50%', background: 'radial-gradient(circle, rgba(155,125,255,0.05) 0%, transparent 70%)', pointerEvents: 'none', zIndex: 0 }} />

      {/* ── Navbar ── */}
      <nav style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 40px', height: 60, borderBottom: `1px solid ${T.border}`, background: 'rgba(13,14,20,0.9)', backdropFilter: 'blur(16px)', position: 'sticky', top: 0, zIndex: 100 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 30, height: 30, borderRadius: 8, background: 'linear-gradient(135deg, #4f8eff, #9b7dff)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: 14, color: '#fff' }}>P</div>
          <span style={{ fontSize: 15, fontWeight: 700, color: T.text0 }}>PolyTrader</span>
        </div>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <button onClick={() => setMode('signin')}
            style={{ padding: '7px 18px', background: 'transparent', border: `1px solid ${T.border}`, borderRadius: 8, color: T.text1, fontSize: 13, cursor: 'pointer', fontFamily: T.font }}>
            Sign In
          </button>
          <button onClick={() => setMode('signup')}
            style={{ padding: '7px 18px', background: 'linear-gradient(135deg, #4f8eff, #9b7dff)', border: 'none', borderRadius: 8, color: '#fff', fontSize: 13, fontWeight: 700, cursor: 'pointer', fontFamily: T.font }}>
            Trade →
          </button>
        </div>
      </nav>

      {/* ── Hero ── */}
      <section style={{ position: 'relative', textAlign: 'center', padding: '110px 24px 100px', zIndex: 1 }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: T.tealDim, border: `1px solid rgba(0,212,170,0.2)`, borderRadius: 20, padding: '5px 14px', marginBottom: 28 }}>
          <div style={{ width: 6, height: 6, borderRadius: '50%', background: T.teal, boxShadow: `0 0 6px ${T.teal}` }} />
          <span style={{ fontSize: 11, color: T.teal, fontWeight: 600, letterSpacing: '0.06em' }}>1,000+ AI SAVINGS</span>
        </div>
        <h1 style={{ fontSize: 'clamp(42px, 7vw, 76px)', fontWeight: 900, margin: '0 0 18px', lineHeight: 1.05, letterSpacing: '-2px' }}>
          <span style={{ background: 'linear-gradient(135deg, #4f8eff 30%, #9b7dff 70%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>PolyTrader</span>
        </h1>
        <h2 style={{ fontSize: 'clamp(18px, 3vw, 26px)', fontWeight: 600, color: T.text0, margin: '0 0 16px', letterSpacing: '-0.3px' }}>
          Your unfair advantage on Prediction Markets
        </h2>
        <p style={{ color: T.text1, fontSize: 15, maxWidth: 520, margin: '0 auto 40px', lineHeight: 1.7 }}>
          Trading Terminal with AI Analysis and Copy Trading for prediction markets
        </p>
        <button onClick={() => setMode('signup')}
          style={{ padding: '14px 40px', background: 'linear-gradient(135deg, #4f8eff, #9b7dff)', border: 'none', borderRadius: 50, color: '#fff', fontSize: 15, fontWeight: 700, cursor: 'pointer', fontFamily: T.font, boxShadow: '0 0 40px rgba(79,142,255,0.35)' }}>
          Trade →
        </button>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 12, marginTop: 48, background: T.bgCard, border: `1px solid ${T.border}`, borderRadius: 14, padding: '14px 24px' }}>
          <div style={{ textAlign: 'left' }}>
            <div style={{ fontSize: 28, fontWeight: 800, color: T.teal, fontFamily: T.mono }}>1,000+</div>
            <div style={{ fontSize: 11, color: T.text2, letterSpacing: '0.04em' }}>AI SAVINGS</div>
          </div>
        </div>
      </section>

      {/* ── Problems & Solutions ── */}
      <section style={{ position: 'relative', padding: '80px 24px', zIndex: 1, maxWidth: 1000, margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: 48 }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: T.tealDim, border: `1px solid rgba(0,212,170,0.15)`, borderRadius: 20, padding: '4px 14px', marginBottom: 20 }}>
            <span style={{ fontSize: 11, color: T.teal, fontWeight: 600 }}>✦ We solve key problems for prediction market traders</span>
          </div>
          <h2 style={{ fontSize: 'clamp(28px, 4vw, 42px)', fontWeight: 800, margin: 0, letterSpacing: '-0.5px' }}>
            Problems & <span style={{ color: T.teal }}>Solutions</span>
          </h2>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
          <div style={{ background: T.bgCard, borderRadius: 16, border: `1px solid rgba(255,77,106,0.15)`, padding: '28px 24px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 20 }}>
              <div style={{ width: 28, height: 28, borderRadius: 8, background: T.redDim, border: `1px solid rgba(255,77,106,0.25)`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13 }}>✕</div>
              <span style={{ fontWeight: 700, color: T.text0, fontSize: 15 }}>Problems</span>
            </div>
            {PROBLEMS.map((p, i) => (
              <div key={i} style={{ display: 'flex', gap: 10, alignItems: 'flex-start', marginBottom: 14 }}>
                <span style={{ color: T.red, fontSize: 13, marginTop: 1, flexShrink: 0 }}>✕</span>
                <span style={{ color: T.text1, fontSize: 13, lineHeight: 1.5 }}>{p}</span>
              </div>
            ))}
          </div>
          <div style={{ background: T.bgCard, borderRadius: 16, border: `1px solid rgba(0,212,170,0.15)`, padding: '28px 24px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 20 }}>
              <div style={{ width: 28, height: 28, borderRadius: 8, background: T.tealDim, border: `1px solid rgba(0,212,170,0.25)`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13 }}>✓</div>
              <span style={{ fontWeight: 700, color: T.text0, fontSize: 15 }}>Solutions</span>
            </div>
            {SOLUTIONS.map((s, i) => (
              <div key={i} style={{ display: 'flex', gap: 10, alignItems: 'flex-start', marginBottom: 14 }}>
                <span style={{ color: T.teal, fontSize: 13, marginTop: 1, flexShrink: 0 }}>✓</span>
                <span style={{ color: T.text1, fontSize: 13, lineHeight: 1.5 }}>{s}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Key Features ── */}
      <section style={{ position: 'relative', padding: '80px 24px', zIndex: 1, maxWidth: 1000, margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: 48 }}>
          <h2 style={{ fontSize: 'clamp(28px, 4vw, 42px)', fontWeight: 800, margin: '0 0 10px', letterSpacing: '-0.5px' }}>
            Key <span style={{ color: T.teal }}>Features</span>
          </h2>
          <p style={{ color: T.text2, fontSize: 14 }}>Complete toolkit for professional Polymarket trading</p>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 16 }}>
          {FEATURES.map((f, i) => (
            <div key={i} style={{ background: T.bgCard, borderRadius: 16, border: `1px solid ${T.border}`, padding: '24px 22px', transition: 'border-color 0.2s' }}
              onMouseEnter={e => e.currentTarget.style.borderColor = f.color + '50'}
              onMouseLeave={e => e.currentTarget.style.borderColor = T.border}>
              <div style={{ width: 40, height: 40, borderRadius: 11, background: f.color + '15', border: `1px solid ${f.color}25`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, marginBottom: 16 }}>{f.icon}</div>
              <div style={{ fontSize: 15, fontWeight: 700, color: T.text0, marginBottom: 14 }}>{f.title}</div>
              {f.points.map((p, j) => (
                <div key={j} style={{ display: 'flex', gap: 8, alignItems: 'flex-start', marginBottom: 8 }}>
                  <span style={{ color: f.color, fontSize: 12, marginTop: 2, flexShrink: 0 }}>→</span>
                  <span style={{ color: T.text1, fontSize: 12, lineHeight: 1.5 }}>{p}</span>
                </div>
              ))}
            </div>
          ))}
        </div>
        <div style={{ marginTop: 20, background: T.bgCard, borderRadius: 14, border: `1px solid ${T.border}`, padding: '20px 28px' }}>
          <div style={{ fontSize: 15, fontWeight: 700, color: T.text0, marginBottom: 16 }}>Advanced <span style={{ color: T.blue }}>Tools</span></div>
          <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap' }}>
            {ADVANCED_TOOLS.map((t, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ color: T.teal, fontSize: 13 }}>✓</span>
                <span style={{ color: T.text1, fontSize: 13 }}>{t}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Two Operating Modes ── */}
      <section style={{ position: 'relative', padding: '80px 24px', zIndex: 1, maxWidth: 1000, margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: 48 }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: T.tealDim, border: `1px solid rgba(0,212,170,0.15)`, borderRadius: 20, padding: '4px 14px', marginBottom: 20 }}>
            <span style={{ fontSize: 11, color: T.teal, fontWeight: 600 }}>✦ Choose the approach that works best for you</span>
          </div>
          <h2 style={{ fontSize: 'clamp(28px, 4vw, 42px)', fontWeight: 800, margin: 0, letterSpacing: '-0.5px' }}>
            Two Operating <span style={{ color: T.teal }}>Modes</span>
          </h2>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 16 }}>
          {MODES.map((m, i) => (
            <div key={i} style={{ background: T.bgCard, borderRadius: 18, border: `1px solid ${m.color}25`, padding: '32px 28px', position: 'relative', overflow: 'hidden' }}>
              <div style={{ position: 'absolute', top: 0, right: 0, width: 120, height: 120, borderRadius: '0 18px 0 120px', background: `${m.color}06` }} />
              <div style={{ width: 44, height: 44, borderRadius: 12, background: `${m.color}15`, border: `1px solid ${m.color}25`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, marginBottom: 18 }}>{m.icon}</div>
              <div style={{ fontSize: 18, fontWeight: 800, color: T.text0, marginBottom: 4 }}>{m.title}</div>
              <div style={{ fontSize: 13, color: T.text2, marginBottom: 20 }}>{m.sub}</div>
              {m.points.map((p, j) => (
                <div key={j} style={{ display: 'flex', gap: 10, alignItems: 'flex-start', marginBottom: 12 }}>
                  <span style={{ color: m.color, fontSize: 13, flexShrink: 0, marginTop: 1 }}>✓</span>
                  <span style={{ color: T.text1, fontSize: 13, lineHeight: 1.5 }}>{p}</span>
                </div>
              ))}
              <div style={{ marginTop: 20, display: 'inline-block', background: `${m.color}12`, border: `1px solid ${m.color}25`, borderRadius: 20, padding: '5px 14px' }}>
                <span style={{ fontSize: 11, color: m.color, fontWeight: 600 }}>{m.tag}</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Copy Trading & Openclaw ── */}
      <section style={{ position: 'relative', padding: '80px 24px', zIndex: 1, maxWidth: 1000, margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: 48 }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: T.purpleDim, border: `1px solid rgba(155,125,255,0.2)`, borderRadius: 20, padding: '4px 14px', marginBottom: 20 }}>
            <span style={{ fontSize: 11, color: T.purple, fontWeight: 600 }}>Coming Soon</span>
          </div>
          <h2 style={{ fontSize: 'clamp(28px, 4vw, 42px)', fontWeight: 800, margin: 0, letterSpacing: '-0.5px' }}>
            Copy Trading & <span style={{ color: T.teal }}>Openclaw</span>
          </h2>
          <p style={{ color: T.text2, fontSize: 14, marginTop: 10 }}>Copy top traders and leverage open AI infrastructure for prediction markets</p>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 16 }}>
          {[
            { title: 'Copy Trading', sub: 'Set it and forget it', color: T.teal, icon: '📋', points: COPY_FEATURES },
            { title: 'Openclaw Support', sub: 'Automate under your control', color: T.purple, icon: '🔗', points: OPENCLAW_FEATURES },
          ].map((section, i) => (
            <div key={i} style={{ background: T.bgCard, borderRadius: 18, border: `1px solid ${section.color}20`, padding: '28px 26px' }}>
              <div style={{ width: 42, height: 42, borderRadius: 11, background: `${section.color}15`, border: `1px solid ${section.color}25`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, marginBottom: 16 }}>{section.icon}</div>
              <div style={{ fontSize: 16, fontWeight: 700, color: T.text0, marginBottom: 4 }}>{section.title}</div>
              <div style={{ fontSize: 12, color: T.text2, marginBottom: 20 }}>{section.sub}</div>
              {section.points.map((p, j) => (
                <div key={j} style={{ display: 'flex', gap: 10, alignItems: 'flex-start', marginBottom: 12 }}>
                  <span style={{ color: section.color, fontSize: 12, flexShrink: 0, marginTop: 2 }}>✓</span>
                  <span style={{ color: T.text1, fontSize: 13, lineHeight: 1.5 }}>{p}</span>
                </div>
              ))}
            </div>
          ))}
        </div>
      </section>

      {/* ── Why Trust ── */}
      <section style={{ position: 'relative', padding: '80px 24px 60px', zIndex: 1, maxWidth: 1000, margin: '0 auto' }}>
        <h2 style={{ fontSize: 'clamp(28px, 4vw, 42px)', fontWeight: 800, textAlign: 'center', margin: '0 0 48px', letterSpacing: '-0.5px' }}>
          Why traders trust <span style={{ color: T.teal }}>PolyTrader?</span>
        </h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 14 }}>
          {TRUST.map((t, i) => (
            <div key={i} style={{ display: 'flex', gap: 14, alignItems: 'flex-start', background: T.bgCard, borderRadius: 14, border: `1px solid ${T.border}`, padding: '18px 20px' }}>
              <span style={{ fontSize: 20, flexShrink: 0 }}>{t.icon}</span>
              <span style={{ color: T.text1, fontSize: 13, lineHeight: 1.6 }}>{t.text}</span>
            </div>
          ))}
        </div>
      </section>

      {/* ── Final CTA ── */}
      <section style={{ position: 'relative', padding: '60px 24px 100px', zIndex: 1, textAlign: 'center' }}>
        <div style={{ maxWidth: 640, margin: '0 auto', background: 'linear-gradient(135deg, rgba(79,142,255,0.08), rgba(155,125,255,0.08))', border: `1px solid rgba(79,142,255,0.2)`, borderRadius: 24, padding: '56px 40px' }}>
          <h2 style={{ fontSize: 'clamp(24px, 4vw, 38px)', fontWeight: 800, margin: '0 0 14px', letterSpacing: '-0.5px' }}>Start your edge today</h2>
          <p style={{ color: T.text1, fontSize: 15, margin: '0 0 32px', lineHeight: 1.7 }}>Join thousands of traders using PolyTrader to win on prediction markets.</p>
          <button onClick={() => setMode('signup')}
            style={{ padding: '15px 48px', background: 'linear-gradient(135deg, #4f8eff, #9b7dff)', border: 'none', borderRadius: 50, color: '#fff', fontSize: 15, fontWeight: 700, cursor: 'pointer', fontFamily: T.font, boxShadow: '0 0 40px rgba(79,142,255,0.3)' }}>
            Trade → Free
          </button>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer style={{ borderTop: `1px solid ${T.border}`, padding: '20px 40px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12, background: T.bg1 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{ width: 26, height: 26, borderRadius: 7, background: 'linear-gradient(135deg, #4f8eff, #9b7dff)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: 12, color: '#fff' }}>P</div>
          <span style={{ fontSize: 13, color: T.text2 }}>PolyTrader</span>
        </div>
        <div style={{ display: 'flex', gap: 20 }}>
          {['Privacy Policy', 'Terms of Service', 'Contact'].map(l => (
            <span key={l} style={{ fontSize: 12, color: T.text2, cursor: 'pointer' }}>{l}</span>
          ))}
        </div>
        <div style={{ fontSize: 12, color: T.text2 }}>© 2025 PolyTrader. All rights reserved.</div>
      </footer>
    </div>
  )
}