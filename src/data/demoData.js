// All values in this file are DEMO / ILLUSTRATIVE unless replaced by a real
// NeuroShield backend via src/api/neuroshieldApi.js. Nothing here should be
// presented to a viewer as an actual measurement or model output.

export const STAGES = [
  {
    id: 0,
    key: 'traffic',
    code: '01',
    name: 'RAW TRAFFIC',
    short: 'Traffic',
    input: 'Live network flow records (CIC-IDS2017-style flow telemetry)',
    process: 'Flows arrive continuously from many source/destination IP pairs',
    output: 'Raw flow record stream',
    purpose:
      'Represent the unprocessed network telemetry NeuroShield observes before any transformation.',
    color: '#38bdf8',
  },
  {
    id: 1,
    key: 'cleaning',
    code: '01b',
    name: 'CLEANING & NORMALIZATION',
    short: 'Clean & Norm',
    input: 'Raw flow records (with noise, duplicates, and corrupt trailing rows)',
    process: 'Validation, pruning corrupted records, deduplication, and feature normalization',
    output: 'Cleaned, normalized, and structured flow telemetry',
    purpose: 'Ensure data consistency and numerical stability before feature reduction.',
    color: '#67e8f9',
  },
  {
    id: 2,
    key: 'features',
    code: '02',
    name: 'FEATURE ENGINEERING',
    short: 'Features',
    input: '79 CICFlowMeter features',
    process: 'Cleaning + behavioral feature engineering',
    output: '25 behavioral features',
    purpose:
      'Reduce raw flow telemetry into a compact representation of network behavior.',
    color: '#22d3ee',
  },
  {
    id: 3,
    key: 'windows',
    code: '03',
    name: 'TEMPORAL WINDOWS',
    short: 'Windows',
    input: '25 behavioral features per flow, grouped by Source IP',
    process: 'Aggregation into 30-second non-overlapping windows using SUM / MEAN / MAX / NUNIQUE',
    output: '30-second behavioral state per Source IP',
    purpose: 'Compress many individual flows into a compact per-window behavioral snapshot.',
    color: '#818cf8',
  },
  {
    id: 4,
    key: 'graph',
    code: '04',
    name: 'COMMUNICATION GRAPH',
    short: 'Graph',
    input: 'Source IP → Destination IP communication within a window',
    process: 'Construction of a dynamic communication graph (~20 nodes shown)',
    output: 'Graph structure (nodes = IPs, edges = communication)',
    purpose: 'Represent network communication structure, not just isolated flow statistics.',
    color: '#a78bfa',
  },
  {
    id: 5,
    key: 'graphsage',
    code: '05',
    name: 'GRAPHSAGE',
    short: 'GraphSAGE',
    input: 'Communication graph + node features',
    process: 'Neighborhood aggregation and message passing across graph neighborhoods',
    output: 'Learned graph representation (embedding)',
    purpose: 'Learn node/graph representations that incorporate neighborhood communication context.',
    color: '#c084fc',
  },
  {
    id: 6,
    key: 'lstm',
    code: '06',
    name: 'LSTM',
    short: 'LSTM',
    input: '10 consecutive graph embeddings (10 × 30s = 5-minute history)',
    process: 'Sequential processing across the temporal window sequence',
    output: 'Learned temporal state',
    purpose: 'Model how network behavior evolves over the preceding 5 minutes.',
    color: '#f472b6',
  },
  {
    id: 7,
    key: 'worldmodel',
    code: '07',
    name: 'WORLD MODEL',
    short: 'World Model',
    input: 'Temporal state from LSTM',
    process: 'Projection from historical state toward future behavioral states (+30s … +300s)',
    output: 'Predicted future behavioral state + attack probability',
    purpose: 'Forecast likely future network behavior rather than only reacting after the fact.',
    color: '#fb923c',
  },
  {
    id: 8,
    key: 'mitre',
    code: '08',
    name: 'MITRE ATT&CK',
    short: 'MITRE',
    input: 'Predicted future state + attack probability',
    process: 'Mapping predicted behavior onto attack-stage intelligence',
    output: 'Attack-stage estimate for SOC decision support',
    purpose: 'Translate a numeric prediction into an actionable, analyst-readable attack stage.',
    color: '#f87171',
  },
]

export const FEATURE_GROUPS = [
  { name: 'Traffic Volume', count: 4, color: '#38bdf8' },
  { name: 'Packet Behavior', count: 5, color: '#22d3ee' },
  { name: 'Timing', count: 5, color: '#818cf8' },
  { name: 'TCP Flag Behavior', count: 5, color: '#c084fc' },
  { name: 'Rate & Diversity', count: 6, color: '#f472b6' },
]

// Generic placeholder names — NOT confirmed exact schema names.
// Replace with real feature names once the NeuroShield schema is loaded.
export const DEMO_FEATURE_NAMES = {
  'Traffic Volume': ['Total Packets', 'Total Bytes', 'Forward Traffic', 'Backward Traffic'],
  'Packet Behavior': [
    'Packet Size Mean',
    'Packet Size Std',
    'Packet Size Max',
    'Packet Size Min',
    'Packet Count Ratio',
  ],
  Timing: ['Flow Duration', 'IAT Mean', 'IAT Std', 'IAT Max', 'IAT Min'],
  'TCP Flag Behavior': ['SYN Count', 'ACK Count', 'FIN Count', 'RST Count', 'PSH Count'],
  'Rate & Diversity': [
    'Packet Rate',
    'Byte Rate',
    'Dst Port Diversity',
    'Dst IP Diversity',
    'Protocol Diversity',
    'Flow Rate',
  ],
}

export const AGGREGATIONS = ['SUM', 'MEAN', 'MAX', 'NUNIQUE']

export const TEMPORAL_WINDOW_COUNT = 10
export const TEMPORAL_WINDOW_SECONDS = 30
export const TEMPORAL_CONTEXT_SECONDS = TEMPORAL_WINDOW_COUNT * TEMPORAL_WINDOW_SECONDS

export const FUTURE_HORIZONS = [30, 60, 90, 120, 180, 240, 300]

export const GRAPH_NODE_COUNT = 20

// Deterministic pseudo-random demo graph so it looks the same on every load.
export function generateDemoGraph(nodeCount = GRAPH_NODE_COUNT) {
  const nodes = []
  for (let i = 0; i < nodeCount; i++) {
    const angle = (i / nodeCount) * Math.PI * 2
    const radius = 3.2 + (i % 3) * 0.6
    nodes.push({
      id: i,
      label: `10.0.${i}.${(i * 7) % 250}`,
      x: Math.cos(angle) * radius,
      z: Math.sin(angle) * radius,
      y: (Math.sin(i * 1.7) * 0.6),
      suspicious: i % 6 === 0,
    })
  }
  const edges = []
  for (let i = 0; i < nodeCount; i++) {
    const targets = 1 + (i % 3)
    for (let t = 1; t <= targets; t++) {
      const j = (i + t * 3 + 1) % nodeCount
      if (j !== i) edges.push({ source: i, target: j, suspicious: (i + t) % 7 === 0 })
    }
  }
  return { nodes, edges }
}

// Illustrative saliency matrix: 25 features × 10 windows, values 0..1
export function generateDemoSaliency() {
  const allFeatures = Object.values(DEMO_FEATURE_NAMES).flat()
  return allFeatures.map((name, fi) => ({
    feature: name,
    values: Array.from({ length: TEMPORAL_WINDOW_COUNT }, (_, wi) => {
      const base = Math.abs(Math.sin(fi * 0.7 + wi * 0.5))
      return Math.round(base * 100) / 100
    }),
  }))
}

export const DEMO_ATTACK_PROBABILITY = 0.73

export const DEMO_MITRE_STAGES = [
  'Reconnaissance',
  'Initial Access',
  'Execution',
  'Command & Control',
  'Exfiltration',
]

export const DEMO_MITRE_PREDICTED_STAGE = 'Command & Control'
