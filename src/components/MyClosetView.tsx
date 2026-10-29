import React from 'react';
import { useSwap } from '../context/SwapContext';
import { ClothingItem } from '../types';
import { 
  Shirt, 
  Plus, 
  Coins, 
  Star, 
  CheckCircle2, 
  Gift,
  ShieldCheck,
  Grid,
  MapPin
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

interface MyClosetViewProps {
  onOpenAddItem: () => void;
  onInspectItem: (item: ClothingItem) => void;
  onOpenPerks: () => void;
}

export const MyClosetView: React.FC<MyClosetViewProps> = ({ onOpenAddItem, onInspectItem, onOpenPerks }) => {
  const { currentUser, items } = useSwap();

  const myItems = items.filter(i => i.ownerId === currentUser.id);

  return (
    <div className="space-y-6">
      {/* IG Style Profile Header */}
      <div className="p-6 sm:p-8 bg-white dark:bg-[#18181c] border border-[#dbdbdb] dark:border-neutral-800 rounded-3xl shadow-[0_1px_3px_rgba(0,0,0,0.03)] flex flex-col md:flex-row items-start md:items-center justify-between gap-6 transition-colors duration-200">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
          {/* Large Story Avatar */}
          <div className="p-[3px] rounded-full ig-story-gradient shrink-0">
            <div className="p-[2px] bg-white dark:bg-neutral-900 rounded-full">
              <img
                src={currentUser.avatar}
                alt={currentUser.name}
                onError={handleAvatarError}
                className="w-20 h-20 sm:w-24 sm:h-24 rounded-full object-cover"
              />
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-3">
              <h2 className="text-xl font-bold text-neutral-900 dark:text-white">{currentUser.handle}</h2>
              <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-neutral-100 dark:bg-neutral-800 text-neutral-800 dark:text-neutral-200 border border-neutral-200 dark:border-neutral-700">
                {currentUser.reputationTitle}
              </span>
            </div>

            {/* IG Stats Row */}
            <div className="flex items-center gap-5 text-xs text-neutral-700 dark:text-neutral-300">
              <div>
                <strong className="text-neutral-900 dark:text-white font-bold">{myItems.length}</strong> items listed
              </div>
              <div>
                <strong className="text-neutral-900 dark:text-white font-bold">{currentUser.tradesCompleted}</strong> swaps done
              </div>
              <div className="flex items-center gap-1">
                <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                <strong className="text-neutral-900 dark:text-white font-bold">{currentUser.rating}</strong> ({currentUser.reviewCount} reviews)
              </div>
            </div>

            {/* Student Bio */}
            <div className="text-xs text-neutral-700 dark:text-neutral-300 leading-relaxed pt-1">
              <div className="font-bold text-neutral-900 dark:text-white">{currentUser.name}</div>
              <div className="flex items-center gap-1 text-neutral-500 dark:text-neutral-400">
                <MapPin className="w-3 h-3 text-neutral-400" />
                <span>{currentUser.campus} · {currentUser.dorm}</span>
              </div>
              <div className="text-neutral-500 dark:text-neutral-400">{currentUser.year} · {currentUser.major}</div>
            </div>
          </div>
        </div>

        {/* Action & Points Pill */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full md:w-auto">
          {/* Points Pill */}
          <div className="p-4 bg-neutral-50 dark:bg-neutral-800/60 rounded-2xl border border-neutral-200 dark:border-neutral-700/60 flex items-center justify-between sm:justify-start gap-4">
            <div>
              <div className="text-[10px] text-neutral-500 dark:text-neutral-400 font-bold uppercase tracking-wider">Virtual Balance</div>
              <div className="text-2xl font-bold font-mono text-neutral-900 dark:text-white flex items-center gap-1.5">
                <Coins className="w-5 h-5 text-amber-500" />
                {currentUser.points} <span className="text-xs font-sans text-neutral-500 dark:text-neutral-400">pts</span>
              </div>
            </div>
            <button
              onClick={onOpenPerks}
              className="py-2 px-3 matte-glass-btn text-xs font-bold text-neutral-800 dark:text-neutral-200 rounded-xl flex items-center gap-1.5 cursor-pointer"
            >
              <Gift className="w-3.5 h-3.5 text-neutral-700 dark:text-neutral-300" />
              Perks Shop
            </button>
          </div>

          <button
            onClick={onOpenAddItem}
            className="py-3 px-5 matte-glass-btn-primary text-xs font-bold rounded-2xl flex items-center justify-center gap-2 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            List Clothes or Shoes (+10 Pts)
          </button>
        </div>
      </div>

      {/* Badges Earned */}
      <div className="flex flex-wrap items-center gap-2 text-xs">
        <span className="text-neutral-500 dark:text-neutral-400 font-bold mr-1">Verified Endorsements:</span>
        {currentUser.badges.map(b => (
          <span
            key={b}
            className="px-3 py-1 bg-white dark:bg-[#18181c] border border-neutral-200 dark:border-neutral-800 rounded-full text-neutral-700 dark:text-neutral-300 font-semibold flex items-center gap-1.5 shadow-xs"
          >
            <CheckCircle2 className="w-3.5 h-3.5 text-blue-500" />
            {b}
          </span>
        ))}
      </div>

      {/* Closet Inventory Grid */}
      <div className="space-y-4">
        <div className="flex items-center justify-between border-b border-neutral-200 dark:border-neutral-800 pb-3">
          <h3 className="text-sm font-bold text-neutral-900 dark:text-white flex items-center gap-2 uppercase tracking-wider">
            <Grid className="w-4 h-4 text-neutral-900 dark:text-white" />
            Your Wardrobe in Circulation ({myItems.length})
          </h3>
          <span className="text-xs text-neutral-500 dark:text-neutral-400">
            Active items appear in the Kenyan campus feed
          </span>
        </div>

        {myItems.length === 0 ? (
          <div className="p-12 text-center bg-white dark:bg-[#18181c] border border-[#dbdbdb] dark:border-neutral-800 rounded-3xl">
            <Shirt className="w-10 h-10 text-neutral-300 dark:text-neutral-600 mx-auto mb-3" />
            <h4 className="text-sm font-bold text-neutral-800 dark:text-neutral-200">Your closet is currently empty</h4>
            <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1 max-w-sm mx-auto mb-4">
              Upload your gently worn hoodies, vintage denim, or sneakers to start cycling and earning virtual points.
            </p>
            <button
              onClick={onOpenAddItem}
              className="py-2.5 px-4 matte-glass-btn-primary text-xs font-bold rounded-xl cursor-pointer"
            >
              List Your First Item (+10 Pts)
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5">
            {myItems.map(item => (
              <div
                key={item.id}
                className="bg-white dark:bg-[#18181c] border border-[#dbdbdb] dark:border-neutral-800 rounded-2xl overflow-hidden shadow-xs hover:shadow-[0_8px_20px_rgba(0,0,0,0.05)] dark:hover:shadow-[0_8px_20px_rgba(0,0,0,0.3)] transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="relative aspect-square w-full bg-neutral-100 dark:bg-neutral-800 overflow-hidden">
                    <img
                      src={item.images[0]}
                      alt={item.title}
                      onError={handleGarmentError}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute top-3 left-3 matte-glass px-2.5 py-1 rounded-full text-xs font-bold text-neutral-900 dark:text-neutral-100">
                      KSh {item.estMarketValue.toLocaleString()}
                    </div>
                  </div>

                  <div className="p-4 space-y-2">
                    <div className="flex items-center gap-1.5 text-xs text-neutral-500 dark:text-neutral-400 font-medium">
                      <span className="font-bold text-neutral-900 dark:text-white">{item.brand}</span>
                      <span>·</span>
                      <span>Size {item.size}</span>
                      <span>·</span>
                      <span>{item.condition}</span>
                    </div>

                    <h4 className="text-sm font-bold text-neutral-900 dark:text-white line-clamp-1">{item.title}</h4>
                    <p className="text-xs text-neutral-500 dark:text-neutral-400 font-mono line-clamp-1">🧵 {item.fabric}</p>

                    <div className="p-2.5 bg-neutral-50 dark:bg-neutral-800/60 rounded-xl border border-neutral-100 dark:border-neutral-700/60 text-[11px]">
                      <span className="text-neutral-500 dark:text-neutral-400 font-semibold">Wishlist: </span>
                      <span className="text-neutral-800 dark:text-neutral-200 font-medium line-clamp-1">{item.lookingFor}</span>
                    </div>
                  </div>
                </div>

                <div className="p-3 border-t border-neutral-100 dark:border-neutral-800 bg-[#fafafa] dark:bg-[#141418] flex items-center justify-between">
                  <span className="text-xs text-emerald-700 dark:text-emerald-400 flex items-center gap-1 font-bold">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                    Available to Swap
                  </span>
                  <button
                    onClick={() => onInspectItem(item)}
                    className="py-1.5 px-3 matte-glass-btn text-xs font-bold text-neutral-800 dark:text-neutral-200 rounded-xl cursor-pointer"
                  >
                    Inspect Specs
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
