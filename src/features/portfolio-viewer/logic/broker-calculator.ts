import type {
  Holding,
  Broker,
  Asset,
  BrokerSummary,
  BrokerPerformance,
} from '@/types';

/**
 * Calcula el resumen de balances por broker
 * 
 * @param holdings - Array de holdings del usuario
 * @param brokers - Array de brokers del usuario
 * @param prices - Mapa de precios actuales por symbol (symbol -> price)
 * @param assets - Array de assets para obtener el symbol de cada asset_id
 * @returns BrokerSummary con el balance de cada broker
 */
export function calculateBrokerSummary(
  holdings: Holding[],
  brokers: Broker[],
  prices: Record<string, number>,
  assets: Asset[]
): BrokerSummary {
  // Crear mapa de asset_id -> symbol para lookup rápido
  const assetMap = new Map<string, string>();
  assets.forEach((asset) => {
    assetMap.set(asset.id, asset.symbol);
  });

  // Crear mapa de broker_id -> broker para lookup rápido
  const brokerMap = new Map<string, Broker>();
  brokers.forEach((broker) => {
    brokerMap.set(broker.id, broker);
  });

  // Agrupar holdings por broker_id
  const brokerHoldings = new Map<string, Holding[]>();
  holdings.forEach((holding) => {
    const current = brokerHoldings.get(holding.broker_id) || [];
    current.push(holding);
    brokerHoldings.set(holding.broker_id, current);
  });

  // Calcular performance de cada broker
  const brokerPerformances: BrokerPerformance[] = [];
  let totalPortfolioValue = 0;

  brokerHoldings.forEach((holdingsInBroker, brokerId) => {
    const broker = brokerMap.get(brokerId);
    if (!broker) return; // Skip si el broker no existe (edge case)

    let brokerTotalValue = 0;
    const uniqueAssets = new Set<string>(); // Para contar assets únicos

    // Sumar valor de todos los holdings del broker
    holdingsInBroker.forEach((holding) => {
      const symbol = assetMap.get(holding.asset_id);
      const price = symbol ? prices[symbol] : 0;
      const value = Number(holding.shares) * price;
      brokerTotalValue += value;
      
      // Agregar asset_id al set de únicos
      uniqueAssets.add(holding.asset_id);
    });

    totalPortfolioValue += brokerTotalValue;

    brokerPerformances.push({
      brokerId: broker.id,
      brokerName: broker.name,
      brokerIcon: broker.icon,
      totalValue: brokerTotalValue,
      percentage: 0, // Se calculará después
      holdingsCount: holdingsInBroker.length,
      assetsCount: uniqueAssets.size, // Cantidad de assets únicos
    });
  });

  // Calcular porcentajes
  brokerPerformances.forEach((broker) => {
    broker.percentage =
      totalPortfolioValue > 0
        ? (broker.totalValue / totalPortfolioValue) * 100
        : 0;
  });

  // Ordenar por valor descendente (mayor -> menor)
  brokerPerformances.sort((a, b) => b.totalValue - a.totalValue);

  return {
    brokers: brokerPerformances,
    totalValue: totalPortfolioValue,
  };
}
