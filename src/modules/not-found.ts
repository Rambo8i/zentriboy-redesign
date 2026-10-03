/** 404: Die Nadel steht am Anschlag hinter dem Skalenende und zittert, wie eine überlastete Messuhr. */
import { Spring } from '@/lib/spring';
import { onTick } from '@/lib/ticker';
import { prefersReducedMotion } from '@/lib/motion';

export default function notFound(el: HTMLElement) {
  const dial = el.querySelector<SVGSVGElement>('.dial');
  if (!dial) return;

  const STOP = 172;
  if (prefersReducedMotion()) {
    dial.style.setProperty('--angle', `${STOP}deg`);
    return;
  }

  const needle = new Spring(260, 5, 0);
  needle.target = STOP;
  let t = 0;
  return onTick((dt) => {
    t += dt;
    needle.step(dt);
    // Am Anschlag abprallen und leicht zittern
    if (needle.value > STOP) {
      needle.value = STOP;
      needle.velocity *= -0.45;
    }
    const jitter = needle.value > STOP - 3 ? Math.sin(t * 57) * 0.6 + Math.sin(t * 23) * 0.4 : 0;
    dial.style.setProperty('--angle', `${(needle.value + jitter).toFixed(2)}deg`);
    dial.style.setProperty('--counter-angle', `${(needle.value * 2).toFixed(2)}deg`);
  });
}
