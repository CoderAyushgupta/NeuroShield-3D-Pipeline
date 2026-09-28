import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { Text } from '@react-three/drei'
import * as THREE from 'three'

// 6 Discrete Incoming Flow Records in the demonstration batch
const BATCH_RECORDS = [
  { id: 0, label: 'Flow #01', type: 'VALID', color: '#38bdf8' },
  { id: 1, label: 'Flow #02', type: 'VALID', color: '#38bdf8' },
  { id: 2, label: 'Flow #03 (NaN)', type: 'CORRUPT', color: '#f43f5e' },
  { id: 3, label: 'Flow #04', type: 'VALID', color: '#38bdf8' },
  { id: 4, label: 'Flow #05 (Dup)', type: 'DUPLICATE', color: '#fb923c' },
  { id: 5, label: 'Flow #06', type: 'VALID', color: '#38bdf8' },
]

export default function CleaningStage({ playing, speed }) {
  const recordsGroupRef = useRef()
  const filterPulseRef = useRef()
  const t = useRef(0)

  useFrame((_, delta) => {
    const dt = playing ? delta * speed : 0
    t.current += dt

    if (filterPulseRef.current) {
      filterPulseRef.current.rotation.z += dt * 0.8
    }

    if (recordsGroupRef.current) {
      recordsGroupRef.current.children.forEach((mesh) => {
        if (mesh.userData && mesh.userData.recIdx !== undefined) {
          const { recIdx } = mesh.userData
          const rec = BATCH_RECORDS[recIdx]
          // Offset each record slightly along the conveyor belt
          const cycle = (t.current * 0.22 + recIdx * 0.16) % 1.0

          if (rec.type === 'VALID') {
            // Valid records travel straight from left (-5.2) to right (+5.2)
            mesh.position.x = THREE.MathUtils.lerp(-5.2, 5.2, cycle)
            mesh.position.y = 0.1
            // Scale and opacity normal
            mesh.scale.setScalar(1.0)
          } else {
            // Corrupt or duplicate records travel to center (0), then drop into discard buffer
            if (cycle < 0.48) {
              mesh.position.x = THREE.MathUtils.lerp(-5.2, 0.0, cycle / 0.48)
              mesh.position.y = 0.1
              mesh.scale.setScalar(1.0)
            } else {
              // Drops downward into discard tray
              mesh.position.x = 0.0
              const dropFrac = (cycle - 0.48) / 0.52
              mesh.position.y = THREE.MathUtils.lerp(0.1, -1.6, dropFrac)
              mesh.scale.setScalar(Math.max(0.01, 1.0 - dropFrac * 0.8))
            }
          }
        }
      })
    }
  })

  return (
    <group>
      {/* Title */}
      <Text position={[0, 2.7, 0]} fontSize={0.24} color="#67e8f9" anchorX="center" fontWeight="bold">
        STAGE 02: CLEANING & NORMALIZATION
      </Text>
      <Text position={[0, 2.3, 0]} fontSize={0.13} color="#94a3b8" anchorX="center">
        INPUT: Raw Network Records ⟹ PROCESS: Filter Invalid Rows & Normalize ⟹ OUTPUT: Clean Structured Flows
      </Text>

      {/* LEFT SECTION: INPUT RAW FLOWS */}
      <group position={[-4.5, 1.4, 0]}>
        <Text fontSize={0.15} color="#cbd5e1" anchorX="center" fontWeight="bold">
          [ 1. INPUT: RAW FLOWS ]
        </Text>
        <Text position={[0, -0.25, 0]} fontSize={0.11} color="#94a3b8" anchorX="center">
          Contains NaN, Nulls & Corrupted Rows
        </Text>
      </group>

      {/* Conveyor Track Guide Line */}
      <mesh position={[0, -0.3, 0]}>
        <boxGeometry args={[11, 0.04, 0.2]} />
        <meshStandardMaterial color="#1e293b" />
      </mesh>

      {/* CENTER SECTION: SANITIZATION & NORMALIZATION GATEWAY */}
      <group position={[0, 0, 0]}>
        {/* Gateway Frame */}
        <mesh position={[0, 0.3, 0]}>
          <boxGeometry args={[1.2, 2.4, 0.6]} />
          <meshStandardMaterial color="#0f172a" roughness={0.3} />
        </mesh>

        {/* Illuminated Filter Portal */}
        <mesh ref={filterPulseRef} position={[0, 0.3, 0.31]}>
          <torusGeometry args={[0.7, 0.04, 16, 32]} />
          <meshStandardMaterial color="#22d3ee" emissive="#22d3ee" emissiveIntensity={1.0} />
        </mesh>

        <Text position={[0, 1.7, 0]} fontSize={0.15} color="#22d3ee" anchorX="center" fontWeight="bold">
          [ 2. SANITIZATION GATE ]
        </Text>
        <Text position={[0, 0.6, 0.33]} fontSize={0.11} color="#ffffff" anchorX="center" fontWeight="bold">
          FILTER & NORM
        </Text>
        <Text position={[0, 0.35, 0.33]} fontSize={0.09} color="#a5f3fc" anchorX="center">
          Deduplication
        </Text>
        <Text position={[0, 0.15, 0.33]} fontSize={0.09} color="#a5f3fc" anchorX="center">
          Z-Score Scaling
        </Text>

        {/* Downward Discard Hopper (BELOW GATE) */}
        <group position={[0, -1.6, 0]}>
          <mesh>
            <boxGeometry args={[1.8, 0.5, 0.6]} />
            <meshStandardMaterial color="#1e1b4b" />
          </mesh>
          <mesh position={[0, 0, 0.31]}>
            <boxGeometry args={[1.6, 0.38, 0.02]} />
            <meshStandardMaterial color="#f43f5e" emissive="#f43f5e" emissiveIntensity={0.4} />
          </mesh>
          <Text position={[0, 0.08, 0.33]} fontSize={0.1} color="#ffffff" anchorX="center" fontWeight="bold">
            DISCARD BUFFER
          </Text>
          <Text position={[0, -0.1, 0.33]} fontSize={0.08} color="#fca5a5" anchorX="center">
            288,602 Corrupt Rows Filtered
          </Text>
        </group>
      </group>

      {/* RIGHT SECTION: OUTPUT CLEANED DATA */}
      <group position={[4.5, 1.4, 0]}>
        <Text fontSize={0.15} color="#34d399" anchorX="center" fontWeight="bold">
          [ 3. OUTPUT: CLEANED DATA ]
        </Text>
        <Text position={[0, -0.25, 0]} fontSize={0.11} color="#94a3b8" anchorX="center">
          100% Normalized & Validated Tensors
        </Text>
      </group>

      {/* Animated Flow Records traveling along conveyor */}
      <group ref={recordsGroupRef}>
        {BATCH_RECORDS.map((rec) => (
          <group key={rec.id} userData={{ recIdx: rec.id }} position={[-5, 0, 0]}>
            <mesh>
              <boxGeometry args={[1.1, 0.45, 0.3]} />
              <meshStandardMaterial
                color={rec.color}
                emissive={rec.color}
                emissiveIntensity={rec.type === 'VALID' ? 0.7 : 1.2}
              />
            </mesh>
            <Text position={[0, 0, 0.17]} fontSize={0.1} color="#ffffff" anchorX="center" fontWeight="bold">
              {rec.label}
            </Text>
          </group>
        ))}
      </group>

      <Text position={[0, -2.2, 0]} fontSize={0.12} color="#94a3b8" anchorX="center">
        • Cyan: Verified Normalized Records  |  • Red/Amber: Corrupt / Duplicate Flow Dropped into Discard Buffer
      </Text>
    </group>
  )
}
