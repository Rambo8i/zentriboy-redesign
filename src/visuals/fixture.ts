/** Vorrichtungen: Messpunkte setzen, Leitungen ziehen, Beschriftungen einblenden. */
import { gsap } from '@/lib/gsap';
import type { Visual } from './types';

export function createFixture(fig: HTMLElement): Visual {
  const notes = Array.from(fig.querySelectorAll<SVGGElement>('.f-note'));
  const img = fig.querySelector('img');
  const tl = gsap.timeline({ paused: true, defaults: { ease: 'none' } });

  if (img) tl.fromTo(img, { scale: 1.14 }, { scale: 1, duration: 1 }, 0);

  notes.forEach((note, i) => {
    const dot = note.querySelector<SVGCircleElement>('.f-dot')!;
    const leader = note.querySelector<SVGPathElement>('.f-leader')!;
    const label = note.querySelector<SVGTextElement>('.f-label')!;
    const len = leader.getTotalLength();
    const at = 0.12 + i * 0.16;
    tl.fromTo(dot, { scale: 0, svgOrigin: `${dot.cx.baseVal.value} ${dot.cy.baseVal.value}` }, { scale: 1, duration: 0.08, ease: 'back.out(3)' }, at)
      .fromTo(leader, { strokeDasharray: len, strokeDashoffset: len }, { strokeDashoffset: 0, duration: 0.1, ease: 'power2.inOut' }, at + 0.04)
      .fromTo(label, { opacity: 0 }, { opacity: 1, duration: 0.08 }, at + 0.1);
  });

  return { tl, rest: 1, destroy: () => tl.kill() };
}
