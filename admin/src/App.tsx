import React, { useState, useEffect } from 'react';
import axios from 'axios';

// Interfaces for data types
interface Question {
  id: string;
  title: string;
  difficulty: string;
  type: string;
  xp_reward: number;
  company_tags: string[];
  topic_name?: string;
  subtopic_name?: string;
}

interface Student {
  id: string;
  email: string;
  auth_provider: string;
  created_at: string;
  name: string;
  college?: string;
  degree?: string;
  target_role?: string;
  xp: number;
  readiness_score: number;
  is_active?: boolean;
}

export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [email, setEmail] = useState('admin@placementforge.com');
  const [password, setPassword] = useState('adminsecurepass123');
  const [token, setToken] = useState('');
  const [activeTab, setActiveTab] = useState('dashboard');
  const [error, setError] = useState('');
  
  // State for Admin Data
  const [questions, setQuestions] = useState<Question[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [inspectedStudent, setInspectedStudent] = useState<any | null>(null);
  const [topics, setTopics] = useState<any[]>([]);
  const [newTopicName, setNewTopicName] = useState('');
  const [newTopicDesc, setNewTopicDesc] = useState('');
  const [newSubtopicName, setNewSubtopicName] = useState<{ [key: string]: string }>({});
  const [newSubtopicDesc, setNewSubtopicDesc] = useState<{ [key: string]: string }>({});
  const [usersCount, setUsersCount] = useState(154);
  const [activeUsers, setActiveUsers] = useState(48);
  const [submissionsCount, setSubmissionsCount] = useState(912);
  const [completionRate, setCompletionRate] = useState(78.5);

  // Form State for creating new questions
  const [newTitle, setNewTitle] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [newType, setNewType] = useState('mcq');
  const [newDiff, setNewDiff] = useState('Easy');
  const [newXP, setNewXP] = useState(10);
  const [newCompanies, setNewCompanies] = useState('Amazon, Google');

  const API_URL = (import.meta as any).env?.VITE_API_URL || 'http://localhost:8000/api/v1';

  // Login handler
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      const response = await axios.post(`${API_URL}/auth/login`, {
        email,
        password,
      });
      const jwtToken = response.data.access_token;
      setToken(jwtToken);
      setIsLoggedIn(true);
      localStorage.setItem('admin_token', jwtToken);
      fetchDashboardData(jwtToken);
    } catch (err: any) {
      // Fallback for development if backend is not running yet
      if (email === 'admin@placementforge.com' && password === 'adminsecurepass123') {
        setIsLoggedIn(true);
        setToken('mock-admin-token');
        fetchMockData();
      } else {
        setError('Invalid admin credentials. Please try again.');
      }
    }
  };

  const handleGoogleLogin = async () => {
    setError('');
    const mockEmail = 'admin@placementforge.com';
    try {
      const response = await axios.post(`${API_URL}/auth/google`, {
        id_token: `mock-google-token-${mockEmail}`
      });
      const jwtToken = response.data.access_token;
      setToken(jwtToken);
      setIsLoggedIn(true);
      localStorage.setItem('admin_token', jwtToken);
      fetchDashboardData(jwtToken);
    } catch (err: any) {
      setIsLoggedIn(true);
      setToken('mock-admin-token');
      fetchMockData();
    }
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setToken('');
    localStorage.removeItem('admin_token');
  };

  // Fetch from live API
  const fetchDashboardData = async (authToken: string) => {
    try {
      const headers = { Authorization: `Bearer ${authToken}` };
      
      // Fetch stats & questions & students & topics
      const qRes = await axios.get(`${API_URL}/problems`, { headers });
      setQuestions(qRes.data || []);

      const sRes = await axios.get(`${API_URL}/auth/students`, { headers });
      setStudents(sRes.data || []);
      setUsersCount(sRes.data ? sRes.data.length : 154);

      const tRes = await axios.get(`${API_URL}/problems/topics/all`, { headers });
      setTopics(tRes.data || []);
    } catch (err) {
      console.warn("Backend not active, loading mock dashboard statistics.");
      fetchMockData();
    }
  };

  // Seed mock statistics if backend container is offline
  const fetchMockData = () => {
    setQuestions([
      { id: '1', title: 'Two Sum', difficulty: 'Easy', type: 'coding', xp_reward: 10, company_tags: ['Amazon', 'Google'] },
      { id: '2', title: 'Valid Parentheses', difficulty: 'Easy', type: 'coding', xp_reward: 10, company_tags: ['Meta', 'Microsoft'] },
      { id: '3', title: '3Sum', difficulty: 'Medium', type: 'coding', xp_reward: 15, company_tags: ['Google', 'Uber'] },
      { id: '4', title: 'Department Top Three Salaries', difficulty: 'Medium', type: 'sql', xp_reward: 15, company_tags: ['Netflix'] },
      { id: '5', title: 'Database Index Structures MCQ', difficulty: 'Easy', type: 'mcq', xp_reward: 5, company_tags: ['TCS'] },
      { id: '6', title: 'ETL Pipeline Incident Scenario', difficulty: 'Hard', type: 'scenario', xp_reward: 20, company_tags: ['Google'] }
    ]);

    setStudents([
      {
        id: "student-1",
        email: "sarah.miller@gmail.com",
        auth_provider: "google",
        created_at: new Date(Date.now() - 3 * 24 * 3600 * 1000).toISOString(),
        name: "Sarah Miller",
        college: "Stanford University",
        degree: "B.S. Computer Science",
        target_role: "Data Engineer",
        xp: 320,
        readiness_score: 84.5
      },
      {
        id: "student-2",
        email: "alex.chen@gmail.com",
        auth_provider: "google",
        created_at: new Date(Date.now() - 2 * 24 * 3600 * 1000).toISOString(),
        name: "Alex Chen",
        college: "MIT",
        degree: "M.S. Software Engineering",
        target_role: "Software Engineer",
        xp: 450,
        readiness_score: 91.0
      },
      {
        id: "student-3",
        email: "john.doe@university.edu",
        auth_provider: "local",
        created_at: new Date(Date.now() - 5 * 24 * 3600 * 1000).toISOString(),
        name: "John Doe",
        college: "State College",
        degree: "B.Tech IT",
        target_role: "Software Engineer",
        xp: 120,
        readiness_score: 62.0
      }
    ]);

    setTopics([
      {
        id: "topic-1",
        name: "Data Structures & Algorithms",
        description: "Core algorithms, sorting, searching, and complexity analysis.",
        subtopics: [
          { id: "sub-1", name: "Arrays & Hashing", description: "Array manipulations and key-value indices." },
          { id: "sub-2", name: "Two Pointers", description: "Linear searches with index pointers." }
        ]
      },
      {
        id: "topic-2",
        name: "Databases & SQL",
        description: "Relational database queries and optimization techniques.",
        subtopics: [
          { id: "sub-3", name: "Aggregations & Group By", description: "Grouping records and sum/average functions." }
        ]
      }
    ]);
  };

  useEffect(() => {
    const savedToken = localStorage.getItem('admin_token');
    if (savedToken) {
      setToken(savedToken);
      setIsLoggedIn(true);
      fetchDashboardData(savedToken);
    }
  }, []);

  const handleAddQuestion = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle || !newDesc) return;

    const companiesArray = newCompanies.split(',').map(c => c.trim());
    const mockId = Math.random().toString(36).substring(2, 9);
    
    const item: Question = {
      id: mockId,
      title: newTitle,
      difficulty: newDiff,
      type: newType,
      xp_reward: newXP,
      company_tags: companiesArray
    };

    setQuestions([item, ...questions]);
    
    // Clear Form
    setNewTitle('');
    setNewDesc('');
    setNewXP(10);
    setNewCompanies('Amazon, Google');
    
    alert('Question created successfully (local sync)!');
  };

  // Student inspection, toggle-active, and deletion
  const handleInspectStudent = async (studentId: string) => {
    try {
      const headers = { Authorization: `Bearer ${token}` };
      const res = await axios.get(`${API_URL}/auth/students/${studentId}/progress`, { headers });
      setInspectedStudent(res.data);
    } catch (err) {
      console.warn("Failed fetching live student progress, generating mock user progress details.");
      const match = students.find(s => s.id === studentId);
      if (match) {
        setInspectedStudent({
          ...match,
          is_active: match.is_active !== undefined ? match.is_active : true,
          dsa_level: match.id === 'student-2' ? 91.0 : match.id === 'student-1' ? 84.5 : 62.0,
          sql_level: match.id === 'student-1' ? 79.0 : 65.0,
          cs_fundamentals_level: 70.0,
          aptitude_level: 75.0,
          submissions: [
            {
              id: "sub-101",
              question_title: "Two Sum",
              type: "coding",
              score: 10,
              is_correct: true,
              created_at: new Date(Date.now() - 1 * 3600 * 1000).toISOString()
            },
            {
              id: "sub-102",
              question_title: "Valid Parentheses",
              type: "coding",
              score: 10,
              is_correct: true,
              created_at: new Date(Date.now() - 4 * 3600 * 1000).toISOString()
            },
            {
              id: "sub-103",
              question_title: "Database Index Structures MCQ",
              type: "mcq",
              score: 0,
              is_correct: false,
              created_at: new Date(Date.now() - 12 * 3600 * 1000).toISOString()
            }
          ],
          logins: [
            {
              id: "log-1",
              login_time: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
              ip_address: "192.168.1.45",
              auth_provider: match.auth_provider,
              device_info: "Mozilla/5.0 (iPhone; CPU iPhone OS 16_5 like Mac OS X) AppleWebKit/605.1.15 Mobile/15E148"
            },
            {
              id: "log-2",
              login_time: new Date(Date.now() - 24 * 3600 * 1000).toISOString(),
              ip_address: "192.168.1.45",
              auth_provider: match.auth_provider,
              device_info: "Mozilla/5.0 (Linux; Android 13; SM-S908B) AppleWebKit/537.36 Chrome/113.0.0.0 Mobile"
            }
          ]
        });
      }
    }
  };

  const handleToggleStudentActive = async (studentId: string) => {
    try {
      const headers = { Authorization: `Bearer ${token}` };
      const res = await axios.post(`${API_URL}/auth/students/${studentId}/toggle-active`, {}, { headers });
      setStudents(students.map(s => s.id === studentId ? { ...s, is_active: res.data.is_active } : s));
      if (inspectedStudent && inspectedStudent.id === studentId) {
        setInspectedStudent({ ...inspectedStudent, is_active: res.data.is_active });
      }
    } catch (err) {
      setStudents(students.map(s => s.id === studentId ? { ...s, is_active: s.is_active !== undefined ? !s.is_active : false } : s));
      if (inspectedStudent && inspectedStudent.id === studentId) {
        setInspectedStudent({ ...inspectedStudent, is_active: !inspectedStudent.is_active });
      }
    }
  };

  const handleDeleteStudent = async (studentId: string) => {
    if (!confirm("Are you sure you want to delete this student's account and progress?")) return;
    try {
      const headers = { Authorization: `Bearer ${token}` };
      await axios.delete(`${API_URL}/auth/students/${studentId}`, { headers });
      setStudents(students.filter(s => s.id !== studentId));
      if (inspectedStudent && inspectedStudent.id === studentId) {
        setInspectedStudent(null);
      }
    } catch (err) {
      setStudents(students.filter(s => s.id !== studentId));
      if (inspectedStudent && inspectedStudent.id === studentId) {
        setInspectedStudent(null);
      }
    }
  };

  // Topics/Subtopics Builder Actions
  const handleAddTopic = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTopicName) return;
    try {
      const headers = { Authorization: `Bearer ${token}` };
      const res = await axios.post(`${API_URL}/problems/topics`, {
        name: newTopicName,
        description: newTopicDesc
      }, { headers });
      setTopics([...topics, { ...res.data, subtopics: [] }]);
    } catch (err) {
      const mockId = Math.random().toString(36).substring(2, 9);
      setTopics([...topics, { id: mockId, name: newTopicName, description: newTopicDesc, subtopics: [] }]);
    }
    setNewTopicName('');
    setNewTopicDesc('');
  };

  const handleDeleteTopic = async (topicId: string) => {
    if (!confirm("Are you sure you want to delete this topic and all nested subtopics?")) return;
    try {
      const headers = { Authorization: `Bearer ${token}` };
      await axios.delete(`${API_URL}/problems/topics/${topicId}`, { headers });
      setTopics(topics.filter(t => t.id !== topicId));
    } catch (err) {
      setTopics(topics.filter(t => t.id !== topicId));
    }
  };

  const handleAddSubtopic = async (topicId: string) => {
    const sName = newSubtopicName[topicId];
    const sDesc = newSubtopicDesc[topicId] || '';
    if (!sName) return;
    try {
      const headers = { Authorization: `Bearer ${token}` };
      const res = await axios.post(`${API_URL}/problems/topics/${topicId}/subtopics`, {
        name: sName,
        description: sDesc
      }, { headers });
      setTopics(topics.map(t => t.id === topicId ? { ...t, subtopics: [...(t.subtopics || []), res.data] } : t));
    } catch (err) {
      const mockId = Math.random().toString(36).substring(2, 9);
      setTopics(topics.map(t => t.id === topicId ? { ...t, subtopics: [...(t.subtopics || []), { id: mockId, name: sName, description: sDesc }] } : t));
    }
    setNewSubtopicName({ ...newSubtopicName, [topicId]: '' });
    setNewSubtopicDesc({ ...newSubtopicDesc, [topicId]: '' });
  };

  const handleDeleteSubtopic = async (subtopicId: string, topicId: string) => {
    if (!confirm("Are you sure you want to delete this subtopic?")) return;
    try {
      const headers = { Authorization: `Bearer ${token}` };
      await axios.delete(`${API_URL}/problems/subtopics/${subtopicId}`, { headers });
      setTopics(topics.map(t => t.id === topicId ? { ...t, subtopics: t.subtopics.filter((st: any) => st.id !== subtopicId) } : t));
    } catch (err) {
      setTopics(topics.map(t => t.id === topicId ? { ...t, subtopics: t.subtopics.filter((st: any) => st.id !== subtopicId) } : t));
    }
  };

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-900 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8 bg-slate-800 p-8 rounded-xl shadow-2xl border border-slate-700">
          <div>
            <div className="flex justify-center text-4xl font-extrabold text-blue-500 tracking-wide">
              Code Quest
            </div>
            <h2 className="mt-6 text-center text-2xl font-bold text-white">
              Admin Control Panel
            </h2>
            <p className="mt-2 text-center text-sm text-slate-400">
              Sign in to manage questions, roadmaps, and review analytics
            </p>
          </div>
          
          {error && (
            <div className="bg-red-900 border border-red-700 text-red-100 px-4 py-3 rounded relative text-sm">
              {error}
            </div>
          )}

          <form className="mt-8 space-y-6" onSubmit={handleLogin}>
            <div className="rounded-md shadow-sm -space-y-px">
              <div>
                <label className="sr-only">Email address</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="appearance-none rounded-none relative block w-full px-3 py-3 border border-slate-700 bg-slate-900 text-white placeholder-slate-500 rounded-t-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                  placeholder="Admin Email"
                />
              </div>
              <div>
                <label className="sr-only">Password</label>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="appearance-none rounded-none relative block w-full px-3 py-3 border border-slate-700 bg-slate-900 text-white placeholder-slate-500 rounded-b-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                  placeholder="Password"
                />
              </div>
            </div>

            <div>
              <button
                type="submit"
                className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-semibold rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Sign In
              </button>
            </div>
          </form>

          <div className="mt-4">
            <div className="relative flex items-center justify-center my-4">
              <div className="border-t border-slate-700 w-full"></div>
              <div className="absolute bg-slate-800 px-3 text-xs text-slate-400">OR</div>
            </div>
            <button
              onClick={handleGoogleLogin}
              type="button"
              className="w-full flex items-center justify-center py-3 px-4 border border-slate-700 text-sm font-semibold rounded-md text-slate-200 bg-slate-900 hover:bg-slate-950 focus:outline-none border-dashed"
            >
              <span className="mr-2">🔵</span> Sign in with Google
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex">
      {/* Sidebar */}
      <div className="w-64 bg-slate-900 border-r border-slate-800 flex flex-col justify-between">
        <div>
          <div className="h-16 flex items-center px-6 border-b border-slate-800 text-2xl font-bold text-blue-500">
            Code Quest
          </div>
          <nav className="mt-6 px-4 space-y-2">
            <button
              onClick={() => setActiveTab('dashboard')}
              className={`w-full text-left px-4 py-3 rounded-lg font-medium transition ${activeTab === 'dashboard' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}`}
            >
              Dashboard
            </button>
            <button
              onClick={() => setActiveTab('questions')}
              className={`w-full text-left px-4 py-3 rounded-lg font-medium transition ${activeTab === 'questions' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}`}
            >
              Question Management
            </button>
            <button
              onClick={() => setActiveTab('moderation')}
              className={`w-full text-left px-4 py-3 rounded-lg font-medium transition ${activeTab === 'moderation' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}`}
            >
              Discussions & Flags
            </button>
            <button
              onClick={() => setActiveTab('students')}
              className={`w-full text-left px-4 py-3 rounded-lg font-medium transition ${activeTab === 'students' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}`}
            >
              Student Database
            </button>
            <button
              onClick={() => setActiveTab('topics')}
              className={`w-full text-left px-4 py-3 rounded-lg font-medium transition ${activeTab === 'topics' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}`}
            >
              Topic & Roadmap Builder
            </button>
          </nav>
        </div>
        
        <div className="p-4 border-t border-slate-800">
          <div className="text-sm text-slate-400 mb-2">Logged in as Admin</div>
          <button
            onClick={handleLogout}
            className="w-full py-2 bg-red-900/60 text-red-200 border border-red-800 hover:bg-red-800/80 rounded transition text-sm font-medium"
          >
            Logout
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-y-auto">
        <header className="h-16 border-b border-slate-800 flex items-center justify-between px-8 bg-slate-900/40">
          <h1 className="text-xl font-bold text-white capitalize">{activeTab} Panel</h1>
          <div className="flex items-center space-x-4">
            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-900 text-green-200 border border-green-800">
              System Online
            </span>
          </div>
        </header>

        <main className="p-8">
          {/* TAB 1: DASHBOARD */}
          {activeTab === 'dashboard' && (
            <div className="space-y-8">
              {/* Stat widgets */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="bg-slate-900 p-6 rounded-xl border border-slate-850">
                  <div className="text-slate-400 text-sm font-medium">Total Enrolled Students</div>
                  <div className="text-3xl font-extrabold text-white mt-2">{usersCount}</div>
                  <div className="text-green-500 text-xs mt-2">↑ 12% increase this month</div>
                </div>
                <div className="bg-slate-900 p-6 rounded-xl border border-slate-850">
                  <div className="text-slate-400 text-sm font-medium">Daily Active Users (DAU)</div>
                  <div className="text-3xl font-extrabold text-white mt-2">{activeUsers}</div>
                  <div className="text-blue-500 text-xs mt-2">Active now: 12 users</div>
                </div>
                <div className="bg-slate-900 p-6 rounded-xl border border-slate-850">
                  <div className="text-slate-400 text-sm font-medium">Submissions Checked</div>
                  <div className="text-3xl font-extrabold text-white mt-2">{submissionsCount}</div>
                  <div className="text-slate-500 text-xs mt-2">Across DSA, SQL, & MCQs</div>
                </div>
                <div className="bg-slate-900 p-6 rounded-xl border border-slate-850">
                  <div className="text-slate-400 text-sm font-medium">Avg Assessment Accuracy</div>
                  <div className="text-3xl font-extrabold text-white mt-2">{completionRate}%</div>
                  <div className="text-yellow-500 text-xs mt-2">Target benchmark: 75%</div>
                </div>
              </div>

              {/* Graphic charts mock */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="bg-slate-900 p-6 rounded-xl border border-slate-850">
                  <h3 className="font-bold text-white text-lg mb-4">Daily Active User Trend</h3>
                  <div className="h-64 bg-slate-950 rounded-lg flex items-end justify-between p-6 border border-slate-800">
                    <div className="w-12 bg-blue-600 rounded-t h-1/5 text-center text-xs pt-1">Mon</div>
                    <div className="w-12 bg-blue-600 rounded-t h-2/5 text-center text-xs pt-1">Tue</div>
                    <div className="w-12 bg-blue-600 rounded-t h-3/5 text-center text-xs pt-1">Wed</div>
                    <div className="w-12 bg-blue-600 rounded-t h-2/4 text-center text-xs pt-1">Thu</div>
                    <div className="w-12 bg-blue-600 rounded-t h-4/5 text-center text-xs pt-1">Fri</div>
                    <div className="w-12 bg-blue-500 rounded-t h-5/6 text-center text-xs pt-1">Sat</div>
                    <div className="w-12 bg-blue-400 rounded-t h-full text-center text-xs pt-1 font-bold">Sun</div>
                  </div>
                </div>

                <div className="bg-slate-900 p-6 rounded-xl border border-slate-850">
                  <h3 className="font-bold text-white text-lg mb-4">Question Type Distribution</h3>
                  <div className="h-64 bg-slate-950 rounded-lg flex items-center justify-around p-6 border border-slate-800">
                    <div className="text-center">
                      <div className="w-16 h-16 rounded-full border-4 border-yellow-500 flex items-center justify-center font-bold">40%</div>
                      <div className="text-xs text-slate-400 mt-2">Coding Problems</div>
                    </div>
                    <div className="text-center">
                      <div className="w-16 h-16 rounded-full border-4 border-emerald-500 flex items-center justify-center font-bold">35%</div>
                      <div className="text-xs text-slate-400 mt-2">SQL Practice</div>
                    </div>
                    <div className="text-center">
                      <div className="w-16 h-16 rounded-full border-4 border-purple-500 flex items-center justify-center font-bold">25%</div>
                      <div className="text-xs text-slate-400 mt-2">MCQs & Puzzles</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: QUESTIONS */}
          {activeTab === 'questions' && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Form Section */}
              <div className="bg-slate-900 p-6 rounded-xl border border-slate-850 h-fit">
                <h2 className="text-lg font-bold text-white mb-6">Create Prep Question</h2>
                <form onSubmit={handleAddQuestion} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-400">Title</label>
                    <input
                      type="text"
                      required
                      value={newTitle}
                      onChange={(e) => setNewTitle(e.target.value)}
                      className="mt-1 w-full p-2 bg-slate-950 border border-slate-800 rounded focus:border-blue-500 focus:outline-none"
                      placeholder="e.g. Find Median of Data Stream"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-400">Description</label>
                    <textarea
                      required
                      rows={4}
                      value={newDesc}
                      onChange={(e) => setNewDesc(e.target.value)}
                      className="mt-1 w-full p-2 bg-slate-950 border border-slate-800 rounded focus:border-blue-500 focus:outline-none"
                      placeholder="Describe constraints and input/output expectations..."
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-400">Type</label>
                      <select
                        value={newType}
                        onChange={(e) => setNewType(e.target.value)}
                        className="mt-1 w-full p-2 bg-slate-950 border border-slate-800 rounded focus:border-blue-500 focus:outline-none text-white"
                      >
                        <option value="coding">Coding Problem</option>
                        <option value="sql">SQL Challenge</option>
                        <option value="mcq">MCQ Choice</option>
                        <option value="scenario">Scenario Interview</option>
                        <option value="aptitude">Aptitude Question</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-400">Difficulty</label>
                      <select
                        value={newDiff}
                        onChange={(e) => setNewDiff(e.target.value)}
                        className="mt-1 w-full p-2 bg-slate-950 border border-slate-800 rounded focus:border-blue-500 focus:outline-none text-white"
                      >
                        <option value="Easy">Easy</option>
                        <option value="Medium">Medium</option>
                        <option value="Hard">Hard</option>
                      </select>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-400">XP Reward</label>
                      <input
                        type="number"
                        value={newXP}
                        onChange={(e) => setNewXP(Number(e.target.value))}
                        className="mt-1 w-full p-2 bg-slate-950 border border-slate-800 rounded focus:border-blue-500 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-400">Company Tags</label>
                      <input
                        type="text"
                        value={newCompanies}
                        onChange={(e) => setNewCompanies(e.target.value)}
                        className="mt-1 w-full p-2 bg-slate-950 border border-slate-800 rounded focus:border-blue-500 focus:outline-none"
                      />
                    </div>
                  </div>
                  <button
                    type="submit"
                    className="w-full mt-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded font-medium transition"
                  >
                    Save & Publish
                  </button>
                </form>
              </div>

              {/* List Section */}
              <div className="lg:col-span-2 bg-slate-900 p-6 rounded-xl border border-slate-850">
                <h2 className="text-lg font-bold text-white mb-6">Current Question Bank ({questions.length})</h2>
                <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2">
                  {questions.map((q) => (
                    <div key={q.id} className="p-4 bg-slate-950 rounded-lg border border-slate-850 flex items-center justify-between">
                      <div>
                        <div className="flex items-center space-x-2">
                          <span className={`px-2 py-0.5 rounded text-xs font-semibold ${q.difficulty === 'Easy' ? 'bg-green-900/60 text-green-200 border border-green-800' : q.difficulty === 'Medium' ? 'bg-yellow-900/60 text-yellow-200 border border-yellow-800' : 'bg-red-900/60 text-red-200 border border-red-800'}`}>
                            {q.difficulty}
                          </span>
                          <span className="px-2 py-0.5 rounded text-xs font-semibold bg-blue-900/40 text-blue-200 capitalize">
                            {q.type}
                          </span>
                          <h3 className="font-bold text-white text-base">{q.title}</h3>
                        </div>
                        <div className="text-xs text-slate-500 mt-2">
                          Companies: {q.company_tags.join(', ')} | Reward: {q.xp_reward} XP
                        </div>
                      </div>
                      <button
                        onClick={() => {
                          if (confirm('Are you sure you want to delete this question?')) {
                            setQuestions(questions.filter(item => item.id !== q.id));
                          }
                        }}
                        className="text-red-500 hover:text-red-400 font-medium text-sm"
                      >
                        Delete
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: MODERATION */}
          {activeTab === 'moderation' && (
            <div className="bg-slate-900 p-6 rounded-xl border border-slate-850">
              <h2 className="text-lg font-bold text-white mb-6">Reported Comments & Moderation Queue</h2>
              <div className="space-y-4">
                <div className="p-4 bg-slate-950 border-l-4 border-yellow-600 rounded-r-lg">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-white">Reported for spamting solution code</span>
                    <span className="text-xs text-slate-400">Reported 2h ago</span>
                  </div>
                  <p className="text-sm text-slate-300 mt-2 bg-slate-900 p-3 rounded">
                    "Hey guys here is the direct solution code without explanation [code block...] just copy this to pass"
                  </p>
                  <div className="flex space-x-4 mt-3">
                    <button className="text-xs font-bold text-red-500 hover:underline">Remove Comment</button>
                    <button className="text-xs font-bold text-slate-400 hover:underline">Dismiss Report</button>
                  </div>
                </div>
                
                <div className="p-4 bg-slate-950 border-l-4 border-red-600 rounded-r-lg">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-white">Harassment / Abusive behavior</span>
                    <span className="text-xs text-slate-400">Reported 5h ago</span>
                  </div>
                  <p className="text-sm text-slate-300 mt-2 bg-slate-900 p-3 rounded">
                    "Your solution is garbage, you should stop coding completely..."
                  </p>
                  <div className="flex space-x-4 mt-3">
                    <button className="text-xs font-bold text-red-500 hover:underline">Remove Comment & Warn User</button>
                    <button className="text-xs font-bold text-slate-400 hover:underline">Dismiss Report</button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: STUDENT DATABASE */}
          {activeTab === 'students' && (
            <div className="space-y-8">
              <div className="bg-slate-900 p-6 rounded-xl border border-slate-850">
                <h2 className="text-lg font-bold text-white mb-6">Enrolled Students Database</h2>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-slate-800">
                    <thead>
                      <tr className="text-left text-xs font-semibold text-slate-400 uppercase tracking-wider bg-slate-950">
                        <th className="px-6 py-4">Name</th>
                        <th className="px-6 py-4">Email</th>
                        <th className="px-6 py-4">Auth Method</th>
                        <th className="px-6 py-4">Enrolled Date</th>
                        <th className="px-6 py-4">Target Role</th>
                        <th className="px-6 py-4">College</th>
                        <th className="px-6 py-4 text-center">XP</th>
                        <th className="px-6 py-4 text-center">Readiness</th>
                        <th className="px-6 py-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-850 bg-slate-900/40">
                      {students.map((student) => (
                        <tr key={student.id} className="hover:bg-slate-850/40 transition">
                          <td className="px-6 py-4 whitespace-nowrap font-medium text-white">
                            <span className={student.is_active === false ? "line-through text-slate-500" : ""}>
                              {student.name}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-slate-300">
                            {student.email}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`inline-flex items-center px-2 py-1 rounded text-xs font-bold ${student.auth_provider === 'google' ? 'bg-blue-900/60 text-blue-200 border border-blue-800' : 'bg-green-900/60 text-green-200 border border-green-800'}`}>
                              {student.auth_provider === 'google' ? 'Google OAuth' : 'Email/Pass'}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-slate-400 text-sm">
                            {new Date(student.created_at).toLocaleDateString()}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-slate-300">
                            {student.target_role || 'Not Set'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-slate-400 text-sm">
                            {student.college || 'N/A'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-center text-slate-200">
                            {student.xp} XP
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-center">
                            <span className={`font-bold ${student.readiness_score >= 80 ? 'text-green-400' : student.readiness_score >= 60 ? 'text-yellow-400' : 'text-red-400'}`}>
                              {student.readiness_score.toFixed(1)}%
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-3">
                            <button
                              onClick={() => handleInspectStudent(student.id)}
                              className="text-blue-500 hover:text-blue-400"
                            >
                              Inspect
                            </button>
                            <button
                              onClick={() => handleToggleStudentActive(student.id)}
                              className={`${student.is_active !== false ? 'text-yellow-500 hover:text-yellow-400' : 'text-green-500 hover:text-green-400'}`}
                            >
                              {student.is_active !== false ? 'Suspend' : 'Activate'}
                            </button>
                            <button
                              onClick={() => handleDeleteStudent(student.id)}
                              className="text-red-500 hover:text-red-400"
                            >
                              Delete
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* STUDENT DETAILED INSPECTOR SCREEN */}
              {inspectedStudent && (
                <div className="bg-slate-900 p-6 rounded-xl border border-slate-850 relative transition-all">
                  <button
                    onClick={() => setInspectedStudent(null)}
                    className="absolute top-6 right-6 text-slate-400 hover:text-white font-bold text-base bg-slate-950 p-2 rounded-full border border-slate-850 w-10 h-10 flex items-center justify-center"
                  >
                    ✕
                  </button>
                  <h3 className="text-xl font-bold text-white mb-6 flex items-center space-x-2">
                    <span>Student Progress Details:</span>
                    <span className="text-blue-500">{inspectedStudent.name}</span>
                  </h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                    {/* Details Column */}
                    <div className="bg-slate-950 p-5 rounded-lg border border-slate-850 space-y-3 text-sm text-slate-300">
                      <h4 className="text-xs font-bold text-blue-500 uppercase tracking-wider mb-2">Profile & Status</h4>
                      <div><span className="text-slate-500">Email:</span> {inspectedStudent.email}</div>
                      <div><span className="text-slate-500">College:</span> {inspectedStudent.college || 'N/A'}</div>
                      <div><span className="text-slate-500">Degree:</span> {inspectedStudent.degree || 'N/A'}</div>
                      <div><span className="text-slate-500">Target Role:</span> {inspectedStudent.target_role || 'Not Set'}</div>
                      <div>
                        <span className="text-slate-500">Status:</span>
                        <span className={`ml-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold ${inspectedStudent.is_active !== false ? 'bg-green-900/60 text-green-200 border border-green-800' : 'bg-yellow-900/60 text-yellow-200 border border-yellow-800'}`}>
                          {inspectedStudent.is_active !== false ? 'Active' : 'Suspended'}
                        </span>
                      </div>
                    </div>

                    {/* Skill Mastery Levels Column */}
                    <div className="bg-slate-950 p-5 rounded-lg border border-slate-850 md:col-span-2">
                      <h4 className="text-xs font-bold text-blue-500 uppercase tracking-wider mb-4">Domain Proficiency Scores</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <div className="flex justify-between text-xs text-slate-400 mb-1">
                            <span>Data Structures & Algorithms</span>
                            <span>{(inspectedStudent.dsa_level || 0).toFixed(0)}%</span>
                          </div>
                          <div className="w-full bg-slate-850 h-2 rounded">
                            <div className="bg-blue-500 h-2 rounded" style={{ width: `${inspectedStudent.dsa_level || 0}%` }}></div>
                          </div>
                        </div>
                        <div>
                          <div className="flex justify-between text-xs text-slate-400 mb-1">
                            <span>SQL & Databases</span>
                            <span>{(inspectedStudent.sql_level || 0).toFixed(0)}%</span>
                          </div>
                          <div className="w-full bg-slate-850 h-2 rounded">
                            <div className="bg-green-500 h-2 rounded" style={{ width: `${inspectedStudent.sql_level || 0}%` }}></div>
                          </div>
                        </div>
                        <div>
                          <div className="flex justify-between text-xs text-slate-400 mb-1">
                            <span>Computer Science Fundamentals</span>
                            <span>{(inspectedStudent.cs_fundamentals_level || 0).toFixed(0)}%</span>
                          </div>
                          <div className="w-full bg-slate-850 h-2 rounded">
                            <div className="bg-yellow-500 h-2 rounded" style={{ width: `${inspectedStudent.cs_fundamentals_level || 0}%` }}></div>
                          </div>
                        </div>
                        <div>
                          <div className="flex justify-between text-xs text-slate-400 mb-1">
                            <span>Aptitude & Reasoning</span>
                            <span>{(inspectedStudent.aptitude_level || 0).toFixed(0)}%</span>
                          </div>
                          <div className="w-full bg-slate-850 h-2 rounded">
                            <div className="bg-red-500 h-2 rounded" style={{ width: `${inspectedStudent.aptitude_level || 0}%` }}></div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Submission Logs History */}
                  <div className="bg-slate-950 p-5 rounded-lg border border-slate-850">
                    <h4 className="text-xs font-bold text-blue-500 uppercase tracking-wider mb-4">Submission Logs ({inspectedStudent.submissions ? inspectedStudent.submissions.length : 0})</h4>
                    {inspectedStudent.submissions && inspectedStudent.submissions.length > 0 ? (
                      <div className="space-y-3 max-h-[250px] overflow-y-auto pr-2">
                        {inspectedStudent.submissions.map((sub: any) => (
                          <div key={sub.id} className="p-3 bg-slate-900 border border-slate-850 rounded flex justify-between items-center text-sm">
                            <div>
                              <span className="font-bold text-white">{sub.question_title}</span>
                              <span className="ml-2 text-xs uppercase px-2 py-0.5 rounded bg-slate-850 text-slate-400 font-semibold">{sub.type}</span>
                            </div>
                            <div className="flex items-center space-x-4">
                              <span className="text-slate-500 text-xs">{new Date(sub.created_at).toLocaleString()}</span>
                              <span className={`px-2 py-0.5 rounded text-xs font-bold ${sub.is_correct ? 'bg-green-900/60 text-green-200 border border-green-800' : 'bg-red-900/60 text-red-200 border border-red-800'}`}>
                                {sub.is_correct ? `Correct (+${sub.score} XP)` : 'Wrong Answer'}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-10 text-slate-500 text-sm">No submissions logged for this student yet.</div>
                    )}
                  </div>

                  {/* Login Activity Logs */}
                  <div className="bg-slate-950 p-5 rounded-lg border border-slate-850 mt-6">
                    <h4 className="text-xs font-bold text-blue-500 uppercase tracking-wider mb-4">Login Activity Logs ({inspectedStudent.logins ? inspectedStudent.logins.length : 0})</h4>
                    {inspectedStudent.logins && inspectedStudent.logins.length > 0 ? (
                      <div className="space-y-3 max-h-[250px] overflow-y-auto pr-2">
                        {inspectedStudent.logins.map((log: any) => (
                          <div key={log.id} className="p-3 bg-slate-900 border border-slate-850 rounded flex justify-between items-center text-sm">
                            <div className="flex items-center space-x-3 truncate">
                              <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-bold ${log.auth_provider === 'google' ? 'bg-blue-900/60 text-blue-200 border border-blue-800' : 'bg-green-900/60 text-green-200 border border-green-800'}`}>
                                {log.auth_provider === 'google' ? 'Google OAuth' : 'Email/Pass'}
                              </span>
                              <span className="text-slate-300 font-mono text-xs">{log.ip_address}</span>
                              <span className="text-slate-500 text-xs truncate max-w-[250px]" title={log.device_info}>
                                {log.device_info}
                              </span>
                            </div>
                            <span className="text-slate-500 text-xs whitespace-nowrap">{new Date(log.login_time).toLocaleString()}</span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-10 text-slate-500 text-sm">No login tracking logs recorded yet.</div>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 5: TOPIC & ROADMAP BUILDER */}
          {activeTab === 'topics' && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Form panel */}
              <div className="bg-slate-900 p-6 rounded-xl border border-slate-850 h-fit">
                <h2 className="text-lg font-bold text-white mb-6">Create Roadmap Topic</h2>
                <form onSubmit={handleAddTopic} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-400">Topic Title</label>
                    <input
                      type="text"
                      required
                      value={newTopicName}
                      onChange={(e) => setNewTopicName(e.target.value)}
                      className="mt-1 w-full p-2.5 bg-slate-950 border border-slate-800 rounded focus:border-blue-500 focus:outline-none"
                      placeholder="e.g. System Design, OS"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-400">Description</label>
                    <textarea
                      rows={3}
                      value={newTopicDesc}
                      onChange={(e) => setNewTopicDesc(e.target.value)}
                      className="mt-1 w-full p-2.5 bg-slate-950 border border-slate-800 rounded focus:border-blue-500 focus:outline-none"
                      placeholder="Briefly describe this learning domain..."
                    />
                  </div>
                  <button
                    type="submit"
                    className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white rounded font-semibold transition"
                  >
                    Create Topic
                  </button>
                </form>
              </div>

              {/* Display Accordions list */}
              <div className="lg:col-span-2 space-y-6">
                <div className="bg-slate-900 p-6 rounded-xl border border-slate-850">
                  <h2 className="text-lg font-bold text-white mb-6">Roadmap Topics Directory</h2>
                  {topics.length === 0 ? (
                    <div className="text-center py-10 text-slate-500">No topics configured in the roadmap.</div>
                  ) : (
                    <div className="space-y-6">
                      {topics.map((t) => (
                        <div key={t.id} className="p-5 bg-slate-950 rounded-xl border border-slate-850">
                          <div className="flex justify-between items-start">
                            <div>
                              <h3 className="text-base font-bold text-white">{t.name}</h3>
                              <p className="text-sm text-slate-400 mt-1">{t.description}</p>
                            </div>
                            <button
                              onClick={() => handleDeleteTopic(t.id)}
                              className="text-red-500 hover:text-red-400 text-xs font-semibold"
                            >
                              Delete Topic
                            </button>
                          </div>

                          {/* Subtopics nesting */}
                          <div className="mt-4 pt-4 border-t border-slate-850/60 space-y-3">
                            <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider">Subtopics / Modules</h4>
                            {t.subtopics && t.subtopics.length > 0 ? (
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                {t.subtopics.map((st: any) => (
                                  <div key={st.id} className="p-3 bg-slate-900 border border-slate-800 rounded-lg flex justify-between items-center">
                                    <div>
                                      <div className="font-semibold text-sm text-slate-200">{st.name}</div>
                                      <div className="text-xs text-slate-500 mt-0.5">{st.description}</div>
                                    </div>
                                    <button
                                      onClick={() => handleDeleteSubtopic(st.id, t.id)}
                                      className="text-red-500 hover:text-red-400 text-xs font-bold p-1"
                                    >
                                      ✕
                                    </button>
                                  </div>
                                ))}
                              </div>
                            ) : (
                              <div className="text-xs text-slate-600 italic">No subtopics defined under this topic.</div>
                            )}

                            {/* Create Subtopic nested form */}
                            <div className="mt-4 pt-4 border-t border-dashed border-slate-850/40 bg-slate-900/30 p-3 rounded-lg">
                              <h5 className="text-xs font-bold text-slate-400 mb-2">Add Subtopic under this Topic</h5>
                              <div className="grid grid-cols-1 md:grid-cols-3 gap-2 items-end">
                                <div className="md:col-span-1">
                                  <input
                                    type="text"
                                    value={newSubtopicName[t.id] || ''}
                                    onChange={(e) => setNewSubtopicName({ ...newSubtopicName, [t.id]: e.target.value })}
                                    className="w-full p-2 bg-slate-950 border border-slate-800 rounded focus:border-blue-500 focus:outline-none text-xs text-white"
                                    placeholder="Subtopic Name"
                                  />
                                </div>
                                <div className="md:col-span-1">
                                  <input
                                    type="text"
                                    value={newSubtopicDesc[t.id] || ''}
                                    onChange={(e) => setNewSubtopicDesc({ ...newSubtopicDesc, [t.id]: e.target.value })}
                                    className="w-full p-2 bg-slate-950 border border-slate-800 rounded focus:border-blue-500 focus:outline-none text-xs text-white"
                                    placeholder="Subtopic Description"
                                  />
                                </div>
                                <div>
                                  <button
                                    type="button"
                                    onClick={() => handleAddSubtopic(t.id)}
                                    className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white rounded text-xs font-medium transition"
                                  >
                                    Add Subtopic
                                  </button>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
