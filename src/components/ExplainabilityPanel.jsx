import { useMemo, useState } from 'react'
import { generateDemoSaliency, TEMPORAL_WINDOW_COUNT } from '../data/demoData.js'

const shades = ['░', '░', '▒', '▒', '▓', '▓', '█']
function shadeFor(v) {
  const idx = Math.min(shades.length - 1, Math.floor(v * shades.length))
  return shades[idx]
}

export default function ExplainabilityPanel() {
  const data = useMemo(() => generateDemoSaliency().slice(0, 8), [])
  const [open, setOpen] = useState(false)

  return (
    <div
      style={{
        position: 'absolute',
        left: 20,
        bottom: 100,
        zIndex: 16,
        background: 'rgba(10,14,22,0.86)',
        border: '1px solid rgba(120,170,255,0.18)',
        borderRadius: 8,
        padding: '12px 14px',
        fontSize: '0.7rem',
        maxWidth: 360,
        backdropFilter: 'blur(6px)',
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <strong style={{ letterSpacing: '0.05em' }}>SALIENCY (illustrative)</strong>
        <button
          onClick={() => setOpen((o) => !o)}
          style={{
            background: 'transparent',
            border: '1px solid rgba(120,170,255,0.3)',
            color: '#8b97ac',
            borderRadius: 4,
            fontSize: '0.62rem',
            padding: '2px 6px',
          }}
        >
          {open ? 'Hide' : 'Show'}
        </button>
      </div>
      {open && (
        <div style={{ marginTop: 8, fontFamily: 'monospace', overflowX: 'auto' }}>
          <div style={{ color: '#8b97ac', marginBottom: 4 }}>
            {'          '}
            {Array.from({ length: TEMPORAL_WINDOW_COUNT }, (_, i) => `W${i + 1}`).join(' ')}
          </div>
          {data.map((row) => (
            <div key={row.feature} style={{ whiteSpace: 'nowrap', color: '#dfe7f5' }}>
              <span style={{ color: '#8b97ac', display: 'inline-block', width: 110 }}>
                {row.feature.slice(0, 14).padEnd(14, ' ')}
              </span>
              {row.values.map((v, i) => (
                <span key={i} style={{ color: v > 0.6 ? '#fb923c' : '#38bdf8', marginRight: 3 }}>
                  {shadeFor(v)}
                </span>
              ))}
            </div>
          ))}
          <div style={{ marginTop: 6, color: '#6d7890', fontStyle: 'italic' }}>
            Demo visualization — values are illustrative.
          </div>
        </div>
      )}
    </div>
  )
}
