/**
 * Smooth Scrolling mit Lenis, synchron mit GSAP ScrollTrigger.
 * - Lenis läuft auf dem GSAP-Ticker (ein Frame-Takt für alles).
 * - Touch bleibt nativ (syncTouch: false): keine Trägheitskonflikte auf Mobilgeräten.
 * - Bei prefers-reduced-motion wird Lenis gar nicht gestartet.
 */
import Lenis from 'lenis';
import { gsap, ScrollTrigger } from './gsap';
import { prefersReducedMotion } from './motion';

let lenis: Lenis | null = null;

export function initSmoothScroll(): Lenis | null {
  if (lenis || prefersReducedMotion()) return lenis;

  lenis = new Lenis({
    lerp: 0.1,
    smoothWheel: true,
    syncTouch: false,
    wheelMultiplier: 1,
    autoRaf: false,
    prevent: (node: HTMLElement) => Boolean(node.closest?.('[data-lenis-prevent]')),
  });

  lenis.on('scroll', ScrollTrigger.update);
  gsap.ticker.add((time) => lenis?.raf(time * 1000));
  gsap.ticker.lagSmoothing(0);

  return lenis;
}

export const getLenis = (): Lenis | null => lenis;

export function stopScroll(): void {
  if (lenis) lenis.stop();
  else document.documentElement.style.overflow = 'hidden';
}

export function startScroll(): void {
  if (lenis) lenis.start();
  document.documentElement.style.removeProperty('overflow');
}

export function scrollToTarget(target: number | HTMLElement, { immediate = false, offset = 0 } = {}): void {
  if (lenis) {
    lenis.scrollTo(target, { immediate, offset, force: true, duration: 1.4 });
    return;
  }
  const y = typeof target === 'number' ? target : target.getBoundingClientRect().top + window.scrollY + offset;
  window.scrollTo({ top: y, behavior: immediate || prefersReducedMotion() ? 'auto' : 'smooth' });
}

/** Nach einem Seitenwechsel: Lenis an die neue Seitenhöhe und Scrollposition angleichen. */
export function resyncScroll(): void {
  if (!lenis) return;
  lenis.resize();
  lenis.scrollTo(window.scrollY, { immediate: true, force: true });
}

/** Scrollgeschwindigkeit (px pro Frame, geglättet von Lenis). */
export const getScrollVelocity = (): number => lenis?.velocity ?? 0;
