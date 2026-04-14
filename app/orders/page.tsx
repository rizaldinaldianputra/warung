"use client";

import React, { useState } from "react";
import {
  Order,
  OrderStatus
} from "@/types";
import {
  Search,
  Filter,
  Eye,
  ChevronRight,
  Download,
  MoreVertical
} from "lucide-react";
import { Card, CardHeader, CardTitle } from "@/components/ui/Card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/Table";
import { formatCurrency, formatDate } from "@/lib/utils";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import Link from "next/link";
import { useSearchParams } from "next/navigation";


import { getOrders, updateOrderStatus } from "@/lib/actions/orders";
 
 export default function OrdersPage() {
   const searchParams = useSearchParams();
   const initialStatus = searchParams.get("status");
   
   const [filter, setFilter] = useState<OrderStatus | "ALL">((initialStatus as any) || "ALL");
   const [orders, setOrders] = useState<any[]>([]);
   const [isLoading, setIsLoading] = useState(true);
 
   React.useEffect(() => {
     fetchOrders();
   }, [filter]);
 
   async function fetchOrders() {
     setIsLoading(true);
     try {
       const data = await getOrders(filter);
       setOrders(data);
     } catch (err) {
       console.error("Error fetching orders:", err);
     } finally {
       setIsLoading(false);
     }
   }
 


  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Orders Management</h1>
          <p className="text-slate-500">View and manage customer orders for your warung.</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" className="gap-2">
            <Download className="h-4 w-4" />
            Export CSV
          </Button>

        </div>
      </div>

      <Card>
        <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-0">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search by ID or customer..."
              className="w-full pl-10 pr-4 py-2 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-navy transition-all bg-slate-50 focus:bg-white"
            />
          </div>
          <div className="flex items-center gap-2 overflow-x-auto pb-4 sm:pb-0">
            {(["ALL", "PENDING", "CHECKING", "READY", "DELIVERED"] as const).map((s) => (
              <button
                key={s}
                onClick={() => setFilter(s)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${filter === s
                    ? "bg-slate-900 text-white shadow-sm"
                    : "bg-transparent text-slate-500 hover:bg-slate-50"
                  }`}
              >
                {s}
              </button>
            ))}
          </div>
        </CardHeader>

        <Table className="mt-4">
          <TableHeader>
            <TableRow>
              <TableHead>Order ID</TableHead>
              <TableHead>Customer</TableHead>
              <TableHead>Created At</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Total Amount</TableHead>
              <TableHead className="text-center">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
               <TableRow>
                <TableCell colSpan={6} className="py-20 text-center text-slate-400">
                  Loading orders...
                </TableCell>
              </TableRow>
            ) : orders.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="py-20 text-center text-slate-400">
                  No orders found.
                </TableCell>
              </TableRow>
            ) : (
              orders.map((order: any) => (
                <TableRow key={order.id} className="group">
                  <TableCell className="font-semibold text-navy">
                    {order.id.split("-")[0]}
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col">
                      <span className="font-medium text-slate-900">{order.customer?.name}</span>
                      <span className="text-xs text-slate-400">Regular Customer</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-slate-500">
                    {formatDate(order.created_at)}
                  </TableCell>
                  <TableCell>
                    <Badge status={order.status} />
                  </TableCell>
                  <TableCell className="font-semibold text-slate-900">
                    {formatCurrency(order.total_amount)}
                  </TableCell>
                   <TableCell className="text-center">
                    <div className="flex items-center justify-center gap-2">
                      <Link href={`/orders/${order.id}`}>
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0" title="View Details">
                          <Eye className="h-4 w-4" />
                        </Button>
                      </Link>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>

        <div className="p-4 border-t border-slate-50 flex items-center justify-between text-sm text-slate-500">
          <p>Showing {orders.length} records</p>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" disabled>Previous</Button>
            <Button variant="outline" size="sm" disabled>Next</Button>
          </div>
        </div>
      </Card>
    </div>
  );
}
