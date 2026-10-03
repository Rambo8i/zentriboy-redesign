/**
 * Tensiometer-Prinzip in drei Schritten (Timeline 0 … 1):
 *   Einklicken: Gerät setzt auf, Haken untergreifen die Speiche, Druckbolzen biegt sie durch
 *   Ablesen:    Nadel schlägt aus, der Bereich wird markiert
 *   Vergleichen: Tabelle, Leitung zur passenden Zeile
 */
import { gsap } from '@/lib/gsap';
import type { Visual } from './types';

const CX = 320;
const CY = 112;
const R = 73;

function arcPath(deg: number): string {
  if (deg < 0.5) return '';
  const a = (Math.min(deg, 359) * Math.PI) / 180;
  const x = CX + R * Math.sin(a);
  const y = CY - R * Math.cos(a);
  return `M${CX} ${CY - R}A${R} ${R} 0 ${deg > 180 ? 1 : 0} 1 ${x.toFixed(2)} ${y.toFixed(2)}`;
}

export function createTensiometerSchematic(svg: SVGSVGElement): Visual {
  const q = <T extends Element>(s: string) => svg.querySelector<T>(s)!;
  const device = q('.tm-device');
  const plunger = q('.tm-plunger');
  const spoke = q<SVGPolylineElement>('.tm-spoke');
  const click = q('.tm-click');
  const needle = q('.tm-needle');
  const arc = q<SVGPathElement>('.tm-arc');
  const table = q('.tm-table');
  const leader = q('.tm-leader');
  const hit = q('.tm-hit');

  const state = { d: 0, angle: 0 };
  const renderSpoke = () => {
    spoke.setAttribute('points', `10,352 178,352 ${CX},${(352 + state.d).toFixed(2)} 462,352 630,352`);
    plunger.setAttribute('transform', `translate(0 ${(state.d * 1.9).toFixed(2)})`);
  };
  const renderNeedle = () => {
    gsap.set(needle, { rotation: state.angle, svgOrigin: `${CX} ${CY}` });
    arc.setAttribute('d', arcPath(state.angle));
  };

  const tl = gsap.timeline({ paused: true, defaults: { ease: 'none' } });

  // 1 Einklicken
  tl.fromTo(device, { y: -96 }, { y: 0, duration: 0.18, ease: 'power2.out' }, 0.02)
    .fromTo(state, { d: 0 }, { d: 13, duration: 0.08, ease: 'power2.in', onUpdate: renderSpoke }, 0.2)
    .fromTo(click, { opacity: 0 }, { opacity: 1, duration: 0.03 }, 0.27)
    .to(click, { opacity: 0, duration: 0.05 }, 0.31)
    // 2 Ablesen
    .fromTo(state, { angle: 0 }, { angle: 118, duration: 0.22, ease: 'back.out(1.7)', onUpdate: renderNeedle }, 0.38)
    // 3 Vergleichen
    .fromTo(table, { opacity: 0, x: 36 }, { opacity: 1, x: 0, duration: 0.12, ease: 'power2.out' }, 0.68)
    .fromTo(leader, { opacity: 0 }, { opacity: 1, duration: 0.06 }, 0.8)
    .fromTo(hit, { opacity: 0 }, { opacity: 1, duration: 0.06 }, 0.86);

  renderSpoke();
  renderNeedle();
  return { tl, rest: 1, destroy: () => tl.kill() };
}
