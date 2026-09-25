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
      match: ['practice', 'arena', 'sql', 'mcqs', 'puzzles', 'interview', 'assessments', 'company-intel'],
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
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-[#090d16]/95 backdrop-blur-xl border-t border-slate-800/90 px-2 py-1.5 flex items-center justify-around select-none shadow-[0_-8px_20px_rgba(0,0,0,0.5)]">
      {tabs.map((tab) => {
        const Icon = tab.icon;
        const isActive = tab.match.includes(activeTab);

        return (
          <button
            key={tab.id}
            onClick={() => onSelectTab(tab.id)}
            className={`flex flex-col items-center justify-center py-1 px-3 rounded-2xl transition-all relative group ${
              isActive
                ? 'text-sky-400 font-bold'
                : 'text-slate-400 hover:text-slate-200 font-medium'
            }`}
          >
            {/* Active Pill Glow Indicator */}
            {isActive && (
              <span className="absolute -top-1.5 w-6 h-1 rounded-full bg-gradient-to-r from-sky-400 to-indigo-500 shadow-md shadow-sky-400/50" />
            )}

            <div className="relative">
              <Icon
                className={`h-5 w-5 transition-transform duration-200 ${
                  isActive ? 'scale-110 text-sky-400 stroke-[2.2]' : 'text-slate-400 group-hover:scale-105'
                }`}
              />
              {tab.badge && (
                <span className="absolute -top-1 -right-2 h-2 w-2 rounded-full bg-rose-500 ring-2 ring-[#090d16] animate-pulse" />
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
