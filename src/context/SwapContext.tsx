import React, { createContext, useContext, useState, useEffect } from 'react';
import { StudentUser, ClothingItem, SwapProposal, SwapReview, PerkItem, UserPreferences, ChatMessage } from '../types';
import { MOCK_STUDENTS, MOCK_ITEMS, MOCK_SWAPS, MOCK_REVIEWS, MOCK_PERKS, CAMPUS_LOCATIONS, INITIAL_CHAT_MESSAGES } from '../data/mockData';

interface SwapContextType {
  currentUser: StudentUser;
  allStudents: StudentUser[];
  currentCampus: string;
  items: ClothingItem[];
  swaps: SwapProposal[];
  reviews: SwapReview[];
  perks: PerkItem[];
  userPreferences: UserPreferences;
  isPreferencesModalOpen: boolean;
  setIsPreferencesModalOpen: (open: boolean) => void;
  savePreferences: (prefs: UserPreferences) => void;
  messages: ChatMessage[];
  isChatOpen: boolean;
  activeChatPeerId: string | null;
  activeChatItemId: string | null;
  openChat: (peerId?: string, relatedItemId?: string) => void;
  closeChat: () => void;
  sendMessage: (receiverId: string, text: string, relatedItemId?: string, attachment?: string) => void;
  unreadChatCount: number;
  notification: { message: string; type: 'success' | 'info' | 'points' } | null;
  setCurrentCampus: (campus: string) => void;
  switchUser: (userId: string) => void;
  addItem: (item: Omit<ClothingItem, 'id' | 'ownerId' | 'ownerName' | 'ownerAvatar' | 'ownerCampus' | 'ownerDorm' | 'dateListed' | 'isAvailable'>) => void;
  proposeSwap: (params: {
    receiverId: string;
    offeredItemId: string;
    requestedItemId: string;
    pointsBonus: number;
    cashAmount?: number;
    meetupLocation: string;
    meetupTime: string;
    exchangeDate?: string;
    notes: string;
    agreedFabric: boolean;
  }) => SwapProposal;
  agreeFabric: (swapId: string, isProposer: boolean) => void;
  agreeMeetup: (swapId: string, isProposer: boolean, location?: string, time?: string, date?: string) => void;
  acceptSwap: (swapId: string) => void;
  declineSwap: (swapId: string) => void;
  submitMpesaPayment: (swapId: string, data: { mpesaCode: string; screenshotUrl: string; amount: number }) => void;
  verifyMpesaPayment: (swapId: string) => void;
  scheduleExchange: (swapId: string, data: { exchangeDate: string; meetupTime: string; meetupLocation: string }) => void;
  confirmHandover: (swapId: string, isProposer: boolean) => void;
  completeSwap: (swapId: string) => void;
  submitReview: (swapId: string, params: {
    rating: number;
    cleanlinessRating: number;
    fabricQualityRating: number;
    punctualityRating: number;
    tags: string[];
    comment: string;
  }) => void;
  claimPerk: (perkId: string) => boolean;
  resetDemoData: () => void;
  dismissNotification: () => void;
  theme: 'light' | 'dark';
  toggleTheme: () => void;
}

const DEFAULT_PREFERENCES: UserPreferences = {
  vibes: [],
  genderStyle: 'All',
  primaryCampus: 'University of Nairobi (UoN Main)',
  onboardingCompleted: false
};

const SwapContext = createContext<SwapContextType | undefined>(undefined);

export const SwapProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Load and migrate students with authentic Kenyan photos & scores
  const [allStudents, setAllStudents] = useState<StudentUser[]>(() => {
    const saved = localStorage.getItem('unithread_students_v5');
    if (!saved) return MOCK_STUDENTS;
    try {
      const parsed: StudentUser[] = JSON.parse(saved);
      // Ensure avatars and Kenyan details are synchronized with real photography
      return MOCK_STUDENTS.map(mockStudent => {
        const savedStudent = parsed.find(s => s.id === mockStudent.id);
        if (!savedStudent) return mockStudent;
        return {
          ...savedStudent,
          avatar: mockStudent.avatar, // Always ensure high-res Kenyan photography
          name: mockStudent.name,
          campus: mockStudent.campus,
          dorm: mockStudent.dorm,
          major: mockStudent.major,
          year: mockStudent.year,
          cleanlinessScore: savedStudent.cleanlinessScore || mockStudent.cleanlinessScore || 4.95,
          fabricQualityScore: savedStudent.fabricQualityScore || mockStudent.fabricQualityScore || 4.92,
          punctualityScore: savedStudent.punctualityScore || mockStudent.punctualityScore || 4.95,
          phoneNumber: savedStudent.phoneNumber || mockStudent.phoneNumber,
          mpesaNumber: savedStudent.mpesaNumber || mockStudent.mpesaNumber,
        };
      }).concat(parsed.filter(p => !MOCK_STUDENTS.some(m => m.id === p.id)));
    } catch {
      return MOCK_STUDENTS;
    }
  });

  const [currentUserId, setCurrentUserId] = useState<string>(() => {
    const saved = localStorage.getItem('unithread_current_user_id');
    return saved || 'user-amani';
  });

  const [currentCampus, setCurrentCampus] = useState<string>(() => {
    const saved = localStorage.getItem('unithread_current_campus');
    return saved || 'All Campuses';
  });

  // User Preferences (TikTok style)
  const [userPreferences, setUserPreferences] = useState<UserPreferences>(() => {
    const saved = localStorage.getItem('unithread_user_preferences');
    if (!saved) return DEFAULT_PREFERENCES;
    try {
      const parsed = JSON.parse(saved) as Partial<UserPreferences>;
      return { ...DEFAULT_PREFERENCES, ...parsed, vibes: Array.isArray(parsed.vibes) ? parsed.vibes : [] };
    } catch {
      return DEFAULT_PREFERENCES;
    }
  });

  const [isPreferencesModalOpen, setIsPreferencesModalOpen] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem('unithread_user_preferences');
      return !saved || !JSON.parse(saved).onboardingCompleted;
    } catch {
      return true;
    }
  });

  // Items - ensures local photos and photography are loaded for all 6 universities
  const [items, setItems] = useState<ClothingItem[]>(() => {
    const saved = localStorage.getItem('unithread_items_v7');
    if (!saved) {
      try {
        localStorage.removeItem('unithread_items_v6');
        localStorage.removeItem('unithread_items_v5');
        localStorage.removeItem('unithread_items_v4');
        localStorage.removeItem('unithread_items');
      } catch {}
      return MOCK_ITEMS;
    }
    try {
      const parsed: ClothingItem[] = JSON.parse(saved);
      // Ensure all 30 mock items are up-to-date with their photography and university mapping
      const updatedMockItems = MOCK_ITEMS.map(mockItem => {
        const savedItem = parsed.find(item => item.id === mockItem.id);
        if (!savedItem) return mockItem;
        return {
          ...mockItem,
          images: mockItem.images, // Always sync the latest priority images
          isAvailable: savedItem.isAvailable !== undefined ? savedItem.isAvailable : true,
          estMarketValue: savedItem.estMarketValue || mockItem.estMarketValue
        };
      });
      // Plus any custom items added by the student
      const customItems = parsed.filter(item => !MOCK_ITEMS.some(m => m.id === item.id));
      return [...updatedMockItems, ...customItems];
    } catch {
      return MOCK_ITEMS;
    }
  });

  const [swaps, setSwaps] = useState<SwapProposal[]>(() => {
    const saved = localStorage.getItem('unithread_swaps');
    if (!saved) return MOCK_SWAPS;
    try {
      const parsed: SwapProposal[] = JSON.parse(saved);
      // Ensure Binance P2P swap-102 demo is present
      if (!parsed.some(s => s.id === 'swap-102')) {
        const demo102 = MOCK_SWAPS.find(s => s.id === 'swap-102');
        if (demo102) parsed.unshift(demo102);
      }
      return parsed;
    } catch {
      return MOCK_SWAPS;
    }
  });

  const [reviews, setReviews] = useState<SwapReview[]>(() => {
    const saved = localStorage.getItem('unithread_reviews');
    if (!saved) return MOCK_REVIEWS;
    try {
      return (JSON.parse(saved) as SwapReview[]).map(review => {
        const student = MOCK_STUDENTS.find(candidate => candidate.id === review.reviewerId);
        return student ? { ...review, reviewerAvatar: student.avatar } : review;
      });
    } catch {
      return MOCK_REVIEWS;
    }
  });

  const [perks, setPerks] = useState<PerkItem[]>(() => {
    const saved = localStorage.getItem('unithread_perks');
    return saved ? JSON.parse(saved) : MOCK_PERKS;
  });

  // Chatroom State
  const [messages, setMessages] = useState<ChatMessage[]>(() => {
    const saved = localStorage.getItem('unithread_chat_messages');
    return saved ? JSON.parse(saved) : INITIAL_CHAT_MESSAGES;
  });
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [activeChatPeerId, setActiveChatPeerId] = useState<string | null>('user-brian');
  const [activeChatItemId, setActiveChatItemId] = useState<string | null>(null);

  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    const saved = localStorage.getItem('unithread_theme');
    if (saved === 'dark' || saved === 'light') return saved;
    return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  });

  const [notification, setNotification] = useState<{ message: string; type: 'success' | 'info' | 'points' } | null>(null);

  // Sync theme
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

  // Sync localStorage
  useEffect(() => {
    localStorage.setItem('unithread_students_v5', JSON.stringify(allStudents));
  }, [allStudents]);

  useEffect(() => {
    localStorage.setItem('unithread_current_user_id', currentUserId);
  }, [currentUserId]);

  useEffect(() => {
    localStorage.setItem('unithread_current_campus', currentCampus);
  }, [currentCampus]);

  useEffect(() => {
    localStorage.setItem('unithread_items_v7', JSON.stringify(items));
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

  useEffect(() => {
    localStorage.setItem('unithread_user_preferences', JSON.stringify(userPreferences));
  }, [userPreferences]);

  useEffect(() => {
    localStorage.setItem('unithread_chat_messages', JSON.stringify(messages));
  }, [messages]);

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

  // Save Preferences
  const savePreferences = (prefs: UserPreferences) => {
    setUserPreferences(prefs);
    if (prefs.primaryCampus && prefs.primaryCampus !== currentCampus) {
      setCurrentCampus(prefs.primaryCampus);
    }
    showNotification('Saved your campus style vibes & preferences!', 'success');
  };

  // Add Item to closet
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

  // Chatroom methods
  const openChat = (peerId?: string, relatedItemId?: string) => {
    if (peerId) setActiveChatPeerId(peerId);
    if (relatedItemId) setActiveChatItemId(relatedItemId);
    setIsChatOpen(true);
  };

  const closeChat = () => {
    setIsChatOpen(false);
  };

  const sendMessage = (receiverId: string, text: string, relatedItemId?: string, attachment?: string) => {
    if (!text.trim() && !attachment) return;
    const now = new Date();
    const timeString = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    const newMsg: ChatMessage = {
      id: `msg-${Date.now()}`,
      senderId: currentUser.id,
      receiverId,
      text: text.trim(),
      timestamp: timeString,
      relatedItemId: relatedItemId || activeChatItemId || undefined,
      attachment
    };

    setMessages(prev => [...prev, newMsg]);

    // Optional simulated peer reply for smooth interactive demonstration
    const targetPeer = allStudents.find(s => s.id === receiverId);
    if (targetPeer) {
      setTimeout(() => {
        const replyText = text.toLowerCase().includes('mpesa') || text.toLowerCase().includes('pay')
          ? `Nimeona! Let me check the M-Pesa balance on my phone and approve it on UniThreads right away.`
          : text.toLowerCase().includes('meet') || text.toLowerCase().includes('time')
          ? `Sawa! Sounds good. Let's meet at ${targetPeer.campus.split(' ')[0]} campus on the scheduled exchange date!`
          : `Habari ${currentUser.name.split(' ')[0]}! Got your message about the swap. Looking forward to our exchange!`;

        const replyMsg: ChatMessage = {
          id: `msg-${Date.now() + 1}`,
          senderId: receiverId,
          receiverId: currentUser.id,
          text: replyText,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          relatedItemId: relatedItemId || activeChatItemId || undefined
        };
        setMessages(prev => [...prev, replyMsg]);
      }, 1400);
    }
  };

  const unreadChatCount = messages.filter(m => m.receiverId === currentUser.id && m.senderId !== currentUser.id).length;

  // Propose Swap
  const proposeSwap = (params: {
    receiverId: string;
    offeredItemId: string;
    requestedItemId: string;
    pointsBonus: number;
    cashAmount?: number;
    meetupLocation: string;
    meetupTime: string;
    exchangeDate?: string;
    notes: string;
    agreedFabric: boolean;
  }) => {
    const code = `UNISWAP-${Math.floor(1000 + Math.random() * 9000)}`;
    const receiver = allStudents.find(s => s.id === params.receiverId);
    const hasCash = (params.cashAmount || 0) > 0;

    const newSwap: SwapProposal = {
      id: `swap-${Date.now()}`,
      proposerId: currentUser.id,
      receiverId: params.receiverId,
      offeredItemId: params.offeredItemId,
      requestedItemId: params.requestedItemId,
      pointsBonus: params.pointsBonus,
      cashAmount: params.cashAmount || 0,
      status: 'pending',
      paymentRequired: hasCash,
      paymentAmount: params.cashAmount,
      paymentStatus: hasCash ? 'pending_payment' : 'not_required',
      mpesaRecipientPhone: receiver?.mpesaNumber || receiver?.phoneNumber || '0722 000 000',
      mpesaRecipientName: receiver?.name,
      proposerAgreedFabric: params.agreedFabric,
      receiverAgreedFabric: false,
      proposerAgreedMeetup: true,
      receiverAgreedMeetup: false,
      meetupLocation: params.meetupLocation,
      meetupTime: params.meetupTime,
      exchangeDate: params.exchangeDate || '2026-10-31',
      meetupVerificationCode: code,
      notes: params.notes,
      createdAt: 'Just now'
    };

    setSwaps(prev => [newSwap, ...prev]);
    showNotification(`Swap proposed to ${receiver?.name || 'peer'}! Waiting for fabric agreement & Binance-style verification.`, 'success');
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
        if (updated.proposerAgreedFabric && updated.receiverAgreedFabric && updated.proposerAgreedMeetup && updated.receiverAgreedMeetup) {
          updated.status = 'meetup_scheduled';
        }
        return updated;
      }
      return s;
    }));
    showNotification('Fabric quality & clean condition agreed by both students!', 'info');
  };

  // Agree on Meetup Spot & Time
  const agreeMeetup = (swapId: string, isProposer: boolean, location?: string, time?: string, date?: string) => {
    setSwaps(prev => prev.map(s => {
      if (s.id === swapId) {
        const updated = {
          ...s,
          meetupLocation: location || s.meetupLocation,
          meetupTime: time || s.meetupTime,
          exchangeDate: date || s.exchangeDate,
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
    showNotification('Campus meetup location & exchange date agreed!', 'info');
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
    showNotification('Exchange accepted! Ready for M-Pesa verification & physical campus handover.', 'success');
  };

  // Decline proposal
  const declineSwap = (swapId: string) => {
    setSwaps(prev => prev.map(s => (s.id === swapId ? { ...s, status: 'declined' } : s)));
    showNotification('Exchange proposal declined.', 'info');
  };

  // Binance P2P: Submit M-Pesa Payment with Screenshot Proof
  const submitMpesaPayment = (swapId: string, data: { mpesaCode: string; screenshotUrl: string; amount: number }) => {
    setSwaps(prev => prev.map(s => {
      if (s.id === swapId) {
        return {
          ...s,
          paymentStatus: 'payment_sent',
          mpesaTransactionCode: data.mpesaCode,
          mpesaScreenshot: data.screenshotUrl,
          paymentAmount: data.amount,
          paymentSentAt: 'Just now'
        };
      }
      return s;
    }));

    showNotification('📸 M-Pesa payment screenshot & code submitted! Notified seller to verify.', 'success');

    // Also add automated system message in chat
    const targetSwap = swaps.find(s => s.id === swapId);
    if (targetSwap) {
      sendMessage(
        targetSwap.receiverId === currentUser.id ? targetSwap.proposerId : targetSwap.receiverId,
        `✅ I have sent the M-Pesa payment of KSh ${data.amount}. Transaction Code: ${data.mpesaCode}. Screenshot uploaded for verification!`,
        targetSwap.requestedItemId,
        data.screenshotUrl
      );
    }
  };

  // Binance P2P: Seller verifies M-Pesa funds and confirms item release
  const verifyMpesaPayment = (swapId: string) => {
    const targetSwap = swaps.find(s => s.id === swapId);
    if (!targetSwap || targetSwap.receiverId !== currentUser.id || targetSwap.paymentStatus !== 'payment_sent' || !targetSwap.mpesaScreenshot || !targetSwap.mpesaTransactionCode) {
      showNotification('Only the seller can verify a submitted payment proof.', 'info');
      return;
    }
    setSwaps(prev => prev.map(s => {
      if (s.id === swapId) {
        return {
          ...s,
          paymentStatus: 'payment_verified',
          paymentVerifiedAt: 'Just now',
          status: 'meetup_scheduled'
        };
      }
      return s;
    }));

    showNotification('🔒 M-Pesa payment verified! Item is locked for scheduled campus handover.', 'success');
  };

  // Schedule Exchange Date & Location
  const scheduleExchange = (swapId: string, data: { exchangeDate: string; meetupTime: string; meetupLocation: string }) => {
    setSwaps(prev => prev.map(s => {
      if (s.id === swapId) {
        return {
          ...s,
          exchangeDate: data.exchangeDate,
          meetupTime: data.meetupTime,
          meetupLocation: data.meetupLocation,
          status: 'meetup_scheduled'
        };
      }
      return s;
    }));

    showNotification(`📅 Exchange scheduled for ${data.exchangeDate} at ${data.meetupLocation}!`, 'success');
  };

  // Confirm Physical Handover at Campus Meetup
  const confirmHandover = (swapId: string, isProposer: boolean) => {
    const targetSwap = swaps.find(s => s.id === swapId);
    if (!targetSwap) return;
    if (targetSwap.paymentRequired && targetSwap.paymentStatus !== 'payment_verified') {
      showNotification('Seller verification is required before handover can be confirmed.', 'info');
      return;
    }
    if ((isProposer && targetSwap.proposerId !== currentUser.id) || (!isProposer && targetSwap.receiverId !== currentUser.id)) {
      showNotification('You can only confirm your own side of the handover.', 'info');
      return;
    }

    let willComplete = false;

    setSwaps(prev => prev.map(s => {
      if (s.id === swapId) {
        const updated = {
          ...s,
          handoverConfirmedByProposer: isProposer ? true : s.handoverConfirmedByProposer,
          handoverConfirmedByReceiver: !isProposer ? true : s.handoverConfirmedByReceiver,
        };

        if (updated.handoverConfirmedByProposer && updated.handoverConfirmedByReceiver) {
          updated.status = 'completed';
          updated.completedAt = 'Just now';
          willComplete = true;
        }
        return updated;
      }
      return s;
    }));

    if (willComplete) {
      completeSwap(swapId);
    } else {
      showNotification('Handover confirmed on your side! Waiting for peer confirmation.', 'info');
    }
  };

  // Mark swap complete
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

    // Award +50 base virtual points to both parties
    setAllStudents(prev => prev.map(s => {
      if (s.id === targetSwap.proposerId) {
        return {
          ...s,
          points: s.points + 50 - (targetSwap.pointsBonus || 0),
          tradesCompleted: s.tradesCompleted + 1
        };
      }
      if (s.id === targetSwap.receiverId) {
        return {
          ...s,
          points: s.points + 50 + (targetSwap.pointsBonus || 0),
          tradesCompleted: s.tradesCompleted + 1
        };
      }
      return s;
    }));

    showNotification('🎉 Exchange completed! +50 Virtual Exchange Points awarded to both students!', 'points');
  };

  // Submit Review with Comprehensive Cleanliness, Fabric Quality & Punctuality Rating
  const submitReview = (swapId: string, params: {
    rating: number;
    cleanlinessRating: number;
    fabricQualityRating: number;
    punctualityRating: number;
    tags: string[];
    comment: string;
  }) => {
    const targetSwap = swaps.find(s => s.id === swapId);
    if (!targetSwap) return;

    const isProposer = currentUser.id === targetSwap.proposerId;
    const revieweeId = isProposer ? targetSwap.receiverId : targetSwap.proposerId;

    // Calculate comprehensive rating: 40% Cleanliness + 45% Fabric Quality + 15% Punctuality
    const compScore = Number((
      params.cleanlinessRating * 0.40 +
      params.fabricQualityRating * 0.45 +
      params.punctualityRating * 0.15
    ).toFixed(2));

    let bonusPoints = 0;
    if (compScore >= 4.7) bonusPoints = 40;
    else if (compScore >= 4.3) bonusPoints = 25;
    else if (compScore >= 4.0) bonusPoints = 15;

    const newReview: SwapReview = {
      id: `rev-${Date.now()}`,
      swapId,
      reviewerId: currentUser.id,
      reviewerName: currentUser.name,
      reviewerAvatar: currentUser.avatar,
      revieweeId,
      rating: compScore,
      cleanlinessRating: params.cleanlinessRating,
      fabricQualityRating: params.fabricQualityRating,
      punctualityRating: params.punctualityRating,
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

    // Upgrade reviewee's points & reputation
    setAllStudents(prev => prev.map(s => {
      if (s.id === revieweeId) {
        const newReviewCount = s.reviewCount + 1;
        const newOverallRating = Number(((s.rating * s.reviewCount + compScore) / newReviewCount).toFixed(2));
        const newCleanliness = Number((((s.cleanlinessScore || 4.9) * s.reviewCount + params.cleanlinessRating) / newReviewCount).toFixed(2));
        const newFabric = Number((((s.fabricQualityScore || 4.9) * s.reviewCount + params.fabricQualityRating) / newReviewCount).toFixed(2));
        const newPunctuality = Number((((s.punctualityScore || 5.0) * s.reviewCount + params.punctualityRating) / newReviewCount).toFixed(2));
        const newPoints = s.points + bonusPoints;

        const updatedBadges = [...s.badges];
        if (params.cleanlinessRating >= 4.8 && !updatedBadges.includes('Spotless Laundry Certified')) {
          updatedBadges.push('Spotless Laundry Certified');
        }
        if (params.fabricQualityRating >= 4.8 && !updatedBadges.includes('Top Fabric Grader')) {
          updatedBadges.push('Top Fabric Grader');
        }

        let newTitle = s.reputationTitle;
        if (newPoints >= 350) newTitle = 'VIP Wardrobe Master';
        else if (newPoints >= 220) newTitle = 'Campus Trendsetter';
        else if (newPoints >= 150) newTitle = 'Eco Stylist';

        return {
          ...s,
          rating: newOverallRating,
          cleanlinessScore: newCleanliness,
          fabricQualityScore: newFabric,
          punctualityScore: newPunctuality,
          reviewCount: newReviewCount,
          points: newPoints,
          badges: updatedBadges,
          reputationTitle: newTitle
        };
      }
      return s;
    }));

    showNotification(
      `Comprehensive rating submitted! (${compScore}/5.0) ${bonusPoints > 0 ? `🌟 Awarded +${bonusPoints} bonus points to peer!` : ''}`,
      'points'
    );
  };

  // Claim perks
  const claimPerk = (perkId: string): boolean => {
    const perk = perks.find(p => p.id === perkId);
    if (!perk) return false;

    if (currentUser.points < perk.costPoints) {
      showNotification(`Insufficient points! You need ${perk.costPoints} pts (you have ${currentUser.points} pts).`, 'info');
      return false;
    }

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
    setUserPreferences(DEFAULT_PREFERENCES);
    setItems(MOCK_ITEMS);
    setSwaps(MOCK_SWAPS);
    setReviews(MOCK_REVIEWS);
    setPerks(MOCK_PERKS);
    setMessages(INITIAL_CHAT_MESSAGES);
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
        userPreferences,
        isPreferencesModalOpen,
        setIsPreferencesModalOpen,
        savePreferences,
        messages,
        isChatOpen,
        activeChatPeerId,
        activeChatItemId,
        openChat,
        closeChat,
        sendMessage,
        unreadChatCount,
        notification,
        setCurrentCampus,
        switchUser,
        addItem,
        proposeSwap,
        agreeFabric,
        agreeMeetup,
        acceptSwap,
        declineSwap,
        submitMpesaPayment,
        verifyMpesaPayment,
        scheduleExchange,
        confirmHandover,
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
