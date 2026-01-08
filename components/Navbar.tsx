'use client';

import Link from 'next/link';
import { useSession, signOut } from 'next-auth/react';
import { usePathname } from 'next/navigation';

export default function Navbar() {
  const { data: session } = useSession();
  const user = session?.user;
  const pathname = usePathname();

  const handleLogout = () => {
    signOut({ callbackUrl: '/login' });
  };

  const isActive = (path: string) => pathname === path;

  return (
    <nav style={{background: 'rgba(10, 14, 26, 0.8)', backdropFilter: 'blur(16px)', borderBottom: '1.5px solid rgba(94, 234, 212, 0.2)', boxShadow: '0 4px 16px rgba(0, 0, 0, 0.3)'}} className="sticky top-0 z-50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link href="/" className="flex items-center gap-2 group">
            <span className="text-2xl group-hover:scale-110 transition-transform animate-glow">🗽</span>
            <span className="text-base font-display tracking-tight group-hover:opacity-70 transition-opacity" style={{color: 'var(--cream-50)'}}>
              NYC Explorer
            </span>
          </Link>

          <div className="flex gap-2 sm:gap-3 items-center">
            {user ? (
              <>
                <Link
                  href="/neighborhoods"
                  className={`px-3 sm:px-4 py-2 text-sm font-medium tracking-normal transition-all rounded-lg ${
                    isActive('/neighborhoods')
                      ? 'text-midnight-900'
                      : ''
                  }`}
                  style={isActive('/neighborhoods') ? {background: 'linear-gradient(135deg, var(--amber-500), var(--amber-600))', boxShadow: '0 0 15px rgba(251, 191, 36, 0.3)'} : {color: 'var(--cream-200)'}}
                >
                  Neighborhoods
                </Link>
                <Link
                  href="/map"
                  className={`px-3 sm:px-4 py-2 text-sm font-medium tracking-normal transition-all rounded-lg ${
                    isActive('/map')
                      ? 'text-midnight-900'
                      : ''
                  }`}
                  style={isActive('/map') ? {background: 'linear-gradient(135deg, var(--amber-500), var(--amber-600))', boxShadow: '0 0 15px rgba(251, 191, 36, 0.3)'} : {color: 'var(--cream-200)'}}
                >
                  Map
                </Link>

                <div className="hidden sm:flex items-center gap-3 ml-3 pl-4" style={{borderLeft: '1px solid rgba(94, 234, 212, 0.2)'}}>
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full flex items-center justify-center text-midnight-900 text-sm font-semibold" style={{background: 'linear-gradient(135deg, var(--teal-400), var(--teal-500))', boxShadow: '0 0 12px rgba(45, 212, 191, 0.3)'}}>
                      {(user.name || user.email || '').charAt(0).toUpperCase()}
                    </div>
                    <span className="text-sm max-w-[120px] truncate" style={{color: 'var(--cream-100)'}}>
                      {user.name || user.email?.split('@')[0]}
                    </span>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="text-sm font-medium hover:opacity-70 transition-opacity"
                    style={{color: 'var(--gray-400)'}}
                  >
                    Logout
                  </button>
                </div>

                <button
                  onClick={handleLogout}
                  className="sm:hidden px-3 py-2 text-sm font-medium hover:opacity-70 transition-opacity"
                  style={{color: 'var(--gray-400)'}}
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link
                  href="/login"
                  className="px-4 py-2 text-sm font-medium hover:opacity-70 transition-opacity"
                  style={{color: 'var(--cream-200)'}}
                >
                  Sign In
                </Link>
                <Link
                  href="/register"
                  className="px-4 py-2 text-sm font-semibold rounded-lg transition-all"
                  style={{background: 'linear-gradient(135deg, var(--amber-500), var(--amber-600))', color: 'var(--midnight-900)', boxShadow: '0 0 20px rgba(251, 191, 36, 0.3)'}}
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
