import React from 'react';
import {AbsoluteFill, Img, interpolate, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';
import {COLORS, FONTS} from '../theme';
import {prog, E} from '../ease';
import {cue, f} from '../timing';
import {Bell, Bow, Ornament, PineBranch, TopGarland, Wreath, swing} from '../components/Decor';
import {BethlehemStar, Bokeh, GodRays, GoldDust, LensFlare, LightSweep, Vignette} from '../components/Light';
import {Eyebrow, GoldText, MaskReveal, Rise, SyncedWords} from '../components/Text';

/* ========================================================================== */
/* SCENE 1 — The Christmas atmosphere                                          */
/* ========================================================================== */
export const SceneIntro: React.FC<{from: number}> = ({from}) => {
  const frame = useCurrentFrame();
  const {width, height} = useVideoConfig();
  const V = height > width;
  const L = (sec: number) => f(sec) - from;
  const light = prog(frame, 0, 70, 'sine.inOut');
  const cam = interpolate(frame, [0, 240], [1.0, 1.14], {extrapolateRight: 'clamp'});
  const camY = interpolate(frame, [0, 240], [30, -10]);
  const layer = (depth: number): React.CSSProperties => ({
    transform: `translateY(${camY * depth}px) scale(${1 + (cam - 1) * depth})`, transformOrigin: '50% 40%',
  });
  const c = cue('intro');
  const gScale = V ? 1.15 : 1;
  return (
    <AbsoluteFill style={{background: '#050102'}}>
      {/* warm light emerging from darkness */}
      <AbsoluteFill style={{opacity: light, background: `radial-gradient(ellipse at 50% 38%, #8A3A12 0%, #4A0D10 32%, #1A0306 62%, #050102 100%)`}} />
      <AbsoluteFill style={{...layer(0.3), opacity: light}}>
        <Bokeh count={26} seed={5} opacity={0.85} />
      </AbsoluteFill>
      <AbsoluteFill style={{opacity: light * 0.55}}>
        <GodRays y="-5%" opacity={0.45} spin={0.04} />
      </AbsoluteFill>
      {/* mid layer: hanging ornaments at depth */}
      <AbsoluteFill style={{...layer(0.6), opacity: light}}>
        <svg width={width} height={height}>
          {[0.14, 0.3, 0.7, 0.86].map((x, i) => (
            <Ornament key={i} id={`io${i}`} x={width * x} y={0} r={(V ? 34 : 30) + (i % 2) * 10} string={height * (0.32 + (i % 2) * 0.12)} color={i % 2 ? 'red' : 'gold'} phase={i * 1.3} swing={5} />
          ))}
        </svg>
      </AbsoluteFill>
      {/* garland with swinging bells */}
      <AbsoluteFill style={{...layer(1), opacity: prog(frame, 8, 60)}}>
        <svg width={width} height={height}>
          <TopGarland width={width} y={-20} seed={4} bellStart={0} scale={gScale} />
        </svg>
      </AbsoluteFill>
      {/* foreground pine branches (fast parallax) */}
      <AbsoluteFill style={{...layer(1.6), opacity: prog(frame, 20, 70)}}>
        <svg width={width} height={height}>
          <PineBranch x={-60} y={height + 30} rotate={-38} length={V ? 520 : 600} seed={91} tint="dark" scale={1.3} />
          <PineBranch x={width + 60} y={height + 30} rotate={-142} length={V ? 520 : 600} seed={92} tint="dark" scale={1.3} />
          <PineBranch x={-40} y={height * 0.8} rotate={-12} length={380} seed={93} />
          <PineBranch x={width + 40} y={height * 0.8} rotate={-168} length={380} seed={94} />
          <Ornament id="fo1" x={width * 0.2} y={height * 0.78} r={42} string={0} color="red" swing={1} />
          <Ornament id="fo2" x={width * 0.8} y={height * 0.76} r={46} string={0} color="gold" swing={1} phase={2} />
        </svg>
      </AbsoluteFill>
      <GoldDust count={V ? 110 : 120} seed={12} opacity={light} />
      {/* opening line */}
      <AbsoluteFill style={{justifyContent: 'center', alignItems: 'center', paddingTop: V ? 220 : 160}}>
        <div style={{maxWidth: V ? 940 : 1700}}>
          <SyncedWords text={c.text} start={L(c.start)} end={L(c.end)} size={V ? 78 : 84} color={COLORS.champagne} />
        </div>
      </AbsoluteFill>
      <Vignette strength={0.85} />
    </AbsoluteFill>
  );
};

/* ========================================================================== */
/* SCENE 2a — The church presents                                              */
/* ========================================================================== */
export const SceneChurch: React.FC<{from: number}> = ({from}) => {
  const frame = useCurrentFrame();
  const {width, height} = useVideoConfig();
  const V = height > width;
  const L = (sec: number) => f(sec) - from;
  const c = cue('church');
  const logoP = prog(frame, 6, 46, 'expo.out');
  const ring = frame * 0.4;
  const logoH = V ? 430 : 330;
  const logoW = logoH * (785 / 1030);
  const zoom = interpolate(frame, [0, 170], [1.04, 1.0]);
  const presentsAt = L(c.end) - 30;
  return (
    <AbsoluteFill style={{background: `radial-gradient(ellipse at 50% 40%, #6E0A17 0%, #3A040C 50%, #120105 100%)`}}>
      <AbsoluteFill style={{opacity: 0.3, background: 'repeating-linear-gradient(90deg, rgba(0,0,0,0) 0px, rgba(0,0,0,0.5) 80px, rgba(255,140,140,0.1) 150px, rgba(0,0,0,0) 220px)'}} />
      <GodRays y="-15%" opacity={0.4} spin={-0.05} />
      <Bokeh count={20} seed={21} opacity={0.6} />
      <AbsoluteFill style={{transform: `scale(${zoom})`}}>
        <svg width={width} height={height}>
          <TopGarland width={width} y={-30} seed={8} bells={false} scale={V ? 1.1 : 0.9} />
        </svg>
      </AbsoluteFill>
      <GoldDust count={80} seed={33} />
      <AbsoluteFill style={{alignItems: 'center', justifyContent: 'center', flexDirection: 'column', transform: `scale(${zoom})`, paddingTop: V ? 40 : 90}}>
        {/* medallion */}
        <div style={{position: 'relative', width: logoW + 60, height: logoH + 60, opacity: logoP, transform: `scale(${0.7 + 0.3 * logoP})`}}>
          <div style={{position: 'absolute', inset: -120, borderRadius: '50%', background: 'radial-gradient(circle, rgba(255,215,140,0.55) 0%, rgba(255,190,90,0.15) 40%, rgba(0,0,0,0) 70%)'}} />
          <svg width={logoW + 60} height={logoH + 60} style={{position: 'absolute', inset: 0}} viewBox={`0 0 ${logoW + 60} ${logoH + 60}`}>
            <ellipse cx={(logoW + 60) / 2} cy={(logoH + 60) / 2} rx={logoW / 2 + 26} ry={logoH / 2 + 26} fill="none" stroke="#E7C463" strokeWidth={3} strokeDasharray="2 10" transform={`rotate(${ring} ${(logoW + 60) / 2} ${(logoH + 60) / 2})`} />
          </svg>
          <div style={{position: 'absolute', left: 14, top: 14, width: logoW + 32, height: logoH + 32, borderRadius: '50%', background: 'linear-gradient(135deg, #8D6513, #FFF3C2 35%, #C9971F 60%, #F2D57E)', boxShadow: '0 20px 60px rgba(0,0,0,0.6)'}} />
          <div style={{position: 'absolute', left: 22, top: 22, width: logoW + 16, height: logoH + 16, borderRadius: '50%', background: '#FFFFFF', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
            <Img src={staticFile('assets/brand/church-logo-emblem.png')} style={{width: logoW * 0.92, height: logoH * 0.92, objectFit: 'contain'}} />
            <LightSweep start={40} duration={36} opacity={0.5} />
          </div>
        </div>
        <div style={{height: V ? 60 : 36}} />
        <MaskReveal at={L(c.start) + 2} dur={26}>
          <GoldText size={V ? 62 : 64} spacing={3} sweepAt={L(c.start) + 40} style={{textAlign: 'center', maxWidth: V ? 980 : 1800}}>
            {V ? "CHRIST'S CHOSEN CHURCH\nOF GOD INTERNATIONAL" : "CHRIST'S CHOSEN CHURCH OF GOD INTERNATIONAL"}
          </GoldText>
        </MaskReveal>
        <Rise at={L(c.onsets[0] ?? c.start + 2.7) - 6}>
          <div style={{fontFamily: FONTS.sans, fontWeight: 600, fontSize: V ? 40 : 36, letterSpacing: 14, color: COLORS.white, marginTop: 14, textShadow: '0 2px 12px rgba(0,0,0,0.8)'}}>LAGOS AREA</div>
        </Rise>
        <Rise at={presentsAt}>
          <div style={{fontFamily: FONTS.serif, fontStyle: 'italic', fontWeight: 600, fontSize: V ? 62 : 58, color: COLORS.champagne, marginTop: 18, textShadow: '0 2px 12px rgba(0,0,0,0.8)'}}>proudly presents</div>
        </Rise>
      </AbsoluteFill>
      <Vignette strength={0.8} />
    </AbsoluteFill>
  );
};

/* ========================================================================== */
/* SCENE 2b — Festival title in the wreath, then the THEME reveal              */
/* ========================================================================== */
export const SceneFestival: React.FC<{from: number; hit: number}> = ({from, hit}) => {
  const frame = useCurrentFrame();
  const {width, height} = useVideoConfig();
  const V = height > width;
  const L = (sec: number) => f(sec) - from;
  const H = f(hit) - from; // theme impact frame (local)
  const c = cue('festival');
  const words = (k: number) => L(c.start) + Math.round(((c.end - c.start) * 30 * k));
  const R = V ? 400 : 340;
  const cy = V ? height * 0.47 : height * 0.5;
  // phase A camera: slow push-in. At impact: fly through the wreath.
  const push = interpolate(frame, [0, H], [1.0, 1.08], {extrapolateRight: 'clamp'});
  const fly = frame < H ? 0 : E('power3.in')(Math.min(1, (frame - H) / 14));
  const wreathScale = push * (1 + fly * 3.2);
  const wreathOpacity = 1 - Math.min(1, Math.max(0, (frame - H - 6) / 8));
  const themeP = prog(frame, H + 1, H + 27, 'expo.out');
  const flash = frame >= H - 2 ? Math.exp(-(frame - H + 2) / 7) : 0;
  const shake = frame >= H && frame < H + 14 ? Math.sin(frame * 3.1) * (14 - (frame - H)) * 0.9 : 0;
  const themeC = cue('theme');
  return (
    <AbsoluteFill style={{background: '#14020A'}}>
      {/* phase A background: red velvet */}
      <AbsoluteFill style={{opacity: 1 - themeP, background: `radial-gradient(ellipse at 50% 50%, #7D0E1C 0%, #43050F 50%, #14020A 100%)`}} />
      {/* phase B background: night sky with star & rays */}
      <AbsoluteFill style={{opacity: themeP, background: `radial-gradient(ellipse at 50% 22%, #5A2A10 0%, #3A0812 35%, #14020A 75%)`}} />
      <AbsoluteFill style={{opacity: themeP}}>
        <GodRays y={V ? '14%' : '12%'} opacity={0.75} spin={0.08} spread={90} />
        <BethlehemStar x={width / 2} y={V ? height * 0.17 : height * 0.15} size={V ? 110 : 90} intensity={themeP} />
        <LensFlare x={width / 2} y={V ? height * 0.17 : height * 0.15} opacity={0.5 * themeP} />
      </AbsoluteFill>
      <Bokeh count={22} seed={44} opacity={0.55} />
      <GoldDust count={120} seed={45} burstAt={H} />
      {/* wreath + title */}
      {wreathOpacity > 0 && (
        <AbsoluteFill style={{transform: `scale(${wreathScale})`, transformOrigin: `50% ${(cy / height) * 100}%`, opacity: wreathOpacity}}>
          <AbsoluteFill>
            <div style={{position: 'absolute', left: width / 2 - R * 0.9, top: cy - R * 0.9, width: R * 1.8, height: R * 1.8, borderRadius: '50%', background: 'radial-gradient(circle, #0F4A33 0%, #08301F 70%, #041A10 100%)', boxShadow: 'inset 0 0 60px rgba(0,0,0,0.7)'}} />
          </AbsoluteFill>
          <svg width={width} height={height} style={{position: 'absolute', inset: 0, opacity: prog(frame, 0, 24)}}>
            <Wreath cx={width / 2} cy={cy} radius={R} seed={12} bellStart={4} />
          </svg>
          <AbsoluteFill style={{alignItems: 'center', justifyContent: 'center', top: cy - height / 2, flexDirection: 'column', opacity: 1 - prog(frame, H - 3, H + 2, 'power1.in')}}>
            <Rise at={words(0.05)} scaleFrom={0.7} dist={0}>
              <GoldText size={V ? 150 : 128} weight={900} spacing={6} sweepAt={words(0.1) + 8} glow={0.5}>2026</GoldText>
            </Rise>
            <MaskReveal at={words(0.32)}>
              <GoldText size={V ? 84 : 72} weight={700} spacing={4}>FESTIVAL</GoldText>
            </MaskReveal>
            <MaskReveal at={words(0.45)}>
              <div style={{fontFamily: FONTS.display, fontWeight: 700, fontSize: V ? 46 : 40, letterSpacing: 6, color: COLORS.white, textShadow: '0 2px 10px rgba(0,0,0,0.8)'}}>OF NINE LESSONS</div>
            </MaskReveal>
            <MaskReveal at={words(0.72)}>
              <GoldText size={V ? 84 : 72} weight={700} spacing={4} sweepAt={words(0.8)}>&amp; CAROL</GoldText>
            </MaskReveal>
          </AbsoluteFill>
        </AbsoluteFill>
      )}
      {/* foreground garland frames phase A */}
      <AbsoluteFill style={{opacity: 1 - themeP}}>
        <svg width={width} height={height}>
          <TopGarland width={width} y={-40} seed={15} bells={false} scale={V ? 1 : 0.85} />
        </svg>
      </AbsoluteFill>
      {/* THEME eyebrow appears with "themed" */}
      <AbsoluteFill style={{alignItems: 'center', top: V ? height * 0.07 : height * 0.06, opacity: 1 - themeP}}>
        <Eyebrow text="THEME" at={L(themeC.start) - 4} size={V ? 34 : 30} />
      </AbsoluteFill>
      {/* THE MESSIAH HAS COME! */}
      {frame >= H - 1 && (
        <AbsoluteFill style={{alignItems: 'center', justifyContent: 'center', flexDirection: 'column', transform: `translate(${shake}px, ${shake * 0.6}px)`, paddingTop: V ? 160 : 120}}>
          <div style={{opacity: themeP, transform: `scale(${1.35 - 0.35 * themeP})`, textAlign: 'center'}}>
            <Eyebrow text="THEME" at={H + 6} size={V ? 34 : 30} />
            <div style={{height: 16}} />
            <GoldText size={V ? 132 : 150} weight={900} spacing={V ? 4 : 8} sweepAt={H + 18} glow={0.7} style={{textAlign: 'center'}}>
              {'THE MESSIAH\nHAS COME!'}
            </GoldText>
          </div>
          <Rise at={H + 22}>
            <div style={{marginTop: 26, fontFamily: FONTS.serif, fontStyle: 'italic', fontWeight: 600, fontSize: V ? 46 : 44, color: COLORS.champagne, textShadow: '0 2px 12px rgba(0,0,0,0.85)', textAlign: 'center'}}>
              2026 Festival of Nine Lessons &amp; Carol
            </div>
          </Rise>
          {/* shockwave ring */}
          <div style={{position: 'absolute', left: width / 2, top: height / 2, width: 0, height: 0}}>
            {[0, 6].map((d) => {
              const t = Math.max(0, frame - H - d) / 28;
              if (t <= 0 || t >= 1) return null;
              const rr = 100 + t * (V ? 1100 : 1300);
              return <div key={d} style={{position: 'absolute', left: -rr, top: -rr, width: rr * 2, height: rr * 2, borderRadius: '50%', border: `${6 * (1 - t)}px solid rgba(255,225,150,${0.7 * (1 - t)})`, boxShadow: `0 0 40px rgba(255,210,120,${0.5 * (1 - t)})`}} />;
            })}
          </div>
        </AbsoluteFill>
      )}
      <AbsoluteFill style={{background: 'radial-gradient(circle at 50% 45%, rgba(255,246,220,1) 0%, rgba(255,220,150,0.8) 40%, rgba(255,200,120,0.3) 100%)', opacity: flash * 0.9, mixBlendMode: 'screen'}} />
      <Vignette strength={0.8} />
    </AbsoluteFill>
  );
};
