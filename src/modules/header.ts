/**
 * Header: blendet beim Herunterscrollen aus, beim Hochscrollen ein.
 * Die Schriftfarbe folgt der Materialwelt unter dem Header (Zeichnung oder Werkstatt).
 * Sie wird per Hit-Test ermittelt und funktioniert so auch in der Horizontalfahrt.
 */
import { ScrollTrigger } from '@/lib/gsap';

const IGNORE = '.header, .menu, .cursor, .curtain, .preloader, .skip-link';

export default function header(el: HTMLElement) {
  let raf = 0;

  const sample = () => {
    raf = 0;
    const y = Math.max(8, el.offsetHeight / 2);
    const stack = document.elementsFromPoint(window.innerWidth / 2, y);
    const hit = stack.find((n) => !n.closest(IGNORE));
    const theme = hit?.closest('[data-theme]')?.getAttribute('data-theme') ?? document.body.dataset.theme ?? 'paper';
    if (el.dataset.on !== theme) el.dataset.on = theme;
  };

  const schedule = () => {
    if (!raf) raf = requestAnimationFrame(sample);
  };

  const st = ScrollTrigger.create({
    start: 0,
    end: 'max',
    onUpdate: (self) => {
      schedule();
      const y = self.scroll();
      if (y < 120 || self.direction === -1) el.classList.remove('is-hidden');
      else if (!el.contains(document.activeElement)) el.classList.add('is-hidden');
    },
  });

  const reveal = () => el.classList.remove('is-hidden');
  el.addEventListener('focusin', reveal);
  window.addEventListener('resize', schedule, { passive: true });
  document.addEventListener('zb:transition-reveal', schedule);
  schedule();
  // Zweite Probe, sobald Pinning und Layout stehen
  const late = window.setTimeout(schedule, 400);

  return () => {
    st.kill();
    cancelAnimationFrame(raf);
    window.clearTimeout(late);
    el.removeEventListener('focusin', reveal);
    window.removeEventListener('resize', schedule);
    document.removeEventListener('zb:transition-reveal', schedule);
  };
}
