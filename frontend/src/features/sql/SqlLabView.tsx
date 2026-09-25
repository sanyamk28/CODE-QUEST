import React, { useState } from 'react';
import {
  Database,
  Play,
  RotateCcw,
  Sparkles,
  ChevronRight,
  ChevronDown,
  Table,
  CheckCircle2,
  Clock,
  Layers,
  ArrowRight,
  Search,
  Copy,
  Zap
} from 'lucide-react';

interface DbConfig {
  name: string;
  tables: {
    name: string;
    columns: { name: string; type: string; isPk?: boolean; isFk?: boolean }[];
  }[];
  sampleQueries: { title: string; sql: string }[];
  initialData: Record<string, string>[];
}

const DATABASES: Record<string, DbConfig> = {
  'Employees Database': {
    name: 'Employees Database',
    tables: [
      {
        name: 'employees',
        columns: [
          { name: 'emp_id', type: 'INT', isPk: true },
          { name: 'emp_name', type: 'VARCHAR' },
          { name: 'dept_id', type: 'INT', isFk: true },
          { name: 'salary', type: 'INT' },
          { name: 'hire_date', type: 'DATE' },
        ]
      },
      {
        name: 'departments',
        columns: [
          { name: 'dept_id', type: 'INT', isPk: true },
          { name: 'dept_name', type: 'VARCHAR' },
          { name: 'location', type: 'VARCHAR' },
        ]
      },
      {
        name: 'salaries',
        columns: [
          { name: 'emp_id', type: 'INT', isFk: true },
          { name: 'salary_amount', type: 'DECIMAL' },
          { name: 'from_date', type: 'DATE' },
          { name: 'to_date', type: 'DATE' },
        ]
      },
      {
        name: 'dept_manager',
        columns: [
          { name: 'dept_id', type: 'INT', isFk: true },
          { name: 'emp_id', type: 'INT', isFk: true },
          { name: 'from_date', type: 'DATE' },
        ]
      }
    ],
    sampleQueries: [
      {
        title: 'High Earners by Department',
        sql: `SELECT e.emp_name, d.dept_name, e.salary\nFROM employees e\nJOIN departments d ON e.dept_id = d.dept_id\nWHERE e.salary > 60000\nORDER BY e.salary DESC;`
      },
      {
        title: 'Department Headcount',
        sql: `SELECT d.dept_name, COUNT(e.emp_id) as total_staff, AVG(e.salary) as avg_salary\nFROM departments d\nLEFT JOIN employees e ON d.dept_id = e.dept_id\nGROUP BY d.dept_name;`
      }
    ],
    initialData: [
      { emp_name: 'John Doe', dept_name: 'Engineering', salary: '75,000' },
      { emp_name: 'Jane Smith', dept_name: 'Marketing', salary: '68,000' },
      { emp_name: 'Mike Johnson', dept_name: 'Engineering', salary: '62,000' },
      { emp_name: 'Sarah Connor', dept_name: 'Security', salary: '84,000' }
    ]
  },
  'E-Commerce Database': {
    name: 'E-Commerce Database',
    tables: [
      {
        name: 'orders',
        columns: [
          { name: 'order_id', type: 'INT', isPk: true },
          { name: 'customer_id', type: 'INT', isFk: true },
          { name: 'total_amount', type: 'DECIMAL' },
          { name: 'order_date', type: 'TIMESTAMP' },
        ]
      },
      {
        name: 'customers',
        columns: [
          { name: 'customer_id', type: 'INT', isPk: true },
          { name: 'customer_name', type: 'VARCHAR' },
          { name: 'country', type: 'VARCHAR' },
        ]
      }
    ],
    sampleQueries: [
      {
        title: 'Top Customer Orders',
        sql: `SELECT c.customer_name, c.country, SUM(o.total_amount) as total_spend\nFROM customers c\nJOIN orders o ON c.customer_id = o.customer_id\nGROUP BY c.customer_name, c.country\nORDER BY total_spend DESC;`
      }
    ],
    initialData: [
      { customer_name: 'Alice Wong', country: 'United States', total_spend: '$4,280' },
      { customer_name: 'Bob Miller', country: 'Germany', total_spend: '$3,150' },
      { customer_name: 'Carlos Ruiz', country: 'Spain', total_spend: '$2,890' }
    ]
  }
};

export const SqlLabView: React.FC = () => {
  const [selectedDbKey, setSelectedDbKey] = useState<string>('Employees Database');
  const [activeTab, setActiveTab] = useState<'schema' | 'query' | 'result'>('query');

  const currentDb = DATABASES[selectedDbKey] || DATABASES['Employees Database'];
  const [query, setQuery] = useState(currentDb.sampleQueries[0].sql);
  const [resultsData, setResultsData] = useState<Record<string, string>[]>(currentDb.initialData);
  const [isRunning, setIsRunning] = useState(false);
  const [executionTime, setExecutionTime] = useState('23 ms');
  const [copied, setCopied] = useState(false);

  const handleDbChange = (dbName: string) => {
    setSelectedDbKey(dbName);
    const db = DATABASES[dbName];
    if (db) {
      setQuery(db.sampleQueries[0].sql);
      setResultsData(db.initialData);
    }
  };

  const handleRunQuery = () => {
    setIsRunning(true);
    setTimeout(() => {
      setIsRunning(false);
      setExecutionTime(`${Math.floor(Math.random() * 12 + 18)} ms`);

      // Dynamically simulate filtered results based on query terms
      if (query.toLowerCase().includes('count')) {
        setResultsData([
          { dept_name: 'Engineering', total_staff: '24', avg_salary: '$71,200' },
          { dept_name: 'Marketing', total_staff: '12', avg_salary: '$64,500' },
          { dept_name: 'Security', total_staff: '6', avg_salary: '$82,000' }
        ]);
      } else {
        setResultsData(currentDb.initialData);
      }
      setActiveTab('result');
    }, 450);
  };

  const handleCopySql = () => {
    navigator.clipboard?.writeText(query);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  const headers = resultsData.length > 0 ? Object.keys(resultsData[0]) : [];

  return (
    <div className="space-y-4 max-w-5xl mx-auto pb-6">
      {/* Top Header & DB Selector */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-[#0b101e] border border-slate-800/80 rounded-2xl p-3.5 shadow-md">
        <div className="flex items-center gap-2.5">
          <div className="h-9 w-9 rounded-xl bg-cyan-950/40 border border-cyan-800/40 flex items-center justify-center text-cyan-400">
            <Database className="h-4 w-4" />
          </div>
          <div>
            <select
              value={selectedDbKey}
              onChange={(e) => handleDbChange(e.target.value)}
              className="bg-[#0e1424] border border-slate-700/60 rounded-xl px-3 py-1.5 text-xs text-white outline-none font-bold cursor-pointer"
            >
              {Object.keys(DATABASES).map((dbName) => (
                <option key={dbName} value={dbName}>
                  {dbName}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Segmented Tabs: [Schema | Query | Result] */}
        <div className="p-1 rounded-xl bg-[#0e1424] border border-slate-800 flex self-start sm:self-auto">
          {(['schema', 'query', 'result'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-1.5 text-xs font-bold capitalize rounded-lg transition-all ${
                activeTab === tab
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* Query Presets Pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none text-xs">
        <span className="text-slate-500 font-semibold shrink-0 text-[11px]">Preset Queries:</span>
        {currentDb.sampleQueries.map((preset, idx) => (
          <button
            key={idx}
            onClick={() => setQuery(preset.sql)}
            className="px-3 py-1 rounded-full bg-[#0b101e] hover:bg-[#0e1424] border border-slate-800 text-slate-300 text-[11px] font-medium whitespace-nowrap transition"
          >
            {preset.title}
          </button>
        ))}
      </div>

      {/* 1. SCHEMA VIEW */}
      {activeTab === 'schema' && (
        <div className="bg-[#0b101e] border border-slate-800/80 rounded-2xl p-5 shadow-lg space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-slate-800/60">
            <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider">
              {currentDb.name} Schemas ({currentDb.tables.length} tables)
            </h3>
            <span className="text-[10px] text-slate-400 font-mono">PostgreSQL Engine</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            {currentDb.tables.map((table) => (
              <div key={table.name} className="rounded-xl bg-[#0e1424] border border-slate-800/70 p-3.5 space-y-2">
                <div className="flex items-center justify-between pb-1.5 border-b border-slate-800/60">
                  <span className="text-xs font-bold text-sky-300 flex items-center gap-1.5">
                    <Table className="h-3.5 w-3.5 text-indigo-400" />
                    {table.name}
                  </span>
                  <span className="text-[10px] text-slate-500 font-mono">{table.columns.length} columns</span>
                </div>
                <div className="space-y-1 font-mono text-[11px]">
                  {table.columns.map((col) => (
                    <div key={col.name} className="flex items-center justify-between py-0.5 text-slate-300">
                      <span className="flex items-center gap-1.5">
                        {col.isPk && <span className="text-[9px] text-amber-400 font-bold px-1 rounded bg-amber-400/10">PK</span>}
                        {col.isFk && <span className="text-[9px] text-sky-400 font-bold px-1 rounded bg-sky-400/10">FK</span>}
                        <span>{col.name}</span>
                      </span>
                      <span className="text-[10px] text-slate-500">{col.type}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 2. QUERY VIEW */}
      {activeTab === 'query' && (
        <div className="bg-[#0b101e] border border-slate-800/80 rounded-2xl overflow-hidden shadow-lg flex flex-col">
          <div className="px-4 py-2.5 bg-[#090d16] border-b border-slate-800/80 flex items-center justify-between">
            <span className="text-xs font-bold text-white flex items-center gap-2">
              <Sparkles className="h-3.5 w-3.5 text-sky-400" />
              SQL Query Editor
            </span>
            <div className="flex items-center gap-2">
              <button
                onClick={handleCopySql}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
                title="Copy SQL"
              >
                {copied ? <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
              </button>
              <button
                onClick={() => setQuery(currentDb.sampleQueries[0].sql)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
                title="Reset Query"
              >
                <RotateCcw className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>

          <div className="p-3 bg-[#070b14] min-h-[190px] flex flex-col">
            <textarea
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="w-full flex-1 bg-transparent text-slate-200 resize-none outline-none font-mono text-xs leading-relaxed"
              spellCheck={false}
              rows={7}
            />
          </div>

          <div className="p-3 bg-[#090d16] border-t border-slate-800/80 flex items-center justify-between">
            <div className="text-[11px] text-slate-400 font-mono">
              Syntax verified • Ready for execution
            </div>
            <button
              onClick={handleRunQuery}
              disabled={isRunning}
              className="py-2.5 px-6 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-xs font-bold shadow-md shadow-indigo-600/30 flex items-center gap-2 transition active:scale-[0.98]"
            >
              <Play className="h-3.5 w-3.5 fill-white" />
              <span>{isRunning ? 'Executing...' : 'Run Query'}</span>
            </button>
          </div>
        </div>
      )}

      {/* 3. RESULT VIEW */}
      {activeTab === 'result' && (
        <div className="bg-[#0b101e] border border-slate-800/80 rounded-2xl p-5 shadow-lg space-y-3.5">
          <div className="flex items-center justify-between pb-2 border-b border-slate-800/60">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-white">Execution Result</span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 font-bold">
                Success • {executionTime}
              </span>
            </div>
            <span className="text-[10px] text-slate-400 font-mono">{resultsData.length} rows returned</span>
          </div>

          <div className="overflow-x-auto rounded-xl border border-slate-800/80">
            <table className="w-full text-left text-xs font-mono">
              <thead>
                <tr className="bg-slate-900/80 border-b border-slate-800 text-slate-400 text-[11px]">
                  {headers.map((colName) => (
                    <th key={colName} className="py-2.5 px-3 font-semibold">
                      {colName}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 bg-[#070b14]">
                {resultsData.map((row, idx) => (
                  <tr key={idx} className="hover:bg-slate-800/40 text-slate-200 transition">
                    {headers.map((colName) => (
                      <td key={colName} className="py-2.5 px-3">
                        {row[colName]}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="flex justify-end pt-1">
            <button
              onClick={() => setActiveTab('query')}
              className="text-xs text-sky-400 hover:text-sky-300 font-semibold"
            >
              Modify SQL Query ➔
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
