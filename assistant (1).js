/* LifeSync AI Practical shell */
:root{
  --bg:#08111f;
  --panel:#0f172a;
  --panel-2:#162235;
  --card:#101b2e;
  --text:#e2e8f0;
  --muted:#94a3b8;
  --line:#243247;
  --primary:#5eead4;
  --primary-2:#22c55e;
  --danger:#fb7185;
  --warning:#f59e0b;
  --radius:20px;
  --shadow:0 24px 60px rgba(0,0,0,.28);
  --max:1280px;
  --focus:0 0 0 3px rgba(94,234,212,.4);
  color-scheme:dark;
}
*{box-sizing:border-box}
html{scroll-behavior:smooth}
body{
  margin:0;
  font-family:Inter,ui-sans-serif,system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif;
  background:
    radial-gradient(circle at top left, rgba(34,197,94,.09), transparent 25%),
    radial-gradient(circle at right, rgba(94,234,212,.08), transparent 28%),
    var(--bg);
  color:var(--text);
  line-height:1.55;
}
a{color:var(--primary)}
button,input,select,textarea{
  font:inherit;
}
button,input,select,textarea{
  border-radius:14px;
}
button:focus-visible,input:focus-visible,select:focus-visible,textarea:focus-visible,a:focus-visible{
  outline:none;
  box-shadow:var(--focus);
}
.skip-link{
  position:absolute;
  left:12px;
  top:-200px;
  background:#fff;
  color:#000;
  padding:.7rem 1rem;
  border-radius:12px;
  z-index:999;
}
.skip-link:focus{top:12px}
.container{
  width:min(calc(100% - 2rem), var(--max));
  margin-inline:auto;
}
.site-header{
  padding:2rem 0 1rem;
}
.header-inner{
  display:grid;
  grid-template-columns:1.3fr .9fr;
  gap:1.25rem;
  align-items:start;
}
.eyebrow{
  letter-spacing:.12em;
  text-transform:uppercase;
  color:var(--primary);
  font-size:.78rem;
  margin:0 0 .4rem;
}
h1,h2,h3{
  line-height:1.15;
  margin:.2rem 0 .75rem;
}
h1{font-size:clamp(2rem,4vw,3.5rem)}
h2{font-size:clamp(1.35rem,2vw,1.8rem)}
h3{font-size:1.1rem}
.lede{
  color:var(--muted);
  max-width:65ch;
}
.hero-card{
  background:linear-gradient(180deg, rgba(94,234,212,.12), rgba(148,163,184,.05));
  border:1px solid rgba(94,234,212,.2);
  border-radius:24px;
  padding:1rem;
  box-shadow:var(--shadow);
}
.hero-stat{
  display:flex;
  flex-direction:column;
  gap:.25rem;
  padding:.8rem 0;
  border-bottom:1px solid rgba(255,255,255,.08);
}
.hero-stat:last-child{border-bottom:none}
.hero-stat span{color:var(--muted); font-size:.92rem}
.main-nav{
  position:sticky;
  top:0;
  z-index:40;
  backdrop-filter: blur(12px);
  background:rgba(8,17,31,.85);
  border-top:1px solid rgba(255,255,255,.04);
  border-bottom:1px solid rgba(255,255,255,.05);
}
.nav-inner{
  display:flex;
  gap:.55rem;
  overflow:auto;
  padding:.8rem 0;
}
.nav-button,.primary-btn,.secondary-btn,.ghost-btn,.chip-btn{
  min-height:46px;
  min-width:46px;
  padding:.76rem 1rem;
  border:1px solid var(--line);
  color:var(--text);
  background:var(--panel);
  cursor:pointer;
  transition:.18s ease;
}
.nav-button:hover,.primary-btn:hover,.secondary-btn:hover,.ghost-btn:hover,.chip-btn:hover{
  transform:translateY(-1px);
  border-color:rgba(94,234,212,.35);
}
.nav-button.is-active{
  background:rgba(94,234,212,.12);
  color:#d1fae5;
  border-color:rgba(94,234,212,.35);
}
.app-grid{
  display:grid;
  grid-template-columns:320px 1fr;
  gap:1rem;
  padding:1rem 0 2rem;
}
.side-panel,.surface,.panel,.card,.list-card,.chart-card,.pricing-card{
  background:linear-gradient(180deg, rgba(255,255,255,.02), rgba(255,255,255,.01));
  border:1px solid rgba(255,255,255,.08);
  box-shadow:var(--shadow);
}
.side-panel{
  display:flex;
  flex-direction:column;
  gap:1rem;
}
.panel,.surface,.card,.list-card,.chart-card,.pricing-card{
  border-radius:var(--radius);
}
.panel{padding:1rem}
.surface{padding:1rem}
.surface-head{
  display:flex;
  justify-content:space-between;
  align-items:start;
  gap:1rem;
  border-bottom:1px solid rgba(255,255,255,.08);
  padding-bottom:1rem;
  margin-bottom:1rem;
}
.pill-row{display:flex;flex-wrap:wrap;gap:.5rem}
.pill{
  display:inline-flex;
  align-items:center;
  border:1px solid rgba(94,234,212,.24);
  color:#d1fae5;
  background:rgba(94,234,212,.1);
  border-radius:999px;
  min-height:38px;
  padding:0 .85rem;
  font-size:.88rem;
}
.module-root{min-height:60vh}
.status-list,.metrics-grid,.grid-2,.grid-3,.finance-layout,.settings-layout,.assistant-layout,.wellness-grid,.productivity-grid{
  display:grid;
  gap:1rem;
}
.status-list div{
  display:flex;
  justify-content:space-between;
  gap:.75rem;
  padding:.55rem 0;
  border-bottom:1px solid rgba(255,255,255,.08);
}
.status-list div:last-child{border-bottom:none}
.status-list dt{color:var(--muted)}
.quick-actions{display:grid;gap:.65rem}
.compact-list{padding-left:1.1rem;margin:.2rem 0}
.card,.list-card,.chart-card,.pricing-card{padding:1rem}
.metrics-grid{grid-template-columns:repeat(4,1fr)}
.metric{
  padding:1rem;
  border-radius:18px;
  background:var(--card);
  border:1px solid rgba(255,255,255,.05);
}
.metric .label{color:var(--muted);font-size:.92rem}
.metric strong{display:block;font-size:1.5rem;margin-top:.4rem}
.grid-2{grid-template-columns:repeat(2,1fr)}
.grid-3{grid-template-columns:repeat(3,1fr)}
.finance-layout{grid-template-columns:minmax(280px,380px) 1fr}
.productivity-grid{grid-template-columns:350px 1fr}
.wellness-grid{grid-template-columns:1fr 1fr}
.assistant-layout{grid-template-columns:1.05fr .95fr}
.settings-layout{grid-template-columns:1.1fr .9fr}
label{display:grid;gap:.4rem}
input,select,textarea{
  width:100%;
  padding:.82rem .95rem;
  background:#091221;
  color:var(--text);
  border:1px solid var(--line);
}
textarea{min-height:120px; resize:vertical}
.form-actions{
  display:flex;
  flex-wrap:wrap;
  gap:.65rem;
  margin-top:.85rem;
}
.primary-btn{
  background:linear-gradient(180deg, rgba(94,234,212,.25), rgba(94,234,212,.14));
  border-color:rgba(94,234,212,.3);
  color:#d1fae5;
}
.secondary-btn{background:var(--panel-2)}
.ghost-btn{background:transparent}
.inline-help,.small{
  color:var(--muted);
  font-size:.9rem;
}
.table-wrap{overflow:auto}
.data-table{
  width:100%;
  border-collapse:collapse;
}
.data-table th,.data-table td{
  text-align:left;
  padding:.8rem .7rem;
  border-bottom:1px solid rgba(255,255,255,.08);
  vertical-align:top;
}
.data-table th{color:var(--muted);font-weight:600}
.badge{
  display:inline-flex;
  align-items:center;
  padding:.18rem .55rem;
  border-radius:999px;
  border:1px solid rgba(255,255,255,.12);
  background:#0b1321;
  font-size:.82rem;
}
.badge.is-high{border-color:rgba(251,113,133,.4); color:#fecdd3}
.badge.is-medium{border-color:rgba(245,158,11,.35); color:#fde68a}
.badge.is-low{border-color:rgba(34,197,94,.35); color:#bbf7d0}
.chat-log{
  max-height:500px;
  overflow:auto;
  display:grid;
  gap:.8rem;
  padding-right:.25rem;
}
.chat-msg{
  border-radius:18px;
  padding:.95rem 1rem;
  border:1px solid rgba(255,255,255,.08);
}
.chat-msg.user{background:#0a1424}
.chat-msg.assistant{background:rgba(94,234,212,.08)}
.chat-meta{
  font-size:.8rem;
  color:var(--muted);
  margin-bottom:.35rem;
}
.progress-bar{
  height:10px;
  width:100%;
  background:#091221;
  border-radius:999px;
  overflow:hidden;
  border:1px solid rgba(255,255,255,.06);
}
.progress-bar span{
  display:block;
  height:100%;
  background:linear-gradient(90deg,var(--primary),var(--primary-2));
}
.kpi-line{
  display:flex;
  justify-content:space-between;
  gap:1rem;
  padding:.65rem 0;
  border-bottom:1px solid rgba(255,255,255,.08);
}
.kpi-line:last-child{border-bottom:none}
.pricing-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:1rem}
.pricing-card.highlight{
  border-color:rgba(94,234,212,.35);
  background:linear-gradient(180deg, rgba(94,234,212,.12), rgba(255,255,255,.02));
}
.pricing-card ul{padding-left:1rem}
.todo-list,.habit-list,.journal-list,.sync-list{
  display:grid;
  gap:.75rem;
}
.todo-item,.habit-item,.journal-item,.sync-item{
  padding:.9rem 1rem;
  border-radius:16px;
  border:1px solid rgba(255,255,255,.08);
  background:#0b1321;
}
.todo-item.done{
  opacity:.7;
}
.todo-head,.space-between{
  display:flex;
  justify-content:space-between;
  gap:.75rem;
  align-items:flex-start;
}
.timer{
  display:grid;
  gap:.6rem;
  align-items:start;
}
.timer-clock{
  font-size:clamp(2rem,6vw,3.6rem);
  font-weight:800;
  letter-spacing:.04em;
}
.muted{color:var(--muted)}
.usage-meter{
  display:grid;
  gap:.5rem;
}
.toast{
  position:sticky;
  top:80px;
  z-index:30;
  margin-bottom:1rem;
  padding:.95rem 1rem;
  border-radius:16px;
  border:1px solid rgba(94,234,212,.3);
  background:rgba(8,17,31,.92);
}
.site-footer{
  padding:0 0 2rem;
}
.footer-inner{
  display:flex;
  justify-content:space-between;
  gap:1rem;
  color:var(--muted);
}
.footer-links{display:flex;gap:1rem;align-items:center}
.sr-only{
  position:absolute !important;
  width:1px;height:1px;
  padding:0;margin:-1px;overflow:hidden;clip:rect(0,0,0,0);white-space:nowrap;border:0;
}
hr{
  border:none;
  border-top:1px solid rgba(255,255,255,.08);
  margin:1rem 0;
}
@media (max-width:1100px){
  .app-grid,.finance-layout,.assistant-layout,.productivity-grid,.settings-layout,.wellness-grid,.header-inner{
    grid-template-columns:1fr;
  }
  .metrics-grid,.pricing-grid,.grid-3{
    grid-template-columns:repeat(2,1fr);
  }
}
@media (max-width:720px){
  body{font-size:15px}
  .container{width:min(calc(100% - 1rem), var(--max))}
  .metrics-grid,.pricing-grid,.grid-2,.grid-3{
    grid-template-columns:1fr;
  }
  .surface-head,.footer-inner{
    flex-direction:column;
    align-items:flex-start;
  }
}