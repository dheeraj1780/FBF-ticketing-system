/** Small deterministic PRNG (FNV-1a seed + xorshift) for decorative, repeatable patterns. */
export function prng(seed: string) {
  let h = 2166136261;
  for (let i = 0; i < seed.length; i++) {
    h ^= seed.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return () => {
    h ^= h << 13;
    h ^= h >>> 17;
    h ^= h << 5;
    return ((h >>> 0) % 1000) / 1000;
  };
}

/** Short pseudo-random hex token derived from a seed (display only). */
export function fakeToken(seed: string, len = 16) {
  const r = prng(seed);
  let s = "";
  for (let i = 0; i < len; i++) s += Math.floor(r() * 16).toString(16);
  return s;
}
