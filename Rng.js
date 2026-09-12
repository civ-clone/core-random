"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createRng = void 0;
// mulberry32. Chosen because its state is a single 32-bit integer advanced by a
// fixed increment, which is what makes `restore` below O(1) rather than a replay
// of every draw taken so far.
const INCREMENT = 0x6d2b79f5;
const advance = (state) => {
    let t = state;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return (t ^ (t >>> 14)) >>> 0;
};
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
const createRng = (seed) => {
    const initial = seed >>> 0;
    let state = initial;
    let calls = 0;
    const rng = () => {
        calls += 1;
        state = (state + INCREMENT) >>> 0;
        return advance(state) / 4294967296;
    };
    rng.calls = () => calls;
    rng.seed = () => initial;
    // The state after n draws is `seed + n * INCREMENT` (mod 2^32), so a mid-game
    // position is reachable without replaying the draws. `Math.imul` does the
    // multiply in 32 bits, which matters: at a few million draws the plain
    // product exceeds the range JavaScript numbers hold exactly.
    rng.restore = (restoredSeed, restoredCalls) => {
        state = (restoredSeed + Math.imul(restoredCalls, INCREMENT)) >>> 0;
        calls = restoredCalls;
    };
    return rng;
};
exports.createRng = createRng;
exports.default = exports.createRng;
//# sourceMappingURL=Rng.js.map