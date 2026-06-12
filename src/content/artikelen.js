// Artikelbibliotheek Learning Hub.
// Toon: nuchter, feitelijk Nederlands. Geen medische claims, geen beloftes —
// uitleg en context, met "bespreek het met je huisarts" waar dat hoort.
// Elke wijziging hier is direct zichtbaar; er is geen CMS of backend nodig.

export const ARTIKELEN = [
  {
    id: 'cyclus-vier-fasen',
    title: 'Je cyclus begrijpen: de vier fasen',
    subtitle: 'Wat er elke maand gebeurt, zonder poespas',
    category: 'cycle',
    difficulty: 'beginner',
    readTime: 6,
    description: 'Menstruatie, folliculaire fase, ovulatie en luteale fase: wat ze zijn, hoe lang ze duren en wat normaal is.',
    source: 'FemFlow Redactie',
    body: [
      {
        kop: 'De cyclus is geen klok',
        tekst: 'Een cyclus loopt van de eerste dag van je menstruatie tot de dag voor de volgende. Het gemiddelde is 28 dagen, maar alles tussen 21 en 35 dagen geldt als gebruikelijk — en ook binnen één persoon verschilt het van maand tot maand. Een paar dagen variatie is geen afwijking; het is hoe lichamen werken.',
      },
      {
        kop: '1. Menstruatie (dag 1 tot ±5)',
        tekst: 'Het baarmoederslijmvlies wordt afgestoten. Oestrogeen en progesteron zijn allebei laag. Veel vrouwen merken minder energie en een lagere belastbaarheid; wearables laten in deze dagen vaak een iets verhoogde rusthartslag zien aan het begin, die daarna daalt.',
      },
      {
        kop: '2. Folliculaire fase (tot de ovulatie)',
        tekst: 'De hypofyse stimuleert het rijpen van een eiblaasje en oestrogeen stijgt gestaag. Dit is voor veel vrouwen de fase met de meeste energie: slaap is vaak dieper en HRV ligt gemiddeld hoger dan in de tweede cyclushelft.',
      },
      {
        kop: '3. Ovulatie (rond het midden)',
        tekst: 'Een piek in luteïniserend hormoon zet de eisprong in gang. De ovulatie zelf duurt kort — ongeveer een dag. Sommige vrouwen voelen een steek aan één kant van de onderbuik; de meesten merken niets.',
      },
      {
        kop: '4. Luteale fase (na de ovulatie)',
        tekst: 'Het achtergebleven blaasje maakt progesteron. Dat verhoogt de lichaamstemperatuur licht (ongeveer 0,3 graad) en bij veel vrouwen óók de rusthartslag, terwijl HRV wat zakt. Dit is normaal en zichtbaar in wearable-data: een "slechtere" herstelscore in je luteale fase zegt dus niet automatisch dat er iets mis is.',
      },
      {
        kop: 'Waarom loggen loont',
        tekst: 'Pas als je een paar cycli hebt vastgelegd, zie je jóuw patroon — en kun je afwijkingen daarvan herkennen. Daarom draait FemFlow om de logknop: één tik per cyclusstart is genoeg om je eigen referentiekader op te bouwen.',
      },
    ],
  },
  {
    id: 'perimenopauze-herkennen',
    title: 'Perimenopauze herkennen',
    subtitle: 'Wat de wetenschap als signalen telt — en wat niet',
    category: 'cycle',
    difficulty: 'intermediate',
    readTime: 8,
    description: 'De overgang begint jaren voor de laatste menstruatie. Twee meetbare cyclussignalen nemen onderzoekers serieus.',
    source: 'Gebaseerd op STRAW+10-criteria',
    body: [
      {
        kop: 'Eerst de termen',
        tekst: 'Menopauze is één moment: een jaar na je laatste menstruatie. Alles daarvóór — de jaren waarin cycli en hormonen gaan schommelen — heet perimenopauze. Die fase begint gemiddeld tussen de 40 en 44, maar eerder of later komt veel voor. De fase kan twee tot tien jaar duren.',
      },
      {
        kop: 'Het meetbare signaal: je cycluslengte',
        tekst: 'Onderzoekers gebruiken het STRAW+10-raamwerk om de overgangsfasen in te delen. De vroege overgang kenmerkt zich door een aanhoudend verschil van zeven dagen of meer tussen opeenvolgende cycli — bijvoorbeeld een cyclus van 24 dagen gevolgd door één van 33. De late overgang kenmerkt zich door cycli van 60 dagen of langer: er worden dan menstruaties overgeslagen.',
      },
      {
        kop: 'Dit is precies wat FemFlow markeert',
        tekst: 'De markers in je cyclushistorie en het huisartsrapport ("±7 dagen t.o.v. vorige" en "60+ dagen") zijn deze STRAW-signalen. Eén keer een afwijkende cyclus betekent niets — stress, ziekte of reizen verstoren een cyclus ook. Het patroon over meerdere cycli is wat telt.',
      },
      {
        kop: 'En de andere klachten dan?',
        tekst: 'Opvliegers, slechter slapen, stemmingswisselingen en brain fog komen veel voor in de perimenopauze, maar zijn op zichzelf geen bewijs: ze hebben veel mogelijke oorzaken. Daarom is het loggen van symptomen náást je cyclus zo nuttig — het laat zien of klachten samenvallen met cyclusveranderingen.',
      },
      {
        kop: 'Wanneer naar de huisarts',
        tekst: 'Bij aanhoudende cyclusveranderingen, klachten die je dagelijks functioneren raken, of bloedverlies na seks of tussen menstruaties door: maak een afspraak. Neem je FemFlow-huisartsrapport mee — zes maanden objectieve data is een beter gespreksbegin dan "het voelt anders".',
      },
    ],
  },
  {
    id: 'perimenopauze-breedte',
    title: 'Hoe breed perimenopauze kan zijn',
    subtitle: 'Van opvliegers tot tinnitus — en waarom dat biologisch logisch is',
    category: 'cycle',
    difficulty: 'intermediate',
    readTime: 7,
    description: 'Uitgebreide symptoomlijsten tellen 60 tot 100+ klachten. Wat daarvan klopt, wat framing is, en hoe je er zelf wijs uit wordt.',
    source: 'FemFlow Redactie',
    body: [
      {
        kop: 'Eerst de nuance: er bestaat geen officiële lijst',
        tekst: 'Online circuleren lijsten met "de 34 symptomen" of "70 klachten van de overgang". Die exacte aantallen zijn marketing — er is geen wetenschappelijk vastgestelde telling. Maar de strekking klopt wél: uitgebreide klinische overzichten van perimenopauze-klachten komen ruim boven de zestig uit. De overgang is veel breder dan opvliegers.',
      },
      {
        kop: 'Waarom zo breed: oestrogeen werkt overal',
        tekst: 'Oestrogeenreceptoren zitten niet alleen in je voortplantingsorganen maar door je hele lichaam: hersenen, hart en vaten, huid, slijmvliezen, botten, gewrichten, blaas. Als de oestrogeenspiegels in de perimenopauze gaan schommelen, kan elk van die systemen meedoen. Eén hormoon, veel orgaansystemen — dus veel mogelijke klachten.',
      },
      {
        kop: 'De grote categorieën',
        tekst: 'Cyclus en hormonaal: onregelmatige of veranderende menstruaties, heviger of juist lichter bloedverlies, verergerde PMS, gevoelige borsten. Vasomotorisch: opvliegers, nachtzweten, koude rillingen, hartkloppingen. Slaap en energie: slecht inslapen, vroeg wakker, aanhoudende vermoeidheid. Mentaal: brain fog, vergeetachtigheid, prikkelbaarheid, angst, stemmingswisselingen, somberheid. Fysiek: gewrichts- en spierpijn, hoofdpijn, duizeligheid, droge huid en ogen, jeuk, dunner haar. Urogenitaal: vaginale droogheid, pijn bij seks, verminderd libido, vaker plassen, blaasontstekingen. En verder: opgeblazen gevoel, tinnitus, rusteloze benen.',
      },
      {
        kop: 'Bloedwaarden kunnen normaal zijn terwijl jij klachten hebt',
        tekst: 'Hormoonspiegels schommelen in de perimenopauze van week tot week, soms van dag tot dag. Eén bloedtest is een momentopname en kan keurig "normaal" uitvallen midden in een fase vol klachten. Daarom is perimenopauze een klinische diagnose: leeftijd plus cycluspatroon plus klachten wegen zwaarder dan een enkele labwaarde. Jouw gelogde cyclusdata is dus geen bijzaak — het is het diagnostische anker.',
      },
      {
        kop: 'De valkuil: niet álles is de overgang',
        tekst: 'Een lijst waar bijna elke klacht op past, heeft ook een risico: echte andere oorzaken missen. Vermoeidheid kan ook ijzertekort of een schildklierprobleem zijn; hartkloppingen verdienen sowieso aandacht. En bloedverlies na seks, tussen menstruaties door, of opnieuw bloedverlies nadat je menstruatie al een jaar weg was — dat zijn rode vlaggen die altijd een huisartsbezoek waard zijn, los van de overgang.',
      },
      {
        kop: 'Wat je er praktisch mee kunt',
        tekst: 'Log wat jij herkent — de logger heeft naast de tien snelle tegels een uitklapbare laag met minder frequente klachten. Na twee, drie cycli zie je in je cyclushistorie of klachten met je cyclus meebewegen, en bevat je huisartsrapport een objectief overzicht. Daarmee voer je een ander gesprek bij de huisarts dan met "het voelt allemaal anders".',
      },
    ],
  },
  {
    id: 'slaap-en-cyclus',
    title: 'Slaap en je cyclus',
    subtitle: 'Waarom dezelfde nacht niet elke week hetzelfde voelt',
    category: 'sleep',
    difficulty: 'beginner',
    readTime: 6,
    description: 'Progesteron, lichaamstemperatuur en slaapkwaliteit hangen samen. Wat je wearable laat zien en wat je eraan hebt.',
    source: 'FemFlow Redactie',
    body: [
      {
        kop: 'De tweede cyclushelft slaapt anders',
        tekst: 'Na de ovulatie stijgt progesteron en daarmee je kerntemperatuur, met enkele tienden van een graad. Omdat inslapen gepaard gaat met een dalende lichaamstemperatuur, kan dat opstaan tegen het inslapen werken. Veel vrouwen rapporteren in de late luteale fase lichtere slaap en vaker wakker worden — en wearables bevestigen dat beeld gemiddeld genomen.',
      },
      {
        kop: 'Wat je wearable wel en niet ziet',
        tekst: 'Slaapduur en diepe slaap uit een wearable zijn schattingen op basis van beweging en hartslag — geen slaaplab. De absolute getallen zijn minder interessant dan de trend: slaap je in jouw luteale fase structureel korter dan in je folliculaire fase, dan is dat een patroon waar je rekening mee kunt houden.',
      },
      {
        kop: 'Wat helpt, nuchter bekeken',
        tekst: 'De basis blijft de basis: een koele slaapkamer (zeker in de luteale fase, als je kerntemperatuur al hoger is), vaste bedtijden, alcohol matigen (het verstoort aantoonbaar de slaapstructuur) en cafeïne ruim voor het slapen laten staan. Plan in de week voor je menstruatie wat ruimer voor slaap als je merkt dat die fase je zwaarder valt.',
      },
      {
        kop: 'In de perimenopauze',
        tekst: 'Slaapklachten horen bij de meest gerapporteerde overgangsklachten, mede door nachtelijke opvliegers. Houd ze bij in FemFlow: het patroon (wanneer in je cyclus, hoe vaak) is waardevolle informatie voor een gesprek met je huisarts.',
      },
    ],
  },
  {
    id: 'stress-hrv-cyclus',
    title: 'HRV, stress en je cyclus',
    subtitle: 'Wat dat ene getal wel en niet over je zegt',
    category: 'stress',
    difficulty: 'intermediate',
    readTime: 7,
    description: 'Hartslagvariabiliteit is een venster op je herstel — als je weet hoe je ernaar moet kijken.',
    source: 'FemFlow Redactie',
    body: [
      {
        kop: 'Wat HRV is',
        tekst: 'Hartslagvariabiliteit (HRV) meet de variatie in tijd tussen hartslagen. Meer variatie wijst doorgaans op een actiever "rust-en-herstel"-systeem (parasympathisch); aanhoudend lage HRV past bij belasting — fysiek, mentaal of allebei. Het is geen rapportcijfer maar een signaal.',
      },
      {
        kop: 'Vergelijk jezelf alleen met jezelf',
        tekst: 'HRV verschilt enorm tussen mensen: 25 ms kan voor de één normaal zijn waar een ander op 90 ms zit. Getallen van anderen zeggen dus niets. Wat wél betekenis heeft: jouw waarde vergeleken met jouw eigen gemiddelde van de afgelopen weken. Daarom toont FemFlow trends, geen losse dagscores.',
      },
      {
        kop: 'De cyclus zit in je HRV',
        tekst: 'Gemiddeld ligt HRV in de folliculaire fase hoger en zakt hij na de ovulatie, wanneer progesteron stijgt. Een dip in je luteale fase is dus deels gewoon cyclus — geen reden tot zorg. Interessant wordt het pas als een daling aanhoudt over meerdere weken, dwars door je cyclusfasen heen.',
      },
      {
        kop: 'Wat een dalende trend kan betekenen',
        tekst: 'Aanhoudend dalende HRV past bij chronische stress, slaaptekort, overtraining, een sluimerende infectie of alcohol. Het is een aanleiding om je belasting en herstel onder de loep te nemen — niet om in paniek te raken. Voelt het structureel mis, of komen er klachten bij: huisarts.',
      },
    ],
  },
  {
    id: 'ijzer-en-menstruatie',
    title: 'IJzer en menstruatie',
    subtitle: 'Waarom juist menstruerende vrouwen op hun ijzer letten',
    category: 'nutrition',
    difficulty: 'beginner',
    readTime: 5,
    description: 'Maandelijks bloedverlies betekent maandelijks ijzerverlies. Wat dat betekent voor je energie en je bord.',
    source: 'FemFlow Redactie',
    body: [
      {
        kop: 'De rekensom',
        tekst: 'Met elke menstruatie verlies je bloed en daarmee ijzer. Bij hevige menstruaties kan dat verlies groter zijn dan wat een doorsnee voedingspatroon aanvult. IJzertekort is bij menstruerende vrouwen een van de meest voorkomende tekorten — en vermoeidheid is vaak het eerste merkbare gevolg.',
      },
      {
        kop: 'IJzer in voeding',
        tekst: 'Dierlijk ijzer (vlees, vis) neemt je lichaam het makkelijkst op. Plantaardig ijzer (peulvruchten, volkoren granen, groene bladgroenten, noten) telt ook mee, en de opname verbetert als je er vitamine C bij eet — een glas sinaasappelsap bij de linzen is geen fabeltje. Koffie en thee bij de maaltijd remmen de opname juist.',
      },
      {
        kop: 'Supplement of niet?',
        tekst: 'IJzer draagt bij tot de vermindering van vermoeidheid en moeheid — dat is een door de EU goedgekeurde claim. Maar zomaar hoog doseren is onverstandig: te veel ijzer geeft maagklachten en hoort niet bij iedereen. De nette route bij aanhoudende vermoeidheid is eerst een bloedtest via de huisarts; die laat zien of een tekort überhaupt het probleem is.',
      },
      {
        kop: 'Let extra op bij hevige menstruaties',
        tekst: 'Moet je elke een tot twee uur verschonen, of menstrueer je langer dan zeven dagen? Dat geldt als hevig bloedverlies en is op zichzelf al een goede reden voor een huisartsbezoek — los van het ijzerverhaal.',
      },
    ],
  },
  {
    id: 'trainen-met-je-cyclus',
    title: 'Trainen met je cyclus mee',
    subtitle: 'Wat het onderzoek wél en niet onderbouwt',
    category: 'exercise',
    difficulty: 'intermediate',
    readTime: 7,
    description: 'Cyclusgebaseerd trainen is populair. De wetenschap is genuanceerder dan de hype — en dat is goed nieuws.',
    source: 'FemFlow Redactie',
    body: [
      {
        kop: 'Eerst de hype ontluchten',
        tekst: 'Studies naar prestaties per cyclusfase spreken elkaar tegen, en de verschillen die gevonden worden zijn klein. Er bestaat geen wetenschappelijk bewezen trainingsschema dat voor alle vrouwen per fase voorschrijft wat ze moeten doen. Wie dat verkoopt, overdrijft.',
      },
      {
        kop: 'Wat er wél staat',
        tekst: 'Veel vrouwen ervaren rond de menstruatie en in de late luteale fase minder energie en meer ervaren inspanning bij dezelfde training. Dat ervaren verschil is reëel en reden genoeg om je schema er flexibel op aan te passen — niet omdat het moet, maar omdat het prettiger traint.',
      },
      {
        kop: 'Een werkbare vuistregel',
        tekst: 'Plan je zwaarste sessies in de periode waarin jij je doorgaans sterk voelt (voor velen: de folliculaire fase), en houd opties open rond je menstruatie: een rustige duurtraining of mobiliteit in plaats van intervallen. Je wearable-herstelscores plus je eigen gevoel zijn betere gidsen dan een generiek fase-schema.',
      },
      {
        kop: 'Bewegen blijft de winnaar',
        tekst: 'Het best onderbouwde advies is saai: regelmatige beweging — kracht én conditie — verbetert slaap, stemming en gezondheid in elke cyclusfase, en lijkt ook overgangsklachten te verlichten. De beste training is degene die je volhoudt.',
      },
    ],
  },
  {
    id: 'pms-en-stemming',
    title: 'PMS en stemming',
    subtitle: 'Wat er hormonaal gebeurt en wanneer het meer is dan PMS',
    category: 'mood',
    difficulty: 'beginner',
    readTime: 6,
    description: 'Prikkelbaarheid en somberheid voor je menstruatie zijn veelvoorkomend. Loggen maakt het patroon zichtbaar.',
    source: 'FemFlow Redactie',
    body: [
      {
        kop: 'Wat PMS is',
        tekst: 'Premenstrueel syndroom is de verzamelnaam voor lichamelijke en mentale klachten in de week (of twee) voor de menstruatie, die na de start ervan weer verdwijnen. De timing is het kenmerk: het is de samenhang met de luteale fase die klachten tot PMS maakt, niet de klachten zelf.',
      },
      {
        kop: 'Waarom het gebeurt',
        tekst: 'Het precieze mechanisme is niet volledig opgehelderd, maar de gevoeligheid van de hersenen voor de dalende progesteron- en oestrogeenspiegels aan het eind van de cyclus speelt een hoofdrol. Sommige vrouwen zijn daar gevoeliger voor dan andere — dat is biologie, geen zwakte.',
      },
      {
        kop: 'Loggen maakt het bespreekbaar',
        tekst: 'Door stemming als symptoom te loggen in FemFlow zie je na een paar cycli of er echt een patroon zit: komen de sombere dagen steeds in dezelfde fase? Die informatie is goud waard — voor jezelf (je weet wat eraan komt) en voor een eventueel gesprek met je huisarts.',
      },
      {
        kop: 'Wanneer het meer is dan PMS',
        tekst: 'Als somberheid of prikkelbaarheid zo heftig is dat werk of relaties eronder lijden, kan er sprake zijn van PMDD (premenstruele stemmingsstoornis) — een erkende aandoening waar behandeling voor bestaat. Ook stemming die níet met je cyclus meebeweegt verdient aandacht. In beide gevallen: huisarts, en neem je gelogde data mee.',
      },
    ],
  },
  {
    id: 'wearable-wat-meet-je',
    title: 'Wat je wearable eigenlijk meet',
    subtitle: 'Slaap, HRV en rusthartslag — schattingen met waarde',
    category: 'sleep',
    difficulty: 'beginner',
    readTime: 6,
    description: 'Een ring of horloge is geen lab. Hoe de metingen werken en hoe je er verstandig mee omgaat.',
    source: 'FemFlow Redactie',
    body: [
      {
        kop: 'Hoe het werkt',
        tekst: 'Wearables meten beweging (accelerometer) en doorbloeding via lichtsensoren op de huid. Daaruit leiden algoritmes hartslag, hartslagvariabiliteit en slaapfasen af. Dat zijn schattingen: vooral de verdeling in slaapfasen (diep, REM, licht) wijkt regelmatig af van wat een slaaplab zou meten.',
      },
      {
        kop: 'Trend boven momentopname',
        tekst: 'De kracht van een wearable zit niet in de precisie van één nacht maar in de consistentie: hij meet jou elke nacht op dezelfde manier. Systematische veranderingen — je rusthartslag die weken stijgt, je slaapduur die structureel zakt — zijn betrouwbaar zichtbaar, ook als de absolute getallen iets afwijken.',
      },
      {
        kop: 'De cyclus als verborgen factor',
        tekst: 'Rusthartslag en temperatuur stijgen licht in de luteale fase, HRV zakt wat. Wie dat niet weet, leest elke maand een "verslechtering" die er geen is. FemFlow legt je wearable-data daarom naast je cyclusdata — dezelfde nacht betekent iets anders op dag 5 dan op dag 25.',
      },
      {
        kop: 'Gezond omgaan met de getallen',
        tekst: 'Check trends wekelijks in plaats van elke ochtend je score te laten bepalen hoe je dag voelt. En onthoud: jij bent de bron van waarheid. Voel je je goed terwijl de score laag is, vertrouw dan je lijf — de wearable werkt voor jou, niet andersom.',
      },
    ],
  },
]

// Afgeleide structuren voor de Learning Hub-weergave
export const FEATURED_IDS = ['perimenopauze-herkennen', 'cyclus-vier-fasen', 'slaap-en-cyclus']

export const AANBEVOLEN = [
  { id: 'perimenopauze-breedte', reason: 'Veelgevraagd: de brede waaier aan klachten' },
  { id: 'ijzer-en-menstruatie', reason: 'Relevant tijdens je menstruatie' },
  { id: 'stress-hrv-cyclus', reason: 'Voor wie wearable-data gebruikt' },
  { id: 'pms-en-stemming', reason: 'Gebaseerd op veelgelogde symptomen' },
  { id: 'trainen-met-je-cyclus', reason: 'Past bij je activiteitendata' },
  { id: 'wearable-wat-meet-je', reason: 'Voor wie net gekoppeld heeft' },
]

const perId = Object.fromEntries(ARTIKELEN.map(a => [a.id, a]))

export const FEATURED = FEATURED_IDS.map(id => perId[id])
export const RECOMMENDED = AANBEVOLEN.map(({ id, reason }) => ({ ...perId[id], reason }))
export const BY_CATEGORY = ARTIKELEN.reduce((acc, artikel) => {
  acc[artikel.category] = acc[artikel.category] || []
  acc[artikel.category].push(artikel)
  return acc
}, {})

export function vindArtikel(id) {
  return perId[id] || null
}
