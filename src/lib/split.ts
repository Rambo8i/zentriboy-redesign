/**
 * Text-Splitting auf Basis von GSAP SplitText.
 * - Zeilen werden maskiert (mask: 'lines') für echte Masked Reveals.
 * - autoSplit teilt nach Font-Load und Resize neu; eine aus onSplit zurückgegebene
 *   Animation wird dabei von SplitText übernommen (Fortschritt bleibt erhalten).
 * - aria: 'auto' hält den Text für Screenreader lesbar.
 */
import { SplitText } from './gsap';

type SplitKind = 'lines' | 'words' | 'chars' | 'lines,words' | 'words,chars' | 'lines,words,chars' | 'lines,chars';

export type SplitOptions = {
  mask?: 'lines' | 'words' | 'chars';
  autoSplit?: boolean;
  onSplit?: (self: SplitText) => gsap.core.Animation | void;
};

export function split(el: HTMLElement, type: SplitKind, opts: SplitOptions = {}): SplitText {
  return SplitText.create(el, {
    type,
    mask: opts.mask,
    linesClass: 'split-line',
    wordsClass: 'split-word',
    charsClass: 'split-char',
    aria: 'auto',
    autoSplit: opts.autoSplit ?? type.includes('lines'),
    // SplitText akzeptiert eine zurückgegebene Animation, auch wenn die Typdefinition void nennt.
    onSplit: opts.onSplit as ((self: SplitText) => void) | undefined,
  });
}
