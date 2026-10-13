/**
 * Gemeinsamer Zustand des Laufrads.
 * Seitenmodule (Hero, ZentriBoy) schreiben `runout`, die WebGL-Bühne und die Messuhr lesen.
 * Die Drehung wird hier integriert. So bleibt alles synchron, auch wenn WebGL fehlt.
 */
import { gsap } from '@/lib/gsap';
import { runoutProfile } from '@/lib/math';
import { getScrollVelocity } from '@/lib/smooth-scroll';
import { prefersReducedMotion } from '@/lib/motion';

/** Winkel, unter dem die Messuhr die Felge abtastet (im nicht drehenden Rahmen). */
export const PROBE_ANGLE = 0.32;

export const wheelState = {
  /** 1 = aus der Spur, 0 = zentriert */
  runout: 1,
  /** kurzzeitige Störung durch schnelle Mausbewegung (klingt ab) */
  disturb: 0,
  /** Grunddrehzahl in rad/s */
  spin: 0.55,
  /** aktueller Drehwinkel */
  angle: 0,
  /** Messwert an der Messuhr, normiert (etwa -1 … +1) */
  reading: 0,
  /** Bildschirmposition des Messpunkts (von der Bühne geschrieben) */
  probe: { x: 0, y: 0, visible: false },
};

/** Effektive Amplitude (0 … ~1.25) */
export const effectiveRunout = (): number => Math.min(1.3, wheelState.runout + wheelState.disturb);

/** Profilwert an einem Winkel relativ zum Messpunkt – für die Buchstabenwelle. */
export const readingAt = (offset: number): number =>
  effectiveRunout() * runoutProfile(PROBE_ANGLE + wheelState.angle + offset);

let running = false;

/*
 * WCAG 2.2.2: Was sich von selbst bewegt, darf höchstens 5 s laufen, sonst braucht es eine Pause.
 * Die Grunddrehung läuft deshalb nach dem Laden, nach einem Seitenwechsel oder nach dem letzten
 * Scrollen noch 3,5 s und klingt bis 5 s aus. Scrollen dreht das Rad weiterhin direkt.
 */
const IDLE_FADE_START = 3.5;
const IDLE_FADE_END = 5;
let idle = 0;

/** Grunddrehung erneut für ein paar Sekunden anstoßen (z. B. beim Seitenwechsel). */
export function wakeWheel(): void {
  idle = 0;
}

/** Startet die Drehung einmalig (idempotent). */
export function ensureWheelClock(): void {
  if (running) return;
  running = true;
  const still = prefersReducedMotion();
  if (still) wheelState.runout = 0;

  gsap.ticker.add((_time, deltaMs) => {
    const dt = Math.min(deltaMs / 1000, 0.05);
    if (!still) {
      const v = Math.abs(getScrollVelocity());
      idle = v > 0.5 ? 0 : idle + dt;
      const t = Math.min(1, Math.max(0, (idle - IDLE_FADE_START) / (IDLE_FADE_END - IDLE_FADE_START)));
      const base = wheelState.spin * (1 - t * t * (3 - 2 * t));
      wheelState.angle += (base + Math.min(v * 0.05, 6)) * dt;
      wheelState.disturb *= Math.exp(-dt * 1.6);
    }
    wheelState.reading = readingAt(0);
  });
}
