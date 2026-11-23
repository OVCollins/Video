import React from 'react';
import {AbsoluteFill, Img, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';
import {COLORS, FONTS} from '../theme';
import {prog} from '../ease';
import {GoldText, MaskReveal, Eyebrow} from './Text';
import {LightSweep, GoldDust, Bokeh, Vignette} from './Light';
import {PineBranch, Ornament, Bow} from './Decor';

export type Person = {
  photo: string;
  objectPosition: string;
  prefix?: string; // honorific line
  name: string; // main name line
  epithet?: string; // e.g. "The Elect of God"
  title: string; // official on-screen designation
};

export const PEOPLE: Record<string, Person> = {
  leader: {
    photo: 'assets/people/unuefe-ikhuiwu.jpg', objectPosition: '50% 18%',
    prefix: 'SENIOR APOSTLE (DR)', name: 'D.E.O. UNUEFE IKHUIWU', epithet: 'The Elect of God',
    title: "Spiritual Leader and General Overseer, Christ's Chosen Church of God Int'l",
  },
  oguibe: {photo: 'assets/people/samuel-oguibe.jpg', objectPosition: '50% 22%', prefix: 'APOSTLE', name: 'SAMUEL OGUIBE', title: 'Featured Minister'},
  ehiliz: {photo: 'assets/people/ehiliz.jpg', objectPosition: '52% 30%', name: 'EHILIZ', title: 'Guest Artiste'},
  overo: {photo: 'assets/people/frank-overo.jpg', objectPosition: '50% 14%', prefix: 'ELDER', name: 'FRANK OVERO', title: 'Lagos Area Choir Master'},
  chairman: {photo: 'assets/people/godwin-ehigiamusoe.jpg', objectPosition: '46% 22%', prefix: 'DEACON COUN.', name: 'GODWIN EHIGIAMUSOE', title: 'Chairman, Planning Committee'},
  announcer: {photo: 'assets/people/kennedy-ogbeide.jpg', objectPosition: '50% 18%', prefix: 'ELDER', name: 'KENNEDY OGBEIDE', title: 'Secretary, Planning Committee'},
};

/** Arch-topped gilded portrait frame. The photograph is never distorted
 * (object-fit: cover) — only a slow, subtle push-in. */
export const PortraitFrame: React.FC<{person: Person; w: number; h: number; at: number; style?: React.CSSProperties; from?: 'left' | 'right' | 'below'}> = ({
  person, w, h, at, style, from = 'below',
}) => {
  const frame = useCurrentFrame();
  const p = prog(frame, at, at + 34, 'expo.out');
  const push = 1.1 - 0.08 * prog(frame, at, at + 150, 'sine.out');
  const dx = from === 'left' ? -80 : from === 'right' ? 80 : 0;
  const dy = from === 'below' ? 60 : 0;
  const float = Math.sin((frame - at) * 0.035) * 5;
  const border = Math.max(8, w * 0.022);
  const radius = `${w / 2}px ${w / 2}px ${w * 0.04}px ${w * 0.04}px`;
  return (
    <div
      style={{
        position: 'absolute', width: w, height: h, opacity: p,
        transform: `translate(${dx * (1 - p)}px, ${dy * (1 - p) + float}px) scale(${0.94 + 0.06 * p})`, ...style,
      }}
    >
      {/* halo */}
      <div style={{position: 'absolute', left: -w * 0.45, top: -h * 0.3, width: w * 1.9, height: h * 1.5, borderRadius: '50%', background: 'radial-gradient(ellipse, rgba(255,214,130,0.38) 0%, rgba(255,190,90,0.12) 40%, rgba(0,0,0,0) 68%)'}} />
      {/* gilded frame */}
      <div
        style={{
          position: 'absolute', inset: 0, borderRadius: radius, padding: border,
          background: 'linear-gradient(135deg, #6E4C0B 0%, #E8C25A 18%, #FFF3C2 30%, #C9971F 48%, #7A560C 62%, #F2D57E 80%, #8D6513 100%)',
          boxShadow: '0 30px 60px rgba(0,0,0,0.65), 0 0 0 2px rgba(255,240,190,0.25)',
        }}
      >
        <div style={{position: 'relative', width: '100%', height: '100%', borderRadius: radius, overflow: 'hidden', background: '#111', boxShadow: 'inset 0 0 0 3px rgba(60,35,5,0.9)'}}>
          <Img
            src={staticFile(person.photo)}
            style={{width: '100%', height: '100%', objectFit: 'cover', objectPosition: person.objectPosition, transform: `scale(${push})`, transformOrigin: person.objectPosition}}
          />
          {/* inner shading so the photo sits inside the frame */}
          <div style={{position: 'absolute', inset: 0, boxShadow: `inset 0 0 ${w * 0.08}px rgba(0,0,0,0.55)`, borderRadius: radius}} />
          <LightSweep start={at + 16} duration={40} opacity={0.35} width={0.3} />
        </div>
      </div>
      {/* keystone star */}
      <svg width={w * 0.14} height={w * 0.14} viewBox="-10 -10 20 20" style={{position: 'absolute', left: w * 0.43, top: -w * 0.07}}>
        <path d="M0 -10 L2.2 -2.2 L10 0 L2.2 2.2 L0 10 L-2.2 2.2 L-10 0 L-2.2 -2.2 Z" fill="#FFF1C2" />
      </svg>
    </div>
  );
};

const fitSize = (text: string, max: number, maxWidth: number, k = 0.78) => Math.min(max, maxWidth / (text.length * k));

/** Consistent nameplate: honorific / NAME / epithet / rule / official title */
export const Nameplate: React.FC<{person: Person; at: number; width: number; align?: 'left' | 'center'; scale?: number}> = ({person, at, width, align = 'left', scale = 1}) => {
  const frame = useCurrentFrame();
  const nameSize = fitSize(person.name, 92 * scale, width);
  const rule = prog(frame, at + 10, at + 40, 'power3.inOut');
  const ta = align;
  return (
    <div style={{width, textAlign: ta}}>
      {person.prefix && (
        <MaskReveal at={at}>
          <div style={{fontFamily: FONTS.sans, fontWeight: 600, fontSize: 34 * scale, letterSpacing: 7 * scale, color: COLORS.goldLight, textShadow: '0 2px 10px rgba(0,0,0,0.85)'}}>{person.prefix}</div>
        </MaskReveal>
      )}
      <MaskReveal at={at + 5} dur={26}>
        <GoldText size={nameSize} font={FONTS.sans} weight={800} spacing={nameSize * 0.04} sweepAt={at + 30} glow={0.3}>
          {person.name}
        </GoldText>
      </MaskReveal>
      {person.epithet && (
        <MaskReveal at={at + 12}>
          <div style={{fontFamily: FONTS.serif, fontStyle: 'italic', fontWeight: 600, fontSize: 40 * scale, color: COLORS.champagne, textShadow: '0 2px 10px rgba(0,0,0,0.8)'}}>{person.epithet}</div>
        </MaskReveal>
      )}
      <div style={{height: 3, margin: `${14 * scale}px ${ta === 'center' ? 'auto' : '0'}`, width: width * 0.62 * rule, background: `linear-gradient(90deg, ${ta === 'center' ? 'rgba(212,175,55,0),' : ''} ${COLORS.gold}, ${COLORS.goldLight}, rgba(212,175,55,0))`}} />
      <MaskReveal at={at + 18} dur={26}>
        <div style={{fontFamily: FONTS.sans, fontWeight: 500, fontSize: 31 * scale, lineHeight: 1.35, letterSpacing: 0.5, color: COLORS.white, textShadow: '0 2px 12px rgba(0,0,0,0.9)', maxWidth: width}}>
          {person.title}
        </div>
      </MaskReveal>
    </div>
  );
};

/** Theatre spotlight cone from above. */
export const Spotlight: React.FC<{x: number; topWidth?: number; bottomWidth?: number; opacity?: number; at?: number}> = ({x, topWidth = 160, bottomWidth = 900, opacity = 0.35, at = 0}) => {
  const frame = useCurrentFrame();
  const {height} = useVideoConfig();
  const p = prog(frame, at, at + 20, 'power2.out');
  const flick = 0.95 + 0.05 * Math.sin(frame * 0.3);
  return (
    <div
      style={{
        position: 'absolute', left: x - bottomWidth / 2, top: 0, width: bottomWidth, height, mixBlendMode: 'screen', opacity: opacity * p * flick,
        clipPath: `polygon(${50 - (topWidth / bottomWidth) * 50}% 0, ${50 + (topWidth / bottomWidth) * 50}% 0, 100% 100%, 0 100%)`,
        background: 'linear-gradient(180deg, rgba(255,236,190,0.95) 0%, rgba(255,220,160,0.35) 55%, rgba(255,210,150,0) 100%)',
      }}
    />
  );
};

export type Backdrop = 'velvet' | 'evergreen' | 'gold' | 'music';

export const PersonBackdrop: React.FC<{kind: Backdrop; seed?: number}> = ({kind, seed = 1}) => {
  const frame = useCurrentFrame();
  const {width, height} = useVideoConfig();
  const bg: Record<Backdrop, string> = {
    velvet: `radial-gradient(ellipse at 50% 30%, #7A0C19 0%, #4A0510 45%, #1A0206 100%)`,
    evergreen: `radial-gradient(ellipse at 50% 35%, #145A3C 0%, #0A3323 45%, #03140D 100%)`,
    gold: `radial-gradient(ellipse at 50% 35%, #6B4A12 0%, #3C2707 45%, #140C02 100%)`,
    music: `radial-gradient(ellipse at 50% 35%, #6E0B18 0%, #3B0410 50%, #12020A 100%)`,
  };
  return (
    <AbsoluteFill style={{background: bg[kind]}}>
      {/* velvet folds */}
      {(kind === 'velvet' || kind === 'music') && (
        <AbsoluteFill style={{opacity: 0.35, background: `repeating-linear-gradient(90deg, rgba(0,0,0,0.0) 0px, rgba(0,0,0,0.45) ${width / 18}px, rgba(255,120,130,0.10) ${width / 11}px, rgba(0,0,0,0.0) ${width / 8}px)`, transform: `translateX(${Math.sin(frame * 0.01) * 20}px)`}} />
      )}
      {kind === 'gold' && <AbsoluteFill style={{opacity: 0.25, background: `repeating-radial-gradient(circle at 50% 40%, rgba(255,220,140,0.15) 0px, rgba(0,0,0,0) 3px, rgba(0,0,0,0) 40px)`}} />}
      {kind === 'music' && <MusicStaff seed={seed} />}
      <Bokeh count={16} seed={seed + 40} opacity={0.5} />
      <GoldDust count={55} seed={seed + 9} opacity={0.8} />
      {/* corner greenery */}
      <svg width={width} height={height} style={{position: 'absolute', inset: 0}}>
        <PineBranch x={-30} y={-20} rotate={35} length={360} seed={seed * 3 + 1} tint="dark" />
        <PineBranch x={-40} y={60} rotate={15} length={300} seed={seed * 3 + 2} />
        <PineBranch x={width + 30} y={-20} rotate={145} length={360} seed={seed * 3 + 3} tint="dark" />
        <PineBranch x={width + 40} y={60} rotate={165} length={300} seed={seed * 3 + 4} />
        <Ornament id={`pb${seed}a`} x={width * 0.09} y={0} r={26} string={130} color="red" phase={seed} />
        <Ornament id={`pb${seed}b`} x={width * 0.91} y={0} r={30} string={100} color="gold" phase={seed + 2} />
        <Bow id={`pbb${seed}`} x={70} y={50} size={140} rotate={-20} />
        <Bow id={`pbc${seed}`} x={width - 70} y={50} size={140} rotate={20} />
      </svg>
      <Vignette strength={0.7} />
    </AbsoluteFill>
  );
};

/** Golden musical staff with notes flowing across — the choir motif. */
export const MusicStaff: React.FC<{seed?: number; y?: number; opacity?: number}> = ({seed = 1, y, opacity = 0.45}) => {
  const frame = useCurrentFrame();
  const {width, height} = useVideoConfig();
  const yy = y ?? height * 0.78;
  const lines = [0, 1, 2, 3, 4].map((i) => {
    const pts = Array.from({length: 25}, (_, k) => {
      const x = (k / 24) * (width + 200) - 100;
      const yv = yy + i * 18 + Math.sin(k * 0.45 + frame * 0.03 + seed) * 40;
      return `${k === 0 ? 'M' : 'L'}${x.toFixed(0)} ${yv.toFixed(1)}`;
    }).join('');
    return pts;
  });
  const notes = Array.from({length: 12}, (_, i) => {
    const x = ((i * 190 + frame * 2.2) % (width + 200)) - 100;
    const k = (x + 100) / ((width + 200) / 24);
    const yv = yy + ((i * 7) % 5) * 9 + Math.sin(k * 0.45 + frame * 0.03 + seed) * 40;
    return {x, y: yv, two: i % 3 === 0};
  });
  return (
    <svg width={width} height={height} style={{position: 'absolute', inset: 0, opacity}}>
      {lines.map((d, i) => (
        <path key={i} d={d} stroke="#E7C463" strokeWidth={1.6} fill="none" opacity={0.7} />
      ))}
      {notes.map((n, i) => (
        <g key={i} transform={`translate(${n.x} ${n.y})`} fill="#F4D77E">
          <ellipse cx={0} cy={0} rx={11} ry={8} transform="rotate(-20)" />
          <rect x={9} y={-52} width={3} height={52} />
          {n.two ? <path d="M12 -52 L40 -44 L40 -36 L12 -44 Z" /> : <path d="M12 -52 C26 -44 30 -34 24 -22 C26 -34 20 -40 12 -42 Z" />}
        </g>
      ))}
    </svg>
  );
};
