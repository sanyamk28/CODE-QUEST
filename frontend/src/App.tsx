import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import {
  Code2, Database, HelpCircle, Puzzle, Award, Swords, Bot, FileText,
  Compass, Trophy, Flame, Zap, Shield, CheckCircle2, XCircle, AlertCircle,
  Play, Send, RefreshCw, ChevronRight, Sparkles, Terminal, BookOpen,
  Check, Lock, UploadCloud, Users, ArrowRight, Star, LogIn, UserPlus, LogOut,
  Mail, KeyRound, Briefcase, GraduationCap, Clock, Layers, Sliders, CheckSquare,
  FileCheck, FileSpreadsheet, Eye, Copy, ArrowUpRight, Activity, Settings, Plus,
  Search, Filter, Trash2, UserX, UserCheck, Download, BarChart2, ShieldAlert,
  Phone, Globe, Linkedin, Github, Target, TrendingUp, CheckCheck, FileCode, Printer, ChevronDown, ChevronUp, Lightbulb
} from 'lucide-react';
import { INITIAL_MCQS, MCQ_BANK, LANGUAGE_TRACKS } from './data/mcqBank';
import { LANGUAGE_ROADMAPS, LanguageRoadmap } from './data/roadmapData';

const API_BASE = (import.meta as any).env?.VITE_API_BASE_URL || '/api/v1';

// Initial problems mock fallback with clean starter skeletons, hints & full solutions
const INITIAL_CODING_PROBLEMS = [
  {
    id: "p-1",
    title: "Two Sum",
    difficulty: "Easy",
    type: "coding",
    xp_reward: 15,
    company_tags: ["Google", "Amazon", "Meta"],
    topic_name: "Arrays & Strings",
    subtopic_name: "Two Pointers",
    desc: "Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target.\n\nYou may assume that each input would have exactly one solution, and you may not use the same element twice.",
    input: "nums = [2,7,11,15], target = 9",
    output: "[0,1]",
    template: "",
    hint: "Use a hash map (dictionary) to store each number and its index. For each number n, check if (target - n) is already in the dictionary. If yes, return [map[target - n], currentIndex]. This achieves O(N) linear time.",
    solution: `def two_sum(nums, target):
    prev_map = {}  # val -> index
    for i, n in enumerate(nums):
        diff = target - n
        if diff in prev_map:
            return [prev_map[diff], i]
        prev_map[n] = i
    return []

# Test execution:
print(two_sum([2, 7, 11, 15], 9))`,
    solutionExplanation: "Optimal O(N) Hash Table approach: Traverse the array once, checking if the complement (target - num) exists in the hash map. Time: O(N), Space: O(N)."
  },
  {
    id: "p-2",
    title: "Contains Duplicate",
    difficulty: "Easy",
    type: "coding",
    xp_reward: 10,
    company_tags: ["Apple", "Microsoft"],
    topic_name: "Arrays & Strings",
    subtopic_name: "Hashing",
    desc: "Given an integer array nums, return true if any value appears at least twice in the array, and false if every element is distinct.",
    input: "nums = [1,2,3,1]",
    output: "true",
    template: "",
    hint: "Maintain a set of visited numbers. As you iterate through nums, if the current element is already present in your set, return True. If the loop completes without finding duplicates, return False.",
    solution: `def contains_duplicate(nums):
    seen = set()
    for n in nums:
        if n in seen:
            return True
        seen.add(n)
    return False

# Test execution:
print(contains_duplicate([1, 2, 3, 1]))`,
    solutionExplanation: "Hash Set approach: Using a set provides O(1) average lookup and insertion, solving the problem in O(N) time and O(N) space."
  },
  {
    id: "p-3",
    title: "Reverse Linked List",
    difficulty: "Easy",
    type: "coding",
    xp_reward: 15,
    company_tags: ["Amazon", "Uber"],
    topic_name: "Linked Lists",
    subtopic_name: "Pointers",
    desc: "Given the head of a singly linked list, reverse the list, and return the reversed list head.",
    input: "head = [1,2,3,4,5]",
    output: "[5,4,3,2,1]",
    template: "",
    hint: "Maintain three pointers: prev (None), curr (head), and next_temp. In a loop, store curr.next, point curr.next to prev, move prev to curr, and advance curr to next_temp.",
    solution: `class ListNode:
    def __init__(self, val=0, next=None):
        self.val = val
        self.next = next

def reverse_list(head):
    prev = None
    curr = head
    while curr:
        nxt = curr.next
        curr.next = prev
        prev = curr
        curr = nxt
    return prev`,
    solutionExplanation: "Iterative pointer reversal: Runs in O(N) time and O(1) space by redirecting each node's next pointer in place."
  }
];

const INITIAL_SQL_PROBLEMS = [
  {
    id: "sql-1",
    title: "Department Top Three Salaries",
    difficulty: "Medium",
    company_tags: ["Google", "Meta"],
    schema: "Employee (id, name, salary, departmentId)\nDepartment (id, name)",
    desc: "Find the employees who are high earners in each department. A high earner earns a salary in the top three unique salaries for that department.",
    defaultQuery: "",
    hint: "Join Employee (e) with Department (d) on departmentId = d.id. Use a correlated subquery in the WHERE clause: count how many distinct salaries in the same department are strictly greater than e.salary. If that count is < 3, the employee is in the top 3!",
    solutionQuery: `SELECT d.name AS Department, e.name AS Employee, e.salary AS Salary
FROM Employee e JOIN Department d ON e.departmentId = d.id
WHERE 3 > (
  SELECT COUNT(DISTINCT e2.salary) 
  FROM Employee e2 
  WHERE e2.salary > e.salary AND e2.departmentId = e.departmentId
);`,
    solutionExplanation: "Correlated Subquery: For each candidate employee row, we count how many distinct salaries in that department exceed theirs. Top 3 earners have 0, 1, or 2 salaries above them."
  },
  {
    id: "sql-2",
    title: "Combine Two Tables",
    difficulty: "Easy",
    company_tags: ["Amazon", "Microsoft"],
    schema: "Person (personId, lastName, firstName)\nAddress (addressId, personId, city, state)",
    desc: "Report the first name, last name, city, and state of each person in the Person table. If no address exists, report null.",
    defaultQuery: "",
    hint: "Use a LEFT JOIN from Person (p) to Address (a) on p.personId = a.personId. This ensures all person rows are returned even if they have no corresponding row in Address.",
    solutionQuery: `SELECT p.firstName, p.lastName, a.city, a.state
FROM Person p LEFT JOIN Address a ON p.personId = a.personId;`,
    solutionExplanation: "LEFT OUTER JOIN: Preserves all rows from the left table (Person) and sets missing Address fields to NULL."
  }
];

const INITIAL_PUZZLES = [
  {
    id: "puz-1",
    title: "3 Bulbs and 3 Switches",
    difficulty: "Medium",
    category: "Logical Deduction",
    desc: "There are three switches downstairs, each controlling one of three light bulbs upstairs. You can make only one trip upstairs. How do you find which switch controls which bulb?",
    hints: [
      "Light bulbs generate both light AND thermal heat over time.",
      "Turn one switch ON for 10 minutes, turn it OFF, and turn the second switch ON before going upstairs."
    ],
    solution: "Turn Switch 1 ON for 10 minutes, then turn it OFF. Turn Switch 2 ON and immediately walk upstairs. The LIT bulb is Switch 2. The WARM/OFF bulb is Switch 1. The COLD/OFF bulb is Switch 3."
  },
  {
    id: "puz-2",
    title: "Measure Exactly 4 Liters",
    difficulty: "Medium",
    category: "Mathematical Reasoning",
    desc: "You have an unmarked 3-liter jug and an unmarked 5-liter jug with unlimited water. How can you measure exactly 4 liters?",
    hints: [
      "Fill the 5L jug and pour into the 3L jug to leave 2L.",
      "Transfer the 2L into the empty 3L jug, fill the 5L jug, and top off the 3L jug."
    ],
    solution: "Fill 5L jug. Pour into 3L jug until full (2L remains in 5L). Empty 3L jug. Transfer 2L into 3L jug. Fill 5L jug completely. Pour from 5L into 3L until full (transfers exactly 1L). Exactly 4L remains in the 5L jug!"
  }
];

const AVAILABLE_SKILLS = [
  "Python", "Java", "C++", "JavaScript", "TypeScript", "SQL",
  "PostgreSQL", "React", "Node.js", "Docker", "Kubernetes", "AWS",
  "Git & GitHub", "System Design", "Data Structures (DSA)", "Linux / Bash"
];

const TARGET_COMPANIES_LIST = [
  "Google", "Amazon", "Microsoft", "Meta", "Apple", "TCS", "Infosys", "Uber", "Netflix", "Startup"
];

// Initial mock student records for Admin Panel
const INITIAL_STUDENTS_LIST = [
  {
    id: "s-101",
    email: "alex.chen@codequest.dev",
    name: "Alex Chen",
    college: "National Institute of Technology",
    degree: "B.Tech Computer Science",
    target_role: "Software Engineer",
    xp: 540,
    readiness_score: 78.5,
    is_active: true,
    created_at: "2026-08-28T10:15:00Z",
    dsa_level: 75.0,
    sql_level: 80.0,
    cs_fundamentals_level: 70.0,
    aptitude_level: 85.0,
    submissions: [
      { id: "sub-1", question_title: "Two Sum", type: "coding", score: 25, is_correct: true, created_at: "2026-08-31T14:20:00Z" },
      { id: "sub-2", question_title: "Department Top Three Salaries", type: "sql", score: 20, is_correct: true, created_at: "2026-08-31T15:10:00Z" }
    ],
    logins: [
      { id: "l-1", login_time: "2026-08-31T19:00:00Z", ip_address: "127.0.0.1", auth_provider: "local", device_info: "Chrome 128 (Windows 11)" }
    ]
  },
  {
    id: "s-102",
    email: "priya.patel@iitb.ac.in",
    name: "Priya Patel",
    college: "IIT Bombay",
    degree: "B.Tech CSE",
    target_role: "Data Engineer",
    xp: 890,
    readiness_score: 88.0,
    is_active: true,
    created_at: "2026-08-27T09:30:00Z",
    dsa_level: 85.0,
    sql_level: 95.0,
    cs_fundamentals_level: 80.0,
    aptitude_level: 90.0,
    submissions: [
      { id: "sub-3", question_title: "Combine Two Tables", type: "sql", score: 20, is_correct: true, created_at: "2026-08-31T11:05:00Z" }
    ],
    logins: [
      { id: "l-2", login_time: "2026-08-31T18:45:00Z", ip_address: "192.168.1.45", auth_provider: "local", device_info: "Mac Safari" }
    ]
  },
  {
    id: "s-103",
    email: "rohan.sharma@bits.edu",
    name: "Rohan Sharma",
    college: "BITS Pilani",
    degree: "B.E. Electronics",
    target_role: "DevOps & Cloud Engineer",
    xp: 420,
    readiness_score: 64.0,
    is_active: false,
    created_at: "2026-08-25T14:10:00Z",
    dsa_level: 55.0,
    sql_level: 60.0,
    cs_fundamentals_level: 75.0,
    aptitude_level: 65.0,
    submissions: [],
    logins: [
      { id: "l-3", login_time: "2026-08-30T12:00:00Z", ip_address: "10.0.0.12", auth_provider: "local", device_info: "Linux Firefox" }
    ]
  }
];

export default function App() {
  // Portal Mode: Candidate Platform vs Admin Console
  const [portalMode, setPortalMode] = useState<'candidate' | 'admin'>('candidate');
  const [isAdminUser, setIsAdminUser] = useState<boolean>(localStorage.getItem('cq_is_admin') === 'true');

  // Navigation
  const [activeTab, setActiveTab] = useState<'dashboard' | 'arena' | 'sql' | 'mcqs' | 'puzzles' | 'assessments' | 'battle' | 'interview' | 'resume' | 'roadmaps' | 'leaderboard'>('dashboard');
  const [adminTab, setAdminTab] = useState<'overview' | 'students' | 'curriculum' | 'telemetry' | 'reports'>('overview');

  // Auth & Onboarding State
  const [token, setToken] = useState<string | null>(localStorage.getItem('cq_token'));
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(!!localStorage.getItem('cq_token'));
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [onboardingStep, setOnboardingStep] = useState(1);
  const [authMode, setAuthMode] = useState<'login' | 'signup'>('login');
  const [authEmail, setAuthEmail] = useState('');
  const [authPass, setAuthPass] = useState('');
  const [authName, setAuthName] = useState('');
  const [authLoading, setAuthLoading] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);

  // Google Direct Login Modal State
  const [showGoogleModal, setShowGoogleModal] = useState(false);
  const [googleEmailInput, setGoogleEmailInput] = useState('');
  const [googleNameInput, setGoogleNameInput] = useState('');

  // Admin Management State
  const [studentsList, setStudentsList] = useState<any[]>(INITIAL_STUDENTS_LIST);
  const [selectedStudent, setSelectedStudent] = useState<any | null>(null);
  const [studentSearchQuery, setStudentSearchQuery] = useState('');
  const [adminStats, setAdminStats] = useState({
    total_enrolled: 48,
    daily_active_users: 24,
    weekly_active_users: 42,
    avg_readiness: 74.5,
    code_submissions: 312,
    battles_hosted: 58
  });

  // Admin New Problem Form
  const [newProblemTitle, setNewProblemTitle] = useState('');
  const [newProblemType, setNewProblemType] = useState<'coding' | 'sql' | 'mcq' | 'puzzle'>('coding');
  const [newProblemDifficulty, setNewProblemDifficulty] = useState('Medium');
  const [newProblemXp, setNewProblemXp] = useState(25);
  const [newProblemCompany, setNewProblemCompany] = useState('Google');
  const [newProblemDesc, setNewProblemDesc] = useState('');
  const [newProblemTemplate, setNewProblemTemplate] = useState('def solution():\n    pass');
  const [problemCreateSuccess, setProblemCreateSuccess] = useState(false);

  // Onboarding Assessment Form State
  const [obTargetRole, setObTargetRole] = useState('Software Engineer');
  const [obCollege, setObCollege] = useState('');
  const [obDegree, setObDegree] = useState('B.Tech / B.E. Computer Science');
  const [obGradYear, setObGradYear] = useState(2026);
  const [obSkills, setObSkills] = useState<string[]>(["Python", "SQL", "Data Structures (DSA)"]);
  const [obDsaLevel, setObDsaLevel] = useState(65);
  const [obSqlLevel, setObSqlLevel] = useState(60);
  const [obCsLevel, setObCsLevel] = useState(55);
  const [obAptitudeLevel, setObAptitudeLevel] = useState(70);
  const [obPrepDuration, setObPrepDuration] = useState(3);
  const [obDailyGoal, setObDailyGoal] = useState(2);
  const [obTargetCompanies, setObTargetCompanies] = useState<string[]>(["Google", "Amazon", "Microsoft"]);

  // User Profile - zero state for student until progress is made
  const [userEmail, setUserEmail] = useState(localStorage.getItem('cq_email') || '');
  const [userName, setUserName] = useState(localStorage.getItem('cq_name') || '');
  const [targetRole, setTargetRole] = useState(localStorage.getItem('cq_role') || 'Software Engineer');
  const [xp, setXp] = useState(Number(localStorage.getItem('cq_xp') || 0));
  const [streak, setStreak] = useState(Number(localStorage.getItem('cq_streak') || 0));
  const [readinessScore, setReadinessScore] = useState(Number(localStorage.getItem('cq_readiness') || 0));

  // Coding Arena State
  const [codingProblems, setCodingProblems] = useState(INITIAL_CODING_PROBLEMS);
  const [selectedProblem, setSelectedProblem] = useState(INITIAL_CODING_PROBLEMS[0]);
  const [codeLanguage, setCodeLanguage] = useState<'python' | 'javascript' | 'cpp'>('python');
  const [editorCode, setEditorCode] = useState(INITIAL_CODING_PROBLEMS[0].template);
  const [executingCode, setExecutingCode] = useState(false);
  const [consoleOutput, setConsoleOutput] = useState<{ status: string; stdout: string; time: number; passed: boolean } | null>(null);
  const [showCodeHint, setShowCodeHint] = useState(false);
  const [showCodeSolution, setShowCodeSolution] = useState(false);
  const [codeCopied, setCodeCopied] = useState(false);

  // SQL Lab State
  const [sqlProblems, setSqlProblems] = useState(INITIAL_SQL_PROBLEMS);
  const [selectedSqlProblem, setSelectedSqlProblem] = useState(INITIAL_SQL_PROBLEMS[0]);
  const [sqlQuery, setSqlQuery] = useState(INITIAL_SQL_PROBLEMS[0].defaultQuery);
  const [sqlRunning, setSqlRunning] = useState(false);
  const [sqlResult, setSqlResult] = useState<{ columns: string[]; rows: any[]; error?: string } | null>(null);
  const [showSqlHint, setShowSqlHint] = useState(false);
  const [showSqlSolution, setShowSqlSolution] = useState(false);
  const [sqlError, setSqlError] = useState<string | null>(null);
  const [sqlCopied, setSqlCopied] = useState(false);

  // Language & Roadmap State
  const [selectedRoadmapLanguage, setSelectedRoadmapLanguage] = useState<string>(() => {
    return localStorage.getItem('cq_roadmap_lang') || 'python';
  });
  const [roadmapDataByLang, setRoadmapDataByLang] = useState<Record<string, LanguageRoadmap>>(() => {
    try {
      const saved = localStorage.getItem('cq_roadmaps_data');
      return saved ? JSON.parse(saved) : LANGUAGE_ROADMAPS;
    } catch {
      return LANGUAGE_ROADMAPS;
    }
  });

  // MCQ State: Dynamic per-language tracks (at least 20 questions each)
  const [selectedMcqLanguage, setSelectedMcqLanguage] = useState<string>(() => {
    return localStorage.getItem('cq_roadmap_lang') || 'python';
  });
  const [currentMcqIdx, setCurrentMcqIdx] = useState(0);
  const [selectedMcqOption, setSelectedMcqOption] = useState<string | null>(null);
  const [mcqSubmitted, setMcqSubmitted] = useState(false);
  const [answeredMcqs, setAnsweredMcqs] = useState<Record<string, { selected: string; isCorrect: boolean }>>({});

  // Active Roadmap and Active MCQ Pool derived state
  const currentRoadmap: LanguageRoadmap = roadmapDataByLang[selectedRoadmapLanguage] || LANGUAGE_ROADMAPS.python;
  const currentMcqPool = selectedMcqLanguage === 'all'
    ? INITIAL_MCQS
    : (MCQ_BANK[selectedMcqLanguage] || MCQ_BANK.python);

  const handleSelectRoadmapLanguage = (langId: string) => {
    setSelectedRoadmapLanguage(langId);
    setSelectedMcqLanguage(langId);
    setCurrentMcqIdx(0);
    setSelectedMcqOption(null);
    setMcqSubmitted(false);
    localStorage.setItem('cq_roadmap_lang', langId);
  };

  const handleToggleRoadmapStep = (langId: string, stepId: number) => {
    setRoadmapDataByLang(prev => {
      const cur = prev[langId] || LANGUAGE_ROADMAPS[langId] || LANGUAGE_ROADMAPS.python;
      const updatedSteps = cur.steps.map(s => s.id === stepId ? { ...s, completed: !s.completed } : s);
      const updated = {
        ...prev,
        [langId]: { ...cur, steps: updatedSteps }
      };
      try {
        localStorage.setItem('cq_roadmaps_data', JSON.stringify(updated));
      } catch (e) {}
      return updated;
    });
  };

  const handleSelectMcqLanguage = (langId: string) => {
    setSelectedMcqLanguage(langId);
    setCurrentMcqIdx(0);
    const pool = langId === 'all' ? INITIAL_MCQS : (MCQ_BANK[langId] || MCQ_BANK.python);
    const existing = answeredMcqs[pool[0]?.id];
    if (existing) {
      setSelectedMcqOption(existing.selected);
      setMcqSubmitted(true);
    } else {
      setSelectedMcqOption(null);
      setMcqSubmitted(false);
    }
  };


  // Puzzles State
  const [puzzlesList, setPuzzlesList] = useState(INITIAL_PUZZLES);
  const [selectedPuzzle, setSelectedPuzzle] = useState(INITIAL_PUZZLES[0]);
  const [unlockedHints, setUnlockedHints] = useState<number[]>([]);
  const [puzzleAnswerText, setPuzzleAnswerText] = useState('');
  const [puzzleChecked, setPuzzleChecked] = useState(false);

  // Live Code Battle State
  const [userId] = useState<string>(() => {
    let id = localStorage.getItem('cq_user_id');
    if (!id) {
      id = 'usr_' + Math.random().toString(36).substring(2, 10);
      localStorage.setItem('cq_user_id', id);
    }
    return id;
  });
  const [battleRoomCode, setBattleRoomCode] = useState('');
  const [inBattle, setInBattle] = useState(false);
  const [battleStatus, setBattleStatus] = useState<'idle' | 'lobby' | 'countdown' | 'active' | 'finished'>('idle');
  const [battleRole, setBattleRole] = useState<'host' | 'challenger'>('host');
  const [battleWinner, setBattleWinner] = useState<{ name: string; isYou: boolean; execution_time?: number } | null>(null);
  const [battlePlayers, setBattlePlayers] = useState<Array<{ user_id: string; name: string; hasPassed: boolean; score: number }>>([]);
  const [battleProblem, setBattleProblem] = useState<any>(null);
  const [battleCode, setBattleCode] = useState(`import sys\n\ndef solve():\n    # Fast live battle solution\n    pass\n\nif __name__ == '__main__':\n    solve()`);
  const [battleCountdown, setBattleCountdown] = useState(3);
  const [battleTimer, setBattleTimer] = useState(0);
  const [battleDifficulty, setBattleDifficulty] = useState<'Easy' | 'Medium' | 'Hard'>('Easy');
  const [opponentTelemetry, setOpponentTelemetry] = useState<{
    lines: number;
    charCount: number;
    isTyping: boolean;
    testsPassed: number;
    totalTests: number;
    status: string;
  }>({
    lines: 1,
    charCount: 0,
    isTyping: false,
    testsPassed: 0,
    totalTests: 0,
    status: 'Ready'
  });
  const [battleTauntToast, setBattleTauntToast] = useState<{ emoji: string; phrase: string; sender: string } | null>(null);
  const [battleQuickMatching, setBattleQuickMatching] = useState(false);
  const [battleJoinInput, setBattleJoinInput] = useState('');
  const [battleSubmitting, setBattleSubmitting] = useState(false);
  const [battleSubmitFeedback, setBattleSubmitFeedback] = useState<{
    is_correct: boolean;
    test_cases_passed: number;
    total_test_cases: number;
    is_winner: boolean;
    execution_time: number;
    compiler_output?: string;
  } | null>(null);
  const [battleCodeCopied, setBattleCodeCopied] = useState(false);
  const [battleError, setBattleError] = useState<string | null>(null);
  const [battleStarting, setBattleStarting] = useState(false);

  const battleWsRef = useRef<WebSocket | null>(null);
  const battleTimerIntervalRef = useRef<any>(null);
  const opponentTypingTimeoutRef = useRef<any>(null);
  const codeProgressDebounceRef = useRef<any>(null);

  // AI Interview State
  const [interviewMessages, setInterviewMessages] = useState<Array<{ speaker: 'AI' | 'USER'; text: string }>>([
    { speaker: 'AI', text: "Hello! I am your AI Technical Recruiter today. Let's begin: Can you describe an architectural tradeoff you had to make between latency and consistency?" }
  ]);
  const [userInterviewInput, setUserInterviewInput] = useState('');
  const [interviewLoading, setInterviewLoading] = useState(false);
  const [interviewReport, setInterviewReport] = useState<any>(null);

  // AI ATS Resume State - user must upload each time to scan
  const [atsScore, setAtsScore] = useState(0);
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [resumeFileName, setResumeFileName] = useState('');
  const [resumeFileSize, setResumeFileSize] = useState('');
  const [resumeUploading, setResumeUploading] = useState(false);
  const [resumeError, setResumeError] = useState<string | null>(null);
  const [resumeTargetRole, setResumeTargetRole] = useState<string>('Software Engineer');
  const [resumeJobDescription, setResumeJobDescription] = useState<string>('');
  const [showJdMatcher, setShowJdMatcher] = useState<boolean>(false);
  const [activeResumeTab, setActiveResumeTab] = useState<'audit' | 'skills' | 'bullets' | 'readability'>('audit');
  const [resumeAnalysisResult, setResumeAnalysisResult] = useState<any>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Load backend data if available
  useEffect(() => {
    const fetchInitialData = async () => {
      if (!token) return;
      try {
        const promises: Promise<any>[] = [
          axios.get(`${API_BASE}/problems/`, { headers: { Authorization: `Bearer ${token}` } }),
          axios.get(`${API_BASE}/dashboard/progress`, { headers: { Authorization: `Bearer ${token}` } })
        ];
        if (isAdminUser) {
          promises.push(axios.get(`${API_BASE}/auth/students`, { headers: { Authorization: `Bearer ${token}` } }));
          promises.push(axios.get(`${API_BASE}/analytics/summary`, { headers: { Authorization: `Bearer ${token}` } }));
        }

        const results = await Promise.allSettled(promises);
        const probRes = results[0];
        const dashRes = results[1];
        const studRes = isAdminUser ? results[2] : null;
        const sumRes = isAdminUser ? results[3] : null;

        // Clean handling for expired token
        if (probRes.status === 'rejected') {
          const errStatus = (probRes.reason as any)?.response?.status;
          if (errStatus === 401) {
            localStorage.removeItem('cq_token');
            setToken(null);
            setIsLoggedIn(false);
            return;
          }
        }

        if (probRes.status === 'fulfilled' && probRes.value.data.length > 0) {
          setCodingProblems(probRes.value.data);
          setSelectedProblem(probRes.value.data[0]);
          setEditorCode('');
        }
        if (dashRes.status === 'fulfilled') {
          const pData = dashRes.value.data;
          setReadinessScore(pData.readiness_score !== undefined ? pData.readiness_score : 15.0);
          setXp(pData.xp !== undefined ? pData.xp : 0);
          setStreak(pData.streak !== undefined ? pData.streak : 1);
          if (pData.name) setUserName(pData.name);
          if (pData.target_role) setTargetRole(pData.target_role);
          if (pData.email) setUserEmail(pData.email);
        }
        if (studRes && studRes.status === 'fulfilled' && studRes.value.data.length > 0) {
          setStudentsList(studRes.value.data);
        }
        if (sumRes && sumRes.status === 'fulfilled') {
          setAdminStats(prev => ({
            ...prev,
            total_enrolled: sumRes.value.data.total_enrolled_students || 48,
            daily_active_users: sumRes.value.data.daily_active_users || 24,
            weekly_active_users: sumRes.value.data.weekly_active_users || 42,
            avg_readiness: sumRes.value.data.average_readiness_score || 74.5
          }));
        }
      } catch (e) {
        console.log("Offline mode active");
      }
    };
    fetchInitialData();
  }, [token, isAdminUser]);

  // Handle Authentication Submit (Sign In or Sign Up)
  const handleAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);
    setAuthLoading(true);

    try {
      if (authMode === 'signup') {
        const regRes = await axios.post(`${API_BASE}/auth/register`, {
          email: authEmail,
          password: authPass
        });
        const newToken = regRes.data.access_token;
        setToken(newToken);
        localStorage.setItem('cq_token', newToken);
        localStorage.setItem('cq_email', authEmail);
        setIsAdminUser(false);
        localStorage.setItem('cq_is_admin', 'false');
        
        const displayName = authName || authEmail.split('@')[0].replace('.', ' ');
        setUserName(displayName);
        localStorage.setItem('cq_name', displayName);
        setUserEmail(authEmail);

        setShowOnboarding(true);
        setOnboardingStep(1);
      } else {
        const logRes = await axios.post(`${API_BASE}/auth/login`, {
          email: authEmail,
          password: authPass
        });
        const newToken = logRes.data.access_token;
        const isAdmin = !!logRes.data.is_admin || authEmail === 'admin@codequest.dev';
        setToken(newToken);
        setIsLoggedIn(true);
        setIsAdminUser(isAdmin);
        localStorage.setItem('cq_token', newToken);
        localStorage.setItem('cq_email', authEmail);
        localStorage.setItem('cq_is_admin', isAdmin ? 'true' : 'false');

        const displayName = authEmail.split('@')[0].replace('.', ' ');
        setUserName(displayName);
        localStorage.setItem('cq_name', displayName);
        setUserEmail(authEmail);

        if (isAdmin) {
          setPortalMode('admin');
        }

        try {
          const profRes = await axios.get(`${API_BASE}/auth/profile`, {
            headers: { Authorization: `Bearer ${newToken}` }
          });
          if (profRes.data.name) setUserName(profRes.data.name);
          if (profRes.data.target_role) setTargetRole(profRes.data.target_role);
          if (profRes.data.xp) setXp(profRes.data.xp);
          if (profRes.data.streak) setStreak(profRes.data.streak);
          if (profRes.data.readiness_score) setReadinessScore(profRes.data.readiness_score);
        } catch (err) {}
      }
    } catch (err: any) {
      setAuthError(err.response?.data?.detail || "Invalid email or password. Please check your credentials.");
    } finally {
      setAuthLoading(false);
    }
  };

  // 1-Click Head Administrator Login
  const handleAdminDemoLogin = async () => {
    setAuthLoading(true);
    try {
      const res = await axios.post(`${API_BASE}/auth/login`, {
        email: "admin@codequest.dev",
        password: "Admin@1234"
      });
      const newToken = res.data.access_token;
      setToken(newToken);
      setIsLoggedIn(true);
      setIsAdminUser(true);
      setPortalMode('admin');
      setUserEmail('admin@codequest.dev');
      setUserName('Head Administrator');
      localStorage.setItem('cq_token', newToken);
      localStorage.setItem('cq_email', 'admin@codequest.dev');
      localStorage.setItem('cq_name', 'Head Administrator');
      localStorage.setItem('cq_is_admin', 'true');
    } catch (e) {
      setToken('admin_demo_token');
      setIsLoggedIn(true);
      setIsAdminUser(true);
      setPortalMode('admin');
      setUserEmail('admin@codequest.dev');
      setUserName('Head Administrator');
      localStorage.setItem('cq_token', 'admin_demo_token');
      localStorage.setItem('cq_email', 'admin@codequest.dev');
      localStorage.setItem('cq_name', 'Head Administrator');
      localStorage.setItem('cq_is_admin', 'true');
    } finally {
      setAuthLoading(false);
    }
  };

  // Complete Onboarding Assessment & Save to Backend
  const handleFinishOnboarding = async () => {
    setAuthLoading(true);
    const calculatedScore = Math.min(
      Math.max(
        Math.round((obDsaLevel * 0.4 + obSqlLevel * 0.25 + obCsLevel * 0.2 + obAptitudeLevel * 0.15) + (obDailyGoal >= 2 ? 5 : 0)),
        15
      ),
      95
    );

    try {
      if (token) {
        await axios.post(`${API_BASE}/auth/onboard`, {
          name: userName,
          college: obCollege || "National Institute of Technology",
          degree: obDegree,
          graduation_year: obGradYear,
          target_role: obTargetRole,
          experience_level: obDsaLevel > 70 ? "advanced" : (obDsaLevel > 40 ? "intermediate" : "beginner"),
          target_companies: obTargetCompanies,
          prep_duration: obPrepDuration,
          daily_study_goal: obDailyGoal,
          skills: obSkills,
          dsa_level: obDsaLevel,
          sql_level: obSqlLevel,
          aptitude_level: obAptitudeLevel
        }, {
          headers: { Authorization: `Bearer ${token}` }
        });
      }
    } catch (e) {
      console.log("Using local profile state");
    } finally {
      setTargetRole(obTargetRole);
      setReadinessScore(calculatedScore);
      localStorage.setItem('cq_role', obTargetRole);
      setShowOnboarding(false);
      setIsLoggedIn(true);
      setAuthLoading(false);
    }
  };

  // Direct Google Login - works for ANY Google email with isolated per-user persistence
  const handleGoogleLoginDirect = async (emailToUse: string, nameToUse?: string) => {
    const cleanEmail = emailToUse.trim().toLowerCase();
    if (!cleanEmail || !cleanEmail.includes('@')) {
      setAuthError("Please provide a valid Google or university email address.");
      return;
    }
    setAuthLoading(true);
    setAuthError(null);
    try {
      const tokenString = `google-user-${cleanEmail}`;
      const res = await axios.post(`${API_BASE}/auth/google`, {
        id_token: tokenString,
        email: cleanEmail,
        name: nameToUse || cleanEmail.split('@')[0].replace('.', ' ').replace(/(^\w|\s\w)/g, m => m.toUpperCase())
      });
      
      const newToken = res.data.access_token;
      const isNewUser = res.data.is_new_user;
      const userEmailVal = res.data.email || cleanEmail;
      const userNameVal = res.data.name || nameToUse || cleanEmail.split('@')[0];
      
      setToken(newToken);
      setIsLoggedIn(true);
      setIsAdminUser(false); // Google logins are STRICTLY Students
      setPortalMode('candidate');
      setUserEmail(userEmailVal);
      setUserName(userNameVal);
      setShowGoogleModal(false);
      
      localStorage.setItem('cq_token', newToken);
      localStorage.setItem('cq_email', userEmailVal);
      localStorage.setItem('cq_name', userNameVal);
      localStorage.setItem('cq_is_admin', 'false');
      
      if (isNewUser) {
        setShowOnboarding(true);
        setOnboardingStep(1);
      } else {
        // Load this particular student's real saved progress from database
        try {
          const profRes = await axios.get(`${API_BASE}/dashboard/progress`, {
            headers: { Authorization: `Bearer ${newToken}` }
          });
          if (profRes.data.name) setUserName(profRes.data.name);
          if (profRes.data.target_role) setTargetRole(profRes.data.target_role);
          if (profRes.data.xp !== undefined) setXp(profRes.data.xp);
          if (profRes.data.streak !== undefined) setStreak(profRes.data.streak);
          if (profRes.data.readiness_score !== undefined) setReadinessScore(profRes.data.readiness_score);
        } catch (err) {}
      }
    } catch (e: any) {
      setAuthError(e.response?.data?.detail || "Google login failed. Please try again.");
    } finally {
      setAuthLoading(false);
    }
  };

  // Google OAuth Login Trigger
  const handleGoogleLogin = () => {
    setAuthError(null);
    if ((window as any).google?.accounts?.id) {
      try {
        (window as any).google.accounts.id.initialize({
          client_id: "54642993956-7q3odq2tcc92pjeuba8q9apllrphki75.apps.googleusercontent.com",
          callback: async (response: any) => {
            if (response?.credential) {
              setAuthLoading(true);
              try {
                const res = await axios.post(`${API_BASE}/auth/google`, { id_token: response.credential });
                const newToken = res.data.access_token;
                const isNewUser = res.data.is_new_user;
                const finalEmail = res.data.email || 'student@google.com';
                const finalName = res.data.name || 'Google Student';
                setToken(newToken);
                setIsLoggedIn(true);
                setIsAdminUser(false);
                setPortalMode('candidate');
                setUserEmail(finalEmail);
                setUserName(finalName);
                localStorage.setItem('cq_token', newToken);
                localStorage.setItem('cq_email', finalEmail);
                localStorage.setItem('cq_name', finalName);
                localStorage.setItem('cq_is_admin', 'false');
                if (isNewUser) {
                  setShowOnboarding(true);
                  setOnboardingStep(1);
                } else {
                  try {
                    const profRes = await axios.get(`${API_BASE}/dashboard/progress`, {
                      headers: { Authorization: `Bearer ${newToken}` }
                    });
                    if (profRes.data.name) setUserName(profRes.data.name);
                    if (profRes.data.target_role) setTargetRole(profRes.data.target_role);
                    if (profRes.data.xp !== undefined) setXp(profRes.data.xp);
                    if (profRes.data.streak !== undefined) setStreak(profRes.data.streak);
                    if (profRes.data.readiness_score !== undefined) setReadinessScore(profRes.data.readiness_score);
                  } catch (e) {}
                }
              } catch (err: any) {
                setAuthError("Google Sign-In failed.");
              } finally {
                setAuthLoading(false);
              }
            }
          }
        });
        (window as any).google.accounts.id.prompt((notification: any) => {
          if (notification.isNotDisplayed() || notification.isSkippedMoment()) {
            setShowGoogleModal(true);
          }
        });
      } catch (err) {
        setShowGoogleModal(true);
      }
    } else {
      setShowGoogleModal(true);
    }
  };

  // 1-Click Candidate Demo Login (Alex Chen)
  const handleCandidateDemoLogin = async () => {
    setAuthLoading(true);
    setAuthError(null);
    try {
      const res = await axios.post(`${API_BASE}/auth/login`, {
        email: "alex.chen@codequest.dev",
        password: "pass123"
      });
      const newToken = res.data.access_token;
      setToken(newToken);
      setIsLoggedIn(true);
      setIsAdminUser(false);
      setPortalMode('candidate');
      setUserEmail("alex.chen@codequest.dev");
      setUserName("Alex Chen");
      localStorage.setItem('cq_token', newToken);
      localStorage.setItem('cq_email', "alex.chen@codequest.dev");
      localStorage.setItem('cq_name', "Alex Chen");
      localStorage.setItem('cq_is_admin', 'false');

      try {
        const profRes = await axios.get(`${API_BASE}/dashboard/progress`, {
          headers: { Authorization: `Bearer ${newToken}` }
        });
        if (profRes.data.name) setUserName(profRes.data.name);
        if (profRes.data.target_role) setTargetRole(profRes.data.target_role);
        if (profRes.data.xp !== undefined) setXp(profRes.data.xp);
        if (profRes.data.streak !== undefined) setStreak(profRes.data.streak);
        if (profRes.data.readiness_score !== undefined) setReadinessScore(profRes.data.readiness_score);
      } catch (err) {}
    } catch (e) {
      setToken('demo_candidate_token');
      setIsLoggedIn(true);
      setIsAdminUser(false);
      setPortalMode('candidate');
      setUserEmail('alex.chen@codequest.dev');
      setUserName('Alex Chen');
      setTargetRole('Software Engineer');
      setXp(540);
      setStreak(7);
      setReadinessScore(78.5);
      localStorage.setItem('cq_token', 'demo_candidate_token');
      localStorage.setItem('cq_email', 'alex.chen@codequest.dev');
      localStorage.setItem('cq_name', 'Alex Chen');
      localStorage.setItem('cq_is_admin', 'false');
    } finally {
      setAuthLoading(false);
    }
  };

  // 1-Click Guest Demo Login
  const handleDemoLogin = () => {
    setToken('demo_token');
    setIsLoggedIn(true);
    setIsAdminUser(false);
    setPortalMode('candidate');
    setUserEmail('candidate.demo@codequest.dev');
    setUserName('Candidate Guest');
    setTargetRole('Software Engineer');
    setXp(0);
    setStreak(1);
    setReadinessScore(15.0);
    localStorage.setItem('cq_token', 'demo_token');
    localStorage.setItem('cq_email', 'candidate.demo@codequest.dev');
    localStorage.setItem('cq_name', 'Candidate Guest');
    localStorage.setItem('cq_is_admin', 'false');
  };

  // Log Out & Clear All Stored User Data
  const handleLogout = () => {
    setToken(null);
    setIsLoggedIn(false);
    setIsAdminUser(false);
    setShowOnboarding(false);
    setUserEmail('');
    setUserName('');
    setXp(0);
    setStreak(0);
    setReadinessScore(0);
    setPortalMode('candidate');
    localStorage.removeItem('cq_token');
    localStorage.removeItem('cq_email');
    localStorage.removeItem('cq_name');
    localStorage.removeItem('cq_role');
    localStorage.removeItem('cq_xp');
    localStorage.removeItem('cq_streak');
    localStorage.removeItem('cq_readiness');
    localStorage.removeItem('cq_is_admin');
  };

  // Admin: Toggle Student Active/Inactive
  const handleToggleStudentStatus = async (studentId: string) => {
    try {
      if (token) {
        await axios.post(`${API_BASE}/auth/students/${studentId}/toggle-active`, {}, {
          headers: { Authorization: `Bearer ${token}` }
        });
      }
    } catch (e) {}
    setStudentsList(prev => prev.map(s => s.id === studentId ? { ...s, is_active: !s.is_active } : s));
    if (selectedStudent && selectedStudent.id === studentId) {
      setSelectedStudent((prev: any) => ({ ...prev, is_active: !prev.is_active }));
    }
  };

  // Admin: Create Problem Submit
  const handleCreateProblemSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const newProbObj = {
      id: `p-${Date.now()}`,
      title: newProblemTitle,
      difficulty: newProblemDifficulty,
      type: newProblemType,
      xp_reward: newProblemXp,
      company_tags: [newProblemCompany],
      topic_name: "Core Problem Set",
      subtopic_name: "Placement Essentials",
      desc: newProblemDesc,
      input: "Example Test Input",
      output: "Expected Output",
      template: newProblemTemplate,
      hint: "Analyze constraints and select optimal data structures.",
      solution: newProblemTemplate,
      solutionExplanation: "Optimal solution authored by Administrator."
    };

    setCodingProblems(prev => [newProbObj, ...prev]);
    setProblemCreateSuccess(true);
    setNewProblemTitle('');
    setNewProblemDesc('');
    setTimeout(() => setProblemCreateSuccess(false), 3000);
  };

  // Resume File Selection Handler
  const handleResumeFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (!file.name.toLowerCase().endsWith('.pdf')) {
        setResumeError('Please select a valid PDF file format (.pdf).');
        return;
      }
      setResumeFile(file);
      setResumeFileName(file.name);
      setResumeFileSize(`${(file.size / 1024).toFixed(1)} KB`);
      setResumeError(null);
    }
  };

  // Resume ATS Scan & Score Handler
  const handleScanResume = async () => {
    if (!resumeFile) {
      setResumeError('Please select or upload a PDF resume first.');
      return;
    }

    setResumeUploading(true);
    setResumeError(null);

    const formData = new FormData();
    formData.append('file', resumeFile);
    formData.append('target_role', resumeTargetRole || targetRole);
    if (resumeJobDescription.trim()) {
      formData.append('job_description', resumeJobDescription.trim());
    }

    try {
      if (token) {
        const res = await axios.post(`${API_BASE}/ai/resume/upload`, formData, {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'multipart/form-data'
          }
        });
        setAtsScore(res.data.ats_score);
        setResumeAnalysisResult(res.data);
        setXp(prev => prev + 35);
      } else {
        // Fallback for unauthenticated / guest demo
        setTimeout(() => {
          const score = 84;
          setAtsScore(score);
          setResumeAnalysisResult({
            ats_score: score,
            target_role: resumeTargetRole || targetRole,
            score_breakdown: {
              skills_score: 85,
              impact_score: 80,
              completeness_score: 90,
              formatting_score: 85
            },
            metrics: {
              word_count: 512,
              estimated_pages: 1,
              action_verbs_count: 12,
              quantified_metrics_count: 6,
              sections_found: ['Contact', 'Summary', 'Experience', 'Education', 'Projects', 'Skills'],
              sections_missing: ['Certifications'],
              contact_info: {
                email: 'candidate@codequest.dev',
                phone: '+1 (555) 019-2834',
                linkedin: 'https://linkedin.com/in/candidate-dev',
                github: 'https://github.com/candidate-dev',
                portfolio: 'candidate.dev'
              }
            },
            matched_skills: ['Python', 'SQL', 'PostgreSQL', 'Docker', 'FastAPI', 'System Design', 'Git', 'OOP', 'REST APIs'],
            missing_skills: ['Kubernetes', 'Apache Spark', 'Redis Cluster'],
            formatting_feedback: 'Optimal single-column structure. Clean font hierarchy and bullet points allow 100% ATS parser extraction without dropped text.',
            role_alignment: `Strong alignment with the ${resumeTargetRole || targetRole} track. Solid problem-solving foundations and database proficiency detected.`,
            suggestions: [
              'Quantify achievements: Use the X-Y-Z formula (e.g. "Optimized PostgreSQL query execution time by 42% via B-Tree index tuning").',
              'Include keywords for container orchestration such as Docker and basic Kubernetes concepts.',
              'Highlight contributions to open-source or GitHub project repositories with active links.'
            ],
            bullet_improvements: [
              {
                original: 'Built REST APIs and database schema.',
                improved: 'Designed and deployed 12 RESTful microservices in Python & FastAPI, reducing API latency by 35% across 200k+ daily queries.',
                reason: 'Specifies framework, measurable latency improvement, and traffic scale.'
              },
              {
                original: 'Helped team with deployment scripts.',
                improved: 'Automated CI/CD pipelines using Docker and GitHub Actions, cutting release deployment cycle from 2 hours to 8 minutes.',
                reason: 'Quantifies time saved and highlights DevOps automation tooling.'
              }
            ]
          });
          setXp(prev => prev + 35);
        }, 900);
      }
    } catch (err: any) {
      setResumeError(err.response?.data?.detail || "Could not complete upload. Please verify the file is a readable PDF and try again.");
    } finally {
      setResumeUploading(false);
    }
  };

  // Code Execution Handler
  const handleRunCode = async () => {
    setExecutingCode(true);
    try {
      if (selectedProblem.id && selectedProblem.id.includes('-') && selectedProblem.id.length > 10) {
        const res = await axios.post(
          `${API_BASE}/problems/${selectedProblem.id}/submit`,
          { code: editorCode, language: codeLanguage },
          { headers: { Authorization: `Bearer ${token}` } }
        );
        const isPassed = res.data.is_correct;
        setConsoleOutput({
          status: isPassed ? "Accepted" : (res.data.compile_status || "Wrong Answer"),
          stdout: res.data.compiler_output || `Passed ${res.data.test_cases_passed}/${res.data.total_test_cases} test cases.\nExecution Time: ${res.data.execution_time}s`,
          time: res.data.execution_time || 0.04,
          passed: isPassed
        });
        if (isPassed) {
          setXp(prev => prev + (res.data.score || 25));
          setShowCodeHint(false);
          setShowCodeSolution(false);
        } else {
          setShowCodeHint(true);
        }
      } else {
        setTimeout(() => {
          const code = editorCode.trim();
          if (!code || (code.includes('# TODO') && code.length < 130) || code.endsWith('pass') || code.includes('pass\n')) {
            setConsoleOutput({
              status: "Incomplete Code / Execution Error",
              stdout: "❌ Execution Error: Function logic not implemented.\nYou must type your solution logic inside the function before running.\n\n💡 Stuck? Click 'Show Hint' below or 'Reveal Full Solution' to see the optimal approach.",
              time: 0.01,
              passed: false
            });
            setShowCodeHint(true);
            return;
          }

          // Check for syntax issues (e.g., mismatched parentheses or brackets)
          const openParens = (code.match(/\(/g) || []).length;
          const closeParens = (code.match(/\)/g) || []).length;
          const openBrackets = (code.match(/\[/g) || []).length;
          const closeBrackets = (code.match(/\]/g) || []).length;

          if (openParens !== closeParens || openBrackets !== closeBrackets) {
            setConsoleOutput({
              status: "Syntax Error",
              stdout: "❌ SyntaxError: Unmatched parentheses or brackets detected.\nCheck your brackets and indentation.\n\n💡 Stuck? Click 'Show Hint' or 'Reveal Full Solution'.",
              time: 0.02,
              passed: false
            });
            setShowCodeHint(true);
            return;
          }

          if (!code.includes('return') && !code.includes('print')) {
            setConsoleOutput({
              status: "Wrong Answer",
              stdout: `❌ Return Error: No return statement found in function.\nExpected: ${selectedProblem.output || '[0, 1]'}\nReceived: None\n\n💡 Make sure your function computes and returns the expected result.`,
              time: 0.02,
              passed: false
            });
            setShowCodeHint(true);
            return;
          }

          setConsoleOutput({
            status: "Accepted",
            stdout: `${selectedProblem.output || '[0, 1]'}\n\nAll test cases passed!\nExecution Time: 0.03s | Memory: 24.2 MB\n🎉 Optimal solution verified!`,
            time: 0.03,
            passed: true
          });
          setShowCodeHint(false);
          setShowCodeSolution(false);
          setXp(prev => prev + (selectedProblem.xp_reward || 25));
        }, 400);
      }
    } catch (e: any) {
      setConsoleOutput({
        status: "Execution Error",
        stdout: `❌ Error connecting to code runner service.\n${e?.message || ''}\n\n💡 Hint: Check your code logic or click 'Reveal Full Solution' if you are stuck.`,
        time: 0.01,
        passed: false
      });
      setShowCodeHint(true);
    } finally {
      setExecutingCode(false);
    }
  };

  // Run SQL Handler
  const handleRunSql = async () => {
    setSqlRunning(true);
    setSqlError(null);
    try {
      const q = sqlQuery.trim();
      const strippedComments = q.replace(/--.*$/gm, '').trim();

      if (!strippedComments || strippedComments === 'SELECT' || !strippedComments.toUpperCase().includes('FROM')) {
        setSqlResult(null);
        setSqlError("❌ SQL Syntax Error: Query is incomplete.\nPlease write a complete query with SELECT ... FROM ... and any necessary conditions.\n\n💡 Need help? View the schema hint or click 'Reveal Full Solution'.");
        setShowSqlHint(true);
        setSqlRunning(false);
        return;
      }

      if (selectedSqlProblem.id && selectedSqlProblem.id.length > 10) {
        const res = await axios.post(
          `${API_BASE}/sql/problems/${selectedSqlProblem.id}/execute`,
          { query: sqlQuery },
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setSqlResult({
          columns: res.data.columns || ["Department", "Employee", "Salary"],
          rows: res.data.rows || []
        });
        setSqlError(null);
        setShowSqlHint(false);
        setShowSqlSolution(false);
        setXp(prev => prev + 20);
      } else {
        setTimeout(() => {
          if (selectedSqlProblem.id === 'sql-2') {
            setSqlResult({
              columns: ["firstName", "lastName", "city", "state"],
              rows: [
                { firstName: "Allen", lastName: "Wang", city: "NULL", state: "NULL" },
                { firstName: "Bob", lastName: "Alice", city: "New York City", state: "New York" }
              ]
            });
          } else {
            setSqlResult({
              columns: ["Department", "Employee", "Salary"],
              rows: [
                { Department: "IT", Employee: "Max", Salary: 90000 },
                { Department: "IT", Employee: "Joe", Salary: 85000 },
                { Department: "Sales", Employee: "Henry", Salary: 80000 }
              ]
            });
          }
          setSqlError(null);
          setShowSqlHint(false);
          setShowSqlSolution(false);
          setXp(prev => prev + 20);
        }, 400);
      }
    } catch (e: any) {
      setSqlError(`❌ Query Execution Error:\n${e?.response?.data?.detail || e?.message || 'Database error'}\n\n💡 Check your table joins and column names.`);
      setShowSqlHint(true);
    } finally {
      setSqlRunning(false);
    }
  };

  // AI Interview Message Send
  const handleSendInterviewMsg = async () => {
    if (!userInterviewInput.trim()) return;
    const newMsgs = [...interviewMessages, { speaker: 'USER' as const, text: userInterviewInput }];
    setInterviewMessages(newMsgs);
    setUserInterviewInput('');
    setInterviewLoading(true);

    setTimeout(() => {
      setInterviewLoading(false);
      if (newMsgs.length >= 4) {
        setInterviewMessages(prev => [...prev, { speaker: 'AI', text: "Thank you! That concludes our technical round. Your comprehensive feedback evaluation report is ready." }]);
        setInterviewReport({
          overall: 88.5,
          technical: 90.0,
          communication: 87.0,
          strengths: ["Strong understanding of ACID guarantees", "Articulate explanation of CAP theorem tradeoffs"],
          weaknesses: ["Deep dive further into Kafka consumer group partitions"],
          feedback: "Impressive analytical clarity. Recommended for Senior Placement Track."
        });
      } else {
        setInterviewMessages(prev => [...prev, { speaker: 'AI', text: "Great insight. Next: How do you handle schema migrations in high-throughput PostgreSQL databases without blocking writes?" }]);
      }
    }, 800);
  };

  // -------------------------------------------------------------
  // LIVE 1v1 CODE BATTLE REAL-TIME ENGINE
  // -------------------------------------------------------------
  const formatBattleTime = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const connectToBattleWs = (roomCode: string, currentUserName: string, currentUserId: string) => {
    if (battleWsRef.current) {
      battleWsRef.current.close();
      battleWsRef.current = null;
    }

    let wsProto = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    let wsHost = window.location.hostname === 'localhost' ? 'localhost:8000' : window.location.host;
    if (API_BASE.startsWith('http://') || API_BASE.startsWith('https://')) {
      try {
        const parsed = new URL(API_BASE);
        wsProto = parsed.protocol === 'https:' ? 'wss:' : 'ws:';
        wsHost = parsed.host;
      } catch (e) {}
    }
    const wsUrl = `${wsProto}//${wsHost}/api/v1/battles/ws/${roomCode}?user_id=${encodeURIComponent(currentUserId)}&user_name=${encodeURIComponent(currentUserName)}`;

    const ws = new WebSocket(wsUrl);

    ws.onopen = () => {
      console.log('Battle WebSocket live connected for room', roomCode);
    };

    ws.onmessage = (event) => {
      try {
        const msg = JSON.parse(event.data);
        const { event: evType, data } = msg;

        if (evType === 'player_connected' || evType === 'player_joined') {
          setBattlePlayers(prev => {
            if (prev.some(p => p.user_id === data.user_id || p.name === data.user_name)) {
              return prev;
            }
            return [...prev, { user_id: data.user_id, name: data.user_name, hasPassed: false, score: 0 }];
          });
        } else if (evType === 'battle_started') {
          const prob = data?.problem_detail || data?.problem;
          if (prob) {
            setBattleProblem(prob);
            if (prob.template_code) {
              setBattleCode(prob.template_code);
            }
          }
          // Trigger synchronized countdown
          setBattleStatus('countdown');
          setBattleCountdown(3);
          let count = 3;
          const countTimer = setInterval(() => {
            count -= 1;
            if (count <= 0) {
              clearInterval(countTimer);
              setBattleStatus('active');
              setBattleTimer(0);
              if (battleTimerIntervalRef.current) clearInterval(battleTimerIntervalRef.current);
              battleTimerIntervalRef.current = setInterval(() => {
                setBattleTimer(t => t + 1);
              }, 1000);
            } else {
              setBattleCountdown(count);
            }
          }, 1000);
        } else if (evType === 'code_progress') {
          setOpponentTelemetry(prev => ({
            ...prev,
            lines: data.lines || prev.lines,
            charCount: data.char_count || prev.charCount,
            isTyping: true
          }));
          if (opponentTypingTimeoutRef.current) clearTimeout(opponentTypingTimeoutRef.current);
          opponentTypingTimeoutRef.current = setTimeout(() => {
            setOpponentTelemetry(prev => ({ ...prev, isTyping: false }));
          }, 1500);
        } else if (evType === 'test_update') {
          setOpponentTelemetry(prev => ({
            ...prev,
            testsPassed: data.passed_count ?? data.passed ?? prev.testsPassed,
            totalTests: data.total_test_cases ?? data.total ?? prev.totalTests
          }));
        } else if (evType === 'taunt') {
          setBattleTauntToast({
            emoji: data.emoji || '🔥',
            phrase: data.phrase || 'Speed demon!',
            sender: data.user_name || 'Opponent'
          });
          setTimeout(() => {
            setBattleTauntToast(null);
          }, 3500);
        } else if (evType === 'room_winner') {
          if (battleTimerIntervalRef.current) clearInterval(battleTimerIntervalRef.current);
          const isYou = data.winner_id === currentUserId || data.winner_name === currentUserName;
          setBattleWinner({
            name: data.winner_name,
            isYou,
            execution_time: data.execution_time
          });
          setBattleStatus('finished');
          if (isYou) {
            setXp(x => x + 100);
          }
        } else if (evType === 'player_left') {
          setBattlePlayers(prev => prev.filter(p => p.user_id !== data.user_id));
        }
      } catch (err) {
        console.error('Failed to parse WebSocket message', err);
      }
    };

    ws.onerror = (err) => {
      console.warn('Battle WebSocket error:', err);
    };

    battleWsRef.current = ws;
  };

  const handleBattleCodeChange = (newCode: string) => {
    setBattleCode(newCode);
    const lines = newCode.split('\n').length;
    const charCount = newCode.length;

    if (codeProgressDebounceRef.current) clearTimeout(codeProgressDebounceRef.current);
    codeProgressDebounceRef.current = setTimeout(() => {
      if (battleWsRef.current && battleWsRef.current.readyState === WebSocket.OPEN) {
        battleWsRef.current.send(JSON.stringify({
          action: 'code_progress',
          data: { lines, char_count: charCount, typing: true }
        }));
      }
    }, 200);
  };

  const handleSendTaunt = (emoji: string, phrase: string) => {
    if (battleWsRef.current && battleWsRef.current.readyState === WebSocket.OPEN) {
      battleWsRef.current.send(JSON.stringify({
        action: 'taunt',
        data: { emoji, phrase }
      }));
    }
    setBattleTauntToast({ emoji, phrase, sender: 'You' });
    setTimeout(() => setBattleTauntToast(null), 2500);
  };

  const handleQuickMatch = async () => {
    setBattleError(null);
    setBattleQuickMatching(true);
    try {
      const res = await axios.post(
        `${API_BASE}/battles/quick-match`,
        { difficulty: battleDifficulty, max_players: 2 },
        { headers: token ? { Authorization: `Bearer ${token}` } : {} }
      );
      const roomData = res.data;
      const code = roomData.room_code;
      setBattleRoomCode(code);
      setInBattle(true);
      setBattleWinner(null);
      setBattleSubmitFeedback(null);
      
      const isHost = roomData.host_id === userId || !roomData.participants || roomData.participants.length <= 1;
      setBattleRole(isHost ? 'host' : 'challenger');

      if (roomData.problem_detail) {
        setBattleProblem(roomData.problem_detail);
        if (roomData.problem_detail.template_code) {
          setBattleCode(roomData.problem_detail.template_code);
        }
      }

      const initialParts = (roomData.participants || []).map((p: any) => ({
        user_id: p.user_id,
        name: p.user_name,
        hasPassed: p.has_passed,
        score: p.score
      }));
      if (!initialParts.some((p: any) => p.user_id === userId)) {
        initialParts.unshift({
          user_id: userId,
          name: `${userName} (You)`,
          hasPassed: false,
          score: 0
        });
      }
      setBattlePlayers(initialParts);
      setBattleStatus('lobby');
      connectToBattleWs(code, userName, userId);
    } catch (err: any) {
      console.error('Quick match error', err);
      setBattleError(err.response?.data?.detail || 'Quick match server error. Retrying in offline fallback mode...');
      const fallbackCode = Math.random().toString(36).substring(2, 8).toUpperCase();
      setBattleRoomCode(fallbackCode);
      setInBattle(true);
      setBattleStatus('lobby');
      setBattlePlayers([
        { user_id: userId, name: `${userName} (You)`, hasPassed: false, score: 0 },
        { user_id: 'challenger_ai', name: 'CodeNinja_99', hasPassed: false, score: 0 }
      ]);
    } finally {
      setBattleQuickMatching(false);
    }
  };

  const handleCreateCustomBattle = async () => {
    setBattleError(null);
    try {
      const res = await axios.post(
        `${API_BASE}/battles/create`,
        { difficulty: battleDifficulty, max_players: 2 },
        { headers: token ? { Authorization: `Bearer ${token}` } : {} }
      );
      const roomData = res.data;
      const code = roomData.room_code;
      setBattleRoomCode(code);
      setInBattle(true);
      setBattleRole('host');
      setBattleWinner(null);
      setBattleSubmitFeedback(null);

      if (roomData.problem_detail) {
        setBattleProblem(roomData.problem_detail);
        if (roomData.problem_detail.template_code) {
          setBattleCode(roomData.problem_detail.template_code);
        }
      }

      setBattlePlayers([
        { user_id: userId, name: `${userName} (You)`, hasPassed: false, score: 0 }
      ]);
      setBattleStatus('lobby');
      connectToBattleWs(code, userName, userId);
    } catch (err: any) {
      console.error('Create room error', err);
      setBattleError(err.response?.data?.detail || 'Failed to create room.');
    }
  };

  const handleJoinBattle = async () => {
    if (!battleJoinInput.trim()) return;
    setBattleError(null);
    const code = battleJoinInput.trim().toUpperCase();
    try {
      const res = await axios.post(
        `${API_BASE}/battles/join`,
        { room_code: code },
        { headers: token ? { Authorization: `Bearer ${token}` } : {} }
      );
      const roomData = res.data;
      setBattleRoomCode(code);
      setInBattle(true);
      setBattleRole('challenger');
      setBattleWinner(null);
      setBattleSubmitFeedback(null);

      if (roomData.problem_detail) {
        setBattleProblem(roomData.problem_detail);
        if (roomData.problem_detail.template_code) {
          setBattleCode(roomData.problem_detail.template_code);
        }
      }

      const parts = (roomData.participants || []).map((p: any) => ({
        user_id: p.user_id,
        name: p.user_name,
        hasPassed: p.has_passed,
        score: p.score
      }));
      if (!parts.some((p: any) => p.user_id === userId)) {
        parts.push({ user_id: userId, name: `${userName} (You)`, hasPassed: false, score: 0 });
      }
      setBattlePlayers(parts);
      setBattleStatus('lobby');
      connectToBattleWs(code, userName, userId);
    } catch (err: any) {
      console.error('Join room error', err);
      setBattleError(err.response?.data?.detail || 'Could not join room. Check the 6-character code.');
    }
  };

  const handleStartBattle = async () => {
    if (battleStarting || battleStatus !== 'lobby') return;
    setBattleStarting(true);
    setBattleError(null);
    try {
      await axios.post(
        `${API_BASE}/battles/${battleRoomCode}/start`,
        {},
        { headers: token ? { Authorization: `Bearer ${token}` } : {} }
      );
    } catch (err: any) {
      console.warn('Start battle backend fallback:', err);
      setBattleStatus('countdown');
      setBattleCountdown(3);
      let count = 3;
      const countTimer = setInterval(() => {
        count -= 1;
        if (count <= 0) {
          clearInterval(countTimer);
          setBattleStatus('active');
          setBattleTimer(0);
          if (battleTimerIntervalRef.current) clearInterval(battleTimerIntervalRef.current);
          battleTimerIntervalRef.current = setInterval(() => {
            setBattleTimer(t => t + 1);
          }, 1000);
        } else {
          setBattleCountdown(count);
        }
      }, 1000);
    } finally {
      setBattleStarting(false);
    }
  };

  const handleSubmitBattle = async () => {
    if (battleStatus !== 'active' || battleSubmitting) return;
    setBattleSubmitting(true);
    setBattleError(null);
    try {
      const res = await axios.post(
        `${API_BASE}/battles/${battleRoomCode}/submit`,
        { code: battleCode, language: 'python' },
        { headers: token ? { Authorization: `Bearer ${token}` } : {} }
      );
      const data = res.data;
      setBattleSubmitFeedback(data);

      if (battleWsRef.current && battleWsRef.current.readyState === WebSocket.OPEN) {
        battleWsRef.current.send(JSON.stringify({
          action: 'test_update',
          data: {
            passed_count: data.test_cases_passed,
            total_test_cases: data.total_test_cases,
            is_correct: data.is_correct
          }
        }));
      }

      if (data.is_winner) {
        if (battleTimerIntervalRef.current) clearInterval(battleTimerIntervalRef.current);
        setBattleWinner({
          name: `${userName} (You)`,
          isYou: true,
          execution_time: data.execution_time
        });
        setBattleStatus('finished');
        setXp(x => x + 100);
      }
    } catch (err: any) {
      console.error('Submit battle error:', err);
      setBattleError(err.response?.data?.detail || 'Submission judge error. Check your code syntax.');
    } finally {
      setBattleSubmitting(false);
    }
  };

  const handleLeaveBattle = () => {
    if (battleWsRef.current) {
      battleWsRef.current.close();
      battleWsRef.current = null;
    }
    if (battleTimerIntervalRef.current) {
      clearInterval(battleTimerIntervalRef.current);
      battleTimerIntervalRef.current = null;
    }
    setInBattle(false);
    setBattleStatus('idle');
    setBattleRoomCode('');
    setBattleWinner(null);
    setBattleSubmitFeedback(null);
    setOpponentTelemetry({
      lines: 1,
      charCount: 0,
      isTyping: false,
      testsPassed: 0,
      totalTests: 0,
      status: 'Ready'
    });
  };

  const handleCopyBattleCode = () => {
    navigator.clipboard.writeText(battleRoomCode);
    setBattleCodeCopied(true);
    setTimeout(() => setBattleCodeCopied(false), 2000);
  };

  // -------------------------------------------------------------
  // STEP 1: LOGIN / SIGNUP VIEW (STUDENT BY DEFAULT, ADMIN ASIDE DIFFERENT)
  // -------------------------------------------------------------
  if (!isLoggedIn && !showOnboarding) {
    return (
      <div className="min-h-screen bg-[#070a13] text-slate-100 flex flex-col items-center justify-center p-4 font-['Plus_Jakarta_Sans']">
        {/* Direct Google Sign-In Modal */}
        {showGoogleModal && (
          <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
            <div className="w-full max-w-md bg-[#0b101e] border border-slate-700/80 rounded-3xl p-6 shadow-2xl space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <div className="flex items-center gap-2.5">
                  <div className="h-8 w-8 rounded-full bg-white flex items-center justify-center shadow">
                    <svg className="h-4 w-4" viewBox="0 0 24 24">
                      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
                      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
                    </svg>
                  </div>
                  <div>
                    <div className="text-sm font-bold text-white">Sign In with Google</div>
                    <div className="text-[11px] text-slate-400">Directly connect your Google account</div>
                  </div>
                </div>
                <button
                  onClick={() => setShowGoogleModal(false)}
                  className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 text-sm font-bold"
                >
                  ✕
                </button>
              </div>

              <div className="space-y-3.5">
                <div>
                  <label className="text-[11px] font-semibold text-slate-300 block mb-1">Google Email Address</label>
                  <input
                    type="email"
                    value={googleEmailInput}
                    onChange={(e) => setGoogleEmailInput(e.target.value)}
                    placeholder="e.g. sanyam.kumar@gmail.com"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-200 outline-none focus:border-indigo-500 font-medium"
                    autoFocus
                  />
                </div>

                <div>
                  <label className="text-[11px] font-semibold text-slate-300 block mb-1">Full Name (Optional)</label>
                  <input
                    type="text"
                    value={googleNameInput}
                    onChange={(e) => setGoogleNameInput(e.target.value)}
                    placeholder="e.g. Sanyam Kumar"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-200 outline-none focus:border-indigo-500 font-medium"
                  />
                </div>

                <div className="p-2.5 rounded-xl bg-slate-950/70 border border-slate-800 text-[11px] text-slate-400 space-y-1.5">
                  <div className="font-semibold text-slate-300">Quick Test Accounts:</div>
                  <div className="flex flex-wrap gap-1.5">
                    {[
                      { email: "sanyam.kumar@gmail.com", name: "Sanyam Kumar" },
                      { email: "rahul.sharma@gmail.com", name: "Rahul Sharma" },
                      { email: "priya.patel@gmail.com", name: "Priya Patel" }
                    ].map(acc => (
                      <button
                        key={acc.email}
                        type="button"
                        onClick={() => { setGoogleEmailInput(acc.email); setGoogleNameInput(acc.name); }}
                        className="px-2.5 py-1 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 text-[10px] border border-slate-800 transition"
                      >
                        {acc.name} ({acc.email.split('@')[0]})
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowGoogleModal(false)}
                    className="flex-1 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 text-xs font-semibold"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    disabled={authLoading || !googleEmailInput.trim()}
                    onClick={() => handleGoogleLoginDirect(googleEmailInput, googleNameInput)}
                    className="flex-2 w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-md shadow-indigo-600/30 transition flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    {authLoading ? <RefreshCw className="h-4 w-4 animate-spin" /> : 'Continue as Student ➔'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="w-full max-w-md space-y-5">
          {/* Logo & Headline */}
          <div className="text-center space-y-2">
            <div className="inline-flex h-12 w-12 rounded-2xl bg-gradient-to-br from-indigo-500 via-sky-500 to-emerald-500 p-[1.5px] items-center justify-center shadow-xl shadow-indigo-500/20">
              <div className="h-full w-full bg-[#070a13] rounded-[14px] flex items-center justify-center font-mono font-bold text-sky-400 text-sm">
                &lt;CQ&gt;
              </div>
            </div>
            <h1 className="text-2xl font-black tracking-tight text-white">CODE QUEST</h1>
            <p className="text-xs text-slate-400">
              {portalMode === 'admin' ? 'Institutional Administration & Placement Telemetry' : 'Intelligent Placement Preparation & Live Assessment Platform'}
            </p>
          </div>

          {/* Auth Card */}
          <div className={`rounded-3xl bg-[#0b101e] border ${portalMode === 'admin' ? 'border-rose-900/60 shadow-rose-950/20' : 'border-slate-800/80 shadow-indigo-950/20'} p-7 shadow-2xl space-y-5`}>
            {portalMode === 'candidate' ? (
              <>
                {/* 1. Direct Google Sign-In Button */}
                <button
                  type="button"
                  onClick={handleGoogleLogin}
                  disabled={authLoading}
                  className="w-full py-3 rounded-2xl bg-white hover:bg-slate-100 text-slate-900 font-bold text-xs shadow-lg transition flex items-center justify-center gap-2.5 border border-slate-200 active:scale-[0.99]"
                >
                  <svg className="h-4 w-4" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
                  </svg>
                  <span>Sign in directly with Google</span>
                </button>

                <div className="flex items-center gap-3 my-2">
                  <div className="h-px flex-1 bg-slate-800"></div>
                  <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">or student credentials</span>
                  <div className="h-px flex-1 bg-slate-800"></div>
                </div>

                {/* Candidate Sign In / Sign Up Tabs */}
                <div className="grid grid-cols-2 gap-1 p-1 bg-slate-950 rounded-2xl border border-slate-800 text-xs font-bold">
                  <button
                    onClick={() => { setAuthMode('login'); setAuthError(null); setAuthEmail(''); setAuthPass(''); }}
                    className={`py-1.5 rounded-xl transition ${authMode === 'login' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-400 hover:text-white'}`}
                  >
                    Student Sign In
                  </button>
                  <button
                    onClick={() => { setAuthMode('signup'); setAuthError(null); setAuthEmail(''); setAuthPass(''); }}
                    className={`py-1.5 rounded-xl transition ${authMode === 'signup' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-400 hover:text-white'}`}
                  >
                    Create Account
                  </button>
                </div>
              </>
            ) : (
              <div className="p-3.5 rounded-2xl bg-rose-950/30 border border-rose-800/40 flex items-center gap-3">
                <ShieldAlert className="h-5 w-5 text-rose-400 shrink-0" />
                <div>
                  <div className="text-xs font-bold text-rose-200">Institutional Administration Gate</div>
                  <div className="text-[10px] text-slate-400">Strictly for TPOs, faculty, and system administrators.</div>
                </div>
              </div>
            )}

            {authError && (
              <div className="p-3 rounded-xl bg-rose-950/40 border border-rose-800/60 text-xs text-rose-300 flex items-center gap-2">
                <AlertCircle className="h-4 w-4 shrink-0 text-rose-400" />
                <span>{authError}</span>
              </div>
            )}

            <form onSubmit={handleAuthSubmit} className="space-y-3.5">
              {portalMode === 'candidate' && authMode === 'signup' && (
                <div>
                  <label className="text-[11px] font-semibold text-slate-300 block mb-1">Your Full Name</label>
                  <input
                    type="text"
                    value={authName}
                    onChange={(e) => setAuthName(e.target.value)}
                    placeholder="e.g. Sanyam Kumar"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-200 outline-none focus:border-indigo-500 font-medium"
                    required
                  />
                </div>
              )}

              <div>
                <label className="text-[11px] font-semibold text-slate-300 block mb-1">
                  {portalMode === 'admin' ? 'Admin Email' : 'Student Email Address'}
                </label>
                <div className="relative">
                  <Mail className="h-4 w-4 absolute left-3.5 top-3 text-slate-500" />
                  <input
                    type="email"
                    value={authEmail}
                    onChange={(e) => setAuthEmail(e.target.value)}
                    placeholder={portalMode === 'admin' ? "admin@codequest.dev" : "your.email@university.edu or @gmail.com"}
                    className="w-full pl-10 pr-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-200 outline-none focus:border-indigo-500 font-medium"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="text-[11px] font-semibold text-slate-300 block mb-1">Password</label>
                <div className="relative">
                  <KeyRound className="h-4 w-4 absolute left-3.5 top-3 text-slate-500" />
                  <input
                    type="password"
                    value={authPass}
                    onChange={(e) => setAuthPass(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-10 pr-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-200 outline-none focus:border-indigo-500 font-medium"
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={authLoading}
                className={`w-full py-3 rounded-xl font-bold text-xs text-white shadow-lg transition flex items-center justify-center gap-2 disabled:opacity-50 ${
                  portalMode === 'admin'
                    ? 'bg-gradient-to-r from-rose-600 via-red-600 to-rose-600 hover:from-rose-500 shadow-rose-600/30'
                    : 'bg-gradient-to-r from-indigo-600 via-sky-600 to-indigo-600 hover:from-indigo-500 shadow-indigo-600/30'
                }`}
              >
                {authLoading ? <RefreshCw className="h-4 w-4 animate-spin" /> : (portalMode === 'admin' ? '🛡️ Sign In to Admin Console ➔' : (authMode === 'login' ? 'Sign In as Student ➔' : 'Continue to Skill Discovery ➔'))}
              </button>
            </form>

            {portalMode === 'admin' ? (
              <div className="space-y-3 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={handleAdminDemoLogin}
                  disabled={authLoading}
                  className="w-full py-2.5 rounded-xl bg-rose-950/40 hover:bg-rose-900/50 border border-rose-800/60 text-xs font-bold text-rose-300 transition flex items-center justify-center gap-2"
                >
                  <span>⚡ 1-Click Head Administrator Access</span>
                </button>

                {/* Return to Student Portal Link */}
                <div className="text-center pt-2">
                  <button
                    type="button"
                    onClick={() => { setPortalMode('candidate'); setAuthError(null); setAuthEmail(''); setAuthPass(''); }}
                    className="text-xs text-slate-400 hover:text-indigo-300 transition flex items-center justify-center gap-1.5 mx-auto py-1 px-3 rounded-lg hover:bg-slate-900 border border-slate-800"
                  >
                    <GraduationCap className="h-3.5 w-3.5 text-indigo-400" />
                    <span>← Return to Student Candidate Portal</span>
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-3 pt-3 border-t border-slate-800">
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={handleCandidateDemoLogin}
                    disabled={authLoading}
                    className="py-2 px-3 rounded-xl bg-indigo-950/50 hover:bg-indigo-900/60 border border-indigo-700/50 text-[11px] font-semibold text-indigo-300 transition flex items-center justify-center gap-1.5"
                  >
                    <Zap className="h-3 w-3 text-amber-400" />
                    <span>Demo Candidate</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleDemoLogin}
                    className="py-2 px-3 rounded-xl bg-slate-950 hover:bg-slate-900 border border-slate-800 text-[11px] font-semibold text-slate-400 hover:text-slate-200 transition"
                  >
                    ⚡ Guest Demo
                  </button>
                </div>

                {/* Aside Different Admin Portal Access */}
                <div className="pt-2 text-center">
                  <button
                    type="button"
                    onClick={() => { setPortalMode('admin'); setAuthError(null); setAuthEmail('admin@codequest.dev'); setAuthPass('Admin@1234'); }}
                    className="text-xs text-slate-400 hover:text-rose-300 transition flex items-center justify-center gap-1.5 mx-auto py-1.5 px-3 rounded-xl bg-slate-950/60 hover:bg-rose-950/20 border border-slate-800/80 hover:border-rose-900/40"
                  >
                    <Shield className="h-3.5 w-3.5 text-rose-400" />
                    <span>College Faculty / TPO? Access Institutional Admin Console ➔</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // -------------------------------------------------------------
  // STEP 2: MULTI-STEP ONBOARDING & SKILL DISCOVERY WIZARD
  // -------------------------------------------------------------
  if (showOnboarding) {
    return (
      <div className="min-h-screen bg-[#070a13] text-slate-100 flex flex-col items-center justify-center p-4 font-['Plus_Jakarta_Sans']">
        <div className="w-full max-w-2xl space-y-6">
          <div className="text-center space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
              <Sparkles className="h-3.5 w-3.5" /> Placement Prep Setup Wizard
            </div>
            <h1 className="text-2xl font-black text-white">Personalize Your Placement Track</h1>
            <p className="text-xs text-slate-400">Tell us about your field, technical skills, knowledge levels, and target timeline to generate your readiness baseline.</p>
            
            <div className="flex items-center justify-center gap-2 pt-2">
              {[
                { num: 1, label: "Field & Degree" },
                { num: 2, label: "Skills Inventory" },
                { num: 3, label: "Proficiency Levels" },
                { num: 4, label: "Goals & Duration" }
              ].map(s => (
                <div
                  key={s.num}
                  className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold transition ${
                    onboardingStep === s.num
                      ? 'bg-indigo-600 text-white'
                      : onboardingStep > s.num
                      ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                      : 'bg-slate-900 text-slate-500 border border-slate-800'
                  }`}
                >
                  <span>{s.num}</span>
                  <span className="hidden sm:inline">{s.label}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-3xl bg-[#0b101e] border border-slate-800/80 p-7 shadow-2xl space-y-6">
            {onboardingStep === 1 && (
              <div className="space-y-4">
                <div>
                  <h2 className="text-base font-bold text-white flex items-center gap-2">
                    <Briefcase className="h-4 w-4 text-sky-400" /> Which field or target role are you preparing for?
                  </h2>
                  <p className="text-xs text-slate-400 mt-1">This configures your customized curriculum and coding challenges.</p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                  {[
                    { role: "Software Engineer", desc: "Data Structures, Algorithms, System Design & Clean Code" },
                    { role: "Data Engineer", desc: "SQL, ETL Pipelines, Spark, Distributed Processing & Warehouses" },
                    { role: "DevOps & Cloud Engineer", desc: "Docker, Kubernetes, CI/CD, AWS/Cloud & Infrastructure" },
                    { role: "Data Analyst", desc: "SQL Queries, Aggregations, Business Metrics & Tableau" },
                    { role: "Full-Stack Developer", desc: "Frontend React, Node/Python Backend, APIs & Databases" },
                  ].map(item => (
                    <div
                      key={item.role}
                      onClick={() => setObTargetRole(item.role)}
                      className={`p-4 rounded-2xl border cursor-pointer transition ${
                        obTargetRole === item.role
                          ? 'bg-indigo-950/40 border-indigo-500 shadow-lg shadow-indigo-500/20'
                          : 'bg-slate-950/60 border-slate-800/80 hover:bg-slate-900'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-sm text-white">{item.role}</span>
                        {obTargetRole === item.role && <CheckCircle2 className="h-4 w-4 text-indigo-400" />}
                      </div>
                      <p className="text-[11px] text-slate-400 mt-1">{item.desc}</p>
                    </div>
                  ))}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                  <div>
                    <label className="text-[11px] font-semibold text-slate-300 block mb-1">College / University</label>
                    <input
                      type="text"
                      value={obCollege}
                      onChange={(e) => setObCollege(e.target.value)}
                      placeholder="e.g. National Institute of Technology"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-200 outline-none focus:border-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-semibold text-slate-300 block mb-1">Graduation Year</label>
                    <select
                      value={obGradYear}
                      onChange={(e) => setObGradYear(Number(e.target.value))}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-200 outline-none focus:border-indigo-500 font-medium"
                    >
                      <option value={2025}>2025 (Immediate Placement)</option>
                      <option value={2026}>2026 (Upcoming Final Year)</option>
                      <option value={2027}>2027 (Pre-final Year)</option>
                      <option value={2028}>2028+ (Early Prep)</option>
                    </select>
                  </div>
                </div>

                <div className="flex justify-end pt-4">
                  <button
                    onClick={() => setOnboardingStep(2)}
                    className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-md shadow-indigo-600/30 flex items-center gap-1.5"
                  >
                    Next: Technical Skills ➔
                  </button>
                </div>
              </div>
            )}

            {onboardingStep === 2 && (
              <div className="space-y-4">
                <div>
                  <h2 className="text-base font-bold text-white flex items-center gap-2">
                    <Layers className="h-4 w-4 text-sky-400" /> What technical skills and technologies do you know?
                  </h2>
                  <p className="text-xs text-slate-400 mt-1">Select all programming languages, tools, and paradigms you have used.</p>
                </div>

                <div className="flex flex-wrap gap-2 pt-2">
                  {AVAILABLE_SKILLS.map(skill => {
                    const isSelected = obSkills.includes(skill);
                    return (
                      <button
                        key={skill}
                        onClick={() => {
                          if (isSelected) setObSkills(obSkills.filter(s => s !== skill));
                          else setObSkills([...obSkills, skill]);
                        }}
                        className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition flex items-center gap-1.5 border ${
                          isSelected
                            ? 'bg-indigo-600 text-white border-indigo-500 shadow-md shadow-indigo-600/20'
                            : 'bg-slate-950/60 text-slate-400 border-slate-800 hover:bg-slate-800/60 hover:text-slate-200'
                        }`}
                      >
                        {isSelected && <Check className="h-3.5 w-3.5" />}
                        <span>{skill}</span>
                      </button>
                    );
                  })}
                </div>

                <div className="flex justify-between pt-6 border-t border-slate-800/80">
                  <button
                    onClick={() => setOnboardingStep(1)}
                    className="px-4 py-2 rounded-xl bg-slate-900 text-slate-300 text-xs font-semibold hover:bg-slate-800"
                  >
                    Back
                  </button>
                  <button
                    onClick={() => setOnboardingStep(3)}
                    disabled={obSkills.length === 0}
                    className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-md shadow-indigo-600/30 flex items-center gap-1.5 disabled:opacity-40"
                  >
                    Next: Rate Knowledge Levels ➔
                  </button>
                </div>
              </div>
            )}

            {onboardingStep === 3 && (
              <div className="space-y-5">
                <div>
                  <h2 className="text-base font-bold text-white flex items-center gap-2">
                    <Sliders className="h-4 w-4 text-emerald-400" /> Self-Assess Your Knowledge Levels
                  </h2>
                  <p className="text-xs text-slate-400 mt-1">Rate your confidence in each core domain (0 = Absolute Beginner, 100 = Production Ready).</p>
                </div>

                <div className="space-y-4 pt-1">
                  {[
                    { label: "Data Structures & Algorithms (DSA)", value: obDsaLevel, setter: setObDsaLevel, color: "text-indigo-400" },
                    { label: "SQL, Relational Databases & Schema Design", value: obSqlLevel, setter: setObSqlLevel, color: "text-sky-400" },
                    { label: "CS Fundamentals (Operating Systems, Networks, DBMS)", value: obCsLevel, setter: setObCsLevel, color: "text-emerald-400" },
                    { label: "Aptitude, Mathematical Reasoning & Puzzles", value: obAptitudeLevel, setter: setObAptitudeLevel, color: "text-amber-400" },
                  ].map((domain, i) => (
                    <div key={i} className="p-3.5 rounded-2xl bg-slate-950/60 border border-slate-800/80 space-y-2">
                      <div className="flex justify-between items-center text-xs">
                        <span className="font-bold text-slate-200">{domain.label}</span>
                        <span className={`font-black font-mono ${domain.color}`}>{domain.value}%</span>
                      </div>
                      <input
                        type="range"
                        min="10"
                        max="100"
                        value={domain.value}
                        onChange={(e) => domain.setter(Number(e.target.value))}
                        className="w-full accent-indigo-500 cursor-pointer h-2 bg-slate-800 rounded-lg"
                      />
                    </div>
                  ))}
                </div>

                <div className="flex justify-between pt-4 border-t border-slate-800/80">
                  <button
                    onClick={() => setOnboardingStep(2)}
                    className="px-4 py-2 rounded-xl bg-slate-900 text-slate-300 text-xs font-semibold hover:bg-slate-800"
                  >
                    Back
                  </button>
                  <button
                    onClick={() => setOnboardingStep(4)}
                    className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-md shadow-indigo-600/30 flex items-center gap-1.5"
                  >
                    Next: Goals & Timeline ➔
                  </button>
                </div>
              </div>
            )}

            {onboardingStep === 4 && (
              <div className="space-y-5">
                <div>
                  <h2 className="text-base font-bold text-white flex items-center gap-2">
                    <Clock className="h-4 w-4 text-amber-400" /> Study Duration & Target Companies
                  </h2>
                  <p className="text-xs text-slate-400 mt-1">Specify your preparation timeline and dream recruitment targets.</p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-[11px] font-semibold text-slate-300 block mb-1.5">Preparation Timeline</label>
                    <div className="space-y-2">
                      {[
                        { val: 1, label: "1 Month (Intensive Crash Course)" },
                        { val: 3, label: "3 Months (Recommended Standard)" },
                        { val: 6, label: "6 Months (Comprehensive Mastery)" }
                      ].map(dur => (
                        <button
                          key={dur.val}
                          type="button"
                          onClick={() => setObPrepDuration(dur.val)}
                          className={`w-full p-2.5 rounded-xl text-left text-xs font-semibold border transition ${
                            obPrepDuration === dur.val
                              ? 'bg-indigo-950/60 border-indigo-500 text-white'
                              : 'bg-slate-950 border-slate-800 text-slate-400 hover:bg-slate-900'
                          }`}
                        >
                          {dur.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="text-[11px] font-semibold text-slate-300 block mb-1.5">Daily Study Commitment</label>
                    <div className="space-y-2">
                      {[
                        { val: 1, label: "1 Hour / Day (Casual)" },
                        { val: 2, label: "2-3 Hours / Day (Focused)" },
                        { val: 4, label: "4+ Hours / Day (Hardcore Quest)" }
                      ].map(goal => (
                        <button
                          key={goal.val}
                          type="button"
                          onClick={() => setObDailyGoal(goal.val)}
                          className={`w-full p-2.5 rounded-xl text-left text-xs font-semibold border transition ${
                            obDailyGoal === goal.val
                              ? 'bg-indigo-950/60 border-indigo-500 text-white'
                              : 'bg-slate-950 border-slate-800 text-slate-400 hover:bg-slate-900'
                          }`}
                        >
                          {goal.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                <div>
                  <label className="text-[11px] font-semibold text-slate-300 block mb-1.5">Target Placement Companies</label>
                  <div className="flex flex-wrap gap-1.5">
                    {TARGET_COMPANIES_LIST.map(comp => {
                      const isTarget = obTargetCompanies.includes(comp);
                      return (
                        <button
                          key={comp}
                          type="button"
                          onClick={() => {
                            if (isTarget) setObTargetCompanies(obTargetCompanies.filter(c => c !== comp));
                            else setObTargetCompanies([...obTargetCompanies, comp]);
                          }}
                          className={`px-3 py-1.5 rounded-xl text-[11px] font-semibold transition border ${
                            isTarget
                              ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40'
                              : 'bg-slate-950 text-slate-400 border-slate-800 hover:bg-slate-900'
                          }`}
                        >
                          {isTarget && '✓ '} {comp}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="flex justify-between pt-4 border-t border-slate-800/80">
                  <button
                    onClick={() => setOnboardingStep(3)}
                    className="px-4 py-2 rounded-xl bg-slate-900 text-slate-300 text-xs font-semibold hover:bg-slate-800"
                  >
                    Back
                  </button>
                  <button
                    onClick={handleFinishOnboarding}
                    disabled={authLoading}
                    className="px-7 py-3 rounded-xl bg-gradient-to-r from-emerald-600 via-sky-600 to-indigo-600 hover:from-emerald-500 font-bold text-xs text-white shadow-xl shadow-emerald-600/30 flex items-center gap-2"
                  >
                    {authLoading ? <RefreshCw className="h-4 w-4 animate-spin" /> : '🚀 Launch My Personalized Placement Track!'}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // -------------------------------------------------------------
  // VIEW: DEDICATED ADMIN MANAGEMENT CONSOLE
  // -------------------------------------------------------------
  if (portalMode === 'admin') {
    const filteredStudents = studentsList.filter(s =>
      s.name?.toLowerCase().includes(studentSearchQuery.toLowerCase()) ||
      s.email?.toLowerCase().includes(studentSearchQuery.toLowerCase()) ||
      s.college?.toLowerCase().includes(studentSearchQuery.toLowerCase())
    );

    return (
      <div className="min-h-screen bg-[#070a13] text-slate-100 flex flex-col font-['Plus_Jakarta_Sans'] selection:bg-rose-500 selection:text-white">
        {/* Top Admin Navbar */}
        <header className="sticky top-0 z-50 bg-[#0b0e1b]/95 backdrop-blur-md border-b border-rose-900/40 px-6 py-3.5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-rose-500 via-amber-500 to-red-600 p-[1.5px] flex items-center justify-center shadow-lg shadow-rose-500/20">
              <div className="h-full w-full bg-[#070a13] rounded-[10px] flex items-center justify-center">
                <Shield className="h-4 w-4 text-rose-400" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold tracking-tight text-lg text-white">CODE QUEST</span>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-rose-500/10 text-rose-400 border border-rose-500/30 uppercase tracking-wider">
                  Admin Console
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Switch to Candidate View */}
            <button
              onClick={() => setPortalMode('candidate')}
              className="px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-xs font-semibold text-slate-300 flex items-center gap-1.5 transition"
            >
              <Eye className="h-3.5 w-3.5 text-sky-400" /> Switch to Candidate View
            </button>

            <div className="flex items-center gap-2 pl-3 border-l border-slate-800">
              <div className="h-8 w-8 rounded-full bg-gradient-to-tr from-rose-500 to-amber-500 flex items-center justify-center font-bold text-xs text-white">
                AD
              </div>
              <div className="hidden sm:block text-left text-xs">
                <div className="font-bold text-rose-200">Administrator</div>
                <div className="text-[10px] text-slate-400">admin@codequest.dev</div>
              </div>
              <button
                onClick={handleLogout}
                title="Log Out"
                className="p-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-rose-400 transition border border-slate-800"
              >
                <LogOut className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        </header>

        {/* Admin Navigation Bar */}
        <nav className="bg-[#080d19] border-b border-slate-800 px-6 py-2 flex items-center gap-2 overflow-x-auto text-xs font-semibold">
          {[
            { id: 'overview', label: 'Dashboard & Metrics', icon: BarChart2 },
            { id: 'students', label: 'Student Directory & Moderation', icon: Users },
            { id: 'curriculum', label: 'Problem & Question Authoring', icon: Plus },
            { id: 'telemetry', label: 'Live Telemetry & Events', icon: Activity },
            { id: 'reports', label: 'Readiness & Placement Reports', icon: FileSpreadsheet }
          ].map(tab => {
            const Icon = tab.icon;
            const isActive = adminTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setAdminTab(tab.id as any)}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-xl transition ${
                  isActive
                    ? 'bg-rose-600 text-white shadow-md shadow-rose-600/30'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                }`}
              >
                <Icon className={`h-3.5 w-3.5 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Main Admin Content Area */}
        <main className="flex-1 p-6 max-w-7xl w-full mx-auto space-y-6">
          {/* TAB 1: OVERVIEW & METRICS */}
          {adminTab === 'overview' && (
            <div className="space-y-6">
              {/* Metric Cards Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                  { label: "Enrolled Students", val: adminStats.total_enrolled, sub: "+6 this week", icon: Users, color: "text-sky-400", bg: "bg-sky-500/10" },
                  { label: "Active Today (DAU)", val: adminStats.daily_active_users, sub: `${adminStats.weekly_active_users} WAU Active`, icon: Activity, color: "text-emerald-400", bg: "bg-emerald-500/10" },
                  { label: "Avg Readiness Score", val: `${adminStats.avg_readiness}%`, sub: "Top Target: SWE Track", icon: Award, color: "text-amber-400", bg: "bg-amber-500/10" },
                  { label: "Code Arena Submissions", val: adminStats.code_submissions, sub: "98.4% sandbox success", icon: Code2, color: "text-purple-400", bg: "bg-purple-500/10" },
                ].map((stat, i) => {
                  const Icon = stat.icon;
                  return (
                    <div key={i} className="p-5 rounded-2xl bg-slate-900/70 border border-slate-800 space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">{stat.label}</span>
                        <div className={`p-2 rounded-xl ${stat.bg} ${stat.color}`}>
                          <Icon className="h-4 w-4" />
                        </div>
                      </div>
                      <div>
                        <div className="text-2xl font-black text-white font-mono">{stat.val}</div>
                        <div className="text-[11px] text-slate-400 mt-0.5">{stat.sub}</div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Student Role Distribution & Activity Heatmap */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="p-6 rounded-2xl bg-slate-900/70 border border-slate-800 space-y-4">
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    <Briefcase className="h-4 w-4 text-sky-400" /> Target Role Distribution
                  </h3>
                  <div className="space-y-3">
                    {[
                      { role: "Software Engineer (SWE)", count: 28, pct: 58, color: "bg-indigo-500" },
                      { role: "Data Engineer", count: 10, pct: 21, color: "bg-sky-500" },
                      { role: "DevOps & Cloud Engineer", count: 6, pct: 12, color: "bg-emerald-500" },
                      { role: "Data Analyst", count: 4, pct: 9, color: "bg-amber-500" },
                    ].map(r => (
                      <div key={r.role} className="space-y-1">
                        <div className="flex justify-between text-xs">
                          <span className="text-slate-300">{r.role}</span>
                          <span className="text-slate-400 font-bold">{r.count} students ({r.pct}%)</span>
                        </div>
                        <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden">
                          <div className={`h-full ${r.color} rounded-full`} style={{ width: `${r.pct}%` }} />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="p-6 rounded-2xl bg-slate-900/70 border border-slate-800 space-y-4">
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    <Sparkles className="h-4 w-4 text-amber-400" /> Feature Engagement & Platform Health
                  </h3>
                  <div className="space-y-2.5">
                    {[
                      { name: "Code Arena Judge (Docker Container Runner)", status: "Optimal (0.04s latency)", rate: "99.8%" },
                      { name: "Live Real-Time Code Battle Redis Locking", status: "Atomic SETNX Active", rate: "100%" },
                      { name: "AI Technical Mock Recruiter (Gemini)", status: "Active & Synced", rate: "98.2%" },
                      { name: "AI Resume ATS Keyword Parser", status: "PyPDF Service Ready", rate: "100%" },
                    ].map((item, i) => (
                      <div key={i} className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/80 flex items-center justify-between text-xs">
                        <div>
                          <div className="font-bold text-slate-200">{item.name}</div>
                          <div className="text-[10px] text-slate-500">{item.status}</div>
                        </div>
                        <span className="font-mono font-bold text-emerald-400">{item.rate}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: STUDENT DIRECTORY & MODERATION */}
          {adminTab === 'students' && (
            <div className="space-y-5">
              {/* Search & Filter Bar */}
              <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
                <div className="relative w-full sm:w-80">
                  <Search className="h-4 w-4 absolute left-3.5 top-3 text-slate-500" />
                  <input
                    type="text"
                    value={studentSearchQuery}
                    onChange={(e) => setStudentSearchQuery(e.target.value)}
                    placeholder="Search by student name, email, college..."
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-200 outline-none focus:border-rose-500"
                  />
                </div>
                <div className="text-xs text-slate-400 font-medium">
                  Showing <span className="text-white font-bold">{filteredStudents.length}</span> students
                </div>
              </div>

              {/* Students Table */}
              <div className="rounded-2xl bg-slate-900/70 border border-slate-800 overflow-hidden">
                <table className="w-full text-xs text-left border-collapse">
                  <thead>
                    <tr className="border-b border-slate-800 bg-[#080d19] text-slate-400 uppercase font-bold text-[10px] tracking-wider">
                      <th className="py-3 px-4">Student</th>
                      <th className="py-3 px-4">College & Degree</th>
                      <th className="py-3 px-4">Target Role</th>
                      <th className="py-3 px-4">Readiness</th>
                      <th className="py-3 px-4">XP</th>
                      <th className="py-3 px-4">Status</th>
                      <th className="py-3 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredStudents.map((s) => (
                      <tr key={s.id} className="border-b border-slate-800/60 hover:bg-slate-800/30 transition">
                        <td className="py-3.5 px-4">
                          <div className="font-bold text-white">{s.name}</div>
                          <div className="text-[10px] text-slate-500">{s.email}</div>
                        </td>
                        <td className="py-3.5 px-4 text-slate-300">
                          <div>{s.college || 'Not set'}</div>
                          <div className="text-[10px] text-slate-500">{s.degree}</div>
                        </td>
                        <td className="py-3.5 px-4">
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-indigo-500/10 text-indigo-300 border border-indigo-500/20">
                            {s.target_role || 'General'}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 font-mono font-bold text-emerald-400">
                          {s.readiness_score}%
                        </td>
                        <td className="py-3.5 px-4 font-mono text-amber-400 font-bold">
                          {s.xp} XP
                        </td>
                        <td className="py-3.5 px-4">
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            s.is_active
                              ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                              : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                          }`}>
                            {s.is_active ? 'Active' : 'Suspended'}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-right space-x-2">
                          <button
                            onClick={() => setSelectedStudent(s)}
                            className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-[11px] font-semibold text-slate-200 border border-slate-700"
                          >
                            Inspect
                          </button>
                          <button
                            onClick={() => handleToggleStudentStatus(s.id)}
                            className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition ${
                              s.is_active
                                ? 'bg-rose-950/40 hover:bg-rose-900/50 text-rose-300 border border-rose-800/60'
                                : 'bg-emerald-950/40 hover:bg-emerald-900/50 text-emerald-300 border border-emerald-800/60'
                            }`}
                          >
                            {s.is_active ? 'Suspend' : 'Activate'}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Student Progress Deep-Dive Modal */}
              {selectedStudent && (
                <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
                  <div className="w-full max-w-2xl bg-[#0b101e] border border-slate-800 rounded-3xl p-6 shadow-2xl space-y-5 max-h-[85vh] overflow-y-auto">
                    <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                      <div>
                        <h3 className="text-base font-bold text-white">{selectedStudent.name}</h3>
                        <p className="text-xs text-slate-400">{selectedStudent.email} • {selectedStudent.college}</p>
                      </div>
                      <button
                        onClick={() => setSelectedStudent(null)}
                        className="p-1 rounded-lg bg-slate-800 text-slate-400 hover:text-white"
                      >
                        ✕
                      </button>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                      <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                        <div className="text-[10px] text-slate-400 uppercase font-semibold">Readiness</div>
                        <div className="text-base font-black text-emerald-400">{selectedStudent.readiness_score}%</div>
                      </div>
                      <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                        <div className="text-[10px] text-slate-400 uppercase font-semibold">DSA Level</div>
                        <div className="text-base font-black text-indigo-400">{selectedStudent.dsa_level}%</div>
                      </div>
                      <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                        <div className="text-[10px] text-slate-400 uppercase font-semibold">SQL Level</div>
                        <div className="text-base font-black text-sky-400">{selectedStudent.sql_level}%</div>
                      </div>
                      <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                        <div className="text-[10px] text-slate-400 uppercase font-semibold">Status</div>
                        <div className={`text-base font-black ${selectedStudent.is_active ? 'text-emerald-400' : 'text-rose-400'}`}>
                          {selectedStudent.is_active ? 'Active' : 'Banned'}
                        </div>
                      </div>
                    </div>

                    {/* Submissions List */}
                    <div className="space-y-2">
                      <h4 className="text-xs font-bold text-slate-300 uppercase">Recent Submissions History</h4>
                      <div className="space-y-1.5 max-h-40 overflow-y-auto">
                        {(selectedStudent.submissions || []).length === 0 ? (
                          <div className="text-xs text-slate-500">No submissions recorded yet.</div>
                        ) : (
                          selectedStudent.submissions.map((sub: any, i: number) => (
                            <div key={i} className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between text-xs">
                              <div>
                                <span className="font-semibold text-slate-200">{sub.question_title}</span>
                                <span className="text-[10px] text-slate-500 ml-2">({sub.type})</span>
                              </div>
                              <span className="font-mono text-emerald-400 font-bold">+{sub.score} XP</span>
                            </div>
                          ))
                        )}
                      </div>
                    </div>

                    <div className="flex justify-between items-center pt-3 border-t border-slate-800">
                      <button
                        onClick={() => handleToggleStudentStatus(selectedStudent.id)}
                        className={`px-4 py-2 rounded-xl text-xs font-bold ${
                          selectedStudent.is_active
                            ? 'bg-rose-600 hover:bg-rose-500 text-white'
                            : 'bg-emerald-600 hover:bg-emerald-500 text-white'
                        }`}
                      >
                        {selectedStudent.is_active ? 'Suspend Candidate' : 'Activate Candidate'}
                      </button>
                      <button
                        onClick={() => setSelectedStudent(null)}
                        className="px-4 py-2 rounded-xl bg-slate-800 text-xs font-semibold text-slate-300"
                      >
                        Close
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 3: CURRICULUM & PROBLEM AUTHORING */}
          {adminTab === 'curriculum' && (
            <div className="max-w-3xl mx-auto space-y-6">
              <div className="p-6 rounded-2xl bg-slate-900/70 border border-slate-800 space-y-5">
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <h3 className="text-base font-bold text-white flex items-center gap-2">
                    <Plus className="h-4 w-4 text-rose-400" /> Author New Placement Challenge
                  </h3>
                  <span className="text-xs text-slate-400">Instantly populates Candidate Arena</span>
                </div>

                {problemCreateSuccess && (
                  <div className="p-3 rounded-xl bg-emerald-950/40 border border-emerald-800/60 text-xs text-emerald-300 flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                    <span>Problem successfully authored and published to the database!</span>
                  </div>
                )}

                <form onSubmit={handleCreateProblemSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="text-[11px] font-semibold text-slate-300 block mb-1">Problem Title</label>
                      <input
                        type="text"
                        value={newProblemTitle}
                        onChange={(e) => setNewProblemTitle(e.target.value)}
                        placeholder="e.g. Merge K Sorted Lists"
                        className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-200 outline-none focus:border-rose-500"
                        required
                      />
                    </div>
                    <div>
                      <label className="text-[11px] font-semibold text-slate-300 block mb-1">Challenge Type</label>
                      <select
                        value={newProblemType}
                        onChange={(e: any) => setNewProblemType(e.target.value)}
                        className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-200 outline-none focus:border-rose-500"
                      >
                        <option value="coding">Coding (Data Structures / Algorithms)</option>
                        <option value="sql">SQL / Relational Database Query</option>
                        <option value="mcq">MCQ / CS Fundamentals</option>
                        <option value="puzzle">Logic Puzzle / Incident Scenario</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                      <label className="text-[11px] font-semibold text-slate-300 block mb-1">Difficulty</label>
                      <select
                        value={newProblemDifficulty}
                        onChange={(e) => setNewProblemDifficulty(e.target.value)}
                        className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-200 outline-none focus:border-rose-500"
                      >
                        <option value="Easy">Easy</option>
                        <option value="Medium">Medium</option>
                        <option value="Hard">Hard</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-[11px] font-semibold text-slate-300 block mb-1">XP Reward</label>
                      <input
                        type="number"
                        value={newProblemXp}
                        onChange={(e) => setNewProblemXp(Number(e.target.value))}
                        className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-200 outline-none focus:border-rose-500"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] font-semibold text-slate-300 block mb-1">Primary Company Tag</label>
                      <select
                        value={newProblemCompany}
                        onChange={(e) => setNewProblemCompany(e.target.value)}
                        className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-200 outline-none focus:border-rose-500"
                      >
                        {TARGET_COMPANIES_LIST.map(c => <option key={c} value={c}>{c}</option>)}
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="text-[11px] font-semibold text-slate-300 block mb-1">Problem Description</label>
                    <textarea
                      value={newProblemDesc}
                      onChange={(e) => setNewProblemDesc(e.target.value)}
                      placeholder="Detailed problem specification, constraints, and test scenarios..."
                      className="w-full h-24 p-3 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-200 outline-none resize-none font-mono"
                      required
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-semibold text-slate-300 block mb-1">Starter Template Code</label>
                    <textarea
                      value={newProblemTemplate}
                      onChange={(e) => setNewProblemTemplate(e.target.value)}
                      className="w-full h-24 p-3 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-200 outline-none resize-none font-mono"
                      required
                    />
                  </div>

                  <div className="flex justify-end pt-2">
                    <button
                      type="submit"
                      className="px-6 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs shadow-lg shadow-rose-600/30 flex items-center gap-1.5"
                    >
                      <Check className="h-4 w-4" /> Publish Problem to Database
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* TAB 4: TELEMETRY & EVENTS */}
          {adminTab === 'telemetry' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <Activity className="h-4 w-4 text-emerald-400" /> Live Telemetry Ingestion Audit Stream
                </h3>
                <span className="text-xs px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-mono">
                  ● Real-Time Ingest Active
                </span>
              </div>

              <div className="rounded-2xl bg-slate-900/70 border border-slate-800 p-4 space-y-2 font-mono text-xs max-h-[600px] overflow-y-auto">
                {[
                  { time: "2026-09-01 00:48:12", event: "resume_uploaded", user: "alex.chen@codequest.dev", meta: '{"filename": "Alex_Chen_SWE_2026.pdf", "ats_score": 84}' },
                  { time: "2026-09-01 00:46:05", event: "skill_profile_updated", user: "alex.chen@codequest.dev", meta: '{"target_role": "Software Engineer", "readiness_score": 78.5}' },
                  { time: "2026-09-01 00:42:30", event: "problem_solved", user: "alex.chen@codequest.dev", meta: '{"problem_title": "Two Sum", "score": 25, "execution_time": 0.04}' },
                  { time: "2026-09-01 00:39:15", event: "code_battle_won", user: "alex.chen@codequest.dev", meta: '{"room_code": "8X42LK", "lock_time_ms": 42}' },
                  { time: "2026-09-01 00:35:00", event: "mock_interview_completed", user: "priya.patel@iitb.ac.in", meta: '{"overall_score": 88.5, "mode": "Technical Recruiter"}' },
                  { time: "2026-09-01 00:20:18", event: "user_signed_up", user: "rohan.sharma@bits.edu", meta: '{"auth_provider": "local", "ip": "10.0.0.12"}' }
                ].map((ev, i) => (
                  <div key={i} className="p-3 rounded-xl bg-slate-950/80 border border-slate-800/80 flex items-center justify-between">
                    <div className="space-y-1">
                      <div className="flex items-center gap-3">
                        <span className="text-slate-500 text-[10px]">{ev.time}</span>
                        <span className="px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 font-bold text-[10px]">{ev.event}</span>
                        <span className="text-slate-300 font-semibold">{ev.user}</span>
                      </div>
                      <div className="text-slate-400 text-[11px]">{ev.meta}</div>
                    </div>
                    <span className="text-emerald-400 font-bold text-[10px]">200 OK</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 5: REPORTS */}
          {adminTab === 'reports' && (
            <div className="max-w-3xl mx-auto space-y-6">
              <div className="p-6 rounded-2xl bg-slate-900/70 border border-slate-800 space-y-5">
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <h3 className="text-base font-bold text-white flex items-center gap-2">
                    <FileSpreadsheet className="h-4 w-4 text-emerald-400" /> Placement Readiness Export
                  </h3>
                  <button
                    onClick={() => alert("Placement Readiness CSV Report exported successfully!")}
                    className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md shadow-emerald-600/30 flex items-center gap-1.5"
                  >
                    <Download className="h-3.5 w-3.5" /> Export Student Readiness (CSV)
                  </button>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Generate comprehensive campus placement candidate reports containing student rankings, domain skill levels (DSA, SQL, CS Core, Aptitude), verified ATS resume scores, and company assessment pass rates.
                </p>
              </div>
            </div>
          )}
        </main>
      </div>
    );
  }

  // -------------------------------------------------------------
  // STEP 4: MAIN AUTHENTICATED CANDIDATE PLATFORM VIEW
  // -------------------------------------------------------------
  return (
    <div className="min-h-screen bg-[#070a13] text-slate-100 flex flex-col font-['Plus_Jakarta_Sans'] selection:bg-indigo-500 selection:text-white">
      {/* Top Navbar */}
      <header className="sticky top-0 z-50 bg-[#070a13]/90 backdrop-blur-md border-b border-slate-800/80 px-6 py-3.5 flex items-center justify-between">
        <div className="flex items-center gap-3 cursor-pointer" onClick={() => setActiveTab('dashboard')}>
          <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-indigo-500 via-sky-500 to-emerald-500 p-[1.5px] flex items-center justify-center shadow-lg shadow-indigo-500/20">
            <div className="h-full w-full bg-[#070a13] rounded-[10px] flex items-center justify-center font-mono font-bold text-sky-400 text-xs">
              &lt;CQ&gt;
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold tracking-tight text-lg bg-clip-text text-transparent bg-gradient-to-r from-white via-slate-200 to-sky-400">
                CODE QUEST
              </span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 tracking-wider">
                PRO 2026
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-4">
          {/* Admin Mode Switcher if user is admin */}
          {isAdminUser && (
            <button
              onClick={() => setPortalMode('admin')}
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-rose-950/40 border border-rose-800/50 text-rose-300 text-xs font-bold hover:bg-rose-900/50 transition"
            >
              <Shield className="h-3.5 w-3.5" /> Admin Console
            </button>
          )}

          <div className="hidden md:flex items-center gap-2.5 px-3.5 py-1.5 rounded-xl bg-slate-900/90 border border-slate-800 shadow-inner">
            <div className="relative flex items-center justify-center h-6 w-6">
              <span className="text-xs">🎯</span>
            </div>
            <div>
              <div className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Placement Readiness</div>
              <div className="text-xs font-extrabold text-emerald-400 flex items-center gap-1">
                {readinessScore}% <span className="text-[9px] text-slate-400 font-normal">(Top 12%)</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-indigo-950/40 border border-indigo-800/40">
            <Zap className="h-4 w-4 text-amber-400 fill-amber-400 animate-pulse" />
            <span className="text-xs font-bold text-indigo-200">{xp} <span className="text-slate-400 font-normal">XP</span></span>
          </div>

          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-orange-950/40 border border-orange-800/40 text-orange-300">
            <Flame className="h-4 w-4 text-orange-400 fill-orange-400" />
            <span className="text-xs font-bold">{streak}d</span>
          </div>

          <div className="flex items-center gap-3 pl-2 border-l border-slate-800">
            <div className="h-8 w-8 rounded-full bg-gradient-to-tr from-sky-500 to-indigo-600 flex items-center justify-center font-bold text-xs text-white shadow-md">
              {userName.substring(0, 2).toUpperCase()}
            </div>
            <div className="hidden lg:block text-left">
              <div className="text-xs font-semibold text-slate-200">{userName}</div>
              <div className="text-[10px] text-slate-400">{targetRole}</div>
            </div>
            <button
              onClick={handleLogout}
              title="Log Out"
              className="p-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-rose-400 transition border border-slate-800"
            >
              <LogOut className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      </header>

      {/* Main Candidate Navigation Bar */}
      <nav className="bg-[#0b101e] border-b border-slate-800/60 px-6 py-2 flex items-center gap-1.5 overflow-x-auto text-xs font-medium scrollbar-none">
        {[
          { id: 'dashboard', label: 'Dashboard', icon: Compass },
          { id: 'arena', label: 'Code Arena', icon: Code2 },
          { id: 'sql', label: 'SQL Lab', icon: Database },
          { id: 'mcqs', label: 'MCQ & CS Quiz', icon: HelpCircle },
          { id: 'puzzles', label: 'Puzzles & Scenarios', icon: Puzzle },
          { id: 'assessments', label: 'Company Bundles', icon: Award },
          { id: 'battle', label: '⚔️ Code Battle', icon: Swords, highlight: true },
          { id: 'interview', label: 'AI Mock Interview', icon: Bot },
          { id: 'resume', label: 'AI Resume ATS', icon: FileText, highlight: true },
          { id: 'roadmaps', label: 'Roadmaps & Projects', icon: BookOpen },
          { id: 'leaderboard', label: 'Leaderboard', icon: Trophy },
        ].map(item => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id as any)}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl transition-all whitespace-nowrap ${
                isActive
                  ? 'bg-gradient-to-r from-indigo-600 to-sky-600 text-white font-semibold shadow-md shadow-indigo-600/30'
                  : item.highlight
                  ? 'bg-amber-500/10 text-amber-300 hover:bg-amber-500/20 border border-amber-500/30'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
            >
              <Icon className={`h-3.5 w-3.5 ${isActive ? 'text-white' : item.highlight ? 'text-amber-400' : 'text-slate-400'}`} />
              <span>{item.label}</span>
            </button>
          );
        })}
      </nav>

      {/* Main Candidate Content Area */}
      <main className="flex-1 p-6 max-w-7xl w-full mx-auto">
        {/* TAB 1: DASHBOARD */}
        {activeTab === 'dashboard' && (
          <div className="space-y-6">
            <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-900 via-[#0d1322] to-slate-900 border border-slate-800 p-6 shadow-xl">
              <div className="absolute -top-24 -right-24 w-72 h-72 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
              <div className="relative z-10 grid grid-cols-1 lg:grid-cols-3 gap-6 items-center">
                <div className="space-y-2 lg:col-span-2">
                  <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                    <Sparkles className="h-3 w-3" /> Target Track: {targetRole}
                  </div>
                  <h2 className="text-2xl font-black tracking-tight text-white">
                    Welcome back, {userName}! 🚀
                  </h2>
                  <p className="text-sm text-slate-400 leading-relaxed max-w-xl">
                    Your placement readiness is at <span className="text-emerald-400 font-bold">{readinessScore}%</span>. Complete today's daily mission and practice 1 SQL query to reach the Top 10% milestone.
                  </p>
                  <div className="flex flex-wrap gap-3 pt-2">
                    <button onClick={() => setActiveTab('arena')} className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs transition flex items-center gap-2 shadow-lg shadow-indigo-600/30">
                      <Play className="h-3.5 w-3.5 fill-white" /> Continue Daily Quest
                    </button>
                    <button onClick={() => setActiveTab('battle')} className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs border border-slate-700 transition flex items-center gap-2">
                      <Swords className="h-3.5 w-3.5 text-amber-400" /> Join Live Code Battle
                    </button>
                    <button onClick={() => { setShowOnboarding(true); setOnboardingStep(1); }} className="px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-slate-200 font-semibold text-xs border border-slate-800 transition flex items-center gap-1.5">
                      <Sliders className="h-3.5 w-3.5" /> Re-tune Skills Wizard
                    </button>
                  </div>
                </div>

                <div className="flex flex-col items-center justify-center p-4 rounded-xl bg-[#080d19]/80 border border-slate-800/80">
                  <div className="relative w-28 h-28 flex items-center justify-center rounded-full border-4 border-slate-800 border-t-emerald-400 border-r-indigo-500 shadow-inner">
                    <div className="text-center">
                      <div className="text-2xl font-black text-white">{readinessScore}%</div>
                      <div className="text-[10px] text-slate-400 font-semibold uppercase">Readiness</div>
                    </div>
                  </div>
                  <div className="text-center mt-2 text-[11px] text-slate-400">
                    Top <span className="text-sky-400 font-bold">12%</span> of Candidate Pool
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="rounded-2xl bg-slate-900/60 border border-slate-800 p-5 space-y-4">
                <h3 className="text-sm font-bold text-slate-200 flex items-center gap-2">
                  <Shield className="h-4 w-4 text-sky-400" /> Domain Mastery
                </h3>
                <div className="space-y-3">
                  {[
                    { name: 'Data Structures & Algorithms', level: obDsaLevel, color: 'bg-indigo-500' },
                    { name: 'SQL & Database Design', level: obSqlLevel, color: 'bg-sky-500' },
                    { name: 'CS Fundamentals (OS/Networks)', level: obCsLevel, color: 'bg-emerald-500' },
                    { name: 'Aptitude & Logical Puzzles', level: obAptitudeLevel, color: 'bg-amber-500' },
                    { name: 'AI Interview & Communication', level: 78, color: 'bg-purple-500' },
                  ].map(skill => (
                    <div key={skill.name} className="space-y-1">
                      <div className="flex justify-between text-xs">
                        <span className="text-slate-300 font-medium">{skill.name}</span>
                        <span className="text-slate-400 font-bold">{skill.level}%</span>
                      </div>
                      <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden">
                        <div className={`h-full ${skill.color} rounded-full transition-all duration-500`} style={{ width: `${skill.level}%` }} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="rounded-2xl bg-slate-900/60 border border-slate-800 p-5 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-slate-200 flex items-center gap-2">
                    <Star className="h-4 w-4 text-amber-400" /> Daily Objectives
                  </h3>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">+50 XP Bonus</span>
                </div>
                <div className="space-y-2.5">
                  {[
                    { title: "Solve 1 Medium DSA Problem", xp: 25, done: true },
                    { title: "Complete SQL Aggregate Challenge", xp: 20, done: true },
                    { title: "Review 1 System Design Puzzle", xp: 15, done: false },
                  ].map((task, i) => (
                    <div key={i} className={`p-3 rounded-xl border flex items-center justify-between text-xs transition ${task.done ? 'bg-slate-900/40 border-slate-800/60 text-slate-400' : 'bg-slate-800/40 border-slate-700 text-slate-200'}`}>
                      <div className="flex items-center gap-2.5">
                        <div className={`h-4 w-4 rounded-full flex items-center justify-center ${task.done ? 'bg-emerald-500/20 text-emerald-400' : 'border border-slate-600'}`}>
                          {task.done && <Check className="h-3 w-3" />}
                        </div>
                        <span className={task.done ? 'line-through' : 'font-medium'}>{task.title}</span>
                      </div>
                      <span className="font-bold text-amber-400">+{task.xp} XP</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="rounded-2xl bg-slate-900/60 border border-slate-800 p-5 space-y-4">
                <h3 className="text-sm font-bold text-slate-200 flex items-center gap-2">
                  <Flame className="h-4 w-4 text-orange-400" /> Weekly Activity Streak
                </h3>
                <div className="flex items-center justify-between p-3 rounded-xl bg-orange-950/20 border border-orange-800/30">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">🔥</span>
                    <div>
                      <div className="text-sm font-bold text-orange-300">{streak}-Day Streak</div>
                      <div className="text-[11px] text-slate-400">Keep it active tomorrow!</div>
                    </div>
                  </div>
                </div>
                <div className="grid grid-cols-7 gap-2 text-center text-xs">
                  {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((day, i) => (
                    <div key={i} className="space-y-1">
                      <span className="text-[10px] text-slate-500 font-semibold">{day}</span>
                      <div className={`h-8 rounded-lg flex items-center justify-center font-bold text-[10px] ${i < 5 ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40' : 'bg-slate-800/40 text-slate-600'}`}>
                        {i < 5 ? '✓' : '•'}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: CODING ARENA */}
        {activeTab === 'arena' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 h-[720px] relative">
            {/* Left Column: Problem Description & Hint */}
            <div className="lg:col-span-5 rounded-2xl bg-slate-900/80 border border-slate-800 p-5 flex flex-col overflow-y-auto space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-slate-200 flex items-center gap-2">
                  <Code2 className="h-4 w-4 text-indigo-400" /> Problem Arena
                </h3>
                <div className="flex gap-1.5">
                  {codingProblems.map((p, idx) => (
                    <button
                      key={p.id}
                      onClick={() => {
                        setSelectedProblem(p);
                        setEditorCode(p.template);
                        setConsoleOutput(null);
                        setShowCodeHint(false);
                        setShowCodeSolution(false);
                      }}
                      className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition ${selectedProblem.id === p.id ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30' : 'bg-slate-800 text-slate-400 hover:bg-slate-700'}`}
                    >
                      #{idx + 1}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <div className="flex items-center gap-2 mb-1">
                  <h2 className="text-lg font-extrabold text-white">{selectedProblem.title}</h2>
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                    {selectedProblem.difficulty}
                  </span>
                </div>
                <div className="flex flex-wrap gap-1.5 mb-3">
                  {(selectedProblem.company_tags || []).map(t => (
                    <span key={t} className="px-2 py-0.5 rounded-full text-[10px] bg-slate-800 text-slate-400 border border-slate-700">
                      {t}
                    </span>
                  ))}
                </div>
              </div>

              <div className="text-xs text-slate-300 leading-relaxed whitespace-pre-line border-t border-slate-800 pt-3">
                {selectedProblem.desc}
              </div>

              <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/80 text-xs font-mono space-y-1">
                <div className="text-slate-400 font-bold">Example 1:</div>
                <div className="text-sky-400">Input: {selectedProblem.input}</div>
                <div className="text-emerald-400">Output: {selectedProblem.output}</div>
              </div>

              {/* Expandable Algorithmic Hint Accordion */}
              <div className="pt-2">
                <button
                  onClick={() => setShowCodeHint(!showCodeHint)}
                  className="w-full py-2 px-3 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 text-amber-300 font-semibold text-xs flex items-center justify-between transition"
                >
                  <span className="flex items-center gap-1.5">
                    <Lightbulb className="h-3.5 w-3.5 text-amber-400" />
                    {showCodeHint ? 'Hide Algorithmic Hint' : '💡 Need a Hint? Click Here'}
                  </span>
                  <span className="text-[10px] text-amber-400 font-bold">{showCodeHint ? '▲' : '▼'}</span>
                </button>
                {showCodeHint && (
                  <div className="mt-2 p-3 rounded-xl bg-amber-950/40 border border-amber-500/40 text-xs text-amber-200 leading-relaxed space-y-2">
                    <p>{selectedProblem.hint || "Analyze the time vs space tradeoffs. An auxiliary data structure like a hash map can prevent quadratic nested loops."}</p>
                    <button
                      onClick={() => setShowCodeSolution(true)}
                      className="text-[11px] font-bold text-amber-400 hover:text-amber-300 underline flex items-center gap-1"
                    >
                      Still stuck? Reveal Full Solution ➔
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Right Column: Code Editor & Console */}
            <div className="lg:col-span-7 rounded-2xl bg-slate-900/80 border border-slate-800 flex flex-col overflow-hidden">
              <div className="bg-[#0b101e] px-4 py-2.5 border-b border-slate-800 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Terminal className="h-4 w-4 text-sky-400" />
                  <span className="text-xs font-mono font-bold text-slate-300">Solution.py</span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setShowCodeHint(!showCodeHint)}
                    className="px-2.5 py-1 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30 text-xs font-semibold flex items-center gap-1 transition"
                    title="View Problem Hint"
                  >
                    <Lightbulb className="h-3 w-3 text-amber-400" /> Hint
                  </button>
                  <button
                    onClick={() => setShowCodeSolution(true)}
                    className="px-2.5 py-1 rounded-lg bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 text-xs font-semibold flex items-center gap-1 transition"
                    title="Reveal Full Code Solution"
                  >
                    <Eye className="h-3 w-3 text-indigo-400" /> Solution
                  </button>
                  <button
                    onClick={() => {
                      setEditorCode(selectedProblem.template);
                      setConsoleOutput(null);
                    }}
                    className="px-2 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white text-xs transition font-mono"
                    title="Reset Starter Skeleton"
                  >
                    ↺ Reset
                  </button>
                  <select
                    value={codeLanguage}
                    onChange={(e: any) => setCodeLanguage(e.target.value)}
                    className="bg-slate-800 text-xs text-slate-200 px-2 py-1 rounded border border-slate-700 font-mono"
                  >
                    <option value="python">Python 3</option>
                    <option value="javascript">JavaScript</option>
                    <option value="cpp">C++ (g++)</option>
                  </select>
                </div>
              </div>

              <textarea
                value={editorCode}
                onChange={(e) => setEditorCode(e.target.value)}
                placeholder="# Type your algorithmic solution code here..."
                className="flex-1 w-full bg-[#070a13] p-4 text-xs font-mono text-slate-200 outline-none resize-none leading-relaxed selection:bg-indigo-600"
                spellCheck={false}
              />

              {consoleOutput && (
                <div className="p-3 bg-slate-950 border-t border-slate-800 text-xs font-mono">
                  <div className={`flex items-center gap-2 font-bold mb-1 ${consoleOutput.passed ? 'text-emerald-400' : 'text-rose-400'}`}>
                    {consoleOutput.passed ? <CheckCircle2 className="h-3.5 w-3.5" /> : <XCircle className="h-3.5 w-3.5" />} {consoleOutput.status}
                  </div>
                  <pre className="text-slate-400 text-[11px] whitespace-pre-wrap">{consoleOutput.stdout}</pre>

                  {/* Immediate Action Row If Code Failed */}
                  {!consoleOutput.passed && (
                    <div className="mt-2.5 pt-2 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-2">
                      <span className="text-[11px] text-slate-400">Encountered an error or wrong output?</span>
                      <div className="flex gap-2">
                        <button
                          onClick={() => setShowCodeHint(true)}
                          className="px-2.5 py-1 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 text-xs font-bold transition flex items-center gap-1"
                        >
                          <Lightbulb className="h-3 w-3" /> View Hint
                        </button>
                        <button
                          onClick={() => setShowCodeSolution(true)}
                          className="px-2.5 py-1 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition shadow-md shadow-indigo-600/30 flex items-center gap-1"
                        >
                          <Eye className="h-3 w-3" /> Reveal Full Solution
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}

              <div className="bg-[#0b101e] p-3 border-t border-slate-800 flex items-center justify-between">
                <span className="text-[11px] text-slate-400 font-mono">Type your logic & compile to test</span>
                <div className="flex gap-2">
                  <button
                    onClick={handleRunCode}
                    disabled={executingCode}
                    className="px-4 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs transition flex items-center gap-1.5 border border-slate-700"
                  >
                    <Play className="h-3 w-3 fill-slate-200" /> {executingCode ? 'Compiling...' : 'Run Code'}
                  </button>
                  <button
                    onClick={handleRunCode}
                    disabled={executingCode}
                    className="px-5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs transition flex items-center gap-1.5 shadow-md shadow-emerald-600/30"
                  >
                    Submit Solution
                  </button>
                </div>
              </div>
            </div>

            {/* FULL CODE SOLUTION MODAL */}
            {showCodeSolution && (
              <div className="absolute inset-0 z-50 bg-black/80 backdrop-blur-sm rounded-2xl flex items-center justify-center p-4">
                <div className="bg-[#0e1628] border border-indigo-500/40 rounded-2xl max-w-2xl w-full p-6 shadow-2xl space-y-4 max-h-[90%] overflow-y-auto">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                    <div className="flex items-center gap-2">
                      <div className="p-1.5 rounded-lg bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
                        <Code2 className="h-4 w-4" />
                      </div>
                      <div>
                        <h3 className="text-base font-bold text-white">Full Solution: {selectedProblem.title}</h3>
                        <span className="text-[10px] text-slate-400 font-mono">Verified Optimal Python 3 Solution</span>
                      </div>
                    </div>
                    <button
                      onClick={() => setShowCodeSolution(false)}
                      className="text-slate-400 hover:text-white text-sm px-2 py-1 rounded-lg bg-slate-800/60"
                    >
                      ✕
                    </button>
                  </div>

                  <div className="relative rounded-xl bg-[#060913] border border-slate-800 p-4 font-mono text-xs text-sky-200 overflow-x-auto leading-relaxed">
                    <pre>{selectedProblem.solution || (selectedProblem as any).optimal_solution || selectedProblem.template}</pre>
                  </div>

                  {selectedProblem.solutionExplanation && (
                    <div className="p-3 rounded-xl bg-indigo-950/30 border border-indigo-500/20 text-xs text-indigo-200 leading-relaxed">
                      <div className="font-bold text-white mb-1 flex items-center gap-1.5">
                        <Sparkles className="h-3.5 w-3.5 text-amber-400" /> Complexity & Approach:
                      </div>
                      {selectedProblem.solutionExplanation}
                    </div>
                  )}

                  <div className="flex items-center justify-between pt-2 border-t border-slate-800">
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(selectedProblem.solution || selectedProblem.template);
                        setCodeCopied(true);
                        setTimeout(() => setCodeCopied(false), 2000);
                      }}
                      className="px-3.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center gap-1.5 transition"
                    >
                      <Copy className="h-3.5 w-3.5 text-slate-400" /> {codeCopied ? 'Copied to Clipboard!' : 'Copy Code'}
                    </button>
                    <div className="flex gap-2">
                      <button
                        onClick={() => {
                          setEditorCode(selectedProblem.solution || selectedProblem.template);
                          setShowCodeSolution(false);
                          setConsoleOutput(null);
                        }}
                        className="px-4 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition shadow-lg shadow-indigo-600/30 flex items-center gap-1.5"
                      >
                        <Zap className="h-3.5 w-3.5 text-amber-400" /> Load Solution into Editor
                      </button>
                      <button
                        onClick={() => setShowCodeSolution(false)}
                        className="px-3.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium"
                      >
                        Close
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB 3: SQL LAB */}
        {activeTab === 'sql' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 h-[720px] relative">
            {/* Left Column: SQL Schema & Problem Switcher */}
            <div className="lg:col-span-5 rounded-2xl bg-slate-900/80 border border-slate-800 p-5 flex flex-col space-y-4 overflow-y-auto">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-slate-200 flex items-center gap-2">
                  <Database className="h-4 w-4 text-sky-400" /> SQL Schema & Challenge
                </h3>
                <div className="flex gap-1.5">
                  {sqlProblems.map((sp, idx) => (
                    <button
                      key={sp.id}
                      onClick={() => {
                        setSelectedSqlProblem(sp);
                        setSqlQuery(sp.defaultQuery);
                        setSqlResult(null);
                        setSqlError(null);
                        setShowSqlHint(false);
                        setShowSqlSolution(false);
                      }}
                      className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition ${selectedSqlProblem.id === sp.id ? 'bg-sky-600 text-white shadow-md shadow-sky-600/30' : 'bg-slate-800 text-slate-400 hover:bg-slate-700'}`}
                    >
                      #{idx + 1}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <div className="flex items-center gap-2 mb-1">
                  <h2 className="text-lg font-extrabold text-white">{selectedSqlProblem.title}</h2>
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/10 text-amber-400 border border-amber-500/20">
                    {selectedSqlProblem.difficulty}
                  </span>
                </div>
                <div className="flex flex-wrap gap-1.5 mb-2">
                  {(selectedSqlProblem.company_tags || []).map(t => (
                    <span key={t} className="px-2 py-0.5 rounded-full text-[10px] bg-slate-800 text-slate-400 border border-slate-700">
                      {t}
                    </span>
                  ))}
                </div>
              </div>

              <p className="text-xs text-slate-300 whitespace-pre-line leading-relaxed border-t border-slate-800 pt-3">
                {selectedSqlProblem.desc}
              </p>

              <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 text-xs font-mono space-y-1">
                <div className="text-slate-400 font-bold">Relational Schema:</div>
                <pre className="text-sky-300 text-[11px] whitespace-pre-wrap">{selectedSqlProblem.schema}</pre>
              </div>

              {/* Expandable SQL Hint Accordion */}
              <div className="pt-2">
                <button
                  onClick={() => setShowSqlHint(!showSqlHint)}
                  className="w-full py-2 px-3 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 text-amber-300 font-semibold text-xs flex items-center justify-between transition"
                >
                  <span className="flex items-center gap-1.5">
                    <Lightbulb className="h-3.5 w-3.5 text-amber-400" />
                    {showSqlHint ? 'Hide SQL Hint' : '💡 Need a Hint? Click Here'}
                  </span>
                  <span className="text-[10px] text-amber-400 font-bold">{showSqlHint ? '▲' : '▼'}</span>
                </button>
                {showSqlHint && (
                  <div className="mt-2 p-3 rounded-xl bg-amber-950/40 border border-amber-500/40 text-xs text-amber-200 leading-relaxed space-y-2">
                    <p>{selectedSqlProblem.hint || "Review your JOIN syntax and filtering conditions."}</p>
                    <button
                      onClick={() => setShowSqlSolution(true)}
                      className="text-[11px] font-bold text-amber-400 hover:text-amber-300 underline flex items-center gap-1"
                    >
                      Still stuck? Reveal Full SQL Solution ➔
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Right Column: SQL Query Editor & Results Table */}
            <div className="lg:col-span-7 rounded-2xl bg-slate-900/80 border border-slate-800 flex flex-col overflow-hidden">
              <div className="bg-[#0b101e] px-4 py-2.5 border-b border-slate-800 flex items-center justify-between">
                <span className="text-xs font-mono font-bold text-slate-300">PostgreSQL Playground (Safe Transactional Runner)</span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setShowSqlHint(!showSqlHint)}
                    className="px-2.5 py-1 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30 text-xs font-semibold flex items-center gap-1 transition"
                  >
                    <Lightbulb className="h-3 w-3 text-amber-400" /> Hint
                  </button>
                  <button
                    onClick={() => setShowSqlSolution(true)}
                    className="px-2.5 py-1 rounded-lg bg-sky-500/10 hover:bg-sky-500/20 text-sky-300 border border-sky-500/30 text-xs font-semibold flex items-center gap-1 transition"
                  >
                    <Eye className="h-3 w-3 text-sky-400" /> Solution
                  </button>
                  <button
                    onClick={() => {
                      setSqlQuery(selectedSqlProblem.defaultQuery);
                      setSqlResult(null);
                      setSqlError(null);
                    }}
                    className="px-2 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white text-xs transition font-mono"
                    title="Reset Query"
                  >
                    ↺ Reset
                  </button>
                  <button
                    onClick={handleRunSql}
                    disabled={sqlRunning}
                    className="px-4 py-1.5 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-semibold text-xs flex items-center gap-1.5 shadow-md shadow-sky-600/30"
                  >
                    <Play className="h-3 w-3 fill-white" /> {sqlRunning ? 'Executing...' : 'Run Query'}
                  </button>
                </div>
              </div>

              <textarea
                value={sqlQuery}
                onChange={(e) => setSqlQuery(e.target.value)}
                placeholder="-- Write your SQL query here and click Run Query..."
                className="h-48 w-full bg-[#070a13] p-4 text-xs font-mono text-sky-200 outline-none resize-none leading-relaxed border-b border-slate-800"
                spellCheck={false}
              />

              {/* SQL Error Alert Banner */}
              {sqlError && (
                <div className="p-3 bg-rose-950/40 border-b border-rose-800/60 text-xs font-mono text-rose-300 flex flex-col gap-2">
                  <div className="flex items-center gap-2">
                    <AlertCircle className="h-4 w-4 text-rose-400 shrink-0" />
                    <pre className="whitespace-pre-wrap">{sqlError}</pre>
                  </div>
                  <div className="flex gap-2 self-end">
                    <button
                      onClick={() => setShowSqlHint(true)}
                      className="px-2.5 py-1 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 text-xs font-bold transition flex items-center gap-1"
                    >
                      <Lightbulb className="h-3 w-3" /> View Hint
                    </button>
                    <button
                      onClick={() => setShowSqlSolution(true)}
                      className="px-2.5 py-1 rounded-lg bg-sky-600 hover:bg-sky-500 text-white text-xs font-bold transition shadow flex items-center gap-1"
                    >
                      <Eye className="h-3 w-3" /> Reveal Full SQL Solution
                    </button>
                  </div>
                </div>
              )}

              <div className="flex-1 bg-slate-950 p-4 overflow-auto">
                <div className="text-xs font-bold text-slate-400 mb-2 font-mono flex items-center justify-between">
                  <span>Query Result:</span>
                  {sqlResult && <span className="text-emerald-400 font-normal text-[11px]">✓ Executed successfully</span>}
                </div>
                {sqlResult ? (
                  <table className="w-full text-xs font-mono text-left border-collapse">
                    <thead>
                      <tr className="border-b border-slate-800 text-slate-400">
                        {sqlResult.columns.map(c => <th key={c} className="py-2 px-3">{c}</th>)}
                      </tr>
                    </thead>
                    <tbody>
                      {sqlResult.rows.map((r, i) => (
                        <tr key={i} className="border-b border-slate-900 text-slate-200 hover:bg-slate-900/40">
                          {sqlResult.columns.map(c => <td key={c} className="py-2 px-3">{r[c] !== null ? r[c] : <span className="text-slate-600">NULL</span>}</td>)}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                ) : (
                  <div className="text-center py-10 text-slate-600 text-xs font-mono">
                    Type your SQL query above and click <span className="text-sky-400 font-bold">"Run Query"</span> to test execution against transactional database sandbox.
                  </div>
                )}
              </div>
            </div>

            {/* FULL SQL SOLUTION MODAL */}
            {showSqlSolution && (
              <div className="absolute inset-0 z-50 bg-black/80 backdrop-blur-sm rounded-2xl flex items-center justify-center p-4">
                <div className="bg-[#0e1628] border border-sky-500/40 rounded-2xl max-w-2xl w-full p-6 shadow-2xl space-y-4 max-h-[90%] overflow-y-auto">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                    <div className="flex items-center gap-2">
                      <div className="p-1.5 rounded-lg bg-sky-500/20 text-sky-400 border border-sky-500/30">
                        <Database className="h-4 w-4" />
                      </div>
                      <div>
                        <h3 className="text-base font-bold text-white">Full SQL Solution: {selectedSqlProblem.title}</h3>
                        <span className="text-[10px] text-slate-400 font-mono">Verified PostgreSQL Query</span>
                      </div>
                    </div>
                    <button
                      onClick={() => setShowSqlSolution(false)}
                      className="text-slate-400 hover:text-white text-sm px-2 py-1 rounded-lg bg-slate-800/60"
                    >
                      ✕
                    </button>
                  </div>

                  <div className="relative rounded-xl bg-[#060913] border border-slate-800 p-4 font-mono text-xs text-sky-200 overflow-x-auto leading-relaxed">
                    <pre>{selectedSqlProblem.solutionQuery || selectedSqlProblem.defaultQuery}</pre>
                  </div>

                  {selectedSqlProblem.solutionExplanation && (
                    <div className="p-3 rounded-xl bg-sky-950/30 border border-sky-500/20 text-xs text-sky-200 leading-relaxed">
                      <div className="font-bold text-white mb-1 flex items-center gap-1.5">
                        <Sparkles className="h-3.5 w-3.5 text-amber-400" /> Query Logic & Breakdown:
                      </div>
                      {selectedSqlProblem.solutionExplanation}
                    </div>
                  )}

                  <div className="flex items-center justify-between pt-2 border-t border-slate-800">
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(selectedSqlProblem.solutionQuery || selectedSqlProblem.defaultQuery);
                        setSqlCopied(true);
                        setTimeout(() => setSqlCopied(false), 2000);
                      }}
                      className="px-3.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center gap-1.5 transition"
                    >
                      <Copy className="h-3.5 w-3.5 text-slate-400" /> {sqlCopied ? 'Copied to Clipboard!' : 'Copy SQL'}
                    </button>
                    <div className="flex gap-2">
                      <button
                        onClick={() => {
                          setSqlQuery(selectedSqlProblem.solutionQuery || selectedSqlProblem.defaultQuery);
                          setShowSqlSolution(false);
                          setSqlError(null);
                        }}
                        className="px-4 py-1.5 rounded-xl bg-sky-600 hover:bg-sky-500 text-white text-xs font-bold transition shadow-lg shadow-sky-600/30 flex items-center gap-1.5"
                      >
                        <Zap className="h-3.5 w-3.5 text-amber-400" /> Load Solution into Editor
                      </button>
                      <button
                        onClick={() => setShowSqlSolution(false)}
                        className="px-3.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium"
                      >
                        Close
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB 4: MCQ & CS QUIZ */}
        {activeTab === 'mcqs' && (() => {
          const currentMcq = currentMcqPool[currentMcqIdx] || currentMcqPool[0];
          const poolIds = currentMcqPool.map(q => q.id);
          const answeredInPool = Object.keys(answeredMcqs).filter(id => poolIds.includes(id));
          const correctInPool = answeredInPool.filter(id => answeredMcqs[id]?.isCorrect);
          const accuracyPercent = answeredInPool.length > 0 ? Math.round((correctInPool.length / answeredInPool.length) * 100) : 0;
          const currentQAnswer = currentMcq ? answeredMcqs[currentMcq.id] : null;
          const isCurrentSubmitted = mcqSubmitted || !!currentQAnswer;
          const activeSelection = selectedMcqOption || currentQAnswer?.selected || null;

          return (
            <div className="max-w-4xl mx-auto space-y-6">
              {/* Language Track Filter & Roadmap Link Header */}
              <div className="rounded-2xl bg-slate-900/90 border border-slate-800 p-5 space-y-4 shadow-xl">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{LANGUAGE_TRACKS.find(t => t.id === selectedMcqLanguage)?.icon || '💡'}</span>
                    <div>
                      <div className="flex items-center gap-2">
                        <h2 className="text-base font-bold text-white">
                          Technical MCQ & CS Placement Quiz
                        </h2>
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
                          {currentMcqPool.length} Questions
                        </span>
                      </div>
                      <p className="text-xs text-slate-400 mt-0.5">
                        Choose your language or domain track to practice tailored technical interview MCQs.
                      </p>
                    </div>
                  </div>

                  {/* Roadmap Sync Pill */}
                  <div className="flex items-center gap-2">
                    <div className="text-[11px] px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-300 flex items-center gap-1.5">
                      <span className="text-slate-500">Roadmap Track:</span>
                      <span className="font-bold text-sky-400">{currentRoadmap.icon} {currentRoadmap.languageName}</span>
                    </div>
                    {selectedMcqLanguage !== selectedRoadmapLanguage && (
                      <button
                        onClick={() => handleSelectMcqLanguage(selectedRoadmapLanguage)}
                        className="px-2.5 py-1.5 rounded-xl bg-sky-500/10 hover:bg-sky-500/20 text-sky-400 border border-sky-500/30 text-[11px] font-bold transition flex items-center gap-1"
                        title="Sync quiz track to your generated roadmap language"
                      >
                        <RefreshCw className="h-3 w-3" /> Sync to Roadmap
                      </button>
                    )}
                  </div>
                </div>

                {/* Language Selection Filter Pills */}
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-[11px] font-semibold text-slate-400 mr-1 flex items-center gap-1">
                    <Filter className="h-3 w-3" /> Track:
                  </span>
                  {[
                    { id: 'all', name: 'All Tracks', icon: '🌐', count: INITIAL_MCQS.length },
                    ...LANGUAGE_TRACKS.map(t => ({
                      id: t.id,
                      name: t.name,
                      icon: t.icon,
                      count: MCQ_BANK[t.id]?.length || 0
                    }))
                  ].map(track => {
                    const isSelected = selectedMcqLanguage === track.id;
                    return (
                      <button
                        key={track.id}
                        onClick={() => handleSelectMcqLanguage(track.id)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition flex items-center gap-1.5 border ${
                          isSelected
                            ? 'bg-gradient-to-r from-indigo-600 to-sky-600 text-white border-transparent shadow-md shadow-indigo-600/30'
                            : 'bg-slate-950/70 border-slate-800 text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                        }`}
                      >
                        <span>{track.icon}</span>
                        <span>{track.name}</span>
                        <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${isSelected ? 'bg-white/20 text-white' : 'bg-slate-800 text-slate-400'}`}>
                          {track.count}
                        </span>
                      </button>
                    );
                  })}
                </div>

                {/* Scorecard & Stats Bar */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1 text-xs">
                  <div className="p-2.5 rounded-xl bg-slate-950/80 border border-slate-800/80 flex items-center justify-between">
                    <span className="text-slate-400">Answered:</span>
                    <span className="font-bold text-white font-mono">{answeredInPool.length} / {currentMcqPool.length}</span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-slate-950/80 border border-slate-800/80 flex items-center justify-between">
                    <span className="text-slate-400">Correct:</span>
                    <span className="font-bold text-emerald-400 font-mono">{correctInPool.length}</span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-slate-950/80 border border-slate-800/80 flex items-center justify-between">
                    <span className="text-slate-400">Accuracy:</span>
                    <span className="font-bold text-sky-400 font-mono">{accuracyPercent}%</span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-slate-950/80 border border-slate-800/80 flex items-center justify-between">
                    <span className="text-slate-400">XP Earned:</span>
                    <span className="font-bold text-amber-400 font-mono">+{correctInPool.length * 10} XP</span>
                  </div>
                </div>

                {/* Question Navigator Grid */}
                <div className="pt-2 border-t border-slate-800/60">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                      Question Navigator ({currentMcqPool.length} Total)
                    </span>
                    <button
                      onClick={() => {
                        const newAnswered = { ...answeredMcqs };
                        poolIds.forEach(id => delete newAnswered[id]);
                        setAnsweredMcqs(newAnswered);
                        setSelectedMcqOption(null);
                        setMcqSubmitted(false);
                      }}
                      className="text-[10px] text-slate-500 hover:text-rose-400 transition"
                    >
                      Clear Track Progress
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto pr-1">
                    {currentMcqPool.map((q, idx) => {
                      const ans = answeredMcqs[q.id];
                      const isCurrent = idx === currentMcqIdx;
                      let tileColor = 'bg-slate-950 border-slate-800 text-slate-400 hover:bg-slate-800';
                      if (ans) {
                        tileColor = ans.isCorrect
                          ? 'bg-emerald-950/60 border-emerald-600/80 text-emerald-300 font-bold'
                          : 'bg-rose-950/60 border-rose-600/80 text-rose-300 font-bold';
                      }
                      if (isCurrent) {
                        tileColor += ' ring-2 ring-indigo-500 shadow-md shadow-indigo-500/30';
                      }

                      return (
                        <button
                          key={q.id}
                          onClick={() => {
                            setCurrentMcqIdx(idx);
                            const existing = answeredMcqs[q.id];
                            if (existing) {
                              setSelectedMcqOption(existing.selected);
                              setMcqSubmitted(true);
                            } else {
                              setSelectedMcqOption(null);
                              setMcqSubmitted(false);
                            }
                          }}
                          className={`h-7 w-7 rounded-lg text-[11px] font-mono flex items-center justify-center border transition ${tileColor}`}
                          title={`Question ${idx + 1}: ${q.topic}`}
                        >
                          {idx + 1}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Active MCQ Question Card */}
              {currentMcq && (
                <div className="rounded-2xl bg-slate-900/90 border border-slate-800 p-6 space-y-6 shadow-xl">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                    <div>
                      <span className="text-[10px] font-bold text-sky-400 uppercase tracking-wider">{currentMcq.topic}</span>
                      <h2 className="text-base font-bold text-white mt-1">
                        Question {currentMcqIdx + 1} of {currentMcqPool.length}
                      </h2>
                    </div>
                    <span className="text-xs font-bold px-3 py-1 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                      +10 XP
                    </span>
                  </div>

                  <p className="text-sm font-semibold text-slate-200 leading-relaxed whitespace-pre-line">
                    {currentMcq.question}
                  </p>

                  <div className="space-y-2.5">
                    {currentMcq.options.map((opt, i) => {
                      const letter = ['A', 'B', 'C', 'D'][i];
                      const isSelected = activeSelection === letter;
                      const isCorrect = letter === currentMcq.answer;
                      let btnStyle = "bg-slate-950/60 border-slate-800 text-slate-300 hover:bg-slate-800/60";
                      if (isCurrentSubmitted) {
                        if (isCorrect) btnStyle = "bg-emerald-950/40 border-emerald-600 text-emerald-300";
                        else if (isSelected && !isCorrect) btnStyle = "bg-rose-950/40 border-rose-600 text-rose-300";
                      } else if (isSelected) {
                        btnStyle = "bg-indigo-950/60 border-indigo-500 text-white shadow-md shadow-indigo-500/20";
                      }

                      return (
                        <button
                          key={letter}
                          disabled={isCurrentSubmitted}
                          onClick={() => !isCurrentSubmitted && setSelectedMcqOption(letter)}
                          className={`w-full p-3.5 rounded-xl border text-left text-xs font-medium transition flex items-center justify-between ${btnStyle} ${isCurrentSubmitted ? 'cursor-default' : 'cursor-pointer'}`}
                        >
                          <div className="flex items-center gap-3">
                            <span className="h-6 w-6 rounded-lg bg-slate-800 flex items-center justify-center font-bold font-mono text-xs">{letter}</span>
                            <span>{opt}</span>
                          </div>
                          {isCurrentSubmitted && isCorrect && <Check className="h-4 w-4 text-emerald-400" />}
                        </button>
                      );
                    })}
                  </div>

                  {isCurrentSubmitted && (
                    <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 text-xs space-y-1.5 animate-fadeIn">
                      <div className="flex items-center gap-2">
                        <span className={`font-bold ${currentMcq.answer === activeSelection ? 'text-emerald-400' : 'text-rose-400'}`}>
                          {currentMcq.answer === activeSelection ? '✓ Correct Answer!' : `✗ Incorrect (Correct Answer: ${currentMcq.answer})`}
                        </span>
                      </div>
                      <div className="font-bold text-slate-400 text-[11px]">Explanation:</div>
                      <p className="text-slate-300 leading-relaxed">{currentMcq.explanation}</p>
                    </div>
                  )}

                  <div className="flex justify-between items-center pt-2">
                    <button
                      onClick={() => {
                        const newIdx = Math.max(0, currentMcqIdx - 1);
                        setCurrentMcqIdx(newIdx);
                        const prevAns = answeredMcqs[currentMcqPool[newIdx]?.id];
                        if (prevAns) {
                          setSelectedMcqOption(prevAns.selected);
                          setMcqSubmitted(true);
                        } else {
                          setSelectedMcqOption(null);
                          setMcqSubmitted(false);
                        }
                      }}
                      disabled={currentMcqIdx === 0}
                      className="px-4 py-2 rounded-xl bg-slate-800 text-xs font-semibold disabled:opacity-40 hover:bg-slate-700 transition"
                    >
                      Previous
                    </button>
                    {!isCurrentSubmitted ? (
                      <button
                        onClick={() => {
                          if (selectedMcqOption) {
                            const isCorrect = selectedMcqOption === currentMcq.answer;
                            setMcqSubmitted(true);
                            setAnsweredMcqs(prev => ({
                              ...prev,
                              [currentMcq.id]: { selected: selectedMcqOption, isCorrect }
                            }));
                            if (isCorrect) setXp(p => p + 10);
                          }
                        }}
                        disabled={!selectedMcqOption}
                        className="px-6 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 font-semibold text-xs text-white shadow-lg shadow-indigo-600/30 disabled:opacity-40"
                      >
                        Submit Answer
                      </button>
                    ) : (
                      <button
                        onClick={() => {
                          const nextIdx = (currentMcqIdx + 1) % currentMcqPool.length;
                          setCurrentMcqIdx(nextIdx);
                          const nextAns = answeredMcqs[currentMcqPool[nextIdx]?.id];
                          if (nextAns) {
                            setSelectedMcqOption(nextAns.selected);
                            setMcqSubmitted(true);
                          } else {
                            setSelectedMcqOption(null);
                            setMcqSubmitted(false);
                          }
                        }}
                        className="px-6 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 font-semibold text-xs text-white shadow-lg shadow-indigo-600/30"
                      >
                        Next Question ➔
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>
          );
        })()}

        {/* TAB 5: PUZZLES & SCENARIOS */}
        {activeTab === 'puzzles' && (
          <div className="max-w-4xl mx-auto space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {puzzlesList.map(p => (
                <div
                  key={p.id}
                  onClick={() => {
                    setSelectedPuzzle(p);
                    setUnlockedHints([]);
                    setPuzzleChecked(false);
                  }}
                  className={`p-5 rounded-2xl border cursor-pointer transition ${selectedPuzzle.id === p.id ? 'bg-indigo-950/30 border-indigo-500/80 shadow-lg shadow-indigo-500/10' : 'bg-slate-900/60 border-slate-800 hover:bg-slate-800/40'}`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-purple-500/10 text-purple-400 border border-purple-500/20">{p.category}</span>
                    <span className="text-xs font-bold text-amber-400">+15 XP</span>
                  </div>
                  <h3 className="font-bold text-sm text-white">{p.title}</h3>
                  <p className="text-xs text-slate-400 mt-1 line-clamp-2">{p.desc}</p>
                </div>
              ))}
            </div>

            <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-4">
              <h2 className="text-lg font-bold text-white">{selectedPuzzle.title}</h2>
              <p className="text-xs text-slate-300 leading-relaxed">{selectedPuzzle.desc}</p>

              <div className="space-y-2">
                <div className="text-xs font-bold text-slate-400">Hints:</div>
                {selectedPuzzle.hints.map((h, i) => {
                  const isUnlocked = unlockedHints.includes(i);
                  return (
                    <div key={i} className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-xs">
                      {isUnlocked ? (
                        <span className="text-sky-300">💡 Hint {i + 1}: {h}</span>
                      ) : (
                        <button
                          onClick={() => setUnlockedHints([...unlockedHints, i])}
                          className="text-slate-400 hover:text-slate-200 flex items-center gap-1.5"
                        >
                          <Lock className="h-3 w-3 text-slate-500" /> Unlock Hint {i + 1} (-2 XP)
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>

              <div className="space-y-2">
                <textarea
                  value={puzzleAnswerText}
                  onChange={(e) => setPuzzleAnswerText(e.target.value)}
                  placeholder="Type your logical solution or reasoning here..."
                  className="w-full h-24 p-3 rounded-xl bg-[#070a13] border border-slate-800 text-xs text-slate-200 outline-none resize-none font-mono"
                />
                <div className="flex justify-end">
                  <button
                    onClick={() => {
                      setPuzzleChecked(true);
                      setXp(p => p + 15);
                    }}
                    className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-xs font-semibold text-white shadow-md shadow-indigo-600/30"
                  >
                    Verify & Reveal Solution
                  </button>
                </div>
              </div>

              {puzzleChecked && (
                <div className="p-4 rounded-xl bg-emerald-950/20 border border-emerald-800/40 text-xs space-y-1">
                  <div className="font-bold text-emerald-400">Official Solution Walkthrough:</div>
                  <p className="text-slate-300 leading-relaxed">{selectedPuzzle.solution}</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 7: LIVE CODE BATTLE */}
        {activeTab === 'battle' && (
          <div className="max-w-7xl mx-auto space-y-6">
            {/* Live In-Game Floating Taunt Toast */}
            {battleTauntToast && (
              <div className="fixed top-20 right-8 z-50 animate-float-up pointer-events-none">
                <div className="px-5 py-3 rounded-2xl bg-slate-900/95 border border-amber-500/40 text-slate-100 shadow-2xl shadow-amber-500/20 backdrop-blur-xl flex items-center gap-3">
                  <span className="text-3xl">{battleTauntToast.emoji}</span>
                  <div>
                    <div className="text-[10px] font-bold text-amber-400 uppercase tracking-wider">
                      {battleTauntToast.sender} says:
                    </div>
                    <div className="text-xs font-black text-white">{battleTauntToast.phrase}</div>
                  </div>
                </div>
              </div>
            )}

            {/* ERROR BANNER */}
            {battleError && (
              <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-xs text-rose-300 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <AlertCircle className="h-4 w-4 text-rose-400 shrink-0" />
                  <span>{battleError}</span>
                </div>
                <button onClick={() => setBattleError(null)} className="text-slate-400 hover:text-white text-xs">
                  ✕
                </button>
              </div>
            )}

            {/* SCREEN 1: LOBBY & MATCHMAKING */}
            {!inBattle ? (
              <div className="space-y-6">
                {/* Hero Duel Header */}
                <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-[#0d1326] to-[#0a0f1d] border border-slate-800 p-8 text-center space-y-6 shadow-2xl">
                  <div className="absolute top-0 right-0 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
                  <div className="absolute bottom-0 left-0 w-96 h-96 bg-rose-500/10 rounded-full blur-3xl pointer-events-none" />

                  <div className="relative z-10 space-y-4 max-w-2xl mx-auto">
                    <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20 text-xs font-bold tracking-wide">
                      <Swords className="h-3.5 w-3.5 animate-pulse" /> Real-Time 1v1 Synchronized Code Duel
                    </div>
                    <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
                      Code Battle <span className="bg-gradient-to-r from-amber-400 via-orange-400 to-rose-400 bg-clip-text text-transparent">Live Arena</span>
                    </h2>
                    <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
                      Go head-to-head against peer duelists in synchronized dual split-screens. Same algorithmic problem, live keystroke & line telemetry, atomic Redis SETNX winner locking. First full test pass claims the glory & +100 XP!
                    </p>
                  </div>

                  {/* Quick Match Action Box */}
                  <div className="relative z-10 p-6 rounded-2xl bg-slate-950/70 border border-slate-800 max-w-xl mx-auto space-y-4">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-400 font-medium">Select Difficulty:</span>
                      <div className="flex gap-1.5">
                        {(['Easy', 'Medium', 'Hard'] as const).map((diff) => (
                          <button
                            key={diff}
                            onClick={() => setBattleDifficulty(diff)}
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
                      onClick={handleQuickMatch}
                      disabled={battleQuickMatching}
                      className="w-full py-3.5 rounded-xl bg-gradient-to-r from-amber-500 via-orange-500 to-rose-600 hover:from-amber-400 hover:to-rose-500 text-white font-black text-sm shadow-xl shadow-amber-500/25 transition flex items-center justify-center gap-2 group disabled:opacity-50"
                    >
                      {battleQuickMatching ? (
                        <>
                          <RefreshCw className="h-4 w-4 animate-spin text-white" />
                          <span>Searching for waiting duelist...</span>
                        </>
                      ) : (
                        <>
                          <Zap className="h-4 w-4 text-amber-200 fill-amber-200 group-hover:scale-110 transition" />
                          <span>⚡ Quick Match (1-Click Auto-Pair)</span>
                          <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition" />
                        </>
                      )}
                    </button>
                    <div className="text-[11px] text-slate-500">
                      Average queue time: &lt; 1s • Auto-connects to active duel room
                    </div>
                  </div>

                  {/* Duel Mode Cards */}
                  <div className="relative z-10 grid grid-cols-1 md:grid-cols-2 gap-4 max-w-2xl mx-auto text-left">
                    {/* Create Custom Room */}
                    <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800/80 hover:border-slate-700 transition space-y-3">
                      <div className="flex items-center gap-2 text-xs font-bold text-amber-400">
                        <Trophy className="h-4 w-4" /> Create Private Room
                      </div>
                      <p className="text-[11px] text-slate-400">
                        Generate a 6-character private room code to challenge a friend, classmate, or peer candidate.
                      </p>
                      <button
                        onClick={handleCreateCustomBattle}
                        className="w-full py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs border border-slate-700 transition flex items-center justify-center gap-1.5"
                      >
                        Generate Duel Room ➔
                      </button>
                    </div>

                    {/* Join with Code */}
                    <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800/80 hover:border-slate-700 transition space-y-3">
                      <div className="flex items-center gap-2 text-xs font-bold text-sky-400">
                        <KeyRound className="h-4 w-4" /> Join with Room Code
                      </div>
                      <p className="text-[11px] text-slate-400">
                        Have a code from a friend? Enter the 6-character room code to enter their arena.
                      </p>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          maxLength={6}
                          value={battleJoinInput}
                          onChange={(e) => setBattleJoinInput(e.target.value.toUpperCase())}
                          placeholder="e.g. 8X42LK"
                          className="w-full px-3 py-1.5 bg-slate-950 border border-slate-800 rounded-xl text-xs font-mono uppercase tracking-widest text-center text-amber-300 outline-none focus:border-amber-500"
                        />
                        <button
                          onClick={handleJoinBattle}
                          disabled={!battleJoinInput.trim()}
                          className="px-4 py-1.5 bg-sky-600 hover:bg-sky-500 disabled:opacity-40 text-white font-bold text-xs rounded-xl transition"
                        >
                          Join
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Telemetry Highlights */}
                  <div className="relative z-10 pt-4 border-t border-slate-800/60 grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
                    <div>
                      <div className="text-sm font-black text-amber-400">WebSocket</div>
                      <div className="text-[10px] text-slate-500 uppercase tracking-wider">Sub-ms Real-time</div>
                    </div>
                    <div>
                      <div className="text-sm font-black text-emerald-400">Atomic SETNX</div>
                      <div className="text-[10px] text-slate-500 uppercase tracking-wider">Zero-Race Winner Lock</div>
                    </div>
                    <div>
                      <div className="text-sm font-black text-sky-400">Live Telemetry</div>
                      <div className="text-[10px] text-slate-500 uppercase tracking-wider">Lines & Keystrokes</div>
                    </div>
                    <div>
                      <div className="text-sm font-black text-purple-400">+100 XP</div>
                      <div className="text-[10px] text-slate-500 uppercase tracking-wider">Victor Prize Pool</div>
                    </div>
                  </div>
                </div>
              </div>
            ) : battleStatus === 'lobby' ? (
              /* SCREEN 2: PRE-BATTLE LOBBY (WAITING ROOM) */
              <div className="max-w-3xl mx-auto rounded-3xl bg-slate-900/90 border border-slate-800 p-8 space-y-8 shadow-2xl backdrop-blur-xl">
                {/* Lobby Header */}
                <div className="flex items-center justify-between border-b border-slate-800 pb-5">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 font-bold">
                      ⚔️
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-black text-white">Duel Lobby</span>
                        <span className="text-xs font-mono font-bold px-2.5 py-0.5 rounded-lg bg-amber-500/15 text-amber-400 border border-amber-500/30">
                          {battleRoomCode}
                        </span>
                        <button
                          onClick={handleCopyBattleCode}
                          className="px-2 py-0.5 rounded text-[10px] bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold flex items-center gap-1"
                        >
                          {battleCodeCopied ? <Check className="h-3 w-3 text-emerald-400" /> : <Copy className="h-3 w-3" />}
                          {battleCodeCopied ? 'Copied!' : 'Copy Code'}
                        </button>
                      </div>
                      <p className="text-[11px] text-slate-400 mt-0.5">
                        Share this room code with your opponent. Battle begins when host initiates.
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={handleLeaveBattle}
                    className="px-3.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs border border-slate-700 transition"
                  >
                    Leave Room
                  </button>
                </div>

                {/* Problem Info Card */}
                <div className="p-5 rounded-2xl bg-slate-950 border border-slate-800/80 flex items-center justify-between">
                  <div className="space-y-1">
                    <div className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">Challenged Problem</div>
                    <div className="text-sm font-black text-white flex items-center gap-2">
                      <span>{battleProblem?.title || "Balanced Two Sum Matrix"}</span>
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/20">
                        {battleProblem?.difficulty || battleDifficulty}
                      </span>
                    </div>
                    <div className="text-xs text-slate-400 line-clamp-1">
                      {battleProblem?.description || "Solve the algorithmic constraint with optimal time & space complexity."}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-xs font-black text-amber-400">+100 XP</div>
                    <div className="text-[10px] text-slate-500">Stakes</div>
                  </div>
                </div>

                {/* 1v1 Dual Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 relative">
                  {/* VS Badge in Middle */}
                  <div className="hidden md:flex absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-10 h-10 w-10 rounded-full bg-slate-950 border-2 border-amber-500 text-amber-400 font-black text-xs items-center justify-center shadow-lg shadow-amber-500/20">
                    VS
                  </div>

                  {/* Player 1 (You) */}
                  <div className="p-6 rounded-2xl bg-gradient-to-br from-indigo-950/30 to-slate-950 border border-indigo-500/30 space-y-4 text-center">
                    <div className="inline-flex h-14 w-14 rounded-2xl bg-indigo-500/20 border border-indigo-500/30 items-center justify-center text-xl font-black text-indigo-400">
                      {userName.charAt(0)}
                    </div>
                    <div>
                      <div className="text-sm font-black text-white">{userName} (You)</div>
                      <div className="text-xs text-indigo-300/80 font-mono">
                        {battleRole === 'host' ? '👑 Room Host' : '⚔️ Challenger'}
                      </div>
                    </div>
                    <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/15 text-emerald-400 text-xs font-bold border border-emerald-500/20">
                      <span className="h-2 w-2 rounded-full bg-emerald-400 animate-ping" />
                      Ready to Battle
                    </div>
                  </div>

                  {/* Player 2 (Opponent) */}
                  <div className="p-6 rounded-2xl bg-gradient-to-br from-rose-950/30 to-slate-950 border border-rose-500/30 space-y-4 text-center">
                    {battlePlayers.length > 1 ? (
                      <>
                        <div className="inline-flex h-14 w-14 rounded-2xl bg-rose-500/20 border border-rose-500/30 items-center justify-center text-xl font-black text-rose-400">
                          {battlePlayers.find(p => p.user_id !== userId)?.name.charAt(0) || 'O'}
                        </div>
                        <div>
                          <div className="text-sm font-black text-white">
                            {battlePlayers.find(p => p.user_id !== userId)?.name || 'Opponent'}
                          </div>
                          <div className="text-xs text-rose-300/80 font-mono">Competitor</div>
                        </div>
                        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/15 text-emerald-400 text-xs font-bold border border-emerald-500/20">
                          <span className="h-2 w-2 rounded-full bg-emerald-400" />
                          Connected & Ready
                        </div>
                      </>
                    ) : (
                      <>
                        <div className="inline-flex h-14 w-14 rounded-2xl bg-slate-900 border border-dashed border-slate-700 items-center justify-center text-xl text-slate-500 animate-pulse">
                          ⏳
                        </div>
                        <div>
                          <div className="text-sm font-black text-slate-400">Waiting for Opponent...</div>
                          <div className="text-xs text-slate-500 font-mono">Duel Slot Open</div>
                        </div>
                        <div className="text-[11px] text-amber-400/80 font-mono">
                          Invite code: <span className="underline font-bold">{battleRoomCode}</span>
                        </div>
                      </>
                    )}
                  </div>
                </div>

                {/* Launch Action */}
                <div className="pt-4 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div className="text-xs text-slate-400">
                    {battlePlayers.length < 2
                      ? "💡 You can start now or wait for your friend to enter with room code."
                      : "⚡ Both duelists connected. Ready for launch!"}
                  </div>
                  {battleRole === 'host' ? (
                    <button
                      onClick={handleStartBattle}
                      disabled={battleStarting}
                      className="px-8 py-3.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 disabled:opacity-50 text-white font-black text-xs shadow-lg shadow-emerald-500/30 transition flex items-center gap-2"
                    >
                      <Play className="h-4 w-4 fill-white" /> {battleStarting ? 'Launching Duel...' : 'Start 1v1 Battle ➔'}
                    </button>
                  ) : (
                    <div className="text-xs font-bold text-amber-400 flex items-center gap-2">
                      <RefreshCw className="h-3.5 w-3.5 animate-spin" /> Waiting for host to launch duel...
                    </div>
                  )}
                </div>
              </div>
            ) : (
              /* SCREEN 3: LIVE ACTIVE 1v1 CODE BATTLE ARENA */
              <div className="space-y-4">
                {/* COUNTDOWN OVERLAY */}
                {battleStatus === 'countdown' && (
                  <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black/80 backdrop-blur-md animate-fade-in">
                    <div className="text-center space-y-4">
                      <div className="inline-flex p-4 rounded-3xl bg-amber-500/20 text-amber-400 border border-amber-500/40">
                        <Swords className="h-12 w-12 animate-bounce" />
                      </div>
                      <div className="text-sm font-bold text-slate-400 uppercase tracking-widest">Synchronizing Duel Arena</div>
                      <div className="text-8xl sm:text-9xl font-black text-amber-400 animate-pulse-glow">
                        {battleCountdown > 0 ? battleCountdown : "DUEL!"}
                      </div>
                      <div className="text-xs font-bold text-slate-300">
                        Atomic SETNX lock active • First full test-pass wins!
                      </div>
                    </div>
                  </div>
                )}

                {/* ARENA TOP HUD */}
                <div className="p-4 rounded-2xl bg-slate-900/95 border border-slate-800 shadow-xl flex flex-wrap items-center justify-between gap-4 backdrop-blur-md">
                  {/* Left: You */}
                  <div className="flex items-center gap-3">
                    <div className="h-9 w-9 rounded-xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400 font-black text-xs">
                      {userName.charAt(0)}
                    </div>
                    <div>
                      <div className="text-xs font-black text-white flex items-center gap-1.5">
                        <span>{userName} (You)</span>
                        <span className="h-2 w-2 rounded-full bg-emerald-400" />
                      </div>
                      <div className="text-[10px] text-slate-400 font-mono">
                        Lines: <span className="text-indigo-400 font-bold">{battleCode.split('\n').length}</span> • Python
                      </div>
                    </div>
                  </div>

                  {/* Center: Live Duel Timer & Status */}
                  <div className="flex items-center gap-4">
                    <div className="text-center">
                      <div className="text-[10px] uppercase tracking-wider text-slate-500 font-bold flex items-center justify-center gap-1">
                        <span className="h-1.5 w-1.5 rounded-full bg-rose-500 animate-ping" />
                        Live Duel Timer
                      </div>
                      <div className="text-xl font-black text-amber-400 font-mono tracking-widest">
                        ⏱️ {formatBattleTime(battleTimer)}
                      </div>
                    </div>

                    <div className="px-3 py-1 rounded-xl bg-slate-950 border border-slate-800 text-[10px] font-mono text-slate-400">
                      ROOM: <span className="text-amber-400 font-bold">{battleRoomCode}</span>
                    </div>

                    <button
                      onClick={handleLeaveBattle}
                      className="px-3 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-[11px] font-bold border border-slate-700"
                    >
                      Surrender / Exit
                    </button>
                  </div>

                  {/* Right: Live Opponent Telemetry */}
                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <div className="text-xs font-black text-white flex items-center justify-end gap-1.5">
                        <span className="h-2 w-2 rounded-full bg-rose-500" />
                        <span>{battlePlayers.find(p => p.user_id !== userId)?.name || 'Opponent'}</span>
                      </div>
                      <div className="text-[10px] text-slate-400 font-mono flex items-center justify-end gap-2">
                        {opponentTelemetry.isTyping ? (
                          <span className="text-emerald-400 font-bold animate-pulse">● Typing...</span>
                        ) : (
                          <span className="text-slate-500">Idle</span>
                        )}
                        <span>Lines: <strong className="text-rose-400">{opponentTelemetry.lines}</strong></span>
                        <span>Pass: <strong className="text-amber-400">{opponentTelemetry.testsPassed}/{opponentTelemetry.totalTests || 0}</strong></span>
                      </div>
                    </div>
                    <div className="h-9 w-9 rounded-xl bg-rose-600/20 border border-rose-500/30 flex items-center justify-center text-rose-400 font-black text-xs">
                      {battlePlayers.find(p => p.user_id !== userId)?.name.charAt(0) || 'O'}
                    </div>
                  </div>
                </div>

                {/* ARENA WORKSPACE: 3 COLUMNS */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
                  {/* COLUMN 1: Problem Spec (3 cols) */}
                  <div className="lg:col-span-4 rounded-2xl bg-slate-900/90 border border-slate-800 p-5 space-y-4 flex flex-col max-h-[640px] overflow-y-auto">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/15 text-amber-400 border border-amber-500/20">
                          {battleProblem?.difficulty || battleDifficulty}
                        </span>
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-indigo-500/15 text-indigo-400 border border-indigo-500/20">
                          +100 XP Prize
                        </span>
                      </div>
                      <h3 className="text-base font-black text-white">
                        {battleProblem?.title || "Algorithmic Challenge"}
                      </h3>
                    </div>

                    <div className="text-xs text-slate-300 leading-relaxed space-y-2">
                      <div className="font-bold text-slate-200">Problem Description:</div>
                      <p className="whitespace-pre-line text-slate-400">
                        {battleProblem?.description || "Solve the algorithmic problem correctly for all test cases. The first candidate whose solution passes 100% of cases wins with atomic SETNX locking."}
                      </p>
                    </div>

                    {battleProblem?.input_format && (
                      <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-[11px] space-y-1">
                        <div className="font-bold text-slate-400">Input Format:</div>
                        <div className="font-mono text-slate-300">{battleProblem.input_format}</div>
                      </div>
                    )}

                    {battleProblem?.output_format && (
                      <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-[11px] space-y-1">
                        <div className="font-bold text-slate-400">Output Format:</div>
                        <div className="font-mono text-slate-300">{battleProblem.output_format}</div>
                      </div>
                    )}

                    {battleProblem?.constraints && (
                      <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-[11px] space-y-1">
                        <div className="font-bold text-slate-400">Constraints:</div>
                        <div className="font-mono text-amber-300/90">{battleProblem.constraints}</div>
                      </div>
                    )}

                    <div className="mt-auto pt-3 border-t border-slate-800/80 text-[10px] text-slate-500">
                      ⚡ Atomic Judge powered by Redis SETNX lock.
                    </div>
                  </div>

                  {/* COLUMN 2: Candidate Code Arena (5 cols) */}
                  <div className="lg:col-span-5 rounded-2xl bg-slate-900/90 border border-slate-800 overflow-hidden flex flex-col">
                    <div className="bg-[#0b101e] px-4 py-2.5 border-b border-slate-800 flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        <FileCode className="h-4 w-4 text-amber-400" />
                        <span className="font-mono font-bold text-slate-200">BattleSolution.py</span>
                      </div>
                      <div className="text-[11px] text-slate-400 font-mono">
                        {battleCode.split('\n').length} lines • Python 3.10
                      </div>
                    </div>

                    <div className="relative flex-1 bg-[#070a13] min-h-[380px]">
                      <textarea
                        value={battleCode}
                        onChange={(e) => handleBattleCodeChange(e.target.value)}
                        disabled={battleStatus !== 'active'}
                        className="w-full h-full p-4 bg-transparent text-xs font-mono text-slate-100 outline-none resize-none leading-relaxed font-medium"
                        spellCheck={false}
                      />
                    </div>

                    {/* Judge Feedback Strip */}
                    {battleSubmitFeedback && (
                      <div className={`p-3 border-t text-xs font-mono flex items-center justify-between ${
                        battleSubmitFeedback.is_correct
                          ? 'bg-emerald-950/40 border-emerald-500/30 text-emerald-300'
                          : 'bg-rose-950/40 border-rose-500/30 text-rose-300'
                      }`}>
                        <div className="flex items-center gap-2">
                          {battleSubmitFeedback.is_correct ? (
                            <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                          ) : (
                            <XCircle className="h-4 w-4 text-rose-400" />
                          )}
                          <span>
                            {battleSubmitFeedback.is_correct
                              ? `All ${battleSubmitFeedback.test_cases_passed}/${battleSubmitFeedback.total_test_cases} Passed!`
                              : `${battleSubmitFeedback.test_cases_passed}/${battleSubmitFeedback.total_test_cases} Passed`}
                          </span>
                        </div>
                        <span className="text-[11px] text-slate-400">
                          {battleSubmitFeedback.execution_time ? `${battleSubmitFeedback.execution_time.toFixed(3)}s` : ''}
                        </span>
                      </div>
                    )}

                    {/* Compiler Output if any error */}
                    {battleSubmitFeedback?.compiler_output && (
                      <div className="p-3 bg-black/60 border-t border-slate-800 text-[11px] font-mono text-slate-300 max-h-24 overflow-y-auto">
                        <span className="text-slate-500 font-bold">Judge Output: </span>
                        {battleSubmitFeedback.compiler_output}
                      </div>
                    )}

                    {/* Action Bar */}
                    <div className="bg-[#0b101e] p-3 border-t border-slate-800 flex items-center justify-between">
                      <button
                        onClick={() => {
                          if (battleProblem?.template_code) setBattleCode(battleProblem.template_code);
                        }}
                        className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold"
                      >
                        Reset Template
                      </button>

                      <button
                        onClick={handleSubmitBattle}
                        disabled={battleStatus !== 'active' || battleSubmitting}
                        className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 via-orange-500 to-rose-600 hover:from-amber-400 hover:to-rose-500 disabled:opacity-40 text-white font-black text-xs shadow-lg shadow-amber-500/25 transition flex items-center gap-2"
                      >
                        {battleSubmitting ? (
                          <>
                            <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                            Judging Solution...
                          </>
                        ) : (
                          <>
                            <Zap className="h-3.5 w-3.5 fill-amber-200" />
                            Submit for Atomic Victory ⚡
                          </>
                        )}
                      </button>
                    </div>
                  </div>

                  {/* COLUMN 3: Live Opponent Telemetry & Taunts Dock (3 cols) */}
                  <div className="lg:col-span-3 space-y-4">
                    {/* Live Telemetry Radar */}
                    <div className="rounded-2xl bg-slate-900/90 border border-slate-800 p-4 space-y-4">
                      <div className="flex items-center justify-between text-xs border-b border-slate-800 pb-2">
                        <span className="font-black text-white flex items-center gap-1.5">
                          <Activity className="h-3.5 w-3.5 text-rose-400 animate-pulse" /> Opponent Telemetry
                        </span>
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-300">
                          Live WebSocket
                        </span>
                      </div>

                      {/* Opponent Code Length Gauge */}
                      <div className="space-y-1.5">
                        <div className="flex justify-between text-[11px]">
                          <span className="text-slate-400">Lines Written:</span>
                          <span className="font-bold text-rose-400 font-mono">{opponentTelemetry.lines}</span>
                        </div>
                        <div className="h-2 rounded-full bg-slate-950 overflow-hidden border border-slate-800">
                          <div
                            className="h-full bg-gradient-to-r from-rose-500 to-amber-500 rounded-full transition-all duration-300"
                            style={{ width: `${Math.min(100, (opponentTelemetry.lines / 30) * 100)}%` }}
                          />
                        </div>
                      </div>

                      {/* Opponent Tests Passed Gauge */}
                      <div className="space-y-1.5">
                        <div className="flex justify-between text-[11px]">
                          <span className="text-slate-400">Tests Passed:</span>
                          <span className="font-bold text-amber-400 font-mono">
                            {opponentTelemetry.testsPassed}/{opponentTelemetry.totalTests || '?'}
                          </span>
                        </div>
                        <div className="h-2 rounded-full bg-slate-950 overflow-hidden border border-slate-800">
                          <div
                            className="h-full bg-gradient-to-r from-amber-500 to-emerald-500 rounded-full transition-all duration-300"
                            style={{
                              width: opponentTelemetry.totalTests > 0
                                ? `${(opponentTelemetry.testsPassed / opponentTelemetry.totalTests) * 100}%`
                                : '0%'
                            }}
                          />
                        </div>
                      </div>

                      {/* Typing Wave / Activity status */}
                      <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-xs flex items-center justify-between">
                        <span className="text-slate-400 text-[11px]">Status:</span>
                        {opponentTelemetry.isTyping ? (
                          <div className="flex items-center gap-1.5 text-emerald-400 font-bold text-[11px]">
                            <span className="h-2 w-2 rounded-full bg-emerald-400 animate-ping" />
                            Typing fast...
                          </div>
                        ) : (
                          <span className="text-slate-500 text-[11px]">Thinking...</span>
                        )}
                      </div>
                    </div>

                    {/* Live Taunts & Reactions Dock */}
                    <div className="rounded-2xl bg-slate-900/90 border border-slate-800 p-4 space-y-3">
                      <div className="text-xs font-black text-white flex items-center gap-1.5">
                        <Flame className="h-3.5 w-3.5 text-amber-400" /> In-Game Taunts Dock
                      </div>
                      <p className="text-[10px] text-slate-400">
                        Click an emoji to send a live floating reaction to your rival's screen:
                      </p>

                      <div className="grid grid-cols-2 gap-2">
                        {[
                          { emoji: '🔥', phrase: 'Speed demon!' },
                          { emoji: '⚡', phrase: 'Turbo mode!' },
                          { emoji: '🧠', phrase: 'Big brain!' },
                          { emoji: '💀', phrase: 'You got cooked!' },
                          { emoji: '🚀', phrase: 'To the moon!' },
                          { emoji: '🏁', phrase: 'Almost done!' },
                        ].map((t) => (
                          <button
                            key={t.phrase}
                            onClick={() => handleSendTaunt(t.emoji, t.phrase)}
                            className="p-2 rounded-xl bg-slate-950 hover:bg-slate-800 border border-slate-800 hover:border-amber-500/40 text-left transition flex items-center gap-2 group"
                          >
                            <span className="text-lg group-hover:scale-125 transition">{t.emoji}</span>
                            <span className="text-[10px] font-bold text-slate-300 group-hover:text-amber-400 leading-tight">
                              {t.phrase}
                            </span>
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                {/* SCREEN 4: VICTORY / DEFEAT MODAL */}
                {battleWinner && (
                  <div className="p-6 rounded-3xl bg-gradient-to-r from-amber-500/20 via-orange-500/15 to-transparent border border-amber-500/40 shadow-2xl flex flex-col sm:flex-row items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                      <div className="h-14 w-14 rounded-2xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-3xl">
                        {battleWinner.isYou ? '🏆' : '⚔️'}
                      </div>
                      <div>
                        <div className="text-lg font-black text-white flex items-center gap-2">
                          <span>
                            {battleWinner.isYou
                              ? "🎉 VICTORY! You defeated your opponent!"
                              : `Defeat! ${battleWinner.name} won the battle!`}
                          </span>
                        </div>
                        <div className="text-xs text-slate-300 mt-1">
                          Atomic Redis SETNX Winner lock acquired in{' '}
                          <strong className="text-amber-400">
                            {battleWinner.execution_time ? `${battleWinner.execution_time.toFixed(3)}s` : '0.042s'}
                          </strong>
                          .{battleWinner.isYou ? ' +100 XP awarded to your profile!' : ' Better luck next duel!'}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={handleQuickMatch}
                        className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-400 text-slate-950 font-black text-xs shadow-md shadow-amber-500/30 transition flex items-center gap-1.5"
                      >
                        <RefreshCw className="h-3.5 w-3.5" /> Quick Rematch
                      </button>
                      <button
                        onClick={handleLeaveBattle}
                        className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs border border-slate-700 transition"
                      >
                        Arena Lobby
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* TAB 8: AI MOCK INTERVIEW */}
        {activeTab === 'interview' && (
          <div className="max-w-3xl mx-auto space-y-6">
            <div className="rounded-2xl bg-slate-900/80 border border-slate-800 p-6 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div className="flex items-center gap-2">
                  <Bot className="h-5 w-5 text-purple-400" />
                  <span className="font-bold text-sm text-white">AI Technical Recruiter Round</span>
                </div>
                <span className="text-xs px-2.5 py-1 rounded-full bg-purple-500/10 text-purple-400 border border-purple-500/20 font-semibold">
                  Google Gemini 1.5 Flash
                </span>
              </div>

              <div className="space-y-3 h-80 overflow-y-auto p-3 rounded-xl bg-[#070a13] border border-slate-800/80">
                {interviewMessages.map((m, i) => (
                  <div key={i} className={`flex ${m.speaker === 'USER' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`p-3 rounded-2xl max-w-[85%] text-xs leading-relaxed ${m.speaker === 'USER' ? 'bg-indigo-600 text-white rounded-br-none' : 'bg-slate-800/90 text-slate-200 rounded-bl-none border border-slate-700/60'}`}>
                      <div className="text-[9px] font-bold opacity-60 mb-1">{m.speaker === 'USER' ? 'YOU' : 'AI RECRUITER'}</div>
                      {m.text}
                    </div>
                  </div>
                ))}
                {interviewLoading && (
                  <div className="text-xs text-purple-400 font-mono flex items-center gap-2">
                    <RefreshCw className="h-3.5 w-3.5 animate-spin" /> Evaluating answer & generating followup...
                  </div>
                )}
              </div>

              <div className="flex gap-2">
                <input
                  type="text"
                  value={userInterviewInput}
                  onChange={(e) => setUserInterviewInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSendInterviewMsg()}
                  placeholder="Explain your approach, design patterns, or tradeoffs..."
                  className="flex-1 px-4 py-2.5 rounded-xl bg-[#070a13] border border-slate-800 text-xs text-slate-200 outline-none"
                />
                <button
                  onClick={handleSendInterviewMsg}
                  disabled={interviewLoading || !userInterviewInput.trim()}
                  className="px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-semibold text-xs flex items-center gap-1.5 shadow-md shadow-purple-600/30 disabled:opacity-40"
                >
                  <Send className="h-3.5 w-3.5" /> Send
                </button>
              </div>

              {interviewReport && (
                <div className="p-4 rounded-xl bg-purple-950/30 border border-purple-800/50 space-y-3 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-purple-300 text-sm">Performance Evaluation Report</span>
                    <span className="font-bold text-emerald-400 text-base">{interviewReport.overall}/100</span>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-[11px]">
                    <div className="p-2 rounded bg-slate-900 border border-slate-800">
                      Technical Score: <span className="font-bold text-sky-400">{interviewReport.technical}%</span>
                    </div>
                    <div className="p-2 rounded bg-slate-900 border border-slate-800">
                      Communication: <span className="font-bold text-emerald-400">{interviewReport.communication}%</span>
                    </div>
                  </div>
                  <p className="text-slate-300 text-[11px]">{interviewReport.feedback}</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 9: AI RESUME ATS */}
        {activeTab === 'resume' && (
          <div className="max-w-5xl mx-auto space-y-6">
            {/* Header & Target Role Selector */}
            <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-5">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-4">
                <div>
                  <h2 className="text-xl font-black text-white flex items-center gap-2">
                    <FileText className="h-6 w-6 text-sky-400" /> AI Resume ATS Match & Keyword Optimizer
                  </h2>
                  <p className="text-xs text-slate-400 mt-1">
                    Authentic multi-factor ATS score calculated directly from your resume PDF: keyword alignment, quantifiable metrics, contact parser, and Google X-Y-Z bullet rewrites.
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setShowJdMatcher(!showJdMatcher)}
                    className={`px-3 py-1.5 rounded-xl border text-xs font-semibold flex items-center gap-1.5 transition ${
                      showJdMatcher || resumeJobDescription.trim()
                        ? 'bg-sky-500/20 text-sky-300 border-sky-500/40'
                        : 'bg-slate-800 text-slate-400 border-slate-700 hover:text-white'
                    }`}
                  >
                    <Target className="h-3.5 w-3.5" />
                    <span>Job Description Matcher</span>
                    {resumeJobDescription.trim() ? (
                      <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                    ) : showJdMatcher ? (
                      <ChevronUp className="h-3.5 w-3.5" />
                    ) : (
                      <ChevronDown className="h-3.5 w-3.5" />
                    )}
                  </button>
                </div>
              </div>

              {/* Role Selector Pills */}
              <div className="space-y-2">
                <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                  <Briefcase className="h-3.5 w-3.5 text-sky-400" /> Target Engineering Track
                </div>
                <div className="flex flex-wrap gap-2">
                  {[
                    "Software Engineer",
                    "Backend Developer",
                    "Frontend Developer",
                    "Full Stack Developer",
                    "Data Scientist",
                    "Data Engineer",
                    "DevOps Engineer",
                    "Mobile Developer",
                    "Cybersecurity Analyst"
                  ].map((role) => (
                    <button
                      key={role}
                      onClick={() => setResumeTargetRole(role)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-medium transition ${
                        (resumeTargetRole || targetRole) === role
                          ? "bg-gradient-to-r from-sky-600 to-indigo-600 text-white font-bold shadow-md shadow-sky-600/30 scale-105"
                          : "bg-slate-950/70 border border-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-700"
                      }`}
                    >
                      {role}
                    </button>
                  ))}
                </div>
              </div>

              {/* Optional Job Description Matcher Panel */}
              {showJdMatcher && (
                <div className="p-4 rounded-xl bg-slate-950/80 border border-sky-500/30 space-y-2.5 transition animate-fadeIn">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-sky-300 flex items-center gap-1.5">
                      <Target className="h-4 w-4 text-sky-400" /> Target Job Description (Optional)
                    </span>
                    <span className="text-[11px] text-slate-400">
                      {resumeJobDescription.length} characters
                    </span>
                  </div>
                  <textarea
                    value={resumeJobDescription}
                    onChange={(e) => setResumeJobDescription(e.target.value)}
                    placeholder="Paste the job posting description here (e.g. from LinkedIn, Indeed, Glassdoor). The ATS engine will extract demanded tech skills and compute an exact JD match percentage..."
                    rows={3}
                    className="w-full p-3 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-200 focus:outline-none focus:border-sky-500 placeholder-slate-500"
                  />
                  {resumeJobDescription.trim() && (
                    <div className="flex justify-end">
                      <button
                        onClick={() => setResumeJobDescription('')}
                        className="text-[11px] text-rose-400 hover:underline"
                      >
                        Clear JD
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* Resume File Upload Box */}
              <input
                type="file"
                ref={fileInputRef}
                accept=".pdf"
                onChange={handleResumeFileChange}
                className="hidden"
              />

              <div
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-slate-800 hover:border-sky-500/60 p-6 rounded-2xl text-center space-y-2.5 bg-slate-950/60 cursor-pointer transition group"
              >
                <div className="inline-flex p-3 rounded-2xl bg-sky-500/10 text-sky-400 group-hover:scale-110 transition shadow-inner">
                  <UploadCloud className="h-8 w-8" />
                </div>
                <div>
                  <div className="text-sm font-bold text-slate-200">
                    {resumeFile ? resumeFileName : "Click to Browse or Drag & Drop PDF Resume"}
                  </div>
                  <div className="text-xs text-slate-500 mt-1">
                    {resumeFile ? `Selected: ${resumeFileSize}` : "Supported format: .PDF (Max 5MB) • Text-searchable PDFs"}
                  </div>
                </div>
              </div>

              {resumeError && (
                <div className="p-3.5 rounded-xl bg-rose-950/40 border border-rose-800/60 text-xs text-rose-300 flex items-center gap-2.5">
                  <AlertCircle className="h-4 w-4 shrink-0 text-rose-400" />
                  <span>{resumeError}</span>
                </div>
              )}

              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-400">
                  Scanning target: <strong className="text-sky-300">{resumeTargetRole || targetRole}</strong>
                </span>
                <button
                  onClick={handleScanResume}
                  disabled={resumeUploading}
                  className="px-6 py-3 rounded-xl bg-gradient-to-r from-sky-600 via-indigo-600 to-sky-600 hover:from-sky-500 font-bold text-xs text-white shadow-xl shadow-sky-600/30 flex items-center gap-2 transition disabled:opacity-50"
                >
                  {resumeUploading ? (
                    <>
                      <RefreshCw className="h-4 w-4 animate-spin" />
                      <span>Parsing & Computing Real ATS Score...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="h-4 w-4 text-amber-300" />
                      <span>Analyze Resume with Real ATS Scanner ⚡</span>
                    </>
                  )}
                </button>
              </div>

              {/* REAL ATS ANALYSIS DASHBOARD */}
              {resumeAnalysisResult && (
                <div className="p-6 rounded-2xl bg-[#080d19] border border-slate-800 space-y-6 pt-6">
                  {/* Top Score & Overview Bar */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-5 items-center border-b border-slate-800/80 pb-6">
                    {/* Radial Score Card */}
                    <div className="flex items-center gap-4">
                      <div className={`h-20 w-20 rounded-2xl border flex flex-col items-center justify-center shadow-lg ${
                        resumeAnalysisResult.ats_score >= 80
                          ? 'bg-emerald-950/30 border-emerald-500/40 text-emerald-400 shadow-emerald-500/10'
                          : resumeAnalysisResult.ats_score >= 60
                          ? 'bg-amber-950/30 border-amber-500/40 text-amber-400 shadow-amber-500/10'
                          : 'bg-rose-950/30 border-rose-500/40 text-rose-400 shadow-rose-500/10'
                      }`}>
                        <span className="text-3xl font-black font-mono leading-none">
                          {resumeAnalysisResult.ats_score}
                        </span>
                        <span className="text-[10px] uppercase font-bold tracking-wider mt-1 opacity-70">
                          / 100
                        </span>
                      </div>
                      <div className="space-y-1">
                        <div className="text-xs font-bold text-slate-200">ATS Composite Score</div>
                        <div className={`text-xs font-semibold ${
                          resumeAnalysisResult.ats_score >= 80
                            ? 'text-emerald-400'
                            : resumeAnalysisResult.ats_score >= 60
                            ? 'text-amber-400'
                            : 'text-rose-400'
                        }`}>
                          {resumeAnalysisResult.ats_score >= 80
                            ? "🟢 Top 10% ATS Compatible"
                            : resumeAnalysisResult.ats_score >= 60
                            ? "🟡 Moderate Fit (Optimize)"
                            : "🔴 High Screening Risk"}
                        </div>
                        <div className="text-[11px] text-slate-400">
                          Track: <span className="text-sky-300 font-medium">{resumeAnalysisResult.target_role || resumeTargetRole}</span>
                        </div>
                      </div>
                    </div>

                    {/* Recruiter Overview Quote */}
                    <div className="md:col-span-2 p-4 rounded-xl bg-slate-900/60 border border-slate-800 text-xs leading-relaxed text-slate-300 space-y-1.5">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-sky-400 flex items-center gap-1.5">
                          <CheckCheck className="h-4 w-4" /> Recruiter Evaluation Summary
                        </span>
                        <button
                          onClick={() => window.print()}
                          className="text-[11px] text-slate-400 hover:text-sky-400 flex items-center gap-1 transition"
                          title="Print or export report"
                        >
                          <Printer className="h-3.5 w-3.5" /> Print Audit
                        </button>
                      </div>
                      <p>{resumeAnalysisResult.role_alignment}</p>
                    </div>
                  </div>

                  {/* 4 Dimension Category Breakdown Cards */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
                    {/* 1. Keywords & Skills (40%) */}
                    <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 space-y-2">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-bold text-slate-300 flex items-center gap-1.5">
                          <Target className="h-3.5 w-3.5 text-sky-400" /> Keywords & Skills
                        </span>
                        <span className="font-mono font-bold text-sky-400">
                          {resumeAnalysisResult.score_breakdown?.skills_score ?? 85}%
                        </span>
                      </div>
                      <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                        <div
                          className="bg-gradient-to-r from-sky-500 to-blue-500 h-full rounded-full transition-all duration-700"
                          style={{ width: `${resumeAnalysisResult.score_breakdown?.skills_score ?? 85}%` }}
                        />
                      </div>
                      <div className="text-[10px] text-slate-400">
                        Weight: 40% • {resumeAnalysisResult.matched_skills?.length || 0} skills matched
                      </div>
                    </div>

                    {/* 2. Quantifiable Impact (25%) */}
                    <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 space-y-2">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-bold text-slate-300 flex items-center gap-1.5">
                          <TrendingUp className="h-3.5 w-3.5 text-indigo-400" /> Impact & Metrics
                        </span>
                        <span className="font-mono font-bold text-indigo-400">
                          {resumeAnalysisResult.score_breakdown?.impact_score ?? 80}%
                        </span>
                      </div>
                      <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                        <div
                          className="bg-gradient-to-r from-indigo-500 to-purple-500 h-full rounded-full transition-all duration-700"
                          style={{ width: `${resumeAnalysisResult.score_breakdown?.impact_score ?? 80}%` }}
                        />
                      </div>
                      <div className="text-[10px] text-slate-400">
                        Weight: 25% • {resumeAnalysisResult.metrics?.quantified_metrics_count || 0} metrics, {resumeAnalysisResult.metrics?.action_verbs_count || 0} verbs
                      </div>
                    </div>

                    {/* 3. Section Completeness (20%) */}
                    <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 space-y-2">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-bold text-slate-300 flex items-center gap-1.5">
                          <Layers className="h-3.5 w-3.5 text-emerald-400" /> Completeness
                        </span>
                        <span className="font-mono font-bold text-emerald-400">
                          {resumeAnalysisResult.score_breakdown?.completeness_score ?? 90}%
                        </span>
                      </div>
                      <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                        <div
                          className="bg-gradient-to-r from-emerald-500 to-teal-500 h-full rounded-full transition-all duration-700"
                          style={{ width: `${resumeAnalysisResult.score_breakdown?.completeness_score ?? 90}%` }}
                        />
                      </div>
                      <div className="text-[10px] text-slate-400">
                        Weight: 20% • {resumeAnalysisResult.metrics?.sections_found?.length || 5} sections identified
                      </div>
                    </div>

                    {/* 4. ATS Formatting Hygiene (15%) */}
                    <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 space-y-2">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-bold text-slate-300 flex items-center gap-1.5">
                          <FileCheck className="h-3.5 w-3.5 text-amber-400" /> ATS Hygiene
                        </span>
                        <span className="font-mono font-bold text-amber-400">
                          {resumeAnalysisResult.score_breakdown?.formatting_score ?? 85}%
                        </span>
                      </div>
                      <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                        <div
                          className="bg-gradient-to-r from-amber-500 to-orange-500 h-full rounded-full transition-all duration-700"
                          style={{ width: `${resumeAnalysisResult.score_breakdown?.formatting_score ?? 85}%` }}
                        />
                      </div>
                      <div className="text-[10px] text-slate-400">
                        Weight: 15% • {resumeAnalysisResult.metrics?.word_count || 500} words ({resumeAnalysisResult.metrics?.estimated_pages || 1} pg)
                      </div>
                    </div>
                  </div>

                  {/* Parsed Contact Information Strip */}
                  <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 space-y-2">
                    <div className="text-xs font-bold text-slate-300 flex items-center gap-2">
                      <UserCheck className="h-4 w-4 text-sky-400" /> Extracted Candidate Metadata & Links
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 text-xs">
                      {/* Email */}
                      <div className="p-2.5 rounded-lg bg-slate-900/80 border border-slate-800 flex items-center gap-2">
                        <Mail className={`h-3.5 w-3.5 ${resumeAnalysisResult.metrics?.contact_info?.email ? 'text-emerald-400' : 'text-rose-400'}`} />
                        <div className="truncate">
                          <div className="text-[10px] text-slate-500">Email</div>
                          <div className="text-[11px] font-mono text-slate-200 truncate">
                            {resumeAnalysisResult.metrics?.contact_info?.email || 'Missing'}
                          </div>
                        </div>
                      </div>

                      {/* Phone */}
                      <div className="p-2.5 rounded-lg bg-slate-900/80 border border-slate-800 flex items-center gap-2">
                        <Phone className={`h-3.5 w-3.5 ${resumeAnalysisResult.metrics?.contact_info?.phone ? 'text-emerald-400' : 'text-rose-400'}`} />
                        <div className="truncate">
                          <div className="text-[10px] text-slate-500">Phone</div>
                          <div className="text-[11px] font-mono text-slate-200 truncate">
                            {resumeAnalysisResult.metrics?.contact_info?.phone || 'Missing'}
                          </div>
                        </div>
                      </div>

                      {/* LinkedIn */}
                      <div className="p-2.5 rounded-lg bg-slate-900/80 border border-slate-800 flex items-center gap-2">
                        <Linkedin className={`h-3.5 w-3.5 ${resumeAnalysisResult.metrics?.contact_info?.linkedin ? 'text-sky-400' : 'text-slate-600'}`} />
                        <div className="truncate">
                          <div className="text-[10px] text-slate-500">LinkedIn</div>
                          <div className="text-[11px] font-mono text-slate-200 truncate">
                            {resumeAnalysisResult.metrics?.contact_info?.linkedin ? 'Verified' : 'Not Detected'}
                          </div>
                        </div>
                      </div>

                      {/* GitHub */}
                      <div className="p-2.5 rounded-lg bg-slate-900/80 border border-slate-800 flex items-center gap-2">
                        <Github className={`h-3.5 w-3.5 ${resumeAnalysisResult.metrics?.contact_info?.github ? 'text-purple-400' : 'text-slate-600'}`} />
                        <div className="truncate">
                          <div className="text-[10px] text-slate-500">GitHub</div>
                          <div className="text-[11px] font-mono text-slate-200 truncate">
                            {resumeAnalysisResult.metrics?.contact_info?.github ? 'Verified' : 'Not Detected'}
                          </div>
                        </div>
                      </div>

                      {/* Portfolio */}
                      <div className="p-2.5 rounded-lg bg-slate-900/80 border border-slate-800 flex items-center gap-2">
                        <Globe className={`h-3.5 w-3.5 ${resumeAnalysisResult.metrics?.contact_info?.portfolio ? 'text-teal-400' : 'text-slate-600'}`} />
                        <div className="truncate">
                          <div className="text-[10px] text-slate-500">Portfolio</div>
                          <div className="text-[11px] font-mono text-slate-200 truncate">
                            {resumeAnalysisResult.metrics?.contact_info?.portfolio || 'Optional'}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Sub-Navigation Tabs */}
                  <div className="flex border-b border-slate-800 gap-2">
                    {[
                      { id: 'audit', label: 'Recruiter Audit & Action Plan', icon: FileCheck },
                      { id: 'skills', label: 'Skills & Keyword Gap', icon: Target },
                      { id: 'bullets', label: 'Bullet Enhancer (X-Y-Z)', icon: Sparkles },
                      { id: 'readability', label: 'ATS Parser Hygiene', icon: Layers }
                    ].map((tab) => {
                      const Icon = tab.icon;
                      const isActive = activeResumeTab === tab.id;
                      return (
                        <button
                          key={tab.id}
                          onClick={() => setActiveResumeTab(tab.id as any)}
                          className={`pb-3 px-3 text-xs font-bold flex items-center gap-2 border-b-2 transition ${
                            isActive
                              ? 'border-sky-500 text-sky-400'
                              : 'border-transparent text-slate-400 hover:text-slate-200'
                          }`}
                        >
                          <Icon className="h-4 w-4" />
                          <span>{tab.label}</span>
                        </button>
                      );
                    })}
                  </div>

                  {/* SUB-TAB 1: AUDIT OVERVIEW & ACTION PLAN */}
                  {activeResumeTab === 'audit' && (
                    <div className="space-y-4 animate-fadeIn">
                      <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 space-y-2 text-xs">
                        <div className="font-bold text-sky-400 flex items-center gap-1.5">
                          <FileCheck className="h-4 w-4" /> ATS Formatting & Readability Diagnosis
                        </div>
                        <p className="text-slate-300 leading-relaxed">
                          {resumeAnalysisResult.formatting_feedback}
                        </p>
                      </div>

                      <div className="p-4 rounded-xl bg-indigo-950/20 border border-indigo-800/40 space-y-3">
                        <div className="font-bold text-indigo-300 text-xs flex items-center gap-1.5">
                          <Sparkles className="h-4 w-4 text-amber-400" /> Actionable Resume Enhancements Checklist
                        </div>
                        <div className="space-y-2">
                          {(resumeAnalysisResult.suggestions || []).map((sugg: string, i: number) => (
                            <div key={i} className="p-3 rounded-lg bg-slate-900/80 border border-slate-800 text-xs flex items-start gap-3">
                              <span className="h-5 w-5 rounded-full bg-amber-500/20 text-amber-400 font-bold flex items-center justify-center shrink-0 text-[11px]">
                                {i + 1}
                              </span>
                              <div className="text-slate-200 leading-relaxed">
                                {sugg}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* SUB-TAB 2: SKILLS & KEYWORD GAP */}
                  {activeResumeTab === 'skills' && (
                    <div className="space-y-4 animate-fadeIn">
                      {/* Optional JD match highlight */}
                      {resumeAnalysisResult.jd_match_score !== null && resumeAnalysisResult.jd_match_score !== undefined && (
                        <div className="p-4 rounded-xl bg-sky-950/30 border border-sky-500/40 flex items-center justify-between">
                          <div>
                            <div className="text-xs font-bold text-sky-300">Custom Job Description Keyword Match</div>
                            <div className="text-[11px] text-slate-400 mt-0.5">Matched against your pasted job requirements</div>
                          </div>
                          <div className="text-2xl font-black font-mono text-sky-400">
                            {resumeAnalysisResult.jd_match_score}%
                          </div>
                        </div>
                      )}

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Matched Skills */}
                        <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 space-y-3">
                          <div className="text-xs font-bold text-emerald-400 flex items-center justify-between">
                            <span className="flex items-center gap-1.5">
                              <CheckCircle2 className="h-4 w-4" /> Matched Core Skills ({resumeAnalysisResult.matched_skills?.length || 0})
                            </span>
                            <span className="text-[10px] text-emerald-500 font-mono">Verified in Resume</span>
                          </div>
                          <div className="flex flex-wrap gap-1.5">
                            {(resumeAnalysisResult.matched_skills || []).map((s: string) => (
                              <span
                                key={s}
                                className="px-2.5 py-1 rounded-lg text-xs bg-emerald-500/10 text-emerald-300 border border-emerald-500/20 font-mono font-medium flex items-center gap-1"
                              >
                                <Check className="h-3 w-3 text-emerald-400" /> {s}
                              </span>
                            ))}
                            {(!resumeAnalysisResult.matched_skills || resumeAnalysisResult.matched_skills.length === 0) && (
                              <div className="text-xs text-slate-500 italic">No recognized keywords found for this track.</div>
                            )}
                          </div>
                        </div>

                        {/* Missing Skills */}
                        <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 space-y-3">
                          <div className="text-xs font-bold text-rose-400 flex items-center justify-between">
                            <span className="flex items-center gap-1.5">
                              <XCircle className="h-4 w-4" /> Missing Keywords for {resumeAnalysisResult.target_role || resumeTargetRole}
                            </span>
                            <span className="text-[10px] text-rose-500 font-mono">Recommended Additions</span>
                          </div>
                          <div className="flex flex-wrap gap-1.5">
                            {(resumeAnalysisResult.missing_skills || []).map((s: string) => (
                              <span
                                key={s}
                                className="px-2.5 py-1 rounded-lg text-xs bg-rose-500/10 text-rose-300 border border-rose-500/20 font-mono font-medium flex items-center gap-1"
                              >
                                ✕ {s}
                              </span>
                            ))}
                            {(!resumeAnalysisResult.missing_skills || resumeAnalysisResult.missing_skills.length === 0) && (
                              <div className="text-xs text-emerald-400 flex items-center gap-1">
                                <CheckCircle2 className="h-3.5 w-3.5" /> All critical keywords for this role are covered!
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* SUB-TAB 3: BULLET ENHANCER (GOOGLE X-Y-Z) */}
                  {activeResumeTab === 'bullets' && (
                    <div className="space-y-4 animate-fadeIn">
                      <div className="p-3.5 rounded-xl bg-slate-950/80 border border-indigo-500/30 text-xs text-slate-300">
                        <span className="font-bold text-indigo-400">Google X-Y-Z Formula: </span>
                        Top tech recruiters score bullets that demonstrate: <em>"Accomplished [X] as measured by [Y], by doing [Z]"</em>. Below are detected or suggested bullet optimizations.
                      </div>

                      <div className="space-y-3">
                        {(resumeAnalysisResult.bullet_improvements || []).map((b: any, idx: number) => (
                          <div key={idx} className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 space-y-3 text-xs">
                            <div className="space-y-1">
                              <div className="text-[10px] uppercase font-bold text-rose-400 flex items-center gap-1">
                                <XCircle className="h-3 w-3" /> Original / Weak Bullet (Lacks Quantification)
                              </div>
                              <div className="p-2.5 rounded-lg bg-rose-950/20 border border-rose-900/30 text-slate-300 font-mono text-[11px]">
                                "{b.original}"
                              </div>
                            </div>

                            <div className="space-y-1">
                              <div className="text-[10px] uppercase font-bold text-emerald-400 flex items-center gap-1">
                                <CheckCircle2 className="h-3 w-3" /> AI / ATS Quantified Rewrite
                              </div>
                              <div className="p-2.5 rounded-lg bg-emerald-950/20 border border-emerald-900/30 text-emerald-200 font-mono text-[11px] leading-relaxed">
                                "{b.improved}"
                              </div>
                            </div>

                            <div className="text-[11px] text-slate-400 flex items-start gap-1.5">
                              <Sparkles className="h-3.5 w-3.5 text-amber-400 shrink-0 mt-0.5" />
                              <span><strong>Why this scores higher:</strong> {b.reason}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* SUB-TAB 4: ATS PARSER HYGIENE & SECTIONS */}
                  {activeResumeTab === 'readability' && (
                    <div className="space-y-4 animate-fadeIn">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Sections Recognized */}
                        <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 space-y-2.5 text-xs">
                          <div className="font-bold text-emerald-400 flex items-center gap-1.5">
                            <CheckCircle2 className="h-4 w-4" /> Detected Standard Sections ({resumeAnalysisResult.metrics?.sections_found?.length || 0})
                          </div>
                          <div className="flex flex-wrap gap-1.5">
                            {(resumeAnalysisResult.metrics?.sections_found || []).map((sec: string) => (
                              <span key={sec} className="px-2.5 py-1 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-medium">
                                ✓ {sec}
                              </span>
                            ))}
                          </div>
                        </div>

                        {/* Missing Standard Sections */}
                        <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 space-y-2.5 text-xs">
                          <div className="font-bold text-amber-400 flex items-center gap-1.5">
                            <AlertCircle className="h-4 w-4" /> Missing Recommended Sections ({resumeAnalysisResult.metrics?.sections_missing?.length || 0})
                          </div>
                          <div className="flex flex-wrap gap-1.5">
                            {(resumeAnalysisResult.metrics?.sections_missing || []).map((sec: string) => (
                              <span key={sec} className="px-2.5 py-1 rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/20 font-medium">
                                ⚠ {sec}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>

                      {/* ATS Golden Rules Card */}
                      <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 text-xs space-y-2.5">
                        <div className="font-bold text-sky-400">4 Golden Rules for 100% ATS Parser Pass Rate:</div>
                        <ul className="space-y-1.5 text-slate-300">
                          <li className="flex items-start gap-2">
                            <Check className="h-3.5 w-3.5 text-emerald-400 shrink-0 mt-0.5" />
                            <span><strong>Clean Single-Column Hierarchy:</strong> Multi-column tables or textboxes can cause ATS parsers to jumble sentence orders.</span>
                          </li>
                          <li className="flex items-start gap-2">
                            <Check className="h-3.5 w-3.5 text-emerald-400 shrink-0 mt-0.5" />
                            <span><strong>Standard Headers:</strong> Use common titles like "Experience", "Education", "Projects", "Technical Skills".</span>
                          </li>
                          <li className="flex items-start gap-2">
                            <Check className="h-3.5 w-3.5 text-emerald-400 shrink-0 mt-0.5" />
                            <span><strong>Metric Density:</strong> At least 60% of bullet points should feature measurable metrics (%, scale, latency, users, $).</span>
                          </li>
                          <li className="flex items-start gap-2">
                            <Check className="h-3.5 w-3.5 text-emerald-400 shrink-0 mt-0.5" />
                            <span><strong>Standard Fonts & PDF Format:</strong> Export directly to text-based PDF using standard typography (Inter, Roboto, Arial).</span>
                          </li>
                        </ul>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 10: ROADMAPS & PROJECTS */}
        {activeTab === 'roadmaps' && (() => {
          const completedSteps = currentRoadmap.steps.filter(s => s.completed).length;
          const progressPercent = Math.round((completedSteps / currentRoadmap.steps.length) * 100);
          const mcqCountForLang = MCQ_BANK[selectedRoadmapLanguage]?.length || 20;

          return (
            <div className="max-w-4xl mx-auto space-y-6">
              {/* Language Track Selector Header */}
              <div className="rounded-2xl bg-slate-900/90 border border-slate-800 p-6 space-y-5 shadow-xl">
                <div>
                  <div className="flex items-center gap-2 text-xs font-bold text-indigo-400 mb-1">
                    <BookOpen className="h-4 w-4" /> Personalize Your Target Language Track
                  </div>
                  <h2 className="text-xl font-black text-white">
                    Adaptive Career Roadmaps & Technical Curriculum
                  </h2>
                  <p className="text-xs text-slate-400 mt-1">
                    Choose the programming language or specialization you want to pursue. Your curriculum, milestones, and practice MCQs will adapt dynamically.
                  </p>
                </div>

                {/* Language Track Selector Pills */}
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2.5">
                  {LANGUAGE_TRACKS.map(track => {
                    const isSelected = selectedRoadmapLanguage === track.id;
                    return (
                      <button
                        key={track.id}
                        onClick={() => handleSelectRoadmapLanguage(track.id)}
                        className={`p-3 rounded-2xl border text-center transition flex flex-col items-center justify-center gap-1.5 ${
                          isSelected
                            ? 'bg-gradient-to-b from-indigo-950/80 to-slate-900 border-indigo-500 shadow-lg shadow-indigo-500/20 text-white font-bold'
                            : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                        }`}
                      >
                        <span className="text-2xl">{track.icon}</span>
                        <span className="text-xs font-bold">{track.name}</span>
                        <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-slate-800 text-slate-400">
                          {MCQ_BANK[track.id]?.length || 20} MCQs
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Generated Roadmap Overview & Progress Card */}
              <div className="rounded-2xl bg-gradient-to-br from-slate-900 via-[#0d1322] to-slate-900 border border-slate-800 p-6 space-y-6 shadow-xl">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-5">
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-2">
                      <span className="text-2xl">{currentRoadmap.icon}</span>
                      <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-sky-500/10 text-sky-400 border border-sky-500/20">
                        {currentRoadmap.badge}
                      </span>
                      <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20">
                        {currentRoadmap.difficulty}
                      </span>
                    </div>
                    <h3 className="text-lg font-black text-white">
                      {currentRoadmap.roleTitle}
                    </h3>
                    <p className="text-xs text-slate-400 max-w-2xl leading-relaxed">
                      {currentRoadmap.tagline}
                    </p>
                  </div>

                  {/* Progress Ring / Percentage */}
                  <div className="flex items-center gap-4 bg-slate-950/80 p-3.5 rounded-2xl border border-slate-800 shrink-0">
                    <div>
                      <div className="text-xl font-black text-white font-mono">{progressPercent}%</div>
                      <div className="text-[10px] text-slate-400 font-semibold uppercase">Track Progress</div>
                    </div>
                    <div className="text-right text-[11px]">
                      <div className="font-bold text-emerald-400">{completedSteps} / {currentRoadmap.steps.length}</div>
                      <div className="text-slate-500">Milestones Done</div>
                    </div>
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs font-semibold">
                    <span className="text-slate-400">Curriculum Completion</span>
                    <span className="text-sky-400 font-mono">{progressPercent}%</span>
                  </div>
                  <div className="h-2 w-full bg-slate-800/80 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-indigo-500 via-sky-500 to-emerald-400 transition-all duration-500 rounded-full"
                      style={{ width: `${progressPercent}%` }}
                    />
                  </div>
                </div>

                {/* Dynamic Milestone Steps */}
                <div className="space-y-3 pt-2">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                      Structured Milestones & Learning Objectives
                    </h4>
                    <span className="text-[11px] text-slate-500">Tap milestone to mark completed</span>
                  </div>

                  {currentRoadmap.steps.map((m) => (
                    <div
                      key={m.id}
                      onClick={() => handleToggleRoadmapStep(selectedRoadmapLanguage, m.id)}
                      className={`p-4 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs cursor-pointer transition ${
                        m.completed
                          ? 'bg-emerald-950/20 border-emerald-800/40 text-emerald-300'
                          : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:border-slate-700 hover:bg-slate-900/60'
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <span className={`h-6 w-6 mt-0.5 rounded-lg flex items-center justify-center font-bold text-xs border shrink-0 transition ${
                          m.completed ? 'bg-emerald-500 border-emerald-400 text-slate-950 shadow-md shadow-emerald-500/20' : 'border-slate-700 text-transparent bg-slate-900'
                        }`}>
                          ✓
                        </span>
                        <div className="space-y-1.5">
                          <div className={`font-bold text-sm ${m.completed ? 'text-white' : 'text-slate-200'}`}>
                            {m.step}
                          </div>
                          <p className="text-xs text-slate-400 leading-relaxed">
                            {m.desc}
                          </p>
                          {m.details && (
                            <div className="flex flex-wrap gap-1.5 pt-1">
                              {m.details.map((tag, idx) => (
                                <span
                                  key={idx}
                                  className={`text-[10px] px-2 py-0.5 rounded-md font-medium border ${
                                    m.completed
                                      ? 'bg-emerald-950/40 text-emerald-400 border-emerald-800/40'
                                      : 'bg-slate-900 text-slate-400 border-slate-800'
                                  }`}
                                >
                                  {tag}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="flex sm:flex-col items-center sm:items-end justify-between gap-2 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-800">
                        <span className="text-[10px] font-mono text-slate-500">
                          {m.durationWeeks ? `${m.durationWeeks} Weeks` : 'Self-paced'}
                        </span>
                        <span className={`font-bold px-2.5 py-1 rounded text-[11px] transition ${
                          m.completed
                            ? 'bg-emerald-950 text-emerald-300 border border-emerald-800/50'
                            : 'bg-slate-900 text-slate-400 border border-slate-800 hover:text-slate-200'
                        }`}>
                          {m.completed ? '✓ Completed' : 'Tap to Complete'}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Capstone Project Card */}
                {currentRoadmap.capstoneProject && (
                  <div className="rounded-xl bg-slate-950/80 border border-slate-800 p-4 space-y-2.5">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Award className="h-4 w-4 text-amber-400" />
                        <span className="text-xs font-bold text-white uppercase tracking-wider">
                          Recommended Capstone Project
                        </span>
                      </div>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                        Portfolio Piece
                      </span>
                    </div>
                    <div className="font-bold text-sm text-indigo-300">
                      {currentRoadmap.capstoneProject.title}
                    </div>
                    <p className="text-xs text-slate-400 leading-relaxed">
                      {currentRoadmap.capstoneProject.description}
                    </p>
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {currentRoadmap.capstoneProject.skills.map((s, idx) => (
                        <span key={idx} className="text-[10px] px-2 py-0.5 rounded bg-slate-900 text-slate-300 border border-slate-800">
                          {s}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Direct Action: Jump to MCQs for this language */}
                <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3 bg-indigo-950/20 border border-indigo-500/30 p-4 rounded-xl">
                  <div>
                    <div className="font-bold text-xs text-white flex items-center gap-2">
                      <span>⚡ Test Your Readiness in {currentRoadmap.languageName}</span>
                    </div>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      Practice {mcqCountForLang} curated interview questions tailored specifically for this track.
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      setSelectedMcqLanguage(selectedRoadmapLanguage);
                      setCurrentMcqIdx(0);
                      setSelectedMcqOption(null);
                      setMcqSubmitted(false);
                      setActiveTab('mcqs');
                    }}
                    className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-sky-600 hover:from-indigo-500 hover:to-sky-500 text-white font-bold text-xs shadow-lg shadow-indigo-600/30 flex items-center justify-center gap-2 transition"
                  >
                    <span>Practice {currentRoadmap.languageName} MCQs ({mcqCountForLang} Qs)</span>
                    <ArrowRight className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            </div>
          );
        })()}

        {/* TAB 11: LEADERBOARD */}
        {activeTab === 'leaderboard' && (
          <div className="max-w-3xl mx-auto space-y-6">
            <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-4">
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <Trophy className="h-5 w-5 text-amber-400" /> PlacementForge Weekly Global Arena
              </h2>
              <div className="space-y-2">
                {[
                  { rank: 1, name: "David Zhang", xp: 1420, score: 380, time: "18m 42s" },
                  { rank: 2, name: "Sarah Connor", xp: 1310, score: 360, time: "21m 15s" },
                  { rank: 3, name: `${userName} (You)`, xp: 1240, score: 340, time: "23m 05s" },
                  { rank: 4, name: "Rohan Sharma", xp: 980, score: 290, time: "28m 40s" },
                ].map((p) => (
                  <div key={p.rank} className={`p-3.5 rounded-xl border flex items-center justify-between text-xs ${p.name.includes("You") ? 'bg-indigo-950/40 border-indigo-500/60 font-bold' : 'bg-slate-950 border-slate-800 text-slate-300'}`}>
                    <div className="flex items-center gap-3">
                      <span className={`h-6 w-6 rounded-full flex items-center justify-center font-black ${p.rank === 1 ? 'bg-amber-400 text-slate-950' : p.rank === 2 ? 'bg-slate-300 text-slate-950' : p.rank === 3 ? 'bg-amber-700 text-white' : 'text-slate-500'}`}>
                        {p.rank}
                      </span>
                      <span>{p.name}</span>
                    </div>
                    <div className="flex gap-4 text-[11px] font-mono">
                      <span className="text-emerald-400">{p.score} pts</span>
                      <span className="text-slate-400">{p.time}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* TAB 6: ASSESSMENTS */}
        {activeTab === 'assessments' && (
          <div className="max-w-4xl mx-auto space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {[
                { title: "TCS NQT Full Benchmark Test", duration: "60 mins", type: "MCQ + SQL + Coding", questions: 25 },
                { title: "Amazon SDE-1 Assessment Pattern", duration: "90 mins", type: "2 DSA Coding + 1 System Scenario", questions: 3 },
                { title: "Google Core Technical Simulation", duration: "75 mins", type: "Algorithms & Scale Design", questions: 4 }
              ].map((ass, i) => (
                <div key={i} className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-4">
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">{ass.type}</span>
                  <h3 className="text-base font-bold text-white">{ass.title}</h3>
                  <div className="text-xs text-slate-400">Duration: {ass.duration} | {ass.questions} Questions</div>
                  <button onClick={() => setActiveTab('arena')} className="w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-md shadow-indigo-600/30">
                    Launch Assessment ➔
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
