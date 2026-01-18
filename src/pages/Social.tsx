import { useEffect, useMemo, useRef, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AppLayout } from '@/components/AppLayout';
import { PageHeader } from '@/components/PageHeader';
import { CirclesTab } from '@/components/social/CirclesTab';
import { FriendsTab } from '@/components/social/FriendsTab';
import { ChallengesTab } from '@/components/social/ChallengesTab';
import { CoinBalance } from '@/components/social/CoinBalance';
import { SocialFeed } from '@/components/social/SocialFeed';
import { SocialSettings } from '@/components/social/SocialSettings';
import { ModuleGate } from '@/components/ModuleGate';
import { Users, MessageCircle, Trophy } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { useCircles } from '@/hooks/useCircles';
import { useFriends } from '@/hooks/useFriends';
import { useChallenges } from '@/hooks/useChallenges';
import { recordSocialView } from '@/lib/socialAnalytics';

export default function Social() {
  const [activeTab, setActiveTab] = useState('circles');
  const { joinedCircles } = useCircles();
  const { acceptedFriends } = useFriends();
  const { activeChallenges } = useChallenges();
  const tabsRef = useRef<HTMLDivElement | null>(null);
  const [searchParams] = useSearchParams();
  const circleSlug = searchParams.get('circle');
  const initialCircleSlug = useMemo(() => circleSlug, [circleSlug]);

  useEffect(() => {
    recordSocialView();
  }, []);

  useEffect(() => {
    if (initialCircleSlug) {
      setActiveTab('circles');
    }
  }, [initialCircleSlug]);

  const handleSelectTab = (tab: 'circles' | 'friends' | 'challenges') => {
    setActiveTab(tab);
    requestAnimationFrame(() => {
      tabsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  };

  return (
    <AppLayout>
      <ModuleGate module="social">
        <div className="min-h-screen bg-background">
          <main className="container mx-auto px-4 sm:px-6 py-6 sm:py-8 max-w-full overflow-x-hidden space-y-6 pb-20 md:pb-6">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <PageHeader
                title="Tharwa Social"
                description="Connect with friends, join communities, and compete in challenges"
              />
              <CoinBalance />
            </div>

            <SocialFeed onSelectTab={handleSelectTab} />

            <SocialSettings />

            <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
              <TabsList
                ref={tabsRef}
                id="social-tabs"
                className="grid w-full grid-cols-3 lg:w-auto lg:inline-grid sticky top-16 z-30 bg-background/90 backdrop-blur border border-border/70 rounded-2xl px-3 py-2 shadow-sm"
              >
                <TabsTrigger value="circles" className="flex items-center gap-2">
                  <MessageCircle className="w-4 h-4" />
                  <span className="hidden sm:inline">Circles</span>
                  <Badge variant="secondary" className="ml-1">
                    {joinedCircles.length}
                  </Badge>
                </TabsTrigger>
                <TabsTrigger value="friends" className="flex items-center gap-2">
                  <Users className="w-4 h-4" />
                  <span className="hidden sm:inline">Friends</span>
                  <Badge variant="secondary" className="ml-1">
                    {acceptedFriends.length}
                  </Badge>
                </TabsTrigger>
                <TabsTrigger value="challenges" className="flex items-center gap-2">
                  <Trophy className="w-4 h-4" />
                  <span className="hidden sm:inline">Challenges</span>
                  <Badge variant="secondary" className="ml-1">
                    {activeChallenges.length}
                  </Badge>
                </TabsTrigger>
              </TabsList>

              <TabsContent value="circles" className="space-y-6">
                <CirclesTab initialCircleSlug={initialCircleSlug} />
              </TabsContent>

              <TabsContent value="friends" className="space-y-6">
                <FriendsTab />
              </TabsContent>

              <TabsContent value="challenges" className="space-y-6">
                <ChallengesTab />
              </TabsContent>
            </Tabs>
          </main>
        </div>
      </ModuleGate>
    </AppLayout>
  );
}
