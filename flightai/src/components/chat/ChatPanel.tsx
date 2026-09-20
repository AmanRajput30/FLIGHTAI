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

    try {
      const data: any = await chatApi.sendMessage([...messages, userMessage], selectedFlight ? selectedFlight.id : null, socket?.id);
      addMessage({
        role: 'assistant',
        content: data.content,
        referencedFlights: data.referencedFlights
      });
    } catch (error: any) {
      console.error(error);
      const errCode = error.response?.data?.error;
      const errMsg = error.response?.data?.message || "Error communicating with SkyLord AI.";
      
      if (errCode === 'anon_cap') {
        setAnonCapped(true);
      } else {
        addMessage({
          role: 'assistant',
          content: errMsg,
          isError: true
        });
      }
    } finally {
      setLoading(false);
    }
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
    <div className="w-full h-full pointer-events-auto flex flex-col justify-end items-end pb-0 font-labels">
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
                title="Tactical Command" 
                subtitle={`SKYLORD AI | ${user?.username || user?.name?.split(' ')[0] || 'GUEST'}`}
                rightElement={
                  <div className="flex items-center gap-2">
                    <button 
                      onClick={() => setPanelState('minimized')}
                      className="text-aervyn-text-tertiary hover:text-aervyn-text-primary transition-colors"
                      title="Minimize"
                    >
                      <Minimize2 size={12} />
                    </button>
                    <button 
                      onClick={() => setPanelState('closed')}
                      className="text-aervyn-text-tertiary hover:text-aervyn-status-red transition-colors ml-1"
                      title="Close"
                    >
                      <X size={12} />
                    </button>
                  </div>
                }
              />

              {/* Tracking Context Bar */}
              {focusedFlightId && selectedFlight && selectedFlight.id === focusedFlightId && (
                <div className="mx-3 mt-3 border border-aervyn-status-cyan bg-aervyn-status-cyan/10 p-2 rounded flex items-center gap-3 shrink-0">
                  <div className="flex-1 min-w-0 pl-2 border-l-2 border-aervyn-status-cyan">
                    <span className="text-[9px] text-aervyn-status-cyan uppercase tracking-widest font-bold">Target Locked</span>
                    <div className="font-labels font-bold text-sm text-aervyn-text-primary truncate leading-tight">{selectedFlight.flightNumber || selectedFlight.id}</div>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    <button onClick={() => setFocusedFlightId(selectedFlight.id)} className="p-1.5 bg-aervyn-status-cyan/20 hover:bg-aervyn-status-cyan/40 rounded text-aervyn-status-cyan transition-colors">
                      <Crosshair size={12} strokeWidth={2} />
                    </button>
                    <button onClick={() => { setFocusedFlightId(null); setSelectedFlight(null); }} className="p-1.5 bg-aervyn-status-red/10 hover:bg-aervyn-status-red/20 rounded text-aervyn-status-red transition-colors">
                      <X size={12} strokeWidth={2} />
                    </button>
                  </div>
                </div>
              )}
              
              {/* Chat Messages */}
              <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-4 no-scrollbar min-h-0">
                  {messages.length === 0 && (
                     <div className="flex-1 flex flex-col items-center justify-center text-center opacity-50 mt-4">
                        <MessageSquare className="w-6 h-6 mb-2 text-aervyn-text-tertiary" />
                        <p className="text-[10px] text-aervyn-text-tertiary uppercase tracking-widest">
                          Awaiting operator input.
                        </p>
                     </div>
                  )}
                  {messages.map((msg, idx) => (
                    <div key={idx} className={cn("flex flex-col gap-1 w-[90%]", msg.role === 'user' ? "self-end items-end" : "self-start")}>
                      <div className="text-[9px] text-aervyn-text-tertiary uppercase tracking-widest font-bold">
                        {msg.role === 'user' ? 'TX_OPERATOR' : 'RX_SKYLORD'}
                      </div>
                      <div className={cn("text-xs p-3 rounded leading-relaxed border", 
                        msg.role === 'user' 
                          ? "bg-aervyn-status-cyan/10 border-aervyn-status-cyan/30 text-aervyn-text-primary rounded-br-none" 
                          : msg.isError 
                            ? "bg-aervyn-status-red/10 border-aervyn-status-red/30 text-aervyn-status-red flex gap-2 items-start rounded-bl-none"
                            : "bg-aervyn-panel-light border-aervyn-border-subtle text-aervyn-text-secondary rounded-bl-none"
                      )}>
                        {msg.isError && <AlertCircle size={14} strokeWidth={2} className="mt-0.5 shrink-0" />}
                        <div className="whitespace-pre-wrap">{msg.content}</div>
                      </div>
                      {/* Flight Reference Badges */}
                      {msg.role === 'assistant' && msg.referencedFlights && msg.referencedFlights.length > 0 && (
                        <div className="flex flex-wrap gap-2 mt-1">
                          {msg.referencedFlights.map((ref, rIdx) => (
                            <button key={rIdx} onClick={() => setFocusedFlightId(ref)} className="flex items-center gap-1 text-[9px] uppercase tracking-widest bg-aervyn-panel-light border border-aervyn-border-subtle hover:border-aervyn-border-active text-aervyn-text-primary px-2 py-1 rounded transition-colors">
                              <Plane size={10} strokeWidth={1.5} />
                              {ref}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                  {loading && (
                    <div className="self-start text-xs p-3 rounded rounded-bl-none bg-aervyn-panel-light border border-aervyn-border-subtle w-16 flex justify-center text-aervyn-text-tertiary">
                      <span className="animate-pulse font-labels font-bold">...</span>
                    </div>
                  )}
                  <div ref={messagesEndRef} className="h-1 shrink-0" />
              </div>

              {/* Input Area */}
              <div className="p-3 bg-aervyn-panel-dark border-t border-aervyn-border-subtle shrink-0">
                {authLoading ? (
                    <div className="h-10 flex items-center justify-center"><div className="w-4 h-4 rounded-full border-2 border-aervyn-status-cyan border-t-transparent animate-spin"></div></div>
                ) : anonCapped ? (
                    <div className="flex flex-col items-center justify-center text-center p-3 rounded bg-aervyn-status-red/10 border border-aervyn-status-red/30">
                        <p className="text-[10px] text-aervyn-status-red uppercase tracking-widest font-labels font-bold mb-2">Free Limit Reached</p>
                        <a href="/register" className="w-full text-center bg-aervyn-status-cyan/20 border border-aervyn-status-cyan text-aervyn-status-cyan py-1.5 rounded text-[10px] font-bold transition-colors hover:bg-aervyn-status-cyan hover:text-white uppercase tracking-widest mb-1">
                          Sign up to keep chatting
                        </a>
                        <p className="text-[9px] text-aervyn-text-tertiary font-labels mt-1">Unlock unlimited queries and saved tracking.</p>
                    </div>
                ) : (user && !user.isEmailVerified) ? (
                    <div className="flex flex-col items-center justify-center text-center p-3 rounded bg-aervyn-status-amber/10 border border-aervyn-status-amber/30">
                        <p className="text-[10px] text-aervyn-status-amber uppercase tracking-widest font-labels font-bold mb-2">Verification Required</p>
                        {resendSuccess ? (
                          <div className="text-[9px] text-aervyn-status-green font-bold py-1 uppercase tracking-widest">Check your inbox for a new link!</div>
                        ) : (
                          <button 
                            onClick={handleResendVerification} 
                            disabled={isResending}
                            className="w-full bg-aervyn-panel-light border border-aervyn-border-subtle py-1.5 rounded text-[10px] uppercase tracking-widest font-bold transition-colors hover:border-aervyn-status-amber text-aervyn-text-primary"
                          >
                            {isResending ? 'Sending...' : 'Resend Verification'}
                          </button>
                        )}
                        {resendError && <p className="text-[10px] text-aervyn-status-red mt-1">{resendError}</p>}
                    </div>
                ) : (
                    <div className="relative flex items-center h-10">
                      <input 
                        type="text" value={inputValue} onChange={e => setInputValue(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleSendMessage()}
                        placeholder="Transmit tactical query..."
                        className="w-full h-full bg-aervyn-panel-base border border-aervyn-border-subtle rounded px-3 pr-10 text-xs outline-none focus:border-aervyn-status-cyan transition-colors placeholder:text-aervyn-text-tertiary text-aervyn-text-primary font-labels"
                      />
                      <div className="absolute right-1 flex items-center h-8">
                        <button onClick={handleSendMessage} className="h-full px-3 bg-aervyn-status-cyan/10 border border-aervyn-status-cyan/30 rounded hover:bg-aervyn-status-cyan hover:text-white text-aervyn-status-cyan transition-colors">
                          <Send size={12} strokeWidth={2} />
                        </button>
                      </div>
                    </div>
                )}
              </div>
            </CommandPanel>
          </motion.div>
        ) : (
          <motion.button
            key="minimized"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            transition={{ duration: timing.normal, ease: easing.decelerate }}
            onClick={() => setPanelState('open')}
            className="p-3 flex items-center gap-3 bg-aervyn-panel-dark border border-aervyn-border-subtle hover:border-aervyn-border-active transition-colors group cursor-pointer shadow-lg rounded-full px-5 relative pointer-events-auto"
          >
            {hasUnread && (
              <div className="absolute -top-1 -right-1 w-2 h-2 bg-aervyn-status-red rounded-full animate-pulse" />
            )}
            <div className="w-1.5 h-1.5 rounded-full bg-aervyn-status-cyan animate-pulse" />
            <span className="text-[10px] text-aervyn-text-primary font-bold uppercase tracking-widest">
              Tactical Command
            </span>
            <Maximize2 size={12} className="text-aervyn-text-tertiary group-hover:text-aervyn-text-primary ml-2 transition-colors" />
          </motion.button>
        )}
      </AnimatePresence>
    </div>
  );
}
