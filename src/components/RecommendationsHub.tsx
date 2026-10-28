import React, { useState, useEffect } from 'react';
import { useSwap } from '../context/SwapContext';
import { ClothingItem } from '../types';
import { 
  Sparkles, 
  ArrowLeftRight, 
  Leaf, 
  Droplet, 
  Shirt, 
  TrendingUp, 
  RefreshCw, 
  Compass, 
  Star, 
  Zap,
  MapPin
} from 'lucide-react';

interface RecommendationsHubProps {
  onInspect: (item: ClothingItem) => void;
  onProposeSwap: (item: ClothingItem) => void;
}

export const RecommendationsHub: React.FC<RecommendationsHubProps> = ({ onInspect, onProposeSwap }) => {
  const { currentUser, items, reviews, allStudents } = useSwap();

  const [aiSuggestions, setAiSuggestions] = useState<any | null>(null);
  const [isLoadingAi, setIsLoadingAi] = useState(false);

  const myItems = items.filter(i => i.ownerId === currentUser.id);
  const otherItems = items.filter(i => i.ownerId !== currentUser.id && i.isAvailable);

  const mutualMatches = otherItems.map(targetItem => {
    let score = 75;
    const targetLookingFor = targetItem.lookingFor.toLowerCase();

    const matchedMyItem = myItems.find(myItem => {
      const titleWords = myItem.title.toLowerCase().split(' ');
      const brandWord = myItem.brand.toLowerCase();
      const catWord = myItem.category.toLowerCase();
      return (
        targetLookingFor.includes(brandWord) ||
        targetLookingFor.includes(catWord) ||
        titleWords.some(w => w.length > 3 && targetLookingFor.includes(w))
      );
    });

    if (matchedMyItem) {
      score += 20;
    }

    if (myItems[0]) {
      const valDiff = Math.abs(targetItem.estMarketValue - myItems[0].estMarketValue);
      if (valDiff <= 800) score += 5;
    }

    return {
      targetItem,
      suggestedMyItem: matchedMyItem || myItems[0],
      score: Math.min(score, 98),
      matchReason: matchedMyItem
        ? `${targetItem.ownerName} wants "${matchedMyItem.brand}" which you have in your closet!`
        : `Balanced value exchange with high style synergy for campus.`
    };
  }).sort((a, b) => b.score - a.score);

  const fetchAiMatches = async () => {
    setIsLoadingAi(true);
    try {
      const res = await fetch('/api/ai/recommend-matches', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          myItems,
          targetItems: otherItems
        })
      });
      const data = await res.json();
      setAiSuggestions(data);
    } catch (err) {
      console.error(err);
      setAiSuggestions({
        recommendation: 'Top mutual swap matches identified based on size alignment and Kenyan campus streetwear style vibes.',
        suggestedPairs: []
      });
    } finally {
      setIsLoadingAi(false);
    }
  };

  useEffect(() => {
    fetchAiMatches();
  }, [currentUser.id]);

  const totalTrades = allStudents.reduce((acc, s) => acc + s.tradesCompleted, 0);
  const waterSavedLiters = totalTrades * 2700;
  const co2SavedKg = Math.round(totalTrades * 14.5);
  const kshSaved = totalTrades * 1350; // realistic average KSh student savings

  return (
    <div className="space-y-8">
      {/* Header Banner */}
      <div className="p-6 bg-white border border-[#dbdbdb] rounded-3xl shadow-[0_1px_3px_rgba(0,0,0,0.03)] flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold text-amber-600 uppercase tracking-wider flex items-center gap-1.5 mb-1">
            <Sparkles className="w-4 h-4 text-amber-500" />
            UniThread Recommendation Engine
          </span>
          <h2 className="text-xl font-bold text-neutral-900">
            Smart Campus Wardrobe Matches &amp; Style Cycle
          </h2>
          <p className="text-xs text-neutral-500 mt-1 max-w-xl leading-relaxed">
            Our recommendation algorithm cross-references your closet with what peers at UoN, Strathmore, KU, and JKUAT are searching for. High-compatibility trades maximize point bonuses!
          </p>
        </div>

        <button
          onClick={fetchAiMatches}
          disabled={isLoadingAi}
          className="px-4 py-2.5 matte-glass-btn text-neutral-800 text-xs font-bold rounded-2xl flex items-center gap-2 shrink-0"
        >
          <RefreshCw className={`w-3.5 h-3.5 text-neutral-700 ${isLoadingAi ? 'animate-spin' : ''}`} />
          {isLoadingAi ? 'Refreshing AI Matches...' : 'Refresh AI Styling Insights'}
        </button>
      </div>

      {/* Campus Eco Sustainability Tracker */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-5 bg-white dark:bg-[#18181c] border border-[#dbdbdb] dark:border-neutral-800 rounded-2xl shadow-xs flex items-center gap-4 transition-colors duration-200">
          <div className="p-3 bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 rounded-xl shrink-0">
            <Droplet className="w-6 h-6" />
          </div>
          <div>
            <div className="text-xs text-neutral-500 dark:text-neutral-400 font-medium">Clean Water Conserved</div>
            <div className="text-lg font-bold text-neutral-900 dark:text-white font-mono">
              {waterSavedLiters.toLocaleString()} Liters
            </div>
            <div className="text-[11px] text-neutral-400 dark:text-neutral-500">By swapping instead of retail buying</div>
          </div>
        </div>

        <div className="p-5 bg-white dark:bg-[#18181c] border border-[#dbdbdb] dark:border-neutral-800 rounded-2xl shadow-xs flex items-center gap-4 transition-colors duration-200">
          <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 rounded-xl shrink-0">
            <Leaf className="w-6 h-6" />
          </div>
          <div>
            <div className="text-xs text-neutral-500 dark:text-neutral-400 font-medium">Campus Money Kept in Pockets</div>
            <div className="text-lg font-bold text-neutral-900 dark:text-white font-mono">
              ~KSh {kshSaved.toLocaleString()} Saved
            </div>
            <div className="text-[11px] text-neutral-400 dark:text-neutral-500">Total circular wardrobe value traded</div>
          </div>
        </div>

        <div className="p-5 bg-white dark:bg-[#18181c] border border-[#dbdbdb] dark:border-neutral-800 rounded-2xl shadow-xs flex items-center gap-4 transition-colors duration-200">
          <div className="p-3 bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 rounded-xl shrink-0">
            <Shirt className="w-6 h-6" />
          </div>
          <div>
            <div className="text-xs text-neutral-500 dark:text-neutral-400 font-medium">Garments Cycled Across Hostels</div>
            <div className="text-lg font-bold text-neutral-900 dark:text-white font-mono">
              {totalTrades} Grails Kept Alive
            </div>
            <div className="text-[11px] text-neutral-400 dark:text-neutral-500">{co2SavedKg} kg CO₂ shipping footprint avoided</div>
          </div>
        </div>
      </div>

      {/* Section 1: Mutual Swap Compatibility Recommendations */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-bold text-neutral-900 dark:text-white flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-neutral-900 dark:text-white" />
            Top Mutual Trade Matches (High Compatibility)
          </h3>
          <span className="text-xs text-neutral-400 dark:text-neutral-500">Based on your closet &amp; peer wishlists</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {mutualMatches.slice(0, 4).map(({ targetItem, suggestedMyItem, score, matchReason }) => (
            <div
              key={targetItem.id}
              className="p-5 bg-white dark:bg-[#18181c] border border-[#dbdbdb] dark:border-neutral-800 rounded-3xl shadow-[0_1px_3px_rgba(0,0,0,0.03)] hover:shadow-[0_8px_20px_rgba(0,0,0,0.05)] dark:hover:shadow-[0_8px_20px_rgba(0,0,0,0.3)] transition-all flex flex-col justify-between gap-4"
            >
              <div>
                {/* Score Header */}
                <div className="flex items-center justify-between pb-3 border-b border-neutral-100 dark:border-neutral-800">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono font-bold text-emerald-800 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 px-2.5 py-0.5 rounded-full">
                      {score}% Swap Match
                    </span>
                    <span className="text-xs text-neutral-500 dark:text-neutral-400">With {targetItem.ownerName}</span>
                  </div>
                  <span className="text-xs font-bold text-neutral-900 dark:text-white font-mono">
                    KSh {targetItem.estMarketValue.toLocaleString()}
                  </span>
                </div>

                {/* Match reason */}
                <p className="mt-3 text-xs text-neutral-700 dark:text-neutral-300 font-medium leading-relaxed">
                  💡 {matchReason}
                </p>

                {/* Target Garment Overview */}
                <div className="flex items-center gap-3 mt-3 p-3 bg-neutral-50 dark:bg-neutral-800/60 rounded-2xl border border-neutral-200 dark:border-neutral-700/60">
                  <img
                    src={targetItem.images[0]}
                    alt={targetItem.title}
                    className="w-14 h-14 rounded-xl object-cover shrink-0 border border-neutral-200 dark:border-neutral-700"
                  />
                  <div className="min-w-0 flex-1">
                    <div className="text-[11px] text-neutral-500 dark:text-neutral-400 font-semibold">{targetItem.brand} · {targetItem.size}</div>
                    <div className="text-xs font-bold text-neutral-900 dark:text-white truncate">{targetItem.title}</div>
                    <div className="text-[11px] text-neutral-400 dark:text-neutral-500 font-mono truncate">{targetItem.fabric}</div>
                  </div>
                </div>

                {/* Suggested from your closet */}
                {suggestedMyItem && (
                  <div className="mt-2 text-[11px] text-neutral-500 dark:text-neutral-400 flex items-center gap-2">
                    <span className="text-neutral-400 dark:text-neutral-500 font-semibold">Trade your:</span>
                    <span className="text-neutral-900 dark:text-white font-bold truncate">{suggestedMyItem.title}</span>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-2 pt-2 border-t border-neutral-100 dark:border-neutral-800">
                <button
                  onClick={() => onInspect(targetItem)}
                  className="px-3.5 py-2 matte-glass-btn text-xs font-semibold text-neutral-700 dark:text-neutral-200 rounded-xl cursor-pointer"
                >
                  Inspect Fabric
                </button>
                <button
                  onClick={() => onProposeSwap(targetItem)}
                  className="px-4 py-2 matte-glass-btn-primary text-xs font-bold rounded-xl flex items-center gap-1.5 cursor-pointer"
                >
                  <ArrowLeftRight className="w-3.5 h-3.5" />
                  Propose Swap
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Section 2: AI Campus Styling & Fabric Longevity Guide */}
      <div className="p-6 bg-white dark:bg-[#18181c] border border-[#dbdbdb] dark:border-neutral-800 rounded-3xl shadow-[0_1px_3px_rgba(0,0,0,0.03)] space-y-4 transition-colors duration-200">
        <div className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-amber-500" />
          <h3 className="text-base font-bold text-neutral-900 dark:text-white">
            AI Wardrobe Cycling &amp; Kenyan Campus Styling Recommendations
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
          <div className="p-4 bg-neutral-50 dark:bg-neutral-800/60 rounded-2xl border border-neutral-200/80 dark:border-neutral-700/60 space-y-2">
            <h4 className="font-bold text-neutral-900 dark:text-white flex items-center gap-1.5">
              <Compass className="w-4 h-4 text-neutral-700 dark:text-neutral-300" />
              1. The JKML Study Session Fit
            </h4>
            <p className="text-neutral-600 dark:text-neutral-300 leading-relaxed">
              Pair heavyweight fleece or the Stüssy mohair cardigan with comfortable vintage Levi's straight-leg denim and cushioned New Balance 990v5s for brisk air-conditioned library study marathons.
            </p>
          </div>

          <div className="p-4 bg-neutral-50 dark:bg-neutral-800/60 rounded-2xl border border-neutral-200/80 dark:border-neutral-700/60 space-y-2">
            <h4 className="font-bold text-neutral-900 dark:text-white flex items-center gap-1.5">
              <Shirt className="w-4 h-4 text-neutral-700 dark:text-neutral-300" />
              2. Hostel Laundry &amp; Sun Drying
            </h4>
            <p className="text-neutral-600 dark:text-neutral-300 leading-relaxed">
              When washing duck canvas and heavyweight cotton, wash inside out and hang on balcony lines in the shade. Direct midday equatorial sun can bleach vintage dyes prematurely!
            </p>
          </div>

          <div className="p-4 bg-neutral-50 dark:bg-neutral-800/60 rounded-2xl border border-neutral-200/80 dark:border-neutral-700/60 space-y-2">
            <h4 className="font-bold text-neutral-900 dark:text-white flex items-center gap-1.5">
              <Zap className="w-4 h-4 text-amber-500" />
              3. Maximize Virtual Points
            </h4>
            <p className="text-neutral-600 dark:text-neutral-300 leading-relaxed">
              Be 100% transparent about any wear on collars or cuffs. Swappers who receive 5-star peer recommendations earn +35 bonus points to redeem for Java House coffees and data passes!
            </p>
          </div>
        </div>
      </div>

      {/* Section 3: Verified Peer Recommendations Feed */}
      <div className="space-y-4">
        <h3 className="text-base font-bold text-neutral-900 dark:text-white flex items-center gap-2">
          <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
          Recent Verified Peer Recommendations &amp; Upgrades
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {reviews.map(rev => (
            <div key={rev.id} className="p-5 bg-white dark:bg-[#18181c] border border-[#dbdbdb] dark:border-neutral-800 rounded-2xl shadow-xs text-xs space-y-2.5 transition-colors duration-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="p-[1.5px] rounded-full ig-story-gradient shrink-0">
                    <div className="p-[1px] bg-white dark:bg-neutral-900 rounded-full">
                      <img
                        src={rev.reviewerAvatar}
                        alt={rev.reviewerName}
                        className="w-8 h-8 rounded-full object-cover"
                      />
                    </div>
                  </div>
                  <div>
                    <span className="font-bold text-neutral-900 dark:text-white">{rev.reviewerName}</span>
                    <span className="text-neutral-400 dark:text-neutral-500 text-[11px] ml-1.5">rated peer</span>
                  </div>
                </div>

                <div className="flex items-center gap-1 text-amber-500 font-bold">
                  ★ {rev.rating}.0
                  <span className="text-[11px] text-emerald-700 dark:text-emerald-300 font-mono ml-1.5 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-800">
                    +{rev.bonusPointsAwarded} pts upgrade
                  </span>
                </div>
              </div>

              <div className="flex flex-wrap gap-1.5">
                {rev.tags.map(tag => (
                  <span key={tag} className="px-2.5 py-1 bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 text-[11px] font-semibold rounded-lg">
                    {tag}
                  </span>
                ))}
              </div>

              <p className="text-neutral-700 dark:text-neutral-300 italic">
                "{rev.comment}"
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
