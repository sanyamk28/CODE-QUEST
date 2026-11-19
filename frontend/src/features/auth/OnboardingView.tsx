import React, { useState, useRef } from 'react';
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
  ArrowLeft,
  CheckCircle2,
  TrendingUp,
  Target,
  Zap,
  Loader2,
  GraduationCap,
  Building2,
  BookOpen,
  Camera,
  Upload,
  Trash2,
  Plus,
  X,
  Check,
  Smile
} from 'lucide-react';
import { apiClient } from '../../services/api';
import { showToast } from '../../components/Toast';

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

const POPULAR_COLLEGES = [
  'IIT Delhi', 'DTU', 'NSUT', 'BITS Pilani', 'VIT Vellore', 'NIT Trichy', 'IIIT Hyderabad', 'JIMS Rohini', 'SRM University'
];

const POPULAR_DEGREES = [
  'B.Tech CSE', 'B.Tech IT', 'MCA', 'BCA', 'B.Sc Computer Science', 'M.Tech', 'B.E. Computer Engineering'
];

const DEFAULT_LANGUAGES = [
  'Python', 'Java', 'C++', 'C', 'JavaScript', 'TypeScript', 'SQL', 'Go', 'Rust', 'Kotlin', 'Swift', 'HTML / CSS', 'React', 'Node.js'
];

const PRESET_AVATARS = ['🤖', '🚀', '💻', '⚡', '🛡️', '🎓', '🎯', '🦁'];

export const OnboardingView: React.FC<OnboardingViewProps> = ({
  userName,
  initialRole = 'Full Stack Developer',
  onComplete,
}) => {
  // Step navigation (1: Academic & Profile, 2: Career Track & Goals)
  const [currentStep, setCurrentStep] = useState<1 | 2>(1);

  // Step 1: Academic & Profile fields
  const [college, setCollege] = useState<string>(() => localStorage.getItem('cq_user_college') || '');
  const [degree, setDegree] = useState<string>(() => localStorage.getItem('cq_user_degree') || '');
  const [avatar, setAvatar] = useState<string>(() => localStorage.getItem('cq_user_avatar') || '');
  const [selectedSkills, setSelectedSkills] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('cq_user_skills');
      return saved ? JSON.parse(saved) : ['Python', 'SQL', 'JavaScript'];
    } catch {
      return ['Python', 'SQL', 'JavaScript'];
    }
  });
  const [customSkillInput, setCustomSkillInput] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Step 2: Career Track fields
  const [selectedRole, setSelectedRole] = useState(
    ROLES.find(r => r.id === initialRole)?.id || 'Full Stack Developer'
  );
  const [customRole, setCustomRole] = useState('');
  const [isCustomRole, setIsCustomRole] = useState(false);
  const [prepDuration, setPrepDuration] = useState(3);
  const [dailyGoal, setDailyGoal] = useState(3);
  const [knowledgePercent, setKnowledgePercent] = useState<number>(50);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Compress & resize uploaded photo to under 40KB (max 256x256)
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      showToast('Please select a valid image file (JPG, PNG, WebP)', 'error');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const maxDim = 256;
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > maxDim) {
            height = Math.round((height * maxDim) / width);
            width = maxDim;
          }
        } else {
          if (height > maxDim) {
            width = Math.round((width * maxDim) / height);
            height = maxDim;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0, width, height);
          const dataUrl = canvas.toDataURL('image/jpeg', 0.85);
          setAvatar(dataUrl);
          showToast('Profile photo selected!', 'success');
        }
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  const handleSelectPresetAvatar = (emoji: string) => {
    // Generate avatar SVG as data URI
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="128" height="128" viewBox="0 0 128 128"><rect width="100%" height="100%" rx="32" fill="#0f172a"/><text x="50%" y="54%" font-size="64" dominant-baseline="middle" text-anchor="middle">${emoji}</text></svg>`;
    const dataUri = `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
    setAvatar(dataUri);
    showToast(`Avatar updated with ${emoji}`, 'info');
  };

  const toggleSkill = (skill: string) => {
    if (selectedSkills.includes(skill)) {
      setSelectedSkills(prev => prev.filter(s => s !== skill));
    } else {
      setSelectedSkills(prev => [...prev, skill]);
    }
  };

  const handleAddCustomSkill = () => {
    const trimmed = customSkillInput.trim();
    if (trimmed && !selectedSkills.includes(trimmed)) {
      setSelectedSkills(prev => [...prev, trimmed]);
      setCustomSkillInput('');
    }
  };

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
  const activeRoleName = isCustomRole ? (customRole.trim() || 'Software Engineer') : selectedRole;

  const validateStep1 = () => {
    if (!college.trim()) {
      setError('Please enter or select your College / University name.');
      return false;
    }
    if (!degree.trim()) {
      setError('Please select or specify your Degree / Program.');
      return false;
    }
    if (selectedSkills.length === 0) {
      setError('Please select at least 1 programming language or technology you know.');
      return false;
    }
    setError(null);
    return true;
  };

  const handleNextToStep2 = () => {
    if (validateStep1()) {
      setCurrentStep(2);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleFinish = async () => {
    setError(null);
    setLoading(true);

    try {
      const finalRole = isCustomRole ? (customRole.trim() || 'Software Engineer') : selectedRole;
      const cleanCollege = college.trim();
      const cleanDegree = degree.trim();

      // Save locally first for instant offline responsiveness
      localStorage.setItem('cq_user_college', cleanCollege);
      localStorage.setItem('cq_user_degree', cleanDegree);
      localStorage.setItem('cq_user_skills', JSON.stringify(selectedSkills));
      if (avatar) {
        localStorage.setItem('cq_user_avatar', avatar);
      }
      localStorage.setItem('cq_target_role', finalRole);
      localStorage.setItem('cq_study_duration', `${prepDuration} Months`);
      localStorage.setItem('cq_daily_goal', `${dailyGoal} hrs`);
      localStorage.setItem('cq_knowledge_percent', knowledgePercent.toString());
      localStorage.setItem('cq_onboarded', 'true');

      // Dispatch global profile updated event
      window.dispatchEvent(new CustomEvent('cq_profile_updated'));

      // Send to backend to persist into Postgres DB
      await apiClient.post('/auth/onboard', {
        name: userName || 'Candidate',
        college: cleanCollege,
        degree: cleanDegree,
        skills: selectedSkills,
        target_role: finalRole,
        prep_duration: prepDuration,
        daily_study_goal: dailyGoal,
        knowledge_percent: knowledgePercent
      });

      showToast('Academic profile calibrated successfully!', 'success');
      onComplete(finalRole, userName);
    } catch (err: any) {
      console.error('Onboarding sync note:', err);
      // Fallback works seamlessly even if offline
      const finalRole = isCustomRole ? (customRole.trim() || 'Software Engineer') : selectedRole;
      localStorage.setItem('cq_target_role', finalRole);
      localStorage.setItem('cq_onboarded', 'true');
      window.dispatchEvent(new CustomEvent('cq_profile_updated'));
      onComplete(finalRole, userName);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-[#06080F] text-slate-100 flex flex-col justify-start items-center p-4 sm:p-6 md:p-10 font-['Plus_Jakarta_Sans'] bg-tech-grid relative overflow-x-hidden">
      {/* Ambient background glows */}
      <div className="absolute top-10 left-1/3 w-96 h-96 bg-cyan-500/15 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute bottom-10 right-1/3 w-96 h-96 bg-indigo-600/20 rounded-full blur-[140px] pointer-events-none" />

      {/* Main Container */}
      <div className="w-full max-w-4xl relative z-10 space-y-6 my-auto">
        {/* Header Section */}
        <div className="text-center space-y-3">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-cyan-950/50 border border-cyan-500/40 text-cyan-300 text-xs font-semibold shadow-inner shadow-cyan-950/50">
            <Sparkles className="h-3.5 w-3.5 text-cyan-400 animate-spin" />
            <span>Welcome, {userName || 'Candidate'}! Candidate Profile & Career Calibration</span>
          </div>
          <h1 className="text-2xl sm:text-4xl font-black tracking-tight text-white">
            Set Up Your Student Profile
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 max-w-xl mx-auto font-medium">
            Personalize your academic background, known languages, and targeted engineering track.
          </p>

          {/* Stepper Indicator */}
          <div className="flex items-center justify-center gap-3 pt-2">
            <button
              onClick={() => setCurrentStep(1)}
              className={`flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-bold transition border ${
                currentStep === 1
                  ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/50 shadow-md shadow-cyan-500/20'
                  : 'bg-slate-900/60 text-slate-400 border-slate-800 hover:text-white'
              }`}
            >
              <GraduationCap className="h-3.5 w-3.5" />
              <span>1. Academic & Tech Profile</span>
            </button>

            <span className="text-slate-600">→</span>

            <button
              onClick={() => {
                if (validateStep1()) setCurrentStep(2);
              }}
              className={`flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-bold transition border ${
                currentStep === 2
                  ? 'bg-indigo-500/20 text-indigo-300 border-indigo-500/50 shadow-md shadow-indigo-500/20'
                  : 'bg-slate-900/60 text-slate-400 border-slate-800 hover:text-white'
              }`}
            >
              <Target className="h-3.5 w-3.5" />
              <span>2. Career Track & Goals</span>
            </button>
          </div>
        </div>

        {error && (
          <div className="p-3.5 rounded-2xl bg-rose-950/40 border border-rose-800 text-xs text-rose-300 text-center font-medium shadow-md">
            ⚠️ {error}
          </div>
        )}

        {/* ================= STEP 1: ACADEMIC & PROFILE DETAILS ================= */}
        {currentStep === 1 && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
            {/* Card A: Profile Picture & Avatar */}
            <div className="p-6 sm:p-7 rounded-3xl bg-[#0B0F1C]/95 border border-cyan-500/20 shadow-2xl backdrop-blur-xl space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800/80">
                <div className="flex items-center gap-3">
                  <div className="h-9 w-9 rounded-xl bg-cyan-600/20 border border-cyan-500/40 flex items-center justify-center text-cyan-400 font-bold text-sm">
                    <Camera className="h-4 w-4" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-white">Profile Picture / Avatar</h3>
                    <p className="text-xs text-slate-400">Upload your photo or select a developer avatar badge</p>
                  </div>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row items-center gap-6 pt-2">
                {/* Avatar Preview Box */}
                <div className="relative group shrink-0">
                  <div className="h-24 w-24 rounded-3xl bg-gradient-to-tr from-cyan-400 via-blue-500 to-indigo-600 p-0.5 shadow-xl shadow-cyan-500/20">
                    <div className="h-full w-full bg-[#090D18] rounded-[22px] flex items-center justify-center overflow-hidden">
                      {avatar ? (
                        <img src={avatar} alt="Profile" className="h-full w-full object-cover" />
                      ) : (
                        <span className="font-black text-2xl text-white">
                          {userName ? userName.substring(0, 2).toUpperCase() : 'ST'}
                        </span>
                      )}
                    </div>
                  </div>
                  <span className="absolute -bottom-1 -right-1 h-5 w-5 rounded-full bg-emerald-400 ring-4 ring-[#090D18]" />
                </div>

                {/* Upload & Preset Options */}
                <div className="space-y-3 flex-1 text-center sm:text-left">
                  <div className="flex flex-wrap items-center gap-2.5 justify-center sm:justify-start">
                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={handleImageUpload}
                      accept="image/*"
                      className="hidden"
                    />
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="px-4 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs flex items-center gap-1.5 transition shadow-md shadow-cyan-600/30"
                    >
                      <Upload className="h-3.5 w-3.5" />
                      <span>Upload Photo from Device</span>
                    </button>

                    {avatar && (
                      <button
                        type="button"
                        onClick={() => setAvatar('')}
                        className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-rose-950/60 hover:text-rose-400 text-slate-300 font-medium text-xs flex items-center gap-1 transition border border-slate-700"
                        title="Remove photo"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                        <span>Remove</span>
                      </button>
                    )}
                  </div>

                  {/* Preset Avatars */}
                  <div className="space-y-1.5 pt-1">
                    <span className="text-[11px] font-semibold text-slate-400 block">
                      Or pick a developer avatar:
                    </span>
                    <div className="flex flex-wrap items-center gap-2 justify-center sm:justify-start">
                      {PRESET_AVATARS.map((emoji) => (
                        <button
                          key={emoji}
                          type="button"
                          onClick={() => handleSelectPresetAvatar(emoji)}
                          className="h-9 w-9 rounded-xl bg-[#0f172a] hover:bg-cyan-950/50 border border-slate-800 hover:border-cyan-500/40 text-lg flex items-center justify-center transition active:scale-95 shadow-sm"
                        >
                          {emoji}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Card B: College & Degree */}
            <div className="p-6 sm:p-7 rounded-3xl bg-[#0B0F1C]/95 border border-cyan-500/20 shadow-2xl backdrop-blur-xl space-y-5">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800/80">
                <div className="flex items-center gap-3">
                  <div className="h-9 w-9 rounded-xl bg-indigo-600/20 border border-indigo-500/40 flex items-center justify-center text-indigo-400 font-bold text-sm">
                    <Building2 className="h-4 w-4" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-white">College & Degree / Program</h3>
                    <p className="text-xs text-slate-400">Specify your university and the degree you are pursuing</p>
                  </div>
                </div>
              </div>

              {/* College Input & Quick Chips */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                  <span>College / University Name</span>
                  <span className="text-rose-400">*</span>
                </label>
                <input
                  type="text"
                  value={college}
                  onChange={(e) => setCollege(e.target.value)}
                  placeholder="e.g. Delhi Technological University (DTU), IIT Bombay, VIT, JIMS Rohini..."
                  className="w-full px-4 py-3 rounded-xl bg-[#0c1326] border border-cyan-500/40 text-xs text-white placeholder-slate-500 outline-none focus:border-cyan-400 transition"
                />
                {/* Popular College Suggestions */}
                <div className="flex flex-wrap gap-1.5 pt-1">
                  <span className="text-[10px] text-slate-500 font-mono self-center mr-1">Suggestions:</span>
                  {POPULAR_COLLEGES.map((c) => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => setCollege(c)}
                      className={`text-[10px] px-2.5 py-1 rounded-lg border font-medium transition ${
                        college === c
                          ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/50'
                          : 'bg-slate-900/60 text-slate-400 border-slate-800 hover:text-white'
                      }`}
                    >
                      {c}
                    </button>
                  ))}
                </div>
              </div>

              {/* Degree Input & Quick Chips */}
              <div className="space-y-2 pt-2">
                <label className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                  <span>Degree & Branch / Specialization</span>
                  <span className="text-rose-400">*</span>
                </label>
                <input
                  type="text"
                  value={degree}
                  onChange={(e) => setDegree(e.target.value)}
                  placeholder="e.g. B.Tech Computer Science, MCA 2nd Year, BCA..."
                  className="w-full px-4 py-3 rounded-xl bg-[#0c1326] border border-indigo-500/40 text-xs text-white placeholder-slate-500 outline-none focus:border-indigo-400 transition"
                />
                {/* Popular Degree Suggestions */}
                <div className="flex flex-wrap gap-1.5 pt-1">
                  <span className="text-[10px] text-slate-500 font-mono self-center mr-1">Suggestions:</span>
                  {POPULAR_DEGREES.map((d) => (
                    <button
                      key={d}
                      type="button"
                      onClick={() => setDegree(d)}
                      className={`text-[10px] px-2.5 py-1 rounded-lg border font-medium transition ${
                        degree === d
                          ? 'bg-indigo-500/20 text-indigo-300 border-indigo-500/50'
                          : 'bg-slate-900/60 text-slate-400 border-slate-800 hover:text-white'
                      }`}
                    >
                      {d}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Card C: Technical Languages & Stacks Known */}
            <div className="p-6 sm:p-7 rounded-3xl bg-[#0B0F1C]/95 border border-cyan-500/20 shadow-2xl backdrop-blur-xl space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800/80">
                <div className="flex items-center gap-3">
                  <div className="h-9 w-9 rounded-xl bg-purple-600/20 border border-purple-500/40 flex items-center justify-center text-purple-400 font-bold text-sm">
                    <Code2 className="h-4 w-4" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-white">Programming Languages & Technologies Known</h3>
                    <p className="text-xs text-slate-400">Select all languages and frameworks you have practiced</p>
                  </div>
                </div>
                <span className="text-xs font-mono text-purple-300 bg-purple-950/60 px-2.5 py-1 rounded-lg border border-purple-800/50">
                  {selectedSkills.length} selected
                </span>
              </div>

              {/* Interactive Chips */}
              <div className="flex flex-wrap gap-2 pt-1">
                {DEFAULT_LANGUAGES.map((lang) => {
                  const isSelected = selectedSkills.includes(lang);
                  return (
                    <button
                      key={lang}
                      type="button"
                      onClick={() => toggleSkill(lang)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 border ${
                        isSelected
                          ? 'bg-gradient-to-r from-cyan-500/20 to-indigo-500/20 text-cyan-300 border-cyan-400 shadow-[0_0_12px_rgba(0,229,255,0.25)] scale-[1.03]'
                          : 'bg-[#0d1426]/70 text-slate-400 border-slate-800 hover:border-slate-700 hover:text-white'
                      }`}
                    >
                      {isSelected && <Check className="h-3 w-3 text-cyan-400" />}
                      <span>{lang}</span>
                    </button>
                  );
                })}
              </div>

              {/* Add Custom Skill Field */}
              <div className="pt-2 flex items-center gap-2">
                <input
                  type="text"
                  value={customSkillInput}
                  onChange={(e) => setCustomSkillInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleAddCustomSkill()}
                  placeholder="+ Add any other language or tool (e.g. Flutter, GraphQL, C#, Rust...)"
                  className="flex-1 px-4 py-2.5 rounded-xl bg-[#0c1326] border border-slate-800 text-xs text-white placeholder-slate-500 outline-none focus:border-cyan-400 transition"
                />
                <button
                  type="button"
                  onClick={handleAddCustomSkill}
                  className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs transition flex items-center gap-1"
                >
                  <Plus className="h-3.5 w-3.5" />
                  <span>Add</span>
                </button>
              </div>
            </div>

            {/* Next Step Button */}
            <div className="pt-2 pb-6">
              <button
                type="button"
                onClick={handleNextToStep2}
                className="w-full py-4 px-8 rounded-2xl bg-gradient-to-r from-cyan-500 via-blue-600 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-white font-extrabold text-sm shadow-xl shadow-cyan-600/30 transition transform active:scale-[0.99] flex items-center justify-center gap-2"
              >
                <span>Continue to Step 2: Career Track & Goals</span>
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}

        {/* ================= STEP 2: TARGET ROLE & STUDY COMMITMENT ================= */}
        {currentStep === 2 && (
          <div className="space-y-6 animate-in fade-in slide-in-from-right-2 duration-300">
            {/* Step 2A: Target Role Selection */}
            <div className="p-6 sm:p-8 rounded-3xl bg-[#0B0F1C]/95 border border-cyan-500/20 shadow-2xl backdrop-blur-xl space-y-5">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800/80">
                <div className="flex items-center gap-3">
                  <div className="h-9 w-9 rounded-xl bg-blue-600/20 border border-blue-500/40 flex items-center justify-center text-blue-400 font-bold text-sm">
                    2
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
                  const isSelected = !isCustomRole && selectedRole === r.id;
                  return (
                    <button
                      key={r.id}
                      type="button"
                      onClick={() => {
                        setIsCustomRole(false);
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
                  onClick={() => setIsCustomRole(!isCustomRole)}
                  className="text-xs text-sky-400 hover:text-sky-300 font-semibold flex items-center gap-1.5 transition"
                >
                  <span>+ Enter a custom position not listed above</span>
                </button>
                {isCustomRole && (
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

            {/* Step 2B: Study Duration & Daily Time */}
            <div className="p-6 sm:p-8 rounded-3xl bg-[#090e1c]/90 border border-slate-800/90 shadow-2xl backdrop-blur-xl space-y-5">
              <div className="flex items-center gap-3 pb-3 border-b border-slate-800/80">
                <div className="h-9 w-9 rounded-xl bg-purple-600/20 border border-purple-500/40 flex items-center justify-center text-purple-400 font-bold text-sm">
                  <Clock className="h-4 w-4" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white flex items-center gap-2">
                    <span>Preparation Duration & Daily Study Commitment</span>
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

            {/* Step 2C: Knowledge Level Slider */}
            <div className="p-6 sm:p-8 rounded-3xl bg-[#090e1c]/90 border border-slate-800/90 shadow-2xl backdrop-blur-xl space-y-6">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800/80">
                <div className="flex items-center gap-3">
                  <div className="h-9 w-9 rounded-xl bg-emerald-600/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 font-bold text-sm">
                    <TrendingUp className="h-4 w-4" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-white flex items-center gap-2">
                      <span>Knowledge Level in this Position</span>
                    </h3>
                    <p className="text-xs text-slate-400">
                      Rate your current familiarity with {activeRoleName}
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

            {/* Navigation & Submit Buttons */}
            <div className="pt-2 pb-8 flex flex-col sm:flex-row items-center gap-3">
              <button
                type="button"
                onClick={() => setCurrentStep(1)}
                className="w-full sm:w-auto px-6 py-4 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs flex items-center justify-center gap-2 transition"
              >
                <ArrowLeft className="h-4 w-4" />
                <span>Back to Academic Profile</span>
              </button>

              <button
                type="button"
                onClick={handleFinish}
                disabled={loading}
                className="flex-1 w-full py-4 px-8 rounded-2xl bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-500 hover:to-indigo-500 disabled:opacity-50 text-white font-extrabold text-sm shadow-2xl shadow-indigo-600/40 transition transform active:scale-[0.99] flex items-center justify-center gap-2.5"
              >
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Saving Your Learning Profile...</span>
                  </>
                ) : (
                  <>
                    <span>Complete Setup & Launch Dashboard ({activeRoleName})</span>
                    <ArrowRight className="h-4 w-4" />
                  </>
                )}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
