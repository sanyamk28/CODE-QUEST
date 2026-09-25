import React, { useState } from 'react';
import { Trophy, Flame, Swords, Code2, Sparkles, Medal, Crown, Search } from 'lucide-react';

interface Candidate {
  rank: number;
  name: string;
  college: string;
  xp: string;
  avatar: string;
  isYou?: boolean;
}

const LEADERBOARDS_DATA: Record<'Global' | 'College' | 'Friends', { podium: any[]; list: Candidate[] }> = {
  Global: {
    podium: [
      { rank: 2, name: 'Aditi', xp: '2,340 XP', avatar: 'AD', color: 'from-slate-400 to-slate-600', ringColor: 'border-slate-400' },
      { rank: 1, name: 'Sanyam', xp: '2,500 XP', avatar: 'SK', isYou: true, color: 'from-amber-400 to-yellow-600', ringColor: 'border-amber-400' },
      { rank: 3, name: 'Rohan', xp: '2,120 XP', avatar: 'RO', color: 'from-amber-600 to-orange-700', ringColor: 'border-amber-600' },
    ],
    list: [
      { rank: 4, name: 'Priya', college: 'IIT Delhi', xp: '1,980 XP', avatar: 'PR' },
      { rank: 5, name: 'Kunal', college: 'BITS Pilani', xp: '1,850 XP', avatar: 'KU' },
      { rank: 6, name: 'Neha', college: 'NIT Trichy', xp: '1,720 XP', avatar: 'NE' },
      { rank: 7, name: 'Arjun', college: 'IIT Bombay', xp: '1,680 XP', avatar: 'AR' },
      { rank: 8, name: 'Ananya', college: 'IIIT Hyderabad', xp: '1,540 XP', avatar: 'AN' },
      { rank: 9, name: 'Vikram', college: 'IIT Roorkee', xp: '1,420 XP', avatar: 'VI' },
      { rank: 10, name: 'Ishita', college: 'DTU Delhi', xp: '1,380 XP', avatar: 'IS' },
    ]
  },
  College: {
    podium: [
      { rank: 2, name: 'Kunal', xp: '1,850 XP', avatar: 'KU', color: 'from-slate-400 to-slate-600', ringColor: 'border-slate-400' },
      { rank: 1, name: 'Sanyam', xp: '2,500 XP', avatar: 'SK', isYou: true, color: 'from-amber-400 to-yellow-600', ringColor: 'border-amber-400' },
      { rank: 3, name: 'Neha', xp: '1,720 XP', avatar: 'NE', color: 'from-amber-600 to-orange-700', ringColor: 'border-amber-600' },
    ],
    list: [
      { rank: 4, name: 'Gaurav', college: 'JIMS Rohini', xp: '1,310 XP', avatar: 'GA' },
      { rank: 5, name: 'Tanvi', college: 'JIMS Rohini', xp: '1,240 XP', avatar: 'TA' },
      { rank: 6, name: 'Mehul', college: 'JIMS Rohini', xp: '1,150 XP', avatar: 'ME' },
      { rank: 7, name: 'Pooja', college: 'JIMS Rohini', xp: '980 XP', avatar: 'PO' }
    ]
  },
  Friends: {
    podium: [
      { rank: 2, name: 'Aditya', xp: '2,200 XP', avatar: 'AD', color: 'from-slate-400 to-slate-600', ringColor: 'border-slate-400' },
      { rank: 1, name: 'Sanyam', xp: '2,500 XP', avatar: 'SK', isYou: true, color: 'from-amber-400 to-yellow-600', ringColor: 'border-amber-400' },
      { rank: 3, name: 'Rohan', xp: '2,120 XP', avatar: 'RO', color: 'from-amber-600 to-orange-700', ringColor: 'border-amber-600' },
    ],
    list: [
      { rank: 4, name: 'Dhruv', college: 'Roommate', xp: '1,640 XP', avatar: 'DH' },
      { rank: 5, name: 'Simran', college: 'Batchmate', xp: '1,490 XP', avatar: 'SI' }
    ]
  }
};

export const LeaderboardView: React.FC = () => {
  const [filter, setFilter] = useState<'Global' | 'College' | 'Friends'>('Global');
  const [searchQuery, setSearchQuery] = useState('');

  const currentBoard = LEADERBOARDS_DATA[filter];

  const filteredList = currentBoard.list.filter(
    (c) =>
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.college.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-5 max-w-2xl mx-auto pb-6">
      {/* Segmented Filter Tabs matching Screen 14: [Global | College | Friends] */}
      <div className="flex items-center justify-between p-1 bg-[#0b101e] border border-slate-800 rounded-2xl">
        {(['Global', 'College', 'Friends'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setFilter(tab)}
            className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all ${
              filter === tab
                ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Top 3 Podium Cards matching Screen 14 */}
      <div className="bg-[#0b101e] border border-slate-800/80 rounded-3xl p-5 shadow-xl">
        <div className="flex items-end justify-center gap-3 pt-4 pb-2">
          {/* Rank 2 */}
          <div className="flex flex-col items-center flex-1">
            <div className="relative mb-2">
              <div className="h-12 w-12 rounded-full bg-slate-800 border-2 border-slate-400 flex items-center justify-center font-bold text-xs text-white shadow-lg">
                {currentBoard.podium[0].avatar}
              </div>
              <span className="absolute -bottom-1 -right-1 h-5 w-5 rounded-full bg-slate-600 border border-slate-400 text-white flex items-center justify-center font-bold text-[10px]">
                2
              </span>
            </div>
            <span className="text-xs font-bold text-white truncate max-w-[80px]">
              {currentBoard.podium[0].name}
            </span>
            <span className="text-[10px] font-mono text-slate-400 mt-0.5">
              {currentBoard.podium[0].xp}
            </span>
            <div className="w-full h-16 bg-[#0e1424] border border-slate-800 rounded-t-2xl mt-3 flex items-center justify-center text-slate-400 font-bold text-xs">
              🥈 2nd
            </div>
          </div>

          {/* Rank 1 (Sanyam - Highest Center) */}
          <div className="flex flex-col items-center flex-1">
            <div className="relative mb-2">
              <Crown className="h-5 w-5 text-amber-400 absolute -top-5 left-1/2 -translate-x-1/2 animate-bounce" />
              <div className="h-16 w-16 rounded-full bg-gradient-to-tr from-amber-400 to-yellow-600 border-2 border-amber-300 p-0.5 shadow-xl shadow-amber-500/20">
                <div className="h-full w-full bg-[#080d19] rounded-full flex items-center justify-center font-black text-sm text-amber-300">
                  {currentBoard.podium[1].avatar}
                </div>
              </div>
              <span className="absolute -bottom-1 -right-1 h-6 w-6 rounded-full bg-amber-500 border border-amber-300 text-slate-950 flex items-center justify-center font-black text-xs shadow-md">
                1
              </span>
            </div>
            <div className="flex items-center gap-1">
              <span className="text-xs font-black text-white">{currentBoard.podium[1].name}</span>
              <span className="text-[9px] px-1 py-0.2 rounded bg-sky-500/20 text-sky-300 font-bold">You</span>
            </div>
            <span className="text-[10px] font-mono text-amber-400 font-bold mt-0.5">
              {currentBoard.podium[1].xp}
            </span>
            <div className="w-full h-24 bg-gradient-to-t from-amber-500/20 to-[#0e1424] border border-amber-500/40 rounded-t-2xl mt-3 flex items-center justify-center text-amber-300 font-bold text-xs shadow-lg shadow-amber-500/10">
              🥇 1st
            </div>
          </div>

          {/* Rank 3 */}
          <div className="flex flex-col items-center flex-1">
            <div className="relative mb-2">
              <div className="h-12 w-12 rounded-full bg-slate-800 border-2 border-amber-600 flex items-center justify-center font-bold text-xs text-white shadow-lg">
                {currentBoard.podium[2].avatar}
              </div>
              <span className="absolute -bottom-1 -right-1 h-5 w-5 rounded-full bg-amber-800 border border-amber-600 text-white flex items-center justify-center font-bold text-[10px]">
                3
              </span>
            </div>
            <span className="text-xs font-bold text-white truncate max-w-[80px]">
              {currentBoard.podium[2].name}
            </span>
            <span className="text-[10px] font-mono text-slate-400 mt-0.5">
              {currentBoard.podium[2].xp}
            </span>
            <div className="w-full h-12 bg-[#0e1424] border border-slate-800 rounded-t-2xl mt-3 flex items-center justify-center text-amber-600 font-bold text-xs">
              🥉 3rd
            </div>
          </div>
        </div>
      </div>

      {/* Search Filter for Candidates */}
      <div className="relative">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
        <input
          type="text"
          placeholder="Filter ranked students by name or university..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full bg-[#0b101e] border border-slate-800 rounded-xl pl-10 pr-4 py-2 text-xs text-slate-200 placeholder:text-slate-500 outline-none focus:border-indigo-500 transition"
        />
      </div>

      {/* Ranked List matching Screen 14 */}
      <div className="bg-[#0b101e] border border-slate-800/80 rounded-3xl p-4 shadow-xl space-y-2">
        {filteredList.map((item) => (
          <div
            key={item.rank}
            className="flex items-center justify-between p-3 rounded-2xl bg-[#0e1424] border border-slate-800/60 hover:border-slate-700 transition"
          >
            <div className="flex items-center gap-3">
              <span className="w-6 text-center font-bold font-mono text-xs text-slate-400">
                {item.rank}
              </span>
              <div className="h-8 w-8 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center font-bold text-[10px] text-sky-300">
                {item.avatar}
              </div>
              <div>
                <span className="text-xs font-bold text-white block">{item.name}</span>
                <span className="text-[10px] text-slate-400">{item.college}</span>
              </div>
            </div>

            <span className="text-xs font-bold font-mono text-sky-400">
              {item.xp}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};
