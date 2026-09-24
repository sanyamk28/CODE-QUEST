import React from 'react';
import { Check } from 'lucide-react';
import { McqQuestion } from '../../types';

interface McqViewProps {
  mcqList: McqQuestion[];
  currentMcqIdx: number;
  selectedOption: string | null;
  mcqSubmitted: boolean;
  onSelectOption: (option: string) => void;
  onSubmitAnswer: () => void;
  onNextQuestion: () => void;
  onPrevQuestion: () => void;
}

export const McqView: React.FC<McqViewProps> = ({
  mcqList,
  currentMcqIdx,
  selectedOption,
  mcqSubmitted,
  onSelectOption,
  onSubmitAnswer,
  onNextQuestion,
  onPrevQuestion,
}) => {
  const currentMcq = mcqList[currentMcqIdx];
  if (!currentMcq) return null;

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="rounded-2xl bg-slate-900/80 border border-slate-800 p-6 space-y-6">
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div>
            <span className="text-[10px] font-bold text-sky-400 uppercase tracking-wider">{currentMcq.topic}</span>
            <h2 className="text-base font-bold text-white mt-1">
              Question {currentMcqIdx + 1} of {mcqList.length}
            </h2>
          </div>
          <span className="text-xs font-bold px-3 py-1 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
            +10 XP
          </span>
        </div>

        <p className="text-sm font-semibold text-slate-200 leading-relaxed">{currentMcq.question}</p>

        <div className="space-y-2.5">
          {currentMcq.options.map((opt, i) => {
            const letter = ['A', 'B', 'C', 'D'][i];
            const isSelected = selectedOption === letter;
            const isCorrect = letter === currentMcq.answer;
            let btnStyle = 'bg-slate-950/60 border-slate-800 text-slate-300 hover:bg-slate-800/60';
            if (mcqSubmitted) {
              if (isCorrect) btnStyle = 'bg-emerald-950/40 border-emerald-600 text-emerald-300';
              else if (isSelected && !isCorrect) btnStyle = 'bg-rose-950/40 border-rose-600 text-rose-300';
            } else if (isSelected) {
              btnStyle = 'bg-indigo-950/60 border-indigo-500 text-white';
            }

            return (
              <button
                key={letter}
                onClick={() => !mcqSubmitted && onSelectOption(letter)}
                className={`w-full p-3.5 rounded-xl border text-left text-xs font-medium transition flex items-center justify-between ${btnStyle}`}
              >
                <div className="flex items-center gap-3">
                  <span className="h-6 w-6 rounded-lg bg-slate-800 flex items-center justify-center font-bold font-mono text-xs">
                    {letter}
                  </span>
                  <span>{opt}</span>
                </div>
                {mcqSubmitted && isCorrect && <Check className="h-4 w-4 text-emerald-400" />}
              </button>
            );
          })}
        </div>

        {mcqSubmitted && (
          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 text-xs space-y-1">
            <div className="font-bold text-emerald-400">Explanation:</div>
            <p className="text-slate-300">{currentMcq.explanation}</p>
          </div>
        )}

        <div className="flex justify-between items-center pt-2">
          <button
            onClick={onPrevQuestion}
            disabled={currentMcqIdx === 0}
            className="px-4 py-2 rounded-xl bg-slate-800 text-xs font-semibold disabled:opacity-40"
          >
            Previous
          </button>
          {!mcqSubmitted ? (
            <button
              onClick={onSubmitAnswer}
              disabled={!selectedOption}
              className="px-6 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 font-semibold text-xs text-white disabled:opacity-50"
            >
              Submit Answer
            </button>
          ) : (
            <button
              onClick={onNextQuestion}
              className="px-6 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 font-semibold text-xs text-white"
            >
              Next Question ➔
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
