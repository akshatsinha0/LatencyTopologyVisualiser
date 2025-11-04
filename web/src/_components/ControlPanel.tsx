"use client";
/***
 * Control panel with filters, toggles, and status metrics.
 * Lets users filter by provider and toggle layers for regions and streams.
 * Invokes mock realtime generator until Globalping integration is active.
***/
import { useMemo } from "react";
import { useAppStore } from "@/_state/store";
import LatencyChart from "@/_components/LatencyChart";
import { exchanges, cloudRegions } from "@/_state/store";
import { useFps } from "@/_lib/perf";
import ThemeToggle from "@/_components/ThemeToggle";
import RegionSummary from "@/_components/RegionSummary";

const providers:["aws","gcp","azure"]= ["aws","gcp","azure"];
import { exchanges as allExchanges } from "@/_state/store";

export default function ControlPanel(){
  const s=useAppStore();
  const counts=useMemo(()=>({ arcs:s.arcs.length, providers:s.providers.size }),[s.arcs.length,s.providers.size]);
  const metrics=useMemo(()=>{
    const ms=s.arcs.map(a=>a.latencyMs); const avg=ms.length?Math.round(ms.reduce((a,b)=>a+b,0)/ms.length):0; return { avg, last:s.lastUpdated };
  },[s.arcs,s.lastUpdated]);
  const fps = useFps();

  function onSearch(q:string){
    const needle=q.trim().toLowerCase(); if(!needle) return;
    const e=exchanges.find(x=>x.name.toLowerCase().includes(needle)||x.code.toLowerCase().includes(needle));
    const r=!e? cloudRegions.find(x=>x.code.toLowerCase().includes(needle)||x.name.toLowerCase().includes(needle)):undefined;
    if(e){ s.setFocus(e.lat,e.lon); } else if(r){ s.setFocus(r.lat,r.lon); }
  }

  return (
    <div className="space-y-4">
      <section>
        <h2 className="text-sm font-semibold mb-2">Providers.</h2>
        <div className="flex gap-3">
          {providers.map(p=>{
            const checked=s.providers.has(p);
            return (
              <label key={p} className="inline-flex items-center gap-2 text-sm">
                <input type="checkbox" checked={checked} onChange={(e)=>{
                  const next=new Set(s.providers); if(e.target.checked) next.add(p); else next.delete(p); s.setProviders(next);
                }} />
                <span className="capitalize">{p}</span>
              </label>
            );
          })}
        </div>
      </section>

      <section>
        <label className="text-sm font-semibold mb-1 block">Search.</label>
        <div className="flex gap-2">
          <input className="flex-1 px-2 py-1 rounded bg-transparent border border-white/10 text-sm" placeholder="Exchange or region code..." onKeyDown={(e)=>{ if(e.key==='Enter') onSearch((e.target as HTMLInputElement).value); }} />
          <button className="px-2 py-1 rounded border border-white/10 text-sm" onClick={()=>{
            const el=(document.activeElement as HTMLInputElement); onSearch(el?.value??"");
          }}>Go.</button>
        </div>
      </section>

      <section>
        <label className="text-sm font-semibold mb-1 block">Latency threshold.</label>
        <input type="range" min={20} max={300} step={10} value={s.maxLatency} onChange={(e)=>s.setMaxLatency(parseInt(e.target.value))} className="w-full" />
        <div className="text-xs text-[var(--muted)]">Max latency: {s.maxLatency} ms.</div>
      </section>

      <section>
        <h2 className="text-sm font-semibold mb-2">Exchanges.</h2>
        <div className="grid grid-cols-2 gap-2 max-h-32 overflow-auto pr-1">
          {allExchanges.map(x=>{
            const checked = s.exchangesEnabled.size? s.exchangesEnabled.has(x.id): true;
            return (
              <label key={x.id} className="inline-flex items-center gap-2 text-xs">
                <input type="checkbox" checked={checked} onChange={(e)=>{
                  const next=new Set(s.exchangesEnabled);
                  if(next.size===0){ allExchanges.forEach(ex=>next.add(ex.id)); }
                  if(e.target.checked) next.add(x.id); else next.delete(x.id);
                  s.setExchangesEnabled(next);
                }} />
                <span>{x.name}</span>
              </label>
            );
          })}
        </div>
      </section>

      <section className="grid grid-cols-2 gap-3">
        <label className="inline-flex items-center gap-2 text-sm">
          <input type="checkbox" checked={s.showRegions} onChange={s.toggleRegions} /> Regions.
        </label>
        <label className="inline-flex items-center gap-2 text-sm">
          <input type="checkbox" checked={s.showRealtime} onChange={s.toggleRealtime} /> Realtime.
        </label>
        <label className="inline-flex items-center gap-2 text-sm">
          <input type="checkbox" checked={s.showHistorical} onChange={s.toggleHistorical} /> Historical.
        </label>
        <label className="inline-flex items-center gap-2 text-sm">
          <input type="checkbox" checked={s.showHeatmap} onChange={s.toggleHeatmap} /> Heatmap.
        </label>
      </section>

      <section className="flex flex-wrap gap-3">
        <button className="px-3 py-2 rounded bg-[var(--accent)] text-black text-sm" onClick={()=>{s.regenMock(); s.probeReal();}}>Start realtime.</button>
        <button className="px-3 py-2 rounded border border-white/10 text-sm" onClick={s.stopMock}>Stop.</button>
        <button className="px-3 py-2 rounded border border-white/10 text-sm" onClick={()=>{
          const payload={
            at:new Date().toISOString(),
            providers:Array.from(s.providers),
            arcs:s.arcs,
            metrics:{ avg: s.arcs.length?Math.round(s.arcs.map(a=>a.latencyMs).reduce((a,b)=>a+b,0)/s.arcs.length):0 }
          };
          const blob=new Blob([JSON.stringify(payload,null,2)],{type:"application/json"});
          const url=URL.createObjectURL(blob); const a=document.createElement('a'); a.href=url; a.download=`latency-report-${Date.now()}.json`; a.click(); URL.revokeObjectURL(url);
        }}>Export report.</button>
        <button className="px-3 py-2 rounded border border-white/10 text-sm" onClick={()=>{
          const canvas=document.querySelector('canvas'); if(!canvas) return;
          const url=(canvas as HTMLCanvasElement).toDataURL('image/png');
          const a=document.createElement('a'); a.href=url; a.download=`latency-visual-${Date.now()}.png`; a.click();
        }}>Export image.</button>
        <ThemeToggle />
      </section>

      <section className="text-xs text-[var(--muted)]">
        <div>Arcs: {counts.arcs}.</div>
        <div>Providers active: {counts.providers}.</div>
        <div>Avg latency: {metrics.avg} ms.</div>
        <div>Last update: {metrics.last? new Date(metrics.last).toLocaleTimeString():"-"}.</div>
        <div>FPS: {fps}.</div>
      </section>

      <RegionSummary />

      <LatencyChart />
    </div>
  );
}
