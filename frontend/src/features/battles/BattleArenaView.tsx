import React from 'react';
import {
  Swords, Zap, Trophy, KeyRound, ArrowRight, RefreshCw, AlertCircle, Terminal, Play, CheckCircle2, Award
} from 'lucide-react';

interface BattleArenaViewProps {
  inBattle: boolean;
  battleStatus: 'idle' | 'lobby' | 'countdown' | 'active' | 'finished';
  battleDifficulty: 'Easy' | 'Medium' | 'Hard';
  battleQuickMatching: boolean;
  battleJoinInput: string;
  battleRoomCode: string;
  battleProblem: any;
  battleCode: string;
  battleCountdown: number;
  battleTimer: number;
  battleWinner: { name: string; isYou: boolean; execution_time?: number } | null;
  opponentTelemetry: {
    lines: number;
    charCount: number;
    isTyping: boolean;
    testsPassed: number;
    totalTests: number;
    status: string;
  };
  battlePlayers: Array<{ user_id: string; name: string; hasPassed: boolean; score: number }>;
  battleError: string | null;
  onSetDifficulty: (diff: 'Easy' | 'Medium' | 'Hard') => void;
  onQuickMatch: () => void;
  onCreateCustomRoom: () => void;
  onJoinInput: (code: string) => void;
  onJoinRoom: () => void;
  onCodeChange: (code: string) => void;
  onSubmitBattleCode: () => void;
  onLeaveBattle: () => void;
  onClearError: () => void;
}

export const BattleArenaView: React.FC<BattleArenaViewProps> = ({
  inBattle,
  battleStatus,
  battleDifficulty,
  battleQuickMatching,
  battleJoinInput,
  battleRoomCode,
  battleProblem,
  battleCode,
  battleCountdown,
  battleTimer,
  battleWinner,
  opponentTelemetry,
  battlePlayers,
  battleError,
  onSetDifficulty,
  onQuickMatch,
  onCreateCustomRoom,
  onJoinInput,
  onJoinRoom,
  onCodeChange,
  onSubmitBattleCode,
  onLeaveBattle,
  onClearError,
}) => {
  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {battleError && (
        <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-xs text-rose-300 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertCircle className="h-4 w-4 text-rose-400 shrink-0" />
            <span>{battleError}</span>
          </div>
          <button onClick={onClearError} className="text-slate-400 hover:text-white text-xs">
            ✕
          </button>
        </div>
      )}

      {/* LOBBY / MATCHMAKING */}
      {!inBattle ? (
        <div className="space-y-6">
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-[#0d1326] to-[#0a0f1d] border border-slate-800 p-8 text-center space-y-6 shadow-2xl">
            <div className="relative z-10 space-y-4 max-w-2xl mx-auto">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20 text-xs font-bold tracking-wide">
                <Swords className="h-3.5 w-3.5 animate-pulse" /> Real-Time 1v1 Synchronized Code Duel
              </div>
              <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
                Code Battle{' '}
                <span className="bg-gradient-to-r from-amber-400 via-orange-400 to-rose-400 bg-clip-text text-transparent">
                  Live Arena
                </span>
              </h2>
              <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
                Go head-to-head against peer duelists in synchronized dual split-screens. Same algorithmic problem, live keystroke & line telemetry, atomic Redis SETNX winner locking.
              </p>
            </div>

            <div className="relative z-10 p-6 rounded-2xl bg-slate-950/70 border border-slate-800 max-w-xl mx-auto space-y-4">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-400 font-medium">Select Difficulty:</span>
                <div className="flex gap-1.5">
                  {(['Easy', 'Medium', 'Hard'] as const).map((diff) => (
                    <button
                      key={diff}
                      onClick={() => onSetDifficulty(diff)}
                      className={`px-3 py-1 rounded-lg text-xs font-bold transition ${
                        battleDifficulty === diff
                          ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
                          : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
                      }`}
                    >
                      {diff}
                    </button>
                  ))}
                </div>
              </div>

              <button
                onClick={onQuickMatch}
                disabled={battleQuickMatching}
                className="w-full py-3.5 rounded-xl bg-gradient-to-r from-amber-500 via-orange-500 to-rose-600 hover:from-amber-400 hover:to-rose-500 text-white font-black text-sm shadow-xl shadow-amber-500/25 transition flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {battleQuickMatching ? (
                  <>
                    <RefreshCw className="h-4 w-4 animate-spin text-white" />
                    <span>Searching for waiting duelist...</span>
                  </>
                ) : (
                  <>
                    <Zap className="h-4 w-4 text-amber-200 fill-amber-200" />
                    <span>⚡ Quick Match (1-Click Auto-Pair)</span>
                    <ArrowRight className="h-4 w-4" />
                  </>
                )}
              </button>
            </div>

            <div className="relative z-10 grid grid-cols-1 md:grid-cols-2 gap-4 max-w-2xl mx-auto text-left">
              <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800/80 space-y-3">
                <div className="flex items-center gap-2 text-xs font-bold text-amber-400">
                  <Trophy className="h-4 w-4" /> Create Private Room
                </div>
                <p className="text-[11px] text-slate-400">
                  Generate a 6-character private room code to challenge a friend or peer.
                </p>
                <button
                  onClick={onCreateCustomRoom}
                  className="w-full py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs border border-slate-700 transition flex items-center justify-center gap-1.5"
                >
                  Generate Duel Room ➔
                </button>
              </div>

              <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800/80 space-y-3">
                <div className="flex items-center gap-2 text-xs font-bold text-sky-400">
                  <KeyRound className="h-4 w-4" /> Join with Room Code
                </div>
                <p className="text-[11px] text-slate-400">Enter a 6-character room code to enter the arena.</p>
                <div className="flex gap-2">
                  <input
                    type="text"
                    maxLength={6}
                    value={battleJoinInput}
                    onChange={(e) => onJoinInput(e.target.value.toUpperCase())}
                    placeholder="e.g. 8X42LK"
                    className="w-full px-3 py-1.5 bg-slate-950 border border-slate-800 rounded-xl text-xs font-mono uppercase tracking-widest text-center text-amber-300 outline-none"
                  />
                  <button
                    onClick={onJoinRoom}
                    disabled={battleJoinInput.length < 4}
                    className="px-4 py-1.5 rounded-xl bg-sky-600 hover:bg-sky-500 font-bold text-xs text-white disabled:opacity-40"
                  >
                    Join
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* ACTIVE BATTLE ARENA */
        <div className="space-y-4">
          <div className="bg-[#0b101e] border border-slate-800 rounded-2xl p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="px-2.5 py-1 rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/30 text-xs font-mono font-bold">
                ROOM: {battleRoomCode}
              </span>
              <span className="text-xs text-slate-300 font-bold">
                {battleProblem?.title || 'Solving Live Challenge...'}
              </span>
            </div>

            <div className="flex items-center gap-4">
              <div className="text-xs font-mono font-bold text-amber-400">
                ⏱️ {Math.floor(battleTimer / 60)}:{(battleTimer % 60).toString().padStart(2, '0')}
              </div>
              <button
                onClick={onLeaveBattle}
                className="px-3 py-1 rounded-lg bg-rose-950/40 text-rose-300 border border-rose-800/40 text-xs font-semibold hover:bg-rose-900/50"
              >
                Leave Room
              </button>
            </div>
          </div>

          {/* Winner Banner */}
          {battleWinner && (
            <div className="p-6 rounded-2xl bg-gradient-to-r from-amber-500/20 via-orange-500/20 to-amber-500/20 border border-amber-500/50 text-center space-y-2 shadow-2xl">
              <Award className="h-10 w-10 text-amber-400 mx-auto animate-bounce" />
              <h2 className="text-xl font-black text-white">
                {battleWinner.isYou ? '🏆 VICTORY! You won the Duel!' : `⚔️ Duel Finished! Winner: ${battleWinner.name}`}
              </h2>
              <p className="text-xs text-slate-300">
                {battleWinner.isYou ? '+100 XP awarded to your profile!' : 'Great effort! Review solution and rematch.'}
              </p>
            </div>
          )}

          {/* Split Screen Duel */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 h-[600px]">
            {/* Player Editor */}
            <div className="rounded-2xl bg-slate-900/90 border border-slate-800 flex flex-col overflow-hidden">
              <div className="bg-[#0b101e] px-4 py-2 border-b border-slate-800 flex items-center justify-between">
                <span className="text-xs font-mono font-bold text-emerald-400 flex items-center gap-1.5">
                  <Terminal className="h-3.5 w-3.5" /> Your Workspace
                </span>
                <button
                  onClick={onSubmitBattleCode}
                  className="px-4 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-md shadow-emerald-600/30"
                >
                  <Play className="h-3 w-3 fill-white" /> Submit Solution
                </button>
              </div>
              <textarea
                value={battleCode}
                onChange={(e) => onCodeChange(e.target.value)}
                className="flex-1 w-full bg-[#070a13] p-4 text-xs font-mono text-emerald-200 outline-none resize-none leading-relaxed"
                spellCheck={false}
              />
            </div>

            {/* Opponent Telemetry Screen */}
            <div className="rounded-2xl bg-slate-900/90 border border-slate-800 flex flex-col overflow-hidden">
              <div className="bg-[#0b101e] px-4 py-2 border-b border-slate-800 flex items-center justify-between">
                <span className="text-xs font-mono font-bold text-rose-400">⚔️ Opponent Live Telemetry</span>
                <span className="text-[11px] text-slate-400 font-mono">
                  {opponentTelemetry.isTyping ? '⚡ Typing...' : 'Idle'}
                </span>
              </div>
              <div className="flex-1 bg-[#070a13] p-6 flex flex-col justify-center items-center space-y-6">
                <div className="grid grid-cols-2 gap-4 w-full max-w-sm">
                  <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 text-center">
                    <div className="text-2xl font-black font-mono text-amber-400">{opponentTelemetry.lines}</div>
                    <div className="text-[10px] text-slate-500 uppercase font-bold">Lines Written</div>
                  </div>
                  <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 text-center">
                    <div className="text-2xl font-black font-mono text-sky-400">{opponentTelemetry.charCount}</div>
                    <div className="text-[10px] text-slate-500 uppercase font-bold">Characters</div>
                  </div>
                </div>
                <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 w-full max-w-sm text-center space-y-1">
                  <div className="text-xs font-bold text-slate-300">Test Cases Passed:</div>
                  <div className="text-lg font-bold font-mono text-emerald-400">
                    {opponentTelemetry.testsPassed} / {opponentTelemetry.totalTests || 3}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
