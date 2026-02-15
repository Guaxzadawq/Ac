import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface Product {
  id: string;
  category_id: string;
  name: string;
  description: string;
  price: number;
  image_url: string;
  active: boolean;
  sort_order: number;
}

export interface Category {
  id: string;
  name: string;
  sort_order: number;
}

export interface Addon {
  id: string;
  name: string;
  price: number;
  active: boolean;
}

export const useCategories = () =>
  useQuery({
    queryKey: ["categories"],
    queryFn: async (): Promise<Category[]> => {
      const { data, error } = await supabase
        .from("categories")
        .select("*")
        .order("sort_order");
      if (error) throw error;
      return data as Category[];
    },
  });

export const useProducts = () =>
  useQuery({
    queryKey: ["products"],
    queryFn: async (): Promise<Product[]> => {
      const { data, error } = await supabase
        .from("products")
        .select("*")
        .eq("active", true)
        .order("sort_order");
      if (error) throw error;
      return data as Product[];
    },
  });

export const useAddons = () =>
  useQuery({
    queryKey: ["addons"],
    queryFn: async (): Promise<Addon[]> => {
      const { data, error } = await supabase
        .from("addons")
        .select("*")
        .eq("active", true)
        .order("name");
      if (error) throw error;
      return data as Addon[];
    },
  });
