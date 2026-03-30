import { useState } from 'react'
import { supabase } from '../lib/supabase'

export default function Auth({ onLogin }) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isSignup, setIsSignup] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit() {
    setLoading(true)
    setError('')

    if (isSignup) {
      const { error } = await supabase.auth.signUp({ email, password })
      if (error) setError(error.message)
      else setError('Check your email to confirm your account!')
    } else {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) setError(error.message)
      else onLogin(data.user)
    }
    setLoading(false)
  }

  return (
    <div style={{
      height: '100vh', background: '#131722',
      display: 'flex', alignItems: 'center', justifyContent: 'center'
    }}>
      <div style={{
        background: '#1e222d', padding: '40px', borderRadius: '12px',
        border: '1px solid #2a2a2a', width: '360px'
      }}>
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <div style={{ fontSize: '28px' }}>📈</div>
          <div style={{ color: '#fff', fontSize: '20px', fontWeight: '700', marginTop: '8px' }}>
            PolyTrader
          </div>
          <div style={{ color: '#555', fontSize: '13px', marginTop: '4px' }}>
            {isSignup ? 'Create your account' : 'Sign in to your account'}
          </div>
        </div>

        {/* Email */}
        <div style={{ marginBottom: '16px' }}>
          <div style={{ color: '#888', fontSize: '12px', marginBottom: '6px' }}>EMAIL</div>
          <input
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            placeholder="you@example.com"
            style={{
              width: '100%', padding: '10px 12px', background: '#131722',
              border: '1px solid #2a2a2a', borderRadius: '6px',
              color: '#fff', fontSize: '13px', boxSizing: 'border-box'
            }}
          />
        </div>

        {/* Password */}
        <div style={{ marginBottom: '24px' }}>
          <div style={{ color: '#888', fontSize: '12px', marginBottom: '6px' }}>PASSWORD</div>
          <input
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            placeholder="••••••••"
            style={{
              width: '100%', padding: '10px 12px', background: '#131722',
              border: '1px solid #2a2a2a', borderRadius: '6px',
              color: '#fff', fontSize: '13px', boxSizing: 'border-box'
            }}
          />
        </div>

        {/* Error */}
        {error && (
          <div style={{
            padding: '10px', background: '#2a1a1a', border: '1px solid #ef5350',
            borderRadius: '6px', color: '#ef5350', fontSize: '12px', marginBottom: '16px'
          }}>
            {error}
          </div>
        )}

        {/* Button */}
        <button
          onClick={handleSubmit}
          disabled={loading}
          style={{
            width: '100%', padding: '12px', background: '#2962ff',
            color: '#fff', border: 'none', borderRadius: '6px',
            fontSize: '14px', fontWeight: '600', cursor: 'pointer'
          }}
        >
          {loading ? 'Please wait...' : isSignup ? 'Create Account' : 'Sign In'}
        </button>

        {/* Toggle */}
        <div style={{ textAlign: 'center', marginTop: '20px', color: '#555', fontSize: '13px' }}>
          {isSignup ? 'Already have an account? ' : "Don't have an account? "}
          <span
            onClick={() => { setIsSignup(!isSignup); setError('') }}
            style={{ color: '#2962ff', cursor: 'pointer' }}
          >
            {isSignup ? 'Sign In' : 'Sign Up'}
          </span>
        </div>
      </div>
    </div>
  )
}