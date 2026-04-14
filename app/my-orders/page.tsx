"use client";

import React from "react";
import { 
  Package, 
  Clock, 
  CheckCircle2, 
  ArrowRight,
  ShoppingBag,
  History,
  Info
} from "lucide-react";
import { cn, formatCurrency, formatDate } from "@/lib/utils";
import { Card, CardContent } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import Link from "next/link";
import { getMyOrders } from "@/lib/actions/orders";
import { useAuth } from "@/lib/auth-context";
import { useState, useEffect } from "react";

export default function MyOrdersPage() {
  const { user } = useAuth();
  const [orders, setOrders] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchMyOrders();
    }
  }, [user]);

  async function fetchMyOrders() {
    setIsLoading(true);
    try {
      const data = await getMyOrders(user.id);
      setOrders(data);
    } catch (err) {
      console.error("Error fetching my orders:", err);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Riwayat Pesanan</h1>
          <p className="text-slate-500">Pantau status belanjaan Anda di Niaga Pangan.</p>
        </div>
        <Link href="/shop">
          <Button className="gap-2">
            <ShoppingBag className="h-4 w-4" />
            Belanja Lagi
          </Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 gap-6">
        {isLoading ? (
          <div className="py-20 text-center bg-white rounded-3xl border border-slate-100">
             <div className="animate-pulse flex flex-col items-center">
                <div className="h-12 w-12 bg-slate-100 rounded-full mb-4"></div>
                <div className="h-4 w-48 bg-slate-100 rounded mb-2"></div>
                <div className="h-3 w-32 bg-slate-50 rounded"></div>
             </div>
          </div>
        ) : orders.length > 0 ? (
          orders.map((order: any) => (
            <Card key={order.id} className="border-slate-100 hover:border-navy/20 transition-all group">
              <CardContent className="p-0">
                <div className="flex flex-col md:flex-row">
                  {/* Status Sidebar */}
                  <div className="p-6 md:w-64 bg-slate-50/50 border-b md:border-b-0 md:border-r border-slate-100 flex flex-col justify-between gap-4">
                    <div className="space-y-1">
                      <span className="text-[10px] uppercase font-bold tracking-widest text-slate-400">Order ID</span>
                      <p className="font-bold text-navy text-lg">{order.id}</p>
                    </div>
                    <Badge status={order.status} className="w-fit px-3 py-1" />
                    <div className="space-y-1">
                      <span className="text-[10px] uppercase font-bold tracking-widest text-slate-400">Tanggal</span>
                      <p className="text-sm font-medium text-slate-600">{formatDate(order.created_at)}</p>
                    </div>
                  </div>

                  {/* Order Content */}
                  <div className="flex-1 p-6 flex flex-col justify-between gap-6">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-4">
                        <div className="h-12 w-12 rounded-xl bg-navy/5 flex items-center justify-center text-navy">
                          <Package className="h-6 w-6" />
                        </div>
                        <div>
                          <p className="font-bold text-slate-900">Pembelian Sembako Harian</p>
                          <p className="text-sm text-slate-500">Metode: Cash on Delivery</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-slate-400 font-medium">Total Pembayaran</p>
                        <p className="text-xl font-bold text-navy">{formatCurrency(order.total_amount)}</p>
                      </div>
                    </div>

                    {/* Simple Timeline/Tracker */}
                    <div className="bg-white border border-slate-100 rounded-2xl p-4 flex flex-wrap gap-4 items-center justify-between">
                        <div className="flex flex-col items-center gap-2">
                          <div className={cn(
                            "h-10 w-10 rounded-full flex items-center justify-center transition-colors",
                            order.status === "PREORDER" ? "bg-amber-500 text-white" : "bg-slate-100 text-slate-400"
                          )}>
                            <Clock className="h-5 w-5" />
                          </div>
                          <span className="text-[10px] font-bold text-slate-400 uppercase">Pre-Order</span>
                        </div>
                        <div className="flex-1 h-px bg-slate-100 mt-5"></div>
                        <div className="flex flex-col items-center gap-2">
                          <div className={cn(
                            "h-10 w-10 rounded-full flex items-center justify-center transition-colors shadow-sm",
                            order.status === "PENDING" ? "bg-navy text-white" : "bg-slate-100 text-slate-400"
                          )}>
                            <Clock className="h-5 w-5" />
                          </div>
                          <span className="text-[10px] font-bold text-slate-400 uppercase">Pending</span>
                        </div>
                        <div className="flex items-center gap-3">
                            <div className="h-8 w-8 rounded-full bg-emerald-50 text-emerald-500 flex items-center justify-center">
                                <CheckCircle2 className="h-5 w-5" />
                            </div>
                            <div className="flex flex-col">
                                <span className="text-xs font-bold text-slate-800">Status Terakhir</span>
                                <span className="text-xs text-slate-500">
                                  {order.status === "PREORDER" ? "Pre-order" :
                                  order.status === "PENDING" ? "Menunggu" : 
                                  order.status === "CHECKING" ? "Dicek" : 
                                  order.status === "READY" ? "Siap" : "Selesai"}
                                </span>
                            </div>
                        </div>
                        <Link href={`/my-orders/${order.id}`}>
                            <Button variant="ghost" size="sm" className="text-navy hover:bg-navy/5 gap-1 group">
                                Detail Pesanan
                                <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                            </Button>
                        </Link>
                    </div>
                    
                    {/* Pre-order special Badge inside card */}
                    {order.status === "PREORDER" && (
                      <div className="mt-4 p-3 bg-amber-50 rounded-xl border border-amber-100 flex items-center gap-2">
                        <Clock className="h-4 w-4 text-amber-600" />
                        <span className="text-xs font-medium text-amber-700">Produk ini akan segera diproses setelah stok tersedia.</span>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          <div className="py-20 text-center bg-white rounded-3xl border border-slate-100 border-dashed">
            <div className="bg-slate-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-300">
              <History className="h-8 w-8" />
            </div>
            <h2 className="text-xl font-bold text-slate-800">Belum ada riwayat pesanan</h2>
            <p className="text-slate-500 max-w-xs mx-auto mt-2">Anda belum melakukan pembelian apa pun. Mulai belanja di pasar warung!</p>
            <Link href="/shop" className="mt-8 inline-block">
              <Button>Mulai Belanja Sekarang</Button>
            </Link>
          </div>
        )}
      </div>

      <Card className="bg-navy border-none text-white overflow-hidden relative">
        <div className="absolute right-0 top-0 h-full w-1/3 bg-gradient-to-l from-white/10 to-transparent pointer-events-none" />
        <CardContent className="p-8 relative z-10">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-full bg-white/10 flex items-center justify-center">
                <Info className="h-6 w-6 text-white" />
              </div>
              <div className="space-y-1">
                <h3 className="text-lg font-bold">Butuh Bantuan Pesanan?</h3>
                <p className="text-white/70 text-sm">Hubungi admin warung jika ada kendala dengan pengiriman Anda.</p>
              </div>
            </div>
            <Button variant="outline" className="bg-white/10 border-white/20 text-white hover:bg-white/20">
              Hubungi WhatsApp
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
