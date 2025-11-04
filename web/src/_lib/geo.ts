/*
 * Geodesy helpers and latency approximation utilities.
 * Provides great-circle distance and mapping latency to colors/altitudes.
 * Designed for quick demo without external geo libraries.
 */
export type LatLon={lat:number;lon:number};

/***
 * Compute the great-circle distance between two geo points using haversine formula.
 * Arguments are plain latitude/longitude pairs in degrees.
 * Returns distance in kilometers.
***/
export function haversineKm(a:LatLon,b:LatLon){
  const R=6371;
  const dLat=deg2rad(b.lat-a.lat);
  const dLon=deg2rad(b.lon-a.lon);
  const la1=deg2rad(a.lat), la2=deg2rad(b.lat);
  const h=Math.sin(dLat/2)**2+Math.cos(la1)*Math.cos(la2)*Math.sin(dLon/2)**2;
  return 2*R*Math.asin(Math.min(1,Math.sqrt(h)));
}

/***
 * Convert degrees to radians.
 * Helper for trigonometric calculations.
 * Returns radians as number.
***/
export function deg2rad(d:number){return d*Math.PI/180;}

/***
 * Approximate RTT latency from geodesic distance for demo purposes.
 * Uses fiber effective propagation of ~200km per ms for RTT baseline.
 * Adds small jitter to simulate variability.
***/
export function approxRttMs(km:number){
  const base=Math.max(2,km/100); // ~100km≈1ms RTT baseline.
  const jitter=(Math.random()-0.5)*4; // ±2ms jitter.
  return Math.round(base+jitter);
}

/***
 * Map latency to categorical color token.
 * Returns hex colors suitable for THREE.Color parsing.
 * Thresholds: <80ms green, 80-160ms amber, >=160ms red.
***/
export function colorForLatency(ms:number){
  if(ms<80) return "#10b981"; // green.
  if(ms<160) return "#f59e0b"; // amber.
  return "#ef4444"; // red.
}

/***
 * Map latency to an arc altitude for visual separation.
 * Higher latency results in higher curvature.
 * Returns a normalized altitude value for react-globe.gl.
***/
export function altitudeForLatency(ms:number){
  const clamped=Math.max(10,Math.min(300,ms));
  return 0.05+0.25*((clamped-10)/(300-10));
}
