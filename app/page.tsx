'use client';

import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function Home() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const loading = status === 'loading';

  useEffect(() => {
    if (!loading && session) {
      router.push('/neighborhoods');
    }
  }, [session, loading, router]);

  if (loading) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center">
        <div className="flex items-center gap-2">
          <div className="w-2.5 h-2.5 rounded-full animate-pulse" style={{background: 'var(--terracotta-500)', animationDelay: '0s'}}></div>
          <div className="w-2.5 h-2.5 rounded-full animate-pulse" style={{background: 'var(--amber-500)', animationDelay: '0.2s'}}></div>
          <div className="w-2.5 h-2.5 rounded-full animate-pulse" style={{background: 'var(--sage-500)', animationDelay: '0.4s'}}></div>
        </div>
      </main>
    );
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-8 relative overflow-hidden">
      <div className="max-w-4xl text-center relative z-10">
        <div className="mb-8 inline-block animate-fade-in">
          <div className="text-7xl mb-4">🗽</div>
        </div>

        <h1 className="text-5xl md:text-7xl font-display mb-6 leading-tight tracking-tight animate-slide-up" style={{color: 'var(--charcoal)'}}>
          NYC Neighborhood Explorer
        </h1>

        <p className="text-lg md:text-xl mb-4 max-w-2xl mx-auto font-normal animate-slide-up" style={{animationDelay: '0.1s', color: 'var(--gray-600)'}}>
          Track your journey through all 173 neighborhoods
        </p>

        <p className="text-sm md:text-base mb-12 max-w-xl mx-auto animate-slide-up" style={{animationDelay: '0.2s', color: 'var(--gray-400)'}}>
          Upload photos, write notes, and mark your progress
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-20 animate-slide-up" style={{animationDelay: '0.3s'}}>
          <Link href="/register" className="btn-primary w-full sm:w-auto">
            Start Exploring
          </Link>
          <Link href="/login" className="btn-secondary w-full sm:w-auto">
            Sign In
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
          <div className="card p-8 animate-slide-in-stagger" style={{animationDelay: '0.4s'}}>
            <div className="text-5xl mb-4">📍</div>
            <h3 className="text-base font-display mb-3 tracking-tight" style={{color: 'var(--terracotta-600)'}}>Track Progress</h3>
            <p className="text-sm leading-relaxed" style={{color: 'var(--gray-600)'}}>Mark neighborhoods as you explore them across all five boroughs</p>
          </div>

          <div className="card p-8 animate-slide-in-stagger" style={{animationDelay: '0.5s'}}>
            <div className="text-5xl mb-4">📸</div>
            <h3 className="text-base font-display mb-3 tracking-tight" style={{color: 'var(--sage-600)'}}>Capture Memories</h3>
            <p className="text-sm leading-relaxed" style={{color: 'var(--gray-600)'}}>Upload photos and write notes about your favorite spots</p>
          </div>

          <div className="card p-8 animate-slide-in-stagger" style={{animationDelay: '0.6s'}}>
            <div className="text-5xl mb-4">🗺️</div>
            <h3 className="text-base font-display mb-3 tracking-tight" style={{color: 'var(--amber-600)'}}>Visualize Journey</h3>
            <p className="text-sm leading-relaxed" style={{color: 'var(--gray-600)'}}>See your progress on an interactive map of NYC</p>
          </div>
        </div>
      </div>
    </main>
  );
}
