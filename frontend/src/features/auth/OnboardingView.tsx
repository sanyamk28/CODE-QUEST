import React, { useState } from 'react';
import {
  Code2,
  Database,
  Bot,
  Cloud,
  Cpu,
  Layers,
  Smartphone,
  Shield,
  Clock,
  Sparkles,
  ArrowRight,
  CheckCircle2,
  TrendingUp,
  Target,
  Zap,
  Loader2,
  GraduationCap
} from 'lucide-react';
import { apiClient } from '../../services/api';

interface OnboardingViewProps {
  userName: string;
  initialRole?: string;
  onComplete: (role: string, name: string) => void;
}

interface RoleOption {
  id: string;
  title: string;
  description: string;
  icon: React.ElementType;
  color: string;
  borderColor: string;
  tags: string[];
}

const ROLES: RoleOption[] = [
  {
    id: 'Full Stack Developer',
    title: 'Full Stack Developer',
    description: 'Master frontend React, backend APIs, databases & full deployments',
    icon: Layers,
    color: 'from-blue-500 to-indigo-600',
    borderColor: 'border-blue-500/40 hover:border-blue-400',
    tags: ['React', 'Node / Python', 'SQL', 'APIs']
  },
  {
    id: 'Backend Engineer',
    title: 'Backend Systems Engineer',
    description: 'Design distributed architectures, microservices, caches & high throughput APIs',
    icon: Database,
    color: 'from-emerald-500 to-teal-600',
    borderColor: 'border-emerald-500/40 hover:border-emerald-400',
    tags: ['Python / Go', 'FastAPI', 'PostgreSQL', 'Redis']
  },
  {
    id: 'Frontend Engineer',
    title: 'Frontend / UI Engineer',
    description: 'Build responsive, pixel-perfect user interfaces, animations & state flows',
    icon: Code2,
    color: 'from-purple-500 to-pink-600',
    borderColor: 'border-purple-500/40 hover:border-purple-400',
    tags: ['React', 'TypeScript', 'Tailwind', 'Next.js']
  },
  {
    id: 'AI / Machine Learning Engineer',
    title: 'AI / ML Engineer',
    description: 'Develop LLM architectures, RAG pipelines, model evaluations & AI agents',
    icon: Bot,
    color: 'from-amber-500 to-orange-600',
    borderColor: 'border-amber-500/40 hover:border-amber-400',
    tags: ['PyTorch', 'LLMs', 'Vector DBs', 'Python']
  },
  {
    id: 'Cloud & DevOps Engineer',
    title: 'Cloud & DevOps Engineer',
    description: 'Automate CI/CD pipelines, container orchestration, Kubernetes & cloud infra',
    icon: Cloud,
    color: 'from-sky-500 to-cyan-600',
    borderColor: 'border-sky-500/40 hover:border-sky-400',
    tags: ['Docker', 'Kubernetes', 'AWS', 'Terraform']
  },
  {
    id: 'Data Engineer',
    title: 'Data Engineer & Analytics',
    description: 'Construct big data pipelines, warehouse schemas, ETL jobs & SQL models',
    icon: Cpu,
    color: 'from-rose-500 to-red-600',
    borderColor: 'border-rose-500/40 hover:border-rose-400',
    tags: ['SQL', 'Spark', 'Airflow', 'Snowflake']
  },
  {
    id: 'Mobile App Developer',
    title: 'Mobile App Developer',
    description: 'Craft cross-platform and native iOS & Android applications',
    icon: Smartphone,
    color: 'from-violet-500 to-indigo-600',
    borderColor: 'border-violet-500/40 hover:border-violet-400',
    tags: ['React Native', 'Flutter', 'Swift', 'Kotlin']
  },
  {
    id: 'Cybersecurity Engineer',
    title: 'Cybersecurity & AppSec',
    description: 'Protect applications, penetration testing, threat detection & secure coding',
    icon: Shield,
    color: 'from-teal-500 to-emerald-600',
    borderColor: 'border-teal-500/40 hover:border-teal-400',
    tags: ['AppSec', 'PenTesting', 'OWASP', 'Linux']
  }
];

const DURATIONS = [
  { value: 1, label: '1 Month', badge: 'Sprint', desc: 'Fast-track placement crash preparation' },
  { value: 3, label: '3 Months', badge: 'Standard', desc: 'Balanced mastery across DSA & core stacks' },
  { value: 6, label: '6 Months', badge: 'Comprehensive', desc: 'Deep dive with system design & company mocks' },
  { value: 12, label: '12 Months', badge: 'FAANG / Tier-1', desc: 'Long-term foundational interview mastery' },
];

const DAILY_GOALS = [
  { value: 1, label: '1-2 hrs / day', sub: 'Consistent & Steady' },
  { value: 3, label: '3-4 hrs / day', sub: 'Placement Sprint' },
  { value: 5, label: '5+ hrs / day', sub: 'Full-time Grind' },
];

export const OnboardingView: React.FC<OnboardingViewProps> = ({
  userName,
  initialRole = 'Software Engineer',
  onComplete,
}) => {
  const [selectedRole, setSelectedRole] = useState(
    ROLES.find(r => r.id === initialRole)?.id || 'Full Stack Developer'
  );
  const [customRole, setCustomRole] = useState('');
  const [isCustom, setIsCustom] = useState(false);
  const [prepDuration, setPrepDuration] = useState(3);
  const [dailyGoal, setDailyGoal] = useState(3);
  const [knowledgePercent, setKnowledgePercent] = useState<number>(50);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getKnowledgeTier = (pct: number) => {
    if (pct < 25) {
      return {
        level: 'Beginner / Novice',
        desc: 'Learning syntax, fundamentals, and core concepts',
        color: 'text-amber-400',
        badgeBg: 'bg-amber-500/10 border-amber-500/30'
      };
    }
    if (pct < 55) {
      return {
        level: 'Intermediate / Foundational',
        desc: 'Built basic projects, practicing core algorithms & APIs',
        color: 'text-sky-400',
        badgeBg: 'bg-sky-500/10 border-sky-500/30'
      };
    }
    if (pct < 80) {
      return {
        level: 'Proficient / Assessment Ready',
        desc: 'Confident with problem-solving, frameworks & technical rounds',
        color: 'text-indigo-400',
        badgeBg: 'bg-indigo-500/10 border-indigo-500/30'
      };
    }
    return {
      level: 'Advanced / Senior Track',
      desc: 'Deep architecture intuition, optimization & production ready',
      color: 'text-emerald-400',
      badgeBg: 'bg-emerald-500/10 border-emerald-500/30'
    };
  };

  const currentTier = getKnowledgeTier(knowledgePercent);
  const activeRoleName = isCustom ? (customRole.trim() || 'Software Engineer') : selectedRole;

  const handleFinish = async () => {
    setError(null);
    setLoading(true);

    try {
      const finalRole = isCustom ? (customRole.trim() || 'Software Engineer') : selectedRole;
      
      // Send onboarding details to backend to persist into database
      await apiClient.post('/auth/onboard', {
        name: userName || 'Student',
        target_role: finalRole,
        prep_duration: prepDuration,
        daily_study_goal: dailyGoal,
        knowledge_percent: knowledgePercent,
        skills: [finalRole, 'Problem Solving', 'Data Structures']
      });

      // Update local storage
      localStorage.setItem('cq_target_role', finalRole);
      localStorage.setItem('cq_study_duration', `${prepDuration} Months`);
      localStorage.setItem('cq_daily_goal', `${dailyGoal} hrs`);
      localStorage.setItem('cq_knowledge_percent', knowledgePercent.toString());
      localStorage.setItem('cq_onboarded', 'true');

      onComplete(finalRole, userName);
    } catch (err: any) {
      console.error('Onboarding save failed:', err);
      // Fallback save locally even if temporary network issue occurs
      const finalRole = isCustom ? (customRole.trim() || 'Software Engineer') : selectedRole;
      localStorage.setItem('cq_target_role', finalRole);
      localStorage.setItem('cq_onboarded', 'true');
      onComplete(finalRole, userName);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-[#070a13] text-slate-100 flex flex-col justify-start items-center p-4 sm:p-6 md:p-10 font-['Plus_Jakarta_Sans'] bg-tech-grid relative overflow-x-hidden">
      {/* Ambient background glows */}
      <div className="absolute top-10 left-1/3 w-96 h-96 bg-indigo-600/15 rounded-full blur-[130px] pointer-events-none" />
      <div className="absolute bottom-10 right-1/3 w-96 h-96 bg-purple-600/15 rounded-full blur-[130px] pointer-events-none" />

      {/* Main Container */}
      <div className="w-full max-w-4xl relative z-10 space-y-8 my-auto">
        {/* Header Section */}
        <div className="text-center space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-indigo-950/70 border border-indigo-700/50 text-indigo-300 text-xs font-semibold shadow-inner">
            <Sparkles className="h-3.5 w-3.5 text-sky-400 animate-spin" />
            <span>Welcome, {userName || 'Candidate'}! Step 2 of 2: Candidate Calibration</span>
          </div>
          <h1 className="text-2xl sm:text-4xl font-black tracking-tight text-white">
            Customize Your Career Preparation Path
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 max-w-xl mx-auto font-medium">
            Code Quest dynamically tailors coding problems, SQL labs, and AI interview simulations based on your targeted position and current skill level.
          </p>
        </div>

        {error && (
          <div className="p-3.5 rounded-xl bg-rose-950/40 border border-rose-800 text-xs text-rose-300 text-center">
            {error}
          </div>
        )}

        {/* STEP 1: TARGET ROLE SELECTION */}
        <div className="p-6 sm:p-8 rounded-3xl bg-[#090e1c]/90 border border-slate-800/90 shadow-2xl backdrop-blur-xl space-y-5">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800/80">
            <div className="flex items-center gap-3">
              <div className="h-9 w-9 rounded-xl bg-blue-600/20 border border-blue-500/40 flex items-center justify-center text-blue-400 font-bold text-sm">
                1
              </div>
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <span>Choose Your Target Role / Position</span>
                  <Target className="h-4 w-4 text-sky-400" />
                </h3>
                <p className="text-xs text-slate-400">Select the engineering profile you want to prepare and interview for</p>
              </div>
            </div>
            <span className="text-xs font-mono text-indigo-400 bg-indigo-950/60 px-2.5 py-1 rounded-lg border border-indigo-800/50 hidden sm:inline-block">
              {activeRoleName}
            </span>
          </div>

          {/* Role Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
            {ROLES.map((r) => {
              const Icon = r.icon;
              const isSelected = !isCustom && selectedRole === r.id;
              return (
                <button
                  key={r.id}
                  type="button"
                  onClick={() => {
                    setIsCustom(false);
                    setSelectedRole(r.id);
                  }}
                  className={`p-4 rounded-2xl text-left border transition-all duration-200 relative group flex flex-col justify-between h-40 ${
                    isSelected
                      ? 'bg-gradient-to-b from-indigo-950/90 to-[#0c142b] border-indigo-500 shadow-lg shadow-indigo-600/20 scale-[1.02]'
                      : 'bg-[#0d1426]/60 border-slate-800 hover:border-slate-700 hover:bg-[#0f172e]'
                  }`}
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className={`h-8 w-8 rounded-xl bg-gradient-to-tr ${r.color} flex items-center justify-center shadow-md`}>
                        <Icon className="h-4 w-4 text-white" />
                      </div>
                      {isSelected && (
                        <CheckCircle2 className="h-4 w-4 text-sky-400" />
                      )}
                    </div>
                    <div className="font-bold text-xs text-slate-100 group-hover:text-white leading-snug">
                      {r.title}
                    </div>
                    <div className="text-[10px] text-slate-400 line-clamp-2 leading-relaxed">
                      {r.description}
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-1 mt-2">
                    {r.tags.slice(0, 2).map((t) => (
                      <span key={t} className="text-[9px] px-1.5 py-0.5 rounded bg-slate-900 border border-slate-800 text-slate-400 font-mono">
                        {t}
                      </span>
                    ))}
                  </div>
                </button>
              );
            })}
          </div>

          {/* Custom Role Input Accordion */}
          <div className="pt-2">
            <button
              type="button"
              onClick={() => setIsCustom(!isCustom)}
              className="text-xs text-sky-400 hover:text-sky-300 font-semibold flex items-center gap-1.5 transition"
            >
              <span>+ Enter a custom position not listed above</span>
            </button>
            {isCustom && (
              <div className="mt-3 animate-in fade-in slide-in-from-top-2 duration-200">
                <input
                  type="text"
                  value={customRole}
                  onChange={(e) => setCustomRole(e.target.value)}
                  placeholder="e.g. Quantitative Developer, Blockchain Architect, Game Engine Engineer..."
                  className="w-full px-4 py-3 rounded-xl bg-[#0c1326] border border-indigo-500/60 text-xs text-white placeholder-slate-500 outline-none focus:border-indigo-400 transition"
                  autoFocus
                />
              </div>
            )}
          </div>
        </div>

        {/* STEP 2: STUDY DURATION & DAILY TIME */}
        <div className="p-6 sm:p-8 rounded-3xl bg-[#090e1c]/90 border border-slate-800/90 shadow-2xl backdrop-blur-xl space-y-5">
          <div className="flex items-center gap-3 pb-3 border-b border-slate-800/80">
            <div className="h-9 w-9 rounded-xl bg-purple-600/20 border border-purple-500/40 flex items-center justify-center text-purple-400 font-bold text-sm">
              2
            </div>
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <span>Preparation Duration & Daily Study Commitment</span>
                <Clock className="h-4 w-4 text-purple-400" />
              </h3>
              <p className="text-xs text-slate-400">Choose your targeted target timeline and how many hours you plan to dedicate</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Timeline Selection */}
            <div className="space-y-2.5">
              <label className="text-xs font-bold text-slate-300 block">
                Target Timeline:
              </label>
              <div className="grid grid-cols-2 gap-2.5">
                {DURATIONS.map((dur) => (
                  <button
                    key={dur.value}
                    type="button"
                    onClick={() => setPrepDuration(dur.value)}
                    className={`p-3 rounded-xl border text-left transition-all ${
                      prepDuration === dur.value
                        ? 'bg-indigo-950/70 border-indigo-500 shadow-md shadow-indigo-600/20'
                        : 'bg-[#0c1326] border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-white">{dur.label}</span>
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-indigo-900/60 text-indigo-300 font-medium">
                        {dur.badge}
                      </span>
                    </div>
                    <p className="text-[10px] text-slate-400 mt-1 line-clamp-1">{dur.desc}</p>
                  </button>
                ))}
              </div>
            </div>

            {/* Daily Hours Selection */}
            <div className="space-y-2.5">
              <label className="text-xs font-bold text-slate-300 block">
                Daily Study Goal:
              </label>
              <div className="grid grid-cols-3 gap-2.5">
                {DAILY_GOALS.map((g) => (
                  <button
                    key={g.value}
                    type="button"
                    onClick={() => setDailyGoal(g.value)}
                    className={`p-3 rounded-xl border text-center transition-all ${
                      dailyGoal === g.value
                        ? 'bg-purple-950/70 border-purple-500 shadow-md shadow-purple-600/20'
                        : 'bg-[#0c1326] border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    <div className="text-xs font-bold text-white">{g.label}</div>
                    <div className="text-[9px] text-purple-300 mt-1">{g.sub}</div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* STEP 3: KNOWLEDGE PERCENTAGE GAUGE */}
        <div className="p-6 sm:p-8 rounded-3xl bg-[#090e1c]/90 border border-slate-800/90 shadow-2xl backdrop-blur-xl space-y-6">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800/80">
            <div className="flex items-center gap-3">
              <div className="h-9 w-9 rounded-xl bg-emerald-600/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 font-bold text-sm">
                3
              </div>
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <span>Knowledge Level in this Position</span>
                  <TrendingUp className="h-4 w-4 text-emerald-400" />
                </h3>
                <p className="text-xs text-slate-400">
                  Rate your current understanding and familiarity with {activeRoleName}
                </p>
              </div>
            </div>

            {/* Live Percentage Pill */}
            <div className="px-4 py-2 rounded-2xl bg-gradient-to-r from-emerald-950 to-indigo-950 border border-emerald-600/50 flex items-center gap-2">
              <Zap className="h-4 w-4 text-emerald-400 fill-emerald-400" />
              <span className="text-xl font-black text-white">{knowledgePercent}%</span>
            </div>
          </div>

          {/* Slider & Level Indicator */}
          <div className="space-y-4">
            <div className="space-y-2">
              <input
                type="range"
                min={0}
                max={100}
                step={5}
                value={knowledgePercent}
                onChange={(e) => setKnowledgePercent(Number(e.target.value))}
                className="w-full h-3 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-indigo-500"
              />
              <div className="flex justify-between text-[11px] font-mono text-slate-500 px-1">
                <span>0% (Absolute Beginner)</span>
                <span>50% (Intermediate)</span>
                <span>100% (Senior / Expert)</span>
              </div>
            </div>

            {/* Dynamic Status Feedback Card */}
            <div className={`p-4 rounded-2xl border ${currentTier.badgeBg} flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3`}>
              <div className="space-y-1">
                <div className={`text-sm font-bold ${currentTier.color} flex items-center gap-2`}>
                  <GraduationCap className="h-4 w-4" />
                  <span>Tier: {currentTier.level}</span>
                </div>
                <p className="text-xs text-slate-300">
                  {currentTier.desc}
                </p>
              </div>
              <div className="text-xs text-slate-400 font-mono bg-slate-900/80 px-3 py-1.5 rounded-xl border border-slate-800">
                Estimated Readiness: <strong className="text-white">{knowledgePercent}%</strong>
              </div>
            </div>
          </div>
        </div>

        {/* Submit Button */}
        <div className="pt-2 pb-8">
          <button
            type="button"
            onClick={handleFinish}
            disabled={loading}
            className="w-full py-4 px-8 rounded-2xl bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-500 hover:to-indigo-500 disabled:opacity-50 text-white font-extrabold text-sm shadow-2xl shadow-indigo-600/40 transition transform active:scale-[0.99] flex items-center justify-center gap-2.5"
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Saving Your Learning Profile...</span>
              </>
            ) : (
              <>
                <span>Launch My Custom Dashboard ({activeRoleName})</span>
                <ArrowRight className="h-4 w-4" />
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
