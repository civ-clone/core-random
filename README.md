# `@civ-clone/core-random`

A seeded random number generator that tracks how far through its own stream it
is.

```ts
import { instance as rng } from '@civ-clone/core-random';

rng(); // 0.4362...
rng.calls(); // 1
rng.seed(); // whatever it was seeded with
```

Every engine package that needs randomness takes a `() => number` parameter
defaulting to this instance, so a test or a loaded save can substitute its own:

```ts
import { createRng } from '@civ-clone/core-random';

const unit = new Unit(city, player, tile, ruleRegistry, createRng(1));
```

## Why the call count matters

A save that recorded only the seed would *restart* the stream on load, not
resume it. A game saved before a battle, loaded, and replayed would then give a
different result — which makes save/load and replay-based testing
untrustworthy. `restore(seed, calls)` puts the generator back exactly where it
was:

```ts
rng.restore(save.rng.seed, save.rng.calls);
```

That is O(1) rather than a replay of every draw, because mulberry32's state is a
single 32-bit integer advanced by a fixed increment: after `n` draws it is
`seed + n * increment` (mod 2^32).

## One per process, for now

`instance` is a module-level singleton, so two games in one process would
interleave their draws and diverge. That is why every consumer takes the
generator as an injectable parameter rather than importing it directly — Stage 3
of the engine plan gives each `Game` its own generator, and nothing at the call
sites needs to change again when it does.
