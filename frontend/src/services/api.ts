import axios from 'axios';

export const API_BASE = (import.meta as any).env?.VITE_API_BASE_URL || '/api/v1';

export const apiClient = axios.create({
  baseURL: API_BASE,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Intercept requests to attach Bearer token
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('cq_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Intercept responses for auth expiry
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // Optional: Handle token refresh or redirect to login
    }
    return Promise.reject(error);
  }
);

export interface RandomPuzzleScenario {
  id: string;
  title: string;
  description: string;
  type: 'puzzle' | 'scenario';
  difficulty: string;
  category: string;
  xp_reward: number;
  hints: string[];
  solution?: string;
  company_tags: string[];
  options?: string[];
  sample_approach?: string;
}

export const getRandomPuzzleOrScenario = async (params?: {
  type?: 'puzzle' | 'scenario';
  difficulty?: string;
  category?: string;
}): Promise<RandomPuzzleScenario> => {
  const response = await apiClient.get<RandomPuzzleScenario>('/puzzles/random', { params });
  return response.data;
};

export const getRandomScenario = async (difficulty?: string): Promise<RandomPuzzleScenario> => {
  return getRandomPuzzleOrScenario({ type: 'scenario', difficulty });
};

export const getRandomPuzzle = async (difficulty?: string): Promise<RandomPuzzleScenario> => {
  return getRandomPuzzleOrScenario({ type: 'puzzle', difficulty });
};

