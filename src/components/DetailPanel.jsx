export default function DetailPanel({ pipeline }) {
  const { selectedNode, selectedFeature } = pipeline

  if (!selectedNode && !selectedFeature) return null

  if (selectedNode) {
    return (
      <div className="detail-panel">
        <h3>Node — {selectedNode.label}</h3>
        <div className="row"><span>Connections</span><span>{selectedNode.connections}</span></div>
        <div className="row"><span>Outgoing traffic</span><span>{selectedNode.outgoing} KB (demo)</span></div>
        <div className="row"><span>Incoming traffic</span><span>{selectedNode.incoming} KB (demo)</span></div>
        <div className="row"><span>Status</span><span>{selectedNode.suspicious ? 'Flagged (demo)' : 'Normal'}</span></div>
      </div>
    )
  }

  return (
    <div className="detail-panel">
      <h3>Feature — {selectedFeature.feature}</h3>
      <div className="row"><span>Influence</span><span>{selectedFeature.influence}</span></div>
      <div className="row"><span>Most influential windows</span><span>{selectedFeature.topWindows.join(', ')}</span></div>
    </div>
  )
}
