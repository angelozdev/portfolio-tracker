import type { AssetPerformance } from "@/types";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/shared/ui/table";
import Badge from "@/shared/ui/badge";
import { Progress } from "@/shared/ui/progress";
import { formatCurrency, formatPercentage } from "@/shared/utils/format";

interface RebalanceTableProps {
  assets: AssetPerformance[];
  totalToInvest: number;
  threshold: number;
}

export default function RebalanceTable({
  assets,
  totalToInvest,
  threshold,
}: RebalanceTableProps) {
  return (
    <div className="space-y-4">
      <div className="rounded-lg border bg-muted/50 p-4 flex items-center justify-between">
        <span className="text-sm font-medium">
          Total to invest for rebalance
        </span>
        <span className="text-lg font-bold">
          {formatCurrency(totalToInvest)}
        </span>
      </div>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Asset</TableHead>
              <TableHead>Price</TableHead>
              <TableHead>Value</TableHead>
              <TableHead>Allocation (Target)</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {assets.map((asset) => (
              <TableRow key={asset.assetId}>
                <TableCell className="font-medium">
                  <div>{asset.symbol}</div>
                  <div className="text-xs text-muted-foreground">
                    {asset.name}
                  </div>
                </TableCell>
                <TableCell>{formatCurrency(asset.currentPrice)}</TableCell>
                <TableCell>{formatCurrency(asset.currentValue)}</TableCell>
                <TableCell className="w-[200px]">
                  <div className="flex flex-col gap-1">
                    <div className="flex justify-between text-xs tabular-nums">
                      <span>{formatPercentage(asset.currentAllocation)}</span>
                      <span className="text-muted-foreground">
                        / {formatPercentage(asset.targetAllocation)}
                      </span>
                    </div>
                    <Progress
                      value={
                        asset.targetAllocation > 0
                          ? (asset.currentAllocation / asset.targetAllocation) *
                            100
                          : 0
                      }
                      className="h-2"
                    />
                    {(() => {
                      const diff =
                        asset.currentAllocation - asset.targetAllocation;
                      const sign = diff > 0 ? "+" : "";
                      const color =
                        diff > threshold
                          ? "text-red-500"
                          : diff < -threshold
                            ? "text-green-500"
                            : "text-muted-foreground";
                      return (
                        <span className={`text-xs tabular-nums ${color}`}>
                          {sign}
                          {formatPercentage(diff)} vs target
                        </span>
                      );
                    })()}
                  </div>
                </TableCell>
                <TableCell>
                  <div className="text-xs font-medium">
                    {asset.currentAllocation >
                    asset.targetAllocation + threshold ? (
                      <span className="text-red-500">Overweight</span>
                    ) : asset.currentAllocation <
                      asset.targetAllocation - threshold ? (
                      <span className="text-green-500">Underweight</span>
                    ) : (
                      <span className="text-muted-foreground">Balanced</span>
                    )}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    Diff: {formatCurrency(asset.deltaValue)}
                  </div>
                </TableCell>
                <TableCell className="text-right">
                  {asset.action === "buy" ? (
                    <Badge variant="success">
                      Buy {asset.deltaShares.toFixed(2)}
                    </Badge>
                  ) : asset.action === "sell" ? (
                    <Badge variant="destructive">
                      Sell {Math.abs(asset.deltaShares).toFixed(2)}
                    </Badge>
                  ) : (
                    <Badge variant="secondary">Hold</Badge>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
