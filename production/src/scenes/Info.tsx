import React from 'react';
import {AbsoluteFill, interpolate, useCurrentFrame, useVideoConfig} from 'remotion';
import {COLORS, FONTS} from '../theme';
import {prog, E} from '../ease';
import {cue, f} from '../timing';
import {PineBranch, TopGarland, Ornament} from '../components/Decor';
import {Bokeh, GoldDust, LightSweep, Vignette} from '../components/Light';
import {Eyebrow, GoldText, Rise} from '../components/Text';

const Card: React.FC<{w: number; h: number; at: number; children: React.ReactNode; flip?: boolean}> = ({w, h, at, children, flip}) => {
  const frame = useCurrentFrame();
  const p = prog(frame, at, at + 30, 'back.out(1.4)');
  const q = prog(frame, at, at + 22, 'power2.out');
  return (
    <div style={{width: w, height: h, perspective: 1600, opacity: q}}>
      <div
        style={{
          position: 'relative', width: '100%', height: '100%', borderRadius: 26, overflow: 'hidden',
          transform: flip ? `rotateX(${(1 - p) * -80}deg)` : `translateY(${(1 - p) * 60}px) scale(${0.92 + 0.08 * p})`, transformOrigin: '50% 0%',
          background: 'linear-gradient(160deg, rgba(20,80,55,0.92) 0%, rgba(8,42,29,0.95) 55%, rgba(4,24,16,0.97) 100%)',
          border: '3px solid rgba(231,196,99,0.9)', boxShadow: '0 30px 70px rgba(0,0,0,0.6), inset 0 0 0 8px rgba(231,196,99,0.12), inset 0 0 50px rgba(0,0,0,0.45)',
        }}
      >
        {children}
        <LightSweep start={at + 14} duration={40} opacity={0.25} />
      </div>
    </div>
  );
};

/** Calendar page: month band, rolling day number. */
const Calendar: React.FC<{at: number; size: number}> = ({at, size}) => {
  const frame = useCurrentFrame();
  const roll = prog(frame, at + 6, at + 40, 'power3.out');
  const day = Math.round(13 + roll * 7);
  return (
    <div style={{width: size, height: size * 1.05, borderRadius: 18, overflow: 'hidden', background: '#FFF8EC', boxShadow: '0 14px 30px rgba(0,0,0,0.5)', position: 'relative'}}>
      <div style={{height: size * 0.27, background: 'linear-gradient(180deg, #C0182A, #7E0915)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: FONTS.sans, fontWeight: 700, fontSize: size * 0.11, letterSpacing: size * 0.02, color: COLORS.goldLight}}>DECEMBER</div>
      {[0.25, 0.75].map((x) => (
        <div key={x} style={{position: 'absolute', top: -size * 0.03, left: size * x - 7, width: 14, height: size * 0.1, borderRadius: 7, background: 'linear-gradient(90deg,#8D6513,#FFF3C2,#8D6513)'}} />
      ))}
      <div style={{textAlign: 'center', fontFamily: FONTS.display, fontWeight: 900, fontSize: size * 0.5, color: '#7E0915', lineHeight: 1.1, marginTop: size * 0.02, transform: `translateY(${(1 - roll) * -6}px)`}}>{day}</div>
      <div style={{textAlign: 'center', fontFamily: FONTS.sans, fontWeight: 700, fontSize: size * 0.085, color: '#3a2a10', letterSpacing: 3}}>SUNDAY</div>
    </div>
  );
};

/** Golden clock whose hands sweep round to 10:00. */
const Clock: React.FC<{at: number; size: number}> = ({at, size}) => {
  const frame = useCurrentFrame();
  const p = prog(frame, at - 20, at + 34, 'power2.inOut');
  const hours = 6.5 + p * 3.5; // 6:30 -> 10:00
  const hourA = (hours % 12) * 30;
  const minA = (hours % 1) * 360;
  const r = size / 2;
  return (
    <svg width={size} height={size} viewBox={`${-r} ${-r} ${size} ${size}`}>
      <defs>
        <radialGradient id="clockface" cx="40%" cy="35%" r="75%">
          <stop offset="0%" stopColor="#FFFDF4" />
          <stop offset="100%" stopColor="#EADBB8" />
        </radialGradient>
        <linearGradient id="clockrim" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#FFF3C2" />
          <stop offset="40%" stopColor="#C9971F" />
          <stop offset="70%" stopColor="#7A560C" />
          <stop offset="100%" stopColor="#F2D57E" />
        </linearGradient>
      </defs>
      <circle r={r - 2} fill="url(#clockrim)" />
      <circle r={r * 0.86} fill="url(#clockface)" />
      {Array.from({length: 60}, (_, i) => {
        const a = (i * 6 * Math.PI) / 180;
        const big = i % 5 === 0;
        const r1 = r * (big ? 0.68 : 0.75);
        return <line key={i} x1={Math.sin(a) * r1} y1={-Math.cos(a) * r1} x2={Math.sin(a) * r * 0.8} y2={-Math.cos(a) * r * 0.8} stroke={big ? '#7E0915' : '#8D6513'} strokeWidth={big ? 4 : 1.5} />;
      })}
      {['XII', 'III', 'VI', 'IX'].map((t, i) => (
        <text key={t} x={Math.sin((i * Math.PI) / 2) * r * 0.52} y={-Math.cos((i * Math.PI) / 2) * r * 0.52 + r * 0.06} textAnchor="middle" fontFamily="Cinzel" fontWeight={700} fontSize={r * 0.17} fill="#5C0712">{t}</text>
      ))}
      <line x1={0} y1={0} x2={Math.sin((hourA * Math.PI) / 180) * r * 0.42} y2={-Math.cos((hourA * Math.PI) / 180) * r * 0.42} stroke="#2a1a05" strokeWidth={r * 0.07} strokeLinecap="round" />
      <line x1={0} y1={0} x2={Math.sin((minA * Math.PI) / 180) * r * 0.62} y2={-Math.cos((minA * Math.PI) / 180) * r * 0.62} stroke="#2a1a05" strokeWidth={r * 0.04} strokeLinecap="round" />
      <circle r={r * 0.06} fill="#C9971F" stroke="#5C3F08" strokeWidth={2} />
      <ellipse cx={-r * 0.3} cy={-r * 0.45} rx={r * 0.35} ry={r * 0.14} fill="white" opacity={0.25} transform={`rotate(-30 ${-r * 0.3} ${-r * 0.45})`} />
    </svg>
  );
};

/** Location pin dropping onto a stylised street map with ripples. */
const PinMap: React.FC<{at: number; size: number}> = ({at, size}) => {
  const frame = useCurrentFrame();
  const drop = frame < at ? 0 : Math.min(1, (frame - at) / 22);
  const y = (1 - E('bounce.out')(drop)) * -size * 0.7;
  const rip = Math.max(0, frame - at - 18);
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      <defs>
        <clipPath id="mapclip"><circle cx={size / 2} cy={size / 2} r={size / 2 - 4} /></clipPath>
        <linearGradient id="pin" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#FF5B67" />
          <stop offset="60%" stopColor="#B3101F" />
          <stop offset="100%" stopColor="#5C0712" />
        </linearGradient>
      </defs>
      <g clipPath="url(#mapclip)">
        <rect width={size} height={size} fill="#0B3A27" />
        {[0.18, 0.42, 0.7, 0.88].map((t, i) => (
          <line key={`h${i}`} x1={0} y1={size * t} x2={size} y2={size * t + (i - 1.5) * 30} stroke="rgba(231,196,99,0.35)" strokeWidth={i === 1 ? 12 : 5} />
        ))}
        {[0.22, 0.5, 0.8].map((t, i) => (
          <line key={`v${i}`} x1={size * t} y1={0} x2={size * t + (i - 1) * 40} y2={size} stroke="rgba(231,196,99,0.28)" strokeWidth={i === 1 ? 10 : 5} />
        ))}
        {[0, 18, 36].map((d) => {
          const t = ((rip + d) % 54) / 54;
          return rip > 0 ? <ellipse key={d} cx={size / 2} cy={size * 0.66} rx={size * 0.42 * t} ry={size * 0.14 * t} fill="none" stroke="rgba(255,226,150,0.9)" strokeWidth={3} opacity={1 - t} /> : null;
        })}
      </g>
      <circle cx={size / 2} cy={size / 2} r={size / 2 - 3} fill="none" stroke="#E7C463" strokeWidth={4} />
      <ellipse cx={size / 2} cy={size * 0.66} rx={size * 0.08 * drop} ry={size * 0.025 * drop} fill="rgba(0,0,0,0.5)" />
      <g transform={`translate(${size / 2} ${size * 0.66 + y})`} opacity={drop > 0 ? 1 : 0}>
        <path d={`M0 0 C${-size * 0.05} ${-size * 0.12} ${-size * 0.14} ${-size * 0.2} ${-size * 0.14} ${-size * 0.3} A${size * 0.14} ${size * 0.14} 0 1 1 ${size * 0.14} ${-size * 0.3} C${size * 0.14} ${-size * 0.2} ${size * 0.05} ${-size * 0.12} 0 0 Z`} fill="url(#pin)" stroke="#FFE8A8" strokeWidth={3} />
        <circle cx={0} cy={-size * 0.3} r={size * 0.055} fill="#FFF3C2" />
      </g>
    </svg>
  );
};

export const SceneInfo: React.FC<{from: number}> = ({from}) => {
  const frame = useCurrentFrame();
  const {width, height} = useVideoConfig();
  const V = height > width;
  const L = (sec: number) => f(sec) - from;
  const dC = cue('date');
  const tC = cue('time');
  const vC = cue('venue');
  const drift = interpolate(frame, [0, 360], [0, -30]);
  const textBig = V ? 44 : 50;
  const sub = V ? 34 : 30;
  const lab: React.CSSProperties = {fontFamily: FONTS.display, fontWeight: 700, fontSize: sub, letterSpacing: 6, color: COLORS.goldLight};
  const val: React.CSSProperties = {fontFamily: FONTS.sans, fontWeight: 700, fontSize: textBig, color: COLORS.white, lineHeight: 1.15, textShadow: '0 2px 10px rgba(0,0,0,0.6)'};
  const addr: React.CSSProperties = {fontFamily: FONTS.sans, fontWeight: 600, fontSize: V ? 38 : 36, color: COLORS.white, lineHeight: 1.3};

  const cw = V ? 900 : 540;
  const ch = V ? 420 : 620;
  const icon = V ? 250 : 280;
  const inner = (iconEl: React.ReactNode, label: string, body: React.ReactNode): React.ReactNode =>
    V ? (
      <div style={{display: 'flex', alignItems: 'center', height: '100%', padding: '0 46px', gap: 40}}>
        <div style={{flex: '0 0 auto'}}>{iconEl}</div>
        <div style={{flex: 1}}>
          <div style={lab}>{label}</div>
          <div style={{height: 12}} />
          {body}
        </div>
      </div>
    ) : (
      <div style={{display: 'flex', flexDirection: 'column', alignItems: 'center', height: '100%', paddingTop: 46, gap: 26, textAlign: 'center'}}>
        {iconEl}
        <div style={lab}>{label}</div>
        <div style={{padding: '0 30px'}}>{body}</div>
      </div>
    );

  return (
    <AbsoluteFill style={{background: `radial-gradient(ellipse at 50% 30%, #145A3C 0%, #0A3323 45%, #03140D 100%)`}}>
      <Bokeh count={22} seed={61} opacity={0.6} />
      <AbsoluteFill style={{transform: `translateY(${drift * 0.3}px)`}}>
        <svg width={width} height={height}>
          <TopGarland width={width} y={-40} seed={19} bells={false} scale={V ? 1 : 0.8} />
          <PineBranch x={-50} y={height + 20} rotate={-30} length={460} seed={71} tint="dark" scale={1.2} />
          <PineBranch x={width + 50} y={height + 20} rotate={-150} length={460} seed={72} tint="dark" scale={1.2} />
          <Ornament id="info1" x={70} y={height - 140} r={36} string={0} color="red" swing={2} />
          <Ornament id="info2" x={width - 70} y={height - 150} r={34} string={0} color="gold" swing={2} />
        </svg>
      </AbsoluteFill>
      <GoldDust count={70} seed={62} />
      <AbsoluteFill style={{alignItems: 'center', paddingTop: V ? 250 : 150}}>
        <Rise at={2}>
          <GoldText size={V ? 92 : 80} weight={700} spacing={10} sweepAt={20}>JOIN US</GoldText>
        </Rise>
      </AbsoluteFill>
      <AbsoluteFill style={{alignItems: 'center', justifyContent: 'center', paddingTop: V ? 210 : 170}}>
        <div style={{display: 'flex', flexDirection: V ? 'column' : 'row', gap: V ? 44 : 48, transform: `translateY(${drift * 0.5}px)`}}>
          <Card w={cw} h={ch} at={L(dC.start) - 8} flip>
            {inner(<Calendar at={L(dC.start)} size={V ? 220 : 250} />, 'DATE', <div style={val}>SUNDAY,<br />20 DECEMBER 2026</div>)}
          </Card>
          <Card w={cw} h={ch} at={L(tC.start) - 10} flip>
            {inner(<Clock at={L(tC.start)} size={icon * 0.95} />, 'TIME', <div style={{...val, fontSize: textBig * 1.3}}>10:00 AM</div>)}
          </Card>
          <Card w={cw} h={ch} at={L(vC.start) - 8} flip>
            {inner(
              <PinMap at={L(vC.start)} size={icon * 0.95} />,
              'VENUE',
              <div style={addr}>
                30 Fadunsi Street,
                <br />
                Fako Estate, Oke-Ira,
                <br />
                Ogba, Lagos.
              </div>,
            )}
          </Card>
        </div>
      </AbsoluteFill>
      <Vignette strength={0.7} />
    </AbsoluteFill>
  );
};
