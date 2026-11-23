import React, {useMemo} from 'react';
import {useCurrentFrame} from 'remotion';
import {rand} from '../ease';

/* ------------------------------------------------------------------------ */
/* Procedural pine branch: a stem with side twigs, each covered in needles.  */
/* All needles of one tone are merged into a single SVG path (fast).         */
/* Local coordinates: the branch grows along +x from (0,0).                  */
/* ------------------------------------------------------------------------ */
type Pine = {dark: string; mid: string; light: string; stem: string};
const buildPine = (length: number, seed: number, density = 1) => {
  const r = rand(seed);
  const dark: string[] = [];
  const mid: string[] = [];
  const light: string[] = [];
  const stems: string[] = [];
  const twig = (x0: number, y0: number, ang: number, len: number, depth: number) => {
    const bend = (r() - 0.5) * 0.25;
    const x1 = x0 + Math.cos(ang) * len;
    const y1 = y0 + Math.sin(ang) * len;
    stems.push(`M${x0.toFixed(1)} ${y0.toFixed(1)}Q${(x0 + Math.cos(ang + bend) * len * 0.5).toFixed(1)} ${(y0 + Math.sin(ang + bend) * len * 0.5).toFixed(1)} ${x1.toFixed(1)} ${y1.toFixed(1)}`);
    const step = 3.2 / density;
    for (let d = len * 0.06; d < len; d += step) {
      const t = d / len;
      const px = x0 + Math.cos(ang) * d;
      const py = y0 + Math.sin(ang) * d;
      const nl = (depth === 0 ? 30 : 24) * (1 - t * 0.55) * (0.8 + r() * 0.4);
      for (const side of [-1, 1]) {
        const a = ang + side * (0.75 + r() * 0.35) - side * t * 0.2;
        const ex = px + Math.cos(a) * nl;
        const ey = py + Math.sin(a) * nl;
        const seg = `M${px.toFixed(1)} ${py.toFixed(1)}L${ex.toFixed(1)} ${ey.toFixed(1)}`;
        const k = r();
        (k < 0.45 ? dark : k < 0.85 ? mid : light).push(seg);
      }
    }
    if (depth === 0) {
      const n = Math.max(3, Math.round(len / 70));
      for (let i = 1; i <= n; i++) {
        const t = i / (n + 1);
        const bx = x0 + Math.cos(ang) * len * t;
        const by = y0 + Math.sin(ang) * len * t;
        const side = i % 2 ? 1 : -1;
        twig(bx, by, ang + side * (0.55 + r() * 0.3), len * (0.45 - t * 0.22) + 20, 1);
      }
    }
  };
  twig(0, 0, 0, length, 0);
  const p: Pine = {dark: dark.join(''), mid: mid.join(''), light: light.join(''), stem: stems.join('')};
  return p;
};

export const PineBranch: React.FC<{
  length?: number;
  seed?: number;
  x?: number;
  y?: number;
  rotate?: number;
  scale?: number;
  sway?: number; // degrees
  swaySpeed?: number;
  tint?: 'green' | 'dark';
}> = ({length = 260, seed = 1, x = 0, y = 0, rotate = 0, scale = 1, sway = 1.5, swaySpeed = 0.04, tint = 'green'}) => {
  const frame = useCurrentFrame();
  const pine = useMemo(() => buildPine(length, seed), [length, seed]);
  const rot = rotate + Math.sin(frame * swaySpeed + seed) * sway;
  const c = tint === 'green' ? ['#0A3321', '#13583A', '#2A7D52', '#4A3420'] : ['#061A11', '#0B2E1F', '#155038', '#2D2015'];
  return (
    <g transform={`translate(${x} ${y}) rotate(${rot}) scale(${scale})`}>
      <path d={pine.stem} stroke={c[3]} strokeWidth={4} fill="none" strokeLinecap="round" />
      <path d={pine.dark} stroke={c[0]} strokeWidth={3.2} strokeLinecap="round" />
      <path d={pine.mid} stroke={c[1]} strokeWidth={2.8} strokeLinecap="round" />
      <path d={pine.light} stroke={c[2]} strokeWidth={2.2} strokeLinecap="round" />
    </g>
  );
};

/* ------------------------------------------------------------------------ */
/* Christmas ornament bauble (SVG, centred on the hanging point)              */
/* ------------------------------------------------------------------------ */
const ORN = {
  gold: ['#FFF6CF', '#F0C95A', '#B8860B', '#5E4105'],
  red: ['#FFB3B3', '#D42335', '#8A0A17', '#3A0207'],
  green: ['#B9F0CF', '#1F8A57', '#0D4A2E', '#04180F'],
  champagne: ['#FFFFFF', '#F7E7CE', '#C9AE84', '#6B563A'],
};
export const Ornament: React.FC<{
  id: string;
  x: number;
  y: number;
  r: number;
  string?: number;
  color?: keyof typeof ORN;
  phase?: number;
  swing?: number;
}> = ({id, x, y, r, string = 60, color = 'gold', phase = 0, swing = 4}) => {
  const frame = useCurrentFrame();
  const c = ORN[color];
  const a = Math.sin(frame * 0.05 + phase) * swing;
  const gid = `orn-${id}`;
  return (
    <g transform={`translate(${x} ${y}) rotate(${a})`}>
      <defs>
        <radialGradient id={gid} cx="35%" cy="30%" r="75%">
          <stop offset="0%" stopColor={c[0]} />
          <stop offset="25%" stopColor={c[1]} />
          <stop offset="70%" stopColor={c[2]} />
          <stop offset="100%" stopColor={c[3]} />
        </radialGradient>
        <linearGradient id={`${gid}-cap`} x1="0" x2="1">
          <stop offset="0%" stopColor="#7A5A12" />
          <stop offset="50%" stopColor="#FBE7A1" />
          <stop offset="100%" stopColor="#8E6B17" />
        </linearGradient>
      </defs>
      <line x1={0} y1={0} x2={0} y2={string} stroke="#D9B65A" strokeWidth={1.6} opacity={0.85} />
      <rect x={-r * 0.22} y={string - 2} width={r * 0.44} height={r * 0.26} rx={2} fill={`url(#${gid}-cap)`} />
      <circle cx={0} cy={string + r * 1.12} r={r} fill={`url(#${gid})`} />
      {color !== 'gold' && (
        <ellipse cx={0} cy={string + r * 1.12} rx={r * 0.98} ry={r * 0.16} fill="none" stroke="#E9C766" strokeWidth={r * 0.07} opacity={0.85} />
      )}
      <ellipse cx={-r * 0.35} cy={string + r * 0.72} rx={r * 0.22} ry={r * 0.13} fill="white" opacity={0.75} transform={`rotate(-35 ${-r * 0.35} ${string + r * 0.72})`} />
      <circle cx={r * 0.32} cy={string + r * 1.5} r={r * 0.08} fill="white" opacity={0.35} />
    </g>
  );
};

/* ------------------------------------------------------------------------ */
/* Golden Christmas bell, pivoting from its crown; realistic damped swing.    */
/* ------------------------------------------------------------------------ */
export const Bell: React.FC<{
  id: string;
  x: number;
  y: number;
  size: number;
  angle?: number; // current swing angle in degrees (computed by parent)
}> = ({id, x, y, size, angle = 0}) => {
  const s = size / 200;
  const g = `bell-${id}`;
  const clapperA = -angle * 0.6; // clapper lags behind the bell
  return (
    <g transform={`translate(${x} ${y}) rotate(${angle}) scale(${s})`}>
      <defs>
        <linearGradient id={g} x1="0" y1="0" x2="1" y2="0.25">
          <stop offset="0%" stopColor="#6E4C0B" />
          <stop offset="18%" stopColor="#C9971F" />
          <stop offset="38%" stopColor="#FFF3C2" />
          <stop offset="52%" stopColor="#E7BC47" />
          <stop offset="78%" stopColor="#A87812" />
          <stop offset="100%" stopColor="#4D3306" />
        </linearGradient>
        <radialGradient id={`${g}-in`} cx="50%" cy="0%" r="100%">
          <stop offset="0%" stopColor="#3A2604" />
          <stop offset="100%" stopColor="#8D6513" />
        </radialGradient>
      </defs>
      {/* crown loop */}
      <ellipse cx={0} cy={6} rx={14} ry={16} fill="none" stroke={`url(#${g})`} strokeWidth={8} />
      {/* clapper */}
      <g transform={`rotate(${clapperA} 0 40)`}>
        <line x1={0} y1={40} x2={0} y2={196} stroke="#5B3F08" strokeWidth={6} />
        <circle cx={0} cy={200} r={17} fill={`url(#${g})`} />
      </g>
      {/* mouth (inside) */}
      <ellipse cx={0} cy={178} rx={98} ry={20} fill={`url(#${g}-in)`} />
      {/* body */}
      <path
        d="M0 22 C-40 22 -58 50 -60 92 C-62 128 -70 150 -100 172 C-102 182 -90 190 -60 192 L60 192 C90 190 102 182 100 172 C70 150 62 128 60 92 C58 50 40 22 0 22 Z"
        fill={`url(#${g})`}
      />
      {/* lip band */}
      <path d="M-100 172 C-60 196 60 196 100 172" stroke="#FFF0B0" strokeWidth={5} fill="none" opacity={0.7} />
      <path d="M-62 132 C-30 142 30 142 62 132" stroke="#7A560C" strokeWidth={4} fill="none" opacity={0.6} />
      {/* specular */}
      <path d="M-30 40 C-44 70 -46 110 -54 150" stroke="white" strokeWidth={9} strokeLinecap="round" fill="none" opacity={0.45} />
    </g>
  );
};

/** damped pendulum swing helper: returns angle (deg) at frame */
export const swing = (frame: number, start: number, amp: number, period = 46, damp = 0.012, phase = 0) => {
  if (frame < start) return 0;
  const t = frame - start;
  return amp * Math.exp(-t * damp) * Math.sin((2 * Math.PI * t) / period + phase) + Math.sin(frame * 0.05 + phase) * 1.2;
};

/* ------------------------------------------------------------------------ */
/* Red velvet bow                                                             */
/* ------------------------------------------------------------------------ */
export const Bow: React.FC<{id: string; x: number; y: number; size: number; rotate?: number}> = ({id, x, y, size, rotate = 0}) => {
  const s = size / 300;
  const g = `bow-${id}`;
  return (
    <g transform={`translate(${x} ${y}) rotate(${rotate}) scale(${s})`}>
      <defs>
        <radialGradient id={g} cx="40%" cy="35%" r="80%">
          <stop offset="0%" stopColor="#F04355" />
          <stop offset="40%" stopColor="#B3101F" />
          <stop offset="85%" stopColor="#600611" />
          <stop offset="100%" stopColor="#2E0207" />
        </radialGradient>
        <linearGradient id={`${g}-t`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#B3101F" />
          <stop offset="100%" stopColor="#4A040D" />
        </linearGradient>
      </defs>
      {/* tails */}
      <path d="M-10 10 C-40 80 -70 140 -95 200 L-60 190 L-45 225 C-25 150 -5 80 10 20 Z" fill={`url(#${g}-t)`} stroke="#E2B94F" strokeWidth={3} />
      <path d="M10 10 C40 80 70 140 95 200 L60 190 L45 225 C25 150 5 80 -10 20 Z" fill={`url(#${g}-t)`} stroke="#E2B94F" strokeWidth={3} />
      {/* loops */}
      <path d="M0 0 C-60 -90 -160 -80 -150 -10 C-145 40 -60 30 0 0 Z" fill={`url(#${g})`} stroke="#E2B94F" strokeWidth={3} />
      <path d="M0 0 C60 -90 160 -80 150 -10 C145 40 60 30 0 0 Z" fill={`url(#${g})`} stroke="#E2B94F" strokeWidth={3} />
      <path d="M-20 -8 C-60 -50 -110 -50 -120 -20" stroke="#3B0309" strokeWidth={5} fill="none" opacity={0.5} />
      <path d="M20 -8 C60 -50 110 -50 120 -20" stroke="#3B0309" strokeWidth={5} fill="none" opacity={0.5} />
      {/* knot */}
      <ellipse cx={0} cy={2} rx={26} ry={30} fill={`url(#${g})`} stroke="#E2B94F" strokeWidth={3} />
      <ellipse cx={-7} cy={-8} rx={8} ry={6} fill="white" opacity={0.3} />
    </g>
  );
};

/* ------------------------------------------------------------------------ */
/* Draped red velvet ribbon between two points (sagging curve)                */
/* ------------------------------------------------------------------------ */
export const RibbonDrape: React.FC<{id: string; x1: number; y1: number; x2: number; y2: number; sag: number; width?: number}> = ({
  id, x1, y1, x2, y2, sag, width = 26,
}) => {
  const frame = useCurrentFrame();
  const s = sag + Math.sin(frame * 0.04 + x1) * 4;
  const mx = (x1 + x2) / 2;
  const my = (y1 + y2) / 2 + s;
  const g = `rib-${id}`;
  return (
    <g>
      <defs>
        <linearGradient id={g} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#E23A4B" />
          <stop offset="45%" stopColor="#A10E1E" />
          <stop offset="100%" stopColor="#4F040C" />
        </linearGradient>
      </defs>
      <path d={`M${x1} ${y1} Q${mx} ${my} ${x2} ${y2}`} stroke="#E2B94F" strokeWidth={width + 6} fill="none" strokeLinecap="round" />
      <path d={`M${x1} ${y1} Q${mx} ${my} ${x2} ${y2}`} stroke={`url(#${g})`} strokeWidth={width} fill="none" strokeLinecap="round" />
      <path d={`M${x1} ${y1 - width * 0.22} Q${mx} ${my - width * 0.22} ${x2} ${y2 - width * 0.22}`} stroke="#FF8A95" strokeWidth={2} opacity={0.35} fill="none" />
    </g>
  );
};

/* ------------------------------------------------------------------------ */
/* Garland across the top of the frame: pine, ribbons, baubles, bells         */
/* ------------------------------------------------------------------------ */
export const TopGarland: React.FC<{
  width: number;
  y?: number;
  seed?: number;
  bells?: boolean;
  bellStart?: number;
  scale?: number;
  ornaments?: boolean;
  flip?: boolean;
}> = ({width, y = 0, seed = 3, bells = true, bellStart = 0, scale = 1, ornaments = true, flip = false}) => {
  const frame = useCurrentFrame();
  const r = rand(seed);
  const n = Math.ceil(width / (150 * scale)) + 2;
  const branches = Array.from({length: n * 2}, (_, i) => ({
    x: (i % n) * ((width + 200) / n) - 100 + r() * 40,
    y: (i < n ? -10 : 25) * scale + r() * 20,
    rot: (i < n ? 10 : -170) + (r() - 0.5) * 40,
    len: (210 + r() * 90) * scale,
    seed: seed * 100 + i,
  }));
  const orns = ornaments
    ? Array.from({length: Math.round(width / 260)}, (_, i) => ({
        x: (i + 0.5) * (width / Math.round(width / 260)) + (r() - 0.5) * 60,
        string: (40 + r() * 110) * scale,
        r: (20 + r() * 16) * scale,
        color: (['gold', 'red', 'gold', 'champagne', 'red'] as const)[i % 5],
      }))
    : [];
  const cx = width / 2;
  return (
    <g transform={`translate(0 ${y}) ${flip ? `scale(1 -1)` : ''}`}>
      {branches.map((b, i) => (
        <PineBranch key={i} x={b.x} y={b.y} rotate={b.rot} length={b.len} seed={b.seed} sway={1} />
      ))}
      <RibbonDrape id={`g${seed}a`} x1={-40} y1={40 * scale} x2={cx - 120 * scale} y2={50 * scale} sag={70 * scale} />
      <RibbonDrape id={`g${seed}b`} x1={cx + 120 * scale} y1={50 * scale} x2={width + 40} y2={40 * scale} sag={70 * scale} />
      {orns.map((o, i) => (
        <Ornament key={i} id={`g${seed}-${i}`} x={o.x} y={30 * scale} r={o.r} string={o.string} color={o.color} phase={i * 1.7} />
      ))}
      {bells && (
        <>
          <Bell id={`gb${seed}1`} x={cx - 70 * scale} y={30 * scale} size={150 * scale} angle={swing(frame, bellStart, 16, 44, 0.01, 0)} />
          <Bell id={`gb${seed}2`} x={cx + 70 * scale} y={30 * scale} size={150 * scale} angle={swing(frame, bellStart + 6, -16, 46, 0.01, 0.6)} />
          <Bow id={`gbw${seed}`} x={cx} y={36 * scale} size={190 * scale} />
        </>
      )}
    </g>
  );
};

/* ------------------------------------------------------------------------ */
/* Christmas wreath                                                           */
/* ------------------------------------------------------------------------ */
export const Wreath: React.FC<{cx: number; cy: number; radius: number; seed?: number; bellStart?: number}> = ({
  cx, cy, radius, seed = 11, bellStart = 0,
}) => {
  const frame = useCurrentFrame();
  const r = rand(seed);
  const N = 30;
  const items = Array.from({length: N}, (_, i) => {
    const a = (i / N) * Math.PI * 2;
    return {a, len: radius * (0.62 + r() * 0.2), jitter: (r() - 0.5) * radius * 0.08, seed: seed * 50 + i};
  });
  const items2 = Array.from({length: N}, (_, i) => {
    const a = ((i + 0.5) / N) * Math.PI * 2;
    return {a, len: radius * (0.5 + r() * 0.2), jitter: (r() - 0.5) * radius * 0.1, seed: seed * 70 + i};
  });
  const orns = Array.from({length: 14}, (_, i) => {
    const a = (i / 14) * Math.PI * 2 + 0.2;
    const rr = radius * (0.95 + (r() - 0.5) * 0.18);
    return {x: cx + Math.cos(a) * rr, y: cy + Math.sin(a) * rr, r: radius * (0.07 + r() * 0.035), c: (['red', 'gold', 'gold', 'red', 'champagne'] as const)[i % 5]};
  });
  const berries = Array.from({length: 26}, () => {
    const a = r() * Math.PI * 2;
    const rr = radius * (0.85 + r() * 0.3);
    return {x: cx + Math.cos(a) * rr, y: cy + Math.sin(a) * rr, r: radius * 0.022};
  });
  const s = radius / 300;
  return (
    <g>
      {[items, items2].map((arr, k) =>
        arr.map((it, i) => {
          const rr = radius * (k === 0 ? 1.08 : 0.86) + it.jitter;
          const x = cx + Math.cos(it.a) * rr;
          const y = cy + Math.sin(it.a) * rr;
          const rot = (it.a * 180) / Math.PI + 90 + (k === 0 ? -15 : 15);
          return <PineBranch key={`${k}-${i}`} x={x} y={y} rotate={rot} length={it.len} seed={it.seed} scale={1} sway={0.6} tint={k === 0 ? 'dark' : 'green'} />;
        }),
      )}
      {berries.map((b, i) => (
        <circle key={i} cx={b.x} cy={b.y} r={b.r} fill="#C8102E" stroke="#5a0410" strokeWidth={1} />
      ))}
      {orns.map((o, i) => (
        <g key={i} transform={`translate(${o.x} ${o.y - o.r * 1.12})`}>
          <Ornament id={`w${seed}-${i}`} x={0} y={0} r={o.r} string={0} color={o.c} swing={0} />
        </g>
      ))}
      {/* bells hanging at the bottom, bow at the top */}
      <Bell id={`wb${seed}1`} x={cx - 60 * s} y={cy + radius * 0.92} size={120 * s} angle={swing(frame, bellStart, 14, 40, 0.012)} />
      <Bell id={`wb${seed}2`} x={cx + 60 * s} y={cy + radius * 0.92} size={120 * s} angle={swing(frame, bellStart + 5, -14, 42, 0.012, 0.5)} />
      <Bow id={`wbow${seed}`} x={cx} y={cy + radius * 0.94} size={170 * s} />
      <Bow id={`wbowt${seed}`} x={cx} y={cy - radius * 1.02} size={220 * s} />
    </g>
  );
};

/* ------------------------------------------------------------------------ */
/* Christmas tree built from real procedural pine branches, with twinkling    */
/* lights, baubles and a star.                                                */
/* ------------------------------------------------------------------------ */
export const ChristmasTree: React.FC<{x: number; y: number; height: number; seed?: number; lightsOn?: number}> = ({
  x, y, height, seed = 21, lightsOn = 1,
}) => {
  const frame = useCurrentFrame();
  const r = rand(seed);
  const tiers = 13;
  const branches: {x: number; y: number; rot: number; len: number; seed: number}[] = [];
  for (let i = 0; i < tiers; i++) {
    const t = i / (tiers - 1); // 0 top .. 1 bottom
    const by = y - height + height * (0.1 + t * 0.85);
    const halfW = height * (0.05 + t * 0.34);
    for (const side of [-1, 1]) {
      for (let k = 0; k < 2; k++) {
        branches.push({
          x: x + side * (r() * 6),
          y: by + k * 12,
          rot: side === 1 ? 18 + t * 12 + r() * 10 : 180 - (18 + t * 12 + r() * 10),
          len: halfW * (0.95 + r() * 0.2),
          seed: seed * 300 + i * 4 + k * 2 + (side + 1),
        });
      }
    }
    // front-facing branches to fill the middle
    branches.push({x: x + (r() - 0.5) * halfW * 0.6, y: by + 10, rot: 90 + (r() - 0.5) * 40, len: halfW * 0.45, seed: seed * 900 + i});
  }
  const lights = Array.from({length: 46}, (_, i) => {
    const t = 0.12 + r() * 0.85;
    const w = height * (0.05 + t * 0.33);
    return {x: x + (r() * 2 - 1) * w * 0.9, y: y - height + height * (0.08 + t * 0.85) + 20, ph: r() * 6.28, c: i % 3 === 0 ? '#FFD27A' : i % 3 === 1 ? '#FFF1C9' : '#FF9F6B'};
  });
  const baubles = Array.from({length: 12}, (_, i) => {
    const t = 0.2 + (i / 12) * 0.75;
    const w = height * (0.05 + t * 0.33);
    return {x: x + (r() * 2 - 1) * w * 0.75, y: y - height + height * (0.08 + t * 0.85) + 26, c: (['red', 'gold'] as const)[i % 2]};
  });
  return (
    <g>
      <rect x={x - height * 0.03} y={y - 10} width={height * 0.06} height={height * 0.08} fill="#3B2412" />
      {branches.map((b, i) => (
        <PineBranch key={i} x={b.x} y={b.y} rotate={b.rot} length={b.len} seed={b.seed} sway={0.5} />
      ))}
      {baubles.map((b, i) => (
        <Ornament key={i} id={`t${seed}-${i}`} x={b.x} y={b.y - 22} r={height * 0.022} string={8} color={b.c} swing={1} phase={i} />
      ))}
      {lights.map((l, i) => {
        const tw = 0.55 + 0.45 * Math.sin(frame * 0.18 + l.ph);
        return (
          <g key={i} opacity={lightsOn * tw}>
            <circle cx={l.x} cy={l.y} r={height * 0.014} fill={l.c} opacity={0.22} />
            <circle cx={l.x} cy={l.y} r={height * 0.006} fill="#FFFBEA" />
          </g>
        );
      })}
      <StarShape cx={x} cy={y - height * 0.95} r={height * 0.06} glow={lightsOn} />
    </g>
  );
};

export const StarShape: React.FC<{cx: number; cy: number; r: number; glow?: number}> = ({cx, cy, r, glow = 1}) => {
  const pts = Array.from({length: 10}, (_, i) => {
    const a = -Math.PI / 2 + (i * Math.PI) / 5;
    const rr = i % 2 ? r * 0.42 : r;
    return `${(cx + Math.cos(a) * rr).toFixed(1)},${(cy + Math.sin(a) * rr).toFixed(1)}`;
  }).join(' ');
  return (
    <g>
      <defs>
        <radialGradient id={`sg-${Math.round(cx)}-${Math.round(cy)}`}>
          <stop offset="0%" stopColor="#FFF3C4" stopOpacity={0.85} />
          <stop offset="35%" stopColor="#FFD77A" stopOpacity={0.35} />
          <stop offset="100%" stopColor="#FFC85A" stopOpacity={0} />
        </radialGradient>
      </defs>
      <circle cx={cx} cy={cy} r={r * 2.6} fill={`url(#sg-${Math.round(cx)}-${Math.round(cy)})`} opacity={glow} style={{mixBlendMode: 'screen'}} />
      <polygon points={pts} fill="#F5CE5A" stroke="#FFF3C4" strokeWidth={2} />
    </g>
  );
};
