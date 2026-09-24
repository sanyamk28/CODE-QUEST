import React, { useRef } from 'react';
import {
  FileText, Target, ChevronUp, ChevronDown, Briefcase, UploadCloud, AlertCircle,
  RefreshCw, Sparkles, CheckCheck, Printer, TrendingUp, Layers, FileCheck,
  UserCheck, Mail, Phone, Linkedin, Github, Globe, CheckCircle2, Check, ArrowRight
} from 'lucide-react';

interface ResumeAtsViewProps {
  resumeTargetRole: string;
  targetRole: string;
  showJdMatcher: boolean;
  resumeJobDescription: string;
  resumeFile: File | null;
  resumeFileName: string;
  resumeFileSize: string;
  resumeUploading: boolean;
  resumeError: string | null;
  resumeAnalysisResult: any | null;
  activeResumeTab: 'audit' | 'skills' | 'bullets' | 'readability';
  onToggleJdMatcher: () => void;
  onTargetRoleChange: (role: string) => void;
  onJdChange: (jd: string) => void;
  onFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onScanResume: () => void;
  onSelectResumeTab: (tab: 'audit' | 'skills' | 'bullets' | 'readability') => void;
}

export const ResumeAtsView: React.FC<ResumeAtsViewProps> = ({
  resumeTargetRole,
  targetRole,
  showJdMatcher,
  resumeJobDescription,
  resumeFile,
  resumeFileName,
  resumeFileSize,
  resumeUploading,
  resumeError,
  resumeAnalysisResult,
  activeResumeTab,
  onToggleJdMatcher,
  onTargetRoleChange,
  onJdChange,
  onFileChange,
  onScanResume,
  onSelectResumeTab,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const roles = [
    'Software Engineer',
    'Backend Developer',
    'Frontend Developer',
    'Full Stack Developer',
    'Data Scientist',
    'Data Engineer',
    'DevOps Engineer',
    'Mobile Developer',
    'Cybersecurity Analyst',
  ];

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-5">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-4">
          <div>
            <h2 className="text-xl font-black text-white flex items-center gap-2">
              <FileText className="h-6 w-6 text-sky-400" /> AI Resume ATS Match & Keyword Optimizer
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              Authentic multi-factor ATS score calculated directly from your resume PDF: keyword alignment, quantifiable metrics, contact parser, and Google X-Y-Z bullet rewrites.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={onToggleJdMatcher}
              className={`px-3 py-1.5 rounded-xl border text-xs font-semibold flex items-center gap-1.5 transition ${
                showJdMatcher || resumeJobDescription.trim()
                  ? 'bg-sky-500/20 text-sky-300 border-sky-500/40'
                  : 'bg-slate-800 text-slate-400 border-slate-700 hover:text-white'
              }`}
            >
              <Target className="h-3.5 w-3.5" />
              <span>Job Description Matcher</span>
              {resumeJobDescription.trim() ? (
                <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
              ) : showJdMatcher ? (
                <ChevronUp className="h-3.5 w-3.5" />
              ) : (
                <ChevronDown className="h-3.5 w-3.5" />
              )}
            </button>
          </div>
        </div>

        {/* Role Selector Pills */}
        <div className="space-y-2">
          <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
            <Briefcase className="h-3.5 w-3.5 text-sky-400" /> Target Engineering Track
          </div>
          <div className="flex flex-wrap gap-2">
            {roles.map((role) => (
              <button
                key={role}
                onClick={() => onTargetRoleChange(role)}
                className={`px-3 py-1.5 rounded-xl text-xs font-medium transition ${
                  (resumeTargetRole || targetRole) === role
                    ? 'bg-gradient-to-r from-sky-600 to-indigo-600 text-white font-bold shadow-md shadow-sky-600/30 scale-105'
                    : 'bg-slate-950/70 border border-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-700'
                }`}
              >
                {role}
              </button>
            ))}
          </div>
        </div>

        {/* Optional Job Description Matcher */}
        {showJdMatcher && (
          <div className="p-4 rounded-xl bg-slate-950/80 border border-sky-500/30 space-y-2.5 transition animate-fadeIn">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-sky-300 flex items-center gap-1.5">
                <Target className="h-4 w-4 text-sky-400" /> Target Job Description (Optional)
              </span>
              <span className="text-[11px] text-slate-400">{resumeJobDescription.length} characters</span>
            </div>
            <textarea
              value={resumeJobDescription}
              onChange={(e) => onJdChange(e.target.value)}
              placeholder="Paste the job posting description here... The ATS engine will extract demanded tech skills and compute an exact JD match percentage..."
              rows={3}
              className="w-full p-3 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-200 focus:outline-none focus:border-sky-500 placeholder-slate-500"
            />
            {resumeJobDescription.trim() && (
              <div className="flex justify-end">
                <button onClick={() => onJdChange('')} className="text-[11px] text-rose-400 hover:underline">
                  Clear JD
                </button>
              </div>
            )}
          </div>
        )}

        {/* Upload Box */}
        <input type="file" ref={fileInputRef} accept=".pdf" onChange={onFileChange} className="hidden" />

        <div
          onClick={() => fileInputRef.current?.click()}
          className="border-2 border-dashed border-slate-800 hover:border-sky-500/60 p-6 rounded-2xl text-center space-y-2.5 bg-slate-950/60 cursor-pointer transition group"
        >
          <div className="inline-flex p-3 rounded-2xl bg-sky-500/10 text-sky-400 group-hover:scale-110 transition shadow-inner">
            <UploadCloud className="h-8 w-8" />
          </div>
          <div>
            <div className="text-sm font-bold text-slate-200">
              {resumeFile ? resumeFileName : 'Click to Browse or Drag & Drop PDF Resume'}
            </div>
            <div className="text-xs text-slate-500 mt-1">
              {resumeFile ? `Selected: ${resumeFileSize}` : 'Supported format: .PDF (Max 5MB) • Text-searchable PDFs'}
            </div>
          </div>
        </div>

        {resumeError && (
          <div className="p-3.5 rounded-xl bg-rose-950/40 border border-rose-800/60 text-xs text-rose-300 flex items-center gap-2.5">
            <AlertCircle className="h-4 w-4 shrink-0 text-rose-400" />
            <span>{resumeError}</span>
          </div>
        )}

        <div className="flex items-center justify-between">
          <span className="text-xs text-slate-400">
            Scanning target: <strong className="text-sky-300">{resumeTargetRole || targetRole}</strong>
          </span>
          <button
            onClick={onScanResume}
            disabled={resumeUploading}
            className="px-6 py-3 rounded-xl bg-gradient-to-r from-sky-600 via-indigo-600 to-sky-600 hover:from-sky-500 font-bold text-xs text-white shadow-xl shadow-sky-600/30 flex items-center gap-2 transition disabled:opacity-50"
          >
            {resumeUploading ? (
              <>
                <RefreshCw className="h-4 w-4 animate-spin" />
                <span>Parsing & Computing Real ATS Score...</span>
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4 text-amber-300" />
                <span>Analyze Resume with Real ATS Scanner ⚡</span>
              </>
            )}
          </button>
        </div>

        {/* ATS Results View */}
        {resumeAnalysisResult && (
          <div className="p-6 rounded-2xl bg-[#080d19] border border-slate-800 space-y-6 pt-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5 items-center border-b border-slate-800/80 pb-6">
              <div className="flex items-center gap-4">
                <div
                  className={`h-20 w-20 rounded-2xl border flex flex-col items-center justify-center shadow-lg ${
                    resumeAnalysisResult.ats_score >= 80
                      ? 'bg-emerald-950/30 border-emerald-500/40 text-emerald-400 shadow-emerald-500/10'
                      : resumeAnalysisResult.ats_score >= 60
                      ? 'bg-amber-950/30 border-amber-500/40 text-amber-400 shadow-amber-500/10'
                      : 'bg-rose-950/30 border-rose-500/40 text-rose-400 shadow-rose-500/10'
                  }`}
                >
                  <span className="text-3xl font-black font-mono leading-none">{resumeAnalysisResult.ats_score}</span>
                  <span className="text-[10px] uppercase font-bold tracking-wider mt-1 opacity-70">/ 100</span>
                </div>
                <div className="space-y-1">
                  <div className="text-xs font-bold text-slate-200">ATS Composite Score</div>
                  <div
                    className={`text-xs font-semibold ${
                      resumeAnalysisResult.ats_score >= 80
                        ? 'text-emerald-400'
                        : resumeAnalysisResult.ats_score >= 60
                        ? 'text-amber-400'
                        : 'text-rose-400'
                    }`}
                  >
                    {resumeAnalysisResult.ats_score >= 80
                      ? '🟢 Top 10% ATS Compatible'
                      : resumeAnalysisResult.ats_score >= 60
                      ? '🟡 Moderate Fit (Optimize)'
                      : '🔴 High Screening Risk'}
                  </div>
                </div>
              </div>

              <div className="md:col-span-2 p-4 rounded-xl bg-slate-900/60 border border-slate-800 text-xs leading-relaxed text-slate-300 space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-sky-400 flex items-center gap-1.5">
                    <CheckCheck className="h-4 w-4" /> Recruiter Evaluation Summary
                  </span>
                  <button
                    onClick={() => window.print()}
                    className="text-[11px] text-slate-400 hover:text-sky-400 flex items-center gap-1 transition"
                  >
                    <Printer className="h-3.5 w-3.5" /> Print Audit
                  </button>
                </div>
                <p>{resumeAnalysisResult.role_alignment}</p>
              </div>
            </div>

            {/* Sub-Tabs */}
            <div className="flex border-b border-slate-800 gap-2">
              {[
                { id: 'audit', label: 'Recruiter Audit & Action Plan', icon: FileCheck },
                { id: 'skills', label: 'Skills & Keyword Gap', icon: Target },
                { id: 'bullets', label: 'Bullet Enhancer (X-Y-Z)', icon: Sparkles },
                { id: 'readability', label: 'ATS Parser Hygiene', icon: Layers },
              ].map((tab) => {
                const Icon = tab.icon;
                const isActive = activeResumeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => onSelectResumeTab(tab.id as any)}
                    className={`pb-3 px-3 text-xs font-bold flex items-center gap-2 border-b-2 transition ${
                      isActive ? 'border-sky-500 text-sky-400' : 'border-transparent text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </div>

            {activeResumeTab === 'audit' && (
              <div className="space-y-4">
                <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 space-y-2 text-xs">
                  <div className="font-bold text-sky-400 flex items-center gap-1.5">
                    <FileCheck className="h-4 w-4" /> ATS Formatting & Readability Diagnosis
                  </div>
                  <p className="text-slate-300 leading-relaxed">{resumeAnalysisResult.formatting_feedback}</p>
                </div>

                <div className="p-4 rounded-xl bg-indigo-950/20 border border-indigo-800/40 space-y-3">
                  <div className="font-bold text-indigo-300 text-xs flex items-center gap-1.5">
                    <Sparkles className="h-4 w-4 text-amber-400" /> Actionable Resume Enhancements Checklist
                  </div>
                  <div className="space-y-2">
                    {(resumeAnalysisResult.suggestions || []).map((sugg: string, i: number) => (
                      <div key={i} className="p-3 rounded-lg bg-slate-900/80 border border-slate-800 text-xs flex items-start gap-3">
                        <span className="h-5 w-5 rounded-full bg-amber-500/20 text-amber-400 font-bold flex items-center justify-center shrink-0 text-[11px]">
                          {i + 1}
                        </span>
                        <div className="text-slate-200 leading-relaxed">{sugg}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {activeResumeTab === 'skills' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 space-y-3">
                  <div className="text-xs font-bold text-emerald-400 flex items-center justify-between">
                    <span className="flex items-center gap-1.5">
                      <CheckCircle2 className="h-4 w-4" /> Matched Core Skills ({resumeAnalysisResult.matched_skills?.length || 0})
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {(resumeAnalysisResult.matched_skills || []).map((s: string) => (
                      <span
                        key={s}
                        className="px-2.5 py-1 rounded-lg text-xs bg-emerald-500/10 text-emerald-300 border border-emerald-500/20 font-mono font-medium flex items-center gap-1"
                      >
                        <Check className="h-3 w-3 text-emerald-400" /> {s}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 space-y-3">
                  <div className="text-xs font-bold text-rose-400 flex items-center justify-between">
                    <span className="flex items-center gap-1.5">
                      <AlertCircle className="h-4 w-4" /> Missing Recommended Skills ({resumeAnalysisResult.missing_skills?.length || 0})
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {(resumeAnalysisResult.missing_skills || []).map((s: string) => (
                      <span
                        key={s}
                        className="px-2.5 py-1 rounded-lg text-xs bg-rose-500/10 text-rose-300 border border-rose-500/20 font-mono font-medium"
                      >
                        + {s}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
