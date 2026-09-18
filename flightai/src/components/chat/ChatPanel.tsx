"use client";

import { useState, useRef, useEffect } from 'react';
import { Send, AlertCircle, Plane, Crosshair, X, Radio, Minimize2, Maximize2, MessageSquare } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/context/AuthContext';
import { useChatStore } from '@/store/useChatStore';
import { useFlightStore } from '@/store/useFlightStore';
import { chatApi, userApi } from '@/lib/api';
import { ChatMessage } from '@/types';
import { motion, AnimatePresence } from 'framer-motion';
import { timing, easing, slideRight } from '@/lib/motion/presets';

export default function ChatPanel() {
  const { user, loading: authLoading } = useAuth();
  const { messages, inputValue, loading, setMessages, setInputValue, setLoading, addMessage } = useChatStore();
  const { selectedFlight, focusedFlightId, setFocusedFlightId, setSelectedFlight } = useFlightStore();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const [isResending, setIsResending] = useState(false);
  const [resendSuccess, setResendSuccess] = useState(false);
  const [resendError, setResendError] = useState<string | null>(null);
  
  // Minimize/Restore state
  const [isMinimized, setIsMinimized] = useState(false);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (!isMinimized) {
      scrollToBottom();
    }
  }, [messages, isMinimized]);

  const handleSendMessage = async () => {
    if (!inputValue.trim() || !user || !user.isEmailVerified) return;

    const userMessage: ChatMessage = { role: 'user', content: inputValue };
    addMessage(userMessage);
    setInputValue('');
    setLoading(true);

    try {
      const data: any = await chatApi.sendMessage([...messages, userMessage], selectedFlight);
      addMessage({
        role: 'assistant',
        content: data.reply,
        referencedFlights: data.referencedFlights
      });
    } catch (error: any) {
      console.error(error);
      addMessage({
        role: 'assistant',
        content: error.response?.data?.error || "Error communicating with SkyLord AI.",
        isError: true
      });
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

  return (
    <div className="w-full pointer-events-auto flex flex-col justify-end items-end pb-6 font-labels drop-shadow-2xl">
      <AnimatePresence initial={false} mode="wait">
        {!isMinimized ? (
          <motion.div 
            key="expanded"
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: timing.normal, ease: easing.decelerate }}
            className="w-full cockpit-panel flex flex-col max-h-[80vh] overflow-hidden"
          >
            {/* Header */}
            <div className="p-3 border-b border-border-subtle bg-cockpit-panel-raised flex justify-between items-center shrink-0">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-horizon-blue animate-pulse" />
                <h2 className="text-[10px] text-instrument-grey uppercase tracking-widest font-bold">
                  SkyLord AI <span className="text-instrument-white ml-2 opacity-50">| {user?.username || user?.name?.split(' ')[0] || 'GUEST'}</span>
                </h2>
              </div>
              <button 
                onClick={() => setIsMinimized(true)}
                className="text-instrument-grey hover:text-instrument-white transition-colors"
                title="Minimize SkyLord"
              >
                <Minimize2 size={14} />
              </button>
            </div>

            {/* Tracking Context Bar */}
            {focusedFlightId && selectedFlight && selectedFlight.id === focusedFlightId && (
              <div className="mx-3 mt-3 border border-horizon-blue bg-horizon-blue/10 p-2 rounded flex items-center gap-3 shrink-0">
                <div className="flex-1 min-w-0 pl-1 border-l-2 border-horizon-blue">
                  <span className="text-[9px] text-horizon-blue uppercase tracking-widest font-bold">Target Locked</span>
                  <div className="font-numerals text-lg text-instrument-white truncate leading-tight">{selectedFlight.flightNumber || selectedFlight.id}</div>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  <button onClick={() => setFocusedFlightId(selectedFlight.id)} className="p-1.5 bg-horizon-blue/20 hover:bg-horizon-blue/40 rounded text-horizon-blue transition-colors">
                    <Crosshair size={12} strokeWidth={2} />
                  </button>
                  <button onClick={() => { setFocusedFlightId(null); setSelectedFlight(null); }} className="p-1.5 bg-warning-red/10 hover:bg-warning-red/20 rounded text-warning-red transition-colors">
                    <X size={12} strokeWidth={2} />
                  </button>
                </div>
              </div>
            )}
            
            {/* Chat Messages */}
            <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-4 scrollbar-thin scrollbar-thumb-instrument-grey scrollbar-track-transparent min-h-[250px]">
                {messages.length === 0 && (
                   <div className="flex-1 flex flex-col items-center justify-center text-center opacity-50 mt-10">
                      <MessageSquare className="w-8 h-8 mb-2 text-instrument-grey" />
                      <p className="text-[10px] text-instrument-grey uppercase tracking-widest">
                        Awaiting operator input.
                      </p>
                   </div>
                )}
                {messages.map((msg, idx) => (
                  <div key={idx} className={cn("flex flex-col gap-1 w-[90%]", msg.role === 'user' ? "self-end items-end" : "self-start")}>
                    <div className="text-[9px] text-instrument-grey uppercase tracking-widest">
                      {msg.role === 'user' ? 'TX_OPERATOR' : 'RX_SKYLORD'}
                    </div>
                    <div className={cn("text-sm p-3 rounded leading-relaxed border", 
                      msg.role === 'user' 
                        ? "bg-horizon-blue/20 border-horizon-blue text-white rounded-br-none" 
                        : msg.isError 
                          ? "bg-warning-red/10 border-warning-red text-warning-red flex gap-2 items-start rounded-bl-none"
                          : "bg-cockpit-panel-raised border-border-subtle text-instrument-white rounded-bl-none"
                    )}>
                      {msg.isError && <AlertCircle size={14} strokeWidth={2} className="mt-0.5 shrink-0" />}
                      <div>{msg.content}</div>
                    </div>
                    {/* Flight Reference Badges */}
                    {msg.role === 'assistant' && msg.referencedFlights && msg.referencedFlights.length > 0 && (
                      <div className="flex flex-wrap gap-2 mt-1">
                        {msg.referencedFlights.map((ref, rIdx) => (
                          <button key={rIdx} onClick={() => setFocusedFlightId(ref)} className="flight-badge">
                            <Plane size={10} strokeWidth={1.5} className="mr-1" />
                            {ref}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
                {loading && (
                  <div className="self-start text-sm p-3 rounded rounded-bl-none bg-cockpit-panel-raised border border-border-subtle w-16 flex justify-center text-instrument-white">
                    <span className="animate-pulse font-mono">...</span>
                  </div>
                )}
                <div ref={messagesEndRef} className="h-1" />
            </div>

            {/* Input Area */}
            <div className="p-3 bg-cockpit-panel-raised border-t border-border-subtle shrink-0">
              {authLoading ? (
                  <div className="h-10 flex items-center justify-center"><div className="w-4 h-4 rounded-full border-2 border-horizon-blue border-t-transparent animate-spin"></div></div>
              ) : user ? (
                user.isEmailVerified ? (
                  <div className="relative flex items-center h-10">
                    <input 
                      type="text" value={inputValue} onChange={e => setInputValue(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleSendMessage()}
                      placeholder="Transmit query..."
                      className="w-full h-full bg-cockpit-black border border-border-subtle rounded px-3 pr-10 text-sm outline-none focus:border-horizon-blue transition-colors placeholder:text-instrument-muted text-instrument-white font-labels"
                    />
                    <div className="absolute right-1 flex items-center h-8">
                      <button onClick={handleSendMessage} className="h-full px-3 bg-horizon-blue rounded hover:bg-horizon-blue-bright text-white transition-colors">
                        <Send size={14} strokeWidth={2} />
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center text-center p-3 rounded bg-warning-red/10 border border-warning-red">
                      <p className="text-[10px] text-warning-red uppercase tracking-widest font-labels mb-2">Verification Required</p>
                      {resendSuccess ? (
                        <div className="text-xs text-horizon-blue font-bold py-1 uppercase tracking-wide">Check your inbox for a new link!</div>
                      ) : (
                        <button 
                          onClick={handleResendVerification} 
                          disabled={isResending}
                          className="w-full bg-horizon-blue py-1.5 rounded text-xs font-bold transition-colors hover:bg-horizon-blue-bright"
                        >
                          {isResending ? 'Sending...' : 'Resend Verification'}
                        </button>
                      )}
                      {resendError && <p className="text-[10px] text-warning-red mt-1">{resendError}</p>}
                  </div>
                )
              ) : (
                <div className="flex flex-col items-center justify-center text-center p-3">
                    <p className="text-[10px] text-instrument-grey font-labels uppercase tracking-widest mb-2">Authentication Required</p>
                    <a href="/register" className="w-full text-center bg-horizon-blue py-1.5 rounded text-xs font-bold transition-colors hover:bg-horizon-blue-bright">
                      Create Account
                    </a>
                </div>
              )}
            </div>
          </motion.div>
        ) : (
          <motion.button
            key="minimized"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            transition={{ duration: timing.normal, ease: easing.decelerate }}
            onClick={() => setIsMinimized(false)}
            className="cockpit-panel p-3 flex items-center gap-3 hover:bg-cockpit-panel-raised transition-colors group cursor-pointer shadow-lg rounded-full px-5"
          >
            <div className="w-2 h-2 rounded-full bg-horizon-blue animate-pulse" />
            <span className="text-xs text-instrument-white font-bold uppercase tracking-widest">
              SkyLord AI
            </span>
            <Maximize2 size={14} className="text-instrument-grey group-hover:text-instrument-white ml-2 transition-colors" />
          </motion.button>
        )}
      </AnimatePresence>
    </div>
  );
}
