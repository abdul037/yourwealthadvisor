import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { ThemeProvider } from "next-themes";
import { CurrencyProvider } from "@/components/CurrencyConverter";
import { AppLayout } from "@/components/AppLayout";
import Index from "./pages/Index";
import Income from "./pages/Income";
import Expenses from "./pages/Expenses";
import BudgetPlanner from "./pages/BudgetPlanner";
import DebtTracker from "./pages/DebtTracker";
import Trends from "./pages/Trends";
import SavingsGoals from "./pages/SavingsGoals";
import AITools from "./pages/AITools";
import AdminPortal from "./pages/AdminPortal";
import Auth from "./pages/Auth";
import Welcome from "./pages/Welcome";
import Install from "./pages/Install";
import NotFound from "./pages/NotFound";
import SplitExpenses from "./pages/SplitExpenses";
import SplitGroupDetail from "./pages/SplitGroupDetail";
import JoinSplitGroup from "./pages/JoinSplitGroup";
import ShortInvite from "./pages/ShortInvite";
import { useUserProfile } from "@/hooks/useUserProfile";

// Protected route wrapper that redirects unauthenticated users to welcome page
function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, loading } = useUserProfile();
  
  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-pulse text-muted-foreground">Loading...</div>
      </div>
    );
  }
  
  if (!isAuthenticated) {
    return <Navigate to="/welcome" replace />;
  }
  
  return <>{children}</>;
}

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider attribute="class" defaultTheme="dark" enableSystem>
      <CurrencyProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              {/* Public pages without layout */}
              <Route path="/welcome" element={<Welcome />} />
              <Route path="/auth" element={<Auth />} />
              <Route path="/install" element={<Install />} />
              
              {/* Protected app pages with layout */}
              <Route path="/" element={<ProtectedRoute><AppLayout><Index /></AppLayout></ProtectedRoute>} />
              <Route path="/income" element={<ProtectedRoute><AppLayout><Income /></AppLayout></ProtectedRoute>} />
              <Route path="/expenses" element={<ProtectedRoute><AppLayout><Expenses /></AppLayout></ProtectedRoute>} />
              <Route path="/budget" element={<ProtectedRoute><AppLayout><BudgetPlanner /></AppLayout></ProtectedRoute>} />
              <Route path="/debt" element={<ProtectedRoute><AppLayout><DebtTracker /></AppLayout></ProtectedRoute>} />
              <Route path="/trends" element={<ProtectedRoute><AppLayout><Trends /></AppLayout></ProtectedRoute>} />
              <Route path="/savings" element={<ProtectedRoute><AppLayout><SavingsGoals /></AppLayout></ProtectedRoute>} />
              <Route path="/ai-tools" element={<ProtectedRoute><AppLayout><AITools /></AppLayout></ProtectedRoute>} />
              <Route path="/admin" element={<ProtectedRoute><AppLayout><AdminPortal /></AppLayout></ProtectedRoute>} />
              <Route path="/split" element={<ProtectedRoute><SplitExpenses /></ProtectedRoute>} />
              <Route path="/split/join/:inviteCode" element={<JoinSplitGroup />} />
              <Route path="/split/:groupId" element={<ProtectedRoute><SplitGroupDetail /></ProtectedRoute>} />
              <Route path="/s/:code" element={<ShortInvite />} />
              
              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </CurrencyProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
