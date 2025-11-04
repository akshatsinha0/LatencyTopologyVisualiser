"use client";
/***
 * Control panel with filters, toggles, and status metrics.
 * Lets users filter by provider and toggle layers for regions and streams.
 * Invokes mock realtime generator until Globalping integration is active.
***/
import { useMemo } from "react";
import { useAppStore } from "@/_state/store";

const providers:["aws","gcp","azure"]= ["aws","gcp","azure"];

export default function ControlPanel(){
  const s=useAppStore();
  const counts=useMemo(()=>({ arcs:s.arcs.length, providers:s.providers.size }),[s.arcs.length,s.providers.size]);

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
      </section>

      <section className="flex gap-3">
        <button className="px-3 py-2 rounded bg-[var(--accent)] text-black text-sm" onClick={s.regenMock}>Start realtime.</button>
        <button className="px-3 py-2 rounded border border-white/10 text-sm" onClick={s.stopMock}>Stop.</button>
      </section>

      <section className="text-xs text-[var(--muted)]">
        <div>Arcs: {counts.arcs}.</div>
        <div>Providers active: {counts.providers}.</div>
      </section>
    </div>
  );
}
