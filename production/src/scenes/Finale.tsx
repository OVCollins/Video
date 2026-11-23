import React from 'react';
import {AbsoluteFill, Img, interpolate, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';
import {COLORS, FONTS} from '../theme';
import {prog, lerp} from '../ease';
import {cue, f, SECTIONS} from '../timing';
import {ChristmasTree, Ornament, PineBranch, Bell, Bow, swing} from '../components/Decor';
import {BethlehemStar, Bokeh, GodRays, GoldDust, LensFlare, Vignette} from '../components/Light';
import {GoldText, Divider} from '../components/Text';

/** Positioned element (centre anchored) that glides between two layouts. */
const At: React.FC<{x: number; y: number; s?: number; o?: number; children: React.ReactNode}> = ({x, y, s = 1, o = 1, children}) => (
  <div style={{position: 'absolute', left: x, top: y, transform: `translate(-50%, -50%) scale(${s})`, opacity: o, textAlign: 'center', whiteSpace: 'nowrap', width: 'max-content'}}>{children}</div>
);

export const SceneFinale: React.FC<{from: number}> = ({from}) => {
  const frame = useCurrentFrame();
  const {width, height} = useVideoConfig();
  const V = height > width;
  const L = (sec: number) => f(sec) - from;
  const c1 = cue('finale1');
  const c2 = cue('finale2');
  const c3 = cue('finale3');
  const finalChord = SECTIONS.finale + (3 * (SECTIONS.end - SECTIONS.finale)) / 5;
  const M = L(finalChord) - 8; // morph into the final composition
  const m = prog(frame, M, M + 40, 'power3.inOut');
  const a1 = prog(frame, L(c1.start) - 6, L(c1.start) + 22, 'expo.out');
  const a2 = prog(frame, L(c2.start) - 4, L(c2.start) + 22, 'power3.out');
  const a3 = prog(frame, L(c3.start) - 4, L(c3.start) + 16, 'back.out(2)');
  const late = (k: number) => prog(frame, M + k, M + k + 30, 'power3.out');
  const starRise = prog(frame, 0, 70, 'power2.out');
  const starY = lerp(V ? height * 0.42 : height * 0.5, V ? height * 0.085 : height * 0.1, starRise);
  const treesOn = prog(frame, 10, 60);
  const cx = width / 2;
  const zoom = interpolate(frame, [0, 400], [1.06, 1.0]);

  // layout: [phase-1 position, final-frame position]
  const Ls = V
    ? {theme1: [760, 790], theme2: [880, 900], tag: [1040, 1028], dont: [1190, 1490], fest: 560, church: 430, logo: 268, date: 1150, time: 1235, venue: 1360}
    : {theme1: [380, 380], theme2: [535, 495], tag: [670, 592], dont: [810, 922], fest: 282, church: 214, logo: 108, date: 690, time: 690, venue: 790};
  const yy = (k: keyof typeof Ls) => {
    const v = Ls[k] as number[];
    return lerp(v[0], v[1], m);
  };
  const themeSize = V ? lerp(118, 104, m) : lerp(150, 112, m);
  return (
    <AbsoluteFill style={{background: 'linear-gradient(180deg, #12030A 0%, #2A0510 45%, #4A0A16 75%, #2A0A08 100%)'}}>
      <AbsoluteFill style={{background: `radial-gradient(ellipse at 50% ${(starY / height) * 100}%, rgba(255,200,120,0.45) 0%, rgba(160,40,30,0.15) 30%, rgba(0,0,0,0) 60%)`}} />
      <GodRays y={`${(starY / height) * 100}%`} opacity={0.6 * starRise} spin={0.06} spread={95} />
      <Bokeh count={26} seed={121} opacity={0.6} />
      <BethlehemStar x={cx} y={starY} size={V ? 90 : 80} intensity={starRise} />
      <LensFlare x={cx} y={starY} opacity={0.4 * starRise} />
      {/* trees & festive framing */}
      <AbsoluteFill style={{transform: `scale(${zoom})`, transformOrigin: '50% 100%'}}>
        <svg width={width} height={height}>
          <ChristmasTree x={V ? 105 : 150} y={height + 10} height={V ? 470 : 640} seed={31} lightsOn={treesOn} />
          <ChristmasTree x={V ? width - 105 : width - 150} y={height + 10} height={V ? 470 : 640} seed={32} lightsOn={treesOn} />
          <PineBranch x={-40} y={-30} rotate={30} length={V ? 330 : 380} seed={141} tint="dark" />
          <PineBranch x={width + 40} y={-30} rotate={150} length={V ? 330 : 380} seed={142} tint="dark" />
          <Ornament id="fn1" x={V ? 150 : 250} y={0} r={30} string={V ? 150 : 120} color="red" phase={1} />
          <Ornament id="fn2" x={V ? width - 150 : width - 250} y={0} r={28} string={V ? 120 : 90} color="gold" phase={2} />
          {!V && <Ornament id="fn3" x={380} y={0} r={22} string={60} color="gold" phase={3} />}
          {!V && <Ornament id="fn4" x={width - 380} y={0} r={22} string={50} color="red" phase={4} />}
          <Bell id="fb1" x={V ? 60 : 90} y={V ? 60 : 50} size={V ? 110 : 120} angle={swing(frame, M, 22, 40, 0.01)} />
          <Bell id="fb2" x={V ? width - 60 : width - 90} y={V ? 60 : 50} size={V ? 110 : 120} angle={swing(frame, M + 4, -22, 42, 0.01)} />
          <Bow id="fbw1" x={V ? 60 : 90} y={V ? 60 : 52} size={120} rotate={-10} />
          <Bow id="fbw2" x={V ? width - 60 : width - 90} y={V ? 60 : 52} size={120} rotate={10} />
        </svg>
      </AbsoluteFill>
      <GoldDust count={150} seed={122} burstAt={M} />
      <GoldDust count={60} seed={123} size={1.3} />

      {/* text */}
      <AbsoluteFill>
        {/* final-frame elements */}
        <At x={cx} y={Ls.logo} o={late(0)} s={0.85 + 0.15 * late(0)}>
          <div style={{width: V ? 150 : 120, height: (V ? 150 : 120) * (1030 / 785), borderRadius: '50%', background: '#fff', border: '4px solid #E7C463', boxShadow: '0 0 40px rgba(255,210,120,0.5)', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
            <Img src={staticFile('assets/brand/church-logo-emblem.png')} style={{width: '90%', height: '90%', objectFit: 'contain'}} />
          </div>
        </At>
        <At x={cx} y={Ls.church} o={late(4)}>
          <div style={{fontFamily: FONTS.sans, fontWeight: 700, fontSize: V ? 35 : 27, letterSpacing: V ? 2 : 4, color: COLORS.white, lineHeight: 1.35, textShadow: '0 2px 10px rgba(0,0,0,0.9)'}}>
            {V ? (
              <>
                CHRIST&apos;S CHOSEN CHURCH OF GOD
                <br />
                INTERNATIONAL, LAGOS AREA
              </>
            ) : (
              "CHRIST'S CHOSEN CHURCH OF GOD INTERNATIONAL, LAGOS AREA"
            )}
          </div>
        </At>
        <At x={cx} y={Ls.fest} o={late(8)}>
          <GoldText size={V ? 58 : 50} weight={700} spacing={3} style={{textAlign: 'center'}}>
            {V ? '2026 FESTIVAL OF\nNINE LESSONS & CAROL' : '2026 FESTIVAL OF NINE LESSONS & CAROL'}
          </GoldText>
        </At>
        {/* theme (spoken, then held) */}
        <At x={cx} y={yy('theme1')} o={a1} s={1.2 - 0.2 * a1}>
          <GoldText size={themeSize} weight={900} spacing={6} sweepAt={L(c1.start) + 10} glow={0.65}>THE MESSIAH</GoldText>
        </At>
        <At x={cx} y={yy('theme2')} o={a1} s={1.2 - 0.2 * a1}>
          <GoldText size={themeSize} weight={900} spacing={6} sweepAt={L(c1.start) + 16} glow={0.65}>HAS COME!</GoldText>
        </At>
        <At x={cx} y={yy('tag')} o={a2}>
          <div style={{fontFamily: FONTS.serif, fontStyle: 'italic', fontWeight: 600, fontSize: V ? lerp(56, 48, m) : lerp(60, 44, m), color: COLORS.champagne, textShadow: '0 2px 14px rgba(0,0,0,0.9)', lineHeight: 1.2}}>
            {V ? (
              <>
                Come, celebrate
                <br />
                the King of Kings.
              </>
            ) : (
              'Come, celebrate the King of Kings.'
            )}
          </div>
        </At>
        {/* date / time / venue band */}
        <At x={cx} y={V ? Ls.date + 40 : Ls.date} o={late(12)} s={0.9 + 0.1 * late(12)}>
          <div style={{position: 'relative', padding: V ? '26px 60px' : '22px 70px', background: 'linear-gradient(180deg, #B3172A 0%, #7A0915 100%)', border: '3px solid #E7C463', borderRadius: 16, boxShadow: '0 16px 40px rgba(0,0,0,0.55), inset 0 0 0 6px rgba(231,196,99,0.18)'}}>
            <div style={{fontFamily: FONTS.sans, fontWeight: 800, fontSize: V ? 52 : 44, letterSpacing: 3, color: COLORS.white, lineHeight: 1.25}}>
              {V ? (
                <>
                  SUNDAY, 20 DECEMBER 2026
                  <br />
                  <span style={{color: COLORS.goldLight}}>10:00 AM</span>
                </>
              ) : (
                <>
                  SUNDAY, 20 DECEMBER 2026 <span style={{color: COLORS.goldLight, margin: '0 18px'}}>•</span> <span style={{color: COLORS.goldLight}}>10:00 AM</span>
                </>
              )}
            </div>
          </div>
        </At>
        <At x={cx} y={Ls.venue} o={late(16)}>
          <div style={{display: 'flex', alignItems: 'center', gap: 14, fontFamily: FONTS.sans, fontWeight: 600, fontSize: V ? 40 : 32, color: COLORS.white, textShadow: '0 2px 10px rgba(0,0,0,0.9)', lineHeight: 1.3}}>
            <svg width={V ? 34 : 30} height={V ? 44 : 40} viewBox="-15 -36 30 40">
              <path d="M0 0 C-4 -9 -13 -16 -13 -24 A13 13 0 1 1 13 -24 C13 -16 4 -9 0 0 Z" fill="#D42335" stroke="#FFE8A8" strokeWidth={2.4} />
              <circle cx={0} cy={-24} r={5} fill="#FFF3C2" />
            </svg>
            <span style={{textAlign: 'left'}}>
              {V ? (
                <>
                  30 Fadunsi Street, Fako Estate,
                  <br />
                  Oke-Ira, Ogba, Lagos
                </>
              ) : (
                '30 Fadunsi Street, Fako Estate, Oke-Ira, Ogba, Lagos'
              )}
            </span>
          </div>
        </At>
        {/* DON'T MISS IT! */}
        <At x={cx} y={yy('dont')} o={a3} s={(0.6 + 0.4 * a3) * lerp(1, V ? 0.8 : 0.62, m)}>
          <div style={{display: 'inline-block', padding: '12px 46px', background: `linear-gradient(90deg, rgba(212,175,55,0), rgba(212,175,55,${0.25 * (1 - m)}) 20%, rgba(212,175,55,${0.25 * (1 - m)}) 80%, rgba(212,175,55,0))`}}>
            <GoldText size={V ? 84 : 86} font={FONTS.sans} weight={800} spacing={8} glow={0.6} sweepAt={L(c3.start) + 8}>
              DON&apos;T MISS IT!
            </GoldText>
          </div>
        </At>
        <At x={cx} y={V ? 1095 : 640} o={late(10) * 0}>
          <Divider at={M + 10} width={V ? 600 : 700} />
        </At>
      </AbsoluteFill>
      <Vignette strength={0.65} />
    </AbsoluteFill>
  );
};
