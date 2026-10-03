/**
 * Seitenwechsel „Zentrierblende“.
 *
 * Abdecken: Eine Graphitfläche öffnet sich kreisförmig vom Klickpunkt aus (bzw. wächst bei
 * `data-transition="expand"` aus dem angeklickten Element). Am Kreisrand läuft ein roter Messring.
 * Aufdecken: Der Kreis schließt sich zur Bildmitte, die neue Seite ist „zentriert“.
 *
 * Die Blende läuft parallel zum Laden der neuen Seite (siehe app.ts, astro:before-preparation).
 */
import { gsap, SCRAMBLE_CHARS } from './gsap';
import { prefersReducedMotion } from './motion';
import { labelForPath } from '@/data/site';

type CurtainParts = {
  root: HTMLElement;
  panel: HTMLElement;
  ring: SVGCircleElement;
  label: HTMLElement;
  dot: HTMLElement;
};

let active = false;
let running: gsap.core.Timeline | null = null;

function parts(): CurtainParts | null {
  const root = document.querySelector<HTMLElement>('.curtain');
  if (!root) return null;
  return {
    root,
    panel: root.querySelector<HTMLElement>('.curtain__panel')!,
    ring: root.querySelector<SVGCircleElement>('.curtain__ring circle')!,
    label: root.querySelector<HTMLElement>('.curtain__label')!,
    dot: root.querySelector<HTMLElement>('.curtain__dot')!,
  };
}

function cornerDistance(x: number, y: number, w: number, h: number): number {
  return Math.max(Math.hypot(x, y), Math.hypot(w - x, y), Math.hypot(x, h - y), Math.hypot(w - x, h - y)) + 4;
}

function setCircle(c: CurtainParts, r: number, x: number, y: number) {
  c.panel.style.clipPath = `circle(${r}px at ${x}px ${y}px)`;
  c.ring.setAttribute('r', String(Math.max(r, 0)));
  c.ring.setAttribute('cx', String(x));
  c.ring.setAttribute('cy', String(y));
}

const emit = (name: string, detail?: unknown) => document.dispatchEvent(new CustomEvent(name, { detail }));

/**
 * Die Navigation darf nie an einer Animation hängen (z. B. Tab im Hintergrund, kein requestAnimationFrame):
 * Nach `ms` springt die Timeline ans Ende, ihre onComplete-Logik läuft trotzdem.
 */
function finishWithin(tl: gsap.core.Timeline, ms: number) {
  const timer = window.setTimeout(() => {
    if (tl.progress() < 1) tl.progress(1);
  }, ms);
  tl.eventCallback('onInterrupt', () => window.clearTimeout(timer));
  return timer;
}

export const isTransitioning = (): boolean => active;

export function coverPage(source: Element | undefined, to: URL): Promise<void> {
  const c = parts();
  if (!c || prefersReducedMotion()) return Promise.resolve();

  active = true;
  const w = window.innerWidth;
  const h = window.innerHeight;
  const title = labelForPath(to.pathname);
  const expandEl = source?.closest<HTMLElement>('[data-transition="expand"]') ?? null;

  running?.kill();
  gsap.killTweensOf([c.panel, c.label, c.dot, c.ring]);
  c.root.classList.add('is-active');
  c.root.classList.toggle('is-expand', Boolean(expandEl));
  c.label.textContent = '';
  gsap.set(c.label, { opacity: 1, y: 0 });
  gsap.set(c.dot, { scale: 0, opacity: 1 });
  emit('zb:transition-start', { to });

  return new Promise((resolve) => {
    let timer = 0;
    const tl = gsap.timeline({
      onComplete: () => {
        window.clearTimeout(timer);
        resolve();
      },
    });

    if (expandEl) {
      const r = expandEl.getBoundingClientRect();
      const inset = { t: r.top, r: w - r.right, b: h - r.bottom, l: r.left };
      setCircle(c, 0, w / 2, h / 2);
      c.panel.style.clipPath = `inset(${inset.t}px ${inset.r}px ${inset.b}px ${inset.l}px)`;
      tl.to(inset, {
        t: 0,
        r: 0,
        b: 0,
        l: 0,
        duration: 0.9,
        ease: 'zb.inOut',
        onUpdate: () => {
          c.panel.style.clipPath = `inset(${inset.t}px ${inset.r}px ${inset.b}px ${inset.l}px)`;
        },
      });
    } else {
      let x = w / 2;
      let y = h / 2;
      if (source) {
        const r = source.getBoundingClientRect();
        if (r.width && r.height) {
          x = r.left + r.width / 2;
          y = r.top + r.height / 2;
        }
      }
      const proxy = { r: 0 };
      const max = cornerDistance(x, y, w, h);
      setCircle(c, 0, x, y);
      tl.to(proxy, {
        r: max,
        duration: 0.8,
        ease: 'zb.inOut',
        onUpdate: () => setCircle(c, proxy.r, x, y),
      });
    }

    tl.to(
      c.label,
      { duration: 0.7, scrambleText: { text: title, chars: SCRAMBLE_CHARS, speed: 0.7, revealDelay: 0.15 } },
      0.25,
    );
    running = tl;
    timer = finishWithin(tl, 1600);
  });
}

export function revealPage(): Promise<void> {
  const c = parts();
  if (!c || !active) {
    active = false;
    return Promise.resolve();
  }

  const w = window.innerWidth;
  const h = window.innerHeight;
  const x = w / 2;
  const y = h / 2;
  const proxy = { r: cornerDistance(x, y, w, h) };

  // Aus der Rechteck-Blende (expand) nahtlos in den Kreis wechseln.
  running?.kill();
  setCircle(c, proxy.r, x, y);
  c.root.classList.remove('is-expand');
  emit('zb:transition-reveal');

  return new Promise((resolve) => {
    let timer = 0;
    const tl = gsap.timeline({
      onComplete: () => {
        window.clearTimeout(timer);
        c.root.classList.remove('is-active');
        c.panel.style.clipPath = '';
        active = false;
        emit('zb:transition-end');
        resolve();
      },
    });

    tl.to(c.label, { opacity: 0, y: -24, duration: 0.35, ease: 'zb.in' }, 0)
      .to(proxy, { r: 0, duration: 0.95, ease: 'zb.inOut', onUpdate: () => setCircle(c, proxy.r, x, y) }, 0.05)
      .to(c.dot, { scale: 1, duration: 0.3, ease: 'back.out(3)' }, 0.72)
      .to(c.dot, { scale: 0, opacity: 0, duration: 0.35, ease: 'zb.in' }, 1.0);
    running = tl;
    timer = finishWithin(tl, 2200);
  });
}
