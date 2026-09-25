import axios from 'axios';
import { ChatMessage, Flight } from '../../types';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

axios.defaults.withCredentials = true;

export const flightApi = {
  getSearch: async (query: string, options?: { signal?: AbortSignal }): Promise<unknown> => {
    const response = await axios.get(`${API_URL}/api/search/${encodeURIComponent(query)}`, {
      signal: options?.signal
    });
    return response.data;
  },

  getFlightPath: async (flightId: string): Promise<[number, number][]> => {
    const response = await axios.get(`${API_URL}/api/flight-path/${flightId}`);
    if (response.data && response.data.path) {
      return response.data.path.map((pt: number[]) => [pt[1], pt[2]]);
    }
    return [];
  },
};

const getAnonId = () => {
  if (typeof window === 'undefined') return '';
  let id = localStorage.getItem('anon_id');
  if (!id) {
    if (typeof crypto !== 'undefined' && crypto.randomUUID) {
      id = crypto.randomUUID();
    } else {
      id = Math.random().toString(36).substring(2, 15) + Date.now().toString(36);
    }
    localStorage.setItem('anon_id', id);
  }
  return id;
};

export const chatApi = {
  sendMessage: async (messages: ChatMessage[], flightId: string | null, socketId?: string): Promise<unknown> => {
    const response = await axios.post(`${API_URL}/api/chat`, {
      messages,
      flightId: flightId || undefined,
      socketId
    }, {
      headers: { 'x-anon-id': getAnonId() }
    });
    return response.data;
  },
  getHistory: async (): Promise<{ messages: ChatMessage[] }> => {
    // Return empty history mock to prevent axios crash since backend is missing
    return { messages: [] };
  }
};

export const userApi = {
  resendVerification: async (): Promise<void> => {
    await axios.post(`${API_URL}/api/auth/resend-verification`);
  },
  updateProfile: async (data: { name?: string, role?: string, bio?: string }): Promise<void> => {
    await axios.patch(`${API_URL}/api/user/profile`, data);
  },
  updatePassword: async (data: { currentPassword?: string, newPassword?: string }): Promise<void> => {
    await axios.patch(`${API_URL}/api/user/password`, data);
  }
};
