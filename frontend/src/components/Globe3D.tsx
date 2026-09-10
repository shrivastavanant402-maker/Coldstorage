// components/Globe3D.tsx
import React, { useRef, useEffect, useState } from 'react';
import { Viewer, Entity, PolylineGraphics, BoxGraphics } from 'resium';
import * as Cesium from 'cesium';
import { getPositionAlongRoute, getHeadingAlongRoute } from '../utils/interpolateAlongRoute';

Cesium.Ion.defaultAccessToken =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJub25jZSI6IlZtVUVMNGVZQW1KVzd2NXkiLCJqdGkiOiI0NjZkNzg2NC1kYTJmLTQzNzUtOGI4Yi1lYjJhZmI0ODdkNzkiLCJpZCI6NDg2MTY1LCJpc3MiOiJodHRwczovL2FwaS5jZXNpdW0uY29tIiwiYXVkIjoidW5kZWZpbmVkX2RlZmF1bHQiLCJpYXQiOjE3ODkwMDQxNTJ9.m26bOjh6TQIoNobSNjpRWYpWLNw2XKmbbxXj3riwNug';

interface Globe3DProps {
  routeCoordinates?: [number, number][];
  durationSeconds?: number;
}

export default function Globe3D({
  routeCoordinates = [
    [72.8777, 19.0760],
    [75.5678, 23.6366],
    [77.1025, 28.7041],
  ],
  durationSeconds = 20,
}: Globe3DProps) {
  const viewerRef = useRef<Cesium.Viewer | null>(null);
  const vehicleRef = useRef<Cesium.Entity | null>(null);
  const [progress, setProgress] = useState(0);
  const startTime = useRef<number>(Date.now());

  // Set 3D World Terrain with vertex normals
  useEffect(() => {
    if (viewerRef.current) {
      const createTerrain = (Cesium as any).createWorldTerrainAsync || (Cesium as any).createWorldTerrain;
      if (createTerrain) {
        Promise.resolve(
          createTerrain({
            requestWaterMask: false,
            requestVertexNormals: true,
          })
        ).then((provider) => {
          if (viewerRef.current && !viewerRef.current.isDestroyed() && provider) {
            viewerRef.current.terrainProvider = provider;
          }
        }).catch(() => {});
      } else if (typeof (Cesium as any).createWorldTerrain === 'function') {
        viewerRef.current.terrainProvider = (Cesium as any).createWorldTerrain({
          requestWaterMask: false,
          requestVertexNormals: true,
        });
      }
    }
  }, []);

  // Animate progress along route
  useEffect(() => {
    startTime.current = Date.now();
    let frameId: number;
    const animate = () => {
      const elapsed = (Date.now() - startTime.current) / 1000;
      const p = Math.min(elapsed / durationSeconds, 1);
      setProgress(p);
      if (p < 1) frameId = requestAnimationFrame(animate);
    };
    frameId = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(frameId);
  }, [routeCoordinates, durationSeconds]);

  // When route changes, fly the camera to start of route
  useEffect(() => {
    if (viewerRef.current && routeCoordinates.length > 0) {
      const start = routeCoordinates[0];
      viewerRef.current.camera.flyTo({
        destination: Cesium.Cartesian3.fromDegrees(start[0], start[1], 5000),
        duration: 2,
      });
    }
  }, [routeCoordinates]);

  // Follow the vehicle
  useEffect(() => {
    if (!viewerRef.current) return;

    const viewer = viewerRef.current;

    // Called every frame
    const onTick = () => {
      if (vehicleRef.current) {
        const position = vehicleRef.current.position?.getValue(viewer.clock.currentTime);
        if (position) {
          // Camera 500m behind and 200m above the vehicle
          viewer.camera.lookAt(
            position,
            new Cesium.HeadingPitchRange(
              0,                          // heading (0 = face north; use vehicle heading for follow)
              Cesium.Math.toRadians(-25), // pitch (tilt down)
              500                         // range (distance from vehicle in meters)
            )
          );
        }
      }
    };

    viewer.scene.preRender.addEventListener(onTick);
    return () => {
      if (!viewer.isDestroyed()) {
        viewer.scene.preRender.removeEventListener(onTick);
      }
    };
  }, []);

  const validCoords = routeCoordinates.length > 0 ? routeCoordinates : [[0, 0], [0, 0]];
  const position = getPositionAlongRoute(validCoords as [number, number][], progress);
  const heading = getHeadingAlongRoute(validCoords as [number, number][], progress);

  return (
    <Viewer
      ref={(e) => {
        viewerRef.current = e?.cesiumElement || null;
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
      {/* Route polyline */}
      {routeCoordinates.length > 1 && (
        <Entity>
          <PolylineGraphics
            positions={Cesium.Cartesian3.fromDegreesArray(routeCoordinates.flat())}
            width={4}
            material={Cesium.Color.fromCssColorString('#4F46E5')}
            clampToGround={true} // ensures line sits on road/terrain
          />
        </Entity>
      )}

      {/* Vehicle */}
      <Entity
        ref={(e) => {
          vehicleRef.current = e?.cesiumElement || null;
        }}
        position={position}
        orientation={
          new Cesium.ConstantProperty(
            Cesium.Transforms.headingPitchRollQuaternion(
              position,
              new Cesium.HeadingPitchRoll(Cesium.Math.toRadians(heading), 0, 0)
            )
          )
        }
      >
        <BoxGraphics
          dimensions={new Cesium.Cartesian3(20, 10, 8)}
          material={Cesium.Color.fromCssColorString('#4F46E5')}
        />
      </Entity>
    </Viewer>
  );
}

export { Globe3D };
