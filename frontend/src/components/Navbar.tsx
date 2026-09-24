import React from 'react';
import { Shield, Zap, Flame, LogOut } from 'lucide-react';
import { ActiveTabType } from '../types';

interface NavbarProps {
  userName: string;
  targetRole: string;
  readinessScore: number;
  xp: number;
  streak: number;
  isAdminUser: boolean;
  onSelectTab: (tab: ActiveTabType) => void;
  onSwitchToAdmin: () => void;
  onLogout: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  userName,
  targetRole,
  readinessScore,
  xp,
  streak,
  isAdminUser,
  onSelectTab,
  onSwitchToAdmin,
  onLogout,
}) => {
  return (
    <header className="sticky top-0 z-50 bg-[#070a13]/90 backdrop-blur-md border-b border-slate-800/80 px-6 py-3.5 flex items-center justify-between">
      <div className="flex items-center gap-3 cursor-pointer" onClick={() => onSelectTab('dashboard')}>
        <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-indigo-500 via-sky-500 to-emerald-500 p-[1.5px] flex items-center justify-center shadow-lg shadow-indigo-500/20">
          <div className="h-full w-full bg-[#070a13] rounded-[10px] flex items-center justify-center font-mono font-bold text-sky-400 text-xs">
            &lt;CQ&gt;
          </div>
        </div>
        <div>
          <div className="flex items-center gap-2">
            <span className="font-extrabold tracking-tight text-lg bg-clip-text text-transparent bg-gradient-to-r from-white via-slate-200 to-sky-400">
              CODE QUEST
            </span>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 tracking-wider">
              PRO 2026
            </span>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-4">
        {isAdminUser && (
          <button
            onClick={onSwitchToAdmin}
            className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-rose-950/40 border border-rose-800/50 text-rose-300 text-xs font-bold hover:bg-rose-900/50 transition"
          >
            <Shield className="h-3.5 w-3.5" /> Admin Console
          </button>
        )}

        <div className="hidden md:flex items-center gap-2.5 px-3.5 py-1.5 rounded-xl bg-slate-900/90 border border-slate-800 shadow-inner">
          <div className="relative flex items-center justify-center h-6 w-6">
            <span className="text-xs">🎯</span>
          </div>
          <div>
            <div className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Placement Readiness</div>
            <div className="text-xs font-extrabold text-emerald-400 flex items-center gap-1">
              {readinessScore}% <span className="text-[9px] text-slate-400 font-normal">(Top 12%)</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-indigo-950/40 border border-indigo-800/40">
          <Zap className="h-4 w-4 text-amber-400 fill-amber-400 animate-pulse" />
          <span className="text-xs font-bold text-indigo-200">{xp} <span className="text-slate-400 font-normal">XP</span></span>
        </div>

        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-orange-950/40 border border-orange-800/40 text-orange-300">
          <Flame className="h-4 w-4 text-orange-400 fill-orange-400" />
          <span className="text-xs font-bold">{streak}d</span>
        </div>

        <div className="flex items-center gap-3 pl-2 border-l border-slate-800">
          <div className="h-8 w-8 rounded-full bg-gradient-to-tr from-sky-500 to-indigo-600 flex items-center justify-center font-bold text-xs text-white shadow-md">
            {userName.substring(0, 2).toUpperCase()}
          </div>
          <div className="hidden lg:block text-left">
            <div className="text-xs font-semibold text-slate-200">{userName}</div>
            <div className="text-[10px] text-slate-400">{targetRole}</div>
          </div>
          <button
            onClick={onLogout}
            title="Log Out"
            className="p-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-rose-400 transition border border-slate-800"
          >
            <LogOut className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
    </header>
  );
};
