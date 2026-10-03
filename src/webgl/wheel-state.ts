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
      wheelState.angle += (wheelState.spin + Math.min(v * 0.05, 6)) * dt;
      wheelState.disturb *= Math.exp(-dt * 1.6);
    }
    wheelState.reading = readingAt(0);
  });
}
