import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AppLayout } from '@/components/AppLayout';
import { PageHeader } from '@/components/PageHeader';
import { CirclesTab } from '@/components/social/CirclesTab';
import { FriendsTab } from '@/components/social/FriendsTab';
import { ChallengesTab } from '@/components/social/ChallengesTab';
import { CoinBalance } from '@/components/social/CoinBalance';
import { ModuleGate } from '@/components/ModuleGate';
import { Users, MessageCircle, Trophy } from 'lucide-react';

export default function Social() {
  const [activeTab, setActiveTab] = useState('circles');

  return (
    <AppLayout>
      <ModuleGate module="social">
        <div className="space-y-6 pb-20 md:pb-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <PageHeader
              title="Tharwa Social"
              description="Connect with friends, join communities, and compete in challenges"
            />
            <CoinBalance />
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList className="grid w-full grid-cols-3 lg:w-auto lg:inline-grid">
              <TabsTrigger value="circles" className="flex items-center gap-2">
                <MessageCircle className="w-4 h-4" />
                <span className="hidden sm:inline">Circles</span>
              </TabsTrigger>
              <TabsTrigger value="friends" className="flex items-center gap-2">
                <Users className="w-4 h-4" />
                <span className="hidden sm:inline">Friends</span>
              </TabsTrigger>
              <TabsTrigger value="challenges" className="flex items-center gap-2">
                <Trophy className="w-4 h-4" />
                <span className="hidden sm:inline">Challenges</span>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="circles" className="space-y-6">
              <CirclesTab />
            </TabsContent>

            <TabsContent value="friends" className="space-y-6">
              <FriendsTab />
            </TabsContent>

            <TabsContent value="challenges" className="space-y-6">
              <ChallengesTab />
            </TabsContent>
          </Tabs>
        </div>
      </ModuleGate>
    </AppLayout>
  );
}
