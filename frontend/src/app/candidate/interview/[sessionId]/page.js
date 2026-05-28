'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import Navbar from '@/components/Navbar';
import io from 'socket.io-client';
import { 
  Video, 
  Mic, 
  MicOff, 
  AlertTriangle, 
  ArrowRight, 
  Play, 
  Volume2, 
  Maximize, 
  CheckCircle2, 
  Cpu, 
  Radio
} from 'lucide-react';

const SOCKET_SERVER = process.env.NEXT_PUBLIC_SOCKET_URL || (typeof window !== 'undefined' ? `http://${window.location.hostname}:5000` : 'http://localhost:5000');

// Fallback Sandbox Interview Templates
const SANDBOX_INTERVIEW = {
  title: 'Senior Full Stack Engineer',
  questions: [
    { _id: 'q1', text: 'Please introduce yourself and explain your core tech stack.', timeLimit: 45 },
    { _id: 'q2', text: 'Explain the difference between SQL and NoSQL databases, and when you would choose one over another.', timeLimit: 45 },
    { _id: 'q3', text: 'How do you minimize latency in WebSockets applications under heavy concurrent load?', timeLimit: 45 }
  ]
};

export default function LiveInterview() {
  const params = useParams();
  const router = useRouter();
  const { user, loading: authLoading, authFetch } = useAuth();
  
  const sessionId = params.sessionId;
  const isSandbox = sessionId.startsWith('sandbox_');

  // Socket reference
  const socketRef = useRef(null);

  // States
  const [interview, setInterview] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [currentQIdx, setCurrentQIdx] = useState(0);
  const [timer, setTimer] = useState(60);
  const [warningsCount, setWarningsCount] = useState(0);
  const [isRecording, setIsRecording] = useState(false);
  const [showWarningModal, setShowWarningModal] = useState(false);
  const [warningMsg, setWarningMsg] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [audioInputActive, setAudioInputActive] = useState(true);

  // Video Recorder Refs
  const videoRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const streamRef = useRef(null);
  const chunkIndexRef = useRef(0);
  const countdownIntervalRef = useRef(null);

  // Fetch Interview Details
  const fetchSessionDetails = async () => {
    try {
      setLoading(true);
      if (isSandbox) {
        setInterview(SANDBOX_INTERVIEW);
        setQuestions(SANDBOX_INTERVIEW.questions);
        setTimer(SANDBOX_INTERVIEW.questions[0].timeLimit);
        setLoading(false);
        return;
      }

      // Fetch actual session status and interview template
      const sessionRes = await authFetch(`/sessions/${sessionId}/results`);
      if (sessionRes.success && sessionRes.session) {
        const interviewData = sessionRes.session.interview;
        setInterview(interviewData);
        setQuestions(interviewData.questions);
        setCurrentQIdx(sessionRes.session.currentQuestionIndex || 0);
        setTimer(interviewData.questions[sessionRes.session.currentQuestionIndex || 0].timeLimit);
        setWarningsCount(sessionRes.session.warningsCount || 0);
      } else {
        // Fallback mock
        setInterview(SANDBOX_INTERVIEW);
        setQuestions(SANDBOX_INTERVIEW.questions);
        setTimer(SANDBOX_INTERVIEW.questions[0].timeLimit);
      }
    } catch (err) {
      console.warn('Backend unreached, falling back to mock sandbox session configs.');
      setInterview(SANDBOX_INTERVIEW);
      setQuestions(SANDBOX_INTERVIEW.questions);
      setTimer(SANDBOX_INTERVIEW.questions[0].timeLimit);
    } finally {
      setLoading(false);
    }
  };

  // Connect Sockets
  useEffect(() => {
    if (!authLoading && (!user || user.role !== 'candidate')) {
      router.push('/auth');
      return;
    }

    if (user) {
      fetchSessionDetails();

      // Establish websocket connection
      const socket = io(SOCKET_SERVER);
      socketRef.current = socket;

      socket.on('connect', () => {
        console.log('[Socket] Connected to backend server:', socket.id);
        socket.emit('join_session', { sessionId });
      });

      socket.on('proctor_update', (payload) => {
        if (payload.warningsCount !== undefined) {
          setWarningsCount(payload.warningsCount);
        }
      });

      // Page visibility event listener for tab switching
      const handleVisibilityChange = () => {
        if (document.hidden) {
          triggerProctorWarning('tab_switch', 'Candidate left the active browser focus (Tab blurred).');
        }
      };

      document.addEventListener('visibilitychange', handleVisibilityChange);

      return () => {
        document.removeEventListener('visibilitychange', handleVisibilityChange);
        if (socketRef.current) {
          socketRef.current.disconnect();
        }
      };
    }
  }, [user, authLoading]);

  // Request Fullscreen
  const enterFullscreen = () => {
    const docEl = document.documentElement;
    if (docEl.requestFullscreen) docEl.requestFullscreen().catch(() => {});
    else if (docEl.mozRequestFullScreen) docEl.mozRequestFullScreen().catch(() => {});
    else if (docEl.webkitRequestFullscreen) docEl.webkitRequestFullscreen().catch(() => {});
  };

  // Speaks question text
  const speakQuestion = (text) => {
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      window.speechSynthesis.cancel(); // Stop current speech
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.95;
      utterance.pitch = 1.0;
      window.speechSynthesis.speak(utterance);
    }
  };

  // Emit security warnings
  const triggerProctorWarning = (type, details) => {
    const elapsed = 0; // Simple timestamp metric

    // Update locally
    setWarningsCount(prev => prev + 1);
    setWarningMsg(details);
    setShowWarningModal(true);

    // Emit to sockets
    if (socketRef.current) {
      socketRef.current.emit('proctor_alert', {
        sessionId,
        type,
        timestamp: elapsed,
        details
      });
    }

    // Call REST endpoint as redundancy
    if (!isSandbox) {
      authFetch(`/sessions/${sessionId}/proctor-alert`, {
        method: 'POST',
        body: JSON.stringify({ type, timestamp: elapsed, details })
      }).catch(err => console.error('Error logging REST warning:', err));
    }
  };

  // Acquisition of Camera feed and media recording
  const startRecording = async (questionId) => {
    try {
      setIsRecording(false);
      chunkIndexRef.current = 0;

      // Acquire media input stream
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: 640, height: 480, facingMode: 'user' },
        audio: true
      });

      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play().catch(() => {});
      }

      // Check if candidate has muted mic
      const audioTrack = stream.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.onmute = () => {
          setAudioInputActive(false);
          triggerProctorWarning('mic_disabled', 'Candidate microphone input disabled.');
        };
        audioTrack.onunmute = () => {
          setAudioInputActive(true);
        };
      }

      // Setup MediaRecorder
      const options = { mimeType: 'video/webm;codecs=vp8,opus' };
      let recorder;
      
      try {
        recorder = new MediaRecorder(stream, options);
      } catch (err) {
        console.warn('VP8/Opus codecs not supported. Using standard format.');
        recorder = new MediaRecorder(stream);
      }

      mediaRecorderRef.current = recorder;

      // Slice recording into 3 seconds chunks
      recorder.ondataavailable = async (e) => {
        if (e.data && e.data.size > 0) {
          // Read blob as Data URL base64 and emit via Websocket
          const reader = new FileReader();
          reader.readAsDataURL(e.data);
          reader.onloadend = () => {
            const base64Data = reader.result;
            const chunkNum = chunkIndexRef.current;
            chunkIndexRef.current += 1;

            if (socketRef.current && socketRef.current.connected) {
              socketRef.current.emit('video_chunk', {
                sessionId,
                questionId,
                chunkNumber: chunkNum,
                data: base64Data
              });
            }
          };
        }
      };

      // Start slicing
      recorder.start(3000);
      setIsRecording(true);
    } catch (err) {
      console.error('Recording initialization failed:', err);
      alert('Failed to initialize webcam recording. Ensure browser access rights.');
    }
  };

  // Stop current question recorder
  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
    }
    setIsRecording(false);
  };

  // Initialize/Handle current question step
  useEffect(() => {
    if (questions.length > 0 && !loading) {
      const currentQ = questions[currentQIdx];
      
      // Update timer limit
      setTimer(currentQ.timeLimit || 60);

      // Start Camera recorder stream
      startRecording(currentQ._id || `q_${currentQIdx}`);

      // Speak text question
      speakQuestion(currentQ.text);

      // Trigger fullscreen recommendation
      enterFullscreen();

      // Launch question timer loop
      if (countdownIntervalRef.current) clearInterval(countdownIntervalRef.current);
      
      countdownIntervalRef.current = setInterval(() => {
        setTimer(prev => {
          if (prev <= 1) {
            clearInterval(countdownIntervalRef.current);
            handleNextQuestion();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => {
        if (countdownIntervalRef.current) clearInterval(countdownIntervalRef.current);
        stopRecording();
      };
    }
  }, [currentQIdx, questions, loading]);

  // Navigate Questions flow
  const handleNextQuestion = async () => {
    stopRecording();
    
    // Stop speech synthesis
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }

    const nextIdx = currentQIdx + 1;
    if (nextIdx < questions.length) {
      // Save progress to database
      if (!isSandbox) {
        authFetch(`/sessions/${sessionId}/progress`, {
          method: 'PUT',
          body: JSON.stringify({ currentQuestionIndex: nextIdx })
        }).catch(err => console.error('Error saving progress progress:', err));
      }
      
      setCurrentQIdx(nextIdx);
    } else {
      // Completed last question. Submit interview
      handleFinishInterview();
    }
  };

  // Submit and clean session
  const handleFinishInterview = async () => {
    setSubmitting(true);
    if (countdownIntervalRef.current) clearInterval(countdownIntervalRef.current);
    stopRecording();

    try {
      if (isSandbox) {
        // Mock processing timeline redirect
        router.push('/candidate/dashboard');
        return;
      }

      const res = await authFetch(`/sessions/${sessionId}/complete`, {
        method: 'POST'
      });

      if (res.success) {
        // Redirect to a results processing screen or candidate dashboard
        router.push('/candidate/dashboard');
      } else {
        alert(res.error || 'Failed to submit candidate response');
        setSubmitting(false);
      }
    } catch (err) {
      router.push('/candidate/dashboard');
    }
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-dark-bg flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  const currentQ = questions[currentQIdx];

  return (
    <div className="flex flex-col min-h-screen bg-dark-bg font-sans">
      
      {/* Mini Proctor details header */}
      <header className="px-6 py-4 border-b border-white/5 bg-gray-950/40 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 bg-red-500/10 border border-red-500/20 px-3 py-1 rounded-xl text-3xs font-bold text-red-400 uppercase">
            <Radio className="w-3.5 h-3.5 animate-pulse" />
            <span>Recording Live</span>
          </div>
          <span className="text-xs font-bold text-gray-300 hidden md:inline">Role: {interview?.title}</span>
        </div>

        <div className="flex items-center gap-4">
          {/* Proctor stats count */}
          <div className="flex items-center gap-2 px-3 py-1 rounded-xl bg-white/5 border border-white/5">
            <AlertTriangle className="w-4 h-4 text-yellow-400" />
            <span className="text-2xs font-semibold text-gray-300">Violations Flagged: <span className="text-white font-bold">{warningsCount}</span></span>
          </div>

          <button
            onClick={enterFullscreen}
            className="p-2 rounded-xl text-gray-400 hover:text-white hover:bg-white/5 transition"
            title="Force Fullscreen"
          >
            <Maximize className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* Main workspace layout */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-6 py-8 grid grid-cols-1 lg:grid-cols-5 gap-8 items-stretch">
        
        {/* Question prompt details */}
        <div className="lg:col-span-3 flex flex-col justify-between gap-6">
          <div className="glass-panel p-8 rounded-3xl border border-white/8 bg-gradient-to-br from-indigo-950/20 via-transparent to-transparent flex-1 flex flex-col justify-between">
            <div className="space-y-4">
              <div className="flex justify-between items-center text-4xs font-bold uppercase tracking-wider text-gray-500">
                <span>Assessment Progress</span>
                <span className="text-accent">Question {currentQIdx + 1} of {questions.length}</span>
              </div>
              
              {/* Question Text */}
              <h2 className="font-outfit text-2xl md:text-3xl font-extrabold text-white leading-snug">
                {currentQ?.text}
              </h2>
            </div>

            {/* Speaking voice indicator */}
            <div className="flex items-center gap-2 pt-6 border-t border-white/5">
              <button
                onClick={() => speakQuestion(currentQ?.text)}
                className="p-3 bg-accent/15 border border-accent/25 hover:bg-accent/25 rounded-2xl text-accent transition active:scale-95"
                title="Speak Out Loud"
              >
                <Volume2 className="w-5 h-5" />
              </button>
              <div className="text-[10px] text-gray-400">
                <span className="font-semibold text-white">AI Assistant is speaking...</span> Click the volume button to replay voice audio.
              </div>
            </div>
          </div>

          {/* Timing indicators and next actions */}
          <div className="glass-panel p-6 rounded-3xl border border-white/8 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-white/5 border border-white/8 flex flex-col items-center justify-center relative">
                <span className="text-xs text-gray-500 font-bold uppercase tracking-wide leading-none">Sec</span>
                <span className="text-xl font-extrabold text-white mt-1 leading-none">{timer}</span>
              </div>
              <div>
                <h4 className="text-xs font-bold text-white">Timer Countdown</h4>
                <p className="text-[10px] text-gray-400 leading-tight">When timer expires, answers auto-submit to the next step.</p>
              </div>
            </div>

            <button
              onClick={handleNextQuestion}
              disabled={submitting}
              className="flex items-center gap-2 bg-gradient-to-r from-primary to-secondary text-white font-bold text-xs px-6 py-3.5 rounded-2xl shadow-xl shadow-primary/20 hover:brightness-110 active:scale-95 transition disabled:opacity-50"
            >
              {submitting ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : currentQIdx + 1 === questions.length ? (
                <>
                  <span>Submit Assessment</span>
                  <CheckCircle2 className="w-4 h-4" />
                </>
              ) : (
                <>
                  <span>Next Question</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
        </div>

        {/* Candidate live recording view */}
        <div className="lg:col-span-2 flex flex-col gap-6">
          <div className="glass-panel p-4 rounded-3xl border border-white/8 bg-gray-950 flex-1 flex flex-col relative overflow-hidden">
            
            {/* Live Camera preview */}
            <div className="flex-1 rounded-2xl overflow-hidden bg-black relative flex items-center justify-center border border-white/5 shadow-inner">
              <video
                ref={videoRef}
                muted
                playsInline
                className="w-full h-full object-cover scale-x-[-1]"
              />
              
              {/* Overlay telemetry logs */}
              <div className="absolute top-4 left-4 flex items-center gap-2 bg-black/60 backdrop-blur-md px-3 py-1.5 rounded-xl border border-white/5">
                <Radio className="w-3.5 h-3.5 text-red-500 animate-pulse" />
                <span className="text-[10px] font-bold text-gray-200">FEED LOCK</span>
              </div>

              {/* Warnings details overlay */}
              {!audioInputActive && (
                <div className="absolute bottom-4 left-4 right-4 p-3 bg-red-500/80 backdrop-blur-sm border border-red-500/35 rounded-xl text-white text-3xs font-bold flex items-center gap-2">
                  <MicOff className="w-4 h-4" />
                  <span>MICROPHONE MUTED! Enable input settings immediately.</span>
                </div>
              )}
            </div>

            {/* Chunk uploading status logs */}
            <div className="mt-4 bg-white/5 border border-white/5 rounded-2xl p-4 flex items-center gap-3">
              <Cpu className="w-5 h-5 text-accent animate-spin" style={{ animationDuration: '6s' }} />
              <div>
                <h4 className="text-[10px] font-bold text-white uppercase tracking-wider">WebSocket Buffer Sync</h4>
                <p className="text-[9px] text-gray-500 leading-tight">Streaming raw media chunk {chunkIndexRef.current} dynamically (3s interval).</p>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Proctor Violation Notification modal warning */}
      {showWarningModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4 bg-black/85 backdrop-blur-sm">
          <div className="w-full max-w-md glass-panel border border-red-500/20 rounded-3xl p-8 text-center flex flex-col items-center gap-5 shadow-2xl">
            <div className="w-14 h-14 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-500 flex items-center justify-center animate-bounce">
              <AlertTriangle className="w-7 h-7" />
            </div>

            <div className="space-y-2">
              <h3 className="font-outfit text-lg font-bold text-white uppercase tracking-wide">Security Violation Flagged</h3>
              <p className="text-xs text-red-400 font-medium">Warning count: {warningsCount}</p>
              <p className="text-2xs text-gray-400 leading-relaxed pt-2">
                {warningMsg || 'A system security event occurred. Ensure you maintain browser window focus and camera visibility.'}
              </p>
            </div>

            <button
              onClick={() => setShowWarningModal(false)}
              className="w-full mt-2 bg-gradient-to-r from-red-500 to-red-600 text-white font-semibold py-3 rounded-xl shadow-lg shadow-red-500/20 active:scale-95 transition text-xs"
            >
              Acknowledge & Return to Interview
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
