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
  Shuffle,
  ShieldCheck,
  Zap,
  Terminal,
  Activity
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
  const [stats, setStats] = useState(() => getUserActivityStats());
  const [avatar, setAvatar] = useState<string>(() => localStorage.getItem('cq_user_avatar') || '');
  const [college, setCollege] = useState<string>(() => localStorage.getItem('cq_user_college') || '');
  const [degree, setDegree] = useState<string>(() => localStorage.getItem('cq_user_degree') || '');

  useEffect(() => {
    const handleUpdate = () => {
      setStats(getUserActivityStats());
    };
    const handleProfileSync = () => {
      setAvatar(localStorage.getItem('cq_user_avatar') || '');
      setCollege(localStorage.getItem('cq_user_college') || '');
      setDegree(localStorage.getItem('cq_user_degree') || '');
    };
    window.addEventListener('cq_activity_updated', handleUpdate);
    window.addEventListener('cq_profile_updated', handleProfileSync);
    return () => {
      window.removeEventListener('cq_activity_updated', handleUpdate);
      window.removeEventListener('cq_profile_updated', handleProfileSync);
    };
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
    <div className="space-y-6 max-w-5xl mx-auto pb-10 font-['Plus_Jakarta_Sans'] text-slate-100">
      {/* Target Role & Readiness Cyber Hero Card */}
      <div className="relative rounded-3xl bg-gradient-to-br from-[#0B0F1C] via-[#080D18] to-[#050811] border border-cyan-500/25 p-6 shadow-[0_0_40px_rgba(0,229,255,0.07)] overflow-hidden">
        {/* Futuristic Laser Glows */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/3 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute inset-x-0 top-0 h-[1px] bg-gradient-to-r from-transparent via-cyan-400 to-transparent opacity-60" />

        {/* Top Header Row */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-cyan-500/15 relative z-10">
          <div className="flex items-center gap-3.5">
            <div className="relative">
              <div 
                onClick={() => onNavigate('profile')}
                className="h-12 w-12 rounded-2xl bg-gradient-to-br from-[#091024] to-[#040711] border border-cyan-400/40 flex items-center justify-center text-cyan-300 font-extrabold text-base shadow-[0_0_15px_rgba(0,229,255,0.25)] overflow-hidden cursor-pointer hover:border-cyan-300 transition"
                title="View Profile"
              >
                {avatar ? (
                  <img src={avatar} alt={userName} className="h-full w-full object-cover" />
                ) : (
                  userName ? userName.substring(0, 2).toUpperCase() : 'ST'
                )}
              </div>
              <span className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full bg-emerald-400 ring-2 ring-[#0B0F1C] shadow-[0_0_8px_rgba(16,185,129,0.8)]" />
            </div>

            <div>
              <div className="text-[11px] font-mono tracking-wider uppercase text-cyan-400/80 flex items-center gap-1.5">
                <Terminal className="h-3 w-3 text-cyan-400" />
                <span>TARGET SPECIALIZATION</span>
                {college && (
                  <span className="text-slate-400 font-sans normal-case">
                    • {degree ? `${degree}, ` : ''}{college}
                  </span>
                )}
              </div>
              <div className="text-lg font-black text-white flex items-center gap-2.5">
                <span className="tracking-tight">{targetRole || 'Data Engineer'}</span>
                <button
                  onClick={() => onNavigate('settings')}
                  className="text-[10px] font-bold text-cyan-300 hover:text-white px-2.5 py-0.5 rounded-full bg-cyan-500/15 border border-cyan-400/30 hover:border-cyan-300 transition flex items-center gap-1 shadow-[0_0_10px_rgba(0,229,255,0.15)]"
                >
                  <Shuffle className="h-2.5 w-2.5" />
                  <span>Switch</span>
                </button>
              </div>
            </div>
          </div>

          {/* Active Track Badge */}
          <div className="flex items-center gap-2 text-xs font-semibold text-emerald-300 bg-emerald-950/40 border border-emerald-500/30 px-3.5 py-1.5 rounded-full shadow-[0_0_12px_rgba(16,185,129,0.2)]">
            <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_8px_rgba(16,185,129,1)]" />
            <span className="font-mono tracking-wider text-[11px]">ACTIVE // PLACEMENT TRACK</span>
          </div>
        </div>

        {/* 4 Cyber Stat Modules */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 pt-5 relative z-10">
          {/* Stat 1: Dynamic Readiness Gauge */}
          <div className="flex flex-col items-center justify-center p-3 rounded-2xl bg-[#070C18]/90 border border-cyan-500/20 hover:border-cyan-400/40 transition duration-300 shadow-[inset_0_0_15px_rgba(0,229,255,0.03)]">
            <div className="relative w-14 h-14 flex items-center justify-center">
              <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                <path
                  className="text-slate-800/90"
                  strokeWidth="3.2"
                  stroke="currentColor"
                  fill="none"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
                <path
                  className={percentages.overallReadiness >= 70 ? 'text-emerald-400' : percentages.overallReadiness >= 30 ? 'text-cyan-400' : 'text-sky-400'}
                  strokeDasharray={`${percentages.overallReadiness}, 100`}
                  strokeWidth="3.5"
                  strokeLinecap="round"
                  stroke="currentColor"
                  fill="none"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  style={{ filter: 'drop-shadow(0 0 6px rgba(0, 229, 255, 0.6))' }}
                />
              </svg>
              <span className="absolute text-xs font-black text-white font-mono">{percentages.overallReadiness}%</span>
            </div>
            <span className="text-[10px] text-cyan-300/80 font-mono tracking-wider uppercase mt-1.5">Readiness</span>
          </div>

          {/* Stat 2: Cyber Level */}
          <div className="flex flex-col items-center justify-center p-3 rounded-2xl bg-[#070C18]/90 border border-indigo-500/20 hover:border-indigo-400/40 transition duration-300 shadow-[inset_0_0_15px_rgba(99,102,241,0.03)]">
            <div className="h-11 w-11 rounded-xl bg-indigo-950/40 border border-indigo-500/40 flex items-center justify-center text-indigo-300 font-black text-sm shadow-[0_0_12px_rgba(99,102,241,0.25)] font-mono">
              L{percentages.level}
            </div>
            <span className="text-[10px] text-indigo-300/80 font-mono tracking-wider uppercase mt-1.5">Level {percentages.level}</span>
          </div>

          {/* Stat 3: Laser Streak */}
          <div className="flex flex-col items-center justify-center p-3 rounded-2xl bg-[#070C18]/90 border border-amber-500/20 hover:border-amber-400/40 transition duration-300 shadow-[inset_0_0_15px_rgba(245,158,11,0.03)]">
            <div className="h-11 w-11 rounded-xl bg-amber-950/40 border border-amber-500/40 flex items-center justify-center text-amber-300 font-black text-sm shadow-[0_0_12px_rgba(245,158,11,0.25)]">
              <Flame className="h-5 w-5 fill-amber-400 text-amber-400 drop-shadow-[0_0_6px_rgba(245,158,11,0.8)]" />
            </div>
            <span className="text-[10px] text-amber-300/80 font-mono tracking-wider uppercase mt-1.5">{stats.streak} Streak</span>
          </div>

          {/* Stat 4: Solved Counter */}
          <div className="flex flex-col items-center justify-center p-3 rounded-2xl bg-[#070C18]/90 border border-emerald-500/20 hover:border-emerald-400/40 transition duration-300 shadow-[inset_0_0_15px_rgba(16,185,129,0.03)]">
            <div className="h-11 w-11 rounded-xl bg-emerald-950/40 border border-emerald-500/40 flex items-center justify-center text-emerald-300 font-black text-sm font-mono shadow-[0_0_12px_rgba(16,185,129,0.25)]">
              {percentages.totalSolved}
            </div>
            <span className="text-[10px] text-emerald-300/80 font-mono tracking-wider uppercase mt-1.5">Solved</span>
          </div>
        </div>
      </div>

      {/* Today's Quests & Tactical Missions */}
      <div className="bg-[#080D1A] border border-cyan-500/20 rounded-3xl p-5 shadow-[0_0_25px_rgba(0,229,255,0.04)] space-y-4">
        <div className="flex items-center justify-between pb-2 border-b border-slate-800/80">
          <h2 className="text-sm font-extrabold text-white tracking-tight flex items-center gap-2">
            <Zap className="h-4 w-4 text-cyan-400 fill-cyan-400/30" />
            <span>DAILY OBJECTIVES & QUESTS</span>
          </h2>
          <button
            onClick={() => onNavigate('arena')}
            className="text-[11px] font-bold text-cyan-400 hover:text-cyan-300 transition flex items-center gap-1 font-mono tracking-wide"
          >
            <span>ARENA MATRIX</span>
            <ChevronRight className="h-3 w-3" />
          </button>
        </div>

        <div className="space-y-2.5">
          {quests.map((q) => (
            <div
              key={q.id}
              className="p-3.5 rounded-2xl bg-[#0A1020] border border-slate-800/80 hover:border-cyan-500/40 flex items-center justify-between transition-all duration-300 group"
            >
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => toggleQuest(q.id)}
                  className={`h-5 w-5 rounded-md border flex items-center justify-center transition duration-200 ${
                    q.completed
                      ? 'bg-emerald-500 border-emerald-400 text-white shadow-[0_0_8px_rgba(16,185,129,0.8)]'
                      : 'border-slate-700 hover:border-cyan-400 bg-slate-900/60'
                  }`}
                >
                  {q.completed && <CheckCircle2 className="h-3.5 w-3.5" />}
                </button>
                <span className={`text-xs font-semibold tracking-wide ${q.completed ? 'line-through text-slate-500' : 'text-slate-200 group-hover:text-cyan-200'}`}>
                  {q.title}
                </span>
              </div>

              <div className="flex items-center gap-2.5">
                <span className="text-[10px] font-bold font-mono px-2.5 py-0.5 rounded-full bg-amber-500/10 text-amber-300 border border-amber-500/30 shadow-[0_0_8px_rgba(245,158,11,0.15)]">
                  {q.xp}
                </span>
                <button
                  onClick={() => onNavigate(q.tab)}
                  className="px-3 py-1 rounded-lg bg-cyan-500/10 hover:bg-cyan-500/25 text-cyan-300 hover:text-white border border-cyan-400/30 text-[11px] font-bold font-mono transition flex items-center gap-1 shadow-[0_0_10px_rgba(0,229,255,0.15)] active:scale-95"
                >
                  <span>LAUNCH</span>
                  <Play className="h-2.5 w-2.5 fill-current" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Continue Learning Row: Real activity percentages */}
      <div className="bg-[#080D1A] border border-cyan-500/20 rounded-3xl p-5 shadow-[0_0_25px_rgba(0,229,255,0.04)] space-y-4">
        <div className="flex items-center justify-between pb-2 border-b border-slate-800/80">
          <h2 className="text-sm font-extrabold text-white tracking-tight flex items-center gap-2">
            <BookOpen className="h-4 w-4 text-cyan-400" />
            <span>CONTINUE TRAINING</span>
          </h2>
          <button
            onClick={() => onNavigate('practice')}
            className="text-[11px] font-bold text-cyan-400 hover:text-cyan-300 transition flex items-center gap-1 font-mono tracking-wide"
          >
            <span>PRACTICE HUB</span>
            <ChevronRight className="h-3 w-3" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
          {[
            { title: 'Coding Arena', progress: percentages.arenaPct, tab: 'arena' as ActiveTabType, color: 'from-cyan-400 to-indigo-500', glow: 'shadow-[0_0_12px_rgba(0,229,255,0.4)]', sub: `${stats.arenaSolvedCount} solved` },
            { title: 'SQL Lab', progress: percentages.sqlPct, tab: 'sql' as ActiveTabType, color: 'from-cyan-400 to-emerald-400', glow: 'shadow-[0_0_12px_rgba(52,211,153,0.4)]', sub: `${stats.sqlQueriesCount} queries` },
            { title: 'CS Fundamentals', progress: percentages.mcqPct, tab: 'mcqs' as ActiveTabType, color: 'from-indigo-400 to-cyan-400', glow: 'shadow-[0_0_12px_rgba(99,102,241,0.4)]', sub: `${stats.mcqsAnsweredCount} topics` },
          ].map((item) => (
            <div
              key={item.title}
              onClick={() => onNavigate(item.tab)}
              className="p-4 rounded-2xl bg-[#0A1020] border border-slate-800/80 hover:border-cyan-500/40 cursor-pointer transition-all duration-300 group shadow-sm hover:shadow-[0_0_15px_rgba(0,229,255,0.08)]"
            >
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-xs font-bold text-slate-200 group-hover:text-cyan-300 transition">
                  {item.title}
                </span>
                <span className="text-[11px] font-bold text-cyan-400 font-mono">{item.progress}%</span>
              </div>
              <div className="text-[10px] text-slate-400 mb-3 font-mono">{item.sub}</div>
              <div className="w-full bg-[#060A14] rounded-full h-1.5 overflow-hidden p-[1px] border border-slate-800/60">
                <div
                  className={`h-full rounded-full bg-gradient-to-r ${item.color} ${item.glow}`}
                  style={{ width: `${Math.max(item.progress, 3)}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Upcoming Placement Simulation Transmission Card */}
      <div className="p-5 rounded-2xl bg-gradient-to-r from-[#091022] via-[#0A1329] to-[#070D1C] border border-cyan-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-[0_0_30px_rgba(0,229,255,0.08)]">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-xs font-black text-white tracking-wide">TCS NQT PLACEMENT SIMULATION</span>
            <span className="text-[9px] font-mono px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 font-bold border border-cyan-400/30 shadow-[0_0_8px_rgba(0,229,255,0.25)]">
              AVAILABLE NOW
            </span>
          </div>
          <div className="text-[11px] text-slate-300 font-mono">90 mins • Coding Arena + SQL Lab + Aptitude CS Core</div>
        </div>

        <button
          onClick={() => onNavigate('assessments')}
          className="px-4 py-2 rounded-xl text-xs font-bold font-mono transition bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-black font-extrabold shadow-[0_0_18px_rgba(0,229,255,0.4)] active:scale-95 shrink-0"
        >
          COMMENCE SIMULATION ➔
        </button>
      </div>
    </div>
  );
};
