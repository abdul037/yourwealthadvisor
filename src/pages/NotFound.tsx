import { Link, useLocation } from "react-router-dom";
import { useEffect } from "react";
import { Home, ArrowLeft, Search, FileQuestion } from "lucide-react";
import { Button } from "@/components/ui/button";
import { TharwaLogo } from "@/components/TharwaLogo";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-background to-muted/50 px-4">
      <div className="text-center max-w-md">
        {/* Logo */}
        <div className="flex justify-center mb-6">
          <TharwaLogo size="lg" />
        </div>
        
        {/* 404 Illustration */}
        <div className="relative mb-8">
          <div className="w-32 h-32 mx-auto rounded-full bg-muted/50 flex items-center justify-center">
            <FileQuestion className="w-16 h-16 text-muted-foreground/50" />
          </div>
          <div className="absolute -top-2 -right-2 w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
            <span className="text-2xl font-bold text-primary">?</span>
          </div>
        </div>
        
        {/* Error Message */}
        <h1 className="text-6xl font-bold text-primary mb-4">404</h1>
        <h2 className="text-xl font-semibold mb-2">Page Not Found</h2>
        <p className="text-muted-foreground mb-8">
          The page you're looking for doesn't exist or has been moved.
          Let's get you back on track.
        </p>
        
        {/* Navigation Options */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center mb-8">
          <Link to="/">
            <Button className="gap-2 w-full sm:w-auto">
              <Home className="w-4 h-4" />
              Go to Dashboard
            </Button>
          </Link>
          <Button variant="outline" onClick={() => window.history.back()} className="gap-2">
            <ArrowLeft className="w-4 h-4" />
            Go Back
          </Button>
        </div>
        
        {/* Quick Links */}
        <div className="pt-6 border-t border-border">
          <p className="text-sm text-muted-foreground mb-3">Quick links:</p>
          <div className="flex flex-wrap gap-2 justify-center">
            <Link to="/income">
              <Button variant="ghost" size="sm">Income</Button>
            </Link>
            <Link to="/expenses">
              <Button variant="ghost" size="sm">Expenses</Button>
            </Link>
            <Link to="/budget">
              <Button variant="ghost" size="sm">Budget</Button>
            </Link>
            <Link to="/savings">
              <Button variant="ghost" size="sm">Savings</Button>
            </Link>
            <Link to="/investments">
              <Button variant="ghost" size="sm">Investments</Button>
            </Link>
            <Link to="/debt">
              <Button variant="ghost" size="sm">Debt</Button>
            </Link>
            <Link to="/trends">
              <Button variant="ghost" size="sm">Trends</Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
