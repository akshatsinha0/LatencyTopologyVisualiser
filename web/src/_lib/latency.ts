/*
 * Latency data orchestration utilities and client polling logic.
 * Provides mock generation and shape normalization for visual arcs.
 * Real-time integration hooks into Next API backed by Globalping.
 */
import { cloudRegions, exchanges, type ExchangeSite, type CloudRegion, type CloudProvider } from "@/_data/datasets";
import { altitudeForLatency, colorForLatency, haversineKm, approxRttMs } from "@/_lib/geo";

export type ArcDatum={
  id:string;
  from:{lat:number;lon:number; label:string};
  to:{lat:number;lon:number; label:string};
  provider:CloudProvider;
  latencyMs:number;
};

/***
 * Find a cloud region by provider and region code.
 * Falls back to nearest region of that provider if exact code is not found.
 * Returns a CloudRegion object.
***/
export function resolveRegion(provider:CloudProvider, regionCode:string):CloudRegion{
  const exact=cloudRegions.find(r=>r.provider===provider && r.code===regionCode);
  if(exact) return exact;
  const sameProv=cloudRegions.filter(r=>r.provider===provider);
  // Fallback: choose first available when unknown.
  return sameProv[0] ?? cloudRegions[0];
}

/***
 * Build arc data connecting exchanges to their declared cloud regions.
 * Computes geodesic distance and approximated RTT latency for visuals.
 * Returns an array of ArcDatum suitable for react-globe.gl arcsData.
***/
export function buildExchangeToRegionArcs(list:ExchangeSite[]=exchanges):ArcDatum[]{
  return list.map(x=>{
    const region=resolveRegion(x.provider,x.regionCode);
    const km=haversineKm({lat:x.lat,lon:x.lon},{lat:region.lat,lon:region.lon});
    const latency=approxRttMs(km);
    return {
      id:`${x.id}__${region.provider}-${region.code}`,
      from:{lat:x.lat,lon:x.lon,label:`${x.name} (${x.code})`},
      to:{lat:region.lat,lon:region.lon,label:`${region.provider.toUpperCase()} ${region.code}`},
      provider:x.provider,
      latencyMs:latency,
    } satisfies ArcDatum;
  });
}

/***
 * Map arc datum to visual attributes used by the globe layer.
 * Encodes color and altitude while preserving endpoints.
 * Returns structure consumed by react-globe.gl.
***/
export function mapArcVisual(a:ArcDatum){
  return {
    ...a,
    arcColor:()=>[colorForLatency(a.latencyMs), colorForLatency(a.latencyMs)],
    arcAltitude:()=>altitudeForLatency(a.latencyMs),
    arcDashLength:0.6,
    arcDashGap:0.2,
    arcDashAnimateTime:Math.max(1500, a.latencyMs*12),
  };
}

/***
 * Provide marker data for exchanges and regions for label layers.
 * Allows coloring by provider for consistent legend semantics.
 * Returns arrays of marker-like objects.
***/
export function markerData(){
  const exchangeMarkers=exchanges.map(x=>({
    id:x.id, lat:x.lat, lon:x.lon, label:`${x.name} • ${x.code}`, kind:"exchange" as const, provider:x.provider,
  }));
  const regionMarkers=cloudRegions.map(r=>({
    id:`${r.provider}-${r.code}`, lat:r.lat, lon:r.lon, label:`${r.provider.toUpperCase()} ${r.code}`, kind:"region" as const, provider:r.provider,
  }));
  return { exchangeMarkers, regionMarkers };
}
