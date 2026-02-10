import { useState } from "react";
import { useBrokers } from "../logic/use-brokers";
import Button from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";
import { Label } from "@/shared/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/shared/ui/dialog";
import Card from "@/shared/ui/card";
import { Trash2, Building2, Plus, Loader2 } from "lucide-react";
import type { Broker } from "@/types";
import ConfirmDialog from "@/shared/ui/confirm-dialog";
import { toast } from "sonner";

interface BrokerManagerProps {
  brokers: Broker[];
}

export default function BrokerManager({ brokers }: BrokerManagerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [newBrokerName, setNewBrokerName] = useState("");
  const [newBrokerIcon, setNewBrokerIcon] = useState("");
  const [deleteTarget, setDeleteTarget] = useState<Broker | null>(null);
  const { createBroker, deleteBroker } = useBrokers();

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newBrokerName.trim()) return;

    try {
      await createBroker.mutateAsync({
        name: newBrokerName,
        icon: newBrokerIcon.trim() || undefined,
      });
      toast.success(`Broker "${newBrokerName}" created`);
      setNewBrokerName("");
      setNewBrokerIcon("");
      setIsOpen(false);
    } catch {
      toast.error("Failed to create broker");
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await deleteBroker.mutateAsync(deleteTarget.id);
      toast.success(`Broker "${deleteTarget.name}" deleted`);
    } catch {
      toast.error("Failed to delete broker");
    } finally {
      setDeleteTarget(null);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium">Your Brokers</h3>
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button size="sm">Add Broker</Button>
          </DialogTrigger>
          <DialogContent aria-describedby={undefined}>
            <DialogHeader>
              <DialogTitle>Add New Broker</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleCreate} className="space-y-4 pt-4">
              <div className="space-y-2">
                <Label htmlFor="name">Broker Name</Label>
                <Input
                  id="name"
                  placeholder="e.g. Fidelity, Robinhood"
                  value={newBrokerName}
                  onChange={(e) => setNewBrokerName(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="icon">Icon (optional)</Label>
                <Input
                  id="icon"
                  placeholder="e.g. 🏦 💰 📊"
                  value={newBrokerIcon}
                  onChange={(e) => setNewBrokerIcon(e.target.value)}
                  maxLength={2}
                />
                <p className="text-xs text-muted-foreground">
                  Enter an emoji to represent this broker
                </p>
              </div>
              <Button type="submit" disabled={createBroker.isPending}>
                {createBroker.isPending ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    Adding...
                  </>
                ) : (
                  "Add Broker"
                )}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {brokers.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <Building2 className="h-10 w-10 text-muted-foreground mb-3" />
          <p className="text-sm font-medium">No brokers yet</p>
          <p className="text-xs text-muted-foreground mt-1">
            Add your first broker to start tracking holdings.
          </p>
          <Button
            size="sm"
            variant="outline"
            className="mt-4"
            onClick={() => setIsOpen(true)}
          >
            <Plus className="h-4 w-4 mr-1" />
            Add Broker
          </Button>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {brokers.map((broker) => (
            <Card
              key={broker.id}
              className="transition-shadow duration-200 hover:shadow-md"
            >
              <Card.Content className="flex justify-between items-center p-6">
                <div className="flex items-center gap-2">
                  {broker.icon ? (
                    <span className="text-xl">{broker.icon}</span>
                  ) : (
                    <Building2 className="h-5 w-5 text-muted-foreground" />
                  )}
                  <span className="font-medium">{broker.name}</span>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-destructive hover:text-destructive hover:bg-destructive/10"
                  onClick={() => setDeleteTarget(broker)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </Card.Content>
            </Card>
          ))}
        </div>
      )}

      <ConfirmDialog
        open={!!deleteTarget}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        title="Delete broker"
        description={`Are you sure you want to delete "${deleteTarget?.name}"? This action cannot be undone.`}
        confirmLabel="Delete"
        variant="destructive"
        onConfirm={handleDelete}
      />
    </div>
  );
}
