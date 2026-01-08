'use client';

import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { usePathname } from 'next/navigation';

export default function Navbar() {
  const { user, logout } = useAuth();
  const pathname = usePathname();

  const isActive = (path: string) => pathname === path;

  return (
    <nav className="bg-slate-900/90 backdrop-blur-xl border-b-2 border-lime-400/20 sticky top-0 z-50 shadow-lg shadow-black/20">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link href="/" className="flex items-center gap-3 group">
            <span className="text-2xl group-hover:scale-110 transition-transform">🗽</span>
            <span className="text-lg font-display text-lime-400 tracking-tight group-hover:text-lime-300 transition-colors">
              NYC EXPLORER
            </span>
          </Link>

          <div className="flex gap-2 sm:gap-3 items-center">
            {user ? (
              <>
                <Link
                  href="/neighborhoods"
                  className={`px-3 sm:px-4 py-2 text-xs font-bold uppercase tracking-wide transition-all ${
                    isActive('/neighborhoods')
                      ? 'bg-lime-400/20 text-lime-400 border-b-2 border-lime-400'
                      : 'text-slate-400 hover:text-lime-400 hover:bg-slate-800'
                  }`}
                >
                  Neighborhoods
                </Link>
                <Link
                  href="/map"
                  className={`px-3 sm:px-4 py-2 text-xs font-bold uppercase tracking-wide transition-all ${
                    isActive('/map')
                      ? 'bg-lime-400/20 text-lime-400 border-b-2 border-lime-400'
                      : 'text-slate-400 hover:text-lime-400 hover:bg-slate-800'
                  }`}
                >
                  Map
                </Link>

                <div className="hidden sm:flex items-center gap-3 ml-3 pl-4 border-l border-slate-700">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-gradient-to-br from-lime-400 to-orange-400 flex items-center justify-center text-slate-900 text-sm font-bold clip-path-corner">
                      {(user.name || user.email).charAt(0).toUpperCase()}
                    </div>
                    <span className="text-xs text-slate-300 font-mono max-w-[120px] truncate">
                      {user.name || user.email.split('@')[0]}
                    </span>
                  </div>
                  <button
                    onClick={logout}
                    className="text-xs text-slate-400 hover:text-orange-400 font-bold uppercase tracking-wide transition-colors"
                  >
                    Logout
                  </button>
                </div>

                <button
                  onClick={logout}
                  className="sm:hidden px-3 py-2 text-xs text-slate-400 hover:text-orange-400 font-bold uppercase tracking-wide transition-colors"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link
                  href="/login"
                  className="px-4 py-2 text-xs font-bold uppercase tracking-wide text-slate-400 hover:text-lime-400 transition-colors"
                >
                  Sign In
                </Link>
                <Link
                  href="/register"
                  className="px-4 py-2 text-xs font-bold uppercase tracking-wide bg-lime-400 text-slate-900 hover:bg-lime-300 transition-all shadow-md shadow-lime-400/20"
                  style={{clipPath: 'polygon(6px 0, 100% 0, 100% calc(100% - 6px), calc(100% - 6px) 100%, 0 100%, 0 6px)'}}
                >
                  Get Started
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
