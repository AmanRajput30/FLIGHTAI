import axios from 'axios';
import { ChatMessage, Flight } from '../../types';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://flightai-hxbd.onrender.com';

export const flightApi = {
  getSearch: async (query: string): Promise<unknown> => {
    const response = await axios.get(`${API_URL}/api/search/${encodeURIComponent(query)}`);
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

export const chatApi = {
  sendMessage: async (messages: ChatMessage[], flightContext: Flight | null): Promise<unknown> => {
    const response = await axios.post(`${API_URL}/api/chat`, {
      messages,
      flightContext: flightContext || undefined
    });
    return response.data;
  },
};

export const userApi = {
  resendVerification: async (): Promise<void> => {
    await axios.post(`${API_URL}/api/auth/resend-verification`);
  },
};
