declare module "canvas-confetti" {
  interface Options {
    particleCount?: number;
    spread?: number;
    angle?: number;
    origin?: { x?: number; y?: number };
    colors?: string[];
    startVelocity?: number;
    gravity?: number;
    ticks?: number;
    decay?: number;
  }

  function confetti(options?: Options): Promise<null>;
  export default confetti;
}
