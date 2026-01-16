import { supabase } from "@/shared/infra/supabase-client";

// Mock fallbacks in case the Edge Function isn't deployed yet
const MOCK_PRICES: Record<string, number> = {
  AAPL: 175.5,
  TSLA: 240.0,
  VTI: 225.1,
  VXUS: 55.2,
  BND: 72.8,
  SPY: 440.0,
  QQQ: 370.0,
  GOOGL: 135.0,
  MSFT: 330.0,
  AMZN: 130.0,
  NVDA: 450.0,
};

export async function fetchCurrentPrices(
  symbols: string[]
): Promise<Record<string, number>> {
  if (symbols.length === 0) return {};

  try {
    const { data, error } = await supabase.functions.invoke("fetch-prices", {
      body: { symbols },
    });

    if (error) {
      console.warn("Edge Function error:", error);
      throw error;
    }

    if (!data) return {};
    return data;
  } catch (err) {
    console.error(
      "Failed to fetch prices from Edge Function, falling back to mock data.",
      err
    );

    // Fallback logic
    const prices: Record<string, number> = {};
    symbols.forEach((symbol) => {
      prices[symbol] =
        MOCK_PRICES[symbol.toUpperCase()] || Math.random() * 100 + 50;
    });
    return prices;
  }
}
