import { useState, useRef } from "react";

/**
 * CycleRing — schaalbare cyclus-fasering met sleepbare handle OP de ring.
 *
 * De gekleurde ring is zelf de slider: pak de stip en sleep 'm over de ring
 * om de dag te kiezen. Geen losse schuifbalk meer.
 *
 * Props:
 *  size         diameter in px (default 320) — alles schaalt mee
 *  day          startdag (1-based)
 *  cycleLength  lengte van de cyclus
 *  onDayChange  optionele callback (dag) als je 'm slepen
 */
export default function CycleRing({
  size = 320,
  day: dayProp = 4,
  cycleLength = 28,
  onDayChange,
}) {
  const [day, setDay] = useState(dayProp);
  const svgRef = useRef(null);
  const dragging = useRef(false);

  const C = 180;
  const k = size / 360;

  const R_LABEL = 162;
  const R_RING = 136; // hartlijn van de gekleurde band -> hier zit de handle
  const R_TICK = 116;

  const polar = (r, aDeg) => {
    const m = ((aDeg - 90) * Math.PI) / 180;
    return [C + r * Math.cos(m), C + r * Math.sin(m)];
  };
  const arc = (r, a1, a2) => {
    const [x1, y1] = polar(r, a1);
    const [x2, y2] = polar(r, a2);
    const large = Math.abs(a2 - a1) > 180 ? 1 : 0;
    const sweep = a2 > a1 ? 1 : 0;
    return `M ${x1} ${y1} A ${r} ${r} 0 ${large} ${sweep} ${x2} ${y2}`;
  };

  const START = 180;
  const DIR = -1;
  const progress = ((day - 1) % cycleLength) / cycleLength;
  const baseAngle = START + DIR * progress * 360;
  const [ix, iy] = polar(R_RING, baseAngle);
  const trail = [7, 13, 20].map((d, i) => {
    const [tx, ty] = polar(R_RING, baseAngle - DIR * d);
    return { tx, ty, r: 2.3 - i * 0.6, o: 0.5 - i * 0.14 };
  });

  // pointer -> dag (omgekeerde van de hoek-formule)
  const setFromPointer = (e) => {
    const svg = svgRef.current;
    if (!svg) return;
    const rect = svg.getBoundingClientRect();
    const vx = ((e.clientX - rect.left) / rect.width) * 360;
    const vy = ((e.clientY - rect.top) / rect.height) * 360;
    const a = (Math.atan2(vx - C, -(vy - C)) * 180) / Math.PI; // 0=boven, met klok mee
    let prog = (START - a) / 360; // DIR = -1
    prog -= Math.floor(prog); // naar [0,1)
    let d = Math.floor(prog * cycleLength) + 1;
    d = Math.max(1, Math.min(cycleLength, d));
    setDay(d);
    onDayChange && onDayChange(d);
  };

  const ringMask =
    "radial-gradient(circle closest-side at center, transparent 0 71%, #000 73% 78%, transparent 80%)";

  const phases = [
    { key: "menstruatie", naam: "Herstel" },
    { key: "folliculair", naam: "Opbouw" },
    { key: "ovulatie", naam: "Verbind" },
    { key: "luteaal", naam: "Verhelder" },
  ];
  const phase = phases[Math.floor(progress * 4) % 4];

  const ringLabels = [
    { id: "p-conn", text: "CONNECT — OVULATIE", d: arc(R_LABEL, -44, 44) },
    { id: "p-clar", text: "CLARIFY — LUTEAAL", d: arc(R_LABEL, 48, 132) },
    { id: "p-rest", text: "RESTORE — MENSTRUATIE", d: arc(R_LABEL, 224, 136) },
    { id: "p-build", text: "BUILD — FOLLICULAIR", d: arc(R_LABEL, 314, 226) },
  ];
  const ticks = Array.from({ length: 30 }, (_, i) => polar(R_TICK, i * 12));

  return (
    <div style={{ position: "relative", width: size, height: size }}>
      {/* rustige frosted laag onder de ring — feathered rand zodat de foto in de hoeken doorloopt */}
      <div style={{ position: "absolute", inset: 0, borderRadius: "50%",
        background: "rgba(231,221,197,0.4)",
        backdropFilter: "blur(4px)", WebkitBackdropFilter: "blur(4px)",
        WebkitMask: "radial-gradient(circle closest-side at center,#000 0 86%,transparent 100%)",
        mask: "radial-gradient(circle closest-side at center,#000 0 86%,transparent 100%)" }} />

      {/* track */}
      <div style={{ position: "absolute", inset: 0, borderRadius: "50%",
        background: "#000", opacity: 0.1, WebkitMask: ringMask, mask: ringMask }} />
      {/* zachte gloed achter de ring (luminositeit i.p.v. harde schaduw) */}
      <div style={{ position: "absolute", inset: 0, borderRadius: "50%",
        background:
          "conic-gradient(from 0deg,#ddccac 0deg,#cdb78f 60deg,#bfa87d 105deg," +
          "#a48f68 150deg,#8f7a58 185deg,#ab9670 245deg,#cab895 300deg,#ddccac 360deg)",
        WebkitMask: ringMask, mask: ringMask,
        filter: "blur(7px)", opacity: 0.5 }} />
      {/* gekleurde ring */}
      <div style={{ position: "absolute", inset: 0, borderRadius: "50%",
        background:
          "conic-gradient(from 0deg,#ddccac 0deg,#cdb78f 60deg,#bfa87d 105deg," +
          "#a48f68 150deg,#8f7a58 185deg,#ab9670 245deg,#cab895 300deg,#ddccac 360deg)",
        WebkitMask: ringMask, mask: ringMask,
        filter: "drop-shadow(0 1px 5px rgba(40,30,20,0.16))" }} />

      {/* SVG: labels, stipjes, sleepzone + handle */}
      <svg ref={svgRef} viewBox="0 0 360 360"
        style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }}>
        <defs>
          {ringLabels.map((l) => (<path key={l.id} id={l.id} d={l.d} fill="none" />))}
        </defs>

        {ticks.map(([x, y], i) => (
          <circle key={i} cx={x} cy={y} r={1.3} fill="#2a2218" opacity={0.15} />
        ))}

        {ringLabels.map((l) => (
          <text key={l.id + "t"} fill="#2a2218" opacity={0.62} fontSize={11.5}
                letterSpacing={1.5} fontWeight={600}>
            <textPath href={`#${l.id}`} startOffset="50%" textAnchor="middle">
              {l.text}
            </textPath>
          </text>
        ))}

        {/* onzichtbare sleepzone over de hele band */}
        <circle cx={C} cy={C} r={R_RING} fill="none" stroke="transparent"
          strokeWidth={32} style={{ cursor: "grab" }} pointerEvents="stroke"
          onPointerDown={(e) => { e.currentTarget.setPointerCapture(e.pointerId);
            dragging.current = true; setFromPointer(e); }}
          onPointerMove={(e) => { if (dragging.current) setFromPointer(e); }}
          onPointerUp={() => { dragging.current = false; }} />

        {/* spoor-stipjes vóór de handle */}
        {trail.map((t, i) => (
          <circle key={"tr" + i} cx={t.tx} cy={t.ty} r={t.r} fill="#a48f68"
            opacity={t.o} pointerEvents="none" />
        ))}

        {/* handle ZIT op de kleurenring */}
        <circle cx={ix} cy={iy} r={11} fill="#e6dcc4" pointerEvents="none" />
        <circle cx={ix} cy={iy} r={7} fill="#2a2218" pointerEvents="none" />
      </svg>

      {/* midden — pointerEvents none zodat de ring sleepbaar blijft; knop wel klikbaar */}
      <div style={{ position: "absolute", inset: 0, display: "flex",
        flexDirection: "column", alignItems: "center", justifyContent: "center",
        textAlign: "center", padding: 70 * k, color: "#2a2218",
        fontFamily: "'Geist','Helvetica Neue',sans-serif", pointerEvents: "none" }}>
        <span style={{ fontSize: 11 * k, letterSpacing: 2 * k, opacity: 0.5,
          fontWeight: 600, textTransform: "uppercase" }}>{phase.key} fase</span>
        <span style={{ fontFamily: "'Fraunces',Georgia,serif", fontStyle: "italic",
          fontSize: 52 * k, lineHeight: 1, margin: `${8 * k}px 0 ${10 * k}px` }}>
          {phase.naam}
        </span>
        <span style={{ fontSize: 15 * k, opacity: 0.7 }}>
          Dag {day} / {cycleLength}
        </span>
        <button style={{ marginTop: 18 * k, background: "#2a2218", color: "#e6dcc4",
          border: "none", borderRadius: 999, padding: `${12 * k}px ${26 * k}px`,
          fontSize: 13 * k, letterSpacing: 1 * k, fontWeight: 600, cursor: "pointer",
          pointerEvents: "auto" }}>
          BEKIJK →
        </button>
      </div>
    </div>
  );
}
