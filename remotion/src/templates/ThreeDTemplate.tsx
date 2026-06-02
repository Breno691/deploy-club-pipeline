// ThreeDTemplate.tsx
// Template com elementos 3D usando @remotion/three + @react-three/fiber.
// Cenas: esfera de dados girando, cubo de KPIs, partículas em órbita, CTA 3D.
// @remotion/three garante renderização determinística frame-a-frame.

import React, { useRef } from 'react';
import { AbsoluteFill, useCurrentFrame, useVideoConfig, interpolate, spring } from 'remotion';
import { ThreeCanvas } from '@remotion/three';
// OrbitControls available from @react-three/drei if needed
import * as THREE from 'three';

// ── 3D: ESFERA GIRATÓRIA COM WIREFRAME ───────────────────────────────────────
const DataSphere: React.FC<{ frame: number }> = ({ frame }) => {
  const rotX = frame * 0.012;
  const rotY = frame * 0.018;
  const scale = 1 + Math.sin(frame * 0.04) * 0.04;

  return (
    <group rotation={[rotX, rotY, 0]} scale={scale}>
      {/* Solid inner sphere */}
      <mesh>
        <sphereGeometry args={[1.2, 32, 32]} />
        <meshStandardMaterial color="#1e3a5f" metalness={0.6} roughness={0.3} />
      </mesh>
      {/* Wireframe overlay */}
      <mesh>
        <sphereGeometry args={[1.22, 16, 16]} />
        <meshBasicMaterial color="#3B82F6" wireframe opacity={0.35} transparent />
      </mesh>
      {/* Outer glow sphere */}
      <mesh>
        <sphereGeometry args={[1.45, 16, 16]} />
        <meshBasicMaterial color="#60A5FA" wireframe opacity={0.12} transparent />
      </mesh>
      {/* Equatorial ring */}
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[1.6, 0.02, 8, 64]} />
        <meshBasicMaterial color="#10B981" />
      </mesh>
    </group>
  );
};

// ── 3D: CUBO FLUTUANTE COM ARESTAS ───────────────────────────────────────────
const FloatingCube: React.FC<{ frame: number; position: [number, number, number]; color?: string; delay?: number }> = ({ frame, position, color = '#3B82F6', delay = 0 }) => {
  const f = Math.max(0, frame - delay);
  const rotY = f * 0.025;
  const rotX = f * 0.015;
  const floatY = Math.sin(f * 0.05 + delay * 0.1) * 0.15;
  const enterScale = Math.min(1, f / 20);

  return (
    <group position={[position[0], position[1] + floatY, position[2]]} rotation={[rotX, rotY, 0]} scale={enterScale}>
      <mesh>
        <boxGeometry args={[0.5, 0.5, 0.5]} />
        <meshStandardMaterial color={color} metalness={0.5} roughness={0.4} />
      </mesh>
      <lineSegments>
        <edgesGeometry args={[new THREE.BoxGeometry(0.52, 0.52, 0.52)]} />
        <lineBasicMaterial color="white" opacity={0.5} transparent />
      </lineSegments>
    </group>
  );
};

// ── 3D: PARTÍCULAS EM ÓRBITA ─────────────────────────────────────────────────
const OrbitParticles: React.FC<{ frame: number; count?: number }> = ({ frame, count = 40 }) => {
  const particles = React.useMemo(() =>
    Array.from({ length: count }, (_, i) => ({
      radius: 2.2 + (i % 4) * 0.4,
      angle:  (i / count) * Math.PI * 2,
      speed:  0.01 + (i % 3) * 0.005,
      y:      (i % 5 - 2) * 0.3,
      size:   0.04 + (i % 3) * 0.02,
      color:  ['#3B82F6','#10B981','#8B5CF6','#F59E0B'][i % 4],
    })), [count]);

  return (
    <group>
      {particles.map((p, i) => {
        const angle = p.angle + frame * p.speed;
        const x = Math.cos(angle) * p.radius;
        const z = Math.sin(angle) * p.radius;
        return (
          <mesh key={i} position={[x, p.y, z]}>
            <sphereGeometry args={[p.size, 6, 6]} />
            <meshBasicMaterial color={p.color} />
          </mesh>
        );
      })}
    </group>
  );
};

// ── SCENE: 3D INTRO ───────────────────────────────────────────────────────────
const ThreeIntro: React.FC<{ frame: number; fps: number }> = ({ frame, fps }) => {
  const titleSp = spring({ frame, fps, config: { stiffness: 45, damping: 18 }, delay: 20 });
  const subSp   = spring({ frame, fps, config: { stiffness: 40, damping: 20 }, delay: 42 });

  return (
    <AbsoluteFill style={{ background: '#050A14' }}>
      {/* 3D Canvas */}
      <ThreeCanvas
        style={{ position: 'absolute', inset: 0 }}
        width={1080}
        height={1920}
        camera={{ position: [0, 0, 5] as [number, number, number], fov: 50 }}
        gl={{ antialias: true, alpha: true }}
      >
        {/* Lighting */}
        <ambientLight intensity={0.5} />
        <pointLight position={[10, 10, 10]} intensity={1.2} color="#3B82F6" />
        <pointLight position={[-10, -5, -8]} intensity={0.8} color="#10B981" />
        <pointLight position={[0, 0, 5]} intensity={0.6} color="#8B5CF6" />

        {/* 3D objects */}
        <DataSphere frame={frame} />
        <OrbitParticles frame={frame} count={60} />

        {/* Floating cubes */}
        <FloatingCube frame={frame} position={[-3.5, 1.5, -1]} color="#3B82F6" delay={10} />
        <FloatingCube frame={frame} position={[3.5, 0.5, -1]}  color="#10B981" delay={20} />
        <FloatingCube frame={frame} position={[-3.2, -2, -1]}  color="#8B5CF6" delay={30} />
        <FloatingCube frame={frame} position={[3.3, -1.8, -1]} color="#F59E0B" delay={40} />
      </ThreeCanvas>

      {/* 2D overlay text */}
      <AbsoluteFill style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'flex-end', padding: '0 72px 160px', gap: 20, zIndex: 2 }}>
        <div style={{ fontFamily: '"Bebas Neue", Impact, sans-serif', fontSize: 145, color: '#FFFFFF', textAlign: 'center', lineHeight: 0.9, letterSpacing: 3, opacity: titleSp, transform: `translateY(${interpolate(titleSp,[0,1],[60,0])}px)`, textShadow: '0 4px 40px rgba(59,130,246,0.5)' }}>
          Seu processo em órbita.
        </div>
        <div style={{ fontFamily: '"Inter", system-ui, sans-serif', fontSize: 38, color: 'rgba(255,255,255,0.7)', textAlign: 'center', lineHeight: 1.4, opacity: subSp }}>
          SmartOps IA conecta todos os dados da sua empresa
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

// ── SCENE: 3D STATS ───────────────────────────────────────────────────────────
const ThreeStats: React.FC<{ frame: number; fps: number }> = ({ frame, fps }) => {
  const statsData = [
    { v: '−32%', l: 'custo operacional', color: '#EF4444', pos: [-3, 2, 0] as [number,number,number] },
    { v: '+45%', l: 'automação IA',       color: '#10B981', pos: [3, 2, 0]  as [number,number,number] },
    { v: '3×',   l: 'capacidade',          color: '#F59E0B', pos: [0, -2, 0] as [number,number,number] },
  ];

  return (
    <AbsoluteFill style={{ background: '#050A14' }}>
      <ThreeCanvas style={{ position: 'absolute', inset: 0 }} width={1080} height={1920} gl={{ antialias: true }}>
        <ambientLight intensity={0.4} />
        <pointLight position={[5, 8, 8]} intensity={1.5} color="#3B82F6" />
        <pointLight position={[-5, -8, 5]} intensity={0.8} color="#10B981" />

        {statsData.map((s, i) => (
          <FloatingCube key={i} frame={frame} position={s.pos} color={s.color} delay={i * 12} />
        ))}
        <OrbitParticles frame={frame} count={30} />
      </ThreeCanvas>

      <AbsoluteFill style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '0 72px', gap: 24, zIndex: 2 }}>
        <div style={{ fontFamily: '"Bebas Neue", Impact, sans-serif', fontSize: 88, color: '#FFFFFF', letterSpacing: 2, opacity: interpolate(frame,[0,18],[0,1],{extrapolateRight:'clamp'}) }}>
          Resultados em 90 dias:
        </div>
        {statsData.map((s, i) => {
          const sp = spring({ frame, fps, config: { stiffness: 55, damping: 18 }, delay: 12 + i * 14 });
          return (
            <div key={i} style={{
              background: 'rgba(255,255,255,0.06)', backdropFilter: 'blur(8px)',
              border: `1px solid ${s.color}44`, borderLeft: `4px solid ${s.color}`,
              borderRadius: '0 20px 20px 0', padding: '18px 28px',
              display: 'flex', alignItems: 'center', gap: 24,
              opacity: sp, transform: `translateX(${interpolate(sp,[0,1],[-60,0])}px)`,
            }}>
              <div style={{ fontFamily: '"Bebas Neue", Impact, sans-serif', fontSize: 105, color: s.color, lineHeight: 1, minWidth: 200, textShadow: `0 0 30px ${s.color}` }}>
                {s.v}
              </div>
              <div style={{ fontFamily: '"Inter", system-ui, sans-serif', fontSize: 34, color: 'rgba(255,255,255,0.85)' }}>
                {s.l}
              </div>
            </div>
          );
        })}
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

// ── SCENE: 3D CTA ─────────────────────────────────────────────────────────────
const ThreeCTA: React.FC<{ frame: number; fps: number }> = ({ frame, fps }) => {
  const mainSp = spring({ frame, fps, config: { stiffness: 45, damping: 18 }, delay: 5 });
  const btnSp  = spring({ frame, fps, config: { stiffness: 60, damping: 20 }, delay: 28 });

  return (
    <AbsoluteFill style={{ background: '#050A14' }}>
      <ThreeCanvas style={{ position: 'absolute', inset: 0 }} width={1080} height={1920} gl={{ antialias: true }}>
        <ambientLight intensity={0.3} />
        <pointLight position={[0, 0, 8]} intensity={2} color="#3B82F6" />
        <DataSphere frame={frame} />
        <OrbitParticles frame={frame} count={80} />
      </ThreeCanvas>

      <AbsoluteFill style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '0 72px', gap: 36, zIndex: 2 }}>
        <div style={{ fontFamily: '"Bebas Neue", Impact, sans-serif', fontSize: 148, color: '#FFFFFF', textAlign: 'center', lineHeight: 0.9, letterSpacing: 3, opacity: mainSp, transform: `translateY(${interpolate(mainSp,[0,1],[60,0])}px)`, textShadow: '0 4px 60px rgba(59,130,246,0.6)' }}>
          Diagnóstico Gratuito
        </div>
        <div style={{ background: 'linear-gradient(135deg, #3B82F6, #10B981)', borderRadius: 100, padding: '22px 72px', fontFamily: '"Inter", system-ui, sans-serif', fontSize: 34, fontWeight: 800, color: '#fff', opacity: btnSp, transform: `scale(${interpolate(btnSp,[0,1],[0.75,1])})`, boxShadow: '0 0 50px rgba(59,130,246,0.5)' }}>
          smartops-ia.com.br · BH/MG
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

// ── MAIN ──────────────────────────────────────────────────────────────────────
export const ThreeDTemplate: React.FC = () => {
  const { fps } = useVideoConfig();
  const frame   = useCurrentFrame();

  const s1 = 8 * fps;
  const s2 = 18 * fps;
  const s3 = 30 * fps;

  if (frame < s1) return <ThreeIntro frame={frame}       fps={fps} />;
  if (frame < s2) return <ThreeStats frame={frame - s1}  fps={fps} />;
  if (frame < s3) return <ThreeStats frame={frame - s1}  fps={fps} />;
  return                 <ThreeCTA   frame={frame - s3}  fps={fps} />;
};
