/**
 * Laufrad-Geometrie: Felge (Lathe mit Hohlkammerprofil), Reifen, Nabe,
 * 32 Speichen in 3-fach-Kreuzung (InstancedMesh = 1 Draw Call) und rote Nippel.
 * Achse = lokale Y-Achse. Alle Meshes haben Einheits-Transform, damit der
 * Vertex-Shader im Radraum rechnen kann.
 */
import * as THREE from 'three';
import { RUNOUT_COMMON, RUNOUT_PROJECT } from './shaders/runout';

export const SPOKES = 32;
export const RIM_R = 1.0;
export const TIRE_R = 1.045;
const BED_R = 0.938;
const HUB_R = 0.088;
const FLANGE_Y = 0.132;
const CROSSES = 3;

export type WheelUniforms = { uRunout: { value: number } };

export type WheelBuild = {
  spin: THREE.Group;
  materials: THREE.MeshStandardMaterial[];
  dispose: () => void;
};

/** Gebürstete Metallflächen: Stärke und Richtung des gestreckten Glanzes (0 = Umfangsrichtung, π/2 = quer dazu) */
type Brushed = { anisotropy: number; rotation: number };

function withRunout(mat: THREE.MeshStandardMaterial, uniforms: WheelUniforms) {
  mat.onBeforeCompile = (shader) => {
    shader.uniforms.uRunout = uniforms.uRunout;
    shader.vertexShader = shader.vertexShader
      .replace('#include <common>', `#include <common>\n${RUNOUT_COMMON}`)
      .replace('#include <project_vertex>', RUNOUT_PROJECT);
  };
  mat.customProgramCacheKey = () => 'zb-runout';
  return mat;
}

const v2 = (x: number, y: number) => new THREE.Vector2(x, y);

export function buildWheel(uniforms: WheelUniforms, detail: 'high' | 'low' = 'high'): WheelBuild {
  const spin = new THREE.Group();
  const geometries: THREE.BufferGeometry[] = [];
  const hi = detail === 'high';

  // Hohe Stufe: physikalische Materialien (gebürstetes Aluminium, Gummi mit Sheen),
  // sonst die günstigeren Standardmaterialien mit denselben Grundwerten.
  const metal = (color: number, roughness: number, brushed?: Brushed) =>
    withRunout(
      hi && brushed
        ? new THREE.MeshPhysicalMaterial({
            color,
            metalness: 1,
            roughness,
            anisotropy: brushed.anisotropy,
            anisotropyRotation: brushed.rotation,
            side: THREE.DoubleSide,
          })
        : new THREE.MeshStandardMaterial({ color, metalness: 1, roughness, side: THREE.DoubleSide }),
      uniforms,
    );

  const rimMat = metal(0xd9dcdf, hi ? 0.3 : 0.22, { anisotropy: 0.75, rotation: Math.PI / 2 });
  const spokeMat = metal(0xc9cdd1, 0.28);
  const hubMat = metal(0xb9bdc1, hi ? 0.26 : 0.3, { anisotropy: 0.5, rotation: 0 });
  // Eloxierte Alu-Nippel: metallisch, Farbe im Glanz
  const nippleMat = withRunout(
    new THREE.MeshStandardMaterial({ color: 0xe8421a, metalness: 0.85, roughness: 0.3 }),
    uniforms,
  );
  const tireMat = withRunout(
    hi
      ? new THREE.MeshPhysicalMaterial({
          color: 0x141615,
          metalness: 0,
          roughness: 0.66,
          sheen: 0.6,
          sheenRoughness: 0.55,
          sheenColor: new THREE.Color(0x3a3d3b),
        })
      : new THREE.MeshStandardMaterial({ color: 0x161817, metalness: 0, roughness: 0.74 }),
    uniforms,
  );

  // Felge: Hohlkammerprofil mit Felgenhorn, um die Achse gedreht
  const rimProfile = [
    v2(0.935, -0.011),
    v2(0.946, -0.018),
    v2(0.975, -0.021),
    v2(1.0, -0.019),
    v2(1.006, -0.015),
    v2(1.004, -0.011),
    v2(0.992, -0.0095),
    v2(0.992, 0.0095),
    v2(1.004, 0.011),
    v2(1.006, 0.015),
    v2(1.0, 0.019),
    v2(0.975, 0.021),
    v2(0.946, 0.018),
    v2(0.935, 0.011),
    v2(0.935, -0.011),
  ];
  const rimGeo = new THREE.LatheGeometry(rimProfile, hi ? 192 : 120);
  if (hi) rimGeo.computeTangents(); // Tangente = Umfangsrichtung, Basis für den anisotropen Glanz
  geometries.push(rimGeo);
  spin.add(new THREE.Mesh(rimGeo, rimMat));

  // Reifen
  const tireGeo = new THREE.TorusGeometry(TIRE_R, 0.034, hi ? 16 : 10, hi ? 220 : 140);
  tireGeo.rotateX(Math.PI / 2);
  geometries.push(tireGeo);
  spin.add(new THREE.Mesh(tireGeo, tireMat));

  // Nabe mit zwei Flanschen
  const hubProfile = [
    v2(0.012, -0.2),
    v2(0.012, -0.172),
    v2(0.031, -0.172),
    v2(0.031, -0.152),
    v2(0.1, -0.146),
    v2(0.1, -0.12),
    v2(0.036, -0.114),
    v2(0.029, -0.05),
    v2(0.027, 0),
    v2(0.029, 0.05),
    v2(0.036, 0.114),
    v2(0.1, 0.12),
    v2(0.1, 0.146),
    v2(0.031, 0.152),
    v2(0.031, 0.172),
    v2(0.012, 0.172),
    v2(0.012, 0.2),
  ];
  const hubGeo = new THREE.LatheGeometry(hubProfile, hi ? 64 : 40);
  if (hi) hubGeo.computeTangents();
  geometries.push(hubGeo);
  spin.add(new THREE.Mesh(hubGeo, hubMat));

  // Speichen: 3-fach gekreuzt, abwechselnd links/rechts, ziehend/drückend
  const spokeGeo = new THREE.CylinderGeometry(0.0042, 0.0042, 1, hi ? 6 : 4, 1, true);
  const nippleGeo = new THREE.CylinderGeometry(0.0085, 0.0075, 0.04, hi ? 8 : 6, 1);
  geometries.push(spokeGeo, nippleGeo);

  const spokes = new THREE.InstancedMesh(spokeGeo, spokeMat, SPOKES);
  const nipples = new THREE.InstancedMesh(nippleGeo, nippleMat, SPOKES);
  const up = new THREE.Vector3(0, 1, 0);
  const m = new THREE.Matrix4();
  const q = new THREE.Quaternion();
  const s = new THREE.Vector3();
  const perSide = SPOKES / 2;
  const crossAngle = (CROSSES * Math.PI * 2) / perSide;

  for (let i = 0; i < SPOKES; i++) {
    const left = i % 2 === 0;
    const k = Math.floor(i / 2);
    const rimA = (i / SPOKES) * Math.PI * 2;
    const sign = k % 2 === 0 ? 1 : -1;
    const hubA = rimA + sign * crossAngle;
    const side = left ? 1 : -1;

    const rim = new THREE.Vector3(Math.cos(rimA) * BED_R, side * 0.004, Math.sin(rimA) * BED_R);
    const hub = new THREE.Vector3(Math.cos(hubA) * HUB_R, side * FLANGE_Y, Math.sin(hubA) * HUB_R);
    const dir = rim.clone().sub(hub);
    const len = dir.length();
    dir.normalize();
    q.setFromUnitVectors(up, dir);

    m.compose(hub.clone().add(rim).multiplyScalar(0.5), q, s.set(1, len, 1));
    spokes.setMatrixAt(i, m);

    m.compose(rim.clone().addScaledVector(dir, -0.02), q, s.set(1, 1, 1));
    nipples.setMatrixAt(i, m);
  }
  spokes.instanceMatrix.needsUpdate = true;
  nipples.instanceMatrix.needsUpdate = true;
  spin.add(spokes, nipples);

  const materials = [rimMat, spokeMat, hubMat, nippleMat, tireMat];

  return {
    spin,
    materials,
    dispose: () => {
      geometries.forEach((g) => g.dispose());
      materials.forEach((mat) => mat.dispose());
      spokes.dispose();
      nipples.dispose();
    },
  };
}
