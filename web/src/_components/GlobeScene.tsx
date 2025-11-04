/***
 * 3D globe scene rendering exchanges, regions, and latency arcs.
 * Uses react-globe.gl under Next dynamic import with client-only rendering.
 * Consumes Zustand store for data and filter state.
***/
"use client";

import Globe, { type GlobeMethods } from "react-globe.gl";
import { useEffect, useMemo, useRef } from "react";
import { useAppStore, useVisualArcs, exchanges, cloudRegions } from "@/_state/store";
import { providerColor } from "@/_lib/ui";
import type { VisualArc } from "@/_lib/latency";

type Label={ lat:number; lng:number; label:string; color:string; size:number };

export default function GlobeScene(){
  const globeRef=useRef<GlobeMethods | undefined>(undefined);
  const arcs=useVisualArcs();
  const showRegions=useAppStore(s=>s.showRegions);
  const showRealtime=useAppStore(s=>s.showRealtime);
  const regenMock=useAppStore(s=>s.regenMock);
  const setSelectedArc=useAppStore(s=>s.setSelectedArc);
  const focus=useAppStore(s=>s.focus);
  const providers=useAppStore(s=>s.providers);

  useEffect(()=>{ regenMock(); },[regenMock]);
  useEffect(()=>{
    if(!focus) return; try{globeRef.current?.pointOfView({lat:focus.lat, lng:focus.lon, altitude:1.8}, 1000);}catch{}
  },[focus]);

  const exchangeLabels=useMemo(()=>exchanges
    .filter(x=>providers.has(x.provider))
    .map(x=>({ lat:x.lat, lng:x.lon, label:`${x.name} (${x.code})`, color:providerColor(x.provider), size:1.25 })),[providers]);

  const regionLabels=useMemo(()=>cloudRegions
    .filter(r=>providers.has(r.provider))
    .map(r=>({ lat:r.lat, lng:r.lon, label:`${r.provider.toUpperCase()} ${r.code}`, color:providerColor(r.provider), size:1 })),[providers]);

  return (
    <Globe
      ref={globeRef}
      backgroundColor={"rgba(0,0,0,0)"}
      globeImageUrl="//unpkg.com/three-globe/example/img/earth-dark.jpg"
      bumpImageUrl="//unpkg.com/three-globe/example/img/earth-topology.png"
      width={undefined}
      height={undefined}
      waitForGlobeReady
      animateIn
      rendererConfig={{ antialias:true, alpha:true }}
      arcsData={showRealtime?arcs:[]}
      arcColor={(d:unknown)=> (d as VisualArc).arcColor?.()}
      arcAltitude={(d:unknown)=> (d as VisualArc).arcAltitude?.()}
      arcDashLength={(d:unknown)=> (d as VisualArc).arcDashLength}
      arcDashGap={(d:unknown)=> (d as VisualArc).arcDashGap}
      arcDashAnimateTime={(d:unknown)=> (d as VisualArc).arcDashAnimateTime}
      labelsData={[...exchangeLabels, ...(showRegions?regionLabels:[])]}
      labelText={(d:unknown)=> (d as Label).label}
      labelColor={(d:unknown)=> (d as Label).color}
      labelSize={(d:unknown)=> (d as Label).size}
      labelDotRadius={0.3}
      atmosphereColor="rgba(34,211,238,0.6)"
      atmosphereAltitude={0.2}
      ringsData={showRegions?regionLabels:[]}
      ringColor={(d:unknown)=> (d as Label).color}
      ringMaxRadius={2}
      ringPropagationSpeed={1.5}
      ringRepeatPeriod={1200}
      onGlobeReady={()=>{
        try{globeRef.current?.pointOfView({lat:20, lng:10, altitude:2.5}, 1500);}catch{}
      }}
      onArcClick={(a:unknown)=>{
        const id=(a as {id?:string}).id; setSelectedArc(id);
      }}
    />
  );
}
