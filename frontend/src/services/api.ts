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
      const url = error.config?.url || '';
      const method = (error.config?.method || 'get').toLowerCase();
      // Don't auto-logout for read-only problem browsing so fallback problems can display smoothly
      const isPublicBrowse = method === 'get' && url.includes('/problems');
      if (!isPublicBrowse && typeof window !== 'undefined') {
        window.dispatchEvent(new Event('cq_auth_expired'));
      }
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

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: string;
}

export interface ChatbotRequestPayload {
  message: string;
  history?: { role: string; content: string }[];
  screen?: string;
  target_role?: string;
  user_name?: string;
}

export interface ChatbotResponsePayload {
  reply: string;
  suggestions?: string[];
  screen_context?: string;
}

export const sendChatMessage = async (payload: ChatbotRequestPayload): Promise<ChatbotResponsePayload> => {
  const response = await apiClient.post<ChatbotResponsePayload>('/ai/chat', payload);
  return response.data;
};

