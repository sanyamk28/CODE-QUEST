import React, { useState, useMemo } from 'react';
import {
  Puzzle,
  Lightbulb,
  Eye,
  EyeOff,
  Sparkles,
  CheckCircle2,
  ChevronRight,
  Shuffle,
  Building2,
  Search,
  Filter,
  Briefcase,
  Layers,
  Award,
  RotateCcw,
  ExternalLink,
  HelpCircle
} from 'lucide-react';
import { recordActivity } from '../../services/activityTracker';
import { getRandomPuzzle, getRandomPuzzleOrScenario, RandomPuzzleScenario } from '../../services/api';

export interface BrainteaserItem {
  id: number | string;
  title: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  category: string;
  desc: string;
  hints: string[];
  solution: string;
  companyTags: string[];
  xp?: number;
  source?: 'curated' | 'api';
}

const INITIAL_PUZZLES: BrainteaserItem[] = [
  {
    id: 1,
    title: 'The 25 Horses Puzzle',
    difficulty: 'Medium',
    category: 'Logic & Sorting',
    companyTags: ['Google', 'Meta', 'Uber', 'DE Shaw'],
    xp: 35,
    desc: 'There are 25 horses and a track that allows only 5 horses to race at a time. What is the minimum number of races needed to determine the top 3 fastest horses without any stopwatch?',
    hints: [
      'Start with 5 initial heats containing 5 horses each.',
      'Race the 5 winners against each other in Race 6.',
      'Carefully eliminate horses that are mathematically excluded from being in the top 3.'
    ],
    solution: 'Answer: 7 races.\n1. Run 5 races (5 horses each) to rank horses inside each group (A1>A2>A3>A4>A5, B1>B2>..., etc.).\n2. Race 6: Race the 5 winners (A1, B1, C1, D1, E1). Suppose order is A1 > B1 > C1 > D1 > E1. A1 is guaranteed the overall 1st fastest horse.\n3. Race 7: Only 5 horses have any remaining mathematical possibility of taking 2nd or 3rd: A2, A3, B1, B2, and C1. The top 2 in Race 7 become the overall 2nd and 3rd fastest horses.'
  },
  {
    id: 2,
    title: 'The Burning Ropes (45 Minutes)',
    difficulty: 'Easy',
    category: 'Measurement',
    companyTags: ['Amazon', 'Microsoft', 'Adobe'],
    xp: 25,
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
    companyTags: ['Goldman Sachs', 'Morgan Stanley', 'Bloomberg'],
    xp: 20,
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
    category: 'Probability & Quant',
    companyTags: ['Google', 'Jane Street', 'Citadel', 'DE Shaw'],
    xp: 35,
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
    companyTags: ['Google', 'Microsoft', 'Amazon', 'Tower Research'],
    xp: 50,
    desc: 'You have 1,000 bottles of wine. Exactly 1 bottle is poisoned. The poison takes 24 hours to kill a mouse. You have 10 mice and exactly 24 hours to identify the poisoned bottle. How do you do it in a single round?',
    hints: [
      'Notice that 2¹⁰ = 1,024, which is greater than 1,000.',
      'Assign each bottle a 10-bit binary index from 1 to 1000.'
    ],
    solution: 'Answer: Label the bottles in binary from 1 (0000000001) to 1000 (1111101000). Label the 10 mice from bit 0 to bit 9. For each bottle, if the k-th bit is 1, feed a drop from that bottle to mouse k. After 24 hours, the binary pattern of which mice died yields the exact index of the poisoned bottle.'
  },
  {
    id: 6,
    title: 'The 3 Light Bulbs and 3 Switches',
    difficulty: 'Easy',
    category: 'Lateral Thinking',
    companyTags: ['Google', 'Microsoft', 'Amazon'],
    xp: 20,
    desc: 'You are in a room with three light switches (all currently in the OFF position) connected to three light bulbs in an adjacent room that you cannot see from where you are. You can only enter the bulb room once. How can you definitively determine which switch controls which bulb?',
    hints: [
      "Bulbs don't just produce light—think about other physical properties.",
      'Can you leave a switch on for a while before turning it off?'
    ],
    solution: 'Answer:\n1. Turn Switch 1 ON and leave it on for 5-10 minutes so the bulb gets hot.\n2. Turn Switch 1 OFF and turn Switch 2 ON.\n3. Immediately walk into the bulb room:\n   - The bulb that is ON is controlled by Switch 2.\n   - The bulb that is OFF but WARM to the touch is controlled by Switch 1.\n   - The bulb that is OFF and COLD is controlled by Switch 3.'
  },
  {
    id: 7,
    title: 'Measuring 4 Liters with 3L and 5L Jugs',
    difficulty: 'Easy',
    category: 'Mathematical Logic',
    companyTags: ['Goldman Sachs', 'Amazon', 'Bloomberg'],
    xp: 20,
    desc: 'You have an unlimited supply of water and two unmarked jugs: one with an exact capacity of 3 liters and another of 5 liters. How can you measure exactly 4 liters of water?',
    hints: [
      'Think about filling the 5-liter jug first and transferring into the 3-liter jug.',
      'Track the remaining volume step by step.'
    ],
    solution: 'Answer:\n1. Fill the 5-liter jug to capacity (5L).\n2. Pour water from the 5L jug into the 3L jug until full. (Now 5L jug has 2L, 3L jug has 3L).\n3. Empty the 3L jug.\n4. Transfer the remaining 2L from the 5L jug into the 3L jug. (Now 3L jug has 2L, 5L jug is empty).\n5. Fill the 5L jug completely (5L).\n6. Pour water from the 5L jug into the 3L jug until it fills (takes exactly 1L since it already held 2L).\n7. Exactly 4 liters remain in the 5-liter jug!'
  },
  {
    id: 8,
    title: 'The Counterfeit Coin among 12 Coins',
    difficulty: 'Hard',
    category: 'Information Theory',
    companyTags: ['Morgan Stanley', 'Tower Research', 'Jane Street'],
    xp: 50,
    desc: 'You are given 12 identical-looking coins. Exactly one coin is counterfeit and has a different weight (you do not know whether it is heavier or lighter than a genuine coin). You have a two-pan balance scale. What is the minimum number of weighings needed to identify the counterfeit coin and determine if it is heavier or lighter?',
    hints: [
      'Each weighing has 3 possible outcomes: Left heavy, Equal, Right heavy (3^k states).',
      'There are 12 coins * 2 possibilities (heavy/light) = 24 candidate outcomes. Note that 3³ = 27 > 24.'
    ],
    solution: 'Answer: Minimum 3 weighings.\n- Weighing 1: Weigh 4 coins against 4 coins (e.g., [1,2,3,4] vs [5,6,7,8]).\n- Case A (Equal): The deviant coin is in [9,10,11,12]. Weigh [9,10,11] against 3 known genuine coins [1,2,3]. If balanced, coin 12 is fake (weigh against 1 genuine coin to determine heavy or light). If tilted, you know heavy/light; compare 9 vs 10 to pinpoint.\n- Case B (Tilted): Substitute 3 coins from left with genuine coins, rotate 3 from right to left, and set aside 2. The outcome narrows down to 3 candidate states, resolved on Weighing 3.'
  },
  {
    id: 9,
    title: 'Bridge and Torch Problem (17 Minutes)',
    difficulty: 'Medium',
    category: 'Optimization',
    companyTags: ['Microsoft', 'Amazon', 'Apple'],
    xp: 30,
    desc: 'Four people must cross a fragile bridge at night. A flashlight is required to cross, and the bridge can support at most two people at a time. The four people cross in 1, 2, 5, and 10 minutes respectively. When two people cross together, they must move at the slower person\'s pace. What is the minimum time needed for all four to cross?',
    hints: [
      'Avoid having the slowest two people (5 and 10 minutes) make separate crossings.',
      'Can the two fastest people carry the flashlight back and forth?'
    ],
    solution: 'Answer: 17 minutes.\n1. Persons 1 and 2 cross together (Time: 2 min, total = 2).\n2. Person 1 returns with the flashlight (Time: 1 min, total = 3).\n3. Persons 5 and 10 cross together (Time: 10 min, total = 13).\n4. Person 2 returns with the flashlight (Time: 2 min, total = 15).\n5. Persons 1 and 2 cross together again (Time: 2 min, total = 17).\nTotal time: 2 + 1 + 10 + 2 + 2 = 17 minutes.'
  },
  {
    id: 10,
    title: 'The Two Egg Drop Problem (100 Floors)',
    difficulty: 'Medium',
    category: 'Dynamic Programming',
    companyTags: ['Google', 'Meta', 'Goldman Sachs'],
    xp: 35,
    desc: 'You are given two identical eggs and a 100-story building. You need to find the highest floor from which an egg can be dropped without breaking. What is the minimum number of drops required in the worst-case scenario?',
    hints: [
      'If you drop from every 10 floors and the first egg breaks, you must test floor by floor with the second egg.',
      'Equalize the total worst-case drops across all floors by stepping by x, x-1, x-2...'
    ],
    solution: 'Answer: 14 drops.\n- Let x be the first floor to drop from. If egg 1 breaks, egg 2 requires at most x-1 drops.\n- If egg 1 does not break, drop from floor x + (x - 1). Each subsequent step decreases by 1 to keep the cumulative drops (drops made so far + remaining worst case) constant.\n- We need x + (x-1) + (x-2) + ... + 1 >= 100.\n- x(x+1)/2 >= 100 => for x = 13, sum is 91; for x = 14, sum is 105 >= 100.\n- Worst-case drops: 14.'
  },
  {
    id: 11,
    title: 'Production Database Pool Exhaustion at 2 AM',
    difficulty: 'Hard',
    category: 'System Design & DevOps',
    companyTags: ['Netflix', 'Stripe', 'Uber', 'Amazon'],
    xp: 45,
    desc: "At 2:00 AM on a Friday, API p99 latency spiked from 45ms to 12,000ms with 'Timeout: connection pool exhausted (max 100 connections)'. DB CPU is only at 18%, memory normal, but all 100 connections are pinned with no traffic surge. Walk through your immediate incident mitigation and root cause isolation.",
    hints: [
      'Low CPU with saturated connections indicates idle-in-transaction or lock contention/slow external network calls in transactions.',
      'Check pg_stat_activity / SHOW PROCESSLIST immediately.'
    ],
    solution: 'Answer:\n1. Immediate Mitigation (0-10 min): Inspect active queries via pg_stat_activity to find long-running lock holders. Terminate blocking transactions with pg_terminate_backend().\n2. Root Cause Isolation: Look for missing session context managers or third-party HTTP/network calls executed inside an open database transaction block.\n3. Long-term Remediation: Enforce idle_in_transaction_session_timeout = 10s, introduce PgBouncer pooling, and enforce static analysis preventing external I/O within transactional boundaries.'
  },
  {
    id: 12,
    title: 'Sudden 10x Flash-Sale Spike & Cascading Outage',
    difficulty: 'Hard',
    category: 'Distributed Systems',
    companyTags: ['Amazon', 'Shopify', 'Flipkart', 'DoorDash'],
    xp: 45,
    desc: 'During a flash sale, traffic surges 10x in under 90s. The Recommendation Service slows down, causing the Checkout Gateway to exhaust worker threads. The checkout flow collapses completely. Design an architectural recovery and graceful degradation strategy.',
    hints: [
      'Should a non-essential service like Recommendations ever block Checkout?',
      'Consider circuit breakers, bulkheading, and static fallback caches.'
    ],
    solution: 'Answer:\n1. Decouple Critical Path: Recommendation calls must never be on the synchronous checkout path.\n2. Circuit Breakers: Implement circuit breakers (e.g. Resilience4j) with tight 200ms timeouts. If tripped, fallback instantly to cached top items or empty suggestions.\n3. Token Bucket Rate Limiting: Prioritize active checkout baskets over passive browsing traffic.\n4. Asynchronous Event Pipelines: Offload inventory sync and email dispatch to Kafka queues.'
  }
];

const getCompanyBadgeClass = (company: string): string => {
  const norm = company.toLowerCase();
  if (norm.includes('google')) return 'bg-blue-500/15 text-blue-400 border-blue-500/30';
  if (norm.includes('amazon')) return 'bg-amber-500/15 text-amber-400 border-amber-500/30';
  if (norm.includes('microsoft')) return 'bg-cyan-500/15 text-cyan-400 border-cyan-500/30';
  if (norm.includes('meta') || norm.includes('facebook')) return 'bg-indigo-500/15 text-indigo-400 border-indigo-500/30';
  if (norm.includes('apple')) return 'bg-slate-300/15 text-slate-200 border-slate-400/30';
  if (norm.includes('netflix')) return 'bg-rose-500/15 text-rose-400 border-rose-500/30';
  if (norm.includes('goldman') || norm.includes('morgan') || norm.includes('street') || norm.includes('citadel') || norm.includes('bloomberg'))
    return 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30';
  if (norm.includes('stripe') || norm.includes('uber') || norm.includes('shopify'))
    return 'bg-purple-500/15 text-purple-400 border-purple-500/30';
  return 'bg-sky-500/15 text-sky-400 border-sky-500/30';
};

const getDifficultyClass = (difficulty: string): string => {
  switch (difficulty) {
    case 'Easy':
      return 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20';
    case 'Medium':
      return 'text-amber-400 bg-amber-500/10 border-amber-500/20';
    case 'Hard':
      return 'text-rose-400 bg-rose-500/10 border-rose-500/20';
    default:
      return 'text-slate-400 bg-slate-500/10 border-slate-500/20';
  }
};

export const BrainteasersView: React.FC = () => {
  const [puzzles, setPuzzles] = useState<BrainteaserItem[]>(INITIAL_PUZZLES);
  const [selectedIdx, setSelectedIdx] = useState(0);
  const [showSolution, setShowSolution] = useState(false);
  const [revealedHints, setRevealedHints] = useState<Record<number, boolean>>({});
  const [solvedMap, setSolvedMap] = useState<Record<string | number, boolean>>({});
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCompanyFilter, setSelectedCompanyFilter] = useState<string>('All');
  const [selectedDifficultyFilter, setSelectedDifficultyFilter] = useState<string>('All');
  const [isRollingRandom, setIsRollingRandom] = useState(false);
  const [randomToast, setRandomToast] = useState<{ title: string; companies: string[] } | null>(null);

  // Extract all unique companies across all puzzles
  const allCompanies = useMemo(() => {
    const set = new Set<string>();
    puzzles.forEach((p) => {
      p.companyTags?.forEach((c) => set.add(c));
    });
    return Array.from(set).sort();
  }, [puzzles]);

  // Filtered puzzle list
  const filteredPuzzles = useMemo(() => {
    return puzzles.filter((p) => {
      const matchesSearch =
        searchQuery.trim() === '' ||
        p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.desc.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.companyTags.some((c) => c.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchesCompany =
        selectedCompanyFilter === 'All' ||
        p.companyTags.some((c) => c.toLowerCase() === selectedCompanyFilter.toLowerCase());

      const matchesDifficulty =
        selectedDifficultyFilter === 'All' ||
        p.difficulty.toLowerCase() === selectedDifficultyFilter.toLowerCase();

      return matchesSearch && matchesCompany && matchesDifficulty;
    });
  }, [puzzles, searchQuery, selectedCompanyFilter, selectedDifficultyFilter]);

  // Ensure selected index points to a valid item in filtered list, or fallback
  const currentP = filteredPuzzles[selectedIdx] || filteredPuzzles[0] || puzzles[0];

  const toggleHint = (hintIdx: number) => {
    setRevealedHints((prev) => ({ ...prev, [hintIdx]: !prev[hintIdx] }));
  };

  const handleSelectPuzzle = (puzzleId: number | string) => {
    const idx = filteredPuzzles.findIndex((p) => p.id === puzzleId);
    if (idx !== -1) {
      setSelectedIdx(idx);
    }
    setShowSolution(false);
    setRevealedHints({});
  };

  const handleToggleSolved = (id: number | string) => {
    const isNowSolved = !solvedMap[id];
    setSolvedMap((prev) => ({ ...prev, [id]: isNowSolved }));
    const xpReward = currentP?.xp || 20;
    recordActivity('puzzle', { xp: isNowSolved ? xpReward : 0, delta: isNowSolved ? 1 : -1 });
  };

  // Get a Random Question feature (fetches from API or shuffles locally)
  const handleGetRandomQuestion = async () => {
    setIsRollingRandom(true);
    try {
      // 1. Try to fetch a random puzzle from backend API
      const apiItem: RandomPuzzleScenario = await getRandomPuzzleOrScenario({
        type: 'puzzle',
        difficulty: selectedDifficultyFilter !== 'All' ? selectedDifficultyFilter : undefined
      });

      if (apiItem && apiItem.title) {
        const companyTags =
          apiItem.company_tags && apiItem.company_tags.length > 0
            ? apiItem.company_tags
            : ['Google', 'Amazon', 'Microsoft'];

        const newPuzzle: BrainteaserItem = {
          id: apiItem.id || `api-${Date.now()}`,
          title: apiItem.title,
          difficulty: (apiItem.difficulty as 'Easy' | 'Medium' | 'Hard') || 'Medium',
          category: apiItem.category || 'Logic & Reasoning',
          desc: apiItem.description,
          hints: apiItem.hints && apiItem.hints.length > 0 ? apiItem.hints : [
            'Break down the constraints into smaller sub-problems.',
            'Consider the edge-case boundaries.'
          ],
          solution: apiItem.solution || apiItem.sample_approach || 'Structured analytical solution applied.',
          companyTags: companyTags,
          xp: apiItem.xp_reward || 25,
          source: 'api'
        };

        // Check if puzzle already exists in puzzles list
        setPuzzles((prev) => {
          const exists = prev.some(
            (p) => String(p.id) === String(newPuzzle.id) || p.title.toLowerCase() === newPuzzle.title.toLowerCase()
          );
          if (!exists) {
            return [newPuzzle, ...prev];
          }
          return prev;
        });

        // Clear filters if current filters would hide the random question
        if (
          selectedCompanyFilter !== 'All' &&
          !companyTags.some((c) => c.toLowerCase() === selectedCompanyFilter.toLowerCase())
        ) {
          setSelectedCompanyFilter('All');
        }

        // Select the new puzzle
        setTimeout(() => {
          const targetIndex = 0; // Newly added is at index 0 or find existing
          setSelectedIdx(targetIndex);
          setShowSolution(false);
          setRevealedHints({});
          setRandomToast({
            title: newPuzzle.title,
            companies: newPuzzle.companyTags
          });
          setTimeout(() => setRandomToast(null), 4500);
        }, 50);

        setIsRollingRandom(false);
        return;
      }
    } catch {
      // Fallback: Pick a random item from available puzzles
      const pool = filteredPuzzles.length > 0 ? filteredPuzzles : puzzles;
      if (pool.length > 0) {
        let randIdx = Math.floor(Math.random() * pool.length);
        if (pool.length > 1 && pool[randIdx]?.id === currentP?.id) {
          randIdx = (randIdx + 1) % pool.length;
        }
        const picked = pool[randIdx];
        handleSelectPuzzle(picked.id);
        setRandomToast({
          title: picked.title,
          companies: picked.companyTags
        });
        setTimeout(() => setRandomToast(null), 4500);
      }
    } finally {
      setIsRollingRandom(false);
    }
  };

  return (
    <div className="space-y-4 max-w-6xl mx-auto pb-6">
      {/* Toast Notification when a Random Question is Loaded */}
      {randomToast && (
        <div className="bg-gradient-to-r from-indigo-900/90 via-blue-900/90 to-purple-900/90 border border-indigo-500/40 rounded-2xl p-3.5 px-4 shadow-xl shadow-indigo-900/20 flex items-center justify-between animate-fadeIn transition-all">
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 rounded-xl bg-indigo-500/20 border border-indigo-400/40 flex items-center justify-center text-indigo-300 shrink-0">
              <Shuffle className="h-4 w-4 animate-spin" />
            </div>
            <div>
              <div className="text-xs font-bold text-white flex items-center gap-1.5">
                <span>🎲 Random Question Loaded:</span>
                <span className="text-sky-300 underline font-semibold">{randomToast.title}</span>
              </div>
              <div className="text-[11px] text-slate-300 mt-0.5 flex items-center gap-1.5 flex-wrap">
                <span className="text-slate-400">Asked at:</span>
                {randomToast.companies.map((comp) => (
                  <span
                    key={comp}
                    className="px-1.5 py-0.5 rounded-md text-[10px] font-semibold bg-white/10 text-white border border-white/20"
                  >
                    {comp}
                  </span>
                ))}
              </div>
            </div>
          </div>
          <button
            onClick={() => setRandomToast(null)}
            className="text-slate-400 hover:text-white text-xs px-2 py-1"
          >
            ✕
          </button>
        </div>
      )}

      {/* Top Banner / Actions Bar */}
      <div className="bg-[#0b101e] border border-slate-800/80 rounded-2xl p-4 shadow-lg flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-2xl bg-gradient-to-br from-amber-500/20 to-orange-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400 shrink-0">
            <Puzzle className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-base font-black text-white flex items-center gap-2">
              Brainteasers & Placement Puzzles
              <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-amber-500/10 text-amber-400 border border-amber-500/20">
                FAANG & Tier-1
              </span>
            </h1>
            <p className="text-xs text-slate-400">
              Master logic riddles, quant scenarios, and lateral thinking questions asked in real interviews.
            </p>
          </div>
        </div>

        {/* Quick Action: Random Question Button */}
        <button
          onClick={handleGetRandomQuestion}
          disabled={isRollingRandom}
          className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white text-xs font-bold shadow-lg shadow-indigo-600/30 flex items-center justify-center gap-2 transition active:scale-95 disabled:opacity-60"
        >
          <Shuffle className={`h-4 w-4 ${isRollingRandom ? 'animate-spin' : ''}`} />
          <span>{isRollingRandom ? 'Rolling Random...' : '🎲 Random Question'}</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 min-h-[640px]">
        {/* Left Column: Search, Company Filter, and Puzzle Directory */}
        <div className="lg:col-span-5 bg-[#0b101e] border border-slate-800/80 rounded-3xl p-4 shadow-lg flex flex-col space-y-3">
          {/* Header & Solved Counter */}
          <div className="flex items-center justify-between pb-2 border-b border-slate-800/60 px-1">
            <div className="flex items-center gap-1.5">
              <Layers className="h-3.5 w-3.5 text-sky-400" />
              <h2 className="text-xs font-bold uppercase tracking-wider text-sky-400">
                Puzzles Directory ({filteredPuzzles.length})
              </h2>
            </div>
            <span className="text-[10px] text-emerald-400 font-mono font-bold bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
              {Object.values(solvedMap).filter(Boolean).length}/{puzzles.length} Solved
            </span>
          </div>

          {/* Search Box */}
          <div className="relative">
            <Search className="h-3.5 w-3.5 absolute left-3 top-3 text-slate-500" />
            <input
              type="text"
              placeholder="Search title, category, company..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 bg-[#080d19] border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 transition"
            />
          </div>

          {/* Company & Difficulty Filters */}
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1 flex items-center gap-1">
                <Building2 className="h-3 w-3 text-sky-400" /> Company Tag
              </label>
              <select
                value={selectedCompanyFilter}
                onChange={(e) => setSelectedCompanyFilter(e.target.value)}
                className="w-full bg-[#080d19] border border-slate-800 rounded-xl px-2 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-sky-500 transition"
              >
                <option value="All">All Companies ({allCompanies.length})</option>
                {allCompanies.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1 flex items-center gap-1">
                <Filter className="h-3 w-3 text-purple-400" /> Difficulty
              </label>
              <select
                value={selectedDifficultyFilter}
                onChange={(e) => setSelectedDifficultyFilter(e.target.value)}
                className="w-full bg-[#080d19] border border-slate-800 rounded-xl px-2 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-purple-500 transition"
              >
                <option value="All">All Difficulties</option>
                <option value="Easy">Easy</option>
                <option value="Medium">Medium</option>
                <option value="Hard">Hard</option>
              </select>
            </div>
          </div>

          {/* Reset Filters Chip if active */}
          {(searchQuery || selectedCompanyFilter !== 'All' || selectedDifficultyFilter !== 'All') && (
            <div className="flex items-center justify-between text-[11px] px-2 py-1 bg-slate-900/80 rounded-lg border border-slate-800">
              <span className="text-slate-400">Filters active</span>
              <button
                onClick={() => {
                  setSearchQuery('');
                  setSelectedCompanyFilter('All');
                  setSelectedDifficultyFilter('All');
                }}
                className="text-sky-400 hover:text-sky-300 font-semibold flex items-center gap-1"
              >
                <RotateCcw className="h-3 w-3" /> Reset
              </button>
            </div>
          )}

          {/* Puzzle List */}
          <div className="space-y-2 overflow-y-auto flex-1 max-h-[500px] scrollbar-thin pr-1">
            {filteredPuzzles.length === 0 ? (
              <div className="p-8 text-center text-slate-500 text-xs">
                No brainteasers match your search criteria.
              </div>
            ) : (
              filteredPuzzles.map((p) => {
                const isSelected = currentP?.id === p.id;
                const isSolved = !!solvedMap[p.id];

                return (
                  <div
                    key={p.id}
                    onClick={() => handleSelectPuzzle(p.id)}
                    className={`p-3 rounded-2xl cursor-pointer transition-all border flex flex-col space-y-2 ${
                      isSelected
                        ? 'bg-blue-600/15 border-blue-500/50 shadow-md shadow-blue-500/10 text-white'
                        : 'bg-[#080d19]/60 hover:bg-slate-800/40 border-slate-800/70 text-slate-300'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0 flex-1">
                        <div className="text-xs font-bold truncate flex items-center gap-1.5">
                          <span>{p.title}</span>
                          {p.source === 'api' && (
                            <span className="px-1 py-0.2 rounded text-[9px] font-mono bg-purple-500/20 text-purple-300 border border-purple-500/30">
                              API
                            </span>
                          )}
                        </div>
                        <div className="text-[10px] text-slate-400 mt-0.5 flex items-center gap-1.5">
                          <span>{p.category}</span>
                          <span>•</span>
                          <span
                            className={`px-1.5 py-0.2 rounded font-semibold border ${getDifficultyClass(
                              p.difficulty
                            )}`}
                          >
                            {p.difficulty}
                          </span>
                        </div>
                      </div>

                      {isSolved && (
                        <span className="h-5 w-5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 flex items-center justify-center text-[10px] shrink-0 font-bold">
                          ✓
                        </span>
                      )}
                    </div>

                    {/* Company Tags Micro-Pills */}
                    {p.companyTags && p.companyTags.length > 0 && (
                      <div className="flex items-center gap-1 flex-wrap pt-0.5">
                        <Building2 className="h-3 w-3 text-slate-500 shrink-0" />
                        {p.companyTags.slice(0, 3).map((comp) => (
                          <span
                            key={comp}
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedCompanyFilter(comp);
                            }}
                            title={`Filter by ${comp}`}
                            className={`text-[9px] font-medium px-1.5 py-0.5 rounded-md border transition hover:opacity-80 ${getCompanyBadgeClass(
                              comp
                            )}`}
                          >
                            {comp}
                          </span>
                        ))}
                        {p.companyTags.length > 3 && (
                          <span className="text-[9px] text-slate-500 font-mono">
                            +{p.companyTags.length - 3}
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right Column: Active Puzzle Details */}
        <div className="lg:col-span-7 bg-[#0b101e] border border-slate-800/80 rounded-3xl p-6 shadow-xl space-y-5 flex flex-col justify-between">
          {currentP ? (
            <div className="space-y-5">
              {/* Header */}
              <div className="pb-4 border-b border-slate-800/80 space-y-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3">
                    <div className="h-10 w-10 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 shrink-0 mt-0.5">
                      <Puzzle className="h-5 w-5" />
                    </div>
                    <div>
                      <h1 className="text-base sm:text-lg font-black text-white">{currentP.title}</h1>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-xs font-semibold text-slate-400">{currentP.category}</span>
                        <span className="text-slate-600">•</span>
                        <span
                          className={`text-xs px-2 py-0.5 rounded-md font-bold border ${getDifficultyClass(
                            currentP.difficulty
                          )}`}
                        >
                          {currentP.difficulty}
                        </span>
                        <span className="text-xs text-amber-400/90 font-bold ml-1">
                          +{currentP.xp || 20} XP
                        </span>
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => handleToggleSolved(currentP.id)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 shrink-0 ${
                      solvedMap[currentP.id]
                        ? 'bg-emerald-600/20 text-emerald-300 border border-emerald-500/40 shadow-sm'
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

                {/* Prominently Mention Company Tags */}
                <div className="pt-2 flex items-center gap-2 flex-wrap">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-slate-400">
                    <Briefcase className="h-3.5 w-3.5 text-sky-400" />
                    <span>Frequently Asked In:</span>
                  </div>
                  <div className="flex items-center gap-1.5 flex-wrap">
                    {currentP.companyTags && currentP.companyTags.length > 0 ? (
                      currentP.companyTags.map((comp) => (
                        <button
                          key={comp}
                          onClick={() => setSelectedCompanyFilter(comp)}
                          title={`Click to filter all ${comp} puzzles`}
                          className={`text-xs font-semibold px-2.5 py-1 rounded-xl border flex items-center gap-1 transition hover:scale-105 ${getCompanyBadgeClass(
                            comp
                          )}`}
                        >
                          <Building2 className="h-3 w-3 opacity-70" />
                          <span>{comp}</span>
                        </button>
                      ))
                    ) : (
                      <span className="text-xs text-slate-500 italic">Top Tech Companies</span>
                    )}
                  </div>
                </div>
              </div>

              {/* Problem Statement */}
              <div className="space-y-1.5">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                  Problem Statement
                </span>
                <div className="p-4 rounded-2xl bg-[#0e1424] border border-slate-800/80 text-xs sm:text-sm text-slate-200 leading-relaxed font-medium">
                  {currentP.desc}
                </div>
              </div>

              {/* Hints Section */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-xs font-bold text-sky-400">
                    <Lightbulb className="h-4 w-4" />
                    <span>Hints ({currentP.hints.length})</span>
                  </div>
                  <span className="text-[10px] text-slate-500">Click to reveal step-by-step</span>
                </div>

                <div className="space-y-2">
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
                        <span className="text-[10px] font-mono font-semibold text-sky-400">
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
          ) : (
            <div className="p-12 text-center text-slate-500 text-sm">
              No puzzle selected.
            </div>
          )}

          {/* Footer Actions: Solution Toggle, Random Question & Navigation */}
          <div className="pt-4 border-t border-slate-800/80 flex items-center justify-between flex-wrap gap-2">
            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowSolution(!showSolution)}
                className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-xs font-bold shadow-md shadow-indigo-600/30 flex items-center gap-2 transition"
              >
                {showSolution ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                <span>{showSolution ? 'Hide Solution' : 'Reveal Solution'}</span>
              </button>

              <button
                onClick={handleGetRandomQuestion}
                disabled={isRollingRandom}
                title="Get another random question"
                className="px-3 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700/60 text-slate-300 text-xs font-bold flex items-center gap-1.5 transition active:scale-95"
              >
                <Shuffle className={`h-3.5 w-3.5 ${isRollingRandom ? 'animate-spin text-sky-400' : ''}`} />
                <span>Next Random</span>
              </button>
            </div>

            {filteredPuzzles.length > 1 && (
              <button
                onClick={() => {
                  const nextIdx = (selectedIdx + 1) % filteredPuzzles.length;
                  handleSelectPuzzle(filteredPuzzles[nextIdx].id);
                }}
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
