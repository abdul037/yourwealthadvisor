import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Coins, ExternalLink, Check, Building2, AlertCircle } from 'lucide-react';
import { AffiliatePartner } from '@/hooks/useAffiliatePartners';

interface PartnerDetailSheetProps {
  partner: AffiliatePartner | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
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

export function PartnerDetailSheet({ partner, open, onOpenChange, onSignUp, isTracking }: PartnerDetailSheetProps) {
  if (!partner) return null;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-lg overflow-y-auto">
        <SheetHeader className="text-left">
          <div className="flex items-center gap-4 mb-2">
            <div className="w-16 h-16 rounded-xl bg-muted flex items-center justify-center text-3xl">
              {partner.logo_url ? (
                <img src={partner.logo_url} alt={partner.name} className="w-full h-full rounded-xl object-cover" />
              ) : (
                categoryIcons[partner.category] || <Building2 className="w-8 h-8 text-muted-foreground" />
              )}
            </div>
            <div>
              <SheetTitle className="text-xl">{partner.name}</SheetTitle>
              <Badge className={`${categoryColors[partner.category] || 'bg-muted'} mt-1`}>
                {partner.category}
              </Badge>
            </div>
          </div>
        </SheetHeader>

        <div className="mt-6 space-y-6">
          {/* Bonus Section */}
          {partner.bonus_coins && partner.bonus_coins > 0 && (
            <div className="bg-gradient-to-r from-amber-500/10 to-orange-500/10 border border-amber-500/20 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <Coins className="w-5 h-5 text-amber-500" />
                <span className="font-semibold text-amber-500">Exclusive Bonus</span>
              </div>
              <p className="text-foreground font-medium">{partner.bonus_description}</p>
              <p className="text-sm text-muted-foreground mt-1">
                Earn {partner.bonus_coins} Tharwa Coins when you sign up through our link
              </p>
            </div>
          )}

          {/* Description */}
          <div>
            <h4 className="font-semibold text-foreground mb-2">About {partner.name}</h4>
            <p className="text-muted-foreground">{partner.description}</p>
          </div>

          {/* Features */}
          {partner.features && partner.features.length > 0 && (
            <div>
              <h4 className="font-semibold text-foreground mb-3">Key Features</h4>
              <ul className="space-y-2">
                {partner.features.map((feature, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <Check className="w-4 h-4 text-emerald-500 mt-0.5 shrink-0" />
                    <span className="text-sm text-muted-foreground">{feature}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Minimum Deposit */}
          {partner.min_deposit && partner.min_deposit > 0 && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <AlertCircle className="w-4 h-4" />
              <span>Minimum deposit: AED {partner.min_deposit.toLocaleString()}</span>
            </div>
          )}

          <Separator />

          {/* CTA */}
          <div className="space-y-3">
            <Button
              className="w-full gap-2"
              size="lg"
              onClick={() => onSignUp(partner)}
              disabled={isTracking}
            >
              <ExternalLink className="w-4 h-4" />
              Sign Up with {partner.name}
            </Button>
            
            <p className="text-xs text-muted-foreground text-center">
              By clicking above, you'll be redirected to {partner.name}'s website. 
              We may earn a commission at no extra cost to you.
            </p>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
