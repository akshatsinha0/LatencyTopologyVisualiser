/*
 * (i.) Global client-side state for filters, data, and polling.
 * (ii.) Uses Zustand for ergonomic and minimal state management.
 * (iii.) Mock generator updates latency values on an interval.
 */
import { create } from "zustand";
import { buildExchangeToRegionArcs, mapArcVisual, type ArcDatum } from "@/_lib/latency";
import { exchanges, cloudRegions, type CloudProvider } from "@/_data/datasets";

export type AppState={
  providers:Set<CloudProvider>;
  showRegions:boolean;
  showRealtime:boolean;
  showHistorical:boolean;
  arcs:ArcDatum[];
  timer?:ReturnType<typeof setInterval>;
  setProviders:(p:Set<CloudProvider>)=>void;
  toggleRegions:()=>void;
  toggleRealtime:()=>void;
  toggleHistorical:()=>void;
  regenMock:()=>void;
  stopMock:()=>void;
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
  setProviders:(p)=>set({providers:new Set(p)}),
  toggleRegions:()=>set(s=>({showRegions:!s.showRegions})),
  toggleRealtime:()=>set(s=>({showRealtime:!s.showRealtime})),
  toggleHistorical:()=>set(s=>({showHistorical:!s.showHistorical})),
  regenMock:()=>{
    const arcs=buildExchangeToRegionArcs();
    set({arcs});
    if(get().timer) return;
    const timer=setInterval(()=>{
      set({arcs:buildExchangeToRegionArcs()});
    },10_000);
    set({timer});
  },
  stopMock:()=>{
    const t=get().timer; if(t) clearInterval(t);
    set({timer:undefined});
  },
}));

/***
 * (1) Selector helper to get filtered visual data for the globe component.
 * (2) Applies provider filter to arcs and returns visualized objects.
 * (3) Returns arcs mapped with color and altitude functions.
***/
export function useVisualArcs(){
  return useAppStore(s=>s.arcs
    .filter(a=>s.providers.has(a.provider))
    .map(mapArcVisual));
}

export { exchanges, cloudRegions };
