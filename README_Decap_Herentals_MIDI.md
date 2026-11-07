# Decap Herentals: boekorgel, gewone MIDI-ombouw en uitgebreide MIDI-aansturing

**Technische README — uitgebreide uitleg in cijfers en praktijkvoorbeelden**  
**Versie:** 1.0 — 27 oktober 2026  
**Taal:** Nederlands (België)

> **Reikwijdte en nauwkeurigheid.** Dit document beschrijft het onderscheid tussen een traditioneel boekorgel, een eenvoudige MIDI-ombouw en een uitgebreid, onafhankelijk aangestuurd orgel zoals de Decap Herentals-configuratie die in de aangeleverde uitleg wordt besproken. De **16 poorten** zijn de gekozen configuratie uit die uitleg, **geen bewezen standaard voor elk Decap Herentals-orgel**. De vermelde MIDI-functies zijn mogelijkheden van het protocol; of een concreet orgel ze daadwerkelijk uitvoert, hangt af van de elektronica, kleppen, windregeling, mechaniek en configuratie. Niet alle andere orgels zijn eenvoudige boekvervangers: ook andere fabrikanten kunnen geavanceerde MIDI-sturing toepassen.

---

## 1. Samenvatting

Het fundamentele verschil is **niet** dat een Decap Herentals-orgel MIDI heeft en andere orgels niet. Het verschil is de **mate waarin de fysieke instrumenten afzonderlijk aanspreekbaar zijn**, en de mate waarin de aansturing verder gaat dan enkel *noot aan/noot uit*.

- **Traditioneel boekorgel:** de mechanische boekindeling bepaalt welke functies en noten worden aangestuurd. Meerdere registers kunnen aan dezelfde boektoets gekoppeld zijn.
- **Eenvoudige MIDI-ombouw:** een MIDI-bestand vervangt het boek als invoer, maar stuurt grotendeels dezelfde oorspronkelijke functies aan. De beperkingen van de boekindeling kunnen behouden blijven.
- **Uitgebreide MIDI-sturing:** instrumentgroepen kunnen, mits afzonderlijk bedraad en bestuurd, eigen MIDI-kanalen en partijen krijgen. Geschikte instrumenten kunnen bovendien reageren op velocity, controllers en expressie-informatie.

**In één zin:** een gewone MIDI-ombouw kan een *digitale boeklezer* zijn; een uitgebreide MIDI-architectuur kan een *besturingssysteem voor een mechanisch orkest* zijn.

## 2. Eerst de begrippen correct onderscheiden

### 2.1 Boekspoor / boektoets

Een kartonnen orgelboek heeft fysieke sporen (toetsen) die vaste orgelfuncties vertegenwoordigen: noten, registers, slagwerk of andere opdrachten. Het aantal sporen verschilt per boek- en orgeltype. Een boek met bijvoorbeeld 80 sporen heeft **niet automatisch 80 onafhankelijke instrumenten**: één spoor kan via een registermechaniek meerdere klanken laten volgen.

### 2.2 MIDI-poort

Een **MIDI-poort** is één afzonderlijke logische MIDI-verbinding. Dat kan een fysieke aansluiting zijn of een virtuele poort binnen software of een interface. Eén klassieke MIDI 1.0-poort biedt **16 MIDI-kanalen**.

### 2.3 MIDI-kanaal

Een MIDI-kanaal is een adres **binnen** een poort, genummerd 1 tot 16. Berichten zoals Note On, Note Off, Control Change, Program Change en Pitch Bend worden naar een kanaal gestuurd. Een kanaal is **geen individuele noot** en ook niet noodzakelijk één fysiek instrument. Op één kanaal kunnen meerdere noten tegelijk spelen.

### 2.4 MIDI-track

Een **track** is een organisatorisch spoor in een MIDI-bestand of sequencer. Een track is niet hetzelfde als een MIDI-kanaal: meerdere tracks kunnen naar hetzelfde kanaal sturen, en een track kan afhankelijk van het bestand of programma verschillende kanalen bevatten.

### 2.5 Instrument, register en fysieke actuator

Een MIDI-kanaal kan een instrumentgroep aansturen, maar daadwerkelijke onafhankelijkheid vereist ook afzonderlijk aanstuurbare onderdelen: kleppen, magneten, windladen, registermechanismen of andere actuatoren. **Extra MIDI-kanalen creëren geen extra fysieke onafhankelijkheid als de mechaniek gekoppeld blijft.**

---

## 3. De cijfers: 1 poort tegenover 16 poorten

| Configuratie | MIDI-poorten | Kanalen per poort | Totale afzonderlijke kanaaladressen |
|---|---:|---:|---:|
| Voorbeeld: eenvoudige MIDI-aansluiting | 1 | 16 | 16 |
| Uitgebreide configuratie uit de uitleg | 16 | 16 | **256** |

**Berekening:** `16 poorten × 16 kanalen = 256 kanaaladressen`.

Dit betekent **16 keer zoveel kanaaladressen** als bij één poort. Het betekent **niet** automatisch 16 keer zoveel noten, 256 pijpen, 256 instrumenten of 256 fysieke kabels.

### 3.1 Alle poorten en hun kanaalbereik

De onderstaande *globale nummers* zijn alleen een handige administratieve nummering. MIDI zelf gebruikt steeds **(poort, kanaal)**.

| Poort | Lokale kanalen | Administratieve kanaalnummers |
|---:|---|---:|
| 1 | 1–16 | 1–16 |
| 2 | 1–16 | 17–32 |
| 3 | 1–16 | 33–48 |
| 4 | 1–16 | 49–64 |
| 5 | 1–16 | 65–80 |
| 6 | 1–16 | 81–96 |
| 7 | 1–16 | 97–112 |
| 8 | 1–16 | 113–128 |
| 9 | 1–16 | 129–144 |
| 10 | 1–16 | 145–160 |
| 11 | 1–16 | 161–176 |
| 12 | 1–16 | 177–192 |
| 13 | 1–16 | 193–208 |
| 14 | 1–16 | 209–224 |
| 15 | 1–16 | 225–240 |
| 16 | 1–16 | 241–256 |

**Concreet voorbeeld uit de uitleg:** de vioolpijpen kunnen bijvoorbeeld aan **poort 7, kanaal 12** toegewezen zijn. Dat is één specifiek adres, niet ‘MIDI-kanaal 12 van het volledige systeem’. Volgens de administratieve telling hierboven is dat nummer `6 × 16 + 12 = 108`.

### 3.2 Waarom meer poorten nuttig zijn

Meer poorten maken het mogelijk om veel onafhankelijke bestemmingen overzichtelijk te verdelen: piano, accordeon, strijkers, fluiten, saxofoon, bassen, slagwerk, registerbesturing, winddrukregeling en aanvullende instrumenten. Bovendien kunnen twee instrumenten elk op **kanaal 1** staan zolang ze op **verschillende poorten** zitten.

**Let op:** een standaard 5-polige MIDI-DIN-verbinding werkt op 31,25 kbit/s. Veel gelijktijdige MIDI-berichten op één DIN-uitgang kunnen timing- en bandbreedtebeperkingen geven. Afzonderlijke echte poorten kunnen die belasting spreiden. Bij USB-MIDI en virtuele poorten is de transporttechniek anders; 16 kanalen per MIDI 1.0-poort blijft de logische indeling.

---

## 4. Wat doet een traditioneel boekorgel?

Een boekorgel leest fysieke perforaties of openingen in een boek. De boekindeling legt vast welke muzikale en mechanische opdrachten mogelijk zijn. Als bijvoorbeeld de fluit en de saxofoon dezelfde noottoets volgen, kunnen ze die noot samen spelen, maar **niet onafhankelijk twee verschillende melodieën op diezelfde gekoppelde sturing**. Onafhankelijk spel is alleen mogelijk wanneer er afzonderlijke boektoetsen, mechanismen of aanvullende functies bestaan.

Het is onjuist om te zeggen dat een boekorgel geen dynamiek, registers of expressie kan hebben: mechanische orgels kunnen daarvoor eigen systemen bezitten. Het punt is dat de **beschikbare boeksporen en mechanische koppelingen** de muzikale vrijheid begrenzen.

## 5. Wat verandert een eenvoudige MIDI-ombouw?

Een eenvoudige ombouw vertaalt MIDI-noten naar de oorspronkelijke boekfuncties. De fysieke lezer wordt vervangen door elektronica, maar de muzikale architectuur kan dezelfde blijven.

**Voorbeeld:** oorspronkelijk boekspoor 27 activeert een bepaalde nootfunctie. Na de ombouw activeert een gekozen MIDI-noot precies diezelfde functie. Als daar twee registers aan gekoppeld zijn, blijven die gekoppeld tenzij de mechaniek of besturing expliciet is aangepast.

Een ombouw kan alle 16 kanalen van één MIDI-poort gebruiken, maar kan ook bewust slechts één kanaal gebruiken om de volledige oorspronkelijke boekindeling als één verzameling nootnummers aan te sturen. **‘Eén kanaal’ is dus een mogelijk ontwerp, geen definitie van alle gewone MIDI-orgels.**

## 6. Wat maakt een uitgebreide Decap Herentals-aansturing anders?

De besproken uitgebreide opstelling kan het orgel behandelen als een verzameling **afzonderlijk bestuurbare instrumentgroepen**, in plaats van uitsluitend als één digitale kopie van de boektoetsen.

Bijvoorbeeld:

1. De saxofoon speelt de hoofdmelodie.
2. De fluit 8' speelt een andere melodie of extra versieringen.
3. De violen spelen een tegenmelodie.
4. De piano krijgt een eigen partij met zachte en harde aanslagen.
5. Het slagwerk speelt accenten met verschillende intensiteiten.
6. Een geschikte wind- of expressieregeling verandert de klank tijdens het spelen.

Dat kan alleen voor de instrumenten en functies die **werkelijk afzonderlijk elektronisch en mechanisch toegankelijk** zijn. Het merk alleen garandeert dit niet.

---

## 7. MIDI is veel meer dan Note On en Note Off

### 7.1 Note On / Note Off

MIDI 1.0 heeft **128 nootnummers (0–127)** per kanaal. Het zijn *mogelijke adressen*, geen garantie dat een orgel 128 verschillende tonen kan produceren. Het werkelijke bereik hangt af van de aanwezige pijpen en instrumenten.

### 7.2 Velocity: aanslagsterkte

Bij een MIDI 1.0 Note On is de velocity een waarde van **1–127**. Note On met velocity 0 wordt in de praktijk als Note Off behandeld.

| Voorbeeldvelocity | Mogelijke muzikale bedoeling |
|---:|---|
| 20 | Zeer zachte aanslag |
| 50 | Matig zachte aanslag |
| 80 | Normale/stevige aanslag |
| 110 | Krachtige aanslag |
| 127 | Maximale aanslagwaarde |

De getallen zijn **geen gestandaardiseerde percentages van fysieke kracht of luidheid**. De respons moet voor elk instrument worden gekalibreerd.

**Belangrijk technisch onderscheid:** een traditioneel pijporgel met gewone aan/uit-kleppen wordt niet automatisch velocity-gevoelig doordat er MIDI op aangesloten wordt. Velocity kan pas hoorbaar verschil geven wanneer bijvoorbeeld een piano-, percussie- of andere geschikte mechaniek aanslagvariatie ondersteunt, of wanneer elektronica velocity bewust naar een regelbare functie vertaalt.

### 7.3 Control Change (CC)

MIDI 1.0 kent **128 controllernummers (0–127)**. De meeste klassieke CC-berichten gebruiken waarden **0–127**; sommige controllerparen kunnen een hogere resolutie vormen.

Relevante voorbeelden:

| Bericht | Standaardbetekenis | Mogelijke toepassing indien ondersteund |
|---|---|---|
| CC1 | Modulation Wheel | Vibrato-intensiteit of andere modulatie |
| CC7 | Channel Volume | Algemene volumeregeling |
| CC10 | Pan | Links/rechts bij elektronische klankbronnen |
| CC11 | Expression | Doorlopende expressie-/niveauregeling |
| CC64 | Sustain Pedal | Sustainfunctie bij geschikte instrumenten |

Een orgelbouwer kan daarnaast eigen mappings of MIDI-berichten gebruiken om bijvoorbeeld **winddruk, registers of mechanische effecten** te regelen. Zo'n mapping is **niet automatisch dezelfde** als de standaardbetekenis van een CC-nummer.

### 7.4 Pitch Bend

Een klassiek MIDI 1.0 Pitch Bend-bericht heeft **14 bits: 16.384 mogelijke waarden (0–16.383)**, met een middenwaarde van **8.192**. Het werkelijke toonhoogtebereik (bijvoorbeeld ±2 halve tonen) wordt door het ontvangende instrument ingesteld.

Bij een gewone vaste orgelpijp is toonhoogtebuiging niet vanzelf mogelijk. Er moet een passende fysieke of elektronische voorziening zijn.

### 7.5 Aftertouch

Channel Pressure (kanaal-aftertouch) gebruikt normaal een waarde van **0–127** voor het hele kanaal. Polyphonic Key Pressure kan per noot worden verzonden. Een mechanisch orgel reageert hier alleen op als de besturing er een betekenis aan geeft.

### 7.6 Program Change

Een MIDI 1.0 Program Change kan **128 programma's** selecteren (waarden 0–127; in gebruikersinterfaces vaak weergegeven als 1–128). In een orgel kan dat bijvoorbeeld worden gekoppeld aan een registratie of preset, **als de besturing daarvoor is ingericht**.

### 7.7 Andere mogelijke effecten

Denk aan tremolo, vibrato, zwelkast, winddrukveranderingen, registerwissels, aanslagduur, dynamische percussie en combinaties van instrumenten. Dit zijn **muzikale of mechanische effecten**, niet allemaal afzonderlijke standaard-MIDI-functies. MIDI levert de besturingsberichten; de hardware bepaalt wat daadwerkelijk kan klinken.

---

## 8. Cijfermatige vergelijking

| Kenmerk | Traditioneel boekorgel | Eenvoudige MIDI-boekvervanger | Uitgebreide configuratie zoals besproken |
|---|---|---|---|
| Boeksporen | Vast, afhankelijk van orgel | Oorspronkelijke functies blijven vaak leidend | Boekindeling hoeft niet de enige structuur te zijn |
| MIDI-poorten | Geen, tenzij later toegevoegd | Bijvoorbeeld 1 | **16 in de besproken configuratie** |
| MIDI-kanalen | Niet van toepassing | Maximaal 16 per poort; soms slechts 1 gebruikt | **256 kanaaladressen bij 16 poorten** |
| MIDI-nootnummers | Niet van toepassing | 0–127 per MIDI-kanaal | 0–127 per MIDI-kanaal |
| Verschillende melodieën per instrumentgroep | Afhankelijk van boek en koppelingen | Vaak dezelfde beperking | Mogelijk bij afzonderlijke sturing |
| Velocity 1–127 | Geen MIDI-velocity | Vaak alleen noot aan/uit | Benutbaar bij geschikte mechanieken |
| CC-berichten | Niet van toepassing | Afhankelijk van interface | Benutbaar voor toegewezen functies |
| Pitch Bend | Niet van toepassing | Vaak niet relevant | Alleen bij passende klankbron/techniek |
| Winddruk en vibrato | Volgens mechanische uitrusting | Niet automatisch extra beschikbaar | Elektronisch regelbaar indien voorzien |
| Vrijheid voor nieuwe arrangementen | Begrensd door boek | Begrensd door oorspronkelijke mapping | Veel groter bij onafhankelijke aansturing |

**Wat de cijfers niet zeggen:** 256 kanalen betekent niet 256 gelijktijdige tonen. Polyfonie (het aantal gelijktijdige klinkende noten) is een andere grootheid en hangt af van het aantal aanwezige pijpen, kleppen, instrumenten en de mechanische/elektrische capaciteit.

---

## 9. Praktijkvoorbeeld: één noot of een volledig orkest

### Scenario A — traditioneel boek

Eén boekspoor activeert noot C in een melodiegroep. Als fluit en saxofoon aan die functie gekoppeld zijn, volgen ze dezelfde noot wanneer beide registers openstaan. Een aparte melodie voor de fluit is op die gedeelde sturing niet mogelijk.

### Scenario B — eenvoudige MIDI-ombouw

Een MIDI-noot op een vooraf gekozen kanaal activeert dezelfde boekfunctie. Het medium is digitaal, maar de gedeelde sturing blijft behouden.

### Scenario C — uitgebreid MIDI-orgel

- Saxofoon: poort 3, kanaal 1 → melodie.
- Fluit 8': poort 6, kanaal 2 → versieringen.
- Violen: poort 7, kanaal 12 → tegenmelodie (voorbeeld uit de uitleg).
- Piano: poort 1, kanaal 1 → begeleiding met velocity.
- Slagwerk: poort 9, kanaal 10 → ritmische accenten met verschillende aanslagsterktes.
- Expressie: toegewezen controllers → bijvoorbeeld een regelbare expressiefunctie.

**Alle adressen behalve de genoemde viooltoewijzing zijn illustratief.** De daadwerkelijke mapping moet uit de technische configuratie van het specifieke orgel worden overgenomen.

Nu kunnen de partijen onafhankelijk gecomponeerd en aangestuurd worden. De luisteraar hoort niet simpelweg een boek dat digitaal wordt nagespeeld, maar potentieel een uitgebreider arrangement waarin de mechanische instrumenten elk een eigen rol krijgen.

---

## 10. Waarom MIDI-capaciteit en orgelcapaciteit niet hetzelfde zijn

Dit onderscheid is cruciaal:

1. **Protocolcapaciteit:** wat MIDI als berichten kan verzenden (kanalen, noten, velocity, controllers enz.).
2. **Routingcapaciteit:** naar hoeveel onafhankelijke adressen het systeem die berichten kan sturen (bijvoorbeeld 16 × 16 = 256).
3. **Mechanische capaciteit:** welke fysieke onderdelen van het orgel onafhankelijk kunnen reageren.
4. **Expressiecapaciteit:** welke onderdelen daadwerkelijk variabele aanslag, winddruk, vibrato of andere expressie ondersteunen.
5. **Muzikale capaciteit:** welke arrangementen en instrumentcombinaties daarmee uitvoerbaar zijn.

Een systeem kan op niveau 1 en 2 zeer uitgebreid zijn, maar toch beperkt blijven op niveau 3 en 4 als de mechaniek geen afzonderlijke of expressieve besturing ondersteunt.

Daarom is de sterkste technisch verdedigbare formulering niet ‘ieder Decap-orgel gebruikt alle MIDI-functies’, maar:

> **Een uitgebreid Decap Herentals-orgel kan de beschikbare MIDI-capaciteit veel vollediger benutten dan een eenvoudige boekvervangende ombouw, doordat het afzonderlijke instrumentgroepen en — waar de mechaniek dat toelaat — expressieve functies via MIDI kan aansturen.**

---

## 11. Veelvoorkomende misverstanden

**‘Een standaardorgel heeft maar één MIDI-kanaal.’**  
Niet algemeen juist. Een eenvoudige ombouw *kan* één kanaal gebruiken, maar andere orgels en ombouwen kunnen meerdere kanalen en poorten gebruiken.

**‘Een Decap Herentals-orgel heeft altijd 16 poorten.’**  
Niet aangetoond. Zestien poorten is de besproken configuratie; per orgel moet de werkelijke installatie worden nagegaan.

**‘16 poorten betekenen 256 instrumenten.’**  
Nee. Het zijn 256 kanaaladressen. Een kanaal kan meerdere noten of functies dragen en één instrument kan meerdere kanalen nodig hebben.

**‘Velocity werkt op iedere orgelpijp.’**  
Nee. Velocity is een MIDI-waarde. De ontvangende mechaniek moet de waarde omzetten in een hoorbaar effect.

**‘MIDI-kanalen zijn hetzelfde als MIDI-tracks.’**  
Nee. Tracks organiseren de muziek; kanalen en poorten adresseren de ontvangers.

**‘Meer MIDI-kanalen betekenen automatisch betere klank.’**  
Nee. Meer kanalen geven meer onafhankelijkheid en flexibiliteit. Klankkwaliteit hangt ook af van de instrumenten, intonatie, mechaniek, regeling en het arrangement.

**‘Alle andere orgels zijn minder geavanceerd.’**  
Niet als algemene uitspraak verdedigbaar. Het onderscheid moet per concreet orgel en per ombouw worden vastgesteld.

---

## 12. Checklist om een specifiek Decap Herentals-orgel te beoordelen

Voor een definitieve technische vergelijking zijn deze gegevens nodig:

- [ ] Exact model, bouwjaar en eventuele verbouwingen.
- [ ] Aantal werkelijke fysieke en virtuele MIDI-poorten.
- [ ] Aantal gebruikte kanalen per poort.
- [ ] Mapping van **(poort, kanaal, noot)** naar iedere fysieke klep of instrumentgroep.
- [ ] Welke instrumenten onafhankelijk noten kunnen spelen.
- [ ] Welke instrumenten op velocity reageren en met welke kalibratie.
- [ ] Welke CC-, Program Change-, Aftertouch- en Pitch Bend-berichten daadwerkelijk worden ondersteund.
- [ ] Welke functies winddruk, vibrato, tremolo, zwelkast en registers regelen.
- [ ] Maximale gelijktijdige mechanische belasting en beschikbare polyfonie.
- [ ] Documentatie van eigen/proprietaire MIDI-mappings.

Zonder deze gegevens is het niet mogelijk om voor **elk** Decap Herentals-orgel exact te beweren dat alle MIDI-functies fysiek benut worden.

---

## 13. Slotconclusie

Een traditioneel boekorgel is gebouwd rond een vaste boekindeling. Een eenvoudige MIDI-ombouw vervangt het boek door digitale opdrachten, maar kan de oorspronkelijke koppelingen en beperkingen behouden.

Een uitgebreid MIDI-gestuurd Decap Herentals-orgel kan een wezenlijk andere aanpak bieden: **veel afzonderlijke MIDI-bestemmingen**, **onafhankelijk aanstuurbare instrumentgroepen** en **expressieve besturing** via velocity en andere MIDI-berichten, voor zover de mechaniek en elektronica dat ondersteunen.

In de besproken configuratie is de schaal duidelijk: **16 MIDI-poorten × 16 kanalen = 256 onafhankelijke kanaaladressen**. Dat is zestienmaal de adresruimte van één klassieke MIDI-poort. De grote muzikale winst zit echter niet alleen in dat getal, maar in de mogelijkheid om de adressen aan **werkelijk onafhankelijke, expressieve mechanische instrumenten** te koppelen.

**Kort samengevat: MIDI als boekvervanger stuurt het bestaande boek na; uitgebreide MIDI-aansturing kan het orgel als een afzonderlijk bestuurbaar mechanisch orkest laten functioneren.**

---

### Herkomst van deze uitleg

Deze README is gebaseerd op de door de gebruiker aangeleverde gesproken toelichting en op algemene technische eigenschappen van **MIDI 1.0**. De poortindeling en de genoemde instrumenttoewijzingen zijn voorbeelden of gegevens uit die toelichting, geen onafhankelijk geverifieerde fabrieksspecificaties van alle Decap Herentals-orgels.
