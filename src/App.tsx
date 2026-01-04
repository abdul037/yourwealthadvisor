import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { CurrencyProvider } from "@/components/CurrencyConverter";
import { AppLayout } from "@/components/AppLayout";
import Index from "./pages/Index";
import Income from "./pages/Income";
import Expenses from "./pages/Expenses";
import BudgetPlanner from "./pages/BudgetPlanner";
import DebtTracker from "./pages/DebtTracker";
import Trends from "./pages/Trends";
import AITools from "./pages/AITools";
import AdminPortal from "./pages/AdminPortal";
import Auth from "./pages/Auth";
import Install from "./pages/Install";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <CurrencyProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            {/* Auth and Install pages without layout */}
            <Route path="/auth" element={<Auth />} />
            <Route path="/install" element={<Install />} />
            
            {/* Main app pages with layout */}
            <Route path="/" element={<AppLayout><Index /></AppLayout>} />
            <Route path="/income" element={<AppLayout><Income /></AppLayout>} />
            <Route path="/expenses" element={<AppLayout><Expenses /></AppLayout>} />
            <Route path="/budget" element={<AppLayout><BudgetPlanner /></AppLayout>} />
            <Route path="/debt" element={<AppLayout><DebtTracker /></AppLayout>} />
            <Route path="/trends" element={<AppLayout><Trends /></AppLayout>} />
            <Route path="/ai-tools" element={<AppLayout><AITools /></AppLayout>} />
            <Route path="/admin" element={<AppLayout><AdminPortal /></AppLayout>} />
            
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </CurrencyProvider>
  </QueryClientProvider>
);

export default App;
