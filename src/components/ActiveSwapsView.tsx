import React, { useState } from 'react';
import { SwapProposal } from '../types';
import { useSwap } from '../context/SwapContext';
import { 
  ArrowLeftRight, 
  Check, 
  Clock, 
  MapPin, 
  ShieldCheck, 
  Star, 
  Coins, 
  UserCheck, 
  X, 
  Sparkles,
  QrCode,
  CheckCircle2,
  AlertCircle,
  Smartphone,
  Calendar,
  MessageCircle,
  FileCheck
} from 'lucide-react';

interface ActiveSwapsViewProps {
  onOpenReviewModal: (swap: SwapProposal) => void;
  onOpenPaymentModal?: (swap: SwapProposal) => void;
}

const FALLBACK_GARMENT_SVG = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="300" height="300" viewBox="0 0 24 24" fill="none" stroke="%2394a3b8" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" style="background:%23f1f5f9;"><path d="M20.38 3.46 16 2a4 4 0 0 1-8 0L3.62 3.46a2 2 0 0 0-1.34 2.23l.58 3.47a1 1 0 0 0 .99.84H6v10c0 1.1.9 2 2 2h8a2 2 0 0 0 2-2V10h2.15a1 1 0 0 0 .99-.84l.58-3.47a2 2 0 0 0-1.34-2.23z"/></svg>`;
const FALLBACK_AVATAR_SVG = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 24 24" fill="%23cbd5e1" style="background:%23f1f5f9;"><path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/></svg>`;

const handleGarmentError = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
  const target = e.currentTarget;
  if (!target.dataset.fallback) {
    target.dataset.fallback = 'true';
    target.src = FALLBACK_GARMENT_SVG;
  }
};

const handleAvatarError = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
  const target = e.currentTarget;
  if (!target.dataset.fallback) {
    target.dataset.fallback = 'true';
    target.src = FALLBACK_AVATAR_SVG;
  }
};

export const ActiveSwapsView: React.FC<ActiveSwapsViewProps> = ({ 
  onOpenReviewModal,
  onOpenPaymentModal 
}) => {
  const { 
    currentUser, 
    allStudents, 
    items, 
    swaps, 
    agreeFabric, 
    agreeMeetup, 
    acceptSwap, 
    declineSwap, 
    confirmHandover,
    openChat
  } = useSwap();

  const [filterTab, setFilterTab] = useState<'all' | 'needs_action' | 'scheduled' | 'needs_rating'>('all');

  // Filter user's swaps
  const userSwaps = swaps.filter(
    s => s.proposerId === currentUser.id || s.receiverId === currentUser.id
  );

  const filteredSwaps = userSwaps.filter(s => {
    const isProposer = s.proposerId === currentUser.id;
    if (filterTab === 'needs_action') {
      if (s.status === 'pending' && !isProposer) return true;
      if (s.status === 'meetup_scheduled' && !s.handoverConfirmedByProposer) return true;
      if (s.paymentStatus === 'payment_sent' && !isProposer) return true;
      return false;
    }
    if (filterTab === 'scheduled') return s.status === 'meetup_scheduled';
    if (filterTab === 'needs_rating') {
      return s.status === 'completed' && ((isProposer && !s.proposerRated) || (!isProposer && !s.receiverRated));
    }
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="p-6 bg-white dark:bg-[#18181c] border border-[#dbdbdb] dark:border-neutral-800 rounded-3xl flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-2xs">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-bold uppercase tracking-wider text-neutral-500 dark:text-neutral-400">
              Campus Wardrobe Exchanges
            </span>
          </div>
          <h2 className="text-xl font-bold text-neutral-900 dark:text-white flex items-center gap-2">
            <ArrowLeftRight className="w-5 h-5 text-neutral-900 dark:text-white" />
            Trade Agreements, P2P M-Pesa &amp; Handover Passes
          </h2>
          <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1 max-w-xl">
            Agree on fabric quality, verify M-Pesa payments with Binance-style escrow proofs, and meet safely on campus. Completed trades award <strong className="text-neutral-900 dark:text-white">+50 Points</strong>!
          </p>
        </div>

        <div className="px-4 py-2 matte-glass rounded-2xl flex items-center gap-2 text-xs font-semibold text-neutral-800 dark:text-neutral-200 shrink-0">
          <Coins className="w-4 h-4 text-amber-500" />
          <span>Active Balance: <strong className="font-mono text-neutral-900 dark:text-white">{currentUser.points} pts</strong></span>
        </div>
      </div>

      {/* Tabs Filter */}
      <div className="flex items-center gap-2 p-1.5 bg-neutral-100/80 dark:bg-[#18181c]/80 rounded-2xl border border-neutral-200/80 dark:border-neutral-800 overflow-x-auto">
        <button
          onClick={() => setFilterTab('all')}
          className={`px-4 py-2 text-xs font-bold rounded-xl transition-all whitespace-nowrap cursor-pointer ${
            filterTab === 'all'
              ? 'bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white shadow-sm'
              : 'text-neutral-500 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white'
          }`}
        >
          All Exchanges ({userSwaps.length})
        </button>

        <button
          onClick={() => setFilterTab('needs_action')}
          className={`px-4 py-2 text-xs font-bold rounded-xl transition-all whitespace-nowrap cursor-pointer ${
            filterTab === 'needs_action'
              ? 'bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white shadow-sm'
              : 'text-neutral-500 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white'
          }`}
        >
          Action Required
        </button>

        <button
          onClick={() => setFilterTab('scheduled')}
          className={`px-4 py-2 text-xs font-bold rounded-xl transition-all whitespace-nowrap cursor-pointer ${
            filterTab === 'scheduled'
              ? 'bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white shadow-sm'
              : 'text-neutral-500 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white'
          }`}
        >
          Meetups Scheduled ({userSwaps.filter(s => s.status === 'meetup_scheduled').length})
        </button>

        <button
          onClick={() => setFilterTab('needs_rating')}
          className={`px-4 py-2 text-xs font-bold rounded-xl transition-all whitespace-nowrap cursor-pointer ${
            filterTab === 'needs_rating'
              ? 'bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white shadow-sm'
              : 'text-neutral-500 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white'
          }`}
        >
          Ready to Rate
        </button>
      </div>

      {/* Swaps List */}
      {filteredSwaps.length === 0 ? (
        <div className="p-12 text-center bg-white dark:bg-[#18181c] border border-[#dbdbdb] dark:border-neutral-800 rounded-3xl">
          <ArrowLeftRight className="w-10 h-10 text-neutral-300 dark:text-neutral-600 mx-auto mb-3" />
          <h3 className="text-sm font-bold text-neutral-800 dark:text-neutral-200">No exchanges found in this tab</h3>
          <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1 max-w-sm mx-auto">
            Browse the Campus Rack to propose a swap, or switch to another student profile to manage incoming exchanges.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredSwaps.map(swap => {
            const isProposer = swap.proposerId === currentUser.id;
            const otherUserId = isProposer ? swap.receiverId : swap.proposerId;
            const otherUser = allStudents.find(s => s.id === otherUserId);

            const offeredItem = items.find(i => i.id === swap.offeredItemId);
            const requestedItem = items.find(i => i.id === swap.requestedItemId);

            const myItem = isProposer ? offeredItem : requestedItem;
            const theirItem = isProposer ? requestedItem : offeredItem;

            const bothAgreedFabric = swap.proposerAgreedFabric && swap.receiverAgreedFabric;
            const bothAgreedMeetup = swap.proposerAgreedMeetup && swap.receiverAgreedMeetup;

            const isPendingReceiverAgreement = swap.status === 'pending' && !isProposer;
            const isCompleted = swap.status === 'completed';
            const userAlreadyRated = isProposer ? swap.proposerRated : swap.receiverRated;

            const isPaymentSent = swap.paymentStatus === 'payment_sent';
            const isPaymentVerified = swap.paymentStatus === 'payment_verified';
            const hasCash = (swap.cashAmount || 0) > 0 || swap.paymentRequired;

            return (
              <div 
                key={swap.id}
                className="bg-white dark:bg-[#18181c] border border-[#dbdbdb] dark:border-neutral-800 rounded-3xl p-5 sm:p-6 shadow-[0_1px_3px_rgba(0,0,0,0.03)] hover:shadow-[0_8px_20px_rgba(0,0,0,0.04)] dark:hover:shadow-[0_8px_20px_rgba(0,0,0,0.3)] transition-all space-y-4"
              >
                {/* Header Status & Peer Info */}
                <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-neutral-100 dark:border-neutral-800">
                  <div className="flex items-center gap-3">
                    <img
                      src={otherUser?.avatar}
                      alt={otherUser?.name}
                      onError={handleAvatarError}
                      className="w-10 h-10 rounded-full object-cover border border-neutral-200 dark:border-neutral-700"
                     referrerPolicy="no-referrer"/>

                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-neutral-900 dark:text-white">{otherUser?.name}</span>
                        <span className="text-xs text-neutral-400 dark:text-neutral-500">({otherUser?.campus.split(' ')[0]})</span>
                        <span className="text-xs text-amber-500 font-bold">★ {otherUser?.rating}</span>
                      </div>
                      <div className="text-xs text-neutral-500 dark:text-neutral-400">
                        {isProposer ? 'You initiated this swap proposal' : `${otherUser?.name} sent you this swap proposal`}
                      </div>
                    </div>
                  </div>

                  {/* Actions & Status Indicator */}
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => openChat(otherUser?.id, theirItem?.id)}
                      className="px-3 py-1.5 matte-glass-btn text-xs font-bold text-neutral-800 dark:text-neutral-200 rounded-full flex items-center gap-1.5 cursor-pointer"
                    >
                      <MessageCircle className="w-3.5 h-3.5 text-rose-500" />
                      <span>Chat</span>
                    </button>

                    {swap.status === 'pending' && (
                      <span className="px-3 py-1 bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-800 rounded-full text-xs font-bold flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5 text-amber-600" />
                        Awaiting Mutual Agreement
                      </span>
                    )}
                    {swap.status === 'meetup_scheduled' && (
                      <span className="px-3 py-1 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 rounded-full text-xs font-bold flex items-center gap-1.5">
                        <MapPin className="w-3.5 h-3.5 text-emerald-600" />
                        Meetup Scheduled
                      </span>
                    )}
                    {swap.status === 'completed' && (
                      <span className="px-3 py-1 bg-blue-50 dark:bg-blue-950/40 text-blue-800 dark:text-blue-300 border border-blue-200 dark:border-blue-800 rounded-full text-xs font-bold flex items-center gap-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5 text-blue-600" />
                        Exchange Completed
                      </span>
                    )}
                  </div>
                </div>

                {/* Items Exchanged Side-by-Side */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Your Item */}
                  <div className="p-3.5 bg-neutral-50 dark:bg-neutral-800/60 rounded-2xl border border-neutral-200 dark:border-neutral-700/60 flex items-center gap-3">
                    <img
                      src={myItem?.images[0]}
                      alt={myItem?.title}
                      onError={handleGarmentError}
                      className="w-16 h-16 rounded-xl object-cover border border-neutral-200 dark:border-neutral-700 shrink-0 bg-neutral-100 dark:bg-neutral-800"
                     referrerPolicy="no-referrer"/>
                    <div className="min-w-0 flex-1">
                      <span className="text-[10px] font-bold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">You Give</span>
                      <h4 className="text-xs font-bold text-neutral-900 dark:text-white line-clamp-1">{myItem?.title}</h4>
                      <p className="text-[11px] text-neutral-500 dark:text-neutral-400 font-mono truncate">{myItem?.fabric}</p>
                      <p className="text-[11px] text-neutral-800 dark:text-neutral-200 font-semibold">Value: KSh {myItem?.estMarketValue.toLocaleString()}</p>
                    </div>
                  </div>

                  {/* Their Item */}
                  <div className="p-3.5 bg-neutral-50 dark:bg-neutral-800/60 rounded-2xl border border-neutral-200 dark:border-neutral-700/60 flex items-center gap-3">
                    <img
                      src={theirItem?.images[0]}
                      alt={theirItem?.title}
                      onError={handleGarmentError}
                      className="w-16 h-16 rounded-xl object-cover border border-neutral-200 dark:border-neutral-700 shrink-0 bg-neutral-100 dark:bg-neutral-800"
                     referrerPolicy="no-referrer"/>
                    <div className="min-w-0 flex-1">
                      <span className="text-[10px] font-bold text-rose-600 dark:text-rose-400 uppercase tracking-wider">You Receive</span>
                      <h4 className="text-xs font-bold text-neutral-900 dark:text-white line-clamp-1">{theirItem?.title}</h4>
                      <p className="text-[11px] text-neutral-500 dark:text-neutral-400 font-mono truncate">{theirItem?.fabric}</p>
                      <p className="text-[11px] text-neutral-800 dark:text-neutral-200 font-semibold">Value: KSh {theirItem?.estMarketValue.toLocaleString()}</p>
                    </div>
                  </div>
                </div>

                {/* BINANCE P2P M-PESA PAYMENT BAR (IF CASH TOPUP INVOLVED) */}
                {hasCash && (
                  <div className="p-4 bg-amber-50/80 dark:bg-amber-950/25 border border-amber-200 dark:border-amber-800/60 rounded-2xl space-y-2.5">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <Smartphone className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                        <span className="font-bold text-xs text-amber-950 dark:text-amber-200">
                          Binance P2P M-Pesa Escrow: KSh {(swap.paymentAmount || swap.cashAmount || 400).toLocaleString()}
                        </span>
                      </div>

                      <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full ${
                        isPaymentVerified
                          ? 'bg-emerald-500/20 text-emerald-800 dark:text-emerald-300 border border-emerald-500/30'
                          : isPaymentSent
                          ? 'bg-blue-500/20 text-blue-800 dark:text-blue-300 border border-blue-500/30'
                          : 'bg-amber-500/20 text-amber-800 dark:text-amber-300 border border-amber-500/30'
                      }`}>
                        {isPaymentVerified
                          ? '🔒 Payment Verified & Locked'
                          : isPaymentSent
                          ? '📸 M-Pesa Proof Submitted • Verification Needed'
                          : 'Pending M-Pesa Transfer'}
                      </span>
                    </div>

                    <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
                      <p className="text-[11px] text-neutral-600 dark:text-neutral-300">
                        {isPaymentVerified 
                          ? 'Funds confirmed! Safe to proceed to physical item handover.'
                          : isPaymentSent
                          ? `Code: ${swap.mpesaTransactionCode || 'SJD82LK190'}. Please review screenshot proof.`
                          : 'Buyer transfers via M-Pesa and uploads SMS screenshot proof.'}
                      </p>

                      {onOpenPaymentModal && (
                        <button
                          onClick={() => onOpenPaymentModal(swap)}
                          className="px-4 py-1.5 bg-amber-500 hover:bg-amber-600 text-black font-extrabold text-xs rounded-xl shadow-xs transition-transform active:scale-95 cursor-pointer flex items-center gap-1.5"
                        >
                          <FileCheck className="w-3.5 h-3.5" />
                          <span>{isPaymentSent ? 'Verify / View Proof' : 'Upload M-Pesa Proof'}</span>
                        </button>
                      )}
                    </div>
                  </div>
                )}

                {/* DATE OF EXCHANGE & MEETUP LOCATION */}
                <div className="p-3.5 bg-neutral-50/80 dark:bg-neutral-800/40 rounded-2xl border border-neutral-200 dark:border-neutral-700/60 flex flex-wrap items-center justify-between gap-3 text-xs">
                  <div className="flex items-center gap-2.5">
                    <Calendar className="w-4 h-4 text-rose-500 shrink-0" />
                    <div>
                      <span className="text-[10px] text-neutral-400 font-bold uppercase">Scheduled Exchange Date:</span>
                      <p className="font-bold text-neutral-900 dark:text-white">
                        {swap.exchangeDate || 'Saturday, Oct 31, 2026'} • {swap.meetupTime}
                      </p>
                      <p className="text-[11px] text-neutral-500 dark:text-neutral-400">{swap.meetupLocation}</p>
                    </div>
                  </div>

                  {onOpenPaymentModal && (
                    <button
                      onClick={() => onOpenPaymentModal(swap)}
                      className="px-3 py-1.5 matte-glass-btn text-xs font-semibold text-neutral-800 dark:text-neutral-200 rounded-xl cursor-pointer"
                    >
                      Reschedule
                    </button>
                  )}
                </div>

                {/* Receiver Actions when pending */}
                {isPendingReceiverAgreement && (
                  <div className="pt-3 border-t border-neutral-100 dark:border-neutral-800 flex items-center justify-end gap-3">
                    <button
                      onClick={() => declineSwap(swap.id)}
                      className="py-2 px-4 matte-glass-btn text-xs font-semibold text-neutral-600 dark:text-neutral-300 rounded-xl cursor-pointer"
                    >
                      Decline
                    </button>
                    <button
                      onClick={() => acceptSwap(swap.id)}
                      className="py-2 px-6 matte-glass-btn-primary text-xs font-bold rounded-xl flex items-center gap-2 cursor-pointer shadow-sm active:scale-95"
                    >
                      <Check className="w-4 h-4" />
                      Accept Exchange &amp; Schedule Date
                    </button>
                  </div>
                )}

                {/* Meetup Pass & Handover during scheduled meetup */}
                {swap.status === 'meetup_scheduled' && (
                  <div className="p-4 bg-emerald-50/70 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800/50 rounded-2xl space-y-3">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                      <div>
                        <div className="flex items-center gap-2 text-emerald-900 dark:text-emerald-300 font-bold text-xs uppercase tracking-wider">
                          <QrCode className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                          Official Campus Swap Pass Active
                        </div>
                        <p className="text-xs text-neutral-700 dark:text-neutral-300 mt-1">
                          Meet at <strong className="text-neutral-900 dark:text-white">{swap.meetupLocation}</strong> on <strong className="text-neutral-900 dark:text-white">{swap.exchangeDate || 'Oct 31'}</strong>. Both students must inspect cleanliness and fabric.
                        </p>
                      </div>

                      <div className="px-3.5 py-1.5 bg-white dark:bg-neutral-800 rounded-xl border border-neutral-300 dark:border-neutral-700 font-mono text-xs text-neutral-900 dark:text-white font-bold shadow-xs">
                        Pass Code: {swap.meetupVerificationCode}
                      </div>
                    </div>

                    {(!swap.paymentRequired || swap.paymentStatus === 'payment_verified') ? (
                      <div className="pt-2 border-t border-emerald-200/80 dark:border-emerald-800/60 flex items-center justify-end gap-3">
                        <button
                          onClick={() => confirmHandover(swap.id, isProposer)}
                          disabled={isProposer ? swap.handoverConfirmedByProposer : swap.handoverConfirmedByReceiver}
                          className="py-2 px-5 matte-glass-btn-primary text-xs font-bold rounded-xl flex items-center gap-2 cursor-pointer shadow-sm active:scale-95 disabled:opacity-50"
                        >
                          <UserCheck className="w-4 h-4" />
                          {isProposer ? (swap.handoverConfirmedByProposer ? 'Your handover confirmed' : 'Confirm handover') : (swap.handoverConfirmedByReceiver ? 'Your handover confirmed' : 'Confirm handover')}
                        </button>
                      </div>
                    ) : (
                      <p className="pt-2 border-t border-emerald-200/80 dark:border-emerald-800/60 text-xs font-semibold text-amber-700 dark:text-amber-400">
                        Confirm payment in the M-Pesa verification panel before either student can confirm handover.
                      </p>
                    )}
                  </div>
                )}

                {/* Rating trigger when completed */}
                {isCompleted && (
                  <div className="pt-2 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-t border-neutral-100 dark:border-neutral-800">
                    <div className="text-xs text-neutral-600 dark:text-neutral-300">
                      {userAlreadyRated ? (
                        <span className="text-emerald-700 dark:text-emerald-400 flex items-center gap-1.5 font-bold">
                          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                          You rated this exchange based on Cleanliness &amp; Quality!
                        </span>
                      ) : (
                        <span className="text-neutral-900 dark:text-white flex items-center gap-1.5 font-semibold">
                          <Sparkles className="w-4 h-4 text-amber-500" />
                          Submit your comprehensive Cleanliness &amp; Quality rating for {otherUser?.name}!
                        </span>
                      )}
                    </div>

                    {!userAlreadyRated && (
                      <button
                        onClick={() => onOpenReviewModal(swap)}
                        className="py-2 px-4 matte-glass-btn-accent text-neutral-950 font-bold text-xs rounded-xl flex items-center gap-1.5 shrink-0 cursor-pointer shadow-sm active:scale-95"
                      >
                        <Star className="w-3.5 h-3.5 fill-current" />
                        Rate Swapper (Cleanliness &amp; Fabric Quality)
                      </button>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
