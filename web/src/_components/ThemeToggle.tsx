/***
 * Theme toggle button storing preference in localStorage.
 * Applies data-theme attribute on <html> for CSS variable switching.
 * Defaults to dark when unset; supports toggling at runtime.
***/
"use client";
import { useEffect, useState } from "react";

export default function ThemeToggle(){
  const [theme,setTheme]=useState<"dark"|"light">(()=>{
    if(typeof window==='undefined') return "dark";
    const saved=(localStorage.getItem("theme") as "dark"|"light"|null)??"dark";
    return saved;
  });
  useEffect(()=>{
    if(typeof window==='undefined') return; localStorage.setItem("theme", theme); document.documentElement.dataset.theme=theme;
  },[theme]);
  return (
    <button className="px-2 py-1 rounded border border-white/10 text-xs" onClick={()=>setTheme(theme==="dark"?"light":"dark")}>{theme==="dark"?"Light":"Dark"} mode.</button>
  );
}
