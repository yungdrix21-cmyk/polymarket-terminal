import { useState, useEffect } from 'react'

const CRYPTO_MARKETS = [
  { id: '1', question: 'Will Bitcoin be above $90k on April 30?', outcomePrices: ['0.61', '0.39'], change: '+2.3%' },
  { id: '2', question: 'Will ETH be above $2k on April 30?', outcomePrices: ['0.48', '0.52'], change: '-1.1%' },
  { id: '3', question: 'Will BTC hit $100k in 2025?', outcomePrices: ['0.55', '0.45'], change: '+0.8%' },
  { id: '4', question: 'Will Solana hit $200 in April?', outcomePrices: ['0.32', '0.68'], change: '-3.2%' },
  { id: '5', question: 'Will XRP be above $3 on May 1?', outcomePrices: ['0.44', '0.56'], change: '+1.5%' },
  { id: '6', question: 'Will BTC dominance exceed 60% in April?', outcomePrices: ['0.70', '0.30'], change: '+0.2%' },
]

function PriceBar({ value }) {
  const pct = parseFloat(value) * 100
  return (
    <div style={{ background: '#111', height: '6px', borderRadius: '3px', marginTop: '6px' }}>
      <div style={{ width: pct + '%', height: '100%', background: pct > 50 ? '#22c55e' : '#ef4444', borderRadius: '3px' }} />
    </div>
  )
}

function CandleChart({ market }) {
  const [candles, setCandles] = useState([])

  useEffect(() => {
    // Simulate 5-min candles updating every 5 seconds
    const generate = () => {
      const base = parseFloat(market.outcomePrices[0])
      return Array.from({ length: 20 }, (_, i) => ({
        time: i,
        open: base + (Math.random() - 0.5) * 0.1,
        close: base + (Math.random() - 0.5) * 0.1,
        high: base + Math.random() * 0.08,
        low: base - Math.random() * 0.08,
      }))
    }
    setCandles(generate())
    const interval = setInterval(() => setCandles(generate()), 5000)
    return () => clearInterval(interval)
  }, [market])

  const w = 18
  const chartH = 120
  const prices = candles.flatMap(c => [c.high, c.low])
  const min = Math.min(...prices)
  const max = Math.max(...prices)
  const scale = v => chartH - ((v - min) / (max - min)) * chartH

  return (
    <svg width={candles.length * w + 20} height={chartH + 20} style={{ marginTop: '16px' }}>
      {candles.map((c, i) => {
        const isUp = c.close >= c.open
        const color = isUp ? '#22c55e' : '#ef4444'
        const bodyTop = scale(Math.max(c.open, c.close))
        const bodyH = Math.max(2, Math.abs(scale(c.open) - scale(c.close)))
        return (
          <g key={i} transform={`translate(${i * w + 10}, 0)`}>
            <line x1={w/2} y1={scale(c.high)} x2={w/2} y2={scale(c.low)} stroke={color} strokeWidth={1} />
            <rect x={2} y={bodyTop} width={w - 4} height={bodyH} fill={color} />
          </g>
        )
      })}
    </svg>
  )
}

export default function App() {
  const [selected, setSelected] = useState(null)
  const [prices, setPrices] = useState(CRYPTO_MARKETS)
  const [lastUpdate, setLastUpdate] = useState(new Date())

  // Simulate live price updates every 5 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setPrices(prev => prev.map(m => ({
        ...m,
        outcomePrices: [
          String(Math.min(0.99, Math.max(0.01, parseFloat(m.outcomePrices[0]) + (Math.random() - 0.5) * 0.02))),
          String(Math.min(0.99, Math.max(0.01, parseFloat(m.outcomePrices[1]) + (Math.random() - 0.5) * 0.02))),
        ]
      })))
      setLastUpdate(new Date())
    }, 5000)
    return () => clearInterval(interval)
  }, [])

  const selectedLive = prices.find(m => m.id === selected?.id)

  return (
    <div style={{ display:'flex', height:'100vh', background:'#000', color:'#fff', fontFamily:'monospace', fontSize:'13px' }}>

      {/* Left Panel */}
      <div style={{ width:'320px', borderRight:'1px solid #1a1a1a', display:'flex', flexDirection:'column' }}>
        <div style={{ padding:'12px', borderBottom:'1px solid #1a1a1a', display:'flex', justifyContent:'space-between', alignItems:'center' }}>
          <span style={{ color:'#22c55e', fontWeight:'bold' }}>📊 CRYPTO MARKETS</span>
          <span style={{ color:'#444', fontSize:'11px' }}>🟢 LIVE</span>
        </div>
        <div style={{ padding:'8px 12px', borderBottom:'1px solid #1a1a1a', color:'#444', fontSize:'11px' }}>
          Updated: {lastUpdate.toLocaleTimeString()}
        </div>
        <div style={{ overflowY:'auto', flex:1 }}>
          {prices.map(market => {
            const yes = (parseFloat(market.outcomePrices[0]) * 100).toFixed(1)
            const isSelected = selected?.id === market.id
            return (
              <div
                key={market.id}
                onClick={() => setSelected(market)}
                style={{ padding:'12px', borderBottom:'1px solid #111', cursor:'pointer', background: isSelected ? '#0a1a0a' : 'transparent', borderLeft: isSelected ? '2px solid #22c55e' : '2px solid transparent' }}
              >
                <div style={{ color: isSelected ? '#22c55e' : '#ccc', fontSize:'12px', marginBottom:'4px' }}>{market.question}</div>
                <div style={{ display:'flex', justifyContent:'space-between' }}>
                  <span style={{ color:'#22c55e' }}>YES {yes}%</span>
                  <span style={{ color: market.change.startsWith('+') ? '#22c55e' : '#ef4444', fontSize:'11px' }}>{market.change}</span>
                </div>
                <PriceBar value={market.outcomePrices[0]} />
              </div>
            )
          })}
        </div>
      </div>

      {/* Right Panel */}
      <div style={{ flex:1, padding:'24px', overflowY:'auto' }}>
        {selectedLive ? (
          <>
            <h2 style={{ color:'#22c55e', marginTop:0 }}>{selectedLive.question}</h2>
            <div style={{ display:'flex', gap:'32px', marginTop:'16px' }}>
              <div>
                <div style={{ color:'#444', fontSize:'11px' }}>YES PROBABILITY</div>
                <div style={{ color:'#22c55e', fontSize:'32px', fontWeight:'bold' }}>
                  {(parseFloat(selectedLive.outcomePrices[0]) * 100).toFixed(1)}%
                </div>
              </div>
              <div>
                <div style={{ color:'#444', fontSize:'11px' }}>NO PROBABILITY</div>
                <div style={{ color:'#ef4444', fontSize:'32px', fontWeight:'bold' }}>
                  {(parseFloat(selectedLive.outcomePrices[1]) * 100).toFixed(1)}%
                </div>
              </div>
            </div>
            <div style={{ color:'#444', fontSize:'11px', marginTop:'16px' }}>5-MIN CANDLES (updates every 5s)</div>
            <CandleChart market={selectedLive} />
          </>
        ) : (
          <div style={{ display:'flex', alignItems:'center', justifyContent:'center', height:'100%', color:'#333' }}>
            ← Select a market to view live chart
          </div>
        )}
      </div>

    </div>
  )
}