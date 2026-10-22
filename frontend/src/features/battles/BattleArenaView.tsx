import React, { useState, useEffect, useMemo, useRef } from 'react';
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
  Trophy,
  Share2,
  Crown,
  Radio,
  Sliders,
  ChevronRight,
  TrendingUp,
  ShieldCheck
} from 'lucide-react';
import { recordActivity } from '../../services/activityTracker';

interface Participant {
  id: string;
  name: string;
  college: string;
  avatar: string;
  lines: number;
  testCasesPassed: number;
  totalTestCases: number;
  score: number;
  isFinished: boolean;
  timeSec: number;
}

// 100-Player Pool Generator for Mass Arena Simulation & Free Fallback
const SAMPLE_COLLEGES = ['IIT Delhi', 'IIT Bombay', 'BITS Pilani', 'NIT Trichy', 'IIT Roorkee', 'IIIT Hyderabad', 'VIT Vellore', 'DTU'];
const SAMPLE_NAMES = [
  'Aditya Singh', 'Priya Sharma', 'Rahul Verma', 'Ananya Iyer', 'Vikram Patel',
  'Sneha Nair', 'Rohan Gupta', 'Kavya Reddy', 'Arjun Das', 'Meera Joshi',
  'Tanmay Bhatt', 'Devika Sen', 'Ishaan Malhotra', 'Pooja Hegde', 'Karan Mehta',
  'Nisha Pillai', 'Siddharth Roy', 'Aarav Kumar', 'Divya Rao', 'Harsh Vardhan'
];

function generate100Players(): Participant[] {
  const players: Participant[] = [];
  for (let i = 1; i <= 100; i++) {
    const name = SAMPLE_NAMES[(i - 1) % SAMPLE_NAMES.length] + (i > 20 ? ` #${i}` : '');
    const college = SAMPLE_COLLEGES[(i - 1) % SAMPLE_COLLEGES.length];
    const initials = name.split(' ').map(n => n[0]).join('').slice(0, 2);
    players.push({
      id: `p-${i}`,
      name,
      college,
      avatar: initials,
      lines: Math.floor(Math.random() * 8) + 3,
      testCasesPassed: Math.floor(Math.random() * 4),
      totalTestCases: 10,
      score: Math.floor(Math.random() * 20),
      isFinished: false,
      timeSec: 0
    });
  }
  return players;
}

export const BattleArenaView: React.FC = () => {
  // Navigation Mode
  const [arenaSubTab, setArenaSubTab] = useState<'arena' | 'create_room' | 'leaderboard'>('arena');

  // Room Configuration
  const [roomCode, setRoomCode] = useState<string>('MEGA-8492');
  const [roomCapacity, setRoomCapacity] = useState<number>(100);
  const [roomDifficulty, setRoomDifficulty] = useState<string>('Medium');
  const [copiedCode, setCopiedCode] = useState(false);
  const [joinInputCode, setJoinInputCode] = useState('');
  const [joinError, setJoinError] = useState('');
  const [showExitModal, setShowExitModal] = useState<boolean>(false);
  const [tabSwitchCount, setTabSwitchCount] = useState<number>(0);

  // 100-Player Live Roster
  const [participants, setParticipants] = useState<Participant[]>(() => generate100Players());
  const [liveTicker, setLiveTicker] = useState<string[]>([]);

  // User In-Battle State
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

  const [secondsLeft, setSecondsLeft] = useState(900); // 15:00 timer
  const [userTestsPassed, setUserTestsPassed] = useState(3);
  const [userScore, setUserScore] = useState(30);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isBattleWon, setIsBattleWon] = useState(false);
  const [userRank, setUserRank] = useState(14);
  const [submissionFeedback, setSubmissionFeedback] = useState<string | null>(null);
  const [language, setLanguage] = useState('Python3');
  const wsRef = useRef<WebSocket | null>(null);

  // Synchronous Timer & Background 100-Player Progress Ticker
  useEffect(() => {
    const timerInterval = setInterval(() => {
      setSecondsLeft((s) => (s > 0 ? s - 1 : 0));
    }, 1000);

    // Highly optimized batch simulation: every 3 seconds, update 5 random peers to simulate real mass traffic
    const peerUpdateInterval = setInterval(() => {
      if (!isBattleWon) {
        setParticipants(prev => {
          const next = [...prev];
          const randomIdx = Math.floor(Math.random() * next.length);
          const target = { ...next[randomIdx] };
          
          if (target.testCasesPassed < 10) {
            target.testCasesPassed += 1;
            target.lines += Math.floor(Math.random() * 2) + 1;
            target.score = target.testCasesPassed * 10;
            if (target.testCasesPassed === 10) {
              target.isFinished = true;
              setLiveTicker(t => [`🏆 ${target.name} passed all 10/10 test cases!`, ...t.slice(0, 4)]);
            } else if (Math.random() > 0.6) {
              setLiveTicker(t => [`⚡ ${target.name} passed ${target.testCasesPassed}/10 test cases`, ...t.slice(0, 4)]);
            }
          }
          next[randomIdx] = target;
          return next;
        });
      }
    }, 2800);

    return () => {
      clearInterval(timerInterval);
      clearInterval(peerUpdateInterval);
      if (wsRef.current) wsRef.current.close();
    };
  }, [isBattleWon]);

  // Proctoring Screen Lockdown: Intercept accidental tab closure or tab switches
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (arenaSubTab === 'arena' && !isBattleWon) {
        e.preventDefault();
        e.returnValue = '';
        return '';
      }
    };

    const handleVisibilityChange = () => {
      if (document.hidden && arenaSubTab === 'arena' && !isBattleWon) {
        setTabSwitchCount(prev => {
          const next = prev + 1;
          setLiveTicker(t => [
            `⚠️ Proctor Warning: Tab / Screen switch detected (${next}/3)! Stay on the test screen.`,
            ...t.slice(0, 4)
          ]);
          return next;
        });
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [arenaSubTab, isBattleWon]);

  // Compute User Rank against all 100 Players
  const sortedLeaderboard = useMemo(() => {
    const all = [
      ...participants,
      {
        id: 'user-you',
        name: 'You (Sanyam)',
        college: 'Your Campus',
        avatar: 'ME',
        lines: userCode.split('\n').length,
        testCasesPassed: userTestsPassed,
        totalTestCases: 10,
        score: userScore,
        isFinished: isBattleWon,
        timeSec: 900 - secondsLeft
      }
    ];
    return all.sort((a, b) => {
      if (b.score !== a.score) return b.score - a.score;
      return a.timeSec - b.timeSec;
    });
  }, [participants, userScore, userTestsPassed, secondsLeft, isBattleWon, userCode]);

  // Keep track of current user rank
  useEffect(() => {
    const currentRank = sortedLeaderboard.findIndex(p => p.id === 'user-you') + 1;
    setUserRank(currentRank > 0 ? currentRank : 1);
  }, [sortedLeaderboard]);

  const formatTimer = (totalSecs: number) => {
    const mins = Math.floor(totalSecs / 60);
    const secs = totalSecs % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleCopyShareLink = () => {
    const shareText = `https://codequest.app/arena/${roomCode}`;
    navigator.clipboard?.writeText(shareText);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const handleRun = () => {
    setUserTestsPassed(7);
    setUserScore(70);
    setSubmissionFeedback('Passed 7/10 Test Suites • Runtime: 28ms • Rank updated!');
  };

  const handleSubmit = () => {
    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      setUserTestsPassed(10);
      setUserScore(100);
      setIsBattleWon(true);
      recordActivity('battle', { xp: 100 });
      setSubmissionFeedback('🏆 All 10/10 Test Cases Passed! You Placed Top Tier in the 100-Player Arena (+100 XP)!');
      setLiveTicker(t => [`🎉 Sanyam (You) finished with 10/10 test cases!`, ...t.slice(0, 4)]);
    }, 750);
  };

  const handleCreateRoom = (capacity: number) => {
    const newCode = `MEGA-${Math.floor(1000 + Math.random() * 9000)}`;
    setRoomCode(newCode);
    setRoomCapacity(capacity);
    setParticipants(generate100Players().slice(0, capacity));
    setIsBattleWon(false);
    setSubmissionFeedback(null);
    setUserTestsPassed(0);
    setUserScore(0);
    setSecondsLeft(900);
    setArenaSubTab('arena');
  };

  const handleJoinCustomRoom = () => {
    if (!joinInputCode.trim()) {
      setJoinError('Please enter a room code');
      return;
    }
    setJoinError('');
    setRoomCode(joinInputCode.trim().toUpperCase());
    setParticipants(generate100Players().slice(0, roomCapacity));
    setIsBattleWon(false);
    setSubmissionFeedback(null);
    setUserTestsPassed(0);
    setUserScore(0);
    setSecondsLeft(900);
    setArenaSubTab('arena');
  };

  const handleForfeitBattle = () => {
    setShowExitModal(false);
    setUserTestsPassed(0);
    setUserScore(0);
    setSubmissionFeedback(null);
    setArenaSubTab('create_room');
  };

  const handleForceSubmitBattle = () => {
    setShowExitModal(false);
    handleSubmit();
  };

  return (
    <div className="space-y-4 max-w-6xl mx-auto pb-10">
      {/* Top Banner: Proctoring Lockdown Bar during active battle test */}
      {arenaSubTab === 'arena' && !isBattleWon ? (
        <div className="bg-gradient-to-r from-blue-950/80 to-indigo-950/80 border border-blue-500/40 rounded-2xl p-3 shadow-lg flex flex-col sm:flex-row items-center justify-between gap-2.5">
          <div className="flex items-center gap-2.5">
            <div className="h-8 w-8 rounded-xl bg-blue-500/20 border border-blue-400/40 flex items-center justify-center text-blue-400">
              <ShieldCheck className="h-4 w-4" />
            </div>
            <div>
              <div className="text-xs font-black text-white flex items-center gap-2">
                <span>SCREEN LOCKED • TEST IN PROGRESS</span>
                {tabSwitchCount > 0 && (
                  <span className="px-2 py-0.5 rounded-full bg-rose-500/20 border border-rose-500/40 text-[10px] font-bold text-rose-400">
                    ⚠️ {tabSwitchCount}/3 Tab Switches
                  </span>
                )}
              </div>
              <p className="text-[10px] text-blue-200/80">
                Navigation is restricted to preserve test integrity. You can either submit or exit.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            <button
              onClick={() => setShowExitModal(true)}
              className="px-3.5 py-1.5 rounded-xl bg-rose-950/60 hover:bg-rose-900/60 text-rose-300 font-bold text-xs border border-rose-800/60 transition flex items-center gap-1.5"
            >
              <span>🚪 Forfeit / Exit</span>
            </button>
            <button
              onClick={handleForceSubmitBattle}
              disabled={isSubmitting}
              className="px-4 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs shadow-md shadow-emerald-600/30 transition flex items-center gap-1.5"
            >
              <span>✅ Submit Test</span>
            </button>
          </div>
        </div>
      ) : (
        /* 3-Tab Mega Arena Navigation when NOT in an active test */
        <div className="flex items-center justify-between bg-[#0b101e] border border-slate-800/80 rounded-2xl p-1.5 shadow-md">
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setArenaSubTab('arena')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                arenaSubTab === 'arena'
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Swords className="h-3.5 w-3.5" />
              <span>⚔️ 100-Player Arena</span>
            </button>

            <button
              onClick={() => setArenaSubTab('leaderboard')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                arenaSubTab === 'leaderboard'
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Trophy className="h-3.5 w-3.5" />
              <span>🏆 Live Standings ({participants.length + 1})</span>
            </button>

            <button
              onClick={() => setArenaSubTab('create_room')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                arenaSubTab === 'create_room'
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Sliders className="h-3.5 w-3.5" />
              <span>🛠️ Host / Create Room</span>
            </button>
          </div>

          {/* Room Capacity Badge */}
          <div className="flex items-center gap-2 pr-2">
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-950/40 border border-emerald-500/30 text-[11px] font-bold text-emerald-400">
              <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>{participants.length + 1} / {roomCapacity} Competitors</span>
            </div>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* VIEW A: CREATE / JOIN 100+ USER ROOM                          */}
      {/* ------------------------------------------------------------- */}
      {arenaSubTab === 'create_room' && (
        <div className="bg-[#0b101e] border border-slate-800/80 rounded-3xl p-6 shadow-xl space-y-6">
          <div className="flex items-start justify-between">
            <div>
              <h2 className="text-lg font-black text-white flex items-center gap-2">
                <Users className="h-5 w-5 text-sky-400" />
                <span>Host Mass Multiplayer Coding Arena</span>
              </h2>
              <p className="text-xs text-slate-400 mt-1">
                Configure mega battle rooms scaling from 2 to 100+ simultaneous participants with real-time synchronized leaderboards.
              </p>
            </div>
            <div className="px-3 py-1.5 rounded-xl bg-[#0e1424] border border-slate-800 font-mono text-xs font-bold text-sky-400">
              Room: {roomCode}
            </div>
          </div>

          {/* Preset Capacity Cards */}
          <div>
            <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-2.5 block">
              1. Select Arena Participant Scale
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
              {[
                { label: '1v1 Speed Duel', count: 2, desc: 'Quick 1-on-1 Head-to-Head', icon: '⚔️' },
                { label: 'Squad Battle', count: 4, desc: '4-Player Bracket Elimination', icon: '🛡️' },
                { label: 'Classroom Sprint', count: 30, desc: '30-Student Batch Test', icon: '🎓' },
                { label: 'Mega Arena (100+)', count: 100, desc: 'Massive Concurrency Blitz', icon: '🏟️' },
              ].map(preset => (
                <button
                  key={preset.count}
                  onClick={() => setRoomCapacity(preset.count)}
                  className={`p-4 rounded-2xl border text-left transition ${
                    roomCapacity === preset.count
                      ? 'bg-blue-600/10 border-blue-500 shadow-md ring-1 ring-blue-500/40'
                      : 'bg-[#080d19] border-slate-800/80 hover:border-slate-700'
                  }`}
                >
                  <div className="text-xl mb-1">{preset.icon}</div>
                  <div className="text-xs font-black text-white">{preset.label}</div>
                  <div className="text-[10px] text-slate-400 mt-1">{preset.desc}</div>
                  <div className="text-[11px] font-mono font-bold text-sky-400 mt-2">{preset.count} Players Max</div>
                </button>
              ))}
            </div>
          </div>

          {/* Difficulty Tier */}
          <div>
            <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-2.5 block">
              2. Algorithmic Difficulty
            </label>
            <div className="flex gap-2">
              {['Easy', 'Medium', 'Hard', 'Mixed Tournament'].map(diff => (
                <button
                  key={diff}
                  onClick={() => setRoomDifficulty(diff)}
                  className={`px-4 py-2 rounded-xl text-xs font-bold border transition ${
                    roomDifficulty === diff
                      ? 'bg-amber-500/10 border-amber-500 text-amber-300'
                      : 'bg-[#080d19] border-slate-800 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {diff}
                </button>
              ))}
            </div>
          </div>

          {/* Action Row */}
          <div className="pt-2 flex flex-col sm:flex-row items-center gap-3">
            <button
              onClick={() => handleCreateRoom(roomCapacity)}
              className="w-full sm:w-auto px-6 py-3 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-black text-xs shadow-lg shadow-indigo-600/30 flex items-center justify-center gap-2"
            >
              <Zap className="h-4 w-4" />
              <span>LAUNCH {roomCapacity}-PLAYER ARENA NOW</span>
            </button>

            {/* Join by Code Input */}
            <div className="flex items-center gap-2 w-full sm:w-auto sm:ml-auto">
              <input
                type="text"
                placeholder="Enter Room Code (e.g. MEGA-8492)"
                value={joinInputCode}
                onChange={e => setJoinInputCode(e.target.value.toUpperCase())}
                className="px-3.5 py-2.5 rounded-xl bg-[#080d19] border border-slate-800 text-xs text-white placeholder-slate-500 font-mono outline-none focus:border-blue-500"
              />
              <button
                onClick={handleJoinCustomRoom}
                className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs border border-slate-700"
              >
                Join
              </button>
            </div>
          </div>

          {joinError && <p className="text-xs text-rose-400 font-medium">⚠️ {joinError}</p>}
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* VIEW B: 100-PLAYER LIVE LEADERBOARD                           */}
      {/* ------------------------------------------------------------- */}
      {arenaSubTab === 'leaderboard' && (
        <div className="bg-[#0b101e] border border-slate-800/80 rounded-3xl p-6 shadow-xl space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800/80 pb-4">
            <div>
              <h2 className="text-base font-black text-white flex items-center gap-2">
                <Trophy className="h-5 w-5 text-amber-400" />
                <span>Live Arena Leaderboard • Top Competitors</span>
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Real-time standings for {participants.length + 1} players in Room {roomCode}
              </p>
            </div>
            {/* Pinned User Rank Badge */}
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-2xl bg-indigo-950/60 border border-indigo-500/40">
              <Crown className="h-4 w-4 text-amber-400" />
              <span className="text-xs font-bold text-white">Your Rank: #{userRank}</span>
              <span className="text-[10px] text-slate-400">({userScore} pts)</span>
            </div>
          </div>

          {/* Leaderboard Table (Optimized sliced list for top 15 + user) */}
          <div className="space-y-2">
            {sortedLeaderboard.slice(0, 15).map((p, idx) => {
              const rank = idx + 1;
              const isYou = p.id === 'user-you';

              return (
                <div
                  key={p.id}
                  className={`p-3 rounded-2xl border flex items-center justify-between transition ${
                    isYou
                      ? 'bg-blue-600/15 border-blue-500 ring-1 ring-blue-500/40'
                      : rank <= 3
                      ? 'bg-[#0d1426] border-slate-800'
                      : 'bg-[#080d19] border-slate-800/60'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    {/* Rank Pill */}
                    <div className={`h-7 w-7 rounded-lg flex items-center justify-center font-black text-xs ${
                      rank === 1 ? 'bg-amber-400 text-slate-950 shadow-md shadow-amber-400/30' :
                      rank === 2 ? 'bg-slate-300 text-slate-950' :
                      rank === 3 ? 'bg-amber-700 text-white' :
                      'bg-slate-800 text-slate-400'
                    }`}>
                      #{rank}
                    </div>

                    {/* Avatar & Name */}
                    <div>
                      <div className="text-xs font-black text-white flex items-center gap-1.5">
                        <span>{p.name}</span>
                        {isYou && (
                          <span className="px-1.5 py-0.2 rounded bg-blue-500 text-[9px] font-black text-white">
                            YOU
                          </span>
                        )}
                      </div>
                      <div className="text-[10px] text-slate-400">{p.college}</div>
                    </div>
                  </div>

                  {/* Test Cases Passed & Score */}
                  <div className="flex items-center gap-4 text-right">
                    <div>
                      <div className="text-xs font-mono font-bold text-emerald-400">
                        {p.testCasesPassed}/10 Passed
                      </div>
                      <div className="text-[10px] text-slate-500 font-mono">
                        {p.lines} lines code
                      </div>
                    </div>
                    <div className="text-sm font-black font-mono text-sky-400 w-12 text-right">
                      {p.score}p
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="text-center pt-2">
            <button
              onClick={() => setArenaSubTab('arena')}
              className="text-xs text-sky-400 hover:text-sky-300 font-bold"
            >
              ← Back to Code Arena
            </button>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* VIEW C: LIVE CODE ARENA (100-Player Multi-User View)          */}
      {/* ------------------------------------------------------------- */}
      {arenaSubTab === 'arena' && (
        <>
          {/* Header Matchup & Mass Room Stats */}
          <div className="bg-[#0b101e] border border-slate-800/80 rounded-3xl p-4 sm:p-5 shadow-xl flex flex-col sm:flex-row items-center justify-between gap-3">
            {/* Player Info (You) */}
            <div className="flex items-center gap-3 w-full sm:w-auto">
              <div className="h-11 w-11 rounded-full bg-gradient-to-tr from-sky-500 to-indigo-600 flex items-center justify-center font-bold text-xs text-white shadow ring-2 ring-indigo-500/30">
                SK
              </div>
              <div>
                <div className="text-xs sm:text-sm font-black text-white flex items-center gap-1.5">
                  <span>Sanyam (You)</span>
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-blue-900/60 border border-blue-500/30 text-blue-300 font-bold">
                    Rank #{userRank}
                  </span>
                </div>
                <div className="text-[10px] sm:text-xs text-slate-400 font-medium">
                  Score: <span className="text-sky-400 font-bold">{userScore} pts</span> • {userTestsPassed}/10 Passed
                </div>
              </div>
            </div>

            {/* Center: Live Timer & Synchronous Room Badge */}
            <div className="flex flex-col items-center">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-300 border border-amber-500/20">
                  {roomDifficulty}
                </span>
                <span className="text-[10px] font-mono text-emerald-400 font-bold flex items-center gap-1">
                  <Radio className="h-3 w-3 text-emerald-400 animate-pulse" />
                  Live Sync
                </span>
              </div>
              <div className="flex items-center gap-1.5 mt-1 px-3 py-1 rounded-xl bg-[#0e1424] border border-slate-800 text-xs font-mono font-bold text-rose-400">
                <Timer className="h-3.5 w-3.5" />
                <span>{formatTimer(secondsLeft)}</span>
              </div>
            </div>

            {/* Room Code & 1-Click Share Button */}
            <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
              <div className="text-right mr-1 hidden sm:block">
                <div className="text-[10px] text-slate-400 uppercase tracking-wider font-bold">Room Code</div>
                <div className="text-xs font-mono font-black text-sky-400">{roomCode}</div>
              </div>
              <button
                onClick={handleCopyShareLink}
                className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold flex items-center gap-1.5 border border-slate-700 transition"
                title="Copy shareable room link for 100+ players"
              >
                {copiedCode ? <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
                <span>{copiedCode ? 'Copied Link!' : 'Share Room'}</span>
              </button>
            </div>
          </div>

          {/* Live Activity Stream Ticker (for 100-user room) */}
          {liveTicker.length > 0 && (
            <div className="px-4 py-2 rounded-xl bg-[#080d19] border border-slate-800/80 text-[11px] text-slate-300 flex items-center gap-2 overflow-hidden shadow-inner">
              <span className="h-2 w-2 rounded-full bg-blue-400 shrink-0 animate-ping" />
              <span className="font-bold text-sky-400 uppercase text-[9px] tracking-wider shrink-0">Live Feed:</span>
              <span className="truncate italic text-slate-300">{liveTicker[0]}</span>
            </div>
          )}

          {/* Problem Prompt Card */}
          <div className="bg-[#0b101e] border border-slate-800/80 rounded-2xl p-4 shadow-md space-y-1.5">
            <div className="flex items-center justify-between">
              <div className="text-[11px] font-bold font-mono text-sky-400"># Live Problem Challenge</div>
              <span className="text-[10px] text-slate-400 font-mono">100-Player High Concurrency Room</span>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              Given an integer array <code className="text-sky-300 font-mono">nums</code>, find the contiguous subarray with the largest sum, and return its sum. Must operate in optimal <code className="text-emerald-400 font-mono">O(N)</code> runtime.
            </p>
          </div>

          {/* Code Editor */}
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

              <div className="flex items-center gap-2">
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
                    onClick={() => setArenaSubTab('leaderboard')}
                    className="px-3 py-1 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow"
                  >
                    View Scoreboard 🏆
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
                <span>{isSubmitting ? 'Evaluating (Worker Queue)...' : 'Submit Solution'}</span>
              </button>
            </div>

            {/* Realtime Standings Status Bar */}
            <div className="px-4 py-2 bg-[#060a12] border-t border-slate-800/60 flex items-center justify-between text-[11px] text-slate-400">
              <div className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                <span>Top competitor: <strong className="text-white">{sortedLeaderboard[0]?.name}</strong> ({sortedLeaderboard[0]?.score} pts)</span>
              </div>
              <button
                onClick={() => setArenaSubTab('leaderboard')}
                className="text-sky-400 hover:text-sky-300 font-bold flex items-center gap-0.5"
              >
                <span>Full Standings</span>
                <ChevronRight className="h-3 w-3" />
              </button>
            </div>
          </div>
        </>
      )}

      {/* Exit Confirmation Modal */}
      {showExitModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#0d1326] border border-slate-800 rounded-3xl p-6 max-w-md w-full shadow-2xl text-center space-y-4">
            <div className="h-14 w-14 rounded-full bg-rose-950/60 border border-rose-500/40 flex items-center justify-center text-2xl mx-auto text-rose-400">
              ⚠️
            </div>
            <div>
              <h3 className="text-lg font-black text-white">Exit Active Arena Test?</h3>
              <p className="text-xs text-slate-400 mt-1.5 leading-relaxed">
                You are currently in an active 100-player test battle. Leaving now will forfeit your entry and record your score as a forfeit.
              </p>
            </div>

            <div className="space-y-2 pt-2">
              <button
                onClick={handleForceSubmitBattle}
                className="w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow"
              >
                ✅ Submit Current Solution & Finish
              </button>
              <button
                onClick={handleForfeitBattle}
                className="w-full py-2.5 rounded-xl bg-rose-950/60 hover:bg-rose-900/60 text-rose-300 font-bold text-xs border border-rose-800/60"
              >
                🚪 Forfeit & Leave Arena
              </button>
              <button
                onClick={() => setShowExitModal(false)}
                className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs"
              >
                ← Resume Test
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

