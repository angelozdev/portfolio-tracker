import Card from "@/shared/ui/card";
import { formatCurrency } from "@/shared/utils/format";
import type { PortfolioSummary } from "@/types";
import { ArrowUpRight, DollarSign, Target } from "lucide-react";

interface SummaryCardsProps {
  summary: PortfolioSummary;
}

export default function SummaryCards({ summary }: SummaryCardsProps) {
  // Mock day gain for now
  const dayGain = summary.totalValue * 0.012; // +1.2%
  const dayGainPercent = 1.2;

  return (
    <div className="grid gap-4 md:grid-cols-3">
      <Card>
        <Card.Header className="flex flex-row items-center justify-between space-y-0 pb-2">
          <Card.Title className="text-sm font-medium">Total Portfolio Value</Card.Title>
          <DollarSign className="h-4 w-4 text-muted-foreground" />
        </Card.Header>
        <Card.Content>
          <div className="text-2xl font-bold">{formatCurrency(summary.totalValue)}</div>
          <p className="text-xs text-muted-foreground">
            +20.1% from last month
          </p>
        </Card.Content>
      </Card>

      <Card>
        <Card.Header className="flex flex-row items-center justify-between space-y-0 pb-2">
          <Card.Title className="text-sm font-medium">Day Gain</Card.Title>
          <ArrowUpRight className="h-4 w-4 text-green-500" />
        </Card.Header>
        <Card.Content>
          <div className="text-2xl font-bold text-green-500">
            +{formatCurrency(dayGain)}
          </div>
          <p className="text-xs text-muted-foreground">
            +{dayGainPercent}% today
          </p>
        </Card.Content>
      </Card>

      <Card>
        <Card.Header className="flex flex-row items-center justify-between space-y-0 pb-2">
          <Card.Title className="text-sm font-medium">Buying Power Needed</Card.Title>
          <Target className="h-4 w-4 text-muted-foreground" />
        </Card.Header>
        <Card.Content>
          <div className="text-2xl font-bold">
            {formatCurrency(summary.assets.filter(a => a.action === 'buy').reduce((acc, curr) => acc + curr.deltaValue, 0))}
          </div>
          <p className="text-xs text-muted-foreground">
            To reach target allocation
          </p>
        </Card.Content>
      </Card>
    </div>
  );
}
