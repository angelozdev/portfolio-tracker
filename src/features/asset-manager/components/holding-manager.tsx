import { useState } from "react";
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
import { Trash2 } from "lucide-react";
import type { Asset, Broker, Holding } from "@/types";

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

  const { createHolding, updateHolding, deleteHolding } = useHoldings();

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newHolding.asset_id || !newHolding.broker_id) return;

    await createHolding.mutateAsync({
      asset_id: newHolding.asset_id,
      broker_id: newHolding.broker_id,
      shares: Number(newHolding.shares || 0),
    });

    setNewHolding({});
    setIsOpen(false);
  };

  const getAssetName = (id: string) =>
    assets.find((a) => a.id === id)?.symbol || id;

  const getBrokerName = (id: string) =>
    brokers.find((b) => b.id === id)?.name || id;

  const sortedHoldings = [...holdings].sort(
    (a, b) =>
      new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
  );

  const now = new Date();
  const rtf = new Intl.RelativeTimeFormat("es", { numeric: "auto" });

  const formatRelativeDate = (dateStr: string) => {
    const diffSec = (new Date(dateStr).getTime() - now.getTime()) / 1000;
    const absSec = Math.abs(diffSec);

    if (absSec < 60) return rtf.format(Math.round(diffSec / 1), "second");
    if (absSec < 3600) return rtf.format(Math.round(diffSec / 60), "minute");
    if (absSec < 86400) return rtf.format(Math.round(diffSec / 3600), "hour");
    if (absSec < 2592000) return rtf.format(Math.round(diffSec / 86400), "day");
    return rtf.format(Math.round(diffSec / 2592000), "month");
  };

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
                {createHolding.isPending ? "Adding..." : "Add Holding"}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

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
                  {getAssetName(holding.asset_id)}
                </TableCell>
                <TableCell>{getBrokerName(holding.broker_id)}</TableCell>
                <TableCell>
                  <Input
                    type="number"
                    className="w-24 h-8"
                    defaultValue={holding.shares}
                    onBlur={(e) => {
                      const val = Number(e.target.value);
                      if (val !== Number(holding.shares)) {
                        updateHolding.mutate({ id: holding.id, shares: val });
                      }
                    }}
                  />
                </TableCell>
                <TableCell className="text-muted-foreground text-sm">
                  {formatRelativeDate(holding.created_at)}
                </TableCell>
                <TableCell>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-destructive"
                    onClick={() => {
                      if (confirm("Delete this holding?"))
                        deleteHolding.mutate(holding.id);
                    }}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
