export default function MarketCard({ market }) {
  if (!market) return null;

  const yesPrice = market.outcomePrices?.[0] || "0.5";
  const noPrice = market.outcomePrices?.[1] || "0.5";

  return (
    <div style={{
      padding: 12,
      border: "1px solid #333",
      marginBottom: 10,
      color: "white"
    }}>
      <div>{market.question}</div>
      <div>YES: {yesPrice}</div>
      <div>NO: {noPrice}</div>
    </div>
  );
}