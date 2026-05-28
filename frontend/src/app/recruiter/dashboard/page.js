'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import Navbar from '@/components/Navbar';
import { 
  Users, 
  Video, 
  AlertTriangle, 
  Brain, 
  Plus, 
  Search, 
  Filter, 
  Calendar, 
  ChevronRight,
  Trash2,
  CheckCircle,
  Clock,
  ExternalLink,
  PlusCircle,
  X
} from 'lucide-react';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  BarChart,
  Bar
} from 'recharts';

// Realistic fallback recruiter dummy data
const DUMMY_METRICS = {
  totalInterviews: 4,
  totalCandidates: 18,
  avgScore: 82,
  warningIncidents: 6
};

const DUMMY_INTERVIEWS = [
  {
    _id: 'i1',
    title: 'Senior Full Stack Engineer',
    description: 'Assessment for advanced React, Node.js state, and system scalability topics.',
    durationLimit: 20,
    questions: [
      { text: 'Describe your background and core stack.', timeLimit: 60 },
      { text: 'Explain the difference between SQL and NoSQL databases.', timeLimit: 90 },
      { text: 'How do you minimize latency in WebSocket applications?', timeLimit: 90 }
    ],
    createdAt: '2026-05-20T10:00:00Z',
    status: 'active'
  },
  {
    _id: 'i2',
    title: 'Junior Frontend Developer',
    description: 'HTML5, CSS, and basic JavaScript hooks challenge.',
    durationLimit: 10,
    questions: [
      { text: 'Walk us through your experience in React.', timeLimit: 60 },
      { text: 'Explain how CSS layouts grid vs flexbox differ.', timeLimit: 90 }
    ],
    createdAt: '2026-05-22T14:30:00Z',
    status: 'active'
  }
];

const DUMMY_CANDIDATES = [
  {
    _id: 'c1',
    candidate: { name: 'Sarah Jenkins', email: 'sarah.j@gmail.com' },
    interview: { title: 'Senior Full Stack Engineer', _id: 'i1' },
    status: 'completed',
    warningsCount: 0,
    startedAt: '2026-05-27T09:15:00Z',
    completedAt: '2026-05-27T09:40:00Z',
    evaluation: { scores: { overall: 89, communication: 90, confidence: 92, technical: 85 } }
  },
  {
    _id: 'c2',
    candidate: { name: 'Marcus Sterling', email: 'marcus.s@outlook.com' },
    interview: { title: 'Senior Full Stack Engineer', _id: 'i1' },
    status: 'completed',
    warningsCount: 4,
    startedAt: '2026-05-26T15:10:00Z',
    completedAt: '2026-05-26T15:35:00Z',
    evaluation: { scores: { overall: 65, communication: 75, confidence: 50, technical: 70 } }
  },
  {
    _id: 'c3',
    candidate: { name: 'Emily Chen', email: 'emily.chen@tech.io' },
    interview: { title: 'Junior Frontend Developer', _id: 'i2' },
    status: 'completed',
    warningsCount: 1,
    startedAt: '2026-05-25T11:00:00Z',
    completedAt: '2026-05-25T11:20:00Z',
    evaluation: { scores: { overall: 78, communication: 82, confidence: 75, technical: 77 } }
  },
  {
    _id: 'c4',
    candidate: { name: 'Devon Miller', email: 'devon@miller.dev' },
    interview: { title: 'Senior Full Stack Engineer', _id: 'i1' },
    status: 'processing',
    warningsCount: 0,
    startedAt: '2026-05-28T08:00:00Z',
    evaluation: { scores: { overall: 0 } }
  }
];

const CHART_DATA = [
  { name: 'May 22', candidates: 2, avgScore: 78 },
  { name: 'May 23', candidates: 5, avgScore: 82 },
  { name: 'May 24', candidates: 3, avgScore: 80 },
  { name: 'May 25', candidates: 4, avgScore: 85 },
  { name: 'May 26', candidates: 8, avgScore: 79 },
  { name: 'May 27', candidates: 12, avgScore: 82 }
];

export default function RecruiterDashboard() {
  const router = useRouter();
  const { user, loading: authLoading, authFetch } = useAuth();

  // Page States
  const [interviews, setInterviews] = useState([]);
  const [candidates, setCandidates] = useState([]);
  const [metrics, setMetrics] = useState(DUMMY_METRICS);
  const [loading, setLoading] = useState(true);

  // Search & Filters
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [interviewFilter, setInterviewFilter] = useState('all');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [newDuration, setNewDuration] = useState(15);
  const [newQuestions, setNewQuestions] = useState([
    { text: 'Please introduce yourself and explain your core tech stack.', timeLimit: 60 }
  ]);
  const [creating, setCreating] = useState(false);

  // Fetch Dashboard data
  const loadData = async () => {
    try {
      setLoading(true);
      
      // Attempt backend call
      const interviewRes = await authFetch('/interviews');
      const sessionRes = await authFetch('/sessions/recruiter');
      
      if (interviewRes.success) {
        setInterviews(interviewRes.interviews);
      } else {
        setInterviews(DUMMY_INTERVIEWS);
      }

      if (sessionRes.success) {
        setCandidates(sessionRes.sessions);
        
        // Calculate dynamic metrics
        const completed = sessionRes.sessions.filter(s => s.status === 'completed');
        const totalW = sessionRes.sessions.reduce((acc, s) => acc + (s.warningsCount || 0), 0);
        const scoresSum = completed.reduce((acc, s) => acc + (s.evaluation?.scores?.overall || 0), 0);
        
        setMetrics({
          totalInterviews: interviewRes.interviews.length || DUMMY_METRICS.totalInterviews,
          totalCandidates: sessionRes.sessions.length,
          avgScore: completed.length > 0 ? Math.round(scoresSum / completed.length) : 0,
          warningIncidents: totalW
        });
      } else {
        setCandidates(DUMMY_CANDIDATES);
        setMetrics(DUMMY_METRICS);
      }
    } catch (err) {
      console.warn('Backend server unreached, rendering dummy mockup sandbox metrics.');
      setInterviews(DUMMY_INTERVIEWS);
      setCandidates(DUMMY_CANDIDATES);
      setMetrics(DUMMY_METRICS);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!authLoading && (!user || user.role !== 'recruiter')) {
      router.push('/auth');
      return;
    }
    if (user) {
      loadData();
    }
  }, [user, authLoading]);

  // Questions addition helper inside modal
  const addQuestionField = () => {
    setNewQuestions([...newQuestions, { text: '', timeLimit: 60 }]);
  };

  const removeQuestionField = (idx) => {
    if (newQuestions.length === 1) return;
    setNewQuestions(newQuestions.filter((_, i) => i !== idx));
  };

  const updateQuestionText = (idx, val) => {
    const updated = [...newQuestions];
    updated[idx].text = val;
    setNewQuestions(updated);
  };

  const updateQuestionTime = (idx, val) => {
    const updated = [...newQuestions];
    updated[idx].timeLimit = Number(val);
    setNewQuestions(updated);
  };

  // Submit interview form
  const handleCreateInterview = async (e) => {
    e.preventDefault();
    if (!newTitle || !newDesc) return;
    
    setCreating(true);
    try {
      const body = {
        title: newTitle,
        description: newDesc,
        durationLimit: newDuration,
        questions: newQuestions.filter(q => q.text.trim() !== '')
      };

      const res = await authFetch('/interviews', {
        method: 'POST',
        body: JSON.stringify(body)
      });

      if (res.success) {
        setIsModalOpen(false);
        // Clear
        setNewTitle('');
        setNewDesc('');
        setNewDuration(15);
        setNewQuestions([{ text: 'Please introduce yourself and explain your core tech stack.', timeLimit: 60 }]);
        // Refresh
        await loadData();
      } else {
        alert(res.error || 'Failed to create interview');
      }
    } catch (err) {
      // Fallback behavior: Add to current dummy list
      const mockNew = {
        _id: 'mock_' + Date.now(),
        title: newTitle,
        description: newDesc,
        durationLimit: newDuration,
        questions: newQuestions,
        createdAt: new Date().toISOString(),
        status: 'active'
      };
      setInterviews([...interviews, mockNew]);
      setIsModalOpen(false);
      setNewTitle('');
      setNewDesc('');
      setNewDuration(15);
      setNewQuestions([{ text: 'Please introduce yourself and explain your core tech stack.', timeLimit: 60 }]);
    } finally {
      setCreating(false);
    }
  };

  // Filter calculations
  const filteredCandidates = candidates.filter(cand => {
    const nameMatch = cand.candidate?.name.toLowerCase().includes(search.toLowerCase()) || 
                      cand.candidate?.email.toLowerCase().includes(search.toLowerCase());
    
    const statusMatch = statusFilter === 'all' || 
                        (statusFilter === 'warnings' && cand.warningsCount > 2) ||
                        cand.status === statusFilter;

    const interviewMatch = interviewFilter === 'all' || cand.interview?.title === interviewFilter || cand.interview?._id === interviewFilter;

    return nameMatch && statusMatch && interviewMatch;
  });

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

      <main className="flex-1 max-w-7xl w-full mx-auto px-6 py-10 space-y-10">
        
        {/* Dashboard Title Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="font-outfit text-3xl font-extrabold text-white">Recruitment Control Panel</h1>
            <p className="text-gray-400 text-sm">Monitor live candidate submissions, proctoring metrics, and configure slots.</p>
          </div>
          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 bg-gradient-to-r from-primary to-secondary text-white font-semibold text-sm px-5 py-3 rounded-xl shadow-lg shadow-primary/20 hover:brightness-110 active:scale-95 transition"
          >
            <Plus className="w-4 h-4" />
            <span>Create Interview Slot</span>
          </button>
        </div>

        {/* Metrics Grid */}
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="glass-panel p-6 rounded-2xl flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center">
              <Video className="w-6 h-6" />
            </div>
            <div>
              <div className="text-xs text-gray-400 font-medium uppercase tracking-wider">Interview Templates</div>
              <div className="text-2xl font-extrabold text-white mt-1">{metrics.totalInterviews}</div>
            </div>
          </div>

          <div className="glass-panel p-6 rounded-2xl flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 flex items-center justify-center">
              <Users className="w-6 h-6" />
            </div>
            <div>
              <div className="text-xs text-gray-400 font-medium uppercase tracking-wider">Candidate Attempts</div>
              <div className="text-2xl font-extrabold text-white mt-1">{metrics.totalCandidates}</div>
            </div>
          </div>

          <div className="glass-panel p-6 rounded-2xl flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center">
              <Brain className="w-6 h-6" />
            </div>
            <div>
              <div className="text-xs text-gray-400 font-medium uppercase tracking-wider">Avg Composure Score</div>
              <div className="text-2xl font-extrabold text-white mt-1">{metrics.avgScore}%</div>
            </div>
          </div>

          <div className="glass-panel p-6 rounded-2xl flex items-center gap-4 border-red-500/10 hover:border-red-500/20">
            <div className="w-12 h-12 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 flex items-center justify-center">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <div>
              <div className="text-xs text-gray-400 font-medium uppercase tracking-wider">Incidents Flagged</div>
              <div className="text-2xl font-extrabold text-white mt-1">{metrics.warningIncidents}</div>
            </div>
          </div>
        </section>

        {/* Charts & Graphs Row */}
        <section className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main distribution plot */}
          <div className="lg:col-span-2 glass-panel p-6 rounded-2xl flex flex-col gap-4">
            <h3 className="font-outfit text-lg font-bold text-white">Recruitment Volume & Score Cadence</h3>
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={CHART_DATA} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorCand" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#6366f1" stopOpacity={0.2}/>
                      <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.2}/>
                      <stop offset="95%" stopColor="#06b6d4" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                  <XAxis dataKey="name" stroke="rgba(255,255,255,0.4)" fontSize={10} />
                  <YAxis stroke="rgba(255,255,255,0.4)" fontSize={10} />
                  <Tooltip contentStyle={{ backgroundColor: '#111827', borderColor: 'rgba(255,255,255,0.08)', borderRadius: '12px' }} />
                  <Area type="monotone" dataKey="candidates" name="Attempts Count" stroke="#6366f1" fillOpacity={1} fill="url(#colorCand)" strokeWidth={2} />
                  <Area type="monotone" dataKey="avgScore" name="Avg Score (%)" stroke="#06b6d4" fillOpacity={1} fill="url(#colorScore)" strokeWidth={2} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Active interview slots template list */}
          <div className="glass-panel p-6 rounded-2xl flex flex-col gap-4">
            <h3 className="font-outfit text-lg font-bold text-white">Active Assessment Templates</h3>
            <div className="flex-1 overflow-y-auto space-y-4 max-h-64 pr-2">
              {interviews.map(interview => (
                <div key={interview._id} className="p-3 rounded-xl bg-white/3 border border-white/5 flex flex-col gap-2">
                  <div className="flex justify-between items-start">
                    <h4 className="text-xs font-bold text-white truncate max-w-[180px]">{interview.title}</h4>
                    <span className="text-[9px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded-full font-bold">Active</span>
                  </div>
                  <p className="text-[10px] text-gray-400 line-clamp-1">{interview.description}</p>
                  <div className="flex justify-between items-center text-[10px] text-gray-500 pt-1 border-t border-white/4">
                    <span>{interview.questions?.length || 0} questions</span>
                    <span>Duration: {interview.durationLimit}m</span>
                  </div>
                </div>
              ))}
              {interviews.length === 0 && (
                <div className="text-xs text-gray-500 text-center py-10">No interview templates configured yet.</div>
              )}
            </div>
          </div>
        </section>

        {/* Candidate Attempt List & Filters */}
        <section className="glass-panel rounded-2xl overflow-hidden flex flex-col border border-white/8">
          <div className="p-6 border-b border-white/5 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <h3 className="font-outfit text-lg font-bold text-white">Candidate Screenings</h3>
            
            {/* Search + Filters row */}
            <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
              <div className="relative flex-1 md:w-64">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-500">
                  <Search className="w-4 h-4" />
                </span>
                <input
                  type="text"
                  placeholder="Search candidates..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 rounded-xl text-xs text-white glass-input"
                />
              </div>

              <select
                value={interviewFilter}
                onChange={(e) => setInterviewFilter(e.target.value)}
                className="py-2 px-3 rounded-xl text-xs text-gray-300 glass-input cursor-pointer"
              >
                <option value="all">All Roles</option>
                {interviews.map(i => (
                  <option key={i._id} value={i.title}>{i.title}</option>
                ))}
              </select>

              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="py-2 px-3 rounded-xl text-xs text-gray-300 glass-input cursor-pointer"
              >
                <option value="all">All States</option>
                <option value="completed">Completed</option>
                <option value="processing">Processing</option>
                <option value="warnings">High Warnings</option>
              </select>
            </div>
          </div>

          {/* Table content */}
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-white/5 bg-white/2 text-[10px] uppercase font-bold text-gray-400 tracking-wider">
                  <th className="px-6 py-4">Candidate</th>
                  <th className="px-6 py-4">Assigned Role</th>
                  <th className="px-6 py-4 text-center">Score</th>
                  <th className="px-6 py-4 text-center">Flags</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4">Session Date</th>
                  <th className="px-6 py-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/4 text-xs font-medium text-gray-300">
                {filteredCandidates.map((cand) => (
                  <tr key={cand._id} className="hover:bg-white/2 transition">
                    <td className="px-6 py-4">
                      <div>
                        <div className="text-white font-bold">{cand.candidate?.name}</div>
                        <div className="text-4xs text-gray-500 mt-0.5">{cand.candidate?.email}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-xs text-gray-200">{cand.interview?.title}</div>
                    </td>
                    <td className="px-6 py-4 text-center">
                      {cand.status === 'completed' ? (
                        <span className={`inline-block font-bold text-sm ${
                          cand.evaluation?.scores?.overall >= 80 
                            ? 'text-emerald-400' 
                            : cand.evaluation?.scores?.overall >= 70 
                              ? 'text-yellow-400' 
                              : 'text-red-400'
                        }`}>
                          {cand.evaluation?.scores?.overall}%
                        </span>
                      ) : (
                        <span className="text-gray-500">—</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-center">
                      {cand.warningsCount > 2 ? (
                        <span className="inline-flex items-center gap-1 text-red-400 bg-red-400/10 border border-red-500/20 px-2 py-0.5 rounded-lg text-4xs font-bold uppercase animate-pulse">
                          <AlertTriangle className="w-3.5 h-3.5" />
                          <span>{cand.warningsCount} Alerts</span>
                        </span>
                      ) : cand.warningsCount > 0 ? (
                        <span className="inline-flex items-center gap-1 text-yellow-400 bg-yellow-400/10 border border-yellow-400/20 px-2 py-0.5 rounded-lg text-4xs font-bold uppercase">
                          <AlertTriangle className="w-3.5 h-3.5" />
                          <span>{cand.warningsCount} Flags</span>
                        </span>
                      ) : (
                        <span className="text-emerald-400 font-semibold">0 Clean</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      {cand.status === 'completed' ? (
                        <span className="inline-flex items-center gap-1 text-emerald-400">
                          <CheckCircle className="w-3.5 h-3.5" />
                          <span>Completed</span>
                        </span>
                      ) : cand.status === 'processing' ? (
                        <span className="inline-flex items-center gap-1 text-accent">
                          <div className="w-3 h-3 border-2 border-accent border-t-transparent rounded-full animate-spin"></div>
                          <span>Compiling...</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-yellow-500">
                          <Clock className="w-3.5 h-3.5" />
                          <span>Active</span>
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-gray-400 text-3xs font-semibold">
                      {new Date(cand.startedAt).toLocaleDateString(undefined, {
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </td>
                    <td className="px-6 py-4 text-right">
                      {cand.status === 'completed' ? (
                        <button
                          onClick={() => router.push(`/recruiter/results/${cand._id}`)}
                          className="inline-flex items-center gap-1 bg-white/5 border border-white/8 hover:bg-primary/20 hover:border-primary/40 text-white rounded-lg py-1.5 px-3 font-semibold transition active:scale-95"
                        >
                          <span>Review</span>
                          <ChevronRight className="w-3.5 h-3.5" />
                        </button>
                      ) : (
                        <button
                          disabled
                          className="inline-flex items-center gap-1 bg-white/2 border border-white/4 text-gray-500 rounded-lg py-1.5 px-3 font-semibold cursor-not-allowed"
                        >
                          <span>Processing</span>
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
                {filteredCandidates.length === 0 && (
                  <tr>
                    <td colSpan={7} className="text-center py-12 text-gray-500 text-xs">
                      No candidate attempts match the active search parameters.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>
      </main>

      {/* Creation Modal dialog */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4 bg-black/75 backdrop-blur-sm">
          <div className="w-full max-w-2xl glass-panel rounded-3xl p-6 md:p-8 shadow-2xl relative border border-white/10 flex flex-col gap-6 max-h-[85vh] overflow-y-auto">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="font-outfit text-xl font-bold text-white">Create Interview Template</h3>
                <p className="text-xs text-gray-400 mt-1">Configure questions, response timers, and assessment guidelines.</p>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-2 text-gray-400 hover:text-white rounded-xl hover:bg-white/5 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateInterview} className="space-y-6">
              {/* Form Title details */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="sm:col-span-2 space-y-1.5">
                  <label className="text-2xs font-bold text-gray-400 uppercase tracking-wide">Interview Title</label>
                  <input
                    type="text"
                    required
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                    placeholder="e.g. Senior Full Stack Engineer"
                    className="w-full px-4 py-2.5 rounded-xl text-xs text-white glass-input"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-2xs font-bold text-gray-400 uppercase tracking-wide">Duration Limit (m)</label>
                  <input
                    type="number"
                    min={1}
                    required
                    value={newDuration}
                    onChange={(e) => setNewDuration(Number(e.target.value))}
                    className="w-full px-4 py-2.5 rounded-xl text-xs text-white glass-input"
                  />
                </div>
              </div>

              {/* Description */}
              <div className="space-y-1.5">
                <label className="text-2xs font-bold text-gray-400 uppercase tracking-wide">Role Description</label>
                <textarea
                  rows={2}
                  required
                  value={newDesc}
                  onChange={(e) => setNewDesc(e.target.value)}
                  placeholder="Outline key tech stacks, team expectations, or prompt topics..."
                  className="w-full px-4 py-2.5 rounded-xl text-xs text-white glass-input resize-none"
                />
              </div>

              {/* Dynamic Questions Form Fields */}
              <div className="space-y-4">
                <div className="flex justify-between items-center border-b border-white/5 pb-2">
                  <span className="text-2xs font-bold text-gray-400 uppercase tracking-wide">Questions Outline</span>
                  <button
                    type="button"
                    onClick={addQuestionField}
                    className="flex items-center gap-1 text-4xs bg-primary/10 border border-primary/20 text-white rounded-lg px-2.5 py-1 font-bold tracking-wider uppercase hover:bg-primary/25 transition active:scale-95"
                  >
                    <PlusCircle className="w-3.5 h-3.5 text-accent" />
                    <span>Add Question</span>
                  </button>
                </div>

                <div className="space-y-4 max-h-48 overflow-y-auto pr-2">
                  {newQuestions.map((q, idx) => (
                    <div key={idx} className="flex gap-3 items-end bg-white/2 p-3 rounded-xl border border-white/4 relative">
                      <div className="flex-1 space-y-1.5">
                        <label className="text-4xs font-bold text-gray-500 uppercase">Question {idx + 1} Prompt</label>
                        <input
                          type="text"
                          required
                          value={q.text}
                          onChange={(e) => updateQuestionText(idx, e.target.value)}
                          placeholder="e.g. Describe the distinction between process and thread..."
                          className="w-full px-3 py-2 rounded-lg text-xs text-white glass-input"
                        />
                      </div>
                      <div className="w-24 space-y-1.5">
                        <label className="text-4xs font-bold text-gray-500 uppercase">Timer (Sec)</label>
                        <input
                          type="number"
                          min={10}
                          required
                          value={q.timeLimit}
                          onChange={(e) => updateQuestionTime(idx, e.target.value)}
                          className="w-full px-3 py-2 rounded-lg text-xs text-white glass-input text-center"
                        />
                      </div>
                      <button
                        type="button"
                        onClick={() => removeQuestionField(idx)}
                        disabled={newQuestions.length === 1}
                        className="p-2 text-gray-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition disabled:opacity-30 disabled:cursor-not-allowed"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Submit */}
              <div className="flex justify-end gap-3 pt-4 border-t border-white/5">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-5 py-2.5 bg-white/5 border border-white/8 hover:bg-white/10 text-white rounded-xl text-xs font-semibold transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={creating}
                  className="px-5 py-2.5 bg-gradient-to-r from-primary to-secondary text-white rounded-xl text-xs font-semibold shadow-lg shadow-primary/20 transition hover:brightness-110 active:scale-95 disabled:opacity-50"
                >
                  {creating ? 'Creating Template...' : 'Save Template'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
