// Service layer for connecting NeuroShield's FastAPI backend.
//
// In DEMO mode (default), none of these functions are called — the UI reads
// static illustrative data from src/data/demoData.js instead.
//
// To connect a real backend:
//   1. Set BASE_URL below (or read it from an environment variable).
//   2. Implement each endpoint on your FastAPI service to return JSON in the
//      shape documented above each function.
//   3. Flip the "REAL DATA MODE" toggle in the UI — see src/hooks/usePipeline.js.

const BASE_URL = import.meta.env.VITE_NEUROSHIELD_API_URL || 'http://localhost:8000'

async function getJSON(path) {
  const res = await fetch(`${BASE_URL}${path}`)
  if (!res.ok) throw new Error(`NeuroShield API error: ${res.status} ${path}`)
  return res.json()
}

// GET /windows/latest -> { windows: [{ id, start, end, features: {...} }, ...] }
export function fetchLatestWindows() {
  return getJSON('/windows/latest')
}

// GET /graph/latest -> { nodes: [{id, label, ...}], edges: [{source, target}] }
export function fetchLatestGraph() {
  return getJSON('/graph/latest')
}

// GET /predict/latest -> { attackProbability: number, futureStates: [...], mitreStage: string }
export function fetchLatestPrediction() {
  return getJSON('/predict/latest')
}

// GET /explain/latest -> { features: [{ feature, values: number[] }] }
export function fetchLatestSaliency() {
  return getJSON('/explain/latest')
}

export const api = {
  fetchLatestWindows,
  fetchLatestGraph,
  fetchLatestPrediction,
  fetchLatestSaliency,
}
