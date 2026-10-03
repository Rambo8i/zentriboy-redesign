/** Durchstreichen per Scroll (scrub): Die rote Linie läuft über das Wort, wenn es die Mitte erreicht. */
import { gsap } from '@/lib/gsap';
import { MM_CONDITIONS } from '@/lib/motion';

export default function strike(el: HTMLElement) {
  const line = el.querySelector<HTMLElement>('.strike__line');
  const word = el.querySelector<HTMLElement>('.strike__word');
  if (!line || !word) return;

  const mm = gsap.matchMedia();
  mm.add(MM_CONDITIONS, (ctx) => {
    if (ctx.conditions?.reduce) {
      gsap.set(line, { scaleX: 1 });
      return;
    }
    gsap
      .timeline({ scrollTrigger: { trigger: word, start: 'top 72%', end: 'top 38%', scrub: 0.6 } })
      .fromTo(line, { scaleX: 0 }, { scaleX: 1, ease: 'power2.inOut', duration: 1 })
      .fromTo(word, { opacity: 1 }, { opacity: 0.55, ease: 'none', duration: 1 }, 0);
  });

  return () => mm.revert();
}
