import type { Visual } from './types';

export type { Visual };

/** Erzeugt die passende Zeichnungs-Animation für `[data-visual]` (lazy geladen). */
export async function createVisual(el: HTMLElement | SVGSVGElement): Promise<Visual | null> {
  switch (el.dataset.visual) {
    case 'punch':
      return (await import('./punch')).createPunch(el as SVGSVGElement);
    case 'fixture':
      return (await import('./fixture')).createFixture(el as HTMLElement);
    case 'toolpath':
      return (await import('./toolpath')).createToolpath(el as HTMLElement);
    case 'edm':
      return (await import('./edm')).createEdm(el as HTMLElement);
    case 'pantograph':
      return (await import('./pantograph')).createPantograph(el as HTMLElement);
    default:
      return null;
  }
}
