import Card from "@/shared/ui/card";
import { formatCurrency } from "@/shared/utils/format";
import type { PortfolioSummary } from "@/types";
import { TrendingUp, DollarSign, Target } from "lucide-react";

interface SummaryCardsProps {
  summary: PortfolioSummary;
}

export default function SummaryCards({ summary }: SummaryCardsProps) {
  return (
    <div className="grid gap-4 md:grid-cols-3">
      <Card>
        <Card.Header className="flex flex-row items-center justify-between space-y-0 pb-2">
          <Card.Title className="text-sm font-medium">
            Total Portfolio Value
          </Card.Title>
          <DollarSign aria-hidden="true" className="h-4 w-4 text-muted-foreground" />
        </Card.Header>
        <Card.Content>
          <div className="text-2xl font-bold">
            {formatCurrency(summary.totalValue)}
          </div>
          <p className="text-xs text-muted-foreground">
            Your total portfolio value
          </p>
        </Card.Content>
      </Card>

      <Card>
        <Card.Header className="flex flex-row items-center justify-between space-y-0 pb-2">
          <Card.Title className="text-sm font-medium">
            Performance Tracking
          </Card.Title>
          <TrendingUp aria-hidden="true" className="h-4 w-4 text-muted-foreground" />
        </Card.Header>
        <Card.Content>
          <p className="text-sm text-muted-foreground mb-2">
            Track daily gains and losses
          </p>
          <p className="text-xs text-amber-600">
            📊 Historical price data coming soon
          </p>
        </Card.Content>
      </Card>

      <Card>
        <Card.Header className="flex flex-row items-center justify-between space-y-0 pb-2">
          <Card.Title className="text-sm font-medium">
            Buying Power Needed
          </Card.Title>
          <Target aria-hidden="true" className="h-4 w-4 text-muted-foreground" />
        </Card.Header>
        <Card.Content>
          <div className="text-2xl font-bold">
            {formatCurrency(
              summary.assets
                .filter((a) => a.action === "buy")
                .reduce((acc, curr) => acc + curr.deltaValue, 0)
            )}
          </div>
          <p className="text-xs text-muted-foreground">
            To reach target allocation
          </p>
        </Card.Content>
      </Card>
    </div>
  );
}
