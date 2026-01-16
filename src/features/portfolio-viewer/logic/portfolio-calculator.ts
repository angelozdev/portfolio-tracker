import type {
  Asset,
  Holding,
  PortfolioSummary,
  AssetPerformance,
} from "@/types";

export function calculatePortfolio(
  assets: Asset[],
  holdings: Holding[],
  prices: Record<string, number>
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

  // 3. Calculate Deltas and Actions
  const performance: AssetPerformance[] = assetCalculations.map((item) => {
    const currentAllocation =
      totalValue > 0 ? (item.value / totalValue) * 100 : 0;
    const targetValue = (totalValue * item.asset.target_percentage) / 100;
    const deltaValue = targetValue - item.value;
    const deltaShares = item.price > 0 ? deltaValue / item.price : 0;

    // Threshold for action (e.g. if deviation is < 5% of the target, maybe hold?)
    // For now, simple logic:
    let action: "buy" | "sell" | "hold" = "hold";
    if (deltaValue > item.price)
      action = "buy"; // If we need to buy at least 1 share
    else if (deltaValue < -item.price) action = "sell"; // If we need to sell at least 1 share

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
    assets: performance,
  };
}
