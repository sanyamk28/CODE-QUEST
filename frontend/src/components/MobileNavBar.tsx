import React from 'react';
import { Home, Compass, Swords, User, Terminal } from 'lucide-react';
import { ActiveTabType } from '../types';

interface MobileNavBarProps {
  activeTab: ActiveTabType;
  onSelectTab: (tab: ActiveTabType) => void;
}

export const MobileNavBar: React.FC<MobileNavBarProps> = ({ activeTab, onSelectTab }) => {
  const tabs = [
    {
      id: 'dashboard' as ActiveTabType,
      label: 'Home',
      icon: Home,
      match: ['dashboard'],
    },
    {
      id: 'practice' as ActiveTabType,
      label: 'Practice',
      icon: Terminal,
      match: ['practice', 'arena', 'sql', 'mcqs', 'puzzles', 'assessments', 'company-intel'],
    },
    {
      id: 'battle' as ActiveTabType,
      label: 'Battles',
      icon: Swords,
      match: ['battle'],
      badge: 'LIVE',
    },
    {
      id: 'roadmaps' as ActiveTabType,
      label: 'Roadmap',
      icon: Compass,
      match: ['roadmaps', 'resume'],
    },
    {
      id: 'profile' as ActiveTabType,
      label: 'Profile',
      icon: User,
      match: ['profile', 'settings', 'leaderboard'],
    },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-[#090D18]/95 backdrop-blur-2xl border-t border-cyan-500/20 px-2 py-1.5 flex items-center justify-around select-none shadow-[0_-8px_25px_rgba(0,0,0,0.85)]">
      {tabs.map((tab) => {
        const Icon = tab.icon;
        const isActive = tab.match.includes(activeTab);

        return (
          <button
            key={tab.id}
            onClick={() => onSelectTab(tab.id)}
            className={`flex flex-col items-center justify-center py-1 px-3 rounded-2xl transition-all relative group ${
              isActive
                ? 'text-cyan-400 font-extrabold'
                : 'text-slate-400 hover:text-cyan-300 font-medium'
            }`}
          >
            {/* Active Pill Glow Indicator */}
            {isActive && (
              <span className="absolute -top-1.5 w-7 h-1 rounded-full bg-gradient-to-r from-cyan-400 via-blue-500 to-indigo-500 shadow-md shadow-cyan-400/60" />
            )}

            <div className="relative">
              <Icon
                className={`h-5 w-5 transition-transform duration-200 ${
                  isActive ? 'scale-110 text-cyan-400 stroke-[2.2]' : 'text-slate-400 group-hover:scale-105'
                }`}
              />
              {tab.badge && (
                <span className="absolute -top-1 -right-2 h-2 w-2 rounded-full bg-rose-500 ring-2 ring-[#090D18] animate-pulse" />
              )}
            </div>

            <span className={`text-[10px] tracking-tight mt-1 ${isActive ? 'text-white' : 'text-slate-400'}`}>
              {tab.label}
            </span>
          </button>
        );
      })}
    </nav>
  );
};
