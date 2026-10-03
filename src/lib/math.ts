export const clamp = (v: number, min = 0, max = 1): number => Math.min(max, Math.max(min, v));

export const lerp = (a: number, b: number, t: number): number => a + (b - a) * t;

export const mapRange = (v: number, inMin: number, inMax: number, outMin: number, outMax: number): number =>
  outMin + ((v - inMin) / (inMax - inMin)) * (outMax - outMin);

/** Bildratenunabhängiges Nachziehen: `lambda` ≈ Ansprechgeschwindigkeit pro Sekunde. */
export const damp = (a: number, b: number, lambda: number, dt: number): number =>
  lerp(a, b, 1 - Math.exp(-lambda * dt));

export const TAU = Math.PI * 2;

/** Winkel auf [-π, π] normieren. */
export const wrapAngle = (a: number): number => Math.atan2(Math.sin(a), Math.cos(a));

/**
 * Seitenschlag-Profil einer verzogenen Felge über den Umfang (normiert auf ca. ±1).
 * Wird identisch im Vertex-Shader (webgl/shaders) und für Messuhr und Buchstaben verwendet.
 * Eine breite Welle plus eine lokale Delle – so sieht echter Seitenschlag aus.
 */
export function runoutProfile(a: number): number {
  const d = wrapAngle(a - 2.2);
  return 0.55 * Math.sin(a + 0.4) + 0.28 * Math.sin(2 * a + 1.3) + 0.6 * Math.exp(-d * d * 3.0) - 0.12;
}

/** Deterministischer Zufall (für reproduzierbare Layouts). */
export function seeded(seed: number): () => number {
  let s = seed >>> 0;
  return () => {
    s = (s + 0x6d2b79f5) >>> 0;
    let t = s;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
