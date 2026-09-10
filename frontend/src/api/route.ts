import axios from 'axios';

// api/route.ts
export async function getRoute(origin: [number, number], destination: [number, number]): Promise<[number, number][]> {
  const response = await axios.post(
    'https://api.openrouteservice.org/v2/directions/driving-car/geojson',
    {
      coordinates: [origin, destination],
      instructions: false,
      geometry_simplify: false  // IMPORTANT: keep detailed geometry
    },
    {
      headers: {
        'Authorization': import.meta.env.VITE_ORS_API_KEY,
        'Content-Type': 'application/json'
      }
    }
  );

  // This returns detailed road-following coordinates
  return response.data.features[0].geometry.coordinates;
  // Format: [[lon, lat], [lon, lat], ...] — many points following the road
}

export default getRoute;
