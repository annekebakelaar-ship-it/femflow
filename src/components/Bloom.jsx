import { useRef } from "react";

/**
 * Bloom — gedeelde basis voor de witte, ademende open-boog.
 * Bevat: witte band, ademende sluier, indicator, boog-wiskunde en optioneel slepen.
 * CycleBloom en WearableBloom geven alleen hun eigen progress + midden-inhoud mee.
 *
 * Props:
 *  size          diameter in px
 *  progress      0–1 (vulling van de band + positie indicator)
 *  peak          0–1 waar de band het dikst is (zwelling)
 *  hwMin/hwMax   minimale/maximale halve banddikte
 *  sigma         breedte van de zwelling
 *  draggable     of de boog sleepbaar is
 *  onScrub       (progress) => void  bij slepen
 *  centerPadding fractie van size als binnenmarge voor de midden-inhoud
 *  children      midden-inhoud (tekst-spans)
 */
const VB = 200, C = 100, A0 = 225, SPAN = 270, R = 56;
const polar = (r, a) => { const m = ((a - 90) * Math.PI) / 180; return [C + r * Math.cos(m), C + r * Math.sin(m)]; };

const smooth = (pts) => {
  let d = `M ${pts[0][0].toFixed(1)} ${pts[0][1].toFixed(1)}`;
  for (let i = 0; i < pts.length - 1; i++) {
    const p0 = pts[i - 1] || pts[i], p1 = pts[i], p2 = pts[i + 1], p3 = pts[i + 2] || pts[i + 1];
    const c1x = p1[0] + (p2[0] - p0[0]) / 6, c1y = p1[1] + (p2[1] - p0[1]) / 6;
    const c2x = p2[0] - (p3[0] - p1[0]) / 6, c2y = p2[1] - (p3[1] - p1[1]) / 6;
    d += ` C ${c1x.toFixed(1)} ${c1y.toFixed(1)} ${c2x.toFixed(1)} ${c2y.toFixed(1)} ${p2[0].toFixed(1)} ${p2[1].toFixed(1)}`;
  }
  return d;
};

const VEILS = [
  { base: 60, amp: 14, c: 0.20, w: 0.22, op: 0.4, sw: 1.0 },
  { base: 63, amp: 22, c: 0.34, w: 0.20, op: 0.5, sw: 1.2 },
  { base: 66, amp: 30, c: 0.47, w: 0.12, op: 0.68, sw: 1.4 },
  { base: 64, amp: 25, c: 0.40, w: 0.26, op: 0.45, sw: 1.1 },
  { base: 64, amp: 27, c: 0.66, w: 0.19, op: 0.55, sw: 1.3 },
];
const veilPath = (v, n = 90) => {
  const pts = [];
  for (let i = 0; i <= n; i++) {
    const t = i / n, taper = Math.min(1, Math.min(t, 1 - t) / 0.08);
    const r = v.base + v.amp * Math.exp(-0.5 * ((t - v.c) / v.w) ** 2) * taper;
    pts.push(polar(r, A0 + t * SPAN));
  }
  return smooth(pts);
};

export default function Bloom({
  size = 340, progress = 0, peak = 0.5,
  hwMin = 0.8, hwMax = 4.0, sigma = 0.25,
  draggable = false, onScrub, centerPadding = 0.25, children,
}) {
  const svgRef = useRef(null);
  const dragging = useRef(false);
  const p = Math.max(0, Math.min(1, progress));

  const halfW = (t) =>
    (hwMin + (hwMax - hwMin) * Math.exp(-0.5 * ((t - peak) / sigma) ** 2)) * Math.min(1, Math.min(t, 1 - t) / 0.05);

  const ribbon = (t0, t1, n = 100) => {
    if (t1 <= t0) return "";
    const out = [], inn = [];
    for (let i = 0; i <= n; i++) {
      const t = t0 + (t1 - t0) * (i / n), a = A0 + t * SPAN, hw = halfW(t);
      out.push(polar(R + hw, a)); inn.push(polar(R - hw, a));
    }
    let d = `M ${out[0][0].toFixed(2)} ${out[0][1].toFixed(2)}`;
    out.slice(1).forEach((q) => (d += ` L ${q[0].toFixed(2)} ${q[1].toFixed(2)}`));
    for (let i = inn.length - 1; i >= 0; i--) d += ` L ${inn[i][0].toFixed(2)} ${inn[i][1].toFixed(2)}`;
    return d + "Z";
  };

  const [ix, iy] = polar(R, A0 + p * SPAN);

  const setFromPointer = (e) => {
    const svg = svgRef.current; if (!svg || !onScrub) return;
    const rect = svg.getBoundingClientRect();
    const vx = ((e.clientX - rect.left) / rect.width) * VB, vy = ((e.clientY - rect.top) / rect.height) * VB;
    const a = ((Math.atan2(vx - C, -(vy - C)) * 180) / Math.PI + 360) % 360;
    const param = (a - A0 + 360) % 360;
    const prog = param <= SPAN ? param / SPAN : (param < SPAN + (360 - SPAN) / 2 ? 1 : 0);
    onScrub(prog);
  };

  return (
    <div style={{ position: "relative", width: size, height: size }}>
      <style>{`
        @keyframes bloom-breathe { 0%,100%{transform:scale(0.985)} 50%{transform:scale(1.02)} }
        @media (prefers-reduced-motion: reduce){ .bloom-veil{animation:none !important} }
      `}</style>
      <svg ref={svgRef} viewBox={`0 0 ${VB} ${VB}`} style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }}>
        {/* ademende witte sluier */}
        {VEILS.map((v, i) => (
          <path key={i} className="bloom-veil" d={veilPath(v)} fill="none" stroke="#ffffff"
            strokeOpacity={v.op} strokeWidth={v.sw} strokeLinecap="round"
            style={{ transformBox: "view-box", transformOrigin: "100px 100px",
              animation: `bloom-breathe ${(6 + (i % 3)).toFixed(0)}s ease-in-out ${(i * 0.7).toFixed(1)}s infinite` }} />
        ))}

        {/* witte band */}
        <path d={ribbon(0, 1)} fill="#ffffff" opacity={0.4} />
        <path d={ribbon(0, p)} fill="#ffffff" style={{ filter: "blur(3px)", opacity: 0.3 }} />
        <path d={ribbon(0, p)} fill="#ffffff" opacity={0.92} />

        {/* sleepzone */}
        {draggable && (
          <path d={ribbon(0, 1)} fill="transparent" stroke="transparent" strokeWidth={16}
            style={{ cursor: "grab" }}
            onPointerDown={(e) => { e.currentTarget.setPointerCapture(e.pointerId); dragging.current = true; setFromPointer(e); }}
            onPointerMove={(e) => { if (dragging.current) setFromPointer(e); }}
            onPointerUp={() => { dragging.current = false; }} />
        )}

        {/* indicator */}
        <circle cx={ix} cy={iy} r={6} fill="#a8593f" opacity={0.22} style={{ filter: "blur(2px)" }} pointerEvents="none" />
        <circle cx={ix} cy={iy} r={3.8} fill="#2a2218" pointerEvents="none" />
        <circle cx={ix} cy={iy} r={1.4} fill="#f1ebdf" pointerEvents="none" />
      </svg>

      {/* midden-inhoud */}
      <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column",
        alignItems: "center", justifyContent: "center", textAlign: "center", color: "white",
        fontFamily: "'Geist','Helvetica Neue',sans-serif", padding: size * centerPadding }}>
        {children}
      </div>
    </div>
  );
}
