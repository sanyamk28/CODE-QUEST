export interface CodingProblem {
  id: string;
  title: string;
  difficulty: string;
  type: string;
  xp_reward: number;
  company_tags: string[];
  topic_name: string;
  subtopic_name: string;
  desc: string;
  input: string;
  output: string;
  template: string;
}

export interface SqlProblem {
  id: string;
  title: string;
  difficulty: string;
  company_tags: string[];
  schema: string;
  desc: string;
  defaultQuery: string;
}

export interface McqQuestion {
  id: string;
  topic: string;
  question: string;
  options: string[];
  answer: string;
  explanation: string;
}

export interface PuzzleQuestion {
  id: string;
  title: string;
  difficulty: string;
  category: string;
  desc: string;
  hints: string[];
  solution: string;
}

export interface StudentRecord {
  id: string;
  email: string;
  name: string;
  college: string;
  degree: string;
  target_role: string;
  xp: number;
  readiness_score: number;
  is_active: boolean;
  created_at: string;
  dsa_level: number;
  sql_level: number;
  cs_fundamentals_level: number;
  aptitude_level: number;
  submissions: any[];
  logins: any[];
}

export type ActiveTabType =
  | 'dashboard'
  | 'arena'
  | 'sql'
  | 'mcqs'
  | 'puzzles'
  | 'assessments'
  | 'battle'
  | 'interview'
  | 'resume'
  | 'roadmaps'
  | 'leaderboard';

export type AdminTabType =
  | 'overview'
  | 'students'
  | 'curriculum'
  | 'telemetry'
  | 'reports';
