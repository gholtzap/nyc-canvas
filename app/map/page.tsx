'use client';

import { useEffect, useState, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import MapContainerWrapper from '@/components/map/MapContainerWrapper';
import NeighborhoodPanel from '@/components/map/NeighborhoodPanel';
import type { MapNeighborhood } from '@/types/map';

export default function MapPage() {
  const { data: session, status } = useSession();
  const authLoading = status === 'loading';
  const router = useRouter();
  const [neighborhoods, setNeighborhoods] = useState<MapNeighborhood[]>([]);
  const [selectedSlug, setSelectedSlug] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !session) {
      router.push('/login');
    }
  }, [session, authLoading, router]);

  useEffect(() => {
    if (session) {
      fetchNeighborhoods();
    }
  }, [session]);

  const fetchNeighborhoods = async () => {
    try {
      const res = await fetch('/api/neighborhoods');
      if (res.ok) {
        const data = await res.json();
        const mapped: MapNeighborhood[] = data.neighborhoods.map((n: any) => ({
          id: n.id,
          name: n.name,
          borough: n.borough,
          slug: n.slug,
          explored: n.userNeighborhood?.explored ?? false,
          exploredAt: n.userNeighborhood?.exploredAt ?? null,
          notes: n.userNeighborhood?.notes ?? null,
          photoCount: n.userNeighborhood?.photos?.length ?? 0,
        }));
        setNeighborhoods(mapped);
      }
    } catch (error) {
      console.error('Failed to fetch neighborhoods:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleNeighborhoodClick = useCallback((slug: string) => {
    setSelectedSlug((prev) => (prev === slug ? null : slug));
  }, []);

  const handleClosePanel = useCallback(() => {
    setSelectedSlug(null);
  }, []);

  const handleToggleExplored = useCallback(
    async (slug: string, currentExplored: boolean) => {
      try {
        const res = await fetch(`/api/neighborhoods/${slug}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ explored: !currentExplored }),
        });

        if (res.ok) {
          fetchNeighborhoods();
        }
      } catch (error) {
        console.error('Failed to toggle explored:', error);
      }
    },
    []
  );

  if (authLoading || loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="flex items-center gap-3">
          <div className="w-4 h-4 bg-lime-400 animate-pulse" style={{clipPath: 'polygon(2px 0, 100% 0, 100% calc(100% - 2px), calc(100% - 2px) 100%, 0 100%, 0 2px)', animationDelay: '0s'}}></div>
          <div className="w-4 h-4 bg-orange-400 animate-pulse" style={{clipPath: 'polygon(2px 0, 100% 0, 100% calc(100% - 2px), calc(100% - 2px) 100%, 0 100%, 0 2px)', animationDelay: '0.2s'}}></div>
          <div className="w-4 h-4 bg-lime-400 animate-pulse" style={{clipPath: 'polygon(2px 0, 100% 0, 100% calc(100% - 2px), calc(100% - 2px) 100%, 0 100%, 0 2px)', animationDelay: '0.4s'}}></div>
        </div>
      </div>
    );
  }

  const stats = {
    total: neighborhoods.length,
    explored: neighborhoods.filter((n) => n.explored).length,
  };

  return (
    <div className="h-[calc(100vh-64px)] relative">
      <MapContainerWrapper
        neighborhoods={neighborhoods}
        onNeighborhoodClick={handleNeighborhoodClick}
        selectedSlug={selectedSlug}
      />
      <NeighborhoodPanel
        slug={selectedSlug}
        onClose={handleClosePanel}
        onToggleExplored={handleToggleExplored}
      />

      <div className="absolute bottom-4 left-4 bg-slate-900/95 backdrop-blur-md border-2 border-lime-400/30 p-4 z-[1000] shadow-lg" style={{clipPath: 'polygon(8px 0, 100% 0, 100% calc(100% - 8px), calc(100% - 8px) 100%, 0 100%, 0 8px)'}}>
        <h3 className="text-xs font-display mb-3 text-lime-400 tracking-wide uppercase">Legend</h3>
        <div className="flex flex-col gap-2 text-xs font-mono">
          <div className="flex items-center gap-2">
            <div className="w-6 h-4 bg-lime-400 border border-lime-500" style={{clipPath: 'polygon(2px 0, 100% 0, 100% calc(100% - 2px), calc(100% - 2px) 100%, 0 100%, 0 2px)'}}></div>
            <span className="text-slate-300">Explored</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-6 h-4 bg-slate-600 border border-slate-700" style={{clipPath: 'polygon(2px 0, 100% 0, 100% calc(100% - 2px), calc(100% - 2px) 100%, 0 100%, 0 2px)'}}></div>
            <span className="text-slate-300">Unexplored</span>
          </div>
        </div>
      </div>

      <div className="absolute top-4 left-4 bg-slate-900/95 backdrop-blur-md border-2 border-orange-400/30 p-5 z-[1000] shadow-lg" style={{clipPath: 'polygon(8px 0, 100% 0, 100% calc(100% - 8px), calc(100% - 8px) 100%, 0 100%, 0 8px)'}}>
        <div className="text-center">
          <p className="text-3xl font-display text-orange-400 drop-shadow-[0_0_10px_rgba(255,107,53,0.5)]">
            {stats.explored}/{stats.total}
          </p>
          <p className="text-[10px] text-slate-400 font-mono uppercase tracking-wider mt-1">Neighborhoods Explored</p>
          <p className="text-lg font-display text-lime-400 mt-2">
            {stats.total > 0 ? Math.round((stats.explored / stats.total) * 100) : 0}%
          </p>
        </div>
      </div>
    </div>
  );
}
