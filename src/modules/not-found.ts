/**
 * 404: Die Nadel schlägt bis hinter das Skalenende aus und zittert am Anschlag, wie eine überlastete
 * Messuhr. Das Zittern klingt ab; nach 5 s steht die Nadel still (WCAG 2.2.2: keine Dauerbewegung).
 */
import { Spring } from '@/lib/spring';
import { onTick } from '@/lib/ticker';
import { prefersReducedMotion } from '@/lib/motion';

const DURATION = 5;

export default function notFound(el: HTMLElement) {
  const dial = el.querySelector<SVGSVGElement>('.dial');
  if (!dial) return;

  const STOP = 172;
  const rest = () => {
    dial.style.setProperty('--angle', `${STOP}deg`);
    dial.style.setProperty('--counter-angle', `${STOP * 2}deg`);
  };
  if (prefersReducedMotion()) {
    rest();
    return;
  }

  const needle = new Spring(260, 5, 0);
  needle.target = STOP;
  let t = 0;
  let done = false;
  const stop = onTick((dt) => {
    if (done) return;
    t += dt;
    if (t >= DURATION) {
      done = true;
      rest();
      stop();
      return;
    }
    needle.step(dt);
    // Am Anschlag abprallen und leicht zittern, zum Ende hin leiser
    if (needle.value > STOP) {
      needle.value = STOP;
      needle.velocity *= -0.45;
    }
    const fade = Math.max(0, 1 - Math.max(0, t - 2) / (DURATION - 2));
    const jitter = needle.value > STOP - 3 ? (Math.sin(t * 57) * 0.6 + Math.sin(t * 23) * 0.4) * fade : 0;
    dial.style.setProperty('--angle', `${(needle.value + jitter).toFixed(2)}deg`);
    dial.style.setProperty('--counter-angle', `${(needle.value * 2).toFixed(2)}deg`);
  });
  return stop;
}
