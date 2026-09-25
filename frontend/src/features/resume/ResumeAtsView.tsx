import React, { useState, useEffect, useRef } from 'react';
import {
  UploadCloud,
  FileText,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  Check,
  RefreshCw,
  Plus,
  FileCheck,
  Search,
  Eye,
  X,
  Layers,
  Zap,
  Briefcase,
  Copy,
  Download
} from 'lucide-react';

interface ResumeAtsViewProps {
  targetRole?: string;
}

export const ResumeAtsView: React.FC<ResumeAtsViewProps> = ({
  targetRole = 'Data Engineer'
}) => {
  const [activeTab, setActiveTab] = useState<'analyze' | 'results'>('analyze');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [fileName, setFileName] = useState<string>('Sanyam_Resume_DataEngineer.pdf');
  const [fileSize, setFileSize] = useState<string>('1.8 MB');
  const [resumeText, setResumeText] = useState<string>(
    `Sanyam Kumar | IIT Kanpur | Data Engineer
Summary: Experienced Data Engineer with expertise in building large-scale ETL pipelines, stream processing, and distributed data systems.
Technical Skills: Python, SQL, PostgreSQL, Docker, AWS (S3, Redshift), Pandas, NumPy, Linux, Git, Database Design, REST APIs.
Projects:
- High-Throughput Real-time Analytics Pipeline using Python and PostgreSQL. Reduced latency by 45%.
- Automated Data Lake Ingestion Architecture on AWS with automated schema validation.`
  );

  const [jobDescription, setJobDescription] = useState<string>(
`Data Engineer
3+ years of experience with Python, SQL, AWS, Airflow, Databricks, Spark, Kubernetes, Terraform.`
  );

  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [atsScore, setAtsScore] = useState<number>(82);
  const [keywordMatchPct, setKeywordMatchPct] = useState<number>(78);
  const [skillsMatchPct, setSkillsMatchPct] = useState<number>(85);
  const [experienceMatchPct, setExperienceMatchPct] = useState<number>(70);
  const [missingKeywords, setMissingKeywords] = useState<string[]>([
    'Airflow', 'Databricks', 'Spark', 'Kubernetes', 'Terraform'
  ]);
  const [strengths, setStrengths] = useState<string[]>([
    'Strong Python experience highlighted across backend data parsing',
    'Good SQL knowledge with complex queries and aggregations',
    'Relevant project experience with data pipelines and AWS cloud'
  ]);
  const [suggestions, setSuggestions] = useState<string[]>([
    'Add quantifiable metrics from ETL projects (e.g. reduced latency by 45%).',
    'Add cloud certification or hands-on AWS pipeline deployments.',
    'Mention Airflow, Apache Spark, or Kafka in your project descriptions to maximize recruiter search matches.'
  ]);

  const [showImprovedResumeModal, setShowImprovedResumeModal] = useState<boolean>(false);
  const [copiedResume, setCopiedResume] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleRunAnalysis = () => {
    setIsAnalyzing(true);
    setTimeout(() => {
      setIsAnalyzing(false);
      setActiveTab('results');
    }, 600);
  };

  const handleAddKeywordToResume = (kw: string) => {
    setResumeText((prev) => `${prev}\n- Integrated ${kw} to improve pipeline throughput and distributed processing.`);
    setMissingKeywords((prev) => prev.filter((k) => k !== kw));
    setAtsScore((prev) => Math.min(prev + 3, 98));
    setKeywordMatchPct((prev) => Math.min(prev + 4, 96));
    setToastMessage(`Added "${kw}" to resume! ATS Score increased to ${Math.min(atsScore + 3, 98)}%`);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleFileChange = (file: File) => {
    setSelectedFile(file);
    setFileName(file.name);
    setFileSize(`${(file.size / (1024 * 1024)).toFixed(1)} MB`);
  };

  const handleCopyImprovedResume = () => {
    const improved = `# ${targetRole} - Optimized Resume
${resumeText}

### Recommended Additions:
- Core competencies aligned with ${targetRole}
- Tools: ${missingKeywords.join(', ')}
- Verified ATS Score: ${atsScore}%`;

    navigator.clipboard?.writeText(improved);
    setCopiedResume(true);
    setTimeout(() => setCopiedResume(false), 2000);
  };

  return (
    <div className="space-y-4 max-w-4xl mx-auto pb-6">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-16 left-1/2 -translate-x-1/2 z-50 px-4 py-2 bg-emerald-600 text-white text-xs font-bold rounded-2xl shadow-2xl flex items-center gap-2 animate-bounce">
          <CheckCircle2 className="h-4 w-4" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Top Segmented Tabs matching Screen 10 & 11: [Analyze | Results] */}
      <div className="flex items-center justify-between p-1 bg-[#0b101e] border border-slate-800 rounded-2xl max-w-md mx-auto">
        {(['analyze', 'results'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`flex-1 py-2 text-xs font-bold capitalize rounded-xl transition-all ${
              activeTab === tab
                ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* SCREEN 10: ANALYZE TAB */}
      {activeTab === 'analyze' && (
        <div className="bg-[#0b101e] border border-slate-800/80 rounded-3xl p-5 sm:p-6 shadow-xl space-y-4 max-w-xl mx-auto">
          {/* Header */}
          <div className="space-y-1">
            <h2 className="text-base font-black text-white">Upload Your Resume</h2>
            <p className="text-xs text-slate-400">PDF, DOCX, or TXT (Max 5MB)</p>
          </div>

          {/* Upload card matching Screen 10 */}
          <div
            onClick={() => fileInputRef.current?.click()}
            className="p-6 rounded-2xl border-2 border-dashed border-slate-700 hover:border-indigo-500/60 bg-[#0e1424] cursor-pointer text-center flex flex-col items-center justify-center transition group"
          >
            <div className="h-12 w-12 rounded-2xl bg-indigo-950/50 border border-indigo-800/40 flex items-center justify-center text-indigo-400 mb-3 group-hover:scale-105 transition">
              <UploadCloud className="h-6 w-6" />
            </div>

            <input
              ref={fileInputRef}
              type="file"
              className="hidden"
              accept=".pdf,.docx,.doc,.txt"
              onChange={(e) => {
                if (e.target.files?.[0]) handleFileChange(e.target.files[0]);
              }}
            />

            <button
              type="button"
              className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition shadow-md shadow-blue-600/20"
            >
              Choose File
            </button>

            {fileName && (
              <div className="mt-3 inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-emerald-950/50 border border-emerald-800/50 text-[11px] text-emerald-300 font-medium">
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
                <span className="truncate max-w-[200px]">{fileName}</span>
                <span className="text-[10px] text-slate-400 font-mono">({fileSize})</span>
              </div>
            )}
          </div>

          {/* Resume Raw Text Editor */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-300">
              Resume Text Preview
            </label>
            <textarea
              rows={4}
              value={resumeText}
              onChange={(e) => setResumeText(e.target.value)}
              placeholder="Paste your resume content or skills here..."
              className="w-full bg-[#0e1424] border border-slate-800 rounded-2xl p-3 text-xs text-slate-200 font-mono placeholder:text-slate-500 outline-none focus:border-indigo-500 transition leading-relaxed"
            />
          </div>

          {/* Paste Job Description */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-300">
              Paste Job Description (Optional)
            </label>
            <textarea
              rows={3}
              value={jobDescription}
              onChange={(e) => setJobDescription(e.target.value)}
              placeholder="Paste target role requirements or keywords here..."
              className="w-full bg-[#0e1424] border border-slate-800 rounded-2xl p-3 text-xs text-slate-200 placeholder:text-slate-500 outline-none focus:border-indigo-500 transition leading-relaxed"
            />
          </div>

          {/* Analyze Button matching Screen 10 */}
          <button
            onClick={handleRunAnalysis}
            disabled={isAnalyzing}
            className="w-full py-3 rounded-2xl bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-xs shadow-lg shadow-indigo-600/30 transition flex items-center justify-center gap-2 active:scale-[0.99]"
          >
            <Sparkles className="h-4 w-4" />
            <span>{isAnalyzing ? 'Scanning & Parsing Resume...' : 'Analyze Resume'}</span>
          </button>
        </div>
      )}

      {/* SCREEN 11: ANALYSIS RESULTS TAB */}
      {activeTab === 'results' && (
        <div className="bg-[#0b101e] border border-slate-800/80 rounded-3xl p-5 sm:p-6 shadow-xl space-y-5 max-w-xl mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between pb-2 border-b border-slate-800/60">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-sky-400">Scan Summary</span>
              <h2 className="text-base font-black text-white">Analysis Results</h2>
            </div>
            <span className="text-xs font-semibold text-slate-400 font-mono">{fileName}</span>
          </div>

          {/* Circular ATS Gauge matching Screen 11: 82% */}
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
                  strokeDasharray={`${atsScore}, 100`}
                  strokeWidth="3.5"
                  strokeLinecap="round"
                  stroke="currentColor"
                  fill="none"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
              </svg>
              <div className="absolute flex flex-col items-center">
                <span className="text-2xl font-black text-white">{atsScore}%</span>
                <span className="text-[9px] uppercase tracking-wider text-slate-400 font-bold">ATS Score</span>
              </div>
            </div>
          </div>

          {/* Metrics Row matching Screen 11: Keyword, Skills Match, Experience */}
          <div className="grid grid-cols-3 gap-2 text-center">
            <div className="p-2.5 rounded-2xl bg-[#0e1424] border border-slate-800">
              <div className="text-sm font-black text-sky-400 font-mono">{keywordMatchPct}%</div>
              <div className="text-[10px] text-slate-400 font-medium mt-0.5">Keyword</div>
            </div>
            <div className="p-2.5 rounded-2xl bg-[#0e1424] border border-slate-800">
              <div className="text-sm font-black text-emerald-400 font-mono">{skillsMatchPct}%</div>
              <div className="text-[10px] text-slate-400 font-medium mt-0.5">Skills Match</div>
            </div>
            <div className="p-2.5 rounded-2xl bg-[#0e1424] border border-slate-800">
              <div className="text-sm font-black text-amber-400 font-mono">{experienceMatchPct}%</div>
              <div className="text-[10px] text-slate-400 font-medium mt-0.5">Experience</div>
            </div>
          </div>

          {/* Top Strengths matching Screen 11 */}
          <div className="space-y-2 text-left bg-[#0e1424] p-3.5 rounded-2xl border border-slate-800">
            <h3 className="text-xs font-bold text-emerald-400 uppercase tracking-wider">Top Strengths</h3>
            <ul className="space-y-1.5 text-xs text-slate-300">
              {strengths.map((str, i) => (
                <li key={i} className="flex items-center gap-2">
                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
                  <span>{str}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Missing Keywords with Click-To-Add Feature */}
          <div className="space-y-2 text-left bg-[#0e1424] p-3.5 rounded-2xl border border-slate-800">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold text-amber-400 uppercase tracking-wider">Missing Keywords</h3>
              <span className="text-[10px] text-slate-500">Tap to add into resume</span>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {missingKeywords.map((kw) => (
                <button
                  key={kw}
                  onClick={() => handleAddKeywordToResume(kw)}
                  title="Click to insert this keyword into resume and raise score"
                  className="px-2.5 py-1 rounded-full bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30 text-xs font-semibold flex items-center gap-1 transition active:scale-95"
                >
                  <Plus className="h-3 w-3" />
                  <span>{kw}</span>
                </button>
              ))}
              {missingKeywords.length === 0 && (
                <span className="text-xs text-emerald-400 font-semibold flex items-center gap-1">
                  <Check className="h-3.5 w-3.5" /> All critical keywords added!
                </span>
              )}
            </div>
          </div>

          {/* Suggestions List matching Screen 11 */}
          <div className="space-y-2 text-left bg-[#0e1424] p-3.5 rounded-2xl border border-slate-800">
            <h3 className="text-xs font-bold text-sky-400 uppercase tracking-wider">Suggestions</h3>
            <ul className="space-y-1 text-xs text-slate-300 list-disc list-inside">
              {suggestions.map((sug, i) => (
                <li key={i}>{sug}</li>
              ))}
            </ul>
          </div>

          {/* View Improved Resume Button matching Screen 11 */}
          <div className="pt-2">
            <button
              onClick={() => setShowImprovedResumeModal(true)}
              className="w-full py-3 rounded-2xl bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-xs shadow-lg shadow-indigo-600/30 transition flex items-center justify-center gap-2"
            >
              <span>View Improved Resume</span>
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}

      {/* Improved Resume Modal */}
      {showImprovedResumeModal && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#0b101e] border border-slate-700 rounded-3xl p-6 max-w-lg w-full space-y-4 shadow-2xl">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <FileCheck className="h-5 w-5 text-emerald-400" />
                <h3 className="text-sm font-bold text-white">AI-Optimized ATS Resume</h3>
              </div>
              <button
                onClick={() => setShowImprovedResumeModal(false)}
                className="text-slate-400 hover:text-white text-xs font-bold"
              >
                ✕
              </button>
            </div>

            <div className="p-4 rounded-2xl bg-[#070b14] border border-slate-800 font-mono text-xs text-slate-300 space-y-2 max-h-80 overflow-y-auto">
              <div className="text-white font-bold"># Sanyam Kumar - {targetRole}</div>
              <p className="whitespace-pre-line leading-relaxed">{resumeText}</p>
            </div>

            <div className="flex items-center justify-between pt-2">
              <span className="text-[11px] text-emerald-400 font-bold font-mono">
                ATS Compatibility: {atsScore}%
              </span>
              <div className="flex gap-2">
                <button
                  onClick={handleCopyImprovedResume}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold border border-slate-700 flex items-center gap-1.5 transition"
                >
                  {copiedResume ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
                  <span>{copiedResume ? 'Copied!' : 'Copy Text'}</span>
                </button>
                <button
                  onClick={() => {
                    alert('Exporting PDF for ATS submittal...');
                    setShowImprovedResumeModal(false);
                  }}
                  className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition flex items-center gap-1.5"
                >
                  <Download className="h-3.5 w-3.5" />
                  <span>Download PDF</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
