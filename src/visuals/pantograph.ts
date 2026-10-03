/**
 * Diaformschleifen: Pantograph. Scroll führt den Taster automatisch entlang der Zeichnung;
 * mit der Maus (oder Finger) übernimmt man selbst. Der Diamant überträgt jede besuchte
 * Stelle maßstäblich verkleinert (D = P + k · (S − P)).
 */
import { gsap } from '@/lib/gsap';
import { arcLengths, pointAt, toPath, type Pt } from '@/lib/geometry';
import type { Visual } from './types';

export function createPantograph(fig: HTMLElement): Visual {
  const svg = fig.querySelector('svg')!;
  const template: Pt[] = JSON.parse(fig.querySelector('.pa-data')?.textContent ?? '[]');
  const [px, py] = (fig.dataset.pivot ?? '744,58').split(',').map(Number);
  const k = parseFloat(fig.dataset.ratio ?? '0.25');
  const arm = svg.querySelector<SVGLineElement>('.pa-arm')!;
  const stylus = svg.querySelector<SVGGElement>('.pa-stylus')!;
  const diamond = svg.querySelector<SVGGElement>('.pa-diamond')!;
  const copy = svg.querySelector<SVGPathElement>('.pa-copy')!;
  const ghost = svg.querySelector<SVGPathElement>('.pa-ghost')!;

  const map = (p: Pt): Pt => ({ x: px + k * (p.x - px), y: py + k * (p.y - py) });
  const small = template.map(map);
  ghost.setAttribute('d', toPath(small));
  ghost.style.strokeDasharray = '3 4';

  const visited = new Uint8Array(template.length);
  const { lengths, total } = arcLengths(template);
  let userControl = false;

  const place = (pt: Pt) => {
    const d = map(pt);
    stylus.setAttribute('transform', `translate(${pt.x.toFixed(1)} ${pt.y.toFixed(1)})`);
    diamond.setAttribute('transform', `translate(${d.x.toFixed(1)} ${d.y.toFixed(1)})`);
    arm.setAttribute('x2', pt.x.toFixed(1));
    arm.setAttribute('y2', pt.y.toFixed(1));
  };

  const renderCopy = () => {
    let d = '';
    let open = false;
    for (let i = 0; i < small.length; i++) {
      if (visited[i]) {
        const p = small[i];
        d += `${open ? 'L' : 'M'}${p.x.toFixed(1)} ${p.y.toFixed(1)}`;
        open = true;
      } else open = false;
    }
    copy.setAttribute('d', d);
  };

  const state = { p: 0 };
  const fromProgress = () => {
    if (userControl) return;
    const pt = pointAt(template, lengths, total, state.p);
    for (let i = 0; i < visited.length; i++) visited[i] = i < pt.index ? 1 : 0;
    place(pt);
    renderCopy();
  };

  const tl = gsap.timeline({ paused: true }).to(state, { p: 1, duration: 1, ease: 'none', onUpdate: fromProgress });
  place(template[0]);

  // Selbst führen: Taster rastet auf den nächsten Punkt der Zeichnung ein
  const toSvg = (e: PointerEvent) => {
    const m = svg.getScreenCTM();
    if (!m) return null;
    return new DOMPoint(e.clientX, e.clientY).matrixTransform(m.inverse());
  };

  let dragging = false;
  const onMove = (e: PointerEvent) => {
    if (e.pointerType !== 'mouse' && !dragging) return;
    const s = toSvg(e);
    if (!s) return;
    let best = -1;
    let bestD = Infinity;
    for (let i = 0; i < template.length; i++) {
      const d = (template[i].x - s.x) ** 2 + (template[i].y - s.y) ** 2;
      if (d < bestD) {
        bestD = d;
        best = i;
      }
    }
    if (best < 0 || bestD > 90 * 90) return;
    if (!userControl) {
      userControl = true;
      visited.fill(0);
    }
    for (let i = Math.max(0, best - 2); i <= Math.min(template.length - 1, best + 2); i++) visited[i] = 1;
    place(template[best]);
    renderCopy();
  };
  const onDown = (e: PointerEvent) => {
    if (e.pointerType === 'mouse') return;
    dragging = true;
    onMove(e);
  };
  const onUp = () => {
    dragging = false;
  };

  // Direkte Manipulation bleibt auch bei reduzierter Bewegung erhalten (es bewegt sich nur, was man selbst führt).
  svg.addEventListener('pointermove', onMove);
  svg.addEventListener('pointerdown', onDown);
  window.addEventListener('pointerup', onUp);

  return {
    tl,
    rest: 1,
    destroy: () => {
      tl.kill();
      svg.removeEventListener('pointermove', onMove);
      svg.removeEventListener('pointerdown', onDown);
      window.removeEventListener('pointerup', onUp);
    },
  };
}
