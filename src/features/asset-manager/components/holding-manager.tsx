import { useMemo, useState } from "react";
import { useHoldings } from "../logic/use-holdings";
import Button from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";
import { Label } from "@/shared/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/shared/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/shared/ui/table";
import { Trash2, Loader2, Wallet, Plus } from "lucide-react";
import type { Asset, Broker, Holding } from "@/types";
import ConfirmDialog from "@/shared/ui/confirm-dialog";
import { toast } from "sonner";

const rtf = new Intl.RelativeTimeFormat("es", { numeric: "auto" });

function formatRelativeDate(dateStr: string) {
  const now = Date.now();
  const diffSec = (new Date(dateStr).getTime() - now) / 1000;
  const absSec = Math.abs(diffSec);

  if (absSec < 60) return rtf.format(Math.round(diffSec), "second");
  if (absSec < 3600) return rtf.format(Math.round(diffSec / 60), "minute");
  if (absSec < 86400) return rtf.format(Math.round(diffSec / 3600), "hour");
  if (absSec < 2592000) return rtf.format(Math.round(diffSec / 86400), "day");
  return rtf.format(Math.round(diffSec / 2592000), "month");
}

interface HoldingManagerProps {
  holdings: Holding[];
  assets: Asset[];
  brokers: Broker[];
}

export default function HoldingManager({
  holdings,
  assets,
  brokers,
}: HoldingManagerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [newHolding, setNewHolding] = useState<Partial<Holding>>({});
  const [deleteTarget, setDeleteTarget] = useState<Holding | null>(null);

  const { createHolding, updateHolding, deleteHolding } = useHoldings();

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newHolding.asset_id || !newHolding.broker_id) return;

    try {
      await createHolding.mutateAsync({
        asset_id: newHolding.asset_id,
        broker_id: newHolding.broker_id,
        shares: Number(newHolding.shares || 0),
      });
      const symbol = assetMap.get(newHolding.asset_id) ?? newHolding.asset_id;
      toast.success(`Holding for "${symbol}" created`);
      setNewHolding({});
      setIsOpen(false);
    } catch {
      toast.error("Failed to create holding");
    }
  };

  const handleSharesUpdate = async (holding: Holding, newValue: number) => {
    if (newValue === Number(holding.shares)) return;
    try {
      await updateHolding.mutateAsync({ id: holding.id, shares: newValue });
      toast.success(`Shares updated to ${newValue}`);
    } catch {
      toast.error("Failed to update shares");
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await deleteHolding.mutateAsync(deleteTarget.id);
      toast.success("Holding deleted");
    } catch {
      toast.error("Failed to delete holding");
    } finally {
      setDeleteTarget(null);
    }
  };

  const assetMap = useMemo(
    () => new Map(assets.map((a) => [a.id, a.symbol])),
    [assets],
  );
  const brokerMap = useMemo(
    () => new Map(brokers.map((b) => [b.id, b.name])),
    [brokers],
  );

  const sortedHoldings = [...holdings].sort(
    (a, b) =>
      new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
  );

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium">Holdings Inventory</h3>
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button size="sm">Add Holding</Button>
          </DialogTrigger>
          <DialogContent aria-describedby={undefined}>
            <DialogHeader>
              <DialogTitle>Add New Holding</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleCreate} className="space-y-4 pt-4">
              <div className="space-y-2">
                <Label>Asset</Label>
                <Select
                  value={newHolding.asset_id}
                  onValueChange={(v) =>
                    setNewHolding({ ...newHolding, asset_id: v })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select Asset" />
                  </SelectTrigger>
                  <SelectContent>
                    {assets.map((a) => (
                      <SelectItem key={a.id} value={a.id}>
                        {a.symbol} - {a.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Broker</Label>
                <Select
                  value={newHolding.broker_id}
                  onValueChange={(v) =>
                    setNewHolding({ ...newHolding, broker_id: v })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select Broker" />
                  </SelectTrigger>
                  <SelectContent>
                    {brokers.map((b) => (
                      <SelectItem key={b.id} value={b.id}>
                        {b.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Shares</Label>
                <Input
                  type="number"
                  step="0.0001"
                  value={newHolding.shares || ""}
                  onChange={(e) =>
                    setNewHolding({
                      ...newHolding,
                      shares: Number(e.target.value),
                    })
                  }
                />
              </div>

              <Button type="submit" disabled={createHolding.isPending}>
                {createHolding.isPending ? (
                  <>
                    <Loader2 aria-hidden="true" className="h-4 w-4 animate-spin mr-2" />
                    Adding…
                  </>
                ) : (
                  "Add Holding"
                )}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {sortedHoldings.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <Wallet aria-hidden="true" className="h-10 w-10 text-muted-foreground mb-3" />
          <p className="text-sm font-medium">No holdings yet</p>
          <p className="text-xs text-muted-foreground mt-1">
            Add a holding to track your shares across brokers.
          </p>
          <Button
            size="sm"
            variant="outline"
            className="mt-4"
            onClick={() => setIsOpen(true)}
          >
            <Plus className="h-4 w-4 mr-1" />
            Add Holding
          </Button>
        </div>
      ) : (
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Asset</TableHead>
                <TableHead>Broker</TableHead>
                <TableHead>Shares</TableHead>
                <TableHead>Created</TableHead>
                <TableHead className="w-[50px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sortedHoldings.map((holding) => (
                <TableRow key={holding.id}>
                  <TableCell className="font-medium">
                    {assetMap.get(holding.asset_id) ?? holding.asset_id}
                  </TableCell>
                  <TableCell>
                    {brokerMap.get(holding.broker_id) ?? holding.broker_id}
                  </TableCell>
                  <TableCell>
                    <Input
                      type="number"
                      aria-label={`Shares for ${assetMap.get(holding.asset_id) ?? "asset"}`}
                      className="w-24 h-8"
                      defaultValue={holding.shares}
                      onBlur={(e) =>
                        handleSharesUpdate(holding, Number(e.target.value))
                      }
                    />
                  </TableCell>
                  <TableCell className="text-muted-foreground text-sm">
                    {formatRelativeDate(holding.created_at)}
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="ghost"
                      size="icon"
                      aria-label={`Delete holding for ${assetMap.get(holding.asset_id) ?? "asset"}`}
                      className="h-8 w-8 text-destructive hover:bg-destructive/10"
                      onClick={() => setDeleteTarget(holding)}
                    >
                      <Trash2 aria-hidden="true" className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      <ConfirmDialog
        open={!!deleteTarget}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        title="Delete holding"
        description="Are you sure you want to delete this holding? This action cannot be undone."
        confirmLabel="Delete"
        variant="destructive"
        onConfirm={handleDelete}
      />
    </div>
  );
}
