import { createRng } from '../Rng';
import { expect } from 'chai';

describe('Rng', (): void => {
  it('should produce the same stream for the same seed', (): void => {
    const a = createRng(1);
    const b = createRng(1);

    expect(new Array(20).fill(0).map(() => a())).to.deep.equal(
      new Array(20).fill(0).map(() => b())
    );
  });

  it('should produce a different stream for a different seed', (): void => {
    const a = createRng(1);
    const b = createRng(2);

    expect(new Array(20).fill(0).map(() => a())).to.not.deep.equal(
      new Array(20).fill(0).map(() => b())
    );
  });

  it('should only return values in [0, 1)', (): void => {
    const rng = createRng(12345);

    new Array(10000).fill(0).forEach((): void => {
      const value = rng();

      expect(value).to.be.at.least(0);
      expect(value).to.be.below(1);
    });
  });

  it('should count its draws', (): void => {
    const rng = createRng(7);

    expect(rng.calls()).to.equal(0);

    new Array(5).fill(0).forEach(() => rng());

    expect(rng.calls()).to.equal(5);
    expect(rng.seed()).to.equal(7);
  });

  it('should resume a stream from the middle rather than restart it', (): void => {
    const original = createRng(99);
    const first = new Array(50).fill(0).map(() => original());
    const rest = new Array(20).fill(0).map(() => original());

    const resumed = createRng(0);

    resumed.restore(99, 50);

    expect(resumed.calls()).to.equal(50);
    expect(new Array(20).fill(0).map(() => resumed())).to.deep.equal(rest);
    expect(first).to.not.deep.equal(rest);
  });

  it('should resume correctly after enough draws to overflow a 32-bit multiply', (): void => {
    // `seed + calls * increment` exceeds the range JavaScript numbers hold
    // exactly at a few million draws, so `restore` does the multiply in 32 bits.
    const calls = 5_000_000;
    const original = createRng(3);

    original.restore(3, calls);

    const expected = new Array(5).fill(0).map(() => original());
    const resumed = createRng(3);

    resumed.restore(3, calls);

    expect(new Array(5).fill(0).map(() => resumed())).to.deep.equal(expected);
  });

  it('should not interfere with another instance', (): void => {
    const a = createRng(1);
    const b = createRng(1);

    a();
    a();

    expect(a.calls()).to.equal(2);
    expect(b.calls()).to.equal(0);

    const bFirst = b();

    b.restore(1, 0);

    expect(b()).to.equal(bFirst);
    expect(a.calls()).to.equal(2);
  });
});
