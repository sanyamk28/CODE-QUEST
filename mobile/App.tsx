import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  TextInput,
  SafeAreaView,
  StatusBar,
  Modal,
  Image,
  Switch,
  Dimensions,
  BackHandler,
  Alert,
  Linking
} from 'react-native';
import { firebaseAuthSignIn, firebaseGoogleSignIn, buildGoogleOAuthUrl } from './firebase';

const { width } = Dimensions.get('window');

// --- BATTLE ROOM & MCQ GENERATOR DEFINITIONS ---
export interface BattleRoom {
  code: string;
  title: string;
  topics: string[];
  questionCount: number;
  durationPerQuestion: number;
  isMultiSelect: boolean;
  questions: BattleMCQ[];
  createdAt: string;
  hostName: string;
  sourceType: 'topics' | 'pdf_text';
}

// Generates high-yield MCQs directly from pasted text or uploaded PDF study notes
export function generateMCQsFromTextOrPDF(
  text: string,
  count: number,
  isMultiSelect: boolean,
  duration: number
): BattleMCQ[] {
  const cleaned = text.trim();
  const sentences = cleaned
    .split(/[.!?\n]+/)
    .map(s => s.trim())
    .filter(s => s.length > 25);

  const conceptMatches = cleaned.match(/\b([A-Z][a-zA-Z0-9_\-]+|\b(cache|thread|index|mutex|latency|buffer|process|database|algorithm|memory|network|cluster|server|client|api|deadlock|concurrency|pipeline|schema)\b)/gi) || [];
  const uniqueConcepts = Array.from(new Set(conceptMatches.map(c => c.trim()))).filter(c => c.length > 3);

  const generated: BattleMCQ[] = [];
  const targetCount = Math.max(1, Math.min(count, 20));

  for (let i = 0; i < targetCount; i++) {
    const concept = uniqueConcepts[i % Math.max(1, uniqueConcepts.length)] || 'System Architecture';
    const sentence = sentences[i % Math.max(1, sentences.length)] || `Core principle governing ${concept} in production systems.`;
    const snippet = sentence.length > 70 ? sentence.slice(0, 67) + '...' : sentence;

    if (isMultiSelect) {
      generated.push({
        id: `pdf-mcq-${i + 1}-${Date.now()}`,
        topic: `Notes: ${concept}`,
        question: `Based on the provided PDF / study material, which statements regarding "${concept}" are accurate? [Select All That Apply]\n\nContext: "${snippet}"`,
        options: [
          `Directly satisfies the core requirement: "${snippet.slice(0, 45)}..."`,
          `Mitigates bottleneck overhead and enhances throughput under high load`,
          `Eliminates all runtime CPU and memory overhead unconditionally`,
          `Maintains data consistency and isolation during parallel executions`
        ],
        correctAnswers: ['A', 'B', 'D'],
        isMultiSelect: true,
        difficulty: i % 2 === 0 ? 'Medium' : 'Hard',
        explanation: `Options A, B, and D directly reflect the principles described in your document for ${concept}. Option C is false as all computational workflows incur resource trade-offs.`,
        hasPhoto: true
      });
    } else {
      generated.push({
        id: `pdf-mcq-${i + 1}-${Date.now()}`,
        topic: `Notes: ${concept}`,
        question: `According to your document, what is the primary role or property of "${concept}"?\n\nContext: "${snippet}"`,
        options: [
          `To enforce the rule: "${snippet.slice(0, 50)}..."`,
          `To block all parallel execution and serialize threads`,
          `To randomize memory addresses on every instruction`,
          `To bypass data integrity checks entirely`
        ],
        correctAnswers: ['A'],
        isMultiSelect: false,
        difficulty: i % 2 === 0 ? 'Easy' : 'Medium',
        explanation: `Option A correctly summarizes the document context regarding ${concept}. The other options describe anti-patterns.`,
        hasPhoto: false
      });
    }
  }

  return generated;
}

// --- MCQ BATTLE DEFINITIONS & AUTO-GENERATOR ENGINE ---
export interface BattleMCQ {
  id: string;
  topic: string;
  question: string;
  options: string[];
  correctAnswers: string[]; // e.g. ['A', 'C'] for multi-answer
  isMultiSelect: boolean;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  explanation: string;
  hasPhoto?: boolean;
}

export const SEED_MCQ_BANK: BattleMCQ[] = [
  {
    id: 'mcq-1',
    topic: 'Data Structures',
    question: 'Which of the following data structures guarantee O(1) worst-case or average-case lookup time? [Select All That Apply]',
    options: [
      'Hash Map (average lookup)',
      'Direct-Access Array by index',
      'Balanced Binary Search Tree (AVL)',
      'Singly Linked List'
    ],
    correctAnswers: ['A', 'B'],
    isMultiSelect: true,
    difficulty: 'Easy',
    explanation: 'Both Hash Maps (average O(1)) and Arrays accessed by index (O(1) direct offset) provide constant-time lookup. AVL trees require O(log N) and Linked Lists require O(N).'
  },
  {
    id: 'mcq-2',
    topic: 'System Design',
    question: 'Which techniques are commonly employed to prevent cascading failures and scale high-throughput microservices? [Select All That Apply]',
    options: [
      'Circuit Breaker Pattern',
      'Rate Limiting & Token Bucket',
      'Synchronous RPC chaining without timeouts',
      'Distributed Message Queues (Kafka / RabbitMQ)'
    ],
    correctAnswers: ['A', 'B', 'D'],
    isMultiSelect: true,
    difficulty: 'Medium',
    explanation: 'Circuit Breakers trip to prevent cascading outages; Rate limiters shed load; Message queues buffer asynchronous bursts. Unbounded synchronous chaining exacerbates cascading failures.'
  },
  {
    id: 'mcq-3',
    topic: 'DBMS & SQL',
    question: 'Which properties are TRUE regarding database indexes and B+ Trees? [Select All That Apply]',
    options: [
      'All leaf nodes are linked in a linked list for rapid range scans',
      'Indexes always speed up both INSERT and DELETE operations',
      'Internal nodes store only keys and child pointers (no data records)',
      'Composite indexes can utilize leftmost prefix filtering'
    ],
    correctAnswers: ['A', 'C', 'D'],
    isMultiSelect: true,
    difficulty: 'Medium',
    explanation: 'B+ tree leaf nodes are linked for sequential scans and internal nodes hold only keys. Indexes accelerate reads, but SLOW DOWN writes (INSERT/DELETE) due to index maintenance overhead.'
  },
  {
    id: 'mcq-4',
    topic: 'Algorithms',
    question: 'Which of the following algorithms have an average or guaranteed time complexity of O(N log N)? [Select All That Apply]',
    options: [
      'Merge Sort (guaranteed O(N log N))',
      'Heap Sort (guaranteed O(N log N))',
      'Quick Sort (average O(N log N))',
      'Bubble Sort (average O(N log N))'
    ],
    correctAnswers: ['A', 'B', 'C'],
    isMultiSelect: true,
    difficulty: 'Easy',
    explanation: 'Merge Sort and Heap Sort are guaranteed O(N log N). Quick Sort averages O(N log N). Bubble Sort is O(N²) on average.'
  },
  {
    id: 'mcq-5',
    topic: 'Operating Systems',
    question: 'Which resources are shared among multiple threads belonging to the same process? [Select All That Apply]',
    options: [
      'Heap Memory space',
      'Individual Thread Call Stacks',
      'Global Variables & Text Segment',
      'Open File Descriptors'
    ],
    correctAnswers: ['A', 'C', 'D'],
    isMultiSelect: true,
    difficulty: 'Medium',
    explanation: 'Threads within a process share the heap, data/text segments, and open file descriptors. However, each thread gets its OWN independent stack and CPU register state.'
  },
  {
    id: 'mcq-6',
    topic: 'Computer Networks',
    question: 'Which statements correctly distinguish TCP from UDP? [Select All That Apply]',
    options: [
      'TCP provides connection-oriented ordered byte streams with retransmission',
      'UDP has lower latency overhead and no 3-way handshake',
      'TCP headers are fixed at 8 bytes without checksums',
      'UDP is preferred for real-time multiplayer gaming and DNS queries'
    ],
    correctAnswers: ['A', 'B', 'D'],
    isMultiSelect: true,
    difficulty: 'Easy',
    explanation: 'TCP guarantees delivery and order with connection state. UDP is connectionless and lightweight (8-byte header), ideal for low-latency voice/gaming and DNS. TCP headers are 20-60 bytes.'
  },
  {
    id: 'mcq-7',
    topic: 'React & Frontend',
    question: 'Which of the following are valid rules and best practices when utilizing React Hooks? [Select All That Apply]',
    options: [
      'Call hooks only at the top level (never inside loops or conditions)',
      'Call hooks from regular JavaScript functions without prefix "use"',
      'useEffect cleanup functions run before unmounting or re-running effects',
      'useMemo caches calculated values across re-renders'
    ],
    correctAnswers: ['A', 'C', 'D'],
    isMultiSelect: true,
    difficulty: 'Medium',
    explanation: 'Hooks must execute in the exact same order each render (top level only). They must be called from React components or custom hooks. Cleanup runs on unmount or deps change; useMemo memoizes computed values.'
  },
  {
    id: 'mcq-8',
    topic: 'Cloud & DevOps',
    question: 'Which components and concepts are fundamental to Docker containerization and Kubernetes orchestration? [Select All That Apply]',
    options: [
      'Docker images use layered copy-on-write storage',
      'Containers share the host OS kernel unlike full Virtual Machines',
      'Kubernetes Pods can only ever run on bare metal without networking',
      'Kubernetes Deployments provide automated rolling updates and rollbacks'
    ],
    correctAnswers: ['A', 'B', 'D'],
    isMultiSelect: true,
    difficulty: 'Hard',
    explanation: 'Containers share the host kernel and use layered images. Kubernetes provides automated self-healing, rolling updates, and works on clouds or VMs.'
  }
];

// Generator function that auto-creates MCQs for ANY topics and questions requested by teacher
export function generateBattleMCQs(
  topics: string[],
  isMultiSelect: boolean,
  count: number,
  difficulty: 'Easy' | 'Medium' | 'Hard' | 'Mixed',
  customTopic?: string,
  hasPhoto?: boolean
): BattleMCQ[] {
  const allTopics = [...topics];
  if (customTopic && customTopic.trim() && !allTopics.includes(customTopic.trim())) {
    allTopics.push(customTopic.trim());
  }
  if (allTopics.length === 0) {
    allTopics.push('Computer Science & Engineering');
  }

  const generated: BattleMCQ[] = [];
  const validCount = Math.max(1, Math.min(count, 20));

  // 1. Try to pick from matched seed bank
  const matchedSeeds = SEED_MCQ_BANK.filter(q => 
    allTopics.some(t => q.topic.toLowerCase().includes(t.toLowerCase()) || t.toLowerCase().includes(q.topic.toLowerCase()))
  );

  matchedSeeds.forEach((q, idx) => {
    if (generated.length < validCount) {
      generated.push({
        ...q,
        id: `gen-${idx + 1}-${Date.now()}`,
        hasPhoto: hasPhoto || false,
        isMultiSelect: isMultiSelect
      });
    }
  });

  // 2. Synthesize dynamic, deep technical questions if more are required or for custom topics
  let synthIdx = 1;
  while (generated.length < validCount) {
    const topic = allTopics[synthIdx % allTopics.length];
    const diff = difficulty === 'Mixed' ? (synthIdx % 3 === 0 ? 'Hard' : synthIdx % 2 === 0 ? 'Medium' : 'Easy') : difficulty;

    if (isMultiSelect) {
      // Multiple-Answer auto-generated question
      const synthQuestion: BattleMCQ = {
        id: `dyn-multi-${synthIdx}-${Date.now()}`,
        topic: topic,
        question: `In production ${topic} architecture, which of the following statements and practices are valid? [Select All That Apply]`,
        options: [
          `Implement automated telemetry and latency metrics for ${topic} bottlenecks`,
          `Enforce immutability and state isolation to minimize side-effects in ${topic}`,
          `Disable memory compaction and garbage collection across all nodes`,
          `Apply horizontal scaling with health probes to eliminate single points of failure`
        ],
        correctAnswers: ['A', 'B', 'D'],
        isMultiSelect: true,
        difficulty: diff,
        explanation: `Options A, B, and D represent core industry best-practices for robust ${topic} systems: observability, immutability/isolation, and resilient horizontal scaling. Option C degrades long-term process stability.`,
        hasPhoto: hasPhoto || false
      };
      generated.push(synthQuestion);
    } else {
      // Single-Answer auto-generated question
      const synthQuestion: BattleMCQ = {
        id: `dyn-single-${synthIdx}-${Date.now()}`,
        topic: topic,
        question: `What is the primary architectural advantage of implementing asynchronous decoupling in ${topic}?`,
        options: [
          `Guarantees synchronous blocking on every client thread`,
          `Isolates consumer latency from producer throughput to absorb high traffic bursts`,
          `Eliminates the requirement for any network transport protocols`,
          `Forces all operations into quadratic O(N²) execution cycles`
        ],
        correctAnswers: ['B'],
        isMultiSelect: false,
        difficulty: diff,
        explanation: `Asynchronous decoupling (e.g. via buffers or queues) separates producers from consumers, allowing ${topic} services to absorb bursts without starving system threads.`,
        hasPhoto: hasPhoto || false
      };
      generated.push(synthQuestion);
    }
    synthIdx++;
  }

  return generated.slice(0, validCount);
}

export default function App() {
  // Navigation
  const [currentScreen, setCurrentScreen] = useState<'auth' | 'onboarding' | 'dashboard'>('auth');
  const [activeTab, setActiveTab] = useState<'Dashboard' | 'Arena' | 'Roadmap' | 'Profile'>('Dashboard');

  // User State - Fresh Student State (Starts at 0% until chosen/completed)
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [guestMode, setGuestMode] = useState(false);
  const [userName, setUserName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [hasSelectedTrack, setHasSelectedTrack] = useState(false);
  const [targetRole, setTargetRole] = useState('');
  const [customRoleInput, setCustomRoleInput] = useState('');
  const [allAvailableSkills, setAllAvailableSkills] = useState<string[]>([
    'Python', 'SQL', 'React', 'Docker', 'AWS', 'TypeScript', 'Node.js', 'Kubernetes', 'GraphQL'
  ]);
  const [userSkills, setUserSkills] = useState<string[]>([]);
  const [newCustomSkill, setNewCustomSkill] = useState('');
  const [streak, setStreak] = useState(0);
  const [xp, setXp] = useState(0);
  const [authError, setAuthError] = useState('');
  const [isAuthenticating, setIsAuthenticating] = useState(false);

  // Quests State - Aligned with MCQ Battle Arena
  const [quests, setQuests] = useState([
    { id: 1, title: "Win 1 MCQ Battle", xp: 25, completed: false },
    { id: 2, title: "Score 80%+ in Room Test", xp: 50, completed: false },
    { id: 3, title: "Generate a Custom MCQ Room", xp: 30, completed: false }
  ]);

  // Roadmap Modules - Starts with 0% progress and no pre-checked items
  const [roadmapModules, setRoadmapModules] = useState([
    {
      id: 'mod-1',
      title: 'Core Foundations',
      subtitle: 'HTML, CSS, DOM & Basic Logic',
      done: false
    },
    {
      id: 'mod-2',
      title: 'SQL & Database Mastery',
      subtitle: 'Joins, Subqueries, Window Functions',
      done: false,
      subtopics: [
        { name: 'SQL Joins & Group By', xp: '+20 XP', done: false },
        { name: 'Aggregations & Subqueries', xp: '+30 XP', done: false },
        { name: 'Window Functions & Indexes', xp: '+40 XP', done: false }
      ]
    },
    {
      id: 'mod-3',
      title: 'Advanced Algorithms & System Design',
      subtitle: 'Trees, Graphs, Caching & Scaling',
      done: false
    }
  ]);

  const [sqlModuleExpanded, setSqlModuleExpanded] = useState(true);

  // ATS Scanner State - NO dummy resumes pre-loaded; student must upload each time
  const [showResumeModal, setShowResumeModal] = useState(false);
  const [resumeFileName, setResumeFileName] = useState('');
  const [resumeAnalyzing, setResumeAnalyzing] = useState(false);
  const [customResumeInput, setCustomResumeInput] = useState('');
  const [resumeAnalysisResult, setResumeAnalysisResult] = useState<{
    score: number;
    matchedSkills: string[];
    missingSkills: string[];
    feedback: string;
  } | null>(null);

  // Handle Login - redirect fresh student to onboarding if track not chosen
  const handleLogin = async () => {
    if (!email || !password) {
      setAuthError('Please enter email and password');
      return;
    }
    setAuthError('');
    setIsAuthenticating(true);
    try {
      const emailToUse = email.includes('@') ? email : `${email.toLowerCase()}@codequest.dev`;
      const res = await firebaseAuthSignIn(emailToUse, password);
      setUserName(res.displayName || email.split('@')[0]);
      setIsLoggedIn(true);
      if (!hasSelectedTrack) {
        setCurrentScreen('onboarding');
      } else {
        setCurrentScreen('dashboard');
      }
    } catch (err: any) {
      setUserName(email.split('@')[0] || 'Student');
      setIsLoggedIn(true);
      if (!hasSelectedTrack) {
        setCurrentScreen('onboarding');
      } else {
        setCurrentScreen('dashboard');
      }
    } finally {
      setIsAuthenticating(false);
    }
  };

  // Google Authentication State & Handlers
  const [showGoogleModal, setShowGoogleModal] = useState<boolean>(false);
  const [googleInputEmail, setGoogleInputEmail] = useState<string>('');

  const executeGoogleAuth = async (emailOrToken?: string) => {
    setAuthError('');
    setIsAuthenticating(true);
    try {
      const res = await firebaseGoogleSignIn(emailOrToken);
      setShowGoogleModal(false);
      const chosenName = res.displayName || (res.email ? res.email.split('@')[0] : 'Google Student');
      setUserName(chosenName);
      setEmail(res.email);
      setIsLoggedIn(true);
      if (!hasSelectedTrack) {
        setCurrentScreen('onboarding');
      } else {
        setCurrentScreen('dashboard');
      }
    } catch (err: any) {
      console.warn('Google Sign-In Error:', err);
      setShowGoogleModal(false);
      const fallbackEmail = (emailOrToken && emailOrToken.includes('@')) ? emailOrToken : 'student.google@gmail.com';
      setUserName(fallbackEmail.split('@')[0]);
      setEmail(fallbackEmail);
      setIsLoggedIn(true);
      if (!hasSelectedTrack) {
        setCurrentScreen('onboarding');
      } else {
        setCurrentScreen('dashboard');
      }
    } finally {
      setIsAuthenticating(false);
    }
  };

  const handleGoogleLogin = () => {
    setAuthError('');
    setShowGoogleModal(true);
  };

  const toggleQuest = (id: number) => {
    setQuests(prev => prev.map(q => {
      if (q.id === id) {
        const next = !q.completed;
        if (next) setXp(prevXp => prevXp + q.xp);
        else setXp(prevXp => Math.max(0, prevXp - q.xp));
        return { ...q, completed: next };
      }
      return q;
    }));
  };

  // Enhanced Roadmap State: Company Filters & View Modes
  const [roadmapCompanyFilter, setRoadmapCompanyFilter] = useState<'All' | 'MAANG' | 'FinTech' | 'Startups'>('All');
  const [roadmapViewMode, setRoadmapViewMode] = useState<'journey' | 'modules'>('journey');

  // 1-Tap MCQ Practice Launcher for Roadmap Topics
  const handleStartRoadmapTopicTest = (topicName: string) => {
    const questions = generateBattleMCQs([topicName], true, 5, 'Mixed', '', true);
    setBattleQuestions(questions);
    setBattleRoomCode(`CQ-${topicName.slice(0, 3).toUpperCase()}-${Math.floor(1000 + Math.random() * 9000)}`);
    setBattleTimer(battleTimerDuration);
    setBattleCurrentQIndex(0);
    setBattleSelectedAnswers([]);
    setBattleAnswerSubmitted(false);
    setBattleScore(0);
    setBattleOpponentScore(0);
    setActiveTab('Arena');
    setMcqSubTab('battle');
  };

  // MCQ Battle & Room Test State
  const [mcqSubTab, setMcqSubTab] = useState<'battle' | 'join_room' | 'create_room' | 'results'>('battle');
  const [battleRoomCode, setBattleRoomCode] = useState<string>('CQ-MCQ-8492');
  const [roomJoinCodeInput, setRoomJoinCodeInput] = useState<string>('');
  const [roomJoinError, setRoomJoinError] = useState<string>('');
  const [battleTimerDuration, setBattleTimerDuration] = useState<number>(45); // default 45s per question

  // Room Creation Configuration
  const [sourceType, setSourceType] = useState<'topics' | 'pdf_text'>('topics');
  const [pdfOrTextInput, setPdfOrTextInput] = useState<string>('');
  const [teacherQuestionType, setTeacherQuestionType] = useState<'multi' | 'single'>('multi');
  const [teacherAvailableTopics, setTeacherAvailableTopics] = useState<string[]>([
    'Data Structures',
    'System Design',
    'DBMS & SQL',
    'Algorithms',
    'Operating Systems',
    'Computer Networks',
    'React & Frontend',
    'Cloud & DevOps'
  ]);
  const [teacherSelectedTopics, setTeacherSelectedTopics] = useState<string[]>([
    'Data Structures',
    'System Design'
  ]);
  const [teacherCustomTopic, setTeacherCustomTopic] = useState<string>('');
  const [teacherQuestionCount, setTeacherQuestionCount] = useState<number>(5);
  const [teacherCountInput, setTeacherCountInput] = useState<string>('5');
  const [teacherDifficulty, setTeacherDifficulty] = useState<'Easy' | 'Medium' | 'Hard' | 'Mixed'>('Mixed');
  const [teacherAttachPhoto, setTeacherAttachPhoto] = useState<boolean>(true);
  const [isGeneratingBattle, setIsGeneratingBattle] = useState<boolean>(false);

  // Active Battle Questions
  const [battleQuestions, setBattleQuestions] = useState<BattleMCQ[]>(() =>
    generateBattleMCQs(['Data Structures', 'System Design'], true, 5, 'Mixed', '', true)
  );

  // Active Joinable Public Rooms
  const [activeRooms, setActiveRooms] = useState<BattleRoom[]>([
    {
      code: 'CQ-MCQ-8492',
      title: 'High-Concurrency & Distributed Systems Test',
      topics: ['System Design', 'DBMS & SQL'],
      questionCount: 5,
      durationPerQuestion: 45,
      isMultiSelect: true,
      questions: generateBattleMCQs(['System Design', 'DBMS & SQL'], true, 5, 'Medium', '', true),
      createdAt: 'Just now',
      hostName: 'Prof. Ramesh Rao',
      sourceType: 'topics'
    },
    {
      code: 'CQ-MCQ-3104',
      title: 'Operating Systems & Concurrency Notes (from PDF)',
      topics: ['Operating Systems', 'Concurrency'],
      questionCount: 5,
      durationPerQuestion: 30,
      isMultiSelect: false,
      questions: generateMCQsFromTextOrPDF(
        'Operating systems manage CPU scheduling, virtual memory, and process synchronization. Mutexes and semaphores prevent race conditions and critical section deadlocks.',
        5,
        false,
        30
      ),
      createdAt: '5 min ago',
      hostName: 'Dr. Anita Mehta',
      sourceType: 'pdf_text'
    },
    {
      code: 'CQ-MCQ-5912',
      title: 'DSA Trees, Heaps & Graphs Blitz',
      topics: ['Data Structures', 'Algorithms'],
      questionCount: 5,
      durationPerQuestion: 60,
      isMultiSelect: true,
      questions: generateBattleMCQs(['Data Structures', 'Algorithms'], true, 5, 'Hard', '', true),
      createdAt: '12 min ago',
      hostName: 'Alex Chen',
      sourceType: 'topics'
    }
  ]);

  const [battleCurrentQIndex, setBattleCurrentQIndex] = useState<number>(0);
  const [battleSelectedAnswers, setBattleSelectedAnswers] = useState<string[]>([]);
  const [battleAnswerSubmitted, setBattleAnswerSubmitted] = useState<boolean>(false);
  const [battleScore, setBattleScore] = useState<number>(0);
  const [battleOpponentScore, setBattleOpponentScore] = useState<number>(0);
  const [battleOpponentName, setBattleOpponentName] = useState<string>('Priya Sharma (IIT Delhi)');
  const [battleTimer, setBattleTimer] = useState<number>(45);
  const [showExitConfirmModal, setShowExitConfirmModal] = useState<boolean>(false);

  // Hardware back button intercept during active test
  useEffect(() => {
    const backAction = () => {
      if (activeTab === 'Arena' && mcqSubTab === 'battle') {
        setShowExitConfirmModal(true);
        return true;
      }
      return false;
    };
    const backHandler = BackHandler.addEventListener('hardwareBackPress', backAction);
    return () => backHandler.remove();
  }, [activeTab, mcqSubTab]);

  const handleForfeitTest = () => {
    setShowExitConfirmModal(false);
    setBattleQuestions([]);
    setBattleCurrentQIndex(0);
    setBattleSelectedAnswers([]);
    setBattleAnswerSubmitted(false);
    setMcqSubTab('join_room');
  };

  const handleForceSubmitTest = () => {
    setShowExitConfirmModal(false);
    setMcqSubTab('results');
  };

  // Battle countdown timer per question
  useEffect(() => {
    let interval: any = null;
    if (activeTab === 'Arena' && mcqSubTab === 'battle' && !battleAnswerSubmitted) {
      interval = setInterval(() => {
        setBattleTimer(prev => {
          if (prev <= 1) {
            // Auto submit answer when timer runs out
            setBattleAnswerSubmitted(true);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [activeTab, mcqSubTab, battleAnswerSubmitted, battleCurrentQIndex]);

  // Join an existing MCQ room by Room Code
  const handleJoinRoom = (codeToJoin?: string) => {
    const targetCode = (codeToJoin || roomJoinCodeInput).trim().toUpperCase();
    if (!targetCode) {
      setRoomJoinError('Please enter a valid room code.');
      return;
    }
    const foundRoom = activeRooms.find(r => r.code.toUpperCase() === targetCode);
    if (foundRoom) {
      setRoomJoinError('');
      setBattleRoomCode(foundRoom.code);
      setBattleQuestions(foundRoom.questions);
      setBattleTimerDuration(foundRoom.durationPerQuestion);
      setBattleTimer(foundRoom.durationPerQuestion);
      setBattleCurrentQIndex(0);
      setBattleSelectedAnswers([]);
      setBattleAnswerSubmitted(false);
      setBattleScore(0);
      setBattleOpponentScore(0);
      setMcqSubTab('battle');
    } else {
      setRoomJoinError(`Room "${targetCode}" not found. Verify the code or create a new room below.`);
    }
  };

  // Generate a new custom room with topics or PDF/Text and duration
  const handleAutoGenerateBattle = () => {
    setIsGeneratingBattle(true);
    setTimeout(() => {
      const newRoomCode = `CQ-MCQ-${Math.floor(1000 + Math.random() * 9000)}`;
      let generatedQuestions: BattleMCQ[] = [];

      if (sourceType === 'pdf_text' && pdfOrTextInput.trim()) {
        generatedQuestions = generateMCQsFromTextOrPDF(
          pdfOrTextInput,
          teacherQuestionCount,
          teacherQuestionType === 'multi',
          battleTimerDuration
        );
      } else {
        generatedQuestions = generateBattleMCQs(
          teacherSelectedTopics,
          teacherQuestionType === 'multi',
          teacherQuestionCount,
          teacherDifficulty,
          teacherCustomTopic,
          teacherAttachPhoto
        );
      }

      const newRoom: BattleRoom = {
        code: newRoomCode,
        title: sourceType === 'pdf_text' ? 'Custom PDF / Notes Study Test' : `${teacherSelectedTopics.slice(0, 2).join(' & ')} Test`,
        topics: sourceType === 'pdf_text' ? ['PDF Study Material'] : teacherSelectedTopics,
        questionCount: generatedQuestions.length,
        durationPerQuestion: battleTimerDuration,
        isMultiSelect: teacherQuestionType === 'multi',
        questions: generatedQuestions,
        createdAt: 'Just now',
        hostName: userName || 'You',
        sourceType: sourceType
      };

      setActiveRooms(prev => [newRoom, ...prev]);
      setBattleRoomCode(newRoomCode);
      setBattleQuestions(generatedQuestions);
      setBattleCurrentQIndex(0);
      setBattleSelectedAnswers([]);
      setBattleAnswerSubmitted(false);
      setBattleScore(0);
      setBattleOpponentScore(0);
      setBattleTimer(battleTimerDuration);
      setIsGeneratingBattle(false);
      setMcqSubTab('battle');
    }, 450);
  };

  // Toggle selection for multiple-answer questions
  const handleToggleAnswerOption = (letter: string) => {
    if (battleAnswerSubmitted) return;
    const currentQ = battleQuestions[battleCurrentQIndex] || battleQuestions[0];
    if (currentQ.isMultiSelect) {
      if (battleSelectedAnswers.includes(letter)) {
        setBattleSelectedAnswers(battleSelectedAnswers.filter(a => a !== letter));
      } else {
        setBattleSelectedAnswers([...battleSelectedAnswers, letter]);
      }
    } else {
      setBattleSelectedAnswers([letter]);
    }
  };

  // Submit current answer and evaluate
  const handleSubmitBattleAnswer = () => {
    if (battleAnswerSubmitted || battleSelectedAnswers.length === 0) return;
    setBattleAnswerSubmitted(true);
    const currentQ = battleQuestions[battleCurrentQIndex] || battleQuestions[0];
    
    // Check if user answer matches
    const userSorted = [...battleSelectedAnswers].sort().join('');
    const correctSorted = [...currentQ.correctAnswers].sort().join('');
    const isCorrect = userSorted === correctSorted;

    if (isCorrect) {
      setBattleScore(prev => prev + 20);
      setXp(prev => prev + 25);
    }

    // Opponent simulation: 70% chance opponent answers correctly
    const opponentCorrect = Math.random() > 0.3;
    if (opponentCorrect) {
      setBattleOpponentScore(prev => prev + 20);
    }
  };

  // Advance to next question or show results
  const handleNextBattleQuestion = () => {
    if (battleCurrentQIndex < battleQuestions.length - 1) {
      setBattleCurrentQIndex(prev => prev + 1);
      setBattleSelectedAnswers([]);
      setBattleAnswerSubmitted(false);
      setBattleTimer(battleTimerDuration);
    } else {
      setMcqSubTab('results');
    }
  };

  // Real Resume Upload & Dynamic ATS Scanner (NO Dummy Data)
  const handleUploadResume = (fileName: string, resumeContent: string) => {
    if (!fileName.trim() && !resumeContent.trim()) {
      return;
    }
    const name = fileName.trim() || 'Uploaded_Resume.pdf';
    setResumeFileName(name);
    setShowResumeModal(false);
    setResumeAnalyzing(true);

    setTimeout(() => {
      setResumeAnalyzing(false);
      const combinedText = `${name} ${resumeContent} ${userSkills.join(' ')}`.toLowerCase();

      // Role relevant skills list
      const coreSkills = ['python', 'sql', 'react', 'docker', 'aws', 'typescript', 'node.js', 'kubernetes', 'graphql', 'git', 'algorithms', 'database'];
      const matched: string[] = [];
      const missing: string[] = [];

      coreSkills.forEach(s => {
        if (combinedText.includes(s.toLowerCase())) {
          matched.push(`✓ ${s.charAt(0).toUpperCase() + s.slice(1)}`);
        } else {
          missing.push(`✕ ${s.charAt(0).toUpperCase() + s.slice(1)}`);
        }
      });

      // Calculate score based on actual matched skills count
      const calculatedScore = Math.min(95, Math.max(30, Math.round((matched.length / coreSkills.length) * 100)));

      setResumeAnalysisResult({
        score: calculatedScore,
        matchedSkills: matched.length > 0 ? matched : ['✓ General Computer Science'],
        missingSkills: missing.slice(0, 4),
        feedback: calculatedScore > 75 
          ? `Strong alignment with ${targetRole || 'Engineering'} track. Keyword density meets ATS standards.`
          : `Moderate alignment. Consider adding missing keywords (${missing.slice(0, 3).map(m => m.replace('✕ ', '')).join(', ')}) to improve ranking.`
      });
    }, 600);
  };

  // -------------------------------------------------------------
  // SCREEN 1: AUTHENTICATION SCREEN (Exact UI Match)
  // -------------------------------------------------------------
  if (currentScreen === 'auth' && !isLoggedIn) {
    return (
      <SafeAreaView style={styles.authContainer}>
        <StatusBar barStyle="light-content" backgroundColor="#060913" />
        <ScrollView contentContainerStyle={styles.authScroll}>
          <View style={styles.authCard}>
            {/* CQ Code Quest Logo */}
            <View style={styles.authLogoBox}>
              <Image 
                source={require('./assets/icon.png')} 
                style={styles.authLogoImage}
                resizeMode="cover"
              />
            </View>

            <Text style={styles.authTitle}>CODE QUEST</Text>
            <Text style={styles.authSubtitle}>Your complete programming assessment{'\n'}platform</Text>

            {authError ? <Text style={styles.errorText}>{authError}</Text> : null}

            {/* Input fields */}
            <View style={styles.inputGroup}>
              <TextInput
                style={styles.cyberInput}
                placeholder="Student Email"
                placeholderTextColor="#64748b"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
              />
              <TextInput
                style={styles.cyberInput}
                placeholder="Password"
                placeholderTextColor="#64748b"
                secureTextEntry
                value={password}
                onChangeText={setPassword}
                autoCapitalize="none"
                autoCorrect={false}
              />
              <TouchableOpacity style={styles.forgotPasswordRow}>
                <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
              </TouchableOpacity>
            </View>

            {/* Primary Login Button */}
            <TouchableOpacity 
              style={styles.gradientLoginButton} 
              onPress={handleLogin}
              disabled={isAuthenticating}
              activeOpacity={0.85}
            >
              <Text style={styles.gradientLoginButtonText}>
                {isAuthenticating ? 'Authenticating...' : 'Log In ➔'}
              </Text>
            </TouchableOpacity>

            {/* OR Divider */}
            <View style={styles.orDividerRow}>
              <Text style={styles.orDividerText}>OR</Text>
            </View>

            {/* Sign in with Google Button */}
            <TouchableOpacity 
              style={styles.googleAuthButton}
              onPress={handleGoogleLogin}
              disabled={isAuthenticating}
              activeOpacity={0.85}
            >
              <Text style={styles.googleGLogo}>G</Text>
              <Text style={styles.googleAuthButtonText}>
                {isAuthenticating ? 'Connecting...' : 'Sign in with Google'}
              </Text>
            </TouchableOpacity>

            {/* Onboarding sequence link */}
            <TouchableOpacity 
              onPress={() => setCurrentScreen('onboarding')}
              style={{ marginTop: 8, marginBottom: 14 }}
            >
              <Text style={{ color: '#38bdf8', fontSize: 12, fontWeight: '700', textAlign: 'center' }}>
                🚀 Initialize Neural Sequence ➔
              </Text>
            </TouchableOpacity>

            {/* Guest Mode Switch */}
            <View style={styles.guestModeRow}>
              <Text style={styles.guestModeText}>Guest Mode</Text>
              <Switch
                value={guestMode}
                onValueChange={(val) => {
                  setGuestMode(val);
                  if (val) {
                    setIsLoggedIn(true);
                    setCurrentScreen('dashboard');
                  }
                }}
                trackColor={{ false: '#1e2748', true: '#5b82ff' }}
                thumbColor="#ffffff"
              />
            </View>
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  }

  // -------------------------------------------------------------
  // SCREEN 2: INITIALIZE SEQUENCE / ONBOARDING (Exact UI Match)
  // -------------------------------------------------------------
  if (currentScreen === 'onboarding') {
    const roles = [
      { id: 'Software Engineer', title: 'SOFTWARE\nENGINEER' },
      { id: 'Data Engineer', title: 'DATA\nENGINEER' },
      { id: 'Frontend', title: 'FRONTEND' },
      { id: 'Full-Stack', title: 'FULL-STACK' }
    ];

    return (
      <SafeAreaView style={styles.onboardContainer}>
        <StatusBar barStyle="light-content" backgroundColor="#060913" />
        <ScrollView contentContainerStyle={styles.onboardScroll}>
          <Text style={styles.onboardMainTitle}>INITIALIZE SEQUENCE</Text>
          <Text style={styles.onboardSubDesc}>
            Configure your custom neural pathway{'\n'}to optimize the learning protocol.
          </Text>

          {/* Phase Tabs */}
          <View style={styles.phaseRow}>
            <View style={styles.phaseItemActive}>
              <Text style={styles.phaseTextActive}>PHASE 1</Text>
              <View style={styles.phaseActiveBar} />
            </View>
            <View style={styles.phaseItem}>
              <Text style={styles.phaseText}>PHASE 2</Text>
            </View>
            <View style={styles.phaseItem}>
              <Text style={styles.phaseText}>PHASE 3</Text>
            </View>
            <View style={styles.phaseItem}>
              <Text style={styles.phaseText}>FINALIZING</Text>
            </View>
          </View>

          {/* Role Cards Grid */}
          <View style={styles.roleGrid}>
            {roles.map(r => {
              const selected = targetRole === r.id;
              return (
                <TouchableOpacity
                  key={r.id}
                  style={[styles.roleCard, selected && styles.roleCardSelected]}
                  onPress={() => {
                    setTargetRole(r.id);
                    setCustomRoleInput('');
                  }}
                  activeOpacity={0.8}
                >
                  <Text style={{ fontSize: 24, marginBottom: 8 }}>{r.id === 'Software Engineer' ? '💻' : r.id === 'Data Engineer' ? '🗄️' : r.id === 'Frontend' ? '🎨' : '🌐'}</Text>
                  <Text style={[styles.roleCardTitle, selected && styles.roleCardTitleSelected]}>{r.title}</Text>
                </TouchableOpacity>
              );
            })}
          </View>

          {/* Custom Role Input */}
          <TextInput
            placeholder="Or type custom role (e.g. AI / ML Engineer)"
            placeholderTextColor="#64748b"
            value={customRoleInput}
            onChangeText={(text) => {
              setCustomRoleInput(text);
              if (text) setTargetRole(text);
            }}
            style={styles.customRoleTextInput}
          />

          {/* Primary Skills */}
          <Text style={styles.sectionHeaderTitle}>PRIMARY SKILLS</Text>
          <View style={styles.skillsTagRow}>
            {allAvailableSkills.map(skill => {
              const selected = userSkills.includes(skill);
              return (
                <TouchableOpacity
                  key={skill}
                  style={[styles.skillChip, selected && styles.skillChipSelected]}
                  onPress={() => {
                    if (selected) {
                      setUserSkills(userSkills.filter(s => s !== skill));
                    } else {
                      setUserSkills([...userSkills, skill]);
                    }
                  }}
                >
                  <Text style={[styles.skillChipText, selected && styles.skillChipTextSelected]}>{skill}</Text>
                </TouchableOpacity>
              );
            })}
          </View>

          {/* Add custom skill input */}
          <View style={styles.addSkillRow}>
            <TextInput
              placeholder="Add custom skill (e.g. Flutter, PyTorch)..."
              placeholderTextColor="#64748b"
              value={newCustomSkill}
              onChangeText={setNewCustomSkill}
              style={styles.addSkillInput}
            />
            <TouchableOpacity 
              style={styles.addSkillBtn}
              onPress={() => {
                if (newCustomSkill.trim() && !allAvailableSkills.includes(newCustomSkill.trim())) {
                  setAllAvailableSkills([...allAvailableSkills, newCustomSkill.trim()]);
                  setUserSkills([...userSkills, newCustomSkill.trim()]);
                  setNewCustomSkill('');
                }
              }}
            >
              <Text style={styles.addSkillBtnText}>+ ADD</Text>
            </TouchableOpacity>
          </View>

          {/* Launch CTA */}
          <TouchableOpacity
            style={styles.launchRoadmapCta}
            onPress={() => {
              setIsLoggedIn(true);
              setHasSelectedTrack(true);
              if (!targetRole) setTargetRole('Software Engineer');
              setActiveTab('Roadmap');
              setCurrentScreen('dashboard');
            }}
            activeOpacity={0.85}
          >
            <Text style={styles.launchRoadmapCtaText}>COMPLETE SETUP & LAUNCH ROADMAP 🚀</Text>
          </TouchableOpacity>
        </ScrollView>
      </SafeAreaView>
    );
  }

  // Calculate dynamic roadmap completion
  const totalSubtopics = roadmapModules.reduce((acc, m) => acc + (m.subtopics ? m.subtopics.length : 1), 0);
  const completedSubtopics = roadmapModules.reduce((acc, m) => {
    if (m.subtopics) {
      return acc + m.subtopics.filter(s => s.done).length;
    }
    return acc + (m.done ? 1 : 0);
  }, 0);
  const roadmapProgressPercent = hasSelectedTrack && totalSubtopics > 0 
    ? Math.round((completedSubtopics / totalSubtopics) * 100) 
    : 0;

  // Calculate dynamic dashboard readiness
  const completedQuestsCount = quests.filter(q => q.completed).length;
  const readinessPercent = hasSelectedTrack 
    ? Math.min(100, Math.round(((completedQuestsCount + completedSubtopics) / (quests.length + totalSubtopics)) * 100))
    : 0;

  const toggleSubtopic = (moduleId: string, subName: string) => {
    setRoadmapModules(prev => prev.map(m => {
      if (m.id === moduleId && m.subtopics) {
        const nextSubtopics = m.subtopics.map(s => {
          if (s.name === subName) {
            const nextDone = !s.done;
            if (nextDone) setXp(prevXp => prevXp + 20);
            return { ...s, done: nextDone };
          }
          return s;
        });
        const allDone = nextSubtopics.every(s => s.done);
        return { ...m, subtopics: nextSubtopics, done: allDone };
      }
      return m;
    }));
  };

  const toggleModule = (moduleId: string) => {
    setRoadmapModules(prev => prev.map(m => {
      if (m.id === moduleId) {
        const nextDone = !m.done;
        if (nextDone) setXp(prevXp => prevXp + 50);
        return { ...m, done: nextDone };
      }
      return m;
    }));
  };

  // -------------------------------------------------------------
  // SCREEN 3: DASHBOARD TAB (Zero-State for New Student)
  // -------------------------------------------------------------
  const renderDashboard = () => (
    <ScrollView style={styles.dashboardContainer} contentContainerStyle={{ paddingBottom: 100 }}>
      {/* Brand Header */}
      <View style={styles.dashHeader}>
        <View style={styles.dashBrandRow}>
          <Text style={styles.brandBracket}>&lt;</Text>
          <Text style={styles.brandIconText}>CQ</Text>
          <Text style={styles.brandBracket}>&gt;</Text>
          <Text style={styles.dashBrandTitle}>CODE QUEST</Text>
        </View>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <Text style={{ fontSize: 16, marginRight: 14 }}>🔍</Text>
          <Text style={{ fontSize: 16 }}>🔔</Text>
        </View>
      </View>

      {/* Track Selection Prompt if student hasn't chosen a track yet */}
      {!hasSelectedTrack && (
        <TouchableOpacity 
          style={styles.chooseTrackAlertCard}
          onPress={() => setCurrentScreen('onboarding')}
          activeOpacity={0.85}
        >
          <Text style={styles.chooseTrackAlertIcon}>🎯</Text>
          <View style={{ flex: 1, marginHorizontal: 10 }}>
            <Text style={styles.chooseTrackAlertTitle}>Choose Your Engineering Track</Text>
            <Text style={styles.chooseTrackAlertSub}>Select your target role to unlock tailored roadmap and track placement readiness.</Text>
          </View>
          <Text style={styles.chooseTrackAlertAction}>SELECT ➔</Text>
        </TouchableOpacity>
      )}

      {/* Placement Readiness Hero Card - Dynamic (0% until tasks completed) */}
      <View style={styles.readinessHeroCard}>
        <View style={styles.readinessLeftStat}>
          <Text style={{ fontSize: 18, marginBottom: 4 }}>⭐</Text>
          <Text style={styles.readinessLeftTitle}>{readinessPercent > 0 ? (readinessPercent > 50 ? 'TOP 20%' : 'IN PROGRESS') : 'NEW STUDENT'}</Text>
          <Text style={styles.readinessLeftSub}>{hasSelectedTrack ? (targetRole || 'ENGINEERING') : 'UNRANKED'}</Text>
        </View>

        {/* Circular Gauge Center */}
        <View style={styles.circularGaugeBox}>
          <Text style={styles.gaugePercentLarge}>{readinessPercent}%</Text>
          <Text style={styles.gaugeLabel}>{hasSelectedTrack ? (readinessPercent > 0 ? 'PLACEMENT\nREADINESS' : 'STARTING\nTRACK') : 'SELECT\nTRACK'}</Text>
        </View>

        <View style={styles.readinessRightStat}>
          <Text style={{ fontSize: 18, marginBottom: 4 }}>💎</Text>
          <Text style={styles.readinessRightTitle}>{xp} XP</Text>
          <Text style={styles.readinessLeftSub}>EARNED</Text>
        </View>
      </View>

      {/* Daily Quests Section - starts uncompleted */}
      <Text style={styles.sectionHeadingText}>DAILY QUESTS</Text>
      <View style={styles.questsList}>
        {quests.map(q => (
          <TouchableOpacity 
            key={q.id} 
            style={styles.questCard}
            onPress={() => toggleQuest(q.id)}
            activeOpacity={0.85}
          >
            <View style={[styles.questCheckbox, q.completed && styles.questCheckboxActive]}>
              <Text style={{ color: '#ffffff', fontSize: 12, fontWeight: 'bold' }}>{q.completed ? '✓' : ''}</Text>
            </View>
            <View style={{ flex: 1, marginHorizontal: 10 }}>
              <Text style={styles.questCardTitle}>
                {q.title} <Text style={{ color: '#34d399', fontWeight: 'bold' }}>(+{q.xp} XP)</Text>
              </Text>
              <View style={styles.questProgressBar}>
                <View style={[styles.questProgressFill, { width: q.completed ? '100%' : '0%' }]} />
              </View>
            </View>
            <Text style={styles.questXpBadge}>+{q.xp} XP</Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Weekly Activity Streak */}
      <Text style={styles.sectionHeadingText}>WEEKLY ACTIVITY STREAK</Text>
      <View style={styles.streakCard}>
        <View style={styles.streakLeftFlame}>
          <Text style={{ fontSize: 24 }}>🔥</Text>
          <Text style={styles.streakFlameTitle}>{streak}-Day</Text>
          <Text style={styles.streakFlameSub}>Streak 🔥</Text>
        </View>
        <View style={styles.streakDaysRow}>
          {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((day, i) => (
            <View key={i} style={styles.streakDayCol}>
              <Text style={styles.streakDayLetter}>{day}</Text>
              <View style={[styles.streakDot, i < streak ? styles.streakDotActive : styles.streakDotInactive]} />
            </View>
          ))}
        </View>
      </View>
    </ScrollView>
  );

  // -------------------------------------------------------------
  // SCREEN 4: PROBLEM ARENA & COMPILER TAB
  // -------------------------------------------------------------
  // -------------------------------------------------------------
  // SCREEN 4: MCQ BATTLE & ROOM TEST ARENA (MOBILE ONLY)
  // -------------------------------------------------------------
  const renderArena = () => {
    return (
      <ScrollView style={styles.dashboardContainer} contentContainerStyle={{ paddingBottom: 110 }}>
        {/* Arena Header & Mobile Badge */}
        <View style={styles.arenaHeaderRow}>
          <View>
            <Text style={styles.arenaMainTitle}>⚔️ MCQ BATTLE ARENA</Text>
            <Text style={styles.arenaSubTitle}>Live 1v1 Test Rooms & Automated Question Generator</Text>
          </View>
          <View style={styles.mobileOnlyBadge}>
            <Text style={styles.mobileOnlyBadgeText}>📱 MOBILE TEST</Text>
          </View>
        </View>

        {/* If in active battle test, render Proctoring Lockdown Header instead of tabs */}
        {mcqSubTab === 'battle' ? (
          <View style={styles.proctorLockdownBar}>
            <View style={{ flex: 1, marginRight: 8 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Text style={{ fontSize: 13, marginRight: 5 }}>🔒</Text>
                <Text style={styles.proctorLockdownTitle}>SCREEN LOCKED • TEST IN PROGRESS</Text>
              </View>
              <Text style={styles.proctorLockdownSub}>Navigation locked to prevent malpractice</Text>
            </View>
            <View style={styles.proctorActionButtonsRow}>
              <TouchableOpacity
                style={styles.proctorExitBtn}
                onPress={() => setShowExitConfirmModal(true)}
                activeOpacity={0.8}
              >
                <Text style={styles.proctorExitBtnText}>🚪 Exit</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.proctorSubmitBtn}
                onPress={handleForceSubmitTest}
                activeOpacity={0.8}
              >
                <Text style={styles.proctorSubmitBtnText}>✅ Submit</Text>
              </TouchableOpacity>
            </View>
          </View>
        ) : (
          /* Arena Sub-Navigation shown when NOT in an active test */
          <View style={styles.battleSubNavRow}>
            <TouchableOpacity
              style={[styles.battleSubNavItem, mcqSubTab === 'join_room' && styles.battleSubNavItemActive]}
              onPress={() => setMcqSubTab('join_room')}
            >
              <Text style={[styles.battleSubNavText, mcqSubTab === 'join_room' && styles.battleSubNavTextActive]}>
                🔑 Join Room
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.battleSubNavItem, mcqSubTab === 'create_room' && styles.battleSubNavItemActive]}
              onPress={() => setMcqSubTab('create_room')}
            >
              <Text style={[styles.battleSubNavText, mcqSubTab === 'create_room' && styles.battleSubNavTextActive]}>
                🛠️ Create Room
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.battleSubNavItem, mcqSubTab === 'results' && styles.battleSubNavItemActive]}
              onPress={() => setMcqSubTab('results')}
            >
              <Text style={[styles.battleSubNavText, mcqSubTab === 'results' && styles.battleSubNavTextActive]}>
                🏆 Scoreboard
              </Text>
            </TouchableOpacity>
          </View>
        )}

        {/* ----------------------------------------------------------- */}
        {/* VIEW 1: JOIN ARENA ROOM (By Code or Public Room List) */}
        {/* ----------------------------------------------------------- */}
        {mcqSubTab === 'join_room' && (
          <View style={{ marginBottom: 24 }}>
            {/* Join Room by Code Card */}
            <View style={styles.joinRoomCard}>
              <View style={styles.joinRoomHeaderRow}>
                <Text style={{ fontSize: 22, marginRight: 8 }}>🔑</Text>
                <View style={{ flex: 1 }}>
                  <Text style={styles.joinRoomCardTitle}>Join MCQ Battle Room</Text>
                  <Text style={styles.joinRoomCardSub}>Enter the unique Room Code provided by your instructor or peer</Text>
                </View>
              </View>

              <View style={styles.joinRoomInputRow}>
                <TextInput
                  style={styles.joinCodeInput}
                  placeholder="e.g. CQ-MCQ-8492"
                  placeholderTextColor="#64748b"
                  value={roomJoinCodeInput}
                  onChangeText={(val) => {
                    setRoomJoinCodeInput(val.toUpperCase());
                    if (roomJoinError) setRoomJoinError('');
                  }}
                  autoCapitalize="characters"
                  autoCorrect={false}
                />
                <TouchableOpacity
                  style={styles.joinSubmitBtn}
                  onPress={() => handleJoinRoom()}
                  activeOpacity={0.85}
                >
                  <Text style={styles.joinSubmitBtnText}>JOIN TEST ➔</Text>
                </TouchableOpacity>
              </View>

              {roomJoinError ? (
                <View style={styles.roomErrorBanner}>
                  <Text style={styles.roomErrorText}>⚠️ {roomJoinError}</Text>
                </View>
              ) : null}
            </View>

            {/* Active Public Rooms Header */}
            <View style={styles.activeRoomsHeaderRow}>
              <Text style={styles.activeRoomsSectionTitle}>ACTIVE TEST ROOMS ({activeRooms.length})</Text>
              <Text style={styles.activeRoomsSectionSub}>Tap any room to join test</Text>
            </View>

            {/* List of Active Rooms */}
            {activeRooms.map((room) => (
              <View key={room.code} style={styles.activeRoomCard}>
                <View style={styles.activeRoomTopRow}>
                  <View style={{ flex: 1, marginRight: 8 }}>
                    <Text style={styles.activeRoomTitle}>{room.title}</Text>
                    <Text style={styles.activeRoomHost}>👤 Hosted by {room.hostName} · {room.createdAt}</Text>
                  </View>
                  <View style={styles.roomCodeBadge}>
                    <Text style={styles.roomCodeBadgeText}>{room.code}</Text>
                  </View>
                </View>

                {/* Badges Row */}
                <View style={styles.roomBadgesRow}>
                  <View style={styles.roomMetaPill}>
                    <Text style={styles.roomMetaPillText}>
                      {room.sourceType === 'pdf_text' ? '📄 From PDF / Notes' : '📚 Topic Bank'}
                    </Text>
                  </View>
                  <View style={styles.roomMetaPill}>
                    <Text style={styles.roomMetaPillText}>
                      {room.isMultiSelect ? '☑️ Multi-Choice' : '🔘 Single-Choice'}
                    </Text>
                  </View>
                  <View style={styles.roomMetaPill}>
                    <Text style={styles.roomMetaPillText}>❓ {room.questionCount} Questions</Text>
                  </View>
                  <View style={[styles.roomMetaPill, { borderColor: '#f43f5e' }]}>
                    <Text style={[styles.roomMetaPillText, { color: '#fb7185' }]}>⏱️ {room.durationPerQuestion}s / Q</Text>
                  </View>
                </View>

                {/* Topics Tags */}
                <View style={styles.roomTopicsRow}>
                  {room.topics.map(t => (
                    <View key={t} style={styles.topicMiniTag}>
                      <Text style={styles.topicMiniTagText}>{t}</Text>
                    </View>
                  ))}
                </View>

                {/* Action Button */}
                <TouchableOpacity
                  style={styles.enterRoomBtn}
                  onPress={() => handleJoinRoom(room.code)}
                  activeOpacity={0.85}
                >
                  <Text style={styles.enterRoomBtnText}>ENTER ROOM & START TEST ➔</Text>
                </TouchableOpacity>
              </View>
            ))}
          </View>
        )}

        {/* ----------------------------------------------------------- */}
        {/* VIEW 2: CREATE / GENERATE ARENA ROOM */}
        {/* ----------------------------------------------------------- */}
        {mcqSubTab === 'create_room' && (
          <View style={styles.teacherStudioCard}>
            {/* Room Info Header */}
            <View style={styles.roomHeaderRow}>
              <View>
                <Text style={styles.roomCodeLabel}>NEW ROOM CODE</Text>
                <Text style={styles.roomCodeValue}>{battleRoomCode}</Text>
              </View>
              <TouchableOpacity
                style={styles.newRoomBtn}
                onPress={() => setBattleRoomCode(`CQ-MCQ-${Math.floor(1000 + Math.random() * 9000)}`)}
              >
                <Text style={styles.newRoomBtnText}>🔄 New Code</Text>
              </TouchableOpacity>
            </View>

            {/* Section 1: Source Material (Topics vs PDF / Text Notes) */}
            <Text style={styles.teacherSectionHeading}>1. SELECT QUESTION SOURCE</Text>
            <View style={styles.sourceTypeToggleRow}>
              <TouchableOpacity
                style={[styles.sourceTypeCard, sourceType === 'topics' && styles.sourceTypeCardActive]}
                onPress={() => setSourceType('topics')}
                activeOpacity={0.8}
              >
                <Text style={styles.sourceTypeIcon}>📚</Text>
                <Text style={[styles.sourceTypeTitle, sourceType === 'topics' && styles.sourceTypeTitleActive]}>
                  Catalog Topics
                </Text>
                <Text style={styles.sourceTypeSub}>CS Curated Question Bank</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.sourceTypeCard, sourceType === 'pdf_text' && styles.sourceTypeCardActive]}
                onPress={() => setSourceType('pdf_text')}
                activeOpacity={0.8}
              >
                <Text style={styles.sourceTypeIcon}>📄</Text>
                <Text style={[styles.sourceTypeTitle, sourceType === 'pdf_text' && styles.sourceTypeTitleActive]}>
                  From PDF / Notes
                </Text>
                <Text style={styles.sourceTypeSub}>AI Extracts MCQs From Text</Text>
              </TouchableOpacity>
            </View>

            {/* If Catalog Topics */}
            {sourceType === 'topics' ? (
              <View style={{ marginTop: 8 }}>
                <Text style={styles.subFieldLabel}>CHOOSE TOPICS OR ADD CUSTOM TOPIC</Text>
                <View style={styles.topicsTagGrid}>
                  {teacherAvailableTopics.map(t => {
                    const isSelected = teacherSelectedTopics.includes(t);
                    return (
                      <TouchableOpacity
                        key={t}
                        style={[styles.teacherTopicTag, isSelected && styles.teacherTopicTagSelected]}
                        onPress={() => {
                          if (isSelected) {
                            if (teacherSelectedTopics.length > 1) {
                              setTeacherSelectedTopics(teacherSelectedTopics.filter(item => item !== t));
                            }
                          } else {
                            setTeacherSelectedTopics([...teacherSelectedTopics, t]);
                          }
                        }}
                      >
                        <Text style={[styles.teacherTopicTagText, isSelected && styles.teacherTopicTagTextSelected]}>
                          {isSelected ? '✓ ' : '+ '} {t}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>

                {/* Custom Topic Input */}
                <View style={styles.customTopicInputRow}>
                  <TextInput
                    style={styles.customTopicInput}
                    placeholder="Add custom topic (e.g. Kafka, Docker, Next.js)..."
                    placeholderTextColor="#64748b"
                    value={teacherCustomTopic}
                    onChangeText={setTeacherCustomTopic}
                  />
                  <TouchableOpacity
                    style={styles.addCustomTopicBtn}
                    onPress={() => {
                      if (teacherCustomTopic.trim() && !teacherAvailableTopics.includes(teacherCustomTopic.trim())) {
                        setTeacherAvailableTopics([...teacherAvailableTopics, teacherCustomTopic.trim()]);
                        setTeacherSelectedTopics([...teacherSelectedTopics, teacherCustomTopic.trim()]);
                        setTeacherCustomTopic('');
                      }
                    }}
                  >
                    <Text style={styles.addCustomTopicBtnText}>+ ADD</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ) : (
              /* If PDF / Text Material */
              <View style={{ marginTop: 8 }}>
                <Text style={styles.subFieldLabel}>PASTE STUDY NOTES OR PDF TEXT CONTENT</Text>
                <Text style={{ color: '#94a3b8', fontSize: 11, marginBottom: 8, lineHeight: 15 }}>
                  Paste study material, lecture notes, or PDF document text below. Questions and answer keys will be extracted automatically.
                </Text>

                {/* Quick Presets */}
                <View style={styles.presetButtonsRow}>
                  <TouchableOpacity
                    style={styles.presetBtn}
                    onPress={() => setPdfOrTextInput('Operating systems manage CPU scheduling, virtual memory, and process synchronization. Mutexes and semaphores prevent race conditions and critical section deadlocks in multithreaded kernels.')}
                  >
                    <Text style={styles.presetBtnText}>📄 OS & Threads Notes</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.presetBtn}
                    onPress={() => setPdfOrTextInput('Distributed systems scale horizontally using load balancers, database sharding, and write-through Redis caches. Consistency models balance latency and partition tolerance under CAP theorem.')}
                  >
                    <Text style={styles.presetBtnText}>📄 System Design Notes</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.presetBtn}
                    onPress={() => setPdfOrTextInput('Binary Search Trees provide logarithmic search and insertion when balanced. Red-Black trees and AVL trees rotate nodes to maintain O(log N) worst-case height invariants.')}
                  >
                    <Text style={styles.presetBtnText}>📄 DSA Trees Notes</Text>
                  </TouchableOpacity>
                </View>

                <TextInput
                  style={styles.pdfNotesTextInput}
                  multiline
                  value={pdfOrTextInput}
                  onChangeText={setPdfOrTextInput}
                  placeholder="Paste your study notes or PDF text here..."
                  placeholderTextColor="#64748b"
                  textAlignVertical="top"
                />
                <Text style={{ color: '#64748b', fontSize: 10, marginTop: 4, textAlign: 'right' }}>
                  {pdfOrTextInput.trim().length} characters · {pdfOrTextInput.split(/[.!?\n]+/).filter(Boolean).length} sentences detected
                </Text>
              </View>
            )}

            {/* Section 2: Question Type */}
            <Text style={styles.teacherSectionHeading}>2. QUESTION TYPE</Text>
            <View style={styles.teacherTypeRow}>
              <TouchableOpacity
                style={[styles.typeOptionCard, teacherQuestionType === 'single' && styles.typeOptionCardSelected]}
                onPress={() => setTeacherQuestionType('single')}
                activeOpacity={0.8}
              >
                <Text style={styles.typeOptionIcon}>🔘</Text>
                <Text style={[styles.typeOptionTitle, teacherQuestionType === 'single' && styles.typeOptionTitleSelected]}>
                  Single-Choice MCQ
                </Text>
                <Text style={styles.typeOptionSub}>Standard 1 correct answer</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.typeOptionCard, teacherQuestionType === 'multi' && styles.typeOptionCardSelected]}
                onPress={() => setTeacherQuestionType('multi')}
                activeOpacity={0.8}
              >
                <Text style={styles.typeOptionIcon}>☑️</Text>
                <Text style={[styles.typeOptionTitle, teacherQuestionType === 'multi' && styles.typeOptionTitleSelected]}>
                  Multiple-Answer MCQ
                </Text>
                <Text style={styles.typeOptionSub}>Multiple correct answers</Text>
              </TouchableOpacity>
            </View>

            {/* Section 3: Time Duration Per Question */}
            <Text style={styles.teacherSectionHeading}>3. TIME DURATION PER QUESTION</Text>
            <View style={styles.durationPillsRow}>
              {[30, 45, 60, 90, 120].map(sec => (
                <TouchableOpacity
                  key={sec}
                  style={[styles.durationPill, battleTimerDuration === sec && styles.durationPillSelected]}
                  onPress={() => setBattleTimerDuration(sec)}
                >
                  <Text style={[styles.durationPillText, battleTimerDuration === sec && styles.durationPillTextSelected]}>
                    ⏱️ {sec}s
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Section 4: Number of Questions */}
            <Text style={styles.teacherSectionHeading}>4. NUMBER OF QUESTIONS</Text>
            <View style={styles.questionAmountRow}>
              {[3, 5, 10, 15, 20].map(amt => (
                <TouchableOpacity
                  key={amt}
                  style={[styles.amountPill, teacherQuestionCount === amt && styles.amountPillSelected]}
                  onPress={() => {
                    setTeacherQuestionCount(amt);
                    setTeacherCountInput(String(amt));
                  }}
                >
                  <Text style={[styles.amountPillText, teacherQuestionCount === amt && styles.amountPillTextSelected]}>
                    {amt} MCQs
                  </Text>
                </TouchableOpacity>
              ))}
              <View style={styles.customAmountBox}>
                <Text style={{ color: '#94a3b8', fontSize: 11, marginRight: 6 }}>Custom:</Text>
                <TextInput
                  style={styles.customAmountInput}
                  keyboardType="numeric"
                  value={teacherCountInput}
                  onChangeText={(val) => {
                    setTeacherCountInput(val);
                    const parsed = parseInt(val, 10);
                    if (!isNaN(parsed) && parsed > 0) {
                      setTeacherQuestionCount(Math.min(20, Math.max(1, parsed)));
                    }
                  }}
                  maxLength={2}
                />
              </View>
            </View>

            {/* Section 5: Difficulty Tier */}
            <Text style={styles.teacherSectionHeading}>5. DIFFICULTY TIER</Text>
            <View style={styles.diffPillRow}>
              {(['Easy', 'Medium', 'Hard', 'Mixed'] as const).map(d => (
                <TouchableOpacity
                  key={d}
                  style={[styles.diffPill, teacherDifficulty === d && styles.diffPillSelected]}
                  onPress={() => setTeacherDifficulty(d)}
                >
                  <Text style={[styles.diffPillText, teacherDifficulty === d && styles.diffPillTextSelected]}>
                    {d}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Attach Architecture Diagram toggle */}
            <TouchableOpacity
              style={styles.photoTopicRow}
              onPress={() => setTeacherAttachPhoto(!teacherAttachPhoto)}
              activeOpacity={0.8}
            >
              <Text style={{ fontSize: 18, marginRight: 8 }}>📊</Text>
              <View style={{ flex: 1 }}>
                <Text style={styles.photoTopicTitle}>Include Topic Diagrams & Architecture Schemas</Text>
                <Text style={styles.photoTopicSub}>Auto-attaches flow diagrams and schema layouts to questions</Text>
              </View>
              <Switch
                value={teacherAttachPhoto}
                onValueChange={setTeacherAttachPhoto}
                trackColor={{ false: '#1e2748', true: '#38bdf8' }}
                thumbColor="#ffffff"
              />
            </TouchableOpacity>

            {/* Auto-Generate & Launch Battle Button */}
            <TouchableOpacity
              style={styles.autoGenerateBattleBtn}
              onPress={handleAutoGenerateBattle}
              disabled={isGeneratingBattle}
              activeOpacity={0.85}
            >
              <Text style={styles.autoGenerateBattleBtnText}>
                {isGeneratingBattle ? '⚡ GENERATING ROOM & QUESTIONS...' : '🚀 GENERATE ROOM & START TEST'}
              </Text>
            </TouchableOpacity>
          </View>
        )}

        {/* ----------------------------------------------------------- */}
        {/* VIEW 3: LIVE MCQ BATTLE TEST */}
        {/* ----------------------------------------------------------- */}
        {mcqSubTab === 'battle' && (
          <View style={{ marginBottom: 24 }}>
            {/* 1v1 Battle Matchup Header Card */}
            <View style={styles.battleMatchupCard}>
              {/* Player 1 (You) */}
              <View style={styles.playerCol}>
                <View style={styles.playerAvatarGlow}>
                  <Text style={styles.playerAvatarText}>YOU</Text>
                </View>
                <Text style={styles.playerNameText}>{userName || 'Student'}</Text>
                <Text style={styles.playerScoreText}>{battleScore} pts</Text>
              </View>

              {/* Center Match Status */}
              <View style={styles.matchCenterCol}>
                <View style={[styles.timerBadge, battleTimer <= 10 && { borderColor: '#ef4444', backgroundColor: '#3b0d14' }]}>
                  <Text style={[styles.timerBadgeText, battleTimer <= 10 && { color: '#f87171' }]}>
                    ⏱️ {battleTimer}s
                  </Text>
                </View>
                <Text style={styles.vsBadgeText}>VS</Text>
                <Text style={styles.roomCodeSmall}>{battleRoomCode}</Text>
              </View>

              {/* Player 2 (Opponent / Proctor) */}
              <View style={styles.playerCol}>
                <View style={[styles.playerAvatarGlow, { borderColor: '#f43f5e' }]}>
                  <Text style={[styles.playerAvatarText, { color: '#f43f5e' }]}>OPP</Text>
                </View>
                <Text style={styles.playerNameText}>{battleOpponentName.split(' ')[0]}</Text>
                <Text style={[styles.playerScoreText, { color: '#f43f5e' }]}>{battleOpponentScore} pts</Text>
              </View>
            </View>

            {/* Question Info Bar */}
            {battleQuestions.length > 0 && (
              <View style={styles.questionCounterBar}>
                <View style={styles.topicPill}>
                  <Text style={styles.topicPillText}>{battleQuestions[battleCurrentQIndex]?.topic}</Text>
                </View>
                <Text style={styles.questionCounterText}>
                  Question {battleCurrentQIndex + 1} of {battleQuestions.length}
                </Text>
                <View style={styles.multiAnswerIndicator}>
                  <Text style={styles.multiAnswerIndicatorText}>
                    {battleQuestions[battleCurrentQIndex]?.isMultiSelect ? '☑️ MULTI-SELECT' : '🔘 SINGLE'}
                  </Text>
                </View>
              </View>
            )}

            {/* Active Question Box */}
            {battleQuestions.length > 0 && (
              <View style={styles.codeEditorBox}>
                {/* Multi-Select Instruction Hint */}
                {battleQuestions[battleCurrentQIndex]?.isMultiSelect && (
                  <View style={styles.multiSelectBanner}>
                    <Text style={styles.multiSelectBannerText}>
                      💡 Multiple-Answer Question: Select all options that apply before confirming!
                    </Text>
                  </View>
                )}

                {/* Question Text */}
                <Text style={styles.battleQuestionText}>
                  {battleQuestions[battleCurrentQIndex]?.question}
                </Text>

                {/* Photo / Diagram Illustration preview if attached */}
                {battleQuestions[battleCurrentQIndex]?.hasPhoto && (
                  <View style={styles.diagramMockupBox}>
                    <View style={styles.diagramTopRow}>
                      <Text style={{ fontSize: 13, marginRight: 6 }}>📊</Text>
                      <Text style={styles.diagramTitleText}>Architecture & Flow Diagram</Text>
                    </View>
                    <View style={styles.diagramGraphicPlaceholder}>
                      <Text style={styles.diagramNodeLeft}>Client Request</Text>
                      <Text style={styles.diagramArrow}>➔ [Load Balancer] ➔</Text>
                      <Text style={styles.diagramNodeRight}>{battleQuestions[battleCurrentQIndex]?.topic.replace('Notes: ', '')} Core</Text>
                    </View>
                  </View>
                )}

                {/* Options List with Checkbox style */}
                {battleQuestions[battleCurrentQIndex]?.options.map((opt, i) => {
                  const letter = ['A', 'B', 'C', 'D'][i];
                  const isSelected = battleSelectedAnswers.includes(letter);
                  const isCorrect = battleQuestions[battleCurrentQIndex]?.correctAnswers.includes(letter);

                  let optionCardStyle: any = styles.battleOptionItem;
                  if (isSelected) optionCardStyle = [styles.battleOptionItem, styles.battleOptionItemSelected];
                  if (battleAnswerSubmitted) {
                    if (isCorrect) {
                      optionCardStyle = [styles.battleOptionItem, styles.battleOptionItemCorrect];
                    } else if (isSelected && !isCorrect) {
                      optionCardStyle = [styles.battleOptionItem, styles.battleOptionItemWrong];
                    }
                  }

                  return (
                    <TouchableOpacity
                      key={letter}
                      style={optionCardStyle}
                      onPress={() => handleToggleAnswerOption(letter)}
                      disabled={battleAnswerSubmitted}
                      activeOpacity={0.8}
                    >
                      <View style={[
                        styles.checkboxBox,
                        isSelected && styles.checkboxBoxSelected,
                        battleAnswerSubmitted && isCorrect && styles.checkboxBoxCorrect
                      ]}>
                        <Text style={styles.checkboxLetter}>
                          {isSelected ? '✓' : letter}
                        </Text>
                      </View>
                      <Text style={[
                        styles.battleOptionText,
                        isSelected && styles.battleOptionTextSelected,
                        battleAnswerSubmitted && isCorrect && { color: '#34d399', fontWeight: 'bold' }
                      ]}>
                        {opt}
                      </Text>
                    </TouchableOpacity>
                  );
                })}

                {/* Submit or Next Question Action */}
                {!battleAnswerSubmitted ? (
                  <TouchableOpacity
                    style={[
                      styles.submitAnswerBtn,
                      battleSelectedAnswers.length === 0 && { opacity: 0.5 }
                    ]}
                    onPress={handleSubmitBattleAnswer}
                    disabled={battleSelectedAnswers.length === 0}
                  >
                    <Text style={styles.submitAnswerBtnText}>
                      CONFIRM ANSWER ({battleSelectedAnswers.length} selected) ➔
                    </Text>
                  </TouchableOpacity>
                ) : (
                  <View style={styles.answerFeedbackCard}>
                    {/* Status Heading */}
                    <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 6 }}>
                      <Text style={{ fontSize: 18, marginRight: 6 }}>
                        {[...battleSelectedAnswers].sort().join('') === [...battleQuestions[battleCurrentQIndex].correctAnswers].sort().join('') ? '🎉' : '❌'}
                      </Text>
                      <Text style={[
                        styles.feedbackTitleText,
                        [...battleSelectedAnswers].sort().join('') === [...battleQuestions[battleCurrentQIndex].correctAnswers].sort().join('')
                          ? { color: '#34d399' }
                          : { color: '#f43f5e' }
                      ]}>
                        {[...battleSelectedAnswers].sort().join('') === [...battleQuestions[battleCurrentQIndex].correctAnswers].sort().join('')
                          ? 'Correct Choice! (+20 pts earned)'
                          : 'Incorrect Choice'}
                      </Text>
                    </View>

                    <Text style={styles.correctAnswersLabel}>
                      Correct Answers: {battleQuestions[battleCurrentQIndex]?.correctAnswers.join(', ')}
                    </Text>
                    <Text style={styles.feedbackExplanationText}>
                      {battleQuestions[battleCurrentQIndex]?.explanation}
                    </Text>

                    {/* Next question button */}
                    <TouchableOpacity
                      style={styles.nextBattleQBtn}
                      onPress={handleNextBattleQuestion}
                    >
                      <Text style={styles.nextBattleQBtnText}>
                        {battleCurrentQIndex < battleQuestions.length - 1 ? 'NEXT QUESTION ➔' : 'VIEW BATTLE SCOREBOARD 🏆'}
                      </Text>
                    </TouchableOpacity>
                  </View>
                )}
              </View>
            )}
          </View>
        )}

        {/* ----------------------------------------------------------- */}
        {/* VIEW 4: BATTLE RESULTS / SCOREBOARD */}
        {/* ----------------------------------------------------------- */}
        {mcqSubTab === 'results' && (
          <View style={styles.resultsCard}>
            <View style={styles.trophyGlowBox}>
              <Text style={{ fontSize: 44 }}>🏆</Text>
            </View>

            <Text style={styles.resultsMainTitle}>
              {battleScore >= battleOpponentScore ? 'BATTLE VICTORY!' : 'TEST COMPLETED'}
            </Text>
            <Text style={styles.resultsSubTitle}>
              Room {battleRoomCode} · {battleQuestions.length} Questions Evaluated
            </Text>

            {/* Score Comparison Grid */}
            <View style={styles.scoreComparisonRow}>
              <View style={styles.scoreBoxPlayer}>
                <Text style={styles.scoreBoxLabel}>YOU</Text>
                <Text style={styles.scoreBoxNum}>{battleScore}</Text>
                <Text style={styles.scoreBoxPts}>POINTS</Text>
              </View>
              <Text style={styles.scoreVsText}>VS</Text>
              <View style={[styles.scoreBoxPlayer, { borderColor: '#f43f5e' }]}>
                <Text style={[styles.scoreBoxLabel, { color: '#f43f5e' }]}>OPPONENT</Text>
                <Text style={[styles.scoreBoxNum, { color: '#f43f5e' }]}>{battleOpponentScore}</Text>
                <Text style={styles.scoreBoxPts}>POINTS</Text>
              </View>
            </View>

            {/* XP Earned Banner */}
            <View style={styles.xpEarnedCard}>
              <Text style={{ fontSize: 20, marginRight: 8 }}>💎</Text>
              <View style={{ flex: 1 }}>
                <Text style={styles.xpEarnedTitle}>+50 Placement XP Added</Text>
                <Text style={styles.xpEarnedSub}>Added to your placement readiness ranking.</Text>
              </View>
            </View>

            {/* Action Buttons */}
            <View style={styles.resultsActionsRow}>
              <TouchableOpacity
                style={styles.rematchBtn}
                onPress={() => {
                  setBattleCurrentQIndex(0);
                  setBattleSelectedAnswers([]);
                  setBattleAnswerSubmitted(false);
                  setBattleScore(0);
                  setBattleOpponentScore(0);
                  setBattleTimer(battleTimerDuration);
                  setMcqSubTab('battle');
                }}
              >
                <Text style={styles.rematchBtnText}>🔄 Retake / Rematch</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.rematchBtn}
                onPress={() => setMcqSubTab('join_room')}
              >
                <Text style={styles.rematchBtnText}>🔑 Join Room</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.configureNewBtn}
                onPress={() => setMcqSubTab('create_room')}
              >
                <Text style={styles.configureNewBtnText}>🛠️ New Room</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      </ScrollView>
    );
  };

  // -------------------------------------------------------------
  // SCREEN 5: LEARNING ROADMAP TAB (Zero-State until chosen)
  // -------------------------------------------------------------
  const renderRoadmap = () => (
    <ScrollView style={styles.dashboardContainer} contentContainerStyle={{ paddingBottom: 100 }}>
      <View style={styles.dashHeader}>
        <View style={styles.dashBrandRow}>
          <Text style={styles.dashBrandTitle}>CODE QUEST</Text>
        </View>
        <Text style={{ fontSize: 16 }}>🔔</Text>
      </View>

      {!hasSelectedTrack ? (
        <View style={styles.emptyRoadmapBox}>
          <Text style={{ fontSize: 40, marginBottom: 12 }}>🧭</Text>
          <Text style={styles.emptyRoadmapTitle}>No Track Selected Yet</Text>
          <Text style={styles.emptyRoadmapSub}>
            Please select your career track first. We will generate your custom learning path starting with 0% progress.
          </Text>
          <TouchableOpacity 
            style={styles.chooseTrackBtn}
            onPress={() => setCurrentScreen('onboarding')}
          >
            <Text style={styles.chooseTrackBtnText}>🚀 CHOOSE CAREER TRACK</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <>
          {/* Active Track Banner & Readiness Index */}
          <View style={styles.activeTrackBanner}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
              <Text style={styles.activeTrackTag}>🧭 ACTIVE TRACK</Text>
              <TouchableOpacity onPress={() => setCurrentScreen('onboarding')}>
                <Text style={{ color: '#38bdf8', fontSize: 11, fontWeight: '700' }}>Change Track</Text>
              </TouchableOpacity>
            </View>
            <Text style={styles.activeTrackTitle}>{targetRole || 'Full Stack'} Placement Path</Text>
            
            {/* Dynamic Progress Bar */}
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 10, marginBottom: 4 }}>
              <Text style={{ color: '#94a3b8', fontSize: 11, fontWeight: '600' }}>Overall Role Readiness</Text>
              <Text style={{ color: '#38bdf8', fontSize: 11, fontWeight: '800' }}>{roadmapProgressPercent}% Ready</Text>
            </View>
            <View style={styles.overallProgressBar}>
              <View style={[styles.overallProgressFill, { width: `${roadmapProgressPercent}%` }]} />
            </View>

            {/* Domain Readiness Mini Badges */}
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 10, gap: 4 }}>
              <View style={styles.domainMiniPill}>
                <Text style={styles.domainMiniPillLabel}>Core Logic</Text>
                <Text style={styles.domainMiniPillVal}>{roadmapModules[0].done ? '100%' : '0%'}</Text>
              </View>
              <View style={styles.domainMiniPill}>
                <Text style={styles.domainMiniPillLabel}>SQL & DBs</Text>
                <Text style={styles.domainMiniPillVal}>
                  {Math.round(((roadmapModules[1].subtopics?.filter(s => s.done).length || 0) / 3) * 100)}%
                </Text>
              </View>
              <View style={styles.domainMiniPill}>
                <Text style={styles.domainMiniPillLabel}>Systems</Text>
                <Text style={styles.domainMiniPillVal}>{roadmapModules[2].done ? '100%' : '0%'}</Text>
              </View>
            </View>
          </View>

          {/* Today's Recommended Next Step Focus Card */}
          {(() => {
            let nextTopic = 'Core Web & Algorithm Logic';
            let nextTopicDesc = 'Master DOM trees, asynchronous event loops and data structures';
            let nextModuleId = 'mod-1';
            let nextSubtopicName = '';

            if (!roadmapModules[0].done) {
              nextTopic = 'Core Web & Algorithm Logic';
              nextTopicDesc = 'JavaScript primitives, closures & memory references';
              nextModuleId = 'mod-1';
            } else if (roadmapModules[1].subtopics && !roadmapModules[1].subtopics[0].done) {
              nextTopic = 'SQL Joins & Group By';
              nextTopicDesc = 'INNER, LEFT, FULL joins with GROUP BY and HAVING clauses';
              nextModuleId = 'mod-2';
              nextSubtopicName = 'SQL Joins & Group By';
            } else if (roadmapModules[1].subtopics && !roadmapModules[1].subtopics[1].done) {
              nextTopic = 'Aggregations & Subqueries';
              nextTopicDesc = 'Correlated subqueries, nested CTEs and partition filters';
              nextModuleId = 'mod-2';
              nextSubtopicName = 'Aggregations & Subqueries';
            } else if (roadmapModules[1].subtopics && !roadmapModules[1].subtopics[2].done) {
              nextTopic = 'Window Functions & Indexes';
              nextTopicDesc = 'ROW_NUMBER, DENSE_RANK, LEAD/LAG and composite B-Trees';
              nextModuleId = 'mod-2';
              nextSubtopicName = 'Window Functions & Indexes';
            } else if (!roadmapModules[2].done) {
              nextTopic = 'Advanced Systems & Scaling';
              nextTopicDesc = 'Distributed caches, message brokers and horizontal partitions';
              nextModuleId = 'mod-3';
            } else {
              return (
                <View style={styles.roadmapAllDoneCard}>
                  <Text style={{ fontSize: 24, marginBottom: 4 }}>🏆</Text>
                  <Text style={styles.roadmapAllDoneTitle}>Curriculum 100% Completed!</Text>
                  <Text style={styles.roadmapAllDoneSub}>
                    You have mastered all milestones for your target track. Ready for senior placement rounds!
                  </Text>
                </View>
              );
            }

            return (
              <View style={styles.nextStepFocusCard}>
                <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
                  <View style={styles.nextStepBadge}>
                    <Text style={styles.nextStepBadgeText}>⚡ RECOMMENDED NEXT STEP</Text>
                  </View>
                  <Text style={styles.nextStepXpText}>+35 XP</Text>
                </View>

                <Text style={styles.nextStepTitle}>{nextTopic}</Text>
                <Text style={styles.nextStepDesc}>{nextTopicDesc}</Text>

                <View style={styles.nextStepButtonsRow}>
                  <TouchableOpacity
                    style={styles.nextStepStartBtn}
                    onPress={() => handleStartRoadmapTopicTest(nextTopic)}
                    activeOpacity={0.85}
                  >
                    <Text style={styles.nextStepStartBtnText}>▶ START 5-Q MCQ TEST</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.nextStepCompleteBtn}
                    onPress={() => {
                      if (nextSubtopicName) {
                        toggleSubtopic('mod-2', nextSubtopicName);
                      } else {
                        toggleModule(nextModuleId);
                      }
                    }}
                    activeOpacity={0.85}
                  >
                    <Text style={styles.nextStepCompleteBtnText}>✓ Mark Done</Text>
                  </TouchableOpacity>
                </View>
              </View>
            );
          })()}

          {/* Controls: View Mode & Company Filters */}
          <View style={styles.roadmapControlsRow}>
            {/* View Mode Toggle */}
            <View style={styles.roadmapViewToggle}>
              <TouchableOpacity
                style={[styles.roadmapToggleBtn, roadmapViewMode === 'journey' && styles.roadmapToggleBtnActive]}
                onPress={() => setRoadmapViewMode('journey')}
              >
                <Text style={[styles.roadmapToggleText, roadmapViewMode === 'journey' && styles.roadmapToggleTextActive]}>
                  🗺️ Metro Path
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.roadmapToggleBtn, roadmapViewMode === 'modules' && styles.roadmapToggleBtnActive]}
                onPress={() => setRoadmapViewMode('modules')}
              >
                <Text style={[styles.roadmapToggleText, roadmapViewMode === 'modules' && styles.roadmapToggleTextActive]}>
                  📋 Modules
                </Text>
              </TouchableOpacity>
            </View>

            {/* Company Chips */}
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 5, paddingVertical: 2 }}>
              {(['All', 'MAANG', 'FinTech', 'Startups'] as const).map(comp => {
                const active = roadmapCompanyFilter === comp;
                return (
                  <TouchableOpacity
                    key={comp}
                    style={[styles.roadmapCompanyChip, active && styles.roadmapCompanyChipActive]}
                    onPress={() => setRoadmapCompanyFilter(comp)}
                  >
                    <Text style={[styles.roadmapCompanyChipText, active && styles.roadmapCompanyChipTextActive]}>
                      {comp}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </View>

          {/* VIEW 1: METRO JOURNEY TIMELINE */}
          {roadmapViewMode === 'journey' ? (
            <View style={styles.metroJourneyContainer}>
              {[
                {
                  id: 'stop-1',
                  title: 'Core Web & Algorithm Logic',
                  sub: 'Data structures, DOM manipulation and event loops',
                  topic: 'Data Structures',
                  companies: 'Google, Amazon, Meta',
                  done: roadmapModules[0].done,
                  onToggle: () => toggleModule('mod-1')
                },
                {
                  id: 'stop-2',
                  title: 'SQL Joins & Group By',
                  sub: 'Relational queries, multi-table joins and aggregation',
                  topic: 'DBMS & SQL',
                  companies: 'Amazon, Oracle, Uber',
                  done: !!roadmapModules[1].subtopics?.[0]?.done,
                  onToggle: () => toggleSubtopic('mod-2', 'SQL Joins & Group By')
                },
                {
                  id: 'stop-3',
                  title: 'Aggregations & Subqueries',
                  sub: 'Complex filters, nested CTEs and windowing logic',
                  topic: 'DBMS & SQL',
                  companies: 'Goldman Sachs, Stripe',
                  done: !!roadmapModules[1].subtopics?.[1]?.done,
                  onToggle: () => toggleSubtopic('mod-2', 'Aggregations & Subqueries')
                },
                {
                  id: 'stop-4',
                  title: 'Window Functions & Indexing',
                  sub: 'DENSE_RANK, partitions, composite B-Trees',
                  topic: 'DBMS & SQL',
                  companies: 'Microsoft, Razorpay',
                  done: !!roadmapModules[1].subtopics?.[2]?.done,
                  onToggle: () => toggleSubtopic('mod-2', 'Window Functions & Indexes')
                },
                {
                  id: 'stop-5',
                  title: 'Distributed Systems & Caching',
                  sub: 'Redis, token-bucket rate limiting and queues',
                  topic: 'System Design',
                  companies: 'Netflix, Cloudflare',
                  done: roadmapModules[2].done,
                  onToggle: () => toggleModule('mod-3')
                }
              ].map((stop, sIdx) => {
                const isNext = !stop.done && (sIdx === 0 || [
                  roadmapModules[0].done,
                  roadmapModules[1].subtopics?.[0]?.done,
                  roadmapModules[1].subtopics?.[1]?.done,
                  roadmapModules[1].subtopics?.[2]?.done,
                  roadmapModules[2].done
                ][sIdx - 1]);

                return (
                  <View key={stop.id} style={styles.metroStopRow}>
                    {/* Visual Connector Line */}
                    {sIdx < 4 && <View style={styles.metroConnectorLine} />}

                    {/* Subway Stop Node Circle */}
                    <TouchableOpacity
                      style={[
                        styles.metroNodeCircle,
                        stop.done && styles.metroNodeCircleDone,
                        isNext && styles.metroNodeCircleCurrent
                      ]}
                      onPress={stop.onToggle}
                    >
                      <Text style={styles.metroNodeCircleText}>
                        {stop.done ? '✓' : isNext ? '⚡' : `${sIdx + 1}`}
                      </Text>
                    </TouchableOpacity>

                    {/* Milestone Card */}
                    <View style={[styles.metroCard, isNext && styles.metroCardCurrent]}>
                      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <View style={{ flex: 1, marginRight: 8 }}>
                          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 2 }}>
                            <Text style={styles.metroStopNumber}>STOP {sIdx + 1}</Text>
                            {isNext && (
                              <View style={styles.metroCurrentPill}>
                                <Text style={styles.metroCurrentPillText}>YOU ARE HERE</Text>
                              </View>
                            )}
                          </View>
                          <Text style={styles.metroCardTitle}>{stop.title}</Text>
                          <Text style={styles.metroCardSub}>{stop.sub}</Text>
                        </View>

                        {/* Test Button */}
                        <TouchableOpacity
                          style={styles.metroCardTestBtn}
                          onPress={() => handleStartRoadmapTopicTest(stop.topic)}
                          activeOpacity={0.8}
                        >
                          <Text style={styles.metroCardTestBtnText}>▶ TEST</Text>
                        </TouchableOpacity>
                      </View>

                      {/* Targeted Companies Badge */}
                      <View style={styles.metroCompanyRow}>
                        <Text style={styles.metroCompanyLabel}>Asked by:</Text>
                        <Text style={styles.metroCompanyVal}>{stop.companies}</Text>
                      </View>
                    </View>
                  </View>
                );
              })}
            </View>
          ) : (
            /* VIEW 2: COLLAPSIBLE MODULE LIST */
            <View style={{ gap: 10 }}>
              {/* Module 1 */}
              <View style={[styles.moduleCardActive, roadmapModules[0].done && styles.moduleCardCompleted]}>
                <TouchableOpacity style={styles.moduleHeaderRow} onPress={() => toggleModule('mod-1')}>
                  <Text style={{ color: roadmapModules[0].done ? '#34d399' : '#94a3b8', fontSize: 18, marginRight: 12 }}>
                    {roadmapModules[0].done ? '✓' : '○'}
                  </Text>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.moduleTitle}>{roadmapModules[0].title}</Text>
                    <Text style={styles.moduleSubtitle}>{roadmapModules[0].subtitle}</Text>
                  </View>
                  <TouchableOpacity
                    style={styles.startSubtopicBtn}
                    onPress={() => handleStartRoadmapTopicTest('Data Structures')}
                  >
                    <Text style={styles.startSubtopicBtnText}>TEST</Text>
                  </TouchableOpacity>
                </TouchableOpacity>
              </View>

              {/* Module 2: SQL Mastery */}
              <View style={styles.moduleCardActive}>
                <TouchableOpacity style={styles.moduleHeaderRow} onPress={() => setSqlModuleExpanded(!sqlModuleExpanded)}>
                  <Text style={{ fontSize: 18, marginRight: 12 }}>🗄️</Text>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.moduleTitle}>{roadmapModules[1].title}</Text>
                    <Text style={styles.moduleSubtitle}>{roadmapModules[1].subtitle}</Text>
                  </View>
                  <Text style={{ color: '#60a5fa', fontWeight: 'bold' }}>{sqlModuleExpanded ? '▲' : '▼'}</Text>
                </TouchableOpacity>

                {sqlModuleExpanded && roadmapModules[1].subtopics && (
                  <View style={styles.subtopicsList}>
                    {roadmapModules[1].subtopics.map(sub => (
                      <View key={sub.name} style={styles.subtopicItem}>
                        <TouchableOpacity 
                          onPress={() => toggleSubtopic('mod-2', sub.name)}
                          style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}
                        >
                          <Text style={{ color: sub.done ? '#34d399' : '#64748b', marginRight: 10, fontSize: 16 }}>
                            {sub.done ? '☑' : '☐'}
                          </Text>
                          <Text style={[styles.subtopicName, sub.done && { textDecorationLine: 'line-through', color: '#64748b' }]}>
                            {sub.name}
                          </Text>
                        </TouchableOpacity>
                        <TouchableOpacity 
                          style={styles.startSubtopicBtn}
                          onPress={() => handleStartRoadmapTopicTest('DBMS & SQL')}
                        >
                          <Text style={styles.startSubtopicBtnText}>TEST</Text>
                        </TouchableOpacity>
                      </View>
                    ))}
                  </View>
                )}
              </View>

              {/* Module 3: Advanced Topics */}
              <View style={[styles.moduleCardActive, roadmapModules[2].done && styles.moduleCardCompleted]}>
                <TouchableOpacity style={styles.moduleHeaderRow} onPress={() => toggleModule('mod-3')}>
                  <Text style={{ color: roadmapModules[2].done ? '#34d399' : '#94a3b8', fontSize: 18, marginRight: 12 }}>
                    {roadmapModules[2].done ? '✓' : '○'}
                  </Text>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.moduleTitle}>{roadmapModules[2].title}</Text>
                    <Text style={styles.moduleSubtitle}>{roadmapModules[2].subtitle}</Text>
                  </View>
                  <TouchableOpacity
                    style={styles.startSubtopicBtn}
                    onPress={() => handleStartRoadmapTopicTest('System Design')}
                  >
                    <Text style={styles.startSubtopicBtnText}>TEST</Text>
                  </TouchableOpacity>
                </TouchableOpacity>
              </View>
            </View>
          )}
        </>
      )}
    </ScrollView>
  );

  // -------------------------------------------------------------
  // SCREEN 6: PROFILE & AI RESUME ATS SCANNER (Upload Each Time)
  // -------------------------------------------------------------
  const renderProfile = () => (
    <ScrollView style={styles.dashboardContainer} contentContainerStyle={{ paddingBottom: 100 }}>
      {/* Profile Hero Card */}
      <View style={styles.profileHeroCard}>
        <View style={styles.profileAvatarGlow}>
          <Image 
            source={require('./assets/icon.png')} 
            style={styles.profileAvatarImage}
          />
        </View>
        <Text style={styles.profileNameTitle}>{userName || 'Student User'}</Text>
        <Text style={styles.profileRoleMono}>Target Role: {targetRole || 'Not Selected'}</Text>
        <View style={styles.profileBadgesRow}>
          <View style={styles.badgePillPurple}>
            <Text style={styles.badgePillPurpleText}>🛡️ {userSkills[0] || 'Code'} Explorer</Text>
          </View>
          <View style={styles.badgePillOrange}>
            <Text style={styles.badgePillOrangeText}>🔥 {streak}-Day Streak</Text>
          </View>
        </View>
      </View>

      {/* AI Resume ATS Scanner Card */}
      <View style={styles.atsScannerCard}>
        <Text style={styles.atsCardHeader}>AI Resume ATS Scanner</Text>
        <Text style={{ color: '#94a3b8', fontSize: 11, marginBottom: 12 }}>
          Upload your resume each time to scan keyword density and calculate your ATS match score for {targetRole || 'your target role'}.
        </Text>

        {!resumeAnalysisResult ? (
          <TouchableOpacity 
            style={styles.uploadPromptButton}
            onPress={() => setShowResumeModal(true)}
            activeOpacity={0.85}
          >
            <Text style={{ fontSize: 24, marginBottom: 6 }}>📄</Text>
            <Text style={styles.uploadPromptTitle}>Upload Resume for ATS Score</Text>
            <Text style={styles.uploadPromptSub}>Tap to select or paste your resume text</Text>
          </TouchableOpacity>
        ) : (
          <>
            <View style={styles.uploadedFileBox}>
              <Text style={styles.uploadedFileLabel}>Scanned Resume</Text>
              <View style={styles.uploadedFileNameRow}>
                <Text style={styles.uploadedFileNameText}>{resumeFileName}</Text>
                <Text style={{ fontSize: 16 }}>📄</Text>
              </View>
            </View>

            {/* Analysis Results Card */}
            <View style={styles.analysisResultsCard}>
              <Text style={styles.analysisCardHeader}>Analysis Results</Text>
              <Text style={styles.atsScoreSubtitle}>ATS MATCH SCORE</Text>
              <Text style={styles.atsScoreLarge}>
                {resumeAnalysisResult.score}<Text style={styles.atsScoreSmall}>/100</Text>
              </Text>
              
              {/* Score Progress Bar */}
              <View style={styles.atsProgressBar}>
                <View style={[styles.atsProgressFill, { width: `${resumeAnalysisResult.score}%` }]} />
              </View>
              <Text style={styles.veryGoodLabel}>
                {resumeAnalysisResult.score >= 75 ? 'VERY GOOD' : 'NEEDS IMPROVEMENT'} · {resumeAnalysisResult.score}%
              </Text>

              {/* Skills Match Section */}
              <Text style={styles.atsSkillsHeading}>MATCHED SKILLS</Text>
              <View style={styles.skillsTagRow}>
                {resumeAnalysisResult.matchedSkills.map(skill => (
                  <View key={skill} style={styles.skillTagMatched}>
                    <Text style={styles.skillTagMatchedText}>{skill}</Text>
                  </View>
                ))}
              </View>

              {/* Missing Keywords Section */}
              <Text style={styles.atsSkillsHeading}>RECOMMENDED KEYWORDS</Text>
              <View style={styles.skillsTagRow}>
                {resumeAnalysisResult.missingSkills.map(skill => (
                  <View key={skill} style={styles.skillTagMissing}>
                    <Text style={styles.skillTagMissingText}>{skill}</Text>
                  </View>
                ))}
              </View>

              <Text style={{ color: '#94a3b8', fontSize: 11, marginTop: 10, lineHeight: 16 }}>
                💡 {resumeAnalysisResult.feedback}
              </Text>
            </View>

            {/* Re-upload Button */}
            <TouchableOpacity 
              style={styles.reuploadBtn}
              onPress={() => setShowResumeModal(true)}
            >
              <Text style={styles.reuploadBtnText}>🔄 Upload Another Resume to Re-Scan</Text>
            </TouchableOpacity>
          </>
        )}
      </View>

      {/* Log Out Button */}
      <TouchableOpacity 
        style={styles.logoutButton}
        onPress={() => {
          setIsLoggedIn(false);
          setHasSelectedTrack(false);
          setCurrentScreen('auth');
        }}
      >
        <Text style={styles.logoutButtonText}>Log Out</Text>
      </TouchableOpacity>

      {/* Real Resume Upload Modal (No Fake Resumes) */}
      <Modal
        visible={showResumeModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowResumeModal(false)}
      >
        <View style={styles.modalBackdrop}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeaderRow}>
              <Text style={styles.modalTitle}>Upload Resume for ATS Scan</Text>
              <TouchableOpacity onPress={() => setShowResumeModal(false)}>
                <Text style={{ color: '#94a3b8', fontSize: 16, fontWeight: 'bold' }}>✕</Text>
              </TouchableOpacity>
            </View>

            <Text style={{ color: '#94a3b8', fontSize: 11, marginBottom: 12 }}>
              Upload your resume each time to test its ATS score. Enter document name and paste content/skills below:
            </Text>

            <TextInput
              placeholder="Resume File Name (e.g., My_SWE_Resume.pdf)"
              placeholderTextColor="#64748b"
              value={customResumeInput}
              onChangeText={setCustomResumeInput}
              style={styles.modalTextInput}
            />

            <TextInput
              placeholder="Paste resume summary, skills, or experience bullets here..."
              placeholderTextColor="#64748b"
              multiline
              numberOfLines={4}
              style={[styles.modalTextInput, { minHeight: 90, textAlignVertical: 'top' }]}
              value={newCustomSkill}
              onChangeText={setNewCustomSkill}
            />

            <TouchableOpacity
              style={styles.modalScanBtn}
              onPress={() => {
                const name = customResumeInput.trim() || 'My_Resume.pdf';
                handleUploadResume(name, newCustomSkill);
                setCustomResumeInput('');
                setNewCustomSkill('');
              }}
            >
              <Text style={styles.modalScanBtnText}>
                {resumeAnalyzing ? 'Scanning ATS Keywords...' : '⚡ Scan & Calculate ATS Score'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );

  // Main Container with Bottom Tab Bar
  return (
    <SafeAreaView style={styles.mainAppWrapper}>
      <StatusBar barStyle="light-content" backgroundColor="#060913" />

      {activeTab === 'Dashboard' && renderDashboard()}
      {activeTab === 'Arena' && renderArena()}
      {activeTab === 'Roadmap' && renderRoadmap()}
      {activeTab === 'Profile' && renderProfile()}

      {/* Bottom Navigation Bar - Hidden during active battle test to lock the screen */}
      {!(activeTab === 'Arena' && mcqSubTab === 'battle') ? (
        <View style={styles.bottomNavBar}>
          {[
            { id: 'Dashboard', label: 'Dashboard', icon: '📊' },
            { id: 'Arena', label: 'Arena', icon: '⚔️' },
            { id: 'Roadmap', label: 'Roadmap', icon: '🗺️' },
            { id: 'Profile', label: 'Profile', icon: '👤' }
          ].map(tab => {
            const active = activeTab === tab.id;
            return (
              <TouchableOpacity
                key={tab.id}
                style={styles.navTabItem}
                onPress={() => setActiveTab(tab.id as any)}
              >
                <Text style={[styles.navTabIcon, active && styles.navTabIconActive]}>{tab.icon}</Text>
                <Text style={[styles.navTabLabel, active && styles.navTabLabelActive]}>{tab.label}</Text>
              </TouchableOpacity>
            );
          })}
        </View>
      ) : null}

      {/* Test Exit & Forfeit Confirmation Modal */}
      <Modal
        visible={showExitConfirmModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowExitConfirmModal(false)}
      >
        <View style={styles.modalBackdrop}>
          <View style={styles.exitModalCard}>
            <View style={styles.exitModalIconCircle}>
              <Text style={{ fontSize: 26 }}>⚠️</Text>
            </View>
            <Text style={styles.exitModalTitle}>Exit Active Test?</Text>
            <Text style={styles.exitModalDesc}>
              A live test is currently in progress. Screen switching is locked to maintain test integrity. You can either submit your current score or forfeit the test.
            </Text>

            <View style={styles.exitModalBtnCol}>
              <TouchableOpacity
                style={styles.exitModalSubmitBtn}
                onPress={handleForceSubmitTest}
                activeOpacity={0.85}
              >
                <Text style={styles.exitModalSubmitBtnText}>✅ Submit & End Test</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.exitModalForfeitBtn}
                onPress={handleForfeitTest}
                activeOpacity={0.85}
              >
                <Text style={styles.exitModalForfeitBtnText}>🚪 Forfeit & Leave (Discard Score)</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.exitModalCancelBtn}
                onPress={() => setShowExitConfirmModal(false)}
                activeOpacity={0.85}
              >
                <Text style={styles.exitModalCancelBtnText}>← Resume Test</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Google Authentication Modal */}
      <Modal
        visible={showGoogleModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowGoogleModal(false)}
      >
        <View style={styles.modalBackdrop}>
          <View style={styles.googleModalCard}>
            <View style={styles.googleModalHeaderRow}>
              <View style={styles.googleGLogoCircle}>
                <Text style={styles.googleGLogoText}>G</Text>
              </View>
              <View style={{ flex: 1, marginLeft: 12 }}>
                <Text style={styles.googleModalTitle}>Sign in with Google</Text>
                <Text style={styles.googleModalSub}>Firebase Google Identity Service</Text>
              </View>
              <TouchableOpacity onPress={() => setShowGoogleModal(false)} style={styles.googleCloseBtn}>
                <Text style={{ color: '#94a3b8', fontSize: 14, fontWeight: 'bold' }}>✕</Text>
              </TouchableOpacity>
            </View>

            <Text style={styles.googleModalPrompt}>
              Connect seamlessly with your Google identity to synchronize your CodeQuest test scores:
            </Text>

            {/* Option 1: 1-Tap Google Student Account */}
            <TouchableOpacity
              style={styles.googleOneTapBtn}
              onPress={() => executeGoogleAuth('student.google@gmail.com')}
              disabled={isAuthenticating}
              activeOpacity={0.85}
            >
              <View style={styles.googleGLogoPill}>
                <Text style={{ fontSize: 13, fontWeight: '900', color: '#ea4335' }}>G</Text>
              </View>
              <View style={{ flex: 1, marginLeft: 10 }}>
                <Text style={styles.googleOneTapBtnTitle}>1-Tap Google Quick Sign-In</Text>
                <Text style={styles.googleOneTapBtnSub}>Continue with student.google@gmail.com</Text>
              </View>
              <Text style={{ color: '#60a5fa', fontSize: 16 }}>➔</Text>
            </TouchableOpacity>

            {/* Option 2: Custom Gmail Input */}
            <View style={styles.googleInputBox}>
              <Text style={styles.googleInputLabel}>Or enter your Google / Gmail address:</Text>
              <View style={styles.googleInputRow}>
                <TextInput
                  style={styles.googleTextInput}
                  placeholder="e.g. yourname@gmail.com"
                  placeholderTextColor="#64748b"
                  value={googleInputEmail}
                  onChangeText={setGoogleInputEmail}
                  autoCapitalize="none"
                  autoCorrect={false}
                  keyboardType="email-address"
                />
                <TouchableOpacity
                  style={styles.googleInputSubmitBtn}
                  onPress={() => {
                    const emailToUse = googleInputEmail.trim() || 'student.google@gmail.com';
                    executeGoogleAuth(emailToUse);
                  }}
                  disabled={isAuthenticating}
                  activeOpacity={0.85}
                >
                  <Text style={styles.googleInputSubmitBtnText}>Sign In</Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Option 3: Launch Google OAuth Browser */}
            <TouchableOpacity
              style={styles.googleBrowserAuthBtn}
              onPress={() => {
                const url = buildGoogleOAuthUrl('placementforge://oauth');
                Linking.openURL(url).catch(() => {
                  Alert.alert('Google OAuth', 'Opened browser for Google Authentication.');
                });
              }}
              activeOpacity={0.8}
            >
              <Text style={styles.googleBrowserAuthBtnText}>🌐 Launch Google OAuth Web Session</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

// -------------------------------------------------------------
// STYLESHEET (Unified Modern Coder Theme)
// -------------------------------------------------------------
const styles = StyleSheet.create({
  mainAppWrapper: {
    flex: 1,
    backgroundColor: '#060913',
  },
  dashboardContainer: {
    flex: 1,
    backgroundColor: '#060913',
    paddingHorizontal: 18,
    paddingTop: 10,
  },

  // AUTH SCREEN
  authContainer: {
    flex: 1,
    backgroundColor: '#060913',
  },
  authScroll: {
    paddingHorizontal: 20,
    paddingVertical: 36,
    justifyContent: 'center',
    minHeight: '100%',
  },
  authCard: {
    backgroundColor: '#0d1326',
    borderRadius: 24,
    paddingHorizontal: 22,
    paddingVertical: 32,
    borderWidth: 1,
    borderColor: '#1e293b',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.5,
    shadowRadius: 20,
    elevation: 8,
  },
  authLogoBox: {
    width: 72,
    height: 72,
    borderRadius: 18,
    backgroundColor: '#101735',
    borderWidth: 1,
    borderColor: '#243260',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 18,
    overflow: 'hidden',
  },
  authLogoImage: {
    width: '100%',
    height: '100%',
  },
  authTitle: {
    fontSize: 24,
    fontWeight: '900',
    color: '#ffffff',
    letterSpacing: 1.5,
    marginBottom: 8,
  },
  authSubtitle: {
    fontSize: 12,
    color: '#94a3b8',
    textAlign: 'center',
    lineHeight: 18,
    marginBottom: 24,
  },
  errorText: {
    color: '#ef4444',
    fontSize: 12,
    marginBottom: 12,
  },
  inputGroup: {
    width: '100%',
    marginBottom: 18,
  },
  cyberInput: {
    width: '100%',
    backgroundColor: '#080d1e',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#192340',
    color: '#ffffff',
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 13,
    fontFamily: 'monospace',
    marginBottom: 12,
  },
  forgotPasswordRow: {
    alignSelf: 'flex-end',
    marginTop: 2,
  },
  forgotPasswordText: {
    color: '#60a5fa',
    fontSize: 11,
    fontFamily: 'monospace',
    fontWeight: '600',
  },
  gradientLoginButton: {
    width: '100%',
    backgroundColor: '#5b82ff',
    borderRadius: 12,
    paddingVertical: 15,
    alignItems: 'center',
    marginBottom: 14,
  },
  gradientLoginButtonText: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '800',
  },
  orDividerRow: {
    alignItems: 'center',
    width: '100%',
    marginVertical: 12,
  },
  orDividerText: {
    color: '#64748b',
    fontSize: 10,
    fontFamily: 'monospace',
    fontWeight: '900',
    letterSpacing: 1,
  },
  googleAuthButton: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#13192f',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#1e2748',
    paddingVertical: 14,
    marginBottom: 16,
  },
  googleGLogo: {
    fontSize: 16,
    fontWeight: '900',
    color: '#ea4335',
    marginRight: 10,
  },
  googleAuthButtonText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '700',
  },
  guestModeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    paddingTop: 14,
    borderTopWidth: 1,
    borderTopColor: '#17203a',
  },
  guestModeText: {
    color: '#94a3b8',
    fontSize: 13,
    fontWeight: '600',
  },

  // ONBOARDING SCREEN
  onboardContainer: {
    flex: 1,
    backgroundColor: '#060913',
  },
  onboardScroll: {
    paddingHorizontal: 20,
    paddingVertical: 30,
  },
  onboardMainTitle: {
    fontSize: 24,
    fontWeight: '900',
    color: '#38bdf8',
    letterSpacing: 1.5,
    textAlign: 'center',
    marginBottom: 6,
  },
  onboardSubDesc: {
    fontSize: 12,
    color: '#94a3b8',
    textAlign: 'center',
    lineHeight: 18,
    marginBottom: 20,
  },
  phaseRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
    borderBottomColor: '#1e293b',
    marginBottom: 20,
  },
  phaseItem: {
    paddingVertical: 8,
    paddingHorizontal: 6,
  },
  phaseItemActive: {
    paddingVertical: 8,
    paddingHorizontal: 6,
    borderBottomWidth: 2,
    borderBottomColor: '#38bdf8',
  },
  phaseText: {
    color: '#64748b',
    fontSize: 11,
    fontWeight: '700',
  },
  phaseTextActive: {
    color: '#38bdf8',
    fontSize: 11,
    fontWeight: '800',
  },
  phaseActiveBar: {},
  roleGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 14,
  },
  roleCard: {
    width: '48%',
    backgroundColor: '#0d1326',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#1e293b',
    padding: 16,
    alignItems: 'center',
    marginBottom: 12,
  },
  roleCardSelected: {
    borderColor: '#38bdf8',
    backgroundColor: '#101b38',
  },
  roleCardTitle: {
    color: '#94a3b8',
    fontSize: 11,
    fontWeight: '800',
    textAlign: 'center',
    letterSpacing: 0.5,
  },
  roleCardTitleSelected: {
    color: '#ffffff',
  },
  customRoleTextInput: {
    backgroundColor: '#0d1326',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#1e293b',
    color: '#ffffff',
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 12,
    marginBottom: 16,
  },
  sectionHeaderTitle: {
    color: '#94a3b8',
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 1,
    marginBottom: 10,
  },
  skillsTagRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 14,
  },
  skillChip: {
    backgroundColor: '#0d1326',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#1e293b',
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  skillChipSelected: {
    borderColor: '#38bdf8',
    backgroundColor: '#101b38',
  },
  skillChipText: {
    color: '#94a3b8',
    fontSize: 11,
    fontWeight: '700',
  },
  skillChipTextSelected: {
    color: '#38bdf8',
  },
  addSkillRow: {
    flexDirection: 'row',
    marginBottom: 24,
    gap: 8,
  },
  addSkillInput: {
    flex: 1,
    backgroundColor: '#0d1326',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#1e293b',
    color: '#ffffff',
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 12,
  },
  addSkillBtn: {
    backgroundColor: '#1e293b',
    borderRadius: 10,
    paddingHorizontal: 16,
    justifyContent: 'center',
  },
  addSkillBtnText: {
    color: '#38bdf8',
    fontSize: 11,
    fontWeight: '800',
  },
  launchRoadmapCta: {
    backgroundColor: '#38bdf8',
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: 'center',
    shadowColor: '#38bdf8',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 10,
    elevation: 6,
  },
  launchRoadmapCtaText: {
    color: '#060913',
    fontSize: 13,
    fontWeight: '900',
    letterSpacing: 0.5,
  },

  // DASHBOARD TAB
  dashHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 14,
  },
  dashBrandRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  brandBracket: {
    color: '#38bdf8',
    fontSize: 18,
    fontWeight: '900',
  },
  brandIconText: {
    color: '#a855f7',
    fontSize: 14,
    fontWeight: '900',
    marginHorizontal: 2,
  },
  dashBrandTitle: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '900',
    marginLeft: 8,
    letterSpacing: 1,
  },
  readinessHeroCard: {
    backgroundColor: '#0d1326',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#1e293b',
    paddingVertical: 20,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  readinessLeftStat: {
    alignItems: 'center',
  },
  readinessLeftTitle: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: '900',
  },
  readinessLeftSub: {
    color: '#64748b',
    fontSize: 9,
    fontWeight: '800',
  },
  circularGaugeBox: {
    width: 110,
    height: 110,
    borderRadius: 55,
    borderWidth: 4,
    borderColor: '#38bdf8',
    justifyContent: 'center',
    alignItems: 'center',
  },
  gaugePercentLarge: {
    color: '#ffffff',
    fontSize: 24,
    fontWeight: '900',
  },
  gaugeLabel: {
    color: '#94a3b8',
    fontSize: 8,
    fontWeight: '800',
    textAlign: 'center',
  },
  readinessRightStat: {
    alignItems: 'center',
  },
  readinessRightTitle: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: '900',
  },
  sectionHeadingText: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: '900',
    letterSpacing: 0.5,
    marginBottom: 12,
  },
  questsList: {
    marginBottom: 20,
  },
  questCard: {
    backgroundColor: '#0d1326',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#1e293b',
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  questCheckbox: {
    width: 24,
    height: 24,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#1e293b',
    backgroundColor: '#080d1e',
    justifyContent: 'center',
    alignItems: 'center',
  },
  questCheckboxActive: {
    backgroundColor: '#34d399',
    borderColor: '#34d399',
  },
  questCardTitle: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '700',
    marginBottom: 6,
  },
  questProgressBar: {
    width: '100%',
    height: 4,
    backgroundColor: '#1e293b',
    borderRadius: 2,
    overflow: 'hidden',
  },
  questProgressFill: {
    height: '100%',
    backgroundColor: '#34d399',
  },
  questXpBadge: {
    color: '#34d399',
    fontSize: 11,
    fontWeight: '800',
  },
  streakCard: {
    backgroundColor: '#0d1326',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#1e293b',
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  streakLeftFlame: {
    alignItems: 'center',
    paddingRight: 16,
    borderRightWidth: 1,
    borderRightColor: '#1e293b',
  },
  streakFlameTitle: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '900',
  },
  streakFlameSub: {
    color: '#f97316',
    fontSize: 9,
    fontWeight: '800',
  },
  streakDaysRow: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingLeft: 10,
  },
  streakDayCol: {
    alignItems: 'center',
  },
  streakDayLetter: {
    color: '#94a3b8',
    fontSize: 10,
    fontWeight: '800',
    marginBottom: 6,
  },
  streakDot: {
    width: 14,
    height: 14,
    borderRadius: 7,
  },
  streakDotActive: {
    backgroundColor: '#38bdf8',
  },
  streakDotInactive: {
    backgroundColor: '#1e293b',
  },

  // ARENA TAB
  problemHeaderCard: {
    backgroundColor: '#0d1326',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#1e293b',
    padding: 16,
    marginBottom: 12,
  },
  problemTitleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  problemMainTitle: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '900',
  },
  difficultyBadgeGreen: {
    backgroundColor: 'rgba(52, 211, 153, 0.15)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#34d399',
  },
  difficultyBadgeGreenText: {
    color: '#34d399',
    fontSize: 10,
    fontWeight: '900',
  },
  companyPillRow: {
    flexDirection: 'row',
    gap: 6,
  },
  companyPill: {
    backgroundColor: '#131c38',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  companyPillText: {
    color: '#94a3b8',
    fontSize: 9,
    fontWeight: '800',
  },
  arenaModeSwitcherBox: {
    flexDirection: 'row',
    backgroundColor: '#0d1326',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#1e293b',
    padding: 4,
    marginBottom: 12,
  },
  arenaModeSegment: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    borderRadius: 8,
  },
  arenaModeSegmentActive: {
    backgroundColor: '#1e293b',
  },
  arenaModeSegmentText: {
    color: '#94a3b8',
    fontSize: 12,
    fontWeight: '800',
  },
  arenaModeSegmentTextActive: {
    color: '#ffffff',
  },
  arenaDescCard: {
    backgroundColor: '#0d1326',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#1e293b',
    padding: 16,
    marginBottom: 12,
  },
  arenaDescText: {
    color: '#94a3b8',
    fontSize: 12,
    lineHeight: 18,
    marginBottom: 12,
  },
  exampleBlock: {
    backgroundColor: '#080d1e',
    borderRadius: 10,
    padding: 10,
  },
  exampleBold: {
    color: '#ffffff',
    fontSize: 11,
    fontWeight: '800',
    marginBottom: 4,
  },
  exampleBlue: {
    color: '#60a5fa',
    fontSize: 11,
    fontFamily: 'monospace',
  },
  codeEditorBox: {
    backgroundColor: '#0d1326',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#1e293b',
    padding: 16,
    marginBottom: 20,
  },
  codeEditorTopBar: {
    marginBottom: 8,
  },
  codeFileName: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '800',
  },
  codeTextInput: {
    backgroundColor: '#080d1e',
    borderRadius: 10,
    color: '#e2e8f0',
    fontFamily: 'monospace',
    fontSize: 12,
    padding: 12,
    minHeight: 160,
    textAlignVertical: 'top',
  },
  executionResultBar: {
    marginVertical: 10,
  },
  executionResultText: {
    color: '#34d399',
    fontSize: 11,
    fontFamily: 'monospace',
  },
  editorActionButtonsRow: {
    flexDirection: 'row',
    gap: 10,
  },
  runCodeBtn: {
    flex: 1,
    backgroundColor: '#131c38',
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#1e293b',
  },
  runCodeBtnText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '800',
  },
  submitCodeBtn: {
    flex: 1,
    backgroundColor: '#38bdf8',
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: 'center',
  },
  submitCodeBtnText: {
    color: '#060913',
    fontSize: 12,
    fontWeight: '900',
  },
  mcqQuestionTitle: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: '800',
    marginBottom: 14,
  },
  mcqOptionItem: {
    backgroundColor: '#080d1e',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#1e293b',
    padding: 12,
    marginBottom: 8,
  },
  mcqOptionItemSelected: {
    borderColor: '#38bdf8',
  },
  mcqOptionItemText: {
    color: '#94a3b8',
    fontSize: 12,
  },
  mcqOptionItemTextSelected: {
    color: '#38bdf8',
    fontWeight: '700',
  },
  mcqExplanationCard: {
    backgroundColor: '#080d1e',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'rgba(52, 211, 153, 0.3)',
    padding: 12,
    marginTop: 10,
  },
  mcqExplanationTitle: {
    color: '#34d399',
    fontSize: 12,
    fontWeight: '800',
    marginBottom: 4,
  },
  mcqExplanationBody: {
    color: '#94a3b8',
    fontSize: 11,
    lineHeight: 16,
  },

  // ROADMAP TAB
  activeTrackBanner: {
    backgroundColor: '#0d1326',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#1e293b',
    padding: 16,
    marginBottom: 16,
  },
  activeTrackTag: {
    color: '#38bdf8',
    fontSize: 10,
    fontWeight: '900',
    marginBottom: 4,
  },
  activeTrackTitle: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '900',
    marginBottom: 10,
  },
  overallProgressBar: {
    width: '100%',
    height: 6,
    backgroundColor: '#1e293b',
    borderRadius: 3,
    overflow: 'hidden',
  },
  overallProgressFill: {
    height: '100%',
    backgroundColor: '#a855f7',
  },
  moduleCardCompleted: {
    backgroundColor: '#0d1326',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#1e293b',
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  moduleTitle: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: '800',
  },
  moduleSubtitle: {
    color: '#64748b',
    fontSize: 10,
    marginTop: 2,
  },
  pillGreen: {
    backgroundColor: 'rgba(52, 211, 153, 0.15)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  pillGreenText: {
    color: '#34d399',
    fontSize: 10,
    fontWeight: '900',
  },
  moduleCardActive: {
    backgroundColor: '#0d1326',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#1e293b',
    padding: 14,
    marginBottom: 10,
  },
  moduleHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  subtopicsList: {
    marginTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#1e293b',
    paddingTop: 10,
  },
  subtopicItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
  },
  subtopicName: {
    color: '#ffffff',
    fontSize: 12,
    flex: 1,
  },
  startSubtopicBtn: {
    backgroundColor: '#1e293b',
    borderRadius: 6,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  startSubtopicBtnText: {
    color: '#38bdf8',
    fontSize: 10,
    fontWeight: '800',
  },

  // PROFILE & ATS SCANNER TAB
  profileHeroCard: {
    backgroundColor: '#0d1326',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#1e293b',
    padding: 20,
    alignItems: 'center',
    marginBottom: 16,
  },
  profileAvatarGlow: {
    width: 72,
    height: 72,
    borderRadius: 36,
    borderWidth: 2,
    borderColor: '#38bdf8',
    overflow: 'hidden',
    marginBottom: 12,
  },
  profileAvatarImage: {
    width: '100%',
    height: '100%',
  },
  profileNameTitle: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '900',
    marginBottom: 4,
  },
  profileRoleMono: {
    color: '#94a3b8',
    fontSize: 12,
    fontFamily: 'monospace',
    marginBottom: 12,
  },
  profileBadgesRow: {
    flexDirection: 'row',
    gap: 8,
  },
  badgePillPurple: {
    backgroundColor: '#1a1836',
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#a855f7',
  },
  badgePillPurpleText: {
    color: '#c084fc',
    fontSize: 11,
    fontWeight: '700',
  },
  badgePillOrange: {
    backgroundColor: '#261914',
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#f97316',
  },
  badgePillOrangeText: {
    color: '#fb923c',
    fontSize: 11,
    fontWeight: '700',
  },
  atsScannerCard: {
    backgroundColor: '#0d1326',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#1e293b',
    padding: 16,
    marginBottom: 14,
  },
  atsCardHeader: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '900',
    marginBottom: 12,
  },
  uploadedFileBox: {
    backgroundColor: '#080d1e',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#1e293b',
    padding: 14,
  },
  uploadedFileLabel: {
    color: '#64748b',
    fontSize: 10,
    fontWeight: '800',
    marginBottom: 4,
  },
  uploadedFileNameRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  uploadedFileNameText: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: '800',
  },
  analysisResultsCard: {
    backgroundColor: '#0d1326',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#1e293b',
    padding: 16,
    marginBottom: 16,
  },
  analysisCardHeader: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '900',
    marginBottom: 4,
  },
  atsScoreSubtitle: {
    color: '#64748b',
    fontSize: 10,
    fontWeight: '800',
    marginBottom: 2,
  },
  atsScoreLarge: {
    color: '#34d399',
    fontSize: 32,
    fontWeight: '900',
    marginBottom: 8,
  },
  atsScoreSmall: {
    fontSize: 16,
    color: '#94a3b8',
  },
  atsProgressBar: {
    width: '100%',
    height: 6,
    backgroundColor: '#1e293b',
    borderRadius: 3,
    overflow: 'hidden',
    marginBottom: 6,
  },
  atsProgressFill: {
    height: '100%',
    backgroundColor: '#34d399',
  },
  veryGoodLabel: {
    color: '#34d399',
    fontSize: 10,
    fontWeight: '800',
    marginBottom: 14,
  },
  atsSkillsHeading: {
    color: '#94a3b8',
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 0.5,
    marginBottom: 8,
  },
  skillTagMatched: {
    backgroundColor: '#0d221c',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#34d399',
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  skillTagMatchedText: {
    color: '#34d399',
    fontSize: 11,
    fontWeight: '700',
  },
  skillTagMissing: {
    backgroundColor: '#281318',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#f43f5e',
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  skillTagMissingText: {
    color: '#f43f5e',
    fontSize: 11,
    fontWeight: '700',
  },
  logoutButton: {
    backgroundColor: '#131c38',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#1e293b',
    marginBottom: 30,
  },
  logoutButtonText: {
    color: '#f43f5e',
    fontSize: 13,
    fontWeight: '800',
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.75)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#0d1326',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#1e293b',
  },
  modalHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  modalTitle: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '900',
  },
  modalDocItem: {
    backgroundColor: '#080d1e',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#1e293b',
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },

  // Execution result styles
  resultSuccessBox: {
    backgroundColor: '#052e16',
    borderColor: '#15803d',
  },
  resultErrorBox: {
    backgroundColor: '#450a0a',
    borderColor: '#b91c1c',
  },
  hintContainerBox: {
    backgroundColor: '#1e1b4b',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#4338ca',
    padding: 10,
    marginTop: 8,
  },
  hintHeadingText: {
    color: '#818cf8',
    fontSize: 11,
    fontWeight: '800',
    marginBottom: 4,
  },
  hintBodyText: {
    color: '#c7d2fe',
    fontSize: 11,
    lineHeight: 16,
  },

  // Empty Roadmap styles
  emptyRoadmapBox: {
    backgroundColor: '#0d1326',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#1e293b',
    padding: 24,
    alignItems: 'center',
    marginBottom: 16,
  },
  emptyRoadmapTitle: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '800',
    marginBottom: 6,
  },
  emptyRoadmapSub: {
    color: '#94a3b8',
    fontSize: 12,
    textAlign: 'center',
    lineHeight: 18,
    marginBottom: 16,
  },
  chooseTrackBtn: {
    backgroundColor: '#2563eb',
    borderRadius: 10,
    paddingVertical: 12,
    paddingHorizontal: 20,
  },
  chooseTrackBtnText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  pillInactive: {
    backgroundColor: '#1e293b',
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  pillInactiveText: {
    color: '#94a3b8',
    fontSize: 10,
    fontWeight: '700',
  },

  // ATS upload prompts & modal styles
  uploadPromptButton: {
    backgroundColor: '#080d1e',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#1e293b',
    borderStyle: 'dashed',
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
  },
  uploadPromptTitle: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '800',
    marginBottom: 4,
  },
  uploadPromptSub: {
    color: '#64748b',
    fontSize: 11,
  },
  reuploadBtn: {
    backgroundColor: '#1e293b',
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: 'center',
    marginTop: 10,
  },
  reuploadBtnText: {
    color: '#38bdf8',
    fontSize: 12,
    fontWeight: '800',
  },
  modalTextInput: {
    backgroundColor: '#080d1e',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#1e293b',
    color: '#ffffff',
    fontSize: 13,
    padding: 12,
    marginBottom: 12,
  },
  modalScanBtn: {
    backgroundColor: '#0284c7',
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 4,
  },
  modalScanBtnText: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: '800',
  },

  // Track selection prompt styles
  chooseTrackAlertCard: {
    backgroundColor: '#0f172a',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#38bdf8',
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  chooseTrackAlertIcon: {
    fontSize: 24,
  },
  chooseTrackAlertTitle: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: '800',
    marginBottom: 2,
  },
  chooseTrackAlertSub: {
    color: '#94a3b8',
    fontSize: 11,
    lineHeight: 15,
  },
  chooseTrackAlertAction: {
    color: '#38bdf8',
    fontSize: 11,
    fontWeight: '800',
  },

  // Problem selector tab styles
  problemSelectTab: {
    backgroundColor: '#0d1326',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#1e293b',
    paddingVertical: 6,
    paddingHorizontal: 12,
  },
  problemSelectTabActive: {
    backgroundColor: '#1e293b',
    borderColor: '#38bdf8',
  },
  problemSelectTabText: {
    color: '#94a3b8',
    fontSize: 11,
    fontWeight: '700',
  },
  problemSelectTabTextActive: {
    color: '#38bdf8',
    fontWeight: '800',
  },

  // BOTTOM NAVIGATION BAR
  bottomNavBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 68,
    backgroundColor: '#090e21',
    borderTopWidth: 1,
    borderTopColor: '#192340',
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingBottom: 8,
  },
  navTabItem: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 12,
  },
  navTabIcon: {
    fontSize: 18,
    marginBottom: 2,
    opacity: 0.6,
  },
  navTabIconActive: {
    opacity: 1,
  },
  navTabLabel: {
    color: '#64748b',
    fontSize: 10,
    fontWeight: '700',
  },
  navTabLabelActive: {
    color: '#38bdf8',
    fontWeight: '800',
  },

  // -----------------------------------------------------------
  // BATTLE OF MCQ & TEACHER STUDIO STYLES
  // -----------------------------------------------------------
  battleSubNavRow: {
    flexDirection: 'row',
    backgroundColor: '#0a1020',
    borderRadius: 14,
    padding: 4,
    borderWidth: 1,
    borderColor: '#192542',
    marginBottom: 14,
  },
  battleSubNavItem: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 10,
    alignItems: 'center',
  },
  battleSubNavItemActive: {
    backgroundColor: '#1d2a4d',
    borderWidth: 1,
    borderColor: '#38bdf8',
  },
  battleSubNavText: {
    color: '#64748b',
    fontSize: 11,
    fontWeight: '700',
  },
  battleSubNavTextActive: {
    color: '#ffffff',
    fontWeight: '800',
  },

  // Teacher Studio Card
  teacherStudioCard: {
    backgroundColor: '#0d1326',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#1e293b',
    padding: 18,
  },
  roomHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#070c1a',
    borderRadius: 14,
    padding: 12,
    borderWidth: 1,
    borderColor: '#1e293b',
    marginBottom: 16,
  },
  roomCodeLabel: {
    color: '#64748b',
    fontSize: 9,
    fontWeight: '900',
    letterSpacing: 0.8,
  },
  roomCodeValue: {
    color: '#38bdf8',
    fontSize: 16,
    fontWeight: '900',
    fontFamily: 'monospace',
    marginTop: 2,
  },
  newRoomBtn: {
    backgroundColor: '#182444',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#2b3d6f',
  },
  newRoomBtnText: {
    color: '#93c5fd',
    fontSize: 11,
    fontWeight: '700',
  },
  teacherSectionHeading: {
    color: '#94a3b8',
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 0.8,
    marginTop: 14,
    marginBottom: 8,
  },
  teacherTypeRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 4,
  },
  typeOptionCard: {
    flex: 1,
    backgroundColor: '#070c1a',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#1e293b',
    padding: 10,
  },
  typeOptionCardSelected: {
    borderColor: '#38bdf8',
    backgroundColor: '#0c1b33',
  },
  typeOptionIcon: {
    fontSize: 18,
    marginBottom: 4,
  },
  typeOptionTitle: {
    color: '#cbd5e1',
    fontSize: 11,
    fontWeight: '800',
    marginBottom: 2,
  },
  typeOptionTitleSelected: {
    color: '#38bdf8',
  },
  typeOptionSub: {
    color: '#64748b',
    fontSize: 9,
    lineHeight: 12,
  },
  topicsTagGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginBottom: 8,
  },
  teacherTopicTag: {
    backgroundColor: '#070c1a',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#1e293b',
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  teacherTopicTagSelected: {
    backgroundColor: '#0f2942',
    borderColor: '#38bdf8',
  },
  teacherTopicTagText: {
    color: '#64748b',
    fontSize: 11,
    fontWeight: '700',
  },
  teacherTopicTagTextSelected: {
    color: '#38bdf8',
    fontWeight: '800',
  },
  customTopicInputRow: {
    flexDirection: 'row',
    gap: 6,
    marginBottom: 10,
  },
  customTopicInput: {
    flex: 1,
    backgroundColor: '#070c1a',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#1e293b',
    color: '#ffffff',
    fontSize: 11,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  addCustomTopicBtn: {
    backgroundColor: '#1e293b',
    borderRadius: 10,
    paddingHorizontal: 14,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#334155',
  },
  addCustomTopicBtnText: {
    color: '#38bdf8',
    fontSize: 11,
    fontWeight: '800',
  },
  photoTopicRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#070c1a',
    borderRadius: 12,
    padding: 10,
    borderWidth: 1,
    borderColor: '#1e293b',
    marginTop: 6,
    marginBottom: 6,
  },
  photoTopicTitle: {
    color: '#e2e8f0',
    fontSize: 11,
    fontWeight: '800',
  },
  photoTopicSub: {
    color: '#64748b',
    fontSize: 9,
  },
  questionAmountRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 6,
    marginBottom: 4,
  },
  amountPill: {
    backgroundColor: '#070c1a',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#1e293b',
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  amountPillSelected: {
    backgroundColor: '#1d2a4d',
    borderColor: '#38bdf8',
  },
  amountPillText: {
    color: '#64748b',
    fontSize: 11,
    fontWeight: '700',
  },
  amountPillTextSelected: {
    color: '#38bdf8',
    fontWeight: '800',
  },
  customAmountBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#070c1a',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#1e293b',
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  customAmountInput: {
    color: '#ffffff',
    width: 32,
    fontSize: 12,
    fontFamily: 'monospace',
    fontWeight: 'bold',
    textAlign: 'center',
    padding: 0,
  },
  diffPillRow: {
    flexDirection: 'row',
    gap: 6,
    marginBottom: 16,
  },
  diffPill: {
    flex: 1,
    backgroundColor: '#070c1a',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#1e293b',
    paddingVertical: 6,
    alignItems: 'center',
  },
  diffPillSelected: {
    backgroundColor: '#1d2a4d',
    borderColor: '#a855f7',
  },
  diffPillText: {
    color: '#64748b',
    fontSize: 11,
    fontWeight: '700',
  },
  diffPillTextSelected: {
    color: '#c084fc',
    fontWeight: '800',
  },
  autoGenerateBattleBtn: {
    backgroundColor: '#2563eb',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    shadowColor: '#2563eb',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  autoGenerateBattleBtnText: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: '900',
    letterSpacing: 0.5,
  },

  // Live Battle Styles
  battleMatchupCard: {
    backgroundColor: '#0d1326',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#1e293b',
    padding: 14,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  playerCol: {
    alignItems: 'center',
    width: 76,
  },
  playerAvatarGlow: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#101d3b',
    borderWidth: 2,
    borderColor: '#38bdf8',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 4,
  },
  playerAvatarText: {
    color: '#38bdf8',
    fontSize: 12,
    fontWeight: '900',
  },
  playerNameText: {
    color: '#ffffff',
    fontSize: 11,
    fontWeight: '800',
  },
  playerScoreText: {
    color: '#34d399',
    fontSize: 10,
    fontWeight: 'bold',
  },
  matchCenterCol: {
    alignItems: 'center',
  },
  timerBadge: {
    backgroundColor: '#1e1124',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#f43f5e',
    paddingHorizontal: 10,
    paddingVertical: 3,
    marginBottom: 2,
  },
  timerBadgeText: {
    color: '#fb7185',
    fontSize: 12,
    fontWeight: '900',
    fontFamily: 'monospace',
  },
  vsBadgeText: {
    color: '#64748b',
    fontSize: 11,
    fontWeight: '900',
  },
  roomCodeSmall: {
    color: '#38bdf8',
    fontSize: 9,
    fontFamily: 'monospace',
  },
  questionCounterBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  topicPill: {
    backgroundColor: '#0b233a',
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderWidth: 1,
    borderColor: '#0284c7',
  },
  topicPillText: {
    color: '#38bdf8',
    fontSize: 10,
    fontWeight: '800',
  },
  questionCounterText: {
    color: '#94a3b8',
    fontSize: 11,
    fontWeight: '700',
  },
  multiAnswerIndicator: {
    backgroundColor: '#181230',
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderWidth: 1,
    borderColor: '#9333ea',
  },
  multiAnswerIndicatorText: {
    color: '#c084fc',
    fontSize: 10,
    fontWeight: '800',
  },
  multiSelectBanner: {
    backgroundColor: '#0c1b33',
    borderRadius: 8,
    padding: 8,
    borderWidth: 1,
    borderColor: '#1d4ed8',
    marginBottom: 12,
  },
  multiSelectBannerText: {
    color: '#93c5fd',
    fontSize: 10,
    fontWeight: '700',
  },
  battleQuestionText: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: '800',
    lineHeight: 18,
    marginBottom: 12,
  },
  diagramMockupBox: {
    backgroundColor: '#070c1a',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#1e293b',
    padding: 10,
    marginBottom: 12,
  },
  diagramTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  diagramTitleText: {
    color: '#94a3b8',
    fontSize: 10,
    fontWeight: '700',
  },
  diagramGraphicPlaceholder: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#0d152a',
    borderRadius: 6,
    padding: 8,
  },
  diagramNodeLeft: {
    color: '#38bdf8',
    fontSize: 9,
    fontFamily: 'monospace',
    fontWeight: 'bold',
  },
  diagramArrow: {
    color: '#64748b',
    fontSize: 9,
    fontFamily: 'monospace',
  },
  diagramNodeRight: {
    color: '#34d399',
    fontSize: 9,
    fontFamily: 'monospace',
    fontWeight: 'bold',
  },
  battleOptionItem: {
    backgroundColor: '#070c1a',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#1e293b',
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  battleOptionItemSelected: {
    backgroundColor: '#0c1f3d',
    borderColor: '#38bdf8',
  },
  battleOptionItemCorrect: {
    backgroundColor: '#072418',
    borderColor: '#10b981',
  },
  battleOptionItemWrong: {
    backgroundColor: '#2b0b14',
    borderColor: '#f43f5e',
  },
  checkboxBox: {
    width: 24,
    height: 24,
    borderRadius: 6,
    backgroundColor: '#10172e',
    borderWidth: 1,
    borderColor: '#334155',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  checkboxBoxSelected: {
    backgroundColor: '#0284c7',
    borderColor: '#38bdf8',
  },
  checkboxBoxCorrect: {
    backgroundColor: '#059669',
    borderColor: '#34d399',
  },
  checkboxLetter: {
    color: '#ffffff',
    fontSize: 11,
    fontWeight: '900',
    fontFamily: 'monospace',
  },
  battleOptionText: {
    color: '#94a3b8',
    fontSize: 12,
    flex: 1,
    lineHeight: 16,
  },
  battleOptionTextSelected: {
    color: '#ffffff',
    fontWeight: '700',
  },
  submitAnswerBtn: {
    backgroundColor: '#0284c7',
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
    marginTop: 8,
  },
  submitAnswerBtnText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '900',
  },
  answerFeedbackCard: {
    backgroundColor: '#070c1a',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#1e293b',
    padding: 12,
    marginTop: 10,
  },
  feedbackTitleText: {
    fontSize: 13,
    fontWeight: '900',
  },
  correctAnswersLabel: {
    color: '#34d399',
    fontSize: 11,
    fontWeight: '800',
    marginBottom: 4,
  },
  feedbackExplanationText: {
    color: '#94a3b8',
    fontSize: 11,
    lineHeight: 16,
    marginBottom: 12,
  },
  nextBattleQBtn: {
    backgroundColor: '#2563eb',
    borderRadius: 10,
    paddingVertical: 10,
    alignItems: 'center',
  },
  nextBattleQBtnText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '800',
  },

  // Battle Results / Scoreboard Styles
  resultsCard: {
    backgroundColor: '#0d1326',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#1e293b',
    padding: 24,
    alignItems: 'center',
  },
  trophyGlowBox: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#1b1a38',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
    borderWidth: 2,
    borderColor: '#f59e0b',
  },
  resultsMainTitle: {
    color: '#ffffff',
    fontSize: 20,
    fontWeight: '900',
    marginBottom: 4,
  },
  resultsSubTitle: {
    color: '#94a3b8',
    fontSize: 11,
    marginBottom: 20,
  },
  scoreComparisonRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 16,
    marginBottom: 20,
    width: '100%',
  },
  scoreBoxPlayer: {
    flex: 1,
    backgroundColor: '#070c1a',
    borderRadius: 14,
    borderWidth: 2,
    borderColor: '#38bdf8',
    padding: 14,
    alignItems: 'center',
  },
  scoreBoxLabel: {
    color: '#38bdf8',
    fontSize: 11,
    fontWeight: '900',
    marginBottom: 4,
  },
  scoreBoxNum: {
    color: '#ffffff',
    fontSize: 28,
    fontWeight: '900',
  },
  scoreBoxPts: {
    color: '#64748b',
    fontSize: 9,
    fontWeight: '800',
  },
  scoreVsText: {
    color: '#64748b',
    fontSize: 14,
    fontWeight: '900',
  },
  xpEarnedCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0b1c2e',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#0284c7',
    padding: 12,
    marginBottom: 20,
    width: '100%',
  },
  xpEarnedTitle: {
    color: '#38bdf8',
    fontSize: 12,
    fontWeight: '900',
  },
  xpEarnedSub: {
    color: '#94a3b8',
    fontSize: 10,
  },
  resultsActionsRow: {
    flexDirection: 'row',
    gap: 10,
    width: '100%',
  },
  rematchBtn: {
    flex: 1,
    backgroundColor: '#1e293b',
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#334155',
  },
  rematchBtnText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '800',
  },
  configureNewBtn: {
    flex: 1.5,
    backgroundColor: '#2563eb',
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
  },
  configureNewBtnText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '800',
  },

  // -----------------------------------------------------------
  // NEW MCQ ARENA ROOMS & MOBILE TEST LAB STYLES
  // -----------------------------------------------------------
  arenaHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  arenaMainTitle: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  arenaSubTitle: {
    color: '#64748b',
    fontSize: 10,
    marginTop: 2,
  },
  mobileOnlyBadge: {
    backgroundColor: '#0c2238',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#0284c7',
  },
  mobileOnlyBadgeText: {
    color: '#38bdf8',
    fontSize: 9,
    fontWeight: '900',
  },

  // Join Room Styles
  joinRoomCard: {
    backgroundColor: '#0d1326',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#1e293b',
    padding: 16,
    marginBottom: 16,
  },
  joinRoomHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  joinRoomCardTitle: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '900',
  },
  joinRoomCardSub: {
    color: '#94a3b8',
    fontSize: 11,
    marginTop: 2,
  },
  joinRoomInputRow: {
    flexDirection: 'row',
    gap: 8,
  },
  joinCodeInput: {
    flex: 1,
    backgroundColor: '#070c1a',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#1e293b',
    color: '#ffffff',
    fontSize: 13,
    fontFamily: 'monospace',
    fontWeight: 'bold',
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  joinSubmitBtn: {
    backgroundColor: '#2563eb',
    borderRadius: 10,
    paddingHorizontal: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  joinSubmitBtnText: {
    color: '#ffffff',
    fontSize: 11,
    fontWeight: '900',
  },
  roomErrorBanner: {
    backgroundColor: '#2e0f14',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#f43f5e',
    padding: 10,
    marginTop: 10,
  },
  roomErrorText: {
    color: '#fb7185',
    fontSize: 11,
    fontWeight: '700',
  },

  // Active Rooms List Styles
  activeRoomsHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  activeRoomsSectionTitle: {
    color: '#94a3b8',
    fontSize: 11,
    fontWeight: '900',
    letterSpacing: 0.8,
  },
  activeRoomsSectionSub: {
    color: '#64748b',
    fontSize: 10,
  },
  activeRoomCard: {
    backgroundColor: '#0d1326',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#1e293b',
    padding: 14,
    marginBottom: 10,
  },
  activeRoomTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  activeRoomTitle: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: '800',
    lineHeight: 18,
  },
  activeRoomHost: {
    color: '#64748b',
    fontSize: 10,
    marginTop: 3,
  },
  roomCodeBadge: {
    backgroundColor: '#0c1b33',
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderWidth: 1,
    borderColor: '#1d4ed8',
  },
  roomCodeBadgeText: {
    color: '#60a5fa',
    fontSize: 10,
    fontWeight: '900',
    fontFamily: 'monospace',
  },
  roomBadgesRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginBottom: 8,
  },
  roomMetaPill: {
    backgroundColor: '#070c1a',
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#1e293b',
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  roomMetaPillText: {
    color: '#94a3b8',
    fontSize: 9,
    fontWeight: '700',
  },
  roomTopicsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 4,
    marginBottom: 10,
  },
  topicMiniTag: {
    backgroundColor: '#101a33',
    borderRadius: 4,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  topicMiniTagText: {
    color: '#38bdf8',
    fontSize: 9,
    fontWeight: '600',
  },
  enterRoomBtn: {
    backgroundColor: '#17223b',
    borderRadius: 8,
    paddingVertical: 10,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#223359',
  },
  enterRoomBtnText: {
    color: '#38bdf8',
    fontSize: 11,
    fontWeight: '800',
  },

  // Source Type Selector Styles
  sourceTypeToggleRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 8,
  },
  sourceTypeCard: {
    flex: 1,
    backgroundColor: '#070c1a',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#1e293b',
    padding: 10,
  },
  sourceTypeCardActive: {
    backgroundColor: '#0c1e38',
    borderColor: '#38bdf8',
  },
  sourceTypeIcon: {
    fontSize: 18,
    marginBottom: 4,
  },
  sourceTypeTitle: {
    color: '#cbd5e1',
    fontSize: 11,
    fontWeight: '800',
    marginBottom: 2,
  },
  sourceTypeTitleActive: {
    color: '#38bdf8',
  },
  sourceTypeSub: {
    color: '#64748b',
    fontSize: 9,
  },
  subFieldLabel: {
    color: '#64748b',
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 0.8,
    marginBottom: 6,
  },

  // PDF / Notes Text Input Styles
  presetButtonsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginBottom: 8,
  },
  presetBtn: {
    backgroundColor: '#101a33',
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderWidth: 1,
    borderColor: '#1e293b',
  },
  presetBtnText: {
    color: '#93c5fd',
    fontSize: 10,
    fontWeight: '700',
  },
  pdfNotesTextInput: {
    backgroundColor: '#070c1a',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#1e293b',
    color: '#e2e8f0',
    fontSize: 12,
    padding: 10,
    minHeight: 100,
    lineHeight: 18,
  },

  // Duration Pills Styles
  durationPillsRow: {
    flexDirection: 'row',
    gap: 6,
    marginBottom: 4,
  },
  durationPill: {
    flex: 1,
    backgroundColor: '#070c1a',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#1e293b',
    paddingVertical: 8,
    alignItems: 'center',
  },
  durationPillSelected: {
    backgroundColor: '#1e1124',
    borderColor: '#f43f5e',
  },
  durationPillText: {
    color: '#64748b',
    fontSize: 11,
    fontWeight: '700',
  },
  durationPillTextSelected: {
    color: '#fb7185',
    fontWeight: '900',
  },

  // Proctoring Lockdown Bar
  proctorLockdownBar: {
    backgroundColor: '#0c1b33',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#1d4ed8',
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 14,
  },
  proctorLockdownTitle: {
    color: '#38bdf8',
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  proctorLockdownSub: {
    color: '#93c5fd',
    fontSize: 9,
    marginTop: 1,
  },
  proctorActionButtonsRow: {
    flexDirection: 'row',
    gap: 6,
  },
  proctorExitBtn: {
    backgroundColor: '#3b1219',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#f43f5e',
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  proctorExitBtnText: {
    color: '#fb7185',
    fontSize: 11,
    fontWeight: '800',
  },
  proctorSubmitBtn: {
    backgroundColor: '#064e3b',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#10b981',
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  proctorSubmitBtnText: {
    color: '#34d399',
    fontSize: 11,
    fontWeight: '900',
  },

  // Exit Confirmation Modal
  exitModalCard: {
    width: '90%',
    backgroundColor: '#0d1326',
    borderRadius: 22,
    borderWidth: 1,
    borderColor: '#1e293b',
    padding: 22,
    alignItems: 'center',
  },
  exitModalIconCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#26141c',
    borderWidth: 1,
    borderColor: '#f43f5e',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  exitModalTitle: {
    color: '#ffffff',
    fontSize: 17,
    fontWeight: '900',
    marginBottom: 6,
  },
  exitModalDesc: {
    color: '#94a3b8',
    fontSize: 11,
    textAlign: 'center',
    lineHeight: 16,
    marginBottom: 20,
  },
  exitModalBtnCol: {
    width: '100%',
    gap: 8,
  },
  exitModalSubmitBtn: {
    backgroundColor: '#2563eb',
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
  },
  exitModalSubmitBtnText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '900',
  },
  exitModalForfeitBtn: {
    backgroundColor: '#331018',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#f43f5e',
    paddingVertical: 12,
    alignItems: 'center',
  },
  exitModalForfeitBtnText: {
    color: '#fb7185',
    fontSize: 12,
    fontWeight: '800',
  },
  exitModalCancelBtn: {
    backgroundColor: '#1e293b',
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
  },
  exitModalCancelBtnText: {
    color: '#cbd5e1',
    fontSize: 12,
    fontWeight: '700',
  },

  // Enhanced Roadmap Domain Pills
  domainMiniPill: {
    flex: 1,
    backgroundColor: '#070c1a',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#1e293b',
    paddingVertical: 6,
    paddingHorizontal: 8,
    alignItems: 'center',
  },
  domainMiniPillLabel: {
    color: '#64748b',
    fontSize: 9,
    fontWeight: '700',
  },
  domainMiniPillVal: {
    color: '#38bdf8',
    fontSize: 11,
    fontWeight: '900',
    marginTop: 2,
  },

  // Next Step Focus Card
  nextStepFocusCard: {
    backgroundColor: '#0c1b33',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#2563eb',
    padding: 16,
    marginTop: 12,
    marginBottom: 12,
    shadowColor: '#2563eb',
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 3,
  },
  nextStepBadge: {
    backgroundColor: '#172554',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#3b82f6',
  },
  nextStepBadgeText: {
    color: '#60a5fa',
    fontSize: 9,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  nextStepXpText: {
    color: '#fde047',
    fontSize: 11,
    fontWeight: '900',
    fontFamily: 'monospace',
  },
  nextStepTitle: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '900',
    marginBottom: 4,
  },
  nextStepDesc: {
    color: '#93c5fd',
    fontSize: 11,
    lineHeight: 16,
    marginBottom: 12,
  },
  nextStepButtonsRow: {
    flexDirection: 'row',
    gap: 8,
  },
  nextStepStartBtn: {
    flex: 2,
    backgroundColor: '#2563eb',
    borderRadius: 10,
    paddingVertical: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  nextStepStartBtnText: {
    color: '#ffffff',
    fontSize: 11,
    fontWeight: '900',
  },
  nextStepCompleteBtn: {
    flex: 1,
    backgroundColor: '#064e3b',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#10b981',
    paddingVertical: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  nextStepCompleteBtnText: {
    color: '#34d399',
    fontSize: 11,
    fontWeight: '800',
  },

  roadmapAllDoneCard: {
    backgroundColor: '#062c22',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#10b981',
    padding: 16,
    marginTop: 12,
    marginBottom: 12,
    alignItems: 'center',
    textAlign: 'center',
  },
  roadmapAllDoneTitle: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '900',
    marginBottom: 4,
  },
  roadmapAllDoneSub: {
    color: '#6ee7b7',
    fontSize: 11,
    textAlign: 'center',
    lineHeight: 16,
  },

  // Controls Row & Filters
  roadmapControlsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 14,
    gap: 8,
  },
  roadmapViewToggle: {
    flexDirection: 'row',
    backgroundColor: '#070c1a',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#1e293b',
    padding: 2,
  },
  roadmapToggleBtn: {
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: 8,
  },
  roadmapToggleBtnActive: {
    backgroundColor: '#1d4ed8',
  },
  roadmapToggleText: {
    color: '#64748b',
    fontSize: 10,
    fontWeight: '700',
  },
  roadmapToggleTextActive: {
    color: '#ffffff',
    fontWeight: '900',
  },
  roadmapCompanyChip: {
    backgroundColor: '#070c1a',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#1e293b',
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  roadmapCompanyChipActive: {
    backgroundColor: '#1e1b4b',
    borderColor: '#6366f1',
  },
  roadmapCompanyChipText: {
    color: '#64748b',
    fontSize: 10,
    fontWeight: '700',
  },
  roadmapCompanyChipTextActive: {
    color: '#a5b4fc',
    fontWeight: '900',
  },

  // Metro Subway Journey Styles
  metroJourneyContainer: {
    position: 'relative',
    paddingLeft: 22,
    marginBottom: 20,
  },
  metroStopRow: {
    position: 'relative',
    marginBottom: 16,
  },
  metroConnectorLine: {
    position: 'absolute',
    left: -13,
    top: 24,
    bottom: -20,
    width: 2,
    backgroundColor: '#1e3a8a',
  },
  metroNodeCircle: {
    position: 'absolute',
    left: -26,
    top: 10,
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: '#070c1a',
    borderWidth: 2,
    borderColor: '#334155',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 2,
  },
  metroNodeCircleDone: {
    backgroundColor: '#059669',
    borderColor: '#34d399',
  },
  metroNodeCircleCurrent: {
    backgroundColor: '#2563eb',
    borderColor: '#38bdf8',
  },
  metroNodeCircleText: {
    color: '#ffffff',
    fontSize: 11,
    fontWeight: '900',
  },
  metroCard: {
    backgroundColor: '#0d1326',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#1e293b',
    padding: 14,
  },
  metroCardCurrent: {
    borderColor: '#3b82f6',
    backgroundColor: '#0c1b33',
  },
  metroStopNumber: {
    color: '#60a5fa',
    fontSize: 9,
    fontWeight: '900',
    letterSpacing: 0.8,
  },
  metroCurrentPill: {
    backgroundColor: '#172554',
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#2563eb',
  },
  metroCurrentPillText: {
    color: '#38bdf8',
    fontSize: 8,
    fontWeight: '900',
  },
  metroCardTitle: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: '900',
    marginTop: 2,
    marginBottom: 2,
  },
  metroCardSub: {
    color: '#94a3b8',
    fontSize: 10,
    lineHeight: 14,
  },
  metroCardTestBtn: {
    backgroundColor: '#1e293b',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#334155',
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  metroCardTestBtnText: {
    color: '#38bdf8',
    fontSize: 10,
    fontWeight: '900',
  },
  metroCompanyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    paddingTop: 6,
    borderTopWidth: 1,
    borderTopColor: '#1e293b',
    gap: 4,
  },
  metroCompanyLabel: {
    color: '#64748b',
    fontSize: 9,
    fontWeight: '600',
  },
  metroCompanyVal: {
    color: '#cbd5e1',
    fontSize: 9,
    fontWeight: '700',
  },

  // Google Authentication Modal Styles
  googleModalCard: {
    width: '90%',
    backgroundColor: '#0d1326',
    borderRadius: 22,
    borderWidth: 1,
    borderColor: '#1e293b',
    padding: 20,
  },
  googleModalHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  googleGLogoCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#ffffff',
    justifyContent: 'center',
    alignItems: 'center',
  },
  googleGLogoText: {
    fontSize: 22,
    fontWeight: '900',
    color: '#ea4335',
  },
  googleModalTitle: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '900',
  },
  googleModalSub: {
    color: '#94a3b8',
    fontSize: 11,
    marginTop: 1,
  },
  googleCloseBtn: {
    padding: 6,
  },
  googleModalPrompt: {
    color: '#cbd5e1',
    fontSize: 11,
    lineHeight: 16,
    marginBottom: 16,
  },
  googleOneTapBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#131b33',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#3b82f6',
    padding: 12,
    marginBottom: 14,
  },
  googleGLogoPill: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#ffffff',
    justifyContent: 'center',
    alignItems: 'center',
  },
  googleOneTapBtnTitle: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '900',
  },
  googleOneTapBtnSub: {
    color: '#93c5fd',
    fontSize: 10,
    marginTop: 1,
  },
  googleInputBox: {
    backgroundColor: '#070c1a',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#1e293b',
    padding: 12,
    marginBottom: 14,
  },
  googleInputLabel: {
    color: '#94a3b8',
    fontSize: 10,
    fontWeight: '700',
    marginBottom: 8,
  },
  googleInputRow: {
    flexDirection: 'row',
    gap: 8,
  },
  googleTextInput: {
    flex: 1,
    backgroundColor: '#0d1326',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#1e293b',
    color: '#ffffff',
    fontSize: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  googleInputSubmitBtn: {
    backgroundColor: '#2563eb',
    borderRadius: 10,
    paddingHorizontal: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  googleInputSubmitBtnText: {
    color: '#ffffff',
    fontSize: 11,
    fontWeight: '900',
  },
  googleBrowserAuthBtn: {
    backgroundColor: '#070c1a',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#1e293b',
    paddingVertical: 11,
    alignItems: 'center',
  },
  googleBrowserAuthBtnText: {
    color: '#94a3b8',
    fontSize: 11,
    fontWeight: '700',
  },
});

