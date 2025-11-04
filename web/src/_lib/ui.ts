/***
 * Provider color helpers for consistent UI visuals.
 * Supplies brand-inspired colors and label CSS variables.
 * Keep small and dependency-free for client usage.
***/
export function providerColor(p:"aws"|"gcp"|"azure"){ 
  switch(p){
    case "aws": return "#f59e0b"; // amber.
    case "gcp": return "#ea4335"; // red.
    case "azure": return "#2563eb"; // blue.
  }
}
