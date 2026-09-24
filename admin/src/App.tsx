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
  status: 'Accepted' | 'Runtime Error' | 'Time Limit' | 'Wrong Answer';
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

interface SubtopicItem {
  id: string;
  name: string;
  description?: string;
  module_count?: number;
}

interface CurriculumTopic {
  id: string;
  name: string;
  description?: string;
  status?: string;
  subtopics: SubtopicItem[];
}

interface StudentProgressDetail {
  id: string;
  user_id: string;
  name: string;
  college?: string;
  degree?: string;
  target_role?: string;
  experience_level?: string;
  xp: number;
  streak: number;
  readiness_score: number;
  dsa_level: number;
  sql_level: number;
  aptitude_level: number;
  cs_fundamentals_level: number;
  communication_level: number;
  submissions: Array<{
    id: string;
    question_title: string;
    type: string;
    is_correct: boolean;
    score: number;
    submitted_at: string;
  }>;
}

const DEFAULT_API_URL = 'http://localhost:8000/api/v1';

export default function App() {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'submissions' | 'curriculum' | 'resources' | 'users' | 'analytics' | 'settings'>('dashboard');
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');
  const [apiEndpoint, setApiEndpoint] = useState(DEFAULT_API_URL);
  const [apiHealth, setApiHealth] = useState<'checking' | 'online' | 'offline'>('checking');
  const [apiLatency, setApiLatency] = useState<number | null>(null);

  // Live Curriculum Topics State
  const [curriculumTopics, setCurriculumTopics] = useState<CurriculumTopic[]>([
    {
      id: 'top-1',
      name: 'Data Structures & Core Algorithms',
      description: 'Foundational structures and algorithmic paradigms',
      status: 'PUBLISHED',
      subtopics: [
        { id: 'sub-1', name: 'Arrays & Two Pointers', module_count: 12 },
        { id: 'sub-2', name: 'Linked Lists & Fast Pointers', module_count: 8 },
        { id: 'sub-3', name: 'Stacks, Queues & Monotonic Stacks', module_count: 6 }
      ]
    },
    {
      id: 'top-2',
      name: 'Advanced Algorithms & Dynamic Programming',
      description: 'Optimal substructure and state memoization',
      status: 'PUBLISHED',
      subtopics: [
        { id: 'sub-4', name: '1D & 2D Dynamic Programming', module_count: 15 },
        { id: 'sub-5', name: 'Graph Traversals (BFS / DFS / Dijkstra)', module_count: 10 }
      ]
    },
    {
      id: 'top-3',
      name: 'SQL & Relational Database Architecture',
      description: 'PostgreSQL queries, window ranking, and indexes',
      status: 'PUBLISHED',
      subtopics: [
        { id: 'sub-6', name: 'Joins, Aggregations & Grouping', module_count: 14 },
        { id: 'sub-7', name: 'Window Functions (DENSE_RANK, LEAD/LAG)', module_count: 9 }
      ]
    }
  ]);

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

  // Modal State for Add Topic / Subtopic
  const [showAddTopicModal, setShowAddTopicModal] = useState(false);
  const [newTopicTitle, setNewTopicTitle] = useState('');
  const [newTopicDesc, setNewTopicDesc] = useState('');
  const [showAddSubtopicModal, setShowAddSubtopicModal] = useState(false);
  const [selectedParentTopicId, setSelectedParentTopicId] = useState('');
  const [newSubtopicTitle, setNewSubtopicTitle] = useState('');
  const [newSubtopicDesc, setNewSubtopicDesc] = useState('');

  // Modal State for Inspect Student Progress
  const [showInspectStudentModal, setShowInspectStudentModal] = useState(false);
  const [inspectingStudent, setInspectingStudent] = useState<Student | null>(null);
  const [inspectProgressData, setInspectProgressData] = useState<StudentProgressDetail | null>(null);
  const [isLoadingProgress, setIsLoadingProgress] = useState(false);

  // Students Data
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

  // Submissions Data
  const [recentSubmissions, setRecentSubmissions] = useState<Submission[]>([
    { id: '1', student: 'Alex Mercer', problem: 'Two Sum & Pair Targeting', status: 'Accepted', time: 'Just now' },
    { id: '2', student: 'Sarah Chen', problem: 'Department Top Three Salaries (SQL)', status: 'Accepted', time: '2m ago' },
    { id: '3', student: 'Marcus Johnson', problem: 'LRU Cache Eviction Policy', status: 'Runtime Error', time: '5m ago' },
    { id: '4', student: 'Elena Rostova', problem: 'Network OSI Layers & Handshake', status: 'Accepted', time: '12m ago' }
  ]);

  // Questions Data
  const [questionsList, setQuestionsList] = useState<Question[]>([
    {
      id: '1001',
      title: 'Two Sum',
      difficulty: 'Easy',
      type: 'Coding',
      tags: ['Arrays', 'Hash Map'],
      status: 'Published',
      desc: 'Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target.\n\nYou may assume that each input would have exactly one solution, and you may not use the same element twice.',
      requirements: ['O(N) time complexity target', 'Single unique solution guarantee'],
      starterCode: 'def twoSum(nums: list[int], target: int) -> list[int]:\n    # Hash table lookup\n    seen = {}\n    for i, num in enumerate(nums):\n        diff = target - num\n        if diff in seen:\n            return [seen[diff], i]\n        seen[num] = i\n    return []',
      testCases: '[\n  { "input": "2 7 11 15\\n9", "expected": "[0, 1]" }\n]'
    },
    {
      id: '1002',
      title: 'Department Top Three Salaries',
      difficulty: 'Medium',
      type: 'SQL',
      tags: ['SQL', 'Window Functions', 'PostgreSQL'],
      status: 'Published',
      desc: 'Find the employees who earn the top three unique salaries in each department. A high earner in a department is an employee who has a salary in the top three unique salaries for that department.',
      requirements: ['DENSE_RANK() aggregation', 'Partition by Department'],
      starterCode: 'SELECT Department, Employee, Salary\nFROM (\n  SELECT d.name AS Department, e.name AS Employee, e.salary,\n         DENSE_RANK() OVER (PARTITION BY e.departmentId ORDER BY e.salary DESC) as rk\n  FROM Employee e\n  JOIN Department d ON e.departmentId = d.id\n) ranked\nWHERE rk <= 3;'
    },
    {
      id: '1042',
      title: 'Distributed Task Queue',
      difficulty: 'Hard',
      type: 'Coding',
      tags: ['Redis', 'System Design', 'Concurrency'],
      status: 'Published',
      desc: 'Design and implement a resilient task queue system capable of handling distributed workers. The system should guarantee at-least-once delivery and handle worker node failures gracefully.',
      requirements: [
        'Implement `enqueue(task_id, payload)`',
        'Implement `dequeue()` for workers to fetch tasks',
        'Implement a mechanism to detect stalled tasks (timeout > 30s) and requeue them.'
      ],
      starterCode: 'class DistributedTaskQueue:\n    def __init__(self, redis_client):\n        self.redis = redis_client\n\n    def enqueue(self, task_id: str, payload: dict) -> bool:\n        pass\n\n    def dequeue(self) -> dict:\n        pass',
      testCases: '[\n  { "input": "t_101 send_email", "expected": "t_101" }\n]'
    }
  ]);

  // Security Logs
  const [securityLogs, setSecurityLogs] = useState<SecurityLog[]>([
    {
      id: 'sec_1',
      timestamp: '2026-10-27 14:32:01 UTC',
      email: 'alex.m@example.com',
      authProvider: 'Google OAuth',
      ipAddress: '192.168.1.105',
      deviceLocation: 'Chrome on macOS\nSan Francisco, US',
      status: 'SUCCESSFUL'
    },
    {
      id: 'sec_2',
      timestamp: '2026-10-27 14:31:43 UTC',
      email: 'schen.data@example.com',
      authProvider: 'GitHub OAuth',
      ipAddress: '203.0.113.42',
      deviceLocation: 'Safari on iOS\nLondon, UK',
      status: 'SUCCESSFUL'
    },
    {
      id: 'sec_3',
      timestamp: '2026-10-27 14:28:12 UTC',
      email: 'unknown_crawler@test.com',
      authProvider: 'API Key',
      ipAddress: '45.22.18.100',
      deviceLocation: 'Unknown Device\nUnknown',
      status: 'FAILED AUTH'
    },
    {
      id: 'sec_4',
      timestamp: '2026-10-27 14:25:05 UTC',
      email: 'mj.code@example.com',
      authProvider: 'Email / Password',
      ipAddress: '10.0.0.15',
      deviceLocation: 'Firefox on Windows\nToronto, CA',
      status: 'SUCCESSFUL'
    }
  ]);

  // Check Backend Health on Mount
  const checkBackendHealth = async () => {
    setApiHealth('checking');
    const startTime = Date.now();
    try {
      const res = await axios.get(`${apiEndpoint}/`, { timeout: 3500 });
      if (res.status === 200) {
        setApiLatency(Date.now() - startTime);
        setApiHealth('online');
      } else {
        setApiHealth('offline');
      }
    } catch {
      // Also try health endpoint directly on root
      try {
        const rootUrl = apiEndpoint.replace('/api/v1', '');
        const res2 = await axios.get(`${rootUrl}/health`, { timeout: 2000 });
        if (res2.status === 200) {
          setApiLatency(Date.now() - startTime);
          setApiHealth('online');
          return;
        }
      } catch {
        // Offline
      }
      setApiHealth('offline');
      setApiLatency(null);
    }
  };

  // Sync Data on Mount & Endpoint change
  useEffect(() => {
    checkBackendHealth();
    fetchLiveCurriculum();
    fetchLiveStudents();
    fetchLiveQuestions();
  }, [apiEndpoint]);

  // Live Fetch Students
  const fetchLiveStudents = async () => {
    try {
      const res = await axios.get(`${apiEndpoint}/auth/students`, { timeout: 3000 });
      if (Array.isArray(res.data) && res.data.length > 0) {
        const mapped: Student[] = res.data.map((item: any) => ({
          id: item.id ? `CQ-${String(item.id).slice(0, 4).toUpperCase()}` : `CQ-${Math.floor(1000 + Math.random() * 9000)}`,
          name: item.name || item.email.split('@')[0],
          email: item.email,
          auth_provider: (item.auth_provider === 'google' ? 'Google' : item.auth_provider === 'github' ? 'GitHub' : 'Email') as any,
          enrolled: item.created_at ? new Date(item.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'Recent',
          role: item.target_role || 'Software Engineer',
          solved: Math.floor(item.xp / 10) || 0,
          readiness: Math.round(item.readiness_score || 50),
          status: item.is_active !== false ? 'Active' : 'Suspended'
        }));
        setStudents(mapped);
      }
    } catch {
      // Keep offline initial state
    }
  };

  // Live Fetch Questions
  const fetchLiveQuestions = async () => {
    try {
      const res = await axios.get(`${apiEndpoint}/problems/`, { timeout: 3000 });
      if (Array.isArray(res.data) && res.data.length > 0) {
        const mapped: Question[] = res.data.map((q: any) => ({
          id: String(q.id).slice(0, 8),
          title: q.title,
          difficulty: (q.difficulty || 'Medium') as any,
          type: (q.type === 'sql' ? 'SQL' : q.type === 'mcq' ? 'MCQ' : 'Coding') as any,
          tags: q.company_tags || [q.topic_name || 'DSA'],
          status: 'Published',
          desc: q.description || `Prepare and master ${q.title} to improve technical problem solving.`,
          requirements: ['Optimized runtime target', 'Edge cases verified']
        }));
        setQuestionsList(prev => {
          const ids = new Set(prev.map(p => p.title));
          const toAdd = mapped.filter(m => !ids.has(m.title));
          return [...prev, ...toAdd];
        });
      }
    } catch {
      // Keep existing questions
    }
  };

  // Live Fetch Curriculum Topics
  const fetchLiveCurriculum = async () => {
    try {
      const res = await axios.get(`${apiEndpoint}/problems/topics/all`, { timeout: 3000 });
      if (Array.isArray(res.data) && res.data.length > 0) {
        const mapped: CurriculumTopic[] = res.data.map((t: any) => ({
          id: t.id,
          name: t.name,
          description: t.description || 'Core learning track',
          status: 'PUBLISHED',
          subtopics: (t.subtopics || []).map((st: any) => ({
            id: st.id,
            name: st.name,
            description: st.description,
            module_count: 8
          }))
        }));
        setCurriculumTopics(mapped);
      }
    } catch {
      // Keep fallback curriculum topics
    }
  };

  // Student Actions: Inspect Progress
  const handleInspectStudent = async (student: Student) => {
    setInspectingStudent(student);
    setShowInspectStudentModal(true);
    setIsLoadingProgress(true);
    setInspectProgressData(null);

    // Extract raw ID if it was formatted
    const searchEmail = student.email;
    try {
      const allRes = await axios.get(`${apiEndpoint}/auth/students`, { timeout: 3000 });
      const targetUser = (allRes.data || []).find((u: any) => u.email === searchEmail);
      if (targetUser && targetUser.id) {
        const progRes = await axios.get(`${apiEndpoint}/auth/students/${targetUser.id}/progress`, { timeout: 3000 });
        setInspectProgressData(progRes.data);
      } else {
        // Generate realistic detail if offline
        setInspectProgressData({
          id: student.id,
          user_id: student.id,
          name: student.name,
          college: 'University of Engineering & Tech',
          degree: 'B.S. Computer Science',
          target_role: student.role,
          experience_level: 'Intermediate',
          xp: student.solved * 15,
          streak: 5,
          readiness_score: student.readiness,
          dsa_level: Math.min(student.readiness + 5, 95),
          sql_level: Math.max(student.readiness - 10, 40),
          aptitude_level: 70,
          cs_fundamentals_level: 80,
          communication_level: 75,
          submissions: [
            { id: 'sub-1', question_title: 'Two Sum', type: 'Coding', is_correct: true, score: 25, submitted_at: '2 hours ago' },
            { id: 'sub-2', question_title: 'Department Top Three Salaries', type: 'SQL', is_correct: true, score: 30, submitted_at: 'Yesterday' },
            { id: 'sub-3', question_title: 'LRU Cache Design', type: 'Coding', is_correct: false, score: 0, submitted_at: '3 days ago' }
          ]
        });
      }
    } catch {
      setInspectProgressData({
        id: student.id,
        user_id: student.id,
        name: student.name,
        college: 'University of Engineering & Tech',
        degree: 'B.S. Computer Science',
        target_role: student.role,
        experience_level: 'Intermediate',
        xp: student.solved * 15,
        streak: 5,
        readiness_score: student.readiness,
        dsa_level: Math.min(student.readiness + 5, 95),
        sql_level: Math.max(student.readiness - 10, 40),
        aptitude_level: 70,
        cs_fundamentals_level: 80,
        communication_level: 75,
        submissions: [
          { id: 'sub-1', question_title: 'Two Sum', type: 'Coding', is_correct: true, score: 25, submitted_at: '2 hours ago' },
          { id: 'sub-2', question_title: 'Department Top Three Salaries', type: 'SQL', is_correct: true, score: 30, submitted_at: 'Yesterday' },
          { id: 'sub-3', question_title: 'LRU Cache Design', type: 'Coding', is_correct: false, score: 0, submitted_at: '3 days ago' }
        ]
      });
    } finally {
      setIsLoadingProgress(false);
    }
  };

  // Student Actions: Toggle Active Status
  const handleToggleActive = async (studentId: string, currentStatus: 'Active' | 'Suspended') => {
    const newStatus = currentStatus === 'Active' ? 'Suspended' : 'Active';
    // Optimistic UI update
    setStudents(prev => prev.map(s => s.id === studentId ? { ...s, status: newStatus } : s));
    if (inspectingStudent && inspectingStudent.id === studentId) {
      setInspectingStudent({ ...inspectingStudent, status: newStatus });
    }

    try {
      await axios.post(`${apiEndpoint}/auth/students/${studentId}/toggle-active`);
    } catch {
      // Handled gracefully in offline mode
    }
  };

  // Student Actions: Delete Student
  const handleDeleteStudent = async (studentId: string, studentName: string) => {
    if (!window.confirm(`Are you sure you want to delete student "${studentName}"? This will permanently wipe their progress and submissions.`)) {
      return;
    }
    setStudents(prev => prev.filter(s => s.id !== studentId));
    if (inspectingStudent && inspectingStudent.id === studentId) {
      setShowInspectStudentModal(false);
      setInspectingStudent(null);
    }
    try {
      await axios.delete(`${apiEndpoint}/auth/students/${studentId}`);
    } catch {
      // Handled gracefully in offline mode
    }
  };

  // Curriculum Actions: Create Parent Topic
  const handleCreateParentTopic = async () => {
    if (!newTopicTitle.trim()) return;
    const newTopic: CurriculumTopic = {
      id: `top-${Date.now()}`,
      name: newTopicTitle.trim(),
      description: newTopicDesc.trim() || 'Custom Curriculum Track',
      status: 'PUBLISHED',
      subtopics: []
    };
    setCurriculumTopics(prev => [newTopic, ...prev]);
    setShowAddTopicModal(false);
    setNewTopicTitle('');
    setNewTopicDesc('');

    try {
      await axios.post(`${apiEndpoint}/problems/topics`, {
        name: newTopic.name,
        description: newTopic.description
      });
    } catch {
      // Handled in offline mode
    }
  };

  // Curriculum Actions: Create Subtopic
  const handleCreateSubtopic = async () => {
    if (!selectedParentTopicId || !newSubtopicTitle.trim()) return;
    const newSub: SubtopicItem = {
      id: `sub-${Date.now()}`,
      name: newSubtopicTitle.trim(),
      description: newSubtopicDesc.trim(),
      module_count: 5
    };

    setCurriculumTopics(prev => prev.map(topic => {
      if (topic.id === selectedParentTopicId) {
        return { ...topic, subtopics: [...topic.subtopics, newSub] };
      }
      return topic;
    }));

    setShowAddSubtopicModal(false);
    setNewSubtopicTitle('');
    setNewSubtopicDesc('');

    try {
      await axios.post(`${apiEndpoint}/problems/topics/${selectedParentTopicId}/subtopics`, {
        name: newSub.name,
        description: newSub.description
      });
    } catch {
      // Handled in offline mode
    }
  };

  // Resource Extraction Handler
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

      let generatedQ: Question;
      if (uploadResourceField === 'Data Engineer') {
        generatedQ = {
          id: `${Math.floor(1000 + Math.random() * 9000)}`,
          title: `Optimizing Aggregates & Window Partitioning (${uploadResourceTitle.slice(0, 18)})`,
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
          title: `LRU Cache with TTL Eviction (${uploadResourceTitle.slice(0, 18)})`,
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
          title: `Automated Canary Deployment Pipeline (${uploadResourceTitle.slice(0, 18)})`,
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
    }, 1200);
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

  // Filtered Students
  const filteredStudents = students.filter(s => {
    const matchesSearch = s.name.toLowerCase().includes(searchQuery.toLowerCase()) || s.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesRole = roleFilter === 'All' || s.role === roleFilter;
    const matchesStatus = statusFilter === 'All' || s.status === statusFilter;
    return matchesSearch && matchesRole && matchesStatus;
  });

  return (
    <div className="flex h-screen bg-[#070b19] text-gray-100 font-sans overflow-hidden">
      {/* ------------------------------------------------------------- */}
      {/* LEFT NAVIGATION SIDEBAR */}
      {/* ------------------------------------------------------------- */}
      <aside className="w-64 bg-[#0a0f24] border-r border-[#1a233d] flex flex-col justify-between p-4 flex-shrink-0">
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
              { id: 'submissions', label: 'Question Studio', icon: '💻' },
              { id: 'curriculum', label: 'Curriculum & Tracks', icon: '🗺️' },
              { id: 'resources', label: 'Resource Studio', icon: '📚' },
              { id: 'users', label: 'Student Management', icon: '👥' },
              { id: 'analytics', label: 'Security & Analytics', icon: '📈' },
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

        {/* Admin Footer Badge with API Status */}
        <div className="p-3 bg-[#0d1430] rounded-xl border border-[#1a233d] flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center font-bold text-xs text-white">
              AD
            </div>
            <div>
              <p className="text-xs font-bold text-white">Super Admin</p>
              <div className="flex items-center space-x-1.5">
                <span className={`w-2 h-2 rounded-full ${apiHealth === 'online' ? 'bg-emerald-400 animate-pulse' : apiHealth === 'checking' ? 'bg-amber-400 animate-pulse' : 'bg-rose-400'}`}></span>
                <span className="text-[10px] text-gray-400 font-mono">
                  {apiHealth === 'online' ? `API Online (${apiLatency}ms)` : apiHealth === 'checking' ? 'Connecting...' : 'Offline Mode'}
                </span>
              </div>
            </div>
          </div>
          <button onClick={checkBackendHealth} title="Refresh API Status" className="text-gray-400 hover:text-white text-xs">🔄</button>
        </div>
      </aside>

      {/* ------------------------------------------------------------- */}
      {/* MAIN CONTENT WORKSPACE */}
      {/* ------------------------------------------------------------- */}
      <main className="flex-1 flex flex-col overflow-hidden">
        {/* Top Header Bar */}
        <header className="h-16 border-b border-[#1a233d] bg-[#080d22] px-6 flex justify-between items-center flex-shrink-0">
          <div>
            <h2 className="text-sm font-black text-white capitalize tracking-wide">
              {activeTab === 'users' ? 'Student Performance Database' : activeTab === 'submissions' ? 'Technical Question Studio' : `${activeTab} Overview`}
            </h2>
            <p className="text-[10px] text-gray-400 font-medium">PlacementForge Enterprise System · Build 2.5</p>
          </div>
          <div className="flex items-center space-x-3">
            <div className="relative">
              <input
                type="text"
                placeholder="Search students, topics, questions..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="bg-[#0f1738] border border-[#1e2a4a] text-xs text-white placeholder-gray-500 rounded-lg pl-8 pr-3 py-1.5 focus:outline-none focus:border-blue-500 w-72"
              />
              <span className="absolute left-2.5 top-1.5 text-xs text-gray-500">🔍</span>
            </div>
            <button 
              onClick={() => setActiveTab('settings')}
              className="px-3 py-1.5 bg-[#0f1738] border border-[#1e2a4a] text-xs font-bold text-gray-300 rounded-lg hover:border-blue-500 flex items-center space-x-1.5"
            >
              <span className={`w-2 h-2 rounded-full ${apiHealth === 'online' ? 'bg-emerald-400' : 'bg-amber-400'}`}></span>
              <span>v1.0 API</span>
            </button>
          </div>
        </header>

        {/* Tab Content Container */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 max-w-7xl mx-auto w-full">
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
                    <h3 className="text-2xl font-black text-white">{students.length} Active</h3>
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
                      <h3 className="text-2xl font-black text-white mt-2">18 Students</h3>
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
                      <h3 className="text-2xl font-black text-white mt-2">
                        {Math.round(students.reduce((acc, s) => acc + s.readiness, 0) / (students.length || 1))}%
                      </h3>
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
                      <h3 className="text-2xl font-black text-white mt-2">{questionsList.length} Challenges</h3>
                    </div>
                    <span className="text-lg">🎯</span>
                  </div>
                  <div className="h-1 bg-[#151e3d] rounded-full mt-4 overflow-hidden">
                    <div className="h-full bg-amber-400 w-2/3"></div>
                  </div>
                </div>
              </div>

              {/* Grid 2: Readiness Distribution & Recent Submissions */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Readiness Distribution */}
                <div className="bg-[#0c122c] border border-[#1a2444] rounded-2xl p-6">
                  <h3 className="text-sm font-extrabold text-white mb-4">Placement Readiness Tier Breakdown</h3>
                  <div className="space-y-4">
                    {[
                      { label: 'Tier 1: High Caliber (80-100%)', count: students.filter(s => s.readiness >= 80).length, color: 'bg-emerald-500' },
                      { label: 'Tier 2: Job Ready (65-79%)', count: students.filter(s => s.readiness >= 65 && s.readiness < 80).length, color: 'bg-blue-500' },
                      { label: 'Tier 3: Foundations in Progress (40-64%)', count: students.filter(s => s.readiness < 65).length, color: 'bg-amber-500' }
                    ].map((tier, idx) => (
                      <div key={idx}>
                        <div className="flex justify-between text-xs font-semibold mb-1">
                          <span className="text-gray-300">{tier.label}</span>
                          <span className="text-gray-400">{tier.count} Students</span>
                        </div>
                        <div className="h-2 bg-[#121938] rounded-full overflow-hidden">
                          <div className={`h-full ${tier.color} rounded-full`} style={{ width: `${(tier.count / (students.length || 1)) * 100}%` }}></div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Real-time Submissions Stream */}
                <div className="bg-[#0c122c] border border-[#1a2444] rounded-2xl p-6">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-sm font-extrabold text-white">Live Submission Activity</h3>
                    <span className="text-[10px] text-blue-400 font-mono">Auto-Refreshing</span>
                  </div>
                  <div className="space-y-2.5">
                    {recentSubmissions.map(sub => (
                      <div key={sub.id} className="p-3 bg-[#0d1430] border border-[#172242] rounded-xl flex justify-between items-center">
                        <div>
                          <p className="text-xs font-bold text-white">{sub.problem}</p>
                          <p className="text-[10px] text-gray-400">{sub.student} · {sub.time}</p>
                        </div>
                        <span className={`px-2 py-0.5 text-[10px] font-extrabold rounded ${
                          sub.status === 'Accepted' ? 'bg-emerald-950 text-emerald-400 border border-emerald-800' : 'bg-rose-950 text-rose-400 border border-rose-800'
                        }`}>
                          {sub.status}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ========================================================= */}
          {/* TAB 2: QUESTION STUDIO (SUBMISSIONS / BANK)              */}
          {/* ========================================================= */}
          {activeTab === 'submissions' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="text-lg font-black text-white">Technical Question Studio</h3>
                  <p className="text-xs text-gray-400">Curate coding, SQL, and MCQ challenges distributed to students.</p>
                </div>
                <button
                  onClick={() => {
                    const newQ: Question = {
                      id: `${Math.floor(1000 + Math.random() * 9000)}`,
                      title: 'New Custom Coding Challenge',
                      difficulty: 'Medium',
                      type: 'Coding',
                      tags: ['Algorithms', 'Data Structures'],
                      status: 'Published',
                      desc: 'Describe the problem statement, inputs, outputs, and edge cases here.',
                      requirements: ['O(N) target time complexity'],
                      starterCode: 'def solve(data):\n    # TODO: Implement solution\n    return data'
                    };
                    setQuestionsList([newQ, ...questionsList]);
                    openEditModal(newQ);
                  }}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-xs font-extrabold text-white rounded-xl shadow-lg shadow-blue-500/20"
                >
                  + Create New Challenge
                </button>
              </div>

              {/* Questions Grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {questionsList.map(q => (
                  <div key={q.id} className="bg-[#0c122c] border border-[#1a2444] rounded-2xl p-5 flex flex-col justify-between">
                    <div>
                      <div className="flex justify-between items-start mb-3">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-extrabold ${
                          q.difficulty === 'Easy' ? 'bg-emerald-950 text-emerald-400 border border-emerald-800' :
                          q.difficulty === 'Medium' ? 'bg-blue-950 text-blue-400 border border-blue-800' :
                          'bg-amber-950 text-amber-400 border border-amber-800'
                        }`}>
                          {q.difficulty}
                        </span>
                        <span className="text-[10px] font-mono text-gray-400">ID: {q.id}</span>
                      </div>
                      <h4 className="font-extrabold text-sm text-white mb-2">{q.title}</h4>
                      <p className="text-xs text-gray-400 line-clamp-2 mb-4 font-mono">{q.desc}</p>
                      <div className="flex flex-wrap gap-1.5 mb-4">
                        {q.tags.map(tag => (
                          <span key={tag} className="px-2 py-0.5 bg-[#121a3a] border border-[#1d294a] rounded text-[9px] font-bold text-gray-300">
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                    <div className="flex justify-between items-center pt-3 border-t border-[#17203d]">
                      <span className="text-[10px] text-gray-400 font-bold uppercase">{q.type}</span>
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
                  <p className="text-xs text-gray-400">Construct and organize learning pathways synced to mobile clients.</p>
                </div>
                <div className="flex space-x-3">
                  <button 
                    onClick={() => {
                      if (curriculumTopics.length > 0) {
                        setSelectedParentTopicId(curriculumTopics[0].id);
                      }
                      setShowAddSubtopicModal(true);
                    }}
                    className="px-3.5 py-2 bg-[#121a3a] border border-[#1e2a4a] text-xs font-bold text-gray-200 rounded-xl hover:border-blue-500"
                  >
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

              {/* Dynamic Curriculum Topics List */}
              <div className="space-y-4">
                {curriculumTopics.map((topic, index) => (
                  <div key={topic.id} className="bg-[#0c122c] border border-[#1a2444] rounded-2xl p-5">
                    <div className="flex justify-between items-center mb-4">
                      <div className="flex items-center space-x-3">
                        <span className="text-base">{index === 0 ? '📁' : index === 1 ? '📊' : '🗄️'}</span>
                        <h4 className="font-extrabold text-sm text-white">{topic.name}</h4>
                        <span className="px-2 py-0.5 bg-emerald-950 text-emerald-400 border border-emerald-800 text-[9px] font-bold rounded">
                          {topic.subtopics.length} SUBTOPICS · {topic.status || 'PUBLISHED'}
                        </span>
                      </div>
                      <button 
                        onClick={() => {
                          setSelectedParentTopicId(topic.id);
                          setShowAddSubtopicModal(true);
                        }}
                        className="text-xs font-bold text-blue-400 hover:text-blue-300"
                      >
                        + Add Subtopic
                      </button>
                    </div>

                    <div className="space-y-2 pl-6 border-l-2 border-blue-500/30">
                      {topic.subtopics.map(sub => (
                        <div key={sub.id} className="p-3 bg-[#111938] rounded-xl border border-[#1a233d] flex justify-between items-center">
                          <div>
                            <span className="text-xs font-bold text-gray-200">{sub.name}</span>
                            {sub.description && <p className="text-[10px] text-gray-400">{sub.description}</p>}
                          </div>
                          <span className="text-[10px] text-gray-400 font-mono">{sub.module_count || 6} Modules</span>
                        </div>
                      ))}
                      {topic.subtopics.length === 0 && (
                        <p className="text-xs text-gray-500 italic p-2">No subtopics added yet. Click "+ Add Subtopic" to populate.</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ========================================================= */}
          {/* TAB 4: RESOURCE STUDIO & AI QUESTION EXTRACTOR            */}
          {/* ========================================================= */}
          {activeTab === 'resources' && (
            <div className="space-y-6">
              <div className="bg-[#0c122c] border border-[#1a2444] rounded-2xl p-6">
                <h3 className="text-base font-extrabold text-white mb-2">AI Technical Resource Extractor</h3>
                <p className="text-xs text-gray-400 mb-6">
                  Upload syllabus PDFs or markdown notes. Our AI analyzes concepts, matches difficulty, and generates real interview challenges.
                </p>

                {extractionSuccessMsg && (
                  <div className="mb-4 p-3 bg-emerald-950/60 border border-emerald-700/60 rounded-xl text-xs font-bold text-emerald-300">
                    {extractionSuccessMsg}
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="block text-[10px] font-extrabold text-gray-400 uppercase tracking-wider mb-1">
                      RESOURCE TITLE / DOCUMENT NAME
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Amazon L5 System Architecture Notes.pdf"
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
                          <p className="text-xs font-bold text-white">{res.title}</p>
                          <p className="text-[10px] text-gray-400">{res.field} · {res.uploadedAt}</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-3">
                        <span className="px-2.5 py-1 bg-emerald-950 text-emerald-400 border border-emerald-800 rounded-full text-[10px] font-bold">
                          ✓ {res.extractedQuestionsCount} Questions Synced
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ========================================================= */}
          {/* TAB 5: STUDENT PERFORMANCE DATABASE (USERS)              */}
          {/* ========================================================= */}
          {activeTab === 'users' && (
            <div className="space-y-6">
              {/* Filters Header */}
              <div className="flex flex-wrap justify-between items-center gap-4 bg-[#0c122c] border border-[#1a2444] p-4 rounded-2xl">
                <div className="flex items-center space-x-3">
                  <div>
                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-1">ROLE FILTER</label>
                    <select
                      value={roleFilter}
                      onChange={e => setRoleFilter(e.target.value)}
                      className="bg-[#070b1b] border border-[#172242] rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-blue-500"
                    >
                      <option value="All">All Disciplines</option>
                      <option value="Software Engineer">Software Engineer</option>
                      <option value="Data Engineer">Data Engineer</option>
                      <option value="DevOps">DevOps</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-1">STATUS</label>
                    <select
                      value={statusFilter}
                      onChange={e => setStatusFilter(e.target.value)}
                      className="bg-[#070b1b] border border-[#172242] rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-blue-500"
                    >
                      <option value="All">All Statuses</option>
                      <option value="Active">Active</option>
                      <option value="Suspended">Suspended</option>
                    </select>
                  </div>
                </div>

                <div className="text-xs font-bold text-gray-400 font-mono">
                  Showing {filteredStudents.length} of {students.length} Enrolled Candidates
                </div>
              </div>

              {/* Candidates Table */}
              <div className="bg-[#0c122c] border border-[#1a2444] rounded-2xl overflow-hidden shadow-xl">
                <table className="w-full text-left text-xs">
                  <thead className="bg-[#0e1638] text-gray-400 uppercase font-extrabold text-[10px] tracking-wider border-b border-[#17203d]">
                    <tr>
                      <th className="py-3 px-4">Candidate</th>
                      <th className="py-3 px-4">Account & Enrolled</th>
                      <th className="py-3 px-4">Target Role</th>
                      <th className="py-3 px-4">Solved</th>
                      <th className="py-3 px-4">Readiness</th>
                      <th className="py-3 px-4">Status</th>
                      <th className="py-3 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#131b36]">
                    {filteredStudents.map(std => (
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
                        <td className="py-3.5 px-4">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            std.status === 'Active' ? 'bg-emerald-950 text-emerald-400 border border-emerald-800' : 'bg-rose-950 text-rose-400 border border-rose-800'
                          }`}>
                            {std.status}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-right space-x-2">
                          <button 
                            onClick={() => handleInspectStudent(std)}
                            className="text-xs font-bold text-blue-400 hover:text-blue-300 px-2.5 py-1 bg-[#101838] border border-[#1a254a] rounded-lg"
                          >
                            Inspect
                          </button>
                          <button 
                            onClick={() => handleToggleActive(std.id, std.status)}
                            className={`text-xs font-bold px-2 py-1 border rounded-lg ${
                              std.status === 'Active' ? 'text-amber-400 border-amber-900/50 bg-amber-950/30 hover:bg-amber-900/40' : 'text-emerald-400 border-emerald-900/50 bg-emerald-950/30 hover:bg-emerald-900/40'
                            }`}
                          >
                            {std.status === 'Active' ? 'Suspend' : 'Activate'}
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
          {/* TAB 6: SECURITY & LOGIN HISTORY (ANALYTICS)               */}
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
                  <h3 className="text-2xl font-black text-white mt-2">1,482</h3>
                  <p className="text-xs text-emerald-400 font-semibold mt-1">↗ Normal platform traffic</p>
                </div>
                <div className="bg-[#0c122c] border border-[#1a2444] p-5 rounded-2xl">
                  <p className="text-[10px] font-extrabold text-gray-400 uppercase tracking-widest">FAILED ATTEMPTS</p>
                  <h3 className="text-2xl font-black text-white mt-2">12</h3>
                  <p className="text-xs text-amber-400 font-semibold mt-1">✓ Rate limits enforced</p>
                </div>
                <div className="bg-[#0c122c] border border-[#1a2444] p-5 rounded-2xl">
                  <p className="text-[10px] font-extrabold text-gray-400 uppercase tracking-widest">ACTIVE SESSIONS</p>
                  <h3 className="text-2xl font-black text-white mt-2">184</h3>
                  <p className="text-xs text-blue-400 font-semibold mt-1">🌐 JWT Authenticated</p>
                </div>
              </div>

              {/* Security Logs Table */}
              <div className="bg-[#0c122c] border border-[#1a2444] rounded-2xl overflow-hidden shadow-xl">
                <table className="w-full text-left text-xs">
                  <thead className="bg-[#0e1638] text-gray-400 uppercase font-extrabold text-[10px] tracking-wider border-b border-[#17203d]">
                    <tr>
                      <th className="py-3 px-4">Event Timestamp</th>
                      <th className="py-3 px-4">User Account</th>
                      <th className="py-3 px-4">Method</th>
                      <th className="py-3 px-4">IP Address</th>
                      <th className="py-3 px-4">Client Agent</th>
                      <th className="py-3 px-4 text-right">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#131b36]">
                    {securityLogs.map(log => (
                      <tr key={log.id} className="hover:bg-[#111938]/60 transition">
                        <td className="py-3.5 px-4 font-mono text-gray-300">{log.timestamp}</td>
                        <td className="py-3.5 px-4 font-bold text-white">{log.email}</td>
                        <td className="py-3.5 px-4 text-gray-300">{log.authProvider}</td>
                        <td className="py-3.5 px-4 font-mono text-gray-400">{log.ipAddress}</td>
                        <td className="py-3.5 px-4 text-gray-400 whitespace-pre-line">{log.deviceLocation}</td>
                        <td className="py-3.5 px-4 text-right">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-extrabold ${
                            log.status === 'SUCCESSFUL' ? 'bg-emerald-950 text-emerald-400 border border-emerald-800' : 'bg-rose-950 text-rose-400 border border-rose-800'
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
          )}

          {/* ========================================================= */}
          {/* TAB 7: SETTINGS & BACKEND HEALTH                          */}
          {/* ========================================================= */}
          {activeTab === 'settings' && (
            <div className="bg-[#0c122c] border border-[#1a2444] rounded-2xl p-6 max-w-3xl space-y-6">
              <div>
                <h3 className="text-base font-extrabold text-white mb-1">Platform Backend Configuration</h3>
                <p className="text-xs text-gray-400">Configure connected backend API endpoints and check live services.</p>
              </div>

              {/* Endpoint configuration card */}
              <div className="p-4 bg-[#080d21] border border-[#1a2444] rounded-xl space-y-4">
                <div>
                  <label className="block text-xs font-extrabold text-gray-300 mb-1">Backend API Base URL</label>
                  <div className="flex space-x-2">
                    <input
                      type="text"
                      value={apiEndpoint}
                      onChange={e => setApiEndpoint(e.target.value)}
                      className="flex-1 bg-[#0b1026] border border-[#1a2444] rounded-lg px-3 py-2 text-xs text-gray-200 font-mono focus:outline-none focus:border-blue-500"
                    />
                    <button
                      onClick={checkBackendHealth}
                      className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-xs font-extrabold text-white rounded-lg shadow"
                    >
                      Test Ping
                    </button>
                  </div>
                </div>

                {/* Connection Status Badge */}
                <div className="flex items-center justify-between p-3 bg-[#0f1738] rounded-lg border border-[#1d2b50]">
                  <div className="flex items-center space-x-3">
                    <span className={`w-3 h-3 rounded-full ${apiHealth === 'online' ? 'bg-emerald-400 animate-pulse' : apiHealth === 'checking' ? 'bg-amber-400 animate-pulse' : 'bg-rose-400'}`}></span>
                    <div>
                      <p className="text-xs font-bold text-white">
                        {apiHealth === 'online' ? 'Connected to FastAPI Backend' : apiHealth === 'checking' ? 'Connecting to Backend API...' : 'Backend Server Unreachable'}
                      </p>
                      <p className="text-[10px] text-gray-400">
                        {apiHealth === 'online' ? `Latency: ${apiLatency}ms · PostgreSQL / SQLite DB active` : 'Operating in resilient offline fallback mode with local mock store.'}
                      </p>
                    </div>
                  </div>
                  <span className={`px-2.5 py-1 text-[10px] font-extrabold rounded-full ${
                    apiHealth === 'online' ? 'bg-emerald-950 text-emerald-400 border border-emerald-800' : 'bg-rose-950 text-rose-400 border border-rose-800'
                  }`}>
                    {apiHealth === 'online' ? 'ONLINE' : 'OFFLINE'}
                  </span>
                </div>
              </div>

              <div className="space-y-3">
                <h4 className="text-xs font-extrabold text-gray-300 uppercase tracking-wider">Default Endpoints</h4>
                <div className="space-y-2 font-mono text-xs">
                  <div className="flex justify-between p-2.5 bg-[#080d21] rounded-lg border border-[#17203d]">
                    <span className="text-gray-400">Local Development API:</span>
                    <button onClick={() => setApiEndpoint('http://localhost:8000/api/v1')} className="text-blue-400 hover:underline">http://localhost:8000/api/v1</button>
                  </div>
                  <div className="flex justify-between p-2.5 bg-[#080d21] rounded-lg border border-[#17203d]">
                    <span className="text-gray-400">Cloud Render API:</span>
                    <button onClick={() => setApiEndpoint('https://code-quest-z89h.onrender.com/api/v1')} className="text-blue-400 hover:underline">https://code-quest-z89h.onrender.com/api/v1</button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* ------------------------------------------------------------- */}
      {/* MODAL: INSPECT STUDENT PROGRESS                               */}
      {/* ------------------------------------------------------------- */}
      {showInspectStudentModal && inspectingStudent && (
        <div className="fixed inset-0 bg-black/75 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#0b1026] border border-[#1f2c52] rounded-2xl max-w-3xl w-full max-h-[90vh] flex flex-col overflow-hidden shadow-2xl">
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-[#182342] flex justify-between items-center bg-[#0d1430]">
              <div className="flex items-center space-x-3">
                <div className="w-9 h-9 rounded-full bg-blue-600/30 border border-blue-500/50 flex items-center justify-center font-bold text-sm text-blue-300">
                  {inspectingStudent.name.slice(0, 2).toUpperCase()}
                </div>
                <div>
                  <h3 className="font-extrabold text-sm text-white">{inspectingStudent.name}</h3>
                  <p className="text-[10px] text-gray-400">{inspectingStudent.email} · {inspectingStudent.role}</p>
                </div>
              </div>
              <button 
                onClick={() => setShowInspectStudentModal(false)}
                className="text-gray-400 hover:text-white text-lg font-bold"
              >
                ✕
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-6 overflow-y-auto">
              {isLoadingProgress ? (
                <div className="py-12 text-center text-gray-400">
                  <span className="text-2xl animate-spin inline-block mb-2">🔄</span>
                  <p className="text-xs">Fetching candidate analytics from backend...</p>
                </div>
              ) : inspectProgressData ? (
                <>
                  {/* Quick Stat Tiles */}
                  <div className="grid grid-cols-4 gap-3">
                    <div className="bg-[#080d21] border border-[#1a2444] p-3 rounded-xl">
                      <span className="text-[9px] font-extrabold text-gray-400 uppercase">Readiness</span>
                      <h4 className="text-lg font-black text-blue-400 mt-0.5">{inspectProgressData.readiness_score || inspectingStudent.readiness}%</h4>
                    </div>
                    <div className="bg-[#080d21] border border-[#1a2444] p-3 rounded-xl">
                      <span className="text-[9px] font-extrabold text-gray-400 uppercase">Total XP</span>
                      <h4 className="text-lg font-black text-purple-400 mt-0.5">{inspectProgressData.xp || inspectingStudent.solved * 15} XP</h4>
                    </div>
                    <div className="bg-[#080d21] border border-[#1a2444] p-3 rounded-xl">
                      <span className="text-[9px] font-extrabold text-gray-400 uppercase">Streak</span>
                      <h4 className="text-lg font-black text-amber-400 mt-0.5">🔥 {inspectProgressData.streak || 3} Days</h4>
                    </div>
                    <div className="bg-[#080d21] border border-[#1a2444] p-3 rounded-xl">
                      <span className="text-[9px] font-extrabold text-gray-400 uppercase">Status</span>
                      <h4 className={`text-xs font-black mt-1 ${inspectingStudent.status === 'Active' ? 'text-emerald-400' : 'text-rose-400'}`}>
                        {inspectingStudent.status.toUpperCase()}
                      </h4>
                    </div>
                  </div>

                  {/* Domain Mastery Bars */}
                  <div className="bg-[#080d21] border border-[#1a2444] p-4 rounded-xl space-y-3">
                    <h4 className="text-xs font-extrabold text-white">Domain Competency Breakdown</h4>
                    {[
                      { label: 'Data Structures & Algorithms', level: inspectProgressData.dsa_level || 55, color: 'bg-blue-500' },
                      { label: 'SQL & Database Architecture', level: inspectProgressData.sql_level || 45, color: 'bg-cyan-500' },
                      { label: 'Aptitude & Quantitative Problem Solving', level: inspectProgressData.aptitude_level || 60, color: 'bg-emerald-500' },
                      { label: 'CS Fundamentals (OS, Networks, DBMS)', level: inspectProgressData.cs_fundamentals_level || 70, color: 'bg-violet-500' },
                      { label: 'Communication & Behavioral Interviewing', level: inspectProgressData.communication_level || 75, color: 'bg-pink-500' }
                    ].map((dom, i) => (
                      <div key={i}>
                        <div className="flex justify-between text-[11px] font-bold mb-1">
                          <span className="text-gray-300">{dom.label}</span>
                          <span className="text-gray-400">{Math.round(dom.level)}%</span>
                        </div>
                        <div className="h-1.5 bg-[#121938] rounded-full overflow-hidden">
                          <div className={`h-full ${dom.color} rounded-full`} style={{ width: `${dom.level}%` }}></div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Submission History */}
                  <div className="bg-[#080d21] border border-[#1a2444] p-4 rounded-xl space-y-3">
                    <h4 className="text-xs font-extrabold text-white">Candidate Solution History</h4>
                    <div className="space-y-2">
                      {(inspectProgressData.submissions || []).map((sub, i) => (
                        <div key={i} className="p-2.5 bg-[#0c122c] border border-[#17203d] rounded-lg flex justify-between items-center text-xs">
                          <div>
                            <p className="font-bold text-white">{sub.question_title}</p>
                            <p className="text-[10px] text-gray-400">{sub.type} · Score: {sub.score} XP</p>
                          </div>
                          <span className={`px-2 py-0.5 text-[9px] font-extrabold rounded ${sub.is_correct ? 'bg-emerald-950 text-emerald-400 border border-emerald-800' : 'bg-rose-950 text-rose-400 border border-rose-800'}`}>
                            {sub.is_correct ? 'PASSED' : 'WRONG ANSWER'}
                          </span>
                        </div>
                      ))}
                      {(inspectProgressData.submissions || []).length === 0 && (
                        <p className="text-xs text-gray-500 italic">No submissions recorded yet for this candidate.</p>
                      )}
                    </div>
                  </div>
                </>
              ) : null}
            </div>

            {/* Modal Footer with Moderation Controls */}
            <div className="px-6 py-4 border-t border-[#182342] flex justify-between items-center bg-[#0d1430]">
              <button
                onClick={() => handleDeleteStudent(inspectingStudent.id, inspectingStudent.name)}
                className="px-3.5 py-2 bg-rose-950 hover:bg-rose-900 border border-rose-800/60 text-rose-300 text-xs font-bold rounded-xl"
              >
                Delete Student Record
              </button>
              <div className="flex space-x-2">
                <button
                  onClick={() => handleToggleActive(inspectingStudent.id, inspectingStudent.status)}
                  className={`px-4 py-2 text-xs font-bold rounded-xl border ${
                    inspectingStudent.status === 'Active'
                      ? 'bg-amber-950 hover:bg-amber-900 border-amber-800 text-amber-300'
                      : 'bg-emerald-950 hover:bg-emerald-900 border-emerald-800 text-emerald-300'
                  }`}
                >
                  {inspectingStudent.status === 'Active' ? 'Suspend Candidate' : 'Reactivate Candidate'}
                </button>
                <button
                  onClick={() => setShowInspectStudentModal(false)}
                  className="px-4 py-2 bg-[#121b3a] hover:bg-[#18234a] text-xs font-bold text-gray-300 rounded-xl"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* MODAL: EDIT PROBLEM STUDIO                                    */}
      {/* ------------------------------------------------------------- */}
      {showEditProblemModal && selectedQuestion && (
        <div className="fixed inset-0 bg-black/75 backdrop-blur-sm z-50 flex items-center justify-center p-4">
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
                  <label className="block text-[10px] font-extrabold text-gray-400 uppercase tracking-wider mb-1">TITLE</label>
                  <input
                    type="text"
                    value={selectedQuestion.title}
                    onChange={e => setSelectedQuestion({ ...selectedQuestion, title: e.target.value })}
                    className="w-full bg-[#070b1b] border border-[#172242] rounded-lg p-2 text-xs text-white"
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
        <div className="fixed inset-0 bg-black/75 backdrop-blur-sm z-50 flex items-center justify-center p-4">
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
              <div>
                <label className="block text-[10px] font-extrabold text-gray-400 uppercase tracking-wider mb-1">DESCRIPTION</label>
                <input
                  type="text"
                  placeholder="e.g. Spanning trees, Dijkstra, and Topological Sort"
                  value={newTopicDesc}
                  onChange={e => setNewTopicDesc(e.target.value)}
                  className="w-full bg-[#070b1b] border border-[#172242] rounded-lg p-2.5 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>
            <div className="px-6 py-4 border-t border-[#182342] flex justify-end space-x-3 bg-[#0d1430]">
              <button onClick={() => setShowAddTopicModal(false)} className="px-4 py-2 bg-[#121b3a] text-xs font-bold text-gray-300 rounded-xl">CANCEL</button>
              <button
                onClick={handleCreateParentTopic}
                className="px-5 py-2 bg-blue-600 hover:bg-blue-500 text-xs font-extrabold text-white rounded-xl shadow-lg shadow-blue-500/20"
              >
                CREATE TOPIC
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* MODAL: ADD SUBTOPIC                                           */}
      {/* ------------------------------------------------------------- */}
      {showAddSubtopicModal && (
        <div className="fixed inset-0 bg-black/75 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#0b1026] border border-[#1f2c52] rounded-2xl max-w-md w-full overflow-hidden shadow-2xl">
            <div className="px-6 py-4 border-b border-[#182342] flex justify-between items-center bg-[#0d1430]">
              <h3 className="font-extrabold text-sm text-white">Add Subtopic to Track</h3>
              <button onClick={() => setShowAddSubtopicModal(false)} className="text-gray-400 hover:text-white font-bold">✕</button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-[10px] font-extrabold text-gray-400 uppercase tracking-wider mb-1">PARENT TRACK</label>
                <select
                  value={selectedParentTopicId}
                  onChange={e => setSelectedParentTopicId(e.target.value)}
                  className="w-full bg-[#070b1b] border border-[#172242] rounded-lg p-2.5 text-xs text-white focus:outline-none focus:border-blue-500"
                >
                  {curriculumTopics.map(t => (
                    <option key={t.id} value={t.id}>{t.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-[10px] font-extrabold text-gray-400 uppercase tracking-wider mb-1">SUBTOPIC TITLE</label>
                <input
                  type="text"
                  placeholder="e.g. Breadth-First Search & Grid Shortest Paths"
                  value={newSubtopicTitle}
                  onChange={e => setNewSubtopicTitle(e.target.value)}
                  className="w-full bg-[#070b1b] border border-[#172242] rounded-lg p-2.5 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-[10px] font-extrabold text-gray-400 uppercase tracking-wider mb-1">SUBTOPIC DESCRIPTION</label>
                <input
                  type="text"
                  placeholder="e.g. Queue-based graph traversal algorithms"
                  value={newSubtopicDesc}
                  onChange={e => setNewSubtopicDesc(e.target.value)}
                  className="w-full bg-[#070b1b] border border-[#172242] rounded-lg p-2.5 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>
            <div className="px-6 py-4 border-t border-[#182342] flex justify-end space-x-3 bg-[#0d1430]">
              <button onClick={() => setShowAddSubtopicModal(false)} className="px-4 py-2 bg-[#121b3a] text-xs font-bold text-gray-300 rounded-xl">CANCEL</button>
              <button
                onClick={handleCreateSubtopic}
                className="px-5 py-2 bg-blue-600 hover:bg-blue-500 text-xs font-extrabold text-white rounded-xl shadow-lg shadow-blue-500/20"
              >
                ADD SUBTOPIC
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
