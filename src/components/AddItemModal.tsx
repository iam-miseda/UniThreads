import React, { useState, useRef } from 'react';
import { useSwap } from '../context/SwapContext';
import { CategoryType, ConditionType, FabricWeight } from '../types';
import { CAMPUS_LOCATIONS } from '../data/mockData';
import { 
  X, 
  Plus, 
  Shirt, 
  ShieldCheck, 
  MapPin, 
  Coins,
  Upload,
  Camera,
  RefreshCw,
  Image as ImageIcon,
  CheckCircle2,
  Trash2,
  Sparkles,
  Gem,
  Backpack
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
    fabricNotes: 'Comfortable padded collar, soles sanitized, minimal heel wear.',
    washCare: 'Wipe down with damp cloth; do not machine wash.',
    color: 'Cloud White / Collegiate Navy',
    estMarketValue: 1600, // KSh
    lookingFor: 'Nike Dunks, Salomon trail shoes, or chore coat',
    image: 'https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?auto=format&fit=crop&w=800&q=80'
  },
  {
    label: 'Solid Cuban Chain & Ring',
    title: 'Solid 316L Stainless Steel 9mm Cuban Chain & Signet Ring',
    brand: 'Vitaly / Studio',
    category: 'Jewelry & Accessories' as CategoryType,
    size: '22-inch / Ring US 10',
    condition: 'Brand New with Tags' as ConditionType,
    fabric: 'Hypoallergenic 316L Surgical Grade Steel (Non-tarnish & Waterproof)',
    fabricWeight: 'Mid-weight (200-350 GSM)' as FabricWeight,
    fabricNotes: 'Mirror polished flat bevel edges, heavy substantial weight, 100% skin safe.',
    washCare: 'Mild soap and warm water; gym and sweat-proof.',
    color: 'Mirror Polished Silver',
    estMarketValue: 850,
    lookingFor: 'Carhartt crossbody bag, vintage tee, or beanies',
    image: 'https://images.unsplash.com/photo-1605100804763-247f67b3557e?auto=format&fit=crop&w=800&q=80'
  },
  {
    label: 'Campus Utility Canvas Tote',
    title: 'Heavyweight 16oz Natural Raw Canvas Campus Tote (Zipped)',
    brand: 'Nairobi Thrift Collective',
    category: 'Bags, Totes & Backpacks' as CategoryType,
    size: 'Large (Fits 15" Laptop)',
    condition: 'Like New / Flawless' as ConditionType,
    fabric: '100% Raw Heavy Unbleached Cotton Canvas (16 oz)',
    fabricWeight: 'Heavyweight (350+ GSM)' as FabricWeight,
    fabricNotes: 'Reinforced cross-stitched handles, heavy brass zipper, interior phone pocket.',
    washCare: 'Spot clean cold; air dry flat.',
    color: 'Natural Cream',
    estMarketValue: 550,
    lookingFor: 'Brass cuff, beaded choker, or sunglasses',
    image: 'https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&w=800&q=80'
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
  const [imageUrl, setImageUrl] = useState('');
  const [estMarketValue, setEstMarketValue] = useState<number>(850);
  const [lookingFor, setLookingFor] = useState('');
  const [preferredMeetup, setPreferredMeetup] = useState(campusData.meetupSpots[0]);
  const [cleanlinessPledge, setCleanlinessPledge] = useState(true);

  // Camera & Image Upload State
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [cameraFacing, setCameraFacing] = useState<'user' | 'environment'>('environment');
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

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

  // Handle local file upload
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      if (typeof event.target?.result === 'string') {
        setImageUrl(event.target.result);
      }
    };
    reader.readAsDataURL(file);
  };

  // Start in-browser camera stream
  const startCamera = async () => {
    try {
      setIsCameraActive(true);
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: cameraFacing,
          width: { ideal: 1280 },
          height: { ideal: 720 }
        }
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }
    } catch (err) {
      console.warn('Live camera stream not supported or denied, prompting file capture fallback', err);
      setIsCameraActive(false);
      // Trigger file capture input as safe fallback
      const fileInput = document.getElementById('camera-fallback-input') as HTMLInputElement;
      fileInput?.click();
    }
  };

  // Stop camera stream
  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    setIsCameraActive(false);
  };

  // Switch between front and back camera
  const flipCamera = async () => {
    stopCamera();
    setCameraFacing(prev => (prev === 'environment' ? 'user' : 'environment'));
    setTimeout(() => startCamera(), 100);
  };

  // Snap photo from live camera
  const captureSnapshot = () => {
    if (!videoRef.current || !canvasRef.current) return;
    const video = videoRef.current;
    const canvas = canvasRef.current;
    canvas.width = video.videoWidth || 640;
    canvas.height = video.videoHeight || 480;

    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      const dataUrl = canvas.toDataURL('image/jpeg', 0.88);
      setImageUrl(dataUrl);
      stopCamera();
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!imageUrl) return;
    stopCamera();
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-sm overflow-y-auto">
      <div 
        className="relative w-full max-w-2xl bg-white dark:bg-[#18181c] border border-neutral-200 dark:border-neutral-800 rounded-3xl shadow-2xl overflow-hidden my-4 animate-in fade-in zoom-in-95 duration-200 transition-colors duration-200 flex flex-col max-h-[92vh]"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-neutral-100 dark:border-neutral-800 bg-[#fafafa] dark:bg-[#121216]">
          <div>
            <h2 className="text-base font-bold text-neutral-900 dark:text-white flex items-center gap-2">
              <Shirt className="w-5 h-5 text-neutral-900 dark:text-white" />
              List Item to Campus Rack
            </h2>
            <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">
              Clothes, Shoes, Jewelry &amp; Bags · Earn <strong className="text-neutral-900 dark:text-white">+10 Points</strong> immediately!
            </p>
          </div>
          <button
            onClick={() => {
              stopCamera();
              onClose();
            }}
            className="p-1.5 text-neutral-400 hover:text-neutral-800 dark:hover:text-white rounded-full hover:bg-neutral-200/60 dark:hover:bg-neutral-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Quick Fill Presets */}
        <div className="px-6 pt-3 pb-2 border-b border-neutral-100 dark:border-neutral-800/80 bg-neutral-50/50 dark:bg-neutral-900/20">
          <div className="text-[11px] font-bold text-neutral-500 dark:text-neutral-400 mb-1.5 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            Quick Fill Kenyan Campus Presets:
          </div>
          <div className="flex flex-wrap gap-1.5">
            {PRESET_TEMPLATES.map(preset => (
              <button
                key={preset.label}
                type="button"
                onClick={() => applyPreset(preset)}
                className="px-2.5 py-1 text-[11px] font-semibold bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 hover:border-neutral-400 dark:hover:border-neutral-500 text-neutral-700 dark:text-neutral-300 rounded-full transition-colors cursor-pointer"
              >
                {preset.label}
              </button>
            ))}
          </div>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-5 text-xs flex-1">
          {/* IMAGE UPLOAD & CAMERA SECTION */}
          <div className="space-y-3 p-4 bg-neutral-50 dark:bg-neutral-800/40 rounded-2xl border border-neutral-200 dark:border-neutral-700/60">
            <div className="flex items-center justify-between">
              <span className="font-bold text-neutral-900 dark:text-white flex items-center gap-1.5">
                <Camera className="w-4 h-4 text-rose-500" />
                Item Photo (Upload or Take Photo with Camera)
              </span>
              <span className="text-[10px] text-neutral-400">Mobile &amp; Web Ready</span>
            </div>

            {/* LIVE CAMERA VIEWFINDER MODAL */}
            {isCameraActive ? (
              <div className="relative rounded-2xl overflow-hidden bg-black aspect-video flex flex-col items-center justify-center">
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  className="w-full h-full object-cover"
                />
                <canvas ref={canvasRef} className="hidden" />

                {/* Camera controls overlay */}
                <div className="absolute bottom-4 left-0 right-0 flex items-center justify-center gap-4 z-10 px-4">
                  <button
                    type="button"
                    onClick={flipCamera}
                    className="p-3 bg-white/20 hover:bg-white/40 text-white rounded-full backdrop-blur-md transition-colors cursor-pointer"
                    title="Flip Camera (Front/Back)"
                  >
                    <RefreshCw className="w-5 h-5" />
                  </button>

                  <button
                    type="button"
                    onClick={captureSnapshot}
                    className="p-4 bg-rose-600 hover:bg-rose-700 text-white rounded-full shadow-lg border-2 border-white transition-all active:scale-90 cursor-pointer"
                    title="Snap Photo"
                  >
                    <Camera className="w-6 h-6" />
                  </button>

                  <button
                    type="button"
                    onClick={stopCamera}
                    className="p-3 bg-white/20 hover:bg-white/40 text-white rounded-full backdrop-blur-md transition-colors cursor-pointer"
                    title="Cancel Camera"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>
            ) : (
              /* Photo Preview & Upload Buttons */
              <div className="grid grid-cols-1 sm:grid-cols-12 gap-4 items-center">
                {/* Image Preview Box */}
                <div className="sm:col-span-5 relative aspect-square rounded-2xl overflow-hidden bg-neutral-200 dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 group">
                  <img
                    src={imageUrl}
                    alt="Preview"
                    className="w-full h-full object-cover"
                   referrerPolicy="no-referrer"/>
                  <div className="absolute top-2 right-2 bg-emerald-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 shadow-xs">
                    <CheckCircle2 className="w-3 h-3" />
                    Selected
                  </div>
                </div>

                {/* Upload Action Triggers */}
                <div className="sm:col-span-7 space-y-2.5">
                  <div className="grid grid-cols-2 gap-2">
                    {/* Device File Picker */}
                    <label className="p-3 border-2 border-dashed border-neutral-300 dark:border-neutral-700 hover:border-rose-500 rounded-xl flex flex-col items-center justify-center gap-1 text-center cursor-pointer transition-colors bg-white dark:bg-neutral-900 group">
                      <Upload className="w-4 h-4 text-neutral-500 group-hover:text-rose-500" />
                      <span className="font-bold text-neutral-800 dark:text-neutral-200 text-[11px]">
                        Choose File
                      </span>
                      <span className="text-[9px] text-neutral-400">Required · Photos / Gallery</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleFileChange}
                        className="hidden"
                      />
                    </label>

                    {/* Camera Trigger */}
                    <button
                      type="button"
                      onClick={startCamera}
                      className="p-3 border-2 border-dashed border-neutral-300 dark:border-neutral-700 hover:border-rose-500 rounded-xl flex flex-col items-center justify-center gap-1 text-center cursor-pointer transition-colors bg-white dark:bg-neutral-900 group"
                    >
                      <Camera className="w-4 h-4 text-rose-500 group-hover:scale-110 transition-transform" />
                      <span className="font-bold text-neutral-800 dark:text-neutral-200 text-[11px]">
                        Take Photo
                      </span>
                      <span className="text-[9px] text-neutral-400">Mobile or Webcam</span>
                    </button>

                    {/* Fallback hidden mobile camera input */}
                    <input
                      id="camera-fallback-input"
                      type="file"
                      accept="image/*"
                      capture="environment"
                      onChange={handleFileChange}
                      className="hidden"
                    />
                  </div>

                  {/* Optional image URL fallback */}
                  <div>
                    <label className="block text-[10px] text-neutral-400 font-semibold mb-1">
                      Or use an image URL:
                    </label>
                    <input
                      type="url"
                  required={!imageUrl}
                      value={imageUrl}
                      onChange={e => setImageUrl(e.target.value)}
                      placeholder="https://your-image-host.com/photo.jpg"
                      className="w-full px-3 py-1.5 bg-white dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-700 rounded-lg text-[11px] text-neutral-900 dark:text-white"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Core Info */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label className="block font-bold text-neutral-700 dark:text-neutral-300 mb-1">
                Item Title *
              </label>
              <input
                type="text"
                required
                value={title}
                onChange={e => setTitle(e.target.value)}
                placeholder="e.g. Carhartt Chore Jacket or Brass Maasai Cuff"
                className="w-full px-3 py-2 bg-neutral-50 dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 rounded-xl text-neutral-900 dark:text-white"
              />
            </div>

            <div>
              <label className="block font-bold text-neutral-700 dark:text-neutral-300 mb-1">
                Brand / Designer
              </label>
              <input
                type="text"
                value={brand}
                onChange={e => setBrand(e.target.value)}
                placeholder="e.g. Nike, Carhartt, Stüssy, Artisan Guild"
                className="w-full px-3 py-2 bg-neutral-50 dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 rounded-xl text-neutral-900 dark:text-white"
              />
            </div>

            <div>
              <label className="block font-bold text-neutral-700 dark:text-neutral-300 mb-1">
                Category *
              </label>
              <select
                value={category}
                onChange={e => setCategory(e.target.value as CategoryType)}
                className="w-full px-3 py-2 bg-neutral-50 dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 rounded-xl text-neutral-900 dark:text-white cursor-pointer"
              >
                <option value="Jewelry & Accessories">💍 Jewelry &amp; Accessories (Chains, Rings, Cuffs)</option>
                <option value="Bags, Totes & Backpacks">🎒 Bags, Totes &amp; Backpacks</option>
                <option value="Outerwear & Jackets">🧥 Outerwear &amp; Jackets</option>
                <option value="Tops & Hoodies">👕 Tops &amp; Hoodies</option>
                <option value="Bottoms & Denim">👖 Bottoms &amp; Denim</option>
                <option value="Footwear & Sneakers">👟 Footwear &amp; Sneakers</option>
                <option value="Knitwear & Sweaters">🧶 Knitwear &amp; Sweaters</option>
                <option value="Vintage Mitumba Grails">📻 Vintage Mitumba Grails</option>
                <option value="Graphic Tees & Polos">🎨 Graphic Tees &amp; Polos</option>
                <option value="Cargos & Parachute Pants">🪂 Cargos &amp; Parachute Pants</option>
                <option value="Activewear & Gym Fits">🏃 Activewear &amp; Gym Fits</option>
                <option value="Blazers & Formal Fits">👔 Blazers &amp; Formal Fits</option>
              </select>
            </div>

            <div>
              <label className="block font-bold text-neutral-700 dark:text-neutral-300 mb-1">
                Size / Specs
              </label>
              <input
                type="text"
                value={size}
                onChange={e => setSize(e.target.value)}
                placeholder="e.g. Medium, US 10.5, W32, or One-Size"
                className="w-full px-3 py-2 bg-neutral-50 dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 rounded-xl text-neutral-900 dark:text-white"
              />
            </div>

            <div>
              <label className="block font-bold text-neutral-700 dark:text-neutral-300 mb-1">
                Condition *
              </label>
              <select
                value={condition}
                onChange={e => setCondition(e.target.value as ConditionType)}
                className="w-full px-3 py-2 bg-neutral-50 dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 rounded-xl text-neutral-900 dark:text-white cursor-pointer"
              >
                <option value="Brand New with Tags">Brand New with Tags</option>
                <option value="Like New / Flawless">Like New / Flawless</option>
                <option value="Gently Worn">Gently Worn</option>
                <option value="Vintage Character">Vintage Character</option>
              </select>
            </div>

            <div>
              <label className="block font-bold text-neutral-700 dark:text-neutral-300 mb-1">
                Est. Market Value (KSh) *
              </label>
              <input
                type="number"
                required
                min={100}
                max={50000}
                value={estMarketValue}
                onChange={e => setEstMarketValue(parseInt(e.target.value, 10) || 0)}
                className="w-full px-3 py-2 bg-neutral-50 dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 rounded-xl font-mono text-neutral-900 dark:text-white"
              />
            </div>
          </div>

          {/* Fabric & Material Details */}
          <div className="space-y-3 p-4 bg-neutral-50 dark:bg-neutral-800/40 rounded-2xl border border-neutral-200 dark:border-neutral-700/60">
            <h4 className="font-bold text-neutral-900 dark:text-white">
              Fabric, Material &amp; Durability
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-neutral-700 dark:text-neutral-300 mb-1">
                  Material Composition
                </label>
                <input
                  type="text"
                  value={fabric}
                  onChange={e => setFabric(e.target.value)}
                  placeholder="e.g. 100% Cotton Canvas or 316L Surgical Steel"
                  className="w-full px-3 py-2 bg-white dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-700 rounded-xl text-neutral-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-neutral-700 dark:text-neutral-300 mb-1">
                  Material Weight / Grade
                </label>
                <select
                  value={fabricWeight}
                  onChange={e => setFabricWeight(e.target.value as FabricWeight)}
                  className="w-full px-3 py-2 bg-white dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-700 rounded-xl text-neutral-900 dark:text-white cursor-pointer"
                >
                  <option value="Heavyweight (350+ GSM)">Heavyweight (350+ GSM / Durable)</option>
                  <option value="Mid-weight (200-350 GSM)">Mid-weight (200-350 GSM)</option>
                  <option value="Lightweight / Breathable">Lightweight / Breathable</option>
                </select>
              </div>

              <div className="sm:col-span-2">
                <label className="block text-neutral-700 dark:text-neutral-300 mb-1">
                  Weave &amp; Condition Details
                </label>
                <textarea
                  rows={2}
                  value={fabricNotes}
                  onChange={e => setFabricNotes(e.target.value)}
                  placeholder="Mention stiffness, lining, cuff texture, zero stains or undisclosed marks..."
                  className="w-full px-3 py-2 bg-white dark:bg-neutral-900 border border-neutral-300 dark:border-neutral-700 rounded-xl text-neutral-900 dark:text-white"
                />
              </div>
            </div>
          </div>

          {/* Cleanliness Pledge */}
          <div className="p-3.5 bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 rounded-2xl flex items-start gap-3">
            <input
              type="checkbox"
              id="pledge"
              checked={cleanlinessPledge}
              onChange={e => setCleanlinessPledge(e.target.checked)}
              className="mt-0.5 rounded text-emerald-600 focus:ring-emerald-500 cursor-pointer"
            />
            <label htmlFor="pledge" className="text-[11px] text-emerald-900 dark:text-emerald-200 leading-snug cursor-pointer">
              <strong className="block font-bold">UniThreads Campus Cleanliness Pledge</strong>
              I pledge that this garment or item is freshly washed, sanitized, odor-free, and clean prior to handing over at the campus exchange meetup.
            </label>
          </div>

          {/* Meetup & Wishlist */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label className="block font-bold text-neutral-700 dark:text-neutral-300 mb-1">
                Preferred Safe Meetup Spot
              </label>
              <select
                value={preferredMeetup}
                onChange={e => setPreferredMeetup(e.target.value)}
                className="w-full px-3 py-2 bg-neutral-50 dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 rounded-xl text-neutral-900 dark:text-white cursor-pointer"
              >
                {campusData.meetupSpots.map(spot => (
                  <option key={spot} value={spot}>
                    {spot}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-bold text-neutral-700 dark:text-neutral-300 mb-1">
                What are you looking for in exchange?
              </label>
              <input
                type="text"
                value={lookingFor}
                onChange={e => setLookingFor(e.target.value)}
                placeholder="e.g. Parachute pants, silver chain, tote bag..."
                className="w-full px-3 py-2 bg-neutral-50 dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 rounded-xl text-neutral-900 dark:text-white"
              />
            </div>
          </div>

          {/* Submit */}
          <div className="pt-2 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={() => {
                stopCamera();
                onClose();
              }}
              className="px-4 py-2.5 matte-glass-btn font-semibold text-neutral-700 dark:text-neutral-300 rounded-xl cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 matte-glass-btn-primary font-bold rounded-xl flex items-center gap-2 cursor-pointer shadow-md active:scale-95"
            >
              <Plus className="w-4 h-4" />
              Publish to Campus Rack (+10 Pts)
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
