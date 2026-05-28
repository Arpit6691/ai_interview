'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import Navbar from '@/components/Navbar';
import { 
  FileText, 
  Play, 
  CheckCircle, 
  Clock, 
  AlertCircle, 
  ChevronRight, 
  ArrowRight, 
  User, 
  Sparkles,
  Calendar
} from 'lucide-react';

// Realistic sandbox fallback data
const DUMMY_INTERVIEWS = [
  {
    _id: 'i1',
    title: 'Senior Full Stack Engineer',
    description: 'Assessment covering React, Node.js, databases, and WebSockets performance design.',
    durationLimit: 20,
    questions: [{}, {}, {}],
    createdAt: '2026-05-20T10:00:00Z'
  },
  {
    _id: 'i2',
    title: 'Junior Frontend Developer',
    description: 'HTML5, CSS layout features, and basic JavaScript hooks challenge.',
    durationLimit: 10,
    questions: [{}, {}],
    createdAt: '2026-05-22T14:30:00Z'
  }
];

const DUMMY_ATTEMPTS = [
  {
    _id: 'c3',
    interview: { title: 'Junior Frontend Developer', _id: 'i2' },
    status: 'completed',
    warningsCount: 1,
    startedAt: '2026-05-25T11:00:00Z',
    evaluation: { scores: { overall: 78 } }
  }
];

export default function CandidateDashboard() {
  const router = useRouter();
  const { user, loading: authLoading, authFetch } = useAuth();

  // Page States
  const [interviews, setInterviews] = useState([]);
  const [attempts, setAttempts] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    try {
      setLoading(true);
      const interviewRes = await authFetch('/interviews');
      const attemptRes = await authFetch('/sessions/candidate');

      if (interviewRes.success) {
        setInterviews(interviewRes.interviews);
      } else {
        setInterviews(DUMMY_INTERVIEWS);
      }

      if (attemptRes.success) {
        setAttempts(attemptRes.sessions);
      } else {
        setAttempts(DUMMY_ATTEMPTS);
      }
    } catch (err) {
      console.warn('Backend server unreached, rendering mock candidate dashboard sandbox.');
      setInterviews(DUMMY_INTERVIEWS);
      setAttempts(DUMMY_ATTEMPTS);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!authLoading && (!user || user.role !== 'candidate')) {
      router.push('/auth');
      return;
    }
    if (user) {
      loadData();
    }
  }, [user, authLoading]);

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-dark-bg flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-dark-bg font-sans">
      <Navbar />

      <main className="flex-1 max-w-5xl w-full mx-auto px-6 py-10 space-y-12">
        
        {/* Header Greeting */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <span className="text-4xs font-bold text-accent uppercase tracking-wider bg-accent/10 border border-accent/20 px-3 py-1 rounded-full">
              Assessment Portal
            </span>
            <h1 className="font-outfit text-3xl font-extrabold text-white mt-3">
              Hello, {user?.name}
            </h1>
            <p className="text-gray-400 text-sm">Review assigned screenings and view evaluation score feedback.</p>
          </div>
        </div>

        {/* Live Active Assessments Section */}
        <section className="space-y-6">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-accent animate-pulse" />
            <h2 className="font-outfit text-xl font-bold text-white">Available Interviews</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {interviews.map((interview) => {
              // Check if candidate already has a completed attempt for this interview
              const hasCompleted = attempts.some(a => a.interview?._id === interview._id && a.status === 'completed');
              const activeAttempt = attempts.find(a => a.interview?._id === interview._id && a.status === 'started');
              
              return (
                <div key={interview._id} className="glass-panel p-6 rounded-3xl border border-white/8 hover:border-primary/30 transition-all flex flex-col justify-between gap-6 relative overflow-hidden group">
                  <div className="space-y-3">
                    <div className="flex justify-between items-start">
                      <h3 className="font-outfit text-lg font-bold text-white group-hover:text-accent transition-colors truncate max-w-[200px]">{interview.title}</h3>
                      <span className="text-[10px] text-gray-500 font-semibold bg-white/5 border border-white/5 px-2 py-0.5 rounded-lg">
                        {interview.questions?.length || 0} Questions
                      </span>
                    </div>
                    <p className="text-xs text-gray-400 leading-relaxed line-clamp-2">{interview.description}</p>
                  </div>

                  <div className="flex justify-between items-center pt-4 border-t border-white/5">
                    <span className="text-[10px] text-gray-500 font-medium">Timer limit: {interview.durationLimit} mins</span>
                    
                    {hasCompleted ? (
                      <span className="text-emerald-400 font-bold text-xs bg-emerald-400/10 border border-emerald-400/20 px-3 py-1.5 rounded-xl flex items-center gap-1">
                        <CheckCircle className="w-3.5 h-3.5" />
                        <span>Submitted</span>
                      </span>
                    ) : activeAttempt ? (
                      <button
                        onClick={() => router.push(`/candidate/hardware-check/${interview._id}`)}
                        className="bg-accent hover:bg-accent/80 text-black font-bold text-xs px-4 py-2 rounded-xl flex items-center gap-1 shadow-lg shadow-accent/20 active:scale-95 transition"
                      >
                        <span>Resume Attempt</span>
                        <ArrowRight className="w-4 h-4" />
                      </button>
                    ) : (
                      <button
                        onClick={() => router.push(`/candidate/hardware-check/${interview._id}`)}
                        className="bg-gradient-to-r from-primary to-secondary text-white font-bold text-xs px-5 py-2.5 rounded-xl flex items-center gap-1 shadow-lg shadow-primary/20 active:scale-95 transition"
                      >
                        <span>Start Assessment</span>
                        <ArrowRight className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
            {interviews.length === 0 && (
              <div className="col-span-2 text-center py-12 text-gray-500 text-xs">
                No active interview requests assigned. Contact your recruiter.
              </div>
            )}
          </div>
        </section>

        {/* Candidate attempts progress history */}
        <section className="space-y-6">
          <div className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-gray-400" />
            <h2 className="font-outfit text-xl font-bold text-white font-outfit">Your Submission History</h2>
          </div>

          <div className="glass-panel rounded-3xl overflow-hidden border border-white/8">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-white/5 bg-white/2 text-[10px] uppercase font-bold text-gray-400 tracking-wider">
                    <th className="px-6 py-4">Assessment Title</th>
                    <th className="px-6 py-4">Attempt Status</th>
                    <th className="px-6 py-4 text-center">Score Grade</th>
                    <th className="px-6 py-4 text-center">Compliance Alert Flags</th>
                    <th className="px-6 py-4 text-right">Attempt Date</th>
                    <th className="px-6 py-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/4 text-xs font-medium text-gray-300">
                  {attempts.map((att) => (
                    <tr key={att._id} className="hover:bg-white/2 transition">
                      <td className="px-6 py-4">
                        <span className="text-white font-bold">{att.interview?.title}</span>
                      </td>
                      <td className="px-6 py-4">
                        {att.status === 'completed' ? (
                          <span className="inline-flex items-center gap-1 text-emerald-400 bg-emerald-400/10 border border-emerald-400/20 px-2 py-0.5 rounded-lg text-4xs uppercase font-bold">
                            <CheckCircle className="w-3 h-3" />
                            <span>Submitted</span>
                          </span>
                        ) : att.status === 'processing' ? (
                          <span className="inline-flex items-center gap-1 text-accent bg-accent/10 border border-accent/20 px-2 py-0.5 rounded-lg text-4xs uppercase font-bold">
                            <Clock className="w-3 h-3 animate-spin" />
                            <span>Processing</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-yellow-500 bg-yellow-500/10 border border-yellow-500/20 px-2 py-0.5 rounded-lg text-4xs uppercase font-bold">
                            <Clock className="w-3 h-3" />
                            <span>Draft</span>
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-center">
                        {att.status === 'completed' && att.evaluation?.scores?.overall ? (
                          <span className="text-white font-bold text-sm">{att.evaluation.scores.overall}%</span>
                        ) : (
                          <span className="text-gray-500">Pending AI Audit</span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-center">
                        {att.warningsCount > 2 ? (
                          <span className="inline-flex items-center gap-1 text-red-400 font-bold">
                            <AlertCircle className="w-3.5 h-3.5" />
                            <span>{att.warningsCount} Flags</span>
                          </span>
                        ) : (
                          <span className="text-emerald-400 font-semibold">{att.warningsCount || 0} Incident</span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-right text-gray-400 text-3xs font-semibold">
                        {new Date(att.startedAt).toLocaleDateString(undefined, {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric'
                        })}
                      </td>
                      <td className="px-6 py-4 text-right">
                        {att.status === 'completed' && (
                          <button
                            onClick={() => router.push(`/candidate/results/${att._id}`)}
                            className="inline-flex items-center gap-1 bg-white/5 border border-white/8 hover:bg-primary/20 hover:border-primary/40 text-white rounded-lg py-1.5 px-3 font-semibold transition active:scale-95 text-xs"
                          >
                            <span>Review</span>
                            <ChevronRight className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                  {attempts.length === 0 && (
                    <tr>
                      <td colSpan={6} className="text-center py-10 text-gray-500 text-xs">
                        You have not attempted any interviews yet.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
