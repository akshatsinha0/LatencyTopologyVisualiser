/***
 * Small overlay showing selected connection details.
 * Reads selectedArcId from the store and renders min info.
 * Provides manual refresh action to fetch live ping again.
***/
"use client";
import { useAppStore } from "@/_state/store";

export default function ArcDetails(){
  const selectedId=useAppStore(s=>s.selectedArcId);
  const arc=useAppStore(s=>s.arcs.find(a=>a.id===s.selectedArcId));
  const probe=useAppStore(s=>s.probeReal);
  if(!selectedId||!arc) return null;
  return (
    <div className="panel p-2 text-xs absolute top-4 left-4">
      <div className="font-semibold mb-1">Connection.</div>
      <div>{arc.from.label} → {arc.to.label}.</div>
      <div className="mt-1">Latency: {arc.latencyMs} ms.</div>
      <button className="mt-2 px-2 py-1 rounded border border-white/10" onClick={probe}>Refresh now.</button>
    </div>
  );
}
