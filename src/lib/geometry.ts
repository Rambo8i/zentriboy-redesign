/**
 * Geometrie für die technischen Zeichnungen (läuft beim Build in Astro und im Browser).
 * Konturen sind an die echten Werkstücke angelehnt (sechsarmiges Sternteil aus den Werkstattfotos).
 */

export type Pt = { x: number; y: number };

const round = (n: number) => Math.round(n * 100) / 100;

/** Sechsarmiges Sternteil: r(θ) = R · (r0 + (1 − r0) · lobe(θ)) */
export function starContour(cx: number, cy: number, R: number, samples = 360, r0 = 0.46, sharp = 2.4, arms = 6): Pt[] {
  const pts: Pt[] = [];
  for (let i = 0; i < samples; i++) {
    const t = (i / samples) * Math.PI * 2 - Math.PI / 2;
    const lobe = Math.pow(0.5 + 0.5 * Math.cos(arms * (t + Math.PI / 2)), sharp);
    const r = R * (r0 + (1 - r0) * lobe);
    pts.push({ x: cx + Math.cos(t) * r, y: cy + Math.sin(t) * r });
  }
  return pts;
}

/** Radial versetzte Kontur (für Schrupp-Bahnen um das Sternteil). */
export function offsetStar(cx: number, cy: number, R: number, d: number, samples = 360): Pt[] {
  return starContour(cx, cy, R, samples).map((p) => {
    const dx = p.x - cx;
    const dy = p.y - cy;
    const len = Math.hypot(dx, dy) || 1;
    return { x: p.x + (dx / len) * d, y: p.y + (dy / len) * d };
  });
}

/** Zahnrad mit trapezförmigen Zähnen (Erodierkontur). */
export function gearContour(cx: number, cy: number, rRoot: number, rTip: number, teeth: number, perTooth = 24): Pt[] {
  const pts: Pt[] = [];
  const total = teeth * perTooth;
  for (let i = 0; i < total; i++) {
    const t = (i / total) * Math.PI * 2;
    const phase = ((t / (Math.PI * 2)) * teeth) % 1;
    // Profil pro Zahnteilung: Fuß – Flanke – Kopf – Flanke – Fuß
    let k: number;
    if (phase < 0.18) k = 0;
    else if (phase < 0.34) k = (phase - 0.18) / 0.16;
    else if (phase < 0.62) k = 1;
    else if (phase < 0.78) k = 1 - (phase - 0.62) / 0.16;
    else k = 0;
    const eased = k * k * (3 - 2 * k);
    const r = rRoot + (rTip - rRoot) * eased;
    pts.push({ x: cx + Math.cos(t) * r, y: cy + Math.sin(t) * r });
  }
  return pts;
}

/**
 * Formprofil für das Diaformschleifen: Fase, Radius, Absatz, V-Nut, Radius.
 * Koordinaten in einer 0…1-Einheit, Breite 1, Höhe ca. 0,42.
 */
export function formProfile(): Pt[] {
  const pts: Pt[] = [];
  const line = (a: Pt, b: Pt, n = 12) => {
    for (let i = 0; i < n; i++) pts.push({ x: a.x + ((b.x - a.x) * i) / n, y: a.y + ((b.y - a.y) * i) / n });
  };
  const arc = (c: Pt, r: number, a0: number, a1: number, n = 18) => {
    for (let i = 0; i < n; i++) {
      const a = a0 + ((a1 - a0) * i) / n;
      pts.push({ x: c.x + Math.cos(a) * r, y: c.y + Math.sin(a) * r });
    }
  };
  line({ x: 0, y: 0.42 }, { x: 0, y: 0.16 }, 10);
  line({ x: 0, y: 0.16 }, { x: 0.1, y: 0.06 }, 10); // Fase 45°
  line({ x: 0.1, y: 0.06 }, { x: 0.24, y: 0.06 }, 10);
  arc({ x: 0.24, y: 0.14 }, 0.08, -Math.PI / 2, 0, 16); // Radius
  line({ x: 0.32, y: 0.14 }, { x: 0.32, y: 0.24 }, 8); // Absatz
  line({ x: 0.32, y: 0.24 }, { x: 0.44, y: 0.24 }, 10);
  line({ x: 0.44, y: 0.24 }, { x: 0.52, y: 0.36 }, 10); // V-Nut
  line({ x: 0.52, y: 0.36 }, { x: 0.6, y: 0.24 }, 10);
  line({ x: 0.6, y: 0.24 }, { x: 0.7, y: 0.24 }, 8);
  arc({ x: 0.7, y: 0.14 }, 0.1, Math.PI / 2, 0, 18); // Radius
  arc({ x: 0.9, y: 0.14 }, 0.1, Math.PI, Math.PI * 1.5, 18); // Gegenradius
  line({ x: 0.9, y: 0.04 }, { x: 1, y: 0.04 }, 8);
  line({ x: 1, y: 0.04 }, { x: 1, y: 0.42 }, 10);
  pts.push({ x: 1, y: 0.42 });
  return pts;
}

export function toPath(points: Pt[], close = false): string {
  if (!points.length) return '';
  const [first, ...rest] = points;
  return `M${round(first.x)} ${round(first.y)}${rest.map((p) => `L${round(p.x)} ${round(p.y)}`).join('')}${close ? 'Z' : ''}`;
}

export function scalePoints(points: Pt[], sx: number, sy: number, ox = 0, oy = 0): Pt[] {
  return points.map((p) => ({ x: ox + p.x * sx, y: oy + p.y * sy }));
}

/** Kumulierte Bogenlänge (für gleichmäßige Bewegung entlang einer Polylinie). */
export function arcLengths(points: Pt[], close = false): { lengths: number[]; total: number } {
  const lengths = [0];
  let total = 0;
  const n = close ? points.length + 1 : points.length;
  for (let i = 1; i < n; i++) {
    const a = points[i - 1];
    const b = points[i % points.length];
    total += Math.hypot(b.x - a.x, b.y - a.y);
    lengths.push(total);
  }
  return { lengths, total };
}

/** Punkt auf einer Polylinie bei Anteil t (0…1) der Gesamtlänge. */
export function pointAt(points: Pt[], lengths: number[], total: number, t: number, close = false): Pt & { index: number } {
  const target = Math.min(Math.max(t, 0), 1) * total;
  let lo = 0;
  let hi = lengths.length - 1;
  while (lo < hi) {
    const mid = (lo + hi) >> 1;
    if (lengths[mid] < target) lo = mid + 1;
    else hi = mid;
  }
  const i = Math.max(1, lo);
  const a = points[(i - 1) % points.length];
  const b = points[i % points.length];
  const seg = lengths[i] - lengths[i - 1] || 1;
  const k = (target - lengths[i - 1]) / seg;
  void close;
  return { x: a.x + (b.x - a.x) * k, y: a.y + (b.y - a.y) * k, index: i };
}
