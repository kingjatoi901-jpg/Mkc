// ClipForge — AI Video Clipping SaaS
// Full-stack simulation: Auth + Dashboard + Processing + Gallery + Paywall
import { useState, useEffect, useRef, useCallback } from "react";

// ─── DESIGN TOKENS ───────────────────────────────────────────────────────────
const T = {
  obsidian: "#080810",
  navy: "#0F0F1A",
  navyLight: "#1A1A2E",
  navyMid: "#141422",
  indigo: "#4F46E5",
  indigoLight: "#6366F1",
  indigoDim: "rgba(79,70,229,0.12)",
  green: "#39FF14",
  greenDim: "rgba(57,255,20,0.1)",
  white: "#E8E8F0",
  muted: "#6B6B8A",
  mutedLight: "#9090B0",
  border: "rgba(255,255,255,0.07)",
  borderHover: "rgba(79,70,229,0.5)",
  red: "#FF4545",
  amber: "#FFAB00",
  card: "#111120",
};

// ─── SCOPED AND SANITIZED GLOBAL STYLES ──────────────────────────────────────
const GLOBAL_CSS = `
@import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=Inter:wght@300;400;500;600&family=JetBrains+Mono:wght@400;500&display=swap');

.clipforge-wrapper *, .clipforge-wrapper *::before, .clipforge-wrapper *::after { box-sizing: border-box; margin: 0; padding: 0; }
.clipforge-wrapper {
  font-family: 'Inter', sans-serif;
  background: ${T.obsidian};
  color: ${T.white};
  min-height: 100vh;
  -webkit-font-smoothing: antialiased;
}
.clipforge-wrapper ::-webkit-scrollbar { width: 6px; }
.clipforge-wrapper ::-webkit-scrollbar-track { background: ${T.navy}; }
.clipforge-wrapper ::-webkit-scrollbar-thumb { background: ${T.indigo}; border-radius: 3px; }

@keyframes fadeUp { from { opacity:0; transform:translateY(20px); } to { opacity:1; transform:translateY(0); } }
@keyframes fadeIn { from { opacity:0; } to { opacity:1; } }
@keyframes shimmer { 0%,100% { opacity:.4; } 50% { opacity:1; } }
@keyframes scanLine { 0% { transform: translateX(-100%); } 100% { transform: translateX(400%); } }
@keyframes pulse { 0%,100% { box-shadow: 0 0 0 0 rgba(79,70,229,0.4); } 70% { box-shadow: 0 0 0 10px rgba(79,70,229,0); } }
@keyframes rotate { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
@keyframes filmStrip { 0% { background-position: 0% 50%; } 50% { background-position: 100% 50%; } 100% { background-position: 0% 50%; } }
@keyframes subtitleFade { 0% { opacity:0; transform:translateY(4px); } 100% { opacity:1; transform:translateY(0); } }
@keyframes segmentLight { 0% { opacity:.2; } 100% { opacity:1; } }

.anim-fadeUp { animation: fadeUp .5s ease both; }
.anim-fadeIn { animation: fadeIn .3s ease both; }
`;

// ─── MOCK DATA ────────────────────────────────────────────────────────────────
function generateClips() {
  const hooks = [
    "The one strategy that 10x'd my audience overnight",
    "Nobody talks about this, but it changes everything",
    "Here's why most people fail at this — and how to fix it",
    "I tested this for 90 days, here's what actually happened",
    "This single insight made me $50k in one month",
    "Stop doing this immediately if you want to grow",
    "The algorithm rewards exactly this kind of content",
    "Three words that will transform your entire business",
    "Why the top 1% do this differently than everyone else",
    "The counterintuitive truth nobody in this industry admits",
  ];
  const subtitleSets = [
    ["And the thing is,", "most people completely", "overlook this step.", "It's the difference", "between 1k and 100k."],
    ["I was exactly where", "you are right now.", "No audience, no money.", "Then I discovered", "this one framework."],
    ["The data is clear.", "Engagement spikes", "by 340% when you", "open with a story.", "Here's the structure."],
    ["Every top creator", "I've interviewed", "does this one thing.", "It sounds simple.", "But almost no one does it."],
    ["Stop chasing trends.", "The real opportunity is", "evergreen content", "that compounds", "over years, not weeks."],
    ["Your first 30 seconds", "determine everything.", "Viewers decide", "in 3 frames", "whether to stay or leave."],
    ["The hook is dead.", "Attention is earned,", "not grabbed.", "Here's the new", "content formula."],
    ["I made every mistake.", "Lost 2 years", "doing this wrong.", "Then a mentor showed me", "the actual playbook."],
    ["Platforms want you", "to stay on them.", "Use that.", "Post content that", "creates a loop, not an exit."],
    ["Value density wins.", "Pack more insight", "into 60 seconds", "than others pack", "into 60 minutes."],
  ];
  const tags = [
    ["hook","growth","mindset"],["story","relatable","viral"],["data-driven","strategy","proof"],
    ["interview","insight","authority"],["evergreen","seo","value"],["retention","hook","editing"],
    ["trend","format","platform"],["journey","authentic","emotional"],["algorithm","platform","tips"],
    ["education","dense","shareworthy"],
  ];
  const starts = ["0:18","1:42","3:07","5:55","8:22","11:04","14:37","18:50","22:15","26:49"];
  const durations = ["0:47","1:02","0:53","1:14","0:38","1:07","0:55","1:21","0:43","1:03"];
  const scores = [96,91,88,85,83,79,76,73,68,62];
  const colors = [
    ["#1a0533","#0d0a2e"],["#0a2233","#0d1a2e"],["#1a1a05","#0a2e0a"],
    ["#330a0a","#2e0d1a"],["#0a1a33","#0d0a2e"],["#1a0a33","#330a1a"],
    ["#0a331a","#2e2e0a"],["#33200a","#0a2e20"],["#200a33","#0a1433"],
    ["#0a2820","#281a0a"],
  ];
  return hooks.map((hook, i) => ({
    id: i + 1, hook, subtitles: subtitleSets[i], tags: tags[i],
    startTime: starts[i], duration: durations[i], viralScore: scores[i],
    colors: colors[i], platform: ["TikTok","Reels","Shorts"][i % 3],
  }));
}

const PLANS = [
  { id:"starter", name:"Starter", price:29, period:"month", features:["10 clips per video","5 videos / month","Auto subtitles","720p export","Email support"], highlight:false, cta:"Start Free Trial" },
  { id:"pro", name:"Pro", price:79, period:"month", features:["10 clips per video","Unlimited videos","Auto subtitles + captions","4K export","Viral score AI","Priority support","Brand kit"], highlight:true, cta:"Start Free Trial", badge:"Most Popular" },
  { id:"agency", name:"Agency", price:199, period:"month", features:["Everything in Pro","10 team seats","White-label exports","API access","Custom branding","Dedicated manager","SLA guarantee"], highlight:false, cta:"Contact Sales" },
];

// ─── SUB-COMPONENTS ───────────────────────────────────────────────────────────
function Spinner({ size = 20, color = T.indigo }) {
  return (
    <div style={{ width:size, height:size, border:`2px solid rgba(255,255,255,0.1)`, borderTop:`2px solid ${color}`, borderRadius:"50%", animation:"rotate 0.8s linear infinite", flexShrink:0 }} />
  );
}

function Toast({ message, type = "success", onClose }) {
  useEffect(() => { const t = setTimeout(onClose, 3500); return () => clearTimeout(t); }, [onClose]);
  const bg = type === "success" ? T.green : type === "error" ? T.red : T.amber;
  const textColor = type === "success" ? "#000" : "#fff";
  return (
    <div style={{ position:"fixed", bottom:28, right:28, zIndex:9999, background:bg, color:textColor, padding:"12px 20px", borderRadius:10, fontWeight:600, fontSize:14, boxShadow:`0 8px 32px rgba(0,0,0,0.4)`, animation:"fadeUp .3s ease", display:"flex", alignItems:"center", gap:10, maxWidth:320 }}>
      <span>{type === "success" ? "✓" : type === "error" ? "✕" : "!"}</span>
      <span>{message}</span>
      <button onClick={onClose} style={{ background:"none", border:"none", cursor:"pointer", marginLeft:"auto", color:textColor, fontSize:16, opacity:0.7 }}>×</button>
    </div>
  );
}

function InputField({ label, placeholder, value, onChange, type = "text" }) {
  return (
    <div style={{ marginBottom:16, width:"100%" }}>
      <label style={{ display:"block", fontSize:13, fontWeight:500, color:T.mutedLight, marginBottom:6 }}>{label}</label>
      <input type={type} placeholder={placeholder} value={value} onChange={e => onChange(e.target.value)}
        style={{ width:"100%", padding:"11px 14px", background:T.navyMid, border:`1px solid ${T.border}`, borderRadius:8, color:T.white, fontFamily:"inherit", fontSize:14, outline:"none", transition:"border .2s" }}
        onFocus={e => e.target.style.borderColor = T.indigo}
        onBlur={e => e.target.style.borderColor = T.border}
      />
    </div>
  );
}

// ─── AUTH MODAL ───────────────────────────────────────────────────────────────
function AuthModal({ onAuth, onClose }) {
  const [mode, setMode] = useState("login");
  const [form, setForm] = useState({ name:"", email:"", password:"" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handle = async () => {
    setError("");
    if (!form.email || !form.password) { setError("Fill in all fields."); return; }
    if (mode === "signup" && !form.name) { setError("Enter your name."); return; }
    setLoading(true);
    await new Promise(r => setTimeout(r, 1200));
    setLoading(false);
    onAuth({ name: form.name || form.email.split("@")[0], email: form.email, plan: null });
  };

  return (
    <div style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.85)", display:"flex", alignItems:"center", justifyContent:"center", zIndex:1000, animation:"fadeIn .2s ease", backdropFilter:"blur(8px)" }}>
      <div style={{ background:T.navyLight, border:`1px solid ${T.border}`, borderRadius:18, padding:"40px", width:"100%", maxWidth:420, animation:"fadeUp .3s ease", position:"relative" }}>
        <button onClick={onClose} style={{ position:"absolute", top:16, right:16, background:"none", border:"none", color:T.muted, fontSize:22, cursor:"pointer", lineHeight:1 }}>×</button>
        <div style={{ marginBottom:28 }}>
          <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:8 }}>
            <div style={{ width:32, height:32, background:T.indigo, borderRadius:8, display:"flex", alignItems:"center", justifyContent:"center", fontSize:16 }}>✂</div>
            <span style={{ fontFamily:"Syne", fontWeight:700, fontSize:18 }}>ClipForge</span>
          </div>
          <h2 style={{ fontFamily:"Syne", fontWeight:800, fontSize:26, marginBottom:6 }}>{mode === "login" ? "Welcome back" : "Create your account"}</h2>
          <p style={{ color:T.muted, fontSize:14 }}>{mode === "login" ? "Sign in to access your clips and projects." : "Start turning long videos into viral clips today."}</p>
        </div>
        <div style={{ display:"flex", gap:8, marginBottom:24 }}>
          {["login","signup"].map(m => (
            <button key={m} onClick={() => { setMode(m); setError(""); }} style={{ flex:1, padding:"8px", borderRadius:8, border:"none", cursor:"pointer", fontFamily:"inherit", fontWeight:600, fontSize:14, transition:"all .2s", background: mode === m ? T.indigo : T.navyMid, color: mode === m ? "#fff" : T.muted }}>
              {m === "login" ? "Sign In" : "Sign Up"}
            </button>
          ))}
        </div>
        {mode === "signup" && <InputField label="Full name" placeholder="Alex Johnson" value={form.name} onChange={v => setForm(f => ({ ...f, name:v }))} />}
        <InputField label="Email" placeholder="you@example.com" value={form.email} onChange={v => setForm(f => ({ ...f, email:v }))} type="email" />
        <InputField label="Password" placeholder="••••••••" value={form.password} onChange={v => setForm(f => ({ ...f, password:v }))} type="password" />
        {error && <p style={{ color:T.red, fontSize:13, marginBottom:16 }}>{error}</p>}
        <button onClick={handle} disabled={loading} style={{ width:"100%", padding:"14px", background:`linear-gradient(135deg, ${T.indigo}, #7C3AED)`, border:"none", borderRadius:10, color:"#fff", fontFamily:"inherit", fontWeight:700, fontSize:15, cursor: loading ? "not-allowed" : "pointer", opacity: loading ? 0.7 : 1, display:"flex", alignItems:"center", justifyContent:"center", gap:10, transition:"all .2s" }}>
          {loading ? <><Spinner size={18} color="#fff" /> Processing...</> : (mode === "login" ? "Sign In" : "Create Account")}
        </button>
        <p style={{ textAlign:"center", color:T.muted, fontSize:12, marginTop:20 }}>By continuing, you agree to our Terms of Service and Privacy Policy.</p>
      </div>
    </div>
  );
}

// ─── FILM STRIP DIVIDER ───────────────────────────────────────────────────────
function FilmStripDivider() {
  return (
    <div style={{ width:"100%", height:60, position:"relative", background:T.navyMid, overflow:"hidden", borderTop:`1px solid ${T.border}`, borderBottom:`1px solid ${T.border}`, display:"flex", alignItems:"center" }}>
      <div style={{ position:"absolute", left:0, right:0, top:0, height:"100%", display:"flex" }}>
        {Array.from({ length:24 }).map((_,i) => (
          <div key={i} style={{ width:"calc(100% / 24)", display:"flex", alignItems:"center", justifyContent:"center", borderRight:`1px solid rgba(255,255,255,0.05)` }}>
            <div style={{ width:12, height:10, borderRadius:2, background:T.navyLight, border:`1px solid rgba(255,255,255,0.08)` }} />
          </div>
        ))}
      </div>
      <div style={{ position:"absolute", top:0, bottom:0, width:"20%", background:`linear-gradient(90deg, transparent, rgba(79,70,229,0.2), transparent)`, animation:"scanLine 3s ease-in-out infinite" }} />
      <div style={{ position:"relative", zIndex:1, width:"100%", textAlign:"center", fontFamily:"JetBrains Mono", fontSize:11, color:T.muted, letterSpacing:2 }}>
        CLIPFORGE · AI VIDEO ENGINE · v2.4.1
      </div>
    </div>
  );
}

// ─── HOW IT WORKS ─────────────────────────────────────────────────────────────
function HowItWorks() {
  const steps = [
    { icon:"⬆", title:"Upload or paste", desc:"Drop any MP4, or paste a YouTube/Vimeo link. ClipForge handles the rest." },
    { icon:"🧠", title:"AI analyzes", desc:"Our model scans every second — detecting hooks, emotional peaks, and high-retention moments." },
    { icon:"✂", title:"10 clips extracted", desc:"The top 10 moments are cut, scored for virality, and given animated word-by-word subtitles." },
    { icon:"⬇", title:"Export everywhere", desc:"Download in 9:16 for TikTok, Reels, and Shorts — or share directly from your dashboard." },
  ];
  return (
    <div style={{ padding:"80px 40px", maxWidth:1100, margin:"0 auto" }}>
      <div style={{ textAlign:"center", marginBottom:56 }}>
        <p style={{ color:T.indigoLight, fontWeight:600, fontSize:13, letterSpacing:1, textTransform:"uppercase", marginBottom:12 }}>How it works</p>
        <h2 style={{ fontFamily:"Syne", fontWeight:800, fontSize:"clamp(28px, 4vw, 44px)", letterSpacing:-1 }}>From raw footage to<br />ready-to-post in minutes</h2>
      </div>
      <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit, minmax(220px, 1fr))", gap:24 }}>
        {steps.map((s,i) => (
          <div key={i} style={{ background:T.card, border:`1px solid ${T.border}`, borderRadius:14, padding:"28px 24px", animation:`fadeUp .5s ease ${i*0.1}s both`, transition:"border-color .2s, transform .2s" }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = T.borderHover; e.currentTarget.style.transform = "translateY(-4px)"; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = T.border; e.currentTarget.style.transform = "translateY(0)"; }}
          >
            <div style={{ fontSize:28, marginBottom:16 }}>{s.icon}</div>
            <h3 style={{ fontFamily:"Syne", fontWeight:700, fontSize:17, marginBottom:8 }}>{s.title}</h3>
            <p style={{ color:T.muted, fontSize:14, lineHeight:1.6 }}>{s.desc}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── PRICING ──────────────────────────────────────────────────────────────────
function PricingSection({ onAuthClick, onSelectPlan }) {
  return (
    <div style={{ padding:"80px 40px", maxWidth:1100, margin:"0 auto" }}>
      <div style={{ textAlign:"center", marginBottom:56 }}>
        <p style={{ color:T.indigoLight, fontWeight:600, fontSize:13, letterSpacing:1, textTransform:"uppercase", marginBottom:12 }}>Pricing</p>
        <h2 style={{ fontFamily:"Syne", fontWeight:800, fontSize:"clamp(28px, 4vw, 44px)", letterSpacing:-1 }}>Simple, transparent pricing</h2>
      </div>
      <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit, minmax(260px, 1fr))", gap:24 }}>
        {PLANS.map(plan => (
          <div key={plan.id} style={{ background: plan.highlight ? `linear-gradient(135deg, ${T.indigoDim}, rgba(124,58,237,0.12))` : T.card, border:`1px solid ${plan.highlight ? T.indigo : T.border}`, borderRadius:16, padding:"32px 28px", position:"relative", transition:"transform .2s" }}
            onMouseEnter={e => e.currentTarget.style.transform = "translateY(-4px)"}
            onMouseLeave={e => e.currentTarget.style.transform = "translateY(0)"}
          >
            {plan.badge && <div style={{ position:"absolute", top:-12, left:"50%", transform:"translateX(-50%)", background:T.indigo, color:"#fff", fontSize:11, fontWeight:700, padding:"4px 14px", borderRadius:20, letterSpacing:0.5 }}>{plan.badge}</div>}
            <h3 style={{ fontFamily:"Syne", fontWeight:800, fontSize:22, marginBottom:8 }}>{plan.name}</h3>
            <div style={{ display:"flex", alignItems:"baseline", gap:4, marginBottom:20 }}>
              <span style={{ fontFamily:"Syne", fontWeight:800, fontSize:42 }}>${plan.price}</span>
              <span style={{ color:T.muted, fontSize:14 }}>/{plan.period}</span>
            </div>
            <div style={{ borderTop:`1px solid ${T.border}`, paddingTop:20, marginBottom:24 }}>
              {plan.features.map(f => (
                <div key={f} style={{ display:"flex", alignItems:"center", gap:10, marginBottom:10 }}>
                  <span style={{ color:T.green, fontSize:14 }}>✓</span>
                  <span style={{ color:T.mutedLight, fontSize:14 }}>{f}</span>
                </div>
              ))}
            </div>
            <button onClick={onSelectPlan ? () => onSelectPlan(plan) : onAuthClick} style={{ width:"100%", padding:"13px", background: plan.highlight ? `linear-gradient(135deg, ${T.indigo}, #7C3AED)` : "none", border:`1px solid ${plan.highlight ? "transparent" : T.border}`, color: plan.highlight ? "#fff" : T.mutedLight, borderRadius:10, fontFamily:"inherit", fontWeight:700, fontSize:14, cursor:"pointer", transition:"all .2s" }}>
              {plan.cta}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── LANDING PAGE ─────────────────────────────────────────────────────────────
function LandingPage({ onAuthClick, onTryDemo }) {
  const stats = [
    { value:"10x", label:"faster than manual editing" },
    { value:"97%", label:"average viral score accuracy" },
    { value:"2.3M", label:"clips generated this month" },
  ];
  return (
    <div style={{ animation:"fadeIn .4s ease" }}>
      <div style={{ textAlign:"center", padding:"100px 24px 80px", maxWidth:860, margin:"0 auto" }}>
        <div style={{ display:"inline-flex", alignItems:"center", gap:8, background:T.indigoDim, border:`1px solid rgba(99,102,241,0.3)`, color:T.indigoLight, padding:"6px 16px", borderRadius:20, fontSize:12, fontWeight:600, letterSpacing:"0.6px", textTransform:"uppercase", marginBottom:32 }}>
          <span style={{ width:6, height:6, background:T.green, borderRadius:"50%", animation:"shimmer 2s infinite" }} />
          AI-Powered · Auto Subtitles · Viral Scoring
        </div>
        <h1 style={{ fontFamily:"Syne", fontWeight:800, fontSize:"clamp(40px, 7vw, 76px)", lineHeight:1.02, letterSpacing:"-3px", marginBottom:24 }}>
          Your long video.{" "}
          <span style={{ background:`linear-gradient(135deg, ${T.indigo} 0%, #A855F7 50%, ${T.indigoLight} 100%)`, WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent", backgroundSize:"200% 200%", animation:"filmStrip 4s ease infinite" }}>
            10 viral clips.
          </span>{" "}
          Zero effort.
        </h1>
        <p style={{ color:T.mutedLight, fontSize:19, lineHeight:1.6, maxWidth:560, margin:"0 auto 40px" }}>
          Drop your podcast, webinar, or livestream. ClipForge's AI finds the best moments, adds animated subtitles, and exports 10 ready-to-post shorts.
        </p>
        <div style={{ display:"flex", gap:14, justifyContent:"center", flexWrap:"wrap" }}>
          <button onClick={onTryDemo} style={{ background:`linear-gradient(135deg, ${T.indigo}, #7C3AED)`, border:"none", color:"#fff", padding:"16px 36px", borderRadius:12, fontFamily:"inherit", fontWeight:700, fontSize:16, cursor:"pointer", boxShadow:`0 0 40px rgba(79,70,229,0.4)`, animation:"pulse 2.5s infinite", transition:"transform .2s" }}
            onMouseEnter={e => e.target.style.transform = "translateY(-2px)"}
            onMouseLeave={e => e.target.style.transform = "translateY(0)"}
          >
            Try ClipForge Free →
          </button>
          <button onClick={onAuthClick} style={{ background:"none", border:`1px solid ${T.border}`, color:T.mutedLight, padding:"16px 28px", borderRadius:12, fontFamily:"inherit", fontWeight:500, fontSize:16, cursor:"pointer", transition:"all .2s" }}
            onMouseEnter={e => { e.target.style.borderColor = T.indigo; e.target.style.color = T.white; }}
            onMouseLeave={e => { e.target.style.borderColor = T.border; e.target.style.color = T.mutedLight; }}
          >
            Sign In
          </button>
        </div>
        <div style={{ display:"flex", gap:40, justifyContent:"center", marginTop:64, flexWrap:"wrap" }}>
          {stats.map(s => (
            <div key={s.value} style={{ textAlign:"center" }}>
              <div style={{ fontFamily:"Syne", fontWeight:800, fontSize:36, color:T.white }}>{s.value}</div>
              <div style={{ color:T.muted, fontSize:13, marginTop:4 }}>{s.label}</div>
            </div>
          ))}
        </div>
      </div>
      <FilmStripDivider />
      <HowItWorks />
      <PricingSection onAuthClick={onAuthClick} />
    </div>
  );
}

// ─── CLIP CARD ────────────────────────────────────────────────────────────────
function ClipCard({ clip, onDownload, locked }) {
  const [subtitleIdx, setSubtitleIdx] = useState(0);
  const [playing, setPlaying] = useState(false);

  useEffect(() => {
    if (!playing) return;
    const t = setInterval(() => setSubtitleIdx(i => (i + 1) % clip.subtitles.length), 900);
    return () => clearInterval(t);
  }, [playing, clip.subtitles.length]);

  const scoreColor = clip.viralScore >= 85 ? T.green : clip.viralScore >= 70 ? T.amber : T.red;

  return (
    <div style={{ background:T.card, border:`1px solid ${T.border}`, borderRadius:16, overflow:"hidden", transition:"border-color .2s, transform .2s", position:"relative" }}
      onMouseEnter={e => { e.currentTarget.style.borderColor = T.borderHover; e.currentTarget.style.transform = "translateY(-3px)"; }}
      onMouseLeave={e => { e.currentTarget.style.borderColor = T.border; e.currentTarget.style.transform = "translateY(0)"; }}
    >
      {locked && (
        <div style={{ position:"absolute", inset:0, background:"rgba(8,8,16,0.85)", zIndex:10, display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", gap:12, backdropFilter:"blur(4px)", borderRadius:16 }}>
          <div style={{ fontSize:32 }}>🔒</div>
          <p style={{ color:T.mutedLight, fontSize:13, textAlign:"center", maxWidth:160 }}>Upgrade to Pro to unlock this clip</p>
        </div>
      )}
      {/* Video preview area */}
      <div style={{ aspectRatio:"9/16", maxHeight:240, background:`linear-gradient(160deg, ${clip.colors[0]}, ${clip.colors[1]})`, position:"relative", display:"flex", alignItems:"flex-end", justifyContent:"center", cursor:"pointer", overflow:"hidden" }}
        onClick={() => setPlaying(p => !p)}
      >
        <div style={{ position:"absolute", inset:0, display:"flex", alignItems:"center", justifyContent:"center" }}>
          <div style={{ width:48, height:48, background:"rgba(255,255,255,0.1)", borderRadius:"50%", display:"flex", alignItems:"center", justifyContent:"center", fontSize:18, backdropFilter:"blur(4px)" }}>
            {playing ? "⏸" : "▶"}
          </div>
        </div>
        {playing && (
          <div style={{ position:"absolute", bottom:16, left:12, right:12, textAlign:"center" }}>
            {clip.subtitles.map((line, i) => (
              <div key={i} style={{ fontSize:13, fontWeight:700, color:"#fff", textShadow:"0 2px 8px rgba(0,0,0,0.9)", lineHeight:1.5, opacity: i === subtitleIdx ? 1 : 0.2, transition:"opacity .3s", animation: i === subtitleIdx ? "subtitleFade .3s ease" : "none" }}>
                {line}
              </div>
            ))}
          </div>
        )}
        <div style={{ position:"absolute", top:10, right:10, background:"rgba(0,0,0,0.7)", borderRadius:6, padding:"3px 8px", fontSize:11, fontFamily:"JetBrains Mono", color:T.mutedLight }}>
          {clip.duration}
        </div>
        <div style={{ position:"absolute", top:10, left:10, background:"rgba(0,0,0,0.7)", borderRadius:6, padding:"3px 8px", fontSize:10, color:T.indigoLight, fontWeight:600 }}>
          {clip.platform}
        </div>
      </div>
      {/* Info */}
      <div style={{ padding:"16px" }}>
        <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:10 }}>
          <span style={{ fontFamily:"JetBrains Mono", fontSize:11, color:T.muted }}>#{clip.id} · {clip.startTime}</span>
          <div style={{ display:"flex", alignItems:"center", gap:5 }}>
            <div style={{ width:6, height:6, background:scoreColor, borderRadius:"50%", animation:"shimmer 2s infinite" }} />
            <span style={{ fontFamily:"Syne", fontWeight:700, fontSize:14, color:scoreColor }}>{clip.viralScore}</span>
          </div>
        </div>
        <p style={{ fontSize:13, fontWeight:500, color:T.white, lineHeight:1.5, marginBottom:12, display:"-webkit-box", WebkitLineClamp:2, WebkitBoxOrient:"vertical", overflow:"hidden" }}>{clip.hook}</p>
        <div style={{ display:"flex", flexWrap:"wrap", gap:6, marginBottom:14 }}>
          {clip.tags.map(tag => (
            <span key={tag} style={{ background:T.indigoDim, color:T.indigoLight, fontSize:10, padding:"3px 8px", borderRadius:20, fontWeight:600 }}>#{tag}</span>
          ))}
        </div>
        <button onClick={() => onDownload(clip)} style={{ width:"100%", padding:"9px", background:`linear-gradient(135deg, ${T.indigo}, #7C3AED)`, border:"none", borderRadius:8, color:"#fff", fontFamily:"inherit", fontWeight:600, fontSize:13, cursor:"pointer" }}>
          ⬇ Download
        </button>
      </div>
    </div>
  );
}

// ─── PROCESSING SCREEN ────────────────────────────────────────────────────────
function ProcessingScreen({ videoName, onComplete }) {
  const [progress, setProgress] = useState(0);
  const [stage, setStage] = useState(0);

  const stages = [
    "Analyzing video structure...",
    "Detecting high-retention moments...",
    "Scoring viral potential...",
    "Extracting top 10 clips...",
    "Generating animated subtitles...",
    "Finalizing exports...",
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress(p => {
        if (p >= 100) { clearInterval(interval); setTimeout(onComplete, 500); return 100; }
        const next = p + (Math.random() * 3 + 0.5);
        setStage(Math.floor((next / 100) * stages.length));
        return Math.min(next, 100);
      });
    }, 120);
    return () => clearInterval(interval);
  }, [onComplete]);

  return (
    <div style={{ display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", minHeight:"60vh", padding:40, animation:"fadeIn .4s ease" }}>
      <div style={{ width:80, height:80, background:T.indigoDim, borderRadius:20, display:"flex", alignItems:"center", justifyContent:"center", fontSize:36, marginBottom:32, border:`1px solid rgba(99,102,241,0.3)` }}>✂</div>
      <h2 style={{ fontFamily:"Syne", fontWeight:800, fontSize:28, marginBottom:8, textAlign:"center" }}>Processing your video</h2>
      <p style={{ color:T.muted, fontSize:14, marginBottom:40, textAlign:"center" }}>{videoName}</p>
      <div style={{ width:"100%", maxWidth:480 }}>
        <div style={{ display:"flex", justifyContent:"space-between", marginBottom:8 }}>
          <span style={{ color:T.mutedLight, fontSize:13 }}>{stages[Math.min(stage, stages.length - 1)]}</span>
          <span style={{ fontFamily:"JetBrains Mono", fontSize:13, color:T.indigoLight }}>{Math.round(progress)}%</span>
        </div>
        <div style={{ height:6, background:T.navyMid, borderRadius:3, overflow:"hidden" }}>
          <div style={{ height:"100%", width:`${progress}%`, background:`linear-gradient(90deg, ${T.indigo}, #A855F7)`, borderRadius:3, transition:"width .2s ease" }} />
        </div>
        <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:12, marginTop:32 }}>
          {stages.slice(0,3).map((s,i) => (
            <div key={i} style={{ background:T.card, border:`1px solid ${T.border}`, borderRadius:10, padding:"12px", textAlign:"center" }}>
              <div style={{ fontSize:20, marginBottom:6 }}>{"🔍🎯✂"[i]}</div>
              <div style={{ fontSize:11, color:T.muted, lineHeight:1.4 }}>{s.replace("...", "")}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── DASHBOARD ────────────────────────────────────────────────────────────────
function Dashboard({ user, onUpgrade, onLogout }) {
  const [view, setView] = useState("upload"); // upload | processing | gallery | pricing
  const [videoName, setVideoName] = useState("");
  const [urlInput, setUrlInput] = useState("");
  const [clips, setClips] = useState([]);
  const [toast, setToast] = useState(null);
  const fileInputRef = useRef(null);
  const hasPro = user.plan === "pro" || user.plan === "agency";

  const handleUpload = (name) => {
    setVideoName(name);
    setView("processing");
  };

  const handleProcessingComplete = () => {
    setClips(generateClips());
    setView("gallery");
  };

  const handleDownload = (clip) => {
    if (!hasPro && clip.id > 3) {
      setToast({ message: "Upgrade to Pro to download all clips!", type: "warning" });
      return;
    }
    setToast({ message: `Clip #${clip.id} download started!`, type: "success" });
  };

  return (
    <div style={{ minHeight:"100vh", display:"flex", flexDirection:"column" }}>
      {/* NAV */}
      <nav style={{ padding:"16px 32px", borderBottom:`1px solid ${T.border}`, display:"flex", alignItems:"center", justifyContent:"space-between", background:T.navy, position:"sticky", top:0, zIndex:100 }}>
        <div style={{ display:"flex", alignItems:"center", gap:10 }}>
          <div style={{ width:32, height:32, background:T.indigo, borderRadius:8, display:"flex", alignItems:"center", justifyContent:"center", fontSize:16 }}>✂</div>
          <span style={{ fontFamily:"Syne", fontWeight:700, fontSize:18 }}>ClipForge</span>
        </div>
        <div style={{ display:"flex", alignItems:"center", gap:16 }}>
          {["upload","gallery","pricing"].map(v => view !== "processing" && (
            <button key={v} onClick={() => v === "gallery" && clips.length === 0 ? null : setView(v)} style={{ background:"none", border:"none", color: view === v ? T.white : T.muted, fontFamily:"inherit", fontWeight:500, fontSize:14, cursor:"pointer", textTransform:"capitalize", transition:"color .2s" }}>
              {v === "upload" ? "Upload" : v === "gallery" ? `Clips${clips.length > 0 ? ` (${clips.length})` : ""}` : "Pricing"}
            </button>
          ))}
          <div style={{ display:"flex", alignItems:"center", gap:10, paddingLeft:16, borderLeft:`1px solid ${T.border}` }}>
            <div style={{ width:32, height:32, background:T.indigoDim, borderRadius:"50%", display:"flex", alignItems:"center", justifyContent:"center", fontSize:13, fontWeight:700, color:T.indigoLight }}>{user.name[0].toUpperCase()}</div>
            <div>
              <div style={{ fontSize:13, fontWeight:600 }}>{user.name}</div>
              {user.plan && <div style={{ fontSize:10, color:T.green, fontWeight:600, textTransform:"uppercase" }}>{user.plan}</div>}
            </div>
            <button onClick={onLogout} style={{ background:"none", border:`1px solid ${T.border}`, color:T.muted, padding:"5px 12px", borderRadius:6, fontFamily:"inherit", fontSize:12, cursor:"pointer" }}>Log out</button>
          </div>
        </div>
      </nav>

      {/* CONTENT */}
      <div style={{ flex:1 }}>
        {view === "upload" && (
          <div style={{ padding:"60px 40px", maxWidth:700, margin:"0 auto", animation:"fadeIn .4s ease" }}>
            <h2 style={{ fontFamily:"Syne", fontWeight:800, fontSize:32, marginBottom:8 }}>New project</h2>
            <p style={{ color:T.muted, marginBottom:40 }}>Upload a video file or paste a URL to get started.</p>
            {/* Drop zone */}
            <div
              style={{ border:`2px dashed ${T.border}`, borderRadius:16, padding:"60px 40px", textAlign:"center", cursor:"pointer", transition:"border-color .2s, background .2s", marginBottom:24, background:T.navyMid }}
              onClick={() => fileInputRef.current?.click()}
              onDragOver={e => { e.preventDefault(); e.currentTarget.style.borderColor = T.indigo; }}
              onDragLeave={e => e.currentTarget.style.borderColor = T.border}
              onDrop={e => { e.preventDefault(); e.currentTarget.style.borderColor = T.border; const f = e.dataTransfer.files[0]; if (f) handleUpload(f.name); }}
            >
              <div style={{ fontSize:40, marginBottom:16 }}>🎬</div>
              <p style={{ fontFamily:"Syne", fontWeight:700, fontSize:18, marginBottom:8 }}>Drop your video here</p>
              <p style={{ color:T.muted, fontSize:14 }}>MP4, MOV, AVI up to 10GB</p>
              <input ref={fileInputRef} type="file" accept="video/*" style={{ display:"none" }} onChange={e => e.target.files[0] && handleUpload(e.target.files[0].name)} />
            </div>
            <div style={{ display:"flex", gap:12, alignItems:"center" }}>
              <div style={{ flex:1, height:1, background:T.border }} />
              <span style={{ color:T.muted, fontSize:13 }}>or paste a URL</span>
              <div style={{ flex:1, height:1, background:T.border }} />
            </div>
            <div style={{ display:"flex", gap:10, marginTop:24 }}>
              <input value={urlInput} onChange={e => setUrlInput(e.target.value)} placeholder="https://youtube.com/watch?v=..." style={{ flex:1, padding:"12px 16px", background:T.navyMid, border:`1px solid ${T.border}`, borderRadius:10, color:T.white, fontFamily:"inherit", fontSize:14, outline:"none" }}
                onFocus={e => e.target.style.borderColor = T.indigo}
                onBlur={e => e.target.style.borderColor = T.border}
              />
              <button onClick={() => urlInput && handleUpload(urlInput)} style={{ padding:"12px 24px", background:`linear-gradient(135deg, ${T.indigo}, #7C3AED)`, border:"none", borderRadius:10, color:"#fff", fontFamily:"inherit", fontWeight:600, fontSize:14, cursor:"pointer" }}>
                Process
              </button>
            </div>
          </div>
        )}

        {view === "processing" && (
          <ProcessingScreen videoName={videoName} onComplete={handleProcessingComplete} />
        )}

        {view === "gallery" && (
          <div style={{ padding:"40px", maxWidth:1200, margin:"0 auto", animation:"fadeIn .4s ease" }}>
            <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:32, flexWrap:"wrap", gap:16 }}>
              <div>
                <h2 style={{ fontFamily:"Syne", fontWeight:800, fontSize:28, marginBottom:4 }}>Your clips</h2>
                <p style={{ color:T.muted, fontSize:14 }}>{clips.length} clips generated · sorted by viral score</p>
              </div>
              {!hasPro && (
                <div style={{ background:T.indigoDim, border:`1px solid rgba(99,102,241,0.3)`, borderRadius:10, padding:"12px 20px", display:"flex", alignItems:"center", gap:12 }}>
                  <span style={{ fontSize:13, color:T.mutedLight }}>🔒 7 clips locked</span>
                  <button onClick={() => setView("pricing")} style={{ background:`linear-gradient(135deg, ${T.indigo}, #7C3AED)`, border:"none", color:"#fff", padding:"7px 16px", borderRadius:7, fontFamily:"inherit", fontWeight:600, fontSize:12, cursor:"pointer" }}>
                    Upgrade to Pro
                  </button>
                </div>
              )}
            </div>
            <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill, minmax(200px, 1fr))", gap:20 }}>
              {clips.map(clip => (
                <ClipCard key={clip.id} clip={clip} onDownload={handleDownload} locked={!hasPro && clip.id > 3} />
              ))}
            </div>
          </div>
        )}

        {view === "pricing" && (
          <PricingSection onSelectPlan={(plan) => {
            onUpgrade(plan);
            setToast({ message: `Upgraded to ${plan.name}!`, type: "success" });
            setView("gallery");
          }} />
        )}
      </div>

      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  );
}

// ─── ROOT ─────────────────────────────────────────────────────────────────────
export default function ClipForge() {
  const [user, setUser] = useState(null);
  const [showAuth, setShowAuth] = useState(false);
  const [toast, setToast] = useState(null);

  return (
    <>
      <style>{GLOBAL_CSS}</style>
      <div className="clipforge-wrapper">
        {!user ? (
          <>
            {/* Top nav */}
            <nav style={{ padding:"16px 32px", display:"flex", alignItems:"center", justifyContent:"space-between", borderBottom:`1px solid ${T.border}`, position:"sticky", top:0, background:T.obsidian, zIndex:100 }}>
              <div style={{ display:"flex", alignItems:"center", gap:10 }}>
                <div style={{ width:32, height:32, background:T.indigo, borderRadius:8, display:"flex", alignItems:"center", justifyContent:"center", fontSize:16 }}>✂</div>
                <span style={{ fontFamily:"Syne", fontWeight:700, fontSize:18 }}>ClipForge</span>
              </div>
              <button onClick={() => setShowAuth(true)} style={{ background:`linear-gradient(135deg, ${T.indigo}, #7C3AED)`, border:"none", color:"#fff", padding:"9px 22px", borderRadius:9, fontFamily:"inherit", fontWeight:600, fontSize:14, cursor:"pointer" }}>
                Get Started
              </button>
            </nav>
            <LandingPage
              onAuthClick={() => setShowAuth(true)}
              onTryDemo={() => {
                setUser({ name: "Demo User", email: "demo@clipforge.ai", plan: null });
                setToast({ message: "Welcome to ClipForge! Upload a video to start.", type: "success" });
              }}
            />
            {showAuth && (
              <AuthModal
                onAuth={(u) => { setUser(u); setShowAuth(false); setToast({ message: `Welcome back, ${u.name}!`, type: "success" }); }}
                onClose={() => setShowAuth(false)}
              />
            )}
          </>
        ) : (
          <Dashboard
            user={user}
            onUpgrade={(plan) => setUser(u => ({ ...u, plan: plan.id }))}
            onLogout={() => { setUser(null); setToast({ message: "Logged out successfully.", type: "success" }); }}
          />
        )}
        {toast && !user && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
      </div>
    </>
  );
}
