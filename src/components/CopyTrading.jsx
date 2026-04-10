import { useState, useEffect, useRef, useCallback } from 'react'
import { fetchLeaderboard, enrichTrader, fetchWalletPnl, fetchWalletTrades, fetchWalletPositions } from '../lib/polymarket'

//  Fallback mock data (shown while loading or if API fails) 

const MOCK_TRADERS = [
  {
    id: '1', handle: '0xAlpha', addr: '0xa1b2c3d4f3e4a1b2c3d4f3e4a1b2c3d4f3e4a1b2', avatar: 'A',
    pnl: 84200, pnl7d: 12300, pnl30d: 31000, winRate: 73, trades: 312, volume: 2100000,
    activeSince: '8 months', categories: ['Crypto'], botScore: 0,
    currentPositions: [
      { market: 'Will BTC hit $100k in 2025?', side: 'YES', size: 800, entry: 0.55, current: 0.61, pnl: 87 },
      { market: 'Will ETH be above $2k on April 30?', side: 'YES', size: 500, entry: 0.48, current: 0.52, pnl: 42 },
    ],
    recentTrades: [
      { time: '2m ago', market: 'Will BTC hit $100k in 2025?', side: 'YES', size: 800, price: 0.55, type: 'BUY' },
      { time: '4h ago', market: 'Will Solana hit $200 in April?', side: 'NO', size: 300, price: 0.68, type: 'BUY' },
      { time: '1d ago', market: 'Will BTC dominance exceed 60%?', side: 'YES', size: 600, price: 0.70, type: 'SELL' },
    ],
  },
  {
    id: '2', handle: 'CryptoOracle', addr: '0xc7d8e9f0b1a2c7d8e9f0b1a2c7d8e9f0b1a2c7d8', avatar: 'C',
    pnl: 61800, pnl7d: 8100, pnl30d: 19400, winRate: 68, trades: 187, volume: 890000,
    activeSince: '5 months', categories: ['Crypto'], botScore: 0,
    currentPositions: [
      { market: 'Will Solana hit $200 in April?', side: 'NO', size: 600, entry: 0.32, current: 0.30, pnl: 125 },
    ],
    recentTrades: [
      { time: '1h ago', market: 'Will Solana hit $200 in April?', side: 'NO', size: 600, price: 0.32, type: 'BUY' },
      { time: '6h ago', market: 'Will Bitcoin be above $90k?', side: 'YES', size: 1000, price: 0.62, type: 'BUY' },
    ],
  },
  {
    id: '3', handle: 'ProbKing', addr: '0xf9e1d2c3c4d5f9e1d2c3c4d5f9e1d2c3c4d5f9e1', avatar: 'P',
    pnl: 47300, pnl7d: 3200, pnl30d: 12100, winRate: 65, trades: 98, volume: 430000,
    activeSince: '6 months', categories: ['Crypto'], botScore: 0,
    currentPositions: [
      { market: 'Will Bitcoin be above $90k on April 30?', side: 'YES', size: 1200, entry: 0.62, current: 0.64, pnl: 38 },
    ],
    recentTrades: [
      { time: '3h ago', market: 'Will Bitcoin be above $90k?', side: 'YES', size: 1200, price: 0.62, type: 'BUY' },
    ],
  },
]

const DEFAULT_COPY_CONFIG = {
  sizingMode: 'percent',
  copyPercent: 10,
  fixedAmount: 25,
  proportionalPct: 5,
  minSize: 5,
  maxSize: 100,
  maxOdds: 0.80,
  minTrigger: 10,
  copySells: 'mirror',
  sellFixedAmount: 25,
  sellCustomPct: 100,
  maxMarketExposure: 200,
  fadeMode: false,
  autoStop: false,
  autoStopPct: 20,
}

//  Utils 

function fmt$(n) {
  if (n >= 1000000) return `$${(n / 1000000).toFixed(1)}M`
  if (n >= 1000) return `$${(n / 1000).toFixed(0)}K`
  return `$${n}`
}
function fmtPnl(n) { return `${n >= 0 ? '+' : ''}${fmt$(n)}` }
function pnlColor(n) { return n > 0 ? '#1D9E75' : n < 0 ? '#D85A30' : '#888' }
function shortAddr(addr) {
  if (!addr || addr.length < 10) return addr || '??'
  return addr.slice(0, 6) + '...' + addr.slice(-4)
}

//  Small components 

function Avatar({ char, size = 32, color = '#185FA5' }) {
  return (
    <div style={{
      width: size, height: size, borderRadius: '50%',
      background: color + '22', border: `1px solid ${color}44`,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontSize: size * 0.4, fontWeight: 600, color, flexShrink: 0,
    }}>{char}</div>
  )
}

function Badge({ label, color = '#185FA5' }) {
  return (
    <span style={{
      fontSize: 10, padding: '2px 7px', borderRadius: 20, fontWeight: 500,
      background: color + '18', color, border: `0.5px solid ${color}33`, whiteSpace: 'nowrap',
    }}>{label}</span>
  )
}

function WinBar({ rate }) {
  return (
    <div style={{ height: 3, background: '#2a2a2a', borderRadius: 2, width: '100%', marginTop: 4 }}>
      <div style={{
        width: `${Math.min(100, rate)}%`, height: '100%', borderRadius: 2,
        background: rate >= 65 ? '#1D9E75' : rate >= 55 ? '#BA7517' : '#D85A30',
      }} />
    </div>
  )
}

function SideChip({ side }) {
  return (
    <span style={{
      fontSize: 10, padding: '2px 6px', borderRadius: 20, fontWeight: 600,
      background: side === 'YES' ? '#1D9E7522' : '#D85A3022',
      color: side === 'YES' ? '#1D9E75' : '#D85A30',
    }}>{side}</span>
  )
}

function Spinner() {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 120, color: '#555', fontSize: 12, gap: 8 }}>
      <div style={{
        width: 14, height: 14, border: '2px solid #333', borderTopColor: '#378ADD',
        borderRadius: '50%', animation: 'spin 0.7s linear infinite',
      }} />
      Loading...
    </div>
  )
}

function Section({ label, children }) {
  return (
    <div style={{ padding: '14px 0', borderBottom: '0.5px solid #2a2a2a' }}>
      <div style={{ fontSize: 10, color: '#555', fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: 10 }}>{label}</div>
      {children}
    </div>
  )
}

function SliderRow({ label, value, min, max, step, display, onChange, hint }) {
  return (
    <div style={{ marginBottom: 10 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
        <span style={{ fontSize: 12, color: '#b2b5be' }}>{label}</span>
        <span style={{ fontSize: 12, fontWeight: 500, color: '#fff' }}>{display}</span>
      </div>
      <input type="range" min={min} max={max} step={step} value={value}
        onChange={e => onChange(Number(e.target.value))}
        style={{ width: '100%', accentColor: '#378ADD' }} />
      {hint && <div style={{ fontSize: 10, color: '#444', marginTop: 2 }}>{hint}</div>}
    </div>
  )
}

function NumInput({ label, value, prefix, onChange }) {
  return (
    <div>
      <div style={{ fontSize: 11, color: '#555', marginBottom: 4 }}>{label}</div>
      <div style={{ display: 'flex', alignItems: 'center', background: '#1e222d', border: '0.5px solid #333', borderRadius: 6, overflow: 'hidden' }}>
        {prefix && <span style={{ padding: '0 8px', color: '#555', fontSize: 12 }}>{prefix}</span>}
        <input type="number" value={value} onChange={e => onChange(Number(e.target.value))}
          style={{ flex: 1, background: 'transparent', border: 'none', color: '#d1d4dc', fontSize: 12, padding: '6px 8px', outline: 'none' }} />
      </div>
    </div>
  )
}

function Toggle({ label, sublabel, value, onChange, accent = '#378ADD' }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
      <div>
        <div style={{ fontSize: 12, color: '#b2b5be' }}>{label}</div>
        {sublabel && <div style={{ fontSize: 10, color: '#555', marginTop: 1 }}>{sublabel}</div>}
      </div>
      <div onClick={() => onChange(!value)} style={{
        width: 36, height: 20, borderRadius: 10, cursor: 'pointer',
        background: value ? accent : '#333', position: 'relative', transition: 'background 0.2s', flexShrink: 0,
      }}>
        <div style={{
          position: 'absolute', top: 3, left: value ? 18 : 3,
          width: 14, height: 14, borderRadius: 7, background: '#fff', transition: 'left 0.2s',
        }} />
      </div>
    </div>
  )
}

//  Live Feed 

function LiveFeed({ copiedTraders, configs }) {
  const [feed, setFeed] = useState([])

  useEffect(() => {
    if (!copiedTraders.length) return
    const interval = setInterval(() => {
      const trader = copiedTraders[Math.floor(Math.random() * copiedTraders.length)]
      if (!trader.recentTrades.length) return
      const trade = trader.recentTrades[Math.floor(Math.random() * trader.recentTrades.length)]
      const cfg = configs[trader.id] || DEFAULT_COPY_CONFIG
      const origSize = trade.size
      if (origSize < cfg.minTrigger || trade.price > cfg.maxOdds) return
      let yourSize = cfg.sizingMode === 'percent'
        ? Math.round(origSize * cfg.copyPercent / 100)
        : cfg.sizingMode === 'fixed' ? cfg.fixedAmount
        : Math.round(1000 * cfg.proportionalPct / 100)
      yourSize = Math.min(cfg.maxSize, Math.max(cfg.minSize, yourSize))
      const actualSide = cfg.fadeMode ? (trade.side === 'YES' ? 'NO' : 'YES') : trade.side
      setFeed(prev => [{
        id: Date.now() + Math.random(),
        trader: trader.handle, market: trade.market,
        side: actualSide, origSize, yourSize, price: trade.price,
        fade: cfg.fadeMode, ts: new Date().toLocaleTimeString(),
      }, ...prev].slice(0, 20))
    }, 4500)
    return () => clearInterval(interval)
  }, [copiedTraders, configs])

  if (!copiedTraders.length) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: 180, color: '#555', gap: 8 }}>
        <div style={{ fontSize: 12 }}>Follow traders to see live copy executions</div>
      </div>
    )
  }

  return (
    <div>
      {feed.length === 0 && (
        <div style={{ padding: '20px 0', textAlign: 'center', color: '#555', fontSize: 12 }}>
          Waiting for trades from followed wallets...
        </div>
      )}
      {feed.map(item => (
        <div key={item.id} style={{
          display: 'grid', gridTemplateColumns: '70px 1fr auto', gap: 10,
          alignItems: 'center', padding: '8px 0', borderBottom: '0.5px solid #2a2a2a',
        }}>
          <div>
            <div style={{ fontSize: 10, color: '#555' }}>{item.ts}</div>
            <div style={{ fontSize: 11, color: '#888', marginTop: 1 }}>{item.trader}</div>
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginBottom: 2 }}>
              <SideChip side={item.side} />
              {item.fade && <span style={{ fontSize: 9, color: '#BA7517', fontStyle: 'italic' }}>faded</span>}
              <span style={{ fontSize: 11, color: '#b2b5be' }}>{(item.price * 100).toFixed(0)}c</span>
            </div>
            <div style={{ fontSize: 11, color: '#888', lineHeight: 1.3 }}>
              {item.market.length > 48 ? item.market.slice(0, 48) + '...' : item.market}
            </div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: 12, fontWeight: 600, color: '#26a69a' }}>${item.yourSize}</div>
            <div style={{ fontSize: 10, color: '#555' }}>of ${item.origSize}</div>
          </div>
        </div>
      ))}
    </div>
  )
}

//  Copy Config 

function CopyConfig({ config, onChange }) {
  const cfg = config || DEFAULT_COPY_CONFIG
  const set = (key, val) => onChange({ ...cfg, [key]: val })
  const MODES = [{ id: 'percent', label: '% of theirs' }, { id: 'fixed', label: 'Fixed $' }, { id: 'proportional', label: 'Proportional' }]

  return (
    <div>
      <Section label="Position sizing">
        <div style={{ display: 'flex', gap: 6, marginBottom: 12 }}>
          {MODES.map(m => (
            <button key={m.id} onClick={() => set('sizingMode', m.id)} style={{
              flex: 1, padding: '6px 4px', fontSize: 11, borderRadius: 6, cursor: 'pointer',
              background: cfg.sizingMode === m.id ? '#185FA5' : 'transparent',
              color: cfg.sizingMode === m.id ? '#fff' : '#888',
              border: `0.5px solid ${cfg.sizingMode === m.id ? '#185FA5' : '#333'}`,
            }}>{m.label}</button>
          ))}
        </div>
        {cfg.sizingMode === 'percent' && <SliderRow label="Copy %" value={cfg.copyPercent} min={1} max={100} step={1} display={`${cfg.copyPercent}%`} onChange={v => set('copyPercent', v)} />}
        {cfg.sizingMode === 'fixed' && <SliderRow label="Fixed amount" value={cfg.fixedAmount} min={1} max={500} step={1} display={`$${cfg.fixedAmount}`} onChange={v => set('fixedAmount', v)} />}
        {cfg.sizingMode === 'proportional' && <SliderRow label="% of balance" value={cfg.proportionalPct} min={1} max={20} step={1} display={`${cfg.proportionalPct}%`} onChange={v => set('proportionalPct', v)} />}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginTop: 8 }}>
          <NumInput label="Min per trade" value={cfg.minSize} prefix="$" onChange={v => set('minSize', v)} />
          <NumInput label="Max per trade" value={cfg.maxSize} prefix="$" onChange={v => set('maxSize', v)} />
        </div>
      </Section>
      <Section label="Trade filters">
        <SliderRow label="Max odds" value={Math.round(cfg.maxOdds * 100)} min={10} max={99} step={1} display={`${Math.round(cfg.maxOdds * 100)}c`} onChange={v => set('maxOdds', v / 100)} hint="Skip trades priced above this" />
        <SliderRow label="Min trigger size" value={cfg.minTrigger} min={1} max={500} step={1} display={`$${cfg.minTrigger}`} onChange={v => set('minTrigger', v)} hint="Only copy if original trade is at least this large" />
        <SliderRow label="Max market exposure" value={cfg.maxMarketExposure} min={0} max={1000} step={10} display={cfg.maxMarketExposure === 0 ? 'No cap' : `$${cfg.maxMarketExposure}`} onChange={v => set('maxMarketExposure', v)} hint="Max total held in any single market" />
      </Section>
      <Section label="Sell / exit behavior">
        <div style={{ display: 'flex', gap: 6, marginBottom: 10 }}>
          {[['mirror', 'Mirror sells'], ['fixed', 'Fixed $'], ['custom_pct', 'Custom %']].map(([id, lbl]) => (
            <button key={id} onClick={() => set('copySells', id)} style={{
              flex: 1, padding: '6px 4px', fontSize: 11, borderRadius: 6, cursor: 'pointer',
              background: cfg.copySells === id ? '#185FA5' : 'transparent',
              color: cfg.copySells === id ? '#fff' : '#888',
              border: `0.5px solid ${cfg.copySells === id ? '#185FA5' : '#333'}`,
            }}>{lbl}</button>
          ))}
        </div>
        {cfg.copySells === 'mirror' && <div style={{ fontSize: 11, color: '#555', padding: '4px 0' }}>When trader sells X% of position, you sell X% of yours.</div>}
        {cfg.copySells === 'fixed' && <NumInput label="Sell amount" value={cfg.sellFixedAmount} prefix="$" onChange={v => set('sellFixedAmount', v)} />}
        {cfg.copySells === 'custom_pct' && <SliderRow label="Sell %" value={cfg.sellCustomPct} min={1} max={100} step={1} display={`${cfg.sellCustomPct}%`} onChange={v => set('sellCustomPct', v)} />}
      </Section>
      <Section label="Advanced">
        <Toggle label="Fade mode" sublabel="Reverse all trades - bet against this trader" value={cfg.fadeMode} onChange={v => set('fadeMode', v)} accent="#D85A30" />
        <Toggle label="Auto-stop on drawdown" sublabel="Pause copying if losses exceed threshold" value={cfg.autoStop} onChange={v => set('autoStop', v)} />
        {cfg.autoStop && <SliderRow label="Stop at drawdown" value={cfg.autoStopPct} min={5} max={50} step={5} display={`${cfg.autoStopPct}%`} onChange={v => set('autoStopPct', v)} />}
      </Section>
    </div>
  )
}

//  Wallet Modal 

function WalletModal({ onAdd, onClose }) {
  const [addr, setAddr] = useState('')
  const [nick, setNick] = useState('')
  const [err, setErr] = useState('')
  const [loading, setLoading] = useState(false)

  const submit = async () => {
    if (!addr.startsWith('0x') || addr.length < 10) { setErr('Enter a valid 0x wallet address'); return }
    setLoading(true)
    // Try to fetch real PnL data for this wallet
    const pnlData = await fetchWalletPnl(addr)
    setLoading(false)
    onAdd({
      addr,
      nick: nick || shortAddr(addr),
      pnlData, // pass through so CopyTrading can build the trader object
    })
  }

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 200 }} onClick={onClose}>
      <div onClick={e => e.stopPropagation()} style={{ background: '#1e222d', border: '0.5px solid #333', borderRadius: 10, padding: 24, width: 360, display: 'flex', flexDirection: 'column', gap: 14 }}>
        <div style={{ color: '#fff', fontWeight: 600, fontSize: 15 }}>Track a wallet</div>
        <div>
          <div style={{ fontSize: 11, color: '#555', marginBottom: 5 }}>Wallet address</div>
          <input value={addr} onChange={e => { setAddr(e.target.value); setErr('') }} placeholder="0xabc123..."
            style={{ width: '100%', background: '#131722', border: '0.5px solid #333', borderRadius: 6, color: '#d1d4dc', fontSize: 13, padding: '8px 12px', outline: 'none', boxSizing: 'border-box' }} />
          {err && <div style={{ fontSize: 11, color: '#D85A30', marginTop: 4 }}>{err}</div>}
        </div>
        <div>
          <div style={{ fontSize: 11, color: '#555', marginBottom: 5 }}>Nickname (optional)</div>
          <input value={nick} onChange={e => setNick(e.target.value)} placeholder="e.g. French Whale"
            style={{ width: '100%', background: '#131722', border: '0.5px solid #333', borderRadius: 6, color: '#d1d4dc', fontSize: 13, padding: '8px 12px', outline: 'none', boxSizing: 'border-box' }} />
        </div>
        <div style={{ fontSize: 11, color: '#555' }}>We'll pull this wallet's real PnL and trade history from Polymarket.</div>
        <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
          <button onClick={onClose} style={{ padding: '7px 16px', borderRadius: 6, border: '0.5px solid #333', background: 'transparent', color: '#888', fontSize: 12, cursor: 'pointer' }}>Cancel</button>
          <button onClick={submit} disabled={loading} style={{ padding: '7px 16px', borderRadius: 6, border: 'none', background: loading ? '#333' : '#185FA5', color: '#fff', fontSize: 12, cursor: loading ? 'default' : 'pointer', fontWeight: 600 }}>
            {loading ? 'Looking up...' : 'Track wallet'}
          </button>
        </div>
      </div>
    </div>
  )
}

//  Main Component 

export default function CopyTrading() {
  const [traders, setTraders] = useState(MOCK_TRADERS)
  const [loadingLeaderboard, setLoadingLeaderboard] = useState(true)
  const [apiError, setApiError] = useState(false)

  const [tab, setTab] = useState('leaderboard')
  const [sortBy, setSortBy] = useState('pnl')
  const [filterCat, setFilterCat] = useState('All')
  const [selectedId, setSelectedId] = useState(null)
  const [rightTab, setRightTab] = useState('positions')
  const [loadingTrader, setLoadingTrader] = useState(false)

  const [followedIds, setFollowedIds] = useState([])
  const [configs, setConfigs] = useState({})
  const [showWalletModal, setShowWalletModal] = useState(false)
  const [customWallets, setCustomWallets] = useState([])
  const [timeFilter, setTimeFilter] = useState('all')

  //  Load real leaderboard on mount
  useEffect(() => {
    setLoadingLeaderboard(true)
    fetchLeaderboard(20)
      .then(data => {
        if (data && data.length > 0) {
          setTraders(data)
          setApiError(false)
        } else {
          // API returned empty  keep mock data
          setApiError(true)
        }
      })
      .catch(() => setApiError(true))
      .finally(() => setLoadingLeaderboard(false))
  }, [])

  const allTraders = [...traders, ...customWallets]
  const followedTraders = allTraders.filter(t => followedIds.includes(t.id))

  const displayedTraders = (tab === 'following' ? followedTraders : [...allTraders]
    .filter(t => filterCat === 'All' || t.categories?.includes(filterCat))
    .sort((a, b) => {
      if (sortBy === 'pnl') return b.pnl - a.pnl
      if (sortBy === 'winRate') return b.winRate - a.winRate
      if (sortBy === 'volume') return b.volume - a.volume
      if (sortBy === 'pnl7d') return (b.pnl7d || 0) - (a.pnl7d || 0)
      return 0
    }))

  const selected = allTraders.find(t => t.id === selectedId)

  //  When a trader is selected, enrich them with live positions + trades
  const selectTrader = useCallback(async (trader) => {
    setSelectedId(trader.id)
    setRightTab('positions')

    // Only fetch if not already enriched
    if (trader.recentTrades.length === 0 || trader.currentPositions.length === 0) {
      setLoadingTrader(true)
      try {
        const enriched = await enrichTrader(trader)
        setTraders(prev => prev.map(t => t.id === trader.id ? enriched : t))
        setCustomWallets(prev => prev.map(t => t.id === trader.id ? enriched : t))
      } catch (_) {}
      setLoadingTrader(false)
    }
  }, [])

  const toggleFollow = useCallback((id) => {
    setFollowedIds(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id])
    setConfigs(prev => prev[id] ? prev : { ...prev, [id]: { ...DEFAULT_COPY_CONFIG } })
  }, [])

  const updateConfig = useCallback((id, cfg) => {
    setConfigs(prev => ({ ...prev, [id]: cfg }))
  }, [])

  const addCustomWallet = async ({ addr, nick, pnlData }) => {
    const newTrader = {
      id: 'custom-' + addr,
      addr,
      handle: nick,
      avatar: (nick[0] || '?').toUpperCase(),
      pnl: pnlData?.pnl || 0,
      pnl7d: 0,
      pnl30d: 0,
      winRate: 0,
      trades: pnlData?.trades || 0,
      volume: pnlData?.volume || 0,
      activeSince: 'Unknown',
      categories: ['Crypto'],
      botScore: 0,
      currentPositions: [],
      recentTrades: [],
      custom: true,
    }
    setCustomWallets(prev => [...prev, newTrader])
    setShowWalletModal(false)
    // Immediately enrich
    selectTrader(newTrader)
  }

  const pnlForFilter = t => timeFilter === '7d' ? (t.pnl7d || 0) : timeFilter === '30d' ? (t.pnl30d || 0) : t.pnl

  // Shared styles
  const tabBtn = active => ({
    flex: 1, padding: '8px 0', fontSize: 11, textAlign: 'center', cursor: 'pointer',
    color: active ? '#fff' : '#555', background: 'none', border: 'none',
    borderBottom: `2px solid ${active ? '#378ADD' : 'transparent'}`, fontFamily: 'inherit',
  })
  const pillBtn = (active, c = '#185FA5') => ({
    fontSize: 10, padding: '3px 8px', borderRadius: 20, cursor: 'pointer',
    background: active ? c : 'transparent', color: active ? '#fff' : '#555',
    border: `0.5px solid ${active ? c : '#333'}`, fontFamily: 'inherit',
  })
  const actionBtn = primary => primary
    ? { padding: '6px 14px', borderRadius: 6, fontSize: 12, cursor: 'pointer', fontFamily: 'inherit', fontWeight: 600, background: '#185FA5', color: '#fff', border: 'none' }
    : { padding: '6px 14px', borderRadius: 6, fontSize: 12, cursor: 'pointer', fontFamily: 'inherit', fontWeight: 600, background: 'transparent', color: '#888', border: '0.5px solid #333' }

  return (
    <>
      <style>{`
        .ct-root input[type=range] { accent-color: #378ADD; }
        .ct-scroll { scrollbar-width: thin; scrollbar-color: #333 transparent; }
        .ct-scroll::-webkit-scrollbar { width: 4px; }
        .ct-scroll::-webkit-scrollbar-thumb { background: #333; border-radius: 2px; }
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>

      <div className="ct-root" style={{
        display: 'flex', width: '100%', height: '100%',
        background: '#131722', color: '#d1d4dc',
        fontFamily: '"Courier New", monospace', fontSize: 13, overflow: 'hidden',
      }}>

        {/*  LEFT  */}
        <div style={{ width: 300, borderRight: '0.5px solid #2a2a2a', display: 'flex', flexDirection: 'column', background: '#1e222d', flexShrink: 0 }}>

          <div style={{ padding: '11px 16px', borderBottom: '0.5px solid #2a2a2a', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ color: '#fff', fontWeight: 600, fontSize: 13 }}>COPY TRADING</span>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              {apiError && <span style={{ fontSize: 10, color: '#BA7517' }}>demo data</span>}
              {!apiError && !loadingLeaderboard && <span style={{ fontSize: 10, color: '#1D9E75' }}>live</span>}
              <button onClick={() => setShowWalletModal(true)} style={{ ...actionBtn(false), fontSize: 11, padding: '4px 10px' }}>+ wallet</button>
            </div>
          </div>

          <div style={{ display: 'flex', borderBottom: '0.5px solid #2a2a2a' }}>
            {[['leaderboard', 'Top'], ['following', `Following (${followedIds.length})`], ['feed', 'Live feed']].map(([id, lbl]) => (
              <button key={id} style={tabBtn(tab === id)} onClick={() => setTab(id)}>{lbl}</button>
            ))}
          </div>

          {tab !== 'feed' && (
            <>
              <div style={{ padding: '8px 12px', borderBottom: '0.5px solid #2a2a2a', display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                {[['pnl', 'All-time'], ['pnl7d', '7d'], ['winRate', 'Win %'], ['volume', 'Volume']].map(([id, lbl]) => (
                  <button key={id} style={pillBtn(sortBy === id)} onClick={() => { setSortBy(id); setTimeFilter(id === 'pnl7d' ? '7d' : 'all') }}>{lbl}</button>
                ))}
              </div>
              <div style={{ padding: '6px 12px', borderBottom: '0.5px solid #2a2a2a', display: 'flex', gap: 6 }}>
                {['All', 'Crypto', 'Politics', 'Sports'].map(cat => (
                  <button key={cat} style={pillBtn(filterCat === cat, '#1D9E75')} onClick={() => setFilterCat(cat)}>{cat}</button>
                ))}
              </div>
            </>
          )}

          <div className="ct-scroll" style={{ flex: 1, overflowY: 'auto' }}>
            {tab === 'feed' ? (
              <div style={{ padding: '0 14px' }}>
                <LiveFeed copiedTraders={followedTraders} configs={configs} />
              </div>
            ) : loadingLeaderboard ? (
              <Spinner />
            ) : displayedTraders.length === 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: 160, gap: 8, color: '#555' }}>
                <div style={{ fontSize: 11 }}>{tab === 'following' ? 'Not following anyone yet' : 'No traders'}</div>
              </div>
            ) : (
              displayedTraders.map((trader, i) => {
                const isSelected = selectedId === trader.id
                const isFollowing = followedIds.includes(trader.id)
                const pnl = pnlForFilter(trader)
                return (
                  <div key={trader.id}
                    onClick={() => selectTrader(trader)}
                    style={{
                      padding: '10px 14px', borderBottom: '0.5px solid #2a2a2a', cursor: 'pointer',
                      background: isSelected ? '#252a38' : 'transparent',
                      borderLeft: `2px solid ${isSelected ? '#378ADD' : 'transparent'}`,
                    }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                      <div style={{ fontSize: 11, color: '#444', minWidth: 18 }}>#{i + 1}</div>
                      <Avatar char={trader.avatar} size={28} color={isFollowing ? '#1D9E75' : '#378ADD'} />
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                          <span style={{ color: isSelected ? '#fff' : '#b2b5be', fontWeight: 600, fontSize: 12, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{trader.handle}</span>
                          {isFollowing && <Badge label="COPY" color="#1D9E75" />}
                        </div>
                        <div style={{ fontSize: 10, color: '#444', marginTop: 1 }}>{shortAddr(trader.addr)}</div>
                      </div>
                      <div style={{ fontSize: 13, fontWeight: 600, color: pnlColor(pnl) }}>{fmtPnl(pnl)}</div>
                    </div>
                    <div style={{ display: 'flex', gap: 10, marginLeft: 26 }}>
                      <span style={{ fontSize: 10, color: '#555' }}>{trader.winRate}% win</span>
                      <span style={{ fontSize: 10, color: '#555' }}>{trader.trades} trades</span>
                    </div>
                    <WinBar rate={trader.winRate} />
                  </div>
                )
              })
            )}
          </div>
        </div>

        {/*  RIGHT  */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
          {!selected ? (
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 12, color: '#444' }}>
              <div style={{ fontSize: 13 }}>Select a trader to view details</div>
              <div style={{ fontSize: 11 }}>Browse the leaderboard or add a wallet address</div>
            </div>
          ) : (
            <>
              {/* Header */}
              <div style={{ padding: '14px 20px', borderBottom: '0.5px solid #2a2a2a', background: '#1e222d', flexShrink: 0 }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <Avatar char={selected.avatar} size={42} color={followedIds.includes(selected.id) ? '#1D9E75' : '#378ADD'} />
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                        <span style={{ color: '#fff', fontWeight: 600, fontSize: 16 }}>{selected.handle}</span>
                        {selected.categories?.map(c => <Badge key={c} label={c} color="#378ADD" />)}
                      </div>
                      <div style={{ fontSize: 11, color: '#444', marginTop: 2 }}>{selected.addr}</div>
                      <a href={`https://polymarket.com/profile/${selected.addr}`} target="_blank" rel="noreferrer"
                        style={{ fontSize: 10, color: '#378ADD', textDecoration: 'none', marginTop: 2, display: 'inline-block' }}>
                        View on Polymarket 
                      </a>
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexShrink: 0 }}>
                    {followedIds.includes(selected.id) ? (
                      <>
                        <span style={{ fontSize: 11, color: '#1D9E75' }}>Copying</span>
                        <button onClick={() => toggleFollow(selected.id)} style={{ ...actionBtn(false), fontSize: 11, color: '#D85A30', borderColor: '#D85A3044' }}>Stop</button>
                      </>
                    ) : (
                      <button onClick={() => { toggleFollow(selected.id); setRightTab('config') }} style={actionBtn(true)}>+ Copy trader</button>
                    )}
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 8, marginTop: 14 }}>
                  {[
                    ['All-time PnL', fmtPnl(selected.pnl), pnlColor(selected.pnl)],
                    ['7d PnL', fmtPnl(selected.pnl7d || 0), pnlColor(selected.pnl7d || 0)],
                    ['Win rate', `${selected.winRate}%`, selected.winRate >= 60 ? '#1D9E75' : '#D85A30'],
                    ['Trades', selected.trades, '#d1d4dc'],
                    ['Volume', fmt$(selected.volume), '#d1d4dc'],
                  ].map(([label, val, color]) => (
                    <div key={label} style={{ background: '#131722', borderRadius: 6, padding: '8px 10px' }}>
                      <div style={{ fontSize: 10, color: '#555' }}>{label}</div>
                      <div style={{ fontSize: 15, fontWeight: 600, color, marginTop: 2 }}>{val}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Right tabs */}
              <div style={{ display: 'flex', borderBottom: '0.5px solid #2a2a2a', background: '#1e222d', flexShrink: 0 }}>
                {[['positions', 'Open positions'], ['trades', 'Trade history'], ['config', 'Copy config']].map(([id, lbl]) => (
                  <button key={id} style={tabBtn(rightTab === id)} onClick={() => setRightTab(id)}>{lbl}</button>
                ))}
              </div>

              <div className="ct-scroll" style={{ flex: 1, overflowY: 'auto', padding: '0 20px' }}>

                {loadingTrader ? <Spinner /> : (

                  <>
                    {rightTab === 'positions' && (
                      <div style={{ paddingTop: 14 }}>
                        {selected.currentPositions.length === 0 ? (
                          <div style={{ color: '#555', fontSize: 12, paddingTop: 20 }}>No open positions found</div>
                        ) : (
                          <>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 60px 60px 60px 70px', gap: 8, paddingBottom: 6, borderBottom: '0.5px solid #2a2a2a', marginBottom: 4 }}>
                              {['Market', 'Side', 'Size', 'Entry', 'PnL'].map(h => (
                                <div key={h} style={{ fontSize: 10, color: '#444', fontWeight: 500 }}>{h}</div>
                              ))}
                            </div>
                            {selected.currentPositions.map((pos, i) => (
                              <div key={i} style={{ display: 'grid', gridTemplateColumns: '1fr 60px 60px 60px 70px', gap: 8, padding: '9px 0', borderBottom: '0.5px solid #1e222d', alignItems: 'center' }}>
                                <div style={{ fontSize: 11, color: '#b2b5be', lineHeight: 1.4 }}>{pos.market}</div>
                                <SideChip side={pos.side} />
                                <div style={{ fontSize: 12 }}>${pos.size}</div>
                                <div style={{ fontSize: 12 }}>{(pos.entry * 100).toFixed(0)}c</div>
                                <div style={{ fontSize: 12, fontWeight: 600, color: pnlColor(pos.pnl) }}>{fmtPnl(pos.pnl)}</div>
                              </div>
                            ))}
                          </>
                        )}
                      </div>
                    )}

                    {rightTab === 'trades' && (
                      <div style={{ paddingTop: 14 }}>
                        {selected.recentTrades.length === 0 ? (
                          <div style={{ color: '#555', fontSize: 12, paddingTop: 20 }}>No trade history found</div>
                        ) : (
                          <>
                            <div style={{ display: 'grid', gridTemplateColumns: '80px 1fr 50px 60px 60px', gap: 8, paddingBottom: 6, borderBottom: '0.5px solid #2a2a2a', marginBottom: 4 }}>
                              {['Time', 'Market', 'Side', 'Size', 'Price'].map(h => (
                                <div key={h} style={{ fontSize: 10, color: '#444', fontWeight: 500 }}>{h}</div>
                              ))}
                            </div>
                            {selected.recentTrades.map((t, i) => (
                              <div key={i} style={{ display: 'grid', gridTemplateColumns: '80px 1fr 50px 60px 60px', gap: 8, padding: '8px 0', borderBottom: '0.5px solid #1e222d', alignItems: 'center' }}>
                                <div>
                                  <div style={{ fontSize: 10, color: '#555' }}>{t.time}</div>
                                  <div style={{ fontSize: 10, color: t.type === 'BUY' ? '#1D9E75' : '#D85A30', marginTop: 1 }}>{t.type}</div>
                                </div>
                                <div style={{ fontSize: 11, color: '#b2b5be', lineHeight: 1.4 }}>{t.market}</div>
                                <SideChip side={t.side} />
                                <div style={{ fontSize: 12 }}>${t.size}</div>
                                <div style={{ fontSize: 12 }}>{(t.price * 100).toFixed(0)}c</div>
                              </div>
                            ))}
                          </>
                        )}
                      </div>
                    )}

                    {rightTab === 'config' && (
                      <div style={{ paddingTop: 4 }}>
                        {!followedIds.includes(selected.id) && (
                          <div style={{ background: '#185FA511', border: '0.5px solid #185FA533', borderRadius: 6, padding: '10px 14px', margin: '14px 0', fontSize: 12, color: '#85B7EB' }}>
                            Configure below, then click <strong style={{ color: '#fff' }}>+ Copy trader</strong> above to start.
                          </div>
                        )}
                        <CopyConfig config={configs[selected.id]} onChange={cfg => updateConfig(selected.id, cfg)} />
                      </div>
                    )}
                  </>
                )}

              </div>
            </>
          )}
        </div>
      </div>

      {showWalletModal && <WalletModal onAdd={addCustomWallet} onClose={() => setShowWalletModal(false)} />}
    </>
  )
}