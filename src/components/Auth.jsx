"use client";

import { useState, useRef, useEffect } from 'react'
import { supabase } from '../lib/supabase'

const T = {
  bg0: '#0d0e14', bg1: '#12131c', bg2: '#181922', bg3: '#1e2030', bgCard: '#14151f',
  border: 'rgba(255,255,255,0.06)', borderHi: 'rgba(255,255,255,0.14)',
  blue: '#4f8eff', blueDim: 'rgba(79,142,255,0.12)',
  teal: '#00d4aa', tealDim: 'rgba(0,212,170,0.10)',
  red: '#ff4d6a', redDim: 'rgba(255,77,106,0.10)',
  purple: '#9b7dff', purpleDim: 'rgba(155,125,255,0.10)',
  yellow: '#f5c842', yellowDim: 'rgba(245,200,66,0.10)',
  text0: '#e8eaf0', text1: '#8b8fa8', text2: '#4a4d62',
  font: '"DM Sans", system-ui, sans-serif',
  mono: '"DM Mono", monospace',
}

// Glow card  top border + box-shadow in the given color, matching screenshot exactly
function GlowCard({ color, children, style = {} }) {
  return (
    <div style={{
      background: T.bgCard,
      borderRadius: 16,
      border: `1px solid ${color}30`,
      borderTop: `2px solid ${color}`,
      boxShadow: `0 -4px 24px ${color}25, 0 0 0 0 transparent`,
      position: 'relative',
      overflow: 'hidden',
      ...style,
    }}>
      {/* subtle top glow bloom */}
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 60, background: `linear-gradient(to bottom, ${color}12, transparent)`, pointerEvents: 'none' }} />
      <div style={{ position: 'relative' }}>{children}</div>
    </div>
  )
}

function withTimeout(promise, ms = 15000) {
  let timeoutId
  const timeout = new Promise((_, reject) => {
    timeoutId = setTimeout(() => reject(new Error('Request timed out. Please try again.')), ms)
  })
  return Promise.race([promise, timeout]).finally(() => clearTimeout(timeoutId))
}

function useIsMobile(breakpoint = 640) {
  const [isMobile, setIsMobile] = useState(
    typeof window !== 'undefined' ? window.innerWidth < breakpoint : false
  )
  useEffect(() => {
    const handler = () => setIsMobile(window.innerWidth < breakpoint)
    window.addEventListener('resize', handler)
    return () => window.removeEventListener('resize', handler)
  }, [breakpoint])
  return isMobile
}

const PROBLEMS = [
  'Hundreds of markets  hard to find the right one',
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
  'Unified platform: explore  direct  trade',
]

//  SVG ICONS 

function SvgGrid({ color }) {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
      <rect x="2"  y="2"  width="7" height="7" rx="1.5" fill={color} />
      <rect x="11" y="2"  width="7" height="7" rx="1.5" fill={color} opacity=".55" />
      <rect x="2"  y="11" width="7" height="7" rx="1.5" fill={color} opacity=".55" />
      <rect x="11" y="11" width="7" height="7" rx="1.5" fill={color} opacity=".3" />
    </svg>
  )
}
function SvgStarburst({ color }) {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
      <circle cx="10" cy="10" r="2"   fill={color} />
      <circle cx="10" cy="3"  r="1.2" fill={color} opacity=".9" />
      <circle cx="10" cy="17" r="1.2" fill={color} opacity=".9" />
      <circle cx="3"  cy="10" r="1.2" fill={color} opacity=".9" />
      <circle cx="17" cy="10" r="1.2" fill={color} opacity=".9" />
      <circle cx="4.9"  cy="4.9"  r="1" fill={color} opacity=".6" />
      <circle cx="15.1" cy="4.9"  r="1" fill={color} opacity=".6" />
      <circle cx="4.9"  cy="15.1" r="1" fill={color} opacity=".6" />
      <circle cx="15.1" cy="15.1" r="1" fill={color} opacity=".6" />
    </svg>
  )
}
function SvgBolt({ color }) {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
      <path d="M11.5 2L4 11h7l-2.5 7L18 9h-7l.5-7z" fill={color} />
    </svg>
  )
}
function SvgShieldIcon({ color }) {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
      <path d="M10 2L3 5.5V10c0 3.87 2.96 7.5 7 8.5 4.04-1 7-4.63 7-8.5V5.5L10 2z"
        stroke={color} strokeWidth="1.6" fill="none" strokeLinejoin="round" />
      <path d="M7 10l2 2 4-4" stroke={color} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}
function SvgRotate({ color }) {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
      <path d="M2 7a5 5 0 1 0 1-3" stroke={color} strokeWidth="1.4" strokeLinecap="round" />
      <path d="M1 2v3h3" stroke={color} strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}
function SvgTargetBadge({ color }) {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
      <circle cx="7" cy="7" r="6" stroke={color} strokeWidth="1.3" />
      <circle cx="7" cy="7" r="2.2" fill={color} />
    </svg>
  )
}
function SvgCheck({ color }) {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" style={{ flexShrink: 0, marginTop: 1 }}>
      <circle cx="8" cy="8" r="7" fill={color + '25'} />
      <path d="M5 8l2.2 2.2L11 5.5" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

// Trust icons
function TrustIconShield() {
  return (
    <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
      <path d="M11 2L3 6V11c0 4.42 3.36 8.57 8 9.93C16.64 19.57 20 15.42 20 11V6L11 2z"
        stroke={T.teal} strokeWidth="1.6" fill="none" strokeLinejoin="round" />
      <path d="M8 11l2.2 2.2L14 8" stroke={T.teal} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}
function TrustIconPeople() {
  return (
    <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
      <circle cx="8"  cy="7" r="3" stroke={T.teal} strokeWidth="1.5" />
      <path d="M2 18c0-3.31 2.69-6 6-6" stroke={T.teal} strokeWidth="1.5" strokeLinecap="round" />
      <circle cx="16" cy="7" r="3" stroke={T.teal} strokeWidth="1.5" opacity=".55" />
      <path d="M20 18c0-3.31-2.69-6-6-6" stroke={T.teal} strokeWidth="1.5" strokeLinecap="round" opacity=".55" />
    </svg>
  )
}
function TrustIconTarget() {
  return (
    <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
      <circle cx="11" cy="11" r="9" stroke={T.teal} strokeWidth="1.5" />
      <circle cx="11" cy="11" r="5" stroke={T.teal} strokeWidth="1.5" opacity=".65" />
      <circle cx="11" cy="11" r="2" fill={T.teal} />
    </svg>
  )
}
function TrustIconBrain() {
  return (
    <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
      <path d="M11 3C7.5 3 5 5.5 5 8.5c0 1.4.5 2.6 1.3 3.5-.8.6-1.3 1.5-1.3 2.5C5 16.3 6.7 18 8.8 18h4.4c2.1 0 3.8-1.7 3.8-3.5 0-1-.5-1.9-1.3-2.5.8-.9 1.3-2.1 1.3-3.5C17 5.5 14.5 3 11 3z"
        stroke={T.teal} strokeWidth="1.5" fill="none" strokeLinejoin="round" />
      <path d="M11 3v15M7.5 9.5h7M7.5 13h7" stroke={T.teal} strokeWidth="1.2" strokeLinecap="round" opacity=".5" />
    </svg>
  )
}
function TrustIconEye() {
  return (
    <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
      <path d="M2 11s3.5-7 9-7 9 7 9 7-3.5 7-9 7-9-7-9-7z"
        stroke={T.teal} strokeWidth="1.5" fill="none" strokeLinejoin="round" />
      <circle cx="11" cy="11" r="2.8" stroke={T.teal} strokeWidth="1.5" />
    </svg>
  )
}

//  DATA 

const FEATURES = [
  { svgIcon: (c) => <SvgGrid color={c} />,        title: 'Web interface',        color: T.teal,   points: ['Dashboard overview', 'AI + MCP', 'Probability on demand', 'Live import'] },
  { svgIcon: (c) => <SvgStarburst color={c} />,   title: 'Directed bot trading', color: T.blue,   points: ['Utilize live RLHF/LLM', 'Train on your market', 'Learn from preferences', 'Non-stop improvement'] },
  { svgIcon: (c) => <SvgBolt color={c} />,         title: 'AI-powered analysis',  color: T.purple, points: ['Real-time market event alerts', 'Smart QA on current P&L', 'Optimal win analysis', 'Probability simulation'] },
  { svgIcon: (c) => <SvgShieldIcon color={c} />,   title: 'Risk protection',      color: T.yellow, points: ['Automatic hedging up to 85%', 'Automatic hedge badge', 'Loss limit at 20%'] },
]

const MODES = [
  { badgeIcon: (c) => <SvgRotate color={c} />,      badgeLabel: 'Autonomous mode', color: T.teal,   title: 'Set it and forget it', subtitle: 'For busy traders, passive income',   points: ['Bot finds markets based on your criteria', 'AI analyzes and makes decisions', 'Automatic order placement'] },
  { badgeIcon: (c) => <SvgTargetBadge color={c} />, badgeLabel: 'Managed mode',    color: T.purple, title: 'Stay in control',       subtitle: 'For active traders, targeted bets', points: ['You select markets via web interface', 'You set your specific market list', 'Bot analyzes your selection'] },
]

//  FORM HELPERS 

function Field({ label, type = 'text', value, onChange, placeholder, required }) {
  return (
    <div style={{ marginBottom: 14 }}>
      <label style={{ color: T.text1, fontSize: 11, fontWeight: 600, letterSpacing: '0.06em', display: 'block', marginBottom: 6, textTransform: 'uppercase' }}>
        {label}{required && <span style={{ color: T.red }}> *</span>}
      </label>
      <input type={type} value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder}
        style={{ width: '100%', padding: '12px 14px', background: T.bg2, border: `1px solid ${T.border}`, borderRadius: 10, color: T.text0, fontSize: 13, outline: 'none', boxSizing: 'border-box', fontFamily: T.font }}
        onFocus={e => e.target.style.borderColor = T.blue}
        onBlur={e => e.target.style.borderColor = T.border} />
    </div>
  )
}

function Steps({ current }) {
  const steps = ['Account', 'Personal Details']
  return (
    <div style={{ display: 'flex', alignItems: 'center', marginBottom: 28 }}>
      {steps.map((s, i) => (
        <div key={i} style={{ display: 'flex', alignItems: 'center', flex: i < steps.length - 1 ? 1 : 'none' }}>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 5 }}>
            <div style={{ width: 28, height: 28, borderRadius: '50%', background: i < current ? T.teal : i === current ? T.blue : T.bg3, border: `2px solid ${i < current ? T.teal : i === current ? T.blue : T.border}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 700, color: i <= current ? '#fff' : T.text2 }}>
              {i < current ? '' : i + 1}
            </div>
            <span style={{ fontSize: 9, color: i === current ? T.text0 : T.text2, fontWeight: i === current ? 600 : 400, whiteSpace: 'nowrap' }}>{s}</span>
          </div>
          {i < steps.length - 1 && <div style={{ flex: 1, height: 2, background: i < current ? T.teal : T.border, margin: '0 8px', marginBottom: 18 }} />}
        </div>
      ))}
    </div>
  )
}

function Logo() {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 24 }}>
      <div style={{ width: 36, height: 36, borderRadius: 10, background: 'linear-gradient(135deg, #4f8eff, #9b7dff)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: 16, color: '#fff' }}>P</div>
      <div>
        <div style={{ fontSize: 15, fontWeight: 700, color: T.text0 }}>PolyTrader</div>
        <div style={{ fontSize: 10, color: T.text2, letterSpacing: '0.05em' }}>PREDICTION MARKETS</div>
      </div>
    </div>
  )
}

function ErrorBox({ msg }) {
  if (!msg) return null
  return <div style={{ background: T.redDim, border: `1px solid ${T.red}30`, borderRadius: 10, padding: '10px 14px', color: T.red, fontSize: 13, marginBottom: 16, lineHeight: 1.5 }}>{msg}</div>
}
function SuccessBox({ msg }) {
  if (!msg) return null
  return <div style={{ background: T.tealDim, border: `1px solid ${T.teal}30`, borderRadius: 10, padding: '10px 14px', color: T.teal, fontSize: 13, marginBottom: 16 }}>{msg}</div>
}
function PrimaryBtn({ onClick, disabled, loading, children }) {
  return (
    <button onClick={onClick} disabled={disabled || loading}
      style={{ width: '100%', padding: '14px', background: disabled || loading ? T.bg3 : 'linear-gradient(135deg, #4f8eff, #9b7dff)', color: disabled || loading ? T.text2 : '#fff', border: 'none', borderRadius: 12, fontSize: 14, fontWeight: 700, cursor: disabled || loading ? 'not-allowed' : 'pointer', fontFamily: T.font, transition: 'all 0.2s' }}>
      {children}
    </button>
  )
}

//  SECTION CARDS 

function FeatureCard({ feature, isMobile }) {
  const { svgIcon, title, color, points } = feature
  const pad = isMobile ? '14px 12px 16px' : '22px 22px 26px'
  const iconSize = isMobile ? 34 : 44
  const iconRadius = isMobile ? 9 : 11
  const titleSize = isMobile ? 13 : 16
  const itemPad = isMobile ? '7px 10px' : '10px 14px'
  const itemFont = isMobile ? 11 : 13
  const itemGap = isMobile ? 6 : 8
  return (
    <GlowCard color={color} style={{ padding: pad }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: isMobile ? 10 : 14, marginBottom: isMobile ? 12 : 18 }}>
        <div style={{ width: iconSize, height: iconSize, borderRadius: iconRadius, background: color + '18', border: `1px solid ${color}35`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          {svgIcon(color)}
        </div>
        <p style={{ fontSize: titleSize, fontWeight: 700, color: T.text0, margin: 0, lineHeight: 1.3 }}>{title}</p>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: itemGap }}>
        {points.map(pt => (
          <div key={pt} style={{ display: 'flex', alignItems: 'center', gap: itemGap, background: color + '0a', border: `1px solid ${color}18`, borderRadius: 8, padding: itemPad }}>
            <span style={{ width: isMobile ? 4 : 5, height: isMobile ? 4 : 5, borderRadius: '50%', background: color, flexShrink: 0, display: 'inline-block', opacity: 0.7 }} />
            <span style={{ fontSize: itemFont, color: T.text1, lineHeight: 1.3 }}>{pt}</span>
          </div>
        ))}
      </div>
    </GlowCard>
  )
}

function ModeCard({ mode, isMobile }) {
  const { badgeIcon, badgeLabel, color, title, subtitle, points } = mode
  const pad = isMobile ? '14px 12px 16px' : '22px 22px 26px'
  const itemPad = isMobile ? '7px 10px' : '10px 14px'
  const itemFont = isMobile ? 11 : 13
  const itemGap = isMobile ? 6 : 8
  return (
    <GlowCard color={color} style={{ padding: pad }}>
      <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: isMobile ? '3px 8px' : '5px 12px', borderRadius: 20, background: color + '18', border: `1px solid ${color}35`, color, fontSize: isMobile ? 10 : 12, fontWeight: 600, marginBottom: isMobile ? 10 : 16 }}>
        {badgeIcon(color)}{badgeLabel}
      </div>
      <p style={{ fontSize: isMobile ? 14 : 18, fontWeight: 700, color: T.text0, margin: '0 0 3px 0' }}>{title}</p>
      <p style={{ fontSize: isMobile ? 10 : 12, color: T.text2, margin: `0 0 ${isMobile ? 10 : 16}px 0` }}>{subtitle}</p>
      <div style={{ display: 'flex', flexDirection: 'column', gap: itemGap }}>
        {points.map(pt => (
          <div key={pt} style={{ display: 'flex', alignItems: 'center', gap: itemGap, background: color + '0a', border: `1px solid ${color}18`, borderRadius: 8, padding: itemPad }}>
            <SvgCheck color={color} />
            <span style={{ fontSize: itemFont, color: T.text1, lineHeight: 1.3 }}>{pt}</span>
          </div>
        ))}
      </div>
    </GlowCard>
  )
}

function TrustPill({ icon, text, color, isMobile }) {
  return (
    <GlowCard color={color} style={{ display: 'flex', alignItems: 'center', gap: isMobile ? 10 : 18, padding: isMobile ? '12px 12px' : '20px 24px' }}>
      <div style={{ width: isMobile ? 34 : 46, height: isMobile ? 34 : 46, borderRadius: isMobile ? 9 : 12, background: color + '15', border: `1px solid ${color}35`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
        {icon}
      </div>
      <span style={{ fontSize: isMobile ? 11 : 15, fontWeight: 500, color: T.text0, lineHeight: 1.4 }}>{text}</span>
    </GlowCard>
  )
}

//  KYC PENDING 

export function KYCPending({ user, kycStatus, onLogout }) {
  return (
    <div style={{ minHeight: '100vh', background: T.bg0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: T.font, padding: 20 }}>
      <div style={{ maxWidth: 460, width: '100%', textAlign: 'center' }}>
        <Logo />
        <div style={{ background: T.bgCard, borderRadius: 20, border: `1px solid ${T.borderHi}`, padding: '40px 36px' }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>{kycStatus === 'rejected' ? '' : ''}</div>
          <h2 style={{ color: kycStatus === 'rejected' ? T.red : T.text0, fontSize: 22, fontWeight: 800, margin: '0 0 12px' }}>
            {kycStatus === 'rejected' ? 'KYC Rejected' : 'KYC Under Review'}
          </h2>
          <p style={{ color: T.text1, fontSize: 14, lineHeight: 1.7, margin: '0 0 24px' }}>
            {kycStatus === 'rejected' ? 'Your documents were rejected. Please contact support to resubmit.'
              : <>Your documents are under review. Usually takes <strong style={{ color: T.yellow }}>12 business days</strong>.</>}
          </p>
          <div style={{ display: 'flex', gap: 10 }}>
            <button onClick={() => window.location.reload()} style={{ flex: 1, padding: '12px', background: T.blueDim, color: T.blue, border: `1px solid ${T.blue}30`, borderRadius: 10, fontWeight: 600, fontSize: 13, cursor: 'pointer', fontFamily: T.font }}>Refresh Status</button>
            <button onClick={onLogout} style={{ flex: 1, padding: '12px', background: 'transparent', color: T.text2, border: `1px solid ${T.border}`, borderRadius: 10, fontWeight: 600, fontSize: 13, cursor: 'pointer', fontFamily: T.font }}>Log Out</button>
          </div>
        </div>
      </div>
    </div>
  )
}

//  MAIN COMPONENT 

export default function Auth({ onLogin, onNavigate }) {
  const [mode, setMode] = useState('landing')
  const [step, setStep] = useState(0)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [phone, setPhone] = useState('')
  const [address, setAddress] = useState('')
  const [city, setCity] = useState('')
  const [country, setCountry] = useState('')
  const timeoutRef = useRef(null)
  useEffect(() => () => { if (timeoutRef.current) clearTimeout(timeoutRef.current) }, [])

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [signupUser, setSignupUser] = useState(null)
  const reset = () => { setError(''); setSuccess('') }

  const handleSignIn = async () => {
    if (!email || !password) { setError('Please fill in all fields.'); return }
    setLoading(true); reset()
    try {
      const { data, error: err } = await withTimeout(supabase.auth.signInWithPassword({ email, password }), 15000)
      if (err) { setError(err.message.toLowerCase().includes('email not confirmed') ? 'Please confirm your email first.' : err.message.toLowerCase().includes('invalid') || err.message.toLowerCase().includes('credentials') ? 'Wrong email or password.' : err.message); return }
      if (!data?.user) { setError('Login failed.'); return }
      if (onLogin && typeof onLogin === 'function') await Promise.resolve(onLogin(data.user))
      else window.location.href = '/dashboard'
    } catch (e) { setError(e.message || 'Something went wrong.') }
    finally { setLoading(false) }
  }

  const handleAccountStep = async () => {
    if (!email || !password || !confirmPassword) { setError('Please fill in all fields.'); return }
    if (password !== confirmPassword) { setError('Passwords do not match.'); return }
    if (password.length < 6) { setError('Password must be at least 6 characters.'); return }
    setLoading(true); reset()
    try {
      const { data, error: err } = await withTimeout(supabase.auth.signUp({ email, password }))
      if (err) { setError(err.message.toLowerCase().includes('already') || err.message.toLowerCase().includes('registered') ? 'An account with this email already exists.' : err.message); return }
      const user = data?.user
      if (!user) { setError('Signup failed. Please try again.'); return }
      if (user.identities && user.identities.length === 0) { setError('An account with this email already exists.'); return }
      setSignupUser(user)
      if (data.session) setStep(1); else setMode('check_email')
    } catch (e) { setError(e.message || 'Signup failed.') }
    finally { setLoading(false) }
  }

  const handleDetailsStep = async () => {
    if (!firstName || !lastName || !phone || !address || !city || !country) { setError('Please fill in all required fields.'); return }
    setLoading(true); reset()
    try {
      const { data: { user } } = await withTimeout(supabase.auth.getUser())
      const uid = user?.id || signupUser?.id
      if (!uid) { setError('Session expired. Please go back and sign in again.'); return }
      const { error: profileError } = await withTimeout(supabase.from('profiles').upsert({ id: uid, first_name: firstName, last_name: lastName, phone, address, city, country, kyc_status: 'not_started', updated_at: new Date().toISOString() }))
      if (profileError) throw profileError
      setSuccess(' Account created! Taking you to your dashboard...')
      setTimeout(() => onLogin(user || signupUser), 1200)
    } catch (e) { setError(e.message || 'Failed to save details.') }
    finally { setLoading(false) }
  }

  if (mode === 'check_email') return (
    <div style={{ minHeight: '100vh', background: T.bg0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: T.font, padding: 20 }}>
      <div style={{ width: '100%', maxWidth: 420, textAlign: 'center' }}>
        <div style={{ width: 72, height: 72, borderRadius: '50%', background: T.tealDim, border: `2px solid ${T.teal}40`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 32, margin: '0 auto 24px' }}></div>
        <h2 style={{ color: T.text0, fontSize: 22, fontWeight: 800, margin: '0 0 12px' }}>Check your email</h2>
        <p style={{ color: T.text1, fontSize: 14, lineHeight: 1.7, margin: '0 0 28px' }}>We sent a confirmation link to <strong style={{ color: T.text0 }}>{email}</strong>.<br />Click the link to activate your account, then sign in.</p>
        <button onClick={() => { setMode('signin'); reset() }} style={{ width: '100%', padding: '14px', background: 'linear-gradient(135deg, #4f8eff, #9b7dff)', border: 'none', borderRadius: 12, fontSize: 14, fontWeight: 700, cursor: 'pointer', fontFamily: T.font, marginBottom: 14 }}>Go to Sign In </button>
        <p style={{ color: T.text2, fontSize: 12 }}>Didn't receive it? Check spam or <span onClick={() => { setMode('signup'); setStep(0); reset() }} style={{ color: T.blue, cursor: 'pointer' }}>try again</span></p>
      </div>
    </div>
  )

  if (mode === 'signin') return (
    <div style={{ minHeight: '100vh', background: T.bg0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: T.font, padding: 20 }}>
      <div style={{ width: '100%', maxWidth: 420 }}>
        <button onClick={() => { setMode('landing'); reset() }} style={{ background: 'none', border: 'none', color: T.text2, cursor: 'pointer', fontSize: 13, marginBottom: 20, padding: 0, fontFamily: T.font }}> Back to home</button>
        <div style={{ background: T.bgCard, borderRadius: 20, border: `1px solid ${T.borderHi}`, padding: '36px', boxShadow: '0 24px 80px rgba(0,0,0,0.5)' }}>
          <Logo />
          <h2 style={{ color: T.text0, margin: '0 0 6px', fontSize: 22, fontWeight: 800 }}>Welcome back</h2>
          <p style={{ color: T.text2, margin: '0 0 24px', fontSize: 13 }}>Sign in to your PolyTrader account</p>
          <Field label="Email" type="email" value={email} onChange={v => { setEmail(v); reset() }} placeholder="you@example.com" required />
          <Field label="Password" type="password" value={password} onChange={v => { setPassword(v); reset() }} placeholder="" required />
          <ErrorBox msg={error} />
          <PrimaryBtn onClick={handleSignIn} loading={loading}>{loading ? 'Signing in...' : 'Sign In '}</PrimaryBtn>
          <div style={{ textAlign: 'center', fontSize: 13, color: T.text2, marginTop: 16 }}>Don't have an account? <span onClick={() => { setMode('signup'); setStep(0); reset() }} style={{ color: T.blue, cursor: 'pointer', fontWeight: 600 }}>Sign Up</span></div>
        </div>
      </div>
    </div>
  )

  if (mode === 'signup') return (
    <div style={{ minHeight: '100vh', background: T.bg0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: T.font, padding: 20, overflowY: 'auto' }}>
      <div style={{ width: '100%', maxWidth: 480, paddingTop: 20 }}>
        <button onClick={() => { if (step === 0) { setMode('landing'); reset() } else { setStep(s => s - 1); reset() } }} style={{ background: 'none', border: 'none', color: T.text2, cursor: 'pointer', fontSize: 13, marginBottom: 20, padding: 0, fontFamily: T.font }}> {step === 0 ? 'Back to home' : 'Back'}</button>
        <div style={{ background: T.bgCard, borderRadius: 20, border: `1px solid ${T.borderHi}`, padding: '36px', boxShadow: '0 24px 80px rgba(0,0,0,0.4)' }}>
          <Logo />
          <Steps current={step} />
          {step === 0 && <>
            <h2 style={{ color: T.text0, margin: '0 0 4px', fontSize: 20, fontWeight: 800 }}>Create your account</h2>
            <p style={{ color: T.text2, margin: '0 0 22px', fontSize: 13 }}>Your unfair advantage starts here</p>
            <Field label="Email Address" type="email" value={email} onChange={v => { setEmail(v); reset() }} placeholder="you@example.com" required />
            <Field label="Password" type="password" value={password} onChange={v => { setPassword(v); reset() }} placeholder="Min. 6 characters" required />
            <Field label="Confirm Password" type="password" value={confirmPassword} onChange={v => { setConfirmPassword(v); reset() }} placeholder="Repeat password" required />
            <ErrorBox msg={error} />
            <PrimaryBtn onClick={handleAccountStep} loading={loading}>{loading ? 'Creating account...' : 'Continue '}</PrimaryBtn>
            <div style={{ textAlign: 'center', fontSize: 13, color: T.text2, marginTop: 16 }}>Already have an account? <span onClick={() => { setMode('signin'); reset() }} style={{ color: T.blue, cursor: 'pointer', fontWeight: 600 }}>Sign In</span></div>
          </>}
          {step === 1 && <>
            <h2 style={{ color: T.text0, margin: '0 0 4px', fontSize: 20, fontWeight: 800 }}>Personal Details</h2>
            <p style={{ color: T.text2, margin: '0 0 22px', fontSize: 13 }}>Required for regulatory compliance</p>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 12px' }}>
              <Field label="First Name" value={firstName} onChange={setFirstName} placeholder="John" required />
              <Field label="Last Name" value={lastName} onChange={setLastName} placeholder="Smith" required />
            </div>
            <Field label="Phone Number" type="tel" value={phone} onChange={setPhone} placeholder="+1 234 567 8900" required />
            <Field label="Home Address" value={address} onChange={setAddress} placeholder="123 Main Street" required />
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 12px' }}>
              <Field label="City" value={city} onChange={setCity} placeholder="New York" required />
              <div style={{ marginBottom: 14 }}>
                <label style={{ color: T.text1, fontSize: 11, fontWeight: 600, letterSpacing: '0.06em', display: 'block', marginBottom: 6, textTransform: 'uppercase' }}>Country <span style={{ color: T.red }}>*</span></label>
                <select value={country} onChange={e => setCountry(e.target.value)} style={{ width: '100%', padding: '12px 14px', background: T.bg2, border: `1px solid ${T.border}`, borderRadius: 10, color: country ? T.text0 : T.text2, fontSize: 13, outline: 'none', fontFamily: T.font }}>
                  <option value="">Select...</option>
                  {['United States','United Kingdom','Turkey','Germany','France','Canada','Australia','Netherlands','Spain','Italy','Brazil','South Africa','Nigeria','Kenya','UAE','Singapore','Japan','South Korea','India','Other'].map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
            </div>
            <ErrorBox msg={error} />
            <SuccessBox msg={success} />
            <PrimaryBtn onClick={handleDetailsStep} loading={loading}>{loading ? 'Saving...' : 'Continue '}</PrimaryBtn>
          </>}
        </div>
      </div>
    </div>
  )

  //  LANDING 
  const isMobile = useIsMobile()
  const col2 = '1fr 1fr'

  return (
    <div style={{ minHeight: '100vh', background: T.bg0, fontFamily: T.font, color: T.text0, overflowX: 'hidden' }}>
      <div style={{ position: 'fixed', top: '-5%', left: '50%', transform: 'translateX(-50%)', width: 900, height: 500, borderRadius: '50%', background: 'radial-gradient(ellipse, rgba(79,142,255,0.08) 0%, transparent 65%)', pointerEvents: 'none', zIndex: 0 }} />
      <div style={{ position: 'fixed', top: '30%', right: '-10%', width: 500, height: 500, borderRadius: '50%', background: 'radial-gradient(circle, rgba(0,212,170,0.05) 0%, transparent 70%)', pointerEvents: 'none', zIndex: 0 }} />

      {/* Nav */}
      <nav style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: isMobile ? '0 16px' : '0 40px', height: 60, borderBottom: `1px solid ${T.border}`, background: 'rgba(13,14,20,0.9)', backdropFilter: 'blur(16px)', position: 'sticky', top: 0, zIndex: 100 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 30, height: 30, borderRadius: 8, background: 'linear-gradient(135deg, #4f8eff, #9b7dff)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: 14, color: '#fff' }}>P</div>
          <span style={{ fontSize: 15, fontWeight: 700, color: T.text0 }}>PolyTrader</span>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button onClick={() => { setMode('signin'); reset() }} style={{ padding: '7px 18px', background: 'transparent', border: `1px solid ${T.border}`, borderRadius: 8, color: T.text1, fontSize: 13, cursor: 'pointer', fontFamily: T.font }}>Sign In</button>
          <button onClick={() => { setMode('signup'); setStep(0); reset() }} style={{ padding: '7px 18px', background: 'linear-gradient(135deg, #4f8eff, #9b7dff)', border: 'none', borderRadius: 8, color: '#fff', fontSize: 13, fontWeight: 700, cursor: 'pointer', fontFamily: T.font }}>Trade </button>
        </div>
      </nav>

      {/* Hero */}
      <section style={{ position: 'relative', textAlign: 'center', padding: isMobile ? '60px 20px 60px' : '110px 24px 100px', zIndex: 1 }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: T.tealDim, border: `1px solid rgba(0,212,170,0.2)`, borderRadius: 20, padding: '5px 14px', marginBottom: 28 }}>
          <div style={{ width: 6, height: 6, borderRadius: '50%', background: T.teal, boxShadow: `0 0 6px ${T.teal}` }} />
          <span style={{ fontSize: 11, color: T.teal, fontWeight: 600, letterSpacing: '0.06em' }}>LIVE PREDICTION MARKETS</span>
        </div>
        <h1 style={{ fontSize: 'clamp(42px, 7vw, 76px)', fontWeight: 900, margin: '0 0 18px', lineHeight: 1.05, letterSpacing: '-2px' }}>
          <span style={{ background: 'linear-gradient(135deg, #4f8eff 30%, #9b7dff 70%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>PolyTrader</span>
        </h1>
        <h2 style={{ fontSize: 'clamp(18px, 3vw, 26px)', fontWeight: 600, color: T.text0, margin: '0 0 16px' }}>Your unfair advantage on Prediction Markets</h2>
        <p style={{ color: T.text1, fontSize: 15, maxWidth: 520, margin: '0 auto 40px', lineHeight: 1.7 }}>Trading Terminal with AI Analysis and Copy Trading for prediction markets</p>
        <button onClick={() => { setMode('signup'); setStep(0); reset() }} style={{ padding: '14px 40px', background: 'linear-gradient(135deg, #4f8eff, #9b7dff)', border: 'none', borderRadius: 50, color: '#fff', fontSize: 15, fontWeight: 700, cursor: 'pointer', fontFamily: T.font, boxShadow: '0 0 40px rgba(79,142,255,0.35)' }}>Trade </button>
      </section>

      {/*  Problems & Solutions  */}
      <section style={{ padding: isMobile ? '40px 12px' : '80px 24px', maxWidth: 1000, margin: '0 auto', position: 'relative', zIndex: 1 }}>
        <div style={{ textAlign: 'center', marginBottom: isMobile ? 24 : 48 }}>
          <h2 style={{ fontSize: 'clamp(22px, 4vw, 42px)', fontWeight: 800, margin: 0 }}>Problems & <span style={{ color: T.teal }}>Solutions</span></h2>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: col2, gap: isMobile ? 8 : 16 }}>

          <GlowCard color={T.red} style={{ padding: isMobile ? '16px 12px' : '28px 24px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: isMobile ? 10 : 14, marginBottom: isMobile ? 12 : 20 }}>
              <div style={{ width: isMobile ? 34 : 44, height: isMobile ? 34 : 44, borderRadius: isMobile ? 9 : 11, background: T.red + '18', border: `1px solid ${T.red}35`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                  <path d="M4 4l10 10M14 4L4 14" stroke={T.red} strokeWidth="2" strokeLinecap="round" />
                </svg>
              </div>
              <span style={{ fontSize: isMobile ? 15 : 18, fontWeight: 700, color: T.text0 }}>Problems</span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: isMobile ? 6 : 8 }}>
              {PROBLEMS.map((p, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: isMobile ? 7 : 10, background: T.red + '0a', border: `1px solid ${T.red}18`, borderRadius: 8, padding: isMobile ? '7px 10px' : '11px 14px' }}>
                  <span style={{ color: T.red, fontSize: isMobile ? 11 : 14, fontWeight: 700, flexShrink: 0 }}></span>
                  <span style={{ color: T.text1, fontSize: isMobile ? 11 : 13, lineHeight: 1.3 }}>{p}</span>
                </div>
              ))}
            </div>
          </GlowCard>

          <GlowCard color={T.teal} style={{ padding: isMobile ? '16px 12px' : '28px 24px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: isMobile ? 10 : 14, marginBottom: isMobile ? 12 : 20 }}>
              <div style={{ width: isMobile ? 34 : 44, height: isMobile ? 34 : 44, borderRadius: isMobile ? 9 : 11, background: T.teal + '18', border: `1px solid ${T.teal}35`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                  <path d="M3 9l4.5 4.5L15 5" stroke={T.teal} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
              <span style={{ fontSize: isMobile ? 15 : 18, fontWeight: 700, color: T.text0 }}>Solutions</span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: isMobile ? 6 : 8 }}>
              {SOLUTIONS.map((s, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: isMobile ? 7 : 10, background: T.teal + '0a', border: `1px solid ${T.teal}18`, borderRadius: 8, padding: isMobile ? '7px 10px' : '11px 14px' }}>
                  <span style={{ color: T.teal, fontSize: isMobile ? 11 : 14, fontWeight: 700, flexShrink: 0 }}></span>
                  <span style={{ color: T.text1, fontSize: isMobile ? 11 : 13, lineHeight: 1.3 }}>{s}</span>
                </div>
              ))}
            </div>
          </GlowCard>

        </div>
      </section>

      {/*  Core Features  */}
      <section style={{ padding: isMobile ? '32px 12px' : '80px 24px', maxWidth: 1000, margin: '0 auto', position: 'relative', zIndex: 1 }}>
        <div style={{ display: 'grid', gridTemplateColumns: col2, gap: isMobile ? 8 : 14 }}>
          {FEATURES.map((f, i) => <FeatureCard key={i} feature={f} isMobile={isMobile} />)}
        </div>
      </section>

      {/*  Two Operating Modes  */}
      <section style={{ padding: isMobile ? '0 12px 32px' : '0 24px 80px', maxWidth: 1000, margin: '0 auto', position: 'relative', zIndex: 1 }}>
        <div style={{ display: 'grid', gridTemplateColumns: col2, gap: isMobile ? 8 : 14 }}>
          {MODES.map((m, i) => <ModeCard key={i} mode={m} isMobile={isMobile} />)}
        </div>
      </section>

      {/*  Why Traders Trust  */}
      <section style={{ padding: isMobile ? '32px 12px 48px' : '80px 24px 100px', maxWidth: 1000, margin: '0 auto', position: 'relative', zIndex: 1 }}>
        <h2 style={{ fontSize: 'clamp(32px, 5vw, 58px)', fontWeight: 900, margin: '0 0 48px 0', lineHeight: 1.1, letterSpacing: '-1px' }}>
          Why traders trust{' '}
          <span style={{ background: 'linear-gradient(90deg, #00d4aa, #9b7dff, #ff4d9b)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>PolyTrader?</span>
        </h2>
        <div style={{ display: 'grid', gridTemplateColumns: col2, gap: isMobile ? 8 : 14, marginBottom: isMobile ? 8 : 14 }}>
          <TrustPill color={T.teal}   icon={<TrustIconShield />} text="Non-custodial  you always control your funds" isMobile={isMobile} />
          <TrustPill color={T.blue}   icon={<TrustIconPeople />} text="Built by traders, for traders" isMobile={isMobile} />
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: col2, gap: isMobile ? 8 : 14, marginBottom: isMobile ? 8 : 14 }}>
          <TrustPill color={T.purple} icon={<TrustIconTarget />} text="Execution-first, not narratives" isMobile={isMobile} />
          <TrustPill color={T.yellow} icon={<TrustIconBrain />}  text="AI-driven probability analysis for decision-making" isMobile={isMobile} />
        </div>
        <div style={{ display: 'flex', justifyContent: 'center' }}>
          <div style={{ width: 'calc(50% - 7px)' }}>
            <TrustPill color={T.red} icon={<TrustIconEye />} text="Transparent execution and risk management logic" isMobile={isMobile} />
          </div>
        </div>
      </section>

      {/* CTA */}
      <section style={{ padding: '0 24px 100px', textAlign: 'center', position: 'relative', zIndex: 1 }}>
        <div style={{ maxWidth: 640, margin: '0 auto', background: 'linear-gradient(135deg, rgba(79,142,255,0.08), rgba(155,125,255,0.08))', border: `1px solid rgba(79,142,255,0.2)`, borderRadius: 24, padding: '56px 40px' }}>
          <h2 style={{ fontSize: 'clamp(24px, 4vw, 38px)', fontWeight: 800, margin: '0 0 14px' }}>Start your edge today</h2>
          <p style={{ color: T.text1, fontSize: 15, margin: '0 0 32px' }}>Join thousands of traders using PolyTrader.</p>
          <button onClick={() => { setMode('signup'); setStep(0); reset() }} style={{ padding: '15px 48px', background: 'linear-gradient(135deg, #4f8eff, #9b7dff)', border: 'none', borderRadius: 50, color: '#fff', fontSize: 15, fontWeight: 700, cursor: 'pointer', fontFamily: T.font, boxShadow: '0 0 40px rgba(79,142,255,0.3)' }}>Trade  Free</button>
        </div>
      </section>

      {/* Footer */}
      <footer style={{ borderTop: `1px solid ${T.border}`, padding: isMobile ? '20px 16px' : '20px 40px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12, background: T.bg1 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{ width: 26, height: 26, borderRadius: 7, background: 'linear-gradient(135deg, #4f8eff, #9b7dff)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: 12, color: '#fff' }}>P</div>
          <span style={{ fontSize: 13, color: T.text2 }}> © 2025 PolyTrader. All rights reserved.</span>
        </div>
        <div style={{ display: 'flex', gap: 20 }}>
          {[
           { label: 'Privacy Policy', onClick: () => onNavigate('legal') },
{ label: 'Terms of Service', onClick: () => onNavigate('legal') },
{ label: 'Contact', onClick: () => window.open('mailto:admin.polytrader@gmail.com'), icon: true },
].map(({ label, onClick, icon }, i) => (
  <span key={i} onClick={onClick}
    style={{ fontSize: 12, color: T.text2, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 5 }}
    onMouseEnter={e => e.currentTarget.style.color = T.text1}
    onMouseLeave={e => e.currentTarget.style.color = T.text2}>
    {icon && (
      <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
        <rect x="1" y="2.5" width="10" height="7" rx="1.2" stroke="currentColor" strokeWidth="1.1"/>
        <path d="M1 4l5 3.5L11 4" stroke="currentColor" strokeWidth="1.1" strokeLinecap="round"/>
      </svg>
    )}
    {label}
  </span>
))}
        </div>
      </footer>
    </div>
  )
}

