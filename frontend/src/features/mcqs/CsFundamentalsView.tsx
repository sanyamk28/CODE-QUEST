import React, { useState, useEffect, useMemo } from 'react';
import {
  Layers,
  CheckCircle2,
  XCircle,
  ArrowRight,
  ArrowLeft,
  Sparkles,
  Trophy,
  RotateCcw,
  Zap,
  Lock,
  Unlock,
  Award,
  BookOpen,
  Clock,
  Check,
  AlertCircle,
  BarChart3,
  Cpu,
  Network,
  Database,
  GitBranch,
  ShieldCheck,
  HelpCircle,
  Lightbulb,
  Flame,
  Activity,
  Compass
} from 'lucide-react';
import { recordActivity } from '../../services/activityTracker';
import { playRunSound, playSuccessSound } from '../../services/soundEffects';
import { showToast } from '../../components/Toast';

export interface LeveledMcq {
  id: number;
  level: number;
  topic: 'Operating Systems' | 'DBMS' | 'Computer Networks' | 'System Design' | 'Data Structures';
  question: string;
  options: string[];
  correct: number;
  explanation: string;
  vivaTip: string;
}

export const LEVELED_MCQS: LeveledMcq[] = [
  // --- LEVEL 1: FOUNDATION & BASICS ---
  {
    id: 1,
    level: 1,
    topic: 'Operating Systems',
    question: 'Which of the following CPU scheduling algorithms is completely non-preemptive?',
    options: [
      'Round Robin (RR)',
      'First-Come, First-Served (FCFS)',
      'Shortest Remaining Time First (SRTF)',
      'Priority Scheduling (Preemptive)'
    ],
    correct: 1,
    explanation: 'First-Come, First-Served (FCFS) schedules processes in arrival order. Once a process gains CPU, it executes until it terminates or blocks for I/O, making it non-preemptive.',
    vivaTip: 'In viva: "Sir, FCFS is non-preemptive because the kernel scheduler never interrupts an executing process until it voluntarily yields or halts."'
  },
  {
    id: 2,
    level: 1,
    topic: 'Data Structures',
    question: 'What is the average time complexity to search for a key in a balanced Binary Search Tree (AVL / Red-Black)?',
    options: ['O(1)', 'O(log N)', 'O(N)', 'O(N log N)'],
    correct: 1,
    explanation: 'In balanced BSTs, tree height is strictly maintained at O(log N), guaranteeing O(log N) search, insertion, and deletion times.',
    vivaTip: 'In viva: "A balanced BST guarantees tree depth is bounded by log2(N), which halves the search space at each branch comparison."'
  },
  {
    id: 3,
    level: 1,
    topic: 'DBMS',
    question: 'Which SQL clause is used to filter records resulting from an aggregate function like COUNT() or SUM()?',
    options: ['WHERE', 'ORDER BY', 'HAVING', 'GROUP BY'],
    correct: 2,
    explanation: 'HAVING filters aggregated grouped results, whereas WHERE filters individual rows before grouping.',
    vivaTip: 'In viva: "WHERE operates at row-level before grouping; HAVING operates at group-level after aggregate buckets are formed."'
  },
  {
    id: 4,
    level: 1,
    topic: 'Computer Networks',
    question: 'At which layer of the OSI model does the Internet Protocol (IP) operate?',
    options: ['Transport Layer', 'Data Link Layer', 'Network Layer', 'Session Layer'],
    correct: 2,
    explanation: 'IP is the fundamental Network Layer (Layer 3) protocol responsible for logical packet addressing and routing across subnets.',
    vivaTip: 'In viva: "Layer 3 handles logical IP addressing and path determination across heterogeneous intermediate networks."'
  },
  {
    id: 5,
    level: 1,
    topic: 'Data Structures',
    question: 'Which data structure operates on a Last-In, First-Out (LIFO) order?',
    options: ['Queue', 'Stack', 'Linked List', 'Binary Heap'],
    correct: 1,
    explanation: 'Stack enforces LIFO ordering where the most recently pushed element is the first one popped.',
    vivaTip: 'In viva: "Stacks use LIFO, utilized in recursive call stacks, depth-first search, and undo operations in text editors."'
  },

  // --- LEVEL 2: CORE COMPUTER SCIENCE ---
  {
    id: 6,
    level: 2,
    topic: 'Operating Systems',
    question: 'What primary resource is shared among threads of the same process?',
    options: [
      'CPU Registers',
      'Call Stack',
      'Address space and Heap memory',
      'Program Counter'
    ],
    correct: 2,
    explanation: 'Threads within a process share the text, data, and heap segments of the address space and open file descriptors, but each thread has its own register state and call stack.',
    vivaTip: 'In viva: "Threads share virtual address space, heap memory, and open file handles, but retain private stacks and program counters."'
  },
  {
    id: 7,
    level: 2,
    topic: 'DBMS',
    question: 'Why are B+ Trees preferred over B Trees for relational database indexing on disks?',
    options: [
      'B+ Trees store duplicate keys everywhere',
      'All data records/pointers are stored only at the leaf nodes, which are linked as a doubly-linked list for fast range queries',
      'B+ Trees do not require rebalancing during insertions',
      'B+ Trees require less memory for leaf nodes'
    ],
    correct: 1,
    explanation: 'In B+ Trees, internal nodes only hold search keys for routing, allowing higher branching factor, while all records reside in linked leaf nodes for rapid sequential range scanning.',
    vivaTip: 'In viva: "B+ Tree leaf nodes form a sequential linked list, drastically accelerating BETWEEN / range queries without parent node backtracking."'
  },
  {
    id: 8,
    level: 2,
    topic: 'Computer Networks',
    question: 'What are the three flags exchanged during a standard TCP connection establishment handshake?',
    options: [
      'SYN, ACK, FIN',
      'SYN, SYN-ACK, ACK',
      'ACK, ACK-SYN, PUSH',
      'RST, SYN, ACK'
    ],
    correct: 1,
    explanation: 'Client sends SYN; Server responds with SYN-ACK; Client acknowledges with ACK. Data transfer begins after this 3-way handshake.',
    vivaTip: 'In viva: "Client initiates SYN (x), Server responds SYN (y) + ACK (x+1), Client confirms ACK (y+1) to synchronize sequence numbers."'
  },
  {
    id: 9,
    level: 2,
    topic: 'Operating Systems',
    question: 'Which of the following is NOT one of the 4 Coffman conditions required for Deadlock?',
    options: [
      'Mutual Exclusion',
      'Hold and Wait',
      'Preemption of resources by OS',
      'Circular Wait'
    ],
    correct: 2,
    explanation: 'The condition is NO Preemption (resources cannot be forcibly taken). If preemption is allowed, deadlock cannot occur.',
    vivaTip: 'In viva: "The 4 Coffman conditions are Mutual Exclusion, Hold and Wait, No Preemption, and Circular Wait. Breaking any one breaks deadlock."'
  },
  {
    id: 10,
    level: 2,
    topic: 'Data Structures',
    question: 'What is the worst-case time complexity of QuickSort when a naive pivot strategy is applied to an already sorted array?',
    options: ['O(N log N)', 'O(N)', 'O(N²)', 'O(log N)'],
    correct: 2,
    explanation: 'If the first or last element is chosen as pivot on an already sorted array, partitions become unbalanced (sizes 0 and N-1), causing O(N²) quadratic comparisons.',
    vivaTip: 'In viva: "Naive pivot on sorted inputs causes degenerate partitions of size 1 and N-1, yielding O(N²) recursion tree depth."'
  },
  {
    id: 11,
    level: 2,
    topic: 'DBMS',
    question: 'What does the "I" represent in the ACID properties of transactional databases?',
    options: ['Integrity', 'Isolation', 'Indexing', 'Idempotency'],
    correct: 1,
    explanation: 'Isolation ensures concurrent transactions execute without interfering with one another, preventing dirty reads and phantom reads.',
    vivaTip: 'In viva: "Isolation guarantees that multiple concurrent transactions produce the same state as if executed sequentially."'
  },

  // --- LEVEL 3: INTERMEDIATE SYSTEMS ---
  {
    id: 12,
    level: 3,
    topic: 'Operating Systems',
    question: 'What is "Thrashing" in the context of virtual memory management?',
    options: [
      'A hardware error where disk sectors are physically damaged',
      'A state where the system spends significantly more time paging/swapping pages than executing application instructions',
      'Overheating of CPU cores due to recursive threads',
      'Cache line invalidation in multi-core CPUs'
    ],
    correct: 1,
    explanation: 'Thrashing occurs when the sum of working set sizes across all active processes exceeds available physical RAM, resulting in continuous page faults.',
    vivaTip: 'In viva: "Thrashing occurs when memory oversubscription causes continuous page faulting, making the CPU spend 95%+ time waiting for disk swap."'
  },
  {
    id: 13,
    level: 3,
    topic: 'DBMS',
    question: 'Which transaction isolation level prevents Dirty Reads and Non-Repeatable Reads, but allows Phantom Reads?',
    options: [
      'Read Uncommitted',
      'Read Committed',
      'Repeatable Read',
      'Serializable'
    ],
    correct: 2,
    explanation: 'Repeatable Read locks rows read by a query so other transactions cannot update or delete them, but other transactions may still insert new matching rows (phantoms).',
    vivaTip: 'In viva: "Repeatable Read locks existing rows read, preventing in-place mutations, but does not lock range gaps where new rows can be inserted."'
  },
  {
    id: 14,
    level: 3,
    topic: 'System Design',
    question: 'How does Consistent Hashing minimize key redistribution when a cache server node is added or removed?',
    options: [
      'By rehashing all keys using MD5',
      'By placing nodes and keys on a virtual ring (0 to 2³²-1) so only keys mapped to the affected node need to be reallocated',
      'By storing all keys on a centralized master coordinator node',
      'By duplicating all cache items across 100% of servers'
    ],
    correct: 1,
    explanation: 'Consistent Hashing places nodes on a circular ring; each key is routed to the nearest clockwise node. Adding or removing a node affects only K/N keys on average.',
    vivaTip: 'In viva: "Consistent hashing maps nodes onto a 2^32 hash ring; adding a node only reassigns keys from its immediate clockwise neighbour (K/N keys)."'
  },
  {
    id: 15,
    level: 3,
    topic: 'Computer Networks',
    question: 'Why does DNS primarily use UDP on port 53 for standard queries instead of TCP?',
    options: [
      'UDP encrypts query payloads automatically',
      'UDP avoids the 3-way handshake round-trip latency and resource overhead for lightweight, single-packet requests',
      'Routers drop all TCP packets destined for port 53',
      'TCP does not support domain names with dots'
    ],
    correct: 1,
    explanation: 'Standard DNS queries fit in a single 512-byte UDP packet. Using UDP reduces latency and avoids connection state overhead on high-traffic root/authoritative nameservers.',
    vivaTip: 'In viva: "DNS uses UDP for fast 1-round-trip lookups without handshake overhead; it falls back to TCP only for zone transfers or responses > 512 bytes."'
  },
  {
    id: 16,
    level: 3,
    topic: 'Operating Systems',
    question: 'In the context of the Critical Section Problem, what is Peterson\'s Algorithm used for?',
    options: [
      'Deadlock detection in bank accounts',
      'Software-based mutual exclusion between two cooperating concurrent processes',
      'Dynamic memory allocation in the heap',
      'Disk sector defragmentation'
    ],
    correct: 1,
    explanation: 'Peterson\'s algorithm is a classic software solution for mutual exclusion between two processes using shared boolean flags and a turn variable.',
    vivaTip: 'In viva: "Peterson\'s algorithm guarantees mutual exclusion, progress, and bounded waiting for 2 concurrent processes using flag[] and turn."'
  },
  {
    id: 17,
    level: 3,
    topic: 'System Design',
    question: 'What is the purpose of a Database Read Replica in high-scale web architectures?',
    options: [
      'To execute ACID schema alterations without downtime',
      'To offload read-heavy SELECT queries from the primary master DB, improving overall read throughput',
      'To provide automated real-time transaction rollbacks',
      'To store uncompressed blob data on SSDs'
    ],
    correct: 1,
    explanation: 'Read replicas asynchronously sync from the write master to handle high-volume read traffic, relieving pressure on the master instance.',
    vivaTip: 'In viva: "Read replicas scale read throughput horizontally by routing SELECTs away from the primary write master via asynchronous binlog replication."'
  },

  // --- LEVEL 4: ADVANCED ARCHITECTURE ---
  {
    id: 18,
    level: 4,
    topic: 'System Design',
    question: 'According to the CAP Theorem, in the presence of a network partition (P), what trade-off must a distributed system make?',
    options: [
      'Performance vs Durability',
      'Consistency (C) vs Availability (A)',
      'Security vs Scalability',
      'Throughput vs Latency'
    ],
    correct: 1,
    explanation: 'When network partitions occur, nodes cannot synchronize. The system must choose between returning stale data (Availability) or returning errors until partitioned nodes sync (Consistency).',
    vivaTip: 'In viva: "Under partition (P), you must pick CP (refuse writes to maintain consistency) or AP (accept writes and reconcile eventual consistency later)."'
  },
  {
    id: 19,
    level: 4,
    topic: 'Computer Networks',
    question: 'What is the primary operational difference between HTTP/1.1 and HTTP/2?',
    options: [
      'HTTP/2 requires plain text ASCII headers',
      'HTTP/2 introduces binary framing and multiplexing multiple requests over a single TCP connection, eliminating Head-of-Line blocking at the application layer',
      'HTTP/2 removes cookies entirely',
      'HTTP/2 uses UDP exclusively'
    ],
    correct: 1,
    explanation: 'HTTP/2 uses binary framing and multiplexing to interleave requests and responses over one TCP connection, avoiding HTTP/1.1 connection limit bottlenecks.',
    vivaTip: 'In viva: "HTTP/2 uses a binary protocol allowing multiplexed request/response streams over a single TCP connection with HPACK header compression."'
  },
  {
    id: 20,
    level: 4,
    topic: 'Operating Systems',
    question: 'In multi-processor architectures, what does the "E" stand for in the MESI cache coherence protocol?',
    options: [
      'Empty',
      'Exclusive (line is present only in this cache and clean)',
      'Error in parity check',
      'Expired'
    ],
    correct: 1,
    explanation: 'MESI stands for Modified, Exclusive, Shared, Invalid. In Exclusive state, the cache line is valid only in this cache and matches main memory.',
    vivaTip: 'In viva: "MESI maintains cache coherence: Modified (dirty), Exclusive (clean, single core), Shared (clean, multiple cores), and Invalid."'
  },
  {
    id: 21,
    level: 4,
    topic: 'System Design',
    question: 'What is the primary role of a Leader in the Raft Consensus Algorithm?',
    options: [
      'Compiling client source code',
      'Accepting client log commands, replicating them to followers, and deciding when it is safe to commit them',
      'Assigning IP addresses to cluster nodes via DHCP',
      'Terminating failing follower nodes'
    ],
    correct: 1,
    explanation: 'In Raft, the elected leader handles all client writes, sequences log entries, replicates them across a majority of followers, and drives commits.',
    vivaTip: 'In viva: "Raft decomposes consensus into Leader Election, Log Replication, and Safety. The leader receives client writes and drives commits."'
  },
  {
    id: 22,
    level: 4,
    topic: 'Computer Networks',
    question: 'What issue does the TCP Nagle Algorithm solve, and what is its side effect on real-time interactive games?',
    options: [
      'Prevents SYN flood attacks; causes memory leaks',
      'Avoids sending tiny packets (small-packet problem) by buffering until ACK arrives; causes latency delays for small interactive payloads',
      'Enforces TLS encryption; increases packet size',
      'Enables UDP fallback; drops TCP sessions'
    ],
    correct: 1,
    explanation: 'Nagle\'s algorithm buffers small outgoing packets until an entire MSS is accumulated or prior packet is ACKed. Real-time apps disable it via TCP_NODELAY to avoid round-trip buffering latency.',
    vivaTip: 'In viva: "Nagle prevents network congestion from tiny 1-byte packets by buffering, but causes latency. Multiplayer games disable it via TCP_NODELAY."'
  },

  // --- LEVEL 5: FAANG & TIER-1 MASTERY ---
  {
    id: 23,
    level: 5,
    topic: 'Operating Systems',
    question: 'Why is Linux `epoll` scalable to 100,000+ concurrent sockets (C10K/C1000K problem) whereas `select()` and `poll()` degrade to O(N)?',
    options: [
      '`epoll` runs in user-space without any system calls',
      '`epoll` uses kernel event callbacks and returns only the subset of file descriptors that have ready I/O events, running in O(1) or O(ready)',
      '`epoll` converts TCP streams into raw UDP',
      '`epoll` uses hardware GPU acceleration for network sockets'
    ],
    correct: 1,
    explanation: '`select` and `poll` require copying and linear scanning of all N watched file descriptors on every call. `epoll` registers callbacks in kernel red-black tree and ready-list, returning only the active events.',
    vivaTip: 'In viva: "select/poll do O(N) array copy and scan on every poll; epoll uses kernel callbacks into a ready list, returning active FDs in O(ready)."'
  },
  {
    id: 24,
    level: 5,
    topic: 'DBMS',
    question: 'How does Multi-Version Concurrency Control (MVCC) in PostgreSQL enable concurrent reads and writes without locking?',
    options: [
      'By converting all writes into in-memory Redis keys',
      'By creating new versions of row tuples with xmin/xmax transaction visibility IDs so readers see consistent snapshots while writers append new versions',
      'By rejecting any read that conflicts with an active writer',
      'By running all queries single-threaded on a dedicated core'
    ],
    correct: 1,
    explanation: 'In MVCC, "readers never block writers, and writers never block readers". Each row tuple is tagged with transaction IDs (xmin/xmax), enabling snapshot isolation.',
    vivaTip: 'In viva: "MVCC tags row versions with xmin/xmax. Readers read older snapshots while writers append new tuple versions without locking."'
  },
  {
    id: 25,
    level: 5,
    topic: 'System Design',
    question: 'What is the purpose of a Bloom Filter in distributed key-value stores like Apache Cassandra or Google Bigtable?',
    options: [
      'To sort SSTable records alphabetically',
      'To provide a space-efficient probabilistic check that determines if a key definitely does NOT exist in an SSTable, preventing unnecessary disk I/O reads',
      'To encrypt table contents with AES-256',
      'To calculate replica latency'
    ],
    correct: 1,
    explanation: 'Bloom filters have no false negatives: if it returns false, the key is guaranteed not to be in the SSTable file, completely bypassing expensive disk seeks.',
    vivaTip: 'In viva: "A Bloom Filter is a probabilistic set: if it says key is absent, it is 100% absent. Avoids expensive disk seeks for missing keys."'
  },
  {
    id: 26,
    level: 5,
    topic: 'Computer Networks',
    question: 'How does the TCP BBR (Bottleneck Bandwidth and RTT) congestion control algorithm differ from loss-based algorithms like Cubic or Reno?',
    options: [
      'It considers packet loss as the primary signal of network saturation',
      'It builds a model of the physical pipe by probing maximum bandwidth (BtlBw) and minimum round-trip time (RTprop), maximizing throughput while minimizing bufferbloat queues',
      'It limits throughput to 10 Mbps to avoid packet loss',
      'It requires dedicated Google hardware routers'
    ],
    correct: 1,
    explanation: 'Traditional TCP treats packet loss as congestion, leading to queue buildup (bufferbloat). BBR regulates transmission to the exact bottleneck bandwidth and propagation delay.',
    vivaTip: 'In viva: "Cubic treats loss as congestion; BBR continuously estimates the link bottleneck bandwidth and round-trip time, avoiding bufferbloat."'
  },
  {
    id: 27,
    level: 5,
    topic: 'System Design',
    question: 'In a distributed Two-Phase Commit (2PC) protocol, what fatal vulnerability occurs if the Coordinator crashes permanently during the second phase (Commit Phase)?',
    options: [
      'All databases automatically revert to initial empty state',
      'Participant nodes that prepared and voted "Yes" remain blocked indefinitely, holding table locks because they cannot independently decide whether to commit or abort',
      'The client machine crashes and reboots',
      'Network cards reset their MAC addresses'
    ],
    correct: 1,
    explanation: '2PC is a blocking protocol: if the coordinator dies during the commit phase after participants have prepared, participants cannot know if other nodes committed or aborted, causing indefinite resource locking.',
    vivaTip: 'In viva: "2PC is blocking: if coordinator crashes after prepare phase, cohorts cannot safely commit or abort, keeping resource locks indefinitely."'
  }
];

// --- VIVA DEFENSE MANUAL TOP OPEN QUESTIONS ---
interface VivaTopicCard {
  title: string;
  category: string;
  hook: string;
  answerBullets: string[];
  teacherTrap: string;
}

const VIVA_MANUAL_CARDS: VivaTopicCard[] = [
  {
    title: 'What happens when you type "google.com" in a web browser and press Enter?',
    category: 'Computer Networks & Systems',
    hook: '"Sir, this triggers a 5-stage pipeline spanning DNS resolution, TCP handshake, TLS encryption, HTTP exchange, and browser DOM/CSSOM rendering."',
    answerBullets: [
      '1. URL Parsing & HSTS: Browser checks cache (Browser ➔ OS ➔ Router ➔ Local DNS resolver).',
      '2. DNS Resolution: Query goes to Root server (.) ➔ TLD server (.com) ➔ Authoritative Name Server to return Google IP.',
      '3. TCP 3-Way Handshake: Client sends SYN ➔ Server sends SYN-ACK ➔ Client sends ACK on Port 443.',
      '4. TLS 1.3 Cryptographic Handshake: ClientHello / ServerHello, ECDHE key exchange, cipher suite agreed.',
      '5. HTTP GET & Render: Server streams HTML/CSS/JS. Browser parses DOM tree, builds Render Tree, layouts pixels.'
    ],
    teacherTrap: 'Teacher Trap: If asked "Is DNS over TCP or UDP?", answer: "Normally UDP port 53 for speed, but TCP for zone transfers or responses > 512 bytes."'
  },
  {
    title: 'Process vs Thread: Explain with Memory Architecture & Context Switch Overhead.',
    category: 'Operating Systems',
    hook: '"A process is an isolated execution environment with its own address space, while a thread is the smallest schedulable unit of CPU execution sharing memory with peer threads."',
    answerBullets: [
      'Address Space: Processes have separate virtual memory spaces. Threads of the same process share Text (code), Data, and Heap.',
      'Private to Thread: Each thread retains its own Program Counter (PC), Register set, and Call Stack.',
      'Context Switch: Switching processes requires flushing the Translation Lookaside Buffer (TLB) and swapping page tables (expensive). Thread switching keeps the page tables mapped (lightweight).',
      'IPC: Processes require OS pipes/sockets/shared memory. Threads communicate directly via shared heap variables with mutex locks.'
    ],
    teacherTrap: 'Teacher Trap: If asked "Do threads share stack memory?", firmly state: "No, every thread has its own private execution stack."'
  },
  {
    title: 'Explain Paging, Page Faults, and how Virtual Memory Prevents Fragmentation.',
    category: 'Operating Systems',
    hook: '"Virtual memory decouples logical memory from physical RAM using fixed-size blocks called pages and frames, managed by the MMU hardware."',
    answerBullets: [
      'Pages vs Frames: Logical address space is divided into Pages (typically 4KB). Physical RAM is divided into matching Frames.',
      'Page Table & TLB: MMU uses a Page Table to translate Virtual Address to Physical Address. The Translation Lookaside Buffer (TLB) caches recent translations.',
      'Page Fault: Occurs when a referenced page is not present in RAM (valid-invalid bit is 0). The OS traps to kernel, reads page from disk swap space into free frame, updates table, and restarts instruction.',
      'Eliminating External Fragmentation: Because any logical page can occupy any physical frame, external fragmentation is eliminated.'
    ],
    teacherTrap: 'Teacher Trap: Paging eliminates EXTERNAL fragmentation, but leaves minor INTERNAL fragmentation in the last page.'
  },
  {
    title: 'Explain the 4 Coffman Conditions of Deadlock and how modern OS prevents it.',
    category: 'Operating Systems',
    hook: '"Deadlock can only occur if all four Coffman conditions hold simultaneously: Mutual Exclusion, Hold & Wait, No Preemption, and Circular Wait."',
    answerBullets: [
      '1. Mutual Exclusion: At least one resource must be non-shareable.',
      '2. Hold & Wait: A process holds at least one resource while waiting for another.',
      '3. No Preemption: Resources cannot be forcibly revoked; must be released voluntarily.',
      '4. Circular Wait: A closed chain of processes P0 ➔ P1 ➔ ... ➔ P0 waiting for resources.',
      'Prevention: Breaking circular wait by imposing a global numerical ordering on all resources (processes can only request resources in strictly ascending order).'
    ],
    teacherTrap: 'Teacher Trap: Bankers Algorithm is for Deadlock AVOIDANCE (dynamic checking), not Deadlock PREVENTION (structural constraints).'
  },
  {
    title: 'Explain Database Normalization: 1NF, 2NF, 3NF, and BCNF with examples.',
    category: 'DBMS',
    hook: '"Normalization is the systematic process of decomposing tables to eliminate data redundancy and prevent Insert, Update, and Delete anomalies."',
    answerBullets: [
      '1NF: All attributes must be atomic (no multi-valued lists or arrays). Table must have a primary key.',
      '2NF: Must be in 1NF AND have NO partial dependency (no non-key attribute may depend on only part of a composite primary key).',
      '3NF: Must be in 2NF AND have NO transitive dependency (non-key attributes cannot depend on other non-key attributes: X ➔ Y ➔ Z).',
      'BCNF (Boyce-Codd): Stricter 3NF where for every functional dependency X ➔ Y, X must be a Super Key.'
    ],
    teacherTrap: 'Teacher Trap: If asked why real production systems denormalize: "To avoid expensive multi-table joins in high-traffic read queries."'
  },
  {
    title: 'Explain the 7 Layers of the OSI Model and their exact data units.',
    category: 'Computer Networks',
    hook: '"The OSI model standardizes network communication into 7 distinct abstraction layers with dedicated Protocol Data Units (PDUs)."',
    answerBullets: [
      'Layer 7 (Application): HTTP, DNS, SMTP, FTP. (PDU: Data)',
      'Layer 6 (Presentation): TLS/SSL, JPEG, ASCII, compression and encryption. (PDU: Data)',
      'Layer 5 (Session): RPC, NetBIOS, session checkpointing. (PDU: Data)',
      'Layer 4 (Transport): TCP, UDP. Port addressing, flow control. (PDU: Segment / Datagram)',
      'Layer 3 (Network): IP, ICMP, OSPF, BGP. Routing. (PDU: Packet)',
      'Layer 2 (Data Link): Ethernet, Wi-Fi 802.11, ARP. MAC addresses. (PDU: Frame)',
      'Layer 1 (Physical): Cables, fiber optics, radio frequencies. (PDU: Bits)'
    ],
    teacherTrap: 'Teacher Trap: Remember mnemonic: "All People Seem To Need Data Processing" (7 to 1) or "Please Do Not Throw Sausage Pizza Away" (1 to 7).'
  }
];

export const CsFundamentalsView: React.FC = () => {
  // Navigation tabs
  const [activeTab, setActiveTab] = useState<'practice' | 'viva' | 'mock' | 'visualizer'>('practice');

  // Practice Mode state
  const [selectedTopic, setSelectedTopic] = useState<string>('All');
  const [selectedLevel, setSelectedLevel] = useState<number>(1);
  const [currentIdxInLevel, setCurrentIdxInLevel] = useState<number>(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [showExplanation, setShowExplanation] = useState<boolean>(false);
  const [levelScores, setLevelScores] = useState<Record<number, number>>({ 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 });

  // Viva Manual state
  const [vivaSearch, setVivaSearch] = useState('');
  const [expandedViva, setExpandedViva] = useState<number | null>(0);

  // Timed Placement Mock Exam state
  const [mockActive, setMockActive] = useState<boolean>(false);
  const [mockTimeLeft, setMockTimeLeft] = useState<number>(600); // 10 minutes
  const [mockQuestions, setMockQuestions] = useState<LeveledMcq[]>([]);
  const [mockIdx, setMockIdx] = useState<number>(0);
  const [mockAnswers, setMockAnswers] = useState<Record<number, number>>({});
  const [mockSubmitted, setMockSubmitted] = useState<boolean>(false);

  // Filtered practice questions
  const filteredQuestions = useMemo(() => {
    let list = LEVELED_MCQS;
    if (selectedTopic !== 'All') {
      list = list.filter((q) => q.topic === selectedTopic);
    }
    return list.filter((q) => q.level === selectedLevel);
  }, [selectedTopic, selectedLevel]);

  const currentQ = filteredQuestions[currentIdxInLevel] || filteredQuestions[0] || LEVELED_MCQS[0];

  // Start Timed Mock Exam
  const handleStartMock = () => {
    playRunSound();
    // Pick 10 representative questions across all 5 topics
    const shuffled = [...LEVELED_MCQS].sort(() => 0.5 - Math.random()).slice(0, 10);
    setMockQuestions(shuffled);
    setMockIdx(0);
    setMockAnswers({});
    setMockTimeLeft(600);
    setMockSubmitted(false);
    setMockActive(true);
    showToast('Timed Placement Mock Exam Started! 10 Minutes on the clock.', 'info');
  };

  // Mock Timer
  useEffect(() => {
    if (!mockActive || mockSubmitted) return;
    const interval = setInterval(() => {
      setMockTimeLeft((t) => {
        if (t <= 1) {
          clearInterval(interval);
          handleFinishMock();
          return 0;
        }
        return t - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [mockActive, mockSubmitted]);

  // Finish Mock Exam
  const handleFinishMock = () => {
    setMockSubmitted(true);
    playSuccessSound();
    recordActivity('mcq', { xp: 50 });
    showToast('Placement Mock Exam Completed! Reviewing your diagnostic report.', 'success');
  };

  // Practice Option Click
  const handleSelectOption = (idx: number) => {
    if (showExplanation) return;
    setSelectedOption(idx);
    setShowExplanation(true);

    if (idx === currentQ.correct) {
      playSuccessSound();
      setLevelScores((prev) => ({
        ...prev,
        [selectedLevel]: (prev[selectedLevel] || 0) + 1,
      }));
      recordActivity('mcq', { xp: 15 });
      showToast('Correct! +15 XP added to telemetry', 'success');
    } else {
      playRunSound();
      showToast('Incorrect option. Read the viva breakdown below.', 'error');
    }
  };

  const handleNext = () => {
    if (currentIdxInLevel < filteredQuestions.length - 1) {
      setCurrentIdxInLevel((prev) => prev + 1);
      setSelectedOption(null);
      setShowExplanation(false);
    }
  };

  const handlePrev = () => {
    if (currentIdxInLevel > 0) {
      setCurrentIdxInLevel((prev) => prev - 1);
      setSelectedOption(null);
      setShowExplanation(false);
    }
  };

  // Mock Diagnostic Metrics
  const mockScore = useMemo(() => {
    let score = 0;
    mockQuestions.forEach((q, idx) => {
      if (mockAnswers[idx] === q.correct) score++;
    });
    return score;
  }, [mockQuestions, mockAnswers]);

  const mockTopicBreakdown = useMemo(() => {
    const stats: Record<string, { total: number; correct: number }> = {};
    mockQuestions.forEach((q, idx) => {
      if (!stats[q.topic]) stats[q.topic] = { total: 0, correct: 0 };
      stats[q.topic].total += 1;
      if (mockAnswers[idx] === q.correct) stats[q.topic].correct += 1;
    });
    return stats;
  }, [mockQuestions, mockAnswers]);

  return (
    <div className="space-y-4 max-w-6xl mx-auto pb-12 font-['Plus_Jakarta_Sans'] text-slate-100">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-[#0b101e] border border-cyan-500/25 rounded-2xl p-4 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-cyan-500/5 rounded-full blur-3xl pointer-events-none" />

        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-indigo-500/20 to-purple-600/30 border border-indigo-400/40 flex items-center justify-center text-indigo-300 shadow-md">
            <Cpu className="h-5 w-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base font-extrabold text-white tracking-tight">CS Fundamentals &amp; Viva Defense Arena</h1>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-cyan-950/60 text-cyan-300 border border-cyan-500/30 font-bold">
                OS • CN • DBMS • System Design
              </span>
            </div>
            <p className="text-xs text-slate-400">Master core computer science viva questions, placement MCQs, and architectural deep dives</p>
          </div>
        </div>

        {/* Global Tab Switcher */}
        <div className="p-1 rounded-xl bg-[#0e1424] border border-slate-800 flex gap-1 self-start sm:self-auto overflow-x-auto">
          <button
            onClick={() => setActiveTab('practice')}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${
              activeTab === 'practice'
                ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Layers className="h-3.5 w-3.5" />
            <span>Topic Practice</span>
          </button>

          <button
            onClick={() => setActiveTab('viva')}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${
              activeTab === 'viva'
                ? 'bg-gradient-to-r from-amber-600 to-orange-600 text-white shadow-md shadow-amber-600/30'
                : 'text-amber-400/90 hover:text-amber-300'
            }`}
          >
            <BookOpen className="h-3.5 w-3.5" />
            <span>Viva Defense Manual</span>
          </button>

          <button
            onClick={() => setActiveTab('mock')}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${
              activeTab === 'mock'
                ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/30'
                : 'text-emerald-400/90 hover:text-emerald-300'
            }`}
          >
            <Clock className="h-3.5 w-3.5" />
            <span>10m Placement Mock</span>
          </button>

          <button
            onClick={() => setActiveTab('visualizer')}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${
              activeTab === 'visualizer'
                ? 'bg-purple-600 text-white shadow-md shadow-purple-600/30'
                : 'text-purple-400/90 hover:text-purple-300'
            }`}
          >
            <Compass className="h-3.5 w-3.5" />
            <span>Architecture Maps</span>
          </button>
        </div>
      </div>

      {/* ========================================================= */}
      {/* TAB 1: TOPIC PRACTICE & LEVELED MCQS                     */}
      {/* ========================================================= */}
      {activeTab === 'practice' && (
        <div className="space-y-4">
          {/* Topic Filter Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none text-xs">
            <span className="text-[11px] font-bold text-slate-500 uppercase shrink-0 mr-1">Subject:</span>
            {['All', 'Operating Systems', 'Computer Networks', 'DBMS', 'System Design', 'Data Structures'].map((t) => (
              <button
                key={t}
                onClick={() => {
                  setSelectedTopic(t);
                  setCurrentIdxInLevel(0);
                  setSelectedOption(null);
                  setShowExplanation(false);
                }}
                className={`px-3 py-1 rounded-xl text-xs font-bold whitespace-nowrap transition ${
                  selectedTopic === t
                    ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-400/40 shadow-sm'
                    : 'bg-[#0b101e] text-slate-400 hover:text-slate-200 border border-slate-800'
                }`}
              >
                {t}
              </button>
            ))}
          </div>

          {/* Level Selector Pills */}
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5">
            {[
              { lvl: 1, label: 'L1: Foundation', desc: 'Beginner', xp: '+100 XP' },
              { lvl: 2, label: 'L2: Core CS', desc: 'Intermediate', xp: '+150 XP' },
              { lvl: 3, label: 'L3: Systems & DB', desc: 'Advanced', xp: '+200 XP' },
              { lvl: 4, label: 'L4: Architecture', desc: 'Hard', xp: '+250 XP' },
              { lvl: 5, label: 'L5: FAANG Mastery', desc: 'Expert', xp: '+350 XP' },
            ].map((item) => (
              <button
                key={item.lvl}
                onClick={() => {
                  setSelectedLevel(item.lvl);
                  setCurrentIdxInLevel(0);
                  setSelectedOption(null);
                  setShowExplanation(false);
                }}
                className={`p-3 rounded-2xl border text-left transition ${
                  selectedLevel === item.lvl
                    ? 'bg-[#0f172a] border-cyan-400/60 shadow-[0_0_15px_rgba(0,229,255,0.1)]'
                    : 'bg-[#0b101e] border-slate-800 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center justify-between pb-1">
                  <span className="text-xs font-black text-white">{item.label}</span>
                  <span className="text-[10px] text-cyan-400 font-bold">{item.xp}</span>
                </div>
                <div className="text-[10px] text-slate-400">{item.desc}</div>
              </button>
            ))}
          </div>

          {/* Question Card */}
          {currentQ ? (
            <div className="bg-[#0b101e] border border-slate-800/80 rounded-3xl p-6 shadow-xl space-y-5">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800/80">
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded-full bg-cyan-950/60 text-cyan-300 border border-cyan-500/30 text-[11px] font-bold">
                    {currentQ.topic}
                  </span>
                  <span className="text-xs text-slate-500 font-mono">
                    Question {currentIdxInLevel + 1} of {filteredQuestions.length}
                  </span>
                </div>

                <div className="flex items-center gap-1.5 text-xs text-amber-400 font-bold">
                  <Flame className="h-4 w-4 fill-amber-400" />
                  <span>Level {selectedLevel} Challenge</span>
                </div>
              </div>

              {/* Question Text */}
              <h2 className="text-sm sm:text-base font-bold text-white leading-relaxed">
                {currentQ.question}
              </h2>

              {/* Options Grid */}
              <div className="space-y-2.5">
                {currentQ.options.map((opt, idx) => {
                  let btnStyle = 'bg-[#0e1424] border-slate-800 text-slate-200 hover:border-slate-700';
                  if (showExplanation) {
                    if (idx === currentQ.correct) {
                      btnStyle = 'bg-emerald-500/15 border-emerald-500 text-emerald-200 shadow-md ring-1 ring-emerald-500/40';
                    } else if (idx === selectedOption) {
                      btnStyle = 'bg-rose-500/15 border-rose-500 text-rose-200';
                    }
                  }

                  return (
                    <button
                      key={idx}
                      onClick={() => handleSelectOption(idx)}
                      disabled={showExplanation}
                      className={`w-full p-3.5 rounded-2xl border text-left text-xs font-semibold flex items-center justify-between gap-3 transition-all ${btnStyle}`}
                    >
                      <div className="flex items-center gap-3">
                        <span className="h-6 w-6 rounded-lg bg-slate-800/80 border border-slate-700 flex items-center justify-center font-mono text-[11px] text-slate-400 shrink-0">
                          {String.fromCharCode(65 + idx)}
                        </span>
                        <span>{opt}</span>
                      </div>
                      {showExplanation && idx === currentQ.correct && (
                        <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
                      )}
                      {showExplanation && idx === selectedOption && idx !== currentQ.correct && (
                        <XCircle className="h-4 w-4 text-rose-400 shrink-0" />
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Explanation & Viva Talk Track */}
              {showExplanation && (
                <div className="space-y-3 pt-3 border-t border-slate-800/80 animate-in fade-in">
                  <div className="p-3.5 rounded-2xl bg-[#070b14] border border-slate-800 text-xs text-slate-300 space-y-1.5">
                    <span className="font-bold text-white flex items-center gap-1.5">
                      <Sparkles className="h-3.5 w-3.5 text-cyan-400" />
                      Core Concept Explanation
                    </span>
                    <p className="leading-relaxed text-slate-300 text-[11px]">{currentQ.explanation}</p>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-xs text-amber-200 space-y-1">
                    <span className="font-bold flex items-center gap-1.5 text-amber-300">
                      <HelpCircle className="h-3.5 w-3.5" />
                      How to Answer to Teacher in Viva (Viva Talk Track)
                    </span>
                    <p className="text-[11px] leading-relaxed italic">{currentQ.vivaTip}</p>
                  </div>
                </div>
              )}

              {/* Navigation Controls */}
              <div className="flex items-center justify-between pt-3 border-t border-slate-800/60">
                <button
                  onClick={handlePrev}
                  disabled={currentIdxInLevel === 0}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 disabled:opacity-40 text-xs font-bold text-slate-300 flex items-center gap-1.5 transition"
                >
                  <ArrowLeft className="h-3.5 w-3.5" />
                  <span>Previous</span>
                </button>

                <button
                  onClick={handleNext}
                  disabled={currentIdxInLevel >= filteredQuestions.length - 1}
                  className="px-6 py-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 disabled:opacity-40 text-xs font-bold text-white flex items-center gap-1.5 shadow-md shadow-indigo-600/30 transition"
                >
                  <span>Next Question</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          ) : (
            <div className="p-8 text-center text-slate-400 text-xs">
              No questions found for this topic filter. Please switch filter or level.
            </div>
          )}
        </div>
      )}

      {/* ========================================================= */}
      {/* TAB 2: VIVA DEFENSE MANUAL (FLASHCARDS)                   */}
      {/* ========================================================= */}
      {activeTab === 'viva' && (
        <div className="space-y-4">
          <div className="p-4 rounded-2xl bg-gradient-to-r from-amber-950/40 via-orange-950/30 to-[#0b101e] border border-amber-500/30 shadow-xl">
            <h2 className="text-sm sm:text-base font-extrabold text-amber-300 flex items-center gap-2">
              <BookOpen className="h-5 w-5 text-amber-400" />
              Campus Technical Viva Defense Manual (Oral Examination Prep)
            </h2>
            <p className="text-xs text-slate-300 mt-1 leading-relaxed">
              Open-ended questions frequently asked by university professors and placement interviewers. Includes 30-second bullet answers and teacher trap warnings.
            </p>
          </div>

          <div className="space-y-3">
            {VIVA_MANUAL_CARDS.map((card, idx) => {
              const isExpanded = expandedViva === idx;
              return (
                <div
                  key={idx}
                  className="rounded-2xl bg-[#0b101e] border border-slate-800/80 hover:border-amber-500/40 transition shadow-lg overflow-hidden"
                >
                  <div
                    onClick={() => setExpandedViva(isExpanded ? null : idx)}
                    className="p-4 flex items-center justify-between cursor-pointer gap-3"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/30 uppercase">
                          {card.category}
                        </span>
                        <span className="text-[10px] text-slate-500 font-mono">Viva Target Q{idx + 1}</span>
                      </div>
                      <h3 className="text-xs sm:text-sm font-bold text-white hover:text-amber-300 transition">
                        {card.title}
                      </h3>
                    </div>

                    <div className="h-7 w-7 rounded-lg bg-slate-800/80 flex items-center justify-center text-slate-400 shrink-0">
                      {isExpanded ? '−' : '+'}
                    </div>
                  </div>

                  {isExpanded && (
                    <div className="px-4 pb-4 pt-1 border-t border-slate-800/60 space-y-3 animate-in fade-in">
                      {/* Opening Hook */}
                      <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-200 text-xs">
                        <span className="font-bold block mb-0.5 text-amber-300">Opening Punchline (Say this first):</span>
                        <p className="italic leading-relaxed">{card.hook}</p>
                      </div>

                      {/* Bullet breakdown */}
                      <div className="space-y-1.5 text-xs text-slate-300">
                        <span className="font-bold text-white block text-[11px] uppercase tracking-wider">Detailed Technical Defense:</span>
                        {card.answerBullets.map((b, bIdx) => (
                          <div key={bIdx} className="flex items-start gap-2 leading-relaxed text-slate-300">
                            <span className="text-amber-400 font-bold shrink-0">•</span>
                            <span>{b}</span>
                          </div>
                        ))}
                      </div>

                      {/* Teacher Trap Warning */}
                      <div className="p-2.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
                        <AlertCircle className="h-4 w-4 shrink-0 text-rose-400" />
                        <span className="text-[11px] leading-relaxed">{card.teacherTrap}</span>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* TAB 3: TIMED PLACEMENT MOCK EXAM MODE                     */}
      {/* ========================================================= */}
      {activeTab === 'mock' && (
        <div className="space-y-4">
          {!mockActive ? (
            <div className="p-8 rounded-3xl bg-[#0b101e] border border-cyan-500/30 text-center space-y-5 shadow-2xl relative overflow-hidden">
              <div className="max-w-md mx-auto space-y-2">
                <div className="h-16 w-16 mx-auto rounded-3xl bg-gradient-to-br from-emerald-500/20 to-teal-500/30 border border-emerald-400/40 flex items-center justify-center text-emerald-300 shadow-xl">
                  <Clock className="h-8 w-8" />
                </div>
                <h2 className="text-xl font-black text-white">10-Minute Placement Technical Mock Exam</h2>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Simulate the exact computer science aptitude round used by TCS NQT, Infosys, Amazon, and Capgemini. 10 questions across OS, Networks, DBMS, and System Design with automated strength diagnostics.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 max-w-lg mx-auto text-xs font-semibold">
                <div className="p-3 rounded-2xl bg-[#0e1424] border border-slate-800">
                  <span className="text-slate-400 block text-[10px]">Total Questions</span>
                  <span className="text-sm font-bold text-white">10 MCQs</span>
                </div>
                <div className="p-3 rounded-2xl bg-[#0e1424] border border-slate-800">
                  <span className="text-slate-400 block text-[10px]">Timer Duration</span>
                  <span className="text-sm font-bold text-emerald-400">10:00 Mins</span>
                </div>
                <div className="p-3 rounded-2xl bg-[#0e1424] border border-slate-800">
                  <span className="text-slate-400 block text-[10px]">Pass Criteria</span>
                  <span className="text-sm font-bold text-amber-400">70% Accuracy</span>
                </div>
              </div>

              <button
                onClick={handleStartMock}
                className="py-3.5 px-8 rounded-2xl bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 hover:from-emerald-500 hover:to-teal-500 text-white font-extrabold text-xs shadow-xl shadow-teal-600/30 transition transform active:scale-95"
              >
                START 10-MINUTE ASSESSMENT NOW
              </button>
            </div>
          ) : !mockSubmitted ? (
            /* Active Mock Test In-Progress */
            <div className="bg-[#0b101e] border border-slate-800/80 rounded-3xl p-6 shadow-xl space-y-5">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <div className="flex items-center gap-2">
                  <span className="h-2.5 w-2.5 rounded-full bg-emerald-400 animate-pulse" />
                  <span className="text-xs font-bold text-white">Live Placement Assessment</span>
                  <span className="text-xs text-slate-500 font-mono">
                    Question {mockIdx + 1} of {mockQuestions.length}
                  </span>
                </div>

                {/* Countdown Timer */}
                <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-950/40 border border-rose-500/40 text-rose-300 text-xs font-mono font-bold">
                  <Clock className="h-3.5 w-3.5" />
                  <span>
                    {Math.floor(mockTimeLeft / 60)}:{String(mockTimeLeft % 60).padStart(2, '0')}
                  </span>
                </div>
              </div>

              {/* Mock Question Content */}
              {mockQuestions[mockIdx] && (
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-800 text-cyan-300">
                      {mockQuestions[mockIdx].topic}
                    </span>
                  </div>

                  <h3 className="text-sm sm:text-base font-bold text-white leading-relaxed">
                    {mockQuestions[mockIdx].question}
                  </h3>

                  <div className="space-y-2.5">
                    {mockQuestions[mockIdx].options.map((opt, optIdx) => {
                      const isChosen = mockAnswers[mockIdx] === optIdx;
                      return (
                        <button
                          key={optIdx}
                          onClick={() => {
                            setMockAnswers((prev) => ({ ...prev, [mockIdx]: optIdx }));
                          }}
                          className={`w-full p-3.5 rounded-2xl border text-left text-xs font-semibold flex items-center gap-3 transition ${
                            isChosen
                              ? 'bg-blue-600/15 border-blue-500 text-blue-200 ring-1 ring-blue-500/40'
                              : 'bg-[#0e1424] border-slate-800 text-slate-300 hover:border-slate-700'
                          }`}
                        >
                          <span className="h-6 w-6 rounded-lg bg-slate-800 flex items-center justify-center font-mono text-[11px] text-slate-400 shrink-0">
                            {String.fromCharCode(65 + optIdx)}
                          </span>
                          <span>{opt}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Progress & Bottom Actions */}
              <div className="flex items-center justify-between pt-3 border-t border-slate-800">
                <button
                  onClick={() => setMockIdx((i) => Math.max(0, i - 1))}
                  disabled={mockIdx === 0}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 disabled:opacity-40 text-xs font-bold text-slate-300"
                >
                  Previous
                </button>

                {mockIdx < mockQuestions.length - 1 ? (
                  <button
                    onClick={() => setMockIdx((i) => Math.min(mockQuestions.length - 1, i + 1))}
                    className="px-6 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-xs font-bold text-white shadow-md"
                  >
                    Next Question
                  </button>
                ) : (
                  <button
                    onClick={handleFinishMock}
                    className="px-6 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 text-xs font-extrabold text-white shadow-lg shadow-teal-600/30"
                  >
                    SUBMIT EXAM
                  </button>
                )}
              </div>
            </div>
          ) : (
            /* Mock Exam Results Diagnostic Report */
            <div className="bg-[#0b101e] border border-slate-800/80 rounded-3xl p-6 shadow-2xl space-y-6 animate-in fade-in">
              <div className="text-center space-y-2 border-b border-slate-800 pb-5">
                <span className="text-[10px] font-bold px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 uppercase">
                  Assessment Report Card
                </span>
                <h2 className="text-xl font-black text-white">Your Technical Readiness Score</h2>
                <div className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-400 py-1 font-mono">
                  {mockScore} / 10 ({mockScore * 10}%)
                </div>
                <p className="text-xs text-slate-400">
                  {mockScore >= 8
                    ? '🌟 Outstanding! You qualify for Tier-1 Product Companies (Google, Amazon, Microsoft).'
                    : mockScore >= 6
                    ? '👍 Good baseline! Suitable for Service & Tier-2 Companies (TCS NQT, Infosys, Cognizant).'
                    : '⚠️ Needs revision! Review your weak subject areas below before appearing in campus drives.'}
                </p>
              </div>

              {/* Subject Breakdown Bars */}
              <div className="space-y-3">
                <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                  Diagnostic Subject Performance:
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {Object.entries(mockTopicBreakdown).map(([topic, stat]) => {
                    const pct = Math.round((stat.correct / stat.total) * 100);
                    return (
                      <div key={topic} className="p-3.5 rounded-2xl bg-[#0e1424] border border-slate-800 space-y-1.5">
                        <div className="flex items-center justify-between text-xs">
                          <span className="font-bold text-white">{topic}</span>
                          <span className="font-mono text-cyan-400 font-bold">
                            {stat.correct}/{stat.total} ({pct}%)
                          </span>
                        </div>
                        <div className="w-full h-1.5 rounded-full bg-slate-800 overflow-hidden">
                          <div
                            className={`h-full rounded-full ${
                              pct >= 70 ? 'bg-emerald-400' : pct >= 40 ? 'bg-amber-400' : 'bg-rose-400'
                            }`}
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="pt-2 flex justify-center">
                <button
                  onClick={handleStartMock}
                  className="px-6 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold text-white flex items-center gap-2 border border-slate-700"
                >
                  <RotateCcw className="h-3.5 w-3.5" />
                  <span>Retake Another Mock Exam</span>
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ========================================================= */}
      {/* TAB 4: VISUAL ARCHITECTURE MAPS                           */}
      {/* ========================================================= */}
      {activeTab === 'visualizer' && (
        <div className="space-y-5">
          {/* MAP 1: OSI 7-LAYER VS TCP/IP */}
          <div className="p-5 rounded-3xl bg-[#0b101e] border border-slate-800 space-y-3 shadow-xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Network className="h-4 w-4 text-cyan-400" />
                OSI 7-Layer vs TCP/IP 4-Layer Reference Map
              </h3>
              <span className="text-[10px] text-slate-500 font-mono">Viva High Frequency</span>
            </div>

            <div className="space-y-2 text-xs font-mono">
              {[
                { layer: '7. Application', tcp: 'Application', pdu: 'Data', protocols: 'HTTP, DNS, SMTP, SSH', color: 'border-cyan-500/40 text-cyan-300' },
                { layer: '6. Presentation', tcp: 'Application', pdu: 'Data', protocols: 'TLS/SSL, JPEG, ASCII', color: 'border-cyan-500/30 text-cyan-400' },
                { layer: '5. Session', tcp: 'Application', pdu: 'Data', protocols: 'RPC, NetBIOS, Sockets', color: 'border-cyan-500/20 text-cyan-500' },
                { layer: '4. Transport', tcp: 'Transport', pdu: 'Segment / Datagram', protocols: 'TCP, UDP (Port Addressing)', color: 'border-indigo-500/40 text-indigo-300' },
                { layer: '3. Network', tcp: 'Internet', pdu: 'Packet', protocols: 'IP (IPv4/IPv6), ICMP, OSPF, BGP', color: 'border-purple-500/40 text-purple-300' },
                { layer: '2. Data Link', tcp: 'Network Access', pdu: 'Frame', protocols: 'Ethernet, Wi-Fi 802.11, ARP', color: 'border-amber-500/40 text-amber-300' },
                { layer: '1. Physical', tcp: 'Network Access', pdu: 'Bits', protocols: 'Copper, Fiber Optic, Radio Waves', color: 'border-slate-700 text-slate-400' },
              ].map((row, idx) => (
                <div
                  key={idx}
                  className={`p-2.5 rounded-xl bg-[#0e1424] border ${row.color} flex flex-col sm:flex-row sm:items-center justify-between gap-1`}
                >
                  <div className="font-bold w-44">{row.layer}</div>
                  <div className="text-slate-400 w-36">TCP/IP: {row.tcp}</div>
                  <div className="text-slate-300 w-44 font-semibold">PDU: {row.pdu}</div>
                  <div className="text-slate-400 text-[11px] truncate">{row.protocols}</div>
                </div>
              ))}
            </div>
          </div>

          {/* MAP 2: TCP 3-WAY HANDSHAKE FLOWCHART */}
          <div className="p-5 rounded-3xl bg-[#0b101e] border border-slate-800 space-y-3 shadow-xl">
            <div className="border-b border-slate-800 pb-2">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Zap className="h-4 w-4 text-amber-400" />
                TCP 3-Way Handshake Connection Establishment
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">Sequence synchronization between client and server</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 font-mono text-xs">
              <div className="p-4 rounded-2xl bg-[#0e1424] border border-cyan-500/30 space-y-2">
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-cyan-950/60 text-cyan-300">
                  Step 1 (Client ➔ Server)
                </span>
                <div className="font-bold text-white">SYN (Synchronize)</div>
                <p className="text-[11px] text-slate-400 leading-relaxed">
                  Client picks an Initial Sequence Number (ISN = x) and sends SYN flag to request connection.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-[#0e1424] border border-indigo-500/30 space-y-2">
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-indigo-950/60 text-indigo-300">
                  Step 2 (Server ➔ Client)
                </span>
                <div className="font-bold text-white">SYN-ACK</div>
                <p className="text-[11px] text-slate-400 leading-relaxed">
                  Server acknowledges client seq (ACK = x + 1) and sends its own sequence number (ISN = y).
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-[#0e1424] border border-emerald-500/30 space-y-2">
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-950/60 text-emerald-300">
                  Step 3 (Client ➔ Server)
                </span>
                <div className="font-bold text-white">ACK (Established)</div>
                <p className="text-[11px] text-slate-400 leading-relaxed">
                  Client acknowledges server seq (ACK = y + 1). Socket enters ESTABLISHED state; payload data transfer begins.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
