import { useState } from 'react'
import { Canvas } from '@react-three/fiber'
import { usePipeline } from './hooks/usePipeline.js'
import Scene from './components/Scene.jsx'
import TopBar from './components/TopBar.jsx'
import InfoPanel from './components/InfoPanel.jsx'
import ControlsBar from './components/ControlsBar.jsx'
import DetailPanel from './components/DetailPanel.jsx'
import ExplainabilityPanel from './components/ExplainabilityPanel.jsx'

export default function App() {
  // Directly entered by default for automated presentation inside dashboard
  const [entered, setEntered] = useState(true)
  const pipeline = usePipeline()

  return (
    <div className="app-root">
      {!entered && (
        <div className="landing">
          <div className="landing-grid" />
          <h1>NEUROSHIELD</h1>
          <div className="subtitle">AI-Driven Network Behavior Model</div>
          <div className="tagline">
            From network telemetry to future attack intelligence — an interactive
            walkthrough of the full detection-to-prediction pipeline.
          </div>
          <button className="enter-btn" onClick={() => setEntered(true)}>
            ENTER PIPELINE
          </button>
        </div>
      )}

      {entered && (
        <>
          <Canvas
            camera={{ position: [-11, 3.2, 8.6], fov: 48 }}
            gl={{ antialias: true, alpha: false, powerPreference: 'high-performance' }}
            dpr={[1, 1.5]}
          >
            <Scene pipeline={pipeline} />
          </Canvas>

          <TopBar pipeline={pipeline} />
          
          <div className="stage-title-banner">
            <div className="banner-tag">STAGE {pipeline.stage.code.replace('b', '')} • {pipeline.stage.short.toUpperCase()}</div>
            <div className="big">{pipeline.stage.name}</div>
          </div>

          <InfoPanel pipeline={pipeline} />
          <DetailPanel pipeline={pipeline} />
          {pipeline.stage.key === 'worldmodel' && <ExplainabilityPanel />}
          <ControlsBar pipeline={pipeline} />
        </>
      )}
    </div>
  )
}
