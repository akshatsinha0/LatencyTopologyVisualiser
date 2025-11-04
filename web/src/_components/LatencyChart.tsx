"use client";
/***
 * Time-series chart for selected arc's latency samples.
 * Supports basic time window selection with local state.
 * Uses Recharts LineChart for quick visualization.
***/
import { useMemo, useState } from "react";
import { useAppStore, useArcHistory } from "@/_state/store";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, ReferenceLine } from "recharts";

const ranges:[label:string,value:number][]=[
  ["1h", 60*60*1000], ["24h", 24*60*60*1000], ["7d", 7*24*60*60*1000]
];

export default function LatencyChart(){
  const { selectedArcId }=useAppStore(s=>({selectedArcId:s.selectedArcId}));
  const [range,setRange]=useState(ranges[0][1]);
  const samples=useArcHistory(selectedArcId, range);

  const stats=useMemo(()=>{
    if(samples.length===0) return {min:0, avg:0, max:0};
    const ms=samples.map(s=>s.ms);
    const min=Math.min(...ms), max=Math.max(...ms), avg=Math.round(ms.reduce((a,b)=>a+b,0)/ms.length);
    return {min, avg, max};
  },[samples]);

  if(!selectedArcId) return <div className="text-xs text-[var(--muted)]">Select a connection to see history.</div>;

  return (
    <div className="panel p-3">
      <div className="flex items-center justify-between mb-2">
        <div className="text-sm font-semibold">Latency history.</div>
        <div className="flex gap-2">
          {ranges.map(([label,val])=> (
            <button key={label} className={`px-2 py-1 rounded text-xs ${range===val?"bg-[var(--accent)] text-black":"border border-white/10"}`} onClick={()=>setRange(val)}>{label}.</button>
          ))}
        </div>
      </div>
      <div className="h-40 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={samples.map(s=>({ t:new Date(s.t).toLocaleTimeString(), ms:s.ms }))}>
            <XAxis dataKey="t" hide />
            <YAxis domain={[0, 'auto']} tick={{fontSize:10}} width={28} />
            <Tooltip contentStyle={{background:"#0f172a", border:"1px solid rgba(255,255,255,0.08)", borderRadius:8}} />
            <Line type="monotone" dataKey="ms" stroke="#22d3ee" strokeWidth={2} dot={false} />
            <ReferenceLine y={80} stroke="var(--ok)" strokeDasharray="3 3" />
            <ReferenceLine y={160} stroke="var(--warn)" strokeDasharray="3 3" />
          </LineChart>
        </ResponsiveContainer>
      </div>
      <div className="mt-2 text-xs text-[var(--muted)]">min {stats.min} ms • avg {stats.avg} ms • max {stats.max} ms.</div>
    </div>
  );
}
