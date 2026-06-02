import express from "express";
import cors from "cors";
import axios from "axios";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Serve React build in production
if (process.env.NODE_ENV === "production") {
  app.use(express.static(path.join(__dirname, "../build")));
}

// Health check
app.get("/api/health", (req, res) => {
  res.json({ ok: true, ts: Date.now() });
});

// Simple sentiment scorer
function scoreSentiment(text) {
  const pos = ["beat", "beats", "record", "surge", "gain", "upgrade", "profit", "bullish", "growth"];
  const neg = ["miss", "misses", "loss", "drop", "cut", "downgrade", "lawsuit", "bearish", "warning"];
  const t = (text || "").toLowerCase();
  let s = 0;
  pos.forEach(w => { if (t.includes(w)) s += 1; });
  neg.forEach(w => { if (t.includes(w)) s -= 1; });
  if (s > 0) return "positive";
  if (s < 0) return "negative";
  return "neutral";
}

// Quote endpoint
app.get("/api/quote", async (req, res) => {
  try {
    const { symbol = "AAPL" } = req.query;
    const API_KEY = process.env.FMP_KEY;

    const url = `https://financialmodelingprep.com/api/v3/quote/${symbol}?apikey=${API_KEY}`;
    const { data } = await axios.get(url, { timeout: 8000 });

    if (!data ||!data[0]) return res.status(404).json({ error: "No data" });

    const q = data[0];
    res.json({
      symbol: q.symbol,
      price: q.price,
      change: q.change,
      changePercent: q.changesPercentage,
      volume: q.volume
    });
  } catch (e) {
    res.status(500).json({ error: "Quote fetch failed" });
  }
});

// News endpoint - FIXED LINE HERE
app.get("/api/news", async (req, res) => {
  try {
    const { symbol = "AAPL" } = req.query;
    const API_KEY = process.env.FMP_KEY;

    const url = `https://financialmodelingprep.com/api/v3/stock_news?tickers=${symbol}&limit=5&apikey=${API_KEY}`;
    const { data } = await axios.get(url, { timeout: 8000 });

    const news = data.map(a => ({
      title: a.title,
      url: a.url,
      source: a.site,
      time: a.publishedDate,
      sentiment: scoreSentiment(a.title + " + (a.description || ""))
    }));

    res.json(news);
  } catch (e) {
    res.json([]);
  }
});

// Catch-all for React Router
if (process.env.NODE_ENV === "production") {
  app.get("*", (req, res) => {
    res.sendFile(path.join(__dirname, "../build/index.html"));
  });
}

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});