import { useState } from 'react'

export default function CopyTrading({ onClose }) {
  const [query, setQuery] = useState('')
  const [trader, setTrader] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [followed, setFollowed] = useState(false)

  async function searchTrader() {
    if (!query) return
    setLoading(true)
    setError('')
    setTrader(null)

    try {
      const res = await fetch(
        `https://data-api.polymarket.com/positions?user=${query}&limit=10`
      )
      const data = await res.json()

      if (!data || data.length === 0) {
        setError('No trader found. Check the wallet address.')
      } else {
        // Calculate stats from positions
        const totalValue = data.reduce((sum, p) => sum + (p.currentValue || 0), 0)
        const wins = data.filter(p => p.currentValue > p.avgPrice * p.size).length
        setTrader({
          address: query,
          shortAddress: query.slice(0, 6) + '...' + query.slice(-4),
          positions: data.slice(0, 5),
          totalValue: totalValue.toFixed(2),
          winRate: ((wins / data.length) * 100).toFixed(0),
          totalTrades: data.length,
        })
      }
    } catch {
      setError('Failed to fetch trader. Try a valid Polymarket wallet address.')
    }
    setLoading(false)
  }

  return (
    <div style={{
      position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100
    }}>
      <div style={{
        background: '#1e222d', borderRadius: '16px', padding: '28px',
        width: '480px', border: '1px solid #2a2a2a', position: 'relative'
      }}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
          <h2 style={{ color: '#fff', margin: 0, fontSize: '20px' }}>Copy Trading</h2>
          <button onClick={onClose} style={{ background: '#2a2a2a', border: 'none', color: '#fff', width: '32px', height: '32px', borderRadius: '50%', cursor: 'pointer', fontSize: '16px' }}>×</button>
        </div>
        <p style={{ color: '#666', fontSize: '13px', marginBottom: '20px' }}>
          Enter a wallet address to find a Polymarket trader to copy.
        </p>

        {/* Search */}
        <div style={{ display: 'flex', gap: '8px', marginBottom: '20px' }}>
          <input
            value={query}
            onChange={e => setQuery(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && searchTrader()}
            placeholder="Address (0x...) or username"
            style={{
              flex: 1, padding: '12px', background: '#131722',
              border: '1px solid #2a2a2a', borderRadius: '8px',
              color: '#fff', fontSize: '13px'
            }}
          />
          <button
            onClick={searchTrader}
            disabled={loading}
            style={{
              padding: '12px 20px', background: '#2962ff',
              color: '#fff', border: 'none', borderRadius: '8px',
              cursor: 'pointer', fontWeight: '600', fontSize: '13px'
            }}
          >
            {loading ? '...' : 'Search'}
          </button>
        </div>

        {/* Error */}
        {error && (
          <div style={{ color: '#ef5350', fontSize: '13px', marginBottom: '16px' }}>{error}</div>
        )}

        {/* Trader Results */}
        {trader && (
          <div style={{ background: '#131722', borderRadius: '12px', padding: '16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <div>
                <div style={{ color: '#fff', fontWeight: '600' }}>🦊 {trader.shortAddress}</div>
                <div style={{ color: '#555', fontSize: '11px', marginTop: '2px' }}>Polymarket Trader</div>
              </div>
              <button
                onClick={() => setFollowed(!followed)}
                style={{
                  padding: '8px 16px',
                  background: followed ? '#1a3a1a' : '#2962ff',
                  color: followed ? '#26a69a' : '#fff',
                  border: followed ? '1px solid #26a69a' : 'none',
                  borderRadius: '8px', cursor: 'pointer', fontSize: '12px', fontWeight: '600'
                }}
              >
                {followed ? '✓ Following' : '+ Follow'}
              </button>
            </div>

            {/* Stats */}
            <div style={{ display: 'flex', gap: '16px', marginBottom: '16px' }}>
              <div style={{ flex: 1, background: '#1e222d', padding: '10px', borderRadius: '8px', textAlign: 'center' }}>
                <div style={{ color: '#26a69a', fontSize: '18px', fontWeight: '700' }}>{trader.winRate}%</div>
                <div style={{ color: '#555', fontSize: '11px' }}>Win Rate</div>
              </div>
              <div style={{ flex: 1, background: '#1e222d', padding: '10px', borderRadius: '8px', textAlign: 'center' }}>
                <div style={{ color: '#fff', fontSize: '18px', fontWeight: '700' }}>{trader.totalTrades}</div>
                <div style={{ color: '#555', fontSize: '11px' }}>Positions</div>
              </div>
              <div style={{ flex: 1, background: '#1e222d', padding: '10px', borderRadius: '8px', textAlign: 'center' }}>
                <div style={{ color: '#26a69a', fontSize: '18px', fontWeight: '700' }}>${trader.totalValue}</div>
                <div style={{ color: '#555', fontSize: '11px' }}>Value</div>
              </div>
            </div>

            {/* Positions */}
            <div style={{ color: '#555', fontSize: '11px', marginBottom: '8px' }}>RECENT POSITIONS</div>
            {trader.positions.map((p, i) => (
              <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid #2a2a2a', fontSize: '12px' }}>
                <span style={{ color: '#b2b5be' }}>{p.title?.slice(0, 35) || 'Market Position'}...</span>
                <span style={{ color: p.side === 'BUY' ? '#26a69a' : '#ef5350' }}>{p.side || 'YES'}</span>
              </div>
            ))}
          </div>
        )}

        {/* Cancel */}
        <button
          onClick={onClose}
          style={{ width: '100%', marginTop: '16px', padding: '12px', background: 'transparent', color: '#666', border: '1px solid #2a2a2a', borderRadius: '8px', cursor: 'pointer', fontSize: '13px' }}
        >
          Cancel
        </button>
      </div>
    </div>
  )
}