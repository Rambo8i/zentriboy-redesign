/**
 * Sichtbarkeit beobachten – geteilte IntersectionObserver pro Konfiguration.
 * Canvas-Loops und WebGL laufen nur, solange sie sichtbar sind.
 */
import type { Cleanup } from './lifecycle';

type Callback = (visible: boolean, entry: IntersectionObserverEntry) => void;
type Pool = { io: IntersectionObserver; callbacks: Map<Element, Set<Callback>> };

const pools = new Map<string, Pool>();

function getPool(rootMargin: string, threshold: number): Pool {
  const key = `${rootMargin}|${threshold}`;
  let pool = pools.get(key);
  if (!pool) {
    const callbacks = new Map<Element, Set<Callback>>();
    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          callbacks.get(entry.target)?.forEach((cb) => cb(entry.isIntersecting, entry));
        }
      },
      { rootMargin, threshold },
    );
    pool = { io, callbacks };
    pools.set(key, pool);
  }
  return pool;
}

export function inView(
  el: Element,
  cb: Callback,
  { rootMargin = '0px', threshold = 0 }: { rootMargin?: string; threshold?: number } = {},
): Cleanup {
  const pool = getPool(rootMargin, threshold);
  let set = pool.callbacks.get(el);
  if (!set) {
    set = new Set();
    pool.callbacks.set(el, set);
    pool.io.observe(el);
  }
  set.add(cb);
  return () => {
    const current = pool.callbacks.get(el);
    if (!current) return;
    current.delete(cb);
    if (current.size === 0) {
      pool.callbacks.delete(el);
      pool.io.unobserve(el);
    }
  };
}

/** Einmalig auslösen, sobald das Element sichtbar wird. */
export function onceInView(el: Element, cb: () => void, opts?: { rootMargin?: string; threshold?: number }): Cleanup {
  let stop: Cleanup = () => {};
  stop = inView(
    el,
    (visible) => {
      if (!visible) return;
      stop();
      cb();
    },
    opts,
  );
  return stop;
}
