"use client";
/***
 * Region summary widget listing server counts by provider region.
 * Counts respect provider and exchange filters from the store.
 * Displays top regions sorted by count.
***/
import { useMemo } from "react";
import { cloudRegions, exchanges, useAppStore } from "@/_state/store";

export default function RegionSummary(){
  const providers=useAppStore(s=>s.providers);
  const enabled=useAppStore(s=>s.exchangesEnabled);

  const items=useMemo(()=>{
    const activeEx = enabled.size? exchanges.filter(e=>enabled.has(e.id)) : exchanges;
    const counts = new Map<string, number>();
    for(const ex of activeEx){
      if(!providers.has(ex.provider)) continue;
      const key=`${ex.provider}-${ex.regionCode}`;
      counts.set(key, (counts.get(key)??0)+1);
    }
    const rows = cloudRegions
      .filter(r=>providers.has(r.provider))
      .map(r=>({ key:`${r.provider}-${r.code}`, label:`${r.provider.toUpperCase()} ${r.code}`, count: counts.get(`${r.provider}-${r.code}`)??0 }))
      .filter(r=>r.count>0)
      .sort((a,b)=>b.count-a.count)
      .slice(0,8);
    return rows;
  },[providers,enabled]);

  if(items.length===0) return null;
  return (
    <div className="panel p-3 mt-2 text-xs">
      <div className="font-semibold mb-1">Top regions by server count.</div>
      <ul className="space-y-1">
        {items.map(r=> (
          <li key={r.key} className="flex justify-between"><span>{r.label}</span><span>{r.count}</span></li>
        ))}
      </ul>
    </div>
  );
}
