export type CategoryType = 
  | 'All'
  | 'Jewelry & Accessories'
  | 'Bags, Totes & Backpacks'
  | 'Outerwear & Jackets'
  | 'Tops & Hoodies'
  | 'Bottoms & Denim'
  | 'Footwear & Sneakers'
  | 'Knitwear & Sweaters'
  | 'Vintage Mitumba Grails'
  | 'Graphic Tees & Polos'
  | 'Cargos & Parachute Pants'
  | 'Boots & Loafers'
  | 'Activewear & Gym Fits'
  | 'Headwear & Beanies'
  | 'Blazers & Formal Fits'
  | 'Tracksuits & Windbreakers'
  | 'Streetwear Accessories & Belts'
  | 'Campus Event & Cultural Wear';

export type ConditionType = 
  | 'Brand New with Tags'
  | 'Like New / Flawless'
  | 'Gently Worn'
  | 'Vintage Character';

export type FabricWeight = 'Heavyweight (350+ GSM)' | 'Mid-weight (200-350 GSM)' | 'Lightweight / Breathable';

export interface UserPreferences {
  vibes: string[];
  genderStyle: 'All' | 'Unisex' | 'Menswear' | 'Womenswear';
  primaryCampus: string;
  onboardingCompleted: boolean;
}

export interface StudentUser {
  id: string;
  name: string;
  handle: string;
  avatar: string;
  campus: string;
  dorm: string;
  year: string;
  major: string;
  points: number;
  tradesCompleted: number;
  rating: number;
  reviewCount: number;
  badges: string[];
  reputationTitle: string;
  cleanlinessScore?: number;
  fabricQualityScore?: number;
  punctualityScore?: number;
  preferences?: UserPreferences;
  phoneNumber?: string;
  mpesaNumber?: string;
}

export interface ClothingItem {
  id: string;
  ownerId: string;
  ownerName: string;
  ownerAvatar: string;
  ownerCampus: string;
  ownerDorm: string;
  title: string;
  brand: string;
  category: CategoryType;
  size: string;
  condition: ConditionType;
  fabric: string;
  fabricWeight: FabricWeight;
  fabricNotes: string;
  washCare: string;
  color: string;
  images: string[];
  estMarketValue: number; // in KSh
  lookingFor: string;
  preferredMeetup: string;
  cleanlinessPledge: boolean;
  dateListed: string;
  isAvailable: boolean;
}

export type SwapStatus = 
  | 'pending'
  | 'countered'
  | 'agreed'
  | 'meetup_scheduled'
  | 'completed'
  | 'declined';

export type PaymentStatus = 
  | 'not_required'
  | 'pending_payment'
  | 'payment_sent'
  | 'payment_verified'
  | 'disputed';

export interface SwapProposal {
  id: string;
  proposerId: string;
  receiverId: string;
  offeredItemId: string;
  requestedItemId: string;
  pointsBonus: number;
  cashAmount?: number; // Optional cash/topup in KSh
  status: SwapStatus;

  // Binance P2P Escrow & M-Pesa Verification fields
  paymentRequired?: boolean;
  paymentAmount?: number; // in KSh
  paymentStatus?: PaymentStatus;
  mpesaRecipientPhone?: string;
  mpesaRecipientName?: string;
  mpesaTillNumber?: string;
  mpesaTransactionCode?: string;
  mpesaScreenshot?: string;
  paymentSentAt?: string;
  paymentVerifiedAt?: string;

  // Meetup & Date of Exchange
  exchangeDate?: string; // e.g. "2026-10-31"
  meetupLocation: string;
  meetupTime: string;
  proposerAgreedFabric: boolean;
  receiverAgreedFabric: boolean;
  proposerAgreedMeetup: boolean;
  receiverAgreedMeetup: boolean;
  meetupVerificationCode: string;
  handoverConfirmedByProposer?: boolean;
  handoverConfirmedByReceiver?: boolean;
  notes: string;
  createdAt: string;
  completedAt?: string;
  proposerRated?: boolean;
  receiverRated?: boolean;
}

export interface SwapReview {
  id: string;
  swapId: string;
  reviewerId: string;
  reviewerName: string;
  reviewerAvatar: string;
  revieweeId: string;
  rating: number; // Comprehensive score
  cleanlinessRating?: number; // 1-5 stars
  fabricQualityRating?: number; // 1-5 stars
  punctualityRating?: number; // 1-5 stars
  tags: string[];
  comment: string;
  bonusPointsAwarded: number;
  createdAt: string;
}

export interface PerkItem {
  id: string;
  title: string;
  costPoints: number;
  category: 'Listing Boost' | 'Campus Partner' | 'Eco Merch';
  description: string;
  claimed?: boolean;
}

export interface ChatMessage {
  id: string;
  senderId: string;
  receiverId: string;
  text: string;
  timestamp: string;
  relatedItemId?: string;
  attachment?: string;
  isSystemAlert?: boolean;
}
