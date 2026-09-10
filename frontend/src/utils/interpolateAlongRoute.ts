// utils/interpolateAlongRoute.ts
import * as Cesium from 'cesium';

export function getPositionAlongRoute(
  coordinates: number[][],  // [[lon, lat, elev], ...]
  progress: number,         // 0 to 1
  viewer?: Cesium.Viewer | null
): Cesium.Cartesian3 {
  if (coordinates.length === 0) return Cesium.Cartesian3.ZERO;
  if (coordinates.length === 1) {
    const [lon, lat, elev = 0] = coordinates[0];
    if (viewer?.scene?.globe) {
      const terrainHeight = viewer.scene.globe.getHeight(
        Cesium.Cartographic.fromDegrees(lon, lat)
      ) || 0;
      return Cesium.Cartesian3.fromDegrees(lon, lat, terrainHeight + 2);
    }
    return Cesium.Cartesian3.fromDegrees(lon, lat, elev);
  }

  const totalSegments = coordinates.length - 1;
  const scaled = progress * totalSegments;
  const idx = Math.min(Math.floor(scaled), totalSegments - 1);
  const frac = scaled - idx;

  const [lon1, lat1, alt1 = 0] = coordinates[idx];
  const [lon2, lat2, alt2 = 0] = coordinates[idx + 1];

  const lon = lon1 + (lon2 - lon1) * frac;
  const lat = lat1 + (lat2 - lat1) * frac;

  if (viewer?.scene?.globe) {
    const terrainHeight = viewer.scene.globe.getHeight(
      Cesium.Cartographic.fromDegrees(lon, lat)
    ) || 0;
    return Cesium.Cartesian3.fromDegrees(lon, lat, terrainHeight + 2);
  }

  const alt = alt1 + (alt2 - alt1) * frac;
  return Cesium.Cartesian3.fromDegrees(lon, lat, alt + 3); // +3m to lift slightly above road
}

export function getHeadingAlongRoute(
  coordinates: number[][],
  progress: number
): number {
  const totalSegments = coordinates.length - 1;
  const scaled = progress * totalSegments;
  const idx = Math.min(Math.floor(scaled), totalSegments - 1);

  const [lon1, lat1] = coordinates[idx];
  const [lon2, lat2] = coordinates[idx + 1];

  const dLon = lon2 - lon1;
  const dLat = lat2 - lat1;
  return Math.atan2(dLon, dLat) * (180 / Math.PI);
}
