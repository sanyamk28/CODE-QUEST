import React from 'react';
import { Mail, KeyRound, ArrowRight, UserPlus, LogIn, AlertCircle } from 'lucide-react';

interface AuthModalProps {
  authMode: 'login' | 'signup';
  authEmail: string;
  authPass: string;
  authName: string;
  authLoading: boolean;
  authError: string | null;
  onSetAuthMode: (mode: 'login' | 'signup') => void;
  onEmailChange: (val: string) => void;
  onPassChange: (val: string) => void;
  onNameChange: (val: string) => void;
  onSubmit: (e: React.FormEvent) => void;
  onQuickDemoLogin: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  authMode,
  authEmail,
  authPass,
  authName,
  authLoading,
  authError,
  onSetAuthMode,
  onEmailChange,
  onPassChange,
  onNameChange,
  onSubmit,
  onQuickDemoLogin,
}) => {
  return (
    <div className="min-h-screen bg-[#070a13] flex flex-col justify-center items-center p-6 text-slate-100 font-['Plus_Jakarta_Sans'] selection:bg-indigo-500">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center space-y-2">
          <div className="inline-flex h-12 w-12 rounded-2xl bg-gradient-to-br from-indigo-500 via-sky-500 to-emerald-500 p-[1.5px] shadow-xl shadow-indigo-500/20 mb-2">
            <div className="h-full w-full bg-[#070a13] rounded-[14px] flex items-center justify-center font-mono font-black text-sky-400 text-sm">
              &lt;CQ&gt;
            </div>
          </div>
          <h1 className="text-2xl font-black tracking-tight text-white">
            {authMode === 'login' ? 'Sign In to Code Quest' : 'Create Your Candidate Account'}
          </h1>
          <p className="text-xs text-slate-400">
            {authMode === 'login'
              ? 'Access live code battles, SQL labs, and real ATS resume scanner'
              : 'Join top engineering candidates mastering technical placement rounds'}
          </p>
        </div>

        <div className="p-8 rounded-3xl bg-slate-900/80 border border-slate-800 shadow-2xl backdrop-blur-xl space-y-5">
          {authError && (
            <div className="p-3.5 rounded-xl bg-rose-950/40 border border-rose-800/60 text-xs text-rose-300 flex items-center gap-2">
              <AlertCircle className="h-4 w-4 shrink-0 text-rose-400" />
              <span>{authError}</span>
            </div>
          )}

          <form onSubmit={onSubmit} className="space-y-4">
            {authMode === 'signup' && (
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-slate-300">Full Name</label>
                <div className="relative">
                  <input
                    type="text"
                    required
                    value={authName}
                    onChange={(e) => onNameChange(e.target.value)}
                    placeholder="e.g. Alex Chen"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-100 outline-none focus:border-indigo-500"
                  />
                </div>
              </div>
            )}

            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-slate-300">Email Address</label>
              <div className="relative">
                <Mail className="h-4 w-4 absolute left-3.5 top-3 text-slate-500" />
                <input
                  type="email"
                  required
                  value={authEmail}
                  onChange={(e) => onEmailChange(e.target.value)}
                  placeholder="candidate@university.edu"
                  className="w-full pl-10 pr-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-100 outline-none focus:border-indigo-500"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-slate-300">Password</label>
              <div className="relative">
                <KeyRound className="h-4 w-4 absolute left-3.5 top-3 text-slate-500" />
                <input
                  type="password"
                  required
                  value={authPass}
                  onChange={(e) => onPassChange(e.target.value)}
                  placeholder="Min 8 characters"
                  className="w-full pl-10 pr-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-100 outline-none focus:border-indigo-500"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={authLoading}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-sky-600 hover:from-indigo-500 hover:to-sky-500 text-white font-bold text-xs shadow-lg shadow-indigo-600/30 flex items-center justify-center gap-2 transition disabled:opacity-50"
            >
              {authLoading ? (
                <span>Authenticating...</span>
              ) : authMode === 'login' ? (
                <>
                  <LogIn className="h-4 w-4" /> Sign In ➔
                </>
              ) : (
                <>
                  <UserPlus className="h-4 w-4" /> Start Preparation Journey ➔
                </>
              )}
            </button>
          </form>

          <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-xs">
            <span className="text-slate-400">
              {authMode === 'login' ? "Don't have an account?" : 'Already registered?'}
            </span>
            <button
              type="button"
              onClick={() => onSetAuthMode(authMode === 'login' ? 'signup' : 'login')}
              className="text-sky-400 font-bold hover:underline"
            >
              {authMode === 'login' ? 'Sign Up' : 'Sign In'}
            </button>
          </div>

          <div className="pt-2">
            <button
              type="button"
              onClick={onQuickDemoLogin}
              className="w-full py-2 rounded-xl bg-slate-800/80 hover:bg-slate-700/80 text-slate-300 font-semibold text-[11px] border border-slate-700 transition"
            >
              ⚡ Quick Demo Login (Alex Chen)
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
