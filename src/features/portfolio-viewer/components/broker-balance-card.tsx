import type { BrokerSummary } from '@/types';
import Card from '@/shared/ui/card';
import CardHeader from '@/shared/ui/card/card-header';
import CardTitle from '@/shared/ui/card/card-title';
import CardDescription from '@/shared/ui/card/card-description';
import CardContent from '@/shared/ui/card/card-content';
import BrokerBalanceItem from './broker-balance-item';
import { Building2 } from 'lucide-react';

interface BrokerBalanceCardProps {
  summary: BrokerSummary;
}

export default function BrokerBalanceCard({ summary }: BrokerBalanceCardProps) {
  const hasBrokers = summary.brokers.length > 0;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Building2 className="h-5 w-5" />
          Balance by Broker
        </CardTitle>
        <CardDescription>
          Your portfolio distribution across brokers
        </CardDescription>
      </CardHeader>
      <CardContent>
        {hasBrokers ? (
          <div className="space-y-4">
            {summary.brokers.map((broker) => (
              <BrokerBalanceItem key={broker.brokerId} broker={broker} />
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-muted-foreground">
            <Building2 className="h-12 w-12 mx-auto mb-3 opacity-50" />
            <p className="text-sm">No brokers configured yet.</p>
            <p className="text-xs mt-1">Add brokers in Portfolio Manager.</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
