"use client";

import React, { useState } from "react";
import { useStore } from "@/lib/store-context";
import { 
  Trash2, 
  ArrowRight, 
  ChevronLeft, 
  ShoppingBag,
  CreditCard,
  CheckCircle2,
  AlertCircle,
  Clock
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { formatCurrency } from "@/lib/utils";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Modal } from "@/components/ui/Modal";

export default function CartPage() {
  const { cart, removeFromCart, updateQuantity, cartTotal, checkout, clearCart } = useStore();
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const router = useRouter();

  const handleCheckout = async () => {
    setIsCheckingOut(true);
    const result = await checkout();
    setIsCheckingOut(false);
    
    if (result.success) {
      setIsSuccessModalOpen(true);
    } else {
      alert(result.error || "Checkout failed");
    }
  };

  const finishOrder = () => {
    setIsSuccessModalOpen(false);
    router.push("/my-orders");
  };

  if (cart.length === 0 && !isSuccessModalOpen) {
    return (
      <div className="flex flex-col items-center justify-center py-20 animate-in fade-in duration-500">
        <div className="bg-white p-8 rounded-full shadow-xl shadow-navy/5 mb-6 text-slate-200">
          <ShoppingBag className="h-16 w-16" />
        </div>
        <h2 className="text-2xl font-bold text-slate-800">Keranjang Belanja Kosong</h2>
        <p className="text-slate-500 mt-2">Daftar belanjaan Anda belum terisi.</p>
        <Link href="/shop" className="mt-8">
          <Button className="flex items-center gap-2">
            <ChevronLeft className="h-4 w-4" />
            Mulai Belanja
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Keranjang Checkout</h1>
          <p className="text-slate-500">Tinjau pesanan Anda sebelum pembayaran.</p>
        </div>
        <Link href="/shop">
          <Button variant="ghost" className="text-navy flex items-center gap-2">
            <ChevronLeft className="h-4 w-4" />
            Kembali Belanja
          </Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-4">
          {cart.map((item) => (
            <Card key={item.id} className="border-slate-100 group transition-all">
              <CardContent className="p-4 sm:p-6">
                <div className="flex gap-4 sm:gap-6">
                  <div className="h-20 w-20 sm:h-24 sm:w-24 bg-slate-50 rounded-xl flex items-center justify-center shrink-0 border border-slate-100 overflow-hidden">
                    {item.image ? (
                      <img src={item.image} alt={item.name} className="h-full w-full object-cover" />
                    ) : (
                      <ShoppingBag className="h-8 w-8 text-slate-200" />
                    )}
                  </div>
                  <div className="flex flex-1 flex-col">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-bold text-slate-900 text-lg">{item.name}</h3>
                        <p className="text-sm text-slate-500">{item.unit}</p>
                      </div>
                      <button 
                        onClick={() => removeFromCart(item.id)}
                        className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                      >
                        <Trash2 className="h-5 w-5" />
                      </button>
                    </div>
                    
                    <div className="flex justify-between items-end mt-auto pt-4">
                      <div className="flex items-center gap-3 bg-slate-50 p-1 rounded-xl border border-slate-100">
                         <button 
                          onClick={() => updateQuantity(item.id, item.cartQuantity - 1)}
                          className="h-8 w-8 flex items-center justify-center rounded-lg hover:bg-white hover:shadow-sm text-slate-600 transition-all font-bold"
                        >
                          -
                        </button>
                        <span className="w-8 text-center text-sm font-bold text-navy">{item.cartQuantity}</span>
                        <button 
                          onClick={() => updateQuantity(item.id, item.cartQuantity + 1)}
                          className="h-8 w-8 flex items-center justify-center rounded-lg hover:bg-white hover:shadow-sm text-slate-600 transition-all font-bold"
                        >
                          +
                        </button>
                      </div>
                      <div className="text-right">
                        <span className="text-sm text-slate-400 block">Subtotal</span>
                        <span className="text-lg font-bold text-navy">{formatCurrency(item.price * item.cartQuantity)}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="space-y-6">
          {cart.some(item => item.isPreOrder) && (
            <Card className="bg-amber-50 border-amber-200 border-dashed">
              <CardContent className="p-4 flex items-start gap-3">
                <Clock className="h-5 w-5 text-amber-600 mt-0.5 shrink-0" />
                <div className="space-y-1">
                  <p className="text-sm font-bold text-amber-900">Pesanan Pre-Order</p>
                  <p className="text-xs text-amber-700 leading-relaxed">
                    Keranjang Anda berisi produk Pre-Order. Pesanan ini akan diproses secara khusus dan dikirim setelah stok tersedia.
                  </p>
                </div>
              </CardContent>
            </Card>
          )}

          <Card className="border-navy/10 shadow-xl shadow-navy/5 overflow-hidden">
            <CardHeader className="bg-slate-50/50">
              <CardTitle className="text-lg">Ringkasan Pesanan</CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-4">
              <div className="flex justify-between text-slate-600">
                <span>Subtotal ({cart.length} item)</span>
                <span className="font-medium text-slate-900">{formatCurrency(cartTotal)}</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Pajak (0%)</span>
                <span>Rp 0</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Ongkos Kirim</span>
                <span className="text-emerald-600 font-medium">Gratis</span>
              </div>
              <div className="pt-4 border-t border-slate-100 flex justify-between">
                <span className="text-lg font-bold text-slate-900">Total</span>
                <span className="text-2xl font-bold text-navy">{formatCurrency(cartTotal)}</span>
              </div>
              <Button 
                onClick={handleCheckout}
                isLoading={isCheckingOut}
                className="w-full mt-4 h-12 rounded-xl text-lg flex items-center gap-2 group"
              >
                Checkout Pesanan
                <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </Button>
            </CardContent>
          </Card>

          <Card className="bg-navy/5 border-none shadow-none">
            <CardContent className="p-4 flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-navy mt-0.5 shrink-0" />
              <div className="space-y-1">
                <p className="text-sm font-bold text-navy">Informasi Pengiriman</p>
                <p className="text-xs text-navy/70 leading-relaxed">
                  Pesanan akan diproses dan dikirim dalam waktu 24 jam ke alamat terdaftar Anda (Pasar Baru No. 5).
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Processing Modal */}
      <Modal
        isOpen={isCheckingOut}
        onClose={() => {}} 
        title=""
      >
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <div className="h-16 w-16 mb-6 relative">
            <div className="absolute inset-0 rounded-full border-4 border-slate-100" />
            <div className="absolute inset-0 rounded-full border-4 border-navy border-t-transparent animate-spin" />
          </div>
          <h2 className="text-xl font-bold text-slate-900">Memproses Pesanan...</h2>
          <p className="text-sm text-slate-500 mt-2">
            Mohon tunggu sebentar, kami sedang menyiapkan pesanan Anda.
          </p>
        </div>
      </Modal>

      <Modal
        isOpen={isSuccessModalOpen}
        onClose={() => {}} // Force button click
        title=""
      >
         <div className="flex flex-col items-center justify-center py-8 text-center">
            <div className="h-20 w-20 bg-emerald-50 text-emerald-500 rounded-full flex items-center justify-center mb-6 animate-bounce">
              <CheckCircle2 className="h-12 w-12" />
            </div>
            <h2 className="text-2xl font-bold text-slate-900">Pesanan Berhasil!</h2>
            <p className="text-slate-500 mt-2 max-w-xs">
              Terima kasih! Pesanan Anda telah diterima dan akan segera diproses oleh admin.
            </p>
            <div className="mt-10 w-full">
              <Button onClick={finishOrder} className="w-full h-12 rounded-xl text-lg font-bold">
                Cek Order Sekarang
              </Button>
            </div>
          </div>
      </Modal>
    </div>
  );
}
