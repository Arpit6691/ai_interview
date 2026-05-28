'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { Camera, Mic, Monitor, CheckCircle, XCircle, Loader, ArrowRight, RefreshCw } from 'lucide-react';

export default function HardwareCheckPage() {
  const router = useRouter();
  const params = useParams();
  const { user, loading: authLoading, authFetch } = useAuth();
  const interviewId = params?.interviewId;

  const videoRef = useRef(null);
  const streamRef = useRef(null);

  const [checks, setChecks] = useState({
    camera: 'pending',
    microphone: 'pending',
    screen: 'pending',
  });
  const [allPassed, setAllPassed] = useState(false);
  const [running, setRunning] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    if (!authLoading && (!user || user.role !== 'candidate')) {
      router.push('/auth');
    }
  }, [user, authLoading]);

  useEffect(() => {
    return () => {
      // Cleanup stream on unmount
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(t => t.stop());
      }
    };
  }, []);

  useEffect(() => {
    const allDone = Object.values(checks).every(v => v === 'pass');
    setAllPassed(allDone);
  }, [checks]);

  const runChecks = async () => {
    setRunning(true);
    setErrorMsg('');
    setChecks({ camera: 'checking', microphone: 'checking', screen: 'pending' });

    try {
      // Step 1: Camera + Mic
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      streamRef.current = stream;

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }

      const videoTrack = stream.getVideoTracks()[0];
      const audioTrack = stream.getAudioTracks()[0];

      setChecks(prev => ({
        ...prev,
        camera: videoTrack ? 'pass' : 'fail',
        microphone: audioTrack ? 'pass' : 'fail',
      }));

      // Step 2: Screen Share Check
      setChecks(prev => ({ ...prev, screen: 'checking' }));
      try {
        const screenStream = await navigator.mediaDevices.getDisplayMedia({ video: true });
        screenStream.getTracks().forEach(t => t.stop());
        setChecks(prev => ({ ...prev, screen: 'pass' }));
      } catch {
        setChecks(prev => ({ ...prev, screen: 'fail' }));
        setErrorMsg('Screen share permission was denied. Please allow it to continue.');
      }
    } catch (err) {
      setChecks({ camera: 'fail', microphone: 'fail', screen: 'fail' });
      setErrorMsg('Camera or microphone access was denied. Please allow permissions and try again.');
    } finally {
      setRunning(false);
    }
  };

  const proceedToInterview = async () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(t => t.stop());
    }

    try {
      const res = await authFetch('/sessions/start', {
        method: 'POST',
        body: JSON.stringify({ interviewId })
      });

      if (res.success) {
        router.push(`/candidate/interview/${res.session._id}`);
      } else {
        setErrorMsg(res.error || 'Failed to start interview session');
      }
    } catch (err) {
      setErrorMsg('Network error starting session.');
    }
  };

  const CheckRow = ({ label, icon: Icon, status }) => {
    const color = status === 'pass' ? 'text-emerald-400' : status === 'fail' ? 'text-red-400' : status === 'checking' ? 'text-accent' : 'text-gray-500';
    const bg = status === 'pass' ? 'bg-emerald-400/10 border-emerald-400/20' : status === 'fail' ? 'bg-red-400/10 border-red-400/20' : 'bg-white/5 border-white/10';

    return (
      <div className={`flex items-center gap-4 p-4 rounded-2xl border ${bg} transition-all`}>
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${color} bg-white/5`}>
          <Icon className="w-5 h-5" />
        </div>
        <div className="flex-1">
          <div className="text-sm font-bold text-white">{label}</div>
          <div className={`text-xs font-medium mt-0.5 ${color}`}>
            {status === 'pending' && 'Waiting to check...'}
            {status === 'checking' && 'Checking...'}
            {status === 'pass' && 'Detected & working'}
            {status === 'fail' && 'Check failed — permission denied'}
          </div>
        </div>
        <div>
          {status === 'pass' && <CheckCircle className="w-5 h-5 text-emerald-400" />}
          {status === 'fail' && <XCircle className="w-5 h-5 text-red-400" />}
          {status === 'checking' && <Loader className="w-5 h-5 text-accent animate-spin" />}
        </div>
      </div>
    );
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-[#090d16] flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#090d16] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-2xl space-y-8">
        {/* Header */}
        <div className="text-center space-y-2">
          <span className="text-xs font-bold text-cyan-400 uppercase tracking-widest bg-cyan-400/10 border border-cyan-400/20 px-3 py-1 rounded-full">
            System Check
          </span>
          <h1 className="text-3xl font-extrabold text-white mt-4" style={{ fontFamily: 'Outfit, sans-serif' }}>
            Hardware Verification
          </h1>
          <p className="text-gray-400 text-sm">
            We need access to your camera, microphone, and screen before starting the interview.
          </p>
        </div>

        {/* Camera Preview */}
        <div className="relative rounded-3xl overflow-hidden bg-black border border-white/10 aspect-video flex items-center justify-center">
          <video ref={videoRef} autoPlay muted playsInline className="w-full h-full object-cover" />
          {checks.camera === 'pending' && (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-3">
              <Camera className="w-12 h-12 text-gray-600" />
              <p className="text-gray-500 text-sm">Camera preview will appear here</p>
            </div>
          )}
          {checks.camera === 'pass' && (
            <div className="absolute top-3 left-3 flex items-center gap-2 bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 text-xs font-bold px-3 py-1.5 rounded-full">
              <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></div>
              LIVE
            </div>
          )}
        </div>

        {/* Checks */}
        <div className="space-y-3">
          <CheckRow label="Camera" icon={Camera} status={checks.camera} />
          <CheckRow label="Microphone" icon={Mic} status={checks.microphone} />
          <CheckRow label="Screen Share" icon={Monitor} status={checks.screen} />
        </div>

        {/* Error message */}
        {errorMsg && (
          <div className="p-4 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm font-medium">
            ⚠️ {errorMsg}
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-3">
          <button
            onClick={runChecks}
            disabled={running}
            className="flex items-center gap-2 px-5 py-3 bg-white/5 border border-white/10 hover:bg-white/10 text-white text-sm font-semibold rounded-xl transition disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${running ? 'animate-spin' : ''}`} />
            {running ? 'Checking...' : checks.camera === 'pending' ? 'Run Checks' : 'Re-check'}
          </button>

          <button
            onClick={proceedToInterview}
            disabled={!allPassed}
            className="flex-1 flex items-center justify-center gap-2 bg-gradient-to-r from-indigo-500 to-indigo-700 text-white text-sm font-bold px-5 py-3 rounded-xl shadow-lg shadow-indigo-500/20 hover:brightness-110 active:scale-95 transition disabled:opacity-30 disabled:cursor-not-allowed"
          >
            <span>Proceed to Interview</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        <p className="text-center text-xs text-gray-600">
          Your video is only recorded during the interview. No data is stored during this hardware check.
        </p>
      </div>
    </div>
  );
}
