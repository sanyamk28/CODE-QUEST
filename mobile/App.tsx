import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  TextInput,
  SafeAreaView,
  StatusBar,
  Modal,
  Animated
} from 'react-native';
import axios from 'axios';
import * as WebBrowser from 'expo-web-browser';
import * as Google from 'expo-auth-session/providers/google';

WebBrowser.maybeCompleteAuthSession();

// --- API CONFIGURATION ---
export const BACKEND_API_URL = 'https://code-quest-z89h.onrender.com/api/v1';

// --- DATA MOCKS FOR MOBILE APP ---
const INITIAL_ROADMAPS = [
  {
    role: "Data Engineer",
    steps: ["SQL Joins", "Aggregations", "Window Functions", "DBMS Indexes", "ETL Pipelines", "Airflow Orchestration"]
  },
  {
    role: "Software Engineer",
    steps: ["Arrays & Strings", "Two Pointers", "Stacks", "Binary Search", "OOP Fundamentals", "System Design"]
  }
];

const CONTEST_QUESTIONS = [
  { 
    title: "Two Sum", 
    type: "coding", 
    difficulty: "Easy", 
    desc: "Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target.", 
    template: "class Solution:\n    def twoSum(self, nums: list[int], target: int) -> list[int]:\n        # Write code here\n        return []", 
    input: "nums = [2,7,11,15], target = 9", 
    output: "[0,1]", 
    solved: false 
  },
  { 
    title: "Contains Duplicate", 
    type: "coding", 
    difficulty: "Easy", 
    desc: "Given an integer array nums, return true if any value appears at least twice in the array, and false if every element is distinct.", 
    template: "class Solution:\n    def containsDuplicate(self, nums: list[int]) -> bool:\n        # Write code here\n        return False", 
    input: "nums = [1,2,3,1]", 
    output: "true", 
    solved: false 
  },
  { 
    title: "Department Top Three Salaries", 
    type: "sql", 
    difficulty: "Medium", 
    desc: "Find the employees who are high earners in each of the departments. A high earner earns a salary in the top three unique salaries.", 
    template: "SELECT d.name AS Department, e.name AS Employee, e.salary AS Salary\nFROM Employee e JOIN Department d ON e.departmentId = d.id\nWHERE 3 > (SELECT COUNT(DISTINCT e2.salary) FROM Employee e2 WHERE e2.salary > e.salary AND e2.departmentId = e.departmentId);", 
    input: "Run on PostgreSQL engine", 
    output: "Rows matching top salaries per department", 
    solved: false 
  },
  { 
    title: "Combine Two Tables", 
    type: "sql", 
    difficulty: "Easy", 
    desc: "Report first name, last name, city, and state of each person. If the address is missing, report null.", 
    template: "SELECT firstName, lastName, city, state\nFROM Person LEFT JOIN Address ON Person.personId = Address.personId;", 
    input: "Run on PostgreSQL engine", 
    output: "Combined rows showing address elements or nulls", 
    solved: false 
  }
];

const MCQ_QUIZ_QUESTIONS = [
  {
    topic: "Arrays",
    question: "What is the time complexity to access an element by index in an array?",
    options: ["O(1)", "O(log N)", "O(N)", "O(N log N)"],
    answer: "A",
    difficulty: "Easy",
    explanation: "Arrays offer constant time O(1) random access because elements are stored in contiguous memory locations."
  },
  {
    topic: "Strings",
    question: "Which string matching algorithm runs in O(N+M) worst-case time complexity?",
    options: ["Brute Force", "KMP (Knuth-Morris-Pratt)", "Rabin-Karp", "Boyer-Moore"],
    answer: "B",
    difficulty: "Medium",
    explanation: "Knuth-Morris-Pratt (KMP) matches strings in O(N+M) time using a prefix lookup table to skip redundant matching steps."
  },
  {
    topic: "Stacks",
    question: "Which data structure follows the LIFO (Last In First Out) principle?",
    options: ["Queue", "Stack", "Binary Tree", "Linked List"],
    answer: "B",
    difficulty: "Easy",
    explanation: "Stacks add and remove elements from the same end, mapping to Last In First Out behavior."
  },
  {
    topic: "SQL Playground",
    question: "Which SQL join returns all rows when there is a match in either left or right table?",
    options: ["INNER JOIN", "LEFT JOIN", "RIGHT JOIN", "FULL OUTER JOIN"],
    answer: "D",
    difficulty: "Easy",
    explanation: "FULL OUTER JOIN returns records from both tables matching either left or right query sets."
  },
  {
    topic: "SQL Playground",
    question: "Which SQL clause is used to filter group results returned by a GROUP BY query?",
    options: ["WHERE", "HAVING", "ORDER BY", "SELECT"],
    answer: "B",
    difficulty: "Medium",
    explanation: "HAVING is evaluated after grouping and filters aggregate statistics (e.g. HAVING COUNT(*) > 5), whereas WHERE filters base rows before grouping."
  },
  {
    topic: "DBMS Core",
    question: "What is the primary benefit of a B-Tree index structure in SQL databases?",
    options: ["Faster hash matches", "Maintains sorted order for efficient range queries", "No storage overhead", "Guarantees duplicate prevention"],
    answer: "B",
    difficulty: "Medium",
    explanation: "B-Trees keep data sorted, allowing logarithmic O(log N) lookups, inserts, and range queries."
  },
  {
    topic: "DBMS Core",
    question: "Which ACID property ensures that transactions are either fully completed or completely rolled back?",
    options: ["Atomicity", "Consistency", "Isolation", "Durability"],
    answer: "A",
    difficulty: "Easy",
    explanation: "Atomicity is the 'all or nothing' principle of transactions."
  },
  {
    topic: "Operating Systems",
    question: "Which scheduling algorithm is non-preemptive?",
    options: ["Round Robin", "First-Come, First-Served (FCFS)", "Shortest Remaining Time First", "Priority Scheduling (Preemptive)"],
    answer: "B",
    difficulty: "Easy",
    explanation: "FCFS runs processes to completion in their order of arrival without preemption."
  },
  {
    topic: "Operating Systems",
    question: "Which page replacement algorithm suffers from Belady's Anomaly?",
    options: ["LRU (Least Recently Used)", "FIFO (First In First Out)", "Optimal Page Replacement", "MRU (Most Recently Used)"],
    answer: "B",
    difficulty: "Medium",
    explanation: "FIFO page replacement can exhibit Belady's Anomaly where increasing physical page frames increases page faults."
  },
  {
    topic: "Computer Networks",
    question: "Which protocol is connection-oriented and guarantees packet delivery?",
    options: ["UDP", "IP", "ICMP", "TCP"],
    answer: "D",
    difficulty: "Easy",
    explanation: "TCP uses a three-way handshake, sequence checks, and acknowledgments to guarantee delivery, unlike UDP."
  },
  {
    topic: "Computer Networks",
    question: "Which layer of the OSI model does a router operate on?",
    options: ["Physical Layer", "Data Link Layer", "Network Layer", "Transport Layer"],
    answer: "C",
    difficulty: "Easy",
    explanation: "Routers operate on Layer 3 (Network Layer) using IP addresses to route packets between subnets."
  },
  {
    topic: "OOP",
    question: "Which concept allows a subclass to inherit attributes and methods of a parent class?",
    options: ["Abstraction", "Inheritance", "Polymorphism", "Encapsulation"],
    answer: "B",
    difficulty: "Easy",
    explanation: "Inheritance permits code reusability by sharing parent class traits with child classes."
  },
  {
    topic: "OOP",
    question: "What is method overloading?",
    options: ["Defining child class methods that override parent methods", "Defining multiple methods with same name but different signatures", "Creating an object from a class template", "Bundling properties and methods together"],
    answer: "B",
    difficulty: "Medium",
    explanation: "Method overloading is compile-time polymorphism where methods share names but differ in parameter counts or types."
  },
  {
    topic: "Software Engineering Core",
    question: "Which Git command applies the changes of a specific commit onto the current branch?",
    options: ["git merge", "git cherry-pick", "git rebase", "git checkout"],
    answer: "B",
    difficulty: "Medium",
    explanation: "Cherry-pick selects a specific commit SHA and commits its diff independently onto the current branch."
  },
  {
    topic: "Binary Search",
    question: "What is the maximum number of comparisons needed to find an element in a sorted array of size 1024?",
    options: ["1024 comparisons", "512 comparisons", "10 comparisons", "1 comparison"],
    answer: "C",
    difficulty: "Medium",
    explanation: "Binary search divides the workspace in half. log2(1024) = 10, meaning at most 10 iterations are required."
  }
];

export default function App() {
  // Google OAuth Hook Setup
  const [googleRequest, googleResponse, promptAsyncGoogle] = Google.useAuthRequest({
    clientId: '54642993956-7q3odq2tcc92pjeuba8q9apllrphki75.apps.googleusercontent.com',
    webClientId: '54642993956-7q3odq2tcc92pjeuba8q9apllrphki75.apps.googleusercontent.com',
    androidClientId: '54642993956-7q3odq2tcc92pjeuba8q9apllrphki75.apps.googleusercontent.com',
  });

  // Navigation / Auth State
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isOnboarded, setIsOnboarded] = useState(false);
  const [activeTab, setActiveTab] = useState('Home'); // Home, Practice, Assessments, Roadmap, Profile
  const [showGoogleModal, setShowGoogleModal] = useState(false);
  const [customGoogleEmail, setCustomGoogleEmail] = useState('');

  // Handle successful Google authentication redirect
  useEffect(() => {
    if (googleResponse?.type === 'success') {
      const { authentication } = googleResponse;
      const idToken = authentication?.idToken;
      if (idToken) {
        handleGoogleOAuthSuccess(idToken);
      }
    }
  }, [googleResponse]);

  const handleGoogleOAuthSuccess = async (idToken: string) => {
    try {
      const res = await axios.post(`${BACKEND_API_URL}/auth/google`, {
        id_token: idToken
      });
      console.log("Logged in with Google Auth backend:", res.data);
      
      const headers = { Authorization: `Bearer ${res.data.access_token}` };
      const profileRes = await axios.get(`${BACKEND_API_URL}/auth/profile`, { headers });
      setUserName(profileRes.data.name);
      setEmail(profileRes.data.email);
      setTargetRole(profileRes.data.target_role || 'Software Engineer');
      setIsOnboarded(!!profileRes.data.target_role);
      setIsLoggedIn(true);
    } catch (err) {
      console.warn("Failed syncing Google OAuth token with backend, falling back to local mock decode");
      try {
        const payloadBase64 = idToken.split('.')[1];
        const cleanBase64 = payloadBase64.replace(/-/g, '+').replace(/_/g, '/');
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=';
        let str = '';
        let bc = 0;
        let bs = 0;
        for (let i = 0; i < cleanBase64.length; i++) {
          const char = cleanBase64.charAt(i);
          const idx = chars.indexOf(char);
          if (idx === -1) continue;
          bc = (bc * 64) + idx;
          bs += 6;
          if (bs >= 8) {
            bs -= 8;
            const byte = (bc >> bs) & 0xff;
            str += String.fromCharCode(byte);
          }
        }
        const decoded = JSON.parse(str);
        setEmail(decoded.email);
        setUserName(decoded.name || decoded.email.split('@')[0]);
        setIsOnboarded(false);
        setIsLoggedIn(true);
      } catch (decodeErr) {
        setEmail("google.user@gmail.com");
        setUserName("Google User");
        setIsOnboarded(false);
        setIsLoggedIn(true);
      }
    }
  };
  
  // Opening Splash Animation States
  const [showSplash, setShowSplash] = useState(true);
  const fadeAnim = useState(new Animated.Value(0))[0];
  const scaleAnim = useState(new Animated.Value(0.5))[0];
  const textTranslateY = useState(new Animated.Value(20))[0];

  // Trigger intro opening sequence
  useEffect(() => {
    Animated.sequence([
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true
        }),
        Animated.spring(scaleAnim, {
          toValue: 1.0,
          friction: 4,
          tension: 30,
          useNativeDriver: true
        }),
        Animated.timing(textTranslateY, {
          toValue: 0,
          duration: 800,
          useNativeDriver: true
        })
      ]),
      Animated.delay(1600),
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 600,
        useNativeDriver: true
      })
    ]).start(() => {
      setShowSplash(false);
    });
  }, [fadeAnim, scaleAnim, textTranslateY]);
  
  // Auth details
  const [email, setEmail] = useState('student@placementforge.com');
  const [password, setPassword] = useState('password123');
  const [userName, setUserName] = useState('');
  
  // Onboarding Form
  const [degree, setDegree] = useState('B.Tech Computer Science');
  const [gradYear, setGradYear] = useState('2027');
  const [targetRole, setTargetRole] = useState('Data Engineer');
  const [dsaLevel, setDsaLevel] = useState('Beginner');
  const [userSkills, setUserSkills] = useState('Python, SQL, JavaScript');
  const [studyHours, setStudyHours] = useState('4');

  // Gamification Metrics
  const [xp, setXp] = useState(0);
  const [streak, setStreak] = useState(1);
  const [solvedCoding, setSolvedCoding] = useState(0);
  const [completedMCQs, setCompletedMCQs] = useState(0);
  const [completedRoadmapSteps, setCompletedRoadmapSteps] = useState<string[]>([]);

  // Weekly Language Performance success rates (%)
  const [pythonSuccessRate, setPythonSuccessRate] = useState(85);
  const [sqlSuccessRate, setSqlSuccessRate] = useState(55); // Starts low to prompt SQL roadmap recovery

  // Daily Mission Checks
  const [missionCodingSolved, setMissionCodingSolved] = useState(false);
  const [missionSQLSolved, setMissionSQLSolved] = useState(false);

  // Active Practice Problem State
  const [selectedPracticeType, setSelectedPracticeType] = useState<string | null>(null); // coding, sql, mcq, puzzle
  const [sqlQuery, setSqlQuery] = useState('SELECT * FROM orders WHERE amount > 100;');
  const [sqlResult, setSqlResult] = useState<string | null>(null);
  
  const [codeContent, setCodeContent] = useState('def solve(nums, target):\n    # Write your solution here\n    pass');
  const [codeResult, setCodeResult] = useState<string | null>(null);

  // Improved 15-question MCQ Engine States
  const [currentMCQIndex, setCurrentMCQIndex] = useState(0);
  const [selectedMCQOption, setSelectedMCQOption] = useState<string | null>(null);
  const [mcqAnswers, setMcqAnswers] = useState<Record<number, string>>({});
  const [isMCQQuizSubmitted, setIsMCQQuizSubmitted] = useState(false);

  // Resume analysis state
  const [resumeName, setResumeName] = useState('');
  const [resumeAnalysisResult, setResumeAnalysisResult] = useState<any | null>(null);

  // 1v1 Code Duel Arena States
  const [arenaMMR, setArenaMMR] = useState(1200);
  const [duelWins, setDuelWins] = useState(0);
  const [duelLosses, setDuelLosses] = useState(0);
  const [showDuelQueue, setShowDuelQueue] = useState(false);
  const [isInDuel, setIsInDuel] = useState(false);
  const [duelTimeRemaining, setDuelTimeRemaining] = useState(300); // 5 mins
  const [duelElapsedSeconds, setDuelElapsedSeconds] = useState(0);
  const [duelOpponentSolved, setDuelOpponentSolved] = useState(0); // Opponent test cases (out of 5)
  const [duelUserSolved, setDuelUserSolved] = useState(0);         // User test cases (out of 5)
  const [duelResult, setDuelResult] = useState<'victory' | 'defeat' | 'draw' | null>(null);
  const [duelOpponentName, setDuelOpponentName] = useState('Alex Chen');
  const [duelOpponentMMR, setDuelOpponentMMR] = useState(1240);
  const [duelCode, setDuelCode] = useState('');
  const [duelMessage, setDuelMessage] = useState('');

  // Handle 1v1 Duel timer & opponent simulation
  useEffect(() => {
    let interval: any;
    if (isInDuel && !duelResult) {
      interval = setInterval(() => {
        setDuelTimeRemaining((prev) => {
          if (prev <= 1) {
            clearInterval(interval);
            const userWon = duelUserSolved > duelOpponentSolved;
            if (userWon) {
              setDuelWins(p => p + 1);
              setArenaMMR(p => p + 25);
            } else if (duelUserSolved < duelOpponentSolved) {
              setDuelLosses(p => p + 1);
              setArenaMMR(p => Math.max(1000, p - 15));
            }
            setDuelResult(userWon ? 'victory' : (duelUserSolved === duelOpponentSolved ? 'draw' : 'defeat'));
            return 0;
          }
          return prev - 1;
        });
        
        setDuelElapsedSeconds((prev) => {
          const nextSec = prev + 1;
          
          // Opponent progress simulation
          if (nextSec === 35) {
            setDuelOpponentSolved(2);
          } else if (nextSec === 80) {
            setDuelOpponentSolved(4);
          } else if (nextSec === 130) {
            setDuelOpponentSolved(5);
            setDuelResult('defeat');
            setDuelLosses(p => p + 1);
            setArenaMMR(p => Math.max(1000, p - 15));
            setDuelMessage("Alex Chen passed 5/5 test cases first! Defeat (-15 MMR).");
          }
          
          return nextSec;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isInDuel, duelResult, duelUserSolved, duelOpponentSolved]);

  // Timed Contest Arena States
  const [isContestRegistered, setIsContestRegistered] = useState(false);
  const [isInContestMode, setIsInContestMode] = useState(false);
  const [contestTimeRemaining, setContestTimeRemaining] = useState(3600); // 60 mins
  const [contestElapsedSeconds, setContestElapsedSeconds] = useState(0);
  const [contestQuestions, setContestQuestions] = useState(CONTEST_QUESTIONS);
  const [selectedContestQIndex, setSelectedContestQIndex] = useState(0);
  const [contestCode, setContestCode] = useState('');
  const [contestMsg, setContestMsg] = useState('');

  // Handle countdown interval
  useEffect(() => {
    let interval: any;
    if (isInContestMode) {
      interval = setInterval(() => {
        setContestTimeRemaining((prev) => {
          if (prev <= 1) {
            clearInterval(interval);
            setIsInContestMode(false);
            alert("Time's up! Your contest answers have been automatically logged.");
            return 0;
          }
          return prev - 1;
        });
        setContestElapsedSeconds((prev) => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isInContestMode]);

  // Load template code when active question changes
  useEffect(() => {
    if (contestQuestions[selectedContestQIndex]) {
      setContestCode(contestQuestions[selectedContestQIndex].template);
    }
  }, [selectedContestQIndex, contestQuestions]);

  const submitContestQuestion = () => {
    const updated = [...contestQuestions];
    updated[selectedContestQIndex].solved = true;
    setContestQuestions(updated);
    
    // Award score and update profile metrics
    setXp((prev) => prev + 25);
    setContestMsg("Correct! Submission validated. 25 XP awarded.");
    
    // Complete corresponding roadmap step based on contest question type!
    const qType = contestQuestions[selectedContestQIndex].type;
    const stepToComplete = qType === 'sql' ? "Window Functions" : "Binary Search";
    setCompletedRoadmapSteps((prev) => {
      if (!prev.includes(stepToComplete)) {
        return [...prev, stepToComplete];
      }
      return prev;
    });

    setTimeout(() => {
      setContestMsg('');
    }, 2000);
  };

  const getDynamicLeaderboard = () => {
    const userScore = contestQuestions.filter(q => q.solved).length * 25;
    const list = [
      { name: "Sarah Miller (AI)", score: 75, time: 450 },
      { name: "John Doe (AI)", score: 50, time: 580 },
      { name: "Emily Smith (AI)", score: 25, time: 340 },
      { name: "You (Student)", score: userScore, time: contestElapsedSeconds }
    ];
    
    // Sort by score DESC, tie break by time taken ASC
    return list.sort((a, b) => {
      if (b.score !== a.score) {
        return b.score - a.score;
      }
      return a.time - b.time;
    });
  };

  const formatTimerValue = (totalSeconds: number) => {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleLogin = () => {
    if (email && password) {
      setIsLoggedIn(true);
    }
  };

  const handleGoogleLogin = async (selectedEmail: string, name: string) => {
    setShowGoogleModal(false);
    try {
      const tokenString = `mock-google-token-${selectedEmail}`;
      const API_URL = 'http://localhost:8000/api/v1';
      const response = await axios.post(`${API_URL}/auth/google`, {
        id_token: tokenString
      });
      console.log("Synced Google Auth with backend:", response.data);
    } catch (err) {
      console.log("Backend offline, continuing in offline/mock Google auth mode");
    }

    setEmail(selectedEmail);
    setUserName(name);
    
    if (selectedEmail === 'new.user@gmail.com') {
      setIsOnboarded(false);
    } else {
      if (selectedEmail.includes('alex')) {
        setTargetRole('Software Engineer');
        setUserSkills('Python, JavaScript');
      } else {
        setTargetRole('Data Engineer');
        setUserSkills('SQL, Python');
      }
      setIsOnboarded(true);
    }
    setIsLoggedIn(true);
  };

  // Dynamic Placement Readiness Score computed from actual tracking
  const skillsCount = userSkills ? userSkills.split(',').length : 0;
  const onboardingBase = (userSkills.toLowerCase().includes('sql') ? 10 : 0) + (skillsCount > 2 ? 5 : 0) + (studyHours === '4' ? 3 : 0);
  
  const readinessScore = Math.min(
    100,
    onboardingBase +
    (completedRoadmapSteps.length * 15) + // +15 per completed roadmap step
    (solvedCoding * 3) +                  // +3 per coding challenge
    (completedMCQs * 0.5) +               // +0.5 per MCQ
    (streak * 2) +                        // +2 per streak day
    (contestQuestions.filter(q => q.solved).length * 5) // +5 per contest submission
  );

  // Dynamically select roadmap steps based on language performance
  const getAdaptiveRoadmap = () => {
    if (sqlSuccessRate < 70 && pythonSuccessRate >= 70) {
      return {
        title: "SQL Recovery Track (Focus: Database Queries)",
        steps: ["SQL Joins", "Aggregations", "Window Functions", "DBMS Indexes"],
        reason: `Allocated because your SQL Success Rate (${sqlSuccessRate}%) is below 70%.`
      };
    } else if (pythonSuccessRate < 70 && sqlSuccessRate >= 70) {
      return {
        title: "DSA Recovery Track (Focus: Algorithms)",
        steps: ["Arrays & Strings", "Two Pointers", "Stacks", "Binary Search"],
        reason: `Allocated because your Python/DSA Success Rate (${pythonSuccessRate}%) is below 70%.`
      };
    } else {
      return {
        title: "Balanced Full-Stack Development Track",
        steps: ["Arrays & Strings", "SQL Joins", "Binary Search", "Window Functions"],
        reason: `Allocated because your weekly success rates (Python: ${pythonSuccessRate}%, SQL: ${sqlSuccessRate}%) are balanced.`
      };
    }
  };

  const handleOnboard = () => {
    if (userName) {
      setIsOnboarded(true);
    } else {
      alert("Please enter your name to complete onboarding.");
    }
  };

  // Run SQL Playground query simulator
  const runSQLQuery = () => {
    if (sqlQuery.toLowerCase().includes('select')) {
      setSqlResult("Status: Success!\nRows Returned: 3\n[ { id: 104, customer: 'Alice', amount: 150.0 }, ... ]");
      setXp(xp + 10);
      setMissionSQLSolved(true);
      
      // Auto complete SQL roadmap step
      setCompletedRoadmapSteps((prev) => {
        const step = "SQL Joins";
        if (!prev.includes(step)) {
          return [...prev, step];
        }
        return prev;
      });
    } else {
      setSqlResult("Error: Syntax error near token. Expected SELECT statement.");
    }
  };

  // Run Code Editor sandbox simulator
  const runCode = () => {
    setCodeResult("Status: Running on Sandbox...\nAll Test Cases Passed! (0.04s, 24MB)");
    setXp(xp + 15);
    setSolvedCoding(solvedCoding + 1);
    setMissionCodingSolved(true);

    // Auto complete DSA roadmap step
    setCompletedRoadmapSteps((prev) => {
      const step = "Arrays & Strings";
      if (!prev.includes(step)) {
        return [...prev, step];
      }
      return prev;
    });
  };

  const [isAnalyzingResume, setIsAnalyzingResume] = useState(false);

  const simulateUpload = (fileName: string) => {
    setResumeName(fileName);
    setIsAnalyzingResume(true);
    setResumeAnalysisResult(null);

    // Simulate 1.5s AI parsing delay
    setTimeout(() => {
      setIsAnalyzingResume(false);
      
      // Select mock scores based on file type
      if (fileName.includes("Software")) {
        setResumeAnalysisResult({
          score: 87,
          matched: ["React", "TypeScript", "Node.js", "Jest", "Git", "REST APIs"],
          missing: ["Docker", "Kubernetes", "AWS Cloud"],
          feedback: "Outstanding layout structure. Highly quantitative metrics. Consider adding details about database sizing or container deployments.",
          questions: [
            "How do you design a scalable state architecture in React?",
            "Explain your testing approach for asynchronous API fetch cycles."
          ]
        });
      } else {
        setResumeAnalysisResult({
          score: 64,
          matched: ["Excel", "SQL", "Tableau", "Python"],
          missing: ["Pandas", "Airflow", "Data Warehousing", "Window Functions"],
          feedback: "Good base skill lists. ATS score is slightly low because the resume lacks descriptive metrics showing optimization impact (e.g., % time saved). Add projects highlighting large database queries.",
          questions: [
            "How do you write a rolling weekly aggregate in SQL?",
            "Describe a data ETL pipeline you built and how you handled schema drift."
          ]
        });
      }
    }, 1500);
  };

  if (showSplash) {
    return (
      <View style={styles.splashContainer}>
        <Animated.View style={[styles.splashBox, { opacity: fadeAnim, transform: [{ scale: scaleAnim }] }]}>
          <Animated.Text style={styles.splashLogo}>Code Quest</Animated.Text>
          <Animated.Text style={[styles.splashSubtitle, { transform: [{ translateY: textTranslateY }] }]}>
            Forge Your Coding Journey
          </Animated.Text>
        </Animated.View>
      </View>
    );
  }

  if (!isLoggedIn) {
    return (
      <SafeAreaView style={styles.loginContainer}>
        <StatusBar barStyle="light-content" />
        <View style={styles.loginBox}>
          <Text style={styles.logoText}>Code Quest</Text>
          <Text style={styles.loginSubtitle}>Your complete programming assessment platform</Text>
          
          <TextInput
            style={styles.input}
            placeholder="Student Email"
            placeholderTextColor="#888"
            value={email}
            onChangeText={setEmail}
          />
          <TextInput
            style={styles.input}
            placeholder="Password"
            placeholderTextColor="#888"
            secureTextEntry
            value={password}
            onChangeText={setPassword}
          />

          <TouchableOpacity style={styles.primaryButton} onPress={handleLogin}>
            <Text style={styles.buttonText}>Log In</Text>
          </TouchableOpacity>

          <View style={styles.separatorRow}>
            <View style={styles.separatorLine} />
            <Text style={styles.separatorText}>OR</Text>
            <View style={styles.separatorLine} />
          </View>

          <TouchableOpacity 
            style={styles.googleButton} 
            onPress={() => {
              promptAsyncGoogle();
            }}
          >
            <Text style={styles.googleButtonText}>🔵  Sign in with Google</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={{ marginTop: 12, alignItems: 'center' }} 
            onPress={() => setShowGoogleModal(true)}
          >
            <Text style={{ color: '#60a5fa', fontSize: 13, textDecorationLine: 'underline' }}>
              Or use mock accounts (for testing)
            </Text>
          </TouchableOpacity>
        </View>

        {/* Google Account Selector Modal */}
        <Modal
          visible={showGoogleModal}
          transparent={true}
          animationType="slide"
          onRequestClose={() => setShowGoogleModal(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.googleSheet}>
              <View style={styles.googleSheetHeader}>
                <Text style={styles.googleSheetTitle}>Sign in with Google</Text>
                <Text style={styles.googleSheetSubtitle}>to continue to Code Quest</Text>
              </View>
              
              <ScrollView style={styles.accountsList}>
                <TouchableOpacity 
                  style={styles.accountRow} 
                  onPress={() => handleGoogleLogin('alex.chen@gmail.com', 'Alex Chen')}
                >
                  <View style={styles.avatarCircle}>
                    <Text style={styles.avatarText}>AC</Text>
                  </View>
                  <View style={styles.accountInfo}>
                    <Text style={styles.accountName}>Alex Chen</Text>
                    <Text style={styles.accountEmail}>alex.chen@gmail.com</Text>
                    <Text style={styles.accountBadge}>Software Engineer Track</Text>
                  </View>
                </TouchableOpacity>

                <TouchableOpacity 
                  style={styles.accountRow} 
                  onPress={() => handleGoogleLogin('sarah.miller@gmail.com', 'Sarah Miller')}
                >
                  <View style={styles.avatarCircle}>
                    <Text style={styles.avatarText}>SM</Text>
                  </View>
                  <View style={styles.accountInfo}>
                    <Text style={styles.accountName}>Sarah Miller</Text>
                    <Text style={styles.accountEmail}>sarah.miller@gmail.com</Text>
                    <Text style={styles.accountBadge}>Data Engineer Track</Text>
                  </View>
                </TouchableOpacity>

                <TouchableOpacity 
                  style={styles.accountRow} 
                  onPress={() => handleGoogleLogin('new.user@gmail.com', 'New User')}
                >
                  <View style={[styles.avatarCircle, { backgroundColor: '#10b981' }]}>
                    <Text style={styles.avatarText}>NU</Text>
                  </View>
                  <View style={styles.accountInfo}>
                    <Text style={styles.accountName}>New User</Text>
                    <Text style={styles.accountEmail}>new.user@gmail.com</Text>
                    <Text style={styles.accountBadge}>Start Personalization</Text>
                  </View>
                </TouchableOpacity>

                {/* Custom User Entry */}
                <View style={styles.customEmailBox}>
                  <Text style={styles.customEmailLabel}>Use another account</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="Enter custom gmail address"
                    placeholderTextColor="#888"
                    value={customGoogleEmail}
                    onChangeText={setCustomGoogleEmail}
                    autoCapitalize="none"
                    keyboardType="email-address"
                  />
                  <TouchableOpacity 
                    style={[styles.primaryButton, { marginTop: 8, paddingVertical: 10 }]}
                    onPress={() => {
                      if (!customGoogleEmail.includes('@')) {
                        alert("Please enter a valid email address");
                        return;
                      }
                      const cleanName = customGoogleEmail.split('@')[0].split('.').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
                      handleGoogleLogin(customGoogleEmail, cleanName);
                    }}
                  >
                    <Text style={styles.buttonText}>Continue with custom email</Text>
                  </TouchableOpacity>
                </View>
              </ScrollView>

              <TouchableOpacity 
                style={styles.cancelGoogleBtn} 
                onPress={() => setShowGoogleModal(false)}
              >
                <Text style={styles.cancelGoogleText}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      </SafeAreaView>
    );
  }

  if (!isOnboarded) {
    return (
      <SafeAreaView style={styles.loginContainer}>
        <ScrollView contentContainerStyle={styles.onboardScroll}>
          <Text style={styles.headerText}>Personalize Your Path</Text>
          <Text style={styles.subheadText}>Answer 6 questions to build your study roadmap</Text>
          
          <Text style={styles.label}>Full Name</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter your name"
            placeholderTextColor="#888"
            value={userName}
            onChangeText={setUserName}
          />

          <Text style={styles.label}>What degree are you pursuing?</Text>
          <TextInput
            style={styles.input}
            placeholder="e.g. B.Tech Computer Science"
            placeholderTextColor="#888"
            value={degree}
            onChangeText={setDegree}
          />

          <Text style={styles.label}>Graduation Year</Text>
          <TextInput
            style={styles.input}
            placeholder="e.g. 2027"
            placeholderTextColor="#888"
            value={gradYear}
            onChangeText={setGradYear}
          />

          <Text style={styles.label}>Target Job Role</Text>
          <TextInput
            style={styles.input}
            placeholder="e.g. Data Scientist, DevOps, Full Stack Developer"
            placeholderTextColor="#888"
            value={targetRole}
            onChangeText={setTargetRole}
          />

          <Text style={styles.label}>What skills do you have?</Text>
          <TextInput
            style={styles.input}
            placeholder="e.g. Python, SQL, JavaScript, Java"
            placeholderTextColor="#888"
            value={userSkills}
            onChangeText={setUserSkills}
          />

          <Text style={styles.label}>Daily target study hours?</Text>
          <TextInput
            style={styles.input}
            placeholder="Hours per day (e.g. 3)"
            placeholderTextColor="#888"
            value={studyHours}
            onChangeText={setStudyHours}
          />

          <TouchableOpacity style={styles.primaryButton} onPress={handleOnboard}>
            <Text style={styles.buttonText}>Generate Roadmap</Text>
          </TouchableOpacity>
        </ScrollView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />
      
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.welcomeText}>Hello, {userName}!</Text>
          <Text style={styles.roleTagText}>{targetRole} Track</Text>
        </View>
        <View style={styles.headerMetrics}>
          <Text style={styles.streakBadge}>🔥 {streak} Days</Text>
          <Text style={styles.xpBadge}>⭐ {xp} XP</Text>
        </View>
      </View>

      {/* Main Tab Views */}
      <ScrollView style={styles.mainContent}>
        
        {/* HOME DASHBOARD */}
        {activeTab === 'Home' && (
          <View style={styles.tabContent}>
            
            {/* Placement Readiness Score */}
            <View style={styles.card}>
              <Text style={styles.cardTitle}>Placement Readiness Score</Text>
              <View style={styles.readinessContainer}>
                <Text style={styles.scoreNumber}>{readinessScore}<Text style={styles.scoreMax}>/100</Text></Text>
                <Text style={styles.scoreGrade}>Ready status: Intermediate</Text>
              </View>
              <View style={styles.progressBar}>
                <View style={[styles.progressFill, { width: `${readinessScore}%` }]} />
              </View>
              <Text style={styles.weakText}>Weak: DBMS & Airflow Orchestration (Need review)</Text>
            </View>

            {/* Daily Mission Card */}
            <View style={styles.card}>
              <Text style={styles.cardTitle}>Today's Adaptive Mission</Text>
              <View style={styles.missionItem}>
                <Text style={[styles.missionText, missionCodingSolved && styles.missionDone]}>
                  {missionCodingSolved ? "✅" : "⬜"} Solve 1 Medium DSA Problem
                </Text>
              </View>
              <View style={styles.missionItem}>
                <Text style={[styles.missionText, missionSQLSolved && styles.missionDone]}>
                  {missionSQLSolved ? "✅" : "⬜"} Write 1 Analytical SQL Query
                </Text>
              </View>
              <View style={styles.missionItem}>
                <Text style={styles.missionText}>⬜ Complete 10 DBMS MCQs</Text>
              </View>
            </View>

            {/* Preparation Statistics */}
            <View style={styles.statsGrid}>
              <View style={styles.statBox}>
                <Text style={styles.statLabel}>Solved DSA</Text>
                <Text style={styles.statValue}>{solvedCoding}</Text>
              </View>
              <View style={styles.statBox}>
                <Text style={styles.statLabel}>MCQs Checked</Text>
                <Text style={styles.statValue}>{completedMCQs}</Text>
              </View>
            </View>

            <TouchableOpacity style={styles.quickPracticeBtn} onPress={() => setActiveTab('Practice')}>
              <Text style={styles.quickPracticeText}>Start Daily Prep Session</Text>
            </TouchableOpacity>

          </View>
        )}

        {/* PRACTICE TAB */}
        {activeTab === 'Practice' && (
          <View style={styles.tabContent}>
            <Text style={styles.sectionHeader}>Practice Playground</Text>
            
            {/* Show Category List or active Practice details */}
            {!selectedPracticeType ? (
              <View style={styles.practiceSelectorGrid}>
                
                <TouchableOpacity style={styles.practiceCard} onPress={() => setSelectedPracticeType('coding')}>
                  <Text style={styles.practiceCardIcon}>💻</Text>
                  <Text style={styles.practiceCardTitle}>DSA Code Editor</Text>
                  <Text style={styles.practiceCardDesc}>Solve coding challenges in Python, C++, Java</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.practiceCard} onPress={() => setSelectedPracticeType('sql')}>
                  <Text style={styles.practiceCardIcon}>📊</Text>
                  <Text style={styles.practiceCardTitle}>SQL Sandbox</Text>
                  <Text style={styles.practiceCardDesc}>Practice writing analytical queries against datasets</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.practiceCard} onPress={() => setSelectedPracticeType('mcq')}>
                  <Text style={styles.practiceCardIcon}>📝</Text>
                  <Text style={styles.practiceCardTitle}>MCQ Quiz Engine</Text>
                  <Text style={styles.practiceCardDesc}>Test your knowledge in CS Core & Aptitude concepts</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.practiceCard} onPress={() => setSelectedPracticeType('puzzle')}>
                  <Text style={styles.practiceCardIcon}>🧩</Text>
                  <Text style={styles.practiceCardTitle}>Interview Puzzles</Text>
                  <Text style={styles.practiceCardDesc}>Train on logical brainteasers and estimation riddles</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.practiceCard} onPress={() => setSelectedPracticeType('duel')}>
                  <Text style={styles.practiceCardIcon}>⚔️</Text>
                  <Text style={styles.practiceCardTitle}>1v1 Code Duels</Text>
                  <Text style={styles.practiceCardDesc}>Enter matchmaking and race against an opponent</Text>
                </TouchableOpacity>

              </View>
            ) : (
              <View>
                <TouchableOpacity style={styles.backBtn} onPress={() => { setSelectedPracticeType(null); setSqlResult(null); setCodeResult(null); }}>
                  <Text style={styles.backBtnText}>← Back to Playground</Text>
                </TouchableOpacity>

                {/* CODING PANEL */}
                {selectedPracticeType === 'coding' && (
                  <View style={styles.card}>
                    <Text style={styles.cardTitle}>Problem: Reverse Linked List</Text>
                    <Text style={styles.problemDesc}>
                      Given the head of a singly linked list, reverse the list, and return its head.
                    </Text>
                    <Text style={styles.label}>Write your Code (Python/Java):</Text>
                    <TextInput
                      multiline
                      numberOfLines={8}
                      style={styles.codeArea}
                      value={codeContent}
                      onChangeText={setCodeContent}
                    />
                    <TouchableOpacity style={styles.runBtn} onPress={runCode}>
                      <Text style={styles.runBtnText}>Run on Secure Sandbox</Text>
                    </TouchableOpacity>
                    {codeResult && (
                      <View style={styles.resultBox}>
                        <Text style={styles.resultText}>{codeResult}</Text>
                      </View>
                    )}
                  </View>
                )}

                {/* SQL PANEL */}
                {selectedPracticeType === 'sql' && (
                  <View style={styles.card}>
                    <Text style={styles.cardTitle}>Challenge: Combine Two Tables</Text>
                    <Text style={styles.problemDesc}>
                      Report Person details with City/State. Show nulls if address is missing.
                    </Text>
                    <Text style={styles.label}>Write SQL Query:</Text>
                    <TextInput
                      multiline
                      numberOfLines={5}
                      style={styles.codeArea}
                      value={sqlQuery}
                      onChangeText={setSqlQuery}
                    />
                    <TouchableOpacity style={styles.runBtn} onPress={runSQLQuery}>
                      <Text style={styles.runBtnText}>Execute Transaction</Text>
                    </TouchableOpacity>
                    {sqlResult && (
                      <View style={styles.resultBox}>
                        <Text style={styles.resultText}>{sqlResult}</Text>
                      </View>
                    )}
                  </View>
                )}

                {/* IMPROVED 15-QUESTION MCQ QUIZ ENGINE */}
                {selectedPracticeType === 'mcq' && (
                  <View>
                    {!isMCQQuizSubmitted ? (
                      // ACTIVE QUIZ INTERFACE
                      <View style={styles.card}>
                        <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 }}>
                          <Text style={{ color: '#818cf8', fontWeight: 'bold', fontSize: 12 }}>
                            📂 {MCQ_QUIZ_QUESTIONS[currentMCQIndex].topic}
                          </Text>
                          <Text style={{ color: '#9ca3af', fontSize: 12 }}>
                            Question {currentMCQIndex + 1} of {MCQ_QUIZ_QUESTIONS.length}
                          </Text>
                        </View>
                        
                        <Text style={styles.contestQTitle}>
                          {MCQ_QUIZ_QUESTIONS[currentMCQIndex].question}
                        </Text>
                        <View style={{ alignSelf: 'flex-start', backgroundColor: MCQ_QUIZ_QUESTIONS[currentMCQIndex].difficulty === 'Easy' ? '#064e3b' : '#78350f', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6, marginBottom: 16 }}>
                          <Text style={{ color: '#fff', fontSize: 10, fontWeight: 'bold' }}>
                            {MCQ_QUIZ_QUESTIONS[currentMCQIndex].difficulty}
                          </Text>
                        </View>

                        {/* Options buttons */}
                        {MCQ_QUIZ_QUESTIONS[currentMCQIndex].options.map((opt, i) => {
                          const letter = ['A', 'B', 'C', 'D'][i];
                          const isSelected = selectedMCQOption === letter || mcqAnswers[currentMCQIndex] === letter;
                          return (
                            <TouchableOpacity 
                              key={letter}
                              style={[styles.mcqOptionBtn, isSelected && styles.mcqOptionActive]} 
                              onPress={() => {
                                setSelectedMCQOption(letter);
                                setMcqAnswers(prev => ({ ...prev, [currentMCQIndex]: letter }));
                              }}
                            >
                              <Text style={styles.mcqOptionText}>{letter}. {opt}</Text>
                            </TouchableOpacity>
                          );
                        })}

                        {/* Action buttons */}
                        <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 12 }}>
                          {currentMCQIndex > 0 ? (
                            <TouchableOpacity 
                              style={[styles.secondaryButton, { flex: 1, marginRight: 6 }]} 
                              onPress={() => {
                                const prevIdx = currentMCQIndex - 1;
                                setCurrentMCQIndex(prevIdx);
                                setSelectedMCQOption(mcqAnswers[prevIdx] || null);
                              }}
                            >
                              <Text style={styles.buttonText}>Previous</Text>
                            </TouchableOpacity>
                          ) : null}

                          <TouchableOpacity 
                            style={[styles.runBtn, { flex: 2, marginTop: 0 }]} 
                            onPress={() => {
                              if (!selectedMCQOption && !mcqAnswers[currentMCQIndex]) {
                                alert("Please select an option before proceeding.");
                                return;
                              }
                              if (currentMCQIndex < MCQ_QUIZ_QUESTIONS.length - 1) {
                                const nextIdx = currentMCQIndex + 1;
                                setCurrentMCQIndex(nextIdx);
                                setSelectedMCQOption(mcqAnswers[nextIdx] || null);
                              } else {
                                // Calculate total score and submit quiz
                                let correct = 0;
                                MCQ_QUIZ_QUESTIONS.forEach((q, idx) => {
                                  if (mcqAnswers[idx] === q.answer) {
                                    correct++;
                                  }
                                });
                                setCompletedMCQs(prev => prev + MCQ_QUIZ_QUESTIONS.length);
                                setXp(prev => prev + (correct * 5));
                                
                                // Auto complete corresponding roadmap step!
                                setCompletedRoadmapSteps((prev) => {
                                  const step = "DBMS Indexes";
                                  if (!prev.includes(step)) {
                                    return [...prev, step];
                                  }
                                  return prev;
                                });

                                setIsMCQQuizSubmitted(true);
                              }
                            }}
                          >
                            <Text style={styles.runBtnText}>
                              {currentMCQIndex === MCQ_QUIZ_QUESTIONS.length - 1 ? "Finish Quiz & Grade" : "Next Question"}
                            </Text>
                          </TouchableOpacity>
                        </View>
                      </View>
                    ) : (
                      // QUIZ SCORE REPORT CARD DISPLAY
                      <View>
                        {(() => {
                          let correctCount = 0;
                          MCQ_QUIZ_QUESTIONS.forEach((q, idx) => {
                            if (mcqAnswers[idx] === q.answer) {
                              correctCount++;
                            }
                          });
                          const percentage = Math.round((correctCount / MCQ_QUIZ_QUESTIONS.length) * 100);
                          return (
                            <View>
                              {/* Score Card */}
                              <View style={styles.card}>
                                <Text style={styles.cardTitle}>Roadmap Assessment Report Card</Text>
                                <View style={{ alignItems: 'center', marginVertical: 16 }}>
                                  <View style={{ width: 90, height: 90, borderRadius: 45, borderColor: '#10b981', borderWidth: 4, justifyContent: 'center', alignItems: 'center' }}>
                                    <Text style={{ color: '#fff', fontSize: 24, fontWeight: 'bold' }}>
                                      {correctCount}/{MCQ_QUIZ_QUESTIONS.length}
                                    </Text>
                                    <Text style={{ color: '#9ca3af', fontSize: 10 }}>Score</Text>
                                  </View>
                                  <Text style={{ color: '#10b981', fontSize: 16, fontWeight: 'bold', marginTop: 12 }}>
                                    Quiz Grade: {percentage}%
                                  </Text>
                                  <Text style={{ color: '#f59e0b', fontSize: 12, marginTop: 4 }}>
                                    ⭐ +{correctCount * 5} XP Awarded!
                                  </Text>
                                </View>
                                
                                <TouchableOpacity 
                                  style={styles.primaryButton} 
                                  onPress={() => {
                                    setCurrentMCQIndex(0);
                                    setSelectedMCQOption(null);
                                    setMcqAnswers({});
                                    setIsMCQQuizSubmitted(false);
                                  }}
                                >
                                  <Text style={styles.buttonText}>Retake Quiz from Scratch</Text>
                                </TouchableOpacity>
                              </View>

                              {/* Question Review */}
                              <Text style={styles.sectionHeader}>Question Review & Explanations</Text>
                              {MCQ_QUIZ_QUESTIONS.map((q, idx) => {
                                const isCorrect = mcqAnswers[idx] === q.answer;
                                return (
                                  <View key={idx} style={[styles.card, { borderColor: isCorrect ? '#064e3b' : '#7f1d1d', borderWidth: 1 }]}>
                                    <Text style={{ color: isCorrect ? '#10b981' : '#f87171', fontWeight: 'bold', marginBottom: 6 }}>
                                      Q{idx + 1}: {isCorrect ? "✅ Correct" : "❌ Incorrect"}
                                    </Text>
                                    <Text style={{ color: '#fff', fontWeight: '500', fontSize: 13, marginBottom: 8 }}>
                                      {q.question}
                                    </Text>
                                    <Text style={{ color: '#9ca3af', fontSize: 12 }}>
                                      Your Answer: {mcqAnswers[idx] || "Unanswered"} | Correct Answer: {q.answer}
                                    </Text>
                                    <View style={{ backgroundColor: '#111827', padding: 10, borderRadius: 6, marginTop: 8 }}>
                                      <Text style={{ color: '#60a5fa', fontSize: 11, fontWeight: 'bold', marginBottom: 2 }}>
                                        Explanation:
                                      </Text>
                                      <Text style={{ color: '#d1d5db', fontSize: 11 }}>
                                        {q.explanation}
                                      </Text>
                                    </View>
                                  </View>
                                );
                              })}
                            </View>
                          );
                        })()}
                      </View>
                    )}
                  </View>
                )}

                {/* PUZZLE PANEL */}
                {selectedPracticeType === 'puzzle' && (
                  <View style={styles.card}>
                    <Text style={styles.cardTitle}>Puzzle: 3 Bulbs and 3 Switches</Text>
                    <Text style={styles.problemDesc}>
                      You have 3 switches downstairs and 3 bulbs upstairs. How do you find which matches which in exactly one trip?
                    </Text>
                    <TouchableOpacity style={styles.hintBtn} onPress={() => alert("Hint: Think about heat!")}>
                      <Text style={styles.hintBtnText}>Show Hint</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.runBtn} onPress={() => alert("Solution: Turn switch 1 ON for 10 minutes, turn it off. Turn switch 2 ON. Go upstairs. Hot = 1, Lit = 2, Cold/Off = 3.")}>
                      <Text style={styles.runBtnText}>Reveal Solution & Explanation</Text>
                    </TouchableOpacity>
                  </View>
                )}

                {/* 1v1 LIVE CODE DUEL ARENA */}
                {selectedPracticeType === 'duel' && (
                  <View>
                    {!isInDuel && !showDuelQueue ? (
                      // ARENA LOBBY SCREEN
                      <View>
                        <View style={styles.card}>
                          <Text style={styles.cardTitle}>⚔️ 1v1 Live Code Duels</Text>
                          <Text style={styles.cardMeta}>
                            Your Arena Rating: {arenaMMR} MMR | Record: {duelWins}W - {duelLosses}L
                          </Text>
                          <Text style={styles.problemDesc}>
                            Enter matchmaking to duel a live opponent. The first to solve the coding challenge under a 5-minute limit wins rating points and bonus XP!
                          </Text>
                          
                          <TouchableOpacity 
                            style={styles.primaryButton}
                            onPress={() => {
                              setShowDuelQueue(true);
                              setDuelResult(null);
                              setDuelUserSolved(0);
                              setDuelOpponentSolved(0);
                              setDuelElapsedSeconds(0);
                              setDuelTimeRemaining(300);
                              setDuelMessage('');
                              
                              // Matchmaking delay
                              setTimeout(() => {
                                setShowDuelQueue(false);
                                setIsInDuel(true);
                                setDuelCode("class Solution:\n    def containsDuplicate(self, nums: list[int]) -> bool:\n        # Solve before Alex Chen does!\n        return False");
                              }, 2000);
                            }}
                          >
                            <Text style={styles.buttonText}>🚀 Find Opponent (Join Queue)</Text>
                          </TouchableOpacity>
                        </View>

                        {/* GLOBAL DUEL LEADERBOARD PANEL */}
                        <View style={styles.card}>
                          <Text style={styles.cardTitle}>Global Duel Arena Standings</Text>
                          {(() => {
                            const leaderboardData = [
                              { name: "Sarah Miller (AI)", mmr: 1420, record: "18W - 2L", streak: "🔥 5" },
                              { name: "Alex Chen (AI)", mmr: 1240, record: "12W - 4L", streak: "🔥 2" },
                              { name: "You (Student)", mmr: arenaMMR, record: `${duelWins}W - ${duelLosses}L`, streak: duelWins > 0 ? `🔥 ${duelWins}` : "0" },
                              { name: "John Doe (AI)", mmr: 1180, record: "8W - 7L", streak: "0" },
                              { name: "Emily Smith (AI)", mmr: 1100, record: "5W - 8L", streak: "0" }
                            ];

                            // Sort dynamically by MMR DESC
                            const sorted = leaderboardData.sort((a, b) => b.mmr - a.mmr);

                            return sorted.map((player, idx) => {
                              const isUser = player.name.includes("You");
                              return (
                                <View key={idx} style={[styles.leaderboardRow, isUser && styles.leaderboardUserRow]}>
                                  <Text style={styles.leaderboardRank}>#{idx + 1}</Text>
                                  <Text style={styles.leaderboardName}>{player.name}</Text>
                                  <Text style={{ color: '#f59e0b', fontWeight: 'bold', width: 85, textAlign: 'right' }}>
                                    {player.mmr} MMR
                                  </Text>
                                  <Text style={{ color: '#9ca3af', width: 60, textAlign: 'right', fontSize: 11 }}>
                                    {player.record}
                                  </Text>
                                </View>
                              );
                            });
                          })()}
                        </View>
                      </View>
                    ) : showDuelQueue ? (
                      // MATCHMAKING LOADER SCREEN
                      <View style={styles.card}>
                        <Text style={{ fontSize: 32, textAlign: 'center', marginBottom: 12 }}>🔍</Text>
                        <Text style={[styles.cardTitle, { textAlign: 'center' }]}>1v1 Matchmaking Queue</Text>
                        <Text style={{ color: '#9ca3af', textAlign: 'center', marginVertical: 8 }}>
                          Searching for opponents near {arenaMMR} MMR...
                        </Text>
                        <Text style={{ color: '#60a5fa', fontSize: 12, fontWeight: 'bold', textAlign: 'center' }}>
                          Connecting to server socket...
                        </Text>
                      </View>
                    ) : (
                      // DUEL ARENA INTERACTIVE MATCH
                      <View style={styles.arenaContainer}>
                        <View style={styles.arenaHeader}>
                          <Text style={styles.arenaTitle}>⚔️ vs {duelOpponentName} ({duelOpponentMMR} MMR)</Text>
                          <Text style={styles.arenaTimer}>⏰ Time Left: {formatTimerValue(duelTimeRemaining)}</Text>
                        </View>

                        {/* LIVE PROGRESS RACE INDICATOR */}
                        <View style={[styles.card, { flexDirection: 'row', justifyContent: 'space-between', backgroundColor: '#1f2937' }]}>
                          <View style={{ flex: 1, alignItems: 'center' }}>
                            <Text style={{ color: '#60a5fa', fontWeight: 'bold', fontSize: 12 }}>YOU</Text>
                            <Text style={{ color: '#fff', fontSize: 18, fontWeight: 'bold', marginTop: 4 }}>
                              {duelUserSolved}/5 cases
                            </Text>
                          </View>
                          <View style={{ width: 1, backgroundColor: '#374151', marginHorizontal: 12 }} />
                          <View style={{ flex: 1, alignItems: 'center' }}>
                            <Text style={{ color: '#f87171', fontWeight: 'bold', fontSize: 12 }}>{duelOpponentName.toUpperCase()}</Text>
                            <Text style={{ color: '#fff', fontSize: 18, fontWeight: 'bold', marginTop: 4 }}>
                              {duelOpponentSolved}/5 cases
                            </Text>
                          </View>
                        </View>

                        {/* PROBLEM DISPLAY */}
                        <View style={styles.card}>
                          <Text style={styles.contestQTitle}>Contains Duplicate (Easy)</Text>
                          <Text style={styles.problemDesc}>
                            Given an integer array nums, return true if any value appears at least twice in the array, and false if every element is distinct.
                          </Text>
                          
                          <Text style={styles.label}>Solve in Python Console:</Text>
                          <TextInput
                            multiline
                            numberOfLines={8}
                            style={styles.codeArea}
                            value={duelCode}
                            onChangeText={setDuelCode}
                          />

                          {duelMessage ? <Text style={[styles.successMsg, { color: duelResult === 'defeat' ? '#f87171' : '#10b981' }]}>{duelMessage}</Text> : null}

                          {!duelResult ? (
                            <TouchableOpacity 
                              style={styles.runBtn}
                              onPress={() => {
                                const nextSolved = Math.min(5, duelUserSolved + 2);
                                setDuelUserSolved(nextSolved);
                                if (nextSolved === 5) {
                                  setDuelResult('victory');
                                  setArenaMMR(prev => prev + 25);
                                  setXp(prev => prev + 30);
                                  setDuelWins(prev => prev + 1);
                                  setDuelMessage("VICTORY! You solved all test cases first! +25 MMR, +30 XP awarded.");
                                } else {
                                  setDuelMessage(`Submitting... Passed ${nextSolved}/5 test cases! Speed up!`);
                                  setTimeout(() => setDuelMessage(''), 2000);
                                }
                              }}
                            >
                              <Text style={styles.runBtnText}>Submit Code & Run Tests</Text>
                            </TouchableOpacity>
                          ) : (
                            <View style={{ marginTop: 12, alignItems: 'center' }}>
                              <Text style={{ fontSize: 24, fontWeight: 'bold', color: duelResult === 'victory' ? '#10b981' : '#f87171', marginBottom: 8 }}>
                                {duelResult === 'victory' ? "🏆 VICTORY!" : "❌ DEFEAT!"}
                              </Text>
                              <TouchableOpacity 
                                style={styles.primaryButton}
                                onPress={() => {
                                  setIsInDuel(false);
                                  setDuelResult(null);
                                  setSelectedPracticeType(null);
                                }}
                              >
                                <Text style={styles.buttonText}>Exit Duel Lobby</Text>
                              </TouchableOpacity>
                            </View>
                          )}
                        </View>
                      </View>
                    )}
                  </View>
                )}

              </View>
            )}
          </View>
        )}
         {/* ASSESSMENTS TAB */}
        {activeTab === 'Assessments' && (
          <View style={styles.tabContent}>
            {!isInContestMode ? (
              <View>
                <Text style={styles.sectionHeader}>Online Assessments</Text>
                
                {/* TIMED CONTEST CARD */}
                <View style={styles.card}>
                  <Text style={styles.cardTitle}>Weekly Timed Coding Arena #1</Text>
                  <Text style={styles.cardMeta}>Duration: 60 mins | 2 DSA Problems, 2 SQL Queries</Text>
                  <Text style={styles.problemDesc}>
                    Compete live with other developers. Your score is based on correctness, and ties are broken by compilation speed.
                  </Text>
                  
                  {!isContestRegistered ? (
                    <TouchableOpacity style={styles.primaryButton} onPress={() => { setIsContestRegistered(true); alert("Registered! You can now enter the arena when ready."); }}>
                      <Text style={styles.buttonText}>Register for Timed Arena</Text>
                    </TouchableOpacity>
                  ) : (
                    <TouchableOpacity 
                      style={[styles.primaryButton, { backgroundColor: '#10b981' }]} 
                      onPress={() => {
                        // Reset contest scores
                        const resetQs = contestQuestions.map(q => ({ ...q, solved: false }));
                        setContestQuestions(resetQs);
                        setContestTimeRemaining(3600);
                        setContestElapsedSeconds(0);
                        setSelectedContestQIndex(0);
                        setContestCode(resetQs[0].template);
                        setIsInContestMode(true);
                      }}
                    >
                      <Text style={styles.buttonText}>🔥 Enter Timed Arena (Live)</Text>
                    </TouchableOpacity>
                  )}
                </View>

                {/* PRACTICE TEST CARDS */}
                <View style={styles.card}>
                  <Text style={styles.cardTitle}>Amazon mock OA (Coding + MCQs)</Text>
                  <Text style={styles.cardMeta}>Duration: 60 mins | 2 Coding, 10 Core MCQs</Text>
                  <TouchableOpacity style={styles.secondaryButton} onPress={() => alert("Launching Secure Fullscreen Assessment...")}>
                    <Text style={styles.buttonText}>Launch Mock Test</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ) : (
              // LIVE TIMED CONTEST ARENA SCREEN
              <View style={styles.arenaContainer}>
                <View style={styles.arenaHeader}>
                  <Text style={styles.arenaTitle}>Weekly Arena Challenge #1</Text>
                  <Text style={styles.arenaTimer}>⏰ Time Remaining: {formatTimerValue(contestTimeRemaining)}</Text>
                </View>
                
                {/* Question index buttons */}
                <View style={styles.contestQRow}>
                  {contestQuestions.map((q, idx) => (
                    <TouchableOpacity
                      key={idx}
                      style={[styles.contestQBtn, selectedContestQIndex === idx && styles.contestQBtnActive]}
                      onPress={() => setSelectedContestQIndex(idx)}
                    >
                      <Text style={styles.contestQText}>Q{idx + 1} {q.solved ? "✅" : ""}</Text>
                    </TouchableOpacity>
                  ))}
                </View>

                {/* Selected Question Details */}
                <View style={styles.card}>
                  <Text style={styles.contestQTitle}>
                    {selectedContestQIndex + 1}. {contestQuestions[selectedContestQIndex].title} ({contestQuestions[selectedContestQIndex].difficulty})
                  </Text>
                  <Text style={styles.problemDesc}>{contestQuestions[selectedContestQIndex].desc}</Text>
                  
                  <Text style={styles.label}>Solve in Code/Query Workspace:</Text>
                  <TextInput
                    multiline
                    numberOfLines={8}
                    style={styles.codeArea}
                    value={contestCode}
                    onChangeText={setContestCode}
                  />

                  {contestMsg ? <Text style={styles.successMsg}>{contestMsg}</Text> : null}

                  <TouchableOpacity style={styles.runBtn} onPress={submitContestQuestion}>
                    <Text style={styles.runBtnText}>Submit to Contest Leaderboard</Text>
                  </TouchableOpacity>
                </View>

                {/* Live Standings Leaderboard */}
                <View style={styles.card}>
                  <Text style={styles.cardTitle}>Live Leaderboard Standings (Penalty Sorting)</Text>
                  {getDynamicLeaderboard().map((player, idx) => {
                    const isUser = player.name.includes("You");
                    return (
                      <View key={idx} style={[styles.leaderboardRow, isUser && styles.leaderboardUserRow]}>
                        <Text style={styles.leaderboardRank}>#{idx + 1}</Text>
                        <Text style={styles.leaderboardName}>{player.name}</Text>
                        <Text style={styles.leaderboardScore}>{player.score} pts</Text>
                        <Text style={styles.leaderboardTime}>{player.time}s</Text>
                      </View>
                    );
                  })}
                </View>

                <TouchableOpacity 
                  style={[styles.secondaryButton, { marginTop: 10, borderColor: '#ef4444' }]} 
                  onPress={() => {
                    if (confirm("Are you sure you want to exit? Your active progress will remain, but the clock keeps ticking!")) {
                      setIsInContestMode(false);
                    }
                  }}
                >
                  <Text style={[styles.buttonText, { color: '#ef4444' }]}>Exit Coding Arena</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        )}

        {/* GAMIFICATION TAB */}
        {activeTab === 'Gamification' && (
          <View style={styles.tabContent}>
            <Text style={styles.sectionHeader}>Your Gamification Center Center</Text>
            
            {/* Level & Title */}
            <View style={styles.card}>
              <Text style={styles.cardTitle}>Level {Math.floor(xp / 150) + 1} - Code Warrior</Text>
              <Text style={styles.cardMeta}>{xp} XP earned overall</Text>
              <View style={styles.progressBar}>
                <View style={[styles.progressFill, { width: `${Math.min(100, (xp % 150) / 1.5)}%`, backgroundColor: '#818cf8' }]} />
              </View>
              <Text style={styles.label}>{(150 - (xp % 150))} XP remaining to next level</Text>
            </View>

            {/* Badges Showcase Grid */}
            <Text style={styles.sectionHeader}>Unlocked Medals & Badges</Text>
            <View style={styles.statsGrid}>
              <View style={[styles.statBox, { opacity: (solvedCoding > 0) ? 1 : 0.4 }]}>
                <Text style={{ fontSize: 24 }}>🚀</Text>
                <Text style={[styles.statLabel, { marginTop: 4 }]}>First Step</Text>
                <Text style={{ fontSize: 10, color: '#9ca3af', textAlign: 'center' }}>Solve 1 DSA challenge</Text>
              </View>
              <View style={[styles.statBox, { opacity: completedRoadmapSteps.includes("SQL Joins") ? 1 : 0.4 }]}>
                <Text style={{ fontSize: 24 }}>🔥</Text>
                <Text style={[styles.statLabel, { marginTop: 4 }]}>SQL Master</Text>
                <Text style={{ fontSize: 10, color: '#9ca3af', textAlign: 'center' }}>Complete SQL Joins roadmap</Text>
              </View>
              <View style={[styles.statBox, { opacity: (contestQuestions.filter(q => q.solved).length > 0) ? 1 : 0.4 }]}>
                <Text style={{ fontSize: 24 }}>👑</Text>
                <Text style={[styles.statLabel, { marginTop: 4 }]}>Arena Warrior</Text>
                <Text style={{ fontSize: 10, color: '#9ca3af', textAlign: 'center' }}>Solve a Timed Contest challenge</Text>
              </View>
              <View style={[styles.statBox, { opacity: streak > 0 ? 1 : 0.4 }]}>
                <Text style={{ fontSize: 24 }}>⚡</Text>
                <Text style={[styles.statLabel, { marginTop: 4 }]}>Power Streak</Text>
                <Text style={{ fontSize: 10, color: '#9ca3af', textAlign: 'center' }}>Keep an active daily streak</Text>
              </View>
            </View>

            {/* Active Quests */}
            <View style={styles.card}>
              <Text style={styles.cardTitle}>Active Weekly Quests</Text>
              <View style={styles.missionItem}>
                <Text style={styles.missionText}>
                  {completedRoadmapSteps.length >= 2 ? "✅" : "⬜"} Complete 2 Roadmap steps ({completedRoadmapSteps.length}/2)
                </Text>
              </View>
              <View style={styles.missionItem}>
                <Text style={styles.missionText}>
                  {contestQuestions.filter(q => q.solved).length >= 1 ? "✅" : "⬜"} Pass 1 Contest question ({contestQuestions.filter(q => q.solved).length}/1)
                </Text>
              </View>
            </View>

            {/* Weekly Language Performance */}
            <Text style={styles.sectionHeader}>Weekly Language Performance</Text>
            <View style={styles.statsGrid}>
              <View style={styles.statBox}>
                <Text style={styles.statLabel}>Python & DSA</Text>
                <Text style={[styles.statValue, { color: pythonSuccessRate < 70 ? '#f87171' : '#10b981' }]}>{pythonSuccessRate}%</Text>
                <Text style={{ fontSize: 10, color: '#9ca3af', marginTop: 4 }}>
                  {pythonSuccessRate < 70 ? "Needs Practice" : "Proficient"}
                </Text>
                <TouchableOpacity 
                  style={{ marginTop: 8, backgroundColor: '#1f2937', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 4 }}
                  onPress={() => {
                    setPythonSuccessRate(prev => (prev < 70 ? 85 : 55));
                  }}
                >
                  <Text style={{ color: '#3b82f6', fontSize: 10 }}>Toggle Rating</Text>
                </TouchableOpacity>
              </View>

              <View style={styles.statBox}>
                <Text style={styles.statLabel}>PostgreSQL & SQL</Text>
                <Text style={[styles.statValue, { color: sqlSuccessRate < 70 ? '#f87171' : '#10b981' }]}>{sqlSuccessRate}%</Text>
                <Text style={{ fontSize: 10, color: '#9ca3af', marginTop: 4 }}>
                  {sqlSuccessRate < 70 ? "Struggling! ⚠️" : "Proficient"}
                </Text>
                <TouchableOpacity 
                  style={{ marginTop: 8, backgroundColor: '#1f2937', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 4 }}
                  onPress={() => {
                    setSqlSuccessRate(prev => (prev < 70 ? 80 : 55));
                  }}
                >
                  <Text style={{ color: '#3b82f6', fontSize: 10 }}>Toggle Rating</Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Adaptive Weekly Roadmap */}
            <Text style={styles.sectionHeader}>Allocated Weekly Roadmap</Text>
            {(() => {
              const roadmap = getAdaptiveRoadmap();
              return (
                <View style={styles.card}>
                  <Text style={styles.cardTitle}>{roadmap.title}</Text>
                  <Text style={{ fontSize: 11, color: '#60a5fa', marginVertical: 4, fontStyle: 'italic' }}>
                    {roadmap.reason}
                  </Text>
                  
                  {roadmap.steps.map((step, idx) => {
                    const isStepCompleted = completedRoadmapSteps.includes(step);
                    return (
                      <View key={idx} style={styles.roadmapStepRow}>
                        <View style={[styles.roadmapStepNumber, isStepCompleted && { backgroundColor: '#064e3b' }]}>
                          <Text style={styles.stepNumText}>{idx + 1}</Text>
                        </View>
                        <View style={styles.roadmapStepContent}>
                          <Text style={styles.stepTitleText}>{step}</Text>
                          <Text style={[styles.stepStatusText, isStepCompleted && { color: '#10b981', fontWeight: 'bold' }]}>
                            Status: {isStepCompleted ? "Completed" : "In Progress"}
                          </Text>
                        </View>
                      </View>
                    );
                  })}
                </View>
              );
            })()}
          </View>
        )}

        {/* PROFILE TAB */}
        {activeTab === 'Profile' && (
          <View style={styles.tabContent}>
            <Text style={styles.sectionHeader}>AI Resume Analysis</Text>
            
            <View style={styles.card}>
              <Text style={styles.cardTitle}>Upload Resume for ATS & Skill Audit</Text>
              
              {!resumeName ? (
                // EMPTY / NOT UPLOADED STATE
                <View style={styles.uploadBox}>
                  <Text style={{ fontSize: 32, marginBottom: 8, textAlign: 'center' }}>📁</Text>
                  <Text style={{ color: '#fff', fontWeight: 'bold', textAlign: 'center' }}>Select or Drag Resume File</Text>
                  <Text style={{ color: '#9ca3af', fontSize: 11, marginTop: 4, textAlign: 'center', marginBottom: 12 }}>
                    Select a mock resume file below to simulate device upload:
                  </Text>
                  
                  <View style={{ flexDirection: 'column' }}>
                    <TouchableOpacity 
                      style={[styles.secondaryButton, { marginVertical: 6 }]} 
                      onPress={() => simulateUpload("Software_Engineer_CV.pdf")}
                    >
                      <Text style={styles.buttonText}>📄 Upload Software_Engineer_CV.pdf</Text>
                    </TouchableOpacity>
                    <TouchableOpacity 
                      style={[styles.secondaryButton, { marginVertical: 6 }]} 
                      onPress={() => simulateUpload("Data_Analyst_Resume.docx")}
                    >
                      <Text style={styles.buttonText}>📄 Upload Data_Analyst_Resume.docx</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              ) : (
                // UPLOADED / PROCESSING / COMPLETED STATE
                <View>
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#111827', padding: 12, borderRadius: 8, marginBottom: 12 }}>
                    <Text style={{ color: '#10b981', fontWeight: 'bold', fontSize: 13 }}>📄 {resumeName}</Text>
                    <TouchableOpacity 
                      style={{ backgroundColor: '#ef4444', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 4 }}
                      onPress={() => { setResumeName(''); setResumeAnalysisResult(null); }}
                    >
                      <Text style={{ color: '#fff', fontSize: 10, fontWeight: 'bold' }}>Remove</Text>
                    </TouchableOpacity>
                  </View>

                  {isAnalyzingResume && (
                    <View style={{ padding: 16, alignItems: 'center' }}>
                      <Text style={{ color: '#3b82f6', fontWeight: 'bold', fontSize: 14 }}>
                        ⚙️ Analyzing resume matching with job target...
                      </Text>
                    </View>
                  )}

                  {resumeAnalysisResult && (
                    <View style={styles.analysisBox}>
                      <View style={{ alignItems: 'center', marginVertical: 12 }}>
                        <View style={{ width: 80, height: 80, borderRadius: 40, borderColor: resumeAnalysisResult.score >= 80 ? '#10b981' : '#f59e0b', borderWidth: 3, justifyContent: 'center', alignItems: 'center' }}>
                          <Text style={{ color: '#fff', fontSize: 22, fontWeight: 'bold' }}>{resumeAnalysisResult.score}</Text>
                          <Text style={{ color: '#9ca3af', fontSize: 9 }}>ATS Score</Text>
                        </View>
                        <Text style={{ color: '#fff', fontSize: 14, fontWeight: 'bold', marginTop: 8 }}>
                          {resumeAnalysisResult.score >= 80 ? "Strong Role Match" : "Optimizations Recommended"}
                        </Text>
                      </View>
                      
                      <Text style={styles.analysisSubHeader}>Matched Keywords:</Text>
                      <Text style={styles.analysisText}>{resumeAnalysisResult.matched.join(', ')}</Text>
                      
                      <Text style={styles.analysisSubHeader}>Missing Keywords:</Text>
                      <Text style={styles.analysisTextDanger}>{resumeAnalysisResult.missing.join(', ')}</Text>
                      
                      <Text style={styles.analysisSubHeader}>Resume Feedback:</Text>
                      <Text style={styles.analysisText}>{resumeAnalysisResult.feedback}</Text>

                      <Text style={styles.analysisSubHeader}>Suggested Project Prep Questions:</Text>
                      {resumeAnalysisResult.questions.map((q: string, idx: number) => (
                        <Text key={idx} style={styles.analysisText}>• {q}</Text>
                      ))}
                    </View>
                  )}
                </View>
              )}
            </View>

            <TouchableOpacity 
              style={[styles.secondaryButton, { marginTop: 20 }]} 
              onPress={() => { setIsLoggedIn(false); setIsOnboarded(false); }}
            >
              <Text style={styles.buttonText}>Log Out</Text>
            </TouchableOpacity>
          </View>
        )}

      </ScrollView>

      {/* Bottom Navigation Bar */}
      <View style={styles.bottomNav}>
        {['Home', 'Practice', 'Assessments', 'Gamification', 'Profile'].map((tab) => {
          const isActive = activeTab === tab;
          const icons: Record<string, string> = { Home: '🏠', Practice: '💡', Assessments: '🏆', Gamification: '⚡', Profile: '👤' };
          return (
            <TouchableOpacity 
              key={tab} 
              style={styles.navItem} 
              onPress={() => { setActiveTab(tab); setSelectedPracticeType(null); }}
            >
              <Text style={styles.navIcon}>{icons[tab]}</Text>
              <Text style={[styles.navText, isActive && styles.navTextActive]}>{tab}</Text>
            </TouchableOpacity>
          );
        })}
      </View>

    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#090d16',
  },
  loginContainer: {
    flex: 1,
    backgroundColor: '#090d16',
    justifyContent: 'center',
    padding: 20
  },
  onboardScroll: {
    paddingVertical: 40,
    paddingHorizontal: 10
  },
  loginBox: {
    backgroundColor: '#0e1526',
    padding: 28,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    width: '100%',
    maxWidth: 450,
    alignSelf: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
  },
  logoText: {
    fontSize: 32,
    fontWeight: '900',
    color: '#3b82f6',
    textAlign: 'center',
    letterSpacing: 1.5,
  },
  loginSubtitle: {
    fontSize: 13,
    color: '#9ca3af',
    textAlign: 'center',
    marginBottom: 24,
    marginTop: 4,
  },
  headerText: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
    marginBottom: 8,
  },
  subheadText: {
    fontSize: 14,
    color: '#9ca3af',
    textAlign: 'center',
    marginBottom: 24,
  },
  input: {
    backgroundColor: '#090d16',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    padding: 14,
    color: '#fff',
    fontSize: 15,
    marginBottom: 16,
  },
  label: {
    color: '#d1d5db',
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 8,
    letterSpacing: 0.5,
  },
  primaryButton: {
    backgroundColor: '#4f46e5',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 10,
    shadowColor: '#4f46e5',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  secondaryButton: {
    backgroundColor: '#1b233a',
    padding: 14,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)'
  },
  buttonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  selectRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  selectBtn: {
    flex: 1,
    minWidth: '28%',
    backgroundColor: '#1b233a',
    padding: 12,
    borderRadius: 10,
    alignItems: 'center',
    marginHorizontal: 4,
    marginVertical: 4,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.06)'
  },
  selectBtnActive: {
    backgroundColor: '#4f46e5',
    borderColor: '#6366f1',
  },
  selectBtnText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  header: {
    height: 70,
    backgroundColor: '#090d16',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.06)',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  welcomeText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
  },
  roleTagText: {
    fontSize: 12,
    color: '#60a5fa',
    fontWeight: '600',
  },
  headerMetrics: {
    flexDirection: 'row',
  },
  streakBadge: {
    backgroundColor: '#451a03',
    color: '#f97316',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    fontSize: 12,
    fontWeight: 'bold',
    marginRight: 6,
  },
  xpBadge: {
    backgroundColor: '#1e1b4b',
    color: '#818cf8',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    fontSize: 12,
    fontWeight: 'bold',
  },
  mainContent: {
    flex: 1,
  },
  tabContent: {
    padding: 16,
  },
  sectionHeader: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 16,
    letterSpacing: 0.5,
  },
  card: {
    backgroundColor: '#0e1526',
    borderRadius: 16,
    padding: 18,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 8,
  },
  cardMeta: {
    fontSize: 12,
    color: '#9ca3af',
    marginBottom: 12,
  },
  readinessContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'baseline',
    marginBottom: 10,
  },
  scoreNumber: {
    fontSize: 34,
    fontWeight: '900',
    color: '#10b981',
  },
  scoreMax: {
    fontSize: 16,
    color: '#6b7280',
  },
  scoreGrade: {
    fontSize: 12,
    color: '#9ca3af',
  },
  progressBar: {
    height: 8,
    backgroundColor: '#374151',
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 10,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#10b981',
  },
  weakText: {
    fontSize: 11,
    color: '#f87171',
  },
  missionItem: {
    marginVertical: 4,
  },
  missionText: {
    fontSize: 14,
    color: '#d1d5db',
  },
  missionDone: {
    textDecorationLine: 'line-through',
    color: '#6b7280',
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  statBox: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: '#111827',
    padding: 16,
    borderRadius: 12,
    marginHorizontal: 4,
    marginVertical: 4,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#1f2937',
  },
  statLabel: {
    color: '#9ca3af',
    fontSize: 11,
    marginBottom: 4,
  },
  statValue: {
    color: '#fff',
    fontSize: 24,
    fontWeight: 'bold',
  },
  quickPracticeBtn: {
    backgroundColor: '#10b981',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 10,
  },
  quickPracticeText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: 'bold',
  },
  practiceSelectorGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  practiceCard: {
    width: '48%',
    minWidth: 140,
    backgroundColor: '#111827',
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#1f2937',
  },
  practiceCardIcon: {
    fontSize: 24,
    marginBottom: 8,
  },
  practiceCardTitle: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  practiceCardDesc: {
    color: '#9ca3af',
    fontSize: 10,
  },
  backBtn: {
    paddingVertical: 8,
    marginBottom: 16,
  },
  backBtnText: {
    color: '#3b82f6',
    fontWeight: 'bold',
  },
  problemDesc: {
    color: '#d1d5db',
    fontSize: 13,
    marginBottom: 12,
    lineHeight: 18,
  },
  codeArea: {
    backgroundColor: '#030712',
    color: '#10b981',
    fontFamily: 'monospace',
    padding: 12,
    borderRadius: 8,
    fontSize: 13,
    borderWidth: 1,
    borderColor: '#374151',
    textAlignVertical: 'top',
    marginBottom: 12,
  },
  runBtn: {
    backgroundColor: '#3b82f6',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  runBtnText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  resultBox: {
    marginTop: 12,
    backgroundColor: '#030712',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#374151',
  },
  resultText: {
    color: '#d1d5db',
    fontFamily: 'monospace',
    fontSize: 12,
  },
  mcqOptionBtn: {
    backgroundColor: '#1f2937',
    padding: 12,
    borderRadius: 8,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#374151',
  },
  mcqOptionActive: {
    backgroundColor: '#1e3a8a',
    borderColor: '#3b82f6',
  },
  mcqOptionText: {
    color: '#fff',
    fontSize: 13,
  },
  resultSuccess: {
    color: '#10b981',
    fontWeight: 'bold',
    marginBottom: 4,
  },
  resultExplain: {
    color: '#9ca3af',
    fontSize: 11,
  },
  hintBtn: {
    paddingVertical: 8,
    alignSelf: 'flex-start',
    marginBottom: 10,
  },
  hintBtnText: {
    color: '#f59e0b',
    fontWeight: 'bold',
    fontSize: 12,
  },
  roadmapTitle: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 12,
  },
  roadmapStepRow: {
    flexDirection: 'row',
    marginVertical: 6,
    alignItems: 'center',
  },
  roadmapStepNumber: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#2563eb',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  stepNumText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: 'bold',
  },
  roadmapStepContent: {
    flex: 1,
  },
  stepTitleText: {
    color: '#fff',
    fontSize: 13,
    fontWeight: 'bold',
  },
  stepStatusText: {
    color: '#6b7280',
    fontSize: 10,
  },
  analysisBox: {
    marginTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#374151',
    paddingTop: 16,
  },
  analysisScore: {
    color: '#10b981',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  analysisSubHeader: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
    marginTop: 10,
  },
  analysisText: {
    color: '#d1d5db',
    fontSize: 12,
    marginTop: 2,
  },
  analysisTextDanger: {
    color: '#f87171',
    fontSize: 12,
    marginTop: 2,
  },
  bottomNav: {
    height: 60,
    backgroundColor: '#111827',
    borderTopWidth: 1,
    borderTopColor: '#1f2937',
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  navItem: {
    alignItems: 'center',
  },
  navIcon: {
    fontSize: 18,
  },
  navText: {
    fontSize: 10,
    color: '#9ca3af',
    marginTop: 2,
  },
  navTextActive: {
    color: '#3b82f6',
    fontWeight: 'bold',
  },
  arenaContainer: {
    flex: 1,
  },
  arenaHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    paddingHorizontal: 4,
  },
  arenaTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
  },
  arenaTimer: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#f87171',
  },
  contestQRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  contestQBtn: {
    flex: 1,
    backgroundColor: '#1f2937',
    padding: 10,
    borderRadius: 8,
    alignItems: 'center',
    marginHorizontal: 4,
    borderWidth: 1,
    borderColor: '#374151',
  },
  contestQBtnActive: {
    backgroundColor: '#1e3a8a',
    borderColor: '#3b82f6',
  },
  contestQText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  contestQTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 8,
  },
  successMsg: {
    color: '#10b981',
    fontWeight: 'bold',
    fontSize: 13,
    marginBottom: 10,
  },
  leaderboardRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#1f2937',
  },
  leaderboardUserRow: {
    backgroundColor: '#1e3a8a',
    borderRadius: 4,
    paddingHorizontal: 6,
  },
  leaderboardRank: {
    color: '#3b82f6',
    fontWeight: 'bold',
    width: 30,
  },
  leaderboardName: {
    color: '#fff',
    flex: 1,
  },
  leaderboardScore: {
    color: '#10b981',
    fontWeight: 'bold',
    width: 60,
    textAlign: 'right',
  },
  leaderboardTime: {
    color: '#9ca3af',
    width: 50,
    textAlign: 'right',
  },
  splashContainer: {
    flex: 1,
    backgroundColor: '#030712',
    justifyContent: 'center',
    alignItems: 'center',
  },
  splashBox: {
    alignItems: 'center',
  },
  splashLogo: {
    fontSize: 38,
    fontWeight: '900',
    color: '#3b82f6',
    letterSpacing: 2,
    marginBottom: 10,
  },
  splashSubtitle: {
    fontSize: 14,
    color: '#9ca3af',
    fontWeight: '500',
    letterSpacing: 1,
  },
  uploadBox: {
    borderWidth: 2,
    borderColor: '#374151',
    borderStyle: 'dashed',
    borderRadius: 12,
    padding: 20,
    alignItems: 'stretch',
    justifyContent: 'center',
    backgroundColor: '#111827',
    marginVertical: 10,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(3, 7, 18, 0.85)',
    justifyContent: 'flex-end',
  },
  googleSheet: {
    backgroundColor: '#0f172a',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    maxHeight: '80%',
    borderWidth: 1,
    borderColor: '#1e293b',
  },
  googleSheetHeader: {
    alignItems: 'center',
    marginBottom: 20,
  },
  googleSheetTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
  },
  googleSheetSubtitle: {
    fontSize: 14,
    color: '#94a3b8',
    marginTop: 4,
  },
  accountsList: {
    marginBottom: 20,
  },
  accountRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1e293b',
    padding: 14,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#334155',
  },
  avatarCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#2563eb',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  avatarText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  accountInfo: {
    flex: 1,
  },
  accountName: {
    color: '#fff',
    fontSize: 15,
    fontWeight: 'bold',
  },
  accountEmail: {
    color: '#94a3b8',
    fontSize: 13,
    marginTop: 2,
  },
  accountBadge: {
    color: '#38bdf8',
    fontSize: 10,
    fontWeight: 'bold',
    marginTop: 4,
  },
  customEmailBox: {
    backgroundColor: '#1e293b',
    padding: 16,
    borderRadius: 12,
    marginTop: 8,
    borderWidth: 1,
    borderColor: '#334155',
  },
  customEmailLabel: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  cancelGoogleBtn: {
    alignItems: 'center',
    paddingVertical: 14,
    backgroundColor: '#334155',
    borderRadius: 12,
  },
  cancelGoogleText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: 'bold',
  },
  googleButton: {
    backgroundColor: '#fff',
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 12,
  },
  googleButtonText: {
    color: '#0f172a',
    fontSize: 15,
    fontWeight: 'bold',
  },
  separatorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 16,
  },
  separatorLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#334155',
  },
  separatorText: {
    color: '#64748b',
    marginHorizontal: 12,
    fontSize: 12,
    fontWeight: 'bold',
  },
});
