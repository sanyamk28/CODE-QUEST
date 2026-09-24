import React from 'react';
import { Database, Play } from 'lucide-react';
import { SqlProblem } from '../../types';

interface SqlLabViewProps {
  problems: SqlProblem[];
  selectedProblem: SqlProblem;
  sqlQuery: string;
  sqlRunning: boolean;
  sqlResult: { columns: string[]; rows: any[]; error?: string } | null;
  onSelectProblem: (problem: SqlProblem) => void;
  onQueryChange: (query: string) => void;
  onRunSql: () => void;
}

export const SqlLabView: React.FC<SqlLabViewProps> = ({
  problems,
  selectedProblem,
  sqlQuery,
  sqlRunning,
  sqlResult,
  onSelectProblem,
  onQueryChange,
  onRunSql,
}) => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 h-[720px]">
      <div className="lg:col-span-5 rounded-2xl bg-slate-900/80 border border-slate-800 p-5 flex flex-col space-y-4 overflow-y-auto">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-slate-200 flex items-center gap-2">
            <Database className="h-4 w-4 text-sky-400" /> SQL Schema & Challenge
          </h3>
          <select
            value={selectedProblem.id}
            onChange={(e) => {
              const p = problems.find((item) => item.id === e.target.value);
              if (p) onSelectProblem(p);
            }}
            className="bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1 text-xs text-slate-200 outline-none"
          >
            {problems.map((p) => (
              <option key={p.id} value={p.id}>
                {p.title}
              </option>
            ))}
          </select>
        </div>
        <div>
          <h2 className="text-lg font-extrabold text-white">{selectedProblem.title}</h2>
          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/10 text-amber-400 border border-amber-500/20">
            {selectedProblem.difficulty}
          </span>
        </div>
        <p className="text-xs text-slate-300 whitespace-pre-line">{selectedProblem.desc}</p>
        <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 text-xs font-mono space-y-1">
          <div className="text-slate-400 font-bold">Relational Schema:</div>
          <pre className="text-sky-300 text-[11px] whitespace-pre-wrap">{selectedProblem.schema}</pre>
        </div>
      </div>

      <div className="lg:col-span-7 rounded-2xl bg-slate-900/80 border border-slate-800 flex flex-col overflow-hidden">
        <div className="bg-[#0b101e] px-4 py-2.5 border-b border-slate-800 flex items-center justify-between">
          <span className="text-xs font-mono font-bold text-slate-300">
            PostgreSQL Sandbox (Isolated Evaluation Engine)
          </span>
          <button
            onClick={onRunSql}
            disabled={sqlRunning}
            className="px-4 py-1.5 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-semibold text-xs flex items-center gap-1.5 shadow-md shadow-sky-600/30 disabled:opacity-50"
          >
            <Play className="h-3 w-3 fill-white" /> {sqlRunning ? 'Executing...' : 'Run Query'}
          </button>
        </div>
        <textarea
          value={sqlQuery}
          onChange={(e) => onQueryChange(e.target.value)}
          className="h-48 w-full bg-[#070a13] p-4 text-xs font-mono text-sky-200 outline-none resize-none leading-relaxed border-b border-slate-800"
          spellCheck={false}
          placeholder="Write your SQL SELECT query here..."
        />
        <div className="flex-1 bg-slate-950 p-4 overflow-auto">
          <div className="text-xs font-bold text-slate-400 mb-2 font-mono">Query Result:</div>
          {sqlResult?.error ? (
            <div className="p-3 rounded-xl bg-rose-950/30 border border-rose-800/40 text-rose-300 text-xs font-mono">
              {sqlResult.error}
            </div>
          ) : sqlResult && sqlResult.columns.length > 0 ? (
            <table className="w-full text-xs font-mono text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400">
                  {sqlResult.columns.map((c) => (
                    <th key={c} className="py-2 px-3">
                      {c}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {sqlResult.rows.map((r, i) => (
                  <tr key={i} className="border-b border-slate-900 text-slate-200 hover:bg-slate-900/40">
                    {sqlResult.columns.map((c) => (
                      <td key={c} className="py-2 px-3">
                        {String(r[c] ?? 'NULL')}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="text-xs text-slate-500 italic">No output returned. Run a query above.</div>
          )}
        </div>
      </div>
    </div>
  );
};
