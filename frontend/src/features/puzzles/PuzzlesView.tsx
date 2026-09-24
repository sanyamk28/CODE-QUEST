import React from 'react';
import { Lock } from 'lucide-react';
import { PuzzleQuestion } from '../../types';

interface PuzzlesViewProps {
  puzzlesList: PuzzleQuestion[];
  selectedPuzzle: PuzzleQuestion;
  unlockedHints: number[];
  puzzleAnswerText: string;
  puzzleChecked: boolean;
  onSelectPuzzle: (puzzle: PuzzleQuestion) => void;
  onUnlockHint: (index: number) => void;
  onAnswerChange: (text: string) => void;
  onVerify: () => void;
}

export const PuzzlesView: React.FC<PuzzlesViewProps> = ({
  puzzlesList,
  selectedPuzzle,
  unlockedHints,
  puzzleAnswerText,
  puzzleChecked,
  onSelectPuzzle,
  onUnlockHint,
  onAnswerChange,
  onVerify,
}) => {
  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {puzzlesList.map((p) => (
          <div
            key={p.id}
            onClick={() => onSelectPuzzle(p)}
            className={`p-5 rounded-2xl border cursor-pointer transition ${
              selectedPuzzle.id === p.id
                ? 'bg-indigo-950/30 border-indigo-500/80 shadow-lg shadow-indigo-500/10'
                : 'bg-slate-900/60 border-slate-800 hover:bg-slate-800/40'
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-purple-500/10 text-purple-400 border border-purple-500/20">
                {p.category}
              </span>
              <span className="text-xs font-bold text-amber-400">+15 XP</span>
            </div>
            <h3 className="font-bold text-sm text-white">{p.title}</h3>
            <p className="text-xs text-slate-400 mt-1 line-clamp-2">{p.desc}</p>
          </div>
        ))}
      </div>

      <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-4">
        <h2 className="text-lg font-bold text-white">{selectedPuzzle.title}</h2>
        <p className="text-xs text-slate-300 leading-relaxed">{selectedPuzzle.desc}</p>

        <div className="space-y-2">
          <div className="text-xs font-bold text-slate-400">Hints:</div>
          {selectedPuzzle.hints.map((h, i) => {
            const isUnlocked = unlockedHints.includes(i);
            return (
              <div key={i} className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-xs">
                {isUnlocked ? (
                  <span className="text-sky-300">💡 Hint {i + 1}: {h}</span>
                ) : (
                  <button
                    onClick={() => onUnlockHint(i)}
                    className="text-slate-400 hover:text-slate-200 flex items-center gap-1.5"
                  >
                    <Lock className="h-3 w-3 text-slate-500" /> Unlock Hint {i + 1} (-2 XP)
                  </button>
                )}
              </div>
            );
          })}
        </div>

        <div className="space-y-2">
          <textarea
            value={puzzleAnswerText}
            onChange={(e) => onAnswerChange(e.target.value)}
            placeholder="Type your logical solution or reasoning here..."
            className="w-full h-24 p-3 rounded-xl bg-[#070a13] border border-slate-800 text-xs text-slate-200 outline-none resize-none font-mono"
          />
          <div className="flex justify-end">
            <button
              onClick={onVerify}
              className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-xs font-semibold text-white shadow-md shadow-indigo-600/30"
            >
              Verify & Reveal Solution
            </button>
          </div>
        </div>

        {puzzleChecked && (
          <div className="p-4 rounded-xl bg-emerald-950/20 border border-emerald-800/40 text-xs space-y-1">
            <div className="font-bold text-emerald-400">Official Solution Walkthrough:</div>
            <p className="text-slate-300 leading-relaxed">{selectedPuzzle.solution}</p>
          </div>
        )}
      </div>
    </div>
  );
};
