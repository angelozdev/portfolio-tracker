import { useState } from "react";
import { useAssets } from "../logic/use-assets";
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
import {
  Trash2,
  AlertTriangle,
  CheckCircle2,
  Loader2,
  PackageOpen,
  Plus,
} from "lucide-react";
import type { Asset } from "@/types";
import { cn } from "@/shared/utils/cn";
import ConfirmDialog from "@/shared/ui/confirm-dialog";
import { toast } from "sonner";

interface AssetManagerProps {
  assets: Asset[];
}

export default function AssetManager({ assets }: AssetManagerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Asset | null>(null);
  const [newAsset, setNewAsset] = useState<Partial<Asset>>({
    type: "stock",
    target_percentage: 0,
  });

  // Local state for batch editing
  const [localAssets, setLocalAssets] = useState<Asset[]>(assets);
  const [prevAssets, setPrevAssets] = useState(assets);
  const [hasChanges, setHasChanges] = useState(false);

  // Sync local state when props change
  // Pattern: https://react.dev/reference/react/useState#storing-information-from-previous-renders
  if (assets !== prevAssets) {
    setPrevAssets(assets);
    setLocalAssets(assets);
    setHasChanges(false);
  }

  const { createAsset, updateAsset, deleteAsset } = useAssets();

  // Calculate total allocation
  const totalAllocation = localAssets.reduce(
    (sum, a) => sum + Number(a.target_percentage),
    0,
  );
  const isValid = Math.abs(totalAllocation - 100) < 0.01; // Float tolerance

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAsset.symbol || !newAsset.name) return;

    try {
      await createAsset.mutateAsync({
        symbol: newAsset.symbol.toUpperCase(),
        name: newAsset.name,
        type: newAsset.type as "stock" | "etf",
        target_percentage: Number(newAsset.target_percentage),
      });
      toast.success(`Asset "${newAsset.symbol?.toUpperCase()}" created`);
      setNewAsset({
        type: "stock",
        target_percentage: 0,
        symbol: "",
        name: "",
      });
      setIsOpen(false);
    } catch {
      toast.error("Failed to create asset");
    }
  };

  const handleLocalUpdate = (id: string, newTarget: number) => {
    setLocalAssets((prev) =>
      prev.map((a) =>
        a.id === id ? { ...a, target_percentage: newTarget } : a,
      ),
    );
    setHasChanges(true);
  };

  const handleSaveChanges = async () => {
    if (!isValid) return;

    try {
      const promises = localAssets.map((local) => {
        const original = assets.find((a) => a.id === local.id);
        if (
          original &&
          original.target_percentage !== local.target_percentage
        ) {
          return updateAsset.mutateAsync({
            id: local.id,
            target_percentage: local.target_percentage,
          });
        }
        return Promise.resolve();
      });

      await Promise.all(promises);
      setHasChanges(false);
      toast.success("Allocations saved");
    } catch {
      toast.error("Failed to save allocations");
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await deleteAsset.mutateAsync(deleteTarget.id);
      toast.success(`Asset "${deleteTarget.symbol}" deleted`);
    } catch {
      toast.error("Failed to delete asset");
    } finally {
      setDeleteTarget(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-start">
        <div className="space-y-1">
          <h3 className="text-lg font-medium">Assets & Targets</h3>
          {localAssets.length > 0 && (
            <div
              className={cn(
                "flex items-center gap-2 text-sm font-medium transition-colors duration-200",
                isValid ? "text-green-600" : "text-amber-600",
              )}
            >
              {isValid ? (
                <CheckCircle2 aria-hidden="true" className="h-4 w-4" />
              ) : (
                <AlertTriangle aria-hidden="true" className="h-4 w-4" />
              )}
              Total Allocation: {totalAllocation.toFixed(2)}%
            </div>
          )}
          {!isValid && localAssets.length > 0 && (
            <p className="text-xs text-muted-foreground">
              Must equal 100% to save changes.
            </p>
          )}
        </div>

        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button size="sm">Add Asset</Button>
          </DialogTrigger>
          <DialogContent aria-describedby={undefined}>
            <DialogHeader>
              <DialogTitle>Add New Asset</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleCreate} className="space-y-4 pt-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="symbol">Symbol</Label>
                  <Input
                    id="symbol"
                    placeholder="AAPL"
                    value={newAsset.symbol || ""}
                    onChange={(e) =>
                      setNewAsset({ ...newAsset, symbol: e.target.value })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="type">Type</Label>
                  <Select
                    value={newAsset.type}
                    onValueChange={(v) =>
                      setNewAsset({ ...newAsset, type: v as "stock" | "etf" })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="stock">Stock</SelectItem>
                      <SelectItem value="etf">ETF</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  placeholder="Apple Inc."
                  value={newAsset.name || ""}
                  onChange={(e) =>
                    setNewAsset({ ...newAsset, name: e.target.value })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="target">Initial Target (%)</Label>
                <Input
                  id="target"
                  type="number"
                  step="0.01"
                  value={newAsset.target_percentage || ""}
                  onChange={(e) =>
                    setNewAsset({
                      ...newAsset,
                      target_percentage: Number(e.target.value),
                    })
                  }
                />
                <p className="text-[10px] text-muted-foreground">
                  Tip: Set to 0 and rebalance table later to maintain 100%.
                </p>
              </div>
              <Button type="submit" disabled={createAsset.isPending}>
                {createAsset.isPending ? (
                  <>
                    <Loader2 aria-hidden="true" className="h-4 w-4 animate-spin mr-2" />
                    Adding…
                  </>
                ) : (
                  "Add Asset"
                )}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {localAssets.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <PackageOpen aria-hidden="true" className="h-10 w-10 text-muted-foreground mb-3" />
          <p className="text-sm font-medium">No assets yet</p>
          <p className="text-xs text-muted-foreground mt-1">
            Add your first asset to define target allocations.
          </p>
          <Button
            size="sm"
            variant="outline"
            className="mt-4"
            onClick={() => setIsOpen(true)}
          >
            <Plus className="h-4 w-4 mr-1" />
            Add Asset
          </Button>
        </div>
      ) : (
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Symbol</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Target %</TableHead>
                <TableHead className="w-[50px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {localAssets.map((asset) => (
                <TableRow key={asset.id}>
                  <TableCell className="font-medium">{asset.symbol}</TableCell>
                  <TableCell>{asset.name}</TableCell>
                  <TableCell className="capitalize">{asset.type}</TableCell>
                  <TableCell>
                    <Input
                      type="number"
                      step="0.01"
                      aria-label={`Target percentage for ${asset.symbol}`}
                      className={cn(
                        "w-24 h-8 transition-colors",
                        !isValid &&
                          "border-amber-500 focus-visible:ring-amber-500",
                      )}
                      value={asset.target_percentage}
                      onChange={(e) =>
                        handleLocalUpdate(asset.id, Number(e.target.value))
                      }
                    />
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="ghost"
                      size="icon"
                      aria-label={`Delete ${asset.symbol}`}
                      className="h-8 w-8 text-destructive hover:bg-destructive/10"
                      onClick={() => setDeleteTarget(asset)}
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

      {hasChanges && (
        <div className="flex justify-end gap-2 animate-in fade-in slide-in-from-bottom-2">
          <Button
            variant="ghost"
            onClick={() => {
              setLocalAssets(assets); // Reset
              setHasChanges(false);
            }}
          >
            Reset
          </Button>
          <Button
            onClick={handleSaveChanges}
            disabled={!isValid || updateAsset.isPending}
            className={cn(!isValid && "opacity-50 cursor-not-allowed")}
          >
            {updateAsset.isPending ? (
              <>
                <Loader2 aria-hidden="true" className="h-4 w-4 animate-spin mr-2" />
                Saving…
              </>
            ) : (
              "Save Allocations"
            )}
          </Button>
        </div>
      )}

      <ConfirmDialog
        open={!!deleteTarget}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        title="Delete asset"
        description={`Are you sure you want to delete "${deleteTarget?.symbol}"? This action cannot be undone.`}
        confirmLabel="Delete"
        variant="destructive"
        onConfirm={handleDelete}
      />
    </div>
  );
}
