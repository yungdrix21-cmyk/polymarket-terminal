import { useState, useEffect } from 'react'
import { supabase } from './lib/supabase'
import Auth from './components/Auth'
import Profile from './components/Profile'

// ==================== THEME ====================
const T = {
  bg0: '#0d0e14', bg1: '#12131c', bg2: '#181922', bg3: '#1e2030', bgCard: '#14151f',
  bgHover: '#1a1b28',
  border: 'rgba(255,255,255,0.06)', borderHi: 'rgba(255,255,255,0.12)',
  blue: '#4f8eff',
  teal: '#00d4aa',
  red: '#ff4d6a',
  purple: '#9b7dff',
  yellow: '#f5c842',
  text0: '#e8eaf0', text1: '#8b8fa8', text2: '#4a4d62',
  font: '"DM Sans", system-ui, sans-serif',
  mono: '"DM Mono", monospace',
}

// ==================== ICON ====================
const Icon = ({ name }) => {
  const icons = {
    dashboard: "📊",
    markets: "📈",
    users: "👥",
    deposit: "💰",
    profile: "👤",
    settings: "⚙️",
    withdraw: "💸",
    logout: "🚪",
    lock: "🔒",
    shield: "🛡️"
  }
  return <span>{icons[name] || "•"}</span>
}

// ==================== ADMIN ====================
function AdminKYCReview() {
  const [submissions, setSubmissions] = useState([])

  useEffect(() => {
    const load = async () => {
      const { data } = await supabase
        .from('kyc_documents')
        .select('user_id, status')
      setSubmissions(data || [])
    }
    load()
  }, [])

  return (
    <div style={{ padding: 20 }}>
      <h2>Admin KYC Review</h2>
      {submissions.map(item => (
        <div key={item.user_id}>
          {item.user_id} - {item.status}
        </div>
      ))}
    </div>
  )
}

// ==================== DASHBOARD ====================
function DashboardPage({ user, balance, markets }) {
  return (
    <div style={{ padding: 20 }}>
      <h2>Welcome {user?.email}</h2>
      <p>Balance: ${balance}</p>
      <p>Live Markets: {markets.length}</p>
    </div>
  )
}

// ==================== MARKETS ====================
function MarketsPage({ markets }) {
  return (
    <div style={{ padding: 20 }}>
      <h2>Crypto Markets</h2>
      {markets.map(m => (
        <div key={m.id} style={{ marginBottom: 10 }}>
          {m.question}
        </div>
      ))}
    </div>
  )
}

// ==================== APP ====================
export default function App() {
  const [user, setUser] = useState(null)
  const [balance, setBalance] = useState(0)
  const [kycStatus, setKycStatus] = useState(null)
  const [view, setView] = useState('dashboard')
  const [loading, setLoading] = useState(true)

  // ✅ FIXED MARKETS STATE (inside component)
  const [markets, setMarkets] = useState([])

  // ==================== AUTH ====================
  useEffect(() => {
    const init = async () => {
      const { data } = await supabase.auth.getSession()
      setUser(data?.session?.user ?? null)
      setLoading(false)
    }
    init()
  }, [])

  // ==================== FETCH MARKETS ====================
  useEffect(() => {
    const fetchMarkets = async () => {
      try {
        const res = await fetch("https://gamma-api.polymarket.com/markets")
        const data = await res.json()

        const keywords = ["bitcoin","btc","ethereum","eth","solana","sol","crypto"]

        const filtered = data
          .filter(m => {
            const q = m.question?.toLowerCase() || ""
            return m.active && keywords.some(k => q.includes(k))
          })
          .slice(0, 20)

        setMarkets(filtered)
      } catch (e) {
        console.error(e)
      }
    }

    fetchMarkets()
  }, [])

  // ==================== LOGIN ====================
  const handleLogin = (u) => {
    setUser(u)
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
    setUser(null)
  }

  if (loading) return <div>Loading...</div>

  if (!user) return <Auth onLogin={handleLogin} />

  return (
    <div style={{ display: 'flex' }}>
      
      {/* SIDEBAR */}
      <div style={{ width: 200, background: "#111", color: "#fff", padding: 10 }}>
        <div onClick={() => setView('dashboard')}>Dashboard</div>
        <div onClick={() => setView('markets')}>Markets</div>
        <div onClick={() => setView('profile')}>Profile</div>
        <div onClick={() => setView('admin')}>Admin</div>
        <div onClick={handleLogout}>Logout</div>
      </div>

      {/* MAIN */}
      <div style={{ flex: 1 }}>
        {view === 'dashboard' && (
          <DashboardPage user={user} balance={balance} markets={markets} />
        )}
        {view === 'markets' && (
          <MarketsPage markets={markets} />
        )}
        {view === 'profile' && (
          <Profile user={user} kycStatus={kycStatus} />
        )}
        {view === 'admin' && (
          <AdminKYCReview />
        )}
      </div>

    </div>
  )
}