import React from 'react';
import {AbsoluteFill, Img, interpolate, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';
import {COLORS, FONTS} from '../theme';
import {prog} from '../ease';
import {cue, f, itemOnsets} from '../timing';
import {Backdrop, MusicStaff, Nameplate, PEOPLE, PersonBackdrop, PortraitFrame, Spotlight} from '../components/People';
import {BethlehemStar, Bokeh, GoldDust, LightSweep, Vignette} from '../components/Light';
import {Eyebrow, GoldText, MaskReveal, Rise} from '../components/Text';

/* -------------------------------------------------------------------------- */
/* Single-person introduction (leader, choir master, chairman, announcer)       */
/* -------------------------------------------------------------------------- */
export const ScenePerson: React.FC<{
  from: number;
  who: keyof typeof PEOPLE;
  label: string;
  cueId: string;
  side: 'left' | 'right';
  backdrop: Backdrop;
  seed?: number;
  star?: boolean;
  motif?: boolean;
}> = ({from, who, label, cueId, side, backdrop, seed = 1, star, motif}) => {
  const frame = useCurrentFrame();
  const {width, height} = useVideoConfig();
  const V = height > width;
  const L = (sec: number) => f(sec) - from;
  const person = PEOPLE[who];
  const c = cue(cueId);
  const nameAt = Math.max(8, L(c.start) + 4);
  const camX = interpolate(frame, [0, 200], [side === 'left' ? 14 : -14, side === 'left' ? -14 : 14]);
  const zoom = interpolate(frame, [0, 200], [1.0, 1.04]);

  // layout
  const pw = V ? 600 : 500;
  const ph = V ? 760 : 640;
  const px = V ? (width - pw) / 2 : side === 'left' ? 230 : width - 230 - pw;
  const py = V ? 330 : (height - ph) / 2 + 40;
  const npW = V ? 920 : 960;
  const npX = V ? (width - npW) / 2 : side === 'left' ? px + pw + 110 : px - 110 - npW;
  const npY = V ? py + ph + 70 : py + 70;
  const spotX = px + pw / 2;

  return (
    <AbsoluteFill>
      <PersonBackdrop kind={backdrop} seed={seed} />
      {motif && <MusicStaff seed={seed} y={V ? height * 0.12 : height * 0.13} opacity={0.35} />}
      <AbsoluteFill style={{transform: `translateX(${camX}px) scale(${zoom})`}}>
        <Spotlight x={spotX} at={0} opacity={0.32} bottomWidth={V ? 1000 : 1000} />
        {star && <BethlehemStar x={spotX} y={py - 40} size={46} intensity={0.85 * prog(frame, 10, 40)} />}
        <PortraitFrame person={person} w={pw} h={ph} at={2} from={V ? 'below' : side === 'left' ? 'left' : 'right'} style={{left: px, top: py}} />
        <div style={{position: 'absolute', left: npX, top: npY, width: npW}}>
          <div style={{marginBottom: V ? 18 : 26, display: 'flex', justifyContent: V ? 'center' : 'flex-start'}}>
            <LabelChip text={label} at={4} size={V ? 30 : 28} />
          </div>
          <Nameplate person={person} at={nameAt} width={npW} align={V ? 'center' : 'left'} scale={V ? 1.05 : 1.12} />
        </div>
      </AbsoluteFill>
      <GoldDust count={40} seed={seed + 77} opacity={0.7} size={0.8} />
    </AbsoluteFill>
  );
};

/** Label in spaced caps with a red-velvet + gold chip. */
export const LabelChip: React.FC<{text: string; at: number; size?: number}> = ({text, at, size = 28}) => {
  const frame = useCurrentFrame();
  const p = prog(frame, at, at + 24, 'power3.out');
  return (
    <div
      style={{
        display: 'inline-block', opacity: p, transform: `translateY(${(1 - p) * 16}px)`, padding: `${size * 0.35}px ${size * 0.9}px`,
        background: 'linear-gradient(180deg, #A51324, #6A0814)', border: '2px solid #E7C463', borderRadius: 999,
        fontFamily: FONTS.display, fontWeight: 700, fontSize: size, letterSpacing: size * 0.22, color: COLORS.goldLight,
        boxShadow: '0 8px 24px rgba(0,0,0,0.5)', whiteSpace: 'nowrap',
      }}
    >
      {text}
    </div>
  );
};

/* -------------------------------------------------------------------------- */
/* SCENE 5 — Featuring Apostle Samuel Oguibe & guest artiste Ehiliz            */
/* -------------------------------------------------------------------------- */
export const SceneFeaturing: React.FC<{from: number}> = ({from}) => {
  const frame = useCurrentFrame();
  const {width, height} = useVideoConfig();
  const V = height > width;
  const L = (sec: number) => f(sec) - from;
  const a = PEOPLE.oguibe;
  const b = PEOPLE.ehiliz;
  const bAt = L(cue('ehiliz').start) - 4;
  const zoom = interpolate(frame, [0, 170], [1.03, 1.0]);
  // landscape: two columns. vertical: two rows.
  const pw = V ? 380 : 400;
  const ph = V ? 480 : 500;
  const colA = V ? {px: 70, py: 330, nx: 70 + pw + 50, ny: 330 + 120, nw: width - 70 - pw - 50 - 50, align: 'left' as const}
    : {px: width * 0.29 - pw / 2, py: 210, nx: width * 0.29 - 380, ny: 210 + ph + 40, nw: 760, align: 'center' as const};
  const colB = V ? {px: width - 70 - pw, py: 1010, nx: 50, ny: 1010 + 120, nw: width - 70 - pw - 50 - 50, align: 'right' as const}
    : {px: width * 0.71 - pw / 2, py: 210, nx: width * 0.71 - 380, ny: 210 + ph + 40, nw: 760, align: 'center' as const};
  const focusA = 1 - 0.25 * prog(frame, bAt, bAt + 20); // gently dim A when B arrives
  return (
    <AbsoluteFill>
      <PersonBackdrop kind="evergreen" seed={5} />
      <AbsoluteFill style={{transform: `scale(${zoom})`}}>
        <AbsoluteFill style={{alignItems: 'center', paddingTop: V ? 200 : 90}}>
          <LabelChip text="FEATURING" at={2} size={V ? 34 : 30} />
        </AbsoluteFill>
        <div style={{opacity: focusA}}>
          <Spotlight x={colA.px + pw / 2} opacity={0.3} bottomWidth={800} />
        </div>
        <Spotlight x={colB.px + pw / 2} opacity={0.3} bottomWidth={800} at={bAt} />
        <div style={{filter: `brightness(${focusA * 0.2 + 0.8})`}}>
          <PortraitFrame person={a} w={pw} h={ph} at={2} from="left" style={{left: colA.px, top: colA.py}} />
          <div style={{position: 'absolute', left: colA.nx, top: colA.ny, width: colA.nw, textAlign: colA.align}}>
            <Nameplate person={a} at={8} width={colA.nw} align={colA.align === 'center' ? 'center' : 'left'} scale={0.82} />
          </div>
        </div>
        {frame >= bAt - 1 && (
          <>
            <PortraitFrame person={b} w={pw} h={ph} at={bAt} from="right" style={{left: colB.px, top: colB.py}} />
            <div style={{position: 'absolute', left: colB.nx, top: colB.ny, width: colB.nw, textAlign: V ? 'right' : 'center'}}>
              <div style={{display: 'inline-block', textAlign: V ? 'left' : 'center'}}>
                <Nameplate person={b} at={bAt + 6} width={colB.nw} align={V ? 'left' : 'center'} scale={0.82} />
              </div>
            </div>
          </>
        )}
      </AbsoluteFill>
      <GoldDust count={40} seed={88} opacity={0.7} size={0.8} />
    </AbsoluteFill>
  );
};

/* -------------------------------------------------------------------------- */
/* SCENE 6 — The Divisional Mass Choirs                                         */
/* -------------------------------------------------------------------------- */
const CHOIRS = [
  {name: 'AJEGUNLE', img: 'assets/choirs/ajegunle.jpg', pos: '50% 40%'},
  {name: 'BARIGA', img: 'assets/choirs/bariga.jpg', pos: '50% 50%'},
  {name: 'MAFOLUKU', img: 'assets/choirs/mafoluku.jpg', pos: '40% 45%'},
  {name: 'FESTAC', img: 'assets/choirs/festac.jpg', pos: '50% 65%'},
  {name: 'OJOTA', img: 'assets/choirs/ojota.jpg', pos: '50% 55%'},
  {name: 'KETU', img: 'assets/choirs/ketu-cleaned.jpg', pos: '50% 45%'},
  {name: 'OKOKO', img: 'assets/choirs/okoko.jpg', pos: '50% 40%'},
  {name: 'LEKKI', img: 'assets/choirs/lekki.jpg', pos: '50% 55%'},
];

const StageBeams: React.FC<{intensity?: number}> = ({intensity = 1}) => {
  const frame = useCurrentFrame();
  const {width, height} = useVideoConfig();
  const beams = [0.1, 0.28, 0.5, 0.72, 0.9];
  const colors = ['255,214,130', '255,120,110', '255,240,200', '130,220,160', '255,200,120'];
  return (
    <AbsoluteFill style={{mixBlendMode: 'screen', opacity: intensity}}>
      {beams.map((x, i) => {
        const ang = Math.sin(frame * 0.03 + i * 1.7) * 22;
        return (
          <div
            key={i}
            style={{
              position: 'absolute', left: width * x - 140, top: -height * 0.1, width: 280, height: height * 1.3, transformOrigin: '50% 0%',
              transform: `rotate(${ang}deg)`, clipPath: 'polygon(44% 0, 56% 0, 100% 100%, 0 100%)',
              background: `linear-gradient(180deg, rgba(${colors[i]},0.55) 0%, rgba(${colors[i]},0.12) 60%, rgba(${colors[i]},0) 100%)`,
            }}
          />
        );
      })}
    </AbsoluteFill>
  );
};

export const SceneChoirs: React.FC<{from: number}> = ({from}) => {
  const frame = useCurrentFrame();
  const {width, height} = useVideoConfig();
  const V = height > width;
  const L = (sec: number) => f(sec) - from;
  const intro = cue('choirs');
  const onsets = [...itemOnsets('choirs_a'), ...itemOnsets('choirs_b')].map((s) => L(s) - 3);
  const gridAt = onsets[0] - 14;
  const g = prog(frame, gridAt, gridAt + 24, 'power3.inOut'); // title -> header
  // grid geometry
  const cols = V ? 2 : 4;
  const cw = V ? 470 : 405;
  const chh = V ? 255 : 250;
  const gap = V ? 24 : 28;
  const labelH = V ? 58 : 58;
  const rows = 8 / cols;
  const gw = cols * cw + (cols - 1) * gap;
  const gh = rows * (chh + labelH) + (rows - 1) * gap;
  const gx = (width - gw) / 2;
  const gy = V ? 440 : 300;
  const titleY = interpolate(g, [0, 1], [V ? height * 0.42 : height * 0.36, V ? 190 : 70]);
  const titleScale = interpolate(g, [0, 1], [1, V ? 0.62 : 0.55]);
  const wall = 1 - g;
  return (
    <AbsoluteFill style={{background: 'radial-gradient(ellipse at 50% 100%, #4A0A14 0%, #1E0309 50%, #090104 100%)'}}>
      {/* drifting 3-D wall of choir photographs behind the title */}
      <AbsoluteFill style={{perspective: 1400, opacity: 0.55 * wall}}>
        <div style={{position: 'absolute', inset: 0, transformStyle: 'preserve-3d', transform: `rotateY(${-18 + frame * 0.05}deg) translateZ(-200px)`}}>
          {CHOIRS.map((c, i) => {
            const x = ((i % 4) - 1.5) * 520 + width / 2 - 240 - frame * 1.2 + (Math.floor(i / 4) % 2) * 160;
            const y = Math.floor(i / 4) * 360 + height / 2 - 380;
            return <Img key={i} src={staticFile(c.img)} style={{position: 'absolute', left: x, top: y, width: 480, height: 320, objectFit: 'cover', objectPosition: c.pos, borderRadius: 14, border: '3px solid rgba(231,196,99,0.7)'}} />;
          })}
        </div>
      </AbsoluteFill>
      <AbsoluteFill style={{background: 'linear-gradient(180deg, rgba(9,1,4,0.6) 0%, rgba(9,1,4,0.2) 45%, rgba(9,1,4,0.75) 100%)'}} />
      <StageBeams />
      <Bokeh count={18} seed={95} opacity={0.5} />
      <MusicStaff seed={4} y={V ? height * 0.88 : height * 0.86} opacity={0.3 * wall + 0.1} />
      {/* title block */}
      <div style={{position: 'absolute', left: 0, right: 0, top: titleY, display: 'flex', flexDirection: 'column', alignItems: 'center', transform: `scale(${titleScale})`, transformOrigin: '50% 0%'}}>
        <Eyebrow text="ALSO MINISTERING" at={L(intro.start) - 4} size={V ? 34 : 32} line={90} />
        <MaskReveal at={L(intro.start) + 20}>
          <div style={{fontFamily: FONTS.serif, fontStyle: 'italic', fontWeight: 600, fontSize: V ? 62 : 64, color: COLORS.champagne, textShadow: '0 2px 12px rgba(0,0,0,0.85)', textAlign: 'center'}}>the anointed</div>
        </MaskReveal>
        <MaskReveal at={L(intro.start) + 34}>
          <GoldText size={V ? 84 : 100} weight={900} spacing={4} sweepAt={L(intro.start) + 60} glow={0.5} style={{textAlign: 'center'}}>
            {V ? 'DIVISIONAL\nMASS CHOIRS' : 'DIVISIONAL MASS CHOIRS'}
          </GoldText>
        </MaskReveal>
      </div>
      {/* grid of the eight divisions, each revealed as it is named */}
      {CHOIRS.map((c, i) => {
        const at = onsets[i];
        const p = prog(frame, at, at + 20, 'back.out(1.6)');
        const q = prog(frame, at, at + 12, 'power2.out');
        const active = frame >= at && frame < (onsets[i + 1] ?? at + 40) + 4;
        const col = i % cols;
        const row = Math.floor(i / cols);
        const x = gx + col * (cw + gap);
        const y = gy + row * (chh + labelH + gap);
        return (
          <div key={c.name} style={{position: 'absolute', left: x, top: y, width: cw, height: chh + labelH, opacity: q, transform: `perspective(1200px) rotateX(${(1 - p) * 70}deg) scale(${0.85 + 0.15 * p + (active ? 0.03 : 0)})`, transformOrigin: '50% 100%'}}>
            <div style={{position: 'relative', width: cw, height: chh, borderRadius: 14, overflow: 'hidden', border: `3px solid ${active ? '#FFF1C2' : '#D4AF37'}`, boxShadow: active ? '0 0 40px rgba(255,210,120,0.7), 0 18px 40px rgba(0,0,0,0.6)' : '0 18px 40px rgba(0,0,0,0.6)'}}>
              <Img src={staticFile(c.img)} style={{width: '100%', height: '100%', objectFit: 'cover', objectPosition: c.pos, transform: `scale(${1.12 - 0.08 * prog(frame, at, at + 120, 'sine.out')})`}} />
              <div style={{position: 'absolute', inset: 0, background: 'linear-gradient(180deg, rgba(0,0,0,0) 55%, rgba(0,0,0,0.45) 100%)'}} />
              <LightSweep start={at + 6} duration={28} opacity={0.45} />
            </div>
            <div style={{height: labelH, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
              <div style={{fontFamily: FONTS.sans, fontWeight: 800, fontSize: V ? 38 : 34, letterSpacing: 5, color: active ? '#FFF1C2' : COLORS.goldLight, textShadow: active ? '0 0 18px rgba(255,210,120,0.8), 0 2px 8px rgba(0,0,0,0.9)' : '0 2px 8px rgba(0,0,0,0.9)'}}>{c.name}</div>
            </div>
          </div>
        );
      })}
      <GoldDust count={60} seed={96} opacity={0.8} />
      <Vignette strength={0.7} />
    </AbsoluteFill>
  );
};
