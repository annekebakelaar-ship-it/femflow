// Script voor de begeleide mindfulness-sessie: welke tekst klinkt op welke
// seconde, geschaald naar de gekozen duur. Puur en testbaar, net als adem.js.
// Opzet: rustige intro, daarna om de ~75 seconden een korte aanwijzing met
// stilte ertussen, en een zachte afronding vlak voor het einde.

export const INTRO = [
  { sec: 0, tekst: 'Ga gemakkelijk zitten, met je voeten op de grond. Sluit je ogen, of laat je blik zacht naar beneden rusten.' },
  { sec: 25, tekst: 'Adem een paar keer rustig in en uit. Er hoeft even helemaal niets.' },
  { sec: 55, tekst: 'Breng je aandacht naar je adem. Volg hem zoals hij is, zonder er iets aan te veranderen.' },
]

export const MIDDEN = [
  'Dwalen je gedachten af? Dat is normaal. Merk het vriendelijk op, en kom terug naar je adem.',
  'Voel de plek waar je adem het duidelijkst is. Je neus, je borst, of je buik.',
  'Laat je schouders zakken. Ontspan je kaak.',
  'Je hoeft nergens naartoe. Alleen deze ademhaling.',
  'Merk op hoe je lichaam de stoel of de grond raakt. Laat je dragen.',
  'Gedachten mogen er zijn. Je hoeft er niet achteraan.',
  'Voel de lucht die binnenkomt, iets koeler. En weer naar buiten, iets warmer.',
  'Niets om op te lossen, niets om te doen. Alleen zijn.',
]

export const SLOT = 'Kom rustig terug. Beweeg zachtjes je vingers en je tenen, en open je ogen wanneer je er klaar voor bent.'

// -> gesorteerde lijst [{ sec, tekst }] voor een sessie van `duurMin` minuten
export function mindfulPrompts(duurMin) {
  const totaal = duurMin * 60
  const prompts = INTRO.filter(p => p.sec < totaal - 60).map(p => ({ ...p }))

  // Middenstuk: elke 75s een aanwijzing, tot een minuut voor het einde
  let i = 0
  for (let sec = 95; sec <= totaal - 60; sec += 75) {
    prompts.push({ sec, tekst: MIDDEN[i % MIDDEN.length] })
    i += 1
  }

  prompts.push({ sec: Math.max(totaal - 30, 60), tekst: SLOT })
  return prompts.sort((a, b) => a.sec - b.sec)
}
