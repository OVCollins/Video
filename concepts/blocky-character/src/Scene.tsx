import React, {useEffect} from 'react';
import {AbsoluteFill, useCurrentFrame, useVideoConfig} from 'remotion';
import {ThreeCanvas} from '@remotion/three';
import {useThree} from '@react-three/fiber';
import {Joy, BlockTree, Gift, Box} from './Character';

const Cam: React.FC<{pos: [number, number, number]; target: [number, number, number]}> = ({pos, target}) => {
  const {camera, size} = useThree();
  const cam = camera as import('three').PerspectiveCamera;
  cam.position.set(...pos);
  cam.fov = 30;
  cam.aspect = size.width / size.height;
  cam.lookAt(...target);
  cam.updateProjectionMatrix();
  useEffect(() => undefined, []);
  return null;
};

export const Hero: React.FC<{orbit?: boolean}> = ({orbit}) => {
  const frame = useCurrentFrame();
  const {width, height} = useVideoConfig();
  const t = frame / 30;
  const wave = Math.sin(t * 7) * 0.35;
  const bob = Math.abs(Math.sin(t * 3.5)) * 0.08;
  const ang = orbit ? -0.45 + t * 0.35 : -0.42;
  const r = 16.5;
  const camPos: [number, number, number] = [Math.sin(ang) * r, 6.2, Math.cos(ang) * r];
  return (
    <AbsoluteFill style={{background: 'radial-gradient(ellipse at 50% 35%, #6E1A12 0%, #3A0810 50%, #12030A 100%)'}}>
      {/* soft background bokeh */}
      {Array.from({length: 18}, (_, i) => {
        const x = (i * 137) % 100;
        const y = (i * 61) % 60;
        const s = 60 + ((i * 47) % 120);
        return <div key={i} style={{position: 'absolute', left: `${x}%`, top: `${y}%`, width: s, height: s, borderRadius: '50%', background: 'radial-gradient(circle, rgba(255,210,120,0.35) 0%, rgba(255,210,120,0) 70%)', opacity: 0.6 + 0.4 * Math.sin(t * 2 + i)}} />;
      })}
      <ThreeCanvas width={width} height={height} shadows camera={{fov: 32, position: camPos}} gl={{antialias: true}}>
        <Cam pos={camPos} target={[-0.1, 2.9, -0.4]} />
        <ambientLight intensity={0.55} color="#FFE6CC" />
        <hemisphereLight args={['#FFE2B0', '#3A0810', 0.6]} />
        <directionalLight position={[6, 12, 8]} intensity={2.2} color="#FFF1DA" castShadow shadow-mapSize-width={2048} shadow-mapSize-height={2048} shadow-camera-left={-10} shadow-camera-right={10} shadow-camera-top={10} shadow-camera-bottom={-10} />
        <pointLight position={[-5, 4, 3]} intensity={30} color="#FFB347" distance={20} />
        <pointLight position={[3, 6, -6]} intensity={40} color="#FF6A5A" distance={25} />
        {/* stage platform */}
        <Box size={[16, 0.6, 9]} position={[0, -0.3, -1]} color="#0F4A33" rough={0.8} />
        <Box size={[16.2, 0.2, 9.2]} position={[0, -0.02, -1]} color="#C9A33A" metal={0.6} rough={0.4} />
        <Box size={[15.6, 0.08, 8.6]} position={[0, 0.06, -1]} color="#14593D" rough={0.8} />
        <Joy wave={wave} bob={bob} headTurn={0.12} />
        <BlockTree position={[-4.6, 0, -2.2]} twinkle={t * 4} />
        <Gift position={[2.6, 0, 0.6]} size={0.9} color="#B5121F" ribbon="#E0B23C" rot={0.4} />
        <Gift position={[3.5, 0, -0.4]} size={1.2} color="#0F5A3A" ribbon="#E0B23C" rot={-0.3} />
        <Gift position={[3.0, 1.2, -0.4]} size={0.6} color="#FFF6E8" ribbon="#B5121F" rot={0.6} />
        <Gift position={[-3.0, 0, 0.9]} size={0.7} color="#E0B23C" ribbon="#B5121F" rot={0.2} />
      </ThreeCanvas>
      <div style={{position: 'absolute', left: 70, bottom: 60, fontFamily: 'Georgia, serif', color: '#F7E7CE', textShadow: '0 2px 10px rgba(0,0,0,0.8)'}}>
        <div style={{fontSize: 30, letterSpacing: 6, color: '#E7C463', fontFamily: 'Arial, sans-serif', fontWeight: 700}}>CHARACTER CONCEPT</div>
        <div style={{fontSize: 84, fontWeight: 700, lineHeight: 1.05}}>Joy</div>
        <div style={{fontSize: 34, fontStyle: 'italic'}}>the choir kid</div>
      </div>
    </AbsoluteFill>
  );
};
