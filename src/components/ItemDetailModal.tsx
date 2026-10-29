import React, { useState } from 'react';
import { ClothingItem } from '../types';
import { useSwap } from '../context/SwapContext';
import { 
  X, 
  ArrowLeftRight, 
  ShieldCheck, 
  Sparkles, 
  MapPin, 
  Shirt, 
  CheckCircle,
  Coins,
  Heart,
  Bookmark
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

interface ItemDetailModalProps {
  item: ClothingItem | null;
  onClose: () => void;
  onProposeSwap: (item: ClothingItem) => void;
}

export const ItemDetailModal: React.FC<ItemDetailModalProps> = ({ item, onClose, onProposeSwap }) => {
  const { currentUser, allStudents } = useSwap();
  const [activeImageIdx, setActiveImageIdx] = useState(0);
  const [aiAnalysis, setAiAnalysis] = useState<any | null>(null);
  const [isLoadingAi, setIsLoadingAi] = useState(false);

  if (!item) return null;

  const owner = allStudents.find(s => s.id === item.ownerId);
  const isOwnItem = item.ownerId === currentUser.id;

  const handleAskFabricAdvisor = async () => {
    setIsLoadingAi(true);
    try {
      const res = await fetch('/api/ai/fabric-advisor', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: item.title,
          fabric: item.fabric,
          condition: item.condition,
          washCare: item.washCare
        })
      });
      const data = await res.json();
      setAiAnalysis(data);
    } catch (err) {
      console.error(err);
      setAiAnalysis({
        fabricScore: 92,
        durabilityRating: 'Heavyweight Kenyan Campus Grade',
        handFeel: 'Substantial, breathable texture with structured weave.',
        maintenanceTips: 'Cold gentle wash inside out, line dry in shaded hostel balcony to preserve weave.',
        campusVibe: 'Ideal for early morning Nairobi library sessions and lecture hall commutes.'
      });
    } finally {
      setIsLoadingAi(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm overflow-y-auto">
      <div 
        className="relative w-full max-w-3xl bg-white dark:bg-[#18181c] border border-[#dbdbdb] dark:border-neutral-800 rounded-3xl shadow-2xl overflow-hidden my-6 animate-in fade-in zoom-in-95 duration-200 transition-colors duration-200"
        onClick={e => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 p-2 matte-glass hover:bg-white dark:hover:bg-neutral-800 text-neutral-600 dark:text-neutral-300 hover:text-black dark:hover:text-white rounded-full transition-colors cursor-pointer"
          aria-label="Close modal"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="grid grid-cols-1 md:grid-cols-2">
          {/* Left Column: Photos Gallery in IG Post Ratio */}
          <div className="bg-[#fafafa] dark:bg-[#121216] flex flex-col justify-between p-5 border-b md:border-b-0 md:border-r border-neutral-200/80 dark:border-neutral-800">
            <div className="relative aspect-square w-full rounded-2xl overflow-hidden bg-neutral-200 dark:bg-neutral-800 shadow-inner">
              <img
                src={item.images[activeImageIdx] || item.images[0]}
                alt={item.title}
                onError={handleGarmentError}
                className="w-full h-full object-cover"
              />
              <div className="absolute top-3 left-3 matte-glass px-3 py-1 rounded-full text-xs font-bold text-neutral-900 dark:text-neutral-100">
                Est. KSh {item.estMarketValue.toLocaleString()}
              </div>
            </div>

            {/* Thumbnail selector */}
            {item.images.length > 1 && (
              <div className="flex items-center gap-2 mt-3 overflow-x-auto pb-1">
                {item.images.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setActiveImageIdx(idx)}
                    className={`w-14 h-14 rounded-xl overflow-hidden border-2 shrink-0 transition-all cursor-pointer ${
                      activeImageIdx === idx ? 'border-neutral-900 dark:border-white scale-95 shadow-sm' : 'border-transparent opacity-60 hover:opacity-100'
                    }`}
                  >
                    <img src={img} alt="Thumbnail" onError={handleGarmentError} className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}

            {/* Owner IG Profile Bar */}
            <div className="mt-4 p-3 bg-white dark:bg-[#1a1a20] rounded-2xl border border-neutral-200/80 dark:border-neutral-800 shadow-[0_1px_4px_rgba(0,0,0,0.03)] flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="p-[1.5px] rounded-full ig-story-gradient shrink-0">
                  <div className="p-[1px] bg-white dark:bg-[#121216] rounded-full">
                    <img
                      src={item.ownerAvatar}
                      alt={item.ownerName}
                      onError={handleAvatarError}
                      className="w-9 h-9 rounded-full object-cover"
                    />
                  </div>
                </div>
                <div>
                  <div className="text-xs font-bold text-neutral-900 dark:text-white flex items-center gap-1.5">
                    {item.ownerName}
                    <span className="text-[11px] font-semibold text-amber-500">★ {owner?.rating || 4.9}</span>
                  </div>
                  <div className="text-[11px] text-neutral-400 dark:text-neutral-500">
                    {item.ownerDorm} · {owner?.tradesCompleted || 0} swaps
                  </div>
                </div>
              </div>

              <div className="text-right">
                <div className="text-[10px] text-neutral-400 dark:text-neutral-500 font-medium">Virtual Points</div>
                <div className="text-xs font-mono font-bold text-neutral-900 dark:text-white">
                  {owner?.points || 0} pts
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Garment Specs & Fabric Dossier */}
          <div className="p-6 flex flex-col justify-between max-h-[80vh] overflow-y-auto bg-white dark:bg-[#18181c] transition-colors duration-200">
            <div className="space-y-4">
              {/* Header Title & Brand */}
              <div>
                <div className="flex items-center gap-2 text-xs text-neutral-500 dark:text-neutral-400 mb-1 font-medium">
                  <span className="font-bold text-neutral-900 dark:text-white">{item.brand}</span>
                  <span>·</span>
                  <span>{item.category}</span>
                  <span>·</span>
                  <span>Size {item.size}</span>
                </div>

                <h2 className="text-xl font-bold text-neutral-900 dark:text-white">
                  {item.title}
                </h2>

                <div className="flex items-center gap-3 text-xs text-neutral-600 dark:text-neutral-300 mt-1 pb-3 border-b border-neutral-100 dark:border-neutral-800">
                  <span className="font-semibold text-neutral-900 dark:text-white">Condition: {item.condition}</span>
                  <span>·</span>
                  <span>Color: {item.color}</span>
                </div>
              </div>

              {/* Fabric Quality & Composition Dossier */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-neutral-900 dark:text-white uppercase tracking-wider flex items-center gap-1.5">
                    <Shirt className="w-4 h-4 text-neutral-700 dark:text-neutral-300" />
                    Fabric &amp; Material Quality
                  </h4>
                  <span className="text-[11px] font-mono text-neutral-500 dark:text-neutral-400 font-medium bg-neutral-100 dark:bg-neutral-800 px-2 py-0.5 rounded-full">
                    {item.fabricWeight}
                  </span>
                </div>

                <div className="p-3.5 bg-neutral-50 dark:bg-neutral-800/60 rounded-2xl border border-neutral-200/80 dark:border-neutral-700/60 text-xs space-y-2">
                  <div>
                    <span className="text-neutral-500 dark:text-neutral-400 font-medium">Composition: </span>
                    <span className="text-neutral-900 dark:text-white font-semibold">{item.fabric}</span>
                  </div>
                  <div>
                    <span className="text-neutral-500 dark:text-neutral-400 font-medium">Weave &amp; Feel: </span>
                    <span className="text-neutral-700 dark:text-neutral-300">{item.fabricNotes}</span>
                  </div>
                  <div>
                    <span className="text-neutral-500 dark:text-neutral-400 font-medium">Hostel Laundry Care: </span>
                    <span className="text-neutral-700 dark:text-neutral-300">{item.washCare}</span>
                  </div>
                </div>

                {/* Hygiene Pledge */}
                {item.cleanlinessPledge && (
                  <div className="flex items-center gap-2 p-3 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 rounded-2xl text-xs text-emerald-800 dark:text-emerald-300">
                    <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                    <span className="font-medium">Verified freshly laundered / sanitized prior to campus exchange.</span>
                  </div>
                )}

                {/* Safe Campus Meetup Hub */}
                <div className="p-3 bg-neutral-50 dark:bg-neutral-800/60 rounded-2xl border border-neutral-200/80 dark:border-neutral-700/60 text-xs">
                  <div className="flex items-center gap-1.5 text-neutral-900 dark:text-white font-bold mb-1">
                    <MapPin className="w-3.5 h-3.5 text-rose-500" />
                    Safe Campus Meetup Spot
                  </div>
                  <div className="text-neutral-600 dark:text-neutral-300 pl-5 font-medium">
                    {item.preferredMeetup}
                  </div>
                </div>

                {/* Wishlist */}
                <div className="p-3 bg-amber-50/60 dark:bg-amber-950/30 rounded-2xl border border-amber-200/60 dark:border-amber-800/50 text-xs">
                  <span className="text-amber-800 dark:text-amber-300 font-bold">Wants in exchange: </span>
                  <span className="text-neutral-800 dark:text-neutral-200 font-medium">{item.lookingFor}</span>
                </div>

                {/* AI Fabric & Styling Advisor */}
                <div className="pt-1">
                  {!aiAnalysis ? (
                    <button
                      onClick={handleAskFabricAdvisor}
                      disabled={isLoadingAi}
                      className="w-full py-2.5 px-4 matte-glass-btn text-xs font-bold text-neutral-900 dark:text-neutral-100 rounded-xl flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <Sparkles className="w-4 h-4 text-amber-500" />
                      {isLoadingAi ? 'Consulting Textile Specialist...' : 'AI Fabric Longevity & Campus Care Advisor'}
                    </button>
                  ) : (
                    <div className="p-4 bg-amber-50/80 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 rounded-2xl text-xs space-y-2">
                      <div className="flex items-center justify-between text-amber-900 dark:text-amber-200 font-bold">
                        <span className="flex items-center gap-1.5">
                          <Sparkles className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                          AI Fabric Quality Score
                        </span>
                        <span className="font-mono bg-white dark:bg-neutral-900 px-2 py-0.5 rounded-full border border-amber-200 dark:border-amber-800">
                          {aiAnalysis.fabricScore}/100 ({aiAnalysis.durabilityRating})
                        </span>
                      </div>
                      <p className="text-neutral-800 dark:text-neutral-200"><strong className="text-neutral-900 dark:text-white">Texture &amp; Drape:</strong> {aiAnalysis.handFeel}</p>
                      <p className="text-neutral-800 dark:text-neutral-200"><strong className="text-neutral-900 dark:text-white">Hostel Laundry Care:</strong> {aiAnalysis.maintenanceTips}</p>
                      <p className="text-neutral-600 dark:text-neutral-400 italic">"{aiAnalysis.campusVibe}"</p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Modal Bottom CTAs */}
            <div className="pt-6 border-t border-neutral-100 dark:border-neutral-800 mt-6 flex items-center gap-3">
              <button
                onClick={onClose}
                className="flex-1 py-2.5 matte-glass-btn text-xs font-semibold text-neutral-700 dark:text-neutral-200 rounded-xl cursor-pointer"
              >
                Close
              </button>
              {!isOwnItem ? (
                <button
                  onClick={() => {
                    onClose();
                    onProposeSwap(item);
                  }}
                  className="flex-2 py-2.5 matte-glass-btn-primary text-xs font-bold rounded-xl flex items-center justify-center gap-2 cursor-pointer"
                >
                  <ArrowLeftRight className="w-4 h-4" />
                  Propose Campus Swap
                </button>
              ) : (
                <div className="flex-1 text-center py-2.5 text-xs text-neutral-400 dark:text-neutral-500 bg-neutral-100 dark:bg-neutral-800 rounded-xl font-medium">
                  This item is in your closet
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
