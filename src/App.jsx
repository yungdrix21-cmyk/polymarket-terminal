import { useState, useEffect, useRef } from 'react'

const CRYPTO_MARKETS = [
  { id: '1', question: 'Will Bitcoin be above $90k on April 30?', outcomePrices: ['0.62', '0.38'], change: '+2.3%', volume: 145000 },
  { id: '2', question: 'Will ETH be above $2k on April 30?', outcomePrices: ['0.48', '0.52'], change: '-1.1%', volume: 89000 },
  { id: '3', question: 'Will BTC hit $100k in 2025?', outcomePrices: ['0.55', '0.45'], change: '+0.8%', volume: 210000 },
  { id: '4', question: 'Will Solana hit $200 in April?', outcomePrices: ['0.32', '0.68'], change: '-3.2%', volume: 54000 },
  { id: '5', question: 'Will XRP be above $3 on May 1?', outcomePrices: ['0.44', '0.56'], change: '+1.5%', volume: 67000 },
  { id: '6', question: 'Will BTC dominance exceed 60% in April?', outcomePrices: ['0.70', '0.30'], change: '+0.2%', volume: 32000 },
]

function generateCandles(base, count = 40) {
  let price = base
  return Array.from({ length: count }, (_, i) => {
    const open = price
    const change = (Math.random() - 0.48) * 0.04
    const close = Math.min(0.99, Math.max(0.01, open + change))
    const high = Math.max(open, close) + Math.random() * 0.015
    const low = Math.min(open, close) - Math.random() * 0.015
    const volume = Math.floor(Math.random() * 50000 + 10000)
    price = close
    return { time: i, open, close, high, low, volume }
  })
}

function Chart({ market }) {
  const [candles, setCandles] = useState([])

  useEffect(() => {
    setCandles(generateCandles(parseFloat(market.outcomePrices[0])))
    const interval = setInterval(() => {
      setCandles(prev => {
        const last = prev[prev.length - 1]
        const change = (Math.random() - 0.48) * 0.02
        const newClose = Math.min(0.99, Math.max(0.01, last.close + change))
        const newCandle = {
          time: last.time + 1,
          open: last.close,
          close: newClose,
          high: Math.max(last.close, newClose) + Math.random() * 0.01,
          low: Math.min(last.close, newClose) - Math.random() * 0.01,
          volume: Math.floor(Math.random() * 50000 + 10000)
        }
        return [...prev.slice(1), newCandle]
      })
    }, 3000)
    return () => clearInterval(interval)
  }, [market])

  if (!candles.length) return null

  const W = 16
  const chartH = 180
  const volH = 50
  const pad = 8

  const highs = candles.map(c => c.high)
  const lows = candles.map(c => c.low)
  const minP = Math.min(...lows)
  const maxP = Math.max(...highs)
  const maxVol = Math.max(...candles.map(c => c.volume))

  const scaleP = v => chartH - ((v - minP) / (maxP - minP)) * (chartH - pad * 2) - pad
  const scaleV = v => volH - (v / maxVol) * (volH - 4)

  const totalW = candles.length * W + 60

  return (
    <div style={{ overflowX: 'auto', marginTop: '12px' }}>
      <svg width={totalW} height={chartH + volH + 24}>
        {/* Price labels */}
        {[0, 0.25, 0.5, 0.75, 1].map(t => {
          const val = minP + (maxP - minP) * (1 - t)
          const y = pad + t * (chartH - pad * 2)
          return (
            <g key={t}>
              <line x1={0} y1={y} x2={totalW - 50} y2={y} stroke="#2a2a2a" strokeWidth={1} />
              <text x={totalW - 48} y={y + 4} fill="#666" fontSize={9}>{(val * 100).toFixed(1)}%</text>
            </g>
          )
        })}

        {/* Candles */}
        {candles.map((c, i) => {
          const isUp = c.close >= c.open
          const color = isUp ? '#26a69a' : '#ef5350'
          const bodyTop = scaleP(Math.max(c.open, c.close))
          const bodyH = Math.max(1, Math.abs(scaleP(c.open) - scaleP(c.close)))
          const x = i * W + W / 2

          return (
            <g key={i}>
              <line x1={x} y1={scaleP(c.high)} x2={x} y2={scaleP(c.low)} stroke={color} strokeWidth={1} />
              <rect x={i * W + 2} y={bodyTop} width={W - 4} height={bodyH} fill={color} />
              {/* Volume bar */}
              <rect
                x={i * W + 2}
                y={chartH + scaleV(c.volume)}
                width={W - 4}
                height={volH - scaleV(c.volume)}
                fill={isUp ? '#1a3a38' : '#3a1a1a'}
              />
            </g>
          )
        })}

        {/* Volume label */}
        <text x={4} y={chartH + 12} fill="#555" fontSize={9}>VOLUME</text>
        <line x1={0} y1={chartH + 2} x2={totalW - 50} y2={chartH + 2} stroke="#333" strokeWidth={1} />
      </svg>
    </div>
  )
}

export default function App() {
  const [selected, setSelected] = useState(null)
  const [prices, setPrices] = useState(CRYPTO_MARKETS)
  const [analysis, setAnalysis] = useState('')
  const [analyzing, setAnalyzing] = useState(false)
  const [lastUpdate, setLastUpdate] = useState(new Date())

  useEffect(() => {
    const interval = setInterval(() => {
      setPrices(prev => prev.map(m => ({
        ...m,
        outcomePrices: [
          String(Math.min(0.99, Math.max(0.01, parseFloat(m.outcomePrices[0]) + (Math.random() - 0.5) * 0.01))),
          String(Math.min(0.99, Math.max(0.01, parseFloat(m.outcomePrices[1]) + (Math.random() - 0.5) * 0.01))),
        ]
      })))
      setLastUpdate(new Date())
    }, 3000)
    return () => clearInterval(interval)
  }, [])

  async function analyzeMarket(market) {
    setAnalyzing(true)
    setAnalysis('')
    try {
      const res = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: 'claude-sonnet-4-20250514',
          max_tokens: 1000,
          messages: [{ role: 'user', content: `You are a prediction market analyst. Analyze this market in 3-4 sentences: "${market.question}" Current YES probability: ${(parseFloat(market.outcomePrices[0]) * 100).toFixed(1)}%. Is it fairly priced? Any edge?` }]
        })
      })
      const data = await res.json()
      setAnalysis(data.content[0].text)
    } catch {
      setAnalysis('Analysis unavailable. Check your API key.')
    }
    setAnalyzing(false)
  }

  const selectedLive = prices.find(m => m.id === selected?.id)

  return (
    <div style={{ display: 'flex', height: '100vh', background: '#131722', color: '#d1d4dc', fontFamily: 'Inter, sans-serif', fontSize: '13px' }}>

      {/* Left Panel */}
      <div style={{ width: '280px', borderRight: '1px solid #2a2a2a', display: 'flex', flexDirection: 'column', background: '#1e222d' }}>
        
        {/* Header */}
        <div style={{ padding: '12px 16px', borderBottom: '1px solid #2a2a2a', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ color: '#fff', fontWeight: '600', fontSize: '14px' }}>📈 Markets</span>
          <span style={{ color: '#26a69a', fontSize: '11px', display: 'flex', alignItems: 'center', gap: '4px' }}>
            <span style={{ width: '6px', height: '6px', background: '#26a69a', borderRadius: '50%', display: 'inline-block' }} />
            LIVE
          </span>
        </div>

        {/* Timestamp */}
        <div style={{ padding: '6px 16px', borderBottom: '1px solid #2a2a2a', color: '#555', fontSize: '11px' }}>
          {lastUpdate.toLocaleTimeString()}
        </div>

        {/* Market List */}
        <div style={{ overflowY: 'auto', flex: 1 }}>
          {prices.map(market => {
            const yes = (parseFloat(market.outcomePrices[0]) * 100).toFixed(1)
            const isUp = market.change.startsWith('+')
            const isSelected = selected?.id === market.id
            return (
              <div
                key={market.id}
                onClick={() => { setSelected(market); setAnalysis('') }}
                style={{
                  padding: '10px 16px',
                  borderBottom: '1px solid #2a2a2a',
                  cursor: 'pointer',
                  background: isSelected ? '#2a2d3a' : 'transparent',
                  borderLeft: isSelected ? '2px solid #2962ff' : '2px solid transparent',
                }}
              >
                <div style={{ color: isSelected ? '#fff' : '#b2b5be', fontSize: '12px', marginBottom: '6px', lineHeight: '1.4' }}>
                  {market.question}
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ color: '#26a69a', fontWeight: '600' }}>{yes}%</span>
                  <span style={{ color: isUp ? '#26a69a' : '#ef5350', fontSize: '11px' }}>{market.change}</span>
                </div>
                {/* Progress bar */}
                <div style={{ marginTop: '6px', height: '3px', background: '#2a2a2a', borderRadius: '2px' }}>
                  <div style={{ width: yes + '%', height: '100%', background: parseFloat(yes) > 50 ? '#26a69a' : '#ef5350', borderRadius: '2px' }} />
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Main Panel */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        {selectedLive ? (
          <>
            {/* Top bar */}
            <div style={{ padding: '12px 20px', borderBottom: '1px solid #2a2a2a', background: '#1e222d', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <div style={{ color: '#fff', fontWeight: '600', fontSize: '14px' }}>{selectedLive.question}</div>
                <div style={{ color: '#555', fontSize: '11px', marginTop: '2px' }}>Polymarket · Crypto</div>
              </div>
              <div style={{ display: 'flex', gap: '24px', textAlign: 'right' }}>
                <div>
                  <div style={{ color: '#555', fontSize: '10px' }}>YES</div>
                  <div style={{ color: '#26a69a', fontSize: '20px', fontWeight: '700' }}>
                    {(parseFloat(selectedLive.outcomePrices[0]) * 100).toFixed(1)}%
                  </div>
                </div>
                <div>
                  <div style={{ color: '#555', fontSize: '10px' }}>NO</div>
                  <div style={{ color: '#ef5350', fontSize: '20px', fontWeight: '700' }}>
                    {(parseFloat(selectedLive.outcomePrices[1]) * 100).toFixed(1)}%
                  </div>
                </div>
              </div>
            </div>

            {/* Chart area */}
            <div style={{ flex: 1, padding: '16px 20px', overflowY: 'auto' }}>
              <div style={{ color: '#555', fontSize: '11px', marginBottom: '4px' }}>5-MIN · PROBABILITY CHART</div>
              <Chart market={selectedLive} />

              {/* AI Analysis */}
              <div style={{ marginTop: '24px', padding: '16px', background: '#1e222d', borderRadius: '6px', border: '1px solid #2a2a2a' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                  <span style={{ color: '#fff', fontWeight: '600' }}>🤖 AI Analysis</span>
                  <button
                    onClick={() => analyzeMarket(selectedLive)}
                    disabled={analyzing}
                    style={{
                      background: analyzing ? '#2a2a2a' : '#2962ff',
                      color: '#fff', border: 'none', padding: '6px 14px',
                      borderRadius: '4px', cursor: analyzing ? 'default' : 'pointer',
                      fontSize: '12px', fontWeight: '600'
                    }}
                  >
                    {analyzing ? 'Analyzing...' : 'Analyze Market'}
                  </button>
                </div>
                {analysis ? (
                  <p style={{ color: '#b2b5be', lineHeight: '1.7', margin: 0, fontSize: '13px' }}>{analysis}</p>
                ) : (
                  <p style={{ color: '#555', margin: 0, fontSize: '12px' }}>Click "Analyze Market" to get AI insights on this prediction.</p>
                )}
              </div>
            </div>
          </>
        ) : (
          <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: '12px', color: '#555' }}>
            <div style={{ fontSize: '40px' }}>📈</div>
            <div style={{ fontSize: '16px', color: '#666' }}>Select a market to view chart</div>
            <div style={{ fontSize: '12px', color: '#444' }}>Live candlestick charts with AI analysis</div>
          </div>
        )}
      </div>

    </div>
  )
}