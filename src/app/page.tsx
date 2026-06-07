"use client";
import { useState, useRef } from "react";

const COLORS = [
  "#FF6B6B", "#FFD93D", "#6BCB77", "#4D96FF",
  "#FF922B", "#CC5DE8", "#20C997", "#F06595",
  "#74C0FC", "#A9E34B"
];

const EMOJI_REACTIONS = ["😱", "🤑", "😂", "💀", "🎉", "😤", "🥲", "👑"];
function getRandomEmoji() {
  return EMOJI_REACTIONS[Math.floor(Math.random() * EMOJI_REACTIONS.length)];
}

const MODES = [
  { id: "with_zero_hundred", label: "0・100%あり", desc: "誰かが全額 or タダになる可能性あり", icon: "🎲", color: "#FF6B6B" },
  { id: "without_zero_hundred", label: "0・100%なし", desc: "最低5%〜最大95%の範囲でランダム", icon: "⚖️", color: "#4D96FF" },
  { id: "max20", label: "不平等幅20%まで", desc: "均等に近い。最大差が20%以内", icon: "🤝", color: "#6BCB77" },
  { id: "omakase", label: "おまかせ", desc: "上3種からランダムで選ばれる…何が起きるか不明", icon: "🎰", color: "#FFD93D" },
];

function generateWeights(n: number, modeId: string): { ratios: number[]; effectiveMode: string } {
  let effectiveMode = modeId;
  if (modeId === "omakase") {
    const pool = ["with_zero_hundred", "without_zero_hundred", "max20"];
    effectiveMode = pool[Math.floor(Math.random() * pool.length)];
  }
  let weights: number[];
  if (effectiveMode === "with_zero_hundred") {
    weights = Array.from({ length: n }, () => Math.random());
    if (Math.random() < 0.3) {
      const idx = Math.floor(Math.random() * n);
      weights[idx] = Math.random() < 0.5 ? 0 : 100;
    }
  } else if (effectiveMode === "without_zero_hundred") {
    let attempts = 0;
    do {
      weights = Array.from({ length: n }, () => 0.2 + Math.random() * 1.8);
      const total = weights.reduce((a, b) => a + b, 0);
      weights = weights.map(w => w / total);
      attempts++;
    } while (attempts < 50 && weights.some(w => w < 0.05 || w > 0.95));
  } else {
    const base = 1 / n;
    const maxDelta = Math.min(0.10, base * 0.8);
    weights = Array.from({ length: n }, () => base + (Math.random() * 2 - 1) * maxDelta);
    weights = weights.map(w => Math.max(0.01, w));
  }
  const total = weights!.reduce((a, b) => a + b, 0);
  return { ratios: weights!.map(w => w / total), effectiveMode };
}

function getSegments(ratios: number[]) {
  let angle = 0;
  return ratios.map((r, i) => {
    const start = angle;
    const end = angle + r * 360;
    angle = end;
    return { start, end, ratio: r, index: i };
  });
}

function polarToCartesian(cx: number, cy: number, r: number, angleDeg: number) {
  const rad = ((angleDeg - 90) * Math.PI) / 180;
  return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) };
}

function describeArc(cx: number, cy: number, r: number, startAngle: number, endAngle: number) {
  const start = polarToCartesian(cx, cy, r, endAngle);
  const end = polarToCartesian(cx, cy, r, startAngle);
  const largeArc = endAngle - startAngle > 180 ? 1 : 0;
  return `M ${cx} ${cy} L ${start.x} ${start.y} A ${r} ${r} 0 ${largeArc} 0 ${end.x} ${end.y} Z`;
}

function RouletteWheel({ segments, names, rotation, spinning }: { segments: ReturnType<typeof getSegments>; names: string[]; rotation: number; spinning: boolean }) {
  const cx = 160, cy = 160, r = 145;
  return (
    <div style={{ position: "relative", width: 320, height: 320, margin: "0 auto" }}>
      <div style={{ position: "absolute", inset: -8, borderRadius: "50%", background: spinning ? "conic-gradient(from 0deg, #FF6B6B, #FFD93D, #6BCB77, #4D96FF, #FF6B6B)" : "rgba(255,255,255,0.1)", animation: spinning ? "spin-glow 0.5s linear infinite" : "none", filter: "blur(8px)", zIndex: 0 }} />
      <svg width={320} height={320} style={{ transform: `rotate(${rotation}deg)`, transition: spinning ? "none" : "transform 0s", position: "relative", zIndex: 1, filter: "drop-shadow(0 8px 32px rgba(0,0,0,0.5))" }}>
        {segments.map((seg, i) => (
          <g key={i}>
            <path d={describeArc(cx, cy, r, seg.start, seg.end)} fill={COLORS[i % COLORS.length]} stroke="#1a1a2e" strokeWidth={2} />
            {(() => {
              const midAngle = (seg.start + seg.end) / 2;
              const pos = polarToCartesian(cx, cy, r * 0.62, midAngle);
              const fs = seg.ratio > 0.15 ? 13 : seg.ratio > 0.08 ? 10 : 8;
              return <text x={pos.x} y={pos.y} textAnchor="middle" dominantBaseline="middle" fill="white" fontSize={fs} fontWeight="800" fontFamily="'Noto Sans JP', sans-serif" transform={`rotate(${midAngle}, ${pos.x}, ${pos.y})`}>{names[i]?.substring(0, 4) || `P${i + 1}`}</text>;
            })()}
          </g>
        ))}
        <circle cx={cx} cy={cy} r={18} fill="#1a1a2e" stroke="white" strokeWidth={3} />
        <circle cx={cx} cy={cy} r={8} fill="white" />
      </svg>
      <div style={{ position: "absolute", top: "50%", right: -6, transform: "translateY(-50%)", zIndex: 10, fontSize: 28, filter: "drop-shadow(0 2px 4px rgba(0,0,0,0.8))" }}>◀</div>
    </div>
  );
}

export default function App() {
  const [step, setStep] = useState("setup");
  const [totalAmount, setTotalAmount] = useState("");
  const [names, setNames] = useState(["田中", "佐藤", "鈴木", "山田"]);
  const [newName, setNewName] = useState("");
  const [selectedMode, setSelectedMode] = useState("omakase");
  const [ratios, setRatios] = useState<number[]>([]);
  const [usedMode, setUsedMode] = useState<string | null>(null);
  const [rotation, setRotation] = useState(0);
  const [spinning, setSpinning] = useState(false);
  const animFrameRef = useRef<number | null>(null);
  const startTimeRef = useRef<number | null>(null);

  const segments = getSegments(ratios.length > 0 ? ratios : names.map(() => 1 / names.length));
  const addName = () => {
    const n = newName.trim();
    if (n && names.length < 10 && !names.includes(n)) { setNames([...names, n]); setNewName(""); }
  };
  const removeName = (i: number) => setNames(names.filter((_, idx) => idx !== i));

  const spin = () => {
    if (spinning || names.length < 2) return;
    const { ratios: generated, effectiveMode } = generateWeights(names.length, selectedMode);
    setRatios(generated); setUsedMode(effectiveMode); setStep("spinning"); setSpinning(true);
    const totalRotation = 1440 + Math.random() * 720;
    const targetRot = rotation + totalRotation;
    const duration = 3500 + Math.random() * 1000;
    startTimeRef.current = null;
    const easeOut = (t: number) => 1 - Math.pow(1 - t, 4);
    const animate = (timestamp: number) => {
      if (!startTimeRef.current) startTimeRef.current = timestamp;
      const elapsed = timestamp - startTimeRef.current;
      const progress = Math.min(elapsed / duration, 1);
      setRotation(rotation + totalRotation * easeOut(progress));
      if (progress < 1) { animFrameRef.current = requestAnimationFrame(animate); }
      else { setRotation(targetRot); setSpinning(false); setStep("result"); }
    };
    animFrameRef.current = requestAnimationFrame(animate);
  };

  const reset = () => { setStep("setup"); setRatios([]); setUsedMode(null); setRotation(0); };
  const amounts = ratios.map(r => Math.round(Number(totalAmount) * r));
  const revealedMode = usedMode ? MODES.find(m => m.id === usedMode) : null;

  return (
    <div style={{ minHeight: "100vh", background: "linear-gradient(135deg, #0f0c29, #302b63, #24243e)", fontFamily: "'Noto Sans JP', sans-serif", color: "white", overflowX: "hidden" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Noto+Sans+JP:wght@400;700;900&family=Bebas+Neue&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        @keyframes spin-glow { to { transform: rotate(360deg); } }
        @keyframes pop-in { from { transform: scale(0.5) translateY(20px); opacity: 0; } to { transform: scale(1) translateY(0); opacity: 1; } }
        @keyframes float { 0%,100% { transform: translateY(0); } 50% { transform: translateY(-6px); } }
        @keyframes reveal { from { transform: scale(0.8); opacity: 0; } to { transform: scale(1); opacity: 1; } }
        .card-item { animation: pop-in 0.4s cubic-bezier(0.34,1.56,0.64,1) both; }
        .spin-btn { background: linear-gradient(135deg, #FF6B6B, #FF922B); border: none; color: white; font-size: 20px; font-weight: 900; padding: 18px 40px; border-radius: 50px; cursor: pointer; font-family: 'Bebas Neue', sans-serif; letter-spacing: 3px; box-shadow: 0 8px 32px rgba(255,107,107,0.5); transition: transform 0.15s; animation: float 3s ease-in-out infinite; }
        .spin-btn:active { transform: scale(0.95); }
        .spin-btn:disabled { opacity: 0.5; animation: none; }
        .result-amount { font-family: 'Bebas Neue', sans-serif; letter-spacing: 2px; }
        .mode-card { border-radius: 14px; padding: 12px 14px; cursor: pointer; border: 2px solid transparent; transition: border-color 0.2s, background 0.2s, transform 0.15s; display: flex; align-items: center; gap: 12px; }
        .mode-card:active { transform: scale(0.97); }
        input[type="text"], input[type="number"] { background: rgba(255,255,255,0.08); border: 1.5px solid rgba(255,255,255,0.15); border-radius: 12px; color: white; font-size: 16px; padding: 12px 16px; outline: none; font-family: 'Noto Sans JP', sans-serif; transition: border-color 0.2s; }
        input:focus { border-color: rgba(255,255,255,0.5); }
        input::placeholder { color: rgba(255,255,255,0.3); }
      `}</style>
      <div style={{ textAlign: "center", padding: "32px 20px 16px" }}>
        <div style={{ fontSize: 11, letterSpacing: 4, color: "rgba(255,255,255,0.4)", marginBottom: 6 }}>SPLIT THE BILL</div>
        <h1 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 38, letterSpacing: 4, background: "linear-gradient(135deg, #FF6B6B, #FFD93D, #6BCB77)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", lineHeight: 1 }}>不平等割り勘</h1>
        <div style={{ fontSize: 11, letterSpacing: 2, color: "rgba(255,255,255,0.3)", marginTop: 4 }}>ROULETTE</div>
      </div>
      {step === "setup" && (
        <div style={{ padding: "0 20px 48px", maxWidth: 480, margin: "0 auto" }}>
          <div style={{ marginBottom: 24 }}>
            <div style={{ fontSize: 12, color: "rgba(255,255,255,0.5)", marginBottom: 8, letterSpacing: 2 }}>合計金額</div>
            <div style={{ position: "relative" }}>
              <input type="number" placeholder="例: 25000" value={totalAmount} onChange={e => setTotalAmount(e.target.value)} style={{ width: "100%", paddingRight: 40, fontSize: 24, fontWeight: 700 }} />
              <span style={{ position: "absolute", right: 16, top: "50%", transform: "translateY(-50%)", color: "rgba(255,255,255,0.4)", fontSize: 16 }}>円</span>
            </div>
          </div>
          <div style={{ marginBottom: 28 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
              <div style={{ fontSize: 12, color: "rgba(255,255,255,0.5)", letterSpacing: 2 }}>参加者</div>
              <div style={{ fontSize: 12, color: "rgba(255,255,255,0.3)", background: "rgba(255,255,255,0.06)", padding: "3px 10px", borderRadius: 20 }}>{names.length} / 10人</div>
            </div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 12 }}>
              {names.map((name, i) => (
                <div key={i} className="card-item" style={{ background: COLORS[i % COLORS.length] + "33", border: `1.5px solid ${COLORS[i % COLORS.length]}66`, borderRadius: 50, padding: "7px 14px", fontSize: 14, fontWeight: 700, display: "flex", alignItems: "center", gap: 8, animationDelay: `${i * 0.05}s` }}>
                  <span style={{ width: 8, height: 8, borderRadius: "50%", background: COLORS[i % COLORS.length], flexShrink: 0 }} />
                  {name}
                  <button onClick={() => removeName(i)} style={{ background: "none", border: "none", color: "rgba(255,255,255,0.4)", cursor: "pointer", fontSize: 16, padding: 0, lineHeight: 1, marginLeft: 2 }}>×</button>
                </div>
              ))}
            </div>
            {names.length < 10 && (
              <div style={{ display: "flex", gap: 8 }}>
                <input type="text" placeholder="名前を追加" value={newName} onChange={e => setNewName(e.target.value)} onKeyDown={e => e.key === "Enter" && addName()} style={{ flex: 1 }} />
                <button onClick={addName} style={{ background: "rgba(255,255,255,0.1)", border: "1.5px solid rgba(255,255,255,0.2)", borderRadius: 12, color: "white", fontSize: 22, width: 48, height: 48, cursor: "pointer", flexShrink: 0 }}>+</button>
              </div>
            )}
          </div>
          <div style={{ marginBottom: 32 }}>
            <div style={{ fontSize: 12, color: "rgba(255,255,255,0.5)", marginBottom: 12, letterSpacing: 2 }}>不平等モード</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {MODES.map(mode => {
                const isSelected = selectedMode === mode.id;
                return (
                  <div key={mode.id} className="mode-card" onClick={() => setSelectedMode(mode.id)} style={{ background: isSelected ? `linear-gradient(135deg, ${mode.color}28, ${mode.color}10)` : "rgba(255,255,255,0.04)", borderColor: isSelected ? mode.color : "rgba(255,255,255,0.1)" }}>
                    <div style={{ width: 20, height: 20, borderRadius: "50%", flexShrink: 0, border: `2px solid ${isSelected ? mode.color : "rgba(255,255,255,0.2)"}`, background: isSelected ? mode.color : "transparent", display: "flex", alignItems: "center", justifyContent: "center", transition: "all 0.2s" }}>
                      {isSelected && <div style={{ width: 8, height: 8, borderRadius: "50%", background: "white" }} />}
                    </div>
                    <div style={{ fontSize: 22, flexShrink: 0 }}>{mode.icon}</div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 14, fontWeight: 700, color: isSelected ? "white" : "rgba(255,255,255,0.7)" }}>{mode.label}</div>
                      <div style={{ fontSize: 11, color: "rgba(255,255,255,0.35)", marginTop: 2, lineHeight: 1.4 }}>{mode.desc}</div>
                    </div>
                    {isSelected && <div style={{ fontSize: 10, fontWeight: 900, letterSpacing: 1, color: mode.color, background: mode.color + "22", padding: "3px 8px", borderRadius: 20, flexShrink: 0 }}>ON</div>}
                  </div>
                );
              })}
            </div>
          </div>
          <div style={{ textAlign: "center" }}>
            <button className="spin-btn" onClick={spin} disabled={!totalAmount || names.length < 2}>🎰 ルーレット スタート</button>
            {(!totalAmount || names.length < 2) && <div style={{ marginTop: 12, fontSize: 12, color: "rgba(255,255,255,0.3)" }}>{!totalAmount ? "金額を入力してください" : "参加者を2人以上追加してください"}</div>}
          </div>
        </div>
      )}
      {(step === "spinning" || step === "result") && (
        <div style={{ padding: "8px 20px 48px", maxWidth: 480, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: 16 }}>
            <div style={{ fontSize: 14, color: "rgba(255,255,255,0.5)" }}>合計 <span style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 22, color: "white", letterSpacing: 1 }}>¥{Number(totalAmount).toLocaleString()}</span></div>
            {step === "result" && selectedMode === "omakase" && revealedMode && (
              <div style={{ display: "inline-flex", alignItems: "center", gap: 6, marginTop: 8, padding: "5px 14px", borderRadius: 20, background: revealedMode.color + "22", border: `1px solid ${revealedMode.color}55`, fontSize: 12, color: revealedMode.color, animation: "reveal 0.4s cubic-bezier(0.34,1.56,0.64,1)" }}>
                🎰 おまかせ → {revealedMode.icon} {revealedMode.label}
              </div>
            )}
            {step === "result" && selectedMode !== "omakase" && (
              <div style={{ display: "inline-flex", alignItems: "center", gap: 6, marginTop: 8, padding: "5px 14px", borderRadius: 20, background: "rgba(255,255,255,0.06)", fontSize: 12, color: "rgba(255,255,255,0.4)" }}>
                {MODES.find(m => m.id === selectedMode)?.icon} {MODES.find(m => m.id === selectedMode)?.label}
              </div>
            )}
          </div>
          <RouletteWheel segments={segments} names={names} rotation={rotation} spinning={spinning} />
          {spinning && <div style={{ textAlign: "center", marginTop: 24 }}><div style={{ fontSize: 16, letterSpacing: 3, color: "rgba(255,255,255,0.6)", fontFamily: "'Bebas Neue', sans-serif", animation: "float 0.8s ease-in-out infinite" }}>SPINNING...</div></div>}
          {step === "result" && (
            <div style={{ marginTop: 28 }}>
              <div style={{ textAlign: "center", marginBottom: 16, fontFamily: "'Bebas Neue', sans-serif", fontSize: 18, letterSpacing: 3, color: "rgba(255,255,255,0.5)" }}>RESULT</div>
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {names.map((name, i) => {
                  const amount = amounts[i] || 0;
                  const pct = Math.round((ratios[i] || 0) * 100);
                  const isMax = amount === Math.max(...amounts);
                  const isMin = amount === Math.min(...amounts);
                  const emoji = isMax ? "💀" : isMin ? "🎉" : getRandomEmoji();
                  return (
                    <div key={i} className="card-item" style={{ background: isMax ? `linear-gradient(135deg, ${COLORS[i % COLORS.length]}44, ${COLORS[i % COLORS.length]}22)` : "rgba(255,255,255,0.05)", border: `1.5px solid ${isMax ? COLORS[i % COLORS.length] + "88" : "rgba(255,255,255,0.1)"}`, borderRadius: 16, padding: "14px 18px", display: "flex", alignItems: "center", gap: 12, animationDelay: `${i * 0.08}s`, position: "relative", overflow: "hidden" }}>
                      {isMax && <div style={{ position: "absolute", top: 6, right: 10, fontSize: 10, letterSpacing: 1, color: COLORS[i % COLORS.length], fontWeight: 900 }}>MAX</div>}
                      <div style={{ width: 40, height: 40, borderRadius: "50%", background: COLORS[i % COLORS.length], display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, flexShrink: 0, boxShadow: `0 4px 12px ${COLORS[i % COLORS.length]}66` }}>{emoji}</div>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: 700, fontSize: 15 }}>{name}</div>
                        <div style={{ fontSize: 11, color: "rgba(255,255,255,0.4)", marginTop: 2 }}>{pct}% の負担</div>
                        <div style={{ height: 3, background: "rgba(255,255,255,0.1)", borderRadius: 2, marginTop: 6, overflow: "hidden" }}>
                          <div style={{ height: "100%", width: `${pct}%`, background: COLORS[i % COLORS.length], borderRadius: 2, transition: "width 1s cubic-bezier(0.34,1.56,0.64,1)" }} />
                        </div>
                      </div>
                      <div style={{ textAlign: "right", flexShrink: 0 }}><div className="result-amount" style={{ fontSize: 22 }}>¥{amount.toLocaleString()}</div></div>
                    </div>
                  );
                })}
              </div>
              <div style={{ textAlign: "center", marginTop: 28, display: "flex", gap: 12, justifyContent: "center" }}>
                <button onClick={spin} style={{ background: "linear-gradient(135deg, #FF6B6B, #FF922B)", border: "none", color: "white", fontFamily: "'Bebas Neue', sans-serif", fontSize: 18, letterSpacing: 2, padding: "14px 28px", borderRadius: 50, cursor: "pointer", boxShadow: "0 6px 20px rgba(255,107,107,0.4)" }}>🎰 もう一度</button>
                <button onClick={reset} style={{ background: "rgba(255,255,255,0.08)", border: "1.5px solid rgba(255,255,255,0.15)", color: "white", fontFamily: "'Noto Sans JP', sans-serif", fontSize: 14, padding: "14px 20px", borderRadius: 50, cursor: "pointer" }}>最初から</button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
