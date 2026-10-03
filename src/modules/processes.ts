/**
 * Verfahren (Startseite).
 * Desktop: Sektion wird gepinnt, die Spur fährt horizontal (scrub). Jede Zeichnung ist über
 * containerAnimation an die Position ihres Blatts gekoppelt, Ebenen mit data-depth verschieben
 * sich gegeneinander (horizontale Parallaxe). Mobil: vertikal gestapelt, Zeichnungen per Scroll.
 * Reduzierte Bewegung: Zeichnungen stehen im Ruhezustand.
 */
import { gsap, ScrollTrigger } from '@/lib/gsap';
import { MM_CONDITIONS } from '@/lib/motion';
import { createVisual, type Visual } from '@/visuals';

export default async function processes(el: HTMLElement) {
  const pin = el.querySelector<HTMLElement>('.procs__pin')!;
  const track = el.querySelector<HTMLElement>('.procs__track')!;
  const panels = Array.from(el.querySelectorAll<HTMLElement>('.panel'));
  const meterFill = el.querySelector<HTMLElement>('.procs__meter-fill');
  const meterLabel = el.querySelector<HTMLElement>('.procs__meter-label');

  const visuals: Array<Visual | null> = await Promise.all(
    panels.map((p) => {
      const v = p.querySelector<HTMLElement>('[data-visual]');
      return v ? createVisual(v) : Promise.resolve(null);
    }),
  );

  const mm = gsap.matchMedia();

  mm.add(MM_CONDITIONS, (ctx) => {
    const { desktop, mobile, reduce } = ctx.conditions ?? {};

    if (reduce) {
      visuals.forEach((v) => v?.tl.progress(v.rest));
      return;
    }

    if (desktop) {
      const distance = () => track.scrollWidth - window.innerWidth;
      let current = -1;

      const move = gsap.to(track, {
        x: () => -distance(),
        ease: 'none',
        scrollTrigger: {
          trigger: pin,
          start: 'top top',
          end: () => `+=${distance()}`,
          pin: true,
          scrub: 0.8,
          invalidateOnRefresh: true,
          anticipatePin: 1,
          onUpdate: (self) => {
            if (meterFill) meterFill.style.transform = `scaleX(${self.progress.toFixed(4)})`;
            const i = Math.min(panels.length - 1, Math.round(self.progress * (panels.length - 1)));
            if (i !== current && meterLabel) {
              current = i;
              meterLabel.textContent = panels[i].dataset.panelLabel ?? '';
            }
          },
        },
      });

      panels.forEach((panel, i) => {
        const v = visuals[i];
        if (v) {
          ScrollTrigger.create({
            trigger: panel,
            containerAnimation: move,
            start: 'left 80%',
            end: 'right 35%',
            scrub: true,
            animation: v.tl,
            onToggle: (self) => v.setActive?.(self.isActive),
          });
        }

        panel.querySelectorAll<HTMLElement>('[data-depth]').forEach((layer) => {
          const depth = parseFloat(layer.dataset.depth ?? '0');
          gsap.fromTo(
            layer,
            { x: () => depth * window.innerWidth * 0.5 },
            {
              x: () => -depth * window.innerWidth * 0.5,
              ease: 'none',
              scrollTrigger: {
                trigger: panel,
                containerAnimation: move,
                start: 'left right',
                end: 'right left',
                scrub: true,
                invalidateOnRefresh: true,
              },
            },
          );
        });
      });
    }

    if (mobile) {
      panels.forEach((panel, i) => {
        const v = visuals[i];
        const target = panel.querySelector<HTMLElement>('[data-visual]');
        if (!v || !target) return;
        ScrollTrigger.create({
          trigger: target,
          start: 'top 85%',
          end: 'bottom 35%',
          scrub: 0.5,
          animation: v.tl,
          onToggle: (self) => v.setActive?.(self.isActive),
        });
      });
    }
  });

  return () => {
    mm.revert();
    visuals.forEach((v) => v?.destroy());
  };
}
