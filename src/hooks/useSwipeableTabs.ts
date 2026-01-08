import { useState, useEffect, useCallback } from 'react';
import useEmblaCarousel from 'embla-carousel-react';
import { useIsMobile } from './use-mobile';

export function useSwipeableTabs<T extends string>(tabs: readonly T[], defaultTab: T) {
  const isMobile = useIsMobile();
  const [activeTab, setActiveTab] = useState<T>(defaultTab);
  
  const [emblaRef, emblaApi] = useEmblaCarousel({
    loop: false,
    dragFree: false,
    watchDrag: isMobile, // Only enable drag on mobile
    skipSnaps: false,
  });

  // Sync carousel to tab when tab changes (e.g., from clicking tab header)
  useEffect(() => {
    if (!emblaApi || !isMobile) return;
    const index = tabs.indexOf(activeTab);
    if (index !== -1 && emblaApi.selectedScrollSnap() !== index) {
      emblaApi.scrollTo(index);
    }
  }, [activeTab, emblaApi, tabs, isMobile]);

  // Sync tab to carousel when user swipes
  useEffect(() => {
    if (!emblaApi || !isMobile) return;
    
    const onSelect = () => {
      const index = emblaApi.selectedScrollSnap();
      const newTab = tabs[index];
      if (newTab && newTab !== activeTab) {
        // Haptic feedback on swipe
        if ('vibrate' in navigator) {
          navigator.vibrate(10);
        }
        setActiveTab(newTab);
      }
    };
    
    emblaApi.on('select', onSelect);
    return () => { 
      emblaApi.off('select', onSelect); 
    };
  }, [emblaApi, tabs, activeTab, isMobile]);

  // Re-init when switching between mobile/desktop
  useEffect(() => {
    if (emblaApi) {
      emblaApi.reInit();
    }
  }, [isMobile, emblaApi]);

  const handleTabChange = useCallback((tab: T) => {
    setActiveTab(tab);
  }, []);

  return {
    activeTab,
    setActiveTab: handleTabChange,
    emblaRef,
    emblaApi,
    isMobile,
  };
}
