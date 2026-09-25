import React, { useState } from 'react';
import {
  Code2,
  Database,
  Layers,
  Puzzle,
  Swords,
  Bot,
  CheckSquare,
  Sparkles,
  ChevronRight,
  Search,
  Filter,
  Flame,
  ArrowRight
} from 'lucide-react';
import { ActiveTabType } from '../../types';

interface PracticeHubViewProps {
  onNavigate: (tab: ActiveTabType) => void;
}

interface PracticeCategory {
  id: ActiveTabType;
  title: string;
  subtitle: string;
  icon: any;
  category: 'DSA' | 'SQL' | 'MCQ' | 'CS' | 'All';
  progress?: number;
  totalCount: string;
  badge?: string;
  gradient: string;
  glowColor: string;
}

export const PracticeHubView: React.FC<PracticeHubViewProps> = ({ onNavigate }) => {
  const [selectedFilter, setSelectedFilter] = useState<'All' | 'DSA' | 'SQL' | 'MCQ' | 'CS'>('All');
  const [searchQuery, setSearchQuery] = useState('');

  const categories: PracticeCategory[] = [
    {
      id: 'arena',
      title: 'Coding Arena',
      subtitle: '450 problems',
      icon: Code2,
      category: 'DSA',
      progress: 68,
      totalCount: '450 problems',
      gradient: 'from-blue-600 to-indigo-600',
      glowColor: 'shadow-blue-500/20'
    },
    {
      id: 'sql',
      title: 'SQL Lab',
      subtitle: '120 queries',
      icon: Database,
      category: 'SQL',
      progress: 56,
      totalCount: '120 queries',
      gradient: 'from-cyan-600 to-blue-600',
      glowColor: 'shadow-cyan-500/20'
    },
    {
      id: 'mcqs',
      title: 'CS Fundamentals',
      subtitle: '200 topics',
      icon: Layers,
      category: 'CS',
      progress: 72,
      totalCount: '200 topics',
      gradient: 'from-violet-600 to-purple-600',
      glowColor: 'shadow-purple-500/20'
    },
    {
      id: 'puzzles',
      title: 'Brainteasers',
      subtitle: '150 problems',
      icon: Puzzle,
      category: 'MCQ',
      progress: 40,
      totalCount: '150 problems',
      gradient: 'from-amber-600 to-orange-600',
      glowColor: 'shadow-amber-500/20'
    },
    {
      id: 'battle',
      title: 'Code Battles',
      subtitle: '1v1 real-time battles',
      icon: Swords,
      category: 'DSA',
      badge: 'LIVE',
      totalCount: 'Matchmaking ready',
      gradient: 'from-rose-600 to-orange-600',
      glowColor: 'shadow-rose-500/20'
    },
    {
      id: 'interview',
      title: 'AI Interview',
      subtitle: 'Mock interviews with AI',
      icon: Bot,
      category: 'CS',
      badge: 'AI',
      totalCount: 'Interactive Voice/Text',
      gradient: 'from-emerald-600 to-teal-600',
      glowColor: 'shadow-emerald-500/20'
    },
    {
      id: 'assessments',
      title: 'Assessments',
      subtitle: 'Company style tests',
      icon: CheckSquare,
      category: 'All',
      badge: 'TEST',
      totalCount: 'TCS, Infosys, Accenture',
      gradient: 'from-indigo-600 to-pink-600',
      glowColor: 'shadow-indigo-500/20'
    },
  ];

  const filteredCategories = categories.filter((cat) => {
    const matchesFilter = selectedFilter === 'All' || cat.category === selectedFilter || cat.category === 'All';
    const matchesSearch = cat.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          cat.subtitle.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  return (
    <div className="space-y-4 max-w-3xl mx-auto pb-6">
      {/* Header matching Screen 4 */}
      <div className="flex flex-col gap-1">
        <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">Practice</h1>
        <p className="text-xs text-slate-400">Choose a category to improve</p>
      </div>

      {/* Filter Chips matching Screen 4: [All, DSA, SQL, MCQ, CS] */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
        {(['All', 'DSA', 'SQL', 'MCQ', 'CS'] as const).map((filter) => (
          <button
            key={filter}
            onClick={() => setSelectedFilter(filter)}
            className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all shrink-0 ${
              selectedFilter === filter
                ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
                : 'bg-[#0e1424] text-slate-400 hover:text-slate-200 border border-slate-800'
            }`}
          >
            {filter}
          </button>
        ))}
      </div>

      {/* Search Bar for Quick Navigation */}
      <div className="relative">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
        <input
          type="text"
          placeholder="Search modules or topics..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full bg-[#0b101e] border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-xs text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-indigo-500 transition shadow-inner"
        />
      </div>

      {/* Cards List matching Screen 4 */}
      <div className="space-y-3">
        {filteredCategories.map((item) => {
          const Icon = item.icon;
          return (
            <div
              key={item.id}
              onClick={() => onNavigate(item.id)}
              className="group bg-[#0b101e] hover:bg-[#0e1528] border border-slate-800/80 hover:border-indigo-500/50 rounded-2xl p-4 flex items-center justify-between cursor-pointer transition-all duration-200 shadow-lg hover:shadow-indigo-500/10 active:scale-[0.99]"
            >
              <div className="flex items-center gap-3.5 min-w-0">
                {/* Icon with gradient badge */}
                <div className={`h-12 w-12 rounded-xl bg-gradient-to-br ${item.gradient} p-0.5 flex items-center justify-center shrink-0 shadow-md ${item.glowColor} group-hover:scale-105 transition-transform`}>
                  <div className="h-full w-full bg-[#090e1a]/80 backdrop-blur-sm rounded-[10px] flex items-center justify-center text-white">
                    <Icon className="h-6 w-6" />
                  </div>
                </div>

                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-bold text-white group-hover:text-sky-300 transition truncate">
                      {item.title}
                    </h3>
                    {item.badge && (
                      <span className={`text-[9px] px-1.5 py-0.2 rounded font-extrabold uppercase tracking-wider ${
                        item.badge === 'LIVE'
                          ? 'bg-rose-500/20 text-rose-400 border border-rose-500/40 animate-pulse'
                          : 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/40'
                      }`}>
                        {item.badge}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-400 truncate mt-0.5">{item.subtitle}</p>
                </div>
              </div>

              {/* Progress Ring or Right Arrow matching Screen 4 */}
              <div className="flex items-center gap-3 shrink-0 ml-3">
                {item.progress !== undefined ? (
                  <div className="relative w-11 h-11 flex items-center justify-center">
                    <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                      <path
                        className="text-slate-800"
                        strokeWidth="3.5"
                        stroke="currentColor"
                        fill="none"
                        d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                      />
                      <path
                        className={item.progress >= 70 ? 'text-emerald-400' : item.progress >= 50 ? 'text-sky-400' : 'text-amber-400'}
                        strokeDasharray={`${item.progress}, 100`}
                        strokeWidth="3.5"
                        strokeLinecap="round"
                        stroke="currentColor"
                        fill="none"
                        d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                      />
                    </svg>
                    <span className="absolute text-[10px] font-black text-slate-200">{item.progress}%</span>
                  </div>
                ) : (
                  <div className="h-8 w-8 rounded-full bg-slate-800/80 flex items-center justify-center text-slate-400 group-hover:text-white group-hover:bg-indigo-600 transition">
                    <ChevronRight className="h-4 w-4" />
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
