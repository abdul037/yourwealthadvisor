import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Coins, Star, ChevronRight, Building2 } from 'lucide-react';
import { AffiliatePartner } from '@/hooks/useAffiliatePartners';

interface FeaturedPartnersProps {
  partners: AffiliatePartner[];
  onPartnerClick: (partner: AffiliatePartner) => void;
}

const categoryIcons: Record<string, string> = {
  investment: '📈',
  banking: '🏦',
  crypto: '₿',
  insurance: '🛡️',
  education: '📚',
};

export function FeaturedPartners({ partners, onPartnerClick }: FeaturedPartnersProps) {
  if (partners.length === 0) return null;

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
        <h3 className="font-semibold text-foreground">Featured Partners</h3>
      </div>

      <div className="grid gap-3">
        {partners.slice(0, 3).map((partner) => (
          <Card
            key={partner.id}
            className="group cursor-pointer hover:border-primary/50 transition-all"
            onClick={() => onPartnerClick(partner)}
          >
            <CardContent className="p-4">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center text-2xl shrink-0">
                  {partner.logo_url ? (
                    <img src={partner.logo_url} alt={partner.name} className="w-full h-full rounded-lg object-cover" />
                  ) : (
                    categoryIcons[partner.category] || <Building2 className="w-6 h-6 text-muted-foreground" />
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h4 className="font-medium text-foreground truncate">{partner.name}</h4>
                    <Badge variant="secondary" className="text-xs shrink-0">
                      {partner.category}
                    </Badge>
                  </div>
                  
                  {partner.bonus_coins && partner.bonus_coins > 0 && (
                    <div className="flex items-center gap-1 mt-1 text-sm text-amber-500">
                      <Coins className="w-3.5 h-3.5" />
                      <span>Earn {partner.bonus_coins} coins</span>
                    </div>
                  )}
                </div>

                <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
