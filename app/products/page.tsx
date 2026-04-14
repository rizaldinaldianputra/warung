"use client";

import React, { useState, useEffect } from "react";
import { 
  Package, 
  Search, 
  Plus, 
  Edit2, 
  Trash2, 
  AlertCircle,
  TrendingUp,
  Tag,
  Image as ImageIcon,
  Upload,
  X,
  Check
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/Table";
import { Button } from "@/components/ui/Button";
import { formatCurrency } from "@/lib/utils";
import { getProducts, createProduct, updateProduct, deleteProduct, uploadProductImage } from "@/lib/actions/products";
import { Modal } from "@/components/ui/Modal";

export default function ProductsPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [inlineEditingId, setInlineEditingId] = useState<string | null>(null);
  const [inlineData, setInlineData] = useState({ price: 0, stock: 0 });
  const [products, setProducts] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [newProduct, setNewProduct] = useState({
    name: "",
    sku: "",
    category: "Sembako",
    unit: "",
    stock: 0,
    price: 0,
    isPreOrder: false,
    image: ""
  });
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isDeleting, setIsDeleting] = useState<string | null>(null);

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

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      let imageUrl = newProduct.image;

      if (selectedFile) {
        setIsUploading(true);
        const formData = new FormData();
        formData.append("file", selectedFile);
        const uploadRes = await uploadProductImage(formData);
        if (!uploadRes.success) throw new Error(uploadRes.error);
        imageUrl = uploadRes.imageUrl || "";
      }

      const productData = { 
        ...newProduct, 
        image: imageUrl 
      };

      let res;
      if (editingId) {
        res = await updateProduct(editingId, productData);
      } else {
        res = await createProduct(productData);
      }

      if (res.error) throw new Error(res.error);
      
      handleCloseModal();
      fetchProducts();
    } catch (err) {
      console.error("Error saving product:", err);
    } finally {
      setIsUploading(false);
    }
  };

  const handleOpenEdit = (product: any) => {
    setEditingId(product.id);
    setNewProduct({
      name: product.name,
      sku: product.sku,
      category: product.category || "Sembako",
      unit: product.unit || "",
      stock: product.stock,
      price: product.price,
      isPreOrder: product.isPreOrder,
      image: product.image || ""
    });
    setImagePreview(product.image || null);
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this product?")) return;
    
    setIsDeleting(id);
    try {
      const res = await deleteProduct(id);
      if (res.error) throw new Error(res.error);
      fetchProducts();
    } catch (err) {
      console.error("Error deleting product:", err);
    } finally {
      setIsDeleting(null);
    }
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingId(null);
    setNewProduct({
      name: "",
      sku: "",
      category: "Sembako",
      unit: "",
      stock: 0,
      price: 0,
      isPreOrder: false,
      image: ""
    });
    setSelectedFile(null);
    setImagePreview(null);
  };

  const handleStartInlineEdit = (product: any) => {
    setInlineEditingId(product.id);
    setInlineData({ price: product.price, stock: product.stock });
  };

  const handleSaveInline = async (id: string) => {
    try {
      const res = await updateProduct(id, inlineData);
      if (res.error) throw new Error(res.error);
      setInlineEditingId(null);
      fetchProducts();
    } catch (err) {
      console.error("Error saving inline edit:", err);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Product Inventory</h1>
          <p className="text-slate-500">Manage your sembako stock and pricing.</p>
        </div>
        <Button onClick={() => setIsModalOpen(true)} className="gap-2">
          <Plus className="h-4 w-4" />
          Add Product
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
        <Card className="bg-navy text-white border-none shadow-xl shadow-navy/5">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white/70 text-sm font-medium">Unique Items</p>
                <h3 className="text-3xl font-bold mt-1">{products.length}</h3>
              </div>
              <div className="bg-white/10 p-3 rounded-xl">
                <Package className="h-6 w-6" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6 text-slate-900">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-500 text-sm font-medium">Low Stock Alerts</p>
                <h3 className="text-3xl font-bold mt-1 text-red-500">
                  {products.filter(p => p.stock < 10).length}
                </h3>
              </div>
              <div className="bg-red-50 p-3 rounded-xl text-red-500">
                <AlertCircle className="h-6 w-6" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6 text-slate-900">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-500 text-sm font-medium">Total Inventory Value</p>
                <h3 className="text-xl font-bold mt-1 text-emerald-500 tabular-nums">
                  {formatCurrency(products.reduce((acc, p) => acc + (p.price * p.stock), 0))}
                </h3>
              </div>
              <div className="bg-emerald-50 p-3 rounded-xl text-emerald-500">
                <TrendingUp className="h-6 w-6" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <CardTitle>Master Products</CardTitle>
          <div className="relative w-full max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input 
              type="text" 
              placeholder="Search product or SKU..." 
              className="w-full pl-10 pr-4 py-2 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-navy transition-all bg-slate-50 focus:bg-white"
            />
          </div>
        </CardHeader>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Product Name</TableHead>
              <TableHead>SKU</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Unit</TableHead>
              <TableHead>Price</TableHead>
              <TableHead>Stock</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
               <TableRow>
                <TableCell colSpan={7} className="py-20 text-center text-slate-400">
                  Loading inventory...
                </TableCell>
              </TableRow>
            ) : products.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="py-20 text-center text-slate-400">
                  No products found.
                </TableCell>
              </TableRow>
            ) : (
              products.map((product) => (
                <TableRow key={product.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-lg bg-slate-50 border border-slate-100 flex items-center justify-center overflow-hidden shrink-0">
                        {product.image ? (
                          <img src={product.image} alt={product.name} className="h-full w-full object-cover" />
                        ) : (
                          <Package className="h-5 w-5 text-slate-300" />
                        )}
                      </div>
                      <span className="font-semibold text-slate-800">{product.name}</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-xs font-mono text-slate-500">
                    {product.sku}
                  </TableCell>
                  <TableCell>
                    <span className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-600">
                      <Tag className="h-3 w-3" />
                      {product.category}
                    </span>
                  </TableCell>
                  <TableCell className="text-slate-600">{product.unit}</TableCell>
                  <TableCell className="font-medium text-slate-900">
                    {inlineEditingId === product.id ? (
                      <div className="flex flex-col gap-1">
                        <span className="text-[10px] text-slate-400 uppercase font-bold">Harga</span>
                        <input 
                          type="number" 
                          value={inlineData.price}
                          onChange={(e) => setInlineData({...inlineData, price: parseInt(e.target.value)})}
                          className="w-24 px-2 py-1 text-xs border border-slate-200 rounded-lg focus:ring-1 focus:ring-navy outline-none"
                        />
                      </div>
                    ) : (
                      formatCurrency(product.price)
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col gap-1">
                      <div className="flex items-center gap-2">
                        {inlineEditingId === product.id ? (
                          <div className="flex flex-col gap-1">
                             <span className="text-[10px] text-slate-400 uppercase font-bold">Stok</span>
                             <input 
                              type="number" 
                              value={inlineData.stock}
                              onChange={(e) => setInlineData({...inlineData, stock: parseInt(e.target.value)})}
                              className="w-20 px-2 py-1 text-xs border border-slate-200 rounded-lg focus:ring-1 focus:ring-navy outline-none"
                            />
                          </div>
                        ) : (
                          <>
                            <span className={product.stock < 10 ? "text-red-600 font-bold" : "text-slate-700 font-medium"}>
                              {product.stock}
                            </span>
                            {product.stock < 10 && <AlertCircle className="h-3 w-3 text-red-500" />}
                          </>
                        )}
                      </div>
                      {product.isPreOrder && !inlineEditingId && (
                        <span className="text-[10px] font-bold text-amber-600 uppercase">Pre-Order Item</span>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-2">
                      {inlineEditingId === product.id ? (
                        <>
                          <Button 
                            onClick={() => handleSaveInline(product.id)}
                            size="sm" 
                            className="h-8 w-8 p-0 bg-emerald-500 hover:bg-emerald-600 text-white"
                          >
                            <Check className="h-4 w-4" />
                          </Button>
                          <Button 
                            onClick={() => setInlineEditingId(null)}
                            variant="ghost" 
                            size="sm" 
                            className="h-8 w-8 p-0 text-slate-400"
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </>
                      ) : (
                        <>
                          <Button 
                            onClick={() => handleStartInlineEdit(product)}
                            variant="ghost" 
                            size="sm" 
                            className="h-8 w-8 p-0 text-slate-400 hover:text-emerald-500"
                            title="Set Harga & Stok Langsung"
                          >
                            <TrendingUp className="h-4 w-4" />
                          </Button>
                          <Button 
                            onClick={() => handleOpenEdit(product)}
                            variant="ghost" 
                            size="sm" 
                            className="h-8 w-8 p-0 text-slate-400 hover:text-navy"
                          >
                            <Edit2 className="h-4 w-4" />
                          </Button>
                          <Button 
                            onClick={() => handleDelete(product.id)}
                            isLoading={isDeleting === product.id}
                            variant="ghost" 
                            size="sm" 
                            className="h-8 w-8 p-0 text-slate-400 hover:text-red-600"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </Card>

      <Modal 
        isOpen={isModalOpen} 
        onClose={handleCloseModal} 
        title={editingId ? "Edit Product" : "Add New Product"}
        footer={
          <>
          <Button variant="outline" onClick={handleCloseModal}>Cancel</Button>
          <Button onClick={handleSaveProduct} isLoading={isUploading}>
            {editingId ? "Update Product" : "Save Product"}
          </Button>

          </>
        }
      >
        <form onSubmit={handleSaveProduct} className="space-y-4">
          <div className="flex flex-col items-center justify-center p-4 border-2 border-dashed border-slate-200 rounded-2xl bg-slate-50/50 hover:bg-slate-50 transition-colors group relative overflow-hidden">
            {imagePreview ? (
              <div className="relative w-full aspect-video rounded-xl overflow-hidden shadow-sm">
                <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                <button 
                  type="button"
                  onClick={() => { setSelectedFile(null); setImagePreview(null); }}
                  className="absolute top-2 right-2 p-1.5 bg-white/90 backdrop-blur shadow-sm rounded-lg text-slate-500 hover:text-red-500 transition-all"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            ) : (
              <label className="flex flex-col items-center justify-center cursor-pointer w-full py-4">
                <div className="bg-white p-3 rounded-xl shadow-sm mb-2 group-hover:scale-110 transition-transform">
                  <Upload className="h-6 w-6 text-navy" />
                </div>
                <span className="text-sm font-bold text-slate-700">Upload Product Image</span>
                <span className="text-xs text-slate-400 mt-1">PNG, JPG up to 5MB</span>
                <input type="file" className="hidden" accept="image/*" onChange={handleFileChange} />
              </label>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2 space-y-1.5">
              <label className="text-sm font-medium text-slate-700">Product Name</label>
              <input 
                type="text" 
                required
                value={newProduct.name}
                onChange={(e) => setNewProduct({...newProduct, name: e.target.value})}
                placeholder="e.g. Beras Pandan Wangi" 
                className="w-full px-4 py-2 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-navy"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-slate-700">SKU</label>
              <input 
                type="text" 
                required
                value={newProduct.sku}
                onChange={(e) => setNewProduct({...newProduct, sku: e.target.value})}
                placeholder="SKU-XXXX" 
                className="w-full px-4 py-2 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-navy"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-slate-700">Category</label>
              <select 
                value={newProduct.category}
                onChange={(e) => setNewProduct({...newProduct, category: e.target.value})}
                className="w-full px-4 py-2 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-navy"
              >
                <option>Sembako</option>
                <option>Minuman</option>
                <option>Snack</option>
                <option>Lainnya</option>
              </select>
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-slate-700">Unit</label>
              <input 
                type="text" 
                required
                value={newProduct.unit}
                onChange={(e) => setNewProduct({...newProduct, unit: e.target.value})}
                placeholder="kg, liter, dus..." 
                className="w-full px-4 py-2 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-navy"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-slate-700">Stock</label>
              <input 
                type="number" 
                required
                value={newProduct.stock}
                onChange={(e) => setNewProduct({...newProduct, stock: parseInt(e.target.value)})}
                placeholder="0" 
                className="w-full px-4 py-2 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-navy"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-slate-700">Price (IDR)</label>
              <input 
                type="number" 
                required
                value={newProduct.price}
                onChange={(e) => setNewProduct({...newProduct, price: parseInt(e.target.value)})}
                placeholder="0" 
                className="w-full px-4 py-2 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-navy"
              />
            </div>
            <div className="col-span-2 space-y-1.5 flex items-center gap-2 pt-2">
              <input 
                type="checkbox" 
                id="isPreOrder"
                checked={newProduct.isPreOrder}
                onChange={(e) => setNewProduct({...newProduct, isPreOrder: e.target.checked})}
                className="h-4 w-4 rounded border-slate-300 text-navy focus:ring-navy"
              />
              <label htmlFor="isPreOrder" className="text-sm font-medium text-slate-700 cursor-pointer">
                Mark as Pre-Order Product
              </label>
            </div>
          </div>
        </form>
      </Modal>
    </div>
  );
}
