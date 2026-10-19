// Benchmark voor search_knowledge. Draai dit voor en na elke wijziging aan de
// zoeklogica, zodat je ziet of het Nederlands niet verslechtert terwijl het
// Engels verbetert.
//
// Draaien: npm run benchmark
import { alleArtikelen } from '../src/artikelen.js'
import { zoek, termenUit, DREMPEL } from '../src/zoek.js'

const ARTIKELEN = alleArtikelen()

// Per vraag het artikel dat er redelijkerwijs uit hoort te komen. Waar twee
// artikelen allebei verdedigbaar zijn, staan ze er allebei.
const GEVALLEN = [
  ['NL', 'Waarom slaap ik slecht tijdens de perimenopauze?', ['slaap-en-cyclus', 'opvliegers-nachtzweten']],
  ['NL', "Ik word 's nachts steeds wakker", ['opvliegers-nachtzweten', 'slaap-en-cyclus']],
  ['NL', 'Kunnen hevige menstruaties ijzertekort veroorzaken?', ['ijzer-en-menstruatie']],
  ['NL', 'Wat helpt tegen botontkalking tijdens de overgang?', ['botgezondheid-overgang']],
  ['NL', 'Waarom heb ik ineens hartkloppingen?', ['hart-na-overgang']],

  ['EN', 'Why am I sleeping badly during perimenopause?', ['slaap-en-cyclus', 'opvliegers-nachtzweten']],
  ['EN', 'I keep waking up at night', ['opvliegers-nachtzweten', 'slaap-en-cyclus']],
  ['EN', 'Can heavy periods during perimenopause cause low iron?', ['ijzer-en-menstruatie']],
  ['EN', 'How can I protect my bones during perimenopause?', ['botgezondheid-overgang']],
  ['EN', 'Why am I suddenly getting heart palpitations?', ['hart-na-overgang']],

  ['NEG', 'What is a good mortgage?', []],
  ['NEG', 'Best pizza recipe', []],
  ['NEG', 'Hoe werkt hypotheekrente?', []],
]

function rang(treffers, verwacht) {
  for (let i = 0; i < treffers.length; i++) {
    if (verwacht.includes(treffers[i].artikel.id)) return i + 1
  }
  return 0
}

const uitslag = []
console.log(`drempel: ${DREMPEL}\n`)
console.log('taal  rang  hits  vraag')
console.log('-'.repeat(78))

for (const [taal, vraag, verwacht] of GEVALLEN) {
  const { treffers, totaal } = zoek(ARTIKELEN, vraag, { limit: 5 })
  const r = rang(treffers, verwacht)

  let oordeel
  if (taal === 'NEG') oordeel = totaal === 0 ? 'GOED' : 'FOUT'
  else if (r === 1) oordeel = 'GOED'
  else if (r > 1) oordeel = 'ZWAK'
  else oordeel = 'FOUT'

  uitslag.push({ taal, vraag, oordeel, rang: r, totaal })

  const rangTekst = taal === 'NEG' ? (totaal === 0 ? '  0 ' : ' >0 ') : r === 0 ? ' -- ' : `  ${r} `
  console.log(`${taal.padEnd(5)} ${rangTekst} ${String(totaal).padStart(4)}  ${vraag}`)
  if (treffers.length) {
    console.log(`            termen: ${termenUit(vraag).join(', ')}`)
    console.log(`            top: ${treffers.slice(0, 3).map((t) => `${t.artikel.id}=${t.score}`).join('  ')}`)
  } else {
    console.log(`            termen: ${termenUit(vraag).join(', ') || '(geen)'}   geen treffers`)
  }
}

const tel = (taal, oordeel) => uitslag.filter((u) => u.taal === taal && u.oordeel === oordeel).length
console.log('\n' + '-'.repeat(78))
for (const taal of ['NL', 'EN', 'NEG']) {
  const totaal = uitslag.filter((u) => u.taal === taal).length
  console.log(`${taal.padEnd(4)} goed ${tel(taal, 'GOED')}/${totaal}   zwak ${tel(taal, 'ZWAK')}   fout ${tel(taal, 'FOUT')}`)
}
