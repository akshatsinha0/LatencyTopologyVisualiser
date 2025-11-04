# Latency Topology Visualizer

A Next.js application that renders a 3D world map of cryptocurrency exchange servers, cloud provider regions, and real‑time/historical network latency between them.

## What you can do
- Explore an interactive 3D globe with smooth zoom, rotate, and pan.
- See exchange locations and cloud regions with provider‑specific colors and a legend.
- Watch animated latency connections that refresh about every 10 seconds.
- View latency history (min, avg, max) with 1h/24h/7d/30d ranges.
- Filter by provider (AWS/GCP/Azure), exchanges, and a max latency threshold.
- Search by exchange name/code or region code to focus the globe.
- Toggle layers: regions, realtime, historical, heatmap.
- See quick status metrics (avg latency, last update, FPS).
- Export a JSON latency report or a PNG snapshot image.
- Switch between dark and light themes.

## How it meets the assignment
- 3D world map: implemented with `react-globe.gl` (Three.js under the hood).
- Exchange markers and region markers: plotted with labels and provider colors; legend included.
- Realtime latency: arcs animate and refresh; a server route calls Globalping to fetch ping medians (with a safe mock fallback when needed).
- Historical trends: time‑series chart shows ranges with min/avg/max; clicking an arc selects its history.
- Cloud regions: AWS/GCP/Azure regions are visualized with labels and pulsing rings; provider filters and region counts are provided.
- Controls and metrics: filters, search, layer toggles, performance metrics, and export tools are present.
- Responsive and mobile friendly: layout adapts and rendering is tuned for smaller screens.
- Bonus features: heatmap overlay, theme toggle, export JSON/image.

## Assumptions
- Exchange and region coordinates are seed data for demo purposes.
- Realtime latency uses Globalping as a free public API. If the API rate limits or schema changes, the app falls back to a safe mock so the demo continues to work.
- Historical samples are kept in memory during a session and are not stored on a server.

## Project layout
- `web/` – Next.js app.
  - `src/_components/` – UI elements (GlobeScene, ControlPanel, Legend, LatencyChart, ThemeToggle, RegionSummary).
  - `src/_data/` – Seed datasets for exchanges and cloud regions.
  - `src/_lib/` – Utilities (geo math, latency mapping, UI color helpers, perf).
  - `src/_state/` – Zustand store and selectors for filters, data, and polling.
  - `src/app/api/ping/` – Server route proxying Globalping for latency samples.
  - `src/app/` – App Router pages and global styles.

## Run locally
1. Install Node 18+ (or 20+ recommended).
2. From the repo root:
   - `cd web`
   - `npm ci`
   - `npm run dev`
3. Open http://localhost:3000.

## Build
- `npm run build` to create a production build.
- `npm start` to run the production server.

## Quality checks
- `npm run lint` to run ESLint.
- `npm run typecheck` to run TypeScript checks.

## Using the app (quick guide)
- Providers: check or uncheck AWS/GCP/Azure.
- Exchanges: select individual exchanges; a clear list is provided.
- Latency threshold: drag the slider to hide higher latency arcs.
- Search: type an exchange name/code or region code, press Enter or click Go.
- Layers: toggle Regions, Realtime, Historical, and Heatmap.
- History: click an arc on the globe; the chart will update.
- Exports: use Export report (JSON) or Export image (PNG).
- Theme: click the theme toggle to switch between dark and light.

## Data sources and libraries
- 3D globe: `react-globe.gl` (Three.js).
- Charts: `recharts`.
- State: `zustand`.
- Types: TypeScript.
- Realtime pings: `api.globalping.io` via the Next.js API route.

## Notes
- The demo avoids paid services and runs without credentials.
- If the realtime probe fails, the app continues with generated latencies so the visualization is never blank.
- All custom feature directories use the underscore prefix for clarity and grouping.

## Submission
- Repo URL: https://github.com/akshatsinha0/LatencyTopologyVisualiser (branch `feat/ltv-core`).
- To create a short video: screen‑record the app while showing the globe interactions, filters, history chart, heatmap, exports, and a glance at the code folders noted above.
