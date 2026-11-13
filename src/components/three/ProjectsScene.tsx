import { Canvas, useFrame } from '@react-three/fiber';
import { Float } from '@react-three/drei';
import { Suspense, useMemo, useRef } from 'react';
import * as THREE from 'three';
import { useTheme } from '../../contexts/ThemeContext';

function ProjectPanels({ theme }: { theme: 'light' | 'dark' }) {
  const group = useRef<THREE.Group>(null);
  const isDark = theme === 'dark';

  // Floating dimensional interface screens
  const panels = useMemo(
    () => [
      { pos: [-1.15, 0.35, 0.15], rot: [0.1, 0.32, -0.05], scale: [1.1, 0.72, 0.05], label: 'IoT Platform' },
      { pos: [0.15, -0.15, 0.55], rot: [-0.08, -0.18, 0.04], scale: [1.25, 0.82, 0.06], label: 'AI Core' },
      { pos: [1.25, 0.45, -0.1], rot: [0.12, -0.38, 0.06], scale: [1.05, 0.68, 0.05], label: 'Security Grid' },
      { pos: [-0.2, 0.75, -0.35], rot: [-0.15, 0.12, -0.04], scale: [0.95, 0.58, 0.04], label: 'Telemetry' },
    ],
    []
  );

  // Animated data bus pathways between cards
  const busPoints = useMemo(() => {
    const pts = [
      new THREE.Vector3(-1.15, 0.35, 0.15),
      new THREE.Vector3(-0.45, 0.1, 0.38),
      new THREE.Vector3(0.15, -0.15, 0.55),
      new THREE.Vector3(0.7, 0.18, 0.22),
      new THREE.Vector3(1.25, 0.45, -0.1),
    ];
    return new THREE.CatmullRomCurve3(pts).getPoints(50);
  }, []);

  const packetRef = useRef<THREE.Mesh>(null);
  const packetRef2 = useRef<THREE.Mesh>(null);

  useFrame(({ clock, pointer }) => {
    const t = clock.elapsedTime;
    if (group.current) {
      group.current.rotation.y = Math.sin(t * 0.25) * 0.08 + pointer.x * 0.22;
      group.current.rotation.x = Math.cos(t * 0.2) * 0.05 - pointer.y * 0.14;
    }

    if (packetRef.current) {
      const p1 = (t * 0.35) % 1;
      const curve = new THREE.CatmullRomCurve3(busPoints);
      packetRef.current.position.copy(curve.getPoint(p1));
    }
    if (packetRef2.current) {
      const p2 = (t * 0.35 + 0.5) % 1;
      const curve = new THREE.CatmullRomCurve3(busPoints);
      packetRef2.current.position.copy(curve.getPoint(p2));
    }
  });

  const cardMatColor = isDark ? '#10212B' : '#EAF2F4';
  const cardBorderColor = isDark ? '#38BDF8' : '#3F8EAA';

  return (
    <group ref={group}>
      {/* Floating Project Panels */}
      {panels.map((p, idx) => (
        <Float key={idx} speed={1.1 + idx * 0.2} rotationIntensity={0.08} floatIntensity={0.25}>
          <group position={p.pos as [number, number, number]} rotation={p.rot as [number, number, number]}>
            {/* Panel Glass Body */}
            <mesh>
              <boxGeometry args={p.scale as [number, number, number]} />
              <meshPhysicalMaterial
                color={cardMatColor}
                metalness={0.2}
                roughness={0.25}
                transmission={0.5}
                transparent
                opacity={isDark ? 0.78 : 0.65}
                clearcoat={0.8}
              />
            </mesh>
            {/* Panel Tech Wireframe Border */}
            <mesh scale={[1.02, 1.02, 1.02]}>
              <boxGeometry args={p.scale as [number, number, number]} />
              <meshBasicMaterial
                color={idx % 2 === 0 ? cardBorderColor : '#F59E0B'}
                wireframe
                transparent
                opacity={isDark ? 0.45 : 0.3}
              />
            </mesh>
            {/* Corner Tech Accent Dot */}
            <mesh position={[(p.scale[0] / 2) - 0.08, (p.scale[1] / 2) - 0.08, p.scale[2] / 2 + 0.01]}>
              <sphereGeometry args={[0.028, 8, 8]} />
              <meshBasicMaterial color={idx % 2 === 0 ? '#38BDF8' : '#F59E0B'} />
            </mesh>
          </group>
        </Float>
      ))}

      {/* Interconnecting Neon Data Bus Conduits */}
      <primitive
        object={
          new THREE.Line(
            new THREE.BufferGeometry().setFromPoints(busPoints),
            new THREE.LineBasicMaterial({
              color: isDark ? '#38BDF8' : '#3F8EAA',
              transparent: true,
              opacity: 0.7,
              linewidth: 2,
            })
          )
        }
      />

      {/* Traveling Data Packets */}
      <mesh ref={packetRef}>
        <sphereGeometry args={[0.045, 12, 12]} />
        <meshStandardMaterial color="#FFFFFF" emissive="#38BDF8" emissiveIntensity={3} />
      </mesh>
      <mesh ref={packetRef2}>
        <sphereGeometry args={[0.045, 12, 12]} />
        <meshStandardMaterial color="#FFFFFF" emissive="#F59E0B" emissiveIntensity={3} />
      </mesh>
    </group>
  );
}

export function ProjectsScene() {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  return (
    <div className="page-scene" aria-hidden="true">
      <Canvas
        camera={{ position: [0, 0, 4.4], fov: 38 }}
        dpr={[1, 1.3]}
        gl={{ alpha: true, antialias: true, powerPreference: 'high-performance' }}
      >
        <Suspense fallback={null}>
          <ambientLight intensity={isDark ? 0.5 : 0.9} />
          <pointLight position={[3, 2.5, 3]} intensity={12} color={isDark ? '#38BDF8' : '#3F8EAA'} />
          <pointLight position={[-3, -2, 2]} intensity={8} color={isDark ? '#F59E0B' : '#B55B12'} />
          <ProjectPanels theme={theme} />
        </Suspense>
      </Canvas>
    </div>
  );
}
