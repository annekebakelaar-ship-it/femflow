import { useState } from "react";
import Bloom from "./Bloom";

/**
 * CycleBloom — cyclus-variant van Bloom. Data-gestuurd uit `phases`.
 * Props: size, day, phases [{poetic,clinical,days}], peakAt, onDayChange
 */
export default function CycleBloom({
  size = 340,
  day: dayProp = 4,
  phases = [
    { poetic: "Herstel", clinical: "Menstruatie", days: 5 },
    { poetic: "Opbouw", clinical: "Folliculair", days: 8 },
    { poetic: "Verbind", clinical: "Ovulatie", days: 3 },
    { poetic: "Verhelder", clinical: "Luteaal", days: 12 },
  ],
  peakAt,
  onDayChange,
}) {
  const total = phases.reduce((s, p) => s + p.days, 0);
  const [day, setDay] = useState(dayProp);

  let acc = 0;
  const ranges = phases.map((p) => { const from = acc + 1; acc += p.days; return { ...p, from, to: acc }; });
  const cum = ranges.map((r) => r.to / total);
  const ov = ranges.find((p) => /ovulat/i.test(p.clinical || "")) || ranges[Math.floor(ranges.length / 2)];
  const ovD = (ov.from + ov.to) / 2;
  const tp = peakAt != null ? peakAt : (ovD - 0.5) / Math.max(1, total - 1);

  const progress = (day - 1) / Math.max(1, total - 1);
  const phaseIdx = Math.max(0, cum.findIndex((c) => progress < c));
  const phase = ranges[phaseIdx < 0 ? ranges.length - 1 : phaseIdx];

  const scrub = (prog) => {
    const d = Math.max(1, Math.min(total, Math.round(prog * (total - 1)) + 1));
    setDay(d); onDayChange && onDayChange(d);
  };

  return (
    <Bloom size={size} progress={progress} peak={tp} hwMin={0.8} hwMax={4.2} sigma={0.2}
      draggable onScrub={scrub} centerPadding={0.26}>
      <span style={{ fontSize: size * 0.03, letterSpacing: size * 0.005, textTransform: "uppercase", fontWeight: 600, opacity: 0.5 }}>
        {phase.clinical} fase
      </span>
      <span style={{ fontFamily: "'Cinzel',Georgia,serif", fontSize: size * 0.125,
        lineHeight: 1, margin: `${size * 0.015}px 0 ${size * 0.02}px` }}>{phase.poetic}</span>
      <span style={{ fontSize: size * 0.038, opacity: 0.65 }}>Dag {day} / {total}</span>
    </Bloom>
  );
}
