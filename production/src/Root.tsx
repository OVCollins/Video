import React from 'react';
import {Composition} from 'remotion';
import {Trailer} from './Trailer';
import {DURATION_FRAMES, FPS} from './timing';

export const RemotionRoot: React.FC = () => (
  <>
    <Composition id="Landscape" component={Trailer} durationInFrames={DURATION_FRAMES} fps={FPS} width={1920} height={1080} />
    <Composition id="Vertical" component={Trailer} durationInFrames={DURATION_FRAMES} fps={FPS} width={1080} height={1920} />
  </>
);
