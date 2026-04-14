"use client";

import React, { useState } from "react";
import { 
  Search, 
  ShoppingCart, 
  Plus, 
  Minus, 
  Check,
  Tag,
  Filter,
  Clock
} from "lucide-react";
import { Product } from "@/types";
import { Card, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { cn, formatCurrency } from "@/lib/utils";
import { useStore } from "@/lib/store-context";
import { getProducts } from "@/lib/actions/products";
import { Modal } from "@/components/ui/Modal";

export default function ShopPage() {
  const { cart, addToCart } = useStore();
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");

  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isQtyModalOpen, setIsQtyModalOpen] = useState(false);
  const [tempQuantity, setTempQuantity] = useState(1);

  React.useEffect(() => {
    fetchProducts();
  }, []);

  async function fetchProducts() {
    setIsLoading(true);
    try {
      const data = await getProducts();
      setProducts(data);
    } catch (err) {
      console.error("Error fetching products:", err);
    } finally {
      setIsLoading(false);
    }
  }

  const categories: string[] = ["All", ...Array.from(new Set(products.map(p => p.category).filter((c): c is string => c !== null)))];

  const filteredProducts = products.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = activeCategory === "All" || p.category === activeCategory;
    return matchesSearch && matchesCategory;
  });

  const openQuantityModal = (product: Product) => {
    setSelectedProduct(product);
    setTempQuantity(1);
    setIsQtyModalOpen(true);
  };

  const handleAddToCart = () => {
    if (selectedProduct) {
      addToCart(selectedProduct, tempQuantity);
      setIsQtyModalOpen(false);
      setSelectedProduct(null);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Pasar Warung</h1>
          <p className="text-slate-500">Belanja sembako segar harian dengan mudah.</p>
        </div>

        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input 
              type="text" 
              placeholder="Cari produk..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-navy transition-all bg-white"
            />
          </div>
          <div className="flex items-center gap-2 overflow-x-auto pb-2 sm:pb-0">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-4 py-2 rounded-xl text-sm font-medium transition-all whitespace-nowrap ${
                  activeCategory === cat 
                  ? "bg-navy text-white shadow-md shadow-navy/20" 
                  : "bg-white text-slate-600 hover:bg-slate-50 border border-slate-100"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filteredProducts.map((product: any) => {
          const cartItem = cart.find(item => item.id === product.id);
          const inCart = !!cartItem;

          return (
            <Card key={product.id} className="group overflow-hidden border-slate-100 hover:shadow-xl hover:shadow-navy/5 transition-all duration-300">
              <div className="aspect-square bg-slate-50 flex items-center justify-center relative overflow-hidden">
                <div className="text-slate-200 group-hover:scale-110 transition-transform duration-500 h-full w-full flex items-center justify-center">
                  {product.image ? (
                    <img src={product.image} alt={product.name} className="h-full w-full object-cover" />
                  ) : (
                    <ShoppingCart className="h-20 w-20 opacity-20" />
                  )}
                </div>
                <div className="absolute top-3 left-3 flex flex-col gap-2">
                  <span className="px-2 py-1 bg-white/90 backdrop-blur-sm text-[10px] font-bold text-navy uppercase rounded-lg border border-slate-100">
                    {product.unit}
                  </span>
                  {product.isPreOrder && (
                    <span className="px-2 py-1 bg-amber-500 text-[10px] font-bold text-white uppercase rounded-lg shadow-sm flex items-center gap-1">
                      <Clock className="h-2 w-2" />
                      PRE-ORDER
                    </span>
                  )}
                </div>
              </div>
              <CardContent className="p-5">
                <div className="flex items-start justify-between mb-2">
                  <h3 className="font-bold text-slate-900 group-hover:text-navy transition-colors">{product.name}</h3>
                </div>
                <p className="text-xs text-slate-500 line-clamp-2 mb-4 h-8">
                  {product.description}
                </p>
                <div className="flex items-center justify-between mt-auto">
                  <div className="flex flex-col">
                    <span className="text-xs text-slate-400 font-medium">Harga</span>
                    <span className="text-lg font-bold text-navy">{formatCurrency(product.price)}</span>
                  </div>
                  
                  <Button 
                    onClick={() => openQuantityModal(product)}
                    size="sm" 
                    className={cn(
                      "rounded-xl px-4 flex items-center gap-2 transition-all",
                      inCart ? "bg-emerald-50 text-emerald-600 border-emerald-100 hover:bg-emerald-100" : (
                        product.isPreOrder 
                        ? "bg-amber-500 hover:bg-amber-600 text-white border-none shadow-lg shadow-amber-500/20" 
                        : ""
                      )
                    )}
                    variant={inCart ? "outline" : "primary"}
                  >
                    {inCart ? (
                      <>
                        <Check className="h-4 w-4" />
                        {cartItem.cartQuantity} In Cart
                      </>
                    ) : product.isPreOrder ? (
                      <>
                        <Clock className="h-4 w-4" />
                        Pre-order
                      </>
                    ) : (
                      <>
                        <Plus className="h-4 w-4" />
                        Tambah
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {filteredProducts.length === 0 && (
        <div className="py-20 text-center">
          <div className="bg-slate-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
            <Search className="h-6 w-6 text-slate-300" />
          </div>
          <h2 className="text-xl font-bold text-slate-800">Produk tidak ditemukan</h2>
          <p className="text-slate-500">Coba kata kunci lain atau pilih kategori yang berbeda.</p>
        </div>
      )}

      {selectedProduct && (
        <Modal
          isOpen={isQtyModalOpen}
          onClose={() => setIsQtyModalOpen(false)}
          title="Tambah ke Keranjang"
          footer={
            <>
              <Button variant="outline" onClick={() => setIsQtyModalOpen(false)}>Batal</Button>
              <Button onClick={handleAddToCart} className="flex items-center gap-2">
                <ShoppingCart className="h-4 w-4" />
                Tambah ke Keranjang
              </Button>
            </>
          }
        >
          <div className="space-y-6">
            <div className="flex items-start gap-4 p-4 bg-slate-50 rounded-2xl border border-slate-100">
              <div className="h-16 w-16 rounded-xl bg-white border border-slate-200 flex items-center justify-center overflow-hidden shrink-0">
                {selectedProduct.image ? (
                  <img src={selectedProduct.image} alt={selectedProduct.name} className="h-full w-full object-cover" />
                ) : (
                  <ShoppingCart className="h-8 w-8 text-slate-200" />
                )}
              </div>
              <div className="flex flex-col">
                <span className="text-xs font-bold text-navy uppercase tracking-wider mb-0.5">{selectedProduct.category}</span>
                <h4 className="font-bold text-slate-900 leading-tight mb-1">{selectedProduct.name}</h4>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-bold text-slate-700">{formatCurrency(selectedProduct.price)}</span>
                  <span className="text-xs text-slate-400">/ {selectedProduct.unit}</span>
                </div>
              </div>
            </div>

            <div className="flex flex-col items-center justify-center py-4 space-y-4">
              <span className="text-sm font-semibold text-slate-500 uppercase tracking-widest">Tentukan Jumlah</span>
              <div className="flex items-center gap-8 bg-slate-50 p-2 rounded-2xl border border-slate-100">
                <button 
                  onClick={() => setTempQuantity(Math.max(1, tempQuantity - 1))}
                  className="h-12 w-12 flex items-center justify-center rounded-xl bg-white shadow-sm border border-slate-200 text-slate-600 hover:text-navy active:scale-95 transition-all"
                >
                  <Minus className="h-5 w-5" />
                </button>
                <div className="flex flex-col items-center min-w-[60px]">
                  <span className="text-3xl font-black text-navy">{tempQuantity}</span>
                  <span className="text-[10px] font-bold text-slate-400 uppercase">{selectedProduct.unit}</span>
                </div>
                <button 
                  onClick={() => setTempQuantity(tempQuantity + 1)}
                  className="h-12 w-12 flex items-center justify-center rounded-xl bg-white shadow-sm border border-slate-200 text-slate-600 hover:text-navy active:scale-95 transition-all"
                >
                  <Plus className="h-5 w-5" />
                </button>
              </div>
              
              <div className="w-full pt-4 border-t border-slate-100 flex justify-between items-center">
                <span className="text-sm font-medium text-slate-500">Estimasi Total</span>
                <span className="text-xl font-bold text-navy">{formatCurrency(selectedProduct.price * tempQuantity)}</span>
              </div>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
