'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import Navbar from '@/components/Navbar';
import { 
  TrendingUp, 
  Users, 
  Video, 
  AlertTriangle, 
  Clock, 
  Download, 
  Calendar, 
  BarChart3, 
  HelpCircle,
  Activity,
  ArrowLeft
} from 'lucide-react';
import { 
  AreaChart, 
  Area, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';

// Dummy Analytics Metrics
const DUMMY_METRICS = {
  totalAttempts: 142,
  completionRate: 94.2,
  avgSessionDuration: 18.5,
  securityComplianceScore: 88.5
};

const ATTEMPTS_TIMELINE = [
  { name: 'Jan', completions: 12, warnings: 2 },
  { name: 'Feb', completions: 18, warnings: 5 },
  { name: 'Mar', completions: 26, warnings: 4 },
  { name: 'Apr', completions: 34, warnings: 9 },
  { name: 'May', completions: 52, warnings: 12 }
];

const COMPLIANCE_DISTRIBUTION = [
  { name: 'Tab Switch', count: 42, color: '#6366f1' },
  { name: 'No Face', count: 18, color: '#06b6d4' },
  { name: 'Multi-Face', count: 12, color: '#f59e0b' },
  { name: 'Mic Muted', count: 8, color: '#ef4444' }
];

const SCORE_DISTRIBUTION = [
  { range: '90-100', count: 32 },
  { range: '80-89', count: 48 },
  { range: '70-79', count: 38 },
  { range: '60-69', count: 18 },
  { range: 'Under 60', count: 6 }
];

export default function AdminAnalytics() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  
  // States
  const [filterTemplate, setFilterTemplate] = useState('all');
  const [timeRange, setTimeRange] = useState('30d');

  useEffect(() => {
    if (!authLoading && (!user || (user.role !== 'recruiter' && user.role !== 'admin'))) {
      router.push('/auth');
    }
  }, [user, authLoading]);

  if (authLoading) {
    return (
      <div className="min-h-screen bg-dark-bg flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-dark-bg font-sans">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-6 py-10 space-y-10">
        
        {/* Title Header and Controls */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="flex items-center gap-3">
            <button
              onClick={() => router.push('/recruiter/dashboard')}
              className="p-2 text-gray-400 hover:text-white rounded-xl hover:bg-white/5 transition"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <h1 className="font-outfit text-3xl font-extrabold text-white">Platform Intelligence</h1>
              <p className="text-gray-400 text-sm">Review global proctor audit histories, score densities, and session metrics.</p>
            </div>
          </div>

          {/* Time range selectors */}
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <select
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value)}
              className="py-2 px-3.5 rounded-xl text-xs text-gray-300 glass-input cursor-pointer"
            >
              <option value="7d">Last 7 Days</option>
              <option value="30d">Last 30 Days</option>
              <option value="90d">Last 90 Days</option>
            </select>

            <button className="flex items-center gap-1.5 bg-white/5 border border-white/8 hover:bg-white/10 text-white rounded-xl py-2 px-4 text-xs font-semibold transition active:scale-95">
              <Download className="w-4 h-4" />
              <span>Export CSV</span>
            </button>
          </div>
        </div>

        {/* Global Statistics Panel */}
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="glass-panel p-6 rounded-2xl flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-primary/10 border border-primary/20 text-primary flex items-center justify-center">
              <Users className="w-6 h-6" />
            </div>
            <div>
              <div className="text-xs text-gray-400 font-medium uppercase tracking-wider">Completions Ingested</div>
              <div className="text-2xl font-extrabold text-white mt-1">{DUMMY_METRICS.totalAttempts}</div>
            </div>
          </div>

          <div className="glass-panel p-6 rounded-2xl flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center">
              <TrendingUp className="w-6 h-6" />
            </div>
            <div>
              <div className="text-xs text-gray-400 font-medium uppercase tracking-wider">Completion Yield</div>
              <div className="text-2xl font-extrabold text-white mt-1">{DUMMY_METRICS.completionRate}%</div>
            </div>
          </div>

          <div className="glass-panel p-6 rounded-2xl flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 flex items-center justify-center">
              <Clock className="w-6 h-6" />
            </div>
            <div>
              <div className="text-xs text-gray-400 font-medium uppercase tracking-wider">Avg Session Time</div>
              <div className="text-2xl font-extrabold text-white mt-1">{DUMMY_METRICS.avgSessionDuration}m</div>
            </div>
          </div>

          <div className="glass-panel p-6 rounded-2xl flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center">
              <Activity className="w-6 h-6" />
            </div>
            <div>
              <div className="text-xs text-gray-400 font-medium uppercase tracking-wider">Compliance Index</div>
              <div className="text-2xl font-extrabold text-white mt-1">{DUMMY_METRICS.securityComplianceScore}%</div>
            </div>
          </div>
        </section>

        {/* Dynamic Charts Row */}
        <section className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Timeline completions */}
          <div className="lg:col-span-2 glass-panel p-6 rounded-3xl border border-white/8 flex flex-col gap-4">
            <h3 className="font-outfit text-base font-bold text-white">Completions & Warnings Trends</h3>
            
            <div className="h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={ATTEMPTS_TIMELINE} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="compGlow" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#6366f1" stopOpacity={0.2}/>
                      <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="warnGlow" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#ef4444" stopOpacity={0.15}/>
                      <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                  <XAxis dataKey="name" stroke="rgba(255,255,255,0.4)" fontSize={10} />
                  <YAxis stroke="rgba(255,255,255,0.4)" fontSize={10} />
                  <Tooltip contentStyle={{ backgroundColor: '#111827', borderColor: 'rgba(255,255,255,0.08)', borderRadius: '12px' }} />
                  <Area type="monotone" dataKey="completions" name="Sessions Finished" stroke="#6366f1" fillOpacity={1} fill="url(#compGlow)" strokeWidth={2.5} />
                  <Area type="monotone" dataKey="warnings" name="Warnings Issued" stroke="#ef4444" fillOpacity={1} fill="url(#warnGlow)" strokeWidth={1.5} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Compliance warnings split */}
          <div className="glass-panel p-6 rounded-3xl border border-white/8 flex flex-col justify-between gap-4">
            <h3 className="font-outfit text-base font-bold text-white">Proctor Violation Breakdown</h3>
            
            <div className="h-48 w-full relative flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={COMPLIANCE_DISTRIBUTION}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={75}
                    paddingAngle={4}
                    dataKey="count"
                  >
                    {COMPLIANCE_DISTRIBUTION.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ backgroundColor: '#111827', borderColor: 'rgba(255,255,255,0.08)', borderRadius: '12px' }} />
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute flex flex-col items-center">
                <span className="text-[10px] text-gray-500 font-bold uppercase">Total Warnings</span>
                <span className="text-2xl font-extrabold text-white mt-0.5">80</span>
              </div>
            </div>

            <div className="space-y-2">
              {COMPLIANCE_DISTRIBUTION.map((item, idx) => (
                <div key={idx} className="flex justify-between items-center text-xs">
                  <div className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                    <span className="text-gray-400 font-medium">{item.name}</span>
                  </div>
                  <span className="text-white font-bold">{item.count} alerts</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Scores densities histograms */}
        <section className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          <div className="glass-panel p-6 rounded-3xl border border-white/8 flex flex-col gap-4">
            <h3 className="font-outfit text-base font-bold text-white">Candidate Grades Density</h3>
            <p className="text-[11px] text-gray-500 mt-0.5">Statistical spread of candidate final AI scores completed this season.</p>
            
            <div className="h-56 w-full mt-2">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={SCORE_DISTRIBUTION} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                  <XAxis dataKey="range" stroke="rgba(255,255,255,0.4)" fontSize={9} />
                  <YAxis stroke="rgba(255,255,255,0.4)" fontSize={9} />
                  <Tooltip contentStyle={{ backgroundColor: '#111827', borderColor: 'rgba(255,255,255,0.08)', borderRadius: '12px' }} />
                  <Bar dataKey="count" name="Count Candidates" fill="#06b6d4" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Compliance rules configuration table */}
          <div className="lg:col-span-2 glass-panel p-6 rounded-3xl border border-white/8 flex flex-col gap-4">
            <h3 className="font-outfit text-base font-bold text-white">System Flags Regulations</h3>
            
            <div className="overflow-x-auto mt-2">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-white/5 bg-white/2 text-[10px] uppercase font-bold text-gray-500 tracking-wider">
                    <th className="pb-3 pl-3">Audit Metric</th>
                    <th className="pb-3 text-center">Trigger Mode</th>
                    <th className="pb-3 text-center">Deduction Index</th>
                    <th className="pb-3 text-right pr-3">System Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/4 text-gray-300 font-medium">
                  <tr>
                    <td className="py-3 pl-3 text-white font-bold">Window Tab Blur</td>
                    <td className="py-3 text-center text-accent">Real-Time JS focus</td>
                    <td className="py-3 text-center text-red-400 font-bold">-8 Confidence</td>
                    <td className="py-3 text-right pr-3 text-gray-400">Modal Warning Alert</td>
                  </tr>
                  <tr>
                    <td className="py-3 pl-3 text-white font-bold">Face Absence (No Face)</td>
                    <td className="py-3 text-center text-accent">Canvas face lock</td>
                    <td className="py-3 text-center text-red-400 font-bold">-5 Confidence</td>
                    <td className="py-3 text-right pr-3 text-gray-400">Webcam outline flash</td>
                  </tr>
                  <tr>
                    <td className="py-3 pl-3 text-white font-bold">Microphone Silent / Muted</td>
                    <td className="py-3 text-center text-accent">WebRTC track check</td>
                    <td className="py-3 text-center text-red-400 font-bold">-3 Composure</td>
                    <td className="py-3 text-right pr-3 text-gray-400">Audio Level indicator alert</td>
                  </tr>
                  <tr>
                    <td className="py-3 pl-3 text-white font-bold">Multiple Faces detected</td>
                    <td className="py-3 text-center text-accent">Canvas face lock</td>
                    <td className="py-3 text-center text-red-400 font-bold">-10 Confidence</td>
                    <td className="py-3 text-right pr-3 text-gray-400">Modal Warning Alert</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
