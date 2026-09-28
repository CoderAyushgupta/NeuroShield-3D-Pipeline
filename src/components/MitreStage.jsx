import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { Text } from '@react-three/drei'
import * as THREE from 'three'

// 5 Sequential MITRE ATT&CK Kill-Chain Tactics
const KILL_CHAIN_TACTICS = [
  {
    name: 'Reconnaissance',
    technique: 'T1595.002',
    desc: 'Active IP Scanning',
    status: 'OBSERVED',
    statusColor: '#38bdf8',
    pillarColor: '#0284c7',
  },
  {
    name: 'Initial Access',
    technique: 'T1190',
    desc: 'Public Facing Exploit',
    status: 'OBSERVED',
    statusColor: '#38bdf8',
    pillarColor: '#0284c7',
  },
  {
    name: 'Discovery',
    technique: 'T1087',
    desc: 'Account Discovery',
    status: 'CURRENT (T=0)',
    statusColor: '#f59e0b',
    pillarColor: '#d97706',
  },
  {
    name: 'Lateral Movement',
    technique: 'T1021.002',
    desc: 'SMB / Admin Shares',
    status: 'FORECASTED (INTERCEPT)',
    statusColor: '#ef4444',
    pillarColor: '#dc2626',
    isTarget: true,
  },
  {
    name: 'Exfiltration',
    technique: 'T1041',
    desc: 'Exfil Over C2 Channel',
    status: 'BLOCKED / SHIELDED',
    statusColor: '#10b981',
    pillarColor: '#059669',
    isBlocked: true,
  },
]

export default function MitreStage({ playing, speed }) {
  const shieldRef = useRef()
  const pulseRef = useRef()
  const t = useRef(0)

  const gap = 2.4
  const startX = -((KILL_CHAIN_TACTICS.length - 1) * gap) / 2
  const targetIndex = KILL_CHAIN_TACTICS.findIndex((s) => s.isTarget)

  useFrame((_, delta) => {
    const dt = playing ? delta * speed : 0
    t.current += dt

    // Pulsing tactical interception shield on Lateral Movement
    if (shieldRef.current) {
      const pulse = 1 + Math.sin(t.current * 3.5) * 0.08
      shieldRef.current.scale.set(pulse, pulse, pulse)
    }

    // Progression laser traversing up to Lateral Movement where it gets intercepted
    if (pulseRef.current) {
      const maxDist = targetIndex * gap
      const progress = (t.current * 0.4) % 1
      pulseRef.current.position.x = startX + progress * maxDist
      pulseRef.current.position.y = 0.2
    }
  })

  return (
    <group>
      {/* Title */}
      <Text position={[0, 2.7, 0]} fontSize={0.24} color="#f87171" anchorX="center" fontWeight="bold">
        Threat Classification & MITRE ATT&CK Defensive Interception
      </Text>
      <Text position={[0, 2.35, 0]} fontSize={0.12} color="#94a3b8" anchorX="center">
        Predictive Kill-Chain Alignment • Proactive SOC Early Warning Before Payload Detonation
      </Text>

      {/* INPUT -> PROCESS -> OUTPUT Architecture Badges */}
      <group position={[0, 1.95, 0]}>
        {/* INPUT */}
        <mesh position={[-4.0, 0, 0]}>
          <planeGeometry args={[2.7, 0.3]} />
          <meshBasicMaterial color="#1e293b" transparent opacity={0.8} />
        </mesh>
        <Text position={[-4.0, 0, 0.02]} fontSize={0.095} color="#fb923c" anchorX="center" fontWeight="bold">
          INPUT: Forecasted Vectors & 87% Risk
        </Text>

        {/* PROCESS */}
        <mesh position={[0, 0, 0]}>
          <planeGeometry args={[3.4, 0.3]} />
          <meshBasicMaterial color="#450a0a" transparent opacity={0.8} />
        </mesh>
        <Text position={[0, 0, 0.02]} fontSize={0.095} color="#f87171" anchorX="center" fontWeight="bold">
          PROCESS: MITRE ATT&CK Matrix Alignment
        </Text>

        {/* OUTPUT */}
        <mesh position={[4.0, 0, 0]}>
          <planeGeometry args={[2.7, 0.3]} />
          <meshBasicMaterial color="#064e3b" transparent opacity={0.8} />
        </mesh>
        <Text position={[4.0, 0, 0.02]} fontSize={0.095} color="#34d399" anchorX="center" fontWeight="bold">
          OUTPUT: Preemptive Firewall Interception
        </Text>
      </group>

      {/* 5 MITRE Kill-Chain Tactic Stations */}
      {KILL_CHAIN_TACTICS.map((stage, idx) => {
        const x = startX + idx * gap

        return (
          <group key={stage.name} position={[x, 0, 0]}>
            {/* Kill-chain Pipeline Connector between stations */}
            {idx < KILL_CHAIN_TACTICS.length - 1 && (
              <group position={[gap / 2, 0.2, 0]}>
                <mesh rotation={[0, 0, Math.PI / 2]}>
                  <cylinderGeometry args={[0.025, 0.025, gap - 0.9, 12]} />
                  <meshStandardMaterial
                    color={idx < targetIndex ? '#ef4444' : '#334155'}
                    emissive={idx < targetIndex ? '#dc2626' : '#1e293b'}
                    emissiveIntensity={idx < targetIndex ? 0.8 : 0.2}
                  />
                </mesh>
              </group>
            )}

            {/* Tactical Pedestal Column */}
            <mesh position={[0, 0.2, 0]}>
              <cylinderGeometry args={[0.42, 0.48, 0.8, 24]} />
              <meshStandardMaterial
                color={stage.pillarColor}
                emissive={stage.pillarColor}
                emissiveIntensity={stage.isTarget ? 0.9 : 0.3}
                roughness={0.2}
                metalness={0.8}
              />
            </mesh>

            {/* Pedestal Top Ring */}
            <mesh position={[0, 0.62, 0]} rotation={[Math.PI / 2, 0, 0]}>
              <torusGeometry args={[0.38, 0.03, 16, 24]} />
              <meshBasicMaterial color={stage.statusColor} />
            </mesh>

            {/* MITRE Technique Code Badge */}
            <Text position={[0, 0.25, 0.44]} fontSize={0.11} color="#ffffff" anchorX="center" fontWeight="bold">
              {stage.technique}
            </Text>

            {/* Tactic Stage Name on Top */}
            <Text position={[0, 0.85, 0]} fontSize={0.13} color="#f8fafc" anchorX="center" fontWeight="bold">
              {stage.name}
            </Text>

            {/* Technique Details Subtext */}
            <Text position={[0, -0.42, 0]} fontSize={0.09} color="#94a3b8" anchorX="center">
              {stage.desc}
            </Text>

            {/* Status Pill Badge */}
            <mesh position={[0, -0.66, 0]}>
              <planeGeometry args={[1.7, 0.22]} />
              <meshBasicMaterial color="#0f172a" />
            </mesh>
            <Text position={[0, -0.66, 0.02]} fontSize={0.08} color={stage.statusColor} anchorX="center" fontWeight="bold">
              {stage.status}
            </Text>

            {/* Tactical Holographic Interception Shield at Lateral Movement */}
            {stage.isTarget && (
              <group ref={shieldRef} position={[0, 0.4, 0]}>
                {/* Translucent Forcefield Bubble */}
                <mesh>
                  <sphereGeometry args={[0.75, 24, 24]} />
                  <meshStandardMaterial
                    color="#ef4444"
                    emissive="#f87171"
                    emissiveIntensity={1.2}
                    transparent
                    opacity={0.3}
                    roughness={0.1}
                  />
                </mesh>
                {/* Hexagonal / Wireframe Shield Grid */}
                <mesh>
                  <sphereGeometry args={[0.77, 16, 16]} />
                  <meshBasicMaterial color="#fca5a5" wireframe transparent opacity={0.4} />
                </mesh>
                {/* Interception Badge Banner */}
                <Text position={[0, 1.05, 0]} fontSize={0.12} color="#f87171" anchorX="center" fontWeight="bold">
                  🛡️ INTERCEPTION SHIELD ACTIVE
                </Text>
                <Text position={[0, 0.9, 0]} fontSize={0.08} color="#fca5a5" anchorX="center">
                  Threat Neutralized Pre-Lateral Spread
                </Text>
              </group>
            )}

            {/* Shielded / Safe indicator for Exfiltration */}
            {stage.isBlocked && (
              <group position={[0, 0.4, 0]}>
                <mesh>
                  <sphereGeometry args={[0.55, 16, 16]} />
                  <meshStandardMaterial
                    color="#10b981"
                    emissive="#34d399"
                    emissiveIntensity={0.4}
                    transparent
                    opacity={0.2}
                  />
                </mesh>
                <Text position={[0, 0.95, 0]} fontSize={0.10} color="#34d399" anchorX="center" fontWeight="bold">
                  PROTECTED ASSET
                </Text>
              </group>
            )}
          </group>
        )
      })}

      {/* Moving Attack Trajectory Pulse (Intercepted at Lateral Movement) */}
      <mesh ref={pulseRef}>
        <sphereGeometry args={[0.09, 12, 12]} />
        <meshStandardMaterial color="#ffffff" emissive="#ef4444" emissiveIntensity={2.0} toneMapped={false} />
      </mesh>

      {/* Proactive SOC Response Directive HUD */}
      <group position={[0, -1.75, 0]}>
        <mesh position={[0, 0, -0.05]}>
          <planeGeometry args={[9.5, 0.85]} />
          <meshBasicMaterial color="#0f172a" transparent opacity={0.9} />
        </mesh>
        <Text position={[0, 0.22, 0]} fontSize={0.13} color="#ffffff" anchorX="center" fontWeight="bold">
          PROACTIVE SOC DIRECTIVE: PREEMPTIVE MICRO-SEGMENTATION RULE DISPATCHED
        </Text>
        <Text position={[0, -0.02, 0]} fontSize={0.10} color="#fca5a5" anchorX="center" fontWeight="600">
          Target: T1021.002 (Remote SMB Spread) • Rule: DROP tcp 192.168.1.0/24:445 • Action Taken in T+0s
        </Text>
        <Text position={[0, -0.25, 0]} fontSize={0.09} color="#94a3b8" anchorX="center">
          Attack chain halted before Lateral Movement phase • Zero Data Exfiltration or Ransomware Impact
        </Text>
      </group>
    </group>
  )
}
