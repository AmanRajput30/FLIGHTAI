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
import { CockpitButton } from '../ui/CockpitButton';

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
    <div className="w-[400px] h-full flex flex-col bg-[var(--color-cockpit-black)] border-l border-[var(--color-instrument-grey)] z-10 shadow-[-2px_0_20px_rgba(0,0,0,0.8)]">
      <div className="p-4 border-b border-[var(--color-instrument-grey)] bg-[#050505]">
        <h2 className="font-[family-name:var(--font-labels)] text-xs text-[var(--color-instrument-grey)] uppercase tracking-widest">
          Operator ID: <span className="text-[var(--color-instrument-white)]">{user?.username || user?.name?.split(' ')[0] || 'GUEST'}</span>
        </h2>
      </div>

      {/* —— Tracking Context Bar —— */}
      {focusedFlightId && selectedFlight && selectedFlight.id === focusedFlightId && (
        <div className="tracking-bar mx-4 mt-4 border border-[var(--color-horizon-blue)] bg-[#001a26] p-3 flex items-center gap-3 relative">
          <div className="absolute top-0 left-0 w-1 h-full bg-[var(--color-horizon-blue)]"></div>
          <span className="relative flex h-2 w-2 shrink-0 ml-1">
            <span className="animate-ping absolute inline-flex h-full w-full bg-[var(--color-horizon-blue)] opacity-75"></span>
            <span className="relative inline-flex h-2 w-2 bg-[var(--color-horizon-blue)]"></span>
          </span>
          <div className="flex-1 min-w-0">
            <span className="text-[10px] text-[var(--color-horizon-blue)] uppercase tracking-widest font-[family-name:var(--font-labels)]">Target Lock</span>
            <div className="font-[family-name:var(--font-numerals)] text-2xl text-[var(--color-instrument-white)] truncate tracking-wide">{selectedFlight.flightNumber || selectedFlight.id}</div>
          </div>
          <div className="flex items-center gap-1.5 shrink-0">
            <CockpitButton onClick={handleFocusFlight} variant="action" title="Focus map" className="!text-[10px] !px-2 !py-1 bg-[var(--color-horizon-blue)] border-[var(--color-horizon-blue)]">
              <Crosshair size={12} strokeWidth={2} className="mr-1" />Focus
            </CockpitButton>
            <CockpitButton onClick={handleUntrack} variant="action" title="Untrack" className="!text-[10px] !px-2 !py-1 bg-[#1a1a1a] text-[var(--color-warning-red)] border-[var(--color-warning-red)] hover:bg-[#2a2a2a] hover:border-[var(--color-warning-red)]">
              <X size={12} strokeWidth={2} />
            </CockpitButton>
          </div>
        </div>
      )}

      {/* —— Context Indicator —— */}
      {focusedFlightId && selectedFlight && selectedFlight.id === focusedFlightId && (
        <div className="context-indicator mx-4 mt-2 flex items-center gap-2 text-[10px] text-[var(--color-instrument-grey)] font-[family-name:var(--font-labels)] uppercase tracking-widest">
          <Radio size={12} className="text-[var(--color-horizon-blue)] animate-pulse" />
          <span>Intercepting data for <span className="text-[var(--color-instrument-white)]">{selectedFlight.flightNumber || selectedFlight.id}</span></span>
        </div>
      )}
      
      <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-4 scrollbar-thin">
          {messages.map((msg, idx) => (
            <div key={idx} className={cn("flex flex-col gap-1 w-[90%]", msg.role === 'user' ? "self-end items-end" : "self-start")}>
              <div className="text-[10px] font-mono text-[var(--color-instrument-grey)] mb-0.5">
                {msg.role === 'user' ? 'TX_OPERATOR' : 'RX_SKYLORD'}
              </div>
              <div className={cn("text-sm p-3 leading-relaxed shadow-none font-[family-name:var(--font-labels)]", 
                msg.role === 'user' 
                  ? "bg-[var(--color-horizon-blue)] text-white" 
                  : msg.isError 
                    ? "bg-[#1a0000] border border-[var(--color-warning-red)] text-[var(--color-warning-red)] flex gap-2 items-start"
                    : "bg-[var(--color-cockpit-black)] border border-[var(--color-instrument-grey)] text-[var(--color-instrument-white)]"
              )}>
                {msg.isError && <AlertCircle size={14} strokeWidth={2} className="mt-0.5 shrink-0" />}
                <div>{msg.content}</div>
              </div>
              {/* —— Flight Reference Badges —— */}
              {msg.role === 'assistant' && msg.referencedFlights && msg.referencedFlights.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-1">
                  {msg.referencedFlights.map((ref, rIdx) => (
                    <CockpitButton key={rIdx} variant="selector" onClick={() => handleFlightBadgeClick(ref)}>
                      <Plane size={14} strokeWidth={1.5} className="mr-1" />
                      {ref}
                    </CockpitButton>
                  ))}
                </div>
              )}
            </div>
          ))}
          {loading && (
            <div className="self-start text-sm p-3 bg-[var(--color-cockpit-black)] border border-[var(--color-instrument-grey)] w-16 flex justify-center text-[var(--color-instrument-white)]">
              <span className="animate-pulse font-mono">...</span>
            </div>
          )}
          <div ref={messagesEndRef} />
      </div>

      <div className="p-4 mt-auto bg-[#050505] border-t border-[var(--color-instrument-grey)]">
        {authLoading ? (
            <div className="h-10 flex items-center justify-center"><div className="w-4 h-4 rounded-full border-2 border-[var(--color-horizon-blue)] border-t-transparent animate-spin"></div></div>
        ) : user ? (
          user.isEmailVerified ? (
            <div className="relative group flex items-center h-10">
              <input 
                type="text" value={inputValue} onChange={e => setInputValue(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleSendMessage()}
                placeholder="Transmit query..."
                className="w-full h-full bg-[var(--color-cockpit-black)] border border-[var(--color-instrument-grey)] pl-3 pr-10 text-sm outline-none focus:border-[var(--color-horizon-blue)] transition-all placeholder:text-[var(--color-instrument-grey)] text-[var(--color-instrument-white)] font-[family-name:var(--font-labels)]"
              />
              <div className="absolute right-1 flex items-center h-8">
                <CockpitButton onClick={handleSendMessage} variant="action" className="h-full !px-3 bg-[var(--color-horizon-blue)] border-[var(--color-horizon-blue)] text-white hover:bg-[var(--color-horizon-blue)]">
                  <Send size={14} strokeWidth={2} />
                </CockpitButton>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center text-center p-4 bg-[#1a0000] border border-[var(--color-warning-red)]">
                <p className="text-[10px] text-[var(--color-warning-red)] uppercase tracking-widest font-[family-name:var(--font-labels)] mb-3">Verification Required</p>
                {resendSuccess ? (
                  <div className="text-sm text-[var(--color-horizon-blue)] font-bold py-2.5 uppercase tracking-wide">Check your inbox for a new link!</div>
                ) : (
                  <CockpitButton 
                    onClick={handleResendVerification} 
                    disabled={isResending}
                    variant="action"
                    className="w-full bg-[var(--color-horizon-blue)] border-[var(--color-horizon-blue)]"
                  >
                    {isResending ? 'Sending...' : 'Resend Verification'}
                  </CockpitButton>
                )}
                {resendError && <p className="text-xs text-red-400 mt-2">{resendError}</p>}
            </div>
          )
        ) : (
          <div className="flex flex-col items-center justify-center text-center p-4 bg-[var(--color-cockpit-black)] border border-[var(--color-instrument-grey)]">
              <p className="text-[10px] text-[var(--color-instrument-grey)] font-[family-name:var(--font-labels)] uppercase tracking-widest mb-3">Authentication Required</p>
              <CockpitButton as={Link} href="/register" variant="action" className="w-full bg-[var(--color-horizon-blue)] border-[var(--color-horizon-blue)]">
                Create Account
              </CockpitButton>
          </div>
        )}
      </div>
    </div>
  );
}
