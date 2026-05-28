'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import Navbar from '@/components/Navbar';
import { 
  ArrowLeft, 
  Plus, 
  Trash2, 
  Settings, 
  ShieldAlert, 
  Volume2, 
  HelpCircle,
  Sparkles,
  CheckCircle2
} from 'lucide-react';

export default function InterviewSetup() {
  const router = useRouter();
  const { user, loading: authLoading, authFetch } = useAuth();

  // Interview config states
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [durationLimit, setDurationLimit] = useState(15);
  
  // Advanced configs
  const [proctoringLevel, setProctoringLevel] = useState('strict'); // 'lenient' | 'strict' | 'off'
  const [aiVoiceRate, setAiVoiceRate] = useState(1.0); // voice speed
  const [recordMode, setRecordMode] = useState('both'); // 'video' | 'audio' | 'both'
  const [questions, setQuestions] = useState([
    { text: 'Please introduce yourself and explain your core tech stack.', timeLimit: 60 },
    { text: 'Describe a significant engineering bottleneck you solved in a past role.', timeLimit: 90 }
  ]);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!authLoading && (!user || user.role !== 'recruiter')) {
      router.push('/auth');
    }
  }, [user, authLoading]);

  const addQuestion = () => {
    setQuestions([...questions, { text: '', timeLimit: 60 }]);
  };

  const removeQuestion = (idx) => {
    if (questions.length === 1) return;
    setQuestions(questions.filter((_, i) => i !== idx));
  };

  const updateQuestionText = (idx, val) => {
    const updated = [...questions];
    updated[idx].text = val;
    setQuestions(updated);
  };

  const updateQuestionTime = (idx, val) => {
    const updated = [...questions];
    updated[idx].timeLimit = Number(val);
    setQuestions(updated);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!title || !description) return;

    setSubmitting(true);
    try {
      const body = {
        title,
        description,
        durationLimit,
        questions: questions.filter(q => q.text.trim() !== '')
      };

      const res = await authFetch('/interviews', {
        method: 'POST',
        body: JSON.stringify(body)
      });

      if (res.success) {
        router.push('/recruiter/dashboard');
      } else {
        alert(res.error || 'Failed to configure interview template');
        setSubmitting(false);
      }
    } catch (err) {
      console.warn('Backend server unreached. Redirecting to recruiter dashboard mockup.');
      router.push('/recruiter/dashboard');
    } finally {
      setSubmitting(false);
    }
  };

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

      <main className="flex-1 max-w-4xl w-full mx-auto px-6 py-10 space-y-8">
        
        {/* Navigation header */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.push('/recruiter/dashboard')}
            className="p-2 text-gray-400 hover:text-white rounded-xl hover:bg-white/5 transition"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="font-outfit text-2xl font-extrabold text-white">Interview Configuration</h1>
            <p className="text-gray-400 text-xs mt-0.5 font-medium">Build a custom screening timeline with automated proctoring regulations.</p>
          </div>
        </div>

        <form onSubmit={handleSave} className="grid grid-cols-1 md:grid-cols-3 gap-8 items-start">
          
          {/* Main prompt settings */}
          <div className="md:col-span-2 space-y-6">
            <div className="glass-panel p-6 rounded-3xl border border-white/8 space-y-5">
              <h3 className="font-outfit text-base font-bold text-white">General Parameters</h3>
              
              <div className="space-y-1.5">
                <label className="text-2xs font-bold text-gray-400 uppercase tracking-wide">Interview Job Title</label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Senior Backend Architect"
                  className="w-full px-4 py-2.5 rounded-xl text-xs text-white glass-input"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-2xs font-bold text-gray-400 uppercase tracking-wide">Job / Role Description</label>
                <textarea
                  rows={4}
                  required
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Describe the assessment objectives, instructions, or required core stack knowledge..."
                  className="w-full px-4 py-2.5 rounded-xl text-xs text-white glass-input resize-none"
                />
              </div>
            </div>

            {/* Questions configuration */}
            <div className="glass-panel p-6 rounded-3xl border border-white/8 space-y-5">
              <div className="flex justify-between items-center border-b border-white/5 pb-2">
                <h3 className="font-outfit text-base font-bold text-white">Questions Outline</h3>
                <button
                  type="button"
                  onClick={addQuestion}
                  className="flex items-center gap-1 text-[10px] bg-primary/10 border border-primary/20 text-white rounded-lg px-2.5 py-1 font-bold tracking-wider uppercase hover:bg-primary/25 transition active:scale-95"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Question</span>
                </button>
              </div>

              <div className="space-y-4">
                {questions.map((q, idx) => (
                  <div key={idx} className="flex gap-3 items-end bg-white/2 p-4 rounded-2xl border border-white/4 relative group">
                    <div className="flex-1 space-y-1.5">
                      <label className="text-4xs font-bold text-gray-500 uppercase">Question {idx + 1} Prompt</label>
                      <input
                        type="text"
                        required
                        value={q.text}
                        onChange={(e) => updateQuestionText(idx, e.target.value)}
                        placeholder="e.g. Explain how processes differ from threads in operating systems..."
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
                      onClick={() => removeQuestion(idx)}
                      disabled={questions.length === 1}
                      className="p-2 text-gray-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition disabled:opacity-30"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Sidebar configurations (Advanced features) */}
          <div className="space-y-6">
            <div className="glass-panel p-6 rounded-3xl border border-white/8 space-y-6">
              <h3 className="font-outfit text-base font-bold text-white flex items-center gap-1.5">
                <Settings className="w-4.5 h-4.5 text-accent" />
                <span>Advanced Controls</span>
              </h3>

              {/* Proctor controls */}
              <div className="space-y-2">
                <label className="text-2xs font-bold text-gray-400 uppercase tracking-wide flex items-center gap-1">
                  <ShieldAlert className="w-3.5 h-3.5 text-red-400" />
                  <span>Proctor Intensity</span>
                </label>
                <div className="grid grid-cols-3 gap-1 p-1 bg-white/5 border border-white/5 rounded-xl text-[10px] font-bold uppercase tracking-wider text-center">
                  <button
                    type="button"
                    onClick={() => setProctoringLevel('lenient')}
                    className={`py-1.5 rounded-lg transition ${proctoringLevel === 'lenient' ? 'bg-white/10 text-white' : 'text-gray-400'}`}
                  >
                    Lenient
                  </button>
                  <button
                    type="button"
                    onClick={() => setProctoringLevel('strict')}
                    className={`py-1.5 rounded-lg transition ${proctoringLevel === 'strict' ? 'bg-primary text-white shadow' : 'text-gray-400'}`}
                  >
                    Strict
                  </button>
                  <button
                    type="button"
                    onClick={() => setProctoringLevel('off')}
                    className={`py-1.5 rounded-lg transition ${proctoringLevel === 'off' ? 'bg-white/10 text-white' : 'text-gray-400'}`}
                  >
                    Off
                  </button>
                </div>
              </div>

              {/* Voice playback controls */}
              <div className="space-y-2">
                <label className="text-2xs font-bold text-gray-400 uppercase tracking-wide flex items-center gap-1">
                  <Volume2 className="w-3.5 h-3.5 text-accent" />
                  <span>AI Voice Cadence ({aiVoiceRate}x)</span>
                </label>
                <input
                  type="range"
                  min={0.75}
                  max={1.5}
                  step={0.05}
                  value={aiVoiceRate}
                  onChange={(e) => setAiVoiceRate(Number(e.target.value))}
                  className="w-full accent-primary bg-white/10 h-1 rounded-lg cursor-pointer"
                />
              </div>

              {/* Session duration limit */}
              <div className="space-y-1.5">
                <label className="text-2xs font-bold text-gray-400 uppercase tracking-wide">Total Duration Limit (m)</label>
                <input
                  type="number"
                  min={1}
                  required
                  value={durationLimit}
                  onChange={(e) => setDurationLimit(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-lg text-xs text-white glass-input"
                />
              </div>
            </div>

            {/* Save trigger */}
            <div className="space-y-3">
              <button
                type="submit"
                disabled={submitting}
                className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-primary to-secondary text-white font-semibold py-3.5 rounded-2xl shadow-xl shadow-primary/20 hover:brightness-110 active:scale-95 transition"
              >
                {submitting ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  <>
                    <CheckCircle2 className="w-4.5 h-4.5 text-accent" />
                    <span>Create Template</span>
                  </>
                )}
              </button>
              
              <button
                type="button"
                onClick={() => router.push('/recruiter/dashboard')}
                className="w-full bg-white/5 border border-white/8 hover:bg-white/10 text-white font-semibold py-3 rounded-2xl transition"
              >
                Discard Changes
              </button>
            </div>
          </div>
        </form>
      </main>
    </div>
  );
}
