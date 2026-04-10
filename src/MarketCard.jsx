export default function MarketCard({ market }) {
  if (!market) return null

  return (
    <div style={{
      border: '1px solid #333',
      padding: 12,
      borderRadius: 8,
      marginBottom: 10,
      color: 'white'
    }}>
      <div>{market.question || "No question"}</div>
      <div>YES: {market.outcomePrices?.[0] ?? "N/A"}</div>
      <div>NO: {market.outcomePrices?.[1] ?? "N/A"}</div>
    </div>
  )
}