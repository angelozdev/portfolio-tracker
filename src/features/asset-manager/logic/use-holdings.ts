import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/shared/infra/supabase-client";
import type { Holding } from "@/types";
import { QUERY_KEYS } from "@/shared/constants/query-keys";

export function useHoldings() {
  const queryClient = useQueryClient();

  const createHolding = useMutation({
    mutationFn: async (newHolding: Pick<Holding, "asset_id" | "broker_id" | "shares">) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("User not found");

      const { data, error } = await supabase
        .from("holdings")
        .insert({ ...newHolding, user_id: user.id })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.PORTFOLIO });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.HOLDINGS });
    },
  });

  const updateHolding = useMutation({
    mutationFn: async (holding: Partial<Holding> & { id: string }) => {
      const { data, error } = await supabase
        .from("holdings")
        .update(holding)
        .eq("id", holding.id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.PORTFOLIO });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.HOLDINGS });
    },
  });

  const deleteHolding = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("holdings").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.PORTFOLIO });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.HOLDINGS });
    },
  });

  return {
    createHolding,
    updateHolding,
    deleteHolding,
  };
}
