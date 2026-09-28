import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { Text } from '@react-three/drei'
import * as THREE from 'three'

// 6 Core Enterprise Network Hosts
const HOST_NODES = [
  { id: 0, label: 'Host A (Client)', ip: '192.168.10.14', x: -4.2, y: 0.8, color: '#38bdf8' },
  { id: 1, label: 'Host B (Client)', ip: '192.168.10.25', x: -4.2, y: -0.8, color: '#38bdf8' },
  { id: 2, label: 'Core Switch / GW', ip: '192.168.10.1', x: -0.8, y: 0.0, color: '#818cf8' },
  { id: 3, label: 'Domain Controller', ip: '192.168.10.10', x: 2.8, y: 1.1, color: '#a78bfa' },
  { id: 4, label: 'Database Server', ip: '192.168.10.50', x: 2.8, y: -1.1, color: '#a78bfa' },
  { id: 5, label: 'External Ingress', ip: '172.16.0.1', x: -0.8, y: 1.8, color: '#fb923c' },
]

// Directed Communication Edges: Source IP -> Destination IP
const GRAPH_EDGES = [
  { src: 0, dst: 2, proto: 'HTTPS (443)', suspicious: false },
  { src: 1, dst: 2, proto: 'SMB (445)', suspicious: false },
  { src: 2, dst: 3, proto: 'Kerberos (88)', suspicious: false },
  { src: 2, dst: 4, proto: 'SQL (1433)', suspicious: false },
  { src: 5, dst: 0, proto: 'Port Scan / SYN Probe', suspicious: true },
  { src: 0, dst: 3, proto: 'Lateral Auth Attempt', suspicious: true },
]

export default function GraphStage({ playing, speed }) {
  const pulseGroupRef = useRef()
  const t = useRef(0)

  useFrame((_, delta) => {
    const dt = playing ? delta * speed : 0
    t.current += dt

    if (pulseGroupRef.current) {
      pulseGroupRef.current.children.forEach((mesh, i) => {
        const edge = GRAPH_EDGES[i]
        const srcNode = HOST_NODES[edge.src]
        const dstNode = HOST_NODES[edge.dst]
        const phase = (t.current * 0.7 + i * 0.18) % 1.0

        mesh.position.x = THREE.MathUtils.lerp(srcNode.x, dstNode.x, phase)
        mesh.position.y = THREE.MathUtils.lerp(srcNode.y, dstNode.y, phase)
      })
    }
  })

  return (
    <group>
      {/* Title */}
      <Text position={[0, 2.7, 0]} fontSize={0.24} color="#a78bfa" anchorX="center" fontWeight="bold">
        STAGE 05: COMMUNICATION GRAPH CONSTRUCTION
      </Text>
      <Text position={[0, 2.3, 0]} fontSize={0.13} color="#94a3b8" anchorX="center">
        INPUT: 30s Window Records ⟹ PROCESS: Source IP → Destination IP Topology ⟹ OUTPUT: Dynamic Host Graph
      </Text>

      {/* Communication Edges */}
      {GRAPH_EDGES.map((e, idx) => {
        const srcNode = HOST_NODES[e.src]
        const dstNode = HOST_NODES[e.dst]
        const points = [new THREE.Vector3(srcNode.x, srcNode.y, 0), new THREE.Vector3(dstNode.x, dstNode.y, 0)]
        const midX = (srcNode.x + dstNode.x) / 2
        const midY = (srcNode.y + dstNode.y) / 2

        return (
          <group key={`edge-${idx}`}>
            <line>
              <bufferGeometry attach="geometry" onUpdate={(geo) => geo.setFromPoints(points)} />
              <lineBasicMaterial
                attach="material"
                color={e.suspicious ? '#fb923c' : '#3b82f6'}
                transparent
                opacity={e.suspicious ? 0.9 : 0.45}
                linewidth={e.suspicious ? 2 : 1}
              />
            </line>
            {/* Edge Protocol Label */}
            <Text
              position={[midX, midY + 0.12, 0.05]}
              fontSize={0.08}
              color={e.suspicious ? '#fca5a5' : '#94a3b8'}
              anchorX="center"
            >
              {e.proto}
            </Text>
          </group>
        )
      })}

      {/* Active Directed Flow Pulses */}
      <group ref={pulseGroupRef}>
        {GRAPH_EDGES.map((e, i) => (
          <mesh key={`p-${i}`} position={[0, 0, 0]}>
            <sphereGeometry args={[e.suspicious ? 0.08 : 0.055, 8, 8]} />
            <meshStandardMaterial
              color={e.suspicious ? '#fb923c' : '#38bdf8'}
              emissive={e.suspicious ? '#fb923c' : '#38bdf8'}
              emissiveIntensity={1.4}
              toneMapped={false}
            />
          </mesh>
        ))}
      </group>

      {/* Host IP Nodes */}
      {HOST_NODES.map((n) => (
        <group key={n.id} position={[n.x, n.y, 0]}>
          <mesh>
            <boxGeometry args={[1.5, 0.55, 0.2]} />
            <meshStandardMaterial color="#0f172a" roughness={0.3} />
          </mesh>
          <mesh position={[0, 0, 0.11]}>
            <boxGeometry args={[1.4, 0.46, 0.02]} />
            <meshStandardMaterial color={n.color} emissive={n.color} emissiveIntensity={0.5} />
          </mesh>
          <Text position={[0, 0.06, 0.13]} fontSize={0.11} color="#ffffff" anchorX="center" fontWeight="bold">
            {n.label}
          </Text>
          <Text position={[0, -0.1, 0.13]} fontSize={0.09} color="#cbd5e1" anchorX="center">
            {n.ip}
          </Text>
        </group>
      ))}

      <Text position={[0, -2.1, 0]} fontSize={0.12} color="#94a3b8" anchorX="center">
        • Blue Links: Standard Internal Communication  |  • Amber Links: Probing / Lateral Ingress Flow
      </Text>
    </group>
  )
}
