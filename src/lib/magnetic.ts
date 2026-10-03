/**
 * Magnetische Elemente: `data-magnetic="0.35"` (Stärke), optional ein inneres
 * `[data-magnetic-inner]`, das sich stärker bewegt (Tiefe). Rückkehr mit gedämpfter Feder.
 */
import { gsap } from './gsap';
import { isFinePointer, prefersReducedMotion } from './motion';
import type { Cleanup } from './lifecycle';

export function magnetize(root: ParentNode = document): Cleanup {
  if (!isFinePointer() || prefersReducedMotion()) return () => {};

  const els = Array.from(root.querySelectorAll<HTMLElement>('[data-magnetic]'));

  const cleanups = els.map((el) => {
    const strength = parseFloat(el.dataset.magnetic || '0.35') || 0.35;
    const inner = el.querySelector<HTMLElement>('[data-magnetic-inner]');
    const xTo = gsap.quickTo(el, 'x', { duration: 0.55, ease: 'power3.out' });
    const yTo = gsap.quickTo(el, 'y', { duration: 0.55, ease: 'power3.out' });
    const ixTo = inner ? gsap.quickTo(inner, 'x', { duration: 0.55, ease: 'power3.out' }) : null;
    const iyTo = inner ? gsap.quickTo(inner, 'y', { duration: 0.55, ease: 'power3.out' }) : null;
    let rect: DOMRect | null = null;

    const enter = () => {
      const x = Number(gsap.getProperty(el, 'x')) || 0;
      const y = Number(gsap.getProperty(el, 'y')) || 0;
      const r = el.getBoundingClientRect();
      rect = new DOMRect(r.left - x, r.top - y, r.width, r.height);
    };

    const move = (e: PointerEvent) => {
      if (!rect) enter();
      const r = rect!;
      const dx = e.clientX - (r.left + r.width / 2);
      const dy = e.clientY - (r.top + r.height / 2);
      xTo(dx * strength);
      yTo(dy * strength);
      ixTo?.(dx * strength * 0.55);
      iyTo?.(dy * strength * 0.55);
    };

    const leave = () => {
      rect = null;
      gsap.to(el, { x: 0, y: 0, duration: 1.1, ease: 'elastic.out(1, 0.38)', overwrite: true });
      if (inner) gsap.to(inner, { x: 0, y: 0, duration: 1.1, ease: 'elastic.out(1, 0.38)', overwrite: true });
    };

    el.addEventListener('pointerenter', enter);
    el.addEventListener('pointermove', move);
    el.addEventListener('pointerleave', leave);

    return () => {
      el.removeEventListener('pointerenter', enter);
      el.removeEventListener('pointermove', move);
      el.removeEventListener('pointerleave', leave);
      gsap.killTweensOf(inner ? [el, inner] : el);
      gsap.set(inner ? [el, inner] : el, { clearProps: 'transform' });
    };
  });

  return () => cleanups.forEach((c) => c());
}
