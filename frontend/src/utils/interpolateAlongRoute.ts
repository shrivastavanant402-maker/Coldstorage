// utils/interpolateAlongRoute.ts
import * as Cesium from 'cesium';

/**
 * Given a list of route coordinates and a progress value (0-1),
 * returns the interpolated position along the polyline.
 */
export function getPositionAlongRoute(
  coordinates: [number, number][],  // [[lon, lat], ...]
  progress: number  // 0 to 1
): Cesium.Cartesian3 {
  if (coordinates.length === 0) return Cesium.Cartesian3.ZERO;
  if (coordinates.length === 1) {
    return Cesium.Cartesian3.fromDegrees(coordinates[0][0], coordinates[0][1], 0);
  }

  // Calculate total length in segments
  const totalPoints = coordinates.length - 1;
  const scaledProgress = progress * totalPoints;
  const segmentIndex = Math.min(Math.floor(scaledProgress), totalPoints - 1);
  const segmentProgress = scaledProgress - segmentIndex;

  const start = coordinates[segmentIndex];
  const end = coordinates[segmentIndex + 1];

  // Interpolate between start and end
  const lon = start[0] + (end[0] - start[0]) * segmentProgress;
  const lat = start[1] + (end[1] - start[1]) * segmentProgress;

  return Cesium.Cartesian3.fromDegrees(lon, lat, 0);
}

/**
 * Get heading (bearing) at a given progress point so vehicle faces forward.
 */
export function getHeadingAlongRoute(
  coordinates: [number, number][],
  progress: number
): number {
  const totalPoints = coordinates.length - 1;
  const scaledProgress = progress * totalPoints;
  const segmentIndex = Math.min(Math.floor(scaledProgress), totalPoints - 1);

  const start = coordinates[segmentIndex];
  const end = coordinates[Math.min(segmentIndex + 1, totalPoints)];

  const dLon = end[0] - start[0];
  const dLat = end[1] - start[1];
  const heading = Math.atan2(dLon, dLat) * (180 / Math.PI);
  return heading;
}
