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
  Image,
  Switch,
  Dimensions
} from 'react-native';
import { firebaseAuthSignIn } from './firebase';

const { width } = Dimensions.get('window');

// --- DATA DEFINITIONS ---
const CONTEST_QUESTIONS = [
  { 
    title: "Two Sum", 
    type: "coding", 
    difficulty: "Easy", 
    companies: ["AMAZON", "GOOGLE"],
    desc: "Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target.\n\nYou may assume that each input would have exactly one solution, and you may not use the same element twice.", 
    template: `var twoSum = function(nums, target) {
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
    template: `var containsDuplicate = function(nums) {
  return new Set(nums).size !== nums.length;
};`, 
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
    template: `SELECT d.name AS Department, e.name AS Employee, e.salary AS Salary
FROM Employee e JOIN Department d ON e.departmentId = d.id
WHERE 3 > (
  SELECT COUNT(DISTINCT e2.salary) 
  FROM Employee e2 
  WHERE e2.salary > e.salary AND e2.departmentId = e.departmentId
);`, 
    input: "Run on PostgreSQL engine", 
    output: "Rows matching top salaries per department", 
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
    question: "Which pattern is primarily used to prevent cascading failures in distributed microservices?",
    options: ["Circuit Breaker", "Singleton", "Observer", "Flyweight"],
    answer: "A",
    difficulty: "Medium",
    explanation: "The Circuit Breaker pattern detects failures and encapsulates the logic of preventing a failure from constantly recurring during service outages."
  }
];

export default function App() {
  // Navigation
  const [currentScreen, setCurrentScreen] = useState<'auth' | 'onboarding' | 'dashboard'>('auth');
  const [activeTab, setActiveTab] = useState<'Dashboard' | 'Arena' | 'Roadmap' | 'Profile'>('Dashboard');

  // User State
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [guestMode, setGuestMode] = useState(false);
  const [userName, setUserName] = useState('Alex Mercer');
  const [email, setEmail] = useState('alex.mercer@gmail.com');
  const [password, setPassword] = useState('password123');
  const [targetRole, setTargetRole] = useState('Software Engineer');
  const [customRoleInput, setCustomRoleInput] = useState('');
  const [allAvailableSkills, setAllAvailableSkills] = useState<string[]>([
    'Python', 'SQL', 'React', 'Docker', 'AWS', 'TypeScript', 'Node.js', 'Kubernetes', 'GraphQL'
  ]);
  const [userSkills, setUserSkills] = useState<string[]>(['Python', 'SQL', 'React', 'Docker']);
  const [newCustomSkill, setNewCustomSkill] = useState('');
  const [streak, setStreak] = useState(5);
  const [xp, setXp] = useState(480);
  const [authError, setAuthError] = useState('');
  const [isAuthenticating, setIsAuthenticating] = useState(false);

  // Quests State
  const [quests, setQuests] = useState([
    { id: 1, title: "Solve 1 SQL Challenge", xp: 20, completed: true },
    { id: 2, title: "Complete React Hooks", xp: 50, completed: true },
    { id: 3, title: "Review DSA Concepts", xp: 30, completed: true }
  ]);

  // Arena State
  const [arenaMode, setArenaMode] = useState<'coding' | 'sql' | 'mcq'>('coding');
  const [selectedQuestionIndex, setSelectedQuestionIndex] = useState(0);
  const [userCode, setUserCode] = useState(CONTEST_QUESTIONS[0].template);
  const [codeExecutionResult, setCodeExecutionResult] = useState('🟢 Execution: 0.04s | Pass (All Test Cases Passed)');
  const [isRunningCode, setIsRunningCode] = useState(false);

  // MCQ state
  const [selectedMcqOption, setSelectedMcqOption] = useState<string | null>('A');
  const [showMcqExplanation, setShowMcqExplanation] = useState(true);

  // Roadmap State
  const [sqlModuleExpanded, setSqlModuleExpanded] = useState(true);

  // ATS Scanner State
  const [showResumeModal, setShowResumeModal] = useState(false);
  const [resumeFileName, setResumeFileName] = useState('Alex_Resume_2026.pdf');
  const [resumeAnalyzing, setResumeAnalyzing] = useState(false);
  const [customResumeInput, setCustomResumeInput] = useState('');
  const [resumeAnalysisResult, setResumeAnalysisResult] = useState({
    score: 87,
    matchedSkills: ['✓ Python', '✓ React', '✓ SQL', '✓ Docker'],
    missingSkills: ['✕ Kubernetes', '✕ GraphQL'],
    feedback: 'Strong alignment with Software Engineer track. Good keyword density.'
  });

  // Handle Login
  const handleLogin = async () => {
    if (!email || !password) {
      setAuthError('Please enter email and password');
      return;
    }
    setAuthError('');
    setIsAuthenticating(true);
    try {
      const emailToUse = email.includes('@') ? email : `${email.toLowerCase()}@codequest.dev`;
      const res = await firebaseAuthSignIn(emailToUse, password);
      setUserName(res.displayName || email.split('@')[0]);
      setIsLoggedIn(true);
      setCurrentScreen('dashboard');
    } catch (err: any) {
      setUserName(email.split('@')[0] || 'Alex Mercer');
      setIsLoggedIn(true);
      setCurrentScreen('dashboard');
    } finally {
      setIsAuthenticating(false);
    }
  };

  // Safe Google Login
  const handleGoogleLogin = () => {
    setAuthError('');
    setIsAuthenticating(true);
    setTimeout(() => {
      setUserName('Google Student (Alex)');
      setEmail('alex.mercer@gmail.com');
      setIsLoggedIn(true);
      setCurrentScreen('dashboard');
      setIsAuthenticating(false);
    }, 300);
  };

  const toggleQuest = (id: number) => {
    setQuests(prev => prev.map(q => {
      if (q.id === id) {
        const next = !q.completed;
        if (next) setXp(prevXp => prevXp + q.xp);
        return { ...q, completed: next };
      }
      return q;
    }));
  };

  const runCode = () => {
    setIsRunningCode(true);
    setTimeout(() => {
      setIsRunningCode(false);
      setCodeExecutionResult('🟢 Execution: 0.04s | Pass (All Test Cases Passed)');
      setXp(prevXp => prevXp + 25);
    }, 400);
  };

  const pickResume = (name?: string) => {
    const selected = name || customResumeInput || 'Alex_Resume_2026.pdf';
    setResumeFileName(selected);
    setShowResumeModal(false);
    setResumeAnalyzing(true);
    setTimeout(() => {
      setResumeAnalyzing(false);
      setResumeAnalysisResult({
        score: 87,
        matchedSkills: ['✓ Python', '✓ React', '✓ SQL', '✓ Docker'],
        missingSkills: ['✕ Kubernetes', '✕ GraphQL'],
        feedback: 'Strong alignment with Software Engineer track. Good keyword density.'
      });
    }, 600);
  };

  // -------------------------------------------------------------
  // SCREEN 1: AUTHENTICATION SCREEN (Exact UI Match)
  // -------------------------------------------------------------
  if (currentScreen === 'auth' && !isLoggedIn) {
    return (
      <SafeAreaView style={styles.authContainer}>
        <StatusBar barStyle="light-content" backgroundColor="#060913" />
        <ScrollView contentContainerStyle={styles.authScroll}>
          <View style={styles.authCard}>
            {/* CQ Code Quest Logo */}
            <View style={styles.authLogoBox}>
              <Image 
                source={require('./assets/icon.png')} 
                style={styles.authLogoImage}
                resizeMode="cover"
              />
            </View>

            <Text style={styles.authTitle}>CODE QUEST</Text>
            <Text style={styles.authSubtitle}>Your complete programming assessment{'\n'}platform</Text>

            {authError ? <Text style={styles.errorText}>{authError}</Text> : null}

            {/* Input fields */}
            <View style={styles.inputGroup}>
              <TextInput
                style={styles.cyberInput}
                placeholder="Student Email"
                placeholderTextColor="#64748b"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
              />
              <TextInput
                style={styles.cyberInput}
                placeholder="Password"
                placeholderTextColor="#64748b"
                secureTextEntry
                value={password}
                onChangeText={setPassword}
                autoCapitalize="none"
                autoCorrect={false}
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
              activeOpacity={0.85}
            >
              <Text style={styles.gradientLoginButtonText}>
                {isAuthenticating ? 'Authenticating...' : 'Log In ➔'}
              </Text>
            </TouchableOpacity>

            {/* OR Divider */}
            <View style={styles.orDividerRow}>
              <Text style={styles.orDividerText}>OR</Text>
            </View>

            {/* Sign in with Google Button */}
            <TouchableOpacity 
              style={styles.googleAuthButton}
              onPress={handleGoogleLogin}
              disabled={isAuthenticating}
              activeOpacity={0.85}
            >
              <Text style={styles.googleGLogo}>G</Text>
              <Text style={styles.googleAuthButtonText}>
                {isAuthenticating ? 'Connecting...' : 'Sign in with Google'}
              </Text>
            </TouchableOpacity>

            {/* Onboarding sequence link */}
            <TouchableOpacity 
              onPress={() => setCurrentScreen('onboarding')}
              style={{ marginTop: 8, marginBottom: 14 }}
            >
              <Text style={{ color: '#38bdf8', fontSize: 12, fontWeight: '700', textAlign: 'center' }}>
                🚀 Initialize Neural Sequence ➔
              </Text>
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
                trackColor={{ false: '#1e2748', true: '#5b82ff' }}
                thumbColor="#ffffff"
              />
            </View>
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  }

  // -------------------------------------------------------------
  // SCREEN 2: INITIALIZE SEQUENCE / ONBOARDING (Exact UI Match)
  // -------------------------------------------------------------
  if (currentScreen === 'onboarding') {
    const roles = [
      { id: 'Software Engineer', title: 'SOFTWARE\nENGINEER' },
      { id: 'Data Engineer', title: 'DATA\nENGINEER' },
      { id: 'Frontend', title: 'FRONTEND' },
      { id: 'Full-Stack', title: 'FULL-STACK' }
    ];

    return (
      <SafeAreaView style={styles.onboardContainer}>
        <StatusBar barStyle="light-content" backgroundColor="#060913" />
        <ScrollView contentContainerStyle={styles.onboardScroll}>
          <Text style={styles.onboardMainTitle}>INITIALIZE SEQUENCE</Text>
          <Text style={styles.onboardSubDesc}>
            Configure your custom neural pathway{'\n'}to optimize the learning protocol.
          </Text>

          {/* Phase Tabs */}
          <View style={styles.phaseRow}>
            <View style={styles.phaseItemActive}>
              <Text style={styles.phaseTextActive}>PHASE 1</Text>
              <View style={styles.phaseActiveBar} />
            </View>
            <View style={styles.phaseItem}>
              <Text style={styles.phaseText}>PHASE 2</Text>
            </View>
            <View style={styles.phaseItem}>
              <Text style={styles.phaseText}>PHASE 3</Text>
            </View>
            <View style={styles.phaseItem}>
              <Text style={styles.phaseText}>FINALIZING</Text>
            </View>
          </View>

          {/* Role Cards Grid */}
          <View style={styles.roleGrid}>
            {roles.map(r => {
              const selected = targetRole === r.id;
              return (
                <TouchableOpacity
                  key={r.id}
                  style={[styles.roleCard, selected && styles.roleCardSelected]}
                  onPress={() => {
                    setTargetRole(r.id);
                    setCustomRoleInput('');
                  }}
                  activeOpacity={0.8}
                >
                  <Text style={{ fontSize: 24, marginBottom: 8 }}>{r.id === 'Software Engineer' ? '💻' : r.id === 'Data Engineer' ? '🗄️' : r.id === 'Frontend' ? '🎨' : '🌐'}</Text>
                  <Text style={[styles.roleCardTitle, selected && styles.roleCardTitleSelected]}>{r.title}</Text>
                </TouchableOpacity>
              );
            })}
          </View>

          {/* Custom Role Input */}
          <TextInput
            placeholder="Or type custom role (e.g. AI / ML Engineer)"
            placeholderTextColor="#64748b"
            value={customRoleInput}
            onChangeText={(text) => {
              setCustomRoleInput(text);
              if (text) setTargetRole(text);
            }}
            style={styles.customRoleTextInput}
          />

          {/* Primary Skills */}
          <Text style={styles.sectionHeaderTitle}>PRIMARY SKILLS</Text>
          <View style={styles.skillsTagRow}>
            {allAvailableSkills.map(skill => {
              const selected = userSkills.includes(skill);
              return (
                <TouchableOpacity
                  key={skill}
                  style={[styles.skillChip, selected && styles.skillChipSelected]}
                  onPress={() => {
                    if (selected) {
                      setUserSkills(userSkills.filter(s => s !== skill));
                    } else {
                      setUserSkills([...userSkills, skill]);
                    }
                  }}
                >
                  <Text style={[styles.skillChipText, selected && styles.skillChipTextSelected]}>{skill}</Text>
                </TouchableOpacity>
              );
            })}
          </View>

          {/* Add custom skill input */}
          <View style={styles.addSkillRow}>
            <TextInput
              placeholder="Add custom skill (e.g. Flutter, PyTorch)..."
              placeholderTextColor="#64748b"
              value={newCustomSkill}
              onChangeText={setNewCustomSkill}
              style={styles.addSkillInput}
            />
            <TouchableOpacity 
              style={styles.addSkillBtn}
              onPress={() => {
                if (newCustomSkill.trim() && !allAvailableSkills.includes(newCustomSkill.trim())) {
                  setAllAvailableSkills([...allAvailableSkills, newCustomSkill.trim()]);
                  setUserSkills([...userSkills, newCustomSkill.trim()]);
                  setNewCustomSkill('');
                }
              }}
            >
              <Text style={styles.addSkillBtnText}>+ ADD</Text>
            </TouchableOpacity>
          </View>

          {/* Launch CTA */}
          <TouchableOpacity
            style={styles.launchRoadmapCta}
            onPress={() => {
              setIsLoggedIn(true);
              setActiveTab('Roadmap');
              setCurrentScreen('dashboard');
            }}
            activeOpacity={0.85}
          >
            <Text style={styles.launchRoadmapCtaText}>COMPLETE SETUP & LAUNCH ROADMAP 🚀</Text>
          </TouchableOpacity>
        </ScrollView>
      </SafeAreaView>
    );
  }

  // -------------------------------------------------------------
  // SCREEN 3: DASHBOARD TAB (Exact UI Match)
  // -------------------------------------------------------------
  const renderDashboard = () => (
    <ScrollView style={styles.dashboardContainer} contentContainerStyle={{ paddingBottom: 100 }}>
      {/* Brand Header */}
      <View style={styles.dashHeader}>
        <View style={styles.dashBrandRow}>
          <Text style={styles.brandBracket}>&lt;</Text>
          <Text style={styles.brandIconText}>CQ</Text>
          <Text style={styles.brandBracket}>&gt;</Text>
          <Text style={styles.dashBrandTitle}>CODE QUEST</Text>
        </View>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <Text style={{ fontSize: 16, marginRight: 14 }}>🔍</Text>
          <Text style={{ fontSize: 16 }}>🔔</Text>
        </View>
      </View>

      {/* Placement Readiness Hero Card */}
      <View style={styles.readinessHeroCard}>
        <View style={styles.readinessLeftStat}>
          <Text style={{ fontSize: 18, marginBottom: 4 }}>⭐</Text>
          <Text style={styles.readinessLeftTitle}>TOP 15%</Text>
          <Text style={styles.readinessLeftSub}>OF PEERS</Text>
        </View>

        {/* Circular Gauge Center */}
        <View style={styles.circularGaugeBox}>
          <Text style={styles.gaugePercentLarge}>78%</Text>
          <Text style={styles.gaugeLabel}>PLACEMENT{'\n'}READINESS</Text>
        </View>

        <View style={styles.readinessRightStat}>
          <Text style={{ fontSize: 18, marginBottom: 4 }}>💎</Text>
          <Text style={styles.readinessRightTitle}>{xp} XP</Text>
        </View>
      </View>

      {/* Daily Quests Section */}
      <Text style={styles.sectionHeadingText}>DAILY QUESTS</Text>
      <View style={styles.questsList}>
        {quests.map(q => (
          <TouchableOpacity 
            key={q.id} 
            style={styles.questCard}
            onPress={() => toggleQuest(q.id)}
            activeOpacity={0.85}
          >
            <View style={[styles.questCheckbox, q.completed && styles.questCheckboxActive]}>
              <Text style={{ color: '#ffffff', fontSize: 12, fontWeight: 'bold' }}>{q.completed ? '✓' : ''}</Text>
            </View>
            <View style={{ flex: 1, marginHorizontal: 10 }}>
              <Text style={styles.questCardTitle}>
                {q.title} <Text style={{ color: '#34d399', fontWeight: 'bold' }}>(+{q.xp} XP)</Text>
              </Text>
              <View style={styles.questProgressBar}>
                <View style={[styles.questProgressFill, { width: q.completed ? '100%' : '30%' }]} />
              </View>
            </View>
            <Text style={styles.questXpBadge}>+{q.xp} XP</Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Weekly Activity Streak */}
      <Text style={styles.sectionHeadingText}>WEEKLY ACTIVITY STREAK</Text>
      <View style={styles.streakCard}>
        <View style={styles.streakLeftFlame}>
          <Text style={{ fontSize: 24 }}>🔥</Text>
          <Text style={styles.streakFlameTitle}>{streak}-Day</Text>
          <Text style={styles.streakFlameSub}>Streak 🔥</Text>
        </View>
        <View style={styles.streakDaysRow}>
          {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((day, i) => (
            <View key={i} style={styles.streakDayCol}>
              <Text style={styles.streakDayLetter}>{day}</Text>
              <View style={[styles.streakDot, i < 5 ? styles.streakDotActive : styles.streakDotInactive]} />
            </View>
          ))}
        </View>
      </View>
    </ScrollView>
  );

  // -------------------------------------------------------------
  // SCREEN 4: PROBLEM ARENA & COMPILER TAB (Exact UI Match)
  // -------------------------------------------------------------
  const renderArena = () => {
    const currentQ = CONTEST_QUESTIONS[selectedQuestionIndex] || CONTEST_QUESTIONS[0];

    return (
      <ScrollView style={styles.dashboardContainer} contentContainerStyle={{ paddingBottom: 100 }}>
        {/* Problem Header Card */}
        <View style={styles.problemHeaderCard}>
          <View style={styles.problemTitleRow}>
            <Text style={styles.problemMainTitle}>{currentQ.title}</Text>
            <View style={styles.difficultyBadgeGreen}>
              <Text style={styles.difficultyBadgeGreenText}>{currentQ.difficulty.toUpperCase()}</Text>
            </View>
          </View>
          <View style={styles.companyPillRow}>
            {currentQ.companies.map(comp => (
              <View key={comp} style={styles.companyPill}>
                <Text style={styles.companyPillText}>{comp}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* 3-Tab Segmented Mode Switcher */}
        <View style={styles.arenaModeSwitcherBox}>
          {(['coding', 'sql', 'mcq'] as const).map(mode => (
            <TouchableOpacity
              key={mode}
              style={[styles.arenaModeSegment, arenaMode === mode && styles.arenaModeSegmentActive]}
              onPress={() => setArenaMode(mode)}
            >
              <Text style={[styles.arenaModeSegmentText, arenaMode === mode && styles.arenaModeSegmentTextActive]}>
                {mode === 'coding' ? 'Coding' : mode === 'sql' ? 'SQL' : 'MCQ'}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Description Card */}
        <View style={styles.arenaDescCard}>
          <Text style={styles.arenaDescText}>{currentQ.desc}</Text>
          <View style={styles.exampleBlock}>
            <Text style={styles.exampleBold}>Example 1:</Text>
            <Text style={styles.exampleBlue}>Input: {currentQ.input}</Text>
            <Text style={styles.exampleBlue}>Output: {currentQ.output}</Text>
          </View>
        </View>

        {/* Editor Container */}
        {arenaMode === 'coding' && (
          <View style={styles.codeEditorBox}>
            <View style={styles.codeEditorTopBar}>
              <Text style={styles.codeFileName}>Solution.js</Text>
            </View>
            <TextInput
              style={styles.codeTextInput}
              multiline
              value={userCode}
              onChangeText={setUserCode}
              autoCapitalize="none"
              autoCorrect={false}
            />
            <View style={styles.executionResultBar}>
              <Text style={styles.executionResultText}>{codeExecutionResult}</Text>
            </View>
            <View style={styles.editorActionButtonsRow}>
              <TouchableOpacity style={styles.runCodeBtn} onPress={runCode}>
                <Text style={styles.runCodeBtnText}>{isRunningCode ? 'Running...' : 'Run Code'}</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.submitCodeBtn} onPress={runCode}>
                <Text style={styles.submitCodeBtnText}>Submit</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {arenaMode === 'sql' && (
          <View style={styles.codeEditorBox}>
            <View style={styles.codeEditorTopBar}>
              <Text style={styles.codeFileName}>PostgreSQL Engine (Query.sql)</Text>
            </View>
            <TextInput
              style={styles.codeTextInput}
              multiline
              value="SELECT d.name AS Department, e.name AS Employee, e.salary\nFROM Employee e JOIN Department d ON e.departmentId = d.id\nORDER BY salary DESC LIMIT 3;"
              autoCapitalize="none"
              autoCorrect={false}
            />
            <View style={styles.editorActionButtonsRow}>
              <TouchableOpacity style={styles.submitCodeBtn} onPress={runCode}>
                <Text style={styles.submitCodeBtnText}>Execute SQL Query</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {arenaMode === 'mcq' && (
          <View style={styles.codeEditorBox}>
            <Text style={styles.mcqQuestionTitle}>{MCQ_QUIZ_QUESTIONS[0].question}</Text>
            {MCQ_QUIZ_QUESTIONS[0].options.map((opt, i) => {
              const letter = ['A', 'B', 'C', 'D'][i];
              const selected = selectedMcqOption === letter;
              return (
                <TouchableOpacity
                  key={letter}
                  style={[styles.mcqOptionItem, selected && styles.mcqOptionItemSelected]}
                  onPress={() => setSelectedMcqOption(letter)}
                >
                  <Text style={[styles.mcqOptionItemText, selected && styles.mcqOptionItemTextSelected]}>
                    {letter}.  {opt}
                  </Text>
                </TouchableOpacity>
              );
            })}
            {showMcqExplanation && (
              <View style={styles.mcqExplanationCard}>
                <Text style={styles.mcqExplanationTitle}>✓ Correct Answer: {MCQ_QUIZ_QUESTIONS[0].answer}</Text>
                <Text style={styles.mcqExplanationBody}>{MCQ_QUIZ_QUESTIONS[0].explanation}</Text>
              </View>
            )}
          </View>
        )}
      </ScrollView>
    );
  };

  // -------------------------------------------------------------
  // SCREEN 5: LEARNING ROADMAP TAB
  // -------------------------------------------------------------
  const renderRoadmap = () => (
    <ScrollView style={styles.dashboardContainer} contentContainerStyle={{ paddingBottom: 100 }}>
      <View style={styles.dashHeader}>
        <View style={styles.dashBrandRow}>
          <Text style={styles.dashBrandTitle}>CODE QUEST</Text>
        </View>
        <Text style={{ fontSize: 16 }}>🔔</Text>
      </View>

      {/* Active Track Banner */}
      <View style={styles.activeTrackBanner}>
        <Text style={styles.activeTrackTag}>🧭 ACTIVE TRACK</Text>
        <Text style={styles.activeTrackTitle}>Current Track: {targetRole} Placement</Text>
        <View style={styles.overallProgressBar}>
          <View style={[styles.overallProgressFill, { width: '68%' }]} />
        </View>
      </View>

      {/* Module 1: Frontend Foundations (Completed) */}
      <View style={styles.moduleCardCompleted}>
        <Text style={{ color: '#34d399', fontSize: 18, marginRight: 12 }}>✓</Text>
        <View style={{ flex: 1 }}>
          <Text style={styles.moduleTitle}>Frontend Foundations</Text>
          <Text style={styles.moduleSubtitle}>HTML, CSS, DOM Manipulation</Text>
        </View>
        <View style={styles.pillGreen}>
          <Text style={styles.pillGreenText}>100%</Text>
        </View>
      </View>

      {/* Module 2: SQL Mastery (Interactive) */}
      <View style={styles.moduleCardActive}>
        <TouchableOpacity 
          style={styles.moduleHeaderRow} 
          onPress={() => setSqlModuleExpanded(!sqlModuleExpanded)}
        >
          <Text style={{ fontSize: 18, marginRight: 12 }}>🗄️</Text>
          <View style={{ flex: 1 }}>
            <Text style={styles.moduleTitle}>SQL & Database Mastery</Text>
            <Text style={styles.moduleSubtitle}>Joins, Subqueries, Window Functions</Text>
          </View>
          <Text style={{ color: '#60a5fa', fontWeight: 'bold' }}>{sqlModuleExpanded ? '▲' : '▼'}</Text>
        </TouchableOpacity>

        {sqlModuleExpanded && (
          <View style={styles.subtopicsList}>
            {[
              { name: 'SQL Joins & Group By', xp: '+20 XP', done: true },
              { name: 'Aggregations & Subqueries', xp: '+30 XP', done: true },
              { name: 'Window Functions & Indexes', xp: '+40 XP', done: false }
            ].map(sub => (
              <View key={sub.name} style={styles.subtopicItem}>
                <Text style={{ color: sub.done ? '#34d399' : '#94a3b8', marginRight: 10 }}>{sub.done ? '✓' : '○'}</Text>
                <Text style={styles.subtopicName}>{sub.name}</Text>
                <TouchableOpacity 
                  style={styles.startSubtopicBtn}
                  onPress={() => {
                    setActiveTab('Arena');
                    setArenaMode('sql');
                  }}
                >
                  <Text style={styles.startSubtopicBtnText}>START</Text>
                </TouchableOpacity>
              </View>
            ))}
          </View>
        )}
      </View>
    </ScrollView>
  );

  // -------------------------------------------------------------
  // SCREEN 6: PROFILE & AI RESUME ATS SCANNER TAB (Exact UI Match)
  // -------------------------------------------------------------
  const renderProfile = () => (
    <ScrollView style={styles.dashboardContainer} contentContainerStyle={{ paddingBottom: 100 }}>
      {/* Profile Hero Card */}
      <View style={styles.profileHeroCard}>
        <View style={styles.profileAvatarGlow}>
          <Image 
            source={require('./assets/icon.png')} 
            style={styles.profileAvatarImage}
          />
        </View>
        <Text style={styles.profileNameTitle}>{userName}</Text>
        <Text style={styles.profileRoleMono}>Target Role: {targetRole}</Text>
        <View style={styles.profileBadgesRow}>
          <View style={styles.badgePillPurple}>
            <Text style={styles.badgePillPurpleText}>🛡️ {userSkills[0] || 'Code'} Ninja</Text>
          </View>
          <View style={styles.badgePillOrange}>
            <Text style={styles.badgePillOrangeText}>🔥 {streak}-Day Streak</Text>
          </View>
        </View>
      </View>

      {/* AI Resume ATS Scanner Card */}
      <View style={styles.atsScannerCard}>
        <Text style={styles.atsCardHeader}>AI Resume ATS Scanner</Text>
        <TouchableOpacity 
          style={styles.uploadedFileBox}
          onPress={() => setShowResumeModal(true)}
          activeOpacity={0.85}
        >
          <Text style={styles.uploadedFileLabel}>Uploaded File</Text>
          <View style={styles.uploadedFileNameRow}>
            <Text style={styles.uploadedFileNameText}>{resumeFileName}</Text>
            <Text style={{ fontSize: 16 }}>📄</Text>
          </View>
        </TouchableOpacity>
      </View>

      {/* Analysis Results Card */}
      <View style={styles.analysisResultsCard}>
        <Text style={styles.analysisCardHeader}>Analysis Results</Text>
        <Text style={styles.atsScoreSubtitle}>ATS MATCH SCORE</Text>
        <Text style={styles.atsScoreLarge}>
          {resumeAnalysisResult.score}<Text style={styles.atsScoreSmall}>/100</Text>
        </Text>
        
        {/* Score Progress Bar */}
        <View style={styles.atsProgressBar}>
          <View style={[styles.atsProgressFill, { width: `${resumeAnalysisResult.score}%` }]} />
        </View>
        <Text style={styles.veryGoodLabel}>VERY GOOD · 87%</Text>

        {/* Skills Match Section */}
        <Text style={styles.atsSkillsHeading}>SKILLS MATCH</Text>
        <View style={styles.skillsTagRow}>
          {resumeAnalysisResult.matchedSkills.map(skill => (
            <View key={skill} style={styles.skillTagMatched}>
              <Text style={styles.skillTagMatchedText}>{skill}</Text>
            </View>
          ))}
        </View>

        {/* Missing Keywords Section */}
        <Text style={styles.atsSkillsHeading}>MISSING KEYWORDS</Text>
        <View style={styles.skillsTagRow}>
          {resumeAnalysisResult.missingSkills.map(skill => (
            <View key={skill} style={styles.skillTagMissing}>
              <Text style={styles.skillTagMissingText}>{skill}</Text>
            </View>
          ))}
        </View>
      </View>

      {/* Log Out Button */}
      <TouchableOpacity 
        style={styles.logoutButton}
        onPress={() => {
          setIsLoggedIn(false);
          setCurrentScreen('auth');
        }}
      >
        <Text style={styles.logoutButtonText}>Log Out</Text>
      </TouchableOpacity>

      {/* Resume Selector Modal */}
      <Modal
        visible={showResumeModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowResumeModal(false)}
      >
        <View style={styles.modalBackdrop}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeaderRow}>
              <Text style={styles.modalTitle}>Select Resume Document</Text>
              <TouchableOpacity onPress={() => setShowResumeModal(false)}>
                <Text style={{ color: '#94a3b8', fontSize: 16, fontWeight: 'bold' }}>✕</Text>
              </TouchableOpacity>
            </View>
            {['Alex_Resume_2026.pdf', 'Software_Engineer_CV.pdf', 'Data_Engineer_Resume.docx'].map(doc => (
              <TouchableOpacity
                key={doc}
                style={styles.modalDocItem}
                onPress={() => pickResume(doc)}
              >
                <Text style={{ fontSize: 20, marginRight: 10 }}>📄</Text>
                <Text style={{ color: '#ffffff', flex: 1, fontSize: 13, fontWeight: '700' }}>{doc}</Text>
                <Text style={{ color: '#38bdf8', fontWeight: 'bold', fontSize: 12 }}>SELECT</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </Modal>
    </ScrollView>
  );

  // Main Container with Bottom Tab Bar
  return (
    <SafeAreaView style={styles.mainAppWrapper}>
      <StatusBar barStyle="light-content" backgroundColor="#060913" />

      {activeTab === 'Dashboard' && renderDashboard()}
      {activeTab === 'Arena' && renderArena()}
      {activeTab === 'Roadmap' && renderRoadmap()}
      {activeTab === 'Profile' && renderProfile()}

      {/* Bottom Navigation Bar */}
      <View style={styles.bottomNavBar}>
        {[
          { id: 'Dashboard', label: 'Dashboard', icon: '📊' },
          { id: 'Arena', label: 'Arena', icon: '⚔️' },
          { id: 'Roadmap', label: 'Roadmap', icon: '🗺️' },
          { id: 'Profile', label: 'Profile', icon: '👤' }
        ].map(tab => {
          const active = activeTab === tab.id;
          return (
            <TouchableOpacity
              key={tab.id}
              style={styles.navTabItem}
              onPress={() => setActiveTab(tab.id as any)}
            >
              <Text style={[styles.navTabIcon, active && styles.navTabIconActive]}>{tab.icon}</Text>
              <Text style={[styles.navTabLabel, active && styles.navTabLabelActive]}>{tab.label}</Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </SafeAreaView>
  );
}

// -------------------------------------------------------------
// STYLESHEET (Unified Modern Coder Theme)
// -------------------------------------------------------------
const styles = StyleSheet.create({
  mainAppWrapper: {
    flex: 1,
    backgroundColor: '#060913',
  },
  dashboardContainer: {
    flex: 1,
    backgroundColor: '#060913',
    paddingHorizontal: 18,
    paddingTop: 10,
  },

  // AUTH SCREEN
  authContainer: {
    flex: 1,
    backgroundColor: '#060913',
  },
  authScroll: {
    paddingHorizontal: 20,
    paddingVertical: 36,
    justifyContent: 'center',
    minHeight: '100%',
  },
  authCard: {
    backgroundColor: '#0d1326',
    borderRadius: 24,
    paddingHorizontal: 22,
    paddingVertical: 32,
    borderWidth: 1,
    borderColor: '#1e293b',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.5,
    shadowRadius: 20,
    elevation: 8,
  },
  authLogoBox: {
    width: 72,
    height: 72,
    borderRadius: 18,
    backgroundColor: '#101735',
    borderWidth: 1,
    borderColor: '#243260',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 18,
    overflow: 'hidden',
  },
  authLogoImage: {
    width: '100%',
    height: '100%',
  },
  authTitle: {
    fontSize: 24,
    fontWeight: '900',
    color: '#ffffff',
    letterSpacing: 1.5,
    marginBottom: 8,
  },
  authSubtitle: {
    fontSize: 12,
    color: '#94a3b8',
    textAlign: 'center',
    lineHeight: 18,
    marginBottom: 24,
  },
  errorText: {
    color: '#ef4444',
    fontSize: 12,
    marginBottom: 12,
  },
  inputGroup: {
    width: '100%',
    marginBottom: 18,
  },
  cyberInput: {
    width: '100%',
    backgroundColor: '#080d1e',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#192340',
    color: '#ffffff',
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 13,
    fontFamily: 'monospace',
    marginBottom: 12,
  },
  forgotPasswordRow: {
    alignSelf: 'flex-end',
    marginTop: 2,
  },
  forgotPasswordText: {
    color: '#60a5fa',
    fontSize: 11,
    fontFamily: 'monospace',
    fontWeight: '600',
  },
  gradientLoginButton: {
    width: '100%',
    backgroundColor: '#5b82ff',
    borderRadius: 12,
    paddingVertical: 15,
    alignItems: 'center',
    marginBottom: 14,
  },
  gradientLoginButtonText: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '800',
  },
  orDividerRow: {
    alignItems: 'center',
    width: '100%',
    marginVertical: 12,
  },
  orDividerText: {
    color: '#64748b',
    fontSize: 10,
    fontFamily: 'monospace',
    fontWeight: '900',
    letterSpacing: 1,
  },
  googleAuthButton: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#13192f',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#1e2748',
    paddingVertical: 14,
    marginBottom: 16,
  },
  googleGLogo: {
    fontSize: 16,
    fontWeight: '900',
    color: '#ea4335',
    marginRight: 10,
  },
  googleAuthButtonText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '700',
  },
  guestModeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    paddingTop: 14,
    borderTopWidth: 1,
    borderTopColor: '#17203a',
  },
  guestModeText: {
    color: '#94a3b8',
    fontSize: 13,
    fontWeight: '600',
  },

  // ONBOARDING SCREEN
  onboardContainer: {
    flex: 1,
    backgroundColor: '#060913',
  },
  onboardScroll: {
    paddingHorizontal: 20,
    paddingVertical: 30,
  },
  onboardMainTitle: {
    fontSize: 24,
    fontWeight: '900',
    color: '#38bdf8',
    letterSpacing: 1.5,
    textAlign: 'center',
    marginBottom: 6,
  },
  onboardSubDesc: {
    fontSize: 12,
    color: '#94a3b8',
    textAlign: 'center',
    lineHeight: 18,
    marginBottom: 20,
  },
  phaseRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
    borderBottomColor: '#1e293b',
    marginBottom: 20,
  },
  phaseItem: {
    paddingVertical: 8,
    paddingHorizontal: 6,
  },
  phaseItemActive: {
    paddingVertical: 8,
    paddingHorizontal: 6,
    borderBottomWidth: 2,
    borderBottomColor: '#38bdf8',
  },
  phaseText: {
    color: '#64748b',
    fontSize: 11,
    fontWeight: '700',
  },
  phaseTextActive: {
    color: '#38bdf8',
    fontSize: 11,
    fontWeight: '800',
  },
  phaseActiveBar: {},
  roleGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 14,
  },
  roleCard: {
    width: '48%',
    backgroundColor: '#0d1326',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#1e293b',
    padding: 16,
    alignItems: 'center',
    marginBottom: 12,
  },
  roleCardSelected: {
    borderColor: '#38bdf8',
    backgroundColor: '#101b38',
  },
  roleCardTitle: {
    color: '#94a3b8',
    fontSize: 11,
    fontWeight: '800',
    textAlign: 'center',
    letterSpacing: 0.5,
  },
  roleCardTitleSelected: {
    color: '#ffffff',
  },
  customRoleTextInput: {
    backgroundColor: '#0d1326',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#1e293b',
    color: '#ffffff',
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 12,
    marginBottom: 16,
  },
  sectionHeaderTitle: {
    color: '#94a3b8',
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 1,
    marginBottom: 10,
  },
  skillsTagRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 14,
  },
  skillChip: {
    backgroundColor: '#0d1326',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#1e293b',
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  skillChipSelected: {
    borderColor: '#38bdf8',
    backgroundColor: '#101b38',
  },
  skillChipText: {
    color: '#94a3b8',
    fontSize: 11,
    fontWeight: '700',
  },
  skillChipTextSelected: {
    color: '#38bdf8',
  },
  addSkillRow: {
    flexDirection: 'row',
    marginBottom: 24,
    gap: 8,
  },
  addSkillInput: {
    flex: 1,
    backgroundColor: '#0d1326',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#1e293b',
    color: '#ffffff',
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 12,
  },
  addSkillBtn: {
    backgroundColor: '#1e293b',
    borderRadius: 10,
    paddingHorizontal: 16,
    justifyContent: 'center',
  },
  addSkillBtnText: {
    color: '#38bdf8',
    fontSize: 11,
    fontWeight: '800',
  },
  launchRoadmapCta: {
    backgroundColor: '#38bdf8',
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: 'center',
    shadowColor: '#38bdf8',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 10,
    elevation: 6,
  },
  launchRoadmapCtaText: {
    color: '#060913',
    fontSize: 13,
    fontWeight: '900',
    letterSpacing: 0.5,
  },

  // DASHBOARD TAB
  dashHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 14,
  },
  dashBrandRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  brandBracket: {
    color: '#38bdf8',
    fontSize: 18,
    fontWeight: '900',
  },
  brandIconText: {
    color: '#a855f7',
    fontSize: 14,
    fontWeight: '900',
    marginHorizontal: 2,
  },
  dashBrandTitle: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '900',
    marginLeft: 8,
    letterSpacing: 1,
  },
  readinessHeroCard: {
    backgroundColor: '#0d1326',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#1e293b',
    paddingVertical: 20,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  readinessLeftStat: {
    alignItems: 'center',
  },
  readinessLeftTitle: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: '900',
  },
  readinessLeftSub: {
    color: '#64748b',
    fontSize: 9,
    fontWeight: '800',
  },
  circularGaugeBox: {
    width: 110,
    height: 110,
    borderRadius: 55,
    borderWidth: 4,
    borderColor: '#38bdf8',
    justifyContent: 'center',
    alignItems: 'center',
  },
  gaugePercentLarge: {
    color: '#ffffff',
    fontSize: 24,
    fontWeight: '900',
  },
  gaugeLabel: {
    color: '#94a3b8',
    fontSize: 8,
    fontWeight: '800',
    textAlign: 'center',
  },
  readinessRightStat: {
    alignItems: 'center',
  },
  readinessRightTitle: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: '900',
  },
  sectionHeadingText: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: '900',
    letterSpacing: 0.5,
    marginBottom: 12,
  },
  questsList: {
    marginBottom: 20,
  },
  questCard: {
    backgroundColor: '#0d1326',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#1e293b',
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  questCheckbox: {
    width: 24,
    height: 24,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#1e293b',
    backgroundColor: '#080d1e',
    justifyContent: 'center',
    alignItems: 'center',
  },
  questCheckboxActive: {
    backgroundColor: '#34d399',
    borderColor: '#34d399',
  },
  questCardTitle: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '700',
    marginBottom: 6,
  },
  questProgressBar: {
    width: '100%',
    height: 4,
    backgroundColor: '#1e293b',
    borderRadius: 2,
    overflow: 'hidden',
  },
  questProgressFill: {
    height: '100%',
    backgroundColor: '#34d399',
  },
  questXpBadge: {
    color: '#34d399',
    fontSize: 11,
    fontWeight: '800',
  },
  streakCard: {
    backgroundColor: '#0d1326',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#1e293b',
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  streakLeftFlame: {
    alignItems: 'center',
    paddingRight: 16,
    borderRightWidth: 1,
    borderRightColor: '#1e293b',
  },
  streakFlameTitle: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '900',
  },
  streakFlameSub: {
    color: '#f97316',
    fontSize: 9,
    fontWeight: '800',
  },
  streakDaysRow: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingLeft: 10,
  },
  streakDayCol: {
    alignItems: 'center',
  },
  streakDayLetter: {
    color: '#94a3b8',
    fontSize: 10,
    fontWeight: '800',
    marginBottom: 6,
  },
  streakDot: {
    width: 14,
    height: 14,
    borderRadius: 7,
  },
  streakDotActive: {
    backgroundColor: '#38bdf8',
  },
  streakDotInactive: {
    backgroundColor: '#1e293b',
  },

  // ARENA TAB
  problemHeaderCard: {
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
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '900',
  },
  difficultyBadgeGreen: {
    backgroundColor: 'rgba(52, 211, 153, 0.15)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#34d399',
  },
  difficultyBadgeGreenText: {
    color: '#34d399',
    fontSize: 10,
    fontWeight: '900',
  },
  companyPillRow: {
    flexDirection: 'row',
    gap: 6,
  },
  companyPill: {
    backgroundColor: '#131c38',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  companyPillText: {
    color: '#94a3b8',
    fontSize: 9,
    fontWeight: '800',
  },
  arenaModeSwitcherBox: {
    flexDirection: 'row',
    backgroundColor: '#0d1326',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#1e293b',
    padding: 4,
    marginBottom: 12,
  },
  arenaModeSegment: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    borderRadius: 8,
  },
  arenaModeSegmentActive: {
    backgroundColor: '#1e293b',
  },
  arenaModeSegmentText: {
    color: '#94a3b8',
    fontSize: 12,
    fontWeight: '800',
  },
  arenaModeSegmentTextActive: {
    color: '#ffffff',
  },
  arenaDescCard: {
    backgroundColor: '#0d1326',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#1e293b',
    padding: 16,
    marginBottom: 12,
  },
  arenaDescText: {
    color: '#94a3b8',
    fontSize: 12,
    lineHeight: 18,
    marginBottom: 12,
  },
  exampleBlock: {
    backgroundColor: '#080d1e',
    borderRadius: 10,
    padding: 10,
  },
  exampleBold: {
    color: '#ffffff',
    fontSize: 11,
    fontWeight: '800',
    marginBottom: 4,
  },
  exampleBlue: {
    color: '#60a5fa',
    fontSize: 11,
    fontFamily: 'monospace',
  },
  codeEditorBox: {
    backgroundColor: '#0d1326',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#1e293b',
    padding: 16,
    marginBottom: 20,
  },
  codeEditorTopBar: {
    marginBottom: 8,
  },
  codeFileName: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '800',
  },
  codeTextInput: {
    backgroundColor: '#080d1e',
    borderRadius: 10,
    color: '#e2e8f0',
    fontFamily: 'monospace',
    fontSize: 12,
    padding: 12,
    minHeight: 160,
    textAlignVertical: 'top',
  },
  executionResultBar: {
    marginVertical: 10,
  },
  executionResultText: {
    color: '#34d399',
    fontSize: 11,
    fontFamily: 'monospace',
  },
  editorActionButtonsRow: {
    flexDirection: 'row',
    gap: 10,
  },
  runCodeBtn: {
    flex: 1,
    backgroundColor: '#131c38',
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#1e293b',
  },
  runCodeBtnText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '800',
  },
  submitCodeBtn: {
    flex: 1,
    backgroundColor: '#38bdf8',
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: 'center',
  },
  submitCodeBtnText: {
    color: '#060913',
    fontSize: 12,
    fontWeight: '900',
  },
  mcqQuestionTitle: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: '800',
    marginBottom: 14,
  },
  mcqOptionItem: {
    backgroundColor: '#080d1e',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#1e293b',
    padding: 12,
    marginBottom: 8,
  },
  mcqOptionItemSelected: {
    borderColor: '#38bdf8',
  },
  mcqOptionItemText: {
    color: '#94a3b8',
    fontSize: 12,
  },
  mcqOptionItemTextSelected: {
    color: '#38bdf8',
    fontWeight: '700',
  },
  mcqExplanationCard: {
    backgroundColor: '#080d1e',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'rgba(52, 211, 153, 0.3)',
    padding: 12,
    marginTop: 10,
  },
  mcqExplanationTitle: {
    color: '#34d399',
    fontSize: 12,
    fontWeight: '800',
    marginBottom: 4,
  },
  mcqExplanationBody: {
    color: '#94a3b8',
    fontSize: 11,
    lineHeight: 16,
  },

  // ROADMAP TAB
  activeTrackBanner: {
    backgroundColor: '#0d1326',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#1e293b',
    padding: 16,
    marginBottom: 16,
  },
  activeTrackTag: {
    color: '#38bdf8',
    fontSize: 10,
    fontWeight: '900',
    marginBottom: 4,
  },
  activeTrackTitle: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '900',
    marginBottom: 10,
  },
  overallProgressBar: {
    width: '100%',
    height: 6,
    backgroundColor: '#1e293b',
    borderRadius: 3,
    overflow: 'hidden',
  },
  overallProgressFill: {
    height: '100%',
    backgroundColor: '#a855f7',
  },
  moduleCardCompleted: {
    backgroundColor: '#0d1326',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#1e293b',
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  moduleTitle: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: '800',
  },
  moduleSubtitle: {
    color: '#64748b',
    fontSize: 10,
    marginTop: 2,
  },
  pillGreen: {
    backgroundColor: 'rgba(52, 211, 153, 0.15)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  pillGreenText: {
    color: '#34d399',
    fontSize: 10,
    fontWeight: '900',
  },
  moduleCardActive: {
    backgroundColor: '#0d1326',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#1e293b',
    padding: 14,
    marginBottom: 10,
  },
  moduleHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  subtopicsList: {
    marginTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#1e293b',
    paddingTop: 10,
  },
  subtopicItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
  },
  subtopicName: {
    color: '#ffffff',
    fontSize: 12,
    flex: 1,
  },
  startSubtopicBtn: {
    backgroundColor: '#1e293b',
    borderRadius: 6,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  startSubtopicBtnText: {
    color: '#38bdf8',
    fontSize: 10,
    fontWeight: '800',
  },

  // PROFILE & ATS SCANNER TAB
  profileHeroCard: {
    backgroundColor: '#0d1326',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#1e293b',
    padding: 20,
    alignItems: 'center',
    marginBottom: 16,
  },
  profileAvatarGlow: {
    width: 72,
    height: 72,
    borderRadius: 36,
    borderWidth: 2,
    borderColor: '#38bdf8',
    overflow: 'hidden',
    marginBottom: 12,
  },
  profileAvatarImage: {
    width: '100%',
    height: '100%',
  },
  profileNameTitle: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '900',
    marginBottom: 4,
  },
  profileRoleMono: {
    color: '#94a3b8',
    fontSize: 12,
    fontFamily: 'monospace',
    marginBottom: 12,
  },
  profileBadgesRow: {
    flexDirection: 'row',
    gap: 8,
  },
  badgePillPurple: {
    backgroundColor: '#1a1836',
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#a855f7',
  },
  badgePillPurpleText: {
    color: '#c084fc',
    fontSize: 11,
    fontWeight: '700',
  },
  badgePillOrange: {
    backgroundColor: '#261914',
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#f97316',
  },
  badgePillOrangeText: {
    color: '#fb923c',
    fontSize: 11,
    fontWeight: '700',
  },
  atsScannerCard: {
    backgroundColor: '#0d1326',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#1e293b',
    padding: 16,
    marginBottom: 14,
  },
  atsCardHeader: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '900',
    marginBottom: 12,
  },
  uploadedFileBox: {
    backgroundColor: '#080d1e',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#1e293b',
    padding: 14,
  },
  uploadedFileLabel: {
    color: '#64748b',
    fontSize: 10,
    fontWeight: '800',
    marginBottom: 4,
  },
  uploadedFileNameRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  uploadedFileNameText: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: '800',
  },
  analysisResultsCard: {
    backgroundColor: '#0d1326',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#1e293b',
    padding: 16,
    marginBottom: 16,
  },
  analysisCardHeader: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '900',
    marginBottom: 4,
  },
  atsScoreSubtitle: {
    color: '#64748b',
    fontSize: 10,
    fontWeight: '800',
    marginBottom: 2,
  },
  atsScoreLarge: {
    color: '#34d399',
    fontSize: 32,
    fontWeight: '900',
    marginBottom: 8,
  },
  atsScoreSmall: {
    fontSize: 16,
    color: '#94a3b8',
  },
  atsProgressBar: {
    width: '100%',
    height: 6,
    backgroundColor: '#1e293b',
    borderRadius: 3,
    overflow: 'hidden',
    marginBottom: 6,
  },
  atsProgressFill: {
    height: '100%',
    backgroundColor: '#34d399',
  },
  veryGoodLabel: {
    color: '#34d399',
    fontSize: 10,
    fontWeight: '800',
    marginBottom: 14,
  },
  atsSkillsHeading: {
    color: '#94a3b8',
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 0.5,
    marginBottom: 8,
  },
  skillTagMatched: {
    backgroundColor: '#0d221c',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#34d399',
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  skillTagMatchedText: {
    color: '#34d399',
    fontSize: 11,
    fontWeight: '700',
  },
  skillTagMissing: {
    backgroundColor: '#281318',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#f43f5e',
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  skillTagMissingText: {
    color: '#f43f5e',
    fontSize: 11,
    fontWeight: '700',
  },
  logoutButton: {
    backgroundColor: '#131c38',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#1e293b',
    marginBottom: 30,
  },
  logoutButtonText: {
    color: '#f43f5e',
    fontSize: 13,
    fontWeight: '800',
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.75)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#0d1326',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#1e293b',
  },
  modalHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  modalTitle: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '900',
  },
  modalDocItem: {
    backgroundColor: '#080d1e',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#1e293b',
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },

  // BOTTOM NAVIGATION BAR
  bottomNavBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 68,
    backgroundColor: '#090e21',
    borderTopWidth: 1,
    borderTopColor: '#192340',
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingBottom: 8,
  },
  navTabItem: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 12,
  },
  navTabIcon: {
    fontSize: 18,
    marginBottom: 2,
    opacity: 0.6,
  },
  navTabIconActive: {
    opacity: 1,
  },
  navTabLabel: {
    color: '#64748b',
    fontSize: 10,
    fontWeight: '700',
  },
  navTabLabelActive: {
    color: '#38bdf8',
    fontWeight: '800',
  },
});
