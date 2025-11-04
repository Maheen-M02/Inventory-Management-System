import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

export interface StockMovement {
  id: string;
  product_id: string;
  type: "sale" | "restock" | "adjustment";
  quantity_change: number;
  notes: string | null;
  created_at: string;
}

export function useStockMovements() {
  return useQuery({
    queryKey: ["stock_movements"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("stock_movements")
        .select("*, products(name)")
        .order("created_at", { ascending: false })
        .limit(50);

      if (error) throw error;
      return data;
    },
  });
}

export function useAddStockMovement() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (movement: {
      product_id: string;
      type: "sale" | "restock" | "adjustment";
      quantity_change: number;
      notes?: string;
    }) => {
      // First, get the current product quantity
      const { data: product, error: productError } = await supabase
        .from("products")
        .select("quantity")
        .eq("id", movement.product_id)
        .single();

      if (productError) throw productError;

      // Calculate new quantity based on movement type
      let newQuantity = product.quantity;
      if (movement.type === "sale") {
        newQuantity -= Math.abs(movement.quantity_change);
      } else if (movement.type === "restock") {
        newQuantity += Math.abs(movement.quantity_change);
      } else {
        newQuantity += movement.quantity_change; // adjustment can be + or -
      }

      // Prevent negative quantities
      if (newQuantity < 0) {
        throw new Error("Quantity cannot be negative");
      }

      // Update product quantity
      const { error: updateError } = await supabase
        .from("products")
        .update({ quantity: newQuantity })
        .eq("id", movement.product_id);

      if (updateError) throw updateError;

      // Record the movement
      const { data, error } = await supabase
        .from("stock_movements")
        .insert([movement])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["stock_movements"] });
      queryClient.invalidateQueries({ queryKey: ["products"] });
      toast({ title: "Stock movement recorded successfully" });
    },
    onError: (error) => {
      toast({ 
        title: "Error recording stock movement", 
        description: error.message,
        variant: "destructive" 
      });
    },
  });
}