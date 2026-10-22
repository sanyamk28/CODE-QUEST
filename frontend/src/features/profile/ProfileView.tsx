import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  User,
  Flame,
  Award,
  Sparkles,
  Code2,
  Database,
  Swords,
  Bot,
  Plus,
  CheckCircle2,
  TrendingUp,
  MapPin,
  GraduationCap,
  Edit2,
  Check,
  X,
  Briefcase,
  Zap,
  Shield,
  Trophy,
  Share2,
  Download,
  ShieldCheck,
  ExternalLink,
  Target
} from 'lucide-react';

import { ActiveTabType } from '../../types';
import { getUserActivityStats, calculateProgressPercentages } from '../../services/activityTracker';
import { showToast } from '../../components/Toast';

interface ProfileViewProps {
  userName: string;
  targetRole: string;
  streak: number;
  onUpdateRole?: (role: string) => void;
}

export const ProfileView: React.FC<ProfileViewProps> = ({
  userName,
  targetRole,
  streak,
  onUpdateRole,
}) => {
  const [stats, setStats] = useState(() => getUserActivityStats());

  useEffect(() => {
    const handleUpdate = () => {
      setStats(getUserActivityStats());
    };
    window.addEventListener('cq_activity_updated', handleUpdate);
    return () => window.removeEventListener('cq_activity_updated', handleUpdate);
  }, []);

  const percentages = useMemo(() => calculateProgressPercentages(stats), [stats]);

  const [skills, setSkills] = useState([
    'Python', 'SQL', 'Algorithms', 'System Design', 'Two Pointers', 'Dynamic Programming'
  ]);
  const [newSkill, setNewSkill] = useState('');
  const [isAddingSkill, setIsAddingSkill] = useState(false);
  const [isEditingRole, setIsEditingRole] = useState(false);
  const [customRoleInput, setCustomRoleInput] = useState(targetRole || 'Data Engineer');
  const [selectedBadge, setSelectedBadge] = useState<string | null>(null);
  const [showShareModal, setShowShareModal] = useState(false);

  // Solved problems count from localStorage
  const solvedCount = useMemo(() => {
    try {
      const saved = localStorage.getItem('cq_solved_problems');
      return saved ? JSON.parse(saved).length : Math.max(stats.arenaSolvedCount, 1);
    } catch {
      return Math.max(stats.arenaSolvedCount, 1);
    }
  }, [stats.arenaSolvedCount]);

  const achievements = [
    { name: 'Master Coder', icon: '⚡', desc: 'Solved over 400+ algorithmic coding problems', color: 'from-amber-400 to-orange-500' },
    { name: 'SQL Guru', icon: '💎', desc: 'Mastered multi-table analytical window queries', color: 'from-cyan-400 to-blue-500' },
    { name: 'Streak Legend', icon: '🔥', desc: 'Kept a continuous problem-solving streak with Shield', color: 'from-rose-500 to-amber-500' },
    { name: 'AI Champion', icon: '🤖', desc: 'Completed technical recruiter mock interviews', color: 'from-emerald-400 to-teal-500' },
    { name: 'Battle King', icon: '⚔️', desc: 'Competed in live 1v1 speed battles', color: 'from-purple-500 to-indigo-500' },
  ];

  // Mathematical coordinates for 6-axis Skill Radar
  const radarMetrics = useMemo(() => [
    { label: 'Algorithms', score: Math.min(95, 65 + solvedCount * 2) },
    { label: 'Data Structures', score: Math.min(98, 70 + solvedCount * 2) },
    { label: 'SQL & Data', score: Math.min(92, 60 + stats.sqlQueriesCount * 3) },
    { label: 'Speed & Duel', score: Math.min(90, 55 + stats.battlesWonCount * 4) },
    { label: 'Consistency', score: Math.min(100, 70 + Math.min(streak, 14) * 2) },
    { label: 'Mock Rounds', score: Math.min(94, 60 + (stats.totalXp > 50 ? 25 : 0)) }
  ], [solvedCount, stats.sqlQueriesCount, stats.battlesWonCount, stats.totalXp, streak]);

  const radarPolygonPoints = useMemo(() => {
    const cx = 110;
    const cy = 110;
    const r = 70;
    return radarMetrics.map((m, i) => {
      const angle = (Math.PI * 2 / 6) * i - Math.PI / 2;
      const dist = (m.score / 100) * r;
      const x = cx + dist * Math.cos(angle);
      const y = cy + dist * Math.sin(angle);
      return `${x.toFixed(1)},${y.toFixed(1)}`;
    }).join(' ');
  }, [radarMetrics]);

  const handleAddSkill = () => {
    if (newSkill.trim() && !skills.includes(newSkill.trim())) {
      setSkills(prev => [...prev, newSkill.trim()]);
      setNewSkill('');
      setIsAddingSkill(false);
    }
  };

  const handleRemoveSkill = (skillToRemove: string) => {
    setSkills(prev => prev.filter(s => s !== skillToRemove));
  };

  const handleSaveRole = () => {
    if (customRoleInput.trim()) {
      onUpdateRole?.(customRoleInput.trim());
      setIsEditingRole(false);
    }
  };

  const handleCopyShareLink = useCallback(() => {
    try {
      navigator.clipboard.writeText(window.location.origin);
      showToast('Achievement card link copied to clipboard!', 'success');
    } catch {
      showToast('Sharing link ready!', 'info');
    }
  }, []);

  return (
    <div className="space-y-5 max-w-2xl mx-auto pb-6">
      {/* User Header Profile Card */}
      <div className="bg-[#0b101e] border border-slate-800/80 rounded-3xl p-5 shadow-xl flex items-center justify-between">
        <div className="flex items-center gap-3.5">
          <div className="relative">
            <div className="h-16 w-16 rounded-2xl bg-gradient-to-tr from-sky-400 via-indigo-500 to-purple-600 flex items-center justify-center font-black text-xl text-white shadow-lg shadow-indigo-500/20">
              {userName ? userName.substring(0, 2).toUpperCase() : 'SK'}
            </div>
            <span className="absolute -bottom-1 -right-1 h-4 w-4 rounded-full bg-emerald-500 ring-4 ring-[#0b101e]" />
          </div>

          <div className="space-y-0.5">
            <div className="flex items-center gap-2">
              <h1 className="text-base font-black text-white">{userName || 'Sanyam Kumar'}</h1>
              <span className="text-[10px] font-bold px-2 py-0.2 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                Verified Coder
              </span>
            </div>
            <p className="text-[11px] text-slate-400 font-medium">MCA Student • JIMS Rohini</p>
            <div className="text-xs font-bold text-sky-400 flex items-center gap-1.5 pt-0.5">
              <span>{targetRole || 'Data Engineer'}</span>
              <button
                onClick={() => setIsEditingRole(!isEditingRole)}
                className="text-slate-500 hover:text-white transition"
                title="Edit Target Role"
              >
                <Edit2 className="h-3 w-3" />
              </button>
            </div>
          </div>
        </div>

        {/* Circular Readiness Gauge & Share Card Trigger */}
        <div className="flex items-center gap-3">
          <div className="relative w-14 h-14 flex items-center justify-center shrink-0">
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
            <span className="absolute text-xs font-black text-white">{percentages.overallReadiness}%</span>
          </div>

          <button
            onClick={() => setShowShareModal(true)}
            className="p-2.5 rounded-2xl bg-indigo-600/20 hover:bg-indigo-600/40 border border-indigo-500/40 text-indigo-300 hover:text-white transition shadow-sm active:scale-95"
            title="Share Portfolio Achievement Card"
          >
            <Share2 className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Inline Role Editing */}
      {isEditingRole && (
        <div className="p-3 bg-[#0e1424] rounded-2xl border border-slate-800 flex items-center gap-2">
          <input
            type="text"
            value={customRoleInput}
            onChange={(e) => setCustomRoleInput(e.target.value)}
            className="flex-1 bg-slate-900 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-white outline-none"
            placeholder="e.g. Data Engineer, AI Engineer..."
          />
          <button
            onClick={handleSaveRole}
            className="px-3 py-1.5 rounded-xl bg-blue-600 text-white font-bold text-xs"
          >
            Save
          </button>
          <button
            onClick={() => setIsEditingRole(false)}
            className="px-3 py-1.5 rounded-xl bg-slate-800 text-slate-400 text-xs"
          >
            Cancel
          </button>
        </div>
      )}

      {/* 6 Stats Grid */}
      <div className="grid grid-cols-3 gap-2.5">
        {[
          { label: 'Streak', val: `${stats.streak} Days`, sub: 'Consistency', icon: Flame, color: 'text-orange-400', bg: 'bg-orange-950/30' },
          { label: 'Solved', val: `${solvedCount}`, sub: 'Company DSA', icon: Code2, color: 'text-sky-400', bg: 'bg-sky-950/30' },
          { label: 'SQL', val: `${stats.sqlQueriesCount}`, sub: 'Queries Run', icon: Database, color: 'text-cyan-400', bg: 'bg-cyan-950/30' },
          { label: 'Battles', val: `${stats.battlesWonCount}`, sub: 'Matches Won', icon: Swords, color: 'text-rose-400', bg: 'bg-rose-950/30' },
          { label: 'Level', val: `L${percentages.level}`, sub: 'Rank Tier', icon: Zap, color: 'text-indigo-400', bg: 'bg-indigo-950/30' },
          { label: 'XP', val: `${stats.totalXp}`, sub: 'Total Points', icon: Award, color: 'text-amber-400', bg: 'bg-amber-950/30' },
        ].map((st, idx) => {
          const Icon = st.icon;
          return (
            <div
              key={idx}
              className="p-3 rounded-2xl bg-[#0b101e] border border-slate-800/80 flex flex-col items-center justify-center text-center shadow-md"
            >
              <div className={`h-8 w-8 rounded-xl ${st.bg} flex items-center justify-center ${st.color} mb-1.5`}>
                <Icon className="h-4 w-4" />
              </div>
              <div className="text-sm font-black text-white font-mono">{st.val}</div>
              <div className="text-[10px] text-slate-400 font-medium">{st.label}</div>
            </div>
          );
        })}
      </div>

      {/* Interactive SVG Skill Radar */}
      <div className="bg-[#0b101e] border border-slate-800/80 rounded-3xl p-5 shadow-xl space-y-3">
        <div className="flex items-center justify-between pb-1 border-b border-slate-800/60">
          <div className="flex items-center gap-2">
            <Target className="h-4 w-4 text-indigo-400" />
            <h3 className="text-xs font-bold text-white uppercase tracking-wider">Skill Mastery Radar</h3>
          </div>
          <span className="text-[10px] text-slate-400 font-mono">6-Dimensional Telemetry</span>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-1">
          {/* Radar Chart */}
          <div className="w-56 h-56 flex items-center justify-center relative">
            <svg viewBox="0 0 220 220" className="w-full h-full overflow-visible">
              {/* Concentric rings */}
              {[0.25, 0.5, 0.75, 1.0].map((scale, idx) => {
                const ringPoints = Array.from({ length: 6 }).map((_, i) => {
                  const angle = (Math.PI * 2 / 6) * i - Math.PI / 2;
                  const x = 110 + 70 * scale * Math.cos(angle);
                  const y = 110 + 70 * scale * Math.sin(angle);
                  return `${x.toFixed(1)},${y.toFixed(1)}`;
                }).join(' ');
                return (
                  <polygon
                    key={idx}
                    points={ringPoints}
                    fill="none"
                    stroke="#1e293b"
                    strokeWidth="1"
                    strokeDasharray={scale === 1 ? 'none' : '3 3'}
                  />
                );
              })}

              {/* Axis lines */}
              {Array.from({ length: 6 }).map((_, i) => {
                const angle = (Math.PI * 2 / 6) * i - Math.PI / 2;
                const x2 = 110 + 70 * Math.cos(angle);
                const y2 = 110 + 70 * Math.sin(angle);
                return (
                  <line
                    key={i}
                    x1="110"
                    y1="110"
                    x2={x2}
                    y2={y2}
                    stroke="#1e293b"
                    strokeWidth="1"
                  />
                );
              })}

              {/* Radar Data Polygon */}
              <polygon
                points={radarPolygonPoints}
                fill="rgba(99, 102, 241, 0.25)"
                stroke="#818cf8"
                strokeWidth="2"
                strokeLinejoin="round"
                className="transition-all duration-700"
              />

              {/* Vertices dots */}
              {radarMetrics.map((m, i) => {
                const angle = (Math.PI * 2 / 6) * i - Math.PI / 2;
                const dist = (m.score / 100) * 70;
                const x = 110 + dist * Math.cos(angle);
                const y = 110 + dist * Math.sin(angle);
                return (
                  <circle
                    key={i}
                    cx={x}
                    cy={y}
                    r="3.5"
                    fill="#38bdf8"
                    stroke="#0b101e"
                    strokeWidth="1.5"
                  />
                );
              })}
            </svg>
          </div>

          {/* Metric Breakdown Badges */}
          <div className="flex-1 space-y-1.5 w-full">
            {radarMetrics.map((m) => (
              <div key={m.label} className="flex items-center justify-between text-xs p-1.5 rounded-xl bg-[#0e1424] border border-slate-800">
                <span className="text-slate-300 font-medium">{m.label}</span>
                <div className="flex items-center gap-2">
                  <div className="w-16 h-1 rounded-full bg-slate-800 overflow-hidden hidden sm:block">
                    <div
                      className="h-full bg-gradient-to-r from-blue-500 to-indigo-400 rounded-full"
                      style={{ width: `${m.score}%` }}
                    />
                  </div>
                  <span className="font-mono font-bold text-sky-400 text-[11px]">{m.score}%</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Verified Skills Section */}
      <div className="bg-[#0b101e] border border-slate-800/80 rounded-3xl p-5 shadow-xl space-y-3">
        <div className="flex items-center justify-between pb-1 border-b border-slate-800/60">
          <h3 className="text-xs font-bold text-white uppercase tracking-wider">Verified Skills</h3>
          <button
            onClick={() => setIsAddingSkill(!isAddingSkill)}
            className="text-[11px] font-bold text-sky-400 hover:text-sky-300"
          >
            + Add Skill
          </button>
        </div>

        {isAddingSkill && (
          <div className="flex items-center gap-2 pb-2">
            <input
              type="text"
              value={newSkill}
              onChange={(e) => setNewSkill(e.target.value)}
              placeholder="e.g. Apache Spark, Docker..."
              className="flex-1 px-3 py-1.5 rounded-xl bg-[#0e1424] border border-slate-700 text-xs text-white outline-none"
            />
            <button
              onClick={handleAddSkill}
              className="px-3 py-1.5 rounded-xl bg-blue-600 text-white font-bold text-xs"
            >
              Add
            </button>
          </div>
        )}

        <div className="flex flex-wrap gap-2">
          {skills.map((skill) => (
            <span
              key={skill}
              className="px-3 py-1 rounded-xl bg-[#0e1424] border border-slate-800 text-xs font-semibold text-sky-300 shadow-sm flex items-center gap-1.5 group"
            >
              <span>{skill}</span>
              <button
                onClick={() => handleRemoveSkill(skill)}
                className="text-slate-600 hover:text-rose-400 text-xs transition"
                title="Remove skill"
              >
                ×
              </button>
            </span>
          ))}
        </div>
      </div>

      {/* Achievements Section */}
      <div className="bg-[#0b101e] border border-slate-800/80 rounded-3xl p-5 shadow-xl space-y-3">
        <h3 className="text-xs font-bold text-white uppercase tracking-wider pb-1 border-b border-slate-800/60">
          Badges & Achievements
        </h3>
        <div className="grid grid-cols-5 gap-2">
          {achievements.map((ach) => (
            <div
              key={ach.name}
              onClick={() => setSelectedBadge(selectedBadge === ach.name ? null : ach.name)}
              className="flex flex-col items-center justify-center p-2.5 rounded-2xl bg-[#0e1424] border border-slate-800 hover:border-indigo-500/50 cursor-pointer text-center transition active:scale-95"
            >
              <div className={`h-10 w-10 rounded-2xl bg-gradient-to-tr ${ach.color} p-0.5 flex items-center justify-center shadow-md mb-1.5`}>
                <div className="h-full w-full bg-[#080d19] rounded-[14px] flex items-center justify-center text-base">
                  {ach.icon}
                </div>
              </div>
              <span className="text-[9px] font-bold text-slate-300 truncate w-full">
                {ach.name}
              </span>
            </div>
          ))}
        </div>

        {selectedBadge && (
          <div className="p-3 rounded-2xl bg-[#070b14] border border-indigo-500/40 text-xs text-slate-300 space-y-1">
            <span className="font-bold text-sky-400 block">
              {achievements.find(a => a.name === selectedBadge)?.name}:
            </span>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              {achievements.find(a => a.name === selectedBadge)?.desc}
            </p>
          </div>
        )}
      </div>

      {/* Shareable Achievement Card Modal */}
      {showShareModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-[#0b101e] border border-indigo-500/50 rounded-3xl p-6 max-w-md w-full shadow-2xl relative space-y-4">
            <button
              onClick={() => setShowShareModal(false)}
              className="absolute top-4 right-4 p-1 rounded-xl text-slate-400 hover:text-white"
            >
              <X className="h-4 w-4" />
            </button>

            <div className="text-center space-y-1">
              <h2 className="text-base font-bold text-white">Share Portfolio Card</h2>
              <p className="text-xs text-slate-400">Share your verified interview prep readiness on LinkedIn or Twitter.</p>
            </div>

            {/* Rendered Preview Card */}
            <div className="p-5 rounded-2xl bg-gradient-to-br from-indigo-950/80 via-[#0a0f1d] to-purple-950/80 border border-indigo-500/40 shadow-inner space-y-4 text-center">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-[11px] font-bold border border-emerald-500/30">
                <ShieldCheck className="h-3.5 w-3.5" />
                <span>CODE QUEST Verified Candidate</span>
              </div>

              <div className="space-y-1">
                <div className="text-lg font-black text-white">{userName || 'Sanyam Kumar'}</div>
                <div className="text-xs text-indigo-300 font-semibold">{targetRole || 'Data Engineer'}</div>
              </div>

              <div className="grid grid-cols-3 gap-2 text-center pt-1">
                <div className="p-2 rounded-xl bg-[#0e1424] border border-slate-800">
                  <div className="text-base font-black text-amber-400 font-mono">{solvedCount}</div>
                  <div className="text-[10px] text-slate-400">Problems Solved</div>
                </div>
                <div className="p-2 rounded-xl bg-[#0e1424] border border-slate-800">
                  <div className="text-base font-black text-sky-400 font-mono">{streak}d</div>
                  <div className="text-[10px] text-slate-400">Daily Streak</div>
                </div>
                <div className="p-2 rounded-xl bg-[#0e1424] border border-slate-800">
                  <div className="text-base font-black text-emerald-400 font-mono">{percentages.overallReadiness}%</div>
                  <div className="text-[10px] text-slate-400">Readiness</div>
                </div>
              </div>

              <div className="flex flex-wrap justify-center gap-1.5 pt-1">
                {skills.slice(0, 4).map((s) => (
                  <span key={s} className="px-2 py-0.5 rounded-md bg-[#0e1424] text-[10px] text-slate-300 border border-slate-800 font-mono">
                    {s}
                  </span>
                ))}
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2 pt-1">
              <button
                onClick={handleCopyShareLink}
                className="flex-1 py-2.5 px-4 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-xs font-bold shadow-md shadow-indigo-600/30 flex items-center justify-center gap-2 transition active:scale-95"
              >
                <Share2 className="h-3.5 w-3.5" />
                <span>Copy Shareable Link</span>
              </button>
              <button
                onClick={() => {
                  showToast('Achievement badge saved!', 'success');
                  setShowShareModal(false);
                }}
                className="py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold flex items-center gap-1.5 border border-slate-700 transition"
              >
                <Download className="h-3.5 w-3.5" />
                <span>Done</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
