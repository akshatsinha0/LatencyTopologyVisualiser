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
  arcs:ArcDatum[];
  history:Record<string, Sample[]>;
  selectedArcId?:string;
  focus?:{lat:number; lon:number};
  timer?:ReturnType<typeof setInterval>;
  setProviders:(p:Set<CloudProvider>)=>void;
  toggleRegions:()=>void;
  toggleRealtime:()=>void;
  toggleHistorical:()=>void;
  regenMock:()=>void;
  stopMock:()=>void;
  setSelectedArc:(id?:string)=>void;
  setFocus:(lat:number, lon:number)=>void;
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
  arcs:buildExchangeToRegionArcs(),
  history:{},
  setProviders:(p)=>set({providers:new Set(p)}),
  toggleRegions:()=>set(s=>({showRegions:!s.showRegions})),
  toggleRealtime:()=>set(s=>({showRealtime:!s.showRealtime})),
  toggleHistorical:()=>set(s=>({showHistorical:!s.showHistorical})),
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
    set({arcs, history:nextHist});
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
      set({arcs:newArcs, history:nh});
    },10_000);
    set({timer});
  },
  stopMock:()=>{
    const t=get().timer; if(t) clearInterval(t);
    set({timer:undefined});
  },
  setSelectedArc:(id)=>set({selectedArcId:id}),
  setFocus:(lat,lon)=>set({focus:{lat,lon}}),
}));

/***
 * (1) Selector helper to get filtered visual data for the globe component.
 * (2) Applies provider filter to arcs and returns visualized objects.
 * (3) Returns arcs mapped with color and altitude functions.
***/
export function useVisualArcs():VisualArc[]{
  return useAppStore(s=>s.arcs
    .filter(a=>s.providers.has(a.provider))
    .map(mapArcVisual));
}

/***
 * Selector to read historical samples for a given arc.
 * Accepts an arc id and a time range in milliseconds.
 * Returns an ordered array of samples within the window.
***/
export function useArcHistory(id?:string, rangeMs=60*60*1000){
  return useAppStore(s=>{
    if(!id) return [] as Sample[];
    const now=Date.now();
    const arr=s.history[id]??[];
    return arr.filter(pt=>pt.t>=now-rangeMs);
  });
}

export { exchanges, cloudRegions };
