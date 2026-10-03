import type { Cleanup } from './lifecycle';

export const qs = <T extends Element = HTMLElement>(sel: string, root: ParentNode = document): T | null =>
  root.querySelector<T>(sel);

export const qsa = <T extends Element = HTMLElement>(sel: string, root: ParentNode = document): T[] =>
  Array.from(root.querySelectorAll<T>(sel));

/** addEventListener mit Rückgabe der passenden Aufräumfunktion. */
export function on<K extends keyof WindowEventMap>(
  target: Window,
  type: K,
  fn: (e: WindowEventMap[K]) => void,
  opts?: AddEventListenerOptions,
): Cleanup;
export function on<K extends keyof DocumentEventMap>(
  target: Document,
  type: K,
  fn: (e: DocumentEventMap[K]) => void,
  opts?: AddEventListenerOptions,
): Cleanup;
export function on<K extends keyof HTMLElementEventMap>(
  target: HTMLElement | SVGElement,
  type: K,
  fn: (e: HTMLElementEventMap[K]) => void,
  opts?: AddEventListenerOptions,
): Cleanup;
export function on(target: EventTarget, type: string, fn: (e: Event) => void, opts?: AddEventListenerOptions): Cleanup;
export function on(target: EventTarget, type: string, fn: (e: Event) => void, opts?: AddEventListenerOptions): Cleanup {
  target.addEventListener(type, fn, opts);
  return () => target.removeEventListener(type, fn, opts);
}

/** Mehrere Aufräumfunktionen bündeln. */
export function collect(): { add: (c: Cleanup | void | undefined) => void; run: Cleanup } {
  const list: Cleanup[] = [];
  return {
    add: (c) => {
      if (typeof c === 'function') list.push(c);
    },
    run: () => {
      while (list.length) {
        try {
          list.pop()!();
        } catch (err) {
          console.error(err);
        }
      }
    },
  };
}

export const nextFrame = (): Promise<void> => new Promise((r) => requestAnimationFrame(() => r()));
