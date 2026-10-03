/**
 * Bewegungs- und Gerätepräferenzen. Eine Stelle für alle Media Queries,
 * damit CSS, gsap.matchMedia() und Laufzeitentscheidungen übereinstimmen.
 */

/**
 * Nur in der Entwicklung: `?motion=full` erzwingt volle Bewegung, auch wenn das System
 * „reduzierte Bewegung“ meldet (zum Testen der Choreografie). `?motion=system` setzt zurück.
 * Im Produktions-Build ist dieser Zweig entfernt.
 */
const forcedMotion = ((): boolean => {
  if (!import.meta.env.DEV || typeof window === 'undefined') return false;
  try {
    const param = new URLSearchParams(window.location.search).get('motion');
    if (param) sessionStorage.setItem('zb-motion', param);
    return sessionStorage.getItem('zb-motion') === 'full';
  } catch {
    return false;
  }
})();

const REDUCE = '(prefers-reduced-motion: reduce)';
const MOTION = '(prefers-reduced-motion: no-preference)';

export const MQ = {
  reduce: forcedMotion ? 'not all' : REDUCE,
  motion: forcedMotion ? 'all' : MOTION,
  desktop: '(min-width: 1024px)',
  mobile: '(max-width: 1023px)',
  fine: '(hover: hover) and (pointer: fine)',
} as const;

/** Bedingungen für gsap.matchMedia() */
export const MM_CONDITIONS = {
  desktop: forcedMotion ? MQ.desktop : `${MQ.desktop} and ${MOTION}`,
  mobile: forcedMotion ? MQ.mobile : `${MQ.mobile} and ${MOTION}`,
  reduce: MQ.reduce,
} as const;

const match = (q: string): boolean => typeof window !== 'undefined' && window.matchMedia(q).matches;

export const prefersReducedMotion = (): boolean => match(MQ.reduce);
export const isFinePointer = (): boolean => match(MQ.fine);
export const isDesktop = (): boolean => match(MQ.desktop);

export type Quality = 'high' | 'medium' | 'low';

/**
 * Grobe Leistungsstufe für WebGL und Partikel.
 * Keine Messung, nur Heuristik – bewusst vorsichtig auf Mobilgeräten.
 */
export function qualityTier(): Quality {
  if (typeof navigator === 'undefined') return 'medium';
  const cores = navigator.hardwareConcurrency || 4;
  const memory = (navigator as Navigator & { deviceMemory?: number }).deviceMemory ?? 4;
  const coarse = match('(pointer: coarse)');
  if (cores <= 2 || memory <= 2) return 'low';
  if (coarse || cores <= 4 || memory <= 4) return 'medium';
  return 'high';
}
