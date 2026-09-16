"use client";

import { useState, useRef, useEffect } from 'react';
import { Send, AlertCircle, Plane, Crosshair, X, Radio } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/context/AuthContext';
import { useChatStore } from '@/store/useChatStore';
import { useFlightStore } from '@/store/useFlightStore';
import { chatApi, userApi } from '@/lib/api';
import Link from 'next/link';
import { ChatMessage } from '@/types';

export default function ChatPanel() {
  const { user, loading: authLoading } = useAuth();
  const { messages, inputValue, loading, setMessages, setInputValue, setLoading, addMessage } = useChatStore();
  const { selectedFlight, focusedFlightId, setFocusedFlightId, setSelectedFlight } = useFlightStore();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const [isResending, setIsResending] = useState(false);
  const [resendSuccess, setResendSuccess] = useState(false);
  const [resendError, setResendError] = useState<string | null>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async () => {
    if (!inputValue.trim() || !user || !user.isEmailVerified) return;

    const userMessage: ChatMessage = { role: 'user', content: inputValue };
    addMessage(userMessage);
    setInputValue('');
    setLoading(true);

    try {
      const data = await chatApi.sendMessage([...messages, userMessage], selectedFlight);
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

  const handleFlightBadgeClick = (flightId: string) => {
    setFocusedFlightId(flightId);
  };

  const handleUntrack = () => {
    setFocusedFlightId(null);
    setSelectedFlight(null);
  };

  const handleFocusFlight = () => {
    if (selectedFlight) {
      setFocusedFlightId(selectedFlight.id);
    }
  };

  return (
    <div className="w-[400px] h-full flex flex-col glass-panel border-l border-t-0 z-10 shadow-[-2px_0_20px_rgba(0,0,0,0.5)] bg-card/95">
      <div className="p-5 border-b border-white/5">
        <h2 className="font-semibold text-xl">Hello, <span className="text-yellow-400">{user?.username || user?.name?.split(' ')[0] || 'Guest'}</span></h2>
        <p className="text-sm text-muted-foreground mt-1">Ready to assist with flight data.</p>
      </div>

      {/* —— Tracking Context Bar —— */}
      {focusedFlightId && selectedFlight && selectedFlight.id === focusedFlightId && (
        <div className="tracking-bar mx-3 mt-3 rounded-xl px-4 py-2.5 flex items-center gap-3">
          <span className="relative flex h-2.5 w-2.5 shrink-0">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-yellow-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-yellow-500"></span>
          </span>
          <div className="flex-1 min-w-0">
            <span className="text-[10px] text-yellow-400/70 uppercase tracking-widest font-semibold">Currently Tracking</span>
            <div className="font-bold text-yellow-300 text-sm truncate">{selectedFlight.flightNumber || selectedFlight.id}</div>
          </div>
          <div className="flex items-center gap-1.5 shrink-0">
            <button onClick={handleFocusFlight} className="tracking-bar-btn bg-yellow-500/15 text-yellow-400 hover:bg-yellow-500/25 border-yellow-500/20" title="Focus map">
              <Crosshair className="w-3.5 h-3.5 inline -mt-0.5 mr-0.5" />Focus
            </button>
            <button onClick={handleUntrack} className="tracking-bar-btn bg-red-500/10 text-red-400 hover:bg-red-500/20 border-red-500/20" title="Untrack">
              <X className="w-3.5 h-3.5 inline -mt-0.5" />
            </button>
          </div>
        </div>
      )}

      {/* —— Context Indicator —— */}
      {focusedFlightId && selectedFlight && selectedFlight.id === focusedFlightId && (
        <div className="context-indicator mx-5 mt-2.5 flex items-center gap-2 text-[11px] text-yellow-400/60 font-medium">
          <Radio className="w-3 h-3 text-yellow-500/50" />
          <span>SkyLord is analyzing <span className="text-yellow-400 font-bold">{selectedFlight.flightNumber || selectedFlight.id}</span></span>
        </div>
      )}
      
      <div className="flex-1 overflow-y-auto p-5 flex flex-col gap-4 scrollbar-thin">
          {messages.map((msg, idx) => (
            <div key={idx} className={cn("flex flex-col gap-1 w-[85%]", msg.role === 'user' ? "self-end items-end" : "self-start")}>
              <div className={cn("text-sm p-4 rounded-2xl leading-relaxed shadow-sm", 
                msg.role === 'user' 
                  ? "bg-yellow-500/20 border border-yellow-500/30 rounded-tr-sm text-yellow-50" 
                  : msg.isError 
                    ? "bg-red-500/10 border border-red-500/30 text-red-200 rounded-tl-sm flex gap-2 items-start"
                    : "bg-white/5 border border-white/10 rounded-tl-sm text-gray-200"
              )}>
                {msg.isError && <AlertCircle className="w-4 h-4 text-red-500 mt-0.5 shrink-0" />}
                <div>{msg.content}</div>
              </div>
              {/* —— Flight Reference Badges —— */}
              {msg.role === 'assistant' && msg.referencedFlights && msg.referencedFlights.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-1">
                  {msg.referencedFlights.map((ref, rIdx) => (
                    <button key={rIdx} className="flight-badge" onClick={() => handleFlightBadgeClick(ref)}>
                      <Plane className="w-3.5 h-3.5" />
                      {ref}
                    </button>
                  ))}
                </div>
              )}
            </div>
          ))}
          {loading && (
            <div className="self-start text-sm p-3.5 bg-white/5 rounded-2xl rounded-tl-sm border border-white/5 w-16 flex justify-center"><span className="animate-pulse">...</span></div>
          )}
          <div ref={messagesEndRef} />
      </div>

      <div className="p-5 mt-auto bg-black/20 border-t border-white/5">
        {authLoading ? (
            <div className="h-12 flex items-center justify-center"><div className="w-5 h-5 rounded-full border-2 border-yellow-500 border-t-transparent animate-spin"></div></div>
        ) : user ? (
          user.isEmailVerified ? (
            <div className="relative group flex items-center">
              <input 
                type="text" value={inputValue} onChange={e => setInputValue(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleSendMessage()}
                placeholder="Ask AI an aviation question..."
                className="w-full bg-black/60 border border-white/10 rounded-xl py-3 pl-4 pr-12 text-sm outline-none focus:border-yellow-400/50 focus:ring-1 focus:ring-yellow-400/50 transition-all placeholder:text-muted-foreground/50 text-white"
              />
              <div className="absolute right-2 flex items-center">
                <button onClick={handleSendMessage} className="w-8 h-8 rounded-lg bg-yellow-500 text-black flex items-center justify-center hover:bg-yellow-400 transition-colors">
                  <Send className="w-4 h-4 ml-0.5" />
                </button>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center text-center p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-xl">
                <p className="text-sm text-yellow-500 font-medium mb-3">Verify your email to unlock SkyLord AI Assistant</p>
                {resendSuccess ? (
                  <div className="text-sm text-green-400 font-medium py-2.5">Check your inbox for a new verification link!</div>
                ) : (
                  <button 
                    onClick={handleResendVerification} 
                    disabled={isResending}
                    className="w-full bg-yellow-500 hover:bg-yellow-400 text-black font-bold py-2.5 rounded-lg transition-colors text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isResending ? 'Sending...' : 'Resend Verification Email'}
                  </button>
                )}
                {resendError && <p className="text-xs text-red-400 mt-2">{resendError}</p>}
            </div>
          )
        ) : (
          <div className="flex flex-col items-center justify-center text-center p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-xl">
              <p className="text-sm text-yellow-500 font-medium mb-3">Create a free account to unlock SkyLord AI Assistant</p>
              <Link href="/register" className="w-full bg-yellow-500 hover:bg-yellow-400 text-black font-bold py-2.5 rounded-lg transition-colors text-sm">
                Create Account
              </Link>
          </div>
        )}
      </div>
    </div>
  );
}
