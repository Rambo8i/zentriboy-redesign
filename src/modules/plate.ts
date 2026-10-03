/**
 * „Im Einsatz“-Tafel (components/product/UsePlate.astro)
 *
 * Desktop mit Bewegung: Die Tafel öffnet sich beim Scrollen als Kreis um die Messuhr –
 * erst das Messgerät, dann das ganze Rad. Das Bild darin zoomt dabei leicht zurück.
 * Video: lädt kurz vor Sichtkontakt, spielt nur sichtbar und bei sichtbarem Tab,
 * lässt sich anhalten. Bei reduzierter Bewegung, Datensparmodus oder langsamer
 * Verbindung bleibt es beim Standbild.
 */
import { gsap } from '@/lib/gsap';
import { MM_CONDITIONS, prefersReducedMotion } from '@/lib/motion';
import { inView } from '@/lib/observe';

type Connection = { saveData?: boolean; effectiveType?: string };

function videoAllowed(): boolean {
  if (prefersReducedMotion()) return false;
  const conn = (navigator as Navigator & { connection?: Connection }).connection;
  if (conn?.saveData) return false;
  return !/2g|3g/.test(conn?.effectiveType ?? '');
}

export default function plate(el: HTMLElement) {
  const media = el.querySelector<HTMLElement>('[data-plate-media]');
  const frame = el.querySelector<HTMLElement>('[data-plate-frame]');
  const video = el.querySelector<HTMLVideoElement>('video[data-src]');
  const toggle = el.querySelector<HTMLButtonElement>('[data-plate-toggle]');
  const label = toggle?.querySelector<HTMLElement>('[data-plate-label]');
  const cleanups: Array<() => void> = [];

  // Kreisblende um den Fokuspunkt (Messuhr)
  if (media && frame) {
    const fx = parseFloat(el.dataset.fx ?? '50');
    const fy = parseFloat(el.dataset.fy ?? '50');
    const mm = gsap.matchMedia();
    mm.add(MM_CONDITIONS, (ctx) => {
      if (!ctx.conditions?.desktop) return;
      const tl = gsap.timeline({
        scrollTrigger: { trigger: media, start: 'top 88%', end: 'center 52%', scrub: 0.8 },
      });
      tl.fromTo(
        media,
        { clipPath: `circle(9% at ${fx}% ${fy}%)` },
        { clipPath: `circle(104% at ${fx}% ${fy}%)`, ease: 'power2.in', duration: 1 },
        0,
      ).fromTo(frame, { scale: 1.14 }, { scale: 1, ease: 'power1.out', duration: 1 }, 0);
    });
    cleanups.push(() => mm.revert());
  }

  if (video && toggle && label && videoAllowed()) {
    let requested = false;
    let visible = false;
    let userPaused = false;

    const setState = () => {
      const paused = video.paused;
      toggle.dataset.state = paused ? 'paused' : 'playing';
      label.textContent = paused ? 'Video abspielen' : 'Video anhalten';
    };

    const sync = () => {
      if (visible && !userPaused && document.visibilityState === 'visible') {
        video.play().catch(() => {
          // Autoplay verweigert: Standbild bleibt, Knopf bietet das Abspielen an
          setState();
        });
      } else if (!video.paused) {
        video.pause();
      }
    };

    const onPlaying = () => el.classList.add('is-playing');
    const onError = () => {
      el.classList.remove('is-playing');
      toggle.hidden = true;
    };
    const onToggle = () => {
      if (!requested) return;
      userPaused = !video.paused;
      if (userPaused) video.pause();
      else {
        visible = true;
        sync();
      }
    };

    video.addEventListener('playing', onPlaying);
    video.addEventListener('play', setState);
    video.addEventListener('pause', setState);
    video.addEventListener('error', onError);
    toggle.addEventListener('click', onToggle);
    document.addEventListener('visibilitychange', sync);

    // Laden, sobald die Tafel näher als eine halbe Bildschirmhöhe ist
    cleanups.push(
      inView(
        el,
        (near) => {
          if (!near || requested) return;
          requested = true;
          video.src = video.dataset.src ?? '';
          video.load();
          toggle.hidden = false;
          setState();
          sync();
        },
        { rootMargin: '50% 0px' },
      ),
    );

    // Abspielen nur, solange ein nennenswerter Teil sichtbar ist
    cleanups.push(
      inView(
        media ?? el,
        (isVisible) => {
          visible = isVisible;
          if (requested) sync();
        },
        { threshold: 0.2 },
      ),
    );

    cleanups.push(() => {
      video.removeEventListener('playing', onPlaying);
      video.removeEventListener('play', setState);
      video.removeEventListener('pause', setState);
      video.removeEventListener('error', onError);
      toggle.removeEventListener('click', onToggle);
      document.removeEventListener('visibilitychange', sync);
      video.pause();
      video.removeAttribute('src');
      video.load();
    });
  }

  return () => cleanups.forEach((fn) => fn());
}
