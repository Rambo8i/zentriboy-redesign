/**
 * App-Bootstrap. Läuft einmal pro echtem Seitenaufruf (ClientRouter führt gebündelte Skripte nur einmal aus).
 *
 * Ablauf je Seite:
 *   astro:before-preparation  Blende abdecken, parallel dazu lädt die neue Seite
 *   astro:before-swap         Module aufräumen, Laufzeitklassen ins neue Dokument übernehmen
 *   astro:after-swap          Scroll und Cursor angleichen
 *   astro:page-load           Module mounten, Bühne synchronisieren, Blende öffnen, Intro
 */
import { gsap, ScrollTrigger, SCRAMBLE_CHARS } from '@/lib/gsap';
import { initSmoothScroll, resyncScroll, scrollToTarget, startScroll, stopScroll } from '@/lib/smooth-scroll';
import { mountModules, unmountModules, addCleanup, onIntro, runIntro } from '@/lib/lifecycle';
import { initCursor, resetCursor } from '@/lib/cursor';
import { magnetize } from '@/lib/magnetic';
import { coverPage, revealPage } from '@/lib/transitions';
import { prefersReducedMotion } from '@/lib/motion';
import { initReveals } from '@/animations/reveal';
import { initParallax } from '@/animations/parallax';
import { syncStage, detachStage, preloadStage } from '@/webgl';
import { registry } from '@/modules/registry';
import type { TransitionBeforePreparationEvent, TransitionBeforeSwapEvent } from 'astro:transitions/client';

const root = document.documentElement;
let firstLoad = true;

if (import.meta.env.DEV) {
  // Nur für die Entwicklung: Zugriff aus der Konsole
  void import('@/webgl/wheel-state').then(({ wheelState }) =>
    Object.assign(window, { __zb: { gsap, ScrollTrigger, wheelState } }),
  );
}

initSmoothScroll();
initCursor();

/* ------------------------------------------------------------------ Seitenwechsel */

document.addEventListener('astro:before-preparation', (event) => {
  const ev = event as TransitionBeforePreparationEvent;
  if (prefersReducedMotion()) return;
  const load = ev.loader;
  ev.loader = async () => {
    stopScroll();
    await Promise.all([coverPage(ev.sourceElement, ev.to), load()]);
  };
});

document.addEventListener('astro:before-swap', (event) => {
  const ev = event as TransitionBeforeSwapEvent;
  // Die native View Transition bricht in verborgenen Tabs ab (InvalidStateError) – der DOM-Tausch
  // läuft trotzdem. Die Blende übernimmt die Optik, daher die Ablehnung bewusst abfangen.
  ev.viewTransition?.ready?.catch(() => {});
  ev.viewTransition?.finished?.catch(() => {});
  // Laufzeitklassen (js, motion-ok, lenis, has-cursor, webgl-ready …) überleben den Tausch der <html>-Attribute.
  const next = ev.newDocument.documentElement;
  root.classList.forEach((c) => next.classList.add(c));
  next.classList.remove('is-preloading', 'menu-open');
  unmountModules();
  detachStage();
  ScrollTrigger.getAll().forEach((t) => t.kill());
});

document.addEventListener('astro:after-swap', () => {
  resyncScroll();
  resetCursor();
});

document.addEventListener('astro:page-load', () => {
  void onPageLoad();
});

/* ------------------------------------------------------------------ Seitenstart */

async function onPageLoad(): Promise<void> {
  const isFirst = firstLoad;
  firstLoad = false;

  // Intro-Aufgaben dieser Seite: Reveals und Parallaxe erst, wenn die Seite sichtbar ist.
  onIntro(() => {
    addCleanup(initReveals(document));
    addCleanup(initParallax(document));
    refresh();
  });

  const modulesReady = withTimeout(mountModules(registry), 2500);
  addCleanup(magnetize(document));

  if (isFirst) {
    // Im Hintergrund-Tab sieht niemand den Preloader: dann direkt starten.
    if (document.visibilityState !== 'visible') root.classList.remove('is-preloading');
    const preloading = root.classList.contains('is-preloading');
    if (preloading) {
      const { runPreloader } = await import('@/modules/preloader');
      await runPreloader([modulesReady, document.fonts?.ready ?? Promise.resolve(), preloadStage()]);
    } else {
      await modulesReady;
    }
    void syncStage();
    startScroll();
    runIntro();
    root.classList.add('app-ready');
    requestAnimationFrame(refresh);
    return;
  }

  await modulesReady;
  void syncStage();
  focusMain();
  refresh();
  const reveal = revealPage();
  gsap.delayedCall(prefersReducedMotion() ? 0 : 0.18, runIntro);
  startScroll();
  await reveal;
}

/** Module mounten parallel: ScrollTrigger vor dem Neuberechnen nach Seitenposition ordnen (Pins zuerst oben). */
function refresh() {
  ScrollTrigger.sort();
  ScrollTrigger.refresh();
}

function withTimeout<T>(p: Promise<T>, ms: number): Promise<T | void> {
  return Promise.race([p, new Promise<void>((r) => setTimeout(r, ms))]);
}

/** Nach einem Seitenwechsel startet die Tastaturnavigation am Seitenanfang. */
function focusMain() {
  const main = document.getElementById('main');
  main?.focus({ preventScroll: true });
}

/* ------------------------------------------------------------------ Globale Interaktionen */

// Sprunglinks innerhalb der Seite: weich scrollen (vor dem Router abfangen).
document.addEventListener(
  'click',
  (e) => {
    const link = (e.target as Element | null)?.closest?.('a[href^="#"]');
    if (!(link instanceof HTMLAnchorElement)) return;
    const id = decodeURIComponent(link.hash.slice(1));
    const target = id ? document.getElementById(id) : null;
    if (!target) return;
    e.preventDefault();
    e.stopPropagation();
    scrollToTarget(target, { offset: -8 });
    history.replaceState(history.state, '', `#${id}`);
    if (target.tabIndex < 0 && !target.hasAttribute('tabindex')) target.setAttribute('tabindex', '-1');
    target.focus({ preventScroll: true });
  },
  { capture: true },
);

// Hover-Scramble für Mono-Beschriftungen und Navigationslinks: [data-hover-scramble]
if (!prefersReducedMotion()) {
  document.addEventListener(
    'pointerenter',
    (e) => {
      const el = e.target instanceof Element ? e.target.closest<HTMLElement>('[data-hover-scramble]') : null;
      if (!el || e.target !== el) return;
      const target = el.querySelector<HTMLElement>('[data-hover-scramble-text]') ?? el;
      const text = target.dataset.text ?? target.textContent ?? '';
      target.dataset.text = text;
      gsap.to(target, {
        duration: Math.min(0.9, 0.25 + text.length * 0.03),
        scrambleText: { text, chars: SCRAMBLE_CHARS, speed: 1, revealDelay: 0.05 },
        overwrite: true,
      });
    },
    { capture: true },
  );
}
