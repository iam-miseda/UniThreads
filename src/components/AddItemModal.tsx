import React, { useState } from 'react';
import { useSwap } from '../context/SwapContext';
import { CategoryType, ConditionType, FabricWeight } from '../types';
import { CAMPUS_LOCATIONS } from '../data/mockData';
import { 
  X, 
  Plus, 
  Shirt, 
  ShieldCheck, 
  MapPin, 
  Coins 
} from 'lucide-react';

interface AddItemModalProps {
  onClose: () => void;
  onSuccess: () => void;
}

const PRESET_TEMPLATES = [
  {
    label: 'Vintage Heavyweight Hoodie',
    title: 'Vintage Champion Heavyweight Reverse Weave',
    brand: 'Champion',
    category: 'Tops & Hoodies' as CategoryType,
    size: 'Large',
    condition: 'Like New / Flawless' as ConditionType,
    fabric: '82% Cotton, 18% Polyester (450 GSM Double-Fleece)',
    fabricWeight: 'Heavyweight (350+ GSM)' as FabricWeight,
    fabricNotes: 'Thick structured drape, minimal shrinkage, ribbed side stretch panels.',
    washCare: 'Cold wash gentle, line dry on hostel balcony.',
    color: 'Washed Charcoal',
    estMarketValue: 750, // KSh
    lookingFor: 'Baggy workwear pants (W32) or retro kicks (EU 44)',
    image: 'https://images.unsplash.com/photo-1556905055-8f358a7a47b2?auto=format&fit=crop&w=800&q=80'
  },
  {
    label: 'Retro Streetwear Sneakers',
    title: 'Adidas Forum Low 84 Vintage Leather',
    brand: 'Adidas',
    category: 'Footwear & Sneakers' as CategoryType,
    size: 'US 10 / EU 44',
    condition: 'Gently Worn' as ConditionType,
    fabric: 'Supple Off-White Tumbled Leather with Suede 3-Stripes',
    fabricWeight: 'Heavyweight (350+ GSM)' as FabricWeight,
    fabricNotes: 'Comfortable padded collar, soles sanitized with Jason Markk foam, minimal heel wear.',
    washCare: 'Wipe down with damp cloth & leather conditioner; do not machine wash.',
    color: 'Cloud White / Collegiate Navy',
    estMarketValue: 1600, // KSh
    lookingFor: 'Nike Dunks, Salomon trail shoes, or chore coat',
    image: 'https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?auto=format&fit=crop&w=800&q=80'
  },
  {
    label: 'Gikomba Archive Work Jacket',
    title: 'Heavyweight Blanket-Lined Chore Coat',
    brand: 'Stan Ray',
    category: 'Outerwear & Jackets' as CategoryType,
    size: 'Medium (Boxy cut)',
    condition: 'Like New / Flawless' as ConditionType,
    fabric: '100% Organic Heavy Cotton Duck Canvas (14 oz)',
    fabricWeight: 'Heavyweight (350+ GSM)' as FabricWeight,
    fabricNotes: 'Stiff authentic workwear canvas that molds to the body, brass hardware.',
    washCare: 'Cold gentle wash inside out, drip dry in shade.',
    color: 'Washed Olive Drab',
    estMarketValue: 1400, // KSh
    lookingFor: 'Mohair cardigan, Arc’teryx layer, or boots size EU 41-44',
    image: 'https://images.unsplash.com/photo-1548883354-7622d03aca27?auto=format&fit=crop&w=800&q=80'
  }
];

export const AddItemModal: React.FC<AddItemModalProps> = ({ onClose, onSuccess }) => {
  const { addItem, currentCampus } = useSwap();
  const campusData = CAMPUS_LOCATIONS.find(c => c.campus === currentCampus) || CAMPUS_LOCATIONS[0];

  const [title, setTitle] = useState('');
  const [brand, setBrand] = useState('');
  const [category, setCategory] = useState<CategoryType>('Tops & Hoodies');
  const [size, setSize] = useState('Medium');
  const [condition, setCondition] = useState<ConditionType>('Like New / Flawless');
  const [fabric, setFabric] = useState('');
  const [fabricWeight, setFabricWeight] = useState<FabricWeight>('Heavyweight (350+ GSM)');
  const [fabricNotes, setFabricNotes] = useState('');
  const [washCare, setWashCare] = useState('');
  const [color, setColor] = useState('');
  const [imageUrl, setImageUrl] = useState('https://images.unsplash.com/photo-1556905055-8f358a7a47b2?auto=format&fit=crop&w=800&q=80');
  const [estMarketValue, setEstMarketValue] = useState<number>(950); // Realistic student KSh default
  const [lookingFor, setLookingFor] = useState('');
  const [preferredMeetup, setPreferredMeetup] = useState(campusData.meetupSpots[0]);
  const [cleanlinessPledge, setCleanlinessPledge] = useState(true);

  const applyPreset = (preset: typeof PRESET_TEMPLATES[0]) => {
    setTitle(preset.title);
    setBrand(preset.brand);
    setCategory(preset.category);
    setSize(preset.size);
    setCondition(preset.condition);
    setFabric(preset.fabric);
    setFabricWeight(preset.fabricWeight);
    setFabricNotes(preset.fabricNotes);
    setWashCare(preset.washCare);
    setColor(preset.color);
    setImageUrl(preset.image);
    setEstMarketValue(preset.estMarketValue);
    setLookingFor(preset.lookingFor);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    addItem({
      title,
      brand,
      category,
      size,
      condition,
      fabric,
      fabricWeight,
      fabricNotes,
      washCare,
      color,
      images: [imageUrl],
      estMarketValue,
      lookingFor,
      preferredMeetup,
      cleanlinessPledge
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
              <Shirt className="w-5 h-5 text-neutral-900 dark:text-white" />
              List Clothes or Shoes to Campus Rack
            </h2>
            <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">
              Cycle your wardrobe with fellow campus students · Earn <strong className="text-neutral-900 dark:text-white">+10 Points</strong> immediately!
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-neutral-400 hover:text-neutral-800 dark:hover:text-white rounded-full hover:bg-neutral-200/60 dark:hover:bg-neutral-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Quick Fill Presets */}
        <div className="px-6 pt-4">
          <div className="text-xs font-bold text-neutral-600 dark:text-neutral-400 mb-2">
            Quick Fill Kenyan Campus Presets:
          </div>
          <div className="flex flex-wrap gap-2">
            {PRESET_TEMPLATES.map(preset => (
              <button
                key={preset.label}
                type="button"
                onClick={() => applyPreset(preset)}
                className="px-3 py-1.5 text-xs font-semibold matte-glass-btn text-neutral-800 dark:text-neutral-200 rounded-xl cursor-pointer"
              >
                + {preset.label}
              </button>
            ))}
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
          {/* Title & Brand */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-neutral-700 dark:text-neutral-300 mb-1">Garment / Shoe Title</label>
              <input
                type="text"
                value={title}
                onChange={e => setTitle(e.target.value)}
                placeholder="e.g. Vintage Champion Heavyweight Hoodie"
                required
                className="w-full bg-neutral-50 dark:bg-[#121216] border border-neutral-300 dark:border-neutral-700 text-neutral-900 dark:text-white rounded-xl p-2.5 text-xs focus:ring-1 focus:ring-black dark:focus:ring-white"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-neutral-700 dark:text-neutral-300 mb-1">Brand</label>
              <input
                type="text"
                value={brand}
                onChange={e => setBrand(e.target.value)}
                placeholder="e.g. Nike, Carhartt, Stüssy, Levi's"
                required
                className="w-full bg-neutral-50 dark:bg-[#121216] border border-neutral-300 dark:border-neutral-700 text-neutral-900 dark:text-white rounded-xl p-2.5 text-xs focus:ring-1 focus:ring-black dark:focus:ring-white"
              />
            </div>
          </div>

          {/* Category, Size, Condition */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-bold text-neutral-700 dark:text-neutral-300 mb-1">Category</label>
              <select
                value={category}
                onChange={e => setCategory(e.target.value as CategoryType)}
                className="w-full bg-neutral-50 dark:bg-[#121216] border border-neutral-300 dark:border-neutral-700 text-neutral-900 dark:text-white rounded-xl p-2.5 text-xs focus:ring-1 focus:ring-black dark:focus:ring-white"
              >
                <option value="Outerwear & Jackets">Outerwear &amp; Jackets</option>
                <option value="Tops & Hoodies">Tops &amp; Hoodies</option>
                <option value="Bottoms & Denim">Bottoms &amp; Denim</option>
                <option value="Footwear & Sneakers">Footwear &amp; Sneakers</option>
                <option value="Knitwear & Sweaters">Knitwear &amp; Sweaters</option>
                <option value="Vintage Mitumba Grails">Vintage Mitumba Grails</option>
                <option value="Graphic Tees & Polos">Graphic Tees &amp; Polos</option>
                <option value="Cargos & Parachute Pants">Cargos &amp; Parachute Pants</option>
                <option value="Boots & Loafers">Boots &amp; Loafers</option>
                <option value="Activewear & Gym Fits">Activewear &amp; Gym Fits</option>
                <option value="Bags, Totes & Backpacks">Bags, Totes &amp; Backpacks</option>
                <option value="Headwear & Beanies">Headwear &amp; Beanies</option>
                <option value="Blazers & Formal Fits">Blazers &amp; Formal Fits</option>
                <option value="Tracksuits & Windbreakers">Tracksuits &amp; Windbreakers</option>
                <option value="Streetwear Accessories & Belts">Streetwear Accessories &amp; Belts</option>
                <option value="Campus Event & Cultural Wear">Campus Event &amp; Cultural Wear</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-neutral-700 dark:text-neutral-300 mb-1">Size</label>
              <input
                type="text"
                value={size}
                onChange={e => setSize(e.target.value)}
                placeholder="e.g. L, W32 L30, EU 44"
                required
                className="w-full bg-neutral-50 dark:bg-[#121216] border border-neutral-300 dark:border-neutral-700 text-neutral-900 dark:text-white rounded-xl p-2.5 text-xs focus:ring-1 focus:ring-black dark:focus:ring-white"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-neutral-700 dark:text-neutral-300 mb-1">Condition</label>
              <select
                value={condition}
                onChange={e => setCondition(e.target.value as ConditionType)}
                className="w-full bg-neutral-50 dark:bg-[#121216] border border-neutral-300 dark:border-neutral-700 text-neutral-900 dark:text-white rounded-xl p-2.5 text-xs focus:ring-1 focus:ring-black dark:focus:ring-white"
              >
                <option value="Brand New with Tags">Brand New with Tags</option>
                <option value="Like New / Flawless">Like New / Flawless</option>
                <option value="Gently Worn">Gently Worn</option>
                <option value="Vintage Character">Vintage Character</option>
              </select>
            </div>
          </div>

          {/* Fabric Specifications */}
          <div className="p-4 bg-neutral-50 dark:bg-neutral-800/60 rounded-2xl border border-neutral-200 dark:border-neutral-700/60 space-y-3">
            <h4 className="text-xs font-bold text-neutral-900 dark:text-white uppercase tracking-wider flex items-center gap-1.5">
              <Shirt className="w-4 h-4 text-neutral-700 dark:text-neutral-300" />
              Fabric &amp; Quality Specifications
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-neutral-700 dark:text-neutral-300 mb-1">Fabric Composition</label>
                <input
                  type="text"
                  value={fabric}
                  onChange={e => setFabric(e.target.value)}
                  placeholder="e.g. 100% Heavy Cotton Duck Canvas (14 oz)"
                  required
                  className="w-full bg-white dark:bg-[#121216] border border-neutral-300 dark:border-neutral-700 text-neutral-900 dark:text-white rounded-xl p-2 text-xs focus:ring-1 focus:ring-black dark:focus:ring-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-neutral-700 dark:text-neutral-300 mb-1">Fabric Weight</label>
                <select
                  value={fabricWeight}
                  onChange={e => setFabricWeight(e.target.value as FabricWeight)}
                  className="w-full bg-white dark:bg-[#121216] border border-neutral-300 dark:border-neutral-700 text-neutral-900 dark:text-white rounded-xl p-2 text-xs focus:ring-1 focus:ring-black dark:focus:ring-white"
                >
                  <option value="Heavyweight (350+ GSM)">Heavyweight (350+ GSM)</option>
                  <option value="Mid-weight (200-350 GSM)">Mid-weight (200-350 GSM)</option>
                  <option value="Lightweight / Breathable">Lightweight / Breathable</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-neutral-700 dark:text-neutral-300 mb-1">Weave &amp; Touch Notes</label>
                <input
                  type="text"
                  value={fabricNotes}
                  onChange={e => setFabricNotes(e.target.value)}
                  placeholder="e.g. Crisp weave, zero pilling, structured drape"
                  className="w-full bg-white dark:bg-[#121216] border border-neutral-300 dark:border-neutral-700 text-neutral-900 dark:text-white rounded-xl p-2 text-xs focus:ring-1 focus:ring-black dark:focus:ring-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-neutral-700 dark:text-neutral-300 mb-1">Hostel Wash Care Instructions</label>
                <input
                  type="text"
                  value={washCare}
                  onChange={e => setWashCare(e.target.value)}
                  placeholder="e.g. Cold gentle cycle, air dry in shade"
                  className="w-full bg-white dark:bg-[#121216] border border-neutral-300 dark:border-neutral-700 text-neutral-900 dark:text-white rounded-xl p-2 text-xs focus:ring-1 focus:ring-black dark:focus:ring-white"
                />
              </div>
            </div>
          </div>

          {/* Photo & Est Value in KSh */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="sm:col-span-2">
              <label className="block text-xs font-bold text-neutral-700 dark:text-neutral-300 mb-1">Image URL</label>
              <input
                type="url"
                value={imageUrl}
                onChange={e => setImageUrl(e.target.value)}
                required
                className="w-full bg-neutral-50 dark:bg-[#121216] border border-neutral-300 dark:border-neutral-700 text-neutral-900 dark:text-white rounded-xl p-2 text-xs focus:ring-1 focus:ring-black dark:focus:ring-white font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-neutral-700 dark:text-neutral-300 mb-1">Est. Value (KSh)</label>
              <input
                type="number"
                min="100"
                max="50000"
                step="50"
                value={estMarketValue}
                onChange={e => setEstMarketValue(parseInt(e.target.value, 10) || 1000)}
                required
                className="w-full bg-neutral-50 dark:bg-[#121216] border border-neutral-300 dark:border-neutral-700 text-neutral-900 dark:text-white rounded-xl p-2 text-xs focus:ring-1 focus:ring-black dark:focus:ring-white font-mono font-bold"
              />
            </div>
          </div>

          {/* What I want in return & Safe Campus Hub */}
          <div className="space-y-3">
            <div>
              <label className="block text-xs font-bold text-neutral-700 dark:text-neutral-300 mb-1">
                What are you looking for in exchange?
              </label>
              <input
                type="text"
                value={lookingFor}
                onChange={e => setLookingFor(e.target.value)}
                placeholder="e.g. Looking for Salomon XT-6 (EU 44), Carhartt jacket, or vintage tees"
                required
                className="w-full bg-neutral-50 dark:bg-[#121216] border border-neutral-300 dark:border-neutral-700 text-neutral-900 dark:text-white rounded-xl p-2 text-xs focus:ring-1 focus:ring-black dark:focus:ring-white"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-neutral-700 dark:text-neutral-300 mb-1">
                Preferred Safe Campus Meetup Hub
              </label>
              <select
                value={preferredMeetup}
                onChange={e => setPreferredMeetup(e.target.value)}
                className="w-full bg-neutral-50 dark:bg-[#121216] border border-neutral-300 dark:border-neutral-700 text-neutral-900 dark:text-white rounded-xl p-2 text-xs focus:ring-1 focus:ring-black dark:focus:ring-white"
              >
                {campusData.meetupSpots.map(spot => (
                  <option key={spot} value={spot}>{spot}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Cleanliness Pledge */}
          <div 
            onClick={() => setCleanlinessPledge(!cleanlinessPledge)}
            className="flex items-start gap-2.5 p-3.5 bg-neutral-50 dark:bg-neutral-800/60 rounded-2xl border border-neutral-200 dark:border-neutral-700/60 cursor-pointer text-xs"
          >
            <input
              type="checkbox"
              checked={cleanlinessPledge}
              onChange={e => setCleanlinessPledge(e.target.checked)}
              className="mt-0.5 accent-neutral-900 dark:accent-white"
            />
            <span className="text-neutral-700 dark:text-neutral-300 leading-snug">
              <strong>Cleanliness &amp; Hygiene Pledge:</strong> I verify this garment/footwear is freshly cleaned, sanitized, and stored properly prior to campus exchange.
            </span>
          </div>

          {/* CTAs */}
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
              className="py-2.5 px-6 matte-glass-btn-primary text-xs font-bold rounded-xl flex items-center gap-1.5 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              List to Campus Rack (+10 Pts)
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
