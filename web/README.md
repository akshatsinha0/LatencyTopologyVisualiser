# Latency Topology Visualizer

Interactive 3D world map showing crypto exchange locations, cloud regions, and real-time/historical latency.

## Run locally

```bash
# from the repo root
cd web
npm ci
npm run dev
```

Open http://localhost:3000.

## Scripts
- `npm run dev` start dev server.
- `npm run build` production build.
- `npm run start` start production server.
- `npm run lint` lint sources.
- `npm run typecheck` TypeScript check.

## Tech
- Next.js App Router, React, TypeScript, Tailwind.
- react-globe.gl for 3D globe.
- Zustand for state, Recharts for charts.

## Data & realtime
- Static seeds for exchanges and cloud regions live in `src/_data`.
- Realtime demo uses `approxRttMs` and optional Globalping proxy at `GET/POST /api/ping`.

## Notes
- Custom feature folders are prefixed with `_` (e.g., `_components`, `_state`, `_lib`).
- Dark theme by default; mobile-optimized controls and touch gestures.
