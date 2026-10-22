import React, { useState, useEffect, useCallback } from 'react';
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
  Zap,
  Activity,
  Lightbulb,
  Check
} from 'lucide-react';
import { recordActivity } from '../../services/activityTracker';
import { playRunSound, playSuccessSound } from '../../services/soundEffects';
import { showToast } from '../../components/Toast';

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
          { name: 'name', type: 'VARCHAR' },
          { name: 'email', type: 'VARCHAR' },
          { name: 'country', type: 'VARCHAR' },
        ]
      },
      {
        name: 'order_items',
        columns: [
          { name: 'item_id', type: 'INT', isPk: true },
          { name: 'order_id', type: 'INT', isFk: true },
          { name: 'product_id', type: 'INT', isFk: true },
          { name: 'quantity', type: 'INT' },
          { name: 'price', type: 'DECIMAL' }
        ]
      }
    ],
    sampleQueries: [
      {
        title: 'Top Customers by Spending',
        sql: `SELECT c.name, SUM(o.total_amount) as total_spent, COUNT(o.order_id) as total_orders\nFROM customers c\nJOIN orders o ON c.customer_id = o.customer_id\nGROUP BY c.name\nORDER BY total_spent DESC\nLIMIT 5;`
      }
    ],
    initialData: [
      { name: 'Alice Walker', total_spent: '$1,450.00', total_orders: '8' },
      { name: 'Bob Roberts', total_spent: '$920.50', total_orders: '4' },
      { name: 'Charlie Kim', total_spent: '$810.00', total_orders: '3' }
    ]
  }
};

export const SqlLabView: React.FC = () => {
  const [selectedDbKey, setSelectedDbKey] = useState<string>('Employees Database');
  const [activeTab, setActiveTab] = useState<'schema' | 'query' | 'result' | 'plan'>('query');

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

  const handleRunQuery = useCallback(() => {
    playRunSound();
    setIsRunning(true);
    setTimeout(() => {
      setIsRunning(false);
      playSuccessSound();
      const execTime = `${Math.floor(Math.random() * 10 + 16)} ms`;
      setExecutionTime(execTime);
      recordActivity('sql', { xp: 15 });

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
      showToast(`Query executed in ${execTime}! +15 XP`, 'success');
    }, 400);
  }, [currentDb.initialData, query]);

  // Keyboard shortcut Ctrl + Enter to run query
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
        e.preventDefault();
        handleRunQuery();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleRunQuery]);

  const handleCopySql = () => {
    navigator.clipboard?.writeText(query);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
    showToast('SQL copied to clipboard!', 'info');
  };

  // Query Plan Analyzer
  const queryPlan = React.useMemo(() => {
    const lower = query.toLowerCase();
    const hasJoin = lower.includes('join');
    const hasWhere = lower.includes('where');
    const hasGroup = lower.includes('group by');
    const hasOrder = lower.includes('order by');

    const steps = [
      {
        operation: hasWhere ? 'Index Scan on Primary Key' : 'Sequential Table Scan',
        cost: hasWhere ? '0.15 .. 8.20' : '0.00 .. 15.50',
        detail: hasWhere ? 'Utilized clustered index on primary ID filter' : 'Scanned base table rows in memory buffer',
        status: hasWhere ? 'Optimized' : 'Normal'
      }
    ];

    if (hasJoin) {
      steps.push({
        operation: 'Hash Join (Hash Cond: e.dept_id = d.dept_id)',
        cost: '12.40 .. 28.60',
        detail: 'In-memory Hash Table built over foreign key relations',
        status: 'Optimized'
      });
    }

    if (hasGroup) {
      steps.push({
        operation: 'HashAggregate (Key: group columns)',
        cost: '29.10 .. 34.00',
        detail: 'Computed aggregations (COUNT/SUM/AVG) with hash buckets',
        status: 'Fast'
      });
    }

    if (hasOrder) {
      steps.push({
        operation: 'Sort (Sort Key: order column DESC)',
        cost: '34.20 .. 36.50',
        detail: 'Quicksort executed in Postgres WorkMem (<2MB memory)',
        status: 'Fast'
      });
    }

    return steps;
  }, [query]);

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

        {/* Segmented Tabs: [Schema | Query | Result | Plan] */}
        <div className="p-1 rounded-xl bg-[#0e1424] border border-slate-800 flex self-start sm:self-auto gap-0.5">
          {(['schema', 'query', 'result', 'plan'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-3.5 py-1.5 text-xs font-bold capitalize rounded-lg transition-all ${
                activeTab === tab
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {tab === 'plan' ? '⚡ EXPLAIN Plan' : tab}
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
            onClick={() => {
              setQuery(preset.sql);
              setActiveTab('query');
            }}
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
                      <span className="text-slate-500 text-[10px]">{col.type}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 2. SQL QUERY EDITOR */}
      {activeTab === 'query' && (
        <div className="bg-[#0b101e] border border-slate-800/80 rounded-2xl overflow-hidden shadow-lg flex flex-col">
          <div className="px-4 py-2.5 bg-[#090d16] border-b border-slate-800/80 flex items-center justify-between">
            <span className="text-xs font-bold text-slate-300 flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-emerald-400" />
              SQL Editor
            </span>
            <div className="flex items-center gap-2">
              <button
                onClick={handleCopySql}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
                title="Copy SQL"
              >
                {copied ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
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
            <div className="text-[11px] text-slate-400 font-mono hidden sm:block">
              Ctrl+Enter to Execute
            </div>
            <div className="flex items-center gap-2 ml-auto">
              <button
                onClick={() => setActiveTab('plan')}
                className="py-2 px-3.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center gap-1.5 border border-slate-700 transition"
              >
                <Activity className="h-3.5 w-3.5 text-sky-400" />
                <span>EXPLAIN Plan</span>
              </button>
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

          <div className="flex justify-between items-center pt-1">
            <button
              onClick={() => setActiveTab('plan')}
              className="text-xs text-sky-400 hover:text-sky-300 font-semibold flex items-center gap-1"
            >
              <Activity className="h-3.5 w-3.5" />
              <span>Inspect Query Execution Plan</span>
            </button>
            <button
              onClick={() => setActiveTab('query')}
              className="text-xs text-slate-300 hover:text-white font-semibold"
            >
              Modify SQL Query ➔
            </button>
          </div>
        </div>
      )}

      {/* 4. EXPLAIN PLAN VIEW */}
      {activeTab === 'plan' && (
        <div className="bg-[#0b101e] border border-slate-800/80 rounded-2xl p-5 shadow-lg space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-slate-800/60">
            <div className="flex items-center gap-2">
              <Activity className="h-4 w-4 text-sky-400" />
              <span className="text-xs font-bold text-white uppercase tracking-wider">PostgreSQL Cost Optimizer Plan</span>
            </div>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 font-mono font-bold">
              Cost: {queryPlan[queryPlan.length - 1].cost}
            </span>
          </div>

          <div className="space-y-2">
            {queryPlan.map((step, idx) => (
              <div key={idx} className="p-3 rounded-xl bg-[#0e1424] border border-slate-800 flex items-center justify-between gap-3 text-xs">
                <div className="space-y-0.5">
                  <div className="font-bold text-white font-mono flex items-center gap-2">
                    <span className="text-indigo-400 text-[10px]">Step {idx + 1}:</span>
                    <span>{step.operation}</span>
                  </div>
                  <div className="text-[11px] text-slate-400">{step.detail}</div>
                </div>
                <div className="text-right shrink-0">
                  <span className="text-[10px] font-mono text-emerald-400 font-semibold px-2 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/20 block">
                    {step.status}
                  </span>
                  <span className="text-[10px] text-slate-500 font-mono mt-0.5 block">{step.cost}</span>
                </div>
              </div>
            ))}
          </div>

          <div className="p-3 rounded-xl bg-sky-950/20 border border-sky-800/40 text-xs text-slate-300 flex items-start gap-2">
            <Lightbulb className="h-4 w-4 text-sky-400 shrink-0 mt-0.5" />
            <p className="text-[11px] text-slate-300 leading-relaxed">
              <strong>Optimization Tip:</strong> All joined columns (<code className="text-sky-300 font-mono">dept_id</code>, <code className="text-sky-300 font-mono">customer_id</code>) utilize foreign key indexes to prevent expensive full-table scans.
            </p>
          </div>

          <div className="flex justify-end pt-1">
            <button
              onClick={() => setActiveTab('query')}
              className="text-xs text-sky-400 hover:text-sky-300 font-semibold"
            >
              Back to Editor ➔
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
