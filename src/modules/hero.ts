/**
 * Hero „ZENTRIERT“.
 * - Buchstaben laufen im selben Seitenschlag wie die Felge (runoutProfile, gleiche Phase).
 * - Scrollen zentriert das Rad: wheelState.runout 1 → 0 (scrub, umkehrbar).
 * - Messuhr mit Federnadel und Messwert. Eine gestrichelte Leitung führt zum Messpunkt an der Felge.
 * - Schnelle Mausbewegungen stören den Rundlauf kurz (klingt ab).
 */
import { gsap, SCRAMBLE_CHARS } from '@/lib/gsap';
import { onIntro } from '@/lib/lifecycle';
import { onTick } from '@/lib/ticker';
import { inView } from '@/lib/observe';
import { Spring } from '@/lib/spring';
import { TAU } from '@/lib/math';
import { MM_CONDITIONS, isDesktop, isFinePointer, prefersReducedMotion } from '@/lib/motion';
import { wheelState, ensureWheelClock, readingAt, effectiveRunout } from '@/webgl/wheel-state';

/** Anzeige in mm bei voller Unwucht – Teil der Illustration, kein Produktwert. */
const MM_MAX = 0.46;

const formatMm = (mm: number) =>
  Math.abs(mm) < 0.005 ? '±0,00 mm' : `${mm > 0 ? '+' : '−'}${Math.abs(mm).toFixed(2).replace('.', ',')} mm`;

export default function hero(el: HTMLElement) {
  const front = el.querySelector<HTMLElement>('.hero__front')!;
  const fill = Array.from(el.querySelectorAll<HTMLElement>('.hero__word--fill .hero__char-in'));
  const line = Array.from(el.querySelectorAll<HTMLElement>('.hero__word--line .hero__char-in'));
  const masks = el.querySelectorAll<HTMLElement>('.hero__char');
  const rises = el.querySelectorAll<HTMLElement>('.hero__char-rise');
  const word = el.querySelector<HTMLElement>('.hero__word--fill');
  const anchor = el.querySelector<HTMLElement>('.hero__anchor')!;
  const gaugeWrap = el.querySelector<HTMLElement>('.hero__gauge')!;
  const dialBox = el.querySelector<HTMLElement>('.hero__dial')!;
  const dial = dialBox.querySelector<SVGSVGElement>('.dial')!;
  const value = el.querySelector<HTMLElement>('[data-readout]')!;
  const status = el.querySelector<HTMLElement>('[data-status]')!;
  const probeSvg = el.querySelector<SVGSVGElement>('.hero__probe')!;
  const probeLine = probeSvg.querySelector('line')!;
  const probeDot = probeSvg.querySelector('circle')!;
  const reduce = prefersReducedMotion();

  ensureWheelClock();
  wheelState.runout = reduce ? 0 : 1;
  wheelState.disturb = 0;

  // Amplitude der Buchstabenwelle relativ zur Schriftgröße
  let amp = 0;
  let desktop = isDesktop();
  const gaugeOffset = { x: 0, y: 0 };
  const measure = () => {
    desktop = isDesktop();
    amp = (word?.getBoundingClientRect().height ?? 0) * (desktop ? 0.17 : 0.12);
    const fr = front.getBoundingClientRect();
    const dr = dialBox.getBoundingClientRect();
    gaugeOffset.x = dr.left + dr.width / 2 - fr.left;
    gaugeOffset.y = dr.top - fr.top;
  };
  measure();
  window.addEventListener('resize', measure, { passive: true });

  // Status mit Scramble, wenn er wechselt
  let trued: boolean | null = null;
  const setStatus = (t: boolean) => {
    if (t === trued) return;
    trued = t;
    status.classList.toggle('is-true', t);
    const text = t ? 'Zentriert' : 'Nicht zentriert';
    if (reduce) status.textContent = text;
    else gsap.to(status, { duration: 0.6, scrambleText: { text, chars: SCRAMBLE_CHARS, speed: 0.9 }, overwrite: true });
  };

  const needle = new Spring(110, 12, 0);
  let lastText = -1;
  const n = fill.length;
  // Anfangszustand sofort setzen (bei reduzierter Bewegung ist das Rad von Beginn an zentriert)
  setStatus(effectiveRunout() < 0.035);

  const tick = (dt: number, time: number) => {
    for (let i = 0; i < n; i++) {
      const y = -readingAt((i / n) * TAU) * amp;
      const t = `translate3d(0,${y.toFixed(2)}px,0)`;
      fill[i].style.transform = t;
      line[i].style.transform = t;
    }

    needle.target = wheelState.reading;
    needle.step(dt);
    dial.style.setProperty('--angle', `${(needle.value * 118).toFixed(2)}deg`);

    if (time - lastText > 0.09) {
      lastText = time;
      value.textContent = formatMm(wheelState.reading * MM_MAX);
    }
    setStatus(effectiveRunout() < 0.035);

    // Leitung von der Messuhr zum Messpunkt an der Felge
    const p = wheelState.probe;
    if (p.visible && desktop) {
      const fr = front.getBoundingClientRect();
      const x2 = p.x - fr.left;
      const y2 = p.y - fr.top;
      probeLine.setAttribute('x1', gaugeOffset.x.toFixed(1));
      probeLine.setAttribute('y1', gaugeOffset.y.toFixed(1));
      probeLine.setAttribute('x2', x2.toFixed(1));
      probeLine.setAttribute('y2', y2.toFixed(1));
      probeDot.setAttribute('cx', x2.toFixed(1));
      probeDot.setAttribute('cy', y2.toFixed(1));
      probeSvg.classList.add('is-on');
    } else {
      probeSvg.classList.remove('is-on');
    }
  };

  // Der Frame-Loop läuft nur, solange der Hero im Bild ist.
  let stopLoop: (() => void) | null = null;
  const stopView = inView(el, (visible) => {
    if (visible && !stopLoop) stopLoop = onTick(tick);
    else if (!visible && stopLoop) {
      stopLoop();
      stopLoop = null;
    }
  });
  const stopTick = () => {
    stopView();
    stopLoop?.();
    stopLoop = null;
  };

  // Scroll zentriert das Rad (nur mit Bewegung)
  const mm = gsap.matchMedia();
  mm.add(MM_CONDITIONS, (ctx) => {
    if (ctx.conditions?.reduce) {
      wheelState.runout = 0;
      return;
    }
    const tl = gsap.timeline({
      scrollTrigger: { trigger: el, start: 'top top', end: 'bottom bottom', scrub: 0.9 },
    });
    tl.fromTo(wheelState, { runout: 1 }, { runout: 0, ease: 'power2.inOut', duration: 1 }, 0).fromTo(
      anchor,
      { scale: 1, yPercent: 0 },
      { scale: 0.88, yPercent: -4, ease: 'none', duration: 1 },
      0,
    );
  });

  // Schnelle Mausbewegung stört den Rundlauf
  let lx = 0;
  let ly = 0;
  let lt = 0;
  const onMove = (e: PointerEvent) => {
    const now = performance.now();
    const dt = Math.max(16, now - lt);
    const speed = Math.hypot(e.clientX - lx, e.clientY - ly) / dt;
    lx = e.clientX;
    ly = e.clientY;
    lt = now;
    if (speed > 1.1) wheelState.disturb = Math.min(0.42, wheelState.disturb + (speed - 1.1) * 0.018);
  };
  if (isFinePointer() && !reduce) el.addEventListener('pointermove', onMove, { passive: true });

  // Einstieg: Buchstaben steigen maskiert auf, Messuhr fährt ein
  const stopIntro = onIntro(() => {
    if (reduce) {
      el.classList.add('is-in');
      return;
    }
    gsap.set(masks, { clipPath: 'inset(-45% -25% -24% -25%)' });
    gsap.fromTo(
      rises,
      // y: 0 überschreibt die aus dem CSS-Startzustand gelesene Pixelverschiebung
      { y: 0, yPercent: 145 },
      {
        y: 0,
        yPercent: 0,
        duration: 1.5,
        stagger: { each: 0.055, from: 'start' },
        ease: 'zb.out',
        onComplete: () => {
          el.classList.add('is-in');
          gsap.set(masks, { clearProps: 'clipPath' });
        },
      },
    );
    gsap.from(gaugeWrap, { x: 32, opacity: 0, duration: 1.3, delay: 0.55, ease: 'zb.out', clearProps: 'transform,opacity' });
  });

  return () => {
    stopTick();
    stopIntro();
    mm.revert();
    window.removeEventListener('resize', measure);
    el.removeEventListener('pointermove', onMove);
    gsap.killTweensOf([rises, masks, gaugeWrap, status, wheelState]);
    wheelState.disturb = 0;
  };
}
