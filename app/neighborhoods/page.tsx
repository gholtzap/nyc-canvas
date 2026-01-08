'use client';

import { useEffect, useState, useCallback } from 'react';
import { useSession } from 'next-auth/react';
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
  const { data: session, status } = useSession();
  const authLoading = status === 'loading';
  const router = useRouter();
  const [neighborhoods, setNeighborhoods] = useState<Neighborhood[]>([]);
  const [stats, setStats] = useState<Stats>({ total: 0, explored: 0, unexplored: 0 });
  const [loading, setLoading] = useState(true);
  const [boroughFilter, setBoroughFilter] = useState('');
  const [exploredFilter, setExploredFilter] = useState('');

  useEffect(() => {
    if (!authLoading && !session) {
      router.push('/login');
    }
  }, [session, authLoading, router]);

  const fetchNeighborhoods = useCallback(async () => {
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
  }, [boroughFilter, exploredFilter]);

  useEffect(() => {
    if (session) {
      fetchNeighborhoods();
    }
  }, [session, fetchNeighborhoods]);

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
        <div className="flex items-center gap-2">
          <div className="w-2.5 h-2.5 rounded-full animate-pulse" style={{background: 'var(--terracotta-500)', animationDelay: '0s'}}></div>
          <div className="w-2.5 h-2.5 rounded-full animate-pulse" style={{background: 'var(--amber-500)', animationDelay: '0.2s'}}></div>
          <div className="w-2.5 h-2.5 rounded-full animate-pulse" style={{background: 'var(--sage-500)', animationDelay: '0.4s'}}></div>
        </div>
      </div>
    );
  }

  const boroughs = ['Manhattan', 'Brooklyn', 'Queens', 'Bronx', 'Staten Island'];

  return (
    <div className="min-h-screen relative">
      <div className="container mx-auto px-4 py-8 sm:py-12 relative z-10">
        <div className="mb-10 animate-slide-up">
          <h1 className="text-4xl sm:text-6xl font-display mb-3 tracking-tight" style={{color: 'var(--charcoal)'}}>
            NYC Neighborhoods
          </h1>
          <p className="text-base" style={{color: 'var(--gray-600)'}}>Discover and track your journey through the city</p>
        </div>

        <div className="card p-6 sm:p-8 mb-8 animate-slide-up" style={{animationDelay: '0.1s'}}>
          <h2 className="text-xl font-display mb-6 tracking-tight" style={{color: 'var(--charcoal)'}}>Your Progress</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <div className="p-5 rounded-xl" style={{background: 'var(--cream-100)', border: '1.5px solid var(--cream-200)'}}>
              <div className="flex items-baseline gap-2 mb-2">
                <span className="text-5xl font-display" style={{color: 'var(--terracotta-500)'}}>
                  {stats.explored}
                </span>
                <span className="text-2xl font-semibold" style={{color: 'var(--gray-400)'}}>/ {stats.total}</span>
              </div>
              <p className="text-xs font-medium tracking-wide" style={{color: 'var(--gray-600)'}}>Neighborhoods Explored</p>
            </div>

            <div className="p-5 rounded-xl" style={{background: 'var(--cream-100)', border: '1.5px solid var(--cream-200)'}}>
              <div className="flex items-baseline gap-2 mb-2">
                <span className="text-5xl font-display" style={{color: 'var(--sage-600)'}}>
                  {stats.total > 0 ? Math.round((stats.explored / stats.total) * 100) : 0}%
                </span>
              </div>
              <p className="text-xs font-medium tracking-wide" style={{color: 'var(--gray-600)'}}>Complete</p>
            </div>

            <div className="p-5 rounded-xl" style={{background: 'var(--cream-100)', border: '1.5px solid var(--cream-200)'}}>
              <div className="flex items-baseline gap-2 mb-2">
                <span className="text-5xl font-display" style={{color: 'var(--amber-600)'}}>
                  {stats.unexplored}
                </span>
              </div>
              <p className="text-xs font-medium tracking-wide" style={{color: 'var(--gray-600)'}}>Left to Explore</p>
            </div>
          </div>
        </div>

        <div className="flex gap-4 mb-8 flex-wrap animate-slide-up" style={{animationDelay: '0.2s'}}>
          <div className="flex-1 min-w-[200px]">
            <label className="block text-sm font-semibold mb-2" style={{color: 'var(--charcoal)'}}>Borough</label>
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
            <label className="block text-sm font-semibold mb-2" style={{color: 'var(--charcoal)'}}>Status</label>
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
                className="card p-6 transition-all duration-300 group animate-slide-in-stagger"
                style={{
                  animationDelay: `${0.3 + idx * 0.03}s`,
                  ...(isExplored ? {
                    background: 'rgba(212, 121, 91, 0.05)',
                    borderColor: 'var(--terracotta-400)'
                  } : {})
                }}
              >
                <div className="flex justify-between items-start mb-4">
                  <div className="flex-1">
                    <Link
                      href={`/neighborhoods/${neighborhood.slug}`}
                      className="text-base font-display hover:opacity-70 transition-opacity tracking-tight"
                      style={{color: 'var(--charcoal)'}}
                    >
                      {neighborhood.name}
                    </Link>
                    <div className="flex items-center gap-2 mt-2">
                      <span className="text-xs font-medium" style={{color: 'var(--gray-600)'}}>{neighborhood.borough}</span>
                      {isExplored && (
                        <span className="inline-flex items-center px-2 py-0.5 text-xs font-semibold rounded-md" style={{background: 'rgba(200, 90, 63, 0.1)', color: 'var(--terracotta-600)', border: '1px solid var(--terracotta-400)'}}>
                          ✓ Explored
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="mb-4 space-y-1">
                  {neighborhood.userNeighborhood?.exploredAt && (
                    <p className="text-xs" style={{color: 'var(--gray-400)'}}>
                      {new Date(neighborhood.userNeighborhood.exploredAt).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric'
                      })}
                    </p>
                  )}

                  {(neighborhood.userNeighborhood?.photos?.length ?? 0) > 0 && (
                    <p className="text-xs" style={{color: 'var(--gray-400)'}}>
                      {neighborhood.userNeighborhood?.photos?.length} photo{(neighborhood.userNeighborhood?.photos?.length ?? 0) !== 1 ? 's' : ''}
                    </p>
                  )}
                </div>

                <button
                  onClick={() => toggleExplored(neighborhood.slug, isExplored)}
                  className="w-full px-4 py-2.5 text-sm font-semibold tracking-normal transition-all rounded-lg"
                  style={isExplored ? {
                    background: 'transparent',
                    color: 'var(--terracotta-600)',
                    border: '2px solid var(--terracotta-500)'
                  } : {
                    background: 'var(--sage-500)',
                    color: 'white',
                    boxShadow: '0 2px 8px rgba(82, 107, 90, 0.2)'
                  }}
                >
                  {isExplored ? 'Mark Unexplored' : 'Mark Explored'}
                </button>
              </div>
            );
          })}
        </div>

        {neighborhoods.length === 0 && (
          <div className="text-center py-16 card p-12">
            <div className="text-7xl mb-4 opacity-30">🔍</div>
            <p className="text-base mb-6" style={{color: 'var(--gray-600)'}}>No neighborhoods found with the selected filters</p>
            <button
              onClick={() => {
                setBoroughFilter('');
                setExploredFilter('');
              }}
              className="px-6 py-3 font-semibold text-sm rounded-lg text-white transition-all"
              style={{background: 'var(--terracotta-500)', boxShadow: '0 2px 8px rgba(200, 90, 63, 0.2)'}}
            >
              Clear filters
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
