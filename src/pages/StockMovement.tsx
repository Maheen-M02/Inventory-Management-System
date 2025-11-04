import { useState } from "react";
import { TrendingDown, TrendingUp, Package } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { StockMovementDialog } from "@/components/StockMovementDialog";
import { useProducts } from "@/hooks/useProducts";
import { useStockMovements, useAddStockMovement } from "@/hooks/useStockMovements";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";

export default function StockMovement() {
  const { data: products, isLoading: productsLoading } = useProducts();
  const { data: movements, isLoading: movementsLoading } = useStockMovements();
  const addMovement = useAddStockMovement();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedProductId, setSelectedProductId] = useState<string>("");

  const handleRecordMovement = () => {
    if (!selectedProductId) return;
    setDialogOpen(true);
  };

  const handleSave = (movement: any) => {
    addMovement.mutate(movement);
  };

  const selectedProduct = products?.find(p => p.id === selectedProductId);

  const getMovementIcon = (type: string) => {
    switch (type) {
      case "sale":
        return <TrendingDown className="h-4 w-4 text-destructive" />;
      case "restock":
        return <TrendingUp className="h-4 w-4 text-success" />;
      default:
        return <Package className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const getMovementBadge = (type: string) => {
    switch (type) {
      case "sale":
        return <Badge variant="destructive">Sale</Badge>;
      case "restock":
        return <Badge className="bg-success text-success-foreground">Restock</Badge>;
      default:
        return <Badge variant="secondary">Adjustment</Badge>;
    }
  };

  if (productsLoading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto p-6 space-y-6">
          <Skeleton className="h-12 w-64" />
          <Skeleton className="h-96" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto p-6 space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Stock Movement</h1>
          <p className="text-muted-foreground">
            Record sales, restocks, and adjustments
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Record New Movement</CardTitle>
            <CardDescription>
              Select a product and record a stock movement
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex gap-4">
              <div className="flex-1">
                <Select value={selectedProductId} onValueChange={setSelectedProductId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a product" />
                  </SelectTrigger>
                  <SelectContent>
                    {products?.map((product) => (
                      <SelectItem key={product.id} value={product.id}>
                        {product.name} - Current Stock: {product.quantity}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <Button onClick={handleRecordMovement} disabled={!selectedProductId}>
                Record Movement
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Movement History</CardTitle>
            <CardDescription>
              Recent stock movements across all products
            </CardDescription>
          </CardHeader>
          <CardContent>
            {movementsLoading ? (
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <Skeleton key={i} className="h-20" />
                ))}
              </div>
            ) : movements && movements.length > 0 ? (
              <div className="space-y-3">
                {movements.map((movement: any) => (
                  <div
                    key={movement.id}
                    className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent/50 transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      {getMovementIcon(movement.type)}
                      <div>
                        <p className="font-medium">{movement.products?.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {format(new Date(movement.created_at), "PPp")}
                        </p>
                        {movement.notes && (
                          <p className="text-sm text-muted-foreground mt-1">{movement.notes}</p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <p className="font-semibold">
                          {movement.type === "sale" ? "-" : movement.type === "restock" ? "+" : ""}
                          {Math.abs(movement.quantity_change)}
                        </p>
                      </div>
                      {getMovementBadge(movement.type)}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 text-muted-foreground">
                <Package className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No stock movements recorded yet</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {selectedProduct && (
        <StockMovementDialog
          open={dialogOpen}
          onOpenChange={setDialogOpen}
          productId={selectedProduct.id}
          productName={selectedProduct.name}
          onSave={handleSave}
        />
      )}
    </div>
  );
}