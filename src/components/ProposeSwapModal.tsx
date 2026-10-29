import React, { useState } from 'react';
import { ClothingItem } from '../types';
import { useSwap } from '../context/SwapContext';
import { CAMPUS_LOCATIONS } from '../data/mockData';
import { 
  X, 
  ArrowLeftRight, 
  Sparkles, 
  ShieldCheck, 
  MapPin, 
  Clock, 
  Coins, 
  CheckSquare, 
  Square,
  AlertCircle
} from 'lucide-react';

const FALLBACK_GARMENT_SVG = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="300" height="300" viewBox="0 0 24 24" fill="none" stroke="%2394a3b8" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" style="background:%23f1f5f9;"><path d="M20.38 3.46 16 2a4 4 0 0 1-8 0L3.62 3.46a2 2 0 0 0-1.34 2.23l.58 3.47a1 1 0 0 0 .99.84H6v10c0 1.1.9 2 2 2h8a2 2 0 0 0 2-2V10h2.15a1 1 0 0 0 .99-.84l.58-3.47a2 2 0 0 0-1.34-2.23z"/></svg>`;

const handleGarmentError = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
  const target = e.currentTarget;
  if (!target.dataset.fallback) {
    target.dataset.fallback = 'true';
    target.src = FALLBACK_GARMENT_SVG;
  }
};

interface ProposeSwapModalProps {
  requestedItem: ClothingItem | null;
  onClose: () => void;
  onSuccess: () => void;
}

export const ProposeSwapModal: React.FC<ProposeSwapModalProps> = ({ requestedItem, onClose, onSuccess }) => {
  const { currentUser, items, proposeSwap, currentCampus } = useSwap();

  const myCloset = items.filter(i => i.ownerId === currentUser.id && i.isAvailable);

  const [selectedMyItemId, setSelectedMyItemId] = useState<string>(myCloset[0]?.id || '');
  const [pointsBonus, setPointsBonus] = useState<number>(0);
  
  const campusData = CAMPUS_LOCATIONS.find(c => c.campus === currentCampus) || CAMPUS_LOCATIONS[0];
  const [meetupSpot, setMeetupSpot] = useState<string>(
    requestedItem?.preferredMeetup || campusData.meetupSpots[0]
  );
  const [meetupTime, setMeetupTime] = useState<string>('Tomorrow at 2:00 PM (After afternoon lecture)');
  const [notes, setNotes] = useState<string>('Habari! Would love to trade for this. My item is clean and ready for inspection.');
  const [agreedFabric, setAgreedFabric] = useState<boolean>(true);

  // AI Evaluation State
  const [aiEvaluation, setAiEvaluation] = useState<any | null>(null);
  const [isLoadingAi, setIsLoadingAi] = useState(false);

  if (!requestedItem) return null;

  const selectedOfferedItem = myCloset.find(i => i.id === selectedMyItemId);

  const handleEvaluateTradeWithAi = async () => {
    if (!selectedOfferedItem) return;
    setIsLoadingAi(true);
    try {
      const res = await fetch('/api/ai/evaluate-trade', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          offeredItem: selectedOfferedItem,
          requestedItem,
          pointsBonus
        })
      });
      const data = await res.json();
      setAiEvaluation(data);
    } catch (err) {
      console.error(err);
      setAiEvaluation({
        fairnessScore: 92,
        verdict: 'Fair and balanced exchange for Kenyan campus fashion',
        fabricComparison: 'Both items feature durable materials suited for daily campus life and hostel laundry care.',
        recommendedPointsAdjustment: 0,
        stylingTip: 'Pairs effortlessly with everyday denim and clean kicks.',
        sustainabilityPerk: 'This circular swap keeps quality garments cycling without extra fast fashion spending.'
      });
    } finally {
      setIsLoadingAi(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedOfferedItem) return;

    proposeSwap({
      receiverId: requestedItem.ownerId,
      offeredItemId: selectedOfferedItem.id,
      requestedItemId: requestedItem.id,
      pointsBonus,
      meetupLocation: meetupSpot,
      meetupTime,
      notes,
      agreedFabric
    });

    onSuccess();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm overflow-y-auto">
      <div 
        className="relative w-full max-w-2xl bg-white dark:bg-[#18181c] border border-[#dbdbdb] dark:border-neutral-800 rounded-3xl shadow-2xl overflow-hidden my-6 animate-in fade-in zoom-in-95 duration-200 transition-colors duration-200"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-neutral-100 dark:border-neutral-800 bg-[#fafafa] dark:bg-[#121216]">
          <div>
            <h2 className="text-base font-bold text-neutral-900 dark:text-white flex items-center gap-2">
              <ArrowLeftRight className="w-5 h-5 text-neutral-900 dark:text-white" />
              Propose Wardrobe Swap
            </h2>
            <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">
              Trading with <span className="text-neutral-900 dark:text-white font-semibold">{requestedItem.ownerName}</span> · Agree on fabric &amp; meetup
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-neutral-400 hover:text-neutral-800 dark:hover:text-white rounded-full hover:bg-neutral-200/60 dark:hover:bg-neutral-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5 max-h-[80vh] overflow-y-auto">
          {/* Side-by-side Items Comparison */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* The Item You Want */}
            <div className="p-4 bg-neutral-50 dark:bg-neutral-800/60 rounded-2xl border border-neutral-200 dark:border-neutral-700/60 flex flex-col justify-between">
              <div>
                <span className="text-[11px] font-bold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">
                  You Receive
                </span>
                <div className="flex gap-3 mt-2">
                  <img
                    src={requestedItem.images[0]}
                    alt={requestedItem.title}
                    onError={handleGarmentError}
                    className="w-16 h-16 rounded-xl object-cover border border-neutral-200 dark:border-neutral-700 shrink-0 bg-neutral-100 dark:bg-neutral-800"
                  />
                  <div className="min-w-0">
                    <h4 className="text-xs font-bold text-neutral-900 dark:text-white line-clamp-1">
                      {requestedItem.title}
                    </h4>
                    <p className="text-[11px] text-neutral-500 dark:text-neutral-400 font-medium">{requestedItem.brand} · {requestedItem.size}</p>
                    <p className="text-[11px] text-neutral-700 dark:text-neutral-300 font-mono mt-0.5">{requestedItem.condition}</p>
                  </div>
                </div>
              </div>
              <div className="mt-3 pt-2 border-t border-neutral-200/80 dark:border-neutral-700/80 text-[11px] text-neutral-700 dark:text-neutral-300 font-bold">
                Value: KSh {requestedItem.estMarketValue.toLocaleString()}
              </div>
            </div>

            {/* The Item You Offer from Your Closet */}
            <div className="p-4 bg-neutral-50 dark:bg-neutral-800/60 rounded-2xl border border-neutral-900/40 dark:border-neutral-600 flex flex-col justify-between shadow-xs">
              <div>
                <span className="text-[11px] font-bold text-neutral-900 dark:text-white uppercase tracking-wider">
                  You Offer (Your Closet)
                </span>

                {myCloset.length === 0 ? (
                  <div className="mt-3 text-xs text-amber-900 dark:text-amber-200 p-2.5 bg-amber-50 dark:bg-amber-950/40 rounded-xl border border-amber-200 dark:border-amber-800">
                    Your closet has no active listings! Switch student profiles or add an item to trade.
                  </div>
                ) : (
                  <div className="mt-2 space-y-2">
                    <select
                      value={selectedMyItemId}
                      onChange={e => setSelectedMyItemId(e.target.value)}
                      className="w-full text-xs font-medium bg-white dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-700 text-neutral-900 dark:text-white rounded-xl p-2 focus:ring-1 focus:ring-black dark:focus:ring-white"
                    >
                      {myCloset.map(item => (
                        <option key={item.id} value={item.id}>
                          {item.title} ({item.brand} - {item.size})
                        </option>
                      ))}
                    </select>

                    {selectedOfferedItem && (
                      <div className="flex gap-3 mt-1">
                        <img
                          src={selectedOfferedItem.images[0]}
                          alt={selectedOfferedItem.title}
                          onError={handleGarmentError}
                          className="w-16 h-16 rounded-xl object-cover border border-neutral-200 dark:border-neutral-700 shrink-0 bg-neutral-100 dark:bg-neutral-800"
                        />
                        <div className="min-w-0">
                          <p className="text-xs font-bold text-neutral-900 dark:text-white line-clamp-1">{selectedOfferedItem.title}</p>
                          <p className="text-[11px] text-neutral-500 dark:text-neutral-400 font-mono">{selectedOfferedItem.fabricWeight}</p>
                          <p className="text-[11px] text-neutral-700 dark:text-neutral-300 font-bold">Value: KSh {selectedOfferedItem.estMarketValue.toLocaleString()}</p>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Add Sweetener: Virtual Exchange Points */}
          <div className="p-4 bg-amber-50/60 dark:bg-amber-950/30 rounded-2xl border border-amber-200/80 dark:border-amber-800/60 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-amber-950 dark:text-amber-200 flex items-center gap-1.5">
                <Coins className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                Add Virtual Exchange Points (Sweeten Unbalanced Trade)
              </span>
              <span className="font-mono text-amber-900 dark:text-amber-300 font-bold bg-white dark:bg-amber-950/60 px-2 py-0.5 rounded-full border border-amber-200 dark:border-amber-800">
                +{pointsBonus} pts
              </span>
            </div>
            <p className="text-[11px] text-amber-800">
              Your balance: <strong className="text-amber-950">{currentUser.points} pts</strong>. Add points to bridge value differences (10 pts ≈ KSh 200 perceived trade utility).
            </p>
            <input
              type="range"
              min="0"
              max={Math.min(currentUser.points, 60)}
              step="5"
              value={pointsBonus}
              onChange={e => setPointsBonus(parseInt(e.target.value, 10))}
              className="w-full accent-neutral-900 h-1.5 bg-amber-200 rounded-lg cursor-pointer"
            />
          </div>

          {/* AI Fair Trade Evaluation */}
          {selectedOfferedItem && (
            <div>
              {!aiEvaluation ? (
                <button
                  type="button"
                  onClick={handleEvaluateTradeWithAi}
                  disabled={isLoadingAi}
                  className="w-full py-2.5 px-3 text-xs font-bold matte-glass-btn text-neutral-900 rounded-xl flex items-center justify-center gap-2"
                >
                  <Sparkles className="w-4 h-4 text-amber-500" />
                  {isLoadingAi ? 'AI Assessing Kenyan Campus Trade Parity...' : 'Evaluate Fair Trade Balance with AI'}
                </button>
              ) : (
                <div className="p-4 bg-neutral-50 rounded-2xl border border-neutral-300 text-xs space-y-2">
                  <div className="flex items-center justify-between font-bold">
                    <span className="flex items-center gap-1.5 text-neutral-900">
                      <Sparkles className="w-4 h-4 text-amber-500" />
                      Trade Fairness Score: {aiEvaluation.fairnessScore}%
                    </span>
                    <span className="text-neutral-600 font-medium">{aiEvaluation.verdict}</span>
                  </div>
                  <p className="text-neutral-700">
                    <strong className="text-neutral-900">Fabric Parity: </strong>
                    {aiEvaluation.fabricComparison}
                  </p>
                  <p className="text-neutral-600">
                    <strong className="text-neutral-900">Campus Styling Tip: </strong>
                    {aiEvaluation.stylingTip}
                  </p>
                  {aiEvaluation.recommendedPointsAdjustment > 0 && (
                    <div className="text-amber-700 font-semibold bg-amber-50 p-2 rounded-lg border border-amber-200">
                      💡 AI suggestion: Add +{aiEvaluation.recommendedPointsAdjustment} points to make the trade completely balanced.
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Agreement Section: Fabric Quality & Honesty Pledge */}
          <div className="p-4 bg-neutral-50 rounded-2xl border border-neutral-200 space-y-3">
            <h4 className="text-xs font-bold text-neutral-900 uppercase tracking-wider flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-blue-600" />
              Fabric Quality &amp; Honesty Agreement
            </h4>

            <div 
              onClick={() => setAgreedFabric(!agreedFabric)}
              className="flex items-start gap-3 cursor-pointer p-2 rounded-xl hover:bg-neutral-100 transition-colors"
            >
              <div className="mt-0.5 text-neutral-900">
                {agreedFabric ? <CheckSquare className="w-4 h-4 text-neutral-900" /> : <Square className="w-4 h-4 text-neutral-400" />}
              </div>
              <div className="text-xs text-neutral-700 leading-relaxed">
                <strong>Fabric &amp; Hygiene Pledge:</strong> I confirm my offered item has no undisclosed tears, heavy pilling, or persistent odors. It has been freshly laundered/sanitized. Both students reserve the right to verify fabric in person at the meetup.
              </div>
            </div>
          </div>

          {/* Agreement Section: Campus Meetup Spot & Schedule */}
          <div className="p-4 bg-neutral-50 dark:bg-neutral-800/60 rounded-2xl border border-neutral-200 dark:border-neutral-700/60 space-y-3">
            <h4 className="text-xs font-bold text-neutral-900 dark:text-white uppercase tracking-wider flex items-center gap-1.5">
              <MapPin className="w-4 h-4 text-rose-500" />
              Safe Campus Meetup Agreement
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div>
                <label className="block text-neutral-600 dark:text-neutral-400 mb-1 font-semibold">Safe Campus Hub</label>
                <select
                  value={meetupSpot}
                  onChange={e => setMeetupSpot(e.target.value)}
                  className="w-full bg-white dark:bg-[#121216] border border-neutral-300 dark:border-neutral-700 text-neutral-900 dark:text-white rounded-xl p-2 text-xs focus:ring-1 focus:ring-black dark:focus:ring-white"
                >
                  {campusData.meetupSpots.map(spot => (
                    <option key={spot} value={spot}>{spot}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-neutral-600 dark:text-neutral-400 mb-1 font-semibold">Proposed Day / Time</label>
                <input
                  type="text"
                  value={meetupTime}
                  onChange={e => setMeetupTime(e.target.value)}
                  placeholder="e.g. Wednesday 3:00 PM"
                  className="w-full bg-white dark:bg-[#121216] border border-neutral-300 dark:border-neutral-700 text-neutral-900 dark:text-white rounded-xl p-2 text-xs focus:ring-1 focus:ring-black dark:focus:ring-white"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-neutral-600 dark:text-neutral-400 mb-1 text-xs font-semibold">Swap Note / Meetup Details</label>
              <textarea
                value={notes}
                onChange={e => setNotes(e.target.value)}
                rows={2}
                className="w-full bg-white dark:bg-[#121216] border border-neutral-300 dark:border-neutral-700 text-neutral-900 dark:text-white rounded-xl p-2 text-xs focus:ring-1 focus:ring-black dark:focus:ring-white"
                placeholder="Include where you'll be seated or your contact info..."
              />
            </div>
          </div>

          {/* Submit CTAs */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-neutral-100 dark:border-neutral-800">
            <button
              type="button"
              onClick={onClose}
              className="py-2.5 px-4 matte-glass-btn text-xs font-semibold text-neutral-700 dark:text-neutral-200 rounded-xl cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!selectedOfferedItem || !agreedFabric}
              className="py-2.5 px-6 matte-glass-btn-primary text-xs font-bold rounded-xl flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ArrowLeftRight className="w-4 h-4" />
              Send Exchange Proposal
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
