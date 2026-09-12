import { IRng, createRng } from './Rng';

/**
 * The generator every engine package draws from by default.
 *
 * It is seeded from the clock, so an unconfigured game is unpredictable. A test
 * or a loaded save calls `instance.restore(seed, calls)` to take control of it.
 *
 * This is a module-level singleton, which is a deliberate stopgap: it is one
 * generator per process, so two games in one process would interleave their
 * draws and diverge. Stage 3 of the engine plan gives each `Game` its own, and
 * the injection points that take this as a default are what make that possible
 * without touching any of the call sites again.
 */
export const instance: IRng = createRng(Date.now());

export default instance;
