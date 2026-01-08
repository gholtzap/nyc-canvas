'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';

interface Photo {
  id: number;
  filename: string;
  path: string;
}

interface NeighborhoodDetail {
  id: number;
  name: string;
  borough: string;
  slug: string;
  userNeighborhood: {
    explored: boolean;
    exploredAt: string | null;
    notes: string | null;
    photos: Photo[];
  } | null;
}

interface NeighborhoodPanelProps {
  slug: string | null;
  onClose: () => void;
  onToggleExplored: (slug: string, explored: boolean) => void;
}

export default function NeighborhoodPanel({
  slug,
  onClose,
  onToggleExplored,
}: NeighborhoodPanelProps) {
  const [neighborhood, setNeighborhood] = useState<NeighborhoodDetail | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!slug) {
      setNeighborhood(null);
      return;
    }

    setLoading(true);
    fetch(`/api/neighborhoods/${slug}`)
      .then((res) => res.json())
      .then((data) => {
        setNeighborhood(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [slug]);

  if (!slug) return null;

  const isExplored = neighborhood?.userNeighborhood?.explored ?? false;
  const photos = neighborhood?.userNeighborhood?.photos ?? [];
  const notes = neighborhood?.userNeighborhood?.notes;

  return (
    <div className="absolute top-4 right-4 w-80 bg-white rounded-lg shadow-xl z-[1000] max-h-[calc(100vh-8rem)] overflow-hidden flex flex-col">
      <div className="p-4 border-b flex justify-between items-start">
        <div className="flex-1">
          {loading ? (
            <div className="animate-pulse">
              <div className="h-6 w-32 bg-gray-200 rounded mb-2"></div>
              <div className="h-4 w-20 bg-gray-200 rounded"></div>
            </div>
          ) : (
            <>
              <h2 className="text-xl font-bold text-gray-900">{neighborhood?.name}</h2>
              <p className="text-gray-600">{neighborhood?.borough}</p>
            </>
          )}
        </div>
        <button
          onClick={onClose}
          className="text-gray-400 hover:text-gray-600 text-2xl leading-none ml-2"
          aria-label="Close panel"
        >
          ×
        </button>
      </div>

      {!loading && neighborhood && (
        <div className="flex-1 overflow-y-auto p-4">
          <button
            onClick={() => onToggleExplored(slug, isExplored)}
            className={`w-full py-2 rounded font-semibold mb-4 transition ${
              isExplored
                ? 'bg-green-600 text-white hover:bg-green-700'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            {isExplored ? '✓ Explored' : 'Mark as Explored'}
          </button>

          {neighborhood.userNeighborhood?.exploredAt && (
            <p className="text-xs text-gray-500 mb-4">
              Explored on{' '}
              {new Date(neighborhood.userNeighborhood.exploredAt).toLocaleDateString()}
            </p>
          )}

          {notes && (
            <div className="mb-4">
              <h3 className="font-semibold mb-2 text-gray-900">Notes</h3>
              <p className="text-gray-600 text-sm whitespace-pre-wrap">{notes}</p>
            </div>
          )}

          {photos.length > 0 && (
            <div className="mb-4">
              <h3 className="font-semibold mb-2 text-gray-900">
                Photos ({photos.length})
              </h3>
              <div className="grid grid-cols-2 gap-2">
                {photos.slice(0, 4).map((photo) => (
                  <div
                    key={photo.id}
                    className="relative h-20 rounded overflow-hidden bg-gray-100"
                  >
                    <Image
                      src={photo.path}
                      alt={photo.filename}
                      fill
                      className="object-cover"
                    />
                  </div>
                ))}
              </div>
              {photos.length > 4 && (
                <p className="text-xs text-gray-500 mt-2">
                  + {photos.length - 4} more photo{photos.length - 4 !== 1 ? 's' : ''}
                </p>
              )}
            </div>
          )}

          <Link
            href={`/neighborhoods/${slug}`}
            className="block text-center text-blue-600 hover:underline font-medium"
          >
            View Full Details →
          </Link>
        </div>
      )}
    </div>
  );
}
