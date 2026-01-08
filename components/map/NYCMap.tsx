'use client';

import { useEffect, useMemo } from 'react';
import { MapContainer, TileLayer, GeoJSON, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import type { MapNeighborhood, NeighborhoodGeoJSON, NeighborhoodFeature } from '@/types/map';

const NYC_CENTER: [number, number] = [40.7128, -74.006];
const NYC_BOUNDS: L.LatLngBoundsExpression = [
  [40.4774, -74.2591],
  [40.9176, -73.7004],
];

interface NYCMapProps {
  geoJSON: NeighborhoodGeoJSON;
  neighborhoods: MapNeighborhood[];
  onNeighborhoodClick: (slug: string) => void;
  selectedSlug: string | null;
}

function FlyToNeighborhood({
  selectedSlug,
  geoJSON,
}: {
  selectedSlug: string | null;
  geoJSON: NeighborhoodGeoJSON;
}) {
  const map = useMap();

  useEffect(() => {
    if (!selectedSlug) {
      // Reset to NYC view
      map.flyToBounds(NYC_BOUNDS, {
        padding: [50, 50],
        duration: 0.8,
      });
      return;
    }

    const feature = geoJSON.features.find((f) => f.properties.slug === selectedSlug);
    if (!feature) return;

    const bounds = L.geoJSON(feature as any).getBounds();
    map.flyToBounds(bounds, {
      padding: [50, 50],
      duration: 0.8,
    });
  }, [selectedSlug, geoJSON, map]);

  return null;
}

export default function NYCMap({
  geoJSON,
  neighborhoods,
  onNeighborhoodClick,
  selectedSlug,
}: NYCMapProps) {
  // Create a map of slug -> neighborhood data for quick lookup
  const exploredMap = useMemo(() => {
    const map = new Map<string, MapNeighborhood>();
    neighborhoods.forEach((n) => map.set(n.slug, n));
    return map;
  }, [neighborhoods]);

  const getStyle = (feature: any) => {
    if (!feature?.properties?.slug) {
      return {
        fillColor: '#9CA3AF',
        weight: 1,
        color: '#6B7280',
        fillOpacity: 0.5,
      };
    }

    const neighborhood = exploredMap.get(feature.properties.slug);
    const isExplored = neighborhood?.explored ?? false;
    const isSelected = feature.properties.slug === selectedSlug;

    return {
      fillColor: isExplored ? '#22C55E' : '#9CA3AF', // green vs gray
      weight: isSelected ? 3 : 1,
      color: isSelected ? '#2563EB' : '#6B7280', // blue border when selected
      fillOpacity: isSelected ? 0.8 : 0.6,
    };
  };

  const onEachFeature = (feature: any, layer: L.Layer) => {
    const slug = feature.properties?.slug;
    const name = feature.properties?.ntaname || 'Unknown';

    // Bind tooltip on hover
    layer.bindTooltip(name, {
      permanent: false,
      direction: 'center',
      className: 'neighborhood-tooltip',
    });

    // Add event listeners
    layer.on({
      click: () => {
        if (slug) onNeighborhoodClick(slug);
      },
      mouseover: (e: L.LeafletMouseEvent) => {
        const target = e.target as L.Path;
        target.setStyle({ fillOpacity: 0.9 });
      },
      mouseout: (e: L.LeafletMouseEvent) => {
        const target = e.target as L.Path;
        const style = getStyle(feature);
        target.setStyle({ fillOpacity: style.fillOpacity });
      },
    });
  };

  return (
    <MapContainer
      center={NYC_CENTER}
      zoom={11}
      maxBounds={NYC_BOUNDS}
      maxBoundsViscosity={1.0}
      className="w-full h-full"
      zoomControl={true}
      scrollWheelZoom={true}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <GeoJSON
        data={geoJSON as any}
        style={getStyle}
        onEachFeature={onEachFeature}
      />
      <FlyToNeighborhood selectedSlug={selectedSlug} geoJSON={geoJSON} />
    </MapContainer>
  );
}
