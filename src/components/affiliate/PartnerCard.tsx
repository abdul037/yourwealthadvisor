import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Coins, ExternalLink, Star, Building2 } from 'lucide-react';
import { AffiliatePartner } from '@/hooks/useAffiliatePartners';

interface PartnerCardProps {
  partner: AffiliatePartner;
  onLearnMore: (partner: AffiliatePartner) => void;
  onSignUp: (partner: AffiliatePartner) => void;
  isTracking?: boolean;
}

const categoryColors: Record<string, string> = {
  investment: 'bg-emerald-500/20 text-emerald-400',
  banking: 'bg-blue-500/20 text-blue-400',
  crypto: 'bg-orange-500/20 text-orange-400',
  insurance: 'bg-purple-500/20 text-purple-400',
  education: 'bg-pink-500/20 text-pink-400',
};

const categoryIcons: Record<string, string> = {
  investment: '📈',
  banking: '🏦',
  crypto: '₿',
  insurance: '🛡️',
  education: '📚',
};

export function PartnerCard({ partner, onLearnMore, onSignUp, isTracking }: PartnerCardProps) {
  return (
    <Card className="group hover:border-primary/50 transition-all duration-200">
      <CardContent className="p-4">
        <div className="flex items-start gap-4">
          {/* Logo placeholder */}
          <div className="w-12 h-12 rounded-lg bg-muted flex items-center justify-center text-2xl shrink-0">
            {partner.logo_url ? (
              <img src={partner.logo_url} alt={partner.name} className="w-full h-full rounded-lg object-cover" />
            ) : (
              categoryIcons[partner.category] || <Building2 className="w-6 h-6 text-muted-foreground" />
            )}
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="font-semibold text-foreground truncate">{partner.name}</h3>
              {partner.is_featured && (
                <Star className="w-4 h-4 text-yellow-500 fill-yellow-500 shrink-0" />
              )}
            </div>

            <Badge className={`${categoryColors[partner.category] || 'bg-muted'} text-xs mb-2`}>
              {partner.category}
            </Badge>

            <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
              {partner.description}
            </p>

            {partner.bonus_coins && partner.bonus_coins > 0 && (
              <div className="flex items-center gap-1.5 text-sm text-amber-500 mb-3">
                <Coins className="w-4 h-4" />
                <span className="font-medium">{partner.bonus_coins} Tharwa Coins</span>
              </div>
            )}

            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => onLearnMore(partner)}
                className="flex-1"
              >
                Learn More
              </Button>
              <Button
                size="sm"
                onClick={() => onSignUp(partner)}
                disabled={isTracking}
                className="flex-1 gap-1"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                Sign Up
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
