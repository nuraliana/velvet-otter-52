// Twin Peeks — a small seeded random generator (mulberry32) so scene details
// that are sprinkled (stars, leaves, flowers) are stable from run to run.

// A deterministic PRNG: the same seed always yields the same sequence.
export function mulberry32(seed) {
  let a = seed >>> 0;
  return function next() {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// A value in [min, max) from the generator.
export function range(rng, min, max) {
  return min + rng() * (max - min);
}

// A whole number in [min, max] from the generator.
export function int(rng, min, max) {
  return min + Math.floor(rng() * (max - min + 1));
}

// One element of an array, picked by the generator.
export function pick(rng, arr) {
  return arr[Math.floor(rng() * arr.length)];
}
