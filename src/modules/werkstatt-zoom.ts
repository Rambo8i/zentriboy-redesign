/**
 * Zoom-Parallaxe (Desktop): Sektion gepinnt, Mittelbild wächst von 26 vw auf ~68 vw,
 * die übrigen Fotos fliegen je nach Tiefe schneller nach außen und werden größer.
 * Am Ende bekommt das Mittelbild seine Farbe.
 */
import { gsap } from '@/lib/gsap';
import { MM_CONDITIONS } from '@/lib/motion';

export default function werkstattZoom(el: HTMLElement) {
  const stage = el.querySelector<HTMLElement>('.wz__stage')!;
  const center = el.querySelector<HTMLElement>('.wz__center')!;
  const items = Array.from(el.querySelectorAll<HTMLElement>('.wz__item'));
  const copy = el.querySelector<HTMLElement>('.wz__copy');

  const mm = gsap.matchMedia();
  mm.add(MM_CONDITIONS, (ctx) => {
    if (!ctx.conditions?.desktop) return;

    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: stage,
        start: 'top top',
        end: '+=140%',
        pin: true,
        scrub: 0.9,
        invalidateOnRefresh: true,
        onUpdate: (self) => center.classList.toggle('is-color', self.progress > 0.82),
      },
    });

    // Das Mittelbild wächst und weicht nach rechts aus, damit Überschrift und Link frei stehen.
    tl.fromTo(
      center,
      { scale: 1, x: 0 },
      {
        // 2,6-fach, aber nie höher als 86 % des Bildschirms (flache Fenster)
        scale: () => Math.min(2.6, (window.innerHeight * 0.86) / (center.offsetHeight || 1)),
        x: () => window.innerWidth * 0.15,
        ease: 'power2.inOut',
        duration: 1,
      },
      0,
    );
    items.forEach((item) => {
      const depth = parseFloat(item.dataset.depth ?? '1');
      tl.fromTo(
        item,
        { scale: 1, xPercent: 0, yPercent: 0, opacity: 1 },
        {
          scale: 1 + depth * 1.1,
          xPercent: () => {
            const x = parseFloat(getComputedStyle(item).getPropertyValue('--x')) || 0;
            return Math.sign(x || 1) * 120 * depth;
          },
          yPercent: () => {
            const y = parseFloat(getComputedStyle(item).getPropertyValue('--y')) || 0;
            return Math.sign(y || 1) * 90 * depth;
          },
          opacity: 0,
          ease: 'power2.in',
          duration: 1,
        },
        0,
      );
    });
    if (copy) tl.fromTo(copy, { y: 40 }, { y: 0, ease: 'none', duration: 1 }, 0);
  });

  return () => mm.revert();
}
