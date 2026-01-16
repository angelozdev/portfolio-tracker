export interface Broker {
  id: string;
  user_id: string;
  name: string;
  icon?: string;
  created_at: string;
}

export interface Asset {
  id: string;
  user_id: string;
  symbol: string;
  name: string;
  type: 'stock' | 'etf';
  target_percentage: number;
  created_at: string;
}

export interface Holding {
  id: string;
  user_id: string;
  broker_id: string;
  asset_id: string;
  shares: number;
  created_at: string;
}

// Composite types for the frontend
export interface HoldingDetail extends Holding {
  asset: Asset;
  broker: Broker;
}

export interface AssetPerformance {
  assetId: string;
  symbol: string;
  name: string;
  currentPrice: number;
  shares: number;
  currentValue: number;
  currentAllocation: number; // %
  targetAllocation: number; // %
  deltaValue: number; // Amount to buy/sell to reach target
  deltaShares: number; // Shares to buy/sell
  action: 'buy' | 'sell' | 'hold';
}

export interface PortfolioSummary {
  totalValue: number;
  assets: AssetPerformance[];
}

export interface BrokerPerformance {
  brokerId: string;
  brokerName: string;
  brokerIcon?: string;
  totalValue: number;
  percentage: number; // % del portfolio total
  holdingsCount: number; // cantidad de holdings en este broker
  assetsCount: number; // cantidad de assets únicos en este broker
}

export interface BrokerSummary {
  brokers: BrokerPerformance[];
  totalValue: number;
}
