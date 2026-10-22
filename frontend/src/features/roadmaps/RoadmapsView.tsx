import React, { useState, useEffect, useMemo } from 'react';
import {
  Compass,
  CheckCircle2,
  Lock,
  Sparkles,
  BookOpen,
  ChevronRight,
  Award,
  Zap,
  Code2,
  FolderGit2,
  ArrowRight,
  Check,
  Calendar,
  Clock,
  Target,
  GraduationCap,
  Sliders,
  ExternalLink,
  Flame,
  Layers,
  Cpu,
  Database,
  Cloud,
  Smartphone,
  Shield,
  Bot
} from 'lucide-react';
import { apiClient } from '../../services/api';
import { showToast } from '../../components/Toast';
import { recordActivity } from '../../services/activityTracker';

interface RoadmapsViewProps {
  userRole?: string;
  userName?: string;
  onNavigate?: (tab: any) => void;
}

interface StepItem {
  id: string;
  title: string;
  description: string;
  estimatedHours: number;
  skills: string[];
  interviewFocus: string;
  tasks: string[];
  practiceType: 'code' | 'sql' | 'interview' | 'quiz';
  companies: string[];
}

interface PhaseItem {
  phaseNumber: number;
  title: string;
  subtitle: string;
  minKnowledgeRequired: number;
  steps: StepItem[];
}

interface TrackData {
  roleName: string;
  icon: React.ElementType;
  color: string;
  badgeBg: string;
  overview: string;
  phases: PhaseItem[];
  capstoneProjects: {
    title: string;
    desc: string;
    xp: string;
    difficulty: string;
    tasks: string[];
  }[];
}

const PRESET_TRACKS: Record<string, TrackData> = {
  'Full Stack Developer': {
    roleName: 'Full Stack Developer',
    icon: Layers,
    color: 'from-blue-500 to-indigo-600',
    badgeBg: 'bg-blue-500/10 border-blue-500/30 text-blue-400',
    overview: 'End-to-end full stack architecture: modern React UI, high-performance Node/Python APIs, database indexing, and automated cloud deployments.',
    phases: [
      {
        phaseNumber: 1,
        title: 'Phase 1: Foundations & Core Web Primitives',
        subtitle: 'Master modern JS/TS, DOM lifecycles, and asynchronous execution',
        minKnowledgeRequired: 0,
        steps: [
          {
            id: 'fs-1',
            title: 'TypeScript Generics, Utility Types & Type-Safety',
            description: 'Strict typing for production codebases, union types, discrimination patterns and interfaces.',
            estimatedHours: 8,
            skills: ['TypeScript', 'Generics', 'Type Narrowing'],
            interviewFocus: 'Strict type safety, generic constraints in shared UI libraries',
            tasks: ['Create strongly-typed API response wrapper', 'Implement generic debounce utility with TypeScript', 'Refactor untyped state reducers'],
            practiceType: 'code',
            companies: ['Microsoft', 'Uber', 'Stripe']
          },
          {
            id: 'fs-2',
            title: 'Asynchronous Event Loop, Microtasks & Promises',
            description: 'Understand Node.js / browser call stacks, macrotasks, microtask queue ordering, and error boundaries.',
            estimatedHours: 10,
            skills: ['Event Loop', 'async/await', 'Promise.allSettled'],
            interviewFocus: 'Tracing asynchronous execution order and deadlock prevention',
            tasks: ['Implement custom Promise.all polyfill with concurrency limit', 'Handle timeout racing & AbortController signals', 'Write unit tests for asynchronous failure cascades'],
            practiceType: 'code',
            companies: ['Google', 'Meta', 'Netflix']
          }
        ]
      },
      {
        phaseNumber: 2,
        title: 'Phase 2: Scalable Frontend Architecture & State Machines',
        subtitle: 'Build robust reactive frontends with caching and high-FPS performance',
        minKnowledgeRequired: 25,
        steps: [
          {
            id: 'fs-3',
            title: 'React Rendering Pipeline, Memoization & Virtual DOM',
            description: 'Eliminate redundant re-renders, useMemo, useCallback dependencies, and profiling component trees.',
            estimatedHours: 14,
            skills: ['React Fiber', 'useMemo', 'Virtual DOM Diffing'],
            interviewFocus: 'Diagnosing memory leaks and rendering bottlenecks in large component trees',
            tasks: ['Profile a sluggish table view with React DevTools', 'Build infinite scroll virtualization component with IntersectionObserver', 'Optimize context selectors to prevent cascade renders'],
            practiceType: 'code',
            companies: ['Meta', 'Amazon', 'Coinbase']
          },
          {
            id: 'fs-4',
            title: 'Client-side Cache Invalidation & Real-Time WebSockets',
            description: 'Optimistic UI updates, cache normalization (React Query / SWR), and bidirectional Socket.IO channels.',
            estimatedHours: 16,
            skills: ['WebSockets', 'Query Cache', 'Optimistic UI'],
            interviewFocus: 'Handling network disconnections, reconnect backoffs & optimistic rollbacks',
            tasks: ['Implement real-time collaborative chat room with WebSockets', 'Build optimistic upvote feature with automatic retry & rollback', 'Configure offline caching with localStorage sync'],
            practiceType: 'code',
            companies: ['Twitter / X', 'Discord', 'Slack']
          }
        ]
      },
      {
        phaseNumber: 3,
        title: 'Phase 3: High-Throughput Backend & Relational Storage',
        subtitle: 'Design RESTful & GraphQL microservices, transactions, and indexing strategies',
        minKnowledgeRequired: 50,
        steps: [
          {
            id: 'fs-5',
            title: 'Relational Database Schema Design & ACID Transactions',
            description: 'Foreign key constraints, composite B-tree indexes, execution EXPLAIN plans, and isolation levels.',
            estimatedHours: 18,
            skills: ['PostgreSQL', 'Index Optimization', 'ACID'],
            interviewFocus: 'Query optimization under 100M rows, deadlock mitigation and row locks',
            tasks: ['Write normalized schema with many-to-many relationship', 'Optimize slow queries with EXPLAIN ANALYZE and composite indexes', 'Implement balance transfer with SERIALIZABLE transactions'],
            practiceType: 'sql',
            companies: ['Amazon', 'Goldman Sachs', 'Oracle']
          },
          {
            id: 'fs-6',
            title: 'Distributed Caching with Redis & Rate Limiting',
            description: 'Cache-aside, write-through patterns, Redis TTLs, sliding window token bucket rate limiting.',
            estimatedHours: 15,
            skills: ['Redis', 'Token Bucket', 'Cache Stampede'],
            interviewFocus: 'Cache stampede avoidance, dogpiling, and IP rate limiting',
            tasks: ['Set up Redis caching for hot database queries', 'Implement sliding window rate limiter middleware in Express/FastAPI', 'Handle cache expiration with probabilistic early expiration'],
            practiceType: 'code',
            companies: ['Cloudflare', 'Airbnb', 'DoorDash']
          }
        ]
      },
      {
        phaseNumber: 4,
        title: 'Phase 4: Placement Capstone & System Design Interviews',
        subtitle: 'Architect production systems capable of handling 50,000+ requests per second',
        minKnowledgeRequired: 75,
        steps: [
          {
            id: 'fs-7',
            title: 'Full Stack System Design: High-Scale Notification Engine',
            description: 'Design a notification broker with RabbitMQ/Kafka, deduplication workers, and Web Push.',
            estimatedHours: 20,
            skills: ['System Design', 'Message Queues', 'Horizontal Scaling'],
            interviewFocus: 'Tradeoffs between at-least-once vs exactly-once delivery semantics',
            tasks: ['Draft end-to-end architecture diagram in whiteboard mode', 'Calculate bandwidth, storage, and server capacity estimations', 'Mock interview defense on handling sudden traffic spikes (Black Friday)'],
            practiceType: 'interview',
            companies: ['Google', 'Meta', 'Amazon', 'Apple']
          }
        ]
      }
    ],
    capstoneProjects: [
      {
        title: 'Distributed Collaborative Whiteboard & Code Editor',
        desc: 'Operational transformation / CRDTs, WebSockets, Redis pub/sub & React Canvas',
        xp: '+150 XP',
        difficulty: 'Advanced',
        tasks: [
          'Build WebSockets server with room isolation and ping/pong heartbeats',
          'Implement CRDT document sync with conflict resolution',
          'Integrate Monaco code editor with live syntax highlighting and execution',
          'Deploy containerized service on Docker with automated CI/CD pipeline'
        ]
      },
      {
        title: 'High-Concurrency E-Commerce Flash Sale Platform',
        desc: 'FastAPI, Redis lock concurrency, PostgreSQL row locks, and Stripe Webhooks',
        xp: '+200 XP',
        difficulty: 'Senior Track',
        tasks: [
          'Design atomic inventory reservation using Redis Redlock pattern',
          'Prevent overselling under 10,000 simultaneous concurrent checkout requests',
          'Process idempotent Stripe payment webhooks with exponential retry',
          'Implement audit ledger with immutable event-sourcing transactions'
        ]
      }
    ]
  },

  'Backend Systems Engineer': {
    roleName: 'Backend Systems Engineer',
    icon: Database,
    color: 'from-emerald-500 to-teal-600',
    badgeBg: 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400',
    overview: 'Distributed system design, high-concurrency microservices, database engine internals, and fault-tolerant event streams.',
    phases: [
      {
        phaseNumber: 1,
        title: 'Phase 1: Backend Primitives & Memory Mechanics',
        subtitle: 'Goroutines, Threads, GIL, Memory allocation & Socket programming',
        minKnowledgeRequired: 0,
        steps: [
          {
            id: 'be-1',
            title: 'Multithreading, Concurrency Models & Race Conditions',
            description: 'Thread pools, Mutex locks, Atomic operations, race condition detection tools.',
            estimatedHours: 12,
            skills: ['Concurrency', 'Mutex', 'Race Detection'],
            interviewFocus: 'Deadlocks, livelocks, mutex contention, and lock-free data structures',
            tasks: ['Simulate bank race condition with 100 worker threads and resolve with Mutex', 'Build producer-consumer thread pool with bounded queue', 'Benchmark lock contention vs atomic compare-and-swap operations'],
            practiceType: 'code',
            companies: ['Google', 'Jane Street', 'Bloomberg']
          }
        ]
      },
      {
        phaseNumber: 2,
        title: 'Phase 2: Database Storage Engines & Query Engines',
        subtitle: 'B+ Trees, LSM Trees, WAL logs, isolation levels, and sharding',
        minKnowledgeRequired: 25,
        steps: [
          {
            id: 'be-2',
            title: 'Database Engine Internals: LSM Trees vs B+ Trees',
            description: 'Why Postgres uses B+ Trees and Cassandra/RocksDB uses LSM Trees for high write throughput.',
            estimatedHours: 16,
            skills: ['B+ Trees', 'LSM Trees', 'Write-Ahead Logs'],
            interviewFocus: 'Write amplification, read latency tradeoffs, and compaction overhead',
            tasks: ['Implement in-memory B+ Tree node splitting in Python/C++', 'Build WAL logger for crash recovery durability', 'Analyze Postgres buffer cache hits using pg_stat_statements'],
            practiceType: 'sql',
            companies: ['MongoDB', 'Amazon', 'CockroachDB']
          }
        ]
      },
      {
        phaseNumber: 3,
        title: 'Phase 3: Distributed Messaging & Event Sourcing',
        subtitle: 'Apache Kafka, RabbitMQ, Partitioning keys, and idempotency',
        minKnowledgeRequired: 50,
        steps: [
          {
            id: 'be-3',
            title: 'Kafka Event Streaming, Consumer Groups & Offsets',
            description: 'Partition rebalancing, consumer lag monitoring, exactly-once processing with transactional producers.',
            estimatedHours: 18,
            skills: ['Apache Kafka', 'Consumer Groups', 'Idempotency'],
            interviewFocus: 'Managing consumer lag, partition hotspots, and poison pill messages',
            tasks: ['Set up Kafka cluster with 3 partitions and balanced consumers', 'Implement deduplication key store to guarantee idempotent message consumption', 'Simulate network partition and observe Raft/Zookeeper election'],
            practiceType: 'code',
            companies: ['LinkedIn', 'Uber', 'PayPal']
          }
        ]
      },
      {
        phaseNumber: 4,
        title: 'Phase 4: Distributed Systems & Consensus',
        subtitle: 'CAP Theorem, Raft Consensus, Consistent Hashing, and Rate Limiting',
        minKnowledgeRequired: 75,
        steps: [
          {
            id: 'be-4',
            title: 'Consistent Hashing Ring & Distributed Cache Sharding',
            description: 'Virtual nodes, minimal re-sharding on node additions, replica placement algorithms.',
            estimatedHours: 20,
            skills: ['Consistent Hashing', 'Raft', 'Distributed Caching'],
            interviewFocus: 'Designing Amazon Dynamo-style ring partitioning with virtual nodes',
            tasks: ['Implement consistent hashing ring with MD5 and virtual nodes', 'Demonstrate node failure failover without losing cache distribution', 'Present distributed rate limiter system design for 10M RPM'],
            practiceType: 'interview',
            companies: ['Amazon', 'Google', 'Meta']
          }
        ]
      }
    ],
    capstoneProjects: [
      {
        title: 'Distributed Key-Value Store with Raft Consensus',
        desc: 'Log replication, leader election, heartbeats, and disk durability',
        xp: '+250 XP',
        difficulty: 'Senior Track',
        tasks: [
          'Implement Raft leader election algorithm with randomized election timeouts',
          'Handle log replication across 3 cluster nodes',
          'Support network partition recovery and state catch-up',
          'Benchmark read/write operations under simulated packet drop'
        ]
      }
    ]
  },

  'AI / Machine Learning Engineer': {
    roleName: 'AI / Machine Learning Engineer',
    icon: Bot,
    color: 'from-amber-500 to-orange-600',
    badgeBg: 'bg-amber-500/10 border-amber-500/30 text-amber-400',
    overview: 'Modern GenAI development: PyTorch foundations, Transformer architectures, Vector DB retrieval (RAG), fine-tuning, and low-latency LLM serving.',
    phases: [
      {
        phaseNumber: 1,
        title: 'Phase 1: Linear Algebra, Vector Math & PyTorch Tensors',
        subtitle: 'Matrix multiplications, Autograd gradient descent, and GPU tensor allocation',
        minKnowledgeRequired: 0,
        steps: [
          {
            id: 'ai-1',
            title: 'PyTorch Tensors, Broadcasting & Backpropagation',
            description: 'Gradient calculation, computational graphs, Adam optimizer vs SGD.',
            estimatedHours: 12,
            skills: ['PyTorch', 'Autograd', 'Tensors'],
            interviewFocus: 'Backprop mathematical intuition, vanishing/exploding gradients',
            tasks: ['Implement two-layer neural network from scratch using only matrix operations', 'Train PyTorch classifier with learning rate schedulers', 'Profile GPU CUDA memory allocation and batch size scaling'],
            practiceType: 'code',
            companies: ['OpenAI', 'Google DeepMind', 'NVIDIA']
          }
        ]
      },
      {
        phaseNumber: 2,
        title: 'Phase 2: Transformer Mechanics & Attention Mechanisms',
        subtitle: 'Scaled Dot-Product Attention, Multi-Head Attention, RoPE, and Tokenizers',
        minKnowledgeRequired: 25,
        steps: [
          {
            id: 'ai-2',
            title: 'Multi-Head Self-Attention from Scratch',
            description: 'Queries, Keys, Values projection matrices, causal attention masks, Softmax scaling.',
            estimatedHours: 18,
            skills: ['Transformers', 'Attention', 'Tokenizers'],
            interviewFocus: 'Why Softmax is scaled by sqrt(d_k), KV-cache memory complexity',
            tasks: ['Write MultiHeadAttention module in PyTorch with causal triangular mask', 'Visualize attention weight heatmaps across tokens', 'Calculate KV cache memory requirements for 128k context windows'],
            practiceType: 'code',
            companies: ['Anthropic', 'Meta AI', 'Microsoft']
          }
        ]
      },
      {
        phaseNumber: 3,
        title: 'Phase 3: Production RAG Pipelines & Vector Search',
        subtitle: 'Chunking strategies, embedding distance metrics, hybrid search, and rerankers',
        minKnowledgeRequired: 50,
        steps: [
          {
            id: 'ai-3',
            title: 'Hybrid Vector Search with Pinecone/Qdrant + BM25',
            description: 'Cosine similarity vs dot product, HNSW index graphs, reciprocal rank fusion (RRF).',
            estimatedHours: 16,
            skills: ['Vector DBs', 'Embeddings', 'RAG'],
            interviewFocus: 'Hallucination prevention, semantic chunking boundaries & reranker scoring',
            tasks: ['Build semantic chunking pipeline for technical PDF documentation', 'Index document vectors into Pinecone with metadata filters', 'Implement Cross-Encoder reranker to elevate top-3 retrieval precision'],
            practiceType: 'code',
            companies: ['Scale AI', 'Databricks', 'Cohere']
          }
        ]
      },
      {
        phaseNumber: 4,
        title: 'Phase 4: Agentic AI Architectures & High-Scale LLM Serving',
        subtitle: 'Function calling, Tool use, vLLM PagedAttention, and automated evaluation',
        minKnowledgeRequired: 75,
        steps: [
          {
            id: 'ai-4',
            title: 'Autonomous Multi-Step AI Agent with Tool Reflection',
            description: 'ReAct framework, JSON schema function invocation, loop guardrails and evaluation.',
            estimatedHours: 20,
            skills: ['AI Agents', 'Function Calling', 'LLM Eval'],
            interviewFocus: 'Handling non-deterministic output, tool hallucination, and token streaming',
            tasks: ['Build code-execution agent with sandboxed Python runner', 'Implement loop guardrails and token usage throttling', 'Run automated Ragas evaluation suite for faithfulness and answer relevancy'],
            practiceType: 'interview',
            companies: ['OpenAI', 'Google', 'Amazon']
          }
        ]
      }
    ],
    capstoneProjects: [
      {
        title: 'Enterprise Technical Document Copilot with Hybrid RAG & Verification',
        desc: 'FastAPI, Qdrant Vector DB, Cohere Rerank, and Citation Grounding',
        xp: '+220 XP',
        difficulty: 'Senior Track',
        tasks: [
          'Process enterprise knowledge base with recursive chunking and metadata enrichment',
          'Construct hybrid search engine combining sparse BM25 and dense embeddings',
          'Generate grounded answers with inline clickable footnote citations',
          'Deploy high-throughput vLLM serving container with PagedAttention optimization'
        ]
      }
    ]
  }
};

export const RoadmapsView: React.FC<RoadmapsViewProps> = ({
  userRole,
  userName = 'Student',
  onNavigate
}) => {
  // Read candidate's saved preferences
  const storedRole = userRole || localStorage.getItem('cq_target_role') || 'Full Stack Developer';
  const storedDuration = localStorage.getItem('cq_study_duration') || '3 Months';
  const storedDailyGoal = localStorage.getItem('cq_daily_goal') || '3 hrs';
  const storedKnowledge = Number(localStorage.getItem('cq_knowledge_percent') || 50);

  const [activeTrack, setActiveTrack] = useState<string>(storedRole);
  const [completedSteps, setCompletedSteps] = useState<Record<string, boolean>>({});
  const [selectedStepModal, setSelectedStepModal] = useState<StepItem | null>(null);
  const [activeProjectModal, setActiveProjectModal] = useState<any | null>(null);
  const [projectTasksCompleted, setProjectTasksCompleted] = useState<Record<string, boolean>>({});
  const [awardingStepId, setAwardingStepId] = useState<string | null>(null);
  const [showPreferenceTuner, setShowPreferenceTuner] = useState(false);

  // Preference tuning state
  const [customDuration, setCustomDuration] = useState(storedDuration);
  const [customGoal, setCustomGoal] = useState(storedDailyGoal);
  const [customKnowledge, setCustomKnowledge] = useState(storedKnowledge);

  // Fallback to Full Stack Developer if role not in preset keys
  const currentTrackData = useMemo(() => {
    if (PRESET_TRACKS[activeTrack]) {
      return PRESET_TRACKS[activeTrack];
    }
    // Generic fallback track that inherits the custom role name
    return {
      ...PRESET_TRACKS['Full Stack Developer'],
      roleName: activeTrack
    };
  }, [activeTrack]);

  // Load saved completed steps from localStorage
  useEffect(() => {
    const saved = localStorage.getItem(`cq_completed_steps_${activeTrack}`);
    if (saved) {
      try {
        setCompletedSteps(JSON.parse(saved));
      } catch (e) {
        // ignore
      }
    }
  }, [activeTrack]);

  // Calculate overall progress based on knowledge % and marked steps
  const totalStepsCount = useMemo(() => {
    return currentTrackData.phases.reduce((acc, p) => acc + p.steps.length, 0);
  }, [currentTrackData]);

  const markedCompletedCount = useMemo(() => {
    return Object.values(completedSteps).filter(Boolean).length;
  }, [completedSteps]);

  // Baseline progress automatically derived from their entered knowledge percentage!
  const progressPercentage = useMemo(() => {
    const baseline = Math.round(customKnowledge * 0.5); // Initial baseline from self-assessment
    const stepContribution = totalStepsCount > 0 ? Math.round((markedCompletedCount / totalStepsCount) * 50) : 0;
    return Math.min(baseline + stepContribution, 100);
  }, [customKnowledge, markedCompletedCount, totalStepsCount]);

  // Projected Finish Date calculation based on study duration
  const finishDateDisplay = useMemo(() => {
    const now = new Date();
    const monthsToAdd = customDuration.includes('1 Month') ? 1 : customDuration.includes('6 Months') ? 6 : customDuration.includes('12 Months') ? 12 : 3;
    now.setMonth(now.getMonth() + monthsToAdd);
    return now.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  }, [customDuration]);

  const handleToggleStepComplete = async (step: StepItem) => {
    const isNowDone = !completedSteps[step.id];
    setAwardingStepId(step.id);

    try {
      if (isNowDone) {
        // Send step completion to backend to record XP
        await apiClient.post(`/roadmaps/steps/${encodeURIComponent(step.title)}/complete`);
      }
    } catch (err) {
      // Continue locally even if offline
    }

    const updated = { ...completedSteps, [step.id]: isNowDone };
    setCompletedSteps(updated);
    localStorage.setItem(`cq_completed_steps_${activeTrack}`, JSON.stringify(updated));
    setAwardingStepId(null);
  };

  const handleSavePreferences = () => {
    localStorage.setItem('cq_study_duration', customDuration);
    localStorage.setItem('cq_daily_goal', customGoal);
    localStorage.setItem('cq_knowledge_percent', customKnowledge.toString());
    setShowPreferenceTuner(false);
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-12 font-['Plus_Jakarta_Sans'] text-slate-100">
      {/* 1. TOP DYNAMIC CANDIDATE GPS BANNER */}
      <div className="p-6 sm:p-7 rounded-3xl bg-gradient-to-br from-[#0c1329] via-[#090d1c] to-[#070b16] border border-indigo-900/50 shadow-2xl relative overflow-hidden backdrop-blur-xl">
        <div className="absolute top-0 right-0 w-80 h-80 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-3 py-1 rounded-full bg-indigo-950/80 border border-indigo-700/60 text-[11px] font-bold text-sky-300 flex items-center gap-1.5 shadow-sm">
                <Compass className="h-3.5 w-3.5 text-sky-400 animate-spin" />
                <span>Personalized Career Roadmap</span>
              </span>
              <span className="px-3 py-1 rounded-full bg-emerald-950/80 border border-emerald-700/60 text-[11px] font-bold text-emerald-300 flex items-center gap-1.5">
                <Target className="h-3.5 w-3.5" />
                <span>Target: {storedRole}</span>
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              {currentTrackData.roleName} Preparation Odyssey
            </h1>
            <p className="text-xs sm:text-sm text-slate-400 max-w-xl leading-relaxed">
              Dynamically adapted to your <strong className="text-white">{customDuration}</strong> sprint, <strong className="text-white">{customGoal}/day</strong> commitment, and starting <strong className="text-white">{customKnowledge}% knowledge baseline</strong>.
            </p>
          </div>

          {/* Quick Metrics & Adjust Button */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full md:w-auto shrink-0">
            <div className="p-4 rounded-2xl bg-[#090f21] border border-slate-800 text-center flex-1 sm:flex-initial">
              <div className="text-[10px] uppercase font-bold text-slate-400">Readiness Score</div>
              <div className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-sky-400">
                {progressPercentage}%
              </div>
              <div className="text-[10px] text-slate-500 font-mono mt-0.5">
                Target: {finishDateDisplay}
              </div>
            </div>

            <button
              onClick={() => setShowPreferenceTuner(!showPreferenceTuner)}
              className="p-3.5 rounded-2xl bg-indigo-950/80 hover:bg-indigo-900 border border-indigo-700/60 text-xs font-bold text-indigo-200 transition flex items-center justify-center gap-2 shadow-lg"
            >
              <Sliders className="h-4 w-4 text-sky-400" />
              <span>{showPreferenceTuner ? 'Close Settings' : 'Tune Pace & Skills'}</span>
            </button>
          </div>
        </div>

        {/* Live Progress Bar with Phase Flags */}
        <div className="mt-6 pt-5 border-t border-slate-800/80 space-y-2">
          <div className="flex items-center justify-between text-xs font-bold">
            <span className="text-slate-300 flex items-center gap-1.5">
              <Flame className="h-4 w-4 text-amber-400 fill-amber-400" />
              <span>Step-by-Step Curriculum Completion</span>
            </span>
            <span className="text-sky-400 font-mono">
              {markedCompletedCount} of {totalStepsCount} Core Milestones Completed
            </span>
          </div>

          <div className="w-full bg-slate-900 rounded-full h-2.5 overflow-hidden border border-slate-800 p-0.5">
            <div
              className="h-full rounded-full bg-gradient-to-r from-sky-500 via-indigo-500 to-emerald-400 transition-all duration-700 shadow-md shadow-sky-500/30"
              style={{ width: `${progressPercentage}%` }}
            />
          </div>
        </div>
      </div>

      {/* 2. OPTIONAL PREFERENCE TUNER MODAL/ACCORDION */}
      {showPreferenceTuner && (
        <div className="p-5 sm:p-6 rounded-3xl bg-[#0b1020] border border-indigo-600/50 shadow-xl space-y-5 animate-in fade-in slide-in-from-top-3 duration-200">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <Sliders className="h-4 w-4 text-sky-400" />
              <h3 className="text-sm font-bold text-white">Adjust Candidate Preferences & Roadmap Velocity</h3>
            </div>
            <span className="text-xs text-slate-400 font-mono">Real-time Recalculation</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Timeline */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-300 block">Preparation Timeline:</label>
              <select
                value={customDuration}
                onChange={(e) => setCustomDuration(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#0e1424] border border-slate-700 text-xs text-white outline-none focus:border-indigo-500 font-medium"
              >
                <option value="1 Month">1 Month (Sprint)</option>
                <option value="3 Months">3 Months (Standard)</option>
                <option value="6 Months">6 Months (Deep Mastery)</option>
                <option value="12 Months">12 Months (FAANG Track)</option>
              </select>
            </div>

            {/* Daily Hours */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-300 block">Daily Study Commitment:</label>
              <select
                value={customGoal}
                onChange={(e) => setCustomGoal(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#0e1424] border border-slate-700 text-xs text-white outline-none focus:border-indigo-500 font-medium"
              >
                <option value="1-2 hrs">1-2 Hours / Day</option>
                <option value="3 hrs">3-4 Hours / Day</option>
                <option value="5+ hrs">5+ Hours / Day (Full-Time)</option>
              </select>
            </div>

            {/* Knowledge Slider */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs font-bold text-slate-300">
                <span>Knowledge Baseline:</span>
                <span className="text-sky-400 font-mono">{customKnowledge}%</span>
              </div>
              <input
                type="range"
                min={0}
                max={100}
                step={5}
                value={customKnowledge}
                onChange={(e) => setCustomKnowledge(Number(e.target.value))}
                className="w-full h-2.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-indigo-500 mt-2"
              />
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <button
              onClick={handleSavePreferences}
              className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition shadow-md shadow-blue-600/30"
            >
              Apply & Update Roadmap
            </button>
          </div>
        </div>
      )}

      {/* 3. TRACK SELECTOR TABS */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
        {Object.keys(PRESET_TRACKS).map((trackKey) => {
          const isSelected = activeTrack === trackKey;
          const isUserTarget = storedRole.toLowerCase().includes(trackKey.toLowerCase()) || trackKey.toLowerCase().includes(storedRole.toLowerCase());
          return (
            <button
              key={trackKey}
              onClick={() => setActiveTrack(trackKey)}
              className={`px-4 py-2.5 rounded-2xl text-xs font-bold whitespace-nowrap transition-all duration-200 flex items-center gap-2 border ${
                isSelected
                  ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white border-blue-400/50 shadow-lg shadow-indigo-600/30 scale-[1.02]'
                  : 'bg-[#0a0f1d] text-slate-400 hover:text-slate-200 border-slate-800 hover:border-slate-700'
              }`}
            >
              <span>{trackKey}</span>
              {isUserTarget && (
                <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-mono">
                  Your Target
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* 4. STEP-BY-STEP ADAPTIVE CURRICULUM PHASES */}
      <div className="space-y-6">
        {currentTrackData.phases.map((phase) => {
          // Determine if this phase is auto-unlocked based on knowledge %
          const isFastTracked = customKnowledge >= (phase.minKnowledgeRequired + 25);
          const isUnlocked = customKnowledge >= phase.minKnowledgeRequired;

          return (
            <div
              key={phase.phaseNumber}
              className="p-5 sm:p-7 rounded-3xl bg-[#090e1c] border border-slate-800/80 shadow-xl space-y-5 transition-all duration-200"
            >
              {/* Phase Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-800/80">
                <div className="flex items-center gap-3">
                  <div className={`h-10 w-10 rounded-2xl flex items-center justify-center font-black text-sm shadow-md ${
                    isFastTracked
                      ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                      : isUnlocked
                      ? 'bg-blue-600/20 text-blue-400 border border-blue-500/40'
                      : 'bg-slate-800 text-slate-500 border border-slate-700'
                  }`}>
                    {isFastTracked ? <Check className="h-5 w-5 stroke-[3]" /> : phase.phaseNumber}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h2 className="text-base font-extrabold text-white">{phase.title}</h2>
                      {isFastTracked && (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-950/60 text-emerald-300 border border-emerald-700/50">
                          Fast-Tracked (Knowledge: {customKnowledge}%)
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-400">{phase.subtitle}</p>
                  </div>
                </div>

                <div className="text-right text-xs font-mono text-slate-400">
                  {phase.steps.filter((s) => completedSteps[s.id]).length} / {phase.steps.length} Steps Mastered
                </div>
              </div>

              {/* Steps List */}
              <div className="space-y-3.5 pl-0 sm:pl-3">
                {phase.steps.map((step, idx) => {
                  const isDone = !!completedSteps[step.id];
                  const isAwarding = awardingStepId === step.id;

                  return (
                    <div
                      key={step.id}
                      className={`p-4 sm:p-5 rounded-2xl border transition-all duration-200 ${
                        isDone
                          ? 'bg-emerald-950/15 border-emerald-800/40 shadow-inner'
                          : 'bg-[#0d1426]/70 border-slate-800 hover:border-slate-700 hover:bg-[#0f172e]'
                      }`}
                    >
                      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                        {/* Step Details Left */}
                        <div className="space-y-2 flex-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="text-[11px] font-mono font-bold text-sky-400 bg-sky-950/60 px-2 py-0.5 rounded-md border border-sky-800/40">
                              Step {phase.phaseNumber}.{idx + 1}
                            </span>
                            <h3 className={`text-sm font-bold transition ${isDone ? 'line-through text-slate-400' : 'text-white'}`}>
                              {step.title}
                            </h3>
                            <span className="text-[10px] text-slate-400 flex items-center gap-1 font-mono">
                              <Clock className="h-3 w-3" /> ~{step.estimatedHours} hrs
                            </span>
                          </div>

                          <p className="text-xs text-slate-300 leading-relaxed">
                            {step.description}
                          </p>

                          {/* Skills & Companies Tags */}
                          <div className="flex flex-wrap items-center gap-1.5 pt-1">
                            {step.skills.map((sk) => (
                              <span key={sk} className="text-[10px] px-2 py-0.5 rounded bg-slate-900 border border-slate-800 text-indigo-300 font-medium">
                                #{sk}
                              </span>
                            ))}
                            <span className="text-[10px] text-slate-500 font-medium ml-1">
                              Targeted by: <span className="text-slate-300">{step.companies.join(', ')}</span>
                            </span>
                          </div>
                        </div>

                        {/* Step Actions Right */}
                        <div className="flex items-center sm:flex-col items-end gap-2 shrink-0">
                          <button
                            type="button"
                            onClick={() => handleToggleStepComplete(step)}
                            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-sm ${
                              isDone
                                ? 'bg-emerald-600 text-white hover:bg-emerald-500'
                                : 'bg-slate-800/90 hover:bg-slate-700 text-slate-300 border border-slate-700'
                            }`}
                          >
                            <CheckCircle2 className={`h-4 w-4 ${isDone ? 'text-white' : 'text-slate-400'}`} />
                            <span>{isDone ? 'Completed' : 'Mark Done (+25 XP)'}</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => setSelectedStepModal(step)}
                            className="px-3 py-1.5 rounded-xl bg-indigo-950/80 hover:bg-indigo-900 border border-indigo-700/60 text-indigo-300 text-xs font-semibold flex items-center gap-1 transition"
                          >
                            <span>Inspect Deep Dive</span>
                            <ChevronRight className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {/* 5. PLACEMENT CAPSTONE PROJECTS */}
      <div className="p-6 sm:p-7 rounded-3xl bg-[#090e1c] border border-slate-800/80 shadow-xl space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <FolderGit2 className="h-5 w-5 text-sky-400" />
            <div>
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                Resume-Ready Placement Capstones ({currentTrackData.roleName})
              </h3>
              <p className="text-xs text-slate-400">Complete these portfolio projects to pass technical resume screenings</p>
            </div>
          </div>
          <span className="text-xs font-mono font-bold text-amber-400 bg-amber-950/40 px-3 py-1 rounded-full border border-amber-800/40">
            {currentTrackData.capstoneProjects.length} Available
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {currentTrackData.capstoneProjects.map((proj, pIdx) => (
            <div
              key={pIdx}
              className="p-5 rounded-2xl bg-[#0e1424] border border-slate-800 hover:border-slate-700 space-y-3.5 transition group flex flex-col justify-between"
            >
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold font-mono px-2 py-0.5 rounded bg-indigo-950 text-indigo-300 border border-indigo-800/50">
                    {proj.difficulty}
                  </span>
                  <span className="text-xs font-bold text-amber-400 font-mono">
                    {proj.xp}
                  </span>
                </div>
                <h4 className="text-sm font-bold text-white group-hover:text-sky-300 transition leading-snug">
                  {proj.title}
                </h4>
                <p className="text-xs text-slate-400 leading-relaxed">
                  {proj.desc}
                </p>
              </div>

              <button
                onClick={() => setActiveProjectModal(proj)}
                className="w-full py-2.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-md shadow-blue-600/30 transition flex items-center justify-center gap-2"
              >
                <span>View Milestone Tasks</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* STEP DEEP DIVE MODAL */}
      {selectedStepModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#0b1020] border border-slate-700 rounded-3xl p-6 sm:p-7 max-w-xl w-full space-y-5 shadow-2xl animate-in zoom-in-95 duration-150">
            <div className="flex items-start justify-between pb-3 border-b border-slate-800">
              <div className="space-y-1">
                <span className="text-[10px] font-bold font-mono text-sky-400 uppercase tracking-wider">
                  Deep Dive Curriculum Module
                </span>
                <h3 className="text-base font-bold text-white leading-snug">
                  {selectedStepModal.title}
                </h3>
              </div>
              <button
                onClick={() => setSelectedStepModal(null)}
                className="h-8 w-8 rounded-full bg-slate-900 border border-slate-800 text-slate-400 hover:text-white flex items-center justify-center text-xs font-bold"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              {selectedStepModal.description}
            </p>

            <div className="p-3.5 rounded-2xl bg-indigo-950/40 border border-indigo-800/40 space-y-1">
              <div className="text-[11px] font-bold text-indigo-300 flex items-center gap-1.5">
                <Target className="h-3.5 w-3.5 text-sky-400" />
                <span>Why Interviewers Test This:</span>
              </div>
              <p className="text-xs text-slate-300 italic">
                &ldquo;{selectedStepModal.interviewFocus}&rdquo;
              </p>
            </div>

            <div className="space-y-2">
              <div className="text-xs font-bold text-white uppercase tracking-wider">
                Hands-On Action Tasks:
              </div>
              {selectedStepModal.tasks.map((task, tIdx) => (
                <div key={tIdx} className="p-2.5 rounded-xl bg-[#0e1424] border border-slate-800 text-xs text-slate-300 flex items-center gap-2.5">
                  <div className="h-5 w-5 rounded-md bg-blue-600/20 text-blue-400 border border-blue-500/30 flex items-center justify-center text-[10px] font-bold shrink-0">
                    {tIdx + 1}
                  </div>
                  <span>{task}</span>
                </div>
              ))}
            </div>

            <div className="pt-3 border-t border-slate-800 flex items-center justify-between gap-3">
              <button
                type="button"
                onClick={() => {
                  handleToggleStepComplete(selectedStepModal);
                  setSelectedStepModal(null);
                }}
                className="flex-1 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/30"
              >
                <Check className="h-4 w-4" />
                <span>Mark Step Completed (+25 XP)</span>
              </button>

              {onNavigate && (
                <button
                  type="button"
                  onClick={() => {
                    setSelectedStepModal(null);
                    onNavigate('practice');
                  }}
                  className="py-3 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs transition flex items-center gap-1.5"
                >
                  <span>Practice Hub</span>
                  <ExternalLink className="h-3.5 w-3.5" />
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* CAPSTONE CHECKLIST MODAL */}
      {activeProjectModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#0b1020] border border-slate-700 rounded-3xl p-6 sm:p-7 max-w-lg w-full space-y-5 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <FolderGit2 className="h-5 w-5 text-sky-400" />
                <h3 className="text-sm font-bold text-white">{activeProjectModal.title}</h3>
              </div>
              <button
                onClick={() => setActiveProjectModal(null)}
                className="text-slate-400 hover:text-white text-xs font-bold"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">{activeProjectModal.desc}</p>

            <div className="space-y-2 pt-1">
              <div className="text-[11px] font-bold uppercase text-sky-400">Milestone Tasks:</div>
              {activeProjectModal.tasks.map((task: string, i: number) => {
                const isChecked = !!projectTasksCompleted[task];
                return (
                  <div
                    key={i}
                    onClick={() => setProjectTasksCompleted(prev => ({ ...prev, [task]: !prev[task] }))}
                    className="p-3 rounded-xl bg-[#0e1424] border border-slate-800 text-xs flex items-center gap-3 cursor-pointer hover:border-slate-700 transition"
                  >
                    <div className={`h-4 w-4 rounded-md border flex items-center justify-center shrink-0 ${
                      isChecked ? 'bg-emerald-500 border-emerald-400 text-white' : 'border-slate-700'
                    }`}>
                      {isChecked && <Check className="h-3 w-3 stroke-[3]" />}
                    </div>
                    <span className={isChecked ? 'line-through text-slate-500' : 'text-slate-200'}>
                      {task}
                    </span>
                  </div>
                );
              })}
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-slate-800">
              <span className="text-xs font-mono font-bold text-amber-400">
                Reward: {activeProjectModal.xp}
              </span>
              <button
                onClick={() => {
                  recordActivity('roadmap', { xp: 40 });
                  showToast('Milestone progress saved to your portfolio roadmap! (+40 XP)', 'success');
                  setActiveProjectModal(null);
                }}
                className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition shadow-md shadow-blue-600/30 active:scale-95"
              >
                Done & Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
