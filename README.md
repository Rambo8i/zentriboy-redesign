# zentriboy.de – Braun GmbH

Redesign der Website der Braun GmbH (Werkzeugbau in Fridingen an der Donau) mit den eigenen Produkten
**ZentriBoy** und **Tensiometer**. Konzept, Art Direction und Architektur: siehe [KONZEPT.md](KONZEPT.md).

## Starten

```bash
npm install
npm run dev        # Entwicklung: http://localhost:4321
npm run build      # statischer Build nach dist/
npm run preview    # Build lokal ansehen
npm run check      # Typprüfung (astro check)
```

Node 22.12 oder neuer (Astro 7), empfohlen ist Node 24 laut `.nvmrc` (`nvm use`). Der Build ist vollständig
statisch (HTML, CSS, JS, Bilder) und läuft auf jedem Webspace.

## Deployment

- Inhalt von `dist/` hochladen.
- `public/.htaccess` (Apache) leitet die alten Adressen dauerhaft weiter (`/company.html`, `/product1.html`,
  `/zentriboy.html`, `/tensiometer.html`, `/impressum.htm`, `/related.html`, `/Imgp…_jpg_view.htm`) und setzt Cache-Header.
  Auf anderen Servern die Weiterleitungen entsprechend übernehmen.
- Sitemap: `sitemap-index.xml`, eingetragen in `robots.txt`.

## Inhalte pflegen

Alle Texte und Werte stehen an einer Stelle in `src/data/`:

| Datei | Inhalt |
|---|---|
| `site.ts` | Firma, Anschrift, Telefon/Fax/E-Mail, Navigation, Rechtliches, Betreff-Vorlagen der E-Mails |
| `products.ts` | ZentriBoy und Tensiometer: Texte, Preise, Versand, Bestell-E-Mail |
| `processes.ts` | Die fünf Verfahren (Kurz- und Langtext) |
| `works.ts` | Werkstattfotos mit Bildunterschrift und Alt-Text |
| `visuals.ts` | KI-Visualisierungen (Bild, Videoschleife, Alt-Text, Freigabe) und der Schalter `aiVisuals.enabled` |

Inhaltsquelle der Migration ist der Export der alten Website unter `docs/quelle/zentriboy_gesamt.md`.

**Fotos austauschen:** Dateien in `src/assets/works/` bzw. `src/assets/products/` ersetzen (gleicher Name) oder
in `works.ts` ergänzen. Astro erzeugt beim Build automatisch AVIF/WebP in passenden Größen. Die aktuellen Fotos
stammen von der bisherigen Website (2001, 640 × 480 px). Neue Aufnahmen ab etwa 1600 px Breite werten vor allem
die Werkstatt-Sektion und den Leuchttisch deutlich auf.

## Vor dem Livegang (bitte durch die Braun GmbH prüfen)

1. **Preise** in `products.ts` stammen vom alten Stand der Website (ZentriBoy 166,00 €, Tensiometer 145,67 €,
   Versand 7,90 €).
2. **Impressum:** Registergericht, Registernummer und ggf. USt-IdNr. fehlen im alten Impressum. In `site.ts` bei
   `register` und `vatId` eintragen, dann erscheinen sie automatisch.
3. **Datenschutz:** Die Erklärung ist ein Entwurf auf Basis dessen, was die Seite technisch tut (keine Cookies,
   kein Tracking, Schriften lokal, sessionStorage nur für die Startanimation). Rechtlich prüfen, Hosting-Anbieter
   ergänzen, dann `legal.privacyReviewed` in `site.ts` auf `true` setzen (der Entwurfshinweis verschwindet).
4. **Verfahrenstexte** in `processes.ts` sind neu formuliert und beschreiben die Verfahren allgemein. Bitte fachlich
   gegenlesen.
5. **Prinzipzeichnungen** von ZentriBoy und Tensiometer sind nach den Originalfotos gezeichnet und als
   „Prinzipdarstellung“ gekennzeichnet. Kurz auf Plausibilität prüfen.
6. **KI-Visualisierung ZentriBoy freigeben** (Bild und Video, siehe unten). Abweichungen vom echten Gerät: Die Klemme
   ist eckiger als das Original, der Messtaster zeigt nach unten statt auf die Felgenflanke. Passt das, in
   `visuals.ts` `approved: true` setzen; sonst `aiVisuals.enabled = false`, dann stehen wieder die Originalfotos.
7. **Video verkleinern (empfohlen):** Die Schleife kommt mit 4 MB aus dem Generator. Neu kodiert ohne Tonspur
   sind etwa 1 MB möglich, gleicher Dateiname, danach neu bauen:
   `ffmpeg -i zentriboy-im-einsatz.mp4 -an -c:v libx264 -crf 26 -preset slow -pix_fmt yuv420p -movflags +faststart out.mp4`

## KI-Assets (Higgsfield, Oktober 2026)

Erzeugt über den Higgsfield-Connector, Grundlage sind die Originalfotos der alten Website. Verbraucht: 8,8 von
10 Credits (Free-Plan). Viele Modelle verlangen dort einen Basic-Plan; nutzbar waren nur die unten genannten.

| Datei (`src/assets/…`) | Modell | Verwendung |
|---|---|---|
| `generated/zentriboy-visualisierung.jpg` (2752 × 1536) | Google Nano Banana (angefragt als Pro, ausgeführt als `nano_banana_2`), Referenzen: 3 Produktfotos | Tafel „Am Rad, nicht im Ständer.“ auf /zentriboy, ZentriBoy-Szene der Startseite |
| `generated/zentriboy-im-einsatz.mp4` (1280 × 720, 4 s) | Seedance 1.5, Start- und Endbild = Visualisierung | Videoschleife über der Tafel (nahtlos, da erstes = letztes Bild) |
| `works/imgp0455-2k.jpg` (2880 × 2160) | Bytedance-Upscaler | Mittelbild im Werkstatt-Zoom und in der Lightbox; Inhalt unverändert, nur schärfer |

- **Kennzeichnung:** Jede Visualisierung trägt sichtbar „KI-Visualisierung“ und den Hinweis, dass Details abweichen
  können (Transparenzpflicht nach Art. 50 KI-Verordnung, gilt ab August 2026). Die Originalfotos bleiben auf der
  ZentriBoy-Seite als Belege stehen.
- **Video:** lädt erst kurz vor Sichtkontakt, spielt nur, solange es sichtbar ist, lässt sich anhalten. Bei reduzierter
  Bewegung, im Datensparmodus und bei langsamer Verbindung bleibt es beim Standbild.
- **Tensiometer:** Für eine Visualisierung reichte das Restguthaben im Free-Plan nicht (günstige Modelle gesperrt).
  Mit Basic-Plan: gleiches Vorgehen wie beim ZentriBoy (Referenz `products/tensiometer.jpg`), Eintrag in
  `visuals.ts` ergänzen.
- **3D-Laufrad:** Die Spiegelungen stammen nicht aus einem generierten Bild, sondern aus einer nachgebauten Werkstatt
  (`src/webgl/workshop-env.ts`: Sprossenfenster links, Leuchtstoffröhren, Hallentor), abgestimmt auf das Licht der
  Visualisierung. Kein Download, keine Credits.

## Technik in Kürze

- **Astro 7** (statisch), **TypeScript** strict, kein UI-Framework: Seitenmodule sind Vanilla-TS und werden per
  `data-module` lazy geladen (`src/modules/registry.ts`).
- **GSAP 3.15** (ScrollTrigger, SplitText, ScrambleText, CustomEase, Draggable, Inertia) und **Lenis** für
  Smooth Scrolling, beide auf einem gemeinsamen Frame-Takt.
- **Three.js** nur für das Laufrad (persistente WebGL-Bühne, Seitenschlag im Vertex-Shader), nur auf Seiten mit Rad
  geladen. Physikalische Materialien (gebürstetes Aluminium, Gummi) auf leistungsstarken Geräten, Spiegelungen aus
  einer HDR-Werkstattszene. Die Prüflupe der Werkstatt-Seite ist ein eigener kleiner WebGL-Shader ohne Three.js.
- **View Transitions** über den Astro ClientRouter mit eigener GSAP-Blende. Die Navigation hängt nie an einer
  Animation (Zeitlimits).
- **Reduzierte Bewegung:** kein Preloader, kein Smooth Scrolling, kein Pinning, alle Inhalte gestapelt sichtbar.
  Zum Testen der vollen Choreografie in der Entwicklung: `?motion=full` an die URL hängen (`?motion=system` setzt
  zurück). Im Produktions-Build ist dieser Schalter entfernt.

## Struktur

```
src/
  pages/        Routen: /, /fertigung, /werkstatt, /zentriboy, /tensiometer, /kontakt, /impressum, /datenschutz, 404
  layouts/      BaseLayout (Head, SEO, JSON-LD, persistente Ebenen)
  components/   layout/ (Header, Menü, Schriftfeld, Preloader, Blende, Cursor), ui/, home/, product/, process/
  modules/      Seitenmodule (Hero, Horizontalfahrt, Messuhr, Speiche, Leuchttisch …)
  visuals/      Animationen der technischen Zeichnungen
  animations/   deklarative Reveals (data-reveal) und Parallaxe (data-parallax)
  lib/          Lebenszyklus, Smooth Scroll, Cursor, Magnet, Split, Observer, Transitions, Motion, Geometrie
  webgl/        Bühne, Laufrad, Shader, Prüflupe
  data/         Inhalte (inkl. visuals.ts für KI-Visualisierungen)
  styles/       Tokens, Basis, Typografie, Layout, Zeichnungen
  assets/       Fotos (werden beim Build optimiert), generated/ = KI-Visualisierungen
public/         Dateien ohne Verarbeitung (.htaccess, favicon, robots.txt)
docs/quelle/    Export der alten Website (Inhaltsquelle)
```

## Lizenz

Kein Open-Source-Projekt. Der Code ist öffentlich einsehbar, eine Weiterverwendung ist ohne ausdrückliche Erlaubnis
nicht gestattet (`"license": "UNLICENSED"`). Texte, Fotos, Produktnamen (ZentriBoy, Tensiometer) und Marke gehören
der Braun GmbH. Schriften und Icons stammen aus npm-Paketen mit eigenen Lizenzen (Archivo und IBM Plex Mono: SIL OFL,
Phosphor Icons: MIT).
