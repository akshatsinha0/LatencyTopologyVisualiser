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
import { hexPointsFromArcs } from "@/_lib/latency";

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
  const showHeatmap=useAppStore(s=>s.showHeatmap);

  useEffect(()=>{ regenMock(); },[regenMock]);
  useEffect(()=>{
    if(!focus) return; try{globeRef.current?.pointOfView({lat:focus.lat, lng:focus.lon, altitude:1.8}, 1000);}catch{}
  },[focus]);

  const enabled=useAppStore(s=>s.exchangesEnabled);
  const exchangeLabels=useMemo(()=>exchanges
    .filter(x=>providers.has(x.provider))
    .filter(x=> enabled.size? enabled.has(x.id): true)
    .map(x=>({ lat:x.lat, lng:x.lon, label:`${x.name} (${x.code})`, color:providerColor(x.provider), size:1.25, kind:"exchange" as const, id:x.id })),[providers,enabled]);

  const regionLabels=useMemo(()=>cloudRegions
    .filter(r=>providers.has(r.provider))
    .map(r=>({ lat:r.lat, lng:r.lon, label:`${r.provider.toUpperCase()} ${r.code}`, color:providerColor(r.provider), size:1, kind:"region" as const, id:`${r.provider}-${r.code}` })),[providers]);

  const hexPoints=useMemo(()=>hexPointsFromArcs(arcs),[arcs]);

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
      arcStartLat={(d:unknown)=> (d as VisualArc).from.lat}
      arcStartLng={(d:unknown)=> (d as VisualArc).from.lon}
      arcEndLat={(d:unknown)=> (d as VisualArc).to.lat}
      arcEndLng={(d:unknown)=> (d as VisualArc).to.lon}
      arcColor={(d:unknown)=> (d as VisualArc).arcColor?.()}
      arcAltitude={(d:unknown)=> (d as VisualArc).arcAltitude?.()}
      arcDashLength={(d:unknown)=> (d as VisualArc).arcDashLength}
      arcDashGap={(d:unknown)=> (d as VisualArc).arcDashGap}
      arcDashAnimateTime={(d:unknown)=> (d as VisualArc).arcDashAnimateTime}
      arcStroke={(d:unknown)=> Math.max(0.5, Math.min(2, ((d as VisualArc).volume ?? 1)/300))}
      hexBinPointsData={showHeatmap? hexPoints: []}
      hexBinPointLat={(p:unknown)=> (p as {lat:number}).lat}
      hexBinPointLng={(p:unknown)=> (p as {lng:number}).lng}
      hexBinPointWeight={(p:unknown)=> (p as {weight:number}).weight}
      hexBinResolution={4}
      hexTopColor={()=>"#22d3ee"}
      hexSideColor={()=>"#155e75"}
      hexAltitude={(d:unknown)=> Math.min(0.25, ((d as { sumWeight?:number }).sumWeight ?? 50)/400)}
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
      onLabelClick={(l:unknown)=>{
        const m=l as {kind?:"exchange"|"region"; id?:string; lat:number; lng:number};
        if(m?.lat!=null && m?.lng!=null) { try{globeRef.current?.pointOfView({lat:m.lat, lng:m.lng, altitude:1.5}, 600);}catch{} }
      }}
    />
  );
}
