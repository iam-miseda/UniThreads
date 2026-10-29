import React, { useState } from 'react';
import { useSwap } from '../context/SwapContext';
import { STYLE_VIBES, CAMPUS_LOCATIONS } from '../data/mockData';
import { Sparkles, Check, X, ArrowRight, Flame, Heart } from 'lucide-react';

interface PreferencesOnboardingModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const PreferencesOnboardingModal: React.FC<PreferencesOnboardingModalProps> = ({ isOpen, onClose }) => {
  const { userPreferences, savePreferences, currentCampus } = useSwap();

  const [selectedVibes, setSelectedVibes] = useState<string[]>(userPreferences.vibes || ['streetwear', 'mitumba', 'bags']);
  const [selectedGender, setSelectedGender] = useState<'All' | 'Unisex' | 'Menswear' | 'Womenswear'>(
    userPreferences.genderStyle || 'All'
  );
  const [selectedCampus, setSelectedCampus] = useState<string>(
    userPreferences.primaryCampus || currentCampus || 'University of Nairobi (UoN Main)'
  );

  if (!isOpen) return null;

  const toggleVibe = (id: string) => {
    setSelectedVibes(prev =>
      prev.includes(id) ? prev.filter(v => v !== id) : [...prev, id]
    );
  };

  const handleSave = () => {
    savePreferences({
      vibes: selectedVibes,
      genderStyle: selectedGender,
      primaryCampus: selectedCampus,
      onboardingCompleted: true
    });
    onClose();
  };

  const isComplete = selectedVibes.length >= 3;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/75 backdrop-blur-md overflow-y-auto animate-in fade-in duration-200">
      <div 
        className="relative w-full max-w-2xl bg-white dark:bg-[#151519] border border-neutral-200 dark:border-neutral-800 rounded-3xl shadow-2xl overflow-hidden my-4 text-neutral-900 dark:text-neutral-100 animate-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]"
        onClick={e => e.stopPropagation()}
      >
        {/* TikTok-style Gradient Glow Header */}
        <div className="relative p-6 sm:p-8 bg-gradient-to-br from-rose-500/10 via-amber-500/10 to-transparent border-b border-neutral-100 dark:border-neutral-800/80">
          {userPreferences.onboardingCompleted && <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 text-neutral-400 hover:text-neutral-800 dark:hover:text-white rounded-full hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors cursor-pointer"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>}

          <div className="inline-flex items-center gap-2 px-3 py-1 bg-rose-500/10 dark:bg-rose-500/20 text-rose-600 dark:text-rose-400 rounded-full text-xs font-bold uppercase tracking-wider mb-2">
            <Sparkles className="w-3.5 h-3.5" />
            TikTok-Style Campus Onboarding
          </div>

          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-neutral-900 dark:text-white">
            What's Your Campus Style Vibe?
          </h2>
          <p className="text-xs sm:text-sm text-neutral-600 dark:text-neutral-300 mt-1 max-w-lg">
            Pick 3 or more aesthetics to curate your personalized Campus Rack feed, similar outfit recommendations, and mutual swap matches across Kenyan universities.
          </p>

          {/* Selection Counter Pill */}
          <div className="mt-4 flex items-center gap-2">
            <span className={`text-xs font-bold px-3 py-1 rounded-full transition-all ${
              isComplete 
                ? 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border border-emerald-500/30' 
                : 'bg-amber-500/15 text-amber-700 dark:text-amber-400 border border-amber-500/30'
            }`}>
              {isComplete ? `✨ ${selectedVibes.length} vibes selected (Ready!)` : `Select at least 3 vibes (${selectedVibes.length}/3)`}
            </span>
          </div>
        </div>

        {/* Scrollable Content */}
        <div className="p-6 sm:p-8 overflow-y-auto space-y-6 flex-1">
          {/* Aesthetic Cards Grid */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-500 dark:text-neutral-400 mb-3 flex items-center gap-1.5">
              <Flame className="w-4 h-4 text-rose-500" />
              Choose Your Fashion &amp; Accessory Vibes
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {STYLE_VIBES.map(vibe => {
                const isSelected = selectedVibes.includes(vibe.id);
                return (
                  <button
                    key={vibe.id}
                    type="button"
                    onClick={() => toggleVibe(vibe.id)}
                    className={`p-3.5 rounded-2xl text-left border transition-all cursor-pointer relative flex items-start gap-3.5 group ${
                      isSelected
                        ? 'bg-rose-50/70 dark:bg-rose-950/30 border-rose-500/80 dark:border-rose-500/80 shadow-sm ring-1 ring-rose-500/50 scale-[1.01]'
                        : 'bg-neutral-50/70 dark:bg-neutral-800/40 border-neutral-200 dark:border-neutral-800 hover:border-neutral-300 dark:hover:border-neutral-700'
                    }`}
                  >
                    <span className="text-2xl p-2 bg-white dark:bg-neutral-900 rounded-xl shadow-2xs border border-neutral-100 dark:border-neutral-800 shrink-0 group-hover:scale-110 transition-transform">
                      {vibe.icon}
                    </span>
                    <div className="flex-1 pr-6 min-w-0">
                      <h4 className="text-sm font-bold text-neutral-900 dark:text-white truncate">
                        {vibe.label}
                      </h4>
                      <p className="text-xs text-neutral-500 dark:text-neutral-400 line-clamp-1 mt-0.5">
                        {vibe.desc}
                      </p>
                    </div>

                    {/* Checkmark bubble */}
                    <div className={`absolute top-3.5 right-3.5 w-5 h-5 rounded-full flex items-center justify-center transition-all ${
                      isSelected
                        ? 'bg-rose-500 text-white scale-100'
                        : 'border border-neutral-300 dark:border-neutral-700 text-transparent scale-90 opacity-40'
                    }`}>
                      <Check className="w-3.5 h-3.5 stroke-[3]" />
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Gender / Fit Preference */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-500 dark:text-neutral-400 mb-2.5">
              Fit &amp; Silhouettes
            </h3>
            <div className="flex flex-wrap gap-2">
              {(['All', 'Unisex', 'Menswear', 'Womenswear'] as const).map(option => (
                <button
                  key={option}
                  type="button"
                  onClick={() => setSelectedGender(option)}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    selectedGender === option
                      ? 'bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 shadow-sm'
                      : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-300 hover:bg-neutral-200 dark:hover:bg-neutral-700'
                  }`}
                >
                  {option}
                </button>
              ))}
            </div>
          </div>

          {/* Primary University Campus */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-500 dark:text-neutral-400 mb-2.5">
              Your Primary University
            </h3>
            <select
              value={selectedCampus}
              onChange={e => setSelectedCampus(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-neutral-100 dark:bg-neutral-800/80 border border-neutral-200 dark:border-neutral-700 rounded-xl text-xs font-medium text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-rose-500 cursor-pointer"
            >
              {CAMPUS_LOCATIONS.map(c => (
                <option key={c.campus} value={c.campus}>
                  {c.campus}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Bottom Action Footer */}
        <div className="p-4 sm:p-6 bg-neutral-50 dark:bg-[#111114] border-t border-neutral-100 dark:border-neutral-800 flex items-center justify-between gap-3">
          {userPreferences.onboardingCompleted && <button
            onClick={onClose}
            className="px-4 py-2.5 matte-glass-btn text-xs font-semibold text-neutral-700 dark:text-neutral-300 rounded-xl cursor-pointer"
          >
            Cancel
          </button>}

          <button
            onClick={handleSave}
            disabled={!isComplete}
            className={`px-6 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer shadow-md ${
              isComplete
                ? 'bg-gradient-to-r from-rose-500 via-pink-500 to-amber-500 hover:opacity-95 text-white active:scale-95'
                : 'bg-neutral-200 dark:bg-neutral-800 text-neutral-400 dark:text-neutral-500 cursor-not-allowed'
            }`}
          >
            <span>Start Exploring My Feed</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
