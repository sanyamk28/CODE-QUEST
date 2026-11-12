import React from 'react';
import { ArrowLeft, Flame, Bell, Settings, Share2, Bookmark, Search, User } from 'lucide-react';
import { ActiveTabType } from '../types';
import { showToast } from './Toast';

interface MobileHeaderProps {
  activeTab: ActiveTabType;
  userName: string;
  targetRole: string;
  streak: number;
  onSelectTab: (tab: ActiveTabType) => void;
  onBack?: () => void;
}

export const MobileHeader: React.FC<MobileHeaderProps> = ({
  activeTab,
  userName,
  targetRole,
  streak,
  onSelectTab,
  onBack,
}) => {
  const isRootTab = activeTab === 'dashboard';

  const getTitle = () => {
    switch (activeTab) {
      case 'dashboard':
        return null;
      case 'practice':
        return 'Practice';
      case 'arena':
        return 'Two Sum';
      case 'sql':
        return 'SQL Lab';
      case 'battle':
        return 'Code Battle';
      case 'resume':
        return 'ATS Resume Analyzer';
      case 'roadmaps':
        return `${targetRole || 'Data Engineer'} Roadmap`;
      case 'assessments':
        return 'Assessments';
      case 'leaderboard':
        return 'Leaderboard';
      case 'profile':
        return 'Profile';
      case 'mcqs':
        return 'CS Fundamentals';
      case 'puzzles':
        return 'Brainteasers';
      case 'company-intel':
        return 'Company Intelligence';
      case 'settings':
        return 'Settings';
      default:
        return 'Code Quest';
    }
  };

  const handleBack = () => {
    if (onBack) {
      onBack();
      return;
    }
    // Default smart back logic
    if (['arena', 'sql', 'mcqs', 'puzzles', 'assessments'].includes(activeTab)) {
      onSelectTab('practice');
    } else if (['resume'].includes(activeTab)) {
      onSelectTab('roadmaps');
    } else if (['settings', 'leaderboard'].includes(activeTab)) {
      onSelectTab('profile');
    } else {
      onSelectTab('dashboard');
    }
  };

  const title = getTitle();

  if (isRootTab) {
    return (
      <header className="sticky top-0 z-30 bg-[#090D18]/95 backdrop-blur-xl px-4 py-3 flex items-center justify-between border-b border-slate-800/80 shadow-md">
        <div>
          <div className="flex items-center gap-1.5">
            <span className="text-sm font-black text-white">Good morning, {userName.split(' ')[0]}</span>
            <span className="text-sm">👋</span>
          </div>
          <p className="text-[11px] text-slate-400">Let's continue your placement journey</p>
        </div>

        <div className="flex items-center gap-2">
          {/* Flame streak */}
          <div className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-orange-950/40 border border-orange-500/40 text-orange-400 text-xs font-bold shadow-[0_0_12px_rgba(249,115,22,0.25)]">
            <Flame className="h-3.5 w-3.5 fill-orange-400 text-orange-400 animate-pulse" />
            <span>{streak || 12}</span>
          </div>

          {/* User Avatar */}
          <button
            onClick={() => onSelectTab('profile')}
            className="h-8 w-8 rounded-full bg-gradient-to-tr from-cyan-400 via-blue-500 to-indigo-600 flex items-center justify-center font-bold text-xs text-white shadow ring-2 ring-cyan-500/30"
          >
            {userName ? userName.substring(0, 2).toUpperCase() : 'SK'}
          </button>
        </div>
      </header>
    );
  }

  return (
    <header className="sticky top-0 z-30 bg-[#090D18]/95 backdrop-blur-xl px-4 py-3 flex items-center justify-between border-b border-slate-800/80 shadow-md">
      <div className="flex items-center gap-3 min-w-0">
        <button
          onClick={handleBack}
          aria-label="Go Back"
          className="p-1.5 -ml-1 rounded-xl bg-slate-900/90 hover:bg-slate-800 text-slate-300 border border-slate-700/60 shrink-0 transition"
        >
          <ArrowLeft className="h-4 w-4" />
        </button>
        <h1 className="text-sm sm:text-base font-extrabold text-white truncate tracking-tight">
          {title}
        </h1>
      </div>

      <div className="flex items-center gap-2 shrink-0">
        {activeTab === 'arena' && (
          <>
            <button
              onClick={() => showToast('Problem saved to bookmarks!', 'success')}
              className="p-1.5 rounded-lg bg-slate-900/60 text-slate-400 hover:text-cyan-400 transition active:scale-95 border border-slate-800/80"
            >
              <Bookmark className="h-4 w-4" />
            </button>
            <button
              onClick={() => {
                navigator.clipboard?.writeText(window.location.href);
                showToast('Link copied to clipboard!', 'info');
              }}
              className="p-1.5 rounded-lg bg-slate-900/60 text-slate-400 hover:text-cyan-400 transition active:scale-95 border border-slate-800/80"
            >
              <Share2 className="h-4 w-4" />
            </button>
          </>
        )}

        {activeTab === 'profile' && (
          <button
            onClick={() => onSelectTab('settings')}
            className="p-1.5 rounded-lg bg-slate-900/60 text-slate-400 hover:text-white"
          >
            <Settings className="h-4 w-4" />
          </button>
        )}

        {/* Global Streak indicator on sub-screens */}
        {activeTab !== 'arena' && activeTab !== 'profile' && (
          <div className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-orange-950/40 border border-orange-800/40 text-orange-400 text-xs font-bold">
            <Flame className="h-3.5 w-3.5 fill-orange-400 text-orange-400" />
            <span>{streak || 12}</span>
          </div>
        )}
      </div>
    </header>
  );
};
