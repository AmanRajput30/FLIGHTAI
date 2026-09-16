import { create } from 'zustand';
import { ChatMessage } from '../types';

interface ChatState {
  messages: ChatMessage[];
  inputValue: string;
  loading: boolean;
  
  setMessages: (messages: ChatMessage[] | ((prev: ChatMessage[]) => ChatMessage[])) => void;
  setInputValue: (value: string) => void;
  setLoading: (loading: boolean) => void;
  addMessage: (message: ChatMessage) => void;
}

export const useChatStore = create<ChatState>((set) => ({
  messages: [
    { role: 'assistant', content: "Welcome to Averyn Command Center. I'm SkyLord, your aviation intelligence assistant. What would you like to track?" }
  ],
  inputValue: '',
  loading: false,

  setMessages: (messages) => set((state) => ({ 
    messages: typeof messages === 'function' ? messages(state.messages) : messages 
  })),
  setInputValue: (value) => set({ inputValue: value }),
  setLoading: (loading) => set({ loading }),
  addMessage: (message) => set((state) => ({ messages: [...state.messages, message] })),
}));
