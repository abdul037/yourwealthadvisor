import { useState } from 'react';
import { 
  Sparkles, Brain, MessageSquare, TrendingUp, 
  FileText, Lightbulb, Zap, ArrowRight, Bell, Trophy
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AICategorizer } from '@/components/AICategorizer';
import { AIInsightsPanel } from '@/components/AIInsightsPanel';
import { NotificationTestPanel } from '@/components/NotificationTestPanel';
import { ChallengeRecommendations } from '@/components/social/ChallengeRecommendations';
import { PageHeader } from '@/components/PageHeader';
import { ModuleGate } from '@/components/ModuleGate';
// Sample uncategorized transactions for demo
const sampleUncategorizedTransactions = [
  { id: '1', description: 'ADNOC Petrol Station', amount: 250 },
  { id: '2', description: 'Carrefour Supermarket', amount: 450 },
  { id: '3', description: 'Netflix Subscription', amount: 55 },
  { id: '4', description: 'DEWA Bill Payment', amount: 890 },
  { id: '5', description: 'Uber Trip Downtown', amount: 45 },
  { id: '6', description: 'Amazon.ae Purchase', amount: 320 },
  { id: '7', description: 'Etisalat Mobile', amount: 199 },
  { id: '8', description: 'Starbucks JLT', amount: 35 },
];

const upcomingFeatures = [
  {
    id: 'forecast',
    title: 'Smart Forecasting',
    description: 'ML-powered predictions for your future expenses and cash flow',
    icon: TrendingUp,
    status: 'coming-soon',
  },
  {
    id: 'advisor',
    title: 'AI Financial Advisor',
    description: 'Chat with an AI advisor about your financial goals and get personalized recommendations',
    icon: MessageSquare,
    status: 'coming-soon',
  },
  {
    id: 'reports',
    title: 'Automated Reports',
    description: 'Generate comprehensive financial reports with AI-written summaries',
    icon: FileText,
    status: 'coming-soon',
  },
];

const AITools = () => {
  const [uncategorized, setUncategorized] = useState(sampleUncategorizedTransactions);
  const [categorizedResults, setCategorizedResults] = useState<{ id: string; category: string }[]>([]);

  const handleCategorized = (results: { id: string; category: string }[]) => {
    setCategorizedResults(prev => [...prev, ...results]);
    setUncategorized(prev => prev.filter(t => !results.some(r => r.id === t.id)));
  };

  return (
    <ModuleGate module="ai_tools">
      <div className="min-h-screen bg-background">
        <main className="container mx-auto px-4 sm:px-6 py-6 sm:py-8 max-w-full overflow-x-hidden">
          {/* Page Header */}
        <PageHeader 
          title="AI Tools"
          description="AI-powered insights and transaction categorization"
          breadcrumb={[{ label: 'AI Tools', path: '/ai-tools' }]}
          actions={
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center">
              <Sparkles className="w-6 h-6 text-primary-foreground" />
            </div>
          }
        />

        <Tabs defaultValue="insights" className="space-y-6">
          <TabsList className="grid w-full max-w-3xl grid-cols-5">
            <TabsTrigger value="insights" className="gap-2">
              <Lightbulb className="w-4 h-4" />
              Insights
            </TabsTrigger>
            <TabsTrigger value="categorizer" className="gap-2">
              <Zap className="w-4 h-4" />
              Categorizer
            </TabsTrigger>
            <TabsTrigger value="challenges" className="gap-2">
              <Trophy className="w-4 h-4" />
              Challenges
            </TabsTrigger>
            <TabsTrigger value="notifications" className="gap-2">
              <Bell className="w-4 h-4" />
              Notifications
            </TabsTrigger>
            <TabsTrigger value="upcoming" className="gap-2">
              <Brain className="w-4 h-4" />
              Coming Soon
            </TabsTrigger>
          </TabsList>

          {/* AI Insights Tab */}
          <TabsContent value="insights" className="space-y-6">
            <AIInsightsPanel />
          </TabsContent>

          {/* AI Categorizer Tab */}
          <TabsContent value="categorizer" className="space-y-6">
            <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-transparent">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Zap className="w-5 h-5 text-primary" />
                  Transaction Auto-Categorizer
                </CardTitle>
                <CardDescription>
                  Use AI to automatically categorize your transactions. Perfect for bulk imports 
                  or cleaning up uncategorized entries.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4">
                  <div className="flex items-center justify-between p-4 rounded-lg bg-muted/50">
                    <div>
                      <p className="font-medium">How it works</p>
                      <ul className="text-sm text-muted-foreground mt-2 space-y-1">
                        <li>• AI analyzes transaction descriptions</li>
                        <li>• Suggests the most appropriate category</li>
                        <li>• Shows confidence score for each suggestion</li>
                        <li>• You can accept or reject each categorization</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Demo with sample transactions */}
            <AICategorizer 
              transactions={uncategorized}
              type="expense"
              onCategorized={handleCategorized}
            />

            {/* Show categorized results */}
            {categorizedResults.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Categorized Transactions</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {categorizedResults.map(result => {
                      const original = sampleUncategorizedTransactions.find(t => t.id === result.id);
                      return (
                        <div key={result.id} className="flex items-center justify-between p-3 rounded-lg bg-wealth-positive/10">
                          <span className="font-medium">{original?.description}</span>
                          <Badge variant="secondary">{result.category}</Badge>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* AI Challenge Builder Tab */}
          <TabsContent value="challenges" className="space-y-6">
            <Card className="border-purple-500/20 bg-gradient-to-br from-purple-500/5 to-transparent">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Trophy className="w-5 h-5 text-purple-400" />
                  AI Challenge Builder
                </CardTitle>
                <CardDescription>
                  Get personalized financial challenges tailored to your spending habits. 
                  Our AI analyzes your transactions and suggests challenges to help you 
                  save more and spend smarter.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between p-4 rounded-lg bg-muted/50">
                  <div>
                    <p className="font-medium">How it works</p>
                    <ul className="text-sm text-muted-foreground mt-2 space-y-1">
                      <li>• AI analyzes your last 30 days of transactions</li>
                      <li>• Identifies spending patterns and opportunities</li>
                      <li>• Suggests 3-4 personalized challenges</li>
                      <li>• Start challenges with one click to track progress</li>
                      <li>• Progress updates automatically as you transact</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <ChallengeRecommendations />
          </TabsContent>

          {/* Notification Test Panel Tab */}
          <TabsContent value="notifications" className="space-y-6">
            <NotificationTestPanel />
          </TabsContent>

          {/* Upcoming Features Tab */}
          <TabsContent value="upcoming" className="space-y-6">
            <div className="grid gap-4 md:grid-cols-2">
              {upcomingFeatures.map(feature => (
                <Card key={feature.id} className="relative overflow-hidden">
                  <div className="absolute top-3 right-3">
                    <Badge variant="outline" className="text-xs">
                      Coming Soon
                    </Badge>
                  </div>
                  <CardHeader>
                    <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center mb-2">
                      <feature.icon className="w-5 h-5 text-muted-foreground" />
                    </div>
                    <CardTitle className="text-lg">{feature.title}</CardTitle>
                    <CardDescription>{feature.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Button variant="ghost" size="sm" disabled className="gap-2">
                      Learn More <ArrowRight className="w-4 h-4" />
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>

            <Card className="border-accent/50 bg-accent/5">
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl bg-accent/20 flex items-center justify-center flex-shrink-0">
                    <Brain className="w-6 h-6 text-accent" />
                  </div>
                  <div>
                    <h3 className="font-semibold mb-1">AI-Powered Financial Intelligence</h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      We're building cutting-edge AI features to help you make smarter financial decisions. 
                      These tools will analyze your data, identify patterns, and provide personalized recommendations.
                    </p>
                    <div className="flex flex-wrap gap-2">
                      <Badge>Machine Learning</Badge>
                      <Badge>Natural Language</Badge>
                      <Badge>Predictive Analytics</Badge>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

          {/* Footer */}
          <footer className="mt-12 pt-8 border-t border-border text-center">
            <p className="text-xs text-muted-foreground">
              Tharwa Net • AI-Powered Wealth Management
            </p>
          </footer>
        </main>
      </div>
    </ModuleGate>
  );
};

export default AITools;
