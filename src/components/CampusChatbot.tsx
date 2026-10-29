import React, { useState, useRef, useEffect } from 'react';
import { useSwap } from '../context/SwapContext';
import { 
  Bot, 
  X, 
  Send, 
  Sparkles, 
  Minimize2, 
  Maximize2,
  Shirt,
  ShieldCheck,
  Smartphone,
  Gem,
  Backpack
} from 'lucide-react';

export const CampusChatbot: React.FC = () => {
  const { currentCampus, userPreferences } = useSwap();
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [messages, setMessages] = useState<Array<{ sender: 'bot' | 'user'; text: string; time: string }>>([
    {
      sender: 'bot',
      text: "Sasa! I'm UniBot, your campus wardrobe swap & style AI assistant. Ask me about matching jewelry or bags to your outfits, checking fabric quality, or how our Binance-style M-Pesa verification works!",
      time: 'Just now'
    }
  ]);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen]);

  const handleSend = async (messageText?: string) => {
    const query = (messageText || input).trim();
    if (!query || isLoading) return;

    const now = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    // Add user message
    setMessages(prev => [...prev, { sender: 'user', text: query, time: now }]);
    if (!messageText) setInput('');
    setIsLoading(true);

    try {
      const res = await fetch('/api/ai/chatbot', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: query,
          campus: currentCampus,
          vibes: userPreferences.vibes
        })
      });

      const data = await res.json();
      const replyTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

      setMessages(prev => [
        ...prev,
        {
          sender: 'bot',
          text: data.reply || "Sasa! I'm here to help with campus style advice and swap safety.",
          time: replyTime
        }
      ]);
    } catch (err) {
      console.error(err);
      setMessages(prev => [
        ...prev,
        {
          sender: 'bot',
          text: "Sasa! For campus exchanges, always stick to verified public spots like the campus library or student center, and check your M-Pesa balance before confirming item release!",
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const QUICK_PROMPTS = [
    { label: 'Binance M-Pesa Flow', icon: Smartphone, query: 'How does the Binance-style M-Pesa payment and screenshot verification work?' },
    { label: 'Pairing Jewelry', icon: Gem, query: 'What jewelry and rings pair well with washed vintage denim and tees?' },
    { label: 'Campus Bags', icon: Backpack, query: 'What bags are best for campus laptops and hostel commuting?' },
    { label: 'Cleanliness Rating', icon: ShieldCheck, query: 'How does the Cleanliness & Fabric Quality rating system work?' }
  ];

  return (
    <>
      {/* Floating Trigger Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-5 right-5 z-40 px-4 py-2.5 bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 rounded-full shadow-xl hover:shadow-2xl flex items-center gap-2.5 font-bold text-xs cursor-pointer border border-neutral-700 dark:border-neutral-300 transition-all hover:scale-105 active:scale-95 group"
          aria-label="Open UniBot AI Assistant"
        >
          <div className="relative">
            <Bot className="w-4 h-4 text-rose-400 group-hover:rotate-12 transition-transform" />
            <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
          </div>
          <span>UniBot AI</span>
          <span className="text-[10px] opacity-75 font-normal hidden sm:inline">• Campus Guide</span>
        </button>
      )}

      {/* Expanded Chat Drawer */}
      {isOpen && (
        <div className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-50 w-[92vw] sm:w-[380px] h-[520px] bg-white dark:bg-[#151519] border border-neutral-200 dark:border-neutral-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col animate-in slide-in-from-bottom-5 duration-200 text-neutral-900 dark:text-neutral-100">
          {/* Header */}
          <div className="p-4 bg-gradient-to-r from-neutral-900 via-neutral-800 to-neutral-950 text-white flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-rose-500/20 text-rose-400 border border-rose-500/40 flex items-center justify-center">
                <Bot className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-xs font-bold flex items-center gap-1.5">
                  UniBot Assistant
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                </h3>
                <p className="text-[10px] text-neutral-400">
                  Campus Stylist &amp; Swap Guide
                </p>
              </div>
            </div>

            <button
              onClick={() => setIsOpen(false)}
              className="p-1.5 text-neutral-400 hover:text-white rounded-full hover:bg-neutral-800 transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Messages Stream */}
          <div className="flex-1 p-3.5 overflow-y-auto space-y-3 bg-[#fafafa] dark:bg-[#101014] text-xs">
            {messages.map((m, idx) => (
              <div
                key={idx}
                className={`flex flex-col ${m.sender === 'user' ? 'items-end' : 'items-start'}`}
              >
                <div
                  className={`max-w-[85%] rounded-2xl px-3.5 py-2.5 leading-relaxed ${
                    m.sender === 'user'
                      ? 'bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 rounded-br-xs'
                      : 'bg-white dark:bg-neutral-800/90 text-neutral-800 dark:text-neutral-200 border border-neutral-200/80 dark:border-neutral-700/60 rounded-bl-xs shadow-2xs'
                  }`}
                >
                  <p className="whitespace-pre-line">{m.text}</p>
                </div>
                <span className="text-[9px] font-mono text-neutral-400 mt-1 px-1">
                  {m.time}
                </span>
              </div>
            ))}

            {isLoading && (
              <div className="flex items-center gap-2 p-2.5 bg-white dark:bg-neutral-800/80 border border-neutral-200 dark:border-neutral-700 rounded-2xl w-fit text-neutral-500 text-xs">
                <Sparkles className="w-3.5 h-3.5 text-amber-500 animate-spin" />
                <span>UniBot is thinking...</span>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick Query Pills */}
          <div className="p-2 bg-neutral-50 dark:bg-neutral-900/60 border-t border-neutral-100 dark:border-neutral-800/80 overflow-x-auto flex gap-1.5 no-scrollbar">
            {QUICK_PROMPTS.map((q, i) => {
              const Icon = q.icon;
              return (
                <button
                  key={i}
                  onClick={() => handleSend(q.query)}
                  className="px-2.5 py-1 bg-white dark:bg-neutral-800 hover:bg-neutral-100 dark:hover:bg-neutral-700 text-neutral-700 dark:text-neutral-300 border border-neutral-200 dark:border-neutral-700 rounded-full text-[10px] font-medium whitespace-nowrap flex items-center gap-1 cursor-pointer transition-colors"
                >
                  <Icon className="w-3 h-3 text-rose-500" />
                  {q.label}
                </button>
              );
            })}
          </div>

          {/* Input Form */}
          <form
            onSubmit={e => {
              e.preventDefault();
              handleSend();
            }}
            className="p-3 bg-white dark:bg-[#151519] border-t border-neutral-200 dark:border-neutral-800 flex items-center gap-2"
          >
            <input
              type="text"
              value={input}
              onChange={e => setInput(e.target.value)}
              placeholder="Ask UniBot about fits, jewelry, M-Pesa..."
              className="flex-1 px-3.5 py-2 bg-neutral-100 dark:bg-neutral-800/80 border border-neutral-200 dark:border-neutral-700 rounded-full text-xs text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-rose-500"
            />
            <button
              type="submit"
              disabled={!input.trim() || isLoading}
              className={`p-2 rounded-full transition-all cursor-pointer ${
                input.trim() && !isLoading
                  ? 'bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 shadow-sm active:scale-95'
                  : 'bg-neutral-200 dark:bg-neutral-800 text-neutral-400 cursor-not-allowed'
              }`}
            >
              <Send className="w-3.5 h-3.5" />
            </button>
          </form>
        </div>
      )}
    </>
  );
};
