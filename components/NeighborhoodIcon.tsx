'use client';

import { useEffect, useState } from 'react';
import { neighborhoodToGeoJSONSlug } from '@/lib/neighborhoodMapping';

interface NeighborhoodIconProps {
  slug: string;
  className?: string;
}

interface GeoJSONFeature {
  type: string;
  geometry: {
    type: string;
    coordinates: number[][][] | number[][][][];
  };
  properties: {
    slug: string;
    ntaname: string;
    borough: string;
  };
}

interface GeoJSONData {
  type: string;
  features: GeoJSONFeature[];
}

let cachedGeoJSON: GeoJSONData | null = null;

function simplifyCoordinates(coords: number[][]): number[][] {
  if (coords.length <= 15) return coords;

  const step = Math.ceil(coords.length / 15);
  const simplified: number[][] = [];

  for (let i = 0; i < coords.length; i += step) {
    simplified.push(coords[i]);
  }

  if (simplified[simplified.length - 1] !== coords[coords.length - 1]) {
    simplified.push(coords[coords.length - 1]);
  }

  return simplified;
}

function coordinatesToPath(coordinates: number[][][]): string {
  const firstRing = coordinates[0];
  const simplified = simplifyCoordinates(firstRing);

  const lngs = simplified.map(coord => coord[0]);
  const lats = simplified.map(coord => coord[1]);

  const minLng = Math.min(...lngs);
  const maxLng = Math.max(...lngs);
  const minLat = Math.min(...lats);
  const maxLat = Math.max(...lats);

  const width = maxLng - minLng;
  const height = maxLat - minLat;

  const normalized = simplified.map(coord => {
    const x = ((coord[0] - minLng) / width) * 100;
    const y = 100 - ((coord[1] - minLat) / height) * 100;
    return [x, y];
  });

  const pathData = normalized.map((point, i) => {
    const command = i === 0 ? 'M' : 'L';
    return `${command}${point[0].toFixed(2)},${point[1].toFixed(2)}`;
  }).join(' ') + ' Z';

  return pathData;
}

export default function NeighborhoodIcon({ slug, className = '' }: NeighborhoodIconProps) {
  const [pathData, setPathData] = useState<string | null>(null);

  useEffect(() => {
    async function loadGeoJSON() {
      try {
        if (!cachedGeoJSON) {
          const response = await fetch('/data/nyc-neighborhoods.geojson');
          cachedGeoJSON = await response.json();
        }

        const geoJSONSlug = neighborhoodToGeoJSONSlug[slug] || slug;
        const feature = cachedGeoJSON?.features.find(f => f.properties.slug === geoJSONSlug);

        if (feature && feature.geometry) {
          let coords: number[][][];

          if (feature.geometry.type === 'Polygon') {
            coords = feature.geometry.coordinates as number[][][];
          } else if (feature.geometry.type === 'MultiPolygon') {
            const multiCoords = feature.geometry.coordinates as number[][][][];
            coords = multiCoords[0];
          } else {
            return;
          }

          const path = coordinatesToPath(coords);
          setPathData(path);
        }
      } catch (error) {
        console.error('Failed to load neighborhood shape:', error);
      }
    }

    loadGeoJSON();
  }, [slug]);

  if (!pathData) {
    return (
      <div className={`${className} flex items-center justify-center`}>
        <div className="w-full h-full rounded" style={{background: 'rgba(100, 116, 139, 0.2)'}}></div>
      </div>
    );
  }

  return (
    <svg
      viewBox="0 0 100 100"
      className={className}
      preserveAspectRatio="xMidYMid meet"
    >
      <path
        d={pathData}
        fill="currentColor"
        opacity="0.6"
        strokeWidth="1.5"
        stroke="currentColor"
        vectorEffect="non-scaling-stroke"
      />
    </svg>
  );
}
