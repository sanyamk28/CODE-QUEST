import React, { useState, useEffect } from 'react';
import {
  LayoutDashboard,
  Code2,
  Database,
  Layers,
  Puzzle,
  Swords,
  Bot,
  FileText,
  Compass,
  CheckSquare,
  Trophy,
  User,
  Settings,
  Sparkles,
  LogOut,
  ChevronRight,
  Building2
} from 'lucide-react';
import { ActiveTabType } from '../types';

interface SidebarProps {
  activeTab: ActiveTabType;
  onSelectTab: (tab: ActiveTabType) => void;
  userName: string;
  targetRole: string;
  onLogout: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  onSelectTab,
  userName,
  targetRole,
  onLogout,
}) => {
  const [avatar, setAvatar] = useState<string>(() => localStorage.getItem('cq_user_avatar') || '');
  const [college, setCollege] = useState<string>(() => localStorage.getItem('cq_user_college') || '');

  useEffect(() => {
    const handleSync = () => {
      setAvatar(localStorage.getItem('cq_user_avatar') || '');
      setCollege(localStorage.getItem('cq_user_college') || '');
    };
    window.addEventListener('cq_profile_updated', handleSync);
    return () => window.removeEventListener('cq_profile_updated', handleSync);
  }, []);
  const navItems = [
    { id: 'dashboard' as ActiveTabType, label: 'Dashboard', icon: LayoutDashboard },
    { id: 'practice' as ActiveTabType, label: 'Practice Hub', icon: Layers, badge: 'HUB' },
    { id: 'company-intel' as ActiveTabType, label: 'Company Intel', icon: Building2, badge: 'AGENT' },
    { id: 'arena' as ActiveTabType, label: 'Coding Arena', icon: Code2 },
    { id: 'sql' as ActiveTabType, label: 'SQL Lab', icon: Database },
    { id: 'mcqs' as ActiveTabType, label: 'CS Fundamentals', icon: Layers },
    { id: 'puzzles' as ActiveTabType, label: 'Brainteasers', icon: Puzzle },
    { id: 'battle' as ActiveTabType, label: 'Code Battles', icon: Swords, badge: 'LIVE' },
    { id: 'resume' as ActiveTabType, label: 'Resume ATS', icon: FileText },
    { id: 'roadmaps' as ActiveTabType, label: 'Career Roadmaps', icon: Compass },
    { id: 'assessments' as ActiveTabType, label: 'Assessments', icon: CheckSquare },
    { id: 'leaderboard' as ActiveTabType, label: 'Leaderboard', icon: Trophy },
    { id: 'profile' as ActiveTabType, label: 'Profile', icon: User },
    { id: 'settings' as ActiveTabType, label: 'Settings', icon: Settings },
  ];

  return (
    <aside className="hidden md:flex w-64 bg-[#090D18] border-r border-slate-800/80 flex-col h-screen sticky top-0 select-none z-30 shrink-0">
      {/* Brand Header */}
      <div className="p-4 flex items-center justify-between border-b border-slate-800/80">
        <div 
          onClick={() => onSelectTab('dashboard')} 
          className="flex items-center gap-3 cursor-pointer group"
        >
          <div className="h-9 w-9 rounded-xl bg-gradient-to-tr from-cyan-400 via-indigo-500 to-purple-500 p-[1.5px] flex items-center justify-center shadow-lg shadow-cyan-500/25 group-hover:scale-105 transition">
            <div className="h-full w-full bg-[#0B0F1C] rounded-[10px] flex items-center justify-center text-cyan-400">
              <Sparkles className="h-4 w-4 text-cyan-400 animate-pulse" />
            </div>
          </div>
          <div>
            <div className="font-extrabold text-base tracking-tight text-white flex items-center gap-1.5">
              Code Quest
            </div>
            <div className="text-[10px] font-medium text-slate-400">Placement Prep Platform</div>
          </div>
        </div>
      </div>

      {/* Navigation List */}
      <div className="flex-1 overflow-y-auto px-3 py-3 space-y-1 scrollbar-thin">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onSelectTab(item.id)}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all group ${
                isActive
                  ? 'bg-gradient-to-r from-cyan-500/20 via-cyan-500/5 to-transparent text-cyan-300 font-bold border-l-2 border-cyan-400 shadow-[0_0_20px_rgba(0,229,255,0.18)] pl-3'
                  : 'text-slate-400 hover:text-cyan-300 hover:bg-[#0D1424]/80'
              }`}
            >
              <div className="flex items-center gap-3">
                <Icon
                  className={`h-4 w-4 transition-colors ${
                    isActive ? 'text-cyan-400 drop-shadow-[0_0_8px_rgba(0,229,255,0.7)]' : 'text-slate-400 group-hover:text-cyan-400'
                  }`}
                />
                <span className="tracking-wide">{item.label}</span>
              </div>

              {item.badge && (
                <span
                  className={`text-[9px] px-1.5 py-0.5 rounded-md font-bold uppercase tracking-wider ${
                    isActive
                      ? 'bg-cyan-400/20 text-cyan-300 border border-cyan-400/40 shadow-[0_0_10px_rgba(0,229,255,0.3)]'
                      : item.badge === 'LIVE'
                      ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30 animate-pulse'
                      : 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20'
                  }`}
                >
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* User Profile Card at bottom */}
      <div className="p-3 border-t border-slate-800/80 bg-[#06080F]">
        <div className="flex items-center justify-between p-2 rounded-xl bg-[#0D1322] border border-slate-800/80">
          <div 
            onClick={() => onSelectTab('profile')} 
            className="flex items-center gap-2.5 cursor-pointer flex-1 min-w-0"
          >
            <div className="relative">
              <div className="h-9 w-9 rounded-full bg-gradient-to-tr from-cyan-400 via-blue-500 to-indigo-600 flex items-center justify-center font-bold text-xs text-white shadow shadow-cyan-500/25 ring-2 ring-cyan-500/20 overflow-hidden">
                {avatar ? (
                  <img src={avatar} alt={userName} className="h-full w-full object-cover" />
                ) : (
                  userName ? userName.substring(0, 2).toUpperCase() : 'ST'
                )}
              </div>
              <span className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full bg-emerald-400 ring-2 ring-[#0B0F1C]" />
            </div>
            <div className="truncate">
              <div className="text-xs font-bold text-white truncate hover:text-cyan-400 transition">
                {userName || 'Candidate'}
              </div>
              <div className="text-[10px] text-slate-400 truncate">
                {targetRole || 'Software Engineer'}{college ? ` • ${college}` : ''}
              </div>
            </div>
          </div>
          <button
            onClick={onLogout}
            title="Switch / Sign Out"
            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-slate-800 transition shrink-0 ml-1"
          >
            <LogOut className="h-4 w-4" />
          </button>
        </div>
      </div>
    </aside>
  );
};
