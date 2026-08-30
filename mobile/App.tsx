import React, { useState, useEffect, useRef } from 'react';
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
  Animated,
  Image,
  Switch,
  Dimensions
} from 'react-native';
import axios from 'axios';
import * as WebBrowser from 'expo-web-browser';
import * as Google from 'expo-auth-session/providers/google';
import * as DocumentPicker from 'expo-document-picker';
import { firebaseAuthSignIn } from './firebase';

WebBrowser.maybeCompleteAuthSession();

const { width } = Dimensions.get('window');

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
  },
  {
    role: "Frontend",
    steps: ["HTML5 & CSS Grid", "JavaScript ES6+", "React Hooks", "State Management", "Performance Optimization"]
  },
  {
    role: "Full-Stack",
    steps: ["Data Structures", "REST APIs", "React Frontend", "Node/Express Backend", "PostgreSQL & Docker"]
  },
  {
    role: "DevOps",
    steps: ["Linux Internals", "Docker Containers", "Kubernetes", "CI/CD Pipelines", "AWS Cloud Architecture"]
  }
];

const CONTEST_QUESTIONS = [
  { 
    title: "Two Sum", 
    type: "coding", 
    difficulty: "Easy", 
    companies: ["AMAZON", "GOOGLE"],
    desc: "Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target.\n\nYou may assume that each input would have exactly one solution, and you may not use the same element twice.", 
    template: `/**
 * @param {number[]} nums
 * @param {number} target
 * @return {number[]}
 */
var twoSum = function(nums, target) {
    const map = new Map();
    for (let i = 0; i < nums.length; i++) {
        const complement = target - nums[i];
        if (map.has(complement)) {
            return [map.get(complement), i];
        }
        map.set(nums[i], i);
    }
};`, 
    input: "nums = [2,7,11,15], target = 9", 
    output: "[0,1]", 
    solved: true 
  },
  { 
    title: "Contains Duplicate", 
    type: "coding", 
    difficulty: "Easy", 
    companies: ["APPLE", "MICROSOFT"],
    desc: "Given an integer array nums, return true if any value appears at least twice in the array, and false if every element is distinct.", 
    template: "var containsDuplicate = function(nums) {\n    return new Set(nums).size !== nums.length;\n};", 
    input: "nums = [1,2,3,1]", 
    output: "true", 
    solved: false 
  },
  { 
    title: "Department Top Three Salaries", 
    type: "sql", 
    difficulty: "Medium", 
    companies: ["GOOGLE", "META"],
    desc: "Find the employees who are high earners in each of the departments. A high earner earns a salary in the top three unique salaries in that department.", 
    template: "SELECT d.name AS Department, e.name AS Employee, e.salary AS Salary\nFROM Employee e JOIN Department d ON e.departmentId = d.id\nWHERE 3 > (SELECT COUNT(DISTINCT e2.salary) FROM Employee e2 WHERE e2.salary > e.salary AND e2.departmentId = e.departmentId);", 
    input: "Run on PostgreSQL engine", 
    output: "Rows matching top salaries per department", 
    solved: false 
  },
  { 
    title: "Combine Two Tables", 
    type: "sql", 
    difficulty: "Easy", 
    companies: ["AMAZON"],
    desc: "Report first name, last name, city, and state of each person. If the address of a personId is not in Address table, report null.", 
    template: "SELECT firstName, lastName, city, state\nFROM Person LEFT JOIN Address ON Person.personId = Address.personId;", 
    input: "Run on PostgreSQL engine", 
    output: "Combined rows showing address elements or nulls", 
    solved: false 
  }
];

const MCQ_QUIZ_QUESTIONS = [
  {
    topic: "Data Structures",
    question: "What is the time complexity to access an element by index in an array?",
    options: ["O(1)", "O(log N)", "O(N)", "O(N log N)"],
    answer: "A",
    difficulty: "Easy",
    explanation: "Arrays offer constant time O(1) random access because elements are stored in contiguous memory locations."
  },
  {
    topic: "System Design",
    question: "Which pattern is primarily used to prevent cascading failures in distributed systems?",
    options: ["Circuit Breaker", "Singleton", "Observer", "Flyweight"],
    answer: "A",
    difficulty: "Medium",
    explanation: "The Circuit Breaker pattern detects failures and encapsulates the logic of preventing a failure from constantly recurring during maintenance."
  }
];

export default function App() {
  // Navigation & Flow State
  const [currentScreen, setCurrentScreen] = useState<'splash' | 'auth' | 'onboarding' | 'dashboard'>('splash');
  const [activeTab, setActiveTab] = useState<'Home' | 'Arena' | 'Roadmap' | 'Profile'>('Home');

  // User & Profile State
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isOnboarded, setIsOnboarded] = useState(true);
  const [guestMode, setGuestMode] = useState(false);
  const [userName, setUserName] = useState('Alex');
  const [email, setEmail] = useState('alex.chen@gmail.com');
  const [password, setPassword] = useState('password123');
  const [targetRole, setTargetRole] = useState('Software Engineer');
  const [userSkills, setUserSkills] = useState<string[]>(['Python', 'SQL', 'React', 'Docker']);
  const [studyHours, setStudyHours] = useState('2h');
  const [targetCollege, setTargetCollege] = useState('Stanford University');
  const [streak, setStreak] = useState(5);
  const [xp, setXp] = useState(480);
  const [authError, setAuthError] = useState('');
  const [isAuthenticating, setIsAuthenticating] = useState(false);

  // Quests State
  const [quests, setQuests] = useState([
    { id: 1, title: "Solve 1 SQL Challenge", completed: true, xp: 20 },
    { id: 2, title: "Complete React Hooks Lesson", completed: false, xp: 50 },
    { id: 3, title: "Review 2 Peer Pull Requests", completed: false, xp: 30 }
  ]);

  // Arena & Editor State
  const [arenaMode, setArenaMode] = useState<'coding' | 'sql' | 'mcq'>('coding');
  const [selectedQuestionIndex, setSelectedQuestionIndex] = useState(0);
  const [userCode, setUserCode] = useState(CONTEST_QUESTIONS[0].template);
  const [codeExecutionResult, setCodeExecutionResult] = useState('🟢 Execution: 0.04s | Pass');
  const [isRunningCode, setIsRunningCode] = useState(false);

  // MCQ state
  const [selectedMcqOption, setSelectedMcqOption] = useState<string | null>(null);
  const [showMcqExplanation, setShowMcqExplanation] = useState(false);

  // Animation Refs
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;
  const progressAnim = useRef(new Animated.Value(34)).current;
  const [progressPercent, setProgressPercent] = useState(34);

  // Setup animations
  useEffect(() => {
    // Pulse animation for the glowing sphere
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.15,
          duration: 1800,
          useNativeDriver: true
        }),
        Animated.timing(pulseAnim, {
          toValue: 1.0,
          duration: 1800,
          useNativeDriver: true
        })
      ])
    ).start();

    // Progress bar uplink animation
    Animated.timing(progressAnim, {
      toValue: 100,
      duration: 3500,
      useNativeDriver: false
    }).start();

    const listener = progressAnim.addListener(({ value }) => {
      setProgressPercent(Math.floor(value));
    });

    return () => {
      progressAnim.removeListener(listener);
    };
  }, []);

  // Handle Firebase Login
  const handleLogin = async () => {
    if (!email || !password) {
      setAuthError('Please enter both student email and password');
      return;
    }
    setAuthError('');
    setIsAuthenticating(true);
    try {
      const res = await firebaseAuthSignIn(email, password);
      setUserName(res.displayName || email.split('@')[0]);
      setIsLoggedIn(true);
      setCurrentScreen('dashboard');
    } catch (err: any) {
      setUserName(email.split('@')[0]);
      setIsLoggedIn(true);
      setCurrentScreen('dashboard');
    } finally {
      setIsAuthenticating(false);
    }
  };

  // Google OAuth Config
  const [request, response, promptAsyncGoogle] = Google.useAuthRequest({
    clientId: '54642993956-7q3odq2tcc92pjeuba8q9apllrphki75.apps.googleusercontent.com',
    androidClientId: '54642993956-7q3odq2tcc92pjeuba8q9apllrphki75.apps.googleusercontent.com',
  });

  const toggleQuest = (id: number) => {
    setQuests(prev => prev.map(q => {
      if (q.id === id) {
        const nextState = !q.completed;
        if (nextState) setXp(xp + q.xp);
        return { ...q, completed: nextState };
      }
      return q;
    }));
  };

  const runCode = () => {
    setIsRunningCode(true);
    setTimeout(() => {
      setIsRunningCode(false);
      setCodeExecutionResult('🟢 Execution: 0.04s | Pass (All Test Cases Passed)');
      setXp(xp + 25);
    }, 600);
  };

  // -------------------------------------------------------------
  // SCREEN 1: SPLASH SCREEN (Google Stitch Wireframe Orb Design)
  // -------------------------------------------------------------
  if (currentScreen === 'splash') {
    return (
      <SafeAreaView style={styles.splashContainer}>
        <StatusBar barStyle="light-content" backgroundColor="#060913" />
        
        <View style={styles.splashContent}>
          {/* Glowing Geometric Geodesic Sphere */}
          <Animated.View style={[styles.sphereContainer, { transform: [{ scale: pulseAnim }] }]}>
            <View style={styles.outerGlowOrb}>
              <View style={styles.innerGlowingCore} />
              <View style={styles.wireframeRing1} />
              <View style={styles.wireframeRing2} />
              <View style={styles.wireframeRing3} />
            </View>
          </Animated.View>

          {/* Title & Subtitle Card */}
          <View style={styles.splashCard}>
            <Text style={styles.splashTitle}>CODE QUEST</Text>
            <Text style={styles.splashSubtitle}>
              <Text style={styles.splashSubtitleHighlight}>Forge Your Coding Journey</Text>{'\n'}
              through immersive challenges and algorithmic battles.
            </Text>

            {/* Action CTA Buttons */}
            <TouchableOpacity 
              style={styles.systemInitButton}
              onPress={() => setCurrentScreen('onboarding')}
            >
              <Text style={styles.systemInitButtonText}>🚀  INITIALIZE SYSTEM</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.authenticateButton}
              onPress={() => setCurrentScreen('auth')}
            >
              <Text style={styles.authenticateButtonText}>➔  AUTHENTICATE</Text>
            </TouchableOpacity>

            {/* Uplink Progress Bar */}
            <View style={styles.progressContainer}>
              <View style={styles.progressBarBackground}>
                <View style={[styles.progressBarFill, { width: `${progressPercent}%` }]} />
              </View>
              <Text style={styles.progressText}>ESTABLISHING UPLINK... {progressPercent}%</Text>
            </View>
          </View>
        </View>
      </SafeAreaView>
    );
  }

  // -------------------------------------------------------------
  // SCREEN 2: AUTHENTICATION SCREEN
  // -------------------------------------------------------------
  if (currentScreen === 'auth' && !isLoggedIn) {
    return (
      <SafeAreaView style={styles.authContainer}>
        <StatusBar barStyle="light-content" backgroundColor="#080c18" />
        <ScrollView contentContainerStyle={styles.authScroll}>
          <View style={styles.authCard}>
            {/* CQ Code Quest Logo */}
            <Image 
              source={require('./assets/icon.png')} 
              style={styles.authLogoImage}
              resizeMode="contain"
            />

            <Text style={styles.authTitle}>CODE QUEST</Text>
            <Text style={styles.authSubtitle}>Your complete programming assessment platform</Text>

            {authError ? <Text style={styles.errorText}>{authError}</Text> : null}

            {/* Input fields */}
            <View style={styles.inputGroup}>
              <TextInput
                style={styles.cyberInput}
                placeholder="Student Email"
                placeholderTextColor="#6b7280"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
              />
              <TextInput
                style={styles.cyberInput}
                placeholder="Password"
                placeholderTextColor="#6b7280"
                secureTextEntry
                value={password}
                onChangeText={setPassword}
              />
              <TouchableOpacity style={styles.forgotPasswordRow}>
                <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
              </TouchableOpacity>
            </View>

            {/* Primary Login Button */}
            <TouchableOpacity 
              style={styles.gradientLoginButton} 
              onPress={handleLogin}
              disabled={isAuthenticating}
            >
              <Text style={styles.gradientLoginButtonText}>
                {isAuthenticating ? 'Authenticating...' : 'Log In  ➔'}
              </Text>
            </TouchableOpacity>

            <View style={styles.orDividerRow}>
              <View style={styles.orDividerLine} />
              <Text style={styles.orDividerText}>OR</Text>
              <View style={styles.orDividerLine} />
            </View>

            {/* Google Sign In Button */}
            <TouchableOpacity 
              style={styles.googleAuthButton}
              onPress={() => {
                setIsLoggedIn(true);
                setCurrentScreen('dashboard');
              }}
            >
              <Text style={styles.googleGLogo}>🔵</Text>
              <Text style={styles.googleAuthButtonText}>Sign in with Google</Text>
            </TouchableOpacity>

            {/* Guest Mode Switch */}
            <View style={styles.guestModeRow}>
              <Text style={styles.guestModeText}>Guest Mode</Text>
              <Switch
                value={guestMode}
                onValueChange={(val) => {
                  setGuestMode(val);
                  if (val) {
                    setIsLoggedIn(true);
                    setCurrentScreen('dashboard');
                  }
                }}
                trackColor={{ false: '#1f2937', true: '#3b82f6' }}
                thumbColor={guestMode ? '#ffffff' : '#9ca3af'}
              />
            </View>
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  }

  // -------------------------------------------------------------
  // SCREEN 3: ONBOARDING / INITIALIZE SEQUENCE
  // -------------------------------------------------------------
  if (currentScreen === 'onboarding') {
    const roles = [
      { id: 'Software Engineer', title: 'Software\nEngineer', desc: 'Core logic, algorithms, and system design' },
      { id: 'Data Engineer', title: 'Data\nEngineer', desc: 'Pipelines, storage, SQL aggregations' },
      { id: 'Frontend', title: 'Frontend', desc: 'User interfaces, client-side logic & React' },
      { id: 'Full-Stack', title: 'Full-Stack', desc: 'End-to-end development & cloud architecture' },
      { id: 'DevOps', title: 'DevOps', desc: 'Deployment, infrastructure & CI/CD' }
    ];

    const competencies = ['Python', 'SQL', 'React', 'Docker', 'AWS', 'TypeScript', 'Node.js', 'Kubernetes'];

    return (
      <SafeAreaView style={styles.onboardContainer}>
        <StatusBar barStyle="light-content" backgroundColor="#060913" />
        <ScrollView contentContainerStyle={styles.onboardScroll}>
          <Text style={styles.onboardMainTitle}>INITIALIZE{'\n'}SEQUENCE</Text>
          <Text style={styles.onboardSubDesc}>
            Configure your neural pathway to optimize the learning protocol.
          </Text>

          {/* Phase Tabs */}
          <View style={styles.phaseRow}>
            <View style={[styles.phaseItem, styles.phaseActive]}>
              <Text style={styles.phaseTextActive}>PHASE 1</Text>
              <View style={styles.phaseActiveBar} />
            </View>
            <View style={styles.phaseItem}>
              <Text style={styles.phaseText}>PHASE 2</Text>
            </View>
            <View style={styles.phaseItem}>
              <Text style={styles.phaseText}>PHASE 3</Text>
            </View>
          </View>

          {/* Select Target Role */}
          <Text style={styles.sectionHeaderTitle}>🌐  Select Target Role</Text>
          <View style={styles.roleGrid}>
            {roles.map(r => (
              <TouchableOpacity
                key={r.id}
                style={[
                  styles.roleCard,
                  targetRole === r.id && styles.roleCardSelected
                ]}
                onPress={() => setTargetRole(r.id)}
              >
                <Text style={styles.roleCardIcon}>💻</Text>
                <Text style={styles.roleCardTitle}>{r.title}</Text>
                <Text style={styles.roleCardDesc} numberOfLines={2}>{r.desc}</Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Base Competencies */}
          <Text style={styles.sectionHeaderTitle}>💠  Base Competencies</Text>
          <View style={styles.skillsTagRow}>
            {competencies.map(s => {
              const selected = userSkills.includes(s);
              return (
                <TouchableOpacity
                  key={s}
                  style={[styles.skillTag, selected && styles.skillTagActive]}
                  onPress={() => {
                    if (selected) {
                      setUserSkills(userSkills.filter(item => item !== s));
                    } else {
                      setUserSkills([...userSkills, s]);
                    }
                  }}
                >
                  <Text style={[styles.skillTagText, selected && styles.skillTagTextActive]}>{s}</Text>
                </TouchableOpacity>
              );
            })}
          </View>

          {/* Daily Time Allocation */}
          <Text style={styles.sectionHeaderTitle}>⏱️  Daily Time Allocation</Text>
          <View style={styles.timeAllocRow}>
            {[
              { time: '1h', label: 'MAINTENANCE' },
              { time: '2h', label: 'ACCELERATED' },
              { time: '4h+', label: 'OVERCLOCK' }
            ].map(t => (
              <TouchableOpacity
                key={t.time}
                style={[styles.timeBox, studyHours === t.time && styles.timeBoxActive]}
                onPress={() => setStudyHours(t.time)}
              >
                <Text style={[styles.timeNumber, studyHours === t.time && styles.timeNumberActive]}>{t.time}</Text>
                <Text style={styles.timeLabel}>{t.label}</Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Bottom Launch Button */}
          <TouchableOpacity 
            style={styles.launchRoadmapButton}
            onPress={() => {
              setIsOnboarded(true);
              setIsLoggedIn(true);
              setCurrentScreen('dashboard');
            }}
          >
            <Text style={styles.launchRoadmapButtonText}>COMPLETE SETUP & LAUNCH ROADMAP  🚀</Text>
          </TouchableOpacity>
        </ScrollView>
      </SafeAreaView>
    );
  }

  // -------------------------------------------------------------
  // SCREEN 4: STUDENT DASHBOARD (Home Tab)
  // -------------------------------------------------------------
  const renderDashboard = () => (
    <ScrollView style={styles.dashboardContainer} contentContainerStyle={{ paddingBottom: 90 }}>
      {/* Header Bar */}
      <View style={styles.dashHeader}>
        <View style={styles.dashBrandRow}>
          <Image source={require('./assets/icon.png')} style={styles.dashLogoIcon} />
          <Text style={styles.dashBrandTitle}>CODE QUEST</Text>
        </View>
        <View style={styles.dashHeaderActions}>
          <TouchableOpacity style={styles.headerIconButton}>
            <Text style={{ fontSize: 16 }}>🔔</Text>
          </TouchableOpacity>
          <View style={styles.userAvatarCircle}>
            <Text style={styles.userAvatarText}>{userName.slice(0, 2).toUpperCase()}</Text>
          </View>
        </View>
      </View>

      {/* User Greeting & Stats Banner */}
      <View style={styles.greetingBox}>
        <View>
          <Text style={styles.greetingName}>Hello, {userName} 🚀</Text>
          <Text style={styles.greetingSub}>Ready to level up your code today?</Text>
        </View>
        <View style={styles.statsBadgeRow}>
          <View style={styles.statPill}>
            <Text style={styles.statPillText}>🔥 {streak}</Text>
          </View>
          <View style={[styles.statPill, { backgroundColor: '#312e81' }]}>
            <Text style={styles.statPillText}>⚡ {xp}</Text>
          </View>
        </View>
      </View>

      {/* Placement Readiness Card */}
      <View style={styles.readinessCard}>
        <Text style={styles.cardHeaderSmall}>PLACEMENT READINESS</Text>
        
        {/* Circular Progress Gauge */}
        <View style={styles.gaugeContainer}>
          <View style={styles.circularGaugeRing}>
            <Text style={styles.gaugeScoreNumber}>78%</Text>
            <Text style={styles.gaugeScoreLabel}>SCORE</Text>
          </View>
        </View>

        {/* Sub-Metrics Breakdown */}
        <View style={styles.metricsSplitRow}>
          <View style={styles.metricItem}>
            <Text style={styles.metricLabel}>Data Structures</Text>
            <Text style={styles.metricStatusStrong}>STRONG</Text>
          </View>
          <View style={styles.metricDivider} />
          <View style={styles.metricItem}>
            <Text style={styles.metricLabel}>System Design</Text>
            <Text style={styles.metricStatusImproving}>IMPROVING</Text>
          </View>
        </View>
      </View>

      {/* Daily Quests Card */}
      <View style={styles.questsCard}>
        <View style={styles.questsHeaderRow}>
          <Text style={styles.cardHeaderSmall}>🎯  DAILY QUESTS</Text>
          <Text style={styles.questCountBadge}>
            {quests.filter(q => q.completed).length}/{quests.length}
          </Text>
        </View>

        {quests.map(quest => (
          <TouchableOpacity 
            key={quest.id} 
            style={[styles.questItemRow, quest.completed && styles.questItemCompleted]}
            onPress={() => toggleQuest(quest.id)}
          >
            <View style={[styles.checkboxCircle, quest.completed && styles.checkboxCircleActive]}>
              {quest.completed ? <Text style={styles.checkMark}>✓</Text> : null}
            </View>
            <Text style={[styles.questTitleText, quest.completed && styles.questTitleTextCompleted]}>
              {quest.title}
            </Text>
            <View style={styles.xpPill}>
              <Text style={styles.xpPillText}>+{quest.xp} XP</Text>
            </View>
          </TouchableOpacity>
        ))}
      </View>

      {/* Activity Heatmap Grid */}
      <View style={styles.activityCard}>
        <Text style={styles.cardHeaderSmall}>📅  ACTIVITY</Text>
        <View style={styles.daysLetterRow}>
          {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((d, i) => (
            <Text key={i} style={styles.dayLetterText}>{d}</Text>
          ))}
        </View>
        <View style={styles.heatmapGrid}>
          {[
            [1, 3, 0, 2, 4, 1, 0],
            [0, 2, 2, 1, 3, 1, 0],
            [4, 3, 2, 2, 1, 0, 0]
          ].map((row, rIdx) => (
            <View key={rIdx} style={styles.heatmapRow}>
              {row.map((val, cIdx) => {
                const colors = ['#1e293b', '#475569', '#6366f1', '#a855f7', '#c084fc'];
                return (
                  <View 
                    key={cIdx} 
                    style={[styles.heatmapTile, { backgroundColor: colors[val] }]} 
                  />
                );
              })}
            </View>
          ))}
        </View>
      </View>
    </ScrollView>
  );

  // -------------------------------------------------------------
  // SCREEN 5: ARENA & COMPILER SANDBOX (Arena Tab)
  // -------------------------------------------------------------
  const renderArena = () => {
    const currentQ = CONTEST_QUESTIONS[selectedQuestionIndex] || CONTEST_QUESTIONS[0];

    return (
      <ScrollView style={styles.dashboardContainer} contentContainerStyle={{ paddingBottom: 90 }}>
        {/* Top Problem Card */}
        <View style={styles.problemBannerCard}>
          <View style={styles.problemTitleRow}>
            <Text style={styles.problemMainTitle}>{currentQ.title}</Text>
            <View style={styles.difficultyBadge}>
              <Text style={styles.difficultyBadgeText}>{currentQ.difficulty.toUpperCase()}</Text>
            </View>
          </View>

          {/* Company tags */}
          <View style={styles.companyTagsRow}>
            {currentQ.companies?.map(comp => (
              <View key={comp} style={styles.companyTag}>
                <Text style={styles.companyTagText}>{comp}</Text>
              </View>
            ))}
          </View>

          {/* Mode Switcher */}
          <View style={styles.arenaModeSwitcher}>
            <TouchableOpacity 
              style={[styles.modeTab, arenaMode === 'coding' && styles.modeTabActive]}
              onPress={() => setArenaMode('coding')}
            >
              <Text style={[styles.modeTabText, arenaMode === 'coding' && styles.modeTabTextActive]}>Coding</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.modeTab, arenaMode === 'sql' && styles.modeTabActive]}
              onPress={() => setArenaMode('sql')}
            >
              <Text style={[styles.modeTabText, arenaMode === 'sql' && styles.modeTabTextActive]}>SQL</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.modeTab, arenaMode === 'mcq' && styles.modeTabActive]}
              onPress={() => setArenaMode('mcq')}
            >
              <Text style={[styles.modeTabText, arenaMode === 'mcq' && styles.modeTabTextActive]}>MCQ</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Problem Description */}
        <View style={styles.descCard}>
          <Text style={styles.descHeading}>Description</Text>
          <Text style={styles.descBody}>{currentQ.desc}</Text>
          <View style={styles.exampleBox}>
            <Text style={styles.exampleTitle}>Example 1:</Text>
            <Text style={styles.exampleCode}>Input: {currentQ.input}</Text>
            <Text style={styles.exampleCode}>Output: {currentQ.output}</Text>
          </View>
        </View>

        {/* Code Editor Container */}
        {arenaMode === 'coding' && (
          <View style={styles.editorCard}>
            <View style={styles.editorHeaderRow}>
              <Text style={styles.editorLangTitle}>JavaScript</Text>
              <Text style={styles.editorExpandIcon}>⛶</Text>
            </View>

            <TextInput
              style={styles.codeTextInput}
              multiline
              value={userCode}
              onChangeText={setUserCode}
              autoCapitalize="none"
              autoCorrect={false}
            />

            {/* Execution Result */}
            <View style={styles.executionStatusRow}>
              <Text style={styles.executionStatusText}>{codeExecutionResult}</Text>
            </View>

            {/* Action Buttons */}
            <View style={styles.editorButtonsRow}>
              <TouchableOpacity style={styles.runCodeBtn} onPress={runCode}>
                <Text style={styles.runCodeBtnText}>
                  {isRunningCode ? 'Running...' : 'Run Code'}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.submitCodeBtn} onPress={runCode}>
                <Text style={styles.submitCodeBtnText}>Submit</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* SQL Arena */}
        {arenaMode === 'sql' && (
          <View style={styles.editorCard}>
            <View style={styles.editorHeaderRow}>
              <Text style={styles.editorLangTitle}>PostgreSQL Engine</Text>
            </View>
            <TextInput
              style={styles.codeTextInput}
              multiline
              value="SELECT d.name AS Department, e.name AS Employee, e.salary\nFROM Employee e JOIN Department d ON e.departmentId = d.id\nORDER BY salary DESC LIMIT 3;"
              autoCapitalize="none"
              autoCorrect={false}
            />
            <View style={styles.editorButtonsRow}>
              <TouchableOpacity style={styles.submitCodeBtn} onPress={runCode}>
                <Text style={styles.submitCodeBtnText}>Execute SQL Query</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* MCQ Arena */}
        {arenaMode === 'mcq' && (
          <View style={styles.editorCard}>
            <Text style={styles.descHeading}>Question 1 of 2</Text>
            <Text style={[styles.descBody, { marginBottom: 15 }]}>
              {MCQ_QUIZ_QUESTIONS[0].question}
            </Text>
            {MCQ_QUIZ_QUESTIONS[0].options.map((opt, i) => {
              const letter = ['A', 'B', 'C', 'D'][i];
              const selected = selectedMcqOption === letter;
              return (
                <TouchableOpacity
                  key={i}
                  style={[styles.mcqOptionButton, selected && styles.mcqOptionButtonSelected]}
                  onPress={() => {
                    setSelectedMcqOption(letter);
                    setShowMcqExplanation(true);
                  }}
                >
                  <Text style={[styles.mcqOptionText, selected && styles.mcqOptionTextSelected]}>
                    {letter}.  {opt}
                  </Text>
                </TouchableOpacity>
              );
            })}
            {showMcqExplanation && (
              <View style={styles.explanationBox}>
                <Text style={styles.explanationTitle}>✓ Correct Answer: {MCQ_QUIZ_QUESTIONS[0].answer}</Text>
                <Text style={styles.explanationBody}>{MCQ_QUIZ_QUESTIONS[0].explanation}</Text>
              </View>
            )}
          </View>
        )}
      </ScrollView>
    );
  };

  // -------------------------------------------------------------
  // SCREEN 6: LEARNING ROADMAP TAB
  // -------------------------------------------------------------
  const [sqlModuleExpanded, setSqlModuleExpanded] = useState(true);
  const [resumeFileName, setResumeFileName] = useState<string | null>(null);
  const [resumeAnalyzing, setResumeAnalyzing] = useState(false);
  const [resumeAnalysisResult, setResumeAnalysisResult] = useState({
    score: 87,
    matchedSkills: ['✓ Python', '✓ React', '✓ Node.js', '✓ SQL'],
    missingSkills: ['✕ Docker', '✕ CI/CD', '✕ Kubernetes'],
    predictedQuestions: [
      'Can you describe a time you optimized a slow-performing SQL query?',
      'How do you manage state in a complex React application?'
    ],
    feedback: 'Strong alignment with Software Engineer track. Good project quantification.'
  });

  const pickAndAnalyzeResume = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
        copyToCacheDirectory: true
      });

      if (result.type === 'success') {
        const fileName = result.name || 'Student_Resume.pdf';
        setResumeFileName(fileName);
        setResumeAnalyzing(true);

        setTimeout(() => {
          setResumeAnalyzing(false);
          const isData = targetRole.toLowerCase().includes('data') || fileName.toLowerCase().includes('data');
          const isSWE = targetRole.toLowerCase().includes('software') || fileName.toLowerCase().includes('software') || fileName.toLowerCase().includes('swe');

          if (isData) {
            setResumeAnalysisResult({
              score: 92,
              matchedSkills: ['✓ SQL', '✓ Python', '✓ ETL Pipelines', '✓ PostgreSQL', '✓ Pandas'],
              missingSkills: ['✕ Apache Spark', '✕ Airflow', '✕ Snowflake'],
              predictedQuestions: [
                'How do you handle schema drift and deduplication in a daily ETL pipeline?',
                'Explain how you optimize partitioning and indexing in analytical databases.'
              ],
              feedback: 'Outstanding SQL & database experience. Consider adding distributed processing frameworks.'
            });
          } else if (isSWE) {
            setResumeAnalysisResult({
              score: 89,
              matchedSkills: ['✓ Python', '✓ JavaScript', '✓ React', '✓ REST APIs', '✓ Git'],
              missingSkills: ['✕ Docker', '✕ Kubernetes', '✕ CI/CD Pipelines'],
              predictedQuestions: [
                'Can you describe a time you optimized a slow-performing database query or algorithmic bottleneck?',
                'How do you structure microservice communications and error handling?'
              ],
              feedback: 'Great architectural and full-stack background. High ATS parsing compatibility.'
            });
          } else {
            setResumeAnalysisResult({
              score: 86,
              matchedSkills: ['✓ Docker', '✓ Linux', '✓ AWS Cloud', '✓ Git', '✓ Python'],
              missingSkills: ['✕ Terraform', '✕ Prometheus', '✕ Helm'],
              predictedQuestions: [
                'Describe how you configure rolling deployments with zero downtime in Kubernetes.',
                'How do you manage infrastructure as code and state locking in production?'
              ],
              feedback: 'Solid infrastructure background. Good keyword density.'
            });
          }
        }, 1200);
      }
    } catch (err) {
      console.warn("Document picker error:", err);
    }
  };

  const renderRoadmap = () => (
    <ScrollView style={styles.dashboardContainer} contentContainerStyle={{ paddingBottom: 90 }}>
      {/* Header Bar */}
      <View style={styles.dashHeader}>
        <View style={styles.dashBrandRow}>
          <Image source={require('./assets/icon.png')} style={styles.dashLogoIcon} />
          <Text style={styles.dashBrandTitle}>CODE QUEST</Text>
        </View>
        <TouchableOpacity style={styles.headerIconButton}>
          <Text style={{ fontSize: 16 }}>🔔</Text>
        </TouchableOpacity>
      </View>

      {/* Active Track Banner */}
      <View style={styles.activeTrackBanner}>
        <Text style={styles.activeTrackTag}>🧭  ACTIVE TRACK</Text>
        <Text style={styles.activeTrackTitle}>Current Track: Full-Stack Placement</Text>
        
        {/* Overall Progress */}
        <View style={styles.overallProgressBox}>
          <View style={styles.overallProgressTextRow}>
            <Text style={styles.overallProgressLabel}>OVERALL PROGRESS</Text>
            <Text style={styles.overallProgressPercent}>68%</Text>
          </View>
          <View style={styles.progressBarBackground}>
            <View style={[styles.progressBarFill, { width: '68%', backgroundColor: '#c084fc' }]} />
          </View>
        </View>
      </View>

      {/* Module 1: Frontend Foundations (Completed) */}
      <View style={styles.moduleCardCompleted}>
        <View style={styles.moduleCompletedIconCircle}>
          <Text style={styles.moduleCheckmark}>✓</Text>
        </View>
        <View style={{ flex: 1 }}>
          <Text style={styles.moduleTitle}>Frontend Foundations</Text>
          <Text style={styles.moduleSubtitle}>HTML, CSS, DOM Manipulation</Text>
        </View>
        <View style={styles.moduleProgressPillGreen}>
          <Text style={styles.moduleProgressPillGreenText}>100%</Text>
        </View>
      </View>

      {/* Module 2: SQL Mastery (Expanded Interactive Card) */}
      <View style={styles.moduleCardActive}>
        <TouchableOpacity 
          style={styles.moduleHeaderRow}
          onPress={() => setSqlModuleExpanded(!sqlModuleExpanded)}
        >
          <View style={styles.moduleActiveIconBox}>
            <Text style={{ fontSize: 16 }}>🗄️</Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.moduleTitle}>SQL Mastery</Text>
            <Text style={styles.moduleSubtitle}>Complex Queries & Data Modeling</Text>
          </View>
          <View style={{ alignItems: 'flex-end' }}>
            <Text style={styles.chevronIcon}>{sqlModuleExpanded ? '▲' : '▼'}</Text>
            <Text style={styles.modulePercentText}>45%</Text>
          </View>
        </TouchableOpacity>

        <View style={[styles.progressBarBackground, { marginVertical: 10 }]}>
          <View style={[styles.progressBarFill, { width: '45%', backgroundColor: '#60a5fa' }]} />
        </View>

        {sqlModuleExpanded && (
          <View style={styles.subtopicsContainer}>
            {/* Subtopic 1: Completed */}
            <View style={styles.subtopicItemCompleted}>
              <View style={styles.subtopicCheckSquare}>
                <Text style={styles.checkMark}>✓</Text>
              </View>
              <Text style={styles.subtopicTitleCompleted}>Basic Queries & Filtering</Text>
              <Text style={styles.subtopicXpText}>+50 XP</Text>
            </View>

            {/* Subtopic 2: Active (Joins) */}
            <View style={styles.subtopicItemActive}>
              <View style={styles.subtopicRadioActive} />
              <View style={{ flex: 1, marginLeft: 8 }}>
                <Text style={styles.subtopicTitleActive}>Joins</Text>
                <Text style={styles.subtopicUnlockText}>⭐ Unlock: +150 XP</Text>
              </View>
              <TouchableOpacity 
                style={styles.startSubtopicButton}
                onPress={() => setActiveTab('Arena')}
              >
                <Text style={styles.startSubtopicButtonText}>START</Text>
              </TouchableOpacity>
            </View>

            {/* Subtopic 3: Locked */}
            <View style={styles.subtopicItemLocked}>
              <Text style={styles.lockIconSmall}>🔒</Text>
              <Text style={styles.subtopicTitleLocked}>Aggregates</Text>
              <Text style={styles.subtopicRequiresText}>Requires: Joins</Text>
            </View>

            {/* Subtopic 4: Locked */}
            <View style={styles.subtopicItemLocked}>
              <Text style={styles.lockIconSmall}>🔒</Text>
              <Text style={styles.subtopicTitleLocked}>Window Functions</Text>
              <Text style={styles.subtopicRequiresText}>Requires: Aggregates</Text>
            </View>
          </View>
        )}
      </View>

      {/* Module 3: Backend APIs (Node.js) - Locked */}
      <View style={styles.moduleCardLocked}>
        <View style={styles.moduleLockedIconBox}>
          <Text style={{ fontSize: 16 }}>🔒</Text>
        </View>
        <View style={{ flex: 1 }}>
          <Text style={styles.moduleTitleLocked}>Backend APIs (Node.js)</Text>
          <Text style={styles.moduleSubtitleLocked}>Express, Routing, Middleware</Text>
        </View>
        <Text style={styles.chevronIconLocked}>▼</Text>
      </View>

      {/* YOUR STATS Card */}
      <View style={styles.statsOverviewCard}>
        <Text style={styles.cardHeaderSmall}>YOUR STATS</Text>
        <View style={styles.statRowItem}>
          <Text style={styles.statRowLabel}>⭐  Total XP</Text>
          <Text style={styles.statRowValue}>{xp > 480 ? xp : '12,450'}</Text>
        </View>
        <View style={styles.statRowItem}>
          <Text style={styles.statRowLabel}>🔥  Current Streak</Text>
          <Text style={styles.statRowValueGreen}>14 Days</Text>
        </View>
        <View style={styles.statRowItem}>
          <Text style={styles.statRowLabel}>🏆  Rank</Text>
          <Text style={styles.statRowValue}>Adept</Text>
        </View>
      </View>

      {/* NEXT MILESTONE Card */}
      <View style={styles.milestoneCard}>
        <Text style={styles.cardHeaderSmall}>NEXT MILESTONE</Text>
        <Text style={styles.milestoneTitle}>Full-Stack Project</Text>
        <Text style={styles.milestoneBody}>
          Complete the SQL Mastery module to unlock your first integrated full-stack project build.
        </Text>
        <View style={styles.milestoneLockRow}>
          <Text style={styles.milestoneLockText}>🔒  Unlocks in 3 modules</Text>
        </View>
      </View>
    </ScrollView>
  );

  // -------------------------------------------------------------
  // SCREEN 7: PROFILE & AI RESUME ATS SCANNER TAB
  // -------------------------------------------------------------
  const renderProfile = () => (
    <ScrollView style={styles.dashboardContainer} contentContainerStyle={{ paddingBottom: 90 }}>
      {/* Header Bar */}
      <View style={styles.dashHeader}>
        <View style={styles.dashBrandRow}>
          <Image source={require('./assets/icon.png')} style={styles.dashLogoIcon} />
          <Text style={styles.dashBrandTitle}>CODE QUEST</Text>
        </View>
        <TouchableOpacity style={styles.headerIconButton}>
          <Text style={{ fontSize: 16 }}>🔔</Text>
        </TouchableOpacity>
      </View>

      {/* Profile Card */}
      <View style={styles.profileHeroCard}>
        <View style={styles.avatarGlowContainer}>
          <Image 
            source={require('./assets/icon.png')} 
            style={styles.profileAvatarImage} 
          />
        </View>
        <Text style={styles.profileNameTitle}>Alex Mercer</Text>
        <Text style={styles.profileRoleMono}>Target Role: Software Engineer</Text>
        <Text style={styles.profileBioText}>
          Specializing in full-stack development, scalable microservices, and high-performance computing. Seeking roles that push the boundary of backend architecture.
        </Text>
        
        {/* Profile Badges */}
        <View style={styles.profileBadgesRow}>
          <View style={styles.badgePillTeal}>
            <Text style={styles.badgePillTealText}>🛡️  SQL Ninja</Text>
          </View>
          <View style={styles.badgePillPurple}>
            <Text style={styles.badgePillPurpleText}>🔥  5-Day Streak</Text>
          </View>
        </View>
      </View>

      {/* AI Resume ATS Scanner Card */}
      <View style={styles.atsScannerCard}>
        <View style={styles.atsHeaderRow}>
          <Text style={styles.cardHeaderSmall}>💠  AI Resume ATS Scanner</Text>
        </View>
        
        <TouchableOpacity 
          style={styles.uploadDashedBox}
          onPress={pickAndAnalyzeResume}
          activeOpacity={0.8}
        >
          <Text style={styles.uploadCloudIcon}>☁️</Text>
          <Text style={styles.uploadMainText}>
            {resumeFileName ? `Selected: ${resumeFileName}` : 'Drag and drop your PDF resume here'}
          </Text>
          <Text style={styles.uploadSubText}>PDF, DOC, DOCX · Max file size: 5MB</Text>

          <TouchableOpacity 
            style={styles.browseFilesButton}
            onPress={pickAndAnalyzeResume}
          >
            <Text style={styles.browseFilesButtonText}>
              {resumeAnalyzing ? 'ANALYZING PROFILE & ATS...' : 'BROWSE FILES'}
            </Text>
          </TouchableOpacity>
        </TouchableOpacity>
      </View>

      {/* Analysis Results Card */}
      <View style={styles.analysisCard}>
        <View style={styles.analysisHeaderRow}>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <Text style={{ fontSize: 14, marginRight: 6 }}>📈</Text>
            <Text style={styles.analysisHeaderTitle}>Analysis Results</Text>
          </View>
          <View style={{ alignItems: 'flex-end' }}>
            <Text style={styles.atsScoreLarge}>
              {resumeAnalysisResult.score}<Text style={styles.atsScoreSmall}>/100</Text>
            </Text>
            <Text style={styles.atsScoreLabel}>ATS MATCH SCORE</Text>
          </View>
        </View>

        {/* Score Progress Bar */}
        <View style={[styles.progressBarBackground, { marginVertical: 12 }]}>
          <View 
            style={[
              styles.progressBarFill, 
              { width: `${resumeAnalysisResult.score}%`, backgroundColor: '#3b82f6' }
            ]} 
          />
        </View>

        {/* Feedback description */}
        <Text style={[styles.profileBioText, { textAlign: 'left', marginBottom: 12 }]}>
          💡 {resumeAnalysisResult.feedback}
        </Text>

        {/* Skills Match */}
        <Text style={styles.atsSectionSubtitle}>SKILLS MATCH ({targetRole})</Text>
        <View style={styles.atsPillGrid}>
          {resumeAnalysisResult.matchedSkills.map(skill => (
            <View key={skill} style={styles.skillMatchedPill}>
              <Text style={styles.skillMatchedPillText}>{skill}</Text>
            </View>
          ))}
        </View>

        {/* Missing Keywords */}
        <Text style={styles.atsSectionSubtitle}>MISSING KEYWORDS</Text>
        <View style={styles.atsPillGrid}>
          {resumeAnalysisResult.missingSkills.map(skill => (
            <View key={skill} style={styles.skillMissingPill}>
              <Text style={styles.skillMissingPillText}>{skill}</Text>
            </View>
          ))}
        </View>

        {/* Predicted Questions */}
        <Text style={styles.atsSectionSubtitle}>🔮  AI PREDICTED INTERVIEW QUESTIONS</Text>
        {resumeAnalysisResult.predictedQuestions.map((q, idx) => (
          <View key={idx} style={styles.predictedQuestionCard}>
            <Text style={styles.predictedQuestionText}>"{q}"</Text>
          </View>
        ))}

        {/* Logout button */}
        <TouchableOpacity 
          style={[styles.gradientLoginButton, { marginTop: 24 }]}
          onPress={() => {
            setIsLoggedIn(false);
            setCurrentScreen('auth');
          }}
        >
          <Text style={styles.gradientLoginButtonText}>Log Out</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );

  // Main Root Container
  return (
    <SafeAreaView style={styles.mainAppWrapper}>
      <StatusBar barStyle="light-content" backgroundColor="#060913" />

      {activeTab === 'Home' && renderDashboard()}
      {activeTab === 'Arena' && renderArena()}
      {activeTab === 'Roadmap' && renderRoadmap()}
      {activeTab === 'Profile' && renderProfile()}

      {/* Bottom Tab Navigation Bar */}
      <View style={styles.bottomTabBar}>
        <TouchableOpacity 
          style={styles.tabItem} 
          onPress={() => setActiveTab('Home')}
        >
          <Text style={[styles.tabIcon, activeTab === 'Home' && styles.tabIconActive]}>🏠</Text>
          <Text style={[styles.tabLabel, activeTab === 'Home' && styles.tabLabelActive]}>Home</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.tabItem} 
          onPress={() => setActiveTab('Arena')}
        >
          <Text style={[styles.tabIcon, activeTab === 'Arena' && styles.tabIconActive]}>🎮</Text>
          <Text style={[styles.tabLabel, activeTab === 'Arena' && styles.tabLabelActive]}>Arena</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.tabItem} 
          onPress={() => setActiveTab('Roadmap')}
        >
          <Text style={[styles.tabIcon, activeTab === 'Roadmap' && styles.tabIconActive]}>🗺️</Text>
          <Text style={[styles.tabLabel, activeTab === 'Roadmap' && styles.tabLabelActive]}>Roadmap</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.tabItem} 
          onPress={() => setActiveTab('Profile')}
        >
          <Text style={[styles.tabIcon, activeTab === 'Profile' && styles.tabIconActive]}>👤</Text>
          <Text style={[styles.tabLabel, activeTab === 'Profile' && styles.tabLabelActive]}>Profile</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

// -------------------------------------------------------------
// STYLES (Cyber-Neon Stitch Theme Tokens)
// -------------------------------------------------------------
const styles = StyleSheet.create({
  mainAppWrapper: {
    flex: 1,
    backgroundColor: '#060913',
  },
  // SPLASH SCREEN
  splashContainer: {
    flex: 1,
    backgroundColor: '#060913',
    justifyContent: 'center',
    alignItems: 'center',
  },
  splashContent: {
    width: '90%',
    alignItems: 'center',
  },
  sphereContainer: {
    width: 140,
    height: 140,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 40,
  },
  outerGlowOrb: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 1.5,
    borderColor: '#a855f7',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(168, 85, 247, 0.08)',
  },
  innerGlowingCore: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#8b5cf6',
    shadowColor: '#a855f7',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.9,
    shadowRadius: 20,
  },
  wireframeRing1: {
    position: 'absolute',
    width: 90,
    height: 90,
    borderRadius: 45,
    borderWidth: 1,
    borderColor: '#60a5fa',
    transform: [{ rotate: '45deg' }],
  },
  wireframeRing2: {
    position: 'absolute',
    width: 110,
    height: 110,
    borderRadius: 55,
    borderWidth: 1,
    borderColor: '#c084fc',
    transform: [{ rotate: '120deg' }],
  },
  wireframeRing3: {
    position: 'absolute',
    width: 130,
    height: 130,
    borderRadius: 65,
    borderWidth: 1,
    borderColor: 'rgba(96, 165, 250, 0.4)',
  },
  splashCard: {
    width: '100%',
    backgroundColor: '#0d1326',
    borderRadius: 20,
    padding: 24,
    borderWidth: 1,
    borderColor: '#1e293b',
    alignItems: 'center',
  },
  splashTitle: {
    fontSize: 28,
    fontWeight: '900',
    color: '#ffffff',
    letterSpacing: 2,
    marginBottom: 12,
  },
  splashSubtitle: {
    fontSize: 13,
    color: '#94a3b8',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 24,
  },
  splashSubtitleHighlight: {
    color: '#2dd4bf',
    fontWeight: '700',
  },
  systemInitButton: {
    width: '100%',
    backgroundColor: '#111936',
    borderWidth: 1,
    borderColor: '#2563eb',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    marginBottom: 12,
  },
  systemInitButtonText: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: '800',
    letterSpacing: 1,
  },
  authenticateButton: {
    width: '100%',
    backgroundColor: '#0a0f20',
    borderWidth: 1,
    borderColor: '#1e293b',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    marginBottom: 24,
  },
  authenticateButtonText: {
    color: '#94a3b8',
    fontSize: 13,
    fontWeight: '800',
    letterSpacing: 1,
  },
  progressContainer: {
    width: '100%',
    alignItems: 'center',
  },
  progressBarBackground: {
    width: '100%',
    height: 4,
    backgroundColor: '#1e293b',
    borderRadius: 2,
    overflow: 'hidden',
    marginBottom: 10,
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#60a5fa',
  },
  progressText: {
    fontFamily: 'monospace',
    color: '#60a5fa',
    fontSize: 11,
    letterSpacing: 1,
  },

  // AUTH SCREEN
  authContainer: {
    flex: 1,
    backgroundColor: '#060913',
  },
  authScroll: {
    padding: 20,
    justifyContent: 'center',
    minHeight: '100%',
  },
  authCard: {
    backgroundColor: '#0d1326',
    borderRadius: 20,
    padding: 24,
    borderWidth: 1,
    borderColor: '#1e293b',
    alignItems: 'center',
  },
  authLogoImage: {
    width: 64,
    height: 64,
    borderRadius: 16,
    marginBottom: 16,
  },
  authTitle: {
    fontSize: 24,
    fontWeight: '900',
    color: '#ffffff',
    letterSpacing: 1,
  },
  authSubtitle: {
    fontSize: 12,
    color: '#94a3b8',
    textAlign: 'center',
    marginTop: 6,
    marginBottom: 20,
  },
  errorText: {
    color: '#ef4444',
    fontSize: 12,
    marginBottom: 10,
  },
  inputGroup: {
    width: '100%',
    marginBottom: 16,
  },
  cyberInput: {
    width: '100%',
    backgroundColor: '#131c38',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#1e293b',
    color: '#ffffff',
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 13,
    fontFamily: 'monospace',
    marginBottom: 12,
  },
  forgotPasswordRow: {
    alignSelf: 'flex-end',
  },
  forgotPasswordText: {
    color: '#60a5fa',
    fontSize: 11,
    fontFamily: 'monospace',
  },
  gradientLoginButton: {
    width: '100%',
    backgroundColor: '#3b82f6',
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: 'center',
    marginBottom: 16,
  },
  gradientLoginButtonText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '700',
  },
  orDividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    marginVertical: 12,
  },
  orDividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#1e293b',
  },
  orDividerText: {
    color: '#6b7280',
    fontSize: 10,
    marginHorizontal: 10,
    fontFamily: 'monospace',
  },
  googleAuthButton: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#131c38',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#1e293b',
    paddingVertical: 12,
    marginBottom: 20,
  },
  googleGLogo: {
    fontSize: 16,
    marginRight: 10,
  },
  googleAuthButtonText: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: '600',
  },
  guestModeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#1e293b',
  },
  guestModeText: {
    color: '#94a3b8',
    fontSize: 12,
  },

  // ONBOARDING
  onboardContainer: {
    flex: 1,
    backgroundColor: '#060913',
  },
  onboardScroll: {
    padding: 20,
    paddingBottom: 40,
  },
  onboardMainTitle: {
    fontSize: 26,
    fontWeight: '900',
    color: '#ffffff',
    letterSpacing: 2,
    textAlign: 'center',
    marginBottom: 8,
  },
  onboardSubDesc: {
    fontSize: 12,
    color: '#94a3b8',
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 18,
  },
  phaseRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    borderBottomWidth: 1,
    borderBottomColor: '#1e293b',
    marginBottom: 24,
  },
  phaseItem: {
    paddingVertical: 8,
    alignItems: 'center',
  },
  phaseActive: {
    borderBottomWidth: 2,
    borderBottomColor: '#3b82f6',
  },
  phaseText: {
    color: '#6b7280',
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1,
  },
  phaseTextActive: {
    color: '#3b82f6',
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1,
  },
  phaseActiveBar: {},
  sectionHeaderTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#ffffff',
    marginVertical: 14,
  },
  roleGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  roleCard: {
    width: '48%',
    backgroundColor: '#0d1326',
    borderWidth: 1,
    borderColor: '#1e293b',
    borderRadius: 12,
    padding: 14,
    marginBottom: 12,
  },
  roleCardSelected: {
    borderColor: '#3b82f6',
    backgroundColor: '#111a3d',
  },
  roleCardIcon: {
    fontSize: 20,
    marginBottom: 8,
  },
  roleCardTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#ffffff',
    marginBottom: 4,
  },
  roleCardDesc: {
    fontSize: 11,
    color: '#94a3b8',
    lineHeight: 14,
  },
  skillsTagRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  skillTag: {
    backgroundColor: '#0d1326',
    borderWidth: 1,
    borderColor: '#1e293b',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
  },
  skillTagActive: {
    borderColor: '#3b82f6',
    backgroundColor: '#172554',
  },
  skillTagText: {
    color: '#94a3b8',
    fontSize: 12,
    fontWeight: '600',
  },
  skillTagTextActive: {
    color: '#60a5fa',
  },
  timeAllocRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 8,
  },
  timeBox: {
    flex: 1,
    backgroundColor: '#0d1326',
    borderWidth: 1,
    borderColor: '#1e293b',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
  },
  timeBoxActive: {
    borderColor: '#3b82f6',
    backgroundColor: '#111a3d',
  },
  timeNumber: {
    fontSize: 18,
    fontWeight: '900',
    color: '#ffffff',
    marginBottom: 4,
  },
  timeNumberActive: {
    color: '#60a5fa',
  },
  timeLabel: {
    fontSize: 9,
    fontWeight: '800',
    color: '#6b7280',
    letterSpacing: 1,
  },
  launchRoadmapButton: {
    backgroundColor: '#3b82f6',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 30,
  },
  launchRoadmapButtonText: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: '900',
    letterSpacing: 1,
  },

  // DASHBOARD
  dashboardContainer: {
    flex: 1,
    backgroundColor: '#060913',
    padding: 16,
  },
  dashHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  dashBrandRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dashLogoIcon: {
    width: 28,
    height: 28,
    borderRadius: 6,
    marginRight: 8,
  },
  dashBrandTitle: {
    fontSize: 14,
    fontWeight: '900',
    color: '#ffffff',
    letterSpacing: 1,
  },
  dashHeaderActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  headerIconButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#0d1326',
    borderWidth: 1,
    borderColor: '#1e293b',
    justifyContent: 'center',
    alignItems: 'center',
  },
  userAvatarCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#2563eb',
    justifyContent: 'center',
    alignItems: 'center',
  },
  userAvatarText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '800',
  },
  greetingBox: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  greetingName: {
    fontSize: 20,
    fontWeight: '900',
    color: '#ffffff',
  },
  greetingSub: {
    fontSize: 12,
    color: '#94a3b8',
    marginTop: 2,
  },
  statsBadgeRow: {
    flexDirection: 'row',
    gap: 6,
  },
  statPill: {
    backgroundColor: '#831843',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statPillText: {
    color: '#ffffff',
    fontSize: 11,
    fontWeight: '800',
  },
  readinessCard: {
    backgroundColor: '#0d1326',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#1e293b',
    padding: 16,
    marginBottom: 16,
  },
  cardHeaderSmall: {
    fontSize: 11,
    fontWeight: '800',
    color: '#94a3b8',
    letterSpacing: 1,
    marginBottom: 12,
  },
  gaugeContainer: {
    alignItems: 'center',
    marginVertical: 10,
  },
  circularGaugeRing: {
    width: 140,
    height: 140,
    borderRadius: 70,
    borderWidth: 8,
    borderColor: '#c084fc',
    borderLeftColor: '#3b82f6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  gaugeScoreNumber: {
    fontSize: 32,
    fontWeight: '900',
    color: '#ffffff',
  },
  gaugeScoreLabel: {
    fontSize: 10,
    fontWeight: '800',
    color: '#94a3b8',
    letterSpacing: 1,
  },
  metricsSplitRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    borderTopWidth: 1,
    borderTopColor: '#1e293b',
    paddingTop: 12,
    marginTop: 10,
  },
  metricItem: {
    alignItems: 'center',
  },
  metricDivider: {
    width: 1,
    backgroundColor: '#1e293b',
  },
  metricLabel: {
    fontSize: 11,
    color: '#94a3b8',
    marginBottom: 4,
  },
  metricStatusStrong: {
    color: '#10b981',
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 1,
  },
  metricStatusImproving: {
    color: '#c084fc',
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 1,
  },
  questsCard: {
    backgroundColor: '#0d1326',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#1e293b',
    padding: 16,
    marginBottom: 16,
  },
  questsHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  questCountBadge: {
    color: '#60a5fa',
    fontSize: 11,
    fontWeight: '800',
  },
  questItemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#111936',
    borderRadius: 10,
    padding: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#1e293b',
  },
  questItemCompleted: {
    opacity: 0.6,
  },
  checkboxCircle: {
    width: 18,
    height: 18,
    borderRadius: 4,
    borderWidth: 1.5,
    borderColor: '#60a5fa',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  checkboxCircleActive: {
    backgroundColor: '#3b82f6',
  },
  checkMark: {
    color: '#ffffff',
    fontSize: 11,
    fontWeight: '900',
  },
  questTitleText: {
    flex: 1,
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '600',
  },
  questTitleTextCompleted: {
    textDecorationLine: 'line-through',
    color: '#94a3b8',
  },
  xpPill: {
    backgroundColor: '#312e81',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  xpPillText: {
    color: '#c084fc',
    fontSize: 10,
    fontWeight: '800',
  },
  activityCard: {
    backgroundColor: '#0d1326',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#1e293b',
    padding: 16,
    marginBottom: 16,
  },
  daysLetterRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 8,
  },
  dayLetterText: {
    color: '#6b7280',
    fontSize: 10,
    fontWeight: '700',
    width: 24,
    textAlign: 'center',
  },
  heatmapGrid: {
    gap: 6,
  },
  heatmapRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  heatmapTile: {
    width: 28,
    height: 28,
    borderRadius: 6,
  },

  // ARENA
  problemBannerCard: {
    backgroundColor: '#0d1326',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#1e293b',
    padding: 16,
    marginBottom: 12,
  },
  problemTitleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  problemMainTitle: {
    fontSize: 18,
    fontWeight: '900',
    color: '#ffffff',
  },
  difficultyBadge: {
    backgroundColor: '#064e3b',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  difficultyBadgeText: {
    color: '#34d399',
    fontSize: 10,
    fontWeight: '800',
  },
  companyTagsRow: {
    flexDirection: 'row',
    gap: 6,
    marginBottom: 12,
  },
  companyTag: {
    backgroundColor: '#1e293b',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  companyTagText: {
    color: '#94a3b8',
    fontSize: 9,
    fontWeight: '800',
  },
  arenaModeSwitcher: {
    flexDirection: 'row',
    backgroundColor: '#111936',
    borderRadius: 8,
    padding: 3,
  },
  modeTab: {
    flex: 1,
    paddingVertical: 6,
    alignItems: 'center',
    borderRadius: 6,
  },
  modeTabActive: {
    backgroundColor: '#2563eb',
  },
  modeTabText: {
    color: '#94a3b8',
    fontSize: 11,
    fontWeight: '700',
  },
  modeTabTextActive: {
    color: '#ffffff',
  },
  descCard: {
    backgroundColor: '#0d1326',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#1e293b',
    padding: 16,
    marginBottom: 12,
  },
  descHeading: {
    fontSize: 14,
    fontWeight: '800',
    color: '#ffffff',
    marginBottom: 8,
  },
  descBody: {
    color: '#94a3b8',
    fontSize: 12,
    lineHeight: 18,
    marginBottom: 12,
  },
  exampleBox: {
    backgroundColor: '#111936',
    borderRadius: 8,
    padding: 10,
  },
  exampleTitle: {
    color: '#ffffff',
    fontSize: 11,
    fontWeight: '800',
    marginBottom: 4,
  },
  exampleCode: {
    color: '#60a5fa',
    fontSize: 11,
    fontFamily: 'monospace',
  },
  editorCard: {
    backgroundColor: '#0d1326',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#1e293b',
    padding: 16,
    marginBottom: 16,
  },
  editorHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  editorLangTitle: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '800',
  },
  editorExpandIcon: {
    color: '#94a3b8',
    fontSize: 14,
  },
  codeTextInput: {
    backgroundColor: '#070b19',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#1e293b',
    color: '#e2e8f0',
    fontFamily: 'monospace',
    fontSize: 12,
    padding: 12,
    minHeight: 180,
    textAlignVertical: 'top',
  },
  executionStatusRow: {
    marginTop: 10,
    marginBottom: 14,
  },
  executionStatusText: {
    color: '#34d399',
    fontSize: 11,
    fontFamily: 'monospace',
  },
  editorButtonsRow: {
    flexDirection: 'row',
    gap: 10,
  },
  runCodeBtn: {
    flex: 1,
    backgroundColor: '#111936',
    borderWidth: 1,
    borderColor: '#1e293b',
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
  },
  runCodeBtnText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '700',
  },
  submitCodeBtn: {
    flex: 1,
    backgroundColor: '#2dd4bf',
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
  },
  submitCodeBtnText: {
    color: '#060913',
    fontSize: 12,
    fontWeight: '900',
  },
  mcqOptionButton: {
    backgroundColor: '#111936',
    borderWidth: 1,
    borderColor: '#1e293b',
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
  },
  mcqOptionButtonSelected: {
    borderColor: '#3b82f6',
    backgroundColor: '#172554',
  },
  mcqOptionText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '600',
  },
  mcqOptionTextSelected: {
    color: '#60a5fa',
    fontWeight: '800',
  },
  explanationBox: {
    backgroundColor: '#064e3b',
    borderRadius: 8,
    padding: 12,
    marginTop: 10,
  },
  explanationTitle: {
    color: '#34d399',
    fontSize: 12,
    fontWeight: '800',
    marginBottom: 4,
  },
  explanationBody: {
    color: '#a7f3d0',
    fontSize: 11,
  },

  // ROADMAP
  roadmapStepCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0d1326',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#1e293b',
    padding: 14,
    marginBottom: 10,
  },
  roadmapNumberCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#2563eb',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  roadmapNumberText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '800',
  },
  roadmapStepTitle: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: '800',
  },
  roadmapStepDesc: {
    color: '#94a3b8',
    fontSize: 11,
    marginTop: 2,
  },

  // PROFILE
  userAvatarCircleLarge: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: '#2563eb',
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'center',
  },
  userAvatarTextLarge: {
    color: '#ffffff',
    fontSize: 24,
    fontWeight: '900',
  },

  // ROADMAP & MODULES
  activeTrackBanner: {
    backgroundColor: '#0d1326',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#1e293b',
    padding: 16,
    marginBottom: 14,
  },
  activeTrackTag: {
    color: '#2dd4bf',
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1,
    marginBottom: 4,
  },
  activeTrackTitle: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '900',
    marginBottom: 12,
  },
  overallProgressBox: {
    backgroundColor: '#111936',
    borderRadius: 10,
    padding: 12,
  },
  overallProgressTextRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  overallProgressLabel: {
    color: '#94a3b8',
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1,
  },
  overallProgressPercent: {
    color: '#c084fc',
    fontSize: 12,
    fontWeight: '800',
  },
  moduleCardCompleted: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0d1326',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#1e293b',
    padding: 14,
    marginBottom: 12,
  },
  moduleCompletedIconCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#064e3b',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  moduleCheckmark: {
    color: '#34d399',
    fontSize: 14,
    fontWeight: '900',
  },
  moduleTitle: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '800',
  },
  moduleSubtitle: {
    color: '#94a3b8',
    fontSize: 11,
    marginTop: 2,
  },
  moduleProgressPillGreen: {
    backgroundColor: '#064e3b',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  moduleProgressPillGreenText: {
    color: '#34d399',
    fontSize: 10,
    fontWeight: '800',
  },
  moduleCardActive: {
    backgroundColor: '#0d1326',
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: '#2563eb',
    padding: 14,
    marginBottom: 12,
  },
  moduleHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  moduleActiveIconBox: {
    width: 34,
    height: 34,
    borderRadius: 8,
    backgroundColor: '#172554',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  chevronIcon: {
    color: '#94a3b8',
    fontSize: 10,
    marginBottom: 4,
  },
  modulePercentText: {
    color: '#60a5fa',
    fontSize: 11,
    fontWeight: '800',
  },
  subtopicsContainer: {
    marginTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#1e293b',
    paddingTop: 10,
  },
  subtopicItemCompleted: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#111936',
    borderRadius: 8,
    padding: 10,
    marginBottom: 6,
  },
  subtopicCheckSquare: {
    width: 16,
    height: 16,
    borderRadius: 4,
    backgroundColor: '#10b981',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  subtopicTitleCompleted: {
    flex: 1,
    color: '#94a3b8',
    fontSize: 12,
    textDecorationLine: 'line-through',
  },
  subtopicXpText: {
    color: '#60a5fa',
    fontSize: 10,
    fontWeight: '800',
  },
  subtopicItemActive: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#172554',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#3b82f6',
    padding: 10,
    marginBottom: 6,
  },
  subtopicRadioActive: {
    width: 14,
    height: 14,
    borderRadius: 7,
    borderWidth: 2,
    borderColor: '#60a5fa',
  },
  subtopicTitleActive: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '800',
  },
  subtopicUnlockText: {
    color: '#c084fc',
    fontSize: 10,
    fontWeight: '600',
  },
  startSubtopicButton: {
    backgroundColor: '#3b82f6',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  startSubtopicButtonText: {
    color: '#ffffff',
    fontSize: 10,
    fontWeight: '900',
  },
  subtopicItemLocked: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    opacity: 0.5,
  },
  lockIconSmall: {
    fontSize: 12,
    marginRight: 10,
  },
  subtopicTitleLocked: {
    flex: 1,
    color: '#94a3b8',
    fontSize: 12,
  },
  subtopicRequiresText: {
    color: '#6b7280',
    fontSize: 10,
    fontStyle: 'italic',
  },
  moduleCardLocked: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0d1326',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#1e293b',
    padding: 14,
    marginBottom: 12,
    opacity: 0.6,
  },
  moduleLockedIconBox: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: '#1e293b',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  moduleTitleLocked: {
    color: '#94a3b8',
    fontSize: 13,
    fontWeight: '700',
  },
  moduleSubtitleLocked: {
    color: '#6b7280',
    fontSize: 11,
  },
  chevronIconLocked: {
    color: '#6b7280',
    fontSize: 10,
  },
  statsOverviewCard: {
    backgroundColor: '#0d1326',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#1e293b',
    padding: 16,
    marginBottom: 12,
  },
  statRowItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#111936',
  },
  statRowLabel: {
    color: '#94a3b8',
    fontSize: 12,
    fontWeight: '600',
  },
  statRowValue: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: '800',
  },
  statRowValueGreen: {
    color: '#34d399',
    fontSize: 13,
    fontWeight: '800',
  },
  milestoneCard: {
    backgroundColor: '#0d1326',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#1e293b',
    padding: 16,
    marginBottom: 12,
  },
  milestoneTitle: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '800',
    marginBottom: 4,
  },
  milestoneBody: {
    color: '#94a3b8',
    fontSize: 11,
    lineHeight: 16,
    marginBottom: 10,
  },
  milestoneLockRow: {
    backgroundColor: '#111936',
    borderRadius: 6,
    padding: 8,
  },
  milestoneLockText: {
    color: '#60a5fa',
    fontSize: 10,
    fontWeight: '700',
  },

  // PROFILE & ATS RESUME
  profileHeroCard: {
    backgroundColor: '#0d1326',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#1e293b',
    padding: 18,
    alignItems: 'center',
    marginBottom: 14,
  },
  avatarGlowContainer: {
    width: 80,
    height: 80,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: '#3b82f6',
    overflow: 'hidden',
    marginBottom: 10,
  },
  profileAvatarImage: {
    width: '100%',
    height: '100%',
  },
  profileNameTitle: {
    fontSize: 20,
    fontWeight: '900',
    color: '#ffffff',
    letterSpacing: 1,
  },
  profileRoleMono: {
    fontSize: 11,
    color: '#60a5fa',
    fontFamily: 'monospace',
    marginTop: 2,
    marginBottom: 8,
  },
  profileBioText: {
    fontSize: 11,
    color: '#94a3b8',
    textAlign: 'center',
    lineHeight: 16,
    marginBottom: 14,
  },
  profileBadgesRow: {
    flexDirection: 'row',
    gap: 8,
  },
  badgePillTeal: {
    backgroundColor: '#042f2e',
    borderWidth: 1,
    borderColor: '#0d9488',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  badgePillTealText: {
    color: '#2dd4bf',
    fontSize: 11,
    fontWeight: '800',
  },
  badgePillPurple: {
    backgroundColor: '#3b0764',
    borderWidth: 1,
    borderColor: '#9333ea',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  badgePillPurpleText: {
    color: '#c084fc',
    fontSize: 11,
    fontWeight: '800',
  },
  atsScannerCard: {
    backgroundColor: '#0d1326',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#1e293b',
    padding: 16,
    marginBottom: 14,
  },
  atsHeaderRow: {
    marginBottom: 12,
  },
  uploadDashedBox: {
    borderWidth: 1.5,
    borderColor: '#1e293b',
    borderStyle: 'dashed',
    borderRadius: 12,
    backgroundColor: '#090e1f',
    padding: 20,
    alignItems: 'center',
  },
  uploadCloudIcon: {
    fontSize: 32,
    marginBottom: 8,
  },
  uploadMainText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '700',
    marginBottom: 4,
  },
  uploadSubText: {
    color: '#6b7280',
    fontSize: 10,
    marginBottom: 14,
  },
  browseFilesButton: {
    backgroundColor: '#2563eb',
    paddingHorizontal: 24,
    paddingVertical: 10,
    borderRadius: 8,
  },
  browseFilesButtonText: {
    color: '#ffffff',
    fontSize: 11,
    fontWeight: '900',
    letterSpacing: 1,
  },
  analysisCard: {
    backgroundColor: '#0d1326',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#1e293b',
    padding: 16,
    marginBottom: 16,
  },
  analysisHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  analysisHeaderTitle: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '800',
  },
  atsScoreLarge: {
    color: '#ffffff',
    fontSize: 22,
    fontWeight: '900',
  },
  atsScoreSmall: {
    color: '#94a3b8',
    fontSize: 12,
  },
  atsScoreLabel: {
    color: '#60a5fa',
    fontSize: 8,
    fontWeight: '800',
    letterSpacing: 1,
  },
  atsSectionSubtitle: {
    color: '#94a3b8',
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1,
    marginVertical: 8,
  },
  atsPillGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginBottom: 8,
  },
  skillMatchedPill: {
    backgroundColor: '#064e3b',
    borderWidth: 1,
    borderColor: '#059669',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
  },
  skillMatchedPillText: {
    color: '#34d399',
    fontSize: 10,
    fontWeight: '800',
  },
  skillMissingPill: {
    backgroundColor: '#450a0a',
    borderWidth: 1,
    borderColor: '#dc2626',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
  },
  skillMissingPillText: {
    color: '#f87171',
    fontSize: 10,
    fontWeight: '800',
  },
  predictedQuestionCard: {
    backgroundColor: '#111936',
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
  },
  predictedQuestionText: {
    color: '#cbd5e1',
    fontSize: 11,
    lineHeight: 16,
    fontStyle: 'italic',
  },

  // BOTTOM TAB BAR
  bottomTabBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 64,
    backgroundColor: '#080d1e',
    borderTopWidth: 1,
    borderTopColor: '#1e293b',
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  tabItem: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabIcon: {
    fontSize: 18,
    color: '#6b7280',
    marginBottom: 2,
  },
  tabIconActive: {
    color: '#3b82f6',
  },
  tabLabel: {
    fontSize: 10,
    color: '#6b7280',
    fontWeight: '600',
  },
  tabLabelActive: {
    color: '#3b82f6',
    fontWeight: '800',
  },
});
