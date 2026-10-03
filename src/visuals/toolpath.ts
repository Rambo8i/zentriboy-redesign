/** CNC: Bahn zeichnet sich, der Fräser folgt, die Positionsanzeige läuft mit (Einheiten wie mm). */
import { gsap } from '@/lib/gsap';
import type { Visual } from './types';

const fmt = (v: number) => `${v >= 0 ? '+' : '−'}${Math.abs(v).toFixed(3).replace('.', ',')}`;

export function createToolpath(fig: HTMLElement): Visual {
  const path = fig.querySelector<SVGPathElement>('.t-path')!;
  const tool = fig.querySelector<SVGGElement>('.t-tool')!;
  const dx = fig.querySelector<HTMLElement>('[data-dro-x]')!;
  const dy = fig.querySelector<HTMLElement>('[data-dro-y]')!;
  const total = path.getTotalLength();
  path.style.strokeDasharray = `${total} ${total}`;

  const state = { p: 0 };
  let lastText = 0;
  const render = () => {
    const len = total * state.p;
    path.style.strokeDashoffset = String(total - len);
    const pt = path.getPointAtLength(len);
    tool.setAttribute('transform', `translate(${pt.x.toFixed(2)} ${pt.y.toFixed(2)})`);
    const now = performance.now();
    if (now - lastText > 50) {
      lastText = now;
      dx.textContent = fmt((pt.x - 400) * 0.25);
      dy.textContent = fmt(-(pt.y - 262) * 0.25);
    }
  };

  const tl = gsap.timeline({ paused: true }).to(state, { p: 1, duration: 1, ease: 'none', onUpdate: render });
  render();

  return { tl, rest: 1, destroy: () => tl.kill() };
}
