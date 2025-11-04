"use client";
/***
 * Legend for provider markers and latency color thresholds.
 * Helps users understand visual encodings of arcs and dots.
 * Static component with semantic color chips.
***/
export default function Legend(){
  return (
    <div className="panel p-3 text-xs flex flex-col gap-2">
      <div className="font-semibold">Legend.</div>
      <div className="grid grid-cols-2 gap-3">
        <div className="flex items-center gap-2"><span className="size-3 rounded-full" style={{background:"#f59e0b"}} /> AWS.</div>
        <div className="flex items-center gap-2"><span className="size-3 rounded-full" style={{background:"#ea4335"}} /> GCP.</div>
        <div className="flex items-center gap-2"><span className="size-3 rounded-full" style={{background:"#2563eb"}} /> Azure.</div>
      </div>
      <div className="grid grid-cols-3 gap-3">
        <div className="flex items-center gap-2"><span className="size-3 rounded-full" style={{background:"var(--ok)"}} /> Low &lt;80ms.</div>
        <div className="flex items-center gap-2"><span className="size-3 rounded-full" style={{background:"var(--warn)"}} /> Med 80-160ms.</div>
        <div className="flex items-center gap-2"><span className="size-3 rounded-full" style={{background:"var(--err)"}} /> High ≥160ms.</div>
      </div>
    </div>
  );
}
