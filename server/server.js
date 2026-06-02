// ============================================================
// GOLD SIGNAL - Backend Server v3 - Render Ready
// Includes: Price, News, Quote, DXY, Economic Calendar, COT, FRED Real Yields
// Run: node server.js
// ============================================================

const express = require("express");
const cors = require("cors");
const axios = require("axios");
const path = require("path");

const app = express();
app.use(cors());
app.use(express.json());

const TWELVEDATA_KEY = "96a30961b3f54ea993d9a96a70084a55";
const NEWSAPI_KEY = "b0bde58ef2d5407f906abafb754f44fb";
const FINNHUB_KEY = "d0eqt0pr01qhup7nkabgd0eqt0pr01qhup7nkac0";
const FRED_KEY = "a9f0a2b3c4d5e6f7a8b9c0d1e2f3a4b5";

// BASE URL for backend calling itself - works local + Render
const PORT = process.env.PORT || 5000;
const BASE_URL = process.env.RENDER_EXTERNAL_URL || `http://localhost:${PORT}`;

const INTERVAL_MAP = {
  "1m": { interval:"1min", outputsize:200 },
  "5m": { interval:"5min", outputsize:200 },
  "15m": { interval:"15min", outputsize:200 },
  "30m": { interval:"30min", outputsize:200 },
  "1H": { interval:"1h", outputsize:200 },
  "4H": { interval:"4h", outputsize:200 },
  "1D": { interval:"1day", outputsize:200 },
  "1W": { interval:"1week", outputsize:100 },
  "1M": { interval:"1month", outputsize:48 },
};

// ── GET /api/price?interval=4H ───────────────────────────────
app.get("/api/price", async (req, res) => {
  const tf = req.query.interval || "4H";
  const config = INTERVAL_MAP[tf] || INTERVAL_MAP["4H"];
  try {
    const url = `https://api.twelvedata.com/time_series?symbol=XAU/USD&interval=${config.interval}&outputsize=${config.outputsize}&apikey=${TWELVEDATA_KEY}`;
    const { data } = await axios.get(url);
    if (data.status === "error") return res.status(400).json({ error: data.message });
    const candles = (data.values || []).reverse().map(d => ({
      time: new Date(d.datetime).getTime(),
      open: parseFloat(d.open),
      high: parseFloat(d.high),
      low: parseFloat(d.low),
      close: parseFloat(d.close),
      volume: parseFloat(d.volume || 0),
    }));
    res.json({ candles, interval: tf });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// ── GET /api/quote ── live price + DXY ──────────────────────
app.get("/api/quote", async (req, res) => {
  try {
    const [goldRes, dxyRes] = await Promise.allSettled([
      axios.get(`https://api.twelvedata.com/quote?symbol=XAU/USD&apikey=${TWELVEDATA_KEY}`),
      axios.get(`https://api.twelvedata.com/quote?symbol=DXY&apikey=${TWELVEDATA_KEY}`),
    ]);
    const gold = goldRes.status === "fulfilled"? goldRes.value.data : {};
    const dxy = dxyRes.status === "fulfilled"? dxyRes.value.data : {};
    res.json({
      price: parseFloat(gold.close || 0),
      open: parseFloat(gold.open || 0),
      high: parseFloat(gold.high || 0),
      low: parseFloat(gold.low || 0),
      change: parseFloat(gold.change || 0),
      pct: parseFloat(gold.percent_change || 0),
      dxy: parseFloat(dxy.close || 103.5),
      dxyChange:parseFloat(dxy.change || 0),
      dxyPct: parseFloat(dxy.percent_change || 0),
    });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// ── GET /api/dxy-candles ── DXY chart data ───────────────────
app.get("/api/dxy-candles", async (req, res) => {
  const tf = req.query.interval || "4H";
  const config = INTERVAL_MAP[tf] || INTERVAL_MAP["4H"];
  try {
    const url = `https://api.twelvedata.com/time_series?symbol=DXY&interval=${config.interval}&outputsize=100&apikey=${TWELVEDATA_KEY}`;
    const { data } = await axios.get(url);
    const candles = (data.values || []).reverse().map(d => ({
      time: new Date(d.datetime).getTime(),
      close: parseFloat(d.close),
    }));
    res.json({ candles });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// ── GET /api/news ────────────────────────────────────────────
app.get("/api/news", async (req, res) => {
  try {
    const url = `https://newsapi.org/v2/everything?q=gold+XAU+inflation+fed+rate+geopolitical+dollar+treasury&language=en&sortBy=publishedAt&pageSize=30&apiKey=${NEWSAPI_KEY}`;
    const { data } = await axios.get(url);
    const articles = (data.articles || []).map(a => ({
      source: a.source?.name || "NEWS",
      title: a.title,
      url: a.url,
      published: a.publishedAt,
      sentiment: scoreSentiment(a.title + " + (a.description || "")),
      impact: scoreImpact(a.title),
    }));
    res.json({ articles });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// ── GET /api/calendar ── economic events ────────────────────
app.get("/api/calendar", async (req, res) => {
  try {
    const now = new Date();
    const from = now.toISOString().split("T")[0];
    const to = new Date(now.getTime() + 7*24*60*60*1000).toISOString().split("T")[0];
    const url = `https://finnhub.io/api/v1/calendar/economic?from=${from}&to=${to}&token=${FINNHUB_KEY}`;
    const { data } = await axios.get(url);
    const events = (data.economicCalendar || [])
     .filter(e => ["CPI","NFP","FOMC","GDP","PCE","PPI","Fed","Interest Rate","Nonfarm","Unemployment","Retail Sales","ISM"].some(k => (e.event||"").includes(k)))
     .map(e => ({
        event: e.event,
        date: e.time,
        country: e.country,
        impact: e.impact || "medium",
        actual: e.actual,
        forecast: e.estimate,
        previous: e.prev,
      }))
     .slice(0, 10);
    res.json({ events });
  } catch (err) {
    res.json({ events: [
      { event:"Fed Meeting Minutes", date: new Date(Date.now()+2*24*60*60*1000).toISOString(), country:"US", impact:"high" },
      { event:"US CPI (MoM)", date: new Date(Date.now()+4*24*60*60*1000).toISOString(), country:"US", impact:"high" },
      { event:"Nonfarm Payrolls", date: new Date(Date.now()+6*24*60*60*1000).toISOString(), country:"US", impact:"high" },
    ]});
  }
});

// ── GET /api/realyields ── FRED 10Y real yield ───────────────
app.get("/api/realyields", async (req, res) => {
  try {
    const url = `https://fred.stlouisfed.org/graph/fredgraph.csv?id=DFII10`;
    const { data } = await axios.get(url, { responseType:"text" });
    const lines = data.trim().split("\n").filter(l =>!l.startsWith("DATE"));
    const recent = lines.slice(-10).map(l => {
      const [date, val] = l.split(",");
      return { date, value: parseFloat(val) };
    }).filter(d =>!isNaN(d.value));
    const latest = recent[recent.length - 1];
    const previous = recent[recent.length - 2];
    const trend = latest && previous? (latest.value < previous.value? "FALLING" : "RISING") : "UNKNOWN";
    res.json({ realYield: latest?.value || 2.1, trend, history: recent });
  } catch (err) {
    res.json({ realYield: 2.1, trend: "UNKNOWN", history: [] });
  }
});

// ── GET /api/cot ── Commitment of Traders ────────────────────
app.get("/api/cot", async (req, res) => {
  try {
    const url = "https://www.cftc.gov/dea/newcot/deafut.txt";
    const { data } = await axios.get(url, { responseType:"text", timeout:8000 });
    const lines = data.split("\n");
    const goldLine = lines.find(l => l.includes("GOLD") || l.includes("088691"));
    if (!goldLine) throw new Error("Gold not found in COT");
    const parts = goldLine.split(",");
    const commercialLong = parseInt(parts[8] || 0);
    const commercialShort = parseInt(parts[9] || 0);
    const nonCommLong = parseInt(parts[10] || 0);
    const nonCommShort = parseInt(parts[11] || 0);
    const netCommercial = commercialLong - commercialShort;
    const netSpeculative = nonCommLong - nonCommShort;
    const bias = netSpeculative > 0? "BULLISH" : "BEARISH";
    res.json({ commercialLong, commercialShort, nonCommLong, nonCommShort, netCommercial, netSpeculative, bias });
  } catch (err) {
    res.json({ commercialLong:180000, commercialShort:210000, nonCommLong:280000, nonCommShort:85000, netCommercial:-30000, netSpeculative:195000, bias:"BULLISH", fallback:true });
  }
});

// ── GET /api/all?interval=4H ── everything in one call ───────
app.get("/api/all", async (req, res) => {
  const tf = req.query.interval || "4H";
  try {
    const [priceR,newsR,quoteR,calR,yieldsR,cotR,dxyR] = await Promise.allSettled([
      axios.get(`${BASE_URL}/api/price?interval=${tf}`),
      axios.get(`${BASE_URL}/api/news`),
      axios.get(`${BASE_URL}/api/quote`),
      axios.get(`${BASE_URL}/api/calendar`),
      axios.get(`${BASE_URL}/api/realyields`),
      axios.get(`${BASE_URL}/api/cot`),
      axios.get(`${BASE_URL}/api/dxy-candles?interval=${tf}`),
    ]);
    res.json({
      candles: priceR.status === "fulfilled"? priceR.value.data.candles : [],
      articles: newsR.status === "fulfilled"? newsR.value.data.articles : [],
      quote: quoteR.status === "fulfilled"? quoteR.value.data : null,
      calendar: calR.status === "fulfilled"? calR.value.data.events : [],
      realYields: yieldsR.status === "fulfilled"? yieldsR.value.data : null,
      cot: cotR.status === "fulfilled"? cotR.value.data : null,
      dxyCandles: dxyR.status === "fulfilled"? dxyR.value.data.candles : [],
    });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// ── Serve React build if it exists ───────────────────────────
app.use(express.static(path.join(__dirname, '../build')));
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../build', 'index.html'));
});

// ── Sentiment scoring ────────────────────────────────────────
function scoreSentiment(text) {
  if (!text) return "neutral";
  const t = text.toLowerCase();
  const bull = ["rate cut","dovish","gold rises","gold climbs","gold surges","safe haven","inflation","geopolitical","conflict","tension","weak dollar","dxy falls","central bank buy","buying gold","bullish","rally","breakout","record high","fed pauses","war","crisis","uncertainty","rate pause"];
  const bear = ["rate hike","hawkish","gold falls","gold drops","gold slides","strong dollar","dxy rises","risk on","selloff","bearish","gold tumbles","gold retreats","outflows","etf sell","recession","economic growth","dollar strengthens"];
  let b=0,r=0;
  bull.forEach(k=>{ if(t.includes(k)) b++; });
  bear.forEach(k=>{ if(t.includes(k)) r++; });
  if (b>r) return "bullish";
  if (r>b) return "bearish";
  return "neutral";
}

function scoreImpact(title) {
  const t = (title||"").toLowerCase();
  if (["fomc","fed","cpi","nfp","nonfarm","gdp","interest rate"].some(k=>t.includes(k))) return "HIGH";
  if (["pce","ppi","retail","unemployment","ism"].some(k=>t.includes(k))) return "MEDIUM";
  return "LOW";
}

app.listen(PORT, () => {
  console.log(`✅ Gold Signal server v3 running on ${BASE_URL}`);
  console.log(` Endpoints: /api/price /api/quote /api/news /api/calendar /api/realyields /api/cot /api/all`);
});