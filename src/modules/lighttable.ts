/**
 * Werkstatt: Leuchttisch zum Ziehen (Desktop), Raster als Alternative, Lightbox als natives <dialog>.
 * - Ziehen mit Trägheit (Draggable + Inertia), Klick öffnet das Foto (FLIP-Übergang vom Vorschaubild).
 * - Tastatur: Fokus auf ein Foto schiebt den Tisch dorthin, Enter öffnet, Pfeiltasten blättern, Escape schließt.
 * - Prüflupe (WebGL) beim Überfahren, nur feiner Zeiger und erlaubte Bewegung.
 */
import { gsap } from '@/lib/gsap';
import { Draggable } from 'gsap/Draggable';
import { InertiaPlugin } from 'gsap/InertiaPlugin';
import { MQ, isFinePointer, prefersReducedMotion } from '@/lib/motion';
import { startScroll, stopScroll } from '@/lib/smooth-scroll';
import { clamp } from '@/lib/math';
import type { Cleanup } from '@/lib/lifecycle';

gsap.registerPlugin(Draggable, InertiaPlugin);

export default async function lighttable(el: HTMLElement) {
  const viewport = el.querySelector<HTMLElement>('.lt__viewport')!;
  const plane = el.querySelector<HTMLElement>('.lt__plane')!;
  const buttons = Array.from(el.querySelectorAll<HTMLButtonElement>('.lt__button'));
  const dialog = el.querySelector<HTMLDialogElement>('dialog.lb')!;
  const lbImg = dialog.querySelector<HTMLImageElement>('.lb__img')!;
  const lbCaption = dialog.querySelector<HTMLElement>('.lb__caption')!;
  const lbCount = dialog.querySelector<HTMLElement>('.lb__count')!;
  const viewBtns = Array.from(document.querySelectorAll<HTMLButtonElement>('.wh__view'));
  const reduce = prefersReducedMotion();
  const desktop = window.matchMedia(MQ.desktop);

  let drag: Draggable | null = null;
  let lastDrag = 0;
  let current = -1;

  const canDrag = () => desktop.matches && el.dataset.view === 'table';

  const setupDrag = () => {
    drag?.kill();
    drag = null;
    gsap.set(plane, { clearProps: 'transform' });
    if (!canDrag()) return;
    const vw = viewport.clientWidth;
    const vh = viewport.clientHeight;
    gsap.set(plane, { x: (vw - plane.offsetWidth) / 2, y: (vh - plane.offsetHeight) / 2 });
    drag = Draggable.create(plane, {
      type: 'x,y',
      bounds: viewport,
      inertia: !reduce,
      edgeResistance: 0.88,
      dragClickables: true,
      minimumMovement: 6,
      onDragStart: () => {
        lastDrag = performance.now();
        el.classList.add('is-dragging');
      },
      onDragEnd: () => {
        lastDrag = performance.now();
        el.classList.remove('is-dragging');
      },
    })[0];
  };

  // Tastatur: fokussiertes Foto in die Mitte holen
  const onFocusIn = (e: FocusEvent) => {
    if (!drag) return;
    const item = (e.target as HTMLElement).closest<HTMLElement>('.lt__item');
    if (!item) return;
    const vw = viewport.clientWidth;
    const vh = viewport.clientHeight;
    const x = clamp(-(item.offsetLeft + item.offsetWidth / 2 - vw / 2), vw - plane.offsetWidth, 0);
    const y = clamp(-(item.offsetTop + item.offsetHeight / 2 - vh / 2), vh - plane.offsetHeight, 0);
    gsap.to(plane, { x, y, duration: reduce ? 0 : 0.9, ease: 'zb.inOut', onUpdate: () => drag?.update() });
  };

  /* ---------------------------------------------------------------- Lightbox */

  const fill = (i: number) => {
    const b = buttons[i];
    lbImg.src = b.dataset.full ?? '';
    lbImg.alt = b.dataset.alt ?? '';
    lbCaption.textContent = b.dataset.caption ?? '';
    lbCount.textContent = `${i + 1} von ${buttons.length}`;
  };

  const thumbOf = (i: number) => buttons[i]?.querySelector('img') ?? null;

  const flipFrom = (from: DOMRect) => {
    const to = lbImg.getBoundingClientRect();
    if (!to.width || !from.width) return;
    gsap.fromTo(
      lbImg,
      {
        x: from.left - to.left,
        y: from.top - to.top,
        scaleX: from.width / to.width,
        scaleY: from.height / to.height,
        transformOrigin: '0 0',
      },
      { x: 0, y: 0, scaleX: 1, scaleY: 1, duration: 0.85, ease: 'zb.inOut' },
    );
  };

  const open = (i: number) => {
    current = i;
    fill(i);
    const thumb = thumbOf(i);
    const from = thumb?.getBoundingClientRect();
    dialog.showModal();
    stopScroll();
    if (reduce || !from) return;
    flipFrom(from);
    gsap.from(dialog.querySelectorAll('.lb__meta, .lb__controls'), { opacity: 0, y: 14, duration: 0.6, delay: 0.35 });
  };

  let closing = false;
  const close = () => {
    if (!dialog.open || closing) return;
    let finished = false;
    let fallback = 0;
    const done = () => {
      if (finished) return;
      finished = true;
      window.clearTimeout(fallback);
      closing = false;
      gsap.killTweensOf(lbImg);
      dialog.close();
      gsap.set(lbImg, { clearProps: 'transform,opacity' });
      startScroll();
      buttons[current]?.focus({ preventScroll: true });
    };
    const thumb = thumbOf(current);
    const r = thumb?.getBoundingClientRect();
    const visible = r && r.bottom > 0 && r.top < window.innerHeight && r.right > 0 && r.left < window.innerWidth;
    if (reduce || !r || !visible) return done();
    closing = true;
    // Schließen darf nie an der Animation hängen (z. B. Tab im Hintergrund)
    fallback = window.setTimeout(done, 900);
    const to = lbImg.getBoundingClientRect();
    gsap.to(lbImg, {
      x: r.left - to.left,
      y: r.top - to.top,
      scaleX: r.width / to.width,
      scaleY: r.height / to.height,
      transformOrigin: '0 0',
      duration: 0.7,
      ease: 'zb.inOut',
      onComplete: done,
    });
  };

  /** Blättern: Inhalt wechselt sofort, die Bewegung ist nur Beiwerk. */
  const step = (dir: 1 | -1) => {
    current = (current + dir + buttons.length) % buttons.length;
    fill(current);
    if (!reduce) gsap.fromTo(lbImg, { opacity: 0, x: dir * 40 }, { opacity: 1, x: 0, duration: 0.6, ease: 'zb.out', overwrite: true });
  };

  const onButton = (e: MouseEvent) => {
    if (performance.now() - lastDrag < 200) return;
    const b = (e.currentTarget as HTMLElement).dataset.index;
    if (b != null) open(Number(b));
  };

  const onDialogClick = (e: MouseEvent) => {
    const t = e.target as HTMLElement;
    const action = t.closest<HTMLElement>('[data-lb]')?.dataset.lb;
    if (action === 'prev') step(-1);
    else if (action === 'next') step(1);
    else if (action === 'close' || t === dialog || t.classList.contains('lb__inner')) close();
  };

  const onCancel = (e: Event) => {
    e.preventDefault();
    close();
  };

  const onKey = (e: KeyboardEvent) => {
    if (!dialog.open) return;
    if (e.key === 'ArrowRight') step(1);
    else if (e.key === 'ArrowLeft') step(-1);
  };

  /* ---------------------------------------------------------------- Ansicht */

  const setView = (view: 'table' | 'grid') => {
    el.dataset.view = view;
    viewBtns.forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.view === view)));
    setupDrag();
  };
  const onView = (e: MouseEvent) => setView(((e.currentTarget as HTMLElement).dataset.view as 'table' | 'grid') ?? 'table');
  const onMq = () => setupDrag();

  buttons.forEach((b) => b.addEventListener('click', onButton));
  viewBtns.forEach((b) => b.addEventListener('click', onView));
  plane.addEventListener('focusin', onFocusIn);
  dialog.addEventListener('click', onDialogClick);
  dialog.addEventListener('cancel', onCancel);
  dialog.addEventListener('keydown', onKey);
  desktop.addEventListener('change', onMq);
  setupDrag();

  let stopLoupe: Cleanup = () => {};
  if (isFinePointer() && !reduce) {
    const { createLoupe } = await import('@/webgl/loupe');
    stopLoupe = createLoupe(buttons);
  }

  return () => {
    drag?.kill();
    stopLoupe();
    buttons.forEach((b) => b.removeEventListener('click', onButton));
    viewBtns.forEach((b) => b.removeEventListener('click', onView));
    plane.removeEventListener('focusin', onFocusIn);
    dialog.removeEventListener('click', onDialogClick);
    dialog.removeEventListener('cancel', onCancel);
    dialog.removeEventListener('keydown', onKey);
    desktop.removeEventListener('change', onMq);
    if (dialog.open) {
      dialog.close();
      startScroll();
    }
    gsap.killTweensOf([plane, lbImg]);
  };
}
