// components/ShipmentMarker.tsx
import { Entity, BoxGraphics } from 'resium';
import * as Cesium from 'cesium';
import { useEffect, useRef, useState } from 'react';
import { getPositionAlongRoute, getHeadingAlongRoute } from '../utils/interpolateAlongRoute';

interface Props {
  routeCoordinates: [number, number][];
  durationSeconds?: number;
}

export default function ShipmentMarker({ routeCoordinates, durationSeconds = 20 }: Props) {
  const [progress, setProgress] = useState(0);
  const startTime = useRef<number>(Date.now());

  useEffect(() => {
    let frameId: number;
    const animate = () => {
      const elapsed = (Date.now() - startTime.current) / 1000;
      const p = Math.min(elapsed / durationSeconds, 1);
      setProgress(p);
      if (p < 1) frameId = requestAnimationFrame(animate);
    };
    frameId = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(frameId);
  }, [durationSeconds]);

  const position = getPositionAlongRoute(routeCoordinates, progress);
  const heading = getHeadingAlongRoute(routeCoordinates, progress);

  return (
    <Entity
      position={position}
      orientation={
        new Cesium.ConstantProperty(
          Cesium.Transforms.headingPitchRollQuaternion(
            position,
            new Cesium.HeadingPitchRoll(
              Cesium.Math.toRadians(heading),
              0,
              0
            )
          )
        )
      }
    >
      <BoxGraphics
        dimensions={new Cesium.Cartesian3(20, 10, 8)}
        material={Cesium.Color.fromCssColorString('#4F46E5')}
      />
    </Entity>
  );
}

export { ShipmentMarker };
