import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { Text } from '@react-three/drei'
import * as THREE from 'three'

// 3 Source Host IP Endpoints
const SOURCES = [
  { id: 'src-1', ip: '192.168.10.14', type: 'Workstation', y: 1.2, color: '#38bdf8' },
  { id: 'src-2', ip: '192.168.10.50', type: 'Web Server', y: 0.0, color: '#818cf8' },
  { id: 'src-3', ip: '172.16.0.5', type: 'External WAN', y: -1.2, color: '#fb923c' },
]

const PACKETS_PER_CABLE = 8

export default function TrafficStage({ playing, speed }) {
  const packetGroupRef = useRef()
  const t = useRef(0)

  // Pre-generate packets flowing along each cable
  const packetTracks = useMemo(() => {
    return SOURCES.map((src, srcIdx) => {
      return Array.from({ length: PACKETS_PER_CABLE }, (_, pIdx) => ({
        id: `${src.id}-p-${pIdx}`,
        offset: pIdx / PACKETS_PER_CABLE,
        color: src.color,
        size: srcIdx === 2 ? 0.12 : 0.09,
        isProbe: srcIdx === 2 && pIdx % 2 === 0,
      }))
    })
  }, [])

  useFrame((_, delta) => {
    const dt = playing ? delta * speed : 0
    t.current += dt

    if (packetGroupRef.current) {
      packetGroupRef.current.children.forEach((mesh) => {
        if (mesh.userData && mesh.userData.srcIdx !== undefined) {
          const { srcIdx, baseOffset } = mesh.userData
          const phase = (t.current * 0.45 + baseOffset) % 1
          const startX = -5.0
          const endX = 3.5
          const startY = SOURCES[srcIdx].y
          const endY = 0

          // Interpolate from Source Host to Destination Ingress
          mesh.position.x = THREE.MathUtils.lerp(startX, endX, phase)
          mesh.position.y = THREE.MathUtils.lerp(startY, endY, phase)
        }
      })
    }
  })

  return (
    <group>
      {/* Stage Header */}
      <Text position={[0, 2.7, 0]} fontSize={0.24} color="#38bdf8" anchorX="center" fontWeight="bold">
        STAGE 01: RAW NETWORK TRAFFIC INGESTION
      </Text>
      <Text position={[0, 2.3, 0]} fontSize={0.13} color="#94a3b8" anchorX="center">
        INPUT: Unfiltered Network Telemetry • Capturing Packets Across Host Interfaces
      </Text>

      {/* 3 Source Host Terminals (LEFT) */}
      <group position={[-5.2, 0, 0]}>
        <Text position={[0, 2.0, 0]} fontSize={0.14} color="#38bdf8" anchorX="center" fontWeight="bold">
          [ INPUT: SOURCE HOSTS ]
        </Text>

        {SOURCES.map((src, i) => (
          <group key={src.id} position={[0, src.y, 0]}>
            {/* Host Node Box */}
            <mesh>
              <boxGeometry args={[1.5, 0.65, 0.4]} />
              <meshStandardMaterial color="#0f172a" roughness={0.3} />
            </mesh>
            <mesh position={[0, 0, 0.21]}>
              <boxGeometry args={[1.4, 0.55, 0.02]} />
              <meshStandardMaterial color={src.color} emissive={src.color} emissiveIntensity={0.5} />
            </mesh>
            <Text position={[0, 0.08, 0.23]} fontSize={0.11} color="#ffffff" anchorX="center" fontWeight="bold">
              {src.ip}
            </Text>
            <Text position={[0, -0.12, 0.23]} fontSize={0.09} color="#cbd5e1" anchorX="center">
              {src.type}
            </Text>
          </group>
        ))}
      </group>

      {/* Destination Ingress Gateway (RIGHT) */}
      <group position={[3.8, 0, 0]}>
        <Text position={[0, 2.0, 0]} fontSize={0.14} color="#a5f3fc" anchorX="center" fontWeight="bold">
          [ INGRESS SENSOR ]
        </Text>

        {/* Central Gateway Sensor Box */}
        <mesh>
          <boxGeometry args={[1.6, 2.8, 0.5]} />
          <meshStandardMaterial color="#0f172a" roughness={0.3} />
        </mesh>
        <mesh position={[0, 0, 0.26]}>
          <boxGeometry args={[1.4, 2.6, 0.02]} />
          <meshStandardMaterial color="#0284c7" emissive="#0284c7" emissiveIntensity={0.4} />
        </mesh>
        <Text position={[0, 0.5, 0.28]} fontSize={0.14} color="#ffffff" anchorX="center" fontWeight="bold">
          NEUROSHIELD
        </Text>
        <Text position={[0, 0.22, 0.28]} fontSize={0.11} color="#38bdf8" anchorX="center">
          Ingress Sensor
        </Text>
        <Text position={[0, -0.05, 0.28]} fontSize={0.09} color="#94a3b8" anchorX="center">
          IP: 192.168.10.1
        </Text>
        <Text position={[0, -0.35, 0.28]} fontSize={0.09} color="#34d399" anchorX="center">
          STATUS: INGESTING
        </Text>
      </group>

      {/* Network Conduits / Cables connecting Sources to Ingress */}
      {SOURCES.map((src) => {
        const points = [new THREE.Vector3(-4.4, src.y, 0), new THREE.Vector3(3.0, 0, 0)]
        return (
          <line key={`cable-${src.id}`}>
            <bufferGeometry attach="geometry" onUpdate={(geo) => geo.setFromPoints(points)} />
            <lineBasicMaterial attach="material" color="#1e293b" linewidth={2} />
          </line>
        )
      })}

      {/* Discrete Packets Flowing Along Cables */}
      <group ref={packetGroupRef}>
        {packetTracks.map((cable, srcIdx) =>
          cable.map((pkt) => (
            <mesh
              key={pkt.id}
              userData={{ srcIdx, baseOffset: pkt.offset }}
              position={[-5, 0, 0]}
            >
              <boxGeometry args={[0.22, 0.1, 0.1]} />
              <meshStandardMaterial
                color={pkt.color}
                emissive={pkt.color}
                emissiveIntensity={1.2}
              />
            </mesh>
          ))
        )}
      </group>

      {/* Flow Direction Arrow & Output Banner */}
      <Text position={[0, -1.8, 0]} fontSize={0.13} color="#94a3b8" anchorX="center">
        Continuous Raw Packets ⟹ Passed to Stage 02 (Cleaning & Normalization)
      </Text>
      <Text position={[0, -2.1, 0]} fontSize={0.11} color="#64748b" anchorX="center">
        • Cyan: Regular HTTP/S • Purple: DNS Queries • Amber: Port Sweep / SYN Flood Probe Packets
      </Text>
    </group>
  )
}
