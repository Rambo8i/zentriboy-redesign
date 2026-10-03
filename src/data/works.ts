/**
 * Werkstattfotos – die 15 Originalaufnahmen der alten Galerie (product1.html, 2001, 640 × 480).
 * Reihenfolge wie auf der alten Seite. `id` entspricht dem Originaldateinamen (Imgp0209.jpg …).
 * `hires`: KI-Hochskalierung des Originals (Bytedance-Upscaler über Higgsfield, 2880 × 2160)
 * für Darstellungen, die größer als 640 px werden. Inhalt unverändert, nur schärfer.
 */
import type { ImageMetadata } from 'astro';

import imgp0209 from '../assets/works/imgp0209.jpg';
import imgp0222 from '../assets/works/imgp0222.jpg';
import imgp0086 from '../assets/works/imgp0086.jpg';
import imgp0224 from '../assets/works/imgp0224.jpg';
import imgp0226 from '../assets/works/imgp0226.jpg';
import imgp0289 from '../assets/works/imgp0289.jpg';
import imgp0291 from '../assets/works/imgp0291.jpg';
import imgp0296 from '../assets/works/imgp0296.jpg';
import imgp0298 from '../assets/works/imgp0298.jpg';
import imgp0318 from '../assets/works/imgp0318.jpg';
import imgp0326 from '../assets/works/imgp0326.jpg';
import imgp0333 from '../assets/works/imgp0333.jpg';
import imgp0336 from '../assets/works/imgp0336.jpg';
import imgp0428 from '../assets/works/imgp0428.jpg';
import imgp0455 from '../assets/works/imgp0455.jpg';
import imgp0455hires from '../assets/works/imgp0455-2k.jpg';

export type Work = {
  id: string;
  image: ImageMetadata;
  hires?: ImageMetadata;
  alt: string;
  caption: string;
};

export const works: Work[] = [
  { id: '0209', image: imgp0209, caption: 'Sternteile, fertig bearbeitet', alt: 'Zwei gefräste sternförmige Aluminiumteile auf Packpapier' },
  { id: '0222', image: imgp0222, caption: 'Sternteil, Detail', alt: 'Gefrästes Aluminiumteil mit sechs abgewinkelten Laschen und zentraler Bohrung' },
  { id: '0086', image: imgp0086, caption: 'Sternteil auf dem Maschinentisch', alt: 'Sternförmiges Aluminium-Frästeil, aufgespannt auf dem Maschinentisch zwischen Spänen' },
  { id: '0224', image: imgp0224, caption: 'Kasten, aus dem Vollen gefräst', alt: 'Aus dem Vollen gefräster Aluminiumkasten mit gerundeten Innenecken' },
  { id: '0226', image: imgp0226, caption: 'U-Profil aus Aluminium', alt: 'U-förmiges Aluminiumteil mit seitlichen Bohrungen' },
  { id: '0289', image: imgp0289, caption: 'Fräsen mit Kühlschmierstoff', alt: 'Fräser im Eingriff, Kühlschmierstoff spritzt über das Werkstück' },
  { id: '0291', image: imgp0291, caption: 'Block mit Bohrbild', alt: 'Quaderförmiger Metallblock mit großer Bohrung und vier Eckbohrungen' },
  { id: '0296', image: imgp0296, caption: 'Werkstück in der Spannung', alt: 'Werkstück in einer Spannvorrichtung auf dem Maschinentisch, benetzt mit Kühlschmierstoff' },
  { id: '0298', image: imgp0298, caption: 'Frästeil in der Vorrichtung', alt: 'Gebogenes Aluminiumteil in einer Vorrichtung, daneben Aluminiumspäne' },
  { id: '0318', image: imgp0318, caption: 'Vorrichtung mit Werkstück', alt: 'Vorrichtung mit eingelegtem Werkstück, im Vordergrund ein Kühlmittelschlauch' },
  { id: '0326', image: imgp0326, caption: 'Rundteil in der Aufnahme', alt: 'Rundes Werkstück in einer Aufnahme auf einer Grundplatte' },
  { id: '0333', image: imgp0333, caption: 'Antriebe mit Anbauteilen', alt: 'Blaue Elektromotoren mit angebauten Wellen und Aufnahmen, dicht nebeneinander aufgereiht' },
  { id: '0336', image: imgp0336, caption: 'Rundteil an der Spindel', alt: 'Zylindrisches Stahlteil mit Bohrbild an einer vertikalen Spindel über dem Maschinentisch' },
  { id: '0428', image: imgp0428, caption: 'Sternteil in der Vorrichtung', alt: 'Sternförmiges Werkstück auf einer Aufnahmeplatte, gespannt mit Spanneisen und Stufenblöcken' },
  { id: '0455', image: imgp0455, hires: imgp0455hires, caption: 'Sternkontur, gefräst', alt: 'Gefrästes sternförmiges Aluminiumteil in einer Vorrichtung auf dem Maschinentisch, links und rechts mit Spanneisen gehalten, benetzt mit Kühlschmierstoff' },
];

export const workById = (id: string): Work => {
  const work = works.find((w) => w.id === id);
  if (!work) throw new Error(`Unbekanntes Werkstattfoto: ${id}`);
  return work;
};
