export default function ControlsBar({ pipeline }) {
  const {
    playing, setPlaying,
    autoPlay, setAutoPlay,
    speed, setSpeed,
    next, prev, reset, resetCamera,
    cameraMode, toggleCameraMode,
    stageIndex, stages,
  } = pipeline

  return (
    <div className="controls-bar">
      {/* Prev Stage */}
      <button className="ctrl-btn" onClick={prev} aria-label="Previous stage">
        ◀ Prev
      </button>

      {/* Play / Pause Toggle */}
      <button
        className={'ctrl-btn primary' + (playing ? ' active' : '')}
        onClick={() => setPlaying((p) => !p)}
        aria-label={playing ? 'Pause animation' : 'Start animation'}
      >
        {playing ? '⏸ Pause' : '▶ Play'}
      </button>

      {/* Next Stage */}
      <button className="ctrl-btn" onClick={next} aria-label="Next stage">
        Next ▶
      </button>

      <div className="ctrl-sep" />

      {/* Auto Simulation Progression Toggle */}
      <button
        className={'ctrl-btn' + (autoPlay ? ' active auto-active' : '')}
        onClick={() => setAutoPlay((a) => !a)}
        aria-label="Toggle auto simulation progression"
        title={autoPlay ? 'Auto Simulation Active (Advances every 4s)' : 'Auto Simulation Paused'}
      >
        <span className="auto-dot" />
        {autoPlay ? 'Auto Sim: ON' : 'Auto Sim: OFF'}
      </button>

      {/* Speed Selector */}
      <div className="speed-group" role="group" aria-label="Simulation speed">
        {[0.5, 1, 2].map((s) => (
          <button
            key={s}
            className={'speed-btn' + (speed === s ? ' active' : '')}
            onClick={() => setSpeed(s)}
          >
            {s}x
          </button>
        ))}
      </div>

      <div className="ctrl-sep" />

      {/* Camera Mode Toggle (Auto Tracking vs Free) */}
      <button 
        className={'ctrl-btn' + (cameraMode === 'AUTO' ? ' active' : '')} 
        onClick={toggleCameraMode} 
        aria-label="Toggle camera mode"
        title={cameraMode === 'AUTO' ? 'Cinematic Auto-Tracking Active' : 'Free Camera Orbit Active'}
      >
        🎥 {cameraMode === 'AUTO' ? 'Camera: Auto' : 'Camera: Free'}
      </button>

      <button className="ctrl-btn" onClick={resetCamera} aria-label="Reset camera">
        ⟲ Reset Cam
      </button>

      <button className="ctrl-btn" onClick={reset} aria-label="Reset simulation">
        ⟲ Reset Sim
      </button>
    </div>
  )
}
