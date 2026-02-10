import type { BrokerPerformance } from "@/types";
import { Progress } from "@/shared/ui/progress";
import { formatCurrency } from "@/shared/utils/format";
import { Building2 } from "lucide-react";

interface BrokerBalanceItemProps {
  broker: BrokerPerformance;
}

export default function BrokerBalanceItem({ broker }: BrokerBalanceItemProps) {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {broker.brokerIcon ? (
            <span className="text-lg">{broker.brokerIcon}</span>
          ) : (
            <Building2 aria-hidden="true" className="h-4 w-4 text-muted-foreground" />
          )}
          <span className="font-medium">{broker.brokerName}</span>
          <span className="text-sm text-muted-foreground">
            {broker.assetsCount} {broker.assetsCount === 1 ? "asset" : "assets"}{" "}
            • {broker.holdingsCount}{" "}
            {broker.holdingsCount === 1 ? "holding" : "holdings"}
          </span>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-xl font-bold tabular-nums">
            {formatCurrency(broker.totalValue)}
          </span>
          <span className="text-sm text-muted-foreground min-w-[3rem] text-right tabular-nums">
            {new Intl.NumberFormat(undefined, { minimumFractionDigits: 1, maximumFractionDigits: 1 }).format(broker.percentage)}%
          </span>
        </div>
      </div>
      <Progress value={broker.percentage} className="h-2" />
    </div>
  );
}
