import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/shared/infra/supabase-client";
import { QUERY_KEYS } from "@/shared/constants/query-keys";

export function useBrokers() {
  const queryClient = useQueryClient();

  const createBroker = useMutation({
    mutationFn: async (name: string) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("User not found");

      const { data, error } = await supabase
        .from("brokers")
        .insert({ name, user_id: user.id })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.PORTFOLIO });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.BROKERS });
    },
  });

  const deleteBroker = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("brokers").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.PORTFOLIO });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.BROKERS });
    },
  });

  return {
    createBroker,
    deleteBroker,
  };
}
