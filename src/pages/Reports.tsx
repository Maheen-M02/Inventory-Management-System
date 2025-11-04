import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useProducts } from "@/hooks/useProducts";
import { useStockMovements } from "@/hooks/useStockMovements";
import { Skeleton } from "@/components/ui/skeleton";
import { BarChart, DollarSign, TrendingUp, Package } from "lucide-react";
import { StatCard } from "@/components/StatCard";

export default function Reports() {
  const { data: products, isLoading: productsLoading } = useProducts();
  const { data: movements, isLoading: movementsLoading } = useStockMovements();

  if (productsLoading || movementsLoading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto p-6 space-y-6">
          <Skeleton className="h-12 w-64" />
          <div className="grid gap-4 md:grid-cols-3">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-32" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Calculate metrics
  const totalProducts = products?.length || 0;
  const totalCostValue = products?.reduce((sum, p) => sum + p.cost_price * p.quantity, 0) || 0;
  const totalSellingValue = products?.reduce((sum, p) => sum + p.selling_price * p.quantity, 0) || 0;
  const potentialProfit = totalSellingValue - totalCostValue;
  const profitMargin = totalCostValue > 0 ? ((potentialProfit / totalCostValue) * 100) : 0;

  // Calculate sales metrics from movements
  const salesMovements = movements?.filter((m: any) => m.type === "sale") || [];
  const totalSales = salesMovements.length;
  
  // Category breakdown
  const categoryStats = products?.reduce((acc: any, product) => {
    const category = product.category;
    if (!acc[category]) {
      acc[category] = {
        count: 0,
        totalValue: 0,
        totalProfit: 0,
      };
    }
    acc[category].count += 1;
    acc[category].totalValue += product.cost_price * product.quantity;
    acc[category].totalProfit += (product.selling_price - product.cost_price) * product.quantity;
    return acc;
  }, {});

  const categoryEntries = categoryStats ? Object.entries(categoryStats).sort((a: any, b: any) => b[1].totalValue - a[1].totalValue) : [];

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto p-6 space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Reports & Analytics</h1>
          <p className="text-muted-foreground">
            Comprehensive overview of your inventory performance
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <StatCard
            title="Total Stock Value"
            value={`$${totalCostValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
            icon={DollarSign}
            description="Current inventory cost value"
            variant="info"
          />
          <StatCard
            title="Potential Revenue"
            value={`$${totalSellingValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
            icon={TrendingUp}
            description="If all stock sold"
            variant="success"
          />
          <StatCard
            title="Profit Margin"
            value={`${profitMargin.toFixed(1)}%`}
            icon={BarChart}
            description={`$${potentialProfit.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} potential profit`}
            variant="success"
          />
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Category Breakdown</CardTitle>
              <CardDescription>Performance by product category</CardDescription>
            </CardHeader>
            <CardContent>
              {categoryEntries.length > 0 ? (
                <div className="space-y-4">
                  {categoryEntries.map(([category, stats]: [string, any]) => (
                    <div key={category} className="border-b pb-3 last:border-0 last:pb-0">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-medium">{category}</h4>
                        <span className="text-sm text-muted-foreground">{stats.count} products</span>
                      </div>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <p className="text-muted-foreground">Stock Value</p>
                          <p className="font-semibold">${stats.totalValue.toFixed(2)}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Potential Profit</p>
                          <p className="font-semibold text-success">${stats.totalProfit.toFixed(2)}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-center text-muted-foreground py-8">No categories yet</p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Stock Movement Summary</CardTitle>
              <CardDescription>Overview of inventory transactions</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-destructive/10 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-destructive/20 rounded-lg">
                      <TrendingUp className="h-4 w-4 text-destructive rotate-180" />
                    </div>
                    <div>
                      <p className="font-medium">Sales</p>
                      <p className="text-sm text-muted-foreground">Stock reductions</p>
                    </div>
                  </div>
                  <p className="text-2xl font-bold">{salesMovements.length}</p>
                </div>

                <div className="flex items-center justify-between p-3 bg-success/10 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-success/20 rounded-lg">
                      <TrendingUp className="h-4 w-4 text-success" />
                    </div>
                    <div>
                      <p className="font-medium">Restocks</p>
                      <p className="text-sm text-muted-foreground">Stock additions</p>
                    </div>
                  </div>
                  <p className="text-2xl font-bold">
                    {movements?.filter((m: any) => m.type === "restock").length || 0}
                  </p>
                </div>

                <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-muted-foreground/20 rounded-lg">
                      <Package className="h-4 w-4 text-muted-foreground" />
                    </div>
                    <div>
                      <p className="font-medium">Adjustments</p>
                      <p className="text-sm text-muted-foreground">Manual corrections</p>
                    </div>
                  </div>
                  <p className="text-2xl font-bold">
                    {movements?.filter((m: any) => m.type === "adjustment").length || 0}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Profit Analysis</CardTitle>
            <CardDescription>Product profitability breakdown</CardDescription>
          </CardHeader>
          <CardContent>
            {products && products.length > 0 ? (
              <div className="space-y-3">
                {products
                  .map(product => ({
                    ...product,
                    totalProfit: (product.selling_price - product.cost_price) * product.quantity,
                    margin: product.cost_price > 0 ? ((product.selling_price - product.cost_price) / product.cost_price * 100) : 0,
                  }))
                  .sort((a, b) => b.totalProfit - a.totalProfit)
                  .slice(0, 10)
                  .map((product) => (
                    <div key={product.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex-1">
                        <p className="font-medium">{product.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {product.category} • {product.quantity} units in stock
                        </p>
                      </div>
                      <div className="text-right space-y-1">
                        <p className="font-semibold text-success">
                          ${product.totalProfit.toFixed(2)}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {product.margin.toFixed(1)}% margin
                        </p>
                      </div>
                    </div>
                  ))}
              </div>
            ) : (
              <p className="text-center text-muted-foreground py-8">No products to analyze</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}