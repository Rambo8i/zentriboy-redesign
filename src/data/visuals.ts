/**
 * KI-Visualisierungen (Higgsfield, Oktober 2026), erzeugt auf Basis der Originalfotos.
 * Sie zeigen ein Produkt im Einsatz, sind aber keine Fotos: Details können abweichen
 * (beim ZentriBoy z. B. Form der Klemme und Richtung des Messtasters).
 *
 * Deshalb gilt:
 * - Jede Visualisierung trägt sichtbar `aiLabel` und `aiNote` (Transparenz nach Art. 50 KI-VO).
 * - Veröffentlicht wird erst nach Freigabe durch die Braun GmbH (`approved`, siehe README).
 * - `aiVisuals.enabled = false` blendet alle Visualisierungen aus; dann stehen wieder die Originalfotos.
 */
import type { ImageMetadata } from 'astro';
import zentriboyImage from '../assets/generated/zentriboy-visualisierung.jpg';
import zentriboyVideo from '../assets/generated/zentriboy-im-einsatz.mp4?url';

export const aiVisuals = { enabled: true };

export const aiLabel = 'KI-Visualisierung';
export const aiNote = 'Erzeugt auf Basis der Originalfotos. Details können vom Produkt abweichen.';

export type Visual = {
  image: ImageMetadata;
  /** Videoschleife, deren erstes und letztes Bild dem Standbild entspricht */
  video?: string;
  alt: string;
  /** Punkt, der beim Zuschneiden im Bild bleiben soll (Prozent von links/oben) */
  focus: { x: number; y: number };
  /** Freigabe durch die Braun GmbH erteilt */
  approved: boolean;
};

export const visuals = {
  zentriboy: {
    image: zentriboyImage,
    video: zentriboyVideo,
    alt: 'ZentriBoy an der Gabel eines Rennrads: Die schwarze Klemme sitzt unter der Bremse, die Messuhr am Gelenkarm sitzt dicht an der Felge, im Hintergrund eine Werkbank',
    focus: { x: 27, y: 40 },
    approved: false,
  },
} satisfies Record<string, Visual>;
