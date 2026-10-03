/**
 * Schlanker Einstieg zur WebGL-Bühne – ohne Three.js-Import.
 * Three.js wird erst geladen, wenn eine Seite tatsächlich einen Laufrad-Anker hat.
 */
import type { Stage } from './stage';

let stage: Stage | null = null;
let loading: Promise<Stage | null> | null = null;
let failed = false;

function supportsWebGL(): boolean {
  try {
    const c = document.createElement('canvas');
    return Boolean(c.getContext('webgl2') || c.getContext('webgl'));
  } catch {
    return false;
  }
}

async function load(): Promise<Stage | null> {
  if (stage || failed) return stage;
  if (!loading) {
    loading = (async () => {
      const canvas = document.querySelector<HTMLCanvasElement>('canvas.stage');
      if (!canvas || !supportsWebGL()) throw new Error('WebGL nicht verfügbar');
      const { Stage } = await import('./stage');
      stage = new Stage(canvas);
      if (import.meta.env.DEV) (window as unknown as { __zbStage: Stage }).__zbStage = stage;
      return stage;
    })().catch((err) => {
      failed = true;
      document.documentElement.classList.add('no-webgl');
      console.warn('[bühne]', err);
      return null;
    });
  }
  return loading;
}

/** Bei jedem Seitenaufruf: Anker suchen und die Bühne (falls nötig) laden. */
export async function syncStage(): Promise<void> {
  const anchor = document.querySelector<HTMLElement>('[data-wheel-anchor]');
  if (!anchor && !stage) return;
  const s = await load();
  s?.setAnchor(document.querySelector<HTMLElement>('[data-wheel-anchor]'));
}

/** Vor dem Seitentausch. */
export function detachStage(): void {
  stage?.detach();
}

/** Lädt Three.js vorab (z. B. während des Preloaders), ohne einen Anker zu setzen. */
export function preloadStage(): Promise<unknown> {
  if (!document.querySelector('[data-wheel-anchor]')) return Promise.resolve();
  return load();
}
