import React, { createContext, useContext, useState, useEffect } from 'react';
import { StudentUser, ClothingItem, SwapProposal, SwapReview, PerkItem } from '../types';
import { MOCK_STUDENTS, MOCK_ITEMS, MOCK_SWAPS, MOCK_REVIEWS, MOCK_PERKS, CAMPUS_LOCATIONS } from '../data/mockData';

interface SwapContextType {
  currentUser: StudentUser;
  allStudents: StudentUser[];
  currentCampus: string;
  items: ClothingItem[];
  swaps: SwapProposal[];
  reviews: SwapReview[];
  perks: PerkItem[];
  notification: { message: string; type: 'success' | 'info' | 'points' } | null;
  setCurrentCampus: (campus: string) => void;
  switchUser: (userId: string) => void;
  addItem: (item: Omit<ClothingItem, 'id' | 'ownerId' | 'ownerName' | 'ownerAvatar' | 'ownerCampus' | 'ownerDorm' | 'dateListed' | 'isAvailable'>) => void;
  proposeSwap: (params: {
    receiverId: string;
    offeredItemId: string;
    requestedItemId: string;
    pointsBonus: number;
    meetupLocation: string;
    meetupTime: string;
    notes: string;
    agreedFabric: boolean;
  }) => SwapProposal;
  agreeFabric: (swapId: string, isProposer: boolean) => void;
  agreeMeetup: (swapId: string, isProposer: boolean, location?: string, time?: string) => void;
  acceptSwap: (swapId: string) => void;
  declineSwap: (swapId: string) => void;
  completeSwap: (swapId: string) => void;
  submitReview: (swapId: string, params: {
    rating: number;
    tags: string[];
    comment: string;
  }) => void;
  claimPerk: (perkId: string) => boolean;
  resetDemoData: () => void;
  dismissNotification: () => void;
  theme: 'light' | 'dark';
  toggleTheme: () => void;
}

const SwapContext = createContext<SwapContextType | undefined>(undefined);

export const SwapProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [allStudents, setAllStudents] = useState<StudentUser[]>(() => {
    const saved = localStorage.getItem('unithread_students');
    return saved ? JSON.parse(saved) : MOCK_STUDENTS;
  });

  const [currentUserId, setCurrentUserId] = useState<string>(() => {
    const saved = localStorage.getItem('unithread_current_user_id');
    return saved || 'user-amani';
  });

  const [currentCampus, setCurrentCampus] = useState<string>(() => {
    const saved = localStorage.getItem('unithread_current_campus');
    return saved || 'University of Nairobi (UoN Main)';
  });

  const [items, setItems] = useState<ClothingItem[]>(() => {
    const saved = localStorage.getItem('unithread_items');
    return saved ? JSON.parse(saved) : MOCK_ITEMS;
  });

  const [swaps, setSwaps] = useState<SwapProposal[]>(() => {
    const saved = localStorage.getItem('unithread_swaps');
    return saved ? JSON.parse(saved) : MOCK_SWAPS;
  });

  const [reviews, setReviews] = useState<SwapReview[]>(() => {
    const saved = localStorage.getItem('unithread_reviews');
    return saved ? JSON.parse(saved) : MOCK_REVIEWS;
  });

  const [perks, setPerks] = useState<PerkItem[]>(() => {
    const saved = localStorage.getItem('unithread_perks');
    return saved ? JSON.parse(saved) : MOCK_PERKS;
  });

  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    const saved = localStorage.getItem('unithread_theme');
    if (saved === 'dark' || saved === 'light') return saved;
    return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  });

  const [notification, setNotification] = useState<{ message: string; type: 'success' | 'info' | 'points' } | null>(null);

  // Sync theme to localStorage and document.documentElement class
  useEffect(() => {
    localStorage.setItem('unithread_theme', theme);
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => (prev === 'dark' ? 'light' : 'dark'));
  };

  // Sync to localStorage
  useEffect(() => {
    localStorage.setItem('unithread_students', JSON.stringify(allStudents));
  }, [allStudents]);

  useEffect(() => {
    localStorage.setItem('unithread_current_user_id', currentUserId);
  }, [currentUserId]);

  useEffect(() => {
    localStorage.setItem('unithread_current_campus', currentCampus);
  }, [currentCampus]);

  useEffect(() => {
    localStorage.setItem('unithread_items', JSON.stringify(items));
  }, [items]);

  useEffect(() => {
    localStorage.setItem('unithread_swaps', JSON.stringify(swaps));
  }, [swaps]);

  useEffect(() => {
    localStorage.setItem('unithread_reviews', JSON.stringify(reviews));
  }, [reviews]);

  useEffect(() => {
    localStorage.setItem('unithread_perks', JSON.stringify(perks));
  }, [perks]);

  const currentUser = allStudents.find(s => s.id === currentUserId) || allStudents[0];

  const showNotification = (message: string, type: 'success' | 'info' | 'points' = 'info') => {
    setNotification({ message, type });
    setTimeout(() => {
      setNotification(prev => (prev?.message === message ? null : prev));
    }, 4500);
  };

  const dismissNotification = () => setNotification(null);

  const switchUser = (userId: string) => {
    setCurrentUserId(userId);
    const target = allStudents.find(s => s.id === userId);
    if (target) {
      showNotification(`Switched profile to ${target.name} (${target.points} pts)`, 'info');
    }
  };

  // Add new garment or shoe to closet
  const addItem = (itemData: Omit<ClothingItem, 'id' | 'ownerId' | 'ownerName' | 'ownerAvatar' | 'ownerCampus' | 'ownerDorm' | 'dateListed' | 'isAvailable'>) => {
    const newItem: ClothingItem = {
      ...itemData,
      id: `item-${Date.now()}`,
      ownerId: currentUser.id,
      ownerName: currentUser.name,
      ownerAvatar: currentUser.avatar,
      ownerCampus: currentUser.campus,
      ownerDorm: currentUser.dorm,
      dateListed: 'Just now',
      isAvailable: true
    };

    setItems(prev => [newItem, ...prev]);
    // Reward points for listing quality wardrobe
    setAllStudents(prev => prev.map(s => {
      if (s.id === currentUser.id) {
        return { ...s, points: s.points + 10 };
      }
      return s;
    }));

    showNotification(`Listed "${newItem.title}" to Campus Rack! +10 Points Earned!`, 'points');
  };

  // Propose a swap
  const proposeSwap = (params: {
    receiverId: string;
    offeredItemId: string;
    requestedItemId: string;
    pointsBonus: number;
    meetupLocation: string;
    meetupTime: string;
    notes: string;
    agreedFabric: boolean;
  }) => {
    const code = `UNISWAP-${Math.floor(1000 + Math.random() * 9000)}`;
    const newSwap: SwapProposal = {
      id: `swap-${Date.now()}`,
      proposerId: currentUser.id,
      receiverId: params.receiverId,
      offeredItemId: params.offeredItemId,
      requestedItemId: params.requestedItemId,
      pointsBonus: params.pointsBonus,
      status: 'pending',
      proposerAgreedFabric: params.agreedFabric,
      receiverAgreedFabric: false,
      proposerAgreedMeetup: true,
      receiverAgreedMeetup: false,
      meetupLocation: params.meetupLocation,
      meetupTime: params.meetupTime,
      meetupVerificationCode: code,
      notes: params.notes,
      createdAt: 'Just now'
    };

    setSwaps(prev => [newSwap, ...prev]);
    showNotification(`Swap proposed to @${params.receiverId}! Waiting for both to agree on fabric & meetup.`, 'success');
    return newSwap;
  };

  // Agree on Fabric Quality
  const agreeFabric = (swapId: string, isProposer: boolean) => {
    setSwaps(prev => prev.map(s => {
      if (s.id === swapId) {
        const updated = {
          ...s,
          proposerAgreedFabric: isProposer ? true : s.proposerAgreedFabric,
          receiverAgreedFabric: !isProposer ? true : s.receiverAgreedFabric,
        };
        // Check if both agreed on fabric & meetup
        if (updated.proposerAgreedFabric && updated.receiverAgreedFabric && updated.proposerAgreedMeetup && updated.receiverAgreedMeetup) {
          updated.status = 'meetup_scheduled';
        }
        return updated;
      }
      return s;
    }));
    showNotification('Fabric quality and wear inspection agreed!', 'info');
  };

  // Agree on Meetup Spot & Time
  const agreeMeetup = (swapId: string, isProposer: boolean, location?: string, time?: string) => {
    setSwaps(prev => prev.map(s => {
      if (s.id === swapId) {
        const updated = {
          ...s,
          meetupLocation: location || s.meetupLocation,
          meetupTime: time || s.meetupTime,
          proposerAgreedMeetup: isProposer ? true : s.proposerAgreedMeetup,
          receiverAgreedMeetup: !isProposer ? true : s.receiverAgreedMeetup,
        };
        if (updated.proposerAgreedFabric && updated.receiverAgreedFabric && updated.proposerAgreedMeetup && updated.receiverAgreedMeetup) {
          updated.status = 'meetup_scheduled';
        }
        return updated;
      }
      return s;
    }));
    showNotification('Campus meetup location & time agreed!', 'info');
  };

  // Accept a proposal
  const acceptSwap = (swapId: string) => {
    setSwaps(prev => prev.map(s => {
      if (s.id === swapId) {
        return {
          ...s,
          receiverAgreedFabric: true,
          receiverAgreedMeetup: true,
          status: 'meetup_scheduled'
        };
      }
      return s;
    }));
    showNotification('Exchange accepted! Both agreed on fabric & meetup spot. Meetup Pass generated.', 'success');
  };

  // Decline proposal
  const declineSwap = (swapId: string) => {
    setSwaps(prev => prev.map(s => (s.id === swapId ? { ...s, status: 'declined' } : s)));
    showNotification('Exchange proposal declined.', 'info');
  };

  // Mark swap complete (in-person meetup finished)
  const completeSwap = (swapId: string) => {
    const targetSwap = swaps.find(s => s.id === swapId);
    if (!targetSwap) return;

    setSwaps(prev => prev.map(s => {
      if (s.id === swapId) {
        return {
          ...s,
          status: 'completed',
          completedAt: 'Just now'
        };
      }
      return s;
    }));

    // Award +50 base virtual points to both parties for cycling wardrobes!
    // Also transfer pointsBonus from proposer to receiver
    setAllStudents(prev => prev.map(s => {
      if (s.id === targetSwap.proposerId) {
        return {
          ...s,
          points: s.points + 50 - targetSwap.pointsBonus,
          tradesCompleted: s.tradesCompleted + 1
        };
      }
      if (s.id === targetSwap.receiverId) {
        return {
          ...s,
          points: s.points + 50 + targetSwap.pointsBonus,
          tradesCompleted: s.tradesCompleted + 1
        };
      }
      return s;
    }));

    showNotification('🎉 Exchange completed! +50 Virtual Exchange Points awarded to both students!', 'points');
  };

  // Rate exchange and provide recommendation -> upgrades virtual exchange points!
  const submitReview = (swapId: string, params: {
    rating: number;
    tags: string[];
    comment: string;
  }) => {
    const targetSwap = swaps.find(s => s.id === swapId);
    if (!targetSwap) return;

    const isProposer = currentUser.id === targetSwap.proposerId;
    const revieweeId = isProposer ? targetSwap.receiverId : targetSwap.proposerId;

    // Calculate recommendation bonus points based on rating
    let bonusPoints = 0;
    if (params.rating >= 4.5) {
      bonusPoints = 35; // Great recommendation bonus
    } else if (params.rating >= 4.0) {
      bonusPoints = 20; // Good recommendation bonus
    }

    const newReview: SwapReview = {
      id: `rev-${Date.now()}`,
      swapId,
      reviewerId: currentUser.id,
      reviewerName: currentUser.name,
      reviewerAvatar: currentUser.avatar,
      revieweeId,
      rating: params.rating,
      tags: params.tags,
      comment: params.comment,
      bonusPointsAwarded: bonusPoints,
      createdAt: 'Just now'
    };

    setReviews(prev => [newReview, ...prev]);

    // Update swap state for rating flag
    setSwaps(prev => prev.map(s => {
      if (s.id === swapId) {
        return {
          ...s,
          proposerRated: isProposer ? true : s.proposerRated,
          receiverRated: !isProposer ? true : s.receiverRated
        };
      }
      return s;
    }));

    // Upgrade the reviewee's points & reputation!
    setAllStudents(prev => prev.map(s => {
      if (s.id === revieweeId) {
        const newReviewCount = s.reviewCount + 1;
        const newRating = Number(((s.rating * s.reviewCount + params.rating) / newReviewCount).toFixed(2));
        const newPoints = s.points + bonusPoints;
        
        let newTitle = s.reputationTitle;
        if (newPoints >= 350) newTitle = 'VIP Wardrobe Master';
        else if (newPoints >= 220) newTitle = 'Campus Trendsetter';
        else if (newPoints >= 150) newTitle = 'Eco Stylist';

        return {
          ...s,
          rating: newRating,
          reviewCount: newReviewCount,
          points: newPoints,
          reputationTitle: newTitle
        };
      }
      return s;
    }));

    showNotification(
      `Recommendation submitted! ${bonusPoints > 0 ? `🌟 Upgraded peer with +${bonusPoints} bonus points!` : ''}`,
      'points'
    );
  };

  // Claim perks using points
  const claimPerk = (perkId: string): boolean => {
    const perk = perks.find(p => p.id === perkId);
    if (!perk) return false;

    if (currentUser.points < perk.costPoints) {
      showNotification(`Insufficient points! You need ${perk.costPoints} pts (you have ${currentUser.points} pts).`, 'info');
      return false;
    }

    // Deduct points
    setAllStudents(prev => prev.map(s => {
      if (s.id === currentUser.id) {
        return { ...s, points: s.points - perk.costPoints };
      }
      return s;
    }));

    setPerks(prev => prev.map(p => (p.id === perkId ? { ...p, claimed: true } : p)));
    showNotification(`Redeemed "${perk.title}"! Voucher activated in your student pass.`, 'success');
    return true;
  };

  const resetDemoData = () => {
    localStorage.clear();
    setAllStudents(MOCK_STUDENTS);
    setCurrentUserId('user-amani');
    setCurrentCampus('University of Nairobi (UoN Main)');
    setItems(MOCK_ITEMS);
    setSwaps(MOCK_SWAPS);
    setReviews(MOCK_REVIEWS);
    setPerks(MOCK_PERKS);
    showNotification('Reset community to fresh Kenyan campus demo state.', 'info');
  };

  return (
    <SwapContext.Provider
      value={{
        currentUser,
        allStudents,
        currentCampus,
        items,
        swaps,
        reviews,
        perks,
        notification,
        setCurrentCampus,
        switchUser,
        addItem,
        proposeSwap,
        agreeFabric,
        agreeMeetup,
        acceptSwap,
        declineSwap,
        completeSwap,
        submitReview,
        claimPerk,
        resetDemoData,
        dismissNotification,
        theme,
        toggleTheme
      }}
    >
      {children}
    </SwapContext.Provider>
  );
};

export const useSwap = () => {
  const context = useContext(SwapContext);
  if (!context) throw new Error('useSwap must be used within SwapProvider');
  return context;
};
