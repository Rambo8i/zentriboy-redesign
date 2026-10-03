/**
 * Werkstatt-Umgebung für die Spiegelungen des Laufrads – nach dem Licht der Produktvisualisierung:
 * ein großes Sprossenfenster links, Leuchtstoffröhren unter der Decke, sonst ein dunkler Raum
 * mit Werkbank. Die Lichtflächen sind HDR (Werte > 1), damit Felge, Nabe und Speichen echte
 * Glanzlichter bekommen und das Fensterkreuz als feine Unterbrechung im Glanz erscheint.
 *
 * Als Szene gebaut (wie three/RoomEnvironment) und per PMREM vorgefiltert:
 * keine Textur, kein Download, ein einziger Render beim Start.
 */
import * as THREE from 'three';

export class WorkshopEnvironment extends THREE.Scene {
  private geometries: THREE.BufferGeometry[] = [];
  private materials: THREE.Material[] = [];

  constructor() {
    super();

    // Raum: 16 × 8 × 16, Wände Graphit, Boden etwas wärmer, Decke etwas heller
    const room = new THREE.BoxGeometry(16, 8, 16);
    this.geometries.push(room);
    const wall = (r: number, g: number, b: number) => this.basic(r, g, b, 1, THREE.BackSide);
    this.add(
      new THREE.Mesh(room, [
        wall(0.1, 0.105, 0.103), // rechts
        wall(0.14, 0.15, 0.145), // links (Fensterwand)
        wall(0.22, 0.225, 0.22), // Decke
        wall(0.1, 0.092, 0.082), // Boden
        wall(0.12, 0.125, 0.122), // hinter der Kamera
        wall(0.11, 0.122, 0.115), // Rückwand
      ]),
    );

    // Fenster links: Lichtfläche mit Sprossen davor
    const glass = this.plane(7.2, 4.4, this.basic(0.92, 0.96, 1.0, 9));
    glass.position.set(-7.95, 0.7, -1.2);
    glass.rotation.y = Math.PI / 2;
    this.add(glass);

    const bar = this.basic(0.012, 0.013, 0.013, 1);
    const sash = new THREE.BoxGeometry(0.16, 4.5, 0.16);
    const rail = new THREE.BoxGeometry(0.16, 0.16, 7.3);
    this.geometries.push(sash, rail);
    for (const z of [-3.6, -1.2, 1.2]) {
      const m = new THREE.Mesh(sash, bar);
      m.position.set(-7.85, 0.7, z);
      this.add(m);
    }
    for (const y of [-1.5, 0.7, 2.9]) {
      const m = new THREE.Mesh(rail, bar);
      m.position.set(-7.85, y, -1.2);
      this.add(m);
    }

    // Leuchtstoffröhren unter der Decke, quer zum Raum
    const tube = new THREE.BoxGeometry(0.12, 0.05, 5.5);
    const tubeMat = this.basic(1.0, 0.98, 0.94, 6);
    this.geometries.push(tube);
    for (const x of [-3.2, 0.4, 4]) {
      const m = new THREE.Mesh(tube, tubeMat);
      m.position.set(x, 3.92, -0.5);
      this.add(m);
    }

    // Schwache Aufhellung von rechts hinten, damit die Schattenseite der Felge nicht absäuft
    const fill = this.plane(4, 2.4, this.basic(0.62, 0.66, 0.68, 0.45));
    fill.position.set(7.95, 0.4, -3.5);
    fill.rotation.y = -Math.PI / 2;
    this.add(fill);

    // Hinter der Kamera: ein mattes Hallentor, das die zur Kamera gewandten Flächen weich aufhellt
    const gate = this.plane(10, 5, this.basic(0.8, 0.82, 0.82, 1.8));
    gate.position.set(0.8, 0.2, 7.95);
    gate.rotation.y = Math.PI;
    this.add(gate);

    // Werkbank vor der Rückwand: helle Holzkante, darüber ein signalroter Werkzeugschrank
    const bench = this.plane(9, 0.5, this.basic(0.42, 0.3, 0.18, 0.55));
    bench.position.set(0.5, -1.4, -7.95);
    this.add(bench);
    const cabinet = this.plane(1.4, 1.8, this.basic(0.82, 0.18, 0.06, 0.4));
    cabinet.position.set(4.6, -0.2, -7.94);
    this.add(cabinet);
  }

  private basic(r: number, g: number, b: number, intensity: number, side: THREE.Side = THREE.DoubleSide) {
    const material = new THREE.MeshBasicMaterial({ side, toneMapped: false });
    material.color.setRGB(r * intensity, g * intensity, b * intensity);
    this.materials.push(material);
    return material;
  }

  private plane(w: number, h: number, material: THREE.Material) {
    const geometry = new THREE.PlaneGeometry(w, h);
    this.geometries.push(geometry);
    return new THREE.Mesh(geometry, material);
  }

  dispose(): void {
    this.geometries.forEach((g) => g.dispose());
    this.materials.forEach((m) => m.dispose());
  }
}
