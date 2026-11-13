import { Canvas, useFrame } from '@react-three/fiber';
import { Float } from '@react-three/drei';
import { Suspense, useMemo, useRef } from 'react';
import * as THREE from 'three';
import { useTheme } from '../../contexts/ThemeContext';

function TechEcosystem({ theme }: { theme: 'light' | 'dark' }) {
  const group = useRef<THREE.Group>(null);
  const ringRef = useRef<THREE.Group>(null);
  const coreRef = useRef<THREE.Mesh>(null);
  const isDark = theme === 'dark';

  // Peripheral ecosystem platforms (AI, IoT, Security, Engineering)
  const satellites = useMemo(
    () => [
      { angle: 0, label: 'AI Core', color: '#38BDF8', dist: 1.5, y: 0.25 },
      { angle: (Math.PI * 2) / 3, label: 'IoT Mesh', color: '#F59E0B', dist: 1.45, y: -0.2 },
      { angle: (Math.PI * 4) / 3, label: 'Security Shield', color: '#2DD4BF', dist: 1.55, y: 0.1 },
    ],
    []
  );

  useFrame(({ clock, pointer }) => {
    const t = clock.elapsedTime;
    if (group.current) {
      group.current.rotation.y = t * 0.12 + pointer.x * 0.25;
      group.current.rotation.x = 0.28 + pointer.y * 0.12; // Isometric tilt
    }
    if (ringRef.current) {
      ringRef.current.rotation.z = -t * 0.18;
    }
    if (coreRef.current) {
      coreRef.current.rotation.y = t * 0.4;
      coreRef.current.rotation.z = Math.sin(t * 0.5) * 0.2;
    }
  });

  const baseColor = isDark ? '#10212B' : '#E2EDEF';

  return (
    <group ref={group}>
      {/* Central Technology Monolith Platform */}
      <Float speed={1.2} floatIntensity={0.2}>
        <mesh position={[0, -0.25, 0]}>
          <cylinderGeometry args={[0.9, 1.05, 0.22, 6]} />
          <meshPhysicalMaterial
            color={baseColor}
            metalness={0.4}
            roughness={0.2}
            transmission={0.4}
            transparent
            opacity={isDark ? 0.8 : 0.65}
          />
        </mesh>
        {/* Glowing Circuit Border */}
        <mesh position={[0, -0.25, 0]}>
          <cylinderGeometry args={[0.92, 1.07, 0.23, 6]} />
          <meshBasicMaterial color={isDark ? '#38BDF8' : '#3F8EAA'} wireframe transparent opacity={0.35} />
        </mesh>

        {/* Central Core Hologram (Rotating Icosahedron Engine) */}
        <mesh ref={coreRef} position={[0, 0.35, 0]}>
          <octahedronGeometry args={[0.38, 0]} />
          <meshStandardMaterial
            color="#FFFFFF"
            emissive={isDark ? '#38BDF8' : '#3F8EAA'}
            emissiveIntensity={2.2}
            metalness={0.8}
            roughness={0.1}
          />
        </mesh>
      </Float>

      {/* Orbital Data Rings with Satellites */}
      <group ref={ringRef} position={[0, 0, 0]}>
        <mesh rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[1.5, 0.012, 8, 80]} />
          <meshBasicMaterial color={isDark ? '#38BDF8' : '#3F8EAA'} transparent opacity={0.4} />
        </mesh>
      </group>

      {/* Connected Nodes */}
      {satellites.map((sat, i) => {
        const x = Math.cos(sat.angle) * sat.dist;
        const z = Math.sin(sat.angle) * sat.dist;
        return (
          <Float key={i} speed={1.4 + i * 0.3} floatIntensity={0.3}>
            <group position={[x, sat.y, z]}>
              {/* Satellite Node Base */}
              <mesh>
                <boxGeometry args={[0.42, 0.16, 0.42]} />
                <meshStandardMaterial
                  color={baseColor}
                  metalness={0.5}
                  roughness={0.2}
                />
              </mesh>
              {/* Tech Indicator Beacon */}
              <mesh position={[0, 0.18, 0]}>
                <sphereGeometry args={[0.08, 12, 12]} />
                <meshStandardMaterial
                  color="#FFFFFF"
                  emissive={sat.color}
                  emissiveIntensity={2.5}
                />
              </mesh>
              {/* Pulsing Connector Ray to Center */}
              <primitive
                object={
                  new THREE.Line(
                    new THREE.BufferGeometry().setFromPoints([
                      new THREE.Vector3(0, 0, 0),
                      new THREE.Vector3(-x, -sat.y, -z),
                    ]),
                    new THREE.LineBasicMaterial({
                      color: sat.color,
                      transparent: true,
                      opacity: 0.45,
                    })
                  )
                }
              />
            </group>
          </Float>
        );
      })}
    </group>
  );
}

export function AboutEcosystemScene() {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  return (
    <div className="page-scene" aria-hidden="true">
      <Canvas
        camera={{ position: [0, 1.8, 3.8], fov: 38 }}
        dpr={[1, 1.3]}
        gl={{ alpha: true, antialias: true, powerPreference: 'high-performance' }}
      >
        <Suspense fallback={null}>
          <ambientLight intensity={isDark ? 0.5 : 0.85} />
          <pointLight position={[3, 3, 2]} intensity={14} color={isDark ? '#38BDF8' : '#3F8EAA'} />
          <pointLight position={[-3, -1, 3]} intensity={8} color={isDark ? '#F59E0B' : '#B55B12'} />
          <TechEcosystem theme={theme} />
        </Suspense>
      </Canvas>
    </div>
  );
}
