import React, { useState, useEffect, useMemo } from 'react';
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
import { getUserActivityStats, calculateProgressPercentages } from '../../services/activityTracker';

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
  const [stats, setStats] = useState(() => getUserActivityStats());

  useEffect(() => {
    const handleUpdate = () => {
      setStats(getUserActivityStats());
    };
    window.addEventListener('cq_activity_updated', handleUpdate);
    return () => window.removeEventListener('cq_activity_updated', handleUpdate);
  }, []);

  const percentages = useMemo(() => calculateProgressPercentages(stats), [stats]);

  const [quests, setQuests] = useState([
    { id: 1, title: 'Execute 1 SQL Query in Lab', xp: '+20 XP', completed: stats.sqlQueriesCount > 0, tab: 'sql' as ActiveTabType },
    { id: 2, title: 'Solve 1 Coding Arena Problem', xp: '+30 XP', completed: stats.arenaSolvedCount > 0, tab: 'arena' as ActiveTabType },
    { id: 3, title: 'Answer CS Fundamentals MCQ', xp: '+15 XP', completed: stats.mcqsAnsweredCount > 0, tab: 'mcqs' as ActiveTabType },
    { id: 4, title: 'Solve 1 Logic Brainteaser', xp: '+25 XP', completed: stats.puzzlesSolvedCount > 0, tab: 'puzzles' as ActiveTabType },
  ]);

  const toggleQuest = (id: number) => {
    setQuests(prev => prev.map(q => q.id === id ? { ...q, completed: !q.completed } : q));
  };

  return (
    <div className="space-y-5 max-w-5xl mx-auto pb-6 font-['Plus_Jakarta_Sans'] text-slate-100">
      {/* Target Role & Readiness Hero Card */}
      <div className="bg-gradient-to-br from-[#0c1326] via-[#0b1020] to-[#080d1a] border border-slate-800/90 rounded-3xl p-5 shadow-xl relative overflow-hidden">
        {/* Glow backdrop */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800/60 relative z-10">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-2xl bg-gradient-to-tr from-sky-500 to-indigo-600 flex items-center justify-center text-white font-extrabold text-sm shadow-md">
              {userName ? userName.substring(0, 2).toUpperCase() : 'ST'}
            </div>
            <div>
              <div className="text-xs text-slate-400 font-medium">Target Role</div>
              <div className="text-base font-black text-white flex items-center gap-2">
                <span>{targetRole || 'Full Stack Developer'}</span>
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

        {/* Readiness and Real Live Stats Row: Starts at 0% and tracks user activity */}
        <div className="grid grid-cols-4 gap-2 pt-4 relative z-10">
          {/* Stat 1: Real Dynamic Readiness % */}
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
                  className={percentages.overallReadiness >= 70 ? 'text-emerald-400' : percentages.overallReadiness >= 30 ? 'text-sky-400' : 'text-blue-500'}
                  strokeDasharray={`${percentages.overallReadiness}, 100`}
                  strokeWidth="3.5"
                  strokeLinecap="round"
                  stroke="currentColor"
                  fill="none"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
              </svg>
              <span className="absolute text-[11px] font-black text-white">{percentages.overallReadiness}%</span>
            </div>
            <span className="text-[10px] text-slate-400 font-medium mt-1">Readiness</span>
          </div>

          {/* Stat 2: Real Level */}
          <div className="flex flex-col items-center justify-center p-2 rounded-2xl bg-[#090e1b]/80 border border-slate-800/60">
            <div className="h-10 w-10 rounded-xl bg-indigo-950/40 border border-indigo-800/40 flex items-center justify-center text-indigo-400 font-black text-sm">
              L{percentages.level}
            </div>
            <span className="text-[10px] text-slate-400 font-medium mt-1">Level {percentages.level}</span>
          </div>

          {/* Stat 3: Real Streak */}
          <div className="flex flex-col items-center justify-center p-2 rounded-2xl bg-[#090e1b]/80 border border-slate-800/60">
            <div className="h-10 w-10 rounded-xl bg-orange-950/40 border border-orange-800/40 flex items-center justify-center text-orange-400 font-black text-sm">
              <Flame className="h-5 w-5 fill-orange-400 text-orange-400" />
            </div>
            <span className="text-[10px] text-slate-400 font-medium mt-1">{stats.streak} Streak</span>
          </div>

          {/* Stat 4: Real Total Solved Problems */}
          <div className="flex flex-col items-center justify-center p-2 rounded-2xl bg-[#090e1b]/80 border border-slate-800/60">
            <div className="h-10 w-10 rounded-xl bg-sky-950/40 border border-sky-800/40 flex items-center justify-center text-sky-400 font-black text-sm font-mono">
              {percentages.totalSolved}
            </div>
            <span className="text-[10px] text-slate-400 font-medium mt-1">Solved</span>
          </div>
        </div>
      </div>

      {/* Today's Quest Section */}
      <div className="bg-[#0b101e] border border-slate-800/80 rounded-3xl p-5 shadow-lg space-y-3.5">
        <div className="flex items-center justify-between pb-1 border-b border-slate-800/60">
          <h2 className="text-sm font-extrabold text-white tracking-tight flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-amber-400" />
            Today's Quests & Progress
          </h2>
          <button
            onClick={() => onNavigate('arena')}
            className="text-[11px] font-bold text-sky-400 hover:text-sky-300 transition flex items-center gap-1"
          >
            <span>See Arena</span>
            <ChevronRight className="h-3 w-3" />
          </button>
        </div>

        <div className="space-y-2.5">
          {quests.map((q) => (
            <div
              key={q.id}
              className="p-3 rounded-2xl bg-[#0e1424] border border-slate-800/60 flex items-center justify-between transition hover:border-slate-700"
            >
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => toggleQuest(q.id)}
                  className={`h-5 w-5 rounded-md border flex items-center justify-center transition ${
                    q.completed
                      ? 'bg-emerald-500 border-emerald-400 text-white'
                      : 'border-slate-700 hover:border-slate-500'
                  }`}
                >
                  {q.completed && <CheckCircle2 className="h-3.5 w-3.5" />}
                </button>
                <span className={`text-xs font-semibold ${q.completed ? 'line-through text-slate-500' : 'text-slate-200'}`}>
                  {q.title}
                </span>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold font-mono px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-300 border border-amber-500/20">
                  {q.xp}
                </span>
                <button
                  onClick={() => onNavigate(q.tab)}
                  className="px-2.5 py-1 rounded-lg bg-blue-600/30 hover:bg-blue-600 text-sky-300 hover:text-white text-[11px] font-bold transition flex items-center gap-1"
                >
                  <span>Start</span>
                  <Play className="h-2.5 w-2.5 fill-current" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Continue Learning Row: Real activity percentages starting at 0% */}
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
            <span>Practice Hub</span>
            <ChevronRight className="h-3 w-3" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {[
            { title: 'Coding Arena', progress: percentages.arenaPct, tab: 'arena' as ActiveTabType, color: 'from-sky-500 to-indigo-500', sub: `${stats.arenaSolvedCount} solved` },
            { title: 'SQL Lab', progress: percentages.sqlPct, tab: 'sql' as ActiveTabType, color: 'from-cyan-500 to-blue-500', sub: `${stats.sqlQueriesCount} queries` },
            { title: 'CS Fundamentals', progress: percentages.mcqPct, tab: 'mcqs' as ActiveTabType, color: 'from-emerald-500 to-teal-500', sub: `${stats.mcqsAnsweredCount} topics` },
          ].map((item) => (
            <div
              key={item.title}
              onClick={() => onNavigate(item.tab)}
              className="p-3.5 rounded-2xl bg-[#0e1424] border border-slate-800/60 hover:border-slate-700 cursor-pointer transition group"
            >
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-bold text-slate-200 group-hover:text-white">
                  {item.title}
                </span>
                <span className="text-[10px] font-bold text-slate-400 font-mono">{item.progress}%</span>
              </div>
              <div className="text-[10px] text-slate-500 mb-2 font-mono">{item.sub}</div>
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
            <span className="text-xs font-bold text-white">TCS NQT Placement Simulation</span>
            <span className="text-[9px] px-1.5 py-0.2 rounded bg-indigo-500/20 text-indigo-300 font-semibold">
              Available Now
            </span>
          </div>
          <div className="text-[11px] text-slate-400">90 mins • Coding + SQL + Aptitude</div>
        </div>

        <button
          onClick={() => onNavigate('assessments')}
          className="px-3.5 py-1.5 rounded-xl text-xs font-bold transition shadow-sm bg-blue-600 hover:bg-blue-500 text-white shadow-blue-600/30"
        >
          Take Assessment ➔
        </button>
      </div>
    </div>
  );
};
