import React, { useState, useEffect } from 'react';
import axios from 'axios';

// Interfaces for Data Types
interface Student {
  id: string;
  name: string;
  email: string;
  auth_provider: 'Google' | 'GitHub' | 'Email';
  enrolled: string;
  role: string;
  solved: number;
  readiness: number;
  status: 'Active' | 'Suspended';
}

interface Question {
  id: string;
  title: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  type: 'Coding' | 'SQL' | 'MCQ';
  tags: string[];
  status: 'Published' | 'Draft';
  desc: string;
  requirements: string[];
  starterCode?: string;
  testCases?: string;
}

interface Submission {
  id: string;
  student: string;
  problem: string;
  status: 'Accepted' | 'Runtime Error' | 'Time Limit';
  time: string;
}

interface SecurityLog {
  id: string;
  timestamp: string;
  email: string;
  authProvider: 'Google OAuth' | 'GitHub OAuth' | 'Email / Password' | 'API Key';
  ipAddress: string;
  deviceLocation: string;
  status: 'SUCCESSFUL' | 'FAILED AUTH';
}

interface LearningResource {
  id: string;
  title: string;
  field: 'Software Engineer' | 'Data Engineer' | 'Frontend' | 'Full-Stack' | 'DevOps';
  type: 'PDF' | 'Markdown' | 'CSV' | 'Document';
  extractedQuestionsCount: number;
  uploadedAt: string;
  status: 'Parsed & Synced' | 'Processing';
}

export default function App() {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'submissions' | 'curriculum' | 'resources' | 'users' | 'analytics' | 'settings'>('dashboard');
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');

  // Resource Uploader State
  const [resourcesList, setResourcesList] = useState<LearningResource[]>([
    {
      id: 'res_1',
      title: 'Meta Data Engineering SQL & Schema Modeling Notes.pdf',
      field: 'Data Engineer',
      type: 'PDF',
      extractedQuestionsCount: 14,
      uploadedAt: 'Today at 18:30',
      status: 'Parsed & Synced'
    },
    {
      id: 'res_2',
      title: 'Google Distributed Systems & DSA Interview Guide.md',
      field: 'Software Engineer',
      type: 'Markdown',
      extractedQuestionsCount: 22,
      uploadedAt: 'Yesterday at 14:15',
      status: 'Parsed & Synced'
    }
  ]);
  const [uploadResourceTitle, setUploadResourceTitle] = useState('');
  const [uploadResourceField, setUploadResourceField] = useState<'Software Engineer' | 'Data Engineer' | 'Frontend' | 'Full-Stack' | 'DevOps'>('Software Engineer');
  const [uploadResourceContent, setUploadResourceContent] = useState('');
  const [isExtractingQuestions, setIsExtractingQuestions] = useState(false);
  const [extractionSuccessMsg, setExtractionSuccessMsg] = useState('');

  // Modal State for Edit Problem
  const [showEditProblemModal, setShowEditProblemModal] = useState(false);
  const [selectedQuestion, setSelectedQuestion] = useState<Question | null>(null);
  const [editorTab, setEditorTab] = useState<'desc' | 'starter' | 'tests'>('desc');

  // Modal State for Add Topic
  const [showAddTopicModal, setShowAddTopicModal] = useState(false);
  const [newTopicTitle, setNewTopicTitle] = useState('');

  // Sample Students Data
  const [students, setStudents] = useState<Student[]>([
    {
      id: 'CQ-9921',
      name: 'Alex Mercer',
      email: 'alex.m@example.com',
      auth_provider: 'Google',
      enrolled: 'Oct 12, 2023',
      role: 'Software Engineer',
      solved: 142,
      readiness: 88,
      status: 'Active'
    },
    {
      id: 'CQ-8422',
      name: 'Sarah Chen',
      email: 'schen.data@example.com',
      auth_provider: 'GitHub',
      enrolled: 'Nov 01, 2023',
      role: 'Data Engineer',
      solved: 156,
      readiness: 92,
      status: 'Active'
    },
    {
      id: 'CQ-1204',
      name: 'Marcus Johnson',
      email: 'mj.code@example.com',
      auth_provider: 'Email',
      enrolled: 'Jan 15, 2024',
      role: 'Software Engineer',
      solved: 43,
      readiness: 45,
      status: 'Active'
    },
    {
      id: 'CQ-5519',
      name: 'Elena Rostova',
      email: 'elena.r@example.com',
      auth_provider: 'Google',
      enrolled: 'Feb 20, 2024',
      role: 'DevOps',
      solved: 89,
      readiness: 76,
      status: 'Active'
    }
  ]);

  // Sample Submissions
  const [recentSubmissions, setRecentSubmissions] = useState<Submission[]>([
    { id: '1', student: 'usr_8921', problem: 'Binary Tree Inversion', status: 'Accepted', time: 'Just now' },
    { id: '2', student: 'usr_4430', problem: 'Dynamic Knapsack', status: 'Runtime Error', time: '2m ago' },
    { id: '3', student: 'usr_1105', problem: 'Graph Traversal BFS', status: 'Accepted', time: '5m ago' },
    { id: '4', student: 'usr_9023', problem: 'String Anagram', status: 'Time Limit', time: '12m ago' }
  ]);

  // Sample Questions Data
  const [questionsList, setQuestionsList] = useState<Question[]>([
    {
      id: '1042',
      title: 'Distributed Task Queue',
      difficulty: 'Hard',
      type: 'Coding',
      tags: ['Redis', 'System Design'],
      status: 'Draft',
      desc: '# Distributed Task Queue\n\nDesign and implement a resilient task queue system capable of handling distributed workers. The system should guarantee at-least-once delivery and handle worker node failures gracefully.',
      requirements: [
        'Implement `enqueue(task_id, payload)`',
        'Implement `dequeue()` for workers to fetch tasks',
        'Implement a mechanism to detect stalled tasks (timeout > 30s) and requeue them.'
      ],
      starterCode: 'class DistributedTaskQueue:\n    def __init__(self, redis_client):\n        self.redis = redis_client\n\n    def enqueue(self, task_id: str, payload: dict) -> bool:\n        pass\n\n    def dequeue(self) -> dict:\n        pass',
      testCases: '[\n  { "input": { "task_id": "t_101", "payload": { "cmd": "send_email" } }, "expected": true },\n  { "input": { "action": "dequeue" }, "expected": "t_101" }\n]'
    },
    {
      id: '1001',
      title: 'Two Sum',
      difficulty: 'Easy',
      type: 'Coding',
      tags: ['Arrays', 'Hash Map'],
      status: 'Published',
      desc: 'Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target.',
      requirements: ['O(N) time complexity target', 'Single unique solution guarantee']
    },
    {
      id: '1002',
      title: 'Department Top Three Salaries',
      difficulty: 'Medium',
      type: 'SQL',
      tags: ['SQL', 'Window Functions'],
      status: 'Published',
      desc: 'Find the employees who earn the top three unique salaries in each department.',
      requirements: ['DENSE_RANK() aggregation', 'Partition by Department']
    }
  ]);

  // Security Logs
  const [securityLogs, setSecurityLogs] = useState<SecurityLog[]>([
    {
      id: 'sec_1',
      timestamp: '2026-10-27 14:32:01 UTC',
      email: 'j.doe@example.com',
      authProvider: 'Google OAuth',
      ipAddress: '192.168.1.105',
      deviceLocation: 'Chrome on macOS\nSan Francisco, US',
      status: 'SUCCESSFUL'
    },
    {
      id: 'sec_2',
      timestamp: '2026-10-27 14:31:43 UTC',
      email: 'a.lincoln@domain.co',
      authProvider: 'Email / Password',
      ipAddress: '203.0.113.42',
      deviceLocation: 'Safari on iOS\nLondon, UK',
      status: 'SUCCESSFUL'
    },
    {
      id: 'sec_3',
      timestamp: '2026-10-27 14:28:12 UTC',
      email: 'unknown_user@test.com',
      authProvider: 'API Key',
      ipAddress: '45.22.18.100',
      deviceLocation: 'Unknown Device\nUnknown',
      status: 'FAILED AUTH'
    },
    {
      id: 'sec_4',
      timestamp: '2026-10-27 14:25:05 UTC',
      email: 'm.khan@techcorp.in',
      authProvider: 'GitHub OAuth',
      ipAddress: '10.0.0.15',
      deviceLocation: 'Firefox on Windows\nToronto, CA',
      status: 'SUCCESSFUL'
    }
  ]);

  const handleExtractAndDistribute = () => {
    if (!uploadResourceTitle) return;
    setIsExtractingQuestions(true);
    setExtractionSuccessMsg('');

    setTimeout(() => {
      setIsExtractingQuestions(false);
      const newRes: LearningResource = {
        id: `res_${Date.now()}`,
        title: uploadResourceTitle,
        field: uploadResourceField,
        type: uploadResourceTitle.endsWith('.pdf') ? 'PDF' : uploadResourceTitle.endsWith('.md') ? 'Markdown' : 'Document',
        extractedQuestionsCount: 12,
        uploadedAt: 'Just now',
        status: 'Parsed & Synced'
      };

      setResourcesList([newRes, ...resourcesList]);

      // Generate and add tailored questions to the question bank
      let generatedQ: Question;
      if (uploadResourceField === 'Data Engineer') {
        generatedQ = {
          id: `${Math.floor(1000 + Math.random() * 9000)}`,
          title: `Optimizing Aggregates & Window Partitioning (${uploadResourceTitle.slice(0, 20)})`,
          difficulty: 'Hard',
          type: 'SQL',
          tags: ['Data Engineering', 'SQL', 'PostgreSQL'],
          status: 'Published',
          desc: `Extracted from resource "${uploadResourceTitle}".\n\nCalculate rolling 7-day conversion metrics partitioned by user segment without full table scans.`,
          requirements: ['Use WINDOW sliding frame', 'Optimize index traversal']
        };
      } else if (uploadResourceField === 'Software Engineer') {
        generatedQ = {
          id: `${Math.floor(1000 + Math.random() * 9000)}`,
          title: `LRU Cache with TTL Eviction (${uploadResourceTitle.slice(0, 20)})`,
          difficulty: 'Hard',
          type: 'Coding',
          tags: ['Data Structures', 'Hash Map', 'Doubly Linked List'],
          status: 'Published',
          desc: `Extracted from resource "${uploadResourceTitle}".\n\nDesign a data structure that follows the constraints of a Least Recently Used (LRU) cache with time-to-live eviction.`,
          requirements: ['O(1) get & put operations', 'Auto-evict expired keys']
        };
      } else {
        generatedQ = {
          id: `${Math.floor(1000 + Math.random() * 9000)}`,
          title: `Automated Canary Deployment Pipeline (${uploadResourceTitle.slice(0, 20)})`,
          difficulty: 'Medium',
          type: 'Coding',
          tags: ['DevOps', 'CI/CD', 'Docker'],
          status: 'Published',
          desc: `Extracted from resource "${uploadResourceTitle}".\n\nWrite a health-check script that triggers traffic rollback when error rates exceed 2%.`,
          requirements: ['Parse JSON metrics feed', 'Execute rollback webhook']
        };
      }

      setQuestionsList([generatedQ, ...questionsList]);
      setExtractionSuccessMsg(`✅ Extracted 12 questions and dynamically synced to ${uploadResourceField} students!`);
      setUploadResourceTitle('');
      setUploadResourceContent('');
    }, 1500);
  };

  const openEditModal = (q: Question) => {
    setSelectedQuestion({ ...q });
    setShowEditProblemModal(true);
  };

  const saveEditedProblem = () => {
    if (selectedQuestion) {
      setQuestionsList(prev => prev.map(item => item.id === selectedQuestion.id ? selectedQuestion : item));
      setShowEditProblemModal(false);
    }
  };

  return (
    <div className="flex h-screen bg-[#070b19] text-gray-100 font-sans overflow-hidden">
      {/* ------------------------------------------------------------- */}
      {/* LEFT NAVIGATION SIDEBAR */}
      {/* ------------------------------------------------------------- */}
      <aside className="w-64 bg-[#0a0f24] border-r border-[#1a233d] flex flex-col justify-between p-4">
        <div>
          {/* Platform Title */}
          <div className="flex items-center space-x-3 px-2 py-4 mb-4">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-600 to-violet-600 flex items-center justify-center font-black text-white text-lg shadow-lg shadow-blue-500/20">
              CQ
            </div>
            <div>
              <h1 className="font-black text-sm tracking-wider text-white">CODE QUEST</h1>
              <p className="text-[10px] font-bold text-blue-400 uppercase tracking-widest">ADMIN PORTAL</p>
            </div>
          </div>

          {/* Navigation Items */}
          <nav className="space-y-1.5">
            {[
              { id: 'dashboard', label: 'Dashboard', icon: '📊' },
              { id: 'submissions', label: 'Submissions', icon: '💻' },
              { id: 'curriculum', label: 'Curriculum', icon: '🗺️' },
              { id: 'resources', label: 'Resource Studio', icon: '📚' },
              { id: 'users', label: 'User Management', icon: '👥' },
              { id: 'analytics', label: 'Analytics', icon: '📈' },
              { id: 'settings', label: 'Settings', icon: '⚙️' }
            ].map(item => (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id as any)}
                className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                  activeTab === item.id
                    ? 'bg-blue-600/15 text-blue-400 border border-blue-500/30 shadow-sm'
                    : 'text-gray-400 hover:text-gray-200 hover:bg-[#111833]'
                }`}
              >
                <span className="text-base">{item.icon}</span>
                <span>{item.label}</span>
              </button>
            ))}
          </nav>
        </div>

        {/* Admin Footer Badge */}
        <div className="p-3 bg-[#0d1430] rounded-xl border border-[#1a233d] flex items-center space-x-3">
          <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center font-bold text-xs text-white">
            AD
          </div>
          <div className="overflow-hidden">
            <p className="text-xs font-bold text-white truncate">Administrator</p>
            <p className="text-[10px] text-emerald-400 flex items-center">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 mr-1 animate-pulse"></span>
              Live Sync Active
            </p>
          </div>
        </div>
      </aside>

      {/* ------------------------------------------------------------- */}
      {/* MAIN CONTENT AREA */}
      {/* ------------------------------------------------------------- */}
      <main className="flex-1 flex flex-col overflow-y-auto">
        {/* Top App Header */}
        <header className="h-16 border-b border-[#1a233d] bg-[#090e21]/80 backdrop-blur-md px-6 flex items-center justify-between sticky top-0 z-20">
          <div className="flex items-center space-x-3">
            <button className="text-gray-400 hover:text-white text-lg">☰</button>
            <h2 className="text-sm font-bold text-white tracking-wide">Platform Overview</h2>
          </div>
          <div className="flex items-center space-x-3">
            <div className="relative">
              <input
                type="text"
                placeholder="Search..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="bg-[#0f1738] border border-[#1e2a4a] text-xs text-white placeholder-gray-500 rounded-lg pl-8 pr-3 py-1.5 focus:outline-none focus:border-blue-500 w-64"
              />
              <span className="absolute left-2.5 top-1.5 text-xs text-gray-500">🔍</span>
            </div>
            <button className="px-3 py-1.5 bg-[#0f1738] border border-[#1e2a4a] text-xs font-bold text-gray-300 rounded-lg hover:border-blue-500">
              🔔
            </button>
          </div>
        </header>

        <div className="p-6 space-y-6 max-w-7xl mx-auto w-full">
          {/* ========================================================= */}
          {/* TAB 1: EXECUTIVE OVERVIEW (DASHBOARD)                     */}
          {/* ========================================================= */}
          {activeTab === 'dashboard' && (
            <div className="space-y-6">
              {/* 4 KPI Cards */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-[#0c122c] border border-[#1a2444] p-5 rounded-2xl relative overflow-hidden">
                  <p className="text-[10px] font-extrabold text-gray-400 uppercase tracking-widest">TOTAL ENROLLED</p>
                  <div className="flex items-baseline space-x-2 mt-2">
                    <h3 className="text-2xl font-black text-white">1,284</h3>
                    <span className="text-xs font-bold text-emerald-400">+12%</span>
                  </div>
                  <div className="h-1 bg-[#151e3d] rounded-full mt-4 overflow-hidden">
                    <div className="h-full bg-emerald-400 w-3/4"></div>
                  </div>
                </div>

                <div className="bg-[#0c122c] border border-[#1a2444] p-5 rounded-2xl relative overflow-hidden">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-[10px] font-extrabold text-gray-400 uppercase tracking-widest">ACTIVE TODAY</p>
                      <h3 className="text-2xl font-black text-white mt-2">432</h3>
                    </div>
                    <span className="text-lg">⚡</span>
                  </div>
                  <div className="h-1 bg-[#151e3d] rounded-full mt-4 overflow-hidden">
                    <div className="h-full bg-blue-400 w-1/2"></div>
                  </div>
                </div>

                <div className="bg-[#0c122c] border border-[#1a2444] p-5 rounded-2xl relative overflow-hidden">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-[10px] font-extrabold text-gray-400 uppercase tracking-widest">AVG. READINESS</p>
                      <h3 className="text-2xl font-black text-white mt-2">78.5%</h3>
                    </div>
                    <span className="text-lg">📈</span>
                  </div>
                  <div className="h-1 bg-[#151e3d] rounded-full mt-4 overflow-hidden">
                    <div className="h-full bg-violet-400 w-[78%]"></div>
                  </div>
                </div>

                <div className="bg-[#0c122c] border border-[#1a2444] p-5 rounded-2xl relative overflow-hidden">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-[10px] font-extrabold text-gray-400 uppercase tracking-widest">QUESTION BANK</p>
                      <h3 className="text-2xl font-black text-white mt-2">156</h3>
                    </div>
                    <span className="text-lg">🗄️</span>
                  </div>
                  <div className="h-1 bg-[#151e3d] rounded-full mt-4 overflow-hidden">
                    <div className="h-full bg-cyan-400 w-4/5"></div>
                  </div>
                </div>
              </div>

              {/* Recent Submissions Table */}
              <div className="bg-[#0c122c] border border-[#1a2444] rounded-2xl p-6">
                <div className="flex justify-between items-center mb-4">
                  <div className="flex items-center space-x-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
                    <h4 className="text-sm font-extrabold text-white">Recent Submissions</h4>
                  </div>
                  <button className="text-xs font-bold text-blue-400 hover:underline">VIEW ALL</button>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="border-b border-[#17203d] text-gray-400 text-[10px] uppercase font-bold tracking-wider">
                        <th className="py-3 px-4">STUDENT</th>
                        <th className="py-3 px-4">PROBLEM</th>
                        <th className="py-3 px-4">STATUS</th>
                        <th className="py-3 px-4 text-right">TIME</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#131b36]">
                      {recentSubmissions.map(sub => (
                        <tr key={sub.id} className="hover:bg-[#111938]/60 transition">
                          <td className="py-3 px-4 font-mono font-bold text-gray-300">{sub.student}</td>
                          <td className="py-3 px-4 font-medium text-white">{sub.problem}</td>
                          <td className="py-3 px-4">
                            <span className={`px-2.5 py-1 rounded-md text-[10px] font-extrabold ${
                              sub.status === 'Accepted'
                                ? 'bg-emerald-950/80 text-emerald-400 border border-emerald-800'
                                : sub.status === 'Runtime Error'
                                ? 'bg-rose-950/80 text-rose-400 border border-rose-800'
                                : 'bg-amber-950/80 text-amber-400 border border-amber-800'
                            }`}>
                              {sub.status === 'Accepted' ? '● Accepted' : sub.status}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-right text-gray-400 font-mono">{sub.time}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* ========================================================= */}
          {/* TAB 2: QUESTION BANK (SUBMISSIONS / QUESTION STUDIO)      */}
          {/* ========================================================= */}
          {activeTab === 'submissions' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="text-lg font-black text-white">Question Management</h3>
                  <p className="text-xs text-gray-400">Author and deploy coding challenges and test cases.</p>
                </div>
                <button 
                  onClick={() => openEditModal(questionsList[0])}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-xs font-extrabold text-white rounded-xl shadow-lg shadow-blue-500/20"
                >
                  + CREATE NEW PROBLEM
                </button>
              </div>

              {/* Questions Grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {questionsList.map(q => (
                  <div key={q.id} className="bg-[#0c122c] border border-[#1a2444] rounded-2xl p-5 flex flex-col justify-between hover:border-blue-500/50 transition">
                    <div>
                      <div className="flex justify-between items-start mb-2">
                        <span className="text-[10px] font-mono text-gray-400 font-bold">ID: {q.id}</span>
                        <span className={`px-2 py-0.5 rounded text-[9px] font-black ${
                          q.difficulty === 'Hard' ? 'bg-rose-950 text-rose-400 border border-rose-800' :
                          q.difficulty === 'Medium' ? 'bg-amber-950 text-amber-400 border border-amber-800' :
                          'bg-emerald-950 text-emerald-400 border border-emerald-800'
                        }`}>
                          {q.difficulty.toUpperCase()}
                        </span>
                      </div>
                      <h4 className="font-extrabold text-sm text-white mb-2">{q.title}</h4>
                      <div className="flex flex-wrap gap-1.5 mb-4">
                        {q.tags.map(tag => (
                          <span key={tag} className="px-2 py-0.5 bg-[#121a3a] text-gray-300 text-[10px] rounded font-medium">
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                    <div className="flex justify-between items-center pt-3 border-t border-[#17203d]">
                      <span className="text-[10px] text-gray-400 font-bold">{q.type}</span>
                      <button 
                        onClick={() => openEditModal(q)}
                        className="text-xs font-extrabold text-blue-400 hover:text-blue-300"
                      >
                        Edit Problem ➔
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ========================================================= */}
          {/* TAB 3: CURRICULUM (ROADMAP BUILDER)                      */}
          {/* ========================================================= */}
          {activeTab === 'curriculum' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="text-lg font-black text-white">Topic & Roadmap Builder</h3>
                  <p className="text-xs text-gray-400">Construct and reorder learning pathways. Changes sync automatically.</p>
                </div>
                <div className="flex space-x-3">
                  <button className="px-3.5 py-2 bg-[#121a3a] border border-[#1e2a4a] text-xs font-bold text-gray-200 rounded-xl hover:border-blue-500">
                    + Add Subtopic
                  </button>
                  <button 
                    onClick={() => setShowAddTopicModal(true)}
                    className="px-3.5 py-2 bg-blue-600 hover:bg-blue-500 text-xs font-extrabold text-white rounded-xl shadow-lg shadow-blue-500/20"
                  >
                    + Add Parent Topic
                  </button>
                </div>
              </div>

              {/* Roadmap Structure */}
              <div className="space-y-4">
                {/* Topic Group 1 */}
                <div className="bg-[#0c122c] border border-[#1a2444] rounded-2xl p-5">
                  <div className="flex justify-between items-center mb-4">
                    <div className="flex items-center space-x-3">
                      <span className="text-base">📁</span>
                      <h4 className="font-extrabold text-sm text-white">Data Structures</h4>
                      <span className="px-2 py-0.5 bg-emerald-950 text-emerald-400 border border-emerald-800 text-[9px] font-bold rounded">
                        3 SUBTOPICS · PUBLISHED
                      </span>
                    </div>
                    <button className="text-gray-400 hover:text-white text-xs">⋮</button>
                  </div>

                  <div className="space-y-2 pl-6 border-l-2 border-blue-500/30">
                    <div className="p-3 bg-[#111938] rounded-xl border border-[#1a233d] flex justify-between items-center">
                      <span className="text-xs font-bold text-gray-200">Arrays & Strings</span>
                      <span className="text-[10px] text-gray-400 font-mono">12 Modules</span>
                    </div>
                    <div className="p-3 bg-[#111938] rounded-xl border border-[#1a233d] flex justify-between items-center">
                      <span className="text-xs font-bold text-gray-200">Linked Lists</span>
                      <span className="text-[10px] text-gray-400 font-mono">8 Modules</span>
                    </div>
                    <div className="p-3 bg-[#111938] rounded-xl border border-[#1a233d] flex justify-between items-center">
                      <span className="text-xs font-bold text-gray-200">Stacks & Queues</span>
                      <span className="text-[10px] text-gray-400 font-mono">6 Modules</span>
                    </div>
                  </div>
                </div>

                {/* Topic Group 2 */}
                <div className="bg-[#0c122c] border border-[#1a2444] rounded-2xl p-5">
                  <div className="flex justify-between items-center mb-4">
                    <div className="flex items-center space-x-3">
                      <span className="text-base">📊</span>
                      <h4 className="font-extrabold text-sm text-white">Advanced Algorithms</h4>
                      <span className="px-2 py-0.5 bg-amber-950 text-amber-400 border border-amber-800 text-[9px] font-bold rounded">
                        2 SUBTOPICS · DRAFT
                      </span>
                    </div>
                    <button className="text-gray-400 hover:text-white text-xs">⋮</button>
                  </div>

                  <div className="space-y-2 pl-6 border-l-2 border-purple-500/30">
                    <div className="p-3 bg-[#111938] rounded-xl border border-[#1a233d] flex justify-between items-center">
                      <span className="text-xs font-bold text-gray-200">Dynamic Programming</span>
                      <span className="text-[10px] text-gray-400 font-mono">15 Modules</span>
                    </div>
                    <div className="p-3 bg-[#111938] rounded-xl border border-[#1a233d] flex justify-between items-center opacity-60">
                      <span className="text-xs font-bold text-gray-200">Graph Theory (Coming Soon)</span>
                      <span className="text-[10px] text-gray-400 font-mono">8 Modules</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ========================================================= */}
          {/* TAB 4: RESOURCE STUDIO & AI QUESTION EXTRACTOR            */}
          {/* ========================================================= */}
          {activeTab === 'resources' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-black text-white">Resource Studio & AI Question Extractor</h3>
                <p className="text-xs text-gray-400">
                  Upload PDF curricula, interview guides, and notes. The AI automatically parses questions and distributes them to students based on their field specification.
                </p>
              </div>

              {/* Uploader Card */}
              <div className="bg-[#0c122c] border border-[#1a2444] rounded-2xl p-6">
                <h4 className="text-sm font-extrabold text-white mb-4 flex items-center">
                  <span className="text-base mr-2">📤</span>
                  Upload New Learning Resource & Extract Questions
                </h4>

                {extractionSuccessMsg ? (
                  <div className="p-3 bg-emerald-950/80 border border-emerald-800 rounded-xl text-xs text-emerald-300 font-bold mb-4">
                    {extractionSuccessMsg}
                  </div>
                ) : null}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="block text-[10px] font-extrabold text-gray-400 uppercase tracking-wider mb-1">
                      RESOURCE TITLE / FILE NAME
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Amazon DSA & Dynamic Programming Handbook.pdf"
                      value={uploadResourceTitle}
                      onChange={e => setUploadResourceTitle(e.target.value)}
                      className="w-full bg-[#070b1b] border border-[#172242] rounded-xl p-3 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-extrabold text-gray-400 uppercase tracking-wider mb-1">
                      TARGET FIELD SPECIFICATION
                    </label>
                    <select
                      value={uploadResourceField}
                      onChange={e => setUploadResourceField(e.target.value as any)}
                      className="w-full bg-[#070b1b] border border-[#172242] rounded-xl p-3 text-xs text-white focus:outline-none focus:border-blue-500"
                    >
                      <option value="Software Engineer">Software Engineer (Algorithms & System Design)</option>
                      <option value="Data Engineer">Data Engineer (SQL, Pipelines & Aggregations)</option>
                      <option value="Frontend">Frontend (React, JavaScript & State)</option>
                      <option value="Full-Stack">Full-Stack (REST APIs & Databases)</option>
                      <option value="DevOps">DevOps (Docker, Kubernetes & CI/CD)</option>
                    </select>
                  </div>
                </div>

                <div className="mb-4">
                  <label className="block text-[10px] font-extrabold text-gray-400 uppercase tracking-wider mb-1">
                    RESOURCE CONTENT / SYLLABUS TEXT (OR DRAG PDF HERE)
                  </label>
                  <textarea
                    rows={4}
                    placeholder="Paste technical syllabus, problem statements, or chapter notes to extract questions..."
                    value={uploadResourceContent}
                    onChange={e => setUploadResourceContent(e.target.value)}
                    className="w-full bg-[#070b1b] border border-[#172242] rounded-xl p-3 text-xs text-gray-200 font-mono focus:outline-none focus:border-blue-500"
                  />
                </div>

                <button
                  onClick={handleExtractAndDistribute}
                  disabled={isExtractingQuestions || !uploadResourceTitle}
                  className={`px-6 py-3 rounded-xl text-xs font-extrabold text-white flex items-center space-x-2 transition ${
                    uploadResourceTitle
                      ? 'bg-gradient-to-r from-blue-600 to-violet-600 hover:from-blue-500 hover:to-violet-500 shadow-lg shadow-blue-500/20'
                      : 'bg-gray-800 text-gray-500 cursor-not-allowed'
                  }`}
                >
                  <span>{isExtractingQuestions ? '🔄' : '⚡'}</span>
                  <span>
                    {isExtractingQuestions 
                      ? 'EXTRACTING & DELIVERING TO STUDENTS...' 
                      : `EXTRACT QUESTIONS & DISTRIBUTE TO ${uploadResourceField.toUpperCase()} STUDENTS`}
                  </span>
                </button>
              </div>

              {/* Uploaded Resources List */}
              <div className="bg-[#0c122c] border border-[#1a2444] rounded-2xl p-6">
                <h4 className="text-sm font-extrabold text-white mb-4">Active Field Curriculum Resources</h4>
                <div className="space-y-3">
                  {resourcesList.map(res => (
                    <div key={res.id} className="p-4 bg-[#0d1430] border border-[#172242] rounded-xl flex justify-between items-center">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 rounded-xl bg-[#131c40] border border-blue-500/30 flex items-center justify-center text-base">
                          {res.type === 'PDF' ? '📄' : '📝'}
                        </div>
                        <div>
                          <p className="font-bold text-xs text-white">{res.title}</p>
                          <div className="flex items-center space-x-2 mt-1">
                            <span className="px-2 py-0.5 bg-[#172554] text-blue-300 text-[9px] font-extrabold rounded">
                              {res.field}
                            </span>
                            <span className="text-[10px] text-gray-400 font-mono">
                              {res.extractedQuestionsCount} Questions Extracted
                            </span>
                            <span className="text-[10px] text-gray-500">· {res.uploadedAt}</span>
                          </div>
                        </div>
                      </div>
                      <span className="px-2.5 py-1 bg-emerald-950 text-emerald-400 border border-emerald-800 text-[10px] font-bold rounded-lg flex items-center">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 mr-1.5"></span>
                        {res.status}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ========================================================= */}
          {/* TAB 5: STUDENT DATABASE (USER MANAGEMENT)                 */}
          {/* ========================================================= */}
          {activeTab === 'users' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="text-lg font-black text-white">Student Database</h3>
                  <p className="text-xs text-gray-400">Track placement readiness scores and authenticate records.</p>
                </div>
                <div className="flex space-x-3">
                  <select 
                    value={roleFilter}
                    onChange={e => setRoleFilter(e.target.value)}
                    className="bg-[#0f1738] border border-[#1e2a4a] text-xs text-white rounded-lg px-3 py-1.5"
                  >
                    <option value="All">All Roles</option>
                    <option value="Software Engineer">Software Engineer</option>
                    <option value="Data Engineer">Data Engineer</option>
                    <option value="DevOps">DevOps</option>
                  </select>
                </div>
              </div>

              {/* Student Table */}
              <div className="bg-[#0c122c] border border-[#1a2444] rounded-2xl overflow-hidden">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-[#17203d] text-gray-400 text-[10px] uppercase font-bold tracking-wider bg-[#090e21]">
                      <th className="py-3.5 px-4">STUDENT</th>
                      <th className="py-3.5 px-4">CONTACT</th>
                      <th className="py-3.5 px-4">ROLE & AUTH</th>
                      <th className="py-3.5 px-4">METRICS</th>
                      <th className="py-3.5 px-4">READINESS</th>
                      <th className="py-3.5 px-4 text-right">ACTIONS</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#131b36]">
                    {students.map(std => (
                      <tr key={std.id} className="hover:bg-[#111938]/60 transition">
                        <td className="py-3.5 px-4">
                          <div className="flex items-center space-x-3">
                            <div className="w-8 h-8 rounded-full bg-blue-600/30 border border-blue-500/50 flex items-center justify-center font-bold text-xs text-blue-300">
                              {std.name.slice(0, 2).toUpperCase()}
                            </div>
                            <div>
                              <p className="font-bold text-white">{std.name}</p>
                              <p className="text-[10px] font-mono text-gray-400">ID: {std.id}</p>
                            </div>
                          </div>
                        </td>
                        <td className="py-3.5 px-4">
                          <p className="text-gray-200">{std.email}</p>
                          <p className="text-[10px] text-gray-400">Enrolled: {std.enrolled}</p>
                        </td>
                        <td className="py-3.5 px-4">
                          <div className="flex items-center space-x-2">
                            <span className="font-medium text-gray-300">{std.role}</span>
                            <span className="px-2 py-0.5 rounded text-[9px] font-bold bg-[#131e42] text-blue-300 border border-blue-700/50">
                              {std.auth_provider}
                            </span>
                          </div>
                        </td>
                        <td className="py-3.5 px-4 font-mono font-bold text-gray-200">
                          {std.solved} Solved
                        </td>
                        <td className="py-3.5 px-4">
                          <div className="w-32">
                            <div className="flex justify-between text-[10px] mb-1 font-bold">
                              <span className="text-gray-400">Score</span>
                              <span className="text-blue-400">{std.readiness}%</span>
                            </div>
                            <div className="h-1.5 bg-[#17203d] rounded-full overflow-hidden">
                              <div className="h-full bg-blue-500 rounded-full" style={{ width: `${std.readiness}%` }}></div>
                            </div>
                          </div>
                        </td>
                        <td className="py-3.5 px-4 text-right">
                          <button className="text-xs font-bold text-blue-400 hover:text-blue-300 px-2 py-1 bg-[#101838] border border-[#1a254a] rounded-lg">
                            Inspect
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ========================================================= */}
          {/* TAB 5: SECURITY & LOGIN HISTORY (ANALYTICS)               */}
          {/* ========================================================= */}
          {activeTab === 'analytics' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-black text-white">Security & Login History</h3>
                <p className="text-xs text-gray-400">Live monitoring of authentication events across the platform.</p>
              </div>

              {/* 3 Security Stats */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-[#0c122c] border border-[#1a2444] p-5 rounded-2xl">
                  <p className="text-[10px] font-extrabold text-gray-400 uppercase tracking-widest">TOTAL LOGINS (24H)</p>
                  <h3 className="text-2xl font-black text-white mt-2">12,482</h3>
                  <p className="text-xs text-emerald-400 font-semibold mt-1">↗ +1.2k vs yesterday</p>
                </div>
                <div className="bg-[#0c122c] border border-[#1a2444] p-5 rounded-2xl">
                  <p className="text-[10px] font-extrabold text-gray-400 uppercase tracking-widest">FAILED ATTEMPTS</p>
                  <h3 className="text-2xl font-black text-white mt-2">342</h3>
                  <p className="text-xs text-amber-400 font-semibold mt-1">⚠️ Elevated risk detected</p>
                </div>
                <div className="bg-[#0c122c] border border-[#1a2444] p-5 rounded-2xl">
                  <p className="text-[10px] font-extrabold text-gray-400 uppercase tracking-widest">ACTIVE SESSIONS</p>
                  <h3 className="text-2xl font-black text-white mt-2">4,109</h3>
                  <p className="text-xs text-blue-400 font-semibold mt-1">🌐 Across 12 regions</p>
                </div>
              </div>

              {/* Live Activity Monitor Table */}
              <div className="bg-[#0c122c] border border-[#1a2444] rounded-2xl p-6">
                <div className="flex justify-between items-center mb-4">
                  <h4 className="text-sm font-extrabold text-white">Live Activity Monitor</h4>
                  <span className="text-[10px] text-gray-400 font-mono">Last updated: Just now</span>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="border-b border-[#17203d] text-gray-400 text-[10px] uppercase font-bold tracking-wider">
                        <th className="py-3 px-4">TIMESTAMP</th>
                        <th className="py-3 px-4">USER / EMAIL</th>
                        <th className="py-3 px-4">AUTH PROVIDER</th>
                        <th className="py-3 px-4">IP ADDRESS</th>
                        <th className="py-3 px-4">DEVICE / LOCATION</th>
                        <th className="py-3 px-4 text-right">STATUS</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#131b36]">
                      {securityLogs.map(log => (
                        <tr key={log.id} className="hover:bg-[#111938]/60 transition">
                          <td className="py-3.5 px-4 font-mono text-gray-400 text-[11px]">{log.timestamp}</td>
                          <td className="py-3.5 px-4 font-bold text-white">{log.email}</td>
                          <td className="py-3.5 px-4">
                            <span className="px-2 py-0.5 bg-[#121b3d] text-blue-300 border border-blue-700/50 rounded text-[10px] font-bold">
                              {log.authProvider}
                            </span>
                          </td>
                          <td className="py-3.5 px-4 font-mono text-gray-300">{log.ipAddress}</td>
                          <td className="py-3.5 px-4 text-gray-400 whitespace-pre-line text-[11px]">{log.deviceLocation}</td>
                          <td className="py-3.5 px-4 text-right">
                            <span className={`px-2.5 py-1 rounded text-[9px] font-extrabold ${
                              log.status === 'SUCCESSFUL'
                                ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                                : 'bg-rose-950 text-rose-400 border border-rose-800'
                            }`}>
                              {log.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* ========================================================= */}
          {/* TAB 6: SETTINGS                                           */}
          {/* ========================================================= */}
          {activeTab === 'settings' && (
            <div className="bg-[#0c122c] border border-[#1a2444] rounded-2xl p-6 max-w-2xl">
              <h3 className="text-base font-extrabold text-white mb-4">Platform Configuration</h3>
              <div className="space-y-4 text-xs">
                <div>
                  <label className="block text-gray-400 font-bold mb-1">Live Backend API Endpoint</label>
                  <input
                    type="text"
                    disabled
                    value="https://code-quest-z89h.onrender.com/api/v1"
                    className="w-full bg-[#080d21] border border-[#1a2444] rounded-lg p-2.5 text-gray-300 font-mono"
                  />
                </div>
                <div>
                  <label className="block text-gray-400 font-bold mb-1">Firebase Project ID</label>
                  <input
                    type="text"
                    disabled
                    value="code-quest-d32fd"
                    className="w-full bg-[#080d21] border border-[#1a2444] rounded-lg p-2.5 text-gray-300 font-mono"
                  />
                </div>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* ------------------------------------------------------------- */}
      {/* MODAL: EDIT PROBLEM STUDIO                                    */}
      {/* ------------------------------------------------------------- */}
      {showEditProblemModal && selectedQuestion && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#0b1026] border border-[#1f2c52] rounded-2xl max-w-4xl w-full max-h-[90vh] flex flex-col overflow-hidden shadow-2xl">
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-[#182342] flex justify-between items-center bg-[#0d1430]">
              <div className="flex items-center space-x-2">
                <span className="text-base">📝</span>
                <h3 className="font-extrabold text-sm text-white">Edit Problem: {selectedQuestion.title}</h3>
              </div>
              <button 
                onClick={() => setShowEditProblemModal(false)}
                className="text-gray-400 hover:text-white text-lg font-bold"
              >
                ✕
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-6 overflow-y-auto">
              {/* Left Config Column */}
              <div className="space-y-4">
                <div>
                  <label className="block text-[10px] font-extrabold text-gray-400 uppercase tracking-wider mb-1">PROBLEM ID</label>
                  <input
                    type="text"
                    disabled
                    value={selectedQuestion.id}
                    className="w-full bg-[#070b1b] border border-[#172242] rounded-lg p-2 text-xs font-mono text-gray-300"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-extrabold text-gray-400 uppercase tracking-wider mb-1">DIFFICULTY</label>
                  <select
                    value={selectedQuestion.difficulty}
                    onChange={e => setSelectedQuestion({ ...selectedQuestion, difficulty: e.target.value as any })}
                    className="w-full bg-[#070b1b] border border-[#172242] rounded-lg p-2 text-xs text-white"
                  >
                    <option value="Easy">Easy</option>
                    <option value="Medium">Medium</option>
                    <option value="Hard">Hard</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] font-extrabold text-gray-400 uppercase tracking-wider mb-1">TAGS</label>
                  <div className="flex flex-wrap gap-1 mb-2">
                    {selectedQuestion.tags.map(tag => (
                      <span key={tag} className="px-2 py-0.5 bg-[#141f42] text-blue-300 text-[10px] rounded font-bold">
                        {tag}
                      </span>
                    ))}
                  </div>
                  <input
                    type="text"
                    placeholder="Add Tag..."
                    className="w-full bg-[#070b1b] border border-[#172242] rounded-lg p-2 text-xs text-white placeholder-gray-500"
                  />
                </div>
              </div>

              {/* Right Editor Tabs Column */}
              <div className="md:col-span-2 space-y-3">
                <div className="flex space-x-2 border-b border-[#182342] pb-2">
                  {[
                    { id: 'desc', label: 'Description' },
                    { id: 'starter', label: 'Starter Code' },
                    { id: 'tests', label: 'Test Cases' }
                  ].map(tab => (
                    <button
                      key={tab.id}
                      onClick={() => setEditorTab(tab.id as any)}
                      className={`px-3 py-1 text-xs font-bold rounded-lg transition ${
                        editorTab === tab.id
                          ? 'bg-blue-600/20 text-blue-400 border border-blue-500/30'
                          : 'text-gray-400 hover:text-gray-200'
                      }`}
                    >
                      {tab.label}
                    </button>
                  ))}
                </div>

                {editorTab === 'desc' && (
                  <textarea
                    rows={8}
                    value={selectedQuestion.desc}
                    onChange={e => setSelectedQuestion({ ...selectedQuestion, desc: e.target.value })}
                    className="w-full bg-[#070b1b] border border-[#172242] rounded-xl p-3 text-xs font-mono text-gray-200 focus:outline-none focus:border-blue-500"
                  />
                )}

                {editorTab === 'starter' && (
                  <textarea
                    rows={8}
                    value={selectedQuestion.starterCode || ''}
                    onChange={e => setSelectedQuestion({ ...selectedQuestion, starterCode: e.target.value })}
                    className="w-full bg-[#070b1b] border border-[#172242] rounded-xl p-3 text-xs font-mono text-blue-300 focus:outline-none focus:border-blue-500"
                  />
                )}

                {editorTab === 'tests' && (
                  <textarea
                    rows={8}
                    value={selectedQuestion.testCases || ''}
                    onChange={e => setSelectedQuestion({ ...selectedQuestion, testCases: e.target.value })}
                    className="w-full bg-[#070b1b] border border-[#172242] rounded-xl p-3 text-xs font-mono text-emerald-300 focus:outline-none focus:border-blue-500"
                  />
                )}
              </div>
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-4 border-t border-[#182342] flex justify-end space-x-3 bg-[#0d1430]">
              <button
                onClick={() => setShowEditProblemModal(false)}
                className="px-4 py-2 bg-[#121b3a] hover:bg-[#18234a] text-xs font-bold text-gray-300 rounded-xl"
              >
                CANCEL
              </button>
              <button
                onClick={saveEditedProblem}
                className="px-5 py-2 bg-blue-600 hover:bg-blue-500 text-xs font-extrabold text-white rounded-xl shadow-lg shadow-blue-500/20"
              >
                SAVE & PUBLISH
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* MODAL: ADD PARENT TOPIC                                       */}
      {/* ------------------------------------------------------------- */}
      {showAddTopicModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#0b1026] border border-[#1f2c52] rounded-2xl max-w-md w-full overflow-hidden shadow-2xl">
            <div className="px-6 py-4 border-b border-[#182342] flex justify-between items-center bg-[#0d1430]">
              <h3 className="font-extrabold text-sm text-white">Create New Curriculum Topic</h3>
              <button onClick={() => setShowAddTopicModal(false)} className="text-gray-400 hover:text-white font-bold">✕</button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-[10px] font-extrabold text-gray-400 uppercase tracking-wider mb-1">TOPIC TITLE</label>
                <input
                  type="text"
                  placeholder="e.g. Graph Algorithms & Dynamic Trees"
                  value={newTopicTitle}
                  onChange={e => setNewTopicTitle(e.target.value)}
                  className="w-full bg-[#070b1b] border border-[#172242] rounded-lg p-2.5 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>
            <div className="px-6 py-4 border-t border-[#182342] flex justify-end space-x-3 bg-[#0d1430]">
              <button onClick={() => setShowAddTopicModal(false)} className="px-4 py-2 bg-[#121b3a] text-xs font-bold text-gray-300 rounded-xl">CANCEL</button>
              <button
                onClick={() => {
                  setShowAddTopicModal(false);
                  setNewTopicTitle('');
                }}
                className="px-5 py-2 bg-blue-600 hover:bg-blue-500 text-xs font-extrabold text-white rounded-xl shadow-lg shadow-blue-500/20"
              >
                CREATE TOPIC
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
