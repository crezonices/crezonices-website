import { Canvas, useFrame } from '@react-three/fiber';
import { Suspense, useMemo, useRef, useState } from 'react';
import * as THREE from 'three';
import { motion, AnimatePresence } from 'motion/react';
import { Activity, Brain, ShieldCheck, Zap } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';

/**
 * Refined 3D Synaptic Ambient Particles that drift gently around the cybernetic shield sentinel
 */
function SubtleSynapticParticles({ theme }: { theme: 'light' | 'dark' }) {
  const pointsRef = useRef<THREE.Points>(null);
  const isDark = theme === 'dark';

  const [positions, colors] = useMemo(() => {
    const count = 75; // Restrained particle count to eliminate visual clutter
    const pos = new Float32Array(count * 3);
    const col = new Float32Array(count * 3);
    const cyan = new THREE.Color(isDark ? '#38BDF8' : '#2A8EA8');
    const amber = new THREE.Color(isDark ? '#F59E0B' : '#B55B12');
    const silver = new THREE.Color(isDark ? '#E2EFF1' : '#12364C');

    for (let i = 0; i < count; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 5.5;
      pos[i * 3 + 1] = (Math.random() - 0.5) * 4.4;
      pos[i * 3 + 2] = (Math.random() - 0.5) * 2.6;

      const pick = Math.random();
      const chosen = pick > 0.65 ? cyan : pick > 0.3 ? amber : silver;
      col[i * 3] = chosen.r;
      col[i * 3 + 1] = chosen.g;
      col[i * 3 + 2] = chosen.b;
    }
    return [pos, col];
  }, [isDark]);

  useFrame(({ clock, pointer }) => {
    if (pointsRef.current) {
      const t = clock.elapsedTime;
      pointsRef.current.rotation.y = t * 0.02 + pointer.x * 0.05;
      pointsRef.current.rotation.x = Math.sin(t * 0.035) * 0.025 - pointer.y * 0.035;
    }
  });

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
        <bufferAttribute attach="attributes-color" args={[colors, 3]} />
      </bufferGeometry>
      <pointsMaterial
        size={0.032}
        vertexColors
        transparent
        opacity={isDark ? 0.65 : 0.38}
        sizeAttenuation
        blending={isDark ? THREE.AdditiveBlending : THREE.NormalBlending}
      />
    </points>
  );
}

/**
 * Combined Version 3 Hero:
 * - Iron shield-style cybernetic face mask with glowing horizontal telemetry visor
 * - Illuminated neural cranium dome with cyan & amber synaptic pathways
 * - Subtle integrated cybersecurity defense ring
 * - Restrained, clutter-free interactive holographic telemetry elements (2 high-utility cards)
 * - Full Light/Dark theme calibration and mobile-first responsiveness
 */
export function ShieldSentinelHeroV3() {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const containerRef = useRef<HTMLDivElement>(null);

  const [tilt, setTilt] = useState({ x: 0, y: 0 });
  const [activeTelemetry, setActiveTelemetry] = useState<'neural' | 'security' | null>(null);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    setTilt({ x: x * 7, y: -y * 5 });
  };

  const handleMouseLeave = () => {
    setTilt({ x: 0, y: 0 });
    setActiveTelemetry(null);
  };

  return (
    <div
      ref={containerRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className={`v3-sentinel-stage ${isDark ? 'theme-dark' : 'theme-light'}`}
      style={{
        transform: `perspective(1400px) rotateY(${tilt.x}deg) rotateX(${tilt.y}deg)`,
      }}
      aria-label="Crezonices Cybernetic Sentinel featuring an iron shield face mask and illuminated neural brain"
    >
      {/* 1. Unconstrained Expansive Artwork Stage with Organic Edge Fade */}
      <div className="v3-artwork-viewport">
        <img
          src="/assets/imagery/hero-shield-sentinel-v3.jpg"
          alt="Crezonices cybernetic AI sentinel with an armored iron shield face mask, illuminated synaptic neural core, and cryptographic security ring"
          className="v3-sentinel-img"
          loading="eager"
        />

        {/* Atmospheric edge feathering that seamlessly marries the visual to the hero background */}
        <div className="v3-ambient-feather" aria-hidden="true" />
        <div className="v3-rim-illumination" aria-hidden="true" />
      </div>

      {/* 2. Gentle Three.js Synaptic Ambient Particle Field */}
      <div className="v3-particles-overlay" aria-hidden="true">
        <Canvas
          camera={{ position: [0, 0, 3.2], fov: 40 }}
          dpr={[1, 1.5]}
          gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
        >
          <Suspense fallback={null}>
            <ambientLight intensity={isDark ? 0.6 : 0.8} />
            <pointLight position={[2, 2, 2]} intensity={isDark ? 8 : 4} color="#38BDF8" />
            <pointLight position={[-2, -1, 1]} intensity={isDark ? 6 : 3} color="#F59E0B" />
            <SubtleSynapticParticles theme={theme} />
          </Suspense>
        </Canvas>
      </div>

      {/* 3. Restrained, Meaningful Holographic Telemetry (No Clutter, 2 Core Elements) */}
      <div className="v3-telemetry-layer" aria-hidden="true">
        {/* Top-Right: Neural Core Telemetry Card */}
        <motion.div
          initial={{ opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className={`v3-telemetry-card card-top-right glass-panel ${
            activeTelemetry === 'neural' ? 'hovered' : ''
          }`}
          onMouseEnter={() => setActiveTelemetry('neural')}
          onMouseLeave={() => setActiveTelemetry(null)}
          onClick={() => setActiveTelemetry((prev) => (prev === 'neural' ? null : 'neural'))}
          role="button"
          tabIndex={0}
          aria-label="Neural Cognition Telemetry"
        >
          <div className="v3-card-header">
            <span className="v3-badge">
              <Brain size={13} className="text-cyan" /> Neural Matrix
            </span>
            <span className="v3-status-dot pulse" />
          </div>
          <div className="v3-metric-row">
            <strong className="v3-metric-stat">4,096 Ch</strong>
            <span className="v3-metric-sub">Dual-Hemisphere Sync</span>
          </div>
          <div className="v3-mini-waveform">
            <div className="bar bar-1" />
            <div className="bar bar-2" />
            <div className="bar bar-3" />
            <div className="bar bar-4" />
            <div className="bar bar-5" />
          </div>

          <AnimatePresence>
            {activeTelemetry === 'neural' && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="v3-card-expanded-info"
              >
                <div className="v3-spec-line">
                  <span>Inference Latency</span>
                  <strong>8.4 ms</strong>
                </div>
                <div className="v3-spec-line">
                  <span>Synaptic Plasticity</span>
                  <strong>Continuous</strong>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* Mid-Left: Zero-Trust Security Perimeter Card */}
        <motion.div
          initial={{ opacity: 0, x: -16 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.65, delay: 0.35 }}
          className={`v3-telemetry-card card-mid-left glass-panel ${
            activeTelemetry === 'security' ? 'hovered' : ''
          }`}
          onMouseEnter={() => setActiveTelemetry('security')}
          onMouseLeave={() => setActiveTelemetry(null)}
          onClick={() => setActiveTelemetry((prev) => (prev === 'security' ? null : 'security'))}
          role="button"
          tabIndex={0}
          aria-label="Zero-Trust Security Perimeter"
        >
          <div className="v3-card-header">
            <span className="v3-badge">
              <ShieldCheck size={13} className="text-amber" /> Zero-Trust Shield
            </span>
            <span className="v3-pill-active">Locked</span>
          </div>
          <div className="v3-metric-row">
            <strong className="v3-metric-stat">SHA-512</strong>
            <span className="v3-metric-sub">Cryptographic Perimeter</span>
          </div>
          <div className="v3-progress-line">
            <div className="v3-progress-fill" style={{ width: '94%' }} />
          </div>

          <AnimatePresence>
            {activeTelemetry === 'security' && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="v3-card-expanded-info"
              >
                <div className="v3-spec-line">
                  <span>Authentication</span>
                  <strong>Multi-Factor Mesh</strong>
                </div>
                <div className="v3-spec-line">
                  <span>Defense State</span>
                  <strong className="text-cyan">100% Active</strong>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>

      {/* 4. Elegant Minimal Bottom Status Bar */}
      <div className="v3-bottom-status-strip" aria-hidden="true">
        <div className="v3-status-node">
          <Activity size={12} className="text-cyan" />
          <span>Architecture: Cybernetic AI Sentinel</span>
        </div>
        <div className="v3-status-node">
          <Zap size={12} className="text-amber" />
          <span>Defense Matrix: Cryptographically Hardened</span>
        </div>
      </div>
    </div>
  );
}
