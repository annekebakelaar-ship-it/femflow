import { useState } from 'react'
import { Cloud, Zap, Moon, Heart, Thermometer, Sunset, Frown, Activity, RotateCw, Move, X } from 'react-feather'
import { saveSecure, getSecure } from '../utils/secureStorage'

// Symptoomset: de vier oorspronkelijke ids blijven ongewijzigd zodat
// bestaande logs, het huisartsrapport en de supplementsuggesties blijven
// kloppen; de zes nieuwe dekken de meest gerapporteerde perimenopauze-
// en cyclusklachten.
const SYMPTOMS = [
  { id: 'hot_flash', label: 'Opvlieger', icon: Zap },
  { id: 'night_sweats', label: 'Nachtzweten', icon: Thermometer },
  { id: 'extreme_fatigue', label: 'Vermoeidheid', icon: Moon },
  { id: 'sleep_problem', label: 'Slecht geslapen', icon: Sunset },
  { id: 'mood_swing', label: 'Stemming', icon: Heart },
  { id: 'brain_fog', label: 'Brain fog', icon: Cloud },
  { id: 'headache', label: 'Hoofdpijn', icon: Frown },
  { id: 'cramps', label: 'Krampen', icon: Activity },
  { id: 'dizziness', label: 'Duizeligheid', icon: RotateCw },
  { id: 'joint_pain', label: 'Gewrichtspijn', icon: Move },
]

const DAG_LETTERS = ['zo', 'ma', 'di', 'wo', 'do', 'vr', 'za']

function isVandaag(isoDate) {
  return new Date(isoDate).toDateString() === new Date().toDateString()
}

export default function SymptomQuicklog() {
  const [log, setLog] = useState(() => getSecure('symptom_log') || [])
  const [zojuist, setZojuist] = useState(null)

  function bewaar(nieuw) {
    saveSecure('symptom_log', nieuw)
    setLog(nieuw)
  }

  function handleLog(symptom) {
    bewaar([...log, { symptom: symptom.id, label: symptom.label, date: new Date().toISOString() }])
    setZojuist(symptom.id)
    setTimeout(() => setZojuist(null), 900)
  }

  // Verwijdert de laatste log van vandaag voor dit symptoom (foutje herstellen)
  function handleOngedaan(symptomId) {
    for (let i = log.length - 1; i >= 0; i--) {
      if (log[i].symptom === symptomId && isVandaag(log[i].date)) {
        bewaar(log.filter((_, idx) => idx !== i))
        return
      }
    }
  }

  // Telling per symptoom voor vandaag
  const vandaag = {}
  for (const entry of log) {
    if (isVandaag(entry.date)) vandaag[entry.symptom] = (vandaag[entry.symptom] || 0) + 1
  }
  const vandaagChips = SYMPTOMS.filter(s => vandaag[s.id])

  // Totalen per dag voor de laatste 7 dagen (oud -> nieuw)
  const week = []
  for (let i = 6; i >= 0; i--) {
    const d = new Date()
    d.setDate(d.getDate() - i)
    const aantal = log.filter(e => new Date(e.date).toDateString() === d.toDateString()).length
    week.push({ letter: DAG_LETTERS[d.getDay()], aantal, vandaag: i === 0 })
  }

  return (
    <div>
      {/* Symptoomtegels */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(2, 1fr)',
        gap: '10px',
      }}>
        {SYMPTOMS.map(symptom => {
          const Icoon = symptom.icon
          const aantal = vandaag[symptom.id] || 0
          const isZojuist = zojuist === symptom.id

          return (
            <button
              key={symptom.id}
              onClick={() => handleLog(symptom)}
              style={{
                position: 'relative',
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                padding: '14px 12px',
                background: aantal > 0 ? 'var(--accent-soft)' : 'var(--surface)',
                border: `1px solid ${isZojuist ? 'var(--success)' : aantal > 0 ? 'var(--accent)' : 'var(--border)'}`,
                borderRadius: '12px',
                cursor: 'pointer',
                transition: 'all 150ms ease',
                textAlign: 'left',
              }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--accent)' }}
              onMouseLeave={e => {
                e.currentTarget.style.borderColor = aantal > 0 ? 'var(--accent)' : 'var(--border)'
              }}
            >
              <Icoon size={18} strokeWidth={1.5} color={aantal > 0 ? 'var(--accent)' : 'var(--ink-3)'} />
              <span style={{
                fontFamily: 'var(--font-sans)',
                fontSize: '13px',
                fontWeight: '500',
                color: 'var(--ink)',
                flex: 1,
              }}>
                {symptom.label}
              </span>
              {aantal > 0 && (
                <span style={{
                  fontFamily: 'var(--font-sans)',
                  fontSize: '11px',
                  fontWeight: '600',
                  color: 'white',
                  background: 'var(--accent)',
                  borderRadius: '999px',
                  minWidth: '18px',
                  height: '18px',
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: '0 5px',
                }}>
                  {aantal}
                </span>
              )}
            </button>
          )
        })}
      </div>

      {/* Vandaag gelogd, met ongedaan maken */}
      {vandaagChips.length > 0 && (
        <div style={{ marginTop: 'var(--space-lg)' }}>
          <p style={{
            fontFamily: 'var(--font-sans)',
            fontSize: '11px',
            fontWeight: '600',
            letterSpacing: '0.08em',
            textTransform: 'uppercase',
            color: 'var(--ink-3)',
            margin: '0 0 8px 0',
          }}>
            Vandaag gelogd
          </p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
            {vandaagChips.map(s => (
              <span key={s.id} style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '6px 10px',
                background: 'var(--surface)',
                border: '1px solid var(--border)',
                borderRadius: '999px',
                fontFamily: 'var(--font-sans)',
                fontSize: '12px',
                color: 'var(--ink-2)',
              }}>
                {s.label}{vandaag[s.id] > 1 ? ` ×${vandaag[s.id]}` : ''}
                <button
                  onClick={() => handleOngedaan(s.id)}
                  title={`Verwijder laatste log van ${s.label.toLowerCase()}`}
                  style={{
                    background: 'none',
                    border: 'none',
                    padding: 0,
                    cursor: 'pointer',
                    color: 'var(--ink-3)',
                    display: 'inline-flex',
                  }}
                >
                  <X size={13} strokeWidth={2} />
                </button>
              </span>
            ))}
          </div>
        </div>
      )}

      {/* 7-dagenstrip */}
      <div style={{ marginTop: 'var(--space-lg)' }}>
        <p style={{
          fontFamily: 'var(--font-sans)',
          fontSize: '11px',
          fontWeight: '600',
          letterSpacing: '0.08em',
          textTransform: 'uppercase',
          color: 'var(--ink-3)',
          margin: '0 0 8px 0',
        }}>
          Afgelopen 7 dagen
        </p>
        <div style={{ display: 'flex', gap: '8px' }}>
          {week.map((dag, i) => (
            <div key={i} style={{ flex: 1, textAlign: 'center' }}>
              <div style={{
                height: '34px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: dag.aantal > 0 ? 'var(--accent-soft)' : 'var(--surface)',
                border: `1px solid ${dag.vandaag ? 'var(--accent)' : 'var(--border)'}`,
                borderRadius: '8px',
                fontFamily: 'var(--font-sans)',
                fontSize: '13px',
                fontWeight: '600',
                color: dag.aantal > 0 ? 'var(--ink)' : 'var(--ink-3)',
              }}>
                {dag.aantal > 0 ? dag.aantal : '·'}
              </div>
              <p style={{
                fontFamily: 'var(--font-sans)',
                fontSize: '10px',
                color: dag.vandaag ? 'var(--ink)' : 'var(--ink-3)',
                fontWeight: dag.vandaag ? '600' : '400',
                margin: '4px 0 0 0',
              }}>
                {dag.letter}
              </p>
            </div>
          ))}
        </div>
      </div>

      <p style={{
        fontFamily: 'var(--font-sans)',
        fontSize: '12px',
        color: 'var(--ink-3)',
        lineHeight: 1.5,
        margin: 'var(--space-lg) 0 0 0',
      }}>
        Symptomen blijven op dit apparaat en tellen mee in je huisartsrapport.
        Meerdere keren per dag loggen kan — tik gewoon nog een keer.
      </p>
    </div>
  )
}
