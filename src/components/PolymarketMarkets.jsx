import { useEffect, useState } from "react";

export default function PolymarketMarkets() {
  const [markets, setMarkets] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchMarkets = async () => {
    try {
      const res = await fetch("https://clob.polymarket.com/markets");
      const data = await res.json();

      console.log("MARKETS:", data);

      setMarkets(data || []);
    } catch (err) {
      console.error("Error fetching markets:", err);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchMarkets();

    // 🔁 auto refresh every 5 sec
    const interval = setInterval(fetchMarkets, 5000);
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return <div style={{ color: "#fff", padding: "20px" }}>Loading markets...</div>;
  }

  return (
    <div style={{ padding: "20px" }}>
      <h2 style={{ color: "#fff" }}>📊 Live Polymarket Markets</h2>

      {markets.slice(0, 10).map((market) => (
        <div
          key={market.id}
          style={{
            background: "#1e2030",
            padding: "16px",
            marginBottom: "12px",
            borderRadius: "12px",
            color: "#fff",
          }}
        >
          <div style={{ fontWeight: "bold", fontSize: "16px" }}>
            {market.question}
          </div>

          <div style={{ marginTop: "8px", color: "#aaa" }}>
            Volume: {market.volume}
          </div>

          <div style={{ marginTop: "8px" }}>
            YES: {market.outcomes?.[0]?.price || "N/A"} | NO:{" "}
            {market.outcomes?.[1]?.price || "N/A"}
          </div>
        </div>
      ))}
    </div>
  );
}