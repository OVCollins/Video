import React, {useMemo} from 'react';
import * as THREE from 'three';

/* "JOY" - an original blocky choir-kid character.
   Everything is built from simple boxes; the face is a painted canvas texture. */

const SKIN = '#8A5A3B';
const ROBE = '#B5121F';
const ROBE_DARK = '#7E0A15';
const GOLD = '#E0B23C';
const WHITE = '#FFF6E8';
const HAIR = '#1E1410';

const faceTexture = () => {
  const c = document.createElement('canvas');
  c.width = c.height = 512;
  const g = c.getContext('2d')!;
  g.fillStyle = SKIN;
  g.fillRect(0, 0, 512, 512);
  // cheeks
  g.fillStyle = 'rgba(220,90,90,0.35)';
  g.beginPath(); g.ellipse(120, 330, 46, 30, 0, 0, Math.PI * 2); g.fill();
  g.beginPath(); g.ellipse(392, 330, 46, 30, 0, 0, Math.PI * 2); g.fill();
  // eyebrows
  g.strokeStyle = HAIR; g.lineWidth = 18; g.lineCap = 'round';
  g.beginPath(); g.moveTo(120, 170); g.quadraticCurveTo(165, 145, 210, 165); g.stroke();
  g.beginPath(); g.moveTo(302, 165); g.quadraticCurveTo(347, 145, 392, 170); g.stroke();
  // eyes
  for (const x of [165, 347]) {
    g.fillStyle = '#1A0F0A';
    g.beginPath(); g.roundRect(x - 34, 205, 68, 92, 30); g.fill();
    g.fillStyle = '#FFFFFF';
    g.beginPath(); g.arc(x + 12, 232, 14, 0, Math.PI * 2); g.fill();
    g.beginPath(); g.arc(x - 12, 272, 7, 0, Math.PI * 2); g.fill();
  }
  // smile
  g.fillStyle = '#4A1A12';
  g.beginPath(); g.moveTo(180, 350); g.quadraticCurveTo(256, 450, 332, 350); g.quadraticCurveTo(256, 380, 180, 350); g.fill();
  g.fillStyle = '#FFFFFF';
  g.beginPath(); g.moveTo(200, 358); g.quadraticCurveTo(256, 382, 312, 358); g.quadraticCurveTo(256, 372, 200, 358); g.fill();
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = 8;
  return t;
};

type BoxProps = {size: [number, number, number]; position?: [number, number, number]; color: string; rotation?: [number, number, number]; metal?: number; rough?: number; emissive?: string; emissiveIntensity?: number};
export const Box: React.FC<BoxProps> = ({size, position = [0, 0, 0], color, rotation = [0, 0, 0], metal = 0, rough = 0.6, emissive, emissiveIntensity = 0}) => (
  <mesh position={position} rotation={rotation} castShadow receiveShadow>
    <boxGeometry args={size} />
    <meshStandardMaterial color={color} metalness={metal} roughness={rough} emissive={emissive ?? '#000'} emissiveIntensity={emissiveIntensity} />
  </mesh>
);

const Gold: React.FC<Omit<BoxProps, 'color'>> = (p) => <Box {...p} color={GOLD} metal={0.35} rough={0.35} emissive="#6B4A08" emissiveIntensity={0.35} />;

export const Joy: React.FC<{wave: number; bob: number; headTurn?: number}> = ({wave, bob, headTurn = 0}) => {
  const face = useMemo(faceTexture, []);
  const headMats = useMemo(() => {
    const skin = new THREE.MeshStandardMaterial({color: SKIN, roughness: 0.65});
    return [skin, skin, skin, skin, new THREE.MeshStandardMaterial({map: face, roughness: 0.6}), skin];
  }, [face]);
  return (
    <group position={[0, bob, 0]}>
      {/* feet */}
      <Box size={[0.6, 0.3, 0.8]} position={[-0.42, 0.15, 0.08]} color="#2A1A12" />
      <Box size={[0.6, 0.3, 0.8]} position={[0.42, 0.15, 0.08]} color="#2A1A12" />
      {/* lower robe (wider, like a choir gown) */}
      <Box size={[1.9, 1.5, 1.0]} position={[0, 1.05, 0]} color={ROBE} />
      <Box size={[1.94, 0.12, 1.04]} position={[0, 0.36, 0]} color={ROBE_DARK} />
      {/* torso */}
      <Box size={[1.7, 1.6, 0.9]} position={[0, 2.55, 0]} color={ROBE} />
      {/* white collar */}
      <Box size={[1.1, 0.22, 0.95]} position={[0, 3.36, 0]} color={WHITE} />
      {/* gold stole: two bands down the front, with crosses */}
      {[-0.42, 0.42].map((x) => (
        <group key={x}>
          <Gold size={[0.3, 1.55, 0.06]} position={[x, 2.55, 0.47]} />
          <Gold size={[0.3, 1.2, 0.06]} position={[x * 1.05, 1.15, 0.52]} />
          <Box size={[0.07, 0.36, 0.03]} position={[x * 1.05, 0.85, 0.565]} color={ROBE_DARK} />
          <Box size={[0.22, 0.07, 0.03]} position={[x * 1.05, 0.92, 0.565]} color={ROBE_DARK} />
        </group>
      ))}
      {/* star badge */}
      <Gold size={[0.22, 0.22, 0.05]} position={[0, 2.85, 0.47]} rotation={[0, 0, Math.PI / 4]} />
      {/* left arm holding a gold hymn book */}
      <group position={[-1.12, 3.15, 0]} rotation={[-0.75, 0, 0.12]}>
        <Box size={[0.56, 1.5, 0.62]} position={[0, -0.75, 0]} color={ROBE} />
        <Box size={[0.48, 0.42, 0.5]} position={[0, -1.66, 0]} color={SKIN} />
      </group>
      <group position={[-0.9, 2.25, 1.42]} rotation={[0.3, 0.3, 0]}>
        <Box size={[0.95, 0.72, 0.16]} position={[0, 0, 0]} color={ROBE_DARK} />
        <Gold size={[0.97, 0.74, 0.04]} position={[0, 0, 0.09]} />
        <Box size={[0.08, 0.36, 0.02]} position={[0, 0.02, 0.115]} color={ROBE_DARK} />
        <Box size={[0.26, 0.08, 0.02]} position={[0, 0.1, 0.115]} color={ROBE_DARK} />
      </group>
      {/* right arm waving */}
      <group position={[1.12, 3.2, 0]} rotation={[0, 0, 2.55 + wave]}>
        <Box size={[0.56, 1.5, 0.62]} position={[0, -0.75, 0]} color={ROBE} />
        <Box size={[0.48, 0.42, 0.5]} position={[0, -1.66, 0]} color={SKIN} />
      </group>
      {/* head */}
      <group position={[0, 4.12, 0]} rotation={[0, headTurn, 0]}>
        <mesh castShadow receiveShadow material={headMats}>
          <boxGeometry args={[1.35, 1.35, 1.35]} />
        </mesh>
        {/* hair */}
        <Box size={[1.42, 0.3, 1.42]} position={[0, 0.72, 0]} color={HAIR} rough={0.9} />
        <Box size={[1.42, 0.9, 0.2]} position={[0, 0.3, -0.62]} color={HAIR} rough={0.9} />
        {/* Christmas hat: blocky stepped cone */}
        <Box size={[1.55, 0.3, 1.55]} position={[0, 0.95, 0]} color={WHITE} rough={1} />
        <Box size={[1.2, 0.4, 1.2]} position={[0, 1.3, -0.02]} color={ROBE} />
        <Box size={[0.85, 0.4, 0.85]} position={[0.06, 1.68, -0.08]} color={ROBE} rotation={[0, 0, -0.12]} />
        <Box size={[0.5, 0.4, 0.5]} position={[0.2, 2.02, -0.14]} color={ROBE} rotation={[0, 0, -0.3]} />
        <Box size={[0.36, 0.36, 0.36]} position={[0.42, 2.28, -0.18]} color={WHITE} rough={1} />
      </group>
    </group>
  );
};

/* Blocky Christmas tree */
export const BlockTree: React.FC<{position: [number, number, number]; scale?: number; twinkle: number}> = ({position, scale = 1, twinkle}) => {
  const tiers = [3.2, 2.6, 2.0, 1.4, 0.8];
  const lights: [number, number, number, string][] = [
    [-1.3, 1.25, 1.62, '#FFD86B'], [0.9, 1.3, 1.62, '#FF5A5A'], [-0.6, 2.25, 1.32, '#FFF2C4'], [1.0, 2.2, 1.32, '#FFD86B'],
    [0.2, 3.15, 1.02, '#FF5A5A'], [-0.5, 3.1, 1.02, '#FFD86B'], [0.3, 4.05, 0.72, '#FFF2C4'], [-1.0, 1.35, 1.62, '#FF5A5A'],
  ];
  return (
    <group position={position} scale={scale}>
      <Box size={[0.6, 0.8, 0.6]} position={[0, 0.4, 0]} color="#5A3A22" />
      {tiers.map((w, i) => (
        <Box key={i} size={[w, 0.95, w]} position={[0, 1.25 + i * 0.92, 0]} color={i % 2 ? '#1C6B42' : '#165A37'} />
      ))}
      {lights.map(([x, y, z, c], i) => (
        <Box key={i} size={[0.2, 0.2, 0.2]} position={[x, y, z]} color={c} emissive={c} emissiveIntensity={1.2 + 0.8 * Math.sin(twinkle + i * 1.7)} />
      ))}
      <Box size={[0.55, 0.55, 0.2]} position={[0, 6.0, 0]} rotation={[0, 0, Math.PI / 4]} color={GOLD} metal={0.3} rough={0.3} emissive={GOLD} emissiveIntensity={1.2} />
    </group>
  );
};

export const Gift: React.FC<{position: [number, number, number]; size: number; color: string; ribbon: string; rot?: number}> = ({position, size, color, ribbon, rot = 0}) => (
  <group position={position} rotation={[0, rot, 0]}>
    <Box size={[size, size, size]} position={[0, size / 2, 0]} color={color} />
    <Box size={[size * 1.02, size * 1.02, size * 0.18]} position={[0, size / 2, 0]} color={ribbon} metal={0.3} rough={0.35} />
    <Box size={[size * 0.18, size * 1.02, size * 1.02]} position={[0, size / 2, 0]} color={ribbon} metal={0.3} rough={0.35} />
    <Box size={[size * 0.4, size * 0.2, size * 0.4]} position={[0, size + 0.08, 0]} color={ribbon} metal={0.3} rough={0.35} rotation={[0, Math.PI / 4, 0]} />
  </group>
);
