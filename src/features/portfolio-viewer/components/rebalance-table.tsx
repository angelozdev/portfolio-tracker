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
import Button from "@/shared/ui/button";
import { Progress } from "@/shared/ui/progress";
import { formatCurrency, formatPercentage } from "@/shared/utils/format";
import { Copy, Check } from "lucide-react";
import { useState } from "react";

interface RebalanceTableProps {
  assets: AssetPerformance[];
  totalToInvest: number;
  threshold: number;
}

function buildCopyCsv(
  assets: AssetPerformance[],
  totalToInvest: number,
  threshold: number,
) {
  const lines: string[] = [];
  lines.push(
    "Symbol,Name,Price,Value,Allocation,Target,Status,Action,Shares,Diff",
  );
  for (const a of assets) {
    const status =
      a.currentAllocation > a.targetAllocation + threshold
        ? "Overweight"
        : a.currentAllocation < a.targetAllocation - threshold
          ? "Underweight"
          : "Balanced";
    const action =
      a.action === "buy" ? "Buy" : a.action === "sell" ? "Sell" : "Hold";
    const shares =
      a.action === "hold" ? "" : Math.abs(a.deltaShares).toFixed(2);
    lines.push(
      [
        a.symbol,
        `"${a.name}"`,
        a.currentPrice.toFixed(2),
        a.currentValue.toFixed(2),
        a.currentAllocation.toFixed(2) + "%",
        a.targetAllocation.toFixed(2) + "%",
        status,
        action,
        shares,
        a.deltaValue.toFixed(2),
      ].join(","),
    );
  }
  lines.push("");
  lines.push(`Total to invest,${totalToInvest.toFixed(2)}`);
  return lines.join("\n");
}

export default function RebalanceTable({
  assets,
  totalToInvest,
  threshold,
}: RebalanceTableProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(
      buildCopyCsv(assets, totalToInvest, threshold),
    );
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-4">
      <div className="rounded-lg border bg-muted/50 p-4 flex items-center justify-between">
        <span className="text-sm font-medium">
          Total to invest for rebalance
        </span>
        <div className="flex items-center gap-2">
          <span className="text-lg font-bold">
            {formatCurrency(totalToInvest)}
          </span>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleCopy}
            className="h-8 w-8 p-0"
          >
            {copied ? (
              <Check className="h-4 w-4 text-green-500" />
            ) : (
              <Copy className="h-4 w-4" />
            )}
            <span className="sr-only">Copy table</span>
          </Button>
        </div>
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
