/**
 * Erodieren (Canvas 2D): programmierte Kontur gestrichelt, geschnittene Bahn glühend,
 * Funkenpartikel am Schneidpunkt. Partikel laufen nur, solange sichtbar (setActive).
 * Rechenraum 500 × 500, skaliert auf die Canvas-Größe, DPR begrenzt.
 */
import { gsap } from '@/lib/gsap';
import { onTick } from '@/lib/ticker';
import { arcLengths, gearContour, pointAt } from '@/lib/geometry';
import { prefersReducedMotion, qualityTier } from '@/lib/motion';
import type { Cleanup } from '@/lib/lifecycle';
import type { Visual } from './types';

type Spark = { x: number; y: number; vx: number; vy: number; life: number; max: number };

export function createEdm(fig: HTMLElement): Visual {
  const canvas = fig.querySelector('canvas')!;
  const ctx = canvas.getContext('2d')!;
  const contour = gearContour(250, 250, 148, 182, 14, 26);
  const { lengths, total } = arcLengths(contour, true);
  const reduce = prefersReducedMotion();
  const maxSparks = qualityTier() === 'high' ? 220 : 110;

  const style = getComputedStyle(fig);
  const fg = style.color || '#e4e6e3';
  const accent = style.getPropertyValue('--accent').trim() || '#ff5a26';

  let scale = 1;
  let dpr = 1;
  const resize = () => {
    const r = fig.getBoundingClientRect();
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = Math.max(1, Math.round(r.width * dpr));
    canvas.height = Math.max(1, Math.round(r.height * dpr));
    scale = r.width / 500;
    draw(0);
  };

  const state = { p: 0 };
  const sparks: Spark[] = [];
  let emitCarry = 0;
  let active = false;
  let stopTick: Cleanup | null = null;
  let lastP = 0;

  function draw(dt: number) {
    ctx.setTransform(dpr * scale, 0, 0, dpr * scale, 0, 0);
    ctx.clearRect(0, 0, 500, 500);
    const px = 1 / scale;

    // Werkstückblock
    ctx.globalAlpha = 0.28;
    ctx.strokeStyle = fg;
    ctx.lineWidth = px;
    ctx.strokeRect(34, 34, 432, 432);

    // Programmierte Kontur
    ctx.globalAlpha = 0.45;
    ctx.setLineDash([5 * px, 6 * px]);
    ctx.beginPath();
    contour.forEach((pt, i) => (i ? ctx.lineTo(pt.x, pt.y) : ctx.moveTo(pt.x, pt.y)));
    ctx.closePath();
    ctx.stroke();
    ctx.setLineDash([]);
    ctx.globalAlpha = 1;

    const head = pointAt(contour, lengths, total, state.p, true);

    // Geschnittene Bahn: glühender Spalt
    if (state.p > 0.0005) {
      ctx.beginPath();
      ctx.moveTo(contour[0].x, contour[0].y);
      for (let i = 1; i < head.index && i < contour.length; i++) ctx.lineTo(contour[i].x, contour[i].y);
      ctx.lineTo(head.x, head.y);
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.strokeStyle = accent;
      ctx.lineWidth = 3 * px;
      ctx.shadowColor = accent;
      ctx.shadowBlur = 10 * px * scale;
      ctx.stroke();
      ctx.shadowBlur = 0;
      ctx.strokeStyle = 'rgba(255,236,220,0.9)';
      ctx.lineWidth = 0.9 * px;
      ctx.stroke();
    }

    // Funken
    const moving = Math.abs(state.p - lastP) > 1e-5;
    lastP = state.p;
    if (active && !reduce && state.p < 0.999) {
      emitCarry += dt * (moving ? 520 : 220);
      while (emitCarry > 1 && sparks.length < maxSparks) {
        emitCarry -= 1;
        const a = Math.random() * Math.PI * 2;
        const v = 60 + Math.random() * 220;
        const max = 0.12 + Math.random() * 0.38;
        sparks.push({ x: head.x, y: head.y, vx: Math.cos(a) * v, vy: Math.sin(a) * v - 40, life: max, max });
      }
    }

    ctx.globalCompositeOperation = 'lighter';
    for (let i = sparks.length - 1; i >= 0; i--) {
      const s = sparks[i];
      s.life -= dt;
      if (s.life <= 0) {
        sparks.splice(i, 1);
        continue;
      }
      s.vy += 380 * dt;
      s.x += s.vx * dt;
      s.y += s.vy * dt;
      const k = s.life / s.max;
      ctx.strokeStyle = k > 0.66 ? 'rgba(255,248,236,0.95)' : k > 0.33 ? 'rgba(255,176,112,0.85)' : accent;
      ctx.globalAlpha = Math.min(1, k * 1.4);
      ctx.lineWidth = (0.6 + k) * px;
      ctx.beginPath();
      ctx.moveTo(s.x, s.y);
      ctx.lineTo(s.x - s.vx * 0.025, s.y - s.vy * 0.025);
      ctx.stroke();
    }
    ctx.globalAlpha = 1;

    // Schneidpunkt (Funkenstrecke)
    if (state.p > 0.0005 && state.p < 0.999) {
      const g = ctx.createRadialGradient(head.x, head.y, 0, head.x, head.y, 22);
      g.addColorStop(0, 'rgba(255,255,255,0.95)');
      g.addColorStop(0.25, 'rgba(255,170,110,0.6)');
      g.addColorStop(1, 'rgba(255,90,38,0)');
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.arc(head.x, head.y, 22, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.globalCompositeOperation = 'source-over';
  }

  const loop = (dt: number) => {
    draw(dt);
    if (!active && sparks.length === 0) stop();
  };
  const start = () => {
    if (!stopTick) stopTick = onTick(loop);
  };
  const stop = () => {
    stopTick?.();
    stopTick = null;
  };

  const ro = new ResizeObserver(resize);
  ro.observe(fig);
  resize();

  const tl = gsap.timeline({ paused: true }).to(state, {
    p: 1,
    duration: 1,
    ease: 'none',
    onUpdate: () => {
      if (!stopTick) draw(0);
    },
  });

  return {
    tl,
    rest: 1,
    setActive: (a) => {
      active = a;
      if (a) start();
    },
    destroy: () => {
      stop();
      ro.disconnect();
      tl.kill();
    },
  };
}
