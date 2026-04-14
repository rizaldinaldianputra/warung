"use client";

import {
  ShoppingBag,
  Users,
  Package,
  TrendingUp,
  ArrowUpRight,
  Plus
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/Table";
import { formatCurrency, formatDate } from "@/lib/utils";
import { useState, useEffect } from "react";
import { useAuth } from "@/lib/auth-context";
import { getDashboardStats, getOrders, getTopSellingProducts } from "@/lib/actions/orders";

export default function DashboardPage() {
  const { user } = useAuth();
  const [stats, setStats] = useState([
    { label: "Total Orders", value: "0", change: "+0%", icon: ShoppingBag, color: "bg-navy" },
    { label: "Total Customers", value: "0", change: "+0%", icon: Users, color: "bg-navy-light" },
    { label: "Total Products", value: "0", change: "+0%", icon: Package, color: "bg-navy-light opacity-80" },
    { label: "Total Revenue", value: "Rp 0", change: "+0%", icon: TrendingUp, color: "bg-navy opacity-90" },
  ]);
  const [recentOrders, setRecentOrders] = useState<any[]>([]);
  const [topProducts, setTopProducts] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  async function fetchDashboardData() {
    setIsLoading(true);
    try {
      const [statsData, ordersData, topProductsData] = await Promise.all([
        getDashboardStats(),
        getOrders(),
        getTopSellingProducts(4)
      ]);

      setStats([
        { label: "Total Orders", value: statsData.ordersCount.toString(), change: "+12.5%", icon: ShoppingBag, color: "bg-navy" },
        { label: "Total Customers", value: statsData.customersCount.toString(), change: "+3.2%", icon: Users, color: "bg-navy-light" },
        { label: "Total Products", value: statsData.productsCount.toString(), change: "+5", icon: Package, color: "bg-navy-light opacity-80" },
        { label: "Total Revenue", value: formatCurrency(statsData.totalRevenue), change: "+8.4%", icon: TrendingUp, color: "bg-navy opacity-90" },
      ]);

      setRecentOrders(ordersData.slice(0, 5).map(o => ({
        id: o.id.split("-")[0],
        customerName: o.customer?.name || "Pelanggan",
        items: "Sembako",
        status: o.status,
        total: o.total_amount,
        date: formatDate(o.createdAt.toISOString())
      })));

      setTopProducts(topProductsData);
    } catch (err) {
      console.error("Error fetching dashboard data:", err);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Dashboard Overview</h1>
          <p className="text-slate-500">Welcome back to Warung CO Management System.</p>
        </div>

      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat: any) => (
          <Card key={stat.label} className="transition-all hover:shadow-md hover:border-navy/10 group">
            <CardContent className="flex items-center justify-between p-6">
              <div>
                <p className="text-sm font-medium text-slate-500">{stat.label}</p>
                <div className="mt-1 flex items-baseline gap-2">
                  <h3 className="text-2xl font-bold text-slate-900">{stat.value}</h3>
                  <span className="text-xs font-medium text-emerald-500 flex items-center">
                    <ArrowUpRight className="h-3 w-3" />
                    {stat.change}
                  </span>
                </div>
              </div>
              <div className={`${stat.color} p-3 rounded-xl text-white group-hover:scale-110 transition-transform`}>
                <stat.icon className="h-5 w-5" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Recent Orders</CardTitle>
            <Button variant="ghost" size="sm" className="text-navy">View All</Button>
          </CardHeader>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Order ID</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Items</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Total</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {recentOrders.map((order: any) => (
                <TableRow key={order.id}>
                  <TableCell className="font-medium text-navy">{order.id}</TableCell>
                  <TableCell>{order.customerName}</TableCell>
                  <TableCell className="max-w-[200px] truncate">{order.items}</TableCell>
                  <TableCell>
                    <Badge status={order.status} />
                  </TableCell>
                  <TableCell className="text-right font-semibold">
                    {formatCurrency(order.total)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Top Selling Products</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {topProducts.length > 0 ? (
              topProducts.map((product, i) => (
                <div key={i} className="flex items-center justify-between">
                  <div className="flex flex-col">
                    <span className="text-sm font-semibold text-slate-800">{product.name}</span>
                    <span className="text-xs text-slate-500">{product.sales} terjual</span>
                  </div>
                  <div className="text-right">
                    <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${product.stock < 10 ? 'bg-red-50 text-red-600' : 'bg-slate-50 text-slate-600'}`}>
                      Stok: {product.stock} {product.unit}
                    </span>
                  </div>
                </div>
              ))
            ) : (
                <p className="text-sm text-slate-400 py-10 text-center">Belum ada data penjualan.</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
