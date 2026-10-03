/**
 * Prüflupe (WebGL, ohne Three.js): Ein einziges Canvas legt sich über das Foto unter dem Zeiger.
 * Das entsättigte Bild bekommt rund um den Zeiger seine Farbe zurück, dazu eine feine Welle und
 * ein RGB-Versatz entlang der Zeigergeschwindigkeit. Nur Desktop, feiner Zeiger, erlaubte Bewegung.
 */
import { gsap } from '@/lib/gsap';
import { onTick } from '@/lib/ticker';
import { damp } from '@/lib/math';
import type { Cleanup } from '@/lib/lifecycle';

const VERT = /* glsl */ `
attribute vec2 aPos;
varying vec2 vUv;
void main() {
  vUv = aPos * 0.5 + 0.5;
  vUv.y = 1.0 - vUv.y;
  gl_Position = vec4(aPos, 0.0, 1.0);
}`;

const FRAG = /* glsl */ `
precision mediump float;
varying vec2 vUv;
uniform sampler2D uTex;
uniform vec2 uMouse;
uniform vec2 uVel;
uniform float uStrength;
uniform float uTime;
uniform float uAspect;

void main() {
  vec2 d = vUv - uMouse;
  d.x *= uAspect;
  float dist = length(d);
  float ripple = sin(dist * 34.0 - uTime * 5.0) * exp(-dist * 6.0) * 0.009 * uStrength;
  vec2 uv = vUv + normalize(d + 1e-5) * ripple;
  vec2 shift = uVel * 0.018 * uStrength;
  vec3 col = vec3(
    texture2D(uTex, uv + shift).r,
    texture2D(uTex, uv).g,
    texture2D(uTex, uv - shift).b
  );
  float lum = dot(col, vec3(0.299, 0.587, 0.114));
  vec3 gray = vec3(lum * 1.04);
  float lens = smoothstep(0.34, 0.02, dist) * uStrength;
  gl_FragColor = vec4(mix(gray, col, lens), 1.0);
}`;

function compile(gl: WebGLRenderingContext, type: number, src: string) {
  const s = gl.createShader(type)!;
  gl.shaderSource(s, src);
  gl.compileShader(s);
  if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(s) ?? 'Shader');
  return s;
}

export function createLoupe(items: HTMLElement[]): Cleanup {
  const canvas = document.createElement('canvas');
  canvas.className = 'loupe';
  canvas.setAttribute('aria-hidden', 'true');
  canvas.style.cssText = 'position:fixed;left:0;top:0;pointer-events:none;opacity:0;z-index:4;';
  document.body.appendChild(canvas);

  const gl = canvas.getContext('webgl', { premultipliedAlpha: false, antialias: false });
  if (!gl) {
    canvas.remove();
    return () => {};
  }

  const prog = gl.createProgram()!;
  gl.attachShader(prog, compile(gl, gl.VERTEX_SHADER, VERT));
  gl.attachShader(prog, compile(gl, gl.FRAGMENT_SHADER, FRAG));
  gl.linkProgram(prog);
  gl.useProgram(prog);

  const buf = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, buf);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);
  const aPos = gl.getAttribLocation(prog, 'aPos');
  gl.enableVertexAttribArray(aPos);
  gl.vertexAttribPointer(aPos, 2, gl.FLOAT, false, 0, 0);

  const u = {
    mouse: gl.getUniformLocation(prog, 'uMouse'),
    vel: gl.getUniformLocation(prog, 'uVel'),
    strength: gl.getUniformLocation(prog, 'uStrength'),
    time: gl.getUniformLocation(prog, 'uTime'),
    aspect: gl.getUniformLocation(prog, 'uAspect'),
  };

  const tex = gl.createTexture();
  gl.bindTexture(gl.TEXTURE_2D, tex);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);

  let current: HTMLImageElement | null = null;
  const mouse = { x: 0.5, y: 0.5, sx: 0.5, sy: 0.5, vx: 0, vy: 0 };
  const state = { strength: 0 };
  let time = 0;
  let stopTick: Cleanup | null = null;
  const dpr = Math.min(window.devicePixelRatio || 1, 2);

  const render = (dt: number) => {
    time += dt;
    if (!current) return;
    const r = current.getBoundingClientRect();
    const w = Math.max(1, Math.round(r.width * dpr));
    const h = Math.max(1, Math.round(r.height * dpr));
    if (canvas.width !== w || canvas.height !== h) {
      canvas.width = w;
      canvas.height = h;
      gl.viewport(0, 0, w, h);
    }
    canvas.style.width = `${r.width}px`;
    canvas.style.height = `${r.height}px`;
    canvas.style.transform = `translate3d(${r.left}px, ${r.top}px, 0)`;

    const px = mouse.sx;
    const py = mouse.sy;
    mouse.sx = damp(mouse.sx, mouse.x, 10, dt);
    mouse.sy = damp(mouse.sy, mouse.y, 10, dt);
    mouse.vx = damp(mouse.vx, (mouse.sx - px) / Math.max(dt, 0.001), 6, dt);
    mouse.vy = damp(mouse.vy, (mouse.sy - py) / Math.max(dt, 0.001), 6, dt);

    gl.uniform2f(u.mouse, mouse.sx, mouse.sy);
    gl.uniform2f(u.vel, Math.max(-1, Math.min(1, mouse.vx)), Math.max(-1, Math.min(1, mouse.vy)));
    gl.uniform1f(u.strength, state.strength);
    gl.uniform1f(u.time, time);
    gl.uniform1f(u.aspect, r.width / Math.max(1, r.height));
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);

    if (state.strength < 0.001 && !hovering) stop();
  };

  const start = () => {
    if (!stopTick) stopTick = onTick(render);
  };
  const stop = () => {
    stopTick?.();
    stopTick = null;
    current = null;
    canvas.style.opacity = '0';
  };

  let hovering = false;

  const enter = (item: HTMLElement) => (e: PointerEvent) => {
    if (e.pointerType !== 'mouse') return;
    const img = item.querySelector('img');
    if (!img || !img.complete || !img.naturalWidth) return;
    hovering = true;
    if (current !== img) {
      current = img;
      gl.bindTexture(gl.TEXTURE_2D, tex);
      gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, false);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, img);
    }
    canvas.style.opacity = '1';
    gsap.to(state, { strength: 1, duration: 0.6, ease: 'zb.out', overwrite: true });
    start();
  };

  const move = (item: HTMLElement) => (e: PointerEvent) => {
    const img = item.querySelector('img');
    if (!img) return;
    const r = img.getBoundingClientRect();
    mouse.x = (e.clientX - r.left) / r.width;
    mouse.y = (e.clientY - r.top) / r.height;
  };

  const leave = () => {
    hovering = false;
    gsap.to(state, { strength: 0, duration: 0.5, ease: 'zb.out', overwrite: true });
  };

  const unbind = items.map((item) => {
    const onEnter = enter(item);
    const onMove = move(item);
    item.addEventListener('pointerenter', onEnter);
    item.addEventListener('pointermove', onMove);
    item.addEventListener('pointerleave', leave);
    return () => {
      item.removeEventListener('pointerenter', onEnter);
      item.removeEventListener('pointermove', onMove);
      item.removeEventListener('pointerleave', leave);
    };
  });

  return () => {
    unbind.forEach((f) => f());
    stopTick?.();
    gsap.killTweensOf(state);
    gl.deleteTexture(tex);
    gl.deleteBuffer(buf);
    gl.deleteProgram(prog);
    gl.getExtension('WEBGL_lose_context')?.loseContext();
    canvas.remove();
  };
}
