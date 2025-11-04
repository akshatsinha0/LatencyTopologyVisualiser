/***
 * 3D globe scene rendering exchanges, regions, and latency arcs.
 * Uses react-globe.gl under Next dynamic import with client-only rendering.
 * Consumes Zustand store for data and filter state.
***/
"use client";

import Globe from "react-globe.gl";
import { useEffect, useMemo, useRef, useState } from "react";
import { useAppStore, useVisualArcs, exchanges, cloudRegions } from "@/_state/store";
import { providerColor } from "@/_lib/ui";

export default function GlobeScene(){
  const globeRef=useRef<any>(null);
  const arcs=useVisualArcs();
  const { showRegions, showRealtime, regenMock }=useAppStore(s=>({showRegions:s.showRegions, showRealtime:s.showRealtime, regenMock:s.regenMock}));

  useEffect(()=>{ regenMock(); },[regenMock]);

  const [dpr,setDpr]=useState(1.5);
  useEffect(()=>{
    const mq=window.matchMedia("(max-width: 640px)");
    setDpr(mq.matches?1:1.5);
  },[]);

  const exchangeLabels=useMemo(()=>exchanges.map(x=>({
    lat:x.lat, lng:x.lon, label:`${x.name} (${x.code})`, color:providerColor(x.provider), size:1.25,
  })),[]);

  const regionLabels=useMemo(()=>cloudRegions.map(r=>({
    lat:r.lat, lng:r.lon, label:`${r.provider.toUpperCase()} ${r.code}`, color:providerColor(r.provider), size:1,
  })),[]);

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
      pixelRatio={dpr}
      arcsData={showRealtime?arcs:[]}
      arcColor={(d:any)=>d.arcColor?.()}
      arcAltitude={(d:any)=>d.arcAltitude?.()}
      arcDashLength={(d:any)=>d.arcDashLength}
      arcDashGap={(d:any)=>d.arcDashGap}
      arcDashAnimateTime={(d:any)=>d.arcDashAnimateTime}
      labelsData={[...exchangeLabels, ...(showRegions?regionLabels:[])]}
      labelText={(d:any)=>d.label}
      labelColor={(d:any)=>d.color}
      labelSize={(d:any)=>d.size}
      labelDotRadius={0.3}
      atmosphereColor="rgba(34,211,238,0.6)"
      atmosphereAltitude={0.2}
      onGlobeReady={()=>{
        try{globeRef.current.pointOfView({lat:20, lng:10, altitude:2.5}, 1500);}catch{}
      }}
    />
  );
}
