import React, { useState, useEffect } from 'react';
import {
  Swords,
  Timer,
  Play,
  Send,
  RotateCcw,
  Sparkles,
  Zap,
  Users,
  Copy,
  CheckCircle2,
  AlertCircle,
  FileCode,
  Flame,
  Award,
  RefreshCw,
  Trophy
} from 'lucide-react';

const OPPONENTS = [
  { name: 'Aditya Singh', college: 'IIT Roorkee', level: 6, avatar: 'AS' },
  { name: 'Priya Sharma', college: 'IIT Delhi', level: 7, avatar: 'PS' },
  { name: 'Rahul Verma', college: 'NIT Trichy', level: 5, avatar: 'RV' },
];

export const BattleArenaView: React.FC = () => {
  const [userCode, setUserCode] = useState(
`class Solution:
    def maxSubArray(self, nums: List[int]) -> int:
        cur_sum = 0
        max_sum = nums[0]
        for n in nums:
            cur_sum = max(n, cur_sum + n)
            max_sum = max(max_sum, cur_sum)
        return max_sum`
  );

  const [opponentIdx, setOpponentIdx] = useState(0);
  const [secondsLeft, setSecondsLeft] = useState(754); // 00:12:34
  const [userLines, setUserLines] = useState(8);
  const [opponentLines, setOpponentLines] = useState(5);
  const [userTestsPassed, setUserTestsPassed] = useState(3);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isBattleWon, setIsBattleWon] = useState(false);
  const [submissionFeedback, setSubmissionFeedback] = useState<string | null>(null);
  const [language, setLanguage] = useState('Python3');

  const opponent = OPPONENTS[opponentIdx];

  // Timer and opponent line generator
  useEffect(() => {
    const timerInterval = setInterval(() => {
      setSecondsLeft((s) => (s > 0 ? s - 1 : 0));
    }, 1000);

    const opponentInterval = setInterval(() => {
      if (!isBattleWon) {
        setOpponentLines((prev) => Math.min(prev + 1, 14));
      }
    }, 4500);

    return () => {
      clearInterval(timerInterval);
      clearInterval(opponentInterval);
    };
  }, [isBattleWon]);

  const formatTimer = (totalSecs: number) => {
    const mins = Math.floor(totalSecs / 60);
    const secs = totalSecs % 60;
    return `00:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleRun = () => {
    setUserLines(userCode.split('\n').length);
    setUserTestsPassed(5);
    setSubmissionFeedback('Passed 5/10 Test Suites • Runtime: 34ms');
  };

  const handleSubmit = () => {
    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      setUserTestsPassed(10);
      setIsBattleWon(true);
      setSubmissionFeedback('🏆 All 10/10 Test Cases Passed! You Won The Battle (+50 XP)!');
    }, 800);
  };

  const handleNextBattle = () => {
    setIsBattleWon(false);
    setSubmissionFeedback(null);
    setOpponentIdx((prev) => (prev + 1) % OPPONENTS.length);
    setSecondsLeft(900);
    setOpponentLines(2);
    setUserCode(
`class Solution:
    def lengthOfLongestSubstring(self, s: str) -> int:
        # Write your code here
        char_set = set()
        left = 0
        res = 0
        for right in range(len(s)):
            while s[right] in char_set:
                char_set.remove(s[left])
                left += 1
            char_set.add(s[right])
            res = max(res, right - left + 1)
        return res`
    );
  };

  return (
    <div className="space-y-4 max-w-5xl mx-auto pb-6">
      {/* Header Matchup Banner matching Screen 7 */}
      <div className="bg-[#0b101e] border border-slate-800/80 rounded-3xl p-4 sm:p-5 shadow-xl flex items-center justify-between gap-2">
        {/* Player 1 (You) */}
        <div className="flex items-center gap-2.5 sm:gap-3">
          <div className="h-10 sm:h-12 w-10 sm:w-12 rounded-full bg-gradient-to-tr from-sky-500 to-indigo-600 flex items-center justify-center font-bold text-xs sm:text-sm text-white shadow ring-2 ring-indigo-500/30">
            SK
          </div>
          <div>
            <div className="text-xs sm:text-sm font-black text-white flex items-center gap-1">
              <span>Sanyam (You)</span>
            </div>
            <div className="text-[10px] sm:text-xs text-slate-400 font-medium">Level 5 • 1,200 XP</div>
          </div>
        </div>

        {/* Center: VS Badge & Timer matching Screen 7 */}
        <div className="flex flex-col items-center">
          <div className="flex items-center gap-1.5">
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-300 border border-amber-500/20">
              Medium
            </span>
            <span className="text-[10px] font-mono text-amber-400 font-bold">+50 XP</span>
          </div>
          <div className="flex items-center gap-1.5 mt-1 px-3 py-1 rounded-xl bg-[#0e1424] border border-slate-800 text-xs font-mono font-bold text-rose-400">
            <Timer className="h-3.5 w-3.5" />
            <span>{formatTimer(secondsLeft)}</span>
          </div>
        </div>

        {/* Player 2 (Opponent) */}
        <div className="flex items-center gap-2.5 sm:gap-3">
          <div className="text-right">
            <div className="text-xs sm:text-sm font-black text-white">{opponent.name}</div>
            <div className="text-[10px] sm:text-xs text-slate-400 font-medium">Level {opponent.level} • {opponent.college}</div>
          </div>
          <div className="h-10 sm:h-12 w-10 sm:w-12 rounded-full bg-gradient-to-tr from-rose-500 to-amber-600 flex items-center justify-center font-bold text-xs sm:text-sm text-white shadow ring-2 ring-rose-500/30">
            {opponent.avatar}
          </div>
        </div>
      </div>

      {/* Problem Prompt Card matching Screen 7 */}
      <div className="bg-[#0b101e] border border-slate-800/80 rounded-2xl p-4 shadow-md space-y-1.5">
        <div className="flex items-center justify-between">
          <div className="text-[11px] font-bold font-mono text-sky-400"># Live Problem Challenge</div>
          <span className="text-[10px] text-slate-400 font-mono">1v1 Realtime Arena</span>
        </div>
        <p className="text-xs text-slate-300 leading-relaxed">
          Given an integer array <code className="text-sky-300 font-mono">nums</code>, find the subarray with the largest sum, and return its sum. Your solution must run in linear O(N) runtime.
        </p>
      </div>

      {/* Code Editor matching Screen 7 */}
      <div className="bg-[#0b101e] border border-slate-800/80 rounded-2xl overflow-hidden shadow-lg flex flex-col">
        {/* Editor Top Bar with Language Selector */}
        <div className="px-4 py-2 bg-[#090d16] border-b border-slate-800/80 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FileCode className="h-3.5 w-3.5 text-sky-400" />
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              className="bg-[#0e1424] border border-slate-700/60 rounded-lg px-2 py-0.5 text-xs text-slate-200 outline-none font-medium"
            >
              <option value="Python3">Python3</option>
              <option value="JavaScript">JavaScript</option>
              <option value="Java">Java</option>
              <option value="C++">C++</option>
            </select>
          </div>

          <button
            onClick={() => setUserCode(
`class Solution:
    def maxSubArray(self, nums: List[int]) -> int:
        # Write your code here
        pass`
            )}
            className="p-1 rounded text-slate-400 hover:text-white"
            title="Reset code"
          >
            <RotateCcw className="h-3 w-3" />
          </button>
        </div>

        {/* Code Input Area */}
        <div className="p-3 bg-[#070b14] min-h-[190px] flex flex-col">
          <textarea
            value={userCode}
            onChange={(e) => setUserCode(e.target.value)}
            className="w-full flex-1 bg-transparent text-slate-200 resize-none outline-none font-mono text-xs leading-relaxed"
            spellCheck={false}
            rows={7}
          />
        </div>

        {/* Battle Feedback */}
        {submissionFeedback && (
          <div className="px-4 py-2.5 bg-emerald-950/40 border-t border-emerald-800/40 text-xs text-emerald-300 font-semibold flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
              <span>{submissionFeedback}</span>
            </div>
            {isBattleWon && (
              <button
                onClick={handleNextBattle}
                className="px-3 py-1 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow"
              >
                Next Match ➔
              </button>
            )}
          </div>
        )}

        {/* Action Buttons: Run & Submit */}
        <div className="p-3 bg-[#090d16] border-t border-slate-800/80 grid grid-cols-2 gap-2">
          <button
            onClick={handleRun}
            className="py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold flex items-center justify-center gap-2 transition border border-slate-700"
          >
            <Play className="h-3.5 w-3.5 fill-slate-200" />
            <span>Run Tests</span>
          </button>
          <button
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="py-2.5 px-4 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-xs font-bold shadow-md shadow-indigo-600/30 flex items-center justify-center gap-2 transition"
          >
            <Send className="h-3.5 w-3.5" />
            <span>{isSubmitting ? 'Evaluating...' : 'Submit Solution'}</span>
          </button>
        </div>

        {/* Opponent Status Ticker matching Screen 7 */}
        <div className="px-4 py-2 bg-[#060a12] border-t border-slate-800/60 flex items-center justify-between text-[11px] text-slate-400">
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-rose-500 animate-pulse" />
            <span className="italic">{opponent.name} is typing...</span>
          </div>
          <span className="font-mono text-[10px] text-slate-500">{opponentLines} lines written</span>
        </div>
      </div>
    </div>
  );
};
