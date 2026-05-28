'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import Navbar from '@/components/Navbar';
import { Video, ShieldCheck, Mail, Lock, User as UserIcon, Briefcase, GraduationCap } from 'lucide-react';
import Link from 'next/link';

function AuthContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { login, register, user, loading } = useAuth();
  
  // Tabs: 'login' | 'register'
  const [activeTab, setActiveTab] = useState('login');
  // Roles: 'candidate' | 'recruiter'
  const [role, setRole] = useState('candidate');
  
  // Fields
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Extract query parameters for defaults
  useEffect(() => {
    const tabParam = searchParams.get('tab');
    const roleParam = searchParams.get('role');
    
    if (tabParam === 'register') {
      setActiveTab('register');
    } else {
      setActiveTab('login');
    }

    if (roleParam === 'recruiter') {
      setRole('recruiter');
    } else {
      setRole('candidate');
    }
  }, [searchParams]);

  // Redirect if already logged in
  useEffect(() => {
    if (!loading && user) {
      if (user.role === 'recruiter') {
        router.push('/recruiter/dashboard');
      } else if (user.role === 'candidate') {
        router.push('/candidate/dashboard');
      } else {
        // Unknown role, clear storage to break any infinite loops
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/auth';
      }
    }
  }, [user, loading, router]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setIsSubmitting(true);

    if (activeTab === 'login') {
      const res = await login(email, password);
      if (!res.success) {
        setErrorMsg(res.error || 'Invalid credentials');
        setIsSubmitting(false);
      }
    } else {
      if (!name) {
        setErrorMsg('Please enter your full name');
        setIsSubmitting(false);
        return;
      }
      const res = await register(name, email, password, role);
      if (!res.success) {
        setErrorMsg(res.error || 'Failed to register account');
        setIsSubmitting(false);
      }
    }
  };

  if (loading || (user && !isSubmitting)) {
    return (
      <div className="min-h-screen bg-dark-bg flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-dark-bg font-sans">
      <Navbar />

      <main className="flex-1 flex items-center justify-center px-6 py-12 relative overflow-hidden">
        {/* Ambient Glows */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-primary/5 blur-[100px] rounded-full pointer-events-none"></div>

        <div className="w-full max-w-lg glass-panel rounded-3xl p-8 md:p-10 shadow-2xl relative z-10 border border-white/8">
          
          {/* Logo Brand Header */}
          <div className="flex flex-col items-center text-center mb-8">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-primary to-accent flex items-center justify-center shadow-lg shadow-primary/20 mb-4">
              <Video className="w-6 h-6 text-white" />
            </div>
            <h2 className="font-outfit text-2xl font-bold text-white">
              {activeTab === 'login' ? 'Welcome Back to RetinaAI' : 'Create Your Platform Account'}
            </h2>
            <p className="text-gray-400 text-xs mt-1.5 max-w-xs">
              {activeTab === 'login' 
                ? 'Sign in to access your interview dashboard or review attempts.' 
                : 'Get access to automated questions, speech transcriptions, and scoring dashboards.'}
            </p>
          </div>

          {/* Alert messages */}
          {errorMsg && (
            <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-medium flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 flex-shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Form Actions Tabs */}
          <div className="grid grid-cols-2 p-1.5 bg-white/5 border border-white/5 rounded-2xl mb-8">
            <button
              onClick={() => {
                setActiveTab('login');
                setErrorMsg('');
              }}
              className={`py-2 rounded-xl text-xs font-semibold tracking-wide uppercase transition ${
                activeTab === 'login' 
                  ? 'bg-gradient-to-r from-primary to-secondary text-white shadow-lg' 
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              Sign In
            </button>
            <button
              onClick={() => {
                setActiveTab('register');
                setErrorMsg('');
              }}
              className={`py-2 rounded-xl text-xs font-semibold tracking-wide uppercase transition ${
                activeTab === 'register' 
                  ? 'bg-gradient-to-r from-primary to-secondary text-white shadow-lg' 
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              Create Account
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Full Name field (Register only) */}
            {activeTab === 'register' && (
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-gray-300">Full Name</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-gray-500">
                    <UserIcon className="w-4 h-4" />
                  </span>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Enter name"
                    className="w-full pl-10 pr-4 py-3 rounded-xl text-sm text-white glass-input font-medium"
                  />
                </div>
              </div>
            )}

            {/* Email field */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-gray-300">Email Address</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-gray-500">
                  <Mail className="w-4 h-4" />
                </span>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter email"
                  className="w-full pl-10 pr-4 py-3 rounded-xl text-sm text-white glass-input font-medium"
                />
              </div>
            </div>

            {/* Password field */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-gray-300">Password</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-gray-500">
                  <Lock className="w-4 h-4" />
                </span>
                <input
                  type="password"
                  required
                  minLength={6}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter password (min 6 characters)"
                  className="w-full pl-10 pr-4 py-3 rounded-xl text-sm text-white glass-input font-medium"
                />
              </div>
            </div>

            {/* Role selector (Register only) */}
            {activeTab === 'register' && (
              <div className="space-y-2 pt-2">
                <label className="text-xs font-semibold text-gray-300">Select Platform Role</label>
                <div className="grid grid-cols-2 gap-4">
                  <button
                    type="button"
                    onClick={() => setRole('candidate')}
                    className={`p-4 rounded-2xl border text-left flex flex-col gap-2 transition ${
                      role === 'candidate'
                        ? 'border-accent bg-accent/5'
                        : 'border-white/5 bg-white/2 hover:border-white/10'
                    }`}
                  >
                    <GraduationCap className={`w-5 h-5 ${role === 'candidate' ? 'text-accent' : 'text-gray-400'}`} />
                    <div>
                      <div className="text-xs font-bold text-white">Candidate</div>
                      <div className="text-4xs text-gray-400 leading-tight">Attend assessments, record questions.</div>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setRole('recruiter')}
                    className={`p-4 rounded-2xl border text-left flex flex-col gap-2 transition ${
                      role === 'recruiter'
                        ? 'border-primary bg-primary/5'
                        : 'border-white/5 bg-white/2 hover:border-white/10'
                    }`}
                  >
                    <Briefcase className={`w-5 h-5 ${role === 'recruiter' ? 'text-primary' : 'text-gray-400'}`} />
                    <div>
                      <div className="text-xs font-bold text-white">Recruiter</div>
                      <div className="text-4xs text-gray-400 leading-tight">Create slots, score attempts, watch videos.</div>
                    </div>
                  </button>
                </div>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full mt-4 flex items-center justify-center gap-2 bg-gradient-to-r from-primary to-secondary text-white font-semibold py-3.5 rounded-xl shadow-lg shadow-primary/20 hover:brightness-110 active:scale-95 transition disabled:opacity-50"
            >
              {isSubmitting ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : activeTab === 'login' ? (
                'Sign In'
              ) : (
                'Create Account'
              )}
            </button>
          </form>

          {/* Quick Mock Login helper links */}
          <div className="mt-8 text-center pt-6 border-t border-white/5">
            <span className="text-4xs font-bold text-gray-500 uppercase tracking-wide">Developer Sandbox Logins</span>
            <div className="grid grid-cols-2 gap-2 mt-3 text-4xs">
              <button
                onClick={() => {
                  setEmail('recruiter@sandbox.com');
                  setPassword('password123');
                  setActiveTab('login');
                }}
                className="py-1.5 px-2 bg-white/2 hover:bg-white/5 border border-white/5 rounded-lg text-gray-300 hover:text-white transition text-center"
              >
                Recruiter Sandbox (recruiter@sandbox.com)
              </button>
              <button
                onClick={() => {
                  setEmail('candidate@sandbox.com');
                  setPassword('password123');
                  setActiveTab('login');
                }}
                className="py-1.5 px-2 bg-white/2 hover:bg-white/5 border border-white/5 rounded-lg text-gray-300 hover:text-white transition text-center"
              >
                Candidate Sandbox (candidate@sandbox.com)
              </button>
            </div>
            {/* Short note */}
            <p className="text-[10px] text-gray-500 mt-3">Using these buttons auto-fills mock credentials for easy sandbox testing. (Default pw: password123)</p>
          </div>
        </div>
      </main>
    </div>
  );
}

export default function AuthPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-dark-bg flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    }>
      <AuthContent />
    </Suspense>
  );
}
