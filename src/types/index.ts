export type CategoryType = 
  | 'All'
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
  | 'Bags, Totes & Backpacks'
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

export interface SwapProposal {
  id: string;
  proposerId: string;
  receiverId: string;
  offeredItemId: string;
  requestedItemId: string;
  pointsBonus: number;
  status: SwapStatus;
  proposerAgreedFabric: boolean;
  receiverAgreedFabric: boolean;
  proposerAgreedMeetup: boolean;
  receiverAgreedMeetup: boolean;
  meetupLocation: string;
  meetupTime: string;
  meetupVerificationCode: string;
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
  rating: number;
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
