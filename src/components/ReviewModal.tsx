import React, { useState } from 'react';
import { SwapProposal } from '../types';
import { useSwap } from '../context/SwapContext';
import { 
  X, 
  Star, 
  Sparkles, 
  Check, 
  ThumbsUp, 
  Coins
} from 'lucide-react';

interface ReviewModalProps {
  swap: SwapProposal | null;
  onClose: () => void;
  onSuccess: () => void;
}

const PEER_TAGS = [
  'Accurate Fabric Quality',
  'On-Time Campus Meetup',
  'Clean & Freshly Laundered',
  'True to Stated Size',
  'Friendly & Great Communicator',
  'Gentle Wear Honesty'
];

export const ReviewModal: React.FC<ReviewModalProps> = ({ swap, onClose, onSuccess }) => {
  const { currentUser, allStudents, submitReview } = useSwap();

  const [rating, setRating] = useState<number>(5);
  const [selectedTags, setSelectedTags] = useState<string[]>([
    'Accurate Fabric Quality',
    'On-Time Campus Meetup',
    'Clean & Freshly Laundered'
  ]);
  const [comment, setComment] = useState<string>(
    'The fabric was in even better shape than the photos showed. Super punctual meetup at the library steps. Highly recommend this student!'
  );

  if (!swap) return null;

  const isProposer = swap.proposerId === currentUser.id;
  const revieweeId = isProposer ? swap.receiverId : swap.proposerId;
  const reviewee = allStudents.find(s => s.id === revieweeId);

  const toggleTag = (tag: string) => {
    setSelectedTags(prev => 
      prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]
    );
  };

  const potentialBonus = rating >= 4.5 ? 35 : rating >= 4.0 ? 20 : 0;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    submitReview(swap.id, {
      rating,
      tags: selectedTags,
      comment
    });
    onSuccess();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm overflow-y-auto">
      <div 
        className="relative w-full max-w-lg bg-white dark:bg-[#18181c] border border-[#dbdbdb] dark:border-neutral-800 rounded-3xl shadow-2xl overflow-hidden my-6 animate-in fade-in zoom-in-95 duration-200 transition-colors duration-200"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-neutral-100 dark:border-neutral-800 bg-[#fafafa] dark:bg-[#121216]">
          <div>
            <h2 className="text-base font-bold text-neutral-900 dark:text-white flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-amber-500" />
              Rate &amp; Recommend Swapper
            </h2>
            <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">
              Reviewing <span className="text-neutral-900 dark:text-white font-semibold">{reviewee?.name}</span> ({reviewee?.dorm})
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-neutral-400 hover:text-neutral-800 dark:hover:text-white rounded-full hover:bg-neutral-200/60 dark:hover:bg-neutral-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* Virtual Points Upgrade Explainer Card */}
          <div className="p-4 bg-amber-50/70 dark:bg-amber-950/25 border border-amber-200 dark:border-amber-900/50 rounded-2xl space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-amber-950 dark:text-amber-200 flex items-center gap-1.5">
                <Coins className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                Virtual Points Upgrade System
              </span>
              <span className="text-xs font-mono font-bold text-amber-900 dark:text-amber-300 bg-white dark:bg-[#1f1a14] px-2 py-0.5 rounded-full border border-amber-200 dark:border-amber-800">
                +{potentialBonus} pts bonus for {reviewee?.name}
              </span>
            </div>
            <p className="text-[11px] text-amber-800 dark:text-amber-300/80 leading-relaxed">
              In UniThread, good peer recommendations directly upgrade your exchange partner’s virtual points balance, rewarding authentic and dependable campus swappers!
            </p>
          </div>

          {/* Star Rating Selector */}
          <div className="text-center py-2">
            <label className="block text-xs font-bold text-neutral-700 dark:text-neutral-300 mb-2 uppercase tracking-wider">
              Overall Exchange &amp; Fabric Rating
            </label>
            <div className="flex items-center justify-center gap-2">
              {[1, 2, 3, 4, 5].map(star => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  className="p-1 hover:scale-115 transition-transform cursor-pointer"
                >
                  <Star
                    className={`w-8 h-8 transition-colors ${
                      star <= rating ? 'text-amber-400 fill-amber-400' : 'text-neutral-200 dark:text-neutral-700 hover:text-neutral-300'
                    }`}
                  />
                </button>
              ))}
            </div>
            <p className="text-xs text-neutral-900 dark:text-white font-bold mt-1">
              {rating === 5 ? '5.0 — Outstanding! Fabric matched & on time' : `${rating}.0 Stars`}
            </p>
          </div>

          {/* Verified Recommendation Badges / Tags */}
          <div className="space-y-2">
            <label className="block text-xs font-bold text-neutral-700 dark:text-neutral-300 uppercase tracking-wider">
              Endorse Specific Attributes
            </label>
            <div className="flex flex-wrap gap-2">
              {PEER_TAGS.map(tag => {
                const isSelected = selectedTags.includes(tag);
                return (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => toggleTag(tag)}
                    className={`px-3 py-1.5 text-xs font-semibold rounded-xl border transition-all flex items-center gap-1.5 cursor-pointer ${
                      isSelected
                        ? 'bg-neutral-900 dark:bg-white border-neutral-900 dark:border-white text-white dark:text-neutral-900 shadow-xs'
                        : 'bg-white dark:bg-[#18181c] border-neutral-200 dark:border-neutral-700 text-neutral-600 dark:text-neutral-300 hover:border-neutral-400 dark:hover:border-neutral-500'
                    }`}
                  >
                    {isSelected && <Check className="w-3.5 h-3.5 text-white dark:text-neutral-900" />}
                    {tag}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Written Recommendation */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-neutral-700 dark:text-neutral-300 uppercase tracking-wider">
              Campus Recommendation Note
            </label>
            <textarea
              value={comment}
              onChange={e => setComment(e.target.value)}
              rows={3}
              required
              placeholder="Describe the fabric feel, cleanliness, campus punctuality..."
              className="w-full bg-neutral-50 dark:bg-[#121216] border border-neutral-300 dark:border-neutral-700 text-neutral-900 dark:text-white rounded-2xl p-3 text-xs focus:ring-1 focus:ring-black dark:focus:ring-white"
            />
          </div>

          {/* Submit */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-neutral-100 dark:border-neutral-800">
            <button
              type="button"
              onClick={onClose}
              className="py-2.5 px-4 matte-glass-btn text-xs font-semibold text-neutral-700 dark:text-neutral-300 rounded-xl cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="py-2.5 px-6 matte-glass-btn-primary text-xs font-bold rounded-xl flex items-center gap-2 cursor-pointer"
            >
              <ThumbsUp className="w-4 h-4" />
              Submit Recommendation &amp; Upgrade Points
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
