// components/ShipmentMarker.tsx
import { Entity, ModelGraphics, PointGraphics } from 'resium';
import * as Cesium from 'cesium';
import { useEffect, useRef, useState } from 'react';
import { getPositionAlongRoute, getHeadingAlongRoute } from '../utils/interpolateAlongRoute';

interface Props {
  routeCoordinates: number[][];   // [[lon, lat, elev], ...]
  viewer: Cesium.Viewer | null;
  durationSeconds?: number;
}

export default function ShipmentMarker({
  routeCoordinates,
  viewer,
  durationSeconds = 60
}: Props) {
  const [progress, setProgress] = useState(0);
  const progressRef = useRef(0);
  const startRef = useRef(Date.now());

  // Animation loop over 20 seconds using requestAnimationFrame
  useEffect(() => {
    startRef.current = Date.now();
    progressRef.current = 0;
    setProgress(0);

    let frameId: number;
    const animate = () => {
      const elapsed = (Date.now() - startRef.current) / 1000;
      const p = Math.min(elapsed / durationSeconds, 1);
      progressRef.current = p;
      setProgress(p);
      if (p < 1) frameId = requestAnimationFrame(animate);
    };
    frameId = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(frameId);
  }, [routeCoordinates, durationSeconds]);

  // Camera follow effect (Requirement 4)
  useEffect(() => {
    if (!viewer) return;

    const tick = () => {
      if (routeCoordinates.length < 2) return;
      const heading = getHeadingAlongRoute(routeCoordinates, progressRef.current);
      const pos = getPositionAlongRoute(routeCoordinates, progressRef.current, viewer);

      viewer.camera.lookAt(
        pos,
        new Cesium.HeadingPitchRange(
          Cesium.Math.toRadians(heading),  // dynamic camera heading matching vehicle direction
          Cesium.Math.toRadians(-22),      // close chase pitch angle
          140                              // 140m chase range
        )
      );
    };

    viewer.scene.preRender.addEventListener(tick);
    return () => {
      viewer.scene.preRender.removeEventListener(tick);
      if (viewer && !viewer.isDestroyed()) {
        viewer.camera.lookAtTransform(Cesium.Matrix4.IDENTITY);
      }
    };
  }, [viewer, routeCoordinates]);

  if (routeCoordinates.length < 2) return null;

  // Cesium CallbackProperty for reactive vehicle position and orientation
  const positionProperty = new Cesium.CallbackProperty(() => {
    return getPositionAlongRoute(routeCoordinates, progressRef.current, viewer);
  }, false) as unknown as Cesium.PositionProperty;

  const orientationProperty = new Cesium.CallbackProperty(() => {
    const pos = getPositionAlongRoute(routeCoordinates, progressRef.current, viewer);
    const heading = getHeadingAlongRoute(routeCoordinates, progressRef.current);
    // +90 deg offset aligns the GLTF model front bumper with vehicle velocity vector
    return Cesium.Transforms.headingPitchRollQuaternion(
      pos,
      new Cesium.HeadingPitchRoll(Cesium.Math.toRadians(heading + 90), 0, 0)
    );
  }, false);

  const [modelAvailable, setModelAvailable] = useState(true);

  // Probe truck model accessibility and fallback if missing
  useEffect(() => {
    fetch('/assets/truck.glb', { method: 'HEAD' })
      .then((res) => {
        if (!res.ok) setModelAvailable(false);
      })
      .catch(() => setModelAvailable(false));
  }, []);

  return (
    <Entity position={positionProperty} orientation={orientationProperty}>
      {modelAvailable ? (
        <ModelGraphics
          uri="/assets/truck.glb"
          minimumPixelSize={48}
          maximumScale={4000}
          scale={1.0}
          heightReference={Cesium.HeightReference.CLAMP_TO_GROUND}
        />
      ) : (
        <PointGraphics
          pixelSize={14}
          color={Cesium.Color.fromCssColorString('#3B82F6')}
          outlineColor={Cesium.Color.WHITE}
          outlineWidth={2}
          heightReference={Cesium.HeightReference.CLAMP_TO_GROUND}
        />
      )}
    </Entity>
  );
}

export { ShipmentMarker };


