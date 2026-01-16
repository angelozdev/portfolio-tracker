import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/shared/infra/supabase-client";
import type { Asset } from "@/types";
import { QUERY_KEYS } from "@/shared/constants/query-keys";

export function useAssets() {
  const queryClient = useQueryClient();

  const createAsset = useMutation({
    mutationFn: async (newAsset: Pick<Asset, "symbol" | "name" | "type" | "target_percentage">) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("User not found");

      const { data, error } = await supabase
        .from("assets")
        .insert({ ...newAsset, user_id: user.id })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.PORTFOLIO });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.ASSETS });
    },
  });

  const updateAsset = useMutation({
    mutationFn: async (asset: Partial<Asset> & { id: string }) => {
      const { data, error } = await supabase
        .from("assets")
        .update(asset)
        .eq("id", asset.id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.PORTFOLIO });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.ASSETS });
    },
  });

  const deleteAsset = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("assets").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.PORTFOLIO });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.ASSETS });
    },
  });

  return {
    createAsset,
    updateAsset,
    deleteAsset,
  };
}
