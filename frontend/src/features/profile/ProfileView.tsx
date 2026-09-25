import React, { useState } from 'react';
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
  Trophy
} from 'lucide-react';

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
  const [skills, setSkills] = useState([
    'Python', 'SQL', 'Pandas', 'PySpark', 'AWS', 'Airflow', 'Databricks'
  ]);
  const [newSkill, setNewSkill] = useState('');
  const [isAddingSkill, setIsAddingSkill] = useState(false);
  const [isEditingRole, setIsEditingRole] = useState(false);
  const [customRoleInput, setCustomRoleInput] = useState(targetRole || 'Data Engineer');
  const [selectedBadge, setSelectedBadge] = useState<string | null>(null);

  const achievements = [
    { name: 'Master Coder', icon: '⚡', desc: 'Solved over 400+ algorithmic coding problems', color: 'from-amber-400 to-orange-500' },
    { name: 'SQL Guru', icon: '💎', desc: 'Mastered multi-table analytical window queries', color: 'from-cyan-400 to-blue-500' },
    { name: 'Streak Legend', icon: '🔥', desc: 'Kept a 12-day continuous problem-solving streak', color: 'from-rose-500 to-amber-500' },
    { name: 'AI Champion', icon: '🤖', desc: 'Completed 5 AI technical recruiter mock interviews', color: 'from-emerald-400 to-teal-500' },
    { name: 'Battle King', icon: '⚔️', desc: 'Won 8 live 1v1 speed battles', color: 'from-purple-500 to-indigo-500' },
  ];

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

  return (
    <div className="space-y-5 max-w-2xl mx-auto pb-6">
      {/* User Header Profile Card matching Screen 15 */}
      <div className="bg-[#0b101e] border border-slate-800/80 rounded-3xl p-5 shadow-xl flex items-center justify-between">
        <div className="flex items-center gap-3.5">
          <div className="relative">
            <div className="h-16 w-16 rounded-2xl bg-gradient-to-tr from-sky-400 via-indigo-500 to-purple-600 flex items-center justify-center font-black text-xl text-white shadow-lg">
              {userName ? userName.substring(0, 2).toUpperCase() : 'SK'}
            </div>
            <span className="absolute -bottom-1 -right-1 h-4 w-4 rounded-full bg-emerald-500 ring-4 ring-[#0b101e]" />
          </div>

          <div className="space-y-0.5">
            <h1 className="text-base font-black text-white">{userName || 'Sanyam Kumar'}</h1>
            <p className="text-[11px] text-slate-400 font-medium">MCA Student • JIMS Rohini</p>
            <div className="text-xs font-bold text-sky-400 flex items-center gap-1.5 pt-0.5">
              <span>{targetRole || 'Data Engineer'}</span>
              <button
                onClick={() => setIsEditingRole(!isEditingRole)}
                className="text-slate-500 hover:text-white"
                title="Edit Target Role"
              >
                <Edit2 className="h-3 w-3" />
              </button>
            </div>
          </div>
        </div>

        {/* Circular Readiness Gauge matching Screen 15: 78% */}
        <div className="relative w-14 h-14 flex items-center justify-center">
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
          <span className="absolute text-xs font-black text-white">78%</span>
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

      {/* 6 Stats Grid matching Screen 15: 12 Streak, 450 Solved, 56 SQL, 8 Battles, Level 5, 320 XP */}
      <div className="grid grid-cols-3 gap-2.5">
        {[
          { label: 'Streak', val: `${streak || 12}`, sub: '12 Days', icon: Flame, color: 'text-orange-400', bg: 'bg-orange-950/30' },
          { label: 'Solved', val: '450', sub: 'DSA Problems', icon: Code2, color: 'text-sky-400', bg: 'bg-sky-950/30' },
          { label: 'SQL', val: '56', sub: 'Queries', icon: Database, color: 'text-cyan-400', bg: 'bg-cyan-950/30' },
          { label: 'Battles', val: '8', sub: 'Won', icon: Swords, color: 'text-rose-400', bg: 'bg-rose-950/30' },
          { label: 'Level', val: 'L5', sub: 'Rank Tier', icon: Zap, color: 'text-indigo-400', bg: 'bg-indigo-950/30' },
          { label: 'XP', val: '320', sub: 'Total Points', icon: Award, color: 'text-amber-400', bg: 'bg-amber-950/30' },
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

      {/* Skills Section matching Screen 15 with delete and add */}
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

      {/* Achievements Section matching Screen 15 with description modal/card */}
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
    </div>
  );
};
