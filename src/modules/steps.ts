/**
 * Schritte mit Prinzipzeichnung (ZentriBoy, Tensiometer).
 * Desktop: Sektion gepinnt (220 %), Zeichnung scrubbt, aktiver Schritt nach Fortschritt.
 * Mobil: Zeichnung läuft mit dem Scroll durch die Liste. Reduziert: Endzustand.
 */
import { gsap, ScrollTrigger } from '@/lib/gsap';
import { MM_CONDITIONS } from '@/lib/motion';
import type { Visual } from '@/visuals/types';

async function loadVisual(svg: SVGSVGElement): Promise<Visual | null> {
  switch (svg.dataset.stepsVisual) {
    case 'zentriboy':
      return (await import('@/visuals/zentriboy')).createZentriboySchematic(svg);
    case 'tensiometer':
      return (await import('@/visuals/tensiometer')).createTensiometerSchematic(svg);
    default:
      return null;
  }
}

export default async function steps(el: HTMLElement) {
  const pin = el.querySelector<HTMLElement>('.steps__pin')!;
  const items = Array.from(el.querySelectorAll<HTMLElement>('.steps__item'));
  const nav = Array.from(el.querySelectorAll<HTMLElement>('.steps__nav li'));
  const list = el.querySelector<HTMLElement>('.steps__list')!;
  const svg = el.querySelector<SVGSVGElement>('[data-steps-visual]');
  const visual = svg ? await loadVisual(svg) : null;

  let active = 0;
  const setActive = (i: number) => {
    if (i === active) return;
    active = i;
    items.forEach((it, k) => it.classList.toggle('is-active', k === i));
    nav.forEach((it, k) => it.classList.toggle('is-active', k === i));
  };

  const mm = gsap.matchMedia();
  mm.add(MM_CONDITIONS, (ctx) => {
    const { desktop, mobile, reduce } = ctx.conditions ?? {};
    if (reduce) {
      visual?.tl.progress(visual.rest);
      return;
    }
    if (desktop) {
      ScrollTrigger.create({
        trigger: pin,
        start: 'top top',
        end: '+=220%',
        pin: true,
        scrub: 0.6,
        animation: visual?.tl,
        onUpdate: (self) => setActive(Math.min(items.length - 1, Math.floor(self.progress * items.length * 0.999))),
      });
    }
    if (mobile && visual) {
      ScrollTrigger.create({ trigger: list, start: 'top 75%', end: 'bottom 55%', scrub: 0.5, animation: visual.tl });
    }
    return () => setActive(0);
  });

  return () => {
    mm.revert();
    visual?.destroy();
  };
}
