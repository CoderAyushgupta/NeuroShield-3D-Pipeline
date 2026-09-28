export default function InfoPanel({ pipeline }) {
  const { stage, dataMode } = pipeline
  return (
    <div className="info-panel">
      <div className="code">{stage.code}</div>
      <h2>{stage.name}</h2>

      <div className="info-row">
        <div className="label">Input</div>
        <div className="value">{stage.input}</div>
      </div>
      <div className="info-row">
        <div className="label">Process</div>
        <div className="value">{stage.process}</div>
      </div>
      <div className="info-row">
        <div className="label">Output</div>
        <div className="value">{stage.output}</div>
      </div>
      <div className="info-row">
        <div className="label">Why?</div>
        <div className="value">{stage.purpose}</div>
      </div>

      {dataMode === 'DEMO' && (
        <div className="demo-badge">Demo visualization — values are illustrative</div>
      )}
    </div>
  )
}
