// Gedeelde stijlobjecten voor het donkere thema (Oura-gevoel in warm bruin,
// glassmorphism). Eén bron voor het glas-recept zodat elke pagina identiek is.
// Tokens leven in index.html (--d-*); dit zijn de samengestelde recepten.

export const pagina = {
  minHeight: '100vh',
  background: 'var(--d-page)',
  padding: '20px 16px 120px 16px',
}

export const kolom = {
  maxWidth: '600px',
  margin: '0 auto',
}

export const glasKaart = {
  background: 'var(--d-card)',
  backdropFilter: 'blur(20px)',
  WebkitBackdropFilter: 'blur(20px)',
  border: 'none',
  borderRadius: '22px',
  boxShadow: '0 4px 20px rgba(0, 0, 0, 0.18), inset 0 1px 0 rgba(255, 255, 255, 0.09)',
  padding: '18px 20px',
}

export const microLabel = {
  margin: 0,
  fontSize: '11px',
  fontWeight: '600',
  letterSpacing: '0.1em',
  textTransform: 'uppercase',
  color: 'var(--d-ink-3)',
  fontFamily: 'var(--font-sans)',
}

export const kop = {
  fontFamily: 'var(--font-display)',
  fontSize: '26px',
  fontWeight: '500',
  margin: '0 0 4px 0',
  color: 'var(--d-ink)',
}

export const subtekst = {
  fontFamily: 'var(--font-sans)',
  fontSize: '13px',
  color: 'var(--d-ink-3)',
  margin: '0 0 24px 0',
  lineHeight: 1.5,
}

export const terugKnop = {
  display: 'inline-flex',
  alignItems: 'center',
  gap: '6px',
  background: 'none',
  border: 'none',
  cursor: 'pointer',
  color: 'var(--d-ink-2)',
  fontFamily: 'var(--font-sans)',
  fontSize: '13px',
  padding: 0,
  marginBottom: '24px',
}

export const primaireKnop = {
  padding: '12px 20px',
  background: 'var(--d-accent)',
  color: '#1B0F07',
  border: 'none',
  borderRadius: '999px',
  cursor: 'pointer',
  fontFamily: 'var(--font-sans)',
  fontSize: '14px',
  fontWeight: '600',
}

export const ghostKnop = {
  padding: '12px 20px',
  background: 'transparent',
  color: 'var(--d-ink-2)',
  border: '1px solid var(--d-border)',
  borderRadius: '999px',
  cursor: 'pointer',
  fontFamily: 'var(--font-sans)',
  fontSize: '14px',
}
