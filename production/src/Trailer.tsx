import React from 'react';
import {AbsoluteFill, Audio, Sequence, interpolate, staticFile, useCurrentFrame} from 'remotion';
import './fonts';
import {E} from './ease';
import {cue, f, SECTIONS as S, DURATION_FRAMES} from './timing';
import {SceneIntro, SceneChurch, SceneFestival} from './scenes/Opening';
import {SceneInfo} from './scenes/Info';
import {ScenePerson, SceneFeaturing, SceneChoirs} from './scenes/PeopleScenes';
import {SceneFinale} from './scenes/Finale';
import {Grain} from './components/Light';

const XF = 14; // cross-dissolve length (frames)

/** Incoming scene: dissolve + gentle settle from a slight push. */
const Enter: React.FC<{children: React.ReactNode; first?: boolean}> = ({children, first}) => {
  const frame = useCurrentFrame();
  if (first) return <AbsoluteFill>{children}</AbsoluteFill>;
  const p = E('power2.out')(Math.min(1, frame / XF));
  const s = interpolate(E('power3.out')(Math.min(1, frame / 30)), [0, 1], [1.06, 1]);
  return <AbsoluteFill style={{opacity: p, transform: `scale(${s})`}}>{children}</AbsoluteFill>;
};

/** Warm light-leak flash across each cut. */
const LightLeak: React.FC<{at: number; strength?: number}> = ({at, strength = 0.55}) => {
  const frame = useCurrentFrame();
  const d = Math.abs(frame - at);
  if (d > XF) return null;
  const o = strength * (1 - d / XF) ** 2;
  const x = interpolate(frame, [at - XF, at + XF], [20, 80]);
  return (
    <AbsoluteFill style={{mixBlendMode: 'screen', opacity: o, background: `radial-gradient(ellipse at ${x}% 40%, rgba(255,214,150,1) 0%, rgba(255,150,80,0.6) 30%, rgba(120,20,10,0) 70%)`}} />
  );
};

export const Trailer: React.FC = () => {
  const festStart = cue('festival').start - 0.35;
  const scenes: {from: number; to: number; el: (from: number) => React.ReactNode}[] = [
    {from: 0, to: S.announce, el: (fr) => <SceneIntro from={fr} />},
    {from: S.announce, to: festStart, el: (fr) => <SceneChurch from={fr} />},
    {from: festStart, to: S.info, el: (fr) => <SceneFestival from={fr} hit={S.hit} />},
    {from: S.info, to: S.leader, el: (fr) => <SceneInfo from={fr} />},
    {from: S.leader, to: S.oguibe, el: (fr) => <ScenePerson from={fr} who="leader" label="UNDER THE SPIRITUAL LEADERSHIP OF" cueId="leader" side="left" backdrop="velvet" seed={2} star />},
    {from: S.oguibe, to: S.choirs, el: (fr) => <SceneFeaturing from={fr} />},
    {from: S.choirs, to: S.overo, el: (fr) => <SceneChoirs from={fr} />},
    {from: S.overo, to: S.chairman, el: (fr) => <ScenePerson from={fr} who="overo" label="LED BY" cueId="overo" side="right" backdrop="music" seed={3} motif />},
    {from: S.chairman, to: S.announcer, el: (fr) => <ScenePerson from={fr} who="chairman" label="UNDER THE CHAIRMANSHIP OF" cueId="chairman" side="left" backdrop="gold" seed={6} />},
    {from: S.announcer, to: S.finale, el: (fr) => <ScenePerson from={fr} who="announcer" label="ANNOUNCER" cueId="announcer" side="right" backdrop="velvet" seed={7} />},
    {from: S.finale, to: S.end, el: (fr) => <SceneFinale from={fr} />},
  ];
  return (
    <AbsoluteFill style={{background: '#000'}}>
      {scenes.map((sc, i) => {
        const from = f(sc.from);
        const to = i === scenes.length - 1 ? DURATION_FRAMES : f(sc.to) + XF + 2;
        return (
          <Sequence key={i} from={from} durationInFrames={to - from} name={`Scene ${i + 1}`}>
            <Enter first={i === 0}>{sc.el(from)}</Enter>
          </Sequence>
        );
      })}
      {scenes.slice(1).map((sc, i) => (
        <LightLeak key={i} at={f(sc.from) + 4} strength={i === 1 ? 0.3 : 0.5} />
      ))}
      <Grain opacity={0.05} />
      <Audio src={staticFile('audio/soundtrack.wav')} />
    </AbsoluteFill>
  );
};
