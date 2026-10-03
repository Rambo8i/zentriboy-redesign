/**
 * Zentrale GSAP-Registrierung. Alle Module importieren GSAP von hier,
 * damit Plugins und Easings genau einmal registriert werden.
 * Seltene Plugins (Draggable, Inertia, Flip, MotionPath, DrawSVG) registrieren die Module selbst.
 */
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { SplitText } from 'gsap/SplitText';
import { ScrambleTextPlugin } from 'gsap/ScrambleTextPlugin';
import { CustomEase } from 'gsap/CustomEase';

gsap.registerPlugin(ScrollTrigger, SplitText, ScrambleTextPlugin, CustomEase);

/** Bewegungsgesetz: Dinge rasten auf ihrer Linie ein. */
CustomEase.create('zb.out', '0.19,1,0.22,1');
CustomEase.create('zb.inOut', '0.65,0,0.35,1');
CustomEase.create('zb.in', '0.6,0,0.9,0.4');

gsap.defaults({ ease: 'zb.out', duration: 1 });

ScrollTrigger.config({ ignoreMobileResize: true });

/** Zeichenvorrat für Scramble-Effekte: technisch, ohne Sonderzeichen-Rauschen. */
export const SCRAMBLE_CHARS = '0123456789ABCDEFGHJKLMNPRSTUVWXYZ+-';

export { gsap, ScrollTrigger, SplitText, CustomEase };
