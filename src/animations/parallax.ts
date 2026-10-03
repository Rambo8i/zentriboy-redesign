/**
 * Mehrschichtige Parallaxe: `data-parallax="0.2"` (positiv = langsamer, negativ = schneller
 * als der Scroll). Bezugsrahmen ist das nächste `[data-parallax-root]` oder das Element selbst.
 * Nur Desktop mit erlaubter Bewegung. Mobil liegen die Ebenen ruhig.
 */
import { gsap } from '@/lib/gsap';
import { MQ } from '@/lib/motion';
import type { Cleanup } from '@/lib/lifecycle';

export function initParallax(root: ParentNode = document): Cleanup {
  const els = Array.from(root.querySelectorAll<HTMLElement>('[data-parallax]'));
  if (!els.length) return () => {};

  const mm = gsap.matchMedia();
  mm.add(`${MQ.desktop} and ${MQ.motion}`, () => {
    for (const el of els) {
      const speed = parseFloat(el.dataset.parallax || '0.15');
      const frame = el.closest<HTMLElement>('[data-parallax-root]') ?? el;
      gsap.fromTo(
        el,
        { y: () => speed * window.innerHeight * 0.5 },
        {
          y: () => -speed * window.innerHeight * 0.5,
          ease: 'none',
          scrollTrigger: {
            trigger: frame,
            start: 'top bottom',
            end: 'bottom top',
            scrub: true,
            invalidateOnRefresh: true,
          },
        },
      );
    }
  });

  return () => mm.revert();
}
