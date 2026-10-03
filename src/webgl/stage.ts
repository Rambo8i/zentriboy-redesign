/**
 * WebGL-Bühne: ein festes, transparentes Canvas über der ganzen Seite (pointer-events: none).
 * Das Laufrad folgt DOM-Ankern (`[data-wheel-anchor]`): Position und Größe kommen aus dem
 * Layout, Blickwinkel aus `data-wheel-view`. So steuert das DOM die 3D-Szene und nicht umgekehrt.
 *
 * Beim Seitenwechsel bleibt das Canvas bestehen (transition:persist). Hat die neue Seite einen
 * Anker, fliegt das Rad über der Blende an seinen neuen Platz.
 */
import * as THREE from 'three';
import { WorkshopEnvironment } from './workshop-env';
import { buildWheel, TIRE_R, type WheelBuild } from './wheel';
import { wheelState, PROBE_ANGLE, effectiveRunout, ensureWheelClock } from './wheel-state';
import { damp } from '@/lib/math';
import { runoutProfile } from '@/lib/math';
import { onTick } from '@/lib/ticker';
import { isFinePointer, prefersReducedMotion, qualityTier } from '@/lib/motion';

/** maximaler Seitenschlag in Radeinheiten (Radius = 1) – bewusst überzeichnet, damit man ihn sieht */
const AMP = 0.07;
const FOV = 26;
const CAM_Z = 12;

type View = { x: number; y: number; z: number };

/**
 * Blickwinkel (Euler-Reihenfolge YXZ): x kippt die Achse zur Kamera (π/2 = frontal),
 * y schwenkt um die Senkrechte (Dreiviertelansicht, damit der Seitenschlag sichtbar wird).
 */
const VIEWS: Record<string, View> = {
  hero: { x: 1.34, y: 0.62, z: 0.06 },
  product: { x: 1.3, y: -0.66, z: -0.08 },
  side: { x: 1.4, y: 1.05, z: 0.02 },
  front: { x: 1.5, y: 0.2, z: 0 },
};

export class Stage {
  private canvas: HTMLCanvasElement;
  private renderer: THREE.WebGLRenderer;
  private scene = new THREE.Scene();
  private camera = new THREE.PerspectiveCamera(FOV, 1, 0.1, 60);
  private outer = new THREE.Group();
  private wheel: WheelBuild;
  private uniforms = { uRunout: { value: 0 } };
  private lvhProbe: HTMLElement;

  private anchor: HTMLElement | null = null;
  private anchorVisible = false;
  private keepTarget = false;
  private flight = false;

  private target = { x: 0, y: 0, s: 0, rx: VIEWS.hero.x, ry: VIEWS.hero.y, rz: VIEWS.hero.z };
  private current = { x: 0, y: 0, s: 0, rx: VIEWS.hero.x, ry: VIEWS.hero.y, rz: VIEWS.hero.z };
  private mouse = { x: 0, y: 0, sx: 0, sy: 0 };
  private width = 0;
  private height = 0;
  private ppu = 1;
  private lastKey = '';
  private reduced = prefersReducedMotion();
  private stopTick: () => void;
  private probe = new THREE.Vector3();

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    const tier = qualityTier();

    this.renderer = new THREE.WebGLRenderer({
      canvas,
      alpha: true,
      antialias: tier !== 'low',
      powerPreference: 'high-performance',
      premultipliedAlpha: true,
    });
    this.renderer.setClearColor(0x000000, 0);
    this.renderer.toneMapping = THREE.NeutralToneMapping;
    this.renderer.toneMappingExposure = 1.05;
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, tier === 'high' ? 1.75 : tier === 'medium' ? 1.35 : 1));

    // Spiegelungen aus einer nachgebauten Werkstatt (Fenster links wie in der Produktvisualisierung)
    const pmrem = new THREE.PMREMGenerator(this.renderer);
    const workshop = new WorkshopEnvironment();
    this.scene.environment = pmrem.fromScene(workshop, 0.02).texture;
    this.scene.environmentIntensity = 1;
    workshop.dispose();
    pmrem.dispose();

    // Führungslicht aus Richtung des Fensters, leicht kühl
    const key = new THREE.DirectionalLight(0xf2f6ff, 1.1);
    key.position.set(-6, 4, 5);
    this.scene.add(key);

    this.wheel = buildWheel(this.uniforms, tier === 'high' ? 'high' : 'low');
    this.outer.rotation.order = 'YXZ';
    this.outer.add(this.wheel.spin);
    this.scene.add(this.outer);
    this.camera.position.set(0, 0, CAM_Z);

    this.lvhProbe = document.createElement('div');
    this.lvhProbe.style.cssText = 'position:fixed;top:0;left:0;width:0;height:100lvh;pointer-events:none;visibility:hidden';
    document.body.appendChild(this.lvhProbe);

    this.resize();
    window.addEventListener('resize', this.resize, { passive: true });
    if (isFinePointer() && !this.reduced) window.addEventListener('pointermove', this.onPointer, { passive: true });
    document.addEventListener('zb:transition-start', this.onTransitionStart);
    document.addEventListener('zb:transition-end', this.onTransitionEnd);
    canvas.addEventListener('webglcontextlost', this.onContextLost);

    ensureWheelClock();
    this.stopTick = onTick(this.tick);
    // Ab jetzt übernimmt WebGL: Die SVG-Rückfallzeichnung blendet aus, das 3D-Rad zieht auf.
    document.documentElement.classList.add('webgl-ready');
  }

  /** Neuen Anker der aktuellen Seite übernehmen (oder keinen). */
  setAnchor(el: HTMLElement | null): void {
    this.anchor = el;
    this.keepTarget = false;
    this.anchorVisible = false;

    if (el) {
      const view = VIEWS[el.dataset.wheelView ?? 'hero'] ?? VIEWS.hero;
      this.target.rx = view.x;
      this.target.ry = view.y;
      this.target.rz = view.z;
      this.measure(el.getBoundingClientRect(), el);
      if (this.current.s < 0.001 || this.reduced) {
        // Erstes Erscheinen: an Ort und Stelle aufziehen, nicht quer über den Bildschirm fliegen.
        this.current.x = this.target.x;
        this.current.y = this.target.y;
        this.current.rx = this.target.rx;
        this.current.ry = this.target.ry + (this.reduced ? 0 : 0.9);
        this.current.rz = this.target.rz;
        if (this.reduced) this.current.s = this.target.s;
      }
    } else {
      this.target.s = 0;
    }
  }

  /** Vor dem Seitentausch: alten Anker loslassen, Position halten. */
  detach(): void {
    this.anchor = null;
    this.keepTarget = true;
  }

  private measure(r: DOMRect, el: HTMLElement) {
    if (!r.width || !r.height) return;
    const scale = parseFloat(el.dataset.wheelScale ?? '1') || 1;
    const size = Math.min(r.width, r.height) * scale;
    this.target.x = (r.left + r.width / 2 - this.width / 2) / this.ppu;
    this.target.y = -(r.top + r.height / 2 - this.height / 2) / this.ppu;
    this.target.s = size / 2 / this.ppu / TIRE_R;
  }

  private resize = () => {
    const w = window.innerWidth;
    const h = Math.max(window.innerHeight, this.lvhProbe.offsetHeight || 0);
    if (w === this.width && h === this.height) return;
    this.width = w;
    this.height = h;
    this.renderer.setSize(w, h, false);
    this.camera.aspect = w / h;
    this.camera.updateProjectionMatrix();
    const visibleHeight = 2 * CAM_Z * Math.tan(THREE.MathUtils.degToRad(FOV / 2));
    this.ppu = h / visibleHeight;
    this.lastKey = '';
  };

  private onPointer = (e: PointerEvent) => {
    this.mouse.x = (e.clientX / this.width) * 2 - 1;
    this.mouse.y = (e.clientY / window.innerHeight) * 2 - 1;
  };

  private onTransitionStart = () => {
    if (this.current.s > 0.01 && (this.anchorVisible || this.flight)) {
      this.flight = true;
      this.canvas.classList.add('is-flight');
    }
  };

  private onTransitionEnd = () => {
    this.canvas.classList.remove('is-flight');
  };

  private onContextLost = (e: Event) => {
    e.preventDefault();
    document.documentElement.classList.remove('webgl-ready');
    this.canvas.style.visibility = 'hidden';
  };

  private tick = (dt: number) => {
    const c = this.current;
    const t = this.target;

    // Sichtbarkeit direkt aus dem Layout (ohne IntersectionObserver-Latenz)
    if (this.anchor) {
      const r = this.anchor.getBoundingClientRect();
      const margin = this.height * 0.25;
      this.anchorVisible = r.width > 0 && r.bottom > -margin && r.top < window.innerHeight + margin;
      if (this.anchorVisible || this.flight) this.measure(r, this.anchor);
    } else if (!this.keepTarget) {
      t.s = 0;
    }

    const follow = this.reduced ? 1000 : this.flight ? 4.2 : 40;
    c.x = damp(c.x, t.x, follow, dt);
    c.y = damp(c.y, t.y, follow, dt);
    c.s = damp(c.s, t.s, this.reduced ? 1000 : this.flight ? 4.2 : t.s > c.s ? 3.2 : 6, dt);
    const turn = this.reduced ? 1000 : 3;
    c.rx = damp(c.rx, t.rx, turn, dt);
    c.ry = damp(c.ry, t.ry, turn, dt);
    c.rz = damp(c.rz, t.rz, turn, dt);

    if (this.flight && Math.abs(c.x - t.x) < 0.01 && Math.abs(c.y - t.y) < 0.01 && Math.abs(c.s - t.s) < 0.004) {
      this.flight = false;
    }

    const m = this.mouse;
    m.sx = damp(m.sx, m.x, 2.5, dt);
    m.sy = damp(m.sy, m.y, 2.5, dt);

    this.outer.position.set(c.x, c.y, 0);
    this.outer.scale.setScalar(Math.max(c.s, 0.0001));
    this.outer.rotation.set(c.rx + m.sy * 0.1, c.ry + m.sx * 0.16, c.rz);
    this.wheel.spin.rotation.y = wheelState.angle;
    const runout = AMP * effectiveRunout();
    this.uniforms.uRunout.value = runout;

    const visible = c.s > 0.002 && (this.anchorVisible || this.flight || this.keepTarget || Math.abs(c.s - t.s) > 0.002);
    this.canvas.style.visibility = visible ? 'visible' : 'hidden';

    this.updateProbe(runout, visible);
    if (!visible) return;

    const key = `${c.x.toFixed(4)}|${c.y.toFixed(4)}|${c.s.toFixed(4)}|${this.outer.rotation.x.toFixed(4)}|${this.outer.rotation.y.toFixed(4)}|${wheelState.angle.toFixed(4)}|${runout.toFixed(5)}`;
    if (key === this.lastKey) return;
    this.lastKey = key;
    this.renderer.render(this.scene, this.camera);
  };

  /** Bildschirmposition des Messpunkts an der Felge (für die Messuhr-Leitung im Hero). */
  private updateProbe(runout: number, visible: boolean) {
    const probe = wheelState.probe;
    if (!visible || !this.anchor?.hasAttribute('data-wheel-probe')) {
      probe.visible = false;
      return;
    }
    const a = PROBE_ANGLE + wheelState.angle;
    this.probe.set(Math.cos(a) * 1.0, runout * runoutProfile(a), Math.sin(a) * 1.0);
    this.wheel.spin.updateMatrixWorld(true);
    this.probe.applyMatrix4(this.wheel.spin.matrixWorld).project(this.camera);
    probe.x = ((this.probe.x + 1) / 2) * this.width;
    probe.y = ((1 - this.probe.y) / 2) * this.height;
    probe.visible = true;
  }

  dispose(): void {
    this.stopTick();
    window.removeEventListener('resize', this.resize);
    window.removeEventListener('pointermove', this.onPointer);
    document.removeEventListener('zb:transition-start', this.onTransitionStart);
    document.removeEventListener('zb:transition-end', this.onTransitionEnd);
    this.canvas.removeEventListener('webglcontextlost', this.onContextLost);
    this.wheel.dispose();
    this.scene.environment?.dispose();
    this.renderer.dispose();
    this.lvhProbe.remove();
  }
}
