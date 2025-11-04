import { Package, DollarSign, AlertTriangle, TrendingUp } from "lucide-react";
import { StatCard } from "@/components/StatCard";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useProducts } from "@/hooks/useProducts";
import { Skeleton } from "@/components/ui/skeleton";

export default function Dashboard() {
  const { data: products, isLoading } = useProducts();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto p-6 space-y-6">
          <Skeleton className="h-12 w-64" />
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {[1, 2, 3, 4].map((i) => (
              <Skeleton key={i} className="h-32" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  const totalProducts = products?.length || 0;
  const totalStockValue = products?.reduce(
    (sum, p) => sum + p.cost_price * p.quantity,
    0
  ) || 0;
  const lowStockItems = products?.filter(p => p.quantity <= p.reorder_level).length || 0;
  const totalPotentialProfit = products?.reduce(
    (sum, p) => sum + (p.selling_price - p.cost_price) * p.quantity,
    0
  ) || 0;

  const recentProducts = products?.slice(0, 5) || [];

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto p-6 space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">
            Overview of your inventory management system
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <StatCard
            title="Total Products"
            value={totalProducts}
            icon={Package}
            description="Active items in inventory"
            variant="info"
          />
          <StatCard
            title="Stock Value"
            value={`$${totalStockValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
            icon={DollarSign}
            description="Total inventory cost value"
            variant="success"
          />
          <StatCard
            title="Low Stock Items"
            value={lowStockItems}
            icon={AlertTriangle}
            description="Items below reorder level"
            variant={lowStockItems > 0 ? "warning" : "default"}
          />
          <StatCard
            title="Potential Profit"
            value={`$${totalPotentialProfit.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
            icon={TrendingUp}
            description="If all stock sold at selling price"
            variant="success"
          />
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Recent Updates</CardTitle>
              <CardDescription>Latest product updates in the system</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentProducts.map((product) => (
                  <div
                    key={product.id}
                    className="flex items-center justify-between border-b pb-3 last:border-0 last:pb-0"
                  >
                    <div className="space-y-1">
                      <p className="font-medium leading-none">{product.name}</p>
                      <p className="text-sm text-muted-foreground">{product.category}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant={product.quantity <= product.reorder_level ? "destructive" : "secondary"}>
                        Qty: {product.quantity}
                      </Badge>
                    </div>
                  </div>
                ))}
                {recentProducts.length === 0 && (
                  <p className="text-center text-muted-foreground py-4">
                    No products yet. Add your first product to get started.
                  </p>
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Alerts & Notifications</CardTitle>
              <CardDescription>Items requiring attention</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {products
                  ?.filter(p => p.quantity <= p.reorder_level)
                  .map((product) => (
                    <div
                      key={product.id}
                      className="flex items-start gap-3 p-3 bg-warning/10 rounded-lg border border-warning/20"
                    >
                      <AlertTriangle className="h-5 w-5 text-warning mt-0.5" />
                      <div className="flex-1 space-y-1">
                        <p className="font-medium text-sm">{product.name}</p>
                        <p className="text-xs text-muted-foreground">
                          Current stock: {product.quantity} | Reorder at: {product.reorder_level}
                        </p>
                      </div>
                    </div>
                  ))}
                {(!products || products.filter(p => p.quantity <= p.reorder_level).length === 0) && (
                  <div className="text-center py-8">
                    <p className="text-muted-foreground">All stock levels are healthy! 🎉</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>AI Insights</CardTitle>
            <CardDescription>Predictive analysis and recommendations (Coming Soon)</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8 text-muted-foreground">
              <p>AI-powered inventory predictions and recommendations will appear here.</p>
              <p className="text-sm mt-2">Features include demand forecasting, optimal reorder quantities, and trend analysis.</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}