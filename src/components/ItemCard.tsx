import React, { useState } from 'react';
import { ClothingItem } from '../types';
import { useSwap } from '../context/SwapContext';
import { 
  ArrowLeftRight, 
  ShieldCheck, 
  Heart, 
  Bookmark, 
  MessageCircle, 
  Share2, 
  Sparkles,
  MapPin
} from 'lucide-react';

const FALLBACK_GARMENT_SVG = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="300" height="300" viewBox="0 0 24 24" fill="none" stroke="%2394a3b8" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" style="background:%23f1f5f9;"><path d="M20.38 3.46 16 2a4 4 0 0 1-8 0L3.62 3.46a2 2 0 0 0-1.34 2.23l.58 3.47a1 1 0 0 0 .99.84H6v10c0 1.1.9 2 2 2h8a2 2 0 0 0 2-2V10h2.15a1 1 0 0 0 .99-.84l.58-3.47a2 2 0 0 0-1.34-2.23z"/></svg>`;
const FALLBACK_AVATAR_SVG = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 24 24" fill="%23cbd5e1" style="background:%23f1f5f9;"><path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/></svg>`;

interface ItemCardProps {
  item: ClothingItem;
  onInspect: (item: ClothingItem) => void;
  onProposeSwap: (item: ClothingItem) => void;
}

export const ItemCard: React.FC<ItemCardProps> = ({ item, onInspect, onProposeSwap }) => {
  const { currentUser } = useSwap();
  const isOwnItem = item.ownerId === currentUser.id;
  const [isLiked, setIsLiked] = useState(false);
  const [isSaved, setIsSaved] = useState(false);

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

  return (
    <article className="bg-white dark:bg-[#18181c] border border-[#dbdbdb] dark:border-neutral-800 rounded-2xl overflow-hidden shadow-[0_1px_3px_rgba(0,0,0,0.03)] hover:shadow-[0_8px_24px_rgba(0,0,0,0.06)] dark:hover:shadow-[0_8px_24px_rgba(0,0,0,0.3)] transition-all duration-300 flex flex-col justify-between">
      {/* IG Header: Author & Location */}
      <div className="px-3.5 py-3 flex items-center justify-between border-b border-neutral-100/80 dark:border-neutral-800/80">
        <div className="flex items-center gap-2.5 min-w-0">
          {/* IG Story Style Ring */}
          <div className="p-[1.5px] rounded-full ig-story-gradient shrink-0">
            <div className="p-[1px] bg-white dark:bg-neutral-900 rounded-full">
              <img
                src={item.ownerAvatar}
                alt={item.ownerName}
                onError={handleAvatarError}
                className="w-7 h-7 rounded-full object-cover"
              />
            </div>
          </div>

          <div className="truncate">
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-bold text-neutral-900 dark:text-neutral-100 truncate">
                {isOwnItem ? 'You' : item.ownerName}
              </span>
              {item.cleanlinessPledge && (
                <span title="Cleanliness & Fabric Verified">
                  <ShieldCheck className="w-3.5 h-3.5 text-blue-500 shrink-0" />
                </span>
              )}
            </div>
            <div className="text-[11px] text-neutral-400 dark:text-neutral-500 truncate flex items-center gap-1">
              <MapPin className="w-2.5 h-2.5 shrink-0" />
              <span>{item.ownerCampus.split('(')[0]} · {item.ownerDorm.split('(')[0]}</span>
            </div>
          </div>
        </div>

        {/* Clean KSh Price Tag */}
        <div className="px-2.5 py-1 matte-glass-btn text-[11px] font-bold text-neutral-800 dark:text-neutral-200 rounded-full shrink-0">
          KSh {item.estMarketValue.toLocaleString()}
        </div>
      </div>

      {/* Main Garment Image */}
      <div 
        className="relative aspect-square w-full bg-neutral-100 dark:bg-neutral-800 overflow-hidden cursor-pointer group"
        onClick={() => onInspect(item)}
      >
        <img
          src={item.images[0]}
          alt={item.title}
          onError={handleGarmentError}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          loading="lazy"
        />

        {/* Overlay Badges */}
        <div className="absolute top-3 left-3 matte-glass px-2.5 py-1 rounded-full text-[11px] font-semibold text-neutral-800 dark:text-neutral-100">
          {item.condition}
        </div>

        <div className="absolute top-3 right-3 matte-glass px-2.5 py-1 rounded-full text-[11px] font-mono text-neutral-700 dark:text-neutral-200">
          Size {item.size}
        </div>
      </div>

      {/* IG Action Bar & Content */}
      <div className="p-3.5 flex flex-col flex-1 justify-between gap-2.5">
        <div>
          {/* Quick Engagement Row */}
          <div className="flex items-center justify-between pb-2">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setIsLiked(!isLiked)}
                className="text-neutral-700 dark:text-neutral-300 hover:text-rose-500 transition-colors"
                aria-label="Like item"
              >
                <Heart className={`w-5 h-5 ${isLiked ? 'fill-rose-500 text-rose-500' : ''}`} />
              </button>

              <button
                onClick={() => onInspect(item)}
                className="text-neutral-700 dark:text-neutral-300 hover:text-neutral-900 dark:hover:text-white transition-colors"
                aria-label="Inspect fabric details"
              >
                <MessageCircle className="w-5 h-5" />
              </button>

              <button
                onClick={() => {
                  navigator.clipboard?.writeText(window.location.href);
                }}
                className="text-neutral-700 dark:text-neutral-300 hover:text-neutral-900 dark:hover:text-white transition-colors"
                aria-label="Share listing"
              >
                <Share2 className="w-5 h-5" />
              </button>
            </div>

            <button
              onClick={() => setIsSaved(!isSaved)}
              className="text-neutral-700 dark:text-neutral-300 hover:text-neutral-900 dark:hover:text-white transition-colors"
              aria-label="Save to wardrobe wishlist"
            >
              <Bookmark className={`w-5 h-5 ${isSaved ? 'fill-neutral-900 dark:fill-white text-neutral-900 dark:text-white' : ''}`} />
            </button>
          </div>

          {/* IG Caption Format: Bold Brand + Title */}
          <div className="text-xs text-neutral-800 dark:text-neutral-200 leading-snug">
            <span className="font-bold text-neutral-900 dark:text-white mr-1.5">{item.brand}</span>
            <span 
              onClick={() => onInspect(item)}
              className="cursor-pointer hover:underline text-neutral-900 dark:text-neutral-100 font-medium"
            >
              {item.title}
            </span>
          </div>

          {/* Fabric Specification */}
          <div className="mt-1 text-[11px] text-neutral-500 dark:text-neutral-400 line-clamp-1 font-mono">
            🧵 {item.fabric}
          </div>

          {/* Swap Wishlist / Looking for in return */}
          <div className="mt-2 p-2 bg-neutral-50 dark:bg-neutral-800/60 rounded-xl border border-neutral-100 dark:border-neutral-700/60 text-[11px] leading-relaxed">
            <span className="text-neutral-400 dark:text-neutral-400 font-semibold">Wants to swap for: </span>
            <span className="text-neutral-800 dark:text-neutral-200 line-clamp-1 font-medium">{item.lookingFor}</span>
          </div>
        </div>

        {/* Matte Glassmorphic Action Buttons */}
        <div className="pt-2 border-t border-neutral-100 dark:border-neutral-800 flex items-center gap-2">
          <button
            onClick={() => onInspect(item)}
            className="flex-1 py-1.5 px-3 matte-glass-btn text-xs font-semibold text-neutral-800 dark:text-neutral-200 rounded-xl"
          >
            Inspect Fabric
          </button>

          {!isOwnItem ? (
            <button
              onClick={() => onProposeSwap(item)}
              className="flex-1 py-1.5 px-3 matte-glass-btn-primary text-xs font-bold rounded-xl flex items-center justify-center gap-1.5"
            >
              <ArrowLeftRight className="w-3.5 h-3.5" />
              Swap Now
            </button>
          ) : (
            <span className="py-1.5 px-3 text-xs text-neutral-400 dark:text-neutral-500 bg-neutral-100 dark:bg-neutral-800/80 rounded-xl text-center font-medium">
              In Your Closet
            </span>
          )}
        </div>
      </div>
    </article>
  );
};
