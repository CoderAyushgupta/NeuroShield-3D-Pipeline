import { useCallback, useEffect, useRef, useState } from 'react'
import { STAGES } from '../data/demoData.js'

// Configurable stage simulation duration in seconds (5s gives viewers time to absorb each stage)
export const SIMULATION_STAGE_DURATION = 5.0

export function usePipeline() {
  const [stageIndex, setStageIndex] = useState(0)
  const [playing, setPlaying] = useState(true)       // Auto-starts animation
  const [autoPlay, setAutoPlay] = useState(true)     // Auto-advances through stages
  const [speed, setSpeed] = useState(1)
  const [dataMode, setDataMode] = useState('DEMO')  // 'DEMO' | 'REAL'
  const [selectedNode, setSelectedNode] = useState(null)
  const [selectedFeature, setSelectedFeature] = useState(null)
  const [cameraResetToken, setCameraResetToken] = useState(0)
  const [cameraMode, setCameraMode] = useState('AUTO') // 'AUTO' (Cinematic Tracking) | 'FREE' (User Orbit)
  const [stageProgress, setStageProgress] = useState(0) // 0 to 1 progress within current stage

  const stageStartTimeRef = useRef(Date.now())
  const animationFrameRef = useRef(null)

  // Navigate to specific stage
  const goTo = useCallback((idx) => {
    const nextIdx = Math.max(0, Math.min(STAGES.length - 1, idx))
    setStageIndex(nextIdx)
    setStageProgress(0)
    stageStartTimeRef.current = Date.now()
    setSelectedNode(null)
    setSelectedFeature(null)
  }, [])

  const next = useCallback(() => {
    setStageIndex((i) => (i >= STAGES.length - 1 ? 0 : i + 1))
    setStageProgress(0)
    stageStartTimeRef.current = Date.now()
  }, [])

  const prev = useCallback(() => {
    setStageIndex((i) => (i <= 0 ? STAGES.length - 1 : i - 1))
    setStageProgress(0)
    stageStartTimeRef.current = Date.now()
  }, [])

  const reset = useCallback(() => {
    setStageIndex(0)
    setStageProgress(0)
    stageStartTimeRef.current = Date.now()
    setPlaying(true)
    setAutoPlay(true)
    setSelectedNode(null)
    setSelectedFeature(null)
    setCameraMode('AUTO')
    setCameraResetToken((t) => t + 1)
  }, [])

  const resetCamera = useCallback(() => {
    setCameraMode('AUTO')
    setCameraResetToken((t) => t + 1)
  }, [])

  const toggleCameraMode = useCallback(() => {
    setCameraMode((m) => (m === 'AUTO' ? 'FREE' : 'AUTO'))
  }, [])

  // Auto-simulation loop: smoothly advances through all 9 stages every SIMULATION_STAGE_DURATION seconds
  useEffect(() => {
    if (!autoPlay || !playing) {
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current)
      return
    }

    const stageDurationMs = (SIMULATION_STAGE_DURATION * 1000) / speed
    stageStartTimeRef.current = Date.now()

    const updateLoop = () => {
      const elapsed = Date.now() - stageStartTimeRef.current
      const progress = Math.min(1, elapsed / stageDurationMs)
      setStageProgress(progress)

      if (progress >= 1) {
        // Advance to next stage or smoothly loop back to Stage 0
        setStageIndex((curr) => {
          return curr >= STAGES.length - 1 ? 0 : curr + 1
        })
        setStageProgress(0)
        stageStartTimeRef.current = Date.now()
      }

      animationFrameRef.current = requestAnimationFrame(updateLoop)
    }

    animationFrameRef.current = requestAnimationFrame(updateLoop)

    return () => {
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current)
    }
  }, [autoPlay, playing, speed])

  return {
    stage: STAGES[stageIndex],
    stageIndex,
    stages: STAGES,
    goTo,
    next,
    prev,
    playing,
    setPlaying,
    autoPlay,
    setAutoPlay,
    speed,
    setSpeed,
    dataMode,
    setDataMode,
    reset,
    selectedNode,
    setSelectedNode,
    selectedFeature,
    setSelectedFeature,
    cameraResetToken,
    resetCamera,
    cameraMode,
    setCameraMode,
    toggleCameraMode,
    stageProgress,
    simulationDuration: SIMULATION_STAGE_DURATION,
  }
}
