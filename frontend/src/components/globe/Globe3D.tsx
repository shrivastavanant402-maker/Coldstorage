import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Viewer } from 'resium';
import * as Cesium from 'cesium';
import {
  Ion,
  Cartesian3,
  Math as CesiumMath,
  Viewer as CesiumViewer,
  Entity as CesiumEntity,
} from 'cesium';
import { motion, AnimatePresence } from 'framer-motion';
import { Thermometer, Navigation, RotateCcw, ShieldCheck, Play } from 'lucide-react';
import { RouteLayer, RoutePathData } from './RouteLayer';
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
  selectedRouteId?: string | null;
  height?: string;
  onRouteSelected?: (route: RoutePathData | null) => void;
}

export const Globe3D: React.FC<Globe3DProps> = ({
  routes = MOCK_INDIAN_ROUTES,
  selectedRouteId,
  height = '460px',
  onRouteSelected,
}) => {
  const viewerRef = useRef<{ cesiumElement?: CesiumViewer } | null>(null);
  const vehicleEntityRef = useRef<CesiumEntity | null>(null);
  const [viewerReady, setViewerReady] = useState(false);

  const [selectedRoute, setSelectedRoute] = useState<RoutePathData | null>(() => {
    if (selectedRouteId) {
      return routes.find((r) => r.id === selectedRouteId) || null;
    }
    return null;
  });

  const [showWeather, setShowWeather] = useState(true);
  const [showShipment, setShowShipment] = useState(true);
  const [modelAvailable, setModelAvailable] = useState<boolean>(true);
  const modelAvailableRef = useRef<boolean>(true);

  // Probe 3D truck model availability and fallback if missing
  useEffect(() => {
    fetch('/assets/truck.glb', { method: 'HEAD' })
      .then((res) => {
        const ok = res.ok;
        modelAvailableRef.current = ok;
        setModelAvailable(ok);
        if (!ok) {
          console.warn('Vehicle 3D model not found at /assets/truck.glb, falling back to point marker.');
        }
      })
      .catch((err) => {
        console.warn('Vehicle 3D model probe failed, falling back to point marker:', err);
        modelAvailableRef.current = false;
        setModelAvailable(false);
      });
  }, []);

  // Enable 3D World Terrain with vertex normals
  useEffect(() => {
    const viewer = viewerRef.current?.cesiumElement;
    if (viewer) {
      if (typeof Cesium.createWorldTerrain === 'function') {
        viewer.terrainProvider = Cesium.createWorldTerrain({
          requestWaterMask: false,
          requestVertexNormals: true,
        });
        console.log('Terrain provider set:', viewer.terrainProvider);
      } else if (typeof (Cesium as any).createWorldTerrainAsync === 'function') {
        (Cesium as any).createWorldTerrainAsync({
          requestWaterMask: false,
          requestVertexNormals: true,
        }).then((provider: any) => {
          if (viewer && !viewer.isDestroyed() && provider) {
            viewer.terrainProvider = provider;
            console.log('Terrain provider set:', viewer.terrainProvider);
          }
        }).catch(() => {});
      }
    }
  }, [viewerReady]);

  /**
   * Starts smooth vehicle movement along the route and locks camera to close chase view.
   * Requirement 1: SampledPositionProperty with HermitePolynomialApproximation & CLAMP_TO_GROUND
   * Requirement 2: VelocityOrientationProperty for facing direction of travel
   * Requirement 3: viewer.trackedEntity with close-up chase-cam (viewFrom offset)
   * Requirement 4: Deselection & reselection restarts cleanly from beginning
   * Requirement 5: Graceful fallback without throwing if terrain/setup fails
   */
  const startRouteAnimation = useCallback((route: RoutePathData) => {
    const viewer = viewerRef.current?.cesiumElement;
    if (!viewer || viewer.isDestroyed()) return;

    try {
      // 1. Stop previous tracking and clear existing vehicle
      if (viewer.trackedEntity) {
        viewer.trackedEntity = undefined;
      }
      if (vehicleEntityRef.current) {
        viewer.entities.remove(vehicleEntityRef.current);
        vehicleEntityRef.current = null;
      }

      const existingVehicle = viewer.entities.getById('live-route-vehicle');
      if (existingVehicle) {
        viewer.entities.remove(existingVehicle);
      }

      if (!route || !route.coordinates || route.coordinates.length < 2) return;

      // 2. Set up SampledPositionProperty scaled with route distance_km:
      // durationSeconds = clamp(distance_km / 8, 45, 120)
      const clamp = (val: number, min: number, max: number) => Math.min(Math.max(val, min), max);

      let distanceKm = Number(route.distanceKm) || 0;
      if (distanceKm <= 0 && route.coordinates && route.coordinates.length > 1) {
        let totalKm = 0;
        const toRad = (deg: number) => (deg * Math.PI) / 180;
        for (let i = 0; i < route.coordinates.length - 1; i++) {
          const p1 = route.coordinates[i];
          const p2 = route.coordinates[i + 1];
          const lat1 = typeof p1.lat === 'number' ? p1.lat : (p1 as any)[1];
          const lon1 = typeof p1.lon === 'number' ? p1.lon : (p1 as any)[0];
          const lat2 = typeof p2.lat === 'number' ? p2.lat : (p2 as any)[1];
          const lon2 = typeof p2.lon === 'number' ? p2.lon : (p2 as any)[0];
          const dLat = toRad(lat2 - lat1);
          const dLon = toRad(lon2 - lon1);
          const a =
            Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
            Math.sin(dLon / 2) * Math.sin(dLon / 2);
          const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
          totalKm += 6371 * c;
        }
        distanceKm = Math.round(totalKm);
      }

      const DURATION_SECONDS = clamp(distanceKm / 8, 45, 120);
      const startJulian = Cesium.JulianDate.now();
      const stopJulian = Cesium.JulianDate.addSeconds(
        startJulian,
        DURATION_SECONDS,
        new Cesium.JulianDate()
      );

      // Configure viewer clock
      viewer.clock.startTime = startJulian.clone();
      viewer.clock.stopTime = stopJulian.clone();
      viewer.clock.currentTime = startJulian.clone();
      viewer.clock.clockRange = Cesium.ClockRange.LOOP_STOP;
      viewer.clock.multiplier = 1;
      viewer.clock.shouldAnimate = true;

      const positionProperty = new Cesium.SampledPositionProperty();
      // HermitePolynomialApproximation provides smooth curves between waypoints
      positionProperty.setInterpolationOptions({
        interpolationDegree: 2,
        interpolationAlgorithm: Cesium.HermitePolynomialApproximation,
      });

      const waypoints = route.coordinates;
      const numPoints = waypoints.length;

      // Sample evenly up to 200 checkpoints across waypoints to balance fidelity and performance
      const maxSamples = 200;
      const step = numPoints > maxSamples ? (numPoints - 1) / (maxSamples - 1) : 1;
      const sampleIndices: number[] = [];
      if (numPoints <= maxSamples) {
        for (let i = 0; i < numPoints; i++) sampleIndices.push(i);
      } else {
        for (let i = 0; i < maxSamples - 1; i++) {
          sampleIndices.push(Math.round(i * step));
        }
        sampleIndices.push(numPoints - 1);
      }

      sampleIndices.forEach((wpIdx, sampleIdx) => {
        const timeOffset = (sampleIdx / (sampleIndices.length - 1)) * DURATION_SECONDS;
        const time = Cesium.JulianDate.addSeconds(
          startJulian,
          timeOffset,
          new Cesium.JulianDate()
        );

        const wp: any = waypoints[wpIdx];
        const lon = typeof wp.lon === 'number' ? wp.lon : (typeof wp.lng === 'number' ? wp.lng : wp[0]);
        const lat = typeof wp.lat === 'number' ? wp.lat : wp[1];

        // Sample terrain height so the vehicle cleanly tracks the surface
        let elev = 0;
        if (viewer.scene?.globe) {
          elev =
            viewer.scene.globe.getHeight(Cesium.Cartographic.fromDegrees(lon, lat)) || 0;
        }

        const position = Cesium.Cartesian3.fromDegrees(lon, lat, elev);
        positionProperty.addSample(time, position);
      });

      // Heading offset calculation for GLTF model node rotation (+90 deg around Z)
      const rawOrientation = new Cesium.VelocityOrientationProperty(positionProperty);
      const headingOffsetQuat = Cesium.Quaternion.fromHeadingPitchRoll(
        new Cesium.HeadingPitchRoll(Cesium.Math.toRadians(90), 0, 0)
      );

      const orientationProperty = new Cesium.CallbackProperty((time, result) => {
        const rawQuat = rawOrientation.getValue(time, result as Cesium.Quaternion);
        if (!rawQuat) return undefined;
        return Cesium.Quaternion.multiply(
          rawQuat,
          headingOffsetQuat,
          (result as Cesium.Quaternion) || new Cesium.Quaternion()
        );
      }, false);

      // 3. Create vehicle entity with VelocityOrientationProperty offset and clampToGround
      const vehicle = viewer.entities.add({
        id: 'live-route-vehicle',
        name: `Reefer Unit: ${route.name}`,
        position: positionProperty,
        orientation: orientationProperty,
        // Third-person chase cam offset: 60m behind, 22m above in vehicle's local frame
        viewFrom: new Cesium.Cartesian3(-60, 0, 22),
        // 3D delivery truck model with CLAMP_TO_GROUND height reference
        model: modelAvailableRef.current
          ? {
              uri: '/assets/truck.glb',
              minimumPixelSize: 48,
              maximumScale: 4000,
              scale: 1.0,
              heightReference: Cesium.HeightReference.CLAMP_TO_GROUND,
            }
          : undefined,
        point: !modelAvailableRef.current
          ? {
              pixelSize: 15,
              color: Cesium.Color.fromCssColorString(route.color || '#3B82F6'),
              outlineColor: Cesium.Color.WHITE,
              outlineWidth: 2.5,
              heightReference: Cesium.HeightReference.CLAMP_TO_GROUND,
            }
          : undefined,
        label: {
          text: `🚛 ${route.name.split(' (')[0]} [${Math.round(DURATION_SECONDS)}s Pace]`,
          font: 'bold 11px Inter, sans-serif',
          fillColor: Cesium.Color.WHITE,
          outlineColor: Cesium.Color.fromCssColorString('#111827'),
          outlineWidth: 3,
          style: Cesium.LabelStyle.FILL_AND_OUTLINE,
          pixelOffset: new Cesium.Cartesian2(0, -28),
          heightReference: Cesium.HeightReference.CLAMP_TO_GROUND,
          distanceDisplayCondition: new Cesium.DistanceDisplayCondition(0, 4000000),
        },
        path: {
          show: true,
          leadTime: 0,
          trailTime: DURATION_SECONDS,
          width: 4,
          material: new Cesium.PolylineGlowMaterialProperty({
            glowPower: 0.3,
            color: Cesium.Color.fromCssColorString(route.color || '#3B82F6'),
          }),
        },
      });

      vehicleEntityRef.current = vehicle;

      // 4. Follow vehicle at close range
      viewer.trackedEntity = vehicle;
      viewer.flyTo(vehicle, {
        offset: new Cesium.HeadingPitchRange(0, Cesium.Math.toRadians(-22), 140),
        duration: 1.5,
      }).catch(() => {});
    } catch (err) {
      // Requirement 5 Fallback: do not throw, show static polyline route
      console.warn('Fallback: Route animation tracking failed to initialize, keeping static polyline:', err);
    }
  }, []);

  // Vehicle animation lifecycle strictly tied to selectedRouteId prop
  useEffect(() => {
    const viewer = viewerRef.current?.cesiumElement;

    // Early return / no-op if selectedRouteId is null or undefined (Requirement 1)
    if (!selectedRouteId) {
      if (viewer && !viewer.isDestroyed()) {
        if (viewer.trackedEntity) {
          viewer.trackedEntity = undefined;
        }
        if (vehicleEntityRef.current) {
          viewer.entities.remove(vehicleEntityRef.current);
          vehicleEntityRef.current = null;
        }
        const existingVehicle = viewer.entities.getById('live-route-vehicle');
        if (existingVehicle) {
          viewer.entities.remove(existingVehicle);
        }
      }
      setSelectedRoute(null);
      return;
    }

    // A route was explicitly selected
    const found = routes.find((r) => r.id === selectedRouteId);
    if (!found) {
      setSelectedRoute(null);
      return;
    }

    setSelectedRoute(found);
    if (viewerReady && showShipment) {
      startRouteAnimation(found);
    }
  }, [selectedRouteId, routes, viewerReady, showShipment, startRouteAnimation]);

  // Cleanup vehicle tracking on unmount
  useEffect(() => {
    return () => {
      const viewer = viewerRef.current?.cesiumElement;
      if (viewer && !viewer.isDestroyed()) {
        viewer.trackedEntity = undefined;
        if (vehicleEntityRef.current) {
          viewer.entities.remove(vehicleEntityRef.current);
          vehicleEntityRef.current = null;
        }
        const existingVehicle = viewer.entities.getById('live-route-vehicle');
        if (existingVehicle) {
          viewer.entities.remove(existingVehicle);
        }
      }
    };
  }, []);

  const handleRouteClick = (route: RoutePathData) => {
    if (onRouteSelected) {
      onRouteSelected(route);
    } else {
      setSelectedRoute(route);
      if (showShipment) {
        startRouteAnimation(route);
      }
    }
    // Reselecting same route: restart animation from beginning (Requirement 4)
    if (selectedRouteId === route.id || selectedRoute?.id === route.id) {
      startRouteAnimation(route);
    }
  };

  const resetCamera = () => {
    const viewer = viewerRef.current?.cesiumElement;
    if (!viewer) return;

    // Stop tracking and clear vehicle
    if (viewer.trackedEntity) {
      viewer.trackedEntity = undefined;
    }
    if (vehicleEntityRef.current) {
      viewer.entities.remove(vehicleEntityRef.current);
      vehicleEntityRef.current = null;
    }
    setSelectedRoute(null);
    if (onRouteSelected) onRouteSelected(null);

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

  const toggleShipmentTracking = () => {
    const viewer = viewerRef.current?.cesiumElement;
    const nextState = !showShipment;
    setShowShipment(nextState);

    if (!nextState) {
      if (viewer) {
        viewer.trackedEntity = undefined;
        if (vehicleEntityRef.current) {
          viewer.entities.remove(vehicleEntityRef.current);
          vehicleEntityRef.current = null;
        }
      }
    } else if (selectedRoute) {
      startRouteAnimation(selectedRoute);
    }
  };

  return (
    <div
      className="relative w-full rounded-card overflow-hidden border border-[#E5E7EB] bg-[#0B0F19] shadow-subtle select-none"
      style={{ height }}
    >
      <Viewer
        ref={(e) => {
          const v = e?.cesiumElement;
          viewerRef.current = { cesiumElement: v };
          if (v && !viewerReady) {
            setViewerReady(true);
          }
        }}
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
          onClick={toggleShipmentTracking}
          className={`px-3 py-1 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-all shadow-sm border ${
            showShipment
              ? 'bg-white text-gray-900 border-[#E5E7EB]'
              : 'bg-[#111827]/80 text-gray-400 border-gray-700 hover:text-white'
          }`}
        >
          <Navigation className="w-3.5 h-3.5 text-[#4F46E5]" />
          {showShipment ? 'Chase-Cam Active' : 'Enable Reefer Chase-Cam'}
        </button>

        {selectedRoute && showShipment && (
          <button
            onClick={() => startRouteAnimation(selectedRoute)}
            className="px-2.5 py-1 rounded-lg text-xs font-medium flex items-center gap-1 bg-white/90 text-gray-800 hover:text-black border border-[#E5E7EB] shadow-sm"
            title="Restart Route Animation From Beginning"
          >
            <Play className="w-3 h-3 text-[#4F46E5]" />
            Restart
          </button>
        )}

        <button
          onClick={resetCamera}
          className="p-1.5 rounded-lg bg-white/90 text-gray-700 hover:text-black border border-[#E5E7EB] shadow-sm"
          title="Reset Camera View & Deselect"
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
                <span className="text-gray-400 block text-[9px]">Sim Duration</span>
                <span className="font-semibold text-indigo-600">
                  {Math.round(Math.min(Math.max((selectedRoute.distanceKm || 0) / 8, 45), 120))}s loop
                </span>
              </div>
              <div className="p-1.5 bg-[#F9FAFB] rounded border">
                <span className="text-gray-400 block text-[9px]">Transit Hours</span>
                <span className="font-semibold text-gray-900">{selectedRoute.transitHours} hrs</span>
              </div>
              <div className="p-1.5 bg-[#F9FAFB] rounded border">
                <span className="text-gray-400 block text-[9px]">ML Risk</span>
                <span className="font-semibold text-[#4F46E5]">{selectedRoute.riskScore}/100</span>
              </div>
            </div>

            <div className="flex items-center justify-between text-[10px] text-gray-500 pt-1.5 border-t border-[#E5E7EB]">
              <span>Waypoints: {selectedRoute.coordinates.length} stops</span>
              <span className="font-medium text-emerald-600 flex items-center gap-0.5">
                <ShieldCheck className="w-3 h-3" /> Chase-Cam Active
              </span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Globe3D;

