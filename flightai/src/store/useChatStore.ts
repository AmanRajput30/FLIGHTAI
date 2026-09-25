import { create } from 'zustand';
import { ChatMessage } from '../types';

export type ChatPanelState = 'closed' | 'minimized' | 'open';

interface ChatState {
  messages: ChatMessage[];
  inputValue: string;
  loading: boolean;
  panelState: ChatPanelState;
  hasUnread: boolean;
  
  setMessages: (messages: ChatMessage[] | ((prev: ChatMessage[]) => ChatMessage[])) => void;
  setInputValue: (value: string) => void;
  setLoading: (loading: boolean) => void;
  addMessage: (message: ChatMessage) => void;
  setPanelState: (state: ChatPanelState) => void;
  setHasUnread: (hasUnread: boolean) => void;
}

export const useChatStore = create<ChatState>((set) => ({
  messages: [
    { role: 'assistant', content: "Welcome to Aervyn Command Center. I'm SkyLord, your aviation intelligence assistant. What would you like to track?" }
  ],
  inputValue: '',
  loading: false,
  panelState: 'open',
  hasUnread: false,

  setMessages: (messages) => set((state) => ({ 
    messages: typeof messages === 'function' ? messages(state.messages) : messages 
  })),
  setInputValue: (value) => set({ inputValue: value }),
  setLoading: (loading) => set({ loading }),
  addMessage: (message) => set((state) => {
    // If adding an assistant message and we are minimized, trigger unread
    const isAssistant = message.role === 'assistant';
    const shouldUnread = isAssistant && state.panelState === 'minimized';
    return { 
      messages: [...state.messages, message],
      hasUnread: shouldUnread ? true : state.hasUnread
    };
  }),
  setPanelState: (panelState) => set((state) => ({ 
    panelState, 
    // Clear unread if we open it
    hasUnread: panelState === 'open' ? false : state.hasUnread 
  })),
  setHasUnread: (hasUnread) => set({ hasUnread }),
}));
