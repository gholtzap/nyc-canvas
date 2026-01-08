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
    <nav style={{background: 'rgba(255, 255, 255, 0.95)', backdropFilter: 'blur(12px)', borderBottom: '1.5px solid var(--cream-200)'}} className="sticky top-0 z-50 shadow-sm">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link href="/" className="flex items-center gap-2 group">
            <span className="text-2xl group-hover:scale-105 transition-transform">🗽</span>
            <span className="text-base font-display tracking-tight group-hover:opacity-70 transition-opacity" style={{color: 'var(--charcoal)'}}>
              NYC Explorer
            </span>
          </Link>

          <div className="flex gap-2 sm:gap-3 items-center">
            {user ? (
              <>
                <Link
                  href="/neighborhoods"
                  className={`px-3 sm:px-4 py-2 text-sm font-medium tracking-normal transition-all rounded-md ${
                    isActive('/neighborhoods')
                      ? 'text-white'
                      : ''
                  }`}
                  style={isActive('/neighborhoods') ? {background: 'var(--terracotta-500)'} : {color: 'var(--gray-600)'}}
                >
                  Neighborhoods
                </Link>
                <Link
                  href="/map"
                  className={`px-3 sm:px-4 py-2 text-sm font-medium tracking-normal transition-all rounded-md ${
                    isActive('/map')
                      ? 'text-white'
                      : ''
                  }`}
                  style={isActive('/map') ? {background: 'var(--terracotta-500)'} : {color: 'var(--gray-600)'}}
                >
                  Map
                </Link>

                <div className="hidden sm:flex items-center gap-3 ml-3 pl-4" style={{borderLeft: '1px solid var(--cream-200)'}}>
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-semibold" style={{background: 'linear-gradient(135deg, var(--terracotta-500), var(--amber-500))'}}>
                      {(user.name || user.email || '').charAt(0).toUpperCase()}
                    </div>
                    <span className="text-sm max-w-[120px] truncate" style={{color: 'var(--charcoal)'}}>
                      {user.name || user.email?.split('@')[0]}
                    </span>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="text-sm font-medium hover:opacity-70 transition-opacity"
                    style={{color: 'var(--gray-600)'}}
                  >
                    Logout
                  </button>
                </div>

                <button
                  onClick={handleLogout}
                  className="sm:hidden px-3 py-2 text-sm font-medium hover:opacity-70 transition-opacity"
                  style={{color: 'var(--gray-600)'}}
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link
                  href="/login"
                  className="px-4 py-2 text-sm font-medium hover:opacity-70 transition-opacity"
                  style={{color: 'var(--gray-600)'}}
                >
                  Sign In
                </Link>
                <Link
                  href="/register"
                  className="px-4 py-2 text-sm font-semibold rounded-lg text-white transition-all"
                  style={{background: 'var(--terracotta-500)', boxShadow: '0 2px 8px rgba(200, 90, 63, 0.2)'}}
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
