import { ReactNode } from 'react';
import { useAppModules } from '@/hooks/useAppModules';
import { ComingSoonPage } from './ComingSoonPage';
import { UpgradePrompt } from './subscription/UpgradePrompt';

interface ModuleGateProps {
  module: string;
  children: ReactNode;
}

export function ModuleGate({ module, children }: ModuleGateProps) {
  const { isModuleLive, canAccessModule, modules, loading } = useAppModules();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[200px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  const moduleData = modules.find(m => m.name === module);
  
  // If module doesn't exist in DB, allow access (backward compatibility)
  if (!moduleData) {
    return <>{children}</>;
  }

  // Check if module is live
  if (!isModuleLive(module)) {
    return <ComingSoonPage moduleName={moduleData.display_name} />;
  }

  // Check if user has tier access
  if (!canAccessModule(module)) {
    return (
      <div className="container max-w-2xl mx-auto py-12 px-4">
        <UpgradePrompt 
          feature={moduleData.display_name}
          description={`This feature requires ${moduleData.required_tier} tier or higher to access.`}
          variant="card"
        />
      </div>
    );
  }

  return <>{children}</>;
}
