'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';

interface Photo {
  id: number;
  filename: string;
  path: string;
  createdAt: string;
}

interface UserNeighborhood {
  id: number;
  explored: boolean;
  exploredAt: string | null;
  notes: string | null;
  photos: Photo[];
}

interface Neighborhood {
  id: number;
  name: string;
  borough: string;
  slug: string;
  userNeighborhood: UserNeighborhood | null;
}

export default function NeighborhoodDetailPage() {
  const { data: session, status } = useSession();
  const authLoading = status === 'loading';
  const router = useRouter();
  const params = useParams();
  const slug = params?.slug as string;

  const [neighborhood, setNeighborhood] = useState<Neighborhood | null>(null);
  const [loading, setLoading] = useState(true);
  const [notes, setNotes] = useState('');
  const [savingNotes, setSavingNotes] = useState(false);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    if (!authLoading && !session) {
      router.push('/login');
    }
  }, [session, authLoading, router]);

  useEffect(() => {
    if (session && slug) {
      fetchNeighborhood();
    }
  }, [session, slug]);

  const fetchNeighborhood = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/neighborhoods/${slug}`);
      if (res.ok) {
        const data = await res.json();
        setNeighborhood(data);
        setNotes(data.userNeighborhood?.notes || '');
      }
    } catch (error) {
      console.error('Failed to fetch neighborhood:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleExplored = async () => {
    if (!neighborhood) return;

    const currentExplored = neighborhood.userNeighborhood?.explored || false;

    try {
      const res = await fetch(`/api/neighborhoods/${slug}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ explored: !currentExplored }),
      });

      if (res.ok) {
        fetchNeighborhood();
      }
    } catch (error) {
      console.error('Failed to toggle explored:', error);
    }
  };

  const saveNotes = async () => {
    if (!neighborhood) return;

    setSavingNotes(true);
    try {
      const res = await fetch(`/api/neighborhoods/${slug}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ notes }),
      });

      if (res.ok) {
        fetchNeighborhood();
      }
    } catch (error) {
      console.error('Failed to save notes:', error);
    } finally {
      setSavingNotes(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);

      const res = await fetch(`/api/neighborhoods/${slug}/photos`, {
        method: 'POST',
        body: formData,
      });

      if (res.ok) {
        fetchNeighborhood();
      }
    } catch (error) {
      console.error('Failed to upload photo:', error);
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  };

  const deletePhoto = async (photoId: number) => {
    if (!confirm('Are you sure you want to delete this photo?')) return;

    try {
      const res = await fetch(`/api/neighborhoods/${slug}/photos?photoId=${photoId}`, {
        method: 'DELETE',
      });

      if (res.ok) {
        fetchNeighborhood();
      }
    } catch (error) {
      console.error('Failed to delete photo:', error);
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

  if (!neighborhood) {
    return (
      <div className="container mx-auto px-4 py-8">
        <p className="text-xl font-mono text-slate-400">// Neighborhood not found</p>
        <Link href="/neighborhoods" className="text-lime-400 hover:text-lime-300 font-bold transition-colors">
          ← Back to Neighborhoods
        </Link>
      </div>
    );
  }

  const isExplored = neighborhood.userNeighborhood?.explored || false;
  const photos = neighborhood.userNeighborhood?.photos || [];

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl relative z-10">
      <Link href="/neighborhoods" className="text-lime-400 hover:text-lime-300 mb-6 inline-block font-bold text-sm uppercase tracking-wide transition-colors">
        ← Back to Neighborhoods
      </Link>

      <div className="card p-8 mb-6 animate-slide-up">
        <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-4 mb-4">
          <div>
            <h1 className="text-4xl md:text-5xl font-display mb-3 text-lime-400 tracking-tight">{neighborhood.name}</h1>
            <p className="text-base text-slate-400 font-mono uppercase tracking-wide">{neighborhood.borough}</p>
          </div>
          <button
            onClick={toggleExplored}
            className={`px-6 py-3 font-bold text-xs uppercase tracking-wide transition-all ${
              isExplored
                ? 'bg-lime-400/10 text-lime-400 border-2 border-lime-400/50 hover:bg-lime-400/20'
                : 'bg-orange-400 text-slate-900 hover:bg-orange-300 shadow-md shadow-orange-400/20'
            }`}
            style={{clipPath: 'polygon(6px 0, 100% 0, 100% calc(100% - 6px), calc(100% - 6px) 100%, 0 100%, 0 6px)'}}
          >
            {isExplored ? '✓ Explored' : 'Mark Explored'}
          </button>
        </div>

        {neighborhood.userNeighborhood?.exploredAt && (
          <p className="text-xs text-slate-500 font-mono">
            &gt; Explored on {new Date(neighborhood.userNeighborhood.exploredAt).toLocaleDateString()}
          </p>
        )}
      </div>

      <div className="card p-8 mb-6 animate-slide-up" style={{animationDelay: '0.1s'}}>
        <h2 className="text-2xl font-display mb-4 text-orange-400 tracking-wide">NOTES</h2>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="// Write your notes about this neighborhood..."
          className="w-full px-4 py-3 bg-slate-900/50 border-2 border-slate-600 text-neutral-100 placeholder:text-slate-600 font-mono text-sm min-h-[150px] focus:border-lime-400 focus:bg-slate-900/70 outline-none transition-all"
          style={{clipPath: 'polygon(6px 0, 100% 0, 100% calc(100% - 6px), calc(100% - 6px) 100%, 0 100%, 0 6px)'}}
        />
        <button
          onClick={saveNotes}
          disabled={savingNotes}
          className="mt-4 bg-lime-400 text-slate-900 px-8 py-3 font-bold tracking-wide uppercase text-sm hover:bg-lime-300 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-md shadow-lime-400/20"
          style={{clipPath: 'polygon(6px 0, 100% 0, 100% calc(100% - 6px), calc(100% - 6px) 100%, 0 100%, 0 6px)'}}
        >
          {savingNotes ? 'Saving...' : 'Save Notes'}
        </button>
      </div>

      <div className="card p-8 animate-slide-up" style={{animationDelay: '0.2s'}}>
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-display text-orange-400 tracking-wide">PHOTOS</h2>
          <label className="bg-orange-400 text-slate-900 px-6 py-3 font-bold text-xs uppercase tracking-wide hover:bg-orange-300 transition-all cursor-pointer shadow-md shadow-orange-400/20" style={{clipPath: 'polygon(6px 0, 100% 0, 100% calc(100% - 6px), calc(100% - 6px) 100%, 0 100%, 0 6px)'}}>
            {uploading ? 'Uploading...' : 'Upload Photo'}
            <input
              type="file"
              accept="image/*"
              onChange={handleFileUpload}
              disabled={uploading}
              className="hidden"
            />
          </label>
        </div>

        {photos.length === 0 ? (
          <p className="text-slate-500 text-center py-12 font-mono text-sm">
            // No photos yet. Upload your first photo!
          </p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {photos.map((photo) => (
              <div key={photo.id} className="relative group">
                <div className="relative h-64 bg-slate-900 overflow-hidden border-2 border-slate-700 group-hover:border-lime-400/50 transition-all" style={{clipPath: 'polygon(8px 0, 100% 0, 100% calc(100% - 8px), calc(100% - 8px) 100%, 0 100%, 0 8px)'}}>
                  <Image
                    src={photo.path}
                    alt={photo.filename}
                    fill
                    className="object-cover"
                  />
                </div>
                <button
                  onClick={() => deletePhoto(photo.id)}
                  className="absolute top-3 right-3 bg-red-500 text-white w-8 h-8 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all hover:bg-red-400 font-bold"
                  style={{clipPath: 'polygon(3px 0, 100% 0, 100% calc(100% - 3px), calc(100% - 3px) 100%, 0 100%, 0 3px)'}}
                >
                  ✕
                </button>
                <p className="text-xs text-slate-500 mt-2 truncate font-mono">{photo.filename}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
