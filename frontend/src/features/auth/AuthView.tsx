import React, { useState } from 'react';
import {
  Sparkles,
  Eye,
  EyeOff,
  Code2,
  Database,
  Bot,
  Lock,
  Mail,
  ArrowRight,
  ArrowLeft,
  ShieldCheck,
  Laptop,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Zap,
  UserCheck
} from 'lucide-react';
import { apiClient } from '../../services/api';

interface AuthViewProps {
  onLoginSuccess: (name: string, role: string) => void;
  onSkipToDashboard?: () => void;
  initialScreen?: 'splash' | 'login';
}

export const AuthView: React.FC<AuthViewProps> = ({
  onLoginSuccess,
  onSkipToDashboard,
  initialScreen = 'splash',
}) => {
  const [currentScreen, setCurrentScreen] = useState<'splash' | 'auth'>(initialScreen === 'splash' ? 'splash' : 'auth');
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('alex.chen@codequest.dev');
  const [password, setPassword] = useState('pass123');
  const [fullName, setFullName] = useState('Alex Chen');
  const [targetRole, setTargetRole] = useState('Software Engineer');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      if (isSignUp) {
        // Register API call
        const res = await apiClient.post('/auth/register', {
          name: fullName.trim() || undefined,
          email: email.trim().toLowerCase(),
          password: password,
        });

        const data = res.data;
        if (data.access_token) {
          localStorage.setItem('cq_token', data.access_token);
        }
        const userDisplayName = data.name || fullName.trim() || 'Student';
        localStorage.setItem('cq_user_name', userDisplayName);
        localStorage.setItem('cq_target_role', targetRole);
        localStorage.setItem('cq_logged_in', 'true');
        onLoginSuccess(userDisplayName, targetRole);
      } else {
        // Login API call
        const res = await apiClient.post('/auth/login', {
          email: email.trim().toLowerCase(),
          password: password,
        });

        const data = res.data;
        if (data.access_token) {
          localStorage.setItem('cq_token', data.access_token);
        }
        const userDisplayName = data.name || email.split('@')[0];
        localStorage.setItem('cq_user_name', userDisplayName);
        localStorage.setItem('cq_target_role', targetRole);
        localStorage.setItem('cq_logged_in', 'true');
        onLoginSuccess(userDisplayName, targetRole);
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
        msg = 'Backend connection offline or initializing. Click "Instant Guest Mode" below to proceed!';
      }
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleQuickFill = (fillEmail: string, fillPass: string, fillName: string, fillRole: string) => {
    setEmail(fillEmail);
    setPassword(fillPass);
    setFullName(fillName);
    setTargetRole(fillRole);
    setIsSignUp(false);
    setError(null);
  };

  const handleGuestAccess = () => {
    const guestName = fullName.trim() || 'Guest Student';
    localStorage.setItem('cq_token', `guest_${Date.now()}`);
    localStorage.setItem('cq_user_name', guestName);
    localStorage.setItem('cq_target_role', targetRole || 'Software Engineer');
    localStorage.setItem('cq_logged_in', 'true');
    onLoginSuccess(guestName, targetRole || 'Software Engineer');
  };

  const handleOAuth = (provider: 'Google' | 'GitHub') => {
    // Demo OAuth shortcut
    const oauthName = provider === 'Google' ? 'Google Candidate' : 'GitHub Developer';
    localStorage.setItem('cq_token', `mock_${provider.toLowerCase()}_token`);
    localStorage.setItem('cq_user_name', oauthName);
    localStorage.setItem('cq_target_role', targetRole);
    localStorage.setItem('cq_logged_in', 'true');
    onLoginSuccess(oauthName, targetRole);
  };

  // SCREEN 1: Mobile Splash Screen
  if (currentScreen === 'splash') {
    return (
      <div className="min-h-screen w-full bg-[#070a13] text-slate-100 flex flex-col justify-between items-center p-6 md:p-10 font-['Plus_Jakarta_Sans'] bg-tech-grid relative overflow-hidden select-none">
        {/* Ambient background glows */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-indigo-600/25 rounded-full blur-[110px] pointer-events-none" />
        <div className="absolute bottom-1/4 left-1/2 -translate-x-1/2 translate-y-1/2 w-80 h-80 bg-blue-600/20 rounded-full blur-[110px] pointer-events-none" />

        {/* Top bar with Skip button */}
        <div className="w-full max-w-md flex items-center justify-end z-10 pt-2">
          <button
            onClick={handleGuestAccess}
            className="text-xs font-semibold text-slate-400 hover:text-sky-400 px-3 py-1.5 rounded-full bg-slate-900/60 border border-slate-800 transition flex items-center gap-1.5"
          >
            <span>Skip to App</span>
            <ArrowRight className="h-3.5 w-3.5" />
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
              Master Tech. Land Your Dream Job.
            </p>
          </div>

          {/* 3D Floating Badges Illustration */}
          <div className="relative w-72 h-44 my-4 flex items-center justify-center">
            {/* Floating Python Badge */}
            <div className="absolute top-2 left-4 bg-[#0d162b]/95 border border-sky-500/40 rounded-xl px-3 py-2 shadow-lg backdrop-blur-md flex items-center gap-2 transform -rotate-6 animate-float-slow">
              <Code2 className="h-4 w-4 text-sky-400" />
              <span className="text-[11px] font-bold text-sky-200">Python</span>
            </div>

            {/* Floating SQL Badge */}
            <div className="absolute top-3 right-4 bg-[#0d162b]/95 border border-indigo-500/40 rounded-xl px-3 py-2 shadow-lg backdrop-blur-md flex items-center gap-2 transform rotate-6 animate-float-slow" style={{ animationDelay: '1s' }}>
              <Database className="h-4 w-4 text-indigo-400" />
              <span className="text-[11px] font-bold text-indigo-200">SQL</span>
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
            onClick={() => setCurrentScreen('auth')}
            className="w-full py-3.5 px-6 rounded-2xl bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-sm shadow-xl shadow-indigo-600/30 transition transform active:scale-[0.98] flex items-center justify-center gap-2"
          >
            <span>Get Started</span>
            <ArrowRight className="h-4 w-4" />
          </button>

          <p className="text-center text-xs text-slate-400">
            Already have an account?{' '}
            <button
              onClick={() => {
                setIsSignUp(false);
                setCurrentScreen('auth');
              }}
              className="text-sky-400 hover:text-sky-300 font-bold ml-1 transition"
            >
              Sign In
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
      <div className="w-full max-w-4xl bg-[#090d16]/90 border border-slate-800/80 rounded-3xl shadow-2xl backdrop-blur-xl overflow-hidden grid grid-cols-1 lg:grid-cols-2 min-h-[600px]">
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
                <span>Splash</span>
              </button>

              <button
                onClick={handleGuestAccess}
                className="text-xs text-slate-400 hover:text-sky-400 transition flex items-center gap-1"
              >
                <span>Guest Mode</span>
                <ArrowRight className="h-3 w-3" />
              </button>
            </div>

            {/* Headline */}
            <div className="space-y-1.5 mb-5">
              <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
                {isSignUp ? 'Create your account' : 'Welcome back'}
              </h2>
              <p className="text-xs text-slate-400">
                {isSignUp
                  ? 'Join Code Quest and accelerate your placement preparation'
                  : 'Enter your credentials to access your interview workspace'}
              </p>
            </div>

            {/* Quick Demo Pre-seed Logins Pill Box */}
            <div className="mb-4 p-3 rounded-2xl bg-[#0b1020] border border-indigo-900/40 space-y-2">
              <div className="flex items-center justify-between text-[11px] font-semibold text-slate-400">
                <span className="flex items-center gap-1 text-indigo-400">
                  <Zap className="h-3.5 w-3.5" /> 1-Click Demo Accounts:
                </span>
              </div>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => handleQuickFill('alex.chen@codequest.dev', 'pass123', 'Alex Chen', 'Software Engineer')}
                  className="px-2.5 py-1.5 rounded-lg bg-indigo-950/70 hover:bg-indigo-900/90 border border-indigo-700/50 text-[11px] font-medium text-indigo-200 transition flex items-center gap-1.5"
                >
                  <UserCheck className="h-3 w-3 text-sky-400" />
                  <span>Student (Alex)</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleQuickFill('admin@codequest.dev', 'Admin@1234', 'Admin User', 'Engineering Lead')}
                  className="px-2.5 py-1.5 rounded-lg bg-purple-950/70 hover:bg-purple-900/90 border border-purple-700/50 text-[11px] font-medium text-purple-200 transition flex items-center gap-1.5"
                >
                  <ShieldCheck className="h-3 w-3 text-purple-400" />
                  <span>Admin</span>
                </button>
                <button
                  type="button"
                  onClick={handleGuestAccess}
                  className="px-2.5 py-1.5 rounded-lg bg-emerald-950/70 hover:bg-emerald-900/90 border border-emerald-700/50 text-[11px] font-medium text-emerald-200 transition flex items-center gap-1.5 ml-auto"
                >
                  <Sparkles className="h-3 w-3 text-emerald-400" />
                  <span>Instant Guest</span>
                </button>
              </div>
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

            {/* Email / Password Form */}
            <form onSubmit={handleSubmit} className="space-y-3.5">
              {isSignUp && (
                <>
                  <div>
                    <label className="text-[11px] font-semibold text-slate-300 block mb-1">Full Name</label>
                    <input
                      type="text"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="e.g. Sanyam Kumar"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-[#0e1424] border border-slate-800 text-xs text-slate-200 outline-none focus:border-indigo-500 transition font-medium"
                      required
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-semibold text-slate-300 block mb-1">Target Role / Position</label>
                    <input
                      type="text"
                      list="auth-roles-list"
                      value={targetRole}
                      onChange={(e) => setTargetRole(e.target.value)}
                      placeholder="e.g. Software Engineer, Data Engineer..."
                      className="w-full px-3.5 py-2.5 rounded-xl bg-[#0e1424] border border-slate-800 text-xs text-slate-200 outline-none focus:border-indigo-500 transition font-medium"
                      required
                    />
                    <datalist id="auth-roles-list">
                      <option value="Software Engineer" />
                      <option value="Data Engineer" />
                      <option value="AI / Machine Learning Engineer" />
                      <option value="Backend Developer" />
                      <option value="Full Stack Developer" />
                      <option value="Cloud / DevOps Engineer" />
                    </datalist>
                  </div>
                </>
              )}

              <div>
                <label className="text-[11px] font-semibold text-slate-300 block mb-1">Email address</label>
                <div className="relative">
                  <Mail className="h-4 w-4 absolute left-3.5 top-3 text-slate-500" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="student@codequest.dev"
                    className="w-full pl-10 pr-3.5 py-2.5 rounded-xl bg-[#0e1424] border border-slate-800 text-xs text-slate-200 outline-none focus:border-indigo-500 transition font-medium"
                    required
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-[11px] font-semibold text-slate-300">Password</label>
                  {!isSignUp && (
                    <a
                      href="#forgot"
                      onClick={(e) => {
                        e.preventDefault();
                        alert('Password reset feature: Use demo password "pass123" for demo candidate or "Admin@1234" for admin.');
                      }}
                      className="text-[11px] text-sky-400 hover:text-sky-300 font-medium"
                    >
                      Forgot password?
                    </a>
                  )}
                </div>
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
                    <span>Authenticating...</span>
                  </>
                ) : (
                  <>
                    <span>{isSignUp ? 'Create Free Account' : 'Sign In'}</span>
                    <ArrowRight className="h-4 w-4" />
                  </>
                )}
              </button>
            </form>

            {/* Social Divider */}
            <div className="flex items-center gap-3 my-4">
              <div className="h-px flex-1 bg-slate-800" />
              <span className="text-[11px] text-slate-500 font-medium">or continue with</span>
              <div className="h-px flex-1 bg-slate-800" />
            </div>

            {/* Social Logins */}
            <div className="grid grid-cols-2 gap-2.5">
              <button
                type="button"
                onClick={() => handleOAuth('Google')}
                className="py-2.5 px-3 rounded-xl bg-[#0e1424] hover:bg-slate-800 border border-slate-800 text-slate-200 text-xs font-semibold flex items-center justify-center gap-2 transition"
              >
                <svg className="h-4 w-4" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
                </svg>
                <span>Google</span>
              </button>

              <button
                type="button"
                onClick={() => handleOAuth('GitHub')}
                className="py-2.5 px-3 rounded-xl bg-[#0e1424] hover:bg-slate-800 border border-slate-800 text-slate-200 text-xs font-semibold flex items-center justify-center gap-2 transition"
              >
                <svg className="h-4 w-4 fill-white" viewBox="0 0 24 24">
                  <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"/>
                </svg>
                <span>GitHub</span>
              </button>
            </div>
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
              <span>Placement Ready Engine</span>
            </div>
          </div>

          <div className="relative z-10 my-auto py-8 flex flex-col items-center justify-center">
            <div className="w-80 rounded-2xl bg-[#090f1d] border border-slate-700/70 p-4 shadow-2xl shadow-indigo-950/60">
              <div className="flex items-center gap-1.5 pb-2 mb-3 border-b border-slate-800">
                <div className="h-2 w-2 rounded-full bg-rose-500" />
                <div className="h-2 w-2 rounded-full bg-amber-500" />
                <div className="h-2 w-2 rounded-full bg-emerald-500" />
                <span className="text-[10px] text-slate-500 font-mono ml-2">codequest.dev/ide</span>
              </div>
              <div className="bg-[#050913] rounded-lg p-3 font-mono text-[10px] space-y-1 text-slate-300">
                <div className="text-indigo-400">class Solution:</div>
                <div className="text-sky-300 pl-3">def twoSum(nums, target):</div>
                <div className="text-slate-400 pl-6">prev_map = {}</div>
                <div className="text-emerald-400 pl-6">for i, n in enumerate(nums):</div>
                <div className="text-amber-400 pl-9">diff = target - n</div>
                <div className="text-emerald-400 pl-9">if diff in prev_map: return [prev_map[diff], i]</div>
              </div>
            </div>
          </div>

          <div className="relative z-10 text-center pt-4 border-t border-slate-800/60">
            <p className="text-xs font-semibold text-slate-300 tracking-wide">
              Ready for Google, Microsoft, Amazon & Tier-1 Tech
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
