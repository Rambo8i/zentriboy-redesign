/**
 * Modul-Registry: `data-module="name"` → dynamischer Import.
 * Jedes Modul wird nur geladen, wenn die Seite es braucht (Code-Splitting).
 */
import type { Registry } from '@/lib/lifecycle';

export const registry: Registry = {
  header: () => import('./header'),
  menu: () => import('./menu'),
  footer: () => import('./footer'),
  hero: () => import('./hero'),
  statement: () => import('./statement'),
  processes: () => import('./processes'),
  'werkstatt-zoom': () => import('./werkstatt-zoom'),
  dial: () => import('./dial'),
  spoke: () => import('./spoke'),
  strike: () => import('./strike'),
  steps: () => import('./steps'),
  plate: () => import('./plate'),
  fertigung: () => import('./fertigung'),
  lighttable: () => import('./lighttable'),
  'not-found': () => import('./not-found'),
};
