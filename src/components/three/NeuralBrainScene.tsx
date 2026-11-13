import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Float } from '@react-three/drei';
import { Suspense, useMemo, useRef, useState } from 'react';
import * as THREE from 'three';
import { useTheme } from '../../contexts/ThemeContext';

/**
 * Creates an anatomically authentic human cerebral hemisphere geometry.
 * Follows genuine human neuroanatomical proportions:
 * - Sagittal medial wall with deep longitudinal fissure
 * - Convex superior sagittal calvarial curvature
 * - Rounded frontal pole with natural anterior slope
 * - Sylvian fissure cleft (lateral sulcus)
 * - Antero-inferior temporal lobe (thumb-like ventral bulge)
 * - Postero-inferior occipital pole
 * - Deep winding cortical gyri and sulcal crevasses
 */
function createAnatomicalHemisphere(isRight: boolean): THREE.BufferGeometry {
  const geom = new THREE.SphereGeometry(1.0, 64, 52);
  const pos = geom.attributes.position as THREE.BufferAttribute;
  const v = new THREE.Vector3();
  const side = isRight ? 1 : -1;

  for (let i = 0; i < pos.count; i++) {
    v.fromBufferAttribute(pos, i);

    let x = v.x;
    let y = v.y;
    let z = v.z;

    // 1. Separate into true left/right hemisphere along sagittal midline
    // Bounding to respective side with an anatomical medial longitudinal cleft
    x = Math.abs(x);
    // Smooth medial wall drop towards sagittal cleft
    const medialWall = 0.06 + 0.86 * Math.pow(x, 0.88);
    x = medialWall * side;

    // 2. Anatomical Human Proportions (Ratio: 1.05 width : 0.98 height : 1.22 length)
    z *= 1.20; // Length (anterior-posterior)
    y *= 0.96; // Height (dorsal-ventral)

    // 3. Tapering: Slightly narrower at frontal pole (z > 0), broader at parieto-temporal (z < 0)
    const frontalTaper = 1.0 - 0.15 * Math.max(0, z / 1.20);
    x *= frontalTaper;

    // 4. Dorsal calvarial arch vs Ventral base
    if (y > 0.08) {
      // Cranial crown arch
      const crownArch = 1.0 + 0.07 * (1.0 - Math.abs(z) * 0.45);
      y *= crownArch;
    } else {
      // Ventral base:
      // A. Sylvian Fissure (Lateral Sulcus) Cleft
      const isLateral = Math.abs(x) > 0.32;
      const isSylvianZone = y > -0.24 && y < 0.1 && z > -0.3 && z < 0.42;
      if (isLateral && isSylvianZone) {
        const cleftDepth = Math.sin((y + 0.24) / 0.34 * Math.PI) * 0.11;
        x -= side * cleftDepth;
      }

      // B. Temporal Lobe (Antero-inferior bulge)
      const isTemporalZone = y < -0.05 && y > -0.52 && z > -0.32 && z < 0.36 && Math.abs(x) > 0.28;
      if (isTemporalZone) {
        const temporalBulge = Math.cos((z - 0.05) * 3.4) * 0.13;
        x += side * Math.max(0, temporalBulge);
        y -= 0.08 * Math.max(0, temporalBulge);
      }

      // C. Occipital pole posterior curve
      if (z < -0.42 && y < 0.0) {
        y += 0.09 * Math.abs(z + 0.42);
      }
    }

    // 5. Authentic Serpentine Cortical Convolutions (Gyri & Sulci)
    // Coordinated harmonic waves that flow like actual brain ribbons
    const gyrus1 = Math.sin(x * 5.8 + Math.cos(y * 4.8) * 1.5) * 0.042;
    const gyrus2 = Math.cos(y * 6.8 + Math.sin(z * 6.0) * 1.5) * 0.040;
    const gyrus3 = Math.sin(z * 7.8 + x * 4.5) * 0.026;
    const gyrus4 = Math.cos(x * 10.5 + y * 9.0 + z * 7.5) * 0.014;
    const totalGyrus = gyrus1 + gyrus2 + gyrus3 + gyrus4;

    const norm = new THREE.Vector3(x, y, z).normalize();
    x += norm.x * totalGyrus;
    y += norm.y * totalGyrus;
    z += norm.z * totalGyrus;

    pos.setXYZ(i, x, y, z);
  }

  geom.computeVertexNormals();
  return geom;
}

/**
 * Creates the human cerebellum (twin rounded lobes with horizontal folia striations).
 */
function createCerebellumLobe(isRight: boolean): THREE.BufferGeometry {
  const geom = new THREE.SphereGeometry(0.48, 40, 32);
  const pos = geom.attributes.position as THREE.BufferAttribute;
  const v = new THREE.Vector3();
  const side = isRight ? 1 : -1;

  for (let i = 0; i < pos.count; i++) {
    v.fromBufferAttribute(pos, i);

    let x = v.x * 0.84;
    let y = v.y * 0.65;
    let z = v.z * 0.82;

    x += side * 0.36;
    y -= 0.46;
    z -= 0.65;

    // Horizontal folia striations
    const folia = Math.sin(v.y * 26.0) * 0.016;
    const norm = new THREE.Vector3(v.x, v.y, v.z).normalize();
    x += norm.x * folia;
    y += norm.y * folia;
    z += norm.z * folia;

    pos.setXYZ(i, x, y, z);
  }

  geom.computeVertexNormals();
  return geom;
}

/**
 * Creates the brainstem (Pons & Medulla) anchoring the brain's ventral base.
 */
function createBrainstemMesh(): THREE.BufferGeometry {
  const geom = new THREE.CylinderGeometry(0.13, 0.09, 0.48, 24);
  geom.translate(0, -0.65, -0.2);
  geom.rotateX(0.16);
  geom.computeVertexNormals();
  return geom;
}

interface SynapticNode {
  position: THREE.Vector3;
  region: string;
  isAmber: boolean;
}

interface NeuralTract {
  curve: THREE.CatmullRomCurve3;
  points: THREE.Vector3[];
  color: string;
  speed: number;
  phaseOffset: number;
  nodeIndices: number[];
}

function AnatomicalNeuralBrain({ theme }: { theme: 'light' | 'dark' }) {
  const groupRef = useRef<THREE.Group>(null);
  const isDark = theme === 'dark';

  // Anatomical Geometries
  const leftCerebrum = useMemo(() => createAnatomicalHemisphere(false), []);
  const rightCerebrum = useMemo(() => createAnatomicalHemisphere(true), []);
  const leftCerebellum = useMemo(() => createCerebellumLobe(false), []);
  const rightCerebellum = useMemo(() => createCerebellumLobe(true), []);
  const brainstem = useMemo(() => createBrainstemMesh(), []);

  // Cortical Landmark Synaptic Nodes distributed on genuine gyral ridges
  const { nodes, tracts } = useMemo(() => {
    const rawNodes: SynapticNode[] = [
      // Left Hemisphere
      { position: new THREE.Vector3(-0.32, 0.26, 0.96), region: 'Prefrontal L', isAmber: false },  // 0
      { position: new THREE.Vector3(-0.58, 0.46, 0.52), region: 'Frontal Eye L', isAmber: true },   // 1
      { position: new THREE.Vector3(-0.74, 0.52, 0.05), region: 'Motor Strip L', isAmber: false }, // 2
      { position: new THREE.Vector3(-0.76, 0.50, -0.28), region: 'Somatosensory L', isAmber: false }, // 3
      { position: new THREE.Vector3(-0.58, 0.54, -0.68), region: 'Superior Parietal L', isAmber: true }, // 4
      { position: new THREE.Vector3(-0.30, 0.22, -1.06), region: 'Occipital Pole L', isAmber: false }, // 5
      { position: new THREE.Vector3(-0.70, -0.14, 0.20), region: 'Temporal Ant L', isAmber: false }, // 6
      { position: new THREE.Vector3(-0.78, -0.16, -0.28), region: 'Wernicke L', isAmber: true },   // 7
      { position: new THREE.Vector3(-0.36, -0.44, -0.68), region: 'Cerebellar L', isAmber: false }, // 8
      { position: new THREE.Vector3(-0.46, 0.68, -0.15), region: 'Crown L', isAmber: false },       // 9

      // Right Hemisphere
      { position: new THREE.Vector3(0.32, 0.26, 0.96), region: 'Prefrontal R', isAmber: false },   // 10
      { position: new THREE.Vector3(0.58, 0.46, 0.52), region: 'Frontal Eye R', isAmber: true },    // 11
      { position: new THREE.Vector3(0.74, 0.52, 0.05), region: 'Motor Strip R', isAmber: false },  // 12
      { position: new THREE.Vector3(0.76, 0.50, -0.28), region: 'Somatosensory R', isAmber: false }, // 13
      { position: new THREE.Vector3(0.58, 0.54, -0.68), region: 'Superior Parietal R', isAmber: true }, // 14
      { position: new THREE.Vector3(0.30, 0.22, -1.06), region: 'Occipital Pole R', isAmber: false }, // 15
      { position: new THREE.Vector3(0.70, -0.14, 0.20), region: 'Temporal Ant R', isAmber: false }, // 16
      { position: new THREE.Vector3(0.78, -0.16, -0.28), region: 'Wernicke R', isAmber: true },    // 17
      { position: new THREE.Vector3(0.36, -0.44, -0.68), region: 'Cerebellar R', isAmber: false },  // 18
      { position: new THREE.Vector3(0.46, 0.68, -0.15), region: 'Crown R', isAmber: false },        // 19

      // Interhemispheric Corpus Callosum Commissures
      { position: new THREE.Vector3(-0.15, 0.24, 0.36), region: 'Callosum Genu L', isAmber: true }, // 20
      { position: new THREE.Vector3(0.15, 0.24, 0.36), region: 'Callosum Genu R', isAmber: true },  // 21
      { position: new THREE.Vector3(-0.14, 0.20, -0.38), region: 'Callosum Splenium L', isAmber: false }, // 22
      { position: new THREE.Vector3(0.14, 0.20, -0.38), region: 'Callosum Splenium R', isAmber: false },  // 23
    ];

    // Association & Commissural Tracts
    const routes: number[][] = [
      // Left Superior Longitudinal Fasciculus (Frontal -> Parietal -> Occipital)
      [0, 1, 9, 2, 3, 4, 5],
      // Left Arcuate Fasciculus (Frontal -> Temporal -> Wernicke)
      [0, 6, 7, 3, 4],
      // Left Cerebellar Feedback Loop
      [2, 3, 7, 8],
      // Right Superior Longitudinal Fasciculus
      [10, 11, 19, 12, 13, 14, 15],
      // Right Arcuate Fasciculus
      [10, 16, 17, 13, 14],
      // Right Cerebellar Feedback Loop
      [12, 13, 17, 18],
      // Corpus Callosum Anterior Cross-Bridge
      [0, 20, 21, 10],
      // Corpus Callosum Central Cross-Bridge
      [2, 20, 21, 12],
      // Corpus Callosum Posterior Splenium Cross-Bridge
      [4, 22, 23, 14],
      [5, 22, 23, 15],
    ];

    const builtTracts: NeuralTract[] = routes.map((indices, idx) => {
      const pts = indices.map((i) => rawNodes[i].position);
      const curve = new THREE.CatmullRomCurve3(pts);
      const isAmberTract = idx % 3 === 1;
      return {
        curve,
        points: curve.getPoints(45),
        color: isAmberTract
          ? (isDark ? '#F59E0B' : '#B55B12')
          : (isDark ? '#38BDF8' : '#3F8EAA'),
        speed: 0.15 + (idx % 4) * 0.04,
        phaseOffset: idx * 0.11,
        nodeIndices: indices,
      };
    });

    return { nodes: rawNodes, tracts: builtTracts };
  }, [isDark]);

  const pulseMeshRefs = useRef<THREE.Mesh[]>([]);
  const nodeMeshRefs = useRef<THREE.Mesh[]>([]);

  useFrame(({ clock, pointer }) => {
    const elapsed = clock.elapsedTime;

    if (groupRef.current) {
      // Fluid, natural pointer rotation with subtle breathing
      const targetRotY = elapsed * 0.07 + pointer.x * 0.28;
      const targetRotX = Math.sin(elapsed * 0.22) * 0.04 - pointer.y * 0.16;
      groupRef.current.rotation.y = THREE.MathUtils.lerp(groupRef.current.rotation.y, targetRotY, 0.04);
      groupRef.current.rotation.x = THREE.MathUtils.lerp(groupRef.current.rotation.x, targetRotX, 0.04);

      const breathing = 1.0 + Math.sin(elapsed * 1.1) * 0.012;
      groupRef.current.scale.set(breathing, breathing, breathing);
    }

    const nodeBrightness = new Float32Array(nodes.length).fill(0.35);

    // Slide action potential photons along tracts
    tracts.forEach((tract, tIdx) => {
      const pulseMesh = pulseMeshRefs.current[tIdx];
      if (!pulseMesh) return;

      const progress = (elapsed * tract.speed + tract.phaseOffset) % 1;
      const currentPos = tract.curve.getPoint(progress);
      pulseMesh.position.copy(currentPos);

      // Illuminate nodes as photon approaches
      tract.nodeIndices.forEach((nIdx) => {
        const nodePos = nodes[nIdx].position;
        const dist = currentPos.distanceTo(nodePos);
        if (dist < 0.32) {
          const intensity = Math.max(0, 1.0 - dist / 0.32);
          nodeBrightness[nIdx] = Math.max(nodeBrightness[nIdx], 0.35 + intensity * 2.2);
        }
      });
    });

    // Apply progressive illumination and subtle scaling to nodes
    nodes.forEach((_, nIdx) => {
      const nodeMesh = nodeMeshRefs.current[nIdx];
      if (nodeMesh) {
        const bright = nodeBrightness[nIdx];
        const scale = 0.88 + Math.min(bright * 0.35, 0.65);
        nodeMesh.scale.set(scale, scale, scale);
        const mat = nodeMesh.material as THREE.MeshStandardMaterial;
        mat.emissiveIntensity = bright;
      }
    });
  });

  // Sophisticated holographic cortical materials — theme-adaptive contrast
  // Dark theme: lighter silver-cyan brain against dark background
  // Light theme: darker graphite-teal brain against light background
  const cortexColor = isDark ? '#8AAFBE' : '#2A4F5E';
  const cortexOpacity = isDark ? 0.82 : 0.78;
  const wireColor = isDark ? '#5ECEF6' : '#2C7A94';

  return (
    <Float speed={1.1} rotationIntensity={0.06} floatIntensity={0.25}>
      <group ref={groupRef} scale={1.38} position={[0, -0.05, 0]}>
        {/* Left Cerebral Hemisphere */}
        <mesh geometry={leftCerebrum}>
          <meshPhysicalMaterial
            color={cortexColor}
            metalness={isDark ? 0.28 : 0.12}
            roughness={isDark ? 0.22 : 0.32}
            transmission={isDark ? 0.32 : 0.28}
            transparent
            opacity={cortexOpacity}
            clearcoat={isDark ? 0.85 : 0.6}
            clearcoatRoughness={isDark ? 0.15 : 0.25}
          />
        </mesh>

        {/* Right Cerebral Hemisphere */}
        <mesh geometry={rightCerebrum}>
          <meshPhysicalMaterial
            color={cortexColor}
            metalness={isDark ? 0.28 : 0.12}
            roughness={isDark ? 0.22 : 0.32}
            transmission={isDark ? 0.32 : 0.28}
            transparent
            opacity={cortexOpacity}
            clearcoat={isDark ? 0.85 : 0.6}
            clearcoatRoughness={isDark ? 0.15 : 0.25}
          />
        </mesh>

        {/* Left Cerebellum */}
        <mesh geometry={leftCerebellum}>
          <meshPhysicalMaterial
            color={cortexColor}
            metalness={isDark ? 0.32 : 0.18}
            roughness={isDark ? 0.24 : 0.3}
            transmission={isDark ? 0.26 : 0.22}
            transparent
            opacity={cortexOpacity}
            clearcoat={isDark ? 0.7 : 0.45}
          />
        </mesh>

        {/* Right Cerebellum */}
        <mesh geometry={rightCerebellum}>
          <meshPhysicalMaterial
            color={cortexColor}
            metalness={isDark ? 0.32 : 0.18}
            roughness={isDark ? 0.24 : 0.3}
            transmission={isDark ? 0.26 : 0.22}
            transparent
            opacity={cortexOpacity}
            clearcoat={isDark ? 0.7 : 0.45}
          />
        </mesh>

        {/* Brainstem */}
        <mesh geometry={brainstem}>
          <meshStandardMaterial
            color={isDark ? '#6A9AAD' : '#1E3D4B'}
            metalness={isDark ? 0.4 : 0.28}
            roughness={isDark ? 0.32 : 0.42}
            transparent
            opacity={0.85}
          />
        </mesh>

        {/* Restrained Cortical Depth Lattice */}
        <mesh geometry={leftCerebrum} scale={1.005}>
          <meshBasicMaterial color={wireColor} wireframe transparent opacity={isDark ? 0.12 : 0.07} />
        </mesh>
        <mesh geometry={rightCerebrum} scale={1.005}>
          <meshBasicMaterial color={wireColor} wireframe transparent opacity={isDark ? 0.12 : 0.07} />
        </mesh>

        {/* Neural Network Splines & Travelling Photons */}
        {tracts.map((tract, i) => {
          const lineGeom = new THREE.BufferGeometry().setFromPoints(tract.points);
          return (
            <group key={`tract-${i}`}>
              <primitive
                object={
                  new THREE.Line(
                    lineGeom,
                    new THREE.LineBasicMaterial({
                      color: tract.color,
                      transparent: true,
                      opacity: isDark ? 0.72 : 0.58,
                      linewidth: 1.5,
                    })
                  )
                }
              />
              {/* Travelling Action Potential Photon */}
              <mesh
                ref={(el) => {
                  if (el) pulseMeshRefs.current[i] = el;
                }}
              >
                <sphereGeometry args={[0.044, 12, 12]} />
                <meshStandardMaterial
                  color="#FFFFFF"
                  emissive={tract.color}
                  emissiveIntensity={3.0}
                  roughness={0.1}
                />
              </mesh>
            </group>
          );
        })}

        {/* Synaptic Junction Nodes */}
        {nodes.map((node, i) => {
          const nodeColor = node.isAmber
            ? (isDark ? '#F59E0B' : '#B55B12')
            : (isDark ? '#38BDF8' : '#3F8EAA');
          return (
            <mesh
              key={`node-${i}`}
              ref={(el) => {
                if (el) nodeMeshRefs.current[i] = el;
              }}
              position={node.position}
            >
              <sphereGeometry args={[0.038, 14, 14]} />
              <meshStandardMaterial
                color={nodeColor}
                emissive={nodeColor}
                emissiveIntensity={0.55}
                metalness={0.4}
                roughness={0.2}
              />
            </mesh>
          );
        })}

        {/* Orbital Equatorial Telemetry Ring */}
        <mesh rotation={[Math.PI / 2.3, 0.16, 0]}>
          <torusGeometry args={[1.68, 0.007, 8, 90]} />
          <meshBasicMaterial color={isDark ? '#38BDF8' : '#3F8EAA'} transparent opacity={0.28} />
        </mesh>
      </group>
    </Float>
  );
}

// Synaptic atmospheric dust field
function SynapticDust({ count = 80, theme }: { count?: number; theme: 'light' | 'dark' }) {
  const pointsRef = useRef<THREE.Points>(null);
  const isDark = theme === 'dark';

  const [positions, colors] = useMemo(() => {
    const pos = new Float32Array(count * 3);
    const col = new Float32Array(count * 3);
    const cyan = new THREE.Color(isDark ? '#38BDF8' : '#3F8EAA');
    const amber = new THREE.Color(isDark ? '#F59E0B' : '#B55B12');

    for (let i = 0; i < count; i++) {
      const r = 1.7 + Math.random() * 1.6;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);

      pos[i * 3] = r * Math.sin(phi) * Math.cos(theta);
      pos[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta) * 0.88;
      pos[i * 3 + 2] = r * Math.cos(phi);

      const chosen = Math.random() > 0.4 ? cyan : amber;
      col[i * 3] = chosen.r;
      col[i * 3 + 1] = chosen.g;
      col[i * 3 + 2] = chosen.b;
    }
    return [pos, col];
  }, [count, isDark]);

  useFrame(({ clock }) => {
    if (pointsRef.current) {
      pointsRef.current.rotation.y = clock.elapsedTime * 0.022;
    }
  });

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
        <bufferAttribute attach="attributes-color" args={[colors, 3]} />
      </bufferGeometry>
      <pointsMaterial
        size={0.034}
        vertexColors
        transparent
        opacity={isDark ? 0.52 : 0.36}
        sizeAttenuation
      />
    </points>
  );
}

function SmoothCameraRig() {
  const { camera } = useThree();

  useFrame(({ pointer }) => {
    const targetX = pointer.x * 0.32;
    const targetY = pointer.y * 0.18;
    camera.position.x = THREE.MathUtils.lerp(camera.position.x, targetX, 0.035);
    camera.position.y = THREE.MathUtils.lerp(camera.position.y, targetY, 0.035);
    camera.lookAt(0, 0, 0);
  });

  return null;
}

export function NeuralBrainScene() {
  const { theme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const isDark = theme === 'dark';

  return (
    <div
      className="scene neural-brain-scene"
      aria-label="Interactive 3D anatomical neural brain showing synaptic pathways and progressive node activations"
    >
      <Canvas
        camera={{ position: [0, 0, 5.0], fov: 37 }}
        dpr={[1, 1.5]}
        gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
        onCreated={() => setMounted(true)}
      >
        <Suspense fallback={null}>
          <ambientLight intensity={isDark ? 0.72 : 0.68} />
          {/* Key Light (Warm Amber / Bronze) */}
          <pointLight
            position={[3.6, 2.6, 3.2]}
            intensity={isDark ? 18 : 8}
            color={isDark ? '#F59E0B' : '#B55B12'}
            distance={13}
          />
          {/* Fill / Rim Light (Electric Cyan / Teal) */}
          <pointLight
            position={[-3.4, -1.8, 2.6]}
            intensity={isDark ? 20 : 9}
            color={isDark ? '#38BDF8' : '#3F8EAA'}
            distance={13}
          />
          {/* Top Calvarial Soft Light */}
          <directionalLight
            position={[0, 4.0, 2.0]}
            intensity={isDark ? 1.5 : 1.2}
            color="#FFFFFF"
          />

          <SmoothCameraRig />
          <SynapticDust theme={theme} count={80} />
          <AnatomicalNeuralBrain theme={theme} />
        </Suspense>
      </Canvas>

      {!mounted && (
        <div className="scene-fallback-hint">
          <span>Initializing neural lattice…</span>
        </div>
      )}
    </div>
  );
}
