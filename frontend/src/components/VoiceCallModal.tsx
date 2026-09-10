import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  Mic, MicOff, PhoneOff, CheckCircle, XCircle,
  Volume2, Send, Loader2, Zap,
} from 'lucide-react';
import { AgentChatMessage, AgentChatResponse } from '../types';
import coldChainApi from '../services/api';

// ─── Local Rule-Based Agent (works fully offline) ─────────────────────────────
function localAgent({
  businessName,
  goodsType,
  timeToSpoilageHours,
  discountOffered,
  history,
  userMessage,
}: {
  businessName: string;
  goodsType: string;
  timeToSpoilageHours: number;
  discountOffered: number;
  history: AgentChatMessage[];
  userMessage: string;
}): AgentChatResponse {
  const BASE_VALUE = 45_000;
  const msg = userMessage.toLowerCase();
  const turns = history.length;

  const urgencyBonus = Math.max(0, (12 - timeToSpoilageHours) * 1.2);
  const threshold = Math.max(15, 25 - urgencyBonus);

  const agreeKw = ['accept','deal','agreed','yes','sure','okay','ok','done','finalize','go ahead','confirm','proceed'];
  const declineKw = ['no deal','not interested','cancel','forget it','nevermind','walk away'];

  const nums = Array.from(msg.matchAll(/(\d+(?:\.\d+)?)/g)).map(m => parseFloat(m[1])).filter(n => n >= 5 && n <= 80);
  const userOffered = nums[0] ?? discountOffered;
  const recovery = Math.round(BASE_VALUE * (1 - userOffered / 100));

  if (declineKw.some(k => msg.includes(k))) {
    return { agent_reply: `Understood. We\'ll pass on this one. If the situation changes, ${businessName} is reachable 24/7. Good luck with the cargo.`, deal_status: 'declined', recovery_usd: 0 };
  }

  if (agreeKw.some(k => msg.includes(k)) && turns >= 1) {
    if (userOffered >= threshold) {
      return {
        agent_reply: `Excellent! A ${userOffered.toFixed(0)}% concession is accepted by ${businessName}. Gate 3 is cleared for priority unloading. Divert the carrier now — estimated recovery value is $${recovery.toLocaleString()}. Our intake team will be ready for the ${goodsType} shipment.`,
        deal_status: 'accepted',
        recovery_usd: recovery,
      };
    } else {
      const counter = Math.round(threshold + 3);
      return {
        agent_reply: `I appreciate the offer, but ${userOffered.toFixed(0)}% isn't enough given our emergency intake costs. We need at least ${counter}% to proceed. Can you authorise that?`,
        deal_status: 'counter',
        recovery_usd: 0,
      };
    }
  }

  if (turns === 0) {
    const urgency = timeToSpoilageHours < 6
      ? `This is urgent — we have under ${timeToSpoilageHours.toFixed(1)} hours before spoilage risk becomes critical.`
      : `We have roughly ${timeToSpoilageHours.toFixed(1)} hours before spoilage risk escalates.`;
    return {
      agent_reply: `${businessName} Intake Manager speaking. We've received your emergency request for the ${goodsType} shipment. ${urgency} You're offering ${discountOffered}% discount — that's a reasonable start. What are your flexibility limits on the discount?`,
      deal_status: 'open',
      recovery_usd: 0,
    };
  }

  // Mid-negotiation responses
  const midReplies = [
    `We're looking at emergency refrigeration setup costs on our end. Can you push the discount to ${Math.min(50, Math.round(userOffered + 5))}%?`,
    `Understood. Our capacity manager is reviewing the ${goodsType} intake requirements. The ${userOffered.toFixed(0)}% figure — is that firm or is there room?`,
    `For a shipment of this urgency, we'd normally charge a premium. At ${userOffered.toFixed(0)}% off, we\'re essentially absorbing that cost. Can you meet us at ${Math.min(50, Math.round(threshold + 2))}%?`,
  ];
  return { agent_reply: midReplies[turns % midReplies.length], deal_status: 'open', recovery_usd: 0 };
}
// ─────────────────────────────────────────────────────────────────────────────

interface VoiceCallModalProps {
  isOpen: boolean;
  onClose: () => void;
  shipmentId: string;
  businessId: string;
  businessName: string;
  businessLocation: string;
  goodsType: string;
  avgTemperature: number;
  timeToSpoilageHours: number;
  etaHours: number;
  discountOffered: number;
  /**
   * If true, the call will start automatically when the modal opens.
   */
  autoStart?: boolean;
}

const SpeechRecognition =
  (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

function speak(text: string, onEnd?: () => void) {
  if (!window.speechSynthesis) return;
  window.speechSynthesis.cancel();
  const utt = new SpeechSynthesisUtterance(text);
  utt.rate = 0.95;
  utt.pitch = 0.85;
  utt.volume = 1;
  const voices = window.speechSynthesis.getVoices();
  const preferred = voices.find(
    (v) =>
      v.name.toLowerCase().includes('male') ||
      v.name.toLowerCase().includes('daniel') ||
      v.name.toLowerCase().includes('alex')
  );
  if (preferred) utt.voice = preferred;
  if (onEnd) utt.onend = onEnd;
  window.speechSynthesis.speak(utt);
}

const WaveformBars: React.FC<{ active: boolean; color: string }> = ({ active, color }) => (
  <div className="flex items-end gap-[3px] h-8">
    {Array.from({ length: 12 }).map((_, i) => (
      <div
        key={i}
        style={{
          background: color,
          width: 3,
          borderRadius: 3,
          height: active ? undefined : 6,
          animation: active
            ? `waveBar ${0.4 + (i % 4) * 0.15}s ease-in-out infinite alternate`
            : 'none',
          animationDelay: `${i * 0.06}s`,
        }}
      />
    ))}
  </div>
);

export const VoiceCallModal: React.FC<VoiceCallModalProps> = ({
  isOpen,
  onClose,
  shipmentId,
  businessId,
  businessName,
  businessLocation,
  goodsType,
  avgTemperature,
  timeToSpoilageHours,
  etaHours,
  discountOffered,
  autoStart = false,
}) => {
  const [history, setHistory] = useState<AgentChatMessage[]>([]);
  const [isListening, setIsListening] = useState(false);
  const [isAgentSpeaking, setIsAgentSpeaking] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [liveTranscript, setLiveTranscript] = useState('');
  const [textInput, setTextInput] = useState('');
  const [dealStatus, setDealStatus] = useState<'open' | 'accepted' | 'declined' | 'counter'>('open');
  const [recoveryUsd, setRecoveryUsd] = useState(0);
  const [callDuration, setCallDuration] = useState(0);
  const [callStarted, setCallStarted] = useState(false);
  const [useTextMode, setUseTextMode] = useState(false);

  const recognitionRef = useRef<any>(null);
  const transcriptRef = useRef<HTMLDivElement>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (transcriptRef.current) {
      transcriptRef.current.scrollTop = transcriptRef.current.scrollHeight;
    }
  }, [history, liveTranscript]);

  useEffect(() => {
    if (callStarted && dealStatus === 'open') {
      timerRef.current = setInterval(() => setCallDuration((d) => d + 1), 1000);
    }
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [callStarted, dealStatus]);

  useEffect(() => {
    if (isOpen) {
      setHistory([]);
      setDealStatus('open');
      setRecoveryUsd(0);
      setCallDuration(0);
      setCallStarted(false);
      setLiveTranscript('');
      setTextInput('');
      window.speechSynthesis?.cancel();
    }
    return () => { window.speechSynthesis?.cancel(); };
  }, [isOpen]);

  useEffect(() => {
    if (!SpeechRecognition) setUseTextMode(true);
  }, []);

  const formatTime = (s: number) =>
    `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;

  const callAgent = useCallback(
    async (userText: string, hist: AgentChatMessage[]): Promise<AgentChatResponse> => {
      try {
        return await coldChainApi.agentChat({
          shipment_id: shipmentId,
          business_id: businessId,
          business_name: businessName,
          goods_type: goodsType,
          avg_temperature: avgTemperature,
          time_to_spoilage_hours: timeToSpoilageHours,
          eta_hours: etaHours,
          discount_offered: discountOffered,
          history: hist,
          user_message: userText,
        });
      } catch {
        // Backend unreachable — use local rule-based agent
        return localAgent({ businessName, goodsType, timeToSpoilageHours, discountOffered, history: hist, userMessage: userText });
      }
    },
    [shipmentId, businessId, businessName, goodsType, avgTemperature, timeToSpoilageHours, etaHours, discountOffered]
  );


  const sendMessage = useCallback(
    async (userText: string) => {
      if (!userText.trim() || isLoading || dealStatus !== 'open') return;
      const userMsg: AgentChatMessage = { role: 'user', text: userText };
      const newHistory = [...history, userMsg];
      setHistory(newHistory);
      setIsLoading(true);
      setLiveTranscript('');

      const res = await callAgent(userText, newHistory);

      const agentMsg: AgentChatMessage = { role: 'agent', text: res.agent_reply };
      setHistory((prev) => [...prev, agentMsg]);
      setDealStatus(res.deal_status as any);
      setRecoveryUsd(res.recovery_usd);
      setIsLoading(false);
      setIsAgentSpeaking(true);
      try { speak(res.agent_reply, () => setIsAgentSpeaking(false)); } catch { setIsAgentSpeaking(false); }
    },
    [history, isLoading, dealStatus, callAgent]
  );

  const startCall = useCallback(async () => {
    setCallStarted(true);
    setIsLoading(true);
    const res = await callAgent('Hello', []);
    const agentMsg: AgentChatMessage = { role: 'agent', text: res.agent_reply };
    setHistory([agentMsg]);
    setIsLoading(false);
    setIsAgentSpeaking(true);
    try { speak(res.agent_reply, () => setIsAgentSpeaking(false)); } catch { setIsAgentSpeaking(false); }
  }, [callAgent]);

  // Auto-start call if requested (only once per open)
  const autoStartFiredRef = useRef(false);
  useEffect(() => {
    if (isOpen && autoStart && !autoStartFiredRef.current) {
      autoStartFiredRef.current = true;
      startCall();
    }
    if (!isOpen) {
      autoStartFiredRef.current = false;
    }
  }, [isOpen, autoStart, startCall]);

  const startListening = useCallback(() => {
    if (!SpeechRecognition || isListening || dealStatus !== 'open') return;
    window.speechSynthesis?.cancel();
    setIsAgentSpeaking(false);
    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = true;
    recognition.lang = 'en-US';
    recognition.onresult = (e: any) => {
      let interim = '';
      let final = '';
      for (const result of e.results) {
        if (result.isFinal) final += result[0].transcript;
        else interim += result[0].transcript;
      }
      setLiveTranscript(final || interim);
      if (final) { recognition.stop(); sendMessage(final); }
    };
    recognition.onend = () => setIsListening(false);
    recognition.onerror = () => setIsListening(false);
    recognitionRef.current = recognition;
    recognition.start();
    setIsListening(true);
  }, [isListening, dealStatus, sendMessage]);

  const stopListening = useCallback(() => {
    recognitionRef.current?.stop();
    setIsListening(false);
  }, []);

  const handleTextSend = () => {
    if (textInput.trim()) { sendMessage(textInput.trim()); setTextInput(''); }
  };

  if (!isOpen) return null;

  const isDone = dealStatus === 'accepted' || dealStatus === 'declined';

  return (
    <>
      <style>{`
        @keyframes waveBar { from { height: 4px; } to { height: 28px; } }
        @keyframes micPulse {
          0%, 100% { box-shadow: 0 0 0 0 rgba(239,68,68,0.6); }
          50% { box-shadow: 0 0 0 16px rgba(239,68,68,0); }
        }
        @keyframes ringPulse {
          0%, 100% { box-shadow: 0 0 0 0 rgba(16,185,129,0.5); }
          50% { box-shadow: 0 0 0 20px rgba(16,185,129,0); }
        }
        .mic-pulse-anim { animation: micPulse 1.2s ease-in-out infinite; }
        .ring-pulse-anim { animation: ringPulse 1.8s ease-in-out infinite; }
      `}</style>

      <div className="fixed inset-0 bg-black/70 backdrop-blur-md z-[60] flex items-center justify-center p-4">
        <div className="bg-[#0F172A] rounded-2xl w-full max-w-md overflow-hidden shadow-2xl border border-white/10 flex flex-col">

          {/* Header */}
          <div className="flex items-center justify-between px-5 py-3 bg-white/5 border-b border-white/10">
            <div className="flex items-center gap-2">
              <Zap className="w-4 h-4 text-amber-400" />
              <span className="text-white/70 text-xs font-medium tracking-wider uppercase">Emergency Salvage Call</span>
            </div>
            <div className="flex items-center gap-3">
              {callStarted && <span className="text-emerald-400 text-xs font-mono">{formatTime(callDuration)}</span>}
              <button onClick={() => { window.speechSynthesis?.cancel(); onClose(); }} className="text-white/40 hover:text-white/80 transition-colors">
                <PhoneOff className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Caller avatar */}
          <div className="flex flex-col items-center pt-7 pb-4 px-5 gap-3">
            <div className={`w-20 h-20 rounded-full bg-gradient-to-br from-emerald-500 to-teal-700 flex items-center justify-center text-white text-2xl font-bold shadow-xl ${callStarted && !isDone ? 'ring-pulse-anim' : ''}`}>
              {businessName.slice(0, 2).toUpperCase()}
            </div>
            <div className="text-center">
              <p className="text-white font-semibold text-base">{businessName}</p>
              <p className="text-white/50 text-xs">{businessLocation} · Intake Manager</p>
            </div>
            <div className="flex items-center gap-3 mt-1 h-8">
              <WaveformBars active={isAgentSpeaking} color="#10B981" />
              {isAgentSpeaking && <span className="text-emerald-400 text-[11px] flex items-center gap-1"><Volume2 className="w-3 h-3" /> Speaking…</span>}
              {isListening && <span className="text-red-400 text-[11px] flex items-center gap-1"><Mic className="w-3 h-3 animate-pulse" /> Listening…</span>}
              {isLoading && <span className="text-amber-400 text-[11px] flex items-center gap-1"><Loader2 className="w-3 h-3 animate-spin" /> Processing…</span>}
            </div>
          </div>

          {/* Context chips */}
          <div className="flex gap-2 px-5 pb-3 flex-wrap justify-center">
            {[
              { label: goodsType, color: 'bg-indigo-900/60 text-indigo-300' },
              { label: `${avgTemperature.toFixed(1)}°C`, color: 'bg-sky-900/60 text-sky-300' },
              { label: `Spoilage in ${timeToSpoilageHours.toFixed(1)}h`, color: 'bg-red-900/60 text-red-300' },
              { label: `${discountOffered}% offered`, color: 'bg-amber-900/60 text-amber-300' },
            ].map((c) => (
              <span key={c.label} className={`${c.color} text-[10px] px-2 py-0.5 rounded-full font-medium`}>{c.label}</span>
            ))}
          </div>

          {/* Deal banners */}
          {dealStatus === 'accepted' && (
            <div className="mx-5 mb-3 p-3 bg-emerald-900/50 border border-emerald-500/40 rounded-xl text-emerald-300 text-sm flex items-center justify-between">
              <span className="flex items-center gap-1.5 font-semibold"><CheckCircle className="w-4 h-4" /> Deal Accepted!</span>
              <span className="font-bold text-emerald-200">${recoveryUsd.toLocaleString()} recovered</span>
            </div>
          )}
          {dealStatus === 'declined' && (
            <div className="mx-5 mb-3 p-3 bg-red-900/50 border border-red-500/40 rounded-xl text-red-300 text-sm flex items-center gap-1.5">
              <XCircle className="w-4 h-4" /><span className="font-semibold">Deal Declined</span>
            </div>
          )}

          {/* Transcript */}
          <div
            ref={transcriptRef}
            className="flex-1 overflow-y-auto px-4 pb-2 space-y-2.5 max-h-56 min-h-[100px]"
            style={{ scrollbarWidth: 'thin', scrollbarColor: '#334155 transparent' }}
          >
            {!callStarted && (
              <div className="flex items-center justify-center h-full py-8">
                <p className="text-white/30 text-xs text-center">Press <strong className="text-white/50">Start Call</strong> to begin negotiation</p>
              </div>
            )}
            {history.map((msg, i) => {
              const isAgent = msg.role === 'agent';
              return (
                <div key={i} className={`flex ${isAgent ? 'justify-start' : 'justify-end'}`}>
                  <div className={`max-w-[82%] px-3 py-2 rounded-2xl text-[12px] leading-relaxed ${isAgent ? 'bg-white/10 text-white/90 rounded-tl-sm' : 'bg-emerald-600/80 text-white rounded-tr-sm'}`}>
                    <p className={`text-[10px] mb-0.5 font-medium ${isAgent ? 'text-white/40' : 'text-emerald-200/70'}`}>
                      {isAgent ? businessName : 'You'}
                    </p>
                    {msg.text}
                  </div>
                </div>
              );
            })}
            {liveTranscript && (
              <div className="flex justify-end">
                <div className="max-w-[82%] px-3 py-2 rounded-2xl rounded-tr-sm bg-emerald-600/30 text-white/50 text-[12px] italic border border-emerald-500/20">
                  {liveTranscript}…
                </div>
              </div>
            )}
          </div>

          {/* Controls */}
          <div className="p-4 border-t border-white/10 space-y-3">
            {!callStarted && (
              <button
                onClick={startCall}
                className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-sm rounded-xl flex items-center justify-center gap-2 transition-all shadow-lg"
              >
                <PhoneOff className="w-4 h-4 rotate-[135deg]" />
                Start Call with {businessName}
              </button>
            )}

            {callStarted && !isDone && (
              <>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={textInput}
                    onChange={(e) => setTextInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleTextSend()}
                    placeholder="Type your message or use mic…"
                    disabled={isLoading || isAgentSpeaking}
                    className="flex-1 bg-white/10 text-white placeholder-white/30 text-xs px-3 py-2 rounded-xl border border-white/10 outline-none focus:border-emerald-500/50 transition-colors disabled:opacity-40"
                  />
                  <button
                    onClick={handleTextSend}
                    disabled={!textInput.trim() || isLoading || isAgentSpeaking}
                    className="p-2 bg-emerald-600 hover:bg-emerald-500 rounded-xl text-white disabled:opacity-40 transition-colors"
                  >
                    <Send className="w-4 h-4" />
                  </button>
                </div>

                {SpeechRecognition && (
                  <div className="flex flex-col items-center gap-1">
                    <button
                      onMouseDown={startListening}
                      onMouseUp={stopListening}
                      onTouchStart={startListening}
                      onTouchEnd={stopListening}
                      disabled={isLoading || isAgentSpeaking}
                      className={`w-14 h-14 rounded-full flex items-center justify-center text-white transition-all disabled:opacity-40 ${isListening ? 'bg-red-600 mic-pulse-anim' : 'bg-white/10 hover:bg-white/20 border border-white/20'}`}
                    >
                      {isListening ? <Mic className="w-6 h-6" /> : <MicOff className="w-6 h-6 text-white/50" />}
                    </button>
                    <p className="text-white/30 text-[10px]">{isListening ? 'Release to send' : 'Hold to speak'}</p>
                  </div>
                )}
              </>
            )}

            {isDone && (
              <button
                onClick={() => { window.speechSynthesis?.cancel(); onClose(); }}
                className={`w-full py-2.5 font-semibold text-sm rounded-xl flex items-center justify-center gap-2 transition-all ${dealStatus === 'accepted' ? 'bg-emerald-600 hover:bg-emerald-500 text-white' : 'bg-white/10 hover:bg-white/20 text-white/70'}`}
              >
                {dealStatus === 'accepted'
                  ? <><CheckCircle className="w-4 h-4" /> Approve Diversion & Close</>
                  : <><XCircle className="w-4 h-4" /> Close Call</>
                }
              </button>
            )}
          </div>
        </div>
      </div>
    </>
  );
};
