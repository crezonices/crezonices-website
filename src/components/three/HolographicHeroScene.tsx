import { Canvas, useFrame } from '@react-three/fiber';
import { Suspense, useMemo, useRef, useState, useEffect } from 'react';
import * as THREE from 'three';
import { motion } from 'motion/react';
import { Activity, Brain, Cpu, Fingerprint, Layers, Sparkles, Terminal, Zap } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';

/**
 * 3D Synaptic Hologram Particles in Three.js
 * Renders floating knowledge photons that gently drift and react around the holographic figure
 */
function HologramParticles({ theme }: { theme: 'light' | 'dark' }) {
  const pointsRef = useRef<THREE.Points>(null);
  const isDark = theme === 'dark';

  const [positions, colors] = useMemo(() => {
    const count = 90;
    const pos = new Float32Array(count * 3);
    const col = new Float32Array(count * 3);
    const cyan = new THREE.Color(isDark ? '#38BDF8' : '#2A8EA8');
    const amber = new THREE.Color(isDark ? '#F59E0B' : '#B55B12');
    const white = new THREE.Color(isDark ? '#FFFFFF' : '#12364C');

    for (let i = 0; i < count; i++) {
      // Concentrate particles around the figure and his interaction zones
      const x = (Math.random() - 0.5) * 5.5;
      const y = (Math.random() - 0.5) * 4.2;
      const z = (Math.random() - 0.5) * 2.8;

      pos[i * 3] = x;
      pos[i * 3 + 1] = y;
      pos[i * 3 + 2] = z;

      const pick = Math.random();
      const chosen = pick > 0.6 ? cyan : pick > 0.25 ? amber : white;
      col[i * 3] = chosen.r;
      col[i * 3 + 1] = chosen.g;
      col[i * 3 + 2] = chosen.b;
    }
    return [pos, col];
  }, [isDark]);

  useFrame(({ clock, pointer }) => {
    if (pointsRef.current) {
      const t = clock.elapsedTime;
      pointsRef.current.rotation.y = t * 0.03 + pointer.x * 0.08;
      pointsRef.current.rotation.x = Math.sin(t * 0.05) * 0.04 - pointer.y * 0.05;
    }
  });

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
        <bufferAttribute attach="attributes-color" args={[colors, 3]} />
      </bufferGeometry>
      <pointsMaterial
        size={0.038}
        vertexColors
        transparent
        opacity={isDark ? 0.75 : 0.45}
        sizeAttenuation
        blending={isDark ? THREE.AdditiveBlending : THREE.NormalBlending}
      />
    </points>
  );
}

/**
 * Interactive 3D Holographic Hero Scene.
 * Integrates the sophisticated holographic human figure with futuristic tech glasses,
 * glowing neural brain, and gesture-operated floating holographic interfaces.
 */
export function HolographicHeroScene() {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const containerRef = useRef<HTMLDivElement>(null);

  // Parallax coordinates tracked from pointer
  const [tilt, setTilt] = useState({ x: 0, y: 0 });
  const [activeTab, setActiveTab] = useState<'neural' | 'spatial' | 'quantum'>('neural');
  const [pulseCount, setPulseCount] = useState(4096);

  // Gentle live telemetry simulation
  useEffect(() => {
    const timer = setInterval(() => {
      setPulseCount((prev) => 4096 + Math.floor(Math.sin(Date.now() / 1500) * 84));
    }, 1800);
    return () => clearInterval(timer);
  }, []);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    setTilt({ x: x * 10, y: -y * 8 });
  };

  const handleMouseLeave = () => {
    setTilt({ x: 0, y: 0 });
  };

  return (
    <div
      ref={containerRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className={`hologram-stage-container ${isDark ? 'theme-dark' : 'theme-light'}`}
      style={{
        transform: `perspective(1200px) rotateY(${tilt.x}deg) rotateX(${tilt.y}deg)`,
      }}
      aria-label="3D Holographic AI human figure wearing smart glasses and interacting with floating interfaces"
    >
      {/* 1. Holographic Base Visual Frame with Depth Shadow & Rim Light */}
      <div className="hologram-visual-canvas">
        <img
          src="/assets/imagery/hero-holographic.jpg"
          alt="Holographic human figure with illuminated neural brain and augmented tech glasses interacting with floating digital systems"
          className="hologram-image"
          loading="eager"
        />

        {/* Ambient atmospheric holographic depth gradients */}
        <div className="hologram-scanline-fx" aria-hidden="true" />
        <div className="hologram-vignette-glow" aria-hidden="true" />
      </div>

      {/* 2. Interactive Three.js Particle Web Overlay */}
      <div className="hologram-three-overlay" aria-hidden="true">
        <Canvas
          camera={{ position: [0, 0, 3.2], fov: 42 }}
          dpr={[1, 1.5]}
          gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
        >
          <Suspense fallback={null}>
            <ambientLight intensity={isDark ? 0.6 : 0.8} />
            <pointLight position={[2, 2, 2]} intensity={isDark ? 12 : 6} color="#38BDF8" />
            <pointLight position={[-2, -1, 1]} intensity={isDark ? 8 : 4} color="#F59E0B" />
            <HologramParticles theme={theme} />
          </Suspense>
        </Canvas>
      </div>

      {/* 3. Floating Holographic Interface HUD Panels (Operating in the Air) */}
      <div className="hologram-hud-space" aria-hidden="true">
        {/* Top-Right: Neural Cognition Telemetry */}
        <motion.div
          initial={{ opacity: 0, y: -15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.2 }}
          className="holo-card holo-card-top-right glass-panel"
        >
          <div className="holo-card-header">
            <span className="holo-badge">
              <Brain size={12} className="text-cyan" /> Cortical Sync
            </span>
            <span className="holo-pulse-indicator" />
          </div>
          <div className="holo-metric-body">
            <div className="holo-metric-val">
              <span>99.8%</span>
              <small>Fidelity</small>
            </div>
            <div className="holo-sine-visualizer">
              <div className="sine-bar" style={{ height: '55%' }} />
              <div className="sine-bar" style={{ height: '80%' }} />
              <div className="sine-bar" style={{ height: '65%' }} />
              <div className="sine-bar" style={{ height: '95%' }} />
              <div className="sine-bar" style={{ height: '70%' }} />
              <div className="sine-bar" style={{ height: '85%' }} />
            </div>
          </div>
          <span className="holo-subtext">Cognitive pathways mapped</span>
        </motion.div>

        {/* Mid-Left: Floating Gesture Interface (Near his hands) */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.75, delay: 0.35 }}
          className="holo-card holo-card-gesture glass-panel"
        >
          <div className="holo-card-header">
            <span className="holo-badge">
              <Fingerprint size={12} className="text-amber" /> Spatial Touch v4.2
            </span>
            <span className="holo-live-tag">Active</span>
          </div>

          <div className="holo-gesture-nodes">
            <div className="gesture-node active">
              <Zap size={11} />
              <span>Node 01</span>
            </div>
            <div className="gesture-node active">
              <Activity size={11} />
              <span>{pulseCount} Ch</span>
            </div>
            <div className="gesture-node">
              <Cpu size={11} />
              <span>8.4 ms</span>
            </div>
          </div>

          <div className="holo-system-progress">
            <div className="holo-progress-bar" style={{ width: '88%' }} />
          </div>
          <span className="holo-subtext">Haptic feedback synchronized</span>
        </motion.div>

        {/* Bottom-Center: Multi-Domain Telemetry Switcher */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.5 }}
          className="holo-card holo-card-bottom glass-panel"
        >
          <div className="holo-tab-group">
            <button
              type="button"
              className={`holo-tab-btn ${activeTab === 'neural' ? 'active' : ''}`}
              onClick={() => setActiveTab('neural')}
            >
              <Brain size={12} /> Neural Core
            </button>
            <button
              type="button"
              className={`holo-tab-btn ${activeTab === 'spatial' ? 'active' : ''}`}
              onClick={() => setActiveTab('spatial')}
            >
              <Layers size={12} /> Spatial UI
            </button>
            <button
              type="button"
              className={`holo-tab-btn ${activeTab === 'quantum' ? 'active' : ''}`}
              onClick={() => setActiveTab('quantum')}
            >
              <Sparkles size={12} /> Quantum ML
            </button>
          </div>

          <div className="holo-tab-status">
            <span className="status-dot-pulse" />
            <span className="holo-status-text">
              {activeTab === 'neural' && 'Dual-hemisphere knowledge stream continuous'}
              {activeTab === 'spatial' && 'Gesture manipulation tracking in 3D coordinate space'}
              {activeTab === 'quantum' && 'Algorithmic state optimization active at 60 FPS'}
            </span>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
