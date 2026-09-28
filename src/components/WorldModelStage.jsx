import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { Text } from '@react-three/drei'
import * as THREE from 'three'
import { DEMO_ATTACK_PROBABILITY } from '../data/demoData.js'

// Past observed history points (Left side: T <= 0)
const PAST_POINTS = [
  { time: 'T-120s', pos: [-5.2, -0.6, 0], tag: 'Normal Ingress' },
  { time: 'T-90s',  pos: [-3.9, -0.2, 0], tag: 'Port Scan' },
  { time: 'T-60s',  pos: [-2.6, 0.3, 0],  tag: 'Cred Attempt' },
  { time: 'T-30s',  pos: [-1.3, 0.5, 0],  tag: 'Priv Esc' },
]

// Present point (Center: T = 0)
const PRESENT_POINT = { time: 'T = 0 (Now)', pos: [0, 0.6, 0], tag: 'Lateral Prep' }

// Future predicted horizons (Right side: T > 0)
const FUTURE_POINTS = [
  {
    sec: 30,
    time: 'T + 30s',
    pos: [1.8, 0.8, 0],
    color: '#f59e0b',
    label: 'Internal Recon & Probe',
    uncertaintyRadius: 0.28,
    risk: 'Elevated (58%)',
  },
  {
    sec: 60,
    time: 'T + 60s',
    pos: [3.6, 1.1, 0],
    color: '#fb923c',
    label: 'Credential Harvester',
    uncertaintyRadius: 0.45,
    risk: 'High (76%)',
  },
  {
    sec: 90,
    time: 'T + 90s',
    pos: [5.4, 1.45, 0],
    color: '#ef4444',
    label: 'Lateral SMB/RDP Spread',
    uncertaintyRadius: 0.65,
    risk: 'Critical (87%)',
  },
]

export default function WorldModelStage({ playing, speed }) {
  const pulseRef = useRef()
  const t = useRef(0)

  // Construct trajectory lines
  const pastLinePoints = useMemo(() => {
    return [...PAST_POINTS.map((p) => new THREE.Vector3(...p.pos)), new THREE.Vector3(...PRESENT_POINT.pos)]
  }, [])

  const futureLinePoints = useMemo(() => {
    return [new THREE.Vector3(...PRESENT_POINT.pos), ...FUTURE_POINTS.map((f) => new THREE.Vector3(...f.pos))]
  }, [])

  const fullTrajectory = useMemo(() => {
    return [...pastLinePoints, ...FUTURE_POINTS.map((f) => new THREE.Vector3(...f.pos))]
  }, [pastLinePoints])

  useFrame((_, delta) => {
    const dt = playing ? delta * speed : 0
    t.current += dt

    if (pulseRef.current) {
      const cycle = (t.current * 0.35) % (fullTrajectory.length - 1)
      const idx = Math.floor(cycle)
      const frac = cycle - idx
      pulseRef.current.position.lerpVectors(fullTrajectory[idx], fullTrajectory[idx + 1], frac)
    }
  })

  return (
    <group>
      {/* Title */}
      <Text position={[0, 2.7, 0]} fontSize={0.24} color="#fb923c" anchorX="center" fontWeight="bold">
        Predictive World Model (Multi-Horizon Future-State Attack Forecasting)
      </Text>
      <Text position={[0, 2.35, 0]} fontSize={0.12} color="#94a3b8" anchorX="center">
        Autoregressive Latent Dynamics: ẑ_{`{T+k}`} = WorldModel( z_T, a_k ) • Future State MSE: 0.0482
      </Text>

      {/* INPUT -> PROCESS -> OUTPUT Architecture Badges */}
      <group position={[0, 1.95, 0]}>
        {/* INPUT */}
        <mesh position={[-4.0, 0, 0]}>
          <planeGeometry args={[2.7, 0.3]} />
          <meshBasicMaterial color="#1e293b" transparent opacity={0.8} />
        </mesh>
        <Text position={[-4.0, 0, 0.02]} fontSize={0.095} color="#38bdf8" anchorX="center" fontWeight="bold">
          INPUT: Latent Vector z_T (128-dim)
        </Text>

        {/* PROCESS */}
        <mesh position={[0, 0, 0]}>
          <planeGeometry args={[3.4, 0.3]} />
          <meshBasicMaterial color="#431407" transparent opacity={0.8} />
        </mesh>
        <Text position={[0, 0, 0.02]} fontSize={0.095} color="#fb923c" anchorX="center" fontWeight="bold">
          PROCESS: Latent Rollout + Uncertainty Cones
        </Text>

        {/* OUTPUT */}
        <mesh position={[4.0, 0, 0]}>
          <planeGeometry args={[2.7, 0.3]} />
          <meshBasicMaterial color="#450a0a" transparent opacity={0.8} />
        </mesh>
        <Text position={[4.0, 0, 0.02]} fontSize={0.095} color="#f87171" anchorX="center" fontWeight="bold">
          OUTPUT: 90s Pre-Payload Early Warning
        </Text>
      </group>

      {/* Vertical Demarcation Line: Present Horizon Divider (T=0) */}
      <group position={[0, 0.2, -0.05]}>
        <mesh>
          <planeGeometry args={[0.03, 3.2]} />
          <meshBasicMaterial color="#64748b" transparent opacity={0.4} />
        </mesh>
        {/* Zone Labels */}
        <Text position={[-2.7, 1.45, 0]} fontSize={0.14} color="#38bdf8" anchorX="center" fontWeight="bold">
          ◀ OBSERVED NETWORK HISTORY (Deterministic)
        </Text>
        <Text position={[2.7, 1.45, 0]} fontSize={0.14} color="#fb923c" anchorX="center" fontWeight="bold">
          PROJECTED FUTURE ATTACK HORIZON (Predictive) ▶
        </Text>
      </group>

      {/* Trajectory Path: Past History (Solid Cyan Line) */}
      <PathLine points={pastLinePoints} color="#38bdf8" opacity={0.8} />

      {/* Trajectory Path: Future Forecast (Pulsing Orange/Red Dashed) */}
      <PathLine points={futureLinePoints} color="#fb923c" opacity={0.9} dashed />

      {/* Historical Observed Points */}
      {PAST_POINTS.map((pt, i) => (
        <group key={pt.time} position={pt.pos}>
          <mesh>
            <sphereGeometry args={[0.09, 14, 14]} />
            <meshStandardMaterial color="#0284c7" emissive="#38bdf8" emissiveIntensity={0.8} />
          </mesh>
          <Text position={[0, 0.25, 0]} fontSize={0.10} color="#7dd3fc" anchorX="center" fontWeight="bold">
            {pt.time}
          </Text>
          <Text position={[0, -0.25, 0]} fontSize={0.08} color="#94a3b8" anchorX="center">
            {pt.tag}
          </Text>
        </group>
      ))}

      {/* Present State Anchor (T = 0) */}
      <group position={PRESENT_POINT.pos}>
        {/* Glowing Anchor Ring */}
        <mesh rotation={[Math.PI / 2, 0, 0]}>
          <ringGeometry args={[0.22, 0.28, 24]} />
          <meshBasicMaterial color="#38bdf8" side={THREE.DoubleSide} />
        </mesh>
        <mesh>
          <sphereGeometry args={[0.16, 16, 16]} />
          <meshStandardMaterial color="#ffffff" emissive="#38bdf8" emissiveIntensity={1.4} />
        </mesh>
        <Text position={[0, 0.38, 0]} fontSize={0.13} color="#ffffff" anchorX="center" fontWeight="bold">
          T = 0 (PRESENT STATE)
        </Text>
        <Text position={[0, -0.38, 0]} fontSize={0.09} color="#bae6fd" anchorX="center">
          Active Threat Boundary
        </Text>
      </group>

      {/* Future Multi-Horizon State Nodes with Uncertainty Envelopes */}
      {FUTURE_POINTS.map((f, i) => (
        <group key={f.time} position={f.pos}>
          {/* Translucent Uncertainty Cone / Sphere (Widens as horizon expands) */}
          <mesh>
            <sphereGeometry args={[f.uncertaintyRadius, 20, 20]} />
            <meshStandardMaterial
              color={f.color}
              emissive={f.color}
              emissiveIntensity={0.6}
              transparent
              opacity={0.18 + i * 0.05}
              roughness={0.1}
            />
          </mesh>
          {/* Wireframe boundary of uncertainty volume */}
          <mesh>
            <sphereGeometry args={[f.uncertaintyRadius * 1.02, 12, 12]} />
            <meshBasicMaterial color={f.color} wireframe transparent opacity={0.3} />
          </mesh>

          {/* Core Latent State Point */}
          <mesh>
            <sphereGeometry args={[0.11, 14, 14]} />
            <meshStandardMaterial color="#ffffff" emissive={f.color} emissiveIntensity={1.5} />
          </mesh>

          {/* Horizon Badge */}
          <Text position={[0, f.uncertaintyRadius + 0.16, 0]} fontSize={0.12} color={f.color} anchorX="center" fontWeight="bold">
            {f.time}
          </Text>

          {/* Milestone Description */}
          <Text position={[0, -(f.uncertaintyRadius + 0.15), 0]} fontSize={0.095} color="#e2e8f0" anchorX="center" fontWeight="600">
            {f.label}
          </Text>
          <Text position={[0, -(f.uncertaintyRadius + 0.32), 0]} fontSize={0.08} color={f.color} anchorX="center">
            {`Risk: ${f.risk}`}
          </Text>
        </group>
      ))}

      {/* Active Trajectory Prediction Pulse */}
      <mesh ref={pulseRef}>
        <sphereGeometry args={[0.12, 16, 16]} />
        <meshStandardMaterial color="#ffffff" emissive="#ffffff" emissiveIntensity={2.0} toneMapped={false} />
      </mesh>

      {/* Attack Progression Probability Gauge & Telemetry HUD */}
      <group position={[0, -1.75, 0]}>
        {/* HUD Backplate */}
        <mesh position={[0, 0, -0.05]}>
          <planeGeometry args={[9.2, 0.85]} />
          <meshBasicMaterial color="#0f172a" transparent opacity={0.9} />
        </mesh>

        <Text position={[-2.4, 0.22, 0]} fontSize={0.12} color="#ffffff" anchorX="left" fontWeight="bold">
          FORECASTED ATTACK PROGRESSION RISK: {(DEMO_ATTACK_PROBABILITY * 100).toFixed(0)}%
        </Text>
        <Text position={[2.4, 0.22, 0]} fontSize={0.10} color="#fca5a5" anchorX="right" fontWeight="600">
          STATUS: CRITICAL THREAT DETECTED
        </Text>

        {/* Gauge Background Bar */}
        <mesh position={[0, -0.05, 0]}>
          <boxGeometry args={[7.5, 0.16, 0.04]} />
          <meshStandardMaterial color="#1e293b" />
        </mesh>

        {/* Gauge Fill Bar (87%) */}
        <mesh position={[-3.75 + (7.5 * DEMO_ATTACK_PROBABILITY) / 2, -0.05, 0.03]}>
          <boxGeometry args={[7.5 * DEMO_ATTACK_PROBABILITY, 0.16, 0.04]} />
          <meshStandardMaterial color="#ef4444" emissive="#dc2626" emissiveIntensity={0.9} />
        </mesh>

        {/* Lead time alert */}
        <Text position={[0, -0.28, 0]} fontSize={0.095} color="#94a3b8" anchorX="center">
          Proactive Warning Lead Time: 90 Seconds Pre-Execution • Defense Automated Response Window Active
        </Text>
      </group>
    </group>
  )
}

function PathLine({ points, color, opacity = 1, dashed = false }) {
  const lineGeo = useMemo(() => {
    const geo = new THREE.BufferGeometry().setFromPoints(points)
    return geo
  }, [points])

  return (
    <line geometry={lineGeo}>
      <lineBasicMaterial color={color} transparent opacity={opacity} linewidth={2} />
    </line>
  )
}
