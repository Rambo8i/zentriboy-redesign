/**
 * ZentriBoy-Prinzip in drei Schritten (Timeline 0 … 1):
 *   0,00–0,30  Festklemmen: Backen schließen sich um die Gabelscheide
 *   0,33–0,66  Zentrieren: Felge schlägt seitlich, Messbolzen folgt, Nadel zeigt – Ausschlag nimmt ab
 *   0,66–1,00  Ablesen: Nadel auf Null, Toleranzmarken, Messwert ±0,00 mm
 */
import { gsap } from '@/lib/gsap';
import type { Visual } from './types';

export function createZentriboySchematic(svg: SVGSVGElement): Visual {
  const q = <T extends Element>(s: string) => svg.querySelector<T>(s)!;
  const jawL = q('.zb-jaw--l');
  const jawR = q('.zb-jaw--r');
  const knob = q('.zb-knob');
  const needle = q('.zb-needle');
  const plunger = q('.zb-plunger');
  const rim = q('.zb-rim');
  const read = q<SVGTextElement>('.zb-read');
  const tol = q('.zb-tol');
  const lClamp = q('.zb-l-clamp');
  const lGauge = q('.zb-l-gauge');
  const lRim = q('.zb-l-rim');

  const fmt = (mm: number) =>
    Math.abs(mm) < 0.005 ? '±0,00 mm' : `${mm > 0 ? '+' : '−'}${Math.abs(mm).toFixed(2).replace('.', ',')} mm`;

  const render = (p: number) => {
    const amp = 16 * Math.pow(1 - p, 1.4);
    const x = amp * Math.sin(p * 30);
    rim.setAttribute('transform', `translate(${x.toFixed(2)} 0)`);
    plunger.setAttribute('transform', `translate(${x.toFixed(2)} 0)`);
    gsap.set(needle, { rotation: x * 6, svgOrigin: '360 196' });
    read.textContent = fmt(x * 0.03);
  };

  const wob = { p: 0 };
  const tl = gsap.timeline({ paused: true, defaults: { ease: 'none' } });

  // 1 Festklemmen
  tl.fromTo(jawL, { rotation: -34, svgOrigin: '168 258' }, { rotation: 0, duration: 0.2, ease: 'power2.inOut' }, 0.05)
    .fromTo(jawR, { rotation: 34, svgOrigin: '168 258' }, { rotation: 0, duration: 0.2, ease: 'power2.inOut' }, 0.05)
    .fromTo(knob, { x: -10 }, { x: 0, duration: 0.12, ease: 'power2.out' }, 0.16)
    .fromTo(lClamp, { opacity: 0.25 }, { opacity: 1, duration: 0.08 }, 0.14)
    // 2 Zentrieren
    .fromTo([lGauge, lRim], { opacity: 0.25 }, { opacity: 1, duration: 0.08 }, 0.3)
    .fromTo(wob, { p: 0 }, { p: 1, duration: 0.34, onUpdate: () => render(wob.p) }, 0.33)
    // 3 Ablesen
    .fromTo(tol, { opacity: 0.35 }, { opacity: 1, duration: 0.1 }, 0.72)
    .fromTo(read, { opacity: 0.3 }, { opacity: 1, duration: 0.1 }, 0.72);

  render(0);
  return { tl, rest: 1, destroy: () => tl.kill() };
}
