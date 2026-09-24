import React, { useState } from 'react';
import {
  Users, Plus, Activity, FileSpreadsheet, Briefcase, Award, Code2, Sparkles, Search
} from 'lucide-react';
import { AdminTabType, StudentRecord } from '../../types';

interface AdminPortalViewProps {
  studentsList: StudentRecord[];
  adminStats: {
    total_enrolled: number;
    daily_active_users: number;
    weekly_active_users: number;
    avg_readiness: number;
    code_submissions: number;
    battles_hosted: number;
  };
  onSwitchToCandidate: () => void;
  onToggleStudentStatus: (id: string) => void;
}

export const AdminPortalView: React.FC<AdminPortalViewProps> = ({
  studentsList,
  adminStats,
  onSwitchToCandidate,
  onToggleStudentStatus,
}) => {
  const [adminTab, setAdminTab] = useState<AdminTabType>('overview');
  const [studentSearchQuery, setStudentSearchQuery] = useState('');
  const [selectedStudent, setSelectedStudent] = useState<StudentRecord | null>(null);

  const filteredStudents = studentsList.filter((s) =>
    s.name.toLowerCase().includes(studentSearchQuery.toLowerCase()) ||
    s.email.toLowerCase().includes(studentSearchQuery.toLowerCase()) ||
    s.college.toLowerCase().includes(studentSearchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-[#070a13] text-slate-100 flex flex-col font-['Plus_Jakarta_Sans']">
      <header className="sticky top-0 z-50 bg-[#070a13]/90 backdrop-blur-md border-b border-rose-950/40 px-6 py-3.5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-rose-500 to-amber-500 p-[1.5px] flex items-center justify-center shadow-lg shadow-rose-500/20">
            <div className="h-full w-full bg-[#070a13] rounded-[10px] flex items-center justify-center font-mono font-bold text-rose-400 text-xs">
              ADM
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold tracking-tight text-lg bg-clip-text text-transparent bg-gradient-to-r from-white to-rose-400">
                PlacementForge Admin Console
              </span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-500/10 text-rose-400 border border-rose-500/20">
                Root Mode
              </span>
            </div>
          </div>
        </div>

        <button
          onClick={onSwitchToCandidate}
          className="px-4 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold border border-slate-700 transition"
        >
          ➔ Exit to Candidate Portal
        </button>
      </header>

      <nav className="bg-[#0b101e] border-b border-slate-800/60 px-6 py-2 flex items-center gap-2 overflow-x-auto text-xs font-medium">
        {[
          { id: 'overview', label: 'Platform Executive Overview', icon: Activity },
          { id: 'students', label: 'Student Directory & Moderation', icon: Users },
          { id: 'curriculum', label: 'Problem & Question Authoring', icon: Plus },
          { id: 'reports', label: 'Readiness & Placement Reports', icon: FileSpreadsheet },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = adminTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setAdminTab(tab.id as AdminTabType)}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl transition ${
                isActive ? 'bg-rose-600 text-white shadow-md shadow-rose-600/30' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
            >
              <Icon className={`h-3.5 w-3.5 ${isActive ? 'text-white' : 'text-slate-400'}`} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </nav>

      <main className="flex-1 p-6 max-w-7xl w-full mx-auto space-y-6">
        {adminTab === 'overview' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                { label: 'Enrolled Students', val: adminStats.total_enrolled, sub: '+6 this week', icon: Users, color: 'text-sky-400', bg: 'bg-sky-500/10' },
                { label: 'Active Today (DAU)', val: adminStats.daily_active_users, sub: `${adminStats.weekly_active_users} WAU Active`, icon: Activity, color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
                { label: 'Avg Readiness Score', val: `${adminStats.avg_readiness}%`, sub: 'Top Target: SWE Track', icon: Award, color: 'text-amber-400', bg: 'bg-amber-500/10' },
                { label: 'Code Arena Submissions', val: adminStats.code_submissions, sub: '98.4% sandbox success', icon: Code2, color: 'text-purple-400', bg: 'bg-purple-500/10' },
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

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="p-6 rounded-2xl bg-slate-900/70 border border-slate-800 space-y-4">
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <Briefcase className="h-4 w-4 text-sky-400" /> Target Role Distribution
                </h3>
                <div className="space-y-3">
                  {[
                    { role: 'Software Engineer (SWE)', count: 28, pct: 58, color: 'bg-indigo-500' },
                    { role: 'Data Engineer', count: 10, pct: 21, color: 'bg-sky-500' },
                    { role: 'DevOps & Cloud Engineer', count: 6, pct: 12, color: 'bg-emerald-500' },
                    { role: 'Data Analyst', count: 4, pct: 9, color: 'bg-amber-500' },
                  ].map((r) => (
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
                  <Sparkles className="h-4 w-4 text-amber-400" /> Health Status
                </h3>
                <div className="space-y-2.5">
                  {[
                    { name: 'Code Arena Judge (Docker Container Runner)', status: 'Optimal (0.04s latency)', rate: '99.8%' },
                    { name: 'Live Real-Time Code Battle Redis Locking', status: 'Atomic SETNX Active', rate: '100%' },
                    { name: 'AI Technical Mock Recruiter (Gemini)', status: 'Active & Synced', rate: '98.2%' },
                    { name: 'AI Resume ATS Keyword Parser', status: 'PyPDF Service Ready', rate: '100%' },
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

        {adminTab === 'students' && (
          <div className="space-y-5">
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
                      <td className="py-3.5 px-4 font-mono font-bold text-emerald-400">{s.readiness_score}%</td>
                      <td className="py-3.5 px-4 font-mono text-amber-400 font-bold">{s.xp} XP</td>
                      <td className="py-3.5 px-4">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            s.is_active
                              ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                              : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                          }`}
                        >
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
                          onClick={() => onToggleStudentStatus(s.id)}
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
          </div>
        )}
      </main>
    </div>
  );
};
