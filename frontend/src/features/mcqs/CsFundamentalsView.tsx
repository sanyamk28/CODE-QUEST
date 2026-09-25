import React, { useState } from 'react';
import {
  Layers,
  CheckCircle2,
  XCircle,
  ArrowRight,
  ArrowLeft,
  Sparkles,
  Trophy,
  RotateCcw,
  Zap,
  Lock,
  Unlock,
  Award,
  BookOpen
} from 'lucide-react';

export interface LeveledMcq {
  id: number;
  level: number;
  topic: 'Operating Systems' | 'DBMS' | 'Computer Networks' | 'System Design' | 'Data Structures';
  question: string;
  options: string[];
  correct: number;
  explanation: string;
}

export const LEVELED_MCQS: LeveledMcq[] = [
  // --- LEVEL 1: FOUNDATION & BASICS (5 Questions) ---
  {
    id: 1,
    level: 1,
    topic: 'Operating Systems',
    question: 'Which of the following CPU scheduling algorithms is completely non-preemptive?',
    options: [
      'Round Robin (RR)',
      'First-Come, First-Served (FCFS)',
      'Shortest Remaining Time First (SRTF)',
      'Priority Scheduling (Preemptive)'
    ],
    correct: 1,
    explanation: 'First-Come, First-Served (FCFS) schedules processes in arrival order. Once a process gains CPU, it executes until it terminates or blocks for I/O, making it non-preemptive.'
  },
  {
    id: 2,
    level: 1,
    topic: 'Data Structures',
    question: 'What is the average time complexity to search for a key in a balanced Binary Search Tree (AVL / Red-Black)?',
    options: ['O(1)', 'O(log N)', 'O(N)', 'O(N log N)'],
    correct: 1,
    explanation: 'In balanced BSTs, tree height is strictly maintained at O(log N), guaranteeing O(log N) search, insertion, and deletion times.'
  },
  {
    id: 3,
    level: 1,
    topic: 'DBMS',
    question: 'Which SQL clause is used to filter records resulting from an aggregate function like COUNT() or SUM()?',
    options: ['WHERE', 'ORDER BY', 'HAVING', 'GROUP BY'],
    correct: 2,
    explanation: 'HAVING filters aggregated grouped results, whereas WHERE filters individual rows before grouping.'
  },
  {
    id: 4,
    level: 1,
    topic: 'Computer Networks',
    question: 'At which layer of the OSI model does the Internet Protocol (IP) operate?',
    options: ['Transport Layer', 'Data Link Layer', 'Network Layer', 'Session Layer'],
    correct: 2,
    explanation: 'IP is the fundamental Network Layer (Layer 3) protocol responsible for logical packet addressing and routing across subnets.'
  },
  {
    id: 5,
    level: 1,
    topic: 'Data Structures',
    question: 'Which data structure operates on a Last-In, First-Out (LIFO) order?',
    options: ['Queue', 'Stack', 'Linked List', 'Binary Heap'],
    correct: 1,
    explanation: 'Stack enforces LIFO ordering where the most recently pushed element is the first one popped.'
  },

  // --- LEVEL 2: CORE COMPUTER SCIENCE (6 Questions) ---
  {
    id: 6,
    level: 2,
    topic: 'Operating Systems',
    question: 'What primary resource is shared among threads of the same process?',
    options: [
      'CPU Registers',
      'Call Stack',
      'Address space and Heap memory',
      'Program Counter'
    ],
    correct: 2,
    explanation: 'Threads within a process share the text, data, and heap segments of the address space and open file descriptors, but each thread has its own register state and call stack.'
  },
  {
    id: 7,
    level: 2,
    topic: 'DBMS',
    question: 'Why are B+ Trees preferred over B Trees for relational database indexing on disks?',
    options: [
      'B+ Trees store duplicate keys everywhere',
      'All data records/pointers are stored only at the leaf nodes, which are linked as a doubly-linked list for fast range queries',
      'B+ Trees do not require rebalancing during insertions',
      'B+ Trees require less memory for leaf nodes'
    ],
    correct: 1,
    explanation: 'In B+ Trees, internal nodes only hold search keys for routing, allowing higher branching factor, while all records reside in linked leaf nodes for rapid sequential range scanning.'
  },
  {
    id: 8,
    level: 2,
    topic: 'Computer Networks',
    question: 'What are the three flags exchanged during a standard TCP connection establishment handshake?',
    options: [
      'SYN, ACK, FIN',
      'SYN, SYN-ACK, ACK',
      'ACK, ACK-SYN, PUSH',
      'RST, SYN, ACK'
    ],
    correct: 1,
    explanation: 'Client sends SYN; Server responds with SYN-ACK; Client acknowledges with ACK. Data transfer begins after this 3-way handshake.'
  },
  {
    id: 9,
    level: 2,
    topic: 'Operating Systems',
    question: 'Which of the following is NOT one of the 4 Coffman conditions required for Deadlock?',
    options: [
      'Mutual Exclusion',
      'Hold and Wait',
      'Preemption of resources by OS',
      'Circular Wait'
    ],
    correct: 2,
    explanation: 'The condition is NO Preemption (resources cannot be forcibly taken). If preemption is allowed, deadlock cannot occur.'
  },
  {
    id: 10,
    level: 2,
    topic: 'Data Structures',
    question: 'What is the worst-case time complexity of QuickSort when a naive pivot strategy is applied to an already sorted array?',
    options: ['O(N log N)', 'O(N)', 'O(N²)', 'O(log N)'],
    correct: 2,
    explanation: 'If the first or last element is chosen as pivot on an already sorted array, partitions become unbalanced (sizes 0 and N-1), causing O(N²) quadratic comparisons.'
  },
  {
    id: 11,
    level: 2,
    topic: 'DBMS',
    question: 'What does the "I" represent in the ACID properties of transactional databases?',
    options: ['Integrity', 'Isolation', 'Indexing', 'Idempotency'],
    correct: 1,
    explanation: 'Isolation ensures concurrent transactions execute without interfering with one another, preventing dirty reads and phantom reads.'
  },

  // --- LEVEL 3: INTERMEDIATE SYSTEMS (6 Questions) ---
  {
    id: 12,
    level: 3,
    topic: 'Operating Systems',
    question: 'What is "Thrashing" in the context of virtual memory management?',
    options: [
      'A hardware error where disk sectors are physically damaged',
      'A state where the system spends significantly more time paging/swapping pages than executing application instructions',
      'Overheating of CPU cores due to recursive threads',
      'Cache line invalidation in multi-core CPUs'
    ],
    correct: 1,
    explanation: 'Thrashing occurs when the sum of working set sizes across all active processes exceeds available physical RAM, resulting in continuous page faults.'
  },
  {
    id: 13,
    level: 3,
    topic: 'DBMS',
    question: 'Which transaction isolation level prevents Dirty Reads and Non-Repeatable Reads, but allows Phantom Reads?',
    options: [
      'Read Uncommitted',
      'Read Committed',
      'Repeatable Read',
      'Serializable'
    ],
    correct: 2,
    explanation: 'Repeatable Read locks rows read by a query so other transactions cannot update or delete them, but other transactions may still insert new matching rows (phantoms).'
  },
  {
    id: 14,
    level: 3,
    topic: 'System Design',
    question: 'How does Consistent Hashing minimize key redistribution when a cache server node is added or removed?',
    options: [
      'By rehashing all keys using MD5',
      'By placing nodes and keys on a virtual ring (0 to 2³²-1) so only keys mapped to the affected node need to be reallocated',
      'By storing all keys on a centralized master coordinator node',
      'By duplicating all cache items across 100% of servers'
    ],
    correct: 1,
    explanation: 'Consistent Hashing places nodes on a circular ring; each key is routed to the nearest clockwise node. Adding or removing a node affects only K/N keys on average.'
  },
  {
    id: 15,
    level: 3,
    topic: 'Computer Networks',
    question: 'Why does DNS primarily use UDP on port 53 for standard queries instead of TCP?',
    options: [
      'UDP encrypts query payloads automatically',
      'UDP avoids the 3-way handshake round-trip latency and resource overhead for lightweight, single-packet requests',
      'Routers drop all TCP packets destined for port 53',
      'TCP does not support domain names with dots'
    ],
    correct: 1,
    explanation: 'Standard DNS queries fit in a single 512-byte UDP packet. Using UDP reduces latency and avoids connection state overhead on high-traffic root/authoritative nameservers.'
  },
  {
    id: 16,
    level: 3,
    topic: 'Operating Systems',
    question: 'In the context of the Critical Section Problem, what is Peterson\'s Algorithm used for?',
    options: [
      'Deadlock detection in bank accounts',
      'Software-based mutual exclusion between two cooperating concurrent processes',
      'Dynamic memory allocation in the heap',
      'Disk sector defragmentation'
    ],
    correct: 1,
    explanation: 'Peterson\'s algorithm is a classic software solution for mutual exclusion between two processes using shared boolean flags and a turn variable.'
  },
  {
    id: 17,
    level: 3,
    topic: 'System Design',
    question: 'What is the purpose of a Database Read Replica in high-scale web architectures?',
    options: [
      'To execute ACID schema alterations without downtime',
      'To offload read-heavy SELECT queries from the primary master DB, improving overall read throughput',
      'To provide automated real-time transaction rollbacks',
      'To store uncompressed blob data on SSDs'
    ],
    correct: 1,
    explanation: 'Read replicas asynchronously sync from the write master to handle high-volume read traffic, relieving pressure on the master instance.'
  },

  // --- LEVEL 4: ADVANCED ARCHITECTURE (5 Questions) ---
  {
    id: 18,
    level: 4,
    topic: 'System Design',
    question: 'According to the CAP Theorem, in the presence of a network partition (P), what trade-off must a distributed system make?',
    options: [
      'Performance vs Storage',
      'Consistency (C) vs Availability (A)',
      'Security vs Scalability',
      'Throughput vs Durability'
    ],
    correct: 1,
    explanation: 'When network partitions occur between distributed nodes, the system must choose between returning consistent errors/stalls (Consistency) or returning potentially stale data (Availability).'
  },
  {
    id: 19,
    level: 4,
    topic: 'DBMS',
    question: 'How does Write-Ahead Logging (WAL) ensure durability and crash recovery in transactional databases?',
    options: [
      'It writes data to disk before executing the application code',
      'Log records describing changes are flushed to non-volatile disk BEFORE corresponding dirty database pages are written to disk',
      'It stores all user passwords in a plain text log file',
      'It removes the need for transaction commit statements'
    ],
    correct: 1,
    explanation: 'WAL guarantees that before any dirty buffer pool page is persisted to the table file on disk, the redo/undo log entries must already be flushed to disk.'
  },
  {
    id: 20,
    level: 4,
    topic: 'Operating Systems',
    question: 'Under the MESI cache coherence protocol, what does the "E" state stand for?',
    options: [
      'Evicted',
      'Exclusive (line is present only in this cache and clean)',
      'Error in parity check',
      'Expired'
    ],
    correct: 1,
    explanation: 'MESI stands for Modified, Exclusive, Shared, Invalid. In Exclusive state, the cache line is valid only in this cache and matches main memory.'
  },
  {
    id: 21,
    level: 4,
    topic: 'System Design',
    question: 'What is the primary role of a Leader in the Raft Consensus Algorithm?',
    options: [
      'Compiling client source code',
      'Accepting client log commands, replicating them to followers, and deciding when it is safe to commit them',
      'Assigning IP addresses to cluster nodes via DHCP',
      'Terminating failing follower nodes'
    ],
    correct: 1,
    explanation: 'In Raft, the elected leader handles all client writes, sequences log entries, replicates them across a majority of followers, and drives commits.'
  },
  {
    id: 22,
    level: 4,
    topic: 'Computer Networks',
    question: 'What issue does the TCP Nagle Algorithm solve, and what is its side effect on real-time interactive games?',
    options: [
      'Prevents SYN flood attacks; causes memory leaks',
      'Avoids sending tiny packets (small-packet problem) by buffering until ACK arrives; causes latency delays for small interactive payloads',
      'Enforces TLS encryption; increases packet size',
      'Enables UDP fallback; drops TCP sessions'
    ],
    correct: 1,
    explanation: 'Nagle\'s algorithm buffers small outgoing packets until an entire MSS is accumulated or prior packet is ACKed. Real-time apps disable it via TCP_NODELAY to avoid round-trip buffering latency.'
  },

  // --- LEVEL 5: FAANG & TIER-1 MASTERY (5 Questions) ---
  {
    id: 23,
    level: 5,
    topic: 'Operating Systems',
    question: 'Why is Linux `epoll` scalable to 100,000+ concurrent sockets (C10K/C1000K problem) whereas `select()` and `poll()` degrade to O(N)?',
    options: [
      '`epoll` runs in user-space without any system calls',
      '`epoll` uses kernel event callbacks and returns only the subset of file descriptors that have ready I/O events, running in O(1) or O(ready)',
      '`epoll` converts TCP streams into raw UDP',
      '`epoll` uses hardware GPU acceleration for network sockets'
    ],
    correct: 1,
    explanation: '`select` and `poll` require copying and linear scanning of all N watched file descriptors on every call. `epoll` registers callbacks in kernel red-black tree and ready-list, returning only the active events.'
  },
  {
    id: 24,
    level: 5,
    topic: 'DBMS',
    question: 'How does Multi-Version Concurrency Control (MVCC) in PostgreSQL enable concurrent reads and writes without locking?',
    options: [
      'By converting all writes into in-memory Redis keys',
      'By creating new versions of row tuples with xmin/xmax transaction visibility IDs so readers see consistent snapshots while writers append new versions',
      'By rejecting any read that conflicts with an active writer',
      'By running all queries single-threaded on a dedicated core'
    ],
    correct: 1,
    explanation: 'In MVCC, "readers never block writers, and writers never block readers". Each row tuple is tagged with transaction IDs (xmin/xmax), enabling snapshot isolation.'
  },
  {
    id: 25,
    level: 5,
    topic: 'System Design',
    question: 'What is the purpose of a Bloom Filter in distributed key-value stores like Apache Cassandra or Google Bigtable?',
    options: [
      'To sort SSTable records alphabetically',
      'To provide a space-efficient probabilistic check that determines if a key definitely does NOT exist in an SSTable, preventing unnecessary disk I/O reads',
      'To encrypt table contents with AES-256',
      'To calculate replica latency'
    ],
    correct: 1,
    explanation: 'Bloom filters have no false negatives: if it returns false, the key is guaranteed not to be in the SSTable file, completely bypassing expensive disk seeks.'
  },
  {
    id: 26,
    level: 5,
    topic: 'Computer Networks',
    question: 'How does the TCP BBR (Bottleneck Bandwidth and RTT) congestion control algorithm differ from loss-based algorithms like Cubic or Reno?',
    options: [
      'It considers packet loss as the primary signal of network saturation',
      'It builds a model of the physical pipe by probing maximum bandwidth (BtlBw) and minimum round-trip time (RTprop), maximizing throughput while minimizing bufferbloat queues',
      'It limits throughput to 10 Mbps to avoid packet loss',
      'It requires dedicated Google hardware routers'
    ],
    correct: 1,
    explanation: 'Traditional TCP treats packet loss as congestion, leading to queue buildup (bufferbloat). BBR regulates transmission to the exact bottleneck bandwidth and propagation delay.'
  },
  {
    id: 27,
    level: 5,
    topic: 'System Design',
    question: 'In a distributed Two-Phase Commit (2PC) protocol, what fatal vulnerability occurs if the Coordinator crashes permanently during the second phase (Commit Phase)?',
    options: [
      'All databases automatically revert to initial empty state',
      'Participant nodes that prepared and voted "Yes" remain blocked indefinitely, holding table locks because they cannot independently decide whether to commit or abort',
      'The client machine crashes and reboots',
      'Network cards reset their MAC addresses'
    ],
    correct: 1,
    explanation: '2PC is a blocking protocol: if the coordinator dies during the commit phase after participants have prepared, participants cannot know if other nodes committed or aborted, causing indefinite resource locking.'
  }
];

export const CsFundamentalsView: React.FC = () => {
  const [selectedLevel, setSelectedLevel] = useState<number>(1);
  const [unlockedLevels, setUnlockedLevels] = useState<number[]>([1, 2, 3, 4, 5]); // All unlocked for full practice
  const [currentIdxInLevel, setCurrentIdxInLevel] = useState<number>(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [showExplanation, setShowExplanation] = useState<boolean>(false);
  const [levelScores, setLevelScores] = useState<Record<number, number>>({ 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 });
  const [levelCompleted, setLevelCompleted] = useState<Record<number, boolean>>({});

  const levelTitles: Record<number, { name: string; tag: string; xp: string; color: string }> = {
    1: { name: 'Level 1: Foundation', tag: 'Beginner', xp: '+100 XP', color: 'from-emerald-500 to-teal-600' },
    2: { name: 'Level 2: Core CS', tag: 'Intermediate', xp: '+150 XP', color: 'from-blue-500 to-indigo-600' },
    3: { name: 'Level 3: Systems & DB', tag: 'Advanced', xp: '+200 XP', color: 'from-purple-500 to-indigo-600' },
    4: { name: 'Level 4: Architecture', tag: 'Hard', xp: '+250 XP', color: 'from-amber-500 to-orange-600' },
    5: { name: 'Level 5: FAANG Mastery', tag: 'Expert', xp: '+350 XP', color: 'from-rose-500 to-pink-600' },
  };

  const currentLevelQuestions = LEVELED_MCQS.filter((q) => q.level === selectedLevel);
  const currentQ = currentLevelQuestions[currentIdxInLevel] || currentLevelQuestions[0];

  const handleSelectOption = (idx: number) => {
    if (showExplanation) return;
    setSelectedOption(idx);
    setShowExplanation(true);

    if (idx === currentQ.correct) {
      setLevelScores((prev) => ({
        ...prev,
        [selectedLevel]: (prev[selectedLevel] || 0) + 1,
      }));
    }
  };

  const handleNext = () => {
    if (currentIdxInLevel < currentLevelQuestions.length - 1) {
      setCurrentIdxInLevel((prev) => prev + 1);
      setSelectedOption(null);
      setShowExplanation(false);
    } else {
      // Level Completed
      setLevelCompleted((prev) => ({ ...prev, [selectedLevel]: true }));
    }
  };

  const handlePrev = () => {
    if (currentIdxInLevel > 0) {
      setCurrentIdxInLevel((prev) => prev - 1);
      setSelectedOption(null);
      setShowExplanation(false);
    }
  };

  const handleResetLevel = () => {
    setCurrentIdxInLevel(0);
    setSelectedOption(null);
    setShowExplanation(false);
    setLevelScores((prev) => ({ ...prev, [selectedLevel]: 0 }));
    setLevelCompleted((prev) => ({ ...prev, [selectedLevel]: false }));
  };

  const handleSwitchLevel = (lvl: number) => {
    setSelectedLevel(lvl);
    setCurrentIdxInLevel(0);
    setSelectedOption(null);
    setShowExplanation(false);
  };

  return (
    <div className="space-y-5 max-w-4xl mx-auto pb-8">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-[#0b101e] border border-slate-800/80 rounded-3xl p-5 shadow-lg">
        <div>
          <div className="flex items-center gap-2">
            <Layers className="h-5 w-5 text-sky-400" />
            <h1 className="text-lg font-black text-white tracking-tight">CS Fundamentals & MCQs</h1>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
              27 Questions
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Tier-1 Placement Question Bank organized in 5 difficulty levels
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="px-3 py-1.5 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-bold flex items-center gap-1.5">
            <Trophy className="h-4 w-4 text-amber-400" />
            <span>Score: {levelScores[selectedLevel] || 0}/{currentLevelQuestions.length}</span>
          </div>
        </div>
      </div>

      {/* 5 Levels Selector Bar matching Requirement */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
        {([1, 2, 3, 4, 5] as const).map((lvl) => {
          const isSelected = selectedLevel === lvl;
          const isDone = !!levelCompleted[lvl];
          const info = levelTitles[lvl];

          return (
            <button
              key={lvl}
              onClick={() => handleSwitchLevel(lvl)}
              className={`p-3 rounded-2xl border transition-all flex flex-col items-center justify-center text-center relative group active:scale-[0.98] ${
                isSelected
                  ? 'bg-blue-600 border-blue-400 text-white shadow-lg shadow-blue-600/30'
                  : 'bg-[#0b101e] hover:bg-[#0e1424] border-slate-800 text-slate-300'
              }`}
            >
              {isDone && (
                <span className="absolute top-2 right-2 h-2 w-2 rounded-full bg-emerald-400 ring-2 ring-[#0b101e]" />
              )}
              <div className="flex items-center gap-1 mb-1">
                <span className="text-xs font-black">Level {lvl}</span>
              </div>
              <span className={`text-[10px] font-medium truncate w-full ${isSelected ? 'text-blue-100' : 'text-slate-400'}`}>
                {info.tag}
              </span>
              <span className={`text-[9px] font-mono mt-1 ${isSelected ? 'text-amber-200 font-bold' : 'text-slate-500'}`}>
                {info.xp}
              </span>
            </button>
          );
        })}
      </div>

      {/* Main Question Card or Level Completed Celebration */}
      {levelCompleted[selectedLevel] ? (
        <div className="bg-[#0b101e] border border-slate-800/80 rounded-3xl p-8 text-center space-y-4 shadow-xl">
          <div className="h-16 w-16 rounded-full bg-gradient-to-tr from-amber-400 to-yellow-600 flex items-center justify-center mx-auto text-3xl shadow-xl shadow-amber-500/20 animate-bounce">
            🏆
          </div>
          <h2 className="text-xl font-black text-white">Level {selectedLevel} Completed!</h2>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            You scored {levelScores[selectedLevel]} out of {currentLevelQuestions.length} correct in {levelTitles[selectedLevel].name}.
          </p>

          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-black font-mono">
            <Zap className="h-4 w-4 text-amber-400 fill-amber-400" />
            <span>Earned {levelTitles[selectedLevel].xp} for your Placement Readiness</span>
          </div>

          <div className="flex items-center justify-center gap-3 pt-3">
            <button
              onClick={handleResetLevel}
              className="px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 text-xs font-bold border border-slate-800 transition flex items-center gap-2"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              <span>Retry Level</span>
            </button>
            {selectedLevel < 5 && (
              <button
                onClick={() => handleSwitchLevel(selectedLevel + 1)}
                className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold shadow-md shadow-blue-600/30 transition flex items-center gap-2"
              >
                <span>Proceed to Level {selectedLevel + 1}</span>
                <ArrowRight className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>
      ) : (
        <div className="bg-[#0b101e] border border-slate-800/80 rounded-3xl p-5 sm:p-7 shadow-xl space-y-5">
          {/* Progress row */}
          <div className="flex items-center justify-between pb-3 border-b border-slate-800/70">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-indigo-500/15 text-sky-400 border border-indigo-500/30">
                {currentQ.topic}
              </span>
              <span className="text-xs font-bold text-slate-400">
                {levelTitles[selectedLevel].name}
              </span>
            </div>
            <span className="text-xs font-mono text-slate-400 font-bold">
              Question {currentIdxInLevel + 1} of {currentLevelQuestions.length}
            </span>
          </div>

          {/* Progress bar */}
          <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full transition-all duration-300"
              style={{ width: `${((currentIdxInLevel + 1) / currentLevelQuestions.length) * 100}%` }}
            />
          </div>

          {/* Question Text */}
          <h2 className="text-sm sm:text-base font-extrabold text-white leading-relaxed">
            {currentQ.question}
          </h2>

          {/* Options */}
          <div className="space-y-2.5">
            {currentQ.options.map((opt, idx) => {
              const isSelected = selectedOption === idx;
              const isCorrect = idx === currentQ.correct;

              let btnStyle = 'bg-[#0e1424] border-slate-800 text-slate-200 hover:border-indigo-500/50 hover:bg-[#11192e]';
              if (showExplanation) {
                if (isCorrect) {
                  btnStyle = 'bg-emerald-950/40 border-emerald-500/70 text-emerald-300 font-bold';
                } else if (isSelected) {
                  btnStyle = 'bg-rose-950/40 border-rose-500/70 text-rose-300 font-bold';
                } else {
                  btnStyle = 'bg-[#0e1424]/60 border-slate-800/60 text-slate-500 opacity-60';
                }
              }

              return (
                <button
                  key={idx}
                  onClick={() => handleSelectOption(idx)}
                  className={`w-full text-left p-3.5 sm:p-4 rounded-2xl border text-xs transition-all flex items-center justify-between gap-3 active:scale-[0.99] ${btnStyle}`}
                >
                  <div className="flex items-center gap-3">
                    <span className="h-6 w-6 rounded-lg bg-slate-900 border border-slate-700/80 flex items-center justify-center font-bold font-mono text-[10px] text-slate-400 shrink-0">
                      {String.fromCharCode(65 + idx)}
                    </span>
                    <span className="leading-snug">{opt}</span>
                  </div>

                  {showExplanation && isCorrect && (
                    <CheckCircle2 className="h-5 w-5 text-emerald-400 shrink-0" />
                  )}
                  {showExplanation && isSelected && !isCorrect && (
                    <XCircle className="h-5 w-5 text-rose-400 shrink-0" />
                  )}
                </button>
              );
            })}
          </div>

          {/* Explanation Card */}
          {showExplanation && (
            <div className="p-4 rounded-2xl bg-gradient-to-br from-[#0c1426] to-[#090d18] border border-indigo-500/30 text-xs text-slate-300 space-y-1.5 animate-fadeIn">
              <div className="flex items-center gap-1.5 text-sky-400 font-bold">
                <Sparkles className="h-4 w-4" />
                <span>Technical Explanation:</span>
              </div>
              <p className="leading-relaxed">{currentQ.explanation}</p>
            </div>
          )}

          {/* Footer Controls: Prev, Next, Question Ticker */}
          <div className="flex items-center justify-between pt-2 border-t border-slate-800/60">
            <button
              onClick={handlePrev}
              disabled={currentIdxInLevel === 0}
              className={`px-3.5 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition ${
                currentIdxInLevel === 0
                  ? 'text-slate-600 bg-slate-900/40 cursor-not-allowed'
                  : 'text-slate-300 bg-slate-900 hover:bg-slate-800 border border-slate-800'
              }`}
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              <span>Previous</span>
            </button>

            <button
              onClick={handleNext}
              className="px-5 py-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-xs font-bold shadow-md shadow-indigo-600/30 flex items-center gap-1.5 transition"
            >
              <span>{currentIdxInLevel === currentLevelQuestions.length - 1 ? 'Finish Level' : 'Next Question'}</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
