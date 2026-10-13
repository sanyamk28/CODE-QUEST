/**
 * Centralized User Activity & Progress Tracker Service
 * Tracks real activities, solved problems, and dynamic percentages starting strictly from 0%.
 */

export interface UserActivityStats {
  arenaSolvedCount: number;
  sqlQueriesCount: number;
  mcqsAnsweredCount: number;
  puzzlesSolvedCount: number;
  battlesWonCount: number;
  interviewsDoneCount: number;
  roadmapStepsCount: number;
  assessmentsCount: number;
  totalXp: number;
  streak: number;
  lastActiveDate: string;
}

const DEFAULT_STATS: UserActivityStats = {
  arenaSolvedCount: 0,
  sqlQueriesCount: 0,
  mcqsAnsweredCount: 0,
  puzzlesSolvedCount: 0,
  battlesWonCount: 0,
  interviewsDoneCount: 0,
  roadmapStepsCount: 0,
  assessmentsCount: 0,
  totalXp: 0,
  streak: 1,
  lastActiveDate: new Date().toISOString().split('T')[0]
};

// Target denominators for percentage calculation
export const TARGET_GOALS = {
  arena: 50,      // 50 problems for 100% in initial target bracket
  sql: 30,        // 30 queries for 100%
  mcq: 40,        // 40 questions for 100%
  puzzle: 20,     // 20 puzzles for 100%
  battle: 10,     // 10 battles for 100%
  interview: 5,   // 5 mock interviews for 100%
  roadmap: 15     // 15 milestone steps for 100%
};

function getStorageKey(): string {
  const email = localStorage.getItem('cq_user_email') || localStorage.getItem('cq_user_name') || 'guest';
  return `cq_activity_stats_${email.toLowerCase().replace(/[^a-z0-9]/g, '_')}`;
}

export function getUserActivityStats(): UserActivityStats {
  try {
    const raw = localStorage.getItem(getStorageKey());
    if (raw) {
      return { ...DEFAULT_STATS, ...JSON.parse(raw) };
    }
  } catch (e) {
    console.error('Failed to load user activity stats:', e);
  }
  return { ...DEFAULT_STATS };
}

export function saveUserActivityStats(stats: UserActivityStats): void {
  try {
    localStorage.setItem(getStorageKey(), JSON.stringify(stats));
    // Trigger custom event so any active view updates its reactive stats in real-time
    window.dispatchEvent(new CustomEvent('cq_activity_updated', { detail: stats }));
  } catch (e) {
    console.error('Failed to save user activity stats:', e);
  }
}

export type ActivityType =
  | 'arena'
  | 'sql'
  | 'mcq'
  | 'puzzle'
  | 'battle'
  | 'interview'
  | 'roadmap'
  | 'assessment';

export function recordActivity(type: ActivityType, options?: { xp?: number; delta?: number }): UserActivityStats {
  const stats = getUserActivityStats();
  const delta = options?.delta ?? 1;
  const xp = options?.xp ?? 15;

  switch (type) {
    case 'arena':
      stats.arenaSolvedCount = Math.max(0, stats.arenaSolvedCount + delta);
      break;
    case 'sql':
      stats.sqlQueriesCount = Math.max(0, stats.sqlQueriesCount + delta);
      break;
    case 'mcq':
      stats.mcqsAnsweredCount = Math.max(0, stats.mcqsAnsweredCount + delta);
      break;
    case 'puzzle':
      stats.puzzlesSolvedCount = Math.max(0, stats.puzzlesSolvedCount + delta);
      break;
    case 'battle':
      stats.battlesWonCount = Math.max(0, stats.battlesWonCount + delta);
      break;
    case 'interview':
      stats.interviewsDoneCount = Math.max(0, stats.interviewsDoneCount + delta);
      break;
    case 'roadmap':
      stats.roadmapStepsCount = Math.max(0, stats.roadmapStepsCount + delta);
      break;
    case 'assessment':
      stats.assessmentsCount = Math.max(0, stats.assessmentsCount + delta);
      break;
  }

  stats.totalXp += xp;

  // Track daily streak
  const today = new Date().toISOString().split('T')[0];
  if (stats.lastActiveDate !== today) {
    stats.streak += 1;
    stats.lastActiveDate = today;
  }

  saveUserActivityStats(stats);
  return stats;
}

export function calculateProgressPercentages(stats: UserActivityStats) {
  const arenaPct = Math.min(100, Math.round((stats.arenaSolvedCount / TARGET_GOALS.arena) * 100));
  const sqlPct = Math.min(100, Math.round((stats.sqlQueriesCount / TARGET_GOALS.sql) * 100));
  const mcqPct = Math.min(100, Math.round((stats.mcqsAnsweredCount / TARGET_GOALS.mcq) * 100));
  const puzzlePct = Math.min(100, Math.round((stats.puzzlesSolvedCount / TARGET_GOALS.puzzle) * 100));
  const battlePct = Math.min(100, Math.round((stats.battlesWonCount / TARGET_GOALS.battle) * 100));
  const interviewPct = Math.min(100, Math.round((stats.interviewsDoneCount / TARGET_GOALS.interview) * 100));

  // Overall readiness starts at 0% and climbs as the candidate actually completes challenges
  const overallReadiness = Math.min(
    100,
    Math.round(
      arenaPct * 0.35 +
      sqlPct * 0.25 +
      mcqPct * 0.20 +
      puzzlePct * 0.10 +
      (stats.roadmapStepsCount > 0 ? Math.min(10, stats.roadmapStepsCount * 2) : 0)
    )
  );

  const level = Math.floor(stats.totalXp / 100) + 1;
  const totalSolved = stats.arenaSolvedCount + stats.sqlQueriesCount + stats.mcqsAnsweredCount + stats.puzzlesSolvedCount;

  return {
    arenaPct,
    sqlPct,
    mcqPct,
    puzzlePct,
    battlePct,
    interviewPct,
    overallReadiness,
    level,
    totalSolved
  };
}
