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
  {
    id: 'voeding',
    naam: 'Voeding',
    intro: 'Geen dieet, wel een paar dingen die er in deze levensfase echt toe doen: genoeg eiwit, sterke botten, een rustige bloedsuiker en ijzer als je menstruatie hevig is. Scan een product om te zien wat erin zit.',
    activiteiten: [
      {
        id: 'voeding-eiwit',
        titel: 'Eiwit als anker',
        duur: 'Elke maaltijd',
        waarom: 'Spierbehoud vraagt in deze levensfase om meer eiwit dan ervoor: richtpunt 1,2 tot 1,6 gram per kilo lichaamsgewicht per dag. Zonder genoeg eiwit doet krachttraining maar het halve werk.',
        fases: ['Menstruatie', 'Folliculair', 'Ovulatie', 'Luteaal'],
        uitleg: [
          'Voor iemand van 70 kilo betekent dat 85 tot 110 gram eiwit per dag. Dat haal je zelden met een boterham met kaas en een avondmaaltijd; het lukt wel als elke maaltijd een echte eiwitbron heeft: kwark of skyr, eieren, vis, kip, peulvruchten, tofu.',
          'De verdeling telt: je spieren kunnen per maaltijd maar een beperkte hoeveelheid benutten, dus drie keer 25 tot 35 gram werkt beter dan alles bij het avondeten. Het ontbijt is bij de meeste vrouwen de zwakste plek.',
          'Gebruik de scanner gerust in de supermarkt: 10 gram eiwit per 100 gram of meer is een serieuze bron.',
        ],
        stappen: [
          'Reken je eigen richtpunt uit: lichaamsgewicht x 1,2 tot 1,6 gram',
          'Begin bij het ontbijt: kwark, skyr of eieren in plaats van alleen brood',
          'Na een krachtsessie: binnen een paar uur een eiwitrijk moment',
        ],
        nuance: 'Eiwit is geen wondermiddel maar een randvoorwaarde: het werkt samen met krachttraining, niet in plaats daarvan.',
      },
      {
        id: 'voeding-botten',
        titel: 'Calcium en vitamine D',
        duur: 'Dagelijks',
        waarom: 'Als oestrogeen daalt, versnelt botafbraak. Calcium (richtpunt 1000-1200 mg per dag) en vitamine D zijn samen met krachttraining de best onderbouwde botbeschermers.',
        fases: ['Menstruatie', 'Folliculair', 'Ovulatie', 'Luteaal'],
        uitleg: [
          'Calcium haal je het makkelijkst uit zuivel (een glas melk of schaaltje kwark is zo\'n 300 mg), maar ook uit groene groenten, noten, tofu en verrijkte plantaardige dranken. Drie tot vier porties per dag brengen je in de buurt van het richtpunt.',
          'Vitamine D maakt je huid van zonlicht, en van oktober tot april lukt dat in Nederland nauwelijks. De algemene richtlijn voor vrouwen boven de vijftig is een supplement van 20 microgram per dag; dat is een van de weinige supplementadviezen die officieel in de Nederlandse richtlijnen staat.',
          'Kijk bij het scannen ook eens naar verrijkte producten: veel plantaardige melk heeft toegevoegd calcium en vitamine D, maar lang niet allemaal.',
        ],
        stappen: [
          'Tel een dag lang je porties zuivel of verrijkte alternatieven',
          'Onder de drie porties? Voeg er bewust een toe',
          'Overweeg vitamine D-suppletie in de wintermaanden (20 mcg is de standaardrichtlijn 50+)',
        ],
        nuance: 'Meer dan het richtpunt aan calcium slikken heeft geen zin en kan zelfs nadelig zijn; het gaat om genoeg, niet om veel.',
      },
      {
        id: 'voeding-bloedsuiker',
        titel: 'Rustige bloedsuiker',
        duur: 'Bij elke maaltijd',
        waarom: 'Rond de overgang wordt het lichaam vaak minder gevoelig voor insuline, en veel vrouwen merken sterkere energie-dips en cravings, vooral in de luteale fase. Vezels en eiwit dempen die pieken.',
        fases: ['Luteaal'],
        uitleg: [
          'De volgorde is simpel: hoe meer vezels en eiwit bij een maaltijd, hoe rustiger je bloedsuiker erna. Volkoren in plaats van wit, peulvruchten, groente bij de lunch en niet alleen bij het avondeten.',
          'De luteale week is het moment waarop dit het meest merkbaar is: dezelfde koek geeft dan bij veel vrouwen een grotere dip erna. Dat is geen gebrek aan discipline maar fysiologie; een eiwitrijk tussendoortje (noten, kwark) vangt het beter op dan iets zoets.',
          'Op etiketten: kijk naar vezels (6 gram per 100 gram of meer is een goede bron) en naar suikers (boven de 22,5 gram per 100 gram is veel).',
        ],
        stappen: [
          'Ontbijt met eiwit en vezels in plaats van alleen snel brood',
          'Houd in je luteale week eiwitrijke tussendoortjes binnen handbereik',
          'Scan je vaste tussendoortjes eens: de suikercijfers verrassen vaak',
        ],
        nuance: 'Dit gaat om patronen, niet om verboden. Een koek is geen zonde; weten wat hij doet maakt de keuze alleen bewuster.',
      },
      {
        id: 'voeding-ijzer',
        titel: 'IJzer rond je menstruatie',
        duur: 'Vooral in je menstruatieweek',
        waarom: 'Hevige of frequentere menstruaties, veelvoorkomend in de perimenopauze, kosten ijzer. Vermoeidheid die niet overgaat kan daarmee te maken hebben.',
        fases: ['Menstruatie'],
        uitleg: [
          'IJzer uit dierlijke bronnen (rood vlees, vis) neemt je lichaam het makkelijkst op. Plantaardig ijzer (peulvruchten, volkoren, groene groenten) werkt ook, en de opname verdubbelt ruwweg als je er vitamine C bij eet: paprika, citrus of kiwi bij de maaltijd.',
          'Koffie en thee bij de maaltijd remmen juist de opname; drink ze liever een uur ervoor of erna.',
          'Belangrijk en eerlijk: slik geen ijzersupplementen op de gok. Te veel ijzer is schadelijk, en aanhoudende vermoeidheid verdient een bloedtest bij de huisarts in plaats van zelfmedicatie.',
        ],
        stappen: [
          'Combineer plantaardig ijzer met vitamine C in dezelfde maaltijd',
          'Koffie en thee los van de maaltijden in je menstruatieweek',
          'Aanhoudend moe plus hevige menstruaties? Vraag de huisarts om een ferritine-test',
        ],
        nuance: 'Dit is het enige onderwerp in deze hub waar de huisarts expliciet in de eerste stap hoort: ijzerstatus meet je, die gok je niet.',
      },
    ],
  },
  {
    id: 'supplementen',
    naam: 'Supplementen',
    intro: 'De kleinste hefboom, dus hij komt bewust als laatste: kracht, slaap en voeding doen het grote werk. Maar een paar middelen zijn in deze levensfase wel degelijk zinnig, en het scheelt geld en teleurstelling om te weten welke.',
    activiteiten: [
      {
        id: 'supp-basis',
        titel: 'De eerlijke basis',
        duur: 'Alleen wat onderbouwd is',
        waarom: 'Voor een handvol middelen bestaat serieus bewijs en een goedgekeurde claim; voor de meeste overgangssupplementen niet. Dit is de korte lijst die de toets doorstaat.',
        fases: [],
        uitleg: [
          'Vitamine D is de enige die in de officiele Nederlandse richtlijnen staat: 20 microgram per dag voor vrouwen boven de vijftig, en van oktober tot april eigenlijk voor iedereen hier. Vitamine D draagt bij aan de normale werking van het immuunsysteem en het behoud van sterke botten.',
          'Magnesium is het overwegen waard als je slecht slaapt of veel kramp hebt: het draagt bij aan de vermindering van vermoeidheid en aan een normale spier- en zenuwfunctie. Kies een goed opneembare vorm (zie de kwaliteitsgids).',
          'Creatine is verrassend goed onderzocht, ook bij vrouwen: het verhoogt de fysieke prestatie bij korte, intensieve inspanning — precies het krachtwerk dat in deze fase het anker is. Drie tot vijf gram per dag, elke dag, meer is niet nodig.',
          'Omega-3 (EPA en DHA) draagt bij aan een normale hartfunctie; relevant als je weinig vette vis eet. Verder geldt voor bijna al het andere: eerst meten of voelen, dan pas slikken.',
        ],
        stappen: [
          'Winterhelft van het jaar: vitamine D 20 mcg per dag',
          'Slaap- of krampklachten: probeer magnesium 4 weken en kijk naar je eigen data',
          'Train je kracht: creatine 3-5 g per dag is de best onderbouwde aanvulling',
        ],
        nuance: 'Supplementen vullen aan, ze repareren niet. Een tekort aan slaap, eiwit of training is met geen enkele pil te compenseren.',
      },
      {
        id: 'supp-overslaan',
        titel: 'Wat je mag overslaan',
        duur: 'Bespaart geld en hoop',
        waarom: 'De overgangsmarkt staat vol beloftes zonder onderbouwing. Weten wat je NIET hoeft te kopen is minstens zoveel waard als weten wat wel.',
        fases: [],
        uitleg: [
          'Detoxkuren en "reinigende" supplementen: je lever en nieren ontgiften al, daar is geen kuur voor nodig. Alles-in-een overgangscomplexen met twintig ingredienten in minidoseringen klinken compleet, maar bevatten van alles te weinig om iets te doen.',
          'IJzer op de gok is de gevaarlijkste van het rijtje: te veel ijzer stapelt en is schadelijk. Alleen slikken na een bloedtest (zie de ijzergids bij Voeding).',
          'Voor populaire kruiden als ashwagandha en teunisbloemolie is het eerlijke verhaal: sommige vrouwen ervaren er iets bij, maar er is geen goedgekeurde gezondheidsclaim en het bewijs is wisselend. Dat mag je best proberen, zolang je weet dat je experimenteert — en het meldt bij je huisarts als je medicijnen gebruikt.',
          'Megadoseringen ("hoe meer hoe beter") slaan nergens op: boven de behoefte plas je het duurste deel gewoon uit, of erger, het stapelt.',
        ],
        stappen: [
          'Check bij elk product: staat er een concreet ingredient met een concrete dosering op, of vooral beloftetaal?',
          'Twintig ingredienten in een pil = van alles te weinig',
          'Gebruik je medicijnen? Meld elk supplement bij huisarts of apotheek',
        ],
        nuance: 'Skepsis is hier zelfzorg: elke euro die niet naar een loze belofte gaat, kan naar goede voeding of een sportschoolpas.',
      },
      {
        id: 'supp-kwaliteit',
        titel: 'Zo kies je kwaliteit',
        duur: 'Eenmalig uitzoeken',
        waarom: 'Tussen twee potjes "magnesium" kan een wereld van verschil zitten: de vorm, de dosering en de vulstoffen bepalen of je er iets aan hebt.',
        fases: [],
        uitleg: [
          'De vorm telt. Magnesiumoxide is goedkoop maar wordt slecht opgenomen (en werkt vooral laxerend); bisglycinaat of citraat zijn de vormen die je zoekt. Bij vitamine D wil je D3, bij omega-3 kijk je naar de EPA+DHA-hoeveelheid per capsule in plaats van naar "1000 mg visolie".',
          'Dosering: vergelijk met de aanbevolen dagelijkse hoeveelheid op het etiket. Ruim onder de 100% doet waarschijnlijk weinig; vele honderden procenten is zelden zinvol en soms onverstandig.',
          'Duurder is niet beter. Huismerken met de juiste vorm en dosering doen hetzelfde als premiummerken; je betaalt vaak voor marketing. En een supplement dat je maandenlang consequent neemt, wint het altijd van een perfect potje dat in de kast staat.',
        ],
        stappen: [
          'Magnesium: kies bisglycinaat of citraat, geen oxide',
          'Vergelijk de dosering met de referentie-inname op het etiket',
          'Zet je supplementmoment vast aan een bestaande gewoonte (ontbijt, tandenpoetsen)',
        ],
        nuance: 'Twijfel je tussen producten? De apotheek denkt gratis mee, ook over wisselwerkingen met medicijnen.',
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
