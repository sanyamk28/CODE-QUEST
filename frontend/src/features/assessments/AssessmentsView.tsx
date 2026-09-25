import React, { useState } from 'react';
import {
  Calendar,
  Clock,
  Award,
  CheckCircle2,
  ExternalLink,
  ChevronRight,
  Sparkles,
  BarChart2,
  Building2,
  Play,
  FileCheck,
  X,
  AlertCircle
} from 'lucide-react';

interface TestItem {
  id: string;
  company: string;
  title: string;
  date: string;
  questions: string;
  duration: string;
  sections: string[];
}

export const AssessmentsView: React.FC = () => {
  const [filterTab, setFilterTab] = useState<'All' | 'Upcoming' | 'Active' | 'Completed'>('All');
  const [registeredMap, setRegisteredMap] = useState<Record<string, boolean>>({
    'tcs-1': true
  });
  const [activeTestModal, setActiveTestModal] = useState<TestItem | null>(null);
  const [isTestRunning, setIsTestRunning] = useState<boolean>(false);
  const [testCountdown, setTestCountdown] = useState<number>(5400); // 90 mins

  const upcomingTests: TestItem[] = [
    {
      id: 'tcs-1',
      company: 'TCS',
      title: 'TCS NQT Mock Test',
      date: 'Jan 15, 2025 • 10:00 AM',
      questions: '70 questions',
      duration: '90 mins',
      sections: ['Numerical Ability', 'Verbal Reasoning', 'Coding (2 Problems)']
    },
    {
      id: 'accenture-1',
      company: 'Accenture',
      title: 'Accenture Coding Assessment',
      date: 'Jan 20, 2025 • 02:00 PM',
      questions: '100 questions',
      duration: '120 mins',
      sections: ['Cognitive Ability', 'Technical Core', 'Coding Screen']
    },
    {
      id: 'wipro-1',
      company: 'Wipro',
      title: 'Wipro Elite Mock Test',
      date: 'Jan 22, 2025 • 11:00 AM',
      questions: '45 questions',
      duration: '60 mins',
      sections: ['Quantitative Aptitude', 'Written English', 'DSA Coding']
    },
    {
      id: 'infosys-1',
      company: 'Infosys',
      title: 'Infosys Skill Test',
      date: 'Jan 28, 2025 • 03:00 PM',
      questions: '60 questions',
      duration: '100 mins',
      sections: ['Logical Reasoning', 'Pseudocode', 'Python/Java Coding']
    }
  ];

  const completedTests = [
    {
      company: 'TCS',
      date: 'Jan 12',
      score: '85%',
      status: 'Passed'
    },
    {
      company: 'Accenture',
      date: 'Jan 5',
      score: '76%',
      status: 'Passed'
    },
    {
      company: 'Wipro',
      date: 'Dec 28',
      score: '92%',
      status: 'Top 3%'
    }
  ];

  const toggleRegister = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setRegisteredMap(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const handleLaunchTest = (test: TestItem) => {
    setActiveTestModal(test);
  };

  const formatCountdown = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const s = secs % 60;
    return `${mins}:${s < 10 ? '0' : ''}${s}`;
  };

  return (
    <div className="space-y-5 max-w-3xl mx-auto pb-6">
      {/* Filter Tabs matching Screen 13: [All | Upcoming | Active | Completed] */}
      <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
        {(['All', 'Upcoming', 'Active', 'Completed'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setFilterTab(tab)}
            className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all shrink-0 ${
              filterTab === tab
                ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
                : 'bg-[#0e1424] text-slate-400 hover:text-white border border-slate-800'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Upcoming / Active Tests List matching Screen 13 */}
      {(filterTab === 'All' || filterTab === 'Upcoming' || filterTab === 'Active') && (
        <div className="space-y-3">
          {upcomingTests.map((test) => {
            const isRegistered = !!registeredMap[test.id];
            return (
              <div
                key={test.id}
                onClick={() => handleLaunchTest(test)}
                className="p-4 rounded-3xl bg-[#0b101e] border border-slate-800/80 hover:border-slate-700 shadow-md flex items-center justify-between gap-3 cursor-pointer transition group"
              >
                <div className="flex items-center gap-3.5 min-w-0">
                  <div className="h-11 w-11 rounded-2xl bg-indigo-950/40 border border-indigo-800/40 flex items-center justify-center text-indigo-400 font-extrabold text-sm shrink-0">
                    <Building2 className="h-5 w-5" />
                  </div>
                  <div className="min-w-0">
                    <h3 className="text-xs sm:text-sm font-bold text-white group-hover:text-sky-300 transition truncate">
                      {test.title}
                    </h3>
                    <p className="text-[11px] text-slate-400 mt-0.5">{test.date} • {test.duration}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={(e) => toggleRegister(test.id, e)}
                    className={`px-4 py-2 rounded-xl text-xs font-bold transition shrink-0 shadow-sm ${
                      isRegistered
                        ? 'bg-emerald-600/30 text-emerald-300 border border-emerald-500/40'
                        : 'bg-blue-600 hover:bg-blue-500 text-white shadow-blue-600/20'
                    }`}
                  >
                    {isRegistered ? 'Registered ✓' : 'Register'}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Completed Assessments Section matching Screen 13 */}
      {(filterTab === 'All' || filterTab === 'Completed') && (
        <div className="bg-[#0b101e] border border-slate-800/80 rounded-3xl p-5 shadow-xl space-y-3.5">
          <div className="flex items-center justify-between pb-2 border-b border-slate-800/60">
            <h3 className="text-xs font-bold text-white uppercase tracking-wider">
              Completed Assessments
            </h3>
            <span className="text-[11px] text-slate-400 font-mono">3 Verified Results</span>
          </div>

          <div className="space-y-2">
            {completedTests.map((t, idx) => (
              <div
                key={idx}
                className="p-3 rounded-2xl bg-[#0e1424] border border-slate-800/80 flex items-center justify-between text-xs"
              >
                <div className="flex items-center gap-3">
                  <div className="h-8 w-8 rounded-xl bg-slate-800 flex items-center justify-center font-bold text-[10px] text-sky-400">
                    {t.company.substring(0, 3)}
                  </div>
                  <div>
                    <span className="font-bold text-white">{t.company} Assessment</span>
                    <span className="text-[10px] text-slate-500 ml-2">({t.date})</span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs font-extrabold font-mono">
                    {t.score}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Test Launch & Instructions Modal */}
      {activeTestModal && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#0b101e] border border-slate-700 rounded-3xl p-6 max-w-md w-full space-y-4 shadow-2xl">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Building2 className="h-5 w-5 text-sky-400" />
                <h3 className="text-sm font-bold text-white">{activeTestModal.title}</h3>
              </div>
              <button
                onClick={() => {
                  setActiveTestModal(null);
                  setIsTestRunning(false);
                }}
                className="text-slate-400 hover:text-white text-xs font-bold"
              >
                ✕
              </button>
            </div>

            {!isTestRunning ? (
              <>
                <div className="space-y-2 text-xs text-slate-300">
                  <div className="flex justify-between py-1 border-b border-slate-800/60">
                    <span className="text-slate-400">Scheduled:</span>
                    <span className="font-semibold text-white">{activeTestModal.date}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-800/60">
                    <span className="text-slate-400">Total Duration:</span>
                    <span className="font-semibold text-white">{activeTestModal.duration}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-800/60">
                    <span className="text-slate-400">Total Questions:</span>
                    <span className="font-semibold text-white">{activeTestModal.questions}</span>
                  </div>

                  <div className="pt-2">
                    <span className="text-slate-400 block mb-1">Test Sections:</span>
                    <div className="flex flex-wrap gap-1.5">
                      {activeTestModal.sections.map((sec) => (
                        <span key={sec} className="px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-700 text-sky-300 text-[11px] font-semibold">
                          {sec}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => setIsTestRunning(true)}
                  className="w-full py-3 rounded-2xl bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-xs shadow-lg shadow-indigo-600/30 transition flex items-center justify-center gap-2"
                >
                  <Play className="h-4 w-4 fill-white" />
                  <span>Start Mock Assessment Now</span>
                </button>
              </>
            ) : (
              <div className="space-y-4 text-center py-2">
                <div className="p-4 rounded-2xl bg-emerald-950/30 border border-emerald-500/40 text-xs text-emerald-300 font-semibold space-y-1">
                  <CheckCircle2 className="h-6 w-6 text-emerald-400 mx-auto" />
                  <div className="text-sm font-bold text-white">Assessment Environment Active</div>
                  <p className="text-[11px] text-slate-400">Simulating proctored IDE & aptitude telemetry</p>
                </div>

                <div className="flex items-center justify-center gap-2 text-lg font-black font-mono text-amber-400">
                  <Clock className="h-5 w-5" />
                  <span>Remaining: {formatCountdown(testCountdown)}</span>
                </div>

                <button
                  onClick={() => {
                    alert('Assessment completed! Score: 88/100 recorded.');
                    setActiveTestModal(null);
                    setIsTestRunning(false);
                  }}
                  className="w-full py-2.5 rounded-xl bg-blue-600 text-white font-bold text-xs shadow-md"
                >
                  Submit Assessment
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
