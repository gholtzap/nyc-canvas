import type { NeighborhoodFeature } from '@/types/map';

/**
 * Find a GeoJSON feature by slug
 * @param features Array of GeoJSON features
 * @param slug The neighborhood slug from the database
 * @returns The matching feature or undefined
 */
export function findGeoJSONFeatureBySlug(
  features: NeighborhoodFeature[],
  slug: string
): NeighborhoodFeature | undefined {
  return features.find((f) => f.properties.slug === slug);
}

/**
 * Check if a neighborhood has GeoJSON data available
 * @param features Array of GeoJSON features
 * @param slug The neighborhood slug from the database
 * @returns true if the neighborhood has boundary data
 */
export function hasGeoJSONData(
  features: NeighborhoodFeature[],
  slug: string
): boolean {
  return features.some((f) => f.properties.slug === slug);
}
