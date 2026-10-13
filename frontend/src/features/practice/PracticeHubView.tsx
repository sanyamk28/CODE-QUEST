import React, { useState, useEffect, useMemo } from 'react';
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
import { getUserActivityStats, calculateProgressPercentages } from '../../services/activityTracker';

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
  const [stats, setStats] = useState(() => getUserActivityStats());

  // Listen for real-time activity updates from anywhere in the app
  useEffect(() => {
    const handleUpdate = () => {
      setStats(getUserActivityStats());
    };
    window.addEventListener('cq_activity_updated', handleUpdate);
    return () => window.removeEventListener('cq_activity_updated', handleUpdate);
  }, []);

  const percentages = useMemo(() => calculateProgressPercentages(stats), [stats]);

  const categories: PracticeCategory[] = [
    {
      id: 'arena',
      title: 'Coding Arena',
      subtitle: `${stats.arenaSolvedCount} problems solved • ${percentages.arenaPct}%`,
      icon: Code2,
      category: 'DSA',
      progress: percentages.arenaPct, // Dynamically computed from real activities, starts at 0%
      totalCount: '450 problems',
      gradient: 'from-blue-600 to-indigo-600',
      glowColor: 'shadow-blue-500/20'
    },
    {
      id: 'sql',
      title: 'SQL Lab',
      subtitle: `${stats.sqlQueriesCount} queries run • ${percentages.sqlPct}%`,
      icon: Database,
      category: 'SQL',
      progress: percentages.sqlPct, // Dynamically computed from real activities, starts at 0%
      totalCount: '120 queries',
      gradient: 'from-cyan-600 to-blue-600',
      glowColor: 'shadow-cyan-500/20'
    },
    {
      id: 'mcqs',
      title: 'CS Fundamentals',
      subtitle: `${stats.mcqsAnsweredCount} topics completed • ${percentages.mcqPct}%`,
      icon: Layers,
      category: 'CS',
      progress: percentages.mcqPct, // Dynamically computed from real activities, starts at 0%
      totalCount: '200 topics',
      gradient: 'from-violet-600 to-purple-600',
      glowColor: 'shadow-purple-500/20'
    },
    {
      id: 'puzzles',
      title: 'Brainteasers',
      subtitle: `${stats.puzzlesSolvedCount} puzzles solved • ${percentages.puzzlePct}%`,
      icon: Puzzle,
      category: 'MCQ',
      progress: percentages.puzzlePct, // Dynamically computed from real activities, starts at 0%
      totalCount: '150 problems',
      gradient: 'from-amber-600 to-orange-600',
      glowColor: 'shadow-amber-500/20'
    },
    {
      id: 'battle',
      title: 'Code Battles',
      subtitle: `${stats.battlesWonCount} battles completed`,
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
      subtitle: `${stats.interviewsDoneCount} mock interviews completed`,
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
      subtitle: `${stats.assessmentsCount} tests completed`,
      icon: CheckSquare,
      category: 'All',
      badge: 'TEST',
      totalCount: 'TCS, Infosys, Accenture',
      gradient: 'from-indigo-600 to-pink-600',
      glowColor: 'shadow-indigo-500/20'
    }
  ];

  const filteredCategories = categories.filter((c) => {
    const matchesFilter = selectedFilter === 'All' || c.category === selectedFilter || c.category === 'All';
    const matchesSearch = c.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          c.subtitle.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  return (
    <div className="space-y-5 max-w-4xl mx-auto pb-6">
      {/* Top Header matching Screen 4 */}
      <div className="space-y-1">
        <h1 className="text-xl sm:text-2xl font-black tracking-tight text-white">Practice</h1>
        <p className="text-xs text-slate-400">Choose a category to improve</p>
      </div>

      {/* Pill Filter Tabs matching Screen 4: All, DSA, SQL, MCQ, CS */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
        {(['All', 'DSA', 'SQL', 'MCQ', 'CS'] as const).map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedFilter(cat)}
            className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all ${
              selectedFilter === cat
                ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
                : 'bg-[#0e1424] text-slate-400 hover:text-white border border-slate-800'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Search Bar matching Screen 4 */}
      <div className="relative">
        <Search className="h-4 w-4 absolute left-3.5 top-3 text-slate-500" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search modules or topics..."
          className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-[#090d16] border border-slate-800 text-xs text-slate-200 outline-none focus:border-indigo-500 transition"
        />
      </div>

      {/* Categories Cards List matching Screen 4 */}
      <div className="space-y-3">
        {filteredCategories.map((item) => {
          const Icon = item.icon;
          return (
            <div
              key={item.id}
              onClick={() => onNavigate(item.id)}
              className="p-4 sm:p-5 rounded-3xl bg-[#090e1c] border border-slate-800/80 hover:border-slate-700 hover:bg-[#0b1224] transition duration-200 cursor-pointer flex items-center justify-between group shadow-lg"
            >
              <div className="flex items-center gap-3.5 min-w-0">
                {/* Rounded Icon Box with gradient & glow */}
                <div className={`h-12 w-12 rounded-2xl bg-gradient-to-tr ${item.gradient} p-[1px] shadow-lg ${item.glowColor} shrink-0`}>
                  <div className="h-full w-full bg-[#080d1a] rounded-[15px] flex items-center justify-center">
                    <Icon className="h-5 w-5 text-white group-hover:scale-110 transition duration-300" />
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
                        className={item.progress >= 70 ? 'text-emerald-400' : item.progress >= 30 ? 'text-sky-400' : 'text-blue-500'}
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
