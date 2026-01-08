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
        <div className="flex items-center gap-3">
          <div className="w-3 h-3 bg-lime-400 animate-pulse" style={{clipPath: 'polygon(2px 0, 100% 0, 100% calc(100% - 2px), calc(100% - 2px) 100%, 0 100%, 0 2px)', animationDelay: '0s'}}></div>
          <div className="w-3 h-3 bg-orange-400 animate-pulse" style={{clipPath: 'polygon(2px 0, 100% 0, 100% calc(100% - 2px), calc(100% - 2px) 100%, 0 100%, 0 2px)', animationDelay: '0.2s'}}></div>
          <div className="w-3 h-3 bg-lime-400 animate-pulse" style={{clipPath: 'polygon(2px 0, 100% 0, 100% calc(100% - 2px), calc(100% - 2px) 100%, 0 100%, 0 2px)', animationDelay: '0.4s'}}></div>
        </div>
      </main>
    );
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-8 relative overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-lime-400 via-orange-400 to-lime-400"></div>
      <div className="absolute bottom-0 left-0 w-full h-2 bg-gradient-to-r from-orange-400 via-lime-400 to-orange-400"></div>

      <div className="max-w-4xl text-center relative z-10">
        <div className="mb-8 inline-block animate-fade-in">
          <div className="text-7xl mb-4 animate-glow-pulse">🗽</div>
        </div>

        <h1 className="text-6xl md:text-8xl font-display mb-8 text-lime-400 leading-none tracking-tight animate-slide-up drop-shadow-[0_0_30px_rgba(203,245,66,0.3)]">
          NYC NEIGHBORHOOD<br/>EXPLORER
        </h1>

        <p className="text-lg md:text-xl text-slate-300 mb-4 max-w-2xl mx-auto font-medium animate-slide-up" style={{animationDelay: '0.1s'}}>
          {`// TRACK YOUR JOURNEY THROUGH ALL 173 NEIGHBORHOODS`}
        </p>

        <p className="text-sm md:text-base text-slate-400 mb-12 max-w-xl mx-auto animate-slide-up" style={{animationDelay: '0.2s'}}>
          &gt; Upload photos, write notes, mark progress
        </p>

        <div className="flex flex-col sm:flex-row gap-5 justify-center items-center mb-20 animate-slide-up" style={{animationDelay: '0.3s'}}>
          <Link href="/register" className="btn-primary w-full sm:w-auto">
            Start Exploring
          </Link>
          <Link href="/login" className="btn-secondary w-full sm:w-auto">
            Sign In
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
          <div className="card p-8 animate-slide-in-stagger" style={{animationDelay: '0.4s'}}>
            <div className="text-5xl mb-4 filter drop-shadow-[0_0_10px_rgba(203,245,66,0.3)]">📍</div>
            <h3 className="text-base font-display mb-3 text-lime-400 tracking-wide">Track Progress</h3>
            <p className="text-xs text-slate-400 leading-relaxed">Mark neighborhoods as you explore them across all five boroughs</p>
          </div>

          <div className="card p-8 animate-slide-in-stagger" style={{animationDelay: '0.5s'}}>
            <div className="text-5xl mb-4 filter drop-shadow-[0_0_10px_rgba(255,107,53,0.3)]">📸</div>
            <h3 className="text-base font-display mb-3 text-orange-400 tracking-wide">Capture Memories</h3>
            <p className="text-xs text-slate-400 leading-relaxed">Upload photos and write notes about your favorite spots</p>
          </div>

          <div className="card p-8 animate-slide-in-stagger" style={{animationDelay: '0.6s'}}>
            <div className="text-5xl mb-4 filter drop-shadow-[0_0_10px_rgba(203,245,66,0.3)]">🗺️</div>
            <h3 className="text-base font-display mb-3 text-lime-400 tracking-wide">Visualize Journey</h3>
            <p className="text-xs text-slate-400 leading-relaxed">See your progress on an interactive map of NYC</p>
          </div>
        </div>
      </div>
    </main>
  );
}
