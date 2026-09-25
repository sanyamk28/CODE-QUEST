import React, { useState } from 'react';
import {
  Puzzle,
  Lightbulb,
  Eye,
  EyeOff,
  Sparkles,
  CheckCircle2,
  Check,
  ChevronRight,
  HelpCircle,
  Award
} from 'lucide-react';

interface BrainteaserItem {
  id: number;
  title: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  category: string;
  desc: string;
  hints: string[];
  solution: string;
}

const PUZZLES: BrainteaserItem[] = [
  {
    id: 1,
    title: 'The 25 Horses Puzzle',
    difficulty: 'Medium',
    category: 'Logic & Sorting',
    desc: 'There are 25 horses and a track that allows only 5 horses to race at a time. What is the minimum number of races needed to determine the top 3 fastest horses without any stopwatch?',
    hints: [
      'Start with 5 initial heats containing 5 horses each.',
      'Race the 5 winners against each other in Race 6.',
      'Carefully eliminate horses that are mathematically excluded from being in the top 3.'
    ],
    solution: 'Answer: 7 races.\n1. Run 5 races (5 horses each) to rank horses inside each group (A1>A2>A3>A4>A5, etc.).\n2. Race 6: Race the 5 winners (A1, B1, C1, D1, E1). Suppose order is A1 > B1 > C1 > D1 > E1. A1 is guaranteed the overall 1st fastest horse.\n3. Race 7: Only 5 horses have any remaining probability of taking 2nd or 3rd: A2, A3, B1, B2, and C1. The top 2 in Race 7 become the overall 2nd and 3rd fastest horses.'
  },
  {
    id: 2,
    title: 'The Burning Ropes (45 Minutes)',
    difficulty: 'Easy',
    category: 'Measurement',
    desc: 'You have two ropes, each of which takes exactly 60 minutes to burn from end to end. The ropes burn at non-uniform, irregular rates. How can you measure exactly 45 minutes using only these two ropes and a lighter?',
    hints: [
      'Lighting a rope from both ends causes it to burn out in half the time (30 minutes).',
      'Start both ropes simultaneously, but with different configurations.'
    ],
    solution: 'Answer:\n1. At time t = 0, light Rope 1 from BOTH ends, and light Rope 2 from ONE end only.\n2. When Rope 1 completely burns out, exactly 30 minutes have passed. At this exact moment, Rope 2 has exactly 30 minutes of burn time remaining.\n3. Immediately light the OTHER end of Rope 2. Because it is now burning from both ends, its remaining 30 minutes will burn out in exactly 15 minutes.\n4. Total time measured: 30 + 15 = 45 minutes.'
  },
  {
    id: 3,
    title: 'The Heavy Coin in 8 Coins',
    difficulty: 'Easy',
    category: 'Binary & Ternary Search',
    desc: 'You have 8 coins that look identical, but 1 of them is slightly heavier than the other 7. You have a balance scale. What is the minimum number of weighings needed to guarantee finding the heavy coin?',
    hints: [
      'Rather than dividing into 2 equal halves, divide into 3 groups.',
      'Ternary partitioning: 3, 3, and 2.'
    ],
    solution: 'Answer: 2 weighings.\n1. Weighing 1: Put 3 coins on the left and 3 on the right, leaving 2 aside. If they balance, the heavy coin is one of the 2 left aside. If one side tilts down, the heavy coin is in that group of 3.\n2. Weighing 2: Take the group of 2 or 3. If group of 2, weigh 1 against 1. If group of 3, weigh 1 against 1, leaving 1 aside. You identify the heavy coin in just 2 weighings.'
  },
  {
    id: 4,
    title: 'The Monty Hall Paradox',
    difficulty: 'Medium',
    category: 'Probability',
    desc: 'You are on a game show with 3 closed doors: behind one is a sports car, and behind the other two are goats. You pick Door 1. The host (who knows what is behind every door) opens Door 3 to reveal a goat. He asks: "Do you want to switch to Door 2?" Should you switch, stay, or does it make no difference?',
    hints: [
      'Calculate the initial probability that your first pick was wrong.',
      'The host is forced to reveal a goat, preserving the 2/3 weight on the remaining door.'
    ],
    solution: 'Answer: You should ALWAYS switch. Your odds double from 1/3 to 2/3.\n- When you first chose Door 1, there was a 1/3 chance the car was there and a 2/3 chance it was behind Doors 2 or 3.\n- Because Monty Hall knows where the car is and always reveals a goat, switching captures the entire 2/3 probability distributed across the unopened alternate door.'
  },
  {
    id: 5,
    title: 'Poisoned Wine & 10 Test Mice',
    difficulty: 'Hard',
    category: 'Binary Encoding',
    desc: 'You have 1,000 bottles of wine. Exactly 1 bottle is poisoned. The poison takes 24 hours to kill a mouse. You have 10 mice and exactly 24 hours to identify the poisoned bottle. How do you do it in a single round?',
    hints: [
      'Notice that 2¹⁰ = 1,024, which is greater than 1,000.',
      'Assign each bottle a 10-bit binary index from 1 to 1000.'
    ],
    solution: 'Answer: Label the bottles in binary from 1 (0000000001) to 1000 (1111101000). Label the 10 mice from bit 0 to bit 9. For each bottle, if the k-th bit is 1, feed a drop from that bottle to mouse k. After 24 hours, the binary pattern of which mice died yields the exact index of the poisoned bottle.'
  }
];

export const BrainteasersView: React.FC = () => {
  const [selectedIdx, setSelectedIdx] = useState(0);
  const [showSolution, setShowSolution] = useState(false);
  const [revealedHints, setRevealedHints] = useState<Record<number, boolean>>({});
  const [solvedMap, setSolvedMap] = useState<Record<number, boolean>>({});

  const currentP = PUZZLES[selectedIdx];

  const toggleHint = (hintIdx: number) => {
    setRevealedHints((prev) => ({ ...prev, [hintIdx]: !prev[hintIdx] }));
  };

  const handleSelectPuzzle = (idx: number) => {
    setSelectedIdx(idx);
    setShowSolution(false);
    setRevealedHints({});
  };

  const handleToggleSolved = (id: number) => {
    setSolvedMap((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  return (
    <div className="space-y-4 max-w-5xl mx-auto pb-6">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 min-h-[640px]">
        {/* Left Column: Puzzle Directory */}
        <div className="lg:col-span-4 bg-[#0b101e] border border-slate-800/80 rounded-3xl p-4 shadow-lg flex flex-col space-y-2">
          <div className="flex items-center justify-between pb-2 border-b border-slate-800/60 px-1">
            <h2 className="text-xs font-bold uppercase tracking-wider text-sky-400">
              Placement Puzzles ({PUZZLES.length})
            </h2>
            <span className="text-[10px] text-emerald-400 font-mono">
              {Object.values(solvedMap).filter(Boolean).length}/{PUZZLES.length} Solved
            </span>
          </div>

          <div className="space-y-1.5 overflow-y-auto flex-1 scrollbar-thin">
            {PUZZLES.map((p, idx) => {
              const isSelected = selectedIdx === idx;
              const isSolved = !!solvedMap[p.id];

              return (
                <div
                  key={p.id}
                  onClick={() => handleSelectPuzzle(idx)}
                  className={`p-3 rounded-2xl cursor-pointer transition-all flex items-center justify-between ${
                    isSelected
                      ? 'bg-blue-600/20 border border-blue-500/40 text-white shadow-sm'
                      : 'hover:bg-slate-800/40 text-slate-300 border border-transparent'
                  }`}
                >
                  <div className="min-w-0 pr-2">
                    <div className="text-xs font-bold truncate flex items-center gap-1.5">
                      <span>{p.title}</span>
                    </div>
                    <div className="text-[10px] text-slate-400 mt-0.5">
                      {p.category} • {p.difficulty}
                    </div>
                  </div>

                  {isSolved && (
                    <span className="h-5 w-5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 flex items-center justify-center text-[10px] shrink-0">
                      ✓
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: Active Puzzle Details */}
        <div className="lg:col-span-8 bg-[#0b101e] border border-slate-800/80 rounded-3xl p-6 shadow-xl space-y-5 flex flex-col justify-between">
          <div className="space-y-4">
            {/* Header */}
            <div className="pb-3 border-b border-slate-800/80 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="h-9 w-9 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
                  <Puzzle className="h-4 w-4" />
                </div>
                <div>
                  <h1 className="text-sm sm:text-base font-black text-white">{currentP.title}</h1>
                  <span className="text-[10px] font-semibold text-slate-400">
                    {currentP.category} • {currentP.difficulty}
                  </span>
                </div>
              </div>

              <button
                onClick={() => handleToggleSolved(currentP.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                  solvedMap[currentP.id]
                    ? 'bg-emerald-600/20 text-emerald-300 border border-emerald-500/40'
                    : 'bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800'
                }`}
              >
                {solvedMap[currentP.id] ? (
                  <>
                    <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
                    <span>Solved</span>
                  </>
                ) : (
                  <span>Mark as Solved</span>
                )}
              </button>
            </div>

            {/* Problem Statement */}
            <div className="p-4 rounded-2xl bg-[#0e1424] border border-slate-800/80 text-xs sm:text-sm text-slate-200 leading-relaxed font-medium">
              {currentP.desc}
            </div>

            {/* Hints Section */}
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-xs font-bold text-sky-400">
                <Lightbulb className="h-4 w-4" />
                <span>Hints ({currentP.hints.length})</span>
              </div>
              <div className="space-y-1.5">
                {currentP.hints.map((hint, hIdx) => {
                  const isRevealed = !!revealedHints[hIdx];
                  return (
                    <div
                      key={hIdx}
                      onClick={() => toggleHint(hIdx)}
                      className="p-3 rounded-xl bg-[#0a0f1d] border border-slate-800/80 text-xs cursor-pointer hover:border-slate-700 transition flex items-center justify-between"
                    >
                      <span className={isRevealed ? 'text-slate-200' : 'text-slate-500 italic'}>
                        {isRevealed ? hint : `Click to reveal Hint ${hIdx + 1}...`}
                      </span>
                      <span className="text-[10px] font-mono text-sky-400">
                        {isRevealed ? 'Hide' : 'Reveal'}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Solution Disclosure */}
            {showSolution && (
              <div className="p-4 rounded-2xl bg-gradient-to-br from-[#0c1426] to-[#090d18] border border-emerald-500/30 text-xs text-slate-200 space-y-2 animate-fadeIn">
                <div className="flex items-center gap-2 text-emerald-400 font-bold">
                  <Sparkles className="h-4 w-4" />
                  <span>Comprehensive Solution Approach:</span>
                </div>
                <p className="whitespace-pre-line leading-relaxed font-sans text-slate-300">
                  {currentP.solution}
                </p>
              </div>
            )}
          </div>

          {/* Footer Solution Toggle Button */}
          <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between">
            <button
              onClick={() => setShowSolution(!showSolution)}
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-xs font-bold shadow-md shadow-indigo-600/30 flex items-center gap-2 transition"
            >
              {showSolution ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              <span>{showSolution ? 'Hide Solution' : 'Reveal Full Solution'}</span>
            </button>

            {selectedIdx < PUZZLES.length - 1 && (
              <button
                onClick={() => handleSelectPuzzle(selectedIdx + 1)}
                className="text-xs text-sky-400 hover:text-sky-300 font-semibold flex items-center gap-1"
              >
                <span>Next Puzzle</span>
                <ChevronRight className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
