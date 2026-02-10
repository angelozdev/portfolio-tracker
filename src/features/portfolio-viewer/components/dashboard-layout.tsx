import { QUERY_KEYS } from "@/shared/constants/query-keys";
import { useSuspenseQuery } from "@tanstack/react-query";
import { supabase } from "@/shared/infra/supabase-client";
import { fetchCurrentPrices } from "@/features/market-data/services/price-service";
import { LocalStorageCache } from "@/shared/utils/local-storage-cache";
import { calculatePortfolio } from "../logic/portfolio-calculator";
import { calculateBrokerSummary } from "../logic/broker-calculator";
import SummaryCards from "./summary-cards";
import RebalanceTable from "./rebalance-table";
import BrokerBalanceCard from "./broker-balance-card";
import Card from "@/shared/ui/card";
import type { Asset, Holding, Broker } from "@/types";
import { lazy, Suspense, useState } from "react";

const AllocationChart = lazy(() => import("./allocation-chart"));
import Button from "@/shared/ui/button";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

const priceCache = new LocalStorageCache<Record<string, number>>(
  "portfolio-prices",
  5 * 60 * 1000, // 5 minutes TTL
);

export default function Dashboard() {
  const [isGeneratingSeed, setIsGeneratingSeed] = useState(false);

  // 1. Fetch Data
  const { data, refetch } = useSuspenseQuery({
    queryKey: QUERY_KEYS.PORTFOLIO,
    queryFn: async () => {
      // Fetch Assets, Holdings, and Brokers in parallel
      const [{ data: assets }, { data: holdings }, { data: brokers }] =
        await Promise.all([
          supabase.from("assets").select("*"),
          supabase.from("holdings").select("*"),
          supabase.from("brokers").select("*"),
        ]);

      if (!assets || !holdings || !brokers)
        throw new Error("Failed to fetch portfolio data");

      // Fetch Prices (cached in localStorage)
      const symbols = assets.map((a: Asset) => a.symbol);
      const cached = priceCache.get();
      const isCacheValid = cached && symbols.every((s) => s in cached);
      const prices = isCacheValid ? cached : await fetchCurrentPrices(symbols);

      if (!isCacheValid) priceCache.set(prices);

      // Calculate Portfolio and Broker Summaries
      const portfolio = calculatePortfolio(
        assets as Asset[],
        holdings as Holding[],
        prices,
      );

      const brokerSummary = calculateBrokerSummary(
        holdings as Holding[],
        brokers as Broker[],
        prices,
        assets as Asset[],
      );

      return { portfolio, brokerSummary };
    },
  });

  const { portfolio, brokerSummary } = data;

  const handleSeedData = async () => {
    setIsGeneratingSeed(true);
    try {
      const { error } = await supabase.rpc("generate_seed_data");
      if (error) {
        toast.error("Failed to generate demo data");
      } else {
        toast.success("Demo data generated!");
        refetch();
      }
    } catch {
      toast.error("Failed to generate demo data");
    } finally {
      setIsGeneratingSeed(false);
    }
  };

  if (!portfolio || portfolio.assets.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-screen gap-4">
        <h1 className="text-2xl font-bold">Welcome to Portfolio Tracker</h1>
        <p className="text-muted-foreground">You don't have any assets yet.</p>
        <Button onClick={handleSeedData} disabled={isGeneratingSeed}>
          {isGeneratingSeed ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
              Generating...
            </>
          ) : (
            "Generate Demo Data"
          )}
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 p-8 max-w-7xl mx-auto">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <div className="text-sm text-muted-foreground">
          Last updated: {new Date().toLocaleTimeString()}
        </div>
      </div>

      <SummaryCards summary={portfolio} />

      <BrokerBalanceCard summary={brokerSummary} />

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <Card.Header>
            <Card.Title>Allocation</Card.Title>
            <Card.Description>Current distribution by asset</Card.Description>
          </Card.Header>
          <Card.Content>
            <Suspense
              fallback={
                <div className="h-[300px] w-full animate-pulse rounded-md bg-muted" />
              }
            >
              <AllocationChart assets={portfolio.assets} />
            </Suspense>
          </Card.Content>
        </Card>

        <div className="hidden md:block">
          {/* Placeholder for future "History" or "Sector" chart */}
          <Card className="h-full">
            <Card.Header>
              <Card.Title>Rebalance Strategy</Card.Title>
              <Card.Description>
                Action plan to hit your targets
              </Card.Description>
            </Card.Header>
            <Card.Content>
              <div className="text-sm text-muted-foreground space-y-2">
                {portfolio.assets.map((asset) => (
                  <p key={asset.assetId}>
                    • <strong>{asset.symbol}</strong> target is{" "}
                    {asset.targetAllocation}%.
                  </p>
                ))}
                {portfolio.assets.length === 0 && (
                  <p>No assets configured yet.</p>
                )}
                <br />
                <p className="italic">
                  "Time in the market beats timing the market."
                </p>
              </div>
            </Card.Content>
          </Card>
        </div>
      </div>

      <Card>
        <Card.Header>
          <Card.Title>Rebalance Actions</Card.Title>
          <Card.Description>
            Buy/Sell recommendations to align with your target allocation.
          </Card.Description>
        </Card.Header>
        <Card.Content>
          <RebalanceTable assets={portfolio.assets} />
        </Card.Content>
      </Card>
    </div>
  );
}
