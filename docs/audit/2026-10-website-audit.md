# Website-Audit Oktober 2026

Geprüft: alle 9 Routen (/, /fertigung, /werkstatt, /zentriboy, /tensiometer, /kontakt, /impressum, /datenschutz, 404),
Komponenten, Module, Konfiguration (`astro.config.mjs`, `vercel.json`, `public/.htaccess`, `robots.txt`), der
Produktions-Build und die Live-Vorschau <https://zentriboy-redesign.vercel.app>. Stand des Codes: Branch
`fix/audit-2026-10`.

Legende: ✅ bestanden · 🔧 behoben/verbessert · ⚠️ manuelle Prüfung nötig · ❌ fehlt · ➖ nicht anwendbar · ❔ nicht geprüft

---

## 1. Gesamtstatus

Die Website ist technisch in gutem Zustand: statisches HTML, keine Drittanbieter-Dienste, keine Cookies, keine
Formulare. Der automatische Accessibility-Test (axe-core, WCAG 2.0–2.2 A/AA plus Best Practices) meldete schon vor dem
Audit keine Verstöße. Die manuelle Prüfung fand trotzdem echte Barrieren, die jetzt behoben sind: unsichtbarer
Tastaturfokus, Text über hellem Foto, verschmolzene Wörter in Link-Namen, Dauerbewegung ohne Pause-Möglichkeit und ein
Überlauf bei 320 px.

Die größten offenen Punkte sind **rechtlich** und brauchen Angaben oder Entscheidungen der Braun GmbH: Registereintrag
im Impressum, Hosting in der Datenschutzerklärung, Widerrufsbelehrung und Verbraucherinformationen für Bestellungen per
E-Mail. Sie wurden nicht erfunden, sondern auf der Seite sichtbar als Entwurf gekennzeichnet und unten aufgelistet.

Performance: Die Blockierzeit beim Start (Total Blocking Time, mobil, Labor) sank im direkten Vergleich von 1417 ms
auf rund 530 ms, der Lighthouse-Wert von 65 auf 78. Ein langer Schritt bleibt: die WebGL-Initialisierung des 3D-Rads
im Software-Renderer der Testumgebung.

## 2. Ausgangslage

- **Unternehmen:** Braun GmbH, Württembergerstr. 14, 78567 Fridingen, Deutschland. Werkzeugbau und Lohnfertigung (B2B),
  dazu zwei eigene Produkte für Radfahrer und Werkstätten (B2C und Händler).
- **Zielmarkt:** Deutschland (Versandpauschale Inland), Auslandsbestellungen werden erwähnt.
- **Geschäftsmodell auf der Website:** Anfragen per E-Mail, Bestellungen per E-Mail oder Fax. Kein Warenkorb, kein
  Formular, kein Konto, keine Zahlung auf der Website.
- **Technik:** Astro 7 (statisch), GSAP, Lenis, Three.js; Hosting der Vorschau auf Vercel, Zielhosting Apache-Webspace.

## 3. Prüfliste

### 3.1 Barrierefreiheit (WCAG 2.2 AA)

| Anforderung | Status | Befund |
|---|---|---|
| Farbkontrast | 🔧 | axe: 0 Verstöße in hell und dunkel, Desktop und mobil. Manuell gefunden: Überschrift „Aus der Werkstatt.“ lag teilweise über einem hellen Foto; das Etikett „KI-Visualisierung“ hätte über hellen Bildstellen nur etwa 3 : 1 erreicht. Beides behoben. Fälle, die axe nicht messen kann (Text über Canvas, SVG-Beschriftungen), rechnerisch geprüft: bestanden. |
| Alternativtexte | ✅ | Alle Bilder mit kontextbezogenem Alt-Text, dekorative Grafiken und Canvas mit `aria-hidden`. |
| Tastaturbedienung | 🔧 | Reihenfolge logisch (Skip-Link, Logo, Navigation, CTAs, Inhalte, Fußzeile). Die Tastatur-Alternative „Speiche anschlagen“ war fokussierbar, aber unsichtbar. Jetzt erscheint sie beim Fokus als Knopf. Kopfzeile blendet sich bei Fokus wieder ein. |
| Sichtbarer Fokus | 🔧 | Globaler `:focus-visible`-Rahmen (2 px Signalrot) vorhanden; siehe oben. |
| Semantik, Überschriften, Landmarken | ✅ | Je Seite genau eine h1, keine übersprungenen Ebenen, `header`/`nav`/`main`/`footer`, Liste und Definitionslisten korrekt. |
| ARIA sparsam | 🔧 | `aria-label` am Logo durch sichtbaren Text plus versteckten Zusatz ersetzt („Braun GmbH, zur Startseite“), damit der sichtbare Text im Namen steht (2.5.3). |
| Beschriftungen von Links und Buttons | 🔧 | Astro entfernt beim Komprimieren Leerraum zwischen Elementen. Dadurch verschmolzen Wörter im Namen: „BraunGmbH“, „info@zentriboy.de(E-Mail-Anfrage …)“, „WerkzeugbauWerkzeuge nach …“, „Nächstes WerkzeugTensiometer“. Mit echten Leerzeichen behoben, systematisch auf allen Seiten geprüft. |
| Formulare | ➖ | Keine Formulare (Kontakt und Bestellung per E-Mail-Link). |
| Screenreader | ❔ | Kein manueller Test mit NVDA, JAWS oder VoiceOver möglich (in dieser Umgebung nicht verfügbar). Namen, Rollen und Reihenfolge automatisch geprüft. |
| Bewegung (`prefers-reduced-motion`) | ✅ | Bei reduzierter Bewegung: kein Preloader, kein Smooth Scrolling, kein Pinning, kein Video, alle Inhalte sichtbar. |
| Pausieren von Bewegung (2.2.2) | 🔧 | Dauerbewegungen ohne Pause-Möglichkeit: Grunddrehung des Rads, „atmende“ Messuhr, EDM-Funken im Stand, 404-Zittern, Filmkorn. Jetzt enden sie nach höchstens 5 s bzw. sind statisch; auf Scrollen und Interaktion reagiert alles weiter. Das Video hat einen Pause-Knopf. |
| Reflow und Zoom (1.4.10) | 🔧 | Kein horizontaler Überlauf bei 320, 375, 1024, 1280, 1440, 1920 und 2560 px. Bei 320 px lief „Tensiometer“ im Weiter-Link über den Rand, behoben. |
| Zielgrößen (2.5.8) | 🔧 | Fußzeilen-Links waren 22 px hoch (durch Abstand zulässig), jetzt 28 px. |
| Abstände im Text (1.4.12) | ❔ | Nicht gesondert getestet. |

### 3.2 Recht und Transparenz

| Anforderung | Status | Befund |
|---|---|---|
| Impressum (§ 5 DDG) | ❌ / 🔧 | Name, Rechtsform, Anschrift, Geschäftsführer, Telefon und E-Mail vorhanden. **Registergericht und Registernummer fehlen** (Pflicht für eine GmbH), USt-IdNr. falls vorhanden ebenso. Bisher wurden fehlende Angaben still weggelassen; jetzt zeigt das Impressum einen sichtbaren Entwurfshinweis mit den fehlenden Punkten. |
| Verbraucherstreitbeilegung (§ 36 VSBG) | ⚠️ | Pflicht ab mehr als 10 Beschäftigten. Formulierung ist eine Entscheidung der Braun GmbH; vorbereitet in `legal.consumerDispute`. |
| Link zur EU-OS-Plattform | ➖ | Die ODR-Verordnung wurde zum 20. Juli 2025 aufgehoben, der Link ist nicht mehr nötig und nicht vorhanden. |
| Datenschutzerklärung (DSGVO) | ⚠️ / 🔧 | Vorhanden, verständlich, als Entwurf gekennzeichnet. Korrigiert: Die Aussage „von unserem eigenen Server … keine Daten an Dritte“ stimmte nicht (die Vorschau liegt bei Vercel, USA). **Hosting-Anbieter, Speicherdauer der Server-Protokolle und Drittlandübermittlung fehlen**, vorbereitet in `legal.hosting`. Rechtliche Prüfung steht aus. |
| TDDDG (Endgeräte-Zugriff) | ✅ / ⚠️ | Keine Cookies. Ein `sessionStorage`-Eintrag („zb-intro“) unterdrückt die Startanimation bei weiteren Aufrufen; ohne Personenbezug, wird nicht übertragen. Einordnung als technisch erforderlich (§ 25 Abs. 2 Nr. 2 TDDDG) rechtlich bestätigen lassen. |
| Cookie-Banner / Consent | ➖ | Nicht erforderlich: keine Cookies, kein Tracking, keine einwilligungspflichtigen Dienste. Bewusst nicht eingebaut. |
| AGB | ⚠️ | Gesetzlich nicht vorgeschrieben. Bei regelmäßigem Verkauf an Verbraucher empfehlenswert; Entscheidung der Braun GmbH. |
| Widerruf, Verbraucherinformationen | ❌ | Bestellungen per E-Mail sind Fernabsatzverträge. **Es fehlen Widerrufsbelehrung mit Muster-Widerrufsformular sowie Angaben zu Zahlungsarten, Lieferzeit und Versand ins Ausland** (§ 312d BGB, Art. 246a EGBGB). Nicht erstellt, weil dafür Entscheidungen der Braun GmbH nötig sind (z. B. wer die Rücksendekosten trägt) und der Text rechtlich geprüft werden muss. Ob die seit 19. Juni 2026 geltende Widerrufsfunktion für online geschlossene Verträge auch Bestellungen per E-Mail betrifft, ist rechtlich zu klären. |
| Preisangaben | ✅ / ⚠️ | Preise inkl. MwSt. und Versandpauschale Inland angegeben. Versandkosten ins Ausland fehlen. Preise stammen vom alten Stand der Website. |
| Barrierefreiheitsstärkungsgesetz | ⚠️ | Die Website dient der Anbahnung von Verbraucherverträgen. Ausgenommen sind Kleinstunternehmen (unter 10 Beschäftigte und höchstens 2 Mio. € Umsatz). Falls nicht ausgenommen: Erklärung zur Barrierefreiheit nötig. Technisch ist die Seite auf WCAG 2.2 AA geprüft. |
| Urheber- und Nutzungsrechte | ✅ / ⚠️ | Schriften (Archivo, IBM Plex Mono: SIL OFL), Icons (Phosphor: MIT), Bibliotheken (Astro, Three.js, Lenis: MIT; GSAP: Standardlizenz). Fotos stammen von der alten Website der Braun GmbH; Rechte bitte bestätigen. KI-Visualisierung im Higgsfield-Free-Plan erzeugt: kommerzielle Nutzung laut Higgsfield-Bedingungen prüfen. |
| Bewertungen, Testimonials | ✅ | Keine vorhanden, keine erfunden. |
| Werbeaussagen | ⚠️ | „Ersetzt den Zentrierständer vollkommen“ und „Sie können keinen Fehler mehr machen“ stammen aus der alten Website. Absolute Aussagen auf Belegbarkeit prüfen (§ 5 UWG). Nicht entfernt, da Originaltexte des Herstellers. |
| KI-Kennzeichnung (Art. 50 KI-VO) | ✅ | Visualisierung und Video sichtbar als „KI-Visualisierung“ gekennzeichnet, mit Hinweis auf mögliche Abweichungen. |

### 3.3 Datenschutz, Cookies, Tracking

| Anforderung | Status | Befund |
|---|---|---|
| Analytics, Marketing, Pixel | ✅ | Keine. |
| Cookies, Local Storage | ✅ | Keine Cookies, kein Local Storage; nur der oben genannte Sitzungseintrag. |
| Externe Ressourcen (Fonts, CDNs, APIs) | ✅ | Keine. Schriften lokal gebündelt, alle Dateien vom eigenen Host. Einziger externer Link: „Route planen“ (OpenStreetMap), erst beim Klick, mit Hinweis „öffnet in neuem Fenster“. |
| Video- und Social-Embeds | ➖ | Keine; das Video ist selbst gehostet. |
| Formulare, Newsletter, CRM | ➖ | Keine. |
| Datenminimierung | ✅ | Die Bestell-Mail-Vorlage fragt nur Artikel, Anzahl, Name und Lieferadresse ab. |

### 3.4 Technisches SEO

| Anforderung | Status | Befund |
|---|---|---|
| Title, Description | ✅ | Je Seite eindeutig und beschreibend. |
| Canonical | ✅ | Einheitlich mit Schrägstrich, passend zu Build und Sitemap; 404 ohne Canonical. |
| Meta Robots | ✅ | Nur die 404-Seite `noindex`. Auf `*.vercel.app` bewusst `X-Robots-Tag: noindex` (Vorschau). |
| Open Graph, Twitter/X | 🔧 | Vorschaubild fehlte. Neu: `og-image.jpg` (1200 × 630, echtes Werkstattfoto mit Wortmarke), Bildmaße und -Alt, `twitter:card`. |
| Sprache | ✅ | `lang="de"`. |
| robots.txt, sitemap.xml | ✅ | Gültig; Sitemap mit den 8 kanonischen URLs, ohne 404. |
| Interne Links | ✅ | 569 interne Verweise im Build, 0 defekt. |
| Statuscodes, Weiterleitungen | ✅ | Auf Vercel live geprüft: alle Seiten 200, alte Adressen 308, unbekannte Adressen 404 mit eigener Seite. Die Apache-Regeln in `.htaccess` (301) sind nicht live getestet, da kein Webspace angebunden ist. |
| 404-Seite | ✅ | Eigene Seite mit Navigation und echtem HTTP-404. |
| Favicon | 🔧 | SVG-Favicon (hell/dunkel) vorhanden; ergänzt um PNG-Fallback und Apple-Touch-Icon. |
| Strukturierte Daten | 🔧 | `LocalBusiness` um Bild und `@id` ergänzt; neu `Product` mit Preis auf beiden Produktseiten (nur Angaben, die auf der Seite stehen; ohne Verfügbarkeit, Lieferzeit, Bewertungen). |

### 3.5 UX, Conversion, Responsive

| Anforderung | Status | Befund |
|---|---|---|
| Primärer CTA ohne Scrollen | ✅ | Auf 375 × 667: Startseite (Fertigung, ZentriBoy), Produktseiten („Per E-Mail bestellen“ mit Preis), Fertigung, Kontakt. |
| CTA-Beschriftungen | ✅ | Eindeutig („Per E-Mail bestellen“, „Zum ZentriBoy“, „Alle Verfahren im Detail“). |
| Sticky Mobile CTA | ➖ | Kein erkennbarer Nutzen: Bestell-CTA steht im Hero und im Datenblatt, die Kopfzeile bleibt erreichbar. Nicht eingebaut, um keine Inhalte zu verdecken. |
| Navigation, Fußzeile | ✅ | Funktionieren auf allen Seiten, aktive Seite markiert (`aria-current`). |
| Breakpoints | 🔧 | 320 bis 2560 px geprüft, ein Überlauf bei 320 px behoben. |

### 3.6 Formulare und Interaktionen

| Anforderung | Status | Befund |
|---|---|---|
| Formulare, Validierung, Danke-Seite | ➖ | Keine Formulare vorhanden. |
| E-Mail-Links | ✅ | Betreff und Vorlage korrekt kodiert. |
| Menü, Lightbox, Video-Knopf, Seitenwechsel | ✅ | Funktionieren; Menü und Lightbox mit Fokusfalle und Escape (Prüfung aus der Umsetzung), Video-Knopf mit wechselnder Beschriftung. |

### 3.7 Performance

| Anforderung | Status | Befund |
|---|---|---|
| LCP | ✅ | Live mobil (Labor): 2,1 s. |
| CLS | ✅ | 0,001. |
| Blockierzeit / INP | 🔧 / ⚠️ | WebGL-Bühne baut in Etappen auf und kompiliert Shader asynchron; Reveals werden erst kurz vor Sichtkontakt vorbereitet. A/B unter gleichen Bedingungen: TBT 1417 → rund 530 ms, Lighthouse 65 → 78. Bleibt: ein langer Schritt der WebGL-Initialisierung (im Software-Renderer der Testumgebung ohne GPU). Auf echten Geräten prüfen. |
| Bilder | ✅ / ⚠️ | AVIF/WebP, responsive Größen, Lazy Loading. Lighthouse schätzt noch rund 30 KB Ersparnis durch genauere `sizes`-Angaben. |
| Video | ⚠️ | 4 MB, lädt nur bei Bedarf und nicht bei reduzierter Bewegung oder Datensparmodus. Neu kodieren empfohlen (etwa 1 MB, Befehl im README). |
| Schriften | ✅ | Lokal, WOFF2, Preload der Hauptschrift. |
| Caching | ✅ | Gehashte Dateien unter `/_astro/` ein Jahr `immutable`. |
| JavaScript | ✅ / ⚠️ | Three.js nur auf Seiten mit Rad; Lighthouse schätzt rund 78 KB ungenutzten Code beim Start. |

### 3.8 Sicherheit und Integrationen

| Anforderung | Status | Befund |
|---|---|---|
| Externe Skripte, iframes | ✅ | Keine. |
| Secrets im Code | ✅ | Keine gefunden; GitHub Secret Scanning mit Push-Schutz aktiv. |
| HTTPS, Mixed Content | ✅ / ⚠️ | Vercel: HTTPS mit HSTS. Apache: HTTPS-Umleitung und HSTS in `.htaccess` vorbereitet, erst nach Einrichtung des Zertifikats aktivieren. Kein Mixed Content. |
| Sicherheits-Header | 🔧 | Auf Vercel gesetzt; jetzt auch in `.htaccess` für den Webspace. |
| Content-Security-Policy | ⚠️ | Nicht gesetzt (Inline-Skripte von Astro und JSON-LD bräuchten Hashes). Empfehlung für den Livegang. |
| Abhängigkeiten | 🔧 | `source-map-js` auf 1.2.2 gehoben (GHSA-68fv-2mgg-jv7q, nur Build). `npm audit`: 0. Dependabot aktiv. |
| Unsichere Weiterleitungen | ✅ | Nur feste Weiterleitungen alter Adressen. |

## 4. Änderungen

| Bereich | Dateien |
|---|---|
| Fokus-Knopf für Tastatur-Alternativen | `src/styles/base.css` (`.focus-pill`), `src/components/home/ProductsHome.astro`, `src/pages/tensiometer.astro` |
| Kontrast Werkstatt-Zoom, KI-Etikett | `src/components/home/WerkstattZoom.astro`, `src/components/product/UsePlate.astro` |
| Namen von Links | `src/components/layout/Header.astro`, `src/components/home/ContactHome.astro`, `src/pages/kontakt.astro`, `src/pages/fertigung.astro`, `src/components/product/NextSheet.astro` |
| Bewegung höchstens 5 s | `src/webgl/wheel-state.ts`, `src/webgl/stage.ts`, `src/modules/dial.ts`, `src/modules/not-found.ts`, `src/visuals/edm.ts`, `src/styles/base.css` (Filmkorn) |
| Reflow, Zielgrößen | `src/components/product/NextSheet.astro`, `src/components/layout/Footer.astro` |
| Impressum, Datenschutz | `src/data/site.ts` (`legal.hosting`, `legal.consumerDispute`), `src/pages/impressum.astro`, `src/pages/datenschutz.astro`, `src/components/layout/LegalPage.astro` |
| SEO | `src/layouts/BaseLayout.astro`, `src/data/products.ts` (`productJsonLd`), `src/pages/zentriboy.astro`, `src/pages/tensiometer.astro`, `public/og-image.jpg`, `public/apple-touch-icon.png`, `public/favicon-32.png` |
| Performance | `src/webgl/stage.ts` (Aufbau in Etappen, `compileAsync`, Software-Renderer, PMREM-Größe), `src/webgl/index.ts`, `src/animations/reveal.ts` |
| Sicherheit | `public/.htaccess`, `package-lock.json` |
| Doku | `README.md` (Checkliste vor dem Livegang), dieser Bericht |

## 5. Offene Punkte

Benötigen Angaben, Entscheidungen oder eine rechtliche Prüfung durch die Braun GmbH:

1. Registergericht und Registernummer, ggf. USt-IdNr. (`company.register`, `company.vatId`).
2. Hosting-Angaben für die Datenschutzerklärung (`legal.hosting`), danach rechtliche Prüfung und
   `legal.privacyReviewed = true`.
3. Widerrufsbelehrung mit Muster-Widerrufsformular, Zahlungsarten, Lieferzeit, Versand ins Ausland; Klärung der
   Widerrufsfunktion für Bestellungen per E-Mail.
4. VSBG-Hinweis, falls mehr als 10 Beschäftigte (`legal.consumerDispute`).
5. Einordnung unter das Barrierefreiheitsstärkungsgesetz; ggf. Erklärung zur Barrierefreiheit.
6. Nutzungsrechte: Fotos der alten Website bestätigen, Higgsfield-Bedingungen für die KI-Visualisierung prüfen.
7. Werbeaussagen der alten Website auf Belegbarkeit prüfen.
8. Video neu kodieren (ffmpeg, Befehl im README).

## 6. Durchgeführte Prüfungen

| Prüfung | Ergebnis |
|---|---|
| `astro check` | 0 Fehler, 0 Warnungen, 0 Hinweise (98 Dateien) |
| `astro build` | 9 Seiten |
| axe-core 4.10 (WCAG 2.0–2.2 A/AA, Best Practices) | 0 Verstöße auf allen 8 Inhaltsseiten: Desktop hell, Desktop dunkel, mobil 375 px; vorher wie nachher |
| Kontrast-Sonderfälle (Text über Bild/Canvas, SVG) | rechnerisch und geometrisch geprüft, zwei Fälle behoben |
| Tastatur | echte Tab-Folge im Browser über die Startseite, Fokus-Knopf sichtbar (176 × 44 px, Rahmen) |
| Namen von Links | Skript über alle Seiten: keine verschmolzenen Wörter mehr |
| Reflow | 320, 375, 1024, 1280, 1440, 1920, 2560 px: kein horizontaler Überlauf, kein abgeschnittener Text |
| Links | 569 interne Verweise, 0 defekt; JSON-LD aller Seiten gültig |
| Lighthouse (mobil, Labor, je 3 Läufe, gleicher lokaler Server) | vorher: Performance 65, TBT 1417 ms · nachher: Performance 78, TBT 532 ms, LCP und CLS unverändert |
| Lighthouse Live (vor dem Audit) | Accessibility 100, Best Practices 100, SEO 69 (allein wegen des beabsichtigten `noindex` der Vorschau) |
| Seite ohne 3D-Rad (/kontakt) | Performance 98, keine langen Aufgaben (vorher wie nachher) |

**Nicht geprüft bzw. Einschränkungen:** kein manueller Screenreader-Test; nur Chromium (In-App-Browser, headless
Chrome), nicht Safari und Firefox; keine echten Mobilgeräte; keine Felddaten (Core Web Vitals aus der Praxis). Die
PageSpeed-Insights-API war ausgeschöpft, deshalb Lighthouse lokal. Bewegungen (Zeitlimits) per Code-Prüfung
verifiziert, nicht per Bildschirmaufnahme.

## 7. Empfehlungen

1. Rechtliche Punkte aus Abschnitt 5 vor dem Livegang klären; erst dann `privacyReviewed` setzen.
2. Nach dem Umzug auf den Webspace: HTTPS-Umleitung und HSTS in `.htaccess` aktivieren, Content-Security-Policy mit
   Hashes ergänzen.
3. Einmal mit echtem Screenreader (NVDA oder VoiceOver) und in Safari/Firefox durchklicken.
4. Video neu kodieren; Bild-`sizes` an die tatsächlichen Anzeigegrößen anpassen.
