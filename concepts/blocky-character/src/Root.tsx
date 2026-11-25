import React from 'react';
import {Composition} from 'remotion';
import {Hero} from './Scene';

export const Root: React.FC = () => (
  <>
    <Composition id="Hero" component={Hero} durationInFrames={150} fps={30} width={1920} height={1080} />
    <Composition id="Turntable" component={() => <Hero orbit />} durationInFrames={180} fps={30} width={1920} height={1080} />
  </>
);
