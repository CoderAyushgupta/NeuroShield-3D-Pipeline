import { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import { Text } from '@react-three/drei'
import * as THREE from 'three'

// 5 chronological time steps: t-4, t-3, t-2, t-1, t (current)
const TIME_STEPS = [
  { label: 't - 4', sub: '-120s', desc: 'Recon Ingress' },
  { label: 't - 3', sub: '-90s',  desc: 'Port Scanning' },
  { label: 't - 2', sub: '-60s',  desc: 'Credential Probe' },
  { label: 't - 1', sub: '-30s',  desc: 'Privilege Esc' },
  { label: 't (Now)', sub: '0s',  desc: 'Lateral Prep', current: true },
]

export default function LSTMStage({ playing, speed }) {
  const pulseRef = useRef()
  const verticalPulsesRef = useRef([])
  const t = useRef(0)

  const cellSpacing = 2.0
  const startX = -((TIME_STEPS.length - 1) * cellSpacing) / 2

  useFrame((_, delta) => {
    const dt = playing ? delta * speed : 0
    t.current += dt

    // Flowing memory pulse along horizontal recurrent path (left to right)
    if (pulseRef.current) {
      const cycle = (t.current * 0.4) % 1
      const totalDist = (TIME_STEPS.length - 1) * cellSpacing
      pulseRef.current.position.x = startX + cycle * totalDist
      pulseRef.current.position.y = 0
    }

    // Flowing input pulses from bottom into each LSTM cell
    verticalPulsesRef.current.forEach((mesh, idx) => {
      if (mesh) {
        const offset = idx * 0.2
        const progress = ((t.current * 0.8) + offset) % 1
        mesh.position.y = -1.6 + progress * 1.1
        mesh.material.opacity = Math.sin(progress * Math.PI)
      }
    })
  })

  return (
    <group>
      {/* Stage Header */}
      <Text position={[0, 2.7, 0]} fontSize={0.24} color="#f472b6" anchorX="center" fontWeight="bold">
        Temporal LSTM Recurrence (Chronological Attack Dynamics)
      </Text>
      <Text position={[0, 2.35, 0]} fontSize={0.12} color="#94a3b8" anchorX="center">
        Recurrent Hidden State Chain: h_t = LSTM( h_{`{t-1}`}, g_t ) • Retains Temporal Memory Across 300s
      </Text>

      {/* INPUT -> PROCESS -> OUTPUT Architecture Badges */}
      <group position={[0, 1.9, 0]}>
        {/* INPUT */}
        <mesh position={[-4.0, 0, 0]}>
          <planeGeometry args={[2.5, 0.32]} />
          <meshBasicMaterial color="#1e1b4b" transparent opacity={0.8} />
        </mesh>
        <Text position={[-4.0, 0, 0.02]} fontSize={0.10} color="#818cf8" anchorX="center" fontWeight="bold">
          INPUT: GraphSAGE Embeddings g_t
        </Text>

        {/* PROCESS */}
        <mesh position={[0, 0, 0]}>
          <planeGeometry args={[3.2, 0.32]} />
          <meshBasicMaterial color="#4a044e" transparent opacity={0.8} />
        </mesh>
        <Text position={[0, 0, 0.02]} fontSize={0.10} color="#f472b6" anchorX="center" fontWeight="bold">
          PROCESS: Forget / Input / Output Gates
        </Text>

        {/* OUTPUT */}
        <mesh position={[4.0, 0, 0]}>
          <planeGeometry args={[2.5, 0.32]} />
          <meshBasicMaterial color="#3b0764" transparent opacity={0.8} />
        </mesh>
        <Text position={[4.0, 0, 0.02]} fontSize={0.10} color="#c084fc" anchorX="center" fontWeight="bold">
          OUTPUT: Latent Behavior Vector z_T
        </Text>
      </group>

      {/* 5 Chronological LSTM Memory Cells */}
      {TIME_STEPS.map((step, idx) => {
        const x = startX + idx * cellSpacing
        const isCurrent = step.current

        return (
          <group key={step.label} position={[x, 0, 0]}>
            {/* Cell Body */}
            <mesh>
              <boxGeometry args={[1.2, 1.1, 0.5]} />
              <meshStandardMaterial
                color={isCurrent ? '#db2777' : '#831843'}
                emissive={isCurrent ? '#f472b6' : '#9d174d'}
                emissiveIntensity={isCurrent ? 0.7 : 0.25}
                roughness={0.25}
                metalness={0.8}
              />
            </mesh>

            {/* Cell Internal Wireframe Glow */}
            <mesh>
              <boxGeometry args={[1.22, 1.12, 0.52]} />
              <meshBasicMaterial
                color={isCurrent ? '#fbcfe8' : '#f472b6'}
                wireframe
                transparent
                opacity={isCurrent ? 0.5 : 0.2}
              />
            </mesh>

            {/* Time-step label on top */}
            <Text position={[0, 0.78, 0]} fontSize={0.13} color={isCurrent ? '#fbcfe8' : '#e2e8f0'} anchorX="center" fontWeight="bold">
              {step.label}
            </Text>
            <Text position={[0, 0.62, 0]} fontSize={0.09} color="#94a3b8" anchorX="center">
              {step.sub}
            </Text>

            {/* Internal Gate Icons inside Cell Body */}
            <group position={[0, 0.12, 0.26]}>
              {/* Gate indicators */}
              <Text position={[-0.32, 0.1, 0]} fontSize={0.08} color="#f9a8d4" anchorX="center">
                f_t
              </Text>
              <Text position={[0, 0.1, 0]} fontSize={0.08} color="#f9a8d4" anchorX="center">
                i_t
              </Text>
              <Text position={[0.32, 0.1, 0]} fontSize={0.08} color="#f9a8d4" anchorX="center">
                o_t
              </Text>
              <Text position={[0, -0.22, 0]} fontSize={0.10} color="#ffffff" anchorX="center" fontWeight="bold">
                {isCurrent ? 'h_T (Now)' : `h_${idx + 1}`}
              </Text>
            </group>

            {/* Activity / Attack Phase Tag below Cell */}
            <Text position={[0, -0.68, 0]} fontSize={0.08} color={isCurrent ? '#f472b6' : '#94a3b8'} anchorX="center">
              {step.desc}
            </Text>

            {/* Input Port (GraphSAGE Embedding entering from bottom) */}
            <mesh position={[0, -1.1, 0]}>
              <cylinderGeometry args={[0.025, 0.025, 0.7, 12]} />
              <meshStandardMaterial color="#818cf8" emissive="#818cf8" emissiveIntensity={0.6} />
            </mesh>

            {/* Input Port Label */}
            <Text position={[0, -1.6, 0]} fontSize={0.09} color="#a5b4fc" anchorX="center">
              {`g_${idx + 1} (GraphSAGE)`}
            </Text>

            {/* Animated Input Rising Particle */}
            <mesh
              ref={(el) => (verticalPulsesRef.current[idx] = el)}
              position={[0, -1.6, 0]}
            >
              <sphereGeometry args={[0.06, 10, 10]} />
              <meshBasicMaterial color="#c7d2fe" transparent />
            </mesh>

            {/* Recurrent Memory Pipeline to Next Cell */}
            {idx < TIME_STEPS.length - 1 && (
              <group position={[cellSpacing / 2, 0, 0]}>
                {/* Horizontal Glass Pipe */}
                <mesh rotation={[0, 0, Math.PI / 2]}>
                  <cylinderGeometry args={[0.04, 0.04, cellSpacing - 1.2, 12]} />
                  <meshStandardMaterial
                    color="#f472b6"
                    emissive="#db2777"
                    emissiveIntensity={0.8}
                    transparent
                    opacity={0.7}
                  />
                </mesh>
                {/* Hidden state annotation */}
                <Text position={[0, 0.16, 0]} fontSize={0.08} color="#fbcfe8" anchorX="center">
                  {`h_${idx + 1}`}
                </Text>
                {/* Cell state annotation */}
                <Text position={[0, -0.16, 0]} fontSize={0.08} color="#cbd5e1" anchorX="center">
                  {`c_${idx + 1}`}
                </Text>
              </group>
            )}
          </group>
        )
      })}

      {/* Recurrent Flowing Memory Pulse through entire chain */}
      <mesh ref={pulseRef} position={[startX, 0, 0]}>
        <sphereGeometry args={[0.10, 16, 16]} />
        <meshStandardMaterial
          color="#ffffff"
          emissive="#f472b6"
          emissiveIntensity={2.0}
          toneMapped={false}
        />
      </mesh>

      {/* Output Vector emerging from final cell to Stage 8 */}
      <group position={[startX + (TIME_STEPS.length - 1) * cellSpacing + 0.6, 0, 0]}>
        {/* Horizontal Exit Arrow */}
        <mesh position={[0.7, 0, 0]} rotation={[0, 0, -Math.PI / 2]}>
          <coneGeometry args={[0.12, 0.35, 12]} />
          <meshStandardMaterial color="#c084fc" emissive="#a855f7" emissiveIntensity={1.2} />
        </mesh>
        <mesh position={[0.3, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.04, 0.04, 0.6, 12]} />
          <meshStandardMaterial color="#a855f7" emissive="#9333ea" emissiveIntensity={0.8} />
        </mesh>

        {/* Output Vector Box */}
        <mesh position={[1.4, 0, 0]}>
          <boxGeometry args={[0.9, 0.7, 0.3]} />
          <meshStandardMaterial color="#581c87" emissive="#7e22ce" emissiveIntensity={0.7} />
        </mesh>
        <Text position={[1.4, 0.12, 0.16]} fontSize={0.11} color="#f3e8ff" anchorX="center" fontWeight="bold">
          z_T
        </Text>
        <Text position={[1.4, -0.12, 0.16]} fontSize={0.08} color="#d8b4fe" anchorX="center">
          128-dim
        </Text>
        <Text position={[1.4, -0.5, 0]} fontSize={0.09} color="#c084fc" anchorX="center">
          Latent Trajectory
        </Text>
      </group>

      {/* Bottom Explanatory Summary Bar */}
      <group position={[0, -2.15, 0]}>
        <mesh position={[0, 0, -0.05]}>
          <planeGeometry args={[9.5, 0.5]} />
          <meshBasicMaterial color="#0f172a" transparent opacity={0.85} />
        </mesh>
        <Text position={[0, 0.08, 0]} fontSize={0.11} color="#e2e8f0" anchorX="center" fontWeight="600">
          Chronological Attack Progression Modeling: Links Discrete Snapshot Embeddings into Continuous Attack Trajectory
        </Text>
        <Text position={[0, -0.12, 0]} fontSize={0.09} color="#94a3b8" anchorX="center">
          Cell state preserves persistent memory • Gating mechanisms eliminate irrelevant network noise across 300s
        </Text>
      </group>
    </group>
  )
}
