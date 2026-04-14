"use client";

import React from "react";
import { useParams, useRouter } from "next/navigation";
import { 
  ChevronLeft, 
  Printer, 
  MapPin, 
  User, 
  Calendar,
  CreditCard,
  CheckCircle2,
  Clock,
  Package,
  Truck,
  Download
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/Table";
import { formatCurrency, formatDate } from "@/lib/utils";

import { getOrderById, updateOrderStatus } from "@/lib/actions/orders";
 import { generateInvoicePDF, generateSuratJalanPDF } from "@/lib/pdf-utils";


export default function OrderDetailPage() {
  const params = useParams();
  const router = useRouter();
  const orderId = params.id as string;

  const [order, setOrder] = React.useState<any>(null);
  const [isLoading, setIsLoading] = React.useState(true);

  React.useEffect(() => {
    fetchOrder();
  }, [orderId]);
 
  async function fetchOrder() {
    setIsLoading(true);
    const data = await getOrderById(orderId);
    setOrder(data);
    setIsLoading(false);
  }

  const [isUpdating, setIsUpdating] = React.useState(false);

  const handleUpdateStatus = async (newStatus: string) => {
    setIsUpdating(true);
    try {
      const res = await updateOrderStatus(orderId, newStatus as any);
      if (res.success) {
        await fetchOrder();
      } else {
        alert(res.error || "Failed to update status");
      }
    } catch (err) {
      console.error("Error updating status:", err);
    } finally {
      setIsUpdating(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-navy"></div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="text-center py-20">
        <h2 className="text-2xl font-bold text-slate-800">Order not found</h2>
        <Button onClick={() => router.back()} className="mt-4">Go Back</Button>
      </div>
    );
  }


  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="sm" onClick={() => router.back()} className="h-9 w-9 p-0 rounded-full">
            <ChevronLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-3">
              Order {order.id}
              <Badge status={order.status} className="text-sm px-3 py-1" />
            </h1>
            <div className="flex items-center gap-4 mt-1 text-sm text-slate-500">
              <span className="flex items-center gap-1"><Calendar className="h-3 w-3" /> {formatDate(order.created_at)}</span>
              <span className="flex items-center gap-1"><Clock className="h-3 w-3" /> 10:30 AM</span>
            </div>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {/* Status Specific Actions */}
          {(order.status === "PENDING" || order.status === "PREORDER") && (
            <Button 
              onClick={() => handleUpdateStatus("CHECKING")}
              isLoading={isUpdating}
              className="gap-2 bg-amber-500 hover:bg-amber-600 text-white"
            >
              <CheckCircle2 className="h-4 w-4" />
              Approve Order
            </Button>
          )}

          {order.status === "CHECKING" && (
            <Button 
              onClick={() => handleUpdateStatus("READY")}
              isLoading={isUpdating}
              className="gap-2 bg-emerald-500 hover:bg-emerald-600 text-white"
            >
              <Package className="h-4 w-4" />
              Mark as Ready
            </Button>
          )}

          {order.status === "READY" && (
            <Button 
              onClick={() => handleUpdateStatus("DELIVERED")}
              isLoading={isUpdating}
              className="gap-2 bg-navy hover:bg-navy-light text-white"
            >
              <Truck className="h-4 w-4" />
              Mark as Delivered
            </Button>
          )}

          <div className="h-8 w-[1px] bg-slate-200 mx-2 hidden sm:block" />
          
          <Button 
            variant="outline" 
            size="sm"
            className="gap-2 bg-white"
            onClick={() => generateSuratJalanPDF(order)}
          >
            <Printer className="h-4 w-4" />
            Print Surat Jalan
          </Button>
          <Button 
            variant="outline" 
            size="sm"
            className="gap-2 bg-white"
            onClick={() => generateInvoicePDF(order)}
          >
            <Download className="h-4 w-4" />
            Invoice
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          <Card>
            <CardHeader>
              <CardTitle>Order Items</CardTitle>
            </CardHeader>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Product</TableHead>
                  <TableHead className="text-center">Quantity</TableHead>
                  <TableHead>Unit Price</TableHead>
                  <TableHead className="text-right">Subtotal</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {order.items.map((item: any) => (
                  <TableRow key={item.id}>
                    <TableCell>
                      <div className="flex flex-col">
                        <span className="font-semibold text-slate-800">{item.product.name}</span>
                        <span className="text-xs text-slate-500">{item.product.unit}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-center font-medium">{item.quantity}</TableCell>
                    <TableCell>{formatCurrency(item.unit_price)}</TableCell>
                    <TableCell className="text-right font-bold text-slate-900">
                      {formatCurrency(item.subtotal)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            <div className="p-6 bg-slate-50/50 border-t border-slate-100">
              <div className="flex flex-col gap-2 w-full max-w-[240px] ml-auto">
                <div className="flex justify-between text-sm text-slate-500">
                  <span>Subtotal</span>
                  <span>{formatCurrency(order.total_amount)}</span>
                </div>
                <div className="flex justify-between text-sm text-slate-500">
                  <span>Tax (0%)</span>
                  <span>Rp 0</span>
                </div>
                <div className="flex justify-between text-lg font-bold text-slate-900 mt-2 pt-2 border-t border-slate-200">
                  <span>Total</span>
                  <span>{formatCurrency(order.total_amount)}</span>
                </div>
              </div>
            </div>
          </Card>

          <Card>
            <CardHeader>
                <CardTitle>Order Progress</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="relative flex justify-between items-center px-4 py-8">
                    <div className="absolute top-1/2 left-0 w-full h-1 bg-slate-100 -translate-y-1/2 z-0"></div>
                    <div 
                      className="absolute top-1/2 left-0 h-1 bg-navy -translate-y-1/2 z-0 transition-all duration-500"
                      style={{ 
                        width: order.status === "PENDING" || order.status === "PREORDER" ? "0%" : 
                               order.status === "CHECKING" ? "33%" : 
                               order.status === "READY" ? "66%" : "100%" 
                      }}
                    ></div>
                    
                    {[
                        { label: "Submitted", icon: Clock, active: true },
                        { label: "Checking", icon: Package, active: ["CHECKING", "READY", "DELIVERED"].includes(order.status) },
                        { label: "Ready", icon: Truck, active: ["READY", "DELIVERED"].includes(order.status) },
                        { label: "Delivered", icon: CheckCircle2, active: order.status === "DELIVERED" },
                    ].map((step, i) => (
                        <div key={i} className="relative z-10 flex flex-col items-center gap-2">
                            <div className={`p-2 rounded-full border-4 border-white shadow-sm transition-colors duration-500 ${step.active ? 'bg-navy text-white' : 'bg-slate-200 text-slate-400'}`}>
                                <step.icon className="h-4 w-4" />
                            </div>
                            <span className={`text-[10px] font-bold uppercase transition-colors duration-500 ${step.active ? 'text-navy' : 'text-slate-400'}`}>{step.label}</span>
                        </div>
                    ))}
                </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-8">
          <Card>
            <CardHeader>
              <CardTitle>Customer Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-full bg-navy/5 text-navy flex items-center justify-center font-bold text-xl">
                  {order.customer.name.substring(0, 1)}
                </div>
                <div>
                  <h4 className="font-bold text-slate-900">{order.customer.name}</h4>
                  <p className="text-xs text-slate-500">Customer since Jan 2026</p>
                </div>
              </div>
              <div className="space-y-4 pt-4 border-t border-slate-100">
                <div className="flex gap-3">
                  <User className="h-4 w-4 text-slate-400 shrink-0" />
                  <div className="flex flex-col gap-0.5">
                    <span className="text-[10px] uppercase tracking-wider font-bold text-slate-400">Contact</span>
                    <span className="text-sm text-slate-700">{order.customer.phone}</span>
                    <span className="text-xs text-slate-500">{order.customer.email}</span>
                  </div>
                </div>
                <div className="flex gap-3">
                  <MapPin className="h-4 w-4 text-slate-400 shrink-0" />
                  <div className="flex flex-col gap-0.5">
                    <span className="text-[10px] uppercase tracking-wider font-bold text-slate-400">Shipping Address</span>
                    <span className="text-sm text-slate-700">{order.customer.address}</span>
                  </div>
                </div>
                <div className="flex gap-3">
                  <CreditCard className="h-4 w-4 text-slate-400 shrink-0" />
                  <div className="flex flex-col gap-0.5">
                    <span className="text-[10px] uppercase tracking-wider font-bold text-slate-400">Payment Method</span>
                    <span className="text-sm text-slate-700 font-medium">Cash on Delivery</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-navy text-white border-none shadow-xl shadow-navy/20">
            <CardHeader>
                <CardTitle className="text-white">Admin Notes</CardTitle>
            </CardHeader>
            <CardContent>
                <p className="text-sm text-slate-300 leading-relaxed italic">
                  "Pelanggan minta pengiriman dilakukan sebelum jam 12 siang. Pastikan telur dibungkus aman."
                </p>
                <Button variant="outline" className="w-full mt-6 border-slate-700 text-slate-300 hover:bg-slate-800 hover:text-white">
                  Edit Notes
                </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
