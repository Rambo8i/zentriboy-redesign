/**
 * Ein gemeinsamer Frame-Takt für alles (GSAP-Ticker, auf dem auch Lenis läuft).
 * Kein zweiter requestAnimationFrame-Loop, keine Konkurrenz um Frames.
 */
import { gsap } from './gsap';
import type { Cleanup } from './lifecycle';

export type TickFn = (dt: number, time: number) => void;

/** `dt` in Sekunden, begrenzt auf 1/20 s (nach Tab-Wechsel keine Sprünge). */
export function onTick(fn: TickFn, prioritize = false): Cleanup {
  const cb = (time: number, deltaTime: number) => fn(Math.min(deltaTime / 1000, 0.05), time);
  gsap.ticker.add(cb, false, prioritize);
  return () => gsap.ticker.remove(cb);
}
