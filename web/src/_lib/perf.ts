/***
 * FPS sampler hook for simple performance metric display.
 * Uses requestAnimationFrame to compute average fps over a sliding window.
 * Returns current FPS number updated roughly every 500ms.
***/
import { useEffect, useRef, useState } from "react";

export function useFps(){
  const last=useRef(0);
  const frames=useRef<number[]>([]);
  const [fps,setFps]=useState(0);
  useEffect(()=>{
    let raf=0; let lastTick=performance.now(); last.current=performance.now();
    const loop=(t:number)=>{
      const dt=t-last.current; last.current=t;
      const f=1000/dt; frames.current.push(f); if(frames.current.length>60) frames.current.shift();
      if(t-lastTick>500){
        const avg=Math.round(frames.current.reduce((a,b)=>a+b,0)/frames.current.length);
        setFps(avg); lastTick=t;
      }
      raf=requestAnimationFrame(loop);
    };
    raf=requestAnimationFrame(loop);
    return ()=>cancelAnimationFrame(raf);
  },[]);
  return fps;
}
