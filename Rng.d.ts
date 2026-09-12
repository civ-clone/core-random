export interface IRng {
  (): number;
  calls(): number;
  restore(seed: number, calls: number): void;
  seed(): number;
}
/**
 * A seeded random number generator that knows how far through its own stream it
 * is, so a saved game can resume the stream rather than restart it.
 *
 * Restarting would mean a save taken before a battle, loaded and replayed, gave
 * a different result — which makes both save/load and replay-based testing
 * untrustworthy.
 *
 * It is callable, so it substitutes directly for the `() => number` parameters
 * the engine already accepts.
 */
export declare const createRng: (seed: number) => IRng;
export default createRng;
