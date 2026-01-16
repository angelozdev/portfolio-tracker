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
import { Trash2 } from "lucide-react";
import type { Broker } from "@/types";

interface BrokerManagerProps {
  brokers: Broker[];
}

export default function BrokerManager({ brokers }: BrokerManagerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [newBrokerName, setNewBrokerName] = useState("");
  const { createBroker, deleteBroker } = useBrokers();

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newBrokerName.trim()) return;
    
    await createBroker.mutateAsync(newBrokerName);
    setNewBrokerName("");
    setIsOpen(false);
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
              <Button type="submit" disabled={createBroker.isPending}>
                {createBroker.isPending ? "Adding..." : "Add Broker"}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {brokers.map((broker) => (
          <Card key={broker.id}>
            <Card.Content className="flex justify-between items-center p-6">
              <span className="font-medium">{broker.name}</span>
              <Button
                variant="ghost"
                size="icon"
                className="text-destructive hover:text-destructive"
                onClick={() => {
                  if (confirm("Delete this broker?")) {
                    deleteBroker.mutate(broker.id);
                  }
                }}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </Card.Content>
          </Card>
        ))}
      </div>
    </div>
  );
}
