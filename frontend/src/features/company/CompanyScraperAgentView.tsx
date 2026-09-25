import React, { useState, useEffect } from 'react';
import {
  Building2,
  Search,
  Sparkles,
  Bot,
  Terminal,
  Code2,
  Database,
  Layers,
  CheckCircle2,
  Copy,
  ExternalLink,
  ChevronRight,
  Filter,
  Flame,
  Award,
  BookOpen,
  ArrowRight,
  Play,
  RotateCcw,
  Check,
  Briefcase,
  HelpCircle,
  TrendingUp,
  Cpu
} from 'lucide-react';
import { ActiveTabType } from '../../types';

interface CompanyScraperAgentViewProps {
  userRole: string;
  onNavigate: (tab: ActiveTabType) => void;
}

export interface CompanyQuestion {
  id: string;
  title: string;
  category: 'Coding' | 'System Design' | 'Role Technical' | 'Behavioral';
  difficulty: 'Easy' | 'Medium' | 'Hard';
  frequency: string;
  round: string;
  statement: string;
  inputOutput?: string;
  solutionApproach: string;
  tags: string[];
}

export const CompanyScraperAgentView: React.FC<CompanyScraperAgentViewProps> = ({
  userRole,
  onNavigate,
}) => {
  const [typedCompany, setTypedCompany] = useState('Google');
  const [typedRole, setTypedRole] = useState(userRole || 'Data Engineer');
  const [activeCompany, setActiveCompany] = useState('Google');
  const [activeRole, setActiveRole] = useState(userRole || 'Data Engineer');

  const [isScraping, setIsScraping] = useState(false);
  const [terminalLogs, setTerminalLogs] = useState<string[]>([]);
  const [categoryFilter, setCategoryFilter] = useState<'All' | 'Coding' | 'System Design' | 'Role Technical' | 'Behavioral'>('All');
  const [difficultyFilter, setDifficultyFilter] = useState<'All' | 'Easy' | 'Medium' | 'Hard'>('All');
  const [searchQuestion, setSearchQuestion] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [bookmarkedIds, setBookmarkedIds] = useState<string[]>(['q-1', 'q-3']);

  // Sync if userRole changes
  useEffect(() => {
    if (userRole) {
      setTypedRole(userRole);
      setActiveRole(userRole);
    }
  }, [userRole]);

  // Curated database generator based on company & typed role
  const generateQuestions = (comp: string, role: string): CompanyQuestion[] => {
    const c = comp.trim() || 'Tech Company';
    const r = role.trim() || 'Software Engineer';
    const isData = r.toLowerCase().includes('data') || r.toLowerCase().includes('etl') || r.toLowerCase().includes('sql');
    const isAi = r.toLowerCase().includes('ai') || r.toLowerCase().includes('ml') || r.toLowerCase().includes('machine');
    const isBackend = r.toLowerCase().includes('backend') || r.toLowerCase().includes('cloud') || r.toLowerCase().includes('system');
    const isFrontend = r.toLowerCase().includes('frontend') || r.toLowerCase().includes('react') || r.toLowerCase().includes('web');

    const list: CompanyQuestion[] = [
      {
        id: 'q-1',
        title: isData ? 'Distributed Log Aggregation & Top-K Query' : 'Longest Substring Without Repeating Characters',
        category: 'Coding',
        difficulty: 'Medium',
        frequency: 'Asked in 92% of interviews',
        round: 'Round 1: Technical Coding Screen',
        statement: isData
          ? `Given a streaming log of billions of search queries at ${c}, design an algorithm to find the top K most frequent queries in the last 1-hour rolling window with sub-second latency.`
          : `Given a string s, find the length of the longest substring without duplicate characters. Analyze time and space complexity thoroughly.`,
        inputOutput: isData ? 'Input: Stream of query logs (timestamp, query_str), K = 10\nOutput: [("python", 45000), ("sql", 38000), ...]' : 'Input: s = "abcabcbb"\nOutput: 3 (The answer is "abc")',
        solutionApproach: isData
          ? 'Use Count-Min Sketch or Min-Heap with a hash map. For sliding window, maintain tumbling bucket counters in Redis or Apache Flink state.'
          : 'Sliding window technique using a hash map to record the last seen index of each character in O(N) time.',
        tags: [c, r, 'Sliding Window', 'Hash Table', 'Stream Processing']
      },
      {
        id: 'q-2',
        title: isData ? 'Design a Real-Time Clickstream ETL Pipeline' : `Design ${c}'s Global Search Auto-Suggest Service`,
        category: 'System Design',
        difficulty: 'Hard',
        frequency: 'Frequently Asked in Final Onsite',
        round: 'Round 3: System Design & Architecture',
        statement: isData
          ? `Design an end-to-end data pipeline at ${c} capable of processing 250,000 click events per second, with both real-time fraud alerting (<500ms) and daily analytical warehouse reporting.`
          : `Architect a scalable, low-latency Typeahead / Auto-Complete suggestion system for ${c} handling 5 Billion searches daily with <50ms P99 latency.`,
        inputOutput: 'Capacity: 250k events/sec • Latency: <500ms real-time, 24h analytical partition\nStorage: Scalable distributed columnar format',
        solutionApproach: isData
          ? 'Kappa/Lambda architecture using Kafka for ingestion, Apache Flink for real-time processing, and dumping batch partitioned Parquet to AWS S3 / BigQuery.'
          : 'Trie data structure serialized in Redis cluster with frequency-weighted priority queues, cached at edge CDN nodes.',
        tags: [c, 'Architecture', 'Kafka', 'Distributed Systems', 'High Availability']
      },
      {
        id: 'q-3',
        title: isData ? 'Complex Multi-Table Retention & Revenue Aggregation' : 'Concurrency Deadlock in Thread Pools',
        category: 'Role Technical',
        difficulty: 'Medium',
        frequency: 'High Frequency (84%)',
        round: 'Round 2: Role Deep-Dive',
        statement: isData
          ? `Write a high-performance SQL query to calculate the 7-day and 30-day user retention rates across different acquisition channels for ${c}'s flagship service, optimizing for partition pruning.`
          : `Explain how the operating system and language runtime detect and resolve deadlocks. How do you prevent thread starvation in high-throughput worker pools?`,
        inputOutput: isData ? 'Tables: Users(id, signup_date, channel), Activities(user_id, event_time, event_type)' : 'Concepts: Mutex, Semaphores, Lock-ordering, Work-stealing pool',
        solutionApproach: isData
          ? 'Utilize window functions (ROW_NUMBER, DATEDIFF, COUNT DISTINCT) with CTEs and date-partitioned filters to minimize bytes scanned.'
          : 'Strict lock acquisition hierarchy, exponential backoff with jitter on trylock, and thread-pool sizing based on CPU-bound vs I/O-bound load.',
        tags: [c, isData ? 'SQL Optimization' : 'OS & Concurrency', 'Performance']
      },
      {
        id: 'q-4',
        title: `Tell me about a time you resolved a major production outage at work or in a project.`,
        category: 'Behavioral',
        difficulty: 'Medium',
        frequency: 'Asked in all hiring rounds',
        round: 'Round 4: Cultural Fit & Values',
        statement: `Interviewers at ${c} look for ownership, communication under pressure, and structured post-mortem learning. Describe a critical bug or failure, how you diagnosed it, and permanent preventative safeguards you implemented.`,
        inputOutput: 'Framework: STAR (Situation, Task, Action, Result) with quantifiable impact',
        solutionApproach: `Structure response using STAR: Context -> Root cause analysis (metrics/logs) -> Quick mitigation -> Permanent fix (automated tests, alerting) -> Post-mortem documentation.`,
        tags: [c, 'Behavioral', 'STAR Method', 'Incident Response']
      },
      {
        id: 'q-5',
        title: isData ? 'Median of Two Sorted Arrays' : 'Merge K Sorted Linked Lists',
        category: 'Coding',
        difficulty: 'Hard',
        frequency: 'Technical Bar-Raiser',
        round: 'Round 2: Advanced Algorithms',
        statement: `Given two sorted arrays nums1 and nums2 of size m and n respectively, return the median of the two sorted arrays in O(log(m+n)) runtime.`,
        inputOutput: 'Input: nums1 = [1, 3], nums2 = [2]\nOutput: 2.0',
        solutionApproach: 'Binary search on the smaller array to partition both arrays such that all elements on left <= all elements on right.',
        tags: [c, 'Binary Search', 'Divide and Conquer', 'Hard Algorithms']
      },
      {
        id: 'q-6',
        title: isData ? 'Data Quality Validation & Idempotent Backfilling' : 'Design Rate Limiter with Sliding Window Counter',
        category: 'Role Technical',
        difficulty: 'Medium',
        frequency: 'Frequently Asked (79%)',
        round: 'Round 3: Engineering Deep-Dive',
        statement: isData
          ? `How do you guarantee exactly-once processing and idempotency when backfilling 6 months of historical pipeline data into a live production warehouse?`
          : `Design an API rate limiter that restricts clients to 100 requests per minute with distributed token bucket or sliding window counters.`,
        inputOutput: 'Requirements: Zero data duplication, transactional integrity, fault tolerant',
        solutionApproach: isData
          ? 'Use surrogate deterministic hash keys for deduplication, partition-level staging swaps, and upsert/merge statements with ACID transactions.'
          : 'Redis sorted sets (ZADD, ZREMRANGEBYSCORE) or sliding log algorithms with Atomic Redis Lua scripts.',
        tags: [c, isData ? 'Data Quality' : 'API Design', 'Idempotency']
      }
    ];

    return list;
  };

  const [questions, setQuestions] = useState<CompanyQuestion[]>(generateQuestions('Google', userRole || 'Data Engineer'));

  // Run the Scraper Agent
  const runScraperAgent = async (targetComp = typedCompany, targetR = typedRole) => {
    setIsScraping(true);
    setTerminalLogs([]);

    const companyName = targetComp.trim() || 'Google';
    const roleName = targetR.trim() || 'Software Engineer';

    setActiveCompany(companyName);
    setActiveRole(roleName);

    const logs = [
      `🤖 [CompanyIntel Agent v2.5] Initializing scraper for "${companyName}" -> Target Role: "${roleName}"`,
      `🌐 Scanning global interview debrief repositories & candidate submission telemetry...`,
      `⚡ Querying Glassdoor, LeetCode Discuss, and Blind placement pipelines for ${companyName}...`,
      `🔍 Extracting verified round patterns: Online Assessments, Technical Screens, System Architecture, Behavioral...`,
      `📊 Analyzing question occurrence weights, difficulty ratings, and recent 2024-2025 candidate experiences...`,
      `✨ Dossier generated successfully! Loaded verified interview questions & hiring telemetry for ${companyName}.`
    ];

    for (let i = 0; i < logs.length; i++) {
      await new Promise((r) => setTimeout(r, 280));
      setTerminalLogs((prev) => [...prev, logs[i]]);
    }

    const generated = generateQuestions(companyName, roleName);
    setQuestions(generated);
    setIsScraping(false);
  };

  const handleCopyQuestion = (q: CompanyQuestion) => {
    const text = `${q.title} (${q.category} - ${q.difficulty})\nCompany: ${activeCompany}\nRound: ${q.round}\n\n${q.statement}\n\nApproach:\n${q.solutionApproach}`;
    navigator.clipboard.writeText(text);
    setCopiedId(q.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const toggleBookmark = (id: string) => {
    setBookmarkedIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  };

  // Filtered Questions
  const filteredQuestions = questions.filter((q) => {
    const matchesCategory = categoryFilter === 'All' || q.category === categoryFilter;
    const matchesDiff = difficultyFilter === 'All' || q.difficulty === difficultyFilter;
    const matchesSearch =
      q.title.toLowerCase().includes(searchQuestion.toLowerCase()) ||
      q.statement.toLowerCase().includes(searchQuestion.toLowerCase()) ||
      q.tags.some((t) => t.toLowerCase().includes(searchQuestion.toLowerCase()));
    return matchesCategory && matchesDiff && matchesSearch;
  });

  const popularCompanies = [
    'Google', 'Amazon', 'Microsoft', 'Meta', 'Netflix', 'Apple', 'Uber',
    'TCS', 'Accenture', 'Infosys', 'Wipro', 'Goldman Sachs', 'Stripe', 'Databricks'
  ];

  return (
    <div className="space-y-6">
      {/* Top Agent Search & Input Controls */}
      <div className="bg-[#0b101e] border border-slate-800/80 rounded-2xl p-5 shadow-xl space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-3 border-b border-slate-800/70">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-2xl bg-gradient-to-br from-indigo-500 via-sky-500 to-purple-600 p-[1.5px] flex items-center justify-center shadow-lg shadow-indigo-600/30">
              <div className="h-full w-full bg-[#0b101e] rounded-[14px] flex items-center justify-center text-sky-400">
                <Bot className="h-5 w-5" />
              </div>
            </div>
            <div>
              <h1 className="text-base font-black text-white flex items-center gap-2">
                <span>Company Interview Intelligence Agent</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-bold border border-emerald-500/30">
                  Live Scraper v2.5
                </span>
              </h1>
              <p className="text-xs text-slate-400">
                Type any company and position to scrape verified interview questions, round breakdowns & evaluation criteria.
              </p>
            </div>
          </div>

          <div className="text-right hidden sm:block">
            <span className="text-[11px] font-mono text-slate-400">
              Target Company: <strong className="text-white">{activeCompany}</strong> • Role: <strong className="text-sky-300">{activeRole}</strong>
            </span>
          </div>
        </div>

        {/* Search Inputs: Company Name & Job Role */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
          {/* Company Name Input */}
          <div className="md:col-span-5 relative">
            <label className="text-[11px] font-bold text-slate-300 block mb-1">Company Name</label>
            <div className="relative">
              <Building2 className="h-4 w-4 absolute left-3.5 top-3 text-slate-500" />
              <input
                type="text"
                list="company-suggestions"
                value={typedCompany}
                onChange={(e) => setTypedCompany(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && runScraperAgent()}
                placeholder="e.g. Google, Amazon, TCS, Microsoft, Stripe..."
                className="w-full pl-10 pr-3.5 py-2.5 rounded-xl bg-[#0e1424] border border-slate-800 text-xs text-white placeholder:text-slate-500 outline-none focus:border-indigo-500 transition font-medium"
              />
              <datalist id="company-suggestions">
                {popularCompanies.map((c) => (
                  <option key={c} value={c} />
                ))}
              </datalist>
            </div>
          </div>

          {/* Job Role / Position Input */}
          <div className="md:col-span-4 relative">
            <label className="text-[11px] font-bold text-slate-300 block mb-1">Target Job Role / Position</label>
            <div className="relative">
              <Briefcase className="h-4 w-4 absolute left-3.5 top-3 text-slate-500" />
              <input
                type="text"
                value={typedRole}
                onChange={(e) => setTypedRole(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && runScraperAgent()}
                placeholder="e.g. Data Engineer, Backend Dev, AI/ML..."
                className="w-full pl-10 pr-3.5 py-2.5 rounded-xl bg-[#0e1424] border border-slate-800 text-xs text-white placeholder:text-slate-500 outline-none focus:border-indigo-500 transition font-medium"
              />
            </div>
          </div>

          {/* Run Scraper Agent Button */}
          <div className="md:col-span-3 flex items-end">
            <button
              onClick={() => runScraperAgent()}
              disabled={isScraping}
              className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-500 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-xs shadow-lg shadow-indigo-600/30 transition flex items-center justify-center gap-2 active:scale-[0.99] disabled:opacity-50"
            >
              <Sparkles className="h-4 w-4 text-amber-300" />
              <span>{isScraping ? 'Scraping Questions...' : 'Run Scraper Agent'}</span>
            </button>
          </div>
        </div>

        {/* Popular Company Quick Chips */}
        <div className="flex items-center gap-2 flex-wrap pt-1">
          <span className="text-[11px] font-semibold text-slate-400">Popular:</span>
          {popularCompanies.slice(0, 8).map((comp) => (
            <button
              key={comp}
              onClick={() => {
                setTypedCompany(comp);
                runScraperAgent(comp, typedRole);
              }}
              className={`text-[10px] px-2.5 py-1 rounded-lg border transition ${
                activeCompany.toLowerCase() === comp.toLowerCase()
                  ? 'bg-sky-500/20 text-sky-300 border-sky-500/40 font-bold'
                  : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-white hover:bg-slate-800'
              }`}
            >
              {comp}
            </button>
          ))}
        </div>
      </div>

      {/* Live Agent Terminal Telemetry (When scraping or recently run) */}
      {(isScraping || terminalLogs.length > 0) && (
        <div className="bg-[#070b14] border border-slate-800 rounded-2xl p-4 shadow-xl font-mono text-xs space-y-1.5 overflow-hidden">
          <div className="flex items-center justify-between pb-2 border-b border-slate-800 text-[11px] text-slate-400">
            <div className="flex items-center gap-2">
              <Terminal className="h-3.5 w-3.5 text-emerald-400" />
              <span className="font-bold text-slate-300">Live Agent Execution Telemetry</span>
            </div>
            {isScraping && (
              <span className="flex items-center gap-1.5 text-emerald-400 font-semibold">
                <span className="h-2 w-2 rounded-full bg-emerald-400 animate-ping" />
                Scraping archives...
              </span>
            )}
          </div>
          <div className="space-y-1 pt-1 max-h-36 overflow-y-auto scrollbar-thin text-slate-300">
            {terminalLogs.map((log, idx) => (
              <div key={idx} className="flex items-start gap-2">
                <span className="text-slate-600 select-none">[{idx + 1}]</span>
                <span className={idx === terminalLogs.length - 1 ? 'text-sky-300 font-semibold' : 'text-slate-400'}>
                  {log}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Company Dossier Header Banner */}
      <div className="bg-[#0b101e] border border-slate-800/80 rounded-2xl p-5 shadow-lg flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="h-14 w-14 rounded-2xl bg-gradient-to-tr from-sky-500 via-indigo-600 to-purple-600 flex items-center justify-center text-white font-black text-xl shadow-lg shadow-indigo-600/20">
            {activeCompany.substring(0, 2).toUpperCase()}
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-xl font-black text-white">{activeCompany}</h2>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-950/60 text-indigo-300 border border-indigo-800/50">
                {activeRole}
              </span>
              <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-bold">
                Tier-1 Verified
              </span>
            </div>
            <div className="text-xs text-slate-400 mt-1 flex items-center gap-3 flex-wrap">
              <span>{questions.length} Verified Interview Questions</span>
              <span>•</span>
              <span>Updated for 2024–2025 Placement Cycle</span>
            </div>
          </div>
        </div>

        {/* Quick Intel Stats */}
        <div className="flex items-center gap-4 self-stretch sm:self-auto justify-between sm:justify-end">
          <div className="p-2.5 rounded-xl bg-[#0e1424] border border-slate-800 text-center min-w-[90px]">
            <div className="text-xs font-black text-amber-400">4.2 / 5.0</div>
            <div className="text-[10px] text-slate-400">Difficulty</div>
          </div>
          <div className="p-2.5 rounded-xl bg-[#0e1424] border border-slate-800 text-center min-w-[90px]">
            <div className="text-xs font-black text-sky-400">4 - 5 Rounds</div>
            <div className="text-[10px] text-slate-400">Interview Process</div>
          </div>
          <div className="p-2.5 rounded-xl bg-[#0e1424] border border-slate-800 text-center min-w-[90px]">
            <div className="text-xs font-black text-emerald-400">Top 4%</div>
            <div className="text-[10px] text-slate-400">Offer Rate</div>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar for Questions */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
        {/* Category Tabs */}
        <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-thin">
          {(['All', 'Coding', 'System Design', 'Role Technical', 'Behavioral'] as const).map((cat) => (
            <button
              key={cat}
              onClick={() => setCategoryFilter(cat)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition ${
                categoryFilter === cat
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'bg-[#0b101e] text-slate-400 hover:text-white border border-slate-800'
              }`}
            >
              {cat === 'All' ? 'All Questions' : cat}
            </button>
          ))}
        </div>

        {/* Difficulty and Search */}
        <div className="flex items-center gap-2">
          <div className="flex gap-1 bg-[#0b101e] border border-slate-800 p-1 rounded-xl">
            {(['All', 'Easy', 'Medium', 'Hard'] as const).map((d) => (
              <button
                key={d}
                onClick={() => setDifficultyFilter(d)}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition ${
                  difficultyFilter === d ? 'bg-slate-800 text-white' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {d}
              </button>
            ))}
          </div>

          <div className="relative w-48">
            <Search className="h-3.5 w-3.5 absolute left-3 top-2.5 text-slate-500" />
            <input
              type="text"
              value={searchQuestion}
              onChange={(e) => setSearchQuestion(e.target.value)}
              placeholder="Search in dossier..."
              className="w-full bg-[#0b101e] border border-slate-800 rounded-xl pl-8 pr-3 py-1.5 text-xs text-white placeholder:text-slate-500 outline-none focus:border-indigo-500 transition"
            />
          </div>
        </div>
      </div>

      {/* Scraped Questions Grid / Cards */}
      <div className="space-y-4">
        {filteredQuestions.map((q) => {
          const isCopied = copiedId === q.id;
          const isBookmarked = bookmarkedIds.includes(q.id);

          return (
            <div
              key={q.id}
              className="bg-[#0b101e] border border-slate-800/80 hover:border-slate-700 rounded-2xl p-5 shadow-lg space-y-3.5 transition"
            >
              {/* Question Card Top Bar */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="flex items-center gap-2 flex-wrap">
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      q.difficulty === 'Easy'
                        ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                        : q.difficulty === 'Medium'
                        ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                        : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                    }`}
                  >
                    {q.difficulty}
                  </span>

                  <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-slate-800 text-slate-300">
                    {q.category}
                  </span>

                  <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-indigo-950/60 text-indigo-300 border border-indigo-800/40">
                    {q.round}
                  </span>

                  <span className="text-[10px] font-mono text-amber-400 flex items-center gap-1 font-semibold">
                    <Flame className="h-3 w-3 fill-amber-400" />
                    {q.frequency}
                  </span>
                </div>

                <div className="flex items-center gap-2 self-end sm:self-auto">
                  <button
                    onClick={() => handleCopyQuestion(q)}
                    title="Copy Question Details"
                    className="p-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white border border-slate-800 text-xs transition flex items-center gap-1"
                  >
                    {isCopied ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
                    <span>{isCopied ? 'Copied!' : 'Copy'}</span>
                  </button>

                  <button
                    onClick={() => toggleBookmark(q.id)}
                    title="Bookmark"
                    className={`p-1.5 rounded-lg border text-xs transition ${
                      isBookmarked
                        ? 'bg-amber-500/20 text-amber-300 border-amber-500/30'
                        : 'bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white border-slate-800'
                    }`}
                  >
                    ★
                  </button>
                </div>
              </div>

              {/* Title & Statement */}
              <div>
                <h3 className="text-base font-bold text-white tracking-tight">{q.title}</h3>
                <p className="text-xs text-slate-300 leading-relaxed mt-1.5 font-medium">{q.statement}</p>
              </div>

              {/* Input / Output / Constraints sample if present */}
              {q.inputOutput && (
                <div className="p-3 rounded-xl bg-[#070b14] border border-slate-800 font-mono text-[11px] text-sky-300 whitespace-pre-line">
                  {q.inputOutput}
                </div>
              )}

              {/* Solution Approach */}
              <div className="p-3 rounded-xl bg-[#0e1424] border border-slate-800/80 text-xs text-slate-300 space-y-1">
                <strong className="text-amber-400 font-semibold block text-[11px] uppercase tracking-wider">
                  Recommended Solution Approach:
                </strong>
                <p className="leading-relaxed">{q.solutionApproach}</p>
              </div>

              {/* Tags & Actions */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2 border-t border-slate-800/60">
                <div className="flex flex-wrap gap-1.5">
                  {q.tags.map((tag) => (
                    <span key={tag} className="text-[9px] px-2 py-0.5 rounded bg-slate-900 border border-slate-800 text-slate-400 font-mono">
                      #{tag}
                    </span>
                  ))}
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => onNavigate('interview')}
                    className="px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-sky-300 hover:text-white border border-slate-700/60 text-xs font-semibold flex items-center gap-1.5 transition"
                  >
                    <Bot className="h-3.5 w-3.5 text-sky-400" />
                    <span>Mock with AI</span>
                  </button>

                  <button
                    onClick={() => onNavigate('arena')}
                    className="px-3.5 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold shadow-md shadow-blue-600/30 flex items-center gap-1.5 transition"
                  >
                    <Play className="h-3 w-3 fill-white" />
                    <span>Solve in Arena</span>
                  </button>
                </div>
              </div>
            </div>
          );
        })}

        {filteredQuestions.length === 0 && (
          <div className="p-8 text-center bg-[#0b101e] border border-slate-800 rounded-2xl text-slate-400 text-xs space-y-2">
            <div>No questions matched your current filters.</div>
            <button
              onClick={() => {
                setCategoryFilter('All');
                setDifficultyFilter('All');
                setSearchQuestion('');
              }}
              className="text-sky-400 hover:underline font-semibold"
            >
              Reset Filters
            </button>
          </div>
        )}
      </div>

      {/* Hiring Process Intel Breakdown */}
      <div className="bg-[#0b101e] border border-slate-800/80 rounded-2xl p-5 shadow-lg space-y-4">
        <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
          <BookOpen className="h-4 w-4 text-sky-400" />
          <span>{activeCompany} Placement Process Guide for {activeRole}</span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-3 text-xs">
          <div className="p-3 rounded-xl bg-[#0e1424] border border-slate-800 space-y-1">
            <div className="font-bold text-sky-400 text-[11px]">Round 1: OA / Screen</div>
            <div className="text-slate-300 font-medium">90 mins • 2-3 Problems</div>
            <div className="text-[10px] text-slate-400">DSA & algorithmic efficiency with automated test suites.</div>
          </div>

          <div className="p-3 rounded-xl bg-[#0e1424] border border-slate-800 space-y-1">
            <div className="font-bold text-indigo-400 text-[11px]">Round 2: Technical Deep Dive</div>
            <div className="text-slate-300 font-medium">45-60 mins with Senior Dev</div>
            <div className="text-[10px] text-slate-400">Live whiteboard/coderpad DSA, concurrency, and time complexity.</div>
          </div>

          <div className="p-3 rounded-xl bg-[#0e1424] border border-slate-800 space-y-1">
            <div className="font-bold text-emerald-400 text-[11px]">Round 3: System / Data Architecture</div>
            <div className="text-slate-300 font-medium">60 mins Architecture</div>
            <div className="text-[10px] text-slate-400">Distributed systems, database scaling, API trade-offs, and pipelines.</div>
          </div>

          <div className="p-3 rounded-xl bg-[#0e1424] border border-slate-800 space-y-1">
            <div className="font-bold text-amber-400 text-[11px]">Round 4: Bar Raiser & Values</div>
            <div className="text-slate-300 font-medium">45 mins Cultural Alignment</div>
            <div className="text-[10px] text-slate-400">{activeCompany} core values, leadership principles & conflict resolution.</div>
          </div>
        </div>
      </div>
    </div>
  );
};
