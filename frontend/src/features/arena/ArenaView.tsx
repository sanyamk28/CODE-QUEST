import React from 'react';
import { Code2, Terminal, CheckCircle2, XCircle, Play } from 'lucide-react';
import { CodingProblem } from '../../types';

interface ArenaViewProps {
  problems: CodingProblem[];
  selectedProblem: CodingProblem;
  codeLanguage: 'python' | 'javascript' | 'cpp';
  editorCode: string;
  executingCode: boolean;
  consoleOutput: { status: string; stdout: string; time: number; passed: boolean } | null;
  onSelectProblem: (problem: CodingProblem) => void;
  onLanguageChange: (lang: 'python' | 'javascript' | 'cpp') => void;
  onCodeChange: (code: string) => void;
  onRunCode: () => void;
}

export const ArenaView: React.FC<ArenaViewProps> = ({
  problems,
  selectedProblem,
  codeLanguage,
  editorCode,
  executingCode,
  consoleOutput,
  onSelectProblem,
  onLanguageChange,
  onCodeChange,
  onRunCode,
}) => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 h-[720px]">
      <div className="lg:col-span-5 rounded-2xl bg-slate-900/80 border border-slate-800 p-5 flex flex-col overflow-y-auto space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-slate-200 flex items-center gap-2">
            <Code2 className="h-4 w-4 text-indigo-400" /> Problem Arena
          </h3>
          <div className="flex gap-1.5">
            {problems.map((p, idx) => (
              <button
                key={p.id}
                onClick={() => onSelectProblem(p)}
                className={`px-2.5 py-1 rounded-lg text-xs font-semibold ${
                  selectedProblem.id === p.id
                    ? 'bg-indigo-600 text-white'
                    : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
                }`}
              >
                #{idx + 1}
              </button>
            ))}
          </div>
        </div>

        <div>
          <div className="flex items-center gap-2 mb-1">
            <h2 className="text-lg font-extrabold text-white">{selectedProblem.title}</h2>
            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              {selectedProblem.difficulty}
            </span>
          </div>
          <div className="flex flex-wrap gap-1.5 mb-3">
            {(selectedProblem.company_tags || []).map((t) => (
              <span
                key={t}
                className="px-2 py-0.5 rounded-full text-[10px] bg-slate-800 text-slate-400 border border-slate-700"
              >
                {t}
              </span>
            ))}
          </div>
        </div>

        <div className="text-xs text-slate-300 leading-relaxed whitespace-pre-line border-t border-slate-800 pt-3">
          {selectedProblem.desc}
        </div>

        <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/80 text-xs font-mono space-y-1">
          <div className="text-slate-400 font-bold">Example 1:</div>
          <div className="text-sky-400">Input: {selectedProblem.input}</div>
          <div className="text-emerald-400">Output: {selectedProblem.output}</div>
        </div>
      </div>

      <div className="lg:col-span-7 rounded-2xl bg-slate-900/80 border border-slate-800 flex flex-col overflow-hidden">
        <div className="bg-[#0b101e] px-4 py-2.5 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Terminal className="h-4 w-4 text-sky-400" />
            <span className="text-xs font-mono font-bold text-slate-300">
              {codeLanguage === 'python' ? 'Solution.py' : codeLanguage === 'javascript' ? 'solution.js' : 'solution.cpp'}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <select
              value={codeLanguage}
              onChange={(e) => onLanguageChange(e.target.value as any)}
              className="bg-slate-800 text-xs text-slate-200 px-2 py-1 rounded border border-slate-700 font-mono outline-none"
            >
              <option value="python">Python 3</option>
              <option value="javascript">JavaScript</option>
              <option value="cpp">C++ (g++)</option>
            </select>
          </div>
        </div>

        <textarea
          value={editorCode}
          onChange={(e) => onCodeChange(e.target.value)}
          className="flex-1 w-full bg-[#070a13] p-4 text-xs font-mono text-slate-200 outline-none resize-none leading-relaxed selection:bg-indigo-600"
          spellCheck={false}
          placeholder="Write your code solution here..."
        />

        {consoleOutput && (
          <div className="p-3 bg-slate-950 border-t border-slate-800 text-xs font-mono">
            <div
              className={`flex items-center gap-2 font-bold mb-1 ${
                consoleOutput.passed ? 'text-emerald-400' : 'text-rose-400'
              }`}
            >
              {consoleOutput.passed ? (
                <CheckCircle2 className="h-3.5 w-3.5" />
              ) : (
                <XCircle className="h-3.5 w-3.5" />
              )}{' '}
              {consoleOutput.status}
              <span className="text-[10px] text-slate-500 font-normal">({consoleOutput.time.toFixed(3)}s)</span>
            </div>
            <pre className="text-slate-400 text-[11px] whitespace-pre-wrap">{consoleOutput.stdout}</pre>
          </div>
        )}

        <div className="bg-[#0b101e] p-3 border-t border-slate-800 flex items-center justify-between">
          <span className="text-[11px] text-slate-400 font-mono">Isolated Container Sandbox Judge</span>
          <div className="flex gap-2">
            <button
              onClick={onRunCode}
              disabled={executingCode}
              className="px-4 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs transition flex items-center gap-1.5 border border-slate-700 disabled:opacity-50"
            >
              <Play className="h-3 w-3 fill-slate-200" /> {executingCode ? 'Running...' : 'Run Code'}
            </button>
            <button
              onClick={onRunCode}
              disabled={executingCode}
              className="px-5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs transition flex items-center gap-1.5 shadow-md shadow-emerald-600/30 disabled:opacity-50"
            >
              Submit Solution
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
