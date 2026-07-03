// Puur telwerk voor de begeleide ademoefening (4 tellen in, 6 tellen uit).
// Losgetrokken van de UI zodat het testbaar is: geef het aantal verstreken
// seconden en je krijgt terug in welke fase je zit en welke tel er klinkt.

export const IN_SEC = 4
export const UIT_SEC = 6

export function ademStap(sec, inSec = IN_SEC, uitSec = UIT_SEC) {
  const cyclus = inSec + uitSec
  const pos = ((sec % cyclus) + cyclus) % cyclus
  const ronde = Math.floor(sec / cyclus) + 1
  if (pos < inSec) return { fase: 'in', tel: pos + 1, ronde }
  return { fase: 'uit', tel: pos - inSec + 1, ronde }
}

// Aantal volledige ademrondes in een sessie van `minuten`
export function rondesIn(minuten, inSec = IN_SEC, uitSec = UIT_SEC) {
  return Math.floor((minuten * 60) / (inSec + uitSec))
}
