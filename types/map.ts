import type { Feature, MultiPolygon, Polygon } from 'geojson';

export interface NeighborhoodFeature extends Feature<Polygon | MultiPolygon> {
  properties: {
    ntaname: string;
    slug: string;
    borough: string;
  };
}

export interface NeighborhoodGeoJSON {
  type: 'FeatureCollection';
  features: NeighborhoodFeature[];
}

export interface MapNeighborhood {
  id: number;
  name: string;
  borough: string;
  slug: string;
  explored: boolean;
  exploredAt: string | null;
  notes: string | null;
  photoCount: number;
}
