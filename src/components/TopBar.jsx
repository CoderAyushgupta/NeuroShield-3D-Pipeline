export default function TopBar({ pipeline }) {
  const { stages, stageIndex, goTo, dataMode, setDataMode, autoPlay, stageProgress } = pipeline

  return (
    <div className="topbar">
      <div className="brand">
        <div className="brand-title">NEUROSHIELD 3D</div>
        <div className="brand-sub">SIH26153 • Spatiotemporal Threat Forecasting Simulation</div>
      </div>

      {/* Stage Progress Chips */}
      <div className="stage-tracker">
        {stages.map((s, i) => (
          <button
            key={s.key}
            className={'stage-chip' + (i === stageIndex ? ' active' : '')}
            onClick={() => goTo(i)}
            aria-label={`Jump to stage ${s.code} ${s.name}`}
          >
            <span className="stage-num">{i + 1}</span> {s.short}
          </button>
        ))}
      </div>

      {/* Auto Simulation Progress Indicator */}
      <div className="sim-status-widget">
        <div className="sim-status-text">
          <span className="sim-dot" style={{ background: autoPlay ? 'var(--cyan)' : 'var(--orange)' }} />
          <span>{autoPlay ? `STAGE ${stageIndex + 1}/9: AUTO ADVANCING` : 'MANUAL STAGE PAUSED'}</span>
        </div>
        {autoPlay && (
          <div className="stage-progress-bar-bg">
            <div 
              className="stage-progress-bar-fill" 
              style={{ width: `${Math.round(stageProgress * 100)}%` }} 
            />
          </div>
        )}
      </div>

      <div className="mode-toggle">
        <button
          className={dataMode === 'DEMO' ? 'active' : ''}
          onClick={() => setDataMode('DEMO')}
        >
          DEMO
        </button>
        <button
          className={dataMode === 'REAL' ? 'active' : ''}
          onClick={() => setDataMode('REAL')}
        >
          REAL
        </button>
      </div>
    </div>
  )
}
