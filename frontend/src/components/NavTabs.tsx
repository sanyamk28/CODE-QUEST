import React from 'react';
import {
  Compass, Code2, Database, HelpCircle, Puzzle, Award, Swords, Bot, FileText, BookOpen, Trophy
} from 'lucide-react';
import { ActiveTabType } from '../types';

interface NavTabsProps {
  activeTab: ActiveTabType;
  onSelectTab: (tab: ActiveTabType) => void;
}

export const NavTabs: React.FC<NavTabsProps> = ({ activeTab, onSelectTab }) => {
  const tabs = [
    { id: 'dashboard', label: 'Dashboard', icon: Compass },
    { id: 'arena', label: 'Code Arena', icon: Code2 },
    { id: 'sql', label: 'SQL Lab', icon: Database },
    { id: 'mcqs', label: 'MCQ & CS Quiz', icon: HelpCircle },
    { id: 'puzzles', label: 'Puzzles & Scenarios', icon: Puzzle },
    { id: 'assessments', label: 'Company Bundles', icon: Award },
    { id: 'battle', label: '⚔️ Code Battle', icon: Swords, highlight: true },
    { id: 'interview', label: 'AI Mock Interview', icon: Bot },
    { id: 'resume', label: 'AI Resume ATS', icon: FileText, highlight: true },
    { id: 'roadmaps', label: 'Roadmaps & Projects', icon: BookOpen },
    { id: 'leaderboard', label: 'Leaderboard', icon: Trophy },
  ] as const;

  return (
    <nav className="bg-[#0b101e] border-b border-slate-800/60 px-6 py-2 flex items-center gap-1.5 overflow-x-auto text-xs font-medium scrollbar-none">
      {tabs.map((item) => {
        const Icon = item.icon;
        const isActive = activeTab === item.id;
        return (
          <button
            key={item.id}
            onClick={() => onSelectTab(item.id as ActiveTabType)}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl transition-all whitespace-nowrap ${
              isActive
                ? 'bg-gradient-to-r from-indigo-600 to-sky-600 text-white font-semibold shadow-md shadow-indigo-600/30'
                : 'highlight' in item && item.highlight
                ? 'bg-amber-500/10 text-amber-300 hover:bg-amber-500/20 border border-amber-500/30'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            <Icon
              className={`h-3.5 w-3.5 ${
                isActive
                  ? 'text-white'
                  : 'highlight' in item && item.highlight
                  ? 'text-amber-400'
                  : 'text-slate-400'
              }`}
            />
            <span>{item.label}</span>
          </button>
        );
      })}
    </nav>
  );
};
