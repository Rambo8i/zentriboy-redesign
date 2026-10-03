/**
 * Deklarative Reveals über Datenattribute. Wird pro Seite beim Intro gestartet.
 *
 *   data-reveal="lines"     Zeilen gleiten maskiert von unten ein (Überschriften, Absätze)
 *   data-reveal="chars"     Buchstaben steigen einzeln auf (große Einzelwörter)
 *   data-reveal="scramble"  Messwert-Charakter: Zeichen „rechnen“ sich ein (Mono-Beschriftungen)
 *   data-reveal="rise"      Block öffnet sich von unten (Clip + Versatz)
 *   data-reveal="clip"      Foto öffnet sich, das Bild darin zoomt zurück
 *   data-reveal="counter"   Zahl rollt auf ihren Wert (de-DE)
 *
 * Optionen: data-reveal-delay="0.2", data-reveal-start="top 85%"
 * Reduzierte Bewegung: alles wird sofort im Endzustand gezeigt.
 */
import { gsap, SCRAMBLE_CHARS } from '@/lib/gsap';
import { split } from '@/lib/split';
import { MM_CONDITIONS } from '@/lib/motion';
import type { Cleanup } from '@/lib/lifecycle';

const num = (v: string | undefined, fallback = 0) => (v ? parseFloat(v) || fallback : fallback);
const startOf = (el: HTMLElement, fallback = 'top 88%') => el.dataset.revealStart || fallback;

/**
 * Was beim Intro bereits im Bild ist (z. B. in sticky Hero-Ebenen), startet sofort –
 * ohne ScrollTrigger, dessen Startpunkt in sticky Kontexten um einige Pixel abweichen kann.
 */
const trigger = (el: HTMLElement, fallback?: string): ScrollTrigger.Vars | undefined => {
  const top = el.getBoundingClientRect().top;
  if (top < window.innerHeight * 0.92 && top > -window.innerHeight) return undefined;
  return { trigger: el, start: startOf(el, fallback), once: true };
};

const de = (decimals: number) =>
  new Intl.NumberFormat('de-DE', { minimumFractionDigits: decimals, maximumFractionDigits: decimals });

export function initReveals(root: ParentNode = document): Cleanup {
  const targets = Array.from(root.querySelectorAll<HTMLElement>('[data-reveal]')).filter(
    (el) => !el.closest('[data-reveal-manual]'),
  );
  if (!targets.length) return () => {};

  const mm = gsap.matchMedia();
  const splits: Array<{ revert: () => void }> = [];

  mm.add(MM_CONDITIONS, (ctx) => {
    const reduce = Boolean(ctx.conditions?.reduce);

    for (const el of targets) {
      const kind = el.dataset.reveal;
      const delay = num(el.dataset.revealDelay);

      if (reduce) {
        gsap.set(el, { visibility: 'visible', clearProps: 'clipPath,transform,opacity' });
        continue;
      }

      switch (kind) {
        case 'lines': {
          let done = false;
          splits.push(
            split(el, 'lines', {
              mask: 'lines',
              onSplit: (self) => {
                gsap.set(el, { visibility: 'visible' });
                if (done) return;
                return gsap.from(self.lines, {
                  yPercent: 112,
                  duration: 1.2,
                  stagger: 0.085,
                  delay,
                  ease: 'zb.out',
                  scrollTrigger: trigger(el),
                  onComplete: () => {
                    done = true;
                  },
                });
              },
            }),
          );
          break;
        }

        case 'chars': {
          let done = false;
          splits.push(
            split(el, 'lines,chars', {
              mask: 'lines',
              onSplit: (self) => {
                gsap.set(el, { visibility: 'visible' });
                if (done) return;
                return gsap.from(self.chars, {
                  yPercent: 120,
                  rotate: 6,
                  transformOrigin: '0% 100%',
                  duration: 1.1,
                  stagger: 0.028,
                  delay,
                  ease: 'zb.out',
                  scrollTrigger: trigger(el),
                  onComplete: () => {
                    done = true;
                  },
                });
              },
            }),
          );
          break;
        }

        case 'scramble': {
          const text = el.textContent ?? '';
          gsap.fromTo(
            el,
            { scrambleText: { text: ' ', chars: SCRAMBLE_CHARS } },
            {
              duration: Math.min(1.4, 0.35 + text.length * 0.035),
              delay,
              ease: 'none',
              scrambleText: { text, chars: SCRAMBLE_CHARS, speed: 0.8, revealDelay: 0.1 },
              scrollTrigger: trigger(el, 'top 92%'),
            },
          );
          break;
        }

        case 'rise': {
          gsap.set(el, { visibility: 'visible' });
          gsap.from(el, {
            y: 48,
            clipPath: 'inset(100% 0% 0% 0%)',
            duration: 1.2,
            delay,
            ease: 'zb.out',
            clearProps: 'clipPath,transform',
            scrollTrigger: trigger(el),
          });
          break;
        }

        case 'clip': {
          const img = el.querySelector('img');
          const tl = gsap.timeline({
            delay,
            scrollTrigger: trigger(el, 'top 85%'),
          });
          tl.from(el, { clipPath: 'inset(100% 0% 0% 0%)', duration: 1.3, ease: 'zb.inOut', clearProps: 'clipPath' });
          if (img) tl.from(img, { scale: 1.25, duration: 1.8, ease: 'zb.out', clearProps: 'scale' }, 0);
          break;
        }

        case 'counter': {
          const target = parseFloat((el.dataset.value ?? el.textContent ?? '0').replace(/\./g, '').replace(',', '.'));
          const decimals = num(el.dataset.decimals, 2);
          const fmt = de(decimals);
          const proxy = { v: 0 };
          el.textContent = fmt.format(0);
          gsap.to(proxy, {
            v: target,
            duration: 1.6,
            delay,
            ease: 'zb.out',
            onUpdate: () => {
              el.textContent = fmt.format(proxy.v);
            },
            scrollTrigger: trigger(el, 'top 90%'),
          });
          break;
        }
      }
    }

    return () => {
      splits.forEach((s) => s.revert());
      splits.length = 0;
    };
  });

  return () => mm.revert();
}
