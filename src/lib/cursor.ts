/**
 * Eigener Cursor: Punkt + Ring mit weicher Interpolation.
 * Kontext per `data-cursor="view|drag|pluck|trace|open|mail"` (optional `data-cursor-label`).
 * Nur für feine Zeiger und ohne reduzierte Bewegung, sonst bleibt der System-Cursor.
 */
import { damp } from './math';
import { onTick } from './ticker';
import { isFinePointer, prefersReducedMotion } from './motion';

const LABELS: Record<string, string> = {
  view: 'Ansehen',
  drag: 'Ziehen',
  pluck: 'Zupfen',
  trace: 'Führen',
  open: 'Öffnen',
  mail: 'Schreiben',
  order: 'Bestellen',
};

const INTERACTIVE = 'a, button, [role="button"], label, summary, [data-cursor]';

class Cursor {
  private root: HTMLElement;
  private ring: HTMLElement;
  private dot: HTMLElement;
  private label: HTMLElement;
  private x = -100;
  private y = -100;
  private rx = -100;
  private ry = -100;
  private dx = -100;
  private dy = -100;
  private visible = false;
  private state = '';

  constructor(root: HTMLElement) {
    this.root = root;
    this.ring = root.querySelector('.cursor__ring')!;
    this.dot = root.querySelector('.cursor__dot')!;
    this.label = root.querySelector('.cursor__label')!;

    document.documentElement.classList.add('has-cursor');

    window.addEventListener('pointermove', this.onMove, { passive: true });
    document.addEventListener('pointerover', this.onOver, { passive: true });
    document.addEventListener('pointerdown', this.onDown, { passive: true });
    document.addEventListener('pointerup', this.onUp, { passive: true });
    document.documentElement.addEventListener('pointerleave', this.onLeave);
    onTick(this.tick);
  }

  private onMove = (e: PointerEvent) => {
    if (e.pointerType !== 'mouse') return;
    this.x = e.clientX;
    this.y = e.clientY;
    if (!this.visible) {
      this.visible = true;
      this.rx = this.dx = this.x;
      this.ry = this.dy = this.y;
      this.root.classList.add('is-visible');
    }
  };

  private onOver = (e: PointerEvent) => {
    const target = e.target instanceof Element ? e.target : null;
    this.resolve(target);
  };

  private onDown = () => this.root.classList.add('is-pressed');
  private onUp = () => this.root.classList.remove('is-pressed');

  private onLeave = () => {
    this.visible = false;
    this.root.classList.remove('is-visible');
  };

  private resolve(target: Element | null) {
    const hit = target?.closest<HTMLElement>(INTERACTIVE) ?? null;
    const kind = hit?.dataset.cursor ?? (hit ? 'link' : '');
    const text = hit?.dataset.cursorLabel ?? LABELS[kind] ?? '';
    this.set(kind, text);
  }

  private set(kind: string, text: string) {
    if (kind === this.state && this.label.textContent === text) return;
    this.state = kind;
    this.root.dataset.state = kind || 'default';
    this.root.classList.toggle('has-label', Boolean(text));
    this.label.textContent = text;
  }

  /** Nach einem Seitenwechsel liegt ein anderes Element unter dem Zeiger. */
  reset() {
    const el = document.elementFromPoint(this.x, this.y);
    this.resolve(el);
  }

  private tick = (dt: number) => {
    if (!this.visible) return;
    this.dx = damp(this.dx, this.x, 38, dt);
    this.dy = damp(this.dy, this.y, 38, dt);
    this.rx = damp(this.rx, this.x, 13, dt);
    this.ry = damp(this.ry, this.y, 13, dt);
    this.dot.style.transform = `translate3d(${this.dx}px, ${this.dy}px, 0)`;
    this.ring.style.transform = `translate3d(${this.rx}px, ${this.ry}px, 0)`;
  };
}

let cursor: Cursor | null = null;

export function initCursor(): void {
  if (cursor || !isFinePointer() || prefersReducedMotion()) return;
  const root = document.querySelector<HTMLElement>('.cursor');
  if (!root) return;
  cursor = new Cursor(root);
}

export function resetCursor(): void {
  cursor?.reset();
}
