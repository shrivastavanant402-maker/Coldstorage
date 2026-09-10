// components/Globe3D.tsx
import { Viewer, Entity, PolylineGraphics } from 'resium';
import * as Cesium from 'cesium';
import { useRef, useEffect, useState } from 'react';
import ShipmentMarker from './ShipmentMarker';

Cesium.Ion.defaultAccessToken =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJub25jZSI6IlZtVUVMNGVZQW1KVzd2NXkiLCJqdGkiOiI0NjZkNzg2NC1kYTJmLTQzNzUtOGI4Yi1lYjJhZmI0ODdkNzkiLCJpZCI6NDg2MTY1LCJpc3MiOiJodHRwczovL2FwaS5jZXNpdW0uY29tIiwiYXVkIjoidW5kZWZpbmVkX2RlZmF1bHQiLCJpYXQiOjE3ODkwMDQxNTJ9.m26bOjh6TQIoNobSNjpRWYpWLNw2XKmbbxXj3riwNug';

interface Props {
  routeCoordinates?: number[][];  // passed from parent
  distanceKm?: number;
}

const clamp = (val: number, min: number, max: number) => Math.min(Math.max(val, min), max);

function computeHaversineKm(coords: number[][]): number {
  if (coords.length < 2) return 0;
  let total = 0;
  const toRad = (d: number) => (d * Math.PI) / 180;
  for (let i = 0; i < coords.length - 1; i++) {
    const [lon1, lat1] = coords[i];
    const [lon2, lat2] = coords[i + 1];
    const dLat = toRad(lat2 - lat1);
    const dLon = toRad(lon2 - lon1);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    total += 6371 * c;
  }
  return Math.round(total);
}

export default function Globe3D({ routeCoordinates = [], distanceKm }: Props) {
  const effectiveDistance =
    distanceKm && distanceKm > 0 ? distanceKm : computeHaversineKm(routeCoordinates);
  const durationSeconds = clamp(effectiveDistance / 8, 45, 120);
  const viewerRef = useRef<Cesium.Viewer | null>(null);
  const [viewer, setViewer] = useState<Cesium.Viewer | null>(null);

  // Enable terrain using Cesium.createWorldTerrain
  useEffect(() => {
    if (viewer) {
      if (typeof Cesium.createWorldTerrain === 'function') {
        viewer.terrainProvider = Cesium.createWorldTerrain({
          requestWaterMask: false,
          requestVertexNormals: true
        });
      } else if (typeof (Cesium as any).createWorldTerrainAsync === 'function') {
        (Cesium as any).createWorldTerrainAsync({
          requestWaterMask: false,
          requestVertexNormals: true
        }).then((provider: any) => {
          if (viewer && !viewer.isDestroyed() && provider) {
            viewer.terrainProvider = provider;
          }
        }).catch(() => {});
      }
    }
  }, [viewer]);

  // Fly camera to route start when route changes
  useEffect(() => {
    if (viewer && routeCoordinates.length > 0) {
      const [lon, lat] = routeCoordinates[0];
      viewer.camera.flyTo({
        destination: Cesium.Cartesian3.fromDegrees(lon, lat, 5000),
        duration: 2
      });
    }
  }, [viewer, routeCoordinates]);

  return (
    <Viewer
      ref={(e) => {
        const v = e?.cesiumElement || null;
        viewerRef.current = v;
        setViewer(v);
      }}
      full
      timeline={false}
      animation={false}
      baseLayerPicker={false}
      geocoder={false}
      homeButton={false}
      sceneModePicker={false}
      navigationHelpButton={false}
    >
      {/* Route polyline — sits on terrain */}
      {routeCoordinates.length > 1 && (
        <Entity>
          <PolylineGraphics
            positions={Cesium.Cartesian3.fromDegreesArrayHeights(
              routeCoordinates.flatMap(([lon, lat, alt = 0]) => [lon, lat, alt + 2])
            )}
            width={4}
            material={Cesium.Color.fromCssColorString('#4F46E5')}
            clampToGround={true}
          />
        </Entity>
      )}

      {/* Moving vehicle with camera follow */}
      {routeCoordinates.length > 1 && (
        <ShipmentMarker
          routeCoordinates={routeCoordinates}
          viewer={viewer}
          durationSeconds={durationSeconds}
        />
      )}
    </Viewer>
  );
}

export { Globe3D };

