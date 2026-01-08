import { Clock, Sparkles } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { useUserRole } from '@/hooks/useUserRole';

interface ComingSoonPageProps {
  moduleName: string;
}

export function ComingSoonPage({ moduleName }: ComingSoonPageProps) {
  const { isAdmin } = useUserRole();

  return (
    <div className="container max-w-2xl mx-auto py-12 px-4">
      <Card className="border-dashed">
        <CardContent className="flex flex-col items-center justify-center py-12 text-center">
          <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-6">
            <Clock className="w-8 h-8 text-muted-foreground" />
          </div>
          
          <h2 className="text-2xl font-bold mb-2">{moduleName}</h2>
          <p className="text-muted-foreground mb-6 max-w-md">
            This feature is currently in development and will be available soon.
          </p>
          
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Sparkles className="w-4 h-4" />
            <span>Stay tuned for updates!</span>
          </div>

          {isAdmin && (
            <div className="mt-8 p-4 bg-amber-500/10 border border-amber-500/20 rounded-lg">
              <p className="text-sm text-amber-600 dark:text-amber-400">
                <strong>Admin Note:</strong> This module is in Draft mode. 
                Toggle it to Live in the Module Manager to make it visible to users.
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
