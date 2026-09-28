# NeuroShield — 3D Pipeline Explorer

An interactive 3D visualization of the NeuroShield AI network-intrusion
detection and attack-forecasting pipeline, built with React, Vite, Three.js,
and React Three Fiber.

> **Note on data:** everything you see in this app is running in **DEMO
> MODE** by default. All numeric values (attack probability, saliency
> scores, graph traffic figures) are synthetic and clearly labeled
> "illustrative" — they are not real model output. See
> [Connecting a real backend](#connecting-a-real-neuroshield-backend) below.

---

## Features

- Full 3D scene you can **rotate, zoom, and pan** (mouse / touch)
- 9 interactive pipeline stages laid out along a 3D path:
  1. Raw Traffic
  2. Data Cleaning
  3. Feature Engineering (79 → 25 features)
  4. 30-second Temporal Windows (10 × 30s = 5-minute history)
  5. Dynamic Communication Graph (Source IP → Destination IP)
  6. GraphSAGE (neighborhood aggregation)
  7. LSTM (temporal sequence modeling)
  8. World Model (future-state prediction, attack probability)
  9. MITRE ATT&CK stage mapping
- Click any stage marker to jump directly to it
- Click graph nodes and feature nodes for demo detail panels
- Illustrative saliency matrix (25 features × 10 windows)
- Playback controls: Start / Pause / Reset / Prev / Next / Auto Play / Speed (0.5x–2x) / Camera Reset
- DEMO MODE / REAL DATA MODE toggle (REAL DATA MODE is a UI placeholder — see below)
- Dark, restrained cybersecurity-research visual style
- Reduced-motion support, keyboard-operable controls

## Architecture

```
src/
├── api/
│   └── neuroshieldApi.js     # Service layer stubs for a FastAPI backend
├── components/
│   ├── Scene.jsx              # Canvas contents: lighting, camera, stage switch
│   ├── PipelinePath.jsx       # 3D arc of the 9 stage markers
│   ├── TrafficStage.jsx
│   ├── CleaningStage.jsx
│   ├── FeatureStage.jsx
│   ├── WindowStage.jsx
│   ├── GraphStage.jsx
│   ├── GraphSAGEStage.jsx
│   ├── LSTMStage.jsx
│   ├── WorldModelStage.jsx
│   ├── MitreStage.jsx
│   ├── TopBar.jsx / InfoPanel.jsx / DetailPanel.jsx / ControlsBar.jsx
│   └── ExplainabilityPanel.jsx
├── data/
│   └── demoData.js            # All illustrative/demo data lives here, separate from rendering
├── hooks/
│   └── usePipeline.js         # Stage/playback/selection state
├── App.jsx
└── main.jsx
```

## Technology

- React 18
- Vite 5
- Three.js
- @react-three/fiber
- @react-three/drei

## Installation

Requires Node.js 18+.

```bash
npm install
```

## Running locally

```bash
npm run dev
```

Then open the printed local URL (typically `http://localhost:5173`).

## Build

```bash
npm run build
```

Output is written to `dist/`. Preview the production build with:

```bash
npm run preview
```

## Demo mode

By default the app runs entirely on the static, deterministic data in
`src/data/demoData.js` — no backend is required. Every place a synthetic
value is shown (attack probability, saliency, node traffic figures) is
labeled "demo" / "illustrative" in the UI. The known, confirmed project
facts baked into the demo (79 raw features, 25 behavioral features, 30s
windows, 10-window / 5-minute context, SUM/MEAN/MAX/NUNIQUE aggregation,
GraphSAGE + LSTM, future horizons +30s…+300s) come from the project brief;
anything not specified there (exact feature names, embedding dimensions,
layer counts, MITRE mapping rules) is presented with generic placeholder
labels rather than invented specifics.

## Connecting a real NeuroShield backend

The **REAL DATA MODE** toggle in the top bar is currently a UI placeholder —
flipping it does not yet fetch live data. To wire it up:

1. Stand up a FastAPI service exposing endpoints matching
   `src/api/neuroshieldApi.js`:
   - `GET /windows/latest`
   - `GET /graph/latest`
   - `GET /predict/latest`
   - `GET /explain/latest`
2. Set `VITE_NEUROSHIELD_API_URL` (e.g. in a `.env` file) to your backend's
   base URL.
3. In `src/hooks/usePipeline.js` / the relevant stage components, replace
   the static imports from `demoData.js` with calls to the functions
   exported from `neuroshieldApi.js` when `dataMode === 'REAL'`.
4. Update the "Demo visualization" labels in `InfoPanel.jsx` and
   `ExplainabilityPanel.jsx` to only show when still in demo mode (the
   scaffolding for this check — `dataMode` — is already threaded through
   `usePipeline`).

## Adding real NeuroShield data (schema, mapping, etc.)

- Exact 25-feature names: replace `DEMO_FEATURE_NAMES` in
  `src/data/demoData.js` with your real schema.
- MITRE mapping: replace `DEMO_MITRE_STAGES` / `DEMO_MITRE_PREDICTED_STAGE`
  with your actual mapping table once available.
- Saliency: replace `generateDemoSaliency()` with real per-feature,
  per-window importance scores from your explainability pipeline.

## Deployment (GitHub Pages)

1. Push this project to a GitHub repository.
2. In `vite.config.js`, set `base` to `'/<your-repo-name>/'` (it currently
   uses a relative `'./'`, which works for most static hosts including
   Pages, but an explicit repo-scoped base is more robust for project
   pages).
3. Push to the `main` branch — the included workflow at
   `.github/workflows/deploy.yml` will install dependencies, build, and
   deploy the `dist/` folder to GitHub Pages automatically.
4. Enable GitHub Pages for the repository under **Settings → Pages**,
   with the source set to **GitHub Actions**.

## Accessibility

- High-contrast text, readable typography
- Stage and playback controls are standard `<button>` elements with
  `aria-label`s and are keyboard-operable (Tab + Enter/Space)
- `prefers-reduced-motion` disables animation durations app-wide

## Performance notes

- Particle-heavy stages (Raw Traffic, Feature Engineering) use
  `instancedMesh` rather than individual meshes
- Node/edge counts are kept modest (≈20 graph nodes, ≤90 particles per
  stage) to stay smooth on a typical laptop
- `requestAnimationFrame`-driven animation is handled via R3F's
  `useFrame`, which is paused/resumed by the Start/Pause control

## Known limitations

- REAL DATA MODE is scaffolded but not yet wired to a live backend (see
  above)
- Exact feature names, GraphSAGE layer count, LSTM hidden size, embedding
  dimensionality, and the MITRE mapping rule are not asserted anywhere in
  this app, because they weren't confirmed in the project brief — only
  generic placeholders are shown for these
