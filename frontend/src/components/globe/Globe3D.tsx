import React, { useState, useRef } from 'react';
import { Viewer } from 'resium';
import { Ion, Cartesian3, Math as CesiumMath, Viewer as CesiumViewer } from 'cesium';
import { motion, AnimatePresence } from 'framer-motion';
import { Thermometer, Navigation, RotateCcw, ShieldCheck } from 'lucide-react';
import { RouteLayer, RoutePathData } from './RouteLayer';
import { ShipmentMarker } from './ShipmentMarker';
import { WeatherOverlay } from './WeatherOverlay';

Ion.defaultAccessToken =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJub25jZSI6IlZtVUVMNGVZQW1KVzd2NXkiLCJqdGkiOiI0NjZkNzg2NC1kYTJmLTQzNzUtOGI4Yi1lYjJhZmI0ODdkNzkiLCJpZCI6NDg2MTY1LCJpc3MiOiJodHRwczovL2FwaS5jZXNpdW0uY29tIiwiYXVkIjoidW5kZWZpbmVkX2RlZmF1bHQiLCJpYXQiOjE3ODkwMDQxNTJ9.m26bOjh6TQIoNobSNjpRWYpWLNw2XKmbbxXj3riwNug';

export const MOCK_INDIAN_ROUTES: RoutePathData[] = [
  {
    id: 'RT-WEST',
    name: 'Western Cold-Chain Expressway (Blue)',
    type: 'High-Speed Priority',
    color: '#3B82F6',
    coordinates: [
      { lon: 72.8777, lat: 19.076, name: 'Mumbai Hub' },
      { lon: 72.8311, lat: 21.1702, name: 'Surat Depot' },
      { lon: 73.1812, lat: 22.3072, name: 'Vadodara Hub' },
      { lon: 72.5714, lat: 23.0225, name: 'Ahmedabad Crossdock' },
      { lon: 75.7873, lat: 26.9124, name: 'Jaipur Terminal' },
      { lon: 77.1025, lat: 28.7041, name: 'Delhi NCR Port' },
    ],
    distanceKm: 1420,
    transitHours: 21.5,
    riskScore: 28.4,
    riskLevel: 'Medium',
    carbonKg: 890,
  },
  {
    id: 'RT-CENTRAL',
    name: 'Central Eco Thermal Corridor (Green)',
    type: 'Cold-Chain Eco Spine',
    color: '#10B981',
    coordinates: [
      { lon: 77.5946, lat: 12.9716, name: 'Bengaluru Tech Hub' },
      { lon: 78.4867, lat: 17.385, name: 'Hyderabad Depot' },
      { lon: 79.0882, lat: 21.1458, name: 'Nagpur Central Multi-modal' },
      { lon: 77.4126, lat: 23.2599, name: 'Bhopal Cold Station' },
      { lon: 78.0081, lat: 27.1767, name: 'Agra Bypass' },
      { lon: 77.1025, lat: 28.7041, name: 'Delhi NCR Port' },
    ],
    distanceKm: 2140,
    transitHours: 32.0,
    riskScore: 11.2,
    riskLevel: 'Low',
    carbonKg: 1120,
  },
  {
    id: 'RT-SOUTH',
    name: 'South-Western Pharma Corridor (Indigo)',
    type: 'Cryogenic Certified Link',
    color: '#6366F1',
    coordinates: [
      { lon: 80.2707, lat: 13.0827, name: 'Chennai Harbor' },
      { lon: 77.5946, lat: 12.9716, name: 'Bengaluru Tech Hub' },
      { lon: 74.4977, lat: 15.8497, name: 'Belagavi Junction' },
      { lon: 73.8567, lat: 18.5204, name: 'Pune Pharma Cluster' },
      { lon: 72.8777, lat: 19.076, name: 'Mumbai Hub' },
    ],
    distanceKm: 1340,
    transitHours: 20.0,
    riskScore: 14.5,
    riskLevel: 'Low',
    carbonKg: 810,
  },
];

interface Globe3DProps {
  routes?: RoutePathData[];
  height?: string;
  onRouteSelected?: (route: RoutePathData) => void;
}

export const Globe3D: React.FC<Globe3DProps> = ({
  routes = MOCK_INDIAN_ROUTES,
  height = '460px',
  onRouteSelected,
}) => {
  const viewerRef = useRef<{ cesiumElement?: CesiumViewer } | null>(null);
  const [selectedRoute, setSelectedRoute] = useState<RoutePathData>(routes[0]);
  const [showWeather, setShowWeather] = useState(true);
  const [showShipment, setShowShipment] = useState(true);

  const flyToRoute = (route: RoutePathData) => {
    const viewer = viewerRef.current?.cesiumElement;
    if (!viewer) return;

    const midIdx = Math.floor(route.coordinates.length / 2);
    const mid = route.coordinates[midIdx];

    viewer.camera.flyTo({
      destination: Cartesian3.fromDegrees(mid.lon, mid.lat, 1850000),
      duration: 1.8,
      orientation: {
        heading: CesiumMath.toRadians(0),
        pitch: CesiumMath.toRadians(-62),
        roll: 0.0,
      },
    });
  };

  const handleRouteClick = (route: RoutePathData) => {
    setSelectedRoute(route);
    flyToRoute(route);
    if (onRouteSelected) onRouteSelected(route);
  };

  const resetCamera = () => {
    const viewer = viewerRef.current?.cesiumElement;
    if (!viewer) return;

    viewer.camera.flyTo({
      destination: Cartesian3.fromDegrees(78.9629, 21.5937, 3400000),
      duration: 1.5,
      orientation: {
        heading: CesiumMath.toRadians(0),
        pitch: CesiumMath.toRadians(-80),
        roll: 0.0,
      },
    });
  };

  return (
    <div
      className="relative w-full rounded-card overflow-hidden border border-[#E5E7EB] bg-[#0B0F19] shadow-subtle select-none"
      style={{ height }}
    >
      <Viewer
        ref={viewerRef as any}
        full
        animation={false}
        timeline={false}
        baseLayerPicker={false}
        navigationHelpButton={false}
        geocoder={false}
        fullscreenButton={false}
        sceneModePicker={false}
        homeButton={false}
        infoBox={false}
        selectionIndicator={false}
      >
        <RouteLayer
          routes={routes}
          selectedRouteId={selectedRoute?.id || null}
          onRouteClick={handleRouteClick}
        />

        {showShipment && selectedRoute && (
          <ShipmentMarker
            routeCoordinates={selectedRoute.coordinates}
            shipmentId={`SHP-${selectedRoute.id.replace('RT-', '')}`}
            cargoTemp={3.4}
          />
        )}

        <WeatherOverlay visible={showWeather} />
      </Viewer>

      {/* Top Floating Controls */}
      <div className="absolute top-3 left-3 z-20 flex items-center gap-2">
        <button
          onClick={() => setShowWeather(!showWeather)}
          className={`px-3 py-1 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-all shadow-sm border ${
            showWeather
              ? 'bg-white text-gray-900 border-[#E5E7EB]'
              : 'bg-[#111827]/80 text-gray-400 border-gray-700 hover:text-white'
          }`}
        >
          <Thermometer className="w-3.5 h-3.5 text-[#D97706]" />
          Thermal Weather Layer
        </button>

        <button
          onClick={() => setShowShipment(!showShipment)}
          className={`px-3 py-1 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-all shadow-sm border ${
            showShipment
              ? 'bg-white text-gray-900 border-[#E5E7EB]'
              : 'bg-[#111827]/80 text-gray-400 border-gray-700 hover:text-white'
          }`}
        >
          <Navigation className="w-3.5 h-3.5 text-[#4F46E5]" />
          Live Reefer Tracker
        </button>

        <button
          onClick={resetCamera}
          className="p-1.5 rounded-lg bg-white/90 text-gray-700 hover:text-black border border-[#E5E7EB] shadow-sm"
          title="Reset Camera View"
        >
          <RotateCcw className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Bottom Route Selector */}
      <div className="absolute bottom-3 left-3 z-20 flex items-center gap-2">
        {routes.map((r) => (
          <button
            key={r.id}
            onClick={() => handleRouteClick(r)}
            className={`px-3 py-1 rounded-lg text-xs font-medium transition-all border backdrop-blur-sm ${
              selectedRoute?.id === r.id
                ? 'bg-white text-gray-900 border-white shadow-md font-semibold'
                : 'bg-black/40 text-gray-300 border-gray-700 hover:bg-black/60'
            }`}
          >
            <span
              className="inline-block w-2 h-2 rounded-full mr-1.5"
              style={{ backgroundColor: r.color }}
            />
            {r.name.split(' (')[0]}
          </button>
        ))}
      </div>

      {/* Route Info Overlay (Framer Motion) */}
      <AnimatePresence>
        {selectedRoute && (
          <motion.div
            key={selectedRoute.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            transition={{ duration: 0.2 }}
            className="absolute top-3 right-3 z-20 w-64 bg-white/95 backdrop-blur-md rounded-card border border-[#E5E7EB] p-3 shadow-lg text-xs"
          >
            <div className="flex items-center justify-between mb-1">
              <span className="font-semibold text-gray-900">{selectedRoute.name.split(' (')[0]}</span>
              <span
                className="w-2.5 h-2.5 rounded-full"
                style={{ backgroundColor: selectedRoute.color }}
              />
            </div>
            <p className="text-[10px] text-gray-500 mb-2">{selectedRoute.type}</p>

            <div className="grid grid-cols-2 gap-1.5 mb-2 text-[11px]">
              <div className="p-1.5 bg-[#F9FAFB] rounded border">
                <span className="text-gray-400 block text-[9px]">Distance</span>
                <span className="font-semibold text-gray-900">{selectedRoute.distanceKm} km</span>
              </div>
              <div className="p-1.5 bg-[#F9FAFB] rounded border">
                <span className="text-gray-400 block text-[9px]">Duration</span>
                <span className="font-semibold text-gray-900">{selectedRoute.transitHours} hrs</span>
              </div>
              <div className="p-1.5 bg-[#F9FAFB] rounded border">
                <span className="text-gray-400 block text-[9px]">CO2</span>
                <span className="font-semibold text-[#0D9488]">{selectedRoute.carbonKg} kg</span>
              </div>
              <div className="p-1.5 bg-[#F9FAFB] rounded border">
                <span className="text-gray-400 block text-[9px]">ML Risk</span>
                <span className="font-semibold text-[#4F46E5]">{selectedRoute.riskScore}/100</span>
              </div>
            </div>

            <div className="flex items-center justify-between text-[10px] text-gray-500 pt-1.5 border-t border-[#E5E7EB]">
              <span>Waypoints: {selectedRoute.coordinates.length} stops</span>
              <span className="font-medium text-emerald-600 flex items-center gap-0.5">
                <ShieldCheck className="w-3 h-3" /> Reefer Active
              </span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Globe3D;
