# zentriboy.de – Redesign-Konzept

Braun GmbH, Werkzeugbau in Fridingen an der Donau: Werkzeugbau, Vorrichtungen, CNC-Bearbeitung,
Erodieren, Diaformschleifen. Dazu zwei eigene Produkte für Laufräder: **ZentriBoy** und **Tensiometer**.

Dieses Dokument hält die Schritte 1–8 fest (Analyse bis Architektur). Die Umsetzung (Schritt 9) liegt in
`src/`, die Prüfung (Schritt 10) steht am Ende dieses Dokuments.

---

## 1. Analyse

### Ausgangslage (Audit der alten Seite)

| Bereich | Befund |
|---|---|
| Technik | Namo-WebEditor-Vorlage von ca. 2001: Tabellenlayout, GIF-Buttons, feste 800-px-Breite, kein Mobile |
| Informationsarchitektur | Seitentitel falsch („Jobs“ ist die ZentriBoy-Seite, „Company“, „product1“), Vorlagen-Reste („Related Sites“ mit Namo/Yahoo/Tucows-Links) |
| Inhalt | Wertvoll und knapp: fünf Verfahren, zwei Produkte mit Preisen, Bestellung per Fax/E-Mail, 15 echte Werkstattfotos (2001, 640×480), 4 Produktfotos (250 px) |
| Fehler | Kodierungsfehler („Gerõt“, „Ć 145,67“), Tippfehler („Wilkommen“), uneinheitliche Fax-Schreibweise (074635007) |
| Recht | Impressum ohne Registergericht/HRB und USt-IdNr., keine Datenschutzerklärung |
| Marke | Kein Logo und keine Farbwelt. Einziges wiedererkennbares Element: beide Produkte sind um eine **Messuhr** gebaut |

### Ziel und Wirkung

- Zwei Zielgruppen, eine Haltung: **Industriekunden** (Lohnfertigung, Werkzeuge, Vorrichtungen) und
  **Radfahrer und Werkstätten** (ZentriBoy, Tensiometer). Beide kaufen dasselbe: *Genauigkeit, die man ablesen kann*.
- Die Seite soll wirken wie ein präzises Werkstück: ruhig, exakt und mit einem überraschenden Detail.
  Kein Maschinenbau-Katalog und kein Startup-Look.
- Der erste Eindruck muss in 3 Sekunden erklären: „Die machen Präzision, und sie haben etwas, das mein Rad rund macht.“

### Design Read

> Overhaul-Redesign einer Firmen- und Produktseite für Industriekunden und Radwerkstätten, in einer Sprache aus
> „technischer Zeichnung und kinetischer Typografie“, umgesetzt mit Astro, GSAP, Lenis und Three.js mit eigener Art Direction.

Dials: `DESIGN_VARIANCE 9 · MOTION_INTENSITY 9 · VISUAL_DENSITY 3`

---

## 2. Art Direction: „Rundlauf“

**Leitidee:** Alles läuft auf *Zentrieren* hinaus. Das Wort steckt im Produktnamen (ZentriBoy), im Handwerk
(Zentrierbohrung, Werkstück zentrieren) und in der Messuhr, die beide Produkte tragen.

**Erzählung beim Scrollen:** *Aus der Spur → zentriert.* Auf der Startseite eiert ein Laufrad in 3D. Die
Buchstaben von „ZENTRIERT“ laufen im selben Seitenschlag wie die Felge, und die Messuhr schlägt aus. Mit dem
Scrollen wird das Rad zentriert: Die Buchstaben richten sich auf eine Linie aus, die Nadel kommt bei Null zur Ruhe.
Die Seite führt also vor, was der ZentriBoy tut.

**Zwei Materialwelten, ein harter Wechsel:**

1. **Zeichnung** (hell): Lichtgrau nach RAL 7035, der Farbe deutscher Werkzeugmaschinen. Tuschefarbene Linien,
   Schnittschraffur und Bemaßung *nur dort, wo sie etwas erklären*.
2. **Werkstatt** (dunkel): Graphit. Metall, Funken, Produkte.

Der Wechsel passiert einmal pro Seite und immer am selben Punkt: beim **Erodieren**. Dort „schneidet“ der
Draht die Seite ins Dunkle. Farbe wird also zum Erzählmittel und nicht zur Dekoration.

**Signalrot** ist die Farbe der Messuhrnadel. Es gibt genau einen Akzent, und er steht für Messung und Abweichung.

**Formsprache:** konsequent eckig (Radius 0), Hairlines nur als Tabellen, Schriftfeld und Bemaßung. Kreise nur für
Messinstrumente und interaktive „Knöpfe“ (magnetische Pfeil-Buttons).

**Bewusst nicht:** Feature-Karten, Glassmorphism, Gradienten, Stockfotos, KI-Bilder, dekorative Rasterlinien,
Scroll-Hinweise, nummerierte Eyebrows.

---

## 3. Typografie, Farben, visuelle Sprache

### Schrift

| Rolle | Schrift | Einsatz |
|---|---|---|
| Display + Text | **Archivo Variable** (wdth 62–125 %, wght 100–900) | Die Breitenachse ist das Werkzeug: *expanded* (125 %) für Namen wie ZENTRIERT und ZentriBoy, *condensed* (62 %) für Mobile und Maßketten. Die Breite reagiert auf Scroll und Maus. |
| Technik | **IBM Plex Mono** 400/500 | Messwerte, Preise, Beschriftungen in Zeichnungen, Schriftfeld |

Selbst gehostet über Fontsource: keine Anfragen an Google, also DSGVO-konform.

Skala (fluid, `clamp()`): `mega` bis 16 rem · `display` bis 9 rem · `title` bis 4,5 rem · `lead` 1,25–1,75 rem ·
`body` 1–1,125 rem · `mono` 0,75 rem. Große Kontraste statt vieler Zwischengrößen.

### Farben (Tokens)

| Token | Hell (Zeichnung) | Dunkel (Werkstatt) |
|---|---|---|
| `--bg` | `#E4E6E3` Lichtgrau | `#111312` Graphit |
| `--fg` | `#111312` | `#E4E6E3` |
| `--fg-muted` | `#545855` (5,8 : 1) | `#9A9F9B` (7 : 1) |
| `--accent` | `#E8421A` Signalrot (Grafik, große Schrift) | `#FF5A26` |
| `--accent-text` | `#B32E0A` (5 : 1, kleine Schrift) | `#FF5A26` (5,5 : 1) |

`prefers-color-scheme: dark` setzt die „Zeichnung“ auf dunkles Anthrazit (wie ein CAD-Programm im Dunkelmodus).
Der Wechsel zur Werkstatt bleibt als Abdunkeln spürbar.

### Visuelle Sprache

- **Messuhr** (SVG, Skala 0–50–0 wie bei einer echten Messuhr mit Plus/Minus-Anzeige) als wiederkehrendes Instrument:
  Preloader, Hero, ZentriBoy, 404.
- **Echte Fotos** der Werkstatt (2001) werden graphitgrau entsättigt. Farbe gibt es erst bei Interaktion, denn sie
  sind Belege und keine Stimmungsbilder. Wegen der niedrigen Auflösung erscheinen sie nie größer als nötig.
- **Technische Zeichnungen** (SVG) erklären Verfahren und Produkte als *Prinzipdarstellung*.
- **Schriftfeld** (DIN-Zeichnungskopf) als Footer: Adresse, Kontakt, Recht, Seite.

---

## 4. Seitenstruktur

| Route | Inhalt | Welt | Alte URL (301) |
|---|---|---|---|
| `/` | Erzählung: Rundlauf → Haltung → Verfahren → Werkstatt → Produkte → Kontakt | hell → dunkel | `/`, `/index.html`, `/related.html` |
| `/fertigung` | Fünf Verfahren im Detail, Anfrage | hell → dunkel | – |
| `/werkstatt` | 15 Werkstattfotos als Leuchttisch | hell | `/product1.html`, `/Imgp*_jpg_view.htm` |
| `/zentriboy` | Produkt, Prinzip, Datenblatt, Bestellung | dunkel | `/zentriboy.html` |
| `/tensiometer` | Produkt, Prinzip, Datenblatt, Bestellung | dunkel | `/tensiometer.html` |
| `/kontakt` | Adresse, Kontakt, Bestellweg | hell | `/company.html` |
| `/impressum`, `/datenschutz` | Rechtliches | hell | `/impressum.htm` |
| `/404` | „Außerhalb der Toleranz“ | dunkel | – |

Navigation (eine Zeile, Desktop): Fertigung · Werkstatt · ZentriBoy · Tensiometer · Kontakt.
Mobil: Vollbild-Menü.

**Handlungsaufforderungen:** Jede Absicht hat genau ein Label.
*Anfrage senden* (Lohnfertigung, mailto) · *Per E-Mail bestellen* (Produkt, mailto mit Betreff) · Navigation.

---

## 5. Komposition je Section

### Startseite

1. **Preloader:** Eine Messuhr zeichnet sich, die Nadel folgt dem Ladefortschritt, springt auf Null zurück, und das
   Bild öffnet sich entlang des Fadenkreuzes in vier Quadranten.
2. **Hero, „ZENTRIERT“:** Das Wort in Archivo 125 % läuft über die volle Breite. Das 3D-Laufrad liegt *zwischen* zwei
   identischen Schriftebenen: gefüllt darunter, als Kontur darüber. Die Speichen schneiden also durch die Buchstaben.
   Unten links stehen Untertitel und zwei Links, unten rechts das Messinstrument „Seitenschlag“.
   *Mobil:* condensed (62 %), das Rad ist angeschnitten und ragt rechts aus dem Bild.
3. **Haltung:** Ein großer Absatz beginnt ab Spalte 3 und lässt links viel Weißraum. Zwei echte Fotos stehen als
   Inline-Bilder im Satz.
4. **Verfahren:** Zuerst die Überschrift „Fünf Verfahren. Eine Werkstatt.“, dann eine gepinnte Horizontalfahrt durch
   fünf „Blätter“ mit je eigener Komposition:
   Werkzeugbau (Schnittzeichnung Stempel/Matrize) · Vorrichtungen (echtes Foto mit Zeichnungsannotation) ·
   CNC (Werkzeugbahn, die sich selbst fräst) · Erodieren (Funken auf Graphit: *der Themenwechsel*) ·
   Diaformschleifen (Pantograph, den man mit der Maus führt).
5. **Werkstatt:** Eine Zoom-Parallaxe aus echten Fotos in drei Tiefenebenen. Das Mittelbild wächst, die anderen
   fliegen auseinander.
6. **Produkte:** „Zwei Werkzeuge für Laufräder.“
   *ZentriBoy:* Eine riesige Messuhr ist links angeschnitten, ihre Nadel folgt der Maus (Abweichung vom Zentrum).
   *Tensiometer:* Eine einzelne Speiche läuft diagonal über die ganze Fläche und lässt sich zupfen.
7. **Kontakt:** „Haben Sie eine Zeichnung?“ mit der E-Mail-Adresse als übergroßem Link. Darunter Telefon, Fax und Adresse.
8. **Schriftfeld** (Footer).

### Unterseiten

- **ZentriBoy:** Name in 125 %, das Laufrad fliegt von der Startseite herüber (persistente WebGL-Bühne). Danach
  „Sie bauen Ihr Rad immer noch aus?“, dann „Ersetzt den ~~Zentrierständer~~ vollkommen“ (Durchstreichen per Scroll),
  anschließend Festklemmen · Zentrieren · Ablesen als gepinnte Prinzipzeichnung mit echten Belegfotos, am Ende ein
  Datenblatt in vier Blöcken und die Bestellung.
- **Tensiometer:** „Tensio / meter“, dazwischen liegt die zupfbare Speiche. Darauf folgen Einklicken · Ablesen ·
  Vergleichen als Triptychon mit Prinzipzeichnung nach dem echten Gerät, danach Datenblatt und Bestellung.
- **Fertigung:** Ein Index aus fünf großen Links (Hover-Vorschau), dann fünf Blätter mit wechselnden Layouts
  (Split, Vollbild-Foto mit Annotation, gepinnt, dunkel und interaktiv). Die Seite endet mit „Anfrage senden“.
- **Werkstatt:** ein Leuchttisch zum Ziehen (Desktop) bzw. ein versetztes Raster (Mobil), dazu eine Lightbox mit
  Flip-Übergang und Tastatursteuerung sowie GLSL-Verzerrung beim Hover.
- **Kontakt / Impressum / Datenschutz:** ruhig und typografisch, die Lesbarkeit hat Vorrang.

---

## 6. Animation und Interaktion

**Bewegungsgesetz:** Dinge *richten sich aus*. Elemente starten versetzt oder „aus der Spur“ und rasten auf ihre
Linie ein, wie eine gedämpfte Messuhrnadel (Feder statt Linear-Easing). Standard-Easing `expo.out`, Seitenwechsel
`power3.inOut`, Nadeln laufen über Federphysik.

| Element | Animation / Interaktion | Zweck |
|---|---|---|
| Überschriften | Zeilen maskiert von unten (SplitText, `mask: lines`) | Hierarchie |
| Haltungs-Absatz | Wortweises Einfärben per Scroll (scrub), Inline-Fotos öffnen sich | Lesefluss erzählen |
| Messwerte, Labels | Scramble-Text, Ziffern-Rolle bei Preisen | Messgerät-Charakter |
| Hero | Scroll zentriert Rad + Buchstaben, Mausbewegung stört den Rundlauf kurz | Kernbotschaft |
| Verfahren | Horizontal gepinnt, jede Zeichnung ist an ihre Position gekoppelt (`containerAnimation`) | Erzählung |
| Werkstatt | Zoom-Parallaxe (3 Ebenen, scrub) | Beweis, Intensität |
| Messuhr | Nadel folgt Maus/Touch, Feder-Dämpfung | Produkt erlebbar machen |
| Speiche | Ziehen und Loslassen, gedämpfte Schwingung | Produkt erlebbar machen |
| Pantograph | Maus führt Taster, Kopie zeichnet sich verkleinert | Verfahren verstehen |
| Cursor | Punkt + Ring, Labels „Ansehen“, „Ziehen“, „Zupfen“, „Führen“ | Kontext |
| Buttons | Magnetisch (Pfeil-Knopf), Pfeil dreht sich | Feedback |
| Seitenwechsel | „Zentrierblende“: Kreis schließt sich zur Mitte, Ziel-Titel, öffnet sich | Zusammenhang |
| Produkt-Teaser | Fläche wächst aus dem Teaser in die neue Seite | Kontinuität |
| Laufrad | Persistente Bühne fliegt zwischen den Seiten an den neuen Ort | Kontinuität |
| Header | Blendet beim Runterscrollen aus, `mix-blend-mode: difference` | Ruhe |

**Reduzierte Bewegung:** kein Preloader, kein Lenis, kein Pinning und kein Scrub (Endzustände), statisches Laufrad,
kein eigener Cursor, Seitenwechsel ohne Blende. Direkte Interaktionen (Nadel, Speiche) bleiben, aber ohne Nachschwingen.

---

## 7. Technologie je Effekt (einfachste Technik, die hochwertig wirkt)

| Effekt | Technik | Begründung |
|---|---|---|
| Hover, Fokus, Unterstreichungen, Grain | CSS | reicht |
| Text-Reveals, Timelines, Seitenwechsel | GSAP (+ SplitText, ScrambleText, CustomEase, Flip) | präzise Choreografie |
| Pinning, Horizontalfahrt, Scrub | GSAP ScrollTrigger + Lenis | synchronisiertes Smooth Scrolling |
| Messuhr, Zeichnungen, Werkzeugbahn, Pantograph | SVG (+ DrawSVG, MotionPath) | gestochen scharf, leicht, barrierearm |
| Funken, Speichenschwingung | Canvas 2D | viele Partikel bzw. freie Kurve |
| Laufrad | Three.js (Instancing, 1 Draw Call für 32 Speichen) | echtes 3D mit Seitenschlag |
| Seitenschlag der Felge | GLSL (Vertex-Shader via `onBeforeCompile`) | GPU verformt, CPU rechnet nur den Messwert |
| Foto-Hover | GLSL-Shader auf einem einzigen Overlay-Canvas | RGB-Split + Welle ohne 15 WebGL-Kontexte |
| React | **nicht verwendet** | Keine Komponente braucht Zustand über Frameworks hinweg, Vanilla-TS-Module genügen |

---

## 8. Technische Architektur

```
src/
  pages/          Routen (dünn, nur Komposition)
  layouts/        BaseLayout: Head, SEO, persistente Ebenen
  components/
    layout/       Header, Menü, Schriftfeld, Preloader, Cursor, Blende, Bühne
    ui/           Messuhr, Pfeil-Knopf, Icon, Foto, Marke
    home/ product/ process/ werkstatt/   Sections
  data/           Firma, Produkte, Verfahren, Fotos (eine Quelle für Preise etc.)
  styles/         tokens, base, typography, layout
  lib/            motion, lifecycle, smooth-scroll, cursor, magnetic, split, observe, transitions, math, dom
  animations/     reveals (data-reveal), parallax, counter
  modules/        Seitenmodule (data-module="…"), lazy geladen
  webgl/          Bühne, Laufrad, Shader, Foto-Verzerrung
```

- **Lebenszyklus:** `astro:page-load` sucht `[data-module]` und lädt das passende Modul dynamisch. Jedes Modul gibt eine
  Cleanup-Funktion zurück (GSAP-Context, Listener, Observer, WebGL). `astro:before-swap` räumt alles auf.
- **Persistent** (`transition:persist`): Cursor, Blende, WebGL-Bühne, Grain.
- **Seitenwechsel:** ClientRouter. Der `loader` von `astro:before-preparation` wird so umhüllt, dass die GSAP-Blende und
  der Fetch parallel laufen. Native View-Transition-Animationen sind deaktiviert (`transition:animate="none"`).
- **WebGL-Bühne:** ein festes, transparentes Canvas, `pointer-events: none`. Das Laufrad folgt DOM-Ankern
  (`data-wheel-anchor`): Position und Größe kommen aus dem Layout, damit das DOM die 3D-Szene steuert. Die Bühne rendert
  nur, wenn ein Anker sichtbar ist. DPR ist gedeckelt (Desktop 1,75, Mobil 1,25), Three.js wird nur auf Seiten mit Anker
  geladen.
- **Performance:** Astro-Islands-Prinzip ohne Framework-Runtime, Module per `import()`, Bilder über `astro:assets`
  (AVIF/WebP, `srcset`, lazy), Canvas-Loops laufen nur im Viewport, `gsap.matchMedia()` für Breakpoints und Motion-Präferenz.
- **Barrierefreiheit:** semantische Landmarks, Skip-Link, sichtbarer Fokus (Signalrot, 2 px Versatz), Menü als Dialog mit
  Fokusfalle, alle Inhalte ohne JS lesbar (versteckte Startzustände nur unter `.js`), Fokus in der Horizontalfahrt scrollt
  das passende Blatt ins Bild, dekorative Canvas-Elemente mit `aria-hidden` und Tastatur-Alternative.

---

## 9. Umsetzung

Siehe `src/` und [README.md](README.md). Abweichungen vom Plan, die sich bei der Umsetzung als besser erwiesen haben:

- **Hero ohne GSAP-Pin:** Ein Pin (`position: fixed`) hätte einen Stacking-Kontext erzeugt, und das Laufrad läge über
  *beiden* Schriftebenen. Stattdessen gibt es zwei `position: sticky`-Ebenen (Füllung unter, Kontur über der
  WebGL-Bühne). Das ist einfacher, und die Speichen laufen durch die Buchstaben.
- **Header ohne `mix-blend-mode`:** Der Differenz-Modus hätte den roten Messpunkt der Marke ins Cyan gekippt. Der Header
  liest stattdessen per Hit-Test die Materialwelt unter sich und färbt sich passend, auch in der Horizontalfahrt.
- **Verfahrens-Index als reines CSS:** Beim Hover dehnt sich die Breitenachse der Schrift von 100 auf 125 %. Dafür
  braucht es kein JS-Modul.
- **Keine Zahlen in der Tensiometer-Tabelle:** Die Tabelle gehört zum Lieferumfang. Auf der Seite bleibt sie abstrakt,
  damit keine erfundenen Messwerte entstehen.

---

## 10. Prüfprotokoll

### Automatisch

| Prüfung | Ergebnis |
|---|---|
| `astro check` (94 Dateien) | 0 Fehler, 0 Warnungen, 0 Hinweise |
| `astro build` | 9 Seiten, 151 Bildvarianten (AVIF/WebP), Sitemap |
| JS-Kern (alle Seiten) | 67 KB gzip (GSAP, ScrollTrigger, SplitText, Lenis, App) |
| Three.js + Bühne | 136 KB gzip, **nur** auf Seiten mit Laufrad (Start, ZentriBoy), lazy |
| Leuchttisch (Draggable, Inertia) | 17 KB gzip, nur auf /werkstatt |
| DOM-Audit 375 × 812 und 1440 × 900, alle Seiten | kein horizontaler Überlauf, kein abgeschnittener Text, genau eine h1, keine übersprungenen Überschriftenebenen, alle Bilder mit alt, alle Links/Buttons benannt |
| Kontrast (WCAG AA) hell und dunkel | alle Texte ≥ 4,5 : 1 (große Schrift ≥ 3 : 1) |
| Gedankenstriche im sichtbaren Text | keine |
| Dev-Schalter im Produktions-Build | entfernt (`?motion=full` wirkt nur in der Entwicklung) |

### Interaktion (im Browser geprüft)

- Seitenwechsel über den ClientRouter durch alle Seiten: Blende, Swap, Aufräumen und Montage der Module, Laufrad-Anker
  pro Seite, Laufzeitklassen überleben den Tausch der `<html>`-Attribute, keine Konsolenfehler.
- Mobilmenü: Dialog mit `aria-modal`, Fokus springt ins Menü, Fokusfalle (Shift+Tab), Escape schließt, der Fokus kehrt
  zum Auslöser zurück.
- Werkstatt: Leuchttisch zentriert, Lightbox öffnet mit Beschriftung und Position („4 von 15“), Pfeiltasten und
  Schaltflächen blättern, Ansicht „Raster“ als Alternative zum Ziehen.
- Scroll-Zentrierung im Hero: bei 100 % „±0,00 mm / Zentriert“, Buchstaben auf einer Linie.

### Durch die Prüfung gefundene und behobene Fehler

1. **Reduzierte Bewegung, Desktop:** Die Horizontalfahrt lag ohne JS/Bewegung als 500 vw breite Spur in einem
   `overflow: hidden`-Container, sichtbar war nur Blatt 1. Jetzt ist die gestapelte Anordnung der Standard, die
   Horizontalfahrt gibt es nur mit `.motion-ok` ab 1024 px. Dasselbe wurde für die gepinnten Produkt-Schritte umgesetzt.
2. **Doppelte Verschiebung:** GSAP liest CSS-`translate(-50%)` als Pixelwert und rechnete `xPercent` noch einmal
   obendrauf, das Laufrad sprang mobil nach oben links. Elemente, deren Transform GSAP steuert, zentrieren sich jetzt
   über Ränder bzw. Grid.
3. **Überlauf durch große Titel:** Schriftgrößen der Einwort-Titel werden aus gemessenen Wortbreiten berechnet
   (z. B. „Werkstatt“ 7,75 em). Lange Verfahrensnamen haben weiche Trennstellen.
4. **Robustheit:** Seitenwechsel, Lightbox und Menü hingen an Animations-Callbacks. Ohne Frames (Hintergrund-Tab)
   blieb die Navigation stehen. Jetzt gelten Zeitlimits, und der Zustand wechselt sofort, die Animation ist nur
   Beiwerk. Im Hintergrund-Tab entfällt der Preloader.
5. **Reveals in sticky Ebenen:** Der ScrollTrigger-Start war um einige Pixel verschoben, Preis und Bestell-Link im
   ZentriBoy-Hero blieben unsichtbar. Was beim Intro im Bild ist, startet jetzt direkt.

### Offen: manuelle Abnahme

Die Vorschau in dieser Arbeitsumgebung war verborgen bzw. sehr klein, dadurch lief `requestAnimationFrame` gedrosselt.
Timing und Flüssigkeit der Animationen bei 60 fps sollten deshalb einmal manuell in Chrome, Safari und Firefox
(Desktop und echtes Smartphone) abgenommen werden, dazu ein Lighthouse-Lauf auf dem Produktions-Build.

---

## 11. Überarbeitung: realistischere Bilder und Bewegung (Oktober 2026)

### Konzept

Die Seite war bis hierher fast ganz gezeichnet (Linien, Messuhr, WebGL-Rad), die einzigen Fotos waren 250 bis 640 px
groß und von 2001. Das Produkt selbst sah man nie in Aktion. Ziel der Überarbeitung: **das echte Gerät im Einsatz
zeigen**, ohne die Haltung „Zeigen statt behaupten“ und „Echtheit vor Glanz“ aufzugeben.

- **Eine Tafel statt vieler Bilder.** Auf der ZentriBoy-Seite steht zwischen „Ersetzt den Zentrierständer
  vollkommen.“ und der Schritt-für-Schritt-Erklärung eine ruhige, volle Tafel: ZentriBoy an der Gabel, Werkstatt,
  Fensterlicht. Darüber läuft eine 4-Sekunden-Schleife: Das Rad dreht sich, die Nadel schlägt aus. Das ist genau die
  Behauptung der Seite („die Uhr zeigt Ihnen sofort, wenn etwas falsch läuft“), jetzt vorgeführt.
- **Bewegung mit Bedeutung.** Die Tafel öffnet sich beim Scrollen als Kreis um die Messuhr: erst das Messgerät, dann
  das ganze Rad. Der Kreis ist das Zifferblatt, die Leitidee „Rundlauf“ bleibt die Bewegungsregel.
- **Nahtlos.** Start- und Endbild des Videos sind das Standbild. Der Wechsel vom Bild zum Video und der Schleifenpunkt
  fallen nicht auf (gemessene Bilddifferenz an der Naht 3,2 gegenüber bis zu 8,5 zwischen Nachbarbildern mitten in der
  Drehung).
- **Ehrlich.** Jede Visualisierung trägt sichtbar „KI-Visualisierung“ und den Hinweis auf mögliche Abweichungen,
  die Originalfotos bleiben als Belege. Ein Schalter (`aiVisuals.enabled`) stellt alles auf die Originale zurück.
- **Realistischeres 3D-Rad.** Statt der neutralen Studio-Umgebung spiegelt das Rad jetzt eine nachgebaute Werkstatt
  mit demselben Licht wie die Visualisierung (Sprossenfenster links, Leuchtstoffröhren, Hallentor). Die Lichtflächen
  sind HDR, deshalb bekommen Felge und Nabe echte Glanzverläufe. Auf leistungsstarken Geräten kommen physikalische
  Materialien dazu: anisotrop gebürstete Felge und Nabe, Reifen mit Sheen, eloxierte Nippel.
- **Werkstatt-Zoom schärfer.** Das Mittelbild ist eine KI-Hochskalierung des Originals (2880 px) und wächst jetzt auf
  rund zwei Drittel der Breite, begrenzt auf 86 % der Fensterhöhe.

Nicht umgesetzt: eine generierte Funken-Textur für das Erodieren. Sie wäre Dekoration gewesen, die Zeichnung erklärt
das Verfahren besser. Die Tensiometer-Visualisierung scheiterte am Free-Plan (siehe README).

### Umsetzung

- `src/data/visuals.ts`: Visualisierungen mit Fokuspunkt, Freigabestatus und Kennzeichnungstexten.
- `src/components/product/UsePlate.astro` + `src/modules/plate.ts`: Tafel, Kreisblende (GSAP, nur Desktop mit
  Bewegung), Video-Logik (lazy ab halber Bildschirmhöhe Abstand, Wiedergabe nur sichtbar und bei sichtbarem Tab,
  Anhalten/Abspielen-Knopf nach WCAG 2.2.2, kein Video bei reduzierter Bewegung, Datensparmodus, 2G/3G).
- Startseite: Die ZentriBoy-Szene zeigt die Visualisierung (4 : 3, grau bis zum Hover wie alle Fotos) statt des
  250-px-Fotos.
- `src/webgl/workshop-env.ts`: HDR-Werkstatt für PMREM; `wheel.ts`: Materialien je Leistungsstufe.
- Laufweiten großer Titel auf −0,04 em angehoben (vorher bis −0,05 em; Buchstaben berührten sich fast).
- Zwei Fotos der ZentriBoy-Seite waren vertauscht beschriftet („Einzelteile“ zeigte das montierte Gerät). Dateien
  getauscht, Alt-Texte stimmen jetzt.
- Alt-Text von Foto 0455 präzisiert (Sternteil in der Vorrichtung statt „Aluminiumplatte“).

### Prüfung

| Prüfung | Ergebnis |
|---|---|
| `astro check` (98 Dateien) | 0 Fehler, 0 Warnungen, 0 Hinweise |
| `astro build` | 9 Seiten, 187 Bildvarianten, Video als gehashtes Asset unter `/_astro/` |
| Neues Modul `plate` | 1 KB gzip, nur auf /zentriboy |
| Three.js + Bühne | 137 KB gzip (unverändert), `RoomEnvironment` nicht mehr im Bundle |
| DOM-Audit 1440 × 900 und 375 × 812, alle Seiten | kein Überlauf, keine abgeschnittenen Texte (gemessen an den Glyphen), je eine h1, alle Bilder mit alt |
| Kontrast der Tafel | Titel 15,6 : 1, Hinweis 7,3 : 1, Etikett „KI-Visualisierung“ 6,3 : 1 |
| Video im Produktions-Build | HTTP 200, `video/mp4`, lädt und spielt, Status „Video anhalten“ korrekt |
| 3D-Rad (Canvas-Mitschnitt) | Felge silbern mit Fensterverlauf, Nabe hell, Nippel rot eloxiert |

**Gefunden und behoben:** Mit klassischer Scrollleiste (Windows) ließ sich jede Seite mit Horizontalfahrt oder Pin
um 15 px quer verschieben. Ursache: `overflow-x: clip` auf `body` wanderte auf den Viewport und wurde dort zu
`hidden`, das per Script oder Fokus doch scrollt; die Prozess-Panels sind `100vw` breit, also inklusive Scrollleiste.
Jetzt trägt `html` selbst `overflow-x: hidden`, dadurch bleibt das Clip am `body` und schneidet wirklich ab.

**Offen:** Freigabe der Visualisierung durch die Braun GmbH; Video optional mit ffmpeg auf etwa 1 MB verkleinern
(Befehl im README); Wiedergabe und Kreisblende einmal auf echten Geräten ansehen (in dieser Umgebung laufen
`requestAnimationFrame` und IntersectionObserver im verborgenen Vorschaufenster nicht).
