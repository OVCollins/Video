import React from 'react';
import {useCurrentFrame} from 'remotion';
import {COLORS, FONTS, GOLD_TEXT} from '../theme';
import {prog} from '../ease';

/** Metallic gold text with optional light sweep across the letters. */
export const GoldText: React.FC<{
  children: React.ReactNode;
  size: number;
  font?: string;
  weight?: number;
  spacing?: number;
  sweepAt?: number;
  glow?: number;
  style?: React.CSSProperties;
  italic?: boolean;
}> = ({children, size, font = FONTS.display, weight = 700, spacing = 0, sweepAt, glow = 0.35, style, italic}) => {
  const frame = useCurrentFrame();
  const base: React.CSSProperties = {
    fontFamily: font, fontSize: size, fontWeight: weight, letterSpacing: spacing, lineHeight: 1.05,
    fontStyle: italic ? 'italic' : 'normal', display: 'inline-block', whiteSpace: 'pre-wrap', ...style,
  };
  const t = sweepAt === undefined ? -1 : (frame - sweepAt) / 34;
  return (
    <span style={{position: 'relative', display: 'inline-block'}}>
      <span
        style={{
          ...base,
          backgroundImage: GOLD_TEXT, WebkitBackgroundClip: 'text', backgroundClip: 'text', color: 'transparent',
          filter: `drop-shadow(0 ${size * 0.04}px ${size * 0.06}px rgba(20,4,0,0.75)) drop-shadow(0 0 ${size * 0.35}px rgba(255,200,110,${glow}))`,
        }}
      >
        {children}
      </span>
      {t > 0 && t < 1 && (
        <span
          aria-hidden
          style={{
            ...base, position: 'absolute', left: 0, top: 0, color: 'transparent', WebkitBackgroundClip: 'text', backgroundClip: 'text',
            backgroundImage: `linear-gradient(110deg, rgba(255,255,255,0) ${t * 160 - 40}%, rgba(255,255,245,0.95) ${t * 160 - 25}%, rgba(255,255,255,0) ${t * 160 - 10}%)`,
          }}
        >
          {children}
        </span>
      )}
    </span>
  );
};

/** Line that slides up from behind a mask. */
export const MaskReveal: React.FC<{at: number; dur?: number; children: React.ReactNode; style?: React.CSSProperties; from?: 'up' | 'down'; ease?: string}> = ({
  at, dur = 22, children, style, from = 'up', ease = 'expo.out',
}) => {
  const frame = useCurrentFrame();
  const p = prog(frame, at, at + dur, ease);
  return (
    <div style={{overflow: 'hidden', paddingBottom: '0.12em', paddingTop: '0.06em', ...style}}>
      <div style={{transform: `translateY(${(1 - p) * (from === 'up' ? 110 : -110)}%)`, opacity: Math.min(1, p * 2)}}>{children}</div>
    </div>
  );
};

/** Fade + rise + letter-spacing settle. */
export const Rise: React.FC<{at: number; dur?: number; children: React.ReactNode; style?: React.CSSProperties; dist?: number; scaleFrom?: number}> = ({
  at, dur = 24, children, style, dist = 30, scaleFrom = 1,
}) => {
  const frame = useCurrentFrame();
  const p = prog(frame, at, at + dur, 'power3.out');
  return (
    <div style={{opacity: p, transform: `translateY(${(1 - p) * dist}px) scale(${scaleFrom + (1 - scaleFrom) * p})`, ...style}}>{children}</div>
  );
};

/** Words of a narration line appearing in time with the voice. */
export const SyncedWords: React.FC<{text: string; start: number; end: number; size: number; color?: string; font?: string; italic?: boolean; weight?: number; maxWidth?: number}> = ({
  text, start, end, size, color = COLORS.champagne, font = FONTS.serif, italic = true, weight = 500, maxWidth,
}) => {
  const frame = useCurrentFrame();
  const words = text.split(' ');
  const lens = words.map((w) => w.length + 2);
  const tot = lens.reduce((a, b) => a + b, 0);
  let acc = 0;
  return (
    <div style={{fontFamily: font, fontStyle: italic ? 'italic' : 'normal', fontWeight: weight, fontSize: size, color, textAlign: 'center', lineHeight: 1.25, maxWidth, textShadow: '0 3px 18px rgba(0,0,0,0.8)'}}>
      {words.map((w, i) => {
        const at = start + ((end - start) * acc) / tot - 4;
        acc += lens[i];
        const p = prog(frame, at, at + 14, 'power2.out');
        return (
          <span key={i} style={{display: 'inline-block', opacity: p, transform: `translateY(${(1 - p) * 18}px)`, marginRight: size * 0.28}}>
            {w}
          </span>
        );
      })}
    </div>
  );
};

/** Small spaced caps label with gold hairlines either side. */
export const Eyebrow: React.FC<{text: string; at: number; size?: number; color?: string; line?: number}> = ({text, at, size = 26, color = COLORS.champagne, line = 70}) => {
  const frame = useCurrentFrame();
  const p = prog(frame, at, at + 26, 'power3.out');
  return (
    <div style={{display: 'flex', alignItems: 'center', justifyContent: 'center', gap: size * 0.7, opacity: p}}>
      <div style={{height: 2, width: line * p, background: `linear-gradient(90deg, rgba(212,175,55,0), ${COLORS.gold})`}} />
      <div style={{fontFamily: FONTS.display, fontWeight: 500, fontSize: size, letterSpacing: size * 0.28, color, textShadow: '0 2px 10px rgba(0,0,0,0.8)', whiteSpace: 'nowrap', transform: `translateY(${(1 - p) * 10}px)`}}>
        {text}
      </div>
      <div style={{height: 2, width: line * p, background: `linear-gradient(270deg, rgba(212,175,55,0), ${COLORS.gold})`}} />
    </div>
  );
};

/** Ornamental gold divider with a small star. */
export const Divider: React.FC<{at: number; width: number}> = ({at, width}) => {
  const frame = useCurrentFrame();
  const p = prog(frame, at, at + 30, 'power3.inOut');
  return (
    <div style={{position: 'relative', width, height: 20, margin: '0 auto'}}>
      <div style={{position: 'absolute', top: 9, left: width / 2 - (width / 2) * p, width: width * p, height: 2, background: `linear-gradient(90deg, rgba(212,175,55,0), ${COLORS.gold} 30%, ${COLORS.goldLight} 50%, ${COLORS.gold} 70%, rgba(212,175,55,0))`}} />
      <svg width={20} height={20} viewBox="-10 -10 20 20" style={{position: 'absolute', left: width / 2 - 10, top: 0, opacity: p, transform: `rotate(${p * 45}deg)`}}>
        <path d="M0 -9 L2 -2 L9 0 L2 2 L0 9 L-2 2 L-9 0 L-2 -2 Z" fill={COLORS.goldLight} />
      </svg>
    </div>
  );
};
