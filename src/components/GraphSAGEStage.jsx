import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { Text } from '@react-three/drei'
import * as THREE from 'three'

// Surrounding Neighbor Nodes of Target Node v
const NEIGHBORS = [
  { id: 'u1', label: 'Neighbor u1 (Web Server)', x: -3.8, y: 1.4, color: '#818cf8' },
  { id: 'u2', label: 'Neighbor u2 (Gateway)', x: -5.6, y: 0.0, color: '#818cf8' },
  { id: 'u3', label: 'Neighbor u3 (Domain Controller)', x: -2.0, y: 0.0, color: '#818cf8' },
  { id: 'u4', label: 'Neighbor u4 (Database)', x: -3.8, y: -1.4, color: '#818cf8' },
]

export default function GraphSAGEStage({ playing, speed }) {
  const pulseGroupRef = useRef()
  const aggRingRef = useRef()
  const outVectorRef = useRef()
  const t = useRef(0)

  const targetNodePos = { x: -3.8, y: 0.0 }

  useFrame((_, delta) => {
    const dt = playing ? delta * speed : 0
    t.current += dt

    // Step 3: Information flowing inward from neighbors toward target node
    if (pulseGroupRef.current) {
      pulseGroupRef.current.children.forEach((mesh, i) => {
        const neighbor = NEIGHBORS[i]
        const phase = (t.current * 0.6 + i * 0.25) % 1.0
        // Travel from neighbor to target
        mesh.position.x = THREE.MathUtils.lerp(neighbor.x, targetNodePos.x, phase)
        mesh.position.y = THREE.MathUtils.lerp(neighbor.y, targetNodePos.y, phase)
      })
    }

    // Step 4: Pulsing Aggregation Ring at Target Node
    if (aggRingRef.current) {
      aggRingRef.current.rotation.z += dt * 1.2
      const pulseScale = 1.0 + 0.15 * Math.sin(t.current * 3.0)
      aggRingRef.current.scale.set(pulseScale, pulseScale, 1.0)
    }

    // Step 5 & 6: Output embedding pulse traveling rightward toward Stage 7
    if (outVectorRef.current) {
      const outPhase = (t.current * 0.4) % 1.0
      outVectorRef.current.position.x = THREE.MathUtils.lerp(-1.8, 4.0, outPhase)
    }
  })

  return (
    <group>
      {/* Title */}
      <Text position={[0, 2.7, 0]} fontSize={0.24} color="#c084fc" anchorX="center" fontWeight="bold">
        STAGE 06: GRAPHSAGE (NEIGHBORHOOD AGGREGATION)
      </Text>
      <Text position={[0, 2.3, 0]} fontSize={0.13} color="#94a3b8" anchorX="center">
        INPUT: Target Node & Neighbors ⟹ PROCESS: Aggregate Neighbor Features ⟹ OUTPUT: Learned Node Embedding
      </Text>

      {/* LEFT SECTION: 1 TARGET NODE + NEIGHBORHOOD TOPOLOGY */}
      <group position={[0, 0, 0]}>
        {/* Connector lines from neighbors to Target Node v */}
        {NEIGHBORS.map((nbr) => {
          const points = [new THREE.Vector3(nbr.x, nbr.y, 0), new THREE.Vector3(targetNodePos.x, targetNodePos.y, 0)]
          return (
            <line key={`line-${nbr.id}`}>
              <bufferGeometry attach="geometry" onUpdate={(geo) => geo.setFromPoints(points)} />
              <lineBasicMaterial attach="material" color="#6366f1" transparent opacity={0.6} />
            </line>
          )
        })}

        {/* Message-Passing Inward Data Particles */}
        <group ref={pulseGroupRef}>
          {NEIGHBORS.map((nbr, i) => (
            <mesh key={`p-${i}`} position={[nbr.x, nbr.y, 0]}>
              <sphereGeometry args={[0.08, 8, 8]} />
              <meshStandardMaterial color="#38bdf8" emissive="#38bdf8" emissiveIntensity={1.4} />
            </mesh>
          ))}
        </group>

        {/* Surrounding Neighbor Nodes */}
        {NEIGHBORS.map((nbr) => (
          <group key={nbr.id} position={[nbr.x, nbr.y, 0]}>
            <mesh>
              <boxGeometry args={[1.5, 0.45, 0.2]} />
              <meshStandardMaterial color="#0f172a" roughness={0.3} />
            </mesh>
            <mesh position={[0, 0, 0.11]}>
              <boxGeometry args={[1.4, 0.38, 0.02]} />
              <meshStandardMaterial color={nbr.color} emissive={nbr.color} emissiveIntensity={0.6} />
            </mesh>
            <Text position={[0, 0, 0.13]} fontSize={0.09} color="#ffffff" anchorX="center" fontWeight="bold">
              {nbr.label}
            </Text>
          </group>
        ))}

        {/* Central TARGET NODE v */}
        <group position={[targetNodePos.x, targetNodePos.y, 0]}>
          {/* Target Host Box */}
          <mesh>
            <boxGeometry args={[1.8, 0.75, 0.3]} />
            <meshStandardMaterial color="#0f172a" roughness={0.3} />
          </mesh>
          <mesh position={[0, 0, 0.16]}>
            <boxGeometry args={[1.7, 0.65, 0.02]} />
            <meshStandardMaterial color="#a855f7" emissive="#a855f7" emissiveIntensity={0.8} />
          </mesh>
          <Text position={[0, 0.1, 0.18]} fontSize={0.11} color="#ffffff" anchorX="center" fontWeight="bold">
            TARGET HOST NODE (v)
          </Text>
          <Text position={[0, -0.12, 0.18]} fontSize={0.09} color="#e9d5ff" anchorX="center">
            Aggregating N(v) Features
          </Text>

          {/* Aggregation Ring */}
          <mesh ref={aggRingRef} position={[0, 0, 0.2]}>
            <torusGeometry args={[0.95, 0.03, 16, 32]} />
            <meshStandardMaterial color="#c084fc" emissive="#c084fc" emissiveIntensity={1.2} />
          </mesh>
        </group>
      </group>

      {/* CENTER / PROCESS FORMULA */}
      <group position={[0.4, 0, 0]}>
        <Text position={[0, 0.6, 0]} fontSize={0.13} color="#c084fc" anchorX="center" fontWeight="bold">
          [ AGGREGATION OPERATOR ]
        </Text>
        <Text position={[0, 0.25, 0]} fontSize={0.11} color="#ffffff" anchorX="center" fontFamily="monospace">
          h_N(v) = AGG( W · h_u, ∀u ∈ N(v) )
        </Text>
        <Text position={[0, -0.1, 0]} fontSize={0.24} color="#c084fc" anchorX="center">
          ⟹
        </Text>
        <Text position={[0, -0.4, 0]} fontSize={0.1} color="#94a3b8" anchorX="center">
          Pooling 2-Hop Graph Context
        </Text>
      </group>

      {/* RIGHT SECTION: OUTPUT NODE EMBEDDING VECTOR */}
      <group position={[4.2, 0, 0]}>
        <Text position={[0, 1.4, 0]} fontSize={0.15} color="#34d399" anchorX="center" fontWeight="bold">
          [ OUTPUT: NODE EMBEDDING ]
        </Text>
        <Text position={[0, 1.15, 0]} fontSize={0.11} color="#94a3b8" anchorX="center">
          64-Dimensional Inductive Vector (z_v)
        </Text>

        {/* Structured 64-Dim Vector Tensor Display */}
        <mesh position={[0, 0, 0]}>
          <boxGeometry args={[2.8, 1.6, 0.3]} />
          <meshStandardMaterial color="#0f172a" roughness={0.3} />
        </mesh>
        <mesh position={[0, 0, 0.16]}>
          <boxGeometry args={[2.6, 1.4, 0.02]} />
          <meshStandardMaterial color="#6366f1" emissive="#6366f1" emissiveIntensity={0.5} />
        </mesh>
        <Text position={[0, 0.45, 0.18]} fontSize={0.11} color="#ffffff" anchorX="center" fontWeight="bold">
          EMBEDDING TENSOR [1 × 64]
        </Text>
        <Text position={[0, 0.15, 0.18]} fontSize={0.09} color="#cbd5e1" anchorX="center" fontFamily="monospace">
          [ +0.42, -0.18, +0.89, -0.34,
        </Text>
        <Text position={[0, -0.05, 0.18]} fontSize={0.09} color="#cbd5e1" anchorX="center" fontFamily="monospace">
          +0.71, +0.05, -0.62, +0.94, ... ]
        </Text>
        <Text position={[0, -0.4, 0.18]} fontSize={0.09} color="#a5b4fc" anchorX="center">
          ⟹ Passed to Stage 07 (LSTM)
        </Text>
      </group>

      {/* Output Vector traveling pulse */}
      <mesh ref={outVectorRef} position={[-1.8, 0, 0.2]}>
        <boxGeometry args={[0.3, 0.2, 0.1]} />
        <meshStandardMaterial color="#34d399" emissive="#34d399" emissiveIntensity={1.4} />
      </mesh>

      <Text position={[0, -2.1, 0]} fontSize={0.12} color="#94a3b8" anchorX="center">
        GraphSAGE aggregates neighbor communications into a vector without full graph retraining
      </Text>
    </group>
  )
}
