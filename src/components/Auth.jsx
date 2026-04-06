import { useState, useRef } from 'react'
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
  { icon: '🌐', title: 'Web Interface', color: T.teal, points: ['Dashboard overview', 'AI + MCP', 'Probability on demand', 'Live import'] },
  { icon: '🤖', title: 'Directed Bot Trading', color: T.blue, points: ['Utilize live RLHF/LLM', 'Train on your market', 'Learn from preferences', 'Non-stop improvement'] },
  { icon: '⚡', title: 'AI-Powered Analysis', color: T.purple, points: ['Real-time market event alerts', 'Smart QA on current P&L', 'Optimal win analysis', 'Probability simulation'] },
  { icon: '🛡️', title: 'Risk Protection', color: T.yellow, points: ['Automatic hedging up to 85%', 'Automatic hedge badge', 'Loss limit at 20%'] },
]
const MODES = [
  { icon: '🔁', title: 'Autonomous Mode', color: T.teal, sub: 'Set it and forget it', tag: 'For busy traders, passive income', points: ['Bot finds markets based on your criteria', 'AI analyzes and makes decisions', 'Automatic order placement'] },
  { icon: '🎯', title: 'Managed Mode', color: T.purple, sub: 'Stay in your control', tag: 'For active traders, targeted bets', points: ['You select markets via web interface', 'You set your specific market list', 'Bot analyzes your selection'] },
]
const TRUST = [
  { icon: '🔒', text: 'Non-custodial — you always control your funds' },
  { icon: '👨‍💻', text: 'Built by traders, for traders' },
  { icon: '⚡', text: 'Execution-first, not narratives' },
  { icon: '🤖', text: 'AI-driven probability analysis for decision making' },
  { icon: '📊', text: 'Transparent simulation and risk management logic' },
]

function withTimeout(promise, ms = 10000) {
  return Promise.race([
    promise,
    new Promise((_, reject) =>
      setTimeout(() => reject(new Error('Request timed out. Your Supabase project may be paused — check supabase.com/dashboard.')), ms)
    )
  ])
}

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
  const steps = ['Account', 'Personal Details', 'KYC Verification']
  return (
    <div style={{ display: 'flex', alignItems: 'center', marginBottom: 28 }}>
      {steps.map((s, i) => (
        <div key={i} style={{ display: 'flex', alignItems: 'center', flex: i < steps.length - 1 ? 1 : 'none' }}>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 5 }}>
            <div style={{
              width: 28, height: 28, borderRadius: '50%',
              background: i < current ? T.teal : i === current ? T.blue : T.bg3,
              border: `2px solid ${i < current ? T.teal : i === current ? T.blue : T.border}`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 11, fontWeight: 700, color: i <= current ? '#fff' : T.text2,
            }}>
              {i < current ? '✓' : i + 1}
            </div>
            <span style={{ fontSize: 9, color: i === current ? T.text0 : T.text2, fontWeight: i === current ? 600 : 400, whiteSpace: 'nowrap' }}>{s}</span>
          </div>
          {i < steps.length - 1 && (
            <div style={{ flex: 1, height: 2, background: i < current ? T.teal : T.border, margin: '0 8px', marginBottom: 18 }} />
          )}
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

export function KYCPending({ user, kycStatus, onLogout }) {
  return (
    <div style={{ minHeight: '100vh', background: T.bg0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: T.font, padding: 20 }}>
      <div style={{ maxWidth: 460, width: '100%', textAlign: 'center' }}>
        <Logo />
        <div style={{ background: T.bgCard, borderRadius: 20, border: `1px solid ${T.borderHi}`, padding: '40px 36px' }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>{kycStatus === 'rejected' ? '❌' : '⏳'}</div>
          <h2 style={{ color: kycStatus === 'rejected' ? T.red : T.text0, fontSize: 22, fontWeight: 800, margin: '0 0 12px' }}>
            {kycStatus === 'rejected' ? 'KYC Rejected' : 'KYC Under Review'}
          </h2>
          <p style={{ color: T.text1, fontSize: 14, lineHeight: 1.7, margin: '0 0 24px' }}>
            {kycStatus === 'rejected'
              ? 'Your documents were rejected. Please contact support to resubmit.'
              : <>Your documents are under review. Usually takes <strong style={{ color: T.yellow }}>1–2 business days</strong>. You can browse markets while pending.</>}
          </p>
          <div style={{ background: T.yellowDim, border: `1px solid ${T.yellow}30`, borderRadius: 12, padding: '14px 18px', marginBottom: 24, textAlign: 'left' }}>
            <div style={{ fontSize: 12, color: T.yellow, fontWeight: 600, marginBottom: 8 }}>While pending you can:</div>
            <div style={{ fontSize: 13, color: T.text1, lineHeight: 1.9 }}>
              ✓ Browse all live markets<br />
              ✗ Deposits locked<br />
              ✗ Trading locked
            </div>
          </div>
          <div style={{ display: 'flex', gap: 10 }}>
            <button onClick={() => window.location.reload()}
              style={{ flex: 1, padding: '12px', background: T.blueDim, color: T.blue, border: `1px solid ${T.blue}30`, borderRadius: 10, fontWeight: 600, fontSize: 13, cursor: 'pointer', fontFamily: T.font }}>
              Refresh Status
            </button>
            <button onClick={onLogout}
              style={{ flex: 1, padding: '12px', background: 'transparent', color: T.text2, border: `1px solid ${T.border}`, borderRadius: 10, fontWeight: 600, fontSize: 13, cursor: 'pointer', fontFamily: T.font }}>
              Log Out
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function Auth({ onLogin }) {
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
  const [kycFile, setKycFile] = useState(null)
  const [docType, setDocType] = useState('passport')
  const [dragOver, setDragOver] = useState(false)
  const fileRef = useRef()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [signupUser, setSignupUser] = useState(null)
  const [signupSession, setSignupSession] = useState(null)

  const reset = () => { setError(''); setSuccess('') }

  const handleSignIn = async () => {
    if (!email || !password) { setError('Please fill in all fields.'); return }
    setLoading(true); reset()
    try {
      const { data, error: err } = await withTimeout(
        supabase.auth.signInWithPassword({ email, password })
      )
      if (err) {
        if (err.message.toLowerCase().includes('email not confirmed')) {
          setError('Please confirm your email first. Check your inbox for the confirmation link, then try again.')
        } else if (err.message.toLowerCase().includes('invalid') || err.message.toLowerCase().includes('credentials')) {
          setError('Wrong email or password. Please try again.')
        } else {
          setError(err.message)
        }
        return
      }
      onLogin(data.user)
    } catch (e) {
      setError(e.message || 'Something went wrong.')
    } finally {
      setLoading(false)
    }
  }

  const handleAccountStep = async () => {
    if (!email || !password || !confirmPassword) { setError('Please fill in all fields.'); return }
    if (password !== confirmPassword) { setError('Passwords do not match.'); return }
    if (password.length < 6) { setError('Password must be at least 6 characters.'); return }
    setLoading(true); reset()
    try {
      const { data, error: err } = await withTimeout(supabase.auth.signUp({ email, password }))
      if (err) {
        if (err.message.toLowerCase().includes('already') || err.message.toLowerCase().includes('registered')) {
          setError('An account with this email already exists. Please sign in instead.')
        } else {
          setError(err.message)
        }
        return
      }
      const user = data?.user
      if (!user) { setError('Signup failed. Please try again.'); return }
      if (user.identities && user.identities.length === 0) {
        setError('An account with this email already exists. Please sign in instead.')
        return
      }
      setSignupUser(user)
      setSignupSession(data.session)
      if (data.session) { setStep(1) } else { setMode('check_email') }
    } catch (e) {
      setError(e.message || 'Signup failed.')
    } finally {
      setLoading(false)
    }
  }

  const handleDetailsStep = async () => {
    if (!firstName || !lastName || !phone || !address || !city || !country) {
      setError('Please fill in all required fields.'); return
    }
    setLoading(true); reset()
    try {
      const { data: { user } } = await withTimeout(supabase.auth.getUser())
      const uid = user?.id || signupUser?.id
      if (!uid) { setError('Session expired. Please go back and sign in again.'); return }
      const { error: profileError } = await withTimeout(
        supabase.from('profiles').upsert({
          id: uid, first_name: firstName, last_name: lastName,
          phone, address, city, country,
          kyc_status: 'not_started', updated_at: new Date().toISOString(),
        })
      )
      if (profileError) throw profileError
      setStep(2)
    } catch (e) {
      setError(e.message || 'Failed to save details.')
    } finally {
      setLoading(false)
    }
  }

  const handleKYCStep = async () => {
    if (!kycFile) { setError('Please upload your government ID.'); return }
    setLoading(true); reset()
    try {
      const { data: { session }, error: sessionError } = await withTimeout(supabase.auth.getSession())
      if (sessionError || !session) throw new Error('Session expired. Please sign in again.')

      const formData = new FormData()
      formData.append('file', kycFile)
      formData.append('docType', docType)

      const { data, error: fnError } = await withTimeout(
        supabase.functions.invoke('submit-kyc', {
          body: formData,
          headers: { Authorization: `Bearer ${session.access_token}` },
        }),
        30000
      )

      if (fnError) throw new Error(fnError.message || 'Upload failed')

      setSuccess('✅ KYC submitted! Taking you to your dashboard...')
      setTimeout(() => onLogin(session.user || signupUser), 1800)
    } catch (e) {
      setError('Upload failed: ' + (e.message || 'Please try again.'))
    } finally {
      setLoading(false)
    }
  }

  if (mode === 'check_email') {
    return (
      <div style={{ minHeight: '100vh', background: T.bg0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: T.font, padding: 20 }}>
        <div style={{ width: '100%', maxWidth: 420, textAlign: 'center' }}>
          <div style={{ width: 72, height: 72, borderRadius: '50%', background: T.tealDim, border: `2px solid ${T.teal}40`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 32, margin: '0 auto 24px' }}>✉️</div>
          <h2 style={{ color: T.text0, fontSize: 22, fontWeight: 800, margin: '0 0 12px' }}>Check your email</h2>
          <p style={{ color: T.text1, fontSize: 14, lineHeight: 1.7, margin: '0 0 28px' }}>
            We sent a confirmation link to <strong style={{ color: T.text0 }}>{email}</strong>.<br />
            Click the link to activate your account, then sign in to continue.
          </p>
          <button onClick={() => { setMode('signin'); reset() }}
            style={{ width: '100%', padding: '14px', background: 'linear-gradient(135deg, #4f8eff, #9b7dff)', color: '#fff', border: 'none', borderRadius: 12, fontSize: 14, fontWeight: 700, cursor: 'pointer', fontFamily: T.font, marginBottom: 14 }}>
            Go to Sign In →
          </button>
          <p style={{ color: T.text2, fontSize: 12 }}>
            Didn't receive it? Check spam or{' '}
            <span onClick={() => { setMode('signup'); setStep(0); reset() }} style={{ color: T.blue, cursor: 'pointer' }}>try again</span>
          </p>
        </div>
      </div>
    )
  }

  if (mode === 'signin') {
    return (
      <div style={{ minHeight: '100vh', background: T.bg0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: T.font, padding: 20 }}>
        <div style={{ width: '100%', maxWidth: 420, position: 'relative' }}>
          <button onClick={() => { setMode('landing'); reset() }} style={{ background: 'none', border: 'none', color: T.text2, cursor: 'pointer', fontSize: 13, marginBottom: 20, padding: 0, fontFamily: T.font }}>
            ← Back to home
          </button>
          <div style={{ background: T.bgCard, borderRadius: 20, border: `1px solid ${T.borderHi}`, padding: '36px', boxShadow: '0 24px 80px rgba(0,0,0,0.5)' }}>
            <Logo />
            <h2 style={{ color: T.text0, margin: '0 0 6px', fontSize: 22, fontWeight: 800 }}>Welcome back</h2>
            <p style={{ color: T.text2, margin: '0 0 24px', fontSize: 13 }}>Sign in to your PolyTrader account</p>
            <Field label="Email" type="email" value={email} onChange={v => { setEmail(v); reset() }} placeholder="you@example.com" required />
            <Field label="Password" type="password" value={password} onChange={v => { setPassword(v); reset() }} placeholder="••••••••" required />
            <ErrorBox msg={error} />
            <PrimaryBtn onClick={handleSignIn} loading={loading}>
              {loading ? 'Signing in...' : 'Sign In →'}
            </PrimaryBtn>
            <div style={{ textAlign: 'center', fontSize: 13, color: T.text2, marginTop: 16 }}>
              Don't have an account?{' '}
              <span onClick={() => { setMode('signup'); setStep(0); reset() }} style={{ color: T.blue, cursor: 'pointer', fontWeight: 600 }}>Sign Up</span>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (mode === 'signup') {
    return (
      <div style={{ minHeight: '100vh', background: T.bg0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: T.font, padding: 20, overflowY: 'auto' }}>
        <div style={{ width: '100%', maxWidth: 480, paddingTop: 20 }}>
          <button onClick={() => { if (step === 0) { setMode('landing'); reset() } else { setStep(s => s - 1); reset() } }}
            style={{ background: 'none', border: 'none', color: T.text2, cursor: 'pointer', fontSize: 13, marginBottom: 20, padding: 0, fontFamily: T.font }}>
            ← {step === 0 ? 'Back to home' : 'Back'}
          </button>
          <div style={{ background: T.bgCard, borderRadius: 20, border: `1px solid ${T.borderHi}`, padding: '36px', boxShadow: '0 24px 80px rgba(0,0,0,0.4)' }}>
            <Logo />
            <Steps current={step} />
            {step === 0 && (
              <>
                <h2 style={{ color: T.text0, margin: '0 0 4px', fontSize: 20, fontWeight: 800 }}>Create your account</h2>
                <p style={{ color: T.text2, margin: '0 0 22px', fontSize: 13 }}>Your unfair advantage starts here</p>
                <Field label="Email Address" type="email" value={email} onChange={v => { setEmail(v); reset() }} placeholder="you@example.com" required />
                <Field label="Password" type="password" value={password} onChange={v => { setPassword(v); reset() }} placeholder="Min. 6 characters" required />
                <Field label="Confirm Password" type="password" value={confirmPassword} onChange={v => { setConfirmPassword(v); reset() }} placeholder="Repeat password" required />
                <ErrorBox msg={error} />
                <PrimaryBtn onClick={handleAccountStep} loading={loading}>{loading ? 'Creating account...' : 'Continue →'}</PrimaryBtn>
                <div style={{ textAlign: 'center', fontSize: 13, color: T.text2, marginTop: 16 }}>
                  Already have an account?{' '}
                  <span onClick={() => { setMode('signin'); reset() }} style={{ color: T.blue, cursor: 'pointer', fontWeight: 600 }}>Sign In</span>
                </div>
              </>
            )}
            {step === 1 && (
              <>
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
                    <select value={country} onChange={e => setCountry(e.target.value)}
                      style={{ width: '100%', padding: '12px 14px', background: T.bg2, border: `1px solid ${T.border}`, borderRadius: 10, color: country ? T.text0 : T.text2, fontSize: 13, outline: 'none', fontFamily: T.font }}>
                      <option value="">Select...</option>
                      {['United States','United Kingdom','Turkey','Germany','France','Canada','Australia','Netherlands','Spain','Italy','Brazil','South Africa','Nigeria','Kenya','UAE','Singapore','Japan','South Korea','India','Other'].map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>
                </div>
                <ErrorBox msg={error} />
                <PrimaryBtn onClick={handleDetailsStep} loading={loading}>{loading ? 'Saving...' : 'Continue →'}</PrimaryBtn>
              </>
            )}
            {step === 2 && (
              <>
                <h2 style={{ color: T.text0, margin: '0 0 4px', fontSize: 20, fontWeight: 800 }}>Verify Your Identity</h2>
                <p style={{ color: T.text2, margin: '0 0 20px', fontSize: 13, lineHeight: 1.6 }}>Upload a government-issued ID to unlock deposits and trading.</p>
                <div style={{ marginBottom: 18 }}>
                  <label style={{ color: T.text1, fontSize: 11, fontWeight: 600, letterSpacing: '0.06em', display: 'block', marginBottom: 8, textTransform: 'uppercase' }}>Document Type</label>
                  <div style={{ display: 'flex', gap: 8 }}>
                    {[{ id: 'passport', label: '🛂 Passport' }, { id: 'national_id', label: '🪪 National ID' }, { id: 'drivers_license', label: '🚗 License' }].map(d => (
                      <div key={d.id} onClick={() => setDocType(d.id)}
                        style={{ flex: 1, padding: '9px 6px', textAlign: 'center', borderRadius: 10, border: `1px solid ${docType === d.id ? T.blue : T.border}`, background: docType === d.id ? T.blueDim : 'transparent', cursor: 'pointer', fontSize: 11, color: docType === d.id ? T.blue : T.text1, fontWeight: docType === d.id ? 600 : 400, transition: 'all 0.15s' }}>
                        {d.label}
                      </div>
                    ))}
                  </div>
                </div>
                <div
                  onDragOver={e => { e.preventDefault(); setDragOver(true) }}
                  onDragLeave={() => setDragOver(false)}
                  onDrop={e => { e.preventDefault(); setDragOver(false); const f = e.dataTransfer.files[0]; if (f) setKycFile(f) }}
                  onClick={() => fileRef.current.click()}
                  style={{ border: `2px dashed ${dragOver ? T.blue : kycFile ? T.teal : T.border}`, borderRadius: 14, padding: '28px 20px', textAlign: 'center', cursor: 'pointer', background: dragOver ? T.blueDim : kycFile ? T.tealDim : 'rgba(255,255,255,0.02)', transition: 'all 0.2s', marginBottom: 16 }}>
                  <input ref={fileRef} type="file" accept="image/*,.pdf" style={{ display: 'none' }} onChange={e => setKycFile(e.target.files[0])} />
                  {kycFile ? (
                    <>
                      <div style={{ fontSize: 28, marginBottom: 6 }}>✅</div>
                      <div style={{ color: T.teal, fontWeight: 600, fontSize: 13 }}>{kycFile.name}</div>
                      <div style={{ color: T.text2, fontSize: 11, marginTop: 3 }}>{(kycFile.size / 1024 / 1024).toFixed(2)} MB · Click to change</div>
                    </>
                  ) : (
                    <>
                      <div style={{ fontSize: 32, marginBottom: 8 }}>📄</div>
                      <div style={{ color: T.text1, fontWeight: 600, fontSize: 13, marginBottom: 4 }}>Drop document here or click to browse</div>
                      <div style={{ color: T.text2, fontSize: 11 }}>JPG, PNG, PDF · Max 10MB</div>
                    </>
                  )}
                </div>
                <ErrorBox msg={error} />
                <SuccessBox msg={success} />
                <PrimaryBtn onClick={handleKYCStep} disabled={!kycFile} loading={loading}>
                  {loading ? '⏳ Uploading...' : '🔐 Submit for Verification'}
                </PrimaryBtn>
                <div style={{ textAlign: 'center', marginTop: 12, fontSize: 11, color: T.text2 }}>
                  🔒 Encrypted and only used for identity verification
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div style={{ minHeight: '100vh', background: T.bg0, fontFamily: T.font, color: T.text0, overflowX: 'hidden' }}>
      <div style={{ position: 'fixed', top: '-5%', left: '50%', transform: 'translateX(-50%)', width: 900, height: 500, borderRadius: '50%', background: 'radial-gradient(ellipse, rgba(79,142,255,0.08) 0%, transparent 65%)', pointerEvents: 'none', zIndex: 0 }} />
      <div style={{ position: 'fixed', top: '30%', right: '-10%', width: 500, height: 500, borderRadius: '50%', background: 'radial-gradient(circle, rgba(0,212,170,0.05) 0%, transparent 70%)', pointerEvents: 'none', zIndex: 0 }} />
      <nav style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 40px', height: 60, borderBottom: `1px solid ${T.border}`, background: 'rgba(13,14,20,0.9)', backdropFilter: 'blur(16px)', position: 'sticky', top: 0, zIndex: 100 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 30, height: 30, borderRadius: 8, background: 'linear-gradient(135deg, #4f8eff, #9b7dff)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: 14, color: '#fff' }}>P</div>
          <span style={{ fontSize: 15, fontWeight: 700, color: T.text0 }}>PolyTrader</span>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button onClick={() => { setMode('signin'); reset() }} style={{ padding: '7px 18px', background: 'transparent', border: `1px solid ${T.border}`, borderRadius: 8, color: T.text1, fontSize: 13, cursor: 'pointer', fontFamily: T.font }}>Sign In</button>
          <button onClick={() => { setMode('signup'); setStep(0); reset() }} style={{ padding: '7px 18px', background: 'linear-gradient(135deg, #4f8eff, #9b7dff)', border: 'none', borderRadius: 8, color: '#fff', fontSize: 13, fontWeight: 700, cursor: 'pointer', fontFamily: T.font }}>Trade →</button>
        </div>
      </nav>
      <section style={{ position: 'relative', textAlign: 'center', padding: '110px 24px 100px', zIndex: 1 }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: T.tealDim, border: `1px solid rgba(0,212,170,0.2)`, borderRadius: 20, padding: '5px 14px', marginBottom: 28 }}>
          <div style={{ width: 6, height: 6, borderRadius: '50%', background: T.teal, boxShadow: `0 0 6px ${T.teal}` }} />
          <span style={{ fontSize: 11, color: T.teal, fontWeight: 600, letterSpacing: '0.06em' }}>LIVE PREDICTION MARKETS</span>
        </div>
        <h1 style={{ fontSize: 'clamp(42px, 7vw, 76px)', fontWeight: 900, margin: '0 0 18px', lineHeight: 1.05, letterSpacing: '-2px' }}>
          <span style={{ background: 'linear-gradient(135deg, #4f8eff 30%, #9b7dff 70%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>PolyTrader</span>
        </h1>
        <h2 style={{ fontSize: 'clamp(18px, 3vw, 26px)', fontWeight: 600, color: T.text0, margin: '0 0 16px' }}>Your unfair advantage on Prediction Markets</h2>
        <p style={{ color: T.text1, fontSize: 15, maxWidth: 520, margin: '0 auto 40px', lineHeight: 1.7 }}>Trading Terminal with AI Analysis and Copy Trading for prediction markets</p>
        <button onClick={() => { setMode('signup'); setStep(0); reset() }}
          style={{ padding: '14px 40px', background: 'linear-gradient(135deg, #4f8eff, #9b7dff)', border: 'none', borderRadius: 50, color: '#fff', fontSize: 15, fontWeight: 700, cursor: 'pointer', fontFamily: T.font, boxShadow: '0 0 40px rgba(79,142,255,0.35)' }}>
          Trade →
        </button>
      </section>
      <section style={{ padding: '80px 24px', maxWidth: 1000, margin: '0 auto', position: 'relative', zIndex: 1 }}>
        <div style={{ textAlign: 'center', marginBottom: 48 }}>
          <h2 style={{ fontSize: 'clamp(28px, 4vw, 42px)', fontWeight: 800, margin: 0 }}>Problems & <span style={{ color: T.teal }}>Solutions</span></h2>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
          <div style={{ background: T.bgCard, borderRadius: 16, border: `1px solid rgba(255,77,106,0.15)`, padding: '28px 24px' }}>
            <div style={{ fontWeight: 700, color: T.text0, marginBottom: 18, display: 'flex', alignItems: 'center', gap: 8 }}><span style={{ color: T.red }}>✕</span> Problems</div>
            {PROBLEMS.map((p, i) => <div key={i} style={{ display: 'flex', gap: 10, marginBottom: 12 }}><span style={{ color: T.red, flexShrink: 0 }}>✕</span><span style={{ color: T.text1, fontSize: 13 }}>{p}</span></div>)}
          </div>
          <div style={{ background: T.bgCard, borderRadius: 16, border: `1px solid rgba(0,212,170,0.15)`, padding: '28px 24px' }}>
            <div style={{ fontWeight: 700, color: T.text0, marginBottom: 18, display: 'flex', alignItems: 'center', gap: 8 }}><span style={{ color: T.teal }}>✓</span> Solutions</div>
            {SOLUTIONS.map((s, i) => <div key={i} style={{ display: 'flex', gap: 10, marginBottom: 12 }}><span style={{ color: T.teal, flexShrink: 0 }}>✓</span><span style={{ color: T.text1, fontSize: 13 }}>{s}</span></div>)}
          </div>
        </div>
      </section>
      <section style={{ padding: '80px 24px', maxWidth: 1000, margin: '0 auto', position: 'relative', zIndex: 1 }}>
        <div style={{ textAlign: 'center', marginBottom: 48 }}>
          <h2 style={{ fontSize: 'clamp(28px, 4vw, 42px)', fontWeight: 800, margin: '0 0 10px' }}>Key <span style={{ color: T.teal }}>Features</span></h2>
          <p style={{ color: T.text2, fontSize: 14 }}>Complete toolkit for professional Polymarket trading</p>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 16 }}>
          {FEATURES.map((f, i) => (
            <div key={i} style={{ background: T.bgCard, borderRadius: 16, border: `1px solid ${T.border}`, padding: '24px 22px', transition: 'border-color 0.2s' }}
              onMouseEnter={e => e.currentTarget.style.borderColor = f.color + '50'}
              onMouseLeave={e => e.currentTarget.style.borderColor = T.border}>
              <div style={{ width: 40, height: 40, borderRadius: 11, background: f.color + '15', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, marginBottom: 14 }}>{f.icon}</div>
              <div style={{ fontSize: 14, fontWeight: 700, color: T.text0, marginBottom: 12 }}>{f.title}</div>
              {f.points.map((p, j) => <div key={j} style={{ display: 'flex', gap: 8, marginBottom: 6 }}><span style={{ color: f.color, fontSize: 11 }}>→</span><span style={{ color: T.text1, fontSize: 12 }}>{p}</span></div>)}
            </div>
          ))}
        </div>
      </section>
      <section style={{ padding: '80px 24px', maxWidth: 1000, margin: '0 auto', position: 'relative', zIndex: 1 }}>
        <h2 style={{ fontSize: 'clamp(28px, 4vw, 42px)', fontWeight: 800, textAlign: 'center', margin: '0 0 48px' }}>Two Operating <span style={{ color: T.teal }}>Modes</span></h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 16 }}>
          {MODES.map((m, i) => (
            <div key={i} style={{ background: T.bgCard, borderRadius: 18, border: `1px solid ${m.color}25`, padding: '32px 28px' }}>
              <div style={{ width: 44, height: 44, borderRadius: 12, background: `${m.color}15`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, marginBottom: 16 }}>{m.icon}</div>
              <div style={{ fontSize: 18, fontWeight: 800, color: T.text0, marginBottom: 4 }}>{m.title}</div>
              <div style={{ fontSize: 13, color: T.text2, marginBottom: 18 }}>{m.sub}</div>
              {m.points.map((p, j) => <div key={j} style={{ display: 'flex', gap: 10, marginBottom: 10 }}><span style={{ color: m.color }}>✓</span><span style={{ color: T.text1, fontSize: 13 }}>{p}</span></div>)}
              <div style={{ marginTop: 16, display: 'inline-block', background: `${m.color}12`, border: `1px solid ${m.color}25`, borderRadius: 20, padding: '5px 14px' }}>
                <span style={{ fontSize: 11, color: m.color, fontWeight: 600 }}>{m.tag}</span>
              </div>
            </div>
          ))}
        </div>
      </section>
      <section style={{ padding: '80px 24px', maxWidth: 1000, margin: '0 auto', position: 'relative', zIndex: 1 }}>
        <h2 style={{ fontSize: 'clamp(28px, 4vw, 42px)', fontWeight: 800, textAlign: 'center', margin: '0 0 48px' }}>Why traders trust <span style={{ color: T.teal }}>PolyTrader?</span></h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 14 }}>
          {TRUST.map((t, i) => (
            <div key={i} style={{ display: 'flex', gap: 14, alignItems: 'flex-start', background: T.bgCard, borderRadius: 14, border: `1px solid ${T.border}`, padding: '18px 20px' }}>
              <span style={{ fontSize: 20 }}>{t.icon}</span>
              <span style={{ color: T.text1, fontSize: 13, lineHeight: 1.6 }}>{t.text}</span>
            </div>
          ))}
        </div>
      </section>
      <section style={{ padding: '60px 24px 100px', textAlign: 'center', position: 'relative', zIndex: 1 }}>
        <div style={{ maxWidth: 640, margin: '0 auto', background: 'linear-gradient(135deg, rgba(79,142,255,0.08), rgba(155,125,255,0.08))', border: `1px solid rgba(79,142,255,0.2)`, borderRadius: 24, padding: '56px 40px' }}>
          <h2 style={{ fontSize: 'clamp(24px, 4vw, 38px)', fontWeight: 800, margin: '0 0 14px' }}>Start your edge today</h2>
          <p style={{ color: T.text1, fontSize: 15, margin: '0 0 32px' }}>Join thousands of traders using PolyTrader.</p>
          <button onClick={() => { setMode('signup'); setStep(0); reset() }}
            style={{ padding: '15px 48px', background: 'linear-gradient(135deg, #4f8eff, #9b7dff)', border: 'none', borderRadius: 50, color: '#fff', fontSize: 15, fontWeight: 700, cursor: 'pointer', fontFamily: T.font, boxShadow: '0 0 40px rgba(79,142,255,0.3)' }}>
            Trade → Free
          </button>
        </div>
      </section>
      <footer style={{ borderTop: `1px solid ${T.border}`, padding: '20px 40px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12, background: T.bg1 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{ width: 26, height: 26, borderRadius: 7, background: 'linear-gradient(135deg, #4f8eff, #9b7dff)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: 12, color: '#fff' }}>P</div>
          <span style={{ fontSize: 13, color: T.text2 }}>PolyTrader © 2025</span>
        </div>
        <div style={{ display: 'flex', gap: 20 }}>
          {['Privacy Policy', 'Terms of Service', 'Contact'].map(l => <span key={l} style={{ fontSize: 12, color: T.text2, cursor: 'pointer' }}>{l}</span>)}
        </div>
      </footer>
    </div>
  )
}