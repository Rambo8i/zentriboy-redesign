/**
 * Seiten-Lebenszyklus für Astro View Transitions.
 *
 * Gebündelte Skripte laufen mit dem ClientRouter nur einmal. Deshalb markieren Komponenten
 * ihre Wurzel mit `data-module="name"`. Bei jedem `astro:page-load` werden die passenden Module
 * dynamisch geladen und gemountet, bei `astro:before-swap` räumen sie vollständig auf
 * (GSAP-Contexts, Listener, Observer, WebGL).
 */

export type Cleanup = () => void;
export type ModuleResult = Cleanup | void | undefined;
export type ModuleFn = (el: HTMLElement) => ModuleResult | Promise<ModuleResult>;
export type ModuleLoader = () => Promise<{ default: ModuleFn }>;
export type Registry = Record<string, ModuleLoader>;

let generation = 0;
let pageCleanups: Cleanup[] = [];
let introDone = false;
let introQueue: Array<() => void> = [];

/** Aufräumfunktion für die aktuelle Seite registrieren. */
export function addCleanup(fn: Cleanup): void {
  pageCleanups.push(fn);
}

export async function mountModules(registry: Registry, root: ParentNode = document): Promise<void> {
  const gen = generation;
  const els = Array.from(root.querySelectorAll<HTMLElement>('[data-module]'));

  const tasks = els.flatMap((el) =>
    (el.dataset.module ?? '')
      .split(/\s+/)
      .filter(Boolean)
      .map(async (name) => {
        const loader = registry[name];
        if (!loader) {
          console.warn(`[modul] unbekannt: ${name}`);
          return;
        }
        try {
          const mod = await loader();
          if (gen !== generation) return; // Seite wurde inzwischen gewechselt
          const result = await mod.default(el);
          if (typeof result === 'function') {
            if (gen !== generation) result();
            else pageCleanups.push(result);
          }
        } catch (err) {
          console.error(`[modul] ${name}`, err);
        }
      }),
  );

  await Promise.all(tasks);
}

export function unmountModules(): void {
  generation++;
  introDone = false;
  introQueue = [];
  const list = pageCleanups;
  pageCleanups = [];
  for (let i = list.length - 1; i >= 0; i--) {
    try {
      list[i]();
    } catch (err) {
      console.error('[modul] Aufräumen fehlgeschlagen', err);
    }
  }
}

/**
 * Callback, sobald die Seite sichtbar ist (nach Preloader bzw. Seitenblende).
 * Einstiegsanimationen und Scroll-Reveals starten erst hier, damit man sie auch sieht.
 */
export function onIntro(fn: () => void): Cleanup {
  if (introDone) {
    fn();
    return () => {};
  }
  introQueue.push(fn);
  return () => {
    introQueue = introQueue.filter((f) => f !== fn);
  };
}

export function runIntro(): void {
  if (introDone) return;
  introDone = true;
  const queue = introQueue;
  introQueue = [];
  for (const fn of queue) {
    try {
      fn();
    } catch (err) {
      console.error('[intro]', err);
    }
  }
}

export const isIntroDone = (): boolean => introDone;
