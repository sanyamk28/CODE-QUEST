import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
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
  Target,
  Camera,
  Upload,
  Trash2,
  Building2,
  BookOpen
} from 'lucide-react';

import { ActiveTabType } from '../../types';
import { getUserActivityStats, calculateProgressPercentages } from '../../services/activityTracker';
import { showToast } from '../../components/Toast';
import { apiClient } from '../../services/api';

interface ProfileViewProps {
  userName: string;
  targetRole: string;
  streak: number;
  onUpdateRole?: (role: string) => void;
}

const POPULAR_COLLEGES = [
  'IIT Delhi', 'DTU', 'NSUT', 'BITS Pilani', 'VIT Vellore', 'NIT Trichy', 'IIIT Hyderabad', 'JIMS Rohini', 'SRM University'
];

const POPULAR_DEGREES = [
  'B.Tech CSE', 'B.Tech IT', 'MCA', 'BCA', 'B.Sc Computer Science', 'M.Tech', 'B.E. Computer Engineering'
];

const DEFAULT_LANGUAGES = [
  'Python', 'Java', 'C++', 'C', 'JavaScript', 'TypeScript', 'SQL', 'Go', 'Rust', 'Kotlin', 'Swift', 'HTML / CSS', 'React', 'Node.js'
];

const PRESET_AVATARS = ['🤖', '🚀', '💻', '⚡', '🛡️', '🎓', '🎯', '🦁'];

export const ProfileView: React.FC<ProfileViewProps> = ({
  userName,
  targetRole,
  streak,
  onUpdateRole,
}) => {
  const [stats, setStats] = useState(() => getUserActivityStats());

  // User Profile Data from localStorage
  const [name, setName] = useState<string>(() => localStorage.getItem('cq_user_name') || userName || 'Candidate');
  const [college, setCollege] = useState<string>(() => localStorage.getItem('cq_user_college') || '');
  const [degree, setDegree] = useState<string>(() => localStorage.getItem('cq_user_degree') || '');
  const [avatar, setAvatar] = useState<string>(() => localStorage.getItem('cq_user_avatar') || '');
  const [skills, setSkills] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('cq_user_skills');
      return saved ? JSON.parse(saved) : ['Python', 'SQL', 'Algorithms', 'System Design'];
    } catch {
      return ['Python', 'SQL', 'Algorithms', 'System Design'];
    }
  });

  // Modal & inline states
  const [showEditModal, setShowEditModal] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [selectedBadge, setSelectedBadge] = useState<string | null>(null);
  const [newSkill, setNewSkill] = useState('');
  const [isAddingSkill, setIsAddingSkill] = useState(false);

  // Edit Modal form fields
  const [editName, setEditName] = useState(name);
  const [editCollege, setEditCollege] = useState(college);
  const [editDegree, setEditDegree] = useState(degree);
  const [editRole, setEditRole] = useState(targetRole || 'Software Engineer');
  const [editAvatar, setEditAvatar] = useState(avatar);
  const [editSkills, setEditSkills] = useState<string[]>(skills);
  const [customSkillModalInput, setCustomSkillModalInput] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Sync stats and profile on external events
  useEffect(() => {
    const handleUpdate = () => {
      setStats(getUserActivityStats());
    };
    const handleProfileSync = () => {
      setName(localStorage.getItem('cq_user_name') || userName || 'Candidate');
      setCollege(localStorage.getItem('cq_user_college') || '');
      setDegree(localStorage.getItem('cq_user_degree') || '');
      setAvatar(localStorage.getItem('cq_user_avatar') || '');
      try {
        const saved = localStorage.getItem('cq_user_skills');
        if (saved) setSkills(JSON.parse(saved));
      } catch {}
    };

    window.addEventListener('cq_activity_updated', handleUpdate);
    window.addEventListener('cq_profile_updated', handleProfileSync);
    return () => {
      window.removeEventListener('cq_activity_updated', handleUpdate);
      window.removeEventListener('cq_profile_updated', handleProfileSync);
    };
  }, [userName]);

  const percentages = useMemo(() => calculateProgressPercentages(stats), [stats]);

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
    { name: 'DSA Champion', icon: '💡', desc: 'Mastered core algorithmic data structures', color: 'from-emerald-400 to-teal-500' },
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

  // Handle image upload with canvas resize to max 256x256
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      showToast('Please select a valid image file (JPG, PNG, WebP)', 'error');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const maxDim = 256;
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > maxDim) {
            height = Math.round((height * maxDim) / width);
            width = maxDim;
          }
        } else {
          if (height > maxDim) {
            width = Math.round((width * maxDim) / height);
            height = maxDim;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0, width, height);
          const dataUrl = canvas.toDataURL('image/jpeg', 0.85);
          setEditAvatar(dataUrl);
          showToast('Image selected! Click Save to apply.', 'info');
        }
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  const handleSelectPresetAvatar = (emoji: string) => {
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="128" height="128" viewBox="0 0 128 128"><rect width="100%" height="100%" rx="32" fill="#0f172a"/><text x="50%" y="54%" font-size="64" dominant-baseline="middle" text-anchor="middle">${emoji}</text></svg>`;
    const dataUri = `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
    setEditAvatar(dataUri);
  };

  const handleOpenEditModal = () => {
    setEditName(name);
    setEditCollege(college);
    setEditDegree(degree);
    setEditRole(targetRole || 'Software Engineer');
    setEditAvatar(avatar);
    setEditSkills([...skills]);
    setShowEditModal(true);
  };

  const handleSaveProfile = async () => {
    const cleanName = editName.trim() || 'Candidate';
    const cleanCollege = editCollege.trim();
    const cleanDegree = editDegree.trim();
    const cleanRole = editRole.trim() || 'Software Engineer';

    // Save to state
    setName(cleanName);
    setCollege(cleanCollege);
    setDegree(cleanDegree);
    setAvatar(editAvatar);
    setSkills(editSkills);

    // Save to localStorage
    localStorage.setItem('cq_user_name', cleanName);
    localStorage.setItem('cq_user_college', cleanCollege);
    localStorage.setItem('cq_user_degree', cleanDegree);
    localStorage.setItem('cq_target_role', cleanRole);
    localStorage.setItem('cq_user_skills', JSON.stringify(editSkills));
    if (editAvatar) {
      localStorage.setItem('cq_user_avatar', editAvatar);
    } else {
      localStorage.removeItem('cq_user_avatar');
    }

    onUpdateRole?.(cleanRole);
    window.dispatchEvent(new CustomEvent('cq_profile_updated'));

    // Try sending to backend to persist into Postgres
    try {
      await apiClient.post('/auth/onboard', {
        name: cleanName,
        college: cleanCollege,
        degree: cleanDegree,
        skills: editSkills,
        target_role: cleanRole
      });
    } catch (e) {
      // Offline fallback is already active
    }

    setShowEditModal(false);
    showToast('Profile updated successfully!', 'success');
  };

  // Inline Quick Add Skill
  const handleAddSkill = () => {
    if (newSkill.trim() && !skills.includes(newSkill.trim())) {
      const updated = [...skills, newSkill.trim()];
      setSkills(updated);
      localStorage.setItem('cq_user_skills', JSON.stringify(updated));
      window.dispatchEvent(new CustomEvent('cq_profile_updated'));
      setNewSkill('');
      setIsAddingSkill(false);
      showToast(`Added ${newSkill.trim()} to verified skills!`, 'success');
    }
  };

  const handleRemoveSkill = (skillToRemove: string) => {
    const updated = skills.filter(s => s !== skillToRemove);
    setSkills(updated);
    localStorage.setItem('cq_user_skills', JSON.stringify(updated));
    window.dispatchEvent(new CustomEvent('cq_profile_updated'));
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
        <div className="flex items-center gap-3.5 min-w-0">
          {/* Avatar with Click-to-edit */}
          <div 
            onClick={handleOpenEditModal}
            className="relative group cursor-pointer shrink-0"
            title="Click to Change Photo & Profile"
          >
            <div className="h-16 w-16 rounded-2xl bg-gradient-to-tr from-sky-400 via-indigo-500 to-purple-600 flex items-center justify-center font-black text-xl text-white shadow-lg shadow-indigo-500/20 overflow-hidden ring-2 ring-indigo-500/30">
              {avatar ? (
                <img src={avatar} alt={name} className="h-full w-full object-cover" />
              ) : (
                name ? name.substring(0, 2).toUpperCase() : 'ST'
              )}
            </div>
            <div className="absolute inset-0 bg-black/50 rounded-2xl opacity-0 group-hover:opacity-100 flex items-center justify-center transition">
              <Camera className="h-4 w-4 text-white" />
            </div>
            <span className="absolute -bottom-1 -right-1 h-4 w-4 rounded-full bg-emerald-500 ring-4 ring-[#0b101e]" />
          </div>

          <div className="space-y-1 min-w-0">
            <div className="flex items-center gap-2">
              <h1 className="text-base font-black text-white truncate">{name}</h1>
              <span className="text-[10px] font-bold px-2 py-0.2 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 shrink-0">
                Verified Coder
              </span>
            </div>

            {/* User-defined Degree and College */}
            <div className="flex items-center gap-1.5 text-[11px] text-slate-300 font-medium">
              <GraduationCap className="h-3.5 w-3.5 text-indigo-400 shrink-0" />
              <span className="truncate">
                {degree && college
                  ? `${degree} • ${college}`
                  : degree || college || 'Add College & Degree'}
              </span>
              <button
                onClick={handleOpenEditModal}
                className="text-slate-500 hover:text-white transition p-0.5 rounded hover:bg-slate-800"
                title="Edit College & Degree"
              >
                <Edit2 className="h-3 w-3" />
              </button>
            </div>

            {/* Target Role & Quick Edit */}
            <div className="text-xs font-bold text-sky-400 flex items-center gap-1.5">
              <span className="truncate">{targetRole || 'Software Engineer'}</span>
              <button
                onClick={handleOpenEditModal}
                className="text-slate-500 hover:text-white transition"
                title="Edit Target Role"
              >
                <Edit2 className="h-3 w-3" />
              </button>
            </div>
          </div>
        </div>

        {/* Circular Readiness Gauge, Edit Profile Button & Share Card Trigger */}
        <div className="flex items-center gap-2.5 shrink-0 ml-2">
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
            onClick={handleOpenEditModal}
            className="p-2.5 rounded-2xl bg-indigo-600/20 hover:bg-indigo-600/40 border border-indigo-500/40 text-indigo-300 hover:text-white transition shadow-sm active:scale-95 flex items-center gap-1.5"
            title="Edit Full Profile"
          >
            <Edit2 className="h-4 w-4" />
            <span className="text-xs font-bold hidden sm:inline">Edit Profile</span>
          </button>

          <button
            onClick={() => setShowShareModal(true)}
            className="p-2.5 rounded-2xl bg-cyan-600/20 hover:bg-cyan-600/40 border border-cyan-500/40 text-cyan-300 hover:text-white transition shadow-sm active:scale-95"
            title="Share Portfolio Achievement Card"
          >
            <Share2 className="h-4 w-4" />
          </button>
        </div>
      </div>

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

              <polygon
                points={radarPolygonPoints}
                fill="rgba(99, 102, 241, 0.25)"
                stroke="#6366f1"
                strokeWidth="2"
              />

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

          {/* Metric breakdown list */}
          <div className="flex-1 space-y-2 w-full">
            {radarMetrics.map((m, i) => (
              <div key={i} className="space-y-1">
                <div className="flex justify-between text-xs">
                  <span className="text-slate-300 font-medium">{m.label}</span>
                  <span className="font-mono font-bold text-sky-400 text-[11px]">{m.score}%</span>
                </div>
                <div className="h-1.5 w-full bg-slate-900 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-cyan-500 to-indigo-500 rounded-full"
                    style={{ width: `${m.score}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Verified Skills & Languages Section */}
      <div className="bg-[#0b101e] border border-slate-800/80 rounded-3xl p-5 shadow-xl space-y-3">
        <div className="flex items-center justify-between pb-1 border-b border-slate-800/60">
          <div className="flex items-center gap-2">
            <Code2 className="h-4 w-4 text-cyan-400" />
            <h3 className="text-xs font-bold text-white uppercase tracking-wider">Known Programming Languages & Stacks</h3>
          </div>
          <button
            onClick={() => setIsAddingSkill(!isAddingSkill)}
            className="text-[11px] font-bold text-sky-400 hover:text-sky-300 transition"
          >
            + Add Language / Tool
          </button>
        </div>

        {isAddingSkill && (
          <div className="flex items-center gap-2 pb-2">
            <input
              type="text"
              value={newSkill}
              onChange={(e) => setNewSkill(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleAddSkill()}
              placeholder="e.g. Go, Rust, React Native, Redis..."
              className="flex-1 px-3 py-1.5 rounded-xl bg-[#0e1424] border border-slate-700 text-xs text-white outline-none focus:border-cyan-400"
              autoFocus
            />
            <button
              onClick={handleAddSkill}
              className="px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs"
            >
              Add
            </button>
            <button
              onClick={() => setIsAddingSkill(false)}
              className="px-2.5 py-1.5 rounded-xl bg-slate-800 text-slate-400 hover:text-white text-xs"
            >
              Cancel
            </button>
          </div>
        )}

        <div className="flex flex-wrap gap-2">
          {skills.map((skill) => (
            <span
              key={skill}
              className="px-3 py-1.5 rounded-xl bg-[#0e1424] border border-slate-800 text-xs font-semibold text-sky-300 shadow-sm flex items-center gap-1.5 group hover:border-slate-700"
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

      {/* Badges & Achievements Section */}
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

      {/* ================= EDIT PROFILE MODAL ================= */}
      {showEditModal && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in overflow-y-auto">
          <div className="bg-[#0b101e] border border-indigo-500/40 rounded-3xl p-6 max-w-lg w-full shadow-2xl relative space-y-5 my-8">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2.5">
                <div className="h-8 w-8 rounded-xl bg-indigo-600/20 border border-indigo-500/40 flex items-center justify-center text-indigo-400">
                  <Edit2 className="h-4 w-4" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">Edit Your Profile</h3>
                  <p className="text-[11px] text-slate-400">Update your college, degree, languages & photo</p>
                </div>
              </div>
              <button
                onClick={() => setShowEditModal(false)}
                className="p-1 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Photo / Avatar Uploader */}
            <div className="flex items-center gap-4 p-3.5 rounded-2xl bg-[#070c18] border border-slate-800">
              <div className="relative shrink-0">
                <div className="h-16 w-16 rounded-2xl bg-gradient-to-tr from-cyan-400 to-indigo-600 p-0.5 overflow-hidden">
                  <div className="h-full w-full bg-[#090D18] rounded-[14px] flex items-center justify-center overflow-hidden">
                    {editAvatar ? (
                      <img src={editAvatar} alt="Avatar" className="h-full w-full object-cover" />
                    ) : (
                      <span className="font-bold text-lg text-white">
                        {editName ? editName.substring(0, 2).toUpperCase() : 'ST'}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <div className="space-y-2 flex-1">
                <div className="flex items-center gap-2">
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleImageUpload}
                    accept="image/*"
                    className="hidden"
                  />
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="px-3 py-1.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs flex items-center gap-1.5 transition"
                  >
                    <Upload className="h-3 w-3" />
                    <span>Upload Image</span>
                  </button>

                  {editAvatar && (
                    <button
                      type="button"
                      onClick={() => setEditAvatar('')}
                      className="px-2.5 py-1.5 rounded-xl bg-slate-800 hover:bg-rose-950/60 hover:text-rose-300 text-slate-300 text-xs font-medium transition"
                    >
                      Remove
                    </button>
                  )}
                </div>

                {/* Preset Avatars */}
                <div className="flex items-center gap-1.5">
                  <span className="text-[10px] text-slate-500 font-mono">Preset:</span>
                  {PRESET_AVATARS.map((emoji) => (
                    <button
                      key={emoji}
                      type="button"
                      onClick={() => handleSelectPresetAvatar(emoji)}
                      className="h-6 w-6 rounded-lg bg-[#0e1424] hover:bg-indigo-950/60 border border-slate-800 text-xs flex items-center justify-center transition"
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Form Fields */}
            <div className="space-y-3.5 text-left">
              {/* Name */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-300">Full Name</label>
                <input
                  type="text"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#070c18] border border-slate-800 text-xs text-white outline-none focus:border-indigo-400 transition"
                  placeholder="Your full name"
                />
              </div>

              {/* College */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-300">College / University</label>
                <input
                  type="text"
                  value={editCollege}
                  onChange={(e) => setEditCollege(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#070c18] border border-slate-800 text-xs text-white outline-none focus:border-cyan-400 transition"
                  placeholder="e.g. DTU, IIT Delhi, VIT, JIMS Rohini..."
                />
                <div className="flex flex-wrap gap-1 pt-0.5">
                  {POPULAR_COLLEGES.slice(0, 5).map((c) => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => setEditCollege(c)}
                      className="text-[9px] px-2 py-0.5 rounded bg-[#0e1424] text-slate-400 border border-slate-800 hover:text-white"
                    >
                      {c}
                    </button>
                  ))}
                </div>
              </div>

              {/* Degree */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-300">Degree & Branch</label>
                <input
                  type="text"
                  value={editDegree}
                  onChange={(e) => setEditDegree(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#070c18] border border-slate-800 text-xs text-white outline-none focus:border-indigo-400 transition"
                  placeholder="e.g. B.Tech Computer Science, MCA 2nd Year..."
                />
                <div className="flex flex-wrap gap-1 pt-0.5">
                  {POPULAR_DEGREES.slice(0, 5).map((d) => (
                    <button
                      key={d}
                      type="button"
                      onClick={() => setEditDegree(d)}
                      className="text-[9px] px-2 py-0.5 rounded bg-[#0e1424] text-slate-400 border border-slate-800 hover:text-white"
                    >
                      {d}
                    </button>
                  ))}
                </div>
              </div>

              {/* Target Role */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-300">Target Role / Track</label>
                <input
                  type="text"
                  value={editRole}
                  onChange={(e) => setEditRole(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#070c18] border border-slate-800 text-xs text-white outline-none focus:border-indigo-400 transition"
                  placeholder="e.g. Data Engineer, Full Stack Developer..."
                />
              </div>

              {/* Languages / Skills Multi-Select */}
              <div className="space-y-1.5 pt-1">
                <label className="text-xs font-bold text-slate-300">Languages & Technical Skills</label>
                <div className="flex flex-wrap gap-1.5">
                  {DEFAULT_LANGUAGES.map((lang) => {
                    const isSelected = editSkills.includes(lang);
                    return (
                      <button
                        key={lang}
                        type="button"
                        onClick={() => {
                          if (isSelected) {
                            setEditSkills(prev => prev.filter(s => s !== lang));
                          } else {
                            setEditSkills(prev => [...prev, lang]);
                          }
                        }}
                        className={`text-[10px] px-2.5 py-1 rounded-lg border font-semibold transition ${
                          isSelected
                            ? 'bg-cyan-500/20 text-cyan-300 border-cyan-400 shadow-[0_0_8px_rgba(0,229,255,0.2)]'
                            : 'bg-[#0e1424] text-slate-400 border-slate-800 hover:text-white'
                        }`}
                      >
                        {isSelected ? `✓ ${lang}` : lang}
                      </button>
                    );
                  })}
                </div>

                <div className="flex items-center gap-2 pt-1">
                  <input
                    type="text"
                    value={customSkillModalInput}
                    onChange={(e) => setCustomSkillModalInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && customSkillModalInput.trim()) {
                        if (!editSkills.includes(customSkillModalInput.trim())) {
                          setEditSkills(prev => [...prev, customSkillModalInput.trim()]);
                          setCustomSkillModalInput('');
                        }
                      }
                    }}
                    placeholder="+ Add custom language / tool..."
                    className="flex-1 px-3 py-1.5 rounded-xl bg-[#070c18] border border-slate-800 text-xs text-white outline-none focus:border-indigo-400"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      if (customSkillModalInput.trim() && !editSkills.includes(customSkillModalInput.trim())) {
                        setEditSkills(prev => [...prev, customSkillModalInput.trim()]);
                        setCustomSkillModalInput('');
                      }
                    }}
                    className="px-3 py-1.5 rounded-xl bg-slate-800 text-slate-200 hover:text-white text-xs font-bold"
                  >
                    Add
                  </button>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setShowEditModal(false)}
                className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold transition"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSaveProfile}
                className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-xs font-extrabold shadow-lg shadow-indigo-600/30 transition transform active:scale-95"
              >
                Save Profile Changes
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Shareable Achievement Card Modal */}
      {showShareModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-[#0b101e] border border-indigo-500/50 rounded-3xl p-6 max-w-md w-full shadow-2xl relative space-y-4">
            <button
              onClick={() => setShowShareModal(false)}
              className="absolute top-4 right-4 p-1 rounded-xl text-slate-400 hover:text-white"
            >
              <X className="h-5 w-5" />
            </button>

            <div className="text-center space-y-1">
              <span className="text-[10px] font-mono uppercase tracking-wider text-indigo-400">Official Candidate Transcript</span>
              <h3 className="text-lg font-black text-white">{name}</h3>
              <p className="text-xs text-slate-400">
                {degree && college ? `${degree} • ${college}` : targetRole}
              </p>
            </div>

            {/* Visual Card */}
            <div className="p-4 rounded-2xl bg-gradient-to-br from-[#0c1428] via-[#090f1e] to-[#060a14] border border-indigo-500/40 space-y-3 shadow-inner">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-cyan-400 to-indigo-600 flex items-center justify-center text-white font-black overflow-hidden">
                    {avatar ? <img src={avatar} alt={name} className="h-full w-full object-cover" /> : (name ? name.substring(0, 2).toUpperCase() : 'ST')}
                  </div>
                  <div>
                    <div className="text-xs font-bold text-white">{name}</div>
                    <div className="text-[10px] text-sky-400 font-mono">{targetRole}</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-xs font-mono font-black text-amber-400">{stats.totalXp} XP</div>
                  <div className="text-[9px] text-slate-400">L{percentages.level} Verified</div>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2 pt-2 border-t border-slate-800 text-center font-mono">
                <div>
                  <div className="text-xs font-bold text-white">{stats.streak}d</div>
                  <div className="text-[9px] text-slate-400">Streak</div>
                </div>
                <div>
                  <div className="text-xs font-bold text-sky-400">{solvedCount}</div>
                  <div className="text-[9px] text-slate-400">DSA Solved</div>
                </div>
                <div>
                  <div className="text-xs font-bold text-emerald-400">{percentages.overallReadiness}%</div>
                  <div className="text-[9px] text-slate-400">Readiness</div>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 pt-2">
              <button
                onClick={handleCopyShareLink}
                className="flex-1 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition"
              >
                <Share2 className="h-3.5 w-3.5" />
                <span>Copy Shareable URL</span>
              </button>
              <button
                onClick={() => setShowShareModal(false)}
                className="px-4 py-2.5 rounded-xl bg-slate-800 text-slate-300 text-xs font-bold hover:bg-slate-700 transition"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
