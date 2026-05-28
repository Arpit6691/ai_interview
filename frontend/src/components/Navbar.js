'use client';

import React from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { Video, LogOut, User, LayoutDashboard, Settings } from 'lucide-react';

export default function Navbar() {
  const { user, logout } = useAuth();

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-white/8 bg-dark-bg/60 backdrop-blur-md px-6 py-4 flex items-center justify-between">
      <div className="flex items-center gap-2">
        <Link href="/" className="flex items-center gap-2 group">
          <div className="relative w-10 h-10 rounded-xl bg-gradient-to-tr from-primary to-accent flex items-center justify-center shadow-lg shadow-primary/20">
            <Video className="w-5 h-5 text-white" />
            <div className="absolute inset-0 rounded-xl bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          </div>
          <span className="font-outfit text-xl font-bold tracking-tight bg-gradient-to-r from-white via-gray-200 to-gray-400 bg-clip-text text-transparent">
            Retina<span className="text-accent">AI</span>
          </span>
        </Link>
      </div>

      <div className="flex items-center gap-4">
        {user ? (
          <>
            <Link
              href={user.role === 'recruiter' ? '/recruiter/dashboard' : '/candidate/dashboard'}
              className="flex items-center gap-1.5 text-sm text-gray-300 hover:text-white transition px-3 py-1.5 rounded-lg hover:bg-white/5"
            >
              <LayoutDashboard className="w-4 h-4 text-accent" />
              <span>Dashboard</span>
            </Link>
            
            <div className="h-4 w-px bg-white/10" />

            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 bg-white/5 border border-white/8 rounded-full py-1 px-3">
                <div className="w-5 h-5 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-[10px] font-bold text-white uppercase">
                  {user.name.charAt(0)}
                </div>
                <span className="text-xs text-gray-300 font-medium hidden md:inline">
                  {user.name} ({user.role})
                </span>
              </div>

              <button
                onClick={logout}
                className="flex items-center justify-center p-2 rounded-xl text-gray-400 hover:text-red-400 hover:bg-red-500/10 transition border border-transparent hover:border-red-500/20"
                title="Log Out"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          </>
        ) : (
          <div className="flex items-center gap-3">
            <Link
              href="/auth"
              className="text-sm font-medium text-gray-300 hover:text-white transition px-4 py-2"
            >
              Sign In
            </Link>
            <Link
              href="/auth?tab=register"
              className="text-sm font-medium bg-gradient-to-r from-primary to-secondary text-white rounded-xl px-5 py-2.5 shadow-lg shadow-primary/20 hover:shadow-primary/30 transition hover:brightness-110 active:scale-95"
            >
              Get Started
            </Link>
          </div>
        )}
      </div>
    </nav>
  );
}
