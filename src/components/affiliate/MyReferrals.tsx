import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Coins, TrendingUp, Clock, CheckCircle2 } from 'lucide-react';
import { useUserReferrals } from '@/hooks/useUserReferrals';
import { format } from 'date-fns';

export function MyReferrals() {
  const { clicks, conversions, pendingRewards, totalCoinsEarned, isLoading } = useUserReferrals();

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-muted rounded w-1/3"></div>
            <div className="h-20 bg-muted rounded"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {/* Stats */}
      <div className="grid grid-cols-2 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-emerald-500/10 flex items-center justify-center">
                <Coins className="w-5 h-5 text-emerald-500" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{totalCoinsEarned}</p>
                <p className="text-xs text-muted-foreground">Coins Earned</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-amber-500/10 flex items-center justify-center">
                <Clock className="w-5 h-5 text-amber-500" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{pendingRewards}</p>
                <p className="text-xs text-muted-foreground">Pending</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <TrendingUp className="w-4 h-4" />
            Recent Activity
          </CardTitle>
        </CardHeader>
        <CardContent>
          {clicks.length === 0 && conversions.length === 0 ? (
            <div className="text-center py-6 text-muted-foreground">
              <p>No referral activity yet</p>
              <p className="text-sm mt-1">Browse our partners and earn coins!</p>
            </div>
          ) : (
            <div className="space-y-3">
              {conversions.map((conversion) => (
                <div key={conversion.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                    <div>
                      <p className="text-sm font-medium text-foreground">
                        {conversion.partner?.name || 'Partner'}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {format(new Date(conversion.converted_at), 'MMM d, yyyy')}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <Badge variant={conversion.status === 'approved' ? 'default' : 'secondary'}>
                      {conversion.status}
                    </Badge>
                    {conversion.coins_rewarded > 0 && (
                      <p className="text-xs text-amber-500 mt-1">
                        +{conversion.coins_rewarded} coins
                      </p>
                    )}
                  </div>
                </div>
              ))}

              {clicks.slice(0, 5).map((click) => (
                <div key={click.id} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-5 h-5 rounded-full bg-muted flex items-center justify-center">
                      <TrendingUp className="w-3 h-3 text-muted-foreground" />
                    </div>
                    <div>
                      <p className="text-sm text-foreground">
                        Clicked {click.partner?.name || 'Partner'}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {format(new Date(click.clicked_at), 'MMM d, yyyy')}
                      </p>
                    </div>
                  </div>
                  <Badge variant="outline" className="text-xs">
                    {click.source || 'direct'}
                  </Badge>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
