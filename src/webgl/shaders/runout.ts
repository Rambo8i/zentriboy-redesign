/**
 * Seitenschlag im Vertex-Shader.
 * Verschiebt Felge, Reifen, Nippel und (anteilig) die Speichen entlang der Achse (lokal Y),
 * abhängig vom Umfangswinkel. Identische Formel wie `runoutProfile` in lib/math.ts.
 */

export const RUNOUT_COMMON = /* glsl */ `
uniform float uRunout;

float zbRunout(float a) {
  float d = atan(sin(a - 2.2), cos(a - 2.2));
  return 0.55 * sin(a + 0.4) + 0.28 * sin(2.0 * a + 1.3) + 0.6 * exp(-d * d * 3.0) - 0.12;
}
`;

/** Ersetzt `#include <project_vertex>`: Instanz-Transform zuerst, dann Verformung im Radraum. */
export const RUNOUT_PROJECT = /* glsl */ `
vec4 zbPos = vec4( transformed, 1.0 );
#ifdef USE_INSTANCING
  zbPos = instanceMatrix * zbPos;
#endif
float zbR = length( zbPos.xz );
float zbW = smoothstep( 0.12, 0.93, zbR );
zbPos.y += uRunout * zbRunout( atan( zbPos.z, zbPos.x ) ) * zbW;
vec4 mvPosition = modelViewMatrix * zbPos;
gl_Position = projectionMatrix * mvPosition;
`;
