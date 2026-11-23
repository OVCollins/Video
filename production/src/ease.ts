import gsap from 'gsap';
import {interpolate} from 'remotion';

// GSAP's easing library, used deterministically (pure functions of progress).
const cache: Record<string, (t: number) => number> = {};
export const E = (name: string) => (cache[name] ??= gsap.parseEase(name) as (t: number) => number);

/** progress 0..1 between frames a and b with a GSAP ease */
export const prog = (frame: number, a: number, b: number, ease = 'power2.out') =>
  E(ease)(interpolate(frame, [a, b], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'}));

export const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

/** deterministic PRNG */
export const rand = (seed: number) => {
  let s = seed >>> 0;
  return () => {
    s = (s + 0x6d2b79f5) >>> 0;
    let t = s;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
};
