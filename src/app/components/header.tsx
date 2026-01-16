import { supabase } from "@/shared/infra/supabase-client";
import { PortfolioManager } from "@/features/asset-manager";
import Button from "@/shared/ui/button";

export default function Header() {
  return (
    <header className="border-b">
      <div className="flex h-16 items-center px-8 max-w-7xl mx-auto justify-between">
        <div className="font-bold text-lg">Portfolio Tracker</div>
        <div className="flex items-center gap-4">
          <PortfolioManager />
          <Button variant="ghost" onClick={() => supabase.auth.signOut()}>
            Sign Out
          </Button>
        </div>
      </div>
    </header>
  );
}
