import { useEffect, useRef, useMemo } from 'react'
import { useThree, useFrame } from '@react-three/fiber'
import { OrbitControls, Grid, Stars } from '@react-three/drei'
import * as THREE from 'three'

import PipelinePath, { stagePosition } from './PipelinePath.jsx'
import TrafficStage from './TrafficStage.jsx'
import CleaningStage from './CleaningStage.jsx'
import FeatureStage from './FeatureStage.jsx'
import WindowStage from './WindowStage.jsx'
import GraphStage from './GraphStage.jsx'
import GraphSAGEStage from './GraphSAGEStage.jsx'
import LSTMStage from './LSTMStage.jsx'
import WorldModelStage from './WorldModelStage.jsx'
import MitreStage from './MitreStage.jsx'

const STAGE_COMPONENTS = {
  traffic: TrafficStage,
  cleaning: CleaningStage,
  features: FeatureStage,
  windows: WindowStage,
  graph: GraphStage,
  graphsage: GraphSAGEStage,
  lstm: LSTMStage,
  worldmodel: WorldModelStage,
  mitre: MitreStage,
}

// Stage-specific cinematic camera offsets for optimal depth and clarity
const STAGE_CAMERA_CONFIGS = [
  { camOffset: [0, 3.2, 8.6], targetOffset: [0, 0, 0] },      // 0: Traffic (wide packet flow view)
  { camOffset: [0.4, 2.6, 7.8], targetOffset: [0, 0.1, 0] },   // 1: Cleaning (filtering barrier view)
  { camOffset: [0, 3.2, 8.5], targetOffset: [0, 0.3, 0] },     // 2: Features (79 -> 25 transformation)
  { camOffset: [0, 2.5, 7.6], targetOffset: [0, 0, 0] },       // 3: Windows (temporal sequence overview)
  { camOffset: [0.4, 4.2, 8.6], targetOffset: [0, 0.5, 0] },   // 4: Graph (network topology)
  { camOffset: [0, 2.8, 8.0], targetOffset: [0, 0.2, 0] },     // 5: GraphSAGE (message passing)
  { camOffset: [0, 2.4, 7.8], targetOffset: [0, 0.1, 0] },     // 6: LSTM (recurrent memory chain)
  { camOffset: [0.5, 2.8, 8.2], targetOffset: [0.3, 0.2, 0] }, // 7: World Model (forecast trajectories)
  { camOffset: [0, 2.5, 7.8], targetOffset: [0, 0.1, 0] },     // 8: MITRE (threat classification)
]

export default function Scene({ pipeline }) {
  const {
    stage, stageIndex, stages, goTo,
    playing, speed, setSelectedNode, setSelectedFeature,
    cameraResetToken, cameraMode, setCameraMode, stageProgress
  } = pipeline

  const controlsRef = useRef()
  const { camera } = useThree()
  const isInteracting = useRef(false)

  // Vectors for smooth cinematic camera interpolation
  const targetCamPos = useRef(new THREE.Vector3())
  const targetLookAt = useRef(new THREE.Vector3())

  // Update target coordinates when stage changes
  useEffect(() => {
    const [sx, sy, sz] = stagePosition(stageIndex, stages.length)
    const config = STAGE_CAMERA_CONFIGS[stageIndex] || STAGE_CAMERA_CONFIGS[0]

    targetCamPos.current.set(
      sx + config.camOffset[0],
      sy + config.camOffset[1],
      sz + config.camOffset[2]
    )

    targetLookAt.current.set(
      sx + config.targetOffset[0],
      sy + config.targetOffset[1],
      sz + config.targetOffset[2]
    )
  }, [stageIndex, stages.length])

  // Reset camera token trigger
  useEffect(() => {
    if (cameraResetToken === 0) return
    const [sx, sy, sz] = stagePosition(stageIndex, stages.length)
    const config = STAGE_CAMERA_CONFIGS[stageIndex] || STAGE_CAMERA_CONFIGS[0]
    camera.position.set(sx + config.camOffset[0], sy + config.camOffset[1], sz + config.camOffset[2])
    if (controlsRef.current) {
      controlsRef.current.target.set(sx + config.targetOffset[0], sy + config.targetOffset[1], sz + config.targetOffset[2])
    }
  }, [cameraResetToken, stageIndex, stages.length, camera])

  // Smooth cinematic camera gliding
  useFrame(() => {
    if (!controlsRef.current) return

    if (cameraMode === 'AUTO' && !isInteracting.current) {
      // Smoothly interpolate lookAt target
      controlsRef.current.target.lerp(targetLookAt.current, 0.05)
      // Smoothly interpolate camera position
      camera.position.lerp(targetCamPos.current, 0.045)
      controlsRef.current.update()
    }
  })

  const ActiveComponent = STAGE_COMPONENTS[stage.key]
  const currentStagePos = stagePosition(stageIndex, stages.length)

  return (
    <>
      <color attach="background" args={['#04070d']} />
      <fog attach="fog" args={['#04070d', 16, 36]} />

      {/* Balanced, realistic cybersecurity lighting */}
      <ambientLight intensity={0.45} />
      <directionalLight position={[8, 12, 8]} intensity={0.8} color="#e0edff" />
      <directionalLight position={[-8, 6, -4]} intensity={0.3} color="#38bdf8" />
      <pointLight position={[currentStagePos[0], currentStagePos[1] + 3, currentStagePos[2] + 4]} intensity={0.8} color={stage.color} distance={14} />

      <Stars radius={70} depth={35} count={1400} factor={2.2} fade speed={0.3} />

      {/* Ground Tactical Cyber Grid */}
      <Grid
        position={[0, -2.6, 0]}
        args={[70, 70]}
        cellColor="#0e1a2b"
        sectionColor="#193354"
        cellThickness={0.8}
        sectionThickness={1.4}
        fadeDistance={34}
        infiniteGrid
      />

      {/* Pipeline 3D Arc and Stages */}
      <PipelinePath stages={stages} stageIndex={stageIndex} onSelect={goTo} playing={playing} speed={speed} />

      {/* Active Stage Ground Pedestal Beacon */}
      <ActiveStageBeacon position={currentStagePos} color={stage.color} />

      {/* Active Stage 3D Models */}
      <group position={currentStagePos}>
        {ActiveComponent && (
          <ActiveComponent
            playing={playing}
            speed={speed}
            stageProgress={stageProgress}
            onSelectNode={setSelectedNode}
            onSelectFeature={setSelectedFeature}
          />
        )}
      </group>

      {/* Interactive Orbit Controls with smooth damping */}
      <OrbitControls
        ref={controlsRef}
        enablePan
        enableZoom
        enableRotate
        minDistance={2.5}
        maxDistance={28}
        maxPolarAngle={Math.PI * 0.85}
        dampingFactor={0.06}
        onStart={() => {
          isInteracting.current = true
        }}
        onEnd={() => {
          // Keep in user free orbit until auto reset or stage transition
          setTimeout(() => {
            isInteracting.current = false
          }, 1200)
        }}
      />
    </>
  )
}

// Glowing ground beacon highlighting the active pipeline stage
function ActiveStageBeacon({ position, color }) {
  const ringRef = useRef()

  useFrame((_, delta) => {
    if (ringRef.current) {
      ringRef.current.rotation.z += delta * 0.8
    }
  })

  return (
    <group position={[position[0], -2.55, position[2]]} rotation={[-Math.PI / 2, 0, 0]}>
      {/* Outer Pulse Ring */}
      <mesh ref={ringRef}>
        <ringGeometry args={[1.1, 1.25, 32]} />
        <meshBasicMaterial color={color} transparent opacity={0.4} />
      </mesh>
      {/* Inner illuminated disc */}
      <mesh position={[0, 0, -0.01]}>
        <circleGeometry args={[1.0, 32]} />
        <meshBasicMaterial color={color} transparent opacity={0.12} />
      </mesh>
    </group>
  )
}
