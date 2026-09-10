import React from 'react';
import { Entity, PolylineGraphics, PointGraphics, LabelGraphics } from 'resium';
import { Cartesian3, Color, PolylineGlowMaterialProperty, DistanceDisplayCondition } from 'cesium';

export interface RouteCoordinate {
  lon: number;
  lat: number;
  name?: string;
}

export interface RoutePathData {
  id: string;
  name: string;
  type: string;
  color: string;
  coordinates: RouteCoordinate[];
  distanceKm: number;
  transitHours: number;
  riskScore: number;
  riskLevel: 'Low' | 'Medium' | 'High';
  carbonKg: number;
}

interface RouteLayerProps {
  routes: RoutePathData[];
  selectedRouteId: string | null;
  onRouteClick: (route: RoutePathData) => void;
}

export const RouteLayer: React.FC<RouteLayerProps> = ({
  routes,
  selectedRouteId,
  onRouteClick,
}) => {
  return (
    <>
      {routes.map((route) => {
        const isSelected = route.id === selectedRouteId;
        const baseColor = Color.fromCssColorString(route.color);
        const polylinePositions = route.coordinates.map((c) =>
          Cartesian3.fromDegrees(c.lon, c.lat, 3000)
        );

        const origin = route.coordinates[0];
        const destination = route.coordinates[route.coordinates.length - 1];

        return (
          <React.Fragment key={route.id}>
            <Entity
              name={route.name}
              onClick={() => onRouteClick(route)}
            >
              <PolylineGraphics
                positions={polylinePositions}
                width={isSelected ? 6 : 3.5}
                clampToGround={true}
                material={
                  new PolylineGlowMaterialProperty({
                    glowPower: isSelected ? 0.35 : 0.18,
                    taperPower: 1.0,
                    color: isSelected ? baseColor.brighten(0.3, new Color()) : baseColor,
                  })
                }
              />
            </Entity>

            {/* Origin Pin (Green) */}
            <Entity
              position={Cartesian3.fromDegrees(origin.lon, origin.lat, 3500)}
              name={`Origin: ${origin.name || 'Origin'}`}
            >
              <PointGraphics
                pixelSize={isSelected ? 14 : 10}
                color={Color.fromCssColorString('#10B981')}
                outlineColor={Color.WHITE}
                outlineWidth={2}
                distanceDisplayCondition={new DistanceDisplayCondition(0, 8000000)}
              />
              <LabelGraphics
                text={origin.name || 'Origin'}
                font="11px Inter, sans-serif"
                fillColor={Color.WHITE}
                outlineColor={Color.BLACK}
                outlineWidth={2}
                style={2}
                pixelOffset={new Cartesian3(0, -16, 0) as any}
                distanceDisplayCondition={new DistanceDisplayCondition(0, 4000000)}
              />
            </Entity>

            {/* Destination Pin (Red) */}
            <Entity
              position={Cartesian3.fromDegrees(destination.lon, destination.lat, 3500)}
              name={`Destination: ${destination.name || 'Destination'}`}
            >
              <PointGraphics
                pixelSize={isSelected ? 14 : 10}
                color={Color.fromCssColorString('#EF4444')}
                outlineColor={Color.WHITE}
                outlineWidth={2}
                distanceDisplayCondition={new DistanceDisplayCondition(0, 8000000)}
              />
              <LabelGraphics
                text={destination.name || 'Destination'}
                font="11px Inter, sans-serif"
                fillColor={Color.WHITE}
                outlineColor={Color.BLACK}
                outlineWidth={2}
                style={2}
                pixelOffset={new Cartesian3(0, -16, 0) as any}
                distanceDisplayCondition={new DistanceDisplayCondition(0, 4000000)}
              />
            </Entity>
          </React.Fragment>
        );
      })}
    </>
  );
};
