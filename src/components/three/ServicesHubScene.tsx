import { Canvas, useFrame } from '@react-three/fiber';
import { Float } from '@react-three/drei';
import { Suspense, useRef } from 'react';
import * as THREE from 'three';
import { useTheme } from '../../contexts/ThemeContext';

function ServicesStack({ theme }: { theme: 'light' | 'dark' }) {
  const group = useRef<THREE.Group>(null);
  const codeFrameRef = useRef<THREE.Group>(null);
  const shieldRingRef = useRef<THREE.Mesh>(null);
  const isDark = theme === 'dark';

  useFrame(({ clock, pointer }) => {
    const t = clock.elapsedTime;
    if (group.current) {
      group.current.rotation.y = t * 0.14 + pointer.x * 0.22;
      group.current.rotation.x = Math.sin(t * 0.2) * 0.06 - pointer.y * 0.12;
    }
    if (codeFrameRef.current) {
      codeFrameRef.current.position.y = Math.sin(t * 1.2) * 0.08;
    }
    if (shieldRingRef.current) {
      shieldRingRef.current.rotation.x = t * 0.3;
      shieldRingRef.current.rotation.y = t * 0.4;
    }
  });

  const glassColor = isDark ? '#10212B' : '#E6F0F2';
  const cyanColor = isDark ? '#38BDF8' : '#3F8EAA';
  const amberColor = isDark ? '#F59E0B' : '#B55B12';

  return (
    <group ref={group}>
      {/* 1. Dimensional Browser / Web Architecture Plane (Ref 3 inspired) */}
      <Float speed={1.1} rotationIntensity={0.08} floatIntensity={0.25}>
        <group ref={codeFrameRef} position={[-0.45, 0.2, 0.2]} rotation={[0.08, 0.2, -0.04]}>
          {/* Browser Window Glass Pane */}
          <mesh>
            <boxGeometry args={[1.35, 0.88, 0.05]} />
            <meshPhysicalMaterial
              color={glassColor}
              metalness={0.2}
              roughness={0.2}
              transmission={0.45}
              transparent
              opacity={isDark ? 0.75 : 0.6}
              clearcoat={0.8}
            />
          </mesh>
          {/* Browser Top Bar */}
          <mesh position={[0, 0.36, 0.026]}>
            <boxGeometry args={[1.34, 0.12, 0.02]} />
            <meshStandardMaterial color={isDark ? '#1A3344' : '#C7DFE2'} />
          </mesh>
          {/* Browser Window Controls (3 small colored dots) */}
          {[-0.56, -0.5, -0.44].map((x, i) => (
            <mesh key={i} position={[x, 0.36, 0.04]}>
              <circleGeometry args={[0.02, 12]} />
              <meshBasicMaterial color={i === 0 ? '#EF4444' : i === 1 ? '#F59E0B' : '#10B981'} />
            </mesh>
          ))}
          {/* Code UI Modules inside browser */}
          <mesh position={[-0.22, 0.05, 0.035]}>
            <boxGeometry args={[0.7, 0.38, 0.02]} />
            <meshStandardMaterial color={cyanColor} wireframe transparent opacity={0.4} />
          </mesh>
          <mesh position={[0.38, 0.05, 0.035]}>
            <boxGeometry args={[0.35, 0.38, 0.02]} />
            <meshStandardMaterial color={amberColor} wireframe transparent opacity={0.4} />
          </mesh>
        </group>
      </Float>

      {/* 2. Layered Cybersecurity Shield Rings */}
      <mesh ref={shieldRingRef} position={[0.65, -0.2, -0.1]}>
        <torusGeometry args={[0.75, 0.02, 16, 70]} />
        <meshStandardMaterial
          color={cyanColor}
          emissive={cyanColor}
          emissiveIntensity={1.4}
          metalness={0.8}
        />
      </mesh>
      <mesh position={[0.65, -0.2, -0.1]} rotation={[Math.PI / 4, Math.PI / 6, 0]}>
        <octahedronGeometry args={[0.42, 0]} />
        <meshPhysicalMaterial
          color={amberColor}
          metalness={0.3}
          roughness={0.2}
          transmission={0.6}
          transparent
          opacity={0.8}
        />
      </mesh>

      {/* 3. Server Monolith / IoT Telemetry Column */}
      <Float speed={1.4} floatIntensity={0.2}>
        <group position={[0.85, 0.55, -0.4]}>
          <mesh>
            <boxGeometry args={[0.36, 0.72, 0.28]} />
            <meshStandardMaterial color={isDark ? '#0D1A22' : '#D0E3E6'} metalness={0.6} roughness={0.3} />
          </mesh>
          {/* Diagnostic Status LEDs */}
          {[-0.2, -0.05, 0.1, 0.22].map((y, i) => (
            <mesh key={i} position={[0.14, y, 0.15]}>
              <boxGeometry args={[0.06, 0.025, 0.02]} />
              <meshBasicMaterial color={i % 2 === 0 ? '#10B981' : cyanColor} />
            </mesh>
          ))}
        </group>
      </Float>

      {/* 4. Interconnecting Data Bus Stream */}
      <mesh position={[0, -0.65, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[1.65, 0.008, 8, 80]} />
        <meshBasicMaterial color={cyanColor} transparent opacity={0.3} />
      </mesh>
    </group>
  );
}

export function ServicesHubScene() {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  return (
    <div className="page-scene" aria-hidden="true">
      <Canvas
        camera={{ position: [0, 0, 4.3], fov: 38 }}
        dpr={[1, 1.3]}
        gl={{ alpha: true, antialias: true, powerPreference: 'high-performance' }}
      >
        <Suspense fallback={null}>
          <ambientLight intensity={isDark ? 0.5 : 0.85} />
          <pointLight position={[3, 2.8, 3]} intensity={12} color={isDark ? '#38BDF8' : '#3F8EAA'} />
          <pointLight position={[-3, -1.5, 2.5]} intensity={8} color={isDark ? '#F59E0B' : '#B55B12'} />
          <ServicesStack theme={theme} />
        </Suspense>
      </Canvas>
    </div>
  );
}
