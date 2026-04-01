import { useState, useEffect } from 'react'
import { supabase } from './lib/supabase'
import Auth from './components/Auth'
import CopyTrading from './components/CopyTrading'

const CRYPTO_MARKETS = [
  { 
    id: '1', 
    question: 'Bitcoin Up or Down - Next 5 Minutes', 
    outcomePrices: ['0.53', '0.47'], 
    change: '+1.2%', 
    volume: 124000,
    timeframe: '5m',
    symbol: 'BTC'
  },
  { 
    id: '2', 
    question: 'Ethereum Up or Down - Next 15 Minutes', 
    outcomePrices: ['0.49', '0.51'], 
    change: '-0.8%', 
    volume: 89000,
    timeframe: '15m',
    symbol: 'ETH'
  },
  { 
    id: '3', 
    question: 'Solana Up or Down - Next 5 Minutes', 
    outcomePrices: ['0.58', '0.42'], 
    change: '+3.4%', 
    volume: 156000,
    timeframe: '5m',
    symbol: 'SOL'
  },
  { 
    id: '4', 
    question: 'Bitcoin Above $92,000 on April 2?', 
    outcomePrices: ['0.61', '0.39'], 
    change: '+2.1%', 
    volume: 245000,
    timeframe: 'Daily',
    symbol: 'BTC'
  },
  { 
    id: '5', 
    question: 'ETH Up or Down - Next 30 Minutes', 
    outcomePrices: ['0.46', '0.54'], 
    change: '-1.5%', 
    volume: 67000,
    timeframe: '30m',
    symbol: 'ETH'
  },
  { 
    id: '6', 
    question: 'Bitcoin Up or Down - Next 15 Minutes', 
    outcomePrices: ['0.55', '0.45'], 
    change: '+0.9%', 
    volume: 98000,
    timeframe: '15m',
    symbol: 'BTC'
  },
  { 
    id: '7', 
    question: 'Will Solana Break $185 in Next Hour?', 
    outcomePrices: ['0.44', '0.56'], 
    change: '-2.3%', 
    volume: 112000,
    timeframe: '1h',
    symbol: 'SOL'
  },
]

const PORTFOLIO = [ /* keep your original portfolio */ 
  { market: 'Will BTC hit $100k in 2025?', side: 'YES', shares: 150, avgPrice: 0.48, current: 0.55 },
  { market: 'Will ETH be above $2k?', side: 'NO', shares: 200, avgPrice: 0.55, current: 0.52 },
  { market: 'Will XRP be above $3?', side: 'YES', shares: 100, avgPrice: 0.38, current: 0.44 },
]

const T = { /* your original T object - keep it exactly as before */ 
  bg0: '#0a0a1a', bg1: '#0f0f23', bg2: '#14142e', bg3: '#1a1a38', bgCard: '#111128',
  border: 'rgba(255,255,255,0.06)', borderHi: 'rgba(255,255,255,0.12)',
  blue: '#3b82f6', blueDim: 'rgba(59,130,246,0.15)',
  teal: '#14b8a6', tealDim: 'rgba(20,184,166,0.15)',
  red: '#f43f5e', redDim: 'rgba(244,63,94,0.15)',
  purple: '#a78bfa', purpleDim: 'rgba(167,139,250,0.12)',
  text0: '#f8fafc', text1: '#94a3b8', text2: '#475569',
  sans: '"Inter", -apple-system, BlinkMacSystemFont, sans-serif',
}

// Keep your existing generateCandles and Chart function exactly as before
function generateCandles(base, count = 42) { /* ... your original code ... */ }
function Chart({ market }) { /* ... your original code ... */ }

// DashboardPage - keep as you like (or use previous version)

function DashboardPage({ user, prices }) {
  // ... your original DashboardPage code ...
}

// ── IMPROVED MARKETS PAGE ──────────────────────────────
function MarketsPage({ prices, selected, setSelected, analysis, setAnalysis, analyzeMarket, analyzing }) {
  const selectedLive = prices.find(m => m.id === selected?.id)

  return (
    <div style={{ display: 'flex', flex: 1, overflow: 'hidden', flexDirection: window.innerWidth < 768 ? 'column' : 'row' }}>
      {/* Market List - Improved */}
      <div style={{ 
        width: window.innerWidth < 768 ? '100%' : 300, 
        borderRight: window.innerWidth >= 768 ? `1px solid ${T.border}` : 'none', 
        borderBottom: window.innerWidth < 768 ? `1px solid ${T.border}` : 'none', 
        display: 'flex', 
        flexDirection: 'column', 
        flexShrink: 0 
      }}>
        <div style={{ padding: '12px 16px', borderBottom: `1px solid ${T.border}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontSize: 13, fontWeight: 600, color: T.text0 }}>🔴 Live Crypto Markets</span>
          <span style={{ fontSize: 11, color: T.text2, background: T.purpleDim, padding: '4px 10px', borderRadius: 20 }}>
            {prices.length} active • 5-15m focus
          </span>
        </div>

        <div style={{ overflowY: 'auto', flex: 1 }}>
          {prices.map(market => {
            const yes = (parseFloat(market.outcomePrices[0]) * 100).toFixed(0)
            const isUp = market.change.startsWith('+')
            const isSelected = selected?.id === market.id

            return (
              <div 
                key={market.id}
                onClick={() => { setSelected(market); setAnalysis('') }}
                style={{
                  padding: '14px 16px',
                  borderBottom: `1px solid ${T.border}`,
                  cursor: 'pointer',
                  background: isSelected ? T.bg3 : 'transparent',
                  borderLeft: `4px solid ${isSelected ? T.blue : 'transparent'}`,
                  transition: 'all 0.2s'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
                  <div style={{ fontSize: 13.5, lineHeight: 1.35, color: isSelected ? T.text0 : T.text1, flex: 1 }}>
                    {market.question}
                  </div>
                  <div style={{ fontSize: 11, color: T.text2, background: T.bg2, padding: '2px 6px', borderRadius: 4, marginLeft: 8 }}>
                    {market.timeframe}
                  </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ 
                    fontSize: 17, 
                    fontWeight: 700, 
                    color: parseFloat(yes) > 50 ? T.teal : T.red 
                  }}>
                    {yes}%
                  </span>
                  <span style={{ 
                    fontSize: 12, 
                    color: isUp ? T.teal : T.red, 
                    background: isUp ? T.tealDim : T.redDim, 
                    padding: '3px 8px', 
                    borderRadius: 6 
                  }}>
                    {market.change}
                  </span>
                </div>

                <div style={{ marginTop: 8, fontSize: 11, color: T.text2 }}>
                  Vol ${(market.volume / 1000).toFixed(0)}K
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Chart + Analysis Panel - same as before but with better header */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        {selectedLive ? (
          <>
            <div style={{ padding: '16px 20px', borderBottom: `1px solid ${T.border}`, background: 'rgba(15,15,35,0.6)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
              <div>
                <div style={{ fontSize: 15, fontWeight: 600, color: T.text0 }}>{selectedLive.question}</div>
                <div style={{ fontSize: 12, color: T.text2 }}>{selectedLive.timeframe} • Polymarket Crypto</div>
              </div>
              <div style={{ display: 'flex', gap: 12 }}>
                {[{ label: 'YES', val: selectedLive.outcomePrices[0], color: T.teal },
                  { label: 'NO',  val: selectedLive.outcomePrices[1], color: T.red }].map(item => (
                  <div key={item.label} style={{ textAlign: 'center', background: T.bg2, padding: '8px 18px', borderRadius: 10, minWidth: 90 }}>
                    <div style={{ fontSize: 11, color: item.color, fontWeight: 600 }}>{item.label}</div>
                    <div style={{ fontSize: 21, fontWeight: 700, color: item.color }}>
                      {(parseFloat(item.val) * 100).toFixed(0)}%
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div style={{ flex: 1, padding: '20px', overflowY: 'auto' }}>
              <div style={{ fontSize: 11, color: T.text2, marginBottom: 8, letterSpacing: '0.5px' }}>LIVE PROBABILITY CHART</div>
              <Chart market={selectedLive} />

              {/* AI Analysis Box */}
              <div style={{ marginTop: 28, padding: '20px', background: T.bgCard, borderRadius: 16, border: `1px solid ${T.border}` }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
                  <span style={{ fontSize: 14, fontWeight: 600, color: T.text0 }}>✦ AI Market Analysis</span>
                  <button 
                    onClick={() => analyzeMarket(selectedLive)} 
                    disabled={analyzing}
                    style={{ 
                      background: analyzing ? T.blueDim : 'linear-gradient(135deg,#3b82f6,#6366f1)', 
                      color: '#fff', 
                      border: 'none', 
                      padding: '9px 18px', 
                      borderRadius: 10, 
                      fontSize: 13, 
                      fontWeight: 600,
                      cursor: analyzing ? 'default' : 'pointer'
                    }}
                  >
                    {analyzing ? 'Analyzing...' : 'Get AI Insight'}
                  </button>
                </div>
                {analysis ? (
                  <p style={{ color: T.text1, lineHeight: 1.65, fontSize: 13.5 }}>{analysis}</p>
                ) : (
                  <p style={{ color: T.text2, fontSize: 13 }}>Click the button above to get instant AI analysis on this short-term market.</p>
                )}
              </div>
            </div>
          </>
        ) : (
          <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 16, color: T.text2 }}>
            <div style={{ fontSize: 48, opacity: 0.6 }}>📊</div>
            <div style={{ fontSize: 16 }}>Select a live crypto market</div>
            <div style={{ fontSize: 13, maxWidth: 280, textAlign: 'center' }}>
              Short-term 5–15 minute Up/Down markets + daily predictions from Polymarket style
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

// Keep your DepositsPage, App component structure, etc. the same as the last version I gave you

// ... (rest of your App function remains unchanged)