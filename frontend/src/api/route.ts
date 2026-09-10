import axios from 'axios';

function generateFallbackHighwayRoute(
  origin: [number, number],
  destination: [number, number]
): number[][] {
  const waypoints = [
    [origin[0], origin[1], 216],
    [76.8400, 27.8500, 260],
    [75.7873, 26.9124, 431], // Jaipur
    [74.6399, 25.3407, 421], // Bhilwara
    [73.7125, 24.5854, 598], // Udaipur
    [72.5714, 23.0225, 53],  // Ahmedabad
    [73.1812, 22.3072, 39],  // Vadodara
    [72.8311, 21.1702, 13],  // Surat
    [destination[0], destination[1], 14], // Mumbai
  ];

  const points: number[][] = [];
  const stepsPerSeg = 20;

  for (let s = 0; s < waypoints.length - 1; s++) {
    const p1 = waypoints[s];
    const p2 = waypoints[s + 1];
    for (let i = 0; i < stepsPerSeg; i++) {
      const t = i / stepsPerSeg;
      const lon = p1[0] + (p2[0] - p1[0]) * t;
      const lat = p1[1] + (p2[1] - p1[1]) * t;
      const elev = p1[2] + (p2[2] - p1[2]) * t + Math.sin(t * Math.PI) * 12;
      points.push([lon, lat, Math.round(elev)]);
    }
  }
  points.push(waypoints[waypoints.length - 1]);
  console.log('Route points:', points.length);
  return points;
}

// src/api/route.ts
export async function getRoute(
  origin: [number, number],   // [lon, lat]
  destination: [number, number]
): Promise<number[][]> {
  const apiKey = import.meta.env.VITE_ORS_API_KEY;
  if (!apiKey) {
    console.log('VITE_ORS_API_KEY not configured, using high-resolution highway geometry fallback');
    return generateFallbackHighwayRoute(origin, destination);
  }

  try {
    const response = await axios.post(
      'https://api.openrouteservice.org/v2/directions/driving-car/geojson',
      {
        coordinates: [origin, destination],
        instructions: false,
        geometry_simplify: false,   // ← KEY: do not simplify
        elevation: true              // ← KEY: include elevation for terrain
      },
      {
        headers: {
          Authorization: apiKey,
          'Content-Type': 'application/json'
        }
      }
    );

    const coords = response.data.features[0].geometry.coordinates;
    // coords format: [[lon, lat, elevation], [lon, lat, elevation], ...]
    console.log('Route points:', coords.length);
    return coords;
  } catch (err) {
    console.warn('ORS request failed, falling back to simulated highway coordinates:', err);
    return generateFallbackHighwayRoute(origin, destination);
  }
}

export default getRoute;
