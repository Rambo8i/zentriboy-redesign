/**
 * Zupfbare Speiche (Canvas 2D) – Tensiometer.
 * Greifen und Ziehen biegt die Speiche (Dreiecksform), Loslassen lässt sie schwingen
 * (gedämpfte Feder, Grundschwingung). Schnell mit der Maus darüberstreichen zupft sie an.
 * Die kleine Messuhr zeigt den Ausschlag. Tastatur: Schaltfläche „Speiche anschlagen“.
 * Reduzierte Bewegung: Speiche kehrt ohne Nachschwingen zurück.
 */
import { gsap, SCRAMBLE_CHARS } from '@/lib/gsap';
import { Spring } from '@/lib/spring';
import { onTick } from '@/lib/ticker';
import { clamp } from '@/lib/math';
import { prefersReducedMotion } from '@/lib/motion';
import type { Cleanup } from '@/lib/lifecycle';

type V = { x: number; y: number };

export default function spoke(el: HTMLElement) {
  const canvas = el.querySelector<HTMLCanvasElement>('canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d')!;
  const dial = el.querySelector<SVGSVGElement>('.dial');
  const hint = el.querySelector<HTMLElement>('[data-spoke-hint]');
  const pluckBtn = el.querySelector<HTMLButtonElement>('[data-spoke-pluck]');
  const reduce = prefersReducedMotion();

  const parse = (s: string | undefined, fb: [number, number]): [number, number] => {
    const p = (s ?? '').split(',').map(Number);
    return p.length === 2 && p.every(Number.isFinite) ? [p[0], p[1]] : fb;
  };
  const fa = parse(el.dataset.spokeA, [-0.04, 0.9]);
  const fb = parse(el.dataset.spokeB, [1.04, 0.12]);

  const spring = reduce ? new Spring(260, 34) : new Spring(1450, 3.4);
  const needle = new Spring(90, 11);
  let envelope = 0;
  let w = 0;
  let h = 0;
  let dpr = 1;
  let A: V = { x: 0, y: 0 };
  let B: V = { x: 0, y: 0 };
  let u: V = { x: 1, y: 0 };
  let n: V = { x: 0, y: 1 };
  let len = 1;
  const grab = { active: false, t: 0.5, d: 0, id: -1 };
  let stopTick: Cleanup | null = null;
  let lastSide = 0;
  let last = { x: 0, y: 0, time: 0 };
  let touched = false;

  const style = getComputedStyle(el);
  const steel = '#c3c8cc';
  const accent = style.getPropertyValue('--accent').trim() || '#ff5a26';

  function resize() {
    const r = canvas!.getBoundingClientRect();
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    w = r.width;
    h = r.height;
    canvas!.width = Math.max(1, Math.round(w * dpr));
    canvas!.height = Math.max(1, Math.round(h * dpr));
    A = { x: fa[0] * w, y: fa[1] * h };
    B = { x: fb[0] * w, y: fb[1] * h };
    const dx = B.x - A.x;
    const dy = B.y - A.y;
    len = Math.hypot(dx, dy) || 1;
    u = { x: dx / len, y: dy / len };
    n = { x: -u.y, y: u.x };
    draw();
  }

  /** Projektion eines Punktes auf die Speiche: t (0…1 entlang) und Normalabstand s. */
  const project = (px: number, py: number) => {
    const rx = px - A.x;
    const ry = py - A.y;
    return { t: (rx * u.x + ry * u.y) / len, s: rx * n.x + ry * n.y };
  };

  function strokeSpoke(path: () => void, width: number, color: string, alpha = 1) {
    ctx.globalAlpha = alpha;
    ctx.beginPath();
    path();
    ctx.lineWidth = width;
    ctx.strokeStyle = color;
    ctx.stroke();
  }

  function draw() {
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, w, h);
    ctx.lineCap = 'round';

    if (grab.active) {
      const p = { x: A.x + u.x * grab.t * len + n.x * grab.d, y: A.y + u.y * grab.t * len + n.y * grab.d };
      const shape = () => {
        ctx.moveTo(A.x, A.y);
        ctx.lineTo(p.x, p.y);
        ctx.lineTo(B.x, B.y);
      };
      strokeSpoke(shape, 2.6, steel);
      strokeSpoke(shape, 0.8, '#ffffff', 0.6);
      // Griffpunkt
      ctx.globalAlpha = 1;
      ctx.fillStyle = accent;
      ctx.beginPath();
      ctx.arc(p.x, p.y, 4, 0, Math.PI * 2);
      ctx.fill();
    } else {
      const mid = { x: (A.x + B.x) / 2, y: (A.y + B.y) / 2 };
      const curve = (amp: number) => () => {
        ctx.moveTo(A.x, A.y);
        ctx.quadraticCurveTo(mid.x + n.x * amp * 2, mid.y + n.y * amp * 2, B.x, B.y);
      };
      // Nachbild der Schwingung (Hüllkurve)
      if (envelope > 3 && !reduce) {
        strokeSpoke(curve(envelope), 1.2, steel, 0.16);
        strokeSpoke(curve(-envelope), 1.2, steel, 0.16);
      }
      strokeSpoke(curve(spring.value), 2.6, steel);
      strokeSpoke(curve(spring.value), 0.8, '#ffffff', 0.6);
    }
    ctx.globalAlpha = 1;
  }

  const tick = (dt: number) => {
    if (!grab.active) spring.step(dt);
    const amp = grab.active ? Math.abs(grab.d) : Math.abs(spring.value);
    envelope = Math.max(amp, envelope * Math.exp(-dt * 2.2));
    needle.target = clamp(envelope / 110, 0, 1.2);
    needle.step(dt);
    dial?.style.setProperty('--angle', `${(needle.value * 160).toFixed(2)}deg`);
    draw();
    if (!grab.active && spring.settled && envelope < 0.3 && Math.abs(needle.value - needle.target) < 0.002) stop();
  };

  const start = () => {
    if (!stopTick) stopTick = onTick(tick);
  };
  const stop = () => {
    stopTick?.();
    stopTick = null;
    spring.snap(0);
    envelope = 0;
    draw();
  };

  const firstTouch = () => {
    if (touched || !hint) return;
    touched = true;
    gsap.to(hint, { duration: 0.6, scrambleText: { text: 'Gut gespannt.', chars: SCRAMBLE_CHARS } });
  };

  const local = (e: PointerEvent) => {
    const r = canvas.getBoundingClientRect();
    return { x: e.clientX - r.left, y: e.clientY - r.top };
  };

  const onDown = (e: PointerEvent) => {
    const p = local(e);
    const pr = project(p.x, p.y);
    if (pr.t < 0.02 || pr.t > 0.98 || Math.abs(pr.s) > (e.pointerType === 'mouse' ? 36 : 48)) return;
    // Touch: Antippen zupft (Ziehen würde mit dem Scrollen konkurrieren)
    if (e.pointerType === 'touch') {
      spring.kick(-(Math.sign(pr.s) || 1) * (reduce ? 0 : 820));
      if (reduce) spring.value = 36;
      firstTouch();
      start();
      return;
    }
    grab.active = true;
    grab.id = e.pointerId;
    grab.t = pr.t;
    grab.d = pr.s;
    canvas.setPointerCapture(e.pointerId);
    e.preventDefault();
    firstTouch();
    start();
  };

  const onMove = (e: PointerEvent) => {
    const p = local(e);
    const pr = project(p.x, p.y);
    if (grab.active && e.pointerId === grab.id) {
      const limit = 120 * Math.sin(Math.PI * clamp(pr.t, 0.05, 0.95));
      grab.t = clamp(pr.t, 0.05, 0.95);
      grab.d = clamp(pr.s, -limit, limit);
      return;
    }
    // Überstreichen mit der Maus zupft die Speiche an
    if (e.pointerType === 'mouse' && !reduce && pr.t > 0.05 && pr.t < 0.95) {
      const side = Math.sign(pr.s);
      const now = performance.now();
      if (lastSide && side && side !== lastSide && Math.abs(pr.s) < 60) {
        const dt = Math.max(8, now - last.time);
        const speed = Math.hypot(p.x - last.x, p.y - last.y) / dt;
        spring.kick(side * clamp(speed * 520, 60, 900));
        firstTouch();
        start();
      }
      lastSide = side;
      last = { x: p.x, y: p.y, time: now };
    }
  };

  const release = (e: PointerEvent) => {
    if (!grab.active || e.pointerId !== grab.id) return;
    grab.active = false;
    // Grundschwingung ≈ Auslenkung am Griffpunkt, gewichtet mit der Lage auf der Speiche
    spring.snap(grab.d * Math.sin(Math.PI * grab.t));
    spring.target = 0;
    start();
  };

  const onPluck = () => {
    spring.kick(reduce ? 0 : 700);
    if (reduce) {
      spring.value = 40;
    }
    firstTouch();
    start();
  };

  const ro = new ResizeObserver(resize);
  ro.observe(canvas);
  resize();

  if (hint && window.matchMedia('(pointer: coarse)').matches) hint.textContent = 'Speiche antippen';

  canvas.addEventListener('pointerdown', onDown);
  canvas.addEventListener('pointermove', onMove);
  canvas.addEventListener('pointerup', release);
  canvas.addEventListener('pointercancel', release);
  pluckBtn?.addEventListener('click', onPluck);

  return () => {
    stopTick?.();
    ro.disconnect();
    canvas.removeEventListener('pointerdown', onDown);
    canvas.removeEventListener('pointermove', onMove);
    canvas.removeEventListener('pointerup', release);
    canvas.removeEventListener('pointercancel', release);
    pluckBtn?.removeEventListener('click', onPluck);
    if (hint) gsap.killTweensOf(hint);
  };
}
