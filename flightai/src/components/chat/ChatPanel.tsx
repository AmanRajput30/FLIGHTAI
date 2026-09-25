"use client";

import { useState, useRef, useEffect } from 'react';
import { Send, AlertCircle, Plane, Crosshair, X, Minimize2, Maximize2, MessageSquare } from 'lucide-react';
import { cn } from '@/lib/utils';
import { socket } from '@/lib/socket';
import { useAuth } from '@/context/AuthContext';
import { useChatStore } from '@/store/useChatStore';
import { useFlightStore } from '@/store/useFlightStore';
import { chatApi, userApi } from '@/lib/api';
import { ChatMessage } from '@/types';
import { motion, AnimatePresence } from 'framer-motion';
import { timing, easing } from '@/lib/motion/presets';
import { CommandPanel } from '../ui/CommandPanel';
import { PanelHeader } from '../ui/PanelHeader';

export default function ChatPanel() {
  const { user, loading: authLoading } = useAuth();
  const { messages, inputValue, loading, panelState, hasUnread, setMessages, setInputValue, setLoading, addMessage, setPanelState } = useChatStore();
  const { selectedFlight, focusedFlightId, setFocusedFlightId, setSelectedFlight } = useFlightStore();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const [isResending, setIsResending] = useState(false);
  const [resendSuccess, setResendSuccess] = useState(false);
  const [resendError, setResendError] = useState<string | null>(null);
  const [anonCapped, setAnonCapped] = useState(false);
  const isMinimized = panelState === 'minimized';
  const isClosed = panelState === 'closed';

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (!isMinimized && !isClosed) {
      scrollToBottom();
    }
  }, [messages, isMinimized, isClosed, loading]);

  // Fetch history for authenticated user
  useEffect(() => {
    if (user && user.isEmailVerified) {
      const fetchHistory = async () => {
        try {
          const res = await chatApi.getHistory();
          if (res.messages && res.messages.length > 0) {
            setMessages(res.messages);
          }
        } catch (e) {
          console.error("Failed to load chat history", e);
        }
      };
      fetchHistory();
    }
  }, [user?._id, user?.isEmailVerified]);

  const handleSendMessage = async () => {
    if (!inputValue.trim()) return;
    if (user && !user.isEmailVerified) return;

    const userMessage: ChatMessage = { role: 'user', content: inputValue };
    addMessage(userMessage);
    setInputValue('');
    setLoading(true);

      // Simulate network delay for AI thinking
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      let aiResponse = "I am operating in offline mode. I can see you are looking at live telemetry data.";
      let refFlights: any[] = [];
      
      if (selectedFlight) {
        aiResponse = `I see you are tracking flight ${selectedFlight.callsign || selectedFlight.id}. It is currently at ${selectedFlight.altitude || 'an unknown'} feet, traveling at ${selectedFlight.speed || 0} knots.`;
        refFlights = [selectedFlight.id];
      } else {
        const flights = useFlightStore.getState().flights;
        if (flights.length > 0) {
          aiResponse = `I am currently tracking ${flights.length} active aircraft in this sector. For example, ${flights[0].callsign || flights[0].id} is airborne. Select any aircraft on the map for detailed telemetry!`;
          refFlights = [flights[0].id];
        }
      }

      addMessage({
        role: 'assistant',
        content: aiResponse,
        referencedFlights: refFlights
      });
      setLoading(false);
  };

  const handleResendVerification = async () => {
    if (isResending) return;
    setIsResending(true);
    setResendSuccess(false);
    setResendError(null);
    try {
      await userApi.resendVerification();
      setResendSuccess(true);
      setTimeout(() => setResendSuccess(false), 5000);
    } catch (err: any) {
      setResendError(err.response?.data?.error || "Failed to resend.");
      setTimeout(() => setResendError(null), 5000);
    } finally {
      setIsResending(false);
    }
  };

  if (isClosed) return null;

  return (
    <div className="w-full h-full pointer-events-auto flex flex-col justify-end items-end pb-0">
      <AnimatePresence initial={false} mode="wait">
        {panelState === 'open' ? (
          <motion.div 
            key="expanded"
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: timing.normal, ease: easing.decelerate }}
            className="w-full h-full flex flex-col"
          >
            <CommandPanel className="h-full">
              {/* Header */}
              <PanelHeader 
                title="AI Assistant" 
                subtitle={user?.username || user?.name?.split(' ')[0] || 'Guest'}
              />

              {/* Tracking Context Bar */}
              {focusedFlightId && selectedFlight && selectedFlight.id === focusedFlightId && (
                <div className="mx-4 mt-4 border border-aervyn-primary bg-aervyn-primary/10 p-2.5 rounded-lg flex items-center gap-3 shrink-0">
                  <div className="flex-1 min-w-0 pl-2 border-l-2 border-aervyn-primary">
                    <span className="text-xs text-aervyn-primary font-medium">Tracking</span>
                    <div className="font-semibold text-sm text-aervyn-text-dark-primary truncate leading-tight mt-0.5">{selectedFlight.callsign || selectedFlight.id}</div>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    <button onClick={() => setFocusedFlightId(selectedFlight.id)} className="p-1.5 bg-aervyn-primary/10 hover:bg-aervyn-primary/20 rounded-md text-aervyn-primary transition-colors">
                      <Crosshair size={14} strokeWidth={2} />
                    </button>
                    <button onClick={() => { setFocusedFlightId(null); setSelectedFlight(null); }} className="p-1.5 bg-aervyn-status-error/10 hover:bg-aervyn-status-error/20 rounded-md text-aervyn-status-error transition-colors">
                      <X size={14} strokeWidth={2} />
                    </button>
                  </div>
                </div>
              )}
              
              {/* Chat Messages */}
              <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-4 no-scrollbar min-h-0">
                  {messages.length === 0 && (
                     <div className="flex-1 flex flex-col items-center justify-center text-center opacity-60 mt-4">
                        <MessageSquare className="w-6 h-6 mb-3 text-aervyn-text-dark-muted" />
                        <p className="text-xs text-aervyn-text-dark-muted font-medium">
                          How can I assist you with your fleet today?
                        </p>
                     </div>
                  )}
                  {messages.map((msg, idx) => (
                    <div key={idx} className={cn("flex flex-col gap-1 w-[90%]", msg.role === 'user' ? "self-end items-end" : "self-start")}>
                      <div className="text-xs text-aervyn-text-dark-muted font-medium">
                        {msg.role === 'user' ? 'You' : 'Aervyn Assistant'}
                      </div>
                      <div className={cn("text-sm p-3.5 rounded-lg leading-relaxed border shadow-sm", 
                        msg.role === 'user' 
                          ? "bg-aervyn-primary border-aervyn-primary text-white rounded-br-none" 
                          : msg.isError 
                            ? "bg-aervyn-status-error/10 border-aervyn-status-error/30 text-aervyn-status-error flex gap-2 items-start rounded-bl-none"
                            : "bg-aervyn-surface-dark-elevated border-aervyn-border-dark text-aervyn-text-dark-primary rounded-bl-none"
                      )}>
                        {msg.isError && <AlertCircle size={16} strokeWidth={2} className="mt-0.5 shrink-0" />}
                        <div className="whitespace-pre-wrap">{msg.content}</div>
                      </div>
                      {/* Flight Reference Badges */}
                      {msg.role === 'assistant' && msg.referencedFlights && msg.referencedFlights.length > 0 && (
                        <div className="flex flex-wrap gap-2 mt-1.5">
                          {msg.referencedFlights.map((ref, rIdx) => (
                            <button key={rIdx} onClick={() => setFocusedFlightId(ref)} className="flex items-center gap-1.5 text-xs font-medium bg-aervyn-surface-dark border border-aervyn-border-dark hover:border-aervyn-primary text-aervyn-text-dark-primary px-2.5 py-1.5 rounded-md transition-colors">
                              <Plane size={12} strokeWidth={2} className="text-aervyn-primary" />
                              {ref}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                  {loading && (
                    <div className="self-start text-sm p-3 rounded-lg rounded-bl-none bg-aervyn-surface-dark-elevated border border-aervyn-border-dark w-16 flex justify-center text-aervyn-text-dark-muted">
                      <span className="animate-pulse">...</span>
                    </div>
                  )}
                  <div ref={messagesEndRef} className="h-1 shrink-0" />
              </div>

              {/* Input Area */}
              <div className="p-4 bg-aervyn-surface-dark border-t border-aervyn-border-dark shrink-0">
                {authLoading ? (
                    <div className="h-10 flex items-center justify-center"><div className="w-5 h-5 rounded-full border-2 border-aervyn-border-dark border-t-aervyn-primary animate-spin"></div></div>
                ) : anonCapped ? (
                    <div className="flex flex-col items-center justify-center text-center p-4 rounded-lg bg-aervyn-status-error/10 border border-aervyn-status-error/30">
                        <p className="text-sm text-aervyn-status-error font-semibold mb-2">Free Limit Reached</p>
                        <a href="/register" className="w-full text-center bg-aervyn-primary text-white py-2 rounded-md text-sm font-medium transition-colors hover:bg-aervyn-primary-hover mb-2">
                          Sign up to keep chatting
                        </a>
                        <p className="text-xs text-aervyn-text-dark-muted">Unlock unlimited queries and saved tracking.</p>
                    </div>
                ) : (user && !user.isEmailVerified) ? (
                    <div className="flex flex-col items-center justify-center text-center p-4 rounded-lg bg-aervyn-status-warning/10 border border-aervyn-status-warning/30">
                        <p className="text-sm text-aervyn-status-warning font-semibold mb-2">Verification Required</p>
                        {resendSuccess ? (
                          <div className="text-xs text-aervyn-status-success font-medium py-1">Check your inbox for a new link!</div>
                        ) : (
                          <button 
                            onClick={handleResendVerification} 
                            disabled={isResending}
                            className="w-full bg-aervyn-surface-dark-elevated border border-aervyn-border-dark py-2 rounded-md text-sm font-medium transition-colors hover:border-aervyn-status-warning text-aervyn-text-dark-primary"
                          >
                            {isResending ? 'Sending...' : 'Resend Verification'}
                          </button>
                        )}
                        {resendError && <p className="text-xs text-aervyn-status-error mt-2">{resendError}</p>}
                    </div>
                ) : (
                    <div className="relative flex items-center h-12">
                      <input 
                        type="text" value={inputValue} onChange={e => setInputValue(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleSendMessage()}
                        placeholder="Type a message..."
                        className="w-full h-full bg-aervyn-bg-dark border border-aervyn-border-dark rounded-md px-4 pr-12 text-sm outline-none focus:border-aervyn-primary transition-colors placeholder:text-aervyn-text-dark-muted text-aervyn-text-dark-primary"
                      />
                      <div className="absolute right-1.5 flex items-center h-9">
                        <button onClick={handleSendMessage} className="h-full px-3.5 bg-aervyn-primary rounded-md hover:bg-aervyn-primary-hover text-white transition-colors flex items-center justify-center">
                          <Send size={14} strokeWidth={2} />
                        </button>
                      </div>
                    </div>
                )}
              </div>
            </CommandPanel>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
}
