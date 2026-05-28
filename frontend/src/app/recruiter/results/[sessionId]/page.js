'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import Navbar from '@/components/Navbar';
import {
  User, AlertTriangle, Brain, FileText, Video,
  ChevronLeft, CheckCircle, Clock, Star, TrendingUp, Shield
} from 'lucide-react';
import {
  RadarChart, Radar, PolarGrid, PolarAngleAxis,
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis,
  Tooltip, CartesianGrid
} from 'recharts';

// Demo fallback data
const DEMO_RESULT = {
  session: {
    _id: 'demo_session',
    status: 'completed',
    warningsCount: 1,
    startedAt: '2026-05-27T10:00:00Z',
    completedAt: '2026-05-27T10:25:00Z',
    candidate: { name: 'Sarah Jenkins', email: 'sarah.j@gmail.com' },
    interview: {
      title: 'Senior Full Stack Engineer',
      questions: [
        { _id: 'q1', text: 'Please introduce yourself and describe your professional background.', timeLimit: 60 },
        { _id: 'q2', text: 'What is your greatest technical strength?', timeLimit: 90 },
        { _id: 'q3', text: 'Describe a challenging project you overcame.', timeLimit: 90 },
      ]
    }
  },
  evaluation: {
    status: 'completed',
    scores: { overall: 89, communication: 90, confidence: 92, technical: 85 },
    feedback: 'The candidate demonstrated strong communication skills across all questions. Their answers showed solid technical knowledge with confident delivery.',
    suggestions: [
      'Strong candidate — recommend for next round.',
      'Proctoring compliance was satisfactory.',
      'Encourage more concise responses to maximize clarity under time constraints.',
    ]
  },
  transcripts: [
    { _id: 't1', question: { text: 'Please introduce yourself and describe your professional background.' }, text: "I have 6 years of experience in full-stack development, primarily using React and Node.js. I've worked at two startups and led engineering teams of up to 5 developers. I'm passionate about building scalable web applications and have recently been exploring serverless architectures.", confidence: 0.94 },
    { _id: 't2', question: { text: 'What is your greatest technical strength?' }, text: 'My greatest strength is system design. I can translate complex business requirements into clean, maintainable architecture. I am very comfortable designing REST APIs, managing state efficiently in React, and optimizing database queries in both PostgreSQL and MongoDB.', confidence: 0.91 },
    { _id: 't3', question: { text: 'Describe a challenging project you overcame.' }, text: 'One of the hardest projects was re-architecting a monolithic Python backend into microservices. There were tight deadlines, legacy code, and limited documentation. I created a migration plan, wrote comprehensive tests, and coordinated the rollout over 6 weeks without any downtime.', confidence: 0.89 },
  ],
  suspiciousActivities: [
    { _id: 'sa1', type: 'tab-switch', timestamp: '2026-05-27T10:12:00Z', details: 'Candidate switched browser tab during Question 2' },
  ]
};

export default function RecruiterResultsPage() {
  const router = useRouter();
  const params = useParams();
  const { user, loading: authLoading, authFetch } = useAuth();
  const sessionId = params?.sessionId;

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    if (!authLoading && (!user || user.role !== 'recruiter')) {
      router.push('/auth');
    }
  }, [user, authLoading]);

  useEffect(() => {
    if (!user || authLoading) return;

    const load = async () => {
      try {
        const res = await authFetch(`/sessions/${sessionId}/results`);
        setData(res.success ? res : DEMO_RESULT);
      } catch {
        setData(DEMO_RESULT);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [user, authLoading]);

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-[#090d16] flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  const { session, evaluation, transcripts, suspiciousActivities } = data || DEMO_RESULT;
  const scores = evaluation?.scores || {};

  const radarData = [
    { skill: 'Communication', value: scores.communication || 0 },
    { skill: 'Confidence', value: scores.confidence || 0 },
    { skill: 'Technical', value: scores.technical || 0 },
    { skill: 'Clarity', value: Math.round((scores.communication + scores.technical) / 2) || 0 },
    { skill: 'Composure', value: Math.max(0, (scores.confidence || 0) - (session?.warningsCount || 0) * 5) },
  ];

  const scoreColor = (s) =>
    s >= 80 ? 'text-emerald-400' : s >= 65 ? 'text-yellow-400' : 'text-red-400';

  const tabs = [
    { id: 'overview', label: 'Overview', icon: TrendingUp },
    { id: 'transcripts', label: 'Transcripts', icon: FileText },
    { id: 'proctoring', label: 'Proctoring', icon: Shield },
  ];

  return (
    <div className="min-h-screen bg-[#090d16]">
      <Navbar />

      <main className="max-w-6xl mx-auto px-6 py-10 space-y-8">
        {/* Back button + header */}
        <div className="flex flex-col gap-4">
          <button
            onClick={() => router.push('/recruiter/dashboard')}
            className="flex items-center gap-2 text-gray-400 hover:text-white text-sm font-medium transition w-fit"
          >
            <ChevronLeft className="w-4 h-4" />
            Back to Dashboard
          </button>

          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h1 className="text-2xl font-extrabold text-white" style={{ fontFamily: 'Outfit, sans-serif' }}>
                Session Results
              </h1>
              <p className="text-gray-400 text-sm mt-1">
                {session?.interview?.title} · {session?.candidate?.name}
              </p>
            </div>

            <div className={`text-3xl font-extrabold ${scoreColor(scores.overall)}`}>
              {scores.overall}%
              <div className="text-xs font-normal text-gray-500 text-right">Overall Score</div>
            </div>
          </div>
        </div>

        {/* Candidate Card */}
        <div className="bg-white/3 border border-white/8 rounded-2xl p-6 flex flex-col sm:flex-row justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
              <User className="w-6 h-6" />
            </div>
            <div>
              <div className="text-white font-bold">{session?.candidate?.name}</div>
              <div className="text-gray-500 text-xs">{session?.candidate?.email}</div>
            </div>
          </div>

          <div className="flex flex-wrap gap-6 text-xs">
            <div>
              <div className="text-gray-500 uppercase tracking-wider font-bold mb-1">Started</div>
              <div className="text-white font-semibold">
                {new Date(session?.startedAt).toLocaleString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
              </div>
            </div>
            <div>
              <div className="text-gray-500 uppercase tracking-wider font-bold mb-1">Completed</div>
              <div className="text-white font-semibold">
                {session?.completedAt ? new Date(session.completedAt).toLocaleString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }) : '—'}
              </div>
            </div>
            <div>
              <div className="text-gray-500 uppercase tracking-wider font-bold mb-1">Proctoring</div>
              <div className={`font-bold ${session?.warningsCount > 2 ? 'text-red-400' : session?.warningsCount > 0 ? 'text-yellow-400' : 'text-emerald-400'}`}>
                {session?.warningsCount || 0} Incidents
              </div>
            </div>
            <div>
              <div className="text-gray-500 uppercase tracking-wider font-bold mb-1">Status</div>
              <div className="flex items-center gap-1 text-emerald-400 font-bold">
                <CheckCircle className="w-3.5 h-3.5" />
                Completed
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 border-b border-white/8 pb-0">
          {tabs.map(t => (
            <button
              key={t.id}
              onClick={() => setActiveTab(t.id)}
              className={`flex items-center gap-2 px-4 py-3 text-sm font-semibold border-b-2 transition -mb-px ${
                activeTab === t.id
                  ? 'border-indigo-500 text-white'
                  : 'border-transparent text-gray-500 hover:text-gray-300'
              }`}
            >
              <t.icon className="w-4 h-4" />
              {t.label}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Score metrics */}
            <div className="space-y-4">
              <h2 className="text-lg font-bold text-white" style={{ fontFamily: 'Outfit, sans-serif' }}>Score Breakdown</h2>
              {[
                { label: 'Communication', value: scores.communication, color: '#6366f1' },
                { label: 'Confidence', value: scores.confidence, color: '#06b6d4' },
                { label: 'Technical Knowledge', value: scores.technical, color: '#10b981' },
                { label: 'Overall Score', value: scores.overall, color: '#f59e0b' },
              ].map((item) => (
                <div key={item.label} className="space-y-2">
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-gray-300 font-medium">{item.label}</span>
                    <span className="font-bold text-white">{item.value}%</span>
                  </div>
                  <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-700"
                      style={{ width: `${item.value}%`, backgroundColor: item.color }}
                    />
                  </div>
                </div>
              ))}

              {/* AI Feedback */}
              <div className="mt-6 p-5 bg-indigo-500/5 border border-indigo-500/15 rounded-2xl space-y-3">
                <div className="flex items-center gap-2 text-sm font-bold text-indigo-400">
                  <Brain className="w-4 h-4" />
                  AI Feedback Summary
                </div>
                <p className="text-gray-300 text-sm leading-relaxed">{evaluation?.feedback}</p>
                <ul className="space-y-2 mt-2">
                  {evaluation?.suggestions?.map((s, i) => (
                    <li key={i} className="flex items-start gap-2 text-xs text-gray-400">
                      <Star className="w-3.5 h-3.5 text-yellow-400 mt-0.5 flex-shrink-0" />
                      {s}
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Radar Chart */}
            <div className="space-y-4">
              <h2 className="text-lg font-bold text-white" style={{ fontFamily: 'Outfit, sans-serif' }}>Competency Radar</h2>
              <div className="bg-white/3 border border-white/8 rounded-2xl p-4 h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <RadarChart data={radarData}>
                    <PolarGrid stroke="rgba(255,255,255,0.08)" />
                    <PolarAngleAxis dataKey="skill" tick={{ fill: 'rgba(255,255,255,0.5)', fontSize: 11 }} />
                    <Radar name="Score" dataKey="value" stroke="#6366f1" fill="#6366f1" fillOpacity={0.15} strokeWidth={2} />
                  </RadarChart>
                </ResponsiveContainer>
              </div>

              {/* Bar chart */}
              <div className="bg-white/3 border border-white/8 rounded-2xl p-4 h-48">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={[
                    { name: 'Comm.', value: scores.communication },
                    { name: 'Conf.', value: scores.confidence },
                    { name: 'Tech.', value: scores.technical },
                    { name: 'Overall', value: scores.overall },
                  ]} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                    <XAxis dataKey="name" stroke="rgba(255,255,255,0.3)" fontSize={10} />
                    <YAxis domain={[0, 100]} stroke="rgba(255,255,255,0.3)" fontSize={10} />
                    <Tooltip contentStyle={{ backgroundColor: '#111827', borderColor: 'rgba(255,255,255,0.08)', borderRadius: '12px', fontSize: '12px' }} />
                    <Bar dataKey="value" fill="#6366f1" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'transcripts' && (
          <div className="space-y-6">
            <h2 className="text-lg font-bold text-white" style={{ fontFamily: 'Outfit, sans-serif' }}>
              Response Transcripts
            </h2>
            {transcripts?.length === 0 && (
              <div className="text-center py-12 text-gray-500 text-sm">No transcripts available yet.</div>
            )}
            {transcripts?.map((t, idx) => (
              <div key={t._id} className="bg-white/3 border border-white/8 rounded-2xl p-6 space-y-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-3">
                    <div className="w-7 h-7 rounded-full bg-indigo-500/20 border border-indigo-500/30 text-indigo-400 text-xs font-bold flex items-center justify-center flex-shrink-0 mt-0.5">
                      {idx + 1}
                    </div>
                    <p className="text-sm font-semibold text-white">
                      {t.question?.text || session?.interview?.questions?.[idx]?.text}
                    </p>
                  </div>
                  {t.confidence && (
                    <span className="text-xs text-gray-500 bg-white/5 border border-white/8 px-2 py-1 rounded-lg flex-shrink-0">
                      {Math.round(t.confidence * 100)}% conf.
                    </span>
                  )}
                </div>
                <div className="bg-black/30 border border-white/5 rounded-xl p-4">
                  <p className="text-gray-300 text-sm leading-relaxed">{t.text}</p>
                </div>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'proctoring' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-white" style={{ fontFamily: 'Outfit, sans-serif' }}>Proctoring Log</h2>
              <span className={`text-xs font-bold px-3 py-1.5 rounded-full ${
                (session?.warningsCount || 0) === 0
                  ? 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-400'
                  : 'bg-red-500/10 border border-red-500/20 text-red-400'
              }`}>
                {session?.warningsCount || 0} Incident{(session?.warningsCount || 0) !== 1 ? 's' : ''} Detected
              </span>
            </div>

            {suspiciousActivities?.length === 0 && (
              <div className="text-center py-12 space-y-3">
                <CheckCircle className="w-12 h-12 text-emerald-400 mx-auto" />
                <p className="text-gray-400 text-sm">No proctoring incidents detected. Clean session.</p>
              </div>
            )}

            {suspiciousActivities?.map((activity) => (
              <div key={activity._id} className="flex gap-4 p-5 bg-red-500/5 border border-red-500/15 rounded-2xl">
                <div className="w-9 h-9 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center justify-center flex-shrink-0">
                  <AlertTriangle className="w-4 h-4 text-red-400" />
                </div>
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-white capitalize">
                      {activity.type?.replace(/-/g, ' ')}
                    </span>
                    <span className="text-xs text-gray-500">
                      {new Date(activity.timestamp).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                    </span>
                  </div>
                  <p className="text-xs text-gray-400">{activity.details}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
