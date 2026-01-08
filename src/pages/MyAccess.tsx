import { PageHeader } from '@/components/PageHeader';
import { AccessOverview } from '@/components/access/AccessOverview';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Crown, Sparkles } from 'lucide-react';
import { useSubscription } from '@/hooks/useSubscription';
import { useNavigate } from 'react-router-dom';

export default function MyAccess() {
  const { currentTier, isPremium, isLoading } = useSubscription();
  const navigate = useNavigate();

  return (
    <div className="container mx-auto p-4 space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <PageHeader 
          title="My Access" 
          description="View your subscription features and access level"
        />
        <div className="flex items-center gap-3">
          {!isLoading && !isPremium && (
            <Button 
              onClick={() => navigate('/membership')}
              className="gap-2"
            >
              <Sparkles className="w-4 h-4" />
              Upgrade Now
            </Button>
          )}
          <Badge variant="outline" className="gap-1">
            <Crown className="w-3 h-3" />
            {currentTier?.display_name || 'Member'}
          </Badge>
        </div>
      </div>
      <AccessOverview />
    </div>
  );
}
