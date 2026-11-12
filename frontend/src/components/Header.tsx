import React from 'react';
import { Search, Flame, Bell, User, Sparkles, LogIn, Smartphone, Monitor } from 'lucide-react';
import { ActiveTabType } from '../types';
import { InstallPwaButton } from './InstallPwaButton';

interface HeaderProps {
  activeTab: ActiveTabType;
  userName: string;
  targetRole: string;
  streak: number;
  onSelectTab: (tab: ActiveTabType) => void;
  onSearch?: (query: string) => void;
  isPhonePreview?: boolean;
  onTogglePhonePreview?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  userName,
  targetRole,
  streak,
  onSelectTab,
  onSearch,
  isPhonePreview,
  onTogglePhonePreview,
}) => {
  const getPageTitle = (tab: ActiveTabType) => {
    switch (tab) {
      case 'dashboard':
        return null;
      case 'practice':
        return 'Practice Hub';
      case 'company-intel':
        return 'Company Intelligence & Question Scraper Agent';
      case 'arena':
        return 'Coding Arena';
      case 'sql':
        return 'SQL Lab';
      case 'mcqs':
        return 'CS Fundamentals & Quizzes';
      case 'puzzles':
        return 'Brainteasers & Scenarios';
      case 'battle':
        return 'Code Battles';
      case 'resume':
        return 'Resume ATS';
      case 'roadmaps':
        return 'Career Roadmaps';
      case 'assessments':
        return 'Assessments';
      case 'leaderboard':
        return 'Leaderboard';
      case 'profile':
        return 'Profile';
      case 'settings':
        return 'Settings';
      default:
        return 'Code Quest';
    }
  };

  const title = getPageTitle(activeTab);

  return (
    <header className="sticky top-0 z-20 bg-white/95 backdrop-blur-md border-b border-slate-200 px-4 sm:px-6 py-3 flex items-center justify-between shadow-sm">
      {/* Left side: Search on dashboard, or page title */}
      <div className="flex-1 max-w-xl">
        {activeTab === 'dashboard' ? (
          <div className="relative w-full">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search problems, topics, or modules..."
              onChange={(e) => onSearch?.(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-12 py-2 text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-indigo-500 transition"
            />
            <kbd className="hidden sm:inline absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-mono bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded border border-slate-200">
              ⌘K
            </kbd>
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <span className="text-slate-400 text-xs font-medium">Code Quest</span>
            <span className="text-slate-300 text-xs">/</span>
            <span className="text-slate-900 text-sm font-bold tracking-tight">{title}</span>
          </div>
        )}
      </div>

      {/* Right side items */}
      <div className="flex items-center gap-2.5">
        {/* Install PWA to Laptop / Desktop */}
        <InstallPwaButton />

        {/* Web / Mobile App Mode Toggle for Desktop */}
        {onTogglePhonePreview && (
          <button
            onClick={onTogglePhonePreview}
            title={isPhonePreview ? 'Switch to Full Web View' : 'Preview as Mobile App Frame'}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 text-xs font-bold transition shadow-sm"
          >
            {isPhonePreview ? (
              <>
                <Monitor className="h-3.5 w-3.5 text-indigo-600" />
                <span className="hidden sm:inline">Web View</span>
              </>
            ) : (
              <>
                <Smartphone className="h-3.5 w-3.5 text-indigo-600" />
                <span className="hidden sm:inline">App View</span>
              </>
            )}
          </button>
        )}

        {/* Auth Screen Previewer Toggle */}
        <button
          onClick={() => onSelectTab('login')}
          title="View Login / Signup Screen"
          className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 text-xs font-semibold transition"
        >
          <LogIn className="h-3.5 w-3.5 text-sky-600" />
          <span>Login / Splash</span>
        </button>

        {/* Day Streak Flame */}
        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-orange-50 border border-orange-200 text-orange-600">
          <Flame className="h-4 w-4 text-orange-500 fill-orange-500" />
          <span className="text-xs font-extrabold">{streak || 12}</span>
        </div>

        {/* Notification Bell */}
        <button className="relative p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 hover:text-slate-900 transition border border-slate-200">
          <Bell className="h-4 w-4" />
          <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-indigo-500 ring-2 ring-white" />
        </button>

        {/* User Avatar */}
        <div 
          onClick={() => onSelectTab('profile')}
          className="h-8 w-8 rounded-full bg-gradient-to-tr from-sky-500 to-indigo-600 flex items-center justify-center font-bold text-xs text-white shadow cursor-pointer hover:ring-2 hover:ring-indigo-400 transition"
        >
          {userName ? userName.substring(0, 2).toUpperCase() : 'SK'}
        </div>
      </div>
    </header>
  );
};
