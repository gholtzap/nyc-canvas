'use client';

import { useEffect, useState, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import NeighborhoodIcon from '@/components/NeighborhoodIcon';

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
  const [editingNoteSlug, setEditingNoteSlug] = useState<string | null>(null);
  const [noteText, setNoteText] = useState('');
  const [uploadingPhoto, setUploadingPhoto] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState<number>(0);

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
    const newExploredStatus = !currentExplored;

    setNeighborhoods(prev => prev.map(n => {
      if (n.slug !== slug) return n;

      return {
        ...n,
        userNeighborhood: n.userNeighborhood
          ? { ...n.userNeighborhood, explored: newExploredStatus, exploredAt: newExploredStatus ? new Date().toISOString() : null }
          : { id: 0, explored: newExploredStatus, exploredAt: newExploredStatus ? new Date().toISOString() : null, notes: null, photos: [] }
      };
    }));

    setStats(prev => ({
      total: prev.total,
      explored: newExploredStatus ? prev.explored + 1 : prev.explored - 1,
      unexplored: newExploredStatus ? prev.unexplored - 1 : prev.unexplored + 1,
    }));

    try {
      const res = await fetch(`/api/neighborhoods/${slug}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ explored: newExploredStatus }),
      });

      if (!res.ok) {
        fetchNeighborhoods();
      }
    } catch (error) {
      console.error('Failed to toggle explored:', error);
      fetchNeighborhoods();
    }
  };

  const handlePhotoUpload = async (slug: string, file: File) => {
    const MAX_SIZE = 5 * 1024 * 1024;
    if (file.size > MAX_SIZE) {
      alert('Photo must be smaller than 5MB');
      return;
    }

    if (!file.type.startsWith('image/')) {
      alert('Please upload an image file');
      return;
    }

    setUploadingPhoto(slug);
    setUploadProgress(0);

    const tempPhotoUrl = URL.createObjectURL(file);
    const tempPhoto = {
      id: -Date.now(),
      filename: file.name,
      path: tempPhotoUrl,
      createdAt: new Date().toISOString(),
    };

    setNeighborhoods(prev => prev.map(n => {
      if (n.slug !== slug) return n;

      return {
        ...n,
        userNeighborhood: n.userNeighborhood
          ? { ...n.userNeighborhood, photos: [...(n.userNeighborhood.photos || []), tempPhoto] }
          : { id: 0, explored: false, exploredAt: null, notes: null, photos: [tempPhoto] }
      };
    }));

    const progressInterval = setInterval(() => {
      setUploadProgress(prev => {
        if (prev >= 90) return prev;
        return prev + 10;
      });
    }, 100);

    try {
      const formData = new FormData();
      formData.append('file', file);

      const res = await fetch(`/api/neighborhoods/${slug}/photos`, {
        method: 'POST',
        body: formData,
      });

      clearInterval(progressInterval);
      setUploadProgress(100);

      if (res.ok) {
        const data = await res.json();

        setNeighborhoods(prev => prev.map(n => {
          if (n.slug !== slug) return n;

          return {
            ...n,
            userNeighborhood: n.userNeighborhood
              ? {
                  ...n.userNeighborhood,
                  photos: n.userNeighborhood.photos?.map(p => p.id === tempPhoto.id ? data.photo : p) || [data.photo]
                }
              : { id: 0, explored: false, exploredAt: null, notes: null, photos: [data.photo] }
          };
        }));

        URL.revokeObjectURL(tempPhotoUrl);
      } else {
        clearInterval(progressInterval);
        setNeighborhoods(prev => prev.map(n => {
          if (n.slug !== slug) return n;

          return {
            ...n,
            userNeighborhood: n.userNeighborhood
              ? { ...n.userNeighborhood, photos: n.userNeighborhood.photos?.filter(p => p.id !== tempPhoto.id) }
              : null
          };
        }));
        URL.revokeObjectURL(tempPhotoUrl);
        alert('Failed to upload photo');
      }
    } catch (error) {
      clearInterval(progressInterval);
      console.error('Failed to upload photo:', error);

      setNeighborhoods(prev => prev.map(n => {
        if (n.slug !== slug) return n;

        return {
          ...n,
          userNeighborhood: n.userNeighborhood
            ? { ...n.userNeighborhood, photos: n.userNeighborhood.photos?.filter(p => p.id !== tempPhoto.id) }
            : null
        };
      }));
      URL.revokeObjectURL(tempPhotoUrl);
      alert('Failed to upload photo');
    } finally {
      setTimeout(() => {
        setUploadingPhoto(null);
        setUploadProgress(0);
      }, 500);
    }
  };

  const saveNote = async (slug: string) => {
    if (noteText.length > 500) {
      alert('Note must be 500 characters or less');
      return;
    }

    try {
      const res = await fetch(`/api/neighborhoods/${slug}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ notes: noteText }),
      });

      if (res.ok) {
        setNeighborhoods(prev => prev.map(n => {
          if (n.slug !== slug) return n;
          return {
            ...n,
            userNeighborhood: n.userNeighborhood
              ? { ...n.userNeighborhood, notes: noteText }
              : { id: 0, explored: false, exploredAt: null, notes: noteText, photos: [] }
          };
        }));
        setEditingNoteSlug(null);
        setNoteText('');
      } else {
        alert('Failed to save note');
      }
    } catch (error) {
      console.error('Failed to save note:', error);
      alert('Failed to save note');
    }
  };

  const openNoteEditor = (slug: string, currentNote: string | null) => {
    setEditingNoteSlug(slug);
    setNoteText(currentNote || '');
  };

  if (authLoading || loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="flex items-center gap-3">
          <div className="w-3 h-3 rounded-full animate-pulse" style={{background: 'var(--amber-500)', animationDelay: '0s', boxShadow: '0 0 12px var(--amber-500)'}}></div>
          <div className="w-3 h-3 rounded-full animate-pulse" style={{background: 'var(--teal-400)', animationDelay: '0.2s', boxShadow: '0 0 12px var(--teal-400)'}}></div>
          <div className="w-3 h-3 rounded-full animate-pulse" style={{background: 'var(--coral-500)', animationDelay: '0.4s', boxShadow: '0 0 12px var(--coral-500)'}}></div>
        </div>
      </div>
    );
  }

  const boroughs = ['Manhattan', 'Brooklyn', 'Queens', 'Bronx', 'Staten Island'];

  return (
    <div className="min-h-screen relative">
      <div className="container mx-auto px-4 py-8 sm:py-12 relative z-10">
        <div className="mb-10 animate-slide-up">
          <h1 className="text-4xl sm:text-6xl font-display mb-3 tracking-tight" style={{color: 'var(--cream-50)', textShadow: '0 0 30px rgba(251, 191, 36, 0.2)'}}>
            NYC Neighborhoods
          </h1>
          <p className="text-base" style={{color: 'var(--gray-400)'}}>Discover and track your journey through the city</p>
        </div>

        <div className="card p-6 sm:p-8 mb-8 animate-slide-up" style={{animationDelay: '0.1s'}}>
          <h2 className="text-xl font-display mb-6 tracking-tight" style={{color: 'var(--cream-50)'}}>Your Progress</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <div className="p-5 rounded-xl" style={{background: 'rgba(10, 14, 26, 0.5)', border: '1.5px solid var(--midnight-600)'}}>
              <div className="flex items-baseline gap-2 mb-2">
                <span className="text-5xl font-display" style={{color: 'var(--amber-400)', textShadow: '0 0 20px rgba(251, 191, 36, 0.3)'}}>
                  {stats.explored}
                </span>
                <span className="text-2xl font-semibold" style={{color: 'var(--gray-500)'}}>/ {stats.total}</span>
              </div>
              <p className="text-xs font-medium tracking-wide" style={{color: 'var(--gray-400)'}}>Neighborhoods Explored</p>
            </div>

            <div className="p-5 rounded-xl" style={{background: 'rgba(10, 14, 26, 0.5)', border: '1.5px solid var(--midnight-600)'}}>
              <div className="flex items-baseline gap-2 mb-2">
                <span className="text-5xl font-display" style={{color: 'var(--teal-400)', textShadow: '0 0 20px rgba(45, 212, 191, 0.3)'}}>
                  {stats.total > 0 ? Math.round((stats.explored / stats.total) * 100) : 0}%
                </span>
              </div>
              <p className="text-xs font-medium tracking-wide" style={{color: 'var(--gray-400)'}}>Complete</p>
            </div>

            <div className="p-5 rounded-xl" style={{background: 'rgba(10, 14, 26, 0.5)', border: '1.5px solid var(--midnight-600)'}}>
              <div className="flex items-baseline gap-2 mb-2">
                <span className="text-5xl font-display" style={{color: 'var(--coral-400)', textShadow: '0 0 20px rgba(255, 107, 107, 0.3)'}}>
                  {stats.unexplored}
                </span>
              </div>
              <p className="text-xs font-medium tracking-wide" style={{color: 'var(--gray-400)'}}>Left to Explore</p>
            </div>
          </div>
        </div>

        <div className="flex gap-4 mb-8 flex-wrap animate-slide-up" style={{animationDelay: '0.2s'}}>
          <div className="flex-1 min-w-[200px]">
            <label className="block text-sm font-semibold mb-2" style={{color: 'var(--cream-100)'}}>Borough</label>
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
            <label className="block text-sm font-semibold mb-2" style={{color: 'var(--cream-100)'}}>Status</label>
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
                className="card p-6 transition-all duration-300 group animate-slide-in-stagger relative overflow-hidden"
                style={{
                  animationDelay: `${0.3 + idx * 0.03}s`,
                  ...(isExplored ? {
                    background: 'rgba(251, 191, 36, 0.05)',
                    borderColor: 'rgba(251, 191, 36, 0.3)',
                    boxShadow: '0 4px 16px rgba(0, 0, 0, 0.3), 0 0 15px rgba(251, 191, 36, 0.1)'
                  } : {})
                }}
              >
                <div className="absolute top-3 right-3 opacity-20 group-hover:opacity-30 transition-opacity" style={{color: isExplored ? 'var(--amber-400)' : 'var(--teal-400)'}}>
                  <NeighborhoodIcon slug={neighborhood.slug} className="w-16 h-16" />
                </div>
                <div className="flex justify-between items-start mb-4 relative z-10">
                  <div className="flex-1">
                    <Link
                      href={`/neighborhoods/${neighborhood.slug}`}
                      className="text-base font-display hover:opacity-70 transition-opacity tracking-tight"
                      style={{color: 'var(--cream-50)'}}
                    >
                      {neighborhood.name}
                    </Link>
                    <div className="flex items-center gap-2 mt-2">
                      <span className="text-xs font-medium" style={{color: 'var(--gray-400)'}}>{neighborhood.borough}</span>
                      {isExplored && (
                        <span className="inline-flex items-center px-2 py-0.5 text-xs font-semibold rounded-md" style={{background: 'rgba(251, 191, 36, 0.15)', color: 'var(--amber-400)', border: '1px solid var(--amber-500)'}}>
                          ✓ Explored
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="mb-4 space-y-1 relative z-10">
                  {neighborhood.userNeighborhood?.exploredAt && (
                    <p className="text-xs" style={{color: 'var(--gray-500)'}}>
                      {new Date(neighborhood.userNeighborhood.exploredAt).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric'
                      })}
                    </p>
                  )}

                  {(neighborhood.userNeighborhood?.photos?.length ?? 0) > 0 && (
                    <p className="text-xs" style={{color: 'var(--gray-500)'}}>
                      {neighborhood.userNeighborhood?.photos?.length} photo{(neighborhood.userNeighborhood?.photos?.length ?? 0) !== 1 ? 's' : ''}
                    </p>
                  )}

                  {neighborhood.userNeighborhood?.notes && (
                    <p className="text-xs italic line-clamp-2" style={{color: 'var(--gray-400)'}}>
                      &quot;{neighborhood.userNeighborhood.notes}&quot;
                    </p>
                  )}
                </div>

                {editingNoteSlug === neighborhood.slug ? (
                  <div className="mb-3 relative z-10">
                    <textarea
                      value={noteText}
                      onChange={(e) => setNoteText(e.target.value)}
                      maxLength={500}
                      placeholder="Add a note about this neighborhood..."
                      className="w-full px-3 py-2 text-sm rounded-lg resize-none"
                      style={{
                        background: 'rgba(10, 14, 26, 0.7)',
                        border: '1.5px solid var(--midnight-600)',
                        color: 'var(--cream-50)',
                        minHeight: '80px'
                      }}
                    />
                    <div className="flex items-center justify-between mt-2">
                      <span className="text-xs" style={{color: 'var(--gray-500)'}}>
                        {noteText.length}/500
                      </span>
                      <div className="flex gap-2">
                        <button
                          onClick={() => {
                            setEditingNoteSlug(null);
                            setNoteText('');
                          }}
                          className="px-3 py-1 text-xs font-semibold rounded-lg"
                          style={{
                            background: 'transparent',
                            color: 'var(--gray-400)',
                            border: '1px solid var(--midnight-600)'
                          }}
                        >
                          Cancel
                        </button>
                        <button
                          onClick={() => saveNote(neighborhood.slug)}
                          className="px-3 py-1 text-xs font-semibold rounded-lg"
                          style={{
                            background: 'linear-gradient(135deg, var(--teal-500), var(--teal-600))',
                            color: 'var(--midnight-900)'
                          }}
                        >
                          Save
                        </button>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="flex gap-2 mb-3 relative z-10">
                    {uploadingPhoto === neighborhood.slug ? (
                      <div className="flex-1 px-3 py-2 text-xs font-semibold rounded-lg" style={{
                        background: 'rgba(10, 14, 26, 0.5)',
                        border: '1.5px solid var(--midnight-600)',
                      }}>
                        <div className="flex items-center justify-between mb-1">
                          <span style={{color: 'var(--teal-400)'}}>Uploading...</span>
                          <span style={{color: 'var(--gray-400)'}}>{uploadProgress}%</span>
                        </div>
                        <div className="w-full h-1.5 rounded-full overflow-hidden" style={{background: 'rgba(30, 41, 59, 0.5)'}}>
                          <div
                            className="h-full transition-all duration-300"
                            style={{
                              width: `${uploadProgress}%`,
                              background: 'linear-gradient(90deg, var(--teal-500), var(--teal-400))',
                              boxShadow: '0 0 10px rgba(45, 212, 191, 0.5)'
                            }}
                          />
                        </div>
                      </div>
                    ) : (
                      <label
                        className="flex-1 flex items-center justify-center gap-2 px-3 py-2 text-xs font-semibold rounded-lg cursor-pointer transition-all hover:border-teal-500"
                        style={{
                          background: 'rgba(10, 14, 26, 0.5)',
                          border: '1.5px solid var(--midnight-600)',
                          color: 'var(--gray-300)'
                        }}
                      >
                        📷 Photo
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) handlePhotoUpload(neighborhood.slug, file);
                            e.target.value = '';
                          }}
                        />
                      </label>
                    )}
                    <button
                      onClick={() => openNoteEditor(neighborhood.slug, neighborhood.userNeighborhood?.notes || null)}
                      className="flex-1 flex items-center justify-center gap-2 px-3 py-2 text-xs font-semibold rounded-lg transition-all hover:border-teal-500"
                      style={{
                        background: 'rgba(10, 14, 26, 0.5)',
                        border: '1.5px solid var(--midnight-600)',
                        color: 'var(--gray-300)'
                      }}
                    >
                      ✏️ Note
                    </button>
                  </div>
                )}

                <button
                  onClick={() => toggleExplored(neighborhood.slug, isExplored)}
                  className="w-full px-4 py-2.5 text-sm font-semibold tracking-normal transition-all rounded-lg relative z-10 hover:opacity-80"
                  style={isExplored ? {
                    background: 'transparent',
                    color: 'var(--amber-400)',
                    border: '2px solid var(--amber-500)'
                  } : {
                    background: 'linear-gradient(135deg, var(--teal-500), var(--teal-600))',
                    color: 'var(--midnight-900)',
                    boxShadow: '0 0 15px rgba(45, 212, 191, 0.2)'
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
            <p className="text-base mb-6" style={{color: 'var(--gray-400)'}}>No neighborhoods found with the selected filters</p>
            <button
              onClick={() => {
                setBoroughFilter('');
                setExploredFilter('');
              }}
              className="btn-primary"
            >
              Clear filters
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
