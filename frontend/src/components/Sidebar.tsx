import React from 'react';
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
    <aside className="hidden md:flex w-64 bg-white border-r border-slate-200 flex-col h-screen sticky top-0 select-none z-30 shrink-0 shadow-sm">
      {/* Brand Header */}
      <div className="p-4 flex items-center justify-between border-b border-slate-200">
        <div 
          onClick={() => onSelectTab('dashboard')} 
          className="flex items-center gap-3 cursor-pointer group"
        >
          <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-indigo-500 via-sky-500 to-emerald-500 p-[1.5px] flex items-center justify-center shadow-md shadow-indigo-500/20 group-hover:scale-105 transition">
            <div className="h-full w-full bg-white rounded-[10px] flex items-center justify-center text-sky-500">
              <Sparkles className="h-4 w-4 text-sky-500 animate-pulse" />
            </div>
          </div>
          <div>
            <div className="font-extrabold text-base tracking-tight text-slate-900 flex items-center gap-1.5">
              Code Quest
            </div>
            <div className="text-[10px] font-medium text-slate-500">Placement Prep Platform</div>
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
                  ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md shadow-indigo-600/20'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <div className="flex items-center gap-3">
                <Icon
                  className={`h-4 w-4 transition-colors ${
                    isActive ? 'text-white' : 'text-slate-500 group-hover:text-sky-600'
                  }`}
                />
                <span className="tracking-wide">{item.label}</span>
              </div>

              {item.badge && (
                <span
                  className={`text-[9px] px-1.5 py-0.5 rounded-md font-bold uppercase tracking-wider ${
                    isActive
                      ? 'bg-white/20 text-white'
                      : item.badge === 'LIVE'
                      ? 'bg-rose-50 text-rose-600 border border-rose-200'
                      : 'bg-indigo-50 text-indigo-600 border border-indigo-200'
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
      <div className="p-3 border-t border-slate-200 bg-white">
        <div className="flex items-center justify-between p-2 rounded-xl bg-slate-50 border border-slate-200 shadow-sm">
          <div 
            onClick={() => onSelectTab('profile')} 
            className="flex items-center gap-2.5 cursor-pointer flex-1 min-w-0"
          >
            <div className="relative">
              <div className="h-9 w-9 rounded-full bg-gradient-to-tr from-sky-500 to-indigo-600 flex items-center justify-center font-bold text-xs text-white shadow">
                SK
              </div>
              <span className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full bg-emerald-500 ring-2 ring-white" />
            </div>
            <div className="truncate">
              <div className="text-xs font-bold text-slate-900 truncate hover:text-sky-600 transition">
                {userName || 'Sanyam Kumar'}
              </div>
              <div className="text-[10px] text-slate-500 truncate">
                {targetRole || 'Data Engineer'}
              </div>
            </div>
          </div>
          <button
            onClick={onLogout}
            title="Switch / Sign Out"
            className="p-1.5 rounded-lg text-slate-500 hover:text-rose-600 hover:bg-slate-200/60 transition shrink-0 ml-1"
          >
            <LogOut className="h-4 w-4" />
          </button>
        </div>
      </div>
    </aside>
  );
};
