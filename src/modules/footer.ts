/** Schriftfeld: „Nach oben“ scrollt weich zum Seitenanfang und setzt den Fokus dorthin. */
import { scrollToTarget } from '@/lib/smooth-scroll';

export default function footer(el: HTMLElement) {
  const btn = el.querySelector<HTMLButtonElement>('[data-to-top]');
  if (!btn) return;

  const onClick = () => {
    scrollToTarget(0);
    document.getElementById('main')?.focus({ preventScroll: true });
  };

  btn.addEventListener('click', onClick);
  return () => btn.removeEventListener('click', onClick);
}
