/**
 * Fertigungsseite: Jede Verfahrenszeichnung läuft mit dem vertikalen Scroll ihres Blatts.
 * Canvas-Partikel (Erodieren) nur, solange das Blatt aktiv ist. Reduziert: Ruhezustand.
 */
import { gsap, ScrollTrigger } from '@/lib/gsap';
import { MM_CONDITIONS } from '@/lib/motion';
import { createVisual, type Visual } from '@/visuals';

export default async function fertigung(el: HTMLElement) {
  const targets = Array.from(el.querySelectorAll<HTMLElement>('[data-visual]'));
  const visuals = (await Promise.all(targets.map((t) => createVisual(t)))).map((v, i) => ({ v, el: targets[i] }));

  const mm = gsap.matchMedia();
  mm.add(MM_CONDITIONS, (ctx) => {
    if (ctx.conditions?.reduce) {
      visuals.forEach(({ v }) => v?.tl.progress(v.rest));
      return;
    }
    visuals.forEach(({ v, el: target }) => {
      if (!v) return;
      ScrollTrigger.create({
        trigger: target,
        start: 'top 82%',
        end: 'bottom 38%',
        scrub: 0.6,
        animation: v.tl,
        onToggle: (self) => v.setActive?.(self.isActive),
      });
    });
  });

  return () => {
    mm.revert();
    visuals.forEach(({ v }: { v: Visual | null }) => v?.destroy());
  };
}
