/**
 * Eine Verfahrens-Zeichnung liefert eine pausierte Timeline (0 … 1), die von außen gesteuert wird:
 * Horizontalfahrt (Startseite, Desktop), vertikaler Scroll (Mobil, Fertigungsseite) oder
 * fester Zustand (reduzierte Bewegung). Laufende Canvas-Loops starten über setActive.
 */
export type Visual = {
  tl: gsap.core.Timeline;
  /** Zustand für reduzierte Bewegung (Anteil 0 … 1 der Timeline) */
  rest: number;
  setActive?: (active: boolean) => void;
  destroy: () => void;
};
