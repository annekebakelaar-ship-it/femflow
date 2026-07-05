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
    source: 'Ovari Redactie',
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
        tekst: 'Pas als je een paar cycli hebt vastgelegd, zie je jóuw patroon — en kun je afwijkingen daarvan herkennen. Daarom draait Ovari om de logknop: één tik per cyclusstart is genoeg om je eigen referentiekader op te bouwen.',
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
        kop: 'Dit is precies wat Ovari markeert',
        tekst: 'De markers in je cyclushistorie en het huisartsrapport ("±7 dagen t.o.v. vorige" en "60+ dagen") zijn deze STRAW-signalen. Eén keer een afwijkende cyclus betekent niets — stress, ziekte of reizen verstoren een cyclus ook. Het patroon over meerdere cycli is wat telt.',
      },
      {
        kop: 'En de andere klachten dan?',
        tekst: 'Opvliegers, slechter slapen, stemmingswisselingen en brain fog komen veel voor in de perimenopauze, maar zijn op zichzelf geen bewijs: ze hebben veel mogelijke oorzaken. Daarom is het loggen van symptomen náást je cyclus zo nuttig — het laat zien of klachten samenvallen met cyclusveranderingen.',
      },
      {
        kop: 'Wanneer naar de huisarts',
        tekst: 'Bij aanhoudende cyclusveranderingen, klachten die je dagelijks functioneren raken, of bloedverlies na seks of tussen menstruaties door: maak een afspraak. Neem je Ovari-huisartsrapport mee — zes maanden objectieve data is een beter gespreksbegin dan "het voelt anders".',
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
    source: 'Ovari Redactie',
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
    source: 'Ovari Redactie',
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
        tekst: 'Slaapklachten horen bij de meest gerapporteerde overgangsklachten, mede door nachtelijke opvliegers. Houd ze bij in Ovari: het patroon (wanneer in je cyclus, hoe vaak) is waardevolle informatie voor een gesprek met je huisarts.',
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
    source: 'Ovari Redactie',
    body: [
      {
        kop: 'Wat HRV is',
        tekst: 'Hartslagvariabiliteit (HRV) meet de variatie in tijd tussen hartslagen. Meer variatie wijst doorgaans op een actiever "rust-en-herstel"-systeem (parasympathisch); aanhoudend lage HRV past bij belasting — fysiek, mentaal of allebei. Het is geen rapportcijfer maar een signaal.',
      },
      {
        kop: 'Vergelijk jezelf alleen met jezelf',
        tekst: 'HRV verschilt enorm tussen mensen: 25 ms kan voor de één normaal zijn waar een ander op 90 ms zit. Getallen van anderen zeggen dus niets. Wat wél betekenis heeft: jouw waarde vergeleken met jouw eigen gemiddelde van de afgelopen weken. Daarom toont Ovari trends, geen losse dagscores.',
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
    source: 'Ovari Redactie',
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
    source: 'Ovari Redactie',
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
    source: 'Ovari Redactie',
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
        tekst: 'Door stemming als symptoom te loggen in Ovari zie je na een paar cycli of er echt een patroon zit: komen de sombere dagen steeds in dezelfde fase? Die informatie is goud waard — voor jezelf (je weet wat eraan komt) en voor een eventueel gesprek met je huisarts.',
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
    source: 'Ovari Redactie',
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
        tekst: 'Rusthartslag en temperatuur stijgen licht in de luteale fase, HRV zakt wat. Wie dat niet weet, leest elke maand een "verslechtering" die er geen is. Ovari legt je wearable-data daarom naast je cyclusdata — dezelfde nacht betekent iets anders op dag 5 dan op dag 25.',
      },
      {
        kop: 'Gezond omgaan met de getallen',
        tekst: 'Check trends wekelijks in plaats van elke ochtend je score te laten bepalen hoe je dag voelt. En onthoud: jij bent de bron van waarheid. Voel je je goed terwijl de score laag is, vertrouw dan je lijf — de wearable werkt voor jou, niet andersom.',
      },
    ],
  },
  {
    id: 'brain-fog-overgang',
    title: 'Brain fog in de overgang',
    subtitle: 'Waarom je hoofd mistig voelt, en wat vaak de echte oorzaak is',
    category: 'mood',
    difficulty: 'intermediate',
    readTime: 7,
    description: 'Concentratieproblemen en vergeetachtigheid horen bij de perimenopauze. Vaak zit er verstoorde slaap achter, en het brein herstelt zich. Wat de wetenschap zegt, en hoe je je doktersbezoek voorbereidt.',
    source: 'Gebaseerd op richtlijnen van de British Menopause Society',
    body: [
      {
        kop: 'Brain fog is een echt verschijnsel',
        tekst: 'Moeite met concentreren, op je woorden komen of dingen onthouden: veel vrouwen ervaren dit in de perimenopauze. Het is geen inbeelding en geen vroeg teken van dementie. Onderzoek erkent cognitieve klachten als een van de gebruikelijke, meestal tijdelijke verschijnselen van de overgang.',
      },
      {
        kop: 'Vaak is slaap de verborgen oorzaak',
        tekst: 'Brain fog staat zelden op zichzelf. Nachtelijk zweten en opvliegers breken je slaap, en een slecht uitgeruste nacht geeft de volgende dag precies die mistige, trage kop. De concentratieklachten zijn dan een gevolg van verstoorde slaap, niet direct van de hormonen zelf. Daarom is het zo nuttig om je slaap naast je klachten te leggen: koppel je een wearable, dan zie je of slechtere nachten samenvallen met slechtere dagen.',
      },
      {
        kop: 'Je brein past zich aan, en herstelt',
        tekst: 'Tijdens de overgang verandert de hormoonhuishouding waar het brein op draait, en het brein past zich daaraan aan. Dat aanpassingsvermogen heet neuroplasticiteit. Voor veel vrouwen is dat een geruststelling: onderzoek laat zien dat cognitieve klachten in de overgang vaak tijdelijk zijn en na verloop van tijd verbeteren. Het is een fase, geen eindstation.',
      },
      {
        kop: 'Sluit eerst andere oorzaken uit',
        tekst: 'Mistig denken heeft veel mogelijke oorzaken, en niet allemaal hormonaal. Medische richtlijnen adviseren om bij dit soort klachten ook te kijken naar je schildklier (TSH), je vitamine B12 en foliumzuur, en je bloedsuiker (HbA1c). Ovari stelt geen diagnose en kan dat niet: dit zijn punten om met je huisarts te bespreken, zodat je zeker weet dat je aan de juiste knoppen draait.',
      },
      {
        kop: 'Wat je zelf kunt doen',
        tekst: 'De grootste winst zit vaak in je slaap beschermen: een koele slaapkamer, een vast ritme, en cafeine en alcohol op tijd loslaten. Merk je dat je klachten je dagelijks functioneren raken, ga dan naar je huisarts. Neem je Ovari-huisartsrapport mee: daarin staat een overzicht van je cyclus en je slaap, plus een lijstje vragen dat je met je arts kunt bespreken.',
      },
      {
        kop: 'Wanneer naar de huisarts',
        tekst: 'Bij aanhoudende concentratie- of geheugenklachten die je werk of dagelijks leven raken, of als je je zorgen maakt: maak een afspraak. Objectieve data over een paar maanden is een beter gespreksbegin dan "ik voel me niet scherp".',
      },
    ],
  },
  {
    id: 'opvliegers-nachtzweten',
    title: 'Opvliegers en nachtzweten',
    subtitle: 'Wat er in je lichaam gebeurt, en wat er echt helpt',
    category: 'cycle',
    difficulty: 'intermediate',
    readTime: 7,
    description: 'Het bekendste overgangssymptoom, nuchter uitgelegd: waarom je het krijgt, wat je wearable ziet, en welke maatregelen onderbouwd zijn.',
    source: 'Ovari Redactie',
    body: [
      {
        kop: 'Wat een opvlieger eigenlijk is',
        tekst: 'Je lichaam houdt je kerntemperatuur binnen een smalle comfortzone. Zolang je daarbinnen blijft, doet je warmteregeling niets. In de overgang gaan de oestrogeenspiegels schommelen, en daardoor wordt die comfortzone smaller: een kleine stijging van je lichaamstemperatuur die je vroeger niet eens merkte, tikt nu de grens aan. Je lichaam denkt dat je oververhit raakt en schiet in de koelstand. Bloedvaten in je huid gaan wijd open, je krijgt een golf van warmte, je gaat zweten, en daarna kun je juist koud en klam worden. Dat hele mechanisme is normaal; het is alleen op een te gevoelige stand gezet.',
      },
      {
        kop: 'Waarom het juist \'s nachts zo hindert',
        tekst: 'Dezelfde golf die je overdag een opvlieger noemt, heet \'s nachts nachtzweten. Het probleem is de timing: een warmtegolf maakt je wakker of houdt je in de lichte slaap, precies in de uren dat je diepe en droomslaap nodig hebt. Veel vrouwen in de overgang slapen niet slecht omdat ze niet moe zijn, maar omdat ze steeds kort wakker schieten. Een warme slaapkamer of een warme zomernacht stapelt bovenop de smallere comfortzone, en dat verklaart waarom dezelfde kamer de ene week prima is en de andere week te warm.',
      },
      {
        kop: 'Wat je wearable ervan ziet',
        tekst: 'Een nacht met opvliegers laat vaak sporen na in je data: een hogere huid- of polstemperatuur, een rusthartslag die een paar slagen boven je normaal ligt, meer korte ontwakingen en minder diepe slaap, en een lagere HRV de ochtend erna. Belangrijk om te weten: dat is context, geen alarm. Een mindere herstelscore na een warme, onrustige nacht betekent niet dat er iets kapot is. Het betekent dat je lichaam een nacht lang tegen de warmte heeft gevochten. Juist door dit te loggen zie je of je klachten samenhangen met je cyclus, de temperatuur of allebei.',
      },
      {
        kop: 'Wat onderbouwd helpt: je omgeving',
        tekst: 'De grootste winst is gedragsmatig en kost niets. Houd je slaapkamer koel, richt op 16 tot 18 graden. Slaap in lagen die je in de nacht makkelijk kwijt kunt: een los laken en een aparte deken werken beter dan een dik dekbed. Leg een reserveshirt en een glas water klaar, zodat een natte wakkerte een onderbreking van twee minuten blijft in plaats van een uur wakker liggen. Kies ademende materialen zoals katoen boven synthetisch.',
      },
      {
        kop: 'Wat onderbouwd helpt: je triggers en je dag',
        tekst: 'Veel vrouwen merken dat alcohol, cafeine, pittig eten en een warme omgeving een opvlieger kunnen uitlokken. Je hoeft niets te verbieden; het helpt al om te weten wat bij jou een golf op gang brengt, en die dingen \'s avonds te beperken. Regelmatig bewegen en, waar dat speelt, werken aan een gezond gewicht zijn in onderzoek geassocieerd met minder klachten. En rustig, langzaam ademen op het moment zelf (vier tellen in, zes tellen uit) kalmeert je zenuwstelsel; de ademoefening in de Leefstijl-hub is daar precies voor.',
      },
      {
        kop: 'Eerlijk over supplementen en kruiden',
        tekst: 'Hier past bescheidenheid. Voor populaire middelen tegen opvliegers, zoals zwarte cohosh of soja-isoflavonen, is het bewijs wisselend en bestaat er geen goedgekeurde gezondheidsclaim. Sommige vrouwen ervaren er iets bij, andere niets. Proberen mag, zolang je weet dat je experimenteert en het meldt bij je huisarts of apotheek als je medicijnen gebruikt. Wat Ovari betreft: we beloven je hier niets, want een eerlijk "we weten het niet zeker" is meer waard dan een mooie claim.',
      },
      {
        kop: 'Wanneer naar de huisarts',
        tekst: 'Raken opvliegers of nachtzweten je slaap, je stemming of je dagelijks functioneren, ga dan langs je huisarts. Er is meer aan te doen dan veel vrouwen denken. Voor hinderlijke overgangsklachten is hormoontherapie voor veel vrouwen een effectieve en, na een goede afweging met je arts, veilige optie. Dat is een medisch gesprek, geen app-beslissing. Neem je Ovari-huisartsrapport mee: een overzicht van je cyclus, je slaap en je gelogde symptomen over een paar maanden is een sterker gespreksbegin dan een losse indruk.',
      },
    ],
  },
  {
    id: 'botgezondheid-overgang',
    title: 'Botgezondheid in de overgang',
    subtitle: 'Het stille onderwerp dat later het meest telt',
    category: 'nutrition',
    difficulty: 'intermediate',
    readTime: 7,
    description: 'Als oestrogeen daalt, gaat botafbraak sneller. Wat de twee bouwstenen zijn, waarom belasting telt, en wanneer een botmeting zinvol is.',
    source: 'Ovari Redactie',
    body: [
      {
        kop: 'Waarom botten er nu toe doen',
        tekst: 'Je bot is levend weefsel dat je hele leven wordt afgebroken en opnieuw opgebouwd. Oestrogeen remt de afbraak, dus zolang je oestrogeenspiegel hoog is, blijft die balans in je voordeel. In de jaren rond je laatste menstruatie daalt oestrogeen, en de afbraak versnelt: vrouwen verliezen in deze periode gemiddeld sneller botdichtheid dan daarvoor of daarna. Je merkt er niets van, en juist dat maakt het een onderwerp om nu iets aan te doen, niet pas als er iets breekt.',
      },
      {
        kop: 'Bouwsteen 1: calcium',
        tekst: 'Calcium is nodig voor de instandhouding van normale botten. De makkelijkste bron is zuivel: een glas melk of een schaaltje kwark levert al zo\'n 300 milligram. Ook groene groenten, noten, tofu en met calcium verrijkte plantaardige dranken tellen mee. Drie tot vier porties per dag brengen de meeste vrouwen in de buurt van de aanbevolen hoeveelheid. Uit voeding halen heeft de voorkeur boven een pil, en meer dan de aanbevolen hoeveelheid slikken heeft geen zin.',
      },
      {
        kop: 'Bouwsteen 2: vitamine D',
        tekst: 'Vitamine D is nodig voor de instandhouding van normale botten en draagt bij tot een normale opname van calcium. Je huid maakt het van zonlicht, maar van oktober tot april lukt dat in Nederland nauwelijks. De algemene richtlijn voor vrouwen boven de vijftig is een supplement van 20 microgram per dag. Dit is een van de weinige supplementadviezen die echt in de Nederlandse richtlijnen staat, en dus een van de weinige waar wij zonder voorbehoud achter staan.',
      },
      {
        kop: 'Belasting bouwt bot',
        tekst: 'Voeding levert de bouwstenen, maar je bot past zich vooral aan aan de belasting die het krijgt. Krachttraining en oefeningen met impact, zoals stevig wandelen, traplopen of springen, geven je botten het signaal om sterk te blijven. Onderzoek bij vrouwen rond de menopauze laat zien dat dit veilig kan en meer doet dan lichte beweging alleen. Balansoefeningen horen erbij: sterke botten zijn de ene helft van het verhaal, niet vallen is de andere. Zie ook de gids over kracht in de Leefstijl-hub.',
      },
      {
        kop: 'Wat je wearable hier niet meet',
        tekst: 'Dit is bewust een onderwerp waar je apparaat je niet bij helpt. Botdichtheid is onzichtbaar voor een ring of horloge; er is geen dagelijkse score die je vooruitgang laat zien. Dat maakt het lastig, want je doet het werk zonder directe feedback. Het is precies daarom een kwestie van gewoonte: twee keer per week kracht en dagelijks je bouwstenen, jarenlang volgehouden, zonder dat een cijfer je aanmoedigt.',
      },
      {
        kop: 'Wanneer een botmeting of de huisarts',
        tekst: 'Heb je risicofactoren, zoals een eerdere botbreuk na een klein ongeluk, botontkalking in de familie, een vroege overgang of langdurig gebruik van bepaalde medicijnen, bespreek dan met je huisarts of een botdichtheidsmeting zinvol is. Ovari stelt geen diagnose en meet je botten niet; dit zijn punten om met je arts te bespreken, zodat je weet of je aan de juiste knoppen draait.',
      },
    ],
  },
  {
    id: 'gewrichtsklachten-overgang',
    title: 'Gewrichtsklachten in de overgang',
    subtitle: 'Het onbekende symptoom dat vaker voorkomt dan je denkt',
    category: 'cycle',
    difficulty: 'beginner',
    readTime: 6,
    description: 'Stijve, pijnlijke gewrichten worden zelden met de overgang in verband gebracht, terwijl het een van de meest gemelde klachten is. Wat erachter zit en wat helpt.',
    source: 'Ovari Redactie',
    body: [
      {
        kop: 'Een klacht die vaak wordt gemist',
        tekst: 'Stijve, pijnlijke of gevoelige gewrichten horen bij de meest gemelde overgangsklachten, en tegelijk bij de minst herkende. Veel vrouwen leggen het verband niet, en denken dat ze "ineens oud worden". \'s Ochtends stijf uit bed, pijnlijke handen of knieen, of een schouder die minder ver komt: het kan echt met de overgang te maken hebben. Je verbeeldt het je niet.',
      },
      {
        kop: 'Waarom gewrichten reageren op hormonen',
        tekst: 'Oestrogeen heeft een licht ontstekingsremmende rol en helpt vocht en soepelheid in je gewrichten en pezen op peil te houden. Als de oestrogeenspiegel daalt en gaat schommelen, ervaren veel vrouwen meer stijfheid en gevoeligheid. Ook komt een stijve, pijnlijke schouder, in de volksmond frozen shoulder, in deze levensfase vaker voor. Het is een reeel patroon dat in onderzoek steeds meer aandacht krijgt.',
      },
      {
        kop: 'Bewegen ondanks de stijfheid',
        tekst: 'De reflex is om een pijnlijk gewricht te ontzien, maar bij dit type klachten werkt het omgekeerde vaak beter: rustig in beweging blijven houdt gewrichten soepel. Een gewricht dat stilstaat wordt stijver. Denk aan wandelen, zwemmen (gewrichtsvriendelijk en fijn bij warme dagen), en lichte mobiliteitsoefeningen. Kracht rond het gewricht, opgebouwd met beleid, geeft steun. Warmte in de ochtend, bijvoorbeeld een warme douche, kan de stijfheid verzachten voordat je op gang komt.',
      },
      {
        kop: 'Niet alles is de overgang',
        tekst: 'Belangrijk en eerlijk: gewrichtspijn heeft veel mogelijke oorzaken. Slijtage (artrose), een ontstekingsziekte zoals reuma, of overbelasting geven vergelijkbare klachten, en die vragen een andere aanpak. De overgang aannemen als verklaring zonder andere oorzaken uit te sluiten is niet verstandig. Twijfel je, dan is je huisarts de plek om het te laten bekijken.',
      },
      {
        kop: 'Wanneer naar de huisarts',
        tekst: 'Ga langs je huisarts bij een gewricht dat gezwollen, warm of rood is, bij pijn in een enkel gewricht die plotseling opkomt, bij klachten die aanhouden of je dagelijks leven raken, of bij ochtendstijfheid die lang duurt. Loggen helpt ook hier: als je bijhoudt wanneer de klachten opspelen, zie je of ze samenhangen met je cyclus, en heb je iets concreets om mee te nemen naar je afspraak.',
      },
    ],
  },
  {
    id: 'hart-na-overgang',
    title: 'Je hart in en na de overgang',
    subtitle: 'Waarom dit de fase is om er aandacht aan te geven',
    category: 'exercise',
    difficulty: 'intermediate',
    readTime: 7,
    description: 'Na de overgang stijgt het risico op hart- en vaatziekten. Wat daarachter zit, welke cijfers tellen, en wat beweging en voeding kunnen doen.',
    source: 'Ovari Redactie',
    body: [
      {
        kop: 'Waarom het risico verschuift',
        tekst: 'Voor de overgang hebben vrouwen gemiddeld een lager risico op hart- en vaatziekten dan mannen. Oestrogeen speelt daarbij een beschermende rol voor je bloedvaten. Als die bescherming in de overgang wegvalt, stijgt het risico geleidelijk, en na de menopauze komt het dichter bij dat van mannen. Dat is geen reden voor angst, wel voor aandacht: dit is de levensfase waarin de gewoonten die je nu opbouwt echt gaan meetellen.',
      },
      {
        kop: 'De cijfers die tellen, meet je niet zelf',
        tekst: 'De belangrijkste hart- en vaatgetallen zijn je bloeddruk en je cholesterol, en die meet je wearable niet. Ze zijn onzichtbaar zonder een meting bij de huisarts of apotheek. Juist omdat je er niets van voelt, is periodiek laten controleren vanaf een jaar of vijfenveertig verstandig, zeker als hart- en vaatziekten in je familie voorkomen. Dit is bij uitstek een onderwerp waar de echte getallen van je arts komen, niet van een app.',
      },
      {
        kop: 'Wat beweging doet',
        tekst: 'Regelmatig bewegen is een van de sterkste dingen die je voor je hart kunt doen. Een mix werkt het best: rustige duurinspanning op praattempo (wandelen, fietsen, zwemmen) onderhoudt je conditie, en krachttraining helpt je spiermassa en stofwisseling op peil te houden. Het overgrote deel van je duurtraining hoort rustig te zijn; harder voelt productiever, maar rustig en volgehouden bouwt de basis.',
      },
      {
        kop: 'Wat voeding kan bijdragen',
        tekst: 'Een paar dingen zijn onderbouwd. Vezels uit volkoren, peulvruchten en groente horen bij een hartgezond eetpatroon. Minder zout helpt je bloeddruk; kalium, onder andere uit groente en fruit, draagt bij tot de instandhouding van een normale bloeddruk. Eet je weinig vette vis, dan is omega-3 het overwegen waard: EPA en DHA dragen bij tot een normale werking van het hart, bij een inname van 250 milligram per dag. Meer belofte dan dat past niet: voeding ondersteunt, het is geen behandeling.',
      },
      {
        kop: 'Wat je wearable wel laat zien',
        tekst: 'Je apparaat meet je bloeddruk en cholesterol niet, maar de trend in je rusthartslag en je HRV over weken en maanden zegt wel iets over hoe je lichaam er in het algemeen voor staat. Een rusthartslag die over langere tijd gunstig meebeweegt met meer bewegen is een teken dat je conditie de goede kant op gaat. Zie het als context bij het echte werk, niet als vervanging van een controle.',
      },
      {
        kop: 'Wanneer naar de huisarts',
        tekst: 'Laat je bloeddruk en cholesterol periodiek controleren vanaf middelbare leeftijd, en eerder als hart- en vaatziekten in je familie voorkomen. Ga direct langs bij klachten als pijn of druk op de borst, kortademigheid bij lichte inspanning, of hartkloppingen die je zorgen baren. Ovari stelt geen diagnose; dit zijn punten voor je arts, en je Ovari-overzicht kan het gesprek helpen starten.',
      },
    ],
  },
]

// Afgeleide structuren voor de Learning Hub-weergave
export const FEATURED_IDS = ['perimenopauze-herkennen', 'cyclus-vier-fasen', 'slaap-en-cyclus']

export const AANBEVOLEN = [
  { id: 'opvliegers-nachtzweten', reason: 'Het bekendste overgangssymptoom, en wat helpt' },
  { id: 'botgezondheid-overgang', reason: 'Het stille onderwerp dat later het meest telt' },
  { id: 'perimenopauze-breedte', reason: 'Veelgevraagd: de brede waaier aan klachten' },
  { id: 'ijzer-en-menstruatie', reason: 'Relevant tijdens je menstruatie' },
  { id: 'stress-hrv-cyclus', reason: 'Voor wie wearable-data gebruikt' },
  { id: 'pms-en-stemming', reason: 'Gebaseerd op veelgelogde symptomen' },
  { id: 'brain-fog-overgang', reason: 'Bij concentratieklachten in de overgang' },
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
