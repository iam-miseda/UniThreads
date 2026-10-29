import React, { useState } from 'react';
import { useSwap } from '../context/SwapContext';
import { SwapProposal } from '../types';
import { 
  ArrowLeftRight, 
  CheckCircle2, 
  Clock, 
  MapPin, 
  ShieldCheck, 
  Sparkles, 
  Star, 
  Check, 
  X, 
  QrCode, 
  UserCheck, 
  Coins
} from 'lucide-react';

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

interface ActiveSwapsViewProps {
  onOpenReviewModal: (swap: SwapProposal) => void;
}

export const ActiveSwapsView: React.FC<ActiveSwapsViewProps> = ({ onOpenReviewModal }) => {
  const { 
    currentUser, 
    swaps, 
    items, 
    allStudents, 
    agreeFabric, 
    agreeMeetup, 
    acceptSwap, 
    declineSwap, 
    completeSwap 
  } = useSwap();

  const [filterTab, setFilterTab] = useState<'all' | 'needs_action' | 'scheduled' | 'needs_rating'>('all');

  const userSwaps = swaps.filter(
    s => s.proposerId === currentUser.id || s.receiverId === currentUser.id
  );

  const filteredSwaps = userSwaps.filter(swap => {
    if (filterTab === 'needs_action') {
      const isReceiver = swap.receiverId === currentUser.id;
      return swap.status === 'pending' || (isReceiver && (!swap.receiverAgreedFabric || !swap.receiverAgreedMeetup));
    }
    if (filterTab === 'scheduled') {
      return swap.status === 'meetup_scheduled';
    }
    if (filterTab === 'needs_rating') {
      const isProposer = swap.proposerId === currentUser.id;
      return swap.status === 'completed' && ((isProposer && !swap.proposerRated) || (!isProposer && !swap.receiverRated));
    }
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Top Banner / Explainer */}
      <div className="p-6 bg-white dark:bg-[#18181c] border border-[#dbdbdb] dark:border-neutral-800 rounded-3xl shadow-[0_1px_3px_rgba(0,0,0,0.03)] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 transition-colors duration-200">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-bold uppercase tracking-wider text-neutral-500 dark:text-neutral-400">
              Campus Wardrobe Exchanges
            </span>
          </div>
          <h2 className="text-xl font-bold text-neutral-900 dark:text-white flex items-center gap-2">
            <ArrowLeftRight className="w-5 h-5 text-neutral-900 dark:text-white" />
            Trade Agreements &amp; Campus Passes
          </h2>
          <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1 max-w-xl">
            Both Kenyan campus students agree on fabric quality and a safe meetup hub. Completed exchanges reward <strong className="text-neutral-900 dark:text-white">+50 Points</strong>, and 5-star peer recommendations unlock bonus point upgrades!
          </p>
        </div>

        <div className="px-4 py-2 matte-glass rounded-2xl flex items-center gap-2 text-xs font-semibold text-neutral-800 shrink-0">
          <Coins className="w-4 h-4 text-amber-500" />
          <span>Active Balance: <strong className="font-mono text-neutral-900">{currentUser.points} pts</strong></span>
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
          Ready to Rate &amp; Upgrade Points
        </button>
      </div>

      {/* Swaps List */}
      {filteredSwaps.length === 0 ? (
        <div className="p-12 text-center bg-white dark:bg-[#18181c] border border-[#dbdbdb] dark:border-neutral-800 rounded-3xl">
          <ArrowLeftRight className="w-10 h-10 text-neutral-300 dark:text-neutral-600 mx-auto mb-3" />
          <h3 className="text-sm font-bold text-neutral-800 dark:text-neutral-200">No exchanges found in this tab</h3>
          <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1 max-w-sm mx-auto">
            Browse the Campus Rack to propose a swap, or switch to another student profile (Brian, Faith, Kevin) to accept an incoming proposal.
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

            return (
              <div 
                key={swap.id}
                className="bg-white dark:bg-[#18181c] border border-[#dbdbdb] dark:border-neutral-800 rounded-3xl p-6 shadow-[0_1px_3px_rgba(0,0,0,0.03)] hover:shadow-[0_8px_20px_rgba(0,0,0,0.04)] dark:hover:shadow-[0_8px_20px_rgba(0,0,0,0.3)] transition-all space-y-4"
              >
                {/* Header Status & Peer Info */}
                <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-neutral-100 dark:border-neutral-800">
                  <div className="flex items-center gap-3">
                    <div className="p-[1.5px] rounded-full ig-story-gradient shrink-0">
                      <div className="p-[1px] bg-white dark:bg-neutral-900 rounded-full">
                        <img
                          src={otherUser?.avatar || 'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?auto=format&fit=crop&w=400&q=80'}
                          alt={otherUser?.name}
                          onError={handleAvatarError}
                          className="w-10 h-10 rounded-full object-cover"
                        />
                      </div>
                    </div>

                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-neutral-900 dark:text-white">{otherUser?.name}</span>
                        <span className="text-xs text-neutral-400 dark:text-neutral-500">({otherUser?.dorm})</span>
                        <span className="text-xs text-amber-500 font-bold">★ {otherUser?.rating}</span>
                      </div>
                      <div className="text-xs text-neutral-500 dark:text-neutral-400">
                        {isProposer ? 'You initiated this swap proposal' : `${otherUser?.name} sent you this swap proposal`}
                      </div>
                    </div>
                  </div>

                  {/* Status Indicator */}
                  <div className="flex items-center gap-2">
                    {swap.status === 'pending' && (
                      <span className="px-3 py-1 bg-amber-50 text-amber-800 border border-amber-200 rounded-full text-xs font-bold flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5 text-amber-600" />
                        Awaiting Mutual Agreement
                      </span>
                    )}
                    {swap.status === 'meetup_scheduled' && (
                      <span className="px-3 py-1 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-full text-xs font-bold flex items-center gap-1.5">
                        <MapPin className="w-3.5 h-3.5 text-emerald-600" />
                        Meetup Scheduled · Swap Pass Ready
                      </span>
                    )}
                    {swap.status === 'completed' && (
                      <span className="px-3 py-1 bg-blue-50 text-blue-800 border border-blue-200 rounded-full text-xs font-bold flex items-center gap-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5 text-blue-600" />
                        Exchange Completed (+50 Pts)
                      </span>
                    )}
                    {swap.status === 'declined' && (
                      <span className="px-3 py-1 bg-rose-50 text-rose-800 border border-rose-200 rounded-full text-xs font-bold">
                        Declined
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
                    />
                    <div className="min-w-0 flex-1">
                      <span className="text-[10px] font-bold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">You Give</span>
                      <h4 className="text-xs font-bold text-neutral-900 dark:text-white line-clamp-1">{myItem?.title}</h4>
                      <p className="text-[11px] text-neutral-500 dark:text-neutral-400 font-mono">{myItem?.fabric}</p>
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
                    />
                    <div className="min-w-0 flex-1">
                      <span className="text-[10px] font-bold text-neutral-900 dark:text-white uppercase tracking-wider">You Receive</span>
                      <h4 className="text-xs font-bold text-neutral-900 dark:text-white line-clamp-1">{theirItem?.title}</h4>
                      <p className="text-[11px] text-neutral-500 dark:text-neutral-400 font-mono">{theirItem?.fabric}</p>
                      <p className="text-[11px] text-neutral-800 dark:text-neutral-200 font-semibold">Value: KSh {theirItem?.estMarketValue.toLocaleString()}</p>
                    </div>
                  </div>
                </div>

                {/* Points Sweetener if any */}
                {swap.pointsBonus > 0 && (
                  <div className="flex items-center gap-2 p-3 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/50 rounded-2xl text-xs text-amber-900 dark:text-amber-200 font-medium">
                    <Coins className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0" />
                    <span>
                      {isProposer
                        ? `You added +${swap.pointsBonus} Virtual Exchange Points to balance this trade.`
                        : `${otherUser?.name} added +${swap.pointsBonus} Virtual Exchange Points for you.`}
                    </span>
                  </div>
                )}

                {/* Mutual Agreement Checks */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs bg-neutral-50/80 dark:bg-neutral-800/40 p-4 rounded-2xl border border-neutral-200 dark:border-neutral-700/60">
                  {/* Fabric Quality Agreement */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between font-bold">
                      <span className="flex items-center gap-1.5 text-neutral-900 dark:text-white">
                        <ShieldCheck className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                        Fabric Quality Agreement
                      </span>
                      {bothAgreedFabric ? (
                        <span className="text-emerald-700 font-bold text-[11px] flex items-center gap-1">
                          <Check className="w-3.5 h-3.5" /> Both Agreed
                        </span>
                      ) : (
                        <span className="text-amber-700 text-[11px]">Pending Agreement</span>
                      )}
                    </div>

                    <div className="text-[11px] text-neutral-600 space-y-1">
                      <div className="flex items-center gap-1.5">
                        {swap.proposerAgreedFabric ? (
                          <Check className="w-3.5 h-3.5 text-emerald-600" />
                        ) : (
                          <Clock className="w-3.5 h-3.5 text-neutral-400" />
                        )}
                        <span>Proposer ({isProposer ? 'You' : otherUser?.name}): Fabric certified clean</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        {swap.receiverAgreedFabric ? (
                          <Check className="w-3.5 h-3.5 text-emerald-600" />
                        ) : (
                          <Clock className="w-3.5 h-3.5 text-neutral-400" />
                        )}
                        <span>Receiver ({!isProposer ? 'You' : otherUser?.name}): Quality &amp; wear accepted</span>
                      </div>
                    </div>

                    {/* Button for receiver to agree to fabric */}
                    {!isProposer && !swap.receiverAgreedFabric && swap.status === 'pending' && (
                      <button
                        onClick={() => agreeFabric(swap.id, false)}
                        className="mt-2 w-full py-1.5 px-3 matte-glass-btn text-neutral-900 text-xs font-bold rounded-xl flex items-center justify-center gap-1.5"
                      >
                        <Check className="w-3.5 h-3.5 text-emerald-600" />
                        Agree on Fabric &amp; Cleanliness
                      </button>
                    )}
                  </div>

                  {/* Campus Meetup Place Agreement */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between font-bold">
                      <span className="flex items-center gap-1.5 text-neutral-900">
                        <MapPin className="w-4 h-4 text-rose-500" />
                        Campus Meetup Spot
                      </span>
                      {bothAgreedMeetup ? (
                        <span className="text-emerald-700 font-bold text-[11px] flex items-center gap-1">
                          <Check className="w-3.5 h-3.5" /> Both Agreed
                        </span>
                      ) : (
                        <span className="text-amber-700 text-[11px]">Pending Confirmation</span>
                      )}
                    </div>

                    <div className="text-[11px] text-neutral-600 space-y-0.5">
                      <div className="text-neutral-900 font-semibold">{swap.meetupLocation}</div>
                      <div className="text-neutral-500">{swap.meetupTime}</div>
                    </div>

                    {/* Button for receiver to agree to meetup */}
                    {!isProposer && !swap.receiverAgreedMeetup && swap.status === 'pending' && (
                      <button
                        onClick={() => agreeMeetup(swap.id, false)}
                        className="mt-2 w-full py-1.5 px-3 matte-glass-btn text-neutral-900 text-xs font-bold rounded-xl flex items-center justify-center gap-1.5"
                      >
                        <Check className="w-3.5 h-3.5 text-emerald-600" />
                        Agree on Meetup Spot &amp; Time
                      </button>
                    )}
                  </div>
                </div>

                {/* Receiver Actions when pending */}
                {isPendingReceiverAgreement && (
                  <div className="pt-3 border-t border-neutral-100 flex items-center justify-end gap-3">
                    <button
                      onClick={() => declineSwap(swap.id)}
                      className="py-2 px-4 matte-glass-btn text-xs font-semibold text-neutral-600 rounded-xl"
                    >
                      Decline
                    </button>
                    <button
                      onClick={() => acceptSwap(swap.id)}
                      className="py-2 px-6 matte-glass-btn-primary text-xs font-bold rounded-xl flex items-center gap-2"
                    >
                      <Check className="w-4 h-4" />
                      Accept Exchange &amp; Generate Swap Pass
                    </button>
                  </div>
                )}

                {/* Meetup Pass & Verification during scheduled meetup */}
                {swap.status === 'meetup_scheduled' && (
                  <div className="p-4 bg-emerald-50/70 border border-emerald-200 rounded-2xl space-y-3">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                      <div>
                        <div className="flex items-center gap-2 text-emerald-900 font-bold text-xs uppercase tracking-wider">
                          <QrCode className="w-4 h-4 text-emerald-600" />
                          Official Campus Swap Pass Active
                        </div>
                        <p className="text-xs text-neutral-700 mt-1">
                          Meet at <strong className="text-neutral-900">{swap.meetupLocation}</strong> ({swap.meetupTime}). Bring your piece clean and ready for hands-on fabric touch.
                        </p>
                      </div>

                      <div className="px-3.5 py-1.5 bg-white dark:bg-neutral-800 rounded-xl border border-neutral-300 dark:border-neutral-700 font-mono text-xs text-neutral-900 dark:text-white font-bold shadow-xs">
                        Code: {swap.meetupVerificationCode}
                      </div>
                    </div>

                    <div className="pt-2 border-t border-emerald-200/80 flex items-center justify-end">
                      <button
                        onClick={() => completeSwap(swap.id)}
                        className="py-2.5 px-5 matte-glass-btn-primary text-xs font-bold rounded-xl flex items-center gap-2"
                      >
                        <UserCheck className="w-4 h-4" />
                        We Met in Person! Mark Completed (+50 Pts)
                      </button>
                    </div>
                  </div>
                )}

                {/* Rating & Recommendation trigger when completed */}
                {isCompleted && (
                  <div className="pt-2 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-t border-neutral-100">
                    <div className="text-xs text-neutral-600">
                      {userAlreadyRated ? (
                        <span className="text-emerald-700 flex items-center gap-1.5 font-bold">
                          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                          You rated this exchange and upgraded your peer’s points!
                        </span>
                      ) : (
                        <span className="text-neutral-900 flex items-center gap-1.5 font-semibold">
                          <Sparkles className="w-4 h-4 text-amber-500" />
                          Rate fabric honesty &amp; punctuality to upgrade {otherUser?.name} with virtual exchange points!
                        </span>
                      )}
                    </div>

                    {!userAlreadyRated && (
                      <button
                        onClick={() => onOpenReviewModal(swap)}
                        className="py-2 px-4 matte-glass-btn-accent text-neutral-950 font-bold text-xs rounded-xl flex items-center gap-1.5 shrink-0"
                      >
                        <Star className="w-3.5 h-3.5 fill-current" />
                        Rate Swapper &amp; Upgrade Points
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
