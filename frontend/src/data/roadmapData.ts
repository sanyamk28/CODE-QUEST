export interface RoadmapStep {
  id: number;
  step: string;
  desc: string;
  details?: string[];
  durationWeeks?: number;
  completed: boolean;
}

export interface LanguageRoadmap {
  languageId: string;
  languageName: string;
  icon: string;
  badge: string;
  roleTitle: string;
  tagline: string;
  difficulty: 'Beginner to Advanced' | 'Intermediate to Pro' | 'Specialist Track';
  estimatedMonths: number;
  capstoneProject: {
    title: string;
    description: string;
    skills: string[];
  };
  steps: RoadmapStep[];
}

export const LANGUAGE_ROADMAPS: Record<string, LanguageRoadmap> = {
  python: {
    languageId: 'python',
    languageName: 'Python',
    icon: '🐍',
    badge: 'Python Specialist Track',
    roleTitle: 'Python Backend & AI Systems Engineer',
    tagline: 'Master Python syntax, memory internals, asyncio concurrency, FastAPI, and data engineering fundamentals.',
    difficulty: 'Beginner to Advanced',
    estimatedMonths: 4,
    capstoneProject: {
      title: 'Real-Time Distributed Task Queue & Web Scraper',
      description: 'Architect an asynchronous distributed scraper and background queue engine using Python Asyncio, FastAPI, Redis, and SQLAlchemy.',
      skills: ['FastAPI', 'Asyncio', 'Redis', 'SQLAlchemy', 'Docker']
    },
    steps: [
      {
        id: 1,
        step: '1. Python Core, Idiomatic Syntax & OOP',
        desc: 'List & dict comprehensions, generators, iterators, magic dunder methods, and object-oriented principles.',
        details: ['Mutable vs Immutable objects', 'Generators with yield', 'Dunder methods (__iter__, __call__, __repr__)', 'OOP inheritance & polymorphism'],
        durationWeeks: 3,
        completed: false
      },
      {
        id: 2,
        step: '2. Python Memory, GIL & Advanced Metaprogramming',
        desc: 'CPython internals, Global Interpreter Lock, reference counting, cyclic GC, custom decorators, and context managers.',
        details: ['CPython GIL mechanics', 'Cyclic Garbage Collection', 'Parametric decorators & functools.wraps', 'Context managers (__enter__ / __exit__)'],
        durationWeeks: 3,
        completed: false
      },
      {
        id: 3,
        step: '3. Data Structures & Algorithms in Python',
        desc: 'Mastering arrays, strings, two-pointers, hash maps, heaps (heapq), bisect, trees, and dynamic programming.',
        details: ['Collections module (deque, Counter, defaultdict)', 'Heaps & PriorityQueues with heapq', 'Binary Search with bisect', 'DP state transition in Python'],
        durationWeeks: 4,
        completed: false
      },
      {
        id: 4,
        step: '4. Asynchronous Concurrency & FastAPI REST Microservices',
        desc: 'Non-blocking I/O with asyncio, event loop, coroutines, FastAPI endpoint design, and Pydantic validation.',
        details: ['async / await and Event Loop tasks', 'FastAPI dependency injection', 'Pydantic v2 schemas and validation', 'Async database sessions with asyncpg'],
        durationWeeks: 4,
        completed: false
      },
      {
        id: 5,
        step: '5. Production Testing, Profiling & Cloud Deployment',
        desc: 'Pytest test suites, coverage reports, cProfile runtime profiling, Docker containerization, and CI/CD pipelines.',
        details: ['Pytest fixtures & parameterized testing', 'cProfile and memory_profiler', 'Multi-stage Docker builds', 'GitHub Actions automated testing'],
        durationWeeks: 2,
        completed: false
      }
    ]
  },

  java: {
    languageId: 'java',
    languageName: 'Java',
    icon: '☕',
    badge: 'Java Enterprise Track',
    roleTitle: 'Java Enterprise & Distributed Microservices Architect',
    tagline: 'Deep dive into JVM architecture, garbage collection, collections framework, multithreading, and Spring Boot.',
    difficulty: 'Intermediate to Pro',
    estimatedMonths: 5,
    capstoneProject: {
      title: 'High-Throughput E-Commerce Microservices Engine',
      description: 'Build a distributed shopping cart and order processing backend using Spring Boot, Hibernate, Apache Kafka, and PostgreSQL.',
      skills: ['Java 17/21', 'Spring Boot', 'Hibernate/JPA', 'Kafka', 'PostgreSQL']
    },
    steps: [
      {
        id: 1,
        step: '1. Modern Java Core, Lambdas & Stream API',
        desc: 'OOP, interfaces with default methods, functional interfaces, method references, and lazy Stream pipelines.',
        details: ['Java 8+ Lambdas & Functional Interfaces', 'Stream API (map, filter, flatMap, collect)', 'Optional handling and Records (Java 14+)', 'Exception hierarchy & AutoCloseable'],
        durationWeeks: 3,
        completed: false
      },
      {
        id: 2,
        step: '2. JVM Architecture, Memory Layout & GC Tuning',
        desc: 'Stack vs Heap memory, String constant pool, Metaspace, and Garbage Collectors (G1, ZGC, Shenandoah).',
        details: ['Heap generations (Eden, Survivor, Tenured)', 'String Constant Pool & immutability', 'G1 GC region allocation & tuning', 'ClassLoader delegation model'],
        durationWeeks: 3,
        completed: false
      },
      {
        id: 3,
        step: '3. Java Collections Framework Deep Dive',
        desc: 'HashMap internal bucket treeification, ConcurrentHashMap lock striping, ArrayList resizing, and PriorityQueue.',
        details: ['HashMap bucket Red-Black trees (O(log N))', 'ConcurrentHashMap CAS operations', 'LinkedHashMap and LRU cache design', 'equals() and hashCode() contract'],
        durationWeeks: 4,
        completed: false
      },
      {
        id: 4,
        step: '4. Multithreading, Concurrency & Java Memory Model',
        desc: 'Thread pools, volatile keyword, synchronized locks, ReentrantLock, CountDownLatch, and ExecutorService.',
        details: ['Volatile visibility and instruction reordering', 'ExecutorService & ThreadPoolExecutor', 'CompletableFuture async chaining', 'ForkJoinPool and Virtual Threads (Project Loom)'],
        durationWeeks: 4,
        completed: false
      },
      {
        id: 5,
        step: '5. Enterprise Spring Boot & Distributed Architecture',
        desc: 'Spring Boot REST APIs, Spring Data JPA/Hibernate, security authentication, and distributed Kafka messaging.',
        details: ['Dependency Injection & IoC container', 'JPA N+1 query troubleshooting', 'Spring Security with JWT', 'Kafka event-driven microservices'],
        durationWeeks: 4,
        completed: false
      }
    ]
  },

  cpp: {
    languageId: 'cpp',
    languageName: 'C++',
    icon: '⚡',
    badge: 'C++ Systems Track',
    roleTitle: 'C++ Systems & Low-Latency Performance Engineer',
    tagline: 'Master modern C++ (C++17/20), pointers, RAII, memory layouts, move semantics, and template metaprogramming.',
    difficulty: 'Specialist Track',
    estimatedMonths: 6,
    capstoneProject: {
      title: 'High-Frequency Order Matching Engine & Cache',
      description: 'Implement a lock-free, zero-allocation limit order book and in-memory key-value cache using C++20 and custom memory pools.',
      skills: ['Modern C++20', 'Lock-Free Atomics', 'Custom Allocators', 'POSIX Sockets', 'Google Benchmark']
    },
    steps: [
      {
        id: 1,
        step: '1. Modern C++ Fundamentals, Pointers & References',
        desc: 'Pointer arithmetic, const correctness, reference semantics, stack vs heap, and dynamic memory safety.',
        details: ['Pointers vs References and dereferencing', 'Const pointers vs pointer to const', 'Memory leaks & undefined behavior prevention', 'Stack frames and heap fragmentation'],
        durationWeeks: 3,
        completed: false
      },
      {
        id: 2,
        step: '2. RAII, Smart Pointers & Object Lifetimes',
        desc: 'Resource Acquisition Is Initialization, std::unique_ptr, std::shared_ptr, weak_ptr, and custom deleters.',
        details: ['Strict ownership with std::unique_ptr', 'Reference counting and control blocks in shared_ptr', 'Breaking circular references with weak_ptr', 'Virtual destructors for base classes'],
        durationWeeks: 3,
        completed: false
      },
      {
        id: 3,
        step: '3. Standard Template Library (STL) Mastery',
        desc: 'std::vector capacity doubling, std::map (Red-Black tree) vs std::unordered_map (hash table), and iterators.',
        details: ['Vector reallocation and iterator invalidation', 'Red-Black tree node balancing in std::map', 'Hash collisions and load factor in unordered_map', 'STL algorithms (std::sort, std::binary_search)'],
        durationWeeks: 4,
        completed: false
      },
      {
        id: 4,
        step: '4. Move Semantics, Rvalues & Generic Templates',
        desc: 'Rvalue references (T&&), std::move, copy elision (RVO), perfect forwarding, and template specialization.',
        details: ['Move constructor & move assignment operator', 'Rule of Five (Destructor, Copy/Move ops)', 'std::forward and universal references', 'Template specialization & SFINAE basics'],
        durationWeeks: 4,
        completed: false
      },
      {
        id: 5,
        step: '5. Low-Latency Concurrency & Cache Optimization',
        desc: 'std::thread, std::atomic, memory order models, cache line false sharing, and CPU hardware alignment.',
        details: ['Hardware atomic CAS instructions', 'std::mutex vs lock-free ring buffers', 'Data structure alignment and padding', 'Benchmarking with Google Benchmark'],
        durationWeeks: 4,
        completed: false
      }
    ]
  },

  javascript: {
    languageId: 'javascript',
    languageName: 'JavaScript / TypeScript',
    icon: '🌐',
    badge: 'Full-Stack Web Track',
    roleTitle: 'Full-Stack JavaScript & TypeScript Engineer',
    tagline: 'Master the V8 runtime, Event Loop, closures, asynchronous patterns, TypeScript strict typing, and React architecture.',
    difficulty: 'Beginner to Advanced',
    estimatedMonths: 4,
    capstoneProject: {
      title: 'Collaborative Real-Time Workspace Platform',
      description: 'Architect a full-stack real-time document editor using React 18, TypeScript, Node.js WebSockets, and Redis pub/sub.',
      skills: ['React 18', 'TypeScript', 'Node.js', 'WebSockets', 'TailwindCSS']
    },
    steps: [
      {
        id: 1,
        step: '1. JavaScript Engine, Execution Context & Event Loop',
        desc: 'Call stack, microtasks vs macrotasks, hoisting, Temporal Dead Zone, and closure memory models.',
        details: ['Call Stack and Task Queue mechanics', 'Promise microtasks priority over setTimeout', 'Lexical environment and closures', 'var vs let vs const scoping'],
        durationWeeks: 3,
        completed: false
      },
      {
        id: 2,
        step: '2. Asynchronous Patterns & Modern ES6+ Features',
        desc: 'Promises, async/await, error handling, debouncing, throttling, and modern object/array manipulation.',
        details: ['Promise.all vs Promise.allSettled', 'async/await try-catch patterns', 'Prototypal inheritance (__proto__ and prototype)', 'Debounce and throttle implementation'],
        durationWeeks: 3,
        completed: false
      },
      {
        id: 3,
        step: '3. TypeScript Strict Type Architecture & Generics',
        desc: 'Interfaces, type unions, generics, mapped types, utility types, and unknown vs any vs never.',
        details: ['Interfaces vs Type aliases (Declaration merging)', 'Generics and constrained type parameters', 'Utility types (Partial, Pick, Omit, Record)', 'Exhaustive pattern checks with never type'],
        durationWeeks: 4,
        completed: false
      },
      {
        id: 4,
        step: '4. React 18 Component Architecture & State Management',
        desc: 'Virtual DOM, reconciliation (Fiber), hooks (useMemo, useCallback), and performance optimization.',
        details: ['Virtual DOM diffing & Fiber tree', 'useMemo and useCallback profiling', 'Custom hooks and reusable state logic', 'State management patterns and Context'],
        durationWeeks: 4,
        completed: false
      },
      {
        id: 5,
        step: '5. Node.js Backend, REST APIs & Full-Stack Deployment',
        desc: 'Node.js event loop, streams, Express/Fastify REST endpoints, JWT authentication, and cloud deployment.',
        details: ['Node.js streams and buffer handling', 'RESTful API architecture & CORS', 'JWT token authentication & middleware', 'Vercel / Docker container deployment'],
        durationWeeks: 3,
        completed: false
      }
    ]
  },

  sql: {
    languageId: 'sql',
    languageName: 'SQL & Databases',
    icon: '🗄️',
    badge: 'Database Architect Track',
    roleTitle: 'Data Engineer & Database Architect',
    tagline: 'Master complex queries, indexing strategies, analytical window functions, transactions, and performance tuning.',
    difficulty: 'Intermediate to Pro',
    estimatedMonths: 4,
    capstoneProject: {
      title: 'Multi-Tenant Analytics Warehouse & ETL Pipeline',
      description: 'Design a normalized OLTP schema and denormalized analytical warehouse with automated partitioning and materialized views.',
      skills: ['PostgreSQL', 'Complex Joins', 'Window Functions', 'Query Optimization', 'ETL']
    },
    steps: [
      {
        id: 1,
        step: '1. Relational Modeling, DDL & Schema Normalization',
        desc: 'Primary keys, foreign keys, table constraints, and 1NF through BCNF normalization rules.',
        details: ['Candidate keys and composite primary keys', 'Referential integrity and cascade rules', 'Normalization 1NF, 2NF, 3NF and BCNF', 'Data integrity check constraints'],
        durationWeeks: 3,
        completed: false
      },
      {
        id: 2,
        step: '2. Complex SQL Joins, Aggregations & Subqueries',
        desc: 'INNER, LEFT, RIGHT, FULL OUTER, CROSS, and self-joins, GROUP BY, HAVING, and correlated subqueries.',
        details: ['Multi-table join condition evaluation', 'WHERE vs HAVING filtering order', 'Correlated subqueries vs derived tables', 'Common Table Expressions (WITH clause)'],
        durationWeeks: 3,
        completed: false
      },
      {
        id: 3,
        step: '3. Analytical Window Functions & Advanced Reporting',
        desc: 'ROW_NUMBER(), RANK(), DENSE_RANK(), PARTITION BY, running totals, and moving averages.',
        details: ['Ranking with RANK() vs DENSE_RANK()', 'PARTITION BY and ORDER BY within windows', 'LEAD() and LAG() for time-series deltas', 'Cumulative SUM() and rolling averages'],
        durationWeeks: 4,
        completed: false
      },
      {
        id: 4,
        step: '4. B-Tree Indexes, Query Optimization & EXPLAIN Plans',
        desc: 'Clustered vs non-clustered indexes, compound index prefix rule, and analyzing EXPLAIN plans.',
        details: ['B+Tree structure and leaf node range scans', 'Compound index leftmost prefix rule', 'Reading EXPLAIN ANALYZE execution cost', 'Sequential scan elimination techniques'],
        durationWeeks: 4,
        completed: false
      },
      {
        id: 5,
        step: '5. ACID Transactions, Isolation Levels & Sharding',
        desc: 'Atomicity, consistency, isolation levels (Dirty reads, Non-repeatable, Phantom reads), and deadlocks.',
        details: ['Read Committed vs Repeatable Read vs Serializable', 'Deadlock detection and victim rollback', 'Write-Ahead Logging (WAL) recovery', 'Table partitioning and horizontal sharding'],
        durationWeeks: 3,
        completed: false
      }
    ]
  },

  general: {
    languageId: 'general',
    languageName: 'Core CS & Placement',
    icon: '💻',
    badge: 'CS Placement Track',
    roleTitle: 'Campus Placement & Core CS General Track',
    tagline: 'Comprehensive placement benchmark covering DSA, Operating Systems, Computer Networks, and System Design.',
    difficulty: 'Beginner to Advanced',
    estimatedMonths: 5,
    capstoneProject: {
      title: 'Full-Stack Scalable Placement Preparation Platform',
      description: 'Design and deploy an end-to-end coding arena and live multiplayer contest platform with real-time ranking.',
      skills: ['DSA', 'Operating Systems', 'Networking', 'System Design', 'PostgreSQL']
    },
    steps: [
      {
        id: 1,
        step: '1. Core Data Structures & Algorithm Foundations',
        desc: 'Arrays, Two Pointers, Linked Lists, Stacks, Queues, Binary Trees, and sorting algorithms.',
        details: ['Two Pointers & Sliding Window techniques', 'Stack and Queue implementations', 'Binary Tree traversals (Inorder, Preorder, Postorder)', 'Sorting Big-O analysis (Quicksort, Mergesort, Heapsort)'],
        durationWeeks: 4,
        completed: false
      },
      {
        id: 2,
        step: '2. Operating Systems & Memory Management',
        desc: 'Process vs thread, CPU scheduling algorithms, virtual memory paging, thrashing, and deadlocks.',
        details: ['Round Robin, SJF, and priority scheduling', 'Coffman conditions for Deadlock', 'Virtual memory, page tables, and TLB', 'Semaphores vs Mutex synchronization'],
        durationWeeks: 3,
        completed: false
      },
      {
        id: 3,
        step: '3. Computer Networks & Internet Protocols',
        desc: 'OSI 7 layers, TCP 3-way handshake, UDP, DNS resolution, HTTP/1.1 vs HTTP/2, and TLS handshakes.',
        details: ['Layer 4 Transport (TCP vs UDP)', 'TCP flow control and congestion avoidance', 'DNS record types (A, CNAME, MX)', 'HTTPS TLS symmetric/asymmetric handshake'],
        durationWeeks: 3,
        completed: false
      },
      {
        id: 4,
        step: '4. Database Systems, Schema Design & Indexing',
        desc: 'Relational database core, normalization, B-Tree indexes, transactions, and ACID properties.',
        details: ['Relational schema normalization (1NF-3NF)', 'B-Tree range query performance', 'ACID transactions and concurrency', 'INNER vs LEFT vs OUTER joins'],
        durationWeeks: 4,
        completed: false
      },
      {
        id: 5,
        step: '5. System Design, Scalability & Placement Mocks',
        desc: 'CAP theorem, load balancing, caching (Redis), database sharding, microservices, and live mock tests.',
        details: ['CAP Theorem trade-offs (CP vs AP)', 'Cache-Aside and write-through caching', 'Load balancing algorithms (Round Robin, IP Hash)', 'Message queues and horizontal scaling'],
        durationWeeks: 4,
        completed: false
      }
    ]
  }
};
