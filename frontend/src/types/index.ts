export interface CodingProblem {
  id: string;
  title: string;
  difficulty: 'Easy' | 'Medium' | 'Hard' | string;
  type: string;
  xp_reward: number;
  company_tags: string[];
  topic_name: string;
  subtopic_name: string;
  desc: string;
  input: string;
  output: string;
  template: string;
  hint?: string;
  solution?: string;
  solutionExplanation?: string;
}

export interface SqlProblem {
  id: string;
  title: string;
  difficulty: 'Easy' | 'Medium' | 'Hard' | string;
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

export type ActiveTabType =
  | 'splash'
  | 'login'
  | 'dashboard'
  | 'practice'
  | 'company-intel'
  | 'arena'
  | 'sql'
  | 'mcqs'
  | 'puzzles'
  | 'battle'
  | 'interview'
  | 'resume'
  | 'roadmaps'
  | 'assessments'
  | 'leaderboard'
  | 'profile'
  | 'settings';
