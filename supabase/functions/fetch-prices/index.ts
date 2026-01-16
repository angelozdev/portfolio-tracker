const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { symbols } = await req.json();
    if (!symbols || !Array.isArray(symbols) || symbols.length === 0) {
      throw new Error("Missing or invalid 'symbols' array");
    }
    console.log(`Fetching prices for: ${symbols.join(", ")}`);
    // Using Yahoo Finance API (v8)
    // We fetch data for each symbol. In a real app, you'd want to batch this if the API supports it
    // or use a library. For simplicity/MVP, we'll do parallel requests.

    const pricePromises = symbols.map(async (symbol) => {
      try {
        // Yahoo Finance chart API is publicly accessible and robust enough for MVPs
        const response = await fetch(
          `https://query1.finance.yahoo.com/v8/finance/chart/${symbol}?interval=1d&range=1d`
        );

        if (!response.ok) {
          console.error(`Failed to fetch ${symbol}: ${response.statusText}`);
          return { symbol, price: null };
        }
        const data = await response.json();
        const price = data.chart?.result?.[0]?.meta?.regularMarketPrice;
        return { symbol, price: price || null };
      } catch (e) {
        console.error(`Error fetching ${symbol}:`, e);
        return { symbol, price: null };
      }
    });
    const results = await Promise.all(pricePromises);

    const prices: Record<string, number> = {};
    results.forEach((r) => {
      if (r.price !== null) {
        prices[r.symbol] = r.price;
      }
    });
    return new Response(JSON.stringify(prices), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
