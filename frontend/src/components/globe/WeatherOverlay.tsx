import React from 'react';
import { Entity, PolygonGraphics, LabelGraphics } from 'resium';
import { Cartesian3, Color, DistanceDisplayCondition } from 'cesium';

interface WeatherZone {
  id: string;
  name: string;
  category: 'Critical Heat' | 'Humid Corridor' | 'Optimal Chill';
  avgTemp: string;
  color: string;
  polygonDegrees: number[];
  center: { lon: number; lat: number };
}

const WEATHER_ZONES: WeatherZone[] = [
  {
    id: 'WZ-NORTH',
    name: 'Northern Heat Hazard Zone',
    category: 'Critical Heat',
    avgTemp: '39.4°C Ambient',
    color: '#DC2626',
    polygonDegrees: [
      73.5, 29.5,
      78.5, 29.5,
      77.8, 25.5,
      72.5, 25.5,
    ],
    center: { lon: 75.5, lat: 27.5 },
  },
  {
    id: 'WZ-WEST',
    name: 'Western Ghats Monsoonal Zone',
    category: 'Humid Corridor',
    avgTemp: '28.1°C • 88% Humidity',
    color: '#D97706',
    polygonDegrees: [
      72.5, 20.5,
      74.8, 20.2,
      75.5, 14.5,
      73.2, 14.8,
    ],
    center: { lon: 74.0, lat: 17.5 },
  },
  {
    id: 'WZ-SOUTH',
    name: 'Deccan Thermal Stability Zone',
    category: 'Optimal Chill',
    avgTemp: '22.0°C Nominal',
    color: '#0D9488',
    polygonDegrees: [
      76.5, 16.5,
      80.5, 16.5,
      79.5, 12.0,
      75.5, 12.0,
    ],
    center: { lon: 78.0, lat: 14.2 },
  },
];

interface WeatherOverlayProps {
  visible: boolean;
}

export const WeatherOverlay: React.FC<WeatherOverlayProps> = ({ visible }) => {
  if (!visible) return null;

  return (
    <>
      {WEATHER_ZONES.map((zone) => {
        const positions = Cartesian3.fromDegreesArray(zone.polygonDegrees);
        const baseColor = Color.fromCssColorString(zone.color).withAlpha(0.22);
        const centerPos = Cartesian3.fromDegrees(zone.center.lon, zone.center.lat, 8000);

        return (
          <Entity key={zone.id} name={zone.name}>
            <PolygonGraphics
              hierarchy={positions as any}
              material={baseColor}
              outline={true}
              outlineColor={Color.fromCssColorString(zone.color).withAlpha(0.6)}
              outlineWidth={1.5}
            />
            <Entity position={centerPos}>
              <LabelGraphics
                text={`⚠️ ${zone.name}\n${zone.avgTemp}`}
                font="10px Inter, sans-serif"
                fillColor={Color.WHITE}
                outlineColor={Color.fromCssColorString('#111827')}
                outlineWidth={2}
                style={2}
                distanceDisplayCondition={new DistanceDisplayCondition(0, 4500000)}
              />
            </Entity>
          </Entity>
        );
      })}
    </>
  );
};
