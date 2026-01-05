import { Link } from 'react-router-dom';
import { ChevronRight, Home } from 'lucide-react';
import { cn } from '@/lib/utils';

interface BreadcrumbItem {
  label: string;
  path: string;
}

interface PageHeaderProps {
  title: string;
  description?: string;
  actions?: React.ReactNode;
  breadcrumb?: BreadcrumbItem[];
  className?: string;
}

export function PageHeader({ title, description, actions, breadcrumb, className }: PageHeaderProps) {
  return (
    <div className={cn("mb-6 sm:mb-8", className)}>
      {/* Breadcrumb */}
      {breadcrumb && breadcrumb.length > 0 && (
        <nav className="flex items-center gap-1 text-sm text-muted-foreground mb-3">
          <Link to="/" className="hover:text-foreground transition-colors">
            <Home className="w-4 h-4" />
          </Link>
          {breadcrumb.map((item, index) => (
            <span key={item.path} className="flex items-center gap-1">
              <ChevronRight className="w-4 h-4" />
              {index === breadcrumb.length - 1 ? (
                <span className="text-foreground font-medium">{item.label}</span>
              ) : (
                <Link to={item.path} className="hover:text-foreground transition-colors">
                  {item.label}
                </Link>
              )}
            </span>
          ))}
        </nav>
      )}
      
      {/* Header Content */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold">{title}</h1>
          {description && (
            <p className="text-muted-foreground mt-1">{description}</p>
          )}
        </div>
        {actions && (
          <div className="flex items-center gap-2 flex-shrink-0">
            {actions}
          </div>
        )}
      </div>
    </div>
  );
}
