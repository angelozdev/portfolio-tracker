import type {
  Asset,
  Holding,
  PortfolioSummary,
  AssetPerformance,
  RebalanceMode,
} from "@/types";

export const DEFAULT_OVERWEIGHT_THRESHOLD = 2;

export function calculatePortfolio(
  assets: Asset[],
  holdings: Holding[],
  prices: Record<string, number>,
  mode: RebalanceMode = "buy-and-sell",
  threshold: number = DEFAULT_OVERWEIGHT_THRESHOLD,
): PortfolioSummary {
  // 1. Aggregate holdings by Asset (handle multi-broker cases)
  const assetHoldings = new Map<string, number>(); // assetId -> totalShares

  holdings.forEach((h) => {
    const current = assetHoldings.get(h.asset_id) || 0;
    assetHoldings.set(h.asset_id, current + Number(h.shares));
  });

  // 2. Calculate Total Portfolio Value
  let totalValue = 0;
  const assetCalculations: Array<{
    asset: Asset;
    shares: number;
    value: number;
    price: number;
  }> = [];

  assets.forEach((asset) => {
    const shares = assetHoldings.get(asset.id) || 0;
    const price = prices[asset.symbol] || 0;
    const value = shares * price;

    totalValue += value;

    assetCalculations.push({
      asset,
      shares,
      value,
      price,
    });
  });

  // 2.5 Identify overweight assets (only relevant in buy-and-sell mode)
  const overweightAssetIds = new Set<string>();
  if (mode === "buy-and-sell") {
    assetCalculations.forEach((item) => {
      const currentAllocation =
        totalValue > 0 ? (item.value / totalValue) * 100 : 0;
      if (currentAllocation > item.asset.target_percentage + threshold) {
        overweightAssetIds.add(item.asset.id);
      }
    });
  }

  // 3. Buy-only rebalance: find the new total T so no asset needs selling
  // T_i = currentValue_i * 100 / target_i; T = max(T_i)
  let buyOnlyTotal = totalValue;
  assetCalculations.forEach((item) => {
    if (
      item.asset.target_percentage > 0 &&
      !overweightAssetIds.has(item.asset.id)
    ) {
      const requiredTotal = (item.value * 100) / item.asset.target_percentage;
      if (requiredTotal > buyOnlyTotal) buyOnlyTotal = requiredTotal;
    }
  });

  const totalToInvest = buyOnlyTotal - totalValue;

  // 4. Calculate Deltas and Actions (buy-only)
  const performance: AssetPerformance[] = assetCalculations.map((item) => {
    const currentAllocation =
      totalValue > 0 ? (item.value / totalValue) * 100 : 0;
    const isOverweight = overweightAssetIds.has(item.asset.id);

    const targetValue = isOverweight
      ? (totalValue * item.asset.target_percentage) / 100
      : (buyOnlyTotal * item.asset.target_percentage) / 100;
    const deltaValue = targetValue - item.value;
    const deltaShares = item.price > 0 ? deltaValue / item.price : 0;

    const action: "buy" | "sell" | "hold" = isOverweight
      ? "sell"
      : deltaValue > item.price
        ? "buy"
        : "hold";

    return {
      assetId: item.asset.id,
      symbol: item.asset.symbol,
      name: item.asset.name,
      currentPrice: item.price,
      shares: item.shares,
      currentValue: item.value,
      currentAllocation,
      targetAllocation: item.asset.target_percentage,
      deltaValue,
      deltaShares,
      action,
    };
  });

  // Sort by biggest buying opportunity first
  performance.sort((a, b) => b.deltaValue - a.deltaValue);

  return {
    totalValue,
    totalToInvest,
    assets: performance,
  };
}
