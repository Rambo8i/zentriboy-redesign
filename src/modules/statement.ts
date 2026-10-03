/**
 * Haltungs-Absatz: Wörter werden beim Scrollen der Reihe nach „eingelesen“ (Deckkraft scrub),
 * Inline-Fotos öffnen sich an ihrer Stelle im Satz. Reduzierte Bewegung: alles sofort sichtbar.
 */
import { gsap } from '@/lib/gsap';
import { split } from '@/lib/split';
import { MM_CONDITIONS } from '@/lib/motion';

export default function statement(el: HTMLElement) {
  const text = el.querySelector<HTMLElement>('.statement__text');
  if (!text) return;

  const mm = gsap.matchMedia();
  mm.add(MM_CONDITIONS, (ctx) => {
    if (ctx.conditions?.reduce) return;

    const s = split(text, 'words', { autoSplit: false });
    const photos = Array.from(text.querySelectorAll<HTMLElement>('[data-inline-photo]'));
    // Wörter und Fotos in Lesereihenfolge
    const sequence = [...(s.words as HTMLElement[]), ...photos].sort((a, b) =>
      a.compareDocumentPosition(b) & Node.DOCUMENT_POSITION_FOLLOWING ? -1 : 1,
    );

    const tl = gsap.timeline({
      scrollTrigger: { trigger: text, start: 'top 78%', end: 'bottom 45%', scrub: 0.6 },
    });
    sequence.forEach((node, i) => {
      if (photos.includes(node)) {
        const img = node.querySelector('img');
        tl.fromTo(node, { clipPath: 'inset(0% 50% 0% 50%)' }, { clipPath: 'inset(0% 0% 0% 0%)', duration: 2, ease: 'power2.out' }, i * 0.5);
        if (img) tl.fromTo(img, { scale: 1.6 }, { scale: 1, duration: 2.4, ease: 'power2.out' }, i * 0.5);
      } else {
        tl.fromTo(node, { opacity: 0.13 }, { opacity: 1, duration: 1, ease: 'none' }, i * 0.5);
      }
    });

    return () => s.revert();
  });

  return () => mm.revert();
}
