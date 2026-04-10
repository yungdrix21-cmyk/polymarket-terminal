// src/lib/polymarket.js
// Real Polymarket data layer  no API key required for Goldsky endpoints

const GOLDSKY_PNL    = 'https://api.goldsky.com/api/public/project_cl6mb8i9h0003e201j6li0diw/subgraphs/pnl-subgraph/0.0.14/gn'
const GOLDSKY_ACTIVITY = 'https://api.goldsky.com/api/public/project_cl6mb8i9h0003e201j6li0diw/subgraphs/activity-subgraph/0.0.4/gn'
const GAMMA_API      = 'https://gamma-api.polymarket.com'

//  GraphQL helper 

async function gql(endpoint, query, variables = {}) {
  const res = await fetch(endpoint, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ query, variables }),
  })
  if (!res.ok) throw new Error(`GraphQL error: ${res.status}`)
  const json = await res.json()
  if (json.errors) throw new Error(json.errors[0].message)
  return json.data
}

//  Leaderboard: top traders by realized PnL 
// Returns array of { id, addr, pnl, pnl7d, winRate, trades, volume }

export async function fetchLeaderboard(limit = 20) {
  const query = `
    query TopTraders($first: Int!) {
      userInformations(
        first: $first
        orderBy: profit
        orderDirection: desc
        where: { profit_gt: "0" }
      ) {
        id
        profit
        numTrades: tradesQuantity
        volume: scaledCollateralVolume
        marketsTraded: marketsQuantity
      }
    }
  `
  try {
    const data = await gql(GOLDSKY_PNL, query, { first: limit })
    return (data.userInformations || []).map(u => ({
      id: u.id,
      addr: u.id,
      handle: u.id.slice(0, 6) + '...' + u.id.slice(-4),
      avatar: u.id.slice(2, 3).toUpperCase(),
      pnl: Math.round(parseFloat(u.profit)),
      pnl7d: 0,   // enriched separately if needed
      pnl30d: 0,
      winRate: 0, // enriched from activity subgraph
      trades: parseInt(u.numTrades) || 0,
      volume: Math.round(parseFloat(u.volume) || 0),
      activeSince: 'Unknown',
      categories: ['Crypto'],
      botScore: 0,
      currentPositions: [],
      recentTrades: [],
    }))
  } catch (err) {
    console.error('fetchLeaderboard failed:', err)
    return []
  }
}

//  Wallet positions: open positions for a wallet 
// Returns array of { market, side, size, entry, current, pnl }

export async function fetchWalletPositions(addr) {
  const query = `
    query WalletPositions($user: String!) {
      positions(
        where: { user: $user, balance_gt: "0" }
        first: 50
        orderBy: balance
        orderDirection: desc
      ) {
        id
        condition
        outcomeIndex
        balance
        averagePrice
        realizedPnl
        user { id }
      }
    }
  `
  try {
    const data = await gql(GOLDSKY_PNL, query, { user: addr.toLowerCase() })
    const positions = data.positions || []

    // Enrich with market names from Gamma
    const enriched = await Promise.all(positions.map(async pos => {
      let marketName = pos.condition.slice(0, 12) + '...'
      let currentPrice = parseFloat(pos.averagePrice) || 0.5

      try {
        const mkt = await fetchMarketByCondition(pos.condition)
        if (mkt) {
          marketName = mkt.question
          currentPrice = pos.outcomeIndex === 0
            ? parseFloat(mkt.outcomePrices?.[0]) || currentPrice
            : parseFloat(mkt.outcomePrices?.[1]) || currentPrice
        }
      } catch (_) {}

      const size = parseFloat(pos.balance) / 1e6  // USDC has 6 decimals
      const entry = parseFloat(pos.averagePrice) || 0
      const unrealizedPnl = (currentPrice - entry) * size
      const realizedPnl = parseFloat(pos.realizedPnl) / 1e6 || 0

      return {
        market: marketName,
        side: pos.outcomeIndex === 0 ? 'YES' : 'NO',
        size: Math.round(size),
        entry: parseFloat(entry.toFixed(2)),
        current: parseFloat(currentPrice.toFixed(2)),
        pnl: Math.round(unrealizedPnl + realizedPnl),
      }
    }))

    return enriched.filter(p => p.size > 0)
  } catch (err) {
    console.error('fetchWalletPositions failed:', err)
    return []
  }
}

//  Wallet trade history 
// Returns array of { time, market, side, size, price, type }

export async function fetchWalletTrades(addr, limit = 20) {
  const query = `
    query WalletTrades($user: String!, $first: Int!) {
      transactions(
        where: { user: $user }
        first: $first
        orderBy: timestamp
        orderDirection: desc
      ) {
        id
        timestamp
        type
        outcomeIndex
        amount
        price
        market { id question }
      }
    }
  `
  try {
    const data = await gql(GOLDSKY_ACTIVITY, query, {
      user: addr.toLowerCase(),
      first: limit,
    })
    const txs = data.transactions || []
    const now = Date.now() / 1000

    return txs.map(tx => {
      const age = now - parseInt(tx.timestamp)
      const timeLabel = age < 3600
        ? `${Math.round(age / 60)}m ago`
        : age < 86400
        ? `${Math.round(age / 3600)}h ago`
        : `${Math.round(age / 86400)}d ago`

      return {
        time: timeLabel,
        market: tx.market?.question || tx.market?.id?.slice(0, 16) + '...' || 'Unknown market',
        side: tx.outcomeIndex === 0 ? 'YES' : 'NO',
        size: Math.round(parseFloat(tx.amount) / 1e6),
        price: parseFloat(tx.price) || 0,
        type: tx.type === 'BUY' ? 'BUY' : 'SELL',
      }
    })
  } catch (err) {
    console.error('fetchWalletTrades failed:', err)
    return []
  }
}

//  Enrich a trader with live positions + trades 
// Call this when a user clicks a trader in the leaderboard

export async function enrichTrader(trader) {
  const [positions, trades] = await Promise.all([
    fetchWalletPositions(trader.addr),
    fetchWalletTrades(trader.addr, 20),
  ])

  // Compute win rate from trades
  const sells = trades.filter(t => t.type === 'SELL')
  const wins = sells.filter(t => t.price > 0.5).length
  const winRate = sells.length > 0 ? Math.round((wins / sells.length) * 100) : 0

  return {
    ...trader,
    currentPositions: positions,
    recentTrades: trades,
    winRate: winRate || trader.winRate,
  }
}

//  Active markets from Gamma REST API 
// Returns array compatible with your CRYPTO_MARKETS format in App.jsx

export async function fetchActiveMarkets(tag = 'crypto', limit = 20) {
  try {
    const res = await fetch(
      `${GAMMA_API}/events?active=true&tag=${tag}&limit=${limit}&order=volume&ascending=false`
    )
    if (!res.ok) throw new Error(`Gamma API error: ${res.status}`)
    const events = await res.json()

    return events.flatMap(event =>
      (event.markets || []).map(m => ({
        id: m.id || m.conditionId,
        question: m.question || event.title,
        outcomePrices: m.outcomePrices
          ? m.outcomePrices.map(p => String(parseFloat(p).toFixed(2)))
          : ['0.50', '0.50'],
        change: '0.0%',
        volume: Math.round(parseFloat(m.volume) || 0),
        conditionId: m.conditionId,
      }))
    ).slice(0, limit)
  } catch (err) {
    console.error('fetchActiveMarkets failed:', err)
    return []
  }
}

//  Single market lookup by condition ID 

export async function fetchMarketByCondition(conditionId) {
  try {
    const res = await fetch(`${GAMMA_API}/markets?conditionId=${conditionId}&limit=1`)
    if (!res.ok) return null
    const markets = await res.json()
    return markets[0] || null
  } catch (_) {
    return null
  }
}

//  Wallet PnL summary 
// Lightweight  just PnL numbers for a given wallet

export async function fetchWalletPnl(addr) {
  const query = `
    query WalletPnl($user: String!) {
      userInformation(id: $user) {
        profit
        tradesQuantity
        scaledCollateralVolume
        marketsQuantity
      }
    }
  `
  try {
    const data = await gql(GOLDSKY_PNL, query, { user: addr.toLowerCase() })
    const u = data.userInformation
    if (!u) return null
    return {
      pnl: Math.round(parseFloat(u.profit) || 0),
      trades: parseInt(u.tradesQuantity) || 0,
      volume: Math.round(parseFloat(u.scaledCollateralVolume) || 0),
    }
  } catch (err) {
    console.error('fetchWalletPnl failed:', err)
    return null
  }
}
