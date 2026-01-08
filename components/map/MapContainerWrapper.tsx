'use client';

import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import type { MapNeighborhood, NeighborhoodGeoJSON } from '@/types/map';

// Dynamic import to avoid SSR issues with Leaflet
const NYCMap = dynamic(() => import('./NYCMap'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full flex items-center justify-center bg-gray-100">
      <p className="text-lg text-gray-600">Loading map...</p>
    </div>
  ),
});

interface MapContainerWrapperProps {
  neighborhoods: MapNeighborhood[];
  onNeighborhoodClick: (slug: string) => void;
  selectedSlug: string | null;
}

export default function MapContainerWrapper({
  neighborhoods,
  onNeighborhoodClick,
  selectedSlug,
}: MapContainerWrapperProps) {
  const [geoJSON, setGeoJSON] = useState<NeighborhoodGeoJSON | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch('/data/nyc-neighborhoods.geojson')
      .then((res) => {
        if (!res.ok) throw new Error('Failed to load map data');
        return res.json();
      })
      .then((data) => {
        setGeoJSON(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Error loading GeoJSON:', err);
        setError('Failed to load map data');
        setLoading(false);
      });
  }, []);

  if (error) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-gray-100">
        <div className="text-center">
          <p className="text-red-600 font-semibold mb-2">Error Loading Map</p>
          <p className="text-gray-600">{error}</p>
        </div>
      </div>
    );
  }

  if (loading || !geoJSON) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-gray-100">
        <p className="text-lg text-gray-600">Loading map data...</p>
      </div>
    );
  }

  return (
    <NYCMap
      geoJSON={geoJSON}
      neighborhoods={neighborhoods}
      onNeighborhoodClick={onNeighborhoodClick}
      selectedSlug={selectedSlug}
    />
  );
}
