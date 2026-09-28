import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { Text } from '@react-three/drei'
import * as THREE from 'three'
import { TEMPORAL_WINDOW_COUNT } from '../data/demoData.js'

export default function WindowStage({ playing, speed }) {
  const cursorRef = useRef()
  const fallingPacketsRef = useRef()
  const t = useRef(0)

  const gap = 1.15
  const startX = -((TEMPORAL_WINDOW_COUNT - 1) * gap) / 2

  // Continuous flows entering above
  const incomingFlows = useMemo(() => {
    return Array.from({ length: 24 }, (_, i) => ({
      id: i,
      windowTarget: i % TEMPORAL_WINDOW_COUNT,
      phaseOffset: (i * 0.17) % 1.0,
      color: i % 4 === 0 ? '#fb923c' : '#818cf8',
    }))
  }, [])

  useFrame((_, delta) => {
    const dt = playing ? delta * speed : 0
    t.current += dt

    // Moving aggregation scanner cursor
    if (cursorRef.current) {
      const activeWindowFloat = (t.current * 0.35) % TEMPORAL_WINDOW_COUNT
      cursorRef.current.position.x = startX + activeWindowFloat * gap
    }

    // Falling packet animation entering into their respective 30s window boxes
    if (fallingPacketsRef.current) {
      fallingPacketsRef.current.children.forEach((mesh) => {
        if (mesh.userData && mesh.userData.windowTarget !== undefined) {
          const { windowTarget, phaseOffset } = mesh.userData
          const cycle = (t.current * 0.4 + phaseOffset) % 1.0
          const targetX = startX + windowTarget * gap

          // Packet drops from top (y=1.8) down into box (y=0.0)
          mesh.position.x = targetX
          mesh.position.y = THREE.MathUtils.lerp(1.6, 0.05, cycle)
          mesh.scale.setScalar(Math.max(0.01, 1.0 - cycle * 0.4))
        }
      })
    }
  })

  return (
    <group>
      {/* Title */}
      <Text position={[0, 2.7, 0]} fontSize={0.24} color="#818cf8" anchorX="center" fontWeight="bold">
        STAGE 04: 30-SECOND TEMPORAL WINDOWING
      </Text>
      <Text position={[0, 2.3, 0]} fontSize={0.13} color="#94a3b8" anchorX="center">
        INPUT: Continuous Flow Stream ⟹ PROCESS: 30s Temporal Slicing ⟹ OUTPUT: 10 Discrete Snapshots (5-Min Horizon)
      </Text>

      {/* CONTINUOUS INCOMING FLOW STREAM (ABOVE) */}
      <group position={[0, 1.6, 0]}>
        <mesh position={[0, 0, 0]}>
          <boxGeometry args={[11.5, 0.04, 0.1]} />
          <meshStandardMaterial color="#334155" />
        </mesh>
        <Text position={[0, 0.25, 0]} fontSize={0.13} color="#38bdf8" anchorX="center" fontWeight="bold">
          [ INPUT: CONTINUOUS NETWORK FLOW DATA STREAM ]
        </Text>
      </group>

      {/* Falling packets entering windows */}
      <group ref={fallingPacketsRef}>
        {incomingFlows.map((flow) => (
          <mesh
            key={flow.id}
            userData={{ windowTarget: flow.windowTarget, phaseOffset: flow.phaseOffset }}
            position={[0, 1.6, 0]}
          >
            <boxGeometry args={[0.12, 0.12, 0.12]} />
            <meshStandardMaterial color={flow.color} emissive={flow.color} emissiveIntensity={1.0} />
          </mesh>
        ))}
      </group>

      {/* Sweeping Aggregation Cursor */}
      <mesh ref={cursorRef} position={[startX, 0, 0]}>
        <boxGeometry args={[1.05, 1.4, 0.8]} />
        <meshBasicMaterial color="#38bdf8" wireframe transparent opacity={0.4} />
      </mesh>

      {/* 10 WINDOW CONTAINERS ALONG TIME AXIS */}
      {Array.from({ length: TEMPORAL_WINDOW_COUNT }, (_, i) => {
        const x = startX + i * gap
        const isRecent = i >= TEMPORAL_WINDOW_COUNT - 2

        return (
          <group key={i} position={[x, 0, 0]}>
            {/* Window Container Box */}
            <mesh>
              <boxGeometry args={[0.85, 1.1, 0.6]} />
              <meshStandardMaterial
                color={isRecent ? '#fb923c' : '#4f46e5'}
                emissive={isRecent ? '#fb923c' : '#4f46e5'}
                emissiveIntensity={isRecent ? 0.6 : 0.3}
                transparent
                opacity={0.8}
                roughness={0.2}
              />
            </mesh>

            {/* Aggregation operator tags */}
            <Text position={[0, 0.1, 0.32]} fontSize={0.09} color="#ffffff" anchorX="center" fontWeight="bold">
              AGGREGATED
            </Text>
            <Text position={[0, -0.12, 0.32]} fontSize={0.07} color="#cbd5e1" anchorX="center">
              SUM • MEAN
            </Text>
            <Text position={[0, -0.28, 0.32]} fontSize={0.07} color="#cbd5e1" anchorX="center">
              MAX • NUNIQUE
            </Text>

            {/* Window Header */}
            <Text position={[0, -0.75, 0]} fontSize={0.14} color="#e0e7ff" anchorX="center" fontWeight="bold">
              {`W${i + 1}`}
            </Text>
            <Text position={[0, -0.98, 0]} fontSize={0.1} color="#94a3b8" anchorX="center">
              {`${i * 30}-${(i + 1) * 30}s`}
            </Text>
          </group>
        )
      })}

      {/* BOTTOM TIMELINE RULER */}
      <group position={[0, -1.3, 0]}>
        <mesh>
          <boxGeometry args={[11.5, 0.04, 0.1]} />
          <meshStandardMaterial color="#6366f1" />
        </mesh>
        <Text position={[0, -0.3, 0]} fontSize={0.13} color="#a5b4fc" anchorX="center" fontWeight="bold">
          [ OUTPUT: 10 CONSECUTIVE 30-SECOND TEMPORAL WINDOWS = 300 SECONDS TOTAL ]
        </Text>
      </group>
    </group>
  )
}
