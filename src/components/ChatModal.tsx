import React, { useState, useEffect, useRef } from 'react';
import { useSwap } from '../context/SwapContext';
import { 
  X, 
  Send, 
  Image as ImageIcon, 
  Paperclip, 
  ShieldCheck, 
  MapPin, 
  ArrowLeftRight, 
  Coins, 
  CheckCheck,
  Building2,
  ChevronLeft
} from 'lucide-react';

interface ChatModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenPayment?: (swapId: string) => void;
  onOpenSwap?: (itemId: string) => void;
}

export const ChatModal: React.FC<ChatModalProps> = ({ 
  isOpen, 
  onClose,
  onOpenPayment,
  onOpenSwap
}) => {
  const { 
    currentUser, 
    allStudents, 
    items, 
    swaps, 
    messages, 
    activeChatPeerId, 
    activeChatItemId, 
    openChat, 
    sendMessage 
  } = useSwap();

  const [messageInput, setMessageInput] = useState('');
  const [selectedPeerId, setSelectedPeerId] = useState<string>(activeChatPeerId || 'user-brian');
  const [isMobileListOpen, setIsMobileListOpen] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (activeChatPeerId) {
      setSelectedPeerId(activeChatPeerId);
    }
  }, [activeChatPeerId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, selectedPeerId]);

  if (!isOpen) return null;

  const peer = allStudents.find(s => s.id === selectedPeerId) || allStudents[1];
  const relatedItem = activeChatItemId ? items.find(i => i.id === activeChatItemId) : null;

  // Filter messages between currentUser and selectedPeer
  const conversation = messages.filter(
    m => (m.senderId === currentUser.id && m.receiverId === selectedPeerId) ||
         (m.senderId === selectedPeerId && m.receiverId === currentUser.id)
  );

  // Check if there is an active swap with this peer
  const activeSwap = swaps.find(
    s => (s.proposerId === currentUser.id && s.receiverId === selectedPeerId) ||
         (s.proposerId === selectedPeerId && s.receiverId === currentUser.id)
  );

  const handleSend = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!messageInput.trim()) return;

    sendMessage(selectedPeerId, messageInput.trim(), activeChatItemId || undefined);
    setMessageInput('');
  };

  const handleQuickPrompt = (prompt: string) => {
    sendMessage(selectedPeerId, prompt, activeChatItemId || undefined);
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      if (typeof event.target?.result === 'string') {
        sendMessage(selectedPeerId, 'Sent an image attachment', activeChatItemId || undefined, event.target.result);
      }
    };
    reader.readAsDataURL(file);
  };

  // Contacts list (all students except currentUser)
  const contacts = allStudents.filter(s => s.id !== currentUser.id);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/75 backdrop-blur-md overflow-hidden animate-in fade-in duration-200">
      <div 
        className="relative w-full max-w-4xl bg-white dark:bg-[#151519] border border-neutral-200 dark:border-neutral-800 rounded-3xl shadow-2xl overflow-hidden my-auto text-neutral-900 dark:text-neutral-100 flex h-[85vh] max-h-[750px]"
        onClick={e => e.stopPropagation()}
      >
        {/* Sidebar: Peer Contacts List */}
        <div className={`w-full sm:w-72 bg-neutral-50 dark:bg-[#111114] border-r border-neutral-200 dark:border-neutral-800/80 flex flex-col ${
          isMobileListOpen ? 'block' : 'hidden sm:flex'
        }`}>
          <div className="p-4 border-b border-neutral-200 dark:border-neutral-800 flex items-center justify-between">
            <h3 className="font-bold text-sm tracking-tight text-neutral-900 dark:text-white flex items-center gap-2">
              Campus Chatroom
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            </h3>
            <span className="text-[10px] text-neutral-400 font-mono">
              {contacts.length} peers
            </span>
          </div>

          <div className="flex-1 overflow-y-auto divide-y divide-neutral-100 dark:divide-neutral-800/40">
            {contacts.map(student => {
              const isSelected = student.id === selectedPeerId;
              const lastMsg = [...messages]
                .reverse()
                .find(
                  m => (m.senderId === student.id && m.receiverId === currentUser.id) ||
                       (m.senderId === currentUser.id && m.receiverId === student.id)
                );

              return (
                <button
                  key={student.id}
                  onClick={() => {
                    setSelectedPeerId(student.id);
                    setIsMobileListOpen(false);
                  }}
                  className={`w-full p-3.5 flex items-center gap-3 text-left transition-colors cursor-pointer ${
                    isSelected
                      ? 'bg-rose-50/80 dark:bg-rose-950/30 border-l-3 border-rose-500'
                      : 'hover:bg-neutral-100/60 dark:hover:bg-neutral-800/40'
                  }`}
                >
                  <div className="relative shrink-0">
                    <img
                      src={student.avatar}
                      alt={student.name}
                      className="w-10 h-10 rounded-full object-cover border border-neutral-200 dark:border-neutral-700"
                     referrerPolicy="no-referrer"/>
                    <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-500 border-2 border-white dark:border-neutral-900" />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <h4 className="text-xs font-bold text-neutral-900 dark:text-white truncate">
                        {student.name}
                      </h4>
                      {lastMsg && (
                        <span className="text-[10px] text-neutral-400 font-mono shrink-0">
                          {lastMsg.timestamp}
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-neutral-500 dark:text-neutral-400 truncate mt-0.5">
                      {lastMsg ? lastMsg.text : `${student.campus.split(' ')[0]}`}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Main Chat Area */}
        <div className={`flex-1 flex flex-col bg-white dark:bg-[#151519] ${
          isMobileListOpen ? 'hidden sm:flex' : 'flex'
        }`}>
          {/* Chat Header */}
          <div className="p-3.5 sm:p-4 border-b border-neutral-200 dark:border-neutral-800 flex items-center justify-between bg-white dark:bg-[#151519]">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setIsMobileListOpen(true)}
                className="sm:hidden p-1.5 text-neutral-600 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-lg cursor-pointer"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>

              <div className="relative">
                <img
                  src={peer.avatar}
                  alt={peer.name}
                  className="w-10 h-10 rounded-full object-cover border border-neutral-200 dark:border-neutral-700"
                 referrerPolicy="no-referrer"/>
                <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-500 border-2 border-white dark:border-neutral-900" />
              </div>

              <div>
                <h3 className="font-bold text-sm text-neutral-900 dark:text-white flex items-center gap-1.5">
                  {peer.name}
                  <span className="text-[11px] font-normal text-neutral-400">{peer.handle}</span>
                </h3>
                <p className="text-[11px] text-neutral-500 dark:text-neutral-400 flex items-center gap-1">
                  <Building2 className="w-3 h-3 text-neutral-400" />
                  {peer.campus} • {peer.dorm}
                </p>
              </div>
            </div>

            {/* Header Actions */}
            <div className="flex items-center gap-2">
              {activeSwap && onOpenPayment && (
                <button
                  onClick={() => onOpenPayment(activeSwap.id)}
                  className="px-3 py-1.5 bg-amber-500/15 hover:bg-amber-500/25 text-amber-700 dark:text-amber-400 border border-amber-500/30 rounded-full text-xs font-bold flex items-center gap-1 cursor-pointer transition-colors"
                >
                  <Coins className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Binance M-Pesa</span>
                  <span className="sm:hidden">P2P</span>
                </button>
              )}

              <button
                onClick={onClose}
                className="p-2 text-neutral-400 hover:text-neutral-800 dark:hover:text-white rounded-full hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Optional: Related Item Top Banner */}
          {relatedItem && (
            <div className="px-4 py-2 bg-neutral-50 dark:bg-neutral-800/40 border-b border-neutral-200 dark:border-neutral-800/80 flex items-center justify-between text-xs">
              <div className="flex items-center gap-2.5 min-w-0">
                <img
                  src={relatedItem.images[0]}
                  alt={relatedItem.title}
                  className="w-8 h-8 rounded-lg object-cover border border-neutral-200 dark:border-neutral-700 shrink-0"
                 referrerPolicy="no-referrer"/>
                <div className="min-w-0">
                  <span className="text-[10px] text-neutral-400 uppercase font-semibold">Discussing Item:</span>
                  <p className="font-bold text-neutral-900 dark:text-white truncate">{relatedItem.title}</p>
                </div>
              </div>

              <span className="font-mono font-bold text-neutral-700 dark:text-neutral-300 shrink-0">
                KSh {relatedItem.estMarketValue.toLocaleString()}
              </span>
            </div>
          )}

          {/* Messages Stream */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3.5">
            {conversation.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-6 text-neutral-400 space-y-2">
                <span className="text-3xl">👋</span>
                <p className="text-xs font-medium">
                  Start the conversation with {peer.name.split(' ')[0]}!
                </p>
                <p className="text-[11px] text-neutral-400 max-w-xs">
                  Negotiate your wardrobe swap, ask for fabric details, or coordinate a safe campus meetup spot.
                </p>
              </div>
            ) : (
              conversation.map(msg => {
                const isMe = msg.senderId === currentUser.id;
                return (
                  <div
                    key={msg.id}
                    className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}
                  >
                    <div
                      className={`max-w-[80%] sm:max-w-md rounded-2xl px-4 py-2.5 text-xs ${
                        isMe
                          ? 'bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 rounded-br-xs'
                          : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-900 dark:text-white rounded-bl-xs'
                      }`}
                    >
                      {msg.attachment && (
                        <div className="mb-2 rounded-xl overflow-hidden border border-black/10 dark:border-white/10">
                          <img
                            src={msg.attachment}
                            alt="Attachment"
                            className="max-h-48 w-full object-cover"
                           referrerPolicy="no-referrer"/>
                        </div>
                      )}
                      <p className="whitespace-pre-wrap leading-relaxed">{msg.text}</p>
                    </div>

                    <span className="text-[10px] font-mono text-neutral-400 mt-1 px-1">
                      {msg.timestamp}
                    </span>
                  </div>
                );
              })
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick Prompt Chips */}
          <div className="px-4 py-2 bg-neutral-50/50 dark:bg-neutral-900/30 border-t border-neutral-100 dark:border-neutral-800/60 overflow-x-auto flex items-center gap-1.5 text-[11px] no-scrollbar">
            {[
              'Is this still available?',
              'Freshly laundered & sanitized?',
              'Can we meet at the campus library?',
              'I uploaded the M-Pesa screenshot!',
              'Can you do tomorrow 2 PM?'
            ].map(prompt => (
              <button
                key={prompt}
                onClick={() => handleQuickPrompt(prompt)}
                className="px-2.5 py-1 bg-white dark:bg-neutral-800 hover:bg-neutral-100 dark:hover:bg-neutral-700 text-neutral-700 dark:text-neutral-300 border border-neutral-200 dark:border-neutral-700 rounded-full whitespace-nowrap cursor-pointer transition-colors"
              >
                {prompt}
              </button>
            ))}
          </div>

          {/* Message Input Box */}
          <form onSubmit={handleSend} className="p-3 sm:p-4 border-t border-neutral-200 dark:border-neutral-800 bg-white dark:bg-[#151519] flex items-center gap-2">
            <label className="p-2 text-neutral-500 hover:text-neutral-800 dark:hover:text-white rounded-full hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors cursor-pointer"
                   title="Attach photo or M-Pesa proof">
              <ImageIcon className="w-5 h-5" />
              <input
                type="file"
                accept="image/*"
                onChange={handlePhotoUpload}
                className="hidden"
              />
            </label>

            <input
              type="text"
              value={messageInput}
              onChange={e => setMessageInput(e.target.value)}
              placeholder={`Message ${peer.name.split(' ')[0]}...`}
              className="flex-1 px-4 py-2.5 bg-neutral-100 dark:bg-neutral-800/80 border border-neutral-200 dark:border-neutral-700 rounded-full text-xs text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-rose-500"
            />

            <button
              type="submit"
              disabled={!messageInput.trim()}
              className={`p-2.5 rounded-full transition-all cursor-pointer ${
                messageInput.trim()
                  ? 'bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 shadow-sm active:scale-95'
                  : 'bg-neutral-200 dark:bg-neutral-800 text-neutral-400 cursor-not-allowed'
              }`}
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
