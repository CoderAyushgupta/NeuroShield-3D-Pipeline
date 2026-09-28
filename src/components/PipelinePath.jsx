import { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import { Text } from '@react-three/drei'
import * as THREE from 'three'

// Lays the 9 stages out along a gentle 3D arc
export function stagePosition(index, total) {
  const t = index / (total - 1)
  const x = (t - 0.5) * 22
  const z = Math.sin(t * Math.PI) * -3.2
  const y = Math.sin(t * Math.PI * 2) * 0.6
  return [x, y, z]
}

export default function PipelinePath({ stages, stageIndex, onSelect, playing, speed }) {
  return (
    <group>
      {stages.map((s, i) => {
        const pos = stagePosition(i, stages.length)
        const active = i === stageIndex
        return (
          <group key={s.key} position={pos}>
            {/* Stage Marker Core */}
            <mesh
              onClick={(e) => {
                e.stopPropagation()
                onSelect(i)
              }}
            >
              <octahedronGeometry args={[active ? 0.38 : 0.22, 0]} />
              <meshStandardMaterial
                color={s.color}
                emissive={s.color}
                emissiveIntensity={active ? 1.4 : 0.4}
                roughness={0.3}
                metalness={0.5}
              />
            </mesh>

            {/* Active Stage Orbital Glow Ring */}
            {active && <ActiveStageHalo color={s.color} />}

            {/* Stage Code & Label */}
            <Text
              position={[0, -0.55, 0]}
              fontSize={active ? 0.2 : 0.16}
              color={active ? '#ffffff' : '#72829d'}
              anchorX="center"
              anchorY="top"
              maxWidth={2.2}
            >
              {s.short}
            </Text>

            {/* Connector to next stage with animated data flow */}
            {i < stages.length - 1 && (
              <StageConnector
                from={pos}
                to={stagePosition(i + 1, stages.length)}
                isCurrentLink={i === stageIndex || i === stageIndex - 1}
                color={s.color}
                playing={playing}
                speed={speed}
              />
            )}
          </group>
        )
      })}
    </group>
  )
}

function ActiveStageHalo({ color }) {
  const ringRef = useRef()

  useFrame((_, delta) => {
    if (ringRef.current) {
      ringRef.current.rotation.x += delta * 1.2
      ringRef.current.rotation.y += delta * 0.9
    }
  })

  return (
    <mesh ref={ringRef}>
      <torusGeometry args={[0.55, 0.02, 16, 32]} />
      <meshBasicMaterial color={color} transparent opacity={0.7} />
    </mesh>
  )
}

function StageConnector({ from, to, isCurrentLink, color, playing, speed }) {
  const pulseRef = useRef()
  const t = useRef(0)

  // Relative vector from 'from' to 'to'
  const rel = useMemo(() => [to[0] - from[0], to[1] - from[1], to[2] - from[2]], [from, to])
  const points = useMemo(() => [new THREE.Vector3(0, 0, 0), new THREE.Vector3(...rel)], [rel])

  useFrame((_, delta) => {
    if (playing) t.current += delta * speed * (isCurrentLink ? 1.4 : 0.7)
    if (pulseRef.current) {
      const phase = (t.current * 0.5) % 1
      pulseRef.current.position.set(rel[0] * phase, rel[1] * phase, rel[2] * phase)
    }
  })

  return (
    <group>
      {/* Structural Backbone Line */}
      <line>
        <bufferGeometry attach="geometry" onUpdate={(geo) => geo.setFromPoints(points)} />
        <lineBasicMaterial
          attach="material"
          color={isCurrentLink ? '#38bdf8' : '#223249'}
          transparent
          opacity={isCurrentLink ? 0.85 : 0.45}
        />
      </line>

      {/* Flowing Data Packet Pulse */}
      <mesh ref={pulseRef}>
        <sphereGeometry args={[isCurrentLink ? 0.065 : 0.04, 8, 8]} />
        <meshBasicMaterial
          color={isCurrentLink ? '#38bdf8' : color}
          transparent
          opacity={0.9}
        />
      </mesh>
    </group>
  )
}
