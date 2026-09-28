import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { Text } from '@react-three/drei'
import * as THREE from 'three'
import { FEATURE_GROUPS } from '../data/demoData.js'

const RAW_COUNT = 79

export default function FeatureStage({ playing, speed }) {
  const raysGroupRef = useRef()
  const t = useRef(0)

  // 79 Raw feature grid positions (on LEFT: x from -5.6 to -2.4)
  const rawFeatures = useMemo(() => {
    return Array.from({ length: RAW_COUNT }, (_, i) => {
      const col = i % 8
      const row = Math.floor(i / 8)
      return {
        id: i,
        x: -5.4 + col * 0.42,
        y: 1.1 - row * 0.32,
        isSelected: i % 3 === 0 || i < 25, // Highlights the ones selected for the 25
      }
    })
  }, [])

  // 5 Behavioral Feature Category Cards (on RIGHT: x from 1.5 to 5.5)
  const categoryCards = useMemo(() => {
    const startY = 1.3
    const gapY = 0.62
    return FEATURE_GROUPS.map((g, i) => ({
      name: g.name,
      count: g.count,
      color: g.color,
      y: startY - i * gapY,
    }))
  }, [])

  useFrame((_, delta) => {
    const dt = playing ? delta * speed : 0
    t.current += dt

    if (raysGroupRef.current) {
      raysGroupRef.current.children.forEach((ray, i) => {
        const phase = (t.current * 0.8 + i * 0.2) % 1.0
        ray.material.opacity = 0.2 + 0.6 * Math.sin(phase * Math.PI)
      })
    }
  })

  return (
    <group>
      {/* Title */}
      <Text position={[0, 2.7, 0]} fontSize={0.24} color="#22d3ee" anchorX="center" fontWeight="bold">
        STAGE 03: FEATURE ENGINEERING & SELECTION
      </Text>
      <Text position={[0, 2.3, 0]} fontSize={0.13} color="#94a3b8" anchorX="center">
        INPUT: 79 Raw Metrics ⟹ PROCESS: Behavioral Feature Selection ⟹ OUTPUT: 25 Compact Behavioral Tensors
      </Text>

      {/* LEFT SECTION: 79 RAW FEATURES */}
      <group position={[-3.8, 0, 0]}>
        <Text position={[0, 1.7, 0]} fontSize={0.15} color="#38bdf8" anchorX="center" fontWeight="bold">
          [ INPUT: 79 RAW FEATURES ]
        </Text>
        <Text position={[0, 1.45, 0]} fontSize={0.11} color="#94a3b8" anchorX="center">
          CICFlowMeter Raw Flow Attributes
        </Text>

        {/* 79 Grid Tiles */}
        {rawFeatures.map((f) => (
          <mesh key={f.id} position={[f.x + 3.8, f.y, 0]}>
            <boxGeometry args={[0.34, 0.24, 0.08]} />
            <meshStandardMaterial
              color={f.isSelected ? '#38bdf8' : '#334155'}
              emissive={f.isSelected ? '#38bdf8' : '#1e293b'}
              emissiveIntensity={f.isSelected ? 0.8 : 0.2}
            />
          </mesh>
        ))}

        <Text position={[0, -2.1, 0]} fontSize={0.11} color="#64748b" anchorX="center">
          Raw dimensions: Duration, Packet Lengths, IATs, Flag Counts, Window Sizes
        </Text>
      </group>

      {/* CENTER SECTION: REDUCTION FUNNEL */}
      <group position={[-0.2, 0, 0]}>
        <Text position={[0, 0.8, 0]} fontSize={0.16} color="#ffffff" anchorX="center" fontWeight="bold">
          79 RAW
        </Text>
        <Text position={[0, 0.35, 0]} fontSize={0.26} color="#22d3ee" anchorX="center">
          ⟹
        </Text>
        <Text position={[0, 0.0, 0]} fontSize={0.12} color="#a5f3fc" anchorX="center" fontWeight="bold">
          -68% REDUCTION
        </Text>
        <Text position={[0, -0.22, 0]} fontSize={0.1} color="#94a3b8" anchorX="center">
          Isolates Attack
        </Text>
        <Text position={[0, -0.38, 0]} fontSize={0.1} color="#94a3b8" anchorX="center">
          Signatures
        </Text>
        <Text position={[0, -0.8, 0]} fontSize={0.16} color="#ffffff" anchorX="center" fontWeight="bold">
          25 BEHAVIORAL
        </Text>
      </group>

      {/* RIGHT SECTION: 25 ORGANIZED BEHAVIORAL FEATURES */}
      <group position={[3.6, 0, 0]}>
        <Text position={[0, 1.7, 0]} fontSize={0.15} color="#34d399" anchorX="center" fontWeight="bold">
          [ OUTPUT: 25 BEHAVIORAL FEATURES ]
        </Text>
        <Text position={[0, 1.45, 0]} fontSize={0.11} color="#94a3b8" anchorX="center">
          Categorized into 5 Domain Feature Vectors
        </Text>

        {/* 5 Behavioral Category Cards */}
        {categoryCards.map((cat, i) => (
          <group key={cat.name} position={[0, cat.y, 0]}>
            {/* Card Frame */}
            <mesh>
              <boxGeometry args={[3.2, 0.48, 0.15]} />
              <meshStandardMaterial color="#0f172a" roughness={0.3} />
            </mesh>
            <mesh position={[-1.5, 0, 0.08]}>
              <boxGeometry args={[0.08, 0.42, 0.02]} />
              <meshStandardMaterial color={cat.color} emissive={cat.color} emissiveIntensity={1.0} />
            </mesh>
            <Text position={[-1.3, 0.02, 0.1]} fontSize={0.12} color="#ffffff" anchorX="left" fontWeight="bold">
              {cat.name}
            </Text>
            <Text position={[1.3, 0.02, 0.1]} fontSize={0.11} color={cat.color} anchorX="right" fontWeight="bold">
              {cat.count} Features
            </Text>
          </group>
        ))}

        <Text position={[0, -2.1, 0]} fontSize={0.11} color="#94a3b8" anchorX="center">
          Total: 7 + 5 + 4 + 5 + 4 = 25 Validated Behavioral Indicators
        </Text>
      </group>
    </group>
  )
}
