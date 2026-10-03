/**
 * Gedämpfte Feder – die Physik einer Messuhrnadel.
 * Halbimplizites Euler-Verfahren mit Unterschritten, stabil auch bei Framedrops.
 */
export class Spring {
  value: number;
  target: number;
  velocity = 0;

  constructor(
    public stiffness = 180,
    public damping = 16,
    initial = 0,
  ) {
    this.value = initial;
    this.target = initial;
  }

  step(dt: number): number {
    const steps = Math.max(1, Math.ceil(dt / (1 / 240)));
    const h = dt / steps;
    for (let i = 0; i < steps; i++) {
      const force = -this.stiffness * (this.value - this.target) - this.damping * this.velocity;
      this.velocity += force * h;
      this.value += this.velocity * h;
    }
    return this.value;
  }

  /** Impuls geben, z. B. beim Loslassen einer Speiche. */
  kick(v: number): void {
    this.velocity += v;
  }

  snap(v: number): void {
    this.value = v;
    this.target = v;
    this.velocity = 0;
  }

  get settled(): boolean {
    return Math.abs(this.velocity) < 1e-4 && Math.abs(this.value - this.target) < 1e-4;
  }
}
