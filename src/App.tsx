import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate, useLocation } from "react-router-dom";
import { ThemeProvider } from "next-themes";
import { CurrencyProvider } from "@/components/CurrencyConverter";
import { AppLayout } from "@/components/AppLayout";
import { AdminRoute } from "@/components/AdminRoute";
import { ModuleGate } from "@/components/ModuleGate";
import Index from "./pages/Index";
import Income from "./pages/Income";
import Investments from "./pages/Investments";
import Expenses from "./pages/Expenses";
import BudgetPlanner from "./pages/BudgetPlanner";
import DebtTracker from "./pages/DebtTracker";
import Trends from "./pages/Trends";
import SavingsGoals from "./pages/SavingsGoals";
import AITools from "./pages/AITools";
import MyAccess from "./pages/MyAccess";
import AdminPortal from "./pages/AdminPortal";
import Auth from "./pages/Auth";
import Welcome from "./pages/Welcome";
import Install from "./pages/Install";
import NotFound from "./pages/NotFound";
import Onboarding from "./pages/Onboarding";
import SplitExpenses from "./pages/SplitExpenses";
import SplitGroupDetail from "./pages/SplitGroupDetail";
import JoinSplitGroup from "./pages/JoinSplitGroup";
import ShortInvite from "./pages/ShortInvite";
import Social from "./pages/Social";
import Partners from "./pages/Partners";
import Membership from "./pages/Membership";
import UserManagement from "./pages/UserManagement";
import { useUserProfile } from "@/hooks/useUserProfile";

// Protected route wrapper — redirects unauthenticated users to welcome,
// and funnels new users through /onboarding before reaching the app.
function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, loading, profile } = useUserProfile();
  const location = useLocation();

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

  // Gate access until onboarding is done.
  // Also catches null profile (trigger race or first-time OAuth user).
  if ((!profile || !profile.onboarding_completed) && location.pathname !== '/onboarding') {
    return <Navigate to="/onboarding" replace />;
  }

  // Prevent re-entering onboarding once it's complete.
  if (profile?.onboarding_completed && location.pathname === '/onboarding') {
    return <Navigate to="/" replace />;
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

              {/* Onboarding — protected but no app layout */}
              <Route path="/onboarding" element={<ProtectedRoute><Onboarding /></ProtectedRoute>} />
              
              {/* Protected app pages with layout */}
              <Route path="/" element={<ProtectedRoute><AppLayout><Index /></AppLayout></ProtectedRoute>} />
              <Route path="/income" element={<ProtectedRoute><AppLayout><Income /></AppLayout></ProtectedRoute>} />
              <Route path="/investments" element={<ProtectedRoute><AppLayout><Investments /></AppLayout></ProtectedRoute>} />
              <Route path="/expenses" element={<ProtectedRoute><AppLayout><Expenses /></AppLayout></ProtectedRoute>} />
              <Route path="/budget" element={<ProtectedRoute><AppLayout><BudgetPlanner /></AppLayout></ProtectedRoute>} />
              <Route path="/debt" element={<ProtectedRoute><AppLayout><DebtTracker /></AppLayout></ProtectedRoute>} />
              <Route path="/trends" element={<ProtectedRoute><AppLayout><Trends /></AppLayout></ProtectedRoute>} />
              <Route path="/savings" element={<ProtectedRoute><AppLayout><SavingsGoals /></AppLayout></ProtectedRoute>} />
              <Route path="/ai-tools" element={<ProtectedRoute><AppLayout><AITools /></AppLayout></ProtectedRoute>} />
              <Route path="/admin" element={<ProtectedRoute><AppLayout><ModuleGate module="admin"><AdminPortal /></ModuleGate></AppLayout></ProtectedRoute>} />
              <Route path="/social" element={<ProtectedRoute><Social /></ProtectedRoute>} />
              <Route path="/split" element={<ProtectedRoute><SplitExpenses /></ProtectedRoute>} />
              <Route path="/split/join/:inviteCode" element={<JoinSplitGroup />} />
              <Route path="/split/:groupId" element={<ProtectedRoute><SplitGroupDetail /></ProtectedRoute>} />
              <Route path="/partners" element={<ProtectedRoute><Partners /></ProtectedRoute>} />
              <Route path="/membership" element={<ProtectedRoute><AppLayout><Membership /></AppLayout></ProtectedRoute>} />
              <Route path="/my-access" element={<ProtectedRoute><AppLayout><MyAccess /></AppLayout></ProtectedRoute>} />
              <Route path="/users" element={<ProtectedRoute><AdminRoute><AppLayout><UserManagement /></AppLayout></AdminRoute></ProtectedRoute>} />
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
