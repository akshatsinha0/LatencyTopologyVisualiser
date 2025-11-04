/*
 * (i.) Global client-side state for filters, data, and polling.
 * (ii.) Uses Zustand for ergonomic and minimal state management.
 * (iii.) Mock generator updates latency values on an interval.
 */
import { create } from "zustand";
import { buildExchangeToRegionArcs, mapArcVisual, type ArcDatum, type VisualArc } from "@/_lib/latency";
import { exchanges, cloudRegions, type CloudProvider } from "@/_data/datasets";

export type Sample={ t:number; ms:number };

export type AppState={
  providers:Set<CloudProvider>;
  showRegions:boolean;
  showRealtime:boolean;
  showHistorical:boolean;
  showHeatmap:boolean;
  arcs:ArcDatum[];
  history:Record<string, Sample[]>;
  selectedArcId?:string;
  selectedMarker?:{ kind:"exchange"|"region"; id:string };
  focus?:{lat:number; lon:number};
  maxLatency:number;
  lastUpdated?:number;
  exchangesEnabled:Set<string>;
  timer?:ReturnType<typeof setInterval>;
  setProviders:(p:Set<CloudProvider>)=>void;
  toggleRegions:()=>void;
  toggleRealtime:()=>void;
  toggleHistorical:()=>void;
  toggleHeatmap:()=>void;
  regenMock:()=>void;
  stopMock:()=>void;
  probeReal:()=>void;
  setSelectedArc:(id?:string)=>void;
  setSelectedMarker:(m?:{kind:"exchange"|"region"; id:string})=>void;
  setFocus:(lat:number, lon:number)=>void;
  setMaxLatency:(v:number)=>void;
  setExchangesEnabled:(ids:Set<string>)=>void;
};

/***
 * Create the application store with default filters and data snapshot.
 * Initializes mock arcs derived from static dataset.
 * Provides actions to toggle layers and update mock data.
***/
export const useAppStore=create<AppState>((set,get)=>({
  providers:new Set<CloudProvider>(["aws","gcp","azure"]),
  showRegions:true,
  showRealtime:true,
  showHistorical:false,
  showHeatmap:false,
  arcs:buildExchangeToRegionArcs(),
  history:{},
  exchangesEnabled:new Set<string>(),
  maxLatency:300,
  setProviders:(p)=>set({providers:new Set(p)}),
  toggleRegions:()=>set(s=>({showRegions:!s.showRegions})),
  toggleRealtime:()=>set(s=>({showRealtime:!s.showRealtime})),
  toggleHistorical:()=>set(s=>({showHistorical:!s.showHistorical})),
  toggleHeatmap:()=>set(s=>({showHeatmap:!s.showHeatmap})),
  regenMock:()=>{
    const arcs=buildExchangeToRegionArcs();
    // update history with latest snapshot samples.
    const now=Date.now();
    const prev=get().history;
    const nextHist:Record<string, Sample[]>={...prev};
    for(const a of arcs){
      const arr=[...(nextHist[a.id]??[]), {t:now, ms:a.latencyMs}];
      nextHist[a.id]=arr.slice(-300);
    }
    set({arcs, history:nextHist, lastUpdated:now});
    if(get().timer) return;
    const timer=setInterval(()=>{
      const newArcs=buildExchangeToRegionArcs();
      const nnow=Date.now();
      const ph=get().history;
      const nh:Record<string, Sample[]>={...ph};
      for(const a of newArcs){
        const arr=[...(nh[a.id]??[]), {t:nnow, ms:a.latencyMs}];
        nh[a.id]=arr.slice(-300);
      }
      set({arcs:newArcs, history:nh, lastUpdated:nnow});
    },10_000);
    set({timer});
  },
  stopMock:()=>{
    const t=get().timer; if(t) clearInterval(t);
    set({timer:undefined});
  },
  probeReal:async()=>{
    // Fire a round of Globalping probes and merge medians into arcs.
    try{
      const tasks=exchanges.slice(0,4).map(async x=>{
        const res=await fetch(`/api/ping`,{method:'POST', headers:{'content-type':'application/json'}, body:JSON.stringify({host:x.host})});
        const data=await res.json() as { median?:number };
        return { id:x.id, median:data.median };
      });
      const results=await Promise.all(tasks);
      const map=new Map(results.filter(r=>typeof r.median==='number').map(r=>[r.id!, r.median!] as const));
      if(map.size===0) return;
      const updated=get().arcs.map(a=> map.has(a.id.split('__')[0]) ? { ...a, latencyMs: map.get(a.id.split('__')[0])! } : a );
      const now=Date.now();
      const ph=get().history; const nh:Record<string, Sample[]>={...ph};
      for(const a of updated){
        const arr=[...(nh[a.id]??[]), {t:now, ms:a.latencyMs}];
        nh[a.id]=arr.slice(-300);
      }
      set({ arcs:updated, history:nh, lastUpdated:now });
    }catch{}
  },
  setSelectedArc:(id)=>set({selectedArcId:id}),
  setSelectedMarker:(m)=>set({selectedMarker:m}),
  setFocus:(lat,lon)=>set({focus:{lat,lon}}),
  setMaxLatency:(v)=>set({maxLatency:v}),
  setExchangesEnabled:(ids)=>set({exchangesEnabled:new Set(ids)}),
}));

/***
 * (1) Selector helper to get filtered visual data for the globe component.
 * (2) Applies provider filter to arcs and returns visualized objects.
 * (3) Returns arcs mapped with color and altitude functions.
***/
import { useMemo } from "react";

export function useVisualArcs():VisualArc[]{
  const arcs=useAppStore(s=>s.arcs);
  const providers=useAppStore(s=>s.providers);
  const maxLatency=useAppStore(s=>s.maxLatency);
  const enabled=useAppStore(s=>s.exchangesEnabled);
  return useMemo(()=>{
    const enabledIds = enabled.size? enabled : new Set(arcs.map(a=>a.id.split("__")[0]));
    return arcs.filter(a=>providers.has(a.provider))
        .filter(a=>enabledIds.has(a.id.split("__")[0]))
        .filter(a=>a.latencyMs<=maxLatency)
        .map(mapArcVisual);
  },[arcs,providers,maxLatency,enabled]);
}

/***
 * Selector to read historical samples for a given arc.
 * Accepts an arc id and a time range in milliseconds.
 * Returns an ordered array of samples within the window.
***/
export function useArcHistory(id?:string, rangeMs=60*60*1000){
  const history=useAppStore(s=>s.history);
  const lastUpdated=useAppStore(s=>s.lastUpdated);
  return useMemo(()=>{
    if(!id) return [] as Sample[];
    const arr=history[id]??[];
    const now= lastUpdated ?? (arr.length? arr[arr.length-1].t : 0);
    if(!now) return arr;
    return arr.filter(pt=>pt.t>=now-rangeMs);
  },[history, id, rangeMs, lastUpdated]);
}

export { exchanges, cloudRegions };
