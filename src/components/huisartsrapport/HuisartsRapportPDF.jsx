// PDF-template voor het Huisartsrapport.
// Bewust NIET de warme app-stijl: wit, zwarte tekst, dunne lijnen — klinisch
// en printvriendelijk. Alleen het Ovari-woordmerk draagt de accentkleur.
// Wordt dynamisch geimporteerd zodat @react-pdf/renderer buiten de hoofdbundel blijft.

import { Document, Page, View, Text, StyleSheet, Svg, Polyline, Line, pdf } from '@react-pdf/renderer'
import { formatDatum, RAPPORT_PERIODE_MAANDEN } from '../../utils/rapportData'

const INKT = '#111111'
const GRIJS = '#555555'
const LICHTGRIJS = '#999999'
const HAARLIJN = '#CCCCCC'
const ACCENT = '#C79A6E' // alleen voor het woordmerk

const styles = StyleSheet.create({
  page: {
    padding: 48,
    fontSize: 9,
    fontFamily: 'Helvetica',
    color: INKT,
    backgroundColor: '#FFFFFF',
  },
  headerRij: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    borderBottomWidth: 1,
    borderBottomColor: INKT,
    paddingBottom: 8,
    marginBottom: 16,
  },
  titel: { fontSize: 16, fontFamily: 'Helvetica-Bold' },
  woordmerk: { fontSize: 10, color: ACCENT, fontFamily: 'Helvetica-Bold' },
  meta: { fontSize: 8, color: GRIJS, marginTop: 2 },
  sectieTitel: {
    fontSize: 11,
    fontFamily: 'Helvetica-Bold',
    marginTop: 14,
    marginBottom: 6,
  },
  sectieNoot: { fontSize: 8, color: GRIJS, marginBottom: 6 },
  tabel: { borderTopWidth: 0.5, borderTopColor: INKT },
  rij: {
    flexDirection: 'row',
    borderBottomWidth: 0.5,
    borderBottomColor: HAARLIJN,
    paddingVertical: 3,
  },
  kopRij: {
    flexDirection: 'row',
    borderBottomWidth: 0.5,
    borderBottomColor: INKT,
    paddingVertical: 3,
  },
  kopCel: { fontSize: 8, fontFamily: 'Helvetica-Bold' },
  cel: { fontSize: 9 },
  footer: {
    position: 'absolute',
    bottom: 28,
    left: 48,
    right: 48,
    borderTopWidth: 0.5,
    borderTopColor: HAARLIJN,
    paddingTop: 6,
  },
  disclaimer: { fontSize: 7.5, color: GRIJS, lineHeight: 1.4 },
  grafiekBlok: { flexDirection: 'row', marginTop: 4 },
  grafiekLabel: { fontSize: 8, color: GRIJS, marginBottom: 2 },
  asLabel: { fontSize: 7, color: LICHTGRIJS },
})

// Kolombreedtes cyclustabel (percentages)
const COLS = [
  { key: 'nummer', label: '#', width: '6%' },
  { key: 'start', label: 'Startdatum', width: '24%' },
  { key: 'lengte', label: 'Lengte (dagen)', width: '20%' },
  { key: 'afwijking', label: 'T.o.v. baseline', width: '20%' },
  { key: 'markers', label: 'Markers (STRAW+10)', width: '30%' },
]

function CyclusTabel({ overzicht }) {
  return (
    <View style={styles.tabel}>
      <View style={styles.kopRij}>
        {COLS.map(col => (
          <Text key={col.key} style={[styles.kopCel, { width: col.width }]}>{col.label}</Text>
        ))}
      </View>
      {overzicht.rijen.map(rij => {
        const markers = []
        if (rij.sprongMarker) markers.push('lengteverschil >= 7 dagen')
        if (rij.langeCyclusMarker) markers.push('>= 60 dagen (mogelijk overgeslagen)')
        const afwijking = rij.afwijking == null ? '-'
          : `${rij.afwijking > 0 ? '+' : ''}${Math.round(rij.afwijking * 10) / 10}`
        return (
          <View key={rij.nummer} style={styles.rij}>
            <Text style={[styles.cel, { width: COLS[0].width }]}>{rij.nummer}</Text>
            <Text style={[styles.cel, { width: COLS[1].width }]}>{formatDatum(rij.start)}</Text>
            <Text style={[styles.cel, { width: COLS[2].width }]}>{rij.lengte}</Text>
            <Text style={[styles.cel, { width: COLS[3].width }]}>{afwijking}</Text>
            <Text style={[styles.cel, { width: COLS[4].width }]}>{markers.length ? markers.join('; ') : 'geen'}</Text>
          </View>
        )
      })}
    </View>
  )
}

// Klein zakelijk lijngrafiekje (zwarte lijn, dunne nullijn)
function MiniLijnGrafiek({ punten, breedte = 220, hoogte = 52 }) {
  const waarden = punten.map(p => p.waarde).filter(v => v != null)
  if (waarden.length < 2) return null

  const min = Math.min(...waarden)
  const max = Math.max(...waarden)
  const spreiding = max - min || 1
  const stapX = breedte / (punten.length - 1)

  const coords = punten
    .map((p, i) => {
      if (p.waarde == null) return null
      const x = i * stapX
      const y = hoogte - ((p.waarde - min) / spreiding) * (hoogte - 8) - 4
      return `${Math.round(x * 10) / 10},${Math.round(y * 10) / 10}`
    })
    .filter(Boolean)
    .join(' ')

  return (
    <View>
      <Svg width={breedte} height={hoogte}>
        <Line x1="0" y1={hoogte - 4} x2={breedte} y2={hoogte - 4} stroke={HAARLIJN} strokeWidth="0.5" />
        <Polyline points={coords} fill="none" stroke={INKT} strokeWidth="1" />
      </Svg>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', width: breedte }}>
        <Text style={styles.asLabel}>{punten[0].label}</Text>
        <Text style={styles.asLabel}>{punten[punten.length - 1].label}</Text>
      </View>
    </View>
  )
}

function SlaapHerstelSectie({ wearable }) {
  const slaapPunten = wearable.maanden.map(m => ({ label: m.label, waarde: m.slaapuurGem }))
  const hrvPunten = wearable.maanden.map(m => ({ label: m.label, waarde: m.hrvGem }))

  return (
    <View>
      <Text style={styles.sectieTitel}>2. Slaap en herstel (wearable)</Text>
      <Text style={styles.sectieNoot}>
        Maandgemiddelden uit gekoppelde wearable-data. Nachtelijke temperatuur is via de
        huidige koppeling niet beschikbaar en ontbreekt daarom in dit rapport.
      </Text>

      <View style={styles.tabel}>
        <View style={styles.kopRij}>
          <Text style={[styles.kopCel, { width: '25%' }]}>Maand</Text>
          <Text style={[styles.kopCel, { width: '25%' }]}>Slaapduur gem. (u)</Text>
          <Text style={[styles.kopCel, { width: '25%' }]}>HRV gem. (ms)</Text>
          <Text style={[styles.kopCel, { width: '25%' }]}>Geregistreerde nachten</Text>
        </View>
        {wearable.maanden.map(m => (
          <View key={m.maand} style={styles.rij}>
            <Text style={[styles.cel, { width: '25%' }]}>{m.label}</Text>
            <Text style={[styles.cel, { width: '25%' }]}>{m.slaapuurGem ?? '-'}</Text>
            <Text style={[styles.cel, { width: '25%' }]}>{m.hrvGem ?? '-'}</Text>
            <Text style={[styles.cel, { width: '25%' }]}>{m.nachten}</Text>
          </View>
        ))}
      </View>

      <View style={[styles.grafiekBlok, { gap: 36 }]}>
        <View>
          <Text style={[styles.grafiekLabel, { marginTop: 10 }]}>Slaapduur per maand (uur)</Text>
          <MiniLijnGrafiek punten={slaapPunten} />
        </View>
        <View>
          <Text style={[styles.grafiekLabel, { marginTop: 10 }]}>HRV per maand (ms)</Text>
          <MiniLijnGrafiek punten={hrvPunten} />
        </View>
      </View>

      {wearable.hrvTrend != null && (
        <Text style={{ fontSize: 8, color: GRIJS, marginTop: 6 }}>
          HRV-verloop over de periode: {wearable.hrvTrend > 0 ? '+' : ''}{wearable.hrvTrend} ms
          (gemiddelde tweede helft t.o.v. eerste helft).
        </Text>
      )}
    </View>
  )
}

function SymptomenSectie({ frequenties, sectieNummer }) {
  return (
    <View>
      <Text style={styles.sectieTitel}>{sectieNummer}. Gelogde symptomen</Text>
      <Text style={styles.sectieNoot}>
        Frequentie van zelfgerapporteerde symptomen in de rapportperiode, zonder interpretatie.
      </Text>
      {frequenties.length === 0 ? (
        <Text style={styles.cel}>Geen symptomen gelogd in deze periode.</Text>
      ) : (
        <View style={styles.tabel}>
          <View style={styles.kopRij}>
            <Text style={[styles.kopCel, { width: '60%' }]}>Symptoom</Text>
            <Text style={[styles.kopCel, { width: '40%' }]}>Aantal keer gelogd</Text>
          </View>
          {frequenties.map(f => (
            <View key={f.label} style={styles.rij}>
              <Text style={[styles.cel, { width: '60%' }]}>{f.label}</Text>
              <Text style={[styles.cel, { width: '40%' }]}>{f.aantal}</Text>
            </View>
          ))}
        </View>
      )}
    </View>
  )
}

// Checklist met vragen om het gesprek voor te bereiden. Bewust als vragen
// geformuleerd, niet als diagnose of als opdracht om onderzoeken aan te vragen.
function DoktergesprekSectie({ sectieNummer }) {
  const vragen = [
    'Kan mijn schildklier worden gecontroleerd (TSH)? Schildklierklachten lijken op overgangsklachten.',
    'Kan mijn vitamine B12 en foliumzuur worden bekeken? Tekorten kunnen vermoeidheid en concentratieklachten geven.',
    'Kan mijn bloedsuiker worden gecontroleerd (HbA1c)?',
    'Passen mijn klachten (zoals slecht slapen, opvliegers of concentratieproblemen) bij de perimenopauze, of kan er iets anders spelen?',
    'Welke opties heb ik, en passen die bij mijn situatie en gezondheid?',
  ]
  return (
    <View wrap={false}>
      <Text style={styles.sectieTitel}>{sectieNummer}. Vragen om te bespreken met je huisarts</Text>
      <Text style={styles.sectieNoot}>
        Algemene aandachtspunten om het gesprek voor te bereiden, gebaseerd op gangbare
        richtlijnen. Dit is geen diagnose en geen advies om zelf onderzoeken aan te vragen.
      </Text>
      {vragen.map((v, i) => (
        <View key={i} style={{ flexDirection: 'row', marginBottom: 3, paddingRight: 12 }}>
          <Text style={[styles.cel, { width: 12 }]}>{'•'}</Text>
          <Text style={[styles.cel, { flex: 1 }]}>{v}</Text>
        </View>
      ))}
    </View>
  )
}

export function RapportDocument({ overzicht, wearable, symptomen, exportDatum }) {
  const vanaf = new Date(exportDatum)
  vanaf.setMonth(vanaf.getMonth() - RAPPORT_PERIODE_MAANDEN)

  return (
    <Document
      title="Ovari Cyclusrapport"
      author="Ovari"
      subject={`Cyclus- en wearable-data ${formatDatum(vanaf)} - ${formatDatum(exportDatum)}`}
    >
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.headerRij}>
          <View>
            <Text style={styles.titel}>Cyclusrapport</Text>
            <Text style={styles.meta}>
              Periode: {formatDatum(vanaf)} t/m {formatDatum(exportDatum)} ({RAPPORT_PERIODE_MAANDEN} maanden)
            </Text>
            <Text style={styles.meta}>Geëxporteerd op {formatDatum(exportDatum)}</Text>
          </View>
          <Text style={styles.woordmerk}>Ovari</Text>
        </View>

        {/* 1. Cyclusoverzicht */}
        <Text style={styles.sectieTitel}>1. Cyclusoverzicht</Text>
        <Text style={styles.sectieNoot}>
          Voltooide cycli in de rapportperiode. Baseline = mediaan van de eigen cycluslengtes
          ({overzicht.baseline} dagen). Markers volgen STRAW+10-criteria: een lengteverschil van
          7 dagen of meer t.o.v. de vorige cyclus, en cycli van 60 dagen of langer.
        </Text>
        <CyclusTabel overzicht={overzicht} />

        {/* 2. Slaap & herstel — alleen met wearable-data */}
        {wearable && <SlaapHerstelSectie wearable={wearable} />}

        {/* 3. Symptomen */}
        <SymptomenSectie frequenties={symptomen} sectieNummer={wearable ? 3 : 2} />

        {/* Vragen voor het doktersgesprek */}
        <DoktergesprekSectie sectieNummer={wearable ? 4 : 3} />

        {/* Footer met disclaimer */}
        <View style={styles.footer} fixed>
          <Text style={styles.disclaimer}>
            Dit rapport bevat zelfgerapporteerde en wearable-data en is geen medisch advies of
            diagnose. Gegenereerd door Ovari op het apparaat van de gebruiker; er is geen data
            naar een server verstuurd voor dit rapport.
          </Text>
        </View>
      </Page>
    </Document>
  )
}

// Genereert de PDF volledig client-side en geeft een Blob terug
export async function genereerRapportBlob(data) {
  return pdf(<RapportDocument {...data} />).toBlob()
}
