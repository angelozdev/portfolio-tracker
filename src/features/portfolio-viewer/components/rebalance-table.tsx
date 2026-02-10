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
}

export default function RebalanceTable({ assets }: RebalanceTableProps) {
  return (
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
                <div className="text-xs text-muted-foreground">{asset.name}</div>
              </TableCell>
              <TableCell>{formatCurrency(asset.currentPrice)}</TableCell>
              <TableCell>{formatCurrency(asset.currentValue)}</TableCell>
              <TableCell className="w-[200px]">
                <div className="flex flex-col gap-1">
                  <div className="flex justify-between text-xs">
                    <span>{formatPercentage(asset.currentAllocation)}</span>
                    <span className="text-muted-foreground">
                      / {formatPercentage(asset.targetAllocation)}
                    </span>
                  </div>
                  <Progress value={asset.targetAllocation > 0 ? (asset.currentAllocation / asset.targetAllocation) * 100 : 0} className="h-2" />
                </div>
              </TableCell>
              <TableCell>
                <div className="text-xs font-medium">
                    {asset.deltaValue > 0 ? (
                        <span className="text-green-500">Underweight</span>
                    ) : (
                        <span className="text-red-500">Overweight</span>
                    )}
                </div>
                <div className="text-xs text-muted-foreground">
                    Diff: {formatCurrency(asset.deltaValue)}
                </div>
              </TableCell>
              <TableCell className="text-right">
                {asset.action === "buy" && (
                  <Badge variant="success">Buy {Math.ceil(asset.deltaShares)}</Badge>
                )}
                {asset.action === "sell" && (
                  <Badge variant="destructive">Sell {Math.floor(Math.abs(asset.deltaShares))}</Badge>
                )}
                {asset.action === "hold" && <Badge variant="secondary">Hold</Badge>}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
