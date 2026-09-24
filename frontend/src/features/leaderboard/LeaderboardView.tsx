import React from 'react';
import { Trophy } from 'lucide-react';

interface LeaderboardViewProps {
  userName: string;
}

export const LeaderboardView: React.FC<LeaderboardViewProps> = ({ userName }) => {
  const leaders = [
    { rank: 1, name: 'David Zhang', xp: 1420, score: 380, time: '18m 42s' },
    { rank: 2, name: 'Sarah Connor', xp: 1310, score: 360, time: '21m 15s' },
    { rank: 3, name: `${userName} (You)`, xp: 1240, score: 340, time: '23m 05s' },
    { rank: 4, name: 'Rohan Sharma', xp: 980, score: 290, time: '28m 40s' },
  ];

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-4">
        <h2 className="text-base font-bold text-white flex items-center gap-2">
          <Trophy className="h-5 w-5 text-amber-400" /> PlacementForge Weekly Global Arena
        </h2>
        <div className="space-y-2">
          {leaders.map((p) => (
            <div
              key={p.rank}
              className={`p-3.5 rounded-xl border flex items-center justify-between text-xs ${
                p.name.includes('(You)')
                  ? 'bg-indigo-950/40 border-indigo-500/60 font-bold'
                  : 'bg-slate-950 border-slate-800 text-slate-300'
              }`}
            >
              <div className="flex items-center gap-3">
                <span
                  className={`h-6 w-6 rounded-full flex items-center justify-center font-black ${
                    p.rank === 1
                      ? 'bg-amber-400 text-slate-950'
                      : p.rank === 2
                      ? 'bg-slate-300 text-slate-950'
                      : p.rank === 3
                      ? 'bg-amber-700 text-white'
                      : 'text-slate-500'
                  }`}
                >
                  {p.rank}
                </span>
                <span>{p.name}</span>
              </div>
              <div className="flex gap-4 text-[11px] font-mono">
                <span className="text-emerald-400">{p.score} pts</span>
                <span className="text-slate-400">{p.time}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
