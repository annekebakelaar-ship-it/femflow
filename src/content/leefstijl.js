// Leefstijl-hub content: vier pijlers met activiteiten voor vrouwen in de
// (peri)menopauze, gekoppeld aan cyclusfases. Toon: nuchter, eerlijk,
// niet-medisch (zelfde lijn als artikelen.js). Geen behandelclaims; waar
// bewijs sterk is zeggen we dat, waar het om aanwijzingen gaat ook.
//
// fases: in welke fases deze activiteit het meest op zijn plek is.
// De hub toont daarnaast altijd de perimenopauze-nuance: bij een
// onregelmatige cyclus wegen je gevoel en je herstel zwaarder dan de fase.

export const FASE_POETIC = {
  Menstruatie: 'Herstel',
  Folliculair: 'Opbouw',
  Ovulatie: 'Verbind',
  Luteaal: 'Verhelder',
}

export const PIJLERS = [
  {
    id: 'kracht',
    naam: 'Kracht',
    intro: 'Het best onderbouwde leefstijladvies voor deze levensfase. Als oestrogeen daalt, nemen spiermassa en botdichtheid sneller af. Krachttraining remt beide af en is een van de weinige dingen die dat aantoonbaar doen.',
    activiteiten: [
      {
        id: 'kracht-basis',
        titel: 'Krachttraining, de basis',
        duur: '2x per week, 30-45 min',
        waarom: 'Twee korte full-body sessies per week zijn genoeg om spiermassa te behouden en je botten te belasten. Dit effect is goed onderzocht, ook bij vrouwen die na hun veertigste beginnen.',
        fases: ['Folliculair', 'Ovulatie', 'Luteaal'],
        uitleg: [
          'Je hoeft geen sportschoolverleden te hebben. Kracht bouw je op met vijf basisbewegingen: squat (of opstaan uit een stoel), hinge (heupscharnier, zoals deadlift), duwen, trekken en dragen. Elke sessie kies je er drie of vier en doe je per oefening 2 tot 3 sets van 8 tot 12 herhalingen.',
          'Het gewicht is goed gekozen als de laatste twee herhalingen echt moeite kosten. Te licht trainen voelt veiliger maar doet weinig voor spier en bot; het signaal moet stevig genoeg zijn.',
          'Eiwit hoort erbij: rond 1,2 tot 1,6 gram per kilo lichaamsgewicht per dag helpt je lichaam de spieropbouw ook echt te doen. Verdeel het over de dag, met een portie na de training.',
        ],
        stappen: [
          'Kies 2 vaste dagen in de week, met minstens 1 rustdag ertussen',
          'Warm 5 minuten op met wandelen of rustig fietsen',
          '3-4 basisbewegingen, 2-3 sets van 8-12 herhalingen',
          'Verzwaar pas als 12 herhalingen makkelijk voelen',
        ],
        nuance: 'In de folliculaire fase en rond de ovulatie ervaren veel vrouwen meer kracht en zin. Maar de winst zit in de regelmaat: liever elke week twee gewone sessies dan af en toe een perfecte.',
      },
      {
        id: 'kracht-zwaar',
        titel: 'Zwaarder tillen',
        duur: '2-3x per week, 45-60 min',
        waarom: 'Voor botdichtheid geldt: het bot past zich aan aan de belasting die het krijgt. Zwaarder tillen (met goede techniek) geeft een sterker signaal dan veel herhalingen met licht gewicht.',
        fases: ['Folliculair', 'Ovulatie'],
        uitleg: [
          'Train je al een tijdje, dan is dit de volgende stap: minder herhalingen (4 tot 6) met een gewicht dat echt zwaar voelt, vooral op samengestelde oefeningen zoals squats en deadlifts. Onderzoek bij vrouwen rond de menopauze (waaronder het bekende LIFTMOR-onderzoek) laat zien dat zwaar en explosief trainen veilig kan en meer voor de botten doet dan licht werk, mits begeleid opgebouwd.',
          'Techniek gaat voor gewicht. Een paar sessies met een trainer om de squat en de heupscharnier goed te leren is geen luxe maar een investering; daarna kun je prima zelfstandig verder.',
          'Plan zware sessies op dagen dat je hersteld bent. Je HRV en je nachtrust zijn daarvoor betere raadgevers dan de kalender.',
        ],
        stappen: [
          'Beheers eerst de basis (zie Krachttraining, de basis)',
          'Bouw per week met kleine stapjes op, nooit meer dan ~5% erbij',
          '4-6 herhalingen, 3-4 sets, lange rust tussen sets (2-3 min)',
          'Zwaar tillen combineert slecht met slecht slapen: schuif dan een dag op',
        ],
        nuance: 'Rond de ovulatie voelen veel vrouwen zich het sterkst. In de late luteale fase mag het gerust een tandje lichter; het gaat om het gemiddelde over maanden, niet om elke week een record.',
      },
      {
        id: 'kracht-thuis',
        titel: 'Thuis beginnen',
        duur: '20-30 min, geen apparatuur',
        waarom: 'Geen sportschool nodig om te starten. Met lichaamsgewicht en een weerstandsband bouw je de eerste maanden prima kracht op, en de drempel om vol te houden is lager.',
        fases: ['Menstruatie', 'Folliculair', 'Luteaal'],
        uitleg: [
          'Een thuisschema van squats, lunges, push-ups (desnoods tegen het aanrecht), rows met een band en een plank dekt alle basisbewegingen. Doe elke oefening tot de laatste herhalingen zwaar voelen; dat kan met lichaamsgewicht net zo goed als met halters, zeker in het begin.',
          'Het eerlijke verhaal: na een paar maanden wordt lichaamsgewicht te licht voor verdere botwinst. Zie thuis trainen als de instap; wie het volhoudt, groeit vanzelf richting zwaardere weerstand.',
        ],
        stappen: [
          'Zet een vast moment in je agenda, koppel het aan iets bestaands (na het ontbijt)',
          '5 oefeningen, 2 rondes, 10-15 herhalingen per oefening',
          'Koop een set weerstandsbanden zodra het makkelijk wordt',
        ],
        nuance: 'Ook tijdens je menstruatie kan een lichte thuissessie prima, als je je er goed bij voelt. Kramp of vermoeidheid? Dan is een wandeling vandaag de betere keuze.',
      },
    ],
  },
  {
    id: 'rust',
    naam: 'Rust',
    intro: 'Stress en slecht slapen versterken vrijwel elke perimenopauze-klacht. Ontspanningstechnieken zijn geen zweverij: er zijn serieuze aanwijzingen dat mindfulness en ademwerk stress en slaapkwaliteit verbeteren, en ze kosten niets.',
    activiteiten: [
      {
        id: 'meditatie',
        titel: 'Mindfulness-meditatie',
        duur: '10 min per dag',
        waarom: 'In studies rapporteren vrouwen in de overgang die mindfulness beoefenen minder last van stress en piekeren. Het verandert je hormonen niet, maar wel hoe zwaar de dagen wegen.',
        fases: ['Luteaal', 'Menstruatie'],
        uitleg: [
          'Mindfulness is aandacht leren houden bij wat er nu is, meestal via de adem, zonder oordeel over wat je aantreft. Tien minuten per dag is een realistisch begin; het effect komt uit de herhaling, niet uit de duur.',
          'De luteale fase is voor veel vrouwen de zwaarste: korter lontje, somberder, slechter slapen. Juist dan is een dagelijks rustmoment het meest waard. Begin desnoods alleen in die week en breid uit als het bevalt.',
          'Gebruik gerust een app of een ingesproken oefening; zelf stil zitten zonder houvast is voor beginners onnodig moeilijk.',
        ],
        stappen: [
          'Kies een vast moment, bijvoorbeeld direct na het opstaan',
          'Zet een timer op 10 minuten, zit rechtop, ogen dicht of zacht',
          'Volg je adem; dwaal je af, dan begin je gewoon opnieuw. Dat afdwalen is de oefening',
        ],
        nuance: 'Verwacht geen stilte in je hoofd. Verwacht dat je honderd keer afdwaalt en honderd keer terugkomt; dat terugkomen is precies wat je traint.',
      },
      {
        id: 'ademwerk',
        titel: 'Ademoefening',
        duur: '5 min, waar dan ook',
        waarom: 'Langzaam ademen (rond de 6 ademhalingen per minuut) activeert meetbaar je herstelsysteem; het is een van de snelste manieren om je zenuwstelsel te kalmeren, en je ziet het terug in je HRV.',
        fases: ['Luteaal', 'Menstruatie', 'Ovulatie'],
        uitleg: [
          'De eenvoudigste vorm: adem 4 tellen in door je neus, 6 tellen uit door je mond. De verlengde uitademing doet het werk. Vijf minuten is genoeg om verschil te voelen; voor het slapen is het effect het grootst.',
          'Dit is ook de beste eerste hulp bij een onrustig moment overdag of een nachtelijke wakkerte: drie minuten 4-6 ademen kalmeert sneller dan blijven woelen.',
          'Draag je een wearable, kijk dan eens wat een week dagelijks ademwerk met je nachtelijke HRV doet. Voor veel vrouwen is dat het eerste meetbare bewijs dat rust echt iets doet.',
        ],
        stappen: [
          '4 tellen in door de neus, 6 tellen uit door de mond',
          '5 minuten, zittend of liggend',
          'Vast moment: voor het slapen, of na een stressvolle situatie',
        ],
        nuance: 'Duizelig? Dan adem je te diep of te snel. Het hoort juist klein en rustig te zijn, alsof je een kaars nét niet uitblaast.',
      },
      {
        id: 'yoga-nidra',
        titel: 'Restorative yoga',
        duur: '20-30 min',
        waarom: 'Zachte, ondersteunde houdingen of een yoga nidra (liggende bodyscan) geven diepe ontspanning zonder inspanning. Aanwijzingen uit onderzoek: beter slapen en minder ervaren stress.',
        fases: ['Menstruatie', 'Luteaal'],
        uitleg: [
          'Restorative yoga is het tegenovergestelde van een workout: weinig houdingen, lang aangehouden, volledig ondersteund door kussens en dekens. Het vraagt niets van je spieren en veel van je bereidheid om even niets te doen.',
          'Yoga nidra is de liggende variant: je ligt onder een deken en volgt een stem door je lichaam. Twintig minuten voelt voor veel vrouwen als een dutje zonder de sufheid erna. Perfect voor menstruatiedagen en de dagen ervoor.',
        ],
        stappen: [
          'Zoek een ingesproken yoga nidra van 20-30 minuten',
          'Lig warm en ondersteund, timer niet nodig',
          'Plan het op de dagen dat trainen niet lukt; het telt ook',
        ],
        nuance: 'Dit vervangt geen krachttraining, en krachttraining vervangt dit niet. Ze doen verschillend werk; de combinatie is waar het om gaat.',
      },
    ],
  },
  {
    id: 'beweging',
    naam: 'Beweging',
    intro: 'Naast gerichte krachttraining heeft je lijf dagelijkse, rustige beweging nodig. Wandelen en rustige duurtraining onderhouden hart, stemming en slaap, en ze passen in elke fase.',
    activiteiten: [
      {
        id: 'wandelen',
        titel: 'Stevig wandelen',
        duur: '30-45 min, liefst buiten',
        waarom: 'De meest onderschatte activiteit die er is: laagdrempelig, herstelvriendelijk en vol te houden. Daglicht in de ochtend helpt bovendien je slaapritme, juist als nachten onrustig zijn.',
        fases: ['Menstruatie', 'Folliculair', 'Ovulatie', 'Luteaal'],
        uitleg: [
          'Stevig betekent: je kunt nog praten, maar zingen zou niet meer lukken. Dat tempo (vaak zone 2 genoemd) traint je uithoudingsvermogen zonder je herstel te belasten, en is daarom op elke dag van je cyclus een goede keuze.',
          'Wandel je in de ochtend buiten, dan krijg je er gratis daglicht bij. Dat zet je biologische klok, en een goed gezette klok is een van de best onderbouwde slaaphulpen die er zijn.',
          'Op dagen met een lage HRV of na een korte nacht is de wandeling niet de mindere keuze maar de juiste: je beweegt, zonder je herstel verder in het rood te duwen.',
        ],
        stappen: [
          'Mik op de meeste dagen van de week, duur telt zwaarder dan tempo',
          'Ochtendwandeling = beweging en licht in een moeite',
          'Maak het sociaal: een vaste wandelafspraak houdt het vol',
        ],
        nuance: 'Geen enkele fase-uitzondering: dit kan altijd. Als het advies van vandaag "rustig aan" is, is dit wat rustig aan betekent.',
      },
      {
        id: 'duur',
        titel: 'Rustige duurtraining',
        duur: '30-60 min, 2-3x per week',
        waarom: 'Fietsen, zwemmen of rustig hardlopen op praattempo onderhoudt je conditie en hartgezondheid. Het risico op hart- en vaatziekten stijgt na de menopauze; conditie opbouwen is nu extra de moeite waard.',
        fases: ['Folliculair', 'Ovulatie'],
        uitleg: [
          'De regel is simpel: het overgrote deel van je duurtraining hoort rustig te zijn, op een tempo waarop je een gesprek kunt voeren. Harder voelt productiever, maar rustig en lang is wat de basis bouwt en je herstel spaart.',
          'Zwemmen verdient een aparte vermelding: gewrichtsvriendelijk, verkoelend (fijn bij warme opvliegers-dagen) en het ritmische ademen heeft iets meditatiefs.',
          'Wie wil, mag een keer per week iets intensiefs doen (intervallen, een pittige les), het liefst in de eerste cyclushelft als de energie er is. Nodig is het niet.',
        ],
        stappen: [
          'Kies iets wat je niet haat; volhouden wint van perfect',
          'Praattempo als norm: kun je niet meer praten, dan ga je te hard',
          'Intensief werk maximaal 1x per week, op een uitgeruste dag',
        ],
        nuance: 'In de late luteale fase loopt de lichaamstemperatuur iets op en voelt dezelfde inspanning zwaarder. Dat is normaal en geen achteruitgang; pas het tempo aan, niet het plan.',
      },
      {
        id: 'balans',
        titel: 'Balans en mobiliteit',
        duur: '10-15 min, 2-3x per week',
        waarom: 'Sterke botten zijn pas half het verhaal; niet vallen is de andere helft. Balansoefeningen verkleinen valrisico, en soepele heupen en schouders houden krachttraining veilig.',
        fases: ['Menstruatie', 'Luteaal'],
        uitleg: [
          'Balans traint verrassend snel: op een been staan tijdens het tandenpoetsen is al een oefening. Bouw uit met ogen dicht, of met een lichte beweging erbij, zoals iets oprapen.',
          'Mobiliteit richt zich op de plekken die van zitten stijf worden: heupen, bovenrug, enkels. Tien minuten na een wandeling of als rustige avondroutine is genoeg; het hoeft geen apart trainingsuur te worden.',
        ],
        stappen: [
          'Op een been staan: 3x 30 sec per kant, dagelijks in te passen',
          'Heup- en bovenrug-oefeningen na het wandelen, als het lijf warm is',
          'Combineer met een rustdag; dit is herstelwerk, geen training',
        ],
        nuance: 'Prima menstruatiedag-activiteit: het vraagt weinig energie en je doet toch iets wat er op lange termijn echt toe doet.',
      },
    ],
  },
  {
    id: 'slaap',
    naam: 'Slaap',
    intro: 'Voor veel vrouwen is slaap het grootste pijnpunt van de perimenopauze: moeilijker inslapen, vaker wakker, nachtzweten. Slaap laat zich niet afdwingen, maar wel voorbereiden.',
    activiteiten: [
      {
        id: 'avondritueel',
        titel: 'Avondritueel',
        duur: 'Laatste uur van de dag',
        waarom: 'Een voorspelbaar laatste uur (licht dimmen, schermen weg, iets rustigs) is de best onderbouwde niet-medische slaaphulp. Je traint je brein dat er slaap aankomt.',
        fases: ['Luteaal', 'Menstruatie', 'Folliculair', 'Ovulatie'],
        uitleg: [
          'Het draait om herhaling: elke avond ongeveer dezelfde volgorde, op ongeveer dezelfde tijd. Dim de lampen, leg je telefoon weg (of minstens uit je handbereik), en doe iets wat je hoofd langzamer zet: lezen, stretchen, de ademoefening uit de Rust-pijler.',
          'Vaste bedtijd en vooral een vaste opstatijd doen het meeste werk. Uitslapen na een slechte nacht voelt logisch maar verschuift je klok en maakt de volgende nacht vaak slechter.',
          'Piekeren in bed? Zet eerder op de avond tien minuten piekertijd met pen en papier. Wat opgeschreven is, hoeft je hoofd niet vast te houden.',
        ],
        stappen: [
          'Kies een vast slaapvenster en houd de opstatijd ook in het weekend aan',
          'Laatste uur: gedimd licht, geen schermen, iets rustigs',
          'Slaap je na 20-30 min niet: sta op, doe iets saais bij weinig licht, probeer opnieuw',
        ],
        nuance: 'In de luteale fase slaapt vrijwel iedereen wat lichter. Het ritueel voorkomt dat niet, maar zorgt dat een matige nacht geen slechte week wordt.',
      },
      {
        id: 'koel',
        titel: 'Koel slapen',
        duur: 'Eenmalige inrichting',
        waarom: 'Nachtzweten en opvliegers verstoren de nacht via temperatuur. Een koele kamer en slimme lagen maken de verstoring korter, ook al nemen ze de oorzaak niet weg.',
        fases: ['Luteaal', 'Menstruatie'],
        uitleg: [
          'Richtpunt: een slaapkamer rond de 16 tot 18 graden. Kies ademende materialen (katoen, linnen, wol) boven synthetisch, en werk in lagen die je in de nacht makkelijk kwijt kunt: los dekbed en aparte deken in plaats van een dik geheel.',
          'Praktisch bij nachtzweten: een reserveshirt en een glas water naast het bed, zodat een natte wakkerte een onderbreking van twee minuten blijft in plaats van een uur wakker liggen. Douche lauw, niet koud; ijskoud afkoelen houdt je juist wakker.',
          'De licht-luteale temperatuurstijging van je cyclus en de opvliegers van de perimenopauze stapelen op elkaar. Dat verklaart waarom dezelfde kamer de ene week prima is en de andere week te warm.',
        ],
        stappen: [
          'Thermostaat of raam: mik op 16-18 graden',
          'Lagen in plaats van dik: los dekbed plus aparte deken',
          'Reserveshirt en water klaarleggen scheelt nachtelijk gedoe',
        ],
        nuance: 'Houden opvliegers of nachtzweten je structureel uit je slaap, bespreek het dan met je huisarts. Daar is meer aan te doen dan veel vrouwen denken, en een app-tip is daar geen vervanging voor.',
      },
      {
        id: 'cafeine',
        titel: 'Cafeine en alcohol',
        duur: 'Timing, geen verbod',
        waarom: 'Cafeine heeft een halfwaardetijd van zo\'n 5 tot 6 uur en wordt in deze levensfase vaak trager afgebroken; alcohol maakt inslapen makkelijker maar de tweede nachthelft aantoonbaar slechter.',
        fases: ['Luteaal', 'Menstruatie', 'Folliculair', 'Ovulatie'],
        uitleg: [
          'Dit gaat niet over stoppen, maar over timing. Een kop koffie om 15:00 heeft om 21:00 nog de helft van zijn cafeine in je bloed. Slaap je slecht, dan is de laatste koffie voor de lunch een van de simpelste experimenten die je kunt doen.',
          'Alcohol is een verhaal van eerlijke boekhouding: het glas wijn ontspant de avond, maar versnippert de tweede nachthelft en kan opvliegers uitlokken. Je wearable laat het verschil vaak genadeloos zien in HRV en slaapkwaliteit.',
          'Probeer het twee weken en kijk naar je eigen data in plaats van naar algemene adviezen: dat is precies waar deze app voor is.',
        ],
        stappen: [
          'Laatste cafeine voor 12:00 als experiment van twee weken',
          'Alcohol: vergelijk je slaap- en HRV-data van avonden met en zonder',
          'Beslis daarna op basis van je eigen cijfers, niet op wilskracht',
        ],
        nuance: 'In de luteale fase merken veel vrouwen dat hetzelfde glas of kopje harder aankomt. Ook dat is te zien in je eigen gegevens.',
      },
    ],
  },
]

// Vlakke lookup op activiteit-id
export function vindActiviteit(id) {
  for (const p of PIJLERS) {
    const a = p.activiteiten.find(x => x.id === id)
    if (a) return { ...a, pijler: p.id, pijlerNaam: p.naam }
  }
  return null
}
