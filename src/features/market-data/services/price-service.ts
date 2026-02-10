import { supabase } from "@/shared/infra/supabase-client";

export async function fetchCurrentPrices(
  symbols: string[],
): Promise<Record<string, number>> {
  if (symbols.length === 0) return {};

  const { data, error } = await supabase.functions.invoke("fetch-prices", {
    body: { symbols },
  });

  if (error) {
    console.error("Failed to fetch prices from Edge Function:", error);
    throw new Error(
      "Unable to fetch current prices. Please check your internet connection and try again.",
    );
  }

  if (!data) {
    throw new Error("No price data received from server.");
  }

  return data;
}
