/***
 * Landing page for Latency Topology Visualizer application.
 * Hosts the 3D globe canvas and the control side panel for filters and layers.
 * Composes feature components and wires initial store hydration.
***/
import dynamic from "next/dynamic";
import { Suspense } from "react";
import "./globals.css";

const GlobeScene = dynamic(() => import("@/_components/GlobeScene"), { ssr: false });
const ControlPanel = dynamic(() => import("@/_components/ControlPanel"), { ssr: false });
const Legend = dynamic(() => import("@/_components/Legend"), { ssr: false });

export default function Home() {
  return (
    <div className="min-h-dvh w-full grid grid-cols-1 lg:grid-cols-[1fr_360px]">
      <main className="relative h-[60dvh] lg:h-dvh">
        <Suspense fallback={<div className="absolute inset-0 grid place-items-center">Loading globe...</div>}>
          <GlobeScene />
        </Suspense>
        <div className="absolute left-4 bottom-4 right-4 lg:left-6 lg:right-auto">
          <Legend />
        </div>
      </main>
      <aside className="panel p-4 lg:p-6">
        <h1 className="text-xl font-semibold mb-3">Latency Topology Visualizer.</h1>
        <p className="text-sm text-[var(--muted)] mb-4">Explore exchange locations, cloud regions, and real-time latencies.</p>
        <Suspense fallback={<div>Loading controls...</div>}>
          <ControlPanel />
        </Suspense>
      </aside>
    </div>
  );
}
