import React, { useState, useEffect, useRef } from 'react';
import {
  Swords,
  Timer,
  Zap,
  Trophy,
  Users,
  Copy,
  CheckCircle2,
  Crown,
  Share2,
  ChevronRight,
  ShieldAlert,
  Flame,
  Radio,
  FileCode,
  Sparkles,
  BookOpen,
  Database,
  Cpu,
  Layers,
  Check,
  RotateCcw,
  Play
} from 'lucide-react';
import { playRunSound, playSuccessSound } from '../../services/soundEffects';
import { showToast } from '../../components/Toast';
import { recordActivity } from '../../services/activityTracker';

interface Participant {
  id: string;
  name: string;
  college: string;
  avatar: string;
  testCasesPassed: number;
  score: number;
  lines: number;
  isHost?: boolean;
}

// Generate realistic simulated competitors for the classroom / mega room
function generate100Players(): Participant[] {
  const firstNames = ['Aarav', 'Ananya', 'Rohan', 'Priya', 'Vikram', 'Aditi', 'Kabir', 'Neha', 'Siddharth', 'Tanvi', 'Aryan', 'Ishita', 'Arjun', 'Diya', 'Rahul'];
  const lastNames = ['Sharma', 'Verma', 'Patel', 'Singh', 'Gupta', 'Kumar', 'Reddy', 'Joshi', 'Mehta', 'Nair', 'Iyer', 'Bose', 'Rao', 'Chopra'];
  const colleges = ['IIT Delhi', 'BITS Pilani', 'NIT Trichy', 'VIT Vellore', 'DTU', 'IIIT Hyderabad', 'SRM Chennai', 'Manipal'];

  const players: Participant[] = [];
  for (let i = 1; i <= 100; i++) {
    const fn = firstNames[Math.floor(Math.random() * firstNames.length)];
    const ln = lastNames[Math.floor(Math.random() * lastNames.length)];
    const col = colleges[Math.floor(Math.random() * colleges.length)];
    const passed = Math.floor(Math.random() * 5); // start with 0-4 passed
    players.push({
      id: `player-${i}`,
      name: `${fn} ${ln}`,
      college: col,
      avatar: `${fn[0]}${ln[0]}`,
      testCasesPassed: passed,
      score: passed * 10,
      lines: Math.floor(Math.random() * 15) + 5
    });
  }
  return players;
}

// Live MCQ Question Bank for CS Fundamentals Battle Track
const BATTLE_MCQ_QUESTIONS = [
  {
    q: 'Which CPU scheduling algorithm is completely non-preemptive?',
    opts: ['Round Robin (RR)', 'First-Come, First-Served (FCFS)', 'SRTF', 'Priority Preemptive'],
    correct: 1,
    topic: 'Operating Systems'
  },
  {
    q: 'What are the 3 flags in the TCP connection establishment handshake?',
    opts: ['SYN, ACK, FIN', 'SYN, SYN-ACK, ACK', 'ACK, PUSH, SYN', 'RST, SYN, ACK'],
    correct: 1,
    topic: 'Computer Networks'
  },
  {
    q: 'Why are B+ Trees preferred over B Trees for relational database indexing on disks?',
    opts: ['B+ Trees store duplicate keys everywhere', 'Leaf nodes hold all records and are linked as a list for fast range queries', 'B+ Trees do not rebalance', 'B+ Trees need less memory'],
    correct: 1,
    topic: 'DBMS'
  },
  {
    q: 'What is "Thrashing" in virtual memory systems?',
    opts: ['Hardware disk sector damage', 'System spending more time swapping pages than executing instructions', 'CPU overheating', 'Cache line invalidation'],
    correct: 1,
    topic: 'Operating Systems'
  },
  {
    q: 'In the CAP Theorem, when a network partition (P) occurs, what must a distributed system trade off?',
    opts: ['Throughput vs Latency', 'Consistency (C) vs Availability (A)', 'Security vs Scale', 'Speed vs Cost'],
    correct: 1,
    topic: 'System Design'
  },
  {
    q: 'Which data structure enforces Last-In, First-Out (LIFO) ordering?',
    opts: ['Queue', 'Stack', 'Binary Heap', 'Linked List'],
    correct: 1,
    topic: 'Data Structures'
  }
];

export const BattleArenaView: React.FC = () => {
  // Navigation Mode
  const [arenaSubTab, setArenaSubTab] = useState<'arena' | 'create_room' | 'leaderboard'>('arena');

  // Room Configuration (Configured by Teacher or Room Host)
  const [roomCode, setRoomCode] = useState<string>('MEGA-8492');
  const [roomCapacity, setRoomCapacity] = useState<number>(30); // Default classroom batch
  const [battleTrack, setBattleTrack] = useState<'coding' | 'mcq' | 'sql'>('coding');
  const [battleTopic, setBattleTopic] = useState<string>('Mixed CS Core');
  const [battleDurationMins, setBattleDurationMins] = useState<number>(15);
  const [roomDifficulty, setRoomDifficulty] = useState<string>('Medium');

  const [copiedCode, setCopiedCode] = useState(false);
  const [joinInputCode, setJoinInputCode] = useState('');
  const [joinError, setJoinError] = useState('');
  const [showExitModal, setShowExitModal] = useState<boolean>(false);
  const [tabSwitchCount, setTabSwitchCount] = useState<number>(0);

  // Participants & Leaderboard
  const [participants, setParticipants] = useState<Participant[]>(() => generate100Players().slice(0, 30));
  const [liveTicker, setLiveTicker] = useState<string[]>([]);

  // User State in Arena
  const [secondsLeft, setSecondsLeft] = useState(900); // 15:00 timer
  const [userScore, setUserScore] = useState(0);
  const [userTestsPassed, setUserTestsPassed] = useState(0);
  const [userRank, setUserRank] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isBattleWon, setIsBattleWon] = useState(false);
  const [submissionFeedback, setSubmissionFeedback] = useState<string | null>(null);

  // Coding track state
  const [language, setLanguage] = useState('Python3');
  const [userCode, setUserCode] = useState(
`class Solution:
    def maxSubArray(self, nums: List[int]) -> int:
        # Write your code here
        pass`
  );

  // MCQ track state
  const [mcqIdx, setMcqIdx] = useState(0);
  const [selectedMcqOpt, setSelectedMcqOpt] = useState<number | null>(null);
  const [mcqStreak, setMcqStreak] = useState(0);

  // SQL track state
  const [sqlQuery, setSqlQuery] = useState('SELECT emp_name, salary FROM employees WHERE salary > 70000 ORDER BY salary DESC;');

  // Live Timer
  useEffect(() => {
    const timerInterval = setInterval(() => {
      setSecondsLeft((s) => (s > 0 ? s - 1 : 0));
    }, 1000);

    // Dynamic peer progress simulation
    const peerUpdateInterval = setInterval(() => {
      if (!isBattleWon) {
        setParticipants((prev) => {
          const next = [...prev];
          const randomIdx = Math.floor(Math.random() * next.length);
          const target = { ...next[randomIdx] };

          if (target.testCasesPassed < 10) {
            target.testCasesPassed += 1;
            target.lines += Math.floor(Math.random() * 2) + 1;
            target.score = target.testCasesPassed * 10;
            next[randomIdx] = target;

            setLiveTicker((t) => [
              `🚀 ${target.name} (${target.college}) just passed Testcase #${target.testCasesPassed}!`,
              ...t.slice(0, 3)
            ]);
          }
          return next;
        });
      }
    }, 3500);

    return () => {
      clearInterval(timerInterval);
      clearInterval(peerUpdateInterval);
    };
  }, [isBattleWon]);

  // Anti-Cheat Proctoring (Tab Switch Detection)
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden && arenaSubTab === 'arena' && !isBattleWon) {
        setTabSwitchCount((c) => {
          const next = c + 1;
          showToast(`⚠️ Warning! Tab switch detected (${next}/3). Proctored room rules enforce full focus.`, 'error');
          if (next >= 3) {
            showToast('🚨 Maximum tab violations exceeded! Submission flagged to instructor.', 'error');
          }
          return next;
        });
      }
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [arenaSubTab, isBattleWon]);

  // Formatted Timer Display
  const formatTimer = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Sort leaderboard dynamically including user
  const sortedLeaderboard = [...participants, {
    id: 'user-you',
    name: 'You (Candidate)',
    college: 'Host Room Student',
    avatar: 'YOU',
    testCasesPassed: userTestsPassed,
    score: userScore,
    lines: 18
  }].sort((a, b) => b.score - a.score || b.testCasesPassed - a.testCasesPassed);

  // Recalculate user rank
  useEffect(() => {
    const index = sortedLeaderboard.findIndex((p) => p.id === 'user-you');
    if (index !== -1) {
      setUserRank(index + 1);
    }
  }, [sortedLeaderboard]);

  const handleCopyShareLink = () => {
    const shareText = `https://code-quest-blush-five.vercel.app/#battle?room=${roomCode}&track=${battleTrack}`;
    navigator.clipboard?.writeText(shareText);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
    showToast(`Room link copied for ${battleTrack.toUpperCase()} Battle! Share with your students or peers.`, 'success');
  };

  // Teacher / Host Creates Customized Room
  const handleCreateRoom = (capacity: number) => {
    const trackPrefix = battleTrack === 'coding' ? 'CODE' : battleTrack === 'mcq' ? 'QUIZ' : 'SQL';
    const newCode = `${trackPrefix}-${Math.floor(1000 + Math.random() * 9000)}`;
    setRoomCode(newCode);
    setRoomCapacity(capacity);
    setParticipants(generate100Players().slice(0, capacity));
    setSecondsLeft(battleDurationMins * 60);
    setUserScore(0);
    setUserTestsPassed(0);
    setMcqIdx(0);
    setArenaSubTab('arena');
    playSuccessSound();
    showToast(`🎉 Room Created: ${newCode} • [${battleTrack.toUpperCase()}] • ${capacity} Students Max!`, 'success');
  };

  const handleJoinCustomRoom = () => {
    if (!joinInputCode.trim()) {
      setJoinError('Please enter a room code');
      return;
    }
    const code = joinInputCode.trim().toUpperCase();
    setRoomCode(code);
    if (code.startsWith('QUIZ')) setBattleTrack('mcq');
    else if (code.startsWith('SQL')) setBattleTrack('sql');
    else setBattleTrack('coding');
    setParticipants(generate100Players().slice(0, roomCapacity));
    setArenaSubTab('arena');
    setJoinError('');
    playSuccessSound();
    showToast(`Successfully joined Room ${code}!`, 'success');
  };

  // Coding Submission Handler
  const handleSubmitCode = () => {
    if (!userCode.trim() || userCode.includes('pass')) {
      showToast('Cannot submit default skeleton or empty code! Write your solution.', 'error');
      setSubmissionFeedback('❌ Output Mismatch: Function returned None (only default skeleton).');
      return;
    }

    setIsSubmitting(true);
    playRunSound();

    setTimeout(() => {
      setIsSubmitting(false);
      setUserTestsPassed(10);
      setUserScore((s) => s + 100);
      setIsBattleWon(true);
      playSuccessSound();
      recordActivity('battle', { xp: 50 });
      setSubmissionFeedback('✅ All 10/10 Test Cases Passed in 38ms! Battle Completed.');
      showToast('🎉 All 10/10 Test Cases Passed! You took Rank #1 on the live roster!', 'success');
    }, 700);
  };

  // MCQ Submission Handler
  const handleAnswerMcq = (optIdx: number) => {
    setSelectedMcqOpt(optIdx);
    const q = BATTLE_MCQ_QUESTIONS[mcqIdx];

    if (optIdx === q.correct) {
      playSuccessSound();
      setUserScore((s) => s + 20);
      setUserTestsPassed((t) => t + 1);
      setMcqStreak((s) => s + 1);
      showToast('Correct! +20 Points • Speed Streak Up!', 'success');
    } else {
      playRunSound();
      setMcqStreak(0);
      showToast('Incorrect option. Keep going!', 'error');
    }

    setTimeout(() => {
      setSelectedMcqOpt(null);
      if (mcqIdx < BATTLE_MCQ_QUESTIONS.length - 1) {
        setMcqIdx((i) => i + 1);
      } else {
        setIsBattleWon(true);
        showToast('🏁 You completed all rapid battle questions!', 'success');
      }
    }, 800);
  };

  // SQL Submission Handler
  const handleSubmitSql = () => {
    playRunSound();
    setIsSubmitting(true);

    setTimeout(() => {
      setIsSubmitting(false);
      const lower = sqlQuery.toLowerCase();
      if (lower.includes('where') && lower.includes('order by')) {
        playSuccessSound();
        setUserScore((s) => s + 60);
        setUserTestsPassed(10);
        setIsBattleWon(true);
        showToast('🎉 Query Accepted! Matched all target relational records.', 'success');
        setSubmissionFeedback('✅ Query Executed in 12ms. All 10 test records verified.');
      } else {
        showToast('Query output mismatch. Check WHERE and ORDER BY clauses.', 'error');
        setSubmissionFeedback('❌ Output Mismatch on test case 3. Review filtering condition.');
      }
    }, 600);
  };

  return (
    <div className="space-y-4 max-w-6xl mx-auto pb-12 font-['Plus_Jakarta_Sans'] text-slate-100">
      {/* Top Banner Navigation */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-[#0b101e] border border-cyan-500/25 rounded-2xl p-4 shadow-xl relative overflow-hidden">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-rose-500/20 to-indigo-600/30 border border-rose-500/40 flex items-center justify-center text-rose-300 shadow-md">
            <Swords className="h-5 w-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base font-extrabold text-white tracking-tight">Multiplayer Battle Arena</h1>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-rose-950/60 text-rose-300 border border-rose-500/30 font-bold uppercase">
                {battleTrack} Track
              </span>
            </div>
            <p className="text-xs text-slate-400">Synchronized live contests for classrooms, batches, and 1v1 speed duels</p>
          </div>
        </div>

        {/* Sub-tab Navigation */}
        <div className="p-1 rounded-xl bg-[#0e1424] border border-slate-800 flex gap-1 self-start sm:self-auto">
          <button
            onClick={() => setArenaSubTab('arena')}
            className={`px-3.5 py-1.5 text-xs font-bold rounded-lg transition-all ${
              arenaSubTab === 'arena'
                ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Live Match
          </button>
          <button
            onClick={() => setArenaSubTab('create_room')}
            className={`px-3.5 py-1.5 text-xs font-bold rounded-lg transition-all ${
              arenaSubTab === 'create_room'
                ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md shadow-indigo-600/30'
                : 'text-cyan-400 hover:text-cyan-300'
            }`}
          >
            🛠️ Host / Teacher Custom Room
          </button>
          <button
            onClick={() => setArenaSubTab('leaderboard')}
            className={`px-3.5 py-1.5 text-xs font-bold rounded-lg transition-all ${
              arenaSubTab === 'leaderboard'
                ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            🏆 Live Roster ({participants.length + 1})
          </button>
        </div>
      </div>

      {/* ========================================================= */}
      {/* VIEW A: TEACHER / HOST CREATE CUSTOM ROOM                 */}
      {/* ========================================================= */}
      {arenaSubTab === 'create_room' && (
        <div className="bg-[#0b101e] border border-slate-800/80 rounded-3xl p-6 shadow-xl space-y-6 animate-in fade-in">
          <div className="flex items-start justify-between border-b border-slate-800 pb-4">
            <div>
              <h2 className="text-lg font-black text-white flex items-center gap-2">
                <Users className="h-5 w-5 text-cyan-400" />
                <span>Instructor &amp; Room Host Battle Studio</span>
              </h2>
              <p className="text-xs text-slate-400 mt-1">
                Configure custom battle rooms tailored for specific subjects, class sizes, timers, and difficulty levels.
              </p>
            </div>
            <div className="px-3 py-1.5 rounded-xl bg-[#0e1424] border border-cyan-500/40 font-mono text-xs font-bold text-cyan-300">
              Active Room: {roomCode}
            </div>
          </div>

          {/* 1. TEACHER CHOICE: BATTLE TRACK DISCIPLINE */}
          <div>
            <label className="text-[11px] font-bold uppercase tracking-wider text-slate-300 mb-2.5 block flex items-center gap-1.5">
              <Sparkles className="h-3.5 w-3.5 text-amber-400" />
              1. Choose Battle Discipline (Teacher / Host Choice)
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {[
                {
                  track: 'coding' as const,
                  title: 'Coding Arena Duel',
                  desc: 'Algorithmic DSA problems with real-time testcase verification',
                  icon: <FileCode className="h-5 w-5 text-cyan-400" />,
                  tag: 'DSA & Algorithms'
                },
                {
                  track: 'mcq' as const,
                  title: 'CS Fundamentals Speed Duel',
                  desc: 'Rapid-fire placement MCQs covering OS, Networks, DBMS & System Design',
                  icon: <Cpu className="h-5 w-5 text-indigo-400" />,
                  tag: 'Core CS Multiple Choice'
                },
                {
                  track: 'sql' as const,
                  title: 'SQL Query Challenge Battle',
                  desc: 'Relational database challenges with live schema verification & joins',
                  icon: <Database className="h-5 w-5 text-emerald-400" />,
                  tag: 'Databases & Analytics'
                }
              ].map((item) => (
                <button
                  key={item.track}
                  onClick={() => setBattleTrack(item.track)}
                  className={`p-4 rounded-2xl border text-left transition ${
                    battleTrack === item.track
                      ? 'bg-[#0f172a] border-cyan-400 ring-1 ring-cyan-400/40 shadow-lg'
                      : 'bg-[#080d19] border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between pb-2">
                    {item.icon}
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-800 text-slate-400">
                      {item.tag}
                    </span>
                  </div>
                  <div className="text-xs font-bold text-white">{item.title}</div>
                  <div className="text-[11px] text-slate-400 mt-1 leading-relaxed">{item.desc}</div>
                </button>
              ))}
            </div>
          </div>

          {/* 2. SYLLABUS / TOPIC CUSTOMIZATION */}
          <div>
            <label className="text-[11px] font-bold uppercase tracking-wider text-slate-300 mb-2.5 block">
              2. Target Topic &amp; Syllabus
            </label>
            <div className="flex gap-2 flex-wrap">
              {(battleTrack === 'coding'
                ? ['Mixed DSA', 'Dynamic Programming', 'Arrays & Two Pointers', 'Trees & Graphs', 'Strings']
                : battleTrack === 'mcq'
                ? ['Mixed CS Core', 'Operating Systems', 'Computer Networks', 'DBMS & SQL', 'System Design']
                : ['Employees Corporate DB', 'E-Commerce Orders DB', 'Advanced Window Functions']
              ).map((topic) => (
                <button
                  key={topic}
                  onClick={() => setBattleTopic(topic)}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-bold border transition ${
                    battleTopic === topic
                      ? 'bg-cyan-500/20 border-cyan-400 text-cyan-300 shadow-sm'
                      : 'bg-[#080d19] border-slate-800 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {topic}
                </button>
              ))}
            </div>
          </div>

          {/* 3. MATCH DURATION & TIMER */}
          <div>
            <label className="text-[11px] font-bold uppercase tracking-wider text-slate-300 mb-2.5 block">
              3. Match Duration (Countdown Timer)
            </label>
            <div className="flex gap-2.5">
              {[
                { label: '5 Mins (Blitz)', mins: 5 },
                { label: '10 Mins (Sprint)', mins: 10 },
                { label: '15 Mins (Standard)', mins: 15 },
                { label: '30 Mins (Exam)', mins: 30 }
              ].map((d) => (
                <button
                  key={d.mins}
                  onClick={() => setBattleDurationMins(d.mins)}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-bold border transition ${
                    battleDurationMins === d.mins
                      ? 'bg-indigo-500/20 border-indigo-400 text-indigo-300 shadow-sm'
                      : 'bg-[#080d19] border-slate-800 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {d.label}
                </button>
              ))}
            </div>
          </div>

          {/* 4. ARENA PARTICIPANT SCALE */}
          <div>
            <label className="text-[11px] font-bold uppercase tracking-wider text-slate-300 mb-2.5 block">
              4. Participant Capacity
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              {[
                { label: '1v1 Speed Duel', count: 2, icon: '⚔️' },
                { label: 'Squad Battle (4)', count: 4, icon: '🛡️' },
                { label: 'Classroom Sprint (30)', count: 30, icon: '🎓' },
                { label: 'Mega Arena (100+)', count: 100, icon: '🏟️' }
              ].map((preset) => (
                <button
                  key={preset.count}
                  onClick={() => setRoomCapacity(preset.count)}
                  className={`p-3 rounded-2xl border text-left transition ${
                    roomCapacity === preset.count
                      ? 'bg-blue-600/15 border-blue-500 ring-1 ring-blue-500/40 text-white'
                      : 'bg-[#080d19] border-slate-800 text-slate-400 hover:border-slate-700'
                  }`}
                >
                  <div className="text-lg mb-1">{preset.icon}</div>
                  <div className="text-xs font-bold text-white">{preset.label}</div>
                  <div className="text-[10px] text-sky-400 font-mono mt-0.5">{preset.count} Competitors Max</div>
                </button>
              ))}
            </div>
          </div>

          {/* LAUNCH BUTTON & JOIN BY CODE */}
          <div className="pt-3 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
            <button
              onClick={() => handleCreateRoom(roomCapacity)}
              className="w-full sm:w-auto px-8 py-3.5 rounded-2xl bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-500 hover:to-indigo-500 text-white font-extrabold text-xs shadow-xl shadow-indigo-600/30 flex items-center justify-center gap-2 transition transform active:scale-95"
            >
              <Zap className="h-4 w-4" />
              <span>LAUNCH {battleTrack.toUpperCase()} ROOM NOW</span>
            </button>

            {/* Join Room Code Input */}
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <input
                type="text"
                placeholder="Enter Code (e.g. CODE-8492)"
                value={joinInputCode}
                onChange={(e) => setJoinInputCode(e.target.value.toUpperCase())}
                className="px-3.5 py-2.5 rounded-xl bg-[#080d19] border border-slate-800 text-xs text-white placeholder-slate-500 font-mono outline-none focus:border-cyan-400"
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

      {/* ========================================================= */}
      {/* VIEW B: LIVE LEADERBOARD VIEW                             */}
      {/* ========================================================= */}
      {arenaSubTab === 'leaderboard' && (
        <div className="bg-[#0b101e] border border-slate-800/80 rounded-3xl p-6 shadow-xl space-y-4 animate-in fade-in">
          <div className="flex items-center justify-between border-b border-slate-800/80 pb-4">
            <div>
              <h2 className="text-base font-black text-white flex items-center gap-2">
                <Trophy className="h-5 w-5 text-amber-400" />
                <span>Live Arena Leaderboard • Top Competitors</span>
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Real-time standings for {participants.length + 1} players in Room {roomCode} ({battleTrack.toUpperCase()})
              </p>
            </div>
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-2xl bg-indigo-950/60 border border-indigo-500/40">
              <Crown className="h-4 w-4 text-amber-400" />
              <span className="text-xs font-bold text-white">Your Rank: #{userRank}</span>
              <span className="text-[10px] text-cyan-300">({userScore} pts)</span>
            </div>
          </div>

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
                    <div className={`h-7 w-7 rounded-lg flex items-center justify-center font-black text-xs ${
                      rank === 1 ? 'bg-amber-400 text-slate-950 shadow-md shadow-amber-400/30' :
                      rank === 2 ? 'bg-slate-300 text-slate-950' :
                      rank === 3 ? 'bg-amber-700 text-white' :
                      'bg-slate-800 text-slate-400'
                    }`}>
                      #{rank}
                    </div>

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

                  <div className="flex items-center gap-4 text-right">
                    <div>
                      <div className="text-xs font-mono font-bold text-emerald-400">
                        {p.testCasesPassed}/10 Completed
                      </div>
                    </div>
                    <div className="text-sm font-black font-mono text-cyan-400 w-14 text-right">
                      {p.score} pts
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
              ← Back to Battle Arena
            </button>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* VIEW C: LIVE CONTEST ARENA                                */}
      {/* ========================================================= */}
      {arenaSubTab === 'arena' && (
        <div className="space-y-4">
          {/* Header Matchup Bar */}
          <div className="bg-[#0b101e] border border-slate-800/80 rounded-3xl p-4 sm:p-5 shadow-xl flex flex-col sm:flex-row items-center justify-between gap-3">
            {/* Player Info (You) */}
            <div className="flex items-center gap-3 w-full sm:w-auto">
              <div className="h-11 w-11 rounded-2xl bg-gradient-to-tr from-cyan-400 to-indigo-600 flex items-center justify-center font-bold text-xs text-white shadow ring-2 ring-indigo-500/30">
                SK
              </div>
              <div>
                <div className="text-xs sm:text-sm font-black text-white flex items-center gap-1.5">
                  <span>Candidate (You)</span>
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-blue-900/60 border border-blue-500/30 text-blue-300 font-bold">
                    Rank #{userRank}
                  </span>
                </div>
                <div className="text-[10px] sm:text-xs text-slate-400 font-medium">
                  Score: <span className="text-cyan-400 font-bold">{userScore} pts</span> • {userTestsPassed}/10 Completed
                </div>
              </div>
            </div>

            {/* Center: Live Timer & Track Badge */}
            <div className="flex flex-col items-center">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-cyan-950/60 text-cyan-300 border border-cyan-500/30 uppercase">
                  {battleTrack} Arena
                </span>
                <span className="text-[10px] font-mono text-emerald-400 font-bold flex items-center gap-1">
                  <Radio className="h-3 w-3 text-emerald-400 animate-pulse" />
                  Live Sync ({participants.length + 1} Peers)
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
                <div className="text-xs font-mono font-black text-cyan-300">{roomCode}</div>
              </div>
              <button
                onClick={handleCopyShareLink}
                className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold flex items-center gap-1.5 border border-slate-700 transition"
              >
                {copiedCode ? <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
                <span>{copiedCode ? 'Link Copied!' : 'Share Room'}</span>
              </button>
            </div>
          </div>

          {/* Live Activity Feed */}
          {liveTicker.length > 0 && (
            <div className="px-4 py-2 rounded-xl bg-[#080d19] border border-slate-800/80 text-[11px] text-slate-300 flex items-center gap-2 overflow-hidden shadow-inner">
              <span className="h-2 w-2 rounded-full bg-blue-400 shrink-0 animate-ping" />
              <span className="font-bold text-cyan-400 uppercase text-[9px] tracking-wider shrink-0">Live Battle Feed:</span>
              <span className="truncate italic text-slate-300">{liveTicker[0]}</span>
            </div>
          )}

          {/* ------------------------------------------------------------- */}
          {/* TRACK 1: CODING ARENA LIVE DUEL                               */}
          {/* ------------------------------------------------------------- */}
          {battleTrack === 'coding' && (
            <div className="space-y-4">
              <div className="bg-[#0b101e] border border-slate-800/80 rounded-2xl p-4 shadow-md space-y-1.5">
                <div className="flex items-center justify-between">
                  <div className="text-[11px] font-bold font-mono text-cyan-400"># Live Coding Problem: Maximum Subarray (Kadane)</div>
                  <span className="text-[10px] text-slate-400 font-mono">Topic: {battleTopic}</span>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Given an integer array <code className="text-cyan-300 font-mono">nums</code>, find the contiguous subarray with the largest sum and return its sum. Must operate in optimal <code className="text-emerald-400 font-mono">O(N)</code> runtime.
                </p>
              </div>

              {/* Code Editor */}
              <div className="bg-[#0b101e] border border-slate-800/80 rounded-2xl overflow-hidden shadow-lg flex flex-col">
                <div className="px-4 py-2 bg-[#090d16] border-b border-slate-800/80 flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-300 flex items-center gap-2">
                    <FileCode className="h-3.5 w-3.5 text-cyan-400" />
                    Python3 Solution Editor
                  </span>
                  <button
                    onClick={() => setUserCode(
`class Solution:
    def maxSubArray(self, nums: List[int]) -> int:
        cur_sum = 0
        max_sum = nums[0]
        for n in nums:
            cur_sum = max(n, cur_sum + n)
            max_sum = max(max_sum, cur_sum)
        return max_sum`
                    )}
                    className="text-[10px] font-semibold text-cyan-400 hover:text-cyan-300 underline"
                  >
                    Paste Algorithm
                  </button>
                </div>

                <div className="p-3 bg-[#070b14] min-h-[190px]">
                  <textarea
                    value={userCode}
                    onChange={(e) => setUserCode(e.target.value)}
                    className="w-full h-44 bg-transparent text-cyan-100 font-mono text-xs outline-none leading-relaxed resize-none"
                    spellCheck={false}
                  />
                </div>

                {submissionFeedback && (
                  <div className="px-4 py-2 bg-[#0e1424] border-t border-slate-800 text-xs font-mono text-cyan-300">
                    {submissionFeedback}
                  </div>
                )}

                <div className="p-3 bg-[#090d16] border-t border-slate-800/80 flex justify-end">
                  <button
                    onClick={handleSubmitCode}
                    disabled={isSubmitting}
                    className="py-2.5 px-6 rounded-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-500 hover:to-indigo-500 text-white font-extrabold text-xs shadow-md transition"
                  >
                    {isSubmitting ? 'Verifying 10 Test Cases...' : 'Submit Code Solution ➔'}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* ------------------------------------------------------------- */}
          {/* TRACK 2: CS FUNDAMENTALS RAPID MCQ LIVE DUEL                  */}
          {/* ------------------------------------------------------------- */}
          {battleTrack === 'mcq' && (
            <div className="bg-[#0b101e] border border-slate-800/80 rounded-3xl p-6 shadow-xl space-y-5">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-indigo-950/60 text-indigo-300 border border-indigo-500/30">
                    {BATTLE_MCQ_QUESTIONS[mcqIdx].topic}
                  </span>
                  <span className="text-xs text-slate-500 font-mono">
                    Question {mcqIdx + 1} of {BATTLE_MCQ_QUESTIONS.length}
                  </span>
                </div>

                <div className="flex items-center gap-1.5 text-xs text-amber-400 font-bold">
                  <Flame className="h-4 w-4 fill-amber-400" />
                  <span>Streak: {mcqStreak}x</span>
                </div>
              </div>

              <h2 className="text-sm sm:text-base font-bold text-white leading-relaxed">
                {BATTLE_MCQ_QUESTIONS[mcqIdx].q}
              </h2>

              <div className="space-y-2.5">
                {BATTLE_MCQ_QUESTIONS[mcqIdx].opts.map((opt, optIdx) => {
                  let style = 'bg-[#0e1424] border-slate-800 text-slate-200 hover:border-slate-700';
                  if (selectedMcqOpt !== null) {
                    if (optIdx === BATTLE_MCQ_QUESTIONS[mcqIdx].correct) {
                      style = 'bg-emerald-500/20 border-emerald-500 text-emerald-200 ring-1 ring-emerald-500/40';
                    } else if (optIdx === selectedMcqOpt) {
                      style = 'bg-rose-500/20 border-rose-500 text-rose-200';
                    }
                  }

                  return (
                    <button
                      key={optIdx}
                      onClick={() => handleAnswerMcq(optIdx)}
                      disabled={selectedMcqOpt !== null}
                      className={`w-full p-3.5 rounded-2xl border text-left text-xs font-semibold flex items-center justify-between transition ${style}`}
                    >
                      <div className="flex items-center gap-3">
                        <span className="h-6 w-6 rounded-lg bg-slate-800 flex items-center justify-center font-mono text-[11px] text-slate-400 shrink-0">
                          {String.fromCharCode(65 + optIdx)}
                        </span>
                        <span>{opt}</span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* ------------------------------------------------------------- */}
          {/* TRACK 3: SQL QUERY CHALLENGE LIVE DUEL                        */}
          {/* ------------------------------------------------------------- */}
          {battleTrack === 'sql' && (
            <div className="space-y-4">
              <div className="bg-[#0b101e] border border-slate-800/80 rounded-2xl p-4 shadow-md space-y-1.5">
                <div className="flex items-center justify-between">
                  <div className="text-[11px] font-bold font-mono text-cyan-400"># Live SQL Challenge: High Earners by Department</div>
                  <span className="text-[10px] text-slate-400 font-mono">Schema: {battleTopic}</span>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Select <code className="text-cyan-300 font-mono">emp_name</code> and <code className="text-cyan-300 font-mono">salary</code> for all employees earning more than $70,000, ordered from highest to lowest salary.
                </p>
              </div>

              <div className="bg-[#0b101e] border border-slate-800/80 rounded-2xl overflow-hidden shadow-lg flex flex-col">
                <div className="px-4 py-2 bg-[#090d16] border-b border-slate-800/80 flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-300 flex items-center gap-2">
                    <Database className="h-3.5 w-3.5 text-cyan-400" />
                    SQL Query Editor
                  </span>
                </div>

                <div className="p-3 bg-[#070b14] min-h-[160px]">
                  <textarea
                    value={sqlQuery}
                    onChange={(e) => setSqlQuery(e.target.value)}
                    className="w-full h-32 bg-transparent text-cyan-200 font-mono text-xs outline-none leading-relaxed resize-none"
                    spellCheck={false}
                  />
                </div>

                {submissionFeedback && (
                  <div className="px-4 py-2 bg-[#0e1424] border-t border-slate-800 text-xs font-mono text-cyan-300">
                    {submissionFeedback}
                  </div>
                )}

                <div className="p-3 bg-[#090d16] border-t border-slate-800/80 flex justify-end">
                  <button
                    onClick={handleSubmitSql}
                    disabled={isSubmitting}
                    className="py-2.5 px-6 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 text-white font-extrabold text-xs shadow-md transition"
                  >
                    {isSubmitting ? 'Evaluating SQL...' : 'Execute & Submit Query ➔'}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
