import React from 'react';
import { useSwap } from '../context/SwapContext';
import { 
  X, 
  Coins, 
  Sparkles, 
  Check 
} from 'lucide-react';

interface PerksStoreModalProps {
  onClose: () => void;
}

export const PerksStoreModal: React.FC<PerksStoreModalProps> = ({ onClose }) => {
  const { currentUser, perks, claimPerk } = useSwap();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm overflow-y-auto">
      <div 
        className="relative w-full max-w-xl bg-white dark:bg-[#18181c] border border-[#dbdbdb] dark:border-neutral-800 rounded-3xl shadow-2xl overflow-hidden my-6 animate-in fade-in zoom-in-95 duration-200 transition-colors duration-200"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-neutral-100 dark:border-neutral-800 bg-[#fafafa] dark:bg-[#121216]">
          <div>
            <h2 className="text-base font-bold text-neutral-900 dark:text-white flex items-center gap-2">
              <Coins className="w-5 h-5 text-amber-500" />
              Virtual Points Perks &amp; Rewards
            </h2>
            <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">
              Spend your earned exchange points on Kenyan campus perks &amp; partner vouchers
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-neutral-400 hover:text-neutral-800 dark:hover:text-white rounded-full hover:bg-neutral-200/60 dark:hover:bg-neutral-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Current Balance Bar */}
        <div className="p-4 bg-neutral-50 dark:bg-neutral-800/60 flex items-center justify-between border-b border-neutral-200 dark:border-neutral-700/60">
          <div className="text-xs text-neutral-700 dark:text-neutral-300">
            Available Balance for <span className="font-bold text-neutral-900 dark:text-white">{currentUser.name}</span>:
          </div>
          <div className="flex items-center gap-1.5 font-mono text-base font-bold text-neutral-900 dark:text-white bg-white dark:bg-[#121216] px-3 py-1 rounded-full border border-neutral-200 dark:border-neutral-700 shadow-2xs">
            <Coins className="w-4 h-4 text-amber-500" />
            {currentUser.points} pts
          </div>
        </div>

        {/* Perks List */}
        <div className="p-6 space-y-4 max-h-[65vh] overflow-y-auto">
          {perks.map(perk => {
            const canAfford = currentUser.points >= perk.costPoints;
            return (
              <div
                key={perk.id}
                className={`p-4 rounded-2xl border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 transition-all ${
                  perk.claimed
                    ? 'bg-neutral-50 dark:bg-neutral-800/40 border-neutral-200 dark:border-neutral-800 opacity-60'
                    : 'bg-white dark:bg-[#202026] border-neutral-200 dark:border-neutral-800 hover:shadow-md'
                }`}
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold text-neutral-600 dark:text-neutral-300 uppercase tracking-wider bg-neutral-100 dark:bg-neutral-800 px-2 py-0.5 rounded-full">
                      {perk.category}
                    </span>
                    <span className="text-xs font-mono font-bold text-neutral-900 dark:text-white">
                      {perk.costPoints} pts
                    </span>
                  </div>
                  <h4 className="text-sm font-bold text-neutral-900 dark:text-white">{perk.title}</h4>
                  <p className="text-xs text-neutral-500 dark:text-neutral-400 leading-relaxed max-w-sm">
                    {perk.description}
                  </p>
                </div>

                <div className="shrink-0 w-full sm:w-auto">
                  {perk.claimed ? (
                    <span className="w-full sm:w-auto px-4 py-2 bg-emerald-50 dark:bg-emerald-950/30 text-emerald-800 dark:text-emerald-300 text-xs font-bold rounded-xl border border-emerald-200 dark:border-emerald-800/60 flex items-center justify-center gap-1.5">
                      <Check className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                      Claimed
                    </span>
                  ) : (
                    <button
                      onClick={() => claimPerk(perk.id)}
                      disabled={!canAfford}
                      className={`w-full sm:w-auto px-4 py-2 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                        canAfford
                          ? 'matte-glass-btn-primary'
                          : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-400 dark:text-neutral-500 cursor-not-allowed border border-neutral-200 dark:border-neutral-700'
                      }`}
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                      Redeem Perk
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="p-4 bg-[#fafafa] dark:bg-[#121216] border-t border-neutral-200 dark:border-neutral-800 flex items-center justify-between text-xs text-neutral-500 dark:text-neutral-400">
          <span>Earn +50 pts per swap · +35 pts per 5-star peer recommendation</span>
          <button
            onClick={onClose}
            className="py-1.5 px-3 matte-glass-btn text-neutral-800 dark:text-neutral-200 text-xs font-bold rounded-xl cursor-pointer"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
