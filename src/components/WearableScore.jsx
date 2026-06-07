/**
 * WearableScore — score-gauge in dezelfde stijl als CycleRing.
 *
 * Eén ring die zich vult naar een waarde (0–100). Gebruik 'm voor
 * belastbaarheid, readiness, een Wearable Age-percentiel, enz.
 *
 * Props:
 *  size      diameter in px (default 280) — alles schaalt mee
 *  score     waarde 0–100
 *  label     bijv. "Belastbaarheid"
 *  max       schaal-maximum (default 100)
 */
export default function WearableScore({
  size = 280,
  score = 89,
  label = "Belastbaarheid",
  max = 100,
}) {
  const VB = 120;            // viewBox
  const c = VB / 2;          // midden (60)
  const r = 52;              // straal van de gauge
  const sw = 9;              // dikte van de ring
  const k = size / size;     // (fonts hieronder schalen direct met size)

  const p = Math.max(0, Math.min(1, score / max));
  const circ = 2 * Math.PI * r;

  // status-woord uit de score
  const status =
    p >= 0.85 ? "Optimaal" : p >= 0.7 ? "Goed" : p >= 0.5 ? "Matig" : "Laag";

  // subtiele tikjes als familie-element met de cyclusring
  const TICKS = 30;
  const ticks = Array.from({ length: TICKS }, (_, i) => {
    const a = ((i * (360 / TICKS) - 90) * Math.PI) / 180;
    return [c + 40 * Math.cos(a), c + 40 * Math.sin(a)];
  });

  const surfaceMask =
    "radial-gradient(circle closest-side at center,#000 0 86%,transparent 100%)";

  return (
    <div style={{ position: "relative", width: size, height: size }}>
      {/* rustige frosted laag */}
      <div style={{ position: "absolute", inset: 0, borderRadius: "50%",
        background: "rgba(231,221,197,0.78)",
        backdropFilter: "blur(7px)", WebkitBackdropFilter: "blur(7px)",
        WebkitMask: surfaceMask, mask: surfaceMask }} />

      <svg viewBox={`0 0 ${VB} ${VB}`}
        style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }}>
        <defs>
          {/* goud -> brons, zelfde familie als de cyclusring */}
          <linearGradient id="ws-grad" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#e6b25a" />
            <stop offset="55%" stopColor="#6a7e76" />
            <stop offset="100%" stopColor="#2a4753" />
          </linearGradient>
        </defs>

        {/* tikjes */}
        {ticks.map(([x, y], i) => (
          <circle key={i} cx={x} cy={y} r={0.9} fill="#2a2218" opacity={0.16} />
        ))}

        {/* track */}
        <circle cx={c} cy={c} r={r} fill="none" stroke="#2a2218"
          strokeOpacity={0.12} strokeWidth={sw} />

        {/* voortgangsboog, start bovenaan, met de klok mee */}
        <circle cx={c} cy={c} r={r} fill="none" stroke="url(#ws-grad)"
          strokeWidth={sw} strokeLinecap="round"
          strokeDasharray={circ} strokeDashoffset={circ * (1 - p)}
          transform={`rotate(-90 ${c} ${c})`}
          style={{ filter: "drop-shadow(0 3px 8px rgba(40,26,16,0.30))",
                   transition: "stroke-dashoffset .6s ease" }} />
      </svg>

      {/* midden */}
      <div style={{ position: "absolute", inset: 0, display: "flex",
        flexDirection: "column", alignItems: "center", justifyContent: "center",
        textAlign: "center", color: "#2a2218",
        fontFamily: "'Geist','Helvetica Neue',sans-serif" }}>
        <span style={{ fontSize: size * 0.3, fontWeight: 700, lineHeight: 1,
          letterSpacing: -size * 0.006 }}>{score}</span>
        <span style={{ fontSize: size * 0.05, letterSpacing: size * 0.006,
          textTransform: "uppercase", fontWeight: 600, opacity: 0.55,
          marginTop: size * 0.02 }}>{label}</span>
        <span style={{ fontFamily: "'Fraunces',Georgia,serif", fontStyle: "italic",
          fontSize: size * 0.07, marginTop: size * 0.015, color: "#2a4753" }}>
          {status}
        </span>
      </div>
    </div>
  );
}
