"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { 
  ChevronLeft, 
  MapPin, 
  Clock, 
  Package, 
  Truck, 
  CheckCircle2,
  Phone,
  MessageSquare,
  History,
  Info
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/Table";
import { formatCurrency, formatDate } from "@/lib/utils";
import { getOrderById } from "@/lib/actions/orders";

export default function CustomerOrderDetailPage() {
  const params = useParams();
  const router = useRouter();
  const orderId = params.id as string;

  const [order, setOrder] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchOrder() {
      setIsLoading(true);
      const data = await getOrderById(orderId);
      setOrder(data);
      setIsLoading(false);
    }
    fetchOrder();
  }, [orderId]);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-32 gap-4">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-navy border-t-transparent" />
        <p className="text-slate-500 font-medium animate-pulse">Memuat detail pesanan...</p>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="text-center py-20 px-4">
        <div className="bg-slate-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 text-slate-300">
            <History className="h-10 w-10" />
        </div>
        <h2 className="text-2xl font-bold text-slate-800">Pesanan tidak ditemukan</h2>
        <p className="text-slate-500 mt-2 mb-8">Maaf, kami tidak dapat menemukan informasi pesanan ini.</p>
        <Button onClick={() => router.push("/my-orders")} variant="outline">Kembali ke Riwayat</Button>
      </div>
    );
  }

  const steps = [
    { label: "Diajukan", icon: Clock, status: "PENDING" },
    { label: "Dicek Admin", icon: Package, status: "CHECKING" },
    { label: "Siap Kirim", icon: Truck, status: "READY" },
    { label: "Selesai", icon: CheckCircle2, status: "DELIVERED" }
  ];

  const currentStepIndex = steps.findIndex(s => s.status === order.status);
  // Special case for PREORDER: display it as a separate info, but mapping it to step 0
  const actualIndex = order.status === "PREORDER" ? 0 : currentStepIndex;

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 px-4 sm:px-0 pb-20">
      {/* Header Navigation */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" onClick={() => router.back()} className="rounded-full hover:bg-white shadow-sm h-10 w-10 p-0 border border-slate-100">
          <ChevronLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-xl font-bold text-slate-900">Detail Pesanan</h1>
          <p className="text-xs text-slate-500">ID: {order.id}</p>
        </div>
      </div>

      {/* Tracking Visualization */}
      <Card className="border-none shadow-xl shadow-navy/5 overflow-hidden">
        <CardHeader className="bg-navy text-white pb-10">
            <div className="flex items-center justify-between">
                <CardTitle className="text-white text-lg">Pelacakan Status</CardTitle>
                <Badge status={order.status} className="bg-white/20 text-white border-white/20 px-4 py-1.5" />
            </div>
        </CardHeader>
        <CardContent className="px-6 -mt-6">
            <div className="bg-white rounded-3xl p-6 shadow-xl shadow-navy/5 border border-slate-50">
                <div className="relative flex justify-between items-center px-2 py-4">
                    {/* Background line */}
                    <div className="absolute top-1/2 left-0 w-full h-1 bg-slate-100 -translate-y-1/2 z-0" />
                    {/* Active line */}
                    <div 
                        className="absolute top-1/2 left-0 h-1 bg-navy -translate-y-1/2 z-0 transition-all duration-700 ease-out"
                        style={{ width: `${(actualIndex / (steps.length - 1)) * 100}%` }}
                    />
                    
                    {steps.map((step, idx) => {
                        const isCompleted = idx <= actualIndex;
                        const isCurrent = idx === actualIndex;

                        return (
                            <div key={idx} className="relative z-10 flex flex-col items-center gap-3">
                                <div className={`h-11 w-11 rounded-full border-4 border-white shadow-md flex items-center justify-center transition-all duration-500 ${
                                    isCompleted ? "bg-navy text-white scale-110" : "bg-slate-100 text-slate-400"
                                }`}>
                                    <step.icon className={`h-5 w-5 ${isCurrent ? "animate-pulse" : ""}`} />
                                </div>
                                <span className={`text-[10px] sm:text-xs font-bold uppercase tracking-tight transition-colors ${
                                    isCompleted ? "text-navy" : "text-slate-400"
                                }`}>
                                    {step.label}
                                </span>
                            </div>
                        );
                    })}
                </div>
                
                {order.status === "PREORDER" && (
                    <div className="mt-6 p-4 bg-amber-50 rounded-2xl border border-amber-100 flex items-start gap-3">
                        <Info className="h-5 w-5 text-amber-600 shrink-0" />
                        <div className="space-y-1">
                            <p className="text-sm font-bold text-amber-800">Menunggu Stok (Pre-order)</p>
                            <p className="text-xs text-amber-600/80 leading-relaxed">
                                Pesanan Anda mencakup produk pre-order. Admin akan mulai mengepak pesanan segera setelah stok barang tiba di gudang.
                            </p>
                        </div>
                    </div>
                )}
            </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Main Order Info */}
        <div className="md:col-span-2 space-y-8">
          <Card className="border-slate-100 overflow-hidden">
            <CardHeader className="border-b border-slate-50 bg-slate-50/30">
              <CardTitle className="text-base">Informasi Produk</CardTitle>
            </CardHeader>
            <Table>
              <TableHeader>
                <TableRow className="bg-slate-50/50">
                  <TableHead className="font-bold text-slate-900">Produk</TableHead>
                  <TableHead className="text-center font-bold text-slate-900">Jumlah</TableHead>
                  <TableHead className="text-right font-bold text-slate-900">Harga</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {order.items.map((item: any) => (
                  <TableRow key={item.id}>
                    <TableCell>
                      <div className="flex flex-col">
                        <span className="font-bold text-slate-800">{item.product.name}</span>
                        <span className="text-xs text-slate-500">{item.product.unit || "Unit"}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-center font-medium text-slate-600">{item.quantity}x</TableCell>
                    <TableCell className="text-right font-bold text-slate-900">
                      {formatCurrency(item.subtotal)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            <CardContent className="p-6 bg-slate-50/30">
               <div className="flex flex-col gap-3 max-w-[280px] ml-auto">
                    <div className="flex justify-between text-sm text-slate-500">
                        <span>Total Belanja</span>
                        <span>{formatCurrency(order.total_amount)}</span>
                    </div>
                    <div className="flex justify-between text-sm text-slate-500">
                        <span>Biaya Pengiriman</span>
                        <span className="text-emerald-600 font-medium">Gratis (COD)</span>
                    </div>
                    <div className="h-px bg-slate-200 my-1" />
                    <div className="flex justify-between text-lg font-black text-navy">
                        <span>Total Bayar</span>
                        <span>{formatCurrency(order.total_amount)}</span>
                    </div>
               </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar Info */}
        <div className="space-y-8">
            <Card className="border-slate-100">
                <CardHeader className="pb-4">
                    <CardTitle className="text-base">Alamat Pengiriman</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="flex gap-4">
                        <MapPin className="h-5 w-5 text-slate-400 shrink-0" />
                        <div className="space-y-1">
                            <p className="text-sm font-bold text-slate-800">Rumah</p>
                            <p className="text-sm text-slate-600 leading-relaxed">
                                {order.customer.address}
                            </p>
                        </div>
                    </div>
                </CardContent>
            </Card>

            <Card className="border-none bg-gradient-to-br from-navy to-navy-light text-white shadow-xl shadow-navy/20">
                <CardContent className="p-6 space-y-6">
                    <div className="space-y-2">
                        <h4 className="font-bold text-lg">Butuh Bantuan?</h4>
                        <p className="text-white/70 text-sm">Jika ada kendala dengan pesanan ini, hubungi admin kami.</p>
                    </div>
                    <div className="space-y-2">
                        <Button className="w-full bg-white text-navy hover:bg-white/90 gap-2 border-none">
                            <MessageSquare className="h-4 w-4" />
                            Chat WhatsApp
                        </Button>
                        <Button variant="outline" className="w-full border-white/20 text-white hover:bg-white/10 gap-2">
                            <Phone className="h-4 w-4" />
                            Hubungi Admin
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </div>
      </div>
    </div>
  );
}
