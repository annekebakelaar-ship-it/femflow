import React from 'react';
import { ChevronRight } from 'react-feather';

/**
 * ScoreCard — Oura-pattern row card in Youcaps colors.
 *
 * A score is NEVER shown as a bare number: it is always paired with a
 * personal baseline range so the user sees context (where am I vs my
 * normal), not just an absolute value. Color codes the *category*
 * (phase / accent), never the status — the status lives in the word.
 *
 * Props:
 *   icon       react-feather component (e.g. Moon, Activity). Rendered ~18px.
 *   title      string — Fraunces h2.
 *   status     string — UPPERCASE status word ("OPTIMAAL", "GOED"). Carries meaning.
 *   score      number — the value. metric-lg, tabular.
 *   unit       string? — optional unit shown after the score ("%").
 *   min, max   number — the user's PERSONAL baseline range. From user data, never hardcoded.
 *   category   'menstrual' | 'follicular' | 'ovulation' | 'luteal'
 *              | 'accent' | 'info'   — picks the semantic tint + dot color.
 *   onPress    () => void — drill-down. Renders the chevron when provided.
 *   state      'ready' | 'loading' | 'empty' | 'error'  (default 'ready')
 *   message    string? — used for 'empty' / 'error' copy.
 */

const CATEGORY_VAR = {
  menstrual: '--phase-menstrual',
  follicular: '--phase-follicular',
  ovulation: '--phase-ovulation',
  luteal: '--phase-luteal',
  accent: '--accent',
  info: '--info',
};

export default function ScoreCard({
  icon: Icon,
  title,
  status,
  score,
  unit,
  min,
  max,
  category = 'accent',
  onPress,
  state = 'ready',
  message,
}) {
  const colorVar = CATEGORY_VAR[category] || CATEGORY_VAR.accent;
  const color = `var(${colorVar})`;

  // Low-chroma tint: warm surface base with a faint wash of the category color.
  const cardStyle = {
    position: 'relative',
    background: `
      linear-gradient(0deg,
        color-mix(in srgb, ${color} 7%, var(--d-card-solid)),
        color-mix(in srgb, ${color} 7%, var(--d-card-solid)))`,
    border: '1px solid var(--d-border)',
    borderRadius: 'var(--radius-lg)',
    padding: 'var(--space-md)',
    width: '100%',
    boxSizing: 'border-box',
    textAlign: 'left',
    cursor: onPress ? 'pointer' : 'default',
    transition: 'transform 150ms ease-in-out',
  };

  const topRow = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
  };

  const titleWrap = { display: 'flex', alignItems: 'center', gap: 'var(--space-xs)' };

  const titleText = {
    fontFamily: 'var(--font-display)',
    fontSize: 20,
    fontWeight: 500,
    color: 'var(--d-ink)',
    lineHeight: 1.25,
  };

  const statusText = {
    fontFamily: 'var(--font-sans)',
    fontSize: 11,
    fontWeight: 500,
    letterSpacing: '0.08em',
    textTransform: 'uppercase',
    color,
    marginTop: 6,
  };

  const scoreRow = {
    display: 'flex',
    alignItems: 'baseline',
    gap: 4,
    marginTop: 'var(--space-sm)',
  };

  const scoreText = {
    fontFamily: 'var(--font-sans)',
    fontSize: 48,
    fontWeight: 600,
    fontFeatureSettings: "'tnum'",
    color: 'var(--d-ink)',
    lineHeight: 1,
  };

  const unitText = {
    fontFamily: 'var(--font-sans)',
    fontSize: 13,
    fontWeight: 500,
    color: 'var(--d-ink-3)',
  };

  const Content = onPress ? 'button' : 'div';
  const press = onPress
    ? {
        onClick: onPress,
        onMouseDown: (e) => (e.currentTarget.style.transform = 'scale(0.98)'),
        onMouseUp: (e) => (e.currentTarget.style.transform = 'scale(1)'),
        onMouseLeave: (e) => (e.currentTarget.style.transform = 'scale(1)'),
      }
    : {};

  return (
    <Content style={cardStyle} {...press}>
      <div style={topRow}>
        <div style={titleWrap}>
          {Icon && <Icon size={18} strokeWidth={1.5} color="var(--d-ink-2)" />}
          <span style={titleText}>{title}</span>
        </div>
        {onPress && <ChevronRight size={20} strokeWidth={1.5} color="var(--d-ink-3)" />}
      </div>

      {status && state === 'ready' && <div style={statusText}>{status}</div>}

      {state === 'ready' && (
        <>
          <div style={scoreRow}>
            <span style={scoreText}>{score}</span>
            {unit && <span style={unitText}>{unit}</span>}
          </div>
          <BaselineRange value={score} min={min} max={max} color={color} />
        </>
      )}

      {state === 'loading' && <Skeleton />}

      {state === 'empty' && (
        <div style={scoreRow}>
          {Number.isFinite(score) && <span style={scoreText}>{score}</span>}
          <span style={{ ...unitText, marginLeft: 8 }}>
            {message || 'Baseline opbouwen…'}
          </span>
        </div>
      )}

      {state === 'error' && (
        <div
          style={{
            fontFamily: 'var(--font-sans)',
            fontSize: 13,
            color: 'var(--error)',
            marginTop: 'var(--space-sm)',
          }}
        >
          {message || 'Kon de data niet laden.'}
        </div>
      )}
    </Content>
  );
}

/**
 * BaselineRange — the horizontal track with the value dot and personal min/max.
 * min/max come from the user's own baseline. The dot is clamped to the track.
 */
function BaselineRange({ value, min, max, color }) {
  if (!Number.isFinite(min) || !Number.isFinite(max) || max <= min) return null;

  const pct = Math.min(100, Math.max(0, ((value - min) / (max - min)) * 100));

  const wrap = { marginTop: 'var(--space-md)' };
  const track = {
    position: 'relative',
    height: 1.5,
    background: 'var(--d-border)',
    borderRadius: 'var(--radius-pill)',
  };
  const dot = {
    position: 'absolute',
    top: '50%',
    left: `${pct}%`,
    width: 12,
    height: 12,
    borderRadius: 'var(--radius-pill)',
    background: color,
    transform: 'translate(-50%, -50%)',
    boxShadow: '0 0 0 3px var(--d-card-solid)',
  };
  const labels = {
    display: 'flex',
    justifyContent: 'space-between',
    marginTop: 8,
  };
  const labelText = {
    fontFamily: 'var(--font-sans)',
    fontSize: 13,
    fontWeight: 500,
    fontFeatureSettings: "'tnum'",
    color: 'var(--d-ink-3)',
  };

  return (
    <div style={wrap}>
      <div style={track}>
        <div style={dot} />
      </div>
      <div style={labels}>
        <span style={labelText}>{min}</span>
        <span style={labelText}>{max}</span>
      </div>
    </div>
  );
}

function Skeleton() {
  return (
    <div style={{ marginTop: 'var(--space-sm)' }}>
      <div
        style={{
          width: 96,
          height: 40,
          borderRadius: 'var(--radius-sm)',
          background: 'var(--d-border)',
        }}
      />
      <div
        style={{
          marginTop: 'var(--space-md)',
          height: 1.5,
          background: 'var(--d-border)',
          borderRadius: 'var(--radius-pill)',
        }}
      />
    </div>
  );
}
