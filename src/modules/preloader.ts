/**
 * Preloader (erster Besuch pro Sitzung).
 * Die Nadel folgt echten Ladeaufgaben (Module, Schriften, Three.js), mindestens 1,3 s,
 * höchstens 5 s. Danach springt sie gedämpft auf Null, das Fadenkreuz spannt sich,
 * und vier Quadranten öffnen das Bild. Die Promise löst beim Öffnen auf, damit der
 * Hero-Einstieg mit dem Aufgehen überlappt.
 */
import { gsap, SCRAMBLE_CHARS } from '@/lib/gsap';

export async function runPreloader(tasks: Array<Promise<unknown>>): Promise<void> {
  const root = document.querySelector<HTMLElement>('.preloader');
  const html = document.documentElement;
  if (!root) return;

  const dial = root.querySelector<SVGSVGElement>('.dial');
  const dialWrap = root.querySelector<HTMLElement>('.preloader__dial');
  const num = root.querySelector<HTMLElement>('.preloader__num');
  const count = root.querySelector<HTMLElement>('.preloader__count');
  const quads = root.querySelectorAll<HTMLElement>('.preloader__quad');
  const lineH = root.querySelector<HTMLElement>('.preloader__line--h');
  const lineV = root.querySelector<HTMLElement>('.preloader__line--v');
  if (!dial || !dialWrap || !num || !count) return;

  const ticks = dial.querySelectorAll('.dial__tick');
  const labels = dial.querySelectorAll('.dial__numbers text, .dial__unit, .dial__sign, .dial__tol path');

  const setNeedle = (p: number) => {
    dial.style.setProperty('--angle', `${p * 324}deg`);
    dial.style.setProperty('--counter-angle', `${p * 300}deg`);
  };

  // Aufbau: Teilstriche laufen einmal im Kreis ein
  gsap.set(ticks, { opacity: 0 });
  gsap.set(labels, { opacity: 0 });
  gsap
    .timeline()
    .from(dialWrap, { scale: 0.86, opacity: 0, duration: 0.9, ease: 'zb.out' }, 0)
    .to(ticks, { opacity: 1, duration: 0.2, stagger: 0.006, ease: 'none' }, 0.1)
    .to(labels, { opacity: 1, duration: 0.5, stagger: 0.03 }, 0.5);

  // Fortschritt
  const progress = { v: 0 };
  let done = 0;
  const total = tasks.length + 1;
  const bump = () => {
    done += 1;
    gsap.to(progress, {
      v: done / total,
      duration: 0.7,
      ease: 'power2.out',
      overwrite: true,
      onUpdate: () => {
        setNeedle(progress.v);
        num.textContent = String(Math.round(progress.v * 100)).padStart(3, '0');
      },
    });
  };

  const minTime = new Promise<void>((r) => setTimeout(r, 1300)).then(bump);
  const guarded = tasks.map((t) => Promise.resolve(t).then(bump, bump));
  await Promise.race([Promise.all([...guarded, minTime]), new Promise((r) => setTimeout(r, 5000))]);

  await new Promise<void>((resolve) => {
    gsap.to(progress, {
      v: 1,
      duration: 0.4,
      ease: 'power2.out',
      overwrite: true,
      onUpdate: () => {
        setNeedle(progress.v);
        num.textContent = String(Math.round(progress.v * 100)).padStart(3, '0');
      },
      onComplete: resolve,
    });
  });

  // Nullstellen, Fadenkreuz spannen, Quadranten öffnen
  const out = gsap.timeline({
    onComplete: () => {
      root.remove();
      html.classList.remove('is-preloading');
      try {
        sessionStorage.setItem('zb-intro', '1');
      } catch {
        /* privater Modus: dann eben beim nächsten Mal wieder */
      }
    },
  });

  out
    .to(progress, { v: 0, duration: 1.15, ease: 'elastic.out(1, 0.42)', onUpdate: () => setNeedle(progress.v) }, 0)
    .to(num, { duration: 0.6, scrambleText: { text: '0,00 mm', chars: SCRAMBLE_CHARS, speed: 0.8 } }, 0.05)
    .to(lineH, { scaleX: 1, duration: 0.75, ease: 'zb.inOut' }, 0.35)
    .to(lineV, { scaleY: 1, duration: 0.75, ease: 'zb.inOut' }, 0.35)
    .to(dialWrap, { scale: 0.55, opacity: 0, duration: 0.55, ease: 'zb.in' }, 1.0)
    .to(count, { opacity: 0, duration: 0.3 }, 1.0)
    .addLabel('split', 1.2)
    .to(quads[0], { xPercent: -100, yPercent: -100, duration: 1.15, ease: 'zb.inOut' }, 'split')
    .to(quads[1], { xPercent: 100, yPercent: -100, duration: 1.15, ease: 'zb.inOut' }, 'split')
    .to(quads[2], { xPercent: -100, yPercent: 100, duration: 1.15, ease: 'zb.inOut' }, 'split')
    .to(quads[3], { xPercent: 100, yPercent: 100, duration: 1.15, ease: 'zb.inOut' }, 'split')
    .to([lineH, lineV], { opacity: 0, duration: 0.5 }, 'split+=0.45');

  await new Promise<void>((resolve) => out.call(resolve, [], 'split+=0.15'));
}
