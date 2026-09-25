import React, { useState } from 'react';
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
  X
} from 'lucide-react';

interface ProjectDetail {
  title: string;
  desc: string;
  xp: string;
  difficulty: string;
  tasks: string[];
}

export const RoadmapsView: React.FC = () => {
  const [selectedTrack, setSelectedTrack] = useState('Data Engineer');
  const [activeProjectModal, setActiveProjectModal] = useState<ProjectDetail | null>(null);
  const [completedTasks, setCompletedTasks] = useState<Record<string, boolean>>({});

  const tracks = [
    'Data Engineer',
    'Software Engineer',
    'Backend Developer',
    'Full Stack Developer',
  ];

  const milestones = [
    {
      name: 'Foundation',
      progress: 100,
      status: 'completed',
      skills: 'Python, SQL, Git',
      color: 'text-emerald-400',
      bgColor: 'bg-emerald-500/20',
      borderColor: 'border-emerald-500',
    },
    {
      name: 'Intermediate',
      progress: 80,
      status: 'in-progress',
      skills: 'Pandas, NumPy, Data Analysis',
      color: 'text-sky-400',
      bgColor: 'bg-sky-500/20',
      borderColor: 'border-sky-500',
    },
    {
      name: 'Advanced',
      progress: 40,
      status: 'in-progress',
      skills: 'PySpark, Airflow, AWS',
      color: 'text-indigo-400',
      bgColor: 'bg-indigo-500/20',
      borderColor: 'border-indigo-500',
    },
    {
      name: 'Interview Ready',
      progress: 0,
      status: 'locked',
      skills: 'System Design, Mock Interviews',
      color: 'text-slate-500',
      bgColor: 'bg-slate-900',
      borderColor: 'border-slate-800',
    },
  ];

  const projects: ProjectDetail[] = [
    {
      title: 'Build ETL Pipeline',
      desc: 'Using Python, Airflow and AWS',
      xp: '+100 XP',
      difficulty: 'Intermediate',
      tasks: [
        'Set up automated Docker compose with Airflow Webserver and Scheduler',
        'Extract raw JSON telemetry data from mock API endpoints',
        'Transform data using Pandas & NumPy, cleaning nulls and deduping',
        'Load clean partitioned Parquet files into AWS S3 buckets and trigger alerts'
      ]
    },
    {
      title: 'Distributed Log Streamer',
      desc: 'Using Apache Kafka & PySpark',
      xp: '+150 XP',
      difficulty: 'Advanced',
      tasks: [
        'Configure Kafka broker and producers for event logging',
        'Set up PySpark Structured Streaming with watermarking',
        'Perform rolling window aggregations and anomaly detection',
        'Persist aggregates into PostgreSQL warehouse'
      ]
    }
  ];

  const toggleTask = (taskName: string) => {
    setCompletedTasks((prev) => ({ ...prev, [taskName]: !prev[taskName] }));
  };

  return (
    <div className="space-y-5 max-w-3xl mx-auto pb-6">
      {/* Track Selector Bar matching Screen 12 */}
      <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
        {tracks.map((t) => (
          <button
            key={t}
            onClick={() => setSelectedTrack(t)}
            className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
              selectedTrack === t
                ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md shadow-indigo-600/30'
                : 'bg-[#0b101e] text-slate-400 hover:text-white border border-slate-800'
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      {/* Vertical Stepper Roadmap matching Screen 12 */}
      <div className="bg-[#0b101e] border border-slate-800/80 rounded-3xl p-5 sm:p-6 shadow-xl space-y-6">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800/60">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-sky-400">Career Trajectory</span>
            <h2 className="text-base font-black text-white">{selectedTrack} Roadmap</h2>
          </div>
          <span className="text-xs font-bold text-emerald-400 bg-emerald-950/40 border border-emerald-800/40 px-3 py-1 rounded-full">
            Overall 55%
          </span>
        </div>

        {/* Milestone Steps with Connecting Lines */}
        <div className="relative space-y-6 pl-2">
          {/* Vertical Connecting Line */}
          <div className="absolute top-5 bottom-5 left-6 w-0.5 bg-slate-800 -translate-x-1/2 z-0" />
          <div className="absolute top-5 h-[65%] left-6 w-0.5 bg-gradient-to-b from-emerald-500 via-sky-500 to-indigo-500 -translate-x-1/2 z-0" />

          {milestones.map((m, idx) => (
            <div key={m.name} className="relative z-10 flex items-start gap-4">
              {/* Stepper Node Circle */}
              <div
                className={`h-9 w-9 rounded-full flex items-center justify-center font-bold text-xs shrink-0 shadow-lg border-2 ${m.bgColor} ${m.borderColor} ${m.color} ring-4 ring-[#0b101e]`}
              >
                {m.progress === 100 ? '✓' : idx + 1}
              </div>

              {/* Step Card */}
              <div className="flex-1 bg-[#0e1424] border border-slate-800/80 rounded-2xl p-3.5 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-extrabold text-white">
                    {m.name} ({m.progress}%)
                  </span>
                  <span className={`text-[10px] font-bold font-mono ${m.color}`}>
                    {m.status === 'completed' ? 'Done' : m.status === 'in-progress' ? 'Active' : 'Locked'}
                  </span>
                </div>

                <div className="text-[11px] text-slate-400 font-medium">
                  {m.skills}
                </div>

                {/* Progress bar */}
                <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
                  <div
                    className={`h-full rounded-full bg-gradient-to-r from-sky-400 to-indigo-500`}
                    style={{ width: `${m.progress}%` }}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Projects Section matching Screen 12 */}
      <div className="bg-[#0b101e] border border-slate-800/80 rounded-3xl p-5 shadow-xl space-y-3.5">
        <div className="flex items-center justify-between pb-2 border-b border-slate-800/60">
          <div className="flex items-center gap-2">
            <FolderGit2 className="h-4 w-4 text-sky-400" />
            <h3 className="text-xs font-bold text-white uppercase tracking-wider">Placement Projects</h3>
          </div>
          <span className="text-[11px] font-semibold text-slate-400 font-mono">2 Available</span>
        </div>

        <div className="space-y-2.5">
          {projects.map((proj, idx) => (
            <div
              key={idx}
              className="p-3.5 rounded-2xl bg-[#0e1424] border border-slate-800/80 hover:border-slate-700 flex items-center justify-between transition group"
            >
              <div className="space-y-0.5">
                <div className="text-xs font-bold text-white group-hover:text-sky-300 transition">
                  {proj.title}
                </div>
                <div className="text-[11px] text-slate-400">{proj.desc}</div>
              </div>

              <div className="flex items-center gap-2.5">
                <span className="text-[10px] font-bold font-mono px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-300 border border-amber-500/20">
                  {proj.xp}
                </span>
                <button
                  onClick={() => setActiveProjectModal(proj)}
                  className="px-3.5 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition shadow-sm"
                >
                  Start Project
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Project Checklist Modal */}
      {activeProjectModal && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#0b101e] border border-slate-700 rounded-3xl p-6 max-w-md w-full space-y-4 shadow-2xl">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
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

            <p className="text-xs text-slate-300">{activeProjectModal.desc}</p>

            <div className="space-y-2 pt-1">
              <div className="text-[11px] font-bold uppercase text-sky-400">Milestone Tasks:</div>
              {activeProjectModal.tasks.map((task, i) => {
                const isChecked = !!completedTasks[task];
                return (
                  <div
                    key={i}
                    onClick={() => toggleTask(task)}
                    className="p-2.5 rounded-xl bg-[#0e1424] border border-slate-800 text-xs flex items-center gap-2.5 cursor-pointer hover:border-slate-700 transition"
                  >
                    <div className={`h-4 w-4 rounded-md border flex items-center justify-center ${
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

            <div className="flex items-center justify-between pt-2 border-t border-slate-800/80">
              <span className="text-xs font-mono font-bold text-amber-400">
                Reward: {activeProjectModal.xp}
              </span>
              <button
                onClick={() => {
                  alert('Progress saved to portfolio roadmap!');
                  setActiveProjectModal(null);
                }}
                className="px-4 py-2 rounded-xl bg-blue-600 text-white text-xs font-bold"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
