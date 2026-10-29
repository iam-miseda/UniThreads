import React, { useState } from 'react';
import { SwapProposal } from '../types';
import { useSwap } from '../context/SwapContext';
import { 
  X, 
  Star, 
  Sparkles, 
  ShieldCheck, 
  Shirt, 
  Clock, 
  Coins, 
  Check, 
  ThumbsUp,
  Award
} from 'lucide-react';

interface ReviewModalProps {
  swap: SwapProposal | null;
  onClose: () => void;
  onSuccess: () => void;
}

const PEER_TAGS = [
  'Spotless Cleanliness',
  'Accurate Fabric Quality',
  'Punctual Campus Meetup',
  'Clean & Fresh Scent',
  'True to Stated Size',
  'Friendly Communicator',
  'Top Campus Grail Standard'
];

export const ReviewModal: React.FC<ReviewModalProps> = ({ swap, onClose, onSuccess }) => {
  const { currentUser, allStudents, submitReview } = useSwap();

  // Multi-dimension rating scores (1 - 5)
  const [cleanlinessRating, setCleanlinessRating] = useState<number>(5);
  const [fabricQualityRating, setFabricQualityRating] = useState<number>(5);
  const [punctualityRating, setPunctualityRating] = useState<number>(5);

  const [selectedTags, setSelectedTags] = useState<string[]>([
    'Spotless Cleanliness',
    'Accurate Fabric Quality',
    'Punctual Campus Meetup'
  ]);
  const [comment, setComment] = useState<string>(
    'The item arrived freshly washed, folded, and in pristine condition! Fabric feel and quality exceeded expectations. Met right on time at the campus quad.'
  );

  if (!swap) return null;

  const isProposer = swap.proposerId === currentUser.id;
  const revieweeId = isProposer ? swap.receiverId : swap.proposerId;
  const reviewee = allStudents.find(s => s.id === revieweeId);

  // Comprehensive weighted rating calculation
  const comprehensiveScore = Number((
    cleanlinessRating * 0.40 +
    fabricQualityRating * 0.45 +
    punctualityRating * 0.15
  ).toFixed(2));

  const toggleTag = (tag: string) => {
    setSelectedTags(prev => 
      prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]
    );
  };

  const potentialBonus = comprehensiveScore >= 4.7 ? 40 : comprehensiveScore >= 4.2 ? 25 : 15;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    submitReview(swap.id, {
      rating: comprehensiveScore,
      cleanlinessRating,
      fabricQualityRating,
      punctualityRating,
      tags: selectedTags,
      comment
    });
    onSuccess();
  };

  // Helper for rendering clickable star selector
  const renderStarSelector = (
    value: number,
    onChange: (val: number) => void,
    label: string,
    subtitle: string,
    icon: React.ReactNode
  ) => (
    <div className="p-3.5 bg-neutral-50 dark:bg-neutral-800/40 rounded-2xl border border-neutral-200 dark:border-neutral-700/60 space-y-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {icon}
          <div>
            <span className="font-bold text-neutral-900 dark:text-white text-xs block">
              {label}
            </span>
            <span className="text-[10px] text-neutral-500 dark:text-neutral-400">
              {subtitle}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-1">
          {[1, 2, 3, 4, 5].map(star => (
            <button
              key={star}
              type="button"
              onClick={() => onChange(star)}
              className="p-1 hover:scale-125 transition-transform cursor-pointer"
            >
              <Star
                className={`w-5 h-5 ${
                  star <= value
                    ? 'text-amber-400 fill-amber-400'
                    : 'text-neutral-300 dark:text-neutral-600'
                }`}
              />
            </button>
          ))}
          <span className="font-mono font-bold text-xs text-neutral-900 dark:text-white ml-1.5 w-6">
            {value}.0
          </span>
        </div>
      </div>
    </div>
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/65 backdrop-blur-sm overflow-y-auto">
      <div 
        className="relative w-full max-w-lg bg-white dark:bg-[#18181c] border border-neutral-200 dark:border-neutral-800 rounded-3xl shadow-2xl overflow-hidden my-4 text-neutral-900 dark:text-neutral-100 animate-in zoom-in-95 duration-200 flex flex-col max-h-[92vh]"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-5 border-b border-neutral-100 dark:border-neutral-800 bg-[#fafafa] dark:bg-[#121216] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img
              src={reviewee?.avatar}
              alt={reviewee?.name}
              className="w-11 h-11 rounded-full object-cover border border-neutral-200 dark:border-neutral-700"
             referrerPolicy="no-referrer"/>
            <div>
              <h2 className="text-sm sm:text-base font-bold text-neutral-900 dark:text-white flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-500" />
                Comprehensive Swap Rating
              </h2>
              <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">
                Rating <span className="text-neutral-900 dark:text-white font-semibold">{reviewee?.name}</span> ({reviewee?.campus.split(' ')[0]})
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-neutral-400 hover:text-neutral-800 dark:hover:text-white rounded-full hover:bg-neutral-200/60 dark:hover:bg-neutral-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 sm:p-6 overflow-y-auto space-y-4 text-xs flex-1">
          {/* COMPREHENSIVE SCORE LIVE BADGE */}
          <div className="p-4 bg-gradient-to-r from-amber-500/10 via-rose-500/10 to-transparent border border-amber-300 dark:border-amber-800/60 rounded-2xl flex items-center justify-between">
            <div className="space-y-0.5">
              <span className="text-[10px] font-bold uppercase tracking-wider text-amber-800 dark:text-amber-300 flex items-center gap-1.5">
                <Award className="w-3.5 h-3.5" />
                Overall Calculated Score
              </span>
              <p className="text-sm font-bold text-neutral-900 dark:text-white">
                {comprehensiveScore >= 4.8 
                  ? '🏆 Platinum Grail Standard'
                  : comprehensiveScore >= 4.4 
                  ? '✨ Cleanliness & Quality Certified' 
                  : '👍 Reliable Campus Swapper'}
              </p>
            </div>

            <div className="text-right">
              <div className="text-2xl font-black font-mono text-amber-600 dark:text-amber-400 flex items-center gap-1">
                <Star className="w-5 h-5 fill-amber-500 text-amber-500" />
                {comprehensiveScore}
                <span className="text-xs font-normal text-neutral-400">/5.0</span>
              </div>
              <span className="text-[10px] font-mono text-emerald-600 dark:text-emerald-400 font-bold">
                +{potentialBonus} pts bonus for peer
              </span>
            </div>
          </div>

          {/* RATING DIMENSION 1: CLEANLINESS */}
          {renderStarSelector(
            cleanlinessRating,
            setCleanlinessRating,
            'Cleanliness & Hygiene',
            'Freshly laundered, odor-free, spotless & folded',
            <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
          )}

          {/* RATING DIMENSION 2: FABRIC & TEXTILE QUALITY */}
          {renderStarSelector(
            fabricQualityRating,
            setFabricQualityRating,
            'Fabric & Material Quality',
            'Accurate thickness/GSM, authentic stitching & true condition',
            <Shirt className="w-4 h-4 text-rose-500" />
          )}

          {/* RATING DIMENSION 3: PUNCTUALITY & MEETUP */}
          {renderStarSelector(
            punctualityRating,
            setPunctualityRating,
            'Campus Meetup Punctuality',
            'On-time at scheduled library or student center spot',
            <Clock className="w-4 h-4 text-amber-500" />
          )}

          {/* Tag Badges */}
          <div>
            <label className="block text-[11px] font-bold text-neutral-700 dark:text-neutral-300 mb-2">
              Highlight Peer Strengths (Tap to Select):
            </label>
            <div className="flex flex-wrap gap-1.5">
              {PEER_TAGS.map(tag => {
                const isSelected = selectedTags.includes(tag);
                return (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => toggleTag(tag)}
                    className={`px-3 py-1 rounded-full text-[11px] font-semibold transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 shadow-2xs'
                        : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-300 hover:bg-neutral-200 dark:hover:bg-neutral-700'
                    }`}
                  >
                    {isSelected && <Check className="w-3 h-3 inline mr-1 stroke-[3]" />}
                    {tag}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Written Feedback */}
          <div>
            <label className="block text-[11px] font-bold text-neutral-700 dark:text-neutral-300 mb-1">
              Public Swap Experience Review:
            </label>
            <textarea
              rows={3}
              value={comment}
              onChange={e => setComment(e.target.value)}
              placeholder="Tell other students about the fabric quality, cleanliness, and punctuality..."
              className="w-full px-3.5 py-2.5 bg-neutral-50 dark:bg-neutral-800/80 border border-neutral-300 dark:border-neutral-700 rounded-xl text-neutral-900 dark:text-white"
            />
          </div>

          {/* Submit */}
          <div className="pt-2 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 matte-glass-btn font-semibold text-neutral-700 dark:text-neutral-300 rounded-xl cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 matte-glass-btn-primary font-bold rounded-xl flex items-center gap-2 cursor-pointer shadow-md active:scale-95"
            >
              <ThumbsUp className="w-4 h-4" />
              Submit Comprehensive Review ({comprehensiveScore}⭐)
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
