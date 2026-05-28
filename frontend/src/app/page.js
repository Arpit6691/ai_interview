import React from 'react';
import Navbar from '@/components/Navbar';
import Link from 'next/link';
import { 
  ShieldCheck, 
  BrainCircuit, 
  Sparkles, 
  BarChart3, 
  FileAudio, 
  Activity, 
  ArrowRight,
  CheckCircle2,
  Video
} from 'lucide-react';

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen bg-dark-bg font-sans">
      <Navbar />

      {/* Hero Section */}
      <section className="relative pt-20 pb-24 overflow-hidden flex flex-col items-center px-6">
        {/* Glow Effects */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-primary/10 blur-[120px] rounded-full pointer-events-none"></div>
        <div className="absolute top-1/3 left-1/3 w-[300px] h-[300px] bg-accent/15 blur-[100px] rounded-full pointer-events-none"></div>

        <div className="max-w-4xl text-center z-10 flex flex-col items-center">
          {/* Tagline Badge */}
          <div className="inline-flex items-center gap-2 bg-white/5 border border-white/8 rounded-full px-4 py-1.5 mb-8 backdrop-blur-md">
            <Sparkles className="w-4 h-4 text-accent animate-pulse" />
            <span className="text-xs font-semibold tracking-wider text-gray-300 uppercase">
              Next-Gen Autonomous Recruitment
            </span>
          </div>

          {/* Heading */}
          <h1 className="font-outfit text-5xl md:text-7xl font-bold tracking-tight text-white mb-6 leading-[1.1]">
            Automate Video Interviews <br />
            <span className="bg-gradient-to-r from-primary via-indigo-400 to-accent bg-clip-text text-transparent">
              With Composure AI
            </span>
          </h1>

          {/* Subtitle */}
          <p className="text-lg md:text-xl text-gray-400 max-w-2xl mb-10 leading-relaxed">
            Screen candidates at scale with automated speech-to-text transcription, AI-powered communication scoring, and real-time proctoring safeguards.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 w-full justify-center px-4">
            <Link
              href="/auth?tab=register&role=recruiter"
              className="flex items-center justify-center gap-2 bg-gradient-to-r from-primary to-secondary text-white text-base font-semibold px-8 py-4 rounded-2xl shadow-xl shadow-primary/20 hover:shadow-primary/30 transition hover:brightness-110 active:scale-95 group"
            >
              <span>Recruit with AI</span>
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link
              href="/auth?tab=register&role=candidate"
              className="flex items-center justify-center gap-2 bg-white/5 border border-white/8 hover:bg-white/10 text-white text-base font-semibold px-8 py-4 rounded-2xl transition active:scale-95"
            >
              <span>Apply for Interviews</span>
            </Link>
          </div>
        </div>

        {/* Floating Mock UI Interface */}
        <div className="w-full max-w-5xl mt-20 px-4 z-10">
          <div className="glass-panel rounded-3xl p-4 md:p-6 shadow-2xl relative">
            <div className="absolute -top-3 left-6 flex items-center gap-1.5 px-3 py-1 bg-accent/10 border border-accent/25 rounded-full">
              <Activity className="w-3.5 h-3.5 text-accent animate-pulse" />
              <span className="text-[10px] font-bold tracking-wide uppercase text-accent">Live Telemetry Proctoring Enabled</span>
            </div>

            {/* Simulated Live Stream Preview */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 aspect-video bg-gray-950 rounded-2xl relative overflow-hidden border border-white/5 shadow-inner">
                {/* Visual Camera Simulation */}
                <div className="absolute inset-0 bg-cover bg-center flex items-center justify-center bg-[url('https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=800')] opacity-40"></div>
                <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent"></div>
                
                {/* Visual Face Grid box overlay */}
                <div className="absolute top-1/4 left-1/3 w-1/3 h-1/2 border border-accent rounded-2xl flex items-center justify-center shadow-lg shadow-accent/10">
                  <div className="absolute -top-6 bg-accent text-[10px] font-bold uppercase text-black px-2 py-0.5 rounded-md">Candidate Face Locked</div>
                </div>

                <div className="absolute bottom-4 left-4 flex items-center gap-2 bg-black/60 backdrop-blur-md px-3 py-1.5 rounded-xl border border-white/5">
                  <div className="w-2.5 h-2.5 rounded-full bg-red-500 animate-ping"></div>
                  <span className="text-xs font-semibold text-gray-200">00:45 / REC</span>
                </div>
              </div>

              {/* Real-time details card */}
              <div className="flex flex-col justify-between gap-4 p-2">
                <div className="flex flex-col gap-4">
                  <h4 className="font-outfit text-xl font-bold text-white">Live Proctoring Audits</h4>
                  
                  <div className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/5">
                    <div className="flex items-center gap-2">
                      <ShieldCheck className="w-5 h-5 text-emerald-400" />
                      <span className="text-xs font-medium text-gray-300">Identity Verified</span>
                    </div>
                    <span className="text-2xs bg-emerald-400/10 text-emerald-400 border border-emerald-400/20 px-2 py-0.5 rounded-md">99% Match</span>
                  </div>

                  <div className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/5">
                    <div className="flex items-center gap-2">
                      <BrainCircuit className="w-5 h-5 text-accent" />
                      <span className="text-xs font-medium text-gray-300">Tab Switching Lock</span>
                    </div>
                    <span className="text-2xs bg-accent/10 text-accent border border-accent/20 px-2 py-0.5 rounded-md">0 Violations</span>
                  </div>

                  <div className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/5">
                    <div className="flex items-center gap-2">
                      <Activity className="w-5 h-5 text-yellow-400" />
                      <span className="text-xs font-medium text-gray-300">Multiple Face Test</span>
                    </div>
                    <span className="text-2xs bg-yellow-400/10 text-yellow-400 border border-yellow-400/20 px-2 py-0.5 rounded-md">Pass</span>
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-gradient-to-tr from-indigo-950/40 to-cyan-950/40 border border-primary/20 flex flex-col gap-2">
                  <div className="flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4 text-accent" />
                    <span className="text-xs font-bold uppercase tracking-wider text-gray-300">AI Composure Score</span>
                  </div>
                  <div className="text-3xl font-extrabold text-white">88<span className="text-sm font-normal text-gray-400">/100</span></div>
                  <p className="text-3xs text-gray-400 leading-tight">Excellent articulation and voice cadence. Maintained direct eye-contact with minor environment ambient noise.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Grid */}
      <section className="py-24 border-t border-white/5 bg-gray-950/40 relative">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="font-outfit text-3xl md:text-4xl font-bold text-white mb-4">Enterprise Grade AI Screening Features</h2>
            <p className="text-gray-400 max-w-xl mx-auto">Built from the ground up to guarantee evaluation accuracy, candidates verification, and recruiter analytics productivity.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="glass-panel p-8 rounded-3xl flex flex-col gap-4 group hover:border-primary/30 transition-all duration-300">
              <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center border border-primary/20 text-primary group-hover:scale-110 transition-transform">
                <BrainCircuit className="w-6 h-6" />
              </div>
              <h3 className="font-outfit text-xl font-bold text-white">Composure Analytics</h3>
              <p className="text-gray-400 text-sm leading-relaxed">Evaluates semantic communication structure, technical terminology depth, and vocal speed ratios dynamically per response.</p>
            </div>

            <div className="glass-panel p-8 rounded-3xl flex flex-col gap-4 group hover:border-accent/30 transition-all duration-300">
              <div className="w-12 h-12 bg-accent/10 rounded-2xl flex items-center justify-center border border-accent/20 text-accent group-hover:scale-110 transition-transform">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <h3 className="font-outfit text-xl font-bold text-white">Full Proctor Shield</h3>
              <p className="text-gray-400 text-sm leading-relaxed">Monitors visibility states, micro-gestures, microphone status, and external window switching to enforce complete compliance.</p>
            </div>

            <div className="glass-panel p-8 rounded-3xl flex flex-col gap-4 group hover:border-indigo-400/30 transition-all duration-300">
              <div className="w-12 h-12 bg-indigo-500/10 rounded-2xl flex items-center justify-center border border-indigo-500/20 text-indigo-400 group-hover:scale-110 transition-transform">
                <BarChart3 className="w-6 h-6" />
              </div>
              <h3 className="font-outfit text-xl font-bold text-white">Recruiter Intelligence</h3>
              <p className="text-gray-400 text-sm leading-relaxed">Unified review dashboards with interactive transcripts, video playback sync, keyword search filters, and custom grading panels.</p>
            </div>
          </div>
        </div>
      </section>

      {/* AI Interview Explanation */}
      <section className="py-24 px-6 max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
        <div>
          <h2 className="font-outfit text-3xl md:text-4xl font-bold text-white mb-6">How The AI Interview Works</h2>
          <div className="space-y-6">
            <div className="flex gap-4">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-accent/15 border border-accent/30 flex items-center justify-center text-accent text-sm font-bold">1</div>
              <div>
                <h4 className="font-semibold text-white text-base mb-1">Hardware & Device Check</h4>
                <p className="text-sm text-gray-400">Verifies webcam permissions, microphone input levels, and confirms a stable web network connection prior to initiating the room.</p>
              </div>
            </div>
            <div className="flex gap-4">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-accent/15 border border-accent/30 flex items-center justify-center text-accent text-sm font-bold">2</div>
              <div>
                <h4 className="font-semibold text-white text-base mb-1">Interactive Voice Prompting</h4>
                <p className="text-sm text-gray-400">The platform automatically enunciates the interview questions via text-to-speech, acting as a real-time conversational agent.</p>
              </div>
            </div>
            <div className="flex gap-4">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-accent/15 border border-accent/30 flex items-center justify-center text-accent text-sm font-bold">3</div>
              <div>
                <h4 className="font-semibold text-white text-base mb-1">Live Recording & Streaming Chunks</h4>
                <p className="text-sm text-gray-400">The platform streams media bytes via websocket every 3 seconds to ensure session resume capabilities even during sudden hardware disconnects.</p>
              </div>
            </div>
            <div className="flex gap-4">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-accent/15 border border-accent/30 flex items-center justify-center text-accent text-sm font-bold">4</div>
              <div>
                <h4 className="font-semibold text-white text-base mb-1">Async AI Speech-To-Text & Scoring</h4>
                <p className="text-sm text-gray-400">Deepgram transcribes response tracks while our scoring systems generate feedback and metric logs for recruiter review dashboards.</p>
              </div>
            </div>
          </div>
        </div>

        <div className="glass-panel p-8 rounded-3xl border border-indigo-500/20 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-48 h-48 bg-primary/5 blur-[50px] pointer-events-none"></div>
          
          <h3 className="font-outfit text-2xl font-bold text-white mb-6 flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-accent" />
            Candidate Experience Preview
          </h3>

          <div className="space-y-4">
            <div className="p-4 rounded-2xl bg-white/5 border border-white/5 flex flex-col gap-2">
              <div className="flex items-center justify-between text-2xs text-gray-400">
                <span>QUESTION 1 OF 3</span>
                <span className="text-accent font-medium">60S TIMER</span>
              </div>
              <p className="text-sm font-semibold text-white">Explain the difference between a SQL and NoSQL database, and when you would choose one over another.</p>
            </div>

            <div className="border border-white/5 rounded-2xl p-4 bg-gray-950/40 relative flex flex-col items-center justify-center aspect-video">
              <Video className="w-10 h-10 text-gray-600 mb-2" />
              <p className="text-2xs text-gray-500">Camera preview and audio monitor will stream here during live responses.</p>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-2xs text-red-400 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-ping"></span>
                Autosaving stream chunks...
              </span>
              <button disabled className="text-xs bg-white/5 text-gray-400 border border-white/5 rounded-lg px-3 py-1.5 font-medium cursor-not-allowed">
                Next Question
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Footer */}
      <section className="py-20 px-6 bg-gradient-to-b from-transparent to-gray-950/70 border-t border-white/5 mt-auto flex flex-col items-center text-center">
        <h2 className="font-outfit text-3xl md:text-5xl font-bold text-white mb-4">Ready to Modernize Your Screenings?</h2>
        <p className="text-gray-400 max-w-xl mb-8">Deploy our secure AI platform to evaluate thousands of candidate submissions asynchronously.</p>
        <Link
          href="/auth?tab=register"
          className="bg-gradient-to-r from-primary to-secondary text-white font-semibold px-8 py-4 rounded-xl shadow-lg shadow-primary/10 hover:shadow-primary/20 transition active:scale-95"
        >
          Create Free Recruiter Account
        </Link>
        <div className="mt-16 text-3xs text-gray-600">
          © 2026 RetinaAI Corporation. All rights reserved.
        </div>
      </section>
    </div>
  );
}
