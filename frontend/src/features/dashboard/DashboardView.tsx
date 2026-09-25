import React, { useState } from 'react';
import {
  Flame,
  CheckCircle2,
  Code2,
  Database,
  Bot,
  Sparkles,
  ArrowRight,
  Play,
  Calendar,
  Clock,
  ChevronRight,
  TrendingUp,
  Award,
  Layers,
  BookOpen,
  ArrowUpRight,
  Shuffle
} from 'lucide-react';
import { ActiveTabType } from '../../types';

interface DashboardViewProps {
  userName: string;
  targetRole: string;
  onNavigate: (tab: ActiveTabType) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  userName,
  targetRole,
  onNavigate,
}) => {
  const [registeredAssessment, setRegisteredAssessment] = useState(false);
  const [quests, setQuests] = useState([
    { id: 1, title: 'Solve 1 SQL Challenge', xp: '+20 XP', completed: true, tab: 'sql' as ActiveTabType },
    { id: 2, title: 'Solve 2 DSA Problems', xp: '+30 XP', completed: false, tab: 'arena' as ActiveTabType },
    { id: 3, title: 'Review DBMS Concepts', xp: '+15 XP', completed: false, tab: 'mcqs' as ActiveTabType },
    { id: 4, title: 'Practice Interview Question', xp: '+25 XP', completed: false, tab: 'interview' as ActiveTabType },
  ]);

  const toggleQuest = (id: number) => {
    setQuests(prev => prev.map(q => q.id === id ? { ...q, completed: !q.completed } : q));
  };

  return (
    <div className="space-y-5 max-w-5xl mx-auto pb-6">
      {/* Target Role & Readiness Hero Card matching Screen 3 */}
      <div className="bg-gradient-to-br from-[#0c1326] via-[#0b1020] to-[#080d1a] border border-slate-800/90 rounded-3xl p-5 shadow-xl relative overflow-hidden">
        {/* Glow backdrop */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800/60 relative z-10">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-2xl bg-gradient-to-tr from-sky-500 to-indigo-600 flex items-center justify-center text-white font-extrabold text-sm shadow-md">
              {userName ? userName.substring(0, 2).toUpperCase() : 'SK'}
            </div>
            <div>
              <div className="text-xs text-slate-400 font-medium">Target Role</div>
              <div className="text-base font-black text-white flex items-center gap-2">
                <span>{targetRole || 'Data Engineer'}</span>
                <button
                  onClick={() => onNavigate('settings')}
                  className="text-[10px] font-bold text-sky-400 hover:text-sky-300 px-2 py-0.5 rounded-full bg-sky-500/15 border border-sky-500/30 transition flex items-center gap-1"
                >
                  <Shuffle className="h-2.5 w-2.5" />
                  <span>Switch</span>
                </button>
              </div>
            </div>
          </div>

          {/* Mini role badge */}
          <div className="hidden sm:flex items-center gap-2 text-xs font-semibold text-emerald-400 bg-emerald-950/30 border border-emerald-800/30 px-3 py-1 rounded-full">
            <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>Placement Track Active</span>
          </div>
        </div>

        {/* Readiness and Core Stats Row matching Screen 3 */}
        <div className="grid grid-cols-4 gap-2 pt-4 relative z-10">
          {/* Stat 1: 78% Readiness */}
          <div className="flex flex-col items-center justify-center p-2 rounded-2xl bg-[#090e1b]/80 border border-slate-800/60">
            <div className="relative w-12 h-12 flex items-center justify-center">
              <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                <path
                  className="text-slate-800"
                  strokeWidth="3.5"
                  stroke="currentColor"
                  fill="none"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
                <path
                  className="text-emerald-400"
                  strokeDasharray="78, 100"
                  strokeWidth="3.5"
                  strokeLinecap="round"
                  stroke="currentColor"
                  fill="none"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
              </svg>
              <span className="absolute text-[11px] font-black text-white">78%</span>
            </div>
            <span className="text-[10px] text-slate-400 font-medium mt-1">Readiness</span>
          </div>

          {/* Stat 2: Level 5 */}
          <div className="flex flex-col items-center justify-center p-2 rounded-2xl bg-[#090e1b]/80 border border-slate-800/60">
            <div className="h-10 w-10 rounded-xl bg-indigo-950/40 border border-indigo-800/40 flex items-center justify-center text-indigo-400 font-black text-sm">
              L5
            </div>
            <span className="text-[10px] text-slate-400 font-medium mt-1">Level 5</span>
          </div>

          {/* Stat 3: 12 Day Streak */}
          <div className="flex flex-col items-center justify-center p-2 rounded-2xl bg-[#090e1b]/80 border border-slate-800/60">
            <div className="h-10 w-10 rounded-xl bg-orange-950/40 border border-orange-800/40 flex items-center justify-center text-orange-400 font-black text-sm">
              <Flame className="h-5 w-5 fill-orange-400 text-orange-400" />
            </div>
            <span className="text-[10px] text-slate-400 font-medium mt-1">12 Streak</span>
          </div>

          {/* Stat 4: 320 Problems */}
          <div className="flex flex-col items-center justify-center p-2 rounded-2xl bg-[#090e1b]/80 border border-slate-800/60">
            <div className="h-10 w-10 rounded-xl bg-sky-950/40 border border-sky-800/40 flex items-center justify-center text-sky-400 font-black text-sm">
              320
            </div>
            <span className="text-[10px] text-slate-400 font-medium mt-1">Problems</span>
          </div>
        </div>
      </div>

      {/* Today's Quest Section matching Screen 3 */}
      <div className="bg-[#0b101e] border border-slate-800/80 rounded-3xl p-5 shadow-lg space-y-3.5">
        <div className="flex items-center justify-between pb-1 border-b border-slate-800/60">
          <h2 className="text-sm font-extrabold text-white tracking-tight flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-amber-400" />
            Today's Quest
          </h2>
          <button
            onClick={() => onNavigate('arena')}
            className="text-[11px] font-bold text-sky-400 hover:text-sky-300 transition flex items-center gap-1"
          >
            <span>See All</span>
            <ChevronRight className="h-3 w-3" />
          </button>
        </div>

        <div className="space-y-2.5">
          {quests.map((q) => (
            <div
              key={q.id}
              className="flex items-center justify-between p-3 rounded-2xl bg-[#0e1424] border border-slate-800/60 hover:border-slate-700 transition"
            >
              <div className="flex items-center gap-3 min-w-0">
                <button
                  onClick={() => toggleQuest(q.id)}
                  className={`h-5 w-5 rounded-full flex items-center justify-center border transition shrink-0 ${
                    q.completed
                      ? 'bg-emerald-500/20 border-emerald-500 text-emerald-400'
                      : 'border-slate-700 bg-slate-900 text-transparent hover:border-slate-500'
                  }`}
                >
                  <CheckCircle2 className="h-3.5 w-3.5" />
                </button>
                <span
                  onClick={() => onNavigate(q.tab)}
                  className={`text-xs font-semibold cursor-pointer truncate transition ${
                    q.completed ? 'text-slate-400 line-through' : 'text-slate-200 hover:text-sky-300'
                  }`}
                >
                  {q.title}
                </span>
              </div>
              <span className="text-[10px] font-bold font-mono px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-300 border border-amber-500/20 shrink-0 ml-2">
                {q.xp}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Quick Categories 4 Tiles matching Screen 3 (DSA, SQL, MCQ, AI Interview) */}
      <div className="grid grid-cols-4 gap-2.5">
        {[
          { id: 'arena' as ActiveTabType, label: 'DSA', icon: Code2, color: 'from-blue-600 to-indigo-600' },
          { id: 'sql' as ActiveTabType, label: 'SQL', icon: Database, color: 'from-cyan-600 to-blue-600' },
          { id: 'mcqs' as ActiveTabType, label: 'MCQ', icon: Layers, color: 'from-purple-600 to-indigo-600' },
          { id: 'interview' as ActiveTabType, label: 'AI Interview', icon: Bot, color: 'from-emerald-600 to-teal-600' },
        ].map((item) => {
          const Icon = item.icon;
          return (
            <button
              key={item.label}
              onClick={() => onNavigate(item.id)}
              className="flex flex-col items-center justify-center p-3 rounded-2xl bg-[#0b101e] hover:bg-[#0e1526] border border-slate-800/80 hover:border-indigo-500/50 transition shadow-md group active:scale-[0.98]"
            >
              <div className={`h-11 w-11 rounded-2xl bg-gradient-to-tr ${item.color} p-0.5 flex items-center justify-center shadow-md mb-2 group-hover:scale-105 transition-transform`}>
                <div className="h-full w-full bg-[#0a0f1d]/85 rounded-[14px] flex items-center justify-center text-white">
                  <Icon className="h-5 w-5" />
                </div>
              </div>
              <span className="text-xs font-bold text-slate-200 group-hover:text-white truncate">
                {item.label}
              </span>
            </button>
          );
        })}
      </div>

      {/* Continue Learning Row matching Screen 3 */}
      <div className="bg-[#0b101e] border border-slate-800/80 rounded-3xl p-5 shadow-lg space-y-3.5">
        <div className="flex items-center justify-between pb-1 border-b border-slate-800/60">
          <h2 className="text-sm font-extrabold text-white tracking-tight flex items-center gap-2">
            <BookOpen className="h-4 w-4 text-sky-400" />
            Continue Learning
          </h2>
          <button
            onClick={() => onNavigate('practice')}
            className="text-[11px] font-bold text-sky-400 hover:text-sky-300 transition flex items-center gap-1"
          >
            <span>See All</span>
            <ChevronRight className="h-3 w-3" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {[
            { title: 'Data Structures', progress: 56, tab: 'arena' as ActiveTabType, color: 'from-sky-500 to-indigo-500' },
            { title: 'SQL', progress: 72, tab: 'sql' as ActiveTabType, color: 'from-cyan-500 to-blue-500' },
            { title: 'Python', progress: 45, tab: 'arena' as ActiveTabType, color: 'from-emerald-500 to-teal-500' },
          ].map((item) => (
            <div
              key={item.title}
              onClick={() => onNavigate(item.tab)}
              className="p-3.5 rounded-2xl bg-[#0e1424] border border-slate-800/60 hover:border-slate-700 cursor-pointer transition group"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-slate-200 group-hover:text-white">
                  {item.title}
                </span>
                <span className="text-[10px] font-bold text-slate-400 font-mono">{item.progress}%</span>
              </div>
              <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
                <div
                  className={`h-full rounded-full bg-gradient-to-r ${item.color}`}
                  style={{ width: `${item.progress}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Upcoming Assessments preview */}
      <div className="p-4 rounded-2xl bg-gradient-to-br from-[#0c1324] to-[#090e1a] border border-slate-800/80 flex items-center justify-between">
        <div className="space-y-0.5">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-white">TCS NQT Mock Test</span>
            <span className="text-[9px] px-1.5 py-0.2 rounded bg-indigo-500/20 text-indigo-300 font-semibold">
              Live Jan 15
            </span>
          </div>
          <div className="text-[11px] text-slate-400">90 mins • 70 questions</div>
        </div>

        <button
          onClick={() => setRegisteredAssessment(!registeredAssessment)}
          className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition shadow-sm ${
            registeredAssessment
              ? 'bg-emerald-600/30 text-emerald-300 border border-emerald-500/40'
              : 'bg-blue-600 hover:bg-blue-500 text-white shadow-blue-600/30'
          }`}
        >
          {registeredAssessment ? 'Registered ✓' : 'Register'}
        </button>
      </div>
    </div>
  );
};
