import React, { useState, useEffect, useMemo } from 'react';
import {
  Calendar,
  Clock,
  Award,
  CheckCircle2,
  ExternalLink,
  ChevronRight,
  ChevronLeft,
  Sparkles,
  BarChart2,
  Building2,
  Play,
  FileCheck,
  X,
  AlertCircle,
  Code2,
  Brain,
  Layers,
  Check,
  RotateCcw,
  Flag,
  HelpCircle,
  Trophy,
  Zap,
  ShieldAlert,
  Send
} from 'lucide-react';
import { recordActivity } from '../../services/activityTracker';
import { showToast } from '../../components/Toast';

interface TestItem {
  id: string;
  company: string;
  title: string;
  date: string;
  questions: string;
  duration: string;
  sections: string[];
}

interface ExamQuestion {
  id: number;
  section: 'Aptitude' | 'Technical' | 'Coding';
  type: 'mcq' | 'code';
  title: string;
  question: string;
  options?: string[];
  correctAnswer?: string;
  explanation?: string;
  starterCode?: string;
  testCases?: { input: string; output: string }[];
}

const MOCK_EXAM_QUESTIONS: ExamQuestion[] = [
  // Section 1: Quantitative & Logical Aptitude
  {
    id: 1,
    section: 'Aptitude',
    type: 'mcq',
    title: 'Work & Time Equivalence',
    question: 'A can complete a project in 12 days, and B can complete it in 16 days. They work together for 4 days, and then A leaves. In how many more days will B finish the remaining work?',
    options: ['A) 5.33 days', 'B) 6.67 days', 'C) 8 days', 'D) 4.5 days'],
    correctAnswer: 'B',
    explanation: 'Work done by A in 1 day = 1/12, by B = 1/16. Together in 4 days = 4*(1/12 + 1/16) = 4*(7/48) = 7/12. Remaining work = 5/12. Time taken by B = (5/12) / (1/16) = 20/3 = 6.67 days.'
  },
  {
    id: 2,
    section: 'Aptitude',
    type: 'mcq',
    title: 'Speed, Time & Distance',
    question: 'A train running at 54 km/hr crosses a platform of length 250 meters in 30 seconds. What is the length of the train?',
    options: ['A) 150 meters', 'B) 200 meters', 'C) 250 meters', 'D) 180 meters'],
    correctAnswer: 'B',
    explanation: 'Speed = 54 * (5/18) = 15 m/s. Total distance = Speed * Time = 15 * 30 = 450 m. Length of train = 450 - 250 = 200 meters.'
  },
  {
    id: 3,
    section: 'Aptitude',
    type: 'mcq',
    title: 'Probability & Permutations',
    question: 'Two dice are tossed simultaneously. What is the probability that the sum of the numbers appearing on both dice is a prime number?',
    options: ['A) 7/36', 'B) 5/12', 'C) 15/36', 'D) 1/2'],
    correctAnswer: 'C',
    explanation: 'Prime sums possible: 2, 3, 5, 7, 11. Sum=2: (1,1)[1]; Sum=3: (1,2),(2,1)[2]; Sum=5: (1,4),(2,3),(3,2),(4,1)[4]; Sum=7: (1,6),(2,5),(3,4),(4,3),(5,2),(6,1)[6]; Sum=11: (5,6),(6,5)[2]. Total favourable outcomes = 1+2+4+6+2 = 15. Probability = 15/36.'
  },

  // Section 2: Technical Core (OS, DBMS, CN)
  {
    id: 4,
    section: 'Technical',
    type: 'mcq',
    title: 'Operating Systems: Deadlock Prevention',
    question: 'Which of the following Coffman conditions for deadlock is eliminated when resources are numbered and processes can only request resources in strictly increasing order?',
    options: ['A) Mutual Exclusion', 'B) Hold and Wait', 'C) Circular Wait', 'D) No Preemption'],
    correctAnswer: 'C',
    explanation: 'Imposing a total ordering of all resource types and requiring that each process requests resources in an increasing order of enumeration prevents the Circular Wait condition.'
  },
  {
    id: 5,
    section: 'Technical',
    type: 'mcq',
    title: 'Database Management: Isolation Levels',
    question: 'Which transaction isolation level prevents Dirty Reads and Non-Repeatable Reads, but may still allow Phantom Reads in SQL databases?',
    options: ['A) Read Uncommitted', 'B) Read Committed', 'C) Repeatable Read', 'D) Serializable'],
    correctAnswer: 'C',
    explanation: 'Repeatable Read guarantees that any data read cannot change, preventing dirty and non-repeatable reads. Phantom reads (new rows matching a WHERE clause) are only prevented in Serializable.'
  },
  {
    id: 6,
    section: 'Technical',
    type: 'mcq',
    title: 'Computer Networks: TCP Transport',
    question: 'In TCP congestion control, what happens immediately after a Packet Timeout occurs?',
    options: [
      'A) Congestion Window (cwnd) is halved and additive increase starts',
      'B) cwnd is reset to 1 MSS, ssthresh is set to half of cwnd, and Slow Start begins',
      'C) TCP transitions immediately to Fast Recovery mode',
      'D) Window size is multiplied by 2'
    ],
    correctAnswer: 'B',
    explanation: 'A coarse timeout is treated as severe network congestion. TCP sets cwnd = 1 MSS, ssthresh = cwnd / 2, and initiates Slow Start from 1 MSS.'
  },

  // Section 3: Live Coding Screen
  {
    id: 7,
    section: 'Coding',
    type: 'code',
    title: 'Two Sum Optimal (Campus Coding Round)',
    question: 'Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target. You must solve it in optimal O(N) runtime.',
    starterCode: 'def twoSum(nums, target):\n    # Write your solution here\n    hash_map = {}\n    for i, num in enumerate(nums):\n        diff = target - num\n        if diff in hash_map:\n            return [hash_map[diff], i]\n        hash_map[num] = i\n    return []',
    testCases: [
      { input: 'nums = [2, 7, 11, 15], target = 9', output: '[0, 1]' },
      { input: 'nums = [3, 2, 4], target = 6', output: '[1, 2]' }
    ]
  }
];

export const AssessmentsView: React.FC = () => {
  const [filterTab, setFilterTab] = useState<'All' | 'Upcoming' | 'Active' | 'Completed'>('All');
  const [registeredMap, setRegisteredMap] = useState<Record<string, boolean>>({
    'tcs-1': true
  });

  // Test Runner State
  const [activeTestModal, setActiveTestModal] = useState<TestItem | null>(null);
  const [isTestRunning, setIsTestRunning] = useState<boolean>(false);
  const [testCountdown, setTestCountdown] = useState<number>(5400); // 90 mins in seconds
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState<number>(0);
  const [userAnswers, setUserAnswers] = useState<Record<number, string>>({});
  const [flaggedQuestions, setFlaggedQuestions] = useState<Record<number, boolean>>({});
  const [codingSolution, setCodingSolution] = useState<string>(MOCK_EXAM_QUESTIONS[6].starterCode || '');
  const [activeSectionFilter, setActiveSectionFilter] = useState<'All' | 'Aptitude' | 'Technical' | 'Coding'>('All');

  // Diagnostic Scorecard State
  const [showScorecard, setShowScorecard] = useState<boolean>(false);
  const [examResult, setExamResult] = useState<{
    totalScore: number;
    aptitudeScore: number;
    technicalScore: number;
    codingScore: number;
    passed: boolean;
    percentage: number;
  } | null>(null);

  const upcomingTests: TestItem[] = [
    {
      id: 'tcs-1',
      company: 'TCS',
      title: 'TCS NQT Placement Qualifier Mock',
      date: 'Live Online • Available 24/7',
      questions: '7 Curated Problems',
      duration: '90 mins',
      sections: ['Quantitative Aptitude', 'Technical Core (CS)', 'Coding Screen']
    },
    {
      id: 'accenture-1',
      company: 'Accenture',
      title: 'Accenture Campus Technical Assessment',
      date: 'Available Now',
      questions: '7 Curated Problems',
      duration: '90 mins',
      sections: ['Cognitive Ability', 'Technical Core', 'Coding Screen']
    },
    {
      id: 'wipro-1',
      company: 'Wipro',
      title: 'Wipro Elite National Talent Hunt Mock',
      date: 'Open Enrollment',
      questions: '7 Curated Problems',
      duration: '90 mins',
      sections: ['Logical Reasoning', 'Computer Networks & OS', 'Hands-on Coding']
    },
    {
      id: 'capgemini-1',
      company: 'Capgemini',
      title: 'Capgemini Exceller Tech Challenge',
      date: 'On-Demand',
      questions: '7 Curated Problems',
      duration: '90 mins',
      sections: ['PseudoCode', 'Technical MCQs', 'Algorithmic Coding']
    }
  ];

  const completedTests = [
    { company: 'Cognizant', date: '3 days ago', score: '88% • Qualified', verified: true },
    { company: 'Infosys', date: 'Last week', score: '92% • Qualified', verified: true },
    { company: 'Persistent', date: '2 weeks ago', score: '76% • Cleared Round 1', verified: true }
  ];

  // Countdown Timer
  useEffect(() => {
    let timer: any = null;
    if (isTestRunning && testCountdown > 0) {
      timer = setInterval(() => {
        setTestCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            handleSubmitExam();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [isTestRunning, testCountdown]);

  const formatCountdown = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const s = secs % 60;
    return `${mins.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const toggleRegister = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setRegisteredMap((prev) => {
      const updated = !prev[id];
      if (updated) {
        showToast('Successfully registered for mock assessment!', 'success');
      } else {
        showToast('Unregistered from assessment session', 'info');
      }
      return { ...prev, [id]: updated };
    });
  };

  const startTest = (test: TestItem) => {
    setActiveTestModal(test);
    setIsTestRunning(true);
    setTestCountdown(5400); // 90 mins
    setCurrentQuestionIndex(0);
    setUserAnswers({});
    setFlaggedQuestions({});
    setShowScorecard(false);
  };

  const handleSelectOption = (qId: number, optionLetter: string) => {
    setUserAnswers((prev) => ({ ...prev, [qId]: optionLetter }));
  };

  const toggleFlagQuestion = (qId: number) => {
    setFlaggedQuestions((prev) => ({ ...prev, [qId]: !prev[qId] }));
  };

  const currentQ = MOCK_EXAM_QUESTIONS[currentQuestionIndex];

  // Grade Exam & Show Scorecard
  const handleSubmitExam = () => {
    let aptScore = 0;
    let techScore = 0;
    let codeScore = 100; // Simulated pass for candidate code

    MOCK_EXAM_QUESTIONS.forEach((q) => {
      if (q.type === 'mcq') {
        const selected = userAnswers[q.id];
        if (selected === q.correctAnswer) {
          if (q.section === 'Aptitude') aptScore += 33.3;
          if (q.section === 'Technical') techScore += 33.3;
        }
      }
    });

    const totalPercentage = Math.round(
      (Math.min(100, aptScore) * 0.35) +
      (Math.min(100, techScore) * 0.35) +
      (codeScore * 0.30)
    );

    const result = {
      totalScore: totalPercentage,
      aptitudeScore: Math.round(Math.min(100, aptScore)),
      technicalScore: Math.round(Math.min(100, techScore)),
      codingScore: codeScore,
      passed: totalPercentage >= 65,
      percentage: totalPercentage
    };

    setExamResult(result);
    setIsTestRunning(false);
    setShowScorecard(true);

    recordActivity('assessment', { xp: 75 });
    showToast(`Assessment submitted! Score: ${totalPercentage}% (+75 XP)`, result.passed ? 'success' : 'info');
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-8">
      {/* Top Banner matching Screen 13 */}
      <div className="bg-gradient-to-r from-blue-900/40 via-indigo-950/50 to-[#0B0F1C] border border-blue-500/30 rounded-3xl p-6 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/20 text-blue-300 text-xs font-bold border border-blue-500/30">
              <Sparkles className="h-3.5 w-3.5 text-blue-400" />
              <span>Campus Recruitment Mock Arena</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-white">Company Placement Assessments</h1>
            <p className="text-xs text-slate-300 max-w-xl">
              Timed, proctored mock assessments calibrated to actual hiring patterns of top Tier-1 & mass recruiters.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => startTest(upcomingTests[0])}
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-500 hover:to-indigo-500 text-white font-extrabold text-xs shadow-lg shadow-indigo-600/30 transition flex items-center gap-2 active:scale-95"
            >
              <Play className="h-4 w-4 fill-white" />
              <span>Launch Instant Mock Test</span>
            </button>
          </div>
        </div>
      </div>

      {/* Segmented Filter Tabs matching Screen 13 */}
      <div className="flex items-center justify-between p-1 bg-[#0b101e] border border-slate-800 rounded-2xl">
        {(['All', 'Upcoming', 'Active', 'Completed'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setFilterTab(tab)}
            className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all ${
              filterTab === tab
                ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Assessment Test Cards Grid */}
      {(filterTab === 'All' || filterTab === 'Upcoming' || filterTab === 'Active') && (
        <div className="space-y-3.5">
          {upcomingTests.map((test) => {
            const isRegistered = !!registeredMap[test.id];
            return (
              <div
                key={test.id}
                onClick={() => startTest(test)}
                className="p-5 rounded-2xl bg-[#0b101e] border border-slate-800/80 hover:border-blue-500/50 cursor-pointer transition shadow-lg flex flex-col sm:flex-row sm:items-center justify-between gap-4 group"
              >
                <div className="flex items-start gap-4">
                  <div className="h-12 w-12 rounded-2xl bg-gradient-to-tr from-blue-600/20 to-indigo-600/20 border border-blue-500/40 flex items-center justify-center font-black text-sm text-sky-400 shrink-0">
                    {test.company.substring(0, 3)}
                  </div>

                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-blue-950/60 text-blue-300 border border-blue-800/50">
                        {test.company} Track
                      </span>
                      <span className="text-xs text-slate-400 font-mono flex items-center gap-1">
                        <Clock className="h-3 w-3 text-slate-500" />
                        {test.duration}
                      </span>
                    </div>

                    <h3 className="text-sm font-bold text-white group-hover:text-sky-300 transition">
                      {test.title}
                    </h3>
                    <p className="text-xs text-slate-400">{test.date} • {test.questions}</p>

                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {test.sections.map((sec) => (
                        <span key={sec} className="text-[10px] px-2 py-0.5 rounded bg-slate-900 border border-slate-800 text-slate-400 font-medium">
                          {sec}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2.5 shrink-0 sm:self-center">
                  <button
                    onClick={(e) => toggleRegister(test.id, e)}
                    className={`px-3.5 py-2 rounded-xl text-xs font-bold transition shadow-sm ${
                      isRegistered
                        ? 'bg-emerald-600/20 text-emerald-300 border border-emerald-500/40'
                        : 'bg-slate-800 text-slate-300 border border-slate-700 hover:text-white'
                    }`}
                  >
                    {isRegistered ? 'Enrolled ✓' : 'Register'}
                  </button>

                  <button
                    onClick={() => startTest(test)}
                    className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition flex items-center gap-1 shadow-md shadow-blue-600/20"
                  >
                    <Play className="h-3.5 w-3.5 fill-white" />
                    <span>Start Exam</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Completed Assessments Section */}
      {(filterTab === 'All' || filterTab === 'Completed') && (
        <div className="bg-[#0b101e] border border-slate-800/80 rounded-3xl p-5 shadow-xl space-y-3.5">
          <div className="flex items-center justify-between pb-2 border-b border-slate-800/60">
            <h3 className="text-xs font-bold text-white uppercase tracking-wider">
              Completed Assessments & Verified Scores
            </h3>
            <span className="text-[11px] text-slate-400 font-mono">3 Verified Results</span>
          </div>

          <div className="space-y-2">
            {completedTests.map((t, idx) => (
              <div
                key={idx}
                className="p-3.5 rounded-2xl bg-[#0e1424] border border-slate-800/80 flex items-center justify-between text-xs"
              >
                <div className="flex items-center gap-3">
                  <div className="h-9 w-9 rounded-xl bg-slate-800 flex items-center justify-center font-black text-[11px] text-sky-400 border border-slate-700">
                    {t.company.substring(0, 3)}
                  </div>
                  <div>
                    <span className="font-bold text-white">{t.company} Campus Qualifier</span>
                    <span className="text-[10px] text-slate-500 ml-2">({t.date})</span>
                  </div>
                </div>

                <span className="px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs font-extrabold font-mono">
                  {t.score}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ================= FULL INTERACTIVE EXAM RUNNER MODAL ================= */}
      {isTestRunning && activeTestModal && (
        <div className="fixed inset-0 z-50 bg-[#06080F]/95 backdrop-blur-md flex flex-col justify-between p-3 sm:p-6 overflow-y-auto animate-in fade-in">
          {/* Exam Header */}
          <div className="bg-[#0b101e] border border-slate-800 rounded-2xl p-4 flex flex-wrap items-center justify-between gap-3 shadow-xl">
            <div className="flex items-center gap-3">
              <div className="h-9 w-9 rounded-xl bg-blue-600/20 border border-blue-500/40 flex items-center justify-center text-blue-400 font-black text-xs">
                {activeTestModal.company.substring(0, 3)}
              </div>
              <div>
                <h2 className="text-sm font-bold text-white flex items-center gap-2">
                  <span>{activeTestModal.title}</span>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-950/60 text-emerald-300 border border-emerald-800/40">
                    PROCTORED
                  </span>
                </h2>
                <div className="text-[11px] text-slate-400 flex items-center gap-2">
                  <span>Question {currentQuestionIndex + 1} of {MOCK_EXAM_QUESTIONS.length}</span>
                  <span>•</span>
                  <span className="text-sky-400 font-medium">{currentQ.section} Section</span>
                </div>
              </div>
            </div>

            {/* Countdown Clock */}
            <div className="flex items-center gap-3">
              <div className={`px-4 py-2 rounded-xl border flex items-center gap-2 font-mono font-black text-base shadow-inner ${
                testCountdown < 600
                  ? 'bg-rose-950/40 border-rose-500/50 text-rose-400 animate-pulse'
                  : 'bg-amber-950/40 border-amber-500/40 text-amber-300'
              }`}>
                <Clock className="h-4 w-4" />
                <span>{formatCountdown(testCountdown)}</span>
              </div>

              <button
                onClick={handleSubmitExam}
                className="px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-extrabold text-xs shadow-md shadow-emerald-600/30 transition flex items-center gap-1.5"
              >
                <Send className="h-3.5 w-3.5" />
                <span>Submit Exam</span>
              </button>
            </div>
          </div>

          {/* Exam Body (2 Columns on Desktop: Left Question, Right Palette) */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 my-4 flex-1">
            {/* Left: Question Content Area (~9 cols) */}
            <div className="lg:col-span-9 bg-[#0b101e] border border-slate-800 rounded-3xl p-6 shadow-xl flex flex-col justify-between space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono font-bold px-2.5 py-1 rounded-lg bg-indigo-950/80 text-indigo-300 border border-indigo-800/50">
                      Q{currentQ.id}
                    </span>
                    <h3 className="text-sm font-bold text-white">{currentQ.title}</h3>
                  </div>

                  <button
                    onClick={() => toggleFlagQuestion(currentQ.id)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold border transition ${
                      flaggedQuestions[currentQ.id]
                        ? 'bg-purple-950/60 border-purple-500 text-purple-300 shadow-sm'
                        : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
                    }`}
                  >
                    <Flag className="h-3.5 w-3.5" />
                    <span>{flaggedQuestions[currentQ.id] ? 'Flagged for Review' : 'Mark Review'}</span>
                  </button>
                </div>

                {/* Problem Statement */}
                <div className="text-sm text-slate-200 leading-relaxed font-sans bg-[#070c18] p-4 rounded-2xl border border-slate-800/80">
                  {currentQ.question}
                </div>

                {/* Question Type: MCQ Options */}
                {currentQ.type === 'mcq' && currentQ.options && (
                  <div className="space-y-2.5 pt-2">
                    <span className="text-xs font-bold text-slate-400 block">Select the correct option:</span>
                    <div className="space-y-2">
                      {currentQ.options.map((opt) => {
                        const letter = opt.substring(0, 1);
                        const isSelected = userAnswers[currentQ.id] === letter;
                        return (
                          <div
                            key={opt}
                            onClick={() => handleSelectOption(currentQ.id, letter)}
                            className={`p-3.5 rounded-2xl border cursor-pointer transition flex items-center justify-between ${
                              isSelected
                                ? 'bg-gradient-to-r from-blue-950/70 to-indigo-950/70 border-cyan-400 text-white shadow-md shadow-cyan-500/20'
                                : 'bg-[#0d1424] border-slate-800/80 text-slate-300 hover:border-slate-700 hover:bg-[#10182c]'
                            }`}
                          >
                            <span className="text-xs font-semibold">{opt}</span>
                            <div className={`h-5 w-5 rounded-full border flex items-center justify-center ${
                              isSelected ? 'border-cyan-400 bg-cyan-500 text-slate-950 font-bold' : 'border-slate-700'
                            }`}>
                              {isSelected && '✓'}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Question Type: Code Editor */}
                {currentQ.type === 'code' && (
                  <div className="space-y-3 pt-2">
                    <div className="flex items-center justify-between text-xs text-slate-400">
                      <span className="font-mono text-cyan-400">Python 3 Solution Editor</span>
                      <span>Press Submit Exam when completed</span>
                    </div>

                    <textarea
                      rows={9}
                      value={codingSolution}
                      onChange={(e) => setCodingSolution(e.target.value)}
                      className="w-full bg-[#070c18] border border-cyan-500/40 rounded-2xl p-4 text-xs font-mono text-cyan-300 outline-none focus:border-cyan-400 transition leading-relaxed"
                      placeholder="Write your solution here..."
                    />

                    {currentQ.testCases && (
                      <div className="p-3 rounded-2xl bg-[#090e1c] border border-slate-800 text-xs space-y-1.5 font-mono">
                        <span className="text-slate-400 text-[11px] block font-bold">Public Testcases:</span>
                        {currentQ.testCases.map((tc, idx) => (
                          <div key={idx} className="flex justify-between text-[11px] text-slate-300">
                            <span>Input: {tc.input}</span>
                            <span className="text-emerald-400">Expected: {tc.output}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Bottom Navigation Buttons */}
              <div className="flex items-center justify-between pt-4 border-t border-slate-800">
                <button
                  type="button"
                  disabled={currentQuestionIndex === 0}
                  onClick={() => setCurrentQuestionIndex((prev) => Math.max(0, prev - 1))}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 disabled:opacity-40 text-slate-300 text-xs font-bold transition flex items-center gap-1.5"
                >
                  <ChevronLeft className="h-4 w-4" />
                  <span>Previous</span>
                </button>

                <div className="text-xs font-mono text-slate-400">
                  {Object.keys(userAnswers).length} / {MOCK_EXAM_QUESTIONS.length} Answered
                </div>

                <button
                  type="button"
                  disabled={currentQuestionIndex === MOCK_EXAM_QUESTIONS.length - 1}
                  onClick={() => setCurrentQuestionIndex((prev) => Math.min(MOCK_EXAM_QUESTIONS.length - 1, prev + 1))}
                  className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 disabled:opacity-40 text-white text-xs font-bold transition flex items-center gap-1.5 shadow-md shadow-blue-600/20"
                >
                  <span>Next</span>
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* Right: Question Palette (~3 cols) */}
            <div className="lg:col-span-3 bg-[#0b101e] border border-slate-800 rounded-3xl p-5 shadow-xl space-y-5">
              <div className="pb-2 border-b border-slate-800">
                <h4 className="text-xs font-bold text-white uppercase tracking-wider">Question Palette</h4>
                <p className="text-[10px] text-slate-400 mt-0.5">Click any number to jump to question</p>
              </div>

              {/* Palette Grid */}
              <div className="grid grid-cols-4 gap-2">
                {MOCK_EXAM_QUESTIONS.map((q, idx) => {
                  const isAnswered = !!userAnswers[q.id];
                  const isFlagged = !!flaggedQuestions[q.id];
                  const isCurrent = currentQuestionIndex === idx;

                  let bgClass = 'bg-[#0d1424] text-slate-400 border-slate-800';
                  if (isCurrent) {
                    bgClass = 'bg-blue-600 text-white border-blue-400 shadow-md shadow-blue-500/30 scale-105';
                  } else if (isFlagged) {
                    bgClass = 'bg-purple-900/60 text-purple-300 border-purple-500';
                  } else if (isAnswered) {
                    bgClass = 'bg-emerald-900/60 text-emerald-300 border-emerald-500';
                  }

                  return (
                    <button
                      key={q.id}
                      onClick={() => setCurrentQuestionIndex(idx)}
                      className={`h-9 rounded-xl border text-xs font-mono font-bold transition flex items-center justify-center ${bgClass}`}
                    >
                      {idx + 1}
                    </button>
                  );
                })}
              </div>

              {/* Palette Legend */}
              <div className="space-y-1.5 pt-2 text-[10px] text-slate-400 font-mono">
                <div className="flex items-center gap-2">
                  <div className="h-3 w-3 rounded-full bg-emerald-500" />
                  <span>Answered</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="h-3 w-3 rounded-full bg-purple-500" />
                  <span>Flagged for Review</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="h-3 w-3 rounded-full bg-blue-500" />
                  <span>Current Question</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="h-3 w-3 rounded-full bg-[#0d1424] border border-slate-700" />
                  <span>Not Visited</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ================= DIAGNOSTIC SCORECARD MODAL ================= */}
      {showScorecard && examResult && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-[#0b101e] border border-indigo-500/40 rounded-3xl p-6 sm:p-8 max-w-lg w-full space-y-6 shadow-2xl relative text-center">
            <button
              onClick={() => setShowScorecard(false)}
              className="absolute top-4 right-4 p-1 rounded-xl text-slate-400 hover:text-white"
            >
              <X className="h-5 w-5" />
            </button>

            <div className="space-y-2">
              <div className="h-16 w-16 mx-auto rounded-3xl bg-gradient-to-tr from-emerald-500 to-teal-600 flex items-center justify-center text-white shadow-xl shadow-emerald-500/20">
                <Trophy className="h-8 w-8 text-white" />
              </div>

              <h2 className="text-xl font-black text-white">Assessment Diagnostic Report</h2>
              <p className="text-xs text-slate-400">
                {activeTestModal ? activeTestModal.title : 'Campus Qualifier Examination'}
              </p>
            </div>

            {/* Score Result Gauge */}
            <div className="p-4 rounded-2xl bg-[#070c18] border border-slate-800 space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-slate-800/80">
                <span className="text-xs text-slate-400 font-bold">Overall Performance</span>
                <span className={`text-base font-black font-mono ${examResult.passed ? 'text-emerald-400' : 'text-amber-400'}`}>
                  {examResult.percentage}% ({examResult.passed ? 'QUALIFIED ✓' : 'NEEDS PRACTICE'})
                </span>
              </div>

              {/* Sectional Breakdown */}
              <div className="space-y-2 text-left text-xs font-mono">
                <div className="flex justify-between text-slate-300">
                  <span>Section 1: Quantitative & Aptitude:</span>
                  <span className="text-sky-400 font-bold">{examResult.aptitudeScore}%</span>
                </div>
                <div className="flex justify-between text-slate-300">
                  <span>Section 2: CS Fundamentals (Core):</span>
                  <span className="text-indigo-400 font-bold">{examResult.technicalScore}%</span>
                </div>
                <div className="flex justify-between text-slate-300">
                  <span>Section 3: Coding Solution Screen:</span>
                  <span className="text-emerald-400 font-bold">{examResult.codingScore}%</span>
                </div>
              </div>
            </div>

            <div className="p-3 rounded-2xl bg-indigo-950/40 border border-indigo-500/30 text-xs text-indigo-300 flex items-center justify-center gap-2">
              <Zap className="h-4 w-4 text-amber-400 fill-amber-400" />
              <span>+75 XP credited to your Code Quest profile!</span>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => setShowScorecard(false)}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-xs shadow-lg shadow-indigo-600/30 transition"
              >
                Return to Assessments Dashboard
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
