// utils/interpolateAlongRoute.ts
import * as Cesium from 'cesium';

export function getPositionAlongRoute(
  coordinates: number[][],  // [[lon, lat, elev], ...]
  progress: number,         // 0 to 1
  viewer?: Cesium.Viewer | null
): Cesium.Cartesian3 {
  if (!coordinates || coordinates.length === 0) return Cesium.Cartesian3.ZERO;
  if (coordinates.length === 1) {
    const [lon, lat] = coordinates[0];
    return Cesium.Cartesian3.fromDegrees(lon, lat, 0);
  }

  const clampedProgress = Math.min(Math.max(progress, 0), 1);
  const totalSegments = coordinates.length - 1;
  const scaled = clampedProgress * totalSegments;
  const idx = Math.min(Math.floor(scaled), totalSegments - 1);
  const frac = scaled - idx;

  const wp1 = coordinates[idx];
  const wp2 = coordinates[idx + 1];
  const lon1 = wp1[0];
  const lat1 = wp1[1];
  const lon2 = wp2[0];
  const lat2 = wp2[1];

  const lon = lon1 + (lon2 - lon1) * frac;
  const lat = lat1 + (lat2 - lat1) * frac;

  let elev = 0;
  if (viewer?.scene?.globe) {
    elev = viewer.scene.globe.getHeight(Cesium.Cartographic.fromDegrees(lon, lat)) || 0;
  }

  return Cesium.Cartesian3.fromDegrees(lon, lat, elev);
}

export function getHeadingAlongRoute(
  coordinates: number[][],
  progress: number
): number {
  if (!coordinates || coordinates.length < 2) return 0;

  const clampedProgress = Math.min(Math.max(progress, 0), 1);
  const totalSegments = coordinates.length - 1;
  const scaled = clampedProgress * totalSegments;
  const idx = Math.min(Math.floor(scaled), totalSegments - 1);

  const [lon1, lat1] = coordinates[idx];
  const [lon2, lat2] = coordinates[idx + 1];

  const dLon = lon2 - lon1;
  const dLat = lat2 - lat1;

  // atan2(dLon, dLat) returns angle in radians clockwise from North
  let headingDeg = Math.atan2(dLon, dLat) * (180 / Math.PI);
  if (headingDeg < 0) headingDeg += 360;
  return headingDeg;
}

