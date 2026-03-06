import { QUERY_KEYS } from "@/shared/constants/query-keys";
import { useSuspenseQuery } from "@tanstack/react-query";
import { supabase } from "@/shared/infra/supabase-client";
import { fetchCurrentPrices } from "@/features/market-data/services/price-service";
import { LocalStorageCache } from "@/shared/utils/local-storage-cache";
import {
  calculatePortfolio,
  DEFAULT_OVERWEIGHT_THRESHOLD,
} from "../logic/portfolio-calculator";
import { calculateBrokerSummary } from "../logic/broker-calculator";
import SummaryCards from "./summary-cards";
import RebalanceTable from "./rebalance-table";
import BrokerBalanceCard from "./broker-balance-card";
import Card from "@/shared/ui/card";
import type { Asset, Holding, Broker, RebalanceMode } from "@/types";
import { lazy, Suspense, useMemo, useState } from "react";

const AllocationChart = lazy(() => import("./allocation-chart"));
import { Tabs, TabsList, TabsTrigger } from "@/shared/ui/tabs";
import { Input } from "@/shared/ui/input";
import { Label } from "@/shared/ui/label";
import Button from "@/shared/ui/button";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

const priceCache = new LocalStorageCache<Record<string, number>>(
  "portfolio-prices",
  5 * 60 * 1000, // 5 minutes TTL
);

export default function Dashboard() {
  const [isGeneratingSeed, setIsGeneratingSeed] = useState(false);
  const [rebalanceMode, setRebalanceMode] =
    useState<RebalanceMode>("buy-and-sell");
  const [threshold, setThreshold] = useState(DEFAULT_OVERWEIGHT_THRESHOLD);

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

      const brokerSummary = calculateBrokerSummary(
        holdings as Holding[],
        brokers as Broker[],
        prices,
        assets as Asset[],
      );

      return {
        assets: assets as Asset[],
        holdings: holdings as Holding[],
        prices,
        brokerSummary,
      };
    },
  });

  const { brokerSummary } = data;

  const portfolio = useMemo(
    () =>
      calculatePortfolio(
        data.assets,
        data.holdings,
        data.prices,
        rebalanceMode,
        threshold,
      ),
    [data.assets, data.holdings, data.prices, rebalanceMode, threshold],
  );

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
              <Loader2
                aria-hidden="true"
                className="h-4 w-4 animate-spin mr-2"
              />
              Generating…
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
          Last updated:{" "}
          {new Intl.DateTimeFormat(undefined, {
            hour: "numeric",
            minute: "numeric",
            second: "numeric",
          }).format(new Date())}
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
                  {"\u201CTime in the market beats timing the market.\u201D"}
                </p>
              </div>
            </Card.Content>
          </Card>
        </div>
      </div>

      <Card>
        <Card.Header>
          <div className="flex items-center justify-between">
            <div>
              <Card.Title>Rebalance Actions</Card.Title>
              <Card.Description>
                {rebalanceMode === "buy-only"
                  ? "Buy-only recommendations — no selling required."
                  : "Buy & sell recommendations to align with your target allocation."}
              </Card.Description>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Label
                  htmlFor="threshold"
                  className="text-xs whitespace-nowrap"
                >
                  Threshold
                </Label>
                <Input
                  id="threshold"
                  type="number"
                  min={0}
                  max={50}
                  step={0.5}
                  value={threshold}
                  onChange={(e) =>
                    setThreshold(Math.max(0, Number(e.target.value)))
                  }
                  className="w-16 h-8 text-xs tabular-nums"
                />
                <span className="text-xs text-muted-foreground">%</span>
              </div>
              <Tabs
                value={rebalanceMode}
                onValueChange={(v) => setRebalanceMode(v as RebalanceMode)}
              >
                <TabsList>
                  <TabsTrigger value="buy-only">Buy Only</TabsTrigger>
                  <TabsTrigger value="buy-and-sell">Buy & Sell</TabsTrigger>
                </TabsList>
              </Tabs>
            </div>
          </div>
        </Card.Header>
        <Card.Content>
          <RebalanceTable
            assets={portfolio.assets}
            totalToInvest={portfolio.totalToInvest}
            threshold={threshold}
          />
        </Card.Content>
      </Card>
    </div>
  );
}
