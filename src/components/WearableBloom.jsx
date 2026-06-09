import Bloom from "./Bloom";

/**
 * WearableBloom — score-variant van Bloom. Read-only.
 * Props: size, score, max (default 100), label
 */
export default function WearableBloom({ size = 340, score = 89, max = 100, label = "Belastbaarheid" }) {
  const progress = Math.max(0, Math.min(1, score / max));
  const status = progress >= 0.85 ? "Optimaal" : progress >= 0.7 ? "Goed" : progress >= 0.5 ? "Matig" : "Laag";

  return (
    <Bloom size={size} progress={progress} peak={0.5} hwMin={0.8} hwMax={3.6} sigma={0.3} centerPadding={0.24}>
      <span style={{ fontSize: size * 0.26, fontWeight: 700, lineHeight: 1, letterSpacing: -size * 0.005 }}>{score}</span>
      <span style={{ fontSize: size * 0.034, letterSpacing: size * 0.006, textTransform: "uppercase",
        fontWeight: 600, opacity: 0.5, marginTop: size * 0.015 }}>{label}</span>
      <span style={{ fontFamily: "'Fraunces',Georgia,serif", fontStyle: "italic", fontSize: size * 0.06,
        marginTop: size * 0.01, opacity: 0.8 }}>{status}</span>
    </Bloom>
  );
}
