import { Canvas, useFrame } from '@react-three/fiber';
import { Suspense, useMemo, useRef, useState, useEffect } from 'react';
import * as THREE from 'three';
import { motion, AnimatePresence } from 'motion/react';
import {
  Activity,
  Brain,
  Cpu,
  Layers,
  Lock,
  Network,
  ShieldCheck,
  Sparkles,
  Zap,
} from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';

interface HoloSymbol {
  id: string;
  label: string;
  sublabel: string;
  category: string;
  icon: typeof Brain;
  shape: 'circle' | 'square';
  position: { x: number; y: number }; // Percentage offsets in stage
  metric: string;
  accent: 'cyan' | 'amber';
}

const HOLO_SYMBOLS: HoloSymbol[] = [
  {
    id: 'sym-ai-neural',
    label: 'Neural Cognition Core',
    sublabel: 'Dual-hemisphere synaptic pathways active',
    category: 'Artificial Intelligence',
    icon: Brain,
    shape: 'circle',
    position: { x: 22, y: 14 },
    metric: '4,096 TFLOPS',
    accent: 'cyan',
  },
  {
    id: 'sym-cyber-shield',
    label: 'Zero-Trust Shield Matrix',
    sublabel: 'Perimeter cryptographic authentication',
    category: 'Cybersecurity',
    icon: ShieldCheck,
    shape: 'square',
    position: { x: 8, y: 42 },
    metric: 'SHA-512 Synced',
    accent: 'cyan',
  },
  {
    id: 'sym-quantum-cpu',
    label: 'Quantum Logic Engine',
    sublabel: 'State optimization pipeline',
    category: 'Intelligent Computing',
    icon: Cpu,
    shape: 'square',
    position: { x: 88, y: 22 },
    metric: '128 Qubits',
    accent: 'amber',
  },
  {
    id: 'sym-encryption-key',
    label: 'Encrypted Telemetry',
    sublabel: 'Quantum-resistant AES-GCM channel',
    category: 'Data Protection',
    icon: Lock,
    shape: 'circle',
    position: { x: 92, y: 60 },
    metric: 'Zero-Leakage',
    accent: 'cyan',
  },
  {
    id: 'sym-edge-iot',
    label: 'Connected Systems Grid',
    sublabel: 'Distributed edge telemetry mesh',
    category: 'IoT Topologies',
    icon: Network,
    shape: 'circle',
    position: { x: 18, y: 76 },
    metric: '10k+ Nodes',
    accent: 'cyan',
  },
  {
    id: 'sym-cloud-infra',
    label: 'Resilient Cloud Systems',
    sublabel: 'Multi-zone low-latency orchestration',
    category: 'Architecture',
    icon: Layers,
    shape: 'square',
    position: { x: 78, y: 84 },
    metric: '99.99% Uptime',
    accent: 'amber',
  },
  {
    id: 'sym-inference-pipeline',
    label: 'Real-Time Inference',
    sublabel: 'Adaptive knowledge synthesis',
    category: 'Continuous ML',
    icon: Activity,
    shape: 'circle',
    position: { x: 50, y: 92 },
    metric: '8.2 ms Latency',
    accent: 'cyan',
  },
];

/**
 * 3D Synaptic Ambient Particles that drift around the human-AI figure
 */
function AmbientCyberParticles({ theme }: { theme: 'light' | 'dark' }) {
  const pointsRef = useRef<THREE.Points>(null);
  const isDark = theme === 'dark';

  const [positions, colors] = useMemo(() => {
    const count = 110;
    const pos = new Float32Array(count * 3);
    const col = new Float32Array(count * 3);
    const cyan = new THREE.Color(isDark ? '#38BDF8' : '#2A8EA8');
    const amber = new THREE.Color(isDark ? '#F59E0B' : '#B55B12');
    const white = new THREE.Color(isDark ? '#FFFFFF' : '#12364C');

    for (let i = 0; i < count; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 6.2;
      pos[i * 3 + 1] = (Math.random() - 0.5) * 4.8;
      pos[i * 3 + 2] = (Math.random() - 0.5) * 3.0;

      const pick = Math.random();
      const chosen = pick > 0.65 ? cyan : pick > 0.3 ? amber : white;
      col[i * 3] = chosen.r;
      col[i * 3 + 1] = chosen.g;
      col[i * 3 + 2] = chosen.b;
    }
    return [pos, col];
  }, [isDark]);

  useFrame(({ clock, pointer }) => {
    if (pointsRef.current) {
      const t = clock.elapsedTime;
      pointsRef.current.rotation.y = t * 0.025 + pointer.x * 0.06;
      pointsRef.current.rotation.x = Math.sin(t * 0.04) * 0.03 - pointer.y * 0.04;
    }
  });

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
        <bufferAttribute attach="attributes-color" args={[colors, 3]} />
      </bufferGeometry>
      <pointsMaterial
        size={0.036}
        vertexColors
        transparent
        opacity={isDark ? 0.72 : 0.42}
        sizeAttenuation
        blending={isDark ? THREE.AdditiveBlending : THREE.NormalBlending}
      />
    </points>
  );
}

/**
 * Human–AI Hybrid Experience (Version 2)
 * Features:
 * - Half-human, half-machine aesthetic with illuminated synaptic brain and AR visor
 * - Integrated cybersecurity shield storytelling & defense matrix indicators
 * - Orbiting interactive holographic symbols with smooth hover/tap magnification & telemetry
 * - Unconstrained, cinematic layout with expansive visual presence
 */
export function HumanAiHybridHero() {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const containerRef = useRef<HTMLDivElement>(null);

  const [tilt, setTilt] = useState({ x: 0, y: 0 });
  const [activeSymbolId, setActiveSymbolId] = useState<string | null>(null);
  const [defenseActive, setDefenseActive] = useState(true);

  // Gentle periodic pulse for defense matrix
  useEffect(() => {
    const interval = setInterval(() => {
      setDefenseActive((prev) => !prev);
    }, 4500);
    return () => clearInterval(interval);
  }, []);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    setTilt({ x: x * 8, y: -y * 6 });
  };

  const handleMouseLeave = () => {
    setTilt({ x: 0, y: 0 });
    setActiveSymbolId(null);
  };

  return (
    <div
      ref={containerRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className={`human-ai-stage-v2 ${isDark ? 'theme-dark' : 'theme-light'}`}
      style={{
        transform: `perspective(1400px) rotateY(${tilt.x}deg) rotateX(${tilt.y}deg)`,
      }}
      aria-label="Half-human, half-machine artificial intelligence and cybersecurity hero visualization"
    >
      {/* 1. EXPANSIVE CINEMATIC VISUAL CANVAS (Unconstrained by rigid boxes) */}
      <div className="v2-visual-artwork-stage">
        <img
          src="/assets/imagery/hero-human-ai-v2.jpg"
          alt="Half-human, half-machine AI figure with illuminated neural brain, AR smart visor, and orbiting holographic cybersecurity shields"
          className="v2-hero-artwork-img"
          loading="eager"
        />

        {/* Soft edge feathering that blends seamlessly with the hero section background */}
        <div className="v2-ambient-edge-blend" aria-hidden="true" />
        <div className="v2-volumetric-hologram-glow" aria-hidden="true" />

        {/* Dynamic Holographic Security Shield Arc Overlay */}
        <div className="v2-cybersecurity-defense-arc" aria-hidden="true">
          <div className={`defense-ring-pulse ${defenseActive ? 'active' : ''}`} />
          <div className="defense-status-pill">
            <ShieldCheck size={12} className="text-cyan" />
            <span>AI Perimeter: Secure · Zero-Trust</span>
          </div>
        </div>
      </div>

      {/* 2. THREE.JS SYNAPTIC PARTICLE WEB */}
      <div className="v2-three-particle-layer" aria-hidden="true">
        <Canvas
          camera={{ position: [0, 0, 3.4], fov: 40 }}
          dpr={[1, 1.5]}
          gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
        >
          <Suspense fallback={null}>
            <ambientLight intensity={isDark ? 0.6 : 0.8} />
            <pointLight position={[2, 2, 2]} intensity={isDark ? 10 : 5} color="#38BDF8" />
            <pointLight position={[-2, -1, 1]} intensity={isDark ? 8 : 4} color="#F59E0B" />
            <AmbientCyberParticles theme={theme} />
          </Suspense>
        </Canvas>
      </div>

      {/* 3. INTERACTIVE HOLOGRAPHIC SYMBOLS (Phase 4 Interaction) */}
      <div className="v2-interactive-symbols-layer">
        {HOLO_SYMBOLS.map((sym) => {
          const Icon = sym.icon;
          const isHovered = activeSymbolId === sym.id;
          const isAnyHovered = activeSymbolId !== null;
          const isMuted = isAnyHovered && !isHovered;

          return (
            <div
              key={sym.id}
              className={`holo-symbol-node ${sym.shape} accent-${sym.accent} ${
                isHovered ? 'hovered' : ''
              } ${isMuted ? 'muted' : ''}`}
              style={{
                left: `${sym.position.x}%`,
                top: `${sym.position.y}%`,
              }}
              onMouseEnter={() => setActiveSymbolId(sym.id)}
              onMouseLeave={() => setActiveSymbolId(null)}
              onClick={() => setActiveSymbolId((prev) => (prev === sym.id ? null : sym.id))}
              role="button"
              tabIndex={0}
              aria-label={`${sym.label} — ${sym.category}`}
              aria-expanded={isHovered}
            >
              {/* Geometric Frame & Outer Halo */}
              <div className="symbol-outer-ring" />
              <div className="symbol-inner-glass">
                <Icon size={17} className="symbol-icon" />
              </div>

              {/* Ping wave on resting state */}
              <div className="symbol-sonar-ping" />

              {/* Technical Telemetry Popover on Hover/Tap */}
              <AnimatePresence>
                {isHovered && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9, y: 6 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.9, y: 4 }}
                    transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
                    className="symbol-telemetry-tooltip glass-panel"
                  >
                    <div className="tooltip-header">
                      <span className="tooltip-cat">{sym.category}</span>
                      <span className="tooltip-metric">{sym.metric}</span>
                    </div>
                    <strong className="tooltip-title">{sym.label}</strong>
                    <p className="tooltip-sub">{sym.sublabel}</p>
                    <div className="tooltip-footer">
                      <span className="status-dot-pulse" />
                      <span>Telemetry Synchronized</span>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        })}
      </div>

      {/* 4. EXPANSIVE BOTTOM STATUS BAR */}
      <div className="v2-stage-bottom-telemetry" aria-hidden="true">
        <div className="v2-telemetry-item">
          <span className="v2-tel-label">Architecture</span>
          <span className="v2-tel-val">Half-Human · Synthetic AI</span>
        </div>
        <div className="v2-telemetry-item">
          <span className="v2-tel-label">Security Framework</span>
          <span className="v2-tel-val">Active Cryptographic Shield</span>
        </div>
        <div className="v2-telemetry-item">
          <span className="v2-tel-label">Interact</span>
          <span className="v2-tel-val">Hover symbols to inspect</span>
        </div>
      </div>
    </div>
  );
}
