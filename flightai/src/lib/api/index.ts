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
    id = Math.random().toString(36).substring(2, 15);
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
    const response = await axios.get(`${API_URL}/api/chat/history`);
    return response.data;
  }
};

export const userApi = {
  resendVerification: async (): Promise<void> => {
    await axios.post(`${API_URL}/api/auth/resend-verification`);
  },
};
