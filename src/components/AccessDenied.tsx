import { ShieldX } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

export function AccessDenied() {
  const navigate = useNavigate();

  return (
    <div className="container max-w-2xl mx-auto py-12 px-4">
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12 text-center">
          <div className="w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center mb-6">
            <ShieldX className="w-8 h-8 text-destructive" />
          </div>
          
          <h2 className="text-2xl font-bold mb-2">Access Denied</h2>
          <p className="text-muted-foreground mb-6 max-w-md">
            You don't have permission to access this page. 
            This area is restricted to administrators only.
          </p>
          
          <Button onClick={() => navigate('/')}>
            Return to Dashboard
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
