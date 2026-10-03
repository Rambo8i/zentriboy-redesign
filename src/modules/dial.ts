/**
 * ZentriBoy-Messuhr (Startseite, Produktseite).
 * Die waagerechte Mausposition ist die Felge: Mitte = zentriert. Die Nadel folgt als gedämpfte
 * Feder, der Umdrehungszähler läuft mit. Ohne Eingabe „atmet“ die Nadel leicht wie ein echtes
 * Messgerät. Touch: über die Uhr ziehen. Läuft nur, solange sichtbar.
 */
import { SCRAMBLE_CHARS, gsap } from '@/lib/gsap';
import { Spring } from '@/lib/spring';
import { onTick } from '@/lib/ticker';
import { inView } from '@/lib/observe';
import { clamp } from '@/lib/math';
import { prefersReducedMotion } from '@/lib/motion';
import type { Cleanup } from '@/lib/lifecycle';

const MM_FULL = 0.5;

const formatMm = (mm: number) =>
  Math.abs(mm) < 0.005 ? '±0,00 mm' : `${mm > 0 ? '+' : '−'}${Math.abs(mm).toFixed(2).replace('.', ',')} mm`;

export default function dial(el: HTMLElement) {
  const target = el.querySelector<HTMLElement>('[data-dial-target]');
  const svg = target?.querySelector<SVGSVGElement>('.dial');
  const value = el.querySelector<HTMLElement>('[data-dial-value]');
  const status = el.querySelector<HTMLElement>('[data-dial-status]');
  if (!target || !svg) return;

  const reduce = prefersReducedMotion();
  const needle = reduce ? new Spring(300, 40) : new Spring(150, 8.5);
  let deviation = 0;
  let interacting = false;
  let dragging = false;
  let elapsed = 0;
  let lastText = 0;
  let trued: boolean | null = null;
  let stopTick: Cleanup | null = null;

  const setStatus = (t: boolean) => {
    if (!status || t === trued) return;
    trued = t;
    status.classList.toggle('is-true', t);
    const text = t ? 'Zentriert' : 'Abweichung';
    if (reduce) status.textContent = text;
    else gsap.to(status, { duration: 0.5, scrambleText: { text, chars: SCRAMBLE_CHARS, speed: 1 }, overwrite: true });
  };

  const fromPointer = (e: PointerEvent) => {
    const r = el.getBoundingClientRect();
    deviation = clamp((e.clientX - (r.left + r.width / 2)) / (r.width * 0.42), -1.15, 1.15);
  };

  const onMove = (e: PointerEvent) => {
    if (e.pointerType === 'mouse' || dragging) {
      interacting = true;
      fromPointer(e);
    }
  };
  const onLeave = () => {
    if (dragging) return;
    interacting = false;
    deviation = 0;
  };
  const onDown = (e: PointerEvent) => {
    if (e.pointerType === 'mouse') return;
    dragging = true;
    interacting = true;
    target.setPointerCapture?.(e.pointerId);
    fromPointer(e);
  };
  const onUp = () => {
    if (!dragging) return;
    dragging = false;
    interacting = false;
    deviation = 0;
  };

  const tick = (dt: number, time: number) => {
    elapsed += dt;
    if (!interacting && !reduce) {
      // leichtes „Atmen“ eines aufgesetzten Messtasters
      deviation = 0.09 * Math.sin(elapsed * 0.9) * Math.sin(elapsed * 0.37 + 1.2);
    }
    needle.target = deviation;
    needle.step(dt);
    const v = needle.value;
    svg.style.setProperty('--angle', `${(v * 150).toFixed(2)}deg`);
    svg.style.setProperty('--counter-angle', `${(v * 36).toFixed(2)}deg`);

    if (value && time - lastText > 0.08) {
      lastText = time;
      value.textContent = formatMm(v * MM_FULL);
    }
    setStatus(Math.abs(v) < 0.04);
  };

  const stopView = inView(
    el,
    (visible) => {
      if (visible && !stopTick) stopTick = onTick(tick);
      else if (!visible && stopTick) {
        stopTick();
        stopTick = null;
      }
    },
    { rootMargin: '10% 0px' },
  );

  el.addEventListener('pointermove', onMove, { passive: true });
  el.addEventListener('pointerleave', onLeave);
  target.addEventListener('pointerdown', onDown);
  window.addEventListener('pointerup', onUp);
  window.addEventListener('pointercancel', onUp);

  return () => {
    stopView();
    stopTick?.();
    el.removeEventListener('pointermove', onMove);
    el.removeEventListener('pointerleave', onLeave);
    target.removeEventListener('pointerdown', onDown);
    window.removeEventListener('pointerup', onUp);
    window.removeEventListener('pointercancel', onUp);
    if (status) gsap.killTweensOf(status);
  };
}
