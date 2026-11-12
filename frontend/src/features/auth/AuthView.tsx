import React, { useState } from 'react';
import {
  Eye,
  EyeOff,
  Code2,
  Database,
  Lock,
  Mail,
  ArrowRight,
  ArrowLeft,
  AlertCircle,
  Loader2,
  Sparkles,
  ShieldCheck,
  UserCheck
} from 'lucide-react';
import { apiClient } from '../../services/api';

interface AuthViewProps {
  onLoginSuccess: (name: string, role: string, needsOnboarding?: boolean) => void;
  initialScreen?: 'splash' | 'login';
}

export const AuthView: React.FC<AuthViewProps> = ({
  onLoginSuccess,
  initialScreen = 'splash',
}) => {
  const [currentScreen, setCurrentScreen] = useState<'splash' | 'auth'>(initialScreen === 'splash' ? 'splash' : 'auth');
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const cleanEmail = email.trim().toLowerCase();
    if (!cleanEmail || !password) {
      setError('Please provide both your email address and password.');
      setLoading(false);
      return;
    }

    try {
      if (isSignUp) {
        // Register API call - saves user in backend database
        const res = await apiClient.post('/auth/register', {
          name: fullName.trim() || undefined,
          email: cleanEmail,
          password: password,
        });

        const data = res.data;
        if (data.access_token) {
          localStorage.setItem('cq_token', data.access_token);
        }
        const userDisplayName = data.name || fullName.trim() || cleanEmail.split('@')[0];
        localStorage.setItem('cq_user_name', userDisplayName);
        localStorage.setItem('cq_logged_in', 'true');
        
        onLoginSuccess(userDisplayName, data.target_role || '', data.needs_onboarding ?? true);
      } else {
        // Login API call - if new user, backend auto-creates and saves their credentials!
        const res = await apiClient.post('/auth/login', {
          email: cleanEmail,
          password: password,
        });

        const data = res.data;
        if (data.access_token) {
          localStorage.setItem('cq_token', data.access_token);
        }
        const userDisplayName = data.name || cleanEmail.split('@')[0];
        localStorage.setItem('cq_user_name', userDisplayName);
        localStorage.setItem('cq_logged_in', 'true');
        
        const needsOnboard = data.needs_onboarding || !data.target_role;
        onLoginSuccess(userDisplayName, data.target_role || '', needsOnboard);
      }
    } catch (err: any) {
      console.error('Authentication error:', err);
      const detail = err.response?.data?.detail;
      let msg = 'Authentication failed. Please verify your credentials.';
      if (typeof detail === 'string') {
        msg = detail;
      } else if (Array.isArray(detail) && detail[0]?.msg) {
        msg = detail[0].msg;
      } else if (err.message === 'Network Error') {
        msg = 'Backend connection offline or initializing. Please retry in a moment.';
      }
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  // SCREEN 1: Mobile Splash Screen
  if (currentScreen === 'splash') {
    return (
      <div className="min-h-screen w-full bg-[#070a13] text-slate-100 flex flex-col justify-between items-center p-6 md:p-10 font-['Plus_Jakarta_Sans'] bg-tech-grid relative overflow-hidden select-none">
        {/* Ambient background glows */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-indigo-600/25 rounded-full blur-[110px] pointer-events-none" />
        <div className="absolute bottom-1/4 left-1/2 -translate-x-1/2 translate-y-1/2 w-80 h-80 bg-blue-600/20 rounded-full blur-[110px] pointer-events-none" />

        {/* Top bar */}
        <div className="w-full max-w-md flex items-center justify-between z-10 pt-2">
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-xs font-semibold text-slate-400">Live Placement Platform</span>
          </div>
          <button
            onClick={() => {
              setIsSignUp(false);
              setCurrentScreen('auth');
            }}
            className="text-xs font-semibold text-sky-400 hover:text-sky-300 px-3 py-1.5 rounded-full bg-slate-900/60 border border-slate-800 transition"
          >
            Sign In
          </button>
        </div>

        {/* Center Content: Monogram Logo & 3D Tech Elements */}
        <div className="w-full max-w-sm flex flex-col items-center text-center my-auto z-10 space-y-6">
          {/* Glowing Monogram Logo */}
          <div className="relative group">
            <div className="h-24 w-24 rounded-3xl bg-gradient-to-tr from-indigo-500 via-purple-500 to-sky-400 p-[2px] shadow-2xl shadow-indigo-500/40 animate-pulse">
              <div className="h-full w-full bg-[#090d16] rounded-[22px] flex items-center justify-center">
                <span className="text-4xl font-black bg-clip-text text-transparent bg-gradient-to-tr from-indigo-400 to-sky-300">
                  C
                </span>
              </div>
            </div>
            <div className="absolute -inset-2 bg-gradient-to-r from-indigo-500 to-sky-500 rounded-3xl blur-xl opacity-30 group-hover:opacity-60 transition duration-500" />
          </div>

          {/* Title & Tagline */}
          <div className="space-y-2">
            <h1 className="text-3xl font-black tracking-tight text-white">Code Quest</h1>
            <p className="text-xs sm:text-sm text-slate-400 font-medium max-w-xs">
              Master Tech Interviews. Calibrate Your Skills. Land Your Dream Role.
            </p>
          </div>

          {/* Floating Badges Illustration */}
          <div className="relative w-72 h-44 my-4 flex items-center justify-center">
            {/* Floating Python Badge */}
            <div className="absolute top-2 left-4 bg-[#0d162b]/95 border border-sky-500/40 rounded-xl px-3 py-2 shadow-lg backdrop-blur-md flex items-center gap-2 transform -rotate-6">
              <Code2 className="h-4 w-4 text-sky-400" />
              <span className="text-[11px] font-bold text-sky-200">Python / DSA</span>
            </div>

            {/* Floating SQL Badge */}
            <div className="absolute top-3 right-4 bg-[#0d162b]/95 border border-indigo-500/40 rounded-xl px-3 py-2 shadow-lg backdrop-blur-md flex items-center gap-2 transform rotate-6">
              <Database className="h-4 w-4 text-indigo-400" />
              <span className="text-[11px] font-bold text-indigo-200">SQL Lab</span>
            </div>

            {/* Floating Laptop Graphic */}
            <div className="w-56 bg-[#0a0f1d] border border-slate-700/80 rounded-2xl p-3 shadow-2xl shadow-indigo-950/70 transform hover:scale-105 transition-transform duration-300">
              <div className="flex items-center gap-1 pb-1.5 mb-1.5 border-b border-slate-800">
                <span className="h-2 w-2 rounded-full bg-rose-500" />
                <span className="h-2 w-2 rounded-full bg-amber-500" />
                <span className="h-2 w-2 rounded-full bg-emerald-500" />
                <span className="text-[9px] font-mono text-slate-500 ml-1">codequest.dev</span>
              </div>
              <div className="space-y-1 font-mono text-[9px] text-slate-300 text-left">
                <div className="text-indigo-400">def landDreamJob():</div>
                <div className="text-sky-300 pl-3">return &quot;Offer Letter!&quot;</div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Actions */}
        <div className="w-full max-w-sm space-y-3 z-10 pb-4">
          <button
            onClick={() => {
              setIsSignUp(false);
              setCurrentScreen('auth');
            }}
            className="w-full py-3.5 px-6 rounded-2xl bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-sm shadow-xl shadow-indigo-600/30 transition transform active:scale-[0.98] flex items-center justify-center gap-2"
          >
            <span>Get Started & Log In</span>
            <ArrowRight className="h-4 w-4" />
          </button>

          <p className="text-center text-xs text-slate-400">
            New here?{' '}
            <button
              onClick={() => {
                setIsSignUp(true);
                setCurrentScreen('auth');
              }}
              className="text-sky-400 hover:text-sky-300 font-bold ml-1 transition"
            >
              Create Account
            </button>
          </p>
        </div>
      </div>
    );
  }

  // SCREEN 2: Login / Signup Screen
  return (
    <div className="min-h-screen w-full bg-[#070a13] text-slate-100 flex items-center justify-center p-4 sm:p-6 md:p-8 font-['Plus_Jakarta_Sans'] bg-tech-grid relative overflow-hidden select-none">
      {/* Background ambient lighting */}
      <div className="absolute top-1/4 left-1/4 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-indigo-600/15 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 translate-x-1/2 translate-y-1/2 w-96 h-96 bg-sky-600/15 rounded-full blur-[120px] pointer-events-none" />

      {/* Main Container */}
      <div className="w-full max-w-4xl bg-[#090d16]/90 border border-slate-800/80 rounded-3xl shadow-2xl backdrop-blur-xl overflow-hidden grid grid-cols-1 lg:grid-cols-2 min-h-[580px]">
        {/* Form Column */}
        <div className="p-6 sm:p-8 md:p-10 flex flex-col justify-between">
          <div>
            {/* Top Navigation & Back Arrow */}
            <div className="flex items-center justify-between mb-6">
              <button
                onClick={() => setCurrentScreen('splash')}
                className="p-2 rounded-xl bg-slate-900/80 text-slate-400 hover:text-white border border-slate-800 transition flex items-center gap-1.5 text-xs font-semibold"
              >
                <ArrowLeft className="h-4 w-4" />
                <span>Back</span>
              </button>

              <div className="flex items-center gap-1.5 text-[11px] text-slate-400 bg-slate-900/60 px-2.5 py-1 rounded-full border border-slate-800">
                <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" />
                <span>Secure Authentication</span>
              </div>
            </div>

            {/* Headline */}
            <div className="space-y-1.5 mb-5">
              <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
                {isSignUp ? 'Create Your Account' : 'Sign In to Continue'}
              </h2>
              <p className="text-xs text-slate-400">
                {isSignUp
                  ? 'Register with your email and password to begin preparation'
                  : 'Enter your email and password to access your candidate workspace'}
              </p>
            </div>

            {/* Error Message Box */}
            {error && (
              <div className="mb-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/40 text-rose-300 text-xs flex items-start gap-2.5 animate-in fade-in duration-200">
                <AlertCircle className="h-4 w-4 shrink-0 text-rose-400 mt-0.5" />
                <span className="leading-relaxed">{error}</span>
              </div>
            )}

            {/* Tab Selector: Sign In vs Sign Up */}
            <div className="p-1 rounded-xl bg-[#0e1424] border border-slate-800/80 flex mb-4">
              <button
                type="button"
                onClick={() => {
                  setIsSignUp(false);
                  setError(null);
                }}
                className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${
                  !isSignUp
                    ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Sign In
              </button>
              <button
                type="button"
                onClick={() => {
                  setIsSignUp(true);
                  setError(null);
                }}
                className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${
                  isSignUp
                    ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Sign Up
              </button>
            </div>

            {/* Notice for seamless random login */}
            <div className="mb-4 px-3 py-2 rounded-xl bg-indigo-950/40 border border-indigo-800/40 text-[11px] text-indigo-300 flex items-center gap-2">
              <Sparkles className="h-3.5 w-3.5 text-sky-400 shrink-0" />
              <span>Enter any email and password. Your candidate data is saved permanently in the database.</span>
            </div>

            {/* Email / Password Form */}
            <form onSubmit={handleSubmit} className="space-y-3.5">
              {isSignUp && (
                <div>
                  <label className="text-[11px] font-semibold text-slate-300 block mb-1">Your Name</label>
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="e.g. Sanyam Kumar"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#0e1424] border border-slate-800 text-xs text-slate-200 outline-none focus:border-indigo-500 transition font-medium"
                    required
                  />
                </div>
              )}

              <div>
                <label className="text-[11px] font-semibold text-slate-300 block mb-1">Email Address</label>
                <div className="relative">
                  <Mail className="h-4 w-4 absolute left-3.5 top-3 text-slate-500" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="user@example.com"
                    className="w-full pl-10 pr-3.5 py-2.5 rounded-xl bg-[#0e1424] border border-slate-800 text-xs text-slate-200 outline-none focus:border-indigo-500 transition font-medium"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="text-[11px] font-semibold text-slate-300 block mb-1">Password</label>
                <div className="relative">
                  <Lock className="h-4 w-4 absolute left-3.5 top-3 text-slate-500" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••••••"
                    className="w-full pl-10 pr-10 py-2.5 rounded-xl bg-[#0e1424] border border-slate-800 text-xs text-slate-200 outline-none focus:border-indigo-500 transition font-medium"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-2.5 text-slate-500 hover:text-slate-300"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-500 hover:to-indigo-500 disabled:opacity-60 text-white font-bold text-xs shadow-lg shadow-indigo-600/30 transition flex items-center justify-center gap-2 mt-4 active:scale-[0.99]"
              >
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Verifying & Saving...</span>
                  </>
                ) : (
                  <>
                    <span>{isSignUp ? 'Create Account & Continue' : 'Sign In & Continue'}</span>
                    <ArrowRight className="h-4 w-4" />
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Toggle bottom link */}
          <div className="pt-3 border-t border-slate-800/80 text-center text-xs text-slate-400 mt-4">
            {isSignUp ? (
              <span>
                Already have an account?{' '}
                <button
                  type="button"
                  onClick={() => {
                    setIsSignUp(false);
                    setError(null);
                  }}
                  className="text-sky-400 hover:text-sky-300 font-bold ml-1"
                >
                  Sign In
                </button>
              </span>
            ) : (
              <span>
                Don't have an account?{' '}
                <button
                  type="button"
                  onClick={() => {
                    setIsSignUp(true);
                    setError(null);
                  }}
                  className="text-sky-400 hover:text-sky-300 font-bold ml-1"
                >
                  Sign Up
                </button>
              </span>
            )}
          </div>
        </div>

        {/* Right Hero Graphic Column (Desktop) */}
        <div className="hidden lg:flex flex-col justify-between p-10 bg-gradient-to-br from-[#0c1324] via-[#090e1c] to-[#070b14] border-l border-slate-800/80 relative overflow-hidden">
          <div className="absolute top-10 right-10 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-10 left-10 w-64 h-64 bg-sky-500/10 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 flex items-center justify-between">
            <div className="px-3 py-1 rounded-full bg-slate-900/80 border border-slate-700/60 text-[11px] font-semibold text-slate-300 flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>Step 1: Authenticate Candidate</span>
            </div>
          </div>

          <div className="relative z-10 my-auto py-8 flex flex-col items-center justify-center">
            <div className="w-80 rounded-2xl bg-[#090f1d] border border-slate-700/70 p-4 shadow-2xl shadow-indigo-950/60">
              <div className="flex items-center gap-1.5 pb-2 mb-3 border-b border-slate-800">
                <div className="h-2 w-2 rounded-full bg-rose-500" />
                <div className="h-2 w-2 rounded-full bg-amber-500" />
                <div className="h-2 w-2 rounded-full bg-emerald-500" />
                <span className="text-[10px] text-slate-500 font-mono ml-2">codequest.dev/portal</span>
              </div>
              <div className="bg-[#050913] rounded-lg p-3 font-mono text-[10px] space-y-1.5 text-slate-300">
                <div className="text-indigo-400"># Personalized Prep Flow:</div>
                <div className="text-sky-300">1. Authenticate with Email & Password</div>
                <div className="text-emerald-400">2. Select Targeted Engineering Role</div>
                <div className="text-purple-400">3. Calibrate Timeline & Knowledge %</div>
                <div className="text-amber-300">4. Tailored DSA, SQL & AI Roadmaps</div>
              </div>
            </div>
          </div>

          <div className="relative z-10 text-center pt-4 border-t border-slate-800/60">
            <p className="text-xs font-semibold text-slate-300 tracking-wide">
              Every candidate gets custom-calibrated questions & analytics
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
