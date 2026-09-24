import React from 'react';
import { Sparkles, Play, Swords, Sliders, Shield, Star, Check, Flame } from 'lucide-react';
import { ActiveTabType } from '../../types';

interface DashboardViewProps {
  userName: string;
  targetRole: string;
  readinessScore: number;
  streak: number;
  obDsaLevel: number;
  obSqlLevel: number;
  obCsLevel: number;
  obAptitudeLevel: number;
  onNavigate: (tab: ActiveTabType) => void;
  onOpenWizard: () => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  userName,
  targetRole,
  readinessScore,
  streak,
  obDsaLevel,
  obSqlLevel,
  obCsLevel,
  obAptitudeLevel,
  onNavigate,
  onOpenWizard,
}) => {
  return (
    <div className="space-y-6">
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-900 via-[#0d1322] to-slate-900 border border-slate-800 p-6 shadow-xl">
        <div className="absolute -top-24 -right-24 w-72 h-72 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-3 gap-6 items-center">
          <div className="space-y-2 lg:col-span-2">
            <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <Sparkles className="h-3 w-3" /> Target Track: {targetRole}
            </div>
            <h2 className="text-2xl font-black tracking-tight text-white">
              Welcome back, {userName}! 🚀
            </h2>
            <p className="text-sm text-slate-400 leading-relaxed max-w-xl">
              Your placement readiness is at <span className="text-emerald-400 font-bold">{readinessScore}%</span>. Complete today's daily mission and practice 1 SQL query to reach the Top 10% milestone.
            </p>
            <div className="flex flex-wrap gap-3 pt-2">
              <button
                onClick={() => onNavigate('arena')}
                className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs transition flex items-center gap-2 shadow-lg shadow-indigo-600/30"
              >
                <Play className="h-3.5 w-3.5 fill-white" /> Continue Daily Quest
              </button>
              <button
                onClick={() => onNavigate('battle')}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs border border-slate-700 transition flex items-center gap-2"
              >
                <Swords className="h-3.5 w-3.5 text-amber-400" /> Join Live Code Battle
              </button>
              <button
                onClick={onOpenWizard}
                className="px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-slate-200 font-semibold text-xs border border-slate-800 transition flex items-center gap-1.5"
              >
                <Sliders className="h-3.5 w-3.5" /> Re-tune Skills Wizard
              </button>
            </div>
          </div>

          <div className="flex flex-col items-center justify-center p-4 rounded-xl bg-[#080d19]/80 border border-slate-800/80">
            <div className="relative w-28 h-28 flex items-center justify-center rounded-full border-4 border-slate-800 border-t-emerald-400 border-r-indigo-500 shadow-inner">
              <div className="text-center">
                <div className="text-2xl font-black text-white">{readinessScore}%</div>
                <div className="text-[10px] text-slate-400 font-semibold uppercase">Readiness</div>
              </div>
            </div>
            <div className="text-center mt-2 text-[11px] text-slate-400">
              Top <span className="text-sky-400 font-bold">12%</span> of Candidate Pool
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="rounded-2xl bg-slate-900/60 border border-slate-800 p-5 space-y-4">
          <h3 className="text-sm font-bold text-slate-200 flex items-center gap-2">
            <Shield className="h-4 w-4 text-sky-400" /> Domain Mastery
          </h3>
          <div className="space-y-3">
            {[
              { name: 'Data Structures & Algorithms', level: obDsaLevel, color: 'bg-indigo-500' },
              { name: 'SQL & Database Design', level: obSqlLevel, color: 'bg-sky-500' },
              { name: 'CS Fundamentals (OS/Networks)', level: obCsLevel, color: 'bg-emerald-500' },
              { name: 'Aptitude & Logical Puzzles', level: obAptitudeLevel, color: 'bg-amber-500' },
              { name: 'AI Interview & Communication', level: 78, color: 'bg-purple-500' },
            ].map((skill) => (
              <div key={skill.name} className="space-y-1">
                <div className="flex justify-between text-xs">
                  <span className="text-slate-300 font-medium">{skill.name}</span>
                  <span className="text-slate-400 font-bold">{skill.level}%</span>
                </div>
                <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden">
                  <div className={`h-full ${skill.color} rounded-full transition-all duration-500`} style={{ width: `${skill.level}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-2xl bg-slate-900/60 border border-slate-800 p-5 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-200 flex items-center gap-2">
              <Star className="h-4 w-4 text-amber-400" /> Daily Objectives
            </h3>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">+50 XP Bonus</span>
          </div>
          <div className="space-y-2.5">
            {[
              { title: "Solve 1 Medium DSA Problem", xp: 25, done: true },
              { title: "Complete SQL Aggregate Challenge", xp: 20, done: true },
              { title: "Review 1 System Design Puzzle", xp: 15, done: false },
            ].map((task, i) => (
              <div
                key={i}
                className={`p-3 rounded-xl border flex items-center justify-between text-xs transition ${
                  task.done ? 'bg-slate-900/40 border-slate-800/60 text-slate-400' : 'bg-slate-800/40 border-slate-700 text-slate-200'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <div className={`h-4 w-4 rounded-full flex items-center justify-center ${task.done ? 'bg-emerald-500/20 text-emerald-400' : 'border border-slate-600'}`}>
                    {task.done && <Check className="h-3 w-3" />}
                  </div>
                  <span className={task.done ? 'line-through' : 'font-medium'}>{task.title}</span>
                </div>
                <span className="font-bold text-amber-400">+{task.xp} XP</span>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-2xl bg-slate-900/60 border border-slate-800 p-5 space-y-4">
          <h3 className="text-sm font-bold text-slate-200 flex items-center gap-2">
            <Flame className="h-4 w-4 text-orange-400" /> Weekly Activity Streak
          </h3>
          <div className="flex items-center justify-between p-3 rounded-xl bg-orange-950/20 border border-orange-800/30">
            <div className="flex items-center gap-3">
              <span className="text-2xl">🔥</span>
              <div>
                <div className="text-sm font-bold text-orange-300">{streak}-Day Streak</div>
                <div className="text-[11px] text-slate-400">Keep it active tomorrow!</div>
              </div>
            </div>
          </div>
          <div className="grid grid-cols-7 gap-2 text-center text-xs">
            {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((day, i) => (
              <div key={i} className="space-y-1">
                <span className="text-[10px] text-slate-500 font-semibold">{day}</span>
                <div
                  className={`h-8 rounded-lg flex items-center justify-center font-bold text-[10px] ${
                    i < 5 ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40' : 'bg-slate-800/40 text-slate-600'
                  }`}
                >
                  {i < 5 ? '✓' : '•'}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
