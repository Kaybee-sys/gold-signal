import { useState, useEffect, useCallback, useRef } from "react";

const STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=Rajdhani:wght@400;600;700&family=Orbitron:wght@400;700;900&family=Inter:wght@300;400;500&display=swap');
  *, *::before, *::after { box-sizing:border-box; margin:0; padding:0; }
  :root {
    --bg:#04060A; --surface:#080C12; --card:#0C1018; --border:#151C28; --border2:#1E2A3A;
    --gold:#F0B429; --text:#DCE8F0; --muted:#445566;
    --s-buy:#00FF9C; --m-buy:#00D97E; --w-buy:#00CC77;
    --neutral:#8899AA; --w-sell:#FF6B35; --m-sell:#FF3D5A; --s-sell:#FF0040;
  }
  body { background:var(--bg); color:var(--text); font-family:'Inter',sans-serif; -webkit-font-smoothing:antialiased; }
  .app { min-height:100vh; background:var(--bg);
    background-image:
      radial-gradient(ellipse 60% 40% at 50% 0%,rgba(240,180,41,0.06) 0%,transparent 70%),
      radial-gradient(ellipse 30% 50% at 100% 50%,rgba(0,255,156,0.03) 0%,transparent 60%),
      radial-gradient(ellipse 30% 50% at 0% 50%,rgba(255,0,64,0.03) 0%,transparent 60%);
  }
  .header { display:flex; align-items:center; justify-content:space-between; padding:12px 20px; border-bottom:1px solid var(--border); background:rgba(4,6,10,0.97); backdrop-filter:blur(20px); position:sticky; top:0; z-index:100; gap:10px; }
  .brand { font-family:'Orbitron',monospace; font-size:15px; font-weight:900; letter-spacing:3px; color:var(--gold); text-shadow:0 0 20px rgba(240,180,41,0.4); white-space:nowrap; }
  .brand span { color:var(--text); opacity:0.4; }
  .price-display { text-align:center; }
  .price-num { font-family:'Orbitron',monospace; font-size:18px; font-weight:700; color:var(--gold); letter-spacing:2px; }
  .price-chg { font-size:10px; margin-top:2px; font-family:'Rajdhani',sans-serif; font-weight:600; letter-spacing:1px; }
  .header-right { display:flex; align-items:center; gap:7px; flex-shrink:0; }
  .live-pill { display:flex; align-items:center; gap:5px; padding:5px 10px; border-radius:20px; border:1px solid var(--border2); font-size:9px; letter-spacing:2px; color:var(--s-buy); font-family:'Rajdhani',sans-serif; font-weight:600; }
  .live-dot { width:5px; height:5px; background:var(--s-buy); border-radius:50%; box-shadow:0 0 6px var(--s-buy); animation:blink 1.4s infinite; }
  .auto-badge { display:flex; align-items:center; gap:5px; padding:5px 10px; border-radius:20px; font-size:9px; letter-spacing:1px; font-family:'Rajdhani',sans-serif; font-weight:600; cursor:pointer; border:1px solid; transition:all 0.2s; }
  .auto-badge.on  { border-color:var(--gold); color:var(--gold); background:rgba(240,180,41,0.08); }
  .auto-badge.off { border-color:var(--border2); color:var(--muted); }
  .countdown { font-family:'Orbitron',monospace; font-size:10px; color:var(--muted); min-width:24px; text-align:center; }
  @keyframes blink  { 0%,100%{opacity:1} 50%{opacity:0.2} }
  @keyframes spin   { to{transform:rotate(360deg)} }
  @keyframes fadeIn { from{opacity:0;transform:translateY(8px)} to{opacity:1;transform:translateY(0)} }
  .progress-bar { height:2px; background:var(--border2); overflow:hidden; }
  .progress-fill { height:100%; background:linear-gradient(90deg,var(--gold),var(--s-buy)); transition:width 1s linear; }
  .main { padding:16px 20px; max-width:980px; margin:0 auto; }
  .tf-row { display:flex; gap:4px; margin-bottom:14px; justify-content:center; flex-wrap:wrap; }
  .tf-btn { padding:5px 11px; border-radius:5px; background:transparent; border:1px solid var(--border2); color:var(--muted); font-family:'Rajdhani',sans-serif; font-size:11px; font-weight:600; letter-spacing:2px; cursor:pointer; transition:all 0.2s; }
  .tf-btn.active { background:var(--gold); color:var(--bg); border-color:var(--gold); }
  .tf-btn:hover:not(.active) { border-color:var(--gold); color:var(--gold); }
  .signal-strip { display:flex; gap:4px; margin-bottom:12px; }
  .strip-item { flex:1; padding:7px 3px; border-radius:7px; border:1px solid var(--border); text-align:center; transition:all 0.3s; }
  .strip-dot  { width:6px; height:6px; border-radius:50%; margin:0 auto 4px; transition:all 0.3s; }
  .strip-name { font-size:7px; letter-spacing:0.5px; font-family:'Rajdhani',sans-serif; font-weight:600; line-height:1.3; }
  .signal-hero { border-radius:12px; border:1px solid var(--border2); padding:20px 18px; margin-bottom:12px; position:relative; overflow:hidden; animation:fadeIn 0.4s ease; }
  .signal-hero::before { content:''; position:absolute; inset:0; background:var(--sd); pointer-events:none; }
  .signal-hero::after  { content:''; position:absolute; top:0; left:0; right:0; height:2px; background:linear-gradient(90deg,transparent,var(--sc),transparent); }
  .signal-top { display:flex; align-items:flex-start; justify-content:space-between; position:relative; z-index:1; margin-bottom:14px; }
  .signal-label { font-family:'Orbitron',monospace; font-size:36px; font-weight:900; letter-spacing:3px; color:var(--sc); text-shadow:0 0 40px var(--sg); line-height:1; }
  .signal-size { display:block; font-size:12px; letter-spacing:5px; opacity:0.7; margin-bottom:3px; }
  .score-arc { position:relative; width:68px; height:68px; }
  .score-arc svg { position:absolute; top:0;left:0; transform:rotate(-90deg); }
  .score-inner { position:absolute; inset:0; display:flex; flex-direction:column; align-items:center; justify-content:center; }
  .score-num { font-family:'Orbitron',monospace; font-size:17px; font-weight:700; }
  .score-sub { font-size:7px; color:var(--muted); letter-spacing:1px; }
  .bars-wrap { display:flex; gap:3px; align-items:flex-end; margin-top:6px; justify-content:center; }
  .sbar { width:8px; border-radius:2px; transition:all 0.5s; }
  .levels-hero { display:grid; grid-template-columns:1fr 1fr 1fr 1fr; gap:7px; margin-bottom:12px; position:relative; z-index:1; }
  .lh-card { background:rgba(0,0,0,0.4); border-radius:8px; padding:9px 10px; border:1px solid var(--border); text-align:center; }
  .lh-label { font-size:8px; letter-spacing:2px; font-family:'Rajdhani',sans-serif; font-weight:700; margin-bottom:3px; }
  .lh-price { font-family:'Orbitron',monospace; font-size:12px; font-weight:700; }
  .lh-note  { font-size:7px; color:var(--muted); margin-top:2px; font-family:'Rajdhani',sans-serif; }
  .reasons-grid { display:grid; grid-template-columns:1fr 1fr; gap:7px; position:relative; z-index:1; }
  .reason-item { display:flex; align-items:flex-start; gap:7px; background:rgba(0,0,0,0.38); border-radius:7px; padding:9px 10px; border:1px solid var(--border); }
  .reason-icon { font-size:13px; flex-shrink:0; margin-top:1px; }
  .reason-text { font-size:10px; line-height:1.5; color:#7A9AAB; }
  .reason-text strong { color:var(--text); font-weight:600; display:block; margin-bottom:2px; font-size:9px; letter-spacing:1px; font-family:'Rajdhani',sans-serif; }

  /* ── ACCURACY PANEL ── */
  .acc-panel { border-radius:12px; border:1px solid var(--border2); padding:18px; margin-bottom:12px; position:relative; overflow:hidden; background:var(--card); }
  .acc-panel::after { content:''; position:absolute; top:0; left:0; right:0; height:2px; background:linear-gradient(90deg,transparent,var(--gold),transparent); }
  .acc-title { font-family:'Orbitron',monospace; font-size:11px; font-weight:700; letter-spacing:3px; color:var(--gold); margin-bottom:14px; }
  .acc-big { display:flex; align-items:center; justify-content:space-between; margin-bottom:16px; }
  .acc-pct { font-family:'Orbitron',monospace; font-size:52px; font-weight:900; line-height:1; }
  .acc-grade { width:60px; height:60px; border-radius:50%; display:flex; align-items:center; justify-content:center; font-family:'Orbitron',monospace; font-size:22px; font-weight:900; border:3px solid; }
  .acc-stats { display:grid; grid-template-columns:repeat(3,1fr); gap:8px; margin-bottom:14px; }
  .acc-stat { background:var(--surface); border:1px solid var(--border); border-radius:8px; padding:10px 12px; text-align:center; }
  .acc-stat-val { font-family:'Orbitron',monospace; font-size:16px; font-weight:700; }
  .acc-stat-label { font-size:8px; color:var(--muted); letter-spacing:2px; font-family:'Rajdhani',sans-serif; margin-top:3px; }
  .acc-bars { margin-bottom:14px; }
  .acc-bar-row { display:flex; align-items:center; gap:10px; margin-bottom:8px; }
  .acc-bar-label { font-size:10px; color:var(--muted); font-family:'Rajdhani',sans-serif; letter-spacing:1px; width:80px; flex-shrink:0; }
  .acc-bar-wrap { flex:1; height:8px; background:var(--border2); border-radius:4px; overflow:hidden; }
  .acc-bar-fill { height:100%; border-radius:4px; transition:width 1.2s ease; }
  .acc-bar-pct { font-size:10px; font-family:'Orbitron',monospace; font-weight:700; width:36px; text-align:right; flex-shrink:0; }
  /* Similar setups */
  .setup-list { display:flex; flex-direction:column; gap:7px; }
  .setup-item { background:var(--surface); border:1px solid var(--border); border-radius:8px; padding:10px 12px; display:flex; align-items:center; gap:10px; }
  .setup-outcome { width:8px; height:8px; border-radius:50%; flex-shrink:0; }
  .setup-body { flex:1; }
  .setup-date { font-size:9px; color:var(--muted); font-family:'Rajdhani',sans-serif; letter-spacing:1px; }
  .setup-detail { font-size:11px; color:var(--text); margin-top:2px; }
  .setup-result { text-align:right; font-family:'Rajdhani',sans-serif; font-size:10px; font-weight:700; letter-spacing:1px; }

  .panel { background:var(--card); border:1px solid var(--border); border-radius:10px; padding:14px 16px; margin-bottom:12px; }
  .panel.gold-left { border-left:3px solid var(--gold); }
  .panel.sig-left  { border-left:3px solid var(--sc,var(--gold)); }
  .panel-title { font-size:9px; color:var(--muted); letter-spacing:3px; font-family:'Rajdhani',sans-serif; font-weight:700; margin-bottom:12px; }
  .panel-title.gold { color:var(--gold); }
  .macro-grid { display:grid; grid-template-columns:repeat(4,1fr); gap:7px; margin-bottom:10px; }
  .macro-card { background:var(--surface); border:1px solid var(--border); border-radius:7px; padding:9px 10px; }
  .macro-name { font-size:8px; color:var(--muted); letter-spacing:1.5px; font-family:'Rajdhani',sans-serif; margin-bottom:3px; }
  .macro-val  { font-size:12px; font-weight:700; font-family:'Orbitron',monospace; }
  .macro-sub  { font-size:8px; margin-top:2px; font-family:'Rajdhani',sans-serif; letter-spacing:1px; }
  .corr-bar-wrap { height:6px; background:var(--border2); border-radius:3px; overflow:hidden; margin:6px 0; }
  .corr-bar-fill { height:100%; border-radius:3px; transition:width 1s ease; }
  .corr-label { display:flex; justify-content:space-between; font-size:9px; color:var(--muted); font-family:'Rajdhani',sans-serif; }
  .cal-item { padding:9px 0; border-bottom:1px solid var(--border); display:flex; align-items:center; gap:10px; }
  .cal-item:last-child { border-bottom:none; }
  .cal-impact { width:6px; height:28px; border-radius:3px; flex-shrink:0; }
  .cal-body { flex:1; }
  .cal-event { font-size:11px; color:var(--text); font-weight:500; }
  .cal-meta  { font-size:9px; color:var(--muted); margin-top:2px; font-family:'Rajdhani',sans-serif; letter-spacing:1px; }
  .cal-vals  { text-align:right; font-size:9px; font-family:'Rajdhani',sans-serif; }
  .cot-grid { display:grid; grid-template-columns:1fr 1fr; gap:8px; }
  .cot-card { background:var(--surface); border:1px solid var(--border); border-radius:7px; padding:9px 11px; }
  .cot-name { font-size:8px; color:var(--muted); letter-spacing:1.5px; font-family:'Rajdhani',sans-serif; margin-bottom:4px; }
  .cot-val  { font-size:13px; font-weight:700; font-family:'Orbitron',monospace; }
  .div-badge { display:inline-flex; align-items:center; gap:5px; padding:4px 10px; border-radius:6px; font-size:10px; font-weight:700; font-family:'Rajdhani',sans-serif; letter-spacing:1px; margin-top:8px; }
  .smc-grid { display:grid; grid-template-columns:repeat(3,1fr); gap:6px; margin-bottom:9px; }
  .smc-item { background:var(--surface); border:1px solid var(--border); border-radius:7px; padding:8px 9px; }
  .smc-name { font-size:8px; color:var(--muted); letter-spacing:1.5px; font-family:'Rajdhani',sans-serif; margin-bottom:3px; }
  .smc-val  { font-size:10px; font-weight:700; font-family:'Rajdhani',sans-serif; letter-spacing:1px; }
  .strats-wrap { display:flex; flex-wrap:wrap; gap:5px; }
  .strat-pill { padding:3px 9px; border-radius:11px; font-size:9px; font-weight:700; font-family:'Rajdhani',sans-serif; letter-spacing:1px; border:1px solid; }
  .sp-bull { background:rgba(0,255,156,0.08); color:var(--s-buy); border-color:rgba(0,255,156,0.2); }
  .sp-bear { background:rgba(255,0,64,0.08);  color:var(--s-sell); border-color:rgba(255,0,64,0.2); }
  .sp-neutral { background:rgba(136,153,170,0.08); color:var(--neutral); border-color:rgba(136,153,170,0.2); }
  .mtf-grid { display:grid; grid-template-columns:repeat(3,1fr); gap:6px; }
  .mtf-card { background:var(--surface); border:1px solid var(--border); border-radius:7px; padding:8px 9px; text-align:center; transition:all 0.3s; }
  .mtf-card.hl { border-color:var(--gold); box-shadow:0 0 8px rgba(240,180,41,0.15); }
  .mtf-tf  { font-size:8px; color:var(--muted); letter-spacing:2px; font-family:'Rajdhani',sans-serif; margin-bottom:3px; }
  .mtf-sig { font-family:'Rajdhani',sans-serif; font-size:10px; font-weight:700; letter-spacing:1px; }
  .mtf-bar-wrap { height:2px; background:var(--border2); border-radius:2px; margin-top:4px; overflow:hidden; }
  .mtf-bar-fill { height:100%; border-radius:2px; transition:width 1s ease; }
  .ind-row { display:grid; grid-template-columns:repeat(3,1fr); gap:7px; margin-bottom:12px; }
  .ind-card { background:var(--card); border:1px solid var(--border); border-radius:7px; padding:10px 11px; }
  .ind-name { font-size:8px; color:var(--muted); letter-spacing:2px; font-family:'Rajdhani',sans-serif; margin-bottom:3px; }
  .ind-val  { font-family:'Orbitron',monospace; font-size:12px; font-weight:700; }
  .ind-sig  { font-size:8px; letter-spacing:1px; margin-top:2px; font-family:'Rajdhani',sans-serif; font-weight:600; }
  .klev-row { display:grid; grid-template-columns:1fr 1fr 1fr; gap:7px; margin-bottom:12px; }
  .klev-card { background:var(--card); border:1px solid var(--border); border-radius:7px; padding:10px 11px; text-align:center; }
  .klev-type  { font-size:8px; color:var(--muted); letter-spacing:2px; font-family:'Rajdhani',sans-serif; margin-bottom:4px; }
  .klev-price { font-family:'Orbitron',monospace; font-size:13px; font-weight:700; }
  .news-item { padding:8px 0; border-bottom:1px solid var(--border); }
  .news-item:last-child { border-bottom:none; }
  .news-meta  { display:flex; align-items:center; gap:6px; margin-bottom:3px; }
  .news-src   { font-size:8px; color:var(--muted); letter-spacing:1px; font-family:'Rajdhani',sans-serif; font-weight:600; }
  .news-badge { padding:1px 6px; border-radius:7px; font-size:8px; font-weight:700; font-family:'Rajdhani',sans-serif; letter-spacing:1px; }
  .nb-bull { background:rgba(0,255,156,0.1); color:var(--s-buy); }
  .nb-bear { background:rgba(255,0,64,0.1);  color:var(--s-sell); }
  .nb-neutral { background:rgba(136,153,170,0.1); color:var(--neutral); }
  .nb-high { background:rgba(240,180,41,0.15); color:var(--gold); margin-left:auto; }
  .news-title { font-size:10px; line-height:1.5; color:var(--text); }
  .news-time  { font-size:8px; color:var(--muted); margin-top:2px; }
  .bottom-bar { display:flex; align-items:center; justify-content:space-between; margin-bottom:12px; }
  .last-upd { font-size:9px; color:var(--muted); letter-spacing:1px; font-family:'Rajdhani',sans-serif; }
  .refresh-btn { padding:7px 16px; border-radius:6px; background:transparent; border:1px solid var(--gold); color:var(--gold); font-family:'Rajdhani',sans-serif; font-size:11px; letter-spacing:2px; font-weight:700; cursor:pointer; transition:all 0.2s; }
  .refresh-btn:hover { background:var(--gold); color:var(--bg); }
  .refresh-btn:disabled { opacity:0.3; cursor:not-allowed; }
  .err-box { background:rgba(255,0,64,0.08); border:1px solid rgba(255,0,64,0.25); border-radius:7px; padding:11px 13px; margin-bottom:12px; font-size:11px; color:#FF8888; font-family:'Rajdhani',sans-serif; letter-spacing:1px; }
  .warn-box { background:rgba(240,180,41,0.06); border:1px solid rgba(240,180,41,0.3); border-radius:7px; padding:11px 13px; margin-bottom:12px; font-size:11px; color:var(--gold); font-family:'Rajdhani',sans-serif; letter-spacing:1px; }
  .loading-state { text-align:center; padding:40px 20px; }
  .spinner { width:32px; height:32px; border:2px solid var(--border2); border-top-color:var(--gold); border-radius:50%; animation:spin 0.7s linear infinite; margin:0 auto 12px; }
  .loading-text { font-family:'Rajdhani',sans-serif; font-size:10px; letter-spacing:3px; color:var(--muted); }
  .c-buy{color:var(--s-buy)} .c-sell{color:var(--s-sell)} .c-neutral{color:var(--neutral)} .c-gold{color:var(--gold)}
  .disclaimer { text-align:center; font-size:9px; color:var(--muted); padding:14px; border-top:1px solid var(--border); letter-spacing:1px; font-family:'Rajdhani',sans-serif; }
  @media(max-width:600px){
    .main{padding:10px 12px} .header{padding:10px 12px} .brand{font-size:12px}
    .signal-label{font-size:26px} .reasons-grid{grid-template-columns:1fr}
    .ind-row{grid-template-columns:1fr 1fr} .klev-row{grid-template-columns:1fr}
    .signal-strip{flex-wrap:wrap} .strip-item{min-width:48px}
    .levels-hero{grid-template-columns:1fr 1fr} .smc-grid{grid-template-columns:1fr 1fr}
    .macro-grid{grid-template-columns:1fr 1fr} .cot-grid{grid-template-columns:1fr 1fr}
    .acc-stats{grid-template-columns:1fr 1fr 1fr} .acc-pct{font-size:38px}
  }
`;

const SIGNALS = [
  { id:"strong-sell", label:"STRONG", type:"SELL", color:"#FF0040", glow:"rgba(255,0,64,0.25)",  dim:"rgba(255,0,64,0.07)",   bars:3, min:0,  max:20  },
  { id:"medium-sell", label:"MEDIUM", type:"SELL", color:"#FF3D5A", glow:"rgba(255,61,90,0.2)",  dim:"rgba(255,61,90,0.07)",  bars:2, min:20, max:35  },
  { id:"weak-sell",   label:"WEAK",   type:"SELL", color:"#FF6B35", glow:"rgba(255,107,53,0.2)", dim:"rgba(255,107,53,0.07)", bars:1, min:35, max:46  },
  { id:"neutral",     label:"",       type:"NEUTRAL",color:"#8899AA",glow:"rgba(136,153,170,0.15)",dim:"rgba(136,153,170,0.06)",bars:0,min:46,max:54},
  { id:"weak-buy",    label:"WEAK",   type:"BUY",  color:"#00CC77", glow:"rgba(0,204,119,0.2)",  dim:"rgba(0,204,119,0.07)",  bars:1, min:54, max:65  },
  { id:"medium-buy",  label:"MEDIUM", type:"BUY",  color:"#00D97E", glow:"rgba(0,217,126,0.2)",  dim:"rgba(0,217,126,0.07)",  bars:2, min:65, max:78  },
  { id:"strong-buy",  label:"STRONG", type:"BUY",  color:"#00FF9C", glow:"rgba(0,255,156,0.25)", dim:"rgba(0,255,156,0.07)",  bars:3, min:78, max:100 },
];
const ALL_TF = ["1m","5m","15m","30m","1H","4H","1D","1W","1M"];
const SERVER  = "http://localhost:5000";
const AUTO_INTERVAL = 15;

function scoreToSignal(s){ return SIGNALS.find(x=>s>=x.min&&s<x.max)||SIGNALS[3]; }

// ── Indicators ──────────────────────────────────────────────────────────────
function calcRSI(c,p=14){
  if(c.length<p+1)return 50;
  let ag=0,al=0;
  for(let i=1;i<=p;i++){const d=c[i]-c[i-1];d>0?ag+=d:al-=d;}
  ag/=p;al/=p;
  for(let i=p+1;i<c.length;i++){const d=c[i]-c[i-1];ag=(ag*(p-1)+Math.max(d,0))/p;al=(al*(p-1)+Math.max(-d,0))/p;}
  return al===0?100:100-100/(1+ag/al);
}
function calcEMA(prices,p){const k=2/(p+1);let e=prices[0];for(let i=1;i<prices.length;i++)e=prices[i]*k+e*(1-k);return e;}
function calcMACD(c){return c.length<26?0:calcEMA(c,12)-calcEMA(c,26);}
function calcSMA(c,p){if(c.length<p)return c[c.length-1];return c.slice(-p).reduce((a,b)=>a+b,0)/p;}
function calcBB(c,p=20){
  if(c.length<p)return{upper:0,middle:0,lower:0};
  const sl=c.slice(-p),sma=sl.reduce((a,b)=>a+b,0)/p;
  const std=Math.sqrt(sl.reduce((a,b)=>a+Math.pow(b-sma,2),0)/p);
  return{upper:sma+2*std,middle:sma,lower:sma-2*std};
}
function calcATR(candles,p=14){
  if(candles.length<2)return 10;
  const trs=candles.slice(1).map((d,i)=>Math.max(d.high-d.low,Math.abs(d.high-candles[i].close),Math.abs(d.low-candles[i].close)));
  return trs.slice(-p).reduce((a,b)=>a+b,0)/Math.min(p,trs.length);
}
function calcStoch(candles,p=14){
  if(candles.length<p)return 50;
  const sl=candles.slice(-p),hh=Math.max(...sl.map(c=>c.high)),ll=Math.min(...sl.map(c=>c.low)),cl=sl[sl.length-1].close;
  return hh===ll?50:((cl-ll)/(hh-ll))*100;
}
function calcWR(candles,p=14){
  if(candles.length<p)return -50;
  const sl=candles.slice(-p),hh=Math.max(...sl.map(c=>c.high)),ll=Math.min(...sl.map(c=>c.low)),cl=sl[sl.length-1].close;
  return hh===ll?-50:((hh-cl)/(hh-ll))*-100;
}
function calcCCI(candles,p=20){
  if(candles.length<p)return 0;
  const sl=candles.slice(-p),tp=sl.map(c=>(c.high+c.low+c.close)/3);
  const sma=tp.reduce((a,b)=>a+b,0)/p,md=tp.reduce((a,b)=>a+Math.abs(b-sma),0)/p;
  return md===0?0:(tp[tp.length-1]-sma)/(0.015*md);
}
function calcVolume(candles,p=20){
  const vols=candles.map(c=>c.volume).filter(v=>v>0);
  if(vols.length<2)return{avgVol:0,currentVol:0,surge:false};
  const avgVol=vols.slice(-p).reduce((a,b)=>a+b,0)/Math.min(p,vols.length);
  return{avgVol,currentVol:vols[vols.length-1],surge:vols[vols.length-1]>avgVol*1.5};
}
function detectDivergence(candles){
  if(candles.length<30)return{bull:false,bear:false,type:"NONE"};
  const closes=candles.map(c=>c.close);
  const rsiSeries=[];
  for(let i=14;i<closes.length;i++)rsiSeries.push(calcRSI(closes.slice(0,i+1)));
  const n=closes.length-1,lookback=15;
  let pLow=-1,pHigh=-1;
  for(let i=n-lookback;i<n-3;i++){
    if(closes[i]<closes[i-1]&&closes[i]<closes[i+1]&&pLow===-1)pLow=i;
    if(closes[i]>closes[i-1]&&closes[i]>closes[i+1]&&pHigh===-1)pHigh=i;
  }
  const rsiN=rsiSeries[rsiSeries.length-1]||50;
  let bull=false,bear=false;
  if(pLow>0){const rPL=rsiSeries[pLow-14]||50;if(closes[n]<closes[pLow]&&rsiN>rPL)bull=true;}
  if(pHigh>0){const rPH=rsiSeries[pHigh-14]||50;if(closes[n]>closes[pHigh]&&rsiN<rPH)bear=true;}
  return{bull,bear,type:bull?"BULLISH DIVERGENCE":bear?"BEARISH DIVERGENCE":"NONE"};
}
function calcSMC(candles){
  if(candles.length<20)return{orderBlock:"N/A",fvg:"N/A",bos:"NONE",choch:"NONE",liquidity:"BALANCED",premium:false,eq:"0"};
  const r=candles.slice(-30),closes=r.map(c=>c.close),highs=r.map(c=>c.high),lows=r.map(c=>c.low);
  const price=closes[closes.length-1];
  let obType="NEUTRAL";
  for(let i=r.length-3;i>2;i--){
    const c=r[i],isBull=c.close>c.open,nm=closes[i+2]-closes[i];
    if(!isBull&&nm>c.high*0.002){obType="BULL OB";break;}
    if(isBull&&nm<-c.high*0.002){obType="BEAR OB";break;}
  }
  let fvg="NONE";
  for(let i=r.length-4;i>1;i--){
    if(r[i+1].low-r[i-1].high>0.5){fvg="BULL FVG";break;}
    if(r[i-1].low-r[i+1].high>0.5){fvg="BEAR FVG";break;}
  }
  const p10h=highs.slice(-12,-2),p10l=lows.slice(-12,-2);
  const rh=Math.max(...highs.slice(-3)),rl=Math.min(...lows.slice(-3));
  let bos="NONE";
  if(rh>Math.max(...p10h))bos="BULL BOS";else if(rl<Math.min(...p10l))bos="BEAR BOS";
  let choch="NONE";
  const mid=Math.floor(r.length/2);
  const f1h=Math.max(...highs.slice(0,mid)),f1l=Math.min(...lows.slice(0,mid));
  const s2h=Math.max(...highs.slice(mid)),s2l=Math.min(...lows.slice(mid));
  if(s2h<f1h&&s2l<f1l)choch="BEARISH CHoCH";else if(s2h>f1h&&s2l>f1l)choch="BULLISH CHoCH";
  const atr=calcATR(candles);
  const eqH=highs.filter(h=>Math.abs(h-highs[highs.length-1])<0.5*atr).length>2;
  const eqL=lows.filter(l=>Math.abs(l-lows[lows.length-1])<0.5*atr).length>2;
  const liquidity=eqH?"SELL-SIDE ABOVE":eqL?"BUY-SIDE BELOW":"BALANCED";
  const rHigh=Math.max(...highs),rLow=Math.min(...lows),eq=(rHigh+rLow)/2;
  return{orderBlock:obType,fvg,bos,choch,liquidity,premium:price>eq,eq:eq.toFixed(2)};
}

// ── BACKTESTING ENGINE ──────────────────────────────────────────────────────
function runBacktest(candles, currentScore, isBull) {
  if (!candles || candles.length < 60) {
    return { found: 0, wins: 0, losses: 0, winRate: 0, tp1Rate: 0, tp2Rate: 0, slRate: 0, similarSetups: [], grade: "N/A", confidence: 0 };
  }

  const lookForward = Math.min(20, Math.floor(candles.length * 0.1));
  const similarSetups = [];
  let wins = 0, losses = 0, tp1Hits = 0, tp2Hits = 0, slHits = 0;

  // Score tolerance — find candles where conditions were similar
  const scoreTolerance = 12;

  for (let i = 30; i < candles.length - lookForward; i++) {
    const slice = candles.slice(0, i + 1);
    const sliceCloses = slice.map(c => c.close);

    // Quick indicator snapshot at this point
    const rsi    = calcRSI(sliceCloses);
    const macd   = calcMACD(sliceCloses);
    const sma20  = calcSMA(sliceCloses, 20);
    const sma50  = calcSMA(sliceCloses, 50);
    const price  = sliceCloses[sliceCloses.length - 1];
    const stoch  = calcStoch(slice);

    // Compute a simplified score at this historical point
    let hScore = 50;
    if (rsi < 30) hScore += 18; else if (rsi < 40) hScore += 10;
    else if (rsi > 70) hScore -= 18; else if (rsi > 60) hScore -= 8;
    hScore += macd > 0 ? 10 : -10;
    hScore += price > sma20 ? 7 : -7;
    hScore += price > sma50 ? 7 : -7;
    if (stoch < 20) hScore += 7; else if (stoch > 80) hScore -= 7;
    hScore = Math.min(99, Math.max(1, hScore));

    // Check if this historical score is similar to current
    const isMatchingDirection = isBull ? hScore >= 54 : hScore < 46;
    const scoreMatch = Math.abs(hScore - currentScore) <= scoreTolerance;

    if (!isMatchingDirection || !scoreMatch) continue;

    // Look forward to see what happened
    const entryPrice  = price;
    const atr         = calcATR(slice);
    const tp1Target   = isBull ? entryPrice + atr * 1.5 : entryPrice - atr * 1.5;
    const tp2Target   = isBull ? entryPrice + atr * 3.0 : entryPrice - atr * 3.0;
    const slTarget    = isBull ? entryPrice - atr * 1.3 : entryPrice + atr * 1.3;

    let hitTP1 = false, hitTP2 = false, hitSL = false, outcome = "neutral";
    for (let j = i + 1; j <= i + lookForward && j < candles.length; j++) {
      const fHigh = candles[j].high;
      const fLow  = candles[j].low;
      if (isBull) {
        if (!hitSL && fLow  <= slTarget) { hitSL  = true; }
        if (!hitTP1 && fHigh >= tp1Target) { hitTP1 = true; tp1Hits++; }
        if (!hitTP2 && fHigh >= tp2Target) { hitTP2 = true; tp2Hits++; }
      } else {
        if (!hitSL && fHigh >= slTarget) { hitSL  = true; }
        if (!hitTP1 && fLow  <= tp1Target) { hitTP1 = true; tp1Hits++; }
        if (!hitTP2 && fLow  <= tp2Target) { hitTP2 = true; tp2Hits++; }
      }
    }

    // Determine final outcome: if TP1 hit before SL = win
    const finalClose = candles[Math.min(i + lookForward, candles.length - 1)].close;
    const moved      = isBull ? finalClose - entryPrice : entryPrice - finalClose;
    const win        = hitTP1 && !hitSL;
    if (win) { wins++; outcome = "win"; }
    else if (hitSL) { losses++; outcome = "loss"; }
    else if (moved > 0) { wins++; outcome = "win"; } // partial win
    else { losses++; outcome = "loss"; }

    // Store up to 5 most recent similar setups
    if (similarSetups.length < 5) {
      const date = new Date(candles[i].time);
      const pctMove = ((finalClose - entryPrice) / entryPrice * 100 * (isBull ? 1 : -1)).toFixed(2);
      similarSetups.push({
        date: date.toLocaleDateString(),
        entry: entryPrice.toFixed(2),
        outcome,
        tp1Hit: hitTP1,
        tp2Hit: hitTP2,
        slHit: hitSL,
        pctMove,
        rsi: rsi.toFixed(0),
      });
    }
  }

  const total   = wins + losses;
  const winRate = total > 0 ? Math.round((wins / total) * 100) : 0;
  const tp1Rate = total > 0 ? Math.round((tp1Hits / total) * 100) : 0;
  const tp2Rate = total > 0 ? Math.round((tp2Hits / total) * 100) : 0;
  const slRate  = total > 0 ? Math.round((slHits  / total) * 100) : 0;

  // Grade
  let grade = "F";
  if (winRate >= 75) grade = "A+";
  else if (winRate >= 68) grade = "A";
  else if (winRate >= 62) grade = "B+";
  else if (winRate >= 55) grade = "B";
  else if (winRate >= 48) grade = "C";
  else if (winRate >= 40) grade = "D";

  // Confidence: combine current score strength + historical win rate
  const scoreStrength = isBull ? (currentScore - 50) / 50 : (50 - currentScore) / 50;
  const confidence    = Math.round((winRate * 0.6 + scoreStrength * 100 * 0.4));

  return {
    found: total,
    wins,
    losses,
    winRate,
    tp1Rate,
    tp2Rate,
    slRate,
    similarSetups: similarSetups.reverse(),
    grade,
    confidence: Math.min(95, Math.max(5, confidence)),
  };
}

function gradeColor(grade) {
  if (grade.includes("A")) return "#00FF9C";
  if (grade.includes("B")) return "#F0B429";
  if (grade === "C") return "#FF6B35";
  return "#FF3D5A";
}

// ── Score engine ────────────────────────────────────────────────────────────
function computeScore(candles, extras={}) {
  if (!candles || candles.length < 10) return 50;
  const closes = candles.map(c => c.close);
  const price  = closes[closes.length - 1];
  const rsi    = calcRSI(closes);
  const macd   = calcMACD(closes);
  const sma20  = calcSMA(closes, 20);
  const sma50  = calcSMA(closes, 50);
  const sma200 = calcSMA(closes, 200);
  const bb     = calcBB(closes);
  const stoch  = calcStoch(candles);
  const wr     = calcWR(candles);
  const cci    = calcCCI(candles);
  const ema    = closes.length >= 21 ? calcEMA(closes, 8) - calcEMA(closes, 21) : 0;
  const smc    = calcSMC(candles);
  const vol    = calcVolume(candles);
  const div    = detectDivergence(candles);
  const { newsSentiment=0, dxyChange=0, realYield=null, realYieldTrend="UNKNOWN", cot=null } = extras;

  let score = 50;
  if (rsi < 25) score += 18; else if (rsi < 35) score += 11; else if (rsi < 45) score += 4;
  else if (rsi < 55) score -= 2; else if (rsi < 65) score -= 8; else if (rsi < 75) score -= 13; else score -= 18;
  score += macd > 0 ? 10 : -10;
  score += ema > 0 ? 7 : -7;
  score += price > sma20 ? 7 : -7;
  score += price > sma50 ? 7 : -7;
  score += price > sma200 ? 5 : -5;
  const bbRange = bb.upper - bb.lower, bbPos = bbRange > 0 ? (price - bb.lower) / bbRange : 0.5;
  if (bbPos < 0.15) score += 8; else if (bbPos < 0.35) score += 4;
  else if (bbPos > 0.85) score -= 8; else if (bbPos > 0.65) score -= 4;
  if (stoch < 15) score += 7; else if (stoch < 30) score += 4; else if (stoch > 85) score -= 7; else if (stoch > 70) score -= 4;
  if (wr < -80) score += 5; else if (wr > -20) score -= 5;
  if (cci < -100) score += 5; else if (cci > 100) score -= 5;
  if (smc.bos === "BULL BOS") score += 7; else if (smc.bos === "BEAR BOS") score -= 7;
  if (smc.choch === "BULLISH CHoCH") score += 4; else if (smc.choch === "BEARISH CHoCH") score -= 4;
  if (smc.orderBlock === "BULL OB") score += 4; else if (smc.orderBlock === "BEAR OB") score -= 4;
  if (smc.fvg === "BULL FVG") score += 3; else if (smc.fvg === "BEAR FVG") score -= 3;
  if (!smc.premium) score += 3; else score -= 3;
  if (div.bull) score += 9; if (div.bear) score -= 9;
  if (dxyChange < -0.3) score += 10; else if (dxyChange < -0.1) score += 5;
  else if (dxyChange > 0.3) score -= 10; else if (dxyChange > 0.1) score -= 5;
  if (realYield !== null) {
    if (realYieldTrend === "FALLING" && realYield < 1.5) score += 10;
    else if (realYieldTrend === "FALLING") score += 6;
    else if (realYieldTrend === "RISING" && realYield > 2.5) score -= 10;
    else if (realYieldTrend === "RISING") score -= 5;
  }
  if (cot) { if (cot.bias === "BULLISH" && cot.netSpeculative > 150000) score += 8; else if (cot.bias === "BULLISH") score += 4; else if (cot.bias === "BEARISH") score -= 6; }
  score += newsSentiment * 7;
  const isBull = score > 50;
  if (vol.surge) score += isBull ? 6 : -6;
  return Math.min(99, Math.max(1, score));
}

function getIndicators(candles) {
  if (!candles || candles.length < 10) return {};
  const closes = candles.map(c => c.close);
  return {
    price: closes[closes.length - 1],
    rsi: calcRSI(closes), macd: calcMACD(closes),
    sma20: calcSMA(closes, 20), sma50: calcSMA(closes, 50), sma200: calcSMA(closes, 200),
    bb: calcBB(closes), atr: calcATR(candles),
    stoch: calcStoch(candles), wr: calcWR(candles), cci: calcCCI(candles),
    vol: calcVolume(candles),
  };
}

function calcLevels(entry, atr, score, isBull, candles) {
  const highs = candles.map(c => c.high), lows = candles.map(c => c.low);
  const swingHigh = Math.max(...highs.slice(-20)), swingLow = Math.min(...lows.slice(-20));
  if (isBull) {
    const str = score > 78 ? 3.2 : score > 65 ? 2.1 : 1.4;
    return { tp1: entry + atr * 1.5, tp2: Math.min(swingHigh, entry + atr * str), sl: Math.max(swingLow, entry - atr * 1.3) };
  } else {
    const str = score < 22 ? 3.2 : score < 35 ? 2.1 : 1.4;
    return { tp1: entry - atr * 1.5, tp2: Math.max(swingLow, entry - atr * str), sl: Math.min(swingHigh, entry + atr * 1.3) };
  }
}

function inferMTF(base, baseTF, targetTF) {
  const bi = ALL_TF.indexOf(baseTF), ti = ALL_TF.indexOf(targetTF);
  if (bi === -1 || ti === -1) return base;
  const diff = ti - bi, dev = base - 50;
  if (diff < 0) return Math.min(98, Math.max(2, 50 + dev * (1 + Math.abs(diff) * 0.22)));
  return Math.min(95, Math.max(5, 50 + dev * (1 - diff * 0.08)));
}

function timeAgo(d) {
  const m = Math.floor((Date.now() - new Date(d)) / 60000);
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  return h < 24 ? `${h}h ago` : `${Math.floor(h / 24)}d ago`;
}
function timeTo(d) {
  const diff = new Date(d).getTime() - Date.now();
  if (diff < 0) return "Past";
  const h = Math.floor(diff / 3600000), m = Math.floor((diff % 3600000) / 60000);
  return h > 24 ? `${Math.floor(h / 24)}d` : `${h}h ${m}m`;
}

// ── UI Components ───────────────────────────────────────────────────────────
function ScoreArc({ score, color }) {
  const r = 28, circ = 2 * Math.PI * r;
  return (
    <div className="score-arc">
      <svg viewBox="0 0 72 72" width="72" height="72">
        <circle cx="36" cy="36" r={r} fill="none" stroke="#151C28" strokeWidth="5" />
        <circle cx="36" cy="36" r={r} fill="none" stroke={color} strokeWidth="5"
          strokeDasharray={`${(score / 100) * circ} ${circ}`} strokeLinecap="round"
          style={{ filter: `drop-shadow(0 0 5px ${color})`, transition: 'stroke-dasharray 0.8s ease' }} />
      </svg>
      <div className="score-inner">
        <div className="score-num" style={{ color }}>{Math.round(score)}</div>
        <div className="score-sub">SCORE</div>
      </div>
    </div>
  );
}

function StrengthBars({ count, color, type }) {
  const h = [14, 22, 30], heights = type === "SELL" ? [...h].reverse() : h;
  return (
    <div className="bars-wrap">
      {heights.map((ht, i) => (
        <div key={i} className="sbar" style={{ height: ht, background: i < count ? color : '#1E2A3A', boxShadow: i < count ? `0 0 6px ${color}` : 'none' }} />
      ))}
    </div>
  );
}

function AccuracyPanel({ backtest, sig }) {
  if (!backtest || backtest.found < 5) {
    return (
      <div className="acc-panel">
        <div className="acc-title">📈 HISTORICAL ACCURACY</div>
        <div style={{ fontSize: 11, color: 'var(--muted)', fontFamily: 'Rajdhani,sans-serif', letterSpacing: 1 }}>
          Not enough historical data for this timeframe. Switch to 4H or 1D for full backtest.
        </div>
      </div>
    );
  }
  const gc = gradeColor(backtest.grade);
  const winColor = backtest.winRate >= 60 ? 'var(--s-buy)' : backtest.winRate >= 45 ? 'var(--gold)' : 'var(--s-sell)';
  return (
    <div className="acc-panel">
      <div className="acc-title">📈 HISTORICAL ACCURACY — {backtest.found} SIMILAR SETUPS FOUND</div>
      <div className="acc-big">
        <div>
          <div className="acc-pct" style={{ color: winColor }}>{backtest.winRate}%</div>
          <div style={{ fontSize: 10, color: 'var(--muted)', fontFamily: 'Rajdhani,sans-serif', letterSpacing: 2, marginTop: 4 }}>WIN RATE</div>
          <div style={{ fontSize: 10, color: 'var(--muted)', fontFamily: 'Rajdhani,sans-serif', letterSpacing: 1, marginTop: 2 }}>
            {backtest.wins}W / {backtest.losses}L of {backtest.found} setups
          </div>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
          <div className="acc-grade" style={{ color: gc, borderColor: gc, boxShadow: `0 0 16px ${gc}40` }}>
            {backtest.grade}
          </div>
          <div style={{ fontSize: 9, color: 'var(--muted)', fontFamily: 'Rajdhani,sans-serif', letterSpacing: 2 }}>GRADE</div>
        </div>
      </div>

      {/* Stats */}
      <div className="acc-stats">
        <div className="acc-stat">
          <div className="acc-stat-val" style={{ color: 'var(--s-buy)' }}>{backtest.confidence}%</div>
          <div className="acc-stat-label">CONFIDENCE</div>
        </div>
        <div className="acc-stat">
          <div className="acc-stat-val" style={{ color: 'var(--gold)' }}>{backtest.tp1Rate}%</div>
          <div className="acc-stat-label">TP1 HIT RATE</div>
        </div>
        <div className="acc-stat">
          <div className="acc-stat-val" style={{ color: 'var(--s-buy)' }}>{backtest.tp2Rate}%</div>
          <div className="acc-stat-label">TP2 HIT RATE</div>
        </div>
      </div>

      {/* Bars */}
      <div className="acc-bars">
        {[
          { label: "WIN RATE", val: backtest.winRate, color: winColor },
          { label: "TP1 HIT", val: backtest.tp1Rate, color: 'var(--gold)' },
          { label: "TP2 HIT", val: backtest.tp2Rate, color: 'var(--s-buy)' },
          { label: "SL HIT",  val: backtest.slRate,  color: 'var(--s-sell)' },
        ].map((b, i) => (
          <div key={i} className="acc-bar-row">
            <div className="acc-bar-label">{b.label}</div>
            <div className="acc-bar-wrap">
              <div className="acc-bar-fill" style={{ width: `${b.val}%`, background: b.color }} />
            </div>
            <div className="acc-bar-pct" style={{ color: b.color }}>{b.val}%</div>
          </div>
        ))}
      </div>

      {/* Similar setups */}
      {backtest.similarSetups?.length > 0 && (
        <>
          <div style={{ fontSize: 9, color: 'var(--muted)', letterSpacing: 3, fontFamily: 'Rajdhani,sans-serif', fontWeight: 700, marginBottom: 8 }}>
            LAST {backtest.similarSetups.length} SIMILAR SETUPS
          </div>
          <div className="setup-list">
            {backtest.similarSetups.map((s, i) => (
              <div key={i} className="setup-item">
                <div className="setup-outcome" style={{ background: s.outcome === 'win' ? 'var(--s-buy)' : 'var(--s-sell)', boxShadow: `0 0 6px ${s.outcome === 'win' ? 'var(--s-buy)' : 'var(--s-sell)'}` }} />
                <div className="setup-body">
                  <div className="setup-date">{s.date} · RSI {s.rsi} · ENTRY ${s.entry}</div>
                  <div className="setup-detail">
                    {s.tp1Hit ? '✅ TP1' : '❌ TP1'} &nbsp;
                    {s.tp2Hit ? '✅ TP2' : '❌ TP2'} &nbsp;
                    {s.slHit  ? '🛑 SL'  : '✅ SL avoided'}
                  </div>
                </div>
                <div className="setup-result" style={{ color: parseFloat(s.pctMove) >= 0 ? 'var(--s-buy)' : 'var(--s-sell)' }}>
                  {parseFloat(s.pctMove) >= 0 ? '+' : ''}{s.pctMove}%
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

// ── Main App ─────────────────────────────────────────────────────────────────
export default function GoldSignal() {
  const [timeframe, setTimeframe]     = useState("4H");
  const [quote, setQuote]             = useState(null);
  const [news, setNews]               = useState([]);
  const [calendar, setCalendar]       = useState([]);
  const [cot, setCot]                 = useState(null);
  const [realYields, setRealYields]   = useState(null);
  const [analysis, setAnalysis]       = useState(null);
  const [backtest, setBacktest]       = useState(null);
  const [mtfScores, setMtfScores]     = useState({});
  const [loading, setLoading]         = useState(false);
  const [lastUpdate, setLastUpdate]   = useState(null);
  const [error, setError]             = useState(null);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [countdown, setCountdown]     = useState(AUTO_INTERVAL);
  const quoteTimer    = useRef(null);
  const refreshTimer  = useRef(null);
  const countdownTimer= useRef(null);

  const fetchQuote = useCallback(async () => {
    try { const r = await fetch(`${SERVER}/api/quote`); const d = await r.json(); if (d.price) setQuote(d); } catch {}
  }, []);

  useEffect(() => {
    fetchQuote();
    quoteTimer.current = setInterval(fetchQuote, 5000);
    return () => clearInterval(quoteTimer.current);
  }, [fetchQuote]);

  const runAnalysis = useCallback(async (tf) => {
    setLoading(true); setError(null);
    try {
      const [priceRes, newsRes, calRes, yieldRes, cotRes] = await Promise.all([
        fetch(`${SERVER}/api/price?interval=${tf}`),
        fetch(`${SERVER}/api/news`),
        fetch(`${SERVER}/api/calendar`),
        fetch(`${SERVER}/api/realyields`),
        fetch(`${SERVER}/api/cot`),
      ]);
      const priceData = await priceRes.json();
      const newsData  = await newsRes.json();
      const calData   = await calRes.json();
      const yieldData = await yieldRes.json();
      const cotData   = await cotRes.json();

      const fetchedCandles = priceData.candles || [];
      const fetchedNews    = newsData.articles  || [];
      const fetchedCal     = calData.events     || [];
      setNews(fetchedNews); setCalendar(fetchedCal); setRealYields(yieldData); setCot(cotData);

      const bull = fetchedNews.filter(n => n.sentiment === "bullish").length;
      const bear = fetchedNews.filter(n => n.sentiment === "bearish").length;
      const newsSentiment = (bull - bear) / (fetchedNews.length || 1);

      // Calendar warning
      const now = Date.now();
      const upcomingHigh = fetchedCal.find(e => {
        const t = new Date(e.date).getTime();
        return t > now && t - now < 4 * 60 * 60 * 1000 && e.impact === "high";
      });
      const calWarning = upcomingHigh ? `⚠ HIGH IMPACT EVENT IN <4H: ${upcomingHigh.event} — trade with caution` : null;

      const extras = {
        newsSentiment,
        dxy: quote?.dxy || 103.5,
        dxyChange: quote?.dxyChange || 0,
        realYield: yieldData?.realYield,
        realYieldTrend: yieldData?.trend,
        cot: cotData,
      };

      const score = computeScore(fetchedCandles, extras);
      const ind   = getIndicators(fetchedCandles);
      const smc   = calcSMC(fetchedCandles);
      const div   = detectDivergence(fetchedCandles);
      const vol   = calcVolume(fetchedCandles);
      const sig   = scoreToSignal(score);
      const isBull = sig.type === "BUY";
      const levels = calcLevels(ind.price || 0, ind.atr || 12, score, isBull, fetchedCandles);

      // ── Run backtest ──────────────────────────────────────
      const bt = runBacktest(fetchedCandles, score, isBull);
      setBacktest(bt);

      const mtf = {};
      ALL_TF.forEach(t => { mtf[t] = inferMTF(score, tf, t); });
      setMtfScores(mtf);

      // Strategies
      const strategies = [];
      if (ind.rsi < 30 || ind.rsi > 70) strategies.push({ label: "RSI EXTREME", cls: isBull ? "sp-bull" : "sp-bear" });
      if (Math.abs(ind.macd) > 0.5) strategies.push({ label: "MACD SIGNAL", cls: isBull ? "sp-bull" : "sp-bear" });
      if (ind.sma20 > ind.sma50) strategies.push({ label: "GOLDEN CROSS", cls: "sp-bull" });
      if (ind.sma20 < ind.sma50) strategies.push({ label: "DEATH CROSS", cls: "sp-bear" });
      if (smc.bos !== "NONE") strategies.push({ label: smc.bos, cls: smc.bos.includes("BULL") ? "sp-bull" : "sp-bear" });
      if (smc.choch !== "NONE") strategies.push({ label: smc.choch, cls: smc.choch.includes("BULL") ? "sp-bull" : "sp-bear" });
      if (smc.fvg !== "NONE") strategies.push({ label: smc.fvg, cls: smc.fvg.includes("BULL") ? "sp-bull" : "sp-bear" });
      if (smc.orderBlock !== "NEUTRAL") strategies.push({ label: smc.orderBlock, cls: smc.orderBlock.includes("BULL") ? "sp-bull" : "sp-bear" });
      if (!smc.premium) strategies.push({ label: "DISCOUNT ZONE", cls: "sp-bull" }); else strategies.push({ label: "PREMIUM ZONE", cls: "sp-bear" });
      if (div.bull) strategies.push({ label: "BULL DIVERGENCE", cls: "sp-bull" });
      if (div.bear) strategies.push({ label: "BEAR DIVERGENCE", cls: "sp-bear" });
      if (vol.surge) strategies.push({ label: "VOLUME SURGE", cls: isBull ? "sp-bull" : "sp-bear" });
      if (ind.stoch < 20) strategies.push({ label: "STOCH OVERSOLD", cls: "sp-bull" });
      if (ind.stoch > 80) strategies.push({ label: "STOCH OVERBOUGHT", cls: "sp-bear" });
      if (cotData?.bias === "BULLISH") strategies.push({ label: "COT BULLISH", cls: "sp-bull" });
      if (cotData?.bias === "BEARISH") strategies.push({ label: "COT BEARISH", cls: "sp-bear" });
      if (yieldData?.trend === "FALLING") strategies.push({ label: "YIELDS FALLING", cls: "sp-bull" });
      if (yieldData?.trend === "RISING") strategies.push({ label: "YIELDS RISING", cls: "sp-bear" });
      if ((quote?.dxyChange || 0) < -0.2) strategies.push({ label: "DXY WEAKENING", cls: "sp-bull" });
      if ((quote?.dxyChange || 0) > 0.2) strategies.push({ label: "DXY STRENGTHENING", cls: "sp-bear" });
      if (bt.winRate >= 65) strategies.push({ label: `BACKTEST ${bt.winRate}% WIN`, cls: "sp-bull" });
      else if (bt.winRate > 0 && bt.winRate < 45) strategies.push({ label: `LOW WIN RATE ${bt.winRate}%`, cls: "sp-bear" });

      // AI
      let summary = "", reasons = [];
      try {
        const prompt = `You are a senior XAUUSD gold trader. Be sharp and specific.

TIMEFRAME: ${tf} | SIGNAL: ${sig.label} ${sig.type} | SCORE: ${Math.round(score)}/100
BACKTEST: ${bt.found} similar setups found, ${bt.winRate}% win rate, grade ${bt.grade}, confidence ${bt.confidence}%
Price: $${ind.price?.toFixed(2)} | RSI: ${ind.rsi?.toFixed(1)} | MACD: ${ind.macd?.toFixed(3)}
SMA20: $${ind.sma20?.toFixed(2)} | SMA50: $${ind.sma50?.toFixed(2)} | Stoch: ${ind.stoch?.toFixed(1)}
Williams %R: ${ind.wr?.toFixed(1)} | CCI: ${ind.cci?.toFixed(1)} | ATR: $${ind.atr?.toFixed(2)}
Volume surge: ${vol.surge ? "YES" : "NO"}
SMC: BOS ${smc.bos} | CHoCH ${smc.choch} | OB ${smc.orderBlock} | FVG ${smc.fvg} | ${smc.premium ? "PREMIUM" : "DISCOUNT"}
Divergence: ${div.type}
DXY: ${quote?.dxy?.toFixed(2) || "N/A"} (${(quote?.dxyChange || 0) >= 0 ? "+" : ""}${(quote?.dxyChange || 0).toFixed(2)})
Real Yield: ${yieldData?.realYield}% (${yieldData?.trend}) | COT: ${cotData?.bias}
TP1: $${levels.tp1?.toFixed(2)} | TP2: $${levels.tp2?.toFixed(2)} | SL: $${levels.sl?.toFixed(2)}
News: ${bull} bullish / ${bear} bearish
TOP NEWS: ${fetchedNews.slice(0, 3).map(n => `[${n.sentiment?.toUpperCase()}] ${n.title}`).join(' | ')}

Output ONLY valid JSON no markdown:
{
  "summary": "2 sharp sentences — why this signal is valid using the strongest factors including backtest accuracy",
  "reasons": [
    {"icon":"📊","title":"TECHNICALS","detail":"RSI+Stoch+MACD+divergence with values"},
    {"icon":"🏦","title":"SMC STRUCTURE","detail":"BOS/CHoCH/OB/FVG reading"},
    {"icon":"🌍","title":"MACRO","detail":"DXY, real yields, COT combined impact"},
    {"icon":"📈","title":"BACKTEST","detail":"historical accuracy insight and what it means for this trade"}
  ]
}`;
        const aiRes = await fetch("https://api.anthropic.com/v1/messages", {
          method: "POST", headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ model: "claude-sonnet-4-20250514", max_tokens: 700, messages: [{ role: "user", content: prompt }] })
        });
        const aiData = await aiRes.json();
        const text = aiData.content.map(c => c.text || "").join("");
        const parsed = JSON.parse(text.replace(/```json|```/g, "").trim());
        summary = parsed.summary; reasons = parsed.reasons;
      } catch {
        summary = `XAUUSD ${sig.label} ${sig.type} signal at $${ind.price?.toFixed(2)} with ${Math.round(score)}/100 score. Historical backtest found ${bt.found} similar setups with a ${bt.winRate}% win rate (grade ${bt.grade}) — ${bt.winRate >= 60 ? "strong historical edge supports this trade" : bt.winRate >= 45 ? "moderate historical accuracy — use proper risk management" : "low historical win rate — consider waiting for better setup"}.`;
        reasons = [
          { icon: "📊", title: "TECHNICALS", detail: `RSI ${ind.rsi?.toFixed(1)}, Stoch ${ind.stoch?.toFixed(1)}, MACD ${ind.macd > 0 ? "positive" : "negative"}. ${div.type !== "NONE" ? div.type + " detected — high probability move." : ""}` },
          { icon: "🏦", title: "SMC STRUCTURE", detail: `${smc.bos !== "NONE" ? smc.bos + ". " : ""}${smc.choch !== "NONE" ? smc.choch + ". " : ""}${smc.fvg !== "NONE" ? smc.fvg + " present. " : ""}${smc.premium ? "Premium zone." : "Discount zone — look for buys."}` },
          { icon: "🌍", title: "MACRO", detail: `DXY ${quote?.dxy?.toFixed(2) || "N/A"} (${(quote?.dxyChange || 0) >= 0 ? "+" : ""}${(quote?.dxyChange || 0).toFixed(2)}). Real yields ${yieldData?.realYield}% ${yieldData?.trend}. COT: ${cotData?.bias}.` },
          { icon: "📈", title: "BACKTEST", detail: `${bt.found} similar setups found in historical data. Win rate: ${bt.winRate}% (grade ${bt.grade}). TP1 hit ${bt.tp1Rate}% of the time, TP2 hit ${bt.tp2Rate}%.` },
        ];
      }

      setAnalysis({ ...sig, score, ind, smc, div, vol, strategies, levels, summary, reasons, calWarning });
      setLastUpdate(new Date());
    } catch (err) {
      setError("Cannot reach backend. Open terminal in server folder and run: node server.js");
    }
    setLoading(false);
  }, [quote]);

  useEffect(() => { runAnalysis(timeframe); }, [timeframe, runAnalysis]);

  useEffect(() => {
    clearInterval(refreshTimer.current); clearInterval(countdownTimer.current);
    setCountdown(AUTO_INTERVAL);
    if (!autoRefresh) return;
    countdownTimer.current = setInterval(() => setCountdown(c => c <= 1 ? AUTO_INTERVAL : c - 1), 1000);
    refreshTimer.current   = setInterval(() => runAnalysis(timeframe), AUTO_INTERVAL * 1000);
    return () => { clearInterval(refreshTimer.current); clearInterval(countdownTimer.current); };
  }, [autoRefresh, timeframe, runAnalysis]);

  const sig          = analysis ? scoreToSignal(analysis.score) : null;
  const currentPrice = quote?.price || analysis?.ind?.price || 0;
  const priceChange  = quote?.change || 0;
  const pricePct     = quote?.pct    || 0;
  const progressPct  = ((AUTO_INTERVAL - countdown) / AUTO_INTERVAL) * 100;

  return (
    <>
      <style>{STYLES}</style>
      <div className="app">
        <div className="header">
          <div className="brand">XAU<span>/</span>USD</div>
          <div className="price-display">
            <div className="price-num">${currentPrice.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
            <div className="price-chg" style={{ color: priceChange >= 0 ? '#00FF9C' : '#FF3D5A' }}>
              {priceChange >= 0 ? '▲' : '▼'} {Math.abs(priceChange).toFixed(2)} ({Math.abs(pricePct).toFixed(2)}%)
            </div>
          </div>
          <div className="header-right">
            <div className="live-pill"><div className="live-dot" />LIVE</div>
            <div className={`auto-badge ${autoRefresh ? 'on' : 'off'}`} onClick={() => setAutoRefresh(a => !a)}>⟳ AUTO {autoRefresh ? "ON" : "OFF"}</div>
            {autoRefresh && <div className="countdown">{countdown}s</div>}
          </div>
        </div>
        {autoRefresh && <div className="progress-bar"><div className="progress-fill" style={{ width: `${progressPct}%` }} /></div>}

        <div className="main">
          <div className="tf-row">
            {ALL_TF.map(tf => (
              <button key={tf} className={`tf-btn ${timeframe === tf ? 'active' : ''}`} onClick={() => setTimeframe(tf)}>{tf}</button>
            ))}
          </div>

          <div className="signal-strip">
            {SIGNALS.map(s => (
              <div key={s.id} className={`strip-item ${sig?.id === s.id ? 'current' : ''}`}>
                <div className="strip-dot" style={{ background: sig?.id === s.id ? s.color : '#1E2A3A', boxShadow: sig?.id === s.id ? `0 0 7px ${s.color}` : 'none' }} />
                <div className="strip-name" style={{ color: sig?.id === s.id ? s.color : '#445566' }}>{s.label || '—'}<br />{s.type}</div>
              </div>
            ))}
          </div>

          <div className="bottom-bar">
            <div className="last-upd">{lastUpdate ? `UPDATED ${lastUpdate.toLocaleTimeString()}` : 'LOADING...'}</div>
            <button className="refresh-btn" onClick={() => runAnalysis(timeframe)} disabled={loading}>{loading ? "ANALYZING..." : "↻ REFRESH"}</button>
          </div>

          {error && <div className="err-box">⚠ {error}</div>}
          {analysis?.calWarning && <div className="warn-box">{analysis.calWarning}</div>}

          {loading ? (
            <div className="loading-state"><div className="spinner" /><div className="loading-text">ANALYZING + BACKTESTING · {timeframe}</div></div>
          ) : sig && analysis ? (
            <>
              {/* Signal hero */}
              <div className="signal-hero" style={{ '--sc': sig.color, '--sg': sig.glow, '--sd': sig.dim }}>
                <div className="signal-top">
                  <div>
                    <div className="signal-label"><span className="signal-size">{sig.label}</span>{sig.type}</div>
                    {backtest && backtest.found >= 5 && (
                      <div style={{ marginTop: 6, display: 'flex', alignItems: 'center', gap: 8 }}>
                        <span style={{ fontSize: 10, color: 'var(--muted)', fontFamily: 'Rajdhani,sans-serif', letterSpacing: 1 }}>HISTORICAL ACCURACY:</span>
                        <span style={{ fontSize: 14, fontWeight: 700, fontFamily: 'Orbitron,monospace', color: backtest.winRate >= 60 ? 'var(--s-buy)' : backtest.winRate >= 45 ? 'var(--gold)' : 'var(--s-sell)' }}>
                          {backtest.winRate}%
                        </span>
                        <span style={{ fontSize: 11, fontFamily: 'Rajdhani,sans-serif', fontWeight: 700, color: gradeColor(backtest.grade), letterSpacing: 1 }}>
                          [{backtest.grade}]
                        </span>
                      </div>
                    )}
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 5 }}>
                    <ScoreArc score={analysis.score} color={sig.color} />
                    <StrengthBars count={sig.bars} color={sig.color} type={sig.type} />
                  </div>
                </div>
                {/* Levels */}
                <div className="levels-hero">
                  <div className="lh-card">
                    <div className="lh-label" style={{ color: 'var(--gold)' }}>ENTRY</div>
                    <div className="lh-price" style={{ color: 'var(--gold)' }}>${analysis.ind?.price?.toFixed(2)}</div>
                    <div className="lh-note">Current price</div>
                  </div>
                  <div className="lh-card">
                    <div className="lh-label" style={{ color: '#00CC77' }}>TP1 SAFE</div>
                    <div className="lh-price" style={{ color: '#00CC77' }}>${analysis.levels?.tp1?.toFixed(2)}</div>
                    <div className="lh-note">Hit {backtest?.tp1Rate || "—"}% of time</div>
                  </div>
                  <div className="lh-card">
                    <div className="lh-label" style={{ color: '#00FF9C' }}>TP2 MAX</div>
                    <div className="lh-price" style={{ color: '#00FF9C' }}>${analysis.levels?.tp2?.toFixed(2)}</div>
                    <div className="lh-note">Hit {backtest?.tp2Rate || "—"}% of time</div>
                  </div>
                  <div className="lh-card">
                    <div className="lh-label" style={{ color: '#FF3D5A' }}>STOP LOSS</div>
                    <div className="lh-price" style={{ color: '#FF3D5A' }}>${analysis.levels?.sl?.toFixed(2)}</div>
                    <div className="lh-note">SL hit {backtest?.slRate || "—"}% of time</div>
                  </div>
                </div>
                {/* Reasons */}
                <div className="reasons-grid">
                  {analysis.reasons?.map((r, i) => (
                    <div key={i} className="reason-item">
                      <div className="reason-icon">{r.icon}</div>
                      <div className="reason-text"><strong>{r.title}</strong>{r.detail}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* AI Summary */}
              <div className="panel sig-left" style={{ '--sc': sig.color }}>
                <div className="panel-title">🤖 AI ANALYSIS · {timeframe}</div>
                <div style={{ fontSize: 11, lineHeight: 1.8, color: '#8BAABB' }}>{analysis.summary}</div>
                {analysis.div?.type !== "NONE" && (
                  <div className="div-badge" style={{ background: analysis.div.bull ? 'rgba(0,255,156,0.08)' : 'rgba(255,0,64,0.08)', color: analysis.div.bull ? 'var(--s-buy)' : 'var(--s-sell)', border: `1px solid ${analysis.div.bull ? 'rgba(0,255,156,0.3)' : 'rgba(255,0,64,0.3)'}` }}>
                    ⚡ {analysis.div.type}
                  </div>
                )}
                {analysis.vol?.surge && (
                  <div className="div-badge" style={{ background: 'rgba(240,180,41,0.08)', color: 'var(--gold)', border: '1px solid rgba(240,180,41,0.3)' }}>
                    📊 VOLUME SURGE — {((analysis.vol.currentVol / analysis.vol.avgVol - 1) * 100).toFixed(0)}% ABOVE AVG
                  </div>
                )}
              </div>

              {/* ── ACCURACY PANEL ── */}
              <AccuracyPanel backtest={backtest} sig={sig} />

              {/* Macro */}
              <div className="panel gold-left">
                <div className="panel-title gold">🌍 MACRO FUNDAMENTALS</div>
                <div className="macro-grid">
                  <div className="macro-card">
                    <div className="macro-name">DXY INDEX</div>
                    <div className="macro-val" style={{ color: (quote?.dxyChange || 0) < 0 ? 'var(--s-buy)' : 'var(--s-sell)' }}>{quote?.dxy?.toFixed(2) || "—"}</div>
                    <div className="macro-sub" style={{ color: (quote?.dxyChange || 0) < 0 ? 'var(--s-buy)' : 'var(--s-sell)' }}>{(quote?.dxyChange || 0) >= 0 ? '▲' : '▼'} {Math.abs(quote?.dxyChange || 0).toFixed(2)}</div>
                  </div>
                  <div className="macro-card">
                    <div className="macro-name">REAL YIELD 10Y</div>
                    <div className="macro-val" style={{ color: realYields?.trend === "FALLING" ? 'var(--s-buy)' : 'var(--s-sell)' }}>{realYields?.realYield?.toFixed(2) || "—"}%</div>
                    <div className="macro-sub" style={{ color: realYields?.trend === "FALLING" ? 'var(--s-buy)' : 'var(--s-sell)' }}>{realYields?.trend || "—"}</div>
                  </div>
                  <div className="macro-card">
                    <div className="macro-name">COT BIAS</div>
                    <div className="macro-val" style={{ color: cot?.bias === "BULLISH" ? 'var(--s-buy)' : 'var(--s-sell)' }}>{cot?.bias || "—"}</div>
                    <div className="macro-sub" style={{ color: 'var(--muted)' }}>{cot?.netSpeculative?.toLocaleString() || "—"}</div>
                  </div>
                  <div className="macro-card">
                    <div className="macro-name">DAY RANGE</div>
                    <div className="macro-val" style={{ color: 'var(--gold)' }}>${quote?.high?.toFixed(0) || "—"}</div>
                    <div className="macro-sub" style={{ color: 'var(--muted)' }}>LO ${quote?.low?.toFixed(0) || "—"}</div>
                  </div>
                </div>
                <div>
                  <div className="corr-label"><span>DXY INVERSE CORRELATION</span><span style={{ color: (quote?.dxyChange || 0) < 0 ? 'var(--s-buy)' : 'var(--s-sell)' }}>{(quote?.dxyChange || 0) < 0 ? 'GOLD ▲' : 'GOLD ▼'}</span></div>
                  <div className="corr-bar-wrap"><div className="corr-bar-fill" style={{ width: `${Math.min(100, Math.abs((quote?.dxyChange || 0) * 50 + 50))}%`, background: (quote?.dxyChange || 0) < 0 ? 'var(--s-buy)' : 'var(--s-sell)' }} /></div>
                </div>
              </div>

              {/* COT */}
              <div className="panel">
                <div className="panel-title">📋 COT — COMMITMENT OF TRADERS</div>
                <div className="cot-grid">
                  {[
                    { name: "COMMERCIAL LONG",  val: cot?.commercialLong?.toLocaleString(),  color: 'var(--s-buy)' },
                    { name: "COMMERCIAL SHORT", val: cot?.commercialShort?.toLocaleString(), color: 'var(--s-sell)' },
                    { name: "NON-COMM LONG",    val: cot?.nonCommLong?.toLocaleString(),     color: 'var(--s-buy)' },
                    { name: "NON-COMM SHORT",   val: cot?.nonCommShort?.toLocaleString(),    color: 'var(--s-sell)' },
                  ].map((item, i) => (
                    <div key={i} className="cot-card">
                      <div className="cot-name">{item.name}</div>
                      <div className="cot-val" style={{ color: item.color }}>{item.val || "—"}</div>
                    </div>
                  ))}
                </div>
                <div style={{ marginTop: 8, fontSize: 10, fontFamily: 'Rajdhani,sans-serif', letterSpacing: 1 }}>
                  NET SPECULATIVE: <span style={{ color: (cot?.netSpeculative || 0) > 0 ? 'var(--s-buy)' : 'var(--s-sell)', fontWeight: 700 }}>{cot?.netSpeculative?.toLocaleString() || "—"}</span>
                  &nbsp;&nbsp;|&nbsp;&nbsp;BIAS: <span style={{ color: cot?.bias === "BULLISH" ? 'var(--s-buy)' : 'var(--s-sell)', fontWeight: 700 }}>{cot?.bias || "—"}</span>
                </div>
              </div>

              {/* Calendar */}
              <div className="panel">
                <div className="panel-title">📅 ECONOMIC CALENDAR</div>
                {calendar.length === 0 ? (
                  <div style={{ fontSize: 10, color: 'var(--muted)', padding: '6px 0' }}>No upcoming high-impact events.</div>
                ) : calendar.slice(0, 6).map((e, i) => (
                  <div key={i} className="cal-item">
                    <div className="cal-impact" style={{ background: e.impact === "high" ? 'var(--s-sell)' : e.impact === "medium" ? 'var(--gold)' : 'var(--muted)' }} />
                    <div className="cal-body">
                      <div className="cal-event">{e.event}</div>
                      <div className="cal-meta">{e.country?.toUpperCase()} · {e.impact?.toUpperCase()} · IN {timeTo(e.date)}</div>
                    </div>
                    {(e.forecast || e.previous) && (
                      <div className="cal-vals">
                        {e.forecast && <div style={{ color: 'var(--gold)' }}>F: {e.forecast}</div>}
                        {e.previous && <div style={{ color: 'var(--muted)' }}>P: {e.previous}</div>}
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {/* SMC */}
              <div className="panel gold-left">
                <div className="panel-title gold">🏦 SMART MONEY CONCEPTS</div>
                <div className="smc-grid">
                  {[
                    { name: "BREAK OF STRUCTURE", val: analysis.smc?.bos, color: analysis.smc?.bos?.includes("BULL") ? 'var(--s-buy)' : analysis.smc?.bos === "NONE" ? 'var(--muted)' : 'var(--s-sell)' },
                    { name: "CHoCH", val: analysis.smc?.choch, color: analysis.smc?.choch?.includes("BULL") ? 'var(--s-buy)' : analysis.smc?.choch === "NONE" ? 'var(--muted)' : 'var(--s-sell)' },
                    { name: "ORDER BLOCK", val: analysis.smc?.orderBlock, color: analysis.smc?.orderBlock?.includes("BULL") ? 'var(--s-buy)' : analysis.smc?.orderBlock === "NEUTRAL" ? 'var(--muted)' : 'var(--s-sell)' },
                    { name: "FAIR VALUE GAP", val: analysis.smc?.fvg, color: analysis.smc?.fvg?.includes("BULL") ? 'var(--s-buy)' : analysis.smc?.fvg === "NONE" ? 'var(--muted)' : 'var(--s-sell)' },
                    { name: "LIQUIDITY", val: analysis.smc?.liquidity, color: 'var(--gold)' },
                    { name: "ZONE", val: analysis.smc?.premium ? "PREMIUM" : "DISCOUNT", color: analysis.smc?.premium ? 'var(--s-sell)' : 'var(--s-buy)' },
                  ].map((item, i) => (
                    <div key={i} className="smc-item">
                      <div className="smc-name">{item.name}</div>
                      <div className="smc-val" style={{ color: item.color }}>{item.val}</div>
                    </div>
                  ))}
                </div>
                <div className="strats-wrap">
                  {analysis.strategies?.map((s, i) => <span key={i} className={`strat-pill ${s.cls}`}>{s.label}</span>)}
                </div>
              </div>

              {/* MTF */}
              <div className="panel">
                <div className="panel-title">MULTI-TIMEFRAME CONFLUENCE</div>
                <div className="mtf-grid">
                  {ALL_TF.map(tf => {
                    const s = mtfScores[tf] || 50, tfSig = scoreToSignal(s);
                    return (
                      <div key={tf} className={`mtf-card ${tf === timeframe ? 'hl' : ''}`}>
                        <div className="mtf-tf">{tf}</div>
                        <div className="mtf-sig" style={{ color: tfSig.color }}>{tfSig.label ? `${tfSig.label} ` : ''}{tfSig.type}</div>
                        <div className="mtf-bar-wrap"><div className="mtf-bar-fill" style={{ width: `${s}%`, background: tfSig.color }} /></div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Indicators */}
              <div className="ind-row">
                {[
                  { name: "RSI (14)", val: analysis.ind?.rsi?.toFixed(1), cls: analysis.ind?.rsi > 70 ? 'c-sell' : analysis.ind?.rsi < 30 ? 'c-buy' : analysis.ind?.rsi > 55 ? 'c-buy' : 'c-neutral', sig: analysis.ind?.rsi > 70 ? 'OVERBOUGHT' : analysis.ind?.rsi < 30 ? 'OVERSOLD' : analysis.ind?.rsi > 55 ? 'BULLISH' : 'NEUTRAL' },
                  { name: "MACD", val: analysis.ind?.macd?.toFixed(3), cls: analysis.ind?.macd > 0 ? 'c-buy' : 'c-sell', sig: analysis.ind?.macd > 0 ? 'POSITIVE' : 'NEGATIVE' },
                  { name: "STOCH", val: analysis.ind?.stoch?.toFixed(1), cls: analysis.ind?.stoch < 20 ? 'c-buy' : analysis.ind?.stoch > 80 ? 'c-sell' : 'c-neutral', sig: analysis.ind?.stoch < 20 ? 'OVERSOLD' : analysis.ind?.stoch > 80 ? 'OVERBOUGHT' : 'NEUTRAL' },
                  { name: "WILLIAMS %R", val: analysis.ind?.wr?.toFixed(1), cls: analysis.ind?.wr < -80 ? 'c-buy' : analysis.ind?.wr > -20 ? 'c-sell' : 'c-neutral', sig: analysis.ind?.wr < -80 ? 'OVERSOLD' : analysis.ind?.wr > -20 ? 'OVERBOUGHT' : 'NEUTRAL' },
                  { name: "CCI (20)", val: analysis.ind?.cci?.toFixed(0), cls: analysis.ind?.cci < -100 ? 'c-buy' : analysis.ind?.cci > 100 ? 'c-sell' : 'c-neutral', sig: analysis.ind?.cci < -100 ? 'OVERSOLD' : analysis.ind?.cci > 100 ? 'OVERBOUGHT' : 'NEUTRAL' },
                  { name: "ATR (14)", val: `$${analysis.ind?.atr?.toFixed(1)}`, cls: 'c-gold', sig: analysis.ind?.atr > 15 ? 'HIGH VOL' : 'LOW VOL' },
                ].map((ind, i) => (
                  <div key={i} className="ind-card">
                    <div className="ind-name">{ind.name}</div>
                    <div className={`ind-val ${ind.cls}`}>{ind.val}</div>
                    <div className={`ind-sig ${ind.cls}`}>{ind.sig}</div>
                  </div>
                ))}
              </div>

              {/* Key Levels */}
              <div className="klev-row">
                <div className="klev-card"><div className="klev-type">RESISTANCE</div><div className="klev-price" style={{ color: '#FF3D5A' }}>${(currentPrice + (analysis.ind?.atr || 12) * 2.2).toFixed(2)}</div></div>
                <div className="klev-card"><div className="klev-type">CURRENT</div><div className="klev-price" style={{ color: sig.color }}>${currentPrice.toFixed(2)}</div></div>
                <div className="klev-card"><div className="klev-type">SUPPORT</div><div className="klev-price" style={{ color: '#00FF9C' }}>${(currentPrice - (analysis.ind?.atr || 12) * 2.2).toFixed(2)}</div></div>
              </div>

              {/* News */}
              <div className="panel">
                <div className="panel-title">📰 LIVE NEWS</div>
                {news.length === 0 ? (
                  <div style={{ color: 'var(--muted)', fontSize: 10, padding: '6px 0' }}>No news — check backend is running.</div>
                ) : news.slice(0, 8).map((n, i) => (
                  <div key={i} className="news-item">
                    <div className="news-meta">
                      <span className="news-src">{(n.source || 'NEWS').toUpperCase().slice(0, 20)}</span>
                      <span className={`news-badge ${n.sentiment === 'bullish' ? 'nb-bull' : n.sentiment === 'bearish' ? 'nb-bear' : 'nb-neutral'}`}>{n.sentiment?.toUpperCase()}</span>
                      {n.impact === "HIGH" && <span className="news-badge nb-high">HIGH IMPACT</span>}
                    </div>
                    <div className="news-title">{n.title}</div>
                    <div className="news-time">{timeAgo(n.published)}</div>
                  </div>
                ))}
              </div>
            </>
          ) : !error ? (
            <div className="loading-state"><div className="spinner" /><div className="loading-text">CONNECTING TO SERVER...</div></div>
          ) : null}
        </div>
        <div className="disclaimer">⚠ NOT FINANCIAL ADVICE · EDUCATIONAL PURPOSES ONLY · PAST ACCURACY DOES NOT GUARANTEE FUTURE RESULTS</div>
      </div>
    </>
  );
}
