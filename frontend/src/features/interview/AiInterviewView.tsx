import React, { useState } from 'react';
import {
  Bot,
  Mic,
  MicOff,
  Send,
  Sparkles,
  CheckCircle2,
  Clock,
  PhoneOff,
  Volume2,
  TrendingUp,
  Award,
  ArrowRight,
  ArrowLeft,
  RotateCcw,
  Share2,
  FileCheck,
  Check
} from 'lucide-react';

const INTERVIEW_QUESTIONS = [
  {
    num: 1,
    category: 'Operating Systems & Concurrency',
    question: 'Can you explain the difference between a process and a thread in operating systems? Also, when would you use multithreading in a real-world application?',
    sampleAnswer: 'A process is an independent program with its own dedicated memory space, while a thread is a lightweight unit of execution within a process that shares the heap with other threads. We use multithreading in high-throughput web servers handling concurrent requests or in GUI desktop applications to maintain responsiveness during background processing.'
  },
  {
    num: 2,
    category: 'System Design & Scalability',
    question: 'How would you design a distributed caching layer to mitigate heavy database read contention during flash sales?',
    sampleAnswer: 'I would employ a distributed cache cluster like Redis with Consistent Hashing to partition cache keys. To prevent Cache Stampede and Cache Breakdown, I would implement mutex locks around cache misses and serve stale data with a background refresh worker.'
  },
  {
    num: 3,
    category: 'Data Structures & Algorithms',
    question: 'Under what conditions does a Hash Table degrade from O(1) average lookup to O(N) worst-case, and how do modern runtimes protect against Hash Collision DoS attacks?',
    sampleAnswer: 'A Hash Table degrades to O(N) when multiple keys hash to the same bucket slot under heavy collision. Modern runtimes like Java 8+ convert colliding buckets into balanced Red-Black Trees at 8 elements (O(log N) worst-case), and Python/Rust use randomized SipHash seeds to thwart collision denial-of-service.'
  },
  {
    num: 4,
    category: 'Database Architecture',
    question: 'What is the fundamental difference between an Optimistic Concurrency Control (OCC) and a Pessimistic Concurrency Control (PCC) strategy?',
    sampleAnswer: 'Pessimistic locking assumes conflicts are frequent and locks records upon reading (e.g. SELECT FOR UPDATE). Optimistic concurrency assumes conflicts are rare, allows uninhibited reads, and validates record version numbers (e.g. version column) right before committing.'
  },
  {
    num: 5,
    category: 'Behavioral & Leadership',
    question: 'Describe a situation where you encountered an unexpected production bug or breaking change. How did you triage, resolve, and communicate it?',
    sampleAnswer: 'I immediately checked telemetry logs to identify the root exception, rolled back the deployment to the last known healthy release within 3 minutes to stop user impact, and reproduced the edge-case locally with a regression test before writing a hotfix.'
  }
];

export const AiInterviewView: React.FC = () => {
  const [viewMode, setViewMode] = useState<'interview' | 'results'>('interview');
  const [isRecording, setIsRecording] = useState(false);
  const [currentQIndex, setCurrentQIndex] = useState(0);
  const [userTranscript, setUserTranscript] = useState(INTERVIEW_QUESTIONS[0].sampleAnswer);
  const [showReportModal, setShowReportModal] = useState(false);

  const currentQ = INTERVIEW_QUESTIONS[currentQIndex];

  const handleNextQuestion = () => {
    if (currentQIndex < INTERVIEW_QUESTIONS.length - 1) {
      const nextIdx = currentQIndex + 1;
      setCurrentQIndex(nextIdx);
      setUserTranscript(INTERVIEW_QUESTIONS[nextIdx].sampleAnswer);
      setIsRecording(false);
    } else {
      setViewMode('results');
    }
  };

  const handlePrevQuestion = () => {
    if (currentQIndex > 0) {
      const prevIdx = currentQIndex - 1;
      setCurrentQIndex(prevIdx);
      setUserTranscript(INTERVIEW_QUESTIONS[prevIdx].sampleAnswer);
      setIsRecording(false);
    }
  };

  const handleToggleSpeak = () => {
    setIsRecording(!isRecording);
  };

  // SCREEN 9: Interview Results View
  if (viewMode === 'results') {
    return (
      <div className="space-y-4 max-w-xl mx-auto pb-6">
        {/* Results Card matching Screen 9 */}
        <div className="bg-[#0b101e] border border-slate-800/80 rounded-3xl p-5 sm:p-6 shadow-2xl space-y-5 text-center">
          {/* Header */}
          <div className="flex items-center justify-between pb-3 border-b border-slate-800/60 text-left">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-sky-400">Technical Assessment</span>
              <h2 className="text-lg font-black text-white">Interview Results</h2>
            </div>
            <button
              onClick={() => alert('Interview Results link copied to clipboard!')}
              className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-white"
            >
              <Share2 className="h-4 w-4" />
            </button>
          </div>

          {/* Overall Score Gauge matching Screen 9: 78% */}
          <div className="flex flex-col items-center justify-center py-2">
            <div className="relative w-28 h-28 flex items-center justify-center">
              <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                <path
                  className="text-slate-800"
                  strokeWidth="3.5"
                  stroke="currentColor"
                  fill="none"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
                <path
                  className="text-emerald-400"
                  strokeDasharray="78, 100"
                  strokeWidth="3.5"
                  strokeLinecap="round"
                  stroke="currentColor"
                  fill="none"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
              </svg>
              <div className="absolute flex flex-col items-center">
                <span className="text-2xl font-black text-white">78%</span>
                <span className="text-[9px] uppercase tracking-wider text-slate-400 font-bold">Overall Score</span>
              </div>
            </div>
            <div className="mt-3 text-sm font-extrabold text-emerald-400">Good Performance!</div>
            <p className="text-xs text-slate-400">Recommended for Tier-1 Technical Round</p>
          </div>

          {/* Breakdown Bars matching Screen 9 */}
          <div className="space-y-3 text-left bg-[#0e1424] p-4 rounded-2xl border border-slate-800/80">
            <h3 className="text-xs font-bold text-white uppercase tracking-wider">Skill Breakdown</h3>

            {[
              { label: 'Technical Knowledge', pct: 80, color: 'from-blue-500 to-indigo-500' },
              { label: 'Problem Solving', pct: 75, color: 'from-cyan-500 to-blue-500' },
              { label: 'Communication', pct: 72, color: 'from-emerald-500 to-teal-500' },
              { label: 'Confidence', pct: 76, color: 'from-amber-500 to-orange-500' },
            ].map((skill) => (
              <div key={skill.label} className="space-y-1">
                <div className="flex justify-between text-xs font-semibold">
                  <span className="text-slate-300">{skill.label}</span>
                  <span className="text-white font-mono">{skill.pct}%</span>
                </div>
                <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
                  <div
                    className={`h-full rounded-full bg-gradient-to-r ${skill.color}`}
                    style={{ width: `${skill.pct}%` }}
                  />
                </div>
              </div>
            ))}
          </div>

          {/* Strengths & Areas to Improve matching Screen 9 */}
          <div className="grid grid-cols-2 gap-3 text-left">
            <div className="space-y-1.5 bg-[#0e1424] p-3 rounded-2xl border border-slate-800/80">
              <span className="text-[11px] font-bold text-emerald-400 uppercase tracking-wide">Strengths</span>
              <div className="flex flex-wrap gap-1.5">
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-300 border border-emerald-500/20 font-semibold">
                  Clear Explanation
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-300 border border-emerald-500/20 font-semibold">
                  Good Examples
                </span>
              </div>
            </div>

            <div className="space-y-1.5 bg-[#0e1424] p-3 rounded-2xl border border-slate-800/80">
              <span className="text-[11px] font-bold text-amber-400 uppercase tracking-wide">Areas to Improve</span>
              <div className="flex flex-wrap gap-1.5">
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-300 border border-amber-500/20 font-semibold">
                  System Design
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-300 border border-amber-500/20 font-semibold">
                  Time Complexity
                </span>
              </div>
            </div>
          </div>

          {/* Actions matching Screen 9 */}
          <div className="pt-2 space-y-2">
            <button
              onClick={() => setShowReportModal(true)}
              className="w-full py-3 rounded-2xl bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-xs shadow-lg shadow-indigo-600/30 transition active:scale-[0.99]"
            >
              View Detailed Report
            </button>
            <button
              onClick={() => {
                setViewMode('interview');
                setCurrentQIndex(0);
                setUserTranscript(INTERVIEW_QUESTIONS[0].sampleAnswer);
              }}
              className="w-full py-2.5 rounded-2xl bg-slate-900 hover:bg-slate-800 text-slate-300 font-semibold text-xs border border-slate-800 transition"
            >
              Restart Interview
            </button>
          </div>
        </div>

        {/* Modal for Detailed Report */}
        {showReportModal && (
          <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-[#0b101e] border border-slate-700 rounded-3xl p-6 max-w-md w-full space-y-4 shadow-2xl">
              <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                <div className="flex items-center gap-2">
                  <FileCheck className="h-5 w-5 text-emerald-400" />
                  <h3 className="text-sm font-bold text-white">Full Evaluation Telemetry</h3>
                </div>
                <button
                  onClick={() => setShowReportModal(false)}
                  className="text-slate-400 hover:text-white text-xs font-bold"
                >
                  ✕
                </button>
              </div>

              <div className="space-y-2 text-xs text-slate-300">
                <p><strong>Candidate:</strong> Sanyam Kumar</p>
                <p><strong>Assessed Track:</strong> Data Engineer / Tier-1 Core Systems</p>
                <p><strong>Questions Evaluated:</strong> 5 Completed</p>
                <p><strong>AI Verdict:</strong> Candidate demonstrated strong conceptual clarity on concurrency, hash collisions, and read scaling. Advise brushing up on distributed consensus failure cases.</p>
              </div>

              <button
                onClick={() => setShowReportModal(false)}
                className="w-full py-2.5 rounded-xl bg-blue-600 text-white font-bold text-xs"
              >
                Close Report
              </button>
            </div>
          </div>
        )}
      </div>
    );
  }

  // SCREEN 8: AI Interview Active Session
  return (
    <div className="space-y-4 max-w-xl mx-auto pb-6">
      {/* Session Header matching Screen 8: Technical Interview • Question X/5 • Timer */}
      <div className="bg-[#0b101e] border border-slate-800/80 rounded-2xl p-4 shadow-md flex items-center justify-between">
        <div>
          <div className="text-[10px] font-bold uppercase tracking-wider text-sky-400">
            {currentQ.category}
          </div>
          <div className="text-sm font-black text-white">
            Question {currentQ.num} of {INTERVIEW_QUESTIONS.length}
          </div>
        </div>
        <div className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-[#0e1424] border border-slate-800 text-xs font-mono font-bold text-amber-400">
          <Clock className="h-3.5 w-3.5" />
          <span>12:34</span>
        </div>
      </div>

      {/* 3D Glowing AI Robot Avatar Card matching Screen 8 */}
      <div className="bg-gradient-to-b from-[#0e1528] to-[#090d18] border border-slate-800/90 rounded-3xl p-6 shadow-xl flex flex-col items-center justify-center text-center relative overflow-hidden">
        {/* Ambient Halo */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 bg-sky-500/15 rounded-full blur-3xl pointer-events-none" />

        {/* 3D Robot Avatar representation */}
        <div className="relative mb-3">
          <div className="h-24 w-24 rounded-3xl bg-gradient-to-tr from-sky-400 via-indigo-500 to-purple-600 p-[2px] shadow-xl shadow-sky-500/20">
            <div className="h-full w-full bg-[#080d19] rounded-[22px] flex items-center justify-center relative overflow-hidden">
              <Bot className="h-12 w-12 text-sky-400 animate-pulse" />
              <div className="absolute inset-0 bg-gradient-to-t from-sky-500/20 to-transparent pointer-events-none" />
            </div>
          </div>
          {/* Pulsing Voice Dot */}
          <span className="absolute -bottom-1 -right-1 h-5 w-5 rounded-full bg-emerald-500 ring-4 ring-[#080d19] flex items-center justify-center text-[10px] text-white">
            <Volume2 className={`h-3 w-3 ${isRecording ? 'animate-ping' : ''}`} />
          </span>
        </div>

        <span className="text-xs font-extrabold text-white">Code Quest AI Recruiter</span>
        <span className="text-[11px] text-sky-400 font-medium">
          {isRecording ? 'Listening and transcribing audio...' : 'Tap microphone or type your response'}
        </span>
      </div>

      {/* AI Question Prompt Card matching Screen 8 */}
      <div className="bg-[#0b101e] border border-slate-800/80 rounded-2xl p-4 shadow-md space-y-2">
        <div className="flex items-center justify-between text-xs font-bold text-sky-400">
          <div className="flex items-center gap-1.5">
            <Sparkles className="h-3.5 w-3.5" />
            <span>Interviewer Prompt</span>
          </div>
          <span className="text-[10px] text-slate-400 font-mono">Q{currentQ.num}</span>
        </div>
        <p className="text-xs text-slate-200 leading-relaxed font-medium">
          {currentQ.question}
        </p>
      </div>

      {/* User Voice Transcription Bubble matching Screen 8 (Editable textarea) */}
      <div className="bg-gradient-to-br from-[#0c1426] to-[#0a101f] border border-indigo-500/30 rounded-2xl p-4 shadow-md space-y-2">
        <div className="flex items-center justify-between text-[11px] font-bold text-indigo-300">
          <span>Your Response</span>
          <span className="text-[10px] text-emerald-400 font-mono">Live Transcript</span>
        </div>
        <textarea
          rows={3}
          value={userTranscript}
          onChange={(e) => setUserTranscript(e.target.value)}
          placeholder="Speak or type your interview response here..."
          className="w-full bg-transparent text-xs text-slate-200 resize-none outline-none leading-relaxed italic"
        />
      </div>

      {/* Question Navigation Controls */}
      <div className="flex items-center justify-between px-1">
        <button
          onClick={handlePrevQuestion}
          disabled={currentQIndex === 0}
          className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1 transition ${
            currentQIndex === 0 ? 'text-slate-600 cursor-not-allowed' : 'text-slate-400 hover:text-white'
          }`}
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          <span>Previous</span>
        </button>

        <button
          onClick={handleNextQuestion}
          className="px-4 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-sky-400 text-xs font-bold border border-slate-800 flex items-center gap-1 transition"
        >
          <span>{currentQIndex === INTERVIEW_QUESTIONS.length - 1 ? 'Finish & Score' : 'Next Question'}</span>
          <ArrowRight className="h-3.5 w-3.5" />
        </button>
      </div>

      {/* Bottom Voice Controls matching Screen 8: [Tap to speak] and [End Interview] */}
      <div className="p-4 bg-[#0b101e] border border-slate-800/80 rounded-3xl shadow-xl flex items-center justify-around gap-4">
        {/* Mic Tap-To-Speak Button */}
        <button
          onClick={handleToggleSpeak}
          className="flex flex-col items-center gap-1.5 transition active:scale-95"
        >
          <div className={`h-14 w-14 rounded-full flex items-center justify-center text-white shadow-xl transition ${
            isRecording
              ? 'bg-rose-500 ring-4 ring-rose-500/30 animate-pulse'
              : 'bg-blue-600 hover:bg-blue-500 ring-4 ring-blue-500/20'
          }`}>
            {isRecording ? <MicOff className="h-6 w-6" /> : <Mic className="h-6 w-6" />}
          </div>
          <span className="text-[11px] font-bold text-slate-300">
            {isRecording ? 'Listening...' : 'Tap to speak'}
          </span>
        </button>

        {/* End Interview Button matching Screen 8 */}
        <button
          onClick={() => setViewMode('results')}
          className="flex flex-col items-center gap-1.5 transition active:scale-95"
        >
          <div className="h-14 w-14 rounded-full bg-rose-600 hover:bg-rose-500 flex items-center justify-center text-white shadow-xl ring-4 ring-rose-500/20">
            <PhoneOff className="h-6 w-6" />
          </div>
          <span className="text-[11px] font-bold text-rose-400">End Interview</span>
        </button>
      </div>
    </div>
  );
};
