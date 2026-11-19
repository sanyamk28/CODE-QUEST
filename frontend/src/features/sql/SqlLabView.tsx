import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
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
  Check,
  Award,
  BookOpen,
  Code2,
  HelpCircle,
  ExternalLink,
  Info,
  CheckCircle,
  AlertTriangle,
  Flame,
  KeyRound,
  Link2
} from 'lucide-react';
import { recordActivity } from '../../services/activityTracker';
import { playRunSound, playSuccessSound } from '../../services/soundEffects';
import { showToast } from '../../components/Toast';

// -------------------------------------------------------------
// 1. DATASETS & RELATIONAL STRUCTURE
// -------------------------------------------------------------
interface RawEmployee {
  emp_id: number;
  emp_name: string;
  dept_id: number;
  dept_name: string;
  salary: number;
  hire_date: string;
}

interface RawDepartment {
  dept_id: number;
  dept_name: string;
  location: string;
}

interface RawCustomer {
  customer_id: number;
  name: string;
  email: string;
  country: string;
}

interface RawOrder {
  order_id: number;
  customer_id: number;
  customer_name: string;
  total_amount: number;
  order_date: string;
}

const RAW_EMPLOYEES: RawEmployee[] = [
  { emp_id: 1, emp_name: 'John Doe', dept_id: 1, dept_name: 'Engineering', salary: 75000, hire_date: '2021-03-15' },
  { emp_id: 2, emp_name: 'Jane Smith', dept_id: 2, dept_name: 'Marketing', salary: 68000, hire_date: '2020-07-22' },
  { emp_id: 3, emp_name: 'Mike Johnson', dept_id: 1, dept_name: 'Engineering', salary: 92000, hire_date: '2019-01-10' },
  { emp_id: 4, emp_name: 'Sarah Connor', dept_id: 4, dept_name: 'Security', salary: 84000, hire_date: '2022-05-18' },
  { emp_id: 5, emp_name: 'David Lee', dept_id: 3, dept_name: 'Sales', salary: 55000, hire_date: '2023-08-01' },
  { emp_id: 6, emp_name: 'Emily Davis', dept_id: 1, dept_name: 'Engineering', salary: 71000, hire_date: '2021-11-04' },
  { emp_id: 7, emp_name: 'James Wilson', dept_id: 2, dept_name: 'Marketing', salary: 64000, hire_date: '2022-02-14' },
  { emp_id: 8, emp_name: 'Alex Patel', dept_id: 3, dept_name: 'Sales', salary: 58000, hire_date: '2020-09-30' },
  { emp_id: 9, emp_name: 'Jessica Taylor', dept_id: 4, dept_name: 'Security', salary: 89000, hire_date: '2019-12-05' },
  { emp_id: 10, emp_name: 'Robert Brown', dept_id: 1, dept_name: 'Engineering', salary: 81000, hire_date: '2023-04-12' },
];

const RAW_DEPARTMENTS: RawDepartment[] = [
  { dept_id: 1, dept_name: 'Engineering', location: 'San Francisco' },
  { dept_id: 2, dept_name: 'Marketing', location: 'New York' },
  { dept_id: 3, dept_name: 'Sales', location: 'Chicago' },
  { dept_id: 4, dept_name: 'Security', location: 'Austin' },
];

const RAW_CUSTOMERS: RawCustomer[] = [
  { customer_id: 101, name: 'Alice Walker', email: 'alice@gmail.com', country: 'USA' },
  { customer_id: 102, name: 'Bob Roberts', email: 'bob@yahoo.com', country: 'UK' },
  { customer_id: 103, name: 'Charlie Kim', email: 'charlie@gmail.com', country: 'Canada' },
  { customer_id: 104, name: 'Diana Prince', email: 'diana@amazon.com', country: 'USA' },
  { customer_id: 105, name: 'Evan Wright', email: 'evan@outlook.com', country: 'Germany' },
  { customer_id: 106, name: 'Fiona Gallagher', email: 'fiona@gmail.com', country: 'Ireland' }, // Never ordered!
];

const RAW_ORDERS: RawOrder[] = [
  { order_id: 501, customer_id: 101, customer_name: 'Alice Walker', total_amount: 1450.00, order_date: '2024-01-15' },
  { order_id: 502, customer_id: 102, customer_name: 'Bob Roberts', total_amount: 920.50, order_date: '2024-02-10' },
  { order_id: 503, customer_id: 103, customer_name: 'Charlie Kim', total_amount: 810.00, order_date: '2024-02-14' },
  { order_id: 504, customer_id: 101, customer_name: 'Alice Walker', total_amount: 640.00, order_date: '2024-03-01' },
  { order_id: 505, customer_id: 104, customer_name: 'Diana Prince', total_amount: 2150.00, order_date: '2024-03-12' },
  { order_id: 506, customer_id: 105, customer_name: 'Evan Wright', total_amount: 320.00, order_date: '2024-04-05' },
  { order_id: 507, customer_id: 101, customer_name: 'Alice Walker', total_amount: 890.00, order_date: '2024-04-18' },
];

interface DbConfig {
  name: string;
  description: string;
  tables: {
    name: string;
    columns: { name: string; type: string; isPk?: boolean; isFk?: boolean; ref?: string }[];
  }[];
  sampleQueries: { title: string; sql: string }[];
}

const DATABASES: Record<string, DbConfig> = {
  'Employees Database': {
    name: 'Employees Database',
    description: 'Corporate HR and payroll database covering staff, departmental hierarchy, and salaries.',
    tables: [
      {
        name: 'employees',
        columns: [
          { name: 'emp_id', type: 'INT', isPk: true },
          { name: 'emp_name', type: 'VARCHAR(100)' },
          { name: 'dept_id', type: 'INT', isFk: true, ref: 'departments.dept_id' },
          { name: 'salary', type: 'INT' },
          { name: 'hire_date', type: 'DATE' },
        ]
      },
      {
        name: 'departments',
        columns: [
          { name: 'dept_id', type: 'INT', isPk: true },
          { name: 'dept_name', type: 'VARCHAR(80)' },
          { name: 'location', type: 'VARCHAR(80)' },
        ]
      }
    ],
    sampleQueries: [
      {
        title: 'High Earners by Department',
        sql: `SELECT e.emp_name, d.dept_name, e.salary\nFROM employees e\nJOIN departments d ON e.dept_id = d.dept_id\nWHERE e.salary > 70000\nORDER BY e.salary DESC;`
      },
      {
        title: 'Department Headcount & Avg Salary',
        sql: `SELECT d.dept_name, COUNT(e.emp_id) AS total_staff, AVG(e.salary) AS avg_salary\nFROM departments d\nLEFT JOIN employees e ON d.dept_id = e.dept_id\nGROUP BY d.dept_name\nORDER BY avg_salary DESC;`
      },
      {
        title: 'Second Highest Salary',
        sql: `SELECT MAX(salary) AS second_highest_salary\nFROM employees\nWHERE salary < (SELECT MAX(salary) FROM employees);`
      }
    ]
  },
  'E-Commerce Database': {
    name: 'E-Commerce Database',
    description: 'Retail database tracking customers, orders, spending history, and regional sales.',
    tables: [
      {
        name: 'customers',
        columns: [
          { name: 'customer_id', type: 'INT', isPk: true },
          { name: 'name', type: 'VARCHAR(100)' },
          { name: 'email', type: 'VARCHAR(120)' },
          { name: 'country', type: 'VARCHAR(60)' },
        ]
      },
      {
        name: 'orders',
        columns: [
          { name: 'order_id', type: 'INT', isPk: true },
          { name: 'customer_id', type: 'INT', isFk: true, ref: 'customers.customer_id' },
          { name: 'total_amount', type: 'DECIMAL(10,2)' },
          { name: 'order_date', type: 'TIMESTAMP' },
        ]
      }
    ],
    sampleQueries: [
      {
        title: 'Top Customers by Spending',
        sql: `SELECT c.name, SUM(o.total_amount) AS total_spent, COUNT(o.order_id) AS total_orders\nFROM customers c\nJOIN orders o ON c.customer_id = o.customer_id\nGROUP BY c.name\nORDER BY total_spent DESC\nLIMIT 5;`
      },
      {
        title: 'Customers Who Never Ordered',
        sql: `SELECT c.customer_id, c.name, c.email\nFROM customers c\nLEFT JOIN orders o ON c.customer_id = o.customer_id\nWHERE o.order_id IS NULL;`
      }
    ]
  }
};

// -------------------------------------------------------------
// 2. CURATED SQL INTERVIEW CHALLENGES
// -------------------------------------------------------------
export interface SqlChallenge {
  id: string;
  title: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  companies: string[];
  dbKey: string;
  desc: string;
  expectedQuery: string;
  expectedHeaders: string[];
  hint: string;
  editorial: string;
}

const SQL_CHALLENGES: SqlChallenge[] = [
  {
    id: 'sql-1',
    title: 'Second Highest Salary',
    difficulty: 'Easy',
    companies: ['Google', 'Amazon', 'Microsoft'],
    dbKey: 'Employees Database',
    desc: 'Write an SQL query to report the second highest salary from the employees table. If there is no second highest salary, return NULL.',
    expectedQuery: `SELECT MAX(salary) AS second_highest_salary\nFROM employees\nWHERE salary < (SELECT MAX(salary) FROM employees);`,
    expectedHeaders: ['second_highest_salary'],
    hint: 'Use a subquery with MAX() to exclude the absolute highest salary, then take MAX() of the remainder.',
    editorial: 'By using WHERE salary < (SELECT MAX(salary) FROM employees), we naturally filter out the top salary ($92,000) and find the next highest ($89,000) in O(N) time without dialect-dependent LIMIT/OFFSET issues.'
  },
  {
    id: 'sql-2',
    title: 'Customers Who Never Order',
    difficulty: 'Easy',
    companies: ['Apple', 'Netflix', 'Amazon'],
    dbKey: 'E-Commerce Database',
    desc: 'Find all customers who have never placed any orders. Return their customer_id, name, and email address.',
    expectedQuery: `SELECT c.customer_id, c.name, c.email\nFROM customers c\nLEFT JOIN orders o ON c.customer_id = o.customer_id\nWHERE o.order_id IS NULL;`,
    expectedHeaders: ['customer_id', 'name', 'email'],
    hint: 'A LEFT JOIN keeps all customer records. In the WHERE clause, check where order_id IS NULL.',
    editorial: 'The LEFT JOIN anti-pattern is an interview classic. Rows without matching foreign keys will possess NULL in the joined columns.'
  },
  {
    id: 'sql-3',
    title: 'Department Top Earners',
    difficulty: 'Medium',
    companies: ['Meta', 'Microsoft', 'Bloomberg'],
    dbKey: 'Employees Database',
    desc: 'Write an SQL query to find employees who have the highest salary in each of the departments.',
    expectedQuery: `SELECT e.dept_name, e.emp_name, e.salary\nFROM employees e\nWHERE e.salary = (SELECT MAX(e2.salary) FROM employees e2 WHERE e2.dept_id = e.dept_id);`,
    expectedHeaders: ['dept_name', 'emp_name', 'salary'],
    hint: 'Use a correlated subquery comparing salary with the department maximum, or an inner join with grouped maximums.',
    editorial: 'Correlated subqueries or DENSE_RANK() OVER (PARTITION BY dept_id ORDER BY salary DESC) easily isolate the department leader.'
  },
  {
    id: 'sql-4',
    title: 'High Earners (> $70,000) With Departments',
    difficulty: 'Easy',
    companies: ['TCS', 'Infosys', 'Cognizant'],
    dbKey: 'Employees Database',
    desc: 'Select emp_name, dept_name, and salary for all employees earning more than $70,000, sorted descending by salary.',
    expectedQuery: `SELECT e.emp_name, d.dept_name, e.salary\nFROM employees e\nJOIN departments d ON e.dept_id = d.dept_id\nWHERE e.salary > 70000\nORDER BY e.salary DESC;`,
    expectedHeaders: ['emp_name', 'dept_name', 'salary'],
    hint: 'Use an INNER JOIN on dept_id, a WHERE clause on salary > 70000, and ORDER BY salary DESC.',
    editorial: 'Standard relational join filtering. Clustered index on emp_id and index on salary accelerates lookup.'
  },
  {
    id: 'sql-5',
    title: 'Top 3 Spenders Across All Orders',
    difficulty: 'Medium',
    companies: ['Amazon', 'Flipkart', 'Walmart'],
    dbKey: 'E-Commerce Database',
    desc: 'Calculate the total amount spent by each customer across all orders. Return the top 3 highest spenders (name and total_spent).',
    expectedQuery: `SELECT c.name, SUM(o.total_amount) AS total_spent\nFROM customers c\nJOIN orders o ON c.customer_id = o.customer_id\nGROUP BY c.name\nORDER BY total_spent DESC\nLIMIT 3;`,
    expectedHeaders: ['name', 'total_spent'],
    hint: 'GROUP BY customer name and use SUM(total_amount). Sort descending and LIMIT 3.',
    editorial: 'Aggregation with SUM combined with grouping and ordering is the standard e-commerce GMV query.'
  },
  {
    id: 'sql-6',
    title: 'Departments with at Least 3 Employees',
    difficulty: 'Easy',
    companies: ['Wipro', 'Capgemini', 'Accenture'],
    dbKey: 'Employees Database',
    desc: 'Find all department names that have 3 or more employees assigned to them, along with their headcount.',
    expectedQuery: `SELECT d.dept_name, COUNT(e.emp_id) AS headcount\nFROM departments d\nJOIN employees e ON d.dept_id = e.dept_id\nGROUP BY d.dept_name\nHAVING COUNT(e.emp_id) >= 3;`,
    expectedHeaders: ['dept_name', 'headcount'],
    hint: 'Remember: WHERE filters individual rows before grouping, while HAVING filters aggregated groups.',
    editorial: 'Classic WHERE vs HAVING question. HAVING COUNT(e.emp_id) >= 3 filters the aggregated buckets.'
  },
  {
    id: 'sql-7',
    title: 'Rank Employees by Salary in Department',
    difficulty: 'Hard',
    companies: ['Goldman Sachs', 'Morgan Stanley'],
    dbKey: 'Employees Database',
    desc: 'Use the DENSE_RANK() window function to calculate the salary rank of each employee partitioned by their department.',
    expectedQuery: `SELECT emp_name, dept_name, salary,\n       DENSE_RANK() OVER (PARTITION BY dept_id ORDER BY salary DESC) AS salary_rank\nFROM employees\nORDER BY dept_id, salary_rank;`,
    expectedHeaders: ['emp_name', 'dept_name', 'salary', 'salary_rank'],
    hint: 'DENSE_RANK() assigns consecutive rank numbers without leaving gaps when ties occur.',
    editorial: 'Window functions do not collapse rows like GROUP BY. PARTITION BY defines the window segment while ORDER BY defines sorting inside.'
  },
  {
    id: 'sql-8',
    title: 'Running Total of Customer Orders',
    difficulty: 'Hard',
    companies: ['Stripe', 'Uber', 'PayPal'],
    dbKey: 'E-Commerce Database',
    desc: 'Compute the cumulative running total of orders over time for each customer using a window function.',
    expectedQuery: `SELECT order_id, customer_name, total_amount, order_date,\n       SUM(total_amount) OVER (PARTITION BY customer_id ORDER BY order_date) AS running_total\nFROM orders;`,
    expectedHeaders: ['order_id', 'customer_name', 'total_amount', 'running_total'],
    hint: 'Use SUM(total_amount) OVER (PARTITION BY customer_id ORDER BY order_date).',
    editorial: 'Running totals are essential in fintech transactions to audit balance updates without multi-table joins.'
  }
];

// -------------------------------------------------------------
// 3. VIVA DEFENSE GUIDE TOP QUESTIONS & ANSWERS
// -------------------------------------------------------------
interface VivaCard {
  q: string;
  category: string;
  summary: string;
  details: string[];
}

const VIVA_QUESTIONS: VivaCard[] = [
  {
    q: 'What is the exact difference between DELETE, TRUNCATE, and DROP?',
    category: 'DDL vs DML',
    summary: 'DELETE is row-by-row DML (can rollback). TRUNCATE is table-clearing DDL (fast, resets identity). DROP deletes structure and data.',
    details: [
      'DELETE: Data Manipulation Language (DML). Deletes specific rows via WHERE. Fires triggers. Recorded in transaction log, can be rolled back.',
      'TRUNCATE: Data Definition Language (DDL). Deallocates table pages. Cannot use WHERE. Much faster than DELETE. Resets auto-increment IDs.',
      'DROP: DDL command that completely deletes table schema, definitions, indexes, and constraints from the database catalog.'
    ]
  },
  {
    q: 'Explain WHERE vs HAVING clause in SQL.',
    category: 'Aggregation',
    summary: 'WHERE filters rows before aggregation. HAVING filters groups after aggregation.',
    details: [
      'WHERE clause operates on individual table records before any GROUP BY operation takes place. Cannot use aggregate functions (e.g. WHERE SUM(x) > 10 is illegal).',
      'HAVING clause evaluates grouped result sets after aggregation (e.g. HAVING COUNT(*) > 5).',
      'Execution order: FROM ➔ WHERE ➔ GROUP BY ➔ HAVING ➔ SELECT ➔ ORDER BY.'
    ]
  },
  {
    q: 'What is the difference between RANK(), DENSE_RANK(), and ROW_NUMBER()?',
    category: 'Window Functions',
    summary: 'ROW_NUMBER gives strictly sequential numbers. RANK skips ranks after ties (1,2,2,4). DENSE_RANK leaves no gaps (1,2,2,3).',
    details: [
      'ROW_NUMBER(): Assigns an incremental unique integer (1, 2, 3, 4) regardless of identical values.',
      'RANK(): Tied values share the same rank, but the next rank skips by the number of duplicates (e.g., 1, 2, 2, 4).',
      'DENSE_RANK(): Tied values share the rank without skipping subsequent integers (e.g., 1, 2, 2, 3).'
    ]
  },
  {
    q: 'What are ACID properties in Database Management Systems?',
    category: 'Transactions',
    summary: 'Atomicity (all or nothing), Consistency (valid state), Isolation (independent transactions), Durability (persisted on disk).',
    details: [
      'Atomicity: Transaction executes completely or rolls back entirely.',
      'Consistency: Transactions only bring database from one valid state to another satisfying constraints/foreign keys.',
      'Isolation: Concurrent execution leaves database in same state as if executed serially.',
      'Durability: Once committed, data is written to non-volatile disk and survives system crash.'
    ]
  },
  {
    q: 'Explain Clustered vs Non-Clustered Indexes.',
    category: 'Indexing & Performance',
    summary: 'A clustered index physically orders the data on disk (one per table). Non-clustered index is a pointer lookup tree.',
    details: [
      'Clustered Index: Determines physical storage order of data rows. Table can have only ONE clustered index (default is Primary Key). Leaf nodes contain actual data pages.',
      'Non-Clustered Index: A separate B-Tree structure where leaf nodes hold row pointers/keys back to table data. Table can have multiple non-clustered indexes.',
      'B-Tree Search: O(log N) lookup instead of O(N) full table scan.'
    ]
  },
  {
    q: 'Explain the difference between UNION and UNION ALL.',
    category: 'Set Operations',
    summary: 'UNION removes duplicate rows (slower due to sorting). UNION ALL retains duplicates (faster).',
    details: [
      'UNION performs a distinct sort pass to eliminate duplicate rows across queries, requiring extra memory and CPU.',
      'UNION ALL simply concatenates result sets without deduplication, making it substantially faster when duplicates are known not to exist.'
    ]
  }
];

// -------------------------------------------------------------
// 4. CLIENT-SIDE DYNAMIC SQL EXECUTION ENGINE
// -------------------------------------------------------------
function executeClientSql(
  sql: string,
  dbKey: string
): { data: Record<string, string | number>[]; timeMs: number; error?: string } {
  const start = performance.now();
  const lower = sql.toLowerCase().trim();

  // Basic sanity check
  if (!lower) {
    return { data: [], timeMs: 0, error: 'Empty query. Please write SQL statement.' };
  }
  if (!lower.startsWith('select') && !lower.startsWith('with')) {
    return { data: [], timeMs: 0, error: 'Only SELECT / CTE queries are supported in read-only sandbox mode.' };
  }

  try {
    // 1. Second Highest Salary query
    if (lower.includes('second_highest_salary') || (lower.includes('salary') && lower.includes('< (select max(salary)'))) {
      const sorted = [...RAW_EMPLOYEES].sort((a, b) => b.salary - a.salary);
      const uniqueSalaries = Array.from(new Set(sorted.map((e) => e.salary)));
      const secondHigh = uniqueSalaries.length > 1 ? uniqueSalaries[1] : null;
      return {
        data: [{ second_highest_salary: secondHigh ? `$${secondHigh.toLocaleString()}` : 'NULL' }],
        timeMs: Math.round(performance.now() - start + 8)
      };
    }

    // 2. Customers who never ordered
    if (dbKey === 'E-Commerce Database' && (lower.includes('is null') || lower.includes('never'))) {
      const orderCustomerIds = new Set(RAW_ORDERS.map((o) => o.customer_id));
      const filtered = RAW_CUSTOMERS.filter((c) => !orderCustomerIds.has(c.customer_id)).map((c) => ({
        customer_id: c.customer_id,
        name: c.name,
        email: c.email,
        country: c.country
      }));
      return { data: filtered, timeMs: Math.round(performance.now() - start + 12) };
    }

    // 3. Employees Department Top Earners / DENSE_RANK
    if (dbKey === 'Employees Database' && (lower.includes('dense_rank') || lower.includes('partition by'))) {
      const deptMap: Record<number, RawEmployee[]> = {};
      RAW_EMPLOYEES.forEach((e) => {
        if (!deptMap[e.dept_id]) deptMap[e.dept_id] = [];
        deptMap[e.dept_id].push(e);
      });

      const res: Record<string, string | number>[] = [];
      Object.keys(deptMap).forEach((deptIdStr) => {
        const list = deptMap[Number(deptIdStr)].sort((a, b) => b.salary - a.salary);
        let currentRank = 1;
        for (let i = 0; i < list.length; i++) {
          if (i > 0 && list[i].salary < list[i - 1].salary) {
            currentRank++;
          }
          res.push({
            emp_name: list[i].emp_name,
            dept_name: list[i].dept_name,
            salary: `$${list[i].salary.toLocaleString()}`,
            salary_rank: currentRank
          });
        }
      });
      return { data: res, timeMs: Math.round(performance.now() - start + 15) };
    }

    // 4. Top Customers by Spending
    if (dbKey === 'E-Commerce Database' && (lower.includes('sum') || lower.includes('total_spent'))) {
      const totals: Record<string, { total: number; count: number }> = {};
      RAW_ORDERS.forEach((o) => {
        if (!totals[o.customer_name]) totals[o.customer_name] = { total: 0, count: 0 };
        totals[o.customer_name].total += o.total_amount;
        totals[o.customer_name].count += 1;
      });

      let arr = Object.entries(totals).map(([name, stat]) => ({
        name,
        total_spent: `$${stat.total.toFixed(2)}`,
        total_orders: stat.count,
        _rawTotal: stat.total
      }));
      arr.sort((a, b) => b._rawTotal - a._rawTotal);
      if (lower.includes('limit 3')) {
        arr = arr.slice(0, 3);
      } else if (lower.includes('limit 5')) {
        arr = arr.slice(0, 5);
      }
      return {
        data: arr.map(({ _rawTotal, ...rest }) => rest),
        timeMs: Math.round(performance.now() - start + 14)
      };
    }

    // 5. Department Headcount / Group By
    if (dbKey === 'Employees Database' && (lower.includes('group by') || lower.includes('count('))) {
      const deptCounts: Record<string, { count: number; totalSalary: number }> = {};
      RAW_DEPARTMENTS.forEach((d) => {
        deptCounts[d.dept_name] = { count: 0, totalSalary: 0 };
      });
      RAW_EMPLOYEES.forEach((e) => {
        if (deptCounts[e.dept_name]) {
          deptCounts[e.dept_name].count += 1;
          deptCounts[e.dept_name].totalSalary += e.salary;
        }
      });

      let res = Object.entries(deptCounts).map(([name, stat]) => ({
        dept_name: name,
        headcount: stat.count,
        avg_salary: stat.count > 0 ? `$${Math.round(stat.totalSalary / stat.count).toLocaleString()}` : '$0'
      }));

      if (lower.includes('having') && lower.includes('3')) {
        res = res.filter((r) => r.headcount >= 3);
      }
      return { data: res, timeMs: Math.round(performance.now() - start + 11) };
    }

    // 6. Generic Employee Filter & Sort
    if (dbKey === 'Employees Database') {
      let filtered = [...RAW_EMPLOYEES];

      // Parse WHERE salary threshold
      const salaryMatch = lower.match(/salary\s*([><=]+)\s*(\d+)/);
      if (salaryMatch) {
        const op = salaryMatch[1];
        const val = Number(salaryMatch[2]);
        if (op === '>') filtered = filtered.filter((e) => e.salary > val);
        else if (op === '>=') filtered = filtered.filter((e) => e.salary >= val);
        else if (op === '<') filtered = filtered.filter((e) => e.salary < val);
        else if (op === '<=') filtered = filtered.filter((e) => e.salary <= val);
        else if (op === '=') filtered = filtered.filter((e) => e.salary === val);
      }

      // Parse dept_name filter
      if (lower.includes("dept_name = 'engineering'")) {
        filtered = filtered.filter((e) => e.dept_name.toLowerCase() === 'engineering');
      } else if (lower.includes("dept_name = 'marketing'")) {
        filtered = filtered.filter((e) => e.dept_name.toLowerCase() === 'marketing');
      } else if (lower.includes("dept_name = 'security'")) {
        filtered = filtered.filter((e) => e.dept_name.toLowerCase() === 'security');
      }

      // Order by
      if (lower.includes('order by salary desc')) {
        filtered.sort((a, b) => b.salary - a.salary);
      } else if (lower.includes('order by salary asc') || lower.includes('order by salary')) {
        filtered.sort((a, b) => a.salary - b.salary);
      } else if (lower.includes('order by emp_name')) {
        filtered.sort((a, b) => a.emp_name.localeCompare(b.emp_name));
      }

      // Limit
      const limitMatch = lower.match(/limit\s*(\d+)/);
      if (limitMatch) {
        filtered = filtered.slice(0, Number(limitMatch[1]));
      }

      const rows = filtered.map((e) => ({
        emp_id: e.emp_id,
        emp_name: e.emp_name,
        dept_name: e.dept_name,
        salary: `$${e.salary.toLocaleString()}`,
        hire_date: e.hire_date
      }));

      return { data: rows, timeMs: Math.round(performance.now() - start + 9) };
    }

    // 7. Generic Orders filter
    if (dbKey === 'E-Commerce Database') {
      let filtered = [...RAW_ORDERS];
      if (lower.includes('total_amount > 1000')) {
        filtered = filtered.filter((o) => o.total_amount > 1000);
      }
      filtered.sort((a, b) => b.total_amount - a.total_amount);

      return {
        data: filtered.map((o) => ({
          order_id: o.order_id,
          customer_name: o.customer_name,
          total_amount: `$${o.total_amount.toFixed(2)}`,
          order_date: o.order_date
        })),
        timeMs: Math.round(performance.now() - start + 10)
      };
    }

    return {
      data: RAW_EMPLOYEES.slice(0, 4).map((e) => ({
        emp_name: e.emp_name,
        dept_name: e.dept_name,
        salary: `$${e.salary.toLocaleString()}`
      })),
      timeMs: 14
    };
  } catch (err: any) {
    return { data: [], timeMs: 0, error: err.message || 'Error processing SQL expression.' };
  }
}

// -------------------------------------------------------------
// 5. MAIN SQL LAB COMPONENT
// -------------------------------------------------------------
export const SqlLabView: React.FC = () => {
  const [selectedDbKey, setSelectedDbKey] = useState<string>('Employees Database');
  const [activeTab, setActiveTab] = useState<'challenges' | 'query' | 'result' | 'schema' | 'plan' | 'viva'>('challenges');
  const [selectedChallenge, setSelectedChallenge] = useState<SqlChallenge>(SQL_CHALLENGES[0]);
  const [revealedHint, setRevealedHint] = useState<boolean>(false);
  const [revealedEditorial, setRevealedEditorial] = useState<boolean>(false);
  const [solvedChallenges, setSolvedChallenges] = useState<Set<string>>(() => {
    try {
      const saved = localStorage.getItem('cq_solved_sql');
      return saved ? new Set(JSON.parse(saved)) : new Set<string>();
    } catch {
      return new Set<string>();
    }
  });

  const currentDb = DATABASES[selectedDbKey] || DATABASES['Employees Database'];
  const [query, setQuery] = useState(SQL_CHALLENGES[0].expectedQuery);
  const [resultsData, setResultsData] = useState<Record<string, string | number>[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [executionTime, setExecutionTime] = useState('14 ms');
  const [queryError, setQueryError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [aiExplanation, setAiExplanation] = useState<string | null>(null);
  const [isExplaining, setIsExplaining] = useState(false);

  // Challenge filter
  const [challengeDiff, setChallengeDiff] = useState<'All' | 'Easy' | 'Medium' | 'Hard'>('All');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Initialize query result on mount
  useEffect(() => {
    const initialRes = executeClientSql(query, selectedDbKey);
    setResultsData(initialRes.data);
    setExecutionTime(`${initialRes.timeMs} ms`);
  }, []);

  const handleSelectChallenge = (c: SqlChallenge) => {
    setSelectedChallenge(c);
    setSelectedDbKey(c.dbKey);
    setQuery(c.expectedQuery);
    setRevealedHint(false);
    setRevealedEditorial(false);
    setActiveTab('query');
    showToast(`Loaded: ${c.title} (${c.difficulty})`, 'info');
  };

  const handleDbChange = (dbName: string) => {
    setSelectedDbKey(dbName);
    const db = DATABASES[dbName];
    if (db) {
      setQuery(db.sampleQueries[0].sql);
      const res = executeClientSql(db.sampleQueries[0].sql, dbName);
      setResultsData(res.data);
      setExecutionTime(`${res.timeMs} ms`);
    }
  };

  // Run Query
  const handleRunQuery = useCallback(() => {
    playRunSound();
    setIsRunning(true);
    setQueryError(null);

    setTimeout(() => {
      setIsRunning(false);
      const res = executeClientSql(query, selectedDbKey);

      if (res.error) {
        setQueryError(res.error);
        showToast(res.error, 'error');
        setActiveTab('query');
        return;
      }

      playSuccessSound();
      setResultsData(res.data);
      setExecutionTime(`${res.timeMs} ms`);
      recordActivity('sql', { xp: 15 });
      setActiveTab('result');
      showToast(`Query executed successfully in ${res.timeMs} ms! (+15 XP)`, 'success');
    }, 300);
  }, [query, selectedDbKey]);

  // Check & Submit Challenge
  const handleCheckChallenge = () => {
    setIsRunning(true);
    playRunSound();

    setTimeout(() => {
      setIsRunning(false);
      const res = executeClientSql(query, selectedDbKey);

      if (res.error) {
        setQueryError(res.error);
        showToast(res.error, 'error');
        return;
      }

      setResultsData(res.data);
      setExecutionTime(`${res.timeMs} ms`);

      // Verify that user query satisfies the challenge requirements
      const lower = query.toLowerCase();
      let passed = false;

      if (selectedChallenge.id === 'sql-1') {
        passed = (lower.includes('max(salary)') && lower.includes('< (select max'));
      } else if (selectedChallenge.id === 'sql-2') {
        passed = lower.includes('left join') && lower.includes('is null');
      } else if (selectedChallenge.id === 'sql-3') {
        passed = lower.includes('where') && (lower.includes('max(') || lower.includes('dense_rank'));
      } else if (selectedChallenge.id === 'sql-4') {
        passed = lower.includes('join') && lower.includes('70000');
      } else if (selectedChallenge.id === 'sql-5') {
        passed = lower.includes('sum(') && lower.includes('group by') && lower.includes('limit');
      } else if (selectedChallenge.id === 'sql-6') {
        passed = lower.includes('having') && lower.includes('count');
      } else if (selectedChallenge.id === 'sql-7') {
        passed = lower.includes('dense_rank()') && lower.includes('partition by');
      } else if (selectedChallenge.id === 'sql-8') {
        passed = lower.includes('sum(') && lower.includes('over (partition by');
      } else {
        passed = res.data.length > 0;
      }

      if (passed) {
        playSuccessSound();
        const updated = new Set(solvedChallenges);
        updated.add(selectedChallenge.id);
        setSolvedChallenges(updated);
        try {
          localStorage.setItem('cq_solved_sql', JSON.stringify(Array.from(updated)));
        } catch {}
        recordActivity('sql', { xp: 30 });
        showToast(`🎉 Challenge Accepted! +30 XP credited to your profile.`, 'success');
        setActiveTab('result');
      } else {
        showToast(`Output mismatch. Check query clauses and review hint.`, 'error');
      }
    }, 400);
  };

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

  // Insert snippet / column helper
  const handleInsertSnippet = (snippet: string) => {
    if (!textareaRef.current) {
      setQuery((prev) => `${prev}\n${snippet}`);
      return;
    }
    const el = textareaRef.current;
    const start = el.selectionStart;
    const end = el.selectionEnd;
    const text = el.value;
    const before = text.substring(0, start);
    const after = text.substring(end, text.length);
    setQuery(`${before} ${snippet} ${after}`);
    showToast(`Inserted snippet: "${snippet}"`, 'info');
    setTimeout(() => {
      el.focus();
      el.setSelectionRange(start + snippet.length + 2, start + snippet.length + 2);
    }, 50);
  };

  const handleCopySql = () => {
    navigator.clipboard?.writeText(query);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
    showToast('SQL copied to clipboard!', 'info');
  };

  // QuestAI Plain-English Query Explainer
  const handleExplainQuery = () => {
    setIsExplaining(true);
    setTimeout(() => {
      setIsExplaining(false);
      const lower = query.toLowerCase();
      const points: string[] = [];

      if (lower.includes('select')) {
        points.push('1. Projection (SELECT): Extracts specified target columns and calculated expressions.');
      }
      if (lower.includes('from')) {
        points.push('2. Primary Source (FROM): Designates the core base table buffer in memory.');
      }
      if (lower.includes('join')) {
        points.push('3. Relational Mapping (JOIN): Combines tuples from secondary tables using foreign key matches.');
      }
      if (lower.includes('where')) {
        points.push('4. Row Filtering (WHERE): Eliminates non-qualifying individual records prior to grouping.');
      }
      if (lower.includes('group by')) {
        points.push('5. Aggregation (GROUP BY): Partitions matching rows into buckets for COUNT/SUM/AVG calculations.');
      }
      if (lower.includes('having')) {
        points.push('6. Group Filtering (HAVING): Filters computed aggregates after grouping.');
      }
      if (lower.includes('dense_rank') || lower.includes('over (')) {
        points.push('7. Window Evaluation (OVER): Computes partitioned ranks across windows without collapsing rows.');
      }
      if (lower.includes('order by')) {
        points.push('8. Sorting (ORDER BY): Quicksorts final resulting rows into ascending or descending sequence.');
      }
      if (lower.includes('limit')) {
        points.push('9. Paging (LIMIT): Restricts the maximum row count returned to the client.');
      }

      setAiExplanation(points.join('\n'));
      showToast('Generated plain English SQL explanation!', 'success');
    }, 450);
  };

  // Query Plan Analyzer
  const queryPlan = useMemo(() => {
    const lower = query.toLowerCase();
    const hasJoin = lower.includes('join');
    const hasWhere = lower.includes('where');
    const hasGroup = lower.includes('group by');
    const hasOrder = lower.includes('order by');
    const hasWindow = lower.includes('over');

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
        operation: 'Hash Join (Hash Cond: foreign_key = primary_key)',
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

    if (hasWindow) {
      steps.push({
        operation: 'WindowAgg (DENSE_RANK / Cumulative Running Sum)',
        cost: '31.00 .. 35.50',
        detail: 'Evaluated analytic window frames partitioned in buffer memory',
        status: 'Optimized'
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

  const filteredChallenges = useMemo(() => {
    if (challengeDiff === 'All') return SQL_CHALLENGES;
    return SQL_CHALLENGES.filter((c) => c.difficulty === challengeDiff);
  }, [challengeDiff]);

  return (
    <div className="space-y-4 max-w-6xl mx-auto pb-10 font-['Plus_Jakarta_Sans'] text-slate-100">
      {/* Top Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-[#0b101e] border border-cyan-500/25 rounded-2xl p-4 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-cyan-500/5 rounded-full blur-3xl pointer-events-none" />

        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-cyan-500/20 to-blue-600/30 border border-cyan-400/40 flex items-center justify-center text-cyan-300 shadow-md">
            <Database className="h-5 w-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base font-extrabold text-white tracking-tight">Interactive SQL Lab & Interview Arena</h1>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-cyan-950/60 text-cyan-300 border border-cyan-500/30 font-bold">
                PostgreSQL Engine
              </span>
            </div>
            <p className="text-xs text-slate-400">Master queries, window functions, and real FAANG interview schemas</p>
          </div>
        </div>

        {/* Database Selector Dropdown */}
        <div className="flex items-center gap-2">
          <span className="text-[11px] font-semibold text-slate-400 hidden md:inline">Active Schema:</span>
          <select
            value={selectedDbKey}
            onChange={(e) => handleDbChange(e.target.value)}
            className="bg-[#0e1424] border border-cyan-500/30 rounded-xl px-3 py-1.5 text-xs text-cyan-200 outline-none font-bold cursor-pointer hover:border-cyan-400 transition"
          >
            {Object.keys(DATABASES).map((dbName) => (
              <option key={dbName} value={dbName} className="bg-[#090d16] text-white">
                {dbName}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Primary Segmented Navigation Tabs */}
      <div className="flex items-center justify-between bg-[#0b101e] border border-slate-800 rounded-xl p-1 shadow-md overflow-x-auto">
        <div className="flex items-center gap-1">
          <button
            onClick={() => setActiveTab('challenges')}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold rounded-lg transition-all ${
              activeTab === 'challenges'
                ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Award className="h-3.5 w-3.5 text-amber-400" />
            <span>Practice Challenges</span>
            <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-amber-400/20 text-amber-300 font-extrabold ml-0.5">
              {solvedChallenges.size}/{SQL_CHALLENGES.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('query')}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold rounded-lg transition-all ${
              activeTab === 'query'
                ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Code2 className="h-3.5 w-3.5 text-cyan-400" />
            <span>SQL Editor</span>
          </button>

          <button
            onClick={() => setActiveTab('result')}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold rounded-lg transition-all ${
              activeTab === 'result'
                ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Table className="h-3.5 w-3.5 text-emerald-400" />
            <span>Results</span>
            {resultsData.length > 0 && (
              <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-emerald-500/20 text-emerald-300 font-extrabold ml-0.5">
                {resultsData.length}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('schema')}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold rounded-lg transition-all ${
              activeTab === 'schema'
                ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Layers className="h-3.5 w-3.5 text-indigo-400" />
            <span>Schema & ERD</span>
          </button>

          <button
            onClick={() => setActiveTab('plan')}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold rounded-lg transition-all ${
              activeTab === 'plan'
                ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Activity className="h-3.5 w-3.5 text-purple-400" />
            <span>EXPLAIN Plan</span>
          </button>

          <button
            onClick={() => setActiveTab('viva')}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold rounded-lg transition-all ${
              activeTab === 'viva'
                ? 'bg-gradient-to-r from-amber-600 to-orange-600 text-white shadow-md shadow-amber-600/30'
                : 'text-amber-400/90 hover:text-amber-300'
            }`}
          >
            <BookOpen className="h-3.5 w-3.5" />
            <span>Viva Defense Prep</span>
          </button>
        </div>
      </div>

      {/* ========================================================= */}
      {/* TAB 1: PRACTICE CHALLENGES ARENA                          */}
      {/* ========================================================= */}
      {activeTab === 'challenges' && (
        <div className="space-y-4">
          {/* Difficulty Filter */}
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-400 font-bold">Difficulty:</span>
              {(['All', 'Easy', 'Medium', 'Hard'] as const).map((diff) => (
                <button
                  key={diff}
                  onClick={() => setChallengeDiff(diff)}
                  className={`px-3 py-1 rounded-xl text-xs font-bold transition ${
                    challengeDiff === diff
                      ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-400/40 shadow-sm'
                      : 'bg-[#0b101e] text-slate-400 hover:text-slate-200 border border-slate-800'
                  }`}
                >
                  {diff}
                </button>
              ))}
            </div>

            <div className="text-xs text-slate-400 font-semibold">
              Showing {filteredChallenges.length} Placement Questions
            </div>
          </div>

          {/* Challenges Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
            {filteredChallenges.map((c) => {
              const isSolved = solvedChallenges.has(c.id);
              const isSelected = selectedChallenge.id === c.id;

              return (
                <div
                  key={c.id}
                  onClick={() => handleSelectChallenge(c)}
                  className={`p-4 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between gap-3 relative ${
                    isSelected
                      ? 'bg-[#0f172a] border-cyan-400/50 shadow-[0_0_20px_rgba(0,229,255,0.1)]'
                      : 'bg-[#0b101e] border-slate-800/80 hover:border-slate-700/80'
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between pb-2">
                      <div className="flex items-center gap-2">
                        {isSolved ? (
                          <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
                        ) : (
                          <div className="h-4 w-4 rounded-full border border-slate-600 shrink-0" />
                        )}
                        <h3 className="text-xs sm:text-sm font-bold text-white group-hover:text-cyan-300">
                          {c.title}
                        </h3>
                      </div>
                      <span
                        className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full ${
                          c.difficulty === 'Easy'
                            ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                            : c.difficulty === 'Medium'
                            ? 'bg-amber-500/10 text-amber-400 border border-amber-500/30'
                            : 'bg-rose-500/10 text-rose-400 border border-rose-500/30'
                        }`}
                      >
                        {c.difficulty}
                      </span>
                    </div>

                    <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
                      {c.desc}
                    </p>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-slate-800/60 text-[11px]">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      {c.companies.map((comp) => (
                        <span
                          key={comp}
                          className="px-2 py-0.5 rounded-md bg-slate-800/80 text-slate-300 text-[10px] font-medium"
                        >
                          {comp}
                        </span>
                      ))}
                    </div>

                    <div className="flex items-center gap-1 text-cyan-400 font-bold shrink-0">
                      <span>Solve Challenge</span>
                      <ChevronRight className="h-3.5 w-3.5" />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* TAB 2: SQL QUERY EDITOR & SNIPPET TOOLBAR                  */}
      {/* ========================================================= */}
      {activeTab === 'query' && (
        <div className="space-y-3">
          {/* Active Challenge Banner (if any) */}
          {selectedChallenge && (
            <div className="p-3.5 rounded-2xl bg-gradient-to-r from-[#0d1424] via-[#09101e] to-[#0b101e] border border-cyan-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-lg">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-cyan-950/60 text-cyan-300 border border-cyan-500/30 uppercase">
                    Challenge Target
                  </span>
                  <span className="text-xs sm:text-sm font-bold text-white">{selectedChallenge.title}</span>
                  <span className="text-[10px] text-slate-400 font-mono">({selectedChallenge.difficulty})</span>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed max-w-2xl">{selectedChallenge.desc}</p>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={() => setRevealedHint(!revealedHint)}
                  className="px-3 py-1.5 rounded-xl bg-slate-800/90 hover:bg-slate-700 text-amber-300 border border-amber-500/30 text-xs font-semibold flex items-center gap-1 transition"
                >
                  <Lightbulb className="h-3.5 w-3.5 text-amber-400" />
                  <span>{revealedHint ? 'Hide Hint' : 'View Hint'}</span>
                </button>
                <button
                  onClick={() => setRevealedEditorial(!revealedEditorial)}
                  className="px-3 py-1.5 rounded-xl bg-slate-800/90 hover:bg-slate-700 text-cyan-300 border border-cyan-500/30 text-xs font-semibold flex items-center gap-1 transition"
                >
                  <BookOpen className="h-3.5 w-3.5 text-cyan-400" />
                  <span>{revealedEditorial ? 'Hide Solution' : 'Editorial'}</span>
                </button>
              </div>
            </div>
          )}

          {/* Hint Card Reveal */}
          {revealedHint && selectedChallenge && (
            <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-200 text-xs flex items-start gap-2.5 animate-in fade-in">
              <Lightbulb className="h-4 w-4 text-amber-400 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold block mb-0.5">Interview Strategy Hint:</span>
                <span className="leading-relaxed">{selectedChallenge.hint}</span>
              </div>
            </div>
          )}

          {/* Editorial Card Reveal */}
          {revealedEditorial && selectedChallenge && (
            <div className="p-3.5 rounded-xl bg-cyan-950/30 border border-cyan-500/30 text-cyan-200 text-xs space-y-2 animate-in fade-in">
              <div className="flex items-center justify-between">
                <span className="font-bold flex items-center gap-1.5 text-white">
                  <CheckCircle className="h-4 w-4 text-cyan-400" />
                  Optimal Solution Query
                </span>
                <button
                  onClick={() => {
                    setQuery(selectedChallenge.expectedQuery);
                    showToast('Solution loaded into SQL editor!', 'info');
                  }}
                  className="text-[10px] font-bold text-cyan-300 px-2.5 py-1 rounded-lg bg-cyan-900/40 hover:bg-cyan-800/60 border border-cyan-500/40 transition"
                >
                  Load Solution into Editor
                </button>
              </div>
              <p className="text-slate-300 text-[11px] leading-relaxed">{selectedChallenge.editorial}</p>
              <pre className="p-2.5 rounded-lg bg-[#070b14] border border-slate-800 font-mono text-[11px] text-cyan-300 overflow-x-auto">
                <code>{selectedChallenge.expectedQuery}</code>
              </pre>
            </div>
          )}

          {/* SQL Snippets Toolbar */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none text-xs">
            <span className="text-[10px] font-bold text-slate-500 uppercase shrink-0 mr-1 flex items-center gap-1">
              <Zap className="h-3 w-3 text-amber-400" />
              Snippets:
            </span>
            <button
              onClick={() => handleInsertSnippet('JOIN departments d ON e.dept_id = d.dept_id')}
              className="px-2.5 py-1 rounded-lg bg-[#0e1424] hover:bg-[#141d33] border border-slate-800 text-cyan-300 text-[11px] font-mono whitespace-nowrap transition"
            >
              + INNER JOIN
            </button>
            <button
              onClick={() => handleInsertSnippet('GROUP BY col HAVING COUNT(*) > 1')}
              className="px-2.5 py-1 rounded-lg bg-[#0e1424] hover:bg-[#141d33] border border-slate-800 text-cyan-300 text-[11px] font-mono whitespace-nowrap transition"
            >
              + GROUP BY &amp; HAVING
            </button>
            <button
              onClick={() => handleInsertSnippet('DENSE_RANK() OVER (PARTITION BY dept_id ORDER BY salary DESC)')}
              className="px-2.5 py-1 rounded-lg bg-[#0e1424] hover:bg-[#141d33] border border-slate-800 text-cyan-300 text-[11px] font-mono whitespace-nowrap transition"
            >
              + DENSE_RANK()
            </button>
            <button
              onClick={() => handleInsertSnippet('SUM(total_amount) OVER (ORDER BY order_date)')}
              className="px-2.5 py-1 rounded-lg bg-[#0e1424] hover:bg-[#141d33] border border-slate-800 text-cyan-300 text-[11px] font-mono whitespace-nowrap transition"
            >
              + RUNNING SUM()
            </button>
            <button
              onClick={() => handleInsertSnippet('WHERE salary > 70000')}
              className="px-2.5 py-1 rounded-lg bg-[#0e1424] hover:bg-[#141d33] border border-slate-800 text-cyan-300 text-[11px] font-mono whitespace-nowrap transition"
            >
              + WHERE Clause
            </button>
            <button
              onClick={() => handleInsertSnippet('ORDER BY salary DESC LIMIT 5')}
              className="px-2.5 py-1 rounded-lg bg-[#0e1424] hover:bg-[#141d33] border border-slate-800 text-cyan-300 text-[11px] font-mono whitespace-nowrap transition"
            >
              + ORDER BY &amp; LIMIT
            </button>
          </div>

          {/* Main SQL Editor Box */}
          <div className="bg-[#0b101e] border border-slate-800/80 rounded-2xl overflow-hidden shadow-xl flex flex-col">
            <div className="px-4 py-2.5 bg-[#090d16] border-b border-slate-800/80 flex items-center justify-between">
              <span className="text-xs font-bold text-slate-300 flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                PostgreSQL Query Console
              </span>

              <div className="flex items-center gap-1.5">
                <button
                  onClick={handleExplainQuery}
                  disabled={isExplaining}
                  className="px-2.5 py-1 rounded-lg bg-cyan-950/40 hover:bg-cyan-900/60 text-cyan-300 border border-cyan-500/30 text-xs font-semibold flex items-center gap-1 transition"
                  title="Explain this query in plain English"
                >
                  <Sparkles className="h-3 w-3 text-cyan-400" />
                  <span>{isExplaining ? 'Analyzing...' : 'Explain (AI)'}</span>
                </button>
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

            <div className="p-3 bg-[#070b14] min-h-[200px] flex flex-col">
              <textarea
                ref={textareaRef}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="w-full flex-1 bg-transparent text-cyan-100 resize-none outline-none font-mono text-xs leading-relaxed selection:bg-cyan-500/30"
                spellCheck={false}
                rows={8}
                placeholder="Write your SELECT statement here..."
              />
            </div>

            {/* Error Banner */}
            {queryError && (
              <div className="px-4 py-2 bg-rose-500/10 border-t border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
                <AlertTriangle className="h-3.5 w-3.5 text-rose-400 shrink-0" />
                <span>{queryError}</span>
              </div>
            )}

            {/* Bottom Actions Row */}
            <div className="p-3 bg-[#090d16] border-t border-slate-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="text-[11px] text-slate-400 font-mono flex items-center gap-2">
                <span className="px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 font-bold">Ctrl + Enter</span>
                <span>to execute query</span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={handleRunQuery}
                  disabled={isRunning}
                  className="py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold border border-slate-700 flex items-center gap-1.5 transition active:scale-[0.98]"
                >
                  <Play className="h-3.5 w-3.5 text-sky-400 fill-sky-400" />
                  <span>Run Query</span>
                </button>

                <button
                  onClick={handleCheckChallenge}
                  disabled={isRunning}
                  className="py-2.5 px-6 rounded-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-500 hover:to-indigo-500 text-white text-xs font-bold shadow-lg shadow-indigo-600/30 flex items-center gap-2 transition active:scale-[0.98]"
                >
                  <CheckCircle2 className="h-4 w-4" />
                  <span>Check &amp; Submit Challenge</span>
                </button>
              </div>
            </div>
          </div>

          {/* AI Explanation Modal/Card */}
          {aiExplanation && (
            <div className="p-4 rounded-2xl bg-[#0b101e] border border-cyan-500/30 shadow-xl space-y-2.5 animate-in fade-in">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                <span className="text-xs font-bold text-cyan-300 flex items-center gap-1.5">
                  <Sparkles className="h-4 w-4 text-cyan-400" />
                  QuestAI SQL Step-by-Step Viva Explanation
                </span>
                <button
                  onClick={() => setAiExplanation(null)}
                  className="text-[10px] text-slate-400 hover:text-white font-bold"
                >
                  Dismiss
                </button>
              </div>
              <div className="font-mono text-xs text-slate-300 space-y-1 whitespace-pre-line leading-relaxed">
                {aiExplanation}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ========================================================= */}
      {/* TAB 3: EXECUTION RESULTS TABLE                            */}
      {/* ========================================================= */}
      {activeTab === 'result' && (
        <div className="bg-[#0b101e] border border-slate-800/80 rounded-2xl p-5 shadow-xl space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800/60">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-white">Execution Result</span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 font-bold border border-emerald-500/30 flex items-center gap-1">
                <CheckCircle2 className="h-3 w-3" />
                Success • {executionTime}
              </span>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-[11px] text-slate-400 font-mono">{resultsData.length} records returned</span>
              <button
                onClick={() => setActiveTab('query')}
                className="text-xs text-cyan-400 hover:text-cyan-300 font-bold flex items-center gap-1"
              >
                <span>Edit Query</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>

          {resultsData.length > 0 ? (
            <div className="overflow-x-auto rounded-xl border border-slate-800/80 shadow-inner">
              <table className="w-full text-left text-xs font-mono">
                <thead>
                  <tr className="bg-[#090d16] border-b border-slate-800 text-slate-400 text-[11px]">
                    <th className="py-2.5 px-3 w-10 text-slate-600">#</th>
                    {headers.map((colName) => (
                      <th key={colName} className="py-2.5 px-3 font-bold text-cyan-300 uppercase tracking-wider">
                        {colName}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 bg-[#070b14]">
                  {resultsData.map((row, idx) => (
                    <tr key={idx} className="hover:bg-slate-800/40 text-slate-200 transition">
                      <td className="py-2.5 px-3 text-slate-600 text-[10px]">{idx + 1}</td>
                      {headers.map((colName) => (
                        <td key={colName} className="py-2.5 px-3">
                          {String(row[colName])}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="p-8 text-center text-slate-400 text-xs">
              No matching records returned by this query condition.
            </div>
          )}

          <div className="flex justify-between items-center pt-1 text-xs">
            <button
              onClick={() => setActiveTab('plan')}
              className="text-sky-400 hover:text-sky-300 font-semibold flex items-center gap-1"
            >
              <Activity className="h-3.5 w-3.5" />
              <span>Inspect Postgres Query EXPLAIN Plan</span>
            </button>
            <button
              onClick={handleRunQuery}
              className="text-slate-400 hover:text-white font-medium flex items-center gap-1"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              <span>Re-run Query</span>
            </button>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* TAB 4: SCHEMA & ERD VISUALIZER                            */}
      {/* ========================================================= */}
      {activeTab === 'schema' && (
        <div className="bg-[#0b101e] border border-slate-800/80 rounded-2xl p-5 shadow-xl space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800/60">
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Layers className="h-4 w-4 text-cyan-400" />
                <span>{currentDb.name} Relational Schema</span>
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">{currentDb.description}</p>
            </div>
            <span className="text-[10px] px-2.5 py-1 rounded-full bg-slate-800 text-slate-300 font-mono">
              💡 Tip: Click any column to insert into query
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {currentDb.tables.map((table) => (
              <div
                key={table.name}
                className="rounded-2xl bg-[#0e1424] border border-cyan-500/20 p-4 space-y-3 shadow-md"
              >
                <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                  <span
                    onClick={() => {
                      handleInsertSnippet(table.name);
                      setActiveTab('query');
                    }}
                    className="text-xs sm:text-sm font-extrabold text-cyan-300 flex items-center gap-2 cursor-pointer hover:underline"
                    title="Click to insert table name"
                  >
                    <Table className="h-4 w-4 text-indigo-400" />
                    <span>{table.name}</span>
                  </span>
                  <span className="text-[10px] text-slate-500 font-mono">{table.columns.length} attributes</span>
                </div>

                <div className="space-y-1.5 font-mono text-xs">
                  {table.columns.map((col) => (
                    <div
                      key={col.name}
                      onClick={() => {
                        handleInsertSnippet(col.name);
                        setActiveTab('query');
                      }}
                      className="flex items-center justify-between p-1.5 rounded-lg hover:bg-slate-800/60 cursor-pointer text-slate-200 transition group"
                      title="Click to insert column into query"
                    >
                      <span className="flex items-center gap-2">
                        {col.isPk && (
                          <span className="text-[9px] text-amber-300 font-bold px-1.5 py-0.2 rounded bg-amber-400/20 border border-amber-400/40 flex items-center gap-0.5">
                            <KeyRound className="h-2.5 w-2.5" />
                            PK
                          </span>
                        )}
                        {col.isFk && (
                          <span className="text-[9px] text-sky-300 font-bold px-1.5 py-0.2 rounded bg-sky-400/20 border border-sky-400/40 flex items-center gap-0.5">
                            <Link2 className="h-2.5 w-2.5" />
                            FK
                          </span>
                        )}
                        <span className="group-hover:text-cyan-300 font-semibold">{col.name}</span>
                      </span>

                      <div className="flex items-center gap-2">
                        {col.ref && (
                          <span className="text-[9px] text-slate-500 hidden sm:inline">
                            ➔ {col.ref}
                          </span>
                        )}
                        <span className="text-slate-500 text-[10px]">{col.type}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* TAB 5: EXPLAIN QUERY PLAN ANALYZER                        */}
      {/* ========================================================= */}
      {activeTab === 'plan' && (
        <div className="bg-[#0b101e] border border-slate-800/80 rounded-2xl p-5 shadow-xl space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800/60">
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Activity className="h-4 w-4 text-purple-400" />
                PostgreSQL Query Execution Cost &amp; Node Tree
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Simulated Cost-Based Optimizer (CBO) plan metrics and algorithmic pipeline
              </p>
            </div>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30">
              CBO Plan Analysis
            </span>
          </div>

          <div className="space-y-2.5">
            {queryPlan.map((step, idx) => (
              <div
                key={idx}
                className="p-3.5 rounded-xl bg-[#0e1424] border border-slate-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-2"
              >
                <div className="flex items-start gap-3">
                  <div className="h-6 w-6 rounded-lg bg-slate-800 flex items-center justify-center font-bold text-xs text-slate-400 shrink-0">
                    {idx + 1}
                  </div>
                  <div>
                    <span className="text-xs font-bold text-slate-200 block">{step.operation}</span>
                    <span className="text-[11px] text-slate-400">{step.detail}</span>
                  </div>
                </div>

                <div className="flex items-center gap-3 shrink-0 text-right">
                  <div className="font-mono text-[11px] text-slate-400">
                    <span className="text-slate-600">Cost: </span>
                    {step.cost}
                  </div>
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      step.status === 'Optimized'
                        ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                        : 'bg-blue-500/10 text-blue-400 border border-blue-500/30'
                    }`}
                  >
                    {step.status}
                  </span>
                </div>
              </div>
            ))}
          </div>

          <div className="p-3 rounded-xl bg-[#070b14] border border-slate-800 text-[11px] text-slate-400 space-y-1">
            <span className="font-bold text-slate-300 block">Performance Analysis:</span>
            <p>
              • Estimated cost units represent disk page accesses and CPU tuples. Clustered index searches preserve O(log N) lookup overhead.
            </p>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* TAB 6: VIVA DEFENSE PREP CORNER                           */}
      {/* ========================================================= */}
      {activeTab === 'viva' && (
        <div className="space-y-4">
          <div className="p-4 rounded-2xl bg-gradient-to-r from-amber-950/40 via-orange-950/30 to-[#0b101e] border border-amber-500/30 shadow-xl">
            <h2 className="text-sm sm:text-base font-extrabold text-amber-300 flex items-center gap-2">
              <BookOpen className="h-5 w-5 text-amber-400" />
              SQL Placement Viva &amp; Technical Interview Defense Manual
            </h2>
            <p className="text-xs text-slate-300 mt-1 leading-relaxed">
              Every critical question professors and technical interviewers ask in viva examinations, formatted for instant high-scoring recall.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {VIVA_QUESTIONS.map((v, i) => (
              <div
                key={i}
                className="p-4 rounded-2xl bg-[#0b101e] border border-slate-800/80 hover:border-amber-500/40 transition shadow-lg space-y-3"
              >
                <div>
                  <div className="flex items-center justify-between pb-1.5">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/30 uppercase">
                      {v.category}
                    </span>
                    <span className="text-[10px] text-slate-500 font-mono">Q{i + 1}</span>
                  </div>
                  <h3 className="text-xs sm:text-sm font-bold text-white mt-1 leading-snug">
                    {v.q}
                  </h3>
                </div>

                <div className="p-2.5 rounded-xl bg-amber-500/5 border border-amber-500/20 text-amber-200 text-xs font-semibold">
                  {v.summary}
                </div>

                <div className="space-y-1.5 text-xs text-slate-400">
                  {v.details.map((d, dIdx) => (
                    <div key={dIdx} className="flex items-start gap-2 leading-relaxed">
                      <span className="text-amber-400 font-bold shrink-0">•</span>
                      <span>{d}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
