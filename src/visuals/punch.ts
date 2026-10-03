/** Werkzeugbau: Teile fügen sich zusammen, Stempel schneidet, Butzen fällt, Streifen rückt vor. */
import { gsap } from '@/lib/gsap';
import type { Visual } from './types';

export function createPunch(svg: SVGSVGElement): Visual {
  const q = <T extends Element>(s: string) => svg.querySelector<T>(s)!;
  const upper = q('.p-upper');
  const stripper = q('.p-stripper');
  const strip = q('.p-strip');
  const slug = q('.p-slug');
  const lower = q('.p-lower');
  const labels = q('.p-labels');
  const slugLabel = q('.p-slug-label');

  const tl = gsap.timeline({ paused: true, defaults: { ease: 'none' } });
  tl.from(lower, { y: 46, opacity: 0, duration: 0.14, ease: 'power2.out' }, 0)
    .from(upper, { y: -46, opacity: 0, duration: 0.14, ease: 'power2.out' }, 0.02)
    .from(stripper, { y: -28, opacity: 0, duration: 0.14, ease: 'power2.out' }, 0.04)
    .from([strip, slug], { x: 140, opacity: 0, duration: 0.14, ease: 'power2.out' }, 0.06)
    .from(labels, { opacity: 0, duration: 0.08 }, 0.14)
    // Hub: Stempel schneidet durch den Streifen
    .to(upper, { y: 30, duration: 0.16, ease: 'power2.in' }, 0.24)
    .to(slug, { y: 12, duration: 0.06, ease: 'power2.in' }, 0.34)
    // Butzen fällt durch den Durchbruch
    .to(slug, { y: 210, rotation: 26, svgOrigin: '300 268', opacity: 0, duration: 0.3, ease: 'power2.in' }, 0.42)
    .from(slugLabel, { opacity: 0, duration: 0.08 }, 0.5)
    .to(upper, { y: 0, duration: 0.16, ease: 'power2.out' }, 0.42)
    // Vorschub
    .to(strip, { x: -118, duration: 0.24, ease: 'power1.inOut' }, 0.7)
    .to(slugLabel, { opacity: 0, duration: 0.08 }, 0.9);

  return { tl, rest: 0.22, destroy: () => tl.kill() };
}
