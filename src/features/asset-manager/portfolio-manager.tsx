import { useState } from "react";
import Button from "@/shared/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/shared/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/shared/ui/tabs";
import { Settings } from "lucide-react";
import BrokerManager from "./components/broker-manager";
import AssetManager from "./components/asset-manager";
import HoldingManager from "./components/holding-manager";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/shared/infra/supabase-client";
import { QUERY_KEYS } from "@/shared/constants/query-keys";

export default function PortfolioManager() {
  const [isOpen, setIsOpen] = useState(false);

  // Fetch all raw data
  const { data: brokers = [] } = useQuery({
    queryKey: QUERY_KEYS.BROKERS,
    queryFn: async () => {
      const { data } = await supabase.from("brokers").select("*").order("name");
      return data || [];
    },
  });

  const { data: assets = [] } = useQuery({
    queryKey: QUERY_KEYS.ASSETS,
    queryFn: async () => {
      const { data } = await supabase
        .from("assets")
        .select("*")
        .order("symbol");
      return data || [];
    },
  });

  const { data: holdings = [] } = useQuery({
    queryKey: QUERY_KEYS.HOLDINGS,
    queryFn: async () => {
      const { data } = await supabase.from("holdings").select("*");
      return data || [];
    },
  });

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="gap-2">
          <Settings className="h-4 w-4" />
          Manage Portfolio
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto" aria-describedby={undefined}>
        <DialogHeader>
          <DialogTitle>Manage Portfolio</DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="assets" className="w-full mt-4">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="assets">Assets & Targets</TabsTrigger>
            <TabsTrigger value="brokers">Brokers</TabsTrigger>
            <TabsTrigger value="holdings">Holdings</TabsTrigger>
          </TabsList>

          <TabsContent value="assets" className="mt-4">
            <AssetManager assets={assets} />
          </TabsContent>

          <TabsContent value="brokers" className="mt-4">
            <BrokerManager brokers={brokers} />
          </TabsContent>

          <TabsContent value="holdings" className="mt-4">
            <HoldingManager
              holdings={holdings}
              assets={assets}
              brokers={brokers}
            />
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
