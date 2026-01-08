import { useState } from 'react';
import { AppLayout } from '@/components/AppLayout';
import { PageHeader } from '@/components/PageHeader';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Search, Handshake, TrendingUp, Building2, Coins as CoinsIcon, GraduationCap, Shield } from 'lucide-react';
import { useAffiliatePartners, AffiliatePartner } from '@/hooks/useAffiliatePartners';
import { PartnerCard } from '@/components/affiliate/PartnerCard';
import { PartnerDetailSheet } from '@/components/affiliate/PartnerDetailSheet';
import { FeaturedPartners } from '@/components/affiliate/FeaturedPartners';
import { MyReferrals } from '@/components/affiliate/MyReferrals';
import { toast } from '@/hooks/use-toast';

const categories = [
  { id: 'all', label: 'All', icon: Building2 },
  { id: 'investment', label: 'Investment', icon: TrendingUp },
  { id: 'banking', label: 'Banking', icon: Building2 },
  { id: 'crypto', label: 'Crypto', icon: CoinsIcon },
  { id: 'education', label: 'Education', icon: GraduationCap },
];

export default function Partners() {
  const { partners, featuredPartners, getPartnersByCategory, trackClick, isLoading } = useAffiliatePartners();
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPartner, setSelectedPartner] = useState<AffiliatePartner | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);

  const filteredPartners = getPartnersByCategory(selectedCategory).filter(
    (p) => p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
           p.description?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleLearnMore = (partner: AffiliatePartner) => {
    setSelectedPartner(partner);
    setDetailOpen(true);
  };

  const handleSignUp = async (partner: AffiliatePartner) => {
    try {
      const result = await trackClick.mutateAsync({
        partnerId: partner.id,
        source: 'partners-page',
      });

      toast({
        title: `Opening ${partner.name}`,
        description: `You'll earn ${result.bonusCoins} Tharwa Coins when you sign up!`,
      });

      // Open partner link in new tab
      window.open(result.redirectUrl, '_blank');
      setDetailOpen(false);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to track referral. Please try again.',
        variant: 'destructive',
      });
    }
  };

  return (
    <AppLayout>
      <div className="min-h-screen bg-background">
        <PageHeader
          title="Partners"
          description="Discover trusted financial services and earn Tharwa Coins"
        />

        <div className="container max-w-4xl mx-auto px-4 py-6 space-y-6">
          <Tabs defaultValue="browse" className="w-full">
            <TabsList className="w-full grid grid-cols-2">
              <TabsTrigger value="browse">Browse Partners</TabsTrigger>
              <TabsTrigger value="my-referrals">My Referrals</TabsTrigger>
            </TabsList>

            <TabsContent value="browse" className="mt-6 space-y-6">
              {/* Featured Partners */}
              {!isLoading && featuredPartners.length > 0 && (
                <FeaturedPartners
                  partners={featuredPartners}
                  onPartnerClick={handleLearnMore}
                />
              )}

              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search partners..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>

              {/* Category Filters */}
              <div className="flex gap-2 overflow-x-auto pb-2 -mx-4 px-4 scrollbar-hide">
                {categories.map((category) => (
                  <Badge
                    key={category.id}
                    variant={selectedCategory === category.id ? 'default' : 'outline'}
                    className="cursor-pointer whitespace-nowrap py-1.5 px-3"
                    onClick={() => setSelectedCategory(category.id)}
                  >
                    <category.icon className="w-3.5 h-3.5 mr-1.5" />
                    {category.label}
                  </Badge>
                ))}
              </div>

              {/* Partners Grid */}
              {isLoading ? (
                <div className="space-y-4">
                  {[1, 2, 3].map((i) => (
                    <Skeleton key={i} className="h-32 w-full" />
                  ))}
                </div>
              ) : filteredPartners.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  <Building2 className="w-12 h-12 mx-auto mb-3 opacity-50" />
                  <p>No partners found</p>
                  <p className="text-sm mt-1">Try adjusting your search or category</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {filteredPartners.map((partner) => (
                    <PartnerCard
                      key={partner.id}
                      partner={partner}
                      onLearnMore={handleLearnMore}
                      onSignUp={handleSignUp}
                      isTracking={trackClick.isPending}
                    />
                  ))}
                </div>
              )}

              {/* Disclosure */}
              <div className="text-center text-xs text-muted-foreground py-4">
                <Shield className="w-4 h-4 inline mr-1" />
                We may earn a commission when you sign up through our links at no extra cost to you.
              </div>
            </TabsContent>

            <TabsContent value="my-referrals" className="mt-6">
              <MyReferrals />
            </TabsContent>
          </Tabs>
        </div>

        {/* Partner Detail Sheet */}
        <PartnerDetailSheet
          partner={selectedPartner}
          open={detailOpen}
          onOpenChange={setDetailOpen}
          onSignUp={handleSignUp}
          isTracking={trackClick.isPending}
        />
      </div>
    </AppLayout>
  );
}
