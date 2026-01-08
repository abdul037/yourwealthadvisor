import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';

export interface FeatureTip {
  id: string;
  title: string;
  description: string;
  actionLabel: string;
  actionPath?: string;
  icon: 'sparkles' | 'mic' | 'users' | 'bot' | 'repeat' | 'shield' | 'trending';
}

const FEATURE_TIPS: FeatureTip[] = [
  {
    id: 'voice_input',
    title: 'Did you know?',
    description: 'You can add expenses using voice input! Just tap the mic icon and speak naturally.',
    actionLabel: 'Try Voice Input',
    actionPath: '/expenses',
    icon: 'mic'
  },
  {
    id: 'split_expenses',
    title: 'Tip',
    description: 'Split expenses with friends and family. Create groups for trips, dinners, or shared bills.',
    actionLabel: 'Create Split Group',
    actionPath: '/split',
    icon: 'users'
  },
  {
    id: 'ai_categorization',
    title: 'New Feature',
    description: 'AI can automatically categorize your transactions. Just type naturally and we\'ll figure it out!',
    actionLabel: 'Try AI Input',
    actionPath: '/expenses',
    icon: 'bot'
  },
  {
    id: 'recurring_transactions',
    title: 'Pro Tip',
    description: 'Set up recurring transactions for subscriptions and regular bills. Never miss tracking them again!',
    actionLabel: 'Add Recurring',
    actionPath: '/expenses',
    icon: 'repeat'
  },
  {
    id: 'emergency_fund',
    title: 'Financial Health',
    description: 'Check your Emergency Fund Calculator to see your financial safety buffer. Experts recommend 3-6 months of expenses.',
    actionLabel: 'Check Fund',
    actionPath: '/',
    icon: 'shield'
  },
  {
    id: 'trends_analysis',
    title: 'Insight',
    description: 'Visit Trends to see your spending patterns and net worth growth over time.',
    actionLabel: 'View Trends',
    actionPath: '/trends',
    icon: 'trending'
  }
];

const STORAGE_KEY = 'tharwa_seen_tips';
const SESSION_KEY = 'tharwa_session_tip_shown';

export function useFeatureDiscovery() {
  const [currentTip, setCurrentTip] = useState<FeatureTip | null>(null);
  const [isVisible, setIsVisible] = useState(false);
  const navigate = useNavigate();

  const getSeenTips = useCallback((): string[] => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  }, []);

  const markTipAsSeen = useCallback((tipId: string) => {
    const seenTips = getSeenTips();
    if (!seenTips.includes(tipId)) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify([...seenTips, tipId]));
    }
  }, [getSeenTips]);

  const hasShownThisSession = useCallback((): boolean => {
    return sessionStorage.getItem(SESSION_KEY) === 'true';
  }, []);

  const markSessionShown = useCallback(() => {
    sessionStorage.setItem(SESSION_KEY, 'true');
  }, []);

  const getNextTip = useCallback((): FeatureTip | null => {
    const seenTips = getSeenTips();
    const unseenTips = FEATURE_TIPS.filter(tip => !seenTips.includes(tip.id));
    
    if (unseenTips.length === 0) {
      // All tips seen, rotate through them again
      return FEATURE_TIPS[Math.floor(Math.random() * FEATURE_TIPS.length)];
    }
    
    return unseenTips[0];
  }, [getSeenTips]);

  const showNextTip = useCallback(() => {
    if (hasShownThisSession()) return;
    
    const tip = getNextTip();
    if (tip) {
      setCurrentTip(tip);
      setIsVisible(true);
      markSessionShown();
    }
  }, [getNextTip, hasShownThisSession, markSessionShown]);

  const dismissTip = useCallback(() => {
    if (currentTip) {
      markTipAsSeen(currentTip.id);
    }
    setIsVisible(false);
    setCurrentTip(null);
  }, [currentTip, markTipAsSeen]);

  const handleAction = useCallback(() => {
    if (currentTip) {
      markTipAsSeen(currentTip.id);
      if (currentTip.actionPath) {
        navigate(currentTip.actionPath);
      }
    }
    setIsVisible(false);
    setCurrentTip(null);
  }, [currentTip, markTipAsSeen, navigate]);

  const resetAllTips = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY);
    sessionStorage.removeItem(SESSION_KEY);
  }, []);

  // Auto-show tip after a delay when component mounts
  useEffect(() => {
    const timer = setTimeout(() => {
      showNextTip();
    }, 3000); // Show after 3 seconds

    return () => clearTimeout(timer);
  }, [showNextTip]);

  return {
    currentTip,
    isVisible,
    showNextTip,
    dismissTip,
    handleAction,
    resetAllTips,
    allTips: FEATURE_TIPS,
    seenTips: getSeenTips()
  };
}
