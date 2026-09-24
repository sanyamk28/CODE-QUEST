import React from 'react';
import { ActiveTabType } from '../../types';

interface AssessmentsViewProps {
  onLaunchAssessment: (tab: ActiveTabType) => void;
}

export const AssessmentsView: React.FC<AssessmentsViewProps> = ({ onLaunchAssessment }) => {
  const bundles = [
    { title: 'TCS NQT Full Benchmark Test', duration: '60 mins', type: 'MCQ + SQL + Coding', questions: 25 },
    { title: 'Amazon SDE-1 Assessment Pattern', duration: '90 mins', type: '2 DSA Coding + 1 System Scenario', questions: 3 },
    { title: 'Google Core Technical Simulation', duration: '75 mins', type: 'Algorithms & Scale Design', questions: 4 },
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {bundles.map((ass, i) => (
          <div key={i} className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-4">
            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
              {ass.type}
            </span>
            <h3 className="text-base font-bold text-white">{ass.title}</h3>
            <div className="text-xs text-slate-400">
              Duration: {ass.duration} | {ass.questions} Questions
            </div>
            <button
              onClick={() => onLaunchAssessment('arena')}
              className="w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-md shadow-indigo-600/30"
            >
              Launch Assessment ➔
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};
