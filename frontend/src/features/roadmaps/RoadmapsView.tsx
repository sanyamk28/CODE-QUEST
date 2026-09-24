import React from 'react';
import { BookOpen } from 'lucide-react';

interface RoadmapsViewProps {
  targetRole: string;
}

export const RoadmapsView: React.FC<RoadmapsViewProps> = ({ targetRole }) => {
  const steps = [
    { step: '1. Core Foundations', desc: 'Arrays, Two Pointers, Linked Lists', status: 'completed' },
    { step: '2. Database & SQL Mastery', desc: 'Joins, Window Functions, Transaction Isolation', status: 'completed' },
    { step: '3. Advanced Trees, Heaps & DP', desc: 'Binary Search Trees, Heaps, Graph BFS/DFS', status: 'active' },
    { step: '4. System Design & Scalability', desc: 'Caching, Message Queues, Sharding', status: 'locked' },
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-6">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <BookOpen className="h-5 w-5 text-indigo-400" /> Career Roadmap: {targetRole} Track
          </h2>
          <span className="text-xs font-bold text-emerald-400">68% Completed</span>
        </div>

        <div className="space-y-3">
          {steps.map((m, i) => (
            <div
              key={i}
              className={`p-4 rounded-xl border flex items-center justify-between text-xs ${
                m.status === 'completed'
                  ? 'bg-emerald-950/10 border-emerald-800/30 text-emerald-300'
                  : m.status === 'active'
                  ? 'bg-indigo-950/20 border-indigo-500 text-slate-200'
                  : 'bg-slate-950/40 border-slate-800 text-slate-500'
              }`}
            >
              <div>
                <div className="font-bold text-sm">{m.step}</div>
                <div className="text-[11px] opacity-80">{m.desc}</div>
              </div>
              <span className="font-bold">
                {m.status === 'completed' ? '✓ Completed' : m.status === 'active' ? 'In Progress' : '🔒 Locked'}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
