import { Link } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useAppModules } from '@/hooks/useAppModules';
import { useSubscription } from '@/hooks/useSubscription';
import { Check, Lock, Crown, ArrowRight, Sparkles } from 'lucide-react';

export function AccessOverview() {
  const { getModulesWithAccess, loading } = useAppModules();
  const { currentTier } = useSubscription();

  const modulesWithAccess = getModulesWithAccess();
  const accessibleModules = modulesWithAccess.filter(m => m.hasAccess && m.is_live);
  const lockedModules = modulesWithAccess.filter(m => !m.hasAccess && m.is_live);
  const draftModules = modulesWithAccess.filter(m => !m.is_live);

  const accessPercentage = modulesWithAccess.filter(m => m.is_live).length > 0
    ? Math.round((accessibleModules.length / modulesWithAccess.filter(m => m.is_live).length) * 100)
    : 100;

  const currentTierName = currentTier?.display_name || 'Free';

  if (loading) {
    return (
      <Card>
        <CardContent className="py-8 text-center text-muted-foreground">
          Loading access information...
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Current Plan Overview */}
      <Card className="border-primary/20 bg-gradient-to-r from-primary/5 to-transparent">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Crown className="w-5 h-5 text-primary" />
                Your Current Plan
              </CardTitle>
              <CardDescription className="mt-1">
                You have access to {accessibleModules.length} out of {modulesWithAccess.filter(m => m.is_live).length} features
              </CardDescription>
            </div>
            <Badge variant="default" className="text-lg px-4 py-2">
              {currentTierName}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Feature Access</span>
              <span className="font-medium">{accessPercentage}%</span>
            </div>
            <Progress value={accessPercentage} className="h-2" />
          </div>
          
          {lockedModules.length > 0 && (
            <Button asChild className="w-full">
              <Link to="/membership">
                Upgrade to Unlock {lockedModules.length} More Features
                <ArrowRight className="w-4 h-4 ml-2" />
              </Link>
            </Button>
          )}
        </CardContent>
      </Card>

      {/* Accessible Features */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-green-500">
            <Check className="w-5 h-5" />
            Your Features ({accessibleModules.length})
          </CardTitle>
          <CardDescription>
            Features included in your {currentTierName} plan
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {accessibleModules.map((module) => (
              <div 
                key={module.id}
                className="flex items-center gap-3 p-3 rounded-lg border bg-green-500/5 border-green-500/20"
              >
                <div className="w-8 h-8 rounded-lg bg-green-500/20 flex items-center justify-center">
                  <Check className="w-4 h-4 text-green-500" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium truncate">{module.display_name}</p>
                  <p className="text-xs text-muted-foreground truncate">{module.description}</p>
                </div>
                {module.route && (
                  <Button variant="ghost" size="sm" asChild>
                    <Link to={module.route}>Open</Link>
                  </Button>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Locked Features */}
      {lockedModules.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-amber-500">
              <Lock className="w-5 h-5" />
              Upgrade to Unlock ({lockedModules.length})
            </CardTitle>
            <CardDescription>
              These features require a higher subscription tier
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {lockedModules.map((module) => (
                <div 
                  key={module.id}
                  className="flex items-center gap-3 p-3 rounded-lg border bg-amber-500/5 border-amber-500/20 opacity-75"
                >
                  <div className="w-8 h-8 rounded-lg bg-amber-500/20 flex items-center justify-center">
                    <Lock className="w-4 h-4 text-amber-500" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="font-medium truncate">{module.display_name}</p>
                      <Badge variant="outline" className="text-xs capitalize">
                        {module.required_tier}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground truncate">{module.description}</p>
                  </div>
                </div>
              ))}
            </div>
            
            <Button asChild className="w-full mt-4 gap-2" variant="outline">
              <Link to="/membership">
                <Sparkles className="w-4 h-4" />
                View Upgrade Options
              </Link>
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Coming Soon */}
      {draftModules.length > 0 && (
        <Card className="opacity-60">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-muted-foreground">
              <Sparkles className="w-5 h-5" />
              Coming Soon ({draftModules.length})
            </CardTitle>
            <CardDescription>
              New features currently in development
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {draftModules.map((module) => (
                <div 
                  key={module.id}
                  className="flex items-center gap-3 p-3 rounded-lg border border-dashed"
                >
                  <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center">
                    <Sparkles className="w-4 h-4 text-muted-foreground" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="font-medium truncate text-muted-foreground">{module.display_name}</p>
                      <Badge variant="secondary" className="text-xs">
                        Coming Soon
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground truncate">{module.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
