'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface UserNeighborhood {
  id: number;
  explored: boolean;
  exploredAt: string | null;
  notes: string | null;
  photos: any[];
}

interface Neighborhood {
  id: number;
  name: string;
  borough: string;
  slug: string;
  userNeighborhood: UserNeighborhood | null;
}

interface Stats {
  total: number;
  explored: number;
  unexplored: number;
}

export default function NeighborhoodsPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [neighborhoods, setNeighborhoods] = useState<Neighborhood[]>([]);
  const [stats, setStats] = useState<Stats>({ total: 0, explored: 0, unexplored: 0 });
  const [loading, setLoading] = useState(true);
  const [boroughFilter, setBoroughFilter] = useState('');
  const [exploredFilter, setExploredFilter] = useState('');

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    if (user) {
      fetchNeighborhoods();
    }
  }, [user, boroughFilter, exploredFilter]);

  const fetchNeighborhoods = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (boroughFilter) params.append('borough', boroughFilter);
      if (exploredFilter) params.append('explored', exploredFilter);

      const res = await fetch(`/api/neighborhoods?${params}`);
      if (res.ok) {
        const data = await res.json();
        setNeighborhoods(data.neighborhoods);
        setStats(data.stats);
      }
    } catch (error) {
      console.error('Failed to fetch neighborhoods:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleExplored = async (slug: string, currentExplored: boolean) => {
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
  };

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

  const boroughs = ['Manhattan', 'Brooklyn', 'Queens', 'Bronx', 'Staten Island'];

  return (
    <div className="min-h-screen relative">
      <div className="container mx-auto px-4 py-8 sm:py-12 relative z-10">
        <div className="mb-10 animate-slide-up">
          <h1 className="text-4xl sm:text-6xl font-display mb-3 text-lime-400 tracking-tight drop-shadow-[0_0_20px_rgba(203,245,66,0.3)]">
            NYC NEIGHBORHOODS
          </h1>
          <p className="text-slate-400 text-base font-mono">// Discover and track your journey through the city</p>
        </div>

        <div className="card p-6 sm:p-8 mb-8 bg-slate-800/70 border-lime-400/30 animate-slide-up" style={{animationDelay: '0.1s'}}>
          <h2 className="text-xl font-display mb-6 text-lime-400 tracking-wide">YOUR PROGRESS</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <div className="bg-slate-900/50 border-2 border-slate-700 p-5" style={{clipPath: 'polygon(8px 0, 100% 0, 100% calc(100% - 8px), calc(100% - 8px) 100%, 0 100%, 0 8px)'}}>
              <div className="flex items-baseline gap-2 mb-2">
                <span className="text-5xl font-display text-lime-400 drop-shadow-[0_0_10px_rgba(203,245,66,0.5)]">
                  {stats.explored}
                </span>
                <span className="text-2xl text-slate-600 font-bold">/ {stats.total}</span>
              </div>
              <p className="text-xs text-slate-400 font-mono uppercase tracking-wide">Neighborhoods Explored</p>
            </div>

            <div className="bg-slate-900/50 border-2 border-slate-700 p-5" style={{clipPath: 'polygon(8px 0, 100% 0, 100% calc(100% - 8px), calc(100% - 8px) 100%, 0 100%, 0 8px)'}}>
              <div className="flex items-baseline gap-2 mb-2">
                <span className="text-5xl font-display text-orange-400 drop-shadow-[0_0_10px_rgba(255,107,53,0.5)]">
                  {stats.total > 0 ? Math.round((stats.explored / stats.total) * 100) : 0}%
                </span>
              </div>
              <p className="text-xs text-slate-400 font-mono uppercase tracking-wide">Complete</p>
            </div>

            <div className="bg-slate-900/50 border-2 border-slate-700 p-5" style={{clipPath: 'polygon(8px 0, 100% 0, 100% calc(100% - 8px), calc(100% - 8px) 100%, 0 100%, 0 8px)'}}>
              <div className="flex items-baseline gap-2 mb-2">
                <span className="text-5xl font-display text-slate-300">
                  {stats.unexplored}
                </span>
              </div>
              <p className="text-xs text-slate-400 font-mono uppercase tracking-wide">Left to Explore</p>
            </div>
          </div>
        </div>

        <div className="flex gap-4 mb-8 flex-wrap animate-slide-up" style={{animationDelay: '0.2s'}}>
          <div className="flex-1 min-w-[200px]">
            <label className="block text-xs font-bold text-lime-400 mb-2 uppercase tracking-wide">Borough</label>
            <select
              value={boroughFilter}
              onChange={(e) => setBoroughFilter(e.target.value)}
              className="input-field"
            >
              <option value="">All Boroughs</option>
              {boroughs.map((borough) => (
                <option key={borough} value={borough}>
                  {borough}
                </option>
              ))}
            </select>
          </div>

          <div className="flex-1 min-w-[200px]">
            <label className="block text-xs font-bold text-lime-400 mb-2 uppercase tracking-wide">Status</label>
            <select
              value={exploredFilter}
              onChange={(e) => setExploredFilter(e.target.value)}
              className="input-field"
            >
              <option value="">All Neighborhoods</option>
              <option value="true">Explored</option>
              <option value="false">Not Explored</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {neighborhoods.map((neighborhood, idx) => {
            const isExplored = neighborhood.userNeighborhood?.explored || false;

            return (
              <div
                key={neighborhood.id}
                className={`card p-6 transition-all duration-300 group animate-slide-in-stagger ${
                  isExplored
                    ? 'bg-lime-900/20 border-lime-400/40'
                    : 'bg-slate-800/40'
                }`}
                style={{animationDelay: `${0.3 + idx * 0.03}s`}}
              >
                <div className="flex justify-between items-start mb-4">
                  <div className="flex-1">
                    <Link
                      href={`/neighborhoods/${neighborhood.slug}`}
                      className="text-base font-display text-slate-100 hover:text-lime-400 transition-colors tracking-wide"
                    >
                      {neighborhood.name}
                    </Link>
                    <div className="flex items-center gap-2 mt-2">
                      <span className="text-xs text-slate-500 font-mono uppercase tracking-wide">{neighborhood.borough}</span>
                      {isExplored && (
                        <span className="inline-flex items-center px-2 py-1 text-[10px] font-bold bg-lime-400/20 text-lime-400 border border-lime-400/30 uppercase tracking-wider" style={{clipPath: 'polygon(3px 0, 100% 0, 100% calc(100% - 3px), calc(100% - 3px) 100%, 0 100%, 0 3px)'}}>
                          ✓ Explored
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="mb-4 space-y-1">
                  {neighborhood.userNeighborhood?.exploredAt && (
                    <p className="text-xs text-slate-500 font-mono">
                      &gt; {new Date(neighborhood.userNeighborhood.exploredAt).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric'
                      })}
                    </p>
                  )}

                  {neighborhood.userNeighborhood?.photos?.length > 0 && (
                    <p className="text-xs text-slate-500 font-mono">
                      &gt; {neighborhood.userNeighborhood.photos.length} photo{neighborhood.userNeighborhood.photos.length !== 1 ? 's' : ''}
                    </p>
                  )}
                </div>

                <button
                  onClick={() => toggleExplored(neighborhood.slug, isExplored)}
                  className={`w-full px-4 py-3 text-xs font-bold uppercase tracking-wide transition-all ${
                    isExplored
                      ? 'bg-lime-400/10 text-lime-400 border-2 border-lime-400/50 hover:bg-lime-400/20'
                      : 'bg-orange-400 text-slate-900 hover:bg-orange-300 shadow-md shadow-orange-400/20'
                  }`}
                  style={{clipPath: 'polygon(6px 0, 100% 0, 100% calc(100% - 6px), calc(100% - 6px) 100%, 0 100%, 0 6px)'}}
                >
                  {isExplored ? '⟲ Mark Unexplored' : '→ Mark Explored'}
                </button>
              </div>
            );
          })}
        </div>

        {neighborhoods.length === 0 && (
          <div className="text-center py-16 card p-12">
            <div className="text-7xl mb-4 opacity-30">🔍</div>
            <p className="text-slate-400 text-base font-mono mb-6">// No neighborhoods found with the selected filters</p>
            <button
              onClick={() => {
                setBoroughFilter('');
                setExploredFilter('');
              }}
              className="px-6 py-3 bg-orange-400 text-slate-900 font-bold text-xs uppercase tracking-wide hover:bg-orange-300 transition-all"
              style={{clipPath: 'polygon(6px 0, 100% 0, 100% calc(100% - 6px), calc(100% - 6px) 100%, 0 100%, 0 6px)'}}
            >
              Clear filters
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
