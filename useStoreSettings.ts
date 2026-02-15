import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface StoreSettings {
  id: string;
  store_name: string;
  store_address: string;
  is_open: boolean;
  delivery_time: string;
  delivery_fee: number;
  whatsapp_number: string;
}

export const useStoreSettings = () => {
  return useQuery({
    queryKey: ["store-settings"],
    queryFn: async (): Promise<StoreSettings> => {
      const { data, error } = await supabase
        .from("store_settings")
        .select("*")
        .limit(1)
        .single();
      if (error) throw error;
      return data as StoreSettings;
    },
  });
};
