import React, {useMemo} from 'react';
import {AbsoluteFill, useCurrentFrame, useVideoConfig} from 'remotion';
import {rand} from '../ease';

/** Floating golden dust — rises slowly, drifts and twinkles. */
export const GoldDust: React.FC<{count?: number; seed?: number; speed?: number; opacity?: number; size?: number; burstAt?: number}> = ({
  count = 90, seed = 7, speed = 1, opacity = 1, size = 1, burstAt,
}) => {
  const frame = useCurrentFrame();
  const {width, height} = useVideoConfig();
  const ps = useMemo(() => {
    const r = rand(seed);
    return Array.from({length: count}, () => ({
      x: r() * width, y: r() * height, s: (1.5 + r() * r() * 7) * size, v: 0.4 + r() * 1.3,
      ph: r() * 6.28, drift: 10 + r() * 30, warm: r(), ang: r() * 6.28, bv: 4 + r() * 22,
    }));
  }, [count, seed, width, height, size]);
  return (
    <AbsoluteFill style={{pointerEvents: 'none', opacity, mixBlendMode: 'screen'}}>
      {ps.map((p, i) => {
        let y = (p.y - frame * p.v * speed + height * 10) % (height + 40) - 20;
        let x = p.x + Math.sin(frame * 0.02 + p.ph) * p.drift;
        let o = 0.35 + 0.65 * Math.abs(Math.sin(frame * 0.07 + p.ph));
        if (burstAt !== undefined && frame >= burstAt) {
          const t = frame - burstAt;
          const d = p.bv * t * Math.exp(-t * 0.03);
          x = width / 2 + Math.cos(p.ang) * d * 3 + (p.x - width / 2) * Math.min(1, t / 90);
          y = height * 0.45 + Math.sin(p.ang) * d * 2 + (p.y - height * 0.45) * Math.min(1, t / 90) - t * 0.5;
          o *= Math.min(1, t / 4);
        }
        const c = p.warm > 0.5 ? '255,226,150' : '255,246,215';
        return (
          <div
            key={i}
            style={{
              position: 'absolute', left: x - p.s * 2, top: y - p.s * 2, width: p.s * 4, height: p.s * 4, borderRadius: '50%',
              background: `radial-gradient(circle, rgba(${c},${o}) 0%, rgba(${c},${o * 0.35}) 30%, rgba(${c},0) 70%)`,
            }}
          />
        );
      })}
    </AbsoluteFill>
  );
};

/** Large soft out-of-focus lights (cinematic bokeh). */
export const Bokeh: React.FC<{count?: number; seed?: number; palette?: string[]; opacity?: number; drift?: number}> = ({
  count = 22, seed = 3, palette = ['255,205,110', '255,120,90', '255,235,180', '120,200,140'], opacity = 0.7, drift = 1,
}) => {
  const frame = useCurrentFrame();
  const {width, height} = useVideoConfig();
  const ps = useMemo(() => {
    const r = rand(seed);
    return Array.from({length: count}, () => ({x: r() * width, y: r() * height, s: 40 + r() * 160, c: palette[Math.floor(r() * palette.length)], ph: r() * 6.28, a: 0.15 + r() * 0.35}));
  }, [count, seed, width, height, palette]);
  return (
    <AbsoluteFill style={{opacity, mixBlendMode: 'screen'}}>
      {ps.map((p, i) => {
        const x = p.x + Math.sin(frame * 0.008 * drift + p.ph) * 40;
        const y = p.y + Math.cos(frame * 0.006 * drift + p.ph) * 30;
        const a = p.a * (0.7 + 0.3 * Math.sin(frame * 0.03 + p.ph));
        return (
          <div
            key={i}
            style={{
              position: 'absolute', left: x - p.s / 2, top: y - p.s / 2, width: p.s, height: p.s, borderRadius: '50%',
              background: `radial-gradient(circle, rgba(${p.c},${a}) 0%, rgba(${p.c},${a * 0.8}) 45%, rgba(${p.c},${a * 0.25}) 62%, rgba(${p.c},0) 70%)`,
            }}
          />
        );
      })}
    </AbsoluteFill>
  );
};

/** Volumetric light rays from a point (cheap: masked conic gradient). */
export const GodRays: React.FC<{x?: string; y?: string; opacity?: number; spin?: number; color?: string; spread?: number}> = ({
  x = '50%', y = '-10%', opacity = 0.5, spin = 0.05, color = '255,226,160', spread = 70,
}) => {
  const frame = useCurrentFrame();
  const rot = frame * spin;
  return (
    <AbsoluteFill style={{opacity, mixBlendMode: 'screen', overflow: 'hidden'}}>
      <div
        style={{
          position: 'absolute', inset: '-50%',
          background: `repeating-conic-gradient(from ${rot}deg at ${x} ${y}, rgba(${color},0.0) 0deg, rgba(${color},0.55) 3deg, rgba(${color},0.0) 7deg, rgba(${color},0.0) 11deg, rgba(${color},0.3) 13deg, rgba(${color},0) 17deg)`,
          WebkitMaskImage: `radial-gradient(ellipse at ${x} ${y}, black 0%, rgba(0,0,0,0.6) ${spread * 0.4}%, transparent ${spread}%)`,
          maskImage: `radial-gradient(ellipse at ${x} ${y}, black 0%, rgba(0,0,0,0.6) ${spread * 0.4}%, transparent ${spread}%)`,
        }}
      />
    </AbsoluteFill>
  );
};

/** The Star of Bethlehem: long-tailed four-point star with halo and flare. */
export const BethlehemStar: React.FC<{x: number; y: number; size: number; intensity?: number; rotate?: number}> = ({x, y, size, intensity = 1, rotate = 0}) => {
  const frame = useCurrentFrame();
  const pulse = 1 + 0.05 * Math.sin(frame * 0.12);
  const s = size * pulse;
  return (
    <div style={{position: 'absolute', left: x, top: y, width: 0, height: 0, opacity: intensity, mixBlendMode: 'screen'}}>
      <div style={{position: 'absolute', left: -s * 2.5, top: -s * 2.5, width: s * 5, height: s * 5, borderRadius: '50%', background: 'radial-gradient(circle, rgba(255,240,200,0.55) 0%, rgba(255,210,120,0.22) 25%, rgba(255,190,90,0) 60%)'}} />
      <svg width={s * 4} height={s * 6} viewBox="-200 -250 400 600" style={{position: 'absolute', left: -s * 2, top: -s * 2.5, transform: `rotate(${rotate}deg)`}}>
        <defs>
          <radialGradient id="bs-core">
            <stop offset="0%" stopColor="#FFFFFF" />
            <stop offset="40%" stopColor="#FFF4CF" />
            <stop offset="100%" stopColor="#F5C95A" stopOpacity={0} />
          </radialGradient>
          <linearGradient id="bs-v" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#FFF6D8" stopOpacity={0} />
            <stop offset="40%" stopColor="#FFF6D8" />
            <stop offset="100%" stopColor="#FFF6D8" stopOpacity={0} />
          </linearGradient>
        </defs>
        <path d="M0 -240 L14 -14 L170 0 L14 14 L0 340 L-14 14 L-170 0 L-14 -14 Z" fill="url(#bs-v)" opacity={0.95} />
        <path d="M0 -90 L6 -6 L90 0 L6 6 L0 90 L-6 6 L-90 0 L-6 -6 Z" fill="#FFFDF2" transform="rotate(45)" opacity={0.7} />
        <circle r={60} fill="url(#bs-core)" />
      </svg>
      {/* horizontal anamorphic streak */}
      <div style={{position: 'absolute', left: -s * 6, top: -2, width: s * 12, height: 4, background: 'linear-gradient(90deg, rgba(255,220,150,0), rgba(255,240,210,0.9), rgba(255,220,150,0))', borderRadius: 4}} />
    </div>
  );
};

/** Subtle lens flare ghosts along a line from a light source through centre. */
export const LensFlare: React.FC<{x: number; y: number; opacity?: number}> = ({x, y, opacity = 0.6}) => {
  const {width, height} = useVideoConfig();
  const cx = width / 2;
  const cy = height / 2;
  const ghosts = [
    {t: 0.4, s: 60, c: '255,200,120', a: 0.18},
    {t: 0.75, s: 26, c: '180,255,200', a: 0.22},
    {t: 1.2, s: 120, c: '255,170,120', a: 0.1},
    {t: 1.5, s: 40, c: '255,230,170', a: 0.2},
    {t: 1.85, s: 180, c: '255,210,150', a: 0.07},
  ];
  return (
    <AbsoluteFill style={{opacity, mixBlendMode: 'screen', pointerEvents: 'none'}}>
      {ghosts.map((g, i) => {
        const gx = x + (cx - x) * g.t;
        const gy = y + (cy - y) * g.t;
        return (
          <div key={i} style={{position: 'absolute', left: gx - g.s / 2, top: gy - g.s / 2, width: g.s, height: g.s, borderRadius: '50%', background: `radial-gradient(circle, rgba(${g.c},${g.a * 0.4}) 0%, rgba(${g.c},${g.a}) 60%, rgba(${g.c},0) 72%)`}} />
        );
      })}
      <div style={{position: 'absolute', left: x - 260, top: y - 260, width: 520, height: 520, borderRadius: '50%', background: 'radial-gradient(circle, rgba(255,240,200,0.35) 0%, rgba(255,200,120,0.08) 40%, rgba(0,0,0,0) 70%)'}} />
    </AbsoluteFill>
  );
};

/** Cinematic vignette + film-like warm grade overlay. */
export const Vignette: React.FC<{strength?: number}> = ({strength = 0.75}) => (
  <AbsoluteFill style={{pointerEvents: 'none', background: `radial-gradient(ellipse at 50% 45%, rgba(0,0,0,0) 45%, rgba(10,2,3,${strength * 0.55}) 78%, rgba(5,0,1,${strength}) 100%)`}} />
);

/** Fine animated film grain (deterministic). */
export const Grain: React.FC<{opacity?: number}> = ({opacity = 0.06}) => {
  const frame = useCurrentFrame();
  const seed = frame % 8;
  return (
    <AbsoluteFill style={{opacity, mixBlendMode: 'overlay', pointerEvents: 'none'}}>
      <svg width="100%" height="100%">
        <filter id={`grain${seed}`}>
          <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves={2} seed={seed} stitchTiles="stitch" />
          <feColorMatrix type="saturate" values="0" />
        </filter>
        <rect width="100%" height="100%" filter={`url(#grain${seed})`} />
      </svg>
    </AbsoluteFill>
  );
};

/** Diagonal light band sweeping across its parent (use inside overflow:hidden). */
export const LightSweep: React.FC<{start: number; duration?: number; width?: number; opacity?: number; angle?: number}> = ({
  start, duration = 30, width = 0.25, opacity = 0.55, angle = 20,
}) => {
  const frame = useCurrentFrame();
  const t = (frame - start) / duration;
  if (t < 0 || t > 1) return null;
  const pos = -0.4 + t * 1.8;
  return (
    <AbsoluteFill style={{pointerEvents: 'none', mixBlendMode: 'screen', overflow: 'hidden'}}>
      <div
        style={{
          position: 'absolute', top: '-50%', bottom: '-50%', left: `${pos * 100}%`, width: `${width * 100}%`, transform: `rotate(${angle}deg)`,
          background: `linear-gradient(90deg, rgba(255,240,200,0) 0%, rgba(255,245,215,${opacity}) 50%, rgba(255,240,200,0) 100%)`,
        }}
      />
    </AbsoluteFill>
  );
};
