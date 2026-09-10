import React, { useEffect, useState } from 'react';
import { Entity, PointGraphics, LabelGraphics } from 'resium';
import { Cartesian3, Color, DistanceDisplayCondition } from 'cesium';
import { RouteCoordinate } from './RouteLayer';

interface ShipmentMarkerProps {
  routeCoordinates: RouteCoordinate[];
  shipmentId?: string;
  cargoTemp?: number;
  speedMultiplier?: number;
}

export const ShipmentMarker: React.FC<ShipmentMarkerProps> = ({
  routeCoordinates,
  shipmentId = 'SHP-IND-1001',
  cargoTemp = 3.6,
  speedMultiplier = 0.05,
}) => {
  const [progress, setProgress] = useState(0.3);
  const [pulse, setPulse] = useState(12);

  useEffect(() => {
    let animationFrame: number;
    let lastTime = performance.now();

    const animate = (time: number) => {
      const delta = (time - lastTime) / 1000;
      lastTime = time;

      setProgress((prev) => (prev + delta * speedMultiplier) % 1);
      setPulse(11 + Math.sin(time / 250) * 4);

      animationFrame = requestAnimationFrame(animate);
    };

    animationFrame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animationFrame);
  }, [speedMultiplier]);

  if (routeCoordinates.length < 2) return null;

  const totalSegments = routeCoordinates.length - 1;
  const scaled = progress * totalSegments;
  const segmentIndex = Math.min(Math.floor(scaled), totalSegments - 1);
  const localT = scaled - segmentIndex;

  const start = routeCoordinates[segmentIndex];
  const end = routeCoordinates[segmentIndex + 1];

  const currentLon = start.lon + (end.lon - start.lon) * localT;
  const currentLat = start.lat + (end.lat - start.lat) * localT;
  const currentPosition = Cartesian3.fromDegrees(currentLon, currentLat, 5000);

  return (
    <>
      <Entity position={currentPosition}>
        <PointGraphics
          pixelSize={pulse * 1.8}
          color={Color.fromCssColorString('#0D9488').withAlpha(0.25)}
          outlineWidth={0}
        />
      </Entity>

      <Entity position={currentPosition} name={`Live Shipment: ${shipmentId}`}>
        <PointGraphics
          pixelSize={pulse}
          color={Color.fromCssColorString('#4F46E5')}
          outlineColor={Color.WHITE}
          outlineWidth={2.5}
        />
        <LabelGraphics
          text={`🚛 ${shipmentId} [${cargoTemp}°C • OK]`}
          font="bold 11px Inter, sans-serif"
          fillColor={Color.WHITE}
          outlineColor={Color.fromCssColorString('#111827')}
          outlineWidth={3}
          style={2}
          pixelOffset={new Cartesian3(0, -22, 0) as any}
          distanceDisplayCondition={new DistanceDisplayCondition(0, 4000000)}
        />
      </Entity>
    </>
  );
};
