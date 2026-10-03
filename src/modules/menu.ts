/**
 * Mobiles Vollbild-Menü als modaler Dialog.
 * Öffnet sich kreisförmig aus dem Menü-Knopf (gleiche Sprache wie die Seitenblende),
 * Fokusfalle, Escape schließt, Fokus kehrt zum Auslöser zurück.
 */
import { gsap } from '@/lib/gsap';
import { startScroll, stopScroll } from '@/lib/smooth-scroll';
import { prefersReducedMotion } from '@/lib/motion';

export default function menu(el: HTMLElement) {
  const toggle = document.querySelector<HTMLButtonElement>('[aria-controls="menu"]');
  const closeBtn = el.querySelector<HTMLButtonElement>('[data-menu-close]');
  if (!toggle || !closeBtn) return;

  const labels = el.querySelectorAll<HTMLElement>('.menu__label');
  const meta = el.querySelector<HTMLElement>('.menu__meta');
  let open = false;
  let tl: gsap.core.Timeline | null = null;

  const focusables = () =>
    Array.from(el.querySelectorAll<HTMLElement>('a[href], button:not([disabled])')).filter((n) => n.offsetParent !== null);

  const origin = () => {
    const r = toggle.getBoundingClientRect();
    const x = r.left + r.width / 2;
    const y = r.top + r.height / 2;
    const radius = Math.hypot(Math.max(x, window.innerWidth - x), Math.max(y, window.innerHeight - y)) + 4;
    return { x, y, radius };
  };

  function show() {
    if (open) return;
    open = true;
    el.hidden = false;
    toggle!.setAttribute('aria-expanded', 'true');
    document.documentElement.classList.add('menu-open');
    stopScroll();
    tl?.kill();

    if (!prefersReducedMotion()) {
      const { x, y, radius } = origin();
      tl = gsap
        .timeline()
        .fromTo(
          el,
          { clipPath: `circle(0px at ${x}px ${y}px)` },
          { clipPath: `circle(${radius}px at ${x}px ${y}px)`, duration: 0.85, ease: 'zb.inOut' },
        )
        .from(labels, { yPercent: 115, duration: 1, stagger: 0.055, ease: 'zb.out' }, 0.3)
        .from(meta, { opacity: 0, y: 16, duration: 0.8 }, 0.55);
    }
    // Sofort fokussieren: Das Menü ist nach `hidden = false` schon fokussierbar (clip-path ändert daran nichts).
    el.querySelector<HTMLElement>('.menu__link')?.focus();
  }

  function hide(restoreFocus = true) {
    if (!open) return;
    open = false;
    toggle!.setAttribute('aria-expanded', 'false');
    document.documentElement.classList.remove('menu-open');
    tl?.kill();

    let finished = false;
    let fallback = 0;
    const done = () => {
      if (finished) return;
      finished = true;
      window.clearTimeout(fallback);
      tl?.kill();
      el.hidden = true;
      gsap.set(el, { clearProps: 'clipPath' });
      startScroll();
      if (restoreFocus) toggle!.focus();
    };

    if (prefersReducedMotion()) return done();
    // Schließen darf nie an der Animation hängen
    fallback = window.setTimeout(done, 900);
    const { x, y, radius } = origin();
    tl = gsap.timeline({ onComplete: done }).fromTo(
      el,
      { clipPath: `circle(${radius}px at ${x}px ${y}px)` },
      { clipPath: `circle(0px at ${x}px ${y}px)`, duration: 0.65, ease: 'zb.inOut' },
    );
  }

  const onToggle = () => (open ? hide() : show());
  const onClose = () => hide();

  const onKey = (e: KeyboardEvent) => {
    if (!open) return;
    if (e.key === 'Escape') {
      e.preventDefault();
      hide();
      return;
    }
    if (e.key !== 'Tab') return;
    const items = focusables();
    if (!items.length) return;
    const first = items[0];
    const last = items[items.length - 1];
    if (e.shiftKey && document.activeElement === first) {
      e.preventDefault();
      last.focus();
    } else if (!e.shiftKey && document.activeElement === last) {
      e.preventDefault();
      first.focus();
    }
  };

  const mq = window.matchMedia('(min-width: 1024px)');
  const onMq = () => mq.matches && hide(false);

  toggle.addEventListener('click', onToggle);
  closeBtn.addEventListener('click', onClose);
  document.addEventListener('keydown', onKey);
  mq.addEventListener('change', onMq);

  return () => {
    toggle.removeEventListener('click', onToggle);
    closeBtn.removeEventListener('click', onClose);
    document.removeEventListener('keydown', onKey);
    mq.removeEventListener('change', onMq);
    tl?.kill();
    if (open) document.documentElement.classList.remove('menu-open');
  };
}
