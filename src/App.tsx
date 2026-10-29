import React, { useState } from 'react';
import { SwapProvider, useSwap } from './context/SwapContext';
import { ClothingItem, CategoryType, SwapProposal } from './types';
import { CAMPUS_LOCATIONS } from './data/mockData';
import { ItemCard } from './components/ItemCard';
import { ItemDetailModal } from './components/ItemDetailModal';
import { ProposeSwapModal } from './components/ProposeSwapModal';
import { ActiveSwapsView } from './components/ActiveSwapsView';
import { ReviewModal } from './components/ReviewModal';
import { RecommendationsHub } from './components/RecommendationsHub';
import { MyClosetView } from './components/MyClosetView';
import { AddItemModal } from './components/AddItemModal';
import { PerksStoreModal } from './components/PerksStoreModal';
import { NotificationToast } from './components/NotificationToast';
import { FashionDoodlesBg } from './components/FashionDoodlesBg';
import { PreferencesOnboardingModal } from './components/PreferencesOnboardingModal';
import { PaymentVerificationModal } from './components/PaymentVerificationModal';
import { ChatModal } from './components/ChatModal';
import { CampusChatbot } from './components/CampusChatbot';
import { PhoneLogin } from './components/PhoneLogin';
import { UniThreadIntro } from './components/UniThreadIntro';
import { 
  ArrowLeftRight, 
  Search, 
  Plus, 
  Coins, 
  Shirt, 
  Sparkles, 
  MapPin, 
  RotateCcw, 
  Compass, 
  Grid, 
  User, 
  Building2,
  ChevronDown,
  X,
  Check,
  Sun,
  Moon,
  MessageCircle,
  Gem,
  Backpack,
  SlidersHorizontal
} from 'lucide-react';

const CATEGORIES: CategoryType[] = [
  'All',
  'Jewelry & Accessories',
  'Bags, Totes & Backpacks',
  'Outerwear & Jackets',
  'Tops & Hoodies',
  'Bottoms & Denim',
  'Footwear & Sneakers',
  'Knitwear & Sweaters',
  'Vintage Mitumba Grails',
  'Graphic Tees & Polos',
  'Cargos & Parachute Pants',
  'Boots & Loafers',
  'Activewear & Gym Fits',
  'Headwear & Beanies',
  'Blazers & Formal Fits',
  'Tracksuits & Windbreakers',
  'Streetwear Accessories & Belts',
  'Campus Event & Cultural Wear'
];

function MainApp({ onLogout }: { onLogout: () => void }) {
  const { 
    currentUser, 
    allStudents, 
    switchUser, 
    currentCampus, 
    setCurrentCampus, 
    items, 
    swaps, 
    resetDemoData,
    theme,
    toggleTheme,
    userPreferences,
    isPreferencesModalOpen,
    setIsPreferencesModalOpen,
    isChatOpen,
    openChat,
    closeChat,
    unreadChatCount
  } = useSwap();

  // Navigation State
  const [activeTab, setActiveTab] = useState<'rack' | 'swaps' | 'recommendations' | 'closet'>('rack');

  // Filter & Search State for Campus Rack
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<CategoryType>('All');
  const [selectedCondition, setSelectedCondition] = useState<string>('All');
  const [feedViewMode, setFeedViewMode] = useState<'for-you' | 'all'>('all');

  // Modals State
  const [inspectingItem, setInspectingItem] = useState<ClothingItem | null>(null);
  const [proposingSwapItem, setProposingSwapItem] = useState<ClothingItem | null>(null);
  const [reviewingSwap, setReviewingSwap] = useState<SwapProposal | null>(null);
  const [selectedPaymentSwap, setSelectedPaymentSwap] = useState<SwapProposal | null>(null);
  const [isAddItemOpen, setIsAddItemOpen] = useState(false);
  const [isPerksOpen, setIsPerksOpen] = useState(false);
  const [isCampusModalOpen, setIsCampusModalOpen] = useState(false);

  // Active swaps count needing user action
  const pendingActionsCount = swaps.filter(s => {
    if (s.status === 'completed' && ((s.proposerId === currentUser.id && !s.proposerRated) || (s.receiverId === currentUser.id && !s.receiverRated))) {
      return true;
    }
    if (s.status === 'pending' && s.receiverId === currentUser.id) {
      return true;
    }
    if (s.status === 'meetup_scheduled' && (s.proposerId === currentUser.id || s.receiverId === currentUser.id)) {
      return true;
    }
    if (s.paymentStatus === 'payment_sent' && s.receiverId === currentUser.id) {
      return true;
    }
    return false;
  }).length;

  // Filter items in campus rack based on active Campus selected via "Change Campus" button
  const availableRackItems = items.filter(item => {
    if (!item.isAvailable) return false;

    // Filter by active Campus selected from the "Change Campus" button
    if (currentCampus !== 'All Campuses' && currentCampus !== 'All Universities') {
      if (item.ownerCampus !== currentCampus) {
        return false;
      }
    }

    const preferredCategories = userPreferences.vibes.flatMap(vibe => {
      if (vibe === 'jewelry') return ['Jewelry & Accessories'];
      if (vibe === 'bags') return ['Bags, Totes & Backpacks'];
      if (vibe === 'streetwear') return ['Tops & Hoodies', 'Bottoms & Denim', 'Footwear & Sneakers', 'Graphic Tees & Polos', 'Cargos & Parachute Pants'];
      if (vibe === 'mitumba') return ['Vintage Mitumba Grails'];
      if (vibe === 'outerwear') return ['Outerwear & Jackets', 'Knitwear & Sweaters', 'Tracksuits & Windbreakers'];
      if (vibe === 'y2k') return ['Cargos & Parachute Pants', 'Streetwear Accessories & Belts'];
      if (vibe === 'smart-casual') return ['Blazers & Formal Fits', 'Boots & Loafers'];
      if (vibe === 'athleisure') return ['Activewear & Gym Fits', 'Tracksuits & Windbreakers'];
      if (vibe === 'afrocentric') return ['Campus Event & Cultural Wear', 'Jewelry & Accessories'];
      return [];
    });
    
    // When a specific category tab is selected, show that category directly
    if (selectedCategory !== 'All') {
      if (item.category !== selectedCategory) return false;
    } else if (feedViewMode === 'for-you' && preferredCategories.length > 0) {
      if (!preferredCategories.includes(item.category)) return false;
    }
    if (selectedCondition !== 'All' && item.condition !== selectedCondition) return false;

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchesTitle = item.title.toLowerCase().includes(q);
      const matchesBrand = item.brand.toLowerCase().includes(q);
      const matchesFabric = item.fabric.toLowerCase().includes(q);
      const matchesSize = item.size.toLowerCase().includes(q);
      const matchesOwner = item.ownerName.toLowerCase().includes(q);
      const matchesCampus = item.ownerCampus.toLowerCase().includes(q);
      if (!matchesTitle && !matchesBrand && !matchesFabric && !matchesSize && !matchesOwner && !matchesCampus) {
        return false;
      }
    }
    return true;
  });

  return (
    <div className="min-h-screen relative bg-[#fafafa] dark:bg-[#0e0e11] text-neutral-900 dark:text-neutral-100 flex flex-col font-sans transition-colors duration-200">
      {/* Fashion Doodles Background Sketch Pattern */}
      <FashionDoodlesBg />

      {/* Top Header with CENTRAL CURSIVE LOGO, Style Vibes, Chat, Theme Toggle & Campus Switcher */}
      <header className="sticky top-0 z-40 bg-white/95 dark:bg-[#121216]/95 backdrop-blur-md border-b border-neutral-200 dark:border-neutral-800 shadow-2xs transition-colors duration-200">
        <div className="max-w-6xl mx-auto px-4 py-3 relative flex items-center justify-between">
          {/* Left Action: Points, Post Grail & TikTok-Style Vibes */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsPerksOpen(true)}
              className="px-3 py-1.5 matte-glass-btn text-xs font-bold text-neutral-900 dark:text-neutral-100 rounded-full flex items-center gap-1.5"
              title="View Points & Perks"
            >
              <Coins className="w-4 h-4 text-amber-500" />
              <span className="font-mono">{currentUser.points} pts</span>
            </button>

            <button
              onClick={() => setIsAddItemOpen(true)}
              className="px-3.5 py-1.5 matte-glass-btn-primary text-xs font-bold rounded-full flex items-center gap-1.5 shadow-sm cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span className="hidden sm:inline">Post Grail</span>
              <span className="sm:hidden">Post</span>
            </button>

            {/* TikTok-Style Vibes Preferences Button */}
            <button
              onClick={() => setIsPreferencesModalOpen(true)}
              className="px-3 py-1.5 matte-glass-btn text-xs font-bold text-neutral-800 dark:text-neutral-200 rounded-full flex items-center gap-1.5 hover:text-rose-600 dark:hover:text-rose-400 transition-colors cursor-pointer"
              title="TikTok Style Vibes & Aesthetics Onboarding"
            >
              <Sparkles className="w-3.5 h-3.5 text-rose-500" />
              <span className="hidden md:inline">Style Vibes</span>
            </button>
          </div>

          {/* CENTRAL CURSIVE LOGO */}
          <div 
            onClick={() => setActiveTab('rack')}
            className="absolute left-1/2 -translate-x-1/2 flex items-center cursor-pointer select-none group"
          >
            <span className="font-cursive text-3xl sm:text-4xl font-bold tracking-wide text-neutral-900 dark:text-white group-hover:text-rose-600 dark:group-hover:text-rose-400 transition-colors">
              Uni Threads
            </span>
          </div>

          {/* Right: Messages Chat, Theme Toggle & Campus Switcher */}
          <div className="flex items-center gap-2">
            {/* Student Chatroom Trigger */}
            <button
              onClick={() => openChat()}
              className="p-2 matte-glass-btn rounded-full text-neutral-700 dark:text-neutral-200 hover:text-neutral-950 dark:hover:text-white transition-all shadow-2xs flex items-center justify-center cursor-pointer relative"
              title="Peer Chatroom & Messages"
              aria-label="Open Chatroom"
            >
              <MessageCircle className="w-4 h-4 text-neutral-700 dark:text-neutral-300" />
              {unreadChatCount > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-rose-500 text-white text-[10px] font-bold flex items-center justify-center animate-bounce">
                  {unreadChatCount}
                </span>
              )}
            </button>

            {/* Light / Dark Theme Toggle */}
            <button
              onClick={toggleTheme}
              className="p-2 matte-glass-btn rounded-full text-neutral-700 dark:text-neutral-200 hover:text-neutral-950 dark:hover:text-white transition-all shadow-2xs flex items-center justify-center cursor-pointer"
              title={theme === 'dark' ? 'Switch to Light Theme' : 'Switch to Dark Theme'}
              aria-label="Toggle Theme"
            >
              {theme === 'dark' ? (
                <Sun className="w-4 h-4 text-amber-400" />
              ) : (
                <Moon className="w-4 h-4 text-neutral-700 dark:text-neutral-300" />
              )}
            </button>

            {/* Campus Switcher Button */}
            <button
              onClick={() => setIsCampusModalOpen(true)}
              className="flex items-center gap-1.5 px-3.5 py-1.5 matte-glass-btn rounded-full text-xs font-semibold text-neutral-800 dark:text-neutral-200 hover:text-neutral-950 dark:hover:text-white transition-all shadow-2xs group cursor-pointer max-w-[210px]"
              title={`Active Campus: ${currentCampus}. Click to switch campus.`}
            >
              <Building2 className="w-3.5 h-3.5 text-neutral-600 dark:text-neutral-400 group-hover:text-rose-500 shrink-0" />
              <span className="hidden sm:inline truncate">
                {currentCampus === 'All Campuses'
                  ? 'All Campuses'
                  : (CAMPUS_LOCATIONS.find(c => c.campus === currentCampus)?.shortName || currentCampus.split('(')[0].trim())}
              </span>
              <span className="sm:hidden truncate">
                {currentCampus === 'All Campuses'
                  ? 'Campus'
                  : (CAMPUS_LOCATIONS.find(c => c.campus === currentCampus)?.shortName || 'Campus')}
              </span>
              <ChevronDown className="w-3 h-3 text-neutral-400 group-hover:text-neutral-700 dark:group-hover:text-neutral-200 shrink-0" />
            </button>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 py-6 space-y-6 relative z-10">
        {/* Navigation Tabs Pill */}
        <div className="flex items-center justify-center">
          <div className="inline-flex p-1 bg-white/80 dark:bg-[#18181c]/80 backdrop-blur-md rounded-full border border-neutral-200 dark:border-neutral-800 shadow-xs">
            <button
              onClick={() => setActiveTab('rack')}
              className={`px-4 py-1.5 text-xs font-bold rounded-full transition-all flex items-center gap-1.5 cursor-pointer ${
                activeTab === 'rack'
                  ? 'bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 shadow-xs'
                  : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white'
              }`}
            >
              <Grid className="w-3.5 h-3.5" />
              Campus Rack
            </button>

            <button
              onClick={() => setActiveTab('swaps')}
              className={`px-4 py-1.5 text-xs font-bold rounded-full transition-all flex items-center gap-1.5 relative cursor-pointer ${
                activeTab === 'swaps'
                  ? 'bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 shadow-xs'
                  : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white'
              }`}
            >
              <ArrowLeftRight className="w-3.5 h-3.5" />
              Exchanges
              {pendingActionsCount > 0 && (
                <span className="w-4 h-4 rounded-full bg-rose-500 text-white text-[10px] font-bold flex items-center justify-center">
                  {pendingActionsCount}
                </span>
              )}
            </button>

            <button
              onClick={() => setActiveTab('recommendations')}
              className={`px-4 py-1.5 text-xs font-bold rounded-full transition-all flex items-center gap-1.5 cursor-pointer ${
                activeTab === 'recommendations'
                  ? 'bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 shadow-xs'
                  : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white'
              }`}
            >
              <Compass className="w-3.5 h-3.5" />
              Explore Matches
            </button>

            <button
              onClick={() => setActiveTab('closet')}
              className={`px-4 py-1.5 text-xs font-bold rounded-full transition-all flex items-center gap-1.5 cursor-pointer ${
                activeTab === 'closet'
                  ? 'bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 shadow-xs'
                  : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white'
              }`}
            >
              <User className="w-3.5 h-3.5" />
              Profile &amp; Closet
            </button>
          </div>
        </div>

        {/* TAB 1: CAMPUS RACK */}
        {activeTab === 'rack' && (
          <div className="space-y-6">
            {/* HERO SECTION */}
            <div className="bg-white/95 dark:bg-[#18181c]/95 backdrop-blur-sm border border-neutral-200 dark:border-neutral-800 rounded-3xl overflow-hidden shadow-[0_4px_20px_rgba(0,0,0,0.03)] dark:shadow-[0_4px_20px_rgba(0,0,0,0.25)] transition-colors duration-200">
              <div className="grid grid-cols-1 lg:grid-cols-12">
                {/* Left Hero Content */}
                <div className="lg:col-span-7 p-6 sm:p-10 flex flex-col justify-between border-b lg:border-b-0 lg:border-r border-neutral-200 dark:border-neutral-800">
                  <div className="space-y-4">
                    <div className="flex items-center gap-2">
                      <span className="text-xl text-neutral-900 dark:text-white">✦</span>
                      <span className="text-xs font-bold uppercase tracking-widest text-neutral-500 dark:text-neutral-400">
                        Circular Campus Fashion &amp; Accessories
                      </span>
                    </div>

                    <h1 className="text-3xl sm:text-5xl font-extrabold text-neutral-900 dark:text-white tracking-tight leading-[1.1]">
                      Wardrobe, kicks, jewelry &amp; bag exchange
                    </h1>

                    <p className="text-xs sm:text-sm text-neutral-600 dark:text-neutral-300 leading-relaxed max-w-lg">
                      Trade clothes, sneakers, chains, and campus bags directly with peers across UoN, Strathmore, KU, and JKUAT. Verify clean laundry condition, utilize Binance-style M-Pesa escrow verification, and meet safely on campus.
                    </p>

                    {/* Action buttons */}
                    <div className="pt-2 flex flex-wrap items-center gap-3">
                      <button
                        onClick={() => {
                          const rackEl = document.getElementById('rack-items-section');
                          rackEl?.scrollIntoView({ behavior: 'smooth' });
                        }}
                        className="py-3 px-6 matte-glass-btn-primary text-xs font-bold rounded-full uppercase tracking-wider cursor-pointer"
                      >
                        EXPLORE RACK
                      </button>

                      <button
                        onClick={() => setIsPreferencesModalOpen(true)}
                        className="py-3 px-5 matte-glass-btn text-xs font-bold text-neutral-800 dark:text-neutral-200 rounded-full uppercase tracking-wider flex items-center gap-2 cursor-pointer"
                      >
                        <Sparkles className="w-4 h-4 text-rose-500" />
                        MY STYLE VIBES
                      </button>
                    </div>
                  </div>

                  <div className="pt-8 text-[11px] text-neutral-500 dark:text-neutral-400 flex items-center gap-1.5">
                    <span className="text-rose-500 font-bold">*</span>
                    <span>100% peer student verification · Binance P2P M-Pesa escrow · Cleanliness &amp; Quality ratings</span>
                  </div>
                </div>

                {/* Right Hero Graphic */}
                <div className="lg:col-span-5 bg-neutral-50/70 dark:bg-[#141418] p-6 sm:p-10 flex items-center justify-center relative overflow-hidden transition-colors duration-200">
                  <div className="w-full max-w-sm aspect-[4/4.2] relative flex items-center justify-center">
                    <svg
                      viewBox="0 0 380 400"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                      className="w-full h-full select-none"
                    >
                      <path
                        d="M260 80C330 80 370 130 370 200C370 270 320 340 250 340C200 340 180 310 140 310C100 310 80 350 50 350C20 350 10 320 10 280C10 230 40 180 80 160C120 140 190 80 260 80Z"
                        className="fill-neutral-100/70 dark:fill-neutral-800/40"
                      />

                      <g className="text-neutral-900 dark:text-neutral-200">
                        <polygon points="205,35 240,95 170,95" fill="#ef4444" transform="rotate(6 205 65)" />
                        <rect x="75" y="32" width="24" height="24" rx="4" fill="currentColor" transform="rotate(-15 87 44)" />
                        <rect x="190" y="105" width="22" height="22" rx="4" fill="currentColor" transform="rotate(22 201 116)" />
                        <rect x="295" y="65" width="20" height="20" rx="4" fill="currentColor" transform="rotate(8 305 75)" />
                      </g>

                      <g transform="rotate(-16 220 200)">
                        <rect x="108" y="138" width="220" height="94" rx="47" fill="#5a98a8" />
                        <circle cx="275" cy="185" r="31" className="fill-white dark:fill-[#121216]" />
                      </g>

                      <g transform="translate(145, 235)">
                        <polygon points="40,140 0,0 95,78 52,80 72,130 50,140" className="fill-neutral-900 dark:fill-white" />
                      </g>
                    </svg>

                    <div className="absolute bottom-2 right-4 px-3 py-1 bg-white/90 dark:bg-neutral-900/90 backdrop-blur-md rounded-full border border-neutral-200/80 dark:border-neutral-700/80 shadow-xs flex items-center gap-1.5 text-[10px] font-bold text-neutral-800 dark:text-neutral-200">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                      100% Peer Verified
                    </div>
                  </div>
                </div>
              </div>

              {/* Stats Bar */}
              <div className="border-t border-neutral-200 dark:border-neutral-800 grid grid-cols-2 md:grid-cols-4 divide-y md:divide-y-0 md:divide-x divide-neutral-200 dark:divide-neutral-800 text-xs bg-white dark:bg-[#18181c] transition-colors duration-200">
                <div className="p-4 sm:p-5 flex items-center gap-3">
                  <div className="flex -space-x-2 shrink-0">
                    {allStudents.slice(0, 5).map(s => (
                      <img
                        key={s.id}
                        src={s.avatar}
                        alt={s.name}
                        className="w-7 h-7 rounded-full object-cover border-2 border-white dark:border-neutral-900"
                       referrerPolicy="no-referrer"/>
                    ))}
                  </div>
                  <div>
                    <div className="font-bold text-neutral-900 dark:text-white text-sm">4,800+</div>
                    <div className="text-[11px] text-neutral-500 dark:text-neutral-400">Kenyan students</div>
                  </div>
                </div>

                <div className="p-4 sm:p-5">
                  <div className="font-bold text-neutral-900 dark:text-white text-sm">1,420+</div>
                  <div className="text-[11px] text-neutral-500 dark:text-neutral-400">Swaps completed</div>
                </div>

                <div className="p-4 sm:p-5">
                  <div className="font-bold text-neutral-900 dark:text-white text-sm font-mono">~KSh 1.8M</div>
                  <div className="text-[11px] text-neutral-500 dark:text-neutral-400">Student budget saved</div>
                </div>

                <div className="p-4 sm:p-5 flex items-center justify-between text-[11px] text-neutral-600 dark:text-neutral-300 font-bold overflow-x-auto scrollbar-none">
                  <span>UoN</span>
                  <span>·</span>
                  <span>Strathmore</span>
                  <span>·</span>
                  <span>KU</span>
                  <span>·</span>
                  <span>JKUAT</span>
                  <span>·</span>
                  <span>USIU</span>
                  <span>·</span>
                  <span>Daystar</span>
                </div>
              </div>
            </div>

            {/* Search & Categories Section */}
            <div id="rack-items-section" className="space-y-3.5 pt-2">
              {/* Search, Condition & Fabric Weight Bar */}
              <div className="flex flex-col sm:flex-row items-center gap-3">
                <div className="relative w-full sm:flex-1">
                  <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    placeholder="Search brand, jewelry, bags, fabric, campus (e.g. Cuban Chain, Canvas Tote, Carhartt, Dunks)..."
                    className="w-full bg-white/95 dark:bg-[#18181c]/95 backdrop-blur-sm border border-[#dbdbdb] dark:border-neutral-700 rounded-2xl pl-10 pr-4 py-2.5 text-xs text-neutral-900 dark:text-neutral-100 placeholder-neutral-400 dark:placeholder-neutral-500 focus:outline-none focus:border-neutral-900 dark:focus:border-white shadow-xs"
                  />
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery('')}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs text-neutral-400 hover:text-neutral-800 dark:hover:text-neutral-200 cursor-pointer"
                    >
                      Clear
                    </button>
                  )}
                </div>

                {/* Condition Filter */}
                <select
                  value={selectedCondition}
                  onChange={e => setSelectedCondition(e.target.value)}
                  className="w-full sm:w-auto bg-white dark:bg-[#18181c] border border-[#dbdbdb] dark:border-neutral-700 text-neutral-700 dark:text-neutral-200 font-semibold rounded-2xl px-3 py-2.5 text-xs focus:outline-none focus:border-neutral-900 dark:focus:border-white shadow-xs cursor-pointer"
                >
                  <option value="All">All Conditions</option>
                  <option value="Brand New with Tags">Brand New with Tags</option>
                  <option value="Like New / Flawless">Like New / Flawless</option>
                  <option value="Gently Worn">Gently Worn</option>
                  <option value="Vintage Character">Vintage Character</option>
                </select>
              </div>

              {/* Category Filter Pills (Prominently featuring Jewelry & Bags) */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 pt-1 scrollbar-none">
                {CATEGORIES.map(category => (
                  <button
                    key={category}
                    onClick={() => setSelectedCategory(category)}
                    className={`px-3.5 py-1.5 text-xs font-bold rounded-full transition-all whitespace-nowrap shadow-2xs cursor-pointer ${
                      selectedCategory === category
                        ? 'bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 shadow-xs'
                        : 'bg-white/90 dark:bg-[#18181c] text-neutral-600 dark:text-neutral-300 hover:text-neutral-900 dark:hover:text-white border border-[#dbdbdb] dark:border-neutral-800 hover:border-neutral-400 dark:hover:border-neutral-600'
                    }`}
                  >
                    {category}
                  </button>
                ))}
              </div>
            </div>

            {/* Campus Grails Feed */}
            <div>
              <div className="flex flex-wrap items-center justify-between gap-3 mb-4 text-xs">
                <div className="flex items-center gap-2.5">
                  <div className="inline-flex p-0.5 bg-neutral-200/70 dark:bg-neutral-800 rounded-full border border-neutral-300/50 dark:border-neutral-700/50">
                    <button
                      onClick={() => setFeedViewMode('all')}
                      className={`px-3 py-1 rounded-full text-xs font-bold transition-all cursor-pointer ${
                        feedViewMode === 'all'
                          ? 'bg-white dark:bg-neutral-900 text-neutral-900 dark:text-white shadow-xs'
                          : 'text-neutral-500 hover:text-neutral-900 dark:hover:text-white'
                      }`}
                    >
                      {currentCampus === 'All Campuses'
                        ? `All Campus Grails (${items.filter(i => i.isAvailable).length})`
                        : `${CAMPUS_LOCATIONS.find(c => c.campus === currentCampus)?.shortName || 'Campus'} Grails (${items.filter(i => i.isAvailable && i.ownerCampus === currentCampus).length})`}
                    </button>
                    <button
                      onClick={() => setFeedViewMode('for-you')}
                      className={`px-3 py-1 rounded-full text-xs font-bold transition-all flex items-center gap-1 cursor-pointer ${
                        feedViewMode === 'for-you'
                          ? 'bg-rose-500 text-white shadow-xs'
                          : 'text-neutral-500 hover:text-rose-500'
                      }`}
                    >
                      <Sparkles className="w-3 h-3" />
                      For You {userPreferences.vibes.length > 0 && `(${userPreferences.vibes.length})`}
                    </button>
                  </div>
                  <span className="text-neutral-500 dark:text-neutral-400">
                    Showing <strong className="text-neutral-900 dark:text-white">{availableRackItems.length}</strong> items
                  </span>
                </div>

                {/* Active Campus Status & Change Campus Trigger */}
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setIsCampusModalOpen(true)}
                    className="flex items-center gap-1.5 px-3 py-1 bg-white/90 dark:bg-[#18181c] border border-neutral-200 dark:border-neutral-800 rounded-full text-xs font-semibold text-neutral-800 dark:text-neutral-200 hover:border-neutral-400 dark:hover:border-neutral-600 transition-all cursor-pointer shadow-2xs group"
                    title="Change active university campus"
                  >
                    <Building2 className="w-3.5 h-3.5 text-rose-500 shrink-0" />
                    <span>{currentCampus}</span>
                    <span className="text-[10px] text-rose-500 font-bold ml-0.5 group-hover:underline">
                      (Change)
                    </span>
                  </button>
                </div>
              </div>

              {/* Campus Spotlight Banner (Displays when a specific university is chosen via Change Campus button) */}
              {currentCampus !== 'All Campuses' && (() => {
                const currentLoc = CAMPUS_LOCATIONS.find(c => c.campus === currentCampus);
                const campusStudents = allStudents.filter(s => s.campus === currentCampus);
                if (!currentLoc) return null;
                return (
                  <div className="bg-gradient-to-r from-neutral-50 to-neutral-100/70 dark:from-[#18181c] dark:to-[#1e1e24] border border-neutral-200/90 dark:border-neutral-800 rounded-3xl p-5 sm:p-6 mb-6 shadow-xs">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                      <div className="space-y-2">
                        <div className="flex items-center gap-2.5 flex-wrap">
                          <span className="text-3xl">{currentLoc.emoji}</span>
                          <div>
                            <div className="flex items-center gap-2">
                              <h2 className="text-xl sm:text-2xl font-black text-neutral-900 dark:text-white">
                                {currentLoc.campus}
                              </h2>
                              <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold border ${currentLoc.badgeColor}`}>
                                {currentLoc.shortName}
                              </span>
                            </div>
                            <p className="text-xs text-neutral-600 dark:text-neutral-300 font-medium mt-0.5">
                              {currentLoc.tagline}
                            </p>
                          </div>
                        </div>

                        <div className="pt-2 flex flex-wrap items-center gap-2">
                          <span className="text-xs font-bold text-neutral-700 dark:text-neutral-300">Verified Meetup Hubs:</span>
                          {currentLoc.meetupSpots.map((spot, i) => (
                            <span key={i} className="text-[11px] bg-white dark:bg-neutral-800 border border-neutral-200/80 dark:border-neutral-700/80 px-2.5 py-1 rounded-full text-neutral-700 dark:text-neutral-300 font-medium flex items-center gap-1 shadow-2xs">
                              <MapPin className="w-3 h-3 text-rose-500" />
                              {spot}
                            </span>
                          ))}
                        </div>
                      </div>

                      <div className="flex items-center gap-3 shrink-0 self-start md:self-center">
                        <div className="text-right">
                          <div className="text-xs font-bold text-neutral-900 dark:text-white">Campus Curators</div>
                          <div className="text-[11px] text-neutral-500 dark:text-neutral-400">
                            {campusStudents.map(s => s.name).join(' & ')}
                          </div>
                        </div>
                        <div className="flex -space-x-2">
                          {campusStudents.map(s => (
                            <img
                              key={s.id}
                              src={s.avatar}
                              alt={s.name}
                              className="w-9 h-9 rounded-full object-cover border-2 border-white dark:border-neutral-900 shadow-sm"
                              referrerPolicy="no-referrer"
                            />
                          ))}
                        </div>
                        <button
                          onClick={() => setCurrentCampus('All Campuses')}
                          className="ml-2 px-3.5 py-1.5 matte-glass-btn text-xs font-bold text-neutral-800 dark:text-neutral-200 rounded-full hover:text-neutral-950 dark:hover:text-white transition-all cursor-pointer"
                        >
                          ← All Campuses
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })()}

              {/* Items Grid or Empty State */}
              {availableRackItems.length === 0 ? (
                <div className="p-12 text-center bg-white/90 dark:bg-[#18181c]/90 backdrop-blur-sm border border-[#dbdbdb] dark:border-neutral-800 rounded-3xl">
                  <Shirt className="w-10 h-10 text-neutral-300 dark:text-neutral-600 mx-auto mb-3" />
                  <h3 className="text-sm font-bold text-neutral-800 dark:text-neutral-200">No items match your filters</h3>
                  <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1 max-w-sm mx-auto mb-4">
                    {currentCampus !== 'All Campuses'
                      ? `No items found for ${currentCampus} with current search / filters.`
                      : 'Try clearing your search query or reset category filters.'}
                  </p>
                  <div className="flex items-center justify-center gap-3">
                    <button
                      onClick={() => {
                        setSearchQuery('');
                        setSelectedCategory('All');
                        setSelectedCondition('All');
                      }}
                      className="py-2 px-4 matte-glass-btn text-xs font-bold text-neutral-900 dark:text-white rounded-xl cursor-pointer"
                    >
                      Reset Filters
                    </button>
                    {currentCampus !== 'All Campuses' && (
                      <button
                        onClick={() => setCurrentCampus('All Campuses')}
                        className="py-2 px-4 matte-glass-btn-primary text-xs font-bold rounded-xl cursor-pointer"
                      >
                        Browse All Campuses
                      </button>
                    )}
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                  {availableRackItems.map(item => (
                    <ItemCard
                      key={item.id}
                      item={item}
                      onInspect={it => setInspectingItem(it)}
                      onProposeSwap={it => setProposingSwapItem(it)}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 2: ACTIVE EXCHANGES & MEETUPS */}
        {activeTab === 'swaps' && (
          <ActiveSwapsView
            onOpenReviewModal={swap => setReviewingSwap(swap)}
            onOpenPaymentModal={swap => setSelectedPaymentSwap(swap)}
          />
        )}

        {/* TAB 3: SMART RECOMMENDATIONS & AI STYLIST */}
        {activeTab === 'recommendations' && (
          <RecommendationsHub
            onInspect={it => setInspectingItem(it)}
            onProposeSwap={it => setProposingSwapItem(it)}
          />
        )}

        {/* TAB 4: MY CLOSET */}
        {activeTab === 'closet' && (
          <MyClosetView
            onOpenAddItem={() => setIsAddItemOpen(true)}
            onInspectItem={it => setInspectingItem(it)}
            onOpenPerks={() => setIsPerksOpen(true)}
            onLogout={onLogout}
          />
        )}
      </main>

      {/* BOTTOM SWAPPER STORIES TRAY */}
      <section className="border-t border-neutral-200/90 dark:border-neutral-800 bg-white/95 dark:bg-[#141418]/95 backdrop-blur-md py-4 px-4 mt-8 relative z-20 shadow-xs transition-colors duration-200">
        <div className="max-w-6xl mx-auto space-y-2.5">
          <div className="flex items-center justify-between px-1">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse"></span>
              <span className="text-xs font-bold uppercase tracking-wider text-neutral-800 dark:text-neutral-200">
                Kenyan Student Swapper Circle
              </span>
              <span className="text-[11px] text-neutral-400 dark:text-neutral-500 hidden sm:inline">
                — Demo profiles use illustrated avatars; tap one to switch perspective &amp; trade closets
              </span>
            </div>
            <span className="text-[11px] text-neutral-500 dark:text-neutral-400 font-medium">
              {allStudents.length} Verified Kenyan Students
            </span>
          </div>

          <div className="flex items-center gap-5 sm:gap-6 overflow-x-auto pb-2 scrollbar-none">
            {allStudents.map(student => {
              const isSelected = currentUser.id === student.id;
              return (
                <button
                  key={student.id}
                  onClick={() => switchUser(student.id)}
                  className="flex flex-col items-center gap-1 shrink-0 group focus:outline-none cursor-pointer"
                  title={`${student.name} · ${student.campus} (${student.major})`}
                >
                  <div
                    className={`p-[2.5px] rounded-full transition-transform duration-200 group-hover:scale-105 ${
                      isSelected ? 'ig-story-gradient shadow-sm' : 'bg-neutral-200 dark:bg-neutral-800 hover:bg-neutral-300 dark:hover:bg-neutral-700'
                    }`}
                  >
                    <div className="p-[2px] bg-white dark:bg-[#141418] rounded-full">
                      <img
                        src={student.avatar}
                        alt={student.name}
                        className="w-12 h-12 rounded-full object-cover"
                       referrerPolicy="no-referrer"/>
                    </div>
                  </div>
                  <span className={`text-[11px] truncate max-w-[80px] ${isSelected ? 'font-bold text-neutral-900 dark:text-white' : 'text-neutral-500 dark:text-neutral-400'}`}>
                    {student.name.split(' ')[0]}
                  </span>
                  <span className="text-[10px] text-neutral-400 dark:text-neutral-500 truncate max-w-[80px]">
                    {student.points} pts
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-[#dbdbdb] dark:border-neutral-800 bg-white/95 dark:bg-[#121216]/95 backdrop-blur-sm py-6 text-xs text-neutral-500 dark:text-neutral-400 relative z-10 transition-colors duration-200">
        <div className="max-w-6xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="font-cursive text-xl font-bold text-neutral-900 dark:text-white">Uni Threads</span>
            <span>· Campus Student Wardrobe &amp; Accessories Exchange</span>
          </div>

          <div className="flex items-center gap-4">
            <button
              onClick={resetDemoData}
              className="text-neutral-500 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white flex items-center gap-1 transition-colors font-medium cursor-pointer"
              title="Reset all demo items and trades to initial state"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Reset Demo State
            </button>
            <span>UoN · Strathmore · KU · JKUAT · USIU · Daystar</span>
          </div>
        </div>
      </footer>

      {/* MODALS */}
      {inspectingItem && (
        <ItemDetailModal
          item={inspectingItem}
          onClose={() => setInspectingItem(null)}
          onProposeSwap={item => {
            setInspectingItem(null);
            setProposingSwapItem(item);
          }}
          onSelectSimilarItem={simItem => setInspectingItem(simItem)}
        />
      )}

      {proposingSwapItem && (
        <ProposeSwapModal
          requestedItem={proposingSwapItem}
          onClose={() => setProposingSwapItem(null)}
          onSuccess={() => {
            setProposingSwapItem(null);
            setActiveTab('swaps');
          }}
        />
      )}

      {reviewingSwap && (
        <ReviewModal
          swap={reviewingSwap}
          onClose={() => setReviewingSwap(null)}
          onSuccess={() => setReviewingSwap(null)}
        />
      )}

      {isAddItemOpen && (
        <AddItemModal
          onClose={() => setIsAddItemOpen(false)}
          onSuccess={() => {
            setIsAddItemOpen(false);
            setActiveTab('closet');
          }}
        />
      )}

      {isPerksOpen && (
        <PerksStoreModal
          onClose={() => setIsPerksOpen(false)}
        />
      )}

      {/* TikTok Style Onboarding Preferences Modal */}
      <PreferencesOnboardingModal
        isOpen={isPreferencesModalOpen}
        onClose={() => {
          if (userPreferences.onboardingCompleted) setIsPreferencesModalOpen(false);
        }}
      />

      {/* Binance P2P M-Pesa Payment & Verification Modal */}
      <PaymentVerificationModal
        swap={selectedPaymentSwap}
        onClose={() => setSelectedPaymentSwap(null)}
      />

      {/* Peer Chatroom Modal */}
      <ChatModal
        isOpen={isChatOpen}
        onClose={closeChat}
        onOpenPayment={swapId => {
          const target = swaps.find(s => s.id === swapId);
          if (target) setSelectedPaymentSwap(target);
        }}
        onOpenSwap={itemId => {
          const target = items.find(i => i.id === itemId);
          if (target) setProposingSwapItem(target);
        }}
      />

      {/* Floating Campus AI Chatbot (UniBot) */}
      <CampusChatbot />

      {/* Campus Selector Modal */}
      {isCampusModalOpen && (
        <div 
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/45 backdrop-blur-xs animate-in fade-in duration-150"
          onClick={() => setIsCampusModalOpen(false)}
        >
          <div 
            onClick={e => e.stopPropagation()}
            className="w-full max-w-lg bg-white dark:bg-[#18181c] rounded-3xl shadow-2xl border border-neutral-200 dark:border-neutral-800 overflow-hidden flex flex-col transition-colors duration-200"
          >
            <div className="p-5 border-b border-neutral-100 dark:border-neutral-800 flex items-center justify-between bg-neutral-50/70 dark:bg-neutral-900/70">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 flex items-center justify-center shadow-xs">
                  <Building2 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-neutral-900 dark:text-white">Select Campus</h3>
                  <p className="text-xs text-neutral-500 dark:text-neutral-400">Pick your campus to trade with nearby students</p>
                </div>
              </div>
              <button
                onClick={() => setIsCampusModalOpen(false)}
                className="w-8 h-8 rounded-full flex items-center justify-center text-neutral-400 hover:text-neutral-800 dark:hover:text-neutral-200 hover:bg-neutral-200/60 dark:hover:bg-neutral-800 transition-colors"
                title="Close"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="px-5 py-3 bg-neutral-100/70 dark:bg-neutral-900/50 border-b border-neutral-200/60 dark:border-neutral-800 flex items-center justify-between text-xs">
              <span className="text-neutral-500 dark:text-neutral-400 font-medium">Currently active:</span>
              <span className="font-bold text-neutral-900 dark:text-white flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block animate-pulse"></span>
                {currentCampus}
              </span>
            </div>

            <div className="p-4 max-h-[420px] overflow-y-auto space-y-2">
              {/* Option to browse All Campuses */}
              <button
                onClick={() => {
                  setCurrentCampus('All Campuses');
                  setIsCampusModalOpen(false);
                }}
                className={`w-full text-left p-3.5 rounded-2xl transition-all border flex items-start justify-between group cursor-pointer ${
                  currentCampus === 'All Campuses'
                    ? 'bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 border-neutral-900 dark:border-white shadow-sm'
                    : 'bg-white dark:bg-[#202026] hover:bg-neutral-50 dark:hover:bg-[#26262e] text-neutral-800 dark:text-neutral-200 border-neutral-200 dark:border-neutral-800'
                }`}
              >
                <div className="space-y-1 pr-3">
                  <div className="flex items-center gap-2">
                    <span className="text-base">🌐</span>
                    <span className={`text-xs sm:text-sm font-bold ${currentCampus === 'All Campuses' ? 'text-white dark:text-neutral-900' : 'text-neutral-900 dark:text-white'}`}>
                      All Campuses (Nairobi &amp; Juja Wide)
                    </span>
                    <span className={`text-[10px] px-2 py-0.2 rounded-full font-bold ${currentCampus === 'All Campuses' ? 'bg-white/20 dark:bg-neutral-900/20 text-white dark:text-neutral-900' : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-300'}`}>
                      {items.filter(i => i.isAvailable).length} items
                    </span>
                    {currentCampus === 'All Campuses' && (
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-white/20 dark:bg-neutral-900/20 font-bold text-white dark:text-neutral-900 tracking-wide uppercase">
                        Active
                      </span>
                    )}
                  </div>
                  <p className={`text-[11px] leading-relaxed ${currentCampus === 'All Campuses' ? 'text-neutral-300 dark:text-neutral-600' : 'text-neutral-500 dark:text-neutral-400'}`}>
                    Browse all curated grails across UoN, Strathmore, KU, JKUAT, USIU &amp; Daystar
                  </p>
                </div>

                <div className="shrink-0 pt-0.5">
                  {currentCampus === 'All Campuses' ? (
                    <div className="w-6 h-6 rounded-full bg-white dark:bg-neutral-900 text-neutral-900 dark:text-white flex items-center justify-center">
                      <Check className="w-3.5 h-3.5 stroke-[3]" />
                    </div>
                  ) : (
                    <div className="w-6 h-6 rounded-full border border-neutral-300 dark:border-neutral-700 group-hover:border-neutral-500 flex items-center justify-center text-transparent group-hover:text-neutral-400">
                      <Check className="w-3.5 h-3.5" />
                    </div>
                  )}
                </div>
              </button>

              {/* Individual Universities */}
              {CAMPUS_LOCATIONS.map(c => {
                const isCurrent = c.campus === currentCampus;
                const campusItemCount = items.filter(i => i.isAvailable && i.ownerCampus === c.campus).length;
                return (
                  <button
                    key={c.campus}
                    onClick={() => {
                      setCurrentCampus(c.campus);
                      setIsCampusModalOpen(false);
                    }}
                    className={`w-full text-left p-3.5 rounded-2xl transition-all border flex items-start justify-between group cursor-pointer ${
                      isCurrent
                        ? 'bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 border-neutral-900 dark:border-white shadow-sm'
                        : 'bg-white dark:bg-[#202026] hover:bg-neutral-50 dark:hover:bg-[#26262e] text-neutral-800 dark:text-neutral-200 border-neutral-200 dark:border-neutral-800'
                    }`}
                  >
                    <div className="space-y-1 pr-3">
                      <div className="flex items-center gap-2">
                        <span className="text-base">{c.emoji}</span>
                        <span className={`text-xs sm:text-sm font-bold ${isCurrent ? 'text-white dark:text-neutral-900' : 'text-neutral-900 dark:text-white'}`}>
                          {c.campus}
                        </span>
                        <span className={`text-[10px] px-2 py-0.2 rounded-full font-bold ${isCurrent ? 'bg-white/20 dark:bg-neutral-900/20 text-white dark:text-neutral-900' : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-300'}`}>
                          {campusItemCount} items
                        </span>
                        {isCurrent && (
                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-white/20 dark:bg-neutral-900/20 font-bold text-white dark:text-neutral-900 tracking-wide uppercase">
                            Active
                          </span>
                        )}
                      </div>
                      <p className={`text-[11px] leading-relaxed ${isCurrent ? 'text-neutral-300 dark:text-neutral-600' : 'text-neutral-500 dark:text-neutral-400'}`}>
                        {c.meetupSpots.length} safe meetup hubs: <span className="font-medium">{c.meetupSpots.slice(0, 2).join(' · ')}</span>
                      </p>
                    </div>

                    <div className="shrink-0 pt-0.5">
                      {isCurrent ? (
                        <div className="w-6 h-6 rounded-full bg-white dark:bg-neutral-900 text-neutral-900 dark:text-white flex items-center justify-center">
                          <Check className="w-3.5 h-3.5 stroke-[3]" />
                        </div>
                      ) : (
                        <div className="w-6 h-6 rounded-full border border-neutral-300 dark:border-neutral-700 group-hover:border-neutral-500 flex items-center justify-center text-transparent group-hover:text-neutral-400">
                          <Check className="w-3.5 h-3.5" />
                        </div>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>

            <div className="p-3.5 bg-neutral-50 dark:bg-neutral-900/60 border-t border-neutral-100 dark:border-neutral-800 text-center">
              <p className="text-[11px] text-neutral-500 dark:text-neutral-400">
                Peer exchanges happen on campus at designated landmarks with mutual fabric verification.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Floating Notifications */}
      <NotificationToast />
    </div>
  );
}

export default function App() {
  const [authState, setAuthState] = useState<'checking' | 'signed_in' | 'signed_out' | 'intro'>('checking');

  React.useEffect(() => {
    fetch('/api/auth/session')
      .then(response => setAuthState(response.ok ? 'signed_in' : 'signed_out'))
      .catch(() => setAuthState('signed_out'));
  }, []);

  if (authState === 'checking') {
    return <div className="min-h-screen bg-[#fafafa] dark:bg-[#0e0e11] flex items-center justify-center text-sm text-neutral-500">Checking your sign-in…</div>;
  }

  if (authState === 'signed_out') {
    return <PhoneLogin onAuthenticated={() => setAuthState('intro')} />;
  }

  if (authState === 'intro') return <UniThreadIntro onComplete={() => setAuthState('signed_in')} />;

  return (
    <SwapProvider>
      <MainApp onLogout={async () => {
        await fetch('/api/auth/logout', { method: 'POST' }).catch(() => undefined);
        setAuthState('signed_out');
      }} />
    </SwapProvider>
  );
}
